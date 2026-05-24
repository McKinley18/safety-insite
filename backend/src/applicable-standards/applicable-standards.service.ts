import { Injectable, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Standard } from "../standards/entities/standard.entity";
import { SafeScopeKnowledgeChunk } from "../safescope-knowledge/entities/safescope-knowledge-chunk.entity";

@Injectable()
export class ApplicableStandardsService {
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
  ) {
    const citation = chunk.citation || "";
    const heading = chunk.sectionHeading || "";
    const text =
      `${citation} ${heading} ${chunk.chunkSummary || ""} ${chunk.chunkText || ""}`.toLowerCase();

    let score = 0;
    const matchingReasons: string[] = [];

    const document = chunk.document;
    const agency = document?.agency;
    const title = document?.title || "";

    if (siteType === "mining" && agency === "MSHA") {
      score += 15;
      matchingReasons.push("scope: mining");
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
      if (observation.includes(term) && text.includes(term)) {
        score += 8;
        matchingReasons.push(`term: ${term}`);
      }
    }

    if (this.isMovingMachineScenario(observation)) {
      if (citation === "30 CFR 56.14107" || citation === "30 CFR 77.400") {
        score += 90;
        matchingReasons.push(
          "scenario: unguarded conveyor pulley / exposed nip point",
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

  constructor(
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @Optional()
    @InjectRepository(SafeScopeKnowledgeChunk)
    private readonly knowledgeChunkRepo?: Repository<SafeScopeKnowledgeChunk>,
  ) {}

  async suggest(
    description: string,
    hazardCategory?: string,
    source?: string,
    limit = 5,
  ) {
    const siteType =
      source === "MSHA"
        ? "mining"
        : source === "OSHA_CONSTRUCTION"
          ? "construction"
          : source === "OSHA_GENERAL_INDUSTRY"
            ? "general_industry"
            : undefined;

    const observation = (description || "").toLowerCase();

    let all: Standard[] = [];

    let knowledgeMatches: any[] = [];

    if (this.knowledgeChunkRepo) {
      try {
        const chunks = await this.knowledgeChunkRepo.find({
          relations: ["document"],
          where: {
            document: {
              sourceType: "regulation" as any,
            },
          } as any,
          take: 5000,
        });

        knowledgeMatches = chunks
          .map((chunk) =>
            this.scoreKnowledgeChunk(chunk, observation, siteType),
          )
          .filter((item) => item.score > 0);
      } catch (error: any) {
        console.error("Applicable standards knowledge query failed:", {
          message: error?.message,
          name: error?.name,
          code: error?.code,
          detail: error?.detail,
          stack: error?.stack,
        });
      }
    }

    if (knowledgeMatches.length === 0) {
      try {
        all = await this.standardRepo.find({
          where: siteType
            ? { scopeCode: siteType as any, isActive: true }
            : { isActive: true },
          take: 5000,
        });
      } catch (error: any) {
        console.error("Applicable standards repository query failed:", {
          message: error?.message,
          name: error?.name,
          code: error?.code,
          detail: error?.detail,
          stack: error?.stack,
        });
        all = [];
      }
    }

    const fallbackStandards =
      this.isHousekeepingAccessScenario(observation) && siteType === "mining"
        ? [
            {
              id: "fallback-30-cfr-56-20003",
              citation: "30 CFR 56.20003",
              heading: "Housekeeping",
              summary:
                "Workplaces, passageways, storerooms, and service rooms must be kept clean and orderly.",
              agencyCode: "MSHA",
              scopeCode: "mining",
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
              agencyCode: "MSHA",
              scopeCode: "mining",
              score: 82,
              confidence: 82,
              matchingReasons: [
                "fallback: catwalk/walkway safe access affected by material buildup",
              ],
            },
          ]
        : [];

    const results = [
      ...fallbackStandards,
      ...all
        .map((standard) => {
          let score = 0;
          const matchingReasons: string[] = [];

          const keywords = standard.keywords || [];

          for (const keyword of keywords) {
            if (observation.includes(keyword.toLowerCase())) {
              score += 12;
              matchingReasons.push(`keyword: ${keyword}`);
            }
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

          if (this.isMovingMachineScenario(observation)) {
            const isConveyorGuarding =
              /(conveyor|belt|tail pulley|head pulley|drive pulley|pulley|nip point|pinch point)/i.test(
                observation,
              ) &&
              /(unguarded|guard|guarding|exposed|unprotected)/i.test(
                observation,
              );

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
              matchingReasons.push(
                "scenario: construction fall protection duty",
              );
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

          return {
            id: standard.id,
            citation: standard.citation,
            heading: standard.title,
            summary: standard.plainLanguageSummary,
            agencyCode: standard.agencyCode,
            scopeCode: standard.scopeCode,
            score,
            confidence: Math.min(99, Math.round(score)),
            matchingReasons,
          };
        })
        .filter((item) => item.score >= 10),
    ]
      .sort((a, b) => b.score - a.score)
      .filter(
        (item, index, arr) =>
          arr.findIndex((other) => other.citation === item.citation) === index,
      )
      .slice(0, limit);

    return results;
  }
}
