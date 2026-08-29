// GOVERNED-CUTOVER EMERGENCY-STOP AUTHORITY -- THE DEFECT REPRODUCTION.
//
//   npm run reproduce:governed-kill-switch-defect
//
// WRITTEN BEFORE THE REPAIR, AND DELIBERATELY NOT A "DEFECT SNAPSHOT".
//
// The 2026-08-29 cutover preparation recorded, by grep and by measurement, that
// `GOVERNED_CUTOVER_KILL_SWITCH` is a DELIVERY brake only: it is consulted inside
// `orchestrateShadowRequest()` but not by the two call sites that decide DURABLE state --
// `resolveInspectionReleaseBinding()` (via `safescope-v2.controller.ts`) and
// `resolveKnowledgeReleaseId()` (`inspection.service.ts:537`). Both read
// `resolveCutoverEnablement(...).effectiveMode`, which with the switch engaged still reports
// `GOVERNED_WITH_FALLBACK` / `ACCOUNT_ALLOWLISTED`.
//
// This script states the CONTRACT the emergency stop must satisfy and measures the five decision
// points against it. Before the repair it fails and prints exactly which authority boundaries the
// kill switch does not reach; after the repair it passes unchanged. The expectations below are the
// contract, authored before the implementation, and they are never to be relaxed to obtain a
// passing result -- if a future change makes one of them fail, the emergency stop has regressed.
//
// NO DATABASE. NO NETWORK. NO PROVIDER CALL. Every table read or write is served by the in-memory
// fixture in `lib/kill-switch-fixture.ts`, which RECORDS the statements issued -- so "no durable
// write occurred" is measured, not assumed.

import {
  ACTIVE_RELEASE, ALLOWLISTED_PRINCIPAL, governedProductionEnv, killedEnv,
  inspectionFixture, recorder, withProcessEnv,
} from './lib/kill-switch-fixture';
import {
  resolveCutoverEnablement, modeInfluencesCustomerOutput,
} from '../src/standards/cutover/cutover-mode';
import { resolveInspectionReleaseBinding } from '../src/standards/releases/inspection-release-binding';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { resetRuntimeKillSwitch } from '../src/standards/cutover/production-shadow-authorization';

const FRESH_INSPECTION = 'inspection-fresh-0001';

async function main() {
  resetRuntimeKillSwitch();
  const r = recorder();

  // ---------------------------------------------------------------- the positive control
  //
  // Without this, every "kill switch stopped it" observation below could be explained by the
  // configuration simply not being governed. It has to be governed FIRST for the brake to mean
  // anything.
  console.log('\n== CONTROL: the same configuration with the emergency stop RELEASED ==');
  {
    const env = governedProductionEnv();
    const enablement = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, env);
    r.eq(enablement.effectiveMode, 'GOVERNED_WITH_FALLBACK',
      'control: the allowlisted principal IS governed with the stop released');
    r.eq(enablement.reason, 'ACCOUNT_ALLOWLISTED',
      'control: enablement names the account allowlist');

    const fixture = inspectionFixture({ inspections: { [FRESH_INSPECTION]: null } });
    const binding = await resolveInspectionReleaseBinding({
      dataSource: fixture.dataSource, inspectionId: FRESH_INSPECTION,
      mode: enablement.effectiveMode,
    });
    r.eq(binding.releaseId, ACTIVE_RELEASE, 'control: a new inspection binds to the active release');
    r.eq(binding.newlyBound, true, 'control: the binding is newly written');
    r.eq(fixture.rows.get(FRESH_INSPECTION), ACTIVE_RELEASE,
      'control: knowledgeReleaseId IS persisted when governance is running');
  }

  // ---------------------------------------------------------------- the contract under test
  console.log('\n== MEASURED: the same configuration with GOVERNED_CUTOVER_KILL_SWITCH ENGAGED ==');

  const env = killedEnv();

  // 1. No NEW customer request may become governed.
  const enablement = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL, env);
  console.log(`   resolveCutoverEnablement -> effectiveMode=${enablement.effectiveMode} ` +
    `reason=${enablement.reason} enabled=${enablement.enabled}`);
  r.eq(enablement.effectiveMode, 'LEGACY',
    'CONTRACT 1: the emergency stop resolves customer eligibility to LEGACY');
  r.eq(enablement.enabled, false,
    'CONTRACT 1: the emergency stop resolves customer eligibility to NOT enabled');

  // 2. The safe inactive result must be reached BEFORE an active-release lookup is authoritative.
  r.eq(modeInfluencesCustomerOutput(enablement.effectiveMode), false,
    'CONTRACT 2: governed content cannot influence customer output under the emergency stop');

  // 3 + 4. No NEW inspection may bind, and no NEW knowledgeReleaseId may be assigned.
  const fixture = inspectionFixture({ inspections: { [FRESH_INSPECTION]: null } });
  const binding = await resolveInspectionReleaseBinding({
    dataSource: fixture.dataSource, inspectionId: FRESH_INSPECTION,
    mode: enablement.effectiveMode,
  });
  console.log(`   resolveInspectionReleaseBinding -> releaseId=${binding.releaseId} ` +
    `reason=${binding.reason} newlyBound=${binding.newlyBound}`);
  console.log(`   inspection.knowledgeReleaseId after the call = ${fixture.rows.get(FRESH_INSPECTION)}`);
  console.log(`   durable writes attempted = ${fixture.writes.length}`);
  r.eq(binding.releaseId, null,
    'CONTRACT 3: no release is resolved for a NEW inspection under the emergency stop');
  r.eq(binding.newlyBound, false,
    'CONTRACT 3: no binding is newly written under the emergency stop');
  r.eq(fixture.rows.get(FRESH_INSPECTION), null,
    'CONTRACT 4: inspection.knowledgeReleaseId remains NULL under the emergency stop');
  r.eq(fixture.writes.length, 0,
    'CONTRACT 4: no durable write is even ATTEMPTED under the emergency stop');
  r.eq(fixture.queries.length, 0,
    'CONTRACT 2: the active-release pointer is not read at all under the emergency stop');

  // 5. Governed release-scoped standards may not become customer authority for that request.
  const context = await GovernedCutoverContext.create({
    dataSource: fixture.dataSource, principal: ALLOWLISTED_PRINCIPAL, env,
  });
  console.log(`   GovernedCutoverContext.create -> ${context === null ? 'null' : context.mode}`);
  r.eq(context, null,
    'CONTRACT 5: no governed cutover context exists under the emergency stop');

  // The REAL call shape. Both durable-state call sites read `process.env`, not an injected env.
  console.log('\n== MEASURED: the real call shape (process.env, as the controller and service use) ==');
  await withProcessEnv(env, async () => {
    const live = resolveCutoverEnablement(ALLOWLISTED_PRINCIPAL);
    console.log(`   resolveCutoverEnablement(principal) -> effectiveMode=${live.effectiveMode} ` +
      `reason=${live.reason}`);
    r.eq(live.effectiveMode, 'LEGACY',
      'CONTRACT 1: the emergency stop applies to the no-env call shape the call sites actually use');
    r.eq(modeInfluencesCustomerOutput(live.effectiveMode), false,
      'CONTRACT 4: inspection.service.ts:537 takes the non-governed provenance branch');
  });

  console.log(`\n${r.failures.length === 0 ? 'REPAIRED' : 'DEFECT REPRODUCED'} — ` +
    `${r.count - r.failures.length} passed, ${r.failures.length} failed`);
  for (const failure of r.failures) console.log(`  UNMET: ${failure}`);
  process.exit(r.failures.length === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(2); });
