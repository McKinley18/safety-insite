export class SafeScopeLearningMemoryService {
  evaluate(input: {
    classification: string;
    workspaceLearning?: any;
    learningGovernance?: any;
    confidenceCalibration?: any;
    reasoningDrift?: any;
    nativeReasoning?: any;
    priorFindings?: any[];
  }) {
    const priorFindings = Array.isArray(input.priorFindings)
      ? input.priorFindings
      : [];

    const relatedPriorFindings = priorFindings.filter((finding) => {
      const priorClassification =
        finding.classification ||
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        "";

      return (
        String(priorClassification).toLowerCase() ===
        String(input.classification).toLowerCase()
      );
    });

    const retainedLearning: string[] = [];
    const learningCautions: string[] = [];
    const nextLearningNeeds: string[] = [];

    if (relatedPriorFindings.length >= 2) {
      retainedLearning.push(
        "Similar findings have appeared before in this workspace, so SafeScope should treat recurrence and durable corrective action as important review context.",
      );
    }

    if (input.workspaceLearning?.acceptedStandardFeedbackCount > 0) {
      retainedLearning.push(
        "Validated or accepted standard feedback exists for this workspace and may support future confidence calibration.",
      );
    }

    if (input.workspaceLearning?.rejectedStandardFeedbackCount > 0) {
      learningCautions.push(
        "Some prior standard selections were rejected or flagged, so SafeScope should increase scrutiny before relying on similar matches.",
      );
    }

    if (input.workspaceLearning?.ineffectiveActionOutcomeCount > 0) {
      retainedLearning.push(
        "Some corrective actions were not durable, so SafeScope should favor stronger verification and recurrence-prevention controls.",
      );
    }

    if (
      input.confidenceCalibration?.calibrationBand &&
      input.confidenceCalibration.calibrationBand !== "reliable"
    ) {
      learningCautions.push(
        "Confidence calibration is not fully reliable; learning should increase review priority rather than finalize decisions.",
      );
    }

    if (
      input.reasoningDrift?.driftBand === "moderate" ||
      input.reasoningDrift?.driftBand === "high"
    ) {
      learningCautions.push(
        "Reasoning drift indicators are present; SafeScope should preserve supervisor validation before adapting future recommendations.",
      );
    }

    if (!input.learningGovernance?.approvedSignalCount) {
      nextLearningNeeds.push(
        "More supervisor-validated feedback is needed before SafeScope can safely adjust workspace-specific recommendations.",
      );
    }

    if (!relatedPriorFindings.length) {
      nextLearningNeeds.push(
        "More site history is needed before SafeScope can identify meaningful recurrence patterns for this hazard type.",
      );
    }

    return {
      engine: "safescope_learning_memory",
      mode: "governed_workspace_memory",
      classification: input.classification,
      relatedPriorFindingCount: relatedPriorFindings.length,
      retainedLearning,
      learningCautions,
      nextLearningNeeds,
      canSelfModifyRules: false,
      canOverrideStandards: false,
      canReduceHumanReview: false,
      canImproveRecommendations:
        Boolean(input.learningGovernance?.approvedSignalCount) ||
        relatedPriorFindings.length >= 2,
      memoryBoundary:
        "SafeScope learning memory may improve review questions, confidence calibration, recurrence awareness, and corrective-action suggestions, but it cannot change regulations, invent citations, bypass review, or self-modify core rules without validation.",
    };
  }
}
