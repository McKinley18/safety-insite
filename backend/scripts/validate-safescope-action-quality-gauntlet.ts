import { SafeScopeActionQualityService } from '../src/safescope-v2/action-quality/action-quality.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeActionQualityService();

const scenarios = [
  {
    name: 'Strong machine guarding action',
    input: {
      classification: 'Machine Guarding',
      observationText: 'Unguarded conveyor nip point exposes employees during operation.',
      correctiveActions: [
        {
          title: 'Stop work, isolate exposure, install fixed guard, and verify protection',
          description:
            'Immediately stop the conveyor, barricade the exposed nip point, keep employees out of the hazard area, obtain supervisor authorization, isolate equipment during installation, install fixed guarding over the nip point, and verify employees cannot contact moving parts before returning equipment to service.',
          assignedRole: 'Maintenance Supervisor',
          dueDate: '2026-06-05',
          referenceStandards: ['30 CFR 56.14107(a)'],
          verificationEvidence: ['before photo', 'after photo', 'supervisor verification'],
        },
      ],
      risk: { riskBand: 'High', requiresShutdown: true, fatalityPotential: true },
      evidenceSufficiency: { sufficientForClosure: true },
    },
    expectedRatings: ['strong', 'adequate_with_review'],
    expectedControl: ['engineering', 'isolation'],
  },
  {
    name: 'Weak PPE-only action',
    input: {
      classification: 'Hazard Communication',
      observationText: 'Unlabeled solvent container in use.',
      correctiveActions: [
        {
          title: 'Wear gloves',
          description: 'Tell employees to wear gloves and be careful.',
        },
      ],
      risk: { riskBand: 'Moderate' },
      evidenceSufficiency: { sufficientForClosure: false },
    },
    expectedRatings: ['weak', 'insufficient', 'interim_only'],
    expectedControl: ['ppe', 'administrative', 'unknown'],
  },
  {
    name: 'No corrective action',
    input: {
      classification: 'Electrical',
      observationText: 'Open energized panel accessible to employees.',
      correctiveActions: [],
      risk: { riskBand: 'Critical', imminentDanger: true },
      evidenceSufficiency: { sufficientForClosure: false },
    },
    expectedRatings: ['insufficient'],
    expectedControl: ['unknown'],
  },
  {
    name: 'Interim administrative action only',
    input: {
      classification: 'Fall Protection',
      observationText: 'Open roof edge without guardrail.',
      correctiveActions: [
        {
          title: 'Post warning sign',
          description: 'Post warning sign and remind workers to stay away from edge.',
          assignedRole: 'Foreman',
          dueDate: '2026-06-01',
        },
      ],
      risk: { riskBand: 'High', fatalityPotential: true },
      evidenceSufficiency: { sufficientForClosure: false },
    },
    expectedRatings: ['interim_only', 'weak', 'insufficient'],
    expectedControl: ['administrative'],
  },
];

const results = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input as any);

  assert(result.engine === 'safescope_action_quality', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(scenario.expectedRatings.includes(result.overallRating), `${scenario.name}: unexpected rating ${result.overallRating}`);
  assert(scenario.expectedControl.includes(result.strongestControlLevel), `${scenario.name}: unexpected control ${result.strongestControlLevel}`);
  assert(Array.isArray(result.actionStrengths), `${scenario.name}: strengths must be array`);
  assert(Array.isArray(result.actionWeaknesses), `${scenario.name}: weaknesses must be array`);
  assert(Array.isArray(result.missingActionElements), `${scenario.name}: missing elements must be array`);
  assert(Array.isArray(result.recommendedActionImprovements), `${scenario.name}: recommendations must be array`);
  assert(Array.isArray(result.verificationRequirements), `${scenario.name}: verification requirements must be array`);
  assert(Array.isArray(result.closureBlockers), `${scenario.name}: closure blockers must be array`);
  assert(result.canInventCorrectiveAction === false, `${scenario.name}: cannot invent corrective action`);
  assert(result.canCloseWithoutVerification === false, `${scenario.name}: cannot close without verification`);
  assert(result.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  results.push({
    scenario: scenario.name,
    overallRating: result.overallRating,
    strongestControlLevel: result.strongestControlLevel,
    strengths: result.actionStrengths.length,
    weaknesses: result.actionWeaknesses.length,
    missingActionElements: result.missingActionElements.length,
    recommendedImprovements: result.recommendedActionImprovements.length,
    verificationRequirements: result.verificationRequirements.length,
    closureBlockers: result.closureBlockers.length,
    requiresSupervisorReview: result.requiresSupervisorReview,
  });
}

console.log('✅ SafeScope action quality gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
