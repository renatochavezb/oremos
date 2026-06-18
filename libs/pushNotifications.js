import webpush from "web-push";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import PushSubscription from "@/models/PushSubscription";

const PRAYER_MILESTONES = [1, 5, 10, 25, 50, 100];

let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || `mailto:${config.resend?.supportEmail || "hola@oremos.net"}`;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export function isPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

function getAppBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  return `https://${config.domainName}`;
}

async function sendPushToUser(userId, payload) {
  if (!configureVapid()) return { sent: 0, skipped: true };

  await connectMongo();

  const subscriptions = await PushSubscription.find({ user: userId });
  if (!subscriptions.length) return { sent: 0 };

  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
        } else {
          console.error("Web push error:", error.message);
        }
      }
    })
  );

  return { sent };
}

function shouldNotifyAmen(prayersCount) {
  return PRAYER_MILESTONES.includes(prayersCount);
}

function getAmenMessage(prayersCount) {
  if (prayersCount === 1) {
    return {
      title: "Alguien está orando por ti",
      body: "Una persona de la comunidad acaba de unirse en oración por tu petición. No estás solo.",
    };
  }

  return {
    title: `${prayersCount} personas oran por ti`,
    body: `Tu petición ya tiene ${prayersCount} oraciones. La comunidad camina contigo.`,
  };
}

export async function notifyPrayerOwnerOfAmen({ ownerId, actorId, prayerId, prayersCount }) {
  if (!ownerId || ownerId === actorId) return;
  if (!shouldNotifyAmen(prayersCount)) return;

  const { title, body } = getAmenMessage(prayersCount);
  const url = `${getAppBaseUrl()}/muro`;

  return sendPushToUser(ownerId, {
    title,
    body,
    url,
    tag: `prayer-amen-${prayerId}-${prayersCount}`,
    type: "amen",
    prayerId,
  });
}

export async function notifyPrayerOwnerOfCandle({ ownerId, actorId, prayerId }) {
  if (!ownerId || ownerId === actorId) return;

  const url = `${getAppBaseUrl()}/muro`;

  return sendPushToUser(ownerId, {
    title: "Una vela fue encendida por ti",
    body: "Alguien de la comunidad encendió una vela por tu petición. Brillará 24 horas en el muro.",
    url,
    tag: `prayer-candle-${prayerId}`,
    type: "candle",
    prayerId,
  });
}
