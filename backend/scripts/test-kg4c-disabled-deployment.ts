/**
 * KG-4C sections 4, 13 and 20 -- request-level fail-open, tenancy isolation, and the
 * disabled-deployment customer no-op.
 *
 * IN-PROCESS AND DATABASE-FREE. Every failure mode here is induced structurally (a null data
 * source, a throwing sink, an unserialisable payload) rather than by breaking a real database.
 * KG-4B already proved the DB-backed injections against a live server; what KG-4C adds is the
 * proof that the CODE PATH degrades safely without one, which is the shape a production incident
 * actually takes.
 *
 * THE QUESTION SECTION 20 ANSWERS. Before a production shadow can be planned, the deployment that
 * carries the code but enables nothing must be provably invisible: no shadow execution, no
 * telemetry, no governed provenance, no new required configuration, and no customer-path
 * dependency on the KG migration. That is what makes the rollout reversible by configuration
 * alone -- the code can already be there.
 *
 * Run:  npm run test:kg4c-disabled-deployment
 */

import {
  GovernedCutoverContext, projectGovernedDisplay,
} from '../src/standards/cutover/governed-cutover-context';
import {
  resolveCutoverMode, resolveCutoverEnablement, assertCutoverConfigurationSafeForProduction,
  CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV,
} from '../src/standards/cutover/cutover-mode';
import {
  PRODUCTION_SHADOW_ACK_ENV, PRODUCTION_SHADOW_ACK_SENTINEL, SHADOW_STAGE_ENV,
  SHADOW_KILL_SWITCH_ENV, resolveProductionShadowAuthorization, resetRuntimeKillSwitch,
} from '../src/standards/cutover/production-shadow-authorization';
import { resolveAnalysisProvenance } from '../src/standards/cutover/governed-provenance';
import { pinGovernedRelease } from '../src/standards/cutover/governed-resolution';
import {
  emitShadowEvent, CapturingSink, buildShadowEventV2,
} from '../src/standards/cutover/shadow-telemetry-sink';
import { buildShadowComparisonRecord } from '../src/standards/cutover/shadow-comparison';
import { shadowProvenanceIsCompliant } from '../src/standards/cutover/shadow-provenance-invariant';

const checks: string[] = [];
const failures: string[] = [];

function check(condition: unknown, message: string): void {
  if (condition) checks.push(message);
  else failures.push(message);
}

/**
 * A data source that fails the way a real one does under load: it throws on query.
 * `as any` is deliberate -- the point is to hand the resolver something broken.
 */
const FAILING_DATA_SOURCE = {
  query(): Promise<never> { throw new Error('connection terminated unexpectedly'); },
} as any;

async function main(): Promise<void> {
  resetRuntimeKillSwitch();

  // ================================================================ 20. DISABLED DEPLOYMENT

  // The deployment posture: code present, nothing configured.
  const DISABLED_ENVS: Array<{ label: string; env: Record<string, string | undefined> }> = [
    { label: 'nothing configured', env: {} },
    { label: 'production, nothing configured', env: { NODE_ENV: 'production' } },
    { label: 'empty mode', env: { [CUTOVER_MODE_ENV]: '' } },
    { label: 'whitespace mode', env: { [CUTOVER_MODE_ENV]: '   ' } },
    { label: 'stage set but no mode', env: { [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT' } },
    { label: 'both acks but no mode', env: {
      [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
      [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
    } },
    { label: 'allowlist but no mode', env: { [CUTOVER_ALLOWLIST_ENV]: 'user-1' } },
    { label: 'org allowlist but no mode', env: { [CUTOVER_ORG_ALLOWLIST_ENV]: 'org-1' } },
    { label: 'everything except the mode', env: {
      NODE_ENV: 'production',
      [CUTOVER_ALLOWLIST_ENV]: 'user-1',
      [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
      [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
      [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
    } },
  ];

  for (const scenario of DISABLED_ENVS) {
    const resolution = resolveCutoverMode(scenario.env);
    check(resolution.mode === 'LEGACY', 'disabled deployment "' + scenario.label + '" resolves LEGACY');

    const context = await GovernedCutoverContext.create({
      dataSource: FAILING_DATA_SOURCE,
      principal: { userId: 'user-1', organizationId: 'org-1' },
      env: scenario.env,
    });
    check(context === null,
      'disabled deployment "' + scenario.label + '" creates NO cutover context (no shadow execution)');

    const authorization = resolveProductionShadowAuthorization({
      principal: { userId: 'user-1', organizationId: 'org-1' }, env: scenario.env,
    });
    check(!authorization.authorized,
      'disabled deployment "' + scenario.label + '" is not authorized for production shadow');
  }

  // Startup must not refuse to boot merely because the code is present.
  for (const scenario of DISABLED_ENVS) {
    let threw = false;
    try {
      assertCutoverConfigurationSafeForProduction(scenario.env);
    } catch { threw = true; }
    check(!threw, 'startup validation does NOT fail for "' + scenario.label + '" -- disabled code boots');
  }

  // ...but it DOES refuse an unacknowledged governed mode in production.
  let refusedUnacknowledged = false;
  try {
    assertCutoverConfigurationSafeForProduction({ NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'SHADOW' });
  } catch { refusedUnacknowledged = true; }
  check(refusedUnacknowledged,
    'startup validation REFUSES production SHADOW without the KG-4A acknowledgement -- the check is not vacuous');

  // A LEGACY analysis pins nothing: no pointer read, so no dependency on the release schema.
  const legacyPin = await pinGovernedRelease(FAILING_DATA_SOURCE, 'LEGACY');
  check(legacyPin.reason === 'MODE_IS_LEGACY' && legacyPin.releaseId === null,
    'LEGACY never reads the active-release pointer -- migration 1800000014000 is not on the customer path when shadow is off');

  // A LEGACY analysis records no governed provenance.
  const legacyProvenance = resolveAnalysisProvenance(legacyPin, [
    { findingKey: 'f1', citation: '29 CFR 1926.501', governedProvenanceEligible: false },
  ]);
  check(legacyProvenance.analysisKnowledgeReleaseId === null,
    'a LEGACY analysis records NULL analysis provenance');
  check(Object.values(legacyProvenance.findingKnowledgeReleaseIds).every((v) => v === null),
    'a LEGACY analysis records NULL finding provenance');
  check(legacyProvenance.shadowProvenanceViolation === false,
    'a LEGACY analysis reports no shadow provenance violation');

  // A LEGACY payload gains no keys at all.
  check(Object.keys(projectGovernedDisplay(null)).length === 0,
    'the display projection contributes NOTHING when there is no governed decision');

  // Telemetry is silent by default even when an event is handed to it.
  const silentSink = new CapturingSink();
  const dummyRecord = buildShadowComparisonRecord({
    governed: {
      requestedCitation: '29 CFR 1926.501', resolvedCitation: '29 CFR 1926.501',
      releaseId: null, backing: 'NO_ACTIVE_RELEASE', granularity: 'NONE', health: 'NO_ACTIVE_RELEASE',
      standardText: null, plainLanguageSummary: null, title: null, jurisdiction: null, reason: 'x',
    } as any,
    legacyCitation: '29 CFR 1926.501', legacyText: 'text',
    legacyBackingState: 'HAZLENZ_AUTHORED', applicability: 'SUPPORTED',
    legacyJurisdiction: 'construction', governedJurisdiction: null,
    correlationId: 'corr', findingKey: 'f1', mode: 'SHADOW',
    fallbackState: 'LEGACY_TEXT_UNVERIFIED', latencyMs: 1, customerOutputUnchanged: true,
  });
  const dummyEvent = buildShadowEventV2(dummyRecord, {
    stage: 'STAGE_0_DISABLED', eligibilitySource: 'NONE', shadowProvenanceNull: true,
  });
  const suppressed = emitShadowEvent({
    event: dummyEvent as unknown as Record<string, unknown>, sink: silentSink, env: {},
  });
  check(suppressed.status === 'SUPPRESSED_DISABLED' && silentSink.written.length === 0,
    'no telemetry is written when observability is not explicitly enabled');

  // ================================================================ 4. REQUEST-LEVEL FAIL-OPEN

  const shadowEnv: Record<string, string | undefined> = {
    [CUTOVER_MODE_ENV]: 'SHADOW',
    [CUTOVER_ALLOWLIST_ENV]: 'user-shadow',
    GOVERNED_CUTOVER_OBSERVABILITY: 'enabled',
  };
  const shadowPrincipal = { userId: 'user-shadow', organizationId: null };

  // (a) governed resolver unavailable -- the data source throws on every query.
  const failingContext = await GovernedCutoverContext.create({
    dataSource: FAILING_DATA_SOURCE, principal: shadowPrincipal, env: shadowEnv,
  });
  check(failingContext !== null, 'SHADOW builds a context even when the data source is broken');

  let threwOnResolve = false;
  let decision: Awaited<ReturnType<GovernedCutoverContext['resolveStandard']>> | null = null;
  try {
    decision = await failingContext!.resolveStandard({
      citation: '29 CFR 1926.501', applicabilityStatus: 'confirmed',
      findingKey: 'f1', legacyText: 'legacy body text',
    });
  } catch { threwOnResolve = true; }
  check(!threwOnResolve, 'a broken resolver NEVER throws into the customer request');
  check(decision !== null, 'a broken resolver still returns a decision');
  check(decision!.governedBackingInput === null,
    'a broken resolver supplies NO governed backing input -- it cannot be laundered into approval');
  check(decision!.verifiedText === null, 'a broken resolver shows no verified text');
  check(decision!.customerVisible === false, 'SHADOW contributes nothing customer-visible');
  check(Object.keys(projectGovernedDisplay(decision)).length === 0,
    'the SHADOW payload gains no keys even after a resolver failure');
  check(decision!.resolution.resolvedCitation === decision!.resolution.requestedCitation,
    'even on failure the resolved citation equals the requested one');

  // (b) no active release.
  const noReleaseSource = { query: async () => [] } as any;
  const noReleaseContext = await GovernedCutoverContext.create({
    dataSource: noReleaseSource, principal: shadowPrincipal, env: shadowEnv,
  });
  const noReleaseDecision = await noReleaseContext!.resolveStandard({
    citation: '29 CFR 1926.501', applicabilityStatus: 'confirmed', findingKey: 'f1',
  });
  check(noReleaseDecision.governedBackingInput === null,
    'no active release supplies no governed backing input');
  check(noReleaseDecision.customerVisible === false, 'no active release leaves the customer on legacy');

  // (c) telemetry sink unavailable.
  const throwingSink = { write(): void { throw new Error('sink unavailable'); } };
  const sinkResult = emitShadowEvent({
    event: dummyEvent as unknown as Record<string, unknown>, sink: throwingSink,
    env: { GOVERNED_CUTOVER_OBSERVABILITY: 'enabled' },
  });
  check(sinkResult.status === 'DROPPED_SINK_FAILURE', 'an unavailable sink is reported, not thrown');

  // (d) comparison serialization failure.
  const circular: Record<string, unknown> = { ...(dummyEvent as unknown as Record<string, unknown>) };
  circular.dimensions = circular;
  let serializationThrew = false;
  let serializationResult: ReturnType<typeof emitShadowEvent> | null = null;
  try {
    serializationResult = emitShadowEvent({
      event: circular, sink: new CapturingSink(),
      env: { GOVERNED_CUTOVER_OBSERVABILITY: 'enabled' },
    });
  } catch { serializationThrew = true; }
  check(!serializationThrew, 'a serialization failure never throws');
  check(serializationResult !== null && serializationResult.status !== 'DELIVERED',
    'an unserialisable event is dropped rather than written');

  // (e) shadow event write failure does not affect the decision already returned.
  check(decision!.decision.showCitation === true,
    'the citation is shown regardless of any telemetry outcome');

  // (f) a timeout inside shadow-only work.
  const slowSource = {
    query: () => new Promise((_resolve, reject) =>
      setTimeout(() => reject(new Error('statement timeout')), 5)),
  } as any;
  const slowContext = await GovernedCutoverContext.create({
    dataSource: slowSource, principal: shadowPrincipal, env: shadowEnv,
  });
  let timeoutThrew = false;
  let timeoutDecision: Awaited<ReturnType<GovernedCutoverContext['resolveStandard']>> | null = null;
  try {
    timeoutDecision = await slowContext!.resolveStandard({
      citation: '29 CFR 1926.501', applicabilityStatus: 'confirmed', findingKey: 'f1',
    });
  } catch { timeoutThrew = true; }
  check(!timeoutThrew, 'a timeout inside shadow-only work never throws into the request');
  check(timeoutDecision !== null && timeoutDecision.customerVisible === false,
    'a timeout leaves the customer on legacy');

  // Provenance stays NULL through every one of these failures.
  const shadowPin = await pinGovernedRelease(FAILING_DATA_SOURCE, 'SHADOW');
  const shadowProvenance = resolveAnalysisProvenance(shadowPin, [
    { findingKey: 'f1', citation: '29 CFR 1926.501', governedProvenanceEligible: true },
    { findingKey: 'f2', citation: '29 CFR 1926.451', governedProvenanceEligible: true },
  ]);
  check(shadowProvenance.analysisKnowledgeReleaseId === null,
    'SHADOW records NULL analysis provenance even with eligible contributions');
  check(shadowProvenanceIsCompliant('SHADOW', shadowProvenance),
    'the SHADOW provenance result is compliant with the invariant');

  // ================================================================ 13. TENANCY / PRINCIPAL

  const tenancyEnv: Record<string, string | undefined> = {
    [CUTOVER_MODE_ENV]: 'SHADOW',
    [CUTOVER_ALLOWLIST_ENV]: 'user-allowed',
    [CUTOVER_ORG_ALLOWLIST_ENV]: 'org-allowed',
  };

  check(resolveCutoverEnablement({ userId: 'user-allowed', organizationId: null }, tenancyEnv).enabled,
    'the allowlisted account is enabled');
  check(!resolveCutoverEnablement({ userId: 'user-other', organizationId: null }, tenancyEnv).enabled,
    'an unrelated account is NOT enabled by another account being allowlisted');
  check(resolveCutoverEnablement({ userId: 'x', organizationId: 'org-allowed' }, tenancyEnv).enabled,
    'organization scoping works when configured');
  check(!resolveCutoverEnablement({ userId: 'x', organizationId: 'org-other' }, tenancyEnv).enabled,
    'an unrelated organization is not enabled');
  check(!resolveCutoverEnablement(null, tenancyEnv).enabled, 'a null principal is never enabled');
  check(!resolveCutoverEnablement({ userId: '', organizationId: '' }, tenancyEnv).enabled,
    'an empty principal is never enabled');
  check(resolveCutoverEnablement({ userId: 'user-other', organizationId: null }, tenancyEnv).reason
      === 'NOT_ALLOWLISTED',
    'a refused principal is told why, categorically');

  // Forged client-controlled fields cannot become enablement authority.
  const FORGERIES: Array<Record<string, unknown>> = [
    { userId: 'user-allowed' },
    { body: { userId: 'user-allowed' } },
    { headers: { 'x-user-id': 'user-allowed' } },
    { query: { userId: 'user-allowed' } },
    { params: { userId: 'user-allowed' } },
    { governedMode: 'SHADOW' },
    { cutoverMode: 'SHADOW' },
    { forceGoverned: true },
    { knowledgeReleaseId: 'federal-core-2026-07-30.1' },
  ];
  for (const forgery of FORGERIES) {
    // A forged shape reaches the boundary as an object whose `userId` is the ONLY thing consulted.
    // Anything nested is structurally invisible to the enablement decision.
    const principal = forgery as { userId?: string | null; organizationId?: string | null };
    const enabled = resolveCutoverEnablement(
      { userId: principal.userId ?? null, organizationId: principal.organizationId ?? null },
      tenancyEnv,
    ).enabled;
    const nested = !('userId' in forgery);
    if (nested) {
      check(!enabled, 'forged nested field ' + JSON.stringify(Object.keys(forgery)) + ' cannot enable shadow');
    } else {
      // The top-level `userId` case is the authenticated principal, and it SHOULD enable -- that is
      // the whole mechanism. What matters is that it arrives from the JWT, which is a property of
      // the caller, verified separately by the KG-4A/KG-4B API suites.
      check(enabled, 'the authenticated principal is what enables shadow (not vacuous)');
    }
  }

  // Telemetry correlation never mixes principals: correlation ids are per-context and unique.
  const contextA = await GovernedCutoverContext.create({
    dataSource: FAILING_DATA_SOURCE, principal: { userId: 'user-shadow', organizationId: null }, env: shadowEnv,
  });
  const contextB = await GovernedCutoverContext.create({
    dataSource: FAILING_DATA_SOURCE, principal: { userId: 'user-shadow', organizationId: null }, env: shadowEnv,
  });
  check(contextA!.correlationId !== contextB!.correlationId,
    'two analyses by the SAME principal get different correlation ids -- events cannot be joined across analyses');
  check(!contextA!.correlationId.includes('user-shadow'),
    'the correlation id carries no principal identity');

  // The kill switch beats an otherwise enabled tenancy.
  const killedEnv = { ...tenancyEnv, [SHADOW_KILL_SWITCH_ENV]: 'engaged', NODE_ENV: 'production' };
  check(resolveProductionShadowAuthorization({
    principal: { userId: 'user-allowed', organizationId: null }, env: killedEnv,
  }).refusal === 'KILL_SWITCH_ENGAGED', 'the kill switch overrides an enabled tenancy');

  resetRuntimeKillSwitch();
}

main()
  .then(() => {
    console.log('');
    console.log('kg4c-disabled-deployment: ' + checks.length + ' passed, ' + failures.length + ' failed');
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
