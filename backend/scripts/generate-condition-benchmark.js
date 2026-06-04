const fs = require("fs");

const lib = JSON.parse(fs.readFileSync("test-data/condition-library/hazard-condition-library.json", "utf8"));
const out = "tests/regression/condition-benchmark-001.json";

const safeCases = [
  "Equipment inspected and functioning properly.",
  "Walkway clear and unobstructed.",
  "Guard installed and all fasteners tight.",
  "Panel closed with clearance maintained.",
  "Forklift inspection completed with no defects found.",
  "Scaffold guardrails complete and planks secured.",
  "Trench shield installed before employees entered excavation.",
  "Respirator fit check completed before dusty task.",
  "Fire extinguisher inspection current and access clear.",
  "Backup alarm tested and functioning properly."
];

function pick(arr, fallback) {
  return Array.isArray(arr) && arr.length ? arr[0] : fallback;
}

const cases = [];
let n = 1;

for (const c of lib.conditions.slice(0, 90)) {
  const equipment = pick(c.equipmentTerms, "equipment");
  const failure = pick(c.failureTerms, "unsafe condition");
  const context = pick(c.contextTerms, c.scope === "mining" ? "plant area" : c.scope === "construction" ? "jobsite" : "work area");

  cases.push({
    id: `CBM-${String(n++).padStart(6, "0")}`,
    scopeExpected: c.scope,
    agencyExpected: c.agency,
    observation: `${equipment} has ${failure} at ${context}.`,
    primaryHazardFamily: c.family,
    difficulty: c.confidenceFloor >= 95 ? "hard" : "medium",
    citationReference: c.citation,
    conditionIdExpected: c.conditionId,
    source: "condition-benchmark-001"
  });
}

for (const obs of safeCases) {
  cases.push({
    id: `CBM-${String(n++).padStart(6, "0")}`,
    scopeExpected: "no_match",
    agencyExpected: "NONE",
    observation: obs,
    primaryHazardFamily: "other",
    difficulty: "easy",
    citationReference: "NO_MATCH",
    conditionIdExpected: "NO_MATCH",
    source: "condition-benchmark-001"
  });
}

fs.writeFileSync(out, JSON.stringify(cases, null, 2) + "\n");

console.log("WROTE =", out);
console.log("TOTAL =", cases.length);
console.log("NO_MATCH =", cases.filter(c => c.scopeExpected === "no_match").length);
