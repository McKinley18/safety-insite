export class ContradictionIntelligenceService {
  evaluate(input: {
    text: string;
    operationalState?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
    humanFactors?: any;
  }) {
    const text = String(input.text || "").toLowerCase();
    const contradictions: string[] = [];

    if ((text.includes("locked out") || text.includes("de-energized")) &&
        (text.includes("running") || text.includes("operating") || text.includes("moving") || text.includes("energized"))) {
      contradictions.push("Energy-control language conflicts with active equipment or energized-state language.");
    }

    if ((text.includes("guarded") || text.includes("guard in place")) &&
        (text.includes("unguarded") || text.includes("missing guard") || text.includes("removed guard"))) {
      contradictions.push("Guarding status appears internally inconsistent.");
    }

    if ((text.includes("no exposure") || text.includes("no employee exposure")) &&
        (text.includes("employee") || text.includes("worker") || text.includes("within reach") || text.includes("near"))) {
      contradictions.push("No-exposure statement conflicts with worker proximity or access language.");
    }

    if ((text.includes("closed") || text.includes("completed")) &&
        (text.includes("not verified") || text.includes("not corrected") || text.includes("still open"))) {
      contradictions.push("Closure language conflicts with unresolved or unverified condition language.");
    }

    const severity =
      contradictions.length >= 2
        ? "high"
        : contradictions.length === 1
          ? "medium"
          : "none";

    return {
      contradictionsDetected: contradictions.length > 0,
      contradictionSeverity: severity,
      contradictions,
      reviewImpact:
        contradictions.length > 0
          ? "Contradictions reduce decision confidence and require supervisor clarification before finalizing standards, risk, or corrective actions."
          : "No major internal contradictions detected from available narrative.",
    };
  }
}
