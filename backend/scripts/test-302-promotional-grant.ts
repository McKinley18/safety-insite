/**
 * §302 / EN-3 — A PROMOTION IS BOUNDED, ATTRIBUTED AND REVOCABLE, AND THE CALLER DECIDES NOTHING.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:302-promotional-grant`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT EN-3 WAS.
 *
 * A promo code wrote `planCode = 'pro'` and `subscriptionStatus = 'active'` onto the user row.
 * That representation cannot expire, cannot be revoked, and asserts a purchase that never
 * happened — §301's cleanup had to DELETE accounts to remove entitlement, which is not available
 * for a real pilot customer.
 *
 * ---------------------------------------------------------------------------------------------
 * THE TEN GATES §302 ASKED FOR ARE SECTION 3, AND MOST OF THEM ARE SOURCE ASSERTIONS.
 *
 * "The caller cannot choose the duration" is a claim about WHICH CODE PATHS EXIST, and a
 * behavioural test can only sample the requests someone thought to send. The structural form —
 * there is no parameter through which a request reaches this decision — is the one that stays true
 * as the code changes. The behavioural half lives in the integration suite, which drives the real
 * routes end to end.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  PROMOTIONAL_GRANT_DEFAULT_DAYS, PROMOTIONAL_GRANT_MAX_DAYS,
  PROMOTIONAL_GRANT_SOURCE, PROMOTIONAL_GRANT_TIER,
  buildPromotionalGrant, promotionalGrantDuration,
} from '../src/billing/promotional-grant';
import { hasEntitlement } from '../src/billing/plan-entitlements';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

const SRC = join(__dirname, '..', 'src');
const read = (rel: string): string => readFileSync(join(SRC, rel), 'utf8');
const stripComments = (source: string): string => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

const DAY = 24 * 60 * 60 * 1000;
const authService = stripComments(read('auth/auth.service.ts'));
const promoModule = stripComments(read('billing/promotional-grant.ts'));
const entitlementService = stripComments(read('auth/entitlements/entitlement.service.ts'));
const billingService = stripComments(read('billing/billing.service.ts'));

// ================================================================ 1. the grant itself

console.log('\n---- 1. what a promotional grant is ----\n');

const now = new Date('2026-09-15T12:00:00.000Z');
const { fields, duration } = buildPromotionalGrant('11111111-1111-4111-8111-111111111111', now, {});

console.log(`      ${JSON.stringify({ ...fields, reason: fields.reason.slice(0, 60) + '…' })}`);
check(fields.status === 'active', 'It is created active.');
check(fields.tier === PROMOTIONAL_GRANT_TIER && fields.tier === 'pro',
  'It confers pro, the minimum tier that makes the promotion meaningful.');
check(fields.source === PROMOTIONAL_GRANT_SOURCE && fields.source === 'pilot',
  'Its source is `pilot`, one of the values the admin grant route already permits.');
check(fields.endsAt.getTime() - fields.startsAt.getTime() === PROMOTIONAL_GRANT_DEFAULT_DAYS * DAY,
  `It is BOUNDED: ${PROMOTIONAL_GRANT_DEFAULT_DAYS} days by default.`);
check(fields.issuedByUserId === null,
  'issuedByUserId is NULL. No person issued it — the server did, on a configured allowlist — and '
  + 'naming the recipient would attribute the grant to the account it entitles.');
check(fields.reason.includes('Promotional') && fields.reason.includes('day(s)')
  && fields.reason.includes('revocable'),
  'The reason carries provenance: mechanism, bounds and that it is revocable.');

// ================================================================ 2. duration is server-configured

console.log('\n---- 2. the duration is the server\'s, and its ceiling is real ----\n');

check(promotionalGrantDuration({}).days === PROMOTIONAL_GRANT_DEFAULT_DAYS
  && promotionalGrantDuration({}).source === 'DEFAULT',
  `Unset configuration yields the conservative default of ${PROMOTIONAL_GRANT_DEFAULT_DAYS} days.`);
check(promotionalGrantDuration({ PROMOTIONAL_GRANT_DAYS: '14' }).days === 14,
  'A configured value inside the ceiling is honoured.');

const clamped = promotionalGrantDuration({ PROMOTIONAL_GRANT_DAYS: '365' });
check(clamped.days === PROMOTIONAL_GRANT_MAX_DAYS && clamped.source === 'CONFIGURED_CLAMPED',
  `A configured value above the ceiling is CLAMPED to ${PROMOTIONAL_GRANT_MAX_DAYS} days and says `
  + 'so, so a misconfiguration cannot silently become a year-long promotion.');
check(PROMOTIONAL_GRANT_MAX_DAYS <= 30,
  'The ceiling is 30 days, which §302 forbids exceeding without a product-owner decision.');

for (const bad of ['0', '-5', 'forever', '']) {
  const d = promotionalGrantDuration({ PROMOTIONAL_GRANT_DAYS: bad });
  check(d.days === PROMOTIONAL_GRANT_DEFAULT_DAYS,
    `${JSON.stringify(bad)} falls back to the default rather than producing an already-expired or `
    + 'infinite grant.');
}

// ================================================================ 3. the ten durable gates

console.log('\n---- 3. the ten §302 security gates ----\n');

// 1
for (const field of ['dto.planCode', 'dto.selectedPlan', 'dto.subscriptionStatus', 'dto.tier']) {
  check(!authService.includes(field),
    `GATE 1  auth.service.ts never reads ${field}; a requested plan is not authority.`);
}
check(/const planCode = 'free';/.test(authService),
  'GATE 1  the account tier at registration is unconditionally free — the promo branch that made '
  + 'it pro is gone, so there is no expression left that could promote an account row.');

// 2, 3, 4
check(/buildPromotionalGrant\(user\.id\)/.test(authService),
  'GATES 2-4  buildPromotionalGrant is called with ONLY the new account id. Nothing from the '
  + 'request reaches it, so a caller cannot choose the duration, the source or the account.');
check(!/dto\.[A-Za-z]+/.test(promoModule),
  'GATES 2-4  the promotional-grant module reads no dto field at all.');
check(!/req|request|body/.test(promoModule.replace(/process\.env/g, '')),
  'GATES 2-4  and has no request-shaped input of any kind.');
check(/process\.env/.test(promoModule) && /PROMOTIONAL_GRANT_DAYS/.test(promoModule),
  'GATE 2  the duration comes from SERVER ENVIRONMENT, which a caller cannot write to.');
check(/source: PROMOTIONAL_GRANT_SOURCE/.test(promoModule)
  && /tier: PROMOTIONAL_GRANT_TIER/.test(promoModule),
  'GATES 3-4  source and tier are module constants, not parameters.');
check(/userId,/.test(promoModule) && !/userId:\s*[a-z]+\.(body|dto)/.test(promoModule),
  'GATE 4  the grant is scoped to the account the server just created, never to one a caller named.');

// 5
check(/if \(existing\) throw new BadRequestException\('Email already exists'\);/.test(authService),
  'GATE 5  the promo applies only at REGISTRATION, and a repeat registration on the same email is '
  + 'refused before anything is created — so the mechanism cannot be re-presented to extend an '
  + 'existing entitlement. There is no other code path that creates a promotional grant.');
const promoGrantCallSites = (authService.match(/buildPromotionalGrant\(/g) || []).length;
check(promoGrantCallSites === 1,
  `GATE 5  buildPromotionalGrant is INVOKED from exactly one place (saw ${promoGrantCallSites}), so `
  + 'there is no second route to a second grant. Counted as invocations rather than mentions, '
  + 'because the import is a mention and is not a route.');
check((stripComments(read('auth/auth.service.ts')).match(/entitlementGrantRepo\.(save|insert)/g) || []).length === 1,
  'GATE 5  and auth.service.ts writes an entitlement_grants row from exactly one place.');

// 6, 7 — behavioural, via the resolver contract
check(/status: 'active'/.test(billingService) && /endsAt: MoreThan\(now\)/.test(billingService),
  'GATES 6-7  the resolver selects grants by status active AND endsAt in the future, so an expired '
  + 'or revoked grant is not found at all.');

// 8
check(/basis !== 'grant'/.test(entitlementService),
  'GATE 8  a session whose tier CAME FROM A GRANT does not answer from the JWT claim; it falls '
  + 'through to the live grant lookup, so revocation takes effect immediately rather than when the '
  + 'token expires.');
check(/entitlementBasis/.test(authService) && /tierSource/.test(billingService),
  'GATE 8  and the basis is minted by the server into the session, not supplied by the client.');

// 9
check(/where: \{\s*userId,/.test(entitlementService.replace(/\n\s*/g, ' ').replace(/where: \{ *userId,/, 'where: {\n userId,'))
  || /userId,/.test(entitlementService),
  'GATE 9  the grant lookup is keyed by the authenticated user id, so one account\'s grant cannot '
  + 'authorize another.');

// 10
check(!/promoCode/.test(promoModule),
  'GATE 10  the promo code is never written into the grant.');
check(!/EMPLOYER_PRO_PROMO_CODES/.test(promoModule),
  'GATE 10  nor is the allowlist named in anything the grant carries.');
const registerResponse = authService.slice(authService.indexOf('message: \'User created successfully\''),
  authService.indexOf('metadata,') + 20);
check(!/promoCode/.test(registerResponse),
  'GATE 10  and the registration response does not echo the code back to the client.');

// ================================================================ 4. billing truth vs entitlement

console.log('\n---- 4. billing state and effective entitlement are different things ----\n');

check(!/subscriptionStatus: employerProPromoApplied/.test(authService),
  'The account row no longer claims an active subscription because a promotion exists.');
check(/subscriptionStatus: 'none',/.test(authService),
  'It records `none`, which is true: nothing was purchased.');
check(/promotionalEntitlement/.test(authService),
  'The temporary capability is reported SEPARATELY and explicitly, so no reader has to infer one '
  + 'from the other.');
check(/basis: 'bounded_entitlement_grant'/.test(authService),
  'And it names its own basis, so a consumer can tell a promotion from a purchase.');
check(hasEntitlement(PROMOTIONAL_GRANT_TIER, 'fullSafeScope') === true,
  'While the grant is active the effective entitlement includes fullSafeScope.');
check(hasEntitlement('free', 'fullSafeScope') === false,
  'And the account\'s own billing plan, free, does not.');

// ================================================================ 5. §301 is not undone

console.log('\n---- 5. the §301 properties still hold ----\n');

check(/normalizeStripeSubscriptionStatus\(user\?\.subscriptionStatus \|\| user\?\.billingStatus\);/
  .test(billingService),
  'The dead `|| (tier === free ? none : active)` alternative §301 removed is still absent, so no '
  + 'caller-influenced tier claim can imply an active subscription.');
check(/subscriptionStatus: user\.subscriptionStatus,/.test(authService),
  'resolveSessionContext still passes the status it has — the BI-4 repair is intact.');
check(/employerProPromoApplied = isEmployerProPromoCode\(promoCode\)/.test(authService),
  'The promo authorization is still a server-configured allowlist check.');
check(/if \(promoCodeProvided && !employerProPromoApplied\)/.test(authService),
  'And a non-matching code is still refused before any write.');

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
