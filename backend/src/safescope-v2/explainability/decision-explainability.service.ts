export type DecisionExplainabilityInput = {
  classification: string;
  confidenceIntelligence?: any;
  risk?: any;
  suggestedStandards?: any[];
  operationalReasoning?: any;
  trendIntelligence?: any;
  controlIntelligence?: any;
};

export class DecisionExplainabilityService {
  evaluate(input: DecisionExplainabilityInput) {
    const standards = input.suggestedStandards || [];
    const confidence = input.confidenceIntelligence?.overallConfidence;

    const keyEvidence: string[] = [
      input.operationalReasoning?.reasoningSummary,
      ...(input.confidenceIntelligence?.strengths || []),
      ...(standards.length ? [`${standards.length} applicable standard suggestion(s) identified.`] : []),
    ].filter(Boolean);

    const uncertainty: string[] = [
      ...(input.confidenceIntelligence?.missingCriticalInformation || []),
      ...(input.confidenceIntelligence?.conflictingSignals || []),
      ...(input.operationalReasoning?.uncertainty || []),
      ...(input.controlIntelligence?.controlGaps || []),
    ].filter(Boolean);

    const escalationFactors: string[] = [
      input.confidenceIntelligence?.supervisorReviewRecommended ? "Supervisor review recommended by confidence intelligence." : "",
      input.trendIntelligence?.escalationRecommended ? "Trend intelligence recommends escalation." : "",
      input.risk?.requiresShutdown ? "Risk engine recommends shutdown or isolation." : "",
      input.controlIntelligence?.verificationNeeded ? "Control intelligence recommends verification before closure." : "",
    ].filter(Boolean);

    return {
      decisionSummary: `${input.classification || "Review Required"} was selected based on hazard signals, context, risk indicators, and standards alignment.`,
      confidenceStatement:
        typeof confidence === "number"
          ? `Overall confidence is ${Math.round(confidence * 100)}%.`
          : "Overall confidence was not available.",
      riskStatement:
        input.risk?.riskBand || input.risk?.operationalRisk?.matrixBand
          ? `Risk is rated ${input.risk?.riskBand || input.risk?.operationalRisk?.matrixBand}.`
          : "Risk rating requires confirmation.",
      standardsStatement:
        standards.length
          ? `Top standards were selected from curated SafeScope mappings and CFR-backed matching where available.`
          : "No standards were confidently selected.",
      controlStatement:
        input.controlIntelligence?.hierarchyAssessment || "Control hierarchy assessment requires review.",
      keyEvidence: Array.from(new Set(keyEvidence)).slice(0, 6),
      uncertainty: Array.from(new Set(uncertainty)).slice(0, 6),
      escalationFactors: Array.from(new Set(escalationFactors)).slice(0, 6),
      supervisorReviewRecommended:
        escalationFactors.length > 0 ||
        input.confidenceIntelligence?.supervisorReviewRecommended ||
        false,
    };
  }
}
