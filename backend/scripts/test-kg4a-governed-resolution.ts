/**
 * KG-4A (Phases 9, 10, 12, 17, 18) -- the governed resolver against a real corpus, adversarially.
 *
 * DATABASE OWNERSHIP -- READ THIS BEFORE RUNNING.
 *
 * THIS SUITE OWNS ITS DATABASE AND MUTATES IT. It finalizes releases, moves the active pointer,
 * inserts and revokes reviewer decisions, and corrupts records on purpose. It therefore creates
 * its OWN disposable database on every run (`test_kg4a_resolution_run`), drops it at the end, and
 * REFUSES to run against any database it was not given as a read-only source.
 *
 * This is the KG-4A guardrail added because KG-3F destroyed a KG-3E verification database by
 * running a mutating suite against a corpus another suite depended on. The rule is now mechanical:
 * a mutating suite may READ a corpus and must WRITE only to a database it created itself.
 *
 * Usage:
 *   SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg4a-governed-resolution.ts
 */
import { execFileSync } from 'child_process';
import { DataSource } from 'typeorm';
import { userInfo } from 'os';
import {
  pinGovernedRelease, resolveGoverned, toGovernedBackingInput,
} from '../src/standards/cutover/governed-resolution';
import { decideFallback, toApplicabilityState } from '../src/standards/cutover/fallback-contract';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';
import {
  classifyShadowMismatch, buildShadowComparisonEvent, assertNoSensitiveFields,
} from '../src/standards/cutover/cutover-observability';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_remediation_20260820';
const OWNED_DB = 'test_kg4a_resolution_run';
const url = (db: string) => `postgresql://${USER}@${HOST}:5432/${db}`;

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }
const psql = (db: string, sql: string) =>
  execFileSync('psql', ['-h', HOST, '-U', USER, '-qtA', db, '-c', sql], { encoding: 'utf8' }).trim();

// ---------------------------------------------------------------- ownership guard
if (/^(safescope|sentinel_dev|sentinel_safety|postgres)$/.test(SOURCE_DB) || !/^test_/.test(SOURCE_DB)) {
  console.error(`REFUSED: SOURCE_DB='${SOURCE_DB}' is not a test_* database.`);
  process.exit(2);
}
// `dotenv/config` is deliberately NOT imported. A stray ambient DATABASE_URL -- from `.env`, from
// a previous export, from a copy-pasted command -- is the exact mechanism by which KG-3F damaged a
// KG-3E verification database, so this suite never reads one: every connection below names its
// database explicitly. If one is present in the environment it is announced as ignored rather than
// silently honoured, so a reader of the output can never believe it took effect.
if (process.env.DATABASE_URL) {
  console.log(`note  DATABASE_URL is set and is IGNORED by this suite; it writes only to '${OWNED_DB}'.`);
}

async function main() {
  section(`Provisioning owned database '${OWNED_DB}' from read-only source '${SOURCE_DB}'`);
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, OWNED_DB]);
  execFileSync('bash', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${OWNED_DB}`]);
  const sourceRecords = psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records');
  const ownedRecords = psql(OWNED_DB, 'SELECT count(*) FROM regulatory_release_records');
  assert(sourceRecords === ownedRecords, `owned clone carries the source corpus (${ownedRecords} records)`);

  const ds = new DataSource({ type: 'postgres', url: url(OWNED_DB), synchronize: false, logging: false });
  await ds.initialize();

  const RELEASE = 'federal-core-2026-08-20.5';
  // Activate INSIDE the owned clone only. The source corpus's pointer is never touched.
  await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE status='active'`);
  await ds.query(`UPDATE regulatory_releases SET status='active', "activatedAt"=now() WHERE "releaseId"=$1`, [RELEASE]);
  assert(psql(SOURCE_DB, `SELECT count(*) FROM regulatory_releases WHERE status='active'`) === '0',
    'HARD: the read-only source corpus still has NO active release — the clone was activated, not the source');

  // Find one genuinely approved+texted citation, and one unapproved one, from the real corpus.
  const approvedRows = await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId"=$1
        AND EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                     WHERE v."releaseId"=r."releaseId" AND v."citationKey"=r."citationKey"
                       AND v."recordChecksum"=r."recordChecksum" AND v.decision='approved')
        AND coalesce(r.payload->>'canonicalText','') <> ''
      ORDER BY r.citation LIMIT 1`, [RELEASE]);
  const unapprovedRows = await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId"=$1
        AND NOT EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                     WHERE v."releaseId"=r."releaseId" AND v."citationKey"=r."citationKey"
                       AND v."recordChecksum"=r."recordChecksum" AND v.decision='approved')
      ORDER BY r.citation LIMIT 1`, [RELEASE]);
  const APPROVED = approvedRows[0]?.citation;
  const UNAPPROVED = unapprovedRows[0]?.citation;
  assert(Boolean(APPROVED), `corpus supplies an approved+texted citation (${APPROVED})`);
  assert(Boolean(UNAPPROVED), `corpus supplies an unapproved citation (${UNAPPROVED})`);

  // ============================================================ Phase 9 -- pinning
  section('Phase 9 — the release is pinned once per analysis');

  const legacyPin = await pinGovernedRelease(ds, 'LEGACY');
  assert(legacyPin.releaseId === null && legacyPin.reason === 'MODE_IS_LEGACY',
    'HARD: LEGACY does not read the active pointer at all');

  const pin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');
  assert(pin.releaseId === RELEASE && pin.reason === 'PINNED_ACTIVE_RELEASE',
    `governed mode pins the active release (${pin.releaseId})`);

  const before = await resolveGoverned(ds, pin, APPROVED);
  assert(before.backing === 'APPROVED_EXACT' && before.releaseId === RELEASE,
    'the pinned release resolves the approved citation as APPROVED_EXACT');

  // THE RACE. Activation moves to another release mid-analysis; the pinned analysis must not notice.
  const otherRelease = (await ds.query(
    `SELECT "releaseId" FROM regulatory_releases WHERE "releaseId" <> $1 ORDER BY "releaseId" DESC LIMIT 1`,
    [RELEASE]))[0]?.releaseId;
  await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE "releaseId"=$1`, [RELEASE]);
  await ds.query(`UPDATE regulatory_releases SET status='active', "activatedAt"=now() WHERE "releaseId"=$1`, [otherRelease]);
  assert(psql(OWNED_DB, `SELECT "releaseId" FROM regulatory_releases WHERE status='active'`) === otherRelease,
    `the active pointer moved to ${otherRelease} mid-analysis`);

  const after = await resolveGoverned(ds, pin, APPROVED);
  assert(after.releaseId === RELEASE && after.backing === before.backing,
    'HARD: the in-flight analysis still resolves against its PINNED release R1, not the new R2');
  assert(after.standardText === before.standardText,
    'HARD: the in-flight analysis sees identical content before and after the activation race');

  const laterPin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');
  assert(laterPin.releaseId === otherRelease,
    'a LATER independent analysis correctly picks up the new release R2');

  // Parallel analyses share no mutable state.
  const pins = await Promise.all([
    pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK'),
    pinGovernedRelease(ds, 'GOVERNED_STRICT'),
    pinGovernedRelease(ds, 'SHADOW'),
  ]);
  assert(new Set(pins.map(p => p.releaseId)).size === 1 && pins.every(p => p.releaseId === otherRelease),
    'parallel analyses may safely pin the same release concurrently');
  assert(pins.map(p => p.mode).join(',') === 'GOVERNED_WITH_FALLBACK,GOVERNED_STRICT,SHADOW',
    'each concurrent pin retains its OWN mode — no request-global mutable state');

  // Restore the pointer for the remaining sections.
  await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE status='active'`);
  await ds.query(`UPDATE regulatory_releases SET status='active' WHERE "releaseId"=$1`, [RELEASE]);
  const livePin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');

  // ============================================================ Phase 10 -- failure matrix
  section('Phase 10 — every failure mode is deterministic and none produces a raw error');

  interface Case { name: string; run: () => Promise<any>; expectBacking: string; expectHealth: string }
  const cases: Case[] = [
    {
      name: 'approved exact citation',
      run: () => resolveGoverned(ds, livePin, APPROVED),
      expectBacking: 'APPROVED_EXACT', expectHealth: 'OK',
    },
    {
      name: 'active release missing the exact citation',
      run: () => resolveGoverned(ds, livePin, '29 CFR 1910.9999(z)'),
      expectBacking: 'NOT_IN_RELEASE', expectHealth: 'OK',
    },
    {
      name: 'unapproved record present in the release',
      run: () => resolveGoverned(ds, livePin, UNAPPROVED),
      expectBacking: 'UNAPPROVED_RECORD', expectHealth: 'OK',
    },
    {
      name: 'no active release',
      run: () => resolveGoverned(ds, { releaseId: null, pinnedAt: '', mode: 'GOVERNED_WITH_FALLBACK', reason: 'NO_ACTIVE_RELEASE' }, APPROVED),
      expectBacking: 'NO_ACTIVE_RELEASE', expectHealth: 'NO_ACTIVE_RELEASE',
    },
    {
      name: 'pin lookup failed (governance outage)',
      run: () => resolveGoverned(ds, { releaseId: null, pinnedAt: '', mode: 'GOVERNED_WITH_FALLBACK', reason: 'PIN_LOOKUP_FAILED' }, APPROVED),
      expectBacking: 'RESOLVER_UNAVAILABLE', expectHealth: 'QUERY_FAILED',
    },
    {
      name: 'no data source at all',
      run: () => resolveGoverned(null, livePin, APPROVED),
      expectBacking: 'RESOLVER_UNAVAILABLE', expectHealth: 'QUERY_FAILED',
    },
    {
      name: 'unresolvable citation string',
      run: () => resolveGoverned(ds, livePin, '   '),
      expectBacking: 'NOT_IN_RELEASE', expectHealth: 'OK',
    },
  ];

  for (const testCase of cases) {
    let result: any; let threw = false;
    try { result = await testCase.run(); } catch { threw = true; }
    assert(!threw, `[${testCase.name}] resolver did not throw`);
    if (threw) continue;
    assert(result.backing === testCase.expectBacking,
      `[${testCase.name}] backing = ${testCase.expectBacking} (got ${result.backing})`);
    assert(result.health === testCase.expectHealth,
      `[${testCase.name}] health = ${testCase.expectHealth} (got ${result.health})`);
    assert(result.resolvedCitation === result.requestedCitation,
      `[${testCase.name}] HARD: resolvedCitation === requestedCitation (no substitution)`);
    // Determinism: the same input yields the same answer.
    const repeat = await testCase.run();
    assert(repeat.backing === result.backing && repeat.health === result.health,
      `[${testCase.name}] deterministic across repeated calls`);
    // Every state is one the fallback table already handles, in both governed modes.
    for (const mode of ['GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const) {
      const decision = decideFallback(mode, 'SUPPORTED', result.backing);
      assert(Boolean(decision.deliveryState) && decision.showCitation,
        `[${testCase.name}/${mode}] the fallback contract has a defined row and keeps the citation`);
    }
  }

  // Stale schema — the KG-3F migration-order requirement, surfaced not swallowed.
  section('Phase 10 — stale schema fails loudly, and still does not break the customer');
  await ds.query(`ALTER TABLE regulatory_release_record_reviews RENAME TO regulatory_release_record_reviews_x`);
  const stale = await resolveGoverned(ds, livePin, APPROVED);
  assert(stale.health === 'STALE_SCHEMA',
    'HARD: a missing approval-contract table is reported as STALE_SCHEMA, not as "not approved"');
  assert(stale.backing === 'RESOLVER_UNAVAILABLE',
    'HARD: a stale schema is RESOLVER_UNAVAILABLE — "we do not know", never "there is none"');
  assert(/1800000014000/.test(stale.reason), 'the stale-schema reason names the required migration');
  assert(decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', stale.backing).deliveryState === 'LEGACY_TEXT_UNVERIFIED',
    'HARD: under fallback a stale schema degrades the customer to legacy text, not to an error');
  assert(toGovernedBackingInput(stale) === null,
    'HARD: a stale-schema resolution supplies NO governed input — it cannot be laundered into an approval');
  await ds.query(`ALTER TABLE regulatory_release_record_reviews_x RENAME TO regulatory_release_record_reviews`);

  // Revoked approval.
  section('Phase 10 — revocation and digest mismatch');
  const key = releaseCitationKey(APPROVED);
  await ds.query(
    `INSERT INTO regulatory_release_record_reviews
       ("releaseId","citationKey",citation,"recordChecksum",decision,"reviewerId","frozenReviewStateAtDecision")
     SELECT r."releaseId", r."citationKey", r.citation, r."recordChecksum", 'revoked', 'kg4a-test', 'unreviewed'
       FROM regulatory_release_records r WHERE r."releaseId"=$1 AND r."citationKey"=$2`,
    [RELEASE, key]);
  const revoked = await resolveGoverned(ds, livePin, APPROVED);
  assert(revoked.backing === 'UNAPPROVED_RECORD',
    'HARD: a revoked approval immediately stops the record being APPROVED_EXACT');
  assert(revoked.standardText === null,
    'HARD: a revoked record carries NO text forward — content is attached only to APPROVED_EXACT');
  assert(decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', revoked.backing).textIsVerified === false,
    'a revoked record is never presented as verified regulatory text');
  await ds.query(`DELETE FROM regulatory_release_record_reviews WHERE "reviewerId"='kg4a-test'`);
  const restored = await resolveGoverned(ds, livePin, APPROVED);
  assert(restored.backing === 'APPROVED_EXACT', 'removing the revocation restores APPROVED_EXACT');

  // Malformed payload.
  const savedPayload = (await ds.query(
    `SELECT payload FROM regulatory_release_records WHERE "releaseId"=$1 AND "citationKey"=$2`, [RELEASE, key]))[0].payload;
  await ds.query(
    `UPDATE regulatory_release_records SET payload='{}'::jsonb WHERE "releaseId"=$1 AND "citationKey"=$2`, [RELEASE, key]);
  const malformed = await resolveGoverned(ds, livePin, APPROVED);
  assert(malformed.backing === 'APPROVED_NO_TEXT',
    'HARD: an approved record whose payload lost its text becomes APPROVED_NO_TEXT, never silently backed');
  assert(decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', malformed.backing).deliveryState === 'CITATION_ONLY_NO_TEXT',
    'an emptied approved record delivers citation-only with an explicit disclosure');
  await ds.query(
    `UPDATE regulatory_release_records SET payload=$3::jsonb WHERE "releaseId"=$1 AND "citationKey"=$2`,
    [RELEASE, key, JSON.stringify(savedPayload)]);

  // ============================================================ granularity / substitution
  section('Phases 3 and 5 — no substitution, no parent/child promotion');

  // Find an approved bare SECTION in the corpus and ask for a paragraph of it that is NOT present.
  const sectionRow = (await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId"=$1 AND r.citation NOT LIKE '%(%'
      ORDER BY r.citation LIMIT 1`, [RELEASE]))[0];
  if (sectionRow) {
    const paragraph = `${sectionRow.citation}(z)(99)`;
    const child = await resolveGoverned(ds, livePin, paragraph);
    assert(child.resolvedCitation === paragraph,
      `HARD: asking for '${paragraph}' resolves for that citation, never for its parent section`);
    assert(child.standardText === null,
      'HARD: a section-only match supplies NO text for the paragraph (no parent→child promotion)');
    assert(child.backing === 'APPROVED_SECTION_ONLY' || child.backing === 'NOT_IN_RELEASE',
      `a missing paragraph is SECTION_ONLY or NOT_IN_RELEASE (got ${child.backing})`);
    assert(toGovernedBackingInput(child) === null,
      'HARD: a section-only resolution supplies no governed backing input for the paragraph');
    assert(!decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', child.backing).textIsVerified,
      'HARD: a section-only state can never earn a verified badge for the paragraph');
  }

  // A neighbouring section must never satisfy a request.
  const neighbour = await resolveGoverned(ds, livePin, '29 CFR 1926.5011');
  assert(neighbour.backing !== 'APPROVED_EXACT',
    'HARD: a digit-prefix neighbour (1926.5011 vs 1926.501) is never treated as the requested citation');

  // ============================================================ display-contract agreement
  section('Integration — the governed input drives the SAME display contract');

  const approvedResolution = await resolveGoverned(ds, livePin, APPROVED);
  const governedInput = toGovernedBackingInput(approvedResolution);
  assert(governedInput !== null, 'an approved exact resolution supplies a governed backing input');
  const withGoverned = resolveStandardsBacking({
    citation: APPROVED, sourceKey: approvedResolution.sourceKey,
    standardText: approvedResolution.standardText, governed: governedInput,
  });
  assert(withGoverned.backingStatus === 'APPROVED_GOVERNED_CONTENT' && withGoverned.corpusBacked,
    'HARD: with a governed input the existing KG-3C contract reports APPROVED_GOVERNED_CONTENT');
  const withoutGoverned = resolveStandardsBacking({
    citation: APPROVED, sourceKey: approvedResolution.sourceKey,
    standardText: approvedResolution.standardText,
  });
  assert(withoutGoverned.backingStatus === 'UNAPPROVED_CONTENT' && !withoutGoverned.corpusBacked,
    'HARD: WITHOUT a governed input the same citation is NOT approved — legacy behaviour is unchanged');

  const unapprovedResolution = await resolveGoverned(ds, livePin, UNAPPROVED);
  const unapprovedDisplay = resolveStandardsBacking({
    citation: UNAPPROVED, sourceKey: unapprovedResolution.sourceKey,
    standardText: 'some corpus text', governed: toGovernedBackingInput(unapprovedResolution) ?? undefined,
  });
  assert(unapprovedDisplay.backingStatus !== 'APPROVED_GOVERNED_CONTENT',
    'HARD: an unapproved governed record can never reach APPROVED_GOVERNED_CONTENT');

  // ============================================================ Phase 12 -- shadow classification
  section('Phase 12 — shadow mismatch classification');

  assert(classifyShadowMismatch(approvedResolution, approvedResolution.standardText, 'SUPPORTED') === 'EXACT_MATCH',
    'identical governed and legacy text classifies as EXACT_MATCH');
  assert(classifyShadowMismatch(approvedResolution, 'completely different text', 'SUPPORTED') === 'CONTENT_DIFFERENCE',
    'differing text classifies as CONTENT_DIFFERENCE');
  assert(classifyShadowMismatch(approvedResolution, null, 'SUPPORTED') === 'GOVERNED_APPROVED_EQUIVALENT',
    'governed text where legacy had none classifies as GOVERNED_APPROVED_EQUIVALENT');
  assert(classifyShadowMismatch(approvedResolution, approvedResolution.standardText, 'UNCERTAIN') === 'APPLICABILITY_DISAGREEMENT',
    'approved backing under uncertain applicability classifies as APPLICABILITY_DISAGREEMENT');
  assert(classifyShadowMismatch(unapprovedResolution, 'x', 'SUPPORTED') === 'UNAPPROVED_GOVERNED_RECORD',
    'an unapproved record classifies as UNAPPROVED_GOVERNED_RECORD');
  assert(classifyShadowMismatch(await resolveGoverned(ds, livePin, '29 CFR 1910.9999(z)'), 'x', 'SUPPORTED') === 'MISSING_GOVERNED_RECORD',
    'an absent record classifies as MISSING_GOVERNED_RECORD');
  assert(classifyShadowMismatch(stale, 'x', 'SUPPORTED') === 'RESOLVER_FAILURE',
    'a resolver failure classifies as RESOLVER_FAILURE, not as a content difference');

  const shadowEvent = buildShadowComparisonEvent({
    governed: approvedResolution, legacyText: 'legacy body', applicability: 'SUPPORTED',
    customerOutputUnchanged: true, analysisTraceId: 'trace-1', durationMs: 3,
  });
  assert(shadowEvent.customerOutputUnchanged === true, 'the shadow event records the customer-unchanged obligation');
  assert(shadowEvent.legacyTextDigest !== shadowEvent.governedTextDigest,
    'shadow compares by DIGEST, and different bodies produce different digests');
  assert(!JSON.stringify(shadowEvent).includes('legacy body'),
    'HARD: the shadow event records digests, never the text itself');
  let sensitiveThrew = false;
  try { assertNoSensitiveFields(shadowEvent as any); } catch { sensitiveThrew = true; }
  assert(!sensitiveThrew, 'the shadow event passes the privacy guard');
  let guardCaught = false;
  try { assertNoSensitiveFields({ mode: 'SHADOW', standardText: 'the employer shall...' }); } catch { guardCaught = true; }
  assert(guardCaught, 'HARD: the privacy guard rejects an event carrying regulatory text');
  let emailCaught = false;
  try { assertNoSensitiveFields({ mode: 'SHADOW', reviewer: 'someone@example.com' }); } catch { emailCaught = true; }
  assert(emailCaught, 'HARD: the privacy guard rejects an event carrying an email address');

  await ds.destroy();

  // ---------------------------------------------------------------- source integrity
  section('Database ownership — the read-only source is provably unchanged');
  assert(psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records') === sourceRecords,
    `HARD: source corpus record count unchanged (${sourceRecords})`);
  assert(psql(SOURCE_DB, `SELECT count(*) FROM regulatory_releases WHERE status='active'`) === '0',
    'HARD: source corpus still has no active release');
  assert(psql(SOURCE_DB, `SELECT count(*) FROM regulatory_release_record_reviews WHERE "reviewerId"='kg4a-test'`) === '0',
    'HARD: no KG-4A fixture decision leaked into the source corpus');

  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);
  console.log(`\nowned database '${OWNED_DB}' dropped`);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => { console.error(error); process.exit(1); });
