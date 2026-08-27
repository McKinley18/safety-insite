/*
 * Safety InSite offline application shell.
 *
 * Scope: make an already-used InSite session able to OPEN while the device has no connection, so
 * durable offline field capture is reachable after a refresh or an app restart. Nothing more.
 *
 * What is cached, and why it is safe to cache it:
 *
 *   - Build assets under /_next/static/ and a small set of static files. Content-hashed, identical
 *     for every account, no customer data.
 *   - The HTML document for an explicit allowlist of application routes. Every one of those routes
 *     is a client component that renders no account data on the server and fetches everything it
 *     shows through the authenticated API after hydration, so the cached document is an empty shell.
 *
 * What is NEVER cached:
 *
 *   - Any request to the API origin. Authenticated customer records must come from the per-user
 *     encrypted IndexedDB store or from a live authorised request, never from a shared HTTP cache
 *     that a second account on the same device could read.
 *   - Any request carrying an Authorization header, any non-GET request, and any RSC/data request
 *     (`?_rsc=`), which can vary per navigation.
 *
 * The cache is shared by every account on the device BY DESIGN, which is precisely why only
 * account-independent bytes are allowed into it.
 */

const CACHE_VERSION = "insite-shell-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

/** Routes whose document shell may be served offline. */
const SHELL_ROUTES = ["/field-capture", "/inspections", "/command-center"];

/**
 * The navigation fallback. A STATIC document, not a Next.js route: a cached Next document
 * re-renders against the current URL once it hydrates, so serving an /offline *route* as the
 * fallback for another path showed that path (or Next's 404) instead of the offline message.
 */
const OFFLINE_FALLBACK = "/offline.html";

const PRECACHE_URLS = [OFFLINE_FALLBACK, "/field-capture", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Best effort: a URL that fails here must not block installation of the worker.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) await cache.put(url, response.clone());
          } catch {
            /* offline at install time: runtime caching will fill this in later */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("insite-shell-") && !name.startsWith(CACHE_VERSION))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

function isShellRoute(url) {
  return SHELL_ROUTES.some((route) => url.pathname === route || url.pathname === `${route}/`);
}

function isCacheableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === OFFLINE_FALLBACK ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/images/")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (the API lives on its own origin in every deployed environment) is never touched.
  if (url.origin !== self.location.origin) return;

  // An authorised request is customer-scoped by definition.
  if (request.headers.has("Authorization")) return;

  // React Server Component payloads vary per navigation and are not a stable shell.
  if (url.searchParams.has("_rsc")) return;

  // Same-origin API calls (used by a single-origin deployment) must also stay uncached.
  if (url.pathname.startsWith("/api/")) return;

  if (isCacheableAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigationStrategy(request, url));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    cache.put(request, response.clone());
  }
  return response;
}

/**
 * Network first so an online user always sees the current build; the cached shell exists only as
 * the offline fallback. A navigation to a route outside the allowlist falls back to /offline
 * rather than to some other route's shell, so no page is ever shown under the wrong URL.
 */
async function navigationStrategy(request, url) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok && isShellRoute(url)) {
      cache.put(new Request(url.pathname, { credentials: "same-origin" }), response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(url.pathname);
    if (cached) return cached;

    const offline = await cache.match(OFFLINE_FALLBACK);
    if (offline) return offline;

    throw error;
  }
}
