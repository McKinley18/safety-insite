const fs = require("fs");

const scenarios = JSON.parse(fs.readFileSync("safescope-gauntlet.source.v1.json", "utf8"));
const intel = JSON.parse(fs.readFileSync("safescope-source-intelligence.v1.json", "utf8"));

let fail = false;

// 1. Counts
console.log("Scenario count:", scenarios.length);
console.log("Intel records:", intel.length);

// 2. Parity
const sourceIdsInScenarios = new Set(scenarios.map(s => s.sourceId));
const sourceIdsInIntel = new Set(intel.map(s => s.sourceId));
const missing = Array.from(sourceIdsInScenarios).filter(id => !sourceIdsInIntel.has(id));
if (missing.length > 0) { console.error("Missing links:", missing); fail = true; }

// 3. Duplicate IDs/Observations
const ids = scenarios.map(s => s.scenarioId);
if (ids.length !== new Set(ids).size) { console.error("Duplicate scenarioIds found"); fail = true; }

const obs = scenarios.map(s => s.observation);
if (obs.length !== new Set(obs).size) { console.error("Duplicate observations found"); fail = true; }

// 4. Metadata check
const missingMeta = scenarios.filter(s => !s.sourceId || !s.sourceUrl || !s.sourceAgency).length;
if (missingMeta > 0) { console.error("Missing metadata in scenarios:", missingMeta); fail = true; }

if (fail) process.exit(1);
console.log("PASS: Dataset integrity verified.");
