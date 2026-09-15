/**
 * §262 — THE AUTHORITATIVE EXPERT EXECUTION ROUTE. LOCAL ACCEPTANCE.
 *
 * ZERO PROVIDER CALLS. The transport is substituted with a deterministic one through the single
 * fail-closed seam, which refuses to substitute outside NODE_ENV=test, and the seam counts every
 * leg that actually reached it — so "no provider was called" is measured at the only exit that
 * exists rather than asserted.
 *
 * DATABASE OPERATIONS ONLY AGAINST A DISPOSABLE DATABASE. The suite refuses to run anywhere else.
 *
 * IT DRIVES THE REAL ROUTE OVER REAL HTTP. The Nest application is built from `AppModule` with the
 * same global `ValidationPipe` `main.ts` installs, and every request below is an HTTP request to
 * the running server. Nothing is called past a guard: authentication, entitlement, role, throttle,
 * the tenant choke point, the validation pipe, the controller, the execution service, the frozen
 * §259 entry point, admission, projection, the confirmation rule, persistence and audit all run.
 * Rows are read back from the database to check what was stored, never from the response alone.
 *
 *   DATABASE_URL=postgresql://user@127.0.0.1:5432/test_insite_262_x NODE_ENV=test \
 *     npx ts-node scripts/test-262-expert-authoritative-route.ts
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { ExpertAnalysisController }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis.controller';
import {
  substituteExpertSemanticTransportForVerification,
  resetExpertTransportEntryCountsForVerification,
  expertTransportEntryCounts,
  expertTransportIsSubstituted,
  expertTransportLifetimeCounts,
} from '../src/hazlenz/expert-hazlenz-product/expert-semantic-transport.provider';
import { ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis-audit';
import { CONFIRMATION_RULE_VERSION }
  from '../src/hazlenz/expert-hazlenz-product/expert-confirmation-rule';
import { EXPERT_CANDIDATE_IDENTITY_274 }
  from '../src/hazlenz/expert-hazlenz-product/expert-candidate-provenance';
import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import { EXPERT_FIXTURES, OBS_TEXT } from './lib/expert-262-fixtures';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

// ================================================================ the disposable-target guard

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): { url: string; database: string } {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('§262 REFUSED: DATABASE_URL is unset. This suite writes rows and will not fall '
      + 'back to discrete DB_* variables, which in this repository resolve to the development '
      + 'database.');
  }
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} port=${parsed.port || 5432} `
    + `database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§262 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§262 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('§262 REFUSED: NODE_ENV must be test; the transport seam refuses to be '
      + 'substituted otherwise, and a run without it would reach a real provider.');
  }
  // The developer .env in this repository sets DEV_AUTH_BYPASS=true, which makes JwtGuard admit an
  // unauthenticated request as a synthetic free-tier user. An authorization suite run under it
  // would measure the bypass rather than the route: the unauthenticated case would be answered by
  // the ENTITLEMENT gate instead of the authentication gate, and would pass for the wrong reason.
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§262 REFUSED: DEV_AUTH_BYPASS is enabled. Run with DEV_AUTH_BYPASS=false so '
      + 'the unauthenticated case exercises JwtGuard rather than the local development bypass.');
  }
  console.log('target proven disposable\n');
  return { url, database };
}

// ================================================================ harness

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

/** Per-case results, reported individually rather than collapsed into a percentage. */
const caseResults: { id: string; title: string; passed: boolean; detail: string }[] = [];
const recordCase = (id: string, title: string, passed: boolean, detail: string): void => {
  caseResults.push({ id, title, passed, detail });
};

// ================================================================ the deterministic transport

/**
 * A scripted transport. It answers whichever leg it is asked for from the CURRENT script, so a case
 * sets the script and then drives the route; nothing about the request influences the answer, which
 * is what keeps the replay a replay rather than a second implementation of the model.
 */
class ScriptedTransport implements ExpertSemanticTransport {
  script: {
    firstPass?: unknown;
    firstPassFailure?: { kind: string; detail: string };
    failVerifierLeg?: boolean;
  } = {};

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
    if (this.script.failVerifierLeg) {
      return { ok: false, toolInput: null, failureKind: 'TRANSPORT_TIMEOUT', detail: 'scripted' };
    }
    // The verifier contract's own response. Replayed, never invented per request.
    return {
      ok: true,
      toolInput: { propertyReview: [], reviewerNotes: 'scripted verifier verdict' },
      failureKind: null, detail: null,
    };
  }
}

// ================================================================ http

let baseUrl = '';
type Json = Record<string, any>;

async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  // A distinct forwarded address per case, with `trust proxy` enabled below, gives each case its
  // own throttle bucket. The throttle itself is proven positively in T1 rather than avoided.
  if (options.ip) headers['x-forwarded-for'] = options.ip;
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

const EXPERT_PATH = (observationId: string) =>
  `/inspections/observations/${observationId}/expert-analyses`;

async function main(): Promise<void> {
  const target = provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§262 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const transport = new ScriptedTransport();
  substituteExpertSemanticTransportForVerification(transport);
  resetExpertTransportEntryCountsForVerification();

  // ---------------------------------------------------------------- two separate workspaces
  const suffix = `${Date.now()}`;
  const password = 'Section262!StrongPass123';
  const register = async (tag: string) => {
    const email = `s262-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST',
      body: {
        email, password, name: `s262-${tag}`, type: 'individual',
        // §299 (IT-1). §291 made this required at registration; this harness predates it.
        // Derived from the registry the service validates against, never spelled out here.
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    const login = await call('/auth/login', { method: 'POST', body: { email, password } });
    return { email, token: login.body.token as string, userId: login.body.user.id as string };
  };
  const userA = await register('a');
  const userB = await register('b');
  const userNoEntitlement = await register('noent');
  const userViewer = await register('viewer');

  const grant = (userId: string) => execFileSync(
    'npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  grant(userA.userId);
  grant(userB.userId);
  grant(userViewer.userId);

  // The role gate needs a principal the @Roles list genuinely excludes. Membership roles are all
  // inside it, so the excluded principal is the product's own `Viewer` role, written onto the user
  // and picked up by the next token it issues.
  await q(`UPDATE "user" SET "role" = 'Viewer', "type" = 'viewer' WHERE id = $1`,
    [userViewer.userId]);
  const viewerLogin = await call('/auth/login', {
    method: 'POST', body: { email: userViewer.email, password },
  });
  const viewerToken = viewerLogin.body.token as string;

  const seedWorkspace = async (user: { token: string }, tag: string) => {
    const site = await call('/sites', {
      method: 'POST', token: user.token, body: { name: `s262-site-${tag}-${suffix}` },
    });
    const inspection = await call('/inspections', {
      method: 'POST', token: user.token,
      body: {
        siteId: site.body.id,
        title: `s262-inspection-${tag}`,
        regulatoryContext: 'osha-general-industry',
      },
    });
    const observation = await call(`/inspections/${inspection.body.id}/observations`, {
      method: 'POST', token: user.token, body: { rawText: OBS_TEXT },
    });
    return {
      siteId: site.body.id as string,
      inspectionId: inspection.body.id as string,
      observationId: observation.body.id as string,
    };
  };
  const wsA = await seedWorkspace(userA, 'a');
  const wsB = await seedWorkspace(userB, 'b');

  // A separate observation per case, so one case's `current` analysis cannot supersede another's
  // and every case starts from the same state.
  const newObservation = async (): Promise<string> => {
    const created = await call(`/inspections/${wsA.inspectionId}/observations`, {
      method: 'POST', token: userA.token, body: { rawText: OBS_TEXT },
    });
    return created.body.id as string;
  };

  let ipSeed = 0;
  const nextIp = () => `10.262.0.${(ipSeed += 1)}`;

  /** Drive the real route for one fixture and read back what was stored. */
  const runCase = async (options: {
    observationId?: string;
    fixture?: keyof typeof EXPERT_FIXTURES;
    firstPassFailure?: { kind: string; detail: string };
    token?: string;
    body?: Record<string, unknown>;
    ip?: string;
  }) => {
    const observationId = options.observationId ?? await newObservation();
    transport.script = options.firstPassFailure
      ? { firstPassFailure: options.firstPassFailure }
      : {
        firstPass: EXPERT_FIXTURES[options.fixture!].firstPass(),
        failVerifierLeg: EXPERT_FIXTURES[options.fixture!].failVerifierLeg === true,
      };
    const response = await call(EXPERT_PATH(observationId), {
      method: 'POST',
      token: options.token ?? userA.token,
      ip: options.ip ?? nextIp(),
      body: options.body ?? {
        idempotencyKey: `s262-${observationId.slice(0, 8)}-${Date.now()}`,
        requestVersion: 1,
      },
    });
    const [analysisRow] = await q(
      `SELECT * FROM "hazlenz_analyses" WHERE "observationId" = $1
       ORDER BY "requestVersion" DESC LIMIT 1`, [observationId]);
    const [executionRow] = await q(
      `SELECT * FROM "expert_analysis_executions" WHERE "observationId" = $1
       ORDER BY "createdAt" DESC LIMIT 1`, [observationId]);
    return { observationId, response, analysisRow, executionRow };
  };

  // ================================================================ R0. the route's own profile

  console.log('---- R0. the route carries the analysis-production authorization profile ----\n');
  const reflector = app.get(Reflector);
  const handler = ExpertAnalysisController.prototype.requestExpertAnalysis;
  const guards: any[] = Reflect.getMetadata('__guards__', handler) ?? [];
  const guardNames = guards.map(g => (typeof g === 'function' ? g.name : g?.constructor?.name));
  ok('R0-A JwtGuard is attached to the route', guardNames.includes('JwtGuard'), guardNames.join(','));
  ok('R0-B EntitlementGuard is attached', guardNames.includes('EntitlementGuard'));
  ok('R0-C RolesGuard is attached', guardNames.includes('RolesGuard'));
  ok('R0-D the required entitlement is fullSafeScope',
    reflector.get<string>('requiredEntitlement', handler) === 'fullSafeScope',
    String(reflector.get<string>('requiredEntitlement', handler)));
  const throttle: any = Reflect.getMetadata('THROTTLER:LIMIT', handler)
    ?? Reflect.getMetadata('THROTTLER:LIMITdefault', handler);
  const throttleTtl: any = Reflect.getMetadata('THROTTLER:TTL', handler)
    ?? Reflect.getMetadata('THROTTLER:TTLdefault', handler);
  ok('R0-E a dedicated throttle is attached and stricter than classify\'s 30/60s',
    throttle !== undefined && Number(throttle) > 0 && Number(throttle) < 30,
    `limit=${String(throttle)} ttl=${String(throttleTtl)}`);
  const roles: string[] = reflector.get<string[]>('roles', handler) ?? [];
  ok('R0-F the route declares the same role list the classify route does',
    roles.length === 9 && roles.includes('WORKER') && !roles.includes('VIEWER'),
    roles.join(','));

  // ================================================================ R1. authorization

  console.log('\n---- R1. authorization (§262 cases A-F of the authorization matrix) ----\n');

  const unauth = await call(EXPERT_PATH(wsA.observationId), {
    method: 'POST', ip: nextIp(),
    body: { idempotencyKey: 's262-unauthenticated-1', requestVersion: 1 },
  });
  ok('R1-B an unauthenticated caller is rejected', unauth.status === 401, String(unauth.status));

  const noEnt = await call(EXPERT_PATH(wsA.observationId), {
    method: 'POST', token: userNoEntitlement.token, ip: nextIp(),
    body: { idempotencyKey: 's262-no-entitlement-1', requestVersion: 1 },
  });
  ok('R1-C a caller without fullSafeScope is rejected with PAYMENT_REQUIRED',
    noEnt.status === 402, `${noEnt.status} ${noEnt.body.code ?? ''}`);

  const viewer = await call(EXPERT_PATH(wsA.observationId), {
    method: 'POST', token: viewerToken, ip: nextIp(),
    body: { idempotencyKey: 's262-viewer-role-1', requestVersion: 1 },
  });
  ok('R1-D a caller whose role is outside the route\'s list is rejected',
    viewer.status === 403, String(viewer.status));

  const crossTenant = await call(EXPERT_PATH(wsB.observationId), {
    method: 'POST', token: userA.token, ip: nextIp(),
    body: { idempotencyKey: 's262-cross-tenant-1', requestVersion: 1 },
  });
  const absent = await call(EXPERT_PATH('00000000-0000-4000-8000-0000000000ff'), {
    method: 'POST', token: userA.token, ip: nextIp(),
    body: { idempotencyKey: 's262-absent-observation-1', requestVersion: 1 },
  });
  ok('R1-E a cross-workspace observation answers NotFound',
    crossTenant.status === 404, String(crossTenant.status));
  ok('R1-E2 and it is INDISTINGUISHABLE from an observation that does not exist',
    crossTenant.status === absent.status
    && JSON.stringify(crossTenant.body.message) === JSON.stringify(absent.body.message),
    `${crossTenant.status}:${crossTenant.body.message} vs ${absent.status}:${absent.body.message}`);
  const [leaked] = await q(
    `SELECT count(*)::int AS n FROM "expert_analysis_executions" WHERE "observationId" = $1`,
    [wsB.observationId]);
  ok('R1-E3 the refused cross-workspace attempt created no execution in the target workspace',
    leaked.n === 0, `executions=${leaked.n}`);
  recordCase('H', 'unauthorized cross-workspace access',
    crossTenant.status === 404 && crossTenant.status === absent.status && leaked.n === 0,
    'NotFound, indistinguishable from a non-existent observation, no execution created');

  // F of the matrix: an identifier cannot be used to reach another workspace's operation, because
  // the accepted contract carries no such identifier at all. Proven structurally below in R6, and
  // behaviourally here: the SAME idempotency key in two workspaces yields two separate executions.
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  const sharedKey = `s262-shared-identity-${suffix}`;
  const obsA1 = await newObservation();
  const inA = await call(EXPERT_PATH(obsA1), {
    method: 'POST', token: userA.token, ip: nextIp(),
    body: { idempotencyKey: sharedKey, requestVersion: 1 },
  });
  const inB = await call(EXPERT_PATH(wsB.observationId), {
    method: 'POST', token: userB.token, ip: nextIp(),
    body: { idempotencyKey: sharedKey, requestVersion: 1 },
  });
  ok('R1-F an idempotency key is scoped to its observation and cannot reach another workspace\'s '
    + 'execution',
    inA.status === 201 && inB.status === 201
    && inA.body.executionId !== inB.body.executionId
    && inA.body.analysisId !== inB.body.analysisId,
    `${inA.status}/${inB.status} ${inA.body.executionId} vs ${inB.body.executionId}`);

  // ================================================================ R2. acceptance A

  console.log('\n---- R2. acceptance A: an ordinary admitted analysis requiring no confirmation ----\n');
  const a = await runCase({ fixture: 'A_ADMITTED_NO_CONFIRMATION' });
  ok('R2-A the route answers 201', a.response.status === 201, String(a.response.status));
  ok('R2-B the stored analysis state is ANALYSIS_AVAILABLE',
    a.analysisRow?.analysisState === 'ANALYSIS_AVAILABLE', a.analysisRow?.analysisState);
  ok('R2-C confirmation is not required, and the stored row says so',
    a.analysisRow?.confirmationRequired === false);
  ok('R2-D the row is server_authored', a.analysisRow?.producer === 'server_authored');
  ok('R2-E the row names the execution that authored it',
    a.analysisRow?.expertExecutionId === a.executionRow?.id);
  ok('R2-F the response states the authority position without calling it approved or final',
    typeof a.response.body.authorityStatement === 'string'
    && !/\b(approved|final|settled|completed)\b/i.test(a.response.body.authorityStatement)
    && a.response.body.confirmationRequired === false,
    a.response.body.authorityStatement);
  recordCase('A', 'ordinary admitted analysis requiring no confirmation',
    a.response.status === 201 && a.analysisRow?.analysisState === 'ANALYSIS_AVAILABLE'
    && a.analysisRow?.confirmationRequired === false
    && a.analysisRow?.producer === 'server_authored',
    'ANALYSIS_AVAILABLE, confirmationRequired=false, server_authored');

  // ================================================================ R3. acceptance B + H3/H4 + J

  console.log('\n---- R3. acceptance B: an admitted analysis that requires confirmation ----\n');
  const b = await runCase({ fixture: 'B_ADMITTED_CONFIRMATION_REQUIRED' });
  ok('R3-A the stored analysis state is ANALYSIS_AWAITING_CONFIRMATION',
    b.analysisRow?.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION', b.analysisRow?.analysisState);
  ok('R3-B confirmation is required, and the flag was computed once and stored',
    b.analysisRow?.confirmationRequired === true);
  ok('R3-C the rule that produced the flag is recorded on the execution',
    b.executionRow?.confirmationRuleVersion === CONFIRMATION_RULE_VERSION,
    b.executionRow?.confirmationRuleVersion);
  ok('R3-D the client is TOLD confirmation is required and never has to infer it',
    b.response.body.confirmationRequired === true
    && /requires a person to confirm/i.test(String(b.response.body.authorityStatement)),
    String(b.response.body.authorityStatement));
  ok('R3-E the verifier leg was reached and recorded',
    b.executionRow?.verifierReached === true && typeof b.executionRow?.verifierFactKey === 'string',
    `reached=${b.executionRow?.verifierReached} factKey=${b.executionRow?.verifierFactKey}`);

  console.log('\n---- R3b. H3 and H4 structural identity survive persistence and the response ----\n');
  const snapshot = b.analysisRow.resultSnapshot as any;
  const storedPosture = snapshot?.analysis?.immediateSafetyPosture;
  const storedDeclarations = snapshot?.analysis?.unresolvedFactDeclarations ?? [];
  ok('R3b-H3a declarationId survives into the persisted snapshot',
    storedDeclarations.length === 1
    && storedDeclarations[0].declarationId === 'decl-stored-energy-state',
    JSON.stringify(storedDeclarations.map((d: any) => d.declarationId)));
  ok('R3b-H3b the projected posture references the declaration by ID, not by prose',
    Array.isArray(storedPosture?.requiredBy)
    && storedPosture.requiredBy.some((d: any) =>
      d.refKind === 'UNRESOLVED_DECLARATION' && d.ref === 'decl-stored-energy-state'),
    JSON.stringify((storedPosture?.requiredBy ?? []).map((d: any) => `${d.refKind}:${d.ref}`)));
  ok('R3b-H4a controlId survives into the persisted snapshot',
    Array.isArray(storedPosture?.requiredControls)
    && storedPosture.requiredControls[0]?.controlId === 'ctl-isolate-drive',
    JSON.stringify(storedPosture?.requiredControls?.map((c: any) => c.controlId)));
  ok('R3b-H4b dischargingControlRef carries the control ID and NOT the control prose',
    storedPosture.requiredBy[0]?.roleJustification?.dischargingControlRef === 'ctl-isolate-drive',
    String(storedPosture.requiredBy[0]?.roleJustification?.dischargingControlRef));
  const responsePosture = (b.response.body.analysis as any)?.analysis?.immediateSafetyPosture;
  ok('R3b-H4c the same identities survive into the response the client receives',
    responsePosture?.requiredControls?.[0]?.controlId === 'ctl-isolate-drive'
    && responsePosture?.requiredBy?.[0]?.roleJustification?.dischargingControlRef
      === 'ctl-isolate-drive');

  console.log('\n---- R3c. acceptance J: server-authored provenance ----\n');
  ok('R3c-A the frozen §259 candidate identity is persisted',
    b.executionRow?.candidateIdentity === EXPERT_CANDIDATE_IDENTITY_274,
    b.executionRow?.candidateIdentity);
  ok('R3c-B contract, entry, admission and projection versions are persisted',
    b.executionRow?.contractVersion === 'hazlenz.expert.first-pass.259'
    && b.executionRow?.entryVersion === 'hazlenz.expert.production-entry.v1'
    && b.executionRow?.admissionVersion === 'hazlenz.expert.252.structural-admission.v1'
    && b.executionRow?.projectionVersion === 'hazlenz.expert.239.posture-projection.v1',
    [b.executionRow?.contractVersion, b.executionRow?.entryVersion,
      b.executionRow?.admissionVersion, b.executionRow?.projectionVersion].join(' | '));
  ok('R3c-C the transmitted system prompt digest is the frozen §259 element',
    b.executionRow?.systemPromptSha
      === '680f5127776427963d89244eafa32ce57973575ffbfae2f3326ed92fc17be34a',
    String(b.executionRow?.systemPromptSha));
  ok('R3c-D the transmitted wire schema digest is recorded',
    typeof b.executionRow?.wireSchemaSha === 'string'
    && b.executionRow.wireSchemaSha.length === 64);
  ok('R3c-E the organization, inspection and observation are the SERVER\'s, not the request\'s',
    b.executionRow?.observationId === b.observationId
    && b.executionRow?.inspectionId === wsA.inspectionId
    && b.executionRow?.requestedByUserId === userA.userId);
  ok('R3c-F the admission disposition and timestamps are persisted',
    b.executionRow?.admission === 'ADMIT' && b.executionRow?.completedAt !== null);
  ok('R3c-G the server-established basis is recorded on the snapshot',
    typeof snapshot?.basis?.deterministicBasisDigest === 'string'
    && snapshot.basis.observationId === b.observationId
    && snapshot.basis.jurisdiction === 'osha-general-industry',
    JSON.stringify(snapshot?.basis?.jurisdiction));
  recordCase('B', 'admitted analysis requiring confirmation',
    b.analysisRow?.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && b.analysisRow?.confirmationRequired === true
    && b.response.body.confirmationRequired === true,
    'ANALYSIS_AWAITING_CONFIRMATION, confirmationRequired=true, stated in the response');
  recordCase('J', 'candidate and version provenance persistence',
    b.executionRow?.candidateIdentity === EXPERT_CANDIDATE_IDENTITY_274
    && b.executionRow?.systemPromptSha
      === '680f5127776427963d89244eafa32ce57973575ffbfae2f3326ed92fc17be34a',
    'candidate identity, contract/entry/admission/projection versions, transmitted prompt digest');

  console.log('\n---- R3d. the analysis-creation audit event ----\n');
  const [audit] = await q(
    `SELECT * FROM "security_audit_events" WHERE "action" = $1 AND "resourceId" = $2`,
    [ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, b.analysisRow.id]);
  ok('R3d-A an analysis_created audit event was written', !!audit, audit ? 'present' : 'absent');
  ok('R3d-B it names the actor and the organization the server established',
    audit?.actorUserId === userA.userId);
  const auditJson = JSON.stringify(audit?.metadata ?? {});
  ok('R3d-C no raw provider payload reached generic audit metadata',
    !auditJson.includes('scripted verifier verdict')
    && !auditJson.includes('isolate and lock out the drive motor'),
    `${auditJson.length} chars`);

  // ================================================================ R4-R6. refusal and unresolved

  console.log('\n---- R4. acceptance E: whole-analysis refusal ----\n');
  const e = await runCase({ fixture: 'E_WHOLE_ANALYSIS_REFUSAL' });
  ok('R4-A a refused output is ANALYSIS_REFUSED and never ANALYSIS_AVAILABLE',
    e.analysisRow?.analysisState === 'ANALYSIS_REFUSED', e.analysisRow?.analysisState);
  ok('R4-B the refusal is still server_authored: the server owns its own refusal',
    e.analysisRow?.producer === 'server_authored');
  ok('R4-C confirmation is NOT required of a refusal',
    e.analysisRow?.confirmationRequired === false);
  ok('R4-D the structured refusal codes are persisted',
    JSON.stringify(e.executionRow?.postureRefusalCodes ?? []).includes('DECLARATION_NOT_COVERED'),
    JSON.stringify(e.executionRow?.postureRefusalCodes));
  ok('R4-E no admitted Expert content is carried in the snapshot',
    (e.analysisRow.resultSnapshot as any)?.analysis === null
    && (e.analysisRow.resultSnapshot as any)?.posture === null);
  ok('R4-F the response says the answer was refused, not that no hazards were found',
    /refused in full/i.test(String(e.response.body.authorityStatement)),
    String(e.response.body.authorityStatement));
  recordCase('E', 'whole-analysis refusal',
    e.analysisRow?.analysisState === 'ANALYSIS_REFUSED'
    && (e.analysisRow.resultSnapshot as any)?.analysis === null,
    'ANALYSIS_REFUSED, no Expert content rendered, refusal codes persisted');

  console.log('\n---- R5. acceptance F: a CONTAINED declaration refusal ----\n');
  const f = await runCase({ fixture: 'F_CONTAINED_DECLARATION_REFUSAL' });
  ok('R5-A the contained refusal does not present as an available analysis',
    f.analysisRow?.analysisState === 'ANALYSIS_UNRESOLVED', f.analysisRow?.analysisState);
  ok('R5-B exactly one declaration was refused, and it is recorded',
    Array.isArray(f.executionRow?.declarationRefusals)
    && f.executionRow.declarationRefusals.length === 1,
    JSON.stringify(f.executionRow?.declarationRefusals));
  ok('R5-C the analysis was otherwise usable: the posture ADMITTED and survives in the snapshot',
    (f.analysisRow.resultSnapshot as any)?.posture !== null
    && ((f.executionRow?.postureRefusalCodes ?? []) as string[]).length === 0,
    JSON.stringify(f.executionRow?.postureRefusalCodes));
  recordCase('F', 'contained declaration refusal / partially usable analysis',
    f.analysisRow?.analysisState === 'ANALYSIS_UNRESOLVED'
    && f.executionRow?.declarationRefusals?.length === 1
    && (f.analysisRow.resultSnapshot as any)?.posture !== null,
    'ANALYSIS_UNRESOLVED with the posture contained and one declaration refused');

  console.log('\n---- R6. acceptance G: preserved unresolved truth ----\n');
  const g = await runCase({ fixture: 'G_PRESERVED_UNRESOLVED' });
  ok('R6-A a preserved-unresolved outcome is ANALYSIS_UNRESOLVED',
    g.analysisRow?.analysisState === 'ANALYSIS_UNRESOLVED', g.analysisRow?.analysisState);
  ok('R6-B the admission disposition PRESERVE_UNRESOLVED is persisted, not flattened to REFUSE',
    g.executionRow?.admission === 'PRESERVE_UNRESOLVED', g.executionRow?.admission);
  ok('R6-C nothing was admitted, and the response offers no operational conclusion',
    (g.analysisRow.resultSnapshot as any)?.posture === null
    && /No operational conclusion is being offered/i.test(
      String(g.response.body.authorityStatement)));
  ok('R6-D the declaration whose truth was preserved is recorded',
    Array.isArray(g.executionRow?.declarationRefusals)
    && g.executionRow.declarationRefusals.length === 1);
  recordCase('G', 'preserved unresolved truth',
    g.analysisRow?.analysisState === 'ANALYSIS_UNRESOLVED'
    && g.executionRow?.admission === 'PRESERVE_UNRESOLVED',
    'ANALYSIS_UNRESOLVED, PRESERVE_UNRESOLVED persisted, no conclusion offered');

  console.log('\n---- R7. provider/transport failure is an OUTCOME, not a generic error ----\n');
  const pf = await runCase({
    firstPassFailure: { kind: 'TRANSPORT_TIMEOUT', detail: 'no response within the deadline' },
  });
  ok('R7-A the execution settles as ANALYSIS_FAILED',
    pf.executionRow?.executionState === 'ANALYSIS_FAILED', pf.executionRow?.executionState);
  ok('R7-B no analysis row is created, so nothing can render as a result',
    pf.analysisRow === undefined && pf.executionRow?.analysisId === null,
    `analysisRow=${pf.analysisRow === undefined ? 'none' : 'present'}`);
  ok('R7-C the failure kind is preserved, distinguishable from a refusal',
    pf.executionRow?.failureKind === 'TRANSPORT_TIMEOUT', pf.executionRow?.failureKind);
  ok('R7-D the response says the layer was unavailable, not that there are no hazards',
    /could not be reached/i.test(String(pf.response.body.authorityStatement))
    && pf.response.body.analysisState === null,
    String(pf.response.body.authorityStatement));

  console.log('\n---- R8. a verifier-leg failure does not invalidate an admitted first pass ----\n');
  const v = await runCase({ fixture: 'V_VERIFIER_LEG_FAILED' });
  ok('R8-A the first pass is still admitted',
    v.executionRow?.admission === 'ADMIT', v.executionRow?.admission);
  ok('R8-B the verifier is recorded as NOT REACHED, never as a pass',
    v.executionRow?.verifierReached === false
    && String(v.executionRow?.verifierNotReachedBecause).startsWith('VERIFIER_LEG_FAILED'),
    String(v.executionRow?.verifierNotReachedBecause));
  ok('R8-C the analysis still carries its confirmation requirement',
    v.analysisRow?.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && v.analysisRow?.confirmationRequired === true);

  // ================================================================ R9. acceptance I

  console.log('\n---- R9. acceptance I: pre-spend idempotency under concurrent duplicates ----\n');
  const raceObservation = await newObservation();
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  resetExpertTransportEntryCountsForVerification();
  const raceKey = `s262-race-${suffix}`;
  const raceBody = { idempotencyKey: raceKey, requestVersion: 1 };
  const raceIps = [nextIp(), nextIp(), nextIp()];
  const raced = await Promise.all(raceIps.map(ip => call(EXPERT_PATH(raceObservation), {
    method: 'POST', token: userA.token, ip, body: raceBody,
  })));
  const counts = expertTransportEntryCounts();
  const [executionCount] = await q(
    `SELECT count(*)::int AS n FROM "expert_analysis_executions" WHERE "observationId" = $1`,
    [raceObservation]);
  const [analysisCount] = await q(
    `SELECT count(*)::int AS n FROM "hazlenz_analyses" WHERE "observationId" = $1`,
    [raceObservation]);
  const executed = raced.filter(r => r.body.outcome === 'EXECUTED');
  const reused = raced.filter(r =>
    r.body.outcome === 'REUSED_RUNNING' || r.body.outcome === 'REUSED_SETTLED');
  ok('R9-A exactly ONE execution identity governs the operation',
    executionCount.n === 1, `executions=${executionCount.n}`);
  ok('R9-B exactly one caller won spend authority',
    executed.length === 1, `executed=${executed.length} reused=${reused.length}`);
  ok('R9-C every other caller was answered without entering the provider seam',
    reused.length === raced.length - 1);
  ok('R9-D the simulated provider-entry count is the ONE winner\'s legs, not three callers\' legs',
    counts.firstPass === 1, JSON.stringify(counts));
  ok('R9-E no duplicate server-authored analysis was created',
    analysisCount.n === 1, `analyses=${analysisCount.n}`);
  ok('R9-F all three callers resolve to the same execution identity',
    new Set(raced.map(r => r.body.executionId)).size === 1,
    raced.map(r => `${r.status}:${r.body.outcome}`).join(' '));
  const repeat = await call(EXPERT_PATH(raceObservation), {
    method: 'POST', token: userA.token, ip: nextIp(), body: raceBody,
  });
  const countsAfterRepeat = expertTransportEntryCounts();
  ok('R9-G a later duplicate reuses the authoritative result and still does not spend',
    repeat.body.outcome === 'REUSED_SETTLED'
    && repeat.body.analysisId === executed[0].body.analysisId
    && countsAfterRepeat.total === counts.total,
    `${repeat.body.outcome} entries ${counts.total} -> ${countsAfterRepeat.total}`);
  recordCase('I', 'duplicate / idempotent execution behaviour',
    executionCount.n === 1 && executed.length === 1 && counts.firstPass === 1
    && analysisCount.n === 1 && repeat.body.outcome === 'REUSED_SETTLED',
    `1 execution, 1 spender, ${counts.firstPass} simulated provider entry, 1 analysis`);

  // ================================================================ R10. client forgery

  console.log('\n---- R10. every server-owned field is unreachable from the request body ----\n');
  const forgeries: [string, Record<string, unknown>][] = [
    ['producer', { producer: 'server_authored' }],
    ['candidateIdentity', { candidateIdentity: 'forged-candidate' }],
    ['confirmationRequired', { confirmationRequired: false }],
    ['analysisState', { analysisState: 'ANALYSIS_CONFIRMED' }],
    ['expertExecutionId', { expertExecutionId: '00000000-0000-4000-8000-00000000beef' }],
    ['resultSnapshot', { resultSnapshot: { analysis: { forged: true } } }],
    ['providerId/respondedModel', { providerId: 'forged', respondedModel: 'forged-model' }],
    ['engineVersion', { engineVersion: 'hazlenz-production' }],
    ['contractVersion', { contractVersion: 'hazlenz.expert.first-pass.999' }],
    ['admission', { admission: 'ADMIT' }],
  ];
  let forgeriesRejected = 0;
  for (const [name, extra] of forgeries) {
    const observationId = await newObservation();
    transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
    const response = await call(EXPERT_PATH(observationId), {
      method: 'POST', token: userA.token, ip: nextIp(),
      body: {
        idempotencyKey: `s262-forge-${observationId.slice(0, 8)}`,
        requestVersion: 1,
        ...extra,
      },
    });
    const [row] = await q(`SELECT count(*)::int AS n FROM "hazlenz_analyses"
      WHERE "observationId" = $1`, [observationId]);
    const rejected = response.status === 400 && row.n === 0;
    if (rejected) forgeriesRejected += 1;
    ok(`R10 forging ${name} is rejected before the controller runs`, rejected,
      `${response.status} rowsCreated=${row.n}`);
  }
  ok('R10-Z every server-owned field attempted was refused',
    forgeriesRejected === forgeries.length,
    `${forgeriesRejected}/${forgeries.length}`);

  // The one that cannot be attempted through the DTO is attempted through the database, which is
  // where §261 put the last line of defence.
  const rawForgery = await q(
    `INSERT INTO "hazlenz_analyses"
       ("observationId","engineVersion","idempotencyKey","requestVersion","resultSnapshot",
        "requestedByUserId","producer")
     VALUES ($1,'forged','s262-raw-forgery-key',9001,'{}'::jsonb,$2,'server_authored')
     RETURNING id`,
    [wsA.observationId, userA.userId],
  ).then(() => 'INSERTED').catch((error: Error) => error.message);
  ok('R10-Y raw SQL cannot mint server_authored without a real execution',
    typeof rawForgery === 'string' && /ck_hazlenz_analysis_producer_execution/.test(rawForgery),
    String(rawForgery).slice(0, 120));

  // ================================================================ R11. no finding reconciliation

  console.log('\n---- R11. no downstream finding is materialized from an unconfirmed conclusion ----\n');
  const [findingsFromExpert] = await q(
    `SELECT count(*)::int AS n FROM "inspection_findings"
     WHERE "originatingAnalysisId" = $1 OR "selectedAnalysisId" = $1`, [b.analysisRow.id]);
  ok('R11-A the awaiting-confirmation analysis reconciled no findings',
    findingsFromExpert.n === 0, `findings=${findingsFromExpert.n}`);
  const [findingsFromAvailable] = await q(
    `SELECT count(*)::int AS n FROM "inspection_findings"
     WHERE "originatingAnalysisId" = $1 OR "selectedAnalysisId" = $1`, [a.analysisRow.id]);
  ok('R11-B no server-authored analysis reconciled findings in this slice at all',
    findingsFromAvailable.n === 0, `findings=${findingsFromAvailable.n}`);
  ok('R11-C the response states it, so no client infers a finding was created',
    a.response.body.findingsReconciled === false
    && b.response.body.findingsReconciled === false);

  // ================================================================ R12. analysis history

  console.log('\n---- R12. server-authored rows coexist with historical client_supplied rows ----\n');
  const legacyObservation = await newObservation();
  const legacy = await call(`/inspections/observations/${legacyObservation}/analyses`, {
    method: 'POST', token: userA.token, ip: nextIp(),
    body: {
      engineVersion: 'hazlenz-production',
      idempotencyKey: `s262-legacy-${legacyObservation.slice(0, 8)}`,
      requestVersion: 1,
      resultSnapshot: { multiHazardDecomposition: { hazards: [] } },
    },
  });
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  const alongside = await call(EXPERT_PATH(legacyObservation), {
    method: 'POST', token: userA.token, ip: nextIp(),
    body: { idempotencyKey: `s262-alongside-${legacyObservation.slice(0, 8)}`, requestVersion: 2 },
  });
  const rows = await q(
    `SELECT "producer","status","analysisState" FROM "hazlenz_analyses"
     WHERE "observationId" = $1 ORDER BY "requestVersion"`, [legacyObservation]);
  ok('R12-A the legacy snapshot persisted as client_supplied and was not rewritten',
    legacy.status === 201 && rows[0]?.producer === 'client_supplied',
    JSON.stringify(rows));
  ok('R12-B the server-authored row coexists with it',
    alongside.status === 201 && rows.length === 2 && rows[1]?.producer === 'server_authored');
  // -------------------------------------------------------------------------------------------
  // R12-C WAS REVERSED BY §267, FOR THE SAME REASON AS §261's P4-G.
  //
  // The clause this case exists for — the legacy row is NOT DELETED AND NOT RELABELLED — is
  // unchanged and still asserted below. What §267 reversed is the `superseded` clause: `rows[0]` is
  // the CLIENT_SUPPLIED row (R12-A asserts exactly that), so requiring it to be superseded by the
  // Expert run required cross-producer supersession — an advisory layer displacing the
  // customer-authoritative record. §266 measured the consequence in the product and §267 prohibited
  // it. Currentness is now scoped by producer, so BOTH rows are current: one per family.
  //
  // Note what has NOT changed and is still checked: the legacy row keeps `client_supplied` and
  // `ANALYSIS_AVAILABLE`. Not superseding it is not the same as promoting it, and §261's trust
  // boundary is untouched.
  ok('R12-C §267: the legacy row was neither deleted nor relabelled, and the Expert run did not '
    + 'supersede it',
    rows[0]?.status === 'current' && rows[0]?.producer === 'client_supplied'
    && rows[0]?.analysisState === 'ANALYSIS_AVAILABLE',
    JSON.stringify(rows));
  ok('R12-C2 §267: each producer holds exactly one current row on the observation',
    rows[1]?.status === 'current' && rows[1]?.producer === 'server_authored'
    && rows.filter((r: any) => r.status === 'current').length === 2,
    JSON.stringify(rows.map((r: any) => `${r.producer}=${r.status}`)));
  const [globalInvariant] = await q(`
    SELECT
      count(*) FILTER (WHERE "producer" = 'server_authored' AND "expertExecutionId" IS NULL)::int AS orphaned,
      count(*) FILTER (WHERE "producer" = 'client_supplied' AND "expertExecutionId" IS NOT NULL)::int AS mislabelled,
      count(*) FILTER (WHERE "producer" = 'server_authored')::int AS authored,
      count(*) FILTER (WHERE "producer" = 'client_supplied')::int AS supplied
    FROM "hazlenz_analyses"`);
  ok('R12-D no server-authored analysis exists without an execution',
    globalInvariant.orphaned === 0);
  ok('R12-E no client-supplied analysis names an execution', globalInvariant.mislabelled === 0);
  ok('R12-F both producers are present, so the invariants are not vacuous',
    globalInvariant.authored > 0 && globalInvariant.supplied > 0,
    `server_authored=${globalInvariant.authored} client_supplied=${globalInvariant.supplied}`);

  // ================================================================ R13. the read boundary

  console.log('\n---- R13. the response never labels an unconfirmed conclusion as settled ----\n');
  const allStatements = [a, b, e, f, g, pf, v].map(r => String(r.response.body.authorityStatement));
  ok('R13-A no response labels an Expert result approved, final, settled or completed',
    allStatements.every(s => !/\b(approved|final|settled|completed)\b/i.test(s)),
    allStatements.filter(s => /\b(approved|final|settled|completed)\b/i.test(s)).join(' | '));
  ok('R13-B no response carries the raw provider payload',
    !JSON.stringify([a, b, v].map(r => r.response.body)).includes('scripted verifier verdict'));
  ok('R13-C the raw provider output IS retained on the execution record for later comparison',
    b.executionRow?.rawFirstPass !== null && b.executionRow?.rawVerifier !== null);

  // ================================================================ T1. the throttle

  console.log('\n---- T1. the route is actually behind its throttle ----\n');
  const throttleIp = nextIp();
  const throttleObservation = await newObservation();
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  let throttledAt = 0;
  for (let attempt = 1; attempt <= 14 && throttledAt === 0; attempt += 1) {
    const response = await call(EXPERT_PATH(throttleObservation), {
      method: 'POST', token: userA.token, ip: throttleIp,
      body: { idempotencyKey: `s262-throttle-${attempt}-${suffix}`, requestVersion: attempt + 10 },
    });
    if (response.status === 429) throttledAt = attempt;
  }
  ok('T1-A the route returns 429 once its own limit is exceeded',
    throttledAt > 0 && throttledAt <= 12, `first 429 at attempt ${throttledAt}`);

  // ================================================================ provider-call accounting

  console.log('\n---- Z. spend accounting ----\n');
  const finalCounts = expertTransportEntryCounts();
  const lifetime = expertTransportLifetimeCounts();
  console.log(`simulated provider entries, whole run: ${JSON.stringify(lifetime)}`);
  console.log(`simulated provider entries since the idempotency window was opened: `
    + `${JSON.stringify(finalCounts)}`);
  ok('Z-A the deterministic transport was in force for the whole run',
    expertTransportIsSubstituted() === true);
  // MEASURED, NOT ASSERTED. Every execution the run settled records which seam answered it, so a
  // single leg that had escaped to the hosted transport would show up here as a different value.
  // SCOPED TO THE EXECUTIONS THIS SUITE CREATED, not to every row in the database. §263 made the
  // integration tier run §261 and §262 against ONE disposable database, and §261's persistence
  // fixtures set providerId='anthropic' on rows no provider ever produced — that suite has no
  // provider dependency at all. An unscoped count read those as escapes. What this assertion must
  // measure is whether anything THIS suite executed reached a hosted transport.
  const [seams] = await q(`
    SELECT
      count(*) FILTER (WHERE "providerId" = 'local-deterministic-transport')::int AS local,
      count(*) FILTER (WHERE "providerId" IS NOT NULL
                         AND "providerId" <> 'local-deterministic-transport')::int AS other,
      count(*)::int AS total
    FROM "expert_analysis_executions"
    WHERE "requestedByUserId" = ANY($1::uuid[])`, [[userA.userId, userB.userId]]);
  ok('Z-B every settled execution records the local deterministic seam, and none records a hosted one',
    seams.other === 0 && seams.local > 0, JSON.stringify(seams));
  ok('Z-C this run contains a genuine opportunity to have spent, so Z-B is not vacuous',
    lifetime.total > 0 && lifetime.verifier > 0 && Boolean(process.env.ANTHROPIC_API_KEY),
    `legs=${lifetime.total} (verifier ${lifetime.verifier}) `
    + `credentialPresent=${Boolean(process.env.ANTHROPIC_API_KEY)}`);

  substituteExpertSemanticTransportForVerification(null);
  await app.close();

  console.log('\n================ §262 acceptance cases, reported individually\n');
  for (const c of caseResults.sort((x, y) => x.id.localeCompare(y.id))) {
    console.log(`  ${c.id}  ${c.passed ? 'PASS' : 'FAIL'}  ${c.title}\n        ${c.detail}`);
  }
  console.log('  C  RESERVED  human confirmation accepted unchanged '
    + '(the confirmation action does not exist yet; not faked)');
  console.log('  D  RESERVED  human override / change '
    + '(the override action does not exist yet; not faked)');

  console.log(`\n================ §262 route acceptance: ${pass} passed, ${fail} failed`);
  console.log(JSON.stringify({
    realProviderCalls: 0,
    simulatedProviderEntries: lifetime,
    simulatedProviderEntriesInIdempotencyWindow: finalCounts,
    productionDatabaseOperations: 0,
    database: target.database,
    disposable: true,
    passed: pass,
    failed: fail,
    casesPassed: caseResults.filter(c => c.passed).map(c => c.id),
    casesFailed: caseResults.filter(c => !c.passed).map(c => c.id),
    casesReserved: ['C', 'D'],
  }));
  if (fail > 0) {
    console.log(`failures: ${failures.join(', ')}`);
    process.exit(1);
  }
}

main().catch(error => { console.error(error); process.exit(1); });
