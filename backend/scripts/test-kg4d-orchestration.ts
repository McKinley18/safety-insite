/**
 * KG-4D -- the request-path orchestration contract.
 *
 * IN-PROCESS. It drives `orchestrateShadowRequest()` directly with a synthetic pipeline closure, so
 * every branch -- including ones that are hard to provoke over HTTP, like a mutated shadow payload
 * or a latched breaker -- is exercised deterministically. The real-HTTP suite
 * (`test:kg4d-integration-e2e`) proves the same properties through the actual server; this one
 * proves the decision logic.
 *
 * Covers KG-4D phases 2 (authorization), 3 (default legacy), 4 (shadow execution),
 * 5 (invariance), 8 (telemetry fail-open), 9 (metrics), 10 (breaker), 11 (kill switch).
 *
 * Run:  npm run test:kg4d-orchestration
 */

import {
  orchestrateShadowRequest, resetShadowBreakerWindow, shadowBreakerObservation,
} from '../src/standards/cutover/shadow-request-orchestration';
import {
  CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV,
} from '../src/standards/cutover/cutover-mode';
import {
  PRODUCTION_SHADOW_ACK_ENV, PRODUCTION_SHADOW_ACK_SENTINEL, SHADOW_STAGE_ENV,
  SHADOW_KILL_SWITCH_ENV, resetRuntimeKillSwitch, resolveKillSwitch,
} from '../src/standards/cutover/production-shadow-authorization';
import { shadowMetrics } from '../src/standards/cutover/shadow-operational-metrics';
import { CapturingSink } from '../src/standards/cutover/shadow-telemetry-sink';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';

const checks: string[] = [];
const failures: string[] = [];
function check(condition: unknown, message: string): void {
  if (condition) checks.push(message); else failures.push(message);
}
function eq(actual: unknown, expected: unknown, message: string): void {
  check(actual === expected, message + ' (expected ' + String(expected) + ', got ' + String(actual) + ')');
}

/** A data source with one approved record, enough for the resolver to produce a real comparison. */
function fakeDataSource(rows: unknown[] = []) {
  return {
    query: async (sql: string) => {
      if (/regulatory_releases/.test(sql)) {
        return [{ releaseId: 'kg4d-release.1', manifestChecksum: 'abc123' }];
      }
      return rows;
    },
  } as any;
}

const PRINCIPAL = { userId: 'user-shadow', organizationId: null };

function shadowEnv(over: Record<string, string | undefined> = {}) {
  return {
    [CUTOVER_MODE_ENV]: 'SHADOW',
    [CUTOVER_ALLOWLIST_ENV]: 'user-shadow',
    GOVERNED_CUTOVER_OBSERVABILITY: 'enabled',
    ...over,
  } as Record<string, string | undefined>;
}

/**
 * Drives the REAL governed resolver when a context is present, so the shadow branch produces
 * genuine comparison records. Without this the pipeline closure would never call
 * `resolveStandard()`, no events would exist, and every telemetry assertion below would pass
 * vacuously -- the KG-4B "throttled run that passed because it compared two errors" failure mode.
 */
async function driveResolver(ctx: GovernedCutoverContext | null): Promise<void> {
  if (!ctx) return;
  await ctx.resolveStandard({
    citation: '29 CFR 1926.501', applicabilityStatus: 'confirmed',
    findingKey: 'finding-1', legacyText: 'Each employee on a walking/working surface shall be protected.',
    legacyCitation: '29 CFR 1926.501', legacyBackingState: 'HAZLENZ_AUTHORED',
    hazardFamily: 'fall protection', jurisdiction: 'construction',
  });
}

/** The customer-visible payload shape, close enough to the real one to exercise the hash. */
const LEGACY_PAYLOAD = {
  traceId: 'trace-fixed',
  standards: [
    { citation: '29 CFR 1926.501', title: 'Duty to have fall protection', confidence: 'High', backingStatus: 'HAZLENZ_AUTHORED' },
    { citation: '29 CFR 1926.451', title: 'Scaffolds', confidence: 'Medium', backingStatus: 'HAZLENZ_AUTHORED' },
  ],
};

function reset(): void {
  resetRuntimeKillSwitch();
  resetShadowBreakerWindow();
  shadowMetrics.reset();
}

async function main(): Promise<void> {
  // ================================================================ 3. DEFAULT LEGACY

  reset();
  {
    let calls = 0;
    let sawContext = false;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: {},
      runPipeline: async (ctx) => { calls += 1; if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    eq(calls, 1, 'LEGACY runs the customer pipeline exactly ONCE');
    check(!sawContext, 'LEGACY never constructs a cutover context');
    eq(result.outcome, 'LEGACY_NO_CONTEXT', 'LEGACY reports LEGACY_NO_CONTEXT');
    check(result.payload === LEGACY_PAYLOAD, 'LEGACY returns the pipeline payload by identity -- untouched');
    eq(result.invariance, null, 'LEGACY runs no invariance comparison');
    eq(result.comparisons, 0, 'LEGACY produces no shadow comparisons');
    eq(result.telemetry.attempted, 0, 'LEGACY emits no telemetry');
    eq(shadowMetrics.get('shadow_eligible_requests'), 0, 'LEGACY is not counted as shadow-eligible');
  }

  for (const bad of [
    { label: 'malformed mode', env: { [CUTOVER_MODE_ENV]: 'SHADOW_MODE' } },
    { label: 'truthy mode', env: { [CUTOVER_MODE_ENV]: 'true' } },
    { label: 'numeric mode', env: { [CUTOVER_MODE_ENV]: '1' } },
    { label: 'allowlist only', env: { [CUTOVER_ALLOWLIST_ENV]: 'user-shadow' } },
    { label: 'org allowlist only', env: { [CUTOVER_ORG_ALLOWLIST_ENV]: 'org-1' } },
    { label: 'acks only', env: {
      [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
      [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL } },
    { label: 'stage only', env: { [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT' } },
    { label: 'SHADOW without allowlist', env: { [CUTOVER_MODE_ENV]: 'SHADOW' } },
  ]) {
    reset();
    let sawContext = false;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: bad.env,
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    check(!sawContext, 'default-off "' + bad.label + '" creates no context');
    eq(result.outcome, 'LEGACY_NO_CONTEXT', 'default-off "' + bad.label + '" stays LEGACY');
  }

  // ================================================================ 4. SHADOW EXECUTION

  reset();
  {
    const sink = new CapturingSink();
    let calls = 0;
    const contexts: Array<GovernedCutoverContext | null> = [];
    const pristineFlags: boolean[] = [];
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink,
      runPipeline: async (ctx, opts) => { calls += 1; contexts.push(ctx); pristineFlags.push(opts.pristine); await driveResolver(ctx); return LEGACY_PAYLOAD; },
    });
    eq(result.outcome, 'SHADOW_EXECUTED', 'an eligible principal executes SHADOW');
    eq(calls, 4, 'SHADOW runs the pipeline four times (customer, probe A, probe B, shadow)');
    eq(contexts.filter((c) => c === null).length, 3, 'three of the four runs use NO context');
    eq(contexts.filter((c) => c !== null).length, 1, 'exactly one run uses a context');
    eq(pristineFlags[0], true, 'the FIRST run is pristine -- it is the customer payload');
    eq(pristineFlags.slice(1).every((p) => p === false), true,
      'every comparison run operates on a copy, so copy artifacts cancel out');
    check(result.payload === LEGACY_PAYLOAD,
      'SHADOW returns the LEGACY-branch payload -- the governed resolver never touched these bytes');
    check(result.invariance !== null && result.invariance.verdict === 'INVARIANT',
      'an unchanged shadow payload is INVARIANT');
    eq(result.hardViolations.length, 0, 'a clean SHADOW run reports no hard violations');
    check(result.shadowProvenanceNull, 'SHADOW records NULL provenance');
    eq(shadowMetrics.get('shadow_eligible_requests'), 1, 'the eligible request is counted');
    eq(shadowMetrics.get('shadow_executed'), 1, 'the executed shadow is counted');
  }

  // ================================================================ 5. INVARIANCE ENFORCEMENT

  const MUTATIONS: Array<{ label: string; mutate: (p: any) => any }> = [
    { label: 'added null key', mutate: (p) => ({ ...p, standards: p.standards.map((s: any) => ({ ...s, knowledgeReleaseId: null })) }) },
    { label: 'reordered standards', mutate: (p) => ({ ...p, standards: [...p.standards].reverse() }) },
    { label: 'changed character', mutate: (p) => ({ ...p, standards: p.standards.map((s: any, i: number) => i ? s : { ...s, confidence: 'Higi' }) }) },
    { label: 'missing field', mutate: (p) => ({ ...p, standards: p.standards.map(({ confidence, ...rest }: any) => rest) }) },
    { label: 'title difference', mutate: (p) => ({ ...p, standards: p.standards.map((s: any, i: number) => i ? s : { ...s, title: 'Different title' }) }) },
    { label: 'content difference', mutate: (p) => ({ ...p, standards: p.standards.map((s: any, i: number) => i ? s : { ...s, summary: 'governed text' }) }) },
    { label: 'confidence difference', mutate: (p) => ({ ...p, standards: p.standards.map((s: any, i: number) => i ? s : { ...s, confidence: 'Low' }) }) },
    { label: 'truncated list', mutate: (p) => ({ ...p, standards: [p.standards[0]] }) },
    { label: 'extra standard', mutate: (p) => ({ ...p, standards: [...p.standards, { citation: 'X', title: 'Y', confidence: 'High', backingStatus: 'Z' }] }) },
    { label: 'backingStatus upgraded', mutate: (p) => ({ ...p, standards: p.standards.map((s: any, i: number) => i ? s : { ...s, backingStatus: 'APPROVED_GOVERNED_CONTENT' }) }) },
  ];

  for (const mutation of MUTATIONS) {
    reset();
    const sink = new CapturingSink();
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink,
      runPipeline: async (ctx) => { await driveResolver(ctx); return ctx ? mutation.mutate(LEGACY_PAYLOAD) : LEGACY_PAYLOAD; },
    });
    check(result.invariance?.verdict === 'MUTATED',
      'invariance detects "' + mutation.label + '" (got ' + String(result.invariance?.verdict) + ')');
    check(result.hardViolations.includes('CUSTOMER_OUTPUT_MUTATED'),
      '"' + mutation.label + '" raises CUSTOMER_OUTPUT_MUTATED');
    check(result.payload === LEGACY_PAYLOAD,
      'after "' + mutation.label + '" the customer STILL receives the legacy payload');
    eq(result.breakerVerdict?.action, 'STOP_SHADOW', '"' + mutation.label + '" stops shadow');
    check(resolveKillSwitch({}).engaged,
      '"' + mutation.label + '" latches the kill switch through the breaker');
    check(!JSON.stringify(result.invariance).includes('governed text'),
      'the invariance result carries path names only, never differing VALUES');
  }

  // Not vacuous: an identical shadow payload does NOT trip anything.
  reset();
  {
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async () => ({ ...LEGACY_PAYLOAD }),
    });
    eq(result.invariance?.verdict, 'INVARIANT', 'an identical shadow payload is INVARIANT');
    check(!resolveKillSwitch({}).engaged, 'a clean run does NOT latch the kill switch');
  }

  // Genuine per-run volatility is excluded empirically, not by an ignore-list.
  reset();
  {
    let n = 0;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async () => { n += 1; return { ...LEGACY_PAYLOAD, traceId: 'trace-' + n, elapsedMs: n }; },
    });
    eq(result.invariance?.verdict, 'INVARIANT',
      'fields that differ between two LEGACY runs are excluded empirically');
    check((result.invariance?.volatilePathCount ?? 0) >= 2,
      'the derived volatile set contains the genuinely volatile fields');
  }

  // ================================================================ 10. CIRCUIT BREAKER

  reset();
  {
    // Trip it.
    await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async (ctx) => (ctx ? { ...LEGACY_PAYLOAD, injected: true } : LEGACY_PAYLOAD),
    });
    check(shadowBreakerObservation().hardViolations.length > 0, 'the breaker window recorded the violation');

    // The NEXT otherwise-eligible request must run legacy, and the kill switch alone would do that,
    // so clear it to prove the BREAKER is independently sufficient.
    resetRuntimeKillSwitch();
    let sawContext = false;
    const next = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(),
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    eq(next.outcome, 'SHADOW_SKIPPED', 'a latched breaker skips shadow on the next eligible request');
    eq(next.skipReason, 'CIRCUIT_BREAKER_LATCHED', 'the skip names the breaker');
    check(!sawContext, 'a latched breaker creates no context');
    check(next.payload === LEGACY_PAYLOAD, 'the customer path stays available with the breaker latched');

    // A clean request does NOT clear it.
    await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    eq(
      (await orchestrateShadowRequest({
        dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(),
        runPipeline: async () => LEGACY_PAYLOAD,
      })).skipReason,
      'CIRCUIT_BREAKER_LATCHED',
      'a clean request does NOT automatically reset the breaker',
    );

    resetShadowBreakerWindow();
    const recovered = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    eq(recovered.outcome, 'SHADOW_EXECUTED', 'an EXPLICIT reset restores shadow execution');
  }

  // ================================================================ 11. KILL SWITCH

  reset();
  {
    let sawContext = false;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL,
      env: shadowEnv({ [SHADOW_KILL_SWITCH_ENV]: 'engaged' }),
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    eq(result.outcome, 'SHADOW_SKIPPED', 'the kill switch skips shadow');
    eq(result.skipReason, 'KILL_SWITCH_ENGAGED', 'the skip names the kill switch');
    check(!sawContext, 'the kill switch prevents context creation entirely');
    check(result.payload === LEGACY_PAYLOAD, 'the customer path stays available');
  }
  for (const value of ['true', '1', 'off', 'false', '0', 'STOP']) {
    reset();
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL,
      env: shadowEnv({ [SHADOW_KILL_SWITCH_ENV]: value }),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    eq(result.skipReason, 'KILL_SWITCH_ENGAGED', 'kill switch value "' + value + '" suppresses shadow');
  }

  // The kill switch overrides mode, allowlist, acknowledgements and stage together.
  reset();
  {
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL,
      env: shadowEnv({
        NODE_ENV: 'production',
        [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
        [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
        [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
        [SHADOW_KILL_SWITCH_ENV]: 'engaged',
      }),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    eq(result.skipReason, 'KILL_SWITCH_ENGAGED',
      'the kill switch overrides mode + allowlist + both acknowledgements + stage');
  }

  // ================================================================ 2. PRODUCTION LOCKS

  reset();
  {
    // DEFENCE IN DEPTH, and the layering is worth stating because it is not obvious.
    //
    // With NO acknowledgements at all, KG-4A's own production guard inside `resolveCutoverMode()`
    // already forces LEGACY (`PRODUCTION_GUARD_FORCED_LEGACY`), so the request never even reaches
    // the KG-4C gate. The outcome is LEGACY_NO_CONTEXT, which is the SAFER of the two refusals: it
    // is refused one layer earlier.
    let sawContext = false;
    const noAcks = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL,
      env: shadowEnv({ NODE_ENV: 'production' }),
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    eq(noAcks.outcome, 'LEGACY_NO_CONTEXT',
      "production with NO acknowledgements is refused by KG-4A's guard before the KG-4C gate");
    check(!sawContext, 'unauthorized production shadow creates no context');

    // The KG-4C gate is the deciding lock exactly when the KG-4A ack is present and its own is not.
    let sawContext2 = false;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL,
      env: shadowEnv({
        NODE_ENV: 'production',
        [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
        [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
      }),
      runPipeline: async (ctx) => { if (ctx) sawContext2 = true; return LEGACY_PAYLOAD; },
    });
    eq(result.outcome, 'SHADOW_SKIPPED',
      'production with the KG-4A ack but WITHOUT the KG-4C shadow ack skips shadow');
    eq(result.skipReason, 'PRODUCTION_LOCKS_NOT_SATISFIED', 'the skip names the production locks');
    check(!sawContext2, 'a missing KG-4C shadow acknowledgement creates no context');
  }

  reset();
  {
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, sink: new CapturingSink(),
      env: shadowEnv({
        NODE_ENV: 'production',
        [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
        [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
        [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
      }),
      runPipeline: async (ctx) => { await driveResolver(ctx); return LEGACY_PAYLOAD; },
    });
    eq(result.outcome, 'SHADOW_EXECUTED',
      'production WITH all four locks executes shadow -- the gate is not vacuous');
    check(result.payload === LEGACY_PAYLOAD, 'authorized production shadow still returns legacy output');
  }

  // A non-eligible principal on the same server never executes shadow.
  reset();
  {
    let sawContext = false;
    const result = await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: { userId: 'someone-else', organizationId: null },
      env: shadowEnv(),
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return LEGACY_PAYLOAD; },
    });
    eq(result.outcome, 'LEGACY_NO_CONTEXT', 'a non-eligible principal on a SHADOW server stays LEGACY');
    check(!sawContext, 'no eligibility bleed between principals');
  }

  // ================================================================ 8. TELEMETRY FAIL-OPEN

  for (const failure of [
    { label: 'sink throws', sink: { write(): void { throw new Error('sink down'); } } },
    { label: 'sink timeout-ish throw', sink: { write(): void { throw Object.assign(new Error('ETIMEDOUT'), { name: 'TimeoutError' }); } } },
  ]) {
    reset();
    let threw = false;
    let result: Awaited<ReturnType<typeof orchestrateShadowRequest>> | null = null;
    try {
      result = await orchestrateShadowRequest({
        dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: failure.sink,
        runPipeline: async (ctx) => { await driveResolver(ctx); return LEGACY_PAYLOAD; },
      });
    } catch { threw = true; }
    check(!threw, 'telemetry failure "' + failure.label + '" never throws into the request');
    check(result?.payload === LEGACY_PAYLOAD,
      'telemetry failure "' + failure.label + '" still returns the customer payload');
    check((result?.telemetry.dropped ?? 0) > 0,
      'telemetry failure "' + failure.label + '" is COUNTED, not swallowed');
  }

  // A pipeline that throws in the shadow branch must not break the customer.
  reset();
  {
    let threw = false;
    let result: Awaited<ReturnType<typeof orchestrateShadowRequest>> | null = null;
    try {
      let call = 0;
      result = await orchestrateShadowRequest({
        dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(),
        runPipeline: async (ctx) => {
          call += 1;
          if (ctx) throw new Error('shadow branch exploded');
          return LEGACY_PAYLOAD;
        },
      });
    } catch { threw = true; }
    check(!threw, 'a throwing SHADOW branch never throws into the request');
    eq(result?.outcome, 'SHADOW_SKIPPED', 'a throwing shadow branch is reported as skipped');
    eq(result?.skipReason, 'SHADOW_EXECUTION_FAILED', 'the skip names the shadow failure');
    check(result?.payload === LEGACY_PAYLOAD, 'the customer still receives the legacy payload');
  }

  // A broken data source is a shadow-only fault.
  reset();
  {
    const brokenSource = { query() { throw new Error('connection terminated'); } } as any;
    const result = await orchestrateShadowRequest({
      dataSource: brokenSource, principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    check(result.payload === LEGACY_PAYLOAD, 'a broken data source leaves the customer payload intact');
    check(result.outcome === 'SHADOW_EXECUTED' || result.outcome === 'SHADOW_SKIPPED',
      'a broken data source produces a defined outcome, never a throw');
  }

  // ================================================================ 9. METRICS

  reset();
  {
    for (let i = 0; i < 3; i += 1) {
      await orchestrateShadowRequest({
        dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
        runPipeline: async () => LEGACY_PAYLOAD,
      });
    }
    eq(shadowMetrics.get('shadow_eligible_requests'), 3, 'three eligible requests are counted once each');
    eq(shadowMetrics.get('shadow_executed'), 3, 'three executions are counted once each');
    check(shadowMetrics.get('shadow_executed') <= shadowMetrics.get('shadow_eligible_requests'),
      'executed never exceeds eligible');

    const snapshot = shadowMetrics.snapshot();
    const serialized = JSON.stringify(snapshot);
    for (const forbidden of ['user-shadow', 'correlationId', 'userId', 'organizationId', 'findingKey']) {
      check(!serialized.includes(forbidden),
        'the metrics snapshot carries no "' + forbidden + '" dimension');
    }
    check(typeof snapshot.shadow_overhead_p50_ms === 'number', 'the snapshot exposes p50 latency');
    check(typeof snapshot.shadow_overhead_p95_ms === 'number', 'the snapshot exposes p95 latency');
  }

  // One analysis must not overcount, even with several findings on the same citation.
  reset();
  {
    await orchestrateShadowRequest({
      dataSource: fakeDataSource(), principal: PRINCIPAL, env: shadowEnv(), sink: new CapturingSink(),
      runPipeline: async () => LEGACY_PAYLOAD,
    });
    eq(shadowMetrics.get('shadow_eligible_requests'), 1,
      'one analysis counts as one eligible request regardless of internal resolver steps');
    eq(shadowMetrics.get('shadow_executed'), 1, 'one analysis counts as one execution');
  }

  reset();
}

main()
  .then(() => {
    console.log('');
    console.log('kg4d-orchestration: ' + checks.length + ' passed, ' + failures.length + ' failed');
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
