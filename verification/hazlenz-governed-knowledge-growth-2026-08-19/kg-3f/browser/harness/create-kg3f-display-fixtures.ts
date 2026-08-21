/**
 * KG-3F Phase 15 browser-verification fixtures (VERIFICATION ONLY — not production code).
 *
 * Drives the REAL product pathway (register -> site -> inspection -> observation ->
 * /safescope-v2/classify -> persisted analysis -> decomposed findings) so that the five states
 * Phase 15 must show are produced by the actual engine rather than hand-written into a payload.
 *
 * WHAT PHASE 15 IS ACTUALLY TESTING, AND WHY IT NEEDS FIVE STATES RATHER THAN THREE.
 *
 * KG-3C verified the CONTENT GOVERNANCE axis alone (approved / unapproved / citation-only), because
 * with 0 of 26 records approved the other axis was unreachable. KG-3D approved real records and
 * fixed the wording that conflated the two axes. KG-3F is the first slice where both axes are
 * populated AND where a predicate deliberately returns UNKNOWN (the corrected 56.14132), so the
 * conflation is finally FALSIFIABLE rather than merely absent.
 *
 * The two axes are independent and must render independently:
 *
 *   CONTENT GOVERNANCE      -- has a reviewer attested to this regulatory TEXT?
 *   APPLICABILITY CONFIDENCE-- how sure is HazLenz that this standard governs THIS finding?
 *
 * The dangerous cell is (approved content x uncertain applicability): a "Verified standard text"
 * badge sitting beside an unestablished applicability trigger, where a reader could take the badge
 * as confirmation that the rule applies. That is scenario 2, and it is why this fixture exists.
 *
 * APPROVES NOTHING SPECULATIVELY. Approvals below go through the real KG-3B checksum-bound
 * mechanism against a DISPOSABLE database, and are fixtures for a display test — they are not
 * substantive regulatory reviews and confer nothing on the real corpus.
 */
import 'dotenv/config';
import { dataSource } from '../../../../../backend/src/database/data-source';
import { ReleaseRecordReviewService } from '../../../../../backend/src/standards/releases/release-record-review.service';
import { resolveGovernedCitation } from '../../../../../backend/src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from '../../../../../backend/src/standards/display/standards-backing-contract';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4320';
const databaseUrl = process.env.DATABASE_URL || '';
const RELEASE_ID = process.env.FIXTURE_RELEASE_ID || 'federal-core-2026-07-30.1';

const db = (() => {
  const name = new URL(databaseUrl).pathname.replace('/', '');
  if (name === 'safescope' || !/^test_/.test(name)) throw new Error(`REFUSE: target database ${name}`);
  console.log(`RESOLVED TARGET database=${name}`);
  return name;
})();

async function api(path: string, options: any = {}, expected = 200) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (res.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return body;
}

/**
 * Observations chosen so the ENGINE lands each one in a different cell of the two-axis matrix.
 * The scenario labels state the intent; the harness reports what actually happened, and the
 * browser pass asserts against the measured state rather than against the intent.
 */
const OBSERVATIONS = [
  {
    key: 's1-approved-high-confidence',
    scenario: '1. approved content + high applicability confidence',
    scopes: ['osha_construction'],
    text: 'Employee working at 12 feet on an unprotected leading edge with no guardrail, no safety '
      + 'net and no personal fall arrest system in use.',
  },
  {
    key: 's2-approved-uncertain-applicability',
    scenario: '2. approved content + low/uncertain applicability confidence',
    scopes: ['osha_construction'],
    // Scaffold work platform: the fall-protection family is clear, but the facts that decide WHICH
    // fall rule governs (platform height, whether a guardrail system was present) are unstated, so
    // required predicates stay UNKNOWN while the underlying corpus text is approved.
    text: 'A worker was observed on a scaffold work platform near the open side of the deck.',
  },
  {
    key: 's3-unapproved-strong-evidence',
    scenario: '3. unapproved content + strong applicability evidence',
    scopes: ['osha_construction'],
    text: 'The designated exit route from the work area was blocked by stacked pallets and stored '
      + 'drums, and the exit door itself was obstructed.',
  },
  {
    key: 's4-citation-only',
    scenario: '4. citation-only / missing exact approved content',
    scopes: ['osha_construction'],
    text: 'Workers were in a seven foot deep excavation with vertical unsupported walls, no shoring, '
      + 'no sloping and no trench box in place.',
  },
  {
    key: 's5-56-14132-corrected',
    scenario: '5. corrected 56.14132 behavior (backing, rear visibility UNSTATED)',
    scopes: ['msha'],
    // Deliberately silent on rear visibility. Under the KG-3F correction this must NOT produce a
    // confirmed (b)(1) violation; it must surface the truthful section-level citation with the
    // obstructed-view predicate UNKNOWN.
    text: 'A haul truck at the surface mine was backing near the stockpile area and no backup alarm '
      + 'was audible.',
  },
];

/** Citations approved for this fixture, so scenarios 1, 2 and 5 have approved CONTENT. */
const APPROVE = [
  '29 CFR 1926.501',
  '29 CFR 1926.451(g)(1)',
  '30 CFR 56.14132',
];

async function main() {
  await dataSource.initialize();

  const suffix = Date.now();
  const password = 'KG3fBrowser!Pass123';
  const email = `kg3f-browser-${suffix}@example.test`;

  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'KG-3F Browser Verification', type: 'individual' }),
  }, 201);
  const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const H = { authorization: `Bearer ${auth.token}` };
  const userId = auth.user.id;

  await dataSource.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '1 day',$1,'KG-3F browser verification fixture')`,
    [userId],
  );

  const site = await api('/sites', {
    method: 'POST', headers: H, body: JSON.stringify({ name: `KG-3F Verification Site ${suffix}` }),
  }, 201);
  const inspection = await api('/inspections', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      siteId: site.id, title: 'KG-3F standards display verification',
      regulatoryContext: 'osha-construction',
    }),
  }, 201);

  const emitted: any[] = [];
  for (const [i, spec] of OBSERVATIONS.entries()) {
    const observation = await api(`/inspections/${inspection.id}/observations`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ rawText: spec.text, evidenceSource: 'direct_observation' }),
    }, 201);

    const analysis = await api('/safescope-v2/classify', {
      method: 'POST', headers: H,
      body: JSON.stringify({ text: spec.text, scopes: spec.scopes, inspectionId: inspection.id }),
    }, 201);

    await api(`/inspections/observations/${observation.id}/analyses`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        engineVersion: 'hazlenz-production',
        idempotencyKey: `kg3f-browser-${suffix}-${i}`,
        requestVersion: 1,
        resultSnapshot: analysis,
      }),
    }, 201);

    const hazards = (analysis?.multiHazardDecomposition?.hazards || []) as any[];
    const citations = hazards
      .flatMap(h => (h?.standardCandidates || []).map((c: any) => c?.citation)).filter(Boolean);
    // The applicability axis, straight from the engine's own adjudication.
    const decisions = (analysis?.applicabilityDecisions || []) as any[];
    const uncertain = decisions.filter(d =>
      String(d.status) === 'UNKNOWN'
      || (d.requiredPredicates || []).some((p: any) => String(p.status) === 'UNKNOWN'));

    emitted.push({
      key: spec.key, scenario: spec.scenario, observationId: observation.id,
      citations,
      applicabilityDecisions: decisions.map(d => ({
        citation: d.citation, status: d.status,
        unknownPredicates: (d.requiredPredicates || [])
          .filter((p: any) => String(p.status) === 'UNKNOWN').map((p: any) => p.name),
      })),
      hasUncertainApplicability: uncertain.length > 0,
    });
    console.log(`[${spec.key}] -> ${citations.join(', ') || '(none)'}`
      + `  uncertainApplicability=${uncertain.length > 0}`);
  }

  // ---- real KG-3B checksum-bound approvals ---------------------------------------------------
  const review = new ReleaseRecordReviewService(dataSource);
  const approvals: any[] = [];
  for (const citation of APPROVE) {
    const status: any = await review.describeRecordReview(RELEASE_ID, citation);
    if (!status) { console.log(`  (no release record for ${citation} — skipped)`); continue; }
    const decision = await review.approveRecord({
      releaseId: RELEASE_ID, citation,
      expectedChecksum: status.recordChecksum,
      reviewerId: 'kg3f-verification-reviewer',
      reviewerRole: 'safety-standards-reviewer',
      note: 'KG-3F Phase 15 browser display verification fixture — controlled approval, not a '
        + 'substantive regulatory review.',
    });
    approvals.push({ citation, outcome: decision.outcome, state: decision.effectiveReviewState });
    console.log(`  approved ${citation}: ${decision.outcome}`);
  }

  // ---- recompute backing with the REAL contract, then persist ---------------------------------
  const findings = await dataSource.query(
    `SELECT f.id, f."hazardKey", f."sourceCandidate"
       FROM inspection_findings f
      WHERE f."inspectionId" = $1 AND f.status <> 'superseded'
      ORDER BY f."createdAt"`,
    [inspection.id],
  );

  for (const f of findings) {
    const candidates = f.sourceCandidate?.standardCandidates;
    if (!Array.isArray(candidates)) continue;
    let touched = false;
    for (const c of candidates) {
      if (!c?.citation) continue;
      const governed = await resolveGovernedCitation(dataSource, RELEASE_ID, c.citation);
      if (governed.effectiveReviewState !== 'reviewer_approved') continue;
      const backing = resolveStandardsBacking({
        citation: c.citation,
        sourceKey: governed.sourceKey, title: governed.title,
        standardText: governed.standardText,
        plainLanguageSummary: governed.plainLanguageSummary,
        governed: {
          releaseId: governed.releaseId,
          effectiveReviewState: governed.effectiveReviewState,
          placeholderSource: governed.placeholderSource,
          hasContent: Boolean(governed.standardText || governed.plainLanguageSummary),
        },
      });
      c.backingStatus = backing.backingStatus;
      c.corpusBacked = backing.corpusBacked;
      c.contentDisclosure = backing.contentDisclosure;
      if (!c.plainLanguageSummary && governed.plainLanguageSummary) {
        c.plainLanguageSummary = governed.plainLanguageSummary;
      }
      if (!c.title && governed.title) c.title = governed.title;
      touched = true;
    }
    if (touched) {
      await dataSource.query(
        `UPDATE inspection_findings SET "sourceCandidate" = $2 WHERE id = $1`, [f.id, f.sourceCandidate]);
    }
  }

  const after = await dataSource.query(
    `SELECT f.id, f."hazardKey", f."sourceCandidate"->'standardCandidates' AS candidates
       FROM inspection_findings f WHERE f."inspectionId" = $1 AND f.status <> 'superseded'
       ORDER BY f."createdAt"`,
    [inspection.id],
  );
  console.log('\nTWO-AXIS MATRIX ACTUALLY PRODUCED:');
  const matrix: any[] = [];
  for (const row of after) {
    for (const c of (row.candidates || [])) {
      matrix.push({
        hazardKey: row.hazardKey, findingId: row.id,
        citation: c.citation, backingStatus: c.backingStatus || 'UNAPPROVED_CONTENT',
        applicability: c.applicability ?? null,
      });
      console.log(`  ${String(row.hazardKey).padEnd(28)} ${String(c.citation).padEnd(26)} `
        + `${c.backingStatus || 'UNAPPROVED_CONTENT'}`);
    }
  }

  console.log('\n' + JSON.stringify({
    email, password, inspectionId: inspection.id, siteId: site.id,
    releaseId: RELEASE_ID, database: db,
    approvals, emitted, matrix,
  }, null, 2));

  await dataSource.destroy();
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
