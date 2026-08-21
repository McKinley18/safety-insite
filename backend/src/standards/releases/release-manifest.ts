import { createHash } from 'crypto';

/**
 * KG-2 -- the single definition of a regulatory release's integrity manifest.
 *
 * This logic previously lived inline in `standards/seed/finalize-regulatory-release.ts`.
 * It is extracted here unchanged so that finalization (which WRITES the manifest) and
 * activation (which RE-VERIFIES it) compute it identically by construction. Two copies of
 * a checksum algorithm would eventually drift, and a drifted verifier would either block
 * every activation or, worse, pass a tampered release.
 *
 * The field set, the field ORDER (JSON.stringify is order-sensitive), the column list and
 * the row ordering below are all load-bearing: changing any of them changes every
 * manifest checksum and invalidates previously finalized releases.
 */

/** Columns required to normalize a standards_master row. Order-independent (named access). */
export const RELEASE_MANIFEST_SELECT_COLUMNS = `id, agency_code, citation, part_number, subpart, title, standard_text,
             plain_language_summary, scope_code, source_key, source_name, source_type,
             authority_tier, allowed_use, requires_approval, approved_for_auto_ingestion,
             hazard_codes, required_controls, keywords, severity_weight, is_active`;

/** Row ordering folded into the manifest. Order IS load-bearing. */
export const RELEASE_MANIFEST_ORDER_BY = `agency_code, citation`;

export type StandardsMasterRow = Record<string, any>;

export interface ReleaseManifestRecord {
  id: string;
  row: StandardsMasterRow;
  checksum: string;
}

export interface ReleaseManifest {
  manifestChecksum: string;
  records: ReleaseManifestRecord[];
  recordCount: number;
}

export const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * The normalized projection a record checksum is taken over. Deliberately excludes
 * governance/lifecycle fields (reviewer_approved, release_id, deprecation_status): the
 * manifest attests to the regulatory CONTENT of the release, so approving a record or
 * moving the active pointer does not invalidate the manifest, while editing a standard's
 * text, scope, hazards or controls does.
 */
export function normalizeStandardRecord(row: StandardsMasterRow) {
  return {
    agency: row.agency_code,
    citation: row.citation,
    title: row.title,
    canonicalText: row.standard_text,
    summary: row.plain_language_summary,
    scope: row.scope_code,
    sourceKey: row.source_key || null,
    sourceName: row.source_name || null,
    sourceType: row.source_type || null,
    authorityTier: row.authority_tier,
    allowedUse: row.allowed_use,
    hazards: row.hazard_codes || null,
    controls: row.required_controls || null,
    keywords: row.keywords || null,
    severityWeight: row.severity_weight,
    active: row.is_active,
  };
}

/**
 * Folds per-record checksums into one manifest checksum. `rows` must already be ordered by
 * RELEASE_MANIFEST_ORDER_BY.
 */
export function computeReleaseManifest(rows: StandardsMasterRow[]): ReleaseManifest {
  const records = rows.map(row => ({
    id: row.id,
    row,
    checksum: digest(normalizeStandardRecord(row)),
  }));
  const manifestChecksum = digest(records.map(record => ({
    agency: record.row.agency_code,
    citation: record.row.citation,
    checksum: record.checksum,
  })));
  return { manifestChecksum, records, recordCount: records.length };
}

/**
 * KG-3A -- the manifest of an IMMUTABLE release snapshot.
 *
 * Identical folding to `computeReleaseManifest`, but taken over persisted
 * `regulatory_release_records` rather than over the live, mutable `standards_master`. This is
 * what makes a release verifiable forever: the live corpus can be re-stamped, re-ingested or
 * edited afterwards without changing what release A attests to.
 *
 * `snapshotRows` must be ordered by (agencyCode, citation) to match the finalization order.
 */
export interface ReleaseSnapshotRow {
  agencyCode: string | null;
  citation: string;
  recordChecksum: string;
}

export function computeSnapshotManifest(
  snapshotRows: Array<ReleaseSnapshotRow | Record<string, any>>,
): { manifestChecksum: string; recordCount: number } {
  const manifestChecksum = digest(snapshotRows.map(record => ({
    agency: record.agencyCode,
    citation: record.citation,
    checksum: record.recordChecksum,
  })));
  return { manifestChecksum, recordCount: snapshotRows.length };
}
