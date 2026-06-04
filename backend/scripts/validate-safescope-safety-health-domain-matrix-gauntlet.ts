import { SafeScopeSafetyHealthDomainMatrixService } from '../src/safescope-v2/safety-health-domain-matrix/safety-health-domain-matrix.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeSafetyHealthDomainMatrixService();

const scenarios = [
  {
    name: 'Machine guarding maintenance with stored energy',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Conveyor tail pulley has missing guard while maintenance employee clears material near rotating nip point. Energy state and lockout are not documented.',
      risk: { riskBand: 'High', requiresShutdown: true },
    },
    expectedPrimary: 'Machine Guarding',
    expectedRelated: ['Lockout / Tagout'],
    expectedMechanism: 'caught_in_or_between',
  },
  {
    name: 'Confined space hot work atmospheric hazard',
    input: {
      classification: 'Confined Space',
      observationText: 'Employees performing welding hot work inside tank. Atmospheric testing, ventilation, attendant, permit, and rescue plan are not documented.',
      risk: { riskBand: 'Critical', fatalityPotential: true },
    },
    expectedPrimary: 'Confined Space',
    expectedRelated: ['Fire / Hot Work', 'Emergency Rescue'],
    expectedMechanism: 'asphyxiation',
  },
  {
    name: 'Respirable silica dry cutting',
    input: {
      classification: 'Respirable Dust / Silica',
      observationText: 'Employee dry cutting concrete with visible dust plume. No wet method, local exhaust, HEPA cleanup, sampling, or respirator fit test record documented.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Respirable Dust / Silica',
    expectedRelated: ['Respiratory Protection'],
    expectedMechanism: 'inhalation_exposure',
  },
  {
    name: 'Mobile equipment pedestrian exposure',
    input: {
      classification: 'Mobile Equipment / Powered Haulage',
      observationText: 'Pedestrians walking through loader traffic area with blind spot exposure, no marked walkway, no physical separation, and poor lighting.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Mobile Equipment / Powered Haulage',
    expectedRelated: ['Visibility / Lighting'],
    expectedMechanism: 'struck_by',
  },
  {
    name: 'Hazcom unlabeled flammable solvent',
    input: {
      classification: 'Hazard Communication',
      observationText: 'Unlabeled container of solvent in work area. SDS unavailable and flammable vapors possible near hot work.',
      risk: { riskBand: 'Moderate' },
    },
    expectedPrimary: 'Hazard Communication',
    expectedRelated: ['Fire / Hot Work'],
    expectedMechanism: 'fire_or_explosion',
  },
  {
    name: 'Electrical energized panel exposure',
    input: {
      classification: 'Electrical',
      observationText: 'Electrical panel cover missing with exposed energized conductors. Unqualified employees can access the area.',
      risk: { riskBand: 'Critical', fatalityPotential: true },
    },
    expectedPrimary: 'Electrical',
    expectedRelated: ['Lockout / Tagout'],
    expectedMechanism: 'electrocution_or_shock',
  },
  {
    name: 'Fall protection ladder scaffold concern',
    input: {
      classification: 'Fall Protection',
      observationText: 'Employee working from incomplete scaffold platform near open edge. Guardrail missing and rescue plan not documented.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Fall Protection',
    expectedRelated: ['Ladders and Scaffolds'],
    expectedMechanism: 'fall_to_lower_level',
  },
  {
    name: 'Noise exposure qualitative case',
    input: {
      classification: 'Noise',
      observationText: 'Employees operate loud crusher equipment for extended periods. No sound level survey or hearing protection fit/training record documented.',
      risk: { riskBand: 'Moderate' },
    },
    expectedPrimary: 'Noise',
    expectedRelated: ['PPE'],
    expectedMechanism: 'noise_induced_hearing_loss',
  },
  {
    name: 'Heat stress outdoor work',
    input: {
      classification: 'Heat Stress',
      observationText: 'New employee performing heavy outdoor work in hot environment. No acclimatization, shade, water/rest schedule, or symptom monitoring documented.',
      risk: { riskBand: 'High' },
    },
    expectedPrimary: 'Heat Stress',
    expectedRelated: ['Emergency Response'],
    expectedMechanism: 'heat_illness',
  },
  {
    name: 'Unclassified low context blocks closure',
    input: {
      classification: 'Unclassified',
      observationText: '',
      risk: { riskBand: 'Unknown' },
    },
    expectedPrimary: 'Unclassified',
    expectedRelated: ['Qualified Human Review'],
    expectedMechanism: 'unknown',
  },
];

const matrix = service.getDomainMatrix();
assert(matrix.length >= 18, `matrix should contain broad safety-health coverage; found ${matrix.length}`);

const results: any[] = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input);

  assert(result.engine === 'safescope_safety_health_domain_matrix', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(result.primaryDomain === scenario.expectedPrimary, `${scenario.name}: expected primary ${scenario.expectedPrimary}, got ${result.primaryDomain}`);
  assert(result.relatedDomains.some((domain) => scenario.expectedRelated.includes(domain)), `${scenario.name}: expected related domain not found`);
  assert(result.injuryMechanisms.includes(scenario.expectedMechanism), `${scenario.name}: expected mechanism ${scenario.expectedMechanism}`);
  assert(result.evidenceRequired.length >= 4, `${scenario.name}: evidence requirements too thin`);
  assert(result.mitigationStrategies.length >= 2, `${scenario.name}: mitigations too thin`);
  assert(result.strongControls.length >= 2, `${scenario.name}: strong controls too thin`);
  assert(result.weakControls.length >= 2, `${scenario.name}: weak controls too thin`);
  assert(result.verificationRequirements.length >= 2, `${scenario.name}: verification requirements too thin`);
  assert(result.closureRequirements.length >= 2, `${scenario.name}: closure requirements too thin`);
  assert(result.canInventStandards === false, `${scenario.name}: cannot invent standards`);
  assert(result.canOverrideRegulations === false, `${scenario.name}: cannot override regulations`);
  assert(result.canFinalizeWithoutHumanReview === false, `${scenario.name}: cannot finalize without human review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  if (scenario.input.risk?.riskBand === 'High' || scenario.input.risk?.riskBand === 'Critical') {
    assert(result.requiresQualifiedReview === true, `${scenario.name}: high risk must require review`);
  }

  results.push({
    scenario: scenario.name,
    primaryDomain: result.primaryDomain,
    matchedDomains: result.matchedDomains,
    relatedDomains: result.relatedDomains.slice(0, 8),
    hazardFamilies: result.hazardFamilies.slice(0, 6),
    hazardousEnergies: result.hazardousEnergies.slice(0, 8),
    injuryMechanisms: result.injuryMechanisms.slice(0, 8),
    healthMechanisms: result.healthMechanisms.slice(0, 8),
    evidenceRequired: result.evidenceRequired.length,
    strongControls: result.strongControls.length,
    weakControls: result.weakControls.length,
    mitigations: result.mitigationStrategies.length,
    verificationRequirements: result.verificationRequirements.length,
    closureRequirements: result.closureRequirements.length,
    confidence: result.confidence,
    matrixDomainCount: result.matrixDomainCount,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope safety-health domain matrix gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
