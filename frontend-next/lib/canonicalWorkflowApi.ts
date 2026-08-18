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

export type PersistedInspection = {
  id: string;
  siteId: string;
  title: string;
  status: "draft" | "in_review" | "completed" | "archived";
  version: number;
  updatedAt: string;
  observations?: PersistedObservation[];
  findings?: PersistedFinding[];
};

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

export type PersistedReport = {
  id: string;
  inspectionId: string;
  createdAt: string;
  versions: Array<{
    version: number;
    status: "generating" | "generated" | "failed" | "superseded" | "quarantined";
    generatedAt: string | null;
    sha256: string | null;
  }>;
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

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
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
  });
}

export async function listPersistedInspections() {
  return apiJson<PersistedInspection[]>("/inspections");
}

export async function createPersistedInspection(input: {
  siteId: string;
  title: string;
}) {
  return apiJson<PersistedInspection>("/inspections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPersistedInspection(id: string) {
  return apiJson<PersistedInspection>(`/inspections/${encodeURIComponent(id)}`);
}

export async function addPersistedObservation(inspectionId: string, rawText: string) {
  return apiJson<PersistedObservation>(`/inspections/${encodeURIComponent(inspectionId)}/observations`, {
    method: "POST",
    body: JSON.stringify({ rawText, evidenceSource: "direct_observation" }),
  });
}

export async function updatePersistedObservation(observationId: string, rawText: string, version: number) {
  return apiJson<PersistedObservation>(`/inspections/observations/${encodeURIComponent(observationId)}`, {
    method: "PATCH",
    body: JSON.stringify({ rawText, version }),
  });
}

export async function uploadInspectionEvidence(inspectionId: string, file: File) {
  const data = new FormData();
  data.append("file", file);
  const token = getAuthToken();
  const response = await apiFetch(
    `${API_BASE_URL}/inspections/${encodeURIComponent(inspectionId)}/evidence`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    },
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

export async function createPersistedCorrectiveAction(input: {
  inspectionId: string;
  findingId: string;
  title: string;
  description: string;
  priorityCode: "low" | "medium" | "high" | "urgent";
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

export async function generatePersistedReport(inspectionId: string) {
  return apiJson<{
    reportId: string;
    inspectionId: string;
    version: number;
    status: string;
    checksum: string;
  }>(`/inspections/${encodeURIComponent(inspectionId)}/reports`, {
    method: "POST",
  });
}

export async function listPersistedReports() {
  return apiJson<PersistedReport[]>("/inspection-reports");
}

export function persistedReportDownloadUrl(reportId: string, version: number) {
  return `${API_BASE_URL}/inspection-reports/${encodeURIComponent(reportId)}/versions/${version}/download`;
}

export async function archivePersistedReport(reportId: string) {
  return apiJson<{ reportId: string; archivedAt: string }>(
    `/inspection-reports/${encodeURIComponent(reportId)}/archive`,
    { method: "PATCH" },
  );
}

export async function downloadPersistedReport(reportId: string, version: number) {
  const response = await apiFetch(persistedReportDownloadUrl(reportId, version), {
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
