export class ReasoningDriftService {
  evaluate(input: {
    classification: string;
    confidenceCalibration?: any;
    contradictionIntelligence?: any;
    standardsReasoning?: any;
    operationalReasoning?: any;
    priorFindings?: any[];
  }) {
    const driftSignals: string[] = [];

    let driftScore = 0;

    if (input.contradictionIntelligence?.contradictionsDetected) {
      driftScore += 25;
      driftSignals.push("Contradictions detected in operational interpretation.");
    }

    if (
      input.confidenceCalibration?.calibrationBand === "limited_reliability"
    ) {
      driftScore += 30;
      driftSignals.push("Confidence calibration indicates limited reliability.");
    }

    const priorMatches = (input.priorFindings || []).filter(
      (f) =>
        String(f.classification || '').toLowerCase() ===
        String(input.classification || '').toLowerCase()
    );

    if (priorMatches.length >= 3) {
      driftSignals.push(
        "Recurring classification patterns detected across historical findings."
      );
    }

    if (
      !input.standardsReasoning?.topDefensible?.length
    ) {
      driftScore += 15;
      driftSignals.push(
        "Limited defensible standards mapping available."
      );
    }

    if (
      !input.operationalReasoning?.reasoningSummary
    ) {
      driftScore += 20;
      driftSignals.push(
        "Operational reasoning chain is incomplete."
      );
    }

    const driftBand =
      driftScore >= 60
        ? "high"
        : driftScore >= 30
          ? "moderate"
          : "low";

    return {
      driftScore,
      driftBand,
      driftSignals,
      driftSummary:
        driftBand === "high"
          ? "SafeScope reasoning drift risk is elevated and requires supervisory validation."
          : driftBand === "moderate"
            ? "Some reasoning instability indicators are present."
            : "No major reasoning drift indicators detected.",
    };
  }
}
