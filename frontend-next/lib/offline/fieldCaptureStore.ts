/**
 * Durable offline field-capture drafts.
 *
 * Scope boundary, stated up front. This store holds the CAPTURE half of an inspection: what the
 * inspector saw, where, and the photos of it. It deliberately does NOT hold HazLenz analyses,
 * findings, risk scores, corrective actions or reports. Those are server-authoritative
 * (`OFFLINE_HAZLENZ = ONLINE_REQUIRED`), and copying them onto the device would either duplicate
 * governed output or invite a local substitute that fabricates analysis -- the exact failure the
 * HazLenz verification contract exists to prevent.
 *
 * Nothing security-bearing is persisted: no password, no access or refresh token, no Stripe or
 * billing data, no provider credential. The only identity written is the derived `userKey`
 * namespace from offlineIdentity.ts.
 */
import type { RegulatoryContext } from "../canonicalWorkflowApi";
import { resolveOfflineIdentity, type OfflineIdentity } from "./offlineIdentity";
import {
  DRAFT_STORE,
  PHOTO_STORE,
  decryptForUser,
  deleteEnvelope,
  encryptForUser,
  getEnvelope,
  isIndexedDbAvailable,
  listEnvelopesForUser,
  listPhotoEnvelopesForDraft,
  purgeUserData,
  putEnvelope,
  recordKeyFor,
  type StoredPhotoEnvelope,
} from "./offlineDb";

/**
 * v2 replaced the `syncAttempt` bookkeeping marker with a server-authoritative idempotency
 * contract: `localId` is now sent as the create's `clientRequestId`, so recovering from a lost
 * response is the server's job rather than a client-side reconciliation heuristic. A stored v1
 * record still loads -- its extra `syncAttempt` field is simply ignored.
 */
export const OFFLINE_DRAFT_SCHEMA_VERSION = 2;

/**
 * LOCAL_ONLY  nothing about this draft has reached the server yet.
 * SYNCING     a synchronisation attempt is in flight or was interrupted mid-flight.
 * SYNCED      the server acknowledged every part of it; remoteInspectionId is authoritative.
 * SYNC_FAILED an attempt failed; the local copy is intact and retryable.
 * CONFLICT    the server record this draft is attached to moved on; a user decision is required.
 */
export type OfflineSyncState = "LOCAL_ONLY" | "SYNCING" | "SYNCED" | "SYNC_FAILED" | "CONFLICT";

export type OfflineObservation = {
  localId: string;
  /**
   * The identity this observation presents to the server as `clientRequestId`. Seeded from
   * `localId` and normally identical to it; it is a SEPARATE field only so that detaching a draft
   * from a conflicting server record can retire the identity the server has already resolved (see
   * resolveConflictAsNewInspection). `localId` stays fixed because it is the record's local key.
   */
  clientRequestId: string;
  text: string;
  locationLabel: string;
  createdAt: string;
  updatedAt: string;
  /** Set only after the server acknowledged this exact observation. */
  remoteObservationId?: string;
};

export type OfflinePhotoMeta = {
  localId: string;
  /** See OfflineObservation.clientRequestId. Seeded from `localId`. */
  clientRequestId: string;
  draftLocalId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  capturedAt: string;
  /** Photos are uploaded to the server evidence route only when the draft is synchronised. */
  remoteEvidenceId?: string;
};

export type OfflineDraft = {
  schemaVersion: number;
  localId: string;
  /**
   * The identity this draft presents to the server as `clientRequestId` when creating its
   * inspection. Seeded from `localId`. See OfflineObservation.clientRequestId for why it is a
   * separate field.
   */
  clientRequestId: string;
  userKey: string;
  organizationId: string | null;

  title: string;
  siteName: string;
  regulatoryContext: RegulatoryContext;

  observations: OfflineObservation[];

  createdAt: string;
  updatedAt: string;

  syncState: OfflineSyncState;
  syncError?: string;
  lastSyncedAt?: string;

  /** Server identifiers, recorded the instant the server acknowledges them. */
  remoteInspectionId?: string;
  remoteSiteId?: string;

  /**
   * The server inspection `version`/`updatedAt` this draft was last reconciled against. Used to
   * detect that the server record moved on while this device was offline (staleness).
   */
  baseServerVersion?: number;
  baseServerUpdatedAt?: string;
};

export type OfflineDraftSummary = Pick<
  OfflineDraft,
  "localId" | "title" | "siteName" | "regulatoryContext" | "updatedAt" | "createdAt" | "syncState" | "syncError" | "remoteInspectionId"
> & { observationCount: number; photoCount: number; characterCount: number };

export class OfflineUnavailableError extends Error {
  constructor(message = "Offline storage is not available in this browser.") {
    super(message);
    this.name = "OfflineUnavailableError";
  }
}

export class OfflineSignedOutError extends Error {
  constructor(message = "Sign in to reach the drafts saved on this device.") {
    super(message);
    this.name = "OfflineSignedOutError";
  }
}

/**
 * Mints the stable local identity for a draft, observation or photo.
 *
 * This value is ALSO the `clientRequestId` sent to the server, so it is the authoritative answer
 * to "is this create a replay?". Two properties follow. It must be unique per record -- hence a
 * UUID rather than anything derived from user content -- and it must never change once written,
 * because changing it would present a second identity for work the server already stored.
 *
 * The character set is deliberately inside the server's `CLIENT_REQUEST_ID_PATTERN`
 * (`[A-Za-z0-9_.:-]{8,128}`); the fallback branch stays inside it too.
 */
export function newLocalId(prefix: string) {
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${unique}`;
}

async function requireIdentity(): Promise<OfflineIdentity> {
  if (!isIndexedDbAvailable()) throw new OfflineUnavailableError();
  const identity = await resolveOfflineIdentity();
  if (!identity) throw new OfflineSignedOutError();
  return identity;
}

/** True when this device can hold offline drafts for the signed-in account. */
export async function offlineCaptureAvailable() {
  if (!isIndexedDbAvailable()) return false;
  return !!(await resolveOfflineIdentity());
}

async function writeDraft(identity: OfflineIdentity, draft: OfflineDraft) {
  const cipher = await encryptForUser(identity.userKey, draft);
  await putEnvelope(DRAFT_STORE, {
    recordKey: recordKeyFor(identity.userKey, draft.localId),
    userKey: identity.userKey,
    localId: draft.localId,
    updatedAt: draft.updatedAt,
    syncState: draft.syncState,
    cipher,
  });
  return draft;
}

export async function createOfflineDraft(input: {
  title: string;
  siteName: string;
  regulatoryContext: RegulatoryContext;
}): Promise<OfflineDraft> {
  const identity = await requireIdentity();
  const now = new Date().toISOString();

  const localId = newLocalId("draft");

  const draft: OfflineDraft = {
    schemaVersion: OFFLINE_DRAFT_SCHEMA_VERSION,
    localId,
    clientRequestId: localId,
    userKey: identity.userKey,
    organizationId: identity.organizationId,
    title: input.title.trim() || "Field inspection",
    siteName: input.siteName.trim(),
    regulatoryContext: input.regulatoryContext,
    observations: [],
    createdAt: now,
    updatedAt: now,
    syncState: "LOCAL_ONLY",
  };

  return writeDraft(identity, draft);
}

export async function getOfflineDraft(localId: string): Promise<OfflineDraft | null> {
  const identity = await requireIdentity();
  const envelope = await getEnvelope(DRAFT_STORE, identity.userKey, localId);
  if (!envelope) return null;
  const draft = await decryptForUser<OfflineDraft | null>(identity.userKey, envelope.cipher, null);
  // A record that does not carry this account's namespace is not this account's record.
  return draft && draft.userKey === identity.userKey ? draft : null;
}

/**
 * Persists a mutation. `mutate` receives the CURRENT stored draft, so concurrent editors in the
 * same tab cannot clobber each other's fields with a stale snapshot.
 */
export async function updateOfflineDraft(
  localId: string,
  mutate: (current: OfflineDraft) => OfflineDraft,
): Promise<OfflineDraft> {
  const identity = await requireIdentity();
  const current = await getOfflineDraft(localId);
  if (!current) throw new Error("That offline draft is no longer on this device.");

  const next = mutate(current);
  return writeDraft(identity, {
    ...next,
    userKey: identity.userKey,
    localId: current.localId,
    updatedAt: new Date().toISOString(),
  });
}

/** Update that must NOT move `updatedAt` (sync bookkeeping, not a customer edit). */
export async function recordSyncProgress(
  localId: string,
  mutate: (current: OfflineDraft) => OfflineDraft,
): Promise<OfflineDraft> {
  const identity = await requireIdentity();
  const current = await getOfflineDraft(localId);
  if (!current) throw new Error("That offline draft is no longer on this device.");
  return writeDraft(identity, { ...mutate(current), userKey: identity.userKey, localId: current.localId });
}

export async function listOfflineDrafts(): Promise<OfflineDraftSummary[]> {
  const identity = await requireIdentity();
  const envelopes = await listEnvelopesForUser(DRAFT_STORE, identity.userKey);

  const summaries: OfflineDraftSummary[] = [];
  for (const envelope of envelopes) {
    const draft = await decryptForUser<OfflineDraft | null>(identity.userKey, envelope.cipher, null);
    if (!draft || draft.userKey !== identity.userKey) continue;
    const photos = await listPhotoEnvelopesForDraft(identity.userKey, draft.localId);
    summaries.push({
      localId: draft.localId,
      title: draft.title,
      siteName: draft.siteName,
      regulatoryContext: draft.regulatoryContext,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      syncState: draft.syncState,
      syncError: draft.syncError,
      remoteInspectionId: draft.remoteInspectionId,
      observationCount: draft.observations.length,
      photoCount: photos.length,
      characterCount: draft.observations.reduce((total, item) => total + item.text.length, 0),
    });
  }

  return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteOfflineDraft(localId: string) {
  const identity = await requireIdentity();
  const photos = await listPhotoEnvelopesForDraft(identity.userKey, localId);
  for (const photo of photos) {
    await deleteEnvelope(PHOTO_STORE, identity.userKey, photo.localId);
  }
  await deleteEnvelope(DRAFT_STORE, identity.userKey, localId);
}

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

export function upsertObservation(
  draft: OfflineDraft,
  observation: { localId?: string; text: string; locationLabel: string },
): OfflineDraft {
  const now = new Date().toISOString();
  const existing = observation.localId
    ? draft.observations.find((item) => item.localId === observation.localId)
    : undefined;

  if (existing) {
    return {
      ...draft,
      observations: draft.observations.map((item) =>
        item.localId === existing.localId
          ? { ...item, text: observation.text, locationLabel: observation.locationLabel, updatedAt: now }
          : item,
      ),
    };
  }

  const localId = observation.localId || newLocalId("obs");

  return {
    ...draft,
    observations: [
      ...draft.observations,
      {
        localId,
        clientRequestId: localId,
        text: observation.text,
        locationLabel: observation.locationLabel,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function removeObservation(draft: OfflineDraft, observationLocalId: string): OfflineDraft {
  return {
    ...draft,
    observations: draft.observations.filter((item) => item.localId !== observationLocalId),
  };
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function saveOfflinePhoto(draftLocalId: string, file: File): Promise<OfflinePhotoMeta> {
  const identity = await requireIdentity();
  const photoLocalId = newLocalId("photo");
  const meta: OfflinePhotoMeta = {
    localId: photoLocalId,
    clientRequestId: photoLocalId,
    draftLocalId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    capturedAt: new Date().toISOString(),
  };

  const envelope: StoredPhotoEnvelope = {
    recordKey: recordKeyFor(identity.userKey, meta.localId),
    userKey: identity.userKey,
    localId: meta.localId,
    draftLocalId,
    updatedAt: meta.capturedAt,
    syncState: "LOCAL_ONLY",
    cipher: await encryptForUser(identity.userKey, meta),
    // The image bytes are stored as a native Blob. Base64-in-localStorage was explicitly rejected:
    // it inflates the payload ~33% and shares the ~5 MB origin quota with everything else.
    blob: file.slice(0, file.size, meta.mimeType),
  };

  await putEnvelope(PHOTO_STORE, envelope);
  return meta;
}

export async function listOfflinePhotos(draftLocalId: string): Promise<OfflinePhotoMeta[]> {
  const identity = await requireIdentity();
  const rows = await listPhotoEnvelopesForDraft(identity.userKey, draftLocalId);
  const metas: OfflinePhotoMeta[] = [];
  for (const row of rows) {
    const meta = await decryptForUser<OfflinePhotoMeta | null>(identity.userKey, row.cipher, null);
    if (meta) metas.push(meta);
  }
  return metas.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export async function readOfflinePhotoBlob(localId: string): Promise<Blob | null> {
  const identity = await requireIdentity();
  const row = (await getEnvelope(PHOTO_STORE, identity.userKey, localId)) as
    | StoredPhotoEnvelope
    | undefined;
  return row?.blob || null;
}

export async function updateOfflinePhotoMeta(localId: string, meta: OfflinePhotoMeta) {
  const identity = await requireIdentity();
  const row = (await getEnvelope(PHOTO_STORE, identity.userKey, localId)) as
    | StoredPhotoEnvelope
    | undefined;
  if (!row) return;
  await putEnvelope(PHOTO_STORE, {
    ...row,
    cipher: await encryptForUser(identity.userKey, meta),
  });
}

export async function deleteOfflinePhoto(localId: string) {
  const identity = await requireIdentity();
  await deleteEnvelope(PHOTO_STORE, identity.userKey, localId);
}

// ---------------------------------------------------------------------------
// Device hygiene
// ---------------------------------------------------------------------------

/** "Remove offline data from this device" for the SIGNED-IN account only. */
export async function removeOfflineDataForCurrentUser() {
  const identity = await requireIdentity();
  return purgeUserData(identity.userKey);
}

// ---------------------------------------------------------------------------
// User-controlled export
// ---------------------------------------------------------------------------

export type OfflineDraftExport = {
  format: "safety-insite.field-capture";
  schemaVersion: number;
  exportedAt: string;
  draft: Omit<OfflineDraft, "userKey"> & { userKey?: never };
  photos: OfflinePhotoMeta[];
};

/**
 * A plain-JSON copy of one draft that the customer owns and can keep anywhere.
 *
 * The `userKey` namespace is deliberately stripped: it is an internal storage detail, and an
 * exported file is no longer inside the isolation boundary that key expresses. Photo BYTES are not
 * embedded -- a handful of phone photos would produce a multi-hundred-megabyte JSON file, and the
 * image files are already the customer's on their own device. The metadata that references them is
 * exported so the file is self-describing. Stated rather than implied, in the file itself.
 */
export async function exportOfflineDraft(localId: string): Promise<OfflineDraftExport> {
  const draft = await getOfflineDraft(localId);
  if (!draft) throw new Error("That offline draft is no longer on this device.");

  const { userKey: _omitted, ...withoutNamespace } = draft;
  void _omitted;

  return {
    format: "safety-insite.field-capture",
    schemaVersion: OFFLINE_DRAFT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    draft: withoutNamespace as OfflineDraftExport["draft"],
    photos: await listOfflinePhotos(localId),
  };
}
