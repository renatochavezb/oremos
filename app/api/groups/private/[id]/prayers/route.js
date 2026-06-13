import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { getGroupIfMember } from "@/libs/privateGroups";
import PrayerRequest from "@/models/PrayerRequest";

// GET /api/groups/private/[id]/prayers - Prayers shared in a private group
export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const { id } = await params;
    const group = await getGroupIfMember(
      id,
      session.user.id,
      session.user.email
    );

    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado o sin acceso" }, { status: 404 });
    }

    const prayers = await PrayerRequest.find({ group: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      prayers: prayers.map((prayer) => ({
        ...prayer,
        id: prayer._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/groups/private/[id]/prayers:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
