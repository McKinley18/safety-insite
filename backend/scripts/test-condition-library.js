const fs = require("fs");

const library = JSON.parse(fs.readFileSync("test-data/condition-library/hazard-condition-library.json", "utf8"));
const suppressors = JSON.parse(fs.readFileSync("test-data/condition-library/004_no_match_suppressors.json", "utf8"));

function includesAny(text, terms = []) {
  return terms.some(term => text.includes(term.toLowerCase()));
}

function scoreCondition(text, condition) {
  const equipmentHits = (condition.equipmentTerms || []).filter(t => text.includes(t.toLowerCase())).length;
  const failureHits = (condition.failureTerms || []).filter(t => text.includes(t.toLowerCase())).length;
  const contextHits = (condition.contextTerms || []).filter(t => text.includes(t.toLowerCase())).length;
  const negativeHits = (condition.negativeSignals || []).filter(t => text.includes(t.toLowerCase())).length;

  if (includesAny(text, condition.safeSuppressors || [])) return 0;

  return equipmentHits * 30 + failureHits * 45 + contextHits * 15 - negativeHits * 50;
}

function classify(observation) {
  const text = observation.toLowerCase();

  if (includesAny(text, suppressors)) {
    return { citation: "NO_MATCH", scope: "NO_MATCH", family: "other", confidence: 100 };
  }

  const scored = library.conditions
    .map(c => ({ c, score: scoreCondition(text, c) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length || scored[0].score < 60) {
    return { citation: "NO_MATCH", scope: "NO_MATCH", family: "other", confidence: 0 };
  }

  const best = scored[0].c;
  return {
    conditionId: best.conditionId,
    citation: best.citation,
    scope: best.scope,
    family: best.family,
    confidence: Math.min(99, scored[0].score)
  };
}

const tests = [
  "Loose rock and spillage covering walkway at screen deck.",
  "Fixed ladder to crusher tower missing one rung.",
  "Worker installing roofing near open edge without fall protection.",
  "Frame scaffold working level missing guardrail on open side.",
  "Worker standing beneath suspended beam during crane lift.",
  "Worker using dust cartridge during solvent vapor mixing task.",
  "Haul truck backup alarm tested and functioning properly.",
  "Scaffold guardrails complete and planks secured."
];

for (const t of tests) {
  console.log("\nOBS:", t);
  console.log(classify(t));
}
