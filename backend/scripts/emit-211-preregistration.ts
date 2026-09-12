import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  FIRST_PASS_STATUS, FIRST_PASS_STATUS_IS_NOT, EXPERT_HAZLENZ_OVERALL_STATUS, FROZEN_BASELINE,
  FREEZE_BASIS, KR_1, FREEZE_EXCEPTIONS, DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS,
  WHAT_THE_FREEZE_MEANS, FIRST_PASS_FREEZE_211_VERSION,
} from './lib/expert-211-first-pass-freeze';
import {
  VERIFIER_INSPECTION_211_VERSION, PAYLOAD_AUDIT, payloadGapCount, BUILT_BUT_UNWIRED,
  VERIFIER_REMIT_TODAY, CHALLENGE_GROUNDS_TODAY, C6A_CLOSES_THE_GROUND_VOCABULARY,
  CAPABILITY_COVERAGE, CANDIDATE_COVERAGE, REQUIRED_REMEDIATION, HOSTED_VALIDATION_READINESS,
  SUPPLIED_OWED_FACT_FIELDS_TODAY, REQUIRED_VERIFIER_FIELDS_211,
} from './lib/expert-211-verifier-inspection';
import {
  VALIDATION_INSTRUMENT_211_VERSION, HARD_FAILURE_CLASSES, HARD_FAILURE_GATE_RULE,
  VALIDATION_CASES, providerCallCount, capabilitiesCovered, hardFailureCoverage, COST_BASIS,
  COST_DELTA_ASSUMPTIONS, costProjection, EXECUTION_PRECONDITIONS, ACCEPTANCE_CHARACTER,
} from './lib/expert-211-validation-instrument';
import { buildRepinProposal, REPIN_PROPOSAL_211_VERSION } from './lib/expert-211-repin-proposal';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09');

const prereg = {
  artifact: 'SECTION-211-TARGETED-VERIFIER-VALIDATION-PREREGISTRATION',
  versions: {
    freeze: FIRST_PASS_FREEZE_211_VERSION,
    inspection: VERIFIER_INSPECTION_211_VERSION,
    instrument: VALIDATION_INSTRUMENT_211_VERSION,
    repinProposal: REPIN_PROPOSAL_211_VERSION,
  },
  providerCalls: 0,
  databaseOperations: 0,
  frozenBeforeAnyProviderCall: true,
  firstPassFreeze: {
    status: FIRST_PASS_STATUS,
    statusIsNot: FIRST_PASS_STATUS_IS_NOT,
    overall: EXPERT_HAZLENZ_OVERALL_STATUS,
    baseline: FROZEN_BASELINE,
    basis: FREEZE_BASIS,
    carriedRisk: KR_1,
    exceptions: FREEZE_EXCEPTIONS,
    doNotTuneRule: DO_NOT_TUNE_THE_FIRST_PASS_FROM_VERIFIER_FINDINGS,
    meaning: WHAT_THE_FREEZE_MEANS,
  },
  verifierInspection: {
    suppliedOwedFactFieldsToday: SUPPLIED_OWED_FACT_FIELDS_TODAY,
    requiredFields: REQUIRED_VERIFIER_FIELDS_211,
    payloadAudit: PAYLOAD_AUDIT,
    payloadGaps: payloadGapCount(),
    builtButUnwired: BUILT_BUT_UNWIRED,
    remitToday: VERIFIER_REMIT_TODAY,
    challengeGroundsToday: CHALLENGE_GROUNDS_TODAY,
    c6aHazard: C6A_CLOSES_THE_GROUND_VOCABULARY,
    capabilityCoverage: CAPABILITY_COVERAGE,
    candidateCoverage: CANDIDATE_COVERAGE,
    requiredRemediation: REQUIRED_REMEDIATION,
    hostedValidationReadiness: HOSTED_VALIDATION_READINESS,
  },
  instrument: {
    cases: VALIDATION_CASES,
    caseCount: VALIDATION_CASES.length,
    capabilitiesCovered: capabilitiesCovered(),
    hardFailureClasses: HARD_FAILURE_CLASSES,
    hardFailureGateRule: HARD_FAILURE_GATE_RULE,
    hardFailureCoverage: hardFailureCoverage(),
    providerCallsOnExecution: providerCallCount(),
    costBasis: COST_BASIS,
    costDeltaAssumptions: COST_DELTA_ASSUMPTIONS,
    costProjection: costProjection(),
    executionPreconditions: EXECUTION_PRECONDITIONS,
    acceptanceCharacter: ACCEPTANCE_CHARACTER,
  },
  pm1RepinProposal: buildRepinProposal(),
  generatedAt: '2026-09-09',
};

const json = JSON.stringify(prereg, null, 2) + '\n';
writeFileSync(join(DIR, 'VERIFIER-VALIDATION-PREREGISTRATION-211.json'), json);
const sha = createHash('sha256').update(json, 'utf8').digest('hex');
writeFileSync(join(DIR, 'VERIFIER-VALIDATION-PREREGISTRATION-211.sha256'),
  `${sha}  VERIFIER-VALIDATION-PREREGISTRATION-211.json\n`);

console.log('preregistration identity:', sha);
console.log('cases:', VALIDATION_CASES.length, '| provider calls on execution:', providerCallCount());
console.log('cost:', JSON.stringify(costProjection(), null, 2));
console.log('payload gaps:', JSON.stringify(payloadGapCount()));
