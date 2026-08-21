/**
 * KG-3D browser-verification fixture (VERIFICATION ONLY — not production code).
 *
 * Drives the REAL product pathway (register -> site -> inspection -> observation ->
 * /safescope-v2/classify -> persisted analysis -> decomposed findings) so the approved state is
 * exercised through the actual API and the actual persisted candidate shape.
 *
 * The one material difference from the KG-3C harness this is derived from: that harness CREATED
 * its own approval and said so ("controlled approval, not a substantive regulatory review").
 * This one APPROVES NOTHING. The approvals it renders are the real KG-3D reviewer decisions
 * already recorded against the remediated release from authoritative eCFR evidence, and the
 * fixture refuses to run if they are absent. Manufacturing an approval here would defeat the
 * point of the slice.
 *
 * What is still stood in for is only the wiring between the governed resolution and the live
 * mark() — and that wiring IS the deliberately disabled cutover, so it cannot be exercised
 * without enabling it.
 */
import 'dotenv/config';
import { dataSource } from './src/database/data-source';
import { ReleaseRecordReviewService } from './src/standards/releases/release-record-review.service';
import { resolveGovernedCitation } from './src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from './src/standards/display/standards-backing-contract';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4310';
const databaseUrl = process.env.DATABASE_URL || '';
const RELEASE_ID = process.env.FIXTURE_RELEASE_ID || 'federal-core-2026-08-19.3';

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
    signal: AbortSignal.timeout(120000),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (res.status !== expected) throw new Error(`${options.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  return body;
}

// Observations chosen to elicit citations that sit in different corpus states.
const OBSERVATIONS = process.env.FIXTURE_EXPECT_UNAPPROVED === '1'
  ? [{
      label: 'construction fall protection (target: UNAPPROVED 1926.501)',
      text: 'Employee working at 12 feet on an unprotected leading edge with no guardrail or personal fall arrest system.',
    }]
  : [{
      label: 'general-industry egress (target: remediated + approved 1910.36)',
      text: 'The designated exit route from the plant mezzanine was blocked by stacked pallets and stored drums, and the exit door was obstructed and could not be opened.',
    }];

async function main() {
  await dataSource.initialize();

  const suffix = Date.now();
  const password = 'KG3dBrowser!Pass123';
  const email = `kg3d-browser-${suffix}@example.test`;

  await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: 'KG-3D Browser Verification', type: 'individual' }) }, 201);
  const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const H = { authorization: `Bearer ${auth.token}` };
  const userId = auth.user.id;

  // Entitlement: tier 'pro' (Expert retired by migration 1800000005900).
  await dataSource.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '1 day',$1,'KG-3D browser verification fixture')`,
    [userId],
  );

  const site = await api('/sites', { method: 'POST', headers: H, body: JSON.stringify({ name: `KG-3D Verification Site ${suffix}` }) }, 201);
  const inspection = await api('/inspections', {
    method: 'POST', headers: H,
    body: JSON.stringify({ siteId: site.id, title: 'KG-3D approved standard verification', regulatoryContext: 'osha-general-industry' }),
  }, 201);

  const emitted: Array<{ label: string; observationId: string; citations: string[] }> = [];

  for (const [i, spec] of OBSERVATIONS.entries()) {
    const observation = await api(`/inspections/${inspection.id}/observations`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ rawText: spec.text, evidenceSource: 'direct_observation' }),
    }, 201);

    const analysis = await api('/safescope-v2/classify', {
      method: 'POST', headers: H,
      body: JSON.stringify({ text: spec.text, scopes: ['all'], inspectionId: inspection.id }),
    }, 201);

    await api(`/inspections/observations/${observation.id}/analyses`, {
      method: 'POST', headers: H,
      body: JSON.stringify({
        engineVersion: 'hazlenz-production',
        idempotencyKey: `kg3d-browser-${suffix}-${i}`,
        requestVersion: 1,
        resultSnapshot: analysis,
      }),
    }, 201);

    const hazards = (analysis?.multiHazardDecomposition?.hazards || []) as any[];
    const citations = hazards.flatMap(h => (h?.standardCandidates || []).map((c: any) => c?.citation)).filter(Boolean);
    emitted.push({ label: spec.label, observationId: observation.id, citations });
    console.log(`observation ${i + 1} [${spec.label}] -> ${citations.join(', ') || '(none)'}`);
  }

  // ---- persisted findings and their backing, straight from the live path -------------------
  const findings = await dataSource.query(
    `SELECT f.id, f."hazardKey", f."sourceCandidate"
       FROM inspection_findings f
      WHERE f."inspectionId" = $1 AND f.status <> 'superseded'
      ORDER BY f."createdAt"`,
    [inspection.id],
  );

  const before = findings.map((f: any) => ({
    id: f.id,
    hazardKey: f.hazardKey,
    candidates: (f.sourceCandidate?.standardCandidates || []).map((c: any) => ({
      citation: c.citation, backingStatus: c.backingStatus, corpusBacked: c.corpusBacked,
      applicability: c.applicability, hasSummary: Boolean(c.plainLanguageSummary),
    })),
  }));
  console.log('\nLIVE-PATH BACKING (before any approval):');
  console.log(JSON.stringify(before, null, 2));

  // ---- REQUIRE the pre-existing real reviewer decision; never create one --------------------
  // FIXTURE_EXPECT_UNAPPROVED builds the CONTROL case instead: the same pathway with no approval
  // anywhere, used to prove that suppressing the content-backing caveat beside an approved
  // standard did not suppress it everywhere.
  if (process.env.FIXTURE_EXPECT_UNAPPROVED === '1') {
    console.log('\nCONTROL FIXTURE: no approval used, no record patched.');
    console.log('\n' + JSON.stringify({
      fixtureReady: true, control: true, email, password, inspectionId: inspection.id,
      siteId: site.id, token: auth.token, refreshToken: auth.refreshToken, user: auth.user,
      findingsPatched: 0,
    }));
    await dataSource.destroy();
    return;
  }

  const review = new ReleaseRecordReviewService(dataSource);
  const targetCitation = process.env.FIXTURE_REQUIRE_APPROVED_CITATION || '29 CFR 1910.36';
  const status: any = await review.describeRecordReview(RELEASE_ID, targetCitation);
  if (!status) throw new Error(`No release record for ${targetCitation} in ${RELEASE_ID}`);
  if (status.effectiveReviewState !== 'reviewer_approved') {
    throw new Error(
      `REFUSING to build the fixture: ${targetCitation} is '${status.effectiveReviewState}' in ` +
      `${RELEASE_ID}, not reviewer_approved. This harness renders REAL approvals and will not ` +
      `manufacture one to make a screenshot look right.`,
    );
  }
  console.log(`\nUSING EXISTING REAL APPROVAL for ${targetCitation}`);
  console.log(`  release        : ${RELEASE_ID}`);
  console.log(`  recordChecksum : ${status.recordChecksum}`);
  console.log(`  reviewer       : ${status.reviewerId} (${status.reviewerRole})`);
  console.log(`  decidedAt      : ${status.decidedAt}`);

  // ---- recompute that citation's backing with the REAL contract, then persist ---------------
  let patched = 0;
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
        sourceKey: governed.sourceKey,
        title: governed.title,
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
      if (!c.plainLanguageSummary && governed.plainLanguageSummary) c.plainLanguageSummary = governed.plainLanguageSummary;
      if (!c.title && governed.title) c.title = governed.title;
      touched = true;
      console.log(`  patched ${c.citation} -> ${backing.backingStatus} (corpusBacked=${backing.corpusBacked})`);
    }
    if (touched) {
      await dataSource.query(`UPDATE inspection_findings SET "sourceCandidate" = $2 WHERE id = $1`, [f.id, f.sourceCandidate]);
      patched++;
    }
  }

  const after = await dataSource.query(
    `SELECT f.id, f."hazardKey", f."sourceCandidate"->'standardCandidates' AS candidates
       FROM inspection_findings f WHERE f."inspectionId" = $1 AND f.status <> 'superseded' ORDER BY f."createdAt"`,
    [inspection.id],
  );
  console.log('\nFINAL PERSISTED BACKING PER FINDING:');
  for (const row of after) {
    const cs = (row.candidates || []).map((c: any) => `${c.citation}=${c.backingStatus}`);
    console.log(`  ${row.hazardKey}: ${cs.join(', ')}`);
  }

  console.log('\n' + JSON.stringify({
    fixtureReady: true, email, password, inspectionId: inspection.id, siteId: site.id,
    token: auth.token, refreshToken: auth.refreshToken, user: auth.user, findingsPatched: patched,
  }));

  await dataSource.destroy();
}

main().catch(async e => {
  console.error(e instanceof Error ? e.stack || e.message : e);
  process.exitCode = 1;
  if (dataSource.isInitialized) await dataSource.destroy().catch(() => {});
});
