// Sentinel Safety placeholder service worker.
// Real offline/PWA behavior will be added later.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
