import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongo";
import PrayerRequest from "@/models/PrayerRequest";

// POST /api/prayers/[id]/thanks - Submit a gratitude update for a prayer request
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para dar las gracias" }, { status: 401 });
    }

    await connectMongo();

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Petición no encontrada" }, { status: 404 });
    }

    // Verify ownership
    if (!prayer.user || prayer.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para actualizar esta petición" }, { status: 403 });
    }

    const body = await req.json();
    const { thanksText } = body;

    if (!thanksText || thanksText.trim() === "") {
      return NextResponse.json({ error: "El texto de agradecimiento es requerido" }, { status: 400 });
    }

    prayer.thanksText = thanksText;
    await prayer.save();

    return NextResponse.json({ success: true, thanksText: prayer.thanksText });
  } catch (error) {
    console.error("Error in POST /api/prayers/[id]/thanks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
