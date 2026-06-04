const natural = require('natural');

const testInputs = [
  "wet floor near warehouse entrance",
  "employee slipped on oil spill in maintenance bay",
  "uneven concrete causing trip hazard in loading dock",
  "loose gravel on pathway creating unstable footing",
  "ice accumulation on outdoor stairwell",
  "missing anti-slip surface on metal platform",

  "worker exposed to fall from unprotected roof edge",
  "no guardrails on elevated work platform",
  "open-sided floor without fall protection",

  "unguarded conveyor belt pinch point",
  "exposed rotating shaft on industrial mixer",
  "missing machine guard on cutting blade",

  "exposed live wires in junction box",
  "damaged extension cord in use",
  "electrical panel left open and accessible",

  "blocked fire exit in storage room",
  "fire extinguisher missing inspection tag",
  "flammable materials stored near ignition source",

  "employee lifting heavy boxes without assistance",
  "awkward posture while working at workstation",
  "repetitive motion causing strain",

  "employee not wearing required safety glasses",
  "missing hard hat in active construction zone",
  "worker handling chemicals without gloves",

  "forklift operating in pedestrian walkway",
  "vehicle reversing without spotter",
  "speeding equipment in confined workspace",

  "cluttered workspace creating obstruction",
  "tools left scattered on floor",
  "trash accumulation in work area",

  "unlabeled chemical containers in lab",
  "improper storage of hazardous substances",
  "lack of safety data sheets available",

  "entry into confined space without permit",
  "lack of atmospheric testing before entry",
  "no rescue plan for confined space work",

  "thing looks unsafe but not sure what exactly",
  "equipment seems off during operation",
  "area feels dangerous but no clear hazard"
];

// ---------- UNIQUENESS ----------
const unique = new Set(testInputs);

console.log("\n=== UNIQUENESS ===");
console.log("Total:", testInputs.length);
console.log("Unique:", unique.size);

// ---------- NORMALIZED ----------
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

const normalized = new Set(testInputs.map(normalize));

console.log("\n=== NORMALIZED ===");
console.log("Normalized Unique:", normalized.size);

// ---------- SIMILARITY ----------
console.log("\n=== SIMILAR ===");

for (let i = 0; i < testInputs.length; i++) {
  for (let j = i + 1; j < testInputs.length; j++) {
    const sim = natural.JaroWinklerDistance(
      testInputs[i],
      testInputs[j]
    );

    if (sim > 0.9) {
      console.log(testInputs[i], "≈", testInputs[j]);
    }
  }
}

// ---------- SCORE ----------
const score = normalized.size / testInputs.length;

console.log("\n=== SCORE ===");
console.log(score.toFixed(2));
