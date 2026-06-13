import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import {
  getCandleExpiryDate,
  getPrayerOwnerId,
  hasUserActiveCandle,
  mapPrayerCandleFields,
} from "@/libs/candles";
import PrayerRequest from "@/models/PrayerRequest";

// POST /api/prayers/[id]/candle - Light a 24-hour candle on someone else's prayer
export async function POST(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para encender una vela" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectMongo();

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Petición no encontrada" }, { status: 404 });
    }

    if (!prayer.isPublic) {
      return NextResponse.json(
        { error: "Solo puedes encender velas en peticiones públicas del muro" },
        { status: 403 }
      );
    }

    const ownerId = getPrayerOwnerId(prayer);
    if (ownerId && ownerId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes encender una vela en tu propia petición" },
        { status: 400 }
      );
    }

    if (hasUserActiveCandle(prayer, session.user.id)) {
      return NextResponse.json(
        { error: "Ya encendiste una vela en esta petición. Podrás encender otra cuando expire." },
        { status: 400 }
      );
    }

    const expiryDate = getCandleExpiryDate();

    if (!prayer.candles) {
      prayer.candles = [];
    }

    prayer.candles.push({
      user: session.user.id,
      expiresAt: expiryDate,
    });
    prayer.candlesCount = (prayer.candlesCount || 0) + 1;
    await prayer.save();

    const candleFields = mapPrayerCandleFields(prayer, session.user.id);

    return NextResponse.json({
      success: true,
      candlesCount: prayer.candlesCount,
      expiryDate,
      ...candleFields,
    });
  } catch (error) {
    console.error("Error in POST /api/prayers/[id]/candle:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
