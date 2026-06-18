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
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Add dev bypass header if in local development mode
  if (process.env.NODE_ENV !== 'production') {
    headers['x-dev-organization-id'] = 'dev-local-workspace';
  }

  return headers;
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
      "Basic HazLenz AI provides limited hazard assistance. Upgrade for full HazLenz AI reasoning, standards matching, evidence quality review, exposure-path intelligence, and corrective action recommendations.",
    ambiguityWarnings: [
      "Full HazLenz AI intelligence is not available on the Basic plan.",
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
        "Full HazLenz AI intelligence requires an upgraded plan.",
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
      "HazLenz AI is using the approved offline Knowledge Brain because the online engine was unavailable.",
      input.errorMessage || "Online HazLenz AI request failed.",
    ],
    requiresHumanReview: true,
    explanation: topMatch
      ? `Offline HazLenz AI found supporting approved reference intelligence for: ${topMatch.title}.`
      : "Offline HazLenz AI could not find a strong approved reference match. Manual review is required.",
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
        "Offline fallback does not replace the full HazLenz AI risk engine.",
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
        "Online HazLenz AI intelligence unavailable.",
      ],
      conflictingSignals: [],
      recommendedFollowup: [
        "Reconnect and rerun full HazLenz AI review when available.",
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

  console.info("[HazLenz AI] Request diagnostic", {
    url: requestUrl,
    payloadTextLength: safePayload.text.length,
    evidenceCount: safePayload.evidenceTexts.length,
    priorFindingsCount: safePayload.priorFindings.length,
    riskProfileId: safePayload.riskProfileId,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for full HazLenz AI reasoning payloads

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(safePayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      const errorMsg = responseText || `HazLenz AI backend error ${response.status}`;
      console.error(`[HazLenz AI] API Error: ${response.status}`, { errorMsg });
      throw new Error(errorMsg);
    }

    return responseText ? JSON.parse(responseText) : null;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error("[HazLenz AI] Request timed out");
      throw new Error("HazLenz AI request timed out.");
    }
    console.error("[HazLenz AI] Classify failed", error);
    throw error;
  }
}

export async function sendSafeScopeFeedback(payload: any) {
  const response = await apiFetch(`${API_BASE_URL}/standards/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("HazLenz AI feedback failed.");
  }

  return response.json();
}

export async function getSafeScopeReasoningSnapshot(snapshotId: string) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-v2/reasoning-snapshots/${snapshotId}`,
  );

  if (!response.ok) {
    throw new Error("HazLenz AI reasoning snapshot could not be loaded.");
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
  try {
    const fallbackResult = buildOfflineSafeScopeFallback({
      text: input.observationText,
      scopes: ["all"],
    });

    return {
      engine: "safescope_reasoning_orchestrator_v1",
      mode: "deterministic_offline",
      classification: fallbackResult.classification,
      confidence: {
        level: fallbackResult.confidenceBand === "offline_reference" ? "moderate" : "low",
        reasons: fallbackResult.confidenceIntelligence.strengths,
      },
      missingEvidence: fallbackResult.confidenceIntelligence.missingCriticalInformation.map(gap => ({
        field: "offlineEvidenceGap",
        reason: gap,
        importance: "high"
      })),
      conclusionBoundary: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
      offlineFallback: true,
      offlineTraceId: `local-${input.localObservationId}-${Date.now()}`,
      suggestedStandards: fallbackResult.knowledgeBrain.supportingReferences?.map(ref => ({
         citation: ref.citation,
         description: ref.title,
         rationale: ref.reason
      })) || [],
      recommendedNextQuestions: fallbackResult.confidenceIntelligence.missingCriticalInformation,
    };
  } catch (err) {
    console.error('Offline reasoning failed:', err);
    return {
        mode: 'offline_limited_advisory',
        offlineAvailable: true,
        confidenceCeiling: 0.1,
        advisorySummary: 'Error during offline assessment. Observation cached for sync.',
        likelyHazardDomains: [],
        evidenceGaps: ['Assessment failed to process locally.'],
        requiredSyncActions: ['Sync once online'],
        supervisorQuestions: [],
        offlineRestrictions: ['Real-time assessment unavailable'],
        offlineTraceId: 'err-local-' + Date.now(),
        requiresHumanReview: true,
        requiresOnlineVerification: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        cannotPromoteKnowledge: true,
        advisoryBoundary: 'Offline local failure.'
    };
  }
}
