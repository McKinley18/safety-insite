/**
 * §215 PHASE A -- FREEZE. ZERO PROVIDER CALLS.
 * Emits the preregistration and its sha256. Nothing may be executed until this digest exists.
 */
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import {
  EXPERT_VERIFIER_214_SYSTEM_PROMPT, VERIFIER_SEMANTIC_REMEDIATION_214_VERSION,
} from './lib/expert-214-verifier-semantic-remediation';
import {
  SCOPE_CONTAINMENT_214_VERSION, SCOPE_ADMISSION_CODES_214,
} from './lib/expert-214-scope-containment';
import { VERIFIER_PAYLOAD_212_VERSION } from './lib/expert-212-verifier-payload';
import {
  CONFIRMATION_INSTRUMENT_215_VERSION, CONFIRMATION_CASES_215, EXECUTION_ORDER,
  HARD_FAILURE_CLASSES_215, HARD_FAILURE_GATE_RULE_215, CONTRAST_PAIRS, providerCallCount215,
  hardFailureCoverage215, KR1_MOVEMENT_RULE, ACCEPTANCE_CHARACTER_215, MAX_VERIFIER_CALLS,
  SPEND_CEILING_USD, SECTION_213_CASES_NOT_REUSED,
} from './lib/expert-215-confirmation-instrument';
import { assemble215, ASSEMBLY_215_VERSION, ADAPTER_SUPPLIES } from './lib/expert-215-assembly';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-215-minimal-verifier-confirmation-2026-09-09');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string =>
  createHash('sha256').update(require('fs').readFileSync(p)).digest('hex');
const LIB = join(__dirname, 'lib');

const A = assemble215();
if (A.failures.length > 0 || A.built.length !== MAX_VERIFIER_CALLS) {
  throw new Error(`§215 FREEZE ABORT: assembly produced ${A.built.length} calls with `
    + `${A.failures.length} failures`);
}

const prereg = {
  artifact: 'SECTION-215-MINIMAL-VERIFIER-CONFIRMATION-PREREGISTRATION',
  instrumentVersion: CONFIRMATION_INSTRUMENT_215_VERSION,
  frozenBeforeAnyProviderCall: true,
  providerCallsInPhaseA: 0,
  maxVerifierCalls: MAX_VERIFIER_CALLS,
  spendCeilingUsd: SPEND_CEILING_USD,
  retriesAuthorized: 0,
  secondDrawsAuthorized: 0,
  rescueCallsAuthorized: 0,
  alternateModelAuthorized: false,
  section213CasesNotReused: SECTION_213_CASES_NOT_REUSED,
  identities: {
    instructionVersion: VERIFIER_SEMANTIC_REMEDIATION_214_VERSION,
    instructionSha256: sha(EXPERT_VERIFIER_214_SYSTEM_PROMPT),
    instructionModuleSha256: shaFile(join(LIB, 'expert-214-verifier-semantic-remediation.ts')),
    toolSchemaSha256: sha(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)),
    payloadAssemblerVersion: VERIFIER_PAYLOAD_212_VERSION,
    payloadAssemblerSha256: shaFile(join(LIB, 'expert-212-verifier-payload.ts')),
    assemblyPathVersion: ASSEMBLY_215_VERSION,
    assemblyPathSha256: shaFile(join(LIB, 'expert-215-assembly.ts')),
    siblingScopeRuleVersion: SCOPE_CONTAINMENT_214_VERSION,
    siblingScopeRuleSha256: shaFile(join(LIB, 'expert-214-scope-containment.ts')),
    scopeAdmissionCodes: SCOPE_ADMISSION_CODES_214,
    instrumentModuleSha256: shaFile(join(LIB, 'expert-215-confirmation-instrument.ts')),
  },
  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  cases: CONFIRMATION_CASES_215,
  executionOrder: EXECUTION_ORDER,
  plannedCalls: A.built.map(b => ({
    ordinal: b.ordinal, caseId: b.caseId, declarationId: b.declarationId, factKey: b.factKey,
    userPromptSha256: b.identities.userPrompt,
    userPromptBytes: Buffer.byteLength(b.userPrompt, 'utf8'),
    retainedClarificationIds: b.retainedClarificationIds,
    excludedClarificationIds: b.excludedClarificationIds,
  })),
  providerCallCount: providerCallCount215(),
  hardFailureClasses: HARD_FAILURE_CLASSES_215,
  hardFailureGateRule: HARD_FAILURE_GATE_RULE_215,
  hardFailureCoverage: hardFailureCoverage215(),
  contrastPairs: CONTRAST_PAIRS,
  adapterSupplies: ADAPTER_SUPPLIES,
  kr1MovementRule: KR1_MOVEMENT_RULE,
  acceptanceCharacter: ACCEPTANCE_CHARACTER_215,
  generatedAt: '2026-09-09',
};

const json = JSON.stringify(prereg, null, 2) + '\n';
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-215.json'), json);
const digest = sha(json);
writeFileSync(join(DIR, 'CONFIRMATION-PREREGISTRATION-215.sha256'),
  `${digest}  CONFIRMATION-PREREGISTRATION-215.json\n`);

console.log('FROZEN. digest:', digest);
console.log('calls:', providerCallCount215(), '| ceiling USD', SPEND_CEILING_USD);
console.log('instruction:', prereg.identities.instructionSha256.slice(0, 16) + '…');
console.log('schema     :', prereg.identities.toolSchemaSha256.slice(0, 16) + '…');
console.log('scope rule :', prereg.identities.siblingScopeRuleSha256.slice(0, 16) + '…');
