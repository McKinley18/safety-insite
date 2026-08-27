/**
 * Explicit synchronisation of an offline field-capture draft to the server.
 *
 * The identity contract, which is the whole design:
 *
 *   Every local record -- draft, observation, photo -- is minted with a stable opaque `localId`
 *   and that value is sent to the server as `clientRequestId`. The server holds a PARTIAL UNIQUE
 *   index on (creating user, identifier) for inspections and evidence, and on (inspection,
 *   creating user, identifier) for observations, and resolves a repeated identifier back to the
 *   row it already created. So "the server committed and the response was lost" and "the server
 *   never saw it" collapse into the same safe action: send it again.
 *
 * This replaced a client-side heuristic that matched title + site + timestamp to decide whether an
 * interrupted attempt had already landed. That heuristic was safe only because it refused to act
 * whenever more than one candidate matched -- meaning two legitimate inspections created minutes
 * apart at the same site with the same title could deadlock recovery, and a single match was still
 * a guess. Identity is not a similarity judgement, and this module no longer makes one.
 *
 * Three further constraints, unchanged from the original design:
 *
 * 1. **Synchronisation only ever appends.** It creates an inspection and appends observations and
 *    evidence. It never PATCHes server-held text, never transitions an inspection, and never
 *    deletes anything on the server, so "local silently overwrites newer server state" is
 *    structurally impossible rather than merely unlikely. A staleness check (detectConflict) still
 *    runs, so a draft attached to a server inspection that moved on is handed to the user rather
 *    than appended to blindly.
 *
 * 2. **Local data is never discarded before acknowledgement.** Every identifier the server returns
 *    is written to IndexedDB immediately; a failure at any step leaves everything already
 *    acknowledged recorded and everything else retryable.
 *
 * 3. **No HazLenz.** Synchronising capture does not run analysis. Analysis stays on the existing
 *    online, entitlement-gated path (`OFFLINE_HAZLENZ = ONLINE_REQUIRED`).
 */
import {
  addPersistedObservation,
  createPersistedInspection,
  createPersistedSite,
  getPersistedInspection,
  listPersistedSites,
  uploadInspectionEvidence,
  type PersistedInspection,
} from "../canonicalWorkflowApi";
import {
  getOfflineDraft,
  listOfflinePhotos,
  newLocalId,
  readOfflinePhotoBlob,
  recordSyncProgress,
  updateOfflinePhotoMeta,
  type OfflineDraft,
} from "./fieldCaptureStore";

export type SyncOutcome = {
  localId: string;
  state: OfflineDraft["syncState"];
  remoteInspectionId?: string;
  observationsSynced: number;
  photosSynced: number;
  photosFailed: number;
  message: string;
};

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * A draft that was never attached to a server inspection cannot conflict with one. A draft that
 * WAS (because a previous sync created it, or a later sync is resuming) conflicts when the server
 * copy has advanced past the version this device last reconciled against.
 */
export function detectConflict(
  draft: OfflineDraft,
  server: Pick<PersistedInspection, "version" | "updatedAt" | "status">,
): { conflict: boolean; reason: string } {
  if (draft.baseServerVersion === undefined) return { conflict: false, reason: "" };

  if (server.version > draft.baseServerVersion) {
    return {
      conflict: true,
      reason:
        `This inspection was changed elsewhere while this device was offline ` +
        `(server version ${server.version}, this device last saw ${draft.baseServerVersion}). ` +
        `Nothing on the server was overwritten.`,
    };
  }

  if (server.status === "archived") {
    return { conflict: true, reason: "The server copy of this inspection has been archived." };
  }

  return { conflict: false, reason: "" };
}

/**
 * Sites are resolved by NAME, not by an idempotency identifier, and that is deliberate rather than
 * an oversight. A site's name is already its user-facing identity -- the existing "Saved site"
 * picker on /inspections selects by it -- and the server holds a uniqueness constraint on it, so a
 * create whose response was lost is recovered by the same lookup that runs first anyway. Sites are
 * also user-visible and user-correctable in a way a duplicated inspection record is not.
 */
async function resolveSiteId(draft: OfflineDraft): Promise<string> {
  if (draft.remoteSiteId) return draft.remoteSiteId;

  const { data: sites } = await listPersistedSites();
  const wanted = draft.siteName.trim();
  const existing = sites.find(
    (site) => site.name.trim().toLowerCase() === wanted.toLowerCase() && !site.archivedAt,
  );
  if (existing) return existing.id;

  const created = await createPersistedSite(wanted || "Field site");
  return created.id;
}

/**
 * Synchronises one draft. Returns the outcome; the draft's own persisted state is always updated
 * to match, so the UI can re-read it rather than trusting an in-memory value.
 */
export async function syncOfflineDraft(localId: string): Promise<SyncOutcome> {
  const initial = await getOfflineDraft(localId);
  if (!initial) throw new Error("That offline draft is no longer on this device.");

  if (isOffline()) {
    return {
      localId,
      state: initial.syncState,
      remoteInspectionId: initial.remoteInspectionId,
      observationsSynced: 0,
      photosSynced: 0,
      photosFailed: 0,
      message: "No connection. This draft stays saved on this device until you are back online.",
    };
  }

  await recordSyncProgress(localId, (current) => ({
    ...current,
    syncState: "SYNCING",
    syncError: undefined,
  }));

  try {
    let draft = (await getOfflineDraft(localId))!;

    // ---- Phase A: obtain the server inspection -----------------------------
    //
    // No reconciliation, no candidate search, no ambiguity. `draft.localId` is the identity; the
    // server answers with the inspection that identity already created, or creates it.
    if (!draft.remoteInspectionId) {
      const siteId = await resolveSiteId(draft);

      draft = await recordSyncProgress(localId, (current) => ({ ...current, remoteSiteId: siteId }));

      const created = await createPersistedInspection({
        siteId,
        title: draft.title,
        regulatoryContext: draft.regulatoryContext,
        clientRequestId: draft.clientRequestId,
      });

      draft = await recordSyncProgress(localId, (current) => ({
        ...current,
        remoteInspectionId: created.id,
        remoteSiteId: created.siteId,
        baseServerVersion: created.version,
        baseServerUpdatedAt: created.updatedAt,
      }));
    }

    // ---- Phase B: staleness check before appending anything -----------------
    const server = await getPersistedInspection(draft.remoteInspectionId!);
    const conflict = detectConflict(draft, server);
    if (conflict.conflict) {
      await recordSyncProgress(localId, (current) => ({
        ...current,
        syncState: "CONFLICT",
        syncError: conflict.reason,
      }));
      return {
        localId,
        state: "CONFLICT",
        remoteInspectionId: draft.remoteInspectionId,
        observationsSynced: 0,
        photosSynced: 0,
        photosFailed: 0,
        message: conflict.reason,
      };
    }

    // ---- Phase C: append observations, one acknowledgement at a time --------
    const serverObservationIds = new Set((server.observations || []).map((item) => item.id));
    let observationsSynced = 0;

    for (const observation of draft.observations) {
      // Already acknowledged and still present on the server: nothing to do. The server's identity
      // contract would make a re-send harmless, but not sending is cheaper and clearer.
      if (observation.remoteObservationId && serverObservationIds.has(observation.remoteObservationId)) {
        continue;
      }
      if (!observation.text.trim()) continue;

      const body = observation.locationLabel.trim()
        ? `${observation.text.trim()}\n\nLocation: ${observation.locationLabel.trim()}`
        : observation.text.trim();

      const saved = await addPersistedObservation(
        draft.remoteInspectionId!,
        body,
        observation.clientRequestId,
      );

      draft = await recordSyncProgress(localId, (current) => ({
        ...current,
        observations: current.observations.map((item) =>
          item.localId === observation.localId
            ? { ...item, remoteObservationId: saved.id }
            : item,
        ),
      }));
      observationsSynced += 1;
    }

    // ---- Phase D: evidence --------------------------------------------------
    let photosSynced = 0;
    let photosFailed = 0;

    for (const photo of await listOfflinePhotos(localId)) {
      if (photo.remoteEvidenceId) continue;
      try {
        const blob = await readOfflinePhotoBlob(photo.localId);
        if (!blob) {
          photosFailed += 1;
          continue;
        }
        const file = new File([blob], photo.fileName || "evidence", { type: photo.mimeType });
        const stored = await uploadInspectionEvidence(
          draft.remoteInspectionId!,
          file,
          photo.clientRequestId,
        );
        await updateOfflinePhotoMeta(photo.localId, { ...photo, remoteEvidenceId: stored.id });
        photosSynced += 1;
      } catch {
        // A rejected photo (size/type/entitlement) must not fail the whole inspection sync, and
        // must not be reported as uploaded. It stays on the device and is retried next time; the
        // identifier makes that retry non-duplicating.
        photosFailed += 1;
      }
    }

    // ---- Phase E: acknowledge ----------------------------------------------
    const finalServer = await getPersistedInspection(draft.remoteInspectionId!);
    const outstanding = draft.observations.filter(
      (item) => item.text.trim() && !item.remoteObservationId,
    ).length;

    const state: OfflineDraft["syncState"] =
      outstanding === 0 && photosFailed === 0 ? "SYNCED" : "SYNC_FAILED";

    await recordSyncProgress(localId, (current) => ({
      ...current,
      syncState: state,
      syncError:
        state === "SYNCED"
          ? undefined
          : `${outstanding} observation(s) and ${photosFailed} photo(s) are still on this device.`,
      lastSyncedAt: state === "SYNCED" ? new Date().toISOString() : current.lastSyncedAt,
      baseServerVersion: finalServer.version,
      baseServerUpdatedAt: finalServer.updatedAt,
    }));

    return {
      localId,
      state,
      remoteInspectionId: draft.remoteInspectionId,
      observationsSynced,
      photosSynced,
      photosFailed,
      message:
        state === "SYNCED"
          ? `Synced to Safety InSite — ${observationsSynced} observation(s)${photosSynced ? `, ${photosSynced} photo(s)` : ""}.`
          : "Partly synced. Everything not acknowledged by the server is still saved on this device.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    await recordSyncProgress(localId, (current) => ({
      ...current,
      // A create that had already been recorded keeps its identifier; only the state moves.
      syncState: "SYNC_FAILED",
      syncError: message,
    }));
    return {
      localId,
      state: "SYNC_FAILED",
      observationsSynced: 0,
      photosSynced: 0,
      photosFailed: 0,
      message,
    };
  }
}

/**
 * Conflict resolution, v1: the user chooses. "Keep both" detaches the local draft from the server
 * record so the next sync creates a NEW inspection carrying the local work — nothing on the server
 * is touched. There is deliberately no "local wins" option that overwrites server content.
 *
 * Detaching also has to retire the draft's server identity. `localId` is the `clientRequestId` the
 * server has already resolved to the conflicting inspection, so replaying it would return that
 * same inspection instead of creating the separate one the user asked for. A fresh identity is
 * minted for the detached copy, and every observation is given one too, since theirs are scoped to
 * an inspection they are leaving.
 */
export async function resolveConflictAsNewInspection(localId: string) {
  // Every server-facing identity this draft holds has to be retired, and all of them, not just the
  // inspection's. `clientRequestId` is exactly what the server resolves to the record it already
  // created, so replaying any of them would attach this work back to the inspection the user just
  // chose to leave -- the observation identifiers to that inspection, and the photo identifiers to
  // the evidence objects already stored under it. Fresh identities, and every acknowledgement
  // cleared, is what makes the next sync produce a genuinely separate inspection.
  for (const photo of await listOfflinePhotos(localId)) {
    await updateOfflinePhotoMeta(photo.localId, {
      ...photo,
      clientRequestId: newLocalId("photo"),
      remoteEvidenceId: undefined,
    });
  }

  return recordSyncProgress(localId, (current) => ({
    ...current,
    clientRequestId: newLocalId("draft"),
    remoteInspectionId: undefined,
    baseServerVersion: undefined,
    baseServerUpdatedAt: undefined,
    syncState: "LOCAL_ONLY",
    syncError: undefined,
    observations: current.observations.map((item) => ({
      ...item,
      clientRequestId: newLocalId("obs"),
      remoteObservationId: undefined,
    })),
  }));
}

/** "Accept the server copy": the local draft is acknowledged as superseded and can be removed. */
export async function acknowledgeServerCopy(localId: string) {
  const server = await (async () => {
    const draft = await getOfflineDraft(localId);
    return draft?.remoteInspectionId ? getPersistedInspection(draft.remoteInspectionId) : null;
  })();

  return recordSyncProgress(localId, (current) => ({
    ...current,
    syncState: "SYNCED",
    syncError: undefined,
    baseServerVersion: server?.version ?? current.baseServerVersion,
    baseServerUpdatedAt: server?.updatedAt ?? current.baseServerUpdatedAt,
  }));
}
