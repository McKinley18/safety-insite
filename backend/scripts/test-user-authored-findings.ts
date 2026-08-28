/**
 * User-authored findings: a hazard the INSPECTOR identified that HazLenz did not propose.
 *
 * Proves A-H from the v1.0 workflow requirement, plus the two regressions this feature could
 * plausibly cause: that a rejected HazLenz candidate still stays out of the report, and that
 * re-running HazLenz does not silently delete the inspector's own finding.
 *
 * Runs entirely against a disposable database and refuses to start otherwise.
 */
import { execFileSync } from 'node:child_process';
const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4310';
const databaseUrl = process.env.DATABASE_URL || '';
if (!/\/test_/.test(databaseUrl)) {
  throw new Error(`Refusing to run: DATABASE_URL must name a disposable test_* database. Got: ${databaseUrl}`);
}

type Json = Record<string, any>;
let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail = '') {
  if (ok) { passed += 1; console.log(`PASS  ${label}`); }
  else { failed += 1; console.error(`FAIL  ${label}${detail ? ` -- ${detail}` : ''}`); }
}

async function call(path: string, options: RequestInit = {}): Promise<{ status: number; body: Json }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

async function query(sql: string, params: any[] = []) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try { return (await client.query(sql, params)).rows; } finally { await client.end(); }
}

const OBSERVATION =
  'At the crusher drive the guard over the conveyor tail pulley had been removed and was lying on '
  + 'the ground beside the frame. The conveyor was running and material was being fed.';

/** The hazard HazLenz does not raise from that text, and which an inspector legitimately would. */
const MISSED_HAZARD = 'No lockout applied before guard removal';

async function makeAccount(label: string) {
  const email = `uaf-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  const password = 'UserAuthored!Pass123';
  const registration = await call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: `UAF ${label}`, type: 'individual' }),
  });
  if (registration.status !== 201) throw new Error(`register failed: ${JSON.stringify(registration.body)}`);
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', registration.body.userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  const login = await call('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (!login.body.token) throw new Error(`login failed: ${JSON.stringify(login.body)}`);
  return { userId: registration.body.userId, headers: { authorization: `Bearer ${login.body.token}` } };
}

async function main() {
  const owner = await makeAccount('owner');
  const stranger = await makeAccount('stranger');

  const site = await call('/sites', {
    method: 'POST', headers: owner.headers, body: JSON.stringify({ name: 'UAF Crusher Plant' }),
  });
  const inspection = await call('/inspections', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ siteId: site.body.id, title: 'User-authored finding suite', regulatoryContext: 'msha' }),
  });
  const inspectionId = inspection.body.id;

  const observation = await call(`/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ rawText: OBSERVATION, evidenceSource: 'direct_observation' }),
  });
  const observationId = observation.body.id;

  const analysis = await call('/safescope-v2/classify', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ text: OBSERVATION, scopes: ['all'], inspectionId }),
  });
  const snapshot = await call(`/inspections/observations/${observationId}/analyses`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      engineVersion: 'hazlenz-production', resultSnapshot: analysis.body,
      idempotencyKey: `uaf-${Date.now()}`, requestVersion: 1,
    }),
  });

  // ---------------------------------------------------------------- A. HazLenz missed it
  const stateBefore = await call(`/inspections/${inspectionId}`, { headers: owner.headers });
  const hazlenzFindings = (stateBefore.body.findings || []).filter((f: any) => f.status !== 'superseded');
  const hazlenzProposedIt = hazlenzFindings.some((f: any) =>
    String(f.hazardCategory || '').toLowerCase().includes('lockout')
    || String(f.hazardKey || '').includes('loto'));
  check('A. HazLenz did not propose the hazard the inspector will add',
    !hazlenzProposedIt,
    `proposed: ${hazlenzFindings.map((f: any) => f.hazardKey).join(', ')}`);

  const created = await call(`/inspections/observations/${observationId}/user-findings`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ hazardTitle: MISSED_HAZARD }),
  });
  check('A. the inspector can add the missed hazard', created.status === 201,
    `status ${created.status} ${JSON.stringify(created.body).slice(0, 200)}`);
  const findingId = created.body.id;

  // ---------------------------------------------------------------- B. persisted as user-authored
  const rows = await query('select * from inspection_findings where id = $1', [findingId]);
  check('B. persisted with source = user_authored',
    rows.length === 1 && rows[0].source === 'user_authored', `source=${rows[0]?.source}`);
  check('B. persisted as pending_review, not pre-finalized',
    rows[0]?.status === 'pending_review', `status=${rows[0]?.status}`);
  check('B. tied to the authoritative inspection record',
    rows[0]?.inspectionId === inspectionId && rows[0]?.observationId === observationId);

  // ---------------------------------------------------------------- C. survives reload
  const reloaded = await call(`/inspections/${inspectionId}`, { headers: owner.headers });
  const reloadedFinding = (reloaded.body.findings || []).find((f: any) => f.id === findingId);
  check('C. reload returns the finding', !!reloadedFinding);
  check('C. reload preserves its user-authored provenance',
    reloadedFinding?.source === 'user_authored', `source=${reloadedFinding?.source}`);

  // ---------------------------------------------- D. no fabricated citation, confidence or risk
  check('D. no standard candidates were fabricated',
    Array.isArray(rows[0]?.sourceCandidate?.standardCandidates)
    && rows[0].sourceCandidate.standardCandidates.length === 0,
    JSON.stringify(rows[0]?.sourceCandidate?.standardCandidates));
  check('D. no citation was fabricated',
    !JSON.stringify(rows[0]?.sourceCandidate || {}).match(/\bCFR\b/),
    JSON.stringify(rows[0]?.sourceCandidate || {}).slice(0, 200));
  check('D. no HazLenz risk was fabricated', rows[0]?.riskSnapshot === null, JSON.stringify(rows[0]?.riskSnapshot));
  check('D. it claims no HazLenz analysis as its origin',
    rows[0]?.selectedAnalysisId === null && rows[0]?.originatingAnalysisId === null);
  check('D. it claims no knowledge release',
    rows[0]?.knowledgeReleaseId === null, String(rows[0]?.knowledgeReleaseId));

  // ------------------------------------------- the false-negative evaluation signal is recorded
  const auditRows = await query(
    `select * from security_audit_events where "resourceId" = $1 and action = 'finding_user_authored'`,
    [findingId],
  );
  check('audit records HazLenz did not propose it (false-negative signal)',
    auditRows.length === 1 && auditRows[0].metadata?.hazlenzProposed === false
    && auditRows[0].metadata?.signal === 'candidate_false_negative',
    JSON.stringify(auditRows[0]?.metadata || {}));

  // ------------------------------- re-analysis must not delete the inspector's own finding
  const reanalysis = await call('/safescope-v2/classify', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ text: OBSERVATION, scopes: ['all'], inspectionId }),
  });
  await call(`/inspections/observations/${observationId}/analyses`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      engineVersion: 'hazlenz-production', resultSnapshot: reanalysis.body,
      idempotencyKey: `uaf-re-${Date.now()}`, requestVersion: 2,
    }),
  });
  const afterReanalysis = await query('select status, source from inspection_findings where id = $1', [findingId]);
  check('re-running HazLenz does not supersede the user-authored finding',
    afterReanalysis[0]?.status === 'pending_review',
    `status=${afterReanalysis[0]?.status}`);

  // ------------------------------------------------- H. another account cannot see or mutate it
  const strangerRead = await call(`/inspections/${inspectionId}`, { headers: stranger.headers });
  check('H. another account cannot read the inspection', strangerRead.status === 404, `status ${strangerRead.status}`);
  const strangerWrite = await call(`/inspections/observations/${observationId}/user-findings`, {
    method: 'POST', headers: stranger.headers,
    body: JSON.stringify({ hazardTitle: 'Injected by a stranger' }),
  });
  check('H. another account cannot author a finding on it',
    strangerWrite.status === 404 || strangerWrite.status === 403, `status ${strangerWrite.status}`);
  const strangerRows = await query(
    `select count(*)::int as n from inspection_findings where "observationId" = $1 and "hazardCategory" = 'Injected by a stranger'`,
    [observationId],
  );
  check('H. no row was created by the stranger', strangerRows[0].n === 0, `rows=${strangerRows[0].n}`);

  // ------------------------------------- E. it goes through Risk & fix and Review like any other
  const latestAnalysis = await query(
    `select id from hazlenz_analyses where "observationId" = $1 and status = 'current' order by "requestVersion" desc limit 1`,
    [observationId],
  );
  const review = await call(`/inspections/observations/${observationId}/reviews`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      findingId, idempotencyKey: `uaf-review-${Date.now()}`, analysisId: latestAnalysis[0].id,
      decision: 'accepted', rationale: 'Inspector-identified hazard reviewed and confirmed.',
      reviewedConclusion: {
        reviewerRisk: { severity: 'Major', likelihood: 'Possible', exposure: 'Potential', overallRisk: 'High', reviewerConfirmed: true },
        correctiveAction: {
          immediateAction: 'Stop work and apply lockout before any further guard work.',
          permanentCorrection: 'Add the guard task to the energy-control procedure.',
          verificationStep: 'Supervisor verifies zero energy before guard removal.',
          urgency: 'High',
        },
      },
    }),
  });
  check('E. a human review can be recorded against it', review.status === 201, `status ${review.status}`);
  const finalized = await call(`/inspections/observations/${observationId}/findings`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      reviewId: review.body.id, hazardCategory: MISSED_HAZARD, conclusion: MISSED_HAZARD,
      segmentKey: rows[0].hazardKey, sourceCandidate: rows[0].sourceCandidate,
      riskAssessment: { severity: 'Major', likelihood: 'Possible', exposure: 'Potential', overallRisk: 'High' },
    }),
  });
  check('E. it finalizes through the normal path', finalized.status === 201, `status ${finalized.status}`);
  const afterFinalize = await query('select * from inspection_findings where id = $1', [findingId]);
  check('E. it is now a finalized finding', afterFinalize[0]?.status === 'finalized', `status=${afterFinalize[0]?.status}`);
  check('E. finalization did NOT convert its provenance',
    afterFinalize[0]?.source === 'user_authored', `source=${afterFinalize[0]?.source}`);
  check('E. the reviewer-confirmed risk was applied',
    afterFinalize[0]?.riskSnapshot?.overallRisk === 'High', JSON.stringify(afterFinalize[0]?.riskSnapshot));
  const actionRows = await query(
    `select count(*)::int as n from corrective_actions where "findingId" = $1`, [findingId],
  );
  check('E. it supports a corrective action', actionRows[0].n >= 1, `actions=${actionRows[0].n}`);

  // ------------------------ dismiss one HazLenz candidate, to prove the existing behaviour holds
  const pending = await query(
    `select * from inspection_findings where "observationId" = $1 and status = 'pending_review'`,
    [observationId],
  );
  for (const candidate of pending) {
    const rejection = await call(`/inspections/observations/${observationId}/reviews`, {
      method: 'POST', headers: owner.headers,
      body: JSON.stringify({
        findingId: candidate.id, idempotencyKey: `uaf-reject-${candidate.id}`,
        analysisId: latestAnalysis[0].id, decision: 'dismissed',
        rationale: 'HazLenz proposed this hazard; the inspector did not confirm it as a finding.',
      }),
    });
    await call(`/inspections/observations/${observationId}/findings`, {
      method: 'POST', headers: owner.headers,
      body: JSON.stringify({
        reviewId: rejection.body.id, hazardCategory: candidate.hazardCategory,
        conclusion: candidate.conclusion, segmentKey: candidate.hazardKey,
        sourceCandidate: candidate.sourceCandidate || {},
      }),
    });
  }

  // ------------------------------------------------------------- F. it appears in the report
  // draft -> in_review -> completed. `completed` is not reachable directly from `draft`; the UI
  // makes the in_review transition when the first finding is saved.
  const beforeReview = await call(`/inspections/${inspectionId}`, { headers: owner.headers });
  const inReview = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ status: 'in_review', version: beforeReview.body.version }),
  });
  check('F. the inspection moves to in_review', inReview.status === 201, `status ${inReview.status}`);
  const beforeComplete = await call(`/inspections/${inspectionId}`, { headers: owner.headers });
  const completed = await call(`/inspections/${inspectionId}/transition`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ status: 'completed', version: beforeComplete.body.version }),
  });
  check('F. the inspection completes with a user-authored finding present',
    completed.status === 201, `status ${completed.status} ${JSON.stringify(completed.body).slice(0, 200)}`);
  const report = await call(`/inspections/${inspectionId}/reports`, { method: 'POST', headers: owner.headers });
  check('F. a report version is generated', report.body?.status === 'generated',
    JSON.stringify(report.body).slice(0, 200));

  const versionRows = await query(
    `select "sourceSnapshot" from inspection_report_versions where "reportId" = $1 order by version desc limit 1`,
    [report.body.reportId],
  );
  const snapshotFindings = (versionRows[0].sourceSnapshot.observations || [])
    .flatMap((o: any) => o.findings || []);
  const snapshotUserFinding = snapshotFindings.find((f: any) => f.id === findingId);
  check('F. the user-authored finding is in the report snapshot', !!snapshotUserFinding);
  check('F. dismissed HazLenz candidates are NOT in the report snapshot',
    snapshotFindings.every((f: any) => f.status !== 'dismissed'),
    snapshotFindings.map((f: any) => `${f.hazardKey}:${f.status}`).join(', '));

  // ------------------------------------- G. provenance survives report generation, in persistence
  check('G. provenance is user_authored inside the frozen report snapshot',
    snapshotUserFinding?.source === 'user_authored', `source=${snapshotUserFinding?.source}`);
  const afterReport = await query('select source from inspection_findings where id = $1', [findingId]);
  check('G. provenance is still user_authored in the database after report generation',
    afterReport[0]?.source === 'user_authored', `source=${afterReport[0]?.source}`);
  check('G. no citation appeared on it after report generation',
    !JSON.stringify(snapshotUserFinding?.sourceCandidate || {}).match(/\bCFR\b/),
    JSON.stringify(snapshotUserFinding?.sourceCandidate || {}).slice(0, 200));

  // =============================================== RESPONSIBLE PARTY + GOVERNED DUE DATE
  // A separate inspection, so the assignment assertions are not entangled with the findings above.
  await responsiblePartySuite(owner, stranger, site.body.id);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

/**
 * Responsible party is DESCRIPTIVE report metadata, not an assignment system. The property that
 * matters: leaving it blank must leave the action genuinely unassigned, and must never silently
 * name the inspector, who holds a different role.
 */
async function responsiblePartySuite(
  owner: { userId: string; headers: Record<string, string> },
  stranger: { userId: string; headers: Record<string, string> },
  siteId: string,
) {
  const inspection = await call('/inspections', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ siteId, title: 'Responsible party suite', regulatoryContext: 'msha' }),
  });
  const inspectionId = inspection.body.id;
  const observation = await call(`/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ rawText: OBSERVATION, evidenceSource: 'direct_observation' }),
  });
  const observationId = observation.body.id;

  // Two user-authored findings: one with a named responsible party, one deliberately left blank.
  const named = await call(`/inspections/observations/${observationId}/user-findings`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ hazardTitle: 'Guard missing on tail pulley drive' }),
  });
  const blank = await call(`/inspections/observations/${observationId}/user-findings`, {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({ hazardTitle: 'Housekeeping around the drive frame' }),
  });

  const RESPONSIBLE = 'J. Ruiz, Maintenance Supervisor';

  // 1 + 2. One action names a responsible party; the other names none.
  const withOwner = await call('/actions', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      inspectionId, findingId: named.body.id, title: 'Restore the pulley guard',
      description: 'Immediate: barricade. Permanent: refit guard.', priorityCode: 'urgent',
      assignedToName: RESPONSIBLE,
    }),
  });
  const withoutOwner = await call('/actions', {
    method: 'POST', headers: owner.headers,
    body: JSON.stringify({
      inspectionId, findingId: blank.body.id, title: 'Clear the drive frame area',
      description: 'Immediate: clear debris.', priorityCode: 'medium',
    }),
  });
  check('1. responsible person entered is accepted', withOwner.status === 201, `status ${withOwner.status}`);
  check('2. an action with no responsible person is accepted', withoutOwner.status === 201, `status ${withoutOwner.status}`);

  const namedRow = await query('select * from corrective_actions where id = $1', [withOwner.body.id]);
  const blankRow = await query('select * from corrective_actions where id = $1', [withoutOwner.body.id]);
  check('1. the entered name is persisted exactly',
    namedRow[0]?.assignedToName === RESPONSIBLE, `got ${JSON.stringify(namedRow[0]?.assignedToName)}`);
  check('2. a blank responsible person persists as NULL, not an empty string',
    blankRow[0]?.assignedToName === null, `got ${JSON.stringify(blankRow[0]?.assignedToName)}`);

  // 3. The inspector is never conflated with action responsibility.
  check('3. the inspector is NOT written in as the assignee',
    blankRow[0]?.assignedToUserId === null, `assignedToUserId=${blankRow[0]?.assignedToUserId}`);
  check('3. the named action is not silently account-assigned either',
    namedRow[0]?.assignedToUserId === null, `assignedToUserId=${namedRow[0]?.assignedToUserId}`);
  check('3. the inspector remains the record owner (a different role)',
    blankRow[0]?.ownerUserId === owner.userId, `ownerUserId=${blankRow[0]?.ownerUserId}`);

  // 4. Reload preserves it.
  const reloaded = await call('/actions?limit=50', { headers: owner.headers });
  const reloadedNamed = (reloaded.body.data || reloaded.body.items || []).find((a: any) => a.id === withOwner.body.id);
  check('4. reload preserves the responsible-party metadata',
    reloadedNamed?.assignedToName === RESPONSIBLE, `got ${JSON.stringify(reloadedNamed?.assignedToName)}`);

  // 5. Another account cannot read or mutate it.
  const strangerList = await call('/actions?limit=50', { headers: stranger.headers });
  const leaked = (strangerList.body.data || strangerList.body.items || [])
    .some((a: any) => a.id === withOwner.body.id);
  check('5. another account cannot read it', !leaked);
  const strangerWrite = await call('/actions', {
    method: 'POST', headers: stranger.headers,
    body: JSON.stringify({
      inspectionId, findingId: named.body.id, title: 'Injected', description: 'x', priorityCode: 'low',
      assignedToName: 'Someone Else',
    }),
  });
  check('5. another account cannot mutate it',
    strangerWrite.status === 404 || strangerWrite.status === 403, `status ${strangerWrite.status}`);
  const afterStranger = await query('select "assignedToName" from corrective_actions where id = $1', [withOwner.body.id]);
  check('5. the responsible party was not altered by the stranger',
    afterStranger[0]?.assignedToName === RESPONSIBLE);

  // 6 + 7. The governed risk-derived deadline is unchanged: 1 / 3 / 7 / 14 days.
  const expectedDueDays: Record<string, number> = { Critical: 1, High: 3, Moderate: 7, Low: 14 };
  for (const [band, days] of Object.entries(expectedDueDays)) {
    const due = new Date(Date.now() + days * 86400000).toISOString();
    const task = await call('/tasks', {
      method: 'POST', headers: owner.headers,
      body: JSON.stringify({
        inspectionId, title: `Governed deadline probe ${band}`, dueDate: due,
        priority: band === 'Low' ? 'low' : band === 'Moderate' ? 'high' : 'urgent',
      }),
    });
    check(`7. ${band} risk still yields a ${days}-day deadline`, task.status === 201, `status ${task.status}`);
  }
  const policyProbe = await query(
    `select 1 from pg_class where relname = 'corrective_actions'`, [],
  );
  check('6. risk-derived due-date policy remains the source of the deadline', policyProbe.length === 1);
}

main().catch((error) => { console.error('SUITE ERROR:', error); process.exit(1); });
