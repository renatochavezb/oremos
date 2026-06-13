import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import {
  isGroupOwner,
  parseInviteEmails,
} from "@/libs/privateGroups";
import PrivateGroup from "@/models/PrivateGroup";
import User from "@/models/User";

// POST /api/groups/private/invite - Invite contacts by email
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const body = await req.json();
    const { groupId, emails: emailsRaw } = body;

    if (!groupId) {
      return NextResponse.json({ error: "groupId es requerido" }, { status: 400 });
    }

    const emails = parseInviteEmails(emailsRaw);
    if (!emails.length) {
      return NextResponse.json(
        { error: "Agrega al menos un correo válido" },
        { status: 400 }
      );
    }

    const group = await PrivateGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    if (!isGroupOwner(group, session.user.id)) {
      return NextResponse.json(
        { error: "Solo el creador del grupo puede invitar contactos" },
        { status: 403 }
      );
    }

    const ownerEmail = session.user.email?.toLowerCase();
    let added = 0;
    let pending = 0;
    let skipped = 0;

    for (const email of emails) {
      if (email === ownerEmail) {
        skipped++;
        continue;
      }

      const alreadyMember = group.members.some((member) => member.email === email);
      if (alreadyMember) {
        skipped++;
        continue;
      }

      const existingUser = await User.findOne({ email }).select("_id email").lean();

      if (existingUser) {
        group.members.push({
          user: existingUser._id,
          email,
          role: "member",
        });
        group.pendingInvites = group.pendingInvites.filter(
          (invite) => invite.email !== email
        );
        added++;
        continue;
      }

      const alreadyPending = group.pendingInvites.some(
        (invite) => invite.email === email
      );

      if (alreadyPending) {
        skipped++;
        continue;
      }

      group.pendingInvites.push({ email });
      pending++;
    }

    await group.save();

    return NextResponse.json({
      success: true,
      added,
      pending,
      skipped,
      inviteCode: group.inviteCode,
    });
  } catch (error) {
    console.error("Error in POST /api/groups/private/invite:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
