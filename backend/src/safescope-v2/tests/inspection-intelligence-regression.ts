import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedDomain: SafeScopeReasoningDomain;
  expectedTerms: RegExp[];
  expectedCitation: RegExp;
};

const scenarios: Scenario[] = [
  { name: 'oxygen cylinder near walkway', observation: 'Oxygen cylinder stored unsecured near a pedestrian walkway.', siteType: 'warehouse', expectedDomain: 'compressed_gas', expectedTerms: [/projectile|stored pressure/i, /struck/i], expectedCitation: /1910\.101/ },
  { name: 'open used-oil container', observation: 'Open used-oil container in the work area beside a floor drain.', siteType: 'warehouse', expectedDomain: 'hazardous_materials', expectedTerms: [/spill|release/i, /slip/i, /drain|environment/i], expectedCitation: /1910\.22/ },
  { name: 'conveyor tail pulley cleanup', observation: 'At an aggregate mine, the conveyor tail pulley guard is missing during cleanup.', expectedDomain: 'machine_guarding_loto', expectedTerms: [/nip|moving parts/i, /zero energy|lock/i], expectedCitation: /56\.14107|56\.12016/ },
  { name: 'open breaker slot', observation: 'Open breaker slot and missing panel cover expose energized parts in a warehouse.', expectedDomain: 'electrical', expectedTerms: [/shock/i, /qualified/i], expectedCitation: /1910\.303/ },
  { name: 'damaged cord in wet area', observation: 'Damaged extension cord with exposed insulation is energized in a wet area.', siteType: 'construction', expectedDomain: 'electrical', expectedTerms: [/shock/i, /gfci/i], expectedCitation: /1926\.404/ },
  { name: 'forklift pedestrians', observation: 'Forklift operating near pedestrians without separation or traffic controls.', siteType: 'warehouse', expectedDomain: 'mobile_equipment', expectedTerms: [/struck|crush/i, /separat/i], expectedCitation: /1910\.178/ },
  { name: 'elevated platform', observation: 'Employee on elevated work platform without guardrail or fall arrest.', siteType: 'warehouse', expectedDomain: 'fall_protection', expectedTerms: [/fall/i, /guardrail|arrest/i], expectedCitation: /1910\.28/ },
  { name: 'chemical near drain', observation: 'Unlabeled open chemical container beside a drain.', siteType: 'warehouse', expectedDomain: 'hazard_communication', expectedTerms: [/unknown substance|chemical/i, /drain/i], expectedCitation: /1910\.1200/ },
  { name: 'blocked exit', observation: 'Emergency exit route blocked by stored materials.', siteType: 'warehouse', expectedDomain: 'emergency_preparedness', expectedTerms: [/evacuat|exit/i, /remove the obstruction/i], expectedCitation: /1910\.37/ },
  { name: 'poor housekeeping', observation: 'Poor housekeeping and debris in the main aisle create a trip hazard.', siteType: 'warehouse', expectedDomain: 'walking_working_surfaces', expectedTerms: [/trip/i, /clear|remove/i], expectedCitation: /1910\.22/ },
  { name: 'rotating coupling', observation: 'Unguarded exposed rotating shaft coupling is within reach of employees.', siteType: 'warehouse', expectedDomain: 'machine_guarding', expectedTerms: [/entangle/i, /guard/i], expectedCitation: /1910\.219/ },
  { name: 'confined-space ambiguity', observation: 'Workers may enter a tank; confined space and permit-space status are unclear.', siteType: 'warehouse', expectedDomain: 'confined_space', expectedTerms: [/classification facts|classif/i, /atmospher/i], expectedCitation: /1910\.146/ },
  { name: 'hot work combustibles', observation: 'Hot work welding is underway near combustible cardboard and wood.', siteType: 'construction', expectedDomain: 'welding_cutting_hot_work', expectedTerms: [/ignit/i, /fire watch/i], expectedCitation: /1926\.352/ },
  { name: 'LOTO ambiguity', observation: 'Maintenance is clearing a jam; lockout and stored-energy controls were not verified.', siteType: 'warehouse', expectedDomain: 'lockout_tagout', expectedTerms: [/unexpected energization|stored energy/i, /zero-energy|zero energy/i], expectedCitation: /1910\.147/ },
  { name: 'damaged ladder', observation: 'Employee is using a damaged extension ladder on unstable footing.', siteType: 'construction', expectedDomain: 'ladders', expectedTerms: [/fall/i, /remove.*service|stop use/i], expectedCitation: /1926\.1053/ },
];

function allText(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string {
  return JSON.stringify(result.inspectionIntelligence);
}

const service = new SafeScopeReasoningOrchestratorService();
let failures = 0;

for (const scenario of scenarios) {
  const result = service.reason({ hazardObservation: scenario.observation, siteType: scenario.siteType });
  const intelligence = result.inspectionIntelligence;
  const text = allText(result);
  const domains = intelligence.hazardCandidates.map((candidate) => candidate.domain);
  const citations = intelligence.candidateStandards.map((standard) => standard.citation).join(' ');
  const tierCounts = Object.values(intelligence.correctiveActions).map((tier) => tier.length);
  const passed = domains.includes(scenario.expectedDomain)
    && scenario.expectedTerms.every((term) => term.test(text))
    && scenario.expectedCitation.test(citations)
    && intelligence.mechanismChain.initiatingCondition.length > 0
    && intelligence.mechanismChain.releaseOrFailureMode.length > 0
    && intelligence.mechanismChain.exposurePathway.length > 0
    && intelligence.mechanismChain.consequences.length > 0
    && intelligence.evidenceGapQuestions.length >= 3
    && tierCounts.every((count) => count > 0)
    && intelligence.candidateStandards.every((standard) => standard.status === 'candidate_standard')
    && intelligence.guardrails.advisoryOnly
    && intelligence.guardrails.candidateStandardsOnly
    && intelligence.guardrails.doesNotDeclareViolation
    && result.conclusionBoundary.doesNotDeclareViolation;

  if (passed) console.log(`PASS ${scenario.name}`);
  else {
    failures += 1;
    console.error(`FAIL ${scenario.name}`, { domains, citations, questions: intelligence.evidenceGapQuestions, tierCounts });
  }
}

if (failures > 0) process.exit(1);
console.log(`Inspection intelligence regression: ${scenarios.length} passed, 0 failed`);
