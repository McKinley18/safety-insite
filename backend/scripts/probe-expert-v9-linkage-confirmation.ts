/**
 * §144 -- BOUNDED HOSTED LINKAGE CONFIRMATION PROBE against the v9 precedence contract.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * Not a formal evaluation. Not a new formal cohort. Not a rerun of the spent cohort. Not an
 * acceptance run. Not an M14 experiment. Not a broad clarification-recall evaluation. Not a
 * crossHazardInsights validation campaign. No frozen scorer runs; `run.scoring` is discarded.
 *
 * ==================== A NEW SCRIPT, NOT AN EDIT OF THE §142 ONE ====================
 *
 * `probe-expert-hosted-linkage-2026-09-02.ts` is a SPENT instrument. Its SHA-256 is part of its
 * spent identity record, it no longer compiles against the repaired measures API, and it must not be
 * touched. This file is the v9 entrypoint; a pre-spend gate proves it does not import that module.
 *
 * ==================== THE ONE QUESTION ====================
 *
 * §143 made REQUIRED / ALLOWED / FORBIDDEN mutually decidable by ordering them and by fixing the
 * clause that let a candidate-specific PPE question match FORBIDDEN's "general PPE" wording. This
 * probe asks whether that precedence lands in live traffic -- above all on the CL-R3 / CL-F3 pair:
 * two questions identical in FORM, one candidate-specific and one genuinely generic. If the model
 * links on both, or on neither, the rule has not landed.
 *
 * ==================== TWO THINGS THAT MUST NOT HAPPEN ====================
 *
 *   1. NO CONTRADICTION IS COMMISSIONED. A clarification contradicting the asker's own ACTIVE
 *      candidate is a MODEL ERROR. `ARBITRATION_EVENTS = 0` with `NO_NATURAL_OPPORTUNITY` is an
 *      acceptable result and is not a failure.
 *   2. NO FIXTURE TRUTH IS REINTERPRETED AFTER SPEND. The manifest is frozen by §143 and the
 *      pre-spend gate hashes it.
 *
 * ==================== M14 ====================
 *
 * ONE ARM. `BASE`. No permutation, no same-input replicate, no order or reliability conclusion.
 * `M14_REMEDIATION_STATUS = NOT_ATTEMPTED`.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

/** Minimal, auditable credential path. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED. */
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
  CONFIRMATION_PROBE_FIXTURES, CONFIRMATION_PROBE_ROWS, CONFIRMATION_PROBE_BUDGET,
  CONFIRMATION_PROBE_CRITERIA, CONFIRMATION_PROBE_FIXTURE_SET_VERSION,
  confirmationFixtureByRowId, type ConfirmationProbeFixture,
} from '../src/safescope-v2/expert-hazlenz/fixtures/linkage-confirmation-probe-v3';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertUserPrompt, expertPromptIdentity,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  CITATION_SHAPED_PATTERN, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-measurement-contract';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';
import { WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent } from './lib/expert-execution-budget';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems, RUN_RECORD_FILE,
  RUN_RECORD_STORE_VERSION,
} from './lib/expert-run-record-store';
import {
  citationDiagnostics, coverageDiagnostics, linkageDiagnostics, classifyLinkage,
  PROBE_MEASURES_VERSION,
  type CitationCallInput, type CoverageCallInput, type LinkageCallInput,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256, sha256File, writePreSpendIdentityOnce,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';
import type { CallRecord, CohortRunRecord } from
  '../src/safescope-v2/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-v9-linkage-confirmation-2026-09-03');

// ---------------------------------------------------------------- the authorized envelope

const TARGET_LOGICAL_CALLS = CONFIRMATION_PROBE_BUDGET.targetLogicalCalls;            // 9
const REQUEST_CEILING = CONFIRMATION_PROBE_BUDGET.hardProviderRequestCeiling;         // 12
const AUTHORIZED_SPEND_CEILING_USD = CONFIRMATION_PROBE_BUDGET.hardSpendCeilingUsd;   // 2.00
const MODEL_PRICED_CEILING_USD = REQUEST_CEILING * WORST_CASE_REQUEST_USD;            // 1.248
const SPEND_CEILING_USD = Math.min(AUTHORIZED_SPEND_CEILING_USD, MODEL_PRICED_CEILING_USD);
const RETRY_REQUEST_BUDGET = REQUEST_CEILING - TARGET_LOGICAL_CALLS;                  // 3
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';

/** Historical, immutable, NOT a live counter. */
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const PROBE_SCRIPT = 'backend/scripts/probe-expert-v9-linkage-confirmation.ts';
const FIXTURE_MODULE =
  'backend/src/safescope-v2/expert-hazlenz/fixtures/linkage-confirmation-probe-v3.ts';
const NORMALIZATION = 'backend/src/safescope-v2/expert-hazlenz/expert-normalization.ts';
const CONTRACT_TYPES = 'backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts';

// ---------------------------------------------------------------- gate plumbing

const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
let gateFailed = false;
function check(id: string, ok: boolean, detail: string): void {
  gate.push({ id, ok, detail });
  if (!ok) gateFailed = true;
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${id}  ${detail}`);
}
function strings(v: unknown, out: string[] = [], d = 0): string[] {
  if (d > 12 || v === null || v === undefined) return out;
  if (typeof v === 'string') { out.push(v); return out; }
  if (typeof v !== 'object') return out;
  if (Array.isArray(v)) { v.forEach(x => strings(x, out, d + 1)); return out; }
  Object.values(v as Record<string, unknown>).forEach(x => strings(x, out, d + 1));
  return out;
}

interface CallView { rowId: string; fixture: ConfirmationProbeFixture; call: CallRecord }

// ---------------------------------------------------------------- main

(async () => {
  console.log('§144 EXPERT HAZLENZ — v9 BOUNDED LINKAGE CONFIRMATION PROBE');
  console.log('='.repeat(100));
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  console.log(`\n--- PHASE 0/1. PRE-SPEND GATE${dryRun ? '  (DRY RUN — no artifact will be created)' : ''}\n`);

  const rows = CONFIRMATION_PROBE_ROWS;

  // ---- A. fixture set, frozen by §143
  check('A.1 fixture count is the frozen v9 confirmation design',
    rows.length >= 8 && rows.length <= 10, `${rows.length} rows (authorized 8-10)`);
  const rowProblems = rows.flatMap(validateCohortRow);
  check('A.2 every row is structurally scoreable', rowProblems.length === 0,
    rowProblems.length === 0 ? '0 problems' : rowProblems.map(p => `${p.rowId}/${p.code}`).join(', '));
  check('A.3 row ids are v3 confirmation ids', rows.every(r => r.source.rowId.startsWith('CL-')),
    rows.map(r => r.source.rowId).join(' '));
  const truth = (v: string) => CONFIRMATION_PROBE_FIXTURES.filter(f => f.linkageTruth === v);
  check('A.4 >=3 REQUIRED linkage opportunities', truth('REQUIRED').length >= 3,
    truth('REQUIRED').map(f => f.row.source.rowId).join(' '));
  check('A.5 >=3 POSITIVE FORBIDDEN opportunities', truth('FORBIDDEN').length >= 3,
    truth('FORBIDDEN').map(f => f.row.source.rowId).join(' '));
  check('A.6 >=1 NOT_A_LINKAGE_TEST row', truth('NOT_A_LINKAGE_TEST').length >= 1,
    truth('NOT_A_LINKAGE_TEST').map(f => f.row.source.rowId).join(' '));
  check('A.7 >=2 TRUE-GAP clarification-positive controls',
    CONFIRMATION_PROBE_FIXTURES.filter(f => f.roles.includes('TRUE_GAP_CONTROL')).length >= 2,
    `${CONFIRMATION_PROBE_FIXTURES.filter(f => f.roles.includes('TRUE_GAP_CONTROL')).length}`);
  // §143's rule: no blanket labels. Every row states why, and FORBIDDEN states a POSITIVE reason.
  check('A.8 EVERY row carries a linkage rationale — no blanket defaults',
    CONFIRMATION_PROBE_FIXTURES.every(f => f.linkageRationale.trim().length >= 60),
    'the §142 blanket-FORBIDDEN defect cannot recur');
  check('A.9 every FORBIDDEN row states a POSITIVE reason',
    truth('FORBIDDEN').every(f => /POSITIVE REASON/i.test(f.linkageRationale)),
    truth('FORBIDDEN').map(f => f.row.source.rowId).join(' '));
  check('A.10 no fixture commissions a contradiction',
    CONFIRMATION_PROBE_FIXTURES.every(f => f.contradictionIsAModelError === true),
    'a contradiction is a MODEL ERROR and is never a positive control');

  // ---- B. containment
  const selfSource = readFileSync(__filename, 'utf8');
  const importLines = selfSource.split('\n')
    .filter(l => /^\s*(import|const .*= *require)/.test(l)).join('\n');
  const FORBIDDEN_IMPORTS = ['expert-cohort-65-selection', 'execute-formal-cohort-65',
    'freeze-formal-cohort-65', 'assemble-formal-cohort', 'expert-hazlenz-formal-cohort-frozen',
    'expert-hazlenz-formal-evaluation', 'open-d86-reserved-offsets', 'classify-reserved-rows',
    'hosted-remediation-probe-v1', 'hosted-linkage-probe-v2',
    'probe-expert-hosted-linkage-2026-09-02'];
  const offenders = FORBIDDEN_IMPORTS.filter(x => importLines.includes(x));
  check('B.1 no formal-cohort, reserved-material or SPENT-probe path is imported',
    offenders.length === 0, offenders.length === 0 ? 'clean' : offenders.join(', '));
  check('B.2 rows come from exactly one v3 fixture module',
    importLines.includes('fixtures/linkage-confirmation-probe-v3'),
    CONFIRMATION_PROBE_FIXTURE_SET_VERSION);

  // ---- C. provider identity, bound exactly
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('C.1 model is exactly the bound model', cfg.model === BOUND_MODEL, cfg.model);
  check('C.2 endpoint is the vendor API host',
    /^https:\/\/api\.anthropic\.com\/?$/.test(cfg.endpoint), cfg.endpoint);
  check('C.3 thinking disabled', cfg.thinking === 'disabled', cfg.thinking);
  check('C.4 credential present (never read, logged or persisted)',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.trim().length > 0,
    process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY set' : 'MISSING');

  // ---- D. dry build: every request, zero provider invocations
  resetProviderInvocationCount();
  const dry = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: TARGET_LOGICAL_CALLS, spendCeilingUsd: 0,
    arms: ['BASE'], processId: 'dry', nowIso: new Date().toISOString(),
  });
  check('D.1 built one request per row, called nothing',
    dry.requestsBuilt.length === rows.length && providerInvocationCount() === 0,
    `${dry.requestsBuilt.length} built, ${providerInvocationCount()} invocations`);
  check('D.2 ONE ARM ONLY — M14 is not attempted',
    dry.requestsBuilt.every(r => r.arm === 'BASE'),
    [...new Set(dry.requestsBuilt.map(r => r.arm))].join(','));

  const identity = expertPromptIdentity(dry.requestsBuilt[0].input);
  console.log(`\n      prompt        ${identity.promptVersion}`);
  console.log(`      contract      ${identity.contractVersion}`);
  console.log(`      system sha    ${identity.systemPromptSha256}`);
  console.log(`      schema sha    ${identity.wireSchemaSha256}  (CL-R1 vocabulary)\n`);
  check('D.3 the prompt is the v9 precedence contract',
    identity.promptVersion === 'hazlenz.expert.prompt.v9', identity.promptVersion);

  // ---- E. truth containment
  const leaks: string[] = [];
  for (const built of dry.requestsBuilt) {
    const ser = JSON.stringify(built.input);
    const row = rows.find(r => r.source.rowId === built.rowId)!;
    for (const s of truthOnlyStrings(row)) if (ser.includes(s)) leaks.push(`${built.rowId}: ${s.slice(0, 40)}`);
  }
  check('E.1 no truth-key-only string reaches any request', leaks.length === 0,
    leaks.length === 0 ? `${dry.requestsBuilt.length} scanned` : leaks.join(' | '));

  // ---- F. citation input channel
  const promptLeaks: string[] = [];
  let suppliedRecordCitations = 0;
  const modelInputByRow = new Map<string, string[]>();
  for (const built of dry.requestsBuilt) {
    const user = buildExpertUserPrompt(built.input);
    modelInputByRow.set(built.rowId, [EXPERT_SYSTEM_PROMPT, user]);
    if (CITATION_SHAPED_PATTERN.test(user)) promptLeaks.push(built.rowId);
    for (const g of built.input.governedStandards) {
      for (const t of [g.title ?? '', g.approvedText ?? '']) {
        if (CITATION_SHAPED_PATTERN.test(t)) suppliedRecordCitations += 1;
      }
    }
  }
  check('F.1 system prompt carries no citation-shaped text',
    !CITATION_SHAPED_PATTERN.test(EXPERT_SYSTEM_PROMPT), 'clean');
  check('F.2 no built user prompt carries citation-shaped text', promptLeaks.length === 0,
    promptLeaks.length === 0 ? `${dry.requestsBuilt.length} scanned` : promptLeaks.join(', '));
  check('F.3 redaction is EXERCISED, not assumed', suppliedRecordCitations > 0,
    `${suppliedRecordCitations} supplied record fields carried a citation pre-render`);

  // ---- G. budget
  assertBudgetInternallyConsistent();
  check('G.1 spend ceiling is the LOWER of authorized and model-priced',
    Math.abs(SPEND_CEILING_USD - Math.min(AUTHORIZED_SPEND_CEILING_USD, MODEL_PRICED_CEILING_USD)) < 1e-9,
    `authorized $${AUTHORIZED_SPEND_CEILING_USD.toFixed(2)}, priced `
    + `$${MODEL_PRICED_CEILING_USD.toFixed(4)} -> enforcing $${SPEND_CEILING_USD.toFixed(4)}`);
  check('G.2 request ceiling covers target plus retry allowance',
    TARGET_LOGICAL_CALLS + RETRY_REQUEST_BUDGET === REQUEST_CEILING,
    `${TARGET_LOGICAL_CALLS} + ${RETRY_REQUEST_BUDGET} = ${REQUEST_CEILING}`);

  // ---- H. store + write-once identity
  mkdirSync(OUT, { recursive: true });
  const storePath = join(OUT, RUN_RECORD_FILE);
  const identityPath = join(OUT, 'PRE-SPEND-IDENTITY.json');
  if (measureOnly) {
    check('H.1 MEASURE-ONLY: the store exists and carries records',
      existsSync(storePath) && readFileSync(storePath, 'utf8').trim().length > 0,
      'recomputing from persisted evidence; NO provider request will be issued');
  } else {
    check('H.1 the append-only run-record store is empty or absent',
      !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0,
      storePath.replace(ROOT + '/', ''));
    check('H.2 PRE-SPEND-IDENTITY.json does not already exist for this run',
      !existsSync(identityPath), identityPath.replace(ROOT + '/', ''));
  }

  const preSpend: PreSpendIdentity = {
    operation: '§144 Expert HazLenz v9 bounded hosted linkage confirmation probe',
    capturedAt: new Date().toISOString(),
    isFormalEvaluation: false,
    hashes: {
      probeScriptSha256: sha256File(join(ROOT, PROBE_SCRIPT)),
      fixtureManifestSha256: sha256File(join(ROOT, FIXTURE_MODULE)),
      systemPromptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      normalizationSha256: sha256File(join(ROOT, NORMALIZATION)),
      contractTypesSha256: sha256File(join(ROOT, CONTRACT_TYPES)),
    },
    execution: {
      provider: BOUND_PROVIDER, model: cfg.model,
      promptVersion: identity.promptVersion,
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    },
    budget: {
      targetLogicalCalls: TARGET_LOGICAL_CALLS,
      hardProviderRequestCeiling: REQUEST_CEILING,
      retryRequestBudget: RETRY_REQUEST_BUDGET,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)),
      worstCaseRequestUsd: Number(WORST_CASE_REQUEST_USD.toFixed(6)),
    },
    extra: {
      git: { head: process.env.PROBE_GIT_HEAD ?? null, branch: process.env.PROBE_GIT_BRANCH ?? null,
        upstream: process.env.PROBE_GIT_UPSTREAM ?? null, dirty: process.env.PROBE_GIT_DIRTY ?? null },
      historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
      contractVersions: {
        input: EXPERT_INPUT_CONTRACT_VERSION, validator: EXPERT_VALIDATOR_VERSION,
        measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION, harness: EXPERT_COHORT_HARNESS_VERSION,
        runRecordStore: RUN_RECORD_STORE_VERSION, probeMeasures: PROBE_MEASURES_VERSION,
        fixtureSet: CONFIRMATION_PROBE_FIXTURE_SET_VERSION,
      },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      gate,
    },
  };

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_V9_LINKAGE_CONFIRMATION_BLOCKED — '
      + 'PROBE_SCRIPT_OR_PRESPEND_REGRESSION_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  // A $0.00 REHEARSAL MUST NOT CONSUME THE WRITE-ONCE ARTIFACT. §142's first version wrote the
  // identity before honouring this flag and burned the one write the paid run needed. The identity
  // describes THE MOMENT OF SPEND, so it is written only by a run about to spend.
  if (dryRun) {
    console.log('CONFIRMATION_PROBE_SCRIPT_EXECUTABLE = TRUE');
    console.log('PROBE_DRY_RUN=1 — stopping BEFORE the identity write and before any spend.');
    process.exit(0);
  }

  // ================================================================ SPEND
  type RunFacts = { stopReason: string; identityViolation: string | null;
    accounting: Record<string, number>; retryCauses: string[]; retriesSuppressed: unknown[];
    startedAt: string; finishedAt: string; providerInvocations: number };
  let runFacts: RunFacts;
  let midRunReadBackProof: { rowId: string; provenBeforeExit: boolean; recordsOnDisk: number } | null = null;

  if (measureOnly) {
    console.log('--- MEASURE-ONLY. $0.00. Re-deriving from persisted evidence.\n');
    const prior = JSON.parse(readFileSync(join(OUT, 'RESULTS-SUMMARY.json'), 'utf8'));
    runFacts = { stopReason: prior.stopReason, identityViolation: prior.identityViolation,
      accounting: prior.accounting, retryCauses: prior.retryCauses,
      retriesSuppressed: prior.retriesSuppressed, startedAt: prior.startedAt,
      finishedAt: prior.finishedAt, providerInvocations: prior.providerInvocationsThisProcess };
    midRunReadBackProof = prior.persistence?.midRunReadBackProof ?? null;
    writeRemeasureIdentity(join(OUT, 'PRE-SPEND-IDENTITY.remeasure.json'), preSpend);
  } else {
    writePreSpendIdentityOnce(identityPath, preSpend);
    let refused = false; const before = sha256File(identityPath);
    try { writePreSpendIdentityOnce(identityPath, { ...preSpend, operation: 'SECOND WRITE' }); }
    catch (e) { refused = e instanceof IdentityAlreadyWrittenError; }
    check('H.3 a SECOND write to the LIVE identity artifact is refused, bytes unchanged',
      refused && sha256File(identityPath) === before, `sha256 ${before.slice(0, 16)}… stable`);
    if (!refused || sha256File(identityPath) !== before) {
      console.log('\nIDENTITY WRITE-ONCE PROOF FAILED. Nothing was spent.'); process.exit(1);
    }

    console.log('\n--- SPEND. The confirmation probe is SPENT at the first request.\n');
    const store = createRunRecordStore(OUT);
    const provider = new AnthropicExpertProvider(cfg);
    resetProviderInvocationCount();
    const startedAt = new Date().toISOString();
    const run = await runFormalCohort(rows, {
      mode: 'ENABLED', provider,
      callCeiling: TARGET_LOGICAL_CALLS,
      requestCeiling: REQUEST_CEILING,
      retryRequestBudget: RETRY_REQUEST_BUDGET,
      worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
      spendCeilingUsd: SPEND_CEILING_USD,
      frozenIdentity: { provider: BOUND_PROVIDER, model: BOUND_MODEL },
      arms: ['BASE'], processId: randomUUID().slice(0, 8),
      nowIso: new Date().toISOString(),
      recordSink: (record: CohortRunRecord) => {
        store.append(record);
        if (!midRunReadBackProof) {
          const back = readRunRecordStore(OUT);
          midRunReadBackProof = { rowId: record.row.source.rowId,
            provenBeforeExit: back.problems.length === 0 && back.records.length >= 1
              && back.records[0].row?.source?.rowId === record.row.source.rowId,
            recordsOnDisk: back.records.length };
          console.log(`      [persistence proof] ${back.records.length} record(s) read back from `
            + `disk with ${rows.length - 1} calls still outstanding`);
        }
        const c = record.calls[0]; const a = c?.analysis;
        const f = confirmationFixtureByRowId(record.row.source.rowId)!;
        const links = (a?.decisionCriticalClarifications ?? [])
          .map(q => q.relatesToCandidateKey ?? '-').join(',');
        console.log(`      ${record.row.source.rowId.padEnd(6)} ${f.linkageTruth.padEnd(19)}`
          + ` ${String(c?.layerStatus).padEnd(9)}`
          + ` cand ${String(a?.expertHazardCandidates.length ?? '-').padStart(2)}`
          + ` clar ${String(a?.decisionCriticalClarifications.length ?? '-').padStart(2)}`
          + `  link[${links}]`
          + `  ${String(c?.latencyMs ?? 0).padStart(6)}ms $${(c?.costUsd ?? 0).toFixed(5)}`);
      },
    });
    store.close();
    runFacts = { stopReason: run.stopReason, identityViolation: run.identityViolation,
      accounting: run.accounting as unknown as Record<string, number>,
      retryCauses: run.retryCauses, retriesSuppressed: run.retriesSuppressed,
      startedAt, finishedAt: new Date().toISOString(),
      providerInvocations: providerInvocationCount() };
    console.log(`\n  stop reason       ${run.stopReason}`);
    console.log(`  logical calls     ${run.accounting.callsAttempted} attempted, `
      + `${run.accounting.callsCompleted} completed`);
    console.log(`  provider requests ${run.accounting.providerRequestsAttempted} `
      + `(${run.accounting.retryRequestsAttempted} retries)`);
    console.log(`  tokens            ${run.accounting.inputTokens} in / `
      + `${run.accounting.outputTokens} out`);
    console.log(`  spend             $${run.accounting.spendUsd.toFixed(6)} of `
      + `$${SPEND_CEILING_USD.toFixed(4)}`);
  }

  // ================================================================ MEASURE
  const readBack = readRunRecordStore(OUT);
  const completeness = runRecordCompletenessProblems(readBack.records, {
    rowOrder: rows.map(r => r.source.rowId), arms: ['BASE'] });

  const views: CallView[] = readBack.records.flatMap(r => (r.calls ?? []).map(c => ({
    rowId: r.row.source.rowId, fixture: confirmationFixtureByRowId(r.row.source.rowId)!, call: c })));
  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const clar = (v: CallView) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: CallView) => v.call.analysis?.expertHazardCandidates ?? [];
  const issueCodes = (v: CallView) => (v.call.issues ?? []).map(i => i.code);

  // ---- PHASE 7. LINKAGE, v9 taxonomy only, opportunity-scoped.
  const linkageInput: LinkageCallInput[] = present.map(v => ({
    rowId: v.rowId, expectation: v.fixture.linkageTruth,
    emittedCandidateKeys: cands(v).map(c => c.candidateKey),
    emittedClarifications: clar(v).map(q => ({
      clarificationId: q.clarificationId, relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
    issueCodes: issueCodes(v),
  }));
  const linkage = linkageDiagnostics(linkageInput);

  /** Every emitted clarification, classified by the row's AUTHORED truth, with verbatim text. */
  const clarificationClassification = present.flatMap(v => {
    const keys = new Set(cands(v).map(c => c.candidateKey));
    return clar(v).map(q => {
      const link = q.relatesToCandidateKey ?? null;
      return {
        rowId: v.rowId,
        linkageTruth: v.fixture.linkageTruth,
        linkageRationale: v.fixture.linkageRationale,
        clarificationId: q.clarificationId,
        question: q.question, whyItMatters: q.whyItMatters,
        affectedDecision: q.affectedDecision, criticality: q.criticality,
        emittedLink: link, linkPopulated: typeof link === 'string',
        referencedCandidateExists: typeof link === 'string' ? keys.has(link) : null,
        emittedCandidates: cands(v).map(c =>
          `${c.candidateKey}:${c.hazardFamily}:${c.assertedConditionState}`),
        arbitrationApplicable: q.affectedDecision === 'HAZARD_EXISTENCE'
          && typeof link === 'string'
          && cands(v).some(c => c.candidateKey === link && c.assertedConditionState === 'ACTIVE'),
      };
    });
  });

  const arbitrationEvents = views.flatMap(v => (v.call.issues ?? [])
    .filter(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE')
    .map(i => ({ rowId: v.rowId, detail: i.detail })));
  const invalidLinkageStripped = views.flatMap(v => (v.call.issues ?? [])
    .filter(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED')
    .map(i => ({ rowId: v.rowId, detail: i.detail })));
  const survivingLinkedContradictions = clarificationClassification.filter(c => c.arbitrationApplicable);
  const arbitrationOpportunities = arbitrationEvents.length + survivingLinkedContradictions.length;
  const ARBITRATION_LIVE_STATUS: 'EXERCISED_AND_CORRECT' | 'OPPORTUNITY_OCCURRED_BUT_FAILED'
    | 'NO_NATURAL_OPPORTUNITY' =
    arbitrationOpportunities === 0 ? 'NO_NATURAL_OPPORTUNITY'
      : survivingLinkedContradictions.length > 0 ? 'OPPORTUNITY_OCCURRED_BUT_FAILED'
        : 'EXERCISED_AND_CORRECT';

  // ---- PHASE 8. LINKAGE ADVANCEMENT
  const req = linkage.REQUIRED_LINKAGE_OPPORTUNITIES;
  const reqValid = linkage.REQUIRED_LINKAGE_VALID;
  const requiredOk = req === 3 ? reqValid === 3 : (req > 3 ? reqValid / req >= 0.75 : false);
  const forbiddenOk = linkage.FORBIDDEN_LINKAGE_ACCEPTED === 0;
  const invalidOk = linkage.INVALID_LINKAGE_ATTEMPTS === 0
    && clarificationClassification.every(c => c.referencedCandidateExists !== false);
  const noForcedLinkage = clarificationClassification
    .filter(c => c.linkageTruth === 'NOT_A_LINKAGE_TEST' && c.linkPopulated).length === 0;
  const LINKAGE_V9_HOSTED_CONFIRMATION =
    !requiredOk ? 'FAIL_REQUIRED_LINKAGE'
      : !forbiddenOk ? 'FAIL_FORBIDDEN_LINKAGE'
        : (invalidOk && noForcedLinkage) ? 'PASS' : 'FAIL_FORBIDDEN_LINKAGE';

  // ---- PHASE 9. CLARIFICATION (narrow; NOT a recall evaluation)
  const trueGap = present.filter(v => v.fixture.roles.includes('TRUE_GAP_CONTROL'));
  const noGapOrNotATest = present.filter(v =>
    v.fixture.roles.includes('NO_GAP_CONTROL') || v.fixture.linkageTruth === 'NOT_A_LINKAGE_TEST');
  const totalClarifications = present.reduce((t, v) => t + clar(v).length, 0);
  const trueGapDetail = trueGap.map(v => {
    const gap = v.fixture.row.truth.decisionCriticalGaps[0];
    return { rowId: v.rowId, authoredGap: gap?.description ?? null,
      authoredAffectedDecision: gap?.affectedDecision ?? null,
      emitted: clar(v).map(q => ({ question: q.question, affectedDecision: q.affectedDecision,
        whyItMatters: q.whyItMatters, relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
      anyQuestionEmitted: clar(v).length > 0,
      labelMatch: !!gap && clar(v).some(q => q.affectedDecision === gap.affectedDecision) };
  });
  const coverageTemplateRows = present.filter(v => {
    const ds = new Set(clar(v).map(q => q.affectedDecision));
    return ds.has('EXPOSURE') && ds.has('HAZARD_SEVERITY') && ds.has('REQUIRED_CONTROL');
  }).map(v => v.rowId);

  // ---- PHASE 11. GOVERNED / CITATION compact regression
  const citation = citationDiagnostics(views.map(v => ({
    modelInputText: modelInputByRow.get(v.rowId) ?? [],
    suppliedGovernedRecordText: v.fixture.row.source.governedStandards
      .flatMap(g => [g.title ?? '', g.approvedText ?? '']),
    validatedAnalysis: v.call.analysis,
    mergedExpertAdvisory: (v.call.merged as Record<string, unknown> | null)?.expertAdvisory ?? null,
    mergedGovernedBlock: (v.call.merged as Record<string, unknown> | null)?.governed ?? null,
    issueCodes: issueCodes(v),
  } as CitationCallInput)));
  const governedDetail = present
    .filter(v => v.fixture.row.source.governedStandards.length > 0)
    .map(v => ({
      rowId: v.rowId,
      recordsSupplied: v.fixture.row.source.governedStandards
        .map(g => ({ title: g.title, backingState: g.backingState })),
      referencesARecordHandle: strings(v.call.analysis).some(s => /\bR\d\b/.test(s)),
      summary: v.call.analysis?.expertExplanation?.summary ?? null,
      forbiddenFamiliesEmitted: cands(v).map(c => c.hazardFamily)
        .filter(f => v.fixture.row.truth.forbiddenHazardFamilies.includes(f)),
    }));

  // ---- PHASE 12. ADDITIVE COVERAGE
  const coverage = coverageDiagnostics(readBack.records.flatMap(r => {
    const v = views.find(x => x.rowId === r.row.source.rowId);
    if (!v) return [];
    return [{ rowId: v.rowId,
      truthPresentFamilies: v.fixture.row.truth.presentHazardFamilies,
      deterministicFamilies: r.deterministicFamiliesEmitted ?? [],
      acceptedExpertFamilies: cands(v).map(c => c.hazardFamily) } as CoverageCallInput];
  }));

  const perFixture = views.map(v => ({
    rowId: v.rowId, roles: v.fixture.roles,
    linkageTruth: v.fixture.linkageTruth, linkageRationale: v.fixture.linkageRationale,
    truth: {
      presentHazardFamilies: v.fixture.row.truth.presentHazardFamilies,
      forbiddenHazardFamilies: v.fixture.row.truth.forbiddenHazardFamilies,
      decisionCriticalGaps: v.fixture.row.truth.decisionCriticalGaps,
    },
    layerStatus: v.call.layerStatus, failureKind: v.call.failureKind,
    outcome: v.call.analysis?.outcome ?? null,
    candidates: cands(v).map(c => ({ key: c.candidateKey, family: c.hazardFamily,
      state: c.assertedConditionState, confidence: c.confidence, quotes: c.evidence.length })),
    clarifications: clar(v).map(q => ({ id: q.clarificationId, question: q.question,
      affectedDecision: q.affectedDecision, criticality: q.criticality,
      relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
    insights: (v.call.analysis?.crossHazardInsights ?? []).map(i => ({
      kind: i.interactionKind, participants: i.participants })),
    disagreements: (v.call.analysis?.disagreements ?? []).map(d => ({
      surface: d.surface, type: d.disagreementType })),
    summary: v.call.analysis?.expertExplanation?.summary ?? null,
    uncertainty: v.call.analysis?.uncertainty.statements ?? [],
    issues: (v.call.issues ?? []).map(i => `${i.code}${i.index !== undefined ? `[${i.index}]` : ''}`),
    mergeViolations: v.call.mergeViolations ?? [],
    attempts: (v.call.attempts ?? []).map(a => ({ index: a.attemptIndex, ok: a.ok,
      failureKind: a.failureKind, causedRetry: a.causedRetry })),
    latencyMs: v.call.latencyMs, inputTokens: v.call.inputTokens,
    outputTokens: v.call.outputTokens, costUsd: v.call.costUsd,
    modelIdentity: v.call.modelIdentity,
  }));

  const results = {
    operation: '§144 Expert HazLenz v9 bounded hosted linkage confirmation probe',
    isFormalEvaluation: false, formalGateStatusClaimed: 'NONE',
    m14RemediationStatus: 'NOT_ATTEMPTED',
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason, identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting,
    providerInvocationsThisProcess: runFacts.providerInvocations,
    historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
    retryCauses: runFacts.retryCauses, retriesSuppressed: runFacts.retriesSuppressed,
    promptIdentity: identity,
    callDisposition: {
      present: present.length,
      outputRejected: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED').length,
      providerFailed: views.filter(v => v.call.layerStatus !== 'PRESENT'
        && v.call.layerStatus !== 'OUTPUT_REJECTED').length,
    },
    persistence: {
      storeFile: RUN_RECORD_FILE, storeSha256: readBack.sha256,
      recordsOnDisk: readBack.records.length, parseProblems: readBack.problems,
      completenessProblems: completeness, midRunReadBackProof,
    },
    LINKAGE_V9_HOSTED_CONFIRMATION,
    linkageDiagnostics: {
      measuredAgainst: 'the AUTHORED per-row linkageTruth in the frozen v3 manifest. An opportunity '
        + 'requires an emitted clarification on a row that makes a linkage claim — neither '
        + '"candidate + clarification" (§140) nor "labelled FORBIDDEN" (§142) is sufficient.',
      ...linkage,
      ARBITRATION_OPPORTUNITIES: arbitrationOpportunities,
      SURVIVING_LINKED_CONTRADICTIONS: survivingLinkedContradictions.length,
      ARBITRATION_LIVE_STATUS,
      classification: classifyLinkage(linkage),
      arbitrationEventDetail: arbitrationEvents,
      invalidLinkageDetail: invalidLinkageStripped,
      survivingContradictionDetail: survivingLinkedContradictions,
    },
    clarificationClassification,
    clarificationDiagnostics: {
      note: 'NARROW probe. This is NOT a broad clarification-recall evaluation and must not be read '
        + 'as one; broad retention validation remains INTENTIONALLY DEFERRED.',
      totalClarifications,
      averagePerCall: present.length ? Number((totalClarifications / present.length).toFixed(3)) : 0,
      trueGapControls: trueGap.length,
      trueGapControlsWithAQuestion: trueGapDetail.filter(t => t.anyQuestionEmitted).length,
      trueGapControlsWithLabelMatch: trueGapDetail.filter(t => t.labelMatch).length,
      trueGapDetail,
      noGapOrNotATestRows: noGapOrNotATest.length,
      noGapOrNotATestSilent: noGapOrNotATest.filter(v => clar(v).length === 0).length,
      affectedDecisionHistogram: Object.fromEntries(EXPERT_AFFECTED_DECISIONS.map(d => [d,
        present.reduce((t, v) => t + clar(v).filter(q => q.affectedDecision === d).length, 0)])),
      coverageTemplateRows,
    },
    citationDiagnostics: citation,
    groundingDiagnostics: governedDetail,
    coverageDiagnostics: coverage,
    routingDiagnostics: {
      expertCandidates: present.reduce((t, v) => t + cands(v).length, 0),
      decisionCriticalClarifications: totalClarifications,
      crossHazardInsights: present.reduce((t, v) => t + (v.call.analysis?.crossHazardInsights.length ?? 0), 0),
      disagreements: present.reduce((t, v) => t + (v.call.analysis?.disagreements.length ?? 0), 0),
      outcomes: Object.fromEntries(present.reduce((m, v) => {
        const o = String(v.call.analysis?.outcome); m.set(o, (m.get(o) ?? 0) + 1); return m;
      }, new Map<string, number>())),
    },
    perFixture,
    frozenCriteria: CONFIRMATION_PROBE_CRITERIA,
    limitations: [
      'One arm, one replicate per row, nine development rows. No rate, no distribution, no '
        + 'reproducibility claim.',
      'NOT a broad clarification-recall probe and NOT a crossHazardInsights campaign.',
      'No frozen scorer ran; no formal measure was computed; run.scoring was discarded.',
      'M14 not attempted: no permutation, no same-input replicate, no order or reliability '
        + 'conclusion.',
      'A contradiction is a model error and cannot be commissioned; ARBITRATION_EVENTS = 0 with '
        + 'NO_NATURAL_OPPORTUNITY is not evidence against arbitration.',
      'Semantic judgements are DEVELOPMENT classifications recorded beside the verbatim text.',
    ],
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 2));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    version: CONFIRMATION_PROBE_FIXTURE_SET_VERSION,
    frozenBy: '§143 linkage-semantics repair; NOT modified after the first provider request',
    provenance: 'authored 2026-09-02; no reserved material opened; no spent formal-cohort row read, '
      + 'copied or mimicked; LP-G3 not reused verbatim; LP-B2 not surface-copied',
    criteria: CONFIRMATION_PROBE_CRITERIA, budget: CONFIRMATION_PROBE_BUDGET,
    rows: CONFIRMATION_PROBE_FIXTURES.map(f => ({
      rowId: f.row.source.rowId, roles: f.roles,
      linkageTruth: f.linkageTruth, linkageRationale: f.linkageRationale,
      whyDiagnostic: f.whyDiagnostic,
      contradictionIsAModelError: f.contradictionIsAModelError,
      caseClasses: classifyRow(f.row),
      observation: f.row.source.observation,
      observationSha256: sha256(f.row.source.observation),
      allowedHazardFamilies: f.row.source.allowedHazardFamilies,
      governedStandards: f.row.source.governedStandards
        .map(g => ({ title: g.title, backingState: g.backingState })),
      truth: f.row.truth,
    })),
  }, null, 2));
  writeFileSync(join(OUT, 'ATTEMPT-LEDGER.json'), JSON.stringify({
    budget: preSpend.budget, stopReason: runFacts.stopReason,
    identityViolation: runFacts.identityViolation, accounting: runFacts.accounting,
    retryCauses: runFacts.retryCauses, retriesSuppressed: runFacts.retriesSuppressed,
    attemptsByCall: perFixture.map(f => ({ rowId: f.rowId, attempts: f.attempts,
      latencyMs: f.latencyMs, inputTokens: f.inputTokens, outputTokens: f.outputTokens,
      costUsd: f.costUsd, modelIdentity: f.modelIdentity })),
  }, null, 2));

  console.log(`\n  artifacts -> ${OUT.replace(ROOT + '/', '')}`);
  console.log(`  LINKAGE_V9_HOSTED_CONFIRMATION = ${LINKAGE_V9_HOSTED_CONFIRMATION}`);
  console.log(`  REQUIRED  ${reqValid}/${req} valid   FORBIDDEN accepted `
    + `${linkage.FORBIDDEN_LINKAGE_ACCEPTED}/${linkage.FORBIDDEN_LINKAGE_OPPORTUNITIES} opportunities`);
  console.log(`  NOT_A_LINKAGE_TEST rows ${linkage.NOT_A_LINKAGE_TEST_ROWS}   `
    + `no-opportunity rows ${linkage.NO_LINKAGE_OPPORTUNITY_ROWS}   `
    + `invalid attempts ${linkage.INVALID_LINKAGE_ATTEMPTS}`);
  console.log(`  ARBITRATION_LIVE_STATUS ${ARBITRATION_LIVE_STATUS}  events ${arbitrationEvents.length}`);
  console.log(`  TRUE-GAP ${trueGapDetail.filter(t => t.anyQuestionEmitted).length}/${trueGap.length}`
    + `   clarifications ${totalClarifications}`);
  console.log(`  citations accepted ${citation.ACCEPTED_CITATION_COUNT} merged `
    + `${citation.MERGED_CITATION_COUNT} input ${citation.INPUT_CITATION_SHAPED_COUNT}`);
  console.log(`  coverage misses after union ${coverage.truthMissesAfterUnionCount}`);
  console.log('\nSTOP. The narrative report is written separately.');
})().catch(e => { console.error(e); process.exit(1); });
