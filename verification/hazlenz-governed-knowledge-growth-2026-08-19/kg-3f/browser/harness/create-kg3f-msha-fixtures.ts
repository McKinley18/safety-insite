/**
 * KG-3F Phase 15 — the MSHA half of the display fixtures (VERIFICATION ONLY).
 *
 * WHY A SECOND INSPECTION. The first fixture's inspection carries
 * `regulatoryContext: 'osha-construction'`, and finding decomposition honors that context, so an
 * MSHA observation posted into it decomposes without MSHA standard candidates. That is correct
 * product behavior, not a defect — a construction inspection should not start citing 30 CFR — so
 * the MSHA scenarios need an inspection whose declared context is `msha`.
 *
 * THE TWO SCENARIOS HERE ARE THE TWO HALVES OF THE KG-3F 56.14132 CORRECTION, and together they
 * produce the CITATION_ONLY state honestly rather than by emptying a corpus record:
 *
 *   S4 (CITATION_ONLY) -- rear visibility IS established and no compliant alternative is present,
 *      so HazLenz earns the exact paragraph `30 CFR 56.14132(b)(1)`. The corpus holds the SECTION
 *      `30 CFR 56.14132`, not that paragraph. Under the KG-3E/3F structured citation comparison a
 *      paragraph does not match its parent section, so no governed record backs the citation and
 *      the display contract must fall to CITATION_ONLY. This is the state arising from real
 *      regulatory precision, which is exactly why it must render honestly: the citation is right,
 *      and the corpus simply does not yet hold that paragraph.
 *
 *   S5 (corrected behavior) -- rear visibility is UNSTATED. The predicate must NOT assert a
 *      violation of (b)(1); it emits the truthful section-level `30 CFR 56.14132`, which IS in the
 *      corpus and IS approved. This is the cell where approved content coexists with an
 *      unestablished applicability trigger, and where "Verified standard text" must not be read as
 *      "this rule applies".
 *
 * Approves nothing beyond the disposable fixture database.
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

const OBSERVATIONS = [
  {
    key: 's4-citation-only-paragraph',
    scenario: '4. citation-only — exact paragraph earned, corpus holds only the section',
    text: 'A haul truck at the surface mine was backing with an obstructed view to the rear, with no '
      + 'functional backup alarm and no observer or spotter positioned to signal when it was safe '
      + 'to reverse.',
  },
  {
    key: 's5-56-14132-corrected',
    scenario: '5. corrected 56.14132 — rear visibility UNSTATED, no violation asserted',
    text: 'A haul truck at the surface mine was backing near the stockpile area and no backup alarm '
      + 'was audible.',
  },
];

async function main() {
  await dataSource.initialize();

  const suffix = Date.now();
  const password = 'KG3fBrowser!Pass123';
  const email = `kg3f-msha-${suffix}@example.test`;

  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'KG-3F MSHA Verification', type: 'individual' }),
  }, 201);
  const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const H = { authorization: `Bearer ${auth.token}` };

  await dataSource.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '1 day',$1,'KG-3F MSHA browser fixture')`,
    [auth.user.id],
  );

  const site = await api('/sites', {
    method: 'POST', headers: H, body: JSON.stringify({ name: `KG-3F MSHA Site ${suffix}` }),
  }, 201);
  const inspection = await api('/inspections', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      siteId: site.id, title: 'KG-3F MSHA standards display verification',
      regulatoryContext: 'msha',
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
      body: JSON.stringify({ text: spec.text, scopes: ['msha'], inspectionId: inspection.id }),
    }, 201);

    await api(`/inspections/observations/${observation.id}/analyses`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        engineVersion: 'hazlenz-production',
        idempotencyKey: `kg3f-msha-${suffix}-${i}`,
        requestVersion: 1, resultSnapshot: analysis,
      }),
    }, 201);

    const hazards = (analysis?.multiHazardDecomposition?.hazards || []) as any[];
    const citations = hazards
      .flatMap(h => (h?.standardCandidates || []).map((c: any) => c?.citation)).filter(Boolean);
    const decisions = (analysis?.applicabilityDecisions || []) as any[];
    emitted.push({
      key: spec.key, scenario: spec.scenario, observationId: observation.id, citations,
      applicabilityDecisions: decisions.map(d => ({
        citation: d.citation, status: d.status,
        unknownPredicates: (d.requiredPredicates || [])
          .filter((p: any) => String(p.status) === 'UNKNOWN').map((p: any) => p.name),
      })),
    });
    console.log(`[${spec.key}] -> ${citations.join(', ') || '(none)'}`);
    for (const d of decisions) {
      console.log(`    decision ${d.citation} = ${d.status}`
        + ((d.requiredPredicates || []).some((p: any) => String(p.status) === 'UNKNOWN')
          ? '  (has UNKNOWN predicate)' : ''));
    }
  }

  // The section record is approved so S5 lands in (approved content x uncertain applicability).
  const review = new ReleaseRecordReviewService(dataSource);
  const status: any = await review.describeRecordReview(RELEASE_ID, '30 CFR 56.14132');
  if (status) {
    const decision = await review.approveRecord({
      releaseId: RELEASE_ID, citation: '30 CFR 56.14132',
      expectedChecksum: status.recordChecksum,
      reviewerId: 'kg3f-verification-reviewer', reviewerRole: 'safety-standards-reviewer',
      note: 'KG-3F Phase 15 browser display verification fixture — controlled approval.',
    });
    console.log(`\napproved 30 CFR 56.14132: ${decision.outcome}`);
  }

  const findings = await dataSource.query(
    `SELECT f.id, f."hazardKey", f."sourceCandidate" FROM inspection_findings f
      WHERE f."inspectionId" = $1 AND f.status <> 'superseded' ORDER BY f."createdAt"`,
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
        citation: c.citation, sourceKey: governed.sourceKey, title: governed.title,
        standardText: governed.standardText, plainLanguageSummary: governed.plainLanguageSummary,
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
    `SELECT f."hazardKey", f."sourceCandidate"->'standardCandidates' AS candidates
       FROM inspection_findings f WHERE f."inspectionId" = $1 AND f.status <> 'superseded'
       ORDER BY f."createdAt"`, [inspection.id]);
  console.log('\nMSHA TWO-AXIS MATRIX:');
  for (const row of after) {
    for (const c of (row.candidates || [])) {
      console.log(`  ${String(row.hazardKey).padEnd(28)} ${String(c.citation).padEnd(26)} `
        + `${c.backingStatus || 'UNAPPROVED_CONTENT'}`);
    }
  }

  console.log('\n' + JSON.stringify({
    email, password, inspectionId: inspection.id, releaseId: RELEASE_ID, database: db, emitted,
  }, null, 2));

  await dataSource.destroy();
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
