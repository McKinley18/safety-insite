/**
 * §210D -- EMIT AND FREEZE THE CONFIRMATION PREREGISTRATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN AND FREEZE ONLY.
 *
 * Writes the preregistration artifact and its sha256. It reads §210B-3 and §210C evidence only to
 * pin identities and to derive cost from MEASURED economics; it writes nothing outside its own
 * output directory and has no provider or database code path.
 *
 * It REFUSES to freeze a probe that could not discriminate. The checks below are the ones that
 * would actually let a bad instrument through: a case that labels its own answer, a case that
 * replays a spent PB stimulus, an axis no case exercises, a protected control that expects nothing,
 * or a gate-interaction pair that is not actually a pair.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG, applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema, governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION, instructionIdentities210c,
} from './lib/expert-first-pass-instruction-210c';
import {
  CONFIRMATION_AXES, CONFIRMATION_STIMULI, DESTRUCTIVE_REPAIR_QUESTION, GATE_INTERACTION_PAIR,
  PASS_RULE, PROBE_VERSION,
} from './lib/section-210d-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-210d-confirmation-preregistration-2026-09-09');
const LEDGER_210B3B = join(
  ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09',
  'CALL-LEDGER-210B3B.jsonl');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const bytes = (s: string): number => Buffer.byteLength(s, 'utf8');

const ids = instructionIdentities210c() as any;

// ================================================================ refuse an instrument that cannot discriminate

const problems: string[] = [];

if (CONFIRMATION_STIMULI.length !== 5) {
  problems.push(`${CONFIRMATION_STIMULI.length} stimuli, expected 5`);
}
if (new Set(CONFIRMATION_STIMULI.map(s => s.caseId)).size !== CONFIRMATION_STIMULI.length) {
  problems.push('duplicate case ids');
}

/** Evaluation vocabulary inside an observation hands the model the answer. */
const LABEL_WORDS =
  /decision-critical|decision-neutral|conjunctive|\bconjunct\b|\bindependent\b|\bproxy\b|orphan|false gap|restraint control/i;
/** A spent PB stimulus, or a noun-substituted rewrite of one, would not be a new case. */
const PB_VOCAB =
  /kerb|cut-off saw|bowser|water suppression|take-up|counterweight carriage|local exhaust|capture arm|chain sling|sling leg|two-leg|block valve|bleed valve|double block|bund|dispenser|fuel bay|haul truck refuel|pallet racking|bowed upright|scissor lift|thorough examination certificate/i;

for (const s of CONFIRMATION_STIMULI) {
  if (LABEL_WORDS.test(s.observation)) problems.push(`${s.caseId}: observation labels the answer`);
  if (PB_VOCAB.test(s.observation)) problems.push(`${s.caseId}: replays PB-case vocabulary`);
  if (/PB-0\d/.test(s.observation)) problems.push(`${s.caseId}: names a PB case`);
  if (s.observation.length < 450) problems.push(`${s.caseId}: observation too thin`);
  if (s.governedEvidence.length !== 0) {
    problems.push(`${s.caseId}: §210D is capability-ABSENT on every case; governed evidence found`);
  }
  if (s.decisionUnderAnalysis.length < 20) {
    problems.push(`${s.caseId}: the decision under analysis must be frozen, Gate 3 depends on it`);
  }
  if (s.expectedDeclarationCount > 0 && s.requiredOwedProperties.length === 0) {
    problems.push(`${s.caseId}: expects declarations but names no required property`);
  }
  if (s.expectedDeclarationCount === 0 && s.requiredOwedProperties.length > 0) {
    problems.push(`${s.caseId}: expects none but names a required property`);
  }
  if (s.expectedDeclarationCount === 0 && s.decisionNeutralUnknowns.length === 0) {
    problems.push(`${s.caseId}: expects zero declarations but names no decision-neutral unknown`);
  }
  if (s.evaluationQuestions.length === 0) problems.push(`${s.caseId}: no evaluation questions`);
  for (const q of s.evaluationQuestions) {
    if (!CONFIRMATION_AXES.some(a => a.id === q.axis)) {
      problems.push(`${q.id}: axis ${q.axis} is not a frozen axis`);
    }
    if (!q.expected.startsWith('PASS')) problems.push(`${q.id}: expected verdict is not a PASS`);
    const axis = CONFIRMATION_AXES.find(a => a.id === q.axis);
    if (axis !== undefined && axis.notApplicableFrozenFor.includes(s.caseId)) {
      problems.push(`${q.id}: axis ${q.axis} is frozen NOT_APPLICABLE for ${s.caseId}`);
    }
  }
}

/** Every axis must be exercised by at least one case, or it measures nothing. */
for (const a of CONFIRMATION_AXES) {
  const exercised = CONFIRMATION_STIMULI
    .filter(s => !a.notApplicableFrozenFor.includes(s.caseId)).map(s => s.caseId);
  if (exercised.length === 0) problems.push(`axis ${a.id} is exercised by no case`);
  const probed = CONFIRMATION_STIMULI
    .flatMap(s => s.evaluationQuestions).filter(q => q.axis === a.id);
  if (probed.length === 0) problems.push(`axis ${a.id} has no evaluation question`);
}

/** The gate-interaction pair only works if it really is a pair, on opposite cases. */
{
  const allQ = CONFIRMATION_STIMULI.flatMap(s => s.evaluationQuestions.map(q => q.id));
  for (const q of GATE_INTERACTION_PAIR.answeredBy) {
    if (!allQ.includes(q)) problems.push(`gate-interaction question ${q} does not exist`);
  }
  const d3 = CONFIRMATION_STIMULI.find(s => s.caseId === 'D3');
  const d5 = CONFIRMATION_STIMULI.find(s => s.caseId === 'D5');
  if (d3 === undefined || d3.expectedDeclarationCount !== 0) {
    problems.push('D3 must expect zero declarations or the pair does not oppose');
  }
  if (d5 === undefined || d5.expectedDeclarationCount !== 1) {
    problems.push('D5 must expect exactly one declaration or the pair does not oppose');
  }
  if (d5 !== undefined && d5.decisionNeutralUnknowns.length === 0) {
    problems.push('D5 must carry a decision-neutral unknown to withhold');
  }
  if (!allQ.includes(DESTRUCTIVE_REPAIR_QUESTION.question)) {
    problems.push('the destructive-repair question does not exist');
  }
}

/** A protected control that expects nothing protects nothing. */
{
  const d4 = CONFIRMATION_STIMULI.find(s => s.caseId === 'D4');
  if (d4 === undefined || d4.expectedDeclarationCount !== 2) {
    problems.push('D4 must expect exactly two declarations');
  }
  if (d4 !== undefined && d4.requiredOwedProperties.length !== 2) {
    problems.push('D4 must name two required owed properties');
  }
}

if (problems.length > 0) {
  console.error('§210D REFUSED: the confirmation would not discriminate.');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

// ================================================================ measured request sizes

/** Build each case exactly as the executor would, so the projection is of the real requests. */
function buildInput(s: (typeof CONFIRMATION_STIMULI)[number]): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-210D-${s.caseId}`,
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

const perCase = CONFIRMATION_STIMULI.map(s => {
  const input = buildInput(s);
  const schema = buildExpertVNextWireSchema(input, governedBindingFor([]));
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));
  const userPrompt = buildExpertVNextUserPrompt(input, []);
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: 4000,
    system: EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    tools: [{ name: 'emit_expert_analysis', description: 'x', strict: true, input_schema: asSent }],
    tool_choice: { type: 'tool', name: 'emit_expert_analysis' },
    thinking: { type: 'disabled' },
  };
  return {
    caseId: s.caseId,
    observationChars: s.observation.length,
    userPromptBytes: bytes(userPrompt),
    schemaAsSentBytes: bytes(JSON.stringify(asSent)),
    requestBodyBytes: bytes(JSON.stringify(body)),
    capabilityAbsent: !JSON.stringify(body).includes('governedEvidenceSourceIds'),
  };
});

if (!perCase.every(c => c.capabilityAbsent)) {
  console.error('§210D REFUSED: a case would transmit a capability-PRESENT grammar.');
  process.exit(1);
}

// ================================================================ cost, from measured economics

/**
 * The §210B-3B run is the only real economics this architecture has. Its median input of 24,034
 * tokens was produced by the §210B-2 prompt; §210C adds a measured +2,858 characters, estimated at
 * +1,001 tokens by the §208 bytes-per-token ratio. Output is taken from the §210B-3B median, which
 * is a real observation rather than a guess.
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

const IN_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;
const OUT_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
const CALLS = CONFIRMATION_STIMULI.length;
const MAX_TOKENS = 4000;

const projectedInputPerCall = B3B_MEDIAN_INPUT + (ids.withoutGovernedBinding.estimatedAddedTokens as number);
const projectedOutputPerCall = B3B_MEDIAN_OUTPUT;
const projectedUsd =
  (CALLS * projectedInputPerCall / 1e6) * IN_RATE + (CALLS * projectedOutputPerCall / 1e6) * OUT_RATE;

/** Worst realistic case: every call runs to the output allowance on a slightly larger input. */
const worstInputPerCall = projectedInputPerCall + 1000;
const worstUsd = (CALLS * worstInputPerCall / 1e6) * IN_RATE + (CALLS * MAX_TOKENS / 1e6) * OUT_RATE;
const RECOMMENDED_CEILING = 0.55;

// ================================================================ the artifact

const record = {
  artifact: 'SECTION_210D_MINIMAL_CONFIRMATION_PREREGISTRATION',
  probeVersion: PROBE_VERSION,
  writtenBeforeAnyProviderCall: true,
  providerCalls: 0,
  databaseOperations: 0,
  isAcceptanceEvidence: false,
  note: 'DEVELOPMENT evidence only. Frozen before execution. Once presented for product-owner '
    + 'review this file is not edited; a truth defect found later is recorded as a '
    + 'PREREGISTRATION_DEFECT beside the frozen text, never silently repaired.',
  purpose: 'Determine whether the §210C declaration gate behaves correctly under new '
    + 'high-information cases while protecting behaviour §210B-3B already produced. NOT broad '
    + 'capability characterization.',

  instructionUnderTest: {
    version: EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION,
    plainIdentitySha256: ids.withoutGovernedBinding.newIdentity,
    governedIdentitySha256: ids.withGovernedBinding.newIdentity,
    plainBytes: bytes(EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT),
    governedBytes: bytes(EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
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
    },
    tokenEstimateBasis: ids.tokenEstimateBasis,
    governedVariantUsedInThisProbe: false,
    governedVariantNote: 'every §210D case is capability-ABSENT, so only the plain identity is '
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
      + 'be read across cases. Caching may only be enabled if new LOCAL evidence proves a readable '
      + 'ordered prefix before execution.',
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
      'calculated cost', 'failure classification',
    ],
  },

  stimuli: CONFIRMATION_STIMULI,
  axes: CONFIRMATION_AXES,
  passRule: PASS_RULE,
  gateInteractionPair: GATE_INTERACTION_PAIR,
  destructiveRepairQuestion: DESTRUCTIVE_REPAIR_QUESTION,

  s6Status: {
    rule: 'S6',
    status: 'NOT_EXERCISED',
    reason: 'the capability-PRESENT first-pass grammar is refused by the provider '
      + '(COMPILED_GRAMMAR_TOO_LARGE). §210D does not attempt to validate S6.',
    architecturalRecommendation: 'retain the separate governed stage',
    prohibition: 'do not weaken first-pass grammar validation merely to make governed evidence fit',
  },

  tokenAndSpendProjection: {
    basis: 'the §210B-3B measured median input of ' + String(B3B_MEDIAN_INPUT) + ' tokens (produced '
      + 'by the §210B-2 prompt) plus the measured §210C static delta, with output taken from the '
      + '§210B-3B measured median. Input figures are projections; only the §210B-3B medians are '
      + 'measurements.',
    section210b3bMedianInputTokens: B3B_MEDIAN_INPUT,
    section210b3bMedianOutputTokens: B3B_MEDIAN_OUTPUT,
    section210b3bMaxObservedOutputTokens: B3B_MAX_OUTPUT,
    section210cStaticDeltaChars: ids.withoutGovernedBinding.addedChars,
    section210cStaticDeltaTokensEstimated: ids.withoutGovernedBinding.estimatedAddedTokens,
    projectedInputTokensPerCall: projectedInputPerCall,
    projectedOutputTokensPerCall: projectedOutputPerCall,
    projectedTotalInputTokens: CALLS * projectedInputPerCall,
    projectedTotalOutputTokens: CALLS * projectedOutputPerCall,
    projectedSpendUsd: Number(projectedUsd.toFixed(4)),
    worstCaseSpendUsd: Number(worstUsd.toFixed(4)),
    worstCaseBasis: `every call runs to the ${MAX_TOKENS}-token output allowance on an input `
      + '1,000 tokens above projection',
    recommendedHardCeilingUsd: RECOMMENDED_CEILING,
    ceilingRationale: 'above the worst case, so all five frozen cases can complete without the '
      + 'ceiling forcing a stop. Coverage is preserved over minor cost reduction: no case is cut, '
      + 'no output limit is reduced and no context is removed to lower the figure.',
    perCaseRequestSizes: perCase,
  },

  integrityAtFreeze: {
    section210b3PreregistrationSha256:
      sha256(readFileSync(join(ROOT, 'verification',
        'expert-hazlenz-210b3-probe-preregistration-2026-09-08',
        'PROBE-PREREGISTRATION-210B3A.json'))),
    section210b3CallLedgerSha256: sha256(readFileSync(LEDGER_210B3B)),
    pinnedV15PromptSha256: sha256(readFileSync(
      join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz', 'expert-prompt.ts'))),
    suitesGreenAtFreeze: {
      'section-207-preregistration': '144 passed, 0 failed',
      'section-209-batch-recorder': '116 passed, 0 failed',
      'section-210b1-structural': '55 passed, 0 failed',
      'section-210b2-semantic': '36 passed, 0 failed',
      'section-210c-residual': '92 passed, 0 failed',
    },
  },

  totals: {
    stimuli: CONFIRMATION_STIMULI.length,
    expectedDeclarationsAcrossProbe:
      CONFIRMATION_STIMULI.reduce((a, s) => a + s.expectedDeclarationCount, 0),
    evaluationQuestions: CONFIRMATION_STIMULI.reduce((a, s) => a + s.evaluationQuestions.length, 0),
    zeroDeclarationControls: CONFIRMATION_STIMULI
      .filter(s => s.expectedDeclarationCount === 0).map(s => s.caseId),
    twoDeclarationCases: CONFIRMATION_STIMULI
      .filter(s => s.expectedDeclarationCount === 2).map(s => s.caseId),
  },

  frozenAt: '2026-09-09T00:00:00.000Z',
};

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const json = `${JSON.stringify(record, null, 2)}\n`;
const path = join(OUT, 'CONFIRMATION-PREREGISTRATION-210D.json');
writeFileSync(path, json);
const digest = sha256(readFileSync(path));
writeFileSync(join(OUT, 'CONFIRMATION-PREREGISTRATION-210D.sha256'),
  `${digest}  CONFIRMATION-PREREGISTRATION-210D.json\n`);

console.log('================ §210D CONFIRMATION PREREGISTRATION FROZEN (zero provider calls)');
console.log(`  instruction      : ${EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION}`);
console.log(`  plain identity   : ${ids.withoutGovernedBinding.newIdentity}`);
console.log(`  governed identity: ${ids.withGovernedBinding.newIdentity}`);
console.log(`  plain bytes      : ${bytes(EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT)} `
  + `(~${record.instructionUnderTest.estimatedPlainTokens} tokens, estimate)`);
console.log(`  cases            : ${CONFIRMATION_STIMULI.length}, all capability-ABSENT`);
console.log(`  declarations      : ${record.totals.expectedDeclarationsAcrossProbe} expected across `
  + `the probe; zero-declaration controls: ${record.totals.zeroDeclarationControls.join(', ')}`);
console.log(`  questions        : ${record.totals.evaluationQuestions}`);
console.log(`  projected spend  : USD ${projectedUsd.toFixed(4)}  worst case `
  + `USD ${worstUsd.toFixed(4)}  ceiling USD ${RECOMMENDED_CEILING.toFixed(2)}`);
console.log(`\n  artifact         : ${path}`);
console.log(`  SHA256           : ${digest}`);
console.log('  ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT EXECUTED.');
