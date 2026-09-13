/**
 * §140 -- HOSTED DEVELOPMENT PROBE against the §139-remediated Expert HazLenz contract.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * Not a formal evaluation. Not a rerun of the spent cohort. Not a replacement cohort. Not an
 * acceptance run. Not a threshold-tuning exercise. Not evidence about M14.
 *
 * The spent cohort `hazlenz.expert.formal.cohort.65.v1+d7c8f9c15f0a` is not read, not imported and
 * not reachable from here: this file imports its rows from ONE module,
 * `fixtures/hosted-remediation-probe-v1.ts`, and a pre-spend gate proves that by reading this
 * script's own source and refusing if any formal-cohort selector, executor or frozen artifact path
 * appears in it. No reserved material is opened.
 *
 * ==================== WHAT IT MEASURES ====================
 *
 * Eight named model-behaviour questions, all of them DEVELOPMENT diagnostics with no threshold
 * inherited from the frozen measurement contract:
 *
 *   P1 clarification overproduction        P5 governed-evidence abstention
 *   P2 genuine-gap retention               P6 governed-evidence usability
 *   P3 affectedDecision labelling          P7 citation input leakage / output fail-closed
 *   P4 relatesToCandidateKey population    P8 collection-routing regression
 *
 * ==================== THE ONE-WAY DOOR ====================
 *
 * Everything before the first provider request is reversible. The gate below constructs no provider
 * and issues no request; `PROBE_SPENT` becomes true at the instant the first request is issued and
 * is never reset, including if that request fails.
 *
 * ==================== M14 ====================
 *
 * ONE ARM. `BASE` only. No permutation is built, no permuted request is issued, and no order-
 * sensitivity quantity is computed anywhere in this file. `M14_REMEDIATION_STATUS = NOT_ATTEMPTED`.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash, randomUUID } from 'crypto';

/**
 * The same minimal reader the other hosted probes use, for the same reason: the credential path
 * stays auditable in one visible place. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED.
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
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  HOSTED_REMEDIATION_PROBE_FIXTURES, HOSTED_REMEDIATION_PROBE_ROWS, PROBE_FIXTURE_SET_VERSION,
  fixtureByRowId, rowsWithRole, type ProbeFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/hosted-remediation-probe-v1';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertUserPrompt, expertPromptIdentity,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  CITATION_SHAPED_PATTERN, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';
import {
  WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent,
} from './lib/expert-execution-budget';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems, RUN_RECORD_FILE,
  RUN_RECORD_STORE_VERSION,
} from './lib/expert-run-record-store';
import type { CallRecord, CohortRunRecord } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-hosted-remediation-probe-2026-09-02');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(readFileSync(p));

// ---------------------------------------------------------------- the authorized envelope

/**
 * The product-owner envelope for this operation, transcribed. The spend ceiling is the LOWER of the
 * authorized $3.00 and what the existing frozen cost model prices this run at, exactly as the
 * authorization directs: 20 requests at the frozen worst case.
 */
const AUTHORIZED_REQUEST_CEILING = 20;
const TARGET_LOGICAL_CALLS = 16;
const AUTHORIZED_SPEND_CEILING_USD = 3.00;
const MODEL_PRICED_CEILING_USD = AUTHORIZED_REQUEST_CEILING * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(AUTHORIZED_SPEND_CEILING_USD, MODEL_PRICED_CEILING_USD);
const RETRY_REQUEST_BUDGET = AUTHORIZED_REQUEST_CEILING - TARGET_LOGICAL_CALLS;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';

/** Historical, immutable, and NOT a live counter: the formal run's own recorded total. */
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

/** Source files whose identity is recorded before spend. */
const IDENTITY_FILES = [
  'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-contract.types.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-normalization.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-runner.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-provider.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-input-constructor.ts',
  'backend/src/hazlenz/expert-hazlenz/expert-authority-merge.ts',
  'backend/src/hazlenz/expert-hazlenz/fixtures/hosted-remediation-probe-v1.ts',
  'backend/src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts',
  'backend/scripts/lib/expert-cohort-harness.ts',
  'backend/scripts/lib/expert-run-record-store.ts',
  'backend/scripts/lib/expert-execution-budget.ts',
  'backend/scripts/probe-expert-hosted-remediation-2026-09-02.ts',
];

// ---------------------------------------------------------------- gate plumbing

const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
let gateFailed = false;
function check(id: string, ok: boolean, detail: string): void {
  gate.push({ id, ok, detail });
  if (!ok) gateFailed = true;
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${id}  ${detail}`);
}

// ---------------------------------------------------------------- measurement helpers

/** Every free-text string a validated analysis carries, so prose can be scanned mechanically. */
function analysisStrings(a: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 8 || a === null || a === undefined) return out;
  if (typeof a === 'string') { out.push(a); return out; }
  if (typeof a !== 'object') return out;
  if (Array.isArray(a)) { a.forEach(v => analysisStrings(v, out, depth + 1)); return out; }
  Object.values(a as Record<string, unknown>).forEach(v => analysisStrings(v, out, depth + 1));
  return out;
}

/**
 * A MECHANICAL signal that prose reaches for a governed record or a regulatory obligation.
 *
 * Deliberately over-inclusive and deliberately NOT a verdict. It flags text for a human to read; the
 * report prints the matched sentences verbatim beside the flag so the reader judges rather than
 * trusting a regex. An abstention classification in this probe is a DEVELOPMENT classification made
 * from that verbatim text, not a scored measure.
 */
const OBLIGATION_LANGUAGE =
  /\b(shall|must be|is required|are required|requires|regulation|regulatory|standard requires|OSHA|permit-required|the supplied record|record R\d)\b/i;
const RECORD_HANDLE = /\bR\d\b/;

interface CallView {
  rowId: string;
  fixture: ProbeFixture;
  call: CallRecord;
}

// ---------------------------------------------------------------- main

(async () => {
  console.log('§140 EXPERT HAZLENZ — HOSTED DEVELOPMENT REMEDIATION PROBE');
  console.log('='.repeat(100));
  console.log('\n--- PHASE 0. PRE-SPEND GATE. No provider is constructed until every line passes.\n');

  // ---- A. fixture-set integrity
  const rows = HOSTED_REMEDIATION_PROBE_ROWS;
  check('A.1 fixture count', rows.length === TARGET_LOGICAL_CALLS,
    `${rows.length} rows (target ${TARGET_LOGICAL_CALLS})`);
  const rowProblems = rows.flatMap(validateCohortRow);
  check('A.2 every row is structurally scoreable', rowProblems.length === 0,
    rowProblems.length === 0 ? 'validateCohortRow: 0 problems'
      : rowProblems.map(p => `${p.rowId}/${p.code}`).join(', '));
  check('A.3 row ids are development ids', rows.every(r => r.source.rowId.startsWith('DP-')),
    rows.map(r => r.source.rowId).join(' '));
  check('A.4 row ids are unique',
    new Set(rows.map(r => r.source.rowId)).size === rows.length, 'no duplicate row id');

  // Role minimums the authorization named.
  const roleCount = (role: Parameters<typeof rowsWithRole>[0]) => rowsWithRole(role).length;
  check('A.5 >=4 NO-GAP negative controls', roleCount('NO_GAP_CONTROL') >= 4,
    `${roleCount('NO_GAP_CONTROL')}`);
  check('A.6 >=4 TRUE-GAP positive controls', roleCount('TRUE_GAP_CONTROL') >= 4,
    `${roleCount('TRUE_GAP_CONTROL')}`);
  check('A.7 >=2 active-candidate/existence conflict rows', roleCount('LINKAGE_CONFLICT') >= 2,
    `${roleCount('LINKAGE_CONFLICT')}`);
  check('A.8 governed relevance quartet present',
    roleCount('GOVERNED_RELEVANT') >= 1 && roleCount('GOVERNED_UNRELATED') >= 1
    && roleCount('GOVERNED_ABSENT') >= 1 && roleCount('GOVERNED_NARROWER') >= 1,
    `relevant ${roleCount('GOVERNED_RELEVANT')}, unrelated ${roleCount('GOVERNED_UNRELATED')}, `
    + `absent ${roleCount('GOVERNED_ABSENT')}, narrower ${roleCount('GOVERNED_NARROWER')}`);
  check('A.9 >=1 citation adversarial row', roleCount('CITATION_ADVERSARIAL') >= 1,
    `${roleCount('CITATION_ADVERSARIAL')}`);
  check('A.10 >=2 empty-collection routing controls', roleCount('EMPTY_COLLECTION_CONTROL') >= 2,
    `${roleCount('EMPTY_COLLECTION_CONTROL')}`);
  const trueGapRows = rowsWithRole('TRUE_GAP_CONTROL');
  check('A.11 each TRUE-GAP row carries EXACTLY one gap',
    trueGapRows.every(f => f.row.truth.decisionCriticalGaps.length === 1),
    trueGapRows.map(f => `${f.row.source.rowId}:${f.row.truth.decisionCriticalGaps.length}`).join(' '));
  check('A.12 TRUE-GAP rows cover distinct affectedDecision values',
    new Set(trueGapRows.map(f => f.row.truth.decisionCriticalGaps[0]?.affectedDecision)).size
      === trueGapRows.length,
    trueGapRows.map(f => f.row.truth.decisionCriticalGaps[0]?.affectedDecision).join(' '));
  check('A.13 each NO-GAP control owes NO gap',
    rowsWithRole('NO_GAP_CONTROL').every(f => f.row.truth.decisionCriticalGaps.length === 0),
    'decisionCriticalGaps empty on all NO-GAP controls');

  // ---- B. containment: no formal / reserved path is reachable from this script
  const selfSource = readFileSync(__filename, 'utf8');
  const FORBIDDEN_IMPORTS = [
    'expert-cohort-65-selection', 'execute-formal-cohort-65', 'freeze-formal-cohort-65',
    'assemble-formal-cohort', 'expert-hazlenz-formal-cohort-frozen', 'expert-hazlenz-formal-evaluation',
    'expert-hazlenz-d86-reserved-open', 'open-d86-reserved-offsets', 'classify-reserved-rows',
    'COHORT-MANIFEST', 'ADJUDICATIONS', 'RECOVERED-MEASURES',
  ];
  const importLines = selfSource.split('\n')
    .filter(l => /^\s*(import|const .*= *require)/.test(l)).join('\n');
  const offenders = FORBIDDEN_IMPORTS.filter(n => importLines.includes(n));
  check('B.1 no formal-cohort or reserved-material path is imported', offenders.length === 0,
    offenders.length === 0 ? 'clean' : offenders.join(', '));
  check('B.2 rows come from exactly one development fixture module',
    importLines.includes('fixtures/hosted-remediation-probe-v1'),
    PROBE_FIXTURE_SET_VERSION);
  // B.3 is asserted below, on the requests the harness actually built, rather than on this file's
  // prose: the only arm that may exist in this operation is BASE. See D.1.

  // ---- C. execution identity
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('C.1 model identity is exactly the authorized model', cfg.model === BOUND_MODEL,
    `${cfg.model}`);
  check('C.2 endpoint is the vendor API host', /^https:\/\/api\.anthropic\.com\/?$/.test(cfg.endpoint),
    cfg.endpoint);
  check('C.3 thinking is disabled, as on every prior hosted run', cfg.thinking === 'disabled',
    cfg.thinking);
  check('C.4 a credential is present (value never read, logged or persisted)',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.trim().length > 0,
    process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY set' : 'ANTHROPIC_API_KEY MISSING');

  // ---- D. prompt / schema identity, recorded BEFORE spend
  //
  // Built in DISABLED mode: every request is constructed, every row validated, and no provider is
  // touched. `providerInvocationCount()` is asserted still zero afterwards.
  resetProviderInvocationCount();
  const dry = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: TARGET_LOGICAL_CALLS, spendCeilingUsd: 0,
    arms: ['BASE'], processId: 'dry-run', nowIso: new Date().toISOString(),
  });
  check('D.1 dry run built one request per row and called nothing',
    dry.requestsBuilt.length === rows.length && providerInvocationCount() === 0,
    `${dry.requestsBuilt.length} requests built, ${providerInvocationCount()} provider invocations`);
  // B.3, deferred from above: ONE ARM. M14 confinement is a property of what was built, not a
  // promise made in a comment.
  check('B.3 every built request is the BASE arm — M14 is not attempted',
    dry.requestsBuilt.every(r => r.arm === 'BASE'),
    `${new Set(dry.requestsBuilt.map(r => r.arm)).size} distinct arm(s): `
    + `${[...new Set(dry.requestsBuilt.map(r => r.arm))].join(',')}`);

  const identity = expertPromptIdentity(dry.requestsBuilt[0].input);
  console.log(`\n      prompt label        ${identity.promptVersion}`);
  console.log(`      contract            ${identity.contractVersion}`);
  console.log(`      system prompt sha   ${identity.systemPromptSha256}`);
  console.log(`      wire schema sha     ${identity.wireSchemaSha256}  (row DP-A1 vocabulary)\n`);
  check('D.2 prompt label is the remediated version', identity.promptVersion === 'hazlenz.expert.prompt.v7',
    identity.promptVersion);

  // ---- E. the truth key did not leak into any request
  const leaks: string[] = [];
  for (const built of dry.requestsBuilt) {
    const serialized = JSON.stringify(built.input);
    for (const s of truthOnlyStrings(
      rows.find(r => r.source.rowId === built.rowId)!)) {
      if (serialized.includes(s)) leaks.push(`${built.rowId}: ${s.slice(0, 60)}`);
    }
  }
  check('E.1 no truth-key-only string appears in any built request', leaks.length === 0,
    leaks.length === 0 ? `${dry.requestsBuilt.length} requests scanned` : leaks.join(' | '));

  // ---- F. P7, the INPUT half: citation-shaped text must not reach the model
  check('F.1 the system prompt carries no citation-shaped text',
    !CITATION_SHAPED_PATTERN.test(EXPERT_SYSTEM_PROMPT), 'EXPERT_SYSTEM_PROMPT clean');
  const promptLeaks: string[] = [];
  const rawRecordCitations: string[] = [];
  for (const built of dry.requestsBuilt) {
    const userPrompt = buildExpertUserPrompt(built.input);
    if (CITATION_SHAPED_PATTERN.test(userPrompt)) promptLeaks.push(built.rowId);
    for (const g of built.input.governedStandards) {
      for (const t of [g.title ?? '', g.approvedText ?? '']) {
        if (CITATION_SHAPED_PATTERN.test(t)) rawRecordCitations.push(built.rowId);
      }
    }
  }
  check('F.2 no built user prompt carries citation-shaped text', promptLeaks.length === 0,
    promptLeaks.length === 0 ? `${dry.requestsBuilt.length} prompts scanned`
      : promptLeaks.join(', '));
  check('F.3 the redaction was actually exercised (records DID carry citations pre-render)',
    rawRecordCitations.length > 0,
    `${new Set(rawRecordCitations).size} row(s) supplied citation-bearing record text`);

  // ---- G. budget
  assertBudgetInternallyConsistent();
  check('G.1 spend ceiling is the LOWER of authorized and model-priced',
    Math.abs(SPEND_CEILING_USD - Math.min(AUTHORIZED_SPEND_CEILING_USD, MODEL_PRICED_CEILING_USD))
      < 1e-9,
    `authorized $${AUTHORIZED_SPEND_CEILING_USD.toFixed(2)}, model-priced `
    + `$${MODEL_PRICED_CEILING_USD.toFixed(4)} -> enforcing $${SPEND_CEILING_USD.toFixed(4)}`);
  check('G.2 request ceiling covers the target calls plus the retry allowance',
    TARGET_LOGICAL_CALLS + RETRY_REQUEST_BUDGET === AUTHORIZED_REQUEST_CEILING,
    `${TARGET_LOGICAL_CALLS} + ${RETRY_REQUEST_BUDGET} = ${AUTHORIZED_REQUEST_CEILING}`);
  check('G.3 prospective worst case is priced from the frozen cost model',
    WORST_CASE_REQUEST_USD > 0, `$${WORST_CASE_REQUEST_USD.toFixed(6)} per request`);

  // ---- H. the evidence store must be empty before the first request
  //
  // MEASURE-ONLY re-derives every diagnostic from the records already on disk and issues no
  // request, so the emptiness rule is inverted: the store must be PRESENT and readable. Recomputing
  // a measure from persisted evidence is the whole reason the evidence is persisted; it is not a
  // second run, and it cannot change what the model said.
  mkdirSync(OUT, { recursive: true });
  const storePath = join(OUT, RUN_RECORD_FILE);
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  if (measureOnly) {
    check('H.1 MEASURE-ONLY: the run-record store exists and carries records',
      existsSync(storePath) && readFileSync(storePath, 'utf8').trim().length > 0,
      'recomputing diagnostics from persisted evidence; NO provider request will be issued');
  } else {
    check('H.1 the append-only run-record store is empty or absent',
      !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0,
      storePath.replace(ROOT + '/', ''));
  }

  const identityHashes = Object.fromEntries(
    IDENTITY_FILES.map(f => [f, existsSync(join(ROOT, f)) ? shaFile(join(ROOT, f)) : 'ABSENT']));

  const preSpend = {
    operation: '§140 Expert HazLenz hosted development remediation probe',
    isFormalEvaluation: false,
    capturedAt: new Date().toISOString(),
    git: {
      head: process.env.PROBE_GIT_HEAD ?? null,
      branch: process.env.PROBE_GIT_BRANCH ?? null,
      worktreeDirtyFiles: process.env.PROBE_GIT_DIRTY ?? null,
    },
    providerInvocationCountHistoricalFormal: HISTORICAL_PROVIDER_INVOCATION_COUNT,
    providerInvocationCountThisProcessBeforeSpend: providerInvocationCount(),
    executionIdentity: { provider: BOUND_PROVIDER, model: cfg.model, endpoint: cfg.endpoint,
      apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens, thinking: cfg.thinking,
      inputUsdPerMTok: cfg.inputUsdPerMTok, outputUsdPerMTok: cfg.outputUsdPerMTok },
    promptIdentity: identity,
    contractVersions: {
      input: EXPERT_INPUT_CONTRACT_VERSION,
      analysis: EXPERT_ANALYSIS_CONTRACT_VERSION,
      validator: EXPERT_VALIDATOR_VERSION,
      measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION,
      harness: EXPERT_COHORT_HARNESS_VERSION,
      runRecordStore: RUN_RECORD_STORE_VERSION,
      fixtureSet: PROBE_FIXTURE_SET_VERSION,
    },
    budget: {
      targetLogicalCalls: TARGET_LOGICAL_CALLS,
      hardProviderRequestCeiling: AUTHORIZED_REQUEST_CEILING,
      retryRequestBudget: RETRY_REQUEST_BUDGET,
      maxRetriesPerLogicalCall: 1,
      authorizedSpendCeilingUsd: AUTHORIZED_SPEND_CEILING_USD,
      modelPricedCeilingUsd: Number(MODEL_PRICED_CEILING_USD.toFixed(6)),
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)),
      worstCaseRequestUsd: Number(WORST_CASE_REQUEST_USD.toFixed(6)),
      enforcement: 'prospective, before each request, at the frozen worst case',
    },
    arms: ['BASE'],
    m14RemediationStatus: 'NOT_ATTEMPTED',
    sourceHashes: identityHashes,
    gate,
  };
  /**
   * WRITE-ONCE. The pre-spend identity is a statement about the state of the tree AT THE MOMENT OF
   * SPEND, so a later pass must never be able to restate it.
   *
   * This guard exists because the first MEASURE-ONLY pass of this probe DID overwrite it, and the
   * probe script's own recorded hash consequently names the corrected script rather than the one
   * that issued the sixteen requests. That single value is unrecoverable for this run and is
   * disclosed as such in PROBE-REPORT.md §9. Every other hash in the file names a file that was not
   * edited after the spend, so the identity of the surfaces that shaped the model's answers is
   * intact. A re-measurement now writes a SEPARATE file and cannot touch the original.
   */
  const identityPath = join(OUT, measureOnly
    ? 'PRE-SPEND-IDENTITY.remeasure.json' : 'PRE-SPEND-IDENTITY.json');
  if (!measureOnly && existsSync(identityPath)) {
    throw new Error(`${identityPath} already exists -- refusing to restate a pre-spend identity`);
  }
  writeFileSync(identityPath, JSON.stringify(preSpend, null, 2));

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_HOSTED_REMEDIATION_PROBE_BLOCKED — PRE_SPEND_GATE_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  if (process.env.PROBE_DRY_RUN === '1') {
    console.log('PROBE_DRY_RUN=1 — stopping before spend by request.');
    process.exit(0);
  }

  // ================================================================ PHASE 2/3. SPEND.
  type RunLevelFacts = {
    stopReason: string; identityViolation: string | null;
    accounting: Record<string, number>; retryCauses: string[]; retriesSuppressed: unknown[];
    startedAt: string; finishedAt: string; providerInvocationsThisProcess: number;
  };

  let midRunReadBackProof: { rowId: string; provenBeforeExit: boolean; recordsOnDisk: number }
    | null = null;
  let runFacts: RunLevelFacts;

  if (measureOnly) {
    // Run-level facts are FACTS ABOUT THE RUN and are read back from what that run recorded; they
    // are never recomputed, because nothing here re-executes anything. Only per-call diagnostics
    // are re-derived, and only from RUN-RECORDS.jsonl.
    console.log('--- MEASURE-ONLY. $0.00. Re-deriving diagnostics from persisted evidence.\n');
    const prior = JSON.parse(readFileSync(join(OUT, 'RESULTS-SUMMARY.json'), 'utf8'));
    runFacts = {
      stopReason: prior.stopReason, identityViolation: prior.identityViolation,
      accounting: prior.accounting, retryCauses: prior.retryCauses,
      retriesSuppressed: prior.retriesSuppressed, startedAt: prior.startedAt,
      finishedAt: prior.finishedAt,
      providerInvocationsThisProcess: prior.providerInvocationsThisProcess,
    };
    midRunReadBackProof = prior.persistence?.midRunReadBackProof ?? null;
  } else {
  console.log('--- PHASE 2/3. SPEND. The probe is SPENT at the first request.\n');

  const store = createRunRecordStore(OUT);

  const provider = new AnthropicExpertProvider(cfg);
  resetProviderInvocationCount();
  const startedAt = new Date().toISOString();

  const run = await runFormalCohort(rows, {
    mode: 'ENABLED',
    provider,
    callCeiling: TARGET_LOGICAL_CALLS,
    requestCeiling: AUTHORIZED_REQUEST_CEILING,
    retryRequestBudget: RETRY_REQUEST_BUDGET,
    worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
    spendCeilingUsd: SPEND_CEILING_USD,
    frozenIdentity: { provider: BOUND_PROVIDER, model: BOUND_MODEL },
    arms: ['BASE'],
    processId: randomUUID().slice(0, 8),
    nowIso: new Date().toISOString(),
    recordSink: (record: CohortRunRecord) => {
      store.append(record);
      // PHASE 3 requirement: prove a COMPLETED record is readable from disk while the process is
      // still running. Reading `run.records` from memory would prove nothing -- the 2026-09-01 run
      // had them in memory too and lost every one at exit.
      if (!midRunReadBackProof) {
        const back = readRunRecordStore(OUT);
        midRunReadBackProof = {
          rowId: record.row.source.rowId,
          provenBeforeExit:
            back.problems.length === 0 && back.records.length >= 1
            && back.records[0].row?.source?.rowId === record.row.source.rowId,
          recordsOnDisk: back.records.length,
        };
        console.log(`      [persistence proof] ${back.records.length} record(s) read back from `
          + `disk mid-run; first is ${back.records[0]?.row?.source?.rowId}`);
      }
      const c = record.calls[0];
      console.log(`      ${record.row.source.rowId.padEnd(7)} ${String(c?.layerStatus).padEnd(16)}`
        + ` cand ${String(c?.analysis?.expertHazardCandidates.length ?? '-').padStart(2)}`
        + ` clar ${String(c?.analysis?.decisionCriticalClarifications.length ?? '-').padStart(2)}`
        + ` ins ${String(c?.analysis?.crossHazardInsights.length ?? '-').padStart(2)}`
        + ` dis ${String(c?.analysis?.disagreements.length ?? '-').padStart(2)}`
        + `  ${String(c?.latencyMs ?? 0).padStart(6)}ms  $${(c?.costUsd ?? 0).toFixed(5)}`);
    },
  });
  store.close();
  const finishedAt = new Date().toISOString();
  runFacts = {
    stopReason: run.stopReason, identityViolation: run.identityViolation,
    accounting: run.accounting as unknown as Record<string, number>,
    retryCauses: run.retryCauses, retriesSuppressed: run.retriesSuppressed,
    startedAt, finishedAt, providerInvocationsThisProcess: providerInvocationCount(),
  };

  console.log(`\n  stop reason              ${run.stopReason}`);
  console.log(`  logical calls            ${run.accounting.callsAttempted} attempted, `
    + `${run.accounting.callsCompleted} completed`);
  console.log(`  provider requests        ${run.accounting.providerRequestsAttempted} `
    + `(${run.accounting.retryRequestsAttempted} retries)`);
  console.log(`  provider invocations     ${providerInvocationCount()}`);
  console.log(`  tokens                   ${run.accounting.inputTokens} in / `
    + `${run.accounting.outputTokens} out`);
  console.log(`  spend                    $${run.accounting.spendUsd.toFixed(6)} of `
    + `$${SPEND_CEILING_USD.toFixed(4)}`);
  }

  // ================================================================ PHASE 3. persistence proof
  const readBack = readRunRecordStore(OUT);
  const completeness = runRecordCompletenessProblems(readBack.records, {
    rowOrder: rows.map(r => r.source.rowId), arms: ['BASE'],
  });

  // ================================================================ PHASE 4. MEASURE.
  //
  // DEVELOPMENT DIAGNOSTICS ONLY. No frozen threshold is applied, no formal measure is computed,
  // and `run.scoring` is deliberately discarded below rather than read.
  const views: CallView[] = readBack.records.flatMap(r =>
    (r.calls ?? []).map(c => ({
      rowId: r.row.source.rowId, fixture: fixtureByRowId(r.row.source.rowId)!, call: c,
    })));

  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const rejected = views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED');
  const failed = views.filter(v => v.call.layerStatus !== 'PRESENT'
    && v.call.layerStatus !== 'OUTPUT_REJECTED');

  const clar = (v: CallView) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: CallView) => v.call.analysis?.expertHazardCandidates ?? [];

  const withRole = (role: Parameters<typeof rowsWithRole>[0]) =>
    present.filter(v => v.fixture.roles.includes(role));

  const noGap = withRole('NO_GAP_CONTROL');
  const trueGap = withRole('TRUE_GAP_CONTROL');
  const linkage = withRole('LINKAGE_CONFLICT');

  const totalClarifications = present.reduce((t, v) => t + clar(v).length, 0);
  const noGapSilent = noGap.filter(v => clar(v).length === 0);
  const noGapClarificationCount = noGap.reduce((t, v) => t + clar(v).length, 0);

  /**
   * TRUE-GAP retention, decided MECHANICALLY where it can be and reported verbatim where it cannot.
   *
   * The mechanical part: did the row emit at least one clarification, and does any emitted
   * clarification carry the truth key's `affectedDecision`? Whether a question is SEMANTICALLY the
   * authored gap is a reading, so every question on every TRUE-GAP row is printed in full in the
   * report and the semantic verdict is presented as a development classification, not as a score.
   */
  const trueGapDetail = trueGap.map(v => {
    const gap = v.fixture.row.truth.decisionCriticalGaps[0];
    const questions = clar(v);
    return {
      rowId: v.rowId,
      authoredGap: gap.description,
      authoredAffectedDecision: gap.affectedDecision,
      emitted: questions.map(q => ({
        question: q.question,
        affectedDecision: q.affectedDecision,
        criticality: q.criticality,
        evidenceGap: q.evidenceGap,
        whyItMatters: q.whyItMatters,
        relatesToCandidateKey: q.relatesToCandidateKey ?? null,
      })),
      anyQuestionEmitted: questions.length > 0,
      labelMatchOnSomeQuestion: questions.some(q => q.affectedDecision === gap.affectedDecision),
    };
  });

  // affectedDecision distribution across the whole probe.
  const decisionHistogram = Object.fromEntries(EXPERT_AFFECTED_DECISIONS.map(d => [d,
    present.reduce((t, v) => t + clar(v).filter(c => c.affectedDecision === d).length, 0)]));

  // ---- linkage / arbitration
  //
  // OPPORTUNITY is defined mechanically and the definition is stated in the report: a clarification
  // emitted on a call that also emitted at least one candidate is an opportunity to declare a link.
  // That is an UPPER bound on semantically-warranted linkage, and it is reported as one.
  const linkageOpportunities = present.reduce(
    (t, v) => t + (cands(v).length > 0 ? clar(v).length : 0), 0);
  const linkagePopulated = present.reduce(
    (t, v) => t + clar(v).filter(c => typeof c.relatesToCandidateKey === 'string').length, 0);
  const linkageValid = present.reduce((t, v) => {
    const keys = new Set(cands(v).map(c => c.candidateKey));
    return t + clar(v).filter(c => typeof c.relatesToCandidateKey === 'string'
      && keys.has(c.relatesToCandidateKey)).length;
  }, 0);
  const linkageInvalid = linkagePopulated - linkageValid;

  const arbitrationEvents = views.flatMap(v =>
    (v.call.issues ?? [])
      .filter(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE')
      .map(i => ({ rowId: v.rowId, detail: i.detail })));

  /**
   * Contradictions surviving arbitration, reported as an UPPER BOUND and labelled as one.
   *
   * `HAZARD_EXISTENCE` questions that survive on a call that also carries an ACTIVE candidate. This
   * is NOT family-coupled -- §138 measured that 6 of 11 row-level flags fired on a question about a
   * different hazard entirely -- so a count here is a ceiling on real contradiction, never a
   * measurement of it. The questions are printed verbatim so the reader can separate the two.
   */
  const survivingExistence = present.flatMap(v => {
    const active = cands(v).filter(c => c.assertedConditionState === 'ACTIVE');
    if (active.length === 0) return [];
    return clar(v).filter(c => c.affectedDecision === 'HAZARD_EXISTENCE').map(c => ({
      rowId: v.rowId, question: c.question,
      relatesToCandidateKey: c.relatesToCandidateKey ?? null,
      activeCandidates: active.map(a => `${a.candidateKey}:${a.hazardFamily}`),
    }));
  });

  let linkageClassification: 'LINKAGE_READY' | 'LINKAGE_PARTIAL' | 'LINKAGE_NOT_WORKING';
  if (linkageOpportunities === 0) {
    // No opportunity arose. That is not evidence the feature works, and it is not evidence it is
    // broken. It is reported as untested, under the most conservative of the three labels.
    linkageClassification = 'LINKAGE_NOT_WORKING';
  } else if (linkageValid >= Math.ceil(linkageOpportunities * 0.6)) {
    linkageClassification = 'LINKAGE_READY';
  } else if (linkageValid > 0) {
    linkageClassification = 'LINKAGE_PARTIAL';
  } else {
    linkageClassification = 'LINKAGE_NOT_WORKING';
  }

  // ---- governed evidence
  const governedDetail = present
    .filter(v => v.fixture.roles.some(r => r.startsWith('GOVERNED_'))
      || v.fixture.roles.includes('CITATION_ADVERSARIAL'))
    .map(v => {
      const strings = analysisStrings(v.call.analysis);
      const obligationSentences = strings
        .flatMap(s => s.split(/(?<=[.!?])\s+/))
        .filter(s => OBLIGATION_LANGUAGE.test(s));
      return {
        rowId: v.rowId,
        roles: v.fixture.roles,
        recordsSupplied: v.fixture.row.source.governedStandards.map(g => ({
          title: g.title, backingState: g.backingState })),
        referencesARecordHandle: strings.some(s => RECORD_HANDLE.test(s)),
        obligationLanguageSentences: obligationSentences,
        summary: v.call.analysis?.expertExplanation?.summary ?? null,
        candidateFamilies: cands(v).map(c => `${c.hazardFamily}:${c.assertedConditionState}`),
        forbiddenFamiliesEmitted: cands(v)
          .map(c => c.hazardFamily)
          .filter(f => v.fixture.row.truth.forbiddenHazardFamilies.includes(f)),
      };
    });

  // ---- citation behaviour, output half
  const citationShapedOutputs = views.flatMap(v =>
    (v.call.issues ?? [])
      .filter(i => i.code === 'CITATION_SHAPED_TEXT_NOT_PERMITTED')
      .map(i => ({ rowId: v.rowId, detail: i.detail })));
  /**
   * SCOPED TO `merged.expertAdvisory`, AND THE SCOPE IS THE MEASUREMENT.
   *
   * A first version of this scan read the WHOLE `MergedIntelligence` and reported four hits. All
   * four were the `governed.citations[].citation` values that the caller SUPPLIED to
   * `mergeExpertIntelligence` as protected authority input -- they are the governed regulatory
   * block, they are copied through unfiltered by design, and Expert never touched them. Counting
   * them as "an unsupported citation surviving to the customer" would have been a false defect
   * report about the one property this probe most needs to state accurately.
   *
   * What the citation contract is about is EXPERT PROSE. `expertAdvisory` is exactly the Expert-
   * contributed portion of the merged output, so that is what is scanned. The governed-block count
   * is reported separately, as context, and is never a defect.
   */
  const citationInMerged = views.flatMap(v => {
    const hit = analysisStrings((v.call.merged as Record<string, unknown> | null)?.expertAdvisory)
      .find(s => CITATION_SHAPED_PATTERN.test(s));
    return hit ? [{ rowId: v.rowId, text: hit.slice(0, 160) }] : [];
  });
  const citationInGovernedAuthorityBlock = views.reduce((t, v) =>
    t + analysisStrings((v.call.merged as Record<string, unknown> | null)?.governed)
      .filter(s => CITATION_SHAPED_PATTERN.test(s)).length, 0);
  const citationInValidated = present.flatMap(v => {
    const hit = analysisStrings(v.call.analysis).find(s => CITATION_SHAPED_PATTERN.test(s));
    return hit ? [{ rowId: v.rowId, text: hit.slice(0, 160) }] : [];
  });

  // ---- collection routing
  const routing = {
    expertCandidates: present.reduce((t, v) => t + cands(v).length, 0),
    decisionCriticalClarifications: totalClarifications,
    crossHazardInsights: present.reduce(
      (t, v) => t + (v.call.analysis?.crossHazardInsights.length ?? 0), 0),
    disagreements: present.reduce((t, v) => t + (v.call.analysis?.disagreements.length ?? 0), 0),
    emptyRates: {
      expertHazardCandidates: present.filter(v => cands(v).length === 0).length,
      decisionCriticalClarifications: present.filter(v => clar(v).length === 0).length,
      crossHazardInsights:
        present.filter(v => (v.call.analysis?.crossHazardInsights.length ?? 0) === 0).length,
      disagreements: present.filter(v => (v.call.analysis?.disagreements.length ?? 0) === 0).length,
      denominator: present.length,
    },
    /**
     * UNDERPRODUCTION, MEASURED AGAINST JOINT COVERAGE -- and that is a correction, disclosed.
     *
     * A first version compared truth-present families against EXPERT candidates alone and reported
     * eight "misses". That measure is wrong for this contract: Expert is ADDITIVE, and the prompt
     * tells it in as many words not to restate a family the deterministic engine already assessed.
     * Counting a family the engine found and Expert correctly declined to duplicate as an Expert
     * miss would penalise the model for obeying the contract.
     *
     * The real question is whether the PRODUCT lost a hazard: a truth-present family covered by
     * NEITHER layer. That is what is counted here; the Expert-only column is retained beside it so
     * the division of labour stays visible rather than being averaged away.
     */
    presentFamiliesCoveredByNeitherLayer: readBack.records.flatMap(r => {
      const v = views.find(x => x.rowId === r.row.source.rowId);
      if (!v) return [];
      const expert = cands(v).map(c => c.hazardFamily);
      const det = r.deterministicFamiliesEmitted ?? [];
      const missed = v.fixture.row.truth.presentHazardFamilies
        .filter(f => !expert.includes(f) && !det.includes(f));
      return missed.length === 0 ? [] : [{
        rowId: v.rowId, truthPresent: v.fixture.row.truth.presentHazardFamilies,
        deterministicEmitted: det, expertEmitted: expert, coveredByNeither: missed,
      }];
    }),
    /** Families Expert supplied that the deterministic engine did NOT emit. Additive recall. */
    expertOnlyFamilies: readBack.records.flatMap(r => {
      const v = views.find(x => x.rowId === r.row.source.rowId);
      if (!v) return [];
      const det = r.deterministicFamiliesEmitted ?? [];
      const added = [...new Set(cands(v).map(c => c.hazardFamily).filter(f => !det.includes(f)))];
      return added.length === 0 ? [] : [{ rowId: v.rowId, added }];
    }),
    outcomes: Object.fromEntries(
      present.reduce((m, v) => {
        const o = String(v.call.analysis?.outcome);
        m.set(o, (m.get(o) ?? 0) + 1); return m;
      }, new Map<string, number>())),
  };

  // ---- per-fixture roll-up
  const perFixture = views.map(v => ({
    rowId: v.rowId,
    roles: v.fixture.roles,
    layerStatus: v.call.layerStatus,
    failureKind: v.call.failureKind,
    outcome: v.call.analysis?.outcome ?? null,
    candidates: cands(v).map(c => ({
      key: c.candidateKey, family: c.hazardFamily, state: c.assertedConditionState,
      confidence: c.confidence, relationship: c.relationshipToDeterministic,
      quotes: c.evidence.length,
    })),
    clarifications: clar(v).map(c => ({
      question: c.question, affectedDecision: c.affectedDecision, criticality: c.criticality,
      relatesToCandidateKey: c.relatesToCandidateKey ?? null,
    })),
    insights: (v.call.analysis?.crossHazardInsights ?? []).map(i => ({
      kind: i.interactionKind, participants: i.participants })),
    disagreements: (v.call.analysis?.disagreements ?? []).map(d => ({
      surface: d.surface, type: d.disagreementType })),
    summary: v.call.analysis?.expertExplanation?.summary ?? null,
    uncertainty: v.call.analysis?.uncertainty.statements ?? [],
    issues: (v.call.issues ?? []).map(i => `${i.code}${i.index !== undefined ? `[${i.index}]` : ''}`),
    mergeViolations: v.call.mergeViolations ?? [],
    attempts: (v.call.attempts ?? []).map(a => ({
      index: a.attemptIndex, ok: a.ok, failureKind: a.failureKind, causedRetry: a.causedRetry })),
    latencyMs: v.call.latencyMs,
    inputTokens: v.call.inputTokens,
    outputTokens: v.call.outputTokens,
    costUsd: v.call.costUsd,
    modelIdentity: v.call.modelIdentity,
  }));

  // ---- development advancement criteria (NOT a formal gate set)
  const criteria = [
    {
      id: 1, name: 'NO-GAP clarification behaviour materially improves',
      target: 'at least 3 of 4 NO-GAP controls emit zero decision-critical clarifications',
      observed: `${noGapSilent.length} of ${noGap.length} silent`,
      met: noGap.length >= 4 && noGapSilent.length >= 3,
    },
    {
      id: 2, name: 'TRUE-GAP retention remains strong',
      target: 'at least 3 of 4 TRUE-GAP controls receive a semantically correct clarification',
      observed: `${trueGapDetail.filter(t => t.anyQuestionEmitted).length} of ${trueGap.length} `
        + `emitted a question; label match on `
        + `${trueGapDetail.filter(t => t.labelMatchOnSomeQuestion).length}`,
      met: null as boolean | null,   // requires the semantic reading recorded in the report
    },
    {
      id: 3, name: 'no accepted unsupported citation survives validation/merge',
      target: '0',
      observed: `${citationInValidated.length} in validated Expert output, `
        + `${citationInMerged.length} in the Expert-advisory block of merged output, `
        + `${citationShapedOutputs.length} refused at the boundary. `
        + `(${citationInGovernedAuthorityBlock} citation strings appear in the GOVERNED AUTHORITY `
        + `block of merged output: those are the supplied records copied through by design and are `
        + `not Expert output.)`,
      met: citationInValidated.length === 0 && citationInMerged.length === 0,
    },
    {
      id: 4, name: 'unrelated / absent governed evidence produces abstention',
      target: 'all dedicated negative controls',
      observed: 'see GOVERNED-EVIDENCE section — verbatim text recorded for reading',
      met: null as boolean | null,
    },
    {
      id: 5, name: 'relevant governed evidence still supports a correct grounded result',
      target: 'at least one demonstrated positive control',
      observed: 'see GOVERNED-EVIDENCE section — verbatim text recorded for reading',
      met: null as boolean | null,
    },
    {
      id: 6, name: 'no protected deterministic/governed regression',
      target: 'suite comparison before and after',
      observed: 'run outside this script and recorded in the report',
      met: null as boolean | null,
    },
    {
      id: 7, name: 'no new provider identity, budget, persistence or validation defect',
      target: 'none',
      observed: `identityViolation=${runFacts.identityViolation}, `
        + `stopReason=${runFacts.stopReason}, storeProblems=${readBack.problems.length}, `
        + `completeness=${completeness.length}, `
        + `mergeViolations=${perFixture.reduce((t, f) => t + f.mergeViolations.length, 0)}`,
      met: runFacts.identityViolation === null && runFacts.stopReason === 'COMPLETED'
        && readBack.problems.length === 0 && completeness.length === 0
        && perFixture.every(f => f.mergeViolations.length === 0),
    },
  ];

  const results = {
    operation: '§140 Expert HazLenz hosted development remediation probe',
    isFormalEvaluation: false,
    formalGateStatusClaimed: 'NONE',
    m14RemediationStatus: 'NOT_ATTEMPTED',
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason,
    identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting,
    providerInvocationsThisProcess: runFacts.providerInvocationsThisProcess,
    retryCauses: runFacts.retryCauses,
    retriesSuppressed: runFacts.retriesSuppressed,
    callDisposition: {
      present: present.length, outputRejected: rejected.length, providerFailed: failed.length,
    },
    persistence: {
      storeFile: RUN_RECORD_FILE,
      storeSha256: readBack.sha256,
      recordsOnDisk: readBack.records.length,
      parseProblems: readBack.problems,
      completenessProblems: completeness,
      midRunReadBackProof,
    },
    clarificationDiagnostics: {
      totalClarifications,
      averagePerCall: present.length ? Number((totalClarifications / present.length).toFixed(3)) : 0,
      noGapControls: noGap.length,
      noGapControlsSilent: noGapSilent.length,
      noGapControlsSilentProportion:
        noGap.length ? Number((noGapSilent.length / noGap.length).toFixed(3)) : null,
      clarificationsOnNoGapRows: noGapClarificationCount,
      trueGapControls: trueGap.length,
      trueGapControlsWithAQuestion: trueGapDetail.filter(t => t.anyQuestionEmitted).length,
      trueGapControlsWithNoQuestion: trueGapDetail.filter(t => !t.anyQuestionEmitted).length,
      trueGapControlsWithMatchingLabel: trueGapDetail.filter(t => t.labelMatchOnSomeQuestion).length,
      trueGapDetail,
      affectedDecisionHistogram: decisionHistogram,
    },
    linkageDiagnostics: {
      opportunityDefinition:
        'a clarification emitted on a call that also emitted at least one candidate. An UPPER bound '
        + 'on semantically-warranted linkage, not a measurement of it.',
      opportunities: linkageOpportunities,
      populated: linkagePopulated,
      validBindings: linkageValid,
      invalidOrUnresolvedBindings: linkageInvalid,
      populationRate: linkageOpportunities
        ? Number((linkagePopulated / linkageOpportunities).toFixed(3)) : null,
      arbitrationEvents,
      survivingExistenceQuestionsUpperBound: survivingExistence,
      linkageConflictRows: linkage.map(v => v.rowId),
      classification: linkageClassification,
    },
    groundingDiagnostics: governedDetail,
    citationDiagnostics: {
      citationShapedTextInModelInput: promptLeaks.length,
      recordsThatCarriedCitationsBeforeRedaction: new Set(rawRecordCitations).size,
      citationShapedOutputRefusedAtBoundary: citationShapedOutputs,
      citationShapedTextInValidatedOutput: citationInValidated,
      citationShapedTextInMergedCustomerOutput: citationInMerged,
    },
    routingDiagnostics: routing,
    perFixture,
    developmentAdvancementCriteria: criteria,
    limitations: [
      'One arm, one replicate per row. No within-condition divergence is measured and none may be '
        + 'inferred.',
      'No frozen scorer was applied and no formal measure was computed. `run.scoring` was discarded.',
      'M14 order sensitivity was not attempted, not measured and must not be inferred from anything '
        + 'here.',
      'Sixteen development rows are not a cohort. Nothing here has the composition guarantees the '
        + 'formal instrument requires.',
      'Semantic judgements — whether a question IS the authored gap, whether prose abstained — are '
        + 'DEVELOPMENT classifications recorded beside the verbatim text, not scored measures.',
    ],
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 2));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    version: PROBE_FIXTURE_SET_VERSION,
    provenance: 'authored 2026-09-02 for this probe; no reserved material opened; no spent-cohort '
      + 'row read, copied or mimicked',
    rows: HOSTED_REMEDIATION_PROBE_FIXTURES.map(f => ({
      rowId: f.row.source.rowId,
      roles: f.roles,
      whyDiagnostic: f.whyDiagnostic,
      expectedEmptyCollections: f.expectedEmptyCollections,
      caseClasses: classifyRow(f.row),
      observation: f.row.source.observation,
      allowedHazardFamilies: f.row.source.allowedHazardFamilies,
      governedStandards: f.row.source.governedStandards.map(g => ({
        title: g.title, backingState: g.backingState })),
      truth: f.row.truth,
      observationSha256: sha(f.row.source.observation),
    })),
  }, null, 2));
  writeFileSync(join(OUT, 'ATTEMPT-LEDGER.json'), JSON.stringify({
    budget: preSpend.budget,
    stopReason: runFacts.stopReason,
    identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting,
    retryCauses: runFacts.retryCauses,
    retriesSuppressed: runFacts.retriesSuppressed,
    attemptsByCall: perFixture.map(f => ({
      rowId: f.rowId, attempts: f.attempts, latencyMs: f.latencyMs,
      inputTokens: f.inputTokens, outputTokens: f.outputTokens, costUsd: f.costUsd,
      modelIdentity: f.modelIdentity,
    })),
  }, null, 2));

  console.log(`\n  artifacts written to ${OUT.replace(ROOT + '/', '')}`);
  console.log(`  LINKAGE CLASSIFICATION: ${linkageClassification}`);
  console.log(`  NO-GAP silent: ${noGapSilent.length}/${noGap.length}   `
    + `TRUE-GAP with a question: ${trueGapDetail.filter(t => t.anyQuestionEmitted).length}/`
    + `${trueGap.length}   total clarifications: ${totalClarifications}`);
  console.log(`  citation in validated output: ${citationInValidated.length}   `
    + `in merged output: ${citationInMerged.length}`);
  console.log('\nSTOP. The narrative report is written separately.');
})().catch(e => { console.error(e); process.exit(1); });
