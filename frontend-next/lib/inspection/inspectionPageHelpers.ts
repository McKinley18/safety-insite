export type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";

export function getInspectionRiskScale(input: {
  riskProfileId: RiskProfileId;
  severityScale: any[];
  likelihoodScale: any[];
}) {
  const maxScore =
    input.riskProfileId === "simple_4x4"
      ? 4
      : input.riskProfileId === "advanced_6x6"
        ? 6
        : 5;

  return {
    maxScore,
    severity: input.severityScale.filter((item) => item.score <= maxScore),
    likelihood: input.likelihoodScale.filter((item) => item.score <= maxScore),
    label:
      input.riskProfileId === "simple_4x4"
        ? "Simple 4x4"
        : input.riskProfileId === "advanced_6x6"
          ? "Advanced 6x6"
          : "Standard 5x5",
  };
}

export function clampInspectionStep(input: {
  nextStep: number;
  stepCount: number;
}) {
  return Math.max(1, Math.min(input.stepCount, input.nextStep));
}

export function scrollInspectionPageToTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

export function scrollInspectionPageToBottom() {
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  });
}
