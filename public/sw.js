self.addEventListener("push", (event) => {
  let payload = {
    title: "Oremos",
    body: "Tienes una nueva actualización en tu petición.",
    url: "/muro",
    tag: "oremos-push",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // Keep defaults if payload is invalid.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/brand/oremos-icon-app.png",
      badge: "/brand/oremos-favicon-48.png",
      tag: payload.tag || "oremos-push",
      data: { url: payload.url || "/muro" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.url || "/muro";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
