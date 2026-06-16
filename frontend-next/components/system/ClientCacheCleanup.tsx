"use client";

import { useEffect } from "react";

const CLEANUP_VERSION_KEY = "sightsignal_cache_cleanup_version";
const CLEANUP_VERSION = "cleanup-2026-06-16-v1";

export default function ClientCacheCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousVersion = window.localStorage.getItem(CLEANUP_VERSION_KEY);
    if (previousVersion === CLEANUP_VERSION) return;

    async function cleanupLegacyCaches() {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
        }

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        }

        window.localStorage.setItem(CLEANUP_VERSION_KEY, CLEANUP_VERSION);
      } catch {
        window.localStorage.setItem(CLEANUP_VERSION_KEY, CLEANUP_VERSION);
      }
    }

    cleanupLegacyCaches();
  }, []);

  return null;
}
