import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { canAccessPrivateWall } from "@/libs/roles";
import PrayerRequest from "@/models/PrayerRequest";
import User from "@/models/User";

// GET /api/prayers/private - List confidential prayer requests for the intercession team
export async function GET(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    if (!canAccessPrivateWall(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes acceso al muro privado de intercesión" },
        { status: 403 }
      );
    }

    await connectMongo();

    let userPrayedIds = [];
    const user = await User.findById(session.user.id).select("prayedRequests").lean();
    if (user?.prayedRequests) {
      userPrayedIds = user.prayedRequests.map((id) => id.toString());
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = { isPublic: false };
    if (category && category !== "Todas las Peticiones" && category !== "Todas") {
      query.category = category;
    }

    const prayers = await PrayerRequest.find(query)
      .populate("user", "name email image")
      .sort({ createdAt: -1 })
      .lean();

    const processedPrayers = prayers.map((p) => {
      const prayerIdStr = p._id.toString();
      return {
        ...p,
        id: prayerIdStr,
        isPublic: false,
        hasUserPrayed: userPrayedIds.includes(prayerIdStr),
      };
    });

    return NextResponse.json(processedPrayers);
  } catch (error) {
    console.error("Error in GET /api/prayers/private:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
