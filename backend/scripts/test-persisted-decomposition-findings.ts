const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4231';

type Json = Record<string, any>;

async function request(path: string, options: RequestInit = {}, expected?: number): Promise<{ status: number; body: Json }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (expected !== undefined && response.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${path}: expected ${expected}, got ${response.status}: ${text}`);
  }
  return { status: response.status, body };
}

function auth(token: string) { return { authorization: `Bearer ${token}` }; }

function snapshot(hazards: Array<Record<string, unknown>>) {
  return {
    advisory: true,
    multiHazardDecomposition: {
      version: 'v1', isMultiHazard: hazards.length > 1, hazardCount: hazards.length,
      hazards, decompositionConfidence: 0.9,
    },
    guidedFinding: { findingCandidates: [] },
  };
}

async function main() {
  const suffix = `persisted-decomposition-${Date.now()}`;
  const password = 'Persisted!Strong123';
  const registration = await request('/auth/register', {
    method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password, name: suffix, type: 'individual' }),
  }, 201);
  const login = await request('/auth/login', {
    method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password }),
  }, 201);
  const headers = auth(login.body.token);
  const site = await request('/sites', { method: 'POST', headers, body: JSON.stringify({ name: suffix }) }, 201);
  const inspection = await request('/inspections', { method: 'POST', headers, body: JSON.stringify({ siteId: site.body.id, title: suffix }) }, 201);
  const observation = await request(`/inspections/${inspection.body.id}/observations`, {
    method: 'POST', headers, body: JSON.stringify({ rawText: 'Guarding and unexpected startup remain possible.', evidenceSource: 'direct_observation' }),
  }, 201);
  const hazards = [
    { hazardId: 'haz-1', domainId: 'machine_guarding', hazardFamily: 'machine_guarding', mechanism: 'access to moving parts', observationFragment: 'guard leaves access', confidence: 0.8 },
    { hazardId: 'haz-2', domainId: 'hazardous_energy', hazardFamily: 'machine_guarding_loto', mechanism: 'unexpected startup', observationFragment: 'energy state unknown', confidence: 0.7 },
  ];
  const payload = (version: number, key: string, list = hazards) => ({
    method: 'POST', headers, body: JSON.stringify({ engineVersion: 'persisted-test', idempotencyKey: key, requestVersion: version, resultSnapshot: snapshot(list) }),
  });
  const first = await request(`/inspections/observations/${observation.body.id}/analyses`, payload(1, `${suffix}-v1`), 201);
  const replay = await request(`/inspections/observations/${observation.body.id}/analyses`, payload(1, `${suffix}-v1`), 201);
  if (replay.body.id !== first.body.id) throw new Error('Idempotent replay returned a different analysis.');
  const inspectionAfterFirst = await request(`/inspections/${inspection.body.id}`, { headers }, 200);
  const firstFindings = inspectionAfterFirst.body.findings.filter((item: Json) => item.status !== 'superseded');
  if (firstFindings.length !== 2) throw new Error(`Expected 2 current findings after first analysis, got ${firstFindings.length}.`);
  const second = await request(`/inspections/observations/${observation.body.id}/analyses`, payload(2, `${suffix}-v2`, [hazards[0], { hazardId: 'haz-3', domainId: 'electrical', hazardFamily: 'electrical', mechanism: 'damaged conductor', observationFragment: 'cord damage', confidence: 0.6 }]), 201);
  if (second.body.requestVersion !== 2) throw new Error('Request versions are not monotonic.');
  const inspectionAfterSecond = await request(`/inspections/${inspection.body.id}`, { headers }, 200);
  const active = inspectionAfterSecond.body.findings.filter((item: Json) => item.status !== 'superseded');
  const historical = inspectionAfterSecond.body.findings.filter((item: Json) => item.status === 'superseded');
  if (active.length !== 2 || historical.length !== 1) throw new Error(`Unexpected reconciliation: active=${active.length}, historical=${historical.length}.`);
  const stale = await request(`/inspections/observations/${observation.body.id}/analyses`, payload(1, `${suffix}-stale`));
  if (stale.status !== 409) throw new Error(`Expected stale analysis 409, got ${stale.status}.`);
  console.log(JSON.stringify({ passed: true, inspectionId: inspection.body.id, observationId: observation.body.id, analysisIds: [first.body.id, second.body.id], firstFindingKeys: firstFindings.map((item: Json) => item.hazardKey), activeFindingKeys: active.map((item: Json) => item.hazardKey), historicalFindingKeys: historical.map((item: Json) => item.hazardKey), staleStatus: stale.status, registrationUserId: registration.body.user?.id || null }));
}

main().catch(error => { console.error(error); process.exit(1); });
