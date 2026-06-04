import { SafeScopeHazardDomainIntelligenceService } from '../src/safescope-v2/hazard-domain-intelligence/hazard-domain-intelligence.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeHazardDomainIntelligenceService();

const scenarios = [
  {
    name: 'Machine guarding with maintenance exposure',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Unguarded conveyor tail pulley nip point exposed while employees clean around the moving belt during production.',
      risk: { riskBand: 'High', requiresShutdown: true },
    },
    expectedPrimary: 'Machine Guarding',
    expectedRelated: ['Lockout / Tagout'],
    expectedMechanisms: ['caught_in_or_between', 'amputation'],
  },
  {
    name: 'Confined space hot work with atmospheric hazard',
    input: {
      classification: 'Confined Space',
      observationText: 'Welder entered tank for hot work with uncertain oxygen readings, limited ventilation, and no documented rescue plan.',
      risk: { riskBand: 'Critical', fatalityPotential: true },
    },
    expectedPrimary: 'Confined Space',
    expectedRelated: ['Fire / Hot Work', 'Welding Health Hazard'],
    expectedMechanisms: ['asphyxiation', 'inhalation_exposure'],
  },
  {
    name: 'Silica dry cutting exposure',
    input: {
      classification: 'Respirable Dust / Silica',
      observationText: 'Employees dry cutting concrete with visible respirable dust cloud, no wet method, and no sampling record.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Respirable Dust / Silica',
    expectedRelated: ['Hazard Communication', 'PPE', 'Ventilation', 'Exposure Monitoring'],
    expectedMechanisms: ['inhalation_exposure'],
  },
  {
    name: 'Mobile equipment pedestrian traffic exposure',
    input: {
      classification: 'Mobile Equipment / Traffic',
      observationText: 'Loader and haul truck operate in same travelway as pedestrians with poor visibility, no separation, and unclear traffic control.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Mobile Equipment / Traffic',
    expectedRelated: ['Powered Haulage'],
    expectedMechanisms: ['struck_by', 'crush'],
  },
  {
    name: 'Hazcom unlabeled chemical container',
    input: {
      classification: 'Hazard Communication',
      observationText: 'Unlabeled solvent container found open near ignition source with no SDS available and employees handling material without verified PPE.',
      risk: { riskBand: 'Moderate' },
    },
    expectedPrimary: 'Hazard Communication',
    expectedRelated: ['PPE', 'Fire / Hot Work'],
    expectedMechanisms: ['chemical_burn', 'inhalation_exposure'],
  },
  {
    name: 'Fall protection scaffold exposure',
    input: {
      classification: 'Fall Protection',
      observationText: 'Employee working from scaffold platform near open edge with missing guardrail and incomplete access ladder setup.',
      risk: { riskBand: 'High', fatalityPotential: true },
    },
    expectedPrimary: 'Fall Protection',
    expectedRelated: ['Ladders and Scaffolds'],
    expectedMechanisms: ['fall_to_lower_level'],
  },
  {
    name: 'Pressure system hydraulic hose failure',
    input: {
      classification: 'Pressure Systems',
      observationText: 'Damaged hydraulic hose leaking under pressure near mechanic during troubleshooting with no depressurization verification.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Pressure Systems',
    expectedRelated: ['Lockout / Tagout'],
    expectedMechanisms: ['struck_by', 'laceration'],
  },
  {
    name: 'Low context unclassified condition',
    input: {
      classification: 'Unclassified',
      observationText: 'Something looks unsafe.',
      risk: { riskBand: 'Unknown' },
    },
    expectedPrimary: 'Unclassified',
    expectedRelated: ['Qualified Human Review'],
    expectedMechanisms: ['unknown'],
  },
];

const results = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input);

  assert(result.engine === 'safescope_hazard_domain_intelligence', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(result.primaryDomain === scenario.expectedPrimary, `${scenario.name}: expected primary ${scenario.expectedPrimary}, got ${result.primaryDomain}`);

  for (const related of scenario.expectedRelated) {
    assert(
      result.relatedDomains.includes(related) || result.additionalHazardsToConsider.includes(related),
      `${scenario.name}: missing related domain ${related}`,
    );
  }

  for (const mechanism of scenario.expectedMechanisms) {
    assert(result.injuryMechanisms.includes(mechanism), `${scenario.name}: missing mechanism ${mechanism}`);
  }

  assert(result.hazardFamilies.length > 0, `${scenario.name}: hazard families required`);
  assert(result.hazardousEnergies.length > 0, `${scenario.name}: hazardous energies required`);
  assert(result.evidenceNeeded.length > 0, `${scenario.name}: evidence needs required`);
  assert(result.mitigationStrategies.length > 0, `${scenario.name}: mitigation strategies required`);
  assert(result.weakOrInsufficientControls.length > 0, `${scenario.name}: weak controls required`);
  assert(result.verificationEvidence.length > 0, `${scenario.name}: verification evidence required`);
  assert(result.closureRequirements.length > 0, `${scenario.name}: closure requirements required`);
  assert(result.humanReviewTriggers.length > 0, `${scenario.name}: human review triggers required`);

  assert(result.canInventStandards === false, `${scenario.name}: cannot invent standards`);
  assert(result.canOverrideRegulations === false, `${scenario.name}: cannot override regulations`);
  assert(result.canFinalizeWithoutHumanReview === false, `${scenario.name}: cannot finalize without review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  results.push({
    scenario: scenario.name,
    primaryDomain: result.primaryDomain,
    relatedDomains: result.relatedDomains.slice(0, 6),
    hazardFamilies: result.hazardFamilies.slice(0, 4),
    hazardousEnergies: result.hazardousEnergies.slice(0, 6),
    injuryMechanisms: result.injuryMechanisms.slice(0, 6),
    evidenceNeeded: result.evidenceNeeded.length,
    mitigations: result.mitigationStrategies.length,
    weakControls: result.weakOrInsufficientControls.length,
    confidence: result.confidence,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope hazard domain intelligence gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
