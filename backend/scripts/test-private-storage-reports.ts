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
    method: 'POST', headers: headersA, body: JSON.stringify({ siteId: site.id, title: 'Immutable report storage test' }),
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
  const firstPdf = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/versions/1/download`, { headers: headersA });
  const firstBytes = Buffer.from(await firstPdf.arrayBuffer());
  if (firstPdf.status !== 200 || firstBytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Version 1 is not an authorized PDF.');
  const foreign = await fetch(`${baseUrl}/inspection-reports/${first.reportId}/versions/1/download`, { headers: headersB });
  if (foreign.status !== 404) throw new Error(`Cross-user report access returned ${foreign.status}.`);
  const duplicate = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersA }, 201);
  if (duplicate.version !== first.version || duplicate.versionId !== first.versionId) throw new Error('Unchanged report generation was not idempotent.');
  const reopened = await json(`/inspections/${inspection.id}/transition`, {
    method: 'POST', headers: headersA, body: JSON.stringify({ status: 'draft', version: completedState.version }),
  }, 201);
  const changed = await json(`/inspections/${inspection.id}`, {
    method: 'PATCH', headers: headersA,
    body: JSON.stringify({ title: 'Immutable report storage test — reviewed update', version: reopened.version }),
  }, 200);
  const reReview = await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers: headersA, body: JSON.stringify({ status: 'in_review', version: changed.version }) }, 201);
  await json(`/inspections/${inspection.id}/transition`, { method: 'POST', headers: headersA, body: JSON.stringify({ status: 'completed', version: reReview.version }) }, 201);
  const second = await json(`/inspections/${inspection.id}/reports`, { method: 'POST', headers: headersA }, 201);
  if (second.version !== 2 || second.versionId === first.versionId) throw new Error('Legitimate source change did not create an immutable report version.');
  const rows = await db.query(
    `SELECT
       (SELECT count(*)::int FROM inspection_reports WHERE id=$1) reports,
       (SELECT count(*)::int FROM inspection_report_versions WHERE "reportId"=$1) versions,
       (SELECT count(*)::int FROM storage_objects WHERE "parentType"='report_version' AND status='ready') objects,
       (SELECT count(*)::int FROM security_audit_events WHERE action='report_generated') audits`,
    [first.reportId],
  );
  const snapshots = await db.query(
    `SELECT version,status,"sourceSnapshot","storageObjectId",sha256 FROM inspection_report_versions WHERE "reportId"=$1 ORDER BY version`,
    [first.reportId],
  );
  if (rows.rows[0].reports !== 1 || rows.rows[0].versions !== 2 || rows.rows[0].objects < 2 || rows.rows[0].audits < 2) {
    throw new Error(`Unexpected persistence: ${JSON.stringify(rows.rows[0])}`);
  }
  if (snapshots.rows[0].status !== 'superseded' || snapshots.rows[1].status !== 'generated' ||
      snapshots.rows[0].storageObjectId === snapshots.rows[1].storageObjectId) {
    throw new Error('Version lifecycle or artifact separation is invalid.');
  }
  await db.end();
  console.log(JSON.stringify({
    passed: true, scenarios: 12, reportId: first.reportId, version1Checksum: first.checksum,
    version2Checksum: second.checksum, sourceChangeVersion: changed.version, persistence: rows.rows[0], crossUserDownload: foreign.status,
  }));
}

main().catch(async error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
  if (db) await db.end().catch(() => {});
});
