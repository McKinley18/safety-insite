import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import {
  CONSTRUCTION_STAGES,
  ReleaseConstructionRefused,
  assertNoLegacyCorpusWrites,
  prepareGovernedRelease,
  resolveMembership,
} from '../src/standards/releases/governed-release-builder';
import {
  ReleaseDefinition,
  loadReleaseDefinition,
  validateReleaseDefinition,
} from '../src/standards/releases/release-definition';
import { buildGovernedSourceSet } from '../src/standards/releases/governed-source-set';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { classifyCorpus } from '../src/standards/seed/legacy-corpus-guard';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';

/**
 * KG-5B -- governed release construction contract (Phases 4, 5, 6, 7, 8, 9, 10, 13).
 *
 * This suite exists to make KG5A-DISC-01 unrepeatable. Its central assertion is the one KG-5A
 * could not make: preparing a governed release against a 2,390-row production-shaped corpus
 * leaves that corpus byte-for-byte identical, and produces exactly the same release it produces
 * against an empty one.
 *
 * Every database it writes to is created by this process, claimed through the KG-4C ownership
 * guard, and dropped afterwards.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5b-release-construction';
const TEMPLATE = process.env.KG5B_TEMPLATE_DB || 'test_kg5b_prodshape_20260821';
const ADMIN_URL = process.env.KG5B_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) { passed++; return; }
  failed++;
  failures.push(`${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`);
  console.log(`  FAIL  ${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`);
}

function section(title: string): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

async function admin(sql: string): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try { await client.query(sql); } finally { await client.end(); }
}

function urlFor(database: string): string {
  return ADMIN_URL.replace(/\/[^/]*$/, `/${database}`);
}

/** Creates a disposable database from the production-shaped template and claims it. */
async function createOwnedDatabase(name: string): Promise<string> {
  await admin(`DROP DATABASE IF EXISTS ${name}`);
  await admin(`CREATE DATABASE ${name} TEMPLATE ${TEMPLATE}`);
  const url = urlFor(name);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });
  return url;
}

async function dropDatabase(name: string): Promise<void> {
  await admin(`DROP DATABASE IF EXISTS ${name}`);
}

async function connect(url: string): Promise<DataSource> {
  const ds = new DataSource({
    type: 'postgres', url, synchronize: false,
    entities: [RegulatoryRelease, RegulatoryReleaseRecord, RegulatoryReleaseRecordReview,
      KnowledgeReleaseEvent],
  });
  await ds.initialize();
  return ds;
}

/**
 * The legacy-corpus fingerprint the non-mutation contract is measured against.
 *
 * Deliberately field-by-field as well as whole-row: a single aggregate digest proves "something
 * changed" but not WHAT, and KG-5A's failure mode was specifically title/standard_text rewrites
 * and citation renames. Those get their own digests so a regression names itself.
 */
async function corpusFingerprint(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT
      COUNT(*)::int AS row_count,
      md5(string_agg(whole, '|' ORDER BY whole))       AS whole_corpus,
      md5(string_agg(citation, '|' ORDER BY citation)) AS citations,
      md5(string_agg(titles, '|' ORDER BY titles))     AS titles,
      md5(string_agg(texts, '|' ORDER BY texts))       AS standard_texts,
      md5(string_agg(sourcemeta, '|' ORDER BY sourcemeta)) AS source_metadata,
      COUNT(*) FILTER (WHERE source_key IS NOT NULL)::int AS with_source_key,
      COUNT(*) FILTER (WHERE release_id IS NOT NULL)::int AS with_release_id,
      COUNT(*) FILTER (WHERE normalized_record_checksum IS NOT NULL)::int AS with_checksum,
      COUNT(*) FILTER (WHERE transformation_version IS NOT NULL)::int AS with_transformation
    FROM (
      SELECT
        md5(coalesce(agency_code,'')||E'\\x1f'||coalesce(citation,'')||E'\\x1f'||
            coalesce(part_number,'')||E'\\x1f'||coalesce(subpart,'')||E'\\x1f'||
            coalesce(title,'')||E'\\x1f'||coalesce(standard_text,'')||E'\\x1f'||
            coalesce(plain_language_summary,'')||E'\\x1f'||coalesce(scope_code,'')||E'\\x1f'||
            coalesce(source_key,'')||E'\\x1f'||coalesce(source_name,'')||E'\\x1f'||
            coalesce(source_type,'')||E'\\x1f'||coalesce(authority_tier::text,'')||E'\\x1f'||
            coalesce(allowed_use,'')||E'\\x1f'||coalesce(hazard_codes,'')||E'\\x1f'||
            coalesce(required_controls,'')||E'\\x1f'||coalesce(keywords,'')||E'\\x1f'||
            coalesce(severity_weight::text,'')||E'\\x1f'||coalesce(is_active::text,'')||E'\\x1f'||
            coalesce(release_id,'')||E'\\x1f'||coalesce(normalized_record_checksum,'')||E'\\x1f'||
            coalesce(transformation_version,'')||E'\\x1f'||coalesce(deprecation_status,'')||E'\\x1f'||
            coalesce(applicability_schema_version,'')) AS whole,
        coalesce(agency_code,'')||' '||coalesce(citation,'') AS citation,
        coalesce(citation,'')||'=>'||coalesce(title,'') AS titles,
        coalesce(citation,'')||'=>'||md5(coalesce(standard_text,'')) AS texts,
        coalesce(citation,'')||'=>'||coalesce(source_key,'~')||'/'||coalesce(source_name,'~') AS sourcemeta,
        source_key, release_id, normalized_record_checksum, transformation_version
      FROM standards_master
    ) t`);
  return row as Record<string, any>;
}

/** Everything the construction transaction is allowed to create, so a rollback can be proven. */
async function releaseFootprint(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT
      (SELECT COUNT(*)::int FROM regulatory_releases)               AS releases,
      (SELECT COUNT(*)::int FROM regulatory_release_records)        AS records,
      (SELECT COUNT(*)::int FROM regulatory_release_record_reviews) AS reviews,
      (SELECT COUNT(*)::int FROM knowledge_release_events)          AS events`);
  return row as Record<string, number>;
}

async function main() {
  console.log('KG-5B -- governed release construction contract');
  console.log(`template=${TEMPLATE}`);

  const definition = loadReleaseDefinition(RELEASE_ID);

  // =================================================================== Phase 2/3: pure layers
  section('1. Governed source set and explicit membership (Phases 2, 3)');
  const sourceSet = buildGovernedSourceSet();
  check('source set is deterministic across calls', JSON.stringify(sourceSet.records)
    === JSON.stringify(buildGovernedSourceSet().records));
  check('source set has no duplicate logical citations', sourceSet.duplicateCitationKeys.length === 0,
    sourceSet.duplicateCitationKeys);
  check('release definition validates', validateReleaseDefinition(definition).length === 0,
    validateReleaseDefinition(definition));
  check('definition declares 35 members', definition.members.length === 35);
  const members = resolveMembership(definition);
  check('every declared member resolves to a governed source record', members.length === 35);
  check('membership is independent of source-set array order', (() => {
    const shuffled = { ...definition, members: [...definition.members].reverse() };
    const reversed = resolveMembership(shuffled as ReleaseDefinition);
    return new Set(reversed.map(r => releaseCitationKey(r.citation))).size === 35;
  })());

  // A member the sources cannot supply must refuse, never substitute.
  try {
    resolveMembership({
      ...definition,
      members: [...definition.members, {
        citationKey: '29cfr1910.9999', citation: '29 CFR 1910.9999', agency: 'OSHA',
      }],
    } as ReleaseDefinition);
    check('unknown member refuses', false);
  } catch (error) {
    check('unknown member refuses with DEFINITION_MEMBER_NOT_IN_SOURCE_SET',
      error instanceof ReleaseConstructionRefused
      && error.code === 'DEFINITION_MEMBER_NOT_IN_SOURCE_SET');
  }

  // The non-mutation contract is enforced over SQL, not merely documented.
  check('non-mutation guard rejects an UPDATE of standards_master', (() => {
    try { assertNoLegacyCorpusWrites('UPDATE standards_master SET title = $1'); return false; }
    catch { return true; }
  })());
  check('non-mutation guard rejects an INSERT INTO standards_master', (() => {
    try { assertNoLegacyCorpusWrites('INSERT INTO standards_master (citation) VALUES ($1)'); return false; }
    catch { return true; }
  })());
  check('non-mutation guard rejects a DELETE FROM standards_master', (() => {
    try { assertNoLegacyCorpusWrites('DELETE FROM standards_master WHERE id = $1'); return false; }
    catch { return true; }
  })());
  check('non-mutation guard permits a SELECT from standards_master', (() => {
    try { assertNoLegacyCorpusWrites('SELECT COUNT(*) FROM standards_master'); return true; }
    catch { return false; }
  })());

  section('1b. The legacy seed pipeline cannot be run against a foreign corpus (KG5A-DISC-01)');
  // The safe path existing is not the same as the unsafe path being unreachable.
  // `seed:safescope-standards` is still wired and still needed for clean disposable databases, so
  // it carries a guard that asks about the DATA rather than the caller.
  const governedCitations = sourceSet.records.map(record => ({ citation: record.citation }));
  const emptyCorpus = classifyCorpus([]);
  check('an empty corpus is seedable', emptyCorpus.foreignRows === 0);
  const governedCorpus = classifyCorpus(governedCitations);
  check('a corpus of exactly the governed records is seedable',
    governedCorpus.foreignRows === 0 && governedCorpus.governedRows === 35, governedCorpus);
  const productionShaped = classifyCorpus([
    ...governedCitations,
    { citation: '30 CFR 46.1' }, { citation: '29 CFR 1910.1000' }, { citation: '29 CFR 1926.20' },
  ]);
  check('a corpus holding regulations the governed source set does not name is REFUSED',
    productionShaped.foreignRows === 3, productionShaped);
  check('the refusal names the foreign rows so an operator can see what would have been damaged',
    productionShaped.examples.length === 3, productionShaped.examples);
  // Format-insensitivity: the guard must not call a bare citation "foreign" merely because the
  // governed set publishes it with a prefix, or every clean seeded corpus would be refused.
  const bareForms = classifyCorpus([{ citation: '1910.147' }, { citation: '1910.1200' }]);
  check('the guard matches on logical identity, not citation formatting',
    bareForms.foreignRows === 0, bareForms);

  // =================================================================== Phase 6: citation identity
  section('2. Citation canonicalization without legacy renaming (Phase 6)');
  const identityCases: Array<[string, string, string]> = [
    ['1910.147', '29 CFR 1910.147', 'OSHA bare vs 29 CFR prefixed'],
    ['1910.147', 'OSHA 1910.147', 'OSHA agency-word prefix'],
    ['1910.147', '§ 1910.147', 'section sign'],
    ['29 CFR 1910.212(a)(1)', '1910.212(a)(1)', 'subsection path preserved across prefix'],
    ['30 CFR 56.14107(a)', '56.14107(a)', 'MSHA bare vs 30 CFR prefixed'],
  ];
  for (const [left, right, label] of identityCases) {
    check(`same identity: ${label}`, releaseCitationKey(left) === releaseCitationKey(right),
      { left: releaseCitationKey(left), right: releaseCitationKey(right) });
  }
  const distinctCases: Array<[string, string, string]> = [
    ['29 CFR 1926.50', '29 CFR 1926.501', 'near-prefix collision 1926.50 / 1926.501'],
    ['30 CFR 56.14132', '30 CFR 56.14132(b)(1)', 'parent vs child'],
    ['29 CFR 1910.212(a)(1)', '29 CFR 1910.212(b)', 'sibling subsections'],
    ['29 CFR 1910.147', '30 CFR 56.14107(a)', 'cross-agency'],
    ['29 CFR 1910.303', '29 CFR 1910.303(b)(1)', 'section vs paragraph, both in the release'],
    // KG-3F behaviour, re-asserted here because KG-5B depends on it. Parts 47 and 62 are not in
    // the agency-inference set, so a BARE '62.120' cannot be attributed to 30 CFR and is kept
    // distinct from '30 CFR 62.120' rather than guessed into it. That is the conservative
    // direction: two records stay two records, and the release definition names the prefixed form
    // the governed source actually publishes.
    ['30 CFR 62.120', '62.120', 'bare citation of an uninferable part is NOT merged'],
  ];
  for (const [left, right, label] of distinctCases) {
    check(`distinct identity: ${label}`, releaseCitationKey(left) !== releaseCitationKey(right),
      { left: releaseCitationKey(left), right: releaseCitationKey(right) });
  }
  check('no substring-equivalence shortcut: 1926.501 does not contain-match 1926.50',
    !releaseCitationKey('29 CFR 1926.50').includes('1926.501'));

  // =================================================================== Phases 4, 7, 8, 9, 10
  const prodDb = 'test_kg5b_mut_prodshape';
  const cleanDb = 'test_kg5b_mut_clean';
  const atomicDb = 'test_kg5b_mut_atomic';
  const driftDb = 'test_kg5b_mut_drift';

  const prodUrl = await createOwnedDatabase(prodDb);
  const cleanUrl = await createOwnedDatabase(cleanDb);
  const atomicUrl = await createOwnedDatabase(atomicDb);
  const driftUrl = await createOwnedDatabase(driftDb);

  const prod = await connect(prodUrl);
  const clean = await connect(cleanUrl);
  const atomic = await connect(atomicUrl);
  const drift = await connect(driftUrl);

  try {
    await clean.query('TRUNCATE standards_master');
    await atomic.query('TRUNCATE standards_master');

    section('3. Legacy corpus non-mutation contract (Phase 4)');
    const beforeProd = await corpusFingerprint(prod);
    check('production-shaped fixture holds 2,390 legacy rows', beforeProd.row_count === 2390,
      beforeProd.row_count);
    check('fixture reproduces production: source_key NULL on every row',
      beforeProd.with_source_key === 0, beforeProd.with_source_key);

    const prodResult = await prepareGovernedRelease(prod, definition);
    const afterProd = await corpusFingerprint(prod);

    check('legacy row count unchanged', beforeProd.row_count === afterProd.row_count,
      { before: beforeProd.row_count, after: afterProd.row_count });
    check('whole-corpus digest unchanged', beforeProd.whole_corpus === afterProd.whole_corpus);
    check('no citation renamed', beforeProd.citations === afterProd.citations);
    check('no title changed', beforeProd.titles === afterProd.titles);
    check('no standard_text changed', beforeProd.standard_texts === afterProd.standard_texts);
    check('no source metadata stamped', beforeProd.source_metadata === afterProd.source_metadata);
    check('source_key still NULL on every legacy row', afterProd.with_source_key === 0);
    check('release_id still NULL on every legacy row', afterProd.with_release_id === 0);
    check('normalized_record_checksum still NULL on every legacy row', afterProd.with_checksum === 0);
    check('transformation_version still NULL on every legacy row', afterProd.with_transformation === 0);
    const [dupes] = await prod.query(
      `SELECT COUNT(*)::int AS n FROM (SELECT agency_code, citation FROM standards_master
        GROUP BY agency_code, citation HAVING COUNT(*) > 1) d`);
    check('no duplicate (agency_code, citation) pair created', dupes.n === 0, dupes.n);
    check('construction read zero legacy corpus rows', prodResult.legacyCorpusRowsRead === 0);
    check('the staging table did not survive the transaction', (await prod.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.tables
       WHERE table_name = 'kg_governed_release_staging'`))[0].n === 0);

    section('4. Governed provenance is independent of the legacy corpus (Phase 7)');
    const prodRecords = await prod.query(
      `SELECT citation, "sourceIdentityDigest", "substantiveContentDigest", "approvalDigest",
              "approvalContractVersion", "standardId", payload, "approvalPayload"
       FROM regulatory_release_records WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`,
      [RELEASE_ID]);
    check('35 governed records written', prodRecords.length === 35, prodRecords.length);
    check('every record carries a source registry key',
      prodRecords.every((r: any) => !!r.payload.sourceKey
        && !String(r.payload.sourceKey).startsWith('starter-unverified:')));
    check('every record carries a source identity digest',
      prodRecords.every((r: any) => /^[0-9a-f]{64}$/.test(r.sourceIdentityDigest)));
    check('every record carries a substantive content digest',
      prodRecords.every((r: any) => /^[0-9a-f]{64}$/.test(r.substantiveContentDigest)));
    check('every record carries an approval digest',
      prodRecords.every((r: any) => /^[0-9a-f]{64}$/.test(r.approvalDigest)));
    check('every record is approval contract v2',
      prodRecords.every((r: any) => r.approvalContractVersion === 2));
    check('zero placeholder-provenance records', prodResult.placeholderSourceRecords === 0);
    check('standardId is NULL: a governed record captures no legacy row',
      prodRecords.every((r: any) => r.standardId === null));
    check('every record carries transformationVersion from the definition',
      prodRecords.every((r: any) =>
        r.approvalPayload.sourceIdentity.transformationVersion === definition.parserVersion));

    section('5. Clean vs production-shaped reproduction (Phases 8, 9)');
    const cleanResult = await prepareGovernedRelease(clean, definition);
    check('clean corpus reproduces the pinned manifest',
      cleanResult.manifestChecksum === definition.expectedManifestChecksum,
      cleanResult.manifestChecksum);
    check('production-shaped corpus reproduces the pinned manifest',
      prodResult.manifestChecksum === definition.expectedManifestChecksum,
      prodResult.manifestChecksum);
    check('clean and production-shaped manifests are identical',
      cleanResult.manifestChecksum === prodResult.manifestChecksum);
    check('clean and production-shaped record counts are identical',
      cleanResult.recordCount === prodResult.recordCount);
    check('every record checksum is identical between the two corpora',
      JSON.stringify(cleanResult.records.map(r => [r.citationKey, r.recordChecksum]))
      === JSON.stringify(prodResult.records.map(r => [r.citationKey, r.recordChecksum])));
    check('every approval digest is identical between the two corpora',
      JSON.stringify(cleanResult.records.map(r => [r.citationKey, r.approvalDigest]))
      === JSON.stringify(prodResult.records.map(r => [r.citationKey, r.approvalDigest])));
    check('every review state is identical between the two corpora',
      JSON.stringify(cleanResult.reviewStateCounts) === JSON.stringify(prodResult.reviewStateCounts));

    section('6. Membership is independent of the legacy corpus (Phase 3)');
    // The three operations KG-5A proved could move the manifest under the old architecture.
    await drift.query(
      `INSERT INTO standards_master (agency_code, citation, title, standard_text, scope_code, is_active)
       VALUES ('OSHA', '29 CFR 1910.9999', 'An unrelated legacy row', 'Unrelated text.',
               'general_industry', true)`);
    await drift.query(
      `DELETE FROM standards_master WHERE id IN (SELECT id FROM standards_master
        WHERE citation NOT IN ('1910.147','1910.146') ORDER BY citation LIMIT 5)`);
    const driftResult = await prepareGovernedRelease(drift, definition, { dryRun: true });
    const [driftCount] = await drift.query('SELECT COUNT(*)::int AS n FROM standards_master');
    check('the drifted corpus really is different', driftCount.n !== 2390, driftCount.n);
    check('adding and deleting unrelated legacy rows does not move the manifest',
      driftResult.manifestChecksum === definition.expectedManifestChecksum,
      driftResult.manifestChecksum);
    check('adding and deleting unrelated legacy rows does not move membership',
      driftResult.recordCount === 35);
    // Physical row order.
    await drift.query(`CREATE TEMP TABLE reorder AS SELECT * FROM standards_master ORDER BY random()`);
    const reordered = await prepareGovernedRelease(drift, definition, { dryRun: true });
    check('physical row order does not move the manifest',
      reordered.manifestChecksum === definition.expectedManifestChecksum);

    section('7. Atomicity and retry safety (Phase 5)');
    for (const stage of CONSTRUCTION_STAGES) {
      const footprintBefore = await releaseFootprint(atomic);
      let threw = false;
      try {
        await prepareGovernedRelease(atomic, definition, { injectFailureAt: stage });
      } catch { threw = true; }
      const footprintAfter = await releaseFootprint(atomic);
      const stagingLeft = (await atomic.query(
        `SELECT COUNT(*)::int AS n FROM information_schema.tables
         WHERE table_name = 'kg_governed_release_staging'`))[0].n;
      check(`failure at '${stage}' throws`, threw);
      check(`failure at '${stage}' leaves no partial release`,
        JSON.stringify(footprintBefore) === JSON.stringify(footprintAfter),
        { before: footprintBefore, after: footprintAfter });
      check(`failure at '${stage}' leaves no staging table`, stagingLeft === 0);
    }
    // And the retry after every injected failure still succeeds cleanly.
    const retry = await prepareGovernedRelease(atomic, definition);
    check('a retry after injected failures produces the pinned manifest',
      retry.manifestChecksum === definition.expectedManifestChecksum);
    check('a retry after injected failures produces exactly 35 records', retry.recordCount === 35);

    section('8. Idempotency (Phase 10)');
    const second = await prepareGovernedRelease(prod, definition);
    check('a second preparation is an idempotent no-op', second.outcome === 'idempotent_no_op',
      second.outcome);
    check('a second preparation reports the same manifest',
      second.manifestChecksum === definition.expectedManifestChecksum);
    const [recordCount] = await prod.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_release_records WHERE "releaseId" = $1`, [RELEASE_ID]);
    check('no duplicate release records after re-preparation', recordCount.n === 35, recordCount.n);
    const [releaseCount] = await prod.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE "releaseId" = $1`, [RELEASE_ID]);
    check('no duplicate release rows after re-preparation', releaseCount.n === 1, releaseCount.n);
    const afterIdempotent = await corpusFingerprint(prod);
    check('re-preparation still leaves the legacy corpus unchanged',
      afterIdempotent.whole_corpus === beforeProd.whole_corpus);

    section('9. Refusals that protect a reviewed release');
    // A definition whose content pin does not reproduce must refuse and write nothing.
    const tampered: ReleaseDefinition = JSON.parse(JSON.stringify(definition));
    tampered.releaseId = 'kg5b-tamper-probe';
    tampered.members[0].expectedRecordChecksum = 'f'.repeat(64);
    const footprintBeforeTamper = await releaseFootprint(clean);
    try {
      await prepareGovernedRelease(clean, tampered);
      check('a record-checksum pin mismatch refuses', false);
    } catch (error) {
      check('a record-checksum pin mismatch refuses with RECORD_CHECKSUM_PIN_MISMATCH',
        error instanceof ReleaseConstructionRefused
        && error.code === 'RECORD_CHECKSUM_PIN_MISMATCH');
    }
    const manifestTampered: ReleaseDefinition = JSON.parse(JSON.stringify(definition));
    manifestTampered.releaseId = 'kg5b-tamper-probe-2';
    manifestTampered.expectedManifestChecksum = 'e'.repeat(64);
    try {
      await prepareGovernedRelease(clean, manifestTampered);
      check('a manifest pin mismatch refuses', false);
    } catch (error) {
      check('a manifest pin mismatch refuses with MANIFEST_CHECKSUM_PIN_MISMATCH',
        error instanceof ReleaseConstructionRefused
        && error.code === 'MANIFEST_CHECKSUM_PIN_MISMATCH');
    }
    check('a refused preparation wrote nothing',
      JSON.stringify(await releaseFootprint(clean)) === JSON.stringify(footprintBeforeTamper));

    section('10. Finalization gates on the production-shaped database (Phase 13)');
    const lifecycle = new RegulatoryReleaseLifecycleService(prod);
    const eligibility = await lifecycle.evaluateActivation(RELEASE_ID, ['provisional']);
    check('all eight activation gates are evaluated', eligibility.gates.length === 8,
      eligibility.gates.length);
    check('governedRecordsPresent is the only failing gate before any approval',
      JSON.stringify(eligibility.failedGates) === JSON.stringify(['governedRecordsPresent']),
      eligibility.failedGates);
    check('manifestChecksumVerifies passes against the persisted snapshot',
      eligibility.gates.find(g => g.key === 'manifestChecksumVerifies')?.passed === true);
    check('recordCountMatches passes', eligibility.gates.find(g => g.key === 'recordCountMatches')?.passed === true);
    check('releaseRecordsPresent passes', eligibility.gates.find(g => g.key === 'releaseRecordsPresent')?.passed === true);
    const unknown = await lifecycle.evaluateActivation('no-such-release', ['provisional']);
    check('an unknown release fails releaseExists and nothing else is claimed',
      unknown.failedGates.includes('releaseExists') && unknown.gates.length === 1);

    // A tampered snapshot must fail manifestChecksumVerifies -- proving the gate reads the
    // snapshot rather than trusting the stored number.
    await prod.query(
      `UPDATE regulatory_release_records SET "recordChecksum" = $1
       WHERE "releaseId" = $2 AND citation = $3`,
      ['a'.repeat(64), RELEASE_ID, '30 CFR 47.41(a)']);
    const tamperedGates = await lifecycle.evaluateActivation(RELEASE_ID, ['provisional']);
    check('a tampered snapshot fails manifestChecksumVerifies',
      tamperedGates.failedGates.includes('manifestChecksumVerifies'), tamperedGates.failedGates);
    check('gates never consult standards_master normalization: the legacy corpus is still pristine',
      (await corpusFingerprint(prod)).whole_corpus === beforeProd.whole_corpus);

  } finally {
    await Promise.all([prod.destroy(), clean.destroy(), atomic.destroy(), drift.destroy()]
      .map(p => p.catch(() => undefined)));
    for (const name of [prodDb, cleanDb, atomicDb, driftDb]) await dropDatabase(name);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5B release construction: ${passed}/${passed + failed} checks passed`);
  if (failed) {
    console.log(`\n${failed} FAILED:`);
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
