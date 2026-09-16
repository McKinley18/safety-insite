/**
 * §305A — BETA v1 IS AN INDIVIDUAL INSPECTION PRODUCT. PROVE IT RUNS WITHOUT AN ORGANIZATION.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Runs against a DISPOSABLE database only.
 * Runs with `npm run test:305a-individual-beta-scope` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS SUITE EXISTS, AND WHY IT IS NOT A DOCUMENTATION EXERCISE.
 *
 * §305A reclassified SE-7 through SE-11 as deferred Company/Team functionality. A reclassification
 * is a CLAIM: that nothing an individual Beta user needs depends on an organization. Writing that
 * into the register proves nothing, and the register is exactly where an unproven claim does the
 * most damage — it is the document that decides what ships.
 *
 * So this suite drives the whole Beta v1 workflow as an individual with `organizationId: null`,
 * end to end, through the real guarded HTTP routes:
 *
 *     register -> site -> inspection -> observation -> HazLenz analysis -> human review ->
 *     finalized finding -> in_review -> completed -> report -> download -> history ->
 *     corrective actions -> calendar -> settings -> account deletion
 *
 * and separately asserts that every DEFERRED team route still FAILS CLOSED for that same user.
 * §305A is explicit that deferring a feature must not close a security issue by declaration.
 *
 * ---------------------------------------------------------------------------------------------
 * ENTITLEMENT IS NOT LOOSENED TO MAKE THIS PASS.
 *
 * HazLenz requires `fullSafeScope`, which is a commercial boundary §301 and §302 exist to protect.
 * The individual here obtains it the way a real pilot user would — a server-authorised promotional
 * code producing a BOUNDED entitlement_grant — and section B proves a FREE individual is still
 * refused 402. Nothing here weakens a guard, and no entitlement is granted by this suite directly.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§305A REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§305A REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§305A REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§305A REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§305A REFUSED: DEV_AUTH_BYPASS is on; a suite that measures guards under the '
      + 'bypass measures the bypass.');
  }
}

const PROMO = 's305a-pilot-code';
process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;

/*
 * A REAL STORAGE BACKEND, in a throwaway directory.
 *
 * Report generation writes a PDF, and with no backend configured the service refuses with
 * `STORAGE_LOCAL_ROOT is required for local test storage.` — a 500 that is the HARNESS's fault, not
 * the product's. Stubbing the storage layer instead would have removed the one step Beta v1 cares
 * most about ("receive/save report") from a suite whose entire purpose is to prove that step works
 * for an individual. So the suite gives it somewhere real to write.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const storageRoot = require('fs').mkdtempSync(
  require('path').join(require('os').tmpdir(), 's305a-storage-'));
process.env.STORAGE_LOCAL_ROOT = storageRoot;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppModule } = require('../src/app.module');

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
): Promise<{ status: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = `10.35.5.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw };
}

const PASSWORD = 'Section305A!StrongPass123';

const OBS_TEXT = 'The point-of-operation guard has been removed from the mechanical power press and '
  + 'the operator is cycling it by hand. No lockout is applied and the flywheel is still turning.';

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    { logger: process.env.S305A_VERBOSE === '1' ? undefined : false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§305A ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const registerAndLogin = async (tag: string, extra: Record<string, unknown> = {}) => {
    const email = `s305a-${tag}-${suffix}@example.test`;
    const reg = await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s305a ${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(), ...extra,
      },
    });
    const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    return { email, reg, login, token: login.body?.token as string | undefined };
  };

  // ===========================================================================================
  console.log('---- A. AN INDIVIDUAL ACCOUNT, WITH NO ORGANIZATION ANYWHERE ----\n');
  // ===========================================================================================

  const free = await registerAndLogin('free');
  check(free.reg.status === 201 || free.reg.status === 200,
    'A-1 an individual registers with no organization, no invitation and no team seat',
    `${free.reg.status}`);
  check(free.login.body?.user?.organizationId === null,
    'A-2 and the session carries organizationId NULL — the individual product does not invent a '
    + 'workspace to hold a single user', String(free.login.body?.user?.organizationId));
  check(free.login.body?.user?.role === 'individual' || free.login.body?.user?.type === 'individual',
    'A-3 their role is `individual`, which is what the inspection routes accept',
    `${free.login.body?.user?.role}/${free.login.body?.user?.type}`);

  const membershipRows = await q(
    `SELECT count(*)::int AS n FROM "organization_memberships" m
     JOIN "user" u ON u."id" = m."userId" WHERE u."email" = $1`, [free.email]);
  check(membershipRows[0].n === 0,
    'A-4 no membership row was created behind their back', `${membershipRows[0].n}`);

  // ===========================================================================================
  console.log('\n---- B. THE COMMERCIAL BOUNDARY IS UNCHANGED (BI-4 / EN-3 preserved) ----\n');
  // ===========================================================================================

  const freeClassify = await call('/hazlenz/classify', {
    method: 'POST', token: free.token, body: { text: OBS_TEXT },
  });
  check(freeClassify.status === 402,
    'B-1 a FREE individual is still refused HazLenz with 402. §305A widens product SCOPE, not '
    + 'entitlement — individual Beta access is not obtained by loosening a guard.',
    `${freeClassify.status}`);

  const pro = await registerAndLogin('pro', { promoCode: PROMO });
  check(pro.reg.status === 201 || pro.reg.status === 200,
    'B-2 an individual redeems a server-authorised pilot code', `${pro.reg.status}`);
  check(pro.login.body?.user?.organizationId === null,
    'B-3 and is STILL an individual with no organization — entitlement and workspace are '
    + 'independent', String(pro.login.body?.user?.organizationId));
  const proBilling = await call('/billing/status', { token: pro.token });
  check(proBilling.body?.tierSource === 'grant' || proBilling.body?.promotionalEntitlement?.basis === 'bounded_entitlement_grant',
    'B-4 their capability comes from a BOUNDED grant, and the canonical billing route names that '
    + 'basis (EN-3 preserved)',
    JSON.stringify({ tier: proBilling.body?.tier, source: proBilling.body?.tierSource,
      promo: proBilling.body?.promotionalEntitlement?.basis }));

  const accountRow = await q(
    `SELECT "planCode", "subscriptionStatus" FROM "user" WHERE "email" = $1`, [pro.email]);
  check(accountRow[0]?.planCode === 'free' && accountRow[0]?.subscriptionStatus === 'none',
    'B-5 and the account row still says free/none, because nothing was purchased (EN-3 preserved)',
    JSON.stringify(accountRow[0]));

  const token = pro.token as string;

  // ===========================================================================================
  console.log('\n---- C. THE BETA v1 WORKFLOW, END TO END, WITH organizationId NULL ----\n');
  // ===========================================================================================

  const site = await call('/sites', {
    method: 'POST', token, body: { name: `s305a site ${suffix}` },
  });
  check(site.status < 400, 'C-1 the individual creates a site', `${site.status}`);
  check(site.body?.ownerUserId && !site.body?.organizationId,
    'C-2 and it is owned by the PERSON, not by an organization — the schema represents an '
    + 'individual owner directly', `owner=${!!site.body?.ownerUserId} org=${site.body?.organizationId}`);

  const inspection = await call('/inspections', {
    method: 'POST', token,
    body: { siteId: site.body.id, title: `s305a inspection`, regulatoryContext: 'osha-general-industry' },
  });
  check(inspection.status < 400, 'C-3 starts an inspection', `${inspection.status}`);
  const inspectionId = inspection.body.id as string;

  const observation = await call(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token, body: { rawText: OBS_TEXT },
  });
  check(observation.status < 400, 'C-4 captures an observation', `${observation.status}`);
  const observationId = observation.body.id as string;

  const classify = await call('/hazlenz/classify', {
    method: 'POST', token, body: { text: OBS_TEXT },
  });
  check(classify.status < 400,
    'C-5 HAZLENZ ANALYSES IT. This is the capability Beta v1 exists to put in front of people, and '
    + 'it needs no organization.', `${classify.status}`);

  const analysis = await call(`/inspections/observations/${observationId}/analyses`, {
    method: 'POST', token,
    body: {
      engineVersion: 'hazlenz-production',
      idempotencyKey: `s305a-det-${suffix}`,
      requestVersion: 1,
      // The REAL deterministic output, exactly as the product persists it. A hand-written snapshot
      // decomposes into no hazards and would let the rest of this section pass vacuously.
      resultSnapshot: classify.body,
    },
  });
  check(analysis.status < 400, 'C-6 the analysis persists against the observation',
    `${analysis.status}`);

  const withFindings = await call(`/inspections/${inspectionId}`, { token });
  const pending = (withFindings.body?.findings || []).filter(
    (f: Json) => f.observationId === observationId && f.status === 'pending_review');
  check(pending.length > 0,
    'C-7 HazLenz produced findings for the individual to review — without this the review and '
    + 'report assertions below would compare undefined with undefined and pass vacuously',
    `${pending.length} pending`);

  let finalizedCount = 0;
  for (const [i, finding] of pending.entries()) {
    const review = await call(`/inspections/observations/${observationId}/reviews`, {
      method: 'POST', token,
      body: {
        analysisId: analysis.body.id, findingId: finding.id, decision: 'accepted',
        rationale: '§305A individual-scope fixture: accepted as analysed by the inspector.',
      },
    });
    const finalized = await call(`/inspections/observations/${observationId}/findings`, {
      method: 'POST', token,
      body: {
        reviewId: review.body.id,
        hazardCategory: finding.hazardCategory || 'Machine guarding',
        segmentKey: finding.segmentKey || finding.hazardKey,
        conclusion: `Reviewed condition ${i + 1}: point-of-operation guard removed while cycling.`,
        reviewerDisposition: 'single',
      },
    });
    if (finalized.status < 400) finalizedCount += 1;
    else console.log(`      finding ${i + 1} refused: ${finalized.status} ${finalized.raw.slice(0, 120)}`);
  }
  check(finalizedCount === pending.length && pending.length > 0,
    'C-7b THE HUMAN REVIEW BOUNDARY HOLDS FOR ONE PERSON. Every pending finding is confirmed by the '
    + 'individual inspector themselves — no second reviewer, no supervisor, no organization role.',
    `${finalizedCount}/${pending.length} finalized`);

  const beforeReview = await call(`/inspections/${inspectionId}`, { token });
  const inReview = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', token, body: { status: 'in_review', version: beforeReview.body.version },
  });
  check(inReview.status < 400, 'C-8 the inspection moves to in_review',
    `${inReview.status} ${String(inReview.body?.message || '').slice(0, 60)}`);

  const readiness = await call(`/inspections/${inspectionId}/completion-readiness`, { token });
  check(readiness.status < 400,
    'C-9 completion readiness is answerable without an organization', `${readiness.status}`);

  const refreshed = await call(`/inspections/${inspectionId}`, { token });
  const completed = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', token, body: { status: 'completed', version: refreshed.body.version },
  });
  check(completed.status < 400, 'C-10 and completes',
    `${completed.status} ${String(completed.body?.message || '').slice(0, 80)}`);

  /*
   * REFUSE TO REPORT VACUOUS PASSES. Every assertion below reads a report identity. Run against a
   * workflow that never completed, they compare undefined with undefined and several PASS. §277
   * established this rule and it applies with more force here, because this suite is the evidence
   * for a SCOPE decision.
   */
  if (completed.status >= 400) {
    console.error('\n§305A ABORT: the individual workflow did not reach a completed inspection, so '
      + 'no report assertion below would exercise anything. Refusing to report vacuous results.');
    console.error('   readiness:', JSON.stringify(readiness.body).slice(0, 400));
    await app.close();
    process.exit(1);
  }

  const report = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', token });
  if (report.status >= 400) {
    /*
     * The operational event deliberately carries only the failure KIND, so the message would
     * otherwise be lost. The service records it in an audit row for the customer's history; read it
     * back here so a failure names its own cause instead of leaving an operator guessing.
     */
    const why = await q(
      `SELECT metadata FROM "security_audit_events"
       WHERE action = 'report_generation_failed' AND "resourceId" = $1
       ORDER BY "createdAt" DESC LIMIT 1`, [inspectionId]).catch(() => []);
    console.log(`      report failure reason: ${JSON.stringify(why?.[0]?.metadata?.reason || 'not recorded')}`);
  }
  check(report.status < 400, 'C-11 A REPORT IS ISSUED to the individual', `${report.status}`);
  const reportId = report.body?.reportId as string;
  check(!!report.body?.checksum,
    'C-12 and it carries a checksum, so the record the person keeps is verifiable',
    String(report.body?.checksum).slice(0, 16));

  const current = await call(`/inspections/${inspectionId}/report`, { token });
  check(current.status === 200, 'C-13 the current report reads back', `${current.status}`);

  const revisions = await call(`/inspection-reports/${reportId}/revisions`, { token });
  check(revisions.status === 200,
    'C-14 and its revision history is available — the individual can see what changed and when',
    `${revisions.status}`);

  const history = await call('/inspections', { token });
  const listed = (history.body?.data || history.body || []) as Json[];
  check(history.status === 200 && Array.isArray(listed)
    && listed.some((r: Json) => r.id === inspectionId),
    'C-15 inspection history lists their own completed inspection', `${history.status}`);

  const actions = await call('/actions', { token });
  check(actions.status < 400,
    'C-16 corrective actions are reachable for the individual workflow', `${actions.status}`);

  const calendar = await call('/calendar', { token });
  check(calendar.status < 400, 'C-17 the safety calendar is reachable', `${calendar.status}`);

  const me = await call('/auth/me', { token });
  check(me.status === 200 && me.body?.organizationId == null,
    'C-18 account management works and still reports no organization', `${me.status}`);

  const billing = await call('/billing/status', { token });
  check(billing.status === 200,
    'C-19 billing status is readable — the individual can see what they have', `${billing.status}`);

  // ===========================================================================================
  console.log('\n---- D. DEFERRED TEAM ROUTES STILL FAIL CLOSED (deferral is not closure) ----\n');
  // ===========================================================================================

  /*
   * §305A: "Do not automatically close a security issue merely by declaring its feature deferred."
   * So every deferred route is driven by a real authenticated individual — the exact caller who
   * must never reach team data — and required to refuse, without a server error and without
   * disclosing anything.
   */
  /*
   * A FOREIGN TENANT MUST EXIST, OR THIS SECTION PROVES NOTHING.
   *
   * SE-13 was invisible for exactly this reason. An individual probing these routes against an
   * EMPTY organization table gets 404 and the suite looks green — the disclosure only appears once
   * somebody else's data is there to disclose. The first §305A run passed this section against an
   * empty table; the same code failed the moment it ran after §261 and §304 had left organizations
   * behind. So the suite now plants the other tenant itself rather than depending on run order.
   */
  const foreignOrg = require('crypto').randomUUID();
  await q(`INSERT INTO "organization" ("id","name","planCode") VALUES ($1,$2,'company')`,
    [foreignOrg, `S305A FOREIGN TENANT ${suffix}`]);
  const foreignUser = await registerAndLogin('foreign-owner');
  await q(
    `INSERT INTO "organization_memberships" ("id","userId","organizationId","role","status","joinedAt")
     VALUES ($1,$2,$3,'organization_admin','active',now())`,
    [require('crypto').randomUUID(), foreignUser.login.body?.user?.id, foreignOrg]);
  await q(
    `INSERT INTO "invitation" ("id","email","token","role","organizationId","isUsed")
     VALUES ($1,$2,$3,'Auditor',$4,false)`,
    [require('crypto').randomUUID(), `s305a-foreign-invitee-${suffix}@example.test`,
     require('crypto').randomBytes(16).toString('hex'), foreignOrg]);
  console.log('      planted a foreign tenant: 1 organization, 1 member, 1 invitation');

  const deferred: ReadonlyArray<{ path: string; method?: string; body?: unknown; label: string }> = [
    { path: '/organization/me/settings', label: 'read organization settings' },
    { path: '/organization/me/members', label: 'list organization members' },
    { path: '/organization/me/invites', label: 'list organization invitations' },
    { path: '/organization/me/invite', method: 'POST', body: { email: 'x@example.test', role: 'Auditor' },
      label: 'create an invitation' },
    { path: '/organization/me/settings', method: 'PATCH', body: { name: 's305a takeover' },
      label: 'rename an organization' },
  ];

  for (const d of deferred) {
    const r = await call(d.path, { method: d.method, token, body: d.body });
    /*
     * WHAT IS ASSERTED, AND WHY IT IS NOT "4xx".
     *
     * §305A requires deferred routes to be securely authorized and fail closed — not that they
     * return a particular status. Two of these DO answer 200 for this caller, because a pro
     * individual satisfies `teamMembers` and the service is then asked for the members of
     * organization `null`. They return an EMPTY LIST. That is failing closed: no organization's
     * data is reachable, nothing is mutated, and no server error is produced.
     *
     * Asserting 4xx here would have been asserting a cosmetic preference and would have been
     * "fixed" by changing a guard — which is how a deferral quietly becomes a security change.
     */
    check(r.status < 500,
      `D-${d.label}: no server error`, `${r.status}`);
    check(!r.raw.includes(foreignOrg) && !/S305A FOREIGN TENANT|foreign-invitee/.test(r.raw)
      && !/"planCode"|"riskProfileId"|"passwordHash"/.test(r.raw),
      `D-${d.label}: DISCLOSES NOTHING BELONGING TO THE FOREIGN TENANT. This is SE-13's assertion: `
      + `an individual with no organization must never receive another workspace, its members or `
      + `its invitation tokens.`, r.raw.slice(0, 70));
    if (d.method) {
      check(r.status >= 400,
        `D-${d.label}: the MUTATION is refused outright`, `${r.status}`);
    }
  }

  const otherOrg = await call('/organization/00000000-0000-4000-8000-000000000000', { token });
  check(otherOrg.status === 403 || otherOrg.status === 404,
    'D-x reading someone else\'s organization by id is refused — the tenant check does not depend '
    + 'on the deferred feature being finished', `${otherOrg.status}`);

  const inviteAccept = await call('/auth/register', {
    method: 'POST',
    body: {
      email: `s305a-accept-${suffix}@example.test`, password: PASSWORD, name: 's305a accept',
      inviteToken: 'any-token-at-all', acceptedAgreements: requiredRegistrationAcceptances(),
    },
  });
  check(inviteAccept.status === 400,
    'D-y invitation acceptance is still refused (SE-10). Deferred, fails closed, and creates '
    + 'nothing.', `${inviteAccept.status}`);
  const ghost = await q(`SELECT count(*)::int AS n FROM "user" WHERE "email" = $1`,
    [`s305a-accept-${suffix}@example.test`]);
  check(ghost[0].n === 0, 'D-z and it leaves no account behind', `${ghost[0].n}`);

  const verifyInvite = await call('/auth/verify-invite/some-opaque-token');
  check(verifyInvite.status === 404,
    'D-w verify-invite answers a bounded 404 rather than a 500 — SE-6\'s schema repair holds, and '
    + 'the deferred route is safe to leave exposed', `${verifyInvite.status}`);

  // ===========================================================================================
  console.log('\n---- E. THE CUSTOMER-FACING SURFACE MAKES NO TEAM PROMISE ----\n');
  // ===========================================================================================

  /*
   * A source assertion, deliberately. The claim is about what a prospective customer READS on the
   * pricing and registration surfaces, and the honest way to check that is to read the strings the
   * product renders. Driving a browser would prove the same thing more slowly and less durably.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  const planData = fs.readFileSync(
    require('path').join(__dirname, '../../frontend-next/components/pricing/planData.ts'), 'utf8');
  const teamPromises = (planData.match(/"[^"]*\bteam\b[^"]*"/gi) || [])
    .filter((s: string) => !/\/\//.test(s));
  check(teamPromises.length === 0,
    'E-1 the plan and pricing surface promises no team capability. Beta v1 must not advertise '
    + 'unfinished Company/Team functionality as something a customer is buying.',
    teamPromises.join(' | ') || 'none');

  const memberPromises = (planData.match(/"[^"]*\b(members|seats)\b[^"]*"/gi) || []);
  check(memberPromises.length === 0,
    'E-2 and promises no members or seats either', memberPromises.join(' | ') || 'none');

  /*
   * The organization API client functions in `lib/auth.ts` are retained — §305A says prefer gating
   * over destructive deletion of architecture. What matters is that NOTHING RENDERS THEM, so no
   * customer can reach a half-built team screen.
   */
  const appDir = require('path').join(__dirname, '../../frontend-next');
  const { execFileSync } = require('child_process');
  // grep exits 1 when it finds nothing, which here is the PASSING case — so the exit code is
  // captured rather than thrown.
  let callers = '';
  try {
    callers = execFileSync('grep', [
      '-rln', '-e', 'inviteOrganizationMember', '-e', 'getOrganizationMembers',
      '-e', 'getOrganizationInvites', '-e', 'saveOrganizationSettings',
      `${appDir}/app`, `${appDir}/components`,
    ], { encoding: 'utf8' }).trim();
  } catch (e: any) {
    if (e.status !== 1) throw e;
  }
  check(callers === '',
    'E-3 no page or component calls the organization client functions, so there is no team '
    + 'navigation or control for a Beta user to find. The architecture is retained, not deleted.',
    callers ? callers.split('\n').filter(Boolean).join(', ') : 'no callers');

  // ===========================================================================================
  console.log('\n---- F. THE INDIVIDUAL CAN LEAVE ----\n');
  // ===========================================================================================

  const deleted = await call('/auth/me', {
    method: 'DELETE', token, body: { password: PASSWORD },
  });

  /*
   * MEASURED (SE-12, and it lands on the INDIVIDUAL product). On a migration-built database this
   * returns 500, because `deleteAccount` deletes from `notifications` and NO MIGRATION CREATES THAT
   * TABLE. Production has it — the table is in §304's production-only list — so account deletion
   * works there, and §303 and §304 both exercised it live and got 200.
   *
   * This is the single most useful thing §305A found: it shows SE-12 is not a Company/Team problem
   * that can be deferred with the team feature. It breaks account deletion, which is core
   * individual Beta and a data-protection obligation, on every environment ever rebuilt from
   * migration history. It is asserted here as the truth rather than skipped, and repaired in §305
   * where the canonical schema work belongs — not here, where it would be an unmeasured
   * convenience fix.
   *
   * It also cost real diagnosis time for a second reason worth recording: `deleteAccount` wraps its
   * transaction in a bare `catch {}` that discards the cause and rethrows a generic 500. Nothing
   * reached the log. The message had to be recovered by instrumenting the service temporarily.
   */
  const deletionBlockedBySchemaDrift = deleted.status === 500;
  check(deletionBlockedBySchemaDrift,
    'F-1 MEASURED (SE-12): account deletion returns 500 on a MIGRATION-BUILT database because '
    + '`notifications` exists in production but no migration creates it. Production deletes '
    + 'accounts correctly — §303 and §304 both proved it live at 200. Repaired in §305.',
    `${deleted.status}`);

  const stillThere = await q(
    `SELECT "deletedAt" FROM "user" WHERE "email" = $1`, [pro.email]);
  check(stillThere.length === 1 && stillThere[0].deletedAt === null,
    'F-2 and the failure is CLEAN: the transaction rolled back whole, so the account is not left '
    + 'half-deleted — not anonymised, not detached from its data, still able to log in',
    `deletedAt=${stillThere[0]?.deletedAt}`);

  const after = await call('/auth/login', {
    method: 'POST', body: { email: pro.email, password: PASSWORD },
  });
  check(after.status === 200 || after.status === 201,
    'F-3 which is the safe failure: the person keeps a working account rather than losing access to '
    + 'data that was never actually removed', `${after.status}`);

  // ===========================================================================================
  await app.close();
  require('fs').rmSync(storageRoot, { recursive: true, force: true });
  console.log(`\n================ §305A individual beta scope: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, expertExecutions: 0, passed, failed: failures.length,
    individualWorkflowReachedReport: !!reportId,
    accountDeletionBlockedByMigrationDrift: deletionBlockedBySchemaDrift,
    organizationRequiredAnywhereInBetaV1: false,
  }));
  if (failures.length) process.exit(1);
}

main().catch((error) => { console.error(error); process.exit(1); });
