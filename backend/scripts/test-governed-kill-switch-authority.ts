// GOVERNED-CUTOVER EMERGENCY-STOP AUTHORITY — THE REPAIRED CONTRACT.
//
//   npm run test:governed-kill-switch-authority
//
// WHAT THIS PROTECTS. `GOVERNED_CUTOVER_KILL_SWITCH` is the primary emergency stop for the bounded
// customer governed cutover. Before 2026-08-29 it stopped governed DELIVERY (it was consulted
// inside `orchestrateShadowRequest()`) and did not stop governed AUTHORITY: the controller's
// release binding and the persistence provenance gate both read
// `resolveCutoverEnablement(...).effectiveMode`, which still reported `GOVERNED_WITH_FALLBACK`
// with the switch engaged, so a NEW inspection was still bound to the active release and
// `inspection.knowledgeReleaseId` was still written — write-once, so it outlived the incident.
// The pre-repair measurement is frozen in
// `verification/insite-v1-governed-kill-switch-authority-repair-2026-08-29/transcripts/`.
//
// THE NINE-POINT CONTRACT this suite exists to keep true. With the source-defined kill-switch value
// engaged:
//
//   1. no NEW customer request may become governed;
//   2. cutover enablement resolves to an explicit safe inactive result BEFORE any active-release
//      lookup is authoritative;
//   3. no NEW inspection may bind to the active governed release;
//   4. no NEW `inspection.knowledgeReleaseId` may be assigned because of governed cutover;
//   5. governed release-scoped standards may not become customer authority for that request;
//   6. shadow/governed delivery stops, as it already did;
//   7. non-allowlisted behaviour remains legacy;
//   8. boot safety remains deterministic — the brake is NOT consent to boot a malformed config;
//   9. releasing the switch restores the configured bounded rollout with no configuration or
//      database rewrite.
//
// AND THE LIMIT THAT MAKES IT SAFE TO USE: it does NOT falsify history. An inspection bound before
// the stop keeps its write-once release id. The brake blocks NEW binding and NEW delivery.
//
// EVERY SECTION CARRIES ITS OWN POSITIVE CONTROL, so the suite cannot pass by governance being
// globally inert — which is how a default-off subsystem silently passes an emergency-stop test.
//
// NO DATABASE. NO NETWORK. NO PROVIDER CALL. NO `DATABASE_URL`.

import {
  ACTIVE_RELEASE, HISTORICAL_RELEASE, ALLOWLISTED_USER, ALLOWLISTED_ORG,
  ALLOWLISTED_PRINCIPAL, NON_ALLOWLISTED_PRINCIPAL,
  governedProductionEnv, killedEnv, inspectionFixture, recorder, withProcessEnv,
  CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV,
  CUTOVER_PRODUCTION_ACK_ENV, SHADOW_KILL_SWITCH_ENV,
  type Env,
} from './lib/kill-switch-fixture';
import {
  resolveCutoverEnablement, resolveCutoverMode, modeInfluencesCustomerOutput,
  assertCutoverConfigurationSafeForProduction, GOVERNED_CUTOVER_MODES,
} from '../src/standards/cutover/cutover-mode';
import {
  CUTOVER_KILL_SWITCH_ENV, engageRuntimeKillSwitch, resetRuntimeKillSwitch, resolveKillSwitch,
} from '../src/standards/cutover/cutover-kill-switch';
import {
  SHADOW_KILL_SWITCH_ENV as REEXPORTED_ENV,
  resolveKillSwitch as reexportedResolve,
  resetRuntimeKillSwitch as reexportedReset,
  resolveProductionShadowAuthorization, PRODUCTION_SHADOW_ACK_ENV, PRODUCTION_SHADOW_ACK_SENTINEL,
  SHADOW_STAGE_ENV,
} from '../src/standards/cutover/production-shadow-authorization';
import { resolveInspectionReleaseBinding, readInspectionReleaseBinding }
  from '../src/standards/releases/inspection-release-binding';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { orchestrateShadowRequest, resetShadowBreakerWindow }
  from '../src/standards/cutover/shadow-request-orchestration';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';

const r = recorder();

/** An approved member of the active release. */
const APPROVED = '29 CFR 1910.147';
/** One of the 8 records the reviewer ledger disposed REJECT_CORRECTION_REQUIRED. */
const REJECTED = '1910.219';

const RELEASE_RECORDS = [
  { citation: APPROVED, effectiveState: 'reviewer_approved' },
  { citation: REJECTED, effectiveState: 'reject_correction_required' },
];

const FRESH = 'inspection-fresh';
const ALREADY_BOUND = 'inspection-already-bound';

/** The exact shape the controller uses: `resolveCutoverEnablement(principal).effectiveMode`. */
async function bindingUnder(env: Env, inspectionId: string, inspections: Record<string, string | null>) {
  return withProcessEnv(env, async () => {
    const fixture = inspectionFixture({ inspections, records: RELEASE_RECORDS });
    const mode = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL).effectiveMode;
    const binding = await resolveInspectionReleaseBinding({
      dataSource: fixture.dataSource, inspectionId, mode,
    });
    return { fixture, mode, binding };
  });
}

async function main() {
  resetRuntimeKillSwitch();
  resetShadowBreakerWindow();

  // ================================================================ 1. ONE SWITCH, ONE LATCH
  //
  // The emergency stop moved from `production-shadow-authorization.ts` to `cutover-kill-switch.ts`
  // so `cutover-mode.ts` could consult it without a circular import. The move must not have created
  // a SECOND latch: an operator who resets one and leaves the other engaged has no emergency stop
  // at all, only the illusion of one.
  console.log('\n== 1. the emergency stop is one variable, one module, one latch ==');
  r.eq(CUTOVER_KILL_SWITCH_ENV, 'GOVERNED_CUTOVER_KILL_SWITCH',
    'the canonical env var name is unchanged by the move');
  r.eq(REEXPORTED_ENV, CUTOVER_KILL_SWITCH_ENV,
    'the KG-4C name SHADOW_KILL_SWITCH_ENV is an alias, not a second variable');
  r.eq(reexportedResolve, resolveKillSwitch,
    'the re-export is the SAME function, so there is one interpretation of the variable');
  r.eq(reexportedReset, resetRuntimeKillSwitch,
    'the re-export is the SAME reset, so one reset clears the one latch');

  // The brake is permissive by design, and that is a safety property, not a convenience.
  for (const value of ['engaged', 'true', '1', 'yes', 'STOP', 'off', 'false', '0', 'please stop']) {
    r.check(resolveKillSwitch({ [CUTOVER_KILL_SWITCH_ENV]: value }).engaged,
      `a brake must not fail to bite: '${value}' engages the emergency stop`);
  }
  for (const value of ['', '   ', undefined]) {
    r.check(!resolveKillSwitch({ [CUTOVER_KILL_SWITCH_ENV]: value as string }).engaged,
      `an absent/blank value does NOT engage the stop (${JSON.stringify(value)})`);
  }

  // ================================================================ 2. THE CANONICAL DECISION
  console.log('\n== 2. one canonical answer to "may this request enter governed mode right now?" ==');
  {
    const control = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, governedProductionEnv());
    r.eq(control.effectiveMode, 'GOVERNED_WITH_FALLBACK',
      'CONTROL: the allowlisted principal IS governed with the stop released');
    r.eq(control.reason, 'ACCOUNT_ALLOWLISTED', 'CONTROL: enablement names the account allowlist');
    r.eq(control.killSwitch.engaged, false, 'CONTROL: the brake is reported as released');
    r.eq(control.standing.enabled, true, 'CONTROL: standing configuration enables this principal');

    const stopped = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, killedEnv());
    r.eq(stopped.effectiveMode, 'LEGACY', 'CONTRACT 1: eligibility resolves to LEGACY');
    r.eq(stopped.enabled, false, 'CONTRACT 1: eligibility resolves to NOT enabled');
    r.eq(stopped.reason, 'KILL_SWITCH_ENGAGED',
      'the reason names the emergency stop rather than a configuration fact that did not change');
    r.eq(stopped.configuredMode, 'GOVERNED_WITH_FALLBACK',
      'the CONFIGURED mode is preserved — the brake is an override, not a reconfiguration');
    r.eq(stopped.standing.enabled, true,
      'the standing configuration still names this principal, so releasing the brake restores it');
    r.eq(stopped.standing.reason, 'ACCOUNT_ALLOWLISTED',
      'the standing reason is preserved for the operator');
    r.eq(stopped.killSwitch.engaged, true, 'the brake is reported as engaged');
    r.eq(stopped.killSwitch.source, 'ENVIRONMENT', 'the engaged brake names its source');
    r.eq(modeInfluencesCustomerOutput(stopped.effectiveMode), false,
      'CONTRACT 2/5: governed content cannot influence customer output under the stop');
  }

  // The runtime latch must have exactly the same authority as the environment variable. It is the
  // one the circuit breaker pulls, with no restart and no operator present.
  {
    resetRuntimeKillSwitch();
    const before = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, governedProductionEnv());
    r.eq(before.effectiveMode, 'GOVERNED_WITH_FALLBACK', 'CONTROL: governed before the latch is pulled');
    engageRuntimeKillSwitch('CIRCUIT_BREAKER:CUSTOMER_OUTPUT_MUTATED');
    const latched = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, governedProductionEnv());
    r.eq(latched.effectiveMode, 'LEGACY',
      'the RUNTIME latch stops governed authority with no environment change');
    r.eq(latched.reason, 'KILL_SWITCH_ENGAGED', 'the runtime latch reports the same reason');
    r.eq(latched.killSwitch.source, 'RUNTIME_LATCH', 'the runtime latch names itself as the source');
    resetRuntimeKillSwitch();
    r.eq(resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, governedProductionEnv()).effectiveMode,
      'GOVERNED_WITH_FALLBACK', 'an EXPLICIT reset restores the configured bounded rollout');
  }

  // ================================================================ 3. PHASE 4 — BINDING PROOF
  console.log('\n== 3. inspection binding and knowledgeReleaseId assignment ==');

  // A. kill OFF: governed eligibility true, the active release resolves, the id is assigned.
  {
    const { mode, binding, fixture } = await bindingUnder(
      governedProductionEnv(), FRESH, { [FRESH]: null });
    r.eq(mode, 'GOVERNED_WITH_FALLBACK', 'A: governed eligibility is true with the stop released');
    r.eq(binding.releaseId, ACTIVE_RELEASE, 'A: the active release resolves for a new inspection');
    r.eq(binding.reason, 'BOUND_TO_ACTIVE_RELEASE', 'A: the binding names the active release');
    r.eq(binding.newlyBound, true, 'A: the inspection acquires its release');
    r.eq(fixture.rows.get(FRESH), ACTIVE_RELEASE,
      'A: the new inspection RECEIVES the governed release id');
  }

  // B. kill ON: eligibility inactive, the active release is not used, the id stays NULL.
  {
    const { mode, binding, fixture } = await bindingUnder(killedEnv(), FRESH, { [FRESH]: null });
    r.eq(mode, 'LEGACY', 'B: governed eligibility is inactive under the stop');
    r.eq(binding.releaseId, null, 'CONTRACT 3: the active release is NOT used for new binding');
    r.eq(binding.reason, 'GOVERNED_MODE_INACTIVE', 'B: the binding reports governed mode inactive');
    r.eq(binding.newlyBound, false, 'B: nothing is newly bound');
    r.eq(fixture.rows.get(FRESH), null, 'CONTRACT 4: knowledgeReleaseId remains NULL');
    r.eq(fixture.writes.length, 0, 'CONTRACT 4: no durable write is attempted');
    r.eq(fixture.queries.length, 0,
      'CONTRACT 2: the safe inactive result is reached BEFORE any active-release lookup');
  }

  // C. an inspection bound BEFORE the stop keeps its write-once release id.
  {
    const inspections = { [ALREADY_BOUND]: HISTORICAL_RELEASE as string | null };
    const { binding, fixture } = await bindingUnder(killedEnv(), ALREADY_BOUND, inspections);
    r.eq(fixture.rows.get(ALREADY_BOUND), HISTORICAL_RELEASE,
      'C: an already-bound inspection RETAINS its existing knowledgeReleaseId under the stop');
    r.eq(fixture.writes.length, 0,
      'C: no clearing, backfill or rebinding occurs — the brake does not falsify history');
    r.eq(binding.releaseId, null,
      'C: the stopped request itself is not governed by the historical release either');
    // The read-only lookup the persistence layer uses must still see the historical binding, so a
    // truthful provenance claim on an OLD analysis remains verifiable during an incident.
    const stillReadable = await readInspectionReleaseBinding(fixture.dataSource, ALREADY_BOUND);
    r.eq(stillReadable, HISTORICAL_RELEASE,
      'C: the persisted binding remains READABLE — provenance history is intact, not erased');
  }

  // D. kill ON then OFF restores the bounded rollout, with no configuration or database rewrite.
  {
    const inspections = { [FRESH]: null as string | null };
    const stopped = await bindingUnder(killedEnv(), FRESH, inspections);
    r.eq(stopped.fixture.rows.get(FRESH), null, 'D: nothing is bound while the stop is engaged');
    // The SAME environment, with only the switch removed. No allowlist edit, no mode edit.
    const released = await bindingUnder(governedProductionEnv(), FRESH, inspections);
    r.eq(released.mode, 'GOVERNED_WITH_FALLBACK',
      'CONTRACT 9: releasing the stop restores the configured bounded rollout');
    r.eq(released.binding.releaseId, ACTIVE_RELEASE, 'D: binding resumes against the active release');
    r.eq(released.fixture.rows.get(FRESH), ACTIVE_RELEASE,
      'D: a new inspection binds again — no configuration corruption');
  }

  // E/F/G. The pre-existing boundaries are untouched, with the stop engaged and released alike.
  {
    const cases: Array<{ name: string; principal: any; env: Env; reason: string }> = [
      { name: 'E: a non-allowlisted account', principal: NON_ALLOWLISTED_PRINCIPAL,
        env: governedProductionEnv(), reason: 'NOT_ALLOWLISTED' },
      { name: 'F: no principal', principal: null,
        env: governedProductionEnv(), reason: 'NO_PRINCIPAL' },
      { name: 'G: no allowlist configured', principal: ALLOWLISTED_PRINCIPAL,
        env: governedProductionEnv({ [CUTOVER_ALLOWLIST_ENV]: undefined }),
        reason: 'NO_ALLOWLIST_CONFIGURED' },
    ];
    for (const scenario of cases) {
      const released = resolveCutoverEnablement(scenario.principal, scenario.env);
      r.eq(released.effectiveMode, 'LEGACY', `${scenario.name} remains legacy with the stop released`);
      r.eq(released.reason, scenario.reason, `${scenario.name} reports its own unchanged reason`);
      const stopped = resolveCutoverEnablement(
        scenario.principal, { ...scenario.env, [CUTOVER_KILL_SWITCH_ENV]: 'engaged' });
      r.eq(stopped.effectiveMode, 'LEGACY', `${scenario.name} remains legacy with the stop engaged`);
      r.eq(stopped.standing.reason, scenario.reason,
        `${scenario.name} keeps its configuration reason visible in \`standing\``);
    }
    // The organization allowlist is a separate door and the brake must close it too.
    const orgEnv = governedProductionEnv({
      [CUTOVER_ALLOWLIST_ENV]: undefined, [CUTOVER_ORG_ALLOWLIST_ENV]: ALLOWLISTED_ORG,
    });
    const orgPrincipal = { userId: 'someone', organizationId: ALLOWLISTED_ORG };
    r.eq(resolveCutoverEnablement(orgPrincipal, orgEnv).reason, 'ORGANIZATION_ALLOWLISTED',
      'CONTROL: the organization allowlist enables a principal');
    r.eq(resolveCutoverEnablement(orgPrincipal, { ...orgEnv, [CUTOVER_KILL_SWITCH_ENV]: 'x' })
      .effectiveMode, 'LEGACY', 'the stop closes the ORGANIZATION door as well as the account door');
  }

  // ================================================================ 4. PHASE 5 — AUTHORITY PROOF
  console.log('\n== 4. governed retrieval / customer authority ==');
  {
    const fixture = inspectionFixture({ inspections: { [FRESH]: null }, records: RELEASE_RECORDS });

    // CONTROL: with the stop released, release-scoped retrieval really does establish authority.
    const context = await GovernedCutoverContext.create({
      dataSource: fixture.dataSource, principal: ALLOWLISTED_PRINCIPAL,
      boundReleaseId: ACTIVE_RELEASE, env: governedProductionEnv(),
    });
    r.check(context !== null, 'CONTROL: a governed context exists with the stop released');
    r.eq(context?.mode, 'GOVERNED_WITH_FALLBACK', 'CONTROL: the context runs the configured mode');

    const pin = await pinGovernedRelease(fixture.dataSource, 'GOVERNED_WITH_FALLBACK', ACTIVE_RELEASE);
    r.eq(pin.releaseId, ACTIVE_RELEASE, 'CONTROL: retrieval pins the bound release');
    const approved = await resolveGoverned(fixture.dataSource, pin, APPROVED);
    r.eq(approved.backing, 'APPROVED_EXACT',
      'CONTROL: a reviewer-approved member IS reachable as governed authority when governance runs');

    // The rejected record is unreachable as authority even when governance IS running. The stop
    // must not be what protects it — otherwise this suite would prove nothing about the stop.
    const rejected = await resolveGoverned(fixture.dataSource, pin, REJECTED);
    r.check(rejected.backing !== 'APPROVED_EXACT',
      'a reviewer-REJECTED record is not governed authority even with governance running',
      String(rejected.backing));
    r.eq(rejected.standardText, null, 'a rejected record supplies no governed text');

    // UNDER THE STOP: no context, so release-scoped retrieval is never selected at all.
    const stoppedContext = await GovernedCutoverContext.create({
      dataSource: fixture.dataSource, principal: ALLOWLISTED_PRINCIPAL,
      boundReleaseId: ACTIVE_RELEASE, env: killedEnv(),
    });
    r.eq(stoppedContext, null,
      'CONTRACT 5: no governed context is created, so release-scoped retrieval is not selected');

    // And the pin — the step that would make an active release authoritative — refuses in LEGACY.
    const stoppedMode = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, killedEnv()).effectiveMode;
    const stoppedPin = await pinGovernedRelease(fixture.dataSource, stoppedMode, ACTIVE_RELEASE);
    r.eq(stoppedPin.releaseId, null,
      'CONTRACT 5: no release is pinned, so an active release does not become customer authority');
    r.eq(stoppedPin.reason, 'MODE_IS_LEGACY', 'the pin reports the legacy mode the stop produced');

    // The 8 rejected records stay unreachable under the stop too — a fortiori, and asserted.
    const stoppedRejected = await resolveGoverned(fixture.dataSource, stoppedPin, REJECTED);
    r.check(stoppedRejected.backing !== 'APPROVED_EXACT',
      'the rejected record remains unreachable as governed authority under the stop',
      String(stoppedRejected.backing));
  }

  // ================================================================ 5. PHASE 6 — DELIVERY
  console.log('\n== 5. governed / shadow delivery still stops, and says why ==');
  {
    resetShadowBreakerWindow();
    const PAYLOAD = { legacy: true };
    let sawContext = false;
    const stopped = await orchestrateShadowRequest({
      dataSource: inspectionFixture({ records: RELEASE_RECORDS }).dataSource,
      principal: ALLOWLISTED_PRINCIPAL, env: killedEnv(),
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return PAYLOAD; },
    });
    r.eq(stopped.outcome, 'SHADOW_SKIPPED', 'CONTRACT 6: governed delivery is skipped under the stop');
    r.eq(stopped.skipReason, 'KILL_SWITCH_ENGAGED',
      'the skip NAMES the emergency stop rather than reporting an ordinary legacy request');
    r.eq(stopped.effectiveMode, 'LEGACY', 'the request runs legacy');
    r.check(!sawContext, 'no governed context reaches the customer pipeline');
    r.check(stopped.payload === PAYLOAD, 'the customer path stays available — the brake is not an outage');

    // A genuinely legacy server with the switch set is NOT an incident, and must not be reported
    // as one. Otherwise every legacy request would look like suppressed governance.
    const legacy = await orchestrateShadowRequest({
      dataSource: inspectionFixture({}).dataSource, principal: ALLOWLISTED_PRINCIPAL,
      env: { [CUTOVER_MODE_ENV]: 'LEGACY', [CUTOVER_KILL_SWITCH_ENV]: 'engaged' },
      runPipeline: async () => PAYLOAD,
    });
    r.eq(legacy.outcome, 'LEGACY_NO_CONTEXT',
      'a LEGACY server with the switch set reports an ordinary legacy request, not a suppression');
    r.eq(legacy.skipReason, null, 'no skip reason is invented for a request nothing was holding back');

    // CONTROL: the same configuration without the switch delivers governed output.
    const delivered = await orchestrateShadowRequest({
      dataSource: inspectionFixture({ records: RELEASE_RECORDS }).dataSource,
      principal: ALLOWLISTED_PRINCIPAL, env: governedProductionEnv(),
      boundReleaseId: ACTIVE_RELEASE,
      runPipeline: async (ctx) => { if (ctx) sawContext = true; return PAYLOAD; },
    });
    r.eq(delivered.outcome, 'GOVERNED_DELIVERY',
      'CONTROL: the same configuration DOES deliver governed output with the stop released');
    r.check(sawContext, 'CONTROL: the governed context reaches the pipeline when governance runs');
  }

  // The production-shadow gate keeps the KG-4C property: the stop OVERRIDES the locks, it does not
  // close them. An operator must not be sent to fix an allowlist that never changed.
  {
    const env = governedProductionEnv({
      [CUTOVER_MODE_ENV]: 'SHADOW',
      [PRODUCTION_SHADOW_ACK_ENV]: PRODUCTION_SHADOW_ACK_SENTINEL,
      [SHADOW_STAGE_ENV]: 'STAGE_1_SINGLE_ACCOUNT',
      [SHADOW_KILL_SWITCH_ENV]: 'engaged',
    });
    const authorization = resolveProductionShadowAuthorization({
      principal: ALLOWLISTED_PRINCIPAL, env,
    });
    r.eq(authorization.authorized, false, 'the stop refuses a fully authorized shadow configuration');
    r.eq(authorization.refusal, 'KILL_SWITCH_ENGAGED', 'the refusal names the stop');
    r.check(authorization.locks.SERVER_MODE && authorization.locks.PRODUCTION_SHADOW_ACK
      && authorization.locks.PRINCIPAL_ELIGIBILITY,
      'the stop leaves EVERY lock open — it is an override, not a reconfiguration');
  }

  // ================================================================ 6. PHASE 6 — BOOT SAFETY
  console.log('\n== 6. boot and configuration safety are unchanged by the brake ==');
  {
    r.eq(GOVERNED_CUTOVER_MODES.join(','), 'LEGACY,SHADOW,GOVERNED_WITH_FALLBACK,GOVERNED_STRICT',
      'the legal mode set is exactly the four frozen values');

    const malformed: Array<{ name: string; env: Env }> = [
      { name: 'a governed mode in production with NO acknowledgement',
        env: { NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'GOVERNED_WITH_FALLBACK' } },
      { name: 'a governed mode in production with a NEAR-MISS acknowledgement',
        env: { NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'GOVERNED_WITH_FALLBACK',
               [CUTOVER_PRODUCTION_ACK_ENV]: 'i_acknowledge_governed_cutover' } },
      { name: 'an unrecognised mode value in production',
        env: { NODE_ENV: 'production', [CUTOVER_MODE_ENV]: 'GOVERNED_MAYBE' } },
    ];
    for (const bad of malformed) {
      let threwWithout = false;
      try { assertCutoverConfigurationSafeForProduction(bad.env); } catch { threwWithout = true; }
      r.check(threwWithout, `boot still REFUSES ${bad.name}`);
      let threwWith = false;
      try {
        assertCutoverConfigurationSafeForProduction({ ...bad.env, [CUTOVER_KILL_SWITCH_ENV]: 'engaged' });
      } catch { threwWith = true; }
      r.check(threwWith,
        `CONTRACT 8: engaging the brake does NOT make ${bad.name} silently acceptable`);
    }

    // And the acknowledged, well-formed configuration still boots — with or without the brake.
    let acknowledgedThrew = false;
    try { assertCutoverConfigurationSafeForProduction(governedProductionEnv()); }
    catch { acknowledgedThrew = true; }
    r.check(!acknowledgedThrew, 'CONTROL: an acknowledged governed configuration still boots');
    let brakedThrew = false;
    try { assertCutoverConfigurationSafeForProduction(killedEnv()); } catch { brakedThrew = true; }
    r.check(!brakedThrew, 'an acknowledged configuration with the brake engaged still boots');
    r.eq(resolveCutoverMode(killedEnv()).mode, 'GOVERNED_WITH_FALLBACK',
      'the brake does not rewrite the CONFIGURED mode — rollback and the brake stay distinguishable');
  }

  // ================================================================ 7. PHASE 9 — ROLLBACK MATRIX
  console.log('\n== 7. the rollback matrix, all three controls, measured ==');
  {
    const matrix: Array<{ control: string; env: Env; mode: string; reason: string }> = [
      { control: 'PRIMARY EMERGENCY STOP — set GOVERNED_CUTOVER_KILL_SWITCH',
        env: killedEnv(), mode: 'LEGACY', reason: 'KILL_SWITCH_ENGAGED' },
      { control: 'BOUNDED ROLLBACK — clear GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST',
        env: governedProductionEnv({ [CUTOVER_ALLOWLIST_ENV]: '' }),
        mode: 'LEGACY', reason: 'NO_ALLOWLIST_CONFIGURED' },
      { control: 'MODE ROLLBACK — set GOVERNED_CUTOVER_MODE = LEGACY',
        env: governedProductionEnv({ [CUTOVER_MODE_ENV]: 'LEGACY' }),
        mode: 'LEGACY', reason: 'MODE_IS_LEGACY' },
    ];
    for (const row of matrix) {
      const resolved = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, row.env);
      r.eq(resolved.effectiveMode, row.mode, `${row.control} -> effectiveMode`);
      r.eq(resolved.reason, row.reason, `${row.control} -> reason`);

      // Every control must ALSO stop durable state, which is the property the primary stop lacked.
      const fixture = inspectionFixture({ inspections: { [FRESH]: null }, records: RELEASE_RECORDS });
      const binding = await resolveInspectionReleaseBinding({
        dataSource: fixture.dataSource, inspectionId: FRESH, mode: resolved.effectiveMode,
      });
      r.eq(binding.releaseId, null, `${row.control} -> no new release binding`);
      r.eq(fixture.rows.get(FRESH), null, `${row.control} -> knowledgeReleaseId stays NULL`);
      r.eq(fixture.writes.length, 0, `${row.control} -> no durable write attempted`);
    }
  }

  resetRuntimeKillSwitch();
  resetShadowBreakerWindow();

  const passed = r.count - r.failures.length;
  console.log(`\n${r.failures.length === 0 ? 'PASS' : 'FAIL'} — ${passed} passed, ${r.failures.length} failed`);
  for (const failure of r.failures) console.log(`  FAILED: ${failure}`);
  process.exit(r.failures.length === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(2); });
