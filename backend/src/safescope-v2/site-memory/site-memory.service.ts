export class SiteMemoryService {
  evaluate(input: {
    currentClassification: string;
    currentLocation?: string;
    priorFindings?: any[];
    trendIntelligence?: any;
    correlationIntelligence?: any;
    currentDate?: Date | string;
  }) {
    const priorFindings = Array.isArray(input.priorFindings)
      ? input.priorFindings
      : [];

    const now = input.currentDate ? new Date(input.currentDate) : new Date();

    const repeatedClassifications = priorFindings.filter(
      (finding) => {
        const pClass = finding?.classification || finding?.hazardCategory || finding?.safeScopeResult?.classification || "";
        return String(pClass)
          .toLowerCase()
          .includes(String(input.currentClassification || "").toLowerCase());
      }
    );

    const repeatedLocations = priorFindings.filter(
      (finding) =>
        input.currentLocation &&
        String(finding?.location || finding?.area || "")
          .toLowerCase()
          .includes(String(input.currentLocation || "").toLowerCase())
    );

    // Filter repeat findings in both category and location
    const categoryAndLocationRepeats = priorFindings.filter((finding) => {
      const pClass = finding?.classification || finding?.hazardCategory || finding?.safeScopeResult?.classification || "";
      const isClassMatch = String(pClass)
        .toLowerCase()
        .includes(String(input.currentClassification || "").toLowerCase());
      
      const isLocMatch = input.currentLocation &&
        String(finding?.location || finding?.area || "")
          .toLowerCase()
          .includes(String(input.currentLocation || "").toLowerCase());

      return isClassMatch && isLocMatch;
    });

    // Temporal window categorization
    let recurrence30DaysCount = 0;
    let recurrence90DaysCount = 0;
    let recurrence180DaysCount = 0;

    for (const finding of categoryAndLocationRepeats) {
      const fDateStr = finding?.date || finding?.createdAt || finding?.generatedAt;
      if (!fDateStr) continue;

      const fDate = new Date(fDateStr);
      if (isNaN(fDate.getTime())) continue;

      const diffTime = now.getTime() - fDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays >= 0) {
        if (diffDays <= 30) recurrence30DaysCount++;
        if (diffDays <= 90) recurrence90DaysCount++;
        if (diffDays <= 180) recurrence180DaysCount++;
      }
    }

    const recurringRiskDetected =
      repeatedClassifications.length >= 2 ||
      repeatedLocations.length >= 3 ||
      recurrence30DaysCount >= 1;

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

    // Temporal escalation triggers
    let escalationLevel = "none";
    let hierarchyOfControlsShift = false;
    let temporalNote = "";

    if (recurrence30DaysCount >= 1) {
      escalationLevel = "critical";
      hierarchyOfControlsShift = true;
      temporalNote = `CRITICAL RECURRENCE: Same hazard class (${input.currentClassification}) detected at this location (${input.currentLocation || "unknown"}) within 30 days. Control effectiveness failure.`;
      operationalPatterns.push(temporalNote);
    } else if (recurrence90DaysCount >= 2) {
      escalationLevel = "high";
      hierarchyOfControlsShift = true;
      temporalNote = `HIGH RECURRENCE: 2+ similar hazards detected at this location within 90 days. Check for systemic maintenance lapses.`;
      operationalPatterns.push(temporalNote);
    } else if (recurrence180DaysCount >= 3) {
      escalationLevel = "medium";
      hierarchyOfControlsShift = false;
      temporalNote = `CHRONIC RECURRENCE: 3+ similar hazards detected at this location within 180 days. Administrative controls are failing.`;
      operationalPatterns.push(temporalNote);
    }

    let degradationRisk = "low";
    if (escalationLevel === "critical") {
      degradationRisk = "critical";
    } else if (escalationLevel === "high" || operationalPatterns.length >= 3) {
      degradationRisk = "high";
    } else if (escalationLevel === "medium" || operationalPatterns.length >= 1) {
      degradationRisk = "medium";
    }

    let siteMemorySummary = "No strong recurring operational memory pattern detected from available findings.";
    let recommendedAction = "Continue monitoring for recurring operational patterns.";

    if (escalationLevel === "critical") {
      siteMemorySummary = `CRITICAL TEMPORAL RECURRENCE: The same hazard category (${input.currentClassification}) has recurring exposure at this location within a 30-day window, demonstrating standard control failure.`;
      recommendedAction = "IMMEDIATE ESCALATION: Transition from administrative controls to permanent physical Engineering Controls or Lockout-Tagout protocols. Retraining is insufficient.";
    } else if (escalationLevel === "high") {
      siteMemorySummary = `HIGH TEMPORAL RECURRENCE: Multiple similar hazard events at this location within 90 days suggest systemic degradation or recurring unsafe conditions.`;
      recommendedAction = "SYSTEMIC AUDIT REQUIRED: Conduct a root-cause audit of regional maintenance processes. Shift to higher-tier Engineering Controls where feasible.";
    } else if (recurringRiskDetected) {
      siteMemorySummary = "SafeScope detected recurring operational patterns that may indicate systemic degradation or repeated control weakness.";
      recommendedAction = "Perform broader operational review instead of isolated corrective action closure.";
    }

    return {
      recurringRiskDetected,
      repeatedClassificationCount: repeatedClassifications.length,
      repeatedLocationCount: repeatedLocations.length,
      operationalPatterns,
      degradationRisk,
      siteMemorySummary,
      recommendedAction,
      temporalRecurrence: {
        recurrence30DaysCount,
        recurrence90DaysCount,
        recurrence180DaysCount,
        escalationLevel,
        hierarchyOfControlsShift,
        temporalNotes: temporalNote || "No active temporal recurrence triggers."
      }
    };
  }
}
