import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence.seed";
import { StandardsIntelligenceRecord } from "./standards-intelligence.types";
import { Standard } from "../../standards/entities/standard.entity";
import { Repository, In, Like } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

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

@Injectable()
export class StandardsIntelligenceService {
  private readonly seedStandards = STANDARDS_INTELLIGENCE_SEED;

  constructor(
    @InjectRepository(Standard)
    private readonly standardRepository: Repository<Standard>,
  ) {}

  async match(input: {
    text: string;
    classification?: string;
    scopes?: string[];
    limit?: number;
  }): Promise<StandardsIntelligenceMatch[]> {
    const text = normalize(`${input.classification || ""} ${input.text || ""}`);
    const selectedScopes = (input.scopes || []).map(normalize);
    const limit = input.limit || 8;

    // 1. Score curated seed results first (boost +15)
    const seedResults = this.seedStandards
      .map((standard) => this.scoreStandard(standard, text, selectedScopes))
      .filter((match) => match.score > 0)
      .map((match) => ({
        ...match,
        score: match.score + 15,
      }));

    // 2. Query standards_master with QueryBuilder
    const query = this.standardRepository
      .createQueryBuilder("s")
      .where("s.is_active = true");

    // Scope filtering
    if (
      selectedScopes.length > 0 &&
      !selectedScopes.some((s) => s === "all" || s === "let safescope evaluate")
    ) {
      const scopeMapping: Record<string, string[]> = {
        msha: ["mining"],
        mining: ["mining"],
        "osha-general": ["general_industry"],
        general_industry: ["general_industry"],
        "1910": ["general_industry"],
        "osha-construction": ["construction"],
        construction: ["construction"],
        "1926": ["construction"],
      };

      const mappedScopes = selectedScopes.flatMap((s) => scopeMapping[s] || []);
      if (mappedScopes.length > 0) {
        query.andWhere("s.scope_code IN (:...mappedScopes)", { mappedScopes });
      }
    }

    // Text prefiltering (tokens)
    const tokens = text.split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length > 0) {
      query.andWhere(
        "(s.citation ILIKE :t OR s.title ILIKE :t OR s.standard_text ILIKE :t)",
        { t: `%${tokens[0]}%` },
      );
    }

    const dbStandards = await query.take(100).getMany();

    const dbResults = dbStandards.map((dbStandard) => {
      const record: StandardsIntelligenceRecord = {
        citation: dbStandard.citation,
        agency: dbStandard.agencyCode === "OSHA" ? "OSHA" : "MSHA",
        scope:
          dbStandard.scopeCode === "mining"
            ? "mining"
            : dbStandard.scopeCode === "construction"
              ? "osha-construction"
              : "osha-general-industry",
        title: dbStandard.title,
        plainLanguageSummary:
          dbStandard.plainLanguageSummary || dbStandard.title,
        hazardFamilies: dbStandard.hazardCodes || [],
        equipmentTags: [],
        taskTags: [],
        exposureTags: [],
        controlTags: dbStandard.requiredControls || [],
        consequenceTags: [],
        searchBoostTerms: dbStandard.keywords || [],
        authorityTier: (dbStandard.authorityTier || 1) as any,
        applicabilityBandDefault: "contextual",
        severityDefault: "medium",
        evidenceRequirements: [],
        exclusionRules: [],
        crossDomainLinks: [],
        sourceKey: dbStandard.sourceKey,
        sourceName: dbStandard.sourceName,
        sourceType: dbStandard.sourceType,
      };
      return this.scoreStandard(record, text, selectedScopes);
    });

    // 3. Merge by citation (highest score wins)
    const map = new Map<string, StandardsIntelligenceMatch>();
    [...dbResults, ...seedResults].forEach((match) => {
      const existing = map.get(match.standard.citation);
      if (!existing || match.score > existing.score) {
        map.set(match.standard.citation, match);
      }
    });

    return Array.from(map.values())
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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

    score += Math.max(0, 6 - (standard.authorityTier || 1) * 2);
    reasons.push(`Authority tier ${standard.authorityTier || 1}`);

    // Standard scoring logic remains same
    const band =
      score >= 70 ? "primary" : score >= 35 ? "supporting" : "contextual";

    return {
      standard,
      score,
      band,
      reasons,
      missingEvidence: [],
      exclusionWarnings: [],
    };
  }
}
