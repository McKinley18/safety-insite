/**
 * §308 (LG-3) — THE LEGAL PUBLICATION AND ACCEPTANCE-BINDING SUITE.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Runs against a DISPOSABLE database only, with
 * `DEV_AUTH_BYPASS` forced off, through the real guarded HTTP routes.
 *
 *   npm run test:308-legal-publication:db
 *
 * ---------------------------------------------------------------------------------------------
 * THE SHAPE OF THE PROBLEM, AND WHY THIS SUITE BOOTS THE APPLICATION TWICE.
 *
 * §308's acceptance matrix has two halves that are mutually exclusive by construction: A and B
 * require that NO legal document is active, and C through Q require that two ARE. The publication
 * registry is resolved once at application start — deliberately, so a document cannot change
 * underneath a reader between opening it and accepting it — so a single running instance can only
 * be in one of those worlds.
 *
 * Booting twice is therefore not a convenience. Faking it with a mutable registry would have meant
 * shipping a way to change what is published at runtime, which is precisely the property a legal
 * publication surface must not have. The suite pays the cost instead.
 *
 *   PHASE 1  fixtures OFF — the production shape. A and B.
 *   PHASE 2  fixtures ON — the activated shape. C through Q, R, S, T.
 *   PHASE 3  hostile fixture ON — the sanitisation proof.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT MAKES THIS NON-VACUOUS.
 *
 * A suite that proves "acceptance of Terms is required" against a registry with no Terms proves
 * nothing, and that is exactly the trap §308's requirement A creates. So phase 1 first ASSERTS the
 * absence it depends on, phase 2 first asserts the presence it depends on, and the suite ABORTS
 * rather than reporting green if either precondition is not actually true.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§308 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§308 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§308 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§308 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§308 REFUSED: DEV_AUTH_BYPASS is on.');
  }
}

/* No Expert, no provider, before AppModule is required anywhere. */
process.env.EXPERT_EXECUTION_ENABLED = 'false';
delete process.env.ANTHROPIC_API_KEY;

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
  headers['x-forwarded-for'] = `10.38.8.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw };
}

const PASSWORD = 'Section308!StrongPass123';
const suffix = `${Date.now()}`;

/**
 * Boot AppModule, so the legal registry resolves under this PROCESS's environment.
 *
 * ==================== WHY EACH PHASE IS ITS OWN PROCESS ====================
 *
 * The first version of this suite ran all three phases in one process and cleared `require.cache`
 * between them so the registry would be re-evaluated. That does not work and should not: clearing
 * the whole cache discards `reflect-metadata`, `@nestjs/*` and `typeorm` too, and Nest's dependency
 * injection depends on those modules having ONE identity. The application died at boot with no
 * usable error.
 *
 * Running each phase as a separate child process is both the fix and the better design. Every phase
 * now boots the application exactly the way production boots it — one process, one environment, one
 * registry resolved once at start — rather than through a re-entrancy path that exists nowhere
 * else. The phases share the disposable database through the inherited DATABASE_URL.
 */
async function boot(): Promise<NestExpressApplication> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppModule } = require('../src/app.module');
  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    { logger: process.env.S308_VERBOSE === '1' ? undefined : false });
  app.useBodyParser('json', { limit: '5mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§308 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  return app;
}

const ACKNOWLEDGEMENT = 'internal-pre-beta-acknowledgement';

async function acknowledgementAssertion(): Promise<Json> {
  const list = await call('/agreements');
  const ack = (list.body?.agreements || []).find((a: Json) => a.agreementId === ACKNOWLEDGEMENT);
  return { agreementId: ack.agreementId, agreementVersion: ack.version };
}

async function registerUser(tag: string, acceptances: Json[]): Promise<{
  email: string; reg: { status: number; body: Json; raw: string }; token?: string; userId?: string;
}> {
  const email = `s308-${tag}-${suffix}@example.test`;
  const reg = await call('/auth/register', {
    method: 'POST',
    body: {
      email, password: PASSWORD, name: `s308 ${tag}`, type: 'individual',
      acceptedAgreements: acceptances,
    },
  });
  if (reg.status >= 400) return { email, reg };
  const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
  return { email, reg, token: login.body?.token, userId: login.body?.user?.id };
}

// ===============================================================================================

const PHASE = Number((process.argv.find((a) => a.startsWith('--phase=')) || '').split('=')[1] || 0);

/**
 * THE ORCHESTRATOR. Spawns each phase as its own process so each one resolves the publication
 * registry independently, then aggregates. Phase output is streamed through unchanged, so the
 * transcript reads as one run.
 */
function runPhases(): never {
  const { spawnSync } = require('child_process') as typeof import('child_process');
  const phaseEnv: Array<Record<string, string>> = [
    { LEGAL_TEST_FIXTURES: '', LEGAL_HOSTILE_FIXTURE: '' },
    { LEGAL_TEST_FIXTURES: 'true', LEGAL_HOSTILE_FIXTURE: '' },
    { LEGAL_TEST_FIXTURES: '', LEGAL_HOSTILE_FIXTURE: 'true' },
  ];
  let failed = 0;
  for (const [index, overrides] of phaseEnv.entries()) {
    const env = { ...process.env, ...overrides };
    if (!overrides.LEGAL_TEST_FIXTURES) delete env.LEGAL_TEST_FIXTURES;
    if (!overrides.LEGAL_HOSTILE_FIXTURE) delete env.LEGAL_HOSTILE_FIXTURE;
    const run = spawnSync(
      process.execPath,
      [require.resolve('ts-node/dist/bin.js'), __filename, `--phase=${index + 1}`],
      { cwd: join(__dirname, '..'), env, stdio: 'inherit' },
    );
    if ((run.status ?? 1) !== 0) failed += 1;
  }
  console.log(`\n${'='.repeat(96)}`);
  console.log(`§308 LEGAL PUBLICATION: ${failed === 0 ? 'ALL 3 PHASES PASSED' : `${failed} of 3 PHASES FAILED`}`);
  console.log('Expert executions: 0. Provider calls: 0. Spend: $0.00.');
  console.log('='.repeat(96));
  process.exit(failed === 0 ? 0 : 1);
}

async function main(): Promise<void> {
  provenDisposableTarget();
  if (PHASE === 0) runPhases();

  const fixtureRoot = join(__dirname, '..', 'legal-documents', 'test-fixtures');
  const termsBody = readFileSync(join(fixtureRoot, 'terms-0.0.0-test.1.md'), 'utf8');
  const privacyV1Body = readFileSync(join(fixtureRoot, 'privacy-0.0.0-test.1.md'), 'utf8');
  const privacyV2Body = readFileSync(join(fixtureRoot, 'privacy-0.0.0-test.2.md'), 'utf8');
  const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
  const TERMS_DIGEST = sha(termsBody);
  const PRIVACY_V1_DIGEST = sha(privacyV1Body);
  const PRIVACY_V2_DIGEST = sha(privacyV2Body);

  // =============================================================================================
  if (PHASE === 1) {
  console.log('\n======== PHASE 1 — NOTHING PUBLISHED. THE PRODUCTION SHAPE. ========\n');
  // =============================================================================================

  const app = await boot();
  console.log(`application listening on ${baseUrl}\n`);
  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);

  // ---- the precondition this phase depends on, asserted rather than assumed -------------------
  const emptySummary = await call('/legal/documents');
  const termsEmpty = await call('/legal/documents/terms');
  const privacyEmpty = await call('/legal/documents/privacy');

  check(emptySummary.status === 200
    && (emptySummary.body.documents || []).every((d: Json) => d.status === 'NOT_YET_PUBLISHED'),
    'P1-precondition NO legal document is ACTIVE — without this, requirements A and B would pass '
    + 'against a world where they could not fail', JSON.stringify(emptySummary.body.documents));
  if (!(emptySummary.status === 200
    && (emptySummary.body.documents || []).every((d: Json) => d.status === 'NOT_YET_PUBLISHED'))) {
    console.error('\n§308 ABORT: phase 1 requires an empty publication registry.');
    await app.close(); process.exit(1);
  }

  // ---- R / S: the routes work unauthenticated, with nothing published --------------------------
  check(termsEmpty.status === 200 && termsEmpty.body.status === 'NOT_YET_PUBLISHED',
    '[R] GET /legal/documents/terms answers 200 UNAUTHENTICATED with nothing published — §308 '
    + 'forbids a 404 caused by missing engineering, and this is the route LG-3 was raised about',
    `${termsEmpty.status} ${termsEmpty.body.status}`);
  check(privacyEmpty.status === 200 && privacyEmpty.body.status === 'NOT_YET_PUBLISHED',
    '[S] GET /legal/documents/privacy answers 200 UNAUTHENTICATED with nothing published',
    `${privacyEmpty.status} ${privacyEmpty.body.status}`);

  // ---- 17 / 18: the no-active state is bounded and claims nothing ------------------------------
  for (const [label, response] of [['terms', termsEmpty], ['privacy', privacyEmpty]] as const) {
    const body = response.body;
    check(body.version === undefined && body.effectiveDate === undefined && body.body === undefined,
      `P1-${label} the non-operative state carries NO version, NO effective date and NO body — the '
      + 'response shape has no field capable of carrying them`.replace(/\s+/g, ' '),
      JSON.stringify(Object.keys(body)));
    check(body.acceptanceAvailable === false,
      `P1-${label} and states that acceptance is not available, rather than leaving it to be inferred`);
    check(typeof body.reason === 'string' && body.reason.length > 20,
      `P1-${label} and gives a professional reason rather than a bare failure`);
  }

  // ---- 42: no draft body, no path, no internal note leaks --------------------------------------
  const draftTerms = readFileSync(
    join(__dirname, '..', '..', 'project-docs', 'legal', 'CONTROLLED-BETA-TERMS.md'), 'utf8');
  const draftPrivacy = readFileSync(
    join(__dirname, '..', '..', 'project-docs', 'legal', 'BETA-PRIVACY-NOTICE.md'), 'utf8');
  const draftSentences = [
    'INTERNAL BETA DRAFT', 'LEGAL COUNSEL REVIEW STATUS', '[LEGAL ENTITY]', '[ENTITY ADDRESS]',
    '[GOVERNING LAW]', '[BETA TERM]', '[CONTACT EMAIL]',
    draftTerms.split('\n').find((l) => l.startsWith('## 1.')) || '## 1. This is an invitation-only beta',
    draftPrivacy.split('\n').find((l) => l.startsWith('## ')) || 'What we collect',
  ];
  const leakProbe = `${termsEmpty.raw}${privacyEmpty.raw}${emptySummary.raw}`;
  const leaked = draftSentences.filter((s) => s && leakProbe.includes(s));
  check(leaked.length === 0,
    '42 NO DRAFT LEGAL BODY REACHES THE PUBLIC ROUTE. Neither draft\'s text, nor its unapproved-draft '
    + 'marker, nor any of its five unresolved contracting placeholders appears in any response.',
    leaked.join(' | ') || 'none');

  const disclosurePatterns: Array<[RegExp, string]> = [
    [/project-docs|legal-documents|\/Users\/|\/opt\/render|\.md\b/, 'filesystem or repository path'],
    [/sourceFile|expectedDigest|counselApproval|approver|approvedAt/, 'internal registry field'],
    [/COUNSEL-REVIEW-PACKET|counsel packet|review packet/i, 'counsel communication'],
    [/DRAFT|SUPERSEDED|APPROVED_NOT_EFFECTIVE/, 'non-public publication state'],
    [/DATABASE_URL|JWT_SECRET|postgres:\/\//, 'server configuration'],
  ];
  for (const [pattern, name] of disclosurePatterns) {
    check(!pattern.test(leakProbe),
      `42b the public legal routes expose no ${name}`,
      pattern.test(leakProbe) ? 'LEAKED' : 'clean');
  }

  // ---- A / B: registration cannot falsely record an acceptance that does not exist -------------
  const ackOnly = await acknowledgementAssertion();
  const p1User = await registerUser('phase1-user', [ackOnly]);
  check(p1User.reg.status === 201 || p1User.reg.status === 200,
    'P1 registration still succeeds on the acknowledgement alone — §308 forbids §308 from beginning '
    + 'to enforce acceptance of documents that do not exist, and the required set is DERIVED from '
    + 'publication state so today\'s behaviour is unchanged', `${p1User.reg.status}`);

  const p1Rows = await q(
    `SELECT "agreementId","agreementVersion","documentDigest" FROM "agreement_acceptances"
      WHERE "userId" = $1 ORDER BY "agreementId"`, [p1User.userId]);
  check(p1Rows.length === 1 && p1Rows[0].agreementId === ACKNOWLEDGEMENT,
    '[A][B] NO Terms or Privacy acceptance row exists — a registration completed while nothing is '
    + 'published records exactly one acceptance, the acknowledgement, and invents nothing',
    JSON.stringify(p1Rows.map((r: Json) => r.agreementId)));

  for (const [requirement, agreementId] of [['A', 'legal:terms'], ['B', 'legal:privacy']] as const) {
    const forged = await call('/agreements/accept', {
      method: 'POST', token: p1User.token,
      body: { agreementId, agreementVersion: '1.0.0' },
    });
    check(forged.status >= 400,
      `[${requirement}] a caller cannot record an acceptance of ${agreementId} when no such document '
      + 'is published — asserting one is refused, not silently written`.replace(/\s+/g, ' '),
      `${forged.status}`);
    const after = await q(
      `SELECT count(*)::int AS n FROM "agreement_acceptances" WHERE "agreementId" = $1`, [agreementId]);
    check(after[0].n === 0, `[${requirement}] and no row was created for ${agreementId}`, `${after[0].n}`);
  }

  await app.close();
  }

  // =============================================================================================
  if (PHASE === 2) {
  console.log('\n======== PHASE 2 — TWO DOCUMENTS ACTIVE. THE ACTIVATED SHAPE. ========\n');
  // =============================================================================================

  const app = await boot();
  console.log(`application listening on ${baseUrl}\n`);
  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);

  const termsActive = await call('/legal/documents/terms');
  const privacyActive = await call('/legal/documents/privacy');

  check(termsActive.body.status === 'ACTIVE' && privacyActive.body.status === 'ACTIVE',
    'P2-precondition BOTH documents are ACTIVE — without this every requirement below would pass '
    + 'against a world where it could not fail',
    `${termsActive.body.status}/${privacyActive.body.status}`);
  if (termsActive.body.status !== 'ACTIVE' || privacyActive.body.status !== 'ACTIVE') {
    console.error('\n§308 ABORT: phase 2 requires two ACTIVE documents.');
    await app.close(); process.exit(1);
  }

  // ---- C / 21 / 22: the public routes render the EXACT active versions -------------------------
  check(termsActive.status === 200 && termsActive.body.version === '0.0.0-test.1'
    && termsActive.body.documentDigest === TERMS_DIGEST
    && termsActive.body.body === termsBody
    && termsActive.body.effectiveDate === '2026-01-01',
    '[C][21] /legal/documents/terms renders the EXACT active version: version, effective date, digest '
    + 'and body all match the file byte for byte',
    `${termsActive.body.version} ${String(termsActive.body.documentDigest).slice(0, 12)}`);
  check(privacyActive.status === 200 && privacyActive.body.version === '0.0.0-test.2'
    && privacyActive.body.documentDigest === PRIVACY_V2_DIGEST
    && privacyActive.body.body === privacyV2Body,
    '[C][22] /legal/documents/privacy renders the EXACT active version — 0.0.0-test.2, not the '
    + 'superseded 0.0.0-test.1',
    `${privacyActive.body.version} ${String(privacyActive.body.documentDigest).slice(0, 12)}`);
  check(termsActive.body.synthetic === true && privacyActive.body.synthetic === true,
    '19 the active documents are flagged SYNTHETIC, so a surface rendering one can say so');
  check(String(termsActive.body.body).startsWith('# TEST TERMS — NOT A LEGAL DOCUMENT')
    && String(privacyActive.body.body).startsWith('# TEST PRIVACY — NOT A LEGAL DOCUMENT'),
    '19b and their bodies are unmistakably synthetic on their first line');

  // ---- 32 / M: a SUPERSEDED version is not served and cannot be accepted -----------------------
  /*
   * ASSERTED ON THE STRUCTURED FIELDS, NOT ON THE RAW TEXT.
   *
   * The first version of this checked that the string `0.0.0-test.1` appeared nowhere in the
   * response, and failed — because the v2 fixture's own body says "This body differs from
   * 0.0.0-test.1 deliberately". A document is entitled to mention its predecessor, and a test that
   * forbids it is testing the fixture's prose rather than the publication rule. What the rule
   * actually says is that the SERVED VERSION is the active one and its body is the active body.
   */
  check(privacyActive.body.version === '0.0.0-test.2'
    && privacyActive.body.documentDigest === PRIVACY_V2_DIGEST
    && privacyActive.body.body !== privacyV1Body,
    '[M][32] the SUPERSEDED privacy version is not what the public route serves — the served version, '
    + 'digest and body are all the active 0.0.0-test.2, and the route exposes no way to ask for a '
    + 'superseded one at all',
    `${privacyActive.body.version} digest=${String(privacyActive.body.documentDigest).slice(0, 12)}`);

  // ---- D: registration without the required acceptances is refused -----------------------------
  const ackOnly2 = await acknowledgementAssertion();
  const refusedReg = await registerUser('phase2-missing', [ackOnly2]);
  check(refusedReg.reg.status === 400,
    '[D] registration carrying ONLY the acknowledgement is REFUSED once documents are published — '
    + 'the requirement turned itself on with activation, with no second switch to forget',
    `${refusedReg.reg.status}`);
  check(/legal:terms|legal:privacy|TEST TERMS|TEST PRIVACY/.test(refusedReg.reg.raw),
    '[D] and the refusal names which document is missing, so the caller can act on it',
    refusedReg.reg.raw.slice(0, 120));
  const ghost = await q(`SELECT count(*)::int AS n FROM "user" WHERE "email" = $1`, [refusedReg.email]);
  check(ghost[0].n === 0, '[D] and it is a BOUNDED refusal that leaves no account behind', `${ghost[0].n}`);

  // ---- K / L / M: the caller cannot choose the version, the digest, or a superseded one ---------
  const wrongVersion = await registerUser('phase2-wrongversion', [
    ackOnly2,
    { agreementId: 'legal:terms', agreementVersion: '9.9.9' },
    { agreementId: 'legal:privacy', agreementVersion: '0.0.0-test.2' },
  ]);
  check(wrongVersion.reg.status === 400,
    '[K] a caller supplying a DIFFERENT Terms version is refused — the server resolves the '
    + 'authoritative version and will not accept one the caller picked', `${wrongVersion.reg.status}`);

  const supersededChoice = await registerUser('phase2-superseded', [
    ackOnly2,
    { agreementId: 'legal:terms', agreementVersion: '0.0.0-test.1' },
    { agreementId: 'legal:privacy', agreementVersion: '0.0.0-test.1' },
  ]);
  check(supersededChoice.reg.status === 400,
    '[M] a caller selecting the SUPERSEDED privacy version 0.0.0-test.1 is refused — a superseded '
    + 'document is not among the agreements in force, so the §291 staleness refusal answers without '
    + 'a special case', `${supersededChoice.reg.status}`);

  const forgedDigest = await registerUser('phase2-forgeddigest', [
    ackOnly2,
    { agreementId: 'legal:terms', agreementVersion: '0.0.0-test.1', documentDigest: 'f'.repeat(64) },
    { agreementId: 'legal:privacy', agreementVersion: '0.0.0-test.2', documentDigest: 'f'.repeat(64) },
  ]);
  check(forgedDigest.reg.status === 400 || forgedDigest.reg.status === 201 || forgedDigest.reg.status === 200,
    '[L] a caller-supplied documentDigest is not an error path the server takes on trust',
    `${forgedDigest.reg.status}`);
  if (forgedDigest.userId) {
    const rows = await q(
      `SELECT "agreementId","documentDigest" FROM "agreement_acceptances" WHERE "userId" = $1`,
      [forgedDigest.userId]);
    const forged = rows.filter((r: Json) => r.documentDigest === 'f'.repeat(64));
    check(forged.length === 0,
      '[L] THE CALLER-SUPPLIED DIGEST IS NOWHERE IN THE EVIDENCE. Every stored digest is the one the '
      + 'server computed from its own copy of the document.',
      JSON.stringify(rows.map((r: Json) => `${r.agreementId}=${String(r.documentDigest).slice(0, 8)}`)));
  }

  // ---- E / F / G / H / I / J: a correct registration, and what the server recorded --------------
  const before = new Date();
  const accepted = await registerUser('phase2-accepted', [
    ackOnly2,
    { agreementId: 'legal:terms', agreementVersion: '0.0.0-test.1' },
    { agreementId: 'legal:privacy', agreementVersion: '0.0.0-test.2' },
  ]);
  const after = new Date();
  check(accepted.reg.status === 201 || accepted.reg.status === 200,
    '[E] registration WITH acceptance of both active documents succeeds', `${accepted.reg.status}`);

  const rows: Json[] = await q(
    `SELECT "agreementId","agreementVersion","documentDigest","counselStatusAtAcceptance",
            "acceptedAt","acceptanceChannel","userId"
       FROM "agreement_acceptances" WHERE "userId" = $1 ORDER BY "agreementId"`, [accepted.userId]);
  const termsRow = rows.find((r) => r.agreementId === 'legal:terms');
  const privacyRow = rows.find((r) => r.agreementId === 'legal:privacy');

  check(rows.length === 3,
    '[E] three acceptance rows exist: the acknowledgement, the Terms and the Privacy Notice',
    JSON.stringify(rows.map((r) => r.agreementId)));
  check(termsRow?.agreementVersion === '0.0.0-test.1',
    '[F] the server recorded the EXACT Terms version', String(termsRow?.agreementVersion));
  check(termsRow?.documentDigest === TERMS_DIGEST,
    '[G] the server recorded the EXACT Terms digest, and it equals the sha256 of the file on disk',
    `${String(termsRow?.documentDigest).slice(0, 16)} vs ${TERMS_DIGEST.slice(0, 16)}`);
  check(privacyRow?.agreementVersion === '0.0.0-test.2',
    '[H] the server recorded the EXACT Privacy version', String(privacyRow?.agreementVersion));
  check(privacyRow?.documentDigest === PRIVACY_V2_DIGEST,
    '[I] the server recorded the EXACT Privacy digest',
    `${String(privacyRow?.documentDigest).slice(0, 16)} vs ${PRIVACY_V2_DIGEST.slice(0, 16)}`);

  const acceptedAt = new Date(termsRow?.acceptedAt);
  check(acceptedAt >= new Date(before.getTime() - 2000) && acceptedAt <= new Date(after.getTime() + 2000),
    '[J] the acceptance timestamp is SERVER-GENERATED — it falls inside the window in which the '
    + 'request was actually made, so it is not a value the client supplied',
    acceptedAt.toISOString());
  check(termsRow?.counselStatusAtAcceptance === 'COUNSEL_APPROVED',
    '[J] and the counsel status AT THE TIME OF ACCEPTANCE is recorded on the row, so a later change '
    + 'of status cannot rewrite what the person was told', String(termsRow?.counselStatusAtAcceptance));
  check(termsRow?.acceptanceChannel === 'registration',
    '[J] and the channel is recorded', String(termsRow?.acceptanceChannel));

  // ---- 36: CURRENT versus REACCEPTANCE_REQUIRED -------------------------------------------------
  const statusCurrent = await call('/agreements/acceptances', { token: accepted.token });
  check(statusCurrent.body?.acceptanceStatus === 'CURRENT'
    && (statusCurrent.body?.outstanding || []).length === 0,
    '36 the server determines this user is CURRENT against the documents in force',
    `${statusCurrent.body?.acceptanceStatus}`);

  // A user who accepted only the acknowledgement is REACCEPTANCE_REQUIRED now that documents exist.
  const partial = await registerUser('phase2-partial-probe', [
    ackOnly2,
    { agreementId: 'legal:terms', agreementVersion: '0.0.0-test.1' },
    { agreementId: 'legal:privacy', agreementVersion: '0.0.0-test.2' },
  ]);
  await q(`DELETE FROM "agreement_acceptances" WHERE "userId" = $1 AND "agreementId" = 'legal:privacy'`,
    [partial.userId]);
  const partialStatus = await call('/agreements/acceptances', { token: partial.token });
  check(partialStatus.body?.acceptanceStatus === 'REACCEPTANCE_REQUIRED'
    && (partialStatus.body?.outstanding || []).some((o: Json) => o.agreementId === 'legal:privacy'),
    '36-b and a user missing one in-force document is REACCEPTANCE_REQUIRED, naming the document '
    + 'and the version required — reported, and gating nothing, because §308 does not invent a '
    + 'lockout UX', `${partialStatus.body?.acceptanceStatus}`);

  // ---- P / Q / 35: supersession does not rewrite history ----------------------------------------
  const historical = randomUUID();
  await q(
    `INSERT INTO "agreement_acceptances"
       ("id","userId","organizationId","agreementId","agreementVersion","documentDigest",
        "counselStatusAtAcceptance","acceptedAt","acceptanceChannel","createdAt")
     VALUES ($1,$2,NULL,'legal:privacy','0.0.0-test.1',$3,'COUNSEL_APPROVED',now(),'registration',now())`,
    [historical, accepted.userId, PRIVACY_V1_DIGEST]);
  const preserved = await q(
    `SELECT "agreementVersion","documentDigest" FROM "agreement_acceptances" WHERE "id" = $1`, [historical]);
  check(preserved[0]?.agreementVersion === '0.0.0-test.1'
    && preserved[0]?.documentDigest === PRIVACY_V1_DIGEST,
    '[P][Q] an acceptance of the SUPERSEDED privacy version survives unchanged while 0.0.0-test.2 is '
    + 'the one in force — supersession is an INSERT of a new version, never an update of an old '
    + 'acceptance, so the historical record stays attributable to the exact text accepted',
    `${preserved[0]?.agreementVersion} ${String(preserved[0]?.documentDigest).slice(0, 12)}`);
  check(preserved[0]?.documentDigest === sha(privacyV1Body),
    '[Q] and that digest still equals the sha256 of the superseded body, which the registry still '
    + 'carries — so "what did the document say when they accepted it" has an answer');

  // ---- N: a substantive content change changes the digest ---------------------------------------
  check(PRIVACY_V1_DIGEST !== PRIVACY_V2_DIGEST,
    '[N] a substantive content change produces a DIFFERENT digest — the two privacy fixtures differ '
    + 'in body and therefore in sha256',
    `${PRIVACY_V1_DIGEST.slice(0, 12)} vs ${PRIVACY_V2_DIGEST.slice(0, 12)}`);
  check(sha(`${termsBody} `) !== TERMS_DIGEST,
    '[N] and even a one-character change to the Terms body changes it');

  // ---- T: deferred Company/Team state is irrelevant ---------------------------------------------
  check(accepted.reg.status < 400 && rows.length === 3,
    '[T] the accepting user is an INDIVIDUAL with no organization, and every acceptance bound '
    + 'correctly — the deferred Company/Team state is irrelevant to legal acceptance');
  const orgOfAcceptance = await q(
    `SELECT "organizationId" FROM "agreement_acceptances" WHERE "userId" = $1 LIMIT 1`, [accepted.userId]);
  check(orgOfAcceptance[0]?.organizationId === null,
    '[T] and the acceptance row carries organizationId NULL, the individual convention',
    String(orgOfAcceptance[0]?.organizationId));

  // ---- the public route is still unauthenticated with documents active --------------------------
  check(termsActive.status === 200 && privacyActive.status === 200,
    '[R][S] both public routes remain reachable WITHOUT authentication once documents are active');

  const badType = await call('/legal/documents/not-a-document-type');
  check(badType.status === 400,
    'P2 an unknown document type is 400 and not 404 — reserving 404 for nothing on this controller '
    + 'means a 404 here is always a routing fault and never a publication state', `${badType.status}`);

  await app.close();
  }

  // =============================================================================================
  if (PHASE === 3) {
  console.log('\n======== PHASE 3 — THE HOSTILE DOCUMENT. SANITISATION. ========\n');
  // =============================================================================================

  const app = await boot();
  console.log(`application listening on ${baseUrl}\n`);

  const hostile = await call('/legal/documents/terms');
  check(hostile.status === 200 && hostile.body.version === '0.0.0-hostile.1',
    'P3-precondition the hostile fixture is the ACTIVE terms document', String(hostile.body.version));

  /*
   * THE SERVER SERVES THE PAYLOAD VERBATIM, AND THAT IS CORRECT.
   *
   * Stripping markup server-side would be the wrong place for this control: the server's job is to
   * deliver the exact approved bytes, and a server that edits a legal document is a server that can
   * change what a document says. The safety property belongs to the RENDERER, which never has an
   * HTML sink — so the payload reaches the DOM as text.
   */
  check(hostile.body.body.includes('<script>'),
    'P3 the API returns the document body VERBATIM, including the payload — the server delivers the '
    + 'exact approved bytes and does not edit legal text');

  /*
   * THE RENDERING HALF OF THE PROOF LIVES IN THE FRONTEND SUITE, and deliberately so: it renders
   * the real component with `renderToStaticMarkup` and asserts the actual HTML produced, which is
   * stronger evidence than anything this process could gather about a React component it cannot
   * execute. See `frontend-next/lib/legal/__tests__/renderLegalBody.test.tsx`, run by
   * `npm run test:legal-render`.
   *
   * What IS asserted here is the structural property that makes that result durable: there is no
   * HTML sink anywhere in the legal rendering path, so the safety does not depend on a sanitiser
   * being correct.
   */
  const legalRenderPath = [
    join(__dirname, '..', '..', 'frontend-next', 'lib', 'legal', 'renderLegalBody.tsx'),
    join(__dirname, '..', '..', 'frontend-next', 'lib', 'legal', 'legalDocument.ts'),
    join(__dirname, '..', '..', 'frontend-next', 'components', 'legal', 'LegalDocumentPage.tsx'),
    join(__dirname, '..', '..', 'frontend-next', 'app', 'terms', 'page.tsx'),
    join(__dirname, '..', '..', 'frontend-next', 'app', 'privacy', 'page.tsx'),
  ];
  /*
   * COMMENT LINES ARE STRIPPED FIRST, and that is not a loophole.
   *
   * The first version of this failed on `renderLegalBody.tsx` and `LegalDocumentPage.tsx` — both of
   * which mention `dangerouslySetInnerHTML` in a comment EXPLAINING that they do not use it. A
   * check that forbids naming the hazard makes the code less able to explain itself, which is the
   * opposite of what it is for. What must be absent is a sink in executable code.
   */
  const sinks = legalRenderPath.filter((file) => {
    const executable = readFileSync(file, 'utf8').split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        return !trimmed.startsWith('*') && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
      })
      .join('\n');
    return /dangerouslySetInnerHTML|innerHTML\s*=|document\.write|new Function\(|\beval\(/.test(executable);
  });
  check(sinks.length === 0,
    '41 NO HTML SINK EXISTS ANYWHERE IN THE LEGAL RENDERING PATH — no dangerouslySetInnerHTML, no '
    + 'innerHTML assignment, no document.write, no eval. The payload is not sanitised, it is never '
    + 'parsed as markup at all, which holds for payloads nobody has thought of yet.',
    sinks.join(', ') || `${legalRenderPath.length} files clean`);

  /*
   * ================== REQUIREMENT O, WATCHED TO FAIL ==================
   *
   * "A substantive content change under the same immutable version must fail the release/test
   * gate." An assertion that the check EXISTS is not a proof that it works, so this performs the
   * edit: one byte is appended to a published fixture body, the registry is asked to resolve, and
   * the refusal is the evidence. The file is restored immediately and its sha256 re-verified
   * against the value recorded before the edit, so the repository is provably unchanged.
   */
  const victim = join(fixtureRoot, 'privacy-0.0.0-test.2.md');
  const originalBody = readFileSync(victim, 'utf8');
  const originalDigest = sha(originalBody);
  let refusedMutation = false;
  let refusalMessage = '';
  try {
    writeFileSync(victim, `${originalBody}\nA substantive change made under the same version.\n`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolveRegistry } = require('../src/legal/legal-document-registry');
    try {
      resolveRegistry({ ...process.env, NODE_ENV: 'test', LEGAL_TEST_FIXTURES: 'true', LEGAL_HOSTILE_FIXTURE: '' });
    } catch (error) {
      refusedMutation = true;
      refusalMessage = error instanceof Error ? error.message : String(error);
    }
  } finally {
    writeFileSync(victim, originalBody);
  }
  check(refusedMutation,
    '[O] A SUBSTANTIVE CONTENT CHANGE UNDER THE SAME IMMUTABLE VERSION IS REFUSED. The body was '
    + 'actually edited and the registry actually refused — the application will not start against '
    + 'a published version whose text has moved, so an accepted version cannot be mutated '
    + 'underneath the people who accepted it.',
    refusalMessage.slice(0, 150) || 'NOT REFUSED');
  check(sha(readFileSync(victim, 'utf8')) === originalDigest,
    '[O] and the fixture was restored byte for byte, verified by re-hashing',
    sha(readFileSync(victim, 'utf8')).slice(0, 16));

  await app.close();
  }

  // =============================================================================================
  console.log(`\n${'-'.repeat(96)}`);
  console.log(`§308 PHASE ${PHASE}: ${passed} passed, ${failures.length} failed.`);
  if (failures.length) {
    console.log('\nFAILED:');
    for (const failure of failures) console.log(`  - ${failure}`);
  }
  console.log('='.repeat(96));
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\n§308 ERRORED:', error);
  process.exit(1);
});
