import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { formatGroupForClient, isGroupMember } from "@/libs/privateGroups";
import PrivateGroup from "@/models/PrivateGroup";

// POST /api/groups/private/join - Join a group with invite code
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const body = await req.json();
    const inviteCode = body.inviteCode?.trim().toUpperCase();

    if (!inviteCode) {
      return NextResponse.json({ error: "Código de invitación requerido" }, { status: 400 });
    }

    const group = await PrivateGroup.findOne({ inviteCode });
    if (!group) {
      return NextResponse.json({ error: "Código de invitación inválido" }, { status: 404 });
    }

    const userId = session.user.id;
    const email = session.user.email?.toLowerCase();

    if (isGroupMember(group, userId, email)) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        group: formatGroupForClient(group, userId),
      });
    }

    group.members.push({
      user: userId,
      email,
      role: "member",
    });

    group.pendingInvites = group.pendingInvites.filter(
      (invite) => invite.email !== email
    );

    await group.save();

    return NextResponse.json({
      success: true,
      group: formatGroupForClient(group, userId),
    });
  } catch (error) {
    console.error("Error in POST /api/groups/private/join:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
