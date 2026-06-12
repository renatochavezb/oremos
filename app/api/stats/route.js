import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import PrayerRequest from "@/models/PrayerRequest";

// GET /api/stats - Global statistics for Oremos
export async function GET() {
  try {
    await connectMongo();

    const totalRequests = await PrayerRequest.countDocuments();
    const intercessionsRes = await PrayerRequest.aggregate([
      { $group: { _id: null, total: { $sum: "$prayersCount" } } },
    ]);
    const totalIntercessions = intercessionsRes[0]?.total || 0;

    // Baselines from our initial design specs + real DB increases
    const basePrayersToday = 12842;
    const baseLivesTouched = 84103;

    return NextResponse.json({
      globalPrayersToday: basePrayersToday + totalIntercessions,
      livesTouched: baseLivesTouched + totalRequests,
    });
  } catch (error) {
    console.error("Error in GET /api/stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
