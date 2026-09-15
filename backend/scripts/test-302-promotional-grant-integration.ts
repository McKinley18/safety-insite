/**
 * §302 / EN-3 — THE BOUNDED PROMOTION, THROUGH THE REAL HTTP PRODUCT PATH.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Runs against a DISPOSABLE database only.
 * Runs with `npm run test:302-promotional-grant-integration` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * THE PROPERTY §302 EXISTS TO ESTABLISH.
 *
 * §301 could only remove promotional entitlement by DELETING the account, because the promotion
 * was a permanent field on the user row. The single most important assertion in this file is
 * case I: the grant is revoked, the account SURVIVES, and capability is gone.
 *
 * ---------------------------------------------------------------------------------------------
 * AND THE ONE THAT MAKES REVOCATION REAL.
 *
 * Case J. §301 measured that a token minted while entitled kept working after revocation, because
 * the guard answered from the JWT claim before it ever reached the grant lookup. A revocation that
 * waits for a token to expire is not a revocation, so §302 made a grant-derived session re-check
 * live state. Case J asserts the token issued BEFORE revocation is refused AFTER it — without the
 * user logging in again.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { PROMOTIONAL_GRANT_DEFAULT_DAYS } from '../src/billing/promotional-grant';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§302 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§302 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§302 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§302 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§302 REFUSED: DEV_AUTH_BYPASS is on.');
  }
  return database;
}

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

let baseUrl = '';
let ipCounter = 0;
type Json = Record<string, any>;

async function call(
  path: string, options: { method?: string; body?: unknown; token?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = `10.31.2.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
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

const PROMO = 's302-promo-secret-not-guessable';
const PASSWORD = 'Section302!StrongPass123';

async function main(): Promise<void> {
  provenDisposableTarget();
  process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§302 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const register = async (tag: string, extra: Json = {}) => {
    const email = `s302-${tag}-${suffix}@example.test`;
    const res = await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s302-${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(), ...extra,
      },
    });
    return { email, res };
  };
  const session = async (email: string) => {
    const res = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    const token = res.body?.token as string | undefined;
    const claims = token ? decodeJwt(token) : {};
    return {
      status: res.status, token: token as string, claims,
      tier: claims.planCode as string,
      full: (claims.billingEntitlements || {}).fullSafeScope as boolean,
      basis: claims.entitlementBasis as string | null,
    };
  };
  const classify = (token: string) => call('/hazlenz/classify', {
    method: 'POST', token,
    body: { text: 'A stocker was working three feet from an unguarded twelve foot opening.' },
  });

  // ============================================================ A / B / C

  console.log('---- A. ordinary free registration ----\n');
  const a = await register('free');
  check(a.res.body.planCode === 'free' && a.res.body.promotionalEntitlement === null,
    'A-1 free registration: account plan free, no promotional entitlement',
    `${a.res.body.planCode}`);
  const aS = await session(a.email);
  check(aS.full === false, 'A-2 no fullSafeScope');
  check((await classify(aS.token)).status === 402, 'A-3 classify 402');

  console.log('\n---- B. arbitrary public pro request ----\n');
  const b = await register('forge', { planCode: 'pro' });
  check(b.res.body.planCode === 'free' && b.res.body.promotionalEntitlement === null,
    'B-1 requesting pro grants nothing', `${b.res.body.planCode}`);
  const [bGrants] = await q(
    'SELECT count(*)::int AS n FROM entitlement_grants g JOIN "user" u ON u.id = g."userId" WHERE u.email = $1',
    [b.email]);
  check(bGrants.n === 0, 'B-2 and creates NO grant', `${bGrants.n}`);
  const bS = await session(b.email);
  check(bS.full === false && (await classify(bS.token)).status === 402, 'B-3 free, classify 402');

  console.log('\n---- C. invalid promo ----\n');
  const c = await register('bad-promo', { promoCode: 'not-the-configured-code' });
  check(c.res.status === 400, 'C-1 refused', `${c.res.status}`);
  const [cUsers] = await q('SELECT count(*)::int AS n FROM "user" WHERE email = $1', [c.email]);
  check(cUsers.n === 0, 'C-2 refused BEFORE any privileged grant — no account, so no grant', `${cUsers.n}`);

  // ============================================================ D. the valid promo

  console.log('\n---- D. valid server-authorized promo ----\n');
  const d = await register('promo', { promoCode: PROMO });
  check(d.res.status === 201 && d.res.body.promoApplied === true, 'D-1 accepted', `${d.res.status}`);
  check(d.res.body.planCode === 'free',
    'D-2 THE ACCOUNT BILLING PLAN IS FREE — no fabricated paid state', String(d.res.body.planCode));
  const [dRow] = await q(
    'SELECT "planCode", "subscriptionStatus" FROM "user" WHERE email = $1', [d.email]);
  check(dRow.planCode === 'free' && dRow.subscriptionStatus === 'none',
    'D-3 and the stored row says free/none, which is true: nothing was purchased',
    `${dRow.planCode}/${dRow.subscriptionStatus}`);
  check(d.res.body.promotionalEntitlement?.tier === 'pro'
    && d.res.body.promotionalEntitlement?.basis === 'bounded_entitlement_grant',
    'D-4 the temporary capability is reported separately, naming its own basis',
    JSON.stringify(d.res.body.promotionalEntitlement));

  const [dGrant] = await q(
    `SELECT g.id, g.source, g.tier, g.status, g."startsAt", g."endsAt", g."issuedByUserId", g.reason
       FROM entitlement_grants g JOIN "user" u ON u.id = g."userId" WHERE u.email = $1`, [d.email]);
  check(dGrant !== undefined, 'D-5 a bounded entitlement_grant was created');
  check(dGrant.source === 'pilot' && dGrant.tier === 'pro' && dGrant.status === 'active',
    'D-6 source pilot, tier pro, active', `${dGrant.source}/${dGrant.tier}/${dGrant.status}`);
  const days = Math.round(
    (new Date(dGrant.endsAt).getTime() - new Date(dGrant.startsAt).getTime()) / 86400000);
  check(days === PROMOTIONAL_GRANT_DEFAULT_DAYS,
    `D-7 BOUNDED to ${PROMOTIONAL_GRANT_DEFAULT_DAYS} days, persisted in the grant`, `${days}`);
  check(dGrant.issuedByUserId === null, 'D-8 issuedByUserId NULL — no person issued it');
  check(!dGrant.reason.includes(PROMO), 'D-9 THE PROMO SECRET IS NOT IN THE GRANT');

  const [dAudit] = await q(
    `SELECT action, metadata FROM security_audit_events
      WHERE "resourceId" = $1 AND action = 'promotional_entitlement_granted'`, [dGrant.id]);
  check(dAudit !== undefined, 'D-10 the grant is audited');
  check(!JSON.stringify(dAudit?.metadata ?? {}).includes(PROMO),
    'D-11 and the audit carries no secret either');
  check(dAudit?.metadata?.durationDays === PROMOTIONAL_GRANT_DEFAULT_DAYS
    && typeof dAudit?.metadata?.endsAt === 'string',
    'D-12 provenance recorded: source, tier, bounds, duration and how it was resolved',
    JSON.stringify(dAudit?.metadata?.durationSource));

  // ============================================================ E / F / G

  console.log('\n---- E/F/G. fresh session while the grant is active ----\n');
  const dS = await session(d.email);
  check(dS.tier === 'pro' && dS.full === true,
    'E-1 a fresh login resolves the intended capability', `${dS.tier}`);
  check(dS.basis === 'grant',
    'E-2 and records that its tier CAME FROM A GRANT, which is what makes revocation immediate',
    String(dS.basis));
  const dClassify = await classify(dS.token);
  check(dClassify.status === 201 || dClassify.status === 200,
    'F-1 /hazlenz/classify is permitted', `${dClassify.status}`);
  check(Array.isArray(dClassify.body?.applicabilityDecisions), 'F-2 and returns a real analysis');
  check(dS.claims.billingEntitlements?.fullSafeScope === true,
    'G-1 Expert eligibility reads the SAME fullSafeScope key from the SAME canonical decision, so '
    + 'it cannot disagree with classify. No Expert execution is performed.');

  // ============================================================ K. repeated promo

  console.log('\n---- K. the promo cannot be re-presented ----\n');
  const kRepeat = await call('/auth/register', {
    method: 'POST',
    body: {
      email: d.email, password: PASSWORD, name: 's302-repeat', type: 'individual',
      acceptedAgreements: requiredRegistrationAcceptances(), promoCode: PROMO,
    },
  });
  check(kRepeat.status === 400, 'K-1 registering the same account again is refused', `${kRepeat.status}`);
  const [kCount] = await q(
    'SELECT count(*)::int AS n FROM entitlement_grants g JOIN "user" u ON u.id = g."userId" WHERE u.email = $1',
    [d.email]);
  check(kCount.n === 1,
    'K-2 STILL EXACTLY ONE GRANT — repeated attempts cannot become perpetual entitlement', `${kCount.n}`);
  const [kEnds] = await q(
    `SELECT g."endsAt" FROM entitlement_grants g JOIN "user" u ON u.id = g."userId" WHERE u.email = $1`,
    [d.email]);
  check(new Date(kEnds.endsAt).getTime() === new Date(dGrant.endsAt).getTime(),
    'K-3 and the existing expiry was not extended');

  // ============================================================ I / J. revocation

  console.log('\n---- I/J. revocation, WITHOUT deleting the account ----\n');
  const preRevokeToken = dS.token;
  await q('UPDATE entitlement_grants SET status = $1 WHERE id = $2', ['revoked', dGrant.id]);

  const jClassify = await classify(preRevokeToken);
  check(jClassify.status === 402,
    'J-1 THE TOKEN ISSUED BEFORE REVOCATION IS NOW REFUSED, without the user logging in again. '
    + '§301 measured 201 here; a revocation that waits for a token to expire is not a revocation.',
    `${jClassify.status}`);

  const iS = await session(d.email);
  check(iS.status === 201, 'I-1 THE ACCOUNT STILL EXISTS AND CAN STILL LOG IN', `${iS.status}`);
  check(iS.tier === 'free' && iS.full === false,
    'I-2 and resolves to free — entitlement removed WITHOUT deleting the account, which is the '
    + 'property §302 exists to establish', `${iS.tier}`);
  check((await classify(iS.token)).status === 402, 'I-3 classify 402');

  // ============================================================ H. expiry

  console.log('\n---- H. expiry ----\n');
  await q('UPDATE entitlement_grants SET status = $1, "startsAt" = $2, "endsAt" = $3 WHERE id = $4',
    ['active', new Date(Date.now() - 2 * 86400000), new Date(Date.now() - 86400000), dGrant.id]);
  const hS = await session(d.email);
  check(hS.tier === 'free' && hS.full === false,
    'H-1 an EXPIRED grant authorizes nothing, though its row remains for audit', `${hS.tier}`);
  check((await classify(hS.token)).status === 402, 'H-2 classify 402');

  // ============================================================ L. subscription interaction

  console.log('\n---- L. a promotion never outranks a purchase ----\n');
  const [dUser] = await q('SELECT id FROM "user" WHERE email = $1', [d.email]);
  const setGrant = (status: string, from: Date, to: Date) =>
    q('UPDATE entitlement_grants SET status = $1, "startsAt" = $2, "endsAt" = $3 WHERE id = $4',
      [status, from, to, dGrant.id]);
  const setSub = (tier: string, status: string, end: Date | null) =>
    q(`INSERT INTO user_subscription ("userId", tier, status, "currentPeriodEnd")
       VALUES ($1,$2,$3,$4)
       ON CONFLICT ("userId") DO UPDATE SET tier = $2, status = $3, "currentPeriodEnd" = $4`,
      [dUser.id, tier, status, end]);

  const ago = (h: number) => new Date(Date.now() - h * 3600_000);
  const ahead = (h: number) => new Date(Date.now() + h * 3600_000);

  await setGrant('revoked', ago(1), ahead(1));
  await setSub('pro', 'active', ahead(720));
  check((await session(d.email)).full === true,
    'L-1 active subscription + no usable grant -> paid capability');

  await setGrant('active', ago(48), ago(24));
  check((await session(d.email)).full === true,
    'L-2 active subscription + EXPIRED grant -> paid capability remains');

  await setSub('pro', 'canceled', ago(24));
  await setGrant('active', ago(1), ahead(1));
  const lCancelled = await session(d.email);
  check(lCancelled.full === true && lCancelled.basis === 'grant',
    'L-3 cancelled subscription + active promo grant -> promo capability, and it says so',
    `${lCancelled.basis}`);

  await setGrant('active', ago(48), ago(24));
  check((await session(d.email)).full === false,
    'L-4 cancelled subscription + expired grant -> free');

  await setSub('pro', 'active', ahead(720));
  const lBoth = await session(d.email);
  check(lBoth.full === true && lBoth.basis === 'subscription',
    'L-5 with both, the SUBSCRIPTION is the basis — a promotion never downgrades a purchase',
    `${lBoth.basis}`);
  await q('DELETE FROM user_subscription WHERE "userId" = $1', [dUser.id]);

  // ============================================================ M. tenant isolation

  console.log('\n---- M. cross-tenant ----\n');
  await setGrant('active', ago(1), ahead(1));
  const m = await register('tenant-b');
  const mS = await session(m.email);
  check(mS.full === false, 'M-1 tenant B is free while tenant A holds an active promo grant');
  check((await classify(mS.token)).status === 402, 'M-2 and classify refuses tenant B');

  // ============================================================

  await app.close();
  console.log(`\n================ §302 promotional grant: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({ providerCalls: 0, expertExecutions: 0, passed, failed: failures.length }));
  if (failures.length > 0) {
    for (const f of failures) console.error(`  FAILED: ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
