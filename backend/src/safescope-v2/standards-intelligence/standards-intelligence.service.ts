import * as natural from 'natural';
import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence.seed";
import { StandardsIntelligenceRecord } from "./standards-intelligence.types";
import { Standard } from "../../standards/entities/standard.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hasAnyNonNegatedTerm } from '../reasoning-orchestrator/negation-context.util';

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

function normalizeCitation(citation: string) {
  return normalize(citation)
    .replace(/^(\d+)\s+cfr\s+/, "")
    .replace(/\s+/g, "")
    .replace(/\.+$/, "");
}

const STOP_WORDS = new Set([
  "worker",
  "employee",
  "condition",
  "hazard",
  "area",
  "during",
  "from",
  "with",
  "near",
  "nearby",
  "may",
  "still",
  "observed",
  "exposed",
  "review",
  "safety",
  "required",
  "standard",
  "general",
]);

const MEANINGFUL_PHRASES = [
  "machine guarding",
  "moving parts",
  "tail pulley",
  "conveyor belt",
  "point of operation",
  "energized conductor",
  "electrical panel",
  "arc flash",
  "lockout tagout",
  "fall protection",
  "roof edge",
  "unprotected edge",
  "mobile equipment",
  "hazard communication",
  "safety data sheet",
];

function extractTokens(text: string) {
  const norm = normalize(text);
  let found = [];
  let remaining = norm;
  for (const phrase of MEANINGFUL_PHRASES) {
    if (remaining.includes(phrase)) {
      found.push(phrase);
      remaining = remaining.replace(new RegExp(phrase, "g"), " ");
    }
  }
  
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(remaining) || [];
  const stemmedTokens = tokens
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
    .map((t) => natural.PorterStemmer.stem(t));
    
  return [...found, ...Array.from(new Set(stemmedTokens))];
}

function citationKey(value: string) {
  return normalize(value)
    .replace(/^29 cfr /, "")
    .replace(/^30 cfr /, "")
    .trim();
}

function hasAny(text: string, terms: string[]) {
  return hasAnyNonNegatedTerm(text, terms);
}

function isAllScope(scopes: string[]) {
  return (
    scopes.length === 0 ||
    scopes.some((s) => s === "all" || s === "let safescope evaluate")
  );
}

function normalizeScopeValue(scope: string) {
  const s = normalize(scope);
  if (["msha", "mining", "mine", "30 cfr"].includes(s)) return "msha";
  if (
    [
      "osha-general",
      "osha-general-industry",
      "general_industry",
      "general industry",
      "1910",
      "29 cfr 1910",
    ].includes(s)
  )
    return "osha-general";
  if (["osha-construction", "construction", "1926", "29 cfr 1926"].includes(s))
    return "osha-construction";
  return s;
}

function selectedScopeGroup(scopes: string[]) {
  if (isAllScope(scopes)) return "all";
  const normalized = scopes.map(normalizeScopeValue);
  if (normalized.includes("msha")) return "msha";
  if (normalized.includes("osha-general")) return "osha-general";
  if (normalized.includes("osha-construction")) return "osha-construction";
  return "all";
}

function standardScopeGroup(standard: StandardsIntelligenceRecord) {
  const scope = normalize(standard.scope);
  const citation = citationKey(standard.citation);

  if (
    standard.agency === "MSHA" ||
    scope === "mining" ||
    citation.startsWith("56.") ||
    citation.startsWith("57.") ||
    citation.startsWith("30 cfr")
  ) {
    return "msha";
  }

  if (scope.includes("construction") || citation.startsWith("1926.")) {
    return "osha-construction";
  }

  if (
    standard.agency === "OSHA" ||
    scope.includes("general") ||
    citation.startsWith("1910.")
  ) {
    return "osha-general";
  }

  return "all";
}

function isDirectCuratedPrimary(
  standard: StandardsIntelligenceRecord,
  text: string,
  scopes: string[],
) {
  const selected = selectedScopeGroup(scopes);
  const citation = citationKey(standard.citation);

  const mshaMachine =
    selected === "msha" &&
    [
      "30 cfr 56.14107(a)",
      "30 cfr 56.14107",
      "56.14107(a)",
      "56.14107",
    ].includes(citation) &&
    hasAny(text, [
      "conveyor",
      "pulley",
      "tail pulley",
      "moving parts",
      "guard",
      "unguarded",
    ]);

  const mshaElectrical =
    selected === "msha" &&
    ["30 cfr 56.12016", "56.12016"].includes(citation) &&
    hasAny(text, [
      "energized",
      "electrical",
      "conductor",
      "panel",
      "circuit",
      "shock",
      "arc flash",
    ]);

  const oshaMachine =
    selected === "osha-general" &&
    [
      "1910.219",
      "1910.212",
      "1910.212(a)(1)",
      "29 cfr 1910.219",
      "29 cfr 1910.212",
    ].includes(citation) &&
    hasAny(text, [
      "rotating shaft",
      "belt drive",
      "machine guarding",
      "point of operation",
      "shaft",
      "belt",
      "guard",
      "unguarded",
    ]);

  const oshaConstructionFall =
    selected === "osha-construction" &&
    ["1926.501", "29 cfr 1926.501"].includes(citation) &&
    hasAny(text, [
      "roof edge",
      "unprotected edge",
      "fall protection",
      "fall hazard",
      "leading edge",
      "opening",
    ]);

  return mshaMachine || mshaElectrical || oshaMachine || oshaConstructionFall;
}

function isMaintenanceSpecific(
  standard: StandardsIntelligenceRecord,
  text: string,
) {
  const citation = citationKey(standard.citation);
  if (
    !["30 cfr 56.14105", "56.14105", "30 cfr 57.14105", "57.14105"].includes(
      citation,
    )
  ) {
    return true;
  }

  return hasAny(text, [
    "repair",
    "repairs",
    "maintenance",
    "servicing",
    "service",
    "blocked against motion",
    "block against motion",
    "work on equipment",
    "cleanup",
    "cleaning",
  ]);
}

function directApplicabilitySignal(
  standard: StandardsIntelligenceRecord,
  text: string,
  tokens: string[],
) {
  if (isDirectCuratedPrimary(standard, text, [])) return true;

  const title = normalize(standard.title);
  const hazardText = normalize(
    [
      ...standard.hazardFamilies,
      ...standard.equipmentTags,
      ...standard.controlTags,
      ...standard.searchBoostTerms,
    ].join(" "),
  );

  const titleHit = tokens.some(
    (token) => token.length > 3 && title.includes(normalize(token)),
  );
  const hazardHit = tokens.some(
    (token) => token.length > 3 && hazardText.includes(normalize(token)),
  );

  return titleHit || hazardHit;
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
    const rawText = `${input.classification || ""} ${input.text || ""}`;
    const tokens = extractTokens(rawText);
    const selectedScopes = (input.scopes || []).map(normalizeScopeValue);
    const limit = input.limit !== undefined ? input.limit : 10;

    const seedResults = this.seedStandards
      .map((s) => this.scoreStandard(s, rawText, tokens, selectedScopes))
      .filter((m) => m.score > 0)
      .map((m) => ({ ...m, score: m.score + 100 }));

    const query = this.standardRepository
      .createQueryBuilder("s")
      .select([
        "s.id",
        "s.agencyCode",
        "s.citation",
        "s.partNumber",
        "s.title",
        "s.scopeCode",
        "s.sourceKey",
        "s.sourceType",
        "s.authorityTier",
        "s.allowedUse",
        "s.severityWeight",
        "s.isActive",
        "s.requiredControls",
      ])
      .where("s.is_active = true");
    if (tokens.length > 0) {
      const conditions = tokens
        .map(
          (t, i) =>
            `(s.citation ILIKE :t${i} OR s.title ILIKE :t${i} OR s.standard_text ILIKE :t${i} OR s.keywords::text ILIKE :t${i})`,
        )
        .join(" OR ");
      const params = tokens.reduce(
        (p, t, i) => ({ ...p, [`t${i}`]: `%${t}%` }),
        {},
      );
      query.andWhere(`(${conditions})`, params);
    }
    if (
      selectedScopes.length > 0 &&
      !selectedScopes.some((s) => s === "all" || s === "let safescope evaluate")
    ) {
      const scopeMapping: Record<string, string[]> = {
        msha: ["mining"],
        mining: ["mining"],
        "osha-general": ["general_industry"],
        "osha-general-industry": ["general_industry"],
        general_industry: ["general_industry"],
        "general industry": ["general_industry"],
        "1910": ["general_industry"],
        "osha-construction": ["construction"],
        construction: ["construction"],
        "1926": ["construction"],
      };
      const mapped = selectedScopes.flatMap((s) => scopeMapping[s] || []);
      if (mapped.length > 0)
        query.andWhere("s.scope_code IN (:...mapped)", { mapped });
    }

    const dbStandards = await query.take(50).getMany();
    const dbResults = dbStandards.map((db) => {
      const rec: StandardsIntelligenceRecord = {
        citation: db.citation,
        agency: db.agencyCode === "OSHA" ? "OSHA" : "MSHA",
        scope:
          db.scopeCode === "mining"
            ? "mining"
            : db.scopeCode === "construction"
              ? "osha-construction"
              : "osha-general-industry",
        title: db.title,
        plainLanguageSummary: db.plainLanguageSummary || db.title,
        hazardFamilies: db.hazardCodes || [],
        equipmentTags: [],
        taskTags: [],
        exposureTags: [],
        controlTags: db.requiredControls || [],
        consequenceTags: [],
        searchBoostTerms: db.keywords || [],
        authorityTier: (db.authorityTier || 1) as any,
        applicabilityBandDefault: "contextual",
        severityDefault: "medium",
        evidenceRequirements: [],
        exclusionRules: [],
        crossDomainLinks: [],
        sourceKey: db.sourceKey,
        sourceType: db.sourceType,
      };
      return this.scoreStandard(rec, rawText, tokens, selectedScopes);
    });

    const map = new Map<string, StandardsIntelligenceMatch>();
    [...dbResults, ...seedResults].forEach((m) => {
      const canonicalKey = normalizeCitation(m.standard.citation);
      const existing = map.get(canonicalKey);
      if (!existing || m.score > existing.score) map.set(canonicalKey, m);
    });

    return this.finalizeMatchBands(
      Array.from(map.values()),
      rawText,
      selectedScopes,
    )
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private finalizeMatchBands(
    matches: StandardsIntelligenceMatch[],
    text: string,
    scopes: string[],
  ): StandardsIntelligenceMatch[] {
    const selected = selectedScopeGroup(scopes);
    const lower = normalize(text);

    const hasMachineGuarding = hasAny(lower, [
      "machine guarding",
      "unguarded",
      "guard",
      "conveyor",
      "pulley",
      "tail pulley",
      "moving parts",
    ]);
    const hasElectrical = hasAny(lower, [
      "energized",
      "electrical",
      "conductor",
      "panel",
      "circuit",
      "shock",
      "arc flash",
    ]);
    const hasOshaMachine = hasAny(lower, [
      "rotating shaft",
      "belt drive",
      "machine guarding",
      "point of operation",
      "shaft",
      "belt",
      "guard",
      "unguarded",
    ]);
    const hasConstructionFall = hasAny(lower, [
      "roof edge",
      "unprotected edge",
      "fall protection",
      "fall hazard",
      "leading edge",
      "opening",
    ]);
    const hasForkliftDefects = hasAny(lower, [
      "forklift",
      "forklifts",
      "powered industrial truck",
      "leaking",
      "hydraulic",
      "defective",
      "unsafe truck",
      "leaking fluid",
      "hydraulic fluid",
    ]);
    const hasMshaTraffic = hasAny(lower, [
      "haul truck",
      "haul trucks",
      "mine road",
      "mine roads",
      "congested",
      "speed limit",
      "right-of-way",
      "traffic sign",
      "rules of the road",
    ]);
    const hasConstructionBacking = hasAny(lower, [
      "loader",
      "loaders",
      "backing",
      "backing up",
      "reverse",
      "obstructed view",
      "backup alarm",
      "reverse alarm",
      "spotter",
    ]);

    return matches.map((match) => {
      const citation = citationKey(match.standard.citation);
      let band = match.band;
      let score = match.score;
      const reasons = [...match.reasons];

      const makePrimary = (reason: string) => {
        band = "primary";
        score += 20;
        if (!reasons.includes(reason)) reasons.push(reason);
      };

      const makeSupporting = (reason: string) => {
        if (band === "primary") band = "supporting";
        score -= 25;
        if (!reasons.includes(reason)) reasons.push(reason);
      };

      if (
        selected === "msha" &&
        hasMachineGuarding &&
        ["56.14107(a)", "56.14107"].includes(citation)
      ) {
        makePrimary("Direct MSHA machine guarding scenario match");
      }

      if (
        selected === "msha" &&
        hasElectrical &&
        ["56.12016"].includes(citation)
      ) {
        makePrimary("Direct MSHA electrical scenario match");
      }

      if (
        selected === "osha-general" &&
        hasOshaMachine &&
        ["1910.219", "1910.212", "1910.212(a)(1)"].includes(citation)
      ) {
        makePrimary("Direct OSHA machine guarding scenario match");
      }

      if (
        selected === "osha-construction" &&
        hasConstructionFall &&
        ["1926.501"].includes(citation)
      ) {
        makePrimary("Direct OSHA construction fall protection scenario match");
      }

      if (
        selected === "osha-construction" &&
        hasConstructionFall &&
        ["1926.754", "1926.250", "1926.57", "1926.66"].includes(citation)
      ) {
        makeSupporting(
          "Demoted: not the direct roof-edge fall protection standard",
        );
      }

      if (
        selected === "msha" &&
        hasElectrical &&
        ["56.14107(a)", "57.14107(a)", "56.14107", "57.14107"].includes(
          citation,
        )
      ) {
        makeSupporting(
          "Demoted: machine guarding standard is not primary for electrical finding",
        );
      }

      // PIT (forklift defects)
      if (
        selected === "osha-general" &&
        hasForkliftDefects &&
        ["1910.178(p)(1)", "1910.178"].includes(citation)
      ) {
        makePrimary("Direct OSHA powered industrial truck scenario match");
      }

      if (
        selected === "osha-general" &&
        hasForkliftDefects &&
        ["1910.212(a)(1)", "1910.212"].includes(citation)
      ) {
        makeSupporting("Demoted: machine guarding is not primary for vehicle defects");
        score -= 50;
      }

      // Construction backing
      if (
        selected === "osha-construction" &&
        hasConstructionBacking &&
        ["1926.602(a)(9)(ii)", "1926.602"].includes(citation)
      ) {
        makePrimary("Direct OSHA construction earthmoving backing scenario match");
      }

      // MSHA Traffic Control
      if (
        selected === "msha" &&
        hasMshaTraffic &&
        ["56.9100(a)", "56.9100"].includes(citation)
      ) {
        makePrimary("Direct MSHA traffic control rules-of-the-road scenario match");
      }

      if (
        selected === "msha" &&
        hasMshaTraffic &&
        ["56.14107(a)", "56.14107"].includes(citation)
      ) {
        makeSupporting("Demoted: machine guarding is not primary for roadway traffic control");
        score -= 50;
      }

      return {
        ...match,
        score,
        band,
        reasons,
      };
    });
  }

  private scoreStandard(
    standard: StandardsIntelligenceRecord,
    text: string,
    tokens: string[],
    scopes: string[],
  ): StandardsIntelligenceMatch {
    let score = 0;
    const reasons: string[] = [];

    const selected = selectedScopeGroup(scopes);
    const standardGroup = standardScopeGroup(standard);
    const scopeMatches = selected === "all" || selected === standardGroup;

    if (selected === "all") {
      score += 5;
      reasons.push("Scope: SafeScope evaluate");
    } else if (scopeMatches) {
      score += 25;
      reasons.push(`Scope match: ${standardGroup}`);
      reasons.push(
        standardGroup === "msha"
          ? "Jurisdiction aligned: MSHA"
          : standardGroup === "osha-construction"
            ? "Jurisdiction aligned: OSHA 1926"
            : "Jurisdiction aligned: OSHA 1910",
      );
    } else {
      score -= 80;
      reasons.push(
        `Demoted: selected scope ${selected} does not match ${standardGroup}`,
      );
    }

    const isCitationMatch = tokens.some((t) =>
      standard.citation.toLowerCase().includes(t),
    );
    const isTitleMatch = tokens.some((t) =>
      standard.title.toLowerCase().includes(t),
    );
    const hazardMatches = [
      ...standard.hazardFamilies,
      ...standard.controlTags,
    ].filter((c) => tokens.some((t) => normalize(c).includes(t)));

    if (isCitationMatch) {
      score += 25;
      reasons.push("Citation match");
    }
    if (isTitleMatch) {
      score += 15;
      reasons.push("Title match");
    }
    hazardMatches.forEach((m) => {
      score += 20;
      reasons.push(`Hazard/Control match: ${m}`);
    });

    if (
      [
        "scope",
        "definitions",
        "incorporation",
        "general administrative",
        "reserved",
        "appendix",
        "training",
        "recordkeeping",
      ].some((g) => standard.title.toLowerCase().includes(g))
    ) {
      score -= 40;
      reasons.push("Penalty: Generic/Admin section");
    }

    const hasStrongDirectEvidence =
      isCitationMatch || isTitleMatch || hazardMatches.length > 0;
    const band =
      hasStrongDirectEvidence && score >= 50
        ? "primary"
        : score >= 25
          ? "supporting"
          : "contextual";
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
