const OFFLINE_INSPECTIONS_KEY = "insite_offline_inspections_v1";
const OFFLINE_REPORT_DRAFTS_KEY = "insite_offline_report_drafts_v1";
const OFFLINE_INSPECTION_SYNC_QUEUE_KEY = "insite_offline_inspection_sync_queue_v1";

export type OfflineSyncStatus =
  | "local_only"
  | "queued"
  | "syncing"
  | "synced"
  | "sync_error";

export type LocalInspectionStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "synced"
  | "finalized";

export type JurisdictionHint =
  | "MSHA"
  | "OSHA_GI"
  | "OSHA_CONSTRUCTION"
  | "UNSURE";

export type LocalInspection = {
  localId: string;
  remoteId?: string;

  title: string;
  siteName?: string;
  inspectionType?: string;
  jurisdictionHint?: JurisdictionHint;

  status: LocalInspectionStatus;

  startedAt: string;
  updatedAt: string;
  completedAt?: string;

  syncStatus: OfflineSyncStatus;
};

export type LocalPhoto = {
  localId: string;
  remoteId?: string;
  findingLocalId: string;

  localUri: string;
  thumbnailUri?: string;

  caption?: string;
  capturedAt: string;

  syncStatus: OfflineSyncStatus;
};

export type LocalHazLenzResult = {
  mode: "local_fallback";
  likelyHazardFamily?: string;
  mechanism?: string;
  jurisdictionHint?: JurisdictionHint;
  riskHint?: "low" | "medium" | "high" | "critical" | "review";
  evidenceQuestions?: string[];
  correctiveActionDraft?: string[];
  cloudReviewRecommended: boolean;
};

export type CloudHazLenzResult = Record<string, any>;

export type LocalFinding = {
  localId: string;
  remoteId?: string;
  inspectionLocalId: string;

  observationText: string;
  locationLabel?: string;
  photoLocalIds: string[];

  severity?: 1 | 2 | 3 | 4 | 5;
  likelihood?: 1 | 2 | 3 | 4 | 5;

  userHazardLabel?: string;
  userCorrectiveAction?: string;
  reviewerNotes?: string;

  hazlenzStatus:
    | "not_run"
    | "local_fallback"
    | "queued_for_cloud"
    | "cloud_completed"
    | "error";

  hazlenzLocalResult?: LocalHazLenzResult;
  hazlenzCloudResult?: CloudHazLenzResult;

  createdAt: string;
  updatedAt: string;

  syncStatus: OfflineSyncStatus;
};

export type ReportDraftStatus = "draft" | "ready_for_review" | "finalized";

export type ReportFindingBlock = {
  findingLocalId: string;

  title: string;
  location?: string;
  observation: string;
  hazardFamily?: string;
  riskSummary?: string;
  possibleStandardArea?: string;
  correctiveAction?: string;
  photos: string[];
  reviewerNotes?: string;
  evidenceGaps?: string[];
};

export type ReportDraft = {
  localId: string;
  inspectionLocalId: string;

  title: string;
  siteName?: string;
  inspectionDate: string;
  inspectorName?: string;

  executiveSummaryDraft?: string;

  findingOrder: string[];
  findingBlocks?: ReportFindingBlock[];

  status: ReportDraftStatus;

  generatedOffline: boolean;
  syncStatus: OfflineSyncStatus;

  createdAt: string;
  updatedAt: string;
};

export type InspectionSyncQueueItem = {
  id: string;
  entityType: "inspection" | "finding" | "photo" | "report";
  entityLocalId: string;
  action: "create" | "update" | "delete" | "upload_photo";
  attemptCount: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  status: "queued" | "processing" | "failed" | "completed";
  createdAt: string;
};

type OfflineInspectionState = {
  inspections: LocalInspection[];
  findings: LocalFinding[];
  photos: LocalPhoto[];
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function createLocalId(prefix: string) {
  const cryptoId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${cryptoId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createOfflineInspection(input: {
  title: string;
  siteName?: string;
  inspectionType?: string;
  jurisdictionHint?: JurisdictionHint;
}): LocalInspection {
  const now = new Date().toISOString();

  return {
    localId: createLocalId("inspection"),
    title: input.title || "Field Inspection",
    siteName: input.siteName || "",
    inspectionType: input.inspectionType || "",
    jurisdictionHint: input.jurisdictionHint || "UNSURE",
    status: "in_progress",
    startedAt: now,
    updatedAt: now,
    syncStatus: "local_only",
  };
}

export function getOfflineInspectionState(): OfflineInspectionState {
  return readJson<OfflineInspectionState>(OFFLINE_INSPECTIONS_KEY, {
    inspections: [],
    findings: [],
    photos: [],
  });
}

export function setOfflineInspectionState(state: OfflineInspectionState) {
  writeJson(OFFLINE_INSPECTIONS_KEY, {
    inspections: Array.isArray(state.inspections) ? state.inspections : [],
    findings: Array.isArray(state.findings) ? state.findings : [],
    photos: Array.isArray(state.photos) ? state.photos : [],
  });
}

export function listLocalInspections() {
  return getOfflineInspectionState().inspections;
}

export function getLocalInspection(localId: string) {
  return getOfflineInspectionState().inspections.find(
    (inspection) => inspection.localId === localId,
  );
}

export function upsertLocalInspection(inspection: LocalInspection) {
  const state = getOfflineInspectionState();
  const now = new Date().toISOString();

  const nextInspection = {
    ...inspection,
    updatedAt: now,
  };

  const existingIndex = state.inspections.findIndex(
    (item) => item.localId === inspection.localId,
  );

  const inspections =
    existingIndex >= 0
      ? state.inspections.map((item, index) =>
          index === existingIndex ? nextInspection : item,
        )
      : [nextInspection, ...state.inspections];

  setOfflineInspectionState({
    ...state,
    inspections,
  });

  return nextInspection;
}

export function listLocalFindings(inspectionLocalId: string) {
  return getOfflineInspectionState().findings.filter(
    (finding) => finding.inspectionLocalId === inspectionLocalId,
  );
}

export function upsertLocalFinding(finding: LocalFinding) {
  const state = getOfflineInspectionState();
  const now = new Date().toISOString();

  const nextFinding = {
    ...finding,
    updatedAt: now,
  };

  const existingIndex = state.findings.findIndex(
    (item) => item.localId === finding.localId,
  );

  const findings =
    existingIndex >= 0
      ? state.findings.map((item, index) =>
          index === existingIndex ? nextFinding : item,
        )
      : [nextFinding, ...state.findings];

  setOfflineInspectionState({
    ...state,
    findings,
  });

  return nextFinding;
}

export function createLocalFinding(input: {
  inspectionLocalId: string;
  observationText: string;
  locationLabel?: string;
  photoLocalIds?: string[];
  severity?: 1 | 2 | 3 | 4 | 5;
  likelihood?: 1 | 2 | 3 | 4 | 5;
  userHazardLabel?: string;
  userCorrectiveAction?: string;
  reviewerNotes?: string;
  hazlenzLocalResult?: LocalHazLenzResult;
}): LocalFinding {
  const now = new Date().toISOString();

  return {
    localId: createLocalId("finding"),
    inspectionLocalId: input.inspectionLocalId,
    observationText: input.observationText,
    locationLabel: input.locationLabel || "",
    photoLocalIds: input.photoLocalIds || [],
    severity: input.severity,
    likelihood: input.likelihood,
    userHazardLabel: input.userHazardLabel || "",
    userCorrectiveAction: input.userCorrectiveAction || "",
    reviewerNotes: input.reviewerNotes || "",
    hazlenzStatus: input.hazlenzLocalResult ? "local_fallback" : "not_run",
    hazlenzLocalResult: input.hazlenzLocalResult,
    createdAt: now,
    updatedAt: now,
    syncStatus: "local_only",
  };
}

export function listReportDrafts() {
  return readJson<ReportDraft[]>(OFFLINE_REPORT_DRAFTS_KEY, []);
}

export function upsertReportDraft(draft: ReportDraft) {
  const now = new Date().toISOString();
  const existing = listReportDrafts();

  const nextDraft = {
    ...draft,
    updatedAt: now,
  };

  const found = existing.some((item) => item.localId === draft.localId);
  const next = found
    ? existing.map((item) => (item.localId === draft.localId ? nextDraft : item))
    : [nextDraft, ...existing];

  writeJson(OFFLINE_REPORT_DRAFTS_KEY, next);
  return nextDraft;
}

export function createReportDraft(input: {
  inspectionLocalId: string;
  title: string;
  siteName?: string;
  inspectionDate?: string;
  inspectorName?: string;
  findingOrder?: string[];
  findingBlocks?: ReportFindingBlock[];
  generatedOffline?: boolean;
}): ReportDraft {
  const now = new Date().toISOString();

  return {
    localId: createLocalId("report-draft"),
    inspectionLocalId: input.inspectionLocalId,
    title: input.title || "Inspection Report Draft",
    siteName: input.siteName || "",
    inspectionDate: input.inspectionDate || now.slice(0, 10),
    inspectorName: input.inspectorName || "",
    findingOrder: input.findingOrder || [],
    findingBlocks: input.findingBlocks || [],
    status: "draft",
    generatedOffline: input.generatedOffline ?? true,
    syncStatus: "local_only",
    createdAt: now,
    updatedAt: now,
  };
}

export function getInspectionSyncQueue() {
  return readJson<InspectionSyncQueueItem[]>(
    OFFLINE_INSPECTION_SYNC_QUEUE_KEY,
    [],
  );
}

export function setInspectionSyncQueue(items: InspectionSyncQueueItem[]) {
  writeJson(OFFLINE_INSPECTION_SYNC_QUEUE_KEY, items);
}

export function enqueueInspectionSyncItem(
  item: Omit<InspectionSyncQueueItem, "id" | "createdAt" | "attemptCount" | "status">,
) {
  const now = new Date().toISOString();
  const queue = getInspectionSyncQueue();

  const next: InspectionSyncQueueItem = {
    id: createLocalId("sync"),
    createdAt: now,
    attemptCount: 0,
    status: "queued",
    ...item,
  };

  setInspectionSyncQueue([next, ...queue]);
  return next;
}
