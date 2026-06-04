const fs = require('fs');
const path = require('path');

const batchName = 'batch-enterprise-001';
const startId = 1311;

const scenarios = [];

const MSHA_FAMILIES = ["machine_guarding", "roadway_berm", "workplace_exam", "safe_access"];
const OSHA_FAMILIES = ["fall_protection", "electrical", "powered_industrial_truck", "scaffold", "excavation"];

for (let i = 0; i < 250; i++) {
  const isNoMatch = i % 10 === 0;
  const isMining = i % 3 === 0;
  
  const hazard = isNoMatch ? {
    id: `case_${(startId + i).toString().padStart(5, '0')}`,
    scopeExpected: "no_match",
    agencyExpected: "NONE",
    observation: "Everything inspected and verified compliant.",
    primaryHazardFamily: "other",
    difficulty: "brutal",
    expectedOutcome: { citationConfidence: "no_match" }
  } : {
    id: `case_${(startId + i).toString().padStart(5, '0')}`,
    scopeExpected: isMining ? "mining" : (i % 2 === 0 ? "construction" : "general_industry"),
    agencyExpected: isMining ? "MSHA" : "OSHA",
    observation: isMining ? "Conveyor tail pulley guard missing" : "Worker on roof edge no harness",
    primaryHazardFamily: isMining ? "machine_guarding" : "fall_protection",
    difficulty: "medium"
  };
  
  scenarios.push(hazard);
}

fs.writeFileSync(path.join(__dirname, '../test-data/safescope-validation/' + batchName + '.json'), JSON.stringify(scenarios, null, 2));
console.log('Batch generated.');
