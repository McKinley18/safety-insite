const PIN_HASH_KEY = "sentinel_pin_hash_v1";
const PIN_SALT_KEY = "sentinel_pin_salt_v1";
const UNLOCKED_KEY = "sentinel_unlocked_until_v1";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sha256Base64(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return bytesToBase64(new Uint8Array(digest));
}

function getOrCreateSalt() {
  let salt = window.localStorage.getItem(PIN_SALT_KEY);

  if (!salt) {
    salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(24)));
    window.localStorage.setItem(PIN_SALT_KEY, salt);
  }

  return salt;
}

export function isPinRequired() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("sentinel_require_pin_unlock") === "true";
}

export function hasPinSet() {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(PIN_HASH_KEY);
}

export async function setPin(pin: string) {
  const salt = getOrCreateSalt();
  const hash = await sha256Base64(`${salt}:${pin}`);
  window.localStorage.setItem(PIN_HASH_KEY, hash);
}

export async function verifyPin(pin: string) {
  const salt = window.localStorage.getItem(PIN_SALT_KEY);
  const savedHash = window.localStorage.getItem(PIN_HASH_KEY);

  if (!salt || !savedHash) return false;

  const hash = await sha256Base64(`${salt}:${pin}`);
  return hash === savedHash;
}

export function unlockSession(minutes = 15) {
  const until = Date.now() + minutes * 60 * 1000;
  window.sessionStorage.setItem(UNLOCKED_KEY, String(until));
}

export function lockSession() {
  window.sessionStorage.removeItem(UNLOCKED_KEY);
}

export function isSessionUnlocked() {
  if (typeof window === "undefined") return false;
  const until = Number(window.sessionStorage.getItem(UNLOCKED_KEY) || 0);
  return until > Date.now();
}

export function getAutoLockMinutes() {
  if (typeof window === "undefined") return 15;

  const value = window.localStorage.getItem("sentinel_auto_lock_minutes") || "15";

  if (value === "off") return 15;

  return Number(value) || 15;
}


export function getProtectedModeLabel() {
  if (!isPinRequired()) return "Standard Mode";
  return isSessionUnlocked() ? "Protected Mode: Unlocked" : "Protected Mode: Locked";
}

export function getUnlockRedirectPath() {
  if (typeof window === "undefined") return "/command-center";
  return window.location.pathname || "/command-center";
}
