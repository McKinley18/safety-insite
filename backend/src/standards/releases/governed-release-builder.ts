import { DataSource, EntityManager } from 'typeorm';
import {
  RELEASE_MANIFEST_ORDER_BY,
  RELEASE_MANIFEST_SELECT_COLUMNS,
  computeReleaseManifest,
  computeSnapshotManifest,
  normalizeStandardRecord,
} from './release-manifest';
import { APPROVAL_CONTRACT_SELECT_COLUMNS, computeApprovalIdentity } from './approval-contract';
import { PLACEHOLDER_SOURCE_KEY_PREFIX, assessReviewState } from './review-state';
import { releaseCitationKey } from './citation-identity';
import { GovernedSourceRecord, buildGovernedSourceSet } from './governed-source-set';
import { ReleaseDefinition } from './release-definition';

/**
 * KG-5B (Phases 4-9) -- GOVERNED RELEASE CONSTRUCTION.
 *
 * =====================================================================================
 * THE ARCHITECTURE, AND WHY THIS ONE
 * =====================================================================================
 *
 *   version-controlled governed source set   (governed-source-set.ts, zero DB access)
 *     -> explicit release membership          (release-definition.ts, version-controlled)
 *       -> session-scoped governed staging    (this module, TEMP table, one transaction)
 *         -> immutable release records        (regulatory_release_records)
 *           -> deterministic manifest         (release-manifest.ts, unchanged)
 *             -> reviewer decisions           (release-record-review.service.ts, unchanged)
 *               -> finalization gates         (regulatory-release-lifecycle.service.ts, unchanged)
 *                 -> explicit operator activation / rollback  (scripts/regulatory-release.ts)
 *
 * The task offered three shapes. This is Option C -- governed source records PLUS an explicit
 * membership manifest -- with one deliberate refinement: THE GOVERNED STAGING TABLE IS TEMPORARY.
 *
 * WHY A TEMP TABLE RATHER THAN A PERSISTED STAGING TABLE. Four properties, all of which a
 * persisted table would cost something to obtain:
 *
 *   1. NO SEVENTH MIGRATION. Phase 21 requires that the previously deployed commit `97941ca2`
 *      still start against the migrated schema. Every table KG-5B does not add is one fewer thing
 *      that can break that, and the six migrations KG-5A rehearsed stay exactly as rehearsed.
 *   2. IT CANNOT DRIFT. A persisted staging table is a second corpus that has to be kept in step
 *      with the version-controlled sources. A temp table is materialized from those sources, in
 *      memory, microseconds before it is read, so "staging is stale" is not a reachable state.
 *   3. IT CANNOT LEAK. `CREATE TEMP TABLE ... ON COMMIT DROP` means a failed construction leaves
 *      no trace anywhere -- which is most of Phase 5 for free.
 *   4. IT ORDERS AND TYPES EXACTLY LIKE `standards_master`. This is the load-bearing one. The
 *      manifest folds rows in `ORDER BY agency_code, citation` order under the database's own
 *      collation, and `pg` maps column types to JavaScript values (integer -> number,
 *      `simple-array` text -> comma-joined string, `date` -> Date). Reproducing KG-5A's
 *      `14a34fea…` from an in-memory array would mean reimplementing ICU collation and pg's type
 *      mapping and hoping they agree. Staging in the same database, with the same column types,
 *      makes the reproduction structural.
 *
 * The persisted, inspectable artifact a "staging table" would have provided already exists and is
 * better: a PROVISIONAL release with its records written. That is a real lifecycle state, it is
 * reviewable through the existing `review:release-record` command, and it cannot be mistaken for
 * a finalized release.
 *
 * =====================================================================================
 * THE LEGACY CORPUS NON-MUTATION CONTRACT (Phase 4)
 * =====================================================================================
 *
 * GOVERNED RELEASE CONSTRUCTION DOES NOT WRITE TO `standards_master`. Not conditionally, not
 * as a fallback, not to stamp provenance. This module contains no INSERT, UPDATE or DELETE naming
 * that table, and `assertNoLegacyCorpusWrites()` below enforces it over the SQL this module
 * actually issues, so the invariant is checked rather than merely intended.
 *
 * The pipeline this replaces mutated the live corpus in three distinct ways, all now gone:
 *   - the seed rewrote `standard_text`/`title` on rows it matched by normalized citation;
 *   - the seed RENAMED live citations, colliding with the `(agency_code, citation)` unique index;
 *   - the finalizer stamped `source_key`, `release_id`, `normalized_record_checksum`,
 *     `transformation_version`, `deprecation_status` and `applicability_schema_version` on EVERY
 *     row in the table.
 *
 * Governed records carry those fields on themselves, in the staging projection, because they are
 * properties of the governed record -- not annotations that have to be written onto somebody
 * else's row to exist.
 *
 * =====================================================================================
 * WHAT `standardId` IS, AND WHY IT IS NULL
 * =====================================================================================
 *
 * `regulatory_release_records.standardId` is a nullable provenance link to the captured
 * `standards_master` row. A governed record is not a capture of a live corpus row -- it is
 * derived from the authoritative source artifacts directly -- so the honest value is NULL. It is
 * excluded from both the manifest projection and the approval projection, so this changes no
 * checksum. One reporting consequence is worth naming: `describeReleaseScope().legacyUnscopedRecords`
 * counts corpus rows belonging to no snapshot, and under this architecture that is every legacy
 * row. That is the truth -- a governed release governs governed records, and scopes no legacy row.
 */

export const GOVERNED_STAGING_TABLE = 'kg_governed_release_staging';

export type ConstructionRefusalCode =
  | 'DEFINITION_MEMBER_NOT_IN_SOURCE_SET'
  | 'DUPLICATE_GOVERNED_CITATION_KEY'
  | 'PLACEHOLDER_PROVENANCE'
  | 'RECORD_CHECKSUM_PIN_MISMATCH'
  | 'MANIFEST_CHECKSUM_PIN_MISMATCH'
  | 'RECORD_COUNT_MISMATCH'
  | 'MEMBERSHIP_NOT_REPRODUCED'
  | 'RELEASE_IMMUTABLE'
  | 'MANIFEST_WOULD_CHANGE'
  | 'ONE_PASS_VERIFICATION_FAILED';

export class ReleaseConstructionRefused extends Error {
  constructor(readonly code: ConstructionRefusalCode, message: string, readonly detail?: unknown) {
    super(`[${code}] ${message}`);
    this.name = 'ReleaseConstructionRefused';
  }
}

export interface PreparedReleaseRecord {
  agencyCode: string | null;
  citation: string;
  citationKey: string;
  recordChecksum: string;
  reviewState: string;
  reviewStateReason: string;
  payload: Record<string, unknown>;
  approvalContractVersion: number;
  substantiveContentDigest: string;
  sourceIdentityDigest: string;
  approvalDigest: string;
  approvalPayload: Record<string, unknown>;
}

export interface PreparedRelease {
  releaseId: string;
  releaseVersion: string;
  parserVersion: string;
  manifestChecksum: string;
  recordCount: number;
  records: PreparedReleaseRecord[];
  reviewStateCounts: Record<string, number>;
  placeholderSourceRecords: number;
  /** Rows of `standards_master` read during construction. Always 0. Proven, not asserted. */
  legacyCorpusRowsRead: number;
}

export type PrepareOutcome = 'prepared' | 'idempotent_no_op';

export interface PrepareResult extends PreparedRelease {
  outcome: PrepareOutcome;
  status: 'provisional';
  verifiedInOnePass: boolean;
  dryRun: boolean;
}

/**
 * KG-5B (Phase 5, failure injection). Named points at which a caller may inject a failure to
 * prove the transaction is atomic. Verification-only; production callers pass nothing.
 */
export const CONSTRUCTION_STAGES = [
  'source_set_built',
  'membership_resolved',
  'staging_populated',
  'manifest_computed',
  'release_row_written',
  'records_written',
  'before_commit',
] as const;

export type ConstructionStage = typeof CONSTRUCTION_STAGES[number];

export interface PrepareOptions {
  /** Compute and report everything, write nothing, commit nothing. */
  dryRun?: boolean;
  /** Verification hook. Throwing from it must leave the database exactly as it was. */
  injectFailureAt?: ConstructionStage;
  onStage?: (stage: ConstructionStage) => void | Promise<void>;
}

/**
 * Selects the definition's members from the governed source set.
 *
 * Membership is a LOOKUP, never a scan: every member must be found by its `citationKey`, and a
 * source record the definition does not name is not in the release. Both directions are
 * deliberate -- a definition naming a regulation the sources cannot supply is a refusal, and a
 * regulation appearing in the sources is never added to a reviewed release without being named.
 */
export function resolveMembership(definition: ReleaseDefinition): GovernedSourceRecord[] {
  const sourceSet = buildGovernedSourceSet();

  if (sourceSet.duplicateCitationKeys.length) {
    throw new ReleaseConstructionRefused(
      'DUPLICATE_GOVERNED_CITATION_KEY',
      'The governed source set resolves two source records to the same logical citation. ' +
      'A release cannot hold two versions of one citation, and choosing between them is a ' +
      'source-artifact decision, not something construction may make silently.',
      { duplicateCitationKeys: sourceSet.duplicateCitationKeys },
    );
  }

  const missing: string[] = [];
  const resolved: GovernedSourceRecord[] = [];
  for (const member of definition.members) {
    const record = sourceSet.byCitationKey.get(member.citationKey);
    if (!record) { missing.push(`${member.citationKey} (${member.citation})`); continue; }
    resolved.push(record);
  }
  if (missing.length) {
    throw new ReleaseConstructionRefused(
      'DEFINITION_MEMBER_NOT_IN_SOURCE_SET',
      `${missing.length} declared member(s) have no governed source record. A release may not be ` +
      'built with a member missing, and a missing member is never substituted from the legacy corpus.',
      { missing },
    );
  }
  return resolved;
}

/**
 * The staging projection: a governed source record rendered with the release-level fields the
 * finalizer used to STAMP ONTO LIVE ROWS.
 *
 * `source_key`, `transformation_version`, `deprecation_status` and `applicability_schema_version`
 * are computed here, in memory, over the governed record. This is the KG-3A defect-A lesson
 * (normalize before you checksum) applied to an architecture where normalization no longer has
 * anywhere else to go -- and it is what makes Phase 7 hold: the governed release derives full
 * provenance from the governed source pipeline while production's `standards_master.source_key`
 * stays NULL on all 2,390 rows, untouched.
 */
export function toStagingRow(record: GovernedSourceRecord, definition: ReleaseDefinition) {
  return {
    agency_code: record.agency_code,
    citation: record.citation,
    part_number: record.part_number,
    subpart: record.subpart,
    title: record.title,
    standard_text: record.standard_text,
    plain_language_summary: record.plain_language_summary,
    scope_code: record.scope_code,
    // Preserved verbatim from the finalizer, including the placeholder synthesis. A governed
    // source with no registry key is a real (if currently empty) case, and a record whose key is
    // literally named "unverified" must keep being refused authority by `assessReviewState`.
    source_key: record.source_key ||
      `${PLACEHOLDER_SOURCE_KEY_PREFIX}${String(record.agency_code).toLowerCase()}:${record.citation}`,
    source_name: record.source_name,
    source_type: record.source_type,
    authority_tier: record.authority_tier,
    allowed_use: record.allowed_use,
    requires_approval: record.requires_approval,
    approved_for_auto_ingestion: record.approved_for_auto_ingestion,
    // `simple-array` columns are comma-joined text in `standards_master`; TypeORM writes them
    // with `join(',')` and the finalizer read them back as strings. Joined here for the same
    // reason: the manifest projection must see the same value it has always seen.
    hazard_codes: record.hazard_codes.join(','),
    required_controls: record.required_controls.join(','),
    keywords: record.keywords.join(','),
    severity_weight: record.severity_weight,
    is_active: record.is_active,
    effective_date: record.effective_date,
    revision_date: record.revision_date,
    deprecation_status: record.is_active ? 'active' : 'deprecated',
    superseded_by_citation: null as string | null,
    applicability_schema_version: definition.applicabilitySchemaVersion,
    source_publication_date: record.source_publication_date,
    source_document_checksum: record.source_document_checksum,
    transformation_version: definition.parserVersion,
    source_url: record.source_url,
    retrieval_date: record.retrieval_date,
  };
}

const STAGING_COLUMNS = [
  'agency_code', 'citation', 'part_number', 'subpart', 'title', 'standard_text',
  'plain_language_summary', 'scope_code', 'source_key', 'source_name', 'source_type',
  'authority_tier', 'allowed_use', 'requires_approval', 'approved_for_auto_ingestion',
  'hazard_codes', 'required_controls', 'keywords', 'severity_weight', 'is_active',
  'effective_date', 'revision_date', 'deprecation_status', 'superseded_by_citation',
  'applicability_schema_version', 'source_publication_date', 'source_document_checksum',
  'transformation_version', 'source_url', 'retrieval_date',
] as const;

/**
 * DDL mirroring `standards_master`'s types for exactly the columns the two projections read.
 *
 * `ON COMMIT DROP` is the atomicity guarantee for staging: whether the transaction commits or
 * rolls back, no staging state survives it.
 */
const STAGING_DDL = `
  CREATE TEMP TABLE ${GOVERNED_STAGING_TABLE} (
    agency_code                  character varying,
    citation                     character varying,
    part_number                  character varying,
    subpart                      character varying,
    title                        character varying,
    standard_text                text,
    plain_language_summary       text,
    scope_code                   character varying,
    source_key                   character varying,
    source_name                  character varying,
    source_type                  character varying,
    authority_tier               integer,
    allowed_use                  character varying,
    requires_approval            boolean,
    approved_for_auto_ingestion  boolean,
    hazard_codes                 text,
    required_controls            text,
    keywords                     text,
    severity_weight              integer,
    is_active                    boolean,
    effective_date               date,
    revision_date                date,
    deprecation_status           character varying(24),
    superseded_by_citation       character varying,
    applicability_schema_version character varying(80),
    source_publication_date      date,
    source_document_checksum     character(64),
    transformation_version       character varying(80),
    source_url                   text,
    retrieval_date               date
  ) ON COMMIT DROP`;

/**
 * Guards the non-mutation invariant over the SQL this module issues.
 *
 * A comment saying "we never write to standards_master" is not a contract. Every statement
 * governed construction runs passes through here first, so a future edit that adds a write to the
 * legacy corpus fails loudly at the moment it runs rather than quietly changing customer data.
 */
const LEGACY_CORPUS_WRITE = /\b(insert\s+into|update|delete\s+from|truncate|alter\s+table|drop\s+table)\b[\s\S]{0,80}?\bstandards_master\b/i;

export function assertNoLegacyCorpusWrites(sql: string): void {
  if (LEGACY_CORPUS_WRITE.test(sql)) {
    throw new Error(
      'LEGACY CORPUS NON-MUTATION CONTRACT VIOLATED: governed release construction attempted a ' +
      `write against standards_master.\n${sql.trim().slice(0, 400)}`,
    );
  }
}

/**
 * Prepares (and, unless `dryRun`, persists) a PROVISIONAL governed release.
 *
 * Everything happens in ONE transaction (Phase 5). A failure at any stage -- source parsing,
 * membership resolution, staging, manifest computation, record write, gate evaluation, the
 * one-pass verification -- leaves no release row, no release record, no staging table and no
 * change of any kind to `standards_master`.
 *
 * It never approves and never activates. `prepare -> review -> approve -> finalize -> activate`
 * stay five separate operator acts, because collapsing any two of them is how a release gets
 * activated that nobody read.
 */
export async function prepareGovernedRelease(
  dataSource: DataSource,
  definition: ReleaseDefinition,
  options: PrepareOptions = {},
): Promise<PrepareResult> {
  const dryRun = options.dryRun === true;

  const run = async (manager: EntityManager): Promise<PrepareResult> => {
    const query = async (sql: string, params?: unknown[]) => {
      assertNoLegacyCorpusWrites(sql);
      return manager.query(sql, params);
    };
    const stage = async (name: ConstructionStage) => {
      await options.onStage?.(name);
      if (options.injectFailureAt === name) {
        throw new Error(`KG-5B injected failure at stage '${name}'.`);
      }
    };

    // ---- KG-2/KG-3A immutability guard, preserved verbatim in meaning.
    const existing = await query(
      `SELECT status, "manifestChecksum" FROM regulatory_releases WHERE "releaseId" = $1`,
      [definition.releaseId],
    );
    const existingStatus = existing[0]?.status as string | undefined;
    if (existingStatus && !['draft', 'provisional'].includes(existingStatus)) {
      throw new ReleaseConstructionRefused(
        'RELEASE_IMMUTABLE',
        `Refusing to re-prepare release ${definition.releaseId}: status is '${existingStatus}'. ` +
        'Releases that have entered the governed lifecycle are immutable; prepare a new releaseId instead.',
        { status: existingStatus },
      );
    }

    // ---- Governed source set + explicit membership. No database involvement whatsoever.
    const members = resolveMembership(definition);
    await stage('source_set_built');
    await stage('membership_resolved');

    // ---- Governed staging.
    await query(STAGING_DDL);
    const columns = STAGING_COLUMNS.join(', ');
    for (const record of members) {
      const row = toStagingRow(record, definition) as Record<string, unknown>;
      const values = STAGING_COLUMNS.map(column => row[column]);
      const placeholders = STAGING_COLUMNS.map((_, index) => `$${index + 1}`).join(', ');
      await query(
        `INSERT INTO ${GOVERNED_STAGING_TABLE} (${columns}) VALUES (${placeholders})`, values,
      );
    }
    await stage('staging_populated');

    // ---- The manifest, computed over the staged governed set using the UNCHANGED projection,
    // the UNCHANGED column list and the UNCHANGED ordering. `id` is selected as NULL because a
    // governed record captures no live corpus row; `normalizeStandardRecord` does not read it, so
    // no checksum is affected.
    const staged: Array<Record<string, any>> = await query(`
      SELECT NULL::uuid AS id, ${RELEASE_MANIFEST_SELECT_COLUMNS.replace(/^\s*id,\s*/, '')},
             ${APPROVAL_CONTRACT_SELECT_COLUMNS}
      FROM ${GOVERNED_STAGING_TABLE}
      ORDER BY ${RELEASE_MANIFEST_ORDER_BY}
    `);

    // Membership must have survived staging exactly. Cheap, and it catches a staging bug before
    // it becomes a frozen release.
    if (staged.length !== definition.members.length) {
      throw new ReleaseConstructionRefused(
        'MEMBERSHIP_NOT_REPRODUCED',
        `Staged ${staged.length} governed records for ${definition.members.length} declared members.`,
      );
    }
    const declaredKeys = new Set(definition.members.map(member => member.citationKey));
    const stagedKeys = staged.map(row => releaseCitationKey(row.citation));
    const unexpected = stagedKeys.filter(key => !declaredKeys.has(key));
    if (unexpected.length) {
      throw new ReleaseConstructionRefused(
        'MEMBERSHIP_NOT_REPRODUCED',
        'Staged records include citation keys the definition does not declare.',
        { unexpected },
      );
    }

    const { manifestChecksum, records } = computeReleaseManifest(staged);
    await stage('manifest_computed');

    // ---- Verification pins. Checked, never satisfied by adjustment.
    const checksumByKey = new Map(
      definition.members.filter(m => m.expectedRecordChecksum)
        .map(m => [m.citationKey, m.expectedRecordChecksum as string]),
    );
    const pinMismatches = records
      .map(record => {
        const key = releaseCitationKey(record.row.citation);
        const expected = checksumByKey.get(key);
        return expected && expected !== record.checksum
          ? { citationKey: key, expected, actual: record.checksum } : null;
      })
      .filter(Boolean);
    if (pinMismatches.length) {
      throw new ReleaseConstructionRefused(
        'RECORD_CHECKSUM_PIN_MISMATCH',
        `${pinMismatches.length} record(s) did not reproduce the checksum the release definition ` +
        'pins. The governed content differs from what was reviewed; nothing has been written.',
        { pinMismatches },
      );
    }
    if (definition.expectedManifestChecksum
        && definition.expectedManifestChecksum !== manifestChecksum) {
      throw new ReleaseConstructionRefused(
        'MANIFEST_CHECKSUM_PIN_MISMATCH',
        `Manifest ${manifestChecksum} does not reproduce the pinned ` +
        `${definition.expectedManifestChecksum}. Nothing has been written.`,
        { expected: definition.expectedManifestChecksum, actual: manifestChecksum },
      );
    }

    // ---- Per-record identities, computed from the SAME staged rows the manifest covers.
    const reviewStateCounts: Record<string, number> = {
      unreviewed: 0, mechanically_validated: 0, reviewer_approved: 0,
    };
    const prepared: PreparedReleaseRecord[] = records.map(record => {
      const row = record.row;
      const assessment = assessReviewState({ ...row, normalized_record_checksum: record.checksum });
      reviewStateCounts[assessment.state] += 1;
      const approval = computeApprovalIdentity(row);
      return {
        agencyCode: row.agency_code ?? null,
        citation: row.citation,
        citationKey: releaseCitationKey(row.citation),
        recordChecksum: record.checksum,
        reviewState: assessment.state,
        reviewStateReason: assessment.reason,
        payload: normalizeStandardRecord(row) as Record<string, unknown>,
        approvalContractVersion: approval.approvalContractVersion,
        substantiveContentDigest: approval.substantiveContentDigest,
        sourceIdentityDigest: approval.sourceIdentityDigest,
        approvalDigest: approval.approvalDigest,
        approvalPayload: approval.approvalPayload as unknown as Record<string, unknown>,
      };
    });

    const placeholderSourceRecords = staged.filter(row =>
      String(row.source_key).startsWith(PLACEHOLDER_SOURCE_KEY_PREFIX)).length;

    const summary = {
      releaseId: definition.releaseId,
      releaseVersion: definition.releaseVersion,
      parserVersion: definition.parserVersion,
      manifestChecksum,
      recordCount: prepared.length,
      records: prepared,
      reviewStateCounts,
      placeholderSourceRecords,
      legacyCorpusRowsRead: 0,
    };

    // ---- Idempotency against an existing provisional snapshot.
    const priorCount = Number((await query(
      `SELECT COUNT(*)::int AS n FROM regulatory_release_records WHERE "releaseId" = $1`,
      [definition.releaseId],
    ))[0].n);
    if (priorCount > 0) {
      const priorChecksum = existing[0]?.manifestChecksum ?? null;
      if (priorChecksum === manifestChecksum) {
        return {
          ...summary, outcome: 'idempotent_no_op', status: 'provisional',
          verifiedInOnePass: true, dryRun, recordCount: priorCount,
        };
      }
      throw new ReleaseConstructionRefused(
        'MANIFEST_WOULD_CHANGE',
        `Refusing to re-prepare release ${definition.releaseId}: it already holds a snapshot of ` +
        `${priorCount} records with manifest ${priorChecksum}, and this run would produce ` +
        `${manifestChecksum}. Prepare a new releaseId instead.`,
        { priorChecksum, manifestChecksum, priorCount },
      );
    }

    if (dryRun) {
      // Zero writes have occurred: the only statements issued were SELECTs plus a TEMP table that
      // `ON COMMIT DROP` disposes of. The caller rolls the transaction back regardless.
      return {
        ...summary, outcome: 'prepared', status: 'provisional',
        verifiedInOnePass: false, dryRun: true,
      };
    }

    await query(`
      INSERT INTO regulatory_releases
        ("releaseId","releaseVersion","status","manifestChecksum","parserVersion","recordCount")
      VALUES ($1,$2,'provisional',$3,$4,$5)
      ON CONFLICT ("releaseId") DO UPDATE SET
        "releaseVersion" = EXCLUDED."releaseVersion",
        "manifestChecksum" = EXCLUDED."manifestChecksum",
        "parserVersion" = EXCLUDED."parserVersion",
        "recordCount" = EXCLUDED."recordCount"
    `, [definition.releaseId, definition.releaseVersion, manifestChecksum,
      definition.parserVersion, prepared.length]);
    await stage('release_row_written');

    for (const record of prepared) {
      await query(`
        INSERT INTO regulatory_release_records
          ("releaseId","standardId","agencyCode","citation","citationKey","recordChecksum",
           "reviewState","reviewStateReason","payload",
           "approvalContractVersion","substantiveContentDigest","sourceIdentityDigest",
           "approvalDigest","approvalPayload")
        VALUES ($1,NULL,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [definition.releaseId, record.agencyCode, record.citation, record.citationKey,
        record.recordChecksum, record.reviewState, record.reviewStateReason,
        JSON.stringify(record.payload), record.approvalContractVersion,
        record.substantiveContentDigest, record.sourceIdentityDigest, record.approvalDigest,
        JSON.stringify(record.approvalPayload)]);
    }
    await stage('records_written');

    // ---- One-pass integrity proof, recomputed from the persisted snapshot.
    const snapshotRows = await query(
      `SELECT "agencyCode", citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`, [definition.releaseId],
    );
    const verification = computeSnapshotManifest(snapshotRows);
    if (verification.manifestChecksum !== manifestChecksum) {
      throw new ReleaseConstructionRefused(
        'ONE_PASS_VERIFICATION_FAILED',
        `Preparation did not verify in one pass: computed ${manifestChecksum}, ` +
        `snapshot recomputed ${verification.manifestChecksum}.`,
      );
    }
    await stage('before_commit');

    return {
      ...summary, outcome: 'prepared', status: 'provisional',
      verifiedInOnePass: true, dryRun: false,
    };
  };

  if (dryRun) {
    // A dry run must be incapable of committing, not merely disinclined to. The transaction is
    // always rolled back, so even a defect that reached a write could not persist one.
    const runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      return await run(runner.manager);
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  }
  return dataSource.transaction(run);
}
