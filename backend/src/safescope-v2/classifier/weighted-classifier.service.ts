import { HAZARD_TAXONOMY, HazardProfile, HazardSignal } from "../taxonomy/hazard-taxonomy";

type ConfidenceBand = "low" | "medium" | "high";

type WeightedCandidate = {
  id: string;
  classification: string;
  family: string;
  score: number;
  maxPossibleSignalScore: number;
  evidenceTokens: string[];
  negativeTokens: string[];
  matchedControls: string[];
  commonConsequences: string[];
  explanation: string;
};

function normalize(value: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function scoreSignals(normalizedText: string, signals: HazardSignal[]) {
  let score = 0;
  const matches: string[] = [];

  for (const signal of signals) {
    const term = normalize(signal.term);
    if (!term) continue;

    if (normalizedText.includes(term)) {
      score += signal.weight;
      matches.push(signal.term);
    }
  }

  return { score, matches };
}

function confidenceFromScore(score: number, margin: number): {
  confidence: number;
  confidenceBand: ConfidenceBand;
} {
  if (score >= 16 && margin >= 5) return { confidence: 0.93, confidenceBand: "high" };
  if (score >= 10 && margin >= 3) return { confidence: 0.82, confidenceBand: "high" };
  if (score >= 7) return { confidence: 0.7, confidenceBand: "medium" };
  if (score >= 4) return { confidence: 0.52, confidenceBand: "low" };
  return { confidence: 0.25, confidenceBand: "low" };
}

export class WeightedClassifierService {
  classify(text: string) {
    const normalizedText = normalize(text);

    const candidates: WeightedCandidate[] = HAZARD_TAXONOMY.map((profile: HazardProfile) => {
      const strong = scoreSignals(normalizedText, profile.strongSignals);
      const moderate = scoreSignals(normalizedText, profile.moderateSignals);
      const weak = scoreSignals(normalizedText, profile.weakSignals);
      const context = scoreSignals(normalizedText, profile.contextBoosts);
      const negative = scoreSignals(normalizedText, profile.negativeSignals);

      let score = strong.score + moderate.score + weak.score + context.score + negative.score;

      // 🔷 CUSTOM CLASSIFIER GUARDRAILS & BOOSTERS
      
      // 1. Confined Space Guardrail
      // Confined Space requires entry/permit/atmosphere/attendant indicators to avoid false positives on simple chemical storage tanks.
      if (profile.id === "confined_space") {
        const containsTankOrVessel = normalizedText.includes("tank") || normalizedText.includes("vessel");
        const hasEntryIndicators = /(entry|inside|permit|atmosphere|attendant|opening|entrant|confined|testing|rescue|ventilation|entering)/i.test(normalizedText);
        if (containsTankOrVessel && !hasEntryIndicators) {
          score -= 30; // Apply heavy penalty to prevent false-positive classifications on unlabeled storage tanks
        }
      }

      // 2. Hazard Communication Booster
      if (profile.id === "hazard_communication") {
        const hasHazcomSignals = /(unlabeled|missing label|sds|safety data sheet|chemical container|corrosive liquid|ghs|chemical storage|label)/i.test(normalizedText);
        if (hasHazcomSignals) {
          score += 15;
        }
      }

      // 3. Lifting & Rigging vs Electrical Guardrail
      // Prevent "wire" in "wire rope" from mis-classifying Lifting & Rigging as Electrical
      const hasLiftingSignals = /(wire rope|wire sling|wire rope sling|crane|spreader bar|shackle|rigging|hoist|sling)/i.test(normalizedText);
      if (hasLiftingSignals) {
        if (profile.id === "electrical") {
          score -= 45;
        }
        if (profile.id === "lifting_rigging") {
          score += 25;
        }
      }

      // 4. Material Handling vs Electrical Guardrail
      // Prevent "line" or "wire" in air line / whipcheck from mis-classifying Material Handling as Electrical
      const hasMaterialHandlingSignals = /(air line|compressor hose|safety chain|whipcheck|whip check|hose connector|cylinder|gas cylinder|oxygen cylinder|manifold)/i.test(normalizedText);
      if (hasMaterialHandlingSignals) {
        if (profile.id === "electrical") {
          score -= 45;
        }
        if (profile.id === "material_handling") {
          score += 25;
        }
      }

      // 5. A. MACHINE GUARDING OVER-TRIGGERING ON CATWALK/ACCESS/FALL/SCAFFOLD
      const hasAccessFallScaffoldTerms = /(handrail|guardrail|toe board|toeboard|scaffold|mudsill|floor grating|grating|catwalk|travelway|access platform|walking surface|fall hazard|loose catwalk|loose railing|access tower)/i.test(normalizedText);
      if (hasAccessFallScaffoldTerms) {
        if (profile.id === "machine_guarding") {
          const hasMachineContactExposure = /(unguarded conveyor|unguarded rotating|unguarded shaft|missing guard|guard removed|exposed rotating|nip point|pinch point|moving machine part|exposed.*rotating|exposed.*moving|pulley|sprocket|belt|gear|rotating component|point of operation)/i.test(normalizedText);
          if (!hasMachineContactExposure) {
            score -= 45; // Penalize machine guarding in catwalk/grating/fall contexts unless explicit moving parts are unguarded
          }
        }
        if (profile.id === "falls" || profile.id === "walking_working_surfaces") {
          score += 25;
        }
      }

      // 6. B. ELECTRICAL OVER-TRIGGERING ON PASSAGEWAY TRIP/SLIP OR CONFINED SPACE ENTRY
      const isTripPassagewayOrHousekeepingText = /(trip|slip|grease|cords|floor passageway|passageway|housekeeping|walking surface|obstruction)/i.test(normalizedText);
      const isConfinedSpaceEntryText = /(cleanout|vessel cleanout|reaction vessel|worker entry|confined space|permit required|attendant|sewer tank|vessel entry|tank entry)/i.test(normalizedText);
      
      const hasElectricalExposure = /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash)/i.test(normalizedText);

      if (profile.id === "electrical") {
        if (!hasElectricalExposure) {
          score -= 45; // Penalize electrical when no actual electrical hazard exists
        }
        if (isTripPassagewayOrHousekeepingText && !hasElectricalExposure) {
          score -= 30; // Further penalize trip/slip hazards on cords without exposed wires
        }
      }

      if (isTripPassagewayOrHousekeepingText && profile.id === "walking_working_surfaces") {
        score += 25;
      }

      if (isConfinedSpaceEntryText && profile.id === "confined_space") {
        score += 35; // Confined Space entry must win when cleanout/entry/permit conditions exist
      }

      // 7. C. LOCKOUT/STORED ENERGY OVER-TRIGGERING ON "LOCK" AS HOISTING HOOK SAFETY LATCH
      const isRiggingHookLatchText = /(hook|hoisting hook|crane|lifting|sling|rigging|latch|safety latch|engine blocks|overhead crane|mobile crane)/i.test(normalizedText);
      const hasLotoIsolationTerms = /(lockout|tagout|loto|deenergize|isolate energy|isolate power|energy isolation|zero energy|blocked against motion)/i.test(normalizedText);

      if (isRiggingHookLatchText) {
        if (profile.id === "lifting_rigging") {
          score += 35;
        }
        if (profile.id === "loto_stored_energy" && !hasLotoIsolationTerms) {
          score -= 45; // Penalize LOTO if it's just hook latch/rigging without energy control
        }
        if (profile.id === "electrical") {
          score -= 45; // Rigging shouldn't trigger electrical
        }
      }

      // 8. PPE vs Fall/Access
      const isEyePpeText = /(safety glasses|eye protection|goggles|face shield|wear safety|failing safety)/i.test(normalizedText);
      if (isEyePpeText) {
        if (profile.id === "ppe") {
          score += 45;
        }
        if (profile.id === "falls" || profile.id === "walking_working_surfaces" || profile.id === "machine_guarding") {
          score -= 45;
        }
      }

      // 9. Safety Shower / Eye Wash vs Walking/Working Surfaces Guardrail
      const isSafetyShowerEyewashText = /(safety shower|eye wash|eyewash)/i.test(normalizedText);
      if (isSafetyShowerEyewashText) {
        if (profile.id === "walking_working_surfaces") {
          score -= 45;
        }
        if (profile.id === "loto_stored_energy") {
          score -= 45;
        }
      }

      return {
        id: profile.id,
        classification: profile.label,
        family: profile.family,
        score,
        maxPossibleSignalScore:
          strong.score + moderate.score + weak.score + context.score,
        evidenceTokens: unique([
          ...strong.matches,
          ...moderate.matches,
          ...weak.matches,
          ...context.matches,
        ]),
        negativeTokens: unique(negative.matches),
        matchedControls: profile.requiredControls,
        commonConsequences: profile.commonConsequences,
        explanation:
          score > 0
            ? `SafeScope matched weighted ${profile.label} signals.`
            : `No meaningful ${profile.label} signal match.`,
      };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const second = candidates[1];
    const margin = best && second ? best.score - second.score : best?.score || 0;

    if (!best || best.score <= 0) {
      return {
        classification: "Review Required",
        confidence: 0,
        confidenceBand: "low",
        evidenceTokens: [],
        ambiguityWarnings: ["No strong SafeScope taxonomy match."],
        requiresHumanReview: true,
        explanation: "No weighted hazard profile exceeded the classification threshold.",
        additionalHazards: [],
        excludedHazards: candidates.slice(0, 5).map((candidate) => ({
          classification: candidate.classification,
          reason: "No positive weighted signal match.",
          negativeTokens: candidate.negativeTokens,
        })),
      };
    }

    const confidence = confidenceFromScore(best.score, margin);
    const ambiguityWarnings: string[] = [];

    if (second && second.score > 0 && margin <= 3) {
      ambiguityWarnings.push(
        `Close match between ${best.classification} and ${second.classification}.`
      );
    }

    if (best.negativeTokens.length > 0) {
      ambiguityWarnings.push(
        `${best.classification} had exclusion signals: ${best.negativeTokens.join(", ")}.`
      );
    }

    const additionalHazards = candidates
      .filter((candidate) => candidate.score > 0 && candidate.classification !== best.classification)
      .slice(0, 4)
      .map((candidate) => {
        const band = confidenceFromScore(candidate.score, candidate.score);
        return {
          classification: candidate.classification,
          confidence: band.confidence,
          confidenceBand: band.confidenceBand,
          evidenceTokens: candidate.evidenceTokens,
          negativeTokens: candidate.negativeTokens,
          requiresHumanReview: band.confidenceBand === "low",
          explanation: candidate.explanation,
        };
      });

    const excludedHazards = candidates
      .filter((candidate) => candidate.score <= 0 || candidate.negativeTokens.length > 0)
      .slice(0, 6)
      .map((candidate) => ({
        classification: candidate.classification,
        reason:
          candidate.negativeTokens.length > 0
            ? `Excluded or reduced by signals: ${candidate.negativeTokens.join(", ")}.`
            : "Insufficient weighted signal evidence.",
        negativeTokens: candidate.negativeTokens,
      }));

    return {
      classification: best.classification,
      confidence: confidence.confidence,
      confidenceBand: confidence.confidenceBand,
      evidenceTokens: best.evidenceTokens,
      ambiguityWarnings,
      requiresHumanReview:
        confidence.confidenceBand === "low" || ambiguityWarnings.length > 0,
      explanation: best.explanation,
      score: best.score,
      scoreMargin: margin,
      commonConsequences: best.commonConsequences,
      requiredControls: best.matchedControls,
      additionalHazards,
      excludedHazards,
    };
  }
}
