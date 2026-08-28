const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4105';
const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

async function json(path: string, options: RequestInit = {}, expected = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (response.status !== expected) throw new Error(`${options.method || 'GET'} ${path}: ${response.status}: ${text}`);
  return body;
}

// Held at module scope so the failure path can close it. An open pg connection keeps the event
// loop alive, so a suite that threw after connecting used to hang indefinitely instead of
// reporting — the failure then presented as a harness timeout rather than as the error it was.
let db: any = null;

async function main() {
  const suffix = Date.now();
  const password = 'Phase5!StrongPass123';
  const emails = [`phase5-a-${suffix}@example.test`, `phase5-b-${suffix}@example.test`];
  for (const email of emails) {
    await json('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: email, type: 'individual' }) }, 201);
  }
  const login = async (email: string) => json('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const [a, b] = await Promise.all(emails.map(login));
  const headersA = { authorization: `Bearer ${a.token}` };
  const headersB = { authorization: `Bearer ${b.token}` };
  db = new Client({ connectionString: databaseUrl });
  await db.connect();
  await db.query(
    // Tier is 'pro': migration 1800000005900-RetireExpertTier retired the Expert tier (Pro now
    // includes everything Expert granted) and tightened the CHECK constraint to tier IN ('pro').
    // This fixture still said 'expert', so the insert failed the constraint on any schema at or
    // past that migration. Matches the convention already corrected in grant-test-entitlement.ts.
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'pilot','pro','active',now(),now()+interval '1 day',$1,'Phase 5 disposable integration test')`,
    [a.user.id],
  );
  const site = await json('/sites', { method: 'POST', headers: headersA, body: JSON.stringify({ name: `Phase 5 ${suffix}` }) }, 201);
  const inspection = await json('/inspections', {
    method: 'POST', headers: headersA, body: JSON.stringify({ siteId: site.id, title: 'Replaced report storage test' }),
  }, 201);
  const observation = await json(`/inspections/${inspection.id}/observations`, {
    method: 'POST', headers: headersA,
    body: JSON.stringify({ rawText: 'A locked disconnect was verified before maintenance on a conveyor drive.', evidenceSource: 'direct_observation' }),
  }, 201);
  const analysis = await json(`/inspections/observations/${observation.id}/analyses`, {
    method: 'POST', headers: headersA,
    body: JSON.stringify({
      engineVersion: 'phase5-integration',
      idempotencyKey: `phase5-analysis-${suffix}`,
      requestVersion: 1,
      resultSnapshot: { advisory: true, classification: 'hazardous_energy' },
    }),
  }, 201);
  const review = await json(`/inspections/observations/${observation.id}/reviews`, {
    method: 'POST', headers: headersA,
    body: JSON.stringify({ analysisId: analysis.id, decision: 'accepted', rationale: 'Verified lock and zero-energy state.' }),
  }, 201);
  await json(`/inspections/observations/${observation.id}/findings`, {
    method: 'POST', headers: headersA,
    body: JSON.stringify({ reviewId: review.id, hazardCategory: 'hazardous_energy', conclusion: 'Controlled condition verified.' }),
  }, 201);
  const reviewState = await json(`/inspections/${inspection.id}/transition`, {
    method: 'POST', headers: headersA, body: JSON.stringify({ status: 'in_review', version: 1 }),
  }, 201);
  const completedState = await json(`/inspections/${inspection.id}/transition`, {
    method: 'POST', headers: headersA, body: JSON.stringify({ status: 'completed', version: reviewState.version }),
  }, 201);

  const freeDenied = await fetch(`${baseUrl}/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersB });
  if (![402, 404].includes(freeDenied.status)) throw new Error(`Unexpected foreign/free report response: ${freeDenied.status}`);
  const first = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersA }, 201);
  // The customer-facing download names no version, because the inspection has exactly one report.
  const firstPdf = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/download`, { headers: headersA });
  const firstBytes = Buffer.from(await firstPdf.arrayBuffer());
  if (firstPdf.status !== 200 || firstBytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('The current report is not an authorized PDF.');
  const foreign = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/download`, { headers: headersB });
  if (foreign.status !== 404) throw new Error(`Cross-user report access returned ${foreign.status}.`);
  const duplicate = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersA }, 201);
  if (duplicate.version !== first.version || duplicate.versionId !== first.versionId) throw new Error('Unchanged report generation was not idempotent.');
  const firstObject = (await db.query(
    `SELECT "storageObjectId" FROM inspection_report_versions WHERE id=$1`, [first.versionId],
  )).rows[0]?.storageObjectId;
  if (!firstObject) throw new Error('The first report produced no stored artifact.');

  const reopened = await json(`/inspections/${inspection.id}/transition`, {
    method: 'POST', headers: headersA, body: JSON.stringify({ status: 'draft', version: completedState.version }),
  }, 201);
  const changed = await json(`/inspections/${inspection.id}`, {
    method: 'PATCH', headers: headersA,
    body: JSON.stringify({ title: 'Replaced report storage test — reviewed update', version: reopened.version }),
  }, 200);
  // Reopening on its own must change nothing: the customer keeps the report they had while they
  // edit, and it is replaced only when a successor has actually been generated.
  const duringReopen = (await db.query(
    `SELECT count(*)::int AS snapshots FROM inspection_report_versions WHERE "reportId"=$1`, [first.reportId],
  )).rows[0].snapshots;
  const stillDownloadable = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/download`, { headers: headersA });
  if (duringReopen !== 1 || stillDownloadable.status !== 200) {
    throw new Error(`Reopening altered the existing report (snapshots=${duringReopen}, download=${stillDownloadable.status}).`);
  }

  const reReview = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers: headersA, body: JSON.stringify({ status: 'in_review', version: changed.version }) }, 201);
  await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers: headersA, body: JSON.stringify({ status: 'completed', version: reReview.version }) }, 201);
  const second = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersA }, 201);
  if (second.versionId === first.versionId || second.checksum === first.checksum) {
    throw new Error('A legitimate source change did not produce a genuinely different report.');
  }

  // ------------------------------------------------------------------ THE v1.0 REPLACEMENT CONTRACT
  //
  // This suite previously asserted the SUPERSEDED contract: two version rows, the older marked
  // `superseded` and still downloadable. The product owner has replaced that contract -- an
  // inspection has ONE current report, and finishing a reopened inspection REPLACES it. The old
  // expectation is therefore stale rather than violated, and the assertions below are the new
  // contract asserted at the same strength: exactly one snapshot retained, the predecessor's
  // artifact genuinely destroyed rather than merely hidden, and no orphan left behind.
  const rows = await db.query(
    `SELECT
       (SELECT count(*)::int FROM inspection_reports WHERE id=$1) reports,
       (SELECT count(*)::int FROM inspection_report_versions WHERE "reportId"=$1) versions,
       (SELECT count(*)::int FROM storage_objects o
          WHERE o."parentType"='report_version' AND o.status='ready'
            AND o."parentId" IN (SELECT id FROM inspection_report_versions WHERE "reportId"=$1)) objects,
       (SELECT count(*)::int FROM storage_objects o
          LEFT JOIN inspection_report_versions v ON v.id = o."parentId"
          WHERE o."parentType"='report_version' AND o.status='ready' AND v.id IS NULL) orphans,
       (SELECT count(*)::int FROM security_audit_events WHERE action='report_generated') audits`,
    [first.reportId],
  );
  const snapshots = await db.query(
    `SELECT id,version,status,"storageObjectId",sha256 FROM inspection_report_versions WHERE "reportId"=$1 ORDER BY version`,
    [first.reportId],
  );
  if (rows.rows[0].reports !== 1 || rows.rows[0].versions !== 1 || rows.rows[0].objects !== 1 ||
      rows.rows[0].orphans !== 0 || rows.rows[0].audits < 2) {
    throw new Error(`One-report-per-inspection was not achieved: ${JSON.stringify(rows.rows[0])}`);
  }
  if (snapshots.rows.length !== 1 || snapshots.rows[0].id !== second.versionId || snapshots.rows[0].status !== 'generated') {
    throw new Error('The retained snapshot is not the replacement.');
  }
  const retiredArtifact = (await db.query(
    `SELECT status, "deletedAt" FROM storage_objects WHERE id=$1`, [firstObject],
  )).rows[0];
  if (!retiredArtifact || retiredArtifact.status !== 'deleted' || !retiredArtifact.deletedAt) {
    throw new Error(`The superseded PDF was not retired: ${JSON.stringify(retiredArtifact)}`);
  }
  // The replacement is what the unchanged customer-facing URL now serves, and it is the new bytes.
  const currentPdf = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/download`, { headers: headersA });
  const currentBytes = Buffer.from(await currentPdf.arrayBuffer());
  if (currentPdf.status !== 200 || currentBytes.equals(firstBytes)) {
    throw new Error('The current download did not follow the replacement.');
  }
  await db.end();
  console.log(JSON.stringify({
    passed: true, scenarios: 14, reportId: first.reportId,
    replacedChecksum: first.checksum, currentChecksum: second.checksum,
    sourceChangeVersion: changed.version, persistence: rows.rows[0],
    crossUserDownload: foreign.status, retiredArtifactStatus: retiredArtifact.status,
  }));
}

main().catch(async error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
  if (db) await db.end().catch(() => {});
});
