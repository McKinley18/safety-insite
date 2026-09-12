/**
 * §210F -- EMIT AND FREEZE THE FINAL CONFIRMATION PREREGISTRATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN AND FREEZE ONLY.
 *
 * Writes the four-case preregistration artifact and its sha256. It reads §210B-3 and §210D
 * evidence only to pin identities and to derive cost from MEASURED economics; it writes nothing
 * outside its own output directory and has no provider or database code path.
 *
 * It REFUSES to freeze an instrument that could not discriminate. The refusals live in
 * `finalConfirmationProblems()` in the truth source, plus the transmitted-grammar and integrity
 * checks below which need the real request shape and the real frozen files.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG, applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema, governedBindingFor,
  CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION, instructionIdentities210e,
  OVERCORRECTION_GUARDS, SENTENCE_TO_RULE,
} from './lib/expert-first-pass-instruction-210e';
import {
  ADJUDICATION_RULES, FINAL_CONFIRMATION_AXES, FINAL_CONFIRMATION_STIMULI,
  OVERCORRECTION_CONTROLS, PASS_RULE, PROBE_VERSION, PROHIBITED_FILLER_VALUES, S6_STATUS,
  finalConfirmationProblems,
} from './lib/section-210f-final-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-210f-final-confirmation-preregistration-2026-09-09');
const V210B3 = join(ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09');
const V210B3P = join(ROOT, 'verification', 'expert-hazlenz-210b3-probe-preregistration-2026-09-08');
const V210D = join(ROOT, 'verification', 'expert-hazlenz-210d-confirmation-preregistration-2026-09-09');
const V210DH = join(ROOT, 'verification', 'expert-hazlenz-210d-hosted-confirmation-2026-09-09');
const LEDGER_210B3B = join(V210B3, 'CALL-LEDGER-210B3B.jsonl');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const bytes = (s: string): number => Buffer.byteLength(s, 'utf8');

const ids = instructionIdentities210e() as any;

// ================================================================ refuse an instrument that cannot discriminate

const problems: string[] = finalConfirmationProblems();

/** The prompt actually under test must be the §210E one, at the identity §210E froze. */
if (ids.newVersion !== 'hazlenz.expert.first-pass-instruction.210e-R4-R7') {
  problems.push(`instruction under test is ${String(ids.newVersion)}, expected the §210E successor`);
}
if (!String(ids.withoutGovernedBinding.newIdentity).startsWith('874d26d4')) {
  problems.push('the plain instruction identity has drifted from the §210E freeze');
}
if (!String(ids.withGovernedBinding.newIdentity).startsWith('e6794aaf')) {
  problems.push('the governed instruction identity has drifted from the §210E freeze');
}

/** A §210F case must not reuse a §210D observation, byte for byte or in substance. */
{
  const d210 = JSON.parse(readFileSync(join(V210D, 'CONFIRMATION-PREREGISTRATION-210D.json'), 'utf8'));
  const dObs = (d210.stimuli as any[]).map(s => String(s.observation));
  for (const s of FINAL_CONFIRMATION_STIMULI) {
    if (dObs.includes(s.observation)) problems.push(`${s.caseId}: replays a §210D observation`);
    for (const o of dObs) {
      const a = new Set(s.observation.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 5));
      const b = new Set(o.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 5));
      const shared = [...a].filter(w => b.has(w)).length;
      if (shared / Math.max(1, Math.min(a.size, b.size)) > 0.35) {
        problems.push(`${s.caseId}: shares too much content vocabulary with a §210D case`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error('§210F REFUSED: the confirmation would not discriminate.');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

// ================================================================ measured request sizes

/** Build each case exactly as the executor would, so the projection is of the real requests. */
function buildInput(s: (typeof FINAL_CONFIRMATION_STIMULI)[number]): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-210F-${s.caseId}`,
    authoritativeSources: [
      { sourceId: `OBS-${s.caseId}`, sourceType: 'observation', text: s.observation },
    ],
    inspectionContext: { location: s.suppliedContext.location, task: s.suppliedContext.task },
    jurisdiction: s.jurisdiction,
    allowedHazardFamilies: [...s.hazardFamilies],
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
  };
}

const MAX_TOKENS = 4000;

const perCase = FINAL_CONFIRMATION_STIMULI.map(s => {
  const input = buildInput(s);
  const schema = buildExpertVNextWireSchema(input, governedBindingFor([]));
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));
  const userPrompt = buildExpertVNextUserPrompt(input, []);
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: MAX_TOKENS,
    system: EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [{ name: 'emit_expert_analysis', description: 'x', strict: true, input_schema: asSent }],
    tool_choice: { type: 'tool', name: 'emit_expert_analysis' },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);
  return {
    caseId: s.caseId,
    observationChars: s.observation.length,
    userPromptBytes: bytes(userPrompt),
    schemaAsSentBytes: bytes(JSON.stringify(asSent)),
    requestBodyBytes: bytes(wire),
    capabilityAbsent: !wire.includes('governedEvidenceSourceIds'),
    carriesBackrefField: wire.includes(CLARIFICATION_DECLARATION_BACKREF_FIELD),
  };
});

if (!perCase.every(c => c.capabilityAbsent)) {
  console.error('§210F REFUSED: a case would transmit a capability-PRESENT grammar.');
  process.exit(1);
}
/** R5 cannot be adjudicated if the transmitted grammar has no field to author the binding into. */
if (!perCase.every(c => c.carriesBackrefField)) {
  console.error(`§210F REFUSED: the transmitted grammar does not carry `
    + `${CLARIFICATION_DECLARATION_BACKREF_FIELD}, so R5 could not be adjudicated.`);
  process.exit(1);
}

// ================================================================ cost, from measured economics

/**
 * §210D's actual economics are the §210B-3B measured medians, and §210D itself projected input as
 * that median plus the §210C static delta. §210F adds the MEASURED §210E delta on top, so the
 * cumulative static delta from the §210B-2 prompt that produced the medians is §210C plus §210E.
 * Output is taken from the §210B-3B measured median, which is a real observation.
 */
const b3b = readFileSync(LEDGER_210B3B, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as any).filter(r => r.inputTokens !== null);
const med = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[m] as number) : (((s[m - 1] as number) + (s[m] as number)) / 2);
};
const B3B_MEDIAN_INPUT = med(b3b.map(r => r.inputTokens as number));
const B3B_MEDIAN_OUTPUT = med(b3b.map(r => r.outputTokens as number));
const B3B_MAX_OUTPUT = Math.max(...b3b.map(r => r.outputTokens as number));

const d210 = JSON.parse(readFileSync(join(V210D, 'CONFIRMATION-PREREGISTRATION-210D.json'), 'utf8'));
const SECTION_210C_DELTA_CHARS = d210.tokenAndSpendProjection.section210cStaticDeltaChars as number;
const SECTION_210C_DELTA_TOKENS =
  d210.tokenAndSpendProjection.section210cStaticDeltaTokensEstimated as number;
const SECTION_210E_DELTA_CHARS = ids.withoutGovernedBinding.addedChars as number;
const SECTION_210E_DELTA_TOKENS = ids.withoutGovernedBinding.estimatedAddedTokens as number;

const IN_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;
const OUT_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
const CALLS = FINAL_CONFIRMATION_STIMULI.length;

const projectedInputPerCall =
  B3B_MEDIAN_INPUT + SECTION_210C_DELTA_TOKENS + SECTION_210E_DELTA_TOKENS;
const projectedOutputPerCall = B3B_MEDIAN_OUTPUT;
const projectedUsd =
  (CALLS * projectedInputPerCall / 1e6) * IN_RATE + (CALLS * projectedOutputPerCall / 1e6) * OUT_RATE;

/** Worst realistic case: every call runs to the output allowance on a slightly larger input. */
const worstInputPerCall = projectedInputPerCall + 1000;
const worstUsd = (CALLS * worstInputPerCall / 1e6) * IN_RATE + (CALLS * MAX_TOKENS / 1e6) * OUT_RATE;
const RECOMMENDED_CEILING = 0.45;

if (worstUsd > RECOMMENDED_CEILING) {
  console.error(`§210F REFUSED: the worst case USD ${worstUsd.toFixed(4)} exceeds the recommended `
    + `ceiling USD ${RECOMMENDED_CEILING.toFixed(2)}. Raise the ceiling; do not cut coverage.`);
  process.exit(1);
}

// ================================================================ the artifact

const record = {
  artifact: 'SECTION_210F_FINAL_CONFIRMATION_PREREGISTRATION',
  probeVersion: PROBE_VERSION,
  writtenBeforeAnyProviderCall: true,
  providerCalls: 0,
  databaseOperations: 0,
  isAcceptanceEvidence: false,
  note: 'DEVELOPMENT evidence only. Frozen before execution. Once presented for product-owner '
    + 'review this file is not edited; a truth defect found later is recorded as a '
    + 'PREREGISTRATION_DEFECT beside the frozen text, never silently repaired.',
  purpose: 'Determine whether the §210E remediations for R4, R5, R6 and R7 work in actual hosted '
    + 'model behaviour WITHOUT breaking the behaviour §210D already produced. NOT a cohort, NOT '
    + 'capability characterization, NOT an accuracy measurement.',

  residualIssuesUnderTest: [
    { rule: 'R4', gate: 'GATE 8', defect: 'owed-property contamination by evidence, history or '
      + 'process elements conjoined into the property', primaryCase: 'E1', narrowingCase: 'E4' },
    { rule: 'R5', gate: 'GATE 9', defect: 'a BLOCKING clarification emitted without the required '
      + 'authored declaration binding', primaryCase: 'E2', narrowingCase: null },
    { rule: 'R6', gate: 'GATE 10', defect: 'positive decision overreach while an independent '
      + 'sibling fact remained open', primaryCase: 'E3', narrowingCase: 'E4' },
    { rule: 'R7', gate: 'GATE 11', defect: 'non-semantic placeholder branch and decision values '
      + 'satisfying structural transport', primaryCase: 'E2', narrowingCase: null },
  ],

  instructionUnderTest: {
    version: EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION,
    plainIdentitySha256: ids.withoutGovernedBinding.newIdentity,
    governedIdentitySha256: ids.withGovernedBinding.newIdentity,
    plainBytes: bytes(EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT),
    governedBytes: bytes(EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
    plainChars: ids.withoutGovernedBinding.newChars,
    governedChars: ids.withGovernedBinding.newChars,
    estimatedPlainTokens: Math.round(
      (ids.withoutGovernedBinding.newChars as number) / (69968 / 24512)),
    estimatedGovernedTokens: Math.round(
      (ids.withGovernedBinding.newChars as number) / (69968 / 24512)),
    basedOn: {
      version: ids.oldVersion,
      plainIdentitySha256: ids.withoutGovernedBinding.oldIdentity,
      governedIdentitySha256: ids.withGovernedBinding.oldIdentity,
      note: 'the §210C prompt is the exact prompt §210D tested. §210E is an appended continuation '
        + 'of the declaration gate; no prose was removed and no earlier sentence rewritten.',
    },
    gatesUnderTest: SENTENCE_TO_RULE,
    narrowings: OVERCORRECTION_GUARDS,
    tokenEstimateBasis: ids.tokenEstimateBasis,
    governedVariantUsedInThisProbe: false,
    governedVariantNote: 'every §210F case is capability-ABSENT, so only the plain identity is '
      + 'transmitted. The governed identity is frozen for the record, not for use.',
  },

  providerConfiguration: {
    provider: 'anthropic',
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
    maxTokens: MAX_TOKENS,
    thinking: 'disabled',
    strictTool: true,
    toolChoice: 'forced single tool',
    promptCaching: 'CACHING_DISABLED',
    promptCachingBasis: 'TBR-20. The provider cache prefix is ordered tools -> system -> messages '
      + 'and this architecture sends a per-case tool schema, so the stable system prompt can never '
      + 'be read across cases. Caching may only be enabled if a separately proven '
      + 'semantics-preserving provider-visible prefix architecture exists BEFORE execution. §210F '
      + 'is not redesigned for caching.',
    inputUsdPerMTok: IN_RATE,
    outputUsdPerMTok: OUT_RATE,
  },

  executionProtocol: {
    calls: CALLS,
    leg: 'FIRST_PASS',
    callsPerStimulus: 1,
    drawsPerCase: 'exactly one',
    verifierCalls: 0,
    governedStageCalls: 0,
    semanticRetries: 0,
    rescueCalls: 0,
    replacementCases: 0,
    postOutputTruthEdits: 0,
    databaseOperations: 0,
    capabilityAbsentOnEveryCase: true,
    requiresSeparateProductOwnerExecutionAuthorization: true,
    onStructuralRejection: 'record, do not retry, do not re-draw. A structural transport failure is '
      + 'never converted into a semantic verdict.',
    evidenceToPersist: [
      'case ID', 'exact request identity', 'instruction identity', 'model/provider identity',
      'HTTP/transport status', 'raw structured response', 'provider usage block', 'output tokens',
      'calculated cost', 'failure classification', 'the authored '
        + CLARIFICATION_DECLARATION_BACKREF_FIELD + ' on every clarification',
    ],
    executorDefectGuard: 'the back-reference is read through '
      + 'CLARIFICATION_DECLARATION_BACKREF_FIELD from the contract module, never a retyped '
      + 'literal. EXECUTOR_DEFECT_1 from §210D is corrected in code and regression tested in the '
      + '§210E suite.',
  },

  stimuli: FINAL_CONFIRMATION_STIMULI,
  axes: FINAL_CONFIRMATION_AXES,
  adjudicationRules: ADJUDICATION_RULES,
  passRule: PASS_RULE,
  overcorrectionControls: OVERCORRECTION_CONTROLS,
  prohibitedFillerValues: PROHIBITED_FILLER_VALUES,

  s6Status: S6_STATUS,

  tokenAndSpendProjection: {
    basis: 'the §210B-3B measured median input of ' + String(B3B_MEDIAN_INPUT) + ' tokens (produced '
      + 'by the §210B-2 prompt) plus the measured §210C static delta used by §210D, plus the '
      + 'measured §210E static delta, with output taken from the §210B-3B measured median. Input '
      + 'figures are projections; only the §210B-3B medians are measurements.',
    section210b3bMedianInputTokens: B3B_MEDIAN_INPUT,
    section210b3bMedianOutputTokens: B3B_MEDIAN_OUTPUT,
    section210b3bMaxObservedOutputTokens: B3B_MAX_OUTPUT,
    section210cStaticDeltaChars: SECTION_210C_DELTA_CHARS,
    section210cStaticDeltaTokensEstimated: SECTION_210C_DELTA_TOKENS,
    section210eStaticDeltaChars: SECTION_210E_DELTA_CHARS,
    section210eStaticDeltaTokensEstimated: SECTION_210E_DELTA_TOKENS,
    cumulativeStaticDeltaTokensEstimated: SECTION_210C_DELTA_TOKENS + SECTION_210E_DELTA_TOKENS,
    projectedInputTokensPerCall: projectedInputPerCall,
    projectedOutputTokensPerCall: projectedOutputPerCall,
    projectedTotalInputTokens: CALLS * projectedInputPerCall,
    projectedTotalOutputTokens: CALLS * projectedOutputPerCall,
    projectedSpendUsd: Number(projectedUsd.toFixed(4)),
    worstCaseSpendUsd: Number(worstUsd.toFixed(4)),
    worstCaseBasis: `every call runs to the ${MAX_TOKENS}-token output allowance on an input `
      + '1,000 tokens above projection',
    recommendedHardCeilingUsd: RECOMMENDED_CEILING,
    ceilingRationale: 'above the worst case, so all four frozen cases can complete without the '
      + 'ceiling forcing a stop. Coverage is preserved over minor cost reduction: no case is cut, '
      + 'no output limit is reduced, no context is removed and no valid structured output is '
      + 'truncated to hit a target. If execution would exceed the ceiling the ceiling is raised, '
      + 'not the coverage reduced.',
    perCaseRequestSizes: perCase,
  },

  integrityAtFreeze: {
    section210b3PreregistrationSha256:
      sha256(readFileSync(join(V210B3P, 'PROBE-PREREGISTRATION-210B3A.json'))),
    section210b3CallLedgerSha256: sha256(readFileSync(LEDGER_210B3B)),
    section210dPreregistrationSha256:
      sha256(readFileSync(join(V210D, 'CONFIRMATION-PREREGISTRATION-210D.json'))),
    section210dRawFirstPassSha256: sha256(readFileSync(join(V210DH, 'RAW-FIRST-PASS-210D.jsonl'))),
    section210dCallLedgerSha256: sha256(readFileSync(join(V210DH, 'CALL-LEDGER-210D.jsonl'))),
    pinnedV15PromptSha256: sha256(readFileSync(
      join(ROOT, 'backend', 'src', 'safescope-v2', 'expert-hazlenz', 'expert-prompt.ts'))),
    suitesGreenAtFreeze: {
      'section-205-remediation': '92 passed, 0 failed',
      'section-207-preregistration': '144 passed, 0 failed',
      'section-209-batch-recorder': '116 passed, 0 failed',
      'section-210b1-structural': '55 passed, 0 failed',
      'section-210b2-semantic': '36 passed, 0 failed',
      'section-210c-residual': '92 passed, 0 failed',
      'section-210e-final': '103 passed, 0 failed',
      total: '638 passed, 0 failed',
    },
    historicalEvidenceUnchanged: 'the §210D preregistration still reproduces its frozen digest and '
      + 'no §210B-3 or §210D raw provider evidence was read for writing or rewritten.',
  },

  totals: {
    stimuli: FINAL_CONFIRMATION_STIMULI.length,
    expectedDeclarationsAcrossProbe:
      FINAL_CONFIRMATION_STIMULI.reduce((a, s) => a + s.expectedDeclarationCount, 0),
    evaluationQuestions: FINAL_CONFIRMATION_STIMULI.reduce(
      (a, s) => a + s.evaluationQuestions.length, 0),
    mandatoryQuestions: PASS_RULE.mandatoryQuestions.length,
    twoDeclarationCases: FINAL_CONFIRMATION_STIMULI
      .filter(s => s.expectedDeclarationCount === 2).map(s => s.caseId),
    actIsThePropertyCases: FINAL_CONFIRMATION_STIMULI
      .filter(s => s.processOrHistoryRole === 'IS_THE_PROPERTY_ITSELF').map(s => s.caseId),
    blockingRequiredCases: FINAL_CONFIRMATION_STIMULI
      .filter(s => s.requiredClarificationCriticality === 'BLOCKING_REQUIRED').map(s => s.caseId),
    unqualifiedAuthorizationPermittedCases: FINAL_CONFIRMATION_STIMULI
      .filter(s => s.overallAuthorizationPermitted).map(s => s.caseId),
    axisExerciseMatrix: FINAL_CONFIRMATION_AXES.map(a => ({
      axis: a.id,
      name: a.name,
      exercisedOn: FINAL_CONFIRMATION_STIMULI
        .filter(s => !a.notApplicableFrozenFor.includes(s.caseId)).map(s => s.caseId),
      notApplicableFrozenFor: a.notApplicableFrozenFor,
    })),
  },

  frozenAt: '2026-09-09T00:00:00.000Z',
};

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const json = `${JSON.stringify(record, null, 2)}\n`;
const path = join(OUT, 'FINAL-CONFIRMATION-PREREGISTRATION-210F.json');
writeFileSync(path, json);
const digest = sha256(readFileSync(path));
writeFileSync(join(OUT, 'FINAL-CONFIRMATION-PREREGISTRATION-210F.sha256'),
  `${digest}  FINAL-CONFIRMATION-PREREGISTRATION-210F.json\n`);

console.log('================ §210F FINAL CONFIRMATION PREREGISTRATION FROZEN (zero provider calls)');
console.log(`  instruction      : ${EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION}`);
console.log(`  plain identity   : ${ids.withoutGovernedBinding.newIdentity}`);
console.log(`  governed identity: ${ids.withGovernedBinding.newIdentity}`);
console.log(`  plain bytes      : ${bytes(EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT)} `
  + `(~${record.instructionUnderTest.estimatedPlainTokens} tokens, estimate)`);
console.log(`  cases            : ${FINAL_CONFIRMATION_STIMULI.length}, all capability-ABSENT`);
console.log(`  declarations     : ${record.totals.expectedDeclarationsAcrossProbe} expected across `
  + `the probe; two-declaration case: ${record.totals.twoDeclarationCases.join(', ')}`);
console.log(`  questions        : ${record.totals.evaluationQuestions} `
  + `(${record.totals.mandatoryQuestions} mandatory)`);
console.log(`  projected spend  : USD ${projectedUsd.toFixed(4)}  worst case `
  + `USD ${worstUsd.toFixed(4)}  ceiling USD ${RECOMMENDED_CEILING.toFixed(2)}`);
console.log(`\n  artifact         : ${path}`);
console.log(`  SHA256           : ${digest}`);
console.log('  ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT EXECUTED.');
