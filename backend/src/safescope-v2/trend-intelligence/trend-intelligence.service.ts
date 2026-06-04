export type TrendIntelligenceInput = {
  classification: string;
  location?: string;
  riskScore?: number;
  priorFindings?: any[];
};

function daysBetween(a?: string, b = new Date().toISOString()) {
  if (!a) return null;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export class TrendIntelligenceService {
  evaluate(input: TrendIntelligenceInput) {
    const priorFindings = input.priorFindings || [];

    const related = priorFindings
      .map((finding) => {
        const classification =
          finding.classification ||
          finding.hazardCategory ||
          finding.safeScopeResult?.classification ||
          "";

        const sameClassification = classification === input.classification;
        const sameLocation =
          input.location &&
          finding.location &&
          String(finding.location).toLowerCase() === String(input.location).toLowerCase();

        const ageDays = daysBetween(finding.createdAt);

        return {
          findingId: finding.id,
          classification,
          location: finding.location,
          riskScore: Number(finding.riskScore || finding.safeScopeResult?.risk?.riskScore || 0),
          ageDays,
          sameClassification,
          sameLocation,
        };
      })
      .filter((finding) => finding.sameClassification || finding.sameLocation);

    const recentRelated = related.filter(
      (finding) => finding.ageDays === null || finding.ageDays <= 60
    );

    const repeatedClassificationCount = related.filter((finding) => finding.sameClassification).length;
    const repeatedLocationCount = related.filter((finding) => finding.sameLocation).length;
    const highRiskRepeatCount = related.filter((finding) => finding.riskScore >= 12).length;

    let recurrenceRisk: "low" | "possible" | "elevated" | "high" = "low";

    if (recentRelated.length >= 3 || highRiskRepeatCount >= 2) recurrenceRisk = "high";
    else if (recentRelated.length >= 2 || repeatedClassificationCount >= 2) recurrenceRisk = "elevated";
    else if (recentRelated.length === 1) recurrenceRisk = "possible";

    const trendDirection =
      recentRelated.length >= 3
        ? "accelerating"
        : recentRelated.length >= 1
          ? "active"
          : "not_established";

    const hotspotArea =
      repeatedLocationCount >= 2
        ? input.location || related.find((finding) => finding.sameLocation)?.location || null
        : null;

    const controlFailureIndicators: string[] = [];

    if (repeatedClassificationCount >= 2) {
      controlFailureIndicators.push("Repeated hazard classification suggests existing controls may not be durable.");
    }

    if (repeatedLocationCount >= 2) {
      controlFailureIndicators.push("Repeated location suggests possible area-level control weakness.");
    }

    if (highRiskRepeatCount >= 2) {
      controlFailureIndicators.push("Multiple related high-risk findings suggest elevated operational drift.");
    }

    const escalationRecommended =
      recurrenceRisk === "high" ||
      highRiskRepeatCount >= 2 ||
      controlFailureIndicators.length >= 2;

    return {
      recurrenceRisk,
      trendDirection,
      hotspotArea,
      relatedFindingCount: related.length,
      recentRelatedFindingCount: recentRelated.length,
      repeatedClassificationCount,
      repeatedLocationCount,
      highRiskRepeatCount,
      escalationRecommended,
      controlFailureIndicators,
      similarFindingsTimeline: related
        .sort((a, b) => (a.ageDays ?? 9999) - (b.ageDays ?? 9999))
        .slice(0, 6),
      recommendation: escalationRecommended
        ? "Escalate this pattern for supervisor review, verify corrective action effectiveness, and consider area-level controls."
        : related.length
          ? "Review related findings for recurring causes before finalizing corrective actions."
          : "No recurring trend detected from provided prior findings.",
    };
  }
}
