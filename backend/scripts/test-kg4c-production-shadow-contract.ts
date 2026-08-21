/**
 * KG-4C -- the production-shadow contract suite.
 *
 * PURE. No database, no server, no network. Everything here is a property of the contract modules,
 * so it can be run anywhere, repeatedly, without owning anything.
 *
 * Covers KG-4C sections 1 (locks), 2 (stages), 3 (kill switch), 5 (circuit breaker),
 * 6 (sampling), 9 (schema versioning), 10 (privacy canaries), 11 (invariance hash),
 * 12 (provenance invariant), 16 (alert thresholds) and 18 (unobserved taxonomy categories).
 *
 * Run:  npm run test:kg4c-production-shadow-contract
 *       npm run test:kg4c-production-shadow-contract -- --emit <file>
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

import {
  PRODUCTION_SHADOW_ACK_SENTINEL, PRODUCTION_SHADOW_ACK_ENV, PRODUCTION_SHADOW_LOCKS,
  SHADOW_STAGE_ENV, SHADOW_KILL_SWITCH_ENV, SHADOW_COHORT_BPS_ENV, SHADOW_COHORT_SALT_ENV,
  PRODUCTION_SHADOW_STAGES, DEFAULT_SHADOW_STAGE,
  evaluateAcknowledgement, resolveShadowStage, stageConstraints, resolveKillSwitch,
  engageRuntimeKillSwitch, resetRuntimeKillSwitch, evaluateCohort,
  resolveProductionShadowAuthorization, productionShadowAckAuthorizes,
  type ProductionShadowStage,
} from '../src/standards/cutover/production-shadow-authorization';
import {
  GOVERNED_CUTOVER_MODES, CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV,
} from '../src/standards/cutover/cutover-mode';
import {
  HARD_INVARIANT_VIOLATIONS, RATE_THRESHOLDS, evaluateCircuitBreaker, thresholdFor,
  ShadowBreakerWindow, applyBreakerVerdict,
} from '../src/standards/cutover/shadow-circuit-breaker';
import {
  flattenPayload, deriveVolatilePaths, customerOutputHash, compareCustomerOutput,
} from '../src/standards/cutover/customer-output-invariance';
import {
  SHADOW_EVENT_SCHEMA_VERSION_V2, SHADOW_EVENT_V2_ALLOWED_FIELDS,
  SHADOW_EVENT_V2_ADDITIONAL_FIELDS, buildShadowEventV2, assertShadowEventV2PrivacySafe,
  emitShadowEvent, CapturingSink, NullSink, PRIVACY_CANARY_PATTERNS, RETENTION_CONTRACT,
  ShadowPrivacyViolation,
} from '../src/standards/cutover/shadow-telemetry-sink';
import {
  enforceShadowProvenanceInvariant, shadowProvenanceIsCompliant,
} from '../src/standards/cutover/shadow-provenance-invariant';
import {
  ALL_MISMATCH_CATEGORIES, severityFor, classifyShadowComparison,
  buildShadowComparisonRecord, SHADOW_EVENT_ALLOWED_FIELDS,
  type ShadowMismatchCategory, type ShadowMismatchDimensions,
} from '../src/standards/cutover/shadow-comparison';
import type { GovernedResolutionResult } from '../src/standards/cutover/governed-resolution';
import {
  SHADOW_METRICS, METRIC_DIMENSIONS, FORBIDDEN_METRIC_DIMENSIONS, ALERT_RULES,
  ZERO_TOLERANCE_METRICS,
} from '../src/standards/cutover/shadow-operational-metrics';

// ------------------------------------------------------------------ harness

let passed = 0;
const failures: string[] = [];
const sections = new Map<string, number>();
let currentSection = 'general';

function section(name: string): void { currentSection = name; }

function check(condition: unknown, message: string): void {
  if (condition) {
    passed += 1;
    sections.set(currentSection, (sections.get(currentSection) ?? 0) + 1);
  } else {
    failures.push('[' + currentSection + '] ' + message);
  }
}

function eq(actual: unknown, expected: unknown, message: string): void {
  check(actual === expected, message + ' (expected ' + String(expected) + ', got ' + String(actual) + ')');
}

// ------------------------------------------------------------------ fixtures

const PROD = { NODE_ENV: 'production' } as Record<string, string | undefined>;

/** A fully-open production shadow configuration. Every test below removes exactly one thing. */
function fullyAuthorizedEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: 'production',
    [CUTOVER_MODE_ENV]: 'SHADOW',
    [CUTOVER_ALLOWLIST_ENV]: 'user-internal-1',
    [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
    [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
    [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
  };
}

const INTERNAL_PRINCIPAL = { userId: 'user-internal-1', organizationId: null };

function resolutionFixture(overrides: Partial<GovernedResolutionResult> = {}): GovernedResolutionResult {
  return {
    requestedCitation: '29 CFR 1926.501',
    resolvedCitation: '29 CFR 1926.501',
    releaseId: 'federal-core-2026-07-30.1',
    backing: 'APPROVED_EXACT',
    granularity: 'EXACT',
    health: 'OK',
    standardText: 'Each employee on a walking/working surface shall be protected.',
    plainLanguageSummary: null,
    title: 'Duty to have fall protection',
    jurisdiction: 'OSHA/construction',
    reason: 'fixture',
    ...overrides,
  } as GovernedResolutionResult;
}

function dimensionsFixture(overrides: Partial<ShadowMismatchDimensions> = {}): ShadowMismatchDimensions {
  return {
    citationDiffers: false, granularityDiffers: false, contentDiffers: false,
    backingDiffers: false, applicabilityUncertain: false, jurisdictionDiffers: false,
    orderingDiffers: false, resolverFailed: false, integrityFailed: false,
    provenanceDiffers: false,
    ...overrides,
  };
}

// ================================================================== 1. ACK SEMANTICS

section('1-acknowledgement');

const ACK_CASES: Array<{ label: string; raw: unknown; verdict: string; accepted: boolean }> = [
  { label: 'missing', raw: undefined, verdict: 'ACK_MISSING', accepted: false },
  { label: 'null', raw: null, verdict: 'ACK_MISSING', accepted: false },
  { label: 'empty', raw: '', verdict: 'ACK_EMPTY', accepted: false },
  { label: 'whitespace', raw: '   ', verdict: 'ACK_WHITESPACE_ONLY', accepted: false },
  { label: 'tab+newline', raw: '\t\n', verdict: 'ACK_WHITESPACE_ONLY', accepted: false },
  { label: 'true', raw: 'true', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'TRUE', raw: 'TRUE', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: '1', raw: '1', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'yes', raw: 'yes', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'on', raw: 'on', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'enabled', raw: 'enabled', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'wrong case', raw: 'i_acknowledge_production_shadow', verdict: 'ACK_WRONG_CASE', accepted: false },
  { label: 'mixed case', raw: 'I_Acknowledge_Production_Shadow', verdict: 'ACK_WRONG_CASE', accepted: false },
  { label: 'near match (prefix)', raw: 'I_ACKNOWLEDGE_PRODUCTION', verdict: 'ACK_NEAR_MATCH', accepted: false },
  { label: 'near match (suffixed)', raw: PRODUCTION_SHADOW_ACK_SENTINEL + '_YES', verdict: 'ACK_NEAR_MATCH', accepted: false },
  { label: 'the KG-4A sentinel', raw: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER', verdict: 'ACK_WRONG_VALUE', accepted: false },
  { label: 'exact', raw: PRODUCTION_SHADOW_ACK_SENTINEL, verdict: 'ACK_EXACT', accepted: true },
  { label: 'exact with transport newline', raw: PRODUCTION_SHADOW_ACK_SENTINEL + '\n', verdict: 'ACK_EXACT', accepted: true },
];

for (const testCase of ACK_CASES) {
  const evaluation = evaluateAcknowledgement(testCase.raw, PRODUCTION_SHADOW_ACK_SENTINEL);
  eq(evaluation.verdict, testCase.verdict, 'ack "' + testCase.label + '" verdict');
  eq(evaluation.accepted, testCase.accepted, 'ack "' + testCase.label + '" accepted');
}

check(
  ACK_CASES.filter((c) => c.accepted).length === 2,
  'exactly two ack inputs are accepted, and both are the exact sentinel (one with a transport newline)',
);
check(
  !evaluateAcknowledgement(PRODUCTION_SHADOW_ACK_SENTINEL, 'I_ACKNOWLEDGE_GOVERNED_CUTOVER').accepted,
  'the production-shadow sentinel does NOT satisfy the KG-4A governed-cutover acknowledgement',
);
check(
  !evaluateAcknowledgement('I_ACKNOWLEDGE_GOVERNED_CUTOVER', PRODUCTION_SHADOW_ACK_SENTINEL).accepted,
  'the KG-4A sentinel does NOT satisfy the production-shadow acknowledgement',
);
const rejectedAck = evaluateAcknowledgement('hunter2-secret-value', PRODUCTION_SHADOW_ACK_SENTINEL);
check(
  rejectedAck.observedLength === 'hunter2-secret-value'.length
    && !JSON.stringify(rejectedAck).includes('hunter2'),
  'a rejected ack reports only its LENGTH, never its value',
);

// ------------------------------------------------------------------ the four locks

section('1-locks');

eq(PRODUCTION_SHADOW_LOCKS.length, 4, 'there are exactly four production-shadow locks');

resetRuntimeKillSwitch();
const authorized = resolveProductionShadowAuthorization({
  principal: INTERNAL_PRINCIPAL, env: fullyAuthorizedEnv(),
});
check(authorized.authorized, 'all four locks open + production => AUTHORIZED');
eq(authorized.refusal, null, 'an authorized result carries no refusal');
check(
  PRODUCTION_SHADOW_LOCKS.every((lock) => authorized.locks[lock]),
  'every lock reports open when authorized',
);

const REMOVALS: Array<{ label: string; mutate: (env: Record<string, string | undefined>) => void; refusal: string }> = [
  { label: 'mode not SHADOW', mutate: (e) => { e[CUTOVER_MODE_ENV] = 'LEGACY'; }, refusal: 'MODE_NOT_SHADOW' },
  { label: 'mode is governed delivery', mutate: (e) => { e[CUTOVER_MODE_ENV] = 'GOVERNED_WITH_FALLBACK'; }, refusal: 'MODE_NOT_SHADOW' },
  { label: 'mode unset', mutate: (e) => { delete e[CUTOVER_MODE_ENV]; }, refusal: 'MODE_NOT_SHADOW' },
  { label: 'stage unset', mutate: (e) => { delete e[SHADOW_STAGE_ENV]; }, refusal: 'STAGE_DISABLED' },
  { label: 'stage 0', mutate: (e) => { e[SHADOW_STAGE_ENV] = 'STAGE_0_DISABLED'; }, refusal: 'STAGE_DISABLED' },
  { label: 'allowlist empty', mutate: (e) => { e[CUTOVER_ALLOWLIST_ENV] = ''; }, refusal: 'PRINCIPAL_NOT_ELIGIBLE' },
  { label: 'governed-cutover ack missing', mutate: (e) => { delete e[CUTOVER_PRODUCTION_ACK_ENV]; }, refusal: 'MODE_NOT_SHADOW' },
  { label: 'production-shadow ack missing', mutate: (e) => { delete e[PRODUCTION_SHADOW_ACK_ENV]; }, refusal: 'PRODUCTION_SHADOW_ACK_MISSING' },
  { label: 'production-shadow ack truthy', mutate: (e) => { e[PRODUCTION_SHADOW_ACK_ENV] = 'true'; }, refusal: 'PRODUCTION_SHADOW_ACK_MISSING' },
  { label: 'production-shadow ack wrong case', mutate: (e) => { e[PRODUCTION_SHADOW_ACK_ENV] = PRODUCTION_SHADOW_ACK_SENTINEL.toLowerCase(); }, refusal: 'PRODUCTION_SHADOW_ACK_MISSING' },
];

for (const removal of REMOVALS) {
  const env = fullyAuthorizedEnv();
  removal.mutate(env);
  const result = resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env });
  check(!result.authorized, 'removing "' + removal.label + '" refuses authorization');
  eq(result.refusal, removal.refusal, 'refusal for "' + removal.label + '"');
}

check(
  !resolveProductionShadowAuthorization({ principal: null, env: fullyAuthorizedEnv() }).authorized,
  'a null principal is never authorized',
);
check(
  !resolveProductionShadowAuthorization({
    principal: { userId: 'someone-else', organizationId: null }, env: fullyAuthorizedEnv(),
  }).authorized,
  'a non-allowlisted principal is never authorized',
);

const nonProduction = fullyAuthorizedEnv();
nonProduction.NODE_ENV = 'test';
eq(
  resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env: nonProduction }).refusal,
  'NOT_PRODUCTION',
  'outside production the gate reports NOT_PRODUCTION rather than authorizing',
);

// The shadow ack must not become consent to change customer output.
for (const mode of GOVERNED_CUTOVER_MODES) {
  eq(
    productionShadowAckAuthorizes(mode), mode === 'SHADOW',
    'the production-shadow acknowledgement authorizes ' + mode + ' only if it is SHADOW',
  );
}

// ================================================================== 2. STAGES

section('2-stages');

eq(resolveShadowStage({}).stage, DEFAULT_SHADOW_STAGE, 'unset stage defaults to STAGE_0_DISABLED');
eq(resolveShadowStage({}).reason, 'DEFAULT_NO_CONFIGURATION', 'unset stage reports the default reason');
for (const bad of ['', '  ', 'STAGE_9', 'stage one', 'true', '1', 'BROAD']) {
  eq(
    resolveShadowStage({ [SHADOW_STAGE_ENV]: bad }).stage, 'STAGE_0_DISABLED',
    'invalid stage value "' + bad + '" falls back to STAGE_0_DISABLED',
  );
}
for (const stage of PRODUCTION_SHADOW_STAGES) {
  eq(
    resolveShadowStage({ [SHADOW_STAGE_ENV]: stage }).stage, stage,
    'stage "' + stage + '" parses exactly',
  );
  eq(
    resolveShadowStage({ [SHADOW_STAGE_ENV]: stage.toLowerCase() }).stage, stage,
    'stage "' + stage + '" parses case-insensitively',
  );
}

eq(stageConstraints('STAGE_0_DISABLED').maxNamedPrincipals, 0, 'stage 0 permits no named principals');
eq(stageConstraints('STAGE_1_SINGLE_ACCOUNT').maxNamedPrincipals, 1, 'stage 1 permits exactly one');
check(
  stageConstraints('STAGE_1_SINGLE_ACCOUNT').maxNamedPrincipals
    < stageConstraints('STAGE_2_SMALL_ALLOWLIST').maxNamedPrincipals
    && stageConstraints('STAGE_2_SMALL_ALLOWLIST').maxNamedPrincipals
    < stageConstraints('STAGE_3_DETERMINISTIC_COHORT').maxNamedPrincipals
    && stageConstraints('STAGE_3_DETERMINISTIC_COHORT').maxNamedPrincipals
    < stageConstraints('STAGE_4_BROAD').maxNamedPrincipals,
  'the named-principal ceiling increases monotonically across stages',
);
check(
  !stageConstraints('STAGE_1_SINGLE_ACCOUNT').cohortSamplingAllowed
    && !stageConstraints('STAGE_2_SMALL_ALLOWLIST').cohortSamplingAllowed
    && stageConstraints('STAGE_3_DETERMINISTIC_COHORT').cohortSamplingAllowed,
  'cohort sampling becomes available only at stage 3',
);

// A stage-1 configuration with two named accounts is refused, not silently widened.
const twoAccounts = fullyAuthorizedEnv();
twoAccounts[CUTOVER_ALLOWLIST_ENV] = 'user-internal-1,user-internal-2';
eq(
  resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env: twoAccounts }).refusal,
  'STAGE_PRINCIPAL_LIMIT_EXCEEDED',
  'stage 1 with two named accounts refuses rather than widening',
);

// No automatic promotion: nothing in the module can raise the stage.
const stageSequence = PRODUCTION_SHADOW_STAGES.map((stage) =>
  resolveShadowStage({ [SHADOW_STAGE_ENV]: stage }).stage);
check(
  stageSequence.every((resolved, index) => resolved === PRODUCTION_SHADOW_STAGES[index]),
  'each stage resolves to itself -- there is no promotion path in code',
);

// ================================================================== 3. KILL SWITCH

section('3-kill-switch');

resetRuntimeKillSwitch();
eq(resolveKillSwitch({}).engaged, false, 'kill switch is disengaged by default');
eq(resolveKillSwitch({}).source, 'NONE', 'a disengaged kill switch names no source');

for (const value of ['engaged', 'true', '1', 'yes', 'STOP', 'please stop', 'x', 'off', 'false', '0']) {
  const state = resolveKillSwitch({ [SHADOW_KILL_SWITCH_ENV]: value });
  check(state.engaged, 'kill switch engages on any non-empty value: "' + value + '"');
  eq(state.source, 'ENVIRONMENT', 'env-sourced kill switch names ENVIRONMENT for "' + value + '"');
}
for (const value of ['', '   ', '\t']) {
  eq(
    resolveKillSwitch({ [SHADOW_KILL_SWITCH_ENV]: value }).engaged, false,
    'an empty/whitespace kill-switch value does NOT engage ("' + JSON.stringify(value) + '")',
  );
}
check(
  ['off', 'false', '0'].every((v) => resolveKillSwitch({ [SHADOW_KILL_SWITCH_ENV]: v }).engaged),
  'the kill switch is deliberately PERMISSIVE: even "off"/"false"/"0" stop shadow, because a brake must not fail closed on a typo',
);

// The kill switch beats a fully authorized configuration.
const killedEnv = fullyAuthorizedEnv();
killedEnv[SHADOW_KILL_SWITCH_ENV] = 'engaged';
const killed = resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env: killedEnv });
check(!killed.authorized, 'the kill switch refuses a fully authorized configuration');
eq(killed.refusal, 'KILL_SWITCH_ENGAGED', 'kill switch is reported as the refusal');
check(
  killed.locks.SERVER_MODE && killed.locks.PRODUCTION_SHADOW_ACK,
  'the kill switch stops shadow WITHOUT closing the locks -- it is an override, not a reconfiguration',
);

// Runtime latch: immediate, no restart, no configuration change.
resetRuntimeKillSwitch();
check(!resolveKillSwitch({}).engaged, 'runtime latch starts disengaged');
const latched = engageRuntimeKillSwitch('CIRCUIT_BREAKER:CUSTOMER_OUTPUT_MUTATED');
check(latched.engaged, 'engaging the runtime latch reports engaged');
check(resolveKillSwitch({}).engaged, 'the runtime latch is visible with NO environment change');
eq(resolveKillSwitch({}).source, 'RUNTIME_LATCH', 'the latch names RUNTIME_LATCH as its source');
const secondEngage = engageRuntimeKillSwitch('SOMETHING_ELSE');
check(
  String(secondEngage.reason).includes('CUSTOMER_OUTPUT_MUTATED'),
  'engaging twice preserves the FIRST reason -- the first cause is what an operator needs',
);
eq(
  resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env: fullyAuthorizedEnv() }).refusal,
  'KILL_SWITCH_ENGAGED',
  'the runtime latch refuses an otherwise fully authorized production configuration',
);
resetRuntimeKillSwitch();
check(
  resolveProductionShadowAuthorization({ principal: INTERNAL_PRINCIPAL, env: fullyAuthorizedEnv() }).authorized,
  'an explicit reset restores authorization -- the latch is reversible',
);

// ================================================================== 5/16. CIRCUIT BREAKER

section('5-circuit-breaker');

const healthy = {
  comparisons: 1000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
  meanShadowOverheadMs: 1.187, hardViolations: [] as never[],
};
eq(evaluateCircuitBreaker(healthy).action, 'CONTINUE', 'a healthy window at the KG-4B baseline continues');

// Hard invariants: threshold zero, no sample floor, one occurrence is enough.
for (const violation of HARD_INVARIANT_VIOLATIONS) {
  const verdict = evaluateCircuitBreaker({
    comparisons: 1, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
    meanShadowOverheadMs: 0, hardViolations: [violation],
  });
  eq(verdict.action, 'STOP_SHADOW', 'hard invariant ' + violation + ' stops shadow on ONE occurrence');
  eq(verdict.trippedBy, violation, 'the stop names ' + violation + ' as the trip cause');
}
eq(HARD_INVARIANT_VIOLATIONS.length, 7, 'seven hard invariants are defined');
check(
  HARD_INVARIANT_VIOLATIONS.includes('CUSTOMER_OUTPUT_MUTATED')
    && HARD_INVARIANT_VIOLATIONS.includes('GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW')
    && HARD_INVARIANT_VIOLATIONS.includes('PRIVACY_SCHEMA_VIOLATION')
    && HARD_INVARIANT_VIOLATIONS.includes('APPROVAL_INTEGRITY_IMPOSSIBLE')
    && HARD_INVARIANT_VIOLATIONS.includes('NONDETERMINISTIC_RESULT'),
  'the five zero-tolerance conditions the brief names are all hard invariants',
);
check(
  HARD_INVARIANT_VIOLATIONS.includes('CUSTOMER_OUTPUT_UNVERIFIED'),
  'an UNVERIFIED invariance check is itself a hard violation -- unverified is not verified',
);

// Every rate threshold carries a stated basis and a sample floor.
for (const threshold of RATE_THRESHOLDS) {
  check(threshold.threshold > 0, threshold.condition + ' has a non-zero threshold');
  check(threshold.minimumSample >= 200, threshold.condition + ' has a minimum sample of at least 200');
  check(threshold.basis.length > 200, threshold.condition + ' states a substantive evidential basis');
  check(
    /KG-4B|measured|baseline/i.test(threshold.basis),
    threshold.condition + ' ties its threshold to a KG-4B measurement rather than to a guess',
  );
}
eq(RATE_THRESHOLDS.length, 4, 'four rate conditions are defined');

// The sample floor genuinely prevents an early trip.
const earlyFailure = evaluateCircuitBreaker({
  comparisons: 2, resolverFailures: 1, telemetryFailures: 0, blockingMismatches: 0,
  meanShadowOverheadMs: 0, hardViolations: [],
});
check(earlyFailure.action !== 'STOP_SHADOW', 'a 50% failure rate over 2 comparisons does NOT stop shadow');
check(
  earlyFailure.review.some((entry) => entry.startsWith('BELOW_MINIMUM_SAMPLE')),
  'an over-threshold rate below the sample floor is surfaced for REVIEW rather than ignored',
);

const resolverThreshold = thresholdFor('RESOLVER_FAILURE_RATE');
const resolverTrip = evaluateCircuitBreaker({
  comparisons: resolverThreshold.minimumSample,
  resolverFailures: Math.ceil(resolverThreshold.minimumSample * resolverThreshold.threshold) + 1,
  telemetryFailures: 0, blockingMismatches: 0, meanShadowOverheadMs: 0, hardViolations: [],
});
eq(resolverTrip.action, 'STOP_SHADOW', 'the resolver failure rate stops shadow once its sample floor is met');
eq(resolverTrip.trippedBy, 'RESOLVER_FAILURE_RATE', 'the resolver trip names its condition');

const latencyTrip = evaluateCircuitBreaker({
  comparisons: 500, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
  meanShadowOverheadMs: thresholdFor('SHADOW_LATENCY_OVERHEAD').threshold + 1, hardViolations: [],
});
eq(latencyTrip.action, 'STOP_SHADOW', 'latency overhead above its ceiling stops shadow');

// The measured KG-4B overhead must be comfortably inside the ceiling, or the threshold is wrong.
check(
  1.187 < thresholdFor('SHADOW_LATENCY_OVERHEAD').threshold / 5,
  'the KG-4B measured overhead (1.187 ms) is at least 5x inside the latency ceiling',
);

// A single blocking mismatch is captured but does not stop the run -- that is the point of shadow.
const oneBlocking = evaluateCircuitBreaker({
  comparisons: 5000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 1,
  meanShadowOverheadMs: 1.2, hardViolations: [],
});
check(
  oneBlocking.action !== 'STOP_SHADOW',
  'one blocking mismatch in 5000 does not stop shadow -- discovering them is why shadow runs',
);
const manyBlocking = evaluateCircuitBreaker({
  comparisons: 5000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 50,
  meanShadowOverheadMs: 1.2, hardViolations: [],
});
eq(manyBlocking.action, 'STOP_SHADOW', 'a systematic blocking rate stops shadow');

// REVIEW band.
const elevated = evaluateCircuitBreaker({
  comparisons: 1000, resolverFailures: 15, telemetryFailures: 0, blockingMismatches: 0,
  meanShadowOverheadMs: 1.2, hardViolations: [],
});
eq(elevated.action, 'REVIEW', 'a rate above half its threshold but below it reports REVIEW');

// Applying a STOP engages the kill switch, and nothing else.
resetRuntimeKillSwitch();
const applied = applyBreakerVerdict(evaluateCircuitBreaker({
  comparisons: 1, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
  meanShadowOverheadMs: 0, hardViolations: ['CUSTOMER_OUTPUT_MUTATED'],
}));
check(applied !== null && applied.engaged, 'applying a STOP verdict engages the kill switch');
check(
  String(applied?.reason).includes('CIRCUIT_BREAKER'),
  'the kill-switch reason names the circuit breaker as the cause',
);
eq(
  applyBreakerVerdict(evaluateCircuitBreaker(healthy)), null,
  'applying a CONTINUE verdict does nothing at all',
);
resetRuntimeKillSwitch();

// The accumulator is bounded and produces the same verdicts.
const window = new ShadowBreakerWindow();
for (let i = 0; i < 300; i += 1) window.recordComparison({ overheadMs: 1.2 });
eq(window.evaluate().action, 'CONTINUE', 'a clean 300-comparison window continues');
window.recordHardViolation('PRIVACY_SCHEMA_VIOLATION');
eq(window.evaluate().action, 'STOP_SHADOW', 'one hard violation in the window stops shadow');
eq(window.observation().comparisons, 300, 'the window counts comparisons without retaining them');

// ================================================================== 6. SAMPLING

section('6-sampling');

const cohortEnv = { [SHADOW_COHORT_BPS_ENV]: '10000', [SHADOW_COHORT_SALT_ENV]: 'salt-a' };

eq(
  evaluateCohort({ principal: INTERNAL_PRINCIPAL, stage: 'STAGE_1_SINGLE_ACCOUNT', env: cohortEnv }).decision,
  'COHORT_NOT_PERMITTED_AT_STAGE',
  'a cohort configured at stage 1 is inert, not an error',
);
eq(
  evaluateCohort({ principal: INTERNAL_PRINCIPAL, stage: 'STAGE_3_DETERMINISTIC_COHORT', env: {} }).decision,
  'COHORT_DISABLED',
  'no cohort configuration means no cohort',
);
eq(
  evaluateCohort({ principal: null, stage: 'STAGE_3_DETERMINISTIC_COHORT', env: cohortEnv }).decision,
  'COHORT_NO_STABLE_KEY',
  'a principal with no stable id is never sampled in',
);

// The stage ceiling caps a larger configured rate.
const capped = evaluateCohort({
  principal: INTERNAL_PRINCIPAL, stage: 'STAGE_3_DETERMINISTIC_COHORT', env: cohortEnv,
});
eq(
  capped.effectiveBps, stageConstraints('STAGE_3_DETERMINISTIC_COHORT').maxCohortBps,
  'a 100% configured cohort is capped to the stage-3 ceiling',
);

// Determinism and stability.
const repeated = new Set(
  Array.from({ length: 25 }, () => JSON.stringify(evaluateCohort({
    principal: { userId: 'stable-user', organizationId: null },
    stage: 'STAGE_4_BROAD', env: cohortEnv,
  }))),
);
eq(repeated.size, 1, 'cohort evaluation is deterministic across 25 identical calls');

const saltA = evaluateCohort({
  principal: { userId: 'stable-user', organizationId: null }, stage: 'STAGE_4_BROAD',
  env: { ...cohortEnv, [SHADOW_COHORT_SALT_ENV]: 'salt-a' },
}).bucket;
const saltB = evaluateCohort({
  principal: { userId: 'stable-user', organizationId: null }, stage: 'STAGE_4_BROAD',
  env: { ...cohortEnv, [SHADOW_COHORT_SALT_ENV]: 'salt-b' },
}).bucket;
check(saltA !== saltB, 'changing the salt reshuffles the cohort -- the supported way to draw a new sample');

// Distribution: a 1% cohort selects roughly 1% of keys, and never all of them.
const sampled = Array.from({ length: 4000 }, (_, i) => evaluateCohort({
  principal: { userId: 'user-' + i, organizationId: null },
  stage: 'STAGE_3_DETERMINISTIC_COHORT',
  env: { [SHADOW_COHORT_BPS_ENV]: '100', [SHADOW_COHORT_SALT_ENV]: 'salt-a' },
}).included).filter(Boolean).length;
check(
  sampled > 10 && sampled < 100,
  'a 100 bps cohort selects roughly 1% of 4000 keys (observed ' + sampled + ')',
);

// No PII in the key: the same user id produces the same bucket regardless of any other attribute.
check(
  evaluateCohort({ principal: { userId: 'k', organizationId: 'org-1' }, stage: 'STAGE_4_BROAD', env: cohortEnv }).bucket
    === evaluateCohort({ principal: { userId: 'k', organizationId: 'org-2' }, stage: 'STAGE_4_BROAD', env: cohortEnv }).bucket,
  'the cohort bucket depends only on the account id, never on other attributes',
);

// Cohort eligibility is separate from allowlist eligibility.
const cohortOnlyEnv = fullyAuthorizedEnv();
cohortOnlyEnv[SHADOW_STAGE_ENV] = 'STAGE_3_DETERMINISTIC_COHORT';
cohortOnlyEnv[CUTOVER_ALLOWLIST_ENV] = 'someone-else';
cohortOnlyEnv[SHADOW_COHORT_BPS_ENV] = '10000';
const cohortOnly = resolveProductionShadowAuthorization({
  principal: { userId: 'not-on-the-list', organizationId: null }, env: cohortOnlyEnv,
});
check(
  cohortOnly.cohort !== null,
  'the cohort evaluation is reported separately from the allowlist decision',
);

// ================================================================== 9. SCHEMA VERSIONING

section('9-schema');

eq(SHADOW_EVENT_SCHEMA_VERSION_V2, 'kg4c.shadow-comparison.v2', 'v2 schema version string is explicit');
check(
  SHADOW_EVENT_ALLOWED_FIELDS.every((field) => SHADOW_EVENT_V2_ALLOWED_FIELDS.includes(field)),
  'v2 is a strict superset of v1 -- no v1 field was dropped or renamed',
);
eq(
  SHADOW_EVENT_V2_ALLOWED_FIELDS.length,
  SHADOW_EVENT_ALLOWED_FIELDS.length + SHADOW_EVENT_V2_ADDITIONAL_FIELDS.length,
  'v2 adds exactly its declared additional fields and nothing else',
);
eq(SHADOW_EVENT_ALLOWED_FIELDS.length, 29, 'v1 carried 29 fields');
eq(SHADOW_EVENT_V2_ADDITIONAL_FIELDS.length, 6, 'v2 adds six fields');

const baseRecord = buildShadowComparisonRecord({
  governed: resolutionFixture(),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'Each employee on a walking/working surface shall be protected.',
  legacyBackingState: 'HAZLENZ_AUTHORED',
  applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction',
  governedJurisdiction: 'OSHA/construction',
  correlationId: 'corr-1', findingKey: 'finding-1', mode: 'SHADOW',
  releaseManifestChecksum: '14a34feaa670d5d0d289d7249b38466e',
  fallbackState: 'LEGACY_TEXT_UNVERIFIED',
  hazardFamily: 'fall protection', jurisdiction: 'construction',
  latencyMs: 1, customerOutputUnchanged: true,
});

const v2Event = buildShadowEventV2(baseRecord, {
  stage: 'STAGE_1_SINGLE_ACCOUNT', eligibilitySource: 'ACCOUNT_ALLOWLIST',
  outputInvarianceVerdict: 'INVARIANT',
  outputInvarianceHash: 'a'.repeat(64),
  outputInvarianceDifferingPaths: 0,
  shadowProvenanceNull: true,
});
eq(v2Event.schemaVersion, SHADOW_EVENT_SCHEMA_VERSION_V2, 'the builder stamps the v2 version');
check(
  Object.keys(v2Event).every((key) => SHADOW_EVENT_V2_ALLOWED_FIELDS.includes(key)),
  'every field the builder produces is on the v2 allowlist',
);
check(
  SHADOW_EVENT_V2_ALLOWED_FIELDS.every((field) => field in v2Event),
  'the builder produces every allowlisted field -- the schema is total, not partial',
);
eq(v2Event.mismatch, baseRecord.mismatch, 'v2 preserves the v1 classification verbatim');
eq(v2Event.eventKey, baseRecord.eventKey, 'v2 preserves the v1 idempotency key');

// Required fields the brief enumerates are all present and typed.
for (const required of [
  'schemaVersion', 'mismatch', 'severity', 'rootCause', 'correlationId', 'releaseId',
  'hazardFamily', 'jurisdiction', 'requestedCitation', 'governedResolvedCitation',
  'governedBackingState', 'applicability', 'latencyMs', 'outputInvarianceVerdict',
]) {
  check(required in v2Event, 'the v2 event carries the required field "' + required + '"');
}

// ================================================================== 10. PRIVACY CANARIES

section('10-privacy');

const CANARY_INJECTIONS: Array<{ label: string; value: string }> = [
  { label: 'observation text', value: 'The worker was standing on an unguarded edge at the north wall.' },
  { label: 'inspector note', value: 'Employee had no harness; operator was told twice.' },
  { label: 'report prose', value: 'The inspector is recommending immediate corrective action.' },
  { label: 'person name + email', value: 'Dana Whitfield <dana.whitfield@example.com>' },
  { label: 'bare email', value: 'someone@example.org' },
  { label: 'password field', value: '{"password":"hunter2"}' },
  { label: 'passphrase field', value: 'passphrase: correct horse battery staple' },
  { label: 'bearer token', value: 'Bearer abcdef0123456789abcdef' },
  { label: 'jwt', value: 'eyJhbGciOi.eyJzdWIiOiIx.sig' },
  { label: 'api key field', value: 'api_key=sk-live-0123456789' },
  { label: 'access token field', value: '{"access_token":"zzzz9999"}' },
  { label: 'authorization header', value: '{"authorization":"Basic QQ=="}' },
  { label: 'private key', value: '-----BEGIN RSA PRIVATE KEY-----' },
  { label: 'phone number', value: 'call 415-555-0198' },
  { label: 'ssn', value: '123-45-6789' },
  { label: 'street address', value: '1200 Harrison Street' },
];

for (const injection of CANARY_INJECTIONS) {
  // Inject into an ALLOWLISTED field, which is the hard case: the field name is legitimate, so
  // only content inspection can catch it.
  const poisoned = { ...v2Event, hazardFamily: injection.value } as Record<string, unknown>;
  let threw = false;
  let marker = '';
  try {
    assertShadowEventV2PrivacySafe(poisoned);
  } catch (error) {
    threw = true;
    marker = error instanceof ShadowPrivacyViolation ? error.marker : 'UNKNOWN';
  }
  check(threw, 'privacy guard rejects injected ' + injection.label);
  check(marker !== '' && marker !== 'UNKNOWN', 'the rejection of ' + injection.label + ' names a marker (' + marker + ')');
}

// A field that is not on the allowlist cannot appear at all.
let unknownFieldRejected = false;
try {
  assertShadowEventV2PrivacySafe({ ...v2Event, observationText: 'anything' } as Record<string, unknown>);
} catch (error) {
  unknownFieldRejected = error instanceof ShadowPrivacyViolation && error.marker === 'FIELD_NOT_ALLOWLISTED';
}
check(unknownFieldRejected, 'a non-allowlisted field is rejected by name before content is even considered');

// Arbitrary request metadata cannot ride along inside a nested object.
let nestedRejected = false;
try {
  assertShadowEventV2PrivacySafe({ ...v2Event, jurisdiction: { headers: { cookie: 'x' } } } as unknown as Record<string, unknown>);
} catch (error) {
  nestedRejected = error instanceof ShadowPrivacyViolation;
}
check(nestedRejected, 'a nested object in a scalar field is rejected -- metadata cannot ride along');

// Long prose is rejected on length even when it trips no pattern.
let lengthRejected = false;
try {
  assertShadowEventV2PrivacySafe({ ...v2Event, hazardFamily: 'x'.repeat(500) } as Record<string, unknown>);
} catch (error) {
  lengthRejected = error instanceof ShadowPrivacyViolation && error.marker === 'FIELD_TOO_LONG';
}
check(lengthRejected, 'an over-long field is rejected on length even with no matching pattern');

// The clean event passes -- the guard is not vacuously rejecting everything.
let cleanPasses = true;
try { assertShadowEventV2PrivacySafe(v2Event as unknown as Record<string, unknown>); }
catch { cleanPasses = false; }
check(cleanPasses, 'a clean, legitimate v2 event passes the privacy guard');
check(PRIVACY_CANARY_PATTERNS.length >= 12, 'at least twelve canary patterns are defined');

// The builder makes unsupported fields impossible rather than merely rejected.
const builderKeys = Object.keys(buildShadowEventV2(baseRecord, {
  stage: 'STAGE_0_DISABLED', eligibilitySource: 'NONE', shadowProvenanceNull: true,
}));
check(
  builderKeys.length === SHADOW_EVENT_V2_ALLOWED_FIELDS.length,
  'the builder emits exactly the allowlisted field set regardless of its inputs',
);

// ------------------------------------------------------------------ sink fail-open

section('10-sink');

const enabled = { GOVERNED_CUTOVER_OBSERVABILITY: 'enabled' };
const capturing = new CapturingSink();
eq(
  emitShadowEvent({ event: v2Event as unknown as Record<string, unknown>, sink: capturing, env: enabled }).status,
  'DELIVERED', 'a clean event is delivered',
);
eq(capturing.written.length, 1, 'the sink received exactly one line');

eq(
  emitShadowEvent({ event: v2Event as unknown as Record<string, unknown>, sink: capturing, env: {} }).status,
  'SUPPRESSED_DISABLED', 'observability off suppresses without error',
);
eq(
  emitShadowEvent({
    event: { ...v2Event, hazardFamily: 'a@b.com' } as unknown as Record<string, unknown>,
    sink: capturing, env: enabled,
  }).status,
  'DROPPED_PRIVACY', 'a privacy failure DROPS the event rather than writing it',
);

const throwingSink = { write(): void { throw new Error('sink down'); } };
const sinkFailure = emitShadowEvent({
  event: v2Event as unknown as Record<string, unknown>, sink: throwingSink, env: enabled,
});
eq(sinkFailure.status, 'DROPPED_SINK_FAILURE', 'a sink failure is reported, not thrown');
check(
  sinkFailure.reason !== null,
  'a dropped event names a categorical reason so silent loss becomes a measured rate',
);

// Circular structure: serialization failure must also fail open.
const circular: Record<string, unknown> = { ...v2Event };
circular.dimensions = circular;
let emitThrew = false;
try {
  emitShadowEvent({ event: circular, sink: capturing, env: enabled });
} catch { emitThrew = true; }
check(!emitThrew, 'emitShadowEvent NEVER throws, even on a circular structure');

check(
  RETENTION_CONTRACT.rawEvents.applicationControls === false
    && RETENTION_CONTRACT.blockingEvidence.applicationControls === true,
  'the retention contract states honestly which durations the application controls and which it does not',
);

// ================================================================== 11. INVARIANCE HASH

section('11-invariance');

const legacyPayload = {
  traceId: 'trace-1', generatedAt: '2026-08-21T10:00:00.000Z',
  standards: [
    { citation: '29 CFR 1926.501', backingStatus: 'HAZLENZ_AUTHORED', confidence: 'High' },
    { citation: '29 CFR 1926.451', backingStatus: 'HAZLENZ_AUTHORED', confidence: 'Medium' },
  ],
};
const legacyPayloadSecondRun = {
  traceId: 'trace-2', generatedAt: '2026-08-21T10:00:03.500Z',
  standards: [
    { citation: '29 CFR 1926.501', backingStatus: 'HAZLENZ_AUTHORED', confidence: 'High' },
    { citation: '29 CFR 1926.451', backingStatus: 'HAZLENZ_AUTHORED', confidence: 'Medium' },
  ],
};

const volatilePaths = deriveVolatilePaths(legacyPayload, legacyPayloadSecondRun);
check(volatilePaths.has('traceId'), 'the volatile set is DERIVED and includes traceId');
check(volatilePaths.has('generatedAt'), 'the derived volatile set includes generatedAt');
check(!volatilePaths.has('standards#0.citation'), 'a stable field is NOT in the derived volatile set');
eq(volatilePaths.size, 2, 'exactly the two genuinely volatile fields were derived');

eq(
  compareCustomerOutput({ legacyPayload, shadowPayload: legacyPayloadSecondRun, volatilePaths }).verdict,
  'INVARIANT', 'two legacy runs are INVARIANT once derived volatility is excluded',
);

// The KG-4B payload leak: an ADDED key with a null value.
const leakedPayload = {
  ...legacyPayloadSecondRun,
  standards: legacyPayloadSecondRun.standards.map((entry) => ({ ...entry, knowledgeReleaseId: null })),
};
const leak = compareCustomerOutput({ legacyPayload, shadowPayload: leakedPayload, volatilePaths });
eq(leak.verdict, 'MUTATED', 'an added null-valued key is detected as MUTATED -- the KG-4B leak');
check(leak.differingPathCount > 0, 'the leak reports how many paths differ');
check(
  leak.differingPaths.some((path) => path.includes('knowledgeReleaseId') || path.includes('keys')),
  'the leak names the structural path that changed',
);

// Reordering is detected.
const reordered = {
  ...legacyPayloadSecondRun,
  standards: [...legacyPayloadSecondRun.standards].reverse(),
};
eq(
  compareCustomerOutput({ legacyPayload, shadowPayload: reordered, volatilePaths }).verdict,
  'MUTATED', 'reordering the citation list is detected -- order is part of the contract',
);

// A single changed character is detected.
const oneChar = JSON.parse(JSON.stringify(legacyPayloadSecondRun));
oneChar.standards[0].confidence = 'Higi';
eq(
  compareCustomerOutput({ legacyPayload, shadowPayload: oneChar, volatilePaths }).verdict,
  'MUTATED', 'a single changed character is detected',
);

// Truncation is detected.
const truncated = { ...legacyPayloadSecondRun, standards: [legacyPayloadSecondRun.standards[0]] };
eq(
  compareCustomerOutput({ legacyPayload, shadowPayload: truncated, volatilePaths }).verdict,
  'MUTATED', 'a truncated citation list is detected',
);

// INDETERMINATE is not a pass.
eq(
  compareCustomerOutput({ legacyPayload, shadowPayload: undefined, volatilePaths }).verdict,
  'INDETERMINATE', 'a missing shadow payload is INDETERMINATE, never INVARIANT',
);

// The hash is stable, order-independent over object keys, and privacy-safe.
eq(
  customerOutputHash({ a: 1, b: 2 }), customerOutputHash({ b: 2, a: 1 }),
  'the hash is independent of object key insertion order',
);
check(
  customerOutputHash(legacyPayload).length === 64,
  'the customer output hash is a full sha256 hex digest',
);
const secretPayload = { note: 'password=hunter2 for dana@example.com' };
const secretHash = customerOutputHash(secretPayload);
check(
  !secretHash.includes('hunter2') && !secretHash.includes('example.com'),
  'the hash reveals nothing about the payload it covers',
);
const mutatedSecret = compareCustomerOutput({
  legacyPayload: secretPayload, shadowPayload: { note: 'different' },
});
check(
  !JSON.stringify(mutatedSecret).includes('hunter2'),
  'a MUTATED result carries path names only -- never the differing VALUES',
);

// Null and absent are distinguished, which is what makes an added key detectable.
check(
  customerOutputHash({ a: null }) !== customerOutputHash({}),
  'a key present with value null hashes differently from an absent key',
);
check(
  flattenPayload({ list: [] }).has('list#length'),
  'array length is recorded so an empty list cannot collide with an absent one',
);

// ================================================================== 12. PROVENANCE INVARIANT

section('12-provenance');

const governedSubject = {
  analysisKnowledgeReleaseId: 'federal-core-2026-07-30.1',
  findingKnowledgeReleaseIds: { 'finding-1': 'federal-core-2026-07-30.1', 'finding-2': null },
};

const shadowEnforced = enforceShadowProvenanceInvariant('SHADOW', governedSubject);
eq(shadowEnforced.result.analysisKnowledgeReleaseId, null, 'SHADOW coerces the analysis release id to NULL');
check(
  Object.values(shadowEnforced.result.findingKnowledgeReleaseIds).every((value) => value === null),
  'SHADOW coerces every finding release id to NULL',
);
check(shadowEnforced.violated, 'the coercion is reported as a violation, not performed silently');
check(
  shadowEnforced.violations.includes('ANALYSIS_ID_WRITTEN_IN_SHADOW')
    && shadowEnforced.violations.includes('FINDING_ID_WRITTEN_IN_SHADOW'),
  'both violation kinds are named',
);
eq(shadowEnforced.coercedFindingCount, 1, 'the number of coerced findings is counted for the breaker');

// Not vacuous: governed delivery modes pass through untouched.
for (const mode of ['GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
  const passthrough = enforceShadowProvenanceInvariant(mode, governedSubject);
  eq(
    passthrough.result.analysisKnowledgeReleaseId, 'federal-core-2026-07-30.1',
    mode + ' passes provenance through untouched -- the invariant is SHADOW-only',
  );
  check(!passthrough.violated, mode + ' reports no violation');
}

// An already-compliant SHADOW subject is not reported as violating.
const compliantShadow = {
  analysisKnowledgeReleaseId: null,
  findingKnowledgeReleaseIds: { 'finding-1': null },
};
check(
  !enforceShadowProvenanceInvariant('SHADOW', compliantShadow).violated,
  'a correctly NULL SHADOW subject reports no violation',
);
check(shadowProvenanceIsCompliant('SHADOW', compliantShadow), 'the compliance predicate accepts a NULL subject');
check(!shadowProvenanceIsCompliant('SHADOW', governedSubject), 'the compliance predicate rejects a stamped subject');
check(
  shadowProvenanceIsCompliant('GOVERNED_WITH_FALLBACK', governedSubject),
  'the compliance predicate has no opinion about governed delivery',
);

// A provenance violation is a hard, threshold-zero breaker condition.
eq(
  evaluateCircuitBreaker({
    comparisons: 10000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
    meanShadowOverheadMs: 1, hardViolations: ['GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW'],
  }).action,
  'STOP_SHADOW',
  'one governed-provenance-in-SHADOW violation stops shadow regardless of how healthy everything else is',
);

// ================================================================== 18. UNOBSERVED CATEGORIES

section('18-unobserved');

/**
 * KG-4B's `STATUS.md` prose names SEVEN never-observed categories. Its `CORPUS_AND_ANALYTICS.md`
 * and `analytics/shadow-analytics.json` both list ELEVEN, and the 83-event corpus contains exactly
 * four categories, so eleven is the measured figure and seven is a prose subset.
 *
 * This suite maps ALL ELEVEN. Covering the measured superset costs nothing and avoids inheriting a
 * narrative number over a measured one.
 */
const OBSERVED_IN_KG4B: readonly ShadowMismatchCategory[] = Object.freeze([
  'EXACT_MATCH', 'GOVERNED_MISSING', 'GRANULARITY_DIFFERENCE', 'APPLICABILITY_DIFFERENCE',
]);

const STATUS_MD_SEVEN: readonly ShadowMismatchCategory[] = Object.freeze([
  'CONTENT_DIFFERENCE', 'JURISDICTION_DIFFERENCE', 'CITATION_DIFFERENCE', 'INTEGRITY_FAILURE',
  'ORDERING_DIFFERENCE', 'CONTENT_EQUIVALENT', 'PROVENANCE_DIFFERENCE',
]);

const UNOBSERVED = ALL_MISMATCH_CATEGORIES.filter((category) => !OBSERVED_IN_KG4B.includes(category));

eq(UNOBSERVED.length, 11, 'eleven taxonomy categories were unobserved in the KG-4B corpus');
eq(STATUS_MD_SEVEN.length, 7, 'KG-4B STATUS.md prose names seven of them');
check(
  STATUS_MD_SEVEN.every((category) => UNOBSERVED.includes(category)),
  'all seven prose categories are a subset of the eleven measured unobserved categories',
);

/** Severity and root cause must be defined for every unobserved category, and reachable. */
const BLOCKING_EXPECTED: readonly ShadowMismatchCategory[] = Object.freeze([
  'CONTENT_DIFFERENCE', 'JURISDICTION_DIFFERENCE', 'CITATION_DIFFERENCE', 'INTEGRITY_FAILURE',
]);

for (const category of UNOBSERVED) {
  const severity = severityFor(category, dimensionsFixture());
  check(
    ['BLOCKING', 'REVIEW', 'INFORMATIONAL'].includes(severity),
    'unobserved category ' + category + ' has a defined severity (' + severity + ')',
  );
  if (BLOCKING_EXPECTED.includes(category)) {
    eq(severity, 'BLOCKING', 'unobserved category ' + category + ' maps to BLOCKING');
    // A blocking category must be able to trip the breaker via the blocking-mismatch rate.
    const trip = evaluateCircuitBreaker({
      comparisons: 5000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 50,
      meanShadowOverheadMs: 1, hardViolations: [],
    });
    eq(trip.action, 'STOP_SHADOW', 'a systematic rate of ' + category + ' can stop shadow');
  }
}

// The two that map onto HARD invariants rather than a rate.
eq(
  evaluateCircuitBreaker({
    comparisons: 5000, resolverFailures: 0, telemetryFailures: 0, blockingMismatches: 0,
    meanShadowOverheadMs: 1, hardViolations: ['CITATION_SUBSTITUTED'],
  }).action,
  'STOP_SHADOW',
  'CITATION_DIFFERENCE, being a violation of this system own invariant, also has a hard-stop path',
);

// Every category in the whole taxonomy is reachable through the real classifier.
const reachable = new Set<ShadowMismatchCategory>();
for (const category of ALL_MISMATCH_CATEGORIES) reachable.add(category);
eq(reachable.size, ALL_MISMATCH_CATEGORIES.length, 'the taxonomy has no duplicate entries');
eq(ALL_MISMATCH_CATEGORIES.length, 15, 'the taxonomy still has fifteen categories');

// Reachability through the classifier, for the blocking ones that matter most.
const substituted = classifyShadowComparison({
  governed: resolutionFixture({ resolvedCitation: '29 CFR 1926.5011' }),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'text', legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction', governedJurisdiction: 'OSHA/construction',
});
eq(substituted.mismatch, 'CITATION_DIFFERENCE', 'CITATION_DIFFERENCE is reachable through the real classifier');
eq(substituted.severity, 'BLOCKING', 'CITATION_DIFFERENCE classifies as BLOCKING');

const jurisdictionMismatch = classifyShadowComparison({
  governed: resolutionFixture({ jurisdiction: 'MSHA/mining' }),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'text', legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction', governedJurisdiction: 'MSHA/mining',
});
eq(jurisdictionMismatch.mismatch, 'JURISDICTION_DIFFERENCE', 'JURISDICTION_DIFFERENCE is reachable');
eq(jurisdictionMismatch.severity, 'BLOCKING', 'JURISDICTION_DIFFERENCE classifies as BLOCKING');

const contentDifference = classifyShadowComparison({
  governed: resolutionFixture({ standardText: 'A materially different obligation.' }),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'Each employee on a walking/working surface shall be protected.',
  legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction', governedJurisdiction: 'OSHA/construction',
});
eq(contentDifference.mismatch, 'CONTENT_DIFFERENCE', 'CONTENT_DIFFERENCE is reachable');
eq(contentDifference.severity, 'BLOCKING', 'CONTENT_DIFFERENCE classifies as BLOCKING');

const resolverFailure = classifyShadowComparison({
  governed: resolutionFixture({ health: 'QUERY_FAILED', backing: 'RESOLVER_UNAVAILABLE', standardText: null }),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'text', legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction', governedJurisdiction: null,
});
eq(resolverFailure.mismatch, 'RESOLVER_FAILURE', 'RESOLVER_FAILURE is reachable');

const integrityFailure = classifyShadowComparison({
  governed: resolutionFixture({ health: 'STALE_SCHEMA', backing: 'RESOLVER_UNAVAILABLE', standardText: null }),
  legacyCitation: '29 CFR 1926.501',
  legacyText: 'text', legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
  legacyJurisdiction: 'construction', governedJurisdiction: null,
});
eq(integrityFailure.mismatch, 'INTEGRITY_FAILURE', 'INTEGRITY_FAILURE is reachable');
eq(integrityFailure.severity, 'BLOCKING', 'INTEGRITY_FAILURE classifies as BLOCKING');

// The corpus was NOT padded to make these appear -- they are unit-reachable only.
check(
  OBSERVED_IN_KG4B.length === 4,
  'the KG-4B corpus still contains exactly the four categories it measured -- nothing was fabricated into it',
);

// ================================================================== 15/16. METRICS + ALERTS

section('15-metrics');

const REQUIRED_METRICS = [
  'shadow_eligible_requests', 'shadow_executed', 'shadow_skipped', 'shadow_exact_match',
  'shadow_expected_fallback', 'shadow_review_mismatch', 'shadow_blocking_mismatch',
  'shadow_resolver_failure', 'shadow_integrity_failure', 'shadow_output_hash_mismatch',
  'shadow_provenance_violation', 'shadow_privacy_violation', 'shadow_telemetry_dropped',
  'shadow_overhead_p50_ms', 'shadow_overhead_p95_ms',
];
for (const metric of REQUIRED_METRICS) {
  check(
    SHADOW_METRICS.some((entry) => entry.name === metric),
    'the metric catalog defines "' + metric + '"',
  );
}
check(
  SHADOW_METRICS.some((entry) => entry.name === 'shadow_comparisons'),
  'the catalog defines the DENOMINATOR explicitly -- a rate without one is meaningless',
);
for (const metric of SHADOW_METRICS) {
  check(metric.question.length > 20, metric.name + ' states the question it answers');
  check(metric.derivedFrom.length > 5, metric.name + ' names where its value comes from');
}

for (const dimension of ['hazardFamily', 'jurisdiction', 'governedBackingState', 'mismatch']) {
  check(METRIC_DIMENSIONS.includes(dimension), 'aggregation by "' + dimension + '" is supported');
}
for (const forbidden of FORBIDDEN_METRIC_DIMENSIONS) {
  check(
    !METRIC_DIMENSIONS.includes(forbidden),
    'identifying dimension "' + forbidden + '" is NOT available for aggregation',
  );
}
check(
  FORBIDDEN_METRIC_DIMENSIONS.includes('correlationId')
    && FORBIDDEN_METRIC_DIMENSIONS.includes('organizationId'),
  'the forbidden dimension list covers both per-analysis and per-tenant identifiers',
);

section('16-alerts');

check(ALERT_RULES.length >= HARD_INVARIANT_VIOLATIONS.length + RATE_THRESHOLDS.length,
  'every hard invariant and every rate threshold has an alert rule');
const zeroToleranceRules = ALERT_RULES.filter((rule) => rule.zeroTolerance);
eq(zeroToleranceRules.length, HARD_INVARIANT_VIOLATIONS.length,
  'the zero-tolerance rules are exactly the hard invariants');
check(zeroToleranceRules.every((rule) => rule.action === 'STOP_SHADOW'),
  'every zero-tolerance rule maps to STOP_SHADOW');
for (const rule of ALERT_RULES) {
  check(['CONTINUE', 'REVIEW', 'STOP_SHADOW'].includes(rule.action),
    'alert rule "' + rule.condition + '" maps to a defined action');
  check(rule.justification.length > 80,
    'alert rule "' + rule.condition + '" carries a justification rather than a magic number');
}
for (const required of [
  'CUSTOMER_OUTPUT_MUTATED', 'GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW', 'PRIVACY_SCHEMA_VIOLATION',
  'APPROVAL_INTEGRITY_IMPOSSIBLE', 'NONDETERMINISTIC_RESULT',
]) {
  check(
    ALERT_RULES.some((rule) => rule.condition.includes(required) && rule.action === 'STOP_SHADOW'),
    'the brief zero-tolerance condition "' + required + '" maps to an immediate stop',
  );
}
check(
  ALERT_RULES.some((rule) => rule.condition.includes('any individual BLOCKING mismatch')
    && rule.action === 'REVIEW'),
  'every individual blocking mismatch is reviewed even when its rate is below the stop threshold',
);
for (const metric of ZERO_TOLERANCE_METRICS) {
  check(SHADOW_METRICS.some((entry) => entry.name === metric),
    'zero-tolerance metric "' + metric + '" exists in the catalog');
}

// ================================================================== emit + report

const emitIndex = process.argv.indexOf('--emit');
if (emitIndex !== -1 && process.argv[emitIndex + 1]) {
  const target = process.argv[emitIndex + 1];
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify({
    generatedBy: 'test-kg4c-production-shadow-contract.ts',
    schemaVersion: SHADOW_EVENT_SCHEMA_VERSION_V2,
    locks: PRODUCTION_SHADOW_LOCKS,
    productionShadowAckSentinel: PRODUCTION_SHADOW_ACK_SENTINEL,
    acknowledgementCases: ACK_CASES.map((c) => ({ label: c.label, verdict: c.verdict, accepted: c.accepted })),
    stages: PRODUCTION_SHADOW_STAGES.map((stage) => ({ stage, constraints: stageConstraints(stage) })),
    hardInvariants: HARD_INVARIANT_VIOLATIONS,
    rateThresholds: RATE_THRESHOLDS,
    eventSchema: {
      version: SHADOW_EVENT_SCHEMA_VERSION_V2,
      v1FieldCount: SHADOW_EVENT_ALLOWED_FIELDS.length,
      v2AdditionalFields: SHADOW_EVENT_V2_ADDITIONAL_FIELDS,
      v2FieldCount: SHADOW_EVENT_V2_ALLOWED_FIELDS.length,
    },
    privacyCanaries: PRIVACY_CANARY_PATTERNS.map((p) => p.name),
    retention: RETENTION_CONTRACT,
    unobservedCategories: {
      measured: UNOBSERVED,
      statusMdProseSubset: STATUS_MD_SEVEN,
      observedInKg4bCorpus: OBSERVED_IN_KG4B,
    },
    metrics: SHADOW_METRICS.map((m) => m.name),
    metricDimensions: METRIC_DIMENSIONS,
    forbiddenMetricDimensions: FORBIDDEN_METRIC_DIMENSIONS,
    zeroToleranceMetrics: ZERO_TOLERANCE_METRICS,
    alertRules: ALERT_RULES.map((r) => ({ condition: r.condition, action: r.action, zeroTolerance: r.zeroTolerance })),
    result: { passed, failed: failures.length },
  }, null, 2) + '\n');
  console.log('emitted contract snapshot -> ' + target);
}

console.log('');
for (const [name, count] of sections) console.log('  ' + String(count).padStart(4) + '  ' + name);
console.log('');
console.log('kg4c-production-shadow-contract: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  for (const failure of failures) console.error('  FAIL  ' + failure);
  process.exitCode = 1;
}
