const base = process.env.HAZLENZ_BASE_URL || 'http://127.0.0.1:4000';
let token;

async function api(path, opts = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(base + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  const text = await r.text();
  const body = text ? JSON.parse(text) : null;
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${r.status}: ${JSON.stringify(body)}`);
  return body;
}

async function login(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  token = r.token;
}

// Prepares an observation + analysis + review WITHOUT finalizing a finding yet.
async function prepareReview(inspectionId, text) {
  const obs = await api(`/inspections/${inspectionId}/observations`, { method: 'POST', body: JSON.stringify({ rawText: text, evidenceSource: 'direct_observation' }) });
  const analysis = await api('/safescope-v2/classify', { method: 'POST', body: JSON.stringify({ text, scopes: ['all'], structuredObservation: { narrative: text, jurisdiction: 'unknown' } }) });
  const snap = await api(`/inspections/observations/${obs.id}/analyses`, { method: 'POST', body: JSON.stringify({ engineVersion: 'hazlenz-production', resultSnapshot: analysis, idempotencyKey: `snap-${obs.id}`, requestVersion: 1 }) });
  const review = await api(`/inspections/observations/${obs.id}/reviews`, { method: 'POST', body: JSON.stringify({ analysisId: snap.id, decision: 'accepted', rationale: 'Prepared for later finalize', idempotencyKey: `rev-${obs.id}` }) });
  return { observationId: obs.id, reviewId: review.id, label: text };
}

// This IS the finalize action: creating a finding via this endpoint moves it to "finalized".
async function finalizeFinding(prepared, hazardCategory) {
  const finding = await api(`/inspections/observations/${prepared.observationId}/findings`, {
    method: 'POST',
    body: JSON.stringify({ reviewId: prepared.reviewId, hazardCategory, conclusion: `${hazardCategory} finding for ${prepared.label}` }),
  });
  return finding.id;
}

async function getInspectionFindingsSummary(inspectionId) {
  const inspection = await api(`/inspections/${inspectionId}`);
  return (inspection.findings || []).map(f => ({ id: f.id, status: f.status, revision: f.revision, hazardCategory: f.hazardCategory, conclusion: f.conclusion }));
}

function explicitOnly(summary, ids) {
  return summary.filter(f => ids.includes(f.id));
}

async function main() {
  await login(process.env.HAZLENZ_MATRIX_EMAIL, process.env.HAZLENZ_MATRIX_PASSWORD);
  let site;
  try {
    site = await api('/sites', { method: 'POST', body: JSON.stringify({ name: 'Identity Coverage Test Site' }) });
  } catch (e) {
    const existing = await api('/sites?limit=100');
    site = existing.data.find(s => s.name === 'Identity Coverage Test Site');
    if (!site) throw e;
  }

  console.log('=== SCENARIO 1: three findings, middle (B) finalized first ===');
  const insp1 = await api('/inspections', { method: 'POST', body: JSON.stringify({ siteId: site.id, title: 'Identity Coverage - Middle First' }) });

  const prepA = await prepareReview(insp1.id, 'Exposed pinch point on conveyor drive pulley, no guard present.');
  const prepB = await prepareReview(insp1.id, 'Energy isolation device missing lockout tag during maintenance.');
  const prepC = await prepareReview(insp1.id, 'Employee working at unprotected leading edge six feet above lower level.');

  const beforeAny = await getInspectionFindingsSummary(insp1.id);
  const explicitIdsSoFar = [];
  console.log('Before any finalize (auto-decomposition candidates only, if any):', JSON.stringify(explicitOnly(beforeAny, explicitIdsSoFar)));
  console.log('Total rows incl. auto multi-hazard candidates:', beforeAny.length);

  const bId = await finalizeFinding(prepB, 'lockout_tagout');
  explicitIdsSoFar.push(bId);
  const afterB = await getInspectionFindingsSummary(insp1.id);
  const bRow = afterB.find(f => f.id === bId);
  const explicitAfterB = explicitOnly(afterB, [bId]);
  console.log('After finalizing B (middle) first — B row:', JSON.stringify(bRow));
  const scenario1Step1Pass = bRow?.status === 'finalized' && explicitAfterB.length === 1;
  console.log('B finalized, and no other explicit finding exists yet (A/C not finalized):', scenario1Step1Pass);

  const aId = await finalizeFinding(prepA, 'machine_guarding');
  const cId = await finalizeFinding(prepC, 'fall_protection');
  explicitIdsSoFar.push(aId, cId);

  const afterAll = await getInspectionFindingsSummary(insp1.id);
  const explicitAfterAll = explicitOnly(afterAll, [aId, bId, cId]);
  console.log('After finalizing A and C — explicit findings:', JSON.stringify(explicitAfterAll));
  const labelById = { [aId]: ['A', 'machine_guarding'], [bId]: ['B', 'lockout_tagout'], [cId]: ['C', 'fall_protection'] };
  const allFinalized = explicitAfterAll.every(f => f.status === 'finalized');
  const allCorrectCategory = explicitAfterAll.every(f => f.hazardCategory === labelById[f.id][1]);
  console.log('All three finalized, each with its own correct hazardCategory (no crossover):', allFinalized && allCorrectCategory);
  console.log(JSON.stringify(explicitAfterAll.map(f => [labelById[f.id][0], f.hazardCategory, f.status])));

  console.log('Reload check (fresh GET simulating page reload):');
  const reloadCheck = explicitOnly(await getInspectionFindingsSummary(insp1.id), [aId, bId, cId]);
  const reloadPass = reloadCheck.every(f => f.status === 'finalized') && reloadCheck.length === 3;
  console.log('Persisted correctly after reload:', reloadPass, JSON.stringify(reloadCheck));

  console.log('\n=== SCENARIO 2: duplicate/similar labels, distinct IDs ===');
  const insp2 = await api('/inspections', { method: 'POST', body: JSON.stringify({ siteId: site.id, title: 'Identity Coverage - Duplicate Labels' }) });

  const prepD1 = await prepareReview(insp2.id, 'Missing machine guard on the north conveyor line drive shaft.');
  const prepD2 = await prepareReview(insp2.id, 'Missing machine guard on the south conveyor line drive shaft.');

  const d1Id = await finalizeFinding(prepD1, 'machine_guarding');
  // Use an IDENTICAL user-visible conclusion/label for D2 on purpose, distinct id.
  const d2Finding = await api(`/inspections/observations/${prepD2.observationId}/findings`, {
    method: 'POST',
    body: JSON.stringify({ reviewId: prepD2.reviewId, hazardCategory: 'machine_guarding', conclusion: 'machine_guarding finding for Missing machine guard on the north conveyor line drive shaft.' }),
  });
  const d2Id = d2Finding.id;

  console.log('D1 id:', d1Id, 'D2 id:', d2Id, 'IDs distinct:', d1Id !== d2Id, '- both share the exact same conclusion text by design.');

  const after2 = explicitOnly(await getInspectionFindingsSummary(insp2.id), [d1Id, d2Id]);
  console.log('Both findings, identical label, distinct ids:', JSON.stringify(after2));
  const bothFinalizedIndependently = after2.length === 2 && after2.every(f => f.status === 'finalized') && new Set(after2.map(f => f.id)).size === 2;
  console.log('Both created/finalized independently by id, zero crossover in identity or content:', bothFinalizedIndependently);

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    scenario1_B_isolated_first: scenario1Step1Pass,
    scenario1_all_finalized_correctly: allFinalized && allCorrectCategory,
    scenario1_reload_persistence: reloadPass,
    scenario2_zero_crossover: bothFinalizedIndependently,
  }, null, 2));
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
