import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import CommunityPrayer from "@/models/CommunityPrayer";

// DELETE /api/community-prayers/[id] - Delete a community prayer
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para realizar esta acción" }, { status: 401 });
    }

    await connectMongo();

    const prayer = await CommunityPrayer.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Oración no encontrada" }, { status: 404 });
    }

    // Permission check: creator or admin
    const isCreator = prayer.user && prayer.user.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta oración" },
        { status: 403 }
      );
    }

    await CommunityPrayer.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Oración eliminada con éxito" });
  } catch (error) {
    console.error("Error in DELETE /api/community-prayers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
