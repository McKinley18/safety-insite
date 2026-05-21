import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence.seed";
import { StandardsIntelligenceRecord } from "./standards-intelligence.types";

export interface StandardsIntelligenceMatch {
  standard: StandardsIntelligenceRecord;
  score: number;
  band: "primary" | "supporting" | "contextual";
  reasons: string[];
  missingEvidence: string[];
  exclusionWarnings: string[];
}

function normalize(value: string) {
  return String(value || "").toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function scoreTerms(
  text: string,
  terms: string[],
  points: number,
  label: string,
) {
  const matched = terms.filter((term) => text.includes(normalize(term)));
  return {
    score: matched.length * points,
    reasons: matched.map((term) => `${label}: ${term}`),
  };
}

export class StandardsIntelligenceService {
  private readonly standards = STANDARDS_INTELLIGENCE_SEED;

  match(input: {
    text: string;
    classification?: string;
    scopes?: string[];
    limit?: number;
  }): StandardsIntelligenceMatch[] {
    const text = normalize(`${input.classification || ""} ${input.text || ""}`);
    const selectedScopes = (input.scopes || []).map(normalize);
    const limit = input.limit || 8;

    const results = this.standards
      .map((standard) => this.scoreStandard(standard, text, selectedScopes))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  private scoreStandard(
    standard: StandardsIntelligenceRecord,
    text: string,
    selectedScopes: string[],
  ): StandardsIntelligenceMatch {
    let score = 0;
    const reasons: string[] = [];
    const missingEvidence: string[] = [];
    const exclusionWarnings: string[] = [];

    const scope = normalize(standard.scope);
    const agency = normalize(standard.agency);

    const allScopeSelected =
      selectedScopes.length === 0 ||
      selectedScopes.includes("all") ||
      selectedScopes.includes("let safescope evaluate");

    if (allScopeSelected) {
      score += 5;
      reasons.push("Scope: SafeScope evaluate");
    } else if (
      selectedScopes.includes(scope) ||
      selectedScopes.includes(agency) ||
      (agency === "msha" && selectedScopes.includes("mining"))
    ) {
      score += 20;
      reasons.push(`Scope match: ${standard.scope}`);
    } else {
      score -= 25;
      exclusionWarnings.push(
        `Selected scope does not strongly match ${standard.scope}.`,
      );
    }

    const hazard = scoreTerms(text, standard.hazardFamilies, 12, "hazard");
    const equipment = scoreTerms(text, standard.equipmentTags, 10, "equipment");
    const task = scoreTerms(text, standard.taskTags, 7, "task");
    const exposure = scoreTerms(text, standard.exposureTags, 8, "exposure");
    const controls = scoreTerms(text, standard.controlTags, 5, "control");
    const boosts = scoreTerms(text, standard.searchBoostTerms, 12, "boost");

    for (const bucket of [
      hazard,
      equipment,
      task,
      exposure,
      controls,
      boosts,
    ]) {
      score += bucket.score;
      reasons.push(...bucket.reasons);
    }

    score += Math.max(0, 6 - standard.authorityTier * 2);
    reasons.push(`Authority tier ${standard.authorityTier}`);

    for (const requirement of standard.evidenceRequirements) {
      const questionText = normalize(requirement.question);
      const likelyCovered = includesAny(text, [
        ...standard.hazardFamilies,
        ...standard.equipmentTags,
        ...standard.taskTags,
        ...standard.exposureTags,
        ...standard.controlTags,
      ]);

      if (requirement.requiredForPrimary && !likelyCovered) {
        missingEvidence.push(requirement.question);
        score -= requirement.missingEvidenceImpact === "high" ? 12 : 6;
      } else if (!requirement.requiredForPrimary && !likelyCovered) {
        missingEvidence.push(requirement.question);
      }

      if (questionText.includes("scope") && selectedScopes.length === 0) {
        missingEvidence.push(requirement.question);
      }
    }

    for (const rule of standard.exclusionRules) {
      if (rule.keywordsAny?.length && includesAny(text, rule.keywordsAny)) {
        score -= 20;
        exclusionWarnings.push(rule.reason);
      }

      if (
        rule.keywordsAll?.length &&
        rule.keywordsAll.every((term) => text.includes(normalize(term)))
      ) {
        score -= 20;
        exclusionWarnings.push(rule.reason);
      }

      if (
        rule.excludeWhenMissingAny?.length &&
        !includesAny(text, rule.excludeWhenMissingAny)
      ) {
        score -= 15;
        exclusionWarnings.push(rule.reason);
      }

      if (
        rule.excludeWhenMissingAll?.length &&
        !rule.excludeWhenMissingAll.every((term) =>
          text.includes(normalize(term)),
        )
      ) {
        score -= 15;
        exclusionWarnings.push(rule.reason);
      }
    }

    const band =
      score >= 70 ? "primary" : score >= 35 ? "supporting" : "contextual";

    return {
      standard,
      score,
      band,
      reasons,
      missingEvidence: Array.from(new Set(missingEvidence)).slice(0, 6),
      exclusionWarnings: Array.from(new Set(exclusionWarnings)).slice(0, 6),
    };
  }
}
