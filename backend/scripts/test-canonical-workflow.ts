const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4104';
const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

type Json = Record<string, any>;

async function request(path: string, options: RequestInit = {}, expected = 200): Promise<Json> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (response.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${path}: expected ${expected}, got ${response.status}: ${text}`);
  }
  return body;
}

async function requestWithStatus(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function main() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const password = 'Phase4!StrongPass123';
  const emailA = `phase4-a-${suffix}@example.test`;
  const emailB = `phase4-b-${suffix}@example.test`;

  for (const email of [emailA, emailB]) {
    const registration = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name: email.split('@')[0], type: 'individual' }),
    }, 201);
    if (registration.organizationId !== null) throw new Error('Independent registration unexpectedly created an organization.');
  }

  const login = async (email: string) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, 201);
  const [loginA, loginB] = await Promise.all([login(emailA), login(emailB)]);
  const authA = { authorization: `Bearer ${loginA.token}` };
  const authB = { authorization: `Bearer ${loginB.token}` };

  await request('/sites', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ name: 'Rejected owner injection', ownerUserId: loginB.user.id }),
  }, 400);
  const site = await request('/sites', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ name: 'Phase 4 Independent Site' }),
  }, 201);
  await request(`/sites/${site.id}`, { headers: authB }, 404);

  const inspection = await request('/inspections', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ siteId: site.id, title: 'Durable inspection workflow' }),
  }, 201);
  await request(`/inspections/${inspection.id}`, { headers: authB }, 404);

  const observation = await request(`/inspections/${inspection.id}/observations`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      rawText: 'A portable grinder was unplugged and tagged out while its damaged guard and exposed cord conductors awaited replacement.',
      evidenceSource: 'direct_observation',
    }),
  }, 201);
  const analysisPayload = {
    engineVersion: 'existing-hazlenz-integration',
    traceId: `phase4-${suffix}`,
    idempotencyKey: `phase4-analysis-${suffix}`,
    requestVersion: 1,
    resultSnapshot: {
      advisory: true,
      classification: 'machine_guarding',
      needsHumanReview: true,
      summary: 'Equipment is controlled pending guard replacement.',
    },
  };
  const analysis = await request(`/inspections/observations/${observation.id}/analyses`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify(analysisPayload),
  }, 201);
  const replayedAnalysis = await request(`/inspections/observations/${observation.id}/analyses`, {
    method: 'POST', headers: authA, body: JSON.stringify(analysisPayload),
  }, 201);
  if (replayedAnalysis.id !== analysis.id) throw new Error('Analysis idempotency replay created a duplicate.');
  await request(`/inspections/observations/${observation.id}/analyses`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ ...analysisPayload, idempotencyKey: `stale-${suffix}` }),
  }, 409);
  const [version2, version3] = await Promise.all([
    requestWithStatus(`/inspections/observations/${observation.id}/analyses`, {
      method: 'POST',
      headers: authA,
      body: JSON.stringify({
        ...analysisPayload,
        idempotencyKey: `concurrent-v2-${suffix}`,
        requestVersion: 2,
      }),
    }),
    requestWithStatus(`/inspections/observations/${observation.id}/analyses`, {
      method: 'POST',
      headers: authA,
      body: JSON.stringify({
        ...analysisPayload,
        idempotencyKey: `concurrent-v3-${suffix}`,
        requestVersion: 3,
      }),
    }),
  ]);
  if (version3.status !== 201 || ![201, 409].includes(version2.status)) {
    throw new Error(`Concurrent analysis ordering failed: v2=${version2.status}, v3=${version3.status}`);
  }
  const review = await request(`/inspections/observations/${observation.id}/reviews`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      analysisId: analysis.id,
      decision: 'accepted',
      rationale: 'Confirmed unplugged condition and damaged guard during direct inspection.',
      reviewedConclusion: { advisoryAccepted: true },
    }),
  }, 201);
  const finding = await request(`/inspections/observations/${observation.id}/findings`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      reviewId: review.id,
      hazardCategory: 'machine_guarding',
      segmentKey: 'machine-guarding',
      sourceCandidate: { family: 'machine_guarding', citation: '29 CFR 1910.212', applicability: 'candidate' },
      reviewerDisposition: 'split',
      conclusion: 'Keep the grinder out of service until a compliant guard is installed.',
    }),
  }, 201);
  if (finding.status !== 'finalized') throw new Error('Finding was not finalized.');
  const electricalFinding = await request(`/inspections/observations/${observation.id}/findings`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      reviewId: review.id,
      hazardCategory: 'electrical',
      segmentKey: 'electrical-cord-damage',
      sourceCandidate: { family: 'electrical', citation: '29 CFR 1910.305', applicability: 'candidate' },
      reviewerDisposition: 'split',
      conclusion: 'Keep the grinder out of service until the damaged cord is replaced and verified.',
    }),
  }, 201);
  if (electricalFinding.id === finding.id) throw new Error('Distinct hazard segments collapsed into one finding.');

  const action = await request('/actions', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      inspectionId: inspection.id,
      findingId: finding.id,
      siteId: site.id,
      title: 'Replace the damaged grinder guard',
      description: 'Keep the grinder out of service until the guard is replaced and verified.',
      priorityCode: 'high',
      dueDate: '2026-08-01',
    }),
  }, 201);
  await request('/actions', {
    method: 'POST',
    headers: authB,
    body: JSON.stringify({
      inspectionId: inspection.id,
      findingId: finding.id,
      title: 'Foreign action must be denied',
      description: 'Identifier substitution attempt.',
      priorityCode: 'high',
    }),
  }, 404);

  const inReview = await request(`/inspections/${inspection.id}/transition`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ status: 'in_review', version: 1 }),
  }, 201);
  const completed = await request(`/inspections/${inspection.id}/transition`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ status: 'completed', version: inReview.version }),
  }, 201);
  if (completed.status !== 'completed') throw new Error('Inspection did not complete.');

  const task = await request('/tasks', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      title: 'Verify grinder guard replacement',
      dueDate: '2026-08-01',
      priority: 'high',
      inspectionId: inspection.id,
    }),
  }, 201);
  await request(`/tasks/${task.id}/status`, {
    method: 'PATCH',
    headers: authB,
    body: JSON.stringify({ status: 'completed' }),
  }, 404);
  const calendar = await request('/calendar', { headers: authA });
  if (!calendar.some((item: any) => item.kind === 'task' && item.sourceId === task.id)) {
    throw new Error('Persisted task missing from calendar projection.');
  }
  if (!calendar.some((item: any) => item.kind === 'corrective_action' && item.sourceId === action.id)) {
    throw new Error('Persisted corrective action missing from calendar projection.');
  }

  const reloaded = await request(`/inspections/${inspection.id}`, { headers: authA });
  const reloadedAnalyses = reloaded.observations?.[0]?.analyses || [];
  if (reloaded.status !== 'completed' ||
      !reloadedAnalyses.some((item: any) => item.id === analysis.id) ||
      !reloadedAnalyses.some((item: any) => item.requestVersion === 3 && item.status === 'current')) {
    throw new Error('Reloaded inspection did not include durable analysis state.');
  }

  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  const counts = await db.query(
    `SELECT
      (SELECT count(*)::int FROM site WHERE id = $1) sites,
      (SELECT count(*)::int FROM inspection WHERE id = $2) inspections,
      (SELECT count(*)::int FROM observations WHERE id = $3) observations,
      (SELECT count(*)::int FROM hazlenz_analyses WHERE "observationId" = $3) analyses,
      (SELECT count(*)::int FROM hazlenz_analyses WHERE id = $4) first_analysis,
      (SELECT max("requestVersion")::int FROM hazlenz_analyses WHERE "observationId" = $3) latest_analysis_version,
      (SELECT count(*)::int FROM hazlenz_analyses WHERE "observationId" = $3 AND status='current') current_analyses,
      (SELECT count(*)::int FROM human_reviews WHERE id = $5) reviews,
      (SELECT count(*)::int FROM inspection_findings WHERE "observationId" = $3) findings,
      (SELECT count(*)::int FROM inspection_findings WHERE id = $6) first_finding,
      (SELECT count(*)::int FROM tasks WHERE id = $7) tasks,
      (SELECT count(*)::int FROM corrective_actions WHERE id = $8) actions`,
    [site.id, inspection.id, observation.id, analysis.id, review.id, finding.id, task.id, action.id],
  );
  await db.end();
  const persisted = counts.rows[0];
  if (persisted.findings !== 2 || persisted.latest_analysis_version !== 3 ||
      persisted.current_analyses !== 1 || ![2, 3].includes(persisted.analyses) ||
      Object.entries(persisted).some(([key, value]) =>
        !['findings', 'analyses', 'latest_analysis_version'].includes(key) && value !== 1)) {
    throw new Error(`Unexpected persistence counts: ${JSON.stringify(persisted)}`);
  }

  console.log(JSON.stringify({
    passed: true,
    scenarios: 25,
    multiHazardFindings: 2,
    persisted,
    crossUserDenials: 4,
    massAssignmentRejected: true,
  }));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
