import 'dotenv/config';
import {
  RELEASE_MANIFEST_ORDER_BY,
  RELEASE_MANIFEST_SELECT_COLUMNS,
  computeReleaseManifest,
  computeSnapshotManifest,
  normalizeStandardRecord,
} from '../releases/release-manifest';
import { APPROVAL_CONTRACT_SELECT_COLUMNS, computeApprovalIdentity } from '../releases/approval-contract';
import { PLACEHOLDER_SOURCE_KEY_PREFIX, assessReviewState } from '../releases/review-state';
import { releaseCitationKey } from '../releases/citation-identity';
import { LegacyCorpusGuardRefused, assertSeedableCorpus } from './legacy-corpus-guard';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => {
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<{ rows: Array<Record<string, any>> }>;
    end(): Promise<void>;
  };
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const verifiedConnectionString = connectionString;

const RELEASE_ID = process.env.REGULATORY_RELEASE_ID || 'federal-core-2026-07-30.1';
const RELEASE_VERSION = process.env.REGULATORY_RELEASE_VERSION || '2026-07-30.1';
const PARSER_VERSION = 'standards-release-normalizer-v1';
const APPLICABILITY_SCHEMA_VERSION = 'hazlenz-applicability-v1';

async function run() {
  const client = new Client({ connectionString: verifiedConnectionString });
  await client.connect();
  try {
    await client.query('BEGIN');

    // KG-5B. This script's SELECT has no WHERE clause -- release membership is the whole table --
    // and its UPDATE loop stamps source_key, release_id, normalized_record_checksum,
    // transformation_version, deprecation_status and applicability_schema_version onto EVERY row
    // it snapshots. Against a corpus of live customer regulations that is a customer-visible
    // mutation performed by a release operation (KG5A-DISC-01), so it is refused here.
    //
    // The safe path for such a corpus is `npm run release -- prepare`, which selects an explicit
    // membership from version-controlled governed sources and writes nothing to standards_master.
    const corpus = await assertSeedableCorpus(
      async sql => (await client.query(sql)).rows);
    console.error(
      `[legacy-corpus-guard] rows=${corpus.totalRows} governed=${corpus.governedRows} ` +
      `foreign=${corpus.foreignRows} ownedDisposable=${corpus.ownedDisposable}`,
    );

    // KG-2 immutability guard. This script upserts (ON CONFLICT DO UPDATE), so before KG-2 a
    // re-run silently rewrote an existing release's manifest, version and record count. A
    // release that has entered the governed lifecycle -- one that is active now, or was active
    // and is retained for historical provenance and rollback -- must never be rewritten
    // underneath the analyses and reports that cite it. Draft/provisional releases stay
    // freely re-finalizable, which is what the seed workflow needs.
    const existing = await client.query(
      `SELECT status FROM regulatory_releases WHERE "releaseId" = $1`,
      [RELEASE_ID],
    );
    const existingStatus = existing.rows[0]?.status;
    if (existingStatus && !['draft', 'provisional'].includes(existingStatus)) {
      throw new Error(
        `Refusing to re-finalize release ${RELEASE_ID}: status is '${existingStatus}'. ` +
        `Releases that have entered the governed lifecycle are immutable; finalize a new releaseId instead.`,
      );
    }

    // KG-3F: the approval contract reads fields the manifest projection never covered
    // (granularity, force/effective dates, source-document identity). Appending columns to this
    // SELECT cannot move a v1 checksum -- `normalizeStandardRecord` reads its fields by name --
    // so the manifest identity of every previously finalized release is unaffected.
    const result = await client.query(`
      SELECT ${RELEASE_MANIFEST_SELECT_COLUMNS},
             ${APPROVAL_CONTRACT_SELECT_COLUMNS}
      FROM standards_master
      ORDER BY ${RELEASE_MANIFEST_ORDER_BY}
    `);

    // KG-3A ordering fix (defect A). Previously checksums were computed here, from the rows as
    // read, and the UPDATE loop below then mutated `source_key` -- synthesizing a
    // `starter-unverified:` placeholder for rows that had none. `sourceKey` is part of the
    // normalized projection the checksum covers, so the stored manifest described a state that
    // no longer existed the moment finalization committed, and only a SECOND finalization
    // (reading already-synthesized rows) produced a manifest that verified.
    //
    // Every intended normalization is now applied IN MEMORY FIRST, so the checksum is taken
    // over exactly what will be persisted. One finalization is deterministic and verifies
    // immediately.
    const normalizedRows = result.rows.map((row: Record<string, any>) => ({
      ...row,
      source_key: row.source_key ||
        `${PLACEHOLDER_SOURCE_KEY_PREFIX}${String(row.agency_code).toLowerCase()}:${row.citation}`,
      normalized_record_checksum: null as string | null,
      transformation_version: PARSER_VERSION,
      deprecation_status: row.is_active ? 'active' : 'deprecated',
      applicability_schema_version: APPLICABILITY_SCHEMA_VERSION,
    }));
    const { manifestChecksum, records } = computeReleaseManifest(normalizedRows);

    // KG-3A immutability (Phase 5). A finalized release is frozen. Re-finalizing is an
    // idempotent no-op when it would reproduce the identical snapshot, and an explicit refusal
    // when it would not -- it may never quietly rewrite membership, checksums or review state.
    const priorSnapshot = await client.query(
      `SELECT "manifestChecksum" FROM regulatory_releases WHERE "releaseId" = $1`, [RELEASE_ID],
    );
    const priorChecksum = priorSnapshot.rows[0]?.manifestChecksum ?? null;
    const priorRecordCount = Number((await client.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_release_records WHERE "releaseId" = $1`, [RELEASE_ID],
    )).rows[0].n);
    if (priorRecordCount > 0) {
      if (priorChecksum === manifestChecksum) {
        await client.query('COMMIT');
        console.log(JSON.stringify({
          releaseId: RELEASE_ID, status: 'provisional', outcome: 'idempotent_no_op',
          recordCount: priorRecordCount, manifestChecksum,
        }));
        return;
      }
      throw new Error(
        `Refusing to re-finalize release ${RELEASE_ID}: it already holds an immutable snapshot ` +
        `(${priorRecordCount} records, manifest ${priorChecksum}) and this run would produce a ` +
        `different manifest (${manifestChecksum}). Finalize a new releaseId instead.`,
      );
    }

    await client.query(`
      INSERT INTO regulatory_releases
        ("releaseId","releaseVersion","status","manifestChecksum","parserVersion","recordCount")
      VALUES ($1,$2,'provisional',$3,$4,$5)
      ON CONFLICT ("releaseId") DO UPDATE SET
        "releaseVersion" = EXCLUDED."releaseVersion",
        "manifestChecksum" = EXCLUDED."manifestChecksum",
        "parserVersion" = EXCLUDED."parserVersion",
        "recordCount" = EXCLUDED."recordCount"
    `, [RELEASE_ID, RELEASE_VERSION, manifestChecksum, PARSER_VERSION, records.length]);

    const reviewStateCounts: Record<string, number> = {
      unreviewed: 0, mechanically_validated: 0, reviewer_approved: 0,
    };
    for (const record of records) {
      const row = record.row;
      // Assessed against the row exactly as it is about to be persisted (checksum included),
      // so the snapshot's review state describes the content it is frozen alongside.
      const assessment = assessReviewState({ ...row, normalized_record_checksum: record.checksum });
      reviewStateCounts[assessment.state] += 1;

      await client.query(`
        UPDATE standards_master SET
          source_key = $2,
          release_id = $3,
          normalized_record_checksum = $4,
          transformation_version = $5,
          deprecation_status = CASE WHEN is_active THEN 'active' ELSE 'deprecated' END,
          applicability_schema_version = $6
        WHERE id = $1
      `, [record.id, row.source_key, RELEASE_ID, record.checksum, PARSER_VERSION,
        APPLICABILITY_SCHEMA_VERSION]);

      // KG-3A defect B: `reviewer_approved` is NO LONGER written here. This script was the only
      // writer of that column anywhere in the codebase, and it derived it from
      // `approved_for_auto_ingestion` -- i.e. "this source may be fetched automatically" was
      // being recorded as "a reviewer approved this regulatory record". Substantive review is
      // not something finalization can confer on itself.
      // KG-3F: the approval identity is computed from `row` -- the SAME in-memory normalized row
      // the manifest checksum was taken over, not from the pre-normalization read. This is the
      // KG-3A defect-A lesson applied to the second identity: `source_key` and
      // `transformation_version` are both approval-material and both synthesized above, so
      // computing the digest from the raw row would attest to a state that never gets persisted.
      const approval = computeApprovalIdentity(row);

      await client.query(`
        INSERT INTO regulatory_release_records
          ("releaseId","standardId","agencyCode","citation","citationKey","recordChecksum",
           "reviewState","reviewStateReason","payload",
           "approvalContractVersion","substantiveContentDigest","sourceIdentityDigest",
           "approvalDigest","approvalPayload")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      `, [RELEASE_ID, record.id, row.agency_code ?? null, row.citation,
        releaseCitationKey(row.citation), record.checksum, assessment.state, assessment.reason,
        JSON.stringify(normalizeStandardRecord(row)),
        approval.approvalContractVersion, approval.substantiveContentDigest,
        approval.sourceIdentityDigest, approval.approvalDigest,
        JSON.stringify(approval.approvalPayload)]);
    }

    // One-pass integrity proof: recompute the manifest from the snapshot just written. If a
    // single finalization cannot produce a release that verifies, the transaction must not
    // commit -- that was exactly defect A.
    const snapshotRows = await client.query(
      `SELECT "agencyCode", citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`, [RELEASE_ID],
    );
    const verification = computeSnapshotManifest(snapshotRows.rows);
    if (verification.manifestChecksum !== manifestChecksum) {
      throw new Error(
        `Finalization did not verify in one pass: stored ${manifestChecksum}, ` +
        `snapshot recomputed ${verification.manifestChecksum}.`,
      );
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      releaseId: RELEASE_ID,
      releaseVersion: RELEASE_VERSION,
      status: 'provisional',
      outcome: 'finalized',
      recordCount: records.length,
      manifestChecksum,
      verifiedInOnePass: true,
      reviewState: reviewStateCounts,
      // KG-3E (Phase 5) reporting fix. This counted rows whose `source_key` was NULL in
      // standards_master -- that is, rows about to RECEIVE a synthesized placeholder on this
      // finalization. Once a release has been finalized those same rows carry a persisted
      // `starter-unverified:` key, so `!row.source_key` is false and the field reported 0 from the
      // second finalization onward, no matter how many placeholder records the release contained.
      // A reader checking release readiness would see `placeholderSourceRecords: 0` on a corpus
      // with three unprovenanced records, which is precisely the wrong direction for a field that
      // exists to flag missing provenance. (This is why KG-3D's reproduction log records 0 for
      // federal-core-2026-08-19.3 while its own coverage table correctly reports 3.)
      //
      // Counting the normalized rows -- the state actually persisted and covered by the manifest
      // checksum -- makes the number mean what its name says. Nothing about the manifest, the
      // checksum, or record content changes; this is reporting only.
      placeholderSourceRecords: normalizedRows.filter((row: Record<string, any>) =>
        String(row.source_key).startsWith(PLACEHOLDER_SOURCE_KEY_PREFIX)).length,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

run().catch(error => {
  if (error instanceof LegacyCorpusGuardRefused) {
    console.error('');
    console.error(error.message);
    console.error('');
    console.error('No mutation was attempted; the transaction was rolled back.');
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
