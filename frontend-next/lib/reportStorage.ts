import { decryptJson, encryptJson } from "./encryption";
import { secureStorage } from "./secureStorage";

const PREFIX = "sentinel_encrypted_";

function encryptedKey(name: string) {
  return `${PREFIX}${name}`;
}

async function getEncrypted<T>(name: string, fallback: T): Promise<T> {
  if (typeof window === "undefined") return fallback;

  const encrypted = window.localStorage.getItem(encryptedKey(name));
  return decryptJson<T>(encrypted, fallback);
}

async function setEncrypted<T>(name: string, value: T) {
  if (typeof window === "undefined") return;

  const encrypted = await encryptJson(value);
  window.localStorage.setItem(encryptedKey(name), encrypted);
}

export async function getReports<T>() {
  const encryptedReports = await getEncrypted<T[]>("reports", []);

  if (encryptedReports.length) return encryptedReports;

  const legacyReports = secureStorage.get("reports", [] as T[]);
  if (legacyReports.length) {
    await setEncrypted("reports", legacyReports);
  }

  return legacyReports;
}

export async function setReports<T>(reports: T[]) {
  await setEncrypted("reports", reports);
}

export async function getLatestReport<T>() {
  const encrypted = await getEncrypted<T | null>("latest_report", null);
  if (encrypted) return encrypted;

  const legacy = secureStorage.get("latest_report", null as T | null);
  if (legacy) await setEncrypted("latest_report", legacy);

  return legacy;
}

export async function setLatestReport<T>(report: T) {
  await setEncrypted("latest_report", report);
}

export async function removeLatestReport() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(encryptedKey("latest_report"));
  secureStorage.remove("latest_report");
}

export async function getCoverPage<T>() {
  const encrypted = await getEncrypted<T | null>("cover_page", null);
  if (encrypted) return encrypted;

  const legacy = secureStorage.get("cover_page", null as T | null);
  if (legacy) await setEncrypted("cover_page", legacy);

  return legacy;
}

export async function setCoverPage<T>(coverPage: T) {
  await setEncrypted("cover_page", coverPage);
}

export async function getEditReport<T>() {
  const encrypted = await getEncrypted<T | null>("edit_report", null);
  if (encrypted) return encrypted;

  const legacy = secureStorage.get("edit_report", null as T | null);
  if (legacy) await setEncrypted("edit_report", legacy);

  return legacy;
}

export async function setEditReport<T>(report: T) {
  await setEncrypted("edit_report", report);
}

export async function removeEditReport() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(encryptedKey("edit_report"));
  secureStorage.remove("edit_report");
}


export async function removeCoverPage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(encryptedKey("cover_page"));
  secureStorage.remove("cover_page");
}
