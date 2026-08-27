"use client";

import { useEffect } from "react";

/**
 * Registers the offline application shell worker (public/sw.js).
 *
 * Ordering matters. ClientCacheCleanup unregisters legacy service workers and deletes legacy
 * caches; it now excludes this worker and the `insite-shell-*` caches by name, but registration
 * still waits for the window `load` event so the two never race on a first visit.
 *
 * Registration is deliberately unconditional across signed-in and signed-out visits: the shell it
 * caches contains no account data, and a worker that only installs after sign-in would not be
 * controlling the page on the very first field visit, which is exactly when it is needed.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // The dev server rebuilds assets on every edit; a cached shell there would serve stale chunks.
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV) return;

    let cancelled = false;

    const register = () => {
      if (cancelled) return;
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // A blocked or unsupported registration must never break the application; offline draft
          // storage (IndexedDB) works without it, only shell reopening does not.
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
