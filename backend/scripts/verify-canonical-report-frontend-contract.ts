// CANONICAL ONE-REPORT-PER-INSPECTION CONTRACT — front-to-back acceptance. 2026-08-28.
//
//   API_BASE_URL=… DATABASE_URL=… npx ts-node scripts/verify-canonical-report-frontend-contract.ts
//
// WHY THIS EXISTS. `canonical-reports.service.ts` changed by +301/-37 to make an inspection carry
// exactly ONE report: regenerating after a reopen REPLACES the artifact rather than producing a
// "version 2" beside "version 1". The frontend states the same contract in prose --
// `generatePersistedReport`: "Generating again after a reopen REPLACES the current report; the
// customer is never presented with a version history", and `persistedReportDownloadUrl`: "No
// version segment: an inspection has one report, so there is nothing to choose between."
//
// Prose on both sides agreeing is not evidence that the two implementations agree. This drives the
// EXACT four endpoints the frontend client calls and asserts the contract against real rows:
//
//   POST /inspections/:id/reports          generatePersistedReport
//   GET  /inspections/:id/report           getReportForInspection
//   GET  /inspection-reports               listPersistedReports
//   GET  /inspection-reports/:id/download  persistedReportDownloadUrl
//
// A stale UI assumption that several canonical reports can coexist for one inspection would show up
// here as a duplicate row in the library listing, or as a second downloadable artifact.

import 'dotenv/config';
import { runOwnedMutatingSuite } from './lib/test-database-ownership';

const BASE = process.env.API_BASE_URL || 'http://127.0.0.1:4231';
interface Json { [key: string]: any }

const failures: string[] = [];
let checks = 0;
function check(ok: boolean, name: string, detail = '') {
  checks += 1;
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

async function call(method: string, route: string, body?: unknown, token?: string, expected?: number) {
  const response = await fetch(`${BASE}${route}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let parsed: Json = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { text }; }
  if (expected !== undefined && response.status !== expected) {
    throw new Error(`${method} ${route}: expected ${expected}, got ${response.status}: ${text.slice(0, 500)}`);
  }
  return { status: response.status, body: parsed };
}

const OBSERVATION =
  'A maintenance worker was clearing a jam inside the press with the machine still connected to '
  + 'power and no lockout device applied to the disconnect. The point-of-operation guard was removed.';

async function completeAndFinalize(inspectionId: string, token: string, suffix: string, round: string) {
  const observation = await call('POST', `/inspections/${inspectionId}/observations`,
    { rawText: OBSERVATION, evidenceSource: 'direct_observation' }, token, 201);
  const observationId = String(observation.body.id);
  const classify = await call('POST', '/safescope-v2/classify',
    { text: OBSERVATION, inspectionId }, token, 201);
  await call('POST', `/inspections/observations/${observationId}/analyses`, {
    engineVersion: 'canonical-report-contract', idempotencyKey: `${suffix}-${round}`,
    requestVersion: 1, resultSnapshot: classify.body,
  }, token, 201);

  const view = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  const open = (Array.isArray(view.body.findings) ? view.body.findings : [])
    .filter((f: Json) => String(f.observationId) === observationId
      && f.status !== 'superseded' && f.status !== 'finalized');
  for (const finding of open) {
    await call('POST', '/actions', {
      inspectionId, findingId: String(finding.id), classificationId: String(finding.hazardKey),
      title: `Correct ${finding.hazardCategory}`, description: 'Corrective action.', priorityCode: 'high',
    }, token, 201);
    const review = await call('POST', `/inspections/observations/${observationId}/reviews`, {
      findingId: String(finding.id), decision: 'accepted', rationale: 'Confirmed.',
      idempotencyKey: `${suffix}-${round}-${finding.hazardKey}`.slice(0, 120),
    }, token, 201);
    await call('POST', `/inspections/observations/${observationId}/findings`, {
      reviewId: String(review.body.id), segmentKey: String(finding.hazardKey),
      conclusion: String(finding.conclusion || finding.hazardCategory || 'Confirmed hazard'),
    }, token, 201);
  }
  const before = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  if (String(before.body.status) === 'draft') {
    await call('POST', `/inspections/${inspectionId}/transition`,
      { status: 'in_review', version: Number(before.body.version) }, token);
  }
  const beforeComplete = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'completed', version: Number(beforeComplete.body.version) }, token);
}

async function run() {
  const suffix = `canreport-${Date.now()}`;
  const email = `${suffix}@example.test`;
  const password = 'Workflow!Strong123';
  await call('POST', '/auth/register', { email, password, name: suffix, type: 'individual' }, undefined, 201);
  const login = await call('POST', '/auth/login', { email, password }, undefined, 201);
  const token = String(login.body.token);
  const { execFileSync } = require('child_process');
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', String(login.body.user.id), '4'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });

  const site = await call('POST', '/sites', { name: suffix }, token, 201);
  const inspection = await call('POST', '/inspections',
    { siteId: site.body.id, title: `Canonical report ${suffix}`, regulatoryContext: 'osha-general-industry' },
    token, 201);
  const inspectionId = String(inspection.body.id);

  // ---------------------------------------------------------------- initial generation
  console.log('\n-- initial report generation --');
  await completeAndFinalize(inspectionId, token, suffix, 'r1');
  const first = await call('POST', `/inspections/${inspectionId}/reports`, undefined, token);
  check(first.status === 200 || first.status === 201, 'report GENERATED', `status=${first.status}`);
  const firstReportId = String(first.body?.reportId || first.body?.id || '');
  const firstVersionId = String(first.body?.versionId || '');
  check(Boolean(firstReportId), 'a reportId was returned', firstReportId);
  check(String(first.body?.inspectionId) === inspectionId,
    'the report is associated with the correct inspection', String(first.body?.inspectionId));

  // ---------------------------------------------------------------- retrieval
  console.log('\n-- retrieval through the exact endpoint the frontend calls --');
  const fetched = await call('GET', `/inspections/${inspectionId}/report`, undefined, token, 200);
  check(String(fetched.body?.reportId) === firstReportId,
    'GET /inspections/:id/report returns THE one current report', String(fetched.body?.reportId));
  check(fetched.body?.inspectionNumber !== undefined,
    'the summary carries inspectionNumber — the customer-facing identity the UI renders',
    String(fetched.body?.inspectionNumber));
  const download1 = await fetch(`${BASE}/inspection-reports/${firstReportId}/download`,
    { headers: { authorization: `Bearer ${token}` } });
  check(download1.status === 200, 'the artifact downloads at the no-version-segment URL',
    `status=${download1.status}`);

  const listBefore = await call('GET', '/inspection-reports', undefined, token, 200);
  const mineBefore = (Array.isArray(listBefore.body) ? listBefore.body : [])
    .filter((r: Json) => String(r.inspectionId) === inspectionId);
  check(mineBefore.length === 1,
    'the library lists EXACTLY ONE report for this inspection', String(mineBefore.length));

  // ---------------------------------------------------------------- reopen + regenerate
  console.log('\n-- reopen, re-complete, regenerate --');
  const beforeReopen = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  const reopen = await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'draft', version: Number(beforeReopen.body.version) }, token);
  check(reopen.status === 200 || reopen.status === 201, 'inspection REOPENS', `status=${reopen.status}`);

  await completeAndFinalize(inspectionId, token, suffix, 'r2');
  const second = await call('POST', `/inspections/${inspectionId}/reports`, undefined, token);
  check(second.status === 200 || second.status === 201, 'report REGENERATED', `status=${second.status}`);
  const secondReportId = String(second.body?.reportId || second.body?.id || '');
  const secondVersionId = String(second.body?.versionId || '');

  check(secondReportId === firstReportId,
    'regeneration REPLACES the same report record rather than creating a second one',
    `${firstReportId} -> ${secondReportId}`);
  check(secondVersionId !== firstVersionId,
    'the underlying snapshot identity DID advance — a real replacement, not a no-op',
    `${firstVersionId} -> ${secondVersionId}`);

  const listAfter = await call('GET', '/inspection-reports', undefined, token, 200);
  const mineAfter = (Array.isArray(listAfter.body) ? listAfter.body : [])
    .filter((r: Json) => String(r.inspectionId) === inspectionId);
  check(mineAfter.length === 1,
    'the library STILL lists exactly one report — no duplicate canonical report is visible',
    String(mineAfter.length));

  const refetched = await call('GET', `/inspections/${inspectionId}/report`, undefined, token, 200);
  check(String(refetched.body?.reportId) === secondReportId,
    'GET /inspections/:id/report returns the replacement, not the superseded artifact');
  const download2 = await fetch(`${BASE}/inspection-reports/${secondReportId}/download`,
    { headers: { authorization: `Bearer ${token}` } });
  check(download2.status === 200, 'the replacement artifact downloads', `status=${download2.status}`);

  // No version segment exists in the API surface the frontend uses.
  const versioned = await fetch(`${BASE}/inspection-reports/${secondReportId}/versions/1/download`,
    { headers: { authorization: `Bearer ${token}` } });
  check(versioned.status === 404 || versioned.status === 400,
    'there is no per-version download surface for the customer to choose between',
    `status=${versioned.status}`);

  console.log('');
  console.log(`CANONICAL REPORT CONTRACT: ${checks - failures.length}/${checks} checks passed`);
  if (failures.length) {
    console.error('\nFAILURES:');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
}

async function main() {
  await runOwnedMutatingSuite({
    suite: 'verify:canonical-report-frontend-contract',
    body: async () => { await run(); },
  });
}

main().catch(error => { console.error(error); process.exit(1); });
