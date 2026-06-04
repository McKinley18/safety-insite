// ================================
// RISK ENGINE (CLEAN + STABLE V1)
// ================================

// -----------------------------
// INPUT TYPES
// -----------------------------
export interface RiskInput {
  text: string;
  hazards?: string[];
  industry?: "msha" | "osha";
}

// -----------------------------
// OUTPUT TYPES
// -----------------------------
export interface RiskResult {
  riskScore: number;
  riskBand: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  scenario: string | null;
}

// -----------------------------
// SCENARIO ENGINE (INLINE V1)
// -----------------------------
type ScenarioResult = {
  type: string | null;
  riskBoost: number;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
};

function detectScenario(input: {
  text: string;
  hazards: string[];
}): ScenarioResult {
  const text = input.text.toLowerCase();
  const hazards = input.hazards || [];

  // 🔥 CRITICAL: energized + maintenance
  if (
    hazards.includes("electrical_hazard") &&
    (text.includes("maintenance") || text.includes("repair")) &&
    (text.includes("energized") || text.includes("live"))
  ) {
    return {
      type: "ENERGIZED_MAINTENANCE",
      riskBoost: 2.5,
      severity: "CRITICAL",
    };
  }

  // 🔥 CRITICAL: electrical no LOTO
  if (
    hazards.includes("electrical_hazard") &&
    (text.includes("no lockout") || text.includes("no loto"))
  ) {
    return {
      type: "ENERGIZED_WORK_NO_LOTO",
      riskBoost: 1.5,
      severity: "CRITICAL",
    };
  }

  // 🔥 HIGH: fall without protection
  if (
    hazards.includes("fall_hazard") &&
    (text.includes("no harness") ||
      text.includes("no fall protection") ||
      text.includes("unguarded"))
  ) {
    return {
      type: "UNPROTECTED_FALL",
      riskBoost: 1.2,
      severity: "HIGH",
    };
  }

  // 🔥 HIGH: fire risk
  if (
    hazards.includes("fire_hazard") &&
    (text.includes("flammable") || text.includes("ignition"))
  ) {
    return {
      type: "FIRE_RISK",
      riskBoost: 1.0,
      severity: "HIGH",
    };
  }

  return {
    type: null,
    riskBoost: 0,
    severity: "LOW",
  };
}

// -----------------------------
// MAIN RISK ENGINE
// -----------------------------
export function calculateRisk(input: RiskInput): RiskResult {
  const text = input.text || "";
  const hazards = input.hazards || [];

  let probabilityScore = 1;
  let severityScore = 1;

  // -----------------------------
  // BASE HAZARD SCORING
  // -----------------------------
  if (hazards.includes("electrical_hazard")) {
    probabilityScore += 1.5;
    severityScore += 2;
  }

  if (hazards.includes("fall_hazard")) {
    probabilityScore += 1.2;
    severityScore += 1.8;
  }

  if (hazards.includes("fire_hazard")) {
    probabilityScore += 1.0;
    severityScore += 1.5;
  }

  // -----------------------------
  // SCENARIO DETECTION
  // -----------------------------
  const scenario = detectScenario({
    text,
    hazards,
  });

  probabilityScore += scenario.riskBoost;

  if (scenario.severity === "CRITICAL") {
    severityScore += 2;
  } else if (scenario.severity === "HIGH") {
    severityScore += 1;
  }

  // -----------------------------
  // INDUSTRY ADJUSTMENT
  // -----------------------------
  if (input.industry === "msha") {
    probabilityScore += 0.3;
  }

  if (input.industry === "osha") {
    severityScore += 0.2;
  }

  // -----------------------------
  // FINAL SCORE (0–5 SCALE)
  // -----------------------------
  let riskScoreRaw = (probabilityScore + severityScore) / 2;

  // Hard cap
  riskScoreRaw = Math.min(5, riskScoreRaw);

  let riskBand: RiskResult["riskBand"] = "LOW";

  if (riskScoreRaw >= 4.5) riskBand = "CRITICAL";
  else if (riskScoreRaw >= 3.5) riskBand = "HIGH";
  else if (riskScoreRaw >= 2.5) riskBand = "MODERATE";

  return {
    riskScore: Number(riskScoreRaw.toFixed(1)),
    riskBand,
    severity: riskBand,
    scenario: scenario.type,
  };
}
