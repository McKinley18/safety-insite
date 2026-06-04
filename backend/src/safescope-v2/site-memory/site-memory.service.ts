export class SiteMemoryService {
  evaluate(input: {
    currentClassification: string;
    currentLocation?: string;
    priorFindings?: any[];
    trendIntelligence?: any;
    correlationIntelligence?: any;
  }) {
    const priorFindings = Array.isArray(input.priorFindings)
      ? input.priorFindings
      : [];

    const repeatedClassifications = priorFindings.filter(
      (finding) =>
        String(finding?.classification || "")
          .toLowerCase()
          .includes(String(input.currentClassification || "").toLowerCase())
    );

    const repeatedLocations = priorFindings.filter(
      (finding) =>
        input.currentLocation &&
        String(finding?.location || "")
          .toLowerCase()
          .includes(String(input.currentLocation || "").toLowerCase())
    );

    const recurringRiskDetected =
      repeatedClassifications.length >= 2 ||
      repeatedLocations.length >= 3;

    const operationalPatterns: string[] = [];

    if (repeatedClassifications.length >= 2) {
      operationalPatterns.push(
        "Repeated hazard classification pattern detected across prior findings."
      );
    }

    if (repeatedLocations.length >= 3) {
      operationalPatterns.push(
        "Repeated location-based exposure pattern detected."
      );
    }

    if (input.trendIntelligence?.escalationRecommended) {
      operationalPatterns.push(
        "Trend intelligence indicates escalation or recurrence risk."
      );
    }

    if (input.correlationIntelligence?.correlatedHazards?.length) {
      operationalPatterns.push(
        "Multiple correlated hazards suggest broader operational-system weaknesses."
      );
    }

    const degradationRisk =
      operationalPatterns.length >= 3
        ? "high"
        : operationalPatterns.length >= 1
          ? "medium"
          : "low";

    return {
      recurringRiskDetected,
      repeatedClassificationCount: repeatedClassifications.length,
      repeatedLocationCount: repeatedLocations.length,
      operationalPatterns,
      degradationRisk,
      siteMemorySummary:
        recurringRiskDetected
          ? "SafeScope detected recurring operational patterns that may indicate systemic degradation or repeated control weakness."
          : "No strong recurring operational memory pattern detected from available findings.",
      recommendedAction:
        recurringRiskDetected
          ? "Perform broader operational review instead of isolated corrective action closure."
          : "Continue monitoring for recurring operational patterns.",
    };
  }
}
