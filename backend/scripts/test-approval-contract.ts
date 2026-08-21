/**
 * KG-3F (Phases 8-10) -- the approval/provenance contract matrix.
 *
 * KG-3E measured that editing `source_url` or `retrieval_date` did not move the reviewer-bound
 * checksum, and deliberately declined to rule on whether that was correct. It was UNDECIDED: the
 * approval binding was `recordChecksum`, which is the release MANIFEST identity, so the approval
 * contract was whatever the manifest projection happened to contain.
 *
 * This asserts the contract as DECIDED, not as observed. Every expectation below is derived from
 * what the field means to a reviewer, and several of them FAILED against the pre-KG-3F
 * implementation -- notably paragraph granularity and deprecation status, which a reviewer's
 * approval plainly depends on and which the manifest projection never covered.
 *
 * Two surfaces, because they answer different questions:
 *   PART 1 -- the contract itself, in memory. Ten enumerated change classes, each classified
 *             REMAIN_EFFECTIVE or BECOME_INEFFECTIVE, plus the axis attribution.
 *   PART 2 -- the implementation, against a disposable database. That the contract is actually
 *             what finalization writes, what a decision binds to, what carry-forward matches on,
 *             and what drift detection compares.
 *
 * Usage: DATABASE_URL=postgresql://…/test_kg3f_contract_20260820 npx ts-node scripts/test-approval-contract.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { execFileSync } from 'child_process';
import {
  APPROVAL_CONTRACT_VERSION,
  TRANSPORT_METADATA_FIELDS,
  canonicalDigest,
  classifyApprovalDelta,
  computeApprovalIdentity,
} from '../src/standards/releases/approval-contract';
import { normalizeStandardRecord } from '../src/standards/releases/release-manifest';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';

const checks: string[] = [];
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}

/** A representative approved regulatory record, in the shape the finalizer normalizes to. */
const BASE_ROW = Object.freeze({
  id: '00000000-0000-0000-0000-000000000001',
  agency_code: 'OSHA',
  citation: '29 CFR 1910.212(a)(1)',
  part_number: '1910',
  subpart: 'O',
  title: 'Machine guarding — types of guarding',
  standard_text: 'One or more methods of machine guarding shall be provided to protect the '
    + 'operator and other employees in the machine area from hazards.',
  plain_language_summary: 'Machines must be guarded to protect operators from hazards.',
  scope_code: 'general_industry',
  source_key: 'ecfr:29:1910.212',
  source_name: 'Occupational Safety and Health Administration',
  source_type: 'codified_regulation',
  authority_tier: 1,
  allowed_use: 'quote_and_cite',
  hazard_codes: 'machine_guarding',
  required_controls: 'guard,barrier',
  keywords: 'machine,guard,point of operation',
  severity_weight: 4,
  is_active: true,
  effective_date: '1974-06-27',
  revision_date: '2011-05-14',
  deprecation_status: 'active',
  superseded_by_citation: null,
  applicability_schema_version: 'hazlenz-applicability-v1',
  source_publication_date: '2026-01-01',
  source_document_checksum: 'a'.repeat(64),
  transformation_version: 'standards-release-normalizer-v1',
  source_url: 'https://www.ecfr.gov/current/title-29/section-1910.212',
  retrieval_date: '2026-07-30',
});

/**
 * The ten enumerated change classes the contract must rule on.
 *
 * `expect` is the CONTRACT's answer, written from the field's meaning. Where the pre-KG-3F
 * implementation disagreed, the note says so -- those are the defects this phase fixes rather
 * than expectations reverse-engineered from behavior.
 */
const MATRIX: Array<{
  n: number; name: string; mutate: Record<string, unknown>;
  expect: 'REMAIN_EFFECTIVE' | 'BECOME_INEFFECTIVE';
  axis: 'none' | 'substantive_content' | 'source_identity' | 'both';
  why: string;
}> = [
  { n: 1, name: 'regulatory text', mutate: { standard_text: 'Guarding shall be provided at the point of operation only.' },
    expect: 'BECOME_INEFFECTIVE', axis: 'substantive_content',
    why: 'the obligation itself is different' },
  { n: 2, name: 'title', mutate: { title: 'Machine guarding — general requirements' },
    expect: 'BECOME_INEFFECTIVE', axis: 'substantive_content',
    why: 'the codified heading identifies the provision' },
  { n: 3, name: 'canonical citation', mutate: { citation: '29 CFR 1910.212(a)(3)(ii)' },
    expect: 'BECOME_INEFFECTIVE', axis: 'substantive_content',
    why: 'a different citation is a different duty' },
  { n: 4, name: 'paragraph granularity (part/subpart)', mutate: { part_number: '1926', subpart: 'I' },
    expect: 'BECOME_INEFFECTIVE', axis: 'substantive_content',
    why: 'DEFECT FIXED: v1 covered `citation` but not the structural columns, so a record could '
      + 'be re-scoped from general industry to construction with its approval intact' },
  { n: 5, name: 'jurisdiction / regime', mutate: { agency_code: 'MSHA' },
    expect: 'BECOME_INEFFECTIVE', axis: 'substantive_content',
    why: 'the regime determines whom the duty binds' },
  { n: 6, name: 'legally meaningful source identity (document checksum + edition)',
    mutate: { source_document_checksum: 'b'.repeat(64), source_publication_date: '2026-06-01' },
    expect: 'BECOME_INEFFECTIVE', axis: 'source_identity',
    why: 'the artifact relied on is not the artifact now held' },
  { n: 7, name: 'source registry key', mutate: { source_key: 'govinfo:29:1910.212' },
    expect: 'BECOME_INEFFECTIVE', axis: 'source_identity',
    why: 'the registry key names which authoritative dataset the record is attested to' },
  { n: 8, name: 'equivalent authoritative URL', mutate: { source_url: 'https://www.govinfo.gov/app/details/CFR-2026-title29-vol5/CFR-2026-title29-vol5-sec1910-212' },
    expect: 'REMAIN_EFFECTIVE', axis: 'none',
    why: 'a mirror path to the SAME artifact; the document checksum is unmoved, so nothing the '
      + 'reviewer read has changed. Binding approval to the URL would revoke the corpus on every '
      + 'mirror migration' },
  { n: 9, name: 'retrieval date only', mutate: { retrieval_date: '2026-08-20' },
    expect: 'REMAIN_EFFECTIVE', axis: 'none',
    why: 're-fetching an unchanged regulation later does not change one word of it' },
  { n: 10, name: 'irrelevant transport metadata', mutate: { created_at: '2026-08-20T00:00:00Z', updated_at: '2026-08-20T00:00:00Z' },
    expect: 'REMAIN_EFFECTIVE', axis: 'none',
    why: 'describes the copy, not the content' },
];

function partOne() {
  console.log('\n=== PART 1 — the contract, in memory\n');
  const base = computeApprovalIdentity(BASE_ROW);

  for (const c of MATRIX) {
    const after = computeApprovalIdentity({ ...BASE_ROW, ...c.mutate });
    const delta = classifyApprovalDelta(base, after);
    assert(delta.effect === c.expect,
      `CC-${c.n} ${c.name}: ${delta.effect} (contract requires ${c.expect} — ${c.why})`);
    assert(delta.axis === c.axis,
      `CC-${c.n} ${c.name}: axis '${delta.axis}' (expected '${c.axis}')`);
    // A BECOME_INEFFECTIVE verdict must move the composed digest, not merely an axis digest --
    // that composition is what an approval actually names.
    assert(c.expect === 'BECOME_INEFFECTIVE'
      ? base.approvalDigest !== after.approvalDigest
      : base.approvalDigest === after.approvalDigest,
      `CC-${c.n} ${c.name}: composed approvalDigest ${c.expect === 'BECOME_INEFFECTIVE' ? 'moved' : 'held'}`);
  }

  // The axis split has to be real, or the two-digest model buys nothing over one hash.
  const contentOnly = computeApprovalIdentity({ ...BASE_ROW, standard_text: 'different' });
  assert(contentOnly.sourceIdentityDigest === base.sourceIdentityDigest,
    'AX-1 a pure content change leaves the source-identity digest untouched');
  const sourceOnly = computeApprovalIdentity({ ...BASE_ROW, source_key: 'other:key' });
  assert(sourceOnly.substantiveContentDigest === base.substantiveContentDigest,
    'AX-2 a pure source-identity change leaves the substantive-content digest untouched');
  assert(base.approvalContractVersion === APPROVAL_CONTRACT_VERSION,
    `AX-3 identity carries the contract version (v${APPROVAL_CONTRACT_VERSION})`);
  // The version is folded into each projection, so a contract change cannot silently collide with
  // a v1 digest and let an old approval appear to name new semantics.
  assert(base.approvalPayload.substantiveContent.contractVersion === APPROVAL_CONTRACT_VERSION
    && base.approvalPayload.sourceIdentity.contractVersion === APPROVAL_CONTRACT_VERSION,
    'AX-4 the contract version is folded into both digests, so v2 can never collide with v1');

  // Transport fields must be absent from BOTH projections -- not merely equal in them. Equality
  // would be an accident of the fixture; absence is the contract.
  const projected = new Set([
    ...Object.keys(base.approvalPayload.substantiveContent),
    ...Object.keys(base.approvalPayload.sourceIdentity),
  ].map(k => k.toLowerCase()));
  for (const field of TRANSPORT_METADATA_FIELDS) {
    const camel = field.replace(/_(.)/g, (_, c) => c.toUpperCase());
    assert(!projected.has(camel.toLowerCase()),
      `TR-${field}: excluded from both approval projections by construction, not by equality`);
  }

  // The manifest identity must be untouched by all of this. If a v1 checksum moved, every
  // finalized release's integrity proof would have been invalidated to fix an approval defect.
  assert(normalizeStandardRecord(BASE_ROW as any).citation === BASE_ROW.citation,
    'V1-1 the v1 manifest projection still reads the same fields it always did');
  const v1Keys = Object.keys(normalizeStandardRecord(BASE_ROW as any)).sort().join(',');
  assert(v1Keys === 'active,agency,allowedUse,authorityTier,canonicalText,citation,controls,'
    + 'hazards,keywords,scope,severityWeight,sourceKey,sourceName,sourceType,summary,title',
    'V1-2 the v1 manifest field set is byte-for-byte unchanged (release history stays verifiable)');
}

const HOST = process.env.DB_HOST || 'localhost';
const USER = process.env.DB_USERNAME || process.env.USER || 'postgres';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_contract_20260820';
const WORK_DB = 'test_kg3f_contract_run';

function guard(db: string) {
  if (db === 'safescope' || !/^test_/.test(db)) throw new Error(`Refusing to touch database '${db}'.`);
}

/**
 * Provisioned fresh per run rather than reused. Part 2 deliberately EDITS the live corpus to
 * exercise drift detection (DB-15/16/17), so a reused database would carry those edits into the
 * next run and DB-14's "no drift yet" precondition would be false. A disposable clone keeps the
 * harness reproducible in either order.
 */
function provision(): string {
  guard(SOURCE_DB); guard(WORK_DB);
  try { execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', WORK_DB], { stdio: 'pipe' }); } catch { /* ignore */ }
  execFileSync('createdb', ['-h', HOST, '-U', USER, WORK_DB], { stdio: 'pipe' });
  // Shell pipe rather than a Node buffer: execFileSync's default maxBuffer truncates the dump.
  execFileSync('/bin/sh', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${WORK_DB}`],
    { stdio: 'pipe' });
  return `postgresql://${USER}@${HOST}/${WORK_DB}`;
}

async function partTwo() {
  console.log('\n=== PART 2 — the implementation, against a disposable database\n');
  const sourceName = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET')
    .pathname.replace('/', '');
  if (sourceName === 'safescope') throw new Error(`Refusing to run against database '${sourceName}'.`);

  const dbUrl = provision();
  console.log(`source corpus:            ${SOURCE_DB}`);
  console.log(`resolved target database: ${WORK_DB} (disposable, recreated per run)\n`);

  const RELEASE = 'federal-core-kg3f-contract.1';
  execFileSync('npx', ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'], {
    // DATABASE_URL is overridden explicitly: the repository's data-source honors it over the
    // discrete DB_* variables, so leaving the ambient value in place would point finalization at
    // the developer corpus.
    env: { ...process.env, DATABASE_URL: dbUrl,
      REGULATORY_RELEASE_ID: RELEASE, REGULATORY_RELEASE_VERSION: 'kg3f-contract.1' },
    stdio: 'pipe',
  });

  const ds = new DataSource({ type: 'postgres', url: dbUrl, entities: [], synchronize: false });
  await ds.initialize();
  try {
    const svc = new ReleaseRecordReviewService(ds);

    // --- finalization writes the approval identity ---
    const [counts] = await ds.query(
      `SELECT COUNT(*)::int AS total,
              COUNT("approvalDigest")::int AS with_digest,
              COUNT(DISTINCT "approvalContractVersion")::int AS versions
         FROM regulatory_release_records WHERE "releaseId" = $1`, [RELEASE]);
    assert(counts.total > 0 && counts.total === counts.with_digest,
      `DB-1 finalization stamps an approval digest on every record (${counts.with_digest}/${counts.total})`);

    // The digest must be reproducible from the frozen payload alone -- otherwise the release is
    // not re-verifiable without the mutable corpus, which is the property KG-3A established.
    const stored: any[] = await ds.query(
      `SELECT citation, "approvalDigest", "substantiveContentDigest", "sourceIdentityDigest",
              "approvalPayload"
         FROM regulatory_release_records WHERE "releaseId" = $1 ORDER BY citation`, [RELEASE]);
    // Recomputed from the payload AS READ BACK OUT OF JSONB -- key order already scrambled by
    // postgres. This is the assertion that forced the contract onto a canonical digest; with the
    // manifest's order-sensitive `digest()` it failed on all 34 records.
    const reproducible = stored.every(r =>
      canonicalDigest(r.approvalPayload.substantiveContent) === r.substantiveContentDigest
      && canonicalDigest(r.approvalPayload.sourceIdentity) === r.sourceIdentityDigest
      && canonicalDigest({ contractVersion: APPROVAL_CONTRACT_VERSION,
        substantiveContentDigest: r.substantiveContentDigest,
        sourceIdentityDigest: r.sourceIdentityDigest }) === r.approvalDigest);
    assert(reproducible,
      `DB-2 every stored approval digest recomputes from its frozen payload alone, after a jsonb `
      + `round-trip has reordered its keys (${stored.length} records)`);

    // --- a decision records what it bound to ---
    const [candidate] = await ds.query(
      `SELECT citation, "recordChecksum", "approvalDigest" FROM regulatory_release_records
        WHERE "releaseId" = $1 AND "reviewState" = 'mechanically_validated' ORDER BY citation LIMIT 1`,
      [RELEASE]);
    assert(!!candidate, 'DB-3 the release holds a record eligible for substantive review');

    if (candidate) {
      const approved = await svc.approveRecord({
        releaseId: RELEASE, citation: candidate.citation,
        expectedChecksum: candidate.recordChecksum,
        expectedApprovalDigest: candidate.approvalDigest,
        reviewerId: 'kg3f-contract-harness', reviewerRole: 'regulatory-analyst',
        note: 'KG-3F approval contract verification.',
      });
      assert(approved.outcome === 'approved', `DB-4 approval succeeds when both bindings match`);

      const [decision] = await ds.query(
        `SELECT "approvalContractVersion", "approvalDigest", "substantiveContentDigest",
                "sourceIdentityDigest"
           FROM regulatory_release_record_reviews WHERE id = $1`, [approved.decisionId]);
      assert(decision.approvalContractVersion === APPROVAL_CONTRACT_VERSION
        && decision.approvalDigest === candidate.approvalDigest,
        'DB-5 the decision row records the contract version and the digest it bound to');

      // A reviewer who read a DIFFERENT approval identity must be refused even though the
      // manifest checksum still matches. This is the gate v1 could not express.
      let refused = false; let gateNames: string[] = [];
      try {
        await svc.approveRecord({
          releaseId: RELEASE, citation: candidate.citation,
          expectedChecksum: candidate.recordChecksum,
          expectedApprovalDigest: 'c'.repeat(64),
          reviewerId: 'kg3f-contract-harness', note: 'should be refused',
        });
      } catch (err: any) {
        refused = err.name === 'ReleaseRecordReviewRefused';
        gateNames = err.failedGates ?? [];
      }
      assert(refused && gateNames.includes('approvalDigestMatches'),
        'DB-6 a stale approval-contract digest is refused by `approvalDigestMatches` even when '
        + 'the manifest checksum matches');
    }

    // --- carry-forward now matches on the approval digest, not the manifest digest ---
    const carry = await svc.describeCarryForwardCandidates(RELEASE);
    assert(carry.every(c => c.matchBasis === 'approval_contract' && !!c.approvalDigest),
      `DB-7 carry-forward candidates are matched on the approval contract, never on the manifest `
      + `checksum alone (${carry.length} candidates)`);

    // --- pre-contract approvals are surfaced for explicit reaffirmation, never carried silently ---
    // Simulate a v1-era approval: a decision row with no contract binding, exactly the shape the
    // migration leaves historical rows in.
    const [preContract] = await ds.query(
      `SELECT citation, "citationKey", "recordChecksum", "reviewState"
         FROM regulatory_release_records
        WHERE "releaseId" = $1 AND "reviewState" = 'mechanically_validated'
          AND citation <> $2 ORDER BY citation LIMIT 1`, [RELEASE, candidate?.citation ?? '']);
    if (preContract) {
      await ds.query(
        `INSERT INTO regulatory_release_record_reviews
           ("releaseId","citationKey",citation,"recordChecksum",decision,"reviewerId",
            "frozenReviewStateAtDecision","decidedAt")
         VALUES ($1,$2,$3,$4,'approved','v1-era-reviewer',$5, now() - interval '1 day')`,
        [RELEASE, preContract.citationKey, preContract.citation, preContract.recordChecksum,
          preContract.reviewState]);

      const reaffirm = await svc.describeContractReaffirmationCandidates(RELEASE);
      const hit = reaffirm.find(r => r.citation === preContract.citation);
      assert(!!hit && hit.priorContractVersion === null,
        'DB-8 an approval recorded without a contract binding is enumerated as a reaffirmation '
        + 'candidate rather than silently carried forward');
      assert(!!hit && hit.recordContractVersion === APPROVAL_CONTRACT_VERSION,
        'DB-9 the candidate reports both the prior (null) and current contract versions');

      // The historical row must still be there, unmodified, after being enumerated.
      const [survivor] = await ds.query(
        `SELECT "reviewerId", "approvalContractVersion" FROM regulatory_release_record_reviews
          WHERE "releaseId" = $1 AND "citationKey" = $2 AND "reviewerId" = 'v1-era-reviewer'`,
        [RELEASE, preContract.citationKey]);
      assert(survivor && survivor.approvalContractVersion === null,
        'DB-10 enumerating a candidate does not mutate, reinterpret or upgrade the historical decision');

      // Reaffirmation appends; it never edits.
      const before = Number((await ds.query(
        `SELECT COUNT(*)::int n FROM regulatory_release_record_reviews
          WHERE "releaseId" = $1 AND "citationKey" = $2`, [RELEASE, preContract.citationKey]))[0].n);
      const [recDigest] = await ds.query(
        `SELECT "approvalDigest" FROM regulatory_release_records
          WHERE "releaseId" = $1 AND "citationKey" = $2`, [RELEASE, preContract.citationKey]);
      // Already effectively approved, so an approve() is idempotent; revoke then re-approve is the
      // honest way to show the append-only carry-forward, and it is what the CLI does.
      await svc.revokeApproval({
        releaseId: RELEASE, citation: preContract.citation,
        expectedChecksum: preContract.recordChecksum, reviewerId: 'kg3f-contract-harness',
        note: 'Superseded by contract reaffirmation.' });
      const reaff = await svc.approveRecord({
        releaseId: RELEASE, citation: preContract.citation,
        expectedChecksum: preContract.recordChecksum,
        expectedApprovalDigest: recDigest.approvalDigest,
        reviewerId: 'kg3f-contract-harness', reviewerRole: 'regulatory-analyst',
        supersedesDecisionId: hit!.decisionId,
        note: 'Reaffirmed under approval contract v2.' });
      const after = Number((await ds.query(
        `SELECT COUNT(*)::int n FROM regulatory_release_record_reviews
          WHERE "releaseId" = $1 AND "citationKey" = $2`, [RELEASE, preContract.citationKey]))[0].n);
      assert(after === before + 2 && reaff.outcome === 'approved',
        `DB-11 reaffirmation APPENDS decisions and deletes none (${before} -> ${after})`);
      const [linked] = await ds.query(
        `SELECT "supersedesDecisionId", "approvalContractVersion"
           FROM regulatory_release_record_reviews WHERE id = $1`, [reaff.decisionId]);
      assert(linked.supersedesDecisionId === hit!.decisionId
        && linked.approvalContractVersion === APPROVAL_CONTRACT_VERSION,
        'DB-12 the reaffirming decision points at the decision it supersedes and carries v2');
      assert((await svc.describeContractReaffirmationCandidates(RELEASE))
        .every(r => r.citation !== preContract.citation),
        'DB-13 a reaffirmed record leaves the candidate list');
    }

    // --- live-corpus drift, classified by axis ---
    assert((await svc.describeLiveCorpusDrift(RELEASE)).length === 0,
      'DB-14 no drift is reported while the live corpus still matches what was approved');

    if (candidate) {
      // A transport-only edit to the LIVE row: the exact KG-3E observation, now an asserted property.
      await ds.query(
        `UPDATE standards_master SET source_url = $2, retrieval_date = $3 WHERE citation = $1`,
        [candidate.citation, 'https://www.govinfo.gov/mirror/equivalent', '2026-08-20']);
      assert((await svc.describeLiveCorpusDrift(RELEASE)).length === 0,
        'DB-15 editing source_url and retrieval_date on the live row reports NO drift — the '
        + 'KG-3E observation, now an intended and tested property');

      // A granularity edit: invisible to the manifest checksum, fatal to the approval.
      await ds.query(`UPDATE standards_master SET subpart = 'ZZ' WHERE citation = $1`, [candidate.citation]);
      const drift = await svc.describeLiveCorpusDrift(RELEASE);
      const g = drift.find(d => d.citation === candidate.citation);
      assert(!!g && g.effect === 'BECOME_INEFFECTIVE' && g.axis === 'substantive_content'
        && g.changedFields.includes('subpart'),
        'DB-16 a live granularity edit is reported as BECOME_INEFFECTIVE on the substantive axis '
        + '— the change the manifest checksum cannot see');

      // A source-identity edit must be attributed to the OTHER axis, so a provenance correction
      // is never mistaken for a regulatory revision.
      await ds.query(`UPDATE standards_master SET subpart = 'O', source_key = $2 WHERE citation = $1`,
        [candidate.citation, 'govinfo:29:1910.212']);
      const drift2 = await svc.describeLiveCorpusDrift(RELEASE);
      const s = drift2.find(d => d.citation === candidate.citation);
      assert(!!s && s.axis === 'source_identity' && s.changedFields.includes('sourceKey'),
        'DB-17 a live source-registry-key edit is attributed to the source-identity axis, not to '
        + 'the regulatory-content axis');
    }
  } finally {
    await ds.destroy();
  }
}

async function main() {
  partOne();
  await partTwo();
  console.log(`\n${checks.length} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
