export class ConfidenceCalibrationService {
  evaluate(input: {
    classification: string;
    confidenceIntelligence?: any;
    contradictionIntelligence?: any;
    evidenceQuality?: any;
    standardsReasoning?: any;
    actionEffectiveness?: any;
  }) {
    const baseConfidence = Number(input.confidenceIntelligence?.overallConfidence ?? 0.5);
    let calibratedConfidence = baseConfidence;

    const calibrationWarnings: string[] = [];
    const reliabilityFactors: string[] = [];

    if (input.contradictionIntelligence?.contradictionsDetected) {
      calibratedConfidence -= 0.15;
      calibrationWarnings.push("Confidence reduced because internal contradictions were detected.");
    }

    if (input.evidenceQuality?.evidenceQualityBand === "weak") {
      calibratedConfidence -= 0.12;
      calibrationWarnings.push("Confidence reduced because evidence quality is weak.");
    }

    if (input.standardsReasoning?.topDefensible?.length) {
      reliabilityFactors.push("Standards reasoning produced defensibility-ranked results.");
    } else {
      calibratedConfidence -= 0.08;
      calibrationWarnings.push("Confidence reduced because standards defensibility support is limited.");
    }

    if (input.actionEffectiveness?.effectivenessBand === "weak") {
      calibratedConfidence -= 0.08;
      calibrationWarnings.push("Confidence reduced because corrective action effectiveness is weak.");
    }

    calibratedConfidence = Math.max(0, Math.min(0.99, Number(calibratedConfidence.toFixed(2))));

    const calibrationBand =
      calibratedConfidence >= 0.8
        ? "reliable"
        : calibratedConfidence >= 0.6
          ? "use_with_review"
          : "limited_reliability";

    return {
      baseConfidence,
      calibratedConfidence,
      calibrationBand,
      reliabilityFactors,
      calibrationWarnings,
      reliabilityStatement:
        calibrationBand === "reliable"
          ? "SafeScope confidence appears supported by available evidence, standards reasoning, and consistency checks."
          : calibrationBand === "use_with_review"
            ? "SafeScope output is usable but should be reviewed against evidence gaps, contradictions, or control effectiveness."
            : "SafeScope output has limited reliability and should not be relied on without supervisor validation.",
    };
  }
}
