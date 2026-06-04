const fs = require("fs");

const out = "test-data/scenario-bank/sentinel-safety-scenario-bank-001.json";

let scenarios = [];
let n = 1;

function push(scope, family, equipment, condition, environment, difficulty="easy") {
  scenarios.push({
    scenarioId: `SCN-${String(n++).padStart(6, "0")}`,
    citationReference: "AUTO",
    scopeExpected: scope,
    agencyExpected:
      scope === "mining" ? "MSHA" :
      scope === "construction" ? "OSHA" :
      scope === "general_industry" ? "OSHA" : "NONE",
    primaryHazardFamily: family,
    equipment,
    condition,
    environment,
    observation: `${equipment} ${condition} at ${environment}.`,
    difficulty,
    isNoMatch: scope === "no_match"
  });
}

/* =========================
   MINING — HOUSEKEEPING
========================= */
for (let i=0;i<25;i++){
  push("mining","housekeeping","Loose rock and spillage","covering walkway","screen deck");
}

/* =========================
   MINING — SAFE ACCESS
========================= */
for (let i=0;i<25;i++){
  push("mining","safe_access","Fixed ladder","missing rung","crusher tower");
}

/* =========================
   CONSTRUCTION — FALL
========================= */
for (let i=0;i<25;i++){
  push("construction","fall_protection","Worker near roof edge","without fall protection","roof edge");
}

/* =========================
   CONSTRUCTION — SCAFFOLD
========================= */
for (let i=0;i<25;i++){
  push("construction","scaffold","Frame scaffold","missing guardrail","open side");
}

/* =========================
   CONSTRUCTION — STRUCK BY
========================= */
for (let i=0;i<25;i++){
  push("construction","struck_by","Worker","standing under suspended load","crane lift");
}

/* =========================
   GENERAL — RESPIRATORY
========================= */
for (let i=0;i<25;i++){
  push("general_industry","respiratory","Worker","using dust cartridge for solvent vapor task","mixing area");
}

/* =========================
   ELECTRICAL
========================= */
for (let i=0;i<25;i++){
  push("mining","electrical","Junction box","open with exposed wiring","plant area");
}

/* =========================
   MACHINE GUARDING
========================= */
for (let i=0;i<25;i++){
  push("mining","machine_guarding","Conveyor drive","unguarded moving parts","transfer point");
}

/* =========================
   NO MATCH (SAFE)
========================= */
for (let i=0;i<50;i++){
  push("no_match","other","Equipment","checked and functioning properly","work area");
}

if (scenarios.length !== 250) {
  throw new Error("Scenario count mismatch: " + scenarios.length);
}

fs.writeFileSync(out, JSON.stringify(scenarios, null, 2));
console.log("WROTE", out, scenarios.length);
