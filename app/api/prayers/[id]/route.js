import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import PrayerRequest from "@/models/PrayerRequest";

// DELETE /api/prayers/[id] - Delete a prayer request
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para eliminar una petición" }, { status: 401 });
    }

    await connectMongo();

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Petición no encontrada" }, { status: 404 });
    }

    // Verify ownership
    if (!prayer.user || prayer.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta petición" }, { status: 403 });
    }

    await PrayerRequest.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/prayers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
