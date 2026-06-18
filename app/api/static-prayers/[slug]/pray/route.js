import { NextResponse } from "next/server";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import StaticPrayerCount from "@/models/StaticPrayerCount";
import User from "@/models/User";

// POST /api/static-prayers/[slug]/pray - Increment count for static prayer
export async function POST(req, { params }) {
  try {
    const { slug } = await params;
    const session = await auth();

    await connectMongo();

    const stats = await StaticPrayerCount.findOneAndUpdate(
      { slug },
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (session?.user) {
      const user = await User.findById(session.user.id);
      if (user) {
        // Streak logic
        const now = new Date();
        if (user.lastPrayedAt) {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const lastPrayedDate = new Date(user.lastPrayedAt);
          const startOfLastPrayed = new Date(lastPrayedDate.getFullYear(), lastPrayedDate.getMonth(), lastPrayedDate.getDate()).getTime();
          
          const diffTime = startOfToday - startOfLastPrayed;
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            user.streak = 1;
          }
        } else {
          user.streak = 1;
        }

        user.lastPrayedAt = now;
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      prayersCount: stats.count,
    });
  } catch (error) {
    console.error("Error in POST /api/static-prayers/[slug]/pray:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
