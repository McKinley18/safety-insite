/**
 * Sentinel secure storage abstraction.
 *
 * Current web prototype uses localStorage.
 * Next production step: replace internals with encrypted IndexedDB / mobile secure storage.
 */

const PREFIX = "sentinel_secure_";

function key(name: string) {
  return `${PREFIX}${name}`;
}

export const secureStorage = {
  get<T>(name: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;

    try {
      const value = window.localStorage.getItem(key(name));
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(name: string, value: T) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(key(name), JSON.stringify(value));
  },

  remove(name: string) {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(key(name));
  },
};
