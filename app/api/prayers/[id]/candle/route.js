import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import PrayerRequest from "@/models/PrayerRequest";

// POST /api/prayers/[id]/candle - Mock checkout success for a digital candle (adds a 24-hour active candle)
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectMongo();

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Petición no encontrada" }, { status: 404 });
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (!prayer.candlesExpiry) {
      prayer.candlesExpiry = [];
    }

    prayer.candlesExpiry.push(expiryDate);
    prayer.candlesCount = (prayer.candlesCount || 0) + 1;
    await prayer.save();

    return NextResponse.json({
      success: true,
      candlesCount: prayer.candlesCount,
      expiryDate,
    });
  } catch (error) {
    console.error("Error in POST /api/prayers/[id]/candle:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
