import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import PushSubscription from "@/models/PushSubscription";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });
    }

    await connectMongo();

    await PushSubscription.deleteOne({
      user: session.user.id,
      endpoint,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/push/unsubscribe:", error);
    return NextResponse.json({ error: "No se pudo eliminar la suscripción" }, { status: 500 });
  }
}
