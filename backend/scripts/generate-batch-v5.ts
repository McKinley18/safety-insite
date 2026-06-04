import * as fs from 'fs';
import * as path from 'path';

const batchName = 'batch-enterprise-001';
const startId = 1311;

const scenarios = [
  { id: "case_01311", industryMode: "MSHA", hazardFamily: "machine_guarding", expectedConditionId: "conveyor_guarding", observation: "Tail pulley on main conveyor unguarded", citations: ["56.14107"] },
  { id: "case_01312", industryMode: "OSHA_CONSTRUCTION", hazardFamily: "fall_protection", observation: "Worker near roof edge without tie-off", expectedConditionId: "fall_protection", citations: ["1926.501"] },
  { id: "case_01313", industryMode: "OSHA_GENERAL_INDUSTRY", hazardFamily: "electrical", observation: "Frayed extension cord in wet walkway", expectedConditionId: "electrical", citations: ["1910.303"] },
  { id: "case_01314", industryMode: "MSHA", hazardFamily: "housekeeping", observation: "Oil slick on stairs near compressor room", expectedConditionId: "housekeeping", citations: ["56.20003"] },
  { id: "case_01315", industryMode: "OSHA_CONSTRUCTION", hazardFamily: "lockout_tagout", observation: "Maintenance performed on motor without lockout", expectedConditionId: "lockout_energy", citations: ["1910.147"] },
  { id: "case_01316", industryMode: "no_match", hazardFamily: "other", observation: "Guard is installed correctly and secure.", expectedConditionId: "other_uncertain", citations: [], expectedOutcome: { citationConfidence: "no_match" } },
  { id: "case_01317", industryMode: "OSHA_GENERAL_INDUSTRY", hazardFamily: "emergency", observation: "Fire extinguisher tag missing in shop", expectedConditionId: "fire_extinguishers_hot_work", citations: ["1910.157"] },
  { id: "case_01318", industryMode: "MSHA", hazardFamily: "safe_access", observation: "Ladder access to screen tower damaged rung", expectedConditionId: "ladders_access", citations: ["56.11001"] },
  { id: "case_01319", industryMode: "OSHA_CONSTRUCTION", hazardFamily: "scaffold", observation: "Scaffold walkboard missing clip", expectedConditionId: "scaffolds", citations: ["1926.451"] },
  { id: "case_01320", industryMode: "MSHA", hazardFamily: "workplace_exam", observation: "Shift exam entry date is missing", expectedConditionId: "training_reporting", citations: ["56.18002"] },
  { id: "case_01321", industryMode: "OSHA_GENERAL_INDUSTRY", hazardFamily: "compressed_gas_cylinders", observation: "Nitrogen bottle unsecured on trolley", expectedConditionId: "compressed_gas_cylinders", citations: ["1910.253"] },
  { id: "case_01322", industryMode: "OSHA_CONSTRUCTION", hazardFamily: "excavation", observation: "Trench wall 8ft deep no shoring box", expectedConditionId: "excavation", citations: ["1926.652"] },
  { id: "case_01323", industryMode: "MSHA", hazardFamily: "workplace_exam", observation: "Shift exam record missing signature", expectedConditionId: "workplace_exam", citations: ["56.18002"] },
  { id: "case_01324", industryMode: "OSHA_GENERAL_INDUSTRY", hazardFamily: "respiratory", observation: "Excessive dust cloud at bagging area", expectedConditionId: "dust_health", citations: ["1910.1000"] },
  { id: "case_01325", industryMode: "OSHA_CONSTRUCTION", hazardFamily: "fall_protection", observation: "Safety harness d-ring bent", expectedConditionId: "fall_protection", citations: ["1926.502"] }
];

// Extend to 250 cases
for (let i = 16; i <= 250; i++) {
  const t = scenarios[i % 15];
  scenarios.push({
      ...t,
      id: `case_${(startId + i - 1).toString().padStart(5, '0')}`,
      rawDescription: t.observation + ' ' + (i)
  });
}

fs.writeFileSync(path.join(__dirname, '../test-data/safescope-validation/batch-enterprise-001.json'), JSON.stringify(scenarios, null, 2));
