export class EventSequenceService {
  evaluate(input: {
    text: string;
    classification: string;
    operationalReasoning?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
  }) {
    const text = String(input.text || "").toLowerCase();

    const beforeEvent: string[] = [];
    const duringEvent: string[] = [];
    const afterEvent: string[] = [];
    const sequenceGaps: string[] = [];

    if (text.includes("maintenance") || text.includes("repair") || text.includes("cleaning") || text.includes("clearing")) {
      beforeEvent.push("Work activity appears to involve maintenance, repair, cleaning, clearing, or adjustment.");
    }

    if (text.includes("running") || text.includes("operating") || text.includes("energized") || text.includes("moving")) {
      duringEvent.push("Hazard may have existed while equipment or energy source was active.");
    }

    if (text.includes("shutdown") || text.includes("locked out") || text.includes("de-energized") || text.includes("isolated")) {
      afterEvent.push("Energy control or shutdown condition is referenced.");
    }

    if (!beforeEvent.length) sequenceGaps.push("Pre-event work activity is not clearly described.");
    if (!duringEvent.length) sequenceGaps.push("Event-state condition is not clearly described.");
    if (!afterEvent.length) sequenceGaps.push("Post-control or verification status is not clearly described.");

    return {
      beforeEvent,
      duringEvent,
      afterEvent,
      sequenceGaps,
      likelySequence: [
        beforeEvent[0] || "Pre-event condition unknown.",
        duringEvent[0] || "Event-state condition unknown.",
        afterEvent[0] || "Post-event control status unknown.",
      ],
      sequenceConfidence:
        sequenceGaps.length === 0 ? "high" : sequenceGaps.length === 1 ? "medium" : "low",
      sequenceSummary:
        "SafeScope reconstructed the likely event sequence from work activity, energy state, exposure, and control-status signals.",
    };
  }
}
