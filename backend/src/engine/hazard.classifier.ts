import { detectContext } from "./context.engine";

type HazardSignal = {
  keyword: string;
  weight: number;
};

const hazardSignals: Record<string, HazardSignal[]> = {
  fire_hazard: [
    { keyword: "flammable", weight: 2 },
    { keyword: "combustible", weight: 2 },
    { keyword: "ignition", weight: 3 },
    { keyword: "sparks", weight: 3 },
    { keyword: "fire", weight: 2 },
  ],

  electrical_hazard: [
    { keyword: "energized", weight: 3 },
    { keyword: "live", weight: 3 },
    { keyword: "exposed wire", weight: 4 },
    { keyword: "voltage", weight: 2 },
    { keyword: "arc flash", weight: 5 },
  ],

  fall_hazard: [
    { keyword: "elevated", weight: 3 },
    { keyword: "lift", weight: 3 },
    { keyword: "edge", weight: 2 },
  ],

  struck_by: [
    { keyword: "truck", weight: 2 },
    { keyword: "equipment", weight: 2 },
    { keyword: "vehicle", weight: 2 },
  ],

  caught_between: [
    { keyword: "pinch", weight: 3 },
    { keyword: "crush", weight: 3 },
    { keyword: "caught between", weight: 4 },
  ],
};

export function classifyHazard(text: string) {
  const normalized = text.toLowerCase();
  const context = detectContext(text);

  const results: { type: string; score: number }[] = [];

  for (const [hazard, signals] of Object.entries(hazardSignals)) {
    let score = 0;

    for (const s of signals) {
      if (normalized.includes(s.keyword)) {
        score += s.weight;
      }
    }

    // CONTEXT BOOSTS
    if (context.energized && context.maintenance && hazard === "electrical_hazard") {
      score += 10;
    }

    if (context.elevated && hazard === "fall_hazard") {
      score += 8;
    }

    if (score > 0) {
      results.push({ type: hazard, score });
    }
  }

  const sorted = results.sort((a, b) => b.score - a.score);

  return {
    hazardTypes: sorted.map(r => r.type),
    confidence: sorted[0]?.score || 0,
    signals: results,
  };
}

export function rankHazards(hazards: string[]) {
  return hazards.map(h => ({ type: h }));
}
