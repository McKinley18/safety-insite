/** §219 PHASE A -- FREEZE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_PAYLOAD_212_VERSION } from './lib/expert-212-verifier-payload';
import {
  SCOPE_CONTAINMENT_214_VERSION, SCOPE_ADMISSION_CODES_214,
} from './lib/expert-214-scope-containment';
import { DISPOSITION_REMEDIATION_216_VERSION } from './lib/expert-216-disposition-remediation';
import {
  DISPOSITION_CLOSURE_216_VERSION, closureMatrix, dispositionRoutingIsClosed,
} from './lib/expert-216-disposition-closure';
import {
  VERIFIER_218_RESPONSE_SCHEMA, PROPERTY_REVIEW_CONTRACT_218_VERSION,
  PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218, PROPERTY_REVIEW_FIELDS_218,
  schemaAccounting218,
} from './lib/expert-218-property-review-contract';
import {
  EXPERT_VERIFIER_218_SYSTEM_PROMPT, PROPERTY_INSTRUCTION_218_VERSION, instructionAccounting218,
} from './lib/expert-218-property-instruction';
import {
  PROPERTY_CONSISTENCY_218_VERSION, PROPERTY_REVIEW_CODES_218, CONSISTENCY_DECISION_INPUTS_218,
} from './lib/expert-218-property-consistency';
import {
  STRUCTURED_CONFIRMATION_INSTRUMENT_219_VERSION, PROVIDER_CALLS_IN_PHASE_A,
  MAX_VERIFIER_CALLS_219, SPEND_CEILING_USD_219, PROJECTED_SPEND_USD_219,
  DATABASE_OPERATIONS_AUTHORIZED_219, PRIOR_CASES_NOT_REUSED,
  SECTION_218_FIXTURE_SETTINGS_NOT_REUSED, CONFIRMATION_CASES_219, EXECUTION_ORDER_219,
  HARD_GATES_219, HARD_GATE_RULE_219, STANDING_GATES_219, HG9_EXERCISED_ON, FAILURE_CLASSES_219,
  CONTAINMENT_RULE_219, STRUCTURAL_IS_NOT_SEMANTIC_219, SCHEMA_CANARY_219, NON_DEGENERACY_219,
  DISPOSITION_CONSISTENCY_219, DECISION_CONTROLLING_PROPERTY_SCORING_219, providerCallCount219,
  hardGateCoverage219, trivialStrategyFailures219, KR1_MOVEMENT_RULE_219, ACCEPTANCE_CHARACTER_219,
  STOPPING_RULE_219, AUTHORIZATION_BOUNDARY_219, TERMINALS_219,
} from './lib/expert-219-structured-confirmation-instrument';
import { assemble219, ASSEMBLY_219_VERSION, ADAPTER_SUPPLIES_219 } from './lib/expert-219-assembly';
import { SCORING_219_VERSION, scoringEffect219 } from './lib/expert-219-scoring';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-219-final-structured-verifier-confirmation-2026-09-10');
const LIB = join(__dirname, 'lib');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

const A = assemble219();
if (A.failures.length > 0 || A.built.length !== MAX_VERIFIER_CALLS_219) {
  throw new Error(`§219 FREEZE ABORT: ${A.built.length} calls, ${A.failures.length} failures`);
}
if (!dispositionRoutingIsClosed()) {
  throw new Error('§219 FREEZE ABORT: §216 closure no longer holds');
}
for (const s of NON_DEGENERACY_219.strategies) {
  const actual = trivialStrategyFailures219(s.strategy).join(',');
  if (actual !== [...s.mustFail].join(',')) {
    throw new Error(`§219 FREEZE ABORT: ${s.strategy} fails ${actual}, expected ${s.mustFail}`);
  }
}

const prereg = {
  artifact: 'SECTION-219-FINAL-STRUCTURED-VERIFIER-CONFIRMATION-PREREGISTRATION',
  instrumentVersion: STRUCTURED_CONFIRMATION_INSTRUMENT_219_VERSION,
  frozenBeforeAnyProviderCall: true,
  providerCallsInPhaseA: PROVIDER_CALLS_IN_PHASE_A,
  databaseOperationsAuthorized: DATABASE_OPERATIONS_AUTHORIZED_219,
  maxVerifierCalls: MAX_VERIFIER_CALLS_219,
  projectedSpendUsd: PROJECTED_SPEND_USD_219,
  spendCeilingUsd: SPEND_CEILING_USD_219,
  retriesAuthorized: 0, secondDrawsAuthorized: 0, rescueCallsAuthorized: 0,
  alternateModelAuthorized: false, alternateProviderAuthorized: false,
  firstPassCallsAuthorized: 0, governedStageCallsAuthorized: 0,
  authorizationBoundary: AUTHORIZATION_BOUNDARY_219,
  priorCasesNotReused: PRIOR_CASES_NOT_REUSED,
  section218FixtureSettingsNotReused: SECTION_218_FIXTURE_SETTINGS_NOT_REUSED,

  identities: {
    instructionVersion: PROPERTY_INSTRUCTION_218_VERSION,
    instructionBaseVersion: DISPOSITION_REMEDIATION_216_VERSION,
    instructionSha256: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    instructionModuleSha256: shaFile(join(LIB, 'expert-218-property-instruction.ts')),
    instructionBaseModuleSha256: shaFile(join(LIB, 'expert-216-disposition-remediation.ts')),
    schemaVersion: PROPERTY_REVIEW_CONTRACT_218_VERSION,
    toolSchemaSha256: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
    schemaModuleSha256: shaFile(join(LIB, 'expert-218-property-review-contract.ts')),
    deterministicCheckerVersion: PROPERTY_CONSISTENCY_218_VERSION,
    deterministicCheckerSha256: shaFile(join(LIB, 'expert-218-property-consistency.ts')),
    payloadAssemblerVersion: VERIFIER_PAYLOAD_212_VERSION,
    payloadAssemblerSha256: shaFile(join(LIB, 'expert-212-verifier-payload.ts')),
    assemblyPathVersion: ASSEMBLY_219_VERSION,
    assemblyPathSha256: shaFile(join(LIB, 'expert-219-assembly.ts')),
    siblingScopeRuleVersion: SCOPE_CONTAINMENT_214_VERSION,
    siblingScopeRuleSha256: shaFile(join(LIB, 'expert-214-scope-containment.ts')),
    structuralClosureVersion: DISPOSITION_CLOSURE_216_VERSION,
    structuralClosureSha256: shaFile(join(LIB, 'expert-216-disposition-closure.ts')),
    scopeAdmissionCodes: SCOPE_ADMISSION_CODES_214,
    propertyReviewCodes: PROPERTY_REVIEW_CODES_218,
    consistencyDecisionInputs: CONSISTENCY_DECISION_INPUTS_218,
    instrumentModuleSha256: shaFile(join(LIB, 'expert-219-structured-confirmation-instrument.ts')),
    scorerVersion: SCORING_219_VERSION,
    scorerModuleSha256: shaFile(join(LIB, 'expert-219-scoring.ts')),
    scorerEffect: scoringEffect219(),
  },

  propertyReviewContract: {
    fields: PROPERTY_REVIEW_FIELDS_218,
    semanticRoles: PROPERTY_SEMANTIC_ROLES_218,
    validities: PROPERTY_VALIDITIES_218,
    schemaAccounting: schemaAccounting218(),
    instructionAccounting: instructionAccounting218(),
  },

  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  structuralClosureAtFreeze: { closed: dispositionRoutingIsClosed(), matrix: closureMatrix() },

  cases: CONFIRMATION_CASES_219,
  executionOrder: EXECUTION_ORDER_219,
  plannedCalls: A.built.map(b => ({
    ordinal: b.ordinal,
    caseId: b.caseId,
    declarationId: b.declarationId,
    factKey: b.factKey,
    userPromptSha256: b.identities.userPrompt,
    userPromptBytes: Buffer.byteLength(b.userPrompt, 'utf8'),
    systemPromptSha256: b.identities.instruction,
    toolSchemaSha256: b.identities.schema,
    expectedDeclarationShape: {
      declarationCount: 1,
      declaredFactKeys: [b.factKey],
      propertyReviewTargetDeclarationId: b.declarationId,
      nominatedFact: null,
    },
    retainedClarificationIds: b.retainedClarificationIds,
    excludedClarificationIds: b.excludedClarificationIds,
  })),

  providerCallCount: providerCallCount219(),
  hardGates: HARD_GATES_219,
  hardGateRule: HARD_GATE_RULE_219,
  standingGates: STANDING_GATES_219,
  hg9ExercisedOn: HG9_EXERCISED_ON,
  hardGateCoverage: hardGateCoverage219(),
  failureClasses: FAILURE_CLASSES_219,
  containmentRule: CONTAINMENT_RULE_219,
  structuralIsNotSemantic: STRUCTURAL_IS_NOT_SEMANTIC_219,
  schemaCanary: SCHEMA_CANARY_219,
  nonDegeneracy: NON_DEGENERACY_219,
  nonDegeneracyComputedAtFreeze: NON_DEGENERACY_219.strategies.map(s => ({
    strategy: s.strategy, fails: trivialStrategyFailures219(s.strategy),
  })),
  dispositionConsistency: DISPOSITION_CONSISTENCY_219,
  decisionControllingPropertyScoring: DECISION_CONTROLLING_PROPERTY_SCORING_219,
  adapterSupplies: ADAPTER_SUPPLIES_219,
  kr1MovementRule: KR1_MOVEMENT_RULE_219,
  acceptanceCharacter: ACCEPTANCE_CHARACTER_219,
  stoppingRule: STOPPING_RULE_219,
  terminals: TERMINALS_219,
  generatedAt: '2026-09-10',
};

const json = JSON.stringify(prereg, null, 2) + '\n';
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-219.json'), json);
const digest = sha(json);
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-219.sha256'),
  `${digest}  CONFIRMATION-PREREGISTRATION-219.json\n`);

console.log('FROZEN. digest:', digest);
console.log('calls      :', providerCallCount219(), '| ceiling USD', SPEND_CEILING_USD_219);
console.log('instruction:', prereg.identities.instructionSha256.slice(0, 16) + '…');
console.log('schema     :', prereg.identities.toolSchemaSha256.slice(0, 16) + '…');
console.log('checker    :', prereg.identities.deterministicCheckerSha256.slice(0, 16) + '…');
console.log('scorer     :', prereg.identities.scorerModuleSha256.slice(0, 16) + '…');
console.log('scope rule :', prereg.identities.siblingScopeRuleSha256.slice(0, 16) + '…');
console.log('closure    :', prereg.structuralClosureAtFreeze.closed);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
