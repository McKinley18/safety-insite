export class EvidenceQualityService {
  evaluate(input: {
    text: string;
    evidenceTexts?: string[];
    photosAttached?: boolean;
    operationalReasoning?: any;
    confidenceIntelligence?: any;
  }) {
    const text = String(input.text || "").toLowerCase();
    const evidenceTexts = input.evidenceTexts || [];

    const strengths: string[] = [];
    const gaps: string[] = [];

    if (text.length > 120) strengths.push("Narrative contains meaningful detail.");
    else gaps.push("Narrative is short and may not fully support classification.");

    if (input.photosAttached) strengths.push("Photo evidence is attached.");
    else gaps.push("No photo evidence is attached.");

    if (evidenceTexts.some(Boolean)) strengths.push("Supplemental evidence notes are available.");
    else gaps.push("No supplemental evidence notes are available.");

    if (text.includes("location") || text.includes("area") || text.includes("conveyor") || text.includes("panel")) {
      strengths.push("Location or equipment context is present.");
    } else {
      gaps.push("Location or equipment context is limited.");
    }

    if (input.operationalReasoning?.uncertainty?.length) {
      gaps.push(...input.operationalReasoning.uncertainty.slice(0, 3));
    }

    const score = Math.max(0, Math.min(100, 100 - gaps.length * 14 + strengths.length * 5));

    return {
      evidenceQualityScore: score,
      evidenceQualityBand: score >= 80 ? "strong" : score >= 60 ? "usable" : "weak",
      strengths: Array.from(new Set(strengths)),
      gaps: Array.from(new Set(gaps)),
      defensibilityStatement:
        score >= 80
          ? "Evidence appears strong enough to support classification and report review."
          : score >= 60
            ? "Evidence is usable, but additional context would improve defensibility."
            : "Evidence should be strengthened before relying on final classification, standards, or corrective actions.",
    };
  }
}
