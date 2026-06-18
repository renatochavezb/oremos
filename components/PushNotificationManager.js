"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const PROMPT_DISMISS_KEY = "oremos-push-prompt-dismissed";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function subscribeToPush(publicKey) {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });
}

const PushNotificationManager = () => {
  const { status } = useSession();
  const [showPrompt, setShowPrompt] = useState(false);
  const [activating, setActivating] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const canUsePush =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(canUsePush);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !supported) return;

    const dismissed = localStorage.getItem(PROMPT_DISMISS_KEY);
    if (dismissed === "true") return;

    if (Notification.permission === "default") {
      setShowPrompt(true);
    } else if (Notification.permission === "granted") {
      fetch("/api/push/vapid-public-key")
        .then((res) => res.json())
        .then(async (data) => {
          if (data.enabled && data.publicKey) {
            await subscribeToPush(data.publicKey);
          }
        })
        .catch(() => {});
    }
  }, [status, supported]);

  const handleEnable = useCallback(async () => {
    setActivating(true);

    try {
      const configRes = await fetch("/api/push/vapid-public-key");
      const config = await configRes.json();

      if (!config.enabled || !config.publicKey) {
        toast.error("Las notificaciones push aún no están configuradas en el servidor.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Necesitamos tu permiso para avisarte cuando alguien ore por ti.");
        return;
      }

      await subscribeToPush(config.publicKey);
      localStorage.setItem(PROMPT_DISMISS_KEY, "true");
      setShowPrompt(false);
      toast.success("Listo. Te avisaremos cuando alguien ore o encienda una vela por ti.");
    } catch (error) {
      console.error("Push subscription error:", error);
      toast.error("No se pudieron activar las notificaciones en este dispositivo.");
    } finally {
      setActivating(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISS_KEY, "true");
    setShowPrompt(false);
  };

  if (!showPrompt || status !== "authenticated") return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[90]">
      <div className="bg-base-100 border border-primary/15 rounded-2xl shadow-lg p-4 font-sans">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl mt-0.5">notifications_active</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-base-content mb-1">Recibe apoyo en tu celular</p>
            <p className="text-xs text-base-content/65 leading-relaxed mb-4">
              Te avisaremos cuando alguien ore por tu petición o encienda una vela por ti.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={activating}
                className="btn btn-primary btn-sm rounded-full font-bold flex-1"
              >
                {activating ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Activar avisos"
                )}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="btn btn-ghost btn-sm rounded-full"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;
