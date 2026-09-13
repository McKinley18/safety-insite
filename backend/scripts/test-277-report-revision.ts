/**
 * §277 / D-028 — ISSUED REPORTS ARE IMMUTABLE ARTIFACTS. A RELEASE GATE. TIER 2, REAL HTTP.
 *
 * ==================== WHAT THIS FAILS ON ====================
 *
 * It fails if a correction MUTATES a report that was already issued, or destroys it, or
 * leaves the history unable to say which revision was current when.
 *
 * §276 measured the shape of the problem from the other side: the brand and severity
 * corrections could not reach a report that had already been generated, because the report
 * fingerprint covered the inspection snapshot alone and nothing about the inspection had
 * moved. The pre-§277 write path then made the opposite mistake whenever it DID regenerate
 * -- it deleted the previous rows and destroyed their PDFs, so the record of what the
 * customer had actually been given disappeared.
 *
 * D-028 settles both: a correction produces a NEW REVISION with its own id, timestamp and
 * checksum; the previous artifact is marked SUPERSEDED rather than deleted; and history can
 * distinguish them.
 *
 * ZERO PROVIDER CALLS. Database operations only against a disposable `test_*` database,
 * created and dropped by the §263 wrapper.
 *
 * Run: npm run test:277-report-revision:db
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§277 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§277 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§277 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§277 REFUSED: NODE_ENV must be test.');
  console.log('target proven disposable\n');
}

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

let baseUrl = '';
type Json = Record<string, any>;
async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string; ip?: string; raw?: boolean } = {},
): Promise<{ status: number; body: Json; bytes?: Buffer }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.ip) headers['x-forwarded-for'] = options.ip;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (options.raw) {
    return { status: response.status, body: {}, bytes: Buffer.from(await response.arrayBuffer()) };
  }
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

const OBSERVATION =
  'The point of operation guard on the 60-ton punch press in the fabrication bay has been '
  + 'removed. The press is energized and cycling on production parts, and the operator\'s hands '
  + 'enter the die area between strokes to reposition the blank.';

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§277 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const suffix = `${Date.now()}`;
  const password = 'Section277!StrongPass123';
  const email = `s277-reports-${suffix}@example.test`;
  await call('/auth/register', {
    method: 'POST', ip: '10.277.1.1', body: { email, password, name: 's277', type: 'individual' },
  });
  const login = await call('/auth/login', { method: 'POST', ip: '10.277.1.2', body: { email, password } });
  const token = login.body?.token as string;
  if (!token) throw new Error(`§277 ABORT: no session (${login.status})`);
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', login.body.user.id, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });

  // =====================================================================================
  // SEED. One completed inspection with one finalized finding -- the least a report needs.
  // =====================================================================================
  const site = await call('/sites', { method: 'POST', token, body: { name: `s277-site-${suffix}` } });
  const inspection = await call('/inspections', {
    method: 'POST', token,
    body: { siteId: site.body.id, title: `s277-${suffix}`, regulatoryContext: 'osha-general-industry' },
  });
  const inspectionId = inspection.body.id as string;

  const observation = await call(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token, body: { rawText: OBSERVATION },
  });
  const observationId = observation.body.id as string;

  const classified = await call('/hazlenz/classify', {
    method: 'POST', token, body: { text: OBSERVATION, scopes: ['osha_general_industry'] },
  });
  const analysis = await call(`/inspections/observations/${observationId}/analyses`, {
    method: 'POST', token,
    body: {
      engineVersion: 'hazlenz-s277', idempotencyKey: `s277-analysis-${suffix}`,
      requestVersion: 1, resultSnapshot: classified.body,
    },
  });

  /**
   * EVERY pending finding is reviewed, not just the first. The observation decomposes into
   * more than one hazard, and the completion gate refuses while any current finding is
   * unreviewed -- correctly. A seed that reviewed one of them made the whole suite report
   * vacuous passes against `undefined`, which is worse than a failure.
   */
  const withFindings = await call(`/inspections/${inspectionId}`, { token });
  const pending = (withFindings.body.findings || [])
    .filter((finding: Json) => finding.observationId === observationId && finding.status === 'pending_review');
  ok('SEED0 the observation produced findings to review', pending.length > 0, `${pending.length}`);

  for (const [index, finding] of pending.entries()) {
    const review = await call(`/inspections/observations/${observationId}/reviews`, {
      method: 'POST', token,
      body: {
        analysisId: analysis.body.id, findingId: finding.id, decision: 'accepted',
        rationale: '§277 report-revision fixture: this finding is accepted as analysed.',
      },
    });
    const finalized = await call(`/inspections/observations/${observationId}/findings`, {
      method: 'POST', token,
      body: {
        reviewId: review.body.id,
        hazardCategory: finding.hazardCategory || 'Machine guarding',
        segmentKey: finding.segmentKey || finding.hazardKey,
        conclusion: `Reviewed condition ${index + 1}: point-of-operation guard removed while the press is cycling.`,
        reviewerDisposition: 'single',
      },
    });
    ok(`SEED1.${index + 1} finding ${index + 1} of ${pending.length} is finalized`,
      finalized.status < 400, `status ${finalized.status} ${String(finalized.body?.message || '').slice(0, 70)}`);
  }

  // draft -> in_review -> completed. The state machine has no draft -> completed edge, and
  // the product's own workflow makes the same two moves.
  const beforeReview = await call(`/inspections/${inspectionId}`, { token });
  const inReview = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', token, body: { status: 'in_review', version: beforeReview.body.version },
  });
  ok('SEED1b the inspection moves to in_review', inReview.status < 400,
    `status ${inReview.status} ${String(inReview.body?.message || '').slice(0, 70)}`);

  const refreshed = await call(`/inspections/${inspectionId}`, { token });
  const completed = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', token, body: { status: 'completed', version: refreshed.body.version },
  });
  ok('SEED2 the inspection completes', completed.status < 400,
    `status ${completed.status} ${String(completed.body?.message || '').slice(0, 90)}`);
  if (completed.status >= 400) {
    const readiness = await call(`/inspections/${inspectionId}/completion-readiness`, { token });
    console.log('   readiness:', JSON.stringify(readiness.body));
  }

  /**
   * REFUSE RATHER THAN REPORT VACUOUS PASSES. Every assertion below compares real report
   * identities; run against a seed that never produced one, they compare `undefined` with
   * `undefined` and several of them PASS. A suite that can pass without exercising anything
   * is worse than a failing one, because it is believed.
   */
  if (fail > 0) {
    console.error('\n§277 ABORT: the fixture did not reach a completed inspection, so no report '
      + 'assertion below would exercise anything. Refusing to report vacuous results.');
    await app.close();
    process.exit(1);
  }

  // =====================================================================================
  // REVISION 1. The first issue.
  // =====================================================================================
  const first = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', token });
  ok('R1 a report is issued', first.status < 400, `status ${first.status}`);
  const reportId = first.body.reportId as string;
  const firstChecksum = first.body.checksum as string;
  const firstVersion = first.body.version as number;
  ok('R2 it carries a checksum', Boolean(firstChecksum), String(firstChecksum).slice(0, 16));

  const firstBytes = await call(`/inspection-reports/${reportId}/versions/${firstVersion}/download`, { token, raw: true });
  const firstSha = createHash('sha256').update(firstBytes.bytes as Buffer).digest('hex');
  ok('R3 the issued bytes match the recorded checksum', firstSha === firstChecksum,
    `${firstSha.slice(0, 16)} vs ${String(firstChecksum).slice(0, 16)}`);

  // =====================================================================================
  // AN UNCHANGED REGENERATION IS NOT A REVISION. Re-issuing identical content would destroy
  // a valid artifact to recreate the same one, and would inflate the history with revisions
  // that differ in nothing.
  // =====================================================================================
  const replay = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', token });
  ok('U1 an unchanged regeneration returns the same revision',
    replay.body.versionId === first.body.versionId, `${replay.body.versionId} vs ${first.body.versionId}`);
  ok('U2 with the same checksum', replay.body.checksum === firstChecksum, '');
  const afterReplay = await call(`/inspection-reports/${reportId}/revisions`, { token });
  ok('U3 and creates no second revision', afterReplay.body.revisionCount === 1,
    `${afterReplay.body.revisionCount} revision(s)`);

  // =====================================================================================
  // THE CORRECTION. A renderer/severity/branding correction is represented by the generator
  // identity moving, which is what §277 made part of the report fingerprint. Simulated here
  // by moving the stored fingerprint, because the constant cannot change inside one process
  // -- what is under test is the WRITE PATH's behaviour when a correction makes the current
  // fingerprint differ, not the arithmetic of the hash itself.
  // =====================================================================================
  await ds.query(
    `UPDATE inspection_report_versions SET "sourceFingerprint" = $1 WHERE "reportId" = $2`,
    [createHash('sha256').update(`pre-correction-${suffix}`).digest('hex'), reportId],
  );

  const corrected = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', token });
  ok('C1 a correction issues a NEW revision', corrected.status < 400 && corrected.body.versionId !== first.body.versionId,
    `${corrected.body.versionId}`);
  ok('C2 with a distinct revision number', corrected.body.version !== firstVersion,
    `${firstVersion} -> ${corrected.body.version}`);
  ok('C3 and its own generation timestamp',
    Boolean(corrected.body.generatedAt) && corrected.body.generatedAt !== first.body.generatedAt,
    `${first.body.generatedAt} -> ${corrected.body.generatedAt}`);

  // =====================================================================================
  // THE ISSUED ARTIFACT IS IMMUTABLE. Not rewritten, not deleted, still downloadable, still
  // byte-identical to what was handed out.
  // =====================================================================================
  const history = await call(`/inspection-reports/${reportId}/revisions`, { token });
  const revisions = (history.body.revisions || []) as Json[];
  const original = revisions.find((r) => r.revision === firstVersion);
  const current = revisions.find((r) => r.revisionId === history.body.currentRevisionId);

  ok('I1 the original revision still exists', Boolean(original), JSON.stringify(revisions.map((r) => r.revision)));
  ok('I2 it is marked superseded, not deleted', original?.status === 'superseded', String(original?.status));
  ok('I3 it names the revision that superseded it',
    original?.supersededByRevisionId === corrected.body.versionId,
    `${original?.supersededByRevisionId}`);
  ok('I4 its checksum is unchanged', original?.checksum === firstChecksum, '');

  const originalBytesAgain = await call(
    `/inspection-reports/${reportId}/versions/${firstVersion}/download`, { token, raw: true });
  ok('I5 the superseded artifact is STILL DOWNLOADABLE', originalBytesAgain.status === 200,
    `status ${originalBytesAgain.status}`);
  const originalShaAgain = createHash('sha256').update(originalBytesAgain.bytes as Buffer).digest('hex');
  ok('I6 and byte-identical to what was issued', originalShaAgain === firstSha,
    `${originalShaAgain.slice(0, 16)} vs ${firstSha.slice(0, 16)}`);

  // =====================================================================================
  // THE NEW REVISION IS CURRENT, AND UNAMBIGUOUSLY SO.
  // =====================================================================================
  ok('N1 the correction is the current revision', current?.revisionId === corrected.body.versionId, '');
  ok('N2 it is not itself superseded', current?.supersededByRevisionId === null, String(current?.supersededByRevisionId));
  ok('N3 exactly one revision is current', revisions.filter((r) => r.isCurrent).length === 1,
    `${revisions.filter((r) => r.isCurrent).length}`);
  ok('N4 the distinct checksums differ', current?.checksum !== original?.checksum, '');

  const currentRead = await call(`/inspections/${inspectionId}/report`, { token });
  ok('N5 the inspection resolves to the corrected revision',
    currentRead.body.versionId === corrected.body.versionId, '');
  const currentDownload = await call(`/inspection-reports/${reportId}/download`, { token, raw: true });
  const currentSha = createHash('sha256').update(currentDownload.bytes as Buffer).digest('hex');
  ok('N6 and downloading "the report" gives the corrected bytes', currentSha === corrected.body.checksum,
    `${currentSha.slice(0, 16)} vs ${String(corrected.body.checksum).slice(0, 16)}`);

  // =====================================================================================
  // HISTORY CAN DISTINGUISH REVISIONS.
  // =====================================================================================
  ok('H1 the history holds both revisions', history.body.revisionCount === 2, `${history.body.revisionCount}`);
  ok('H2 each carries its own identity',
    new Set(revisions.map((r) => r.revisionId)).size === revisions.length, '');
  ok('H3 each carries its own checksum',
    new Set(revisions.map((r) => r.checksum)).size === revisions.length, '');
  ok('H4 each carries the generator that produced it',
    revisions.every((r) => Boolean(r.generatorVersion)), JSON.stringify(revisions.map((r) => r.generatorVersion)));
  ok('H5 newest first', revisions[0].revision > revisions[1].revision, '');

  /**
   * The artifact belonging to a superseded revision must not be swept as an orphan. Before
   * §277 the row was deleted, which is exactly what made its artifact look unreferenced.
   */
  const storageRows = await ds.query(
    `SELECT o.status, o."deletedAt" FROM storage_objects o
      WHERE o."parentType" = 'report_version' AND o."parentId" = $1`, [original?.revisionId]);
  ok('H6 the superseded revision\'s stored artifact is alive, not retired',
    storageRows.length === 1 && storageRows[0].status === 'ready' && storageRows[0].deletedAt === null,
    JSON.stringify(storageRows));

  // =====================================================================================
  // A THIRD REVISION CHAINS, RATHER THAN FLATTENING THE HISTORY.
  // =====================================================================================
  await ds.query(
    `UPDATE inspection_report_versions SET "sourceFingerprint" = $1 WHERE "reportId" = $2 AND status = 'generated'`,
    [createHash('sha256').update(`second-correction-${suffix}`).digest('hex'), reportId],
  );
  const third = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', token });
  const history3 = await call(`/inspection-reports/${reportId}/revisions`, { token });
  const revisions3 = (history3.body.revisions || []) as Json[];
  ok('T1 a third revision is added, not substituted', history3.body.revisionCount === 3,
    `${history3.body.revisionCount}`);
  ok('T2 the first revision is still superseded by the SECOND, not rewritten to the third',
    revisions3.find((r) => r.revision === firstVersion)?.supersededByRevisionId === corrected.body.versionId, '');
  ok('T3 the second is now superseded by the third',
    revisions3.find((r) => r.revisionId === corrected.body.versionId)?.supersededByRevisionId === third.body.versionId, '');
  ok('T4 still exactly one current revision', revisions3.filter((r) => r.isCurrent).length === 1, '');
  ok('T5 every earlier artifact remains downloadable',
    (await call(`/inspection-reports/${reportId}/versions/${firstVersion}/download`, { token, raw: true })).status === 200
    && (await call(`/inspection-reports/${reportId}/versions/${corrected.body.version}/download`, { token, raw: true })).status === 200,
    '');

  // =====================================================================================
  // CROSS-WORKSPACE. Revision history is as protected as the report itself.
  // =====================================================================================
  const otherEmail = `s277-other-${suffix}@example.test`;
  await call('/auth/register', {
    method: 'POST', ip: '10.277.2.1', body: { email: otherEmail, password, name: 's277-other', type: 'individual' },
  });
  const otherLogin = await call('/auth/login', { method: 'POST', ip: '10.277.2.2', body: { email: otherEmail, password } });
  const otherToken = otherLogin.body?.token as string;
  const foreignHistory = await call(`/inspection-reports/${reportId}/revisions`, { token: otherToken });
  ok('X1 another workspace cannot read the revision history',
    foreignHistory.status === 404 || foreignHistory.status === 403, `status ${foreignHistory.status}`);
  const foreignDownload = await call(`/inspection-reports/${reportId}/versions/${firstVersion}/download`, { token: otherToken });
  ok('X2 nor download a superseded revision',
    foreignDownload.status === 404 || foreignDownload.status === 403, `status ${foreignDownload.status}`);

  await app.close();

  console.log(`\n${pass} passed, ${fail} failed.`);
  if (fail > 0) {
    console.error(`\nFAILED: ${failures.join(', ')}`);
    console.error(
      'D-028 is the rule this gate exists to hold: an issued report is an immutable artifact. '
      + 'A correction creates a NEW revision with its own identity, timestamp and checksum; the '
      + 'previous artifact is marked superseded, never mutated and never deleted.',
    );
    process.exit(1);
  }
  console.log('§277 D-028 report revision: PASS');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
