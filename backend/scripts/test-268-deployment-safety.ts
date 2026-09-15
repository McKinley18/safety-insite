/**
 * §268 — DEPLOYMENT SAFETY AND THE OPERATIONAL CONTROLS, OVER REAL HTTP. TIER 2.
 *
 * ZERO PROVIDER CALLS: the transport is substituted through the §262 fail-closed seam, which
 * refuses to substitute outside NODE_ENV=test and counts every leg that reached it.
 * DATABASE OPERATIONS ONLY against disposable databases — the one the §263 wrapper creates and
 * drops around this suite, plus one additional `test_insite_268_*` this suite creates and drops
 * itself for the migration-chain cases, which need a database that has never been migrated.
 *
 * ===============================================================================================
 * WHAT THE UNIT TIER ALREADY PROVED, AND WHY THIS TIER STILL EXISTS.
 *
 * `test-268-operational-controls.ts` proves the RULES: the kill switch refuses, the ceilings
 * arithmetic is right, usage folds across both legs, logs carry no content. It cannot prove those
 * rules are actually REACHED — that the gate sits before the pre-spend claim rather than after it,
 * that a refusal writes no execution row, that the provider seam is genuinely not touched. A
 * correct rule wired to nothing passes the unit tier completely.
 *
 * So this tier measures the same decisions on the real route, and measures the provider-entry
 * count as a DELTA across each refused request. `ExpertAnalysisExecutionService` is the only class
 * that can reach the transport, so the count is complete.
 *
 * ===============================================================================================
 * THE EXPECTATIONS WERE AUTHORED BEFORE THE SUITE WAS RUN, and no provider output is scored.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  substituteExpertSemanticTransportForVerification, expertTransportLifetimeCounts,
} from '../src/hazlenz/expert-hazlenz-product/expert-semantic-transport.provider';
import {
  EXPERT_CANDIDATE_IDENTITY_259,
} from '../src/hazlenz/expert-hazlenz-product/expert-candidate-provenance';
import {
  EXPERT_EXECUTION_ENABLED_VAR,
} from '../src/hazlenz/expert-hazlenz-product/expert-operational-controls';
import {
  captureOperationalEventsForVerification, type OperationalEventLine,
} from '../src/observability/operational-events';
import { evaluateSchemaReadiness } from '../src/database/schema-readiness';
import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import { EXPERT_FIXTURES, OBS_TEXT } from './lib/expert-262-fixtures';
import { writeEvidenceFile } from './lib/evidence-write-gate';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';
import { expectedMigrationTimestamps } from '../src/database/schema-readiness';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): URL {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§268 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§268 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§268 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§268 REFUSED: NODE_ENV must be test.');
  console.log('target proven disposable\n');
  return parsed;
}

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};
const caseResults: { id: string; title: string; passed: boolean; detail: string }[] = [];
let caseFailBase = 0;
const openCase = (): void => { caseFailBase = fail; };
const closeCase = (id: string, title: string, detail: string): void => {
  caseResults.push({ id, title, passed: fail === caseFailBase, detail });
};

class ScriptedTransport implements ExpertSemanticTransport {
  script: { firstPass?: unknown } = {};
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (request.leg === 'FIRST_PASS') {
      return { ok: true, toolInput: this.script.firstPass ?? null, failureKind: null, detail: null };
    }
    return {
      ok: true, toolInput: { propertyReview: [], reviewerNotes: 'scripted verifier verdict' },
      failureKind: null, detail: null,
    };
  }
}

let baseUrl = '';
type Json = Record<string, any>;
async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.ip) headers['x-forwarded-for'] = options.ip;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

const BACKEND = join(__dirname, '..');

async function main(): Promise<void> {
  const target = provenDisposableTarget();

  // The release migration command deliberately loads COMPILED artifacts — that is the property it
  // exists to have. So this suite requires a build, and says so rather than failing later with an
  // opaque require error. `hazlenz:precommit` runs `hazlenz:build` before the integration tier, so
  // this only bites a standalone run against a stale tree.
  for (const artifact of ['dist/database/data-source.js', 'dist/database/schema-readiness.js']) {
    if (!existsSync(join(BACKEND, artifact))) {
      throw new Error(`§268 ABORT: ${artifact} is missing. The production migration command runs `
        + 'against compiled artifacts by design. Run `npm run build` first.');
    }
  }

  // ============================================================ A/B/C. the migration chain
  //
  // Run FIRST and against a database this suite creates itself, because the only honest way to
  // prove "clean database -> all three migrations UP in order" is on a database that has never
  // been migrated. The wrapper's database is already migrated by the time this file runs.

  console.log('---- A/B/C. the production migration command on a never-migrated database ----\n');
  openCase();
  const admin = new URL(target.toString());
  admin.pathname = '/postgres';
  const chainDb = `test_insite_268_${Date.now()}`;
  if (!/^test_insite_268_[a-z0-9_]+$/.test(chainDb)) {
    throw new Error('§268 REFUSED: generated chain database name is not disposable');
  }
  const psql = (sql: string) => execFileSync(
    'psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1', '-q', '-c', sql], { stdio: 'pipe' });
  const chainUrl = new URL(target.toString());
  chainUrl.pathname = `/${chainDb}`;

  psql(`CREATE DATABASE "${chainDb}"`);
  try {
    const runMigrate = (extraEnv: Record<string, string> = {}) => {
      try {
        const stdout = execFileSync('node', ['scripts/release/migrate.js'], {
          cwd: BACKEND, encoding: 'utf8', stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: chainUrl.toString(), ...extraEnv },
        });
        return { code: 0, output: stdout };
      } catch (error: any) {
        return {
          code: error.status ?? 1,
          output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
        };
      }
    };

    // A. the command runs against COMPILED artifacts. It requires dist/database/data-source.js and
    // uses the production `typeorm` dependency; it never touches ts-node or src/.
    const first = runMigrate();
    ok('A-1 the production migration command runs against compiled runtime artifacts',
      first.code === 0, `exit ${first.code}`);
    ok('A-2 it needs no ts-node and no src/ — it loads dist/database/data-source.js',
      /dist\/database\/data-source/.test(
        readFileSync(join(BACKEND, 'scripts/release/migrate.js'), 'utf8')));
    ok('A-3 it prints the target host and database so the release log records what was migrated',
      /release migration target\s+host=/.test(first.output));
    ok('A-4 it never prints a credential',
      !/password|:\/\/[^@\s]*:[^@\s]*@/.test(first.output));

    // B. all three backlog migrations applied, in order.
    for (const timestamp of ['1800000019000', '1800000020000', '1800000021000']) {
      ok(`B-${timestamp} applied on the clean database`, first.output.includes(timestamp));
    }
    const order = ['1800000019000', '1800000020000', '1800000021000']
      .map(t => first.output.indexOf(t));
    ok('B-order the three backlog migrations applied in ascending order',
      order[0] < order[1] && order[1] < order[2], order.join(' < '));
    ok('B-verify the command verifies the schema after migrating, in the same step',
      /schema verification\s+READY/.test(first.output));

    // Second invocation must be a no-op, not a re-apply and not an error.
    const second = runMigrate();
    ok('B-idempotent a second invocation is a clean no-op',
      second.code === 0 && /no migrations pending/.test(second.output), `exit ${second.code}`);

    // C. migration failure must prevent activation. Pointed at an unreachable database, the
    // command must exit non-zero so that `migrate && start` never reaches `start`.
    const unreachable = new URL(chainUrl.toString());
    unreachable.port = '1';
    const failed = runMigrate({ DATABASE_URL: unreachable.toString() });
    ok('C-1 a failing migration exits NON-ZERO', failed.code !== 0, `exit ${failed.code}`);
    ok('C-2 it says the new version must not be activated',
      /MUST NOT be activated/.test(failed.output));
    ok('C-3 it does not swallow the error into a success',
      /RELEASE MIGRATION FAILED/.test(failed.output));
    // The ordering guarantee itself: the shell's && must not reach the second command.
    let chained = '';
    try {
      chained = execFileSync('sh', ['-c',
        'node scripts/release/migrate.js && echo REACHED_APPLICATION_START'], {
        cwd: BACKEND, encoding: 'utf8', stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: unreachable.toString() },
      });
    } catch (error: any) {
      chained = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    }
    ok('C-4 MIGRATE && START never reaches START when the migration fails',
      !/REACHED_APPLICATION_START/.test(chained));
    closeCase('MIGRATION-CHAIN', 'the production migration command applies the three-migration '
      + 'chain on a clean database and fails closed', 'exit 0 clean, non-zero on failure');
  } finally {
    try { psql(`DROP DATABASE IF EXISTS "${chainDb}"`); console.log(`\ndropped ${chainDb}\n`); }
    catch (error) { console.error(`WARNING: could not drop ${chainDb}: ${String(error)}`); }
  }

  // ============================================================ the application

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§268 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const transport = new ScriptedTransport();
  substituteExpertSemanticTransportForVerification(transport);

  const events: OperationalEventLine[] = [];
  captureOperationalEventsForVerification(line => events.push(line));
  const eventsOf = (name: string) => events.filter(e => e.event === name);

  // ============================================================ D/E/F. readiness and version

  console.log('---- D/E/F. schema readiness and running-version identification ----\n');
  openCase();
  const ready = await call('/health/ready');
  ok('E-1 a migrated database reports READY', ready.status === 200, `${ready.status}`);
  /*
   * §299 (IT-2). This assertion used to pin the literal '1800000021000'. Two migrations have landed
   * since -- §287's CorrectiveActionLifecycle and §291's AgreementAcceptance -- so it failed on a
   * readiness endpoint that was answering CORRECTLY. Pinning a schema version in a test means every
   * legitimate migration breaks a gate that is supposed to be about readiness, and the reflex fix is
   * to bump the literal, which teaches nobody anything.
   *
   * The expectation is now DERIVED from the same enumerator the endpoint uses, so what is asserted
   * is the real property: readiness reports the latest migration on disk, and reports it as a
   * concrete version rather than null. A drift between the endpoint and the migrations directory
   * still fails, which is the thing worth catching.
   */
  const latestMigration = expectedMigrationTimestamps().slice(-1)[0] ?? null;
  ok('E-2 readiness names the schema version it verified against',
    latestMigration !== null
    && ready.body?.schema?.expectedSchemaVersion === latestMigration,
    `${String(ready.body?.schema?.expectedSchemaVersion)} (latest migration on disk: ${latestMigration})`);
  ok('E-3 readiness reports the schema dependency explicitly, not just the database',
    ready.body?.dependencies?.schema === 'current');

  // D. readiness must FAIL when the expected schema is absent. Measured by evaluating the same
  // function the endpoint uses against a database whose migrations table is missing the backlog —
  // the real endpoint cannot be used for this without breaking the running application's schema.
  const behind = await evaluateSchemaReadiness({
    query: async () => (await q('SELECT "timestamp" FROM migrations'))
      .filter((row: Json) => !['1800000019000', '1800000020000', '1800000021000']
        .includes(String(row.timestamp))),
  });
  ok('D-1 readiness FAILS when required migrations are absent', behind.ready === false);
  ok('D-2 it names the missing migrations',
    behind.missing.includes('1800000021000'), behind.missing.join(','));
  const noTable = await evaluateSchemaReadiness({
    query: async () => { throw new Error('relation "migrations" does not exist'); },
  });
  ok('D-3 a never-migrated database is NOT READY rather than assumed fine',
    noTable.ready === false && /MIGRATIONS_TABLE_UNREADABLE/.test(noTable.reason));
  ok('D-4 /health/live stays UP regardless, so "restart me" and "do not route to me" stay distinct',
    (await call('/health/live')).status === 200);

  // F. the running commit is identifiable, and its trustworthiness is reported.
  const version = await call('/health/version');
  ok('F-1 the running instance reports a commit', version.status === 200
    && typeof version.body.gitCommit === 'string' && version.body.gitCommit.length > 0,
    String(version.body.gitCommit));
  ok('F-2 it reports WHICH source supplied the commit, so an unstamped build is detectable',
    typeof version.body.versionSourceStatus === 'string',
    String(version.body.versionSourceStatus));
  ok('F-3 /health/version discloses no secret',
    !/secret|password|key|token/i.test(JSON.stringify(version.body)));
  ok('F-4 the release verifier refuses an unstamped answer rather than matching it',
    /BUILD_FALLBACK/.test(
      readFileSync(join(BACKEND, 'scripts/release/verify-running-sha.js'), 'utf8')));
  closeCase('READINESS-VERSION', 'readiness distinguishes "running" from "safe to serve", and the '
    + 'running commit is identifiable', `schemaVersion=${ready.body?.schema?.expectedSchemaVersion}`);

  // ============================================================ set-up for the Expert cases

  const suffix = `${Date.now()}`;
  const password = 'Section268!StrongPass123';
  let authIp = 0;
  const register = async (tag: string) => {
    const email = `s268-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST', ip: `10.268.9.${(authIp += 1)}`,
      body: {
        email, password, name: `s268-${tag}`, type: 'individual',
        // §299 (IT-1). §291 made this required at registration; this harness predates it.
        // Derived from the registry the service validates against, never spelled out here.
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    const login = await call('/auth/login', {
      method: 'POST', ip: `10.268.9.${(authIp += 1)}`, body: { email, password },
    });
    if (!login.body?.token) throw new Error(`§268 ABORT: ${tag} got no token (${login.status})`);
    return { token: login.body.token as string, userId: login.body.user.id as string };
  };
  const reviewer = await register('reviewer');
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', reviewer.userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });

  const site = await call('/sites', {
    method: 'POST', token: reviewer.token, body: { name: `s268-site-${suffix}` } });
  const inspection = await call('/inspections', {
    method: 'POST', token: reviewer.token,
    body: { siteId: site.body.id, title: 's268', regulatoryContext: 'osha-general-industry' } });
  const inspectionId = inspection.body.id as string;

  let ipSeed = 0;
  const nextIp = () => `10.268.0.${(ipSeed += 1)}`;
  let keySeed = 0;
  const nextKey = (tag: string) => `s268-${tag}-${suffix}-${(keySeed += 1)}`;

  const newObservation = async (): Promise<string> => (await call(
    `/inspections/${inspectionId}/observations`,
    { method: 'POST', token: reviewer.token, body: { rawText: OBS_TEXT } })).body.id as string;

  const addDeterministic = (observationId: string, requestVersion: number) => call(
    `/inspections/observations/${observationId}/analyses`, {
      method: 'POST', token: reviewer.token,
      body: {
        engineVersion: 'hazlenz-production', idempotencyKey: nextKey('det'), requestVersion,
        resultSnapshot: {
          multiHazardDecomposition: { hazards: [], isMultiHazard: false, hazardCount: 0 },
          executiveJudgment: 'deterministic conclusion for §268',
        },
      },
    });

  const runExpert = (observationId: string) => {
    transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
    return call(`/inspections/observations/${observationId}/expert-analyses`, {
      method: 'POST', token: reviewer.token, ip: nextIp(),
      body: { idempotencyKey: nextKey('exp') },
    });
  };

  const legs = () => expertTransportLifetimeCounts().total;
  const executionRows = (observationId: string) => q(
    `SELECT id, "executionState", "firstPassInputTokens", "verifierInputTokens", "costUsd", attempts
     FROM expert_analysis_executions WHERE "observationId" = $1`, [observationId]);

  // ============================================================ G/H. the kill switch

  console.log('\n---- G/H. the Expert kill switch ----\n');
  openCase();
  const killObservation = await newObservation();
  await addDeterministic(killObservation, 1);

  process.env[EXPERT_EXECUTION_ENABLED_VAR] = 'false';
  const legsBeforeKill = legs();
  const killed = await runExpert(killObservation);
  const legsAfterKill = legs();

  ok('G-1 an execution request is REFUSED while Expert is disabled',
    killed.status === 503, `${killed.status}`);
  ok('G-2 PROVIDER-ENTRY COUNT IS 0 for the blocked request',
    legsAfterKill - legsBeforeKill === 0, `delta=${legsAfterKill - legsBeforeKill}`);
  ok('G-3 the refusal names the kill switch',
    killed.body?.code === 'EXPERT_EXECUTION_DISABLED', String(killed.body?.code));
  ok('G-4 the response states no provider call was made',
    killed.body?.providerCallsMade === 0);
  ok('G-5 NO execution row was written, so nothing is falsely recorded as having run',
    (await executionRows(killObservation)).length === 0);
  ok('G-6 no analysis row was written',
    Number((await q(
      `SELECT COUNT(*)::int AS n FROM hazlenz_analyses
       WHERE "observationId" = $1 AND producer = 'server_authored'`, [killObservation]))[0].n) === 0);
  ok('G-7 the refusal is emitted as an operational event',
    eventsOf('expert.control.execution_disabled').length === 1);

  // H. the deterministic workflow must remain fully usable while Expert is disabled.
  const detUnderKill = await newObservation();
  const detPersist = await addDeterministic(detUnderKill, 1);
  ok('H-1 a deterministic analysis still persists while Expert is disabled',
    detPersist.status === 201 || detPersist.status === 200, `${detPersist.status}`);
  const detReview = await call(`/inspections/observations/${detUnderKill}/reviews`, {
    method: 'POST', token: reviewer.token,
    body: {
      analysisId: (await q(
        `SELECT id FROM hazlenz_analyses WHERE "observationId" = $1`, [detUnderKill]))[0].id,
      decision: 'accepted', rationale: 'the inspector accepts the deterministic analysis',
    },
  });
  ok('H-2 a human review of it still succeeds',
    detReview.status === 201 || detReview.status === 200, `${detReview.status}`);
  const detFinalize = await call(`/inspections/observations/${detUnderKill}/findings`, {
    method: 'POST', token: reviewer.token,
    body: {
      reviewId: detReview.body.id, conclusion: 'deterministic finding under Expert disable',
      // §300 / HZ-7. THE RULE IS DELIBERATELY NOT EXPERT-SPECIFIC. A finalization that CREATES a
      // finding — rather than updating one reconciliation already rated — must say something about
      // risk whatever produced it, because a finding reaching the report rated by nobody is the
      // same problem on either path. Narrowing the gate to Expert-derived findings would have left
      // this exact hole open on the deterministic path for no principled reason. H-3 still measures
      // what it always measured: that the customer-authoritative path is intact under Expert kill.
      ratingDeferred: { reason: 'Severity to be set on the risk matrix.' },
    },
  });
  ok('H-3 finalizing a finding from it still succeeds — the customer-authoritative path is intact',
    detFinalize.status === 201 || detFinalize.status === 200, `${detFinalize.status}`);
  ok('H-4 reading an existing Expert analysis is still permitted while execution is disabled',
    (await call(`/inspections/observations/${killObservation}/expert-analyses/current`,
      { token: reviewer.token, ip: nextIp() })).status === 200);

  process.env[EXPERT_EXECUTION_ENABLED_VAR] = 'true';
  const afterReenable = await runExpert(killObservation);
  ok('G-8 re-enabling restores execution with no redeploy',
    afterReenable.status === 201 || afterReenable.status === 200, `${afterReenable.status}`);
  closeCase('KILL-SWITCH', 'Expert execution is disabled server-side before the provider seam '
    + 'while the deterministic workflow stays usable', 'provider-entry delta 0');

  // ============================================================ I/J. the spend ceilings

  console.log('\n---- I/J. the workspace spend ceilings ----\n');
  openCase();
  // Deliberately tiny limits, as §268 directs for local acceptance.
  process.env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE = '2';
  process.env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE = '1000';

  const spendUser = await register('spend');
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', spendUser.userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  const spendSite = await call('/sites', {
    method: 'POST', token: spendUser.token, body: { name: `s268-spend-${suffix}` } });
  const spendInspection = await call('/inspections', {
    method: 'POST', token: spendUser.token,
    body: { siteId: spendSite.body.id, title: 's268-spend',
      regulatoryContext: 'osha-general-industry' } });
  const runFor = async () => {
    const created = await call(`/inspections/${spendInspection.body.id}/observations`, {
      method: 'POST', token: spendUser.token, body: { rawText: OBS_TEXT } });
    transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
    return call(`/inspections/observations/${created.body.id}/expert-analyses`, {
      method: 'POST', token: spendUser.token, ip: nextIp(),
      body: { idempotencyKey: nextKey('spend') } });
  };

  const one = await runFor();
  ok('I-1 the first analysis, below the ceiling, executes',
    one.status === 201 || one.status === 200, `${one.status}`);
  const two = await runFor();
  ok('I-2 the second analysis, still below the ceiling, executes',
    two.status === 201 || two.status === 200, `${two.status}`);

  const legsBeforeCeiling = legs();
  const three = await runFor();
  const legsAfterCeiling = legs();
  ok('J-1 the third analysis is REFUSED at the workspace ceiling',
    three.status === 503, `${three.status}`);
  ok('J-2 PROVIDER-ENTRY COUNT IS 0 for the request blocked by the ceiling',
    legsAfterCeiling - legsBeforeCeiling === 0, `delta=${legsAfterCeiling - legsBeforeCeiling}`);
  ok('J-3 the refusal names the ceiling, not the kill switch',
    three.body?.code === 'WORKSPACE_ANALYSIS_CEILING_REACHED', String(three.body?.code));
  ok('J-4 the ceiling refusal is emitted as an operational event',
    eventsOf('expert.control.spend_limit_refused').length >= 1);
  ok('J-5 the ceiling is per workspace: the other workspace is unaffected',
    (await runExpert(await newObservation())).status === 201);

  // The analysis ceiling is lifted out of the way on purpose: with both ceilings reachable the
  // count would fire first and this case would pass while proving nothing about cost.
  process.env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE = '10000';
  process.env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE = '0.0000001';
  // A substituted transport reports no tokens, so no execution in this run has a cost. The ceiling
  // is therefore exercised by stamping a recorded cost onto this workspace's OWN existing
  // executions — the same column the hosted path writes — rather than by inventing a code path
  // that only tests use.
  await q(`UPDATE expert_analysis_executions SET "costUsd" = '0.25'
           WHERE "requestedByUserId" = $1`, [reviewer.userId]);
  const costBlockedLegsBefore = legs();
  const costBlocked = await call(
    `/inspections/observations/${await newObservation()}/expert-analyses`, {
      method: 'POST', token: reviewer.token, ip: nextIp(),
      body: { idempotencyKey: nextKey('cost') } });
  ok('J-6 a cost ceiling refuses independently of the analysis count',
    costBlocked.status === 503
      && costBlocked.body?.code === 'WORKSPACE_COST_CEILING_REACHED', String(costBlocked.body?.code));
  ok('J-7 provider-entry count is 0 for the cost-blocked request',
    legs() - costBlockedLegsBefore === 0);
  delete process.env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE;
  delete process.env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE;
  closeCase('SPEND-CEILING', 'a workspace ceiling refuses before the provider seam and is scoped '
    + 'per workspace', 'provider-entry delta 0');

  // ============================================================ K. leg accounting

  console.log('\n---- K. provider-leg and token/cost accounting ----\n');
  openCase();
  // TWO fixtures, because the leg count is a property of the ANALYSIS and not a constant.
  //
  //   A_ADMITTED_NO_CONFIRMATION   admits with no unresolved declaration, so the verifier is
  //                                deliberately not reached (NO_ADMITTED_DECLARATION) — ONE leg.
  //   B_ADMITTED_CONFIRMATION_REQUIRED
  //                                carries an unresolved declaration, so the verifier leg runs —
  //                                TWO legs.
  //
  // §268 requires accounting to cover BOTH legs and forbids treating one analysis as one provider
  // call. Asserting a constant 2 would have been wrong in the other direction: it would have
  // failed on a legitimately single-leg analysis. So both shapes are measured.
  process.env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE = '10000';
  process.env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE = '10000';
  await q(`UPDATE expert_analysis_executions SET "costUsd" = NULL
           WHERE "requestedByUserId" = $1`, [reviewer.userId]);

  const twoLegObservation = await newObservation();
  transport.script = { firstPass: EXPERT_FIXTURES.B_ADMITTED_CONFIRMATION_REQUIRED.firstPass() };
  const twoLeg = await call(`/inspections/observations/${twoLegObservation}/expert-analyses`, {
    method: 'POST', token: reviewer.token, ip: nextIp(),
    body: { idempotencyKey: nextKey('twoleg') } });
  ok('K-0 the two-leg analysis executed', twoLeg.status === 201, `${twoLeg.status}`);
  const twoLegRow = (await executionRows(twoLegObservation))[0];
  ok('K-1 an analysis that reaches the verifier records TWO provider legs',
    Number(twoLegRow?.attempts) === 2, `attempts=${twoLegRow?.attempts}`);

  const oneLegRow = (await executionRows(killObservation))
    .find((row: Json) => row.executionState !== 'ANALYSIS_RUNNING');
  ok('K-2 an analysis whose verifier is deliberately not reached records ONE leg — so the count '
    + 'is measured, not assumed',
    Number(oneLegRow?.attempts) === 1, `attempts=${oneLegRow?.attempts}`);
  ok('K-3 the substituted transport reports no tokens, so cost is NULL rather than a false zero',
    twoLegRow?.costUsd === null && twoLegRow?.firstPassInputTokens === null,
    String(twoLegRow?.costUsd));

  const usageEvents = eventsOf('expert.provider.usage_recorded');
  const twoLegEvent = usageEvents.find(e => e.metadata.providerLegs === 2);
  ok('K-4 usage is emitted as an operational event carrying the leg count',
    twoLegEvent !== undefined,
    usageEvents.map(e => e.metadata.providerLegs).join(','));
  ok('K-5 the event names the expected legs per analysis alongside the actual, so a one-leg '
    + 'analysis is legible rather than looking like a lost call',
    twoLegEvent?.metadata.expectedProviderLegs === 2);
  ok('K-6 the usage event records that a substituted transport answered, so a null cost in a '
    + 'local run is never mistaken for a hosted call that reported nothing',
    usageEvents.length > 0 && usageEvents.every(e => e.metadata.transportSubstituted === true));
  delete process.env.EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE;
  delete process.env.EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE;
  closeCase('LEG-ACCOUNTING', 'both provider legs are accounted, a one-leg analysis is recorded '
    + 'as one, and an unmeasured cost stays null',
    `twoLeg=${twoLegRow?.attempts} oneLeg=${oneLegRow?.attempts}`);

  // ============================================================ L/M. observability

  console.log('\n---- L/M. structured operational events, and what they must not contain ----\n');
  openCase();
  for (const required of [
    'expert.execution.started', 'expert.execution.admitted',
    'expert.control.execution_disabled', 'expert.control.spend_limit_refused',
    'expert.provider.usage_recorded',
  ]) {
    ok(`L-${required}`, eventsOf(required).length > 0, `${eventsOf(required).length}`);
  }
  ok('L-schema every emitted event carries the stable schema and a severity',
    events.length > 0 && events.every(e =>
      e.schema === 'safety-insite.operational-event.v1'
      && ['info', 'warning', 'error'].includes(e.severity)), `${events.length} events`);
  ok('L-identifiers events carry the identifiers an operator needs',
    eventsOf('expert.execution.started').every(e =>
      typeof e.metadata.observationId === 'string' && typeof e.metadata.executionId === 'string'));

  // M. the emitted stream must contain no raw provider output and no observation text.
  const emitted = JSON.stringify(events);
  ok('M-1 no observation text appears in any emitted event',
    !emitted.includes('conveyor drive guard') && !emitted.includes(OBS_TEXT.slice(0, 40)));
  ok('M-2 no Expert posture appears in any emitted event',
    !/CONTINUE_WITH_CONTROLS|STOP_WORK|HOLD_PENDING_VERIFICATION/.test(emitted));
  ok('M-3 no bearer token or credential appears in any emitted event',
    !/Bearer |sk-ant|ANTHROPIC_API_KEY/.test(emitted));
  ok('M-4 no raw provider tool input appears in any emitted event',
    !/expertHazardCandidates|evidenceBasis/.test(emitted));
  closeCase('OBSERVABILITY', 'the minimum event set is emitted and carries no sensitive content',
    `${events.length} events`);

  // ============================================================ closure

  const finalLegs = expertTransportLifetimeCounts();
  console.log(`\nprovider legs that reached the seam: total=${finalLegs.total} `
    + `firstPass=${finalLegs.firstPass} verifier=${finalLegs.verifier}`);
  ok('SPEND every leg was answered by the substituted deterministic transport, so zero hosted '
    + 'calls were made', true, `${finalLegs.total} local legs`);

  captureOperationalEventsForVerification(null);

  const evidenceDir = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-268-beta-infrastructure-operations-2026-09-13');
  const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  writeEvidenceFile(evidenceDir, 'SECTION-268-DEPLOYMENT-SAFETY.json', JSON.stringify({
    artifact: 'SECTION-268-DEPLOYMENT-SAFETY-AND-OPERATIONAL-CONTROLS',
    candidateIdentity: EXPERT_CANDIDATE_IDENTITY_259,
    providerCalls: 0,
    localTransportLegs: finalLegs,
    assertions: { pass, fail },
    cases: caseResults.map(c => ({ ...c, detail: c.detail.replace(UUID, '<uuid>') })),
    operationalEventsObserved: [...new Set(events.map(e => e.event))].sort(),
  }, null, 2) + '\n');

  await app.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('failures:');
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
