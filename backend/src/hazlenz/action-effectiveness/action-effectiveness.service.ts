export class ActionEffectivenessService {
  evaluate(input: {
    generatedActions?: any[];
    operationalReasoning?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
    controlIntelligence?: any;
  }) {
    const actions = input.generatedActions || [];
    const actionText = actions
      .flatMap((action) => [
        action.title,
        action.description,
        ...(action.suggestedFixes || []),
      ])
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const addressedElements: string[] = [];
    const unresolvedElements: string[] = [];

    if (input.operationalReasoning?.exposurePathways?.length) {
      if (actionText.includes("restrict") || actionText.includes("access") || actionText.includes("barricade") || actionText.includes("guard")) {
        addressedElements.push("Exposure pathway addressed.");
      } else {
        unresolvedElements.push("Corrective action may not clearly address the exposure pathway.");
      }
    }

    if (input.energyTransferIntelligence?.energySources?.length) {
      if (actionText.includes("lockout") || actionText.includes("isolate") || actionText.includes("de-energize") || actionText.includes("guard") || actionText.includes("control")) {
        addressedElements.push("Energy source or energy transfer pathway addressed.");
      } else {
        unresolvedElements.push("Corrective action may not directly control the energy source.");
      }
    }

    if (input.barrierIntelligence?.failedOrMissingBarriers?.length) {
      if (actionText.includes("install") || actionText.includes("repair") || actionText.includes("replace") || actionText.includes("guard") || actionText.includes("cover") || actionText.includes("interlock")) {
        addressedElements.push("Failed or missing barrier addressed.");
      } else {
        unresolvedElements.push("Corrective action may not directly restore the failed or missing barrier.");
      }
    }

    if (input.controlIntelligence?.verificationNeeded) {
      if (actionText.includes("verify") || actionText.includes("confirm") || actionText.includes("document") || actionText.includes("inspect")) {
        addressedElements.push("Verification step included.");
      } else {
        unresolvedElements.push("Verification step should be explicitly included before closure.");
      }
    }

    const effectivenessScore = Math.max(
      0,
      Math.min(100, 60 + addressedElements.length * 12 - unresolvedElements.length * 15)
    );

    return {
      effectivenessScore,
      effectivenessBand:
        effectivenessScore >= 85
          ? "strong"
          : effectivenessScore >= 65
            ? "adequate"
            : "weak",
      addressedElements: Array.from(new Set(addressedElements)),
      unresolvedElements: Array.from(new Set(unresolvedElements)),
      effectivenessStatement:
        effectivenessScore >= 85
          ? "Corrective actions appear well aligned with the causal chain, energy transfer pathway, and barrier failure."
          : effectivenessScore >= 65
            ? "Corrective actions appear usable, but should be reviewed for stronger verification or durable control."
            : "Corrective actions may not fully address the causal chain, energy transfer pathway, or failed barrier.",
      recommendedImprovement:
        unresolvedElements.length
          ? "Strengthen the corrective action by explicitly addressing unresolved causal, energy, barrier, or verification elements."
          : "Maintain verification evidence before closing the action.",
    };
  }
}
