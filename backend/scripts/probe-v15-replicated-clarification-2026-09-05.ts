/**
 * §179 — BOUNDED REPLICATED HOSTED DEVELOPMENT VALIDATION OF FROZEN v15 CLARIFICATION BEHAVIOUR.
 *
 * THIRTY executions: the frozen ten-row balanced instrument, THREE replicates per row, at ONE
 * frozen prompt/provider identity. Development validation only — not acceptance, not production
 * validation, not customer activation, and not a causal v14 -> v15 treatment effect, because no
 * replicated v14 comparator exists.
 *
 * ==================== WHY REPLICATES, AND WHAT THEY BUY ====================
 *
 * §175 and §177 each executed ONE sample per row. Between them exactly one row differed, and that
 * design cannot separate a prompt effect from sampling variance — which is why
 * PRECISION_IMPROVEMENT_CAUSALLY_ESTABLISHED stands at FALSE against an otherwise attractive 5/5.
 * Three executions per row give every row a RATE instead of a coin flip. A row whose replicates
 * disagree is reported as disagreeing; it is never voted into a clean pass.
 *
 * ==================== WHAT THIS SCRIPT SCORES, AND WHAT IT REFUSES TO SCORE ====================
 *
 * SILENCE executions are scored EXACTLY and MECHANICALLY: frozen truth owes nothing on those rows,
 * so any clarification emitted there is a failure by definition. A contract failure or a rejected
 * normalization is NEVER counted as silence — the model may have asked a good question the payload
 * made unreadable.
 *
 * REQUIRED executions are scored only to a BOUND. Whether a question addresses the material owed
 * fact is a human semantic judgement; the frozen §174 record carries MATERIAL_UNRESOLVED_FACTS =
 * null on all ten rows, and §169 established that a question can name the right fact and still not
 * resolve it. So this script computes REQUIRED_RECALL_LOOSE and stops. Every emitted clarification
 * is exported verbatim, PER EXECUTION, for independent human adjudication. This model does not
 * decide strict recall and must not.
 *
 * ==================== ORDER ====================
 *
 * Row-consecutive execution (HR-01 x3, HR-02 x3, ...) is refused: it puts each row's replicates
 * adjacent in time. The order is three interleaved blocks, each a deterministic shuffle of the ten
 * rows seeded from the frozen v15 prompt hash, with a recorded deterministic repair if a block
 * boundary would repeat a row. Every row occurs exactly three times, no row occurs twice
 * consecutively, and the whole order is frozen in the preregistration BEFORE the first call.
 *
 * ==================== SAFETY PROPERTIES ====================
 *
 *   - PROSPECTIVE spend enforcement at the frozen worst case, checked BEFORE each request.
 *   - Frozen instrument, truth and v15 identity verified before the first request; any mismatch
 *     aborts before spend.
 *   - Retries count against the hard cap. Retry policy is ZERO retries.
 *   - fsync-backed append-only run records, read back from disk after the run.
 *   - Raw provider output persisted on the record BEFORE any figure is derived from it.
 *   - The credential is read from the environment and NEVER logged, returned or persisted.
 *
 * MODES:  --dry-run   compute and print the order and preregistration, write nothing, call nothing
 *         --freeze    write the preregistration, call nothing
 *         (default)   verify the frozen preregistration still matches, then execute
 */

import {
  existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync,
} from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/** Minimal credential path. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED. */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const key = s.slice(0, s.indexOf('=')).trim().replace(/^export\s+/, '');
    const value = s.slice(s.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(join(__dirname, '..', '.env'));

import {
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpertAnalysisInputFromAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-input-constructor';
import {
  EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION, expertPromptIdentity,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { MultiHazardDecompositionService } from '../src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service';
// The REAL derivation and the REAL frozen-row loader from the §175/§177 harness. Reused rather than
// reimplemented: a new copy would be a second thing to get wrong, and the §175 attempt-1 void is
// exactly what happens when the scoring path is not the path that was proven.
import {
  deriveRowRecord, analysisStateFor, loadFrozenRows,
} from './probe-balanced-clarification-hosted-2026-09-05';

const ROOT = join(__dirname, '..', '..');
/** §179 writes to its OWN directory. §175 and §177 evidence is immutable and untouched. */
const EVID = join(ROOT, 'verification', 'expert-hazlenz-v15-replicated-clarification-validation-2026-09-05');

export const EXECUTIONS_PER_ROW = 3;
export const PLANNED_INVOCATIONS = 30;
export const CALL_CEILING = 36;
export const SPEND_CEILING_USD = 3.00;
export const RETRIES = 0;
/** Frozen worst case: full 8000 output tokens plus a generous input allowance, priced at config. */
const WORST_CASE_USD = (8000 / 1e6) * 10 + (12000 / 1e6) * 2;

/** The §178 identity this run is authorized against. A mismatch aborts before any spend. */
const FROZEN_V15 = {
  promptVersion: 'hazlenz.expert.prompt.v15',
  systemPromptSha256: '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979',
  promptFileSha256: 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
};

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------- deterministic execution order

/** mulberry32 — a small, fully deterministic PRNG. Same seed, same sequence, on any machine. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Three interleaved blocks. Each block is a Fisher-Yates shuffle of all ten row ids under a PRNG
 * seeded from the frozen v15 prompt hash, so the order is reproducible from the identity itself and
 * was not chosen by looking at anything. If a block would open with the row the previous block
 * closed on, the block is rotated left by one position and re-checked — a deterministic repair,
 * recorded here rather than applied by hand.
 */
export function buildExecutionOrder(rowIds: string[], seedHex: string): Array<{
  sequencePosition: number; rowId: string; replicateNumber: number; block: number; rotatedBy: number;
}> {
  const rng = mulberry32(parseInt(seedHex.slice(0, 8), 16));
  const order: Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number; rotatedBy: number }> = [];
  const replicateSoFar = new Map<string, number>(rowIds.map(id => [id, 0]));

  for (let block = 1; block <= EXECUTIONS_PER_ROW; block += 1) {
    const b = [...rowIds];
    for (let i = b.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    let rotatedBy = 0;
    while (order.length > 0 && b[0] === order[order.length - 1].rowId) {
      b.push(b.shift() as string);
      rotatedBy += 1;
      if (rotatedBy > b.length) throw new Error('ABORT: could not separate block boundary');
    }
    for (const rowId of b) {
      const n = (replicateSoFar.get(rowId) ?? 0) + 1;
      replicateSoFar.set(rowId, n);
      order.push({ sequencePosition: order.length + 1, rowId, replicateNumber: n, block, rotatedBy });
    }
  }
  return order;
}

/** The order constraints, asserted rather than assumed. Called before the preregistration is written. */
export function validateExecutionOrder(
  order: Array<{ rowId: string; replicateNumber: number }>, rowIds: string[],
): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  if (order.length !== rowIds.length * EXECUTIONS_PER_ROW) {
    problems.push(`length ${order.length}, expected ${rowIds.length * EXECUTIONS_PER_ROW}`);
  }
  for (const id of rowIds) {
    const n = order.filter(o => o.rowId === id).length;
    if (n !== EXECUTIONS_PER_ROW) problems.push(`${id} occurs ${n} times, expected ${EXECUTIONS_PER_ROW}`);
    const reps = order.filter(o => o.rowId === id).map(o => o.replicateNumber).sort();
    if (reps.join(',') !== [1, 2, 3].join(',')) problems.push(`${id} replicate numbers ${reps.join(',')}`);
  }
  for (let i = 1; i < order.length; i += 1) {
    if (order[i].rowId === order[i - 1].rowId) problems.push(`row repeats consecutively at position ${i + 1}`);
  }
  return { ok: problems.length === 0, problems };
}

// ---------------------------------------------------------------- main

const decomposer = new MultiHazardDecompositionService();

async function main(): Promise<void> {
  const dry = process.argv.includes('--dry-run');
  const freezeOnly = process.argv.includes('--freeze');

  // ---- GATE: the live tree must still be the frozen §178 identity
  const promptFileSha = shaFile(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts'));
  const systemPromptSha = sha(EXPERT_SYSTEM_PROMPT);
  if (EXPERT_PROMPT_VERSION !== FROZEN_V15.promptVersion) {
    throw new Error(`ABORT before spend: prompt version ${EXPERT_PROMPT_VERSION}, expected ${FROZEN_V15.promptVersion}`);
  }
  if (systemPromptSha !== FROZEN_V15.systemPromptSha256) {
    throw new Error(`ABORT before spend: SYSTEM_PROMPT_SHA256 ${systemPromptSha}`);
  }
  if (promptFileSha !== FROZEN_V15.promptFileSha256) {
    throw new Error(`ABORT before spend: prompt file hash ${promptFileSha} — a §178 edit occurred after the recorded v15 hash`);
  }

  mkdirSync(EVID, { recursive: true });
  const rows = loadFrozenRows(); // verifies the frozen packet, truth record and all ten row texts

  // ---- the uniform vocabulary, derived from production over the frozen texts, exactly as §175/§177
  const vocab = new Set<string>();
  for (const r of rows) {
    const d: any = decomposer.decompose(r.text, { location: null, task: null });
    for (const h of d.hazards ?? []) {
      const f = String(h.domainId ?? h.hazardFamily ?? '');
      if (f) vocab.add(f);
    }
  }
  const VOCABULARY = [...vocab].sort();

  const sample = buildExpertAnalysisInputFromAnalysis(analysisStateFor(rows[0], VOCABULARY));
  const identity = expertPromptIdentity(sample);

  const order = buildExecutionOrder(rows.map(r => r.id), identity.systemPromptSha256);
  const orderCheck = validateExecutionOrder(order, rows.map(r => r.id));
  if (!orderCheck.ok) throw new Error(`ABORT before spend: execution order invalid — ${orderCheck.problems.join('; ')}`);

  const prereg = {
    artifact: 'SECTION_179_PRE_SPEND_PREREGISTRATION',
    writtenBeforeFirstProviderCall: true,
    operation: '§179 replicated hosted development validation of frozen v15 clarification behaviour',
    '1_provider_model': {
      provider: 'anthropic',
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
      maxTokens: EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens,
      thinking: EXPERT_HOSTED_INFERENCE_CONFIG.thinking,
      inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
      outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
      expectedReturnedModelIdentity: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      returnedModelIsAsserted: 'every execution records telemetry.respondedModel; a mismatch is recorded, never corrected',
    },
    '2_prompt_identity': {
      promptVersion: identity.promptVersion,
      systemPromptSha256: identity.systemPromptSha256,
      systemPromptChars: EXPERT_SYSTEM_PROMPT.length,
      promptFileSha256: promptFileSha,
      frozenAt: '§178',
    },
    '3_contract_schema': {
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
      inputContractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      validatorVersion: EXPERT_VALIDATOR_VERSION,
      wireSchemaSha256: identity.wireSchemaSha256,
    },
    '4_frozen_rows': rows.map(r => ({ id: r.id, textSha256: sha(r.text), truthRequired: r.truthRequired })),
    '5_frozen_truth': {
      source: 'verification/expert-hazlenz-balanced-clarification-instrument-2026-09-05/HUMAN-ADJUDICATION-RECORD.json',
      truthClass: 'PRODUCT_OWNER_REVIEWED_DEVELOPMENT_TRUTH',
      AI_ASSISTED_HUMAN_VERDICT_GENERATION: true,
      AI_ASSISTED_STRICT_ADJUDICATION: true,
      FULLY_INDEPENDENT_HUMAN_ADJUDICATION: false,
      requiredRows: rows.filter(r => r.truthRequired).map(r => r.id),
      silenceRows: rows.filter(r => !r.truthRequired).map(r => r.id),
      mutationAllowed: false,
    },
    '6_executions_per_row': EXECUTIONS_PER_ROW,
    '7_execution_order': {
      method: 'three interleaved blocks; each block a Fisher-Yates shuffle of the ten row ids under '
        + 'mulberry32 seeded from the first 8 hex characters of the frozen v15 SYSTEM_PROMPT_SHA256; a '
        + 'block whose first row equals the previous block\'s last row is rotated left one position and '
        + 're-checked. Fully deterministic and reproducible from the identity alone.',
      seedHex: identity.systemPromptSha256.slice(0, 8),
      constraintsAsserted: [
        'every row occurs exactly three times',
        'each row carries replicate numbers 1, 2 and 3',
        'no row occurs twice consecutively',
      ],
      frozenOrder: order,
    },
    '8_scoring_rules': {
      SILENCE_EXECUTION: 'EXACT AND MECHANICAL. Frozen truth owes nothing on a SILENCE row, so an '
        + 'execution is correct iff it normalized VALID and emitted ZERO clarifications. An '
        + 'independently plausible but displaced question is still a precision failure. A contract '
        + 'failure or REJECTED normalization is NEVER counted as silence.',
      REQUIRED_EXECUTION_LOOSE: 'MECHANICAL UPPER BOUND. Correct iff the execution normalized VALID '
        + 'and emitted at least one clarification. This does NOT establish that the question '
        + 'addressed the owed fact and must never be promoted to strict.',
      REQUIRED_EXECUTION_STRICT: 'NOT COMPUTED BY THIS SCRIPT. Requires human semantic adjudication '
        + 'of each emitting execution independently. Every emitted clarification is exported verbatim '
        + 'per execution. This model does not decide it.',
      contractFailureHandling: 'recorded as CONTRACT_FAILURE, scored as no clarification emitted on a '
        + 'REQUIRED row and as NOT-silence on a SILENCE row. Never silently retried, never dropped.',
    },
    '9_aggregation': {
      executionLevel: [
        'REQUIRED_STRICT_PASS_RATE = strictly correct REQUIRED executions / 15 (pending adjudication)',
        'REQUIRED_LOOSE_PASS_RATE = emitting REQUIRED executions / 15 (mechanical upper bound)',
        'SILENCE_PASS_RATE = correct SILENCE executions / 15 (mechanical, exact)',
        'OVERALL_EXECUTION_ACCURACY = correct executions / 30',
      ],
      rowLevel: 'each row reported as 0/3, 1/3, 2/3 or 3/3 correct, always beside the pooled figure',
      withinRowDisagreement: 'a row is internally disagreeing if its three executions do not share '
        + 'the same semantic PASS/FAIL result. WITHIN_ROW_DISAGREEMENT_COUNT is reported explicitly '
        + 'and instability is never hidden inside an aggregate percentage.',
      forbidden: 'majority-voting a disagreeing row into a clean pass; discarding a minority execution as an outlier',
    },
    '10_retry_policy': { retries: RETRIES, note: 'zero. A failed call is recorded as a failure and counts against the cap.' },
    '11_caps': {
      plannedInvocations: PLANNED_INVOCATIONS,
      hardProviderInvocationCap: CALL_CEILING,
      dollarHardCapUsd: SPEND_CEILING_USD,
      worstCasePerCallUsd: Number(WORST_CASE_USD.toFixed(5)),
      onExceeding: 'STOP and report INCOMPLETE replicated validation. The replicate count is NEVER '
        + 'silently reduced after spend begins.',
    },
    '12_success_criteria': {
      note: 'preregistered DEVELOPMENT evidence, not a statistical population claim',
      HR04_strictPass: '>= 2/3 — 1/3 is unstable and does NOT confirm; 0/3 is failure to confirm; 3/3 is strong development evidence',
      REQUIRED_STRICT_PASS: '>= 12/15',
      SILENCE_EXECUTION_PASS: '>= 13/15',
      noSilenceRowFails: 'no SILENCE row may fail 2 or more of its 3 executions',
      noRequiredRegression: 'no previously recovered REQUIRED row (HR-01, HR-06, HR-08, HR-09) may fall below 2/3',
      contractFailures: 0,
      normalizationRejected: 0,
      interpretability: 'provider execution evidence must remain interpretable',
    },
    '13_causal_boundary': {
      establishable: ['V15_REPLICATED_BEHAVIOR', 'V15_REMEDIATION_BEHAVIORALLY_CONFIRMED if the criteria are met'],
      notEstablishable: ['CAUSAL_EFFECT_SIZE_V14_TO_V15', 'PRECISION_IMPROVEMENT_CAUSED_BY_V15'],
      why: 'no replicated v14 comparator exists. §175 and §177 were one execution per row.',
      strongestPermittedClaim: 'At frozen Expert prompt v15 and the tested hosted provider/model, the '
        + '§179 three-replicate development instrument met the preregistered clarification recall and '
        + 'silence-precision stability criteria.',
    },
    '14_no_post_hoc_tuning': 'after the first provider call, no change to prompt, schema, normalizer, '
      + 'verifier, arbitration, scorer, thresholds, truth, row text, execution order, aggregation or '
      + 'success criteria. A defect discovered mid-run preserves evidence and stops; it is never '
      + 'repaired and continued inside the same experiment.',
    '15_provenance_limitation': {
      sharedAuthorship: 'Claude authored the rows; GPT-5.6 Sol reviewed before owner finalization; '
        + 'Expert HazLenz is Claude-family. A high score does NOT remove provenance uncertainty.',
      ifAllThirtyCorrect: 'PERFECT_REPLICATED_DEVELOPMENT_CONCORDANCE = TRUE. Do NOT call the system '
        + 'formally validated. A provenance-independent challenge remains required.',
      truthIsNotRedefined: 'frozen verdicts are never edited to agree with Expert',
    },
    uniformInputDecision: {
      allowedHazardFamilies: VOCABULARY,
      derivation: 'union of families the real deterministic decomposer emits across the ten frozen '
        + 'observations; IDENTICAL for every row and every replicate, so it cannot separate the classes',
      jurisdiction: 'osha-general-industry',
      inspectionContext: 'location null, task null, for every execution',
      governedStandards: 'none supplied, for every execution',
      unchangedFrom: '§175 and §177, so the input is not a new variable in this comparison',
    },
  };

  const preregPath = join(EVID, 'PRE-SPEND-PREREGISTRATION-V15.json');
  const preregText = JSON.stringify(prereg, null, 2) + '\n';

  if (dry) {
    console.log(`DRY RUN — nothing written, nothing called.`);
    console.log(`PREREGISTRATION_SHA256 (would be) = ${sha(preregText)}`);
    console.log(`order: ${order.map(o => `${o.rowId}#${o.replicateNumber}`).join(' ')}`);
    console.log(`order constraints: ${orderCheck.ok ? 'ALL SATISFIED' : orderCheck.problems.join('; ')}`);
    return;
  }

  if (existsSync(preregPath)) {
    if (shaFile(preregPath) !== sha(preregText)) {
      throw new Error('ABORT: preregistration on disk differs from the current identity — the frozen design moved');
    }
  } else {
    writeFileSync(preregPath, preregText);
  }
  const preregHash = shaFile(preregPath);
  console.log(`PREREGISTRATION_SHA256 = ${preregHash}`);
  console.log(`model=${prereg['1_provider_model'].model}  promptVersion=${identity.promptVersion}  promptSha=${identity.systemPromptSha256.slice(0, 16)}`);
  console.log(`executionsPerRow=${EXECUTIONS_PER_ROW}  planned=${PLANNED_INVOCATIONS}  cap=${CALL_CEILING}  spendCap=$${SPEND_CEILING_USD}`);

  if (freezeOnly) { console.log('FREEZE ONLY — preregistration written, no provider call made.'); return; }

  // ---- execute
  const byId = new Map(rows.map(r => [r.id, r]));
  const provider = new AnthropicExpertProvider();
  const runFile = join(EVID, 'V15-REPLICATED-RUN-RECORDS.jsonl');
  writeFileSync(runFile, '');
  let attempted = 0; let spent = 0; let stopReason: string | null = null;
  const results: any[] = [];

  for (const step of order) {
    if (attempted + 1 > CALL_CEILING) { stopReason = 'CALL_CEILING_REACHED'; break; }
    if (spent + WORST_CASE_USD > SPEND_CEILING_USD + 1e-9) { stopReason = 'SPEND_CEILING_REACHED'; break; }

    const row = byId.get(step.rowId)!;
    const input = buildExpertAnalysisInputFromAnalysis(analysisStateFor(row, VOCABULARY));
    attempted += 1;
    const res: any = await provider.analyze(input);
    const t = provider.lastTelemetry;
    spent += t?.computedCostUsd ?? WORST_CASE_USD;

    // The REAL derivation, then the replicate identity attached beside it.
    const base = deriveRowRecord(res, input, row, t);
    const rec = {
      ...base,
      sequencePosition: step.sequencePosition,
      replicateNumber: step.replicateNumber,
      block: step.block,
      promptVersion: identity.promptVersion,
      promptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      expectedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      respondedModelMatches: (t?.respondedModel ?? null) === EXPERT_HOSTED_INFERENCE_CONFIG.model,
      providerStatus: t?.httpStatus ?? null,
      frozenTruth: row.truthRequired ? 'REQUIRED' : 'SILENCE',
    };
    results.push(rec);

    appendFileSync(runFile, JSON.stringify(rec) + '\n');
    const fd = openSync(runFile, 'r+'); fsyncSync(fd); closeSync(fd);
    console.log(`${String(step.sequencePosition).padStart(2)}  ${step.rowId}#${step.replicateNumber}  `
      + `truth=${row.truthRequired ? 'REQUIRED' : 'SILENCE '}  ok=${rec.ok}  norm=${rec.normalizationState}  `
      + `clar=${rec.clarificationCount}  cand=${rec.candidateCount}  $${(t?.computedCostUsd ?? 0).toFixed(5)}`);
  }

  // Persistence proof: read back from disk, not from memory.
  const back = readFileSync(runFile, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));

  // ---- mechanical scoring (strict REQUIRED is deliberately absent)
  const valid = (r: any) => r.ok === true && r.normalizationState === 'VALID' && r.contractFailure === false;
  const reqEx = results.filter(r => r.truthRequired);
  const silEx = results.filter(r => !r.truthRequired);
  const silPass = silEx.filter(r => valid(r) && r.clarificationCount === 0);
  const reqLoose = reqEx.filter(r => valid(r) && r.clarificationCount > 0);

  const perRow = rows.map(r => {
    const ex = results.filter(x => x.rowId === r.id).sort((a, b) => a.replicateNumber - b.replicateNumber);
    const outcomes = ex.map(x => (r.truthRequired
      ? (valid(x) && x.clarificationCount > 0 ? 'EMITTED_LOOSE_PASS' : 'NO_CLARIFICATION')
      : (valid(x) && x.clarificationCount === 0 ? 'SILENT_PASS' : 'EMITTED_OR_INVALID_FAIL')));
    const mechanicalPass = outcomes.filter(o => o === 'EMITTED_LOOSE_PASS' || o === 'SILENT_PASS').length;
    return {
      rowId: r.id,
      truth: r.truthRequired ? 'REQUIRED' : 'SILENCE',
      executions: ex.length,
      mechanicalOutcomes: outcomes,
      mechanicalScore: `${mechanicalPass}/${ex.length}`,
      clarificationCounts: ex.map(x => x.clarificationCount),
      mechanicalWithinRowDisagreement: new Set(outcomes).size > 1,
      strictScore: r.truthRequired ? 'PENDING_HUMAN_ADJUDICATION' : 'NOT_APPLICABLE_MECHANICAL',
    };
  });

  const summary = {
    artifact: 'SECTION_179_REPLICATED_RUN_SUMMARY',
    preregistrationSha256: preregHash,
    model: prereg['1_provider_model'].model,
    promptIdentity: identity,
    EXECUTIONS_PER_ROW,
    PROVIDER_INVOCATION_COUNT: attempted,
    plannedInvocations: PLANNED_INVOCATIONS,
    executionsCompleted: results.length,
    recordsOnDisk: back.length,
    TOTAL_ACTUAL_COST_USD: Number(spent.toFixed(5)),
    retries: 0,
    stopReason,
    CONTRACT_FAILURE_COUNT: results.filter(r => r.contractFailure).length,
    NORMALIZATION_REJECTED_COUNT: results.filter(r => r.normalizationState === 'REJECTED').length,
    PROVIDER_ERROR_COUNT: results.filter(r => r.ok !== true).length,
    modelIdentityMismatches: results.filter(r => !r.respondedModelMatches)
      .map(r => ({ seq: r.sequencePosition, responded: r.telemetry?.respondedModel ?? null })),
    totalPromptTokens: results.reduce((a, r) => a + (r.telemetry?.promptTokens ?? 0), 0),
    totalOutputTokens: results.reduce((a, r) => a + (r.telemetry?.outputTokens ?? 0), 0),
    meanLatencyMs: Math.round(results.reduce((a, r) => a + (r.telemetry?.latencyMs ?? 0), 0) / Math.max(results.length, 1)),
    EXECUTION_LEVEL: {
      SILENCE_PASS: { correct: silPass.length, of: silEx.length, exact: true },
      REQUIRED_LOOSE_PASS: { emitted: reqLoose.length, of: reqEx.length, isUpperBound: true },
      REQUIRED_STRICT_PASS: 'PENDING_HUMAN_ADJUDICATION',
      OVERALL_EXECUTION_ACCURACY: 'PENDING_HUMAN_ADJUDICATION — bounded above by '
        + `${silPass.length + reqLoose.length}/${results.length}`,
    },
    ROW_LEVEL: perRow,
    MECHANICAL_WITHIN_ROW_DISAGREEMENT_COUNT: perRow.filter(p => p.mechanicalWithinRowDisagreement).length,
    mechanicalDisagreeingRows: perRow.filter(p => p.mechanicalWithinRowDisagreement).map(p => p.rowId),
    note: 'SILENCE figures are exact and final. REQUIRED figures are mechanical upper bounds; the '
      + 'strict determination is human and is not made by this script or by this model.',
  };
  writeFileSync(join(EVID, 'V15-REPLICATED-RUN-SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');

  // ---- adjudication packet: EVERY emitting REQUIRED execution, verbatim, adjudicated independently
  const packet = {
    artifact: 'SECTION_179_STRICT_ADJUDICATION_PACKET',
    purpose: 'For each REQUIRED execution that emitted a clarification, a human decides whether the '
      + 'question addresses the material unresolved fact for that row. Each EXECUTION is adjudicated '
      + 'independently, because replicates of the same row produce textually different questions. '
      + 'This model did not decide any of these and must not.',
    instruction: 'Set HUMAN_ADDRESSES_THE_OWED_FACT to true or false per execution. Do not fill it by '
      + 'copying another replicate of the same row.',
    provenanceRequirement: 'If an AI assessment is consulted before the verdicts are finalised, record '
      + 'AI_ASSISTED_STRICT_ADJUDICATION = TRUE and FULLY_INDEPENDENT_HUMAN_ADJUDICATION = FALSE, and '
      + 'carry that disclosure with every figure derived from these verdicts.',
    executions: results.filter(r => r.truthRequired).sort((a, b) =>
      (a.rowId.localeCompare(b.rowId) || a.replicateNumber - b.replicateNumber)).map(r => ({
      rowId: r.rowId,
      replicateNumber: r.replicateNumber,
      sequencePosition: r.sequencePosition,
      observation: byId.get(r.rowId)!.text,
      declaredOutcome: r.declaredOutcome,
      normalizationState: r.normalizationState,
      emittedClarifications: r.clarifications,
      HUMAN_ADDRESSES_THE_OWED_FACT: null,
      HUMAN_RATIONALE: null,
    })),
    silenceFailures: results.filter(r => !r.truthRequired && r.clarificationCount > 0).sort((a, b) =>
      (a.rowId.localeCompare(b.rowId) || a.replicateNumber - b.replicateNumber)).map(r => ({
      rowId: r.rowId,
      replicateNumber: r.replicateNumber,
      sequencePosition: r.sequencePosition,
      observation: byId.get(r.rowId)!.text,
      unnecessaryQuestions: r.clarifications,
      note: 'scored a precision failure mechanically. Recorded here for pattern review only — the '
        + 'frozen truth is not revisited and this verdict is not open for adjudication.',
    })),
  };
  writeFileSync(join(EVID, 'V15-REPLICATED-STRICT-ADJUDICATION-PACKET.json'), JSON.stringify(packet, null, 2) + '\n');

  console.log(`\nPROVIDER_INVOCATION_COUNT = ${attempted}   TOTAL_ACTUAL_COST_USD = $${spent.toFixed(5)}`);
  console.log(`SILENCE_PASS = ${silPass.length}/${silEx.length} (exact)`);
  console.log(`REQUIRED_LOOSE_PASS = ${reqLoose.length}/${reqEx.length} (upper bound; strict pending human)`);
  console.log(`contract failures = ${summary.CONTRACT_FAILURE_COUNT}   rejected = ${summary.NORMALIZATION_REJECTED_COUNT}`);
  console.log(`mechanical within-row disagreement = ${summary.MECHANICAL_WITHIN_ROW_DISAGREEMENT_COUNT} rows `
    + `(${summary.mechanicalDisagreeingRows.join(', ') || 'none'})`);
  console.log(`records on disk = ${back.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error(String(e?.message ?? e)); process.exit(1); });
}
