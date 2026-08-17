const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4232';
type Json = Record<string, any>;
async function req(path: string, options: RequestInit = {}, expected?: number) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const text = await response.text(); let body: Json = {}; try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (expected !== undefined && response.status !== expected) throw new Error(`${options.method || 'GET'} ${path} expected ${expected}, got ${response.status}: ${text}`);
  return { status: response.status, body };
}
const auth = (token: string) => ({ authorization: `Bearer ${token}` });
const snap = (hazards: any[]) => ({ multiHazardDecomposition: { hazards, isMultiHazard: hazards.length > 1, hazardCount: hazards.length }, guidedFinding: { findingCandidates: [] } });
async function main() {
  const suffix = `finding-review-${Date.now()}`, password = 'Finding!Strong123';
  await req('/auth/register', { method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password, name: suffix, type: 'individual' }) }, 201);
  const login = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password }) }, 201);
  const headers = auth(login.body.token);
  const site = await req('/sites', { method: 'POST', headers, body: JSON.stringify({ name: suffix }) }, 201);
  const inspection = await req('/inspections', { method: 'POST', headers, body: JSON.stringify({ siteId: site.body.id, title: suffix }) }, 201);
  const observation = await req(`/inspections/${inspection.body.id}/observations`, { method: 'POST', headers, body: JSON.stringify({ rawText: 'Guard leaves access to moving parts while startup state is unknown.' }) }, 201);
  const hazards = [
    { domainId: 'machine_guarding', hazardFamily: 'machine_guarding', mechanism: 'access to moving parts' },
    { domainId: 'hazardous_energy', hazardFamily: 'hazardous_energy', mechanism: 'unexpected startup' },
  ];
  const analysis = await req(`/inspections/observations/${observation.body.id}/analyses`, { method: 'POST', headers, body: JSON.stringify({ engineVersion: 'finding-review-test', idempotencyKey: `${suffix}-analysis`, requestVersion: 1, resultSnapshot: snap(hazards) }) }, 201);
  const loaded = await req(`/inspections/${inspection.body.id}`, { headers }, 200);
  const findings = loaded.body.findings.filter((f: Json) => f.status !== 'superseded');
  if (findings.length !== 2) throw new Error(`expected two findings, got ${findings.length}`);
  const reviews: Json[] = [];
  for (const finding of findings) {
    const review = await req(`/inspections/observations/${observation.body.id}/reviews`, { method: 'POST', headers, body: JSON.stringify({ findingId: finding.id, analysisId: analysis.body.id, idempotencyKey: `${suffix}-${finding.hazardKey}`, decision: 'accepted', rationale: `Reviewed ${finding.hazardKey} against observed facts.`, reviewedConclusion: { reviewerRisk: { overallRisk: finding.hazardKey === 'hazardous-energy' ? 'high' : 'medium' } } }) }, 201);
    const replay = await req(`/inspections/observations/${observation.body.id}/reviews`, { method: 'POST', headers, body: JSON.stringify({ findingId: finding.id, analysisId: analysis.body.id, idempotencyKey: `${suffix}-${finding.hazardKey}`, decision: 'accepted', rationale: 'Replay should return the original review.', reviewedConclusion: {} }) }, 201);
    if (replay.body.id !== review.body.id) throw new Error('review replay did not return the original review');
    reviews.push(review.body);
  }
  const refreshed = await req(`/inspections/${inspection.body.id}`, { headers }, 200);
  if (refreshed.body.findings.filter((f: Json) => f.finalReviewId).length !== 0) {
    throw new Error('reviews must not finalize findings implicitly');
  }
  for (let index = 0; index < findings.length; index += 1) {
    await req(`/inspections/observations/${observation.body.id}/findings`, { method: 'POST', headers, body: JSON.stringify({
      reviewId: reviews[index].id, segmentKey: findings[index].hazardKey, hazardCategory: findings[index].hazardCategory,
      conclusion: findings[index].conclusion, reviewerDisposition: 'split',
    }) }, 201);
  }
  const inReview = await req(`/inspections/${inspection.body.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'in_review', version: 1 }) }, 201);
  const completed = await req(`/inspections/${inspection.body.id}/transition`, { method: 'POST', headers, body: JSON.stringify({ status: 'completed', version: inReview.body.version }) }, 201);
  if (completed.body.status !== 'completed') throw new Error('finding-specific reviews did not permit finalization');
  console.log(JSON.stringify({ passed: true, inspectionId: inspection.body.id, observationId: observation.body.id, findingIds: findings.map((f: Json) => f.id), reviewIds: reviews.map((r: Json) => r.id), currentReviewCount: reviews.length, analysisId: analysis.body.id, finalStatus: completed.body.status }));
}
main().catch(error => { console.error(error); process.exit(1); });
