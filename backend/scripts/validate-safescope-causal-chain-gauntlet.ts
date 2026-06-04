import { SafeScopeCausalChainService } from '../src/safescope-v2/causal-chain/causal-chain.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeCausalChainService();

const scenarios = [
  {
    name: 'Machine guarding nip point causal chain',
    input: {
      classification: 'Machine Guarding',
      observationText:
        'Unguarded conveyor nip point exposes employees during cleanup and adjustment while equipment state is unclear.',
      risk: {
        riskBand: 'High',
        requiresShutdown: true,
        fatalityPotential: true,
      },
      mechanismIntelligence: {
        primaryEnergySources: ['mechanical_motion', 'stored_energy', 'kinetic_energy'],
        injuryMechanisms: ['caught_in_or_between', 'crush', 'amputation', 'laceration'],
        credibleAccidentPathways: [
          'Worker reaches into or near moving equipment during operation, cleanup, adjustment, troubleshooting, or maintenance.',
        ],
        failureModes: ['missing_guard', 'unverified_zero_energy'],
        evidenceNeeded: [
          'Confirm equipment state.',
          'Document guard condition and access path.',
        ],
        requiresQualifiedReview: true,
      },
      exposureIntelligence: {
        requiresIndustrialHygieneReview: false,
      },
      evidenceSufficiency: {
        missingCriticalEvidence: ['Equipment operating/energy state is not documented.'],
      },
      actionQuality: {
        closureBlockers: ['High-risk corrective action needs supervisor review and interim exposure control before closure.'],
      },
      suggestedStandards: [{ citation: '30 CFR 56.14107(a)' }],
    },
    expectedMechanisms: ['caught_in_or_between', 'amputation'],
    expectedConfidence: ['medium', 'high'],
  },
  {
    name: 'Electrical energized panel causal chain',
    input: {
      classification: 'Electrical',
      observationText:
        'Open energized electrical panel with exposed conductors accessible to an unqualified employee.',
      risk: {
        riskBand: 'Critical',
        imminentDanger: true,
      },
      mechanismIntelligence: {
        primaryEnergySources: ['electrical_energy', 'thermal_energy'],
        injuryMechanisms: ['electrocution_or_shock', 'arc_flash_or_burn', 'fire_or_explosion'],
        credibleAccidentPathways: [
          'Worker contacts energized conductors or exposed components during inspection, troubleshooting, repair, or unauthorized access.',
        ],
        failureModes: ['missing_cover', 'unqualified_access'],
        evidenceNeeded: ['Confirm energized/de-energized state.', 'Document covers and access restriction.'],
        requiresQualifiedReview: true,
      },
      evidenceSufficiency: {
        missingCriticalEvidence: ['Qualified-person review is not documented.'],
      },
      actionQuality: {
        closureBlockers: ['Closure should remain blocked until verification evidence is documented.'],
      },
      suggestedStandards: [{ citation: 'OSHA electrical standard candidate' }],
    },
    expectedMechanisms: ['electrocution_or_shock', 'arc_flash_or_burn'],
    expectedConfidence: ['medium', 'high'],
  },
  {
    name: 'Respirable silica exposure causal chain',
    input: {
      classification: 'Respirable Dust / Silica',
      observationText:
        'Employee dry cutting concrete creates visible respirable silica dust without documented exposure sampling or wet method.',
      risk: {
        riskBand: 'High',
      },
      mechanismIntelligence: {
        primaryEnergySources: ['atmospheric_hazard', 'chemical_energy'],
        injuryMechanisms: ['inhalation_exposure', 'silica_or_dust_disease'],
        credibleAccidentPathways: [
          'Worker inhales respirable crystalline silica during dust-generating task performance.',
        ],
        failureModes: ['no_exposure_assessment', 'ineffective_wet_method', 'poor_ventilation'],
        evidenceNeeded: ['Identify contaminant and task.', 'Document exposure monitoring and controls.'],
        requiresQualifiedReview: true,
      },
      exposureIntelligence: {
        exposureRoute: 'inhalation',
        requiresIndustrialHygieneReview: true,
      },
      evidenceSufficiency: {
        missingCriticalEvidence: ['Sampling basis and duration are not documented.'],
      },
      actionQuality: {
        closureBlockers: ['Exposure control cannot be closed without verification evidence.'],
      },
      suggestedStandards: [{ citation: 'OSHA silica standard candidate' }],
    },
    expectedMechanisms: ['inhalation_exposure', 'silica_or_dust_disease'],
    expectedConfidence: ['medium', 'high'],
  },
  {
    name: 'Low-context unclassified causal chain',
    input: {
      classification: 'Unclassified',
      observationText: '',
      risk: {
        riskBand: 'Unknown',
      },
      mechanismIntelligence: {},
      exposureIntelligence: {},
      evidenceSufficiency: {
        missingCriticalEvidence: ['Observation text is missing.'],
      },
      actionQuality: {
        closureBlockers: ['Closure cannot be supported without a documented corrective action.'],
      },
      suggestedStandards: [],
    },
    expectedMechanisms: [],
    expectedConfidence: ['low', 'medium'],
  },
];

const results = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input);

  assert(result.engine === 'safescope_causal_chain', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(result.classification === scenario.input.classification, `${scenario.name}: classification mismatch`);

  assert(typeof result.hazardCondition === 'string', `${scenario.name}: hazard condition required`);
  assert(typeof result.exposedPersonOrTask === 'string', `${scenario.name}: exposed person/task required`);

  assert(Array.isArray(result.initiatingEvents), `${scenario.name}: initiating events must be array`);
  assert(Array.isArray(result.energyOrExposureTransfer), `${scenario.name}: transfer must be array`);
  assert(Array.isArray(result.injuryOrIllnessMechanisms), `${scenario.name}: mechanisms must be array`);
  assert(Array.isArray(result.likelyConsequences), `${scenario.name}: consequences must be array`);
  assert(Array.isArray(result.failedOrMissingControls), `${scenario.name}: failed controls must be array`);
  assert(Array.isArray(result.causalPathways), `${scenario.name}: causal pathways must be array`);
  assert(Array.isArray(result.criticalBreakPoints), `${scenario.name}: break points must be array`);
  assert(Array.isArray(result.evidenceNeededToConfirmChain), `${scenario.name}: evidence needed must be array`);
  assert(Array.isArray(result.correctiveControlTargets), `${scenario.name}: corrective targets must be array`);
  assert(Array.isArray(result.uncertaintyFlags), `${scenario.name}: uncertainty flags must be array`);

  for (const expectedMechanism of scenario.expectedMechanisms) {
    assert(
      result.injuryOrIllnessMechanisms.includes(expectedMechanism),
      `${scenario.name}: missing expected mechanism ${expectedMechanism}`,
    );
  }

  assert(
    scenario.expectedConfidence.includes(result.confidence),
    `${scenario.name}: unexpected confidence ${result.confidence}`,
  );

  if (scenario.input.risk?.riskBand === 'High' || scenario.input.risk?.riskBand === 'Critical') {
    assert(result.requiresQualifiedReview === true, `${scenario.name}: high-risk chain must require review`);
  }

  assert(result.canInventCausation === false, `${scenario.name}: cannot invent causation`);
  assert(
    result.canDetermineRootCauseWithoutEvidence === false,
    `${scenario.name}: cannot determine root cause without evidence`,
  );
  assert(result.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  results.push({
    scenario: scenario.name,
    confidence: result.confidence,
    pathways: result.causalPathways.length,
    mechanisms: result.injuryOrIllnessMechanisms,
    breakPoints: result.criticalBreakPoints.length,
    evidenceNeeded: result.evidenceNeededToConfirmChain.length,
    uncertaintyFlags: result.uncertaintyFlags.length,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope causal chain gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
