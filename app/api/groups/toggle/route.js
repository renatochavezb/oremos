import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongo";
import User from "@/models/User";

// POST /api/groups/toggle - Toggle join/leave status for a faith community
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para unirte a un grupo" }, { status: 401 });
    }

    await connectMongo();

    const body = await req.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: "groupId es requerido" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (!user.joinedGroups) {
      user.joinedGroups = [];
    }

    const index = user.joinedGroups.indexOf(groupId);
    let joined = false;

    if (index > -1) {
      // Leave group
      user.joinedGroups.splice(index, 1);
    } else {
      // Join group
      user.joinedGroups.push(groupId);
      joined = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      groupId,
      joined,
      joinedGroups: user.joinedGroups,
    });
  } catch (error) {
    console.error("Error in POST /api/groups/toggle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
