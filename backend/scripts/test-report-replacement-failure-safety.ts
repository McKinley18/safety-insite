/**
 * A FAILED REPLACEMENT MUST LEAVE THE CUSTOMER'S EXISTING REPORT INTACT.
 *
 * The v1.0 contract keeps one report per inspection and REPLACES it when a reopened inspection is
 * finished again. The dangerous way to implement that is to clear the old report first and then
 * generate; this suite exists to prove the implementation does the opposite -- the existing report
 * survives untouched until a successor has actually been produced and persisted.
 *
 * THE FAILURE IS REAL, NOT INSTRUMENTED. No test hook, environment flag or mock is added to
 * production code. The private storage root is made unwritable for the duration of one
 * regeneration attempt, so the replacement fails exactly where a real disk/bucket failure would:
 * after the snapshot row has been created and the PDF rendered, while persisting the artifact.
 * A fault the production code could distinguish from a real one would prove nothing.
 *
 * Asserted after the failure:
 *   - the inspection still has exactly ONE report snapshot, and it is the ORIGINAL one;
 *   - the original artifact is still `ready` and still downloadable;
 *   - the downloaded bytes are byte-identical to before the failed attempt;
 *   - no half-made replacement row survives;
 *   - no orphaned storage object was left behind;
 *   - the failure was recorded as `report_generation_failed`;
 *   - and once storage recovers, the replacement succeeds and the report is genuinely replaced.
 *
 *   API_BASE_URL=... DATABASE_URL=... STORAGE_LOCAL_ROOT=... \
 *     npx ts-node scripts/test-report-replacement-failure-safety.ts
 */
const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };
import { chmod, mkdir, readdir } from 'fs/promises';
import { createHash } from 'crypto';
import { join } from 'path';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4106';
const databaseUrl = process.env.DATABASE_URL || '';
const storageRoot = process.env.STORAGE_LOCAL_ROOT || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required.');
if (!storageRoot) throw new Error('STORAGE_LOCAL_ROOT is required (this suite injects a real storage failure).');

let db: any = null;
const checks: string[] = [];
const failures: string[] = [];
function check(label: string, ok: boolean, detail = '') {
  (ok ? checks : failures).push(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` -- ${detail}` : ''}`);
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${label}${detail ? ` -- ${detail}` : ''}`);
}

async function json(path: string, options: RequestInit = {}, expected: number | number[] = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(response.status)) throw new Error(`${options.method || 'GET'} ${path}: ${response.status}: ${text}`);
  return body;
}

async function main() {
  const suffix = Date.now();
  const email = `replacement-safety-${suffix}@example.test`;
  const password = 'Replacement!StrongPass123';
  await json('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: email, type: 'individual' }) }, 201);
  const session = await json('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const headers = { authorization: `Bearer ${session.token}` };

  db = new Client({ connectionString: databaseUrl });
  await db.connect();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'pilot','pro','active',now(),now()+interval '1 day',$1,'Replacement failure-safety verification')`,
    [session.user.id],
  );

  const site = await json('/sites', { method: 'POST', headers, body: JSON.stringify({ name: `Replacement safety ${suffix}` }) }, 201);
  const inspection = await json('/inspections', {
    method: 'POST', headers, body: JSON.stringify({ siteId: site.id, title: 'Replacement failure safety' }),
  }, 201);
  check('the inspection was given a customer-facing record number',
    Number.isInteger(inspection.displayNumber) && inspection.displayNumber >= 1,
    `#${inspection.displayNumber}`);

  const observation = await json(`/inspections/${inspection.id}/observations`, {
    method: 'POST', headers,
    body: JSON.stringify({ rawText: 'An unguarded conveyor nip point was observed at the tail pulley.', evidenceSource: 'direct_observation' }),
  }, 201);
  const analysis = await json(`/inspections/observations/${observation.id}/analyses`, {
    method: 'POST', headers,
    body: JSON.stringify({ engineVersion: 'replacement-safety', idempotencyKey: `analysis-${suffix}`, requestVersion: 1, resultSnapshot: { advisory: true, classification: 'machine_guarding' } }),
  }, 201);
  const review = await json(`/inspections/observations/${observation.id}/reviews`, {
    method: 'POST', headers, body: JSON.stringify({ analysisId: analysis.id, decision: 'accepted', rationale: 'Nip point confirmed unguarded.' }),
  }, 201);
  await json(`/inspections/observations/${observation.id}/findings`, {
    method: 'POST', headers, body: JSON.stringify({ reviewId: review.id, hazardCategory: 'machine_guarding', conclusion: 'Tail pulley nip point requires a guard.' }),
  }, 201);

  const inReview = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'in_review', version: inspection.version }) }, 201);
  const completed = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'completed', version: inReview.version }) }, 201);

  // ------------------------------------------------------------------- the report that must survive
  const original = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers }, 201);
  const originalPdf = await fetch(`${baseUrl}/inspection-reports/${original.reportId}/download`, { headers });
  const originalBytes = Buffer.from(await originalPdf.arrayBuffer());
  const originalDigest = createHash('sha256').update(originalBytes).digest('hex');
  check('the original report downloads as a PDF', originalPdf.status === 200 && originalBytes.subarray(0, 5).toString() === '%PDF-');
  check('the downloaded bytes match the stored checksum', originalDigest === original.checksum, originalDigest.slice(0, 16));

  const originalObjectId = (await db.query(
    `SELECT "storageObjectId" FROM inspection_report_versions WHERE id=$1`, [original.versionId],
  )).rows[0]?.storageObjectId;
  check('the original report has a stored artifact', !!originalObjectId);

  // ------------------------------------------------------------------------ a real storage failure
  const reopened = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'draft', version: completed.version }) }, 201);
  const edited = await json(`/inspections/${inspection.id}`, {
    method: 'PATCH', headers, body: JSON.stringify({ title: 'Replacement failure safety -- edited', version: reopened.version }),
  }, 200);
  const reReview = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'in_review', version: edited.version }) }, 201);
  await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'completed', version: reReview.version }) }, 201);

  // The whole `report/` subtree, not just its root: the provider writes into a dated subdirectory
  // that already exists, and making only the parent read-only leaves that subdirectory writable --
  // the fault would then not be injected at all and the suite would prove nothing.
  const reportDir = join(storageRoot, 'report');
  await mkdir(reportDir, { recursive: true });
  const reportSubdirs = (await readdir(reportDir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => join(reportDir, entry.name));
  const lockedDirs = [reportDir, ...reportSubdirs];
  for (const dir of lockedDirs) await chmod(dir, 0o555);
  let failedStatus = 0;
  try {
    const attempt = await fetch(`${baseUrl}/inspections/${inspection.id}/reports`, { method: 'POST', headers });
    failedStatus = attempt.status;
  } finally {
    for (const dir of lockedDirs) await chmod(dir, 0o755);
  }
  check('the replacement genuinely failed while storage was unwritable', failedStatus >= 500, `HTTP ${failedStatus}`);

  // ------------------------------------------------------------------------------ nothing was lost
  const snapshots = (await db.query(
    `SELECT id, version, status, "storageObjectId", sha256 FROM inspection_report_versions WHERE "reportId"=$1 ORDER BY version`,
    [original.reportId],
  )).rows;
  check('exactly one snapshot survives the failed replacement', snapshots.length === 1,
    snapshots.map((row: any) => `v${row.version}:${row.status}`).join(','));
  check('the surviving snapshot is the ORIGINAL, not a half-made replacement',
    snapshots[0]?.id === original.versionId);

  const artifact = (await db.query(`SELECT status, "deletedAt" FROM storage_objects WHERE id=$1`, [originalObjectId])).rows[0];
  check('the original artifact was never retired', artifact?.status === 'ready' && !artifact.deletedAt,
    JSON.stringify(artifact));

  const afterPdf = await fetch(`${baseUrl}/inspection-reports/${original.reportId}/download`, { headers });
  const afterBytes = Buffer.from(await afterPdf.arrayBuffer());
  check('the customer can still download their report', afterPdf.status === 200);
  check('the report is byte-identical to before the failed replacement', afterBytes.equals(originalBytes),
    `${afterBytes.length} bytes`);

  const orphans = (await db.query(
    `SELECT count(*)::int AS total FROM storage_objects o
       LEFT JOIN inspection_report_versions v ON v.id = o."parentId"
      WHERE o."parentType"='report_version' AND o.status='ready' AND o."deletedAt" IS NULL AND v.id IS NULL`,
  )).rows[0].total;
  check('the failed attempt left no orphaned artifact', orphans === 0, `${orphans} orphans`);

  const recorded = (await db.query(
    `SELECT count(*)::int AS total FROM security_audit_events WHERE action='report_generation_failed' AND "resourceId"=$1`,
    [inspection.id],
  )).rows[0].total;
  check('the failure was recorded as report_generation_failed', recorded >= 1, `${recorded} events`);

  // ---------------------------------------------------------- and recovery genuinely replaces it
  const replacement = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers }, 201);
  check('once storage recovers, the replacement succeeds', replacement.status === 'generated');
  check('the replacement is a different artifact from the one it replaced',
    replacement.versionId !== original.versionId && replacement.checksum !== original.checksum);
  const afterReplacement = (await db.query(
    `SELECT count(*)::int AS total FROM inspection_report_versions WHERE "reportId"=$1`, [original.reportId],
  )).rows[0].total;
  check('the inspection still has exactly one report', afterReplacement === 1, `${afterReplacement} snapshots`);
  const retired = (await db.query(`SELECT status FROM storage_objects WHERE id=$1`, [originalObjectId])).rows[0];
  check('and NOW the superseded artifact is retired', retired?.status === 'deleted', JSON.stringify(retired));

  await db.end();
  console.log(`\nreport-replacement-failure-safety: ${checks.length} passed, ${failures.length} failed`);
  if (failures.length) { process.exitCode = 1; failures.forEach(line => console.error(line)); }
}

main().catch(async error => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
  if (db) await db.end().catch(() => {});
});
