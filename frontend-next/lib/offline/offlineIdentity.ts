/**
 * Per-user namespace for everything InSite stores on the device for offline field capture.
 *
 * V1-OFFLINE-ISO-01. Every offline record is written and read under a `userKey` derived from
 * the AUTHENTICATED account, never from a device-global name. §79.4 closed a real cross-account
 * leak caused by device-global localStorage keys surviving sign-out; the offline store must not
 * reintroduce that shape, so namespacing is a property of the storage layer itself rather than a
 * filter the UI is trusted to apply.
 *
 * The key is a SHA-256 digest of the account's server id (falling back to the normalised email
 * only when a legacy session snapshot has no id), so the raw identifier is never used as an
 * IndexedDB key or index value. This is a namespace, not a secret: it is derived from data the
 * session already holds and is intentionally reproducible on the next sign-in of the SAME
 * account, which is what lets that account -- and only that account -- reach its own drafts again.
 */
import { getAuthUser } from "../auth";

export type OfflineIdentity = {
  /** Opaque per-account namespace. Every stored record is keyed and indexed by this. */
  userKey: string;
  /** Server organization scope carried onto synced records; null for individual accounts. */
  organizationId: string | null;
};

const NAMESPACE_SALT = "insite-offline-v1";

let cached: { source: string; identity: OfflineIdentity } | null = null;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

/**
 * Resolves the namespace for the account currently signed in on this device, or null when there
 * is no session. Returning null is the isolation boundary: with no session there is no userKey,
 * so no query can be formed and no offline record can be read or written.
 */
export async function resolveOfflineIdentity(): Promise<OfflineIdentity | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;

  const user = getAuthUser();
  const rawId = typeof user.id === "string" ? user.id.trim() : "";
  const rawEmail = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  const source = rawId || rawEmail;
  if (!source) return null;

  const organizationId =
    typeof user.organizationId === "string" && user.organizationId ? user.organizationId : null;

  if (cached && cached.source === source && cached.identity.organizationId === organizationId) {
    return cached.identity;
  }

  const identity: OfflineIdentity = {
    userKey: `u_${await sha256Hex(`${NAMESPACE_SALT}:${source}`)}`,
    organizationId,
  };

  cached = { source, identity };
  return identity;
}

/** Drops the memoised namespace. Called on sign-out so a later session cannot inherit it. */
export function forgetOfflineIdentity() {
  cached = null;
}
