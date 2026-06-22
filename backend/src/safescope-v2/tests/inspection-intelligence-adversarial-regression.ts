import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeJurisdiction, SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

const service = new SafeScopeReasoningOrchestratorService();
const forbiddenFinalLanguage = /\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i;
let failures = 0;

function humanText(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string {
  const intelligence = result.inspectionIntelligence;
  return JSON.stringify({
    condition: intelligence.conditionAssessment,
    hazards: intelligence.hazardCandidates,
    mechanism: intelligence.mechanismChain,
    standards: intelligence.candidateStandards,
    questions: intelligence.evidenceGapQuestions,
    actions: intelligence.correctiveActions,
  });
}

function commonPass(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): boolean {
  const intelligence = result.inspectionIntelligence;
  return intelligence.guardrails.advisoryOnly
    && intelligence.guardrails.candidateStandardsOnly
    && intelligence.guardrails.doesNotDeclareViolation
    && intelligence.guardrails.requiresQualifiedReview
    && !forbiddenFinalLanguage.test(humanText(result));
}

const controlledCases: Array<{ name: string; observation: string; siteType?: string; suppressed: SafeScopeReasoningDomain[] }> = [
  { name: 'guard installed', observation: 'Machine coupling guard is installed, intact, and prevents access.', siteType: 'warehouse', suppressed: ['machine_guarding'] },
  { name: 'guarded locked-out conveyor', observation: 'Conveyor tail pulley is fully guarded and locked out for maintenance with zero energy verified.', siteType: 'warehouse', suppressed: ['machine_guarding', 'machine_guarding_loto', 'lockout_tagout'] },
  { name: 'secured cylinders', observation: 'Compressed gas cylinders are chained upright with valve caps installed.', siteType: 'shop', suppressed: ['compressed_gas'] },
  { name: 'clear exit', observation: 'Emergency exit is marked and unobstructed and the exit route is clear.', siteType: 'facility', suppressed: ['emergency_preparedness'] },
  { name: 'dry floor', observation: 'Warehouse floor is clean and dry and free of spills or debris.', siteType: 'warehouse', suppressed: ['walking_working_surfaces'] },
  { name: 'no energized exposure', observation: 'Electrical cabinet is closed with no exposed energized parts.', siteType: 'plant', suppressed: ['electrical'] },
  { name: 'panel cover intact', observation: 'Electrical panel cover is intact and secured; the enclosure is closed.', siteType: 'plant', suppressed: ['electrical'] },
  { name: 'undamaged cord', observation: 'Extension cord is undamaged and intact after the pre-use inspection.', siteType: 'construction', suppressed: ['electrical'] },
  { name: 'no pedestrian exposure', observation: 'Forklift is operating in a restricted aisle with no pedestrian exposure.', siteType: 'warehouse', suppressed: ['mobile_equipment'] },
  { name: 'barrier-separated route', observation: 'Forklift route is separated from pedestrians by fixed barriers.', siteType: 'warehouse', suppressed: ['mobile_equipment'] },
  { name: 'equipment locked out', observation: 'Machine equipment is locked out and zero-energy state verified before maintenance.', siteType: 'plant', suppressed: ['lockout_tagout'] },
  { name: 'adequate berm', observation: 'At the surface aggregate mine, the dump-point berm is present, adequate, and maintained.', suppressed: ['powered_haulage'] },
  { name: 'accessible extinguisher', observation: 'Fire extinguisher is readily accessible, unobstructed, and clearly visible.', siteType: 'facility', suppressed: ['fire_protection'] },
  { name: 'ladder removed', observation: 'Damaged extension ladder was tagged and removed from service before employee use.', siteType: 'construction', suppressed: ['ladders'] },
  { name: 'labeled closed chemical', observation: 'Chemical container is identified, labeled, and closed with the cap secured.', siteType: 'warehouse', suppressed: ['hazard_communication', 'hazardous_materials'] },
  { name: 'controlled hot work', observation: 'Hot work is being performed with combustibles removed and fire watch present.', siteType: 'construction', suppressed: ['welding_cutting_hot_work', 'fire_protection'] },
  { name: 'covered floor hole', observation: 'Floor hole is covered with a secured load-rated cover and clearly labeled.', siteType: 'construction', suppressed: ['fall_protection'] },
];

for (const test of controlledCases) {
  const result = service.reason({ hazardObservation: test.observation, siteType: test.siteType });
  const intelligence = result.inspectionIntelligence;
  const domains = intelligence.hazardCandidates.map((candidate) => candidate.domain);
  const passed = intelligence.conditionAssessment.status === 'controlled'
    && test.suppressed.every((domain) => intelligence.conditionAssessment.controlledDomains.includes(domain))
    && test.suppressed.every((domain) => !domains.includes(domain))
    && intelligence.conditionAssessment.controlEvidence.length > 0
    && intelligence.candidateStandards.length === 0
    && result.primaryCitation === undefined
    && result.hazardClassification.primaryDomain === 'unknown'
    && commonPass(result);
  if (passed) console.log(`PASS [controlled] ${test.name}`);
  else { failures += 1; console.error(`FAIL [controlled] ${test.name}`, { assessment: intelligence.conditionAssessment, domains, citations: intelligence.candidateStandards, primaryCitation: result.primaryCitation }); }
}

const vagueCases: Array<{ name: string; observation: string; expectedDomain: SafeScopeReasoningDomain }> = [
  { name: 'possible fall hazard', observation: 'Possible fall hazard.', expectedDomain: 'fall_protection' },
  { name: 'maybe electrical issue', observation: 'Maybe electrical issue.', expectedDomain: 'electrical' },
  { name: 'chemical container observed', observation: 'Chemical container observed.', expectedDomain: 'hazard_communication' },
  { name: 'equipment maintenance occurring', observation: 'Equipment maintenance occurring.', expectedDomain: 'lockout_tagout' },
  { name: 'dust in area', observation: 'Dust in the area.', expectedDomain: 'industrial_hygiene' },
  { name: 'mobile equipment nearby', observation: 'Mobile equipment nearby.', expectedDomain: 'mobile_equipment' },
  { name: 'mine site issue', observation: 'Mine site issue.', expectedDomain: 'unknown' },
  { name: 'training concern', observation: 'Training concern.', expectedDomain: 'training_procedure_gap' },
  { name: 'possible confined space', observation: 'Possible confined space.', expectedDomain: 'confined_space' },
  { name: 'fall hazard reported', observation: 'Fall hazard reported.', expectedDomain: 'fall_protection' },
];

for (const test of vagueCases) {
  const result = service.reason({ hazardObservation: test.observation });
  const intelligence = result.inspectionIntelligence;
  const candidate = intelligence.hazardCandidates.find((item) => item.domain === test.expectedDomain);
  const passed = intelligence.conditionAssessment.status === 'insufficient_evidence'
    && Boolean(candidate)
    && candidate?.confidence === 'low'
    && intelligence.conditionAssessment.uncertaintyReasons.length > 0
    && intelligence.evidenceGapQuestions.length >= 3
    && intelligence.candidateStandards.length === 0
    && result.primaryCitation === undefined
    && result.confidence.level === 'low'
    && commonPass(result);
  if (passed) console.log(`PASS [vague] ${test.name}`);
  else { failures += 1; console.error(`FAIL [vague] ${test.name}`, { assessment: intelligence.conditionAssessment, candidates: intelligence.hazardCandidates, citations: intelligence.candidateStandards, questions: intelligence.evidenceGapQuestions }); }
}

const jurisdictionCases: Array<{ name: string; observation: string; siteType?: string; expected: SafeScopeJurisdiction; mineDetected: boolean }> = [
  { name: 'quarry tile warehouse', observation: 'Quarry tile delivered to the warehouse; no safety defect reported.', siteType: 'warehouse', expected: 'osha_general_industry', mineDetected: false },
  { name: 'mine the data office', observation: 'Analysts mine the data in a manufacturing facility.', siteType: 'facility', expected: 'osha_general_industry', mineDetected: false },
  { name: 'coal tar shop', observation: 'Coal tar product inventory reviewed in the shop.', siteType: 'shop', expected: 'osha_general_industry', mineDetected: false },
  { name: 'aggregate data warehouse', observation: 'Aggregate data is displayed on a warehouse dashboard.', siteType: 'warehouse', expected: 'osha_general_industry', mineDetected: false },
  { name: 'pit stop fleet shop', observation: 'Vehicle pit stop schedule discussed in the fleet shop.', siteType: 'shop', expected: 'osha_general_industry', mineDetected: false },
  { name: 'inspection pit shop', observation: 'Automotive inspection pit is closed and guarded in the maintenance shop.', siteType: 'shop', expected: 'osha_general_industry', mineDetected: false },
  { name: 'unclear mine property', observation: 'Contractor at mine property has a training concern; mine type is unclear.', expected: 'msha', mineDetected: true },
  { name: 'construction ladder', observation: 'Extension ladder is damaged at an active construction jobsite.', expected: 'osha_construction', mineDetected: false },
  { name: 'warehouse ladder', observation: 'Extension ladder is damaged in a warehouse maintenance area.', expected: 'osha_general_industry', mineDetected: false },
  { name: 'construction scaffold', observation: 'Scaffold guardrail is missing at a construction site.', expected: 'osha_construction', mineDetected: false },
  { name: 'warehouse scaffold', observation: 'Rolling scaffold guardrail is missing inside a warehouse.', expected: 'osha_general_industry', mineDetected: false },
  { name: 'construction temporary wiring', observation: 'Temporary wiring and missing GFCI at a construction jobsite.', expected: 'osha_construction', mineDetected: false },
  { name: 'factory extension cord', observation: 'Damaged extension cord used for maintenance in a factory.', expected: 'osha_general_industry', mineDetected: false },
  { name: 'real aggregate mine', observation: 'Aggregate mine conveyor guard is missing at the crusher.', expected: 'msha', mineDetected: true },
  { name: 'contractor at mine', observation: 'Independent contractor at a surface stone mine has task training that is not verified.', expected: 'msha', mineDetected: true },
];

for (const test of jurisdictionCases) {
  const result = service.reason({ hazardObservation: test.observation, siteType: test.siteType });
  const intelligence = result.inspectionIntelligence;
  const citations = intelligence.candidateStandards.map((standard) => standard.citation).join(' ');
  const passed = result.jurisdictionAssessment.likelyJurisdiction === test.expected
    && intelligence.miningContext.detected === test.mineDetected
    && (test.expected === 'msha' || !/30 CFR/.test(citations))
    && (test.expected !== 'msha' || !/29 CFR/.test(citations))
    && commonPass(result);
  if (passed) console.log(`PASS [jurisdiction] ${test.name}`);
  else { failures += 1; console.error(`FAIL [jurisdiction] ${test.name}`, { jurisdiction: result.jurisdictionAssessment, mining: intelligence.miningContext, citations }); }
}

const trapCases = [
  ['fall meeting', 'Fall meeting is scheduled for Monday.'],
  ['completed hot-work permit', 'Hot work permit filed and complete.'],
  ['training records reviewed', 'Training record reviewed and current.'],
  ['office noise conversation', 'Noise complaint in office conversation was discussed.'],
  ['dust cover installed', 'Dust cover installed and secured on the equipment.'],
  ['account lockout', 'User is locked out of account.'],
  ['security guard', 'Guard assigned to gate entrance.'],
  ['chemical inventory complete', 'Chemical inventory complete and reviewed.'],
  ['coal-colored material', 'Coal-colored material sample is on the desk.'],
  ['pit stop', 'Pit stop was added to the vehicle schedule.'],
] as const;

for (const [name, observation] of trapCases) {
  const result = service.reason({ hazardObservation: observation, siteType: 'facility' });
  const intelligence = result.inspectionIntelligence;
  const passed = intelligence.conditionAssessment.status === 'no_hazard_signal'
    && intelligence.conditionAssessment.falsePositiveSignals.length > 0
    && intelligence.hazardCandidates.length === 0
    && intelligence.candidateStandards.length === 0
    && result.primaryCitation === undefined
    && result.hazardClassification.primaryDomain === 'unknown'
    && !intelligence.miningContext.detected
    && commonPass(result);
  if (passed) console.log(`PASS [trap] ${name}`);
  else { failures += 1; console.error(`FAIL [trap] ${name}`, { assessment: intelligence.conditionAssessment, hazards: intelligence.hazardCandidates, jurisdiction: result.jurisdictionAssessment }); }
}

const mixedCases: Array<{ name: string; observation: string; siteType: string; primary: SafeScopeReasoningDomain; suppressed: SafeScopeReasoningDomain }> = [
  { name: 'electrical over dry floor', observation: 'Exposed energized bus bars are accessible; the surrounding floor is clean and dry.', siteType: 'plant', primary: 'electrical', suppressed: 'walking_working_surfaces' },
  { name: 'forklift over clear exit', observation: 'Forklift operates near pedestrians without separation; the emergency exit route is clear and unobstructed.', siteType: 'warehouse', primary: 'mobile_equipment', suppressed: 'emergency_preparedness' },
  { name: 'unguarded shaft over labeled chemical', observation: 'Unguarded rotating shaft is within reach during maintenance; the chemical container is labeled and closed.', siteType: 'plant', primary: 'machine_guarding', suppressed: 'hazard_communication' },
  { name: 'oil spill over secured cylinders', observation: 'Oil spill crosses the pedestrian walkway; compressed gas cylinders are chained upright with valve caps installed.', siteType: 'shop', primary: 'walking_working_surfaces', suppressed: 'compressed_gas' },
  { name: 'blocked exit over accessible extinguisher', observation: 'Emergency exit is blocked by pallets; the fire extinguisher is readily accessible and unobstructed.', siteType: 'facility', primary: 'emergency_preparedness', suppressed: 'fire_protection' },
];

for (const test of mixedCases) {
  const result = service.reason({ hazardObservation: test.observation, siteType: test.siteType });
  const intelligence = result.inspectionIntelligence;
  const primary = intelligence.hazardCandidates[0];
  const domains = intelligence.hazardCandidates.map((candidate) => candidate.domain);
  const passed = intelligence.conditionAssessment.status === 'uncontrolled'
    && primary?.domain === test.primary
    && primary?.role === 'primary'
    && intelligence.conditionAssessment.controlledDomains.includes(test.suppressed)
    && !domains.includes(test.suppressed)
    && intelligence.candidateStandards.length > 0
    && commonPass(result);
  if (passed) console.log(`PASS [mixed] ${test.name}`);
  else { failures += 1; console.error(`FAIL [mixed] ${test.name}`, { assessment: intelligence.conditionAssessment, candidates: intelligence.hazardCandidates, citations: intelligence.candidateStandards }); }
}

if (failures > 0) process.exit(1);
const total = controlledCases.length + vagueCases.length + jurisdictionCases.length + trapCases.length + mixedCases.length;
console.log(`Inspection intelligence adversarial regression: ${total} passed, 0 failed`);
