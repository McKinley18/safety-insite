import { sendHazLenzFeedback } from "@/lib/hazlenz";
import { submitSupervisorValidation } from "@/lib/safescope";
import { buildHazLenzObservationText } from "./inspectionWorkflowHelpers";

export type HazLenzFeedbackAction = "accepted" | "rejected" | "flagged";

export type HazLenzValidationDecision =
  | "accepted"
  | "modified"
  | "rejected"
  | "escalated"
  | "insufficient_evidence";

export async function submitHazLenzStandardFeedback(input: {
  standard: any;
  action: HazLenzFeedbackAction;
  hazardCategory: string;
  description: string;
  location: string;
  evidenceNotes: string;
  agencyMode: string;
  feedbackNotes: string;
  safeScopeResult: any;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
}) {
  await sendHazLenzFeedback({
    text: buildHazLenzObservationText({
      hazardCategory: input.hazardCategory,
      description: input.description,
      location: input.location,
      evidenceNotes: input.evidenceNotes,
      agencyMode: input.agencyMode,
    }),
    category:
      input.safeScopeResult?.classification ||
      input.hazardCategory ||
      "General",
    mode: input.agencyMode,
    citation: input.standard.citation,
    action: input.action,
    notes: input.feedbackNotes,
    confidenceBefore:
      input.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
      input.safeScopeResult?.confidence,
    riskProfileId: input.riskProfileId,
  });
}

export async function submitHazLenzValidationReview(input: {
  safeScopeResult: any;
  decision: HazLenzValidationDecision;
  feedbackNotes: string;
}) {
  if (!input.safeScopeResult?.reasoningSnapshotId) {
    return {
      ok: false as const,
      status: "No HazLenz AI reasoning snapshot is available to validate.",
    };
  }

  await submitSupervisorValidation({
    reasoningSnapshotId: input.safeScopeResult.reasoningSnapshotId,
    validationDecision: input.decision,
    reviewerNotes: input.feedbackNotes,
  });

  return {
    ok: true as const,
    status: `Supervisor validation saved: ${input.decision.replaceAll("_", " ")}`,
  };
}
