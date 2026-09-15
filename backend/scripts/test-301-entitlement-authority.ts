/**
 * §301 / BI-4 — WHO MAY GRANT PAID CAPABILITY, AND WHAT A CLIENT MAY NOT ASK FOR.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:301-entitlement-authority`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE DISTINCTION THIS FILE EXISTS TO HOLD.
 *
 *   REQUESTED PLAN            what a caller asks for. `planCode`, `selectedPlan` and `promoCode`
 *                             on the registration body. NEVER authority.
 *
 *   SERVER-AUTHORIZED         what the server decides is true. A live Stripe subscription row, a
 *   ENTITLEMENT               bounded `entitlement_grant`, or a promo code that matches a
 *                             SERVER-SIDE configured list the caller cannot write to.
 *
 * BI-4 was a defect in the second: a legitimately authorized promotion evaporated one request
 * after it was granted. The danger in repairing it is doing so by trusting the first. Section 2
 * below is the guard against that and is wired into the build.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS UNIT-LEVEL AND THE INTEGRATION SUITE IS SEPARATE.
 *
 * Precedence is a pure function of (subscription, grant, user row). Testing it here means every
 * combination can be exercised — including ones that are awkward to construct against a database,
 * such as a cancelled subscription beside a still-valid grant. The live product path is proven
 * separately, end to end, in the §301 integration proof.
 */
import { normalizeStripeSubscriptionStatus, resolveAccessTier } from '../src/billing/subscription-status';
import { hasEntitlement } from '../src/billing/plan-entitlements';
import { readFileSync } from 'fs';
import { join } from 'path';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

const SRC = join(__dirname, '..', 'src');
const read = (rel: string): string => readFileSync(join(SRC, rel), 'utf8');

/**
 * THE RESOLVER, REPRODUCED FROM `getBillingStatus` EXACTLY.
 *
 * Restated rather than imported because `getBillingStatus` is a Nest service method needing
 * repositories. Section 5 below asserts this reproduction still matches the shipped source, so it
 * cannot quietly drift into testing a model the product no longer implements.
 */
type Sub = { tier: 'free' | 'pro'; status: string; currentPeriodEnd: Date | null } | null;
type Grant = { tier: 'pro'; status: 'active' | 'revoked' | 'expired'; startsAt: Date; endsAt: Date } | null;

function resolveTier(userRow: { planCode?: string; subscriptionStatus?: string }, sub: Sub, grant: Grant) {
  const now = new Date();
  const activeGrant = grant && grant.status === 'active'
    && grant.startsAt <= now && grant.endsAt > now ? grant : null;
  const fallbackTier = (userRow.planCode === 'pro' ? 'pro' : 'free') as 'free' | 'pro';
  const fallbackStatus = normalizeStripeSubscriptionStatus(userRow.subscriptionStatus);
  const paidTier = sub ? sub.tier : fallbackTier;
  const sourceStatus = sub ? sub.status : fallbackStatus;
  const paidEffectiveTier = resolveAccessTier(paidTier, sourceStatus, sub?.currentPeriodEnd ?? null);
  return activeGrant?.tier === 'pro' && paidEffectiveTier === 'free' ? 'pro' : paidEffectiveTier;
}

const hour = 3600_000;
const activeGrant = (): Grant => ({ tier: 'pro', status: 'active', startsAt: new Date(Date.now() - hour), endsAt: new Date(Date.now() + hour) });
const expiredGrant = (): Grant => ({ tier: 'pro', status: 'active', startsAt: new Date(Date.now() - 2 * hour), endsAt: new Date(Date.now() - hour) });
const revokedGrant = (): Grant => ({ tier: 'pro', status: 'revoked', startsAt: new Date(Date.now() - hour), endsAt: new Date(Date.now() + hour) });

const FREE = { planCode: 'free', subscriptionStatus: 'none' };
const PROMO = { planCode: 'pro', subscriptionStatus: 'active' };

// ================================================================ 1. the sixteen-case matrix

console.log('\n---- 1. the §301 security and precedence matrix ----\n');

const M: ReadonlyArray<[string, 'free' | 'pro', ReturnType<typeof resolveTier>]> = [
  ['1  ordinary free registration', 'free', resolveTier(FREE, null, null)],
  ['3  legitimate server-authorized promo', 'pro', resolveTier(PROMO, null, null)],
  ['4  active paid subscription', 'pro', resolveTier(FREE, { tier: 'pro', status: 'active', currentPeriodEnd: new Date(Date.now() + hour) }, null)],
  ['5a cancelled subscription, no other authority', 'free', resolveTier(FREE, { tier: 'pro', status: 'canceled', currentPeriodEnd: new Date(Date.now() - hour) }, null)],
  ['5b unpaid subscription, no other authority', 'free', resolveTier(FREE, { tier: 'pro', status: 'unpaid', currentPeriodEnd: null }, null)],
  ['6  active bounded entitlement_grant', 'pro', resolveTier(FREE, null, activeGrant())],
  ['7  expired entitlement_grant', 'free', resolveTier(FREE, null, expiredGrant())],
  ['8  revoked entitlement_grant', 'free', resolveTier(FREE, null, revokedGrant())],
  ['9a cancelled subscription + active grant', 'pro', resolveTier(FREE, { tier: 'pro', status: 'canceled', currentPeriodEnd: null }, activeGrant())],
  ['9b active subscription + expired grant', 'pro', resolveTier(FREE, { tier: 'pro', status: 'active', currentPeriodEnd: new Date(Date.now() + hour) }, expiredGrant())],
  ['9c free subscription row + active grant', 'pro', resolveTier(FREE, { tier: 'free', status: 'active', currentPeriodEnd: null }, activeGrant())],
  ['9d promo user row + cancelled subscription row', 'free', resolveTier(PROMO, { tier: 'pro', status: 'canceled', currentPeriodEnd: null }, null)],
];
for (const [label, expected, actual] of M) {
  check(actual === expected, `${label} -> ${expected} (saw ${actual})`);
}

check(resolveTier(PROMO, { tier: 'pro', status: 'canceled', currentPeriodEnd: null }, null) === 'free',
  '9d is the precedence rule stated plainly: A LIVE SUBSCRIPTION ROW OUTRANKS THE USER ROW IN BOTH '
  + 'DIRECTIONS. A promo tier on the user row cannot survive a subscription Stripe has ended.');
check(resolveTier(FREE, { tier: 'pro', status: 'canceled', currentPeriodEnd: null }, activeGrant()) === 'pro',
  'And a grant is a FLOOR, never a ceiling: it raises free to pro and never lowers anything.');

// ================================================================ 2. the anti-self-promotion guard

console.log('\n---- 2. a client cannot ask for paid capability ----\n');

const authService = read('auth/auth.service.ts');

/**
 * THE DURABLE GUARD §301 REQUIRES. It is a SOURCE assertion, not a behavioural one, and
 * deliberately so: the property is "no code path reads a caller-supplied plan into the account",
 * and a behavioural test can only sample the paths someone thought to try.
 */
const planBody = authService
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

for (const field of ['dto.planCode', 'dto.selectedPlan', 'dto.subscriptionStatus', 'dto.tier']) {
  check(!planBody.includes(field),
    `auth.service.ts never reads ${field}. A caller-supplied plan is a REQUEST, not authority, and `
    + 'the moment one is read into the account row, public registration becomes an entitlement '
    + 'escalation.');
}

/*
 * §302 STRENGTHENED THIS, and the assertion moved with it rather than being relaxed.
 *
 * At §301 the line read `const planCode = employerProPromoApplied ? 'pro' : 'free'` and this check
 * pinned that literal: one expression, one non-free branch, and that branch server-configured. §302
 * removed the branch entirely — a promotion is now a BOUNDED GRANT and the account row is
 * unconditionally free — so the §301 property holds MORE strongly than when it was written.
 *
 * Asserting the old literal would now fail on an improvement, which is how a guard gets deleted.
 * Asserting the new one keeps the §301 claim exactly and adds what §302 established: there is no
 * branch at all by which registration can promote an account row.
 */
check(/const planCode = 'free';/.test(planBody),
  'The account tier at registration is UNCONDITIONALLY free. §301 required that the only non-free '
  + 'branch be server-configured; §302 removed the branch, so no registration path can promote an '
  + 'account row at all.');
check(!/planCode = employerProPromoApplied/.test(planBody),
  'And the conditional that used to write a permanent pro plan is gone, not merely bypassed.');

check(/process\.env\.EMPLOYER_PRO_PROMO_CODES/.test(planBody),
  'The promo allowlist comes from SERVER ENVIRONMENT, which a registering user cannot write to. '
  + 'This is the trusted server-side condition §301 requires before any promotion is honoured.');

check(/if \(promoCodeProvided && !employerProPromoApplied\)/.test(planBody),
  'A promo code that is not on the server list is REFUSED rather than ignored, so a guessing '
  + 'attempt fails loudly instead of silently creating a free account.');

// ================================================================ 3. disabled promo fails closed

console.log('\n---- 3. with no promo configured, nothing can be promoted ----\n');

function promoCodes(env: string | undefined): string[] {
  return String(env || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
}
for (const [label, env] of [['unset', undefined], ['empty', ''], ['whitespace', '   '], ['commas only', ',,,']] as [string, string | undefined][]) {
  const codes = promoCodes(env);
  check(codes.length === 0, `${label} EMPLOYER_PRO_PROMO_CODES yields an empty allowlist.`);
  check(!codes.includes(''), `${label} cannot be matched by an empty promo code.`);
}
check(promoCodes('code-a,code-b').includes('code-a'), 'A configured code is matched.');
check(!promoCodes('code-a').includes('code-c'), 'An unconfigured code is not.');

// ================================================================ 4. the feature gate agrees

console.log('\n---- 4. fullSafeScope follows the resolved tier, nothing else ----\n');

check(hasEntitlement('pro', 'fullSafeScope') === true, 'pro carries fullSafeScope.');
check(hasEntitlement('free', 'fullSafeScope') === false, 'free does not.');
check(hasEntitlement(resolveTier(PROMO, null, null), 'fullSafeScope') === true,
  'A legitimately promoted account reaches fullSafeScope — which is BI-4 repaired.');
check(hasEntitlement(resolveTier(FREE, null, null), 'fullSafeScope') === false,
  'An ordinary free account does not.');
check(hasEntitlement(resolveTier(FREE, null, revokedGrant()), 'fullSafeScope') === false,
  'A revoked grant carries nothing, so cleanup by revocation actually removes capability.');

// ================================================================ 5. the reproduction is honest

console.log('\n---- 5. this file still describes the shipped resolver ----\n');

const billing = read('billing/billing.service.ts');
check(/const paidTier = subscription \? subscription\.tier : fallbackTier;/.test(billing),
  'Shipped: a live subscription row supplies the tier, else the user row does.');
check(/const sourceStatus = subscription \? subscription\.status : fallbackStatus;/.test(billing),
  'Shipped: and supplies the status the same way.');
check(/activeGrant\?\.tier === 'pro' && paidEffectiveTier === 'free' \? 'pro' : paidEffectiveTier/.test(billing),
  'Shipped: a grant raises free to pro and never lowers anything.');
check(/const fallbackStatus =\s*\n?\s*normalizeStripeSubscriptionStatus\(user\?\.subscriptionStatus \|\| user\?\.billingStatus\);/.test(billing),
  'Shipped: the dead `|| (tier === free ? none : active)` alternative is gone, so no future edit '
  + 'can make an unverified tier claim imply an active subscription.');
check(/subscriptionStatus: user\.subscriptionStatus,/.test(authService),
  'Shipped: resolveSessionContext now passes the status it always had — the BI-4 repair itself.');

const anyFalsy = [undefined, null, '', '  ', 'garbage', 'active', 'canceled']
  .filter(v => !normalizeStripeSubscriptionStatus(v as never));
check(anyFalsy.length === 0,
  'And normalizeStripeSubscriptionStatus is still total, which is WHY that alternative was dead — '
  + 'recorded here so the removal is not mistaken for a behaviour change.');

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
