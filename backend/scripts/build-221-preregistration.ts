/** §221 PHASE A -- FREEZE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, EXPERT_HOSTED_INFERENCE_CONFIG,
  EXPERT_TOOL_NAME,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertVNextWireSchema, governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_CONTRACT_210J_VERSION, buildExpert210jWireSchema,
} from './lib/expert-210j-first-pass-contract';
import { PROJECTION_210J_VERSION } from './lib/expert-210j-declaration-projection';
import { SCOPE_CONTAINMENT_214_VERSION } from './lib/expert-214-scope-containment';
import {
  PROPERTY_REVIEW_CONTRACT_218_VERSION, VERIFIER_218_RESPONSE_SCHEMA,
} from './lib/expert-218-property-review-contract';
import {
  PROPERTY_INSTRUCTION_218_VERSION, EXPERT_VERIFIER_218_SYSTEM_PROMPT,
} from './lib/expert-218-property-instruction';
import { PROPERTY_CONSISTENCY_218_VERSION } from './lib/expert-218-property-consistency';
import { VERIFIER_PAYLOAD_212_VERSION } from './lib/expert-212-verifier-payload';
import { VERIFIER_TOOL_NAME } from './lib/expert-208b-verifier-recovery';
import {
  PROPERTY_AUTHORITY_CONTRACT_VERSION, KR1_STATUS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';
import {
  SETTLEMENT_REVIEW_CONTRACT_VERSION,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  INTEGRATED_INSTRUMENT_221_VERSION, PROVIDER_CALLS_IN_PHASE_A, MAX_PROVIDER_CALLS_221,
  SPEND_CEILING_USD_221, PROJECTED_SPEND_USD_221, DATABASE_OPERATIONS_AUTHORIZED_221,
  PRIOR_CASES_NOT_REUSED_221, ACCEPTANCE_CHARACTER_221, KR1_STATUS_AT_221, CASE_FAMILIES_221,
  INTEGRATED_HARD_GATES_221, HARD_GATE_RULE_221, AMBIGUITY_RULE_221, DEFECT_CLASSES_221,
  CONTAINMENT_EXAMPLES_221, KR1_CASE_SCORING_221, REVIEW_PACKET_QUALITY_RULE_221,
  INTEGRATED_CASES_221, EXECUTION_ORDER_221, RR7_MALFORMATION_221,
  SETTLEMENT_EXERCISES_REQUIRED_221, CORRECT_PROPERTY_EXERCISE_221, AUTHORIZATION_BOUNDARY_221,
  ADJUDICATION_BOUNDARY_221, TERMINALS_221, providerCallPlan221, humanJudgmentTotal221,
  familyCoverage221, gateCoverage221, judgmentsFeedingGate221,
} from './lib/expert-221-integrated-instrument';
import {
  assembleFirstPass221, verifierLegIdentities221, ADAPTER_SUPPLIES_221, ASSEMBLY_221_VERSION,
} from './lib/expert-221-assembly';

const ROOT = join(__dirname, '..', '..');
const DIR = join(ROOT, 'verification',
  'expert-hazlenz-221-integrated-pipeline-validation-2026-09-10');
const LIB = join(__dirname, 'lib');
const SRC = join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/owed-facts');

if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

const FP = assembleFirstPass221();
if (FP.length !== 10) throw new Error(`§221 FREEZE ABORT: ${FP.length} first-pass requests`);

const coverage = familyCoverage221();
const uncoveredFamilies = CASE_FAMILIES_221.filter(f => coverage[f.id].length === 0);
if (uncoveredFamilies.length > 0) {
  throw new Error(`§221 FREEZE ABORT: families uncovered — `
    + uncoveredFamilies.map(f => f.name).join(', '));
}
const gates = gateCoverage221();
const uncoveredGates = INTEGRATED_HARD_GATES_221.filter(g => gates[g.id].length === 0);
if (uncoveredGates.length > 0) {
  throw new Error(`§221 FREEZE ABORT: gates unexercised — ${uncoveredGates.map(g => g.id)}`);
}
const judgments = humanJudgmentTotal221();
if (judgments < 50 || judgments > 90) {
  throw new Error(`§221 FREEZE ABORT: ${judgments} judgments outside the 50-90 budget`);
}
const plan = providerCallPlan221();
if (plan.totalPlanned + plan.contingencyCalls > MAX_PROVIDER_CALLS_221) {
  throw new Error('§221 FREEZE ABORT: the call plan exceeds the authorized ceiling');
}

// ---- transport accounting, MEASURED, and the §199 comparison recorded rather than discovered.
const sample = FP[0];
const baseSchema = buildExpertVNextWireSchema(sample.input, governedBindingFor([]));
const j210 = buildExpert210jWireSchema(sample.input, governedBindingFor([]));
const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(j210));
const transportAccounting = {
  firstPassBaseSchemaBytes: JSON.stringify(baseSchema).length,
  firstPass210jSchemaBytes: JSON.stringify(j210).length,
  firstPassSchemaAsSentBytes: JSON.stringify(asSent).length,
  firstPassSystemPromptBytes: Buffer.byteLength(sample.systemPrompt, 'utf8'),
  verifierSchemaBytes: JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA).length,
  section199RefusedAtAsSentBytes: 19060,
  section199AcceptedAtAsSentBytes: 18620,
  section210hTransmittedBaseSchemaSuccessfully: true,
  STATED_PRE_EXECUTION_RISK:
    'the §210J first-pass wire schema has NEVER been transmitted hosted. §210H executed the §210G '
    + 'base. The as-sent §210J schema measures above the size at which §199 was refused on compiled '
    + 'grammar complexity. This is recorded BEFORE execution rather than discovered after it. The '
    + 'first hosted call is the compatibility canary and the frozen instrument is NOT altered to '
    + 'avoid the risk: if the transport refuses it, §221 returns the execution-blocked terminal.',
} as const;

const prereg = {
  artifact: 'SECTION-221-INTEGRATED-EXPERT-PIPELINE-VALIDATION-PREREGISTRATION',
  instrumentVersion: INTEGRATED_INSTRUMENT_221_VERSION,
  frozenBeforeAnyProviderCall: true,
  providerCallsInPhaseA: PROVIDER_CALLS_IN_PHASE_A,
  databaseOperationsAuthorized: DATABASE_OPERATIONS_AUTHORIZED_221,
  maxProviderCalls: MAX_PROVIDER_CALLS_221,
  projectedSpendUsd: PROJECTED_SPEND_USD_221,
  spendCeilingUsd: SPEND_CEILING_USD_221,
  authorizationBoundary: AUTHORIZATION_BOUNDARY_221,
  priorCasesNotReused: PRIOR_CASES_NOT_REUSED_221,
  acceptanceCharacter: ACCEPTANCE_CHARACTER_221,
  kr1Status: KR1_STATUS_AT_221,

  modelAndProvider: {
    provider: 'anthropic',
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
    cachingPosture: 'DISABLED — no cache_control constructed anywhere',
    firstPassToolName: EXPERT_TOOL_NAME,
    verifierToolName: VERIFIER_TOOL_NAME,
  },

  identities: {
    firstPassContractVersion: FIRST_PASS_CONTRACT_210J_VERSION,
    firstPassContractModuleSha256: shaFile(join(LIB, 'expert-210j-first-pass-contract.ts')),
    firstPassProjectionVersion: PROJECTION_210J_VERSION,
    firstPassProjectionModuleSha256: shaFile(join(LIB, 'expert-210j-declaration-projection.ts')),
    verifierInstructionVersion: PROPERTY_INSTRUCTION_218_VERSION,
    verifierInstructionSha256: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    verifierInstructionModuleSha256: shaFile(join(LIB, 'expert-218-property-instruction.ts')),
    verifierSchemaVersion: PROPERTY_REVIEW_CONTRACT_218_VERSION,
    verifierSchemaSha256: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
    verifierSchemaModuleSha256: shaFile(join(LIB, 'expert-218-property-review-contract.ts')),
    verifierConsistencyVersion: PROPERTY_CONSISTENCY_218_VERSION,
    verifierConsistencyModuleSha256: shaFile(join(LIB, 'expert-218-property-consistency.ts')),
    verifierPayloadVersion: VERIFIER_PAYLOAD_212_VERSION,
    verifierPayloadModuleSha256: shaFile(join(LIB, 'expert-212-verifier-payload.ts')),
    scopeContainmentVersion: SCOPE_CONTAINMENT_214_VERSION,
    scopeContainmentModuleSha256: shaFile(join(LIB, 'expert-214-scope-containment.ts')),
    propertyAuthorityVersion: PROPERTY_AUTHORITY_CONTRACT_VERSION,
    propertyAuthorityModuleSha256: shaFile(join(SRC, 'property-authority.ts')),
    settlementReviewVersion: SETTLEMENT_REVIEW_CONTRACT_VERSION,
    settlementReviewModuleSha256: shaFile(join(SRC, 'settlement-review.ts')),
    owedFactLedgerModuleSha256: shaFile(join(SRC, 'owed-fact-ledger.ts')),
    instrumentModuleSha256: shaFile(join(LIB, 'expert-221-integrated-instrument.ts')),
    assemblyVersion: ASSEMBLY_221_VERSION,
    assemblyModuleSha256: shaFile(join(LIB, 'expert-221-assembly.ts')),
    verifierLeg: verifierLegIdentities221(),
  },

  transportAccounting,

  cases: INTEGRATED_CASES_221,
  executionOrder: EXECUTION_ORDER_221,
  plannedFirstPassCalls: FP.map(x => ({
    ordinal: x.ordinal,
    caseId: x.caseId,
    analysisId: x.analysisId,
    observationSourceId: x.observationSourceId,
    systemPromptSha256: x.identities.instruction,
    userPromptSha256: x.identities.userPrompt,
    wireSchemaSha256: x.identities.schema,
    userPromptBytes: Buffer.byteLength(x.userPrompt, 'utf8'),
    governedSourceIds: x.governedRecords.map(r => r.sourceId),
  })),
  plannedVerifierCalls: INTEGRATED_CASES_221.map(c => ({
    caseId: c.caseId,
    verifierCalls: c.verifierCalls,
    condition: c.verifierCallCondition,
    note: 'the verifier user prompt cannot be frozen per call because it consumes the first pass\'s '
      + 'own declarations. The INSTRUCTION and SCHEMA identities for the leg are frozen above and '
      + 'are verified on every call.',
  })),

  callPlan: plan,
  familyCoverage: coverage,
  gateCoverage: gates,
  hardGates: INTEGRATED_HARD_GATES_221,
  hardGateRule: HARD_GATE_RULE_221,
  ambiguityRule: AMBIGUITY_RULE_221,
  defectClasses: DEFECT_CLASSES_221,
  containmentExamples: CONTAINMENT_EXAMPLES_221,
  kr1CaseScoring: KR1_CASE_SCORING_221,
  reviewPacketQualityRule: REVIEW_PACKET_QUALITY_RULE_221,
  rr7Malformation: RR7_MALFORMATION_221,
  settlementExercisesRequired: SETTLEMENT_EXERCISES_REQUIRED_221,
  correctPropertyExercise: CORRECT_PROPERTY_EXERCISE_221,
  humanJudgmentTotal: judgments,
  judgmentsFeedingEachGate: judgmentsFeedingGate221(),
  adjudicationBoundary: ADJUDICATION_BOUNDARY_221,
  adapterSupplies: ADAPTER_SUPPLIES_221,
  terminals: TERMINALS_221,
  generatedAt: '2026-09-10',
};

const json = JSON.stringify(prereg, null, 2) + '\n';
writeFileSync(join(DIR, 'INTEGRATED-PREREGISTRATION-221.json'), json);
const digest = sha(json);
writeFileSync(join(DIR, 'INTEGRATED-PREREGISTRATION-221.sha256'),
  `${digest}  INTEGRATED-PREREGISTRATION-221.json\n`);

console.log('FROZEN. digest:', digest);
console.log('cases       :', INTEGRATED_CASES_221.length,
  '| families', Object.keys(coverage).length, '| gates', INTEGRATED_HARD_GATES_221.length);
console.log('judgments   :', judgments, '(budget 50-90)');
console.log('call plan   :', `${plan.firstPassCalls} first pass + ${plan.verifierCalls} verifier`
  + ` + ${plan.contingencyCalls} contingency = ${plan.totalPlanned + plan.contingencyCalls}`
  + ` (ceiling ${MAX_PROVIDER_CALLS_221})`);
console.log('spend       : projected USD', PROJECTED_SPEND_USD_221,
  '| ceiling USD', SPEND_CEILING_USD_221);
console.log('first pass  :', FIRST_PASS_CONTRACT_210J_VERSION);
console.log('verifier    :', prereg.identities.verifierInstructionSha256.slice(0, 16) + '…',
  '/', prereg.identities.verifierSchemaSha256.slice(0, 16) + '…');
console.log('authority   :', PROPERTY_AUTHORITY_CONTRACT_VERSION, '|', KR1_STATUS);
console.log('SCHEMA RISK :', transportAccounting.firstPassSchemaAsSentBytes, 'as-sent bytes vs',
  transportAccounting.section199RefusedAtAsSentBytes, 'at the §199 refusal — canary will decide');
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
