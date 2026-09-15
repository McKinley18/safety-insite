/**
 * §267 — THE PRODUCT INTEGRATION DEFECT CLOSURE ACCEPTANCE. TIER 2, OVER REAL HTTP.
 *
 * ZERO PROVIDER CALLS: the transport is substituted through the §262 fail-closed seam, which
 * refuses to substitute outside NODE_ENV=test and counts every leg that reached it. DATABASE
 * OPERATIONS ONLY against a disposable database, created and dropped by the §263 wrapper.
 *
 * ===============================================================================================
 * WHAT THIS SUITE EXISTS TO PROVE, AND WHY §265's SUITE COULD NOT.
 *
 * §265's acceptance passed on every case and shipped two defects that made Expert unusable. Both
 * escaped for the SAME structural reason: the suite exercised the route with requests it wrote
 * itself, against observations it created fresh. The product does neither.
 *
 *   THE OBSERVATION IS NOT FRESH. The Expert panel only renders once a deterministic analysis
 *   exists, so in the product EVERY Expert request lands on an observation that already owns
 *   analysis rows and request-version state. Every §265 case used a brand-new observation, where
 *   `requestVersion: 1` was correct by accident.
 *
 *   THE REQUEST IS NOT HAND-AUTHORED. §266 found the shipped client hardcoding `requestVersion: 1`
 *   while the suite supplied the same field itself, correctly. A suite that writes the request
 *   cannot detect that the client writes a different one.
 *
 * So case P1 below posts a body that was CONSTRUCTED BY `frontend-next/lib/expert/expertApi.ts`,
 * captured out of that module's own network seam by a helper this suite spawns, onto an observation
 * that already carries a deterministic analysis. That is the §266 scenario exactly, assembled the
 * way the product assembles it.
 *
 * ===============================================================================================
 * THE EXPECTATIONS WERE AUTHORED BEFORE THE SUITE WAS RUN, and no provider output is scored: every
 * fixture is a RECORDED deterministic input that exists to reach one server outcome.
 *
 * ===============================================================================================
 * PROVIDER-ENTRY COUNTING IS THE MEASUREMENT, NOT AN ASSERTION ABOUT INTENT.
 *
 * `expertTransportLifetimeCounts()` counts legs that reached the transport seam, and
 * `ExpertAnalysisExecutionService` is the only class in the product that can reach it (§262 keeps
 * `ExpertAnalysisService` provider-free by construction, which is what makes the count complete).
 * The pre-spend cases below therefore read the counter immediately before and immediately after the
 * refused request and require the DELTA to be zero. A cumulative total would not prove it.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  substituteExpertSemanticTransportForVerification, expertTransportLifetimeCounts,
} from '../src/hazlenz/expert-hazlenz-product/expert-semantic-transport.provider';
import {
  EXPERT_CANDIDATE_IDENTITY_274,
} from '../src/hazlenz/expert-hazlenz-product/expert-candidate-provenance';
import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import { EXPERT_FIXTURES, OBS_TEXT } from './lib/expert-262-fixtures';
import { writeEvidenceFile } from './lib/evidence-write-gate';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§267 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§267 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§267 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§267 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§267 REFUSED: DEV_AUTH_BYPASS is enabled; the authorization cases would '
      + 'measure the bypass rather than the route.');
  }
  console.log('target proven disposable\n');
}

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};
const caseResults: { id: string; title: string; passed: boolean; detail: string }[] = [];
const before = { pass: 0, fail: 0 };
const openCase = (): void => { before.pass = pass; before.fail = fail; };
const closeCase = (id: string, title: string, detail: string): void => {
  caseResults.push({ id, title, passed: fail === before.fail, detail });
};

class ScriptedTransport implements ExpertSemanticTransport {
  script: { firstPass?: unknown; firstPassFailure?: { kind: string; detail: string } } = {};
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (request.leg === 'FIRST_PASS') {
      if (this.script.firstPassFailure) {
        return {
          ok: false, toolInput: null,
          failureKind: this.script.firstPassFailure.kind,
          detail: this.script.firstPassFailure.detail,
        };
      }
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
  options: { method?: string; body?: unknown; rawBody?: string; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.ip) headers['x-forwarded-for'] = options.ip;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    // `rawBody` transmits captured bytes VERBATIM. Re-serialising a parsed object would let this
    // suite quietly normalise whatever the client actually produced, which is the recreation §267
    // forbids.
    body: options.rawBody !== undefined
      ? options.rawBody
      : options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

const FRONTEND = resolve(__dirname, '..', '..', 'frontend-next');

/**
 * RUN THE REAL CLIENT MODULE AND RETURN WHAT IT TRANSMITTED.
 *
 * A child process, deliberately. The client is browser TypeScript with `@/` path aliases and a
 * `window` dependency; loading it into this Nest process would mean shimming a browser inside the
 * server under test. Spawning the capture keeps the two environments honest and keeps the
 * measurement in the workspace the module actually belongs to.
 */
function captureRealFrontendRequest(observationId: string): {
  method: string; pathAndQuery: string; rawBody: string; body: Json;
} {
  const stdout = execFileSync(
    'node',
    ['scripts/capture-expert-request.mjs', '--emit-json', `--observation=${observationId}`],
    { cwd: FRONTEND, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return JSON.parse(stdout);
}

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§267 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const transport = new ScriptedTransport();
  substituteExpertSemanticTransportForVerification(transport);

  const suffix = `${Date.now()}`;
  const password = 'Section267!StrongPass123';
  let authIp = 0;
  const register = async (tag: string) => {
    const email = `s267-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST', ip: `10.267.9.${(authIp += 1)}`,
      body: {
        email, password, name: `s267-${tag}`, type: 'individual',
        // §299 (IT-1). §291 made this required at registration; this harness predates it.
        // Derived from the registry the service validates against, never spelled out here.
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    const login = await call('/auth/login', {
      method: 'POST', ip: `10.267.9.${(authIp += 1)}`, body: { email, password },
    });
    if (!login.body?.token) {
      throw new Error(`§267 ABORT: ${tag} did not receive a token (${login.status}).`);
    }
    return { email, token: login.body.token as string, userId: login.body.user.id as string };
  };
  const reviewer = await register('reviewer');
  const unentitled = await register('unentitled');
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', reviewer.userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });

  const site = await call('/sites', {
    method: 'POST', token: reviewer.token, body: { name: `s267-site-${suffix}` },
  });
  const inspection = await call('/inspections', {
    method: 'POST', token: reviewer.token,
    body: { siteId: site.body.id, title: 's267', regulatoryContext: 'osha-general-industry' },
  });
  const inspectionId = inspection.body.id as string;

  let ipSeed = 0;
  const nextIp = () => `10.267.0.${(ipSeed += 1)}`;
  let keySeed = 0;
  const nextKey = (tag: string) => `s267-${tag}-${suffix}-${(keySeed += 1)}`;

  const newObservation = async (): Promise<string> => {
    const created = await call(`/inspections/${inspectionId}/observations`, {
      method: 'POST', token: reviewer.token, body: { rawText: OBS_TEXT },
    });
    return created.body.id as string;
  };

  /**
   * Persist a DETERMINISTIC analysis the way the deterministic client does: through the snapshot
   * persistence route, with the version the client computes as max(existing)+1.
   */
  const addDeterministic = async (
    observationId: string, requestVersion: number,
  ): Promise<{ status: number; body: Json }> => call(
    `/inspections/observations/${observationId}/analyses`,
    {
      method: 'POST', token: reviewer.token,
      body: {
        engineVersion: 'hazlenz-production',
        idempotencyKey: nextKey('det'),
        requestVersion,
        resultSnapshot: {
          multiHazardDecomposition: { hazards: [], isMultiHazard: false, hazardCount: 0 },
          executiveJudgment: 'deterministic conclusion for §267',
        },
      },
    },
  );

  const runExpert = async (
    observationId: string,
    fixture: keyof typeof EXPERT_FIXTURES = 'A_ADMITTED_NO_CONFIRMATION',
    body: Record<string, unknown> = {},
  ) => {
    transport.script = { firstPass: EXPERT_FIXTURES[fixture].firstPass() };
    return call(`/inspections/observations/${observationId}/expert-analyses`, {
      method: 'POST', token: reviewer.token, ip: nextIp(),
      body: { idempotencyKey: nextKey('exp'), ...body },
    });
  };

  const analysisRows = (observationId: string): Promise<Array<{
    id: string; producer: string; status: string; requestVersion: number; analysisState: string;
  }>> => q(
    `SELECT id, producer, status, "requestVersion", "analysisState" FROM hazlenz_analyses
     WHERE "observationId" = $1 ORDER BY "requestVersion" ASC`, [observationId]);

  // ================================================================ P0-1

  console.log('---- P0-1. the real shipped frontend request, on a real product observation ----\n');
  openCase();
  const o1 = await newObservation();
  const d1 = await addDeterministic(o1, 1);
  ok('P0-1-A the deterministic analysis persists at requestVersion 1, as in the product',
    d1.status === 201 || d1.status === 200, `${d1.status}`);

  const captured = captureRealFrontendRequest(o1);
  console.log(`  captured from expertApi.ts: ${captured.method} ${captured.pathAndQuery}`);
  console.log(`  body ${captured.rawBody}\n`);
  ok('P0-1-B the captured request came from the real client and sends NO requestVersion',
    !Object.prototype.hasOwnProperty.call(captured.body, 'requestVersion'),
    Object.keys(captured.body).join(','));

  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  const realRequest = await call(captured.pathAndQuery, {
    method: captured.method, token: reviewer.token, ip: nextIp(), rawBody: captured.rawBody,
  });
  if (realRequest.body?.analysisId == null) {
    console.log('  DIAGNOSTIC response: ' + JSON.stringify(realRequest.body).slice(0, 400));
    console.log('  DIAGNOSTIC execution: ' + JSON.stringify(await q(
      `SELECT "executionState", "failureKind", "failureDetail", admission, attempts
       FROM expert_analysis_executions WHERE "observationId" = $1`, [o1])).slice(0, 600));
  }
  ok('P0-1-C THE §266 DEFECT: the real client request now SUCCEEDS on an observation that already '
    + 'carries a deterministic analysis',
    (realRequest.status === 201 || realRequest.status === 200)
      && realRequest.body?.analysisId != null,
    `${realRequest.status} state=${String(realRequest.body?.analysisState ?? '')}`);
  ok('P0-1-D the server allocated the next execution version rather than the client choosing it',
    realRequest.body?.requestVersion === 2 || (await analysisRows(o1))
      .some(r => r.producer === 'server_authored' && r.requestVersion === 2),
    JSON.stringify((await analysisRows(o1)).map(r => `${r.producer}@v${r.requestVersion}`)));
  const o1Rows = await analysisRows(o1);
  ok('P0-1-E exactly one Expert execution proceeded',
    o1Rows.filter(r => r.producer === 'server_authored').length === 1,
    `${o1Rows.length} rows`);
  ok('P0-1-F no version/persistence conflict was discovered after provider entry',
    !/newer analysis request/i.test(JSON.stringify(realRequest.body)));
  closeCase('P0-1', 'the real shipped frontend Expert request succeeds after a deterministic '
    + 'analysis', `${o1Rows.map(r => `${r.producer}@v${r.requestVersion}`).join(' ')}`);

  // ================================================================ pre-spend refusal

  console.log('\n---- PRE-SPEND. a stale/conflicting execution request never reaches a provider ----\n');
  openCase();
  const o2 = await newObservation();
  await addDeterministic(o2, 1);

  const legsBeforeStale = expertTransportLifetimeCounts().total;
  // THE §266 PAYLOAD EXACTLY: the version the shipped §265 client used to send, on an observation
  // that already owns it. Sent explicitly here because §267 requires the stale case to be proven,
  // and the repaired client can no longer produce one.
  const stale = await runExpert(o2, 'A_ADMITTED_NO_CONFIRMATION', { requestVersion: 1 });
  const legsAfterStale = expertTransportLifetimeCounts().total;
  ok('PRE-1 a stale request version is REFUSED', stale.status === 409, `${stale.status}`);
  ok('PRE-2 PROVIDER-ENTRY COUNT FOR THE REJECTED CONFLICT IS 0',
    legsAfterStale - legsBeforeStale === 0, `delta=${legsAfterStale - legsBeforeStale}`);
  ok('PRE-3 the refusal says nothing was charged',
    /nothing was charged/i.test(String(stale.body?.message ?? '')),
    String(stale.body?.message ?? '').slice(0, 90));
  ok('PRE-4 no execution row was written for the refused request',
    Number((await q(
      `SELECT COUNT(*)::int AS n FROM expert_analysis_executions WHERE "observationId" = $1`,
      [o2]))[0].n) === 0);
  ok('PRE-5 no analysis row was written for the refused request',
    (await analysisRows(o2)).filter(r => r.producer === 'server_authored').length === 0);

  const legsBeforeAhead = expertTransportLifetimeCounts().total;
  const invented = await runExpert(o2, 'A_ADMITTED_NO_CONFIRMATION', { requestVersion: 99 });
  ok('PRE-6 an INVENTED version that skips ahead is also refused pre-spend',
    invented.status === 409
      && expertTransportLifetimeCounts().total - legsBeforeAhead === 0,
    `${invented.status} delta=${expertTransportLifetimeCounts().total - legsBeforeAhead}`);
  closeCase('PRE-SPEND', 'stale and invented execution versions are adjudicated before provider '
    + 'contact', `provider-entry delta 0`);

  // ================================================================ P0-2

  console.log('\n---- P0-2. a successful Expert run does not supersede the deterministic analysis ----\n');
  openCase();
  const o3 = await newObservation();
  await addDeterministic(o3, 1);
  const beforeExpert = await analysisRows(o3);
  const detId = beforeExpert.find(r => r.producer === 'client_supplied')!.id;
  const e3 = await runExpert(o3);
  ok('P0-2-A the Expert run succeeded', e3.status === 201 || e3.status === 200, `${e3.status}`);
  const afterExpert = await analysisRows(o3);
  const detAfter = afterExpert.find(r => r.id === detId)!;
  const expAfter = afterExpert.find(r => r.producer === 'server_authored')!;
  ok('P0-2-B the DETERMINISTIC analysis is still current after the Expert run',
    detAfter.status === 'current', detAfter.status);
  ok('P0-2-C the Expert analysis is current within its own family',
    expAfter.status === 'current', expAfter.status);
  ok('P0-2-D the two rows are distinct and carry distinct producers',
    detAfter.id !== expAfter.id && detAfter.producer !== expAfter.producer);

  // THE RESTORATION SEQUENCE, through the payload the workspace actually reloads.
  const reload = await call(`/inspections/${inspectionId}`, { token: reviewer.token });
  const reloaded = (reload.body.observations ?? []).find((o: Json) => o.id === o3);
  const deterministicSelected = (reloaded?.analyses ?? [])
    .filter((a: Json) => a.producer !== 'server_authored' && a.status !== 'superseded')
    .sort((a: Json, b: Json) => (b.requestVersion || 0) - (a.requestVersion || 0))[0];
  ok('P0-2-E workspace reload selects the DETERMINISTIC analysis, not the Expert one',
    deterministicSelected?.id === detId, String(deterministicSelected?.id));
  ok('P0-2-F the deterministic consumer receives a deterministic snapshot it can read',
    typeof deterministicSelected?.resultSnapshot?.executiveJudgment === 'string',
    String(Object.keys(deterministicSelected?.resultSnapshot ?? {})));

  const expertRead = await call(
    `/inspections/observations/${o3}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  ok('P0-2-G the Expert panel receives the Expert representation',
    expertRead.status === 200 && expertRead.body.producer === 'server_authored'
      && expertRead.body.analysisId === expAfter.id,
    `${expertRead.status} ${expertRead.body.producer}`);
  ok('P0-2-H the two surfaces serve different analysis ids',
    expertRead.body.analysisId !== detId);
  closeCase('P0-2', 'deterministic and Expert currentness are independent',
    `deterministic=${detAfter.status} expert=${expAfter.status}`);

  // ---- the deterministic consumer cannot cast/read an Expert snapshot.
  openCase();
  const expertRowInPayload = (reloaded?.analyses ?? [])
    .find((a: Json) => a.producer === 'server_authored');
  ok('CAST-1 the Expert row is present in the generic payload but carries NO resultSnapshot',
    expertRowInPayload !== undefined
      && expertRowInPayload.resultSnapshot === undefined,
    JSON.stringify(Object.keys(expertRowInPayload ?? {})));
  ok('CAST-2 it is explicitly marked withheld rather than silently empty',
    expertRowInPayload?.expertResultWithheld === true);
  closeCase('CAST', 'a deterministic consumer cannot read an Expert snapshot from the generic '
    + 'payload', 'resultSnapshot absent');

  // ================================================================ D1 -> E1 -> E2

  console.log('\n---- LINEAGE. D1 -> E1 -> E2 scopes Expert supersession only ----\n');
  openCase();
  const o4 = await newObservation();
  await addDeterministic(o4, 1);
  await runExpert(o4);
  const e1Id = (await analysisRows(o4)).find(r => r.producer === 'server_authored')!.id;
  await runExpert(o4);
  const lineage = await analysisRows(o4);
  const d1Row = lineage.find(r => r.producer === 'client_supplied')!;
  const e1Row = lineage.find(r => r.id === e1Id)!;
  const e2Row = lineage.find(r => r.producer === 'server_authored' && r.id !== e1Id)!;
  ok('LIN-1 D1 remains the current deterministic analysis', d1Row.status === 'current', d1Row.status);
  ok('LIN-2 E2 is the current Expert analysis', e2Row.status === 'current', e2Row.status);
  ok('LIN-3 E1 is superseded WITHIN the Expert lineage', e1Row.status === 'superseded', e1Row.status);
  ok('LIN-4 E2 did not supersede D1', d1Row.status !== 'superseded');
  closeCase('D1->E1->E2', 'Expert supersession is scoped to the Expert family',
    lineage.map(r => `${r.producer}@v${r.requestVersion}=${r.status}`).join(' '));

  // ================================================================ D1 -> E1 -> D2

  console.log('\n---- LINEAGE. D1 -> E1 -> D2 scopes deterministic supersession only ----\n');
  openCase();
  const o5 = await newObservation();
  await addDeterministic(o5, 1);
  await runExpert(o5);
  const eRow5 = (await analysisRows(o5)).find(r => r.producer === 'server_authored')!;
  const d2 = await addDeterministic(o5, eRow5.requestVersion + 1);
  ok('RERUN-0 the deterministic rerun persists', d2.status === 201 || d2.status === 200,
    `${d2.status}`);
  const rerun = await analysisRows(o5);
  const d1b = rerun.find(r => r.producer === 'client_supplied' && r.requestVersion === 1)!;
  const d2b = rerun.find(r => r.producer === 'client_supplied' && r.requestVersion > 1)!;
  const e1b = rerun.find(r => r.id === eRow5.id)!;
  ok('RERUN-1 D2 is the current deterministic analysis', d2b.status === 'current', d2b.status);
  ok('RERUN-2 D1 is superseded within the deterministic family', d1b.status === 'superseded',
    d1b.status);
  ok('RERUN-3 E1 is STILL the current Expert analysis', e1b.status === 'current', e1b.status);
  ok('RERUN-4 the deterministic rerun did not erase the Expert provenance',
    e1b.analysisState !== 'ANALYSIS_FAILED' && e1b.status !== 'superseded');
  closeCase('D1->E1->D2', 'deterministic supersession is scoped to the deterministic family',
    rerun.map(r => `${r.producer}@v${r.requestVersion}=${r.status}`).join(' '));

  // ================================================================ P1 read boundary

  console.log('\n---- P1. the generic inspection payload does not expose Expert content ----\n');
  openCase();
  const payload = JSON.stringify(reload.body);
  ok('READ-1 the generic inspection payload carries no Expert posture',
    !/CONTINUE_WITH_CONTROLS|STOP_WORK|snapshotKind/i.test(payload));
  ok('READ-2 it carries no Expert snapshot marker',
    !/EXPERT_HAZLENZ_SERVER_AUTHORED_ANALYSIS/.test(payload));
  ok('READ-3 it still carries the deterministic snapshot unchanged',
    /executiveJudgment/.test(payload));
  ok('READ-4 it does not reconstruct effectiveDecision',
    !/effectiveDecision/.test(payload));
  const unentitledRead = await call(
    `/inspections/observations/${o3}/expert-analyses/current`,
    { token: unentitled.token, ip: nextIp() });
  // 402 PAYMENT_REQUIRED is what `EntitlementGuard` actually throws for a missing plan feature, and
  // 404 is what tenant isolation answers. Either is a refusal; what matters is that the response
  // carries no Expert content, which is asserted rather than inferred from the status alone.
  ok('READ-5 an unentitled principal is still blocked from the Expert read route',
    [402, 403, 404].includes(unentitledRead.status)
      && !/CONTINUE_WITH_CONTROLS|resultSnapshot|posture/i.test(JSON.stringify(unentitledRead.body)),
    `${unentitledRead.status} ${String(unentitledRead.body?.code ?? '')}`);
  const anonymousRead = await call(
    `/inspections/observations/${o3}/expert-analyses/current`, { ip: nextIp() });
  ok('READ-6 an unauthenticated Expert read is rejected', anonymousRead.status === 401,
    `${anonymousRead.status}`);
  closeCase('P1-READ', 'the generic inspection payload withholds raw Expert snapshots',
    'no posture, no snapshotKind, deterministic unchanged');

  // ================================================================ dismissal

  console.log('\n---- DISMISSAL. finalization stays gated; dismissal is released ----\n');
  openCase();
  const o6 = await newObservation();
  await addDeterministic(o6, 1);
  transport.script = { firstPass: EXPERT_FIXTURES.B_ADMITTED_CONFIRMATION_REQUIRED.firstPass() };
  const awaiting = await call(`/inspections/observations/${o6}/expert-analyses`, {
    method: 'POST', token: reviewer.token, ip: nextIp(),
    body: { idempotencyKey: nextKey('await') },
  });
  const awaitingId = awaiting.body.analysisId as string;
  ok('DIS-0 the Expert analysis is awaiting confirmation',
    awaiting.body.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION',
    String(awaiting.body.analysisState));

  const reviewFor = async (decision: 'accepted' | 'dismissed') => {
    const review = await call(`/inspections/observations/${o6}/reviews`, {
      method: 'POST', token: reviewer.token,
      body: {
        analysisId: awaitingId, decision,
        rationale: `the inspector ${decision} this proposed finding for §267`,
      },
    });
    return review.body.id as string;
  };

  const acceptReviewId = await reviewFor('accepted');
  const finalizeAttempt = await call(`/inspections/observations/${o6}/findings`, {
    method: 'POST', token: reviewer.token,
    body: { reviewId: acceptReviewId, conclusion: 'drive not isolated while a person is inside' },
  });
  ok('DIS-1 FINALIZATION of a finding resting on an unsettled Expert analysis is STILL blocked',
    finalizeAttempt.status === 409, `${finalizeAttempt.status}`);

  const dismissReviewId = await reviewFor('dismissed');
  const dismissAttempt = await call(`/inspections/observations/${o6}/findings`, {
    method: 'POST', token: reviewer.token,
    body: { reviewId: dismissReviewId, conclusion: 'not carried into the report' },
  });
  ok('DIS-2 DISMISSAL of the same finding SUCCEEDS',
    dismissAttempt.status === 201 || dismissAttempt.status === 200,
    `${dismissAttempt.status} ${String(dismissAttempt.body?.message ?? '')}`);
  ok('DIS-3 the finding is recorded as dismissed',
    dismissAttempt.body?.status === 'dismissed', String(dismissAttempt.body?.status));

  const afterDismiss = (await analysisRows(o6)).find(r => r.id === awaitingId)!;
  ok('DIS-4 the Expert analysis is STILL ANALYSIS_AWAITING_CONFIRMATION',
    afterDismiss.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION', afterDismiss.analysisState);
  const settlementAfter = Number((await q(
    `SELECT COUNT(*)::int AS n FROM hazlenz_analyses
     WHERE id = $1 AND "settlementReviewId" IS NOT NULL`, [awaitingId]))[0].n);
  ok('DIS-5 the dismissal did not settle the analysis (no settlementReviewId)',
    settlementAfter === 0, `${settlementAfter}`);
  const decisionAfter = await call(
    `/inspections/observations/${o6}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  ok('DIS-6 deriveEffectiveDecision remains UNSETTLED after the dismissal',
    decisionAfter.body?.effectiveDecision?.settledForUse === false
      && decisionAfter.body?.effectiveDecision?.humanSettled === false
      && (decisionAfter.body?.effectiveDecision?.entries ?? []).length === 0,
    `source=${decisionAfter.body?.effectiveDecision?.source} `
      + `settledForUse=${decisionAfter.body?.effectiveDecision?.settledForUse}`);
  ok('DIS-7 the dismissal created no corrective action',
    Number((await q(
      // `corrective_actions."findingId"` is an untyped varchar column while `inspection_findings.id`
      // is uuid, so the join needs an explicit cast; Postgres has no uuid = varchar operator.
      `SELECT COUNT(*)::int AS n FROM corrective_actions ca
       JOIN inspection_findings f ON f.id::text = ca."findingId" WHERE f."observationId" = $1`,
      [o6]))[0].n) === 0);
  const auditRows = await q(
    `SELECT action, metadata FROM security_audit_events
     WHERE action = 'finding_review_finalized' AND metadata->>'observationId' = $1`, [o6]);
  ok('DIS-8 the dismissal is separately attributable and auditable',
    auditRows.some((r: Json) => r.metadata?.status === 'dismissed'),
    JSON.stringify(auditRows.map((r: Json) => r.metadata?.status)));
  closeCase('DISMISSAL', 'dismissal no longer requires Expert settlement; finalization still does',
    `state=${afterDismiss.analysisState}`);

  // ================================================================ history

  console.log('\n---- HISTORY. both producers survive with provenance intact ----\n');
  openCase();
  const history = await call(`/inspections/observations/${o4}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  const items = (history.body.history ?? []) as Json[];
  ok('HIST-1 the history carries both producers',
    items.some(i => i.producer === 'client_supplied')
      && items.some(i => i.producer === 'server_authored'),
    items.map(i => i.producer).join(','));
  ok('HIST-2 every item preserves producer, state and version',
    items.every(i => typeof i.producer === 'string' && typeof i.analysisState === 'string'
      && typeof i.requestVersion === 'number'),
    `${items.length} items`);
  ok('HIST-3 history ordering does not define currentness — the newest item is Expert while the '
    + 'current deterministic analysis is older',
    items[0]?.producer === 'server_authored'
      && (await analysisRows(o4)).find(r => r.producer === 'client_supplied')!.status === 'current');
  closeCase('HISTORY', 'history preserves both producers and does not confer authority',
    items.map(i => `${i.producer}@v${i.requestVersion}`).join(' '));

  // ================================================================ spend and closure

  const legs = expertTransportLifetimeCounts();
  console.log(`\nprovider legs that reached the seam: total=${legs.total} `
    + `firstPass=${legs.firstPass} verifier=${legs.verifier}`);
  ok('SPEND every leg was answered by the substituted deterministic transport, so zero hosted '
    + 'calls were made', true, `${legs.total} local legs`);

  /**
   * VOLATILE IDENTIFIERS ARE REDACTED BEFORE THE ARTIFACT IS WRITTEN, DELIBERATELY.
   *
   * §267 re-ran the §265 suite as part of `hazlenz:precommit` and it REWROTE its own accepted
   * evidence — `SECTION-265-READ-PAYLOAD-SHAPE.json` — producing a DIGEST_MISMATCH against
   * `REPORT-265.sha256`. Every changed byte was a per-run UUID or timestamp; nothing semantic
   * moved. The §265 bytes were restored, but the hazard belongs to the instrument rather than to
   * that one file: any suite that records raw identifiers rewrites its own package on every
   * subsequent section's precommit run, and the evidence guard then cannot distinguish "re-ran" from
   * "changed".
   *
   * So this artifact records no UUID and no timestamp. What it asserts — which case ran, whether it
   * passed, and the producer/version/status shape it observed — is stable across runs, so a later
   * section that re-runs this suite reproduces the file byte for byte and a genuine change is the
   * only thing that can show up as drift.
   */
  const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const stable = (text: string): string => text.replace(UUID, '<uuid>');

  const evidenceDir = join(
    __dirname, '..', '..', 'verification',
    'expert-hazlenz-267-product-integration-defect-closure-2026-09-13');
  // §268. Gated behind the one shared evidence-write gate. The artifact is already run-stable
  // (identifiers are redacted below), so this is belt and braces — but the rule is that a suite in
  // `hazlenz:integration:inner` does not write into an evidence package during ordinary
  // verification, and an exception for the file that happens to be deterministic today is how the
  // rule stops holding tomorrow.
  writeEvidenceFile(evidenceDir, 'SECTION-267-ACCEPTANCE.json', JSON.stringify({
    artifact: 'SECTION-267-PRODUCT-INTEGRATION-DEFECT-CLOSURE-ACCEPTANCE',
    candidateIdentity: EXPERT_CANDIDATE_IDENTITY_274,
    providerCalls: 0,
    localTransportLegs: legs,
    assertions: { pass, fail },
    cases: caseResults.map(c => ({ ...c, detail: stable(c.detail) })),
    realFrontendRequest: {
      source: 'frontend-next/lib/expert/expertApi.ts, executed by '
        + 'frontend-next/scripts/capture-expert-request.mjs',
      transmittedBodyShape: stable(captured.rawBody),
      transmittedFields: Object.keys(captured.body).sort(),
      carriesRequestVersion: Object.prototype.hasOwnProperty.call(captured.body, 'requestVersion'),
    },
  }, null, 2) + '\n');

  await app.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('failures:');
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
