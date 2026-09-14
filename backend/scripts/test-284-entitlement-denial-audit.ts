/**
 * §284 — THE ENTITLEMENT-DENIAL AUDIT POLICY, EXERCISED WITHOUT A DATABASE.
 *
 * Runs with `npm run test:284-entitlement-denial-audit`. The policy is pure by construction (see
 * `src/auth/entitlements/entitlement-denial-audit.ts`), so every requirement §284 set can be
 * checked here directly rather than inferred from a row count.
 *
 * THE REQUIREMENT THIS EXISTS TO PROTECT, above all the others: **a refused MUTATION is never
 * coalesced.** The whole point of the change is to stop routine reads burying real attempts, and a
 * future edit that "simplified" the policy by coalescing everything would silently undo it while
 * every volume measurement still looked better.
 */
import {
  ENTITLEMENT_DENIED_ACTION,
  ENTITLEMENT_READ_REFUSED_ACTION,
  MAX_TRACKED_READ_WINDOWS,
  READ_REFUSAL_WINDOW_MS,
  anchorReadRefusalEvent,
  classifyEntitlementDenial,
  noteReadRefusal,
  readRefusalKey,
  resetReadRefusalWindowsForTests,
  trackedReadRefusalWindowCount,
} from '../src/auth/entitlements/entitlement-denial-audit';

const failures: string[] = [];
function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`ok   ${message}`);
  } else {
    failures.push(message);
    console.log(`FAIL ${message}`);
  }
}

// =================================================================================================
// CLASSIFICATION. Mutations are SECURITY and are never coalesced; reads are OPERATIONAL.
// =================================================================================================
for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'post', 'patch']) {
  const c = classifyEntitlementDenial(method);
  check(c.denialClass === 'SECURITY', `${method} denial is classified SECURITY`);
  check(c.action === ENTITLEMENT_DENIED_ACTION, `${method} keeps the entitlement_denied action`);
  check(c.coalesced === false, `${method} is NEVER coalesced`);
}
for (const method of ['GET', 'HEAD', 'OPTIONS', 'get']) {
  const c = classifyEntitlementDenial(method);
  check(c.denialClass === 'OPERATIONAL', `${method} denial is classified OPERATIONAL`);
  check(c.action === ENTITLEMENT_READ_REFUSED_ACTION, `${method} uses the read-refused action`);
  check(c.coalesced === true, `${method} is coalesced`);
}
{
  // An absent method must not be guessed into the permissive class. It defaults to GET, which is
  // what Express reports for a request that reached a guard at all, and is the safe-method case.
  const c = classifyEntitlementDenial(undefined);
  check(c.denialClass === 'OPERATIONAL', 'a missing method defaults to the read class');
  // An unrecognised verb is treated as a mutation, which is the conservative direction: an unknown
  // verb that changes state must not be quietly coalesced.
  const unknown = classifyEntitlementDenial('PURGE');
  check(unknown.denialClass === 'SECURITY', 'an unrecognised verb is treated as a mutation');
  check(unknown.coalesced === false, 'and is therefore not coalesced');
}

// =================================================================================================
// THE KEY. Different actors, organizations, entitlements and resources do not share a window;
// different PATHS do, because that is the case being collapsed.
// =================================================================================================
{
  const base = { actorUserId: 'a', organizationId: 'o', entitlement: 'fullSafeScope', resourceType: 'ExpertAnalysisController' };
  check(readRefusalKey(base) === readRefusalKey({ ...base }), 'the same request shape is one key');
  check(readRefusalKey(base) !== readRefusalKey({ ...base, actorUserId: 'b' }), 'a different actor is a different key');
  check(readRefusalKey(base) !== readRefusalKey({ ...base, organizationId: 'p' }), 'a different organization is a different key');
  check(readRefusalKey(base) !== readRefusalKey({ ...base, entitlement: 'analytics' }), 'a different entitlement is a different key');
  check(readRefusalKey(base) !== readRefusalKey({ ...base, resourceType: 'OtherController' }), 'a different resource type is a different key');
  check(readRefusalKey({ ...base, actorUserId: null, organizationId: null }).length > 0, 'an anonymous actor still produces a key');
}

// =================================================================================================
// COALESCING. One row per window, and every refusal after the first is COUNTED, not dropped.
// =================================================================================================
{
  resetReadRefusalWindowsForTests();
  const key = 'k1';
  const t0 = 1_000_000;

  const first = noteReadRefusal(key, t0);
  check(first.write === 'INSERT', 'the first refused read writes a row');
  anchorReadRefusalEvent(key, 'event-1');

  let lastRepeats = 0;
  let inserts = 1;
  for (let i = 1; i <= 24; i += 1) {
    const decision = noteReadRefusal(key, t0 + i * 1000);
    if (decision.write === 'INSERT') inserts += 1;
    else lastRepeats = decision.repeats;
  }
  check(inserts === 1, `25 refused reads in one window produce ONE row (got ${inserts})`);
  check(lastRepeats === 24, `and the row counts all 24 that followed it (got ${lastRepeats})`);
}

// The window closes, and the next refusal starts a new row rather than counting forever.
{
  resetReadRefusalWindowsForTests();
  const key = 'k2';
  const t0 = 2_000_000;
  noteReadRefusal(key, t0);
  anchorReadRefusalEvent(key, 'event-2');
  const afterWindow = noteReadRefusal(key, t0 + READ_REFUSAL_WINDOW_MS + 1);
  check(afterWindow.write === 'INSERT', 'a refusal after the window writes a new row');
  check(!('reanchor' in afterWindow), 'and it is a fresh window, not a re-anchor');
}

// An INSERT that never anchored (the save failed, or the row was removed) must NOT silence the key
// for the rest of the window. This is the self-healing branch.
{
  resetReadRefusalWindowsForTests();
  const key = 'k3';
  const t0 = 3_000_000;
  noteReadRefusal(key, t0); // never anchored
  const next = noteReadRefusal(key, t0 + 1000);
  check(next.write === 'INSERT' && 'reanchor' in next,
    'an unanchored window re-inserts rather than counting into a row that does not exist');
}

// =================================================================================================
// MUTATIONS ARE NEVER COALESCED — the requirement this file exists for. Ten refused POSTs are ten
// rows, whatever the read policy is doing.
// =================================================================================================
{
  resetReadRefusalWindowsForTests();
  let rows = 0;
  for (let i = 0; i < 10; i += 1) {
    const c = classifyEntitlementDenial('POST');
    if (!c.coalesced) rows += 1;
  }
  check(rows === 10, `10 refused mutations produce 10 rows (got ${rows})`);
  check(trackedReadRefusalWindowCount() === 0, 'and mutations open no read windows at all');
}

// =================================================================================================
// BOUNDED MEMORY. The window map cannot grow without limit, and overflow costs a row, never an event.
// =================================================================================================
{
  resetReadRefusalWindowsForTests();
  const t0 = 4_000_000;
  for (let i = 0; i < MAX_TRACKED_READ_WINDOWS + 250; i += 1) {
    noteReadRefusal(`key-${i}`, t0);
  }
  check(trackedReadRefusalWindowCount() <= MAX_TRACKED_READ_WINDOWS,
    `the window map stays at or below its ceiling (got ${trackedReadRefusalWindowCount()})`);
}

// Expired windows are evicted rather than accumulating for the process lifetime.
{
  resetReadRefusalWindowsForTests();
  const t0 = 5_000_000;
  for (let i = 0; i < 100; i += 1) noteReadRefusal(`old-${i}`, t0);
  check(trackedReadRefusalWindowCount() === 100, 'one hundred windows are open');
  noteReadRefusal('trigger', t0 + READ_REFUSAL_WINDOW_MS + 1);
  check(trackedReadRefusalWindowCount() === 1,
    `expired windows are evicted (got ${trackedReadRefusalWindowCount()})`);
}

if (failures.length) {
  console.error(`\n${failures.length} FAILED:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\n§284 entitlement denial audit policy: PASS');
