/**
 * §301 / BI-4 — THE WHOLE CHAIN, THROUGH THE REAL HTTP PRODUCT PATH.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT ANALYSES. Runs against a DISPOSABLE database only.
 * Runs with `npm run test:301-entitlement-integration` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THE UNIT SUITE CANNOT DO.
 *
 * `test-301-entitlement-authority.ts` proves the precedence function and the source-level guard.
 * It cannot prove that the CHAIN agrees end to end — registration, the user row, a fresh login, the
 * JWT the server mints, the entitlement guard, and the classify route are five separate places that
 * each form a view of the same question, and BI-4 was precisely two of them disagreeing.
 *
 * So this drives the real routes:
 *
 *     authorization -> registration -> fresh authentication -> session context
 *                   -> entitlement resolution -> /hazlenz/classify
 *
 * ---------------------------------------------------------------------------------------------
 * IT REPRODUCES BI-4 BEFORE PROVING THE REPAIR.
 *
 * Case B runs the §300 observation of the defect against the CURRENT code and asserts it no longer
 * happens; case B-PRE reproduces the defective resolution directly from the pre-repair expression,
 * so the suite distinguishes "repaired" from "never broken". A test that only shows the good state
 * cannot tell those apart.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { normalizeStripeSubscriptionStatus, resolveAccessTier } from '../src/billing/subscription-status';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

// ================================================================ the disposable-target guard

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('§301 REFUSED: DATABASE_URL is unset. This suite writes rows and will not fall '
      + 'back to discrete DB_* variables, which in this repository resolve to the development '
      + 'database.');
  }
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§301 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§301 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§301 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§301 REFUSED: DEV_AUTH_BYPASS is on. An entitlement suite run under it would '
      + 'measure the bypass rather than the guard.');
  }
  return database;
}

// ================================================================ harness

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

let baseUrl = '';
type Json = Record<string, any>;

let ipCounter = 0;

async function call(
  path: string, options: { method?: string; body?: unknown; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  // A distinct forwarded address per call, with `trust proxy` enabled below, gives each case its
  // own throttle bucket -- the same convention §264/§265 use. The auth routes throttle at 5/60s
  // and this suite makes more than five registrations; without this the sixth is refused by the
  // rate limiter and the failure looks like an entitlement result.
  headers['x-forwarded-for'] = options.ip ?? `10.30.1.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

const decodeJwt = (token: string): Json => {
  const part = token.split('.')[1];
  return JSON.parse(Buffer.from(part + '='.repeat((4 - part.length % 4) % 4), 'base64url').toString());
};

const PROMO = 's301-promo-secret-not-guessable';
const PASSWORD = 'Section301!StrongPass123';

async function main(): Promise<void> {
  provenDisposableTarget();
  // The server-side allowlist. Set in THIS process only: the point of the mechanism is that a
  // registering user cannot write to it, and a suite that let the client supply it would be
  // testing a different system.
  process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§301 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const register = async (tag: string, extra: Json = {}) => {
    const email = `s301-${tag}-${suffix}@example.test`;
    const res = await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s301-${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(),
        ...extra,
      },
    });
    return { email, res };
  };
  const login = async (email: string) => {
    const res = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    return { res, token: res.body?.token as string | undefined };
  };
  const classify = async (token: string) =>
    call('/hazlenz/classify', {
      method: 'POST', token,
      body: { text: 'A stocker was working three feet from an unguarded twelve foot opening.' },
    });

  // ============================================================ A. ordinary free registration

  console.log('---- A. ordinary free registration (matrix 1) ----\n');
  const a = await register('free');
  check(a.res.status === 201, 'A-1 an ordinary registration succeeds', `${a.res.status}`);
  check(a.res.body.planCode === 'free', 'A-2 and is FREE', String(a.res.body.planCode));
  const aLogin = await login(a.email);
  const aClaims = decodeJwt(aLogin.token as string);
  check(aClaims.planCode === 'free', 'A-3 the JWT says free', String(aClaims.planCode));
  check(aClaims.billingEntitlements?.fullSafeScope === false,
    'A-4 without fullSafeScope', String(aClaims.billingEntitlements?.fullSafeScope));
  const aClassify = await classify(aLogin.token as string);
  check(aClassify.status === 402, 'A-5 and classify refuses it with 402', `${aClassify.status}`);

  // ============================================================ B. legitimate promo — the repair

  console.log('\n---- B. legitimate server-authorized promo (matrix 3) — THE BI-4 REPAIR ----\n');
  const b = await register('promo', { promoCode: PROMO });
  check(b.res.status === 201 && b.res.body.promoApplied === true,
    'B-1 a registration carrying the SERVER-CONFIGURED code is promoted',
    `${b.res.status} promoApplied=${b.res.body.promoApplied}`);
  /*
   * §302 CHANGED THE REPRESENTATION, AND THESE TWO ASSERTIONS MOVED WITH IT.
   *
   * At §301 a promotion wrote planCode=pro / subscriptionStatus=active onto the user row, and B-2
   * and B-3 asserted exactly that. §302 closed EN-3 by making a promotion a BOUNDED GRANT and
   * leaving the account row truthful, so asserting the old shape would now fail on the improvement.
   *
   * The §301 PROPERTY is unchanged and is still what B-4 to B-7 measure: a legitimately authorized
   * promotion survives the next login and reaches classify. What changed is where the entitlement
   * lives, and these two now assert the new home.
   */
  check(b.res.body.planCode === 'free',
    'B-2 registration answers FREE for the ACCOUNT PLAN — §302 no longer fabricates paid billing '
    + 'state for a promotion', String(b.res.body.planCode));
  check(b.res.body.promotionalEntitlement?.tier === 'pro',
    'B-2b and reports the temporary capability separately',
    JSON.stringify(b.res.body.promotionalEntitlement));

  const [bRow] = await q(
    'SELECT "planCode", "subscriptionStatus" FROM "user" WHERE email = $1', [b.email]);
  check(bRow.planCode === 'free' && bRow.subscriptionStatus === 'none',
    'B-3 and the ACCOUNT ROW is truthful: nothing was purchased',
    `${bRow.planCode}/${bRow.subscriptionStatus}`);
  const [bGrant] = await q(
    `SELECT g.status, g.tier FROM entitlement_grants g JOIN "user" u ON u.id = g."userId"
      WHERE u.email = $1`, [b.email]);
  check(bGrant?.status === 'active' && bGrant?.tier === 'pro',
    'B-3b the entitlement lives in a BOUNDED GRANT instead', `${bGrant?.status}/${bGrant?.tier}`);

  const bLogin = await login(b.email);
  const bClaims = decodeJwt(bLogin.token as string);
  check(bClaims.planCode === 'pro',
    'B-4 A FRESH LOGIN STILL RESOLVES PRO. This is the exact step where §300 measured free.',
    String(bClaims.planCode));
  check(bClaims.billingEntitlements?.fullSafeScope === true,
    'B-5 the JWT carries fullSafeScope', String(bClaims.billingEntitlements?.fullSafeScope));
  const bClassify = await classify(bLogin.token as string);
  check(bClassify.status === 201 || bClassify.status === 200,
    'B-6 AND /hazlenz/classify RETURNS A DETERMINISTIC CLASSIFICATION RATHER THAN 402',
    `${bClassify.status}`);
  check(Array.isArray(bClassify.body?.applicabilityDecisions),
    'B-7 the response is a real analysis, not an empty shell');

  // ------------------------------------------------ B-PRE: the defect, reproduced
  console.log('\n   the pre-repair resolution, reproduced from the old expression:\n');
  /*
   * The row this reproduces is now itself historical. §302 stopped writing planCode=pro /
   * subscriptionStatus=active at registration, so the live account above no longer has the shape
   * BI-4 acted on. The reproduction therefore uses a LITERAL representative of the pre-§302 row —
   * which is what every account promoted before §302 actually looks like, and what the resolver
   * must still handle correctly for them.
   */
  const historicalPromoRow = { planCode: 'pro', subscriptionStatus: 'active' };
  const preRepairFallbackStatus =
    normalizeStripeSubscriptionStatus(undefined as never)   // the status was NOT passed
    || (historicalPromoRow.planCode === 'free' ? 'none' : 'active');  // the dead alternative
  const preRepairTier = resolveAccessTier(
    historicalPromoRow.planCode, preRepairFallbackStatus as never, null);
  const postRepairTier = resolveAccessTier(
    historicalPromoRow.planCode,
    normalizeStripeSubscriptionStatus(historicalPromoRow.subscriptionStatus), null);
  console.log(`      pre-repair : status=${preRepairFallbackStatus} -> tier=${preRepairTier}`);
  console.log(`      post-repair: status=${normalizeStripeSubscriptionStatus(bRow.subscriptionStatus)} -> tier=${postRepairTier}`);
  check(preRepairTier === 'free',
    'B-PRE-1 the pre-repair expression resolves a pre-§302 promoted row to FREE, reproducing §300');
  check(postRepairTier === 'pro',
    'B-PRE-2 and the repaired one resolves it to PRO — the suite distinguishes repaired from '
    + 'never-broken');

  // ============================================================ C. public self-promotion refused

  console.log('\n---- C. an arbitrary public caller cannot self-promote (matrix 2, 12) ----\n');
  const cPlan = await register('forge-plan', { planCode: 'pro' });
  check(cPlan.res.status === 201 || cPlan.res.status === 400,
    'C-1 a registration asking for planCode pro is accepted-or-rejected, never honoured',
    `${cPlan.res.status}`);
  if (cPlan.res.status === 201) {
    check(cPlan.res.body.planCode === 'free',
      'C-2 REQUESTING pro DOES NOT GRANT pro', String(cPlan.res.body.planCode));
    const cLogin = await login(cPlan.email);
    const cClaims = decodeJwt(cLogin.token as string);
    check(cClaims.planCode === 'free' && cClaims.billingEntitlements?.fullSafeScope === false,
      'C-3 and the session it gets carries no paid capability');
    const cClassify = await classify(cLogin.token as string);
    check(cClassify.status === 402, 'C-4 classify still refuses it', `${cClassify.status}`);
  }

  const cSelected = await register('forge-selected', { selectedPlan: 'pro' });
  check(cSelected.res.status !== 201 || cSelected.res.body.planCode === 'free',
    'C-5 selectedPlan pro is equally inert',
    `${cSelected.res.status}/${cSelected.res.body.planCode}`);

  const cGuess = await register('guess-promo', { promoCode: 'not-the-configured-code' });
  check(cGuess.res.status === 400,
    'C-6 GUESSING the promo code is REFUSED, and leaves no account behind',
    `${cGuess.res.status}`);
  const [guessCount] = await q('SELECT count(*)::int AS n FROM "user" WHERE email = $1', [cGuess.email]);
  check(guessCount.n === 0, 'C-7 no user row was created by the refused attempt', `${guessCount.n}`);

  // ============================================================ D. grants: active, expired, revoked

  console.log('\n---- D. bounded entitlement grants (matrix 6, 7, 8) ----\n');
  const d = await register('grant');
  check(d.res.status === 201, 'D-0 the grant-case account registered', `${d.res.status}`);
  const [dUser] = await q('SELECT id FROM "user" WHERE email = $1', [d.email]);
  if (!dUser) throw new Error(`§301 ABORT: no user row for ${d.email} (register status `
    + `${d.res.status}: ${JSON.stringify(d.res.body).slice(0, 200)})`);
  // Real Date objects, not SQL fragments: a bind parameter is a literal, so `now() - interval ...`
  // arrives as a string the driver cannot parse into a timestamptz.
  const ago = (h: number) => new Date(Date.now() - h * 3600_000);
  const ahead = (h: number) => new Date(Date.now() + h * 3600_000);
  const grant = async (startsAt: Date, endsAt: Date, status: string) => {
    await q('DELETE FROM entitlement_grants WHERE "userId" = $1', [dUser.id]);
    const [row] = await q(
      `INSERT INTO entitlement_grants ("userId", source, tier, status, "startsAt", "endsAt", reason)
       VALUES ($1,'pilot','pro',$2,$3,$4,'§301 matrix') RETURNING id`,
      [dUser.id, status, startsAt, endsAt]);
    return row.id as string;
  };
  const tierAfterLogin = async (email: string) => {
    const l = await login(email);
    const c = decodeJwt(l.token as string);
    return { tier: c.planCode as string, full: c.billingEntitlements?.fullSafeScope as boolean, token: l.token as string };
  };

  await grant(ago(1), ahead(1), 'active');
  const dActive = await tierAfterLogin(d.email);
  check(dActive.tier === 'pro' && dActive.full === true,
    'D-1 an ACTIVE bounded grant raises a free account to pro', `${dActive.tier}`);
  const dActiveClassify = await classify(dActive.token);
  check(dActiveClassify.status === 201 || dActiveClassify.status === 200,
    'D-2 and classify accepts it', `${dActiveClassify.status}`);

  await grant(ago(2), ago(1), 'active');
  const dExpired = await tierAfterLogin(d.email);
  check(dExpired.tier === 'free' && dExpired.full === false,
    'D-3 an EXPIRED grant carries nothing', `${dExpired.tier}`);
  const dExpiredClassify = await classify(dExpired.token);
  check(dExpiredClassify.status === 402, 'D-4 and classify refuses', `${dExpiredClassify.status}`);

  await grant(ago(1), ahead(1), 'revoked');
  const dRevoked = await tierAfterLogin(d.email);
  check(dRevoked.tier === 'free' && dRevoked.full === false,
    'D-5 a REVOKED grant carries nothing, so revocation is a real cleanup mechanism',
    `${dRevoked.tier}`);

  // ============================================================ E. stale session cannot elevate

  console.log('\n---- E. a stale session cannot outlive its authority (matrix 10, 11) ----\n');
  await grant(ago(1), ahead(1), 'active');
  const stale = await tierAfterLogin(d.email);
  check(stale.full === true, 'E-1 a token minted while entitled works');
  await q('UPDATE entitlement_grants SET status = $1 WHERE "userId" = $2', ['revoked', dUser.id]);

  /*
   * MEASURED, NOT ASSUMED. §301 matrix 10 asks that a FRESH session carry the same authoritative
   * entitlement, and matrix 11 that a stale one cannot ELEVATE authority. Neither says a token
   * already issued must stop working mid-life, and asserting that without checking would be
   * asserting a property of JWTs in general rather than of this product. So the retention window
   * is measured and reported, and the two things §301 actually requires are asserted hard.
   */
  const staleClassify = await classify(stale.token);
  const freshAfterRevoke = await tierAfterLogin(d.email);
  console.log(`      measured: a token minted BEFORE revocation -> classify ${staleClassify.status}`);
  console.log(`      measured: a FRESH login AFTER revocation   -> tier ${freshAfterRevoke.tier}, `
    + `fullSafeScope ${freshAfterRevoke.full}`);

  check(freshAfterRevoke.tier === 'free' && freshAfterRevoke.full === false,
    'E-2 A FRESH SESSION RE-DERIVES AUTHORITY FROM SERVER STATE: once the grant is revoked, a new '
    + 'login carries no paid capability. This is what makes revocation a real cleanup mechanism '
    + 'and is the §301 matrix-10 requirement.', `${freshAfterRevoke.tier}`);

  const freshClassify = await classify(freshAfterRevoke.token);
  check(freshClassify.status === 402,
    'E-3 and that fresh session is refused by classify', `${freshClassify.status}`);

  check(staleClassify.status === 402 || staleClassify.status === 201 || staleClassify.status === 200,
    'E-4 the pre-revocation token neither errors nor escalates — it either still carries what it '
    + `was issued with, or has already lost it. MEASURED: ${staleClassify.status}. It cannot gain `
    + 'anything it did not have, which is the matrix-11 requirement.', `${staleClassify.status}`);
  if (staleClassify.status !== 402) {
    console.log('      NOTE: an already-issued token RETAINS capability until it expires.');
  } else {
    console.log('      NOTE: §302 closed EN-2 for GRANT-DERIVED authority — a session whose tier '
      + 'came from a grant re-checks live state, so revocation is immediate rather than waiting '
      + 'for the token to expire. This case measured 201 at §301 and measures 402 now.');
  }

  // ============================================================ F. tenant isolation

  console.log('\n---- F. one tenant\'s grant does not entitle another (matrix 13) ----\n');
  const f = await register('tenant-b');
  await q('UPDATE entitlement_grants SET status = $1 WHERE "userId" = $2', ['active', dUser.id]);
  const fLogin = await tierAfterLogin(f.email);
  check(fLogin.tier === 'free' && fLogin.full === false,
    'F-1 tenant B is FREE while tenant A holds an active grant', `${fLogin.tier}`);
  const fClassify = await classify(fLogin.token);
  check(fClassify.status === 402, 'F-2 and classify refuses tenant B', `${fClassify.status}`);

  // ============================================================ G. promo disabled fails closed

  console.log('\n---- G. with the promo disabled, nothing is promoted (matrix 16) ----\n');
  delete process.env.EMPLOYER_PRO_PROMO_CODES;
  const g = await register('promo-disabled', { promoCode: PROMO });
  check(g.res.status === 400,
    'G-1 the SAME code that worked in B is refused once the server list is empty',
    `${g.res.status}`);
  const [gCount] = await q('SELECT count(*)::int AS n FROM "user" WHERE email = $1', [g.email]);
  check(gCount.n === 0, 'G-2 and no account was created', `${gCount.n}`);
  process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;

  // ============================================================

  await app.close();
  console.log(`\n================ §301 entitlement integration: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, expertAnalyses: 0, passed, failed: failures.length,
  }));
  if (failures.length > 0) {
    for (const f of failures) console.error(`  FAILED: ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
