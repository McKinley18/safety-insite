// src/engine/scenario.engine.ts

export interface ScenarioInput {
  text: string;
  context?: string;
  hazards?: string[];
}

export interface ScenarioResult {
  detected: boolean;
  type?: string;
  riskBoost: number;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  notes?: string;
}

// 🔥 CORE SCENARIO DETECTOR
export function detectScenario(input: ScenarioInput): ScenarioResult {
  const text = (input.text || "").toLowerCase();
  const context = (input.context || "").toLowerCase();
  const hazards = input.hazards || [];

  // ===== SCENARIO: ENERGIZED WORK =====
  if (
    text.includes("energized") &&
    (text.includes("maintenance") || context.includes("maintenance"))
  ) {
    return {
      detected: true,
      type: "ENERGIZED_WORK",
      riskBoost: 2.5,
      severity: "CRITICAL",
      notes: "Work performed on energized equipment"
    };
  }

  // ===== SCENARIO: WORK AT HEIGHT =====
  if (
    text.includes("elevated") ||
    text.includes("height") ||
    hazards.includes("fall_hazard")
  ) {
    return {
      detected: true,
      type: "WORK_AT_HEIGHT",
      riskBoost: 1.5,
      severity: "HIGH",
      notes: "Exposure to fall hazard"
    };
  }

  // ===== SCENARIO: ELECTRICAL EXPOSURE =====
  if (
    hazards.includes("electrical_hazard") &&
    text.includes("open panel")
  ) {
    return {
      detected: true,
      type: "ELECTRICAL_EXPOSURE",
      riskBoost: 2,
      severity: "CRITICAL",
      notes: "Open energized electrical panel"
    };
  }

  // ===== DEFAULT =====
  return {
    detected: false,
    riskBoost: 0
  };
}
