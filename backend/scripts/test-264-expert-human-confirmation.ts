/**
 * §264 — THE HUMAN CONFIRMATION AND OVERRIDE BOUNDARY. TIER 2, OVER REAL HTTP.
 *
 * ZERO PROVIDER CALLS: the transport is substituted through the §262 fail-closed seam, which
 * refuses to substitute outside NODE_ENV=test, and the seam counts every leg that reached it.
 * DATABASE OPERATIONS ONLY against a disposable database, created and dropped by the §263 wrapper.
 *
 * Every request below is a real HTTP request to a running application built from AppModule with the
 * same global ValidationPipe main.ts installs. Nothing is called past a guard, and every assertion
 * about what was stored is read back from the database rather than from the response.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { ExpertAnalysisController }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis.controller';
import {
  substituteExpertSemanticTransportForVerification, expertTransportLifetimeCounts,
} from '../src/hazlenz/expert-hazlenz-product/expert-semantic-transport.provider';
import { EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis-audit';
import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import { EXPERT_FIXTURES, OBS_TEXT } from './lib/expert-262-fixtures';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): { url: string; database: string } {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§264 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§264 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§264 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§264 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§264 REFUSED: DEV_AUTH_BYPASS is enabled; the authorization cases would '
      + 'measure the bypass rather than the route.');
  }
  console.log('target proven disposable\n');
  return { url, database };
}

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};
const caseResults: { id: string; title: string; passed: boolean; detail: string }[] = [];
/** Which guard actually rejected the loser, reported rather than assumed. */
let concurrencyMechanism = 'NOT_EXERCISED';

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

const SUBJECT_REF = { refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state' };
const EXPERT_CLAIM = 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES';
const HUMAN_REPLACEMENT = 'CONTROLS_WHETHER_WORK_CONTINUES';

async function main(): Promise<void> {
  const target = provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§264 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const transport = new ScriptedTransport();
  substituteExpertSemanticTransportForVerification(transport);

  const suffix = `${Date.now()}`;
  const password = 'Section264!StrongPass123';
  // EVERY AUTH CALL GETS ITS OWN FORWARDED ADDRESS. `/auth/login` is throttled at 5 per minute per
  // caller, and this suite authenticates six times. Sharing one address silently starved the sixth
  // login, which returned no token — and the resulting `undefined` bearer made the concurrency case
  // answer 404 as though it were a tenant refusal. A 429 that turns into a plausible 404 three
  // assertions later is exactly the kind of thing a test must not absorb.
  let authIp = 0;
  const register = async (tag: string) => {
    const email = `s264-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST', ip: `10.264.9.${(authIp += 1)}`,
      body: { email, password, name: `s264-${tag}`, type: 'individual' },
    });
    const login = await call('/auth/login', {
      method: 'POST', ip: `10.264.9.${(authIp += 1)}`, body: { email, password },
    });
    if (!login.body?.token) {
      throw new Error(`§264 ABORT: ${tag} did not receive a token (${login.status} `
        + `${JSON.stringify(login.body)}). The suite refuses to continue with an unauthenticated `
        + 'principal, because every later authorization assertion would pass for the wrong reason.');
    }
    return { email, token: login.body.token as string, userId: login.body.user.id as string };
  };
  const reviewerA = await register('a');
  const reviewerB = await register('b');
  const otherTenant = await register('other');
  const noEntitlement = await register('noent');
  const grant = (userId: string) => execFileSync(
    'npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  grant(reviewerA.userId); grant(reviewerB.userId); grant(otherTenant.userId);

  const seed = async (user: { token: string }, tag: string) => {
    const site = await call('/sites', {
      method: 'POST', token: user.token, body: { name: `s264-site-${tag}-${suffix}` },
    });
    const inspection = await call('/inspections', {
      method: 'POST', token: user.token,
      body: {
        siteId: site.body.id, title: `s264-${tag}`, regulatoryContext: 'osha-general-industry',
      },
    });
    return { inspectionId: inspection.body.id as string };
  };
  const wsA = await seed(reviewerA, 'a');
  const wsOther = await seed(otherTenant, 'other');

  // ---- A SHARED ORGANIZATION, so the concurrency case has TWO genuinely authorized reviewers.
  //
  // The first version of this suite raced two independent individual accounts and the loser was
  // answered 404 — correctly, because the second account had no access to the first's inspection at
  // all. That measured tenant isolation a second time and measured concurrency not at all. Two
  // reviewers who cannot both reach the resource cannot race for it.
  const [org] = await q(`INSERT INTO "organization" ("name") VALUES ($1) RETURNING id`,
    [`s264-org-${suffix}`]);
  for (const [user, role] of [
    [reviewerA, 'organization_admin'], [reviewerB, 'manager'],
  ] as [{ userId: string }, string][]) {
    await q(`INSERT INTO "organization_memberships" ("organizationId","userId","role","status")
             VALUES ($1,$2,$3,'active')`, [org.id, user.userId, role]);
  }
  const relogin = async (user: { email: string }) => {
    const response = await call('/auth/login', {
      method: 'POST', ip: `10.264.9.${(authIp += 1)}`, body: { email: user.email, password },
    });
    if (!response.body?.token) {
      throw new Error(`§264 ABORT: re-login for ${user.email} returned no token `
        + `(${response.status}). Continuing would test an unauthenticated caller by accident.`);
    }
    return response.body.token as string;
  };
  const orgTokenA = await relogin(reviewerA);
  const orgTokenB = await relogin(reviewerB);
  const claims = (t: string) => JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString());
  ok('SETUP both reviewer tokens carry the shared organization',
    claims(orgTokenA).organizationId === org.id && claims(orgTokenB).organizationId === org.id,
    `A=${claims(orgTokenA).organizationRole} B=${claims(orgTokenB).organizationRole}`);
  const wsShared = await seed({ token: orgTokenA }, 'shared');
  const [sharedInspection] = await q(
    `SELECT "organizationId" FROM "inspection" WHERE "id" = $1`, [wsShared.inspectionId]);
  ok('SETUP both reviewers share one organization-scoped workspace',
    sharedInspection.organizationId === org.id, String(sharedInspection.organizationId));

  let ipSeed = 0;
  const nextIp = () => `10.264.0.${(ipSeed += 1)}`;

  const newObservation = async (inspectionId = wsA.inspectionId, token = reviewerA.token) => {
    const created = await call(`/inspections/${inspectionId}/observations`, {
      method: 'POST', token, body: { rawText: OBS_TEXT },
    });
    return created.body.id as string;
  };

  /** Run one Expert execution to a known state and return the observation and analysis ids. */
  const analysisIn = async (
    fixture: keyof typeof EXPERT_FIXTURES | 'PROVIDER_FAILURE',
    options: { inspectionId?: string; token?: string } = {},
  ) => {
    const token = options.token ?? reviewerA.token;
    const observationId = await newObservation(options.inspectionId ?? wsA.inspectionId, token);
    transport.script = fixture === 'PROVIDER_FAILURE'
      ? { firstPassFailure: { kind: 'TRANSPORT_TIMEOUT', detail: 'scripted' } }
      : { firstPass: EXPERT_FIXTURES[fixture].firstPass() };
    const response = await call(`/inspections/observations/${observationId}/expert-analyses`, {
      method: 'POST', token, ip: nextIp(),
      body: { idempotencyKey: `s264-${observationId.slice(0, 8)}-${Date.now()}`, requestVersion: 1 },
    });
    const [row] = await q(
      `SELECT * FROM "hazlenz_analyses" WHERE "observationId" = $1
       ORDER BY "requestVersion" DESC LIMIT 1`, [observationId]);
    return { observationId, analysisId: row?.id as string | undefined, row, response };
  };

  const settle = (
    observationId: string, analysisId: string,
    body: Record<string, unknown>,
    token = reviewerA.token,
  ) => call(`/inspections/observations/${observationId}/expert-analyses/${analysisId}/settlement`, {
    method: 'POST', token, ip: nextIp(), body,
  });

  // ================================================================ G0. the route's own profile

  console.log('---- G0. the settlement route carries the analysis-production profile ----\n');
  const reflector = app.get(Reflector);
  const handler = ExpertAnalysisController.prototype.settleExpertAnalysis;
  const guards: any[] = Reflect.getMetadata('__guards__', handler) ?? [];
  const guardNames = guards.map(g => (typeof g === 'function' ? g.name : g?.constructor?.name));
  ok('G0-A JwtGuard, EntitlementGuard and RolesGuard are all attached',
    ['JwtGuard', 'EntitlementGuard', 'RolesGuard'].every(g => guardNames.includes(g)),
    guardNames.join(','));
  ok('G0-B the required entitlement is fullSafeScope',
    reflector.get<string>('requiredEntitlement', handler) === 'fullSafeScope');
  ok('G0-C a dedicated throttle is attached',
    Number(Reflect.getMetadata('THROTTLER:LIMIT', handler)
      ?? Reflect.getMetadata('THROTTLER:LIMITdefault', handler)) > 0);
  ok('G0-D the role list matches the execution route exactly',
    JSON.stringify(reflector.get<string[]>('roles', handler))
      === JSON.stringify(reflector.get<string[]>(
        'roles', ExpertAnalysisController.prototype.requestExpertAnalysis)));

  // ================================================================ C. confirmation unchanged

  console.log('\n---- ACCEPTANCE C. human confirmation accepted unchanged ----\n');
  const c = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
  ok('C-1 the analysis starts awaiting confirmation',
    c.row?.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION', c.row?.analysisState);
  ok('C-2 and it is server-authored with no settlement yet',
    c.row?.producer === 'server_authored' && c.row?.settlementReviewId === null);
  const snapshotBefore = JSON.stringify(c.row.resultSnapshot);
  const executionBefore = (await q(
    `SELECT * FROM "expert_analysis_executions" WHERE "id" = $1`, [c.row.expertExecutionId]))[0];

  const confirmKey = `s264-confirm-${suffix}`;
  const confirmed = await settle(c.observationId, c.analysisId!, {
    idempotencyKey: confirmKey,
    decision: 'classification_confirmed',
    rationale: 'Reviewed on site; the stored-energy question does not stop the work in progress.',
  });
  ok('C-3 the confirmation is accepted', confirmed.status === 201,
    `${confirmed.status} ${JSON.stringify(confirmed.body.message ?? '')}`);
  const [afterConfirm] = await q(`SELECT * FROM "hazlenz_analyses" WHERE "id" = $1`, [c.analysisId]);
  ok('C-4 the state becomes ANALYSIS_CONFIRMED',
    afterConfirm.analysisState === 'ANALYSIS_CONFIRMED', afterConfirm.analysisState);
  ok('C-5 THE ORIGINAL EXPERT RESULT IS BYTE-FOR-BYTE UNCHANGED',
    JSON.stringify(afterConfirm.resultSnapshot) === snapshotBefore);
  ok('C-6 the Expert provenance fields are unchanged',
    afterConfirm.producer === 'server_authored'
    && afterConfirm.engineVersion === c.row.engineVersion
    && afterConfirm.expertExecutionId === c.row.expertExecutionId
    && afterConfirm.confirmationRequired === c.row.confirmationRequired,
    `confirmationRequired still ${afterConfirm.confirmationRequired}`);
  const executionAfter = (await q(
    `SELECT * FROM "expert_analysis_executions" WHERE "id" = $1`, [c.row.expertExecutionId]))[0];
  ok('C-7 the execution record is untouched by the human decision',
    JSON.stringify(executionAfter) === JSON.stringify(executionBefore));
  const [confirmReview] = await q(
    `SELECT * FROM "human_reviews" WHERE "analysisId" = $1`, [c.analysisId]);
  ok('C-8 the human decision is persisted SEPARATELY, as its own review row',
    confirmReview?.decision === 'classification_confirmed'
    && confirmReview?.reviewedByUserId === reviewerA.userId
    && afterConfirm.settlementReviewId === confirmReview.id);
  ok('C-9 the review records what HazLenz claimed and what the human settled',
    confirmReview.reviewedConclusion.entries[0].expertClassification === EXPERT_CLAIM
    && confirmReview.reviewedConclusion.entries[0].humanClassification === EXPERT_CLAIM
    && confirmReview.reviewedConclusion.entries[0].changed === false);
  const [confirmAudit] = await q(
    `SELECT * FROM "security_audit_events" WHERE "action" = $1 AND "resourceId" = $2`,
    [EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION, c.analysisId]);
  ok('C-10 an audit event records the transition and that nothing changed',
    !!confirmAudit
    && confirmAudit.metadata.previousAnalysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && confirmAudit.metadata.newAnalysisState === 'ANALYSIS_CONFIRMED'
    && confirmAudit.metadata.conclusionChanged === false
    && confirmAudit.metadata.reviewId === confirmReview.id);
  ok('C-11 no raw provider output reached the audit metadata',
    !JSON.stringify(confirmAudit.metadata).includes('scripted verifier verdict'));
  ok('C-12 the effective decision now resolves to a human-settled conclusion',
    confirmed.body.effectiveDecision?.settledForUse === true
    && confirmed.body.effectiveDecision?.humanSettled === true
    && confirmed.body.effectiveDecision?.source === 'HUMAN_CONFIRMED_AS_AUTHORED',
    confirmed.body.effectiveDecision?.source);

  const replay = await settle(c.observationId, c.analysisId!, {
    idempotencyKey: confirmKey,
    decision: 'classification_confirmed',
    rationale: 'Reviewed on site; the stored-energy question does not stop the work in progress.',
  });
  const [reviewCount] = await q(
    `SELECT count(*)::int AS n FROM "human_reviews" WHERE "analysisId" = $1`, [c.analysisId]);
  const [auditCount] = await q(
    `SELECT count(*)::int AS n FROM "security_audit_events"
     WHERE "action" = $1 AND "resourceId" = $2`,
    [EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION, c.analysisId]);
  ok('C-13 a retry under the same key replays and creates NO duplicate review or audit row',
    replay.status === 201 && replay.body.outcome === 'REPLAYED'
    && reviewCount.n === 1 && auditCount.n === 1,
    `outcome=${replay.body.outcome} reviews=${reviewCount.n} audits=${auditCount.n}`);
  ok('C-14 the replay returns the same review and the same settled state',
    replay.body.reviewId === confirmReview.id
    && replay.body.analysisState === 'ANALYSIS_CONFIRMED');
  caseResults.push({
    id: 'C', title: 'human confirmation accepted unchanged',
    passed: afterConfirm.analysisState === 'ANALYSIS_CONFIRMED'
      && JSON.stringify(afterConfirm.resultSnapshot) === snapshotBefore
      && reviewCount.n === 1 && auditCount.n === 1,
    detail: 'ANALYSIS_CONFIRMED, Expert result byte-identical, one review, one audit, retry replayed',
  });

  // ================================================================ D. override

  console.log('\n---- ACCEPTANCE D. human override / change ----\n');
  const d = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
  const dSnapshotBefore = JSON.stringify(d.row.resultSnapshot);
  const overridden = await settle(d.observationId, d.analysisId!, {
    idempotencyKey: `s264-override-${suffix}`,
    decision: 'classification_changed',
    rationale: 'The millwright is inside the guard opening now; this decides whether work continues.',
    replacements: [{ ...SUBJECT_REF, classification: HUMAN_REPLACEMENT }],
    comment: 'Discussed with the site supervisor.',
  });
  ok('D-1 the override is accepted', overridden.status === 201,
    `${overridden.status} ${JSON.stringify(overridden.body.message ?? '')}`);
  const [afterOverride] = await q(
    `SELECT * FROM "hazlenz_analyses" WHERE "id" = $1`, [d.analysisId]);
  ok('D-2 the state becomes ANALYSIS_OVERRIDDEN',
    afterOverride.analysisState === 'ANALYSIS_OVERRIDDEN', afterOverride.analysisState);
  ok('D-3 THE ORIGINAL EXPERT PROPOSAL IS BYTE-FOR-BYTE PRESERVED',
    JSON.stringify(afterOverride.resultSnapshot) === dSnapshotBefore);
  const [overrideReview] = await q(
    `SELECT * FROM "human_reviews" WHERE "analysisId" = $1`, [d.analysisId]);
  ok('D-4 the human replacement is independently attributable',
    overrideReview.decision === 'classification_changed'
    && overrideReview.reviewedByUserId === reviewerA.userId
    && overrideReview.reviewedConclusion.entries[0].expertClassification === EXPERT_CLAIM
    && overrideReview.reviewedConclusion.entries[0].humanClassification === HUMAN_REPLACEMENT
    && overrideReview.reviewedConclusion.entries[0].changed === true);
  ok('D-5 the effective decision uses the HUMAN replacement',
    overridden.body.effectiveDecision?.source === 'HUMAN_REPLACED'
    && overridden.body.effectiveDecision?.entries[0].effectiveClassification === HUMAN_REPLACEMENT
    && overridden.body.effectiveDecision?.entries[0].expertClassification === EXPERT_CLAIM,
    overridden.body.effectiveDecision?.source);
  ok('D-6 the response carries the original-versus-effective distinction for the frontend',
    overridden.body.entries[0].expertClassification === EXPERT_CLAIM
    && overridden.body.entries[0].effectiveClassification === HUMAN_REPLACEMENT
    && overridden.body.entries[0].changedByHuman === true
    && overridden.body.conclusionChanged === true);
  const [overrideAudit] = await q(
    `SELECT * FROM "security_audit_events" WHERE "action" = $1 AND "resourceId" = $2`,
    [EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION, d.analysisId]);
  ok('D-7 the audit records the override and that the conclusion changed',
    overrideAudit?.metadata.newAnalysisState === 'ANALYSIS_OVERRIDDEN'
    && overrideAudit.metadata.conclusionChanged === true
    && overrideAudit.metadata.entriesChanged === 1);
  ok('D-8 no unrelated Expert field changed',
    afterOverride.producer === d.row.producer
    && afterOverride.engineVersion === d.row.engineVersion
    && afterOverride.expertExecutionId === d.row.expertExecutionId
    && afterOverride.confirmationRequired === d.row.confirmationRequired
    && afterOverride.idempotencyKey === d.row.idempotencyKey
    && afterOverride.requestVersion === d.row.requestVersion);
  caseResults.push({
    id: 'D', title: 'human override / change',
    passed: afterOverride.analysisState === 'ANALYSIS_OVERRIDDEN'
      && JSON.stringify(afterOverride.resultSnapshot) === dSnapshotBefore
      && overridden.body.effectiveDecision?.source === 'HUMAN_REPLACED',
    detail: 'ANALYSIS_OVERRIDDEN, Expert proposal preserved, human replacement authoritative',
  });

  // ================================================================ negative tests

  console.log('\n---- N. the fourteen negative tests ----\n');

  const legacyObservation = await newObservation();
  await call(`/inspections/observations/${legacyObservation}/analyses`, {
    method: 'POST', token: reviewerA.token, ip: nextIp(),
    body: {
      engineVersion: 'hazlenz-production',
      idempotencyKey: `s264-legacy-${legacyObservation.slice(0, 8)}`,
      requestVersion: 1,
      resultSnapshot: { multiHazardDecomposition: { hazards: [] } },
    },
  });
  const [legacyRow] = await q(
    `SELECT * FROM "hazlenz_analyses" WHERE "observationId" = $1`, [legacyObservation]);
  const legacyAttempt = await settle(legacyObservation, legacyRow.id, {
    idempotencyKey: `s264-neg-legacy-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'Attempting to promote a client-supplied snapshot through Expert authority.',
  });
  ok('N1 a client_supplied analysis cannot enter the Expert confirmation action',
    legacyAttempt.status === 409 && /supplied by a client/i.test(String(legacyAttempt.body.message)),
    `${legacyAttempt.status} ${legacyAttempt.body.message}`);

  const stateCases: [string, keyof typeof EXPERT_FIXTURES | 'PROVIDER_FAILURE', string][] = [
    ['N2 ANALYSIS_AVAILABLE', 'A_ADMITTED_NO_CONFIRMATION', 'ANALYSIS_AVAILABLE'],
    ['N3 ANALYSIS_REFUSED', 'E_WHOLE_ANALYSIS_REFUSAL', 'ANALYSIS_REFUSED'],
    ['N4 ANALYSIS_UNRESOLVED', 'G_PRESERVED_UNRESOLVED', 'ANALYSIS_UNRESOLVED'],
  ];
  for (const [id, fixture, expectedState] of stateCases) {
    const target = await analysisIn(fixture);
    ok(`${id} reached`, target.row?.analysisState === expectedState, target.row?.analysisState);
    const attempt = await settle(target.observationId, target.analysisId!, {
      idempotencyKey: `s264-neg-${fixture}-${suffix}`,
      decision: 'classification_confirmed',
      rationale: 'Attempting to confirm an analysis that is not awaiting confirmation.',
    });
    ok(`${id} cannot be confirmed`,
      attempt.status === 409 && /is not awaiting confirmation/i.test(String(attempt.body.message)),
      `${attempt.status} ${attempt.body.message}`);
  }

  const failed = await analysisIn('PROVIDER_FAILURE');
  ok('N5 ANALYSIS_FAILED creates no analysis row at all, so there is nothing to confirm',
    failed.analysisId === undefined, `analysisRow=${failed.analysisId ?? 'none'}`);

  const alreadyConfirmed = await settle(c.observationId, c.analysisId!, {
    idempotencyKey: `s264-neg-reconfirm-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'A competing decision against an analysis that is already settled.',
  });
  ok('N6 an already CONFIRMED analysis cannot be re-settled through this route',
    alreadyConfirmed.status === 409
    && /ANALYSIS_CONFIRMED/.test(String(alreadyConfirmed.body.message)),
    `${alreadyConfirmed.status} ${alreadyConfirmed.body.message}`);
  const alreadyOverridden = await settle(d.observationId, d.analysisId!, {
    idempotencyKey: `s264-neg-reoverride-${suffix}`,
    decision: 'classification_changed',
    rationale: 'A competing decision against an analysis that is already overridden.',
    replacements: [{ ...SUBJECT_REF, classification: EXPERT_CLAIM }],
  });
  ok('N7 an already OVERRIDDEN analysis cannot be re-settled through this route',
    alreadyOverridden.status === 409
    && /ANALYSIS_OVERRIDDEN/.test(String(alreadyOverridden.body.message)),
    `${alreadyOverridden.status} ${alreadyOverridden.body.message}`);

  const crossTenant = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
  const crossAttempt = await settle(crossTenant.observationId, crossTenant.analysisId!, {
    idempotencyKey: `s264-neg-cross-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'A reviewer from another organization attempting to settle this analysis.',
  }, otherTenant.token);
  const absentAttempt = await settle(
    '00000000-0000-4000-8000-0000000000fe', '00000000-0000-4000-8000-0000000000ff', {
      idempotencyKey: `s264-neg-absent-${suffix}`,
      decision: 'classification_confirmed',
      rationale: 'An observation and analysis that do not exist at all.',
    }, otherTenant.token);
  ok('N8 a cross-tenant settlement is non-disclosing and identical to a non-existent resource',
    crossAttempt.status === 404 && absentAttempt.status === 404
    && JSON.stringify(crossAttempt.body.message) === JSON.stringify(absentAttempt.body.message),
    `${crossAttempt.status}:${crossAttempt.body.message} vs ${absentAttempt.status}:${absentAttempt.body.message}`);
  const [stillPending] = await q(
    `SELECT "analysisState" FROM "hazlenz_analyses" WHERE "id" = $1`, [crossTenant.analysisId]);
  ok('N8b and the target analysis is untouched',
    stillPending.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION');

  const forgeries: [string, Record<string, unknown>][] = [
    ['reviewedByUserId', { reviewedByUserId: reviewerB.userId }],
    ['reviewerId', { reviewerId: reviewerB.userId }],
    ['candidateIdentity', { candidateIdentity: 'forged-candidate' }],
    ['resultSnapshot', { resultSnapshot: { analysis: { forged: true } } }],
    ['analysisState', { analysisState: 'ANALYSIS_CONFIRMED' }],
    ['confirmationRequired', { confirmationRequired: false }],
    ['producer', { producer: 'server_authored' }],
    ['expertExecutionId', { expertExecutionId: '00000000-0000-4000-8000-00000000beef' }],
  ];
  let forgeriesRejected = 0;
  for (const [name, extra] of forgeries) {
    const victim = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
    const attempt = await settle(victim.observationId, victim.analysisId!, {
      idempotencyKey: `s264-forge-${victim.analysisId!.slice(0, 8)}`,
      decision: 'classification_confirmed',
      rationale: 'A request carrying a field the reviewer is not permitted to author.',
      ...extra,
    });
    const [row] = await q(
      `SELECT count(*)::int AS n FROM "human_reviews" WHERE "analysisId" = $1`,
      [victim.analysisId]);
    const rejected = attempt.status === 400 && row.n === 0;
    if (rejected) forgeriesRejected += 1;
    ok(`N9/N10/N11 forging ${name} is rejected before the controller runs`, rejected,
      `${attempt.status} reviewsCreated=${row.n}`);
  }
  ok('N9-Z every server-owned field attempted was refused',
    forgeriesRejected === forgeries.length, `${forgeriesRejected}/${forgeries.length}`);

  const badOverrideCases: [string, Record<string, unknown>, number][] = [
    ['an unknown classification', {
      decision: 'classification_changed',
      replacements: [{ ...SUBJECT_REF, classification: 'MADE_UP_VALUE' }],
    }, 400],
    ['a reference the analysis does not ask about', {
      decision: 'classification_changed',
      replacements: [{ refKind: 'HAZARD_CANDIDATE', ref: 'drive-stored-energy', classification: HUMAN_REPLACEMENT }],
    }, 400],
    ['a change that changes nothing', {
      decision: 'classification_changed',
      replacements: [{ ...SUBJECT_REF, classification: EXPERT_CLAIM }],
    }, 400],
    ['a change with no replacement at all', { decision: 'classification_changed' }, 400],
    ['a confirmation carrying a replacement', {
      decision: 'classification_confirmed',
      replacements: [{ ...SUBJECT_REF, classification: HUMAN_REPLACEMENT }],
    }, 400],
    ['a decision outside the vocabulary', { decision: 'accepted' }, 400],
    ['a rationale below the minimum', { decision: 'classification_confirmed', rationale: 'no' }, 400],
  ];
  for (const [label, override, expected] of badOverrideCases) {
    const victim = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
    const attempt = await settle(victim.observationId, victim.analysisId!, {
      idempotencyKey: `s264-bad-${victim.analysisId!.slice(0, 8)}`,
      decision: 'classification_confirmed',
      rationale: 'A structurally invalid settlement attempt.',
      ...override,
    });
    const [after] = await q(
      `SELECT "analysisState" FROM "hazlenz_analyses" WHERE "id" = $1`, [victim.analysisId]);
    ok(`N12 ${label} is rejected and settles nothing`,
      attempt.status === expected && after.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION',
      `${attempt.status} state=${after.analysisState}`);
  }

  // ---- N13. two concurrent reviewers.
  const race = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED',
    { inspectionId: wsShared.inspectionId, token: orgTokenA });
  // REACHABILITY IS PROVEN WITH A VALID BODY THAT SETTLES A DIFFERENT ANALYSIS.
  //
  // The first version of this probe sent an EMPTY rationale and treated 400 as proof of access.
  // That was vacuous: the validation pipe rejects an empty rationale before the controller runs, so
  // the request never reached authorization at all and the probe would have passed even if reviewer
  // B could not see the workspace. It now performs a real settlement.
  const reachProbe = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED',
    { inspectionId: wsShared.inspectionId, token: orgTokenA });
  const reachableByB = await settle(reachProbe.observationId, reachProbe.analysisId!, {
    idempotencyKey: `s264-reach-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'Reviewer B settling an analysis created by reviewer A in the shared workspace.',
  }, orgTokenB);
  ok('N13-0 reviewer B can genuinely settle in this workspace, so the race is a real race',
    reachableByB.status === 201, `${reachableByB.status} ${reachableByB.body.message ?? ''}`);
  const raced = await Promise.all([
    settle(race.observationId, race.analysisId!, {
      idempotencyKey: `s264-race-a-${suffix}`,
      decision: 'classification_confirmed',
      rationale: 'Reviewer A confirms the classification as HazLenz authored it.',
    }, orgTokenA),
    settle(race.observationId, race.analysisId!, {
      idempotencyKey: `s264-race-b-${suffix}`,
      decision: 'classification_changed',
      rationale: 'Reviewer B believes this does control whether work may continue.',
      replacements: [{ ...SUBJECT_REF, classification: HUMAN_REPLACEMENT }],
    }, orgTokenB),
  ]);
  const winners = raced.filter(r => r.status === 201);
  const losers = raced.filter(r => r.status === 409);
  const [raceReviews] = await q(
    `SELECT count(*)::int AS n FROM "human_reviews" WHERE "analysisId" = $1`, [race.analysisId]);
  const [raceAudits] = await q(
    `SELECT count(*)::int AS n FROM "security_audit_events"
     WHERE "action" = $1 AND "resourceId" = $2`,
    [EXPERT_CLASSIFICATION_SETTLED_AUDIT_ACTION, race.analysisId]);
  const [raceRow] = await q(`SELECT * FROM "hazlenz_analyses" WHERE "id" = $1`, [race.analysisId]);
  ok('N13-A exactly one of two concurrent reviewers settles the analysis',
    winners.length === 1 && losers.length === 1,
    raced.map(r => `${r.status}:${JSON.stringify(r.body.message ?? r.body.outcome ?? '')}`).join(' | '));
  ok('N13-B the loser gets a deterministic conflict, not a silent overwrite',
    losers.length === 1 && losers[0].status === 409, String(losers[0]?.body?.message));
  ok('N13-C exactly one review row and one audit row exist',
    raceReviews.n === 1 && raceAudits.n === 1,
    `reviews=${raceReviews.n} audits=${raceAudits.n}`);
  ok('N13-D the analysis is in exactly one settled state naming that one review',
    ['ANALYSIS_CONFIRMED', 'ANALYSIS_OVERRIDDEN'].includes(raceRow.analysisState)
    && raceRow.settlementReviewId !== null,
    raceRow.analysisState);

  // ---- N13-E. THE IN-TRANSACTION GUARD, EXERCISED ON PURPOSE.
  //
  // The HTTP race above is decided by whichever check the loser reaches first, and in practice the
  // loser usually arrives after the winner has committed and is stopped by the pre-transaction
  // state read. That is correct behaviour, but it leaves the CONDITIONAL UPDATE — the guard that
  // matters when both callers read the same pending state — unexercised. Recording the HTTP race as
  // proof of the transactional guard would be claiming a property that was never tested.
  //
  // So this drives the service directly, where both settlements perform their reads before either
  // transaction commits, and asserts which mechanism actually rejected the loser.
  const { ExpertAnalysisService: SettlementService } =
    require('../src/hazlenz/expert-hazlenz-product/expert-analysis.service');
  const authority = app.get(SettlementService) as {
    settleExpertAnalysis: (u: unknown, o: string, a: string, r: Record<string, unknown>) => Promise<unknown>;
  };
  const deepRace = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED',
    { inspectionId: wsShared.inspectionId, token: orgTokenA });
  const principalA = { userId: reviewerA.userId, organizationId: org.id, organizationRole: 'organization_admin' };
  const principalB = { userId: reviewerB.userId, organizationId: org.id, organizationRole: 'manager' };
  const attempt = (principal: unknown, key: string) => authority
    .settleExpertAnalysis(principal, deepRace.observationId, deepRace.analysisId!, {
      idempotencyKey: key,
      decision: 'classification_confirmed',
      rationale: 'Two reviewers reading the same pending analysis at the same moment.',
      replacements: [],
      comment: null,
    })
    .then(value => ({ ok: true as const, value }))
    .catch((error: Error) => ({ ok: false as const, error }));
  const deep = await Promise.all([
    attempt(principalA, `s264-deep-a-${suffix}`),
    attempt(principalB, `s264-deep-b-${suffix}`),
  ]);
  const deepWinners = deep.filter(r => r.ok);
  const deepLosers = deep.filter(r => !r.ok);
  const loserMessage = deepLosers.length === 1 && !deepLosers[0].ok
    ? deepLosers[0].error.message : '';
  const guardThatFired = /one-settlement-per-analysis index/i.test(loserMessage)
    ? 'ONE_SETTLEMENT_UNIQUE_INDEX'
    : /conditional state transition/i.test(loserMessage)
      ? 'CONDITIONAL_STATE_TRANSITION'
      : /is not awaiting confirmation/i.test(loserMessage)
        ? 'PRE_TRANSACTION_STATE_READ'
        : 'UNRECOGNISED';
  const inTransactionGuardFired = guardThatFired === 'ONE_SETTLEMENT_UNIQUE_INDEX'
    || guardThatFired === 'CONDITIONAL_STATE_TRANSITION';
  ok('N13-F2 the loser never sees a raw database error',
    !/duplicate key|violates unique constraint|QueryFailedError|23505/i.test(loserMessage),
    loserMessage.slice(0, 100));
  const [deepReviews] = await q(
    `SELECT count(*)::int AS n FROM "human_reviews" WHERE "analysisId" = $1`, [deepRace.analysisId]);
  ok('N13-E two settlements reading the same pending state produce exactly one winner',
    deepWinners.length === 1 && deepLosers.length === 1,
    `${deepWinners.length} won / ${deepLosers.length} lost`);
  ok('N13-F the loser is rejected deterministically, never by last-write-wins',
    deepLosers.length === 1 && /already|another reviewer|not awaiting/i.test(loserMessage),
    loserMessage.slice(0, 120));
  ok('N13-G exactly one review row survives; the loser\'s transaction left nothing behind',
    deepReviews.n === 1, `reviews=${deepReviews.n}`);
  ok('N13-H the rejection came from an in-transaction guard, not merely from the earlier read',
    inTransactionGuardFired, guardThatFired);
  console.log(`      concurrency guard that fired: ${guardThatFired}`);
  concurrencyMechanism = guardThatFired;

  // ---- N14 is proven by C-13 above; asserted here against the race winner as well.
  const winner = winners[0];
  const retryOfWinner = await settle(race.observationId, race.analysisId!, {
    idempotencyKey: winner.body.reviewId === raceRow.settlementReviewId
      ? `s264-race-${winner.body.decision === 'classification_changed' ? 'b' : 'a'}-${suffix}`
      : `s264-race-a-${suffix}`,
    decision: winner.body.decision,
    rationale: winner.body.rationale,
    ...(winner.body.decision === 'classification_changed'
      ? { replacements: [{ ...SUBJECT_REF, classification: HUMAN_REPLACEMENT }] } : {}),
  }, winner.body.decision === 'classification_changed' ? orgTokenB : orgTokenA);
  const [afterRetry] = await q(
    `SELECT count(*)::int AS n FROM "human_reviews" WHERE "analysisId" = $1`, [race.analysisId]);
  ok('N14 retrying the winning request creates no duplicate rows',
    retryOfWinner.body.outcome === 'REPLAYED' && afterRetry.n === 1,
    `${retryOfWinner.status} ${retryOfWinner.body.outcome} reviews=${afterRetry.n}`);

  // ================================================================ stale / superseded analysis

  console.log('\n---- V. version binding: a superseded analysis is detected, not silently settled ----\n');
  const stale = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
  transport.script = { firstPass: EXPERT_FIXTURES.B_ADMITTED_CONFIRMATION_REQUIRED.firstPass() };
  const rerun = await call(
    `/inspections/observations/${stale.observationId}/expert-analyses`, {
      method: 'POST', token: reviewerA.token, ip: nextIp(),
      body: { idempotencyKey: `s264-rerun-${suffix}`, requestVersion: 2 },
    });
  ok('V-1 a second Expert analysis supersedes the first', rerun.status === 201);
  const staleAttempt = await settle(stale.observationId, stale.analysisId!, {
    idempotencyKey: `s264-stale-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'A stale decision taken against an analysis a newer one has replaced.',
  });
  ok('V-2 confirming the superseded analysis is REFUSED with a specific reason',
    staleAttempt.status === 409 && /newer Expert analysis exists/i.test(String(staleAttempt.body.message)),
    `${staleAttempt.status} ${staleAttempt.body.message}`);
  const [newerRow] = await q(
    `SELECT * FROM "hazlenz_analyses" WHERE "observationId" = $1 AND "requestVersion" = 2`,
    [stale.observationId]);
  ok('V-3 and the NEWER analysis was not settled by the attempt on the older one',
    newerRow.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && newerRow.settlementReviewId === null, newerRow.analysisState);
  const settleNewer = await settle(stale.observationId, newerRow.id, {
    idempotencyKey: `s264-newer-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'Confirming the current analysis, which is the one the reviewer is looking at.',
  });
  const [olderRow] = await q(
    `SELECT * FROM "hazlenz_analyses" WHERE "id" = $1`, [stale.analysisId]);
  ok('V-4 settling the newer analysis leaves the older one exactly as it was',
    settleNewer.status === 201
    && olderRow.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && olderRow.settlementReviewId === null,
    `newer=${settleNewer.status} older=${olderRow.analysisState}`);

  // ================================================================ downstream authority

  console.log('\n---- W. no premature findings, and authority is exposed rather than activated ----\n');
  for (const [label, analysisId] of [
    ['confirmed', c.analysisId], ['overridden', d.analysisId],
  ] as [string, string][]) {
    const [findings] = await q(
      `SELECT count(*)::int AS n FROM "inspection_findings"
       WHERE "originatingAnalysisId" = $1 OR "selectedAnalysisId" = $1`, [analysisId]);
    ok(`W-1 a ${label} analysis still reconciles NO findings in this slice`,
      findings.n === 0, `findings=${findings.n}`);
  }
  const pendingForEffective = await analysisIn('B_ADMITTED_CONFIRMATION_REQUIRED');
  ok('W-2 an awaiting-confirmation analysis reconciles no findings either',
    (await q(`SELECT count(*)::int AS n FROM "inspection_findings"
      WHERE "originatingAnalysisId" = $1`, [pendingForEffective.analysisId]))[0].n === 0);
  ok('W-3 the settlement response states that nothing downstream was activated',
    confirmed.body.findingsReconciled === false
    && overridden.body.findingsReconciled === false);
  ok('W-4 the CHECK constraint refuses a settled state minted without a review row',
    /ck_hazlenz_analysis_settlement/.test(String(await q(
      `UPDATE "hazlenz_analyses" SET "analysisState" = 'ANALYSIS_CONFIRMED' WHERE "id" = $1`,
      [pendingForEffective.analysisId]).then(() => 'UPDATED').catch((e: Error) => e.message))));

  // ================================================================ spend accounting

  const lifetime = expertTransportLifetimeCounts();
  console.log(`\nsimulated provider entries: ${JSON.stringify(lifetime)}`);
  const [seams] = await q(`
    SELECT count(*) FILTER (WHERE "providerId" <> 'local-deterministic-transport')::int AS other,
           count(*)::int AS total
    FROM "expert_analysis_executions"
    WHERE "requestedByUserId" = ANY($1::uuid[])`,
    [[reviewerA.userId, reviewerB.userId, otherTenant.userId]]);
  ok('Z-A no execution reached a hosted transport', seams.other === 0, JSON.stringify(seams));
  ok('Z-B this run had a genuine opportunity to spend, so Z-A is not vacuous',
    lifetime.total > 0 && Boolean(process.env.ANTHROPIC_API_KEY),
    `legs=${lifetime.total}`);

  substituteExpertSemanticTransportForVerification(null);
  await app.close();

  console.log('\n================ §264 acceptance cases\n');
  for (const c2 of caseResults) {
    console.log(`  ${c2.id}  ${c2.passed ? 'PASS' : 'FAIL'}  ${c2.title}\n        ${c2.detail}`);
  }
  console.log(`\n================ §264 human confirmation: ${pass} passed, ${fail} failed`);
  console.log(JSON.stringify({
    realProviderCalls: 0,
    simulatedProviderEntries: lifetime,
    productionDatabaseOperations: 0,
    database: target.database,
    disposable: true,
    passed: pass, failed: fail,
    concurrencyRejectionMechanism: concurrencyMechanism,
    casesPassed: caseResults.filter(x => x.passed).map(x => x.id),
    casesFailed: caseResults.filter(x => !x.passed).map(x => x.id),
  }));
  if (fail > 0) { console.log(`failures: ${failures.join(', ')}`); process.exit(1); }
}

main().catch(error => { console.error(error); process.exit(1); });
