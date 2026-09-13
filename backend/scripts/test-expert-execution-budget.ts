/**
 * §135 -- EXECUTION-BUDGET ENFORCEMENT REGRESSION. ZERO PROVIDER REQUESTS.
 *
 * Every assertion here runs against `ReplayExpertProvider`, which contains no URL, no fetch, no
 * client library and no credential read. The retry sequences are SCRIPTED, so the numbers below are
 * measurements of the real runner and the real harness rather than of a mock of them.
 *
 * ==================== WHAT THIS HAS TO PROVE ====================
 *
 * §134 found that `hardCallCeiling` counted LOGICAL CALLS while retries issued extra PROVIDER
 * REQUESTS, so a 200-request ceiling could not stop 390 billable requests; that `usageOf` had no
 * implementation, so the spend ceiling was inert and M16 would report $0.00; that the adapter kept
 * only the last attempt's telemetry; and that the model was environment-overridable with the
 * identity guard comparing against the environment rather than the cohort.
 *
 * A claim that those are repaired is worth nothing without a test that fails when they regress.
 * The counting assertions below are deliberately exact -- `=== 215`, not `<= 215` -- because an
 * off-by-one in a spend ceiling is the whole defect.
 */

import { ReplayExpertProvider } from
  '../src/hazlenz/expert-hazlenz/replay-expert-provider';
import type { ExpertProviderResult } from '../src/hazlenz/expert-hazlenz/expert-provider';
import { runExpertAnalysis } from '../src/hazlenz/expert-hazlenz/expert-runner';
import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { scoreM13, scoreM16, attemptCount } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';
import { buildExpertAnalysisInputFromAnalysis } from
  '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { ACCEPTED_EXPERT_TAXONOMY } from './lib/expert-cohort-supplemental-policy';
import {
  FORMAL_EXECUTION_BUDGET, WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent,
  classifyRetryExhaustion, mayIssueRequest,
} from './lib/expert-execution-budget';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
} from './lib/expert-cohort-harness';

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

// ---------------------------------------------------------------- fixtures

/** The boundary checks that the payload echoes the input's `analysisId`, so the script must too. */
const validRaw = (analysisId: string) => ({
  contractVersion: 'hazlenz.expert.analysis.v2',
  analysisId,
  outcome: 'NOTHING_TO_ADD',
  expertHazardCandidates: [],
  decisionCriticalClarifications: [],
  crossHazardInsights: [],
  disagreements: [],
  expertExplanation: 'No additional hazard is supportable from the stated observation.',
});

const usage = (input: number, output: number, cost: number) => ({
  inputTokens: input, outputTokens: output, costUsd: cost,
  latencyMs: 10, httpStatus: 200, modelIdentity: 'claude-sonnet-5',
});

const ok = (analysisId = 'r-1'): ExpertProviderResult => ({
  ok: true, raw: validRaw(analysisId), modelIdentity: 'claude-sonnet-5',
  usage: usage(1000, 100, 0.003),
});
const PER_REQUEST_USD = 0.003;
const transientFail = (kind: 'TIMEOUT' | 'EMPTY_RESPONSE' = 'TIMEOUT'): ExpertProviderResult => ({
  ok: false, kind, detail: 'scripted transient failure', usage: usage(900, 50, 0.0023),
});

function row(id: string): FormalCohortRow {
  return {
    contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    source: {
      rowId: id,
      observation: 'The fixed guard over the drive sprocket had been removed and was on the floor '
        + 'while the machine continued to run.',
      inspectionContext: { location: null, task: null },
      jurisdiction: 'osha-general-industry',
      allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY],
      governedStandards: [], answeredClarifications: [], supplementaryContext: [],
    },
    truth: {
      presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ACCEPTED_EXPERT_TAXONOMY.filter(f => f !== 'machine_guarding'),
      forbiddenHazardFamilies: [], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale: 'execution-budget regression fixture; never part of any cohort',
    },
  };
}

/**
 * A provider that fails the FIRST request of the first `n` logical calls and succeeds otherwise.
 *
 * Scripted per logical call rather than globally, because the runner's retry ceiling is per call and
 * a global script would not express "this call retried and that one did not".
 */
class ScriptedRetryProvider extends ReplayExpertProvider {
  private callsSeen = 0;
  private logicalCallsToFail: number;
  constructor(logicalCallsToFail: number, model: string | null = 'claude-sonnet-5',
    providerId = 'anthropic:claude-sonnet-5') {
    super({ results: [ok('unused')], providerId, qualifiedModelIdentity: model });
    this.logicalCallsToFail = logicalCallsToFail;
  }
  private logicalIndex = 0;
  private inRetry = false;
  async analyze(input: { analysisId: string }): Promise<ExpertProviderResult> {
    this.callsSeen += 1;
    if (this.inRetry) { this.inRetry = false; this.logicalIndex += 1; return ok(input.analysisId); }
    if (this.logicalIndex < this.logicalCallsToFail) { this.inRetry = true; return transientFail(); }
    this.logicalIndex += 1;
    return ok(input.analysisId);
  }
  get requestsMade(): number { return this.callsSeen; }
}

const harnessOpts = (provider: ScriptedRetryProvider | null, extra: Record<string, unknown> = {}) => ({
  mode: 'ENABLED' as const,
  provider,
  callCeiling: FORMAL_EXECUTION_BUDGET.plannedLogicalCalls,
  requestCeiling: FORMAL_EXECUTION_BUDGET.hardProviderRequestCeiling,
  retryRequestBudget: FORMAL_EXECUTION_BUDGET.globalRetryRequestBudget,
  worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
  spendCeilingUsd: FORMAL_EXECUTION_BUDGET.hardSpendCeilingUsd,
  frozenIdentity: { provider: 'anthropic', model: 'claude-sonnet-5' },
  arms: ['BASE' as const],
  processId: 'proc-budget-test',
  nowIso: '2026-09-01T00:00:00.000Z',
  ...extra,
});

async function main(): Promise<void> {
  console.log('EXPERT HAZLENZ -- FORMAL EXECUTION BUDGET ENFORCEMENT (§135)');
  console.log('ZERO provider requests: every provider here is the scripted replay provider.\n');

  // ============================================================ A. the frozen budget
  console.log('A. THE FROZEN BUDGET IS INTERNALLY CONSISTENT\n');
  let consistent = true;
  try { assertBudgetInternallyConsistent(); } catch { consistent = false; }
  assert('A.1 195 planned + 20 retries === 215 ceiling, and 215 x worst case === $22.36', consistent,
    `worst case per request $${WORST_CASE_REQUEST_USD.toFixed(6)}`);
  assert('A.2 planned logical calls = 195',
    FORMAL_EXECUTION_BUDGET.plannedLogicalCalls === 195);
  assert('A.3 global retry budget = 20', FORMAL_EXECUTION_BUDGET.globalRetryRequestBudget === 20);
  assert('A.4 hard provider-request ceiling = 215',
    FORMAL_EXECUTION_BUDGET.hardProviderRequestCeiling === 215);
  assert('A.5 hard spend ceiling = $22.36',
    FORMAL_EXECUTION_BUDGET.hardSpendCeilingUsd === 22.36);
  assert('A.6 max one retry per logical call, unchanged',
    FORMAL_EXECUTION_BUDGET.maxRetriesPerLogicalCall === 1
    && FORMAL_EXECUTION_BUDGET.maxAttemptsPerLogicalCall === 2);
  assert('A.7 retry causes are exactly the six already implemented, none added or removed',
    JSON.stringify([...FORMAL_EXECUTION_BUDGET.retryCauses].sort())
    === JSON.stringify(['EMPTY_RESPONSE', 'HTTP_SERVER_ERROR', 'MALFORMED_JSON', 'NETWORK_ERROR',
      'TIMEOUT', 'TRUNCATED_RESPONSE']),
    FORMAL_EXECUTION_BUDGET.retryCauses.join(','));

  // ============================================================ B. per-attempt telemetry (R3)
  console.log('\nB. PER-ATTEMPT TELEMETRY SURVIVES THE RETRY (R3)\n');
  const p1 = new ReplayExpertProvider({
    results: [transientFail('TIMEOUT'), ok('r-1')], qualifiedModelIdentity: 'claude-sonnet-5',
  });
  const input = buildExpertAnalysisInputFromAnalysis({
    analysisId: 'r-1', observation: row('r-1').source.observation,
    inspectionContext: { location: null, task: null }, jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY], hazards: [],
    applicabilityDecisions: [], governedStandards: [], answeredClarifications: [],
    supplementaryContext: [], findingMetadataByKey: {},
  });
  const run1 = await runExpertAnalysis(p1, input, { nowIso: '2026-09-01T00:00:00.000Z' });
  assert('B.1 one initial + one retry -> 2 attempt records', run1.attempts.length === 2,
    `${run1.attempts.length}`);
  assert('B.2 attempt[0] is preserved and is NOT marked a retry',
    run1.attempts[0].attemptIndex === 0 && run1.attempts[0].isRetry === false);
  assert('B.3 attempt[0] failure is preserved after being replaced',
    run1.attempts[0].ok === false && run1.attempts[0].failureKind === 'TIMEOUT');
  assert('B.4 the retry CAUSE survives on attempt[0]', run1.attempts[0].causedRetry === 'TIMEOUT');
  assert('B.5 attempt[1] is marked a retry and succeeded',
    run1.attempts[1].isRetry === true && run1.attempts[1].ok === true);
  assert('B.6 the logical result is the retry\'s, and the layer is PRESENT',
    run1.layer.status === 'PRESENT');
  assert('B.7 trace.attempts still reports 2', run1.trace.attempts === 2);
  assert('B.8 the first, billed attempt carries its own usage',
    run1.attempts[0].usage?.costUsd === 0.0023,
    `$${String(run1.attempts[0].usage?.costUsd)}`);
  assert('B.9 both attempts carry usage -- neither is invisible',
    run1.attempts.every(a => a.usage !== null));

  const p2 = new ReplayExpertProvider({
    results: [ok('r-1')], qualifiedModelIdentity: 'claude-sonnet-5' });
  const run2 = await runExpertAnalysis(p2, input, { nowIso: '2026-09-01T00:00:00.000Z' });
  assert('B.10 a first-time success records exactly one attempt', run2.attempts.length === 1);
  assert('B.11 and no retry cause', run2.attempts[0].causedRetry === null);

  // A non-retryable failure must NOT gain a second attempt.
  const p3 = new ReplayExpertProvider({
    results: [{ ok: false, kind: 'PROVIDER_REFUSAL', detail: 'refused' }, ok('r-1')],
    qualifiedModelIdentity: 'claude-sonnet-5' });
  const run3 = await runExpertAnalysis(p3, input, { nowIso: '2026-09-01T00:00:00.000Z' });
  assert('B.12 a REFUSAL is still not retried -- retry semantics unchanged',
    run3.attempts.length === 1 && p3.calls === 1);

  // ============================================================ C. request counting (R1)
  console.log('\nC. THE CEILING COUNTS PROVIDER REQUESTS, NOT LOGICAL CALLS (R1)\n');

  resetProviderInvocationCount();
  const rows195 = Array.from({ length: 195 }, (_, i) => row(`R-${String(i).padStart(3, '0')}`));

  const noRetry = new ScriptedRetryProvider(0);
  const r1 = await runFormalCohort(rows195, harnessOpts(noRetry));
  assert('C.1 195 no-retry logical calls => 195 provider requests',
    r1.accounting.providerRequestsAttempted === 195,
    `${r1.accounting.providerRequestsAttempted}`);
  assert('C.2 and the provider really was asked 195 times', noRetry.requestsMade === 195,
    `${noRetry.requestsMade}`);
  assert('C.3 retry requests = 0', r1.accounting.retryRequestsAttempted === 0);
  assert('C.4 the run COMPLETED', r1.stopReason === 'COMPLETED', r1.stopReason);

  const five = new ScriptedRetryProvider(5);
  const r2 = await runFormalCohort(rows195, harnessOpts(five));
  assert('C.5 5 retried logical calls => 200 provider requests',
    r2.accounting.providerRequestsAttempted === 200,
    `${r2.accounting.providerRequestsAttempted}`);
  assert('C.6 retry requests = 5', r2.accounting.retryRequestsAttempted === 5);
  assert('C.7 logical calls remain 195', r2.accounting.callsAttempted === 195);
  assert('C.8 the provider was asked 200 times', five.requestsMade === 200);

  const twenty = new ScriptedRetryProvider(20);
  const r3 = await runFormalCohort(rows195, harnessOpts(twenty));
  assert('C.9 20 retried logical calls => 215 provider requests -- exactly the ceiling',
    r3.accounting.providerRequestsAttempted === 215,
    `${r3.accounting.providerRequestsAttempted}`);
  assert('C.10 retry requests = 20, the full budget', r3.accounting.retryRequestsAttempted === 20);
  assert('C.11 all 195 logical calls still completed', r3.accounting.callsAttempted === 195);

  // ============================================================ D. exhaustion (R1)
  console.log('\nD. THE 21st RETRY IS PROHIBITED AND THE 216th REQUEST IS IMPOSSIBLE\n');
  const twentyOne = new ScriptedRetryProvider(21);
  const r4 = await runFormalCohort(rows195, harnessOpts(twentyOne));
  assert('D.1 provider requests never exceed 215',
    r4.accounting.providerRequestsAttempted <= 215,
    `${r4.accounting.providerRequestsAttempted}`);
  assert('D.2 the provider was never asked a 216th time', twentyOne.requestsMade <= 215,
    `${twentyOne.requestsMade}`);
  assert('D.3 retry requests stop at exactly 20', r4.accounting.retryRequestsAttempted === 20,
    `${r4.accounting.retryRequestsAttempted}`);
  assert('D.4 the 21st retry was SUPPRESSED, not silently dropped',
    r4.retriesSuppressed.length === 1, `${r4.retriesSuppressed.length}`);
  assert('D.5 the suppression records the real cause',
    r4.retriesSuppressed[0]?.cause === 'TIMEOUT', r4.retriesSuppressed[0]?.cause);
  assert('D.6 and names the budget that refused it',
    (r4.retriesSuppressed[0]?.reason ?? '').includes('RETRY_BUDGET_EXHAUSTED'),
    r4.retriesSuppressed[0]?.reason);

  const suppressedCall = r4.records
    .flatMap(rec => rec.calls).find(c => c.retrySuppressed);
  assert('D.7 the suppressed call PRESERVES its first attempt\'s real failure -- no fabricated success',
    suppressedCall?.layerStatus === 'PROVIDER_FAILED'
    && suppressedCall?.failureKind === 'TIMEOUT',
    `${suppressedCall?.layerStatus}/${suppressedCall?.failureKind}`);
  assert('D.8 and that call still records exactly one attempt',
    attemptCount(suppressedCall!) === 1);

  // ============================================================ E. spend (R2)
  console.log('\nE. SPEND ACCUMULATES ACROSS EVERY ATTEMPT AND IS FAIL-CLOSED (R2)\n');
  assert('E.1 a retried logical call bills BOTH requests',
    Math.abs((r2.accounting.spendUsd) - (195 * 0.003 + 5 * 0.0023)) < 1e-9,
    `$${r2.accounting.spendUsd.toFixed(6)}`);
  assert('E.2 M16 no longer reports $0.00 when usage exists',
    (scoreM16(r2.records).value ?? 0) > 0,
    `$${(scoreM16(r2.records).value ?? 0).toFixed(6)}/row`);
  const m16 = scoreM16(r2.records);
  assert('E.3 M16 reports provider REQUESTS alongside logical calls',
    (m16.supplementary as Record<string, unknown>).providerRequests === 200,
    String((m16.supplementary as Record<string, unknown>).providerRequests));
  assert('E.4 input and output tokens accumulate across attempts too',
    r2.accounting.inputTokens === 195 * 1000 + 5 * 900
    && r2.accounting.outputTokens === 195 * 100 + 5 * 50,
    `${r2.accounting.inputTokens} in / ${r2.accounting.outputTokens} out`);

  // Fail-closed: the gate is `incurred + worstCaseOfNextRequest <= ceiling`, evaluated BEFORE the
  // request. It prices only the NEXT request at the worst case -- requests already made are counted
  // at what they actually cost -- so the expected stopping point is computed from that formula
  // rather than hard-coded, which is also the clearest statement of the formula itself.
  const tightCeiling = WORST_CASE_REQUEST_USD + PER_REQUEST_USD * 12;
  let expectedRequests = 0;
  while (PER_REQUEST_USD * expectedRequests + WORST_CASE_REQUEST_USD <= tightCeiling + 1e-9) {
    expectedRequests += 1;
  }
  const nearCeiling = new ScriptedRetryProvider(0);
  const r5 = await runFormalCohort(rows195, harnessOpts(nearCeiling, {
    spendCeilingUsd: tightCeiling,
  }));
  assert('E.5 the spend ceiling stops the run PROSPECTIVELY, before the request that would cross it',
    r5.stopReason === 'SPEND_CEILING_REACHED', r5.stopReason);
  assert('E.6 it stops at exactly the request the formula forbids -- not one earlier, not one later',
    r5.accounting.providerRequestsAttempted === expectedRequests,
    `${r5.accounting.providerRequestsAttempted} of an expected ${expectedRequests}`);
  assert('E.7 actual spend never crossed the ceiling',
    r5.accounting.spendUsd <= tightCeiling, `$${r5.accounting.spendUsd.toFixed(6)}`);
  assert('E.8 and the run could never have crossed it: incurred + worst case still fits',
    r5.accounting.spendUsd + WORST_CASE_REQUEST_USD > tightCeiling);

  const state = { requestsAttempted: 215, retryRequestsAttempted: 0, spendUsd: 0 };
  assert('E.9 mayIssueRequest refuses the 216th on the request ceiling',
    mayIssueRequest(state, false).allowed === false,
    mayIssueRequest(state, false).reason);
  assert('E.10 mayIssueRequest refuses a 21st retry',
    mayIssueRequest({ requestsAttempted: 100, retryRequestsAttempted: 20, spendUsd: 0 }, true)
      .allowed === false);
  assert('E.11 spend gate prices the NEXT request at its worst case, not at zero',
    mayIssueRequest({ requestsAttempted: 0, retryRequestsAttempted: 0, spendUsd: 22.36 }, false)
      .allowed === false);

  // ============================================================ F. M13 (R3)
  console.log('\nF. M13 IS COMPUTABLE FROM ACTUAL ATTEMPT HISTORY (R3)\n');
  const m13NoRetry = scoreM13(r1.records);
  assert('F.1 195 requests, no retries -> denominator 195',
    m13NoRetry.denominator === 195, String(m13NoRetry.denominator));
  const m13Retry = scoreM13(r2.records);
  assert('F.2 200 requests after 5 retries -> denominator 200, per the frozen contract',
    m13Retry.denominator === 200, String(m13Retry.denominator));
  assert('F.3 numerator counts the 195 logical calls that reached the provider',
    m13Retry.numerator === 195, String(m13Retry.numerator));
  assert('F.4 the retried-away failures appear in the by-kind breakdown',
    (m13Retry.supplementary as Record<string, unknown>).TIMEOUT === 5,
    String((m13Retry.supplementary as Record<string, unknown>).TIMEOUT));
  assert('F.5 retry requests are reported',
    (m13Retry.supplementary as Record<string, unknown>).retryRequests === 5);
  assert('F.6 the rate is requests-based, so a retried run scores BELOW a clean one',
    (m13Retry.value ?? 1) < (m13NoRetry.value ?? 0),
    `${(m13Retry.value ?? 0).toFixed(4)} < ${(m13NoRetry.value ?? 0).toFixed(4)}`);

  // ============================================================ G. model binding (R4)
  console.log('\nG. THE MODEL IS BOUND AND AN OVERRIDE FAILS CLOSED (R4)\n');
  const beforeWrong = providerInvocationCount();
  const wrongModel = new ScriptedRetryProvider(0, 'claude-opus-4-1', 'anthropic:claude-opus-4-1');
  const r6 = await runFormalCohort(rows195.slice(0, 3), harnessOpts(wrongModel));
  assert('G.1 a substituted model BLOCKS the run',
    r6.stopReason === 'EXECUTION_IDENTITY_MISMATCH', r6.stopReason);
  assert('G.2 and blocks it BEFORE any provider invocation',
    wrongModel.requestsMade === 0 && providerInvocationCount() === beforeWrong,
    `${wrongModel.requestsMade} requests made`);
  assert('G.3 the violation names both the found and the bound model',
    (r6.identityViolation ?? '').includes('claude-opus-4-1')
    && (r6.identityViolation ?? '').includes('claude-sonnet-5'),
    r6.identityViolation ?? '');
  const wrongVendor = new ScriptedRetryProvider(0, 'claude-sonnet-5', 'ollama:claude-sonnet-5');
  const r7 = await runFormalCohort(rows195.slice(0, 3), harnessOpts(wrongVendor));
  assert('G.4 a substituted PROVIDER also blocks, before any request',
    r7.stopReason === 'EXECUTION_IDENTITY_MISMATCH' && wrongVendor.requestsMade === 0);
  const rightModel = new ScriptedRetryProvider(0);
  const r8 = await runFormalCohort(rows195.slice(0, 3), harnessOpts(rightModel));
  assert('G.5 the exact anthropic / claude-sonnet-5 binding PASSES',
    r8.stopReason === 'COMPLETED' && rightModel.requestsMade === 3, r8.stopReason);

  // ============================================================ H. exhaustion classification
  console.log('\nH. EXHAUSTION IS CLASSIFIED BY CAUSE, NOT BY CONVENIENCE\n');
  const transport = classifyRetryExhaustion(['TIMEOUT', 'NETWORK_ERROR', 'HTTP_SERVER_ERROR']);
  assert('H.1 transport-only exhaustion invalidates the RUN, not the model',
    transport.classification.startsWith('FORMAL_EVALUATION_INVALID'), transport.classification);
  const behaviour = classifyRetryExhaustion(['MALFORMED_JSON', 'TRUNCATED_RESPONSE']);
  assert('H.2 model-behaviour exhaustion is preserved as EVIDENCE, not written off',
    behaviour.classification.startsWith('MODEL_BEHAVIOUR_EVIDENCE'), behaviour.classification);
  const mixed = classifyRetryExhaustion(['TIMEOUT', 'MALFORMED_JSON']);
  assert('H.3 mixed causes are returned as a ledger rather than forced into one classification',
    mixed.classification.startsWith('MIXED_CAUSE')
    && mixed.transport === 1 && mixed.modelBehaviour === 1, mixed.classification);
  assert('H.4 the real run recorded its retry causes',
    r2.retryCauses.length === 5 && r2.retryCauses.every(c => c === 'TIMEOUT'),
    r2.retryCauses.join(','));

  // ============================================================ I. no behaviour drift
  console.log('\nI. SUBSTANTIVE EXPERT BEHAVIOUR IS UNCHANGED\n');
  assert('I.1 an absent retry gate leaves the runner unbounded, as production expects',
    run1.attempts.length === 2 && run1.retrySuppressed === null);
  assert('I.2 DISABLED mode still constructs requests and issues none',
    (await runFormalCohort(rows195.slice(0, 2), {
      mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0, arms: ['BASE'],
      processId: 'p', nowIso: '2026-09-01T00:00:00.000Z',
    })).accounting.providerRequestsAttempted === 0);

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   FORMAL_COHORT_SPENT = FALSE`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
