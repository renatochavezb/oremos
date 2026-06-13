import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import {
  formatGroupForClient,
} from "@/libs/privateGroups";
import PrivateGroup from "@/models/PrivateGroup";

// GET /api/groups/private - List groups the user belongs to
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const userId = session.user.id;
    const email = session.user.email?.toLowerCase();

    const groups = await PrivateGroup.find({
      $or: [{ "members.user": userId }, { "members.email": email }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      groups: groups.map((group) => formatGroupForClient(group, userId)),
    });
  } catch (error) {
    console.error("Error in GET /api/groups/private:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}

// POST /api/groups/private - Create a private group
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const body = await req.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";

    if (!name) {
      return NextResponse.json({ error: "El nombre del grupo es requerido" }, { status: 400 });
    }

    const ownerEmail = session.user.email?.toLowerCase();

    const group = await PrivateGroup.create({
      name,
      description,
      owner: session.user.id,
      members: [
        {
          user: session.user.id,
          email: ownerEmail,
          role: "owner",
        },
      ],
    });

    return NextResponse.json(
      { group: formatGroupForClient(group, session.user.id) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/groups/private:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
