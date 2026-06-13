import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { formatGroupForClient, getGroupIfMember } from "@/libs/privateGroups";
import PrivateGroup from "@/models/PrivateGroup";

// GET /api/groups/private/[id] - Group details for members
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

    return NextResponse.json({
      group: formatGroupForClient(group, session.user.id),
    });
  } catch (error) {
    console.error("Error in GET /api/groups/private/[id]:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}

// DELETE /api/groups/private/[id] - Delete group (owner only)
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    await connectMongo();

    const { id } = await params;
    const group = await PrivateGroup.findById(id);

    if (!group) {
      return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
    }

    if (group.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Solo el creador puede eliminar el grupo" },
        { status: 403 }
      );
    }

    await PrivateGroup.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/groups/private/[id]:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
