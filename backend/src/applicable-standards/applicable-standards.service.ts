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
    mshaPartPreference?: "56" | "57" | "75" | "77",
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
      if (observation.includes(term) && text.includes(term)) {
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

    let all: Standard[] = [];

    let knowledgeMatches: any[] = [];
    if (this.knowledgeChunkRepo) {
      try {
        const queryBuilder = this.knowledgeChunkRepo
          .createQueryBuilder("c")
          .innerJoinAndSelect("c.document", "d")
          .where("d.sourceType = :sourceType", { sourceType: "regulation" })
          .andWhere("c.citation IS NOT NULL")
          .andWhere("c.citation ~ :cfrCitationPattern", {
            cfrCitationPattern: "^(29|30) CFR ",
          })
          .andWhere("c.citation NOT ILIKE :testCitation", {
            testCitation: "TEST-%",
          })
          .andWhere("c.citation NOT ILIKE :starterCitation", {
            starterCitation: "SAFE-SCOPE-%",
          });

        // Add agency filter if provided
        if (sourceMode.startsWith("MSHA")) {
          queryBuilder.andWhere("d.agency = :agency", { agency: "MSHA" });
        } else if (
          source === "OSHA_CONSTRUCTION" ||
          source === "OSHA_GENERAL_INDUSTRY"
        ) {
          queryBuilder.andWhere("d.agency = :agency", { agency: "OSHA" });
        }

        const chunks = await queryBuilder.take(5000).getMany();
        console.log(
          `Diagnostic: Retrieved ${chunks.length} chunks from SafeScopeKnowledgeChunk`,
        );

        knowledgeMatches = chunks
          .map((chunk) =>
            this.scoreKnowledgeChunk(chunk, observation, siteType, mshaPartPreference),
          )
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score);
        knowledgeMatches
          .slice(0, 5)
          .forEach((m) =>
            console.log(
              `   - Citation: ${m.citation}, Score: ${m.score}, Reasons: ${m.matchingReasons.join(", ")}`,
            ),
          );
      } catch (error: any) {
        console.error("Applicable standards knowledge query failed:", error);
      }
    }

    if (knowledgeMatches.length > 0) {
      return knowledgeMatches.slice(0, limit);
    }

    try {
      all = await this.standardRepo.find({
        where: siteType
          ? { scopeCode: siteType as any, isActive: true }
          : { isActive: true },
        take: 5000,
      });
    } catch (error: any) {
      console.error("Applicable standards repository query failed:", error);
      all = [];
    }

    const isForkliftSeatbelt = /(forklift|seatbelt|industrial truck|pit|operator)/i.test(observation);
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
        : isForkliftSeatbelt
          ? [
              {
                id: "fallback-1910-178",
                citation: "1910.178",
                heading: "Powered Industrial Trucks",
                summary:
                  "Powered industrial truck operator training, maintenance, and safety requirements including operator restraint systems (seatbelts).",
                agencyCode: "OSHA",
                scopeCode: "general_industry",
                score: 110,
                confidence: 99,
                matchingReasons: [
                  "fallback: forklift, seatbelt, or PIT term matched",
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

          // 🔷 SAFEGUARDING AND GATING GUARDRAILS FOR REPOSITORY STANDARDS
          const citation = standard.citation || "";

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
