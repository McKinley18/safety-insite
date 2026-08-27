"use client";

import { useEffect } from "react";

const CLEANUP_VERSION_KEY = "auditally_cache_cleanup_version";
const CLEANUP_VERSION = "cleanup-2026-07-14-theme-v1";

// Everything this component sweeps predates the offline application shell. The shell worker and
// its caches are identified by name and left alone; see ServiceWorkerRegistrar and public/sw.js.
const OFFLINE_SHELL_WORKER_PATH = "/sw.js";
const OFFLINE_SHELL_CACHE_PREFIX = "insite-shell-";

function isOfflineShellWorker(registration: ServiceWorkerRegistration) {
  const script =
    registration.active?.scriptURL ||
    registration.waiting?.scriptURL ||
    registration.installing?.scriptURL ||
    "";
  try {
    return new URL(script, window.location.origin).pathname === OFFLINE_SHELL_WORKER_PATH;
  } catch {
    return false;
  }
}

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
            registrations
              // The offline application-shell worker is NOT legacy. Unregistering it here would
              // undo the shell caching that makes durable offline field capture reopenable, and
              // would do it on exactly the first visit that installs the worker.
              .filter((registration) => !isOfflineShellWorker(registration))
              .map((registration) => registration.unregister()),
          );
        }

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter((cacheName) => !cacheName.startsWith(OFFLINE_SHELL_CACHE_PREFIX))
              .map((cacheName) => caches.delete(cacheName)),
          );
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
