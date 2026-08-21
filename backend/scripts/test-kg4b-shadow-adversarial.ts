/**
 * KG-4B (Phases 6, 7, 8, 16) -- SHADOW under adversarial conditions.
 *
 * DATABASE OWNERSHIP -- READ THIS BEFORE RUNNING.
 *
 * THIS SUITE OWNS ITS DATABASE AND MUTATES IT. It activates and de-activates releases, revokes
 * approvals, corrupts payloads and renames tables on purpose. It therefore creates its OWN
 * disposable database on every run (`test_kg4b_adversarial_run`), drops it at the end, and proves
 * the read-only source unchanged afterwards.
 *
 * `dotenv/config` is deliberately NOT imported: an ambient `DATABASE_URL` must never be able to
 * redirect a mutating suite onto an evidence-bearing database. Every connection names its target.
 *
 * WHAT IT PROVES.
 *   Part 1  SHADOW never writes governed customer provenance          (Phase 6)
 *   Part 2  one analysis, one pinned release, through an activation race and an approval race (Phase 7)
 *   Part 3  no client input can manufacture governed provenance       (Phase 8)
 *   Part 4  every injected failure leaves the customer on legacy and is reported truthfully (Phase 16)
 *
 * Usage:
 *   SOURCE_DB=test_kg4b_shadow_20260820 npx ts-node scripts/test-kg4b-shadow-adversarial.ts
 */
import { execFileSync } from 'child_process';
import { userInfo } from 'os';
import { DataSource } from 'typeorm';
import {
  pinGovernedRelease, resolveGoverned, toGovernedBackingInput,
} from '../src/standards/cutover/governed-resolution';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { decideFallback } from '../src/standards/cutover/fallback-contract';
import { classifyShadowComparison } from '../src/standards/cutover/shadow-comparison';
import { resolveAnalysisProvenance } from '../src/standards/cutover/governed-provenance';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg4b_shadow_20260820';
const OWNED_DB = 'test_kg4b_adversarial_run';
const RELEASE = 'federal-core-2026-07-30.1';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }
const psql = (db: string, sql: string) =>
  execFileSync('psql', ['-h', HOST, '-U', USER, '-qtA', db, '-c', sql], { encoding: 'utf8' }).trim();

if (!/^test_/.test(SOURCE_DB) || /^(safescope|sentinel_dev|sentinel_safety|postgres)$/.test(SOURCE_DB)) {
  console.error(`REFUSED: SOURCE_DB='${SOURCE_DB}' is not a disposable test_* database.`);
  process.exit(2);
}
if (process.env.DATABASE_URL) {
  console.log(`note  DATABASE_URL is set and is IGNORED by this suite; it writes only to '${OWNED_DB}'.`);
}

const SHADOW_ENV = { GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u1' };
const GOVERNED_ENV = { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u1' };
const PRINCIPAL = { userId: 'u1', organizationId: null };

async function main() {
  section(`Provisioning owned database '${OWNED_DB}' from read-only source '${SOURCE_DB}'`);
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, OWNED_DB]);
  execFileSync('bash', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${OWNED_DB}`]);
  const sourceRecords = psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records');
  const sourceActive = psql(SOURCE_DB, `SELECT coalesce(max("releaseId"),'none') FROM regulatory_releases WHERE status='active'`);
  assert(psql(OWNED_DB, 'SELECT count(*) FROM regulatory_release_records') === sourceRecords,
    `owned clone carries the source corpus (${sourceRecords} records)`);

  const ds = new DataSource({ type: 'postgres', url: `postgresql://${USER}@${HOST}:5432/${OWNED_DB}`, synchronize: false, logging: false });
  await ds.initialize();

  const approvedCitation: string = (await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId"=$1
        AND EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                     WHERE v."releaseId"=r."releaseId" AND v."citationKey"=r."citationKey"
                       AND v."recordChecksum"=r."recordChecksum" AND v.decision='approved')
        AND coalesce(r.payload->>'canonicalText','') <> ''
      ORDER BY r.citation LIMIT 1`, [RELEASE]))[0]?.citation;
  assert(Boolean(approvedCitation), `corpus supplies an approved+texted citation (${approvedCitation})`);

  // ============================================================ Part 1 -- SHADOW writes no provenance
  section('Phase 6 — SHADOW never writes governed customer provenance');

  const shadowContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-shadow-1', env: SHADOW_ENV,
  });
  assert(shadowContext !== null && shadowContext.mode === 'SHADOW', 'a SHADOW context is created for the allowlisted principal');
  assert(shadowContext!.pin.releaseId === RELEASE, `SHADOW pins the active release (${shadowContext!.pin.releaseId})`);

  // A realistic mixed analysis: approved exact, a missing record, and a section-only paragraph.
  const sectionCitation: string = (await ds.query(
    `SELECT citation FROM regulatory_release_records WHERE "releaseId"=$1 AND citation NOT LIKE '%(%' ORDER BY citation LIMIT 1`,
    [RELEASE]))[0]?.citation;
  const mixedCitations = [approvedCitation, '29 CFR 1910.9999(z)', `${sectionCitation}(z)(99)`];
  const shadowDecisions = [];
  for (const citation of mixedCitations) {
    shadowDecisions.push(await shadowContext!.resolveStandard({
      citation, applicabilityStatus: 'SUPPORTED', findingKey: citation,
      legacyText: 'legacy body', legacyBackingState: 'UNAPPROVED_CONTENT',
      hazardFamily: 'kg4b', jurisdiction: 'osha_general_industry',
    }));
  }
  assert(shadowDecisions.every(d => d.governedBackingInput === null),
    'HARD: SHADOW supplies NO governed backing input for any citation, including the approved one');
  assert(shadowDecisions.every(d => d.verifiedText === null),
    'HARD: SHADOW supplies NO verified text for any citation');
  assert(shadowDecisions.every(d => d.customerVisible === false),
    'HARD: no SHADOW decision is customer-visible — the payload gains no key');
  assert(shadowDecisions.every(d => d.decision.governedProvenanceEligible === false),
    'HARD: no SHADOW decision is provenance-eligible, even where backing is APPROVED_EXACT');

  const shadowProvenance = resolveAnalysisProvenance(shadowContext!.pin, shadowContext!.provenanceContributions());
  assert(shadowProvenance.analysisKnowledgeReleaseId === null,
    'HARD: a SHADOW analysis records knowledgeReleaseId = NULL despite a pinned release and approved content');
  assert(Object.values(shadowProvenance.findingKnowledgeReleaseIds).every(v => v === null),
    'HARD: every SHADOW finding records NULL');
  assert(/not consumption/.test(shadowProvenance.reason),
    'the recorded reason states that a background comparison is not consumption');

  const comparisons = shadowContext!.shadowComparisons();
  assert(comparisons.length === mixedCitations.length,
    `SHADOW still produced ${comparisons.length} comparison records for telemetry`);
  assert(comparisons.every(c => c.customerOutputUnchanged === true),
    'every comparison asserts the customer output was unchanged');
  const shadowCategories = new Set(comparisons.map(c => c.mismatch));
  assert(shadowCategories.size >= 2,
    `the mixed analysis produced several distinct outcomes (${[...shadowCategories].join(', ')})`);

  // The same analysis in GOVERNED_WITH_FALLBACK DOES record provenance -- so Part 1 is not vacuous.
  const governedContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-governed-1', env: GOVERNED_ENV,
  });
  for (const citation of mixedCitations) {
    await governedContext!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation });
  }
  const governedProvenance = resolveAnalysisProvenance(governedContext!.pin, governedContext!.provenanceContributions());
  assert(governedProvenance.analysisKnowledgeReleaseId === RELEASE,
    'HARD: the SAME analysis in GOVERNED_WITH_FALLBACK DOES record the release — SHADOW\'s silence is real');
  assert(governedProvenance.mixed === true,
    'and it is correctly flagged as mixed provenance (some findings governed, some not)');
  assert(governedContext!.shadowComparisons().length === 0,
    'HARD: a non-SHADOW mode produces NO shadow comparison records');

  // ============================================================ Part 2 -- pinning
  section('Phase 7 — one analysis, one pinned release');

  // The KG-4B corpus database holds ONE release, so a second one is created HERE, inside the owned
  // clone, purely to have something to race to. Without it the activation-race assertions would pass
  // vacuously against `undefined` -- which is exactly what the first run did.
  const otherRelease = 'kg4b-race-target.2';
  // Copy EVERY column except the identity, so no not-null column is missed as the schema evolves.
  const releaseColumns: string[] = (await ds.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='regulatory_releases' AND column_name NOT IN ('id','releaseId','releaseVersion','status')`))
    .map((r: any) => `"${r.column_name}"`);
  await ds.query(
    `INSERT INTO regulatory_releases ("releaseId", "releaseVersion", status, ${releaseColumns.join(', ')})
     SELECT $2, 'kg4b-race.2', 'provisional', ${releaseColumns.join(', ')}
       FROM regulatory_releases WHERE "releaseId" = $1`, [RELEASE, otherRelease]);
  const recordColumns: string[] = (await ds.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='regulatory_release_records' AND column_name NOT IN ('id','releaseId')`))
    .map((r: any) => `"${r.column_name}"`);
  await ds.query(
    `INSERT INTO regulatory_release_records ("releaseId", ${recordColumns.join(', ')})
     SELECT $2, ${recordColumns.join(', ')}
       FROM regulatory_release_records WHERE "releaseId" = $1`, [RELEASE, otherRelease]);
  assert((await ds.query(`SELECT count(*)::int n FROM regulatory_releases WHERE "releaseId"=$1`, [otherRelease]))[0].n === 1,
    `a second release (${otherRelease}) exists in the owned clone, so the race is not vacuous`);
  const raceContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-race', env: SHADOW_ENV,
  });
  const before = await raceContext!.resolveStandard({
    citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'f1', legacyText: 'x',
  });
  assert(before.resolution.releaseId === RELEASE, 'the analysis pins R1 and resolves against it');

  // R2 activates mid-analysis.
  await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE "releaseId"=$1`, [RELEASE]);
  await ds.query(`UPDATE regulatory_releases SET status='active', "activatedAt"=now() WHERE "releaseId"=$1`, [otherRelease]);
  assert(psql(OWNED_DB, `SELECT "releaseId" FROM regulatory_releases WHERE status='active'`) === otherRelease,
    `the active pointer moved to R2 (${otherRelease}) mid-analysis`);

  const after = await raceContext!.resolveStandard({
    citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'f2', legacyText: 'x',
  });
  assert(after.resolution.releaseId === RELEASE,
    'HARD: the in-flight SHADOW analysis still resolves against its PINNED R1, not R2');
  assert(after.resolution.backing === before.resolution.backing,
    'and reports the same backing state before and after the activation race');
  const raceRecords = raceContext!.shadowComparisons();
  assert(new Set(raceRecords.map(r => r.releaseId)).size === 1,
    'HARD: every shadow comparison in one analysis names ONE release — no half-R1/half-R2 corpus');
  assert(new Set(raceRecords.map(r => r.releaseManifestChecksum)).size === 1,
    'and one manifest identity');

  const laterContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-later', env: SHADOW_ENV,
  });
  assert(laterContext!.pin.releaseId === otherRelease,
    'a LATER independent analysis correctly shadows against R2');

  // Restore R1 for the remaining sections.
  await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE status='active'`);
  await ds.query(`UPDATE regulatory_releases SET status='active' WHERE "releaseId"=$1`, [RELEASE]);

  // Approval race: a revocation lands mid-analysis.
  const approvalRaceContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-approval-race', env: SHADOW_ENV,
  });
  const preRevoke = await approvalRaceContext!.resolveStandard({
    citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'a1', legacyText: 'x',
  });
  assert(preRevoke.resolution.backing === 'APPROVED_EXACT', 'before revocation the record is APPROVED_EXACT');
  const key = releaseCitationKey(approvedCitation);
  await ds.query(
    `INSERT INTO regulatory_release_record_reviews
       ("releaseId","citationKey",citation,"recordChecksum",decision,"reviewerId","frozenReviewStateAtDecision")
     SELECT r."releaseId", r."citationKey", r.citation, r."recordChecksum", 'revoked', 'kg4b-test', 'unreviewed'
       FROM regulatory_release_records r WHERE r."releaseId"=$1 AND r."citationKey"=$2`, [RELEASE, key]);
  const postRevoke = await approvalRaceContext!.resolveStandard({
    citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'a2', legacyText: 'x',
  });

  // THE CONSISTENCY BOUNDARY, stated explicitly.
  //
  // The context memoises per citation, so ONE analysis resolves a given citation exactly ONCE. A
  // revocation landing mid-analysis therefore does NOT change that analysis's answer -- which is a
  // STRONGER property than "the approval is re-read each time", and it is the one Phase 7 actually
  // requires: one analysis must have a coherent comparison basis, with no half-old/half-new corpus.
  //
  // The first version of this suite asserted the weaker (and false) behaviour. The code is right.
  assert(postRevoke.resolution.backing === preRevoke.resolution.backing,
    'HARD: a revocation landing mid-analysis does NOT change that analysis — one citation, one resolution');
  assert(postRevoke.resolution.releaseId === RELEASE,
    'HARD: the revocation does not move the analysis off its pinned release');
  assert(new Set(approvalRaceContext!.shadowComparisons().map(r => r.governedBackingState)).size === 1,
    'HARD: every comparison in that analysis reports the SAME backing state — a coherent basis');

  // A NEW analysis, started after the revocation, DOES see it. That is what makes the boundary a
  // boundary rather than a stale cache.
  const postRevokeContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: PRINCIPAL, analysisTraceId: 'kg4b-post-revoke', env: SHADOW_ENV,
  });
  const freshAfterRevoke = await postRevokeContext!.resolveStandard({
    citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'a3', legacyText: 'x',
  });
  assert(freshAfterRevoke.resolution.backing === 'UNAPPROVED_RECORD',
    'HARD: the NEXT analysis sees the revocation — the boundary is the analysis, not a stale cache');
  assert(freshAfterRevoke.resolution.standardText === null,
    'HARD: a revoked record carries no text forward');
  await ds.query(`DELETE FROM regulatory_release_record_reviews WHERE "reviewerId"='kg4b-test'`);

  // ============================================================ Part 3 -- spoofing
  section('Phase 8 — no client input can manufacture governed provenance');

  const { InspectionService } = require('../src/inspection/inspection.service');
  class GateProbe extends InspectionService {
    constructor(source: any) {
      super(...([null, null, null, null, null, null, null, null, null, null, source] as any));
    }
    public gate(snapshot: unknown, principal: any) {
      return (this as any).resolveKnowledgeReleaseId(snapshot, principal);
    }
  }
  const probe = new GateProbe(ds);
  const withEnv = async <T>(env: Record<string, string>, run: () => Promise<T>): Promise<T> => {
    const saved: Record<string, string | undefined> = {};
    for (const k of Object.keys(env)) { saved[k] = process.env[k]; process.env[k] = env[k]; }
    try { return await run(); }
    finally { for (const k of Object.keys(env)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } }
  };
  const snapshotClaiming = (releaseId: string) =>
    ({ standardDecisions: [{ citation: approvedCitation, knowledgeReleaseId: releaseId }] });

  const ATTACKS: Array<[string, Record<string, string>, any, any]> = [
    ['LEGACY + arbitrary release id', {}, PRINCIPAL, snapshotClaiming('attacker-invented-release')],
    ['LEGACY + the REAL active release id', {}, PRINCIPAL, snapshotClaiming(RELEASE)],
    ['SHADOW + the real active release id', SHADOW_ENV, PRINCIPAL, snapshotClaiming(RELEASE)],
    ['SHADOW + arbitrary release id', SHADOW_ENV, PRINCIPAL, snapshotClaiming('attacker-invented-release')],
    ['governed + NON-allowlisted principal', GOVERNED_ENV, { userId: 'intruder' }, snapshotClaiming(RELEASE)],
    ['governed + allowlisted + WRONG release id', GOVERNED_ENV, PRINCIPAL, snapshotClaiming('wrong-release')],
    ['governed + allowlisted + STALE release id', GOVERNED_ENV, PRINCIPAL, snapshotClaiming(otherRelease)],
    ['governed + allowlisted + nonexistent release id', GOVERNED_ENV, PRINCIPAL, snapshotClaiming('federal-core-9999.9')],
    ['governed + allowlisted + another environment\'s release id', GOVERNED_ENV, PRINCIPAL, snapshotClaiming('kg3b-matrix.A')],
    ['governed + allowlisted + two conflicting release ids', GOVERNED_ENV, PRINCIPAL,
      { standardDecisions: [{ knowledgeReleaseId: RELEASE }, { knowledgeReleaseId: otherRelease }] }],
  ];
  for (const [label, env, principal, snapshot] of ATTACKS) {
    const result = await withEnv(env, () => probe.gate(snapshot, principal));
    assert(result === null, `HARD: ${label} -> provenance NULL (got ${result})`);
  }
  // Not vacuous: the legitimate case still records.
  const legitimate = await withEnv(GOVERNED_ENV, () => probe.gate(snapshotClaiming(RELEASE), PRINCIPAL));
  assert(legitimate === RELEASE,
    'HARD: an allowlisted governed principal claiming the genuinely active release DOES record it — the gate is not simply "always null"');

  // ============================================================ Part 4 -- failure injection
  section('Phase 16 — injected failures leave the customer on legacy and are reported truthfully');

  interface Injection { name: string; setup: () => Promise<void>; teardown: () => Promise<void>; expectBacking: string; expectHealth: string; expectMismatch: string }
  const savedPayload = (await ds.query(
    `SELECT payload FROM regulatory_release_records WHERE "releaseId"=$1 AND "citationKey"=$2`, [RELEASE, key]))[0].payload;

  const INJECTIONS: Injection[] = [
    {
      name: 'no active release',
      setup: async () => { await ds.query(`UPDATE regulatory_releases SET status='provisional' WHERE status='active'`); },
      teardown: async () => { await ds.query(`UPDATE regulatory_releases SET status='active' WHERE "releaseId"=$1`, [RELEASE]); },
      expectBacking: 'NO_ACTIVE_RELEASE', expectHealth: 'NO_ACTIVE_RELEASE', expectMismatch: 'RESOLVER_FAILURE',
    },
    {
      name: 'stale schema (migration 1800000014000 not run)',
      setup: async () => { await ds.query(`ALTER TABLE regulatory_release_record_reviews RENAME TO regulatory_release_record_reviews_x`); },
      teardown: async () => { await ds.query(`ALTER TABLE regulatory_release_record_reviews_x RENAME TO regulatory_release_record_reviews`); },
      expectBacking: 'RESOLVER_UNAVAILABLE', expectHealth: 'STALE_SCHEMA', expectMismatch: 'INTEGRITY_FAILURE',
    },
    {
      name: 'malformed governed record (payload emptied)',
      setup: async () => { await ds.query(`UPDATE regulatory_release_records SET payload='{}'::jsonb WHERE "releaseId"=$1 AND "citationKey"=$2`, [RELEASE, key]); },
      teardown: async () => { await ds.query(`UPDATE regulatory_release_records SET payload=$3::jsonb WHERE "releaseId"=$1 AND "citationKey"=$2`, [RELEASE, key, JSON.stringify(savedPayload)]); },
      expectBacking: 'APPROVED_NO_TEXT', expectHealth: 'OK', expectMismatch: 'GOVERNED_CITATION_ONLY',
    },
    {
      name: 'revoked approval',
      setup: async () => {
        await ds.query(
          `INSERT INTO regulatory_release_record_reviews
             ("releaseId","citationKey",citation,"recordChecksum",decision,"reviewerId","frozenReviewStateAtDecision")
           SELECT r."releaseId", r."citationKey", r.citation, r."recordChecksum", 'revoked', 'kg4b-inject', 'unreviewed'
             FROM regulatory_release_records r WHERE r."releaseId"=$1 AND r."citationKey"=$2`, [RELEASE, key]);
      },
      teardown: async () => { await ds.query(`DELETE FROM regulatory_release_record_reviews WHERE "reviewerId"='kg4b-inject'`); },
      expectBacking: 'UNAPPROVED_RECORD', expectHealth: 'OK', expectMismatch: 'GOVERNED_UNAPPROVED',
    },
  ];

  for (const injection of INJECTIONS) {
    await injection.setup();
    const context = await GovernedCutoverContext.create({
      dataSource: ds, principal: PRINCIPAL, analysisTraceId: `kg4b-inject-${injection.name}`, env: SHADOW_ENV,
    });
    let threw = false; let decision: any = null;
    try {
      decision = await context!.resolveStandard({
        citation: approvedCitation, applicabilityStatus: 'SUPPORTED', findingKey: 'inj',
        legacyText: 'legacy body', legacyBackingState: 'UNAPPROVED_CONTENT',
      });
    } catch { threw = true; }
    assert(!threw, `[${injection.name}] SHADOW did not throw — an expected failure is never a customer 500`);
    if (threw) { await injection.teardown(); continue; }

    assert(decision.resolution.backing === injection.expectBacking,
      `[${injection.name}] backing = ${injection.expectBacking} (got ${decision.resolution.backing})`);
    assert(decision.resolution.health === injection.expectHealth,
      `[${injection.name}] health = ${injection.expectHealth} (got ${decision.resolution.health})`);
    assert(decision.governedBackingInput === null && decision.verifiedText === null && decision.customerVisible === false,
      `[${injection.name}] HARD: the customer stays on LEGACY — no backing input, no text, no key`);
    assert(toGovernedBackingInput(decision.resolution) === null || injection.expectBacking !== 'RESOLVER_UNAVAILABLE',
      `[${injection.name}] a failed resolution cannot be laundered into an approval`);

    const records = context!.shadowComparisons();
    assert(records.length === 1, `[${injection.name}] exactly one comparison record was emitted`);
    assert(records[0].mismatch === injection.expectMismatch,
      `[${injection.name}] telemetry reports ${injection.expectMismatch} (got ${records[0].mismatch})`);
    assert(records[0].customerOutputUnchanged === true,
      `[${injection.name}] the record still asserts customer output unchanged`);

    // And the fallback contract has a defined row for the state in the real governed mode too.
    const fallback = decideFallback('GOVERNED_WITH_FALLBACK', 'SUPPORTED', decision.resolution.backing);
    assert(fallback.showCitation && Boolean(fallback.deliveryState),
      `[${injection.name}] GOVERNED_WITH_FALLBACK keeps the citation and has a defined delivery state`);

    await injection.teardown();
  }

  // Resolver failure with no data source at all.
  const noSourcePin = await pinGovernedRelease(null, 'SHADOW');
  const noSourceResult = await resolveGoverned(null, noSourcePin, approvedCitation);
  assert(noSourceResult.backing === 'RESOLVER_UNAVAILABLE',
    'a governance outage with no data source is RESOLVER_UNAVAILABLE, not "no record"');
  assert(classifyShadowComparison({
    governed: noSourceResult, legacyCitation: approvedCitation, legacyText: 'x',
    legacyBackingState: 'UNAPPROVED_CONTENT', applicability: 'SUPPORTED',
  }).mismatch === 'RESOLVER_FAILURE', 'and it classifies as RESOLVER_FAILURE');

  await ds.destroy();

  // ---------------------------------------------------------------- source integrity
  section('Database ownership — the read-only source is provably unchanged');
  assert(psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records') === sourceRecords,
    `HARD: source record count unchanged (${sourceRecords})`);
  assert(psql(SOURCE_DB, `SELECT coalesce(max("releaseId"),'none') FROM regulatory_releases WHERE status='active'`) === sourceActive,
    `HARD: the source's active release is unchanged (${sourceActive})`);
  assert(psql(SOURCE_DB, `SELECT count(*) FROM regulatory_release_record_reviews WHERE "reviewerId" IN ('kg4b-test','kg4b-inject')`) === '0',
    'HARD: no KG-4B fixture decision leaked into the source corpus');
  assert(psql(SOURCE_DB, `SELECT count(*) FROM information_schema.tables WHERE table_name='regulatory_release_record_reviews_x'`) === '0',
    'HARD: the source schema was never renamed');

  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);
  console.log(`\nowned database '${OWNED_DB}' dropped`);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
