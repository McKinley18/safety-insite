/**
 * KG-4A (Phases 7, 8, 15, 18) -- the governed path end to end, through the real HTTP product.
 *
 * WHY THIS EXISTS ALONGSIDE THE UNIT SUITES. Everything else in KG-4A tests a contract in
 * isolation. This drives the actual product -- register, inspect, observe, analyse, finalize,
 * report -- against a server running in `GOVERNED_WITH_FALLBACK` with ONE account allowlisted, and
 * asserts what a customer would actually receive. It is the only place that proves the whole chain
 * holds together: seam, fallback, display projection, persistence gate, finding-level provenance,
 * report provenance, and tenancy.
 *
 * REQUIRES a server started with:
 *   GOVERNED_CUTOVER_MODE=GOVERNED_WITH_FALLBACK
 *   GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<userId of ALLOWED_EMAIL>
 * and a database whose active release carries reviewer approvals.
 *
 * Usage:
 *   API_BASE_URL=http://127.0.0.1:4331 DATABASE_URL=…test_… \
 *   ALLOWED_EMAIL=… OTHER_EMAIL=… PASSWORD=… npx ts-node scripts/test-kg4a-governed-e2e.ts
 */
const API = process.env.API_BASE_URL || 'http://127.0.0.1:4331';
const PASSWORD = process.env.PASSWORD || 'KG4aTestPass!234';
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || 'kg4a-a@example.com';
const OTHER_EMAIL = process.env.OTHER_EMAIL || 'kg4a-b@example.com';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

async function call(token: string | null, method: string, path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 400) }; }
  return { status: response.status, body: json };
}

/**
 * Findings are returned at the INSPECTION level, not nested under observations. Both shapes are
 * gathered and merged by id, because `??` does not fall through an EMPTY array -- a mistake that
 * silently reported "0 findings" against an inspection that had two.
 */
function collectFindings(detail: any): any[] {
  const nested = (detail?.observations || []).flatMap((o: any) => o?.findings || []);
  const top = Array.isArray(detail?.findings) ? detail.findings : [];
  const byId = new Map<string, any>();
  for (const finding of [...top, ...nested]) if (finding?.id) byId.set(finding.id, finding);
  return [...byId.values()];
}

const OBSERVATION =
  'Haul truck at the quarry was backing toward the stockpile. The operator has an obstructed view ' +
  'to the rear, the backup alarm did not sound, and no spotter or observer was posted.';

/**
 * Login with backoff. `/auth/login` is throttled at 5 requests / 60s per IP, and this suite is
 * re-runnable, so a bare login can legitimately return 429 on a second run within the window. That
 * is infrastructure behaviour, not a KG-4A result -- it is waited out rather than reported as a
 * failure, and the throttle is deliberately NOT weakened to make the suite convenient.
 */
async function login(email: string): Promise<string | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await call(null, 'POST', '/auth/login', { email, password: PASSWORD });
    const token = response.body?.accessToken || response.body?.token;
    if (token) return token;
    if (response.status !== 429) {
      console.log(`note  login for ${email} returned ${response.status}`);
      return null;
    }
    await new Promise(resolve => setTimeout(resolve, 13_000));
  }
  return null;
}

async function main() {
  const tokenA = await login(ALLOWED_EMAIL);
  const tokenB = await login(OTHER_EMAIL);
  assert(Boolean(tokenA) && Boolean(tokenB), 'both test accounts authenticate');
  if (!tokenA || !tokenB) {
    console.log('\nCannot continue without both accounts.');
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(1);
  }

  // ---------------------------------------------------------------- classify
  section('Phase 3/4 — what the allowlisted customer actually receives');
  const classify = await call(tokenA, 'POST', '/safescope-v2/classify', { text: OBSERVATION, scopes: ['msha'] });
  assert(classify.status === 201 || classify.status === 200, `classify succeeded (${classify.status})`);
  const decisions: any[] = classify.body?.standardDecisions || [];
  assert(decisions.length > 0, `the analysis produced ${decisions.length} standard decisions`);

  const byCitation = new Map(decisions.map((d: any) => [String(d.citation), d]));
  const governedOnes = decisions.filter(d => d.governedDeliveryState === 'GOVERNED_VERIFIED_TEXT');
  const fellBack = decisions.filter(d => d.governedDeliveryState === 'LEGACY_TEXT_UNVERIFIED');

  assert(decisions.length > 0 && decisions.every(d => d.governedDeliveryState),
    'HARD: every decision carries a governed delivery state — the seam ran for all of them');
  assert(governedOnes.length > 0 && fellBack.length > 0,
    `HARD: this is a genuinely MIXED analysis (${governedOnes.length} governed, ${fellBack.length} fell back)`);
  assert(governedOnes.length > 0 && governedOnes.every(d => d.backingStatus === 'APPROVED_GOVERNED_CONTENT'),
    'every governed decision reports APPROVED_GOVERNED_CONTENT');
  assert(fellBack.length > 0 && fellBack.every(d => d.backingStatus !== 'APPROVED_GOVERNED_CONTENT'),
    'HARD: no fallen-back decision claims approved governed content');
  assert(governedOnes.length > 0 && governedOnes.every(d => d.knowledgeReleaseId),
    'every governed decision names the release that supplied it');
  assert(fellBack.length > 0 && fellBack.every(d => d.knowledgeReleaseId === null || d.knowledgeReleaseId === undefined),
    'HARD: no fallen-back decision names a release');
  assert(new Set(governedOnes.map(d => d.knowledgeReleaseId)).size === 1,
    'HARD: one analysis, one release — every governed decision names the SAME pinned release');

  // The no-promotion rule, on a real request.
  const paragraph = byCitation.get('30 CFR 56.14132(a)');
  if (paragraph) {
    assert(paragraph.governedFallbackReason === 'GOVERNED_SECTION_ONLY_NOT_PARAGRAPH',
      'HARD: 56.14132(a) resolves SECTION_ONLY — the approved section did not back the paragraph');
    assert(paragraph.backingStatus !== 'APPROVED_GOVERNED_CONTENT',
      'HARD: a section-only match earns no approved badge for the paragraph');
    assert(!paragraph.knowledgeReleaseId,
      'HARD: a section-only match records no governed provenance');
  }
  // The KG-4A Phase 5 record, working.
  const bOne = byCitation.get('30 CFR 56.14132(b)(1)');
  if (bOne) {
    assert(bOne.backingStatus === 'APPROVED_GOVERNED_CONTENT',
      'the KG-4A-sourced 56.14132(b)(1) record backs the paragraph HazLenz established');
  }

  // ---------------------------------------------------------------- tenancy
  section('Phase 18 — enablement does not leak between accounts');
  const classifyB = await call(tokenB, 'POST', '/safescope-v2/classify', { text: OBSERVATION, scopes: ['msha'] });
  const decisionsB: any[] = classifyB.body?.standardDecisions || [];
  assert(decisionsB.length > 0, `the non-allowlisted account also gets a full analysis (${decisionsB.length} decisions)`);
  assert(decisionsB.length > 0 && decisionsB.every(d => d.governedDeliveryState === undefined),
    'HARD: the non-allowlisted account receives NO governed keys at all — same server, same release');
  assert(decisionsB.length > 0 && decisionsB.every(d => d.backingStatus !== 'APPROVED_GOVERNED_CONTENT'),
    'HARD: the non-allowlisted account sees nothing as approved governed content');
  assert(decisionsB.length > 0 && decisionsB.map(d => d.citation).sort().join('|') === decisions.map(d => d.citation).sort().join('|'),
    'HARD: both accounts receive the SAME CITATIONS — governance changed the claim, not the reasoning');

  // ---------------------------------------------------------------- persistence
  section('Phase 7/8 — persisted provenance is truthful and mixed');
  // Unique per run: this suite is re-runnable against the same disposable database, and a site
  // name collision (409) would otherwise cascade into every assertion below it.
  const runId = Date.now().toString(36);
  const site = await call(tokenA, 'POST', '/sites', { name: `KG-4A Quarry ${runId}` });
  assert(site.status === 201 || site.status === 200, `site created (${site.status})`);
  const siteId = site.body?.id;
  const inspection = await call(tokenA, 'POST', '/inspections', {
    siteId, title: `KG-4A governed cutover verification ${runId}`, regulatoryContext: 'msha',
  });
  const inspectionId = inspection.body?.id;
  assert(Boolean(inspectionId), `inspection created (${inspection.status})`);
  const observation = await call(tokenA, 'POST', `/inspections/${inspectionId}/observations`, { rawText: OBSERVATION });
  const observationId = observation.body?.id;
  assert(Boolean(observationId), `observation created (${observation.status})`);

  const analysis = await call(tokenA, 'POST', `/inspections/observations/${observationId}/analyses`, {
    engineVersion: 'kg4a-verification', idempotencyKey: `kg4a-${Date.now()}`,
    requestVersion: 1, resultSnapshot: classify.body,
  });
  assert(analysis.status === 201 || analysis.status === 200, `analysis persisted (${analysis.status})`);
  const expectedRelease = governedOnes[0]?.knowledgeReleaseId;
  assert(analysis.body?.knowledgeReleaseId === expectedRelease,
    `HARD: the persisted analysis names the release governed content actually came from ` +
    `(${analysis.body?.knowledgeReleaseId} === ${expectedRelease})`);

  // The spoofing attempt, through the real HTTP API.
  const spoof = await call(tokenB, 'POST', `/inspections/observations/${observationId}/analyses`, {
    engineVersion: 'kg4a-spoof', idempotencyKey: `kg4a-spoof-${Date.now()}`,
    requestVersion: 2,
    resultSnapshot: { standardDecisions: [{ citation: 'x', knowledgeReleaseId: 'attacker-release' }] },
  });
  assert(spoof.status === 403 || spoof.status === 404 || spoof.body?.knowledgeReleaseId !== 'attacker-release',
    `HARD: a client-supplied release id is never persisted verbatim (status ${spoof.status}, ` +
    `stored ${spoof.body?.knowledgeReleaseId ?? 'n/a'})`);

  // ---------------------------------------------------------------- report
  section('Phase 15 — the report reports provenance truthfully');
  // A report may only be generated from a COMPLETED inspection, so the lifecycle is driven for
  // real: every finding is reviewed and finalized, the inspection is transitioned, and only then
  // is the report generated. Anything less would verify the report contract against a state no
  // customer report is ever produced from.
  const detail = await call(tokenA, 'GET', `/inspections/${inspectionId}`, undefined);
  const findingsToReview: any[] = collectFindings(detail.body);
  assert(findingsToReview.length > 0, `inspection carries ${findingsToReview.length} finding(s) to finalize`);
  // A review alone does not finalize: `finalizeFinding` is the step that attaches `finalReviewId`,
  // and completion requires it on every current finding.
  for (const finding of findingsToReview) {
    const review = await call(tokenA, 'POST', `/inspections/observations/${observationId}/reviews`, {
      findingId: finding.id, decision: 'accepted',
      rationale: 'KG-4A verification: accepted so the report contract can be exercised end to end.',
    });
    const reviewId = review.body?.id;
    assert(Boolean(reviewId), `review recorded for finding ${finding.id} (${review.status})`);
    const finalized = await call(tokenA, 'POST', `/inspections/observations/${observationId}/findings`, {
      reviewId,
      // `finalizeFinding` matches the review to the finding by hazardKey, so the finding's own key
      // must be supplied or it refuses with "This review belongs to a different finding".
      segmentKey: finding.hazardKey || finding.segmentKey,
      conclusion: 'Reversing mobile equipment with an obstructed rear view and no compliant warning method.',
    });
    assert(finalized.status === 200 || finalized.status === 201,
      `finding finalized (${finalized.status} ${JSON.stringify(finalized.body).slice(0, 100)})`);
  }
  let version = detail.body?.version ?? 1;
  const toReview = await call(tokenA, 'POST', `/inspections/${inspectionId}/transition`, { status: 'in_review', version });
  version = toReview.body?.version ?? version + 1;
  const toCompleted = await call(tokenA, 'POST', `/inspections/${inspectionId}/transition`, { status: 'completed', version });
  assert(toCompleted.status === 200 || toCompleted.status === 201,
    `inspection transitioned to completed (${toCompleted.status} ${JSON.stringify(toCompleted.body).slice(0, 120)})`);

  const report = await call(tokenA, 'POST', `/inspections/${inspectionId}/reports`, {});
  assert(report.status === 201 || report.status === 200,
    `report generated from the completed inspection (${report.status})`);
  const reportId = report.body?.id ?? report.body?.reportId;
  const fetched = reportId ? await call(tokenA, 'GET', `/inspection-reports/${reportId}`, undefined) : { body: null };
  const findProvenance = (node: any, depth = 0): any => {
    if (!node || typeof node !== 'object' || depth > 6) return null;
    if (node.knowledgeProvenance) return node.knowledgeProvenance;
    for (const value of Object.values(node)) {
      const found = findProvenance(value, depth + 1);
      if (found) return found;
    }
    return null;
  };
  // `knowledgeProvenance` lives in the report's persisted SOURCE SNAPSHOT -- that is where KG-1 put
  // it and where report rendering consumes it from. The HTTP response does not surface it, and this
  // suite does not invent an API field to make an assertion convenient: it reads the row.
  let snapshotProvenance: any = null;
  if (process.env.DATABASE_URL) {
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const rows = await client.query(
      `SELECT "sourceSnapshot"->'knowledgeProvenance' AS p FROM inspection_report_versions
        ORDER BY "createdAt" DESC LIMIT 1`);
    snapshotProvenance = rows.rows?.[0]?.p ?? null;
    await client.end();
  }
  const provenance = findProvenance(report.body) ?? findProvenance(fetched.body) ?? snapshotProvenance;
  if (provenance) {
    assert(Array.isArray(provenance.knowledgeReleaseIds),
      'the report carries a knowledge-provenance block');
    assert(provenance.knowledgeReleaseIds.length <= 1,
      `HARD: the report names at most one release (${JSON.stringify(provenance.knowledgeReleaseIds)}) — pinning held`);
    assert(typeof provenance.findingsWithoutKnowledgeRelease === 'number',
      `HARD: the report states how many findings were NOT governed ` +
      `(${provenance.findingsWithoutKnowledgeRelease} of ${provenance.findingCount}) rather than ` +
      'labelling the whole report governed');
    assert(provenance.knowledgeReleaseIds.length === 0 || provenance.findingsWithoutKnowledgeRelease + provenance.knowledgeReleaseIds.length <= provenance.findingCount + 1,
      'the report\'s governed and ungoverned finding counts are internally consistent');
    console.log(`      report provenance: ${JSON.stringify(provenance)}`);
  } else {
    failed++;
    console.log('FAIL  the generated report carries no knowledgeProvenance block in its source snapshot');
  }

  // Finding-level provenance, read back from what was actually persisted.
  const persisted = await call(tokenA, 'GET', `/inspections/${inspectionId}`, undefined);
  const persistedFindings: any[] = collectFindings(persisted.body);
  if (persistedFindings.length) {
    const ids = persistedFindings.map((f: any) => f.knowledgeReleaseId);
    assert(ids.every((id: any) => id === null || id === expectedRelease),
      `HARD: every persisted finding names either the analysis's release or nothing (${JSON.stringify(ids)}) — ` +
      'never a third release');
  }

  const otherReport = await call(tokenB, 'GET', `/inspection-reports`, undefined);
  const visibleToB: any[] = Array.isArray(otherReport.body) ? otherReport.body : (otherReport.body?.items || []);
  assert(!visibleToB.some((r: any) => r?.inspectionId === inspectionId),
    "HARD: the other account cannot see this account's report through the release-bearing report list");

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
