export class HumanFactorsService {
  evaluate(input: {
    text: string;
    classification: string;
    operationalState?: any;
    eventSequence?: any;
    energyTransferIntelligence?: any;
  }) {
    const text = String(input.text || "").toLowerCase();

    const humanFactorSignals: string[] = [];
    const behaviorRiskSignals: string[] = [];
    const supervisionSignals: string[] = [];
    const visibilitySignals: string[] = [];
    const lineOfFireSignals: string[] = [];

    if (text.includes("rushing") || text.includes("production pressure") || text.includes("behind schedule")) {
      behaviorRiskSignals.push("Production pressure or rushing may be contributing to exposure.");
    }

    if (text.includes("bypassed") || text.includes("disabled") || text.includes("removed guard")) {
      behaviorRiskSignals.push("Bypass or removal of a protective control may indicate normalization of deviance.");
    }

    if (text.includes("not trained") || text.includes("training") || text.includes("unaware")) {
      humanFactorSignals.push("Training or awareness may be a contributing factor.");
    }

    if (text.includes("supervisor") || text.includes("foreman") || text.includes("lead")) {
      supervisionSignals.push("Supervisor or lead involvement is referenced.");
    }

    if (text.includes("blind spot") || text.includes("poor lighting") || text.includes("visibility") || text.includes("obstructed")) {
      visibilitySignals.push("Visibility limitation may increase exposure likelihood.");
    }

    if (text.includes("line of fire") || text.includes("between") || text.includes("pinch") || text.includes("under suspended") || text.includes("near moving")) {
      lineOfFireSignals.push("Worker may be positioned in a line-of-fire or caught-between exposure zone.");
    }

    const humanFactorsPresent =
      humanFactorSignals.length ||
      behaviorRiskSignals.length ||
      supervisionSignals.length ||
      visibilitySignals.length ||
      lineOfFireSignals.length;

    return {
      humanFactorsPresent: Boolean(humanFactorsPresent),
      humanFactorSignals,
      behaviorRiskSignals,
      supervisionSignals,
      visibilitySignals,
      lineOfFireSignals,
      humanFactorsSummary: humanFactorsPresent
        ? "SafeScope detected human-factor or organizational signals that may influence exposure likelihood or control reliability."
        : "No strong human-factor signal detected from available narrative.",
      recommendedReview:
        humanFactorsPresent
          ? "Review supervision, training, task planning, visibility, worker positioning, and production-pressure factors before closing this finding."
          : "Continue to verify worker exposure and task context during supervisor review.",
    };
  }
}
