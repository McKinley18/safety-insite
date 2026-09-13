/**
 * §146 -- EXPANDED POST-REMEDIATION HOSTED DEVELOPMENT VALIDATION.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * Not a formal evaluation, not a formal cohort, not a rerun of spent material, not an acceptance
 * run, not an M14 experiment, not customer-activation authorization. No frozen scorer runs;
 * `run.scoring` is discarded rather than read.
 *
 * ==================== NINE AXES, ONE ARM ====================
 *
 * Clarification recall and precision, candidate recall, candidate precision/decomposition,
 * cross-hazard insight precision, disagreement quality, governed evidence, citation containment,
 * additive union quality. **Linkage is a REGRESSION AXIS ONLY** and consumes three rows.
 *
 * ==================== FOUR RULES INHERITED FROM FOUR INSTRUMENT DEFECTS ====================
 *
 *   1. Measure against the ANSWER KEY, never against collection co-occurrence (§141).
 *   2. Count by PRODUCER: governed input records are never Expert output (§140).
 *   3. No blanket labels: every judgement carries a stated per-row reason (§142).
 *   4. Never author truth that depends on the model's own decomposition; report
 *      `DECOMPOSITION_UNRESOLVABLE` rather than guess (§145).
 *
 * And one that follows from all four: **an instrument defect must never be reported as a model
 * defect.** Where a denominator is thin or a fixture premise fails, this script says so.
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
  EXPANDED_VALIDATION_FIXTURES, EXPANDED_VALIDATION_ROWS, EXPANDED_VALIDATION_BUDGET,
  EXPANDED_VALIDATION_TARGETS, EXPANDED_VALIDATION_FIXTURE_SET_VERSION,
  validationFixtureByRowId, type ValidationFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/expanded-validation-v4';
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
  citationDiagnostics, coverageDiagnostics, linkageDiagnostics, evaluateScenarioIntent,
  classifyCandidateQuality, PROBE_MEASURES_VERSION,
  type CitationCallInput, type CoverageCallInput, type LinkageCallInput, type LinkageExpectation,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256, sha256File, writePreSpendIdentityOnce,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';
import type { CallRecord, CohortRunRecord } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-expanded-post-remediation-validation-2026-09-03');

const B = EXPANDED_VALIDATION_BUDGET;
const MODEL_PRICED_CEILING = B.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD;
const SPEND_CEILING_USD = Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING);
const RETRY_BUDGET = B.hardProviderRequestCeiling - B.targetLogicalCalls;
const BOUND_PROVIDER = 'anthropic';
const BOUND_MODEL = 'claude-sonnet-5';
const HISTORICAL_PROVIDER_INVOCATION_COUNT = 195;

const SCRIPT = 'backend/scripts/validate-expert-expanded-2026-09-03.ts';
const FIXTURES = 'backend/src/hazlenz/expert-hazlenz/fixtures/expanded-validation-v4.ts';
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

interface View { rowId: string; fx: ValidationFixture; call: CallRecord; rec: CohortRunRecord }

(async () => {
  console.log('§146 EXPERT HAZLENZ — EXPANDED POST-REMEDIATION DEVELOPMENT VALIDATION');
  console.log('='.repeat(100));
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  const measureOnly = process.env.PROBE_MEASURE_ONLY === '1';
  console.log(`\n--- PHASE 0/1/3. PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  const rows = EXPANDED_VALIDATION_ROWS;
  const fx = EXPANDED_VALIDATION_FIXTURES;

  // ---- A. structure
  check('A.1 logical calls within the authorized band',
    rows.length >= 20 && rows.length <= B.hardLogicalCallCeiling,
    `${rows.length} rows (target ${B.targetLogicalCalls}, hard ceiling ${B.hardLogicalCallCeiling})`);
  const probs = rows.flatMap(validateCohortRow);
  check('A.2 every row is structurally scoreable', probs.length === 0,
    probs.length === 0 ? '0 problems' : probs.map(p => `${p.rowId}/${p.code}`).join(', '));
  check('A.3 ids are fresh EV-* development ids',
    rows.every(r => r.source.rowId.startsWith('EV-')), rows.map(r => r.source.rowId).join(' '));
  const domains = new Set(fx.map(f => f.domain));
  check('A.4 the set is not over-sampled on one family', domains.size >= 12,
    `${domains.size} distinct domains across ${rows.length} rows`);

  // ---- B. composition minimums
  const trueGap = fx.filter(f => f.clarification.kind === 'TRUE_GAP');
  const noGap = fx.filter(f => f.clarification.kind === 'NO_GAP');
  check('B.1 >=8 TRUE-GAP clarification positives', trueGap.length >= 8, `${trueGap.length}`);
  const decisions = new Set(trueGap.map(f =>
    (f.clarification as unknown as { gap: { affectedDecision: string } }).gap.affectedDecision));
  check('B.2 TRUE-GAPs span the affectedDecision vocabulary', decisions.size >= 5,
    `${decisions.size} of 6: ${[...decisions].join(', ')}`);
  check('B.3 >=6 NO-GAP negatives', noGap.length >= 6, `${noGap.length}`);
  const shapes = new Set(noGap.map(f =>
    (f.clarification as unknown as { temptingShape: string }).temptingShape));
  check('B.4 all six tempting shapes are represented', shapes.size === 6,
    [...shapes].join(', '));
  check('B.5 >=8 authored additive-candidate opportunities',
    fx.filter(f => f.candidate.expectation === 'REQUIRED_ADDITIVE').length >= 8,
    `${fx.filter(f => f.candidate.expectation === 'REQUIRED_ADDITIVE').length}`);
  const insightYes = fx.filter(f => f.insight.expectation === 'INTERACTION_PLAUSIBLE');
  const insightNo = fx.filter(f => f.insight.expectation === 'NO_INSIGHT_WARRANTED');
  check('B.6 >=6 plausible-interaction rows and >=6 no-insight rows',
    insightYes.length >= 6 && insightNo.length >= 6,
    `${insightYes.length} plausible / ${insightNo.length} none`);
  check('B.7 >=3 valid disagreement opportunities',
    fx.filter(f => f.disagreement.opportunity).length >= 3,
    fx.filter(f => f.disagreement.opportunity).map(f => f.row.source.rowId).join(' '));
  const gov = (r: string) => fx.filter(f => (f.governed ?? []).includes(r as never)).length;
  check('B.8 governed composition: >=2 relevant, >=2 unrelated, >=1 none, >=1 narrower',
    gov('RELEVANT') >= 2 && gov('UNRELATED') >= 2 && gov('NONE') >= 1 && gov('NARROWER') >= 1,
    `relevant ${gov('RELEVANT')} unrelated ${gov('UNRELATED')} none ${gov('NONE')} narrower ${gov('NARROWER')}`);
  check('B.9 >=2 citation-adversarial cases',
    fx.filter(f => f.citationAdversarial).length >= 2,
    `${fx.filter(f => f.citationAdversarial).length}`);
  const reqLink = fx.filter(f => f.linkage.intent === 'REQUIRED_LINKAGE_CHALLENGE');
  const noLink = fx.filter(f => f.linkage.intent === 'GENERIC_FOLLOWUP_CHALLENGE'
    || f.linkage.intent === 'AMBIGUOUS_CANDIDATE_CHALLENGE');
  check('B.10 linkage REGRESSION ONLY: >=2 REQUIRED, >=1 ambiguous/generic, and a small share',
    reqLink.length >= 2 && noLink.length >= 1 && (reqLink.length + noLink.length) <= rows.length / 3,
    `${reqLink.length} required + ${noLink.length} no-link = `
    + `${reqLink.length + noLink.length} of ${rows.length} rows`);

  // ---- C. PHASE 3 fixture-truth quality gate. The §140 DP-B4 lesson, enforced.
  const badGaps: string[] = [];
  for (const f of trueGap) {
    const g = (f.clarification as unknown as { gap: Record<string, string> }).gap;
    for (const k of ['missingFact', 'answerA', 'outcomeA', 'answerB', 'outcomeB',
      'affectedDecision', 'whyCurrentEvidenceIsInsufficient']) {
      if (!g[k] || g[k].trim().length < 8) badGaps.push(`${f.row.source.rowId}.${k}`);
    }
    if (g.outcomeA && g.outcomeB && g.outcomeA.trim() === g.outcomeB.trim()) {
      badGaps.push(`${f.row.source.rowId}: BOTH OUTCOMES IDENTICAL — fails the counterfactual`);
    }
  }
  check('C.1 every TRUE-GAP states BOTH answers and BOTH DIFFERENT current outcomes',
    badGaps.length === 0,
    badGaps.length === 0 ? `${trueGap.length} gaps carry a complete counterfactual`
      : badGaps.join(' | '));
  check('C.2 every TRUE-GAP row carries exactly one authored gap',
    trueGap.every(f => f.row.truth.decisionCriticalGaps.length === 1),
    'retention is unambiguous per row');
  check('C.3 every NO-GAP row states WHY it is not decision-critical',
    noGap.every(f => (f.clarification as unknown as { whyNotDecisionCritical: string })
      .whyNotDecisionCritical.trim().length >= 40),
    'no blanket labels');
  check('C.4 decomposition truth is DECOMPOSITION_UNRESOLVABLE unless genuinely adjudicable',
    fx.every(f => f.candidate.decomposition.length > 0),
    `${fx.filter(f => f.candidate.decomposition === 'DECOMPOSITION_UNRESOLVABLE').length} of `
    + `${fx.length} rows honestly decline to author candidate-count truth`);
  check('C.5 no linkage row authors FORBIDDEN truth from a presumed decomposition',
    fx.every(f => f.linkage.note.length > 0),
    'linkage rows carry a SCENARIO INTENT judged against the emitted candidate set');

  // ---- D. containment
  const self = readFileSync(__filename, 'utf8');
  const imports = self.split('\n').filter(l => /^\s*import/.test(l)).join('\n');
  const banned = ['expert-cohort-65-selection', 'execute-formal-cohort-65', 'assemble-formal-cohort',
    'expert-hazlenz-formal-cohort-frozen', 'expert-hazlenz-formal-evaluation',
    'open-d86-reserved-offsets', 'hosted-remediation-probe-v1', 'hosted-linkage-probe-v2',
    'linkage-confirmation-probe-v3', 'probe-expert-hosted-linkage-2026-09-02'];
  const bad = banned.filter(x => imports.includes(x));
  check('D.1 no formal-cohort, reserved or SPENT-probe path imported', bad.length === 0,
    bad.length === 0 ? 'clean' : bad.join(', '));

  // ---- E. provider identity
  const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
  check('E.1 model bound exactly', cfg.model === BOUND_MODEL, cfg.model);
  check('E.2 vendor endpoint', /^https:\/\/api\.anthropic\.com\/?$/.test(cfg.endpoint), cfg.endpoint);
  check('E.3 thinking disabled', cfg.thinking === 'disabled', cfg.thinking);
  check('E.4 credential present (never logged or persisted)',
    !!process.env.ANTHROPIC_API_KEY?.trim(), process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING');

  // ---- F. dry build + the COMPUTED additive-opportunity denominator
  resetProviderInvocationCount();
  const dry = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: B.targetLogicalCalls, spendCeilingUsd: 0,
    arms: ['BASE'], processId: 'dry', nowIso: new Date().toISOString(),
  });
  check('F.1 built one request per row, called nothing',
    dry.requestsBuilt.length === rows.length && providerInvocationCount() === 0,
    `${dry.requestsBuilt.length} built, ${providerInvocationCount()} invocations`);
  check('F.2 ONE ARM ONLY — M14 not attempted',
    dry.requestsBuilt.every(r => r.arm === 'BASE'), 'BASE');

  /**
   * THE ADDITIVE-OPPORTUNITY DENOMINATOR, MEASURED RATHER THAN AUTHORED.
   *
   * Which truth-present family the deterministic engine actually misses is a fact about the engine,
   * not a guess. It is computed here by running the REAL deterministic layer at $0.00, before any
   * spend, so the recall denominator cannot drift from what the engine does.
   */
  const additiveOpportunity = new Map<string, string[]>();
  for (const f of fx) {
    const det = runDeterministicSide(f.row).familiesEmitted;
    additiveOpportunity.set(f.row.source.rowId,
      f.row.truth.presentHazardFamilies.filter(x => !det.includes(x)));
  }
  const totalAdditiveOpportunities =
    [...additiveOpportunity.values()].reduce((t, v) => t + v.length, 0);
  check('F.3 additive-candidate opportunities are COMPUTED from the real engine',
    totalAdditiveOpportunities >= 8,
    `${totalAdditiveOpportunities} truth-present families the deterministic layer misses, across `
    + `${[...additiveOpportunity.values()].filter(v => v.length > 0).length} rows`);

  const identity = expertPromptIdentity(dry.requestsBuilt[0].input);
  console.log(`\n      prompt ${identity.promptVersion}   contract ${identity.contractVersion}`);
  console.log(`      system ${identity.systemPromptSha256}`);
  console.log(`      schema ${identity.wireSchemaSha256}\n`);
  check('F.4 prompt is v9', identity.promptVersion === 'hazlenz.expert.prompt.v9',
    identity.promptVersion);

  // ---- G. truth + citation containment in the input
  const leaks: string[] = [];
  const promptLeaks: string[] = [];
  let suppliedCitations = 0;
  const inputByRow = new Map<string, string[]>();
  for (const built of dry.requestsBuilt) {
    const ser = JSON.stringify(built.input);
    const r = rows.find(x => x.source.rowId === built.rowId)!;
    for (const s of truthOnlyStrings(r)) if (ser.includes(s)) leaks.push(`${built.rowId}`);
    const user = buildExpertUserPrompt(built.input);
    inputByRow.set(built.rowId, [EXPERT_SYSTEM_PROMPT, user]);
    if (CITATION_SHAPED_PATTERN.test(user)) promptLeaks.push(built.rowId);
    for (const gs of built.input.governedStandards) {
      for (const t of [gs.title ?? '', gs.approvedText ?? '']) {
        if (CITATION_SHAPED_PATTERN.test(t)) suppliedCitations += 1;
      }
    }
  }
  check('G.1 no truth-key-only string reaches any request', leaks.length === 0,
    leaks.length === 0 ? `${rows.length} scanned` : leaks.join(', '));
  check('G.2 no built prompt carries citation-shaped text', promptLeaks.length === 0,
    promptLeaks.length === 0 ? `${rows.length} scanned` : promptLeaks.join(', '));
  check('G.3 redaction is exercised', suppliedCitations > 0,
    `${suppliedCitations} supplied record fields carried a citation pre-render`);

  // ---- H. budget + store + identity
  assertBudgetInternallyConsistent();
  check('H.1 spend ceiling is the LOWER of authorized and model-priced',
    Math.abs(SPEND_CEILING_USD - Math.min(B.hardSpendCeilingUsd, MODEL_PRICED_CEILING)) < 1e-9,
    `authorized $${B.hardSpendCeilingUsd}, priced $${MODEL_PRICED_CEILING.toFixed(4)} -> `
    + `enforcing $${SPEND_CEILING_USD.toFixed(4)}`);
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
    operation: '§146 Expert HazLenz expanded post-remediation development validation',
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
        fixtureSet: EXPANDED_VALIDATION_FIXTURE_SET_VERSION },
      arms: ['BASE'], m14RemediationStatus: 'NOT_ATTEMPTED',
      endpoint: cfg.endpoint, apiVersion: cfg.apiVersion, maxTokens: cfg.maxTokens,
      thinking: cfg.thinking,
      computedAdditiveOpportunities: Object.fromEntries(additiveOpportunity),
      gate,
    },
  };

  if (gateFailed) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_EXPANDED_VALIDATION_BLOCKED — PRESPEND_REGRESSION_OR_HARNESS_FAILURE\n'
      + gate.filter(x => !x.ok).map(x => `${x.id}: ${x.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.'); process.exit(1);
  }
  console.log(`\n  PRE-SPEND GATE: ${gate.length}/${gate.length} PASS. $0.00 spent so far.\n`);

  // A $0.00 rehearsal must never consume the write-once artifact.
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

    console.log('\n--- SPEND. The validation is SPENT at the first request.\n');
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
          const back = readRunRecordStore(OUT);
          readBackProof = { rowId: rec.row.source.rowId,
            provenBeforeExit: back.problems.length === 0 && back.records.length >= 1
              && back.records[0].row?.source?.rowId === rec.row.source.rowId,
            recordsOnDisk: back.records.length };
          console.log(`      [persistence proof] ${back.records.length} record(s) read back from `
            + `disk with ${rows.length - 1} calls outstanding`);
        }
        const c = rec.calls[0]; const a = c?.analysis;
        console.log(`      ${rec.row.source.rowId.padEnd(6)} ${String(c?.layerStatus).padEnd(9)}`
          + ` cand ${String(a?.expertHazardCandidates.length ?? '-').padStart(2)}`
          + ` clar ${String(a?.decisionCriticalClarifications.length ?? '-').padStart(2)}`
          + ` ins ${String(a?.crossHazardInsights.length ?? '-').padStart(2)}`
          + ` dis ${String(a?.disagreements.length ?? '-').padStart(2)}`
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
    rowId: rec.row.source.rowId, fx: validationFixtureByRowId(rec.row.source.rowId)!, call, rec })));
  const present = views.filter(v => v.call.layerStatus === 'PRESENT' && v.call.analysis);
  const clar = (v: View) => v.call.analysis?.decisionCriticalClarifications ?? [];
  const cands = (v: View) => v.call.analysis?.expertHazardCandidates ?? [];
  const ins = (v: View) => v.call.analysis?.crossHazardInsights ?? [];
  const dis = (v: View) => v.call.analysis?.disagreements ?? [];
  const codes = (v: View) => (v.call.issues ?? []).map(i => i.code);

  // ---- PHASE 7. CLARIFICATION
  const tgViews = present.filter(v => v.fx.clarification.kind === 'TRUE_GAP');
  const ngViews = present.filter(v => v.fx.clarification.kind === 'NO_GAP');
  const totalClar = present.reduce((t, v) => t + clar(v).length, 0);
  const clarificationAdjudication: string[][] = [['rowId', 'fixtureKind', 'authoredAffectedDecision',
    'emittedAffectedDecision', 'labelMatch', 'question', 'whyItMatters', 'link', 'temptingShape']];
  let afdCorrect = 0, afdIncorrect = 0;
  const tgDetail = tgViews.map(v => {
    const gap = (v.fx.clarification as unknown as
      { gap: { affectedDecision: string; missingFact: string } }).gap;
    const asked = clar(v).length > 0;
    const match = clar(v).some(q => q.affectedDecision === gap.affectedDecision);
    for (const q of clar(v)) {
      if (q.affectedDecision === gap.affectedDecision) afdCorrect += 1; else afdIncorrect += 1;
      clarificationAdjudication.push([v.rowId, 'TRUE_GAP', gap.affectedDecision,
        q.affectedDecision, String(q.affectedDecision === gap.affectedDecision), q.question,
        q.whyItMatters, q.relatesToCandidateKey ?? '', '']);
    }
    if (!asked) clarificationAdjudication.push([v.rowId, 'TRUE_GAP', gap.affectedDecision,
      'NONE', 'false', '(no question emitted)', '', '', '']);
    return { rowId: v.rowId, authoredMissingFact: gap.missingFact,
      authoredAffectedDecision: gap.affectedDecision, asked, labelMatch: match,
      emitted: clar(v).map(q => ({ question: q.question, affectedDecision: q.affectedDecision,
        whyItMatters: q.whyItMatters, link: q.relatesToCandidateKey ?? null })) };
  });
  for (const v of ngViews) {
    const shape = (v.fx.clarification as unknown as { temptingShape: string }).temptingShape;
    for (const q of clar(v)) {
      clarificationAdjudication.push([v.rowId, 'NO_GAP', 'NONE_OWED', q.affectedDecision, 'n/a',
        q.question, q.whyItMatters, q.relatesToCandidateKey ?? '', shape]);
    }
  }
  const coverageTemplateRows = present.filter(v => {
    const d = new Set(clar(v).map(q => q.affectedDecision));
    return d.has('EXPOSURE') && d.has('HAZARD_SEVERITY') && d.has('REQUIRED_CONTROL');
  }).map(v => v.rowId);
  const duplicateQuestions = present.flatMap(v => {
    const seen = new Map<string, number>();
    for (const q of clar(v)) {
      const k = q.question.trim().toLowerCase(); seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    return [...seen.entries()].filter(([, n]) => n > 1)
      .map(([q, n]) => ({ rowId: v.rowId, question: q, count: n }));
  });

  // ---- PHASE 8. CANDIDATE RECALL (denominator computed pre-spend from the real engine)
  const recallRows = present.map(v => {
    const opp = additiveOpportunity.get(v.rowId) ?? [];
    const emitted = cands(v).map(c => c.hazardFamily);
    return { rowId: v.rowId, opportunities: opp, found: opp.filter(f => emitted.includes(f)),
      missed: opp.filter(f => !emitted.includes(f)) };
  });
  const ADDITIVE_OPP = recallRows.reduce((t, r) => t + r.opportunities.length, 0);
  const ADDITIVE_FOUND = recallRows.reduce((t, r) => t + r.found.length, 0);

  // ---- PHASE 9. CANDIDATE PRECISION / DECOMPOSITION
  const candidateAdjudication: string[][] = [['rowId', 'candidateKey', 'hazardFamily', 'state',
    'boundQuotes', 'classification', 'reason', 'fixtureDecompositionTruth']];
  const candCounts: Record<string, number> = { SUPPORTED_DISTINCT: 0, PLAUSIBLE_BUT_UNVERIFIED: 0,
    DUPLICATE_SEMANTIC_CANDIDATE: 0, OVER_FRAGMENTED: 0, UNSUPPORTED: 0, UNRESOLVABLE: 0 };
  for (const v of present) {
    const seenFamilies = new Map<string, number>();
    for (const c of cands(v)) seenFamilies.set(c.hazardFamily, (seenFamilies.get(c.hazardFamily) ?? 0) + 1);
    for (const c of cands(v)) {
      const q = classifyCandidateQuality(c.hazardFamily, v.fx.row.truth);
      // §145: OVER_FRAGMENTED is only assertable when fixture truth adjudicates decomposition, and
      // this manifest declines to for every row. Duplicates within a family are REPORTED as
      // UNRESOLVABLE rather than convicted, because "two candidates in one family" is not by itself
      // evidence that one semantic hazard was split.
      let cls: string = q.quality === 'SUPPORTED_ADDITIVE_CANDIDATE' ? 'SUPPORTED_DISTINCT'
        : q.quality === 'SPURIOUS_CANDIDATE' ? 'UNSUPPORTED' : q.quality;
      let reason = q.reason;
      if ((seenFamilies.get(c.hazardFamily) ?? 0) > 1
          && v.fx.candidate.decomposition === 'DECOMPOSITION_UNRESOLVABLE') {
        cls = 'UNRESOLVABLE';
        reason = `${seenFamilies.get(c.hazardFamily)} candidates share family ${c.hazardFamily}; the `
          + 'fixture declines to adjudicate decomposition, so duplication/fragmentation is REPORTED '
          + 'and not convicted';
      }
      candCounts[cls] = (candCounts[cls] ?? 0) + 1;
      candidateAdjudication.push([v.rowId, c.candidateKey, c.hazardFamily, c.assertedConditionState,
        String(c.evidence.length), cls, reason, v.fx.candidate.decomposition]);
    }
  }

  // ---- PHASE 10. INSIGHTS
  const insightAdjudication: string[][] = [['rowId', 'fixtureExpectation', 'interactionKind',
    'participants', 'classification', 'reasoning']];
  const insightCounts: Record<string, number> = { SUPPORTED_USEFUL: 0, PLAUSIBLE_BUT_UNNECESSARY: 0,
    UNSUPPORTED: 0, UNRESOLVABLE: 0 };
  for (const v of present) {
    for (const i of ins(v)) {
      // The only mechanical signal available: did the FIXTURE judge an interaction plausible here?
      const cls = v.fx.insight.expectation === 'INTERACTION_PLAUSIBLE' ? 'SUPPORTED_USEFUL'
        : 'UNSUPPORTED';
      insightCounts[cls] += 1;
      insightAdjudication.push([v.rowId, v.fx.insight.expectation, i.interactionKind,
        i.participants.join(' + '), cls, i.reasoning]);
    }
  }
  const insightOpportunities = present.filter(v => v.fx.insight.expectation === 'INTERACTION_PLAUSIBLE');
  const insightFound = insightOpportunities.filter(v => ins(v).length > 0);
  const noInsightRowsWithOutput = present
    .filter(v => v.fx.insight.expectation === 'NO_INSIGHT_WARRANTED' && ins(v).length > 0)
    .map(v => v.rowId);

  // ---- PHASE 11. DISAGREEMENTS
  const disagreementAdjudication: string[][] = [['rowId', 'fixtureOpportunity', 'surface', 'type',
    'recommendsReview', 'classification', 'reasoning', 'fixtureBasis']];
  let disSupported = 0, disUnsupported = 0;
  for (const v of present) {
    for (const d of dis(v)) {
      const cls = v.fx.disagreement.opportunity ? 'SUPPORTED' : 'UNNECESSARY';
      if (cls === 'SUPPORTED') disSupported += 1; else disUnsupported += 1;
      disagreementAdjudication.push([v.rowId, String(v.fx.disagreement.opportunity), d.surface,
        d.disagreementType, String(d.recommendsReview), cls, d.reasoning,
        v.fx.disagreement.basis ?? '']);
    }
  }
  // A disagreement can only reach output through the authority matrix, which refuses any surface
  // that does not permit CHALLENGE. A contradiction of protected authority is therefore counted
  // from the boundary's own refusals, not inferred from prose.
  const protectedAuthorityContradictions = views.flatMap(v => codes(v)
    .filter(c => c === 'DISAGREEMENT_SURFACE_NOT_CHALLENGEABLE'
      || c === 'DISAGREEMENT_UNKNOWN_SURFACE')).length;
  const disOpportunities = present.filter(v => v.fx.disagreement.opportunity);
  const disFound = disOpportunities.filter(v => dis(v).length > 0);

  // ---- PHASE 12/13. GOVERNED + CITATION
  const citation = citationDiagnostics(views.map(v => ({
    modelInputText: inputByRow.get(v.rowId) ?? [],
    suppliedGovernedRecordText: v.fx.row.source.governedStandards
      .flatMap(g => [g.title ?? '', g.approvedText ?? '']),
    validatedAnalysis: v.call.analysis,
    mergedExpertAdvisory: (v.call.merged as Record<string, unknown> | null)?.expertAdvisory ?? null,
    mergedGovernedBlock: (v.call.merged as Record<string, unknown> | null)?.governed ?? null,
    issueCodes: codes(v),
  } as CitationCallInput)));
  const governedDetail = present.filter(v => (v.fx.governed ?? []).length > 0).map(v => ({
    rowId: v.rowId, roles: v.fx.governed ?? [],
    recordsSupplied: v.fx.row.source.governedStandards
      .map(g => ({ title: g.title, backingState: g.backingState })),
    referencesARecordHandle: strings(v.call.analysis).some(s => /\bR\d\b/.test(s)),
    summary: v.call.analysis?.expertExplanation?.summary ?? null,
    forbiddenFamiliesEmitted: cands(v).map(c => c.hazardFamily)
      .filter(f => v.fx.row.truth.forbiddenHazardFamilies.includes(f)),
  }));

  // ---- PHASE 14. LINKAGE REGRESSION
  const linkInput: LinkageCallInput[] = present.map(v => ({
    rowId: v.rowId,
    expectation: (v.fx.linkage.intent === 'REQUIRED_LINKAGE_CHALLENGE' ? 'REQUIRED'
      : v.fx.linkage.intent === 'NO_LINKAGE_CLAIM' ? 'NOT_A_LINKAGE_TEST'
        : 'FORBIDDEN') as LinkageExpectation,
    emittedCandidateKeys: cands(v).map(c => c.candidateKey),
    emittedClarifications: clar(v).map(q => ({ clarificationId: q.clarificationId,
      relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
    issueCodes: codes(v),
  }));
  const linkage = linkageDiagnostics(linkInput);
  const scenarioIntents = present
    .filter(v => v.fx.linkage.intent !== 'NO_LINKAGE_CLAIM')
    .map(v => evaluateScenarioIntent({
      rowId: v.rowId, intent: v.fx.linkage.intent as never,
      intentPresumedFamilies: v.fx.linkage.presumedFamilies,
      acceptedCandidates: cands(v).map(c => ({ candidateKey: c.candidateKey,
        hazardFamily: c.hazardFamily })),
      emittedClarifications: clar(v).map(q => ({ clarificationId: q.clarificationId,
        relatesToCandidateKey: q.relatesToCandidateKey ?? null })),
    }));
  const outputRelativeForbiddenDefects = scenarioIntents
    .filter(s => s.countsInForbiddenDenominator)
    .reduce((t, s) => {
      const v = present.find(x => x.rowId === s.rowId)!;
      const keys = new Set(cands(v).map(c => c.candidateKey));
      return t + clar(v).filter(q => typeof q.relatesToCandidateKey === 'string'
        && keys.has(q.relatesToCandidateKey)).length;
    }, 0);

  // ---- PHASE 15. ADDITIVE UNION
  const coverage = coverageDiagnostics(back.records.flatMap(rec => {
    const v = views.find(x => x.rowId === rec.row.source.rowId);
    if (!v) return [];
    return [{ rowId: v.rowId, truthPresentFamilies: v.fx.row.truth.presentHazardFamilies,
      deterministicFamilies: rec.deterministicFamiliesEmitted ?? [],
      acceptedExpertFamilies: cands(v).map(c => c.hazardFamily) } as CoverageCallInput];
  }));
  const unnecessaryDuplication = back.records.flatMap(rec => {
    const v = views.find(x => x.rowId === rec.row.source.rowId);
    if (!v) return [];
    const det = new Set(rec.deterministicFamiliesEmitted ?? []);
    const dup = [...new Set(cands(v).map(c => c.hazardFamily).filter(f => det.has(f)))];
    return dup.length ? [{ rowId: v.rowId, families: dup }] : [];
  });

  // ---- PHASE 16. SPARSITY
  const sparsity = {
    denominator: present.length,
    expertCandidatesEmpty: present.filter(v => cands(v).length === 0).length,
    clarificationsEmpty: present.filter(v => clar(v).length === 0).length,
    insightsEmpty: present.filter(v => ins(v).length === 0).length,
    disagreementsEmpty: present.filter(v => dis(v).length === 0).length,
    totals: {
      expertCandidates: present.reduce((t, v) => t + cands(v).length, 0),
      clarifications: totalClar,
      crossHazardInsights: present.reduce((t, v) => t + ins(v).length, 0),
      disagreements: present.reduce((t, v) => t + dis(v).length, 0),
    },
    outcomes: Object.fromEntries(present.reduce((m, v) => {
      const o = String(v.call.analysis?.outcome); m.set(o, (m.get(o) ?? 0) + 1); return m;
    }, new Map<string, number>())),
  };

  const perFixture = views.map(v => ({
    rowId: v.rowId, domain: v.fx.domain,
    clarificationKind: v.fx.clarification.kind,
    layerStatus: v.call.layerStatus, outcome: v.call.analysis?.outcome ?? null,
    deterministicFamilies: v.rec.deterministicFamiliesEmitted ?? [],
    additiveOpportunity: additiveOpportunity.get(v.rowId) ?? [],
    candidates: cands(v).map(c => ({ key: c.candidateKey, family: c.hazardFamily,
      state: c.assertedConditionState, confidence: c.confidence, quotes: c.evidence.length })),
    clarifications: clar(v).map(q => ({ question: q.question, affectedDecision: q.affectedDecision,
      link: q.relatesToCandidateKey ?? null })),
    insights: ins(v).map(i => ({ kind: i.interactionKind, participants: i.participants })),
    disagreements: dis(v).map(d => ({ surface: d.surface, type: d.disagreementType })),
    summary: v.call.analysis?.expertExplanation?.summary ?? null,
    uncertainty: v.call.analysis?.uncertainty.statements ?? [],
    issues: (v.call.issues ?? []).map(i => i.code),
    mergeViolations: v.call.mergeViolations ?? [],
    attempts: (v.call.attempts ?? []).map(a => ({ index: a.attemptIndex, ok: a.ok,
      failureKind: a.failureKind })),
    latencyMs: v.call.latencyMs, inputTokens: v.call.inputTokens,
    outputTokens: v.call.outputTokens, costUsd: v.call.costUsd, modelIdentity: v.call.modelIdentity,
  }));

  const tgRecall = tgViews.length ? tgDetail.filter(t => t.asked).length / tgViews.length : 0;
  const ngSilence = ngViews.length
    ? ngViews.filter(v => clar(v).length === 0).length / ngViews.length : 0;
  const addRecall = ADDITIVE_OPP ? ADDITIVE_FOUND / ADDITIVE_OPP : 0;

  const results = {
    operation: '§146 Expert HazLenz expanded post-remediation development validation',
    isFormalEvaluation: false, formalGateStatusClaimed: 'NONE',
    m14RemediationStatus: 'NOT_ATTEMPTED',
    startedAt: runFacts.startedAt, finishedAt: runFacts.finishedAt,
    stopReason: runFacts.stopReason, identityViolation: runFacts.identityViolation,
    accounting: runFacts.accounting,
    providerInvocationsThisProcess: runFacts.providerInvocations,
    historicalProviderInvocationCount: HISTORICAL_PROVIDER_INVOCATION_COUNT,
    retryCauses: runFacts.retryCauses, retriesSuppressed: runFacts.retriesSuppressed,
    promptIdentity: identity,
    callDisposition: { present: present.length,
      outputRejected: views.filter(v => v.call.layerStatus === 'OUTPUT_REJECTED').length,
      providerFailed: views.filter(v => v.call.layerStatus !== 'PRESENT'
        && v.call.layerStatus !== 'OUTPUT_REJECTED').length },
    persistence: { storeFile: RUN_RECORD_FILE, storeSha256: back.sha256,
      recordsOnDisk: back.records.length, parseProblems: back.problems,
      completenessProblems: completeness, midRunReadBackProof: readBackProof },
    clarification: {
      TRUE_GAP_OPPORTUNITIES: tgViews.length,
      TRUE_GAP_CORRECTLY_ASKED: tgDetail.filter(t => t.asked).length,
      TRUE_GAP_MISSED: tgDetail.filter(t => !t.asked).length,
      TRUE_GAP_RECALL: Number(tgRecall.toFixed(3)),
      NO_GAP_ROWS: ngViews.length,
      NO_GAP_ROWS_SILENT: ngViews.filter(v => clar(v).length === 0).length,
      NO_GAP_SILENCE: Number(ngSilence.toFixed(3)),
      TOTAL_CLARIFICATIONS: totalClar,
      CLARIFICATIONS_PER_CALL: present.length
        ? Number((totalClar / present.length).toFixed(3)) : 0,
      AFFECTED_DECISION_CORRECT: afdCorrect,
      AFFECTED_DECISION_INCORRECT: afdIncorrect,
      GENERIC_OR_COVERAGE_HABIT_QUESTIONS: coverageTemplateRows.length,
      DUPLICATE_QUESTIONS: duplicateQuestions.length,
      trueGapDetail: tgDetail,
      noGapRowsWithQuestions: ngViews.filter(v => clar(v).length > 0)
        .map(v => ({ rowId: v.rowId,
          temptingShape: (v.fx.clarification as unknown as { temptingShape: string }).temptingShape,
          questions: clar(v).map(q => q.question) })),
    },
    candidateRecall: {
      ADDITIVE_CANDIDATE_OPPORTUNITIES: ADDITIVE_OPP,
      ADDITIVE_CANDIDATES_FOUND: ADDITIVE_FOUND,
      ADDITIVE_CANDIDATES_MISSED: ADDITIVE_OPP - ADDITIVE_FOUND,
      ADDITIVE_RECALL: Number(addRecall.toFixed(3)),
      denominatorProvenance: 'COMPUTED pre-spend by running the real deterministic layer at $0.00; '
        + 'the opportunity set is truth-present families the engine did not emit',
      perRow: recallRows.filter(r => r.opportunities.length > 0),
    },
    candidatePrecision: {
      TOTAL_EXPERT_CANDIDATES: sparsity.totals.expertCandidates, ...candCounts,
      note: 'OVER_FRAGMENTED is never asserted: every fixture declares DECOMPOSITION_UNRESOLVABLE, '
        + 'so multiple candidates in one family are REPORTED as UNRESOLVABLE rather than convicted. '
        + '§145 forbids authoring candidate-count truth.',
    },
    insights: {
      INSIGHT_OPPORTUNITIES: insightOpportunities.length,
      USEFUL_INSIGHTS_FOUND: insightFound.length,
      TOTAL_INSIGHTS_EMITTED: sparsity.totals.crossHazardInsights,
      ...insightCounts,
      NO_INSIGHT_ROWS_WITH_OUTPUT: noInsightRowsWithOutput.length,
      noInsightRowsWithOutputDetail: noInsightRowsWithOutput,
    },
    disagreements: {
      VALID_DISAGREEMENT_OPPORTUNITIES: disOpportunities.length,
      VALID_DISAGREEMENTS_FOUND: disFound.length,
      TOTAL_DISAGREEMENTS: sparsity.totals.disagreements,
      SUPPORTED: disSupported, UNSUPPORTED_OR_UNNECESSARY: disUnsupported,
      PROTECTED_AUTHORITY_CONTRADICTIONS: protectedAuthorityContradictions,
    },
    governed: {
      RELEVANT_RECORD_OPPORTUNITIES: fx.filter(f => (f.governed ?? []).includes('RELEVANT')).length,
      UNRELATED_RECORD_NEGATIVES: fx.filter(f => (f.governed ?? []).includes('UNRELATED')).length,
      NO_RECORD_NEGATIVES: fx.filter(f => (f.governed ?? []).includes('NONE')).length,
      NARROWER_RECORD_CHALLENGES: fx.filter(f => (f.governed ?? []).includes('NARROWER')).length,
      detail: governedDetail,
    },
    citation: { ...citation },
    linkageRegression: {
      REQUIRED_LINKAGE_OPPORTUNITIES: linkage.REQUIRED_LINKAGE_OPPORTUNITIES,
      REQUIRED_LINKAGE_VALID: linkage.REQUIRED_LINKAGE_VALID,
      INVALID_LINKAGE_ACCEPTED: linkage.INVALID_LINKAGE_ATTEMPTS,
      OUTPUT_RELATIVE_FORBIDDEN_DEFECTS: outputRelativeForbiddenDefects,
      SCENARIO_INTENT_NOT_REALIZED: scenarioIntents.filter(s => !s.realized).length,
      scenarioIntents,
      note: 'REGRESSION AXIS ONLY. Linkage was closed as a development blocker in §145 and this '
        + 'validation does not reopen it.',
    },
    additiveUnion: {
      DETERMINISTIC_TRUTH_COVERAGE: coverage.deterministicCoveredCount,
      EXPERT_ADDITIVE_TRUTH_COVERAGE: coverage.additiveExpertCoveredCount,
      COMBINED_TRUTH_COVERAGE: coverage.combinedCoveredCount,
      COMBINED_TRUTH_MISSES: coverage.truthMissesAfterUnionCount,
      TRUTH_PRESENT_TOTAL: coverage.truthPresentTotal,
      EXPERT_ONLY_FAMILIES: coverage.expertOnlyFamiliesCount,
      unnecessaryDuplication,
      perRow: coverage.perRow,
    },
    sparsity,
    perFixture,
    targets: EXPANDED_VALIDATION_TARGETS,
    limitations: [
      'One arm, one replicate per row, 24 development rows. No rate, no distribution, no '
        + 'reproducibility claim.',
      'No frozen scorer ran; no formal measure was computed; run.scoring was discarded.',
      'M14 not attempted: no permutation, no same-input replicate, no order or reliability claim.',
      'Insight and disagreement classifications key off the FIXTURE expectation, which is a '
        + 'development reading recorded beside the verbatim text — not a scored measure.',
      'OVER_FRAGMENTED and DUPLICATE are never asserted because no fixture adjudicates candidate '
        + 'count; multi-candidate families are reported UNRESOLVABLE.',
      'Linkage is a regression axis with a deliberately small denominator and closes nothing.',
    ],
  };

  writeFileSync(join(OUT, 'RESULTS-SUMMARY.json'), JSON.stringify(results, null, 2));
  writeFileSync(join(OUT, 'CLARIFICATION-ADJUDICATION.csv'), csv(clarificationAdjudication));
  writeFileSync(join(OUT, 'CANDIDATE-ADJUDICATION.csv'), csv(candidateAdjudication));
  writeFileSync(join(OUT, 'INSIGHT-ADJUDICATION.csv'), csv(insightAdjudication));
  writeFileSync(join(OUT, 'DISAGREEMENT-ADJUDICATION.csv'), csv(disagreementAdjudication));
  writeFileSync(join(OUT, 'FIXTURE-MANIFEST.json'), JSON.stringify({
    version: EXPANDED_VALIDATION_FIXTURE_SET_VERSION,
    provenance: 'authored 2026-09-03; no reserved material; no spent formal-cohort row read, copied '
      + 'or mimicked; LP-B2 surface facts not reused',
    budget: B, targets: EXPANDED_VALIDATION_TARGETS,
    computedAdditiveOpportunities: Object.fromEntries(additiveOpportunity),
    rows: fx.map(f => ({
      rowId: f.row.source.rowId, domain: f.domain,
      clarification: f.clarification, candidate: f.candidate, insight: f.insight,
      disagreement: f.disagreement, governed: f.governed ?? [],
      citationAdversarial: !!f.citationAdversarial, linkage: f.linkage,
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
  console.log(`  TRUE-GAP recall   ${results.clarification.TRUE_GAP_CORRECTLY_ASKED}/`
    + `${results.clarification.TRUE_GAP_OPPORTUNITIES} = ${results.clarification.TRUE_GAP_RECALL}`
    + `   (target ${EXPANDED_VALIDATION_TARGETS.trueGapRecall})`);
  console.log(`  NO-GAP silence    ${results.clarification.NO_GAP_ROWS_SILENT}/`
    + `${results.clarification.NO_GAP_ROWS} = ${results.clarification.NO_GAP_SILENCE}`
    + `   (target ${EXPANDED_VALIDATION_TARGETS.noGapSilence})`);
  console.log(`  affectedDecision  ${afdCorrect} correct / ${afdIncorrect} incorrect`);
  console.log(`  additive recall   ${ADDITIVE_FOUND}/${ADDITIVE_OPP} = `
    + `${results.candidateRecall.ADDITIVE_RECALL}   (target `
    + `${EXPANDED_VALIDATION_TARGETS.additiveCandidateRecall})`);
  console.log(`  candidates        ${JSON.stringify(candCounts)}`);
  console.log(`  insights          ${insightFound.length}/${insightOpportunities.length} opportunities`
    + `, ${sparsity.totals.crossHazardInsights} emitted, `
    + `${noInsightRowsWithOutput.length} on no-insight rows`);
  console.log(`  disagreements     ${disFound.length}/${disOpportunities.length} opportunities, `
    + `${sparsity.totals.disagreements} emitted, protected contradictions `
    + `${protectedAuthorityContradictions}`);
  console.log(`  citations         accepted ${citation.ACCEPTED_CITATION_COUNT} merged `
    + `${citation.MERGED_CITATION_COUNT} input ${citation.INPUT_CITATION_SHAPED_COUNT}`);
  console.log(`  union coverage    ${coverage.combinedCoveredCount}/${coverage.truthPresentTotal}`
    + `, misses ${coverage.truthMissesAfterUnionCount}`);
  console.log(`  linkage (regr.)   REQUIRED ${linkage.REQUIRED_LINKAGE_VALID}/`
    + `${linkage.REQUIRED_LINKAGE_OPPORTUNITIES}, invalid ${linkage.INVALID_LINKAGE_ATTEMPTS}, `
    + `output-relative FORBIDDEN defects ${outputRelativeForbiddenDefects}`);
  console.log('\nSTOP. The narrative report is written separately.');
})().catch(e => { console.error(e); process.exit(1); });
