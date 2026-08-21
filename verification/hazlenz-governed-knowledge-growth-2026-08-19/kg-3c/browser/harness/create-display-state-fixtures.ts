/**
 * KG-3C browser-verification fixtures (VERIFICATION ONLY — not production code).
 *
 * Drives the REAL product pathway (register -> site -> inspection -> observation ->
 * /safescope-v2/classify -> persisted analysis -> decomposed findings) so the three standards
 * backing states are exercised through the actual API and the actual persisted candidate shape.
 *
 * States B (UNAPPROVED_CONTENT) and C (CITATION_ONLY) arise naturally from the live path.
 * State A (APPROVED_GOVERNED_CONTENT) requires a reviewer approval, which is performed for real
 * through the KG-3B checksum-bound mechanism (ReleaseRecordReviewService.approveRecord); the
 * resulting status is then computed by the REAL contract (resolveGovernedCitation +
 * resolveStandardsBacking) and written onto the persisted candidate. Only the wiring between the
 * governed resolution and the live mark() is stood in for — that wiring is the deliberately
 * disabled KG-3E cutover.
 */
import 'dotenv/config';
import { dataSource } from './src/database/data-source';
import { ReleaseRecordReviewService } from './src/standards/releases/release-record-review.service';
import { resolveGovernedCitation } from './src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from './src/standards/display/standards-backing-contract';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4310';
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
    signal: AbortSignal.timeout(120000),
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (res.status !== expected) throw new Error(`${options.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  return body;
}

// Observations chosen to elicit citations that sit in different corpus states.
const OBSERVATIONS = [
  {
    label: 'fall-protection (target: APPROVED after real review)',
    text: 'Employee working at 12 feet on an unprotected leading edge with no guardrail and no personal fall arrest system in use.',
  },
  {
    label: 'egress / placeholder-provenance 1910.36',
    text: 'The designated exit route from the maintenance mezzanine was blocked by stacked pallets and stored drums, and the exit door was obstructed.',
  },
  {
    label: 'excavation (target: CITATION_ONLY)',
    text: 'Workers were in a seven foot deep excavation with vertical unsupported walls, no shoring, no sloping and no trench box in place.',
  },
];

async function main() {
  await dataSource.initialize();

  const suffix = Date.now();
  const password = 'KG3cBrowser!Pass123';
  const email = `kg3c-browser-${suffix}@example.test`;

  await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: 'KG-3C Browser Verification', type: 'individual' }) }, 201);
  const auth = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, 201);
  const H = { authorization: `Bearer ${auth.token}` };
  const userId = auth.user.id;

  // Entitlement: tier 'pro' (Expert retired by migration 1800000005900).
  await dataSource.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '1 day',$1,'KG-3C browser verification fixture')`,
    [userId],
  );

  const site = await api('/sites', { method: 'POST', headers: H, body: JSON.stringify({ name: `KG-3C Verification Site ${suffix}` }) }, 201);
  const inspection = await api('/inspections', {
    method: 'POST', headers: H,
    body: JSON.stringify({ siteId: site.id, title: 'KG-3C standards display verification', regulatoryContext: 'osha-construction' }),
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
        idempotencyKey: `kg3c-browser-${suffix}-${i}`,
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

  // ---- real KG-3B checksum-bound approval of one emitted citation ---------------------------
  const review = new ReleaseRecordReviewService(dataSource);
  const targetCitation = process.env.FIXTURE_APPROVE_CITATION || '29 CFR 1926.501';
  const status = await review.describeRecordReview(RELEASE_ID, targetCitation);
  if (!status) throw new Error(`No release record for ${targetCitation} in ${RELEASE_ID}`);
  console.log(`\nrecord ${targetCitation}: frozenState=${(status as any).frozenState} checksum=${(status as any).recordChecksum}`);

  const decision = await review.approveRecord({
    releaseId: RELEASE_ID,
    citation: targetCitation,
    expectedChecksum: (status as any).recordChecksum,
    reviewerId: 'kg3c-verification-reviewer',
    reviewerRole: 'safety-standards-reviewer',
    note: 'KG-3C browser display verification fixture — controlled approval, not a substantive regulatory review.',
  });
  console.log(`approval outcome=${decision.outcome} effectiveReviewState=${decision.effectiveReviewState}`);

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
