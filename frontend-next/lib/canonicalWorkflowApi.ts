import { authHeaders, getAuthToken } from "./auth";
import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "./safescope";

export type PersistedSite = {
  id: string;
  name: string;
  organizationId: string | null;
  ownerUserId: string | null;
  archivedAt: string | null;
};

/**
 * Inspection-level regulatory context, established ONCE at inspection setup and inherited by
 * every observation/finding. Same vocabulary HazLenz's evidence model uses. `unknown` remains
 * supported for legacy and incomplete records, but new inspections require an explicit context.
 */
export type RegulatoryContext = "osha-general-industry" | "osha-construction" | "msha" | "unknown";

export const REGULATORY_CONTEXT_OPTIONS: Array<{ value: RegulatoryContext; label: string; description: string }> = [
  { value: "osha-general-industry", label: "OSHA — General Industry", description: "29 CFR 1910" },
  { value: "osha-construction", label: "OSHA — Construction", description: "29 CFR 1926" },
  { value: "msha", label: "MSHA", description: "30 CFR mining" },
];

export function regulatoryContextLabel(value: string | null | undefined) {
  return REGULATORY_CONTEXT_OPTIONS.find((option) => option.value === value)?.label || "Regulatory context not established";
}

/** Maps the Settings page's stored default (`sentinel_regulatory_scope`) onto the inspection vocabulary. */
export function regulatoryContextFromSettingsScope(scope: string | null | undefined): RegulatoryContext {
  switch (scope) {
    case "msha": return "msha";
    case "osha_general": return "osha-general-industry";
    case "osha_construction": return "osha-construction";
    default: return "unknown";
  }
}

export type PersistedInspection = {
  id: string;
  siteId: string;
  title: string;
  /**
   * The customer-facing record number, rendered as "Inspection #7". Per-account and allocated at
   * creation; it is not derived from `id`, it is not a checksum, and nothing authorizes on it.
   * Null only for a record created before the number existed and never backfilled.
   */
  displayNumber?: number | null;
  status: "draft" | "in_review" | "completed" | "archived";
  /**
   * Optimistic-locking counter for the inspection record. INTERNAL: it is passed back on writes to
   * detect a concurrent edit and is never shown to the customer as a version of anything.
   */
  version: number;
  regulatoryContext?: RegulatoryContext;
  completedAt?: string | null;
  updatedAt: string;
  observations?: PersistedObservation[];
  findings?: PersistedFinding[];
};

/** "Inspection #7", or an empty string when the record predates record numbers. */
export function inspectionRecordLabel(inspection: { displayNumber?: number | null } | null | undefined) {
  return inspection?.displayNumber ? `Inspection #${inspection.displayNumber}` : "";
}

export type PersistedFinding = {
  id: string;
  observationId: string;
  inspectionId: string;
  selectedAnalysisId: string | null;
  originatingAnalysisId: string | null;
  hazardKey: string;
  segmentKey: string;
  hazardCategory: string | null;
  conclusion: string;
  status: "pending_review" | "finalized" | "dismissed" | "superseded";
  /**
   * Where the finding came from. 'user_authored' means the INSPECTOR identified this hazard and
   * HazLenz did not propose it -- such a finding carries no HazLenz confidence and no citation the
   * engine did not independently produce, so anything presenting regulatory support must check it.
   */
  source?: "hazlenz_decomposition" | "user_authored";
  finalReviewId?: string | null;
  revision: number;
  sourceCandidate: Record<string, unknown> | null;
  riskSnapshot: Record<string, unknown> | null;
  createdAt: string;
};

export type PersistedObservation = {
  id: string;
  rawText: string;
  evidenceSource: string;
  version: number;
  analyses?: Array<{ id: string; resultSnapshot: Record<string, unknown>; requestVersion?: number; status?: "current" | "superseded" }>;
  reviews?: Array<{ id: string; decision: string; rationale: string }>;
};

/**
 * One card in the report library. An inspection has ONE report, so there is no version array:
 * finishing a reopened inspection replaces the report rather than adding a version beside it.
 */
export type PersistedReport = {
  id: string;
  inspectionId: string;
  createdAt: string;
  /** When the downloadable artifact was last produced. Distinct from the inspection's completion. */
  reportUpdatedAt: string | null;
  status: string;
  /** Integrity metadata for technical details only. Never the record's identity. */
  checksum: string | null;
  sizeBytes: string | null;
  /** Human-readable inspection context for the report list. */
  inspection?: {
    id: string;
    /** The customer-facing record number, e.g. 7 renders as "Inspection #7". */
    displayNumber: number | null;
    title: string;
    status: string;
    regulatoryContext: RegulatoryContext;
    completedAt: string | null;
    siteName: string | null;
    findingCount: number;
  } | null;
};

export type HazLenzEvidenceFact = {
  id: string;
  type: string;
  value: string | number | boolean | string[] | null;
  source: string;
  confidence: number;
  status: string;
  temporalState: string;
  reviewerStatus: string;
};

export type HazLenzAnalysisResult = Record<string, unknown> & {
  /** The regulatory context HazLenz actually evaluated under, with honest provenance. */
  regulatoryContext?: {
    value: RegulatoryContext;
    provenance: "USER_CONFIRMED" | "HAZLENZ_INFERRED" | "UNKNOWN";
    source?: "inspection" | "request" | "observation_evidence";
    inspectionId?: string;
    basis?: string[];
  };
  guidedFinding?: {
    contractVersion: string;
    observedCondition: string;
    hazardCategory: string;
    primaryStandard: null | {
      citation: string;
      title: string;
      agency: string;
      simplifiedRequirement: string;
      whyOffered: string;
      confidence: number;
      confidenceLabel: "High" | "Moderate" | "Low";
      applicability: "direct" | "candidate";
      evidenceSupporting: string[];
      evidenceMissing: string[];
      sourceStatus: string;
      confidenceLimitReason?: string | null;
    };
    additionalStandards: Array<{
      citation: string;
      title: string;
      applicability: "direct" | "candidate";
      whyOffered: string;
      evidenceMissing: string[];
    }>;
    clarificationQuestions: Array<{
      id: string;
      question: string;
      reason: string;
      options: string[];
      materialTo: string[];
      priority?: string;
      /** Advisory presentation flag from HazLenz; no question ever blocks review/finalization. */
      decisionCritical?: boolean;
      scope?: "inspection" | "finding" | string;
    }>;
    riskAssessment: {
      severity: string;
      likelihood: string;
      exposure: string;
      overallRisk: string;
      riskLevel: string;
      provisional: boolean;
      rationale: string;
      reviewerConfirmed: boolean;
    };
    correctiveAction: {
      immediateAction: string;
      permanentCorrection: string;
      verificationStep: string;
      responsibleRole: string;
      urgency: string;
      rationale: string;
    };
    reviewStatus: { status: string; reviewerConfirmed: boolean; editableFields: string[] };
    findingCandidates?: Array<{
      citation: string;
      family: string;
      applicability: "direct" | "candidate";
      evidenceFactIds: string[];
    }>;
    multiHazardReview?: { requiresSplitReview: boolean; instruction: string };
    limitations: string[];
    provenance: { evidenceSnapshotId: string | null; rulesRelease: string | null; deterministicInputHash: string };
  };
  evidenceSnapshot?: {
    id: string;
    schemaVersion: string;
    facts: HazLenzEvidenceFact[];
    criticalUnknowns: string[];
    contradictions: HazLenzEvidenceFact[];
  };
  applicabilityDecisions?: Array<{
    citation: string;
    family: string;
    status: "SUPPORTED" | "NOT_SUPPORTED" | "CONTRADICTED" | "UNKNOWN" | "NOT_APPLICABLE";
    explanation: string;
    missingPredicates: string[];
  }>;
  clarificationQuestions?: Array<{
    id: string;
    question: string;
    options?: string[];
  }>;
};

/**
 * `NON_IDEMPOTENT` disables apiFetch's transport-level retry.
 *
 * apiFetch retries once when the request THROWS (timeout or connection loss). For a GET, or for a
 * POST that carries an idempotency key, that is safe and desirable. For a create that carries no
 * key it is a duplicate factory: the server can commit the row and the response can still be lost,
 * and the automatic retry then creates a second one. Measured, not theorised -- an interrupted
 * offline sync produced TWO server inspections from one user action, because the retry fired
 * before any client code could observe the failure.
 *
 * These calls now DO carry a client-supplied `clientRequestId`, and the server resolves it to the
 * row it already created, so a transport retry would no longer duplicate. The no-retry policy is
 * kept anyway: it applies to every caller including the ones that send no identifier (the whole
 * online path), and a create that is idempotent at the server is still better not repeated blindly
 * at the transport layer, where nothing can observe or report what happened.
 */
const NON_IDEMPOTENT = { retries: 0 } as const;

async function apiJson<T>(
  path: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; retries?: number },
): Promise<T> {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  }, options);
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "The server could not save this change.");
  }
  return response.json() as Promise<T>;
}

export async function listPersistedSites() {
  return apiJson<{ data: PersistedSite[]; meta: { total: number } }>("/sites?limit=100");
}

export async function createPersistedSite(name: string) {
  return apiJson<PersistedSite>("/sites", {
    method: "POST",
    body: JSON.stringify({ name }),
  }, NON_IDEMPOTENT);
}

export async function updatePersistedSite(id: string, name: string) {
  return apiJson<PersistedSite>(`/sites/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function deletePersistedSite(id: string) {
  return apiJson<PersistedSite>(`/sites/${id}`, {
    method: "DELETE",
  });
}

export async function listPersistedInspections() {
  return apiJson<PersistedInspection[]>("/inspections");
}

export async function createPersistedInspection(input: {
  siteId: string;
  title: string;
  regulatoryContext?: RegulatoryContext;
  /**
   * Stable, client-minted identity for this inspection, replayed unchanged on every attempt.
   * The server resolves it to the row it already created FOR THIS USER, so a create whose response
   * was lost cannot become a duplicate. Omitting it keeps the original non-idempotent behaviour.
   */
  clientRequestId?: string;
}) {
  return apiJson<PersistedInspection>("/inspections", {
    method: "POST",
    body: JSON.stringify(input),
  }, NON_IDEMPOTENT);
}

/** Persists a change to the inspection-level regulatory context (optimistic-version guarded). */
export async function updatePersistedInspectionRegulatoryContext(
  inspectionId: string,
  regulatoryContext: RegulatoryContext,
  version: number,
) {
  return apiJson<PersistedInspection>(`/inspections/${encodeURIComponent(inspectionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ regulatoryContext, version }),
  });
}

export async function getPersistedInspection(id: string) {
  return apiJson<PersistedInspection>(`/inspections/${encodeURIComponent(id)}`);
}

export async function addPersistedObservation(
  inspectionId: string,
  rawText: string,
  /** See createPersistedInspection.clientRequestId. Scoped to this inspection and this user. */
  clientRequestId?: string,
) {
  return apiJson<PersistedObservation>(`/inspections/${encodeURIComponent(inspectionId)}/observations`, {
    method: "POST",
    body: JSON.stringify({
      rawText,
      evidenceSource: "direct_observation",
      ...(clientRequestId ? { clientRequestId } : {}),
    }),
  }, NON_IDEMPOTENT);
}

export async function updatePersistedObservation(observationId: string, rawText: string, version: number) {
  return apiJson<PersistedObservation>(`/inspections/observations/${encodeURIComponent(observationId)}`, {
    method: "PATCH",
    body: JSON.stringify({ rawText, version }),
  });
}

export async function uploadInspectionEvidence(
  inspectionId: string,
  file: File,
  /**
   * See createPersistedInspection.clientRequestId. This route is multipart, so the identifier
   * travels as a form FIELD rather than in a JSON body.
   */
  clientRequestId?: string,
) {
  const data = new FormData();
  data.append("file", file);
  if (clientRequestId) data.append("clientRequestId", clientRequestId);
  const token = getAuthToken();
  const response = await apiFetch(
    `${API_BASE_URL}/inspections/${encodeURIComponent(inspectionId)}/evidence`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    },
    NON_IDEMPOTENT,
  );
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "The evidence file could not be stored.");
  }
  return response.json() as Promise<{ id: string; contentType: string; sizeBytes: number; sha256: string }>;
}

export async function analyzeObservation(
  text: string,
  input: {
    /**
     * Persisted inspection this observation belongs to. The backend loads the inspection's own
     * regulatoryContext and applies it authoritatively to this analysis, so the client never has
     * to resend a fragile jurisdiction string per finding.
     */
    inspectionId?: string;
    evidenceSnapshot?: HazLenzAnalysisResult["evidenceSnapshot"];
    clarificationAnswers?: Array<{ questionId: string; answer: string }>;
    structuredObservation?: {
      narrative: string;
      jurisdiction: "msha" | "osha-general-industry" | "osha-construction" | "unknown";
      workArea?: string;
      taskBeingPerformed?: string;
      evidenceSource: Array<"visual" | "worker-report" | "document" | "photo" | "measurement">;
      controlsPresent: string[];
      controlsMissing: string[];
      unknownFacts: string[];
      unresolvedContradictions: Array<Record<string, unknown>>;
      userConfirmedFacts: Array<Record<string, unknown>>;
    };
  } = {},
) {
  return apiJson<HazLenzAnalysisResult>("/safescope-v2/classify", {
    method: "POST",
    body: JSON.stringify({ text, scopes: ["all"], ...input }),
  });
}

export async function saveAnalysisSnapshot(
  observationId: string,
  resultSnapshot: Record<string, unknown>,
  request: { idempotencyKey: string; requestVersion: number },
) {
  return apiJson<{ id: string }>(`/inspections/observations/${encodeURIComponent(observationId)}/analyses`, {
    method: "POST",
    body: JSON.stringify({ engineVersion: "hazlenz-production", resultSnapshot, ...request }),
  });
}

export async function saveHumanReview(
  observationId: string,
  input: {
    findingId?: string;
    idempotencyKey?: string;
    analysisId: string;
    decision: "accepted" | "edited" | "overridden" | "dismissed";
    rationale: string;
    reviewedConclusion?: Record<string, unknown>;
  },
) {
  return apiJson<{
    id: string;
    reviewedConclusion?: {
      riskPolicy?: {
        modelVersion: string;
        riskLevel: string;
        priority: "low" | "medium" | "high" | "urgent";
        dueDays: number;
        closeoutEvidenceRequired: boolean;
      };
    };
  }>(`/inspections/observations/${encodeURIComponent(observationId)}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function finalizePersistedFinding(
  observationId: string,
  input: {
    reviewId: string;
    hazardCategory?: string;
    conclusion: string;
    segmentKey?: string;
    sourceCandidate?: Record<string, unknown>;
    reviewerDisposition?: "single" | "split" | "merged";
    riskAssessment?: Record<string, unknown>;
  },
) {
  return apiJson<{ id: string }>(`/inspections/observations/${encodeURIComponent(observationId)}/findings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Record a hazard the INSPECTOR identified that HazLenz did not propose.
 *
 * Creates a real `pending_review` finding against the existing observation, which then goes through
 * the same risk / review / save path as any other finding. Deliberately carries no citation,
 * confidence or risk: a finding does not acquire regulatory support because a customer named a
 * hazard, and the server does not accept any such field here.
 */
export async function createUserAuthoredFinding(
  observationId: string,
  input: { hazardTitle: string; detail?: string },
) {
  return apiJson<PersistedFinding>(
    `/inspections/observations/${encodeURIComponent(observationId)}/user-findings`,
    { method: "POST", body: JSON.stringify(input) },
    NON_IDEMPOTENT,
  );
}

export async function transitionPersistedInspection(
  inspectionId: string,
  status: "draft" | "in_review" | "completed" | "archived",
  version: number,
) {
  return apiJson<PersistedInspection>(`/inspections/${encodeURIComponent(inspectionId)}/transition`, {
    method: "POST",
    body: JSON.stringify({ status, version }),
  });
}

/**
 * The server's own answer to "can this inspection be finished?".
 *
 * Evaluated by the SAME method `transition` enforces, so the Finish screen shows exactly what the
 * server would do rather than a frontend approximation that can drift from it. Frontend readiness
 * is UX only -- the server still enforces the contract independently on the transition itself.
 */
export type CompletionReadiness = {
  ready: boolean;
  reasons: string[];
  message: string;
  findingCount: number;
  reviewedCount: number;
  /** Customer-facing count: finalized findings only, excluding dismissed candidates. */
  reportableCount: number;
  blockingFindingIds: string[];
};

export async function getCompletionReadiness(inspectionId: string) {
  return apiJson<CompletionReadiness>(
    `/inspections/${encodeURIComponent(inspectionId)}/completion-readiness`,
  );
}

export async function createPersistedCorrectiveAction(input: {
  inspectionId: string;
  findingId: string;
  title: string;
  description: string;
  priorityCode: "low" | "medium" | "high" | "urgent";
  /**
   * Descriptive responsible party, as the customer typed it. OMITTED means unassigned -- the
   * server does not substitute the caller, and the report renders a missing owner as "Unassigned"
   * rather than naming the inspector. This is report metadata, not an account assignment.
   */
  assignedToName?: string;
}) {
  return apiJson<Record<string, unknown>>("/actions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createPersistedTask(input: {
  inspectionId: string;
  correctiveActionId?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
}) {
  return apiJson<Record<string, unknown>>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Finish an inspection's report. Generating again after a reopen REPLACES the current report; the
 * customer is never presented with a version history and never chooses between report versions.
 */
export async function generatePersistedReport(inspectionId: string) {
  return apiJson<InspectionReportSummary>(
    `/inspections/${encodeURIComponent(inspectionId)}/reports`,
    { method: "POST" },
  );
}

/**
 * The one current report for an inspection.
 *
 * `versionId`/`version` are the server's INTERNAL snapshot identity, carried here only so
 * diagnostics can quote them. No product surface renders them: the customer's identity for this
 * record is the inspection's number, and the checksum is integrity metadata under technical details.
 */
export type InspectionReportSummary = {
  reportId: string;
  inspectionId: string;
  versionId: string;
  version: number;
  status: string;
  /** When the downloadable artifact was last produced. */
  reportUpdatedAt: string | null;
  generatedAt: string | null;
  /** The inspection's customer-facing record number, and when the inspection itself was completed. */
  inspectionNumber: number | null;
  inspectionCompletedAt: string | null;
  checksum: string | null;
  sizeBytes: string | null;
  generatorVersion: string | null;
  failureReason: string | null;
};

export async function getReportForInspection(inspectionId: string) {
  return apiJson<InspectionReportSummary | null>(
    `/inspections/${encodeURIComponent(inspectionId)}/report`,
  );
}

export async function listPersistedReports() {
  return apiJson<PersistedReport[]>("/inspection-reports");
}

/** No version segment: an inspection has one report, so there is nothing to choose between. */
export function persistedReportDownloadUrl(reportId: string) {
  return `${API_BASE_URL}/inspection-reports/${encodeURIComponent(reportId)}/download`;
}

export async function downloadPersistedReport(reportId: string) {
  const response = await apiFetch(persistedReportDownloadUrl(reportId), {
    headers: authHeaders(),
  });
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "The report could not be downloaded.");
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/pdf")) {
    throw new Error("The server returned an invalid report artifact.");
  }
  return response.blob();
}

export type RegulatorySectionRecord = {
  citation: string;
  heading: string | null;
  textPlain: string | null;
  agencyCode: string;
  titleNumber: string;
  part: string;
  section: string;
  // "exact": the corpus has this precise citation. "parent-section": the corpus only
  // has the containing section (our ingestion is section-granularity, not paragraph/
  // subsection-granularity) -- the caller MUST disclose this, never present it as if
  // it were the exact cited text (see STANDARDS_TEXT_FOUNDATION.md).
  matchScope: "exact" | "parent-section";
};

async function fetchRegulatorySectionByCitation(citation: string) {
  try {
    const record = await apiJson<Omit<RegulatorySectionRecord, "matchScope"> | null>(
      `/regulatory/section?citation=${encodeURIComponent(citation)}`,
    );
    return record && record.textPlain ? record : null;
  } catch {
    return null;
  }
}

// Strips a trailing subsection/paragraph suffix, e.g. "29 CFR 1910.303(g)(2)(i)" ->
// "29 CFR 1910.303", so a subsection-level HazLenz citation can still resolve against
// our section-granularity corpus -- with the scope difference always disclosed.
function parentSectionCitation(citation: string) {
  return citation.replace(/(\([^()]+\)\s*)+$/, "").trim();
}

// On-demand only (called from the citation "Standard detail" expand action, never
// bundled into classify/analysis payloads). Fails soft to null on any error --
// offline, no network, not-yet-ingested citation, or auth lapse -- so the existing
// honest "not currently available" panel is always a safe fallback, never a hard error.
export async function getRegulatorySection(citation: string): Promise<RegulatorySectionRecord | null> {
  const exact = await fetchRegulatorySectionByCitation(citation);
  if (exact) return { ...exact, matchScope: "exact" };

  const parentCitation = parentSectionCitation(citation);
  if (!parentCitation || parentCitation === citation) return null;
  const parent = await fetchRegulatorySectionByCitation(parentCitation);
  return parent ? { ...parent, matchScope: "parent-section" } : null;
}
