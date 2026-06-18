import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/libs/pushNotifications";

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ enabled: false, publicKey: null });
  }

  return NextResponse.json({
    enabled: true,
    publicKey: getVapidPublicKey(),
  });
}
