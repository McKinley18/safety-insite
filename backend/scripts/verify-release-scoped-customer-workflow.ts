// RELEASE-SCOPED CUSTOMER WORKFLOW ACCEPTANCE — Phases 9, 10 and 11. 2026-08-28.
//
//   API_BASE_URL=http://127.0.0.1:4232 npx ts-node scripts/verify-release-scoped-customer-workflow.ts
//
// Runs the REAL customer workflow over HTTP against a server configured for governed delivery, and
// measures what the customer's own records end up claiming.
//
// WHY THIS EXISTS ALONGSIDE `verify:hazlenz-actionable-workflow`. That suite posts `/classify`
// WITHOUT an `inspectionId`, so it can never exercise inspection release binding. The real
// front-end does send one (`analyzeObservation(observation, { inspectionId })`), and binding is the
// property this phase is about -- so this suite drives the request shape the product actually
// sends, not the shape the older harness happened to use.
//
// NO EXPECTED GOVERNED COUNT IS PRESCRIBED. The correct number of approved-governed findings is
// whatever release-scoped resolution genuinely produces for these observations; asserting a target
// would turn a measurement into something to satisfy. What IS asserted is semantic: every claim a
// finding makes must be true, every approved claim must trace to a governed record, and no finding
// may switch releases behind the customer's back.

import 'dotenv/config';
import { execFileSync } from 'child_process';
import { inflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { DataSource } from 'typeorm';
import { runOwnedMutatingSuite } from './lib/test-database-ownership';

const BASE = process.env.API_BASE_URL || 'http://127.0.0.1:4232';
const CANDIDATE = 'federal-core-2026-08-28.1';
/** The synthetic successor used ONLY to exercise a pointer transition. Never a real identity. */
const SUCCESSOR = 'workflow-fixture.successor';

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
    throw new Error(`${method} ${route}: expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  return { status: response.status, body: parsed };
}

/**
 * Observations chosen because their code-resident rules emit citations the reviewed release
 * ACTUALLY holds -- LOTO (1910.147) and machine guarding (1910.212(a)(1)) -- so the run can
 * distinguish "governed resolution produced nothing" from "governed resolution was never reached".
 */
const OBSERVATIONS = [
  {
    id: 'RS-01',
    text: 'A maintenance worker was clearing a jam inside the press with the machine still connected '
      + 'to power and no lockout device applied to the disconnect. The point-of-operation guard was '
      + 'removed and left on the floor beside the machine.',
  },
  {
    id: 'RS-02',
    text: 'The motor control center bucket was open with energized conductors exposed while an '
      + 'electrician worked on the starter. No lockout tag was present on the disconnect.',
  },
];

function collectCandidates(findings: Json[]) {
  const rows: Json[] = [];
  for (const finding of findings) {
    const candidates = Array.isArray(finding?.sourceCandidate?.standardCandidates)
      ? finding.sourceCandidate.standardCandidates : [];
    for (const candidate of candidates) {
      rows.push({
        findingId: finding.id, hazardKey: finding.hazardKey,
        findingKnowledgeReleaseId: finding.knowledgeReleaseId ?? null,
        citation: candidate.citation,
        authorityState: candidate.authorityState ?? 'UNANNOTATED',
        governedReleaseId: candidate.governedReleaseId ?? null,
        governedReleaseMember: candidate.governedReleaseMember ?? null,
        governedRecordChecksum: candidate.governedRecordChecksum ?? null,
        effectiveReviewState: candidate.effectiveReviewState ?? null,
        reviewerId: candidate.reviewerId ?? null,
        corpusBacked: candidate.corpusBacked ?? null,
        contentDisclosure: candidate.contentDisclosure ?? null,
        backingStatus: candidate.backingStatus ?? null,
        standardText: candidate.standardText ?? null,
        plainLanguageSummary: candidate.plainLanguageSummary ?? null,
        summary: candidate.summary ?? null,
      });
    }
  }
  return rows;
}

async function run() {
  const ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, synchronize: false });
  await ds.initialize();
  const evidence: Json = {};

  const email = String(process.env.RELEASE_SCOPED_EMAIL || '');
  const password = String(process.env.RELEASE_SCOPED_PASSWORD || '');
  if (!email || !password) throw new Error('RELEASE_SCOPED_EMAIL / RELEASE_SCOPED_PASSWORD are required.');
  const login = await call('POST', '/auth/login', { email, password }, undefined, 201);
  const token = String(login.body.token);
  const userId = String(login.body.user.id);
  console.log(`-- authenticated as ${userId}`);

  const active = await ds.query(`SELECT "releaseId" FROM regulatory_releases WHERE status='active'`);
  check(active?.[0]?.releaseId === CANDIDATE,
    'the reviewed candidate release is the ACTIVE release for this run', String(active?.[0]?.releaseId));

  // ================================================================ PHASE 9 — the workflow
  console.log('\n-- Phase 9: the real customer workflow, release-scoped --');
  const suffix = `relscope-${Date.now()}`;
  const site = await call('POST', '/sites', { name: suffix }, token, 201);
  const inspection = await call('POST', '/inspections', {
    siteId: site.body.id, title: `Release-scoped workflow ${suffix}`,
    regulatoryContext: 'osha-general-industry',
  }, token, 201);
  const inspectionId = String(inspection.body.id);

  const beforeBinding = await ds.query(
    `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId]);
  check(beforeBinding?.[0]?.knowledgeReleaseId === null,
    'a newly created inspection carries NO release binding yet',
    String(beforeBinding?.[0]?.knowledgeReleaseId));

  for (const observation of OBSERVATIONS) {
    const persisted = await call('POST', `/inspections/${inspectionId}/observations`,
      { rawText: observation.text, evidenceSource: 'direct_observation' }, token, 201);
    const observationId = String(persisted.body.id);
    // The request shape the product sends: the inspection is named, so the server is the authority
    // for both jurisdiction and governing release.
    const classify = await call('POST', '/safescope-v2/classify',
      { text: observation.text, inspectionId }, token, 201);
    await call('POST', `/inspections/observations/${observationId}/analyses`, {
      engineVersion: 'release-scoped-acceptance',
      idempotencyKey: `${suffix}-${observation.id}`,
      requestVersion: 1,
      resultSnapshot: classify.body,
    }, token, 201);

    // Take each finding all the way to `finalized`, exactly as the accepted lifecycle requires.
    // Without this the inspection cannot complete and no report can be generated, so Phase 11
    // would be measuring a workflow the customer never actually finishes.
    const observationView = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
    const open = (Array.isArray(observationView.body.findings) ? observationView.body.findings : [])
      .filter((f: Json) => String(f.observationId) === observationId && f.status !== 'superseded'
        && f.status !== 'finalized');
    for (const finding of open) {
      await call('POST', '/actions', {
        inspectionId, findingId: String(finding.id), classificationId: String(finding.hazardKey),
        title: `Correct ${finding.hazardCategory}`,
        description: `Corrective action for ${finding.hazardCategory}.`,
        priorityCode: 'high',
      }, token, 201);
      const review = await call('POST', `/inspections/observations/${observationId}/reviews`, {
        findingId: String(finding.id), decision: 'accepted',
        rationale: `Confirmed ${finding.hazardCategory} during release-scoped acceptance.`,
        idempotencyKey: `${suffix}-${observation.id}-${finding.hazardKey}`.slice(0, 120),
      }, token, 201);
      await call('POST', `/inspections/observations/${observationId}/findings`, {
        reviewId: String(review.body.id), segmentKey: String(finding.hazardKey),
        conclusion: String(finding.conclusion || finding.hazardCategory || 'Confirmed hazard'),
      }, token, 201);
    }
  }

  const afterBinding = await ds.query(
    `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId]);
  check(afterBinding?.[0]?.knowledgeReleaseId === CANDIDATE,
    'the inspection acquired the active release as its binding, through the real request path',
    String(afterBinding?.[0]?.knowledgeReleaseId));

  const analyses = await ds.query(
    `SELECT a.id, a."knowledgeReleaseId" FROM hazlenz_analyses a
       JOIN observations o ON o.id = a."observationId" WHERE o."inspectionId" = $1`, [inspectionId]);
  check(analyses.length === OBSERVATIONS.length,
    `${OBSERVATIONS.length} analyses persisted`, String(analyses.length));

  const view = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  const findings = (Array.isArray(view.body.findings) ? view.body.findings : [])
    .filter((f: Json) => f.status !== 'superseded');
  const candidates = collectCandidates(findings);

  const distribution: Record<string, number> = {};
  for (const candidate of candidates) {
    distribution[candidate.authorityState] = (distribution[candidate.authorityState] || 0) + 1;
  }
  const approved = candidates.filter(c => c.authorityState === 'APPROVED_GOVERNED_CONTENT');
  console.log(`\n  persisted findings              : ${findings.length}`);
  console.log(`  persisted standard candidates   : ${candidates.length}`);
  console.log(`  authority states                : ${JSON.stringify(distribution)}`);
  console.log(`  analysis knowledgeReleaseId     : ${JSON.stringify([...new Set(analyses.map((a: Json) => a.knowledgeReleaseId))])}`);
  console.log(`  corpusBacked = true             : ${candidates.filter(c => c.corpusBacked === true).length}`);
  console.log(`  reviewer present                : ${candidates.filter(c => c.reviewerId).length}`);
  console.log(`  record checksum present         : ${candidates.filter(c => c.governedRecordChecksum).length}`);

  check(candidates.length > 0, 'the workflow persisted standard candidates to measure',
    String(candidates.length));

  // Semantic correctness, per candidate. No count is required; every CLAIM must be true.
  for (const candidate of candidates) {
    if (candidate.authorityState === 'APPROVED_GOVERNED_CONTENT') {
      check(candidate.governedReleaseId === CANDIDATE && candidate.governedReleaseMember === true
        && candidate.effectiveReviewState === 'reviewer_approved'
        && Boolean(candidate.governedRecordChecksum) && Boolean(candidate.reviewerId)
        && candidate.corpusBacked === true,
        `approved claim on ${candidate.citation} is fully evidenced`,
        JSON.stringify({ release: candidate.governedReleaseId, member: candidate.governedReleaseMember }));
    } else {
      check(candidate.corpusBacked !== true && candidate.contentDisclosure !== 'GOVERNED_APPROVED'
        && !candidate.reviewerId,
        `${candidate.authorityState} on ${candidate.citation} claims no approval`,
        String(candidate.contentDisclosure));
    }
    if (candidate.findingKnowledgeReleaseId) {
      check(candidate.findingKnowledgeReleaseId === CANDIDATE,
        `finding provenance names the bound release and no other`,
        String(candidate.findingKnowledgeReleaseId));
    }
  }

  // ============================================= PHASE 10 — customer-facing content validation
  console.log('\n-- Phase 10: customer-visible regulatory content --');
  const snapshot = await ds.query(
    `SELECT citation, "citationKey", "recordChecksum", payload FROM regulatory_release_records
      WHERE "releaseId" = $1`, [CANDIDATE]);
  const byChecksum = new Map(snapshot.map((row: Json) => [row.recordChecksum, row]));
  for (const candidate of approved) {
    const record: Json | undefined = byChecksum.get(candidate.governedRecordChecksum) as Json | undefined;
    check(Boolean(record),
      `${candidate.citation}: the checksum it claims names a real record in the release`,
      String(candidate.governedRecordChecksum));
    if (!record) continue;
    const governedText = [String(record.payload?.canonicalText || ''), String(record.payload?.summary || '')]
      .map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const displayed = [candidate.standardText, candidate.plainLanguageSummary, candidate.summary]
      .filter(Boolean).map((t: string) => String(t).replace(/\s+/g, ' ').trim());
    // Every displayed body string on an APPROVED candidate must be one the governed record supplies.
    for (const text of displayed) {
      check(governedText.some(g => g === text),
        `${candidate.citation}: displayed regulatory text comes from the governed record`,
        text.slice(0, 90));
    }
  }
  // The 8 rejected summaries must be unreachable as approved customer text.
  const rejectedSummaries = await ds.query(
    `SELECT r.citation, r.payload->>'summary' AS summary FROM regulatory_release_records r
      WHERE r."releaseId" <> $1 AND r."citationKey" NOT IN (
        SELECT "citationKey" FROM regulatory_release_records WHERE "releaseId" = $1)`, [CANDIDATE]);
  const approvedTexts = approved.flatMap(c =>
    [c.standardText, c.plainLanguageSummary, c.summary].filter(Boolean).map((t: string) => String(t)));
  const leaked = rejectedSummaries.filter((row: Json) =>
    row.summary && approvedTexts.some(text => text.includes(String(row.summary).slice(0, 60))));
  check(leaked.length === 0,
    'no non-member record summary appears as approved governed customer text',
    `${rejectedSummaries.length} non-member summaries checked`);

  // Legacy/fallback findings stay distinguishable and claim nothing.
  const legacyCandidates = candidates.filter(c => c.authorityState !== 'APPROVED_GOVERNED_CONTENT');
  check(legacyCandidates.every(c => c.contentDisclosure !== 'GOVERNED_APPROVED'),
    'every non-approved candidate is distinguishable in its own provenance',
    `${legacyCandidates.length} non-approved candidates`);

  // ============================================= PHASE 11 — report / reopen / reanalysis
  console.log('\n-- Phase 11: report, reopen, re-analysis --');
  const readiness = await call('GET', `/inspections/${inspectionId}/completion-readiness`, undefined, token, 200);
  void readiness;
  const beforeReview = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'in_review', version: Number(beforeReview.body.version) }, token);
  const beforeComplete = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'completed', version: Number(beforeComplete.body.version) }, token);
  const report = await call('POST', `/inspections/${inspectionId}/reports`, undefined, token);
  check(report.status === 200 || report.status === 201, 'report GENERATED',
    `status=${report.status} ${JSON.stringify(report.body).slice(0, 200)}`);
  const reportId = String(report.body?.reportId || report.body?.id || '');

  let reportText = '';
  if (reportId) {
    const pdf = await fetch(`${BASE}/inspection-reports/${reportId}/download`,
      { headers: { authorization: `Bearer ${token}` } });
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
      try { streams += inflateSync(bytes.subarray(start, end)).toString('latin1'); } catch { /* not flate */ }
    }
    reportText = (streams.match(/<[0-9a-fA-F\s]+>/g) || [])
      .map(t => Buffer.from(t.slice(1, -1).replace(/\s/g, ''), 'hex').toString('latin1')).join(' ')
      + ' ' + (streams.match(/\((?:\\.|[^\\)])*\)/g) || []).join(' ');
    const squashed = reportText.replace(/\s+/g, '').toLowerCase();
    // The report must not claim reviewer approval, review status or governed authority anywhere.
    for (const claim of ['reviewerapproved', 'reviewer-approved', 'approvedbyreviewer',
      'governedrelease', 'reviewedregulation', 'insite-product-owner-authorized']) {
      check(!squashed.includes(claim), `the report makes no '${claim}' claim`);
    }
  }

  const persistedFindings = await ds.query(
    `SELECT id, "knowledgeReleaseId", "sourceCandidate" FROM inspection_findings
      WHERE "inspectionId" = $1 ORDER BY "createdAt"`, [inspectionId]);
  const beforeReopen = JSON.stringify(persistedFindings.map((f: Json) =>
    [f.knowledgeReleaseId, (f.sourceCandidate?.standardCandidates || [])
      .map((c: Json) => [c.citation, c.authorityState, c.governedReleaseId, c.governedRecordChecksum])]));

  // A DIFFERENT release becomes active, mid-life, exactly as a real cutover would do.
  await ds.query(`DELETE FROM regulatory_release_record_reviews WHERE "releaseId" = $1`, [SUCCESSOR]);
  await ds.query(`DELETE FROM regulatory_release_records WHERE "releaseId" = $1`, [SUCCESSOR]);
  await ds.query(`DELETE FROM regulatory_releases WHERE "releaseId" = $1`, [SUCCESSOR]);
  const payload = {
    agency: 'OSHA', citation: '29 CFR 1910.900003', title: 'Successor fixture standard',
    canonicalText: 'Successor fixture text.', summary: 'Successor fixture summary.',
    scope: 'osha_general_industry', sourceKey: 'fixture:successor', sourceName: 'fixture',
    sourceType: 'fixture', authorityTier: 'regulation', allowedUse: 'governed',
    hazards: null, controls: null, keywords: null, severityWeight: 1, active: true,
  };
  const { createHash } = require('crypto');
  const recordChecksum = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  await ds.query(
    `INSERT INTO regulatory_release_records ("releaseId","standardId","agencyCode",citation,
       "citationKey","recordChecksum","reviewState","reviewStateReason",payload)
     VALUES ($1,NULL,'OSHA','29 CFR 1910.900003','29cfr1910.900003',$2,'mechanically_validated','fixture',$3)`,
    [SUCCESSOR, recordChecksum, JSON.stringify(payload)]);
  await ds.query(
    `INSERT INTO regulatory_release_record_reviews ("releaseId","citationKey",citation,
       "recordChecksum",decision,"reviewerId","reviewerRole",note,"frozenReviewStateAtDecision","decidedAt")
     VALUES ($1,'29cfr1910.900003','29 CFR 1910.900003',$2,'approved','fixture-reviewer','fixture',
             'fixture','mechanically_validated',now())`, [SUCCESSOR, recordChecksum]);
  const manifest = createHash('sha256').update(JSON.stringify(
    [{ agency: 'OSHA', citation: '29 CFR 1910.900003', checksum: recordChecksum }])).digest('hex');
  await ds.query(
    `INSERT INTO regulatory_releases ("releaseId","releaseVersion",status,"manifestChecksum",
       "parserVersion","recordCount") VALUES ($1,'fixture','provisional',$2,'fixture-parser',1)`,
    [SUCCESSOR, manifest]);
  await ds.query(`UPDATE regulatory_releases SET status='superseded', "deactivatedAt"=now() WHERE status='active'`);
  await ds.query(`UPDATE regulatory_releases SET status='active', "activatedAt"=now() WHERE "releaseId"=$1`, [SUCCESSOR]);
  console.log(`  active release is now ${SUCCESSOR}`);

  // Reopen and re-analyse the SAME inspection.
  const beforeReopenView = await call('GET', `/inspections/${inspectionId}`, undefined, token, 200);
  // `completed -> draft` is the reopen the lifecycle allows; `in_review` is not reachable from
  // `completed`. Reopening is what a customer does when a finished inspection needs more work, and
  // it is the exact moment a newly activated release could silently re-govern the whole record.
  const reopen = await call('POST', `/inspections/${inspectionId}/transition`,
    { status: 'draft', version: Number(beforeReopenView.body.version) }, token);
  check(reopen.status === 200 || reopen.status === 201, 'inspection REOPENS',
    `status=${reopen.status} ${JSON.stringify(reopen.body).slice(0, 200)}`);

  const reopenedObservation = await call('POST', `/inspections/${inspectionId}/observations`,
    { rawText: OBSERVATIONS[0].text, evidenceSource: 'direct_observation' }, token, 201);
  const reclassify = await call('POST', '/safescope-v2/classify',
    { text: OBSERVATIONS[0].text, inspectionId }, token, 201);
  await call('POST', `/inspections/observations/${String(reopenedObservation.body.id)}/analyses`, {
    engineVersion: 'release-scoped-acceptance',
    idempotencyKey: `${suffix}-reanalysis`, requestVersion: 1, resultSnapshot: reclassify.body,
  }, token, 201);

  const bindingAfterTransition = await ds.query(
    `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId]);
  check(bindingAfterTransition?.[0]?.knowledgeReleaseId === CANDIDATE,
    'the reopened inspection PRESERVES its original release after a new one became active',
    String(bindingAfterTransition?.[0]?.knowledgeReleaseId));

  const reanalysed = await ds.query(
    `SELECT a."knowledgeReleaseId" FROM hazlenz_analyses a
       JOIN observations o ON o.id = a."observationId"
      WHERE o.id = $1`, [String(reopenedObservation.body.id)]);
  check(!reanalysed?.[0]?.knowledgeReleaseId || reanalysed[0].knowledgeReleaseId === CANDIDATE,
    're-analysis records the ORIGINAL release, never the newly active one',
    String(reanalysed?.[0]?.knowledgeReleaseId));

  const afterFindings = await ds.query(
    `SELECT id, "knowledgeReleaseId", "sourceCandidate" FROM inspection_findings
      WHERE "inspectionId" = $1 AND id = ANY($2::uuid[]) ORDER BY "createdAt"`,
    [inspectionId, persistedFindings.map((f: Json) => f.id)]);
  const afterReopen = JSON.stringify(afterFindings.map((f: Json) =>
    [f.knowledgeReleaseId, (f.sourceCandidate?.standardCandidates || [])
      .map((c: Json) => [c.citation, c.authorityState, c.governedReleaseId, c.governedRecordChecksum])]));
  check(beforeReopen === afterReopen,
    'no already-persisted finding was rewritten when a different release became active');

  // A BRAND NEW inspection under the new pointer binds to the NEW release -- proving the pointer
  // still works and the preservation above is not simply a dead code path.
  const freshInspection = await call('POST', '/inspections', {
    siteId: site.body.id, title: `Successor ${suffix}`, regulatoryContext: 'osha-general-industry',
  }, token, 201);
  const freshId = String(freshInspection.body.id);
  const freshObservation = await call('POST', `/inspections/${freshId}/observations`,
    { rawText: OBSERVATIONS[0].text, evidenceSource: 'direct_observation' }, token, 201);
  void freshObservation;
  await call('POST', '/safescope-v2/classify',
    { text: OBSERVATIONS[0].text, inspectionId: freshId }, token, 201);
  const freshBinding = await ds.query(
    `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [freshId]);
  check(freshBinding?.[0]?.knowledgeReleaseId === SUCCESSOR,
    'positive control: a NEW inspection binds to the NEWLY ACTIVE release',
    String(freshBinding?.[0]?.knowledgeReleaseId));

  // Restore the reviewed candidate as the active release for anything that runs after this.
  await ds.query(`UPDATE regulatory_releases SET status='superseded' WHERE status='active'`);
  await ds.query(`UPDATE regulatory_releases SET status='active' WHERE "releaseId"=$1`, [CANDIDATE]);

  evidence.userId = userId;
  evidence.inspectionId = inspectionId;
  evidence.inspectionBinding = CANDIDATE;
  evidence.persistedFindings = findings.length;
  evidence.persistedStandardCandidates = candidates.length;
  evidence.authorityStates = distribution;
  evidence.analysisReleaseIds = [...new Set(analyses.map((a: Json) => a.knowledgeReleaseId))];
  evidence.corpusBacked = candidates.filter(c => c.corpusBacked === true).length;
  evidence.reviewerPresent = candidates.filter(c => c.reviewerId).length;
  evidence.checksumPresent = candidates.filter(c => c.governedRecordChecksum).length;
  evidence.candidates = candidates;
  evidence.reportId = reportId;
  evidence.reportClaimScan = { length: reportText.length };
  evidence.reopenPreservedRelease = bindingAfterTransition?.[0]?.knowledgeReleaseId ?? null;
  evidence.successorBindingForNewInspection = freshBinding?.[0]?.knowledgeReleaseId ?? null;

  await ds.destroy();
  if (process.env.WORKFLOW_EVIDENCE_OUT) {
    writeFileSync(process.env.WORKFLOW_EVIDENCE_OUT,
      JSON.stringify({ checks, failures, evidence }, null, 2));
  }
  console.log('');
  console.log(`RELEASE-SCOPED CUSTOMER WORKFLOW: ${checks - failures.length}/${checks} checks passed`);
  if (failures.length) {
    console.error('\nFAILURES:');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
}

void execFileSync;

/**
 * This suite MUTATES its target -- it drives the real customer workflow over HTTP and additionally
 * writes a synthetic successor release directly, so it must claim its database before the first
 * write, exactly as every other mutating suite in this directory does. `test:kg4d-default-off`
 * enumerates this directory and fails if a mutating script is unguarded; it caught this file the
 * first time it ran, which is the mechanism working.
 *
 * The server under test must be pointed at the SAME database, and this claim is what makes it
 * impossible to point either of them at a real corpus.
 */
async function main() {
  await runOwnedMutatingSuite({
    suite: 'verify:release-scoped-customer-workflow',
    body: async () => { await run(); },
  });
}

main().catch(error => { console.error(error); process.exit(1); });
