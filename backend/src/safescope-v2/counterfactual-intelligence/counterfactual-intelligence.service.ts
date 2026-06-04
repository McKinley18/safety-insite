export class CounterfactualIntelligenceService {
  evaluate(input: {
    classification: string;
    operationalReasoning?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
    controlIntelligence?: any;
    actionEffectiveness?: any;
  }) {
    const counterfactuals: string[] = [];
    const preventionLevers: string[] = [];

    if (input.barrierIntelligence?.failedOrMissingBarriers?.length) {
      counterfactuals.push("If the failed or missing barrier had been effective, the exposure pathway would likely have been reduced.");
      preventionLevers.push("Restore and verify the failed barrier.");
    }

    if (input.energyTransferIntelligence?.uncontrolledEnergyLikely) {
      counterfactuals.push("If the energy source had been isolated or controlled, injury potential would likely have been reduced.");
      preventionLevers.push("Control, isolate, or verify zero energy before exposure.");
    }

    if (input.controlIntelligence?.durableControlPresent === false) {
      counterfactuals.push("If a durable engineering or energy-control measure were present, reliance on behavior or PPE would likely decrease.");
      preventionLevers.push("Strengthen the control set with engineering, elimination, substitution, or energy-control measures.");
    }

    if (input.actionEffectiveness?.unresolvedElements?.length) {
      counterfactuals.push("If corrective actions directly addressed all unresolved causal elements, recurrence likelihood would likely decrease.");
      preventionLevers.push("Revise corrective actions to address unresolved causal-chain elements.");
    }

    if (!counterfactuals.length) {
      counterfactuals.push("No strong counterfactual prevention pathway was identified from available information.");
    }

    return {
      counterfactuals,
      preventionLevers: Array.from(new Set(preventionLevers)),
      strongestPreventionLever: preventionLevers[0] || "Additional evidence needed to identify strongest prevention lever.",
      counterfactualSummary:
        "SafeScope evaluated how alternate control states may have reduced exposure, energy transfer, recurrence, or injury potential.",
    };
  }
}
