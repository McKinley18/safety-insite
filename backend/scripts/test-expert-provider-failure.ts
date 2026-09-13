/**
 * EXPERT HAZLENZ -- provider failure semantics.
 *
 * PURE. Every "provider" here is `ReplayExpertProvider`, which returns a literal written in this
 * file. No socket is opened. `PROVIDER_CALLS = 0`.
 *
 * THE CONTRACT UNDER TEST, both halves:
 *
 *      FAIL OPEN for availability   -- the inspection continues, deterministic HazLenz is intact,
 *                                      governed standards are intact, the customer is not blocked.
 *      FAIL CLOSED for authority    -- nothing is synthesized, nothing stale is substituted, no
 *                                      lexical result is relabelled as Expert, the failure is
 *                                      observable.
 *
 * Every one of the fourteen failure kinds is exercised, INCLUDING `PROVIDER_NOT_CALLABLE`, which
 * exists because the L3 provider-readiness gate recorded exactly that outcome with credentials
 * provisioned and a shim written.
 *
 * Run: npx ts-node scripts/test-expert-provider-failure.ts
 */
import {
  EXPERT_PROVIDER_FAILURES, RETRYABLE_EXPERT_FAILURES, UnavailableExpertProvider,
  isRetryableExpertFailure,
  type ExpertProviderFailureKind, type ExpertProviderResult,
} from '../src/hazlenz/expert-hazlenz/expert-provider';
import { ReplayExpertProvider } from '../src/hazlenz/expert-hazlenz/replay-expert-provider';
import { runExpertAnalysis } from '../src/hazlenz/expert-hazlenz/expert-runner';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
  type DeterministicAuthorityResult, type GovernedAuthorityResult,
} from '../src/hazlenz/expert-hazlenz/expert-authority-merge';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

const NOW = '2026-08-29T00:00:00.000Z';
const OBS = 'A worker entered the digester with no attendant and no atmospheric test.';

const INPUT: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'a-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'digester deck', task: 'entry' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['confined_space'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

/** A life-critical finding, so every failure is measured against the worst thing to lose. */
const DETERMINISTIC: DeterministicAuthorityResult = {
  analysisId: 'a-1', jurisdiction: 'osha-general-industry',
  findings: [{
    findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
    isLifeCritical: true, isActionable: true,
    requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant'],
  }],
};
const GOVERNED: GovernedAuthorityResult = {
  knowledgeReleaseId: 'federal-core-2026-08-28.1',
  citations: [{
    findingKey: 'f1', citation: 'REC-1', backingState: 'APPROVED_EXACT',
    governedProvenanceEligible: true, isApproved: true,
  }],
};

const GOOD_ANALYSIS = {
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  analysisId: 'a-1',
  outcome: 'ANALYZED',
  expertHazardCandidates: [],
  decisionCriticalClarifications: [{
    clarificationId: 'c1', question: 'Was the space tested before entry?',
    whyItMatters: 'entry to an untested space is a different finding',
    affectedDecision: 'HAZARD_EXISTENCE', criticality: 'BLOCKING',
    evidenceGap: 'no atmospheric result is recorded',
  }],
  crossHazardInsights: [],
  disagreements: [],
  expertExplanation: null,
  uncertainty: { statements: [] },
};

const fail = (kind: ExpertProviderFailureKind, detail: string = kind, httpStatus?: number): ExpertProviderResult =>
  ({ ok: false, kind, detail, httpStatus });

/** The protected halves of a merge. Two merges are equivalent when this string matches. */
const protectedShape = (m: ReturnType<typeof mergeExpertIntelligence>) =>
  JSON.stringify({ a: m.authoritative, g: m.governed, j: m.jurisdiction });

const BASELINE = protectedShape(mergeExpertIntelligence(
  DETERMINISTIC, GOVERNED, { status: 'NOT_CONFIGURED', validated: null, detail: null }));

(async function main() {
  // =====================================================================================
  section('A. the taxonomy');
  // =====================================================================================

  assert(EXPERT_PROVIDER_FAILURES.length === 14, 'A.1 fourteen provider failure kinds declared');
  for (const required of ['TIMEOUT', 'NETWORK_ERROR', 'HTTP_CLIENT_ERROR', 'HTTP_SERVER_ERROR',
                          'RATE_LIMITED', 'CREDITS_EXHAUSTED', 'MALFORMED_JSON',
                          'SCHEMA_INVALID_STRUCTURED_OUTPUT', 'EMPTY_RESPONSE', 'TRUNCATED_RESPONSE',
                          'PROVIDER_REFUSAL', 'UNEXPECTED_MODEL_IDENTITY'] as const) {
    assert((EXPERT_PROVIDER_FAILURES as readonly string[]).includes(required),
      `A.2 ${required} is a declared failure kind`);
  }
  assert((EXPERT_PROVIDER_FAILURES as readonly string[]).includes('PROVIDER_NOT_CALLABLE'),
    'A.3 PROVIDER_NOT_CALLABLE is declared -- the L3 readiness-gate failure, remembered');

  assert(!isRetryableExpertFailure('PROVIDER_REFUSAL'),
    'A.4 a refusal is not retried -- it is a decision, not an accident');
  assert(!isRetryableExpertFailure('CREDITS_EXHAUSTED') && !isRetryableExpertFailure('PROVIDER_NOT_CALLABLE'),
    'A.5 configuration facts are not retried');
  assert(isRetryableExpertFailure('TIMEOUT') && isRetryableExpertFailure('TRUNCATED_RESPONSE'),
    'A.6 transport accidents are retried');
  assert(RETRYABLE_EXPERT_FAILURES.every(k => (EXPERT_PROVIDER_FAILURES as readonly string[]).includes(k)),
    'A.7 the retryable set is a subset of the taxonomy');

  // =====================================================================================
  section('B. every failure kind, through the real runner and the real merge');
  // =====================================================================================

  for (const kind of EXPERT_PROVIDER_FAILURES) {
    const provider = new ReplayExpertProvider({ results: [fail(kind)] });
    const run = await runExpertAnalysis(provider, INPUT, { nowIso: NOW });

    // FAIL CLOSED: nothing synthesized.
    assert(run.layer.validated === null, `B.1 ${kind}: no Expert analysis is synthesized`);
    assert(run.failure?.kind === kind, `B.2 ${kind}: the failure kind is preserved for the operator`);
    assert(run.layer.detail !== null && run.layer.detail.includes(kind),
      `B.3 ${kind}: the failure is observable in the merged layer detail`);

    // FAIL OPEN: the inspection is untouched.
    const merged = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, run.layer);
    assert(protectedShape(merged) === BASELINE,
      `B.4 ${kind}: the protected halves are identical to the no-Expert merge`);
    assert(verifyMergeInvariants(merged, DETERMINISTIC, GOVERNED).length === 0,
      `B.5 ${kind}: no merge invariant is violated`);
    assert(merged.expertAdvisory.hazardCandidates.length === 0
        && merged.expertAdvisory.clarifications.length === 0
        && merged.expertAdvisory.disagreements.length === 0,
      `B.6 ${kind}: the advisory block is empty rather than partially filled`);

    // The retry ceiling is one extra attempt, and only for retryable kinds.
    const expectedCalls = isRetryableExpertFailure(kind) ? 2 : 1;
    assert(provider.calls === expectedCalls,
      `B.7 ${kind}: ${expectedCalls} attempt(s) made (ceiling respected)`);
  }

  // =====================================================================================
  section('C. the shapes a taxonomy entry alone does not cover');
  // =====================================================================================

  // C.1 a provider that THROWS rather than returning a failure object.
  const thrower = new ReplayExpertProvider({ results: [], throwOnCall: new Error('socket hang up') });
  const thrown = await runExpertAnalysis(thrower, INPUT, { nowIso: NOW });
  assert(thrown.failure?.kind === 'NETWORK_ERROR' && thrown.layer.validated === null,
    'C.1 a thrown transport error is caught and classified, never propagated');

  const abort = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
  const aborted = await runExpertAnalysis(
    new ReplayExpertProvider({ results: [], throwOnCall: abort }), INPUT, { nowIso: NOW });
  assert(aborted.failure?.kind === 'TIMEOUT',
    'C.2 an abort is classified as TIMEOUT rather than as a network error');

  // C.3 the runner never throws. If it did, an Expert outage would become an inspection outage.
  let threw = false;
  try {
    await runExpertAnalysis(
      new ReplayExpertProvider({ results: [], throwOnCall: new Error('boom') }), INPUT, { nowIso: NOW });
  } catch { threw = true; }
  assert(!threw, 'C.3 runExpertAnalysis does not throw, ever');

  // C.4 an unexpected model identity is refused BEFORE the boundary, not scored as the qualified one.
  const wrongModel = new ReplayExpertProvider({
    qualifiedModelIdentity: 'model-A',
    results: [{ ok: true, raw: GOOD_ANALYSIS, modelIdentity: 'model-B' }],
  });
  const wrongModelRun = await runExpertAnalysis(wrongModel, INPUT, { nowIso: NOW });
  assert(wrongModelRun.failure?.kind === 'UNEXPECTED_MODEL_IDENTITY'
      && wrongModelRun.layer.validated === null,
    'C.4 a response from an unqualified model is refused, not scored');
  assert(wrongModelRun.trace.providerModelIdentity === 'model-B',
    'C.5 the identity that actually answered is recorded');

  // C.6 schema-invalid structured output reaches the boundary and is REJECTED, not retried.
  const schemaInvalid = new ReplayExpertProvider({
    results: [{ ok: true, raw: { ...GOOD_ANALYSIS, outcome: 'MAYBE' }, modelIdentity: null }],
  });
  const rejectedRun = await runExpertAnalysis(schemaInvalid, INPUT, { nowIso: NOW });
  assert(rejectedRun.layer.status === 'OUTPUT_REJECTED' && rejectedRun.layer.validated === null,
    'C.6 schema-invalid structured output produces OUTPUT_REJECTED');
  assert(schemaInvalid.calls === 1,
    'C.7 a rejected output is NOT retried -- a validator must not be talked out of a refusal');
  assert(rejectedRun.issues.some(i => i.code === 'INVALID_OUTCOME'),
    'C.8 the rejection carries its reason code');

  // C.9 a retryable failure followed by a success does recover, within the ceiling.
  const recovering = new ReplayExpertProvider({
    results: [fail('HTTP_SERVER_ERROR', '503'), { ok: true, raw: GOOD_ANALYSIS, modelIdentity: null }],
  });
  const recovered = await runExpertAnalysis(recovering, INPUT, { nowIso: NOW });
  assert(recovered.layer.status === 'PRESENT' && recovering.calls === 2,
    'C.9 one retryable failure then success recovers in two attempts');
  assert(recovered.layer.validated?.analysis.decisionCriticalClarifications.length === 1,
    'C.10 the recovered analysis carries its clarification');

  // C.11 the only provider that exists at this phase performs no inference.
  const none = await runExpertAnalysis(new UnavailableExpertProvider(), INPUT, { nowIso: NOW });
  assert(none.layer.status === 'NOT_CONFIGURED' && none.layer.validated === null,
    'C.11 UnavailableExpertProvider reports NOT_CONFIGURED and synthesizes nothing');

  // =====================================================================================
  section('D. no stale substitution');
  // =====================================================================================

  // A success followed by a failure must produce a failure. If any cache existed, the second run
  // would return the first run's analysis -- which is the precise thing the authorization forbids
  // until an explicit cache contract exists.
  const okThenFail = new ReplayExpertProvider({
    results: [{ ok: true, raw: GOOD_ANALYSIS, modelIdentity: null }, fail('PROVIDER_REFUSAL')],
  });
  const first = await runExpertAnalysis(okThenFail, INPUT, { nowIso: NOW });
  const second = await runExpertAnalysis(okThenFail, INPUT, { nowIso: NOW });
  assert(first.layer.status === 'PRESENT', 'D.1 the first run succeeds');
  assert(second.layer.status === 'PROVIDER_FAILED' && second.layer.validated === null,
    'D.2 the second run FAILS -- no stale response is substituted');

  // And the merged customer-facing result is honest about it both times.
  const mergedSecond = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, second.layer);
  assert(mergedSecond.expertAdvisory.clarifications.length === 0
      && mergedSecond.expertLayer.status === 'PROVIDER_FAILED',
    'D.3 the merged result carries no leftover clarification and says the layer failed');

  // =====================================================================================
  section('E. determinism of a replay');
  // =====================================================================================

  const a = await runExpertAnalysis(
    new ReplayExpertProvider({ results: [{ ok: true, raw: GOOD_ANALYSIS, modelIdentity: null }] }),
    INPUT, { nowIso: NOW });
  const b = await runExpertAnalysis(
    new ReplayExpertProvider({ results: [{ ok: true, raw: GOOD_ANALYSIS, modelIdentity: null }] }),
    INPUT, { nowIso: NOW });
  assert(JSON.stringify(a.layer.validated) === JSON.stringify(b.layer.validated),
    'E.1 two identical replays produce byte-identical validated objects');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
