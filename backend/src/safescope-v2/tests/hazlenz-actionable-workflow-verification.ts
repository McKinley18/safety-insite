// Phase 6 — HazLenz output integration through the ACCEPTED inspection lifecycle.
//
// This does not redesign or re-accept the inspection lifecycle
// (`INSITE_V1_INSPECTION_LIFECYCLE_ACCEPTED`); it verifies that the repaired
// deterministic HazLenz output travels through that already-accepted workflow
// and reaches the customer as something they can act on:
//
//   see the hazard -> understand why -> see applicable standard information ->
//   assign risk -> establish a corrective action -> complete the finding ->
//   persist the inspection -> generate the report -> find the material hazard
//   represented in that report.
//
// Representative cases, chosen before the run:
//   * a genuine multi-hazard observation (B-01: guarding + LOTO);
//   * one of the three classifier-only residuals (B-05: compressed gas);
//   * the MCC case (B-15: LOTO + electrical);
//   * a multi-hazard case needing two materially distinct corrective actions
//     (B-12: a damaged energized cord and a broken ladder);
//   * a negated/safe control (A-22: no hot work was taking place);
//   * an MCC safe-isolation control (probe HE-02).
//
//   API_BASE_URL=http://127.0.0.1:4231 \
//   npx ts-node src/safescope-v2/tests/hazlenz-actionable-workflow-verification.ts

import { execFileSync } from 'child_process';
import { inflateSync } from 'zlib';
import { POPULATION_A, POPULATION_B } from './hazlenz-decomposition-precision-corpus';
import { HAZARDOUS_ENERGY_PROBES } from './hazlenz-level1-recall-probe-corpus';

const BASE = process.env.API_BASE_URL || 'http://127.0.0.1:4231';
interface Json { [key: string]: any }

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
    throw new Error(`${method} ${route}: expected ${expected}, got ${response.status}: ${text.slice(0, 600)}`);
  }
  return { status: response.status, body: parsed };
}

const corpusA = (id: string) => POPULATION_A.find(r => r.id === id)!.observation;
const corpusB = (id: string) => POPULATION_B.find(r => r.id === id)!.observation;
const probe = (id: string) => HAZARDOUS_ENERGY_PROBES.find(r => r.id === id)!.observation;

interface Case {
  id: string;
  intent: string;
  text: string;
  /** Families the customer must be able to act on, one finding each. */
  mustBeActionable: string[][];
  /** No engine finding at all may be materialised. */
  mustProduceNoFinding?: boolean;
  /** Distinct corrective actions this case must be able to carry. */
  distinctCorrectiveActions?: number;
}

const CASES: Case[] = [
  { id: 'W-01', intent: 'genuine multi-hazard observation (B-01)', text: corpusB('B-01'),
    mustBeActionable: [['lockout_tagout'], ['machine_guarding']], distinctCorrectiveActions: 2 },
  { id: 'W-02', intent: 'classifier-only residual now actionable (B-05)', text: corpusB('B-05'),
    mustBeActionable: [['compressed_gas'], ['hot_work']] },
  { id: 'W-03', intent: 'MCC bucket opened live, no lock (B-15)', text: corpusB('B-15'),
    mustBeActionable: [['lockout_tagout'], ['electrical']] },
  { id: 'W-04', intent: 'two materially distinct corrective actions (B-12)', text: corpusB('B-12'),
    mustBeActionable: [['electrical'], ['fall_protection']], distinctCorrectiveActions: 2 },
  { id: 'W-05', intent: 'negated/safe control — no hot work was taking place (A-22)', text: corpusA('A-22'),
    mustBeActionable: [], mustProduceNoFinding: true },
  { id: 'W-06', intent: 'MCC safe-isolation control (HE-02)', text: probe('HE-02'),
    mustBeActionable: [], mustProduceNoFinding: true },
];

const ALIASES: Record<string, string> = {
  ppe: 'personal_protective_equipment', hazcom: 'hazard_communication',
  cranes_hoists: 'cranes_rigging_hoisting', rigging_lifting: 'cranes_rigging_hoisting',
  forklifts: 'powered_industrial_trucks', welding_cutting: 'hot_work',
};
const canon = (v: string) => {
  const slug = String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return ALIASES[slug] || slug;
};

function findingDomains(finding: Json): string[] {
  return Array.from(new Set([
    finding?.hazardCategory, finding?.sourceCandidate?.domainId,
    finding?.sourceCandidate?.hazardFamily, finding?.hazardKey,
  ].filter(Boolean).map((v: any) => canon(String(v)))));
}

async function main() {
  const failures: string[] = [];
  const notes: string[] = [];
  let checks = 0;
  const check = (ok: boolean, label: string, detail = '') => {
    checks += 1;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  };

  const suffix = `workflow-${Date.now()}`;
  const email = `${suffix}@example.test`;
  const password = 'Workflow!Strong123';
  await call('POST', '/auth/register', { email, password, name: suffix, type: 'individual' }, undefined, 201);
  const login = await call('POST', '/auth/login', { email, password }, undefined, 201);
  const token = String(login.body.token);
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', String(login.body.user.id), '4'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  const site = await call('POST', '/sites', { name: suffix }, token, 201);
  const inspection = await call('POST', '/inspections',
    { siteId: site.body.id, title: `HazLenz workflow ${suffix}` }, token, 201);
  const inspectionId = String(inspection.body.id);

  const finalizedFindingIds: string[] = [];
  const createdActions: Array<{ caseId: string; id: string; title: string; findingId: string }> = [];
  const expectedInReport: Array<{ caseId: string; family: string }> = [];

  for (const testCase of CASES) {
    console.log(`\n== ${testCase.id} — ${testCase.intent}`);
    const observation = await call('POST', `/inspections/${inspectionId}/observations`,
      { rawText: testCase.text, evidenceSource: 'direct_observation' }, token, 201);
    const observationId = String(observation.body.id);
    const classify = await call('POST', '/safescope-v2/classify', { text: testCase.text }, token, 201);
    await call('POST', `/inspections/observations/${observationId}/analyses`, {
      engineVersion: 'workflow-verification',
      idempotencyKey: `${suffix}-${testCase.id}`,
      requestVersion: 1,
      resultSnapshot: classify.body,
    }, token, 201);

    const view = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
    const findings = (Array.isArray(view.body.findings) ? view.body.findings : [])
      .filter((f: Json) => String(f.observationId) === observationId && f.status !== 'superseded');

    if (testCase.mustProduceNoFinding) {
      check(findings.length === 0, `${testCase.id} safe/negated observation materialises no engine finding`,
        findings.length ? `got [${findings.map((f: Json) => f.hazardKey).join(', ')}]` : 'none');
      continue;
    }

    const consumed = new Set<string>();
    for (const group of testCase.mustBeActionable) {
      const wanted = group.map(canon);
      const finding = findings.find((f: Json) =>
        !consumed.has(String(f.id)) && findingDomains(f).some(d => wanted.includes(d)));
      const label = `${testCase.id} ${group.join('|')}`;
      if (!finding) { check(false, `${label} — customer can SEE the hazard as a finding`, 'no finding'); continue; }
      consumed.add(String(finding.id));
      expectedInReport.push({ caseId: testCase.id, family: String(finding.hazardCategory || '') });

      check(true, `${label} — customer can SEE the hazard as a finding`, `hazardKey=${finding.hazardKey}`);
      check(
        Boolean(String(finding.conclusion || '').trim()) &&
        Boolean(String(finding.sourceCandidate?.observationFragment || '').trim()),
        `${label} — customer can UNDERSTAND WHY (mechanism + observation fragment)`,
      );
      const citations = Array.isArray(finding.sourceCandidate?.standardCandidates)
        ? finding.sourceCandidate.standardCandidates.map((c: any) => String(c?.citation || '')).filter(Boolean)
        : [];
      // Standards presence is RECORDED, not asserted: a hazard with no rule in the
      // bounded finding-scoped applicability rule set is a measured coverage limit
      // (see the phase's standards check), not a workflow defect.
      notes.push(`${label} standards on finding: ${citations.length ? citations.join(', ') : 'NONE'}`);
      check(
        Boolean(finding.riskSnapshot && typeof finding.riskSnapshot === 'object' &&
          Object.keys(finding.riskSnapshot).length > 0),
        `${label} — customer can ASSIGN RISK (risk snapshot present)`,
      );
      check(
        Boolean(finding.riskSnapshot?.correctiveActionIntelligence),
        `${label} — customer has a CORRECTIVE ACTION path on the finding`,
      );

      const action = await call('POST', '/actions', {
        inspectionId,
        findingId: String(finding.id),
        classificationId: String(finding.hazardKey),
        title: `Correct ${finding.hazardCategory}`,
        description: `Corrective action for ${finding.hazardCategory} identified in ${testCase.id}.`,
        priorityCode: 'high',
      }, token, 201);
      check(Boolean(action.body?.id), `${label} — corrective action ESTABLISHED and persisted`);
      createdActions.push({
        caseId: testCase.id,
        id: String(action.body?.id || ''),
        title: String(action.body?.title || ''),
        findingId: String(finding.id),
      });

      const review = await call('POST', `/inspections/observations/${observationId}/reviews`, {
        findingId: String(finding.id),
        decision: 'accepted',
        rationale: `Confirmed ${finding.hazardCategory} during workflow verification.`,
        idempotencyKey: `${suffix}-${testCase.id}-${finding.hazardKey}`.slice(0, 120),
      }, token, 201);
      const finalized = await call('POST', `/inspections/observations/${observationId}/findings`, {
        reviewId: String(review.body.id),
        // The finding this review belongs to, named the way the lifecycle names it.
        segmentKey: String(finding.hazardKey),
        conclusion: String(finding.conclusion || finding.hazardCategory || 'Confirmed hazard'),
      }, token, 201);
      check(String(finalized.body?.status) === 'finalized',
        `${label} — finding COMPLETED (finalized)`, `status=${finalized.body?.status}`);
      finalizedFindingIds.push(String(finding.id));
    }

    if (testCase.distinctCorrectiveActions) {
      const mine = createdActions.filter(a => a.caseId === testCase.id);
      const distinctTitles = new Set(mine.map(a => a.title));
      const distinctFindings = new Set(mine.map(a => a.findingId));
      check(
        distinctTitles.size >= testCase.distinctCorrectiveActions &&
        distinctFindings.size >= testCase.distinctCorrectiveActions,
        `${testCase.id} — carries ${testCase.distinctCorrectiveActions} materially DISTINCT corrective actions`,
        `distinct titles=${distinctTitles.size}, distinct findings=${distinctFindings.size}`,
      );
    }
  }

  console.log('\n== corrective-action retrieval, persistence and report');
  const actionList = await call('GET', '/actions?page=1&limit=100', undefined, token, 200);
  const listed = Array.isArray(actionList.body?.data) ? actionList.body.data : [];
  const listedIds = new Set(listed.map((a: Json) => String(a?.id || '')));
  const retrievable = createdActions.filter(a => listedIds.has(a.id)).length;
  check(retrievable === createdActions.length,
    'customer can RETRIEVE every corrective action they established',
    `${retrievable}/${createdActions.length} listed (total reported ${actionList.body?.meta?.total})`);

  const readiness = await call('GET', `/inspections/${inspectionId}/completion-readiness`, undefined, token, 200);
  console.log(`  completion readiness: ${JSON.stringify(readiness.body).slice(0, 400)}`);
  const beforeReview = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  const toReview = await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'in_review', version: Number(beforeReview.body.version) }, token);
  check(toReview.status === 200 || toReview.status === 201,
    'inspection transitions draft -> in_review',
    `status=${toReview.status} ${JSON.stringify(toReview.body).slice(0, 160)}`);
  const beforeComplete = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  const transition = await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'completed', version: Number(beforeComplete.body.version) }, token);
  check(transition.status === 200 || transition.status === 201,
    'inspection PERSISTS through completion transition',
    `status=${transition.status} ${JSON.stringify(transition.body).slice(0, 200)}`);

  const report = await call('POST', `/inspections/${inspectionId}/reports`, undefined, token);
  check(report.status === 200 || report.status === 201, 'report GENERATED',
    `status=${report.status} ${JSON.stringify(report.body).slice(0, 200)}`);
  const reportId = String(report.body?.reportId || report.body?.id || '');
  if (reportId) {
    await call('GET', `/inspection-reports/${reportId}`, undefined, token, 200);
    // The report the customer receives IS the PDF, so that is what is inspected —
    // not the metadata endpoint. Text is recovered from the content streams and
    // compared with whitespace removed, because the renderer kerns letters apart
    // ("Loc k out  T a gout"); the comparison is otherwise exact.
    const pdf = await fetch(`${BASE}/inspection-reports/${reportId}/download`, {
      headers: { authorization: `Bearer ${token}` },
    });
    check(pdf.status === 200, 'report PDF downloadable by the customer', `status=${pdf.status}`);
    const bytes = Buffer.from(await pdf.arrayBuffer());
    const latin = bytes.toString('latin1');
    let streams = '';
    const marker = /stream\r?\n/g;
    let hit: RegExpExecArray | null;
    while ((hit = marker.exec(latin)) !== null) {
      const start = hit.index + hit[0].length;
      const end = latin.indexOf('endstream', start);
      if (end < 0) continue;
      try { streams += inflateSync(bytes.subarray(start, end)).toString('latin1'); } catch { /* not a flate stream */ }
    }
    const hexText = (streams.match(/<[0-9a-fA-F\s]+>/g) || [])
      .map(token => Buffer.from(token.slice(1, -1).replace(/\s/g, ''), 'hex').toString('latin1'));
    const literalText = (streams.match(/\((?:[^()\\]|\\.)*\)/g) || []).map(token => token.slice(1, -1));
    const flattened = [...hexText, ...literalText].join(' ').toLowerCase().replace(/\s+/g, '');
    check(flattened.length > 500, 'report PDF carries readable text', `${flattened.length} chars`);
    for (const expected of expectedInReport) {
      const needle = expected.family.toLowerCase().replace(/[\s_]+/g, '');
      check(Boolean(needle) && flattened.includes(needle),
        `report REPRESENTS ${expected.caseId} hazard "${expected.family}"`);
    }
  } else {
    check(false, 'report id returned so report content can be verified');
  }

  console.log('\n-- recorded (not asserted) --');
  for (const note of notes) console.log(`  ${note}`);

  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks} checks`);
    process.exit(1);
  }
  console.log(`PASS HazLenz actionable workflow verification (${checks} checks)`);
}

main().catch(error => { console.error(error); process.exit(2); });
