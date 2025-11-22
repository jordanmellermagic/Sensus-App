self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Sensus Alert";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-96.png",
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
