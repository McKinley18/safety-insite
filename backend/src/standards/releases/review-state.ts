import { StandardsMasterRow } from './release-manifest';

/**
 * KG-3A -- truthful review semantics (defect B).
 *
 * Before this, one boolean (`standards_master.reviewer_approved`) was made to carry three
 * different claims at once, and `finalize-regulatory-release.ts` -- the ONLY writer of that
 * column anywhere in the codebase -- derived it as:
 *
 *     approved = source_key AND approved_for_auto_ingestion AND NOT requires_approval
 *
 * That says "this source may be acquired automatically", which is not the same claim as
 * "a qualified reviewer approved this regulatory record for governed use". The two were
 * collapsed, and because the finalizer also synthesized a `starter-unverified:` placeholder
 * key for rows that had no source metadata, a second finalization promoted those very rows --
 * the ones with the weakest provenance -- to "approved".
 *
 * These three states are kept distinct and are never silently upgraded into one another.
 */
export type ReleaseRecordReviewState =
  /** No trustworthy basis to treat this record as governed. Includes placeholder sources. */
  | 'unreviewed'
  /** Passed deterministic transformation checks and came from a registered source. NOT review. */
  | 'mechanically_validated'
  /** A reviewer explicitly approved this record for governed regulatory use. */
  | 'reviewer_approved';

export interface ReviewStateAssessment {
  state: ReleaseRecordReviewState;
  reason: string;
}

/**
 * Source keys the finalizer fabricates for records that arrived with no source metadata.
 * A placeholder literally named "unverified" must never confer authority, no matter how many
 * times finalization runs.
 */
export const PLACEHOLDER_SOURCE_KEY_PREFIX = 'starter-unverified:';

export function isPlaceholderSourceKey(sourceKey: unknown): boolean {
  return String(sourceKey || '').startsWith(PLACEHOLDER_SOURCE_KEY_PREFIX);
}

/**
 * Classifies one standards_master row at snapshot time. Pure, so the shadow evaluator and the
 * finalizer cannot disagree, and so no new column is needed on the live corpus table.
 *
 * Ordering matters: the placeholder check runs BEFORE the approval check, so a fabricated
 * source key can never be laundered into `reviewer_approved` even if the legacy boolean on the
 * row is stale/true from the pre-KG-3A derivation.
 */
export function assessReviewState(row: StandardsMasterRow): ReviewStateAssessment {
  const sourceKey = row.source_key ?? null;

  if (!sourceKey) {
    return { state: 'unreviewed', reason: 'Record has no source key; provenance is unestablished.' };
  }
  if (isPlaceholderSourceKey(sourceKey)) {
    return {
      state: 'unreviewed',
      reason: `Source key '${sourceKey}' is a synthesized placeholder, not a registered source.`,
    };
  }
  if (row.reviewer_approved === true) {
    return { state: 'reviewer_approved', reason: 'A reviewer explicitly approved this record.' };
  }

  const deprecated = String(row.deprecation_status ?? 'active') !== 'active';
  if (deprecated) {
    return { state: 'unreviewed', reason: 'Record is deprecated and cannot back governed retrieval.' };
  }
  if (row.is_active === false) {
    return { state: 'unreviewed', reason: 'Record is inactive.' };
  }
  if (!row.normalized_record_checksum) {
    return { state: 'unreviewed', reason: 'Record has not been through deterministic normalization.' };
  }

  // Registered source + normalized + active. This is a real, useful statement -- and it is
  // still NOT review. It is exactly the state the old boolean was pretending was approval.
  return {
    state: 'mechanically_validated',
    reason:
      `Record from registered source '${sourceKey}' passed deterministic transformation checks, ` +
      'but no reviewer has approved it for governed regulatory use.',
  };
}
