"use client";

/**
 * Durable offline field capture.
 *
 * This route is the one place in InSite that works with no connection. It is deliberately a
 * separate, small surface rather than a rewrite of /inspection-workspace: the workspace is the
 * server-authoritative HazLenz review flow (analysis, risk, findings, report), all of which is
 * legitimately ONLINE_REQUIRED, and making it offline-tolerant would have meant either duplicating
 * governed analysis onto the device or fabricating a local substitute for it. Neither is
 * acceptable. What a field inspector actually loses without signal is the ability to RECORD what
 * they are looking at, and that is what this page makes durable.
 *
 * Everything rendered here comes from the per-user encrypted IndexedDB store, never from a cached
 * API response, so a second account signing in on the same device sees nothing of the first.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  REGULATORY_CONTEXT_OPTIONS,
  regulatoryContextFromSettingsScope,
  regulatoryContextLabel,
  type RegulatoryContext,
} from "@/lib/canonicalWorkflowApi";
import {
  createOfflineDraft,
  deleteOfflineDraft,
  deleteOfflinePhoto,
  exportOfflineDraft,
  getOfflineDraft,
  listOfflineDrafts,
  listOfflinePhotos,
  offlineCaptureAvailable,
  readOfflinePhotoBlob,
  removeObservation,
  removeOfflineDataForCurrentUser,
  saveOfflinePhoto,
  updateOfflineDraft,
  upsertObservation,
  type OfflineDraft,
  type OfflineDraftSummary,
  type OfflinePhotoMeta,
  type OfflineSyncState,
} from "@/lib/offline/fieldCaptureStore";
import {
  acknowledgeServerCopy,
  resolveConflictAsNewInspection,
  syncOfflineDraft,
} from "@/lib/offline/fieldCaptureSync";

// Matches the server's evidence upload limit (FileInterceptor fileSize 10 MB in
// backend/src/storage/files.controller.ts). Accepting a larger file on the device would mean
// promising to store something the sync can never deliver.
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const SYNC_STATE_LABELS: Record<OfflineSyncState, string> = {
  LOCAL_ONLY: "Saved on this device · not yet synced",
  SYNCING: "Syncing…",
  SYNCED: "Synced to Safety InSite",
  SYNC_FAILED: "Sync failed · still saved on this device",
  CONFLICT: "Action required · changed elsewhere",
};

const SYNC_STATE_CLASSES: Record<OfflineSyncState, string> = {
  LOCAL_ONLY: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  SYNCING: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200",
  SYNCED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  SYNC_FAILED: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  CONFLICT: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

function SyncBadge({ state }: { state: OfflineSyncState }) {
  return (
    <span
      data-sync-state={state}
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] ${SYNC_STATE_CLASSES[state]}`}
    >
      {SYNC_STATE_LABELS[state]}
    </span>
  );
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return (
    date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

export default function FieldCapturePage() {
  const router = useRouter();
  const isOnline = useNetworkStatus();

  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [drafts, setDrafts] = useState<OfflineDraftSummary[]>([]);
  const [openDraft, setOpenDraft] = useState<OfflineDraft | null>(null);
  const [photos, setPhotos] = useState<OfflinePhotoMeta[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Loading drafts saved on this device…");
  const [busy, setBusy] = useState(false);

  const [newTitle, setNewTitle] = useState("Field inspection");
  const [newSiteName, setNewSiteName] = useState("");
  const [newContext, setNewContext] = useState<RegulatoryContext>("unknown");

  const [observationText, setObservationText] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [editingObservationId, setEditingObservationId] = useState<string | null>(null);

  const objectUrls = useRef<string[]>([]);

  const refreshList = useCallback(async () => {
    setDrafts(await listOfflineDrafts());
  }, []);

  // Initial mount: establish whether this device+account can hold offline drafts at all, then
  // restore whatever is already stored. This runs with no network dependency of any kind.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const canUse = await offlineCaptureAvailable();
      if (cancelled) return;

      setAvailable(canUse);

      if (!canUse) {
        setReady(true);
        setStatus(
          typeof window !== "undefined" && window.indexedDB
            ? "Sign in to use offline field capture on this device."
            : "This browser does not provide the local storage offline capture needs.",
        );
        return;
      }

      try {
        const stored = await listOfflineDrafts();
        if (cancelled) return;
        setDrafts(stored);
        setStatus(
          stored.length
            ? `${stored.length} draft${stored.length === 1 ? "" : "s"} saved on this device.`
            : "No drafts on this device yet.",
        );
      } catch (error) {
        if (!cancelled) {
          setStatus(error instanceof Error ? error.message : "Local drafts could not be read.");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Default the regulatory context from the Settings preference, exactly as /inspections does.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scope = window.localStorage.getItem("sentinel_regulatory_scope") || "all";
    setNewContext(regulatoryContextFromSettingsScope(scope));
  }, []);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadPhotos = useCallback(async (draftLocalId: string) => {
    const metas = await listOfflinePhotos(draftLocalId);
    setPhotos(metas);

    const urls: Record<string, string> = {};
    for (const meta of metas) {
      const blob = await readOfflinePhotoBlob(meta.localId);
      if (!blob) continue;
      const url = URL.createObjectURL(blob);
      objectUrls.current.push(url);
      urls[meta.localId] = url;
    }
    setPhotoUrls(urls);
  }, []);

  async function openDraftById(localId: string) {
    const draft = await getOfflineDraft(localId);
    if (!draft) {
      setStatus("That draft is no longer on this device.");
      await refreshList();
      return;
    }
    setOpenDraft(draft);
    setObservationText("");
    setLocationLabel("");
    setEditingObservationId(null);
    await loadPhotos(localId);
    setStatus(`Opened “${draft.title}”. ${SYNC_STATE_LABELS[draft.syncState]}.`);
  }

  async function createDraft() {
    if (!newSiteName.trim()) {
      setStatus("Enter the site or area this inspection covers.");
      return;
    }
    if (newContext === "unknown") {
      setStatus("Select a regulatory context before starting.");
      return;
    }

    setBusy(true);
    try {
      const draft = await createOfflineDraft({
        title: newTitle,
        siteName: newSiteName,
        regulatoryContext: newContext,
      });
      await refreshList();
      setNewSiteName("");
      await openDraftById(draft.localId);
      setStatus("Draft created and saved on this device. It is not on the server yet.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The draft could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function saveObservation() {
    if (!openDraft) return;
    if (!observationText.trim()) {
      setStatus("Type what you observed before saving it.");
      return;
    }

    setBusy(true);
    try {
      const next = await updateOfflineDraft(openDraft.localId, (current) =>
        upsertObservation(
          {
            ...current,
            // A previously synced draft that gains new local work is no longer fully synced, and
            // saying otherwise would be the exact false "saved to the server" claim this product
            // must never make.
            syncState: current.syncState === "SYNCED" ? "LOCAL_ONLY" : current.syncState,
          },
          {
            localId: editingObservationId || undefined,
            text: observationText.trim(),
            locationLabel: locationLabel.trim(),
          },
        ),
      );
      setOpenDraft(next);
      setObservationText("");
      setLocationLabel("");
      setEditingObservationId(null);
      await refreshList();
      setStatus("Saved on this device. Not yet synced.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The observation was not saved.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteObservation(observationLocalId: string) {
    if (!openDraft) return;
    setBusy(true);
    try {
      const next = await updateOfflineDraft(openDraft.localId, (current) =>
        removeObservation(current, observationLocalId),
      );
      setOpenDraft(next);
      await refreshList();
      setStatus("Observation removed from this device.");
    } finally {
      setBusy(false);
    }
  }

  async function addPhoto(file: File | null) {
    if (!openDraft || !file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setStatus(`That photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB.`);
      return;
    }

    setBusy(true);
    try {
      await saveOfflinePhoto(openDraft.localId, file);
      await loadPhotos(openDraft.localId);
      await refreshList();
      setStatus("Photo saved on this device. It uploads when you sync.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The photo was not saved on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto(localId: string) {
    if (!openDraft) return;
    setBusy(true);
    try {
      await deleteOfflinePhoto(localId);
      await loadPhotos(openDraft.localId);
      await refreshList();
      setStatus("Photo removed from this device.");
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    if (!openDraft) return;
    setBusy(true);
    setStatus("Syncing to Safety InSite…");
    try {
      const outcome = await syncOfflineDraft(openDraft.localId);
      const refreshed = await getOfflineDraft(openDraft.localId);
      if (refreshed) setOpenDraft(refreshed);
      await refreshList();
      await loadPhotos(openDraft.localId);
      setStatus(outcome.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function keepBoth() {
    if (!openDraft) return;
    setBusy(true);
    try {
      const next = await resolveConflictAsNewInspection(openDraft.localId);
      setOpenDraft(next);
      await refreshList();
      setStatus(
        "This draft is detached from the server record. Syncing now creates a separate inspection; the server copy is untouched.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function keepServer() {
    if (!openDraft) return;
    setBusy(true);
    try {
      const next = await acknowledgeServerCopy(openDraft.localId);
      setOpenDraft(next);
      await refreshList();
      setStatus("The server copy is kept. This local draft is marked resolved and can be removed.");
    } finally {
      setBusy(false);
    }
  }

  // Phase 9: a customer-owned copy of the draft, saved through the ordinary browser download to
  // Downloads/Files. Deliberately NOT presented as a report -- the customer-readable report is the
  // server-generated PDF, and this file is the raw capture record plus its schema version.
  async function exportDraft() {
    if (!openDraft) return;
    setBusy(true);
    try {
      const payload = await exportOfflineDraft(openDraft.localId);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `field-capture-${openDraft.localId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus(
        "Saved a JSON copy of this draft to your device. Photo files are not embedded; the report PDF is generated on the server.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The export could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDraft(localId: string) {
    setBusy(true);
    try {
      await deleteOfflineDraft(localId);
      if (openDraft?.localId === localId) setOpenDraft(null);
      await refreshList();
      setStatus("Draft removed from this device.");
    } finally {
      setBusy(false);
    }
  }

  async function removeEverything() {
    setBusy(true);
    try {
      const removed = await removeOfflineDataForCurrentUser();
      setOpenDraft(null);
      setPhotos([]);
      await refreshList();
      setStatus(
        `Removed ${removed.drafts} draft(s) and ${removed.photos} photo(s) for this account from this device.`,
      );
    } finally {
      setBusy(false);
    }
  }

  const unsyncedCount = useMemo(
    () => drafts.filter((draft) => draft.syncState !== "SYNCED").length,
    [drafts],
  );

  return (
    <section className="sentinel-mobile-page space-y-4">
      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Field capture"
          title="Record inspections with or without a connection"
          description="Observations, locations and photos are saved on this device as you record them, and stay here until you sync them to Safety InSite."
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            data-testid="connectivity"
            data-online={isOnline ? "true" : "false"}
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] ${
              isOnline
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          {unsyncedCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {unsyncedCount} not synced
            </span>
          )}
        </div>

        <p role="status" data-testid="field-capture-status" className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {status}
        </p>

        {/*
          The honest boundary, stated on the page itself rather than only in documentation.
          HazLenz analysis, risk scoring, findings, corrective actions and PDF reports are produced
          on the server. Nothing on this page analyses anything, and nothing here is presented as
          an analysis.
        */}
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
          HazLenz AI analysis, risk scoring, corrective actions and report generation run on Safety
          InSite&apos;s servers and need a connection. Field capture never analyses anything on the
          device.
        </p>
      </AppPanel>

      {ready && !available && (
        <AppPanel padding="lg">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{status}</p>
          <Link
            href="/login"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1D72B8] px-5 py-2 text-sm font-black text-white"
          >
            Sign in
          </Link>
        </AppPanel>
      )}

      {available && !openDraft && (
        <>
          <AppPanel padding="lg">
            <SectionHeader eyebrow="Start" title="New field inspection" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Title
                <input
                  aria-label="Draft title"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  maxLength={160}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
                />
              </label>
              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Site or area
                <input
                  aria-label="Site or area"
                  value={newSiteName}
                  onChange={(event) => setNewSiteName(event.target.value)}
                  maxLength={160}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
                />
              </label>
              <label className="sm:col-span-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Regulatory context
                <select
                  aria-label="Regulatory context"
                  value={newContext}
                  onChange={(event) => setNewContext(event.target.value as RegulatoryContext)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
                >
                  <option value="unknown" disabled>
                    Select regulatory context
                  </option>
                  {REGULATORY_CONTEXT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} · {option.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={createDraft}
              data-testid="create-draft"
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#1D72B8] px-5 py-2 text-sm font-black text-white transition hover:bg-[#155A92] active:scale-95 disabled:opacity-50 sm:w-auto"
            >
              Start capture on this device
            </button>
          </AppPanel>

          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="On this device"
              title="Saved drafts"
              description="These live on this device, for this account only. Signing in as a different account on this device shows that account's drafts, never these."
            />

            {drafts.length === 0 ? (
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                No drafts saved on this device yet.
              </p>
            ) : (
              <ul data-testid="draft-list" className="mt-3 flex flex-col gap-2">
                {drafts.map((draft) => (
                  <li
                    key={draft.localId}
                    data-local-id={draft.localId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-slate-100">
                        {draft.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {draft.siteName || "No site recorded"} ·{" "}
                        {regulatoryContextLabel(draft.regulatoryContext)} ·{" "}
                        {draft.observationCount} observation
                        {draft.observationCount === 1 ? "" : "s"}
                        {draft.photoCount ? ` · ${draft.photoCount} photo${draft.photoCount === 1 ? "" : "s"}` : ""}
                        {` · ${formatWhen(draft.updatedAt)}`}
                      </p>
                      <div className="mt-2">
                        <SyncBadge state={draft.syncState} />
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openDraftById(draft.localId)}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1D72B8] px-5 py-2 text-sm font-black text-white transition hover:bg-[#155A92] active:scale-95"
                      >
                        Open
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {drafts.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={removeEverything}
                className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-rose-700 underline underline-offset-4 disabled:opacity-50 dark:text-rose-300"
              >
                Remove this account&apos;s offline data from this device
              </button>
            )}
          </AppPanel>
        </>
      )}

      {available && openDraft && (
        <>
          <AppPanel padding="lg">
            <SectionHeader
              eyebrow={openDraft.siteName || "Field inspection"}
              title={openDraft.title}
              description={`${regulatoryContextLabel(openDraft.regulatoryContext)} · started ${formatWhen(openDraft.createdAt)}`}
              action={
                <button
                  type="button"
                  onClick={() => setOpenDraft(null)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Back to drafts
                </button>
              }
            />

            <div className="mt-3">
              <SyncBadge state={openDraft.syncState} />
            </div>

            {openDraft.syncError && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                {openDraft.syncError}
              </p>
            )}

            {openDraft.syncState === "CONFLICT" && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-800 dark:text-rose-200">
                  Choose what to do
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-rose-900 dark:text-rose-100">
                  Nothing on the server has been changed or overwritten. Keep this device&apos;s work
                  as a separate inspection, or keep the server copy.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={keepBoth}
                    data-testid="conflict-keep-both"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1D72B8] px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                  >
                    Keep both — sync as a new inspection
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={keepServer}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                  >
                    Keep the server copy
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy || !isOnline || openDraft.syncState === "CONFLICT"}
                onClick={sync}
                data-testid="sync-draft"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1D72B8] px-5 py-2 text-sm font-black text-white transition hover:bg-[#155A92] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isOnline ? "Sync to Safety InSite" : "Sync — needs a connection"}
              </button>
              {openDraft.remoteInspectionId && (
                <button
                  type="button"
                  disabled={!isOnline}
                  onClick={() => {
                    window.localStorage.setItem(
                      "sentinel_selected_inspection_context",
                      JSON.stringify({
                        persistedInspectionId: openDraft.remoteInspectionId,
                        persistedSiteId: openDraft.remoteSiteId || "",
                        persistenceState: "saved",
                        inspectionType: "quick_hazard_capture",
                        inspectionTitle: openDraft.title,
                        agency: regulatoryContextLabel(openDraft.regulatoryContext),
                        regulatoryContext: openDraft.regulatoryContext,
                        workflowDepth: "quick",
                      }),
                    );
                    router.push("/inspection-workspace");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
                >
                  Open in workspace for HazLenz review
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={exportDraft}
                data-testid="export-draft"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-black text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
              >
                Save a copy (JSON)
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => removeDraft(openDraft.localId)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-rose-300 px-5 py-2 text-sm font-black text-rose-700 disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-300"
              >
                Delete this draft
              </button>
            </div>
          </AppPanel>

          <AppPanel padding="lg">
            <SectionHeader eyebrow="Capture" title="What did you observe?" />

            <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Observation
              <textarea
                aria-label="Observation"
                data-testid="observation-input"
                value={observationText}
                onChange={(event) => setObservationText(event.target.value)}
                rows={5}
                maxLength={20000}
                placeholder="Describe the condition exactly as you see it."
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              />
            </label>

            <label className="mt-3 block text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Location or work area
              <input
                aria-label="Location or work area"
                data-testid="location-input"
                value={locationLabel}
                onChange={(event) => setLocationLabel(event.target.value)}
                maxLength={200}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={saveObservation}
                data-testid="save-observation"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1D72B8] px-5 py-2 text-sm font-black text-white transition hover:bg-[#155A92] active:scale-95 disabled:opacity-50"
              >
                {editingObservationId ? "Save change on this device" : "Save on this device"}
              </button>
              {editingObservationId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingObservationId(null);
                    setObservationText("");
                    setLocationLabel("");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-black text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <label className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
              Photo evidence
              <input
                type="file"
                accept="image/*"
                aria-label="Photo evidence"
                data-testid="photo-input"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  event.target.value = "";
                  void addPhoto(file);
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              />
            </label>

            {photos.length > 0 && (
              <ul data-testid="photo-list" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((photo) => (
                  <li
                    key={photo.localId}
                    className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"
                  >
                    {photoUrls[photo.localId] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrls[photo.localId]}
                        alt={photo.fileName}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-24 w-full rounded-lg bg-slate-100 dark:bg-white/10" />
                    )}
                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {photo.fileName}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                      {photo.remoteEvidenceId ? "Uploaded" : "On this device"}
                    </p>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.localId)}
                      className="mt-1 text-[11px] font-black text-rose-700 underline underline-offset-2 dark:text-rose-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AppPanel>

          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="Recorded"
              title={`${openDraft.observations.length} observation${openDraft.observations.length === 1 ? "" : "s"}`}
            />
            {openDraft.observations.length === 0 ? (
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Nothing recorded yet.
              </p>
            ) : (
              <ul data-testid="observation-list" className="mt-3 flex flex-col gap-2">
                {openDraft.observations.map((observation) => (
                  <li
                    key={observation.localId}
                    data-observation-id={observation.localId}
                    className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700"
                  >
                    <p className="whitespace-pre-wrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {observation.text}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {observation.locationLabel || "No location recorded"} ·{" "}
                      {formatWhen(observation.updatedAt)} ·{" "}
                      {observation.remoteObservationId ? "Synced" : "On this device"}
                    </p>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingObservationId(observation.localId);
                          setObservationText(observation.text);
                          setLocationLabel(observation.locationLabel);
                        }}
                        className="text-xs font-black text-[#1D72B8] underline underline-offset-2 dark:text-[#5DB7FF]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteObservation(observation.localId)}
                        className="text-xs font-black text-rose-700 underline underline-offset-2 dark:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AppPanel>
        </>
      )}
    </section>
  );
}
