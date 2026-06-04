const KEY_NAME = "sentinel_device_encryption_key_v1";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getDeviceKey() {
  let rawKey = window.localStorage.getItem(KEY_NAME);

  if (!rawKey) {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    rawKey = bytesToBase64(keyBytes);
    window.localStorage.setItem(KEY_NAME, rawKey);
  }

  return crypto.subtle.importKey(
    "raw",
    base64ToBytes(rawKey),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(value: unknown) {
  if (typeof window === "undefined") return "";

  const key = await getDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return JSON.stringify({
    v: 1,
    alg: "AES-GCM",
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  });
}

export async function decryptJson<T>(payload: string | null, fallback: T): Promise<T> {
  if (!payload || typeof window === "undefined") return fallback;

  try {
    const parsed = JSON.parse(payload);

    if (!parsed?.iv || !parsed?.data) return fallback;

    const key = await getDeviceKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parsed.iv) },
      key,
      base64ToBytes(parsed.data)
    );

    return JSON.parse(new TextDecoder().decode(decrypted)) as T;
  } catch {
    return fallback;
  }
}
