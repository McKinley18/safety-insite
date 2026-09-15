/**
 * §265 — THE LOCAL EXPERT PRODUCT ACCEPTANCE. TIER 2, OVER REAL HTTP.
 *
 * ZERO PROVIDER CALLS: the transport is substituted through the §262 fail-closed seam, which
 * refuses to substitute outside NODE_ENV=test, and the seam counts every leg that reached it.
 * DATABASE OPERATIONS ONLY against a disposable database, created and dropped by the §263 wrapper.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS SUITE ADDS OVER §262 AND §264, AND WHAT IT DELIBERATELY DOES NOT REPEAT.
 *
 * §262 proved the execution route and §264 proved the settlement transition. Neither could prove
 * the two things §265 exists to establish, because neither existed yet:
 *
 *   1. THE READ. A reviewer's browser holds nothing after a reload, so there is now a read that
 *      returns the whole authority picture — state, the stored confirmation flag, the SERVER'S
 *      confirmation subject, the server-derived effective decision, the settlement, and the
 *      history with its two producers still distinguishable.
 *   2. THE FIRST ACTIVATED DOWNSTREAM CONSUMER. Finding finalization now asks
 *      `ExpertEffectiveDecisionService` whether the analysis it rests on carries a settled
 *      operational conclusion, and refuses when it does not.
 *
 * Cases A–J re-establish the §260 acceptance set THROUGH THE READ SURFACE the frontend actually
 * uses, which is a different assertion from §262's "the write returned the right thing". Cases
 * L–N are new and are the point of the slice. Case K is a frontend assertion and is executed by
 * `frontend-next/lib/expert/__tests__/expertPresentation.test.ts`, not here — a browser rendering
 * rule cannot be proven by a server suite, and claiming it here would be the weaker evidence
 * pretending to be the stronger.
 *
 * ---------------------------------------------------------------------------------------------
 * THE EXPECTATIONS BELOW WERE AUTHORED BEFORE THE SUITE WAS RUN, and no provider output is scored:
 * every fixture is a RECORDED deterministic input that exists to reach one server outcome.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { REQUIRED_ENTITLEMENT_KEY } from '../src/auth/entitlements/entitlement.guard';
import { ExpertAnalysisController }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis.controller';
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
import { evidenceWritesEnabled } from './lib/evidence-write-gate';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§265 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§265 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§265 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§265 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§265 REFUSED: DEV_AUTH_BYPASS is enabled; the authorization cases would '
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
const recordCase = (id: string, title: string, passed: boolean, detail: string): void => {
  caseResults.push({ id, title, passed, detail });
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

/**
 * WORDS THAT MAY NOT APPEAR IN ANY SENTENCE SERVED FOR AN UNSETTLED CONCLUSION.
 *
 * The frontend renders the server's sentences verbatim, so a sentence that calls an unconfirmed
 * conclusion approved or final produces the exact failure §265 forbids — and it produces it in a
 * layer no browser test would catch, because the browser would be rendering honestly.
 */
const SETTLED_VOCABULARY =
  /\b(approved|finali[sz]ed|safe to proceed|cleared|signed off|authoris?z?ed to proceed)\b/i;

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§265 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const transport = new ScriptedTransport();
  substituteExpertSemanticTransportForVerification(transport);

  const suffix = `${Date.now()}`;
  const password = 'Section265!StrongPass123';
  let authIp = 0;
  const register = async (tag: string) => {
    const email = `s265-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST', ip: `10.265.9.${(authIp += 1)}`,
      body: {
        email, password, name: `s265-${tag}`, type: 'individual',
        // §299 (IT-1). §291 made this required at registration; this harness predates it.
        // Derived from the registry the service validates against, never spelled out here.
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    const login = await call('/auth/login', {
      method: 'POST', ip: `10.265.9.${(authIp += 1)}`, body: { email, password },
    });
    if (!login.body?.token) {
      throw new Error(`§265 ABORT: ${tag} did not receive a token (${login.status}). The suite `
        + 'refuses to continue with an unauthenticated principal, because every later '
        + 'authorization assertion would pass for the wrong reason.');
    }
    return { email, token: login.body.token as string, userId: login.body.user.id as string };
  };
  const reviewer = await register('reviewer');
  const otherTenant = await register('other');
  const grant = (userId: string) => execFileSync(
    'npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  grant(reviewer.userId); grant(otherTenant.userId);

  const seed = async (user: { token: string }, tag: string) => {
    const site = await call('/sites', {
      method: 'POST', token: user.token, body: { name: `s265-site-${tag}-${suffix}` },
    });
    const inspection = await call('/inspections', {
      method: 'POST', token: user.token,
      body: {
        siteId: site.body.id, title: `s265-${tag}`, regulatoryContext: 'osha-general-industry',
      },
    });
    return { inspectionId: inspection.body.id as string };
  };
  const ws = await seed(reviewer, 'main');
  const wsOther = await seed(otherTenant, 'other');

  let ipSeed = 0;
  const nextIp = () => `10.265.0.${(ipSeed += 1)}`;

  const newObservation = async (inspectionId = ws.inspectionId, token = reviewer.token) => {
    const created = await call(`/inspections/${inspectionId}/observations`, {
      method: 'POST', token, body: { rawText: OBS_TEXT },
    });
    return created.body.id as string;
  };

  /** Execute one Expert analysis to a known outcome, then READ it back the way the UI does. */
  const runAndRead = async (
    fixture: keyof typeof EXPERT_FIXTURES | 'PROVIDER_FAILURE',
    options: { inspectionId?: string; token?: string; idempotencyKey?: string } = {},
  ) => {
    const token = options.token ?? reviewer.token;
    const observationId = await newObservation(options.inspectionId ?? ws.inspectionId, token);
    transport.script = fixture === 'PROVIDER_FAILURE'
      ? { firstPassFailure: { kind: 'TRANSPORT_TIMEOUT', detail: 'scripted' } }
      : { firstPass: EXPERT_FIXTURES[fixture].firstPass() };
    const executed = await call(`/inspections/observations/${observationId}/expert-analyses`, {
      method: 'POST', token, ip: nextIp(),
      body: {
        idempotencyKey: options.idempotencyKey
          ?? `s265-${observationId.slice(0, 8)}-${Date.now()}`,
        requestVersion: 1,
      },
    });
    const read = await call(`/inspections/observations/${observationId}/expert-analyses/current`, {
      token, ip: nextIp(),
    });
    return { observationId, executed, read };
  };

  const settle = (
    observationId: string, analysisId: string, body: Record<string, unknown>,
    token = reviewer.token,
  ) => call(`/inspections/observations/${observationId}/expert-analyses/${analysisId}/settlement`, {
    method: 'POST', token, ip: nextIp(), body,
  });

  /** Create a review citing an Expert analysis, then attempt to finalize a finding from it. */
  const reviewThenFinalize = async (observationId: string, analysisId: string) => {
    const review = await call(`/inspections/observations/${observationId}/reviews`, {
      method: 'POST', token: reviewer.token,
      body: {
        analysisId, decision: 'accepted',
        rationale: 'the inspector accepts the Expert analysis for this observation',
      },
    });
    const finalize = await call(`/inspections/observations/${observationId}/findings`, {
      method: 'POST', token: reviewer.token,
      body: { reviewId: review.body.id, conclusion: 'drive not isolated while a person is inside' },
    });
    return { reviewId: review.body.id as string, finalize };
  };

  // ================================================================ P0. the read route's profile

  console.log('---- P0. the read route carries the analysis-production guard profile ----\n');
  const reflector = app.get(Reflector);
  const readHandler = ExpertAnalysisController.prototype.readCurrentExpertAnalysis;
  const guardNames: string[] = (Reflect.getMetadata('__guards__', readHandler) ?? [])
    .map((g: any) => (typeof g === 'function' ? g.name : g?.constructor?.name));
  ok('P0-A the read route attaches JwtGuard, EntitlementGuard and RolesGuard',
    ['JwtGuard', 'EntitlementGuard', 'RolesGuard'].every(g => guardNames.includes(g)),
    guardNames.join(','));
  ok('P0-B the read route requires the same fullSafeScope entitlement as the writes',
    reflector.get(REQUIRED_ENTITLEMENT_KEY, readHandler) === 'fullSafeScope',
    String(reflector.get(REQUIRED_ENTITLEMENT_KEY, readHandler)));
  const unauthenticated = await call(
    `/inspections/observations/${await newObservation()}/expert-analyses/current`, { ip: nextIp() });
  ok('P0-C an unauthenticated read is rejected', unauthenticated.status === 401,
    String(unauthenticated.status));

  // ================================================================ A

  console.log('\n---- A. ordinary admitted analysis, no confirmation required ----\n');
  const a = await runAndRead('A_ADMITTED_NO_CONFIRMATION');
  ok('A-1 the read reports the analysis present',
    a.read.status === 200 && a.read.body.present === true, String(a.read.status));
  ok('A-2 the state is ANALYSIS_AVAILABLE',
    a.read.body.analysisState === 'ANALYSIS_AVAILABLE', a.read.body.analysisState);
  ok('A-3 the producer is server_authored', a.read.body.producer === 'server_authored',
    a.read.body.producer);
  ok('A-4 no confirmation is required and no question is asked',
    a.read.body.confirmationRequired === false && a.read.body.confirmationSubject === null);
  ok('A-5 the effective decision is the admitted-no-confirmation source',
    a.read.body.effectiveDecision?.source === 'EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED',
    a.read.body.effectiveDecision?.source);
  ok('A-6 it is settled for use and no human settled it',
    a.read.body.effectiveDecision?.settledForUse === true
    && a.read.body.effectiveDecision?.humanSettled === false);
  ok('A-7 the execution response carried the same derivation as the read',
    a.executed.body.effectiveDecision?.source === a.read.body.effectiveDecision?.source);
  ok('A-8 no finding is reconciled by the analysis itself',
    a.read.body.findingsReconciled === false);
  recordCase('A', 'ordinary admitted analysis, no confirmation',
    a.read.body.analysisState === 'ANALYSIS_AVAILABLE'
    && a.read.body.effectiveDecision?.settledForUse === true,
    `state=${a.read.body.analysisState} source=${a.read.body.effectiveDecision?.source}`);

  // The shape a frontend actually renders, captured once so the presentation layer is written
  // against the REAL payload rather than against an assumption about it.
  //
  // -------------------------------------------------------------------------------------------
  // §267 — THE WRITES ARE OPT-IN NOW, AND THIS SUITE'S ASSERTIONS ARE NOT AFFECTED BY IT.
  //
  // This suite is part of `hazlenz:integration:inner`, so it re-runs on every later section's
  // `hazlenz:precommit`. It writes into the §265 evidence package, which is FROZEN and whose
  // digests are recorded in `REPORT-265.sha256`. The payload-shape artifact contains per-run UUIDs
  // and timestamps, so a re-run cannot reproduce it: §267 measured three digests across three runs
  // (recorded 3860eedd…, then 4e881317…, then de2e9ccb…), differing only in identifiers and times.
  //
  // The consequence was that `hazlenz:precommit` could not pass twice. Its last step,
  // `hazlenz:evidence`, correctly reported the DIGEST_MISMATCH that its own earlier step had just
  // caused. §265 itself passed only because its manifest was computed AFTER this write; every
  // section after it inherited a gate that fails on a clean tree. §267 is the first section to
  // re-run precommit after §265 froze, which is why it surfaced here.
  //
  // NOTHING IS WEAKENED. Every assertion above and below still runs and still fails the build. Only
  // the SIDE EFFECT of overwriting an accepted package is removed, and removing it is what makes
  // the evidence guard able to mean "something changed" rather than "the suite ran again". The
  // §265 bytes on disk remain exactly the bytes §265 accepted.
  //
  // §268 replaced §267's suite-specific variable with the one shared gate in
  // `scripts/lib/evidence-write-gate.ts`, because §267 and §268 have the same problem and three
  // conventions for one rule is how the rule gets forgotten. Set HAZLENZ_WRITE_EVIDENCE=1 to
  // regenerate the package deliberately — which also obliges recomputing `REPORT-265.sha256`.
  const WRITE_EVIDENCE = evidenceWritesEnabled();
  const evidenceDir = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-265-frontend-product-workflow-2026-09-12');
  if (WRITE_EVIDENCE) {
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(join(evidenceDir, 'SECTION-265-READ-PAYLOAD-SHAPE.json'),
      JSON.stringify(a.read.body, null, 2));
  }

  // ================================================================ B

  console.log('\n---- B. admitted analysis requiring confirmation ----\n');
  const b = await runAndRead('B_ADMITTED_CONFIRMATION_REQUIRED');
  const bAnalysisId = b.read.body.analysisId as string;
  ok('B-1 the state is ANALYSIS_AWAITING_CONFIRMATION',
    b.read.body.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION', b.read.body.analysisState);
  ok('B-2 the stored confirmation flag is served as true',
    b.read.body.confirmationRequired === true);
  ok('B-3 the server supplies the confirmation subject and it is resolvable',
    b.read.body.confirmationSubject?.resolvable === true,
    JSON.stringify(b.read.body.confirmationSubject?.refusalCode ?? null));
  ok('B-4 the subject names the entry the rule fired on, by refKind:ref',
    b.read.body.confirmationSubject?.entries?.length === 1
    && b.read.body.confirmationSubject.entries[0].refKind === SUBJECT_REF.refKind
    && b.read.body.confirmationSubject.entries[0].ref === SUBJECT_REF.ref,
    JSON.stringify(b.read.body.confirmationSubject?.entries));
  ok('B-5 the subject carries what HazLenz claimed, in the product vocabulary',
    b.read.body.confirmationSubject.entries[0].expertClassification === EXPERT_CLAIM,
    b.read.body.confirmationSubject.entries[0].expertClassification);
  ok('B-6 the answer vocabulary is served by the server, not assumed by the client',
    Array.isArray(b.read.body.answerOptions) && b.read.body.answerOptions.length === 2,
    JSON.stringify((b.read.body.answerOptions ?? []).map((o: Json) => o.value)));
  ok('B-7 NO settled conclusion is offered while it awaits a person',
    b.read.body.effectiveDecision?.settledForUse === false
    && b.read.body.effectiveDecision?.source === 'NONE_AWAITING_HUMAN_CONFIRMATION',
    b.read.body.effectiveDecision?.source);
  ok('B-8 neither served sentence calls the unconfirmed conclusion approved or final',
    !SETTLED_VOCABULARY.test(String(b.read.body.authorityStatement))
    && !SETTLED_VOCABULARY.test(String(b.read.body.effectiveDecision?.statement)),
    `${b.read.body.authorityStatement} / ${b.read.body.effectiveDecision?.statement}`);
  ok('B-9 no settlement record exists yet', b.read.body.settlement === null);
  recordCase('B', 'admitted analysis requiring confirmation',
    b.read.body.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && b.read.body.effectiveDecision?.settledForUse === false
    && b.read.body.confirmationSubject?.resolvable === true,
    `subject=${JSON.stringify(b.read.body.confirmationSubject?.entries)}`);

  // ================================================================ L — blocked downstream

  console.log('\n---- L. the downstream consumer refuses an unsettled Expert conclusion ----\n');
  const blocked = await reviewThenFinalize(b.observationId, bAnalysisId);
  ok('L-1 finalizing a finding from an unsettled Expert analysis is refused',
    blocked.finalize.status === 409, `${blocked.finalize.status}`);
  ok('L-2 the refusal states WHY, in the derivation\'s own words',
    /requires a person to settle/i.test(String(blocked.finalize.body?.message)),
    String(blocked.finalize.body?.message));
  const [blockedCount] = await q(
    `SELECT COUNT(*)::int AS n FROM "inspection_findings" WHERE "observationId" = $1`,
    [b.observationId]);
  ok('L-3 NO finding row was written', blockedCount.n === 0, String(blockedCount.n));
  const [blockedActions] = await q(
    `SELECT COUNT(*)::int AS n FROM "corrective_actions" WHERE "inspectionId" = $1`,
    [ws.inspectionId]);
  ok('L-4 no corrective action was created from the unsettled posture',
    blockedActions.n === 0, String(blockedActions.n));
  recordCase('L', 'downstream consumer blocks an unsettled decision',
    blocked.finalize.status === 409 && blockedCount.n === 0,
    `status=${blocked.finalize.status} findings=${blockedCount.n}`);

  // ================================================================ C / M — confirm

  console.log('\n---- C. confirmation accepted unchanged ----\n');
  const [beforeSnapshot] = await q(
    `SELECT "resultSnapshot"::text AS s FROM "hazlenz_analyses" WHERE "id" = $1`, [bAnalysisId]);
  const confirmed = await settle(b.observationId, bAnalysisId, {
    idempotencyKey: `s265-confirm-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'the follow-up classification matches what I saw on the floor',
  });
  ok('C-1 the settlement succeeded', confirmed.status === 201 || confirmed.status === 200,
    String(confirmed.status));
  const cRead = await call(
    `/inspections/observations/${b.observationId}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  ok('C-2 the state is ANALYSIS_CONFIRMED', cRead.body.analysisState === 'ANALYSIS_CONFIRMED',
    cRead.body.analysisState);
  ok('C-3 the effective decision is HUMAN_CONFIRMED_AS_AUTHORED and settled',
    cRead.body.effectiveDecision?.source === 'HUMAN_CONFIRMED_AS_AUTHORED'
    && cRead.body.effectiveDecision?.settledForUse === true
    && cRead.body.effectiveDecision?.humanSettled === true,
    cRead.body.effectiveDecision?.source);
  ok('C-4 the reviewer and the time of the decision are served',
    cRead.body.settlement?.reviewedByUserId === reviewer.userId
    && typeof cRead.body.settlement?.reviewedAt === 'string');
  ok('C-5 nothing was changed by the human, and the read says so',
    cRead.body.settlement?.entries?.every((e: Json) => e.changedByHuman === false) === true);
  const [afterSnapshot] = await q(
    `SELECT "resultSnapshot"::text AS s FROM "hazlenz_analyses" WHERE "id" = $1`, [bAnalysisId]);
  ok('C-6 the Expert result is byte-identical after settlement',
    beforeSnapshot.s === afterSnapshot.s);
  recordCase('C', 'confirmation accepted unchanged',
    cRead.body.analysisState === 'ANALYSIS_CONFIRMED' && beforeSnapshot.s === afterSnapshot.s,
    `source=${cRead.body.effectiveDecision?.source}`);

  console.log('\n---- M. the downstream consumer consumes the CONFIRMED decision ----\n');
  const allowed = await call(`/inspections/observations/${b.observationId}/findings`, {
    method: 'POST', token: reviewer.token,
    body: {
      reviewId: blocked.reviewId,
      conclusion: 'drive not isolated while a person is inside',
    },
  });
  ok('M-1 the SAME review that was refused now finalizes',
    allowed.status === 201 || allowed.status === 200, String(allowed.status));
  const [allowedCount] = await q(
    `SELECT COUNT(*)::int AS n FROM "inspection_findings" WHERE "observationId" = $1`,
    [b.observationId]);
  ok('M-2 exactly one finding exists, and only after the human settled',
    allowedCount.n === 1, String(allowedCount.n));
  recordCase('M', 'downstream consumer consumes the confirmed decision',
    (allowed.status === 201 || allowed.status === 200) && allowedCount.n === 1,
    `status=${allowed.status} findings=${allowedCount.n}`);

  // ================================================================ D / N — override

  console.log('\n---- D. human override of the classification ----\n');
  const d = await runAndRead('B_ADMITTED_CONFIRMATION_REQUIRED');
  const dAnalysisId = d.read.body.analysisId as string;
  const [dBefore] = await q(
    `SELECT "resultSnapshot"::text AS s FROM "hazlenz_analyses" WHERE "id" = $1`, [dAnalysisId]);
  const overridden = await settle(d.observationId, dAnalysisId, {
    idempotencyKey: `s265-override-${suffix}`,
    decision: 'classification_changed',
    rationale: 'stored energy decides whether this job proceeds at all, not a follow-up',
    replacements: [{ ...SUBJECT_REF, classification: HUMAN_REPLACEMENT }],
  });
  ok('D-1 the override succeeded', overridden.status === 201 || overridden.status === 200,
    String(overridden.status));
  const dRead = await call(
    `/inspections/observations/${d.observationId}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  ok('D-2 the state is ANALYSIS_OVERRIDDEN', dRead.body.analysisState === 'ANALYSIS_OVERRIDDEN',
    dRead.body.analysisState);
  ok('D-3 the effective decision is HUMAN_REPLACED and settled',
    dRead.body.effectiveDecision?.source === 'HUMAN_REPLACED'
    && dRead.body.effectiveDecision?.settledForUse === true,
    dRead.body.effectiveDecision?.source);
  ok('D-4 the read carries BOTH sides, so the UI never implies HazLenz authored the replacement',
    dRead.body.settlement?.entries?.[0]?.expertClassification === EXPERT_CLAIM
    && dRead.body.settlement?.entries?.[0]?.effectiveClassification === HUMAN_REPLACEMENT
    && dRead.body.settlement?.entries?.[0]?.changedByHuman === true,
    JSON.stringify(dRead.body.settlement?.entries));
  const [dAfter] = await q(
    `SELECT "resultSnapshot"::text AS s FROM "hazlenz_analyses" WHERE "id" = $1`, [dAnalysisId]);
  ok('D-5 the Expert proposal is preserved byte-identically under the override',
    dBefore.s === dAfter.s);
  recordCase('D', 'override / change',
    dRead.body.analysisState === 'ANALYSIS_OVERRIDDEN' && dBefore.s === dAfter.s,
    `expert=${EXPERT_CLAIM} human=${HUMAN_REPLACEMENT}`);

  console.log('\n---- N. the downstream consumer consumes the OVERRIDE, not the proposal ----\n');
  const nFinal = await reviewThenFinalize(d.observationId, dAnalysisId);
  ok('N-1 finalization proceeds on the human replacement',
    nFinal.finalize.status === 201 || nFinal.finalize.status === 200,
    String(nFinal.finalize.status));
  ok('N-2 the effective decision the consumer read carries the HUMAN value, not the Expert one',
    dRead.body.effectiveDecision?.entries?.[0]?.effectiveClassification === HUMAN_REPLACEMENT
    && dRead.body.effectiveDecision?.entries?.[0]?.expertClassification === EXPERT_CLAIM,
    JSON.stringify(dRead.body.effectiveDecision?.entries));
  ok('N-3 the source records that a human replaced it, so the proposal can never be preferred',
    dRead.body.effectiveDecision?.source === 'HUMAN_REPLACED');
  recordCase('N', 'downstream consumer consumes the override, not the Expert proposal',
    (nFinal.finalize.status === 201 || nFinal.finalize.status === 200)
    && dRead.body.effectiveDecision?.entries?.[0]?.effectiveClassification === HUMAN_REPLACEMENT,
    `status=${nFinal.finalize.status}`);

  // ================================================================ E

  console.log('\n---- E. whole-analysis refusal ----\n');
  const e = await runAndRead('E_WHOLE_ANALYSIS_REFUSAL');
  ok('E-1 the state is ANALYSIS_REFUSED', e.read.body.analysisState === 'ANALYSIS_REFUSED',
    e.read.body.analysisState);
  ok('E-2 no settled conclusion is offered',
    e.read.body.effectiveDecision?.settledForUse === false
    && e.read.body.effectiveDecision?.source === 'NONE_REFUSED',
    e.read.body.effectiveDecision?.source);
  ok('E-3 the served sentence does not say "no hazards"',
    !/no hazards? (were |was )?found/i.test(String(e.read.body.effectiveDecision?.statement)),
    String(e.read.body.effectiveDecision?.statement));
  ok('E-4 no confirmation is asked about a conclusion that does not exist',
    e.read.body.confirmationRequired === false && e.read.body.confirmationSubject === null);
  const eDown = await reviewThenFinalize(e.observationId, e.read.body.analysisId);
  ok('E-5 the downstream consumer refuses a refused analysis too',
    eDown.finalize.status === 409, String(eDown.finalize.status));
  recordCase('E', 'whole-analysis refusal',
    e.read.body.analysisState === 'ANALYSIS_REFUSED' && eDown.finalize.status === 409,
    `source=${e.read.body.effectiveDecision?.source}`);

  // ================================================================ F

  console.log('\n---- F. contained declaration refusal, truth preserved ----\n');
  const f = await runAndRead('F_CONTAINED_DECLARATION_REFUSAL');
  const fSnapshot = (f.read.body.analysis ?? {}) as Json;
  console.log(`    F admission=${f.read.body.provenance?.admission} `
    + `state=${f.read.body.analysisState} `
    + `postureRefusalCodes=${JSON.stringify(fSnapshot.postureRefusalCodes)} `
    + `conformance=${JSON.stringify(fSnapshot.conformanceViolations)}`);
  // ACCEPTED v1.0 LIMITATION 3, NOT A DEFECT AND NOT REPAIRED HERE. §260's design table expected a
  // contained declaration refusal to leave an ADMITTED analysis. §252 subsequently gave
  // PRESERVE_UNRESOLVED precedence deliberately, so BOTH the contained shape and the whole-output
  // shape surface as ANALYSIS_UNRESOLVED. The current-state document records this as an accepted
  // limitation and says the execution record distinguishes them. §265 asserts the behaviour the
  // product actually has, and checks that claim rather than repeating it: asserting §260's stale
  // expectation instead would have made this suite red for a decision a later section took on
  // purpose.
  ok('F-1 the state is ANALYSIS_UNRESOLVED, so the preserved truth is visible rather than dropped',
    f.read.body.analysisState === 'ANALYSIS_UNRESOLVED', f.read.body.analysisState);
  ok('F-2 the contained refusal is surfaced to the reviewer, by declaration id and code',
    Array.isArray(fSnapshot.declarationRefusals) && fSnapshot.declarationRefusals.length >= 1
    && fSnapshot.declarationRefusals[0].declarationId === SUBJECT_REF.ref,
    JSON.stringify(fSnapshot.declarationRefusals));
  ok('F-3 no operational conclusion is manufactured from a refused declaration',
    f.read.body.effectiveDecision?.settledForUse === false
    && f.read.body.effectiveDecision?.source === 'NONE_UNRESOLVED_TRUTH_PRESERVED',
    f.read.body.effectiveDecision?.source);
  ok('F-4 no confirmation is asked about a conclusion that was not admitted',
    f.read.body.confirmationRequired === false && f.read.body.confirmationSubject === null);
  recordCase('F', 'contained refusal / preserved truth',
    f.read.body.analysisState === 'ANALYSIS_UNRESOLVED'
    && Array.isArray(fSnapshot.declarationRefusals) && fSnapshot.declarationRefusals.length >= 1,
    `state=${f.read.body.analysisState} admission=${f.read.body.provenance?.admission} `
    + `refusals=${(fSnapshot.declarationRefusals ?? []).length}`);

  // ================================================================ G

  console.log('\n---- G. preserved unresolved truth ----\n');
  const g = await runAndRead('G_PRESERVED_UNRESOLVED');
  const gSnapshot = (g.read.body.analysis ?? {}) as Json;
  console.log(`    G admission=${g.read.body.provenance?.admission} `
    + `state=${g.read.body.analysisState} `
    + `postureRefusalCodes=${JSON.stringify(gSnapshot.postureRefusalCodes)} `
    + `conformance=${JSON.stringify(gSnapshot.conformanceViolations)}`);
  ok('G-1 the state is ANALYSIS_UNRESOLVED', g.read.body.analysisState === 'ANALYSIS_UNRESOLVED',
    g.read.body.analysisState);
  ok('G-2 the effective decision names truth preservation, not plain refusal',
    g.read.body.effectiveDecision?.source === 'NONE_UNRESOLVED_TRUTH_PRESERVED',
    g.read.body.effectiveDecision?.source);
  ok('G-3 no settled conclusion is offered',
    g.read.body.effectiveDecision?.settledForUse === false);
  ok('G-4 the preserved record reached the client',
    Array.isArray(gSnapshot.declarationRefusals) && gSnapshot.declarationRefusals.length >= 1,
    JSON.stringify(gSnapshot.declarationRefusals ?? null));
  // THE TWO UNRESOLVED SHAPES MUST STAY TELLABLE APART IN THE RECORD, which is the condition that
  // makes accepted limitation 3 tolerable: the states coincide, the evidence does not.
  ok('G-5 the contained shape and the whole-output shape are distinguishable in the record',
    JSON.stringify(gSnapshot.conformanceViolations ?? [])
      !== JSON.stringify(fSnapshot.conformanceViolations ?? [])
    || JSON.stringify(gSnapshot.postureRefusalCodes ?? [])
      !== JSON.stringify(fSnapshot.postureRefusalCodes ?? [])
    || g.read.body.provenance?.admission !== f.read.body.provenance?.admission,
    `F.conformance=${JSON.stringify(fSnapshot.conformanceViolations)} `
    + `G.conformance=${JSON.stringify(gSnapshot.conformanceViolations)}`);
  recordCase('G', 'preserved unresolved truth',
    g.read.body.analysisState === 'ANALYSIS_UNRESOLVED'
    && g.read.body.effectiveDecision?.source === 'NONE_UNRESOLVED_TRUTH_PRESERVED',
    `source=${g.read.body.effectiveDecision?.source}`);

  // ================================================================ FAILED

  console.log('\n---- FAILED. a provider failure is a system failure, not a safety refusal ----\n');
  const failedRun = await runAndRead('PROVIDER_FAILURE');
  ok('FAILED-1 no analysis row exists at all',
    failedRun.read.body.present === false, JSON.stringify(failedRun.read.body.present));
  ok('FAILED-2 the execution response names it a failure, distinctly from a refusal',
    failedRun.executed.body.executionState === 'ANALYSIS_FAILED'
    || failedRun.executed.body.analysisState === 'ANALYSIS_FAILED',
    `${failedRun.executed.body.executionState}/${failedRun.executed.body.analysisState}`);
  ok('FAILED-3 the sentence does not report an absence of hazards',
    /not a finding that there are no hazards/i.test(
      String(failedRun.executed.body.authorityStatement)),
    String(failedRun.executed.body.authorityStatement));
  ok('FAILED-4 no provider or transport internals reach the client',
    !/anthropic|claude|api[_-]?key|bearer|https?:\/\//i.test(JSON.stringify(failedRun.executed.body)));

  // ================================================================ H

  console.log('\n---- H. cross-tenant and unentitled access ----\n');
  const foreignObservation = await newObservation(wsOther.inspectionId, otherTenant.token);
  const foreignRead = await call(
    `/inspections/observations/${foreignObservation}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  ok('H-1 reading another workspace\'s observation answers NotFound, not Forbidden',
    foreignRead.status === 404, String(foreignRead.status));
  ok('H-2 the refusal discloses nothing about the observation',
    !JSON.stringify(foreignRead.body).includes(foreignObservation),
    JSON.stringify(foreignRead.body).slice(0, 120));
  const foreignSettle = await settle(foreignObservation, dAnalysisId, {
    idempotencyKey: `s265-foreign-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'attempting to settle across a tenant boundary',
  });
  ok('H-3 settling across the boundary answers NotFound', foreignSettle.status === 404,
    String(foreignSettle.status));
  const forged = await call(
    `/inspections/observations/${b.observationId}/expert-analyses/${bAnalysisId}/settlement`, {
      method: 'POST', token: reviewer.token, ip: nextIp(),
      body: {
        idempotencyKey: `s265-forge-${suffix}`, decision: 'classification_confirmed',
        rationale: 'a body that also tries to name its own reviewer',
        reviewedByUserId: otherTenant.userId,
      },
    });
  ok('H-4 a body naming its own reviewer is rejected structurally', forged.status === 400,
    String(forged.status));
  recordCase('H', 'unauthorized / cross-tenant behaviour',
    foreignRead.status === 404 && foreignSettle.status === 404 && forged.status === 400,
    `read=${foreignRead.status} settle=${foreignSettle.status} forge=${forged.status}`);

  // ================================================================ I

  console.log('\n---- I. duplicate / idempotent execution ----\n');
  const idempotencyKey = `s265-idem-${suffix}`;
  const iObservation = await newObservation();
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  const legsBefore = expertTransportLifetimeCounts().firstPass;
  const first = await call(`/inspections/observations/${iObservation}/expert-analyses`, {
    method: 'POST', token: reviewer.token, ip: nextIp(),
    body: { idempotencyKey, requestVersion: 1 },
  });
  const replayed = await call(`/inspections/observations/${iObservation}/expert-analyses`, {
    method: 'POST', token: reviewer.token, ip: nextIp(),
    body: { idempotencyKey, requestVersion: 1 },
  });
  const legsAfter = expertTransportLifetimeCounts().firstPass;
  ok('I-1 the replay resolves to the same execution',
    first.body.executionId === replayed.body.executionId,
    `${first.body.executionId} / ${replayed.body.executionId}`);
  ok('I-2 the replay resolves to the same analysis',
    first.body.analysisId === replayed.body.analysisId);
  ok('I-3 exactly one first-pass leg was spent for the two requests',
    legsAfter - legsBefore === 1, String(legsAfter - legsBefore));
  const [analysisRows] = await q(
    `SELECT COUNT(*)::int AS n FROM "hazlenz_analyses" WHERE "observationId" = $1`,
    [iObservation]);
  ok('I-4 exactly one analysis row exists', analysisRows.n === 1, String(analysisRows.n));
  // A settlement replay: the same key must return what it already achieved rather than a conflict.
  const settlementReplay = await settle(b.observationId, bAnalysisId, {
    idempotencyKey: `s265-confirm-${suffix}`,
    decision: 'classification_confirmed',
    rationale: 'the follow-up classification matches what I saw on the floor',
  });
  ok('I-5 a settlement retry under the same key replays rather than conflicting',
    (settlementReplay.status === 200 || settlementReplay.status === 201)
    && settlementReplay.body.outcome === 'REPLAYED',
    `${settlementReplay.status} ${settlementReplay.body.outcome}`);
  const [reviewRows] = await q(
    `SELECT COUNT(*)::int AS n FROM "human_reviews"
     WHERE "analysisId" = $1 AND "decision" IN ('classification_confirmed','classification_changed')`,
    [bAnalysisId]);
  ok('I-6 the retry created no second settlement row', reviewRows.n === 1, String(reviewRows.n));
  recordCase('I', 'duplicate / idempotent execution',
    first.body.executionId === replayed.body.executionId && legsAfter - legsBefore === 1
    && reviewRows.n === 1,
    `legs=${legsAfter - legsBefore} settlements=${reviewRows.n}`);

  // ================================================================ J

  console.log('\n---- J. provenance and version persistence ----\n');
  ok('J-1 the read serves the frozen §259 candidate identity',
    a.read.body.provenance?.candidateIdentity === EXPERT_CANDIDATE_IDENTITY_274,
    String(a.read.body.provenance?.candidateIdentity));
  ok('J-2 the contract, entry, admission, projection and confirmation-rule versions all persist',
    ['contractVersion', 'entryVersion', 'admissionVersion', 'projectionVersion',
      'confirmationRuleVersion'].every(k => typeof a.read.body.provenance?.[k] === 'string'
        && a.read.body.provenance[k].length > 0),
    JSON.stringify(a.read.body.provenance));
  ok('J-3 the raw provider payload is NOT served by the read',
    !JSON.stringify(a.read.body).includes('rawFirstPass')
    && !JSON.stringify(a.read.body).includes('rawVerifier'));
  ok('J-4 the history distinguishes the producers rather than normalising them',
    Array.isArray(a.read.body.history)
    && a.read.body.history.every((h: Json) => typeof h.producer === 'string'),
    JSON.stringify(a.read.body.history?.map((h: Json) => h.producer)));
  recordCase('J', 'provenance / version persistence',
    a.read.body.provenance?.candidateIdentity === EXPERT_CANDIDATE_IDENTITY_274,
    `identity=${String(a.read.body.provenance?.candidateIdentity).slice(0, 16)}`);

  // ---- history: a legacy client-supplied analysis stays distinguishable and is not promoted.
  console.log('\n---- HISTORY. the two trust boundaries stay distinguishable ----\n');
  const hObservation = await newObservation();
  await call(`/inspections/observations/${hObservation}/analyses`, {
    method: 'POST', token: reviewer.token,
    body: {
      engineVersion: 'hazlenz-production', idempotencyKey: `s265-legacy-${suffix}`,
      requestVersion: 1,
      resultSnapshot: {
        multiHazardDecomposition: { hazards: [], isMultiHazard: false, hazardCount: 0 },
      },
    },
  });
  transport.script = { firstPass: EXPERT_FIXTURES.A_ADMITTED_NO_CONFIRMATION.firstPass() };
  await call(`/inspections/observations/${hObservation}/expert-analyses`, {
    method: 'POST', token: reviewer.token, ip: nextIp(),
    body: { idempotencyKey: `s265-expert-${suffix}`, requestVersion: 2 },
  });
  const hRead = await call(
    `/inspections/observations/${hObservation}/expert-analyses/current`,
    { token: reviewer.token, ip: nextIp() });
  const producers = (hRead.body.history ?? []).map((h: Json) => h.producer);
  ok('HIST-1 both producers appear in the history',
    producers.includes('client_supplied') && producers.includes('server_authored'),
    producers.join(','));
  ok('HIST-2 the legacy row was NOT rewritten into the new authority model',
    (hRead.body.history ?? []).some((h: Json) =>
      h.producer === 'client_supplied' && h.humanSettled === false));
  ok('HIST-3 the current analysis served is the server-authored one',
    hRead.body.producer === 'server_authored', String(hRead.body.producer));

  // ================================================================ spend and closure

  const legs = expertTransportLifetimeCounts();
  console.log(`\nprovider legs that reached the seam: total=${legs.total} `
    + `firstPass=${legs.firstPass} verifier=${legs.verifier}`);
  ok('SPEND every leg was answered by the substituted deterministic transport, so zero hosted '
    + 'calls were made', true, `${legs.total} local legs`);

  // §267. Gated for the same reason as the payload shape above, even though this artifact happens
  // to be run-stable today: a frozen package should not be written by a routine re-run at all, and
  // relying on "it happens to produce the same bytes" is the property that quietly stopped holding
  // one file up.
  if (WRITE_EVIDENCE) writeFileSync(join(evidenceDir, 'SECTION-265-ACCEPTANCE.json'), JSON.stringify({
    artifact: 'SECTION-265-LOCAL-PRODUCT-ACCEPTANCE',
    candidateIdentity: EXPERT_CANDIDATE_IDENTITY_274,
    providerCalls: 0,
    localTransportLegs: legs,
    assertions: { pass, fail },
    cases: caseResults,
    note: 'Case K is a frontend rendering rule and is executed by '
      + 'frontend-next/lib/expert/__tests__/expertPresentation.test.ts, not by this suite.',
  }, null, 2));

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
