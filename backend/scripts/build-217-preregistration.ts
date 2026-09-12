/** §217 PHASE A -- FREEZE. ZERO PROVIDER CALLS. */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import { VERIFIER_PAYLOAD_212_VERSION } from './lib/expert-212-verifier-payload';
import {
  SCOPE_CONTAINMENT_214_VERSION, SCOPE_ADMISSION_CODES_214,
} from './lib/expert-214-scope-containment';
import {
  EXPERT_VERIFIER_216_SYSTEM_PROMPT, DISPOSITION_REMEDIATION_216_VERSION,
} from './lib/expert-216-disposition-remediation';
import {
  DISPOSITION_CLOSURE_216_VERSION, closureMatrix, dispositionRoutingIsClosed,
} from './lib/expert-216-disposition-closure';
import {
  FINAL_CONFIRMATION_INSTRUMENT_217_VERSION, CONFIRMATION_CASES_217, EXECUTION_ORDER_217,
  HARD_GATES_217, HARD_GATE_RULE_217, STANDING_GATES, FAILURE_CLASSES_217, CONTAINMENT_RULE,
  NON_DEGENERACY, providerCallCount217, hardGateCoverage217, KR1_MOVEMENT_RULE_217,
  ACCEPTANCE_CHARACTER_217, MAX_VERIFIER_CALLS_217, SPEND_CEILING_USD_217, PRIOR_CASES_NOT_REUSED,
} from './lib/expert-217-final-confirmation-instrument';
import { assemble217, ASSEMBLY_217_VERSION, ADAPTER_SUPPLIES_217 } from './lib/expert-217-assembly';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-217-final-minimal-verifier-confirmation-2026-09-09');
const LIB = join(__dirname, 'lib');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

const A = assemble217();
if (A.failures.length > 0 || A.built.length !== MAX_VERIFIER_CALLS_217) {
  throw new Error(`§217 FREEZE ABORT: ${A.built.length} calls, ${A.failures.length} failures`);
}
if (!dispositionRoutingIsClosed()) throw new Error('§217 FREEZE ABORT: §216 closure no longer holds');

const prereg = {
  artifact: 'SECTION-217-FINAL-MINIMAL-VERIFIER-CONFIRMATION-PREREGISTRATION',
  instrumentVersion: FINAL_CONFIRMATION_INSTRUMENT_217_VERSION,
  frozenBeforeAnyProviderCall: true,
  providerCallsInPhaseA: 0,
  maxVerifierCalls: MAX_VERIFIER_CALLS_217,
  spendCeilingUsd: SPEND_CEILING_USD_217,
  retriesAuthorized: 0, secondDrawsAuthorized: 0, rescueCallsAuthorized: 0,
  alternateModelAuthorized: false,
  priorCasesNotReused: PRIOR_CASES_NOT_REUSED,
  identities: {
    instructionVersion: DISPOSITION_REMEDIATION_216_VERSION,
    instructionSha256: sha(EXPERT_VERIFIER_216_SYSTEM_PROMPT),
    instructionModuleSha256: shaFile(join(LIB, 'expert-216-disposition-remediation.ts')),
    toolSchemaSha256: sha(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)),
    payloadAssemblerVersion: VERIFIER_PAYLOAD_212_VERSION,
    payloadAssemblerSha256: shaFile(join(LIB, 'expert-212-verifier-payload.ts')),
    assemblyPathVersion: ASSEMBLY_217_VERSION,
    assemblyPathSha256: shaFile(join(LIB, 'expert-217-assembly.ts')),
    siblingScopeRuleVersion: SCOPE_CONTAINMENT_214_VERSION,
    siblingScopeRuleSha256: shaFile(join(LIB, 'expert-214-scope-containment.ts')),
    structuralCheckerVersion: DISPOSITION_CLOSURE_216_VERSION,
    structuralCheckerSha256: shaFile(join(LIB, 'expert-216-disposition-closure.ts')),
    scopeAdmissionCodes: SCOPE_ADMISSION_CODES_214,
    instrumentModuleSha256: shaFile(join(LIB, 'expert-217-final-confirmation-instrument.ts')),
  },
  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  structuralClosureAtFreeze: { closed: dispositionRoutingIsClosed(), matrix: closureMatrix() },
  cases: CONFIRMATION_CASES_217,
  executionOrder: EXECUTION_ORDER_217,
  plannedCalls: A.built.map(b => ({
    ordinal: b.ordinal, caseId: b.caseId, declarationId: b.declarationId, factKey: b.factKey,
    userPromptSha256: b.identities.userPrompt,
    userPromptBytes: Buffer.byteLength(b.userPrompt, 'utf8'),
    retainedClarificationIds: b.retainedClarificationIds,
    excludedClarificationIds: b.excludedClarificationIds,
  })),
  providerCallCount: providerCallCount217(),
  hardGates: HARD_GATES_217, hardGateRule: HARD_GATE_RULE_217, standingGates: STANDING_GATES,
  hardGateCoverage: hardGateCoverage217(),
  failureClasses: FAILURE_CLASSES_217, containmentRule: CONTAINMENT_RULE,
  nonDegeneracy: NON_DEGENERACY,
  adapterSupplies: ADAPTER_SUPPLIES_217,
  kr1MovementRule: KR1_MOVEMENT_RULE_217,
  acceptanceCharacter: ACCEPTANCE_CHARACTER_217,
  generatedAt: '2026-09-09',
};
const json = JSON.stringify(prereg, null, 2) + '\n';
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-217.json'), json);
const digest = sha(json);
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-217.sha256'),
  `${digest}  CONFIRMATION-PREREGISTRATION-217.json\n`);
console.log('FROZEN. digest:', digest);
console.log('calls:', providerCallCount217(), '| ceiling USD', SPEND_CEILING_USD_217);
console.log('instruction:', prereg.identities.instructionSha256.slice(0, 16) + '…');
console.log('schema     :', prereg.identities.toolSchemaSha256.slice(0, 16) + '…');
console.log('scope rule :', prereg.identities.siblingScopeRuleSha256.slice(0, 16) + '…');
console.log('closure    :', prereg.structuralClosureAtFreeze.closed);
