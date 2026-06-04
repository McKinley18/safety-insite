import {
  SafeScopeActionQualityInput,
  SafeScopeActionQualityOutput,
  SafeScopeActionQualityRating,
  SafeScopeControlLevel,
} from "./action-quality.types";

function unique(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => String(item || "").trim()).filter(Boolean)));
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

export class SafeScopeActionQualityService {
  evaluate(input: SafeScopeActionQualityInput): SafeScopeActionQualityOutput {
    const actions = input.correctiveActions || [];
    const combinedActionText = actions
      .map((action) =>
        [
          action.title,
          action.description,
          action.priority,
          action.assignedRole,
          action.dueDate,
          ...(action.referenceStandards || []),
          ...(action.verificationEvidence || []),
          ...(action.suggestedFixes || []),
        ].join(" "),
      )
      .join(" ")
      .toLowerCase();

    const actionStrengths: string[] = [];
    const actionWeaknesses: string[] = [];
    const missingActionElements: string[] = [];
    const recommendedActionImprovements: string[] = [];
    const verificationRequirements: string[] = [];
    const closureBlockers: string[] = [];

    if (actions.length) {
      actionStrengths.push("At least one corrective action is available for review.");
    } else {
      missingActionElements.push("No corrective action is documented.");
      recommendedActionImprovements.push("Add a corrective action that controls the hazard source, assigns ownership, sets a due date, and requires verification evidence.");
      closureBlockers.push("Closure cannot be supported without a documented corrective action.");
    }

    const hasOwner = actions.some((action) => Boolean(action.assignedRole));
    const hasDueDate = actions.some((action) => Boolean(action.dueDate));
    const hasStandardLink = actions.some((action) => Boolean(action.referenceStandards?.length));
    const hasVerification = actions.some((action) => Boolean(action.verificationEvidence?.length));

    if (hasOwner) actionStrengths.push("Corrective action ownership is documented.");
    else {
      missingActionElements.push("Responsible owner or role is missing.");
      recommendedActionImprovements.push("Assign a responsible person or role for completion and verification.");
    }

    if (hasDueDate) actionStrengths.push("Corrective action due date is documented.");
    else {
      missingActionElements.push("Corrective action due date is missing.");
      recommendedActionImprovements.push("Add a due date based on risk severity and exposure potential.");
    }

    if (hasStandardLink) actionStrengths.push("Corrective action is linked to at least one candidate standard.");
    else if (input.suggestedStandards?.length) {
      actionWeaknesses.push("A standard candidate exists, but the corrective action is not linked to it.");
      recommendedActionImprovements.push("Tie the corrective action to the strongest applicable standard candidate after qualified review.");
    }

    if (hasVerification) actionStrengths.push("Verification evidence is identified.");
    else {
      missingActionElements.push("Verification evidence is missing.");
      verificationRequirements.push("Require before/after photos, measurement records, supervisor verification, or other closure evidence appropriate to the hazard.");
      closureBlockers.push("Closure should remain blocked until verification evidence is documented.");
    }

    const strongestControlLevel = this.getStrongestControlLevel(combinedActionText);

    if (strongestControlLevel === "elimination" || strongestControlLevel === "substitution" || strongestControlLevel === "engineering" || strongestControlLevel === "isolation") {
      actionStrengths.push(`Corrective action includes a higher-order control: ${strongestControlLevel}.`);
    }

    if (strongestControlLevel === "administrative" || strongestControlLevel === "ppe" || strongestControlLevel === "unknown") {
      actionWeaknesses.push("Corrective action may rely on lower-order controls or lacks clear source control.");
      recommendedActionImprovements.push("Evaluate elimination, substitution, engineering controls, isolation, guarding, ventilation, lockout/tagout, or physical separation before relying on administrative controls or PPE.");
    }

    const highRisk =
      input.risk?.riskBand === "High" ||
      input.risk?.riskBand === "Critical" ||
      input.risk?.requiresShutdown ||
      input.risk?.imminentDanger ||
      input.risk?.fatalityPotential;

    if (highRisk && !combinedActionText.includes("interim") && !combinedActionText.includes("shutdown") && !combinedActionText.includes("stop")) {
      actionWeaknesses.push("High-risk condition lacks clear interim protection, shutdown, or exposure-control language.");
      recommendedActionImprovements.push("For high-risk conditions, document immediate interim protection, shutdown/stop-work decision, barricading, isolation, or supervisor authorization.");
      closureBlockers.push("High-risk corrective action needs supervisor review and interim exposure control before closure.");
    }

    if (input.evidenceSufficiency?.sufficientForClosure === false) {
      closureBlockers.push("Evidence sufficiency layer indicates closure is not yet supported.");
    }

    const overallRating = this.getOverallRating({
      actionsCount: actions.length,
      missingCount: missingActionElements.length,
      weaknessCount: actionWeaknesses.length,
      closureBlockerCount: closureBlockers.length,
      strongestControlLevel,
      hasVerification,
      highRisk,
    });

    return {
      engine: "safescope_action_quality",
      mode: "deterministic_offline",
      classification: input.classification,
      overallRating,
      strongestControlLevel,
      actionStrengths: unique(actionStrengths),
      actionWeaknesses: unique(actionWeaknesses),
      missingActionElements: unique(missingActionElements),
      recommendedActionImprovements: unique(recommendedActionImprovements),
      verificationRequirements: unique(verificationRequirements),
      closureBlockers: unique(closureBlockers),
      requiresSupervisorReview: Boolean(highRisk || closureBlockers.length || overallRating !== "strong"),
      canInventCorrectiveAction: false,
      canCloseWithoutVerification: false,
      canReduceHumanReview: false,
      sourceBoundary:
        "SafeScope action quality intelligence evaluates corrective-action completeness, control strength, verification needs, and closure readiness. It cannot invent completed work, bypass verification, reduce required human review, or finalize compliance decisions.",
    };
  }

  private getStrongestControlLevel(text: string): SafeScopeControlLevel {
    if (includesAny(text, ["eliminate", "remove hazard", "remove exposure"])) return "elimination";
    if (includesAny(text, ["substitute", "replace chemical", "less hazardous"])) return "substitution";
    if (includesAny(text, ["guard", "interlock", "ventilation", "local exhaust", "barrier", "berm", "redesign", "engineer", "enclosure"])) return "engineering";
    if (includesAny(text, ["isolate", "lockout", "tagout", "de-energize", "barricade", "segregate", "separate"])) return "isolation";
    if (includesAny(text, ["procedure", "training", "sign", "policy", "inspection", "rotation", "administrative"])) return "administrative";
    if (includesAny(text, ["ppe", "glove", "respirator", "hearing protection", "goggles", "face shield"])) return "ppe";
    return "unknown";
  }

  private getOverallRating(input: {
    actionsCount: number;
    missingCount: number;
    weaknessCount: number;
    closureBlockerCount: number;
    strongestControlLevel: SafeScopeControlLevel;
    hasVerification: boolean;
    highRisk: boolean;
  }): SafeScopeActionQualityRating {
    if (!input.actionsCount) return "insufficient";
    if (input.closureBlockerCount >= 2 || input.missingCount >= 3) return "insufficient";
    if (input.closureBlockerCount || input.missingCount >= 2) return "weak";
    if (!input.hasVerification) return "interim_only";
    if (input.highRisk && ["administrative", "ppe", "unknown"].includes(input.strongestControlLevel)) return "interim_only";
    if (input.weaknessCount) return "adequate_with_review";
    return "strong";
  }
}
