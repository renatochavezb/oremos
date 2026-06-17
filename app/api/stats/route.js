import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import { getDbErrorMessage } from "@/libs/dbError";
import { getTodayLoginCount, getTotalLoginCount } from "@/libs/dailyStats";
import PrayerRequest from "@/models/PrayerRequest";

// GET /api/stats - Global statistics for Oremos
export async function GET() {
  try {
    await connectMongo();

    const loginsToday = await getTodayLoginCount();
    const totalLogins = await getTotalLoginCount();

    const impactRes = await PrayerRequest.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalIntercessions: { $sum: "$prayersCount" },
          totalCandles: { $sum: "$candlesCount" },
          sharedGratitudes: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    {
                      $strLenCP: {
                        $trim: { input: { $ifNull: ["$thanksText", ""] } },
                      },
                    },
                    0,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const {
      totalRequests = 0,
      totalIntercessions = 0,
      totalCandles = 0,
      sharedGratitudes = 0,
    } = impactRes[0] || {};

    const communityImpact =
      totalRequests + totalIntercessions + totalCandles + sharedGratitudes;

    return NextResponse.json({
      loginsToday,
      totalLogins,
      communityImpact,
    });
  } catch (error) {
    console.error("Error in GET /api/stats:", error);
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 });
  }
}
