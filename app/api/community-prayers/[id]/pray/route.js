import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import CommunityPrayer from "@/models/CommunityPrayer";
import User from "@/models/User";

// POST /api/community-prayers/[id]/pray - Register a prayer click
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    await connectMongo();

    const prayer = await CommunityPrayer.findById(id);
    if (!prayer) {
      return NextResponse.json({ error: "Oración no encontrada" }, { status: 404 });
    }

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

    prayer.prayersCount = (prayer.prayersCount || 0) + 1;
    await prayer.save();

    revalidatePath("/oraciones");
    revalidatePath(`/oraciones/${prayer.slug}`);

    return NextResponse.json({
      success: true,
      prayersCount: prayer.prayersCount,
    });
  } catch (error) {
    console.error("Error in POST /api/community-prayers/[id]/pray:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
