import { apiFetch } from "./apiFetch";
import { getStoredPlanCode, hasPlanEntitlement } from "./planEntitlements";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

function runBasicSafeScopeFallback(text: string, payload: any) {
  const lower = text.toLowerCase();

  const classification =
    lower.includes("electrical") || lower.includes("wire") || lower.includes("energized")
      ? "Electrical"
      : lower.includes("guard") || lower.includes("conveyor") || lower.includes("pulley") || lower.includes("shaft")
        ? "Machine Guarding"
        : lower.includes("catwalk") || lower.includes("walkway") || lower.includes("housekeeping") || lower.includes("material")
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
      overallConfidence: 0.45,
      confidenceBand: "basic_review",
      strengths: ["Basic hazard category assistance was provided."],
      missingCriticalInformation: ["Full SafeScope intelligence requires Plus or Company."],
      conflictingSignals: [],
      recommendedFollowup: ["Upgrade for full standards and corrective action support.", "Manually verify this finding."],
    },
  };
}


export async function runSafeScopeV2Classify(payload: {
  text?: string;
  hazardCategory?: string;
  description?: string;
  location?: string;
  evidenceNotes?: string;
  agencyMode?: string;
  riskProfileId?: string;
  scopes?: string[];
  evidenceTexts?: string[];
  priorFindings?: any[];
}) {
  const text = payload.text || [
    payload.hazardCategory ? `Hazard Category: ${payload.hazardCategory}` : "",
    payload.description ? `Description: ${payload.description}` : "",
    payload.location ? `Location: ${payload.location}` : "",
    payload.evidenceNotes ? `Evidence Notes: ${payload.evidenceNotes}` : "",
    payload.agencyMode ? `Agency Mode: ${payload.agencyMode}` : "",
    payload.riskProfileId ? `Risk Profile: ${payload.riskProfileId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const planCode = getStoredPlanCode();

  if (!hasPlanEntitlement("fullSafeScope", planCode)) {
    return runBasicSafeScopeFallback(text, payload);
  }

  const response = await apiFetch(`${API_BASE_URL}/safescope-v2/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      scopes: payload.scopes,
      evidenceTexts: payload.evidenceTexts,
      riskProfileId: payload.riskProfileId,
      priorFindings: payload.priorFindings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "SafeScope classification failed.");
  }

  return response.json();
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
  const response = await apiFetch(`${API_BASE_URL}/safescope-v2/reasoning-snapshots/${snapshotId}`);

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
    }
  );

  if (!response.ok) {
    throw new Error("Supervisor validation submission failed.");
  }

  return response.json();
}

export async function getSupervisorValidationHistory(
  reasoningSnapshotId: string
) {
  const response = await apiFetch(
    `${API_BASE_URL}/safescope-v2/supervisor-validations/${reasoningSnapshotId}`
  );

  if (!response.ok) {
    throw new Error("Supervisor validation history could not be loaded.");
  }

  return response.json();
}
