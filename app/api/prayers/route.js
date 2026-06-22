import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { mapPrayerCandleFields } from "@/libs/candles";
import { getGroupIfMember } from "@/libs/privateGroups";
import PrayerRequest from "@/models/PrayerRequest";
import User from "@/models/User";
import config from "@/config";

// GET /api/prayers - List public prayer requests with active candles prioritized
export async function GET(req) {
  try {
    await connectMongo();
    const session = await auth();
    
    let userPrayedIds = [];
    if (session?.user) {
      const user = await User.findById(session.user.id).select("prayedRequests").lean();
      if (user && user.prayedRequests) {
        userPrayedIds = user.prayedRequests.map(id => id.toString());
      }
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = { isPublic: true };
    if (category && category !== "Todas las Peticiones" && category !== "Todas") {
      query.category = category;
    }

    const prayers = await PrayerRequest.find(query)
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const userId = session?.user?.id;

    // Map to include active candle status, count and user intercession status
    const processedPrayers = prayers.map((p) => {
      const prayerIdStr = p._id.toString();
      const candleFields = mapPrayerCandleFields(p, userId, now);

      return {
        ...p,
        id: prayerIdStr,
        ...candleFields,
        hasUserPrayed: userPrayedIds.includes(prayerIdStr),
      };
    });

    // Sort: active candles first, then by createdAt desc
    processedPrayers.sort((a, b) => {
      if (a.hasActiveCandle && !b.hasActiveCandle) return -1;
      if (!a.hasActiveCandle && b.hasActiveCandle) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return NextResponse.json(processedPrayers);
  } catch (error) {
    console.error("Error in GET /api/prayers:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}

// POST /api/prayers - Create a new prayer request
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para publicar una petición" }, { status: 401 });
    }
    await connectMongo();

    const body = await req.json();
    const { text, category, isPublic, isAnonymous, groupId } = body;

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "El texto de la petición es requerido" }, { status: 400 });
    }

    let userId = null;
    let displayName = "Anónimo";

    if (session?.user) {
      userId = session.user.id;
      if (!isAnonymous) {
        displayName = session.user.name || `Usuario de ${config.appName}`;
      }
    }

    // Verify premium status if private request is selected
    if (!isPublic && (!session || !session.user)) {
      return NextResponse.json({ error: "Debes iniciar sesión para publicar peticiones privadas" }, { status: 401 });
    }

    let group = null;
    if (groupId) {
      group = await getGroupIfMember(
        groupId,
        session.user.id,
        session.user.email
      );

      if (!group) {
        return NextResponse.json(
          { error: "No tienes acceso a ese grupo privado" },
          { status: 403 }
        );
      }
    }

    const newPrayer = await PrayerRequest.create({
      user: userId,
      userName: displayName,
      category: category || "Otros",
      text: text,
      isPublic: group ? false : isPublic !== false,
      group: group?._id,
      prayersCount: 0,
      candlesCount: 0,
      candles: [],
      candlesExpiry: [],
    });

    return NextResponse.json(newPrayer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/prayers:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
