import { SafeScopeStandardsIntentIntelligenceService } from '../src/safescope-v2/standards-intent-intelligence/standards-intent-intelligence.service';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeStandardsIntentIntelligenceService();

const scenarios = [
  {
    name: 'Machine guarding standard intent',
    input: {
      classification: 'Machine Guarding',
      observationText:
        'Conveyor tail pulley has an exposed moving nip point. Miners walk and clean near the pulley while the conveyor is available for operation.',
      suggestedStandards: [
        {
          citation: '30 CFR 56.14107(a)',
          title: 'Moving machine parts shall be guarded to protect persons from contacting moving parts.',
          summary: 'Guard moving machine parts that can contact employees.',
        },
      ],
      risk: { riskBand: 'High', requiresShutdown: true },
      safetyHealthDomainMatrix: {
        primaryDomain: 'Machine Guarding',
        hazardousEnergies: ['mechanical_motion', 'kinetic_energy', 'stored_energy'],
        injuryMechanisms: ['caught_in_or_between', 'crush', 'amputation', 'laceration'],
        evidenceRequired: [
          'guard condition',
          'moving part exposed',
          'employee access path',
          'equipment operating state',
        ],
        mitigationStrategies: ['fixed guarding', 'interlocked guarding', 'lockout/tagout'],
        strongControls: ['fixed guarding', 'interlocked guarding'],
        weakControls: ['PPE only', 'warning sign only'],
        relatedDomains: ['Lockout / Tagout', 'Electrical', 'Housekeeping'],
      },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: true,
        missingCriticalEvidence: [],
      },
      actionQuality: {
        overallRating: 'strong',
      },
    },
    expectedPrimaryCitation: '30 CFR 56.14107(a)',
    expectedThemes: ['Prevent employee contact with hazardous moving machine parts.'],
    expectedHazards: ['Lockout / Tagout'],
  },
  {
    name: 'Lockout stored energy standard intent',
    input: {
      classification: 'Lockout / Tagout',
      observationText:
        'Maintenance employee is clearing a jam near a conveyor drive. Energy isolation and try/test verification are not documented.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.147',
          title: 'The control of hazardous energy',
          summary: 'Lockout/tagout requirements for servicing and maintenance.',
        },
      ],
      risk: { riskBand: 'High', fatalityPotential: true },
      safetyHealthDomainMatrix: {
        primaryDomain: 'Lockout / Tagout',
        hazardousEnergies: ['stored_energy', 'electrical_energy', 'mechanical_motion', 'pressure'],
        injuryMechanisms: ['caught_in_or_between', 'crush', 'electrocution_or_shock'],
        evidenceRequired: ['energy source list', 'isolation points', 'locks/tags', 'try/test verification'],
        mitigationStrategies: ['de-energize', 'isolate', 'lock/tag', 'verify zero energy'],
        strongControls: ['lock/tag at isolation point', 'try/test documented'],
        weakControls: ['stop button only', 'verbal warning only'],
        relatedDomains: ['Machine Guarding', 'Electrical', 'Pressure Systems'],
      },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Energy-control status is not documented.', 'Try/test verification missing.'],
      },
    },
    expectedPrimaryCitation: '29 CFR 1910.147',
    expectedThemes: ['Prevent unexpected energization, startup, release of stored energy, or movement during service or maintenance.'],
    expectedHazards: ['Machine Guarding'],
  },
  {
    name: 'Confined space atmospheric standard intent',
    input: {
      classification: 'Confined Space',
      observationText:
        'Employee entry into a tank is planned for hot work. Atmospheric test results, ventilation, rescue method, and isolation are not documented.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.146',
          title: 'Permit-required confined spaces',
          summary: 'Protect employees entering permit-required confined spaces.',
        },
      ],
      risk: { riskBand: 'Critical', imminentDanger: true },
      safetyHealthDomainMatrix: {
        primaryDomain: 'Confined Space',
        hazardousEnergies: ['atmospheric_hazard', 'chemical_energy', 'engulfment_material', 'thermal_energy'],
        injuryMechanisms: ['asphyxiation', 'inhalation_exposure', 'engulfment', 'fire_or_explosion'],
        healthMechanisms: ['acute poisoning', 'oxygen deficiency', 'toxic exposure'],
        evidenceRequired: ['space classification', 'atmospheric readings', 'permit', 'attendant', 'rescue method'],
        mitigationStrategies: ['avoid entry', 'test atmosphere', 'ventilate', 'isolate hazards', 'provide rescue plan'],
        strongControls: ['permit completed', 'atmospheric test record', 'rescue plan verified'],
        weakControls: ['no atmospheric test', 'no rescue plan', 'entrant alone'],
        relatedDomains: ['Fire / Hot Work', 'Respiratory Protection', 'Lockout / Tagout'],
      },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Atmospheric readings missing.', 'Rescue plan missing.'],
      },
    },
    expectedPrimaryCitation: '29 CFR 1910.146',
    expectedThemes: ['Prevent asphyxiation, toxic exposure, engulfment, entrapment, mechanical injury, fire/explosion, and delayed rescue in confined spaces.'],
    expectedHazards: ['Fire / Hot Work'],
  },
  {
    name: 'Hazcom chemical label standard intent',
    input: {
      classification: 'Hazard Communication',
      observationText:
        'Unlabeled flammable solvent container is being used near a maintenance area. SDS and chemical identity are not immediately available.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.1200',
          title: 'Hazard communication',
          summary: 'Chemical hazard information, labels, and safety data sheets.',
        },
      ],
      risk: { riskBand: 'Moderate' },
      safetyHealthDomainMatrix: {
        primaryDomain: 'Hazard Communication',
        hazardousEnergies: ['chemical_energy', 'thermal_energy', 'atmospheric_hazard'],
        injuryMechanisms: ['chemical_burn', 'inhalation_exposure', 'skin_absorption', 'fire_or_explosion'],
        healthMechanisms: ['acute toxicity', 'respiratory irritation', 'dermatitis'],
        evidenceRequired: ['chemical identity', 'label status', 'SDS availability', 'hazard class'],
        mitigationStrategies: ['identify and label chemical', 'make SDS available', 'control exposure'],
        strongControls: ['readable label', 'SDS available', 'hazards known'],
        weakControls: ['unknown liquid', 'no label', 'no SDS'],
        relatedDomains: ['PPE', 'Fire / Hot Work', 'Respiratory Protection'],
      },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: true,
        missingCriticalEvidence: ['Chemical identity missing.', 'SDS missing.'],
      },
    },
    expectedPrimaryCitation: '29 CFR 1910.1200',
    expectedThemes: ['Ensure chemical hazards are identified, communicated, labeled, and understood before employee exposure.'],
    expectedHazards: ['Fire / Hot Work'],
  },
  {
    name: 'Unclassified no standard blocks intent',
    input: {
      classification: 'Unclassified',
      observationText: 'Something looks unsafe in the work area.',
      suggestedStandards: [],
      risk: { riskBand: 'Unknown' },
      safetyHealthDomainMatrix: {
        primaryDomain: 'Unclassified',
        relatedDomains: ['Qualified Human Review'],
        hazardousEnergies: ['unknown'],
        injuryMechanisms: ['unknown'],
        evidenceRequired: ['task', 'exposure', 'hazard condition', 'controls present'],
      },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Hazard is not clearly described.', 'Exposure is unknown.'],
      },
    },
    expectedPrimaryCitation: 'No candidate standard supplied',
    expectedThemes: ['Prompt qualified review before making compliance claims.'],
    expectedHazards: ['Qualified Human Review'],
  },
];

const results: any[] = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input);

  assert(result.engine === 'safescope_standards_intent_intelligence', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(Array.isArray(result.standardIntentProfiles), `${scenario.name}: profiles must be array`);
  assert(result.standardIntentProfiles.length >= 1, `${scenario.name}: must return at least one profile`);

  const firstProfile = result.standardIntentProfiles[0];
  assert(firstProfile.citation === scenario.expectedPrimaryCitation, `${scenario.name}: unexpected primary citation`);

  assert(Array.isArray(firstProfile.likelyRegulatoryIntent), `${scenario.name}: intent must be array`);
  assert(Array.isArray(firstProfile.protectedPersons), `${scenario.name}: protected persons must be array`);
  assert(Array.isArray(firstProfile.preventedEvents), `${scenario.name}: prevented events must be array`);
  assert(Array.isArray(firstProfile.hazardMechanismsAddressed), `${scenario.name}: mechanisms must be array`);
  assert(Array.isArray(firstProfile.applicabilityEvidenceNeeded), `${scenario.name}: evidence needed must be array`);
  assert(Array.isArray(firstProfile.minimumControlIntent), `${scenario.name}: control intent must be array`);
  assert(Array.isArray(firstProfile.strongComplianceIndicators), `${scenario.name}: strong indicators must be array`);
  assert(Array.isArray(firstProfile.weakOrInsufficientIndicators), `${scenario.name}: weak indicators must be array`);
  assert(Array.isArray(firstProfile.relatedHazardsToCheck), `${scenario.name}: related hazards must be array`);
  assert(Array.isArray(firstProfile.verificationEvidence), `${scenario.name}: verification evidence must be array`);
  assert(Array.isArray(firstProfile.closureCautions), `${scenario.name}: closure cautions must be array`);

  for (const expectedTheme of scenario.expectedThemes) {
    assert(
      result.commonIntentThemes.includes(expectedTheme) || firstProfile.likelyRegulatoryIntent.includes(expectedTheme),
      `${scenario.name}: missing expected intent theme ${expectedTheme}`,
    );
  }

  for (const expectedHazard of scenario.expectedHazards) {
    assert(
      result.crossCheckHazards.includes(expectedHazard) || firstProfile.relatedHazardsToCheck.includes(expectedHazard),
      `${scenario.name}: missing expected cross-check hazard ${expectedHazard}`,
    );
  }

  if (!scenario.input.suggestedStandards?.length) {
    assert(result.confidence === 'low', `${scenario.name}: no-standard case should be low confidence`);
    assert(result.standardsCoverageGaps.length >= 1, `${scenario.name}: no-standard case should report coverage gap`);
  }

  if (scenario.input.risk?.riskBand === 'High' || scenario.input.risk?.riskBand === 'Critical') {
    assert(result.requiresQualifiedReview === true, `${scenario.name}: high-risk standard intent must require review`);
  }

  assert(result.canInventStandards === false, `${scenario.name}: cannot invent standards`);
  assert(result.canDeclareViolation === false, `${scenario.name}: cannot declare violation`);
  assert(
    result.canFinalizeApplicabilityWithoutEvidence === false,
    `${scenario.name}: cannot finalize applicability without evidence`,
  );
  assert(result.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
  assert(typeof result.sourceBoundary === 'string', `${scenario.name}: source boundary required`);

  results.push({
    scenario: scenario.name,
    confidence: result.confidence,
    primaryCitation: firstProfile.citation,
    intentThemes: result.commonIntentThemes.length,
    evidenceGaps: result.evidenceGapsBlockingApplicability.length,
    mitigationIntent: result.mitigationIntentSummary.length,
    crossCheckHazards: result.crossCheckHazards.length,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope standards intent gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
