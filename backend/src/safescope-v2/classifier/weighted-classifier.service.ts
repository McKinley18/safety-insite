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

function getSemanticArbitrationSignals(normalizedText: string) {
  const hasBlockedOrAccessIssue =
    /\b(blocked|obstructed|inaccessible|access blocked|blocked access|clearance|clearances|stored|storage|pallet|material|equipment|covered|buried)\b/i.test(normalizedText);

  const electricalObject =
    /\b(electrical|electric|disconnect|breaker|panel|mcc|switchgear|switch|cord|wire|wiring|conduit|junction|receptacle|outlet|energized|voltage|arc flash|transformer|fuse|cabinet)\b/i.test(normalizedText);

  const emergencyEgressObject =
    /\b(emergency exit|exit route|exit door|egress|means of egress|fire exit|escape route)\b/i.test(normalizedText);

  const fireProtectionObject =
    /\b(fire extinguisher|extinguisher|fire hose|fire alarm|sprinkler|fire suppression|hydrant)\b/i.test(normalizedText);

  const machineSafetyControlObject =
    /\b(emergency stop|e-stop|estop|pull cord|stop cord|kill switch|interlock|machine guard|guard)\b/i.test(normalizedText);

  const travelPathObject =
    /\b(walkway|aisle|aisleway|travelway|passageway|floor|walking surface|walking-working surface|stairs|platform)\b/i.test(normalizedText);

  return {
    electricalAccessIssue: electricalObject && hasBlockedOrAccessIssue,
    emergencyEgressAccessIssue: emergencyEgressObject && hasBlockedOrAccessIssue,
    fireProtectionAccessIssue: fireProtectionObject && hasBlockedOrAccessIssue,
    machineSafetyControlAccessIssue: machineSafetyControlObject && hasBlockedOrAccessIssue,
    walkingSurfaceAccessIssue:
      travelPathObject &&
      hasBlockedOrAccessIssue &&
      !electricalObject &&
      !emergencyEgressObject &&
      !fireProtectionObject &&
      !machineSafetyControlObject,
  };
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
      const hasAccessFallScaffoldTerms = /(handrail|guardrail|toe board|toeboard|scaffold|mudsill|floor grating|grating|catwalk|travelway|access platform|walking surface|fall hazard|loose catwalk|loose railing|access tower|safety harness|harness|perimeter side|unprotected edge|unprotected perimeter|lanyard|lifeline)/i.test(normalizedText);
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
      const isTripPassagewayOrHousekeepingText = /(trip|slip|grease|cords|floor passageway|passageway|housekeeping|walking surface|obstruction|wet floor|aisleway|aisle|spill|puddle|standing water|water on floor)/i.test(normalizedText);
      const isConfinedSpaceEntryText = /(cleanout|vessel cleanout|reaction vessel|worker entry|confined space|permit required|attendant|sewer tank|vessel entry|tank entry|entrant|retrieval line|rescue line|digester pit|manhole entry|sewer entry)/i.test(normalizedText);
      
      const hasElectricalExposure = /(live|exposed conductor|exposed wire|exposed wiring|frayed|shock|electrocution|energized|voltage|breaker|panel|high voltage|arc flash)/i.test(normalizedText);

      if (profile.id === "electrical") {
        if (!hasElectricalExposure) {
          score -= 45; // Penalize electrical when no actual electrical hazard exists
        }
        if (isTripPassagewayOrHousekeepingText) {
          const hasDirectElectricalExposure = /(live wire|exposed conductor|exposed wiring|frayed wire|energized electrical|shock hazard|exposed energized|damaged insulation)/i.test(normalizedText);
          if (!hasDirectElectricalExposure) {
            score -= 45; // Further penalize electrical on trip/slip floor conditions near electrical locations
          }
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

      // 9. Respirable Dust / Silica over-trigger guardrails
      const hasEyeFacePpeSignal = /(safety glasses|eye protection|goggles|face shield|protective eyewear)/i.test(normalizedText);
      const hasEyeInjuryOrProjectileSignal = /(steel chip|chip flew|flying chip|flying particle|flew into.*eye|eye injury|struck.*eye|into their eye|into his eye|into her eye)/i.test(normalizedText);
      const isEyeFacePpeInjuryText = hasEyeFacePpeSignal && hasEyeInjuryOrProjectileSignal;

      if (isEyeFacePpeInjuryText) {
        const isPpeProfile =
          profile.id === "ppe" ||
          profile.id === "personal_protective_equipment" ||
          /personal protective equipment|ppe|eye.*face/i.test(profile.label || "");

        if (isPpeProfile) {
          score += 95;
        }

        if (
          profile.id === "respirable_dust_silica" ||
          /respirable|silica|dust/i.test(profile.label || "")
        ) {
          score -= 120;
        }
      }

      const isDrowningWaterHazardText = /(drowned|drowning|sediment pond|settling pond|water hazard|personal flotation device|pfd|flotation device|fell into.*pond|falling into.*pond)/i.test(normalizedText);
      if (isDrowningWaterHazardText) {
        const isDrowningProfile =
          profile.id === "drowning_hazards" ||
          profile.id === "drowning_water_hazard" ||
          profile.id === "water_hazards" ||
          /drowning|water hazard|flotation/i.test(profile.label || "");

        if (isDrowningProfile) {
          score += 110;
        }

        if (
          profile.id === "respirable_dust_silica" ||
          profile.id === "falls" ||
          profile.id === "machine_guarding" ||
          /respirable|silica|dust|machine guarding|fall protection/i.test(profile.label || "")
        ) {
          score -= 120;
        }
      }

      // Semantic hazard arbitration.
      // Generic words like "blocked" are not enough by themselves; SafeScope should
      // identify the safety-critical object being blocked, then classify by the
      // primary hazard domain/function affected.
      const semantic = getSemanticArbitrationSignals(normalizedText);

      if (semantic.electricalAccessIssue) {
        if (profile.id === "electrical") score += 70;
        if (profile.id === "walking_working_surfaces" || profile.id === "housekeeping") score -= 55;
      }

      if (semantic.emergencyEgressAccessIssue) {
        if (profile.id === "emergency_egress") score += 70;
        if (profile.id === "walking_working_surfaces" || profile.id === "housekeeping") score -= 35;
      }

      if (semantic.fireProtectionAccessIssue) {
        if (profile.id === "fire_explosion" || profile.id === "fire_protection") score += 55;
        if (profile.id === "walking_working_surfaces" || profile.id === "housekeeping") score -= 25;
      }

      if (semantic.machineSafetyControlAccessIssue) {
        if (profile.id === "machine_guarding") score += 45;
        if (profile.id === "walking_working_surfaces" || profile.id === "housekeeping") score -= 25;
      }

      if (semantic.walkingSurfaceAccessIssue) {
        if (profile.id === "walking_working_surfaces" || profile.id === "housekeeping") score += 35;
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

      
      // Ground Control / Highwall / Roof Fall Booster
      const hasGroundControlDetector = /(highwall|bench collapse|face slough|roof fall|roof material|falling rock|roof support|scaling|ground failure|overburden)/i.test(normalizedText);

      if (hasGroundControlDetector) {
        if (profile.id === "ground_control") {
          score += 60;
        }

        if (profile.id === "falls") {
          score -= 50;
        }

        if (
          profile.id === "machine_guarding" &&
          !/(unguarded|nip point|rotating|pulley|belt|shaft|guard)/i.test(normalizedText)
        ) {
          score -= 50;
        }

        if (profile.id === "powered_mobile_equipment") {
          score -= 40;
        }
      }

      const evidenceTokens = unique([
        ...strong.matches,
        ...moderate.matches,
        ...weak.matches,
        ...context.matches,
      ]);

      const negativeTokens = unique(negative.matches);
      const matchedControls = profile.requiredControls || [];
      const commonConsequences = profile.commonConsequences || [];

      const maxPossibleSignalScore = [
        ...profile.strongSignals,
        ...profile.moderateSignals,
        ...profile.weakSignals,
        ...profile.contextBoosts,
      ].reduce((sum, signal) => sum + Math.max(signal.weight, 0), 0);

      return {
        id: profile.id,
        classification: profile.label,
        family: profile.family,
        score,
        maxPossibleSignalScore,
        evidenceTokens,
        negativeTokens,
        matchedControls,
        commonConsequences,
        explanation:
          score > 0
            ? `HazLenz AI matched weighted ${profile.label} signals.`
            : `Insufficient weighted signal evidence for ${profile.label}.`,
      };
    });

    const sorted = candidates
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score);

    const primary = sorted[0] || {
      id: "unknown",
      classification: "Unclassified",
      family: "Unknown",
      score: 0,
      maxPossibleSignalScore: 0,
      evidenceTokens: [],
      negativeTokens: [],
      matchedControls: [],
      commonConsequences: [],
      explanation: "HazLenz AI could not identify enough weighted hazard signals.",
    };

    const runnerUp = sorted[1];
    const scoreMargin = runnerUp ? primary.score - runnerUp.score : primary.score;
    const { confidence, confidenceBand } = confidenceFromScore(primary.score, scoreMargin);

    const ambiguityWarnings =
      runnerUp && scoreMargin <= 3
        ? [`Close match between ${primary.classification} and ${runnerUp.classification}.`]
        : [];

    return {
      classification: primary.classification,
      confidence,
      confidenceBand,
      evidenceTokens: primary.evidenceTokens,
      ambiguityWarnings,
      requiresHumanReview: confidenceBand !== "high" || ambiguityWarnings.length > 0,
      explanation: primary.explanation,
      commonConsequences: primary.commonConsequences,
      requiredControls: primary.matchedControls,
      score: primary.score,
      scoreMargin,
      additionalHazards: sorted
        .slice(1)
        .filter((candidate) => {
          const candidateMargin = primary.score - candidate.score;
          const hasMeaningfulEvidence = candidate.evidenceTokens.length >= 2;
          const isCloseCompetingHazard = candidate.score >= 7 && candidateMargin <= 6;

          return hasMeaningfulEvidence && isCloseCompetingHazard;
        })
        .slice(0, 3)
        .map((candidate) => ({
          classification: candidate.classification,
          confidence: confidenceFromScore(candidate.score, 0).confidence,
          confidenceBand: confidenceFromScore(candidate.score, 0).confidenceBand,
          evidenceTokens: candidate.evidenceTokens,
          explanation: candidate.explanation,
        })),
      excludedHazards: candidates
        .filter((candidate) => candidate.id !== primary.id)
        .map((candidate) => ({
          classification: candidate.classification,
          reason:
            candidate.score <= 0
              ? "Insufficient weighted signal evidence."
              : "Lower weighted score than primary classification.",
          negativeTokens: candidate.negativeTokens,
        })),
    };
  }
}
