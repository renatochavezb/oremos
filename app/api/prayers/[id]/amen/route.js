import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import { canAccessPrivateWall } from "@/libs/roles";
import PrayerRequest from "@/models/PrayerRequest";
import User from "@/models/User";

// POST /api/prayers/[id]/amen - Register a prayer click & update user streak
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para unirte en oración" }, { status: 401 });
    }

    await connectMongo();

    const prayer = await PrayerRequest.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Petición no encontrada" }, { status: 404 });
    }

    if (!prayer.isPublic && !canAccessPrivateWall(session.user.role)) {
      return NextResponse.json(
        { error: "Esta petición es confidencial y solo puede ser atendida por el equipo de intercesión" },
        { status: 403 }
      );
    }

    if (session?.user) {
      const user = await User.findById(session.user.id);
      if (user) {
        // Prevent duplicate prayers for the same request
        if (user.prayedRequests.includes(prayer._id)) {
          return NextResponse.json({ error: "Ya te has unido en oración para esta petición" }, { status: 400 });
        }

        user.prayedRequests.push(prayer._id);

        // Streak logic
        const now = new Date();
        if (user.lastPrayedAt) {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const lastPrayedDate = new Date(user.lastPrayedAt);
          const startOfLastPrayed = new Date(lastPrayedDate.getFullYear(), lastPrayedDate.getMonth(), lastPrayedDate.getDate()).getTime();
          
          const diffTime = startOfToday - startOfLastPrayed;
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day: increment streak
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            // Missed a day: reset streak to 1
            user.streak = 1;
          }
          // If diffDays === 0, they already prayed today, streak remains unchanged
        } else {
          // First time praying
          user.streak = 1;
        }

        user.lastPrayedAt = now;
        await user.save();
      }
    }

    // Increment request intercession count
    prayer.prayersCount = (prayer.prayersCount || 0) + 1;
    await prayer.save();

    return NextResponse.json({
      success: true,
      prayersCount: prayer.prayersCount,
      streak: session?.user ? (await User.findById(session.user.id)).streak : 0,
    });
  } catch (error) {
    console.error("Error in POST /api/prayers/[id]/amen:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
