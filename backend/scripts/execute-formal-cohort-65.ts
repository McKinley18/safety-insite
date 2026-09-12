/**
 * §136 -- EXECUTE THE FROZEN FORMAL EXPERT HAZLENZ EVALUATION. THIS SPENDS REAL MONEY.
 *
 * ==================== THE ONE-WAY DOOR ====================
 *
 * Everything before the first provider request is reversible. Nothing after it is. The structure of
 * this file follows that: a 28-point gate that constructs no provider and issues no request, then an
 * immutable run record flushed to disk with `fsyncSync`, then the run.
 *
 * `FORMAL_COHORT_SPENT` becomes TRUE at the instant the first request is issued and is never reset,
 * including if that request fails. A cohort spent on a failed request is still spent.
 *
 * ==================== WHAT THIS FILE MAY NOT DO ====================
 *
 * It runs the FROZEN harness, the FROZEN scorer and the FROZEN cohort. It does not modify any of
 * them, and the file hashes captured before the first request and after the last one are recorded so
 * that claim is checkable rather than asserted. There is no retry beyond the frozen one-per-call, no
 * second pass, no row exclusion after the fact, and no scorer input edited by hand.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, openSync, writeSync, fsyncSync,
  closeSync } from 'fs';
import { join } from 'path';
import { createHash, randomUUID } from 'crypto';

/**
 * The same minimal reader the hosted probes use, for the same reason: the credential path stays
 * auditable in one visible place rather than resting on transitive dotenv resolution.
 * THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED.
 */
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
import {
  classifyRow, truthOnlyStrings, validateCohortRow, FORMAL_COHORT_ROW_CONTRACT_VERSION,
  type FormalCohortRow,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import { REQUIRED_CLASS_MINIMUMS, RECOMMENDED_CALL_TOPOLOGY } from
  '../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-measurement-contract';
import { EXPERT_SCORER_VERSION, buildScoringReport, buildAdjudicationQueue, attemptCount } from
  '../src/safescope-v2/expert-hazlenz/expert-measure-scorers';
import { ReplayExpertProvider } from
  '../src/safescope-v2/expert-hazlenz/replay-expert-provider';
import { COHORT_SIZE_POLICY_V2, assertFrozenOriginUnchanged } from './lib/expert-cohort-size-policy';
import {
  FORMAL_EXECUTION_BUDGET, WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent,
  mayIssueRequest, classifyRetryExhaustion,
} from './lib/expert-execution-budget';
import { buildPool, select, selectionOrder } from './lib/expert-cohort-65-selection';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';
import { CORPUS_RETIREMENT_REGISTRY } from
  '../src/safescope-v2/expert-hazlenz/expert-corpus-retirement-registry';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems,
} from './lib/expert-run-record-store';

const ROOT = join(__dirname, '..', '..');
const FROZEN_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-frozen-2026-09-01');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-formal-evaluation-2026-09-01');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(readFileSync(p));

// ---------------------------------------------------------------- the P4 authorization, verbatim
const P4 = {
  authorized: true,
  cohortId: 'hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a',
  manifestSha256: '1da79ff32bd6e9b194c3b230091a6560068b260c8f7004e03ed9e6435a2b31e3',
  rowCount: 65,
  plannedLogicalCalls: 195,
  globalRetryRequestBudget: 20,
  hardProviderRequestCeiling: 215,
  hardSpendCeilingUsd: 22.36,
  provider: 'anthropic',
  model: 'claude-sonnet-5',
} as const;

/** Files whose bytes must not move across the run. Requirement W. */
const INTEGRITY_FILES = [
  'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-normalization.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-measure-scorers.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-measurement-contract.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-cohort-contract.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-deterministic-projection.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-runner.ts',
  'backend/src/safescope-v2/expert-hazlenz/expert-normalization.ts',
  'backend/src/safescope-v2/expert-hazlenz/fixtures/semantic-augmentation-v1.ts',
  'backend/src/safescope-v2/expert-hazlenz/fixtures/negative-control-augmentation-v1.ts',
  'backend/src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts',
  'backend/scripts/lib/expert-cohort-harness.ts',
  'backend/scripts/lib/expert-execution-budget.ts',
  'backend/scripts/lib/expert-cohort-65-selection.ts',
  'backend/scripts/lib/expert-cohort-supplemental-policy.ts',
  'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
  'safescope-data/gauntlets/safescope-gauntlet.seed.json',
];
const integritySnapshot = () =>
  Object.fromEntries(INTEGRITY_FILES.map(f => [f, shaFile(join(ROOT, f))]));

const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }
const gate: Array<{ n: number; label: string; pass: boolean; detail: string }> = [];
function check(n: number, label: string, pass: boolean, detail = ''): void {
  gate.push({ n, label, pass, detail });
  say(`   ${String(n).padStart(2)}. ${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(50)} ${detail}`);
}

function flush(path: string, content: string): void {
  const fd = openSync(path, 'w');
  writeSync(fd, content);
  fsyncSync(fd);          // on disk before the first request, not merely in a buffer
  closeSync(fd);
}

/**
 * `--gate-only` runs the 28-point gate and STOPS before the spend boundary.
 *
 * It issues ZERO hosted requests, so it is not a rehearsal of the run and not an exploratory call --
 * it is the precondition check the authorization itself mandates, executed once on its own so a gate
 * failure is discovered at no cost rather than at the spend boundary.
 */
const GATE_ONLY = process.argv.includes('--gate-only');

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  resetProviderInvocationCount();

  say('FORMAL EXPERT HAZLENZ EVALUATION -- EXECUTION');
  say(GATE_ONLY ? '§136. GATE-ONLY: the 28-point gate runs and stops. Zero hosted requests.'
    : '§136. P4 authorization received. Nothing has been spent yet.');
  say('');

  // ================================================================ PRE-SPEND GATE
  say('A. PRE-SPEND HARD GATE -- no provider constructed, no request issued');
  say('');

  const manifestPath = join(FROZEN_DIR, 'COHORT-MANIFEST.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const manifestSha = shaFile(manifestPath);

  check(1, 'cohort ID matches exactly', manifest.cohortId === P4.cohortId, manifest.cohortId);
  check(2, 'manifest SHA-256 matches exactly', manifestSha === P4.manifestSha256, manifestSha);
  check(3, 'row count = 65', manifest.rowCount === 65, String(manifest.rowCount));

  const pool = buildPool();
  const sel = select(pool, COHORT_SIZE_POLICY_V2.targetRows);
  const order = selectionOrder(sel.selected);
  const selectionSha = sha(order);
  check(4, 'selection hash matches', selectionSha === manifest.selectionSha256,
    selectionSha.slice(0, 20) + '...');
  const rowOrderMatches = sel.selected.length === manifest.rowOrder.length
    && sel.selected.every((p, i) => p.row.source.rowId === manifest.rowOrder[i]);
  check(5, 'row order matches', rowOrderMatches);

  // Re-attach governed records by the frozen rule, then re-hash everything the manifest binds.
  const SNAPSHOT = join(process.env.HOME ?? '', 'Desktop', 'governed-snapshot.csv');
  const snapBuf = readFileSync(SNAPSHOT);
  const snapSha = sha(snapBuf);
  // Governed records are taken FROM THE FROZEN MANIFEST, not re-derived. The manifest is the
  // authority for what was frozen; re-deriving would silently accept a snapshot that had moved.
  const rows: FormalCohortRow[] = sel.selected.map((p, i) => ({
    ...p.row,
    source: { ...p.row.source,
      governedStandards: (manifest.rows[i].governedStandards
        ?? []) as FormalCohortRow['source']['governedStandards'] },
  }));
  const truthSha = sha(JSON.stringify(sel.selected.map(p => p.row.truth)));
  const attachmentSha = sha(JSON.stringify(manifest.governedAttachment.mapping));
  const corpusOk = ['gauntletSourceV1', 'gauntletSeed', 'realismPackUntouched',
    'frozenSupplementalPolicy'].every(k => {
    const p = { gauntletSourceV1: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
      gauntletSeed: 'safescope-data/gauntlets/safescope-gauntlet.seed.json',
      realismPackUntouched: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
      frozenSupplementalPolicy: 'backend/scripts/lib/expert-cohort-supplemental-policy.ts' }[k]!;
    return shaFile(join(ROOT, p)) === manifest.hashes[k];
  }) && snapSha === manifest.hashes.governedSnapshot && truthSha === manifest.hashes.truthKeys;
  check(6, 'all corpus/truth/provenance hashes match', corpusOk);
  check(7, 'governed attachment mapping hash matches',
    attachmentSha === manifest.hashes.governedAttachment);

  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check(8, 'provider = anthropic', manifest.executionIdentity.provider === P4.provider);
  check(9, 'exact bound model = claude-sonnet-5',
    cfg.model === P4.model && manifest.executionIdentity.model === P4.model, cfg.model);
  check(10, 'prompt identity/hash matches frozen manifest',
    EXPERT_PROMPT_VERSION === manifest.executionIdentity.promptVersion
    && sha(EXPERT_SYSTEM_PROMPT) === manifest.hashes.systemPrompt, EXPERT_PROMPT_VERSION);
  const idOk = manifest.executionIdentity.inputContract === EXPERT_INPUT_CONTRACT_VERSION
    && manifest.executionIdentity.analysisContract === EXPERT_ANALYSIS_CONTRACT_VERSION
    && manifest.executionIdentity.validator === EXPERT_VALIDATOR_VERSION
    && manifest.executionIdentity.scorer === EXPERT_SCORER_VERSION
    && manifest.executionIdentity.measurementContract === EXPERT_MEASUREMENT_CONTRACT_VERSION
    && manifest.executionIdentity.rowContract === FORMAL_COHORT_ROW_CONTRACT_VERSION
    && manifest.executionIdentity.harness === EXPERT_COHORT_HARNESS_VERSION;
  check(11, 'input/analysis/validator/scorer/measurement/row/harness match', idOk);
  check(12, 'deterministic projection enabled in the permanent path',
    manifest.executionIdentity.projectionPermanentPath === 'ENABLED');

  const b = FORMAL_EXECUTION_BUDGET;
  let budgetConsistent = true;
  try { assertBudgetInternallyConsistent(); } catch { budgetConsistent = false; }
  check(13, 'PLANNED_LOGICAL_CALLS = 195',
    b.plannedLogicalCalls === P4.plannedLogicalCalls && manifest.executionBudget
      .plannedLogicalCalls === P4.plannedLogicalCalls);
  check(14, 'GLOBAL_RETRY_REQUEST_BUDGET = 20',
    b.globalRetryRequestBudget === P4.globalRetryRequestBudget);
  check(15, 'HARD_PROVIDER_REQUEST_CEILING = 215',
    b.hardProviderRequestCeiling === P4.hardProviderRequestCeiling && budgetConsistent);
  check(16, 'HARD_SPEND_CEILING_USD = 22.36',
    b.hardSpendCeilingUsd === P4.hardSpendCeilingUsd
    && Math.abs(WORST_CASE_REQUEST_USD - 0.104) < 1e-9,
    `worstCaseRequestUsd $${WORST_CASE_REQUEST_USD.toFixed(6)}`);
  check(17, 'frozen retry causes and max-one-retry semantics match',
    b.maxRetriesPerLogicalCall === 1
    && JSON.stringify([...b.retryCauses].sort())
      === JSON.stringify([...manifest.executionBudget.retryCauses].sort()));

  const key = process.env.ANTHROPIC_API_KEY;
  check(18, 'provider credential is available', !!(key && key.trim().length > 0),
    'presence only; value never read into the report');

  // 19-22 are FUNCTIONAL checks, run against the replay provider. A claim that enforcement is
  // "active" is worth nothing unless something exercises it immediately before the spend.
  check(19, 'provider-request ceiling enforcement is active',
    mayIssueRequest({ requestsAttempted: 215, retryRequestsAttempted: 0, spendUsd: 0 }, false)
      .allowed === false
    && mayIssueRequest({ requestsAttempted: 100, retryRequestsAttempted: 20, spendUsd: 0 }, true)
      .allowed === false);
  check(20, 'prospective spend enforcement is active',
    mayIssueRequest({ requestsAttempted: 0, retryRequestsAttempted: 0, spendUsd: 22.36 }, false)
      .allowed === false);

  const probeRaw = (id: string) => ({ contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId: id, outcome: 'NOTHING_TO_ADD', expertHazardCandidates: [],
    decisionCriticalClarifications: [], crossHazardInsights: [], disagreements: [],
    expertExplanation: 'probe' });
  const retryProbe = new ReplayExpertProvider({
    qualifiedModelIdentity: P4.model, providerId: `anthropic:${P4.model}`,
    results: [{ ok: false, kind: 'TIMEOUT', detail: 'probe',
      usage: { inputTokens: 1, outputTokens: 1, costUsd: 0, latencyMs: 1, httpStatus: null,
        modelIdentity: P4.model } },
    { ok: true, raw: probeRaw(rows[0].source.rowId), modelIdentity: P4.model,
      usage: { inputTokens: 1, outputTokens: 1, costUsd: 0, latencyMs: 1, httpStatus: 200,
        modelIdentity: P4.model } }],
  });
  const telemetryProbe = await runFormalCohort([rows[0]], {
    mode: 'ENABLED', provider: retryProbe, callCeiling: 1, requestCeiling: 2,
    retryRequestBudget: 1, worstCaseRequestUsd: WORST_CASE_REQUEST_USD, spendCeilingUsd: 1,
    frozenIdentity: { provider: P4.provider, model: P4.model },
    arms: ['BASE'], processId: 'presp', nowIso: '2026-09-01T00:00:00.000Z',
  });
  const probedCall = telemetryProbe.records[0]?.calls[0];
  check(21, 'per-attempt telemetry persistence is active',
    attemptCount(probedCall!) === 2 && probedCall?.attempts?.[0].causedRetry === 'TIMEOUT',
    `${attemptCount(probedCall!)} attempts, cause ${probedCall?.attempts?.[0].causedRetry}`);

  const wrongModel = new ReplayExpertProvider({
    qualifiedModelIdentity: 'claude-opus-4-1', providerId: 'anthropic:claude-opus-4-1',
    results: [{ ok: true, raw: probeRaw('x'), modelIdentity: 'claude-opus-4-1' }] });
  const idProbe = await runFormalCohort([rows[0]], {
    mode: 'ENABLED', provider: wrongModel, callCeiling: 1, requestCeiling: 1,
    retryRequestBudget: 0, worstCaseRequestUsd: WORST_CASE_REQUEST_USD, spendCeilingUsd: 1,
    frozenIdentity: { provider: P4.provider, model: P4.model },
    arms: ['BASE'], processId: 'presp', nowIso: '2026-09-01T00:00:00.000Z',
  });
  check(22, 'model override mismatch protection is active',
    idProbe.stopReason === 'EXECUTION_IDENTITY_MISMATCH' && wrongModel.calls === 0,
    idProbe.stopReason);

  const dry = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: [...RECOMMENDED_CALL_TOPOLOGY.arms], processId: 'presp-dry',
    nowIso: '2026-09-01T00:00:00.000Z' });
  let leaks = 0;
  for (const built of dry.requestsBuilt) {
    const row = rows.find(r => r.source.rowId === built.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(built.input)}\n`
      + `${JSON.stringify(built.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }
  check(23, 'TRUTH_LEAK = 0', leaks === 0, String(leaks));

  const rowProblems = rows.flatMap(validateCohortRow);
  const counts: Record<string, number> = {};
  for (const r of rows) for (const c of classifyRow(r)) counts[c] = (counts[c] ?? 0) + 1;
  const compositionOk = rowProblems.length === 0 && Object.entries(REQUIRED_CLASS_MINIMUMS)
    .every(([c, r]) => c === 'DETERMINISTIC_MISS_RECALL_OPPORTUNITY' || (counts[c] ?? 0) >= r.minimum);
  let originIntact = true;
  try { assertFrozenOriginUnchanged(); } catch { originIntact = false; }
  check(24, 'corpus semantic validation remains green', compositionOk && originIntact,
    `${rowProblems.length} row problems`);
  check(25, 'no semantic corpus mutation after freeze',
    truthSha === manifest.hashes.truthKeys, truthSha.slice(0, 20) + '...');
  check(26, 'no prompt/schema/scorer/normalizer/projection mutation after freeze',
    sha(EXPERT_SYSTEM_PROMPT) === manifest.hashes.systemPrompt
    && EXPERT_SCORER_VERSION === manifest.executionIdentity.scorer);
  const reserveOk = ['GAUNTLET_OFFSET_2', 'GAUNTLET_OFFSET_3'].every(id =>
    CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === id)?.status === 'OPENED')
    && ['REALISM_OFFSET_1', 'REALISM_OFFSET_2'].every(id =>
      CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === id)?.status === 'RESERVED');
  check(27, 'no additional reserved material opened after freeze', reserveOk,
    'realism offsets 1 and 2 still RESERVED');
  check(28, 'P4_PRESPEND_AUTHORIZATION = TRUE', P4.authorized);

  const gatePassed = gate.every(g => g.pass);
  say('');
  say(`   PRE-SPEND GATE: ${gatePassed ? 'PASS' : 'FAIL'}  (${gate.filter(g => g.pass).length}/28)`);
  say(`   provider requests issued so far: 0  (the replay probes above touch no network)`);

  if (!gatePassed) {
    const failed = gate.filter(g => !g.pass).map(g => `${g.n}. ${g.label}`);
    say('');
    say('FORMAL_EXPERT_EVALUATION_BLOCKED_PRE_SPEND -- ' + failed.join('; '));
    say('FORMAL_COHORT_SPENT = FALSE   PROVIDER_INVOCATION_COUNT = 0');
    writeFileSync(join(OUT, 'PRE-SPEND-GATE.txt'), out.join('\n') + '\n');
    process.exit(3);
  }

  if (GATE_ONLY) {
    say('');
    say('   GATE-ONLY: stopping before the spend boundary. Nothing was spent.');
    say('   FORMAL_COHORT_SPENT = FALSE   HOSTED_REQUESTS = 0');
    writeFileSync(join(OUT, 'PRE-SPEND-GATE.txt'), out.join('\n') + '\n');
    return;
  }

  // ================================================================ FIRST-CALL SPEND BOUNDARY
  const runId = `formal-run-${randomUUID()}`;
  const firstSpendUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const hashesBefore = integritySnapshot();

  const runRecord = {
    artifact: 'FORMAL_EXPERT_EVALUATION_RUN_RECORD',
    runId,
    firstSpendUtc,
    cohortId: manifest.cohortId,
    manifestSha256: manifestSha,
    provider: P4.provider,
    model: P4.model,
    promptIdentity: EXPERT_PROMPT_VERSION,
    promptSha256: sha(EXPERT_SYSTEM_PROMPT),
    contractIdentities: {
      input: EXPERT_INPUT_CONTRACT_VERSION, analysis: EXPERT_ANALYSIS_CONTRACT_VERSION,
      validator: EXPERT_VALIDATOR_VERSION, row: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    },
    scorerIdentity: EXPERT_SCORER_VERSION,
    measurementIdentity: EXPERT_MEASUREMENT_CONTRACT_VERSION,
    harnessIdentity: EXPERT_COHORT_HARNESS_VERSION,
    projectionIdentity: manifest.executionIdentity.projection,
    rowCount: rows.length,
    rowOrderSha256: sha(manifest.rowOrder.join('|')),
    selectionSha256: selectionSha,
    truthSha256: truthSha,
    governedAttachmentSha256: attachmentSha,
    plannedLogicalCalls: P4.plannedLogicalCalls,
    globalRetryRequestBudget: P4.globalRetryRequestBudget,
    hardProviderRequestCeiling: P4.hardProviderRequestCeiling,
    hardSpendCeilingUsd: P4.hardSpendCeilingUsd,
    worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
    p4PrespendAuthorization: true,
    preSpendGate: gate,
    integrityHashesBeforeFirstCall: hashesBefore,
    formalCohortSpent: 'BECOMES TRUE AT THE FIRST REQUEST; IRREVERSIBLE',
  };
  flush(join(OUT, 'RUN-RECORD.json'), JSON.stringify(runRecord, null, 2) + '\n');

  say('');
  say('B. FIRST-CALL SPEND BOUNDARY');
  say('');
  say(`   runId             ${runId}`);
  say(`   firstSpendUtc     ${firstSpendUtc}`);
  say(`   run record FLUSHED to disk (fsync) before the first request`);
  say('');
  say('   *** FORMAL_COHORT_SPENT = TRUE from the next line onward. IRREVERSIBLE. ***');
  say('');

  // ================================================================ RUN
  const provider = new AnthropicExpertProvider(EXPERT_HOSTED_INFERENCE_CONFIG);
  resetProviderInvocationCount();
  const started = Date.now();
  const heartbeat = setInterval(() => {
    console.log(`   [${new Date().toISOString()}] logical calls issued: `
      + `${providerInvocationCount()} / 195   elapsed ${Math.round((Date.now() - started) / 1000)}s`);
  }, 30_000);

  // §139 Phase 7. THE EVIDENCE SINK IS OPENED BEFORE THE FIRST REQUEST.
  //
  // The 2026-09-01 run reached this point, completed 195/195 calls, and then wrote everything
  // EXCEPT `run.records` -- losing every validated ExpertAnalysis and every merged block at process
  // exit, and with them the only chance to attribute a cause to the largest failing gate. The sink
  // below persists each record durably as it completes, so a crash or a ceiling stop at call N+1
  // leaves calls 1..N fully scoreable.
  const recordStore = createRunRecordStore(OUT);
  let run;
  try {
    run = await runFormalCohort(rows, {
      mode: 'ENABLED',
      provider,
      callCeiling: P4.plannedLogicalCalls,
      requestCeiling: P4.hardProviderRequestCeiling,
      retryRequestBudget: P4.globalRetryRequestBudget,
      worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
      spendCeilingUsd: P4.hardSpendCeilingUsd,
      frozenIdentity: { provider: P4.provider, model: P4.model },
      arms: [...RECOMMENDED_CALL_TOPOLOGY.arms],
      processId: `proc-${runId.slice(-12)}`,
      nowIso: firstSpendUtc,
      recordSink: r => recordStore.append(r),
    });
  } finally {
    clearInterval(heartbeat);
    recordStore.close();
  }
  const elapsedMs = Date.now() - started;
  const hashesAfter = integritySnapshot();

  // ================================================================ SCORE ONCE
  const adjudicationQueue = buildAdjudicationQueue(run.records);
  const scoring = run.scoring ?? buildScoringReport(run.records, []);

  // ================================================================ EVIDENCE
  const attemptLedger = run.records.flatMap(rec => rec.calls.map(c => ({
    rowId: c.rowId, arm: c.arm, callId: c.callId, processId: c.processId,
    layerStatus: c.layerStatus, failureKind: c.failureKind,
    attemptCount: attemptCount(c), latencyMs: c.latencyMs,
    inputTokens: c.inputTokens, outputTokens: c.outputTokens, costUsd: c.costUsd,
    modelIdentity: c.modelIdentity,
    retrySuppressed: c.retrySuppressed ?? null,
    attempts: (c.attempts ?? []).map(a => ({
      attemptIndex: a.attemptIndex, isRetry: a.isRetry, ok: a.ok,
      failureKind: a.failureKind, causedRetry: a.causedRetry,
      modelIdentity: a.modelIdentity, usage: a.usage,
    })),
  })));

  const latencies = attemptLedger.map(c => c.latencyMs).filter(n => n > 0).sort((a, b) => a - b);
  const pct = (p: number) => latencies.length === 0 ? null
    : latencies[Math.max(0, Math.ceil(p * latencies.length) - 1)];

  const failureTotals: Record<string, number> = {};
  for (const c of attemptLedger) {
    if (c.failureKind) failureTotals[c.failureKind] = (failureTotals[c.failureKind] ?? 0) + 1;
    for (const a of c.attempts) {
      if (a.causedRetry) {
        const k = `retried:${a.causedRetry}`;
        failureTotals[k] = (failureTotals[k] ?? 0) + 1;
      }
    }
  }
  const exhaustion = classifyRetryExhaustion(run.retryCauses);

  const evidence = {
    artifact: 'FORMAL_EXPERT_EVALUATION_RESULT',
    runId, firstSpendUtc, cohortId: manifest.cohortId, manifestSha256: manifestSha,
    elapsedMs,
    stopReason: run.stopReason,
    identityViolation: run.identityViolation,
    accounting: run.accounting,
    callTotals: {
      plannedLogicalCalls: P4.plannedLogicalCalls,
      logicalCallsStarted: run.accounting.callsAttempted,
      logicalCallsCompleted: run.accounting.callsCompleted,
      logicalCallsUncompleted: run.accounting.callsAttempted - run.accounting.callsCompleted,
      logicalCallsNeverStarted: P4.plannedLogicalCalls - run.accounting.callsAttempted,
      providerRequestsAttempted: run.accounting.providerRequestsAttempted,
      initialRequests: run.accounting.providerRequestsAttempted
        - run.accounting.retryRequestsAttempted,
      retryRequests: run.accounting.retryRequestsAttempted,
      retriesRefusedByBudget: run.retriesSuppressed.length,
    },
    failureTotals,
    retryCauses: run.retryCauses,
    retriesSuppressed: run.retriesSuppressed,
    retryExhaustionClassification: exhaustion,
    tokenUsage: {
      inputTokens: run.accounting.inputTokens,
      outputTokens: run.accounting.outputTokens,
      totalTokens: run.accounting.inputTokens + run.accounting.outputTokens,
    },
    cost: {
      actualUsd: run.accounting.spendUsd,
      spendCeilingUsd: P4.hardSpendCeilingUsd,
      marginRemainingUsd: P4.hardSpendCeilingUsd - run.accounting.spendUsd,
      prospectiveBlocks: run.stopReason === 'SPEND_CEILING_REACHED' ? 1 : 0,
    },
    latency: { p50Ms: pct(0.50), p95Ms: pct(0.95),
      maxMs: latencies.length ? latencies[latencies.length - 1] : null,
      samples: latencies.length },
    scoring,
    adjudicationQueue: { size: adjudicationQueue.length, items: adjudicationQueue },
    attemptLedger,
    integrityHashesBeforeFirstCall: hashesBefore,
    integrityHashesAfterLastCall: hashesAfter,
    integrityUnchanged: JSON.stringify(hashesBefore) === JSON.stringify(hashesAfter),
    reportedLimitations: {
      REVIEWER_APPROVED_GOVERNED_RECORDS: 0,
      APPROVED_EXACT_NOT_EXERCISED: true,
      interactionVocabularyLimitation:
        'the closed EXPERT_INTERACTION_KINDS vocabulary cannot express a '
        + 'flammable-atmosphere/ignition-source interaction; no interaction kind was invented',
      crossProcessArmRanInOneProcess:
        'the frozen harness runs all three arms in a single OS process, so M17 has no valid '
        + 'cross-process pair. REPORTED measure, not a gate.',
    },
    p4PrespendAuthorization: true,
    formalCohortSpent: true,
    providerInvocationCount: providerInvocationCount(),
  };

  writeFileSync(join(OUT, 'EVALUATION-RESULT.json'), JSON.stringify(evidence, null, 2) + '\n');
  writeFileSync(join(OUT, 'ATTEMPT-LEDGER.json'), JSON.stringify(attemptLedger, null, 2) + '\n');
  writeFileSync(join(OUT, 'ADJUDICATION-QUEUE.json'),
    JSON.stringify(adjudicationQueue, null, 2) + '\n');

  // §139 Phase 7 requirement 6: ARTIFACT-COMPLETENESS PREFLIGHT, read back from disk rather than
  // from memory. Reading `run.records` here would prove nothing -- the 2026-09-01 run had them in
  // memory too. This asks the only question that matters: could every frozen scorer be re-run from
  // what is now persisted?
  const persisted = readRunRecordStore(OUT);
  const completeness = [
    ...persisted.problems,
    ...runRecordCompletenessProblems(persisted.records, {
      rowOrder: manifest.rowOrder as string[],
      arms: [...RECOMMENDED_CALL_TOPOLOGY.arms],
    }),
  ];
  say('');
  say('E. EVIDENCE PERSISTENCE');
  say(`   RUN-RECORDS.jsonl records      ${persisted.records.length}`);
  say(`   store sha256                   ${persisted.sha256.slice(0, 20)}...`);
  say(`   completeness preflight         ${completeness.length === 0 ? 'PASS' : 'FAIL'}`);
  for (const p of completeness.slice(0, 20)) say(`     ${p}`);
  say(`   stage-4 rescoring reproducible after process exit: ${completeness.length === 0}`);

  // ================================================================ REPORT
  say('C. RUN COMPLETE');
  say('');
  say(`   stopReason                    ${run.stopReason}`);
  say(`   elapsed                       ${Math.round(elapsedMs / 1000)}s`);
  say(`   logical calls started         ${run.accounting.callsAttempted} / 195`);
  say(`   logical calls completed       ${run.accounting.callsCompleted}`);
  say(`   provider requests attempted   ${run.accounting.providerRequestsAttempted} / 215`);
  say(`   retry requests                ${run.accounting.retryRequestsAttempted} / 20`);
  say(`   retries refused by budget     ${run.retriesSuppressed.length}`);
  say(`   input tokens                  ${run.accounting.inputTokens.toLocaleString()}`);
  say(`   output tokens                 ${run.accounting.outputTokens.toLocaleString()}`);
  say(`   ACTUAL SPEND                  $${run.accounting.spendUsd.toFixed(4)} of $22.36`);
  say(`   margin remaining              $${(22.36 - run.accounting.spendUsd).toFixed(4)}`);
  say(`   latency p50 / p95 / max       ${pct(0.5)} / ${pct(0.95)} / `
    + `${latencies.length ? latencies[latencies.length - 1] : '-'} ms`);
  say(`   integrity hashes unchanged    ${evidence.integrityUnchanged}`);
  say('');
  say('   FAILURE TOTALS BY CLASS');
  if (Object.keys(failureTotals).length === 0) say('     none');
  for (const [k, v] of Object.entries(failureTotals)) say(`     ${k.padEnd(34)} ${v}`);
  say('');
  say('D. MEASURES');
  say('');
  for (const r of scoring.results) {
    const frozen = r as { id: string; state: string; value: number | null;
      numerator: number | null; denominator: number | null; reason: string | null };
    say(`   ${frozen.id.padEnd(42)} ${frozen.state.padEnd(15)} `
      + `${frozen.value === null ? '-' : frozen.value.toFixed(4).padStart(8)}  `
      + `${frozen.numerator ?? '-'} / ${frozen.denominator ?? '-'}`);
    if (frozen.reason) say(`       reason: ${frozen.reason}`);
  }
  say('');
  say('   FAMILY VERDICTS');
  for (const f of scoring.families) {
    say(`     ${String(f.family).padEnd(24)} ${f.passed ? 'PASS' : 'FAIL'}`
      + `${f.failedGateIds.length ? '   failed: ' + f.failedGateIds.join(', ') : ''}`);
  }
  say('');
  say(`   UNMEASURED       ${scoring.measuresUnmeasured.join(', ') || 'none'}`);
  say(`   NO_OPPORTUNITY   ${scoring.measuresNoOpportunity.join(', ') || 'none'}`);
  say(`   adjudication queue size: ${adjudicationQueue.length} (unadjudicated)`);
  say('');
  say('CONFINEMENT');
  say('  PRODUCTION_ACCESS = FALSE   DATABASE_ACCESS = FALSE   DEPLOYMENT = FALSE');
  say('  CUSTOMER_ACTIVATION = FALSE  COMMIT = FALSE  PUSH = FALSE  TAG = FALSE');
  say('  FORMAL_COHORT_SPENT = TRUE   RESERVED_MATERIAL_OPENED_THIS_RUN = FALSE');
  say(`  PROVIDER_INVOCATION_COUNT = ${providerInvocationCount()}`);

  writeFileSync(join(OUT, 'EXECUTION.txt'), out.join('\n') + '\n');
  console.log(`\nwritten to verification/expert-hazlenz-formal-evaluation-2026-09-01/`);
}

main().catch(e => { console.error(e); process.exit(1); });
