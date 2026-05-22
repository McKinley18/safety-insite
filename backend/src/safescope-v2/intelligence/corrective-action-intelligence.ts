export interface CorrectiveAction {
  title: string;
  rationale: string;
  verificationRequired: string;
  sourceBasis: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface CorrectiveActionIntelligence {
  immediateActions: CorrectiveAction[];
  verificationActions: CorrectiveAction[];
  preventionActions: CorrectiveAction[];
  closureRequirements: string[];
  escalationRecommendation: string;
  actionPriorityRationale: string;
}

export function getCorrectiveActionIntelligence(
  classification: string,
  risk: any,
  sourceAnalysis: any,
  evidenceGap: any,
): CorrectiveActionIntelligence {
  const isHighRisk =
    (risk?.riskScore || 0) >= 7 ||
    risk?.requiresShutdown ||
    risk?.imminentDanger;
  const sourceBasis =
    sourceAnalysis.primaryRegulatoryBasis.length > 0
      ? "Primary regulatory basis"
      : "Supportive guidance";

  const priority = isHighRisk ? "critical" : "high";
  const priorityRationale =
    sourceAnalysis.primaryRegulatoryBasis.length > 0
      ? "Corrective action should first address the enforceable regulatory basis identified by SafeScope."
      : "No primary regulatory source was retrieved; remediation is based on supportive safety guidance.";

  const immediateActions: CorrectiveAction[] = [
    {
      title: `Control ${classification} Exposure`,
      rationale: `Immediate hazard control required to prevent contact/exposure to ${classification} hazard.`,
      verificationRequired: "Supervisor confirmation of control in place.",
      sourceBasis,
      priority,
    },
  ];

  const verificationActions: CorrectiveAction[] = [
    {
      title: "Verify Hazard Control Effectiveness",
      rationale: "Confirm the hazard control effectively removes the exposure.",
      verificationRequired: "Visual verification or functional test.",
      sourceBasis,
      priority: "medium",
    },
  ];

  if (
    evidenceGap.criticalQuestions &&
    evidenceGap.criticalQuestions.length > 0
  ) {
    verificationActions.push({
      title: "Resolve Critical Evidence Gaps",
      rationale:
        "The following safety details must be verified: " +
        evidenceGap.criticalQuestions.join(", "),
      verificationRequired: "Documentation of findings.",
      sourceBasis,
      priority: "high",
    });
  }

  const preventionActions: CorrectiveAction[] = [
    {
      title: "Implement Long-term Engineering Controls",
      rationale: "Address systemic factors to prevent recurrence.",
      verificationRequired: "Management of change or process update.",
      sourceBasis,
      priority: "low",
    },
  ];

  const closureRequirements = [...evidenceGap.closureEvidenceNeeded];
  const escalationRecommendation = isHighRisk
    ? "Supervisor review required immediately, shutdown consideration recommended."
    : "Standard supervisor sign-off required for closure.";

  return {
    immediateActions,
    verificationActions,
    preventionActions,
    closureRequirements,
    escalationRecommendation,
    actionPriorityRationale: priorityRationale,
  };
}
