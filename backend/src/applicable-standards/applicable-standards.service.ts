import { Injectable, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Standard } from "../standards/entities/standard.entity";
import { SafeScopeKnowledgeChunk } from "../safescope-knowledge/entities/safescope-knowledge-chunk.entity";
import { hasNonNegatedTerm } from "../safescope-v2/reasoning-orchestrator/negation-context.util";
import { HazLenzKnowledgeShardService } from "../safescope-v2/knowledge-shards/hazlenz-knowledge-shard.service";

function canonicalizeCitation(cit: string): string {
  return cit
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isCitationMatch(dbCit: string, targetCit: string): boolean {
  const c1 = canonicalizeCitation(dbCit);
  const c2 = canonicalizeCitation(targetCit);
  return c1.includes(c2) || c2.includes(c1);
}

type CachedKnowledgeChunk = Pick<
  SafeScopeKnowledgeChunk,
  "id" | "citation" | "sectionHeading" | "chunkSummary" | "chunkText"
> & {
  document: {
    agency?: string | null;
    title?: string | null;
    sourceType?: string | null;
  } | null;
};

type CachedStandard = Pick<
  Standard,
  "id" | "citation" | "title" | "standardText" | "plainLanguageSummary" | "keywords" | "agencyCode" | "scopeCode"
>;

export interface ApplicableStandardsRouteHints {
  sourceKeys?: string[];
  bundleIds?: string[];
  hazardFamily?: string;
  equipmentFamily?: string;
  taskMechanism?: string;
  shardKey?: string;
}

@Injectable()
export class ApplicableStandardsService {
  private cachedChunks: CachedKnowledgeChunk[] | null = null;
  private cachedStandards: CachedStandard[] | null = null;

  private isHousekeepingAccessScenario(text: string) {
    return (
      /(catwalk|walkway|travelway|passageway|platform|access)/i.test(text) &&
      /(build up|buildup|accumulation|material|spillage|debris|housekeeping|slip|trip)/i.test(
        text,
      )
    );
  }

  private isMovingMachineScenario(text: string) {
    return /(unguarded|guard|moving part|rotating|shaft|pulley|belt|conveyor|nip point|pinch point|drive)/i.test(
      text,
    );
  }

  private isScaffoldFallProtectionScenario(text: string) {
    return (
      /(scaffold|scaffolding|platform|work platform)/i.test(text) &&
      /(guardrail|guardrails|fall protection|fall arrest|fall hazard|unprotected edge|without.*fall|without.*guardrail)/i.test(
        text,
      )
    );
  }

  private scoreKnowledgeChunk(
    chunk: SafeScopeKnowledgeChunk,
    observation: string,
    siteType?: string,
    mshaPartPreference?: "56" | "57" | "75" | "77",
    routeHints?: ApplicableStandardsRouteHints,
  ) {
    const citation = chunk.citation || "";
    const heading = chunk.sectionHeading || "";
    const text =
      `${citation} ${heading} ${chunk.chunkSummary || ""} ${chunk.document?.title || ""}`.toLowerCase();

    let score = 0;
    const matchingReasons: string[] = [];

    const document = chunk.document;
    const agency = document?.agency;
    const title = document?.title || "";

    const routeMatch = this.scoreRouteHintMatch(citation, text, routeHints);
    if (routeMatch.score > 0) {
      score += routeMatch.score;
      matchingReasons.push(...routeMatch.reasons);
    }

    if (routeHints?.sourceKeys?.length) {
      const matchesSourceKey = routeHints.sourceKeys.some((sourceKey) =>
        this.routeSourceKeyMatchesCitation(sourceKey, citation),
      );

      if (matchesSourceKey) {
        score += 120;
        matchingReasons.push("warm-shard: focused source-key match");
      }
    }

    if (siteType === "mining" && agency === "MSHA") {
      score += 15;
      matchingReasons.push("scope: mining");
    }

    if (mshaPartPreference && new RegExp(`30 CFR ${mshaPartPreference}\\.`).test(citation)) {
      score += 120;
      matchingReasons.push(`scope: MSHA Part ${mshaPartPreference}`);
    }

    if (
      mshaPartPreference &&
      /30 CFR (56|57|75|77)\./.test(citation) &&
      !new RegExp(`30 CFR ${mshaPartPreference}\\.`).test(citation)
    ) {
      score -= 90;
      matchingReasons.push(`demoted: outside selected MSHA Part ${mshaPartPreference}`);
    }

    if (
      siteType === "construction" &&
      agency === "OSHA" &&
      /1926/.test(citation || title)
    ) {
      score += 15;
      matchingReasons.push("scope: construction");
    }

    if (
      siteType === "general_industry" &&
      agency === "OSHA" &&
      /1910/.test(citation || title)
    ) {
      score += 15;
      matchingReasons.push("scope: general_industry");
    }

    const importantTerms = [
      "unguarded",
      "guard",
      "guarded",
      "moving",
      "machine",
      "conveyor",
      "tail",
      "pulley",
      "pinch",
      "nip",
      "scaffold",
      "platform",
      "guardrail",
      "fall protection",
      "fall",
    ];

    for (const term of importantTerms) {
      if (hasNonNegatedTerm(observation, term) && text.includes(term)) {
        score += 8;
        matchingReasons.push(`term: ${term}`);
      }
    }

    if (this.isMovingMachineScenario(observation)) {
      if (
        citation === "30 CFR 56.14107" ||
        citation === "30 CFR 57.14107" ||
        citation === "30 CFR 75.1722" ||
        citation === "30 CFR 77.400"
      ) {
        score += 120;
        matchingReasons.push(
          "scenario: unguarded conveyor pulley / exposed nip point",
        );
      }

      if (
        mshaPartPreference === "57" &&
        /30 CFR 57\.4263/.test(citation)
      ) {
        score -= 80;
        matchingReasons.push(
          "demoted: underground belt conveyor rule is supporting, not primary guarding citation",
        );
      }
    }

    if (this.isScaffoldFallProtectionScenario(observation)) {
      if (citation === "29 CFR 1926.451" || citation === "1926.451") {
        score += 110;
        matchingReasons.push(
          "scenario: scaffold platform missing guardrails or fall protection",
        );
      }

      if (citation === "29 CFR 1926.501" || citation === "1926.501") {
        score += 80;
        matchingReasons.push("scenario: construction fall protection duty");
      }

      if (citation === "29 CFR 1926.502" || citation === "1926.502") {
        score += 65;
        matchingReasons.push("scenario: fall protection system criteria");
      }

      if (citation === "29 CFR 1926.454" || citation === "1926.454") {
        score += 30;
        matchingReasons.push(
          "scenario: scaffold-specific training support standard",
        );
      }
    }

    if (this.isHousekeepingAccessScenario(observation)) {
      if (
        citation === "30 CFR 56.20003" ||
        citation === "30 CFR 57.20003" ||
        citation === "29 CFR 1910.22" ||
        citation === "1910.22"
      ) {
        score += 75;
        matchingReasons.push(
          "scenario: housekeeping / walking-working surface",
        );
      }
      if (citation === "30 CFR 56.11001" || citation === "30 CFR 57.11001") {
        score += 55;
        matchingReasons.push(
          "scenario: safe access affected by material buildup",
        );
      }
    }

    // 🔷 SAFEGUARDING AND GATING GUARDRAILS FOR KNOWLEDGE CHUNKS

    // 1. Lifting & Rigging vs. Electrical Guard
    // Guardrail: Do not let wire rope slings or hose connectors trigger electrical standards unless actual electrical words are present.
    const isLiftingOrRiggingText = /(wire rope|wire sling|wire rope sling|crane|spreader bar|shackle|rigging|hoist|sling)/i.test(observation);
    const isMaterialHandlingHoseText = /(air line|compressor hose|safety chain|whipcheck|whip check|hose connector)/i.test(observation);
    const isElectricalCitation = /^(29|30) CFR (56|57)\.12|^(1910|1926)\.3|^(1910|1926)\.4|56\.12016|57\.12016/i.test(citation);
    if ((isLiftingOrRiggingText || isMaterialHandlingHoseText) && isElectricalCitation) {
      const hasElectricalTerms = /(live|energized|electrical|voltage|breaker|panel|wiring|cord|arc|circuit|switch|junction)/i.test(observation);
      if (!hasElectricalTerms) {
        score -= 100;
        matchingReasons.push("guardrail: wire rope sling or hose safety connector disqualified from electrical");
      }
    }

    // 2. Machine Guarding Guardrail
    // Guardrail: Machine guarding standards require explicit machine/guarding danger terms to avoid false-positive triggers on mobile equipment or cylinder storage.
    const isMachineGuardingCitation = /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(citation);
    if (isMachineGuardingCitation) {
      const hasGuardingTerms = /(guard|unguarded|nip point|pinch point|pulley|belt|shaft|gear|chain|rotating|moving part|estop|emergency stop|light curtain|barrier|sprocket)/i.test(observation);
      if (!hasGuardingTerms) {
        score -= 100;
        matchingReasons.push("guardrail: machine guarding standard requires explicit guarding or moving parts terms");
      }
    }

    // 3. Electrical Guardrail
    // Guardrail: Electrical standards require explicit electrical danger terms.
    if (isElectricalCitation) {
      const hasElectricalTerms = /(live|energized|electrical|voltage|breaker|panel|wiring|cord|arc|circuit|switch|junction|outlet|plug|shock|power|substation|disconnect)/i.test(observation);
      if (!hasElectricalTerms) {
        score -= 100;
        matchingReasons.push("guardrail: electrical standard requires explicit electrical terms");
      }
    }

    const isElectricalLockoutText =
      /(electrically powered|electrical equipment|mechanically repaired|mechanical work|deenergized|de-energized|locked out|lockout|power switch|power switches|energized without)/i.test(
        observation,
      );

    if (isElectricalLockoutText) {
      if (
        mshaPartPreference === "56" &&
        citation === "30 CFR 56.12016"
      ) {
        score += 220;
        matchingReasons.push(
          "scenario: MSHA Part 56 electrically-powered equipment lockout",
        );
      }

      if (
        mshaPartPreference === "57" &&
        citation === "30 CFR 57.12016"
      ) {
        score += 220;
        matchingReasons.push(
          "scenario: MSHA Part 57 electrically-powered equipment lockout",
        );
      }

      if (
        mshaPartPreference &&
        /30 CFR (56|57)\.12/.test(citation) &&
        citation !== `30 CFR ${mshaPartPreference}.12016`
      ) {
        score -= 70;
        matchingReasons.push(
          "demoted: electrical section is not the direct electrically-powered equipment lockout citation",
        );
      }
    }

    // 4. Forklift / Seatbelt PIT Boost
    // Forklift/seatbelt/PIT should boost powered industrial truck standards and penalize machine guarding.
    const isForkliftSeatbeltText = /(forklift|seatbelt|industrial truck|pit|operator)/i.test(observation);
    if (isForkliftSeatbeltText) {
      const isPITCitation = /1910\.178|56\.9100|56\.9200/i.test(citation);
      if (isPITCitation) {
        score += 100;
        matchingReasons.push("boost: forklift, seatbelt, or PIT term matched");
      }
      if (isMachineGuardingCitation) {
        score -= 100;
        matchingReasons.push("guardrail: forklift/seatbelt case penalized machine guarding");
      }
    }

    // 5. Excavation / Trenching Boost
    const isExcavationTrenchingText = /(trench|excavation|shoring|sloping|benching|cave-in|digging)/i.test(observation);
    if (isExcavationTrenchingText) {
      const isTrenchingCitation = /1926\.651|1926\.652/i.test(citation);
      if (isTrenchingCitation) {
        score += 100;
        matchingReasons.push("boost: trenching or excavation matched");
      }
    }

    // 6. Catwalk / Access / Scaffold / Fall vs Machine Guarding Gating
    const isAccessFallScaffoldText = /(handrail|guardrail|toe board|toeboard|scaffold|mudsill|floor grating|grating|catwalk|travelway|access platform|walking surface|fall hazard|loose catwalk|loose railing|access tower|hole)/i.test(observation);
    if (isAccessFallScaffoldText) {
      const isMachineGuardingCitation = /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(citation);
      if (isMachineGuardingCitation) {
        score -= 100;
        matchingReasons.push("applied access mismatch standard penalty");
      }
      const isFallAccessOrHousekeepingCitation = /56\.11012|56\.11001|56\.20003|1910\.22|1926\.451|1926\.501|1926\.502/i.test(citation);
      if (isFallAccessOrHousekeepingCitation) {
        score += 100;
        matchingReasons.push("applied access match standard boost");
      }
    }

    // 7. Rigging & Hoisting hook safety latch vs LOTO / Electrical Gating
    const isRiggingHookText = /(hook|hoisting hook|crane|lifting|sling|rigging|latch|safety latch|engine blocks|overhead crane|mobile crane)/i.test(observation);
    if (isRiggingHookText) {
      const isLotoCitation = /1910\.147|56\.12016|56\.14105|57\.12016|57\.14105/i.test(citation);
      if (isLotoCitation || isElectricalCitation) {
        score -= 100;
        matchingReasons.push("applied rigging mismatch standard penalty");
      }
      const isLiftingRiggingCitation = /1910\.184|1926\.251|56\.16007/i.test(citation);
      if (isLiftingRiggingCitation) {
        score += 100;
        matchingReasons.push("applied rigging match standard boost");
      }
    }

    // 8. Trip slip passageway housekeeping vs Electrical Gating
    const isHousekeepingTripText = /(trip|slip|grease|cords|floor passageway|passageway|housekeeping|walking surface|obstruction)/i.test(observation);
    if (isHousekeepingTripText) {
      const hasElectricalExposureTerms = /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash)/i.test(observation);
      if (isElectricalCitation && !hasElectricalExposureTerms) {
        score -= 100;
        matchingReasons.push("applied housekeeping mismatch standard penalty");
      }
      const isHousekeepingCitation = /1910\.22|56\.20003/i.test(citation);
      if (isHousekeepingCitation) {
        score += 100;
        matchingReasons.push("applied housekeeping match standard boost");
      }
    }

    // 9. PPE Eye protection vs Fall/Access/Scaffold Gating
    const isEyePpeText = /(safety glasses|eye protection|goggles|face shield|wear safety|failing safety)/i.test(observation);
    if (isEyePpeText) {
      const isFallAccessOrScaffoldCitation = /56\.11012|56\.11001|56\.20003|1910\.22|1926\.451|1926\.501|1926\.502/i.test(citation);
      if (isFallAccessOrScaffoldCitation) {
        score -= 100;
        matchingReasons.push("applied ppe mismatch standard penalty");
      }
      const isPpeCitation = /1910\.133|1910\.132|56\.15004|56\.15006/i.test(citation);
      if (isPpeCitation) {
        score += 100;
        matchingReasons.push("applied ppe match standard boost");
      }
    }

    // 10. Confined Space entry vs Electrical Gating
    const isConfinedSpaceEntryText = /(cleanout|vessel cleanout|reaction vessel|worker entry|confined space|permit required|attendant|sewer tank|vessel entry|tank entry)/i.test(observation);
    if (isConfinedSpaceEntryText) {
      const hasElectricalExposureTerms = /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash|480v|240v|4160v|contacts)/i.test(observation);
      if (isElectricalCitation && !hasElectricalExposureTerms) {
        score -= 100;
        matchingReasons.push("applied confined space mismatch standard penalty");
      }
    }

    // 11. Emergency Egress vs Machine Guarding Gating
    const isEmergencyEgressText = /(exit|egress|exit route|exit sign|exit door|exit pathway|evacuation)/i.test(observation);
    if (isEmergencyEgressText) {
      const isMachineGuardingCitation = /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(citation);
      if (isMachineGuardingCitation) {
        score -= 100;
        matchingReasons.push("applied egress mismatch standard penalty");
      }
    }

    // 12. Safety Shower / Eye Wash vs Walking/Working Surfaces Gating
    const isSafetyShowerEyewashText = /(safety shower|eye wash|eyewash)/i.test(observation);
    if (isSafetyShowerEyewashText) {
      const isWalkingWorkingSurfaceCitation = /1910\.22|56\.20003/i.test(citation);
      if (isWalkingWorkingSurfaceCitation) {
        score -= 100;
        matchingReasons.push("applied safety shower access standard penalty");
      }
    }

    // 13. Compressed Gas / Cylinder / Oxygen standard vs Machine Guarding
    // Guardrail: Compressed gas and cylinder standards require explicit cylinder/gas terms and should be disqualified/penalized if purely mechanical/machine guarding terms are present without any cylinder terms.
    const isCylinderCitation = /1910\.253|1910\.252|1910\.101|1926\.350|56\.16005|56\.16006|57\.16005|57\.16006/i.test(citation);
    if (isCylinderCitation) {
      const hasCylinderTerms = /(cylinder|oxygen|acetylene|gas tank|compressed gas|welding cylinder|manifold|valve cap)/i.test(observation);
      if (!hasCylinderTerms) {
        score -= 100;
        matchingReasons.push("guardrail: cylinder standard requires explicit cylinder/gas terms");
      }
    }

    return {
      id: chunk.id,
      citation,
      heading: heading || title,
      summary: chunk.chunkSummary || chunk.chunkText?.slice(0, 500) || "",
      agencyCode: agency,
      scopeCode: siteType,
      score,
      confidence: Math.min(99, Math.round(score)),
      matchingReasons,
      source: ["safescope_knowledge_chunks"],
    };
  }

  private normalizeRouteCitation(value?: string): string {
    return String(value || "")
      .toLowerCase()
      .replace(/^msha-/, "")
      .replace(/^osha-/, "")
      .replace(/^general-/, "")
      .replace(/-/g, " ")
      .replace(/\bcfr\b/g, "cfr")
      .replace(/\s+/g, " ")
      .trim();
  }

  private compactRouteText(value?: string): string {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  private normalizeRouteCitationToken(value?: string): string {
    const raw = String(value || "").toLowerCase().trim();

    const sourceKeyMatch = raw.match(/^(msha|osha)-([0-9]+)-cfr-([0-9]+)-([0-9a-z.]+)$/);
    if (sourceKeyMatch) {
      return `${sourceKeyMatch[2]} cfr ${sourceKeyMatch[3]}.${sourceKeyMatch[4]}`
        .replace(/\s+/g, " ")
        .trim();
    }

    return raw
      .replace(/^msha-/, "")
      .replace(/^osha-/, "")
      .replace(/\b30\s*cfr\s*/g, "30 cfr ")
      .replace(/\b29\s*cfr\s*/g, "29 cfr ")
      .replace(/[^a-z0-9.]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private routeSourceKeyMatchesCitation(sourceKey: string, citation?: string): boolean {
    const normalizedSource = this.normalizeRouteCitationToken(sourceKey);
    const normalizedCitation = this.normalizeRouteCitationToken(citation);

    if (!normalizedSource || !normalizedCitation) return false;

    return normalizedSource === normalizedCitation;
  }

  private scoreRouteHintMatch(
    citation: string | undefined,
    text: string,
    routeHints?: ApplicableStandardsRouteHints,
  ) {
    if (!routeHints) {
      return { score: 0, reasons: [] as string[] };
    }

    let score = 0;
    const reasons: string[] = [];
    const haystack = `${citation || ""} ${text || ""}`.toLowerCase();

    for (const sourceKey of routeHints.sourceKeys || []) {
      const normalized = this.normalizeRouteCitation(sourceKey);
      const sourceCitation = normalized
        .replace(/^(29|30) cfr /, "$1 cfr ")
        .replace(/\s+/g, " ")
        .trim();

      const compactSource = this.compactRouteText(sourceCitation);
      const compactHaystack = this.compactRouteText(haystack);

      if (sourceCitation && (haystack.includes(sourceCitation) || compactHaystack.includes(compactSource))) {
        score += 80;
        reasons.push(`route: source key ${sourceKey}`);
      }
    }

    const familySignals = [
      routeHints.hazardFamily,
      routeHints.equipmentFamily,
      routeHints.taskMechanism,
    ]
      .filter(Boolean)
      .map((value) => String(value).replace(/_/g, " ").toLowerCase());

    for (const signal of familySignals) {
      if (signal && haystack.includes(signal)) {
        score += 10;
        reasons.push(`route: ${signal}`);
      }
    }

    return { score, reasons };
  }

  constructor(
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @Optional()
    @InjectRepository(SafeScopeKnowledgeChunk)
    private readonly knowledgeChunkRepo?: Repository<SafeScopeKnowledgeChunk>,
    @Optional()
    private readonly knowledgeShardService?: HazLenzKnowledgeShardService,
  ) {}

  async suggest(
    description: string,
    hazardCategory?: string,
    source?: string,
    limit = 5,
    routeHints?: ApplicableStandardsRouteHints,
    diagnostics?: Record<string, any>,
  ) {
    const sourceMode = String(source || "");
    const siteType = sourceMode.startsWith("MSHA")
      ? "mining"
      : source === "OSHA_CONSTRUCTION"
        ? "construction"
        : source === "OSHA_GENERAL_INDUSTRY"
          ? "general_industry"
          : undefined;

    const mshaPartPreference =
      source === "MSHA_MNM_SURFACE"
        ? "56"
        : source === "MSHA_MNM_UNDERGROUND"
          ? "57"
          : source === "MSHA_COAL_UNDERGROUND"
            ? "75"
            : source === "MSHA_COAL_SURFACE"
              ? "77"
              : undefined;

    const observation = (description || "").toLowerCase();
    const focusedShardSummary = this.knowledgeShardService?.getShardSummary({
      shardKey: routeHints?.shardKey,
      bundleIds: routeHints?.bundleIds,
      sourceKeys: routeHints?.sourceKeys,
    });
    const focusedShardCitations = new Set(focusedShardSummary?.citations || []);
    const focusedShardCitationsArray = Array.from(focusedShardCitations);

    const searchTerms = observation
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4);

    let activeJurisdiction: "msha" | "osha_general_industry" | "osha_construction" | undefined = undefined;

    if (routeHints?.shardKey) {
      const parts = routeHints.shardKey.toLowerCase().split("/");
      if (parts[0] === "msha") {
        activeJurisdiction = "msha";
      } else if (parts[0] === "osha_general_industry" || parts[0] === "osha_general") {
        activeJurisdiction = "osha_general_industry";
      } else if (parts[0] === "osha_construction") {
        activeJurisdiction = "osha_construction";
      }
    }

    if (!activeJurisdiction) {
      if (source === "OSHA_GENERAL_INDUSTRY") {
        activeJurisdiction = "osha_general_industry";
      } else if (source === "OSHA_CONSTRUCTION") {
        activeJurisdiction = "osha_construction";
      } else if (source?.startsWith("MSHA")) {
        activeJurisdiction = "msha";
      }
    }

    let knowledgeMatches: any[] = [];
    let knowledgeChunksCount = 0;
    if (this.knowledgeChunkRepo) {
      try {
        const queryBuilder = this.knowledgeChunkRepo
          .createQueryBuilder("c")
          .innerJoinAndSelect("c.document", "d")
          .where("d.sourceType = :sourceType", { sourceType: "regulation" })
          .andWhere("c.citation IS NOT NULL")
          .andWhere("c.citation ~ :cfrCitationPattern", {
            cfrCitationPattern: "^(29|30) CFR ",
          });

        if (activeJurisdiction === "msha") {
          queryBuilder.andWhere("d.agency = :agency", { agency: "MSHA" });
        } else if (activeJurisdiction === "osha_general_industry") {
          queryBuilder.andWhere("d.agency = :agency AND c.citation LIKE :partPattern", {
            agency: "OSHA",
            partPattern: "29 CFR 1910%",
          });
        } else if (activeJurisdiction === "osha_construction") {
          queryBuilder.andWhere("d.agency = :agency AND c.citation LIKE :partPattern", {
            agency: "OSHA",
            partPattern: "29 CFR 1926%",
          });
        } else {
          if (sourceMode.startsWith("MSHA")) {
            queryBuilder.andWhere("d.agency = :agency", { agency: "MSHA" });
          } else if (
            source === "OSHA_CONSTRUCTION" ||
            source === "OSHA_GENERAL_INDUSTRY"
          ) {
            queryBuilder.andWhere("d.agency = :agency", { agency: "OSHA" });
          }
        }

        const conditions: string[] = [];
        const params: any = {
          sourceType: "regulation",
          cfrCitationPattern: "^(29|30) CFR ",
        };

        if (focusedShardCitationsArray.length > 0) {
          conditions.push("c.citation IN (:...focusedCitations)");
          params.focusedCitations = focusedShardCitationsArray;
        }

        if (searchTerms.length > 0) {
          searchTerms.forEach((term, index) => {
            conditions.push(
              `c.chunkText ILIKE :chunkTerm${index} OR c.chunkSummary ILIKE :chunkTerm${index} OR c.sectionHeading ILIKE :chunkTerm${index}`,
            );
            params[`chunkTerm${index}`] = `%${term}%`;
          });
        }

        if (conditions.length > 0) {
          queryBuilder.andWhere(`(${conditions.join(" OR ")})`, params);
        } else {
          queryBuilder.andWhere("1 = 0");
        }

        queryBuilder.select([
          "c.id",
          "c.citation",
          "c.sectionHeading",
          "c.chunkSummary",
          "d.id",
          "d.agency",
          "d.title",
          "d.sourceType",
        ]);

        const chunks = await queryBuilder.take(50).getMany();
        knowledgeChunksCount = chunks.length;

        const mappedChunks = chunks.map((chunk) => ({
          id: chunk.id,
          citation: chunk.citation,
          sectionHeading: chunk.sectionHeading,
          chunkSummary: chunk.chunkSummary,
          chunkText: undefined,
          document: chunk.document
            ? {
                agency: chunk.document.agency,
                title: chunk.document.title,
                sourceType: chunk.document.sourceType,
              }
            : null,
        }));

        knowledgeMatches = mappedChunks
          .map((chunk) =>
            this.scoreKnowledgeChunk(
              chunk as any,
              observation,
              siteType,
              mshaPartPreference,
              routeHints,
            ),
          )
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);
      } catch (error: any) {
        console.error("Applicable standards knowledge query failed:", error);
      }
    }

    const strongKnowledgeMatches = knowledgeMatches.filter(
      (item) => item.score >= 80,
    );
    const shouldUseKnowledgeOnly =
      strongKnowledgeMatches.length > 0 &&
      strongKnowledgeMatches[0].matchingReasons?.some((reason: string) =>
        reason.startsWith("route: source key") ||
        reason.startsWith("scenario:") ||
        reason.startsWith("scope:"),
      );

    // If the active HazLenz route provides focused shard citations, do not
    // short-circuit through knowledge chunks only. The standards repository path
    // below is responsible for injecting and prioritizing those focused citations
    // into suggestedStandards/referenceStandards.
    if (shouldUseKnowledgeOnly && focusedShardCitationsArray.length === 0) {
      const finalLimit = limit > 5 ? limit : 10;
      if (diagnostics) {
        Object.assign(diagnostics, {
          standardsLookupMode: "knowledge_only",
          usedFocusedShardCitations: false,
          focusedShardCitations: focusedShardCitationsArray,
          standardsCandidatesQueried: 0,
          standardsReturned: knowledgeMatches.slice(0, finalLimit).length,
          knowledgeChunksQueried: knowledgeChunksCount,
          selectedColumnsMode: "compact",
          fallbackUsed: false,
          activeJurisdiction: activeJurisdiction || "unknown",
          routeShardKey: routeHints?.shardKey || "unknown",
          routeSourceKeys: routeHints?.sourceKeys || [],
          routeBundleIds: routeHints?.bundleIds || [],
        });
      }
      return knowledgeMatches.slice(0, finalLimit);
    }

    let focusedStandards: Standard[] = [];
    let fallbackStandards: Standard[] = [];

    try {
      if (focusedShardCitationsArray.length > 0) {
        const focusedQuery = this.standardRepo
          .createQueryBuilder("s")
          .select([
            "s.id",
            "s.agencyCode",
            "s.citation",
            "s.partNumber",
            "s.title",
            "s.scopeCode",
            "s.sourceKey",
            "s.authorityTier",
            "s.allowedUse",
            "s.severityWeight",
            "s.isActive",
            "s.requiredControls",
          ])
          .where("s.is_active = true");

        // Apply strict jurisdiction gating
        if (activeJurisdiction === "msha") {
          focusedQuery.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
            agency: "MSHA",
            scope: "mining",
          });
        } else if (activeJurisdiction === "osha_general_industry") {
          focusedQuery.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
            agency: "OSHA",
            scope: "general_industry",
          });
        } else if (activeJurisdiction === "osha_construction") {
          focusedQuery.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
            agency: "OSHA",
            scope: "construction",
          });
        }

        const citationConditions: string[] = [];
        const params: any = {};
        focusedShardCitationsArray.forEach((cit, idx) => {
          const cleanCit = cit
            .toLowerCase()
            .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, "")
            .trim();
          if (cleanCit.length > 0) {
            citationConditions.push(`s.citation ILIKE :focusedCit${idx}`);
            params[`focusedCit${idx}`] = `%${cleanCit}%`;
          }
        });

        if (citationConditions.length > 0) {
          focusedQuery.andWhere(`(${citationConditions.join(" OR ")})`, params);
          focusedStandards = await focusedQuery.take(25).getMany();
        }
      }

      const query = this.standardRepo
        .createQueryBuilder("s")
        .select([
          "s.id",
          "s.agencyCode",
          "s.citation",
          "s.partNumber",
          "s.title",
          "s.scopeCode",
          "s.sourceKey",
          "s.authorityTier",
          "s.allowedUse",
          "s.severityWeight",
          "s.isActive",
          "s.requiredControls",
        ])
        .where("s.is_active = true");

      // Apply strict jurisdiction gating
      if (activeJurisdiction === "msha") {
        query.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
          agency: "MSHA",
          scope: "mining",
        });
      } else if (activeJurisdiction === "osha_general_industry") {
        query.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
          agency: "OSHA",
          scope: "general_industry",
        });
      } else if (activeJurisdiction === "osha_construction") {
        query.andWhere("s.agency_code = :agency AND s.scope_code = :scope", {
          agency: "OSHA",
          scope: "construction",
        });
      } else if (siteType) {
        query.andWhere("s.scope_code = :siteType", { siteType });
      }

      if (searchTerms.length > 0) {
        const orConditions: string[] = [];
        const params: any = {};
        searchTerms.forEach((term, index) => {
          orConditions.push(
            `s.title ILIKE :term${index} OR s.keywords ILIKE :term${index}`,
          );
          params[`term${index}`] = `%${term}%`;
        });
        query.andWhere(`(${orConditions.join(" OR ")})`, params);
      }

      fallbackStandards = await query.take(50).getMany();
    } catch (error: any) {
      console.error("Applicable standards repository query failed:", error);
    }

    const candidateStandardsMap = new Map<string, Standard>();
    for (const std of [...focusedStandards, ...fallbackStandards]) {
      candidateStandardsMap.set(std.citation, std);
    }
    const candidateStandards = Array.from(candidateStandardsMap.values());

    const isForkliftSeatbelt =
      /(forklift|seatbelt|industrial truck|pit|operator)/i.test(observation);
    const codeFallbackStandards =
      this.isHousekeepingAccessScenario(observation) && activeJurisdiction === "msha"
        ? [
            {
              id: "fallback-30-cfr-56-20003",
              citation: "30 CFR 56.20003",
              heading: "Housekeeping",
              summary:
                "Workplaces, passageways, storerooms, and service rooms must be kept clean and orderly.",
              agencyCode: "MSHA" as const,
              scopeCode: "mining" as const,
              score: 95,
              confidence: 95,
              matchingReasons: [
                "fallback: material accumulation / housekeeping on catwalk or travelway",
              ],
            },
            {
              id: "fallback-30-cfr-56-11001",
              citation: "30 CFR 56.11001",
              heading: "Safe access",
              summary:
                "Safe means of access shall be provided and maintained to all working places.",
              agencyCode: "MSHA" as const,
              scopeCode: "mining" as const,
              score: 82,
              confidence: 82,
              matchingReasons: [
                "fallback: catwalk/walkway safe access affected by material buildup",
              ],
            },
          ]
        : isForkliftSeatbelt && activeJurisdiction === "osha_general_industry"
          ? [
              {
                id: "fallback-1910-178",
                citation: "1910.178",
                heading: "Powered Industrial Trucks",
                summary:
                  "Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).",
                agencyCode: "OSHA" as const,
                scopeCode: "general_industry" as const,
                score: 110,
                confidence: 99,
                matchingReasons: [
                  "fallback: forklift, seatbelt, or PIT term matched",
                ],
              },
            ]
          : [];

    const standardMatches = candidateStandards
      .map((standard) => {
        let score = 0;
        const matchingReasons: string[] = [];

        const standardTextForRoute = `${standard.citation || ""} ${standard.title || ""}`;
        const routeMatch = this.scoreRouteHintMatch(
          standard.citation,
          standardTextForRoute,
          routeHints,
        );
        if (routeMatch.score > 0) {
          score += routeMatch.score;
          matchingReasons.push(...routeMatch.reasons);
        }

        const shardMatch = focusedShardCitationsArray.some((cit) =>
          isCitationMatch(standard.citation, cit),
        );
        if (shardMatch) {
          score += 200;
          matchingReasons.push("warm-shard: focused citation match");
        }

        const titleWords = standard.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 4);

        for (const word of [...new Set(titleWords)]) {
          if (observation.includes(word)) {
            score += 6;
            matchingReasons.push(`title: ${word}`);
          }
        }

        if (siteType && standard.scopeCode === siteType) {
          score += 15;
          matchingReasons.push(`scope: ${siteType}`);
        }

        const isConveyorGuarding =
          /(conveyor|belt|tail pulley|head pulley|drive pulley|pulley|nip point|pinch point)/i.test(
            observation,
          ) &&
          /(unguarded|guard|guarding|exposed|unprotected)/i.test(observation);

        if (isConveyorGuarding) {
          if (
            standard.citation === "30 CFR 56.14107(a)" ||
            standard.citation === "30 CFR 57.14107(a)" ||
            standard.citation === "30 CFR 77.400"
          ) {
            score += isConveyorGuarding ? 90 : 65;
            matchingReasons.push(
              isConveyorGuarding
                ? "scenario: unguarded conveyor pulley / exposed nip point"
                : "scenario: moving machine parts require guarding",
            );
          }

          if (
            isConveyorGuarding &&
            (standard.citation === "30 CFR 56.11013" ||
              standard.citation === "30 CFR 56.11014" ||
              standard.citation === "30 CFR 56.4503" ||
              standard.citation === "30 CFR 56.7053" ||
              standard.citation === "30 CFR 56.7008" ||
              standard.citation === "30 CFR 56.9302" ||
              standard.citation === "30 CFR 56.9318")
          ) {
            score -= 35;
            matchingReasons.push(
              "negative: related word match but not primary guarding requirement",
            );
          }
        }

        const isScaffoldFallProtection =
          this.isScaffoldFallProtectionScenario(observation);

        if (isScaffoldFallProtection) {
          const scaffoldPrimaryCitations = new Set([
            "1926.451",
            "29 CFR 1926.451",
            "1926.501",
            "29 CFR 1926.501",
            "1926.502",
            "29 CFR 1926.502",
            "1926.503",
            "29 CFR 1926.503",
            "1926.454",
            "29 CFR 1926.454",
          ]);

          if (
            standard.citation === "1926.451" ||
            standard.citation === "29 CFR 1926.451"
          ) {
            score += 110;
            matchingReasons.push(
              "scenario: scaffold platform missing guardrails or fall protection",
            );
          }

          if (
            standard.citation === "1926.501" ||
            standard.citation === "29 CFR 1926.501"
          ) {
            score += 90;
            matchingReasons.push("scenario: construction fall protection duty");
          }

          if (
            standard.citation === "1926.502" ||
            standard.citation === "29 CFR 1926.502"
          ) {
            score += 75;
            matchingReasons.push("scenario: fall protection system criteria");
          }

          if (
            standard.citation === "1926.503" ||
            standard.citation === "29 CFR 1926.503"
          ) {
            score += 35;
            matchingReasons.push(
              "scenario: fall protection training support standard",
            );
          }

          if (
            standard.citation === "1926.454" ||
            standard.citation === "29 CFR 1926.454"
          ) {
            score += 30;
            matchingReasons.push(
              "scenario: scaffold-specific training support standard",
            );
          }

          if (
            standard.agencyCode === "OSHA" &&
            standard.scopeCode === "construction" &&
            !scaffoldPrimaryCitations.has(standard.citation)
          ) {
            score -= 35;
            matchingReasons.push(
              "negative: construction standard is not primary for scaffold fall-protection scenario",
            );
          }
        }

        if (this.isHousekeepingAccessScenario(observation)) {
          if (
            standard.citation === "30 CFR 56.20003" ||
            standard.citation === "30 CFR 57.20003"
          ) {
            score += 75;
            matchingReasons.push(
              "scenario: material accumulation / housekeeping on travelway or catwalk",
            );
          }

          if (
            standard.citation === "30 CFR 56.11001" ||
            standard.citation === "30 CFR 57.11001"
          ) {
            score += 55;
            matchingReasons.push(
              "scenario: safe access affected by material buildup on catwalk or walkway",
            );
          }

          if (standard.citation === "1910.22(a)") {
            score += 55;
            matchingReasons.push(
              "scenario: walking-working surface housekeeping / slip-trip exposure",
            );
          }

          if (
            standard.citation === "30 CFR 56.14107(a)" ||
            standard.citation === "1910.212(a)(1)" ||
            standard.citation === "1910.219"
          ) {
            score -= this.isMovingMachineScenario(observation) ? 0 : 40;
            if (!this.isMovingMachineScenario(observation)) {
              matchingReasons.push(
                "negative: no moving machine part exposure described",
              );
            }
          }
        }

        const citation = standard.citation || "";

        // 🔷 SAFEGUARDING AND GATING GUARDRAILS FOR REPOSITORY STANDARDS
        const isLiftingOrRiggingText =
          /(wire rope|wire sling|wire rope sling|crane|spreader bar|shackle|rigging|hoist|sling)/i.test(
            observation,
          );
        const isMaterialHandlingHoseText =
          /(air line|compressor hose|safety chain|whipcheck|whip check|hose connector)/i.test(
            observation,
          );
        const isElectricalCitation =
          /^(29|30) CFR (56|57)\.12|^(1910|1926)\.3|^(1910|1926)\.4|56\.12016|57\.12016/i.test(
            citation,
          );
        if (
          (isLiftingOrRiggingText || isMaterialHandlingHoseText) &&
          isElectricalCitation
        ) {
          const hasElectricalTerms =
            /(live|energized|electrical|voltage|breaker|panel|wiring|cord|arc|circuit|switch|junction)/i.test(
              observation,
            );
          if (!hasElectricalTerms) {
            score -= 100;
            matchingReasons.push(
              "guardrail: wire rope sling or hose safety connector disqualified from electrical",
            );
          }
        }

        const isMachineGuardingCitation =
          /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(
            citation,
          );
        if (isMachineGuardingCitation) {
          const hasGuardingTerms =
            /(guard|unguarded|nip point|pinch point|pulley|belt|shaft|gear|chain|rotating|moving part|estop|emergency stop|light curtain|barrier|sprocket)/i.test(
              observation,
            );
          if (!hasGuardingTerms) {
            score -= 100;
            matchingReasons.push(
              "guardrail: machine guarding standard requires explicit guarding or moving parts terms",
            );
          }
        }

        if (isElectricalCitation) {
          const hasElectricalTerms =
            /(live|energized|electrical|voltage|breaker|panel|wiring|cord|arc|circuit|switch|junction|outlet|plug|shock|power|substation|disconnect)/i.test(
              observation,
            );
          if (!hasElectricalTerms) {
            score -= 100;
            matchingReasons.push(
              "guardrail: electrical standard requires explicit electrical terms",
            );
          }
        }

        const isForkliftSeatbeltText =
          /(forklift|seatbelt|industrial truck|pit|operator)/i.test(
            observation,
          );
        if (isForkliftSeatbeltText) {
          const isPITCitation = /1910\.178|56\.9100|56\.9200/i.test(citation);
          if (isPITCitation) {
            score += 100;
            matchingReasons.push("boost: forklift, seatbelt, or PIT term matched");
          }
          if (isMachineGuardingCitation) {
            score -= 100;
            matchingReasons.push(
              "guardrail: forklift/seatbelt case penalized machine guarding",
            );
          }
        }

        const isExcavationTrenchingText =
          /(trench|excavation|shoring|sloping|benching|cave-in|digging)/i.test(
            observation,
          );
        if (isExcavationTrenchingText) {
          const isTrenchingCitation = /1926\.651|1926\.652/i.test(citation);
          if (isTrenchingCitation) {
            score += 100;
            matchingReasons.push("boost: trenching or excavation matched");
          }
        }

        const isAccessFallScaffoldText =
          /(handrail|guardrail|toe board|toeboard|scaffold|mudsill|floor grating|grating|catwalk|travelway|access platform|walking surface|fall hazard|loose catwalk|loose railing|access tower|hole)/i.test(
            observation,
          );
        if (isAccessFallScaffoldText) {
          const isMachineGuardingCitation =
            /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(
              citation,
            );
          if (isMachineGuardingCitation) {
            score -= 100;
            matchingReasons.push("applied access mismatch standard penalty");
          }
          const isFallAccessOrHousekeepingCitation =
            /56\.11012|56\.11001|56\.20003|1910\.22|1926\.451|1926\.501|1926\.502/i.test(
              citation,
            );
          if (isFallAccessOrHousekeepingCitation) {
            score += 100;
            matchingReasons.push("applied access match standard boost");
          }
        }

        const isRiggingHookText =
          /(hook|hoisting hook|crane|lifting|sling|rigging|latch|safety latch|engine blocks|overhead crane|mobile crane)/i.test(
            observation,
          );
        if (isRiggingHookText) {
          const isLotoCitation =
            /1910\.147|56\.12016|56\.14105|57\.12016|57\.14105/i.test(citation);
          if (isLotoCitation || isElectricalCitation) {
            score -= 100;
            matchingReasons.push("applied rigging mismatch standard penalty");
          }
          const isLiftingRiggingCitation =
            /1910\.184|1926\.251|56\.16007/i.test(citation);
          if (isLiftingRiggingCitation) {
            score += 100;
            matchingReasons.push("applied rigging match standard boost");
          }
        }

        const isHousekeepingTripText =
          /(trip|slip|grease|cords|floor passageway|passageway|housekeeping|walking surface|obstruction)/i.test(
            observation,
          );
        if (isHousekeepingTripText) {
          const hasElectricalExposureTerms =
            /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash)/i.test(
              observation,
            );
          if (isElectricalCitation && !hasElectricalExposureTerms) {
            score -= 100;
            matchingReasons.push(
              "applied housekeeping mismatch standard penalty",
            );
          }
          const isHousekeepingCitation = /1910\.22|56\.20003/i.test(citation);
          if (isHousekeepingCitation) {
            score += 100;
            matchingReasons.push("applied housekeeping match standard boost");
          }
        }

        const isEyePpeText =
          /(safety glasses|eye protection|goggles|face shield|wear safety|failing safety)/i.test(
            observation,
          );
        if (isEyePpeText) {
          const isFallAccessOrScaffoldCitation =
            /56\.11012|56\.11001|56\.20003|1910\.22|1926\.451|1926\.501|1926\.502/i.test(
              citation,
            );
          if (isFallAccessOrScaffoldCitation) {
            score -= 100;
            matchingReasons.push("applied ppe mismatch standard penalty");
          }
          const isPpeCitation =
            /1910\.133|1910\.132|56\.15004|56\.15006/i.test(citation);
          if (isPpeCitation) {
            score += 100;
            matchingReasons.push("applied ppe match standard boost");
          }
        }

        const isConfinedSpaceEntryText =
          /(cleanout|vessel cleanout|reaction vessel|worker entry|confined space|permit required|attendant|sewer tank|vessel entry|tank entry)/i.test(
            observation,
          );
        if (isConfinedSpaceEntryText) {
          const hasElectricalExposureTerms =
            /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash|480v|240v|4160v|contacts)/i.test(
              observation,
            );
          if (isElectricalCitation && !hasElectricalExposureTerms) {
            score -= 100;
            matchingReasons.push(
              "applied confined space mismatch standard penalty",
            );
          }
        }

        const isEmergencyEgressText =
          /(exit|egress|exit route|exit sign|exit door|exit pathway|evacuation)/i.test(
            observation,
          );
        if (isEmergencyEgressText) {
          const isMachineGuardingCitation =
            /56\.14107|57\.14107|1910\.212|1910\.219|77\.400|1926\.300/i.test(
              citation,
            );
          if (isMachineGuardingCitation) {
            score -= 100;
            matchingReasons.push("applied egress mismatch standard penalty");
          }
        }

        const isSafetyShowerEyewashText =
          /(safety shower|eye wash|eyewash)/i.test(observation);
        if (isSafetyShowerEyewashText) {
          const isWalkingWorkingSurfaceCitation =
            /1910\.22|56\.20003/i.test(citation);
          if (isWalkingWorkingSurfaceCitation) {
            score -= 100;
            matchingReasons.push("applied safety shower access standard penalty");
          }
        }

        const isCylinderCitation =
          /1910\.253|1910\.252|1910\.101|1926\.350|56\.16005|56\.16006|57\.16005|57\.16006/i.test(
            citation,
          );
        if (isCylinderCitation) {
          const hasCylinderTerms =
            /(cylinder|oxygen|acetylene|gas tank|compressed gas|welding cylinder|manifold|valve cap)/i.test(
              observation,
            );
          if (!hasCylinderTerms) {
            score -= 100;
            matchingReasons.push(
              "guardrail: cylinder standard requires explicit cylinder/gas terms",
            );
          }
        }

        return {
          id: standard.id,
          citation: standard.citation,
          heading: standard.title,
          summary: standard.title,
          agencyCode: standard.agencyCode,
          scopeCode: standard.scopeCode,
          score,
          confidence: Math.min(99, Math.round(score)),
          matchingReasons,
        };
      })
      .filter((item) => item.score >= 10);

    const finalLimit = limit > 5 ? limit : 10;

    const getPriority = (item: any) => {
      const isFocused = focusedShardCitationsArray.some((cit) =>
        isCitationMatch(item.citation, cit)
      );
      if (isFocused) {
        return 3;
      }
      
      const matchesAgency = 
        activeJurisdiction === "msha" ? (item.agencyCode === "MSHA" || item.citation.startsWith("30 CFR") || item.citation.startsWith("56.") || item.citation.startsWith("57.")) :
        activeJurisdiction === "osha_general_industry" ? (item.agencyCode === "OSHA" && (item.scopeCode === "general_industry" || item.citation.includes("1910"))) :
        activeJurisdiction === "osha_construction" ? (item.agencyCode === "OSHA" && (item.scopeCode === "construction" || item.citation.includes("1926"))) :
        true;
        
      if (matchesAgency) {
        return 2;
      }
      
      return 1;
    };

    const results = [
      ...knowledgeMatches,
      ...codeFallbackStandards,
      ...standardMatches,
    ]
      .sort((a, b) => {
        const priA = getPriority(a);
        const priB = getPriority(b);
        if (priA !== priB) {
          return priB - priA;
        }
        return b.score - a.score;
      })
      .filter(
        (item, index, arr) =>
          arr.findIndex((other) => other.citation === item.citation) === index,
      )
      .filter((item) => {
        if (!activeJurisdiction) return true;
        if (activeJurisdiction === "msha") {
          return item.agencyCode === "MSHA" || item.citation.startsWith("30 CFR") || item.citation.startsWith("56.") || item.citation.startsWith("57.") || item.citation.startsWith("75.") || item.citation.startsWith("77.");
        }
        if (activeJurisdiction === "osha_general_industry") {
          return item.agencyCode === "OSHA" && (item.scopeCode === "general_industry" || item.citation.includes("1910") || item.citation.startsWith("29 CFR 1910"));
        }
        if (activeJurisdiction === "osha_construction") {
          return item.agencyCode === "OSHA" && (item.scopeCode === "construction" || item.citation.includes("1926") || item.citation.startsWith("29 CFR 1926"));
        }
        return true;
      })
      .slice(0, finalLimit);

    if (diagnostics) {
      const matchedFocused = results.some((item) =>
        focusedShardCitationsArray.some((cit) => isCitationMatch(item.citation, cit))
      );
      Object.assign(diagnostics, {
        standardsLookupMode: "compact_route_scoped",
        usedFocusedShardCitations: matchedFocused,
        focusedShardCitations: focusedShardCitationsArray,
        standardsCandidatesQueried: focusedStandards.length + fallbackStandards.length,
        standardsReturned: results.length,
        knowledgeChunksQueried: knowledgeChunksCount,
        selectedColumnsMode: "compact",
        fallbackUsed: fallbackStandards.length > 0 || codeFallbackStandards.length > 0,
        activeJurisdiction: activeJurisdiction || "unknown",
        routeShardKey: routeHints?.shardKey || "unknown",
        routeSourceKeys: routeHints?.sourceKeys || [],
        routeBundleIds: routeHints?.bundleIds || [],
      });
    }

    return results;
  }
}
