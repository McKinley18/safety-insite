import { classifyHazard } from './hazard.classifier';
import { HazardRules } from './hazard.rules';

export const generateActions = (text: string, riskBand: string) => {
  const classification = classifyHazard(text);

  console.log("CLASSIFICATION:", classification);

  const hazardTypes = classification.hazardTypes || [];

  let combinedImmediate = "";
  let combinedActions: string[] = [];
  let combinedCorrective = "";
  let combinedStandards: string[] = [];

  hazardTypes.forEach((type) => {
    const rule = HazardRules[type];

    if (rule) {
      combinedImmediate = combinedImmediate || rule.immediateAction;

      combinedActions.push(...(rule.prioritizedActions || []));
      combinedStandards.push(...(rule.standards || []));

      combinedCorrective += " " + rule.correctiveAction;
    }
  });

  // ===== FALLBACK =====
  if (combinedActions.length === 0) {
    if (riskBand === "CRITICAL") {
      combinedImmediate = "IMMEDIATE ACTION REQUIRED: Stop work and correct hazard.";
      combinedActions = [
        "Inspect hazard immediately",
        "Apply corrective action",
        "Verify compliance",
        "Document correction"
      ];
    } else {
      combinedImmediate = "Corrective action required.";
      combinedActions = [
        "Inspect hazard",
        "Apply corrective action",
        "Verify condition"
      ];
    }
  }

  return {
    immediateAction: combinedImmediate,
    prioritizedActions: combinedActions.map((a, i) => `${i + 1}. ${a}`).join("\n"),
    correctiveAction: combinedCorrective.trim(),
    standards: Array.from(new Set(combinedStandards))
  };
};
