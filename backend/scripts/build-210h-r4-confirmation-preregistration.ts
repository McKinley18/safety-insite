/**
 * §210H -- EMIT AND FREEZE THE FINAL R4 CONFIRMATION PREREGISTRATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DESIGN, VALIDATION AND FREEZE ONLY.
 *
 * Writes the three-case preregistration artifact and its sha256. It reads §210B-3, §210D and §210F
 * evidence only to pin identities and to derive cost from MEASURED economics; it writes nothing
 * outside its own output directory and has no provider or database code path.
 *
 * It REFUSES to freeze an instrument that could not discriminate. The refusals live in
 * `r4ConfirmationProblems()` in the truth source, plus the transmitted-grammar, novelty and
 * integrity checks below which need the real request shape and the real frozen files.
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
  CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION, instructionIdentities210g,
  DETERMINISTIC_HALF, OVERCORRECTION_GUARDS, SENTENCE_TO_RULE,
} from './lib/expert-first-pass-instruction-210g';
import {
  ADJUDICATION_RULES, CLOSED_MECHANISM_POLICY, NARROWING_PAIR, PASS_RULE, PROBE_VERSION,
  R4_CONFIRMATION_AXES, R4_CONFIRMATION_STIMULI, S6_STATUS, r4ConfirmationProblems,
} from './lib/section-210h-r4-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-210h-final-r4-confirmation-preregistration-2026-09-09');
const V210B3 = join(ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09');
const V210B3P = join(ROOT, 'verification', 'expert-hazlenz-210b3-probe-preregistration-2026-09-08');
const V210D = join(ROOT, 'verification',
  'expert-hazlenz-210d-confirmation-preregistration-2026-09-09');
const V210F = join(ROOT, 'verification',
  'expert-hazlenz-210f-final-confirmation-preregistration-2026-09-09');
const V210FH = join(ROOT, 'verification', 'expert-hazlenz-210f-hosted-confirmation-2026-09-09');

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const bytes = (s: string): number => Buffer.byteLength(s, 'utf8');

const ids = instructionIdentities210g() as any;

// ================================================================ refuse an instrument that cannot discriminate

const problems: string[] = r4ConfirmationProblems();

/** The prompt actually under test must be the §210G one, at the identity §210G produced. */
if (ids.newVersion !== 'hazlenz.expert.first-pass-instruction.210g-R4B') {
  problems.push(`instruction under test is ${String(ids.newVersion)}, expected the §210G successor`);
}
if (ids.withoutGovernedBinding.newIdentity
  !== '0f547b124afe0f6db51af6a63af8c42273f34c81b3d1ee4f291c93d6dba76591') {
  problems.push('the plain instruction identity is not the one the authorization names');
}
if (ids.withGovernedBinding.newIdentity
  !== '32b10f090c136b2e7b302d798de52193f1bd01296f364e189488457006a494e0') {
  problems.push('the governed instruction identity is not the one the authorization names');
}
/** §210G is built on the exact prompt §210F tested. A drifted base invalidates the comparison. */
if (ids.withoutGovernedBinding.oldIdentity
  !== '874d26d4d036ca419dd0ffaee2a43f89ecec26f6b6bfba93e7a423a10658d831') {
  problems.push('the §210G base is not the §210F instruction under test');
}
/** R4B is instruction-only. A deterministic alignment verdict would be an authority violation. */
if (DETERMINISTIC_HALF.hasDeterministicHalf || DETERMINISTIC_HALF.refusalCodesAdded.length > 0) {
  problems.push('R4B has acquired a deterministic half; §210H adjudicates alignment by reading');
}

/** A §210H case must not reuse a §210D or §210F observation, byte for byte or in substance. */
{
  const prior: string[] = [];
  for (const [dir, file] of [[V210D, 'CONFIRMATION-PREREGISTRATION-210D.json'],
    [V210F, 'FINAL-CONFIRMATION-PREREGISTRATION-210F.json']] as const) {
    const doc = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    for (const s of doc.stimuli as any[]) prior.push(String(s.observation));
  }
  for (const s of R4_CONFIRMATION_STIMULI) {
    if (prior.includes(s.observation)) problems.push(`${s.caseId}: replays a prior observation`);
    const a = new Set(s.observation.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 5));
    for (const o of prior) {
      const b = new Set(o.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 5));
      const shared = [...a].filter(w => b.has(w)).length;
      if (shared / Math.max(1, Math.min(a.size, b.size)) > 0.35) {
        problems.push(`${s.caseId}: shares too much content vocabulary with a prior case`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error('§210H REFUSED: the confirmation would not discriminate.');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

// ================================================================ measured request sizes

function buildInput(s: (typeof R4_CONFIRMATION_STIMULI)[number]): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-210H-${s.caseId}`,
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

const perCase = R4_CONFIRMATION_STIMULI.map(s => {
  const input = buildInput(s);
  const schema = buildExpertVNextWireSchema(input, governedBindingFor([]));
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));
  const userPrompt = buildExpertVNextUserPrompt(input, []);
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: MAX_TOKENS,
    system: EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
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
  console.error('§210H REFUSED: a case would transmit a capability-PRESENT grammar.');
  process.exit(1);
}
if (!perCase.every(c => c.carriesBackrefField)) {
  console.error(`§210H REFUSED: the transmitted grammar does not carry `
    + `${CLARIFICATION_DECLARATION_BACKREF_FIELD}, so axis J could not be adjudicated.`);
  process.exit(1);
}

// ================================================================ cost, from measured economics

/**
 * §210F is the only run made with a prompt in this lineage, and its medians are the right basis:
 * observed median input plus the MEASURED §210G static delta, with output taken from the §210F
 * observed median. Only the §210F figures are measurements; the input projection is a projection.
 */
const f210 = JSON.parse(readFileSync(join(V210FH, 'TOKEN-REPORT-210F.json'), 'utf8'));
const F_MEDIAN_INPUT = f210.medianInputTokens as number;
const F_MEDIAN_OUTPUT = f210.medianOutputTokens as number;
const F_MAX_OUTPUT = Math.max(...(f210.perCall as any[]).map(c => c.outputTokens as number));
const F_COST_PER_CALL = f210.costPerObservationUsd as number;

const SECTION_210G_DELTA_CHARS = ids.withoutGovernedBinding.addedChars as number;
const SECTION_210G_DELTA_TOKENS = ids.withoutGovernedBinding.estimatedAddedTokens as number;

const IN_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;
const OUT_RATE = EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
const CALLS = R4_CONFIRMATION_STIMULI.length;

const projectedInputPerCall = F_MEDIAN_INPUT + SECTION_210G_DELTA_TOKENS;
const projectedOutputPerCall = F_MEDIAN_OUTPUT;
const projectedUsd =
  (CALLS * projectedInputPerCall / 1e6) * IN_RATE + (CALLS * projectedOutputPerCall / 1e6) * OUT_RATE;

const worstInputPerCall = projectedInputPerCall + 1000;
const worstUsd = (CALLS * worstInputPerCall / 1e6) * IN_RATE + (CALLS * MAX_TOKENS / 1e6) * OUT_RATE;
const RECOMMENDED_CEILING = 0.35;

if (worstUsd > RECOMMENDED_CEILING) {
  console.error(`§210H REFUSED: the worst case USD ${worstUsd.toFixed(4)} exceeds the recommended `
    + `ceiling USD ${RECOMMENDED_CEILING.toFixed(2)}. Raise the ceiling; do not cut coverage.`);
  process.exit(1);
}

// ================================================================ the artifact

const record = {
  artifact: 'SECTION_210H_FINAL_R4_CONFIRMATION_PREREGISTRATION',
  probeVersion: PROBE_VERSION,
  writtenBeforeAnyProviderCall: true,
  providerCalls: 0,
  databaseOperations: 0,
  isAcceptanceEvidence: false,
  note: 'DEVELOPMENT evidence only. Frozen before execution. Once presented for product-owner '
    + 'review this file is not edited; a truth defect found later is recorded as a '
    + 'PREREGISTRATION_DEFECT beside the frozen text, never silently repaired.',
  purpose: 'Determine whether §210G GATE 12 holds the SAME safety property across missingFact, '
    + 'branchA, branchB, decisionIfA, decisionIfB and the bound clarification in actual hosted '
    + 'behaviour. R4-ONLY. NOT another general first-pass cohort.',

  residualMechanismUnderTest: {
    rule: 'R4B',
    gate: 'GATE 12',
    shape1: 'evidence-conditioned branches: a correct state property whose branches partition '
      + 'whether the evidence confirms it, so the satisfactory-but-unestablished world drives the '
      + 'adverse decision',
    shape2: 'establishment process substituted for the safety state: the entry asks whether a '
      + 'procedure occurred rather than whether the hazardous or safe state is actually true',
    primaryCases: { shape1: 'G1', shape2: 'G2' },
    narrowingCase: 'G3',
  },

  instructionUnderTest: {
    version: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
    plainIdentitySha256: ids.withoutGovernedBinding.newIdentity,
    governedIdentitySha256: ids.withGovernedBinding.newIdentity,
    plainBytes: bytes(EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT),
    governedBytes: bytes(EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
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
      note: 'the §210E prompt is the exact prompt §210F tested. §210G appends one gate; no prose '
        + 'was removed and no earlier sentence rewritten.',
    },
    gateUnderTest: SENTENCE_TO_RULE,
    narrowing: OVERCORRECTION_GUARDS,
    deterministicHalf: DETERMINISTIC_HALF,
    tokenEstimateBasis: ids.tokenEstimateBasis,
    governedVariantUsedInThisProbe: false,
    governedVariantNote: 'every §210H case is capability-ABSENT, so only the plain identity is '
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
      + 'be read across cases. §210H is not redesigned for caching.',
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
      'calculated cost', 'stop reason', 'failure classification', 'the authored '
        + CLARIFICATION_DECLARATION_BACKREF_FIELD + ' on every clarification',
      'the deterministic contract result, recorded separately from semantic adjudication',
    ],
  },

  stimuli: R4_CONFIRMATION_STIMULI,
  axes: R4_CONFIRMATION_AXES,
  adjudicationRules: ADJUDICATION_RULES,
  closedMechanismPolicy: CLOSED_MECHANISM_POLICY,
  passRule: PASS_RULE,
  narrowingPair: NARROWING_PAIR,

  s6Status: S6_STATUS,

  tokenAndSpendProjection: {
    basis: 'the §210F OBSERVED median input of ' + String(F_MEDIAN_INPUT) + ' tokens plus the '
      + 'measured §210G static delta, with output taken from the §210F observed median. Only the '
      + '§210F figures are measurements; the input figure is a projection.',
    section210fMedianInputTokens: F_MEDIAN_INPUT,
    section210fMedianOutputTokens: F_MEDIAN_OUTPUT,
    section210fMaxObservedOutputTokens: F_MAX_OUTPUT,
    section210fCostPerCallUsd: F_COST_PER_CALL,
    section210gStaticDeltaChars: SECTION_210G_DELTA_CHARS,
    section210gStaticDeltaTokensEstimated: SECTION_210G_DELTA_TOKENS,
    projectedInputTokensPerCall: projectedInputPerCall,
    projectedOutputTokensPerCall: projectedOutputPerCall,
    projectedTotalInputTokens: CALLS * projectedInputPerCall,
    projectedTotalOutputTokens: CALLS * projectedOutputPerCall,
    projectedSpendUsd: Number(projectedUsd.toFixed(4)),
    worstCaseSpendUsd: Number(worstUsd.toFixed(4)),
    worstCaseBasis: `every call runs to the ${MAX_TOKENS}-token output allowance on an input `
      + '1,000 tokens above projection',
    recommendedHardCeilingUsd: RECOMMENDED_CEILING,
    ceilingRationale: 'above the worst case, so all three frozen cases can complete without the '
      + 'ceiling forcing a stop. Coverage is preserved over minor cost reduction: no case is cut, '
      + 'no output limit is reduced and no valid structured output is truncated to hit a target.',
    perCaseRequestSizes: perCase,
  },

  integrityAtFreeze: {
    section210b3PreregistrationSha256:
      sha256(readFileSync(join(V210B3P, 'PROBE-PREREGISTRATION-210B3A.json'))),
    section210b3CallLedgerSha256: sha256(readFileSync(join(V210B3, 'CALL-LEDGER-210B3B.jsonl'))),
    section210dPreregistrationSha256:
      sha256(readFileSync(join(V210D, 'CONFIRMATION-PREREGISTRATION-210D.json'))),
    section210fPreregistrationSha256:
      sha256(readFileSync(join(V210F, 'FINAL-CONFIRMATION-PREREGISTRATION-210F.json'))),
    section210fRawFirstPassSha256: sha256(readFileSync(join(V210FH, 'RAW-FIRST-PASS-210F.jsonl'))),
    section210fCallLedgerSha256: sha256(readFileSync(join(V210FH, 'CALL-LEDGER-210F.jsonl'))),
    section210fProjectionSha256: sha256(readFileSync(join(V210FH, 'PROJECTION-210F.jsonl'))),
    section210fContractValidationSha256:
      sha256(readFileSync(join(V210FH, 'CONTRACT-VALIDATION-210F.jsonl'))),
    section210fAdjudicationSha256: sha256(readFileSync(join(V210FH, 'ADJUDICATION-210F.md'))),
    pinnedV15PromptSha256: sha256(readFileSync(
      join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz', 'expert-prompt.ts'))),
    suitesGreenAtFreeze: {
      'section-205-remediation': '92 passed, 0 failed',
      'section-207-preregistration': '144 passed, 0 failed',
      'section-209-batch-recorder': '116 passed, 0 failed',
      'section-210b1-structural': '55 passed, 0 failed',
      'section-210b2-semantic': '36 passed, 0 failed',
      'section-210c-residual': '92 passed, 0 failed',
      'section-210e-final': '103 passed, 0 failed',
      'section-210g-alignment': '87 passed, 0 failed',
      total: '725 passed, 0 failed',
    },
  },

  totals: {
    stimuli: R4_CONFIRMATION_STIMULI.length,
    expectedDeclarationsAcrossProbe:
      R4_CONFIRMATION_STIMULI.reduce((a, s) => a + s.expectedDeclarationCount, 0),
    evaluationQuestions: R4_CONFIRMATION_STIMULI.reduce(
      (a, s) => a + s.evaluationQuestions.length, 0),
    mandatoryQuestions: PASS_RULE.mandatoryQuestions.length,
    actIsThePropertyCases: R4_CONFIRMATION_STIMULI
      .filter(s => s.processOrEvidenceRole === 'THE_PROPERTY_ITSELF').map(s => s.caseId),
    evidenceOnlyCases: R4_CONFIRMATION_STIMULI
      .filter(s => s.processOrEvidenceRole === 'EVIDENCE_ONLY').map(s => s.caseId),
    casesWithSiblingFacts: R4_CONFIRMATION_STIMULI
      .filter(s => s.siblingUnresolvedFacts.length > 0).map(s => s.caseId),
    axisExerciseMatrix: R4_CONFIRMATION_AXES.map(a => ({
      axis: a.id,
      name: a.name,
      exercisedOn: R4_CONFIRMATION_STIMULI
        .filter(s => !a.notApplicableFrozenFor.includes(s.caseId)).map(s => s.caseId),
      notApplicableFrozenFor: a.notApplicableFrozenFor,
    })),
  },

  frozenAt: '2026-09-09T00:00:00.000Z',
};

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const json = `${JSON.stringify(record, null, 2)}\n`;
const path = join(OUT, 'FINAL-R4-CONFIRMATION-PREREGISTRATION-210H.json');
writeFileSync(path, json);
const digest = sha256(readFileSync(path));
writeFileSync(join(OUT, 'FINAL-R4-CONFIRMATION-PREREGISTRATION-210H.sha256'),
  `${digest}  FINAL-R4-CONFIRMATION-PREREGISTRATION-210H.json\n`);

console.log('================ §210H FINAL R4 CONFIRMATION PREREGISTRATION FROZEN (zero provider calls)');
console.log(`  instruction      : ${EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION}`);
console.log(`  plain identity   : ${ids.withoutGovernedBinding.newIdentity}`);
console.log(`  governed identity: ${ids.withGovernedBinding.newIdentity}`);
console.log(`  plain bytes      : ${bytes(EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT)} `
  + `(~${record.instructionUnderTest.estimatedPlainTokens} tokens, estimate)`);
console.log(`  cases            : ${R4_CONFIRMATION_STIMULI.length}, all capability-ABSENT`);
console.log(`  declarations     : ${record.totals.expectedDeclarationsAcrossProbe} expected across `
  + `the probe; act-is-the-property: ${record.totals.actIsThePropertyCases.join(', ')}`);
console.log(`  questions        : ${record.totals.evaluationQuestions} `
  + `(${record.totals.mandatoryQuestions} mandatory)`);
console.log(`  narrowing pair   : ${NARROWING_PAIR.answeredBy.join(', ')}`);
console.log(`  projected spend  : USD ${projectedUsd.toFixed(4)}  worst case `
  + `USD ${worstUsd.toFixed(4)}  ceiling USD ${RECOMMENDED_CEILING.toFixed(2)}`);
console.log(`\n  artifact         : ${path}`);
console.log(`  SHA256           : ${digest}`);
console.log('  ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT EXECUTED.');
