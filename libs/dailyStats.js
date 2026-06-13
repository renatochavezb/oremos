import connectMongo from "@/libs/mongoose";
import DailyStats from "@/models/DailyStats";

export function getTodayKey(timeZone = "America/Mexico_City") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function incrementDailyLogins() {
  await connectMongo();
  const date = getTodayKey();

  const stats = await DailyStats.findOneAndUpdate(
    { date },
    { $inc: { loginCount: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return stats.loginCount;
}

export async function getTodayLoginCount() {
  await connectMongo();
  const date = getTodayKey();
  const stats = await DailyStats.findOne({ date }).lean();
  return stats?.loginCount || 0;
}
