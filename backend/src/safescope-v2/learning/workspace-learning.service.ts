export class WorkspaceLearningService {
  evaluate(input: {
    workspaceId?: string;
    classification: string;
    priorFindings?: any[];
    standardsFeedback?: any[];
    correctiveActionOutcomes?: any[];
  }) {
    const priorFindings = Array.isArray(input.priorFindings) ? input.priorFindings : [];
    const standardsFeedback = Array.isArray(input.standardsFeedback) ? input.standardsFeedback : [];
    const correctiveActionOutcomes = Array.isArray(input.correctiveActionOutcomes)
      ? input.correctiveActionOutcomes
      : [];

    const matchingFindings = priorFindings.filter((finding) => {
      const priorClassification =
        finding.classification ||
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        "";

      return String(priorClassification).toLowerCase() === String(input.classification).toLowerCase();
    });

    const acceptedStandards = standardsFeedback.filter((item) =>
      ["accepted", "changed"].includes(String(item.action || "").toLowerCase())
    );

    const rejectedStandards = standardsFeedback.filter((item) =>
      ["rejected", "flagged"].includes(String(item.action || "").toLowerCase())
    );

    const ineffectiveActions = correctiveActionOutcomes.filter((item) =>
      ["reopened", "failed_verification", "recurrence_detected"].includes(String(item.outcome || "").toLowerCase())
    );

    const learningSignals: string[] = [];

    if (matchingFindings.length >= 2) {
      learningSignals.push("This workspace has repeated similar hazard classifications.");
    }

    if (acceptedStandards.length) {
      learningSignals.push("Workspace feedback includes accepted or changed standard selections.");
    }

    if (rejectedStandards.length) {
      learningSignals.push("Workspace feedback includes rejected or flagged standard selections.");
    }

    if (ineffectiveActions.length) {
      learningSignals.push("Corrective action outcomes suggest some controls may not have been durable.");
    }

    const learningMaturity =
      learningSignals.length >= 3
        ? "high_signal"
        : learningSignals.length >= 1
          ? "emerging_signal"
          : "limited_signal";

    return {
      workspaceId: input.workspaceId || null,
      learningMaturity,
      repeatedSimilarFindingCount: matchingFindings.length,
      acceptedStandardFeedbackCount: acceptedStandards.length,
      rejectedStandardFeedbackCount: rejectedStandards.length,
      ineffectiveActionOutcomeCount: ineffectiveActions.length,
      learningSignals,
      learningSummary:
        learningMaturity === "high_signal"
          ? "Workspace-specific learning signals are strong enough to inform review priority and recommendations."
          : learningMaturity === "emerging_signal"
            ? "Workspace-specific learning signals are emerging and should be used as supporting context."
            : "Workspace-specific learning is limited for this hazard type.",
      recommendedUse:
        "Use workspace learning as supporting intelligence only; do not override regulatory requirements or qualified human review.",
    };
  }
}
