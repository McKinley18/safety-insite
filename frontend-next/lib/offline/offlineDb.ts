/**
 * IndexedDB access layer for durable offline field capture.
 *
 * Why IndexedDB and not localStorage: field drafts carry photo blobs and an unbounded number of
 * observations. localStorage is synchronous, string-only and capped around 5 MB, so storing photo
 * data there (base64) is both slow and quota-fragile -- §79.4 already found customer content
 * scattered across generated localStorage keys. IndexedDB stores real Blobs, is asynchronous, and
 * gives us indexed per-user queries.
 *
 * Layout (database `insite-offline-v1`):
 *
 *   drafts  keyPath "recordKey" = `${userKey}::${localId}`   index byUser -> userKey
 *   photos  keyPath "recordKey" = `${userKey}::${localId}`   index byDraft -> [userKey, draftLocalId]
 *   keys    keyPath "userKey"                                per-account AES-GCM key material
 *
 * Two properties are deliberate.
 *
 * 1. `userKey` is part of every primary key AND is the only index. There is no "list all drafts"
 *    path in this module; every read is a bounded query on the byUser/byDraft index. A caller that
 *    does not hold an identity cannot form a query at all.
 *
 * 2. Record payloads are encrypted at rest with AES-GCM under a per-account key held in the `keys`
 *    store. Stated honestly: this key lives on the same device, so it is NOT protection against an
 *    attacker who controls the device or can run the application's own code. What it does buy is
 *    that the payloads are not legible plaintext in the browser's storage inspector, and that
 *    "remove offline data" can destroy the key along with the rows. The isolation guarantee that
 *    matters for the product -- user B cannot reach user A's drafts through InSite -- comes from
 *    the namespace above, not from this encryption.
 */

const DB_NAME = "insite-offline-v1";
const DB_VERSION = 1;

export const DRAFT_STORE = "drafts";
export const PHOTO_STORE = "photos";
const KEY_STORE = "keys";

export type StoredEnvelope = {
  /** `${userKey}::${localId}` */
  recordKey: string;
  userKey: string;
  localId: string;
  /** Left in clear so a list can be ordered and status-badged without decrypting every row. */
  updatedAt: string;
  syncState: string;
  /** AES-GCM envelope produced by encryptForUser(). */
  cipher: string;
};

export type StoredPhotoEnvelope = StoredEnvelope & {
  draftLocalId: string;
  /** Blobs are stored natively; only the descriptive payload is encrypted. */
  blob: Blob;
};

export function isIndexedDbAvailable() {
  return typeof window !== "undefined" && !!window.indexedDB && !!window.crypto?.subtle;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        const drafts = db.createObjectStore(DRAFT_STORE, { keyPath: "recordKey" });
        drafts.createIndex("byUser", "userKey", { unique: false });
      }

      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const photos = db.createObjectStore(PHOTO_STORE, { keyPath: "recordKey" });
        photos.createIndex("byDraft", ["userKey", "draftLocalId"], { unique: false });
        photos.createIndex("byUser", "userKey", { unique: false });
      }

      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE, { keyPath: "userKey" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // A version change from another tab must not leave this connection blocking it.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => reject(request.error || new Error("IndexedDB could not be opened."));
    request.onblocked = () => reject(new Error("IndexedDB upgrade is blocked by another tab."));
  }).catch((error: unknown) => {
    dbPromise = null;
    throw error;
  });

  dbPromise = opening;
  return opening;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
  });
}

async function withStore<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  run: (transaction: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const db = await openDatabase();
  const transaction = db.transaction(storeNames, mode);

  const completion = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
  });

  const result = await run(transaction);
  await completion;
  return result;
}

// ---------------------------------------------------------------------------
// Per-account key material and payload encryption
// ---------------------------------------------------------------------------

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const keyCache = new Map<string, CryptoKey>();

async function getUserCryptoKey(userKey: string): Promise<CryptoKey> {
  const cached = keyCache.get(userKey);
  if (cached) return cached;

  const existing = await withStore(KEY_STORE, "readonly", (transaction) =>
    promisify<{ userKey: string; raw: string } | undefined>(
      transaction.objectStore(KEY_STORE).get(userKey),
    ),
  );

  let raw = existing?.raw;

  if (!raw) {
    raw = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
    const material = raw;
    await withStore(KEY_STORE, "readwrite", (transaction) => {
      transaction.objectStore(KEY_STORE).put({ userKey, raw: material });
    });
  }

  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(raw) as unknown as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );

  keyCache.set(userKey, key);
  return key;
}

export async function encryptForUser(userKey: string, value: unknown): Promise<string> {
  const key = await getUserCryptoKey(userKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return JSON.stringify({
    v: 1,
    alg: "AES-GCM",
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  });
}

export async function decryptForUser<T>(userKey: string, cipher: string, fallback: T): Promise<T> {
  try {
    const parsed = JSON.parse(cipher);
    if (!parsed?.iv || !parsed?.data) return fallback;
    const key = await getUserCryptoKey(userKey);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(parsed.iv) as unknown as BufferSource },
      key,
      base64ToBytes(parsed.data) as unknown as BufferSource,
    );
    return JSON.parse(new TextDecoder().decode(decrypted)) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Namespaced record access. Every entry point takes a userKey.
// ---------------------------------------------------------------------------

export function recordKeyFor(userKey: string, localId: string) {
  return `${userKey}::${localId}`;
}

export async function putEnvelope(store: string, envelope: StoredEnvelope | StoredPhotoEnvelope) {
  await withStore(store, "readwrite", (transaction) => {
    transaction.objectStore(store).put(envelope);
  });
}

export async function getEnvelope(store: string, userKey: string, localId: string) {
  return withStore(store, "readonly", (transaction) =>
    promisify<StoredEnvelope | StoredPhotoEnvelope | undefined>(
      transaction.objectStore(store).get(recordKeyFor(userKey, localId)),
    ),
  ).then((found) => (found && found.userKey === userKey ? found : undefined));
}

export async function listEnvelopesForUser(store: string, userKey: string) {
  const rows = await withStore(store, "readonly", (transaction) =>
    promisify<Array<StoredEnvelope | StoredPhotoEnvelope>>(
      transaction.objectStore(store).index("byUser").getAll(IDBKeyRange.only(userKey)),
    ),
  );
  // Belt and braces: the index alone is the boundary, but a stray row with a foreign userKey
  // must never escape this function.
  return rows.filter((row) => row.userKey === userKey);
}

export async function listPhotoEnvelopesForDraft(userKey: string, draftLocalId: string) {
  const rows = await withStore(PHOTO_STORE, "readonly", (transaction) =>
    promisify<StoredPhotoEnvelope[]>(
      transaction
        .objectStore(PHOTO_STORE)
        .index("byDraft")
        .getAll(IDBKeyRange.only([userKey, draftLocalId])),
    ),
  );
  return rows.filter((row) => row.userKey === userKey && row.draftLocalId === draftLocalId);
}

export async function deleteEnvelope(store: string, userKey: string, localId: string) {
  await withStore(store, "readwrite", (transaction) => {
    transaction.objectStore(store).delete(recordKeyFor(userKey, localId));
  });
}

/**
 * Destroys every offline record belonging to ONE account, including its key material, so the
 * remaining bytes (if any survive compaction) are undecryptable. Never touches another account.
 */
export async function purgeUserData(userKey: string) {
  const drafts = await listEnvelopesForUser(DRAFT_STORE, userKey);
  const photos = await listEnvelopesForUser(PHOTO_STORE, userKey);

  await withStore([DRAFT_STORE, PHOTO_STORE, KEY_STORE], "readwrite", (transaction) => {
    drafts.forEach((row) => transaction.objectStore(DRAFT_STORE).delete(row.recordKey));
    photos.forEach((row) => transaction.objectStore(PHOTO_STORE).delete(row.recordKey));
    transaction.objectStore(KEY_STORE).delete(userKey);
  });

  keyCache.delete(userKey);
  return { drafts: drafts.length, photos: photos.length };
}
