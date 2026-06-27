export type HazLenzMechanismChain = {
  observedCondition: string;
  failureMode: string;
  exposurePathway: string;
  potentialConsequence: string;
  evidenceGaps: string[];
  controlFocus: string[];
  confidence?: number;
};

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function firstText(...values: any[]) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const found = value.map((item) => cleanText(item)).find(Boolean);
      if (found) return found;
      continue;
    }

    const text = cleanText(value);
    if (text) return text;
  }
  return "";
}

function asTextArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item)).filter(Boolean);
}

function summarize(values: string[], fallback: string) {
  return values.slice(0, 2).join("; ") || fallback;
}

export function getHazLenzMechanismChain(result: any): HazLenzMechanismChain | null {
  if (!result) return null;

  const topLevel = result.mechanismChain;
  if (topLevel && typeof topLevel === "object") {
    const observedCondition = firstText(topLevel.observedCondition);
    const failureMode = firstText(topLevel.failureMode);
    const exposurePathway = firstText(topLevel.exposurePathway);
    const potentialConsequence = firstText(topLevel.potentialConsequence);
    const evidenceGaps = asTextArray(topLevel.evidenceGaps);
    const controlFocus = asTextArray(topLevel.controlFocus);
    const confidence = Number(topLevel.confidence);

    if (observedCondition || failureMode || exposurePathway || potentialConsequence || evidenceGaps.length || controlFocus.length) {
      return {
        observedCondition: observedCondition || "Observed condition needs more detail.",
        failureMode: failureMode || "Failure/release mode is not fully established.",
        exposurePathway: exposurePathway || "Exposure pathway is not fully established.",
        potentialConsequence: potentialConsequence || "Potential consequence is not fully established.",
        evidenceGaps,
        controlFocus,
        ...(Number.isFinite(confidence) ? { confidence: confidence <= 1 ? Math.max(0, Math.min(1, confidence)) : Math.max(0, Math.min(1, confidence / 100)) } : {}),
      };
    }
  }

  const legacy = result.inspectionIntelligence?.mechanismChain;
  if (legacy && typeof legacy === "object") {
    return {
      observedCondition: summarize(asTextArray(legacy.initiatingCondition), firstText(result.decisionExplainability?.decisionSummary, result.explanation, "Observed condition needs more detail.")),
      failureMode: summarize(asTextArray(legacy.releaseOrFailureMode), "Failure/release mode is not fully established."),
      exposurePathway: summarize(asTextArray(legacy.exposurePathway), "Exposure pathway is not fully established."),
      potentialConsequence: summarize(asTextArray(legacy.consequences), "Potential consequence is not fully established."),
      evidenceGaps: asTextArray(legacy.evidenceGaps),
      controlFocus: asTextArray(legacy.controls),
      ...(Number.isFinite(Number(legacy.confidence))
        ? { confidence: Number(legacy.confidence) }
        : {}),
    };
  }

  const injury = result.inspectionIntelligence?.mechanismOfInjury;
  if (injury && typeof injury === "object") {
    return {
      observedCondition: summarize(asTextArray(injury.initiatingCondition), firstText(result.decisionExplainability?.decisionSummary, result.explanation, "Observed condition needs more detail.")),
      failureMode: summarize(asTextArray(injury.failureMode), "Failure/release mode is not fully established."),
      exposurePathway: summarize(asTextArray(injury.exposurePathway), "Exposure pathway is not fully established."),
      potentialConsequence: summarize(asTextArray(injury.potentialConsequences), "Potential consequence is not fully established."),
      evidenceGaps: asTextArray(injury.evidenceGaps),
      controlFocus: asTextArray(injury.controlThemes),
      ...(Number.isFinite(Number(injury.confidence))
        ? { confidence: Number(injury.confidence) }
        : {}),
    };
  }

  return null;
}

