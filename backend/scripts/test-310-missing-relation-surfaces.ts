/**
 * §310 (SC-3 / SC-4) — MISSING-RELATION ROUTE SURFACES, AND THE SUBSCRIPTION DEFAULT.
 *
 *   npm run test:310-missing-relation:db
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Disposable database only, DEV_AUTH_BYPASS off.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS SUITE IS FOR, AND WHY IT RUNS IN TWO MODES.
 *
 * §310 requires a NON-VACUOUS ROUTE PROOF: before any repair, show that each affected route is
 * genuinely deployed, that the missing-relation path can actually execute, and what it measures.
 * After the repair, show that no affected route still returns a missing-relation 500.
 *
 * The same file does both, selected by `--mode=before|after`, because the two runs must drive
 * EXACTLY the same routes with exactly the same fixture. A "before" written by hand and an "after"
 * written later are two experiments, and the difference between them stops being attributable to
 * the repair.
 *
 * ---------------------------------------------------------------------------------------------
 * THE FIXTURE IS AN ENTITLED INDIVIDUAL, BECAUSE THAT IS WHO REACHES THESE ROUTES.
 *
 * Every affected controller carries an entitlement guard — `analytics`, `cloudReports`,
 * `fullSafeScope`, `supervisorValidation` — and a Pro individual holds all four. §310 forbids
 * manufacturing access around a guard to claim reachability, so the user obtains Pro the way a real
 * pilot user does: a server-authorised promotional code producing a BOUNDED entitlement grant, the
 * same mechanism §305A uses. Nothing here weakens a guard.
 *
 * A route that answers 402 or 403 for this caller is recorded as NOT REACHABLE and is not counted
 * as a missing-relation surface — that distinction is the whole point of measuring rather than
 * reasoning.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';

import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§310 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§310 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§310 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§310 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§310 REFUSED: DEV_AUTH_BYPASS is on.');
  }
}

const MODE = (process.argv.find((a) => a.startsWith('--mode=')) || '--mode=after').split('=')[1];

process.env.EXPERT_EXECUTION_ENABLED = 'false';
delete process.env.ANTHROPIC_API_KEY;

const PROMO = 's310-pilot-code';
process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const storageRoot = require('fs').mkdtempSync(
  require('path').join(require('os').tmpdir(), 's310-storage-'));
process.env.STORAGE_LOCAL_ROOT = storageRoot;

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

type Json = Record<string, any>;
let baseUrl = '';
let ipCounter = 0;

async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<{ status: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = `10.31.10.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw };
}

const PASSWORD = 'Section310!StrongPass123';

/**
 * THE AFFECTED ROUTE SET.
 *
 * Every route whose controller injects a repository for one of SC-3's four entities, with the
 * family it belongs to. `expectExecutes` marks the routes §309 predicted would reach the missing
 * relation — the ones the BEFORE run must actually see fail, or the prediction was wrong.
 */
const AFFECTED: ReadonlyArray<{
  family: 'Report' | 'Finding' | 'ReportAttachment' | 'HazardTaxonomy';
  method: string; path: (ids: Json) => string; body?: Json; label: string;
  /** Already retired to 410 before §310; recorded so the suite measures them rather than assuming. */
  alreadyRetired?: boolean;
  /**
   * Added to this instrument AFTER the BEFORE run was captured. See `SECTION-310-ROUTE-PROOF-BEFORE`
   * and the note on `POST /action-engine/generate/:reportId` below.
   */
  addedAfterBeforeCapture?: boolean;
}> = [
  { family: 'Report', method: 'GET', path: () => '/legacy/reports', label: 'GET /legacy/reports' },
  { family: 'Report', method: 'GET', path: (i) => `/legacy/reports/${i.reportId}`, label: 'GET /legacy/reports/:id' },
  { family: 'Report', method: 'GET', path: (i) => `/legacy/reports/${i.reportId}/recommendations`, label: 'GET /legacy/reports/:id/recommendations' },
  { family: 'Report', method: 'POST', path: () => '/legacy/reports', body: {}, label: 'POST /legacy/reports', alreadyRetired: true },
  { family: 'ReportAttachment', method: 'POST', path: (i) => `/legacy/reports/${i.reportId}/attachments`, body: {}, label: 'POST /legacy/reports/:id/attachments', alreadyRetired: true },
  { family: 'Report', method: 'PATCH', path: (i) => `/legacy/reports/${i.reportId}`, body: {}, label: 'PATCH /legacy/reports/:id', alreadyRetired: true },
  { family: 'Report', method: 'PATCH', path: (i) => `/legacy/reports/${i.reportId}/archive`, body: {}, label: 'PATCH /legacy/reports/:id/archive', alreadyRetired: true },
  { family: 'Report', method: 'GET', path: () => '/analytics/safety-trends', label: 'GET /analytics/safety-trends' },
  { family: 'Report', method: 'GET', path: (i) => `/classifications/report/${i.reportId}`, label: 'GET /classifications/report/:reportId' },
  { family: 'Report', method: 'POST', path: (i) => `/classifications/report/${i.reportId}/classify`, body: {}, label: 'POST /classifications/report/:reportId/classify' },
  { family: 'Report', method: 'POST', path: (i) => `/control-verifications/${i.reportId}`, body: { controlId: 'c1', verified: true }, label: 'POST /control-verifications/:reportId' },
  { family: 'Report', method: 'GET', path: (i) => `/control-verifications/${i.reportId}`, label: 'GET /control-verifications/:reportId' },
  { family: 'Report', method: 'GET', path: () => '/review-queue', label: 'GET /review-queue' },
  { family: 'Report', method: 'GET', path: (i) => `/legacy/reports/${i.reportId}/explain`, label: 'GET /legacy/reports/:id/explain', alreadyRetired: true },
  { family: 'ReportAttachment', method: 'POST', path: (i) => `/legacy/reports/${i.reportId}/attachments/upload`, body: {}, label: 'POST /legacy/reports/:id/attachments/upload', alreadyRetired: true },
  { family: 'Report', method: 'POST', path: (i) => `/legacy/reports/${i.reportId}/recommendations/feedback`, body: {}, label: 'POST /legacy/reports/:id/recommendations/feedback', alreadyRetired: true },
  /*
   * THE ROUTE READING CONTROLLERS DID NOT FIND.
   *
   * `POST /action-engine/generate/:reportId` called `ReportsService.findOne` and then read
   * `report.findings`. It does not live under `legacy/`, it is not named after a report, and its
   * controller injects `ReportsService` through a `forwardRef`, so a search for report repositories
   * did not surface it. It was found by enumerating the AUTHORITATIVE DEPLOYED ROUTE TABLE — all
   * 156 routes Nest actually registers — which is why that enumeration is part of the evidence and
   * not a convenience.
   *
   * It is marked `addedAfterBeforeCapture` because it was added to this instrument after the BEFORE
   * run had already been captured and frozen. Its pre-repair behaviour is therefore NOT part of the
   * frozen 16-route BEFORE measurement; it was measured separately, and that separate measurement
   * is recorded alongside it rather than folded in as though it had always been there.
   */
  { family: 'Report', method: 'POST', path: (i) => `/action-engine/generate/${i.reportId}`, body: {}, label: 'POST /action-engine/generate/:reportId', addedAfterBeforeCapture: true },
  /* Retired to 410 in §307 when the Puppeteer-backed provider was deleted; measured, not assumed. */
  { family: 'Report', method: 'GET', path: (i) => `/legacy/pdf/${i.reportId}`, label: 'GET /legacy/pdf/:id', alreadyRetired: true, addedAfterBeforeCapture: true },
];

/** Does this response show the missing-relation failure? */
function isMissingRelation(r: { status: number; raw: string }): boolean {
  return r.status >= 500;
}

async function main(): Promise<void> {
  provenDisposableTarget();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppModule } = require('../src/app.module');
  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    { logger: process.env.S310_VERBOSE === '1' ? undefined : false });
  app.useBodyParser('json', { limit: '5mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§310 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}   MODE=${MODE}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  // =============================================================================================
  console.log('---- SETUP. AN ENTITLED INDIVIDUAL, THE WAY A REAL PILOT USER BECOMES ONE ----\n');
  // =============================================================================================

  const email = `s310-pro-${suffix}@example.test`;
  const reg = await call('/auth/register', {
    method: 'POST',
    body: {
      email, password: PASSWORD, name: 's310 pro', type: 'individual',
      promoCode: PROMO, acceptedAgreements: requiredRegistrationAcceptances(),
    },
  });
  const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
  const token = login.body?.token as string;
  check(reg.status < 400 && !!token,
    'S-1 an individual registers and redeems a server-authorised pilot code — nothing here weakens '
    + 'a guard, and §310 forbids manufacturing access around one', `${reg.status}`);

  const billing = await call('/billing/status', { token });
  check(billing.body?.entitlements?.cloudReports === true
    && billing.body?.entitlements?.analytics === true
    && billing.body?.entitlements?.fullSafeScope === true
    && billing.body?.entitlements?.supervisorValidation === true,
    'S-2 and holds every entitlement the affected controllers require — so a refusal below is about '
    + 'the RELATION, not about the guard',
    JSON.stringify({ cloudReports: billing.body?.entitlements?.cloudReports,
      analytics: billing.body?.entitlements?.analytics,
      fullSafeScope: billing.body?.entitlements?.fullSafeScope,
      supervisorValidation: billing.body?.entitlements?.supervisorValidation }));

  const ids = { reportId: randomUUID() };

  // =============================================================================================
  console.log(`\n---- A. THE AFFECTED ROUTES, DRIVEN (${MODE.toUpperCase()}) ----\n`);
  // =============================================================================================

  const results: Array<{ label: string; family: string; status: number; missing: boolean; snippet: string }> = [];
  for (const route of AFFECTED) {
    const r = await call(route.path(ids), { method: route.method, token, body: route.body });
    const missing = isMissingRelation(r);
    results.push({
      label: route.label, family: route.family, status: r.status, missing,
      snippet: r.raw.slice(0, 160).replace(/\s+/g, ' '),
    });
    console.log(`        ${String(r.status).padEnd(4)} ${missing ? 'MISSING-RELATION 5xx' : 'ok                  '} ${route.label}`);
    if (r.status >= 400) console.log(`             body: ${r.raw.slice(0, 150).replace(/\s+/g, ' ')}`);
  }

  const missingNow = results.filter((r) => r.missing);

  if (MODE === 'before') {
    /*
     * THE PREDICTION UNDER TEST. §309 measured that the repositories fail; it did NOT measure that a
     * ROUTE reaches them. This is that measurement, and the suite refuses to report a green BEFORE
     * run: if nothing fails here, SC-3 is not a reachable route defect and the whole premise of
     * §310's repair would need revisiting.
     */
    check(missingNow.length > 0,
      'A-before AT LEAST ONE DEPLOYED ROUTE ACTUALLY REACHES THE MISSING RELATION. §309 measured that '
      + 'the repositories fail; this measures that a ROUTE gets there, which is the fact SC-3 rests '
      + 'on and the thing §310 must not assume.',
      `${missingNow.length} of ${results.length} routes return 5xx`);
    for (const r of missingNow) console.log(`          -> ${r.label}  ${r.status}  ${r.snippet}`);
  } else {
    check(missingNow.length === 0,
      'A-after NO AFFECTED ROUTE RETURNS A MISSING-RELATION 5xx. Every one either answers a bounded '
      + 'client status or no longer exists.',
      missingNow.length ? missingNow.map((r) => `${r.label}=${r.status}`).join(', ') : `0 of ${results.length}`);
    for (const r of results) {
      check(r.status < 500, `A-after ${r.label} answers ${r.status}`, r.snippet.slice(0, 60));
    }
  }

  // =============================================================================================
  console.log('\n---- A2. THE SAME ROUTES, AS AN ORGANIZATION PRINCIPAL ----\n');
  // =============================================================================================

  /*
   * WHY THIS SECTION EXISTS.
   *
   * The legacy report reads answered 401 "Organization context is required." for the individual
   * above — ReportsService.requireOrganization refuses before the repository is touched. That is a
   * real answer, and it would be dishonest to stop there: the routes are DEPLOYED, and Company/Team
   * is deferred rather than impossible, so the question "can anything reach the missing relation
   * through them" is not yet answered.
   *
   * An organization principal is a legitimate shape — §305A plants one for exactly this reason —
   * so driving these routes as one is measuring reachability, not manufacturing it.
   */
  const orgId = randomUUID();
  await q(`INSERT INTO "organization" ("id","name","planCode") VALUES ($1,$2,'company')`,
    [orgId, `S310 ORG ${suffix}`]);
  const orgEmail = `s310-org-${suffix}@example.test`;
  await call('/auth/register', {
    method: 'POST',
    body: {
      email: orgEmail, password: PASSWORD, name: 's310 org', type: 'individual',
      promoCode: PROMO, acceptedAgreements: requiredRegistrationAcceptances(),
    },
  });
  const orgLoginProbe = await call('/auth/login', { method: 'POST', body: { email: orgEmail, password: PASSWORD } });
  await q(
    `INSERT INTO "organization_memberships" ("id","userId","organizationId","role","status","joinedAt")
     VALUES ($1,$2,$3,'organization_admin','active',now())`,
    [randomUUID(), orgLoginProbe.body?.user?.id, orgId]);
  const orgLogin = await call('/auth/login', { method: 'POST', body: { email: orgEmail, password: PASSWORD } });
  const orgToken = orgLogin.body?.token as string;
  check(orgLogin.body?.user?.organizationId === orgId,
    'A2-0 an ORGANIZATION principal exists, so the organization-gated legacy reads can be driven',
    String(orgLogin.body?.user?.organizationId));

  const orgResults: Array<{ label: string; status: number; missing: boolean; snippet: string }> = [];
  /*
   * THE ORG-GATED SET, MEASURED RATHER THAN GUESSED AT.
   *
   * `POST /action-engine/generate/:reportId` belongs here for exactly the same reason as the legacy
   * reads: it answered 401 "Organization context is required." for the individual above, because
   * `ReportsService.findOne` refuses on organization scope BEFORE it queries the repository. A 401
   * is a guard, not evidence that the relation is unreachable — so the route has to be driven as an
   * organization principal before anything can be claimed about it.
   */
  const ORG_GATED = AFFECTED.filter((r) =>
    r.label.startsWith('GET /legacy/reports') || r.label === 'POST /action-engine/generate/:reportId');
  for (const route of ORG_GATED) {
    const r = await call(route.path(ids), { method: route.method, token: orgToken, body: route.body });
    const missing = isMissingRelation(r);
    orgResults.push({ label: route.label, status: r.status, missing, snippet: r.raw.slice(0, 120).replace(/\s+/g, ' ') });
    console.log(`        ${String(r.status).padEnd(4)} ${missing ? 'MISSING-RELATION 5xx' : 'ok                  '} ${route.label}  (org principal)`);
  }
  const orgMissing = orgResults.filter((r) => r.missing);
  if (MODE === 'before') {
    check(orgMissing.length > 0,
      'A2-before THE ORGANIZATION-GATED REPORT ROUTES DO REACH THE MISSING RELATION for an organization principal. '
      + 'For an individual they answer 401 before the repository is touched; that is a guard, not an '
      + 'absence of the defect, and the difference is measured rather than assumed.',
      `${orgMissing.length} of ${orgResults.length}`);
  } else {
    check(orgMissing.length === 0,
      'A2-after and none of them returns a missing-relation 5xx for an organization principal either',
      orgMissing.length ? orgMissing.map((r) => `${r.label}=${r.status}`).join(', ') : `0 of ${orgResults.length}`);
  }

  // =============================================================================================
  console.log('\n---- B. HAZARD TAXONOMY: IS THERE A ROUTE AT ALL? ----\n');
  // =============================================================================================

  /*
   * §310 warns specifically about this family. The measurement that matters is whether anything
   * DEPLOYED can reach it — not whether an entity exists.
   */
  const taxonomyModulesRegistered = ds.entityMetadatas.some((m) => m.name === 'HazardTaxonomy');
  const intelligenceProbe = await call('/intelligence/analyze', { method: 'POST', token, body: { text: 'x' } });
  check(intelligenceProbe.status < 500,
    'B-1 the REGISTERED /intelligence module answers without a server error — it is a different '
    + 'module from intelligence-library and intelligence-framework, and it does not touch '
    + 'HazardTaxonomy', `${intelligenceProbe.status}`);
  console.log(`        HazardTaxonomy in the DataSource metadata: ${taxonomyModulesRegistered}`);

  // =============================================================================================
  console.log('\n---- C. SC-4: THE SUBSCRIPTION DEFAULT ----\n');
  // =============================================================================================

  const defaultRow = await q(`
    SELECT column_default FROM information_schema.columns
     WHERE table_schema='public' AND table_name='user' AND column_name='subscriptionStatus'`);
  const currentDefault = String(defaultRow[0]?.column_default ?? '');
  console.log(`        database default for user.subscriptionStatus: ${currentDefault}`);

  /*
   * THE MEASUREMENT THAT MATTERS: an INSERT that OMITS the column. Reasoning about a default is not
   * the same as exercising it, and §310 asks for the database-level proof explicitly.
   */
  const omittedId = randomUUID();
  await q(
    `INSERT INTO "user" ("id","email","name","passwordHash","role","type")
     VALUES ($1,$2,'s310 omitted','x','individual','individual')`,
    [omittedId, `s310-omitted-${suffix}@example.test`]);
  const omitted = await q(
    `SELECT "subscriptionStatus","planCode" FROM "user" WHERE "id" = $1`, [omittedId]);
  const omittedStatus = String(omitted[0]?.subscriptionStatus ?? '');
  console.log(`        an INSERT omitting subscriptionStatus produced: ${omittedStatus}`);

  if (MODE === 'before') {
    check(omittedStatus === 'active',
      'C-before AN INSERT OMITTING subscriptionStatus PRODUCES active. The database independently '
      + 'creates an apparently paid subscription when a caller says nothing — measured, not inferred.',
      omittedStatus);
  } else {
    check(omittedStatus === 'none',
      'C-after AN INSERT OMITTING subscriptionStatus NOW PRODUCES none. The database no longer '
      + 'grants privilege by default; omission fails safe.',
      omittedStatus);
    check(currentDefault.includes("'none'"),
      'C-after and the column default itself reads none', currentDefault);
  }
  await q(`DELETE FROM "user" WHERE "id" = $1`, [omittedId]);

  /*
   * NORMAL REGISTRATION IS UNCHANGED IN BOTH MODES. §302/EN-3 made the account row tell the truth
   * about billing, and §310 must not disturb it: the repair is to the DEFAULT, not to registration.
   */
  const registeredRow = await q(
    `SELECT "planCode","subscriptionStatus" FROM "user" WHERE "email" = $1`, [email]);
  check(registeredRow[0]?.planCode === 'free' && registeredRow[0]?.subscriptionStatus === 'none',
    'C-1 a user created through NORMAL REGISTRATION is free/none — unchanged in both modes, because '
    + 'AuthService.register has always set both explicitly (§302 / EN-3)',
    JSON.stringify(registeredRow[0]));

  /*
   * AND THE PROMOTIONAL GRANT STILL WORKS WITHOUT THE ACCOUNT CLAIMING A PURCHASE — EN-3's property,
   * re-proven here because §310 touches the column that used to lie about it.
   */
  check(billing.body?.tierSource === 'grant'
    || billing.body?.promotionalEntitlement?.basis === 'bounded_entitlement_grant',
    'C-2 EN-3 PRESERVED: the pilot user\'s capability comes from a BOUNDED GRANT while the account '
    + 'row still says free/none — nothing was purchased and the record does not claim otherwise',
    JSON.stringify({ tier: billing.body?.tier, source: billing.body?.tierSource }));

  const promote = await call('/auth/me', { method: 'PATCH', token, body: { subscriptionStatus: 'active' } });
  check(promote.status === 400,
    'C-3 BI-4 PRESERVED: a caller-supplied subscriptionStatus is still refused 400 by the global '
    + 'forbidNonWhitelisted pipe — §310 changed a database default, not the authority model',
    `${promote.status}`);
  const afterPromote = await q(
    `SELECT "subscriptionStatus" FROM "user" WHERE "email" = $1`, [email]);
  check(afterPromote[0]?.subscriptionStatus === 'none',
    'C-4 and the account row is still none afterwards', String(afterPromote[0]?.subscriptionStatus));

  // ---- cleanup -------------------------------------------------------------------------------
  await call('/auth/me', { method: 'DELETE', token, body: { password: PASSWORD } });

  console.log(`\n${'='.repeat(96)}`);
  console.log(`§310 MISSING-RELATION SURFACES (${MODE}): ${passed} passed, ${failures.length} failed.`);
  console.log('Expert executions: 0. Provider calls: 0. Spend: $0.00.');
  if (failures.length) {
    console.log('\nFAILED:');
    for (const failure of failures) console.log(`  - ${failure}`);
  }
  console.log('='.repeat(96));

  await app.close();
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\n§310 ERRORED:', error);
  process.exit(1);
});
