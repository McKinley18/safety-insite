/**
 * §142 -- HOSTED LINKAGE VALIDATION PROBE against the v8 linkage contract.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * Not a formal evaluation. Not a formal-cohort rerun. Not a replacement cohort. Not an acceptance
 * run. Not an M14 experiment. Not a threshold-tuning exercise. No frozen scorer runs; `run.scoring`
 * is discarded rather than read.
 *
 * The spent cohort is not read, imported or reachable: rows come from ONE module,
 * `fixtures/hosted-linkage-probe-v2.ts`, and a pre-spend gate proves it by reading this script's own
 * imports. No reserved material is opened.
 *
 * ==================== THE QUESTION IT EXISTS TO ANSWER ====================
 *
 * §140 produced ZERO required-linkage opportunities, so `relatesToCandidateKey` came back
 * unexercised. §141 specified the contract and proved arbitration deterministically. This probe asks
 * whether the model, under v8, declares a link where the contract REQUIRES one and withholds it
 * where the contract FORBIDS one -- on fixtures built to create those situations.
 *
 * ==================== ARBITRATION CANNOT BE COMMISSIONED ====================
 *
 * A clarification contradicting the asker's own ACTIVE candidate is a MODEL ERROR. No fixture
 * instructs one and this probe does not try. `ARBITRATION_EVENTS = 0` is NOT a failure when no
 * natural contradiction arises -- it is classified `NO_NATURAL_OPPORTUNITY` and arbitration remains
 * deterministically proven but hosted-unexercised.
 *
 * ==================== M14 ====================
 *
 * ONE ARM. `BASE`. No permutation is built or issued, no order score, no same-input replicate, no
 * reproducibility figure. `M14_REMEDIATION_STATUS = NOT_ATTEMPTED`.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash, randomUUID } from 'crypto';

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
  LINKAGE_PROBE_FIXTURES, LINKAGE_PROBE_ROWS, LINKAGE_PROBE_FIXTURE_SET_VERSION,
  NEXT_PROBE_ADVANCEMENT_CRITERIA, linkageFixtureByRowId, linkageRowsWithRole,
  type LinkageProbeFixture,
} from '../src/safescope-v2/expert-hazlenz/fixtures/hosted-linkage-probe-v2';
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
  citationDiagnostics, coverageDiagnostics, linkageDiagnostics, requiredLinkageByRow,
  classifyLinkage, PROBE_MEASURES_VERSION,
  type CitationCallInput, type CoverageCallInput, type LinkageCallInput,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256, sha256File, writePreSpendIdentityOnce,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';
import type { CallRecord, CohortRunRecord } from
  '../src/safescope-v2/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-hosted-linkage-probe-2026-09-02');

// ---------------------------------------------------------------- the authorized envelope

const TARGET_LOGICAL_CALLS = 16;
const AUTHORIZED_REQUEST_CEILING = 20;
const AUTHORIZED_SPEND_CEILING_USD = 3.00;
const MODEL_PRICED_CEILING_USD = AUTHORIZED_REQUEST_CEILING * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(AUTHORIZED_SPEND_CEILING_USD, MODEL_PRICED_CEILING_USD);
const RETRY_REQUEST_BUDGET = AUTHORIZED_REQUEST_CEILING - TARGET_LOGICAL_CALLS;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';

/** Historical, immutable, and NOT a live counter. */
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const PROBE_SCRIPT = 'backend/scripts/probe-expert-hosted-linkage-2026-09-02.ts';
const FIXTURE_MODULE =
  'backend/src/safescope-v2/expert-hazlenz/fixtures/hosted-linkage-probe-v2.ts';
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

interface CallView { rowId: string; fixture: LinkageProbeFixture; call: CallRecord }

// ---------------------------------------------------------------- main

(async () => {
  console.log('§142 EXPERT HAZLENZ — HOSTED LINKAGE VALIDATION PROBE');
  console.log('='.repeat(100));
  console.log('\n--- PHASE 0. PRE-SPEND GATE. No provider is constructed until every line passes.\n');

  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  const rows = LINKAGE_PROBE_ROWS;

  // ---- A. fixture set
  check('A.1 fixture count is the frozen v8 manifest size', rows.length === TARGET_LOGICAL_CALLS,
    `${rows.length} rows`);
  const rowProblems = rows.flatMap(validateCohortRow);
  check('A.2 every row is structurally scoreable', rowProblems.length === 0,
    rowProblems.length === 0 ? '0 problems' : rowProblems.map(p => `${p.rowId}/${p.code}`).join(', '));
  check('A.3 row ids are v2 development ids', rows.every(r => r.source.rowId.startsWith('LP-')),
    rows.map(r => r.source.rowId).join(' '));
  const n = (r: Parameters<typeof linkageRowsWithRole>[0]) => linkageRowsWithRole(r).length;
  check('A.4 >=4 NO-GAP controls', n('NO_GAP_CONTROL') >= 4, `${n('NO_GAP_CONTROL')}`);
  check('A.5 >=4 TRUE-GAP controls', n('TRUE_GAP_CONTROL') >= 4, `${n('TRUE_GAP_CONTROL')}`);
  const requiredRows = LINKAGE_PROBE_FIXTURES.filter(f => f.linkageExpectation === 'REQUIRED');
  const forbiddenRows = LINKAGE_PROBE_FIXTURES.filter(f => f.linkageExpectation === 'FORBIDDEN');
  check('A.6 >=4 REQUIRED-linkage controls', requiredRows.length >= 4,
    requiredRows.map(f => f.row.source.rowId).join(' '));
  check('A.7 >=4 FORBIDDEN-linkage controls', forbiddenRows.length >= 4,
    `${forbiddenRows.length} rows`);
  check('A.8 governed quartet retained',
    n('GOVERNED_RELEVANT') >= 1 && n('GOVERNED_UNRELATED') >= 1 && n('GOVERNED_ABSENT') >= 1
    && n('GOVERNED_NARROWER') >= 1,
    `relevant ${n('GOVERNED_RELEVANT')} unrelated ${n('GOVERNED_UNRELATED')} `
    + `none ${n('GOVERNED_ABSENT')} narrower ${n('GOVERNED_NARROWER')}`);
  check('A.9 >=1 citation adversarial case', n('CITATION_ADVERSARIAL') >= 1,
    `${n('CITATION_ADVERSARIAL')}`);
  check('A.10 no fixture commissions a contradiction',
    LINKAGE_PROBE_FIXTURES.every(f => f.contradictionIsAModelError === true),
    'a contradiction is a MODEL ERROR and is never a positive control');
  check('A.11 TRUE-GAP rows carry exactly one gap each',
    linkageRowsWithRole('TRUE_GAP_CONTROL').every(f => f.row.truth.decisionCriticalGaps.length === 1),
    'unambiguous retention');

  // ---- B. containment
  const selfSource = readFileSync(__filename, 'utf8');
  const importLines = selfSource.split('\n')
    .filter(l => /^\s*(import|const .*= *require)/.test(l)).join('\n');
  const FORBIDDEN_IMPORTS = ['expert-cohort-65-selection', 'execute-formal-cohort-65',
    'freeze-formal-cohort-65', 'assemble-formal-cohort', 'expert-hazlenz-formal-cohort-frozen',
    'expert-hazlenz-formal-evaluation', 'expert-hazlenz-d86-reserved-open',
    'open-d86-reserved-offsets', 'classify-reserved-rows', 'COHORT-MANIFEST', 'ADJUDICATIONS',
    'hosted-remediation-probe-v1'];
  const offenders = FORBIDDEN_IMPORTS.filter(x => importLines.includes(x));
  check('B.1 no formal-cohort, reserved-material or prior-probe fixture path is imported',
    offenders.length === 0, offenders.length === 0 ? 'clean' : offenders.join(', '));
  check('B.2 rows come from exactly one v2 fixture module',
    importLines.includes('fixtures/hosted-linkage-probe-v2'), LINKAGE_PROBE_FIXTURE_SET_VERSION);

  // ---- C. execution identity
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('C.1 model is exactly the bound model', cfg.model === BOUND_MODEL, cfg.model);
  check('C.2 endpoint is the vendor API host',
    /^https:\/\/api\.anthropic\.com\/?$/.test(cfg.endpoint), cfg.endpoint);
  check('C.3 thinking disabled', cfg.thinking === 'disabled', cfg.thinking);
  check('C.4 credential present (value never read, logged or persisted)',
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
  console.log(`      schema sha    ${identity.wireSchemaSha256}  (LP-A1 vocabulary)\n`);
  check('D.3 the prompt is the v8 linkage contract',
    identity.promptVersion === 'hazlenz.expert.prompt.v8', identity.promptVersion);

  // ---- E. truth-key containment
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
    TARGET_LOGICAL_CALLS + RETRY_REQUEST_BUDGET === AUTHORIZED_REQUEST_CEILING,
    `${TARGET_LOGICAL_CALLS} + ${RETRY_REQUEST_BUDGET} = ${AUTHORIZED_REQUEST_CEILING}`);

  // ---- H. store + WRITE-ONCE identity
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
    check('H.2 PRE-SPEND-IDENTITY.json does not already exist for this probe run',
      !existsSync(identityPath), identityPath.replace(ROOT + '/', ''));
  }

  const preSpend: PreSpendIdentity = {
    operation: '§142 Expert HazLenz hosted linkage validation probe',
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
      hardProviderRequestCeiling: AUTHORIZED_REQUEST_CEILING,
      retryRequestBudget: RETRY_REQUEST_BUDGET,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)),
      worstCaseRequestUsd: Number(WORST_CASE_REQUEST_USD.toFixed(6)),
    },
    extra: {
      git: { head: process.env.PROBE_GIT_HEAD ?? null, branch: process.env.PROBE_GIT_BRANCH ?? null,
        upstream: process.env.PROBE_GIT_UPSTREAM ?? null, dirty: process.env.PROBE_GIT_DIRTY ?? null },
      providerInvocationCountHistoricalFormal: HISTORICAL_PROVIDER_INVOCATION_COUNT,
      contractVersions: {
        input: EXPERT_INPUT_CONTRACT_VERSION, validator: EXPERT_VALIDATOR_VERSION,
        measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION, harness: EXPERT_COHORT_HARNESS_VERSION,
        runRecordStore: RUN_RECORD_STORE_VERSION, probeMeasures: PROBE_MEASURES_VERSION,
        fixtureSet: LINKAGE_PROBE_FIXTURE_SET_VERSION,
      },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      gate,
    },
  };

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_HOSTED_LINKAGE_PROBE_BLOCKED — PRE_SPEND_IDENTITY_OR_REGRESSION_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }

  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  // A $0.00 GATE REHEARSAL MUST NOT CONSUME THE WRITE-ONCE ARTIFACT.
  //
  // The first version of this script wrote the identity before honouring PROBE_DRY_RUN, so the
  // rehearsal burned the one write the real run needed and the real run would have been refused by
  // its own guard. The identity describes THE MOMENT OF SPEND, so it is written only on a run that
  // is actually about to spend. The dry run stops here, having proved everything it can prove
  // without touching a durable artifact.
  if (process.env.PROBE_DRY_RUN === '1') {
    console.log('PROBE_DRY_RUN=1 — stopping BEFORE the identity write and before any spend.');
    process.exit(0);
  }

  if (!measureOnly) {
    // WRITE-ONCE. Refuses if the file exists, without touching a byte of it.
    writePreSpendIdentityOnce(identityPath, preSpend);
    // And PROVE the refusal on the live artifact, before any spend. A guard asserted only in a unit
    // test is a guard that has never met the file it protects.
    let refused = false; const before = sha256File(identityPath);
    try { writePreSpendIdentityOnce(identityPath, { ...preSpend, operation: 'SECOND WRITE' }); }
    catch (e) { refused = e instanceof IdentityAlreadyWrittenError; }
    check('H.3 a SECOND write to the live identity artifact is refused, bytes unchanged',
      refused && sha256File(identityPath) === before, `sha256 ${before.slice(0, 16)}… stable`);
    if (!refused || sha256File(identityPath) !== before) {
      console.log('\nIDENTITY WRITE-ONCE PROOF FAILED. Nothing was spent.'); process.exit(1);
    }
  } else {
    writeRemeasureIdentity(join(OUT, 'PRE-SPEND-IDENTITY.remeasure.json'), preSpend);
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
  } else {
    console.log('--- SPEND. The probe is SPENT at the first request.\n');
    const store = createRunRecordStore(OUT);
    const provider = new AnthropicExpertProvider(cfg);
    resetProviderInvocationCount();
    const startedAt = new Date().toISOString();
    const run = await runFormalCohort(rows, {
      mode: 'ENABLED', provider,
      callCeiling: TARGET_LOGICAL_CALLS,
      requestCeiling: AUTHORIZED_REQUEST_CEILING,
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
        const c = record.calls[0];
        const a = c?.analysis;
        const links = (a?.decisionCriticalClarifications ?? [])
          .map(q => q.relatesToCandidateKey ?? '-').join(',');
        console.log(`      ${record.row.source.rowId.padEnd(7)} `
          + `${String(c?.layerStatus).padEnd(15)}`
          + ` cand ${String(a?.expertHazardCandidates.length ?? '-').padStart(2)}`
          + ` clar ${String(a?.decisionCriticalClarifications.length ?? '-').padStart(2)}`
          + ` ins ${String(a?.crossHazardInsights.length ?? '-').padStart(2)}`
          + ` dis ${String(a?.disagreements.length ?? '-').padStart(2)}`
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
    console.log(`\n  stop reason          ${run.stopReason}`);
    console.log(`  logical calls        ${run.accounting.callsAttempted} attempted, `
      + `${run.accounting.callsCompleted} completed`);
    console.log(`  provider requests    ${run.accounting.providerRequestsAttempted} `
      + `(${run.accounting.retryRequestsAttempted} retries)`);
    console.log(`  tokens               ${run.accounting.inputTokens} in / `
      + `${run.accounting.outputTokens} out`);
    console.log(`  spend                $${run.accounting.spendUsd.toFixed(6)} of `
      + `$${SPEND_CEILING_USD.toFixed(4)}`);
  }

  // ================================================================ MEASURE
  const readBack = readRunRecordStore(OUT);
  const completeness = runRecordCompletenessProblems(readBack.records, {
    rowOrder: rows.map(r => r.source.rowId), arms: ['BASE'] });

  const views: CallView[] = readBack.records.flatMap(r => (r.calls ?? []).map(c => ({
    rowId: r.row.source.rowId, fixture: linkageFixtureByRowId(r.row.source.rowId)!, call: c })));
  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const clar = (v: CallView) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: CallView) => v.call.analysis?.expertHazardCandidates ?? [];
  const issueCodes = (v: CallView) => (v.call.issues ?? []).map(i => i.code);

  // ---- PHASE 4. LINKAGE, measured against the AUTHORED expectation only.
  const linkageInput: LinkageCallInput[] = present.map(v => ({
    rowId: v.rowId, expectation: v.fixture.linkageExpectation,
    emittedCandidateKeys: cands(v).map(c => c.candidateKey),
    emittedClarifications: clar(v).map(q => ({
      clarificationId: q.clarificationId, relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
    issueCodes: issueCodes(v),
  }));
  const linkage = linkageDiagnostics(linkageInput);
  const byRow = requiredLinkageByRow(linkageInput);

  /** Every emitted clarification, classified by the row's authored expectation, with verbatim text. */
  const clarificationClassification = present.flatMap(v => {
    const keys = new Set(cands(v).map(c => c.candidateKey));
    return clar(v).map(q => {
      const link = q.relatesToCandidateKey ?? null;
      return {
        rowId: v.rowId,
        classification: `LINK_${v.fixture.linkageExpectation}` as const,
        clarificationId: q.clarificationId,
        question: q.question,
        whyItMatters: q.whyItMatters,
        affectedDecision: q.affectedDecision,
        criticality: q.criticality,
        emittedLink: link,
        linkPopulated: typeof link === 'string',
        referencedCandidateExists: typeof link === 'string' ? keys.has(link) : null,
        emittedCandidates: cands(v).map(c =>
          `${c.candidateKey}:${c.hazardFamily}:${c.assertedConditionState}`),
        survivedValidation: true,
        arbitrationApplicable: q.affectedDecision === 'HAZARD_EXISTENCE'
          && typeof link === 'string'
          && cands(v).some(c => c.candidateKey === link && c.assertedConditionState === 'ACTIVE'),
      };
    });
  });

  // A clarification the boundary REMOVED never appears in the validated analysis, so arbitration
  // events are read from the issue list, which is where the boundary records them.
  const arbitrationEvents = views.flatMap(v => (v.call.issues ?? [])
    .filter(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE')
    .map(i => ({ rowId: v.rowId, detail: i.detail })));
  const invalidLinkageStripped = views.flatMap(v => (v.call.issues ?? [])
    .filter(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED')
    .map(i => ({ rowId: v.rowId, detail: i.detail })));

  /**
   * A NATURAL contradiction: the model asserted a candidate ACTIVE and asked, in the same response,
   * whether that same hazard exists. Only a DECLARED link makes "that same hazard" decidable, so
   * this counts arbitration events plus any surviving linked existence question.
   */
  const survivingLinkedContradictions = clarificationClassification
    .filter(c => c.arbitrationApplicable);
  const arbitrationOpportunities = arbitrationEvents.length + survivingLinkedContradictions.length;
  const ARBITRATION_LIVE_STATUS: 'EXERCISED_AND_CORRECT' | 'OPPORTUNITY_OCCURRED_BUT_FAILED'
    | 'NO_NATURAL_OPPORTUNITY' =
    arbitrationOpportunities === 0 ? 'NO_NATURAL_OPPORTUNITY'
      : survivingLinkedContradictions.length > 0 ? 'OPPORTUNITY_OCCURRED_BUT_FAILED'
        : 'EXERCISED_AND_CORRECT';

  // ---- PHASE 6. CLARIFICATION RETENTION
  const noGap = present.filter(v => v.fixture.roles.includes('NO_GAP_CONTROL'));
  const trueGap = present.filter(v => v.fixture.roles.includes('TRUE_GAP_CONTROL'));
  const totalClarifications = present.reduce((t, v) => t + clar(v).length, 0);
  const trueGapDetail = trueGap.map(v => {
    const gap = v.fixture.row.truth.decisionCriticalGaps[0];
    return {
      rowId: v.rowId, authoredGap: gap.description,
      authoredAffectedDecision: gap.affectedDecision,
      emitted: clar(v).map(q => ({ question: q.question, affectedDecision: q.affectedDecision,
        criticality: q.criticality, whyItMatters: q.whyItMatters, evidenceGap: q.evidenceGap,
        relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
      anyQuestionEmitted: clar(v).length > 0,
      labelMatchOnSomeQuestion: clar(v).some(q => q.affectedDecision === gap.affectedDecision),
    };
  });
  // The measured §140 coverage template: one question each covering exposure, severity and control.
  const coverageTemplateRows = present.filter(v => {
    const ds = new Set(clar(v).map(q => q.affectedDecision));
    return ds.has('EXPOSURE') && ds.has('HAZARD_SEVERITY') && ds.has('REQUIRED_CONTROL');
  }).map(v => v.rowId);
  const duplicateQuestions = present.flatMap(v => {
    const seen = new Map<string, number>();
    for (const q of clar(v)) {
      const k = q.question.trim().toLowerCase();
      seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    return [...seen.entries()].filter(([, c]) => c > 1).map(([q, c]) => ({ rowId: v.rowId, question: q, count: c }));
  });

  // ---- PHASE 7. GOVERNED + CITATION
  const citationInput: CitationCallInput[] = views.map(v => ({
    modelInputText: modelInputByRow.get(v.rowId) ?? [],
    suppliedGovernedRecordText: v.fixture.row.source.governedStandards
      .flatMap(g => [g.title ?? '', g.approvedText ?? '']),
    validatedAnalysis: v.call.analysis,
    mergedExpertAdvisory: (v.call.merged as Record<string, unknown> | null)?.expertAdvisory ?? null,
    mergedGovernedBlock: (v.call.merged as Record<string, unknown> | null)?.governed ?? null,
    issueCodes: issueCodes(v),
  }));
  const citation = citationDiagnostics(citationInput);

  const OBLIGATION =
    /\b(shall|must be|is required|are required|requires|regulation|regulatory|OSHA|the supplied record|record R\d)\b/i;
  const governedDetail = present
    .filter(v => v.fixture.roles.some(r => r.startsWith('GOVERNED_'))
      || v.fixture.roles.includes('CITATION_ADVERSARIAL'))
    .map(v => {
      const s = strings(v.call.analysis);
      return {
        rowId: v.rowId, roles: v.fixture.roles,
        recordsSupplied: v.fixture.row.source.governedStandards
          .map(g => ({ title: g.title, backingState: g.backingState })),
        referencesARecordHandle: s.some(x => /\bR\d\b/.test(x)),
        obligationLanguageSentences: s.flatMap(x => x.split(/(?<=[.!?])\s+/))
          .filter(x => OBLIGATION.test(x)),
        summary: v.call.analysis?.expertExplanation?.summary ?? null,
        candidateFamilies: cands(v).map(c => `${c.hazardFamily}:${c.assertedConditionState}`),
        forbiddenFamiliesEmitted: cands(v).map(c => c.hazardFamily)
          .filter(f => v.fixture.row.truth.forbiddenHazardFamilies.includes(f)),
      };
    });

  // ---- PHASE 8. ADDITIVE COVERAGE
  const coverageInput: CoverageCallInput[] = readBack.records.flatMap(r => {
    const v = views.find(x => x.rowId === r.row.source.rowId);
    if (!v) return [];
    return [{ rowId: v.rowId,
      truthPresentFamilies: v.fixture.row.truth.presentHazardFamilies,
      deterministicFamilies: r.deterministicFamiliesEmitted ?? [],
      acceptedExpertFamilies: cands(v).map(c => c.hazardFamily) }];
  });
  const coverage = coverageDiagnostics(coverageInput);

  const routing = {
    expertCandidates: present.reduce((t, v) => t + cands(v).length, 0),
    decisionCriticalClarifications: totalClarifications,
    crossHazardInsights: present.reduce((t, v) => t + (v.call.analysis?.crossHazardInsights.length ?? 0), 0),
    disagreements: present.reduce((t, v) => t + (v.call.analysis?.disagreements.length ?? 0), 0),
    emptyCollectionRates: {
      denominator: present.length,
      expertHazardCandidates: present.filter(v => cands(v).length === 0).length,
      decisionCriticalClarifications: present.filter(v => clar(v).length === 0).length,
      crossHazardInsights: present.filter(v => (v.call.analysis?.crossHazardInsights.length ?? 0) === 0).length,
      disagreements: present.filter(v => (v.call.analysis?.disagreements.length ?? 0) === 0).length,
    },
    interactionKinds: Object.fromEntries(present.reduce((m, v) => {
      for (const i of v.call.analysis?.crossHazardInsights ?? []) {
        m.set(i.interactionKind, (m.get(i.interactionKind) ?? 0) + 1);
      }
      return m;
    }, new Map<string, number>())),
    outcomes: Object.fromEntries(present.reduce((m, v) => {
      const o = String(v.call.analysis?.outcome); m.set(o, (m.get(o) ?? 0) + 1); return m;
    }, new Map<string, number>())),
  };

  const perFixture = views.map(v => ({
    rowId: v.rowId, roles: v.fixture.roles,
    linkageExpectation: v.fixture.linkageExpectation,
    truth: {
      presentHazardFamilies: v.fixture.row.truth.presentHazardFamilies,
      forbiddenHazardFamilies: v.fixture.row.truth.forbiddenHazardFamilies,
      decisionCriticalGaps: v.fixture.row.truth.decisionCriticalGaps,
    },
    layerStatus: v.call.layerStatus, failureKind: v.call.failureKind,
    outcome: v.call.analysis?.outcome ?? null,
    candidates: cands(v).map(c => ({ key: c.candidateKey, family: c.hazardFamily,
      state: c.assertedConditionState, confidence: c.confidence,
      relationship: c.relationshipToDeterministic, quotes: c.evidence.length })),
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

  // ---- PHASE 10. ADVANCEMENT
  const noGapSilent = noGap.filter(v => clar(v).length === 0).length;
  const criteria = [
    { id: 1, name: 'NO-GAP silence', target: '>= 3 of 4',
      observed: `${noGapSilent} of ${noGap.length}`, met: noGap.length >= 4 && noGapSilent >= 3 },
    { id: 2, name: 'TRUE-GAP retention', target: '>= 3 of 4 semantically correct',
      observed: `${trueGapDetail.filter(t => t.anyQuestionEmitted).length} of ${trueGap.length} `
        + `emitted a question; label match on ${trueGapDetail.filter(t => t.labelMatchOnSomeQuestion).length}`,
      met: null as boolean | null },
    { id: 3, name: 'REQUIRED linkage', target: '>= 3 of 4 valid REQUIRED links',
      observed: `${byRow.satisfied} satisfied of ${byRow.authoredRequiredRows} authored `
        + `(${byRow.opportunities} opportunities, ${byRow.missing} missing, `
        + `${byRow.noQuestionEmitted} emitted no question)`,
      met: byRow.satisfied >= 3 },
    { id: 4, name: 'FORBIDDEN linkage accepted', target: '0',
      observed: `${linkage.forbiddenLinksEmitted}`, met: linkage.forbiddenLinksEmitted === 0 },
    { id: 5, name: 'invalid/unresolved keys accepted', target: '0',
      observed: `${linkage.unresolvedBindings} emitted, ${invalidLinkageStripped.length} stripped by `
        + 'the boundary, 0 may survive into validated output',
      met: clarificationClassification.every(c => c.referencedCandidateExists !== false) },
    { id: 6, name: 'natural contradiction does not survive', target: 'none surviving',
      observed: `${ARBITRATION_LIVE_STATUS}; opportunities ${arbitrationOpportunities}, events `
        + `${arbitrationEvents.length}, surviving ${survivingLinkedContradictions.length}`,
      met: survivingLinkedContradictions.length === 0 },
    { id: 7, name: 'governed negative controls', target: 'all behave correctly',
      observed: 'see groundingDiagnostics — verbatim text recorded', met: null as boolean | null },
    { id: 8, name: 'governed positive', target: '>= 1 grounded positive',
      observed: 'see groundingDiagnostics — verbatim text recorded', met: null as boolean | null },
    { id: 9, name: 'unsupported accepted citations', target: '0',
      observed: `accepted ${citation.ACCEPTED_CITATION_COUNT}, merged `
        + `${citation.MERGED_CITATION_COUNT}, rejected ${citation.REJECTED_CITATION_COUNT}`,
      met: citation.ACCEPTED_CITATION_COUNT === 0 && citation.MERGED_CITATION_COUNT === 0 },
    { id: 10, name: 'combined coverage vs baseline',
      target: 'no material regression (§140 baseline: 1 truth-present family covered by neither, of 16 rows)',
      observed: `${coverage.truthMissesAfterUnionCount} of ${coverage.truthPresentTotal} truth-present `
        + `families covered by neither layer`,
      met: coverage.truthMissesAfterUnionCount <= 1 },
    { id: 11, name: 'protected suites after probe', target: '33 of 33',
      observed: 'run outside this script and recorded in the report', met: null as boolean | null },
    { id: 12, name: 'no provider identity/budget/persistence defect', target: 'none',
      observed: `identityViolation=${runFacts.identityViolation}, stopReason=${runFacts.stopReason}, `
        + `storeProblems=${readBack.problems.length}, completeness=${completeness.length}, `
        + `mergeViolations=${perFixture.reduce((t, f) => t + f.mergeViolations.length, 0)}`,
      met: runFacts.identityViolation === null && runFacts.stopReason === 'COMPLETED'
        && readBack.problems.length === 0 && completeness.length === 0
        && perFixture.every(f => f.mergeViolations.length === 0) },
  ];

  const results = {
    operation: '§142 Expert HazLenz hosted linkage validation probe',
    isFormalEvaluation: false, formalGateStatusClaimed: 'NONE',
    m14RemediationStatus: 'NOT_ATTEMPTED',
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason, identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting,
    providerInvocationsThisProcess: runFacts.providerInvocations,
    providerInvocationCountHistoricalFormal: HISTORICAL_PROVIDER_INVOCATION_COUNT,
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
    linkageDiagnostics: {
      measuredAgainst: 'the AUTHORED per-row expectation in the v2 manifest, never collection '
        + 'co-occurrence. A clarification never asked is a RETENTION event, not a linkage failure.',
      REQUIRED_LINKAGE_OPPORTUNITIES: byRow.opportunities,
      REQUIRED_LINKAGE_AUTHORED_ROWS: byRow.authoredRequiredRows,
      REQUIRED_LINKAGE_POPULATED: byRow.rows.reduce((t, r) => t + r.linksPopulated, 0),
      REQUIRED_LINKAGE_VALID: byRow.satisfied,
      REQUIRED_LINKAGE_MISSING: byRow.missing,
      REQUIRED_ROWS_WITH_NO_CLARIFICATION: byRow.noQuestionEmitted,
      FORBIDDEN_LINKAGE_ACCEPTED: linkage.forbiddenLinksEmitted,
      INVALID_LINKAGE_STRIPPED: invalidLinkageStripped.length,
      ARBITRATION_OPPORTUNITIES: arbitrationOpportunities,
      ARBITRATION_EVENTS: arbitrationEvents.length,
      SURVIVING_LINKED_CONTRADICTIONS: survivingLinkedContradictions.length,
      ARBITRATION_LIVE_STATUS,
      classification: classifyLinkage(linkage),
      perRow: byRow.rows,
      arbitrationEventDetail: arbitrationEvents,
      invalidLinkageDetail: invalidLinkageStripped,
      survivingContradictionDetail: survivingLinkedContradictions,
    },
    clarificationClassification,
    clarificationDiagnostics: {
      totalClarifications,
      averagePerCall: present.length ? Number((totalClarifications / present.length).toFixed(3)) : 0,
      noGapControls: noGap.length, noGapControlsSilent: noGapSilent,
      clarificationsOnNoGapRows: noGap.reduce((t, v) => t + clar(v).length, 0),
      trueGapControls: trueGap.length,
      trueGapControlsWithAQuestion: trueGapDetail.filter(t => t.anyQuestionEmitted).length,
      trueGapControlsWithNoQuestion: trueGapDetail.filter(t => !t.anyQuestionEmitted).length,
      trueGapControlsWithMatchingLabel: trueGapDetail.filter(t => t.labelMatchOnSomeQuestion).length,
      trueGapDetail,
      affectedDecisionHistogram: Object.fromEntries(EXPERT_AFFECTED_DECISIONS.map(d => [d,
        present.reduce((t, v) => t + clar(v).filter(q => q.affectedDecision === d).length, 0)])),
      coverageTemplateRows,
      duplicateQuestions,
    },
    groundingDiagnostics: governedDetail,
    citationDiagnostics: citation,
    coverageDiagnostics: coverage,
    routingDiagnostics: routing,
    perFixture,
    advancementCriteria: criteria,
    frozenCriteriaFromManifest: NEXT_PROBE_ADVANCEMENT_CRITERIA,
    limitations: [
      'One arm, one replicate per row. No within-condition divergence measured, none inferable.',
      'No frozen scorer ran; no formal measure was computed; run.scoring was discarded.',
      'M14 not attempted: no permutation, no order score, no same-input replicate.',
      'Sixteen development rows are not a cohort.',
      'Semantic judgements — whether a question IS the authored gap, whether prose abstained, '
        + 'whether a link is semantically right — are DEVELOPMENT classifications recorded beside '
        + 'the verbatim text, not scored measures.',
      'A contradiction is a model error and cannot be commissioned; ARBITRATION_EVENTS = 0 with '
        + 'NO_NATURAL_OPPORTUNITY is not evidence against arbitration.',
    ],
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 2));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    version: LINKAGE_PROBE_FIXTURE_SET_VERSION,
    provenance: 'authored 2026-09-02 for the §141/§142 probes; no reserved material opened; no '
      + 'spent-cohort row read, copied or mimicked; v1 fixtures untouched',
    advancementCriteria: NEXT_PROBE_ADVANCEMENT_CRITERIA,
    rows: LINKAGE_PROBE_FIXTURES.map(f => ({
      rowId: f.row.source.rowId, roles: f.roles,
      linkageExpectation: f.linkageExpectation,
      contradictionIsAModelError: f.contradictionIsAModelError,
      whyDiagnostic: f.whyDiagnostic,
      expectedEmptyCollections: f.expectedEmptyCollections,
      supersedes: f.supersedes ?? null,
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
  console.log(`  REQUIRED linkage: ${byRow.satisfied}/${byRow.authoredRequiredRows} satisfied `
    + `(${byRow.opportunities} opportunities)   FORBIDDEN accepted: ${linkage.forbiddenLinksEmitted}`);
  console.log(`  ARBITRATION_LIVE_STATUS: ${ARBITRATION_LIVE_STATUS}  events ${arbitrationEvents.length}`);
  console.log(`  NO-GAP silent ${noGapSilent}/${noGap.length}   TRUE-GAP with a question `
    + `${trueGapDetail.filter(t => t.anyQuestionEmitted).length}/${trueGap.length}   `
    + `clarifications ${totalClarifications}`);
  console.log(`  citations: accepted ${citation.ACCEPTED_CITATION_COUNT} merged `
    + `${citation.MERGED_CITATION_COUNT} input ${citation.INPUT_CITATION_SHAPED_COUNT}`);
  console.log(`  coverage: ${coverage.truthMissesAfterUnionCount} truth-present families covered by neither layer`);
  console.log('\nSTOP. The narrative report is written separately.');
})().catch(e => { console.error(e); process.exit(1); });
