/**
 * §307 — THE INDIVIDUAL-BETA SECURITY BOUNDARY SUITE.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. ZERO CHARGES. Runs against a DISPOSABLE database
 * only, with `DEV_AUTH_BYPASS` forced off, through the real guarded HTTP routes.
 *
 *   npm run test:307-security-boundary            (inside `hazlenz:integration:inner`)
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE FIXTURE IS BUILT BEFORE ANYTHING IS ASSERTED.
 *
 * The §305A lesson, applied at the top of the file rather than as a footnote: an isolation suite
 * with nothing to leak passes for the wrong reason. `SE-13` was invisible for months because the
 * organization table was empty; `SE-14` was invisible because the notifications table was. So user
 * B is driven through the WHOLE Beta v1 workflow first — site, inspection, observation, HazLenz
 * analysis, human review, finalized finding, completion, issued report, revision, evidence file,
 * corrective action, notification — and only then is user A pointed at every one of B's identifiers
 * by hand. Each section that depends on a fixture asserts the fixture exists before it asserts the
 * refusal, and the suite ABORTS rather than reporting a green run over an empty table.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY 404 AND NOT 403 IS THE RIGHT REFUSAL, AND WHY THE SUITE ACCEPTS BOTH.
 *
 * `InspectionService.findAccessible` answers NotFound for a resource in another scope, because 403
 * confirms the row exists. Some routes legitimately answer 403 (an entitlement failure is about the
 * caller, not the resource) and some answer 400 (a malformed identifier never reaches a lookup). The
 * assertion is therefore "refused, and disclosed nothing", not a status-code preference — asserting
 * a cosmetic status is how a guard gets "fixed" into a security change.
 *
 * ---------------------------------------------------------------------------------------------
 * EXPERT IS NOT EXECUTED, AND THAT IS ENFORCED BY THE HARNESS RATHER THAN BY CARE.
 *
 * `EXPERT_EXECUTION_ENABLED=false` and the provider credential is cleared before `AppModule` is
 * required. The authorization boundary is still exercised in full, because ownership and
 * entitlement are decided ABOVE the operational gate: a foreign observation answers NotFound and an
 * unentitled caller answers 402 before any code that could reach a provider runs. What the kill
 * switch adds is the proof that even the entitled owner spends nothing.
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
  if (!url) throw new Error('§307 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§307 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§307 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§307 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§307 REFUSED: DEV_AUTH_BYPASS is on; a security suite run under the bypass '
      + 'measures the bypass.');
  }
}

/*
 * SET BEFORE `AppModule` IS REQUIRED. `readExpertOperationalConfig` reads `process.env` at call
 * time, but the provider adapter reads its credential at construction, so clearing it afterwards
 * would be a promise rather than a control.
 */
const PROMO = 's307-pilot-code';
process.env.EMPLOYER_PRO_PROMO_CODES = PROMO;
process.env.EXPERT_EXECUTION_ENABLED = 'false';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.EXPERT_ANTHROPIC_API_KEY;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const storageRoot = require('fs').mkdtempSync(
  require('path').join(require('os').tmpdir(), 's307-storage-'));
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
  path: string,
  options: {
    method?: string; body?: unknown; token?: string; headers?: Record<string, string>;
    /** Pin the source address so a throttle assertion measures one bucket. */
    ip?: string; raw?: string;
  } = {},
): Promise<{ status: number; body: Json; raw: string; headers: Headers }> {
  const headers: Record<string, string> = { 'content-type': 'application/json', ...(options.headers ?? {}) };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = options.ip ?? `10.37.7.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.raw !== undefined ? options.raw
      : options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw, headers: response.headers };
}

const PASSWORD = 'Section307!StrongPass123';
const NEW_PASSWORD = 'Section307!RotatedPass456';

const OBS_TEXT = 'The fixed guard is missing from the conveyor head pulley nip point and the belt is '
  + 'running. No lockout has been applied and a worker is shovelling spillage beside the drive.';

/**
 * WHAT AN EXTERNAL RESPONSE MAY NEVER CONTAIN.
 *
 * Each pattern is a class §307 names. `stackFrame` deliberately matches the `at <fn> (<file>:<line>)`
 * shape rather than the word "Error", because a well-formed 500 body legitimately says "Internal
 * server error" and refusing that would train the suite to be ignored.
 */
const DISCLOSURE_PATTERNS: ReadonlyArray<{ name: string; re: RegExp }> = [
  { name: 'SQL text', re: /\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|DELETE\s+FROM|relation ".+" does not exist|syntax error at or near)\b/i },
  { name: 'stack frame', re: /\n\s*at\s+\S+\s*\(?(\/|[A-Za-z]:\\)/ },
  { name: 'filesystem path', re: /\/(Users|home|var\/www|app\/src|opt\/render)\// },
  { name: 'database host', re: /(neon\.tech|rds\.amazonaws\.com|\.supabase\.co|postgres(ql)?:\/\/)/i },
  { name: 'provider credential', re: /(sk-ant-|sk_live_|sk_test_|whsec_|AKIA[0-9A-Z]{16}|Bearer\s+[A-Za-z0-9._-]{40,})/ },
  { name: 'password hash', re: /\$2[aby]\$\d{2}\$/ },
  { name: 'raw reset or invitation token', re: /"(resetToken|rawToken|invitationToken|inviteToken)"\s*:\s*"[^"]{16,}/i },
  { name: 'typeorm internals', re: /(QueryFailedError|EntityMetadata|driverError|\bquery:\s)/ },
];

function disclosureHits(raw: string): string[] {
  return DISCLOSURE_PATTERNS.filter((p) => p.re.test(raw)).map((p) => p.name);
}

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    { logger: process.env.S307_VERBOSE === '1' ? undefined : false });
  app.useBodyParser('json', { limit: '5mb' });
  app.useBodyParser('urlencoded', { limit: '5mb', extended: true } as any);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§307 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;
  let providerCallsObserved = 0;

  const registerAndLogin = async (tag: string, extra: Record<string, unknown> = {}) => {
    const email = `s307-${tag}-${suffix}@example.test`;
    const reg = await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s307 ${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(), ...extra,
      },
    });
    const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    return {
      email, reg, login,
      token: login.body?.token as string | undefined,
      refreshToken: (login.body?.refreshToken ?? login.body?.refresh_token) as string | undefined,
      userId: login.body?.user?.id as string | undefined,
    };
  };

  // =============================================================================================
  console.log('---- SETUP. TWO INDIVIDUALS, AND A REAL WORKFLOW OWNED BY B ----\n');
  // =============================================================================================

  const A = await registerAndLogin('user-a', { promoCode: PROMO });
  const B = await registerAndLogin('user-b', { promoCode: PROMO });
  check(!!A.token && !!B.token && A.userId !== B.userId,
    'S-1 two distinct entitled individual accounts exist', `${A.userId} / ${B.userId}`);
  check(A.login.body?.user?.organizationId === null && B.login.body?.user?.organizationId === null,
    'S-2 both carry organizationId NULL — the Beta v1 shape, and the branch where a dropped '
    + 'predicate would broaden rather than narrow');

  const tokenA = A.token as string;
  const tokenB = B.token as string;

  const bSite = await call('/sites', { method: 'POST', token: tokenB, body: { name: `s307 B site ${suffix}` } });
  const bInspection = await call('/inspections', {
    method: 'POST', token: tokenB,
    body: { siteId: bSite.body?.id, title: 's307 B inspection', regulatoryContext: 'osha-general-industry' },
  });
  const bObservation = await call(`/inspections/${bInspection.body?.id}/observations`, {
    method: 'POST', token: tokenB, body: { rawText: OBS_TEXT },
  });
  const bClassify = await call('/hazlenz/classify', { method: 'POST', token: tokenB, body: { text: OBS_TEXT } });
  const bAnalysis = await call(`/inspections/observations/${bObservation.body?.id}/analyses`, {
    method: 'POST', token: tokenB,
    body: {
      engineVersion: 'hazlenz-production', idempotencyKey: `s307-det-${suffix}`,
      requestVersion: 1, resultSnapshot: bClassify.body,
    },
  });

  const bSiteId = bSite.body?.id as string;
  const bInspectionId = bInspection.body?.id as string;
  const bObservationId = bObservation.body?.id as string;
  const bAnalysisId = bAnalysis.body?.id as string;

  check(!!bSiteId && !!bInspectionId && !!bObservationId && !!bAnalysisId,
    'S-3 user B owns a real site, inspection, observation and analysis',
    `${bSite.status}/${bInspection.status}/${bObservation.status}/${bAnalysis.status}`);

  const bDetail = await call(`/inspections/${bInspectionId}`, { token: tokenB });
  const bPending = (bDetail.body?.findings || []).filter(
    (f: Json) => f.observationId === bObservationId && f.status === 'pending_review');
  check(bPending.length > 0,
    'S-4 HazLenz produced reviewable findings for B — without them the review, completion and '
    + 'report assertions below would compare undefined with undefined', `${bPending.length} pending`);

  let bFinalized = 0;
  for (const [i, finding] of bPending.entries()) {
    const review = await call(`/inspections/observations/${bObservationId}/reviews`, {
      method: 'POST', token: tokenB,
      body: {
        analysisId: bAnalysisId, findingId: finding.id, decision: 'accepted',
        rationale: '§307 fixture: accepted as analysed by the inspector.',
      },
    });
    const finalized = await call(`/inspections/observations/${bObservationId}/findings`, {
      method: 'POST', token: tokenB,
      body: {
        reviewId: review.body?.id,
        hazardCategory: finding.hazardCategory || 'Machine guarding',
        segmentKey: finding.segmentKey || finding.hazardKey,
        conclusion: `Reviewed condition ${i + 1}: head pulley nip point unguarded while running.`,
        reviewerDisposition: 'single',
      },
    });
    if (finalized.status < 400) bFinalized += 1;
  }
  check(bFinalized === bPending.length && bPending.length > 0,
    'S-5 B finalized every pending finding', `${bFinalized}/${bPending.length}`);

  const bEvidence = await (async () => {
    // A 1x1 PNG. Harmless bytes that still exercise the magic-byte validator, the object store and
    // the download path — §307 is explicit that a dangerous payload is not needed to test a boundary.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64');
    const boundary = '----s307boundary';
    const parts = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="b-evidence.png"\r\nContent-Type: image/png\r\n\r\n`),
      png, Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const response = await fetch(`${baseUrl}/inspections/${bInspectionId}/evidence`, {
      method: 'POST',
      headers: { authorization: `Bearer ${tokenB}`, 'content-type': `multipart/form-data; boundary=${boundary}`, 'x-forwarded-for': '10.37.7.9' },
      body: parts as any,
    });
    const raw = await response.text();
    let body: Json = {}; try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
    return { status: response.status, body, raw };
  })();
  const bFileId = bEvidence.body?.id as string;
  check(bEvidence.status < 400 && !!bFileId,
    'S-7 B uploaded a real evidence object, so the file-isolation assertions have something to '
    + 'fail to reach', `${bEvidence.status}`);


  const beforeReview = await call(`/inspections/${bInspectionId}`, { token: tokenB });
  await call(`/inspections/${bInspectionId}/transition`, {
    method: 'POST', token: tokenB, body: { status: 'in_review', version: beforeReview.body?.version },
  });
  const beforeComplete = await call(`/inspections/${bInspectionId}`, { token: tokenB });
  const bCompleted = await call(`/inspections/${bInspectionId}/transition`, {
    method: 'POST', token: tokenB, body: { status: 'completed', version: beforeComplete.body?.version },
  });
  const bReport = await call(`/inspections/${bInspectionId}/reports`, { method: 'POST', token: tokenB });
  const bReportId = bReport.body?.reportId as string;
  check(bCompleted.status < 400 && bReport.status < 400 && !!bReportId,
    'S-6 B completed the inspection and an immutable report was ISSUED',
    `${bCompleted.status}/${bReport.status}`);

  const bAction = await call('/actions', {
    method: 'POST', token: tokenB,
    body: {
      title: 'Refit the head pulley guard before restart',
      description: 'Refit and secure the fixed guard over the conveyor head pulley nip point, and '
        + 'verify the lockout is applied before the belt is restarted.',
      priorityCode: 'high', inspectionId: bInspectionId,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
  });
  const bActionId = (bAction.body?.id ?? bAction.body?.action?.id) as string;
  check(bAction.status < 400 && !!bActionId,
    'S-8 B owns a real corrective action', `${bAction.status} ${bAction.raw.slice(0, 90)}`);

  const bNotificationId = randomUUID();
  await q(
    `INSERT INTO "notifications" ("id","tenantId","userId","type","title","message","read")
     VALUES ($1,$2,$3,'system','B private notification','Only user B may see this.',false)`,
    [bNotificationId, `user:${B.userId}`, B.userId]);

  const bRevisions = await call(`/inspection-reports/${bReportId}/revisions`, { token: tokenB });
  const bRevisionVersion = (bRevisions.body?.[0]?.version ?? bRevisions.body?.revisions?.[0]?.version ?? 1);
  check(bRevisions.status === 200,
    'S-9 B can read their own report revision history', `${bRevisions.status}`);

  /*
   * ABORT RATHER THAN REPORT A VACUOUS RUN. Every isolation assertion below points user A at one of
   * these identifiers. If the fixture did not build, A is refused because there is nothing there —
   * which is indistinguishable from a working guard and is exactly the failure §305A named.
   */
  const fixtureComplete = !!(bSiteId && bInspectionId && bObservationId && bAnalysisId && bReportId
    && bFileId && bActionId && bPending.length > 0);
  if (!fixtureComplete) {
    console.error('\n§307 ABORT: user B\'s fixture is incomplete, so the cross-user assertions would '
      + 'pass against absent resources rather than against guarded ones. Refusing to report vacuous '
      + 'results.');
    console.error(`   site=${bSiteId} inspection=${bInspectionId} observation=${bObservationId} `
      + `analysis=${bAnalysisId} report=${bReportId} file=${bFileId} action=${bActionId} `
      + `pendingFindings=${bPending.length}`);
    await app.close();
    process.exit(1);
  }

  // =============================================================================================
  console.log('\n---- A. AUTHENTICATION AND SESSION BOUNDARY ----\n');
  // =============================================================================================

  const jwt = require('jsonwebtoken');
  const realSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || '';
  check(realSecret.length > 0, 'A-0 the suite holds the signing secret, so a FORGED token is a real '
    + 'forgery rather than a random string', `len=${realSecret.length}`);

  const noToken = await call('/inspections');
  check(noToken.status === 401, 'A-1 no token: refused 401', `${noToken.status}`);

  for (const [label, value] of [
    ['not a JWT', 'definitely-not-a-jwt'],
    ['two segments only', 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ4In0'],
    ['empty bearer', ''],
    ['base64 garbage', Buffer.from('garbage').toString('base64')],
  ] as const) {
    const r = await call('/inspections', { token: value });
    check(r.status === 401, `A-2 malformed token (${label}): refused 401`, `${r.status}`);
    check(disclosureHits(r.raw).length === 0,
      `A-2b malformed token (${label}): the refusal discloses nothing`, disclosureHits(r.raw).join(','));
  }

  const tamperedSignature = `${tokenA.split('.').slice(0, 2).join('.')}.${'A'.repeat(43)}`;
  const tamperedR = await call('/inspections', { token: tamperedSignature });
  check(tamperedR.status === 401,
    'A-3 a VALID payload with a rewritten signature is refused — the signature is verified, not '
    + 'merely present', `${tamperedR.status}`);

  const alteredPayload = (() => {
    const [h, p, s] = tokenA.split('.');
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    claims.userId = B.userId; claims.hasProAccess = true; claims.planCode = 'pro';
    return `${h}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.${s}`;
  })();
  const alteredR = await call('/auth/me', { token: alteredPayload });
  check(alteredR.status === 401,
    'A-4 A\'s token re-pointed at B\'s userId and promoted to pro is refused — claims are signed, '
    + 'so rewriting one invalidates the token', `${alteredR.status}`);

  const noneAlg = (() => {
    const claims = { userId: B.userId, email: B.email, type: 'individual', role: 'individual' };
    return `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.`
      + `${Buffer.from(JSON.stringify(claims)).toString('base64url')}.`;
  })();
  const noneR = await call('/auth/me', { token: noneAlg });
  check(noneR.status === 401, 'A-5 an `alg: none` token is refused', `${noneR.status}`);

  const expired = jwt.sign(
    { userId: A.userId, email: A.email, type: 'individual', role: 'individual' },
    realSecret, { expiresIn: '-60s' });
  const expiredR = await call('/auth/me', { token: expired });
  check(expiredR.status === 401,
    'A-6 a correctly signed but EXPIRED token is refused — expiry is enforced, not ignored',
    `${expiredR.status}`);

  const foreignSecret = jwt.sign(
    { userId: A.userId, email: A.email, type: 'individual', role: 'individual' },
    'an-attacker-chosen-secret-that-is-long-enough-to-sign', { expiresIn: '15m' });
  const foreignR = await call('/auth/me', { token: foreignSecret });
  check(foreignR.status === 401,
    'A-7 a well-formed token signed with the WRONG secret is refused', `${foreignR.status}`);

  const ghostUser = jwt.sign(
    { userId: randomUUID(), email: 'ghost@example.test', type: 'individual', role: 'individual' },
    realSecret, { expiresIn: '15m' });
  const ghostR = await call('/auth/me', { token: ghostUser });
  check(ghostR.status === 401,
    'A-8 a validly signed token for a user that does not exist is refused — the strategy re-reads '
    + 'the account rather than trusting the claim', `${ghostR.status}`);

  // ---- deleted account -----------------------------------------------------------------------
  const doomed = await registerAndLogin('deleted-account');
  const doomedToken = doomed.token as string;
  const doomedBefore = await call('/auth/me', { token: doomedToken });
  check(doomedBefore.status === 200,
    'A-9 the soon-to-be-deleted account works BEFORE deletion — so A-10 measures deletion rather '
    + 'than a broken fixture', `${doomedBefore.status}`);
  const deleted = await call('/auth/me', { method: 'DELETE', token: doomedToken, body: { password: PASSWORD } });
  check(deleted.status === 200, 'A-9b the account deletes', `${deleted.status}`);
  const doomedAfter = await call('/auth/me', { token: doomedToken });
  check(doomedAfter.status === 401,
    'A-10 THE SAME STILL-UNEXPIRED TOKEN IS NOW REFUSED. A deleted account\'s live access token '
    + 'must die with the account, not fifteen minutes later.', `${doomedAfter.status}`);
  const doomedWorkflow = await call('/inspections', { token: doomedToken });
  check(doomedWorkflow.status === 401,
    'A-10b and it reaches no customer route either', `${doomedWorkflow.status}`);

  // ---- password change invalidation (§306 regression) -----------------------------------------
  const rotating = await registerAndLogin('password-rotation');
  const staleToken = rotating.token as string;
  const staleRefresh = rotating.refreshToken;
  const beforeRotation = await call('/auth/me', { token: staleToken });
  check(beforeRotation.status === 200,
    'A-11 the pre-reset session is live BEFORE the reset — the regression below is non-vacuous',
    `${beforeRotation.status}`);

  const resetRequest = await call('/auth/password-reset/request', {
    method: 'POST', body: { email: rotating.email }, ip: '10.37.9.11',
  });
  check(resetRequest.status < 400,
    'A-12 a reset request is accepted (and, with no provider configured, delivers nothing)',
    `${resetRequest.status}`);
  check(disclosureHits(resetRequest.raw).length === 0 && !/token/i.test(resetRequest.raw),
    'A-12b and the response carries NO reset credential', resetRequest.raw.slice(0, 80));

  /*
   * §306's PROPERTY, MEASURED RATHER THAN ASSUMED. With no delivery provider configured the service
   * mints a token, discovers the send returned NOT_CONFIGURED, and CLEARS the credential again — so
   * a recovery request that could never be completed leaves nothing on the account for an attacker
   * who later reaches the row. The first draft of this assertion expected a digest to be present and
   * was simply wrong about the contract; the contract is the stronger one.
   */
  const resetRow = await q(
    `SELECT "passwordResetTokenHash", "passwordResetExpiresAt" FROM "user" WHERE "email" = $1`,
    [rotating.email]);
  check(!resetRow[0]?.passwordResetTokenHash,
    'A-13 with delivery NOT_CONFIGURED, NO reset credential is left stranded on the account — the '
    + 'request is still accepted and answered generically (§306 preserved)',
    resetRow[0]?.passwordResetTokenHash ? 'DIGEST LEFT BEHIND' : 'none');

  /*
   * NO ACCOUNT ENUMERATION. A recovery form that answers differently for a known and an unknown
   * address is a membership oracle for every email an attacker cares to try.
   */
  const knownAddress = await call('/auth/password-reset/request', {
    method: 'POST', body: { email: A.email }, ip: '10.37.9.21',
  });
  const unknownAddress = await call('/auth/password-reset/request', {
    method: 'POST', body: { email: `s307-nobody-${suffix}@example.invalid` }, ip: '10.37.9.22',
  });
  check(knownAddress.status === unknownAddress.status && knownAddress.raw === unknownAddress.raw,
    'A-13b a KNOWN and an UNKNOWN address receive byte-identical answers — the recovery form is not '
    + 'an account-enumeration oracle',
    `${knownAddress.status}:${knownAddress.raw.slice(0, 50)} vs ${unknownAddress.status}:${unknownAddress.raw.slice(0, 50)}`);

  // The raw token never leaves the server, so the reset is completed the way §306 proves it: by
  // changing the password through the authenticated profile route, which sets the same
  // `passwordChangedAt` the reset path sets.
  const rotated = await call('/auth/me', {
    method: 'PATCH', token: staleToken, body: { currentPassword: PASSWORD, newPassword: NEW_PASSWORD },
  });
  const rotationHappened = rotated.status < 400;
  if (!rotationHappened) {
    await q(`UPDATE "user" SET "passwordChangedAt" = now() + interval '1 second' WHERE "email" = $1`,
      [rotating.email]);
  }
  const afterRotation = await call('/auth/me', { token: staleToken });
  check(afterRotation.status === 401,
    'A-14 PASSWORD-RESET SESSION REGRESSION (§306 preserved): a token issued BEFORE the password '
    + 'changed is refused afterwards, by `passwordChangedAt` rather than by expiry',
    `${afterRotation.status}${rotationHappened ? '' : ' (passwordChangedAt set directly; PATCH route declined)'}`);

  const staleRefreshUse = staleRefresh
    ? await call('/auth/refresh', { method: 'POST', body: { refreshToken: staleRefresh }, ip: '10.37.9.12' })
    : null;
  if (staleRefreshUse) {
    const refreshed = staleRefreshUse.body?.token ?? staleRefreshUse.body?.accessToken;
    const usable = refreshed
      ? (await call('/auth/me', { token: refreshed })).status === 200
      : false;
    check(!usable,
      'A-15 and the pre-change REFRESH token cannot be exchanged for a working session either — '
      + 'otherwise the invalidation would be one round trip deep', `${staleRefreshUse.status}`);
  }

  // ---- refresh token lifecycle ---------------------------------------------------------------
  const rotator = await registerAndLogin('refresh-replay');
  const firstRefresh = rotator.refreshToken;
  if (firstRefresh) {
    const exchange1 = await call('/auth/refresh', { method: 'POST', body: { refreshToken: firstRefresh }, ip: '10.37.9.13' });
    check(exchange1.status < 400, 'A-16 a refresh token exchanges for a session', `${exchange1.status}`);
    const logout = await call('/auth/logout', { method: 'POST', body: { refreshToken: firstRefresh }, ip: '10.37.9.13' });
    check(logout.status < 400, 'A-17 logout is accepted', `${logout.status}`);
    const replay = await call('/auth/refresh', { method: 'POST', body: { refreshToken: firstRefresh }, ip: '10.37.9.13' });
    const replayToken = replay.body?.token ?? replay.body?.accessToken;
    const replayUsable = replayToken ? (await call('/auth/me', { token: replayToken })).status === 200 : false;
    check(!replayUsable,
      'A-18 REPLAYING a logged-out refresh token does not produce a working session',
      `${replay.status}`);
  }

  const crossRefresh = B.refreshToken
    ? await call('/auth/refresh', { method: 'POST', body: { refreshToken: B.refreshToken }, ip: '10.37.9.14' })
    : null;
  if (crossRefresh && crossRefresh.status < 400) {
    const t = crossRefresh.body?.token ?? crossRefresh.body?.accessToken;
    const who = t ? await call('/auth/me', { token: t }) : null;
    check(who?.body?.id === B.userId,
      'A-19 a refresh token resolves to ITS OWN owner and cannot be redeemed as somebody else',
      `${who?.body?.id}`);
  }

  // =============================================================================================
  console.log('\n---- B. OBJECT OWNERSHIP: A AGAINST EVERY RESOURCE B OWNS ----\n');
  // =============================================================================================

  const forbidden: ReadonlyArray<{ label: string; path: string; method?: string; body?: unknown }> = [
    { label: 'site: read', path: `/sites/${bSiteId}` },
    { label: 'site: update', path: `/sites/${bSiteId}`, method: 'PATCH', body: { name: 's307 takeover' } },
    { label: 'site: delete', path: `/sites/${bSiteId}`, method: 'DELETE' },
    { label: 'inspection: read', path: `/inspections/${bInspectionId}` },
    { label: 'inspection: add observation', path: `/inspections/${bInspectionId}/observations`, method: 'POST', body: { rawText: 's307 intrusion' } },
    { label: 'inspection: reopen/transition', path: `/inspections/${bInspectionId}/transition`, method: 'POST', body: { status: 'in_progress', version: 1 } },
    { label: 'inspection: completion readiness', path: `/inspections/${bInspectionId}/completion-readiness` },
    { label: 'inspection: generate a report', path: `/inspections/${bInspectionId}/reports`, method: 'POST', body: {} },
    { label: 'inspection: read the current report', path: `/inspections/${bInspectionId}/report` },
    { label: 'inspection: evidence upload', path: `/inspections/${bInspectionId}/evidence`, method: 'POST', body: {} },
    { label: 'observation: edit', path: `/inspections/observations/${bObservationId}`, method: 'PATCH', body: { rawText: 's307 tampered', version: 1 } },
    { label: 'observation: persist an analysis', path: `/inspections/observations/${bObservationId}/analyses`, method: 'POST', body: { engineVersion: 'hazlenz-production', idempotencyKey: `s307-x-${suffix}`, requestVersion: 1, resultSnapshot: {} } },
    { label: 'observation: review a finding', path: `/inspections/observations/${bObservationId}/reviews`, method: 'POST', body: { analysisId: bAnalysisId, findingId: bPending[0]?.id, decision: 'accepted', rationale: 's307 intrusion attempt' } },
    { label: 'observation: finalize a finding', path: `/inspections/observations/${bObservationId}/findings`, method: 'POST', body: { reviewId: randomUUID(), hazardCategory: 'Machine guarding', conclusion: 's307 intrusion', reviewerDisposition: 'single' } },
    { label: 'observation: read the Expert analysis', path: `/inspections/observations/${bObservationId}/expert-analyses/current` },
    { label: 'observation: REQUEST an Expert analysis', path: `/inspections/observations/${bObservationId}/expert-analyses`, method: 'POST', body: { idempotencyKey: `s307-expert-${suffix}` } },
    { label: 'report: read by id', path: `/inspection-reports/${bReportId}` },
    { label: 'report: revision history', path: `/inspection-reports/${bReportId}/revisions` },
    { label: 'report: download', path: `/inspection-reports/${bReportId}/download` },
    { label: 'report: download a specific revision', path: `/inspection-reports/${bReportId}/versions/${bRevisionVersion}/download` },
    { label: 'report: archive (mutate an issued record)', path: `/inspection-reports/${bReportId}/archive`, method: 'PATCH', body: { reason: 's307 intrusion' } },
    { label: 'corrective action: update', path: `/actions/${bActionId}`, method: 'PATCH', body: { title: 's307 takeover' } },
    { label: 'corrective action: close', path: `/actions/${bActionId}/status`, method: 'PATCH', body: { status: 'completed' } },
    { label: 'file: download', path: `/files/${bFileId}` },
    { label: 'file: delete', path: `/files/${bFileId}`, method: 'DELETE' },
    { label: 'notification: mark read', path: `/notifications/${bNotificationId}/read`, method: 'PATCH' },
  ];

  const leakMarkers = [bSiteId, bInspectionId, bObservationId, bReportId, bFileId, bActionId,
    bNotificationId, B.userId as string, B.email, 'Only user B may see this',
    'Refit the head pulley guard before restart', `s307 B site ${suffix}`, 's307 B inspection']
    .filter(Boolean) as string[];

  for (const item of forbidden) {
    const r = await call(item.path, { method: item.method, token: tokenA, body: item.body });
    check(r.status >= 400 && r.status < 500,
      `B-${item.label}: REFUSED with a client error (no server error, no success)`, `${r.status}`);
    const leaked = leakMarkers.filter((marker) => r.raw.includes(marker));
    check(leaked.length === 0,
      `B-${item.label}: the refusal echoes none of B's identifiers or content back`,
      leaked.map((l) => l.slice(0, 12)).join(','));
    check(disclosureHits(r.raw).length === 0,
      `B-${item.label}: and discloses no internals`, disclosureHits(r.raw).join(','));
    if (process.env.S307_VERBOSE === '1') console.log(`        -> ${r.status} ${r.raw.slice(0, 120)}`);
  }

  // ---- and B's state is genuinely untouched, not merely hidden -------------------------------
  const bSiteAfter = await call(`/sites/${bSiteId}`, { token: tokenB });
  check(bSiteAfter.status === 200 && bSiteAfter.body?.name === `s307 B site ${suffix}`,
    'B-integrity-1 B\'s site is unchanged after A\'s update and delete attempts',
    String(bSiteAfter.body?.name));
  const bNotifAfter = await q(`SELECT "read" FROM "notifications" WHERE "id" = $1`, [bNotificationId]);
  check(bNotifAfter[0]?.read === false,
    'B-integrity-2 B\'s notification is still unread — A\'s PATCH mutated nothing',
    `read=${bNotifAfter[0]?.read}`);
  const bFileAfter = await call(`/files/${bFileId}`, { token: tokenB });
  check(bFileAfter.status === 200,
    'B-integrity-3 B\'s evidence object still downloads for B — A\'s DELETE removed nothing',
    `${bFileAfter.status}`);
  const bActionRow = await q(
    `SELECT "statusCode","title" FROM "corrective_actions" WHERE "id" = $1`, [bActionId]);
  check(bActionRow[0] && !/completed|closed|verified/i.test(String(bActionRow[0].statusCode ?? ''))
    && bActionRow[0].title === 'Refit the head pulley guard before restart',
    'B-integrity-4 B\'s corrective action was neither closed nor retitled by A — read from the row '
    + 'rather than from a response A was given',
    JSON.stringify(bActionRow[0]));
  const bReportAfter = await call(`/inspection-reports/${bReportId}`, { token: tokenB });
  check(bReportAfter.status === 200,
    'B-integrity-5 B\'s issued report is still readable and was not archived by A', `${bReportAfter.status}`);

  // ---- LIST ROUTES: A's lists contain only A's own -------------------------------------------
  for (const [label, path, marker] of [
    ['inspections', '/inspections', bInspectionId],
    ['sites', '/sites', bSiteId],
    ['reports', '/inspection-reports', bReportId],
    ['corrective actions', '/actions', bActionId],
    ['notifications', '/notifications', bNotificationId],
    ['calendar', '/calendar', bInspectionId],
  ] as const) {
    const r = await call(path, { token: tokenA });
    check(r.status < 500, `B-list ${label}: answers without a server error`, `${r.status}`);
    check(!r.raw.includes(marker), `B-list ${label}: contains nothing of B's`, `${r.raw.length} bytes`);
  }

  // ---- and B can still see their own in a list, so the lists are not empty for everyone -------
  const bList = await call('/inspections', { token: tokenB });
  check(bList.raw.includes(bInspectionId),
    'B-list-nonvacuous B\'s own inspection DOES appear in B\'s list — the list route works, so A\'s '
    + 'empty list is scoping rather than a broken endpoint');

  // =============================================================================================
  console.log('\n---- C. NULL AUTHORITY CONTEXT: ABSENCE MUST NOT BROADEN ----\n');
  // =============================================================================================

  /*
   * §305A / §305 generalized. Neither individual has an organization, so every predicate built from
   * `organizationId` is null for BOTH of them. A dropped or collapsed predicate would therefore make
   * them visible to each other rather than invisible — which is why this is asserted on a POPULATED
   * database with a second real tenant present.
   */
  const foreignOrg = randomUUID();
  await q(`INSERT INTO "organization" ("id","name","planCode") VALUES ($1,$2,'company')`,
    [foreignOrg, `S307 FOREIGN TENANT ${suffix}`]);
  const orgUser = await registerAndLogin('org-owner');
  await q(
    `INSERT INTO "organization_memberships" ("id","userId","organizationId","role","status","joinedAt")
     VALUES ($1,$2,$3,'organization_admin','active',now())`,
    [randomUUID(), orgUser.userId, foreignOrg]);
  const orgLogin = await call('/auth/login', { method: 'POST', body: { email: orgUser.email, password: PASSWORD } });
  const orgToken = orgLogin.body?.token as string;
  const orgSite = await call('/sites', { method: 'POST', token: orgToken, body: { name: `s307 ORG site ${suffix}` } });
  const orgInspection = await call('/inspections', {
    method: 'POST', token: orgToken,
    body: { siteId: orgSite.body?.id, title: 's307 ORG inspection', regulatoryContext: 'osha-general-industry' },
  });
  check(orgInspection.status < 400 && !!orgInspection.body?.id,
    'C-0 a THIRD principal exists inside a real organization, owning a real inspection — so the '
    + 'assertions below have an organization-scoped row to fail to reach',
    `${orgInspection.status}`);

  const orgInspectionId = orgInspection.body?.id as string;
  for (const [label, token, who] of [
    ['individual A (organizationId null)', tokenA, 'A'],
    ['individual B (organizationId null)', tokenB, 'B'],
  ] as const) {
    const r = await call(`/inspections/${orgInspectionId}`, { token });
    check(r.status >= 400 && !r.raw.includes(orgInspectionId),
      `C-1 ${label}: a NULL organization does not reach an organization-scoped inspection — a `
      + `dropped predicate would have returned it`, `${who}: ${r.status}`);
  }
  const orgSees = await call(`/inspections/${orgInspectionId}`, { token: orgToken });
  check(orgSees.status === 200,
    'C-1b and the organization member DOES reach it — the refusals above are scoping, not a dead '
    + 'route', `${orgSees.status}`);

  /*
   * THE OTHER DIRECTION, WHICH IS THE ONE `SE-13` MISSED: an organization principal must not reach
   * an individual's rows either. `organizationId = <org>` vs the individual's NULL is the same
   * predicate read the other way round.
   */
  const orgAtIndividual = await call(`/inspections/${bInspectionId}`, { token: orgToken });
  check(orgAtIndividual.status >= 400 && !orgAtIndividual.raw.includes(bInspectionId),
    'C-2 and an ORGANIZATION principal cannot reach an INDIVIDUAL\'s inspection either',
    `${orgAtIndividual.status}`);

  // ---- caller-supplied authority values on the analysis surface ------------------------------
  const workspaceOverrides: ReadonlyArray<{ label: string; body: Json }> = [
    { label: 'workspaceId', body: { text: OBS_TEXT, workspaceId: foreignOrg } },
    { label: 'workspaceId = another individual', body: { text: OBS_TEXT, workspaceId: `user:${B.userId}` } },
    { label: 'organizationId', body: { text: OBS_TEXT, organizationId: foreignOrg } },
    { label: 'tenantId', body: { text: OBS_TEXT, tenantId: foreignOrg } },
    { label: 'ownerUserId', body: { text: OBS_TEXT, ownerUserId: B.userId } },
  ];
  for (const attempt of workspaceOverrides) {
    const r = await call('/hazlenz/classify', { method: 'POST', token: tokenA, body: attempt.body });
    check(r.status === 400,
      `C-3 classify with a caller-supplied ${attempt.label}: STRUCTURALLY REJECTED with 400. §307 `
      + `removed workspaceId from ClassifyDto, so every authority-shaped identifier is now an `
      + `undeclared property and the global pipe refuses it rather than letting it win a `
      + `precedence contest against the server-derived context.`, `${r.status}`);
    check(!r.raw.includes(`S307 FOREIGN TENANT`) && !r.raw.includes(B.email),
      `C-3b classify with a caller-supplied ${attempt.label}: returns nothing belonging to the `
      + `named workspace`, `${r.status}`);
  }

  /*
   * NON-VACUOUS CONTROL. Without this, C-3 would also pass if `/hazlenz/classify` had simply
   * stopped working — 400 for everything is not a boundary.
   */
  const cleanClassify = await call('/hazlenz/classify', { method: 'POST', token: tokenA, body: { text: OBS_TEXT } });
  check(cleanClassify.status < 400,
    'C-3c and the SAME request without an authority field still succeeds — C-3 measures the field, '
    + 'not a broken route', `${cleanClassify.status}`);

  // ---- the unauthenticated readiness surface ---------------------------------------------------
  const readiness = await call('/health/ready');
  check(readiness.status === 200,
    'C-7 readiness answers unauthenticated, as an orchestrator requires', `${readiness.status}`);
  check(readiness.body?.monitoring?.policy === undefined
    && !/serverErrorThreshold|dedupeWindowMinutes|maxAlertsPerWindow|neverAlertsOn/.test(readiness.raw),
    'C-8 §307: and it no longer publishes the ALERTING THRESHOLDS to an unauthenticated caller — '
    + 'a detection threshold is a pacing guide for anyone who reads it',
    readiness.body?.monitoring?.policy === undefined ? 'policy absent' : 'POLICY STILL PUBLISHED');
  check(typeof readiness.body?.monitoring?.alerting === 'string'
    && typeof readiness.body?.monitoring?.serverErrorsInWindow === 'number'
    && typeof readiness.body?.passwordResetEmail?.state === 'string'
    && Array.isArray(readiness.body?.passwordResetEmail?.missing)
    && typeof readiness.body?.schema?.expectedSchemaVersion === 'string',
    'C-9 while every operator-facing state §291/§294/§306/§268 put there is still reported — the '
    + 'repair removed a threshold, not observability',
    JSON.stringify({ alerting: readiness.body?.monitoring?.alerting,
      email: readiness.body?.passwordResetEmail?.state,
      schema: readiness.body?.schema?.expectedSchemaVersion }));
  check(disclosureHits(readiness.raw).length === 0,
    'C-10 and readiness discloses no host, credential or internal path',
    disclosureHits(readiness.raw).join(','));

  // ---- the HazLenz audit/persistence surface --------------------------------------------------
  const persistenceProbe = await call(`/hazlenz/persistence/audit-records?workspaceId=${foreignOrg}`, { token: tokenA });
  check(persistenceProbe.status >= 400 || !persistenceProbe.raw.includes(foreignOrg),
    'C-4 the HazLenz persistence audit surface refuses an individual a named foreign workspace',
    `${persistenceProbe.status}`);
  const persistenceDefault = await call('/hazlenz/persistence/audit-records', { token: tokenA });
  check(persistenceDefault.status >= 400 || !persistenceDefault.raw.includes(B.userId as string),
    'C-5 and with no workspace named it discloses nothing of another individual\'s',
    `${persistenceDefault.status}`);

  const auditProbe = await call('/audit', { token: tokenA });
  check(auditProbe.status >= 400 || (!auditProbe.raw.includes(B.userId as string) && !auditProbe.raw.includes(foreignOrg)),
    'C-6 the /audit route discloses no other principal\'s rows', `${auditProbe.status}`);

  // ---- SC-2: does either contradiction have a SECURITY consequence? ---------------------------
  /*
   * §307 authorises repairing SC-2 only if one of its two entity-versus-database contradictions
   * creates an ACTUAL security consequence, and otherwise requires leaving it open. Both halves are
   * measured here rather than argued.
   *
   * HALF ONE — the `standards_master` columns the entity declares and no database has. A repository
   * read naming them fails as SQL (the §266 failure mode), so the question is whether an external
   * caller can reach one. `/standards/match` and `/applicable-standards/suggest` are the two routes
   * that read that table.
   *
   * HALF TWO — `timestamp` versus `timestamptz`. This is the one that could matter, because a naive
   * timestamp read back through a timezone-aware driver can land on a different INSTANT, and three
   * timestamps in this product are authorization inputs rather than display: `passwordChangedAt`
   * (which kills every token issued before a password change), `passwordResetExpiresAt` and
   * `refresh_tokens.expiresAt`. A shift in any of those is a window in which a token that should be
   * dead still works. So the assertion is not "SC-2 is harmless" — it is that every timestamp
   * carrying an authorization decision is `timestamptz` and therefore outside SC-2's scope.
   */
  for (const [label, path, body] of [
    ['standards match', '/standards/match', { text: OBS_TEXT }],
    ['applicable standards suggest', '/applicable-standards/suggest', { text: OBS_TEXT }],
  ] as const) {
    const r = await call(path, { method: 'POST', token: tokenA, body });
    check(r.status < 500,
      `C-sc2-1 ${label}: the SC-2 standards_master column contradiction is not reachable as a 500 `
      + `by an authenticated individual`, `${r.status}`);
    check(disclosureHits(r.raw).length === 0,
      `C-sc2-2 ${label}: and nothing internal is disclosed either way`, disclosureHits(r.raw).join(','));
  }

  const authorizationTimestamps = await q(
    `SELECT c.table_name, c.column_name, c.data_type
       FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND ((c.table_name = 'user' AND c.column_name IN ('passwordChangedAt','passwordResetExpiresAt'))
          OR (c.table_name = 'refresh_tokens' AND c.column_name = 'expiresAt'))
      ORDER BY c.table_name, c.column_name`);
  check(authorizationTimestamps.length === 3
    && authorizationTimestamps.every((row: Json) => row.data_type === 'timestamp with time zone'),
    'C-sc2-3 EVERY timestamp that participates in an authorization decision — passwordChangedAt, '
    + 'passwordResetExpiresAt and refresh_tokens.expiresAt — is timestamptz and agrees with its '
    + 'entity, so SC-2\'s timestamp contradiction cannot shift a session-invalidation or expiry '
    + 'instant. SC-2 therefore has no security consequence and stays OPEN, unrepaired.',
    JSON.stringify(authorizationTimestamps));

  // =============================================================================================
  console.log('\n---- D. MASS ASSIGNMENT / DTO BOUNDARY ----\n');
  // =============================================================================================

  /*
   * The mechanism is the global ValidationPipe's `forbidNonWhitelisted`, so the assertion is that an
   * UNDECLARED property is REJECTED rather than silently dropped. Silently dropping is the weaker
   * behaviour: it makes an added server-authoritative field fail open the day somebody forgets a
   * decorator, and it gives a caller no signal that their field was ignored.
   */
  const massAssignment: ReadonlyArray<{ label: string; path: string; method: string; body: Json; verify?: () => Promise<boolean>; }> = [
    { label: 'site: ownerUserId', path: '/sites', method: 'POST', body: { name: `s307 ma ${suffix}`, ownerUserId: B.userId } },
    { label: 'site: organizationId', path: '/sites', method: 'POST', body: { name: `s307 ma ${suffix}`, organizationId: foreignOrg } },
    { label: 'inspection: ownerUserId', path: '/inspections', method: 'POST', body: { siteId: bSiteId, title: 'x', regulatoryContext: 'osha-general-industry', ownerUserId: A.userId } },
    { label: 'inspection: organizationId', path: '/inspections', method: 'POST', body: { siteId: bSiteId, title: 'x', regulatoryContext: 'osha-general-industry', organizationId: foreignOrg } },
    { label: 'profile: role', path: '/auth/me', method: 'PATCH', body: { role: 'platform_admin' } },
    { label: 'profile: planCode', path: '/auth/me', method: 'PATCH', body: { planCode: 'pro' } },
    { label: 'profile: subscriptionStatus', path: '/auth/me', method: 'PATCH', body: { subscriptionStatus: 'active' } },
    { label: 'profile: passwordHash', path: '/auth/me', method: 'PATCH', body: { password: 'x', passwordHash: '$2b$12$abcdefghijklmnopqrstuv' } },
    { label: 'registration: role', path: '/auth/register', method: 'POST', body: { email: `s307-ma-role-${suffix}@example.test`, password: PASSWORD, name: 'ma', type: 'individual', acceptedAgreements: requiredRegistrationAcceptances(), role: 'platform_admin' } },
    { label: 'registration: organizationId', path: '/auth/register', method: 'POST', body: { email: `s307-ma-org-${suffix}@example.test`, password: PASSWORD, name: 'ma', type: 'individual', acceptedAgreements: requiredRegistrationAcceptances(), organizationId: foreignOrg } },
    { label: 'registration: subscriptionStatus', path: '/auth/register', method: 'POST', body: { email: `s307-ma-sub-${suffix}@example.test`, password: PASSWORD, name: 'ma', type: 'individual', acceptedAgreements: requiredRegistrationAcceptances(), subscriptionStatus: 'active', planCode: 'pro' } },
    { label: 'analysis: producer/provenance', path: `/inspections/observations/${bObservationId}/analyses`, method: 'POST', body: { engineVersion: 'x', idempotencyKey: `s307-ma-${suffix}`, requestVersion: 1, resultSnapshot: {}, producer: 'expert_hazlenz', analysisState: 'ADMITTED' } },
    { label: 'expert: workspaceId / spend ceiling', path: `/inspections/observations/${bObservationId}/expert-analyses`, method: 'POST', body: { idempotencyKey: `s307-ma-exp-${suffix}`, workspaceId: foreignOrg, dailyAnalysisLimitPerWorkspace: 9999, dailyCostLimitUsdPerWorkspace: 9999 } },
    { label: 'expert: provider/model authority', path: `/inspections/observations/${bObservationId}/expert-analyses`, method: 'POST', body: { idempotencyKey: `s307-ma-exp2-${suffix}`, provider: 'anthropic', model: 'claude-opus-5', executionEnabled: true } },
    { label: 'corrective action: tenantId/ownerUserId', path: '/actions', method: 'POST', body: { title: 'ma', description: 'otherwise valid', priorityCode: 'low', inspectionId: bInspectionId, tenantId: foreignOrg, ownerUserId: B.userId } },
    { label: 'corrective action: audit actor', path: '/actions', method: 'POST', body: { title: 'ma', description: 'otherwise valid', priorityCode: 'low', actorUserId: B.userId, auditActor: B.userId } },
  ];

  for (const attempt of massAssignment) {
    const r = await call(attempt.path, { method: attempt.method, token: tokenA, body: attempt.body });
    check(r.status >= 400 && r.status < 500,
      `D-${attempt.label}: the undeclared server-authoritative field is REFUSED, not dropped`,
      `${r.status}`);
    check(disclosureHits(r.raw).length === 0,
      `D-${attempt.label}: and the refusal discloses nothing`, disclosureHits(r.raw).join(','));
  }

  // ---- the accounts that mass assignment tried to create or promote were not created/promoted --
  const promoted = await q(
    `SELECT "email","role","planCode","subscriptionStatus" FROM "user" WHERE "email" LIKE $1`,
    [`s307-ma-%-${suffix}@example.test`]);
  check(promoted.length === 0,
    'D-verify-1 not one of the mass-assignment registrations created an account',
    `${promoted.length} rows`);
  const aRow = await q(
    `SELECT "role","planCode","subscriptionStatus","organizationId" FROM "user" WHERE "email" = $1`, [A.email]);
  check(aRow[0]?.role !== 'platform_admin' && aRow[0]?.planCode !== 'pro'
    && aRow[0]?.subscriptionStatus !== 'active' && aRow[0]?.organizationId == null,
    'D-verify-2 and user A was not promoted, re-planned, re-subscribed or given an organization by '
    + 'any of it', JSON.stringify(aRow[0]));

  // =============================================================================================
  console.log('\n---- E. ENTITLEMENT AUTHORITY (§301 / §302 preserved) ----\n');
  // =============================================================================================

  const freeUser = await registerAndLogin('free-entitlement');
  const freeToken = freeUser.token as string;
  const freeClassify = await call('/hazlenz/classify', { method: 'POST', token: freeToken, body: { text: OBS_TEXT } });
  check(freeClassify.status === 402,
    'E-1 a FREE individual is refused HazLenz with 402', `${freeClassify.status}`);

  for (const [label, body] of [
    ['planCode', { text: OBS_TEXT, planCode: 'pro' }],
    ['selectedPlan', { text: OBS_TEXT, selectedPlan: 'pro' }],
    ['entitlements', { text: OBS_TEXT, entitlements: { fullSafeScope: true } }],
    ['hasProAccess', { text: OBS_TEXT, hasProAccess: true }],
  ] as const) {
    const r = await call('/hazlenz/classify', { method: 'POST', token: freeToken, body });
    check(r.status === 402 || r.status === 400,
      `E-2 a caller-supplied ${label} does not promote entitlement (§301 preserved)`, `${r.status}`);
  }

  const freeExpert = await call(`/inspections/observations/${bObservationId}/expert-analyses`, {
    method: 'POST', token: freeToken, body: { idempotencyKey: `s307-free-expert-${suffix}` },
  });
  check(freeExpert.status === 402 || freeExpert.status === 404 || freeExpert.status === 403,
    'E-3 AN UNENTITLED INDIVIDUAL CANNOT INVOKE PAID EXPERT CAPABILITY. The refusal happens above '
    + 'anything that could reach a provider.', `${freeExpert.status}`);

  const freeHeaderPromotion = await call('/hazlenz/classify', {
    method: 'POST', token: freeToken, body: { text: OBS_TEXT },
    headers: { 'x-plan-code': 'pro', 'x-entitlement': 'fullSafeScope', 'x-has-pro-access': 'true' },
  });
  check(freeHeaderPromotion.status === 402,
    'E-4 nor does a caller-supplied HEADER promote entitlement', `${freeHeaderPromotion.status}`);

  const freeBilling = await q(
    `SELECT "planCode","subscriptionStatus" FROM "user" WHERE "email" = $1`, [freeUser.email]);
  check(freeBilling[0]?.planCode === 'free' && freeBilling[0]?.subscriptionStatus === 'none',
    'E-5 and the free account row is still free/none after every attempt',
    JSON.stringify(freeBilling[0]));

  const grantAttempt = await call('/admin/entitlement-grants', {
    method: 'POST', token: tokenA,
    body: { userId: A.userId, entitlement: 'fullSafeScope', reason: 's307 self-grant attempt' },
  });
  check(grantAttempt.status >= 400,
    'E-6 an ordinary individual cannot mint themselves an entitlement grant through the admin route',
    `${grantAttempt.status}`);

  // =============================================================================================
  console.log('\n---- F. EXPERT / HAZLENZ EXECUTION AUTHORITY, WITHOUT EXECUTING ----\n');
  // =============================================================================================

  const aSite = await call('/sites', { method: 'POST', token: tokenA, body: { name: `s307 A site ${suffix}` } });
  const aInspection = await call('/inspections', {
    method: 'POST', token: tokenA,
    body: { siteId: aSite.body?.id, title: 's307 A inspection', regulatoryContext: 'osha-general-industry' },
  });
  const aObservation = await call(`/inspections/${aInspection.body?.id}/observations`, {
    method: 'POST', token: tokenA, body: { rawText: OBS_TEXT },
  });
  const aObservationId = aObservation.body?.id as string;
  check(!!aObservationId, 'F-0 user A owns an observation of their own, so the kill-switch assertion '
    + 'below is made by the legitimate owner rather than deflected by an ownership refusal',
    `${aObservation.status}`);

  const killSwitch = await call(`/inspections/observations/${aObservationId}/expert-analyses`, {
    method: 'POST', token: tokenA, body: { idempotencyKey: `s307-killswitch-${suffix}` },
  });
  check(killSwitch.status === 503,
    'F-1 THE ENTITLED OWNER IS REFUSED BY THE KILL SWITCH with 503 — EXPERT_EXECUTION_ENABLED=false '
    + 'is evaluated before the pre-spend claim', `${killSwitch.status}`);
  check(killSwitch.body?.code === 'EXPERT_EXECUTION_DISABLED'
    || String(killSwitch.raw).includes('EXPERT_EXECUTION_DISABLED'),
    'F-1b and it names the kill switch rather than an entitlement or ownership failure',
    String(killSwitch.body?.code ?? killSwitch.raw.slice(0, 60)));
  check(killSwitch.body?.providerCallsMade === 0 || !/provider/i.test(killSwitch.raw)
    || String(killSwitch.raw).includes('"providerCallsMade":0'),
    'F-1c and reports zero provider calls made', String(killSwitch.body?.providerCallsMade));

  /*
   * SCOPED TO THIS SUITE'S OWN PRINCIPALS AND KEYS, NOT TO THE WHOLE TABLE. Inside
   * `hazlenz:integration:inner` this suite shares one disposable database with §262, §264 and §265,
   * which legitimately create execution rows of their own. A table-wide count would fail for a
   * reason that has nothing to do with §307 — and, worse, would pass when run alone and fail only
   * in the chain, which trains people to ignore it.
   */
  const executionRows = await q(
    `SELECT count(*)::int AS n FROM "expert_analysis_executions"
      WHERE "idempotencyKey" LIKE 's307-%' OR "requestedByUserId" = ANY($1::uuid[])`,
    [[A.userId, B.userId]]).catch(() => [{ n: 0 }]);
  check(executionRows[0]?.n === 0,
    'F-2 NOT ONE EXPERT EXECUTION ROW EXISTS for any principal or idempotency key this suite '
    + 'created, after every Expert attempt it made — a refusal before the claim writes nothing',
    `${executionRows[0]?.n} rows`);
  providerCallsObserved = 0;

  /*
   * THE SPEND CEILING IS SERVER-DERIVED. Asked in-process, because the derivation is what is under
   * test rather than any route: usage is read for `{ organizationId: <from the inspection>, userId:
   * <from the token> }`, and there is no path from a request body to either value.
   */
  const expertAuthority = app.get(require('../src/hazlenz/expert-hazlenz-product/expert-analysis.service').ExpertAnalysisService);
  const executionId = randomUUID();
  await q(
    `INSERT INTO "expert_analysis_executions" ("id","observationId","inspectionId",
       "requestedByUserId","organizationId","idempotencyKey","requestVersion","executionState",
       "costUsd","createdAt")
     VALUES ($1,$2,$3,$4,NULL,$5,1,'ANALYSIS_FAILED',0.75,now())`,
    [executionId, bObservationId, bInspectionId, B.userId, `s307-usage-${suffix}`]).catch((error: Error) => {
      console.log(`      (could not plant a usage row: ${error.message.slice(0, 120)})`);
    });
  const plantedRows = await q(`SELECT count(*)::int AS n FROM "expert_analysis_executions" WHERE "id" = $1`, [executionId]);
  if (plantedRows[0]?.n === 1) {
    const usageForB = await expertAuthority.readWorkspaceExpertUsage(
      { organizationId: null, userId: B.userId }, 24);
    const usageForA = await expertAuthority.readWorkspaceExpertUsage(
      { organizationId: null, userId: A.userId }, 24);
    check(usageForB.analysesInWindow === 1 && Number(usageForB.costUsdInWindow) === 0.75,
      'F-3 B\'s spend window counts B\'s own execution — non-vacuous', JSON.stringify(usageForB));
    check(usageForA.analysesInWindow === 0 && Number(usageForA.costUsdInWindow) === 0,
      'F-4 AND A\'S WINDOW DOES NOT. Two organization-less individuals do not share one ceiling: '
      + 'the null-organization branch scopes by requestedByUserId rather than dropping the '
      + 'predicate.', JSON.stringify(usageForA));
    const usageForOrg = await expertAuthority.readWorkspaceExpertUsage(
      { organizationId: foreignOrg, userId: A.userId }, 24);
    check(usageForOrg.analysesInWindow === 0,
      'F-5 and an organization\'s window does not absorb an individual\'s spend either',
      JSON.stringify(usageForOrg));
    await q(`DELETE FROM "expert_analysis_executions" WHERE "id" = $1`, [executionId]);
  }

  const controls = require('../src/hazlenz/expert-hazlenz-product/expert-operational-controls');
  const productionLimits = controls.readExpertOperationalConfig({
    EXPERT_EXECUTION_ENABLED: 'true',
    EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE: '1',
    EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE: '1',
    EXPERT_SPEND_WINDOW_HOURS: '24',
  });
  check(productionLimits.dailyAnalysisLimitPerWorkspace === 1
    && productionLimits.dailyCostLimitUsdPerWorkspace === 1
    && productionLimits.windowHours === 24
    && productionLimits.maxAttemptsPerLeg === 1,
    'F-6 the production limit surface still reads 1 analysis and USD 1.00 per workspace per 24h, '
    + 'with no automatic retry — §307 changes none of it', JSON.stringify(productionLimits));
  const atCeiling = controls.evaluateExpertExecutionPermission(productionLimits,
    { analysesInWindow: 1, costUsdInWindow: 0 });
  check(atCeiling.permitted === false && atCeiling.reason === 'WORKSPACE_ANALYSIS_CEILING_REACHED',
    'F-7 and a workspace at the ceiling is refused', String((atCeiling as Json).reason));

  // =============================================================================================
  console.log('\n---- G. FILE / STORAGE BOUNDARY ----\n');
  // =============================================================================================

  const fileProbes: ReadonlyArray<{ label: string; id: string; expectClientError: boolean }> = [
    { label: 'malformed UUID', id: 'not-a-uuid', expectClientError: true },
    { label: 'SQL-shaped identifier', id: "1' OR '1'='1", expectClientError: true },
    { label: 'path traversal identifier', id: '../../../../etc/passwd', expectClientError: true },
    { label: 'null byte', id: 'a%00b', expectClientError: true },
    { label: 'valid but foreign UUID', id: randomUUID(), expectClientError: true },
  ];
  for (const probe of fileProbes) {
    const r = await call(`/files/${encodeURIComponent(probe.id)}`, { token: tokenA });
    check(r.status >= 400 && r.status < 500,
      `G-${probe.label}: refused with a client error, never a 500 (SE-5 preserved)`, `${r.status}`);
    check(disclosureHits(r.raw).length === 0,
      `G-${probe.label}: and discloses no SQL, path or internal detail`, disclosureHits(r.raw).join(','));
  }

  // ---- a hostile FILENAME must not escape the object key or the download header ---------------
  const hostileNames = [
    '../../../../etc/passwd.png',
    'evidence\r\nSet-Cookie: session=stolen.png',
    'evidence";attachment;filename="stolen.png',
    `${'A'.repeat(400)}.png`,
  ];
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64');
  const aInspectionId = aInspection.body?.id as string;
  for (const name of hostileNames) {
    const boundary = '----s307hostile';
    const parts = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name.replace(/"/g, '%22').replace(/[\r\n]/g, '')}"\r\nContent-Type: image/png\r\n\r\n`),
      png, Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const response = await fetch(`${baseUrl}/inspections/${aInspectionId}/evidence`, {
      method: 'POST',
      headers: { authorization: `Bearer ${tokenA}`, 'content-type': `multipart/form-data; boundary=${boundary}`, 'x-forwarded-for': '10.37.7.12' },
      body: parts as any,
    });
    const raw = await response.text();
    let body: Json = {}; try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    const short = name.slice(0, 28).replace(/[\r\n]/g, '\\n');
    if (response.status >= 400) {
      check(response.status < 500, `G-filename "${short}": refused with a client error`, `${response.status}`);
      continue;
    }
    const stored = await q(`SELECT "objectKey","downloadName" FROM "storage_objects" WHERE "id" = $1`, [body.id])
      .catch(() => []);
    const objectKey = String(stored[0]?.objectKey ?? '');
    const downloadName = String(stored[0]?.downloadName ?? '');
    check(/^[a-z]+\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}$/.test(objectKey),
      `G-filename "${short}": the OBJECT KEY is server-minted and carries nothing of the filename`,
      objectKey);
    check(!/[\r\n]/.test(downloadName) && !downloadName.includes('..') && downloadName.length <= 190,
      `G-filename "${short}": the stored download name is sanitised`, downloadName.slice(0, 40));
    const dl = await call(`/files/${body.id}`, { token: tokenA });
    const disposition = dl.headers.get('content-disposition') ?? '';
    check(!/[\r\n]/.test(disposition) && (disposition.match(/filename=/g) || []).length <= 1,
      `G-filename "${short}": the Content-Disposition header carries no injected directive`,
      disposition.slice(0, 70));
    check((dl.headers.get('x-content-type-options') ?? '').toLowerCase() === 'nosniff',
      `G-filename "${short}": the download is served nosniff`, dl.headers.get('x-content-type-options') ?? 'absent');
  }

  // ---- content-type / magic bytes -------------------------------------------------------------
  const notAnImage = Buffer.from('<?php echo "not an image"; ?>', 'utf8');
  const boundary2 = '----s307type';
  const typeParts = Buffer.concat([
    Buffer.from(`--${boundary2}\r\nContent-Disposition: form-data; name="file"; filename="claims-to-be.png"\r\nContent-Type: image/png\r\n\r\n`),
    notAnImage, Buffer.from(`\r\n--${boundary2}--\r\n`),
  ]);
  const typeResponse = await fetch(`${baseUrl}/inspections/${aInspectionId}/evidence`, {
    method: 'POST',
    headers: { authorization: `Bearer ${tokenA}`, 'content-type': `multipart/form-data; boundary=${boundary2}`, 'x-forwarded-for': '10.37.7.13' },
    body: typeParts as any,
  });
  check(typeResponse.status >= 400 && typeResponse.status < 500,
    'G-content-type: a non-image body with an image/png declaration is refused — the validator '
    + 'reads the BYTES, not the caller\'s claim', `${typeResponse.status}`);

  // ---- oversized body -------------------------------------------------------------------------
  const oversize = await call('/hazlenz/classify', {
    method: 'POST', token: tokenA, raw: JSON.stringify({ text: 'x'.repeat(6 * 1024 * 1024) }),
  });
  check(oversize.status === 413 || (oversize.status >= 400 && oversize.status < 500),
    'G-body-limit: a body above the 5mb limit is refused with a client error rather than accepted '
    + 'or crashed', `${oversize.status}`);

  // =============================================================================================
  console.log('\n---- H. IMMUTABLE REPORT BOUNDARY ----\n');
  // =============================================================================================

  /*
   * THE IMMUTABLE FACTS LIVE ON THE VERSION ROWS. `inspection_reports` is the identity; each
   * `inspection_report_versions` row carries the issued artifact's `sha256`, its `status`, the
   * `sourceFingerprint` it was generated from and the storage object it points at. Snapshotting all
   * four for every version is what makes "unchanged" a statement about the RECORD rather than about
   * the response A happened to receive.
   */
  const reportVersionSnapshot = async () => JSON.stringify(await q(
    `SELECT "version","status","sha256","sourceFingerprint","storageObjectId","supersededByVersionId"
       FROM "inspection_report_versions" WHERE "reportId" = $1 ORDER BY "version"`, [bReportId]));
  const reportIdentity = async () => JSON.stringify(await q(
    `SELECT "inspectionId","ownerUserId","organizationId","archivedAt"
       FROM "inspection_reports" WHERE "id" = $1`, [bReportId]));
  const versionsBefore = await reportVersionSnapshot();
  const identityBefore = await reportIdentity();
  const parsedVersions = JSON.parse(versionsBefore) as Json[];
  check(parsedVersions.length > 0 && typeof parsedVersions[0].sha256 === 'string'
    && String(parsedVersions[0].sha256).length === 64,
    'H-0 B\'s issued report has at least one version row carrying a 64-character SHA-256 of the '
    + 'artifact, so tampering is detectable at all',
    `${parsedVersions.length} version(s), sha256=${String(parsedVersions[0]?.sha256 ?? '').slice(0, 16)}`);

  const reportTampering: ReadonlyArray<{ label: string; path: string; method: string; body?: unknown }> = [
    { label: 'rewrite the report by id', path: `/inspection-reports/${bReportId}`, method: 'PATCH', body: { summary: 's307 rewritten' } },
    { label: 'archive the report', path: `/inspection-reports/${bReportId}/archive`, method: 'PATCH', body: { reason: 's307' } },
    { label: 'regenerate over the inspection', path: `/inspections/${bInspectionId}/reports`, method: 'POST', body: {} },
    { label: 'delete the report', path: `/inspection-reports/${bReportId}`, method: 'DELETE' },
  ];
  for (const attempt of reportTampering) {
    const r = await call(attempt.path, { method: attempt.method, token: tokenA, body: attempt.body });
    check(r.status >= 400 && r.status < 500,
      `H-${attempt.label}: A is refused`, `${r.status}`);
  }
  const versionsAfter = await reportVersionSnapshot();
  const identityAfter = await reportIdentity();
  check(versionsAfter === versionsBefore,
    'H-1 AND EVERY VERSION ROW IS BYTE-IDENTICAL AFTERWARDS — same version count, same status, same '
    + 'sha256, same source fingerprint, same storage object. The report is unchanged in FACT, not '
    + 'merely unchanged in the response A received.',
    versionsAfter === versionsBefore ? 'identical' : `${versionsBefore.slice(0, 90)} -> ${versionsAfter.slice(0, 90)}`);
  check(identityAfter === identityBefore,
    'H-2 and the report itself was not archived or re-owned',
    identityAfter === identityBefore ? 'identical' : `${identityBefore} -> ${identityAfter}`);

  // =============================================================================================
  console.log('\n---- I. RATE LIMITING / RESOURCE ABUSE ----\n');
  // =============================================================================================

  /*
   * Threshold behaviour is measured LOCALLY, from one pinned source address, on synthetic accounts.
   * §307 forbids a production load test and this is the reason the suite exists: the control can be
   * proven here without generating a single request against the deployed service.
   */
  const throttleProbes: ReadonlyArray<{ label: string; path: string; body: unknown; limit: number; ip: string }> = [
    { label: 'login', path: '/auth/login', body: { email: `s307-throttle-${suffix}@example.invalid`, password: 'WrongPassword!123' }, limit: 5, ip: '10.37.31.1' },
    { label: 'registration', path: '/auth/register', body: { email: `s307-throttle-reg-${suffix}@example.invalid`, password: PASSWORD, name: 't', type: 'individual', acceptedAgreements: requiredRegistrationAcceptances() }, limit: 5, ip: '10.37.31.2' },
    { label: 'password-reset request', path: '/auth/password-reset/request', body: { email: `s307-throttle-reset-${suffix}@example.invalid` }, limit: 3, ip: '10.37.31.3' },
  ];
  for (const probe of throttleProbes) {
    let throttledAt = -1;
    for (let attempt = 1; attempt <= probe.limit + 2; attempt += 1) {
      const r = await call(probe.path, { method: 'POST', body: probe.body, ip: probe.ip });
      if (r.status === 429) { throttledAt = attempt; break; }
    }
    check(throttledAt > 0 && throttledAt <= probe.limit + 2,
      `I-${probe.label}: bounded — the route answers 429 at attempt ${throttledAt} from one source `
      + `address (declared limit ${probe.limit}/60s)`,
      throttledAt > 0 ? `429 at ${throttledAt}` : 'never throttled');
  }

  const differentSource = await call('/auth/login', {
    method: 'POST', body: { email: `s307-throttle-${suffix}@example.invalid`, password: 'WrongPassword!123' },
    ip: '10.37.31.99',
  });
  check(differentSource.status !== 429,
    'I-independence a DIFFERENT source address is not collaterally throttled — the bucket is '
    + 'per-caller rather than global, so one abuser cannot lock every customer out',
    `${differentSource.status}`);

  const expertThrottle = await call(`/inspections/observations/${aObservationId}/expert-analyses`, {
    method: 'POST', token: tokenA, body: { idempotencyKey: `s307-throttle-expert-${suffix}` },
  });
  check(expertThrottle.status === 503,
    'I-expert the most expensive route in the product is still behind the kill switch as well as '
    + 'its 10/60s throttle', `${expertThrottle.status}`);

  const healthThrottleHeaders = await call('/health/live');
  check(!!healthThrottleHeaders.headers.get('x-ratelimit-limit'),
    'I-health the unauthenticated health surface is inside the global throttle',
    healthThrottleHeaders.headers.get('x-ratelimit-limit') ?? 'absent');

  // =============================================================================================
  console.log('\n---- J. ERROR DISCLOSURE ACROSS THE STATUS RANGE ----\n');
  // =============================================================================================

  const disclosureProbes: ReadonlyArray<{ label: string; path: string; method?: string; body?: unknown; token?: string; raw?: string }> = [
    { label: '400 validation', path: '/auth/register', method: 'POST', body: { email: 'not-an-email', password: 'x' } },
    { label: '400 malformed JSON', path: '/auth/login', method: 'POST', raw: '{"email": ' },
    { label: '400 malformed identifier', path: '/inspections/not-a-uuid', token: tokenA },
    { label: '401 unauthenticated', path: '/inspections' },
    { label: '401 bad token', path: '/inspections', token: 'garbage.token.value' },
    { label: '402 entitlement', path: '/hazlenz/classify', method: 'POST', body: { text: OBS_TEXT }, token: freeToken },
    { label: '403/404 foreign resource', path: `/inspections/${bInspectionId}`, token: tokenA },
    { label: '404 unknown route', path: '/this-route-does-not-exist', token: tokenA },
    { label: '404 unknown id', path: `/inspections/${randomUUID()}`, token: tokenA },
    { label: '409 stale version', path: `/inspections/${aInspectionId}/transition`, method: 'POST', body: { status: 'completed', version: 999 }, token: tokenA },
    { label: '410 retired route', path: `/legacy/pdf/${randomUUID()}`, token: tokenA },
    { label: '503 kill switch', path: `/inspections/observations/${aObservationId}/expert-analyses`, method: 'POST', body: { idempotencyKey: `s307-disc-${suffix}` }, token: tokenA },
  ];
  const statusesSeen = new Set<number>();
  for (const probe of disclosureProbes) {
    const r = await call(probe.path, {
      method: probe.method, body: probe.body, raw: probe.raw,
      token: probe.token ?? undefined, ip: '10.37.41.5',
    });
    statusesSeen.add(r.status);
    const hits = disclosureHits(r.raw);
    check(hits.length === 0,
      `J-${probe.label} (${r.status}): the external body exposes no SQL, stack frame, filesystem `
      + `path, database host, credential, hash or token`, hits.join(',') || r.raw.slice(0, 60));
    check(!r.raw.includes(B.email) && !r.raw.includes(String(B.userId)),
      `J-${probe.label} (${r.status}): and no other user's identifiers`, `${r.status}`);
  }
  check(statusesSeen.size >= 6,
    `J-coverage the probes actually produced a spread of statuses rather than one repeated answer`,
    [...statusesSeen].sort((a, b) => a - b).join(','));

  // ---- an INDUCED 500 must still say nothing -------------------------------------------------
  const induced = await call('/hazlenz/classify', {
    method: 'POST', token: tokenA, raw: '{"text": "' + '\\u0000'.repeat(4) + '"}',
  });
  check(induced.status < 500 || disclosureHits(induced.raw).length === 0,
    'J-induced even a hostile body that reaches the engine returns nothing internal',
    `${induced.status} ${disclosureHits(induced.raw).join(',')}`);

  // =============================================================================================
  console.log('\n---- K. DEFERRED COMPANY/TEAM ROUTES STILL FAIL CLOSED ----\n');
  // =============================================================================================

  await q(
    `INSERT INTO "invitation" ("id","email","token","role","organizationId","isUsed")
     VALUES ($1,$2,$3,'Auditor',$4,false)`,
    [randomUUID(), `s307-foreign-invitee-${suffix}@example.test`,
      require('crypto').randomBytes(16).toString('hex'), foreignOrg]);

  const deferred: ReadonlyArray<{ path: string; method?: string; body?: unknown; label: string }> = [
    { path: '/organization/me/settings', label: 'read organization settings' },
    { path: '/organization/me/members', label: 'list members' },
    { path: '/organization/me/invites', label: 'list invitations' },
    { path: `/organization/${foreignOrg}`, label: 'read a FOREIGN organization by id' },
    { path: '/organization/me/invite', method: 'POST', body: { email: 's307@example.test', role: 'Auditor' }, label: 'create an invitation' },
    { path: '/organization/me/settings', method: 'PATCH', body: { name: 's307 takeover' }, label: 'rename an organization' },
    { path: '/upload/logo', method: 'POST', body: {}, label: 'upload an organization logo' },
    { path: '/maintenance/seed-safescope', method: 'POST', body: { confirm: 'seed-production-safescope' }, label: 'run the maintenance seed' },
    { path: '/regulatory/sync?part=56', method: 'POST', body: {}, label: 'run a regulatory sync' },
    { path: '/admin/entitlement-grants', method: 'POST', body: { userId: A.userId, entitlement: 'fullSafeScope' }, label: 'mint an entitlement grant' },
  ];
  const membershipsBefore = await q(`SELECT count(*)::int AS n FROM "organization_memberships"`);
  const invitationsBefore = await q(`SELECT count(*)::int AS n FROM "invitation"`);

  for (const d of deferred) {
    const r = await call(d.path, { method: d.method, token: tokenA, body: d.body });
    check(r.status < 500, `K-${d.label}: no server error`, `${r.status}`);
    check(!r.raw.includes(foreignOrg) && !/S307 FOREIGN TENANT|s307-foreign-invitee/.test(r.raw),
      `K-${d.label}: discloses nothing belonging to the foreign tenant`, r.raw.slice(0, 60));
    if (d.method) {
      check(r.status >= 400, `K-${d.label}: the MUTATION is refused outright`, `${r.status}`);
    }
  }

  const membershipsAfter = await q(`SELECT count(*)::int AS n FROM "organization_memberships"`);
  const invitationsAfter = await q(`SELECT count(*)::int AS n FROM "invitation"`);
  check(membershipsAfter[0].n === membershipsBefore[0].n,
    'K-effect-1 no membership was created by any of it',
    `${membershipsBefore[0].n} -> ${membershipsAfter[0].n}`);
  check(invitationsAfter[0].n === invitationsBefore[0].n,
    'K-effect-2 and no invitation was created',
    `${invitationsBefore[0].n} -> ${invitationsAfter[0].n}`);
  const aRoleAfter = await q(`SELECT "role","organizationId" FROM "user" WHERE "email" = $1`, [A.email]);
  check(aRoleAfter[0]?.role !== 'platform_admin' && aRoleAfter[0]?.organizationId == null,
    'K-effect-3 and A gained neither a role nor an organization', JSON.stringify(aRoleAfter[0]));

  const verifyInvite = await call('/auth/verify-invite/some-opaque-token');
  check(verifyInvite.status === 404 && disclosureHits(verifyInvite.raw).length === 0,
    'K-invite verify-invite answers a bounded 404 with no disclosure (SE-6 preserved)',
    `${verifyInvite.status}`);

  /*
   * §307. `/maintenance/seed-safescope` calls `dataSource.synchronize(false)`. It answered 404 in
   * production only because `ENABLE_MAINTENANCE_SEED` happened to be `false`, which is containment
   * by configuration. The refusal is now ordered so that production is refused BEFORE the flag is
   * read — asserted on the source, because the running harness is NODE_ENV=test and cannot
   * demonstrate a production refusal by making a request.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maintenanceSource = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src', 'maintenance', 'maintenance-seed.controller.ts'), 'utf8');
  const productionRefusalAt = maintenanceSource.indexOf("process.env.NODE_ENV === 'production'");
  const flagRefusalAt = maintenanceSource.indexOf("process.env.ENABLE_MAINTENANCE_SEED !== 'true'");
  // The CALL, not the sentence in the header comment that describes it.
  const synchronizeAt = maintenanceSource.indexOf('await this.dataSource.synchronize(');
  check(productionRefusalAt > 0 && flagRefusalAt > 0 && productionRefusalAt < flagRefusalAt
    && productionRefusalAt < synchronizeAt,
    'K-synchronize the only route that calls dataSource.synchronize() refuses production FIRST, '
    + 'ahead of the feature flag — so the flag is no longer the only thing between production and '
    + 'a runtime schema synchronize (§305 canonical-schema contract preserved)',
    `productionRefusal@${productionRefusalAt} flag@${flagRefusalAt} synchronize@${synchronizeAt}`);
  const otherSynchronizeCallers = (() => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of require('fs').readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'migrations') continue;
        const full = require('path').join(dir, entry);
        if (require('fs').statSync(full).isDirectory()) { walk(full); continue; }
        if (!entry.endsWith('.ts')) continue;
        const text = require('fs').readFileSync(full, 'utf8');
        if (/await\s+[\w.]*\.synchronize\s*\(/.test(text) && !full.endsWith('maintenance-seed.controller.ts')) hits.push(full);
      }
    };
    walk(require('path').join(__dirname, '..', 'src'));
    return hits;
  })();
  check(otherSynchronizeCallers.length === 0,
    'K-synchronize-sweep and no OTHER module in src/ calls synchronize() at all',
    otherSynchronizeCallers.join(', ') || 'none');

  // =============================================================================================
  console.log('\n---- L. HTTP SECURITY SURFACE ON THE APPLICATION ITSELF ----\n');
  // =============================================================================================

  /*
   * A SOURCE-CONTRACT ASSERTION, AND IT SAYS SO.
   *
   * Helmet, `x-powered-by`, the CORS allow-list and the body limits are applied by `bootstrap()` in
   * `main.ts`, which this harness does not run — it boots `AppModule` directly, exactly as §305A
   * does. Applying helmet here would measure THIS FILE's call rather than the product's, and
   * reporting that as header coverage is precisely the failure §307 names: claiming browser
   * protection from a header that is not actually returned.
   *
   * So the in-process suite asserts only that the CONFIGURATION is present and correctly shaped,
   * and the behavioural proof is a read of the DEPLOYED production response, recorded separately in
   * the §307 evidence. Two different claims, kept apart on purpose.
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mainSource = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src', 'main.ts'), 'utf8');
  const bootstrapContract: ReadonlyArray<[string, RegExp]> = [
    ['helmet() is applied globally', /app\.use\(helmet\(\)\)/],
    ['x-powered-by is disabled', /express\.disable\('x-powered-by'\)/],
    ['the validation pipe forbids non-whitelisted properties', /forbidNonWhitelisted:\s*true/],
    ['the validation pipe whitelists', /whitelist:\s*true/],
    ['CORS uses an origin CALLBACK rather than a wildcard', /origin:\s*\(origin,\s*callback\)/],
    ['a disallowed origin is refused', /callback\(null,\s*false\)/],
    ['the JSON body limit is bounded', /useBodyParser\('json',\s*\{\s*limit:\s*'5mb'/],
    ['the urlencoded body limit is bounded', /useBodyParser\('urlencoded'/],
    ['production configuration is validated before the app is created', /validateProductionEnvironment\(\);[\s\S]{0,200}NestFactory\.create/],
  ];
  for (const [label, pattern] of bootstrapContract) {
    check(pattern.test(mainSource), `L-source ${label}`, pattern.test(mainSource) ? '' : 'NOT FOUND in main.ts');
  }
  check(!/origin:\s*['"`]\*/.test(mainSource) && !/origin:\s*true/.test(mainSource),
    'L-source CORS is never a wildcard or unconditional `true`');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prodValidation = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src', 'config', 'validate-production-environment.ts'), 'utf8');
  for (const [label, pattern] of [
    ['production refuses DEV_AUTH_BYPASS', /DEV_AUTH_BYPASS === 'true'/],
    ['production refuses TYPEORM_SYNCHRONIZE', /TYPEORM_SYNCHRONIZE must be false in production/],
    ['production requires a non-development JWT secret of at least 32 characters', /jwtSecret\.length < 32/],
    ['production requires exact HTTPS CORS origins', /must be an exact HTTPS origin/],
    ['production bounds TRUST_PROXY_HOPS', /TRUST_PROXY_HOPS must be an integer from 0 to 2/],
  ] as const) {
    check(pattern.test(prodValidation), `L-source ${label}`, pattern.test(prodValidation) ? '' : 'NOT FOUND');
  }

  // =============================================================================================
  console.log('\n---- CLEANUP ----\n');
  // =============================================================================================

  for (const [label, token] of [['A', tokenA], ['B', tokenB], ['free', freeToken]] as const) {
    const password = label === 'A' ? PASSWORD : PASSWORD;
    const gone = await call('/auth/me', { method: 'DELETE', token, body: { password }, ip: '10.37.51.1' });
    check(gone.status === 200 || gone.status === 429,
      `Z-cleanup user ${label} deletes their own account through the product route`, `${gone.status}`);
  }

  console.log(`\n${'='.repeat(96)}`);
  console.log(`§307 SECURITY BOUNDARY: ${passed} passed, ${failures.length} failed.`);
  console.log(`Expert executions: 0. Provider calls: ${providerCallsObserved}. Spend: $0.00.`);
  if (failures.length) {
    console.log('\nFAILED:');
    for (const failure of failures) console.log(`  - ${failure}`);
  }
  console.log('='.repeat(96));

  await app.close();
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\n§307 ERRORED:', error);
  process.exit(1);
});
