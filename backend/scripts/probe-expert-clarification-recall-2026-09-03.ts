/**
 * §147 EXPERT HAZLENZ — BOUNDED HOSTED CLARIFICATION-RECALL REMEDIATION PROBE.
 *
 * TEN logical calls against a TWELVE-request ceiling and a $2.00 spend ceiling, ONE arm, against the
 * prospective v10 contract. It exists to answer ONE question: did the settlement rule recover the
 * clarification-retention defect WITHOUT buying that recovery with precision?
 *
 * NOT a formal evaluation. NOT a cohort. NOT an acceptance run. NOT an expanded revalidation. NOT an
 * M14 experiment. The historical formal result is untouched and immutable, and the historical
 * `PROVIDER_INVOCATION_COUNT = 195` is not incremented by anything here.
 *
 * ==================== WHAT THIS SCRIPT REFUSES TO DO ====================
 *
 * It does NOT decide, mechanically, whether an emitted question RECOVERED the authored missing fact.
 * §146 established the distinction that matters -- a semantically different question emitted on a
 * REQUIRED row is not recall -- and no string comparison can make that judgement. So the script
 * computes the LOOSE count mechanically, emits every emitted question beside the authored missing
 * fact in `CLARIFICATION-ADJUDICATION.csv`, and leaves the STRICT determination to a reader who can
 * see both. Reporting a strict figure the script invented would be the §140 mistake again.
 *
 * ==================== THE SAFETY PROPERTIES, AND WHY EACH EXISTS ====================
 *
 *   - PROSPECTIVE spend enforcement at the frozen worst case, checked BEFORE each request rather
 *     than after, so the ceiling cannot be discovered by exceeding it.
 *   - WRITE-ONCE pre-spend identity with no force or overwrite escape, and the refusal is PROVED
 *     live against the real artifact before the first request.
 *   - A DRY RUN must not consume the write-once identity. §142 learned this by consuming it.
 *   - fsync-backed append-only run records with a MID-RUN read-back from disk, proved while calls
 *     are still outstanding -- persistence that is only checked at exit is not persistence.
 *   - The credential is read from the environment and NEVER logged, returned, persisted or
 *     interpolated into any string this script writes.
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
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  CLARIFICATION_RECALL_FIXTURES, CLARIFICATION_RECALL_ROWS, CLARIFICATION_RECALL_BUDGET,
  CLARIFICATION_RECALL_GATES, CLARIFICATION_RECALL_FIXTURE_SET_VERSION,
  CLARIFICATION_STRUCTURES, clarificationFixtureByRowId, type ClarificationRecallFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/clarification-recall-probe-v5';
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
  runFormalCohort, runDeterministicSide, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';
import { WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent } from './lib/expert-execution-budget';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems, RUN_RECORD_FILE,
  RUN_RECORD_STORE_VERSION,
} from './lib/expert-run-record-store';
import {
  citationDiagnostics, coverageDiagnostics, linkageDiagnostics, PROBE_MEASURES_VERSION,
  type CitationCallInput, type CoverageCallInput, type LinkageCallInput,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256File, writePreSpendIdentityOnce,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';
import type { CallRecord, CohortRunRecord } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-clarification-recall-remediation-2026-09-03');

const B = CLARIFICATION_RECALL_BUDGET;
const MODEL_PRICED_CEILING = B.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING);
const RETRY_BUDGET = B.hardProviderRequestCeiling - B.targetLogicalCalls;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const SCRIPT = 'backend/scripts/probe-expert-clarification-recall-2026-09-03.ts';
const FIXTURES = 'backend/src/hazlenz/expert-hazlenz/fixtures/clarification-recall-probe-v5.ts';
const NORMALIZATION = 'backend/src/hazlenz/expert-hazlenz/expert-normalization.ts';
const CONTRACT_TYPES = 'backend/src/hazlenz/expert-hazlenz/expert-contract.types.ts';

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
const csv = (rows: string[][]) =>
  rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';

interface View { rowId: string; fx: ClarificationRecallFixture; call: CallRecord; rec: CohortRunRecord }
const isRequired = (f: ClarificationRecallFixture) => f.expectation.kind === 'REQUIRED';
const reqTruth = (f: ClarificationRecallFixture) =>
  (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

(async () => {
  console.log('§147 EXPERT HAZLENZ — BOUNDED HOSTED CLARIFICATION-RECALL REMEDIATION PROBE');
  console.log('='.repeat(100));
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  console.log(`\n--- PHASE 4/5. PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  const rows = CLARIFICATION_RECALL_ROWS;
  const fx = CLARIFICATION_RECALL_FIXTURES;

  // ---- A. structure and scale
  check('A.1 logical calls are within the authorized band and MATERIALLY SMALLER than §146',
    rows.length === B.targetLogicalCalls && rows.length <= B.hardLogicalCallCeiling
      && rows.length < 24,
    `${rows.length} rows (ceiling ${B.hardLogicalCallCeiling}; §146 spent 24)`);
  const structural = rows.map(r => validateCohortRow(r)).filter(p => p.length > 0);
  check('A.2 every row is structurally scoreable', structural.length === 0,
    `${structural.length} problems`);
  const ids = rows.map(r => r.source.rowId);
  check('A.3 ids are fresh CR-* development ids',
    ids.every(i => /^CR-[A-H]\d$/.test(i)) && new Set(ids).size === ids.length, ids.join(' '));
  const domains = new Set(fx.map(f => f.domain));
  check('A.4 the set is not over-sampled on one family',
    domains.size === rows.length, `${domains.size} distinct domains across ${rows.length} rows`);

  // ---- B. composition. The FORBIDDEN half is what makes this a remediation probe rather than a
  //      demonstration that the model can be made to ask questions.
  const required = fx.filter(isRequired);
  const forbidden = fx.filter(f => !isRequired(f));
  check('B.1 the halves are BALANCED', required.length === 5 && forbidden.length === 5,
    `${required.length} REQUIRED / ${forbidden.length} matched FORBIDDEN controls`);
  const structures = new Set(fx.map(f => f.structure));
  check('B.2 all eight paired semantic structures are present',
    CLARIFICATION_STRUCTURES.every(s => structures.has(s)),
    `${structures.size} of ${CLARIFICATION_STRUCTURES.length}`);
  const unmarked = required.filter(f => reqTruth(f).absenceIsUnmarked === true);
  check('B.3 the ESTABLISHED DEFECT shape dominates the REQUIRED half',
    unmarked.length >= 3,
    `${unmarked.length} of ${required.length} mark the absence NOWHERE: `
    + unmarked.map(f => f.row.source.rowId).join(' '));
  check('B.4 and one ANNOUNCED case survives as a non-regression control',
    required.some(f => reqTruth(f).absenceIsUnmarked === false), 'present');
  const temptations = new Set(fx.map(f => f.temptation));
  check('B.5 the three caught settlement mechanisms are each represented',
    temptations.has('RESEMBLANCE_TO_A_PROGRAMME')
      && temptations.has('THRESHOLD_ACROSS_INCOMPARABLE_BASES')
      && (temptations.has('BENIGN_ASSUMPTION') || temptations.has('WORST_CASE_ASSUMPTION')),
    [...temptations].filter(t => t !== 'NONE').join(', '));
  const settledThreshold = fx.filter(f => f.structure === 'C_KNOWN_THRESHOLD_SATISFIED'
    || f.structure === 'D_KNOWN_THRESHOLD_NOT_SATISFIED');
  check('B.6 both anti-overcorrection threshold controls supply a record and must stay SILENT',
    settledThreshold.length === 2 && settledThreshold.every(f =>
      !isRequired(f) && f.row.source.governedStandards.length > 0), 'C and D present');

  // ---- C. fixture-truth quality. §140's DP-B4, enforced rather than trusted.
  const brokenCounterfactual = required.filter(f => {
    const t = reqTruth(f);
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || String(t.outcomeA).trim() === String(t.outcomeB).trim();
  });
  check('C.1 every REQUIRED row states BOTH answers and BOTH DIFFERENT current outcomes',
    brokenCounterfactual.length === 0,
    brokenCounterfactual.length === 0 ? `${required.length} complete counterfactuals`
      : brokenCounterfactual.map(f => f.row.source.rowId).join(', '));
  check('C.2 exactly one authored gap per REQUIRED row, none on any FORBIDDEN row',
    fx.every(f => f.row.truth.decisionCriticalGaps.length === (isRequired(f) ? 1 : 0)),
    'retention is unambiguous per row');
  check('C.3 every FORBIDDEN row states the tempting question AND a per-row reason',
    forbidden.every(f => {
      const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
      return t.temptingQuestion.length > 10 && t.whyNotDecisionCritical.length > 60;
    }), 'no blanket labels');
  const affected = required.map(f => String(reqTruth(f).affectedDecision));
  check('C.4 every authored affectedDecision is in the frozen vocabulary',
    affected.every(a => (EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(a)),
    [...new Set(affected)].join(', '));
  check('C.5 REGULATORY_INTERPRETATION is never claimed without a SUPPLIED record',
    required.every(f => reqTruth(f).affectedDecision !== 'REGULATORY_INTERPRETATION'
      || f.row.source.governedStandards.length > 0), 'checked');

  // ---- D. containment
  const src = readFileSync(join(ROOT, SCRIPT), 'utf8');
  const fixtureSrc = readFileSync(join(ROOT, FIXTURES), 'utf8');
  const forbiddenPaths = /formal-cohort-65|frozen-formal-cohort|reserved|RESERVED_|expanded-validation-v4|hosted-linkage-probe|linkage-confirmation-probe/;
  check('D.1 no formal-cohort, reserved or SPENT-probe path is imported',
    !forbiddenPaths.test(src.split('\n').filter(l => l.trim().startsWith('import')).join('\n'))
      && !forbiddenPaths.test(fixtureSrc.split('\n').filter(l => l.trim().startsWith('import')).join('\n')),
    'clean');

  // ---- E. provider identity
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('E.1 model bound exactly', cfg.model === BOUND_MODEL, cfg.model);
  check('E.2 vendor endpoint', cfg.endpoint.startsWith('https://api.anthropic.com'), cfg.endpoint);
  check('E.3 thinking disabled', cfg.thinking === 'disabled', cfg.thinking);
  check('E.4 credential present (never logged or persisted)',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');

  // ---- F. dry build. Every request is constructed and NOTHING is called.
  resetProviderInvocationCount();
  const identity = expertPromptIdentity({
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'probe',
    authoritativeSources: [{ sourceId: 'observation', sourceType: 'observation',
      text: rows[0].source.observation }],
    inspectionContext: { location: null, task: null },
    jurisdiction: rows[0].source.jurisdiction,
    allowedHazardFamilies: [...rows[0].source.allowedHazardFamilies],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  });
  const built: string[][] = rows.map(r => {
    const inp = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: r.source.rowId,
      authoritativeSources: [{ sourceId: 'observation', sourceType: 'observation' as const,
        text: r.source.observation }],
      inspectionContext: { location: null, task: null },
      jurisdiction: r.source.jurisdiction,
      allowedHazardFamilies: [...r.source.allowedHazardFamilies],
      deterministicFindings: [], governedStandards: [...r.source.governedStandards],
      answeredClarifications: [],
    };
    return [EXPERT_SYSTEM_PROMPT, buildExpertUserPrompt(inp)];
  });
  check('F.1 built one request per row, called nothing',
    built.length === rows.length && providerInvocationCount() === 0,
    `${built.length} built, ${providerInvocationCount()} invocations`);
  check('F.2 ONE ARM ONLY — M14 not attempted', B.arms.length === 1 && B.arms[0] === 'BASE',
    'BASE');
  console.log(`\n      prompt ${identity.promptVersion}   contract ${EXPERT_ANALYSIS_CONTRACT_VERSION}`);
  console.log(`      system ${identity.systemPromptSha256}`);
  console.log(`      schema ${identity.wireSchemaSha256}\n`);
  check('F.3 the prospective repaired prompt is v10',
    identity.promptVersion === 'hazlenz.expert.prompt.v10', identity.promptVersion);
  check('F.4 the analysis contract is UNCHANGED at v2 — the schema gained no field',
    EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    EXPERT_ANALYSIS_CONTRACT_VERSION);
  // The settlement semantics must be in the text that actually goes to the model, not merely in the
  // module. This is the one check that ties the probe to the thing it is probing.
  check('F.5 the settlement rule is in the system prompt this probe will send',
    built.every(([sys]) => sys.includes('WHAT COUNTS AS ESTABLISHED')
      && sys.includes('THE SETTLEMENT CHECK')
      && sys.indexOf('WHAT COUNTS AS ESTABLISHED') < sys.indexOf('THE COUNTERFACTUAL TEST')),
    'present and correctly ordered in all requests');

  // ---- G. nothing about the answer key reaches the model
  const truthLeak = rows.map((r, i) => {
    const leak = truthOnlyStrings(r).filter(s => s.length > 12
      && built[i].some(text => text.includes(s)));
    return { rowId: r.source.rowId, leak };
  }).filter(x => x.leak.length > 0);
  check('G.1 no truth-key-only string reaches any request', truthLeak.length === 0,
    `${rows.length} scanned`);
  const citationLeak = built.map((b, i) => ({ rowId: rows[i].source.rowId,
    hits: b.filter(t => CITATION_SHAPED_PATTERN.test(t)).length })).filter(x => x.hits > 0);
  check('G.2 no built prompt carries citation-shaped text', citationLeak.length === 0,
    `${rows.length} scanned`);
  const suppliedWithCitations = rows.flatMap(r => r.source.governedStandards)
    .flatMap(g => strings(g)).filter(s => CITATION_SHAPED_PATTERN.test(s)).length;
  check('G.3 redaction is exercised', suppliedWithCitations > 0,
    `${suppliedWithCitations} supplied record fields carried a citation pre-render`);

  // ---- H. budget, store, identity
  assertBudgetInternallyConsistent();
  check('H.1 spend ceiling is the LOWER of authorized and model-priced',
    Math.abs(SPEND_CEILING_USD - Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING)) < 1e-9,
    `authorized $${B.hardSpendCeilingUsd.toFixed(2)}, priced `
    + `$${MODEL_PRICED_CEILING.toFixed(4)} -> enforcing $${SPEND_CEILING_USD.toFixed(4)}`);
  check('H.1b the retry allowance is the whole headroom and no more',
    RETRY_BUDGET === B.hardProviderRequestCeiling - B.targetLogicalCalls && RETRY_BUDGET === 2,
    `${RETRY_BUDGET} requests, inside the ${B.hardProviderRequestCeiling}-request cap`);
  mkdirSync(OUT, { recursive: true });
  const storePath = join(OUT, RUN_RECORD_FILE);
  const idPath = join(OUT, 'PRE-SPEND-IDENTITY.json');
  if (measureOnly) {
    check('H.2 MEASURE-ONLY: store exists', existsSync(storePath)
      && readFileSync(storePath, 'utf8').trim().length > 0, 'no provider request will be issued');
  } else {
    check('H.2 store is empty or absent',
      !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');
    check('H.3 PRE-SPEND-IDENTITY.json does not already exist', !existsSync(idPath), 'clean');
  }

  const preSpend: PreSpendIdentity = {
    operation: '§147 Expert HazLenz bounded hosted clarification-recall remediation probe',
    capturedAt: new Date().toISOString(), isFormalEvaluation: false,
    hashes: {
      probeScriptSha256: sha256File(join(ROOT, SCRIPT)),
      fixtureManifestSha256: sha256File(join(ROOT, FIXTURES)),
      systemPromptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      normalizationSha256: sha256File(join(ROOT, NORMALIZATION)),
      contractTypesSha256: sha256File(join(ROOT, CONTRACT_TYPES)),
    },
    execution: { provider: BOUND_PROVIDER, model: cfg.model,
      promptVersion: identity.promptVersion,
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION },
    budget: { targetLogicalCalls: B.targetLogicalCalls,
      hardProviderRequestCeiling: B.hardProviderRequestCeiling,
      retryRequestBudget: RETRY_BUDGET,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)),
      worstCaseRequestUsd: Number(WORST_CASE_REQUEST_USD.toFixed(6)) },
    extra: {
      git: { head: process.env.PROBE_GIT_HEAD ?? null, branch: process.env.PROBE_GIT_BRANCH ?? null,
        upstream: process.env.PROBE_GIT_UPSTREAM ?? null, dirty: process.env.PROBE_GIT_DIRTY ?? null },
      historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
      contractVersions: { input: EXPERT_INPUT_CONTRACT_VERSION, validator: EXPERT_VALIDATOR_VERSION,
        measurement: EXPERT_MEASUREMENT_CONTRACT_VERSION, harness: EXPERT_COHORT_HARNESS_VERSION,
        runRecordStore: RUN_RECORD_STORE_VERSION, probeMeasures: PROBE_MEASURES_VERSION,
        fixtureSet: CLARIFICATION_RECALL_FIXTURE_SET_VERSION },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      frozenGates: CLARIFICATION_RECALL_GATES,
      gate,
    },
  };

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_CLARIFICATION_RECALL_PROBE_BLOCKED — PRESPEND_REGRESSION_OR_HARNESS_FAILURE\n'
      + gate.filter(x => !x.ok).map(x => `${x.id}: ${x.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.'); process.exit(1);
  }
  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  // A $0.00 rehearsal must never consume the write-once artifact. §142 learned this by consuming it.
  if (dryRun) {
    console.log('ACTIVE_SCRIPT_EXECUTABLE_PROOF = TRUE');
    console.log('PROBE_DRY_RUN=1 — stopping BEFORE the identity write and before any spend.');
    process.exit(0);
  }

  // ================================================================ SPEND
  type RunFacts = { stopReason: string; identityViolation: string | null;
    accounting: Record<string, number>; retryCauses: string[]; retriesSuppressed: unknown[];
    startedAt: string; finishedAt: string; providerInvocations: number };
  let runFacts: RunFacts;
  let readBackProof: { rowId: string; provenBeforeExit: boolean; recordsOnDisk: number } | null = null;

  if (measureOnly) {
    console.log('--- MEASURE-ONLY. $0.00.\n');
    const prior = JSON.parse(readFileSync(join(OUT, 'RESULTS-SUMMARY.json'), 'utf8'));
    runFacts = { stopReason: prior.stopReason, identityViolation: prior.identityViolation,
      accounting: prior.accounting, retryCauses: prior.retryCauses,
      retriesSuppressed: prior.retriesSuppressed, startedAt: prior.startedAt,
      finishedAt: prior.finishedAt, providerInvocations: prior.providerInvocationsThisProcess };
    readBackProof = prior.persistence?.midRunReadBackProof ?? null;
    writeRemeasureIdentity(join(OUT, 'PRE-SPEND-IDENTITY.remeasure.json'), preSpend);
  } else {
    writePreSpendIdentityOnce(idPath, preSpend);
    let refused = false; const before = sha256File(idPath);
    try { writePreSpendIdentityOnce(idPath, { ...preSpend, operation: 'SECOND WRITE' }); }
    catch (e) { refused = e instanceof IdentityAlreadyWrittenError; }
    check('H.4 a SECOND write to the live identity is refused, bytes unchanged',
      refused && sha256File(idPath) === before, `sha256 ${before.slice(0, 16)}… stable`);
    if (!refused || sha256File(idPath) !== before) {
      console.log('\nIDENTITY WRITE-ONCE PROOF FAILED. Nothing was spent.'); process.exit(1);
    }

    console.log('\n--- SPEND. The probe is SPENT at the first request.\n');
    const store = createRunRecordStore(OUT);
    const provider = new AnthropicExpertProvider(cfg);
    resetProviderInvocationCount();
    const startedAt = new Date().toISOString();
    const run = await runFormalCohort(rows, {
      mode: 'ENABLED', provider,
      callCeiling: B.targetLogicalCalls,
      requestCeiling: B.hardProviderRequestCeiling,
      retryRequestBudget: RETRY_BUDGET,
      worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
      spendCeilingUsd: SPEND_CEILING_USD,
      frozenIdentity: { provider: BOUND_PROVIDER, model: BOUND_MODEL },
      arms: ['BASE'], processId: randomUUID().slice(0, 8),
      nowIso: new Date().toISOString(),
      recordSink: (rec: CohortRunRecord) => {
        store.append(rec);
        if (!readBackProof) {
          const back0 = readRunRecordStore(OUT);
          readBackProof = { rowId: rec.row.source.rowId,
            provenBeforeExit: back0.problems.length === 0 && back0.records.length >= 1
              && back0.records[0].row?.source?.rowId === rec.row.source.rowId,
            recordsOnDisk: back0.records.length };
          console.log(`      [persistence proof] ${back0.records.length} record(s) read back from `
            + `disk with ${rows.length - 1} calls outstanding`);
        }
        const c = rec.calls[0]; const a = c?.analysis;
        const f = clarificationFixtureByRowId(rec.row.source.rowId)!;
        console.log(`      ${rec.row.source.rowId.padEnd(6)} `
          + `${(isRequired(f) ? 'REQUIRED ' : 'FORBIDDEN')} ${String(c?.layerStatus).padEnd(9)}`
          + ` clar ${String(a?.decisionCriticalClarifications.length ?? '-').padStart(2)}`
          + ` cand ${String(a?.expertHazardCandidates.length ?? '-').padStart(2)}`
          + `  ${String(c?.latencyMs ?? 0).padStart(6)}ms $${(c?.costUsd ?? 0).toFixed(5)}`);
      },
    });
    store.close();
    runFacts = { stopReason: run.stopReason, identityViolation: run.identityViolation,
      accounting: run.accounting as unknown as Record<string, number>,
      retryCauses: run.retryCauses, retriesSuppressed: run.retriesSuppressed,
      startedAt, finishedAt: new Date().toISOString(),
      providerInvocations: providerInvocationCount() };
    console.log(`\n  stop ${run.stopReason}   calls ${run.accounting.callsAttempted}/`
      + `${run.accounting.callsCompleted}   requests ${run.accounting.providerRequestsAttempted}`
      + ` (${run.accounting.retryRequestsAttempted} retries)`);
    console.log(`  tokens ${run.accounting.inputTokens} in / ${run.accounting.outputTokens} out`
      + `   spend $${run.accounting.spendUsd.toFixed(6)} of $${SPEND_CEILING_USD.toFixed(4)}`);
  }

  // ================================================================ MEASURE
  const back = readRunRecordStore(OUT);
  const completeness = runRecordCompletenessProblems(back.records, {
    rowOrder: rows.map(r => r.source.rowId), arms: ['BASE'] });
  const views: View[] = back.records.flatMap(rec => (rec.calls ?? []).map(call => ({
    rowId: rec.row.source.rowId, fx: clarificationFixtureByRowId(rec.row.source.rowId)!, call, rec })));
  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const clar = (v: View) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: View) => v.call.analysis?.expertHazardCandidates ?? [];
  const codes = (v: View) => (v.call.issues ?? []).map(i => i.code);

  // ---- PHASE 6a. REQUIRED recall, LOOSE only. The strict call is a human one.
  const requiredViews = present.filter(v => isRequired(v.fx));
  const forbiddenViews = present.filter(v => !isRequired(v.fx));
  const requiredSpoke = requiredViews.filter(v => clar(v).length > 0);
  const forbiddenSilent = forbiddenViews.filter(v => clar(v).length === 0);

  // ---- PHASE 6b. Object validity. An emitted question must be a legal object, not merely present.
  const invalidObjects: string[] = [];
  for (const v of present) {
    for (const c of clar(v)) {
      const problems: string[] = [];
      if (!(EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(String(c.affectedDecision))) {
        problems.push(`affectedDecision=${String(c.affectedDecision)}`);
      }
      if (!c.question || String(c.question).trim().length < 10) problems.push('question too short');
      if (!c.whyItMatters || String(c.whyItMatters).trim().length < 20) problems.push('no branches');
      if (!c.evidenceGap || String(c.evidenceGap).trim().length < 5) problems.push('no evidenceGap');
      // REGULATORY_INTERPRETATION is unusable where no record was supplied. The prompt says so.
      if (c.affectedDecision === 'REGULATORY_INTERPRETATION'
          && v.rec.row.source.governedStandards.length === 0) {
        problems.push('REGULATORY_INTERPRETATION with no supplied record');
      }
      if (problems.length > 0) {
        invalidObjects.push(`${v.rowId}/${String(c.clarificationId)}: ${problems.join('; ')}`);
      }
    }
  }

  // ---- PHASE 6c. Regression axes. None of these may move.
  const citation = citationDiagnostics(present.map((v, i): CitationCallInput => ({
    modelInputText: built[rows.findIndex(r => r.source.rowId === v.rowId)] ?? [],
    suppliedGovernedRecordText: v.rec.row.source.governedStandards.flatMap(g => strings(g)),
    validatedAnalysis: v.call.analysis ?? null,
    mergedExpertAdvisory: (v.call as unknown as { merged?: { expertAdvisory?: unknown } })
      .merged?.expertAdvisory ?? null,
    mergedGovernedBlock: (v.call as unknown as { merged?: { governed?: unknown } })
      .merged?.governed ?? null,
    issueCodes: codes(v),
  })));
  const coverage = coverageDiagnostics(views.map((v): CoverageCallInput => ({
    rowId: v.rowId,
    truthPresentFamilies: [...v.rec.row.truth.presentHazardFamilies],
    deterministicFamilies: [...(v.rec.deterministicFamiliesEmitted ?? [])],
    acceptedExpertFamilies: cands(v).map(c => String(c.hazardFamily)),
  })));
  const linkage = linkageDiagnostics(present.map((v): LinkageCallInput => ({
    rowId: v.rowId,
    expectation: 'NOT_A_LINKAGE_TEST',
    emittedCandidateKeys: cands(v).map(c => String(c.candidateKey)),
    emittedClarifications: clar(v).map(c => ({
      clarificationId: String(c.clarificationId),
      relatesToCandidateKey: (c.relatesToCandidateKey as string | null) ?? null })),
    issueCodes: codes(v),
  })));
  const forbiddenFamilyEmitted = present.flatMap(v =>
    cands(v).filter(c => v.rec.row.truth.forbiddenHazardFamilies.includes(String(c.hazardFamily)))
      .map(c => `${v.rowId}:${String(c.hazardFamily)}`));
  const protectedContradictions = present.flatMap(v =>
    codes(v).filter(c => c === 'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE')
      .map(c => `${v.rowId}:${c}`));

  // ---- adjudication packet. Every emitted question beside the authored missing fact.
  const adjudication: string[][] = [
    ['rowId', 'structure', 'temptation', 'expectation', 'absenceIsUnmarked',
      'authoredMissingFact', 'authoredAffectedDecision', 'emittedQuestion',
      'emittedAffectedDecision', 'emittedEvidenceGap', 'emittedWhyItMatters', 'explanationSummary',
      'uncertaintyStatements'],
  ];
  for (const v of views) {
    const t = isRequired(v.fx) ? reqTruth(v.fx) : null;
    const list = clar(v);
    const base = [v.rowId, v.fx.structure, v.fx.temptation, v.fx.expectation.kind,
      String(isRequired(v.fx) ? reqTruth(v.fx).absenceIsUnmarked : ''),
      t ? String(t.missingFact) : (v.fx.expectation as unknown as
        { truth: { temptingQuestion: string } }).truth.temptingQuestion,
      t ? String(t.affectedDecision) : 'NONE_OWED'];
    const summary = String(v.call.analysis?.expertExplanation?.summary ?? '');
    const unc = (v.call.analysis?.uncertainty?.statements ?? []).join(' | ');
    if (list.length === 0) {
      adjudication.push([...base, '(none emitted)', '', '', '', summary, unc]);
    } else {
      for (const c of list) {
        adjudication.push([...base, String(c.question), String(c.affectedDecision),
          String(c.evidenceGap ?? ''), String(c.whyItMatters ?? ''), summary, unc]);
      }
    }
  }

  const results = {
    operation: '§147 bounded hosted clarification-recall remediation probe',
    isFormalEvaluation: false, historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason, identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting, retryCauses: runFacts.retryCauses,
    retriesSuppressed: runFacts.retriesSuppressed,
    providerInvocationsThisProcess: runFacts.providerInvocations,
    identity: { provider: BOUND_PROVIDER, model: cfg.model,
      promptVersion: identity.promptVersion,
      systemPromptSha256: identity.systemPromptSha256,
      wireSchemaSha256: identity.wireSchemaSha256,
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION },
    persistence: { recordsOnDisk: back.records.length, parseProblems: back.problems,
      completenessProblems: completeness, midRunReadBackProof: readBackProof },
    callDisposition: {
      present: present.length,
      outputRejected: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED').length,
      providerFailed: views.filter(v => v.call.layerStatus === 'PROVIDER_FAILED').length,
    },
    // §147 (P7): a rejected call is now diagnosable. Recorded whether or not one occurred.
    rejectionDiagnostics: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED')
      .map(v => ({ rowId: v.rowId, issues: v.call.issues })),
    clarification: {
      REQUIRED_ROWS: requiredViews.length,
      REQUIRED_ROWS_THAT_SPOKE_LOOSE: requiredSpoke.length,
      REQUIRED_ROWS_SILENT: requiredViews.length - requiredSpoke.length,
      REQUIRED_SILENT_ROW_IDS: requiredViews.filter(v => clar(v).length === 0).map(v => v.rowId),
      FORBIDDEN_ROWS: forbiddenViews.length,
      FORBIDDEN_ROWS_SILENT: forbiddenSilent.length,
      FORBIDDEN_ROWS_THAT_SPOKE: forbiddenViews.filter(v => clar(v).length > 0)
        .map(v => ({ rowId: v.rowId, structure: v.fx.structure,
          questions: clar(v).map(c => String(c.question)) })),
      TOTAL_CLARIFICATIONS: present.reduce((t, v) => t + clar(v).length, 0),
      CLARIFICATIONS_PER_CALL: present.length === 0 ? 0
        : Number((present.reduce((t, v) => t + clar(v).length, 0) / present.length).toFixed(3)),
      INVALID_CLARIFICATION_OBJECTS: invalidObjects,
      STRICT_RECALL: 'NOT_COMPUTED_BY_SCRIPT — adjudicate from CLARIFICATION-ADJUDICATION.csv; a '
        + 'semantically different question is not recall',
    },
    regression: {
      citation, coverage, linkage,
      FORBIDDEN_FAMILY_CANDIDATES_EMITTED: forbiddenFamilyEmitted,
      PROTECTED_AUTHORITY_CONTRADICTIONS: protectedContradictions.length,
      TOTAL_CANDIDATES: present.reduce((t, v) => t + cands(v).length, 0),
    },
    frozenGates: CLARIFICATION_RECALL_GATES,
    budget: { targetLogicalCalls: B.targetLogicalCalls,
      hardProviderRequestCeiling: B.hardProviderRequestCeiling,
      enforcedSpendCeilingUsd: Number(SPEND_CEILING_USD.toFixed(6)) },
    gate,
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 1) + '\n');
  writeFileSync(join(OUT, 'CLARIFICATION-ADJUDICATION.csv'), csv(adjudication));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    fixtureSetVersion: CLARIFICATION_RECALL_FIXTURE_SET_VERSION,
    fixtureFileSha256: sha256File(join(ROOT, FIXTURES)),
    rows: fx.map(f => ({ rowId: f.row.source.rowId, domain: f.domain, structure: f.structure,
      temptation: f.temptation, expectation: f.expectation.kind,
      caseClasses: classifyRow(f.row), truth: f.row.truth, expected: f.expectation })),
  }, null, 1) + '\n');
  writeFileSync(join(OUT, 'ATTEMPT-LEDGER.json'), JSON.stringify({
    perCall: views.map(v => ({ rowId: v.rowId, layerStatus: v.call.layerStatus,
      attempts: v.call.attempts, latencyMs: v.call.latencyMs, costUsd: v.call.costUsd,
      inputTokens: v.call.inputTokens, outputTokens: v.call.outputTokens,
      modelIdentity: v.call.modelIdentity, issues: v.call.issues,
      retrySuppressed: v.call.retrySuppressed })),
  }, null, 1) + '\n');

  console.log(`\n  artifacts -> ${OUT.replace(ROOT + '/', '')}`);
  console.log(`  REQUIRED spoke (LOOSE)  ${requiredSpoke.length}/${requiredViews.length}`
    + `   silent: ${results.clarification.REQUIRED_SILENT_ROW_IDS.join(' ') || 'none'}`);
  console.log(`  FORBIDDEN silent        ${forbiddenSilent.length}/${forbiddenViews.length}`
    + `   spoke: ${results.clarification.FORBIDDEN_ROWS_THAT_SPOKE.map(x => x.rowId).join(' ') || 'none'}`);
  console.log(`  clarifications          ${results.clarification.TOTAL_CLARIFICATIONS}`
    + ` (${results.clarification.CLARIFICATIONS_PER_CALL}/call)`);
  console.log(`  invalid objects         ${invalidObjects.length}`);
  console.log(`  citations acc/merged    ${citation.ACCEPTED_CITATION_COUNT}/${citation.MERGED_CITATION_COUNT}`);
  console.log(`  forbidden families      ${forbiddenFamilyEmitted.length}`);
  console.log(`  protected contradictions ${protectedContradictions.length}`);
  console.log(`  invalid linkage         ${linkage.INVALID_LINKAGE_ATTEMPTS}`);
  console.log(`  union coverage          ${coverage.combinedCoveredCount}/${coverage.truthPresentTotal}`);
  console.log('\nSTRICT recall is adjudicated from CLARIFICATION-ADJUDICATION.csv, not by this script.');
})().catch(e => { console.error(e); process.exit(1); });
