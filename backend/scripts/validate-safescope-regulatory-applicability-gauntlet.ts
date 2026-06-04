import { SafeScopeRegulatoryApplicabilityService } from '../src/safescope-v2/regulatory-applicability/regulatory-applicability.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const service = new SafeScopeRegulatoryApplicabilityService();

const scenarios = [
  {
    name: 'Machine guarding likely applicable with exposed nip point',
    input: {
      classification: 'Machine Guarding',
      observationText:
        'MSHA metal/nonmetal mine conveyor tail pulley has exposed moving nip point with missing guard while miners work nearby. Equipment appears operating.',
      suggestedStandards: [
        {
          citation: '30 CFR 56.14107(a)',
          title: 'Moving machine parts shall be guarded to protect persons from contacting moving parts.',
        },
      ],
      evidenceTexts: ['Photo shows exposed pulley, missing guard, access path, and miners nearby.'],
      risk: { riskBand: 'High' },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: true,
        missingCriticalEvidence: [],
      },
    },
    expectedStatus: 'likely_applicable',
    expectedCitation: '30 CFR 56.14107(a)',
  },
  {
    name: 'Lockout possibly applicable with stored energy maintenance',
    input: {
      classification: 'Lockout / Tagout',
      observationText:
        'OSHA general industry maintenance mechanic is clearing jammed equipment with stored energy and unexpected startup concern. Energy isolation points are not documented.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.147',
          title: 'The control of hazardous energy',
        },
      ],
      evidenceTexts: ['Work order notes service activity and stored energy concern.'],
      risk: { riskBand: 'High' },
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Energy source list missing.', 'Try/test verification missing.'],
      },
    },
    expectedStatus: 'possibly_applicable',
    expectedCitation: '29 CFR 1910.147',
  },
  {
    name: 'Hazcom possibly applicable unlabeled solvent',
    input: {
      classification: 'Hazard Communication',
      observationText:
        'OSHA workplace has unlabeled solvent container in use near employees. SDS location and chemical identity are not confirmed.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.1200',
          title: 'Hazard communication',
        },
      ],
      evidenceTexts: ['Photo shows unlabeled secondary container.'],
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Chemical identity missing.', 'SDS not confirmed.'],
      },
    },
    expectedStatus: 'possibly_applicable',
    expectedCitation: '29 CFR 1910.1200',
  },
  {
    name: 'Confined space insufficient evidence',
    input: {
      classification: 'Confined Space',
      observationText:
        'Tank area has possible restricted access. Entry status, atmospheric testing, permit status, and rescue plan are not documented.',
      suggestedStandards: [
        {
          citation: '29 CFR 1910.146',
          title: 'Permit-required confined spaces',
        },
      ],
      evidenceTexts: ['Limited note only.'],
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Entry status missing.', 'Atmospheric testing missing.', 'Permit status missing.'],
      },
    },
    expectedStatus: 'possibly_applicable',
    expectedCitation: '29 CFR 1910.146',
  },
  {
    name: 'No candidate standard blocks applicability',
    input: {
      classification: 'Unclassified',
      observationText: 'Unsafe condition noted with limited context.',
      suggestedStandards: [],
      evidenceTexts: [],
      evidenceSufficiency: {
        sufficientForStandardsRecommendation: false,
        missingCriticalEvidence: ['Context missing.'],
      },
    },
    expectedStatus: 'insufficient_evidence',
    expectedCitation: 'No candidate standard supplied',
  },
];

const results: any[] = [];

for (const scenario of scenarios) {
  const result = service.evaluate(scenario.input as any);

  assert(result.engine === 'safescope_regulatory_applicability', `${scenario.name}: wrong engine`);
  assert(result.mode === 'deterministic_offline', `${scenario.name}: wrong mode`);
  assert(result.profiles.length >= 1, `${scenario.name}: expected profiles`);
  assert(result.strongestCandidateCitation === scenario.expectedCitation, `${scenario.name}: unexpected strongest citation`);
  assert(
    result.primaryApplicabilityStatus === scenario.expectedStatus,
    `${scenario.name}: expected ${scenario.expectedStatus}, got ${result.primaryApplicabilityStatus}`,
  );

  assert(result.canInventStandards === false, `${scenario.name}: cannot invent standards`);
  assert(result.canDeclareViolation === false, `${scenario.name}: cannot declare violation`);
  assert(result.canFinalizeApplicabilityWithoutEvidence === false, `${scenario.name}: cannot finalize without evidence`);
  assert(result.canOverrideRegulations === false, `${scenario.name}: cannot override regulations`);
  assert(result.canReduceHumanReview === false, `${scenario.name}: cannot reduce human review`);
  assert(result.requiresQualifiedReview === true, `${scenario.name}: applicability must require review`);

  const primary = result.profiles[0];

  assert(primary.evidenceNeededBeforeCitation.length >= 1, `${scenario.name}: evidence needed before citation required`);
  assert(primary.cautionBeforeUse.length >= 1, `${scenario.name}: caution before use required`);
  assert(typeof primary.recommendedUse === 'string', `${scenario.name}: recommended use required`);

  results.push({
    scenario: scenario.name,
    status: result.primaryApplicabilityStatus,
    citation: result.strongestCandidateCitation,
    confidence: result.confidence,
    profileConfidence: primary.confidence,
    supportingFacts: primary.applicabilityFactsSupporting.length,
    missingFacts: primary.applicabilityFactsMissing.length,
    evidenceNeededBeforeCitation: primary.evidenceNeededBeforeCitation.length,
    moreSpecificWarnings: result.moreSpecificStandardWarnings.length,
    requiresQualifiedReview: result.requiresQualifiedReview,
  });
}

console.log('✅ SafeScope regulatory applicability gauntlet passed.');
console.log(JSON.stringify(results, null, 2));
