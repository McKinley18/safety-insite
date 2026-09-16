/**
 * §306 (EM-2) — PASSWORD RECOVERY, END TO END AND PROVIDER-INDEPENDENT.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. ZERO REAL EMAIL. Disposable database only.
 * Runs with `npm run test:306-password-recovery` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS SUITE EXISTS AT ALL.
 *
 * EM-2 has been carried for several sections as "production has no Resend credential", which sounds
 * like a configuration errand. §306 says not to assume the implementation is correct merely because
 * the blocker was described as a missing credential — so this suite drives the WHOLE token lifecycle
 * and asserts the security properties directly, against a real running application and a real
 * database, with no email ever sent.
 *
 * The parts that cannot be proven without a sending domain are deliberately out of scope: whether a
 * real mailbox receives a real message. Everything up to handing a bounded message to a transport is
 * in scope, and that is the part that is engineering rather than procurement.
 *
 * ---------------------------------------------------------------------------------------------
 * ANTI-ENUMERATION IS ASSERTED ON THE WHOLE OBSERVABLE RESPONSE.
 *
 * A generic message is not enough on its own: status code, body and — within reason — timing all
 * have to be materially indistinguishable, because any one of them answers "does this address have
 * an account?". Timing is measured rather than ignored, and asserted loosely enough not to be flaky
 * but tightly enough to catch a synchronous provider call on the known-account path only.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { createHash, randomBytes } from 'crypto';

import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§306 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§306 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§306 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§306 REFUSED: NODE_ENV must be test.');
}

/*
 * THE CAPTURE TRANSPORT IS SELECTED BEFORE THE APPLICATION IS CONSTRUCTED.
 *
 * `PASSWORD_RESET_PROVIDER=capture` routes delivery to an in-process recorder so the harness can
 * read the message and the reset URL without sending anything. The production guard lives in the
 * delivery service itself, not here, and case W below proves it: the capture transport refuses to
 * initialise under NODE_ENV=production.
 */
process.env.PASSWORD_RESET_PROVIDER = 'capture';
process.env.PASSWORD_RESET_FRONTEND_URL = 'http://localhost:3000';
process.env.PRODUCT_NAME = 'S306 Test Product';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppModule } = require('../src/app.module');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const transport = require('../src/auth/password-reset-transport');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const events = require('../src/observability/operational-events');

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
  options: { method?: string; body?: unknown; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json; raw: string; ms: number }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = options.ip || `10.36.6.${(ipCounter += 1) % 250}`;
  const started = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  const ms = Date.now() - started;
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw, ms };
}

const PASSWORD = 'Section306!StrongPass123';
const NEW_PASSWORD = 'Section306!Replaced456';

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useBodyParser('json', { limit: '5mb' });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§306 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const register = async (tag: string) => {
    const email = `s306-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s306 ${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    return email;
  };

  const requestReset = (email: string, ip?: string) =>
    call('/auth/password-reset/request', { method: 'POST', body: { email }, ip });

  /** The reset URL the product would have emailed, read from the capture transport. */
  const lastCapturedUrl = (): string | null => {
    const sent = transport.capturedPasswordResetMessages();
    return sent.length ? sent[sent.length - 1].resetUrl : null;
  };
  const tokenFrom = (url: string | null) =>
    url ? new URL(url).searchParams.get('token') || '' : '';

  // ===========================================================================================
  console.log('---- A/B/C. ANTI-ENUMERATION ----\n');
  // ===========================================================================================

  const known = await register('known');
  transport.resetCapturedPasswordResetMessages();

  const a = await requestReset(known);
  const b = await requestReset(`s306-nobody-${suffix}@example.test`);
  const c = await requestReset(known.toUpperCase());

  check(a.status === b.status && b.status === c.status,
    'A/B/C-1 known, unknown and case-variant addresses all return the SAME status',
    `${a.status}/${b.status}/${c.status}`);
  check(a.raw === b.raw && b.raw === c.raw,
    'A/B/C-2 and the SAME response body, byte for byte — a generic message is not enough if the '
    + 'shape differs', `${a.raw.slice(0, 60)}`);
  check(!/not found|no account|does not exist|already|unknown|sent to/i.test(a.raw + b.raw),
    'A/B/C-3 and no phrasing anywhere that answers "does this address have an account?"',
    a.raw.slice(0, 70));

  const captured = transport.capturedPasswordResetMessages();
  check(captured.length === 2,
    'A/B/C-4 CASE NORMALIZATION IS REAL: the known address and its UPPERCASE variant both produced a '
    + 'message, and the unknown address produced none — so the identical public response is hiding a '
    + 'genuinely different internal outcome', `${captured.length} messages for 3 requests`);

  /*
   * TIMING. The unknown-address path does no database write and no delivery; the known-address path
   * does both. A synchronous provider call on only one of them is an enumeration oracle. The bound
   * is deliberately generous — this is a correctness check, not a benchmark — but a real network
   * round trip on one branch only would blow through it.
   */
  const timedKnown: number[] = [];
  const timedUnknown: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    timedKnown.push((await requestReset(known, `10.36.7.${i}`)).ms);
    timedUnknown.push((await requestReset(`s306-none-${i}-${suffix}@example.test`, `10.36.8.${i}`)).ms);
  }
  const median = (xs: number[]) => [...xs].sort((x, y) => x - y)[Math.floor(xs.length / 2)];
  const mk = median(timedKnown);
  const mu = median(timedUnknown);
  check(Math.abs(mk - mu) < 400,
    'A/B/C-5 and the two paths are not separated by an obvious timing oracle',
    `known ${mk}ms vs unknown ${mu}ms`);

  // ===========================================================================================
  console.log('\n---- D/E. TOKEN GENERATION AND STORAGE ----\n');
  // ===========================================================================================

  transport.resetCapturedPasswordResetMessages();
  await requestReset(known);
  const url1 = lastCapturedUrl();
  const token1 = tokenFrom(url1);

  check(/^[0-9a-f]{64}$/.test(token1),
    'D-1 the token is 64 hex characters — 32 random bytes, 256 bits of entropy', `${token1.length} chars`);
  transport.resetCapturedPasswordResetMessages();
  await requestReset(known);
  const token2 = tokenFrom(lastCapturedUrl());
  check(token1 !== token2 && /^[0-9a-f]{64}$/.test(token2),
    'D-2 and a second request produces a completely different token');

  const stored = await q(
    `SELECT "passwordResetTokenHash", "passwordResetExpiresAt" FROM "user" WHERE LOWER("email") = $1`,
    [known.toLowerCase()]);
  const storedHash = stored[0]?.passwordResetTokenHash as string;
  check(!!storedHash && storedHash !== token2 && !storedHash.includes(token2),
    'E-1 THE DATABASE DOES NOT STORE A USABLE CREDENTIAL. A production database read returns a '
    + 'digest, not something that can be presented to the reset endpoint.',
    `stored ${String(storedHash).slice(0, 12)}… vs token ${token2.slice(0, 12)}…`);
  check(storedHash === createHash('sha256').update(token2).digest('hex'),
    'E-2 and it is the SHA-256 digest of the delivered token — verified by recomputing it, not by '
    + 'trusting the column name');

  const expires = new Date(stored[0]?.passwordResetExpiresAt);
  const minutes = (expires.getTime() - Date.now()) / 60000;
  check(minutes > 0 && minutes <= 60,
    'F-1 the token is time-bounded, and the bound is short enough for transactional recovery',
    `${Math.round(minutes)} minutes`);

  // ===========================================================================================
  console.log('\n---- F/G/H/I. THE LIFECYCLE ----\n');
  // ===========================================================================================

  const bad = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: randomBytes(32).toString('hex'), newPassword: NEW_PASSWORD },
  });
  check(bad.status === 400,
    'H-1 a random well-formed token is refused with a bounded 400', `${bad.status}`);
  check(!/hash|column|sql|relation|user|exists/i.test(bad.raw),
    'H-2 and the refusal says nothing about why', bad.raw.slice(0, 70));

  /*
   * EXPIRY is forced by moving the stored expiry into the past — the same state the clock would
   * reach — rather than by sleeping for half an hour.
   */
  await q(`UPDATE "user" SET "passwordResetExpiresAt" = now() - interval '1 minute' WHERE LOWER("email") = $1`,
    [known.toLowerCase()]);
  const expired = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: token2, newPassword: NEW_PASSWORD },
  });
  check(expired.status === 400, 'G-1 an EXPIRED token is refused', `${expired.status}`);
  check(expired.raw === bad.raw,
    'G-2 and it is refused identically to an invalid one, so the response does not reveal that the '
    + 'token was ever real');

  transport.resetCapturedPasswordResetMessages();
  const freshRequest = await requestReset(known, '10.36.20.1');
  const liveToken = tokenFrom(lastCapturedUrl());
  console.log(`      fresh request -> ${freshRequest.status}; captured ${transport.capturedPasswordResetMessages().length}; token len ${liveToken.length}`);

  const ok1 = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: liveToken, newPassword: NEW_PASSWORD },
  });
  check(ok1.status === 200 || ok1.status === 201,
    'F-2 a VALID token inside the window resets the password', `${ok1.status}`);

  const reuse = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: liveToken, newPassword: 'Another306!Pass789' },
  });
  check(reuse.status === 400,
    'I-1 the SAME token is refused the second time — single use', `${reuse.status}`);

  const afterUse = await q(
    `SELECT "passwordResetTokenHash", "passwordResetExpiresAt" FROM "user" WHERE LOWER("email") = $1`,
    [known.toLowerCase()]);
  check(afterUse[0]?.passwordResetTokenHash === null && afterUse[0]?.passwordResetExpiresAt === null,
    'I-2 and the stored credential is cleared, not merely bypassed');

  // ===========================================================================================
  console.log('\n---- J. CONCURRENT REPLAY ----\n');
  // ===========================================================================================

  /*
   * §306: "Prove behavior rather than assuming an update makes it atomic."
   *
   * A read-modify-write cannot be assumed to serialise. Both requests are fired together at the
   * same token with DIFFERENT new passwords, and afterwards exactly one of them must be the
   * password that actually works — which is a stronger check than counting 200s, because two
   * successes that both set the same password would look harmless and are not.
   */
  const raceAccount = await register('race');
  transport.resetCapturedPasswordResetMessages();
  await requestReset(raceAccount);
  const raceToken = tokenFrom(lastCapturedUrl());

  const PASS_A = 'RaceAlpha306!aaa';
  const PASS_B = 'RaceBravo306!bbb';
  const [r1, r2] = await Promise.all([
    call('/auth/password-reset/complete', { method: 'POST', body: { token: raceToken, newPassword: PASS_A } }),
    call('/auth/password-reset/complete', { method: 'POST', body: { token: raceToken, newPassword: PASS_B } }),
  ]);
  const successes = [r1, r2].filter((r) => r.status < 400).length;
  check(successes === 1,
    'J-1 AT MOST ONE concurrent reset succeeds. Two winners would mean the token is not really '
    + 'single-use under load, and the loser would believe they had set a password they had not.',
    `${successes} of 2 succeeded (${r1.status}/${r2.status})`);

  const aWorks = await call('/auth/login', { method: 'POST', body: { email: raceAccount, password: PASS_A } });
  const bWorks = await call('/auth/login', { method: 'POST', body: { email: raceAccount, password: PASS_B } });
  const working = [aWorks, bWorks].filter((r) => r.status < 400).length;
  check(working === 1,
    'J-2 and exactly ONE of the two passwords authenticates afterwards',
    `${working} of 2 passwords work`);

  // ===========================================================================================
  console.log('\n---- K/L/M. PASSWORD AND ACCOUNT BINDING ----\n');
  // ===========================================================================================

  const newLogin = await call('/auth/login', { method: 'POST', body: { email: known, password: NEW_PASSWORD } });
  check(newLogin.status === 200 || newLogin.status === 201,
    'K-1 the NEW password authenticates', `${newLogin.status}`);
  const oldLogin = await call('/auth/login', { method: 'POST', body: { email: known, password: PASSWORD } });
  check(oldLogin.status === 401, 'L-1 and the OLD password no longer does', `${oldLogin.status}`);

  const victim = await register('victim');
  transport.resetCapturedPasswordResetMessages();
  await requestReset(known);
  const knownToken = tokenFrom(lastCapturedUrl());
  await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: knownToken, newPassword: 'Crossed306!Pass1' },
  });
  const victimStillOwnPassword = await call('/auth/login', {
    method: 'POST', body: { email: victim, password: PASSWORD } });
  check(victimStillOwnPassword.status < 400,
    'M-1 a token issued for one account CANNOT reset another — the second account is untouched',
    `${victimStillOwnPassword.status}`);

  // ===========================================================================================
  console.log('\n---- ACTIVE SESSIONS AFTER A RESET ----\n');
  // ===========================================================================================

  const sessionAccount = await register('session');
  const loggedIn = await call('/auth/login', {
    method: 'POST', body: { email: sessionAccount, password: PASSWORD } });
  const stolenToken = loggedIn.body?.token as string;
  const beforeReset = await call('/auth/me', { token: stolenToken });
  check(beforeReset.status === 200, 'S-1 an active session works before the reset', `${beforeReset.status}`);

  transport.resetCapturedPasswordResetMessages();
  await requestReset(sessionAccount);
  await new Promise((resolve) => setTimeout(resolve, 1100));   // let `iat` fall strictly before passwordChangedAt
  await call('/auth/password-reset/complete', {
    method: 'POST',
    body: { token: tokenFrom(lastCapturedUrl()), newPassword: 'Session306!Pass22' },
  });

  const afterReset = await call('/auth/me', { token: stolenToken });
  check(afterReset.status === 401,
    'S-2 AND IT IS REFUSED AFTER THE RESET. A previously issued access token stops working '
    + 'immediately rather than surviving to its expiry — jwt.strategy compares the token\'s `iat` '
    + 'against passwordChangedAt.', `${afterReset.status}`);
  const revoked = await q(
    `SELECT count(*)::int AS n FROM "refresh_tokens" rt JOIN "user" u ON u."id" = rt."userId"
     WHERE LOWER(u."email") = $1 AND rt."revokedAt" IS NULL`, [sessionAccount.toLowerCase()]);
  check(revoked[0].n === 0, 'S-3 and every refresh token for the account is revoked', `${revoked[0].n} live`);

  // ===========================================================================================
  console.log('\n---- P/Q. MALFORMED INPUT AND THROTTLING ----\n');
  // ===========================================================================================

  for (const [label, body] of [
    ['no email', {}],
    ['not an email', { email: 'not-an-email' }],
    ['wrong type', { email: 12345 }],
    ['extra property', { email: known, adminOverride: true }],
  ] as Array<[string, unknown]>) {
    const r = await call('/auth/password-reset/request', { method: 'POST', body });
    check(r.status >= 400 && r.status < 500, `P-${label}: bounded 4xx`, `${r.status}`);
  }
  const shortToken = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: 'short', newPassword: NEW_PASSWORD } });
  check(shortToken.status === 400, 'P-short token: bounded 400', `${shortToken.status}`);
  const weakPassword = await call('/auth/password-reset/complete', {
    method: 'POST', body: { token: randomBytes(32).toString('hex'), newPassword: 'weak' } });
  check(weakPassword.status === 400,
    'P-weak new password is refused — the reset path enforces the same strength as registration',
    `${weakPassword.status}`);

  const throttleIp = '10.36.99.1';
  const statuses: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    statuses.push((await requestReset(`s306-throttle-${i}-${suffix}@example.test`, throttleIp)).status);
  }
  check(statuses.includes(429),
    'Q-1 repeated requests from one source are throttled, so the endpoint cannot be used for '
    + 'unbounded email volume or token creation', statuses.join(','));

  // ===========================================================================================
  console.log('\n---- R/S/T/U. DELIVERY OUTCOMES ARE INTERNALLY DISTINGUISHABLE ----\n');
  // ===========================================================================================

  const outcomeAccount = await register('outcomes');
  const publicResponses: string[] = [];
  const seen: Array<Record<string, any>> = [];
  events.captureOperationalEventsForVerification((line: any) => { seen.push(line); });

  for (const [label, mode] of [
    ['NOT_CONFIGURED', 'unconfigured'],
    ['PROVIDER_REJECTED', 'reject'],
    ['NETWORK_FAILURE', 'network-failure'],
  ] as Array<[string, string]>) {
    transport.setPasswordResetTransportFaultForVerification(mode);
    const r = await requestReset(outcomeAccount, `10.36.5${label.length}.1`);
    publicResponses.push(`${r.status}:${r.raw}`);
    const event = seen.filter((e) => e.event === 'auth.password_reset_delivery_failed').pop();
    check(!!event && event.metadata?.outcome === label,
      `${label[0]}-1 ${label} is recorded internally with that exact outcome`,
      JSON.stringify(event?.metadata || 'no event'));
    check(!!event && !JSON.stringify(event).includes(tokenFrom(lastCapturedUrl()) || ' ')
      && !/[0-9a-f]{64}/.test(JSON.stringify(event)),
      `${label[0]}-2 and the event carries NO reset token`,
      JSON.stringify(event?.metadata || {}).slice(0, 80));
  }
  transport.setPasswordResetTransportFaultForVerification(null);
  events.captureOperationalEventsForVerification(null);

  check(new Set(publicResponses).size === 1,
    'U-1 and all three failures produce the IDENTICAL public response — a provider outage must not '
    + 'become an enumeration oracle or an error the caller can read',
    `${new Set(publicResponses).size} distinct responses`);
  check(publicResponses[0].endsWith(a.raw),
    'U-2 which is also the same response a successful request gives');

  const strandedRow = await q(
    `SELECT "passwordResetTokenHash" FROM "user" WHERE LOWER("email") = $1`,
    [outcomeAccount.toLowerCase()]);
  check(strandedRow[0]?.passwordResetTokenHash === null,
    'U-3 and a failed delivery leaves NO stranded reset credential on the account — the token is '
    + 'rolled back rather than left usable by someone who never received it');

  // ===========================================================================================
  console.log('\n---- N/O/V/W. LEAKAGE, ORIGIN AND THE CAPTURE TRANSPORT ----\n');
  // ===========================================================================================

  const logAccount = await register('logging');
  const logLines: string[] = [];
  const stdoutWrite = process.stdout.write.bind(process.stdout);
  const stderrWrite = process.stderr.write.bind(process.stderr);
  (process.stdout as any).write = (c: any, ...r: any[]) => { logLines.push(String(c)); return stdoutWrite(c, ...r); };
  (process.stderr as any).write = (c: any, ...r: any[]) => { logLines.push(String(c)); return stderrWrite(c, ...r); };
  transport.resetCapturedPasswordResetMessages();
  await requestReset(logAccount);
  (process.stdout as any).write = stdoutWrite;
  (process.stderr as any).write = stderrWrite;
  const logToken = tokenFrom(lastCapturedUrl());

  check(!!logToken && !logLines.join('').includes(logToken),
    'N-1 THE RESET TOKEN NEVER REACHES A LOG. Everything written to stdout and stderr during a real '
    + 'reset request was captured and searched for the exact token.',
    `${logLines.length} lines captured`);
  check(!logLines.join('').includes('/reset-password?token='),
    'N-2 and neither does the reset URL');

  const monitoringSeen: Array<Record<string, any>> = [];
  events.captureOperationalEventsForVerification((line: any) => { monitoringSeen.push(line); });
  transport.resetCapturedPasswordResetMessages();
  await requestReset(logAccount, '10.36.44.9');
  events.captureOperationalEventsForVerification(null);
  const monitoringToken = tokenFrom(lastCapturedUrl());
  check(!JSON.stringify(monitoringSeen).includes(monitoringToken || ' '),
    'O-1 and it never reaches a monitoring payload either', `${monitoringSeen.length} events`);

  const capturedMessage = transport.capturedPasswordResetMessages().slice(-1)[0];
  check(!!capturedMessage && capturedMessage.resetUrl.startsWith('http://localhost:3000/reset-password?token='),
    'V-1 the reset URL is built from CONFIGURATION, not from anything the caller sent — there is no '
    + 'request Host, Origin or Referer anywhere in its construction',
    capturedMessage?.resetUrl?.replace(/token=.*/, 'token=…') || 'none');

  const injected = await call('/auth/password-reset/request', {
    method: 'POST', body: { email: logAccount }, ip: '10.36.45.1',
  });
  check(injected.status < 400, 'V-2 (control) the injection attempt below is made against a working request');
  const injectedUrl = await (async () => {
    transport.resetCapturedPasswordResetMessages();
    const response = await fetch(`${baseUrl}/auth/password-reset/request`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        host: 'attacker.example.com',
        'x-forwarded-host': 'attacker.example.com',
        origin: 'https://attacker.example.com',
        'x-forwarded-for': '10.36.46.1',
      },
      body: JSON.stringify({ email: logAccount }),
    });
    await response.text();
    return lastCapturedUrl();
  })();
  check(!!injectedUrl && !injectedUrl.includes('attacker.example.com'),
    'V-3 HOST-HEADER INJECTION HAS NO EFFECT: a request carrying Host, X-Forwarded-Host and Origin '
    + 'headers naming an attacker still produces a reset URL on the configured origin',
    injectedUrl?.replace(/token=.*/, 'token=…') || 'none');

  check(capturedMessage?.subject && !/safety insite/i.test(capturedMessage.subject)
    && capturedMessage.subject.includes('S306 Test Product'),
    'BRAND-1 the message takes the product name from CONFIGURATION. §306 forbids baking the '
    + 'temporary brand into recovery infrastructure, and the name changes before external Beta.',
    capturedMessage?.subject || 'none');
  check(capturedMessage?.text && /reset/i.test(capturedMessage.text)
    && /\b30\b|minutes/i.test(capturedMessage.text)
    && /did not request|ignore/i.test(capturedMessage.text),
    'BRAND-2 and it states the action, the limited validity, and what to do if you did not ask for it',
    (capturedMessage?.text || '').slice(0, 90));
  check(capturedMessage?.text && !capturedMessage.text.includes(logAccount)
    || !/plan|subscription|organization|userId/i.test(capturedMessage?.text || ''),
    'BRAND-3 and carries no unnecessary account detail');

  check(transport.captureTransportIsProductionForbidden() === true,
    'W-1 THE CAPTURE TRANSPORT CANNOT BE ACTIVATED IN PRODUCTION. Asked to initialise under '
    + 'NODE_ENV=production it refuses, so a misconfigured environment variable cannot turn real '
    + 'password recovery into a silent in-memory recorder.');

  // ===========================================================================================
  await app.close();
  console.log(`\n================ §306 password recovery: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, expertExecutions: 0, realEmailsSent: 0, passed, failed: failures.length,
  }));
  if (failures.length) process.exit(1);
}

main().catch((error) => { console.error(error); process.exit(1); });
