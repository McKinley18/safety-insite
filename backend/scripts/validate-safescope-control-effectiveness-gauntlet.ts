import { SafeScopeControlEffectivenessService } from '../src/safescope-v2/control-effectiveness/control-effectiveness.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeControlEffectivenessService();

const scenarios = [
  {
    name: 'Effective machine guarding control',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Exposed conveyor nip point where miners work nearby.',
      proposedControls: [
        'Immediately stop the conveyor and barricade the area.',
        'Install fixed guarding over the nip point.',
        'Verify guard installation with before and after photos.',
        'Lockout/tagout during installation and verify employees cannot contact moving parts.',
      ],
      risk: { riskBand: 'High', requiresShutdown: true },
      actionQuality: { closureBlockers: [] },
      evidenceSufficiency: { sufficientForClosure: true },
      causalChain: {
        requiresQualifiedReview: true,
        criticalBreakPoints: [
          'Prevent access to moving parts.',
          'Stop, isolate, lock/tag, block, and verify zero energy before work in the danger zone.',
        ],
      },
    },
    expectedRatings: ['effective', 'partially_effective'],
  },
  {
    name: 'PPE-only control for machine guarding',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Exposed rotating shaft with employee access.',
      proposedControls: ['Tell employees to wear gloves and be careful.'],
      risk: { riskBand: 'High', requiresShutdown: true },
      actionQuality: { closureBlockers: ['PPE-only corrective action does not control the source.'] },
      evidenceSufficiency: { sufficientForClosure: false },
      causalChain: {
        requiresQualifiedReview: true,
        criticalBreakPoints: ['Prevent access to moving parts.'],
      },
    },
    expectedRatings: ['ineffective', 'interim_only', 'partially_effective'],
  },
  {
    name: 'No documented controls',
    input: {
      classification: 'Electrical',
      observationText: 'Open energized electrical panel accessible to employees.',
      proposedControls: [],
      risk: { riskBand: 'Critical', imminentDanger: true },
      actionQuality: { closureBlockers: ['No corrective action is documented.'] },
      evidenceSufficiency: { sufficientForClosure: false },
      causalChain: {
        requiresQualifiedReview: true,
        criticalBreakPoints: ['De-energize where feasible.', 'Restrict access to qualified persons.'],
      },
    },
    expectedRatings: ['insufficient_information'],
  },
  {
    name: 'Silica exposure control with sampling needed',
    input: {
      classification: 'Respirable Dust / Silica',
      observationText: 'Dry cutting concrete creates visible dust near workers.',
      proposedControls: ['Use wet method and local exhaust ventilation. Require respirator until sampling confirms exposure control.'],
      risk: { riskBand: 'High' },
      actionQuality: { closureBlockers: [] },
      evidenceSufficiency: { sufficientForClosure: false },
      causalChain: {
        requiresQualifiedReview: true,
        criticalBreakPoints: ['Identify the agent and route.', 'Measure or verify exposure when needed.'],
      },
    },
    expectedRatings: ['partially_effective', 'interim_only', 'effective'],
  },
];

const results = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input);

  assert(result.engine === 'safescope_control_effectiveness', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(scenario.expectedRatings.includes(result.effectivenessRating), `${scenario.name}: unexpected rating ${result.effectivenessRating}`);
  assert(Array.isArray(result.controlsIdentified), `${scenario.name}: controlsIdentified must be array`);
  assert(Array.isArray(result.controlsMissing), `${scenario.name}: controlsMissing must be array`);
  assert(Array.isArray(result.pathwayInterruptions), `${scenario.name}: pathwayInterruptions must be array`);
  assert(Array.isArray(result.remainingExposurePathways), `${scenario.name}: remainingExposurePathways must be array`);
  assert(Array.isArray(result.verificationNeeded), `${scenario.name}: verificationNeeded must be array`);
  assert(Array.isArray(result.closureReadinessBlockers), `${scenario.name}: closureReadinessBlockers must be array`);
  assert(result.canAssumeControlEffectiveness === false, `${scenario.name}: cannot assume effectiveness`);
  assert(result.canCloseWithoutVerification === false, `${scenario.name}: cannot close without verification`);
  assert(result.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  if (scenario.input.risk?.riskBand === 'High' || scenario.input.risk?.riskBand === 'Critical') {
    assert(result.requiresQualifiedReview === true, `${scenario.name}: high-risk control review required`);
  }

  results.push({
    scenario: scenario.name,
    rating: result.effectivenessRating,
    controlsIdentified: result.controlsIdentified.length,
    controlsMissing: result.controlsMissing.length,
    pathwayInterruptions: result.pathwayInterruptions.length,
    remainingExposurePathways: result.remainingExposurePathways.length,
    verificationNeeded: result.verificationNeeded.length,
    closureBlockers: result.closureReadinessBlockers.length,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope control effectiveness gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
