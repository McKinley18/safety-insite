import { InspectionCitationRecoveryService } from '../inspection-intelligence/inspection-citation-recovery.service';
import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';

const reasoning = new SafeScopeReasoningOrchestratorService();
const recovery = new InspectionCitationRecoveryService();
const prohibited = /violation confirmed|citation issued|\bnoncompliant\b|definite violation|must cite/i;
let failures = 0;

const electricalDistractors = [
  { citation: '29 CFR 1910.306', title: 'Specific purpose equipment', score: 420, candidateStatus: 'active', matchingReasons: ['route: source key match'] },
  { citation: '29 CFR 1910.331', title: 'Scope of electrical safety-related work practices', score: 390, candidateStatus: 'active' },
  { citation: '29 CFR 1910.301', title: 'Introduction and scope', score: 380, candidateStatus: 'active' },
  { citation: '29 CFR 1910.132', title: 'General PPE requirements', score: 350, candidateStatus: 'active' },
  { citation: '29 CFR 1910.252', title: 'Welding and cutting', score: 340, candidateStatus: 'active' },
  { citation: '29 CFR 1910.101', title: 'Compressed gases', score: 330, candidateStatus: 'active' },
];

function scopesFor(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>, siteType?: string): string[] {
  if (result.jurisdictionAssessment.likelyJurisdiction === 'msha') {
    const mineType = result.inspectionIntelligence.miningContext.mineType;
    if (mineType === 'underground_metal_nonmetal') return ['msha_mnm_underground'];
    if (mineType === 'surface_coal') return ['msha_coal_surface'];
    if (mineType === 'underground_coal') return ['msha_coal_underground'];
    return ['msha_mnm_surface'];
  }
  if (result.jurisdictionAssessment.likelyJurisdiction === 'osha_construction') return ['osha_construction'];
  if (result.jurisdictionAssessment.likelyJurisdiction === 'osha_general_industry') return ['osha_general'];
  return siteType?.includes('construction') ? ['osha_construction'] : ['all'];
}

function ranked(observation: string, siteType?: string, legacy = electricalDistractors) {
  const result = reasoning.reason({ hazardObservation: observation, siteType });
  const output = recovery.recover({
    observation,
    suggestedStandards: legacy,
    excludedStandards: [],
    inspectionIntelligence: result.inspectionIntelligence,
    scopes: scopesFor(result, siteType),
  });
  return { result, output };
}

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedTop?: RegExp;
  forbiddenTop?: RegExp;
  controlled?: boolean;
  noMsha?: boolean;
};

const scenarios: Scenario[] = [
  { name: 'open breaker slot warehouse', observation: 'Open breaker slot and missing panel cover expose energized parts in a warehouse.', siteType: 'warehouse', expectedTop: /1910\.303\(g\)\(2\)\(i\)/, forbiddenTop: /1910\.(?:301|306|331)/ },
  { name: 'missing cover plate conductors', observation: 'Missing cover plate exposes energized conductors in a factory electrical panel.', siteType: 'factory', expectedTop: /1910\.303\(g\)\(2\)\(i\)/ },
  { name: 'blocked electrical panel', observation: 'Pallets and stored boxes block access and working clearance at the electrical panel.', siteType: 'warehouse', expectedTop: /1910\.303\(g\)\(1\)/ },
  { name: 'damaged wet cord', observation: 'Damaged flexible extension cord with exposed insulation remains energized in a wet plant area.', siteType: 'plant', expectedTop: /1910\.(?:334|305)/ },
  { name: 'daisy chained power strips', observation: 'Power strips are daisy-chained as permanent wiring in the warehouse.', siteType: 'warehouse', expectedTop: /1910\.305\(g\)/ },
  { name: 'intact electrical control', observation: 'Electrical panel cover is intact and secured with no exposed energized parts.', siteType: 'warehouse', controlled: true },

  { name: 'rotating shaft', observation: 'Exposed rotating shaft remains within reach because its guard is missing.', siteType: 'factory', expectedTop: /1910\.(?:219|212)/ },
  { name: 'conveyor tail pulley', observation: 'Conveyor tail pulley nip point is exposed during cleanup because the guard is missing.', siteType: 'factory', expectedTop: /1910\.(?:212|147)/ },
  { name: 'guard installed', observation: 'Rotating shaft guard is installed, intact, and prevents access.', siteType: 'factory', controlled: true },
  { name: 'point of operation', observation: 'Press point of operation is exposed without a guard while employees feed parts.', siteType: 'factory', expectedTop: /1910\.212/ },

  { name: 'wet walkway', observation: 'Oil has made the warehouse walkway wet and slippery without barricading.', siteType: 'warehouse', expectedTop: /1910\.22/ },
  { name: 'open floor hole', observation: 'Uncovered floor hole in a warehouse walking surface has no guard or cover.', siteType: 'warehouse', expectedTop: /1910\.(?:28|29)/ },
  { name: 'platform guardrail', observation: 'Employee works on an elevated platform without guardrail or fall arrest.', siteType: 'plant', expectedTop: /1910\.28/ },
  { name: 'damaged ladder', observation: 'Employee continues using a damaged ladder with a broken rung.', siteType: 'warehouse', expectedTop: /1910\.23/ },

  { name: 'unlabeled chemical', observation: 'Unlabeled chemical container is in use at the warehouse workbench.', siteType: 'warehouse', expectedTop: /1910\.1200/ },
  { name: 'open used oil drain', observation: 'Open used-oil container is leaking beside a floor drain in the plant.', siteType: 'plant', expectedTop: /1910\.22/, forbiddenTop: /1910\.(?:101|104|25[23])/ },
  { name: 'controlled chemical', observation: 'Chemical container is identified, labeled, closed, and secured.', siteType: 'warehouse', controlled: true },

  { name: 'surface mine conveyor', observation: 'Aggregate mine conveyor tail pulley guard is missing during cleanup.', siteType: 'surface aggregate mine', expectedTop: /30 CFR 56\.(?:14107|12016)/ },
  { name: 'underground loose rib', observation: 'Loose rib and unsupported back are above miners in an underground metal mine heading.', siteType: 'underground metal mine', expectedTop: /30 CFR 57\.3200/ },
  { name: 'crusher noise Part 62', observation: 'Crusher noise exposes miners at a surface aggregate mine without monitoring evidence.', siteType: 'surface aggregate mine', expectedTop: /30 CFR 62\./ },
  { name: 'surface coal traffic limitation', observation: 'Surface coal mine haul truck backs near a miner without verified traffic controls.', siteType: 'surface coal mine', forbiddenTop: /30 CFR (?:56|57|75)\./ },
  { name: 'quarry tile warehouse boundary', observation: 'Quarry tile pallets are stored in a warehouse aisle creating a trip hazard.', siteType: 'warehouse', expectedTop: /1910\.22/, noMsha: true },

  { name: 'PPE demoted for physical panel', observation: 'Open electrical panel exposes energized parts in a warehouse.', siteType: 'warehouse', expectedTop: /1910\.303/, forbiddenTop: /1910\.13/ },
  { name: 'PPE leads when observed', observation: 'Employee grinding metal without safety glasses or face shield.', siteType: 'factory', expectedTop: /1910\.13/ },
  { name: 'training demoted for shaft', observation: 'Unguarded rotating shaft is exposed within employee reach.', siteType: 'factory', expectedTop: /1910\.(?:212|219)/, forbiddenTop: /1910\.33[12]/ },
  { name: 'training leads when observed', observation: 'Contractor at a surface aggregate mine has missing task training and site hazard awareness.', siteType: 'surface aggregate mine', expectedTop: /30 CFR (?:46|48)\./ },
  { name: 'scope supporting only', observation: 'Open breaker slot exposes live parts in a warehouse panel.', siteType: 'warehouse', expectedTop: /1910\.303/, forbiddenTop: /1910\.301/ },
  { name: 'welding excluded without context', observation: 'Missing panel cover exposes energized bus bars in a factory.', siteType: 'factory', expectedTop: /1910\.303/, forbiddenTop: /1910\.25[23]/ },
  { name: 'compressed gas excluded without context', observation: 'Open breaker slot exposes energized terminals in a warehouse.', siteType: 'warehouse', expectedTop: /1910\.303/, forbiddenTop: /1910\.(?:101|104)/ },
  { name: 'broad electrical cannot lead', observation: 'Electrical enclosure cover is missing and energized parts are accessible.', siteType: 'factory', expectedTop: /1910\.303/, forbiddenTop: /1910\.(?:301|331)/ },
];

for (const scenario of scenarios) {
  const { result, output } = ranked(scenario.observation, scenario.siteType);
  const top = String(output.suggestedStandards[0]?.citation || '');
  const allText = JSON.stringify({ result, output });
  let passed = result.inspectionIntelligence.guardrails.advisoryOnly
    && result.inspectionIntelligence.guardrails.candidateStandardsOnly
    && !prohibited.test(allText);
  if (scenario.controlled) passed = passed && output.suggestedStandards.length === 0;
  else if (scenario.expectedTop) passed = passed && scenario.expectedTop.test(top);
  if (scenario.forbiddenTop) passed = passed && !scenario.forbiddenTop.test(top);
  if (scenario.noMsha) passed = passed && !output.suggestedStandards.some((standard) => /30 CFR/.test(standard.citation));
  if (output.suggestedStandards.length) {
    passed = passed
      && output.suggestedStandards.every((standard) => standard.status === 'candidate_standard' || standard.candidateStatus === 'candidate_standard' || standard.candidateStatus === 'active')
      && output.suggestedStandards.every((standard) => standard.citationRanking?.advisoryOnly === true)
      && output.suggestedStandards[0].matchingReasons?.length > 0;
  }
  if (passed) console.log(`PASS ${scenario.name}`);
  else { failures += 1; console.error(`FAIL ${scenario.name}`, { top, suggested: output.suggestedStandards.map((standard) => ({ citation: standard.citation, score: standard.directnessScore, reasons: standard.matchingReasons })), excluded: output.excludedStandards.map((standard) => standard.citation), assessment: result.inspectionIntelligence.conditionAssessment }); }
}

{
  const observation = 'Open breaker slot and missing panel cover expose energized parts in a warehouse.';
  const { result, output } = ranked(observation, 'warehouse');
  const excluded = output.excludedStandards.map((standard) => standard.citation).join(' ');
  const passed = output.suggestedStandards.length > 0
    && /1910\.303/.test(output.suggestedStandards[0].citation)
    && /1910\.306/.test(excluded)
    && /1910\.132/.test(excluded)
    && /1910\.252/.test(excluded)
    && /1910\.101/.test(excluded)
    && output.suggestedStandards[0].citationRanking.directCandidate
    && result.inspectionIntelligence.guardrails.advisoryOnly;
  if (passed) console.log('PASS remote-smoke-like exclusion and ranking contract');
  else { failures += 1; console.error('FAIL remote-smoke-like exclusion and ranking contract', output); }
}

{
  const { output } = ranked('Open breaker slot exposes energized parts in a warehouse.', 'warehouse');
  const passed = output.suggestedStandards.length > 0 && output.excludedStandards.length > 0;
  if (passed) console.log('PASS suggested and excluded standards coexist');
  else { failures += 1; console.error('FAIL suggested and excluded standards coexist', output); }
}

if (failures > 0) process.exit(1);
console.log(`Inspection intelligence citation ranking regression: ${scenarios.length + 2} passed, 0 failed`);
