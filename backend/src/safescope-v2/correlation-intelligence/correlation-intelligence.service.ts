export class CorrelationIntelligenceService {
  evaluate(input: {
    classification: string;
    additionalHazards?: any[];
    trendIntelligence?: any;
    controlIntelligence?: any;
    operationalReasoning?: any;
    priorFindings?: any[];
  }) {
    const hazards = [
      input.classification,
      ...(input.additionalHazards || []).map((hazard) => hazard.classification || hazard.name || hazard.hazard),
    ].filter(Boolean);

    const correlatedSignals: string[] = [];
    const systemicIndicators: string[] = [];
    const cascadingRiskPaths: string[] = [];

    const hasMachine = hazards.some((h) => String(h).toLowerCase().includes("machine"));
    const hasElectrical = hazards.some((h) => String(h).toLowerCase().includes("electrical"));
    const hasHousekeeping = hazards.some((h) => String(h).toLowerCase().includes("housekeeping"));
    const hasFall = hazards.some((h) => String(h).toLowerCase().includes("fall"));
    const hasMobile = hazards.some((h) => String(h).toLowerCase().includes("mobile"));

    if (hasMachine && hasElectrical) {
      correlatedSignals.push("Machine and electrical hazards may indicate combined equipment integrity and energy-control exposure.");
      cascadingRiskPaths.push("Equipment condition → energy exposure → worker contact risk.");
    }

    if (hasHousekeeping && (hasMachine || hasElectrical || hasMobile)) {
      correlatedSignals.push("Housekeeping exposure near equipment may increase access, slip/trip, struck-by, or emergency-response risk.");
      cascadingRiskPaths.push("Poor area condition → impaired movement/access → elevated injury potential.");
    }

    if (hasFall && hasHousekeeping) {
      correlatedSignals.push("Fall and housekeeping hazards may indicate degraded walking-working surface control.");
      cascadingRiskPaths.push("Surface condition → unstable footing → fall exposure.");
    }

    if (input.trendIntelligence?.recurrenceRisk === "high" || input.trendIntelligence?.escalationRecommended) {
      systemicIndicators.push("Recurring trend suggests this may be a systemic control weakness rather than an isolated condition.");
    }

    if (input.controlIntelligence?.controlGaps?.length) {
      systemicIndicators.push("Control gaps suggest recommended actions may need stronger engineering, elimination, or verification controls.");
    }

    if ((input.priorFindings || []).length >= 3) {
      systemicIndicators.push("Multiple prior findings are available, increasing the value of trend and recurrence review.");
    }

    const cascadePotential =
      cascadingRiskPaths.length >= 2 || systemicIndicators.length >= 2
        ? "high"
        : cascadingRiskPaths.length || systemicIndicators.length
          ? "elevated"
          : "low";

    return {
      correlatedHazards: Array.from(new Set(hazards)),
      correlatedSignals,
      systemicIndicators,
      cascadingRiskPaths,
      cascadePotential,
      escalationRecommended: cascadePotential === "high" || systemicIndicators.length >= 2,
      recommendation:
        cascadePotential === "high"
          ? "Review this finding as a potential systemic breakdown. Consider area-level controls, supervisor escalation, and verification of related hazards."
          : cascadePotential === "elevated"
            ? "Review related hazards together before assigning corrective actions."
            : "No strong hazard-correlation pattern detected from available information.",
    };
  }
}
