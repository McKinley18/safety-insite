export class HazardGraphService {
  evaluate(input: {
    classification: string;
    additionalHazards?: any[];
    energyTransferIntelligence?: any;
    humanFactors?: any;
    operationalState?: any;
    barrierIntelligence?: any;
  }) {
    const nodes: string[] = [];
    const edges: string[] = [];
    const cascadeRisks: string[] = [];

    nodes.push(input.classification);

    for (const hazard of input.additionalHazards || []) {
      if (hazard?.name) {
        nodes.push(hazard.name);
        edges.push(`${input.classification} -> ${hazard.name}`);
      }
    }

    if (input.energyTransferIntelligence?.uncontrolledEnergyLikely) {
      nodes.push("uncontrolled_energy");
      edges.push(`${input.classification} -> uncontrolled_energy`);
      cascadeRisks.push("Uncontrolled energy may amplify exposure severity.");
    }

    if (input.humanFactors?.lineOfFireSignals?.length) {
      nodes.push("line_of_fire");
      edges.push(`${input.classification} -> line_of_fire`);
      cascadeRisks.push("Worker positioning may increase cascading injury exposure.");
    }

    if (input.operationalState?.primaryState) {
      nodes.push(input.operationalState.primaryState);
      edges.push(`${input.operationalState.primaryState} -> ${input.classification}`);
    }

    if (input.barrierIntelligence?.failedOrMissingBarriers?.length) {
      nodes.push("barrier_failure");
      edges.push(`barrier_failure -> ${input.classification}`);
      cascadeRisks.push("Barrier degradation may allow escalation into secondary hazards.");
    }

    const graphComplexity =
      edges.length >= 5
        ? "high"
        : edges.length >= 3
          ? "medium"
          : "low";

    return {
      nodes: Array.from(new Set(nodes)),
      edges: Array.from(new Set(edges)),
      graphComplexity,
      cascadeRisks,
      graphSummary:
        "SafeScope mapped interacting hazards, operational states, barrier failures, and energy-transfer relationships to identify possible cascading risk pathways.",
    };
  }
}
