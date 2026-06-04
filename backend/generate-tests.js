const fs = require('fs');

const hazards = {
  machine: ["conveyor", "belt", "machine", "equipment", "motor", "shaft", "gearbox", "pulley"],
  slip: ["wet floor", "oil spill", "slick surface", "slippery area", "grease buildup"],
  fall: ["stairs", "ladder", "roof edge", "elevated platform", "open edge"],
  electrical: ["live wires", "electrical panel", "voltage hazard", "exposed wiring"],
  fire: ["fire exit", "flammable material", "blocked exit", "combustible storage"],
  ppe: ["no helmet", "missing gloves", "no safety glasses", "no PPE"],
  vehicle: ["forklift", "truck", "vehicle", "mobile equipment"],
  chemical: ["chemical container", "toxic substance", "hazardous material", "corrosive liquid"]
};

const modifiers = [
  "unguarded","missing","damaged","unsafe","blocked",
  "exposed","unsecured","poorly maintained","improper",
  "faulty","worn","loose","unprotected"
];

const contexts = [
  "in warehouse","near entrance","on site","in work area",
  "during operation","in production line","in storage area"
];

const humanInputs = [
  { input: "guy slipped walking in", expected: "slip" },
  { input: "floor was slick", expected: "slip" },
  { input: "almost fell off that edge", expected: "fall" },
  { input: "no guard on that machine", expected: "machine" },
  { input: "wires look exposed", expected: "electrical" },
  { input: "forklift almost hit someone", expected: "vehicle" },
  { input: "no gloves while handling chemicals", expected: "ppe" },
  { input: "that exit is blocked", expected: "fire" },
  { input: "smelled something burning near chemicals", expected: "fire" },
  { input: "something seems off with that equipment", expected: "machine" }
];

const seen = new Set();
const testCases = [];

const TARGET = 2000;

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🔥 STRUCTURED GENERATION
while (testCases.length < TARGET) {
  const category = random(Object.keys(hazards));
  const item = random(hazards[category]);
  const modifier = random(modifiers);
  const context = random(contexts);

  const phrase = `${modifier} ${item} ${context}`;

  if (!seen.has(phrase)) {
    seen.add(phrase);

    testCases.push({
      input: phrase,
      expected: category
    });
  }
}

// 🔥 ADD HUMAN INPUTS (AFTER initialization)
humanInputs.forEach(h => testCases.push(h));

// 🔥 SHUFFLE
testCases.sort(() => Math.random() - 0.5);

// 🔥 SAVE
fs.writeFileSync(
  'generated-tests.json',
  JSON.stringify(testCases, null, 2)
);

console.log(`Generated ${testCases.length} test cases`);
