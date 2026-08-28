/**
 * INSITE PRELAUNCH — Phase 2 measurement instrument (READ/MEASURE ONLY).
 *
 * Replays the EXACT server call sequence that frontend-next/app/inspection-workspace/page.tsx
 * issues for the customer journey, and records every server interaction so the
 * "add another finding" cost can be measured rather than estimated.
 *
 * It does not modify production code. It runs only against a disposable test_* database.
 */
import { execFileSync } from 'node:child_process';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4310';
const databaseUrl = process.env.DATABASE_URL || '';
if (!/\/test_/.test(databaseUrl)) {
  throw new Error(`Refusing to run: DATABASE_URL must name a disposable test_* database. Got: ${databaseUrl}`);
}

type Json = Record<string, any>;
type Call = { step: string; method: string; path: string; status: number; note?: string };
const calls: Call[] = [];

async function call(step: string, path: string, options: RequestInit = {}): Promise<{ status: number; body: Json }> {
  const method = (options.method || 'GET').toUpperCase();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  calls.push({ step, method, path: path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, ':id'), status: response.status, note: response.ok ? undefined : String(body?.message || text).slice(0, 200) });
  return { status: response.status, body };
}

function expect(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) process.exitCode = 1;
}

const OBS_1 = 'While walking the crusher drive area I saw a portable grinder in use with its lower wheel guard removed, and the operator was not wearing a face shield. The machine was energized and running.';
const OBS_2 = 'In the same area a temporary extension cord was run across the walkway with the outer jacket split and copper conductors visible near the panel.';

async function main() {
  const suffix = `${Date.now()}`;
  const password = 'PrelaunchUx!Strong123';
  const email = `prelaunch-ux-${suffix}@example.test`;

  // --- Account bootstrap (not part of the measured inspection journey) ---
  await call('bootstrap', '/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: 'UX Measure', type: 'individual' }) });
  const login = await call('bootstrap', '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const token = login.body.token;
  const auth = { authorization: `Bearer ${token}` };
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', login.body.user.id, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });

  // ================= A. START AN INSPECTION (/inspections page) =================
  const site = await call('A_start_inspection', '/sites', { method: 'POST', headers: auth, body: JSON.stringify({ name: 'Prelaunch UX Site' }) });
  const inspection = await call('A_start_inspection', '/inspections', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ siteId: site.body.id, title: 'Full Inspection', regulatoryContext: 'osha-general-industry' }),
  });
  const inspectionId = inspection.body.id;
  expect('A. inspection created', inspection.status === 201, `status ${inspection.status}`);

  // ================= B-K. FIRST FINDING (workspace: capture -> review -> risk) =================
  // analyze(): addPersistedObservation -> analyzeObservation -> saveAnalysisSnapshot -> getPersistedInspection
  const obs1 = await call('B_first_finding_capture', `/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: auth, body: JSON.stringify({ rawText: OBS_1, evidenceSource: 'direct_observation' }),
  });
  const analysis1 = await call('B_first_finding_capture', '/safescope-v2/classify', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ text: OBS_1, scopes: ['all'], inspectionId, structuredObservation: { narrative: OBS_1, jurisdiction: 'osha-general-industry', workArea: 'crusher drive', evidenceSource: ['worker-report'], controlsPresent: [], controlsMissing: [], unknownFacts: [], unresolvedContradictions: [], userConfirmedFacts: [] } }),
  });
  expect('B. HazLenz classify answered', analysis1.status === 200 || analysis1.status === 201, `status ${analysis1.status}`);
  const snap1 = await call('B_first_finding_capture', `/inspections/observations/${obs1.body.id}/analyses`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ engineVersion: 'hazlenz-production', resultSnapshot: analysis1.body, idempotencyKey: `k1-${suffix}`, requestVersion: 1 }),
  });
  let state = await call('B_first_finding_capture', `/inspections/${inspectionId}`, { headers: auth });

  let active = (state.body.findings || []).filter((f: any) => f.status !== 'superseded');
  console.log(`\n[MEASURED] observation 1 materialized ${active.length} finding(s) server-side: ${active.map((f: any) => f.hazardKey).join(', ')}`);
  expect('B. at least one finding materialized from one observation', active.length >= 1, `${active.length} findings`);

  // Risk step -> acceptReview(): saveHumanReview + finalizePersistedFinding per finding, then transition
  let reviewedCount = 0;
  for (const finding of active) {
    const review = await call('C_first_finding_review', `/inspections/observations/${obs1.body.id}/reviews`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ findingId: finding.id, idempotencyKey: `review:${snap1.body.id}:${finding.hazardKey}`, analysisId: snap1.body.id, decision: 'accepted', rationale: 'Reviewed against the observed facts; accepted as an advisory conclusion.', reviewedConclusion: { guidedFinding: analysis1.body.guidedFinding, reviewerRisk: { severity: 'Serious', likelihood: 'Likely', exposure: 'Potential', overallRisk: 'High', reviewerConfirmed: true } } }),
    });
    await call('C_first_finding_review', `/inspections/observations/${obs1.body.id}/findings`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ reviewId: review.body.id, hazardCategory: finding.hazardCategory, conclusion: finding.conclusion, segmentKey: finding.hazardKey, sourceCandidate: finding.sourceCandidate || {}, reviewerDisposition: 'single', riskAssessment: { severity: 'Serious', likelihood: 'Likely', exposure: 'Potential', overallRisk: 'High' } }),
    });
    reviewedCount++;
  }
  console.log(`[MEASURED] first observation required ${reviewedCount} separate review+finalize round-trip(s) — one per materialized finding`);

  state = await call('C_first_finding_review', `/inspections/${inspectionId}`, { headers: auth });
  await call('C_first_finding_review', `/inspections/${inspectionId}/transition`, {
    method: 'POST', headers: auth, body: JSON.stringify({ status: 'in_review', version: state.body.version }),
  });

  // ================= M-N. ADD A SECOND FINDING BEFORE COMPLETION =================
  state = await call('D_add_second_finding', `/inspections/${inspectionId}`, { headers: auth });
  const obs2 = await call('D_add_second_finding', `/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: auth, body: JSON.stringify({ rawText: OBS_2, evidenceSource: 'direct_observation' }),
  });
  expect('D. second observation accepted while in_review', obs2.status === 201, `status ${obs2.status} ${obs2.body?.message || ''}`);
  const analysis2 = await call('D_add_second_finding', '/safescope-v2/classify', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ text: OBS_2, scopes: ['all'], inspectionId, structuredObservation: { narrative: OBS_2, jurisdiction: 'osha-general-industry', evidenceSource: ['worker-report'], controlsPresent: [], controlsMissing: [], unknownFacts: [], unresolvedContradictions: [], userConfirmedFacts: [] } }),
  });
  const snap2 = await call('D_add_second_finding', `/inspections/observations/${obs2.body.id}/analyses`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ engineVersion: 'hazlenz-production', resultSnapshot: analysis2.body, idempotencyKey: `k2-${suffix}`, requestVersion: 1 }),
  });
  state = await call('D_add_second_finding', `/inspections/${inspectionId}`, { headers: auth });
  const afterSecond = (state.body.findings || []).filter((f: any) => f.status !== 'superseded');
  const secondFindings = afterSecond.filter((f: any) => f.observationId === obs2.body.id);
  console.log(`[MEASURED] observation 2 materialized ${secondFindings.length} finding(s); inspection now holds ${afterSecond.length} active finding(s)`);
  expect('D. earlier findings unaffected by the added observation',
    afterSecond.filter((f: any) => f.observationId === obs1.body.id).length === active.length,
    `${afterSecond.filter((f: any) => f.observationId === obs1.body.id).length} of ${active.length} retained`);

  for (const finding of secondFindings) {
    const review = await call('E_second_finding_review', `/inspections/observations/${obs2.body.id}/reviews`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ findingId: finding.id, idempotencyKey: `review:${snap2.body.id}:${finding.hazardKey}`, analysisId: snap2.body.id, decision: 'accepted', rationale: 'Reviewed against the observed facts; accepted as an advisory conclusion.', reviewedConclusion: { guidedFinding: analysis2.body.guidedFinding, reviewerRisk: { severity: 'Serious', likelihood: 'Possible', exposure: 'Potential', overallRisk: 'High', reviewerConfirmed: true } } }),
    });
    await call('E_second_finding_review', `/inspections/observations/${obs2.body.id}/findings`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ reviewId: review.body.id, hazardCategory: finding.hazardCategory, conclusion: finding.conclusion, segmentKey: finding.hazardKey, sourceCandidate: finding.sourceCandidate || {}, reviewerDisposition: 'single', riskAssessment: { severity: 'Serious', likelihood: 'Possible', exposure: 'Potential', overallRisk: 'High' } }),
    });
  }

  // ================= O-P. COMPLETE + GENERATE REPORT (workspace complete()) =================
  state = await call('F_complete', `/inspections/${inspectionId}`, { headers: auth });
  const allFindings = (state.body.findings || []).filter((f: any) => f.status !== 'superseded');
  for (const [index, finding] of allFindings.entries()) {
    const action = await call('F_complete', '/actions', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ inspectionId, findingId: finding.id, title: `Verify and correct reviewed condition ${index + 1}`, description: 'Immediate: ...\nPermanent: ...\nVerification: ...', priorityCode: 'high' }),
    });
    await call('F_complete', '/tasks', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ inspectionId, correctiveActionId: action.body.id, title: `Follow up reviewed finding ${index + 1}`, description: 'Confirm corrective action completion.', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), priority: 'high' }),
    });
  }
  const completed = await call('F_complete', `/inspections/${inspectionId}/transition`, {
    method: 'POST', headers: auth, body: JSON.stringify({ status: 'completed', version: state.body.version }),
  });
  expect('F. inspection completed', completed.status === 200 || completed.status === 201, `status ${completed.status} ${completed.body?.message || ''}`);
  const report1 = await call('F_complete', `/inspections/${inspectionId}/reports`, { method: 'POST', headers: auth });
  expect('F. report v1 generated', report1.body?.version === 1 && report1.body?.status === 'generated', JSON.stringify(report1.body).slice(0, 160));

  // ================= Q. ADD ANOTHER FINDING **AFTER** THE REPORT EXISTS =================
  // This is exactly what the workspace's "+ Add finding" -> "Analyze and add this finding"
  // button does when an inspection has already been completed and reported.
  console.log('\n[MEASURED] === Q. adding a finding AFTER report generation ===');
  const postReportObs = await call('G_post_report_add_finding', `/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: auth, body: JSON.stringify({ rawText: 'A third hazard noticed after the report was generated: an unlabelled chemical container on the mixing bench.', evidenceSource: 'direct_observation' }),
  });
  console.log(`[MEASURED] POST /inspections/:id/observations on a COMPLETED inspection -> HTTP ${postReportObs.status}: ${JSON.stringify(postReportObs.body?.message || postReportObs.body).slice(0, 200)}`);

  // Does the UI offer a reopen? Measure whether the server permits it, and what it then costs.
  state = await call('G_post_report_add_finding', `/inspections/${inspectionId}`, { headers: auth });
  const reopen = await call('G_post_report_add_finding', `/inspections/${inspectionId}/transition`, {
    method: 'POST', headers: auth, body: JSON.stringify({ status: 'draft', version: state.body.version }),
  });
  console.log(`[MEASURED] reopen completed -> draft: HTTP ${reopen.status}`);
  const retryObs = await call('G_post_report_add_finding', `/inspections/${inspectionId}/observations`, {
    method: 'POST', headers: auth, body: JSON.stringify({ rawText: 'A third hazard noticed after the report was generated: an unlabelled chemical container on the mixing bench.', evidenceSource: 'direct_observation' }),
  });
  console.log(`[MEASURED] after reopen, POST observation -> HTTP ${retryObs.status}`);

  // ================= REPORT REGENERATION SEMANTICS =================
  const dupReport = await call('H_report_semantics', `/inspections/${inspectionId}/reports`, { method: 'POST', headers: auth });
  console.log(`[MEASURED] POST report while inspection is back in draft -> HTTP ${dupReport.status}: ${JSON.stringify(dupReport.body?.message || '').slice(0, 160)}`);
  const reportList = await call('H_report_semantics', '/inspection-reports', { headers: auth });
  const listed = Array.isArray(reportList.body) ? reportList.body : [];
  console.log(`[MEASURED] GET /inspection-reports -> ${listed.length} report record(s); versions on first: ${JSON.stringify((listed[0]?.versions || []).map((v: any) => ({ v: v.version, status: v.status })))}`);
  const snapshotBytes = JSON.stringify(listed[0] || {}).length;
  console.log(`[MEASURED] list payload size for ${listed.length} report(s): ${snapshotBytes} bytes for the first record`);

  // ================= CALL LEDGER =================
  console.log('\n================ MEASURED SERVER CALL LEDGER ================');
  const byStep = new Map<string, Call[]>();
  for (const entry of calls) {
    if (entry.step === 'bootstrap') continue;
    if (!byStep.has(entry.step)) byStep.set(entry.step, []);
    byStep.get(entry.step)!.push(entry);
  }
  for (const [step, entries] of byStep) {
    console.log(`\n-- ${step} (${entries.length} server calls)`);
    for (const entry of entries) console.log(`   ${String(entry.status).padStart(3)} ${entry.method.padEnd(5)} ${entry.path}${entry.note ? `   << ${entry.note}` : ''}`);
  }
  const journey = calls.filter((entry) => entry.step !== 'bootstrap');
  console.log(`\nTOTAL measured server calls for the whole journey: ${journey.length}`);
  console.log(`  first finding (capture+review):  ${journey.filter((e) => e.step.startsWith('B_') || e.step.startsWith('C_')).length}`);
  console.log(`  SECOND finding (capture+review): ${journey.filter((e) => e.step.startsWith('D_') || e.step.startsWith('E_')).length}`);
  console.log(`  complete + report:               ${journey.filter((e) => e.step.startsWith('F_')).length}`);
  console.log(`  post-report add finding attempt: ${journey.filter((e) => e.step.startsWith('G_')).length}`);
}

main().catch((error) => { console.error('INSTRUMENT ERROR:', error); process.exit(1); });
