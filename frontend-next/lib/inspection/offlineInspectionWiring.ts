import {
  createLocalFinding,
  createOfflineInspection,
  enqueueInspectionSyncItem,
  getLocalInspection,
  upsertLocalFinding,
  upsertLocalInspection,
  type JurisdictionHint,
} from "./offlineInspectionStore";

const ACTIVE_LOCAL_INSPECTION_KEY = "insite_active_local_inspection_id";

export function getJurisdictionHintFromAgencyMode(mode: string): JurisdictionHint {
  if (mode.startsWith("msha")) return "MSHA";
  if (mode === "osha_construction") return "OSHA_CONSTRUCTION";
  if (mode === "osha_general") return "OSHA_GI";
  return "UNSURE";
}

function normalizeFivePointScore(
  value: number | null,
): 1 | 2 | 3 | 4 | 5 | undefined {
  if ([1, 2, 3, 4, 5].includes(Number(value))) {
    return Number(value) as 1 | 2 | 3 | 4 | 5;
  }

  return undefined;
}

export function ensureActiveLocalInspection(input: {
  activeLocalInspectionId: string | null;
  setActiveLocalInspectionId: (value: string) => void;
  inspectionContext: any;
  inspectionMode: "quick" | "advanced";
  agencyMode: string;
}) {
  if (typeof window === "undefined") return null;

  const existingId =
    input.activeLocalInspectionId ||
    window.localStorage.getItem(ACTIVE_LOCAL_INSPECTION_KEY);

  if (existingId) {
    const existingInspection = getLocalInspection(existingId);

    if (existingInspection) {
      input.setActiveLocalInspectionId(existingInspection.localId);
      return existingInspection.localId;
    }
  }

  const nextInspection = createOfflineInspection({
    title:
      input.inspectionContext?.inspectionType === "quick_hazard_capture"
        ? "Quick Hazard Capture"
        : "Field Inspection",
    siteName: input.inspectionContext?.siteName || "",
    inspectionType: input.inspectionContext?.inspectionType || input.inspectionMode,
    jurisdictionHint: getJurisdictionHintFromAgencyMode(input.agencyMode),
  });

  const savedInspection = upsertLocalInspection(nextInspection);

  window.localStorage.setItem(
    ACTIVE_LOCAL_INSPECTION_KEY,
    savedInspection.localId,
  );

  input.setActiveLocalInspectionId(savedInspection.localId);

  return savedInspection.localId;
}

export function persistOfflineFindingSnapshot(input: {
  finding: any;
  activeLocalInspectionId: string | null;
  setActiveLocalInspectionId: (value: string) => void;
  inspectionContext: any;
  inspectionMode: "quick" | "advanced";
  agencyMode: string;
  riskScore: number | null;
}) {
  const inspectionLocalId = ensureActiveLocalInspection({
    activeLocalInspectionId: input.activeLocalInspectionId,
    setActiveLocalInspectionId: input.setActiveLocalInspectionId,
    inspectionContext: input.inspectionContext,
    inspectionMode: input.inspectionMode,
    agencyMode: input.agencyMode,
  });

  if (!inspectionLocalId) return null;

  const finding = input.finding;

  const localFinding = createLocalFinding({
    inspectionLocalId,
    observationText:
      finding.description ||
      finding.safeScopeResult?.classification ||
      "Inspection finding",
    locationLabel: finding.location || "",
    photoLocalIds: (finding.photos || [])
      .map((photo: any) => photo.id)
      .filter(Boolean),
    severity: normalizeFivePointScore(finding.severity),
    likelihood: normalizeFivePointScore(finding.likelihood),
    userHazardLabel: finding.hazardCategory || "",
    userCorrectiveAction:
      finding.correctiveActions?.[0]?.title ||
      finding.correctiveActions?.[0]?.description ||
      "",
    reviewerNotes: finding.evidenceNotes || "",
    hazlenzLocalResult:
      finding.safeScopeResult?.offlineFallback ||
      finding.safeScopeResult?.mode === "offline_limited_advisory"
        ? {
            mode: "local_fallback",
            likelyHazardFamily:
              finding.safeScopeResult?.classification ||
              finding.safeScopeResult?.hazardFamily ||
              finding.hazardCategory ||
              "",
            jurisdictionHint: getJurisdictionHintFromAgencyMode(input.agencyMode),
            riskHint: input.riskScore && input.riskScore >= 15 ? "high" : "review",
            evidenceQuestions:
              finding.safeScopeResult?.missingCriticalInformation ||
              finding.safeScopeResult?.evidenceGaps ||
              [],
            correctiveActionDraft: (finding.correctiveActions || [])
              .map((action: any) => action.title || action.description)
              .filter(Boolean),
            cloudReviewRecommended: true,
          }
        : undefined,
  });

  const savedLocalFinding = upsertLocalFinding({
    ...localFinding,
    remoteId: String(finding.id || ""),
    hazlenzStatus: finding.safeScopeResult
      ? localFinding.hazlenzStatus === "local_fallback"
        ? "local_fallback"
        : "cloud_completed"
      : "not_run",
    hazlenzCloudResult:
      finding.safeScopeResult && !finding.safeScopeResult?.offlineFallback
        ? finding.safeScopeResult
        : undefined,
    syncStatus: "queued",
  });

  enqueueInspectionSyncItem({
    entityType: "finding",
    entityLocalId: savedLocalFinding.localId,
    action: "create",
  });

  return savedLocalFinding;
}
