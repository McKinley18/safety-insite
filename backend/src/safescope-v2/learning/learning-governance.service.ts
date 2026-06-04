export type SafeScopeLearningSignal = {
  source:
    | "workspace_feedback"
    | "supervisor_validation"
    | "corrective_action_outcome"
    | "prior_finding"
    | "confidence_calibration"
    | "reasoning_drift";
  action?: string;
  decision?: string;
  classification?: string;
  citation?: string;
  confidenceImpact?: number;
  trusted?: boolean;
  reason?: string;
};

export class SafeScopeLearningGovernanceService {
  evaluate(input: {
    workspaceLearning?: any;
    feedbackSignals?: any[];
    supervisorValidations?: any[];
    confidenceCalibration?: any;
    reasoningDrift?: any;
    nativeReasoning?: any;
  }) {
    const feedbackSignals = Array.isArray(input.feedbackSignals)
      ? input.feedbackSignals
      : [];

    const supervisorValidations = Array.isArray(input.supervisorValidations)
      ? input.supervisorValidations
      : [];

    const approvedSignals: SafeScopeLearningSignal[] = [];
    const quarantinedSignals: SafeScopeLearningSignal[] = [];
    const learningWarnings: string[] = [];

    for (const signal of feedbackSignals) {
      const action = String(signal.action || "").toLowerCase();
      const expertReviewed = Boolean(signal.expertReviewed);
      const promotedToGlobal = Boolean(signal.promotedToGlobal);

      const trusted =
        expertReviewed ||
        promotedToGlobal ||
        ["accepted", "changed"].includes(action);

      const learningSignal: SafeScopeLearningSignal = {
        source: "workspace_feedback",
        action,
        classification: signal.classification,
        citation: signal.citation,
        trusted,
        confidenceImpact:
          action === "accepted"
            ? 0.02
            : action === "changed"
              ? -0.03
              : action === "rejected"
                ? -0.05
                : action === "flagged"
                  ? -0.07
                  : 0,
        reason: trusted
          ? "Workspace feedback may support confidence and review-priority tuning."
          : "Feedback is not trusted enough to influence SafeScope decisions.",
      };

      if (trusted) approvedSignals.push(learningSignal);
      else quarantinedSignals.push(learningSignal);
    }

    for (const validation of supervisorValidations) {
      const decision = String(validation.validationDecision || "").toLowerCase();

      const trusted = [
        "accepted",
        "modified",
        "rejected",
        "escalated",
        "insufficient_evidence",
      ].includes(decision);

      const learningSignal: SafeScopeLearningSignal = {
        source: "supervisor_validation",
        decision,
        trusted,
        confidenceImpact:
          decision === "accepted"
            ? 0.04
            : decision === "modified"
              ? -0.04
              : decision === "rejected"
                ? -0.08
                : decision === "insufficient_evidence"
                  ? -0.06
                  : decision === "escalated"
                    ? -0.05
                    : 0,
        reason: trusted
          ? "Supervisor validation is a high-value learning signal."
          : "Supervisor validation decision was not recognized.",
      };

      if (trusted) approvedSignals.push(learningSignal);
      else quarantinedSignals.push(learningSignal);
    }

    const calibrationBand = String(
      input.confidenceCalibration?.calibrationBand || "",
    );

    if (calibrationBand && calibrationBand !== "reliable") {
      approvedSignals.push({
        source: "confidence_calibration",
        trusted: true,
        confidenceImpact:
          calibrationBand === "limited_reliability" ? -0.08 : -0.04,
        reason: `Confidence calibration band is ${calibrationBand}.`,
      });
    }

    const driftBand = String(input.reasoningDrift?.driftBand || "");

    if (["moderate", "high"].includes(driftBand)) {
      approvedSignals.push({
        source: "reasoning_drift",
        trusted: true,
        confidenceImpact: driftBand === "high" ? -0.1 : -0.05,
        reason: `Reasoning drift band is ${driftBand}.`,
      });
    }

    const totalConfidenceAdjustment = approvedSignals.reduce(
      (sum, signal) => sum + Number(signal.confidenceImpact || 0),
      0,
    );

    if (quarantinedSignals.length) {
      learningWarnings.push(
        "Some learning signals were quarantined because they were not validated enough to influence SafeScope.",
      );
    }

    if (approvedSignals.some((signal) => signal.confidenceImpact! < 0)) {
      learningWarnings.push(
        "Learning governance detected correction, drift, or reliability signals that should reduce confidence or increase review priority.",
      );
    }

    return {
      engine: "safescope_learning_governance",
      mode: "validation_gated_learning",
      approvedSignalCount: approvedSignals.length,
      quarantinedSignalCount: quarantinedSignals.length,
      approvedSignals,
      quarantinedSignals,
      totalConfidenceAdjustment: Number(
        Math.max(-0.25, Math.min(0.15, totalConfidenceAdjustment)).toFixed(2),
      ),
      learningWarnings,
      allowedInfluence: [
        "adjust_confidence",
        "increase_review_priority",
        "suggest_evidence_questions",
        "improve_corrective_action_recommendations",
        "surface_workspace_trends",
      ],
      prohibitedInfluence: [
        "invent_citations",
        "override_regulatory_requirements",
        "remove_high_risk_review_flags",
        "auto_finalize_compliance_decisions",
        "promote_unreviewed_feedback_to_global_learning",
      ],
      finalGovernanceRule:
        "SafeScope may learn from validated feedback and field outcomes, but learning cannot override regulations, source requirements, high-risk review triggers, or qualified human judgment.",
    };
  }
}
