export type ControlIntelligenceInput = {
  classification: string;
  risk?: any;
  generatedActions?: any[];
  suggestedStandards?: any[];
  trendIntelligence?: any;
  operationalReasoning?: any;
};

function classifyControl(text: string) {
  const value = text.toLowerCase();

  if (value.includes("eliminate") || value.includes("remove") || value.includes("redesign")) {
    return "elimination";
  }

  if (value.includes("guard") || value.includes("barrier") || value.includes("interlock") || value.includes("engineer") || value.includes("install")) {
    return "engineering";
  }

  if (value.includes("lockout") || value.includes("de-energize") || value.includes("isolate") || value.includes("shutdown")) {
    return "energy_control";
  }

  if (value.includes("inspect") || value.includes("train") || value.includes("procedure") || value.includes("sign") || value.includes("audit")) {
    return "administrative";
  }

  if (value.includes("ppe") || value.includes("glove") || value.includes("respirator") || value.includes("hard hat") || value.includes("eye protection")) {
    return "ppe";
  }

  if (value.includes("verify") || value.includes("document") || value.includes("confirm")) {
    return "verification";
  }

  return "general";
}

const durabilityRank: Record<string, number> = {
  elimination: 5,
  engineering: 4,
  energy_control: 4,
  administrative: 2,
  verification: 2,
  ppe: 1,
  general: 1,
};

export class ControlIntelligenceService {
  evaluate(input: ControlIntelligenceInput) {
    const fixes = (input.generatedActions || []).flatMap((action) => [
      action.title,
      action.description,
      ...(action.suggestedFixes || []),
    ]).filter(Boolean);

    const controlTypes = fixes.map((fix) => classifyControl(String(fix)));
    const uniqueControlTypes = Array.from(new Set(controlTypes));

    const strongestControl =
      uniqueControlTypes
        .sort((a, b) => (durabilityRank[b] || 0) - (durabilityRank[a] || 0))[0] || "general";

    const durableControlPresent = ["elimination", "engineering", "energy_control"].includes(strongestControl);
    const ppeOnly =
      uniqueControlTypes.length > 0 &&
      uniqueControlTypes.every((type) => ["ppe", "verification", "administrative", "general"].includes(type));

    const verificationNeeded =
      input.risk?.requiresShutdown ||
      input.trendIntelligence?.escalationRecommended ||
      input.operationalReasoning?.uncertainty?.length > 0 ||
      !durableControlPresent;

    const controlGaps: string[] = [];

    if (!durableControlPresent) {
      controlGaps.push("No durable engineering, elimination, or energy-control measure was clearly identified.");
    }

    if (ppeOnly) {
      controlGaps.push("Controls appear to rely heavily on PPE, administrative action, or verification.");
    }

    if (input.trendIntelligence?.escalationRecommended) {
      controlGaps.push("Recurring trend suggests previous controls may not be effective or durable.");
    }

    if (input.risk?.requiresShutdown) {
      controlGaps.push("Shutdown or isolation should remain in place until effective controls are verified.");
    }

    return {
      controlTypes: uniqueControlTypes,
      strongestControl,
      durableControlPresent,
      ppeOnly,
      verificationNeeded,
      controlGaps,
      hierarchyAssessment: durableControlPresent
        ? "Durable controls are represented in the recommendation set."
        : "Recommendation set should be strengthened with engineering, elimination, substitution, or energy-control measures where feasible.",
      verificationRecommendation: verificationNeeded
        ? "Require supervisor or competent-person verification before closure."
        : "Standard closure documentation may be sufficient if the field condition matches the finding.",
    };
  }
}
