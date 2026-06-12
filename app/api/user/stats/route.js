import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import PrayerRequest from "@/models/PrayerRequest";

// GET /api/user/stats - Fetch user streak, joined prayers, and active chains
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Fetch details of prayers this user has joined
    const joinedPrayers = await PrayerRequest.find({
      _id: { $in: user.prayedRequests || [] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch active chains (prayers created by this user)
    const activeChains = await PrayerRequest.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Process lists to include candle state indicators
    const now = new Date();
    const mapCandleState = (p) => {
      const activeCandles = p.candlesExpiry
        ? p.candlesExpiry.filter((expiry) => new Date(expiry) > now)
        : [];
      return {
        ...p,
        id: p._id.toString(),
        activeCandlesCount: activeCandles.length,
        hasActiveCandle: activeCandles.length > 0,
      };
    };

    return NextResponse.json({
      streak: user.streak || 0,
      joinedCount: user.prayedRequests?.length || 0,
      lastPrayedAt: user.lastPrayedAt || null,
      joinedGroups: user.joinedGroups || [],
      joinedPrayers: joinedPrayers.map(mapCandleState),
      activeChains: activeChains.map(mapCandleState),
    });
  } catch (error) {
    console.error("Error in GET /api/user/stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
