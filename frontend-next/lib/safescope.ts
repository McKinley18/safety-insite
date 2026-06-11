import { apiFetch } from "./apiFetch";
import { authHeaders } from "./auth";
import { searchOfflineKnowledgeBrain } from "./offlineKnowledgeSearch";
import { downloadSafeScopeBrainBundle } from "./safescopeBrainBundle";
import { getStoredPlanCode, hasPlanEntitlement } from "./planEntitlements";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

function getSafeScopeAuthHeaders() {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }

  const token =
    window.localStorage.getItem("sentinel_auth_token") ||
    window.localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function runBasicSafeScopeFallback(text: string, payload: any) {
  const lower = text.toLowerCase();

  const hasElectricalContext =
    /\b(electrical|electric|disconnect|breaker|panel|mcc|switchgear|switch|cord|wire|wiring|conduit|junction|receptacle|outlet|energized|voltage|arc flash|transformer|fuse|cabinet)\b/i.test(lower);

  const hasElectricalAccessIssue =
    hasElectricalContext &&
    /\b(blocked|obstructed|inaccessible|access|clearance|clearances|stored|pallet|material|equipment|covered|buried)\b/i.test(lower);

  const classification =
    hasElectricalAccessIssue || hasElectricalContext
      ? "Electrical"
      : lower.includes("guard") ||
          lower.includes("conveyor") ||
          lower.includes("pulley") ||
          lower.includes("shaft")
        ? "Machine Guarding"
        : lower.includes("catwalk") ||
            lower.includes("walkway") ||
            lower.includes("housekeeping") ||
            lower.includes("material")
          ? "Housekeeping / Walking-Working Surface"
          : lower.includes("fall") || lower.includes("ladder")
            ? "Fall / Access"
            : payload.hazardCategory || "Review Required";

  return {
    classification,
    confidence: 0.45,
    confidenceBand: "basic_review",
    requiresHumanReview: true,
    basicPlanMode: true,
    upgradeRequiredForFullSafeScope: true,
    explanation:
      "Basic SafeScope provides limited hazard assistance. Upgrade to Plus or Company for full SafeScope reasoning, standards matching, evidence quality review, exposure-path intelligence, and corrective action recommendations.",
    ambiguityWarnings: [
      "Full SafeScope intelligence is not available on the Basic plan.",
      "Review classification, risk, standards, and corrective actions manually.",
    ],
    evidenceTokens: [],
    commonConsequences: [],
    requiredControls: [],
    suggestedStandards: [],
    excludedStandards: [],
    generatedActions: [],
    additionalHazards: [],
    risk: null,
    confidenceIntelligence: {
      overallConfidence: 45,
      confidenceBand: "basic_review",
      strengths: ["Basic hazard category assistance was provided."],
      missingCriticalInformation: [
        "Full SafeScope intelligence requires Plus or Company.",
      ],
      conflictingSignals: [],
      recommendedFollowup: [
        "Upgrade for full standards and corrective action support.",
        "Manually verify this finding.",
      ],
    },
  };
}

function agencyFromScopes(scopes?: string[]) {
  if (!scopes || scopes.includes("all")) return "all";
  if (scopes.includes("msha")) return "MSHA";
  if (scopes.includes("osha_construction")) return "OSHA";
  if (scopes.includes("osha_general")) return "OSHA";
  return "all";
}

function buildOfflineSafeScopeFallback(input: {
  text: string;
  scopes?: string[];
  evidenceTexts?: string[];
  errorMessage?: string;
}) {
  const query = [input.text, ...(input.evidenceTexts || [])]
    .filter(Boolean)
    .join(" ");

  const offlineSearch = searchOfflineKnowledgeBrain({
    query,
    agency: agencyFromScopes(input.scopes),
    limit: 8,
  });

  const topMatch = offlineSearch.matches?.[0];

  return {
    classification: topMatch?.tags?.hazards?.[0] || "Review Required",
    confidence: offlineSearch.confidence || 0.45,
    confidenceBand: offlineSearch.matches?.length
      ? "offline_reference"
      : "review_required",
    evidenceTokens: [],
    ambiguityWarnings: [
      "SafeScope is using the approved offline Knowledge Brain because the online engine was unavailable.",
      input.errorMessage || "Online SafeScope request failed.",
    ],
    requiresHumanReview: true,
    explanation: topMatch
      ? `Offline SafeScope found supporting approved reference intelligence for: ${topMatch.title}.`
      : "Offline SafeScope could not find a strong approved reference match. Manual review is required.",
    commonConsequences: [],
    requiredControls: [],
    score: topMatch?.score || 0,
    scoreMargin: 0,
    excludedHazards: [],
    suggestedStandards: [],
    excludedStandards: [],
    risk: {
      riskBand: "REVIEW_REQUIRED",
      riskScore: null,
      requiresShutdown: false,
      imminentDanger: false,
      fatalityPotential: false,
      reasoning: [
        "Offline fallback does not replace the full SafeScope risk engine.",
        "Use qualified review before final classification, standards selection, or corrective action decisions.",
      ],
    },
    evidenceFusion: {
      combinedNarrative: query,
      inferredThemes: [],
      signalDensity: 0,
      reasoning: [
        "Offline fallback combined available text and evidence notes.",
      ],
    },
    expandedContext: null,
    confidenceIntelligence: {
      overallConfidence: Math.round((offlineSearch.confidence || 0) * 100),
      confidenceBand: offlineSearch.matches?.length
        ? "offline_reference"
        : "review_required",
      strengths: offlineSearch.matches?.length
        ? [
            "Approved offline reference material matched the observed condition.",
          ]
        : [],
      missingCriticalInformation: offlineSearch.reasoning?.evidenceGaps || [
        "Online SafeScope intelligence unavailable.",
      ],
      conflictingSignals: [],
      recommendedFollowup: [
        "Reconnect and rerun full SafeScope review when available.",
        "Supervisor review required before final report use.",
      ],
      reviewTriggers: ["Offline fallback mode"],
    },
    knowledgeBrain: {
      offline: true,
      available: offlineSearch.available,
      confidence: offlineSearch.confidence || 0,
      bundleVersion: offlineSearch.bundleVersion,
      generatedAt: offlineSearch.generatedAt,
      matches: offlineSearch.matches || [],
      supportingReferences: (offlineSearch.matches || []).map((match: any) => ({
        title: match.title,
        citation: match.citation,
        authorityTier: match.authorityTier,
        sourceType: match.sourceType,
        reason: match.reason,
      })),
      evidenceGaps: offlineSearch.reasoning?.evidenceGaps || [],
      caution: offlineSearch.reasoning?.caution,
    },
    generatedActions: [],
    additionalHazards: [],
    fallbackMode: true,
    offlineFallback: true,
  };
}

export async function runSafeScopeV2Classify(input: {
  text: string;
  scopes?: string[];
  evidenceTexts?: string[];
  visualAttachments?: any[];
  riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  priorFindings?: any[];
}) {
  const requestUrl = `${API_BASE_URL}/safescope-v2/classify`;

  const normalizedScopes = Array.isArray(input.scopes)
    ? input.scopes.map((scope) => String(scope || "").trim()).filter(Boolean)
    : undefined;

  const safePayload = {
    text: String(input.text || "").trim(),
    ...(normalizedScopes?.length ? { scopes: normalizedScopes } : {}),
    riskProfileId: input.riskProfileId || "standard_5x5",
    evidenceTexts: Array.isArray(input.evidenceTexts)
      ? input.evidenceTexts.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    priorFindings: Array.isArray(input.priorFindings) ? input.priorFindings : [],
  };

  const headers = getSafeScopeAuthHeaders();

  if (typeof window !== "undefined") {
    console.info("[SafeScope] direct classify request", {
      requestUrl,
      hasAuthHeader: Boolean((headers as any).Authorization),
      textLength: safePayload.text.length,
      scopes: safePayload.scopes,
      evidenceCount: safePayload.evidenceTexts.length,
      priorFindingsCount: safePayload.priorFindings.length,
      riskProfileId: safePayload.riskProfileId,
    });
  }

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(safePayload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `SafeScope authentication failed (${response.status}). Sign out, sign back in, and try again.`,
        );
      }

      throw new Error(
        `SafeScope backend error ${response.status}: ${
          responseText || "No response body returned."
        }`,
      );
    }

    const result = responseText ? JSON.parse(responseText) : null;

    if (typeof window !== "undefined") {
      console.info("[SafeScope] direct classify response", {
        classification: result?.classification,
        confidence: result?.confidence,
        confidenceBand: result?.confidenceBand,
        suggestedStandards: result?.suggestedStandards?.length || 0,
        generatedActions: result?.generatedActions?.length || 0,
      });
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SafeScope request failed.";

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return buildOfflineSafeScopeFallback({
        text: safePayload.text,
        scopes: safePayload.scopes,
        evidenceTexts: safePayload.evidenceTexts,
        errorMessage: message,
      });
    }

    throw new Error(`SafeScope live request failed: ${message}`);
  }
}

export async function sendSafeScopeFeedback(payload: any) {
  const response = await apiFetch(`${API_BASE_URL}/standards/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("SafeScope feedback failed.");
  }

  return response.json();
}

export async function getSafeScopeReasoningSnapshot(snapshotId: string) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-v2/reasoning-snapshots/${snapshotId}`,
  );

  if (!response.ok) {
    throw new Error("SafeScope reasoning snapshot could not be loaded.");
  }

  return response.json();
}

export async function submitSupervisorValidation(payload: {
  reasoningSnapshotId: string;
  reportId?: string;
  workspaceId?: string;
  reviewerName?: string;
  validationDecision:
    | "accepted"
    | "modified"
    | "rejected"
    | "escalated"
    | "insufficient_evidence";
  reviewerNotes?: string;
  modifiedClassification?: any;
  modifiedStandards?: any;
  modifiedRiskAssessment?: any;
}) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-v2/supervisor-validations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Supervisor validation submission failed.");
  }

  return response.json();
}

export async function getSupervisorValidationHistory(
  reasoningSnapshotId: string,
) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-v2/supervisor-validations/${reasoningSnapshotId}`,
  );

  if (!response.ok) {
    throw new Error("Supervisor validation history could not be loaded.");
  }

  return response.json();
}

export async function runSafeScopeV2Offline(input: {
  observationText: string;
  localInspectionId: string;
  localObservationId: string;
  offlineKnowledgePackVersion?: string;
  workspaceId?: string;
}) {
  const requestUrl = API_BASE_URL + '/safescope-v2/offline/evaluate';
  const response = await apiFetch(requestUrl, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Offline reasoning failed:', errorText);
    return {
        mode: 'offline_limited_advisory',
        offlineAvailable: true,
        confidenceCeiling: 0.1,
        advisorySummary: 'Network error during offline assessment. Observation cached for sync.',
        likelyHazardDomains: [],
        evidenceGaps: ['Connectivity lost during assessment.'],
        requiredSyncActions: ['Sync once online'],
        supervisorQuestions: [],
        offlineRestrictions: ['Real-time assessment unavailable'],
        offlineTraceId: 'err-local-' + Date.now(),
        requiresHumanReview: true,
        requiresOnlineVerification: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        cannotPromoteKnowledge: true,
        advisoryBoundary: 'Offline network fallback.'
    };
  }

  return response.json();
}
