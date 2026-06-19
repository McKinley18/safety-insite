export function inferCategory(text: string) {
  const value = text.toLowerCase();
  if (/\b(electrical|electric|disconnect|breaker|panel|mcc|switchgear|switch|cord|wire|wiring|conduit|junction|receptacle|outlet|energized|voltage|arc flash|transformer)\b/.test(value)) {
    return "Electrical";
  }
  if (value.includes("guard") || value.includes("conveyor") || value.includes("belt") || value.includes("pulley")) {
    return "Machine Guarding";
  }
  if (value.includes("fall") || value.includes("edge") || value.includes("rail") || value.includes("ladder")) {
    return "Fall Protection";
  }
  if (value.includes("lockout") || value.includes("loto") || value.includes("energized")) {
    return "Lockout/Tagout";
  }
  if (value.includes("slip") || value.includes("trip") || value.includes("walkway") || value.includes("floor")) {
    return "Walking/Working Surfaces";
  }
  if (value.includes("ppe") || value.includes("glasses") || value.includes("gloves") || value.includes("hard hat")) {
    return "PPE";
  }
  if (value.includes("spill") || value.includes("trash") || value.includes("debris") || value.includes("housekeeping")) {
    return "Housekeeping";
  }
  if (value.includes("forklift") || value.includes("loader") || value.includes("truck") || value.includes("mobile equipment")) {
    return "Mobile Equipment";
  }
  return "Other";
}

export function inferRiskSignal(text: string, photosLength: number) {
  const value = text.toLowerCase();
  if (
    value.includes("unguarded") ||
    value.includes("fall") ||
    value.includes("energized") ||
    value.includes("exposed wire") ||
    value.includes("pinch point") ||
    value.includes("crush") ||
    value.includes("fatal")
  ) {
    return "High";
  }
  if (
    value.includes("blocked") ||
    value.includes("spill") ||
    value.includes("trip") ||
    value.includes("missing") ||
    photosLength > 0
  ) {
    return "Medium";
  }
  return "Low";
}

export function recommendedAction(category: string, riskSignal: string) {
  if (category === "Machine Guarding") {
    return "Stop use if exposure exists, protect the area, and verify guarding is installed before restart.";
  }
  if (category === "Electrical") {
    return "Restrict access, remove from service if unsafe, and have a qualified person evaluate the condition.";
  }
  if (category === "Fall Protection") {
    return "Control access to the fall exposure and verify guardrail, cover, or fall protection controls.";
  }
  if (category === "Walking/Working Surfaces") {
    return "Remove the walking surface hazard, mark the area, and verify the surface is safe for travel.";
  }
  if (category === "Lockout/Tagout") {
    return "Stop affected work and verify energy control procedures before maintenance or clearing activity continues.";
  }
  if (riskSignal === "High") {
    return "Pause affected work, protect employees from exposure, and verify corrective action before restart.";
  }
  return "Correct the condition, document completion, and verify the hazard has been controlled.";
}

export function getQuickReviewResult(input: {
  hazardCategory: string;
  description: string;
  location: string;
  photosLength: number;
}) {
  const reviewText = `${input.hazardCategory} ${input.description} ${input.location}`.trim();
  const suggestedCategory = input.hazardCategory || inferCategory(reviewText);
  const riskSignal = inferRiskSignal(reviewText, input.photosLength);
  const suggestedAction = recommendedAction(suggestedCategory, riskSignal);

  const result = {
    mode: "quick_preview",
    classification: suggestedCategory,
    risk: {
      riskBand: riskSignal,
      quickSignal: riskSignal,
    },
    summary:
      input.description.trim() ||
      `Potential ${suggestedCategory.toLowerCase()} issue captured for review.`,
    generatedActions: [
      {
        title: suggestedAction,
        priority: riskSignal === "High" ? "High" : riskSignal === "Medium" ? "Medium" : "Low",
        closureEvidence: "Photo",
        source: "HazLenz AI Quick Review",
      },
    ],
    upgradePrompt:
      "Upgrade to Guided Inspection for standards matching, confidence scoring, evidence gaps, and full corrective action planning.",
  };

  return {
    result,
    suggestedCategory,
    suggestedAction,
    riskSignal,
  };
}
