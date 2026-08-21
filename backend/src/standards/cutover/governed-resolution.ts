/**
 * KG-4A Phases 6, 9 and 10 -- the canonical governed resolution contract, and the request-scoped
 * resolver that produces it.
 *
 * ONE RESULT TYPE, NOT A BAG OF BOOLEANS. The KG-4A brief is explicit that `approved`, `backed`,
 * `fallback` and `verified` must not be passed around as loosely related booleans. Every one of
 * those questions is answered here by a named state on a single object, and the customer-visible
 * consequences are derived from that object by `fallback-contract.ts` -- never recomputed.
 *
 * WHY THE RELEASE IS PINNED PER ANALYSIS (Phase 9). `getActiveRelease()` reads a mutable pointer.
 * KG-2 moves that pointer atomically, but an analysis is not atomic -- it spans several AI calls and
 * can run for many seconds. If each finding independently read the pointer, an activation landing
 * mid-analysis would leave finding A resolved against R1 and finding B against R2, and the single
 * `knowledgeReleaseId` recorded for the analysis would be true of only some of its findings.
 *
 * The fix is a `GovernedReleasePin`: the pointer is read ONCE, at the start of the analysis, and
 * every subsequent resolution takes the pinned release id explicitly. This is preferred over
 * holding a lock across the analysis, which would serialise long AI operations behind a corpus
 * pointer -- unacceptable, and unnecessary, because the release SNAPSHOT
 * (`regulatory_release_records`) is immutable once finalized. Pinning an id is sufficient to make
 * the snapshot stable; nothing needs to be locked.
 */

import { DataSource } from 'typeorm';
import { resolveGovernedCitation } from '../releases/governed-corpus-lookup';
import { releaseCitationKey } from '../releases/citation-identity';
import { isSameSection, citationSpecificity } from '../../applicable-standards/citation-structure';
import type { GovernedBackingState } from './fallback-contract';
import type { GovernedCutoverMode } from './cutover-mode';

/** How closely the governed record matched what HazLenz asked for. */
export type ResolutionGranularity =
  /** The release holds a record for the exact citation requested. */
  | 'EXACT'
  /**
   * Only the parent SECTION is present. Recorded for measurement; it never supplies text for the
   * paragraph and never changes `resolvedCitation`.
   */
  | 'SECTION_ONLY'
  /** Nothing in the release corresponds to the citation. */
  | 'NONE';

/** Health of the resolver itself, kept separate from what it found. */
export type ResolverHealth = 'OK' | 'NO_ACTIVE_RELEASE' | 'QUERY_FAILED' | 'MALFORMED_RECORD' | 'STALE_SCHEMA';

/**
 * The canonical internal result of resolving one citation against one governed release.
 *
 * Everything a caller could need, named. Nothing a customer sees directly -- the customer-visible
 * projection is produced by `decideFallback()` plus `resolveStandardsBacking()`.
 */
export interface GovernedResolutionResult {
  /** What HazLenz asked for, verbatim. */
  requestedCitation: string;
  /**
   * What the governed layer answered for. INVARIANT: always equal to `requestedCitation`.
   *
   * It exists as a separate field precisely so the invariant is assertable. A "nearest approved
   * match" implementation would differ here, and `test:kg4a-fallback-matrix` fails if it ever does.
   */
  resolvedCitation: string;
  citationKey: string;
  granularity: ResolutionGranularity;
  backing: GovernedBackingState;
  /** Governed text, or null. Non-null ONLY when `backing === 'APPROVED_EXACT'`. */
  standardText: string | null;
  plainLanguageSummary: string | null;
  title: string | null;
  sourceKey: string | null;
  sourceName: string | null;
  authorityTier: string | null;
  /**
   * KG-4B. The regime the GOVERNED record declares (agency/scope), so a shadow comparison can detect
   * a jurisdiction disagreement between what HazLenz evaluated under and what the release holds.
   * A wrong regime is the most dangerous legal disagreement there is, so it needs its own field
   * rather than being inferred from the citation prefix.
   */
  jurisdiction: string | null;
  placeholderSource: boolean;
  /** The PINNED release this was resolved against, or null when none was pinned. */
  releaseId: string | null;
  /** The specific release record's checksum/manifest identity, when one resolved. */
  recordChecksum: string | null;
  effectiveReviewState: string | null;
  health: ResolverHealth;
  /** Internal diagnostic. Never customer copy. */
  reason: string;
}

/**
 * A release pinned for the lifetime of ONE analysis.
 *
 * Immutable by construction and passed explicitly, so no request-global mutable state exists and
 * parallel analyses cannot interfere (Phase 17).
 */
export interface GovernedReleasePin {
  releaseId: string | null;
  pinnedAt: string;
  mode: GovernedCutoverMode;
  /** Why the pin holds what it holds. Categorical. */
  reason: 'PINNED_ACTIVE_RELEASE' | 'NO_ACTIVE_RELEASE' | 'MODE_IS_LEGACY' | 'PIN_LOOKUP_FAILED';
  /**
   * KG-4B. The pinned release's manifest identity, captured in the SAME query as the pointer read so
   * the two can never describe different releases. Optional so every existing literal pin in the
   * KG-4A suites still type-checks. Recorded on shadow events, which lets a mismatch corpus be tied
   * back to an exact corpus state without consulting the database that produced it.
   */
  manifestChecksum?: string | null;
}

function emptyResult(
  citation: string, releaseId: string | null, backing: GovernedBackingState,
  health: ResolverHealth, reason: string,
): GovernedResolutionResult {
  return {
    requestedCitation: citation,
    resolvedCitation: citation,
    citationKey: releaseCitationKey(citation),
    granularity: 'NONE',
    backing,
    standardText: null, plainLanguageSummary: null, title: null,
    sourceKey: null, sourceName: null, authorityTier: null, jurisdiction: null,
    placeholderSource: false,
    releaseId, recordChecksum: null, effectiveReviewState: null,
    health, reason,
  };
}

/**
 * Reads the active-release pointer ONCE and freezes it for the analysis.
 *
 * Never throws. A pin failure degrades to `releaseId: null`, which every downstream resolution
 * reports as `NO_ACTIVE_RELEASE`/`RESOLVER_UNAVAILABLE` and which the fallback contract already
 * handles -- so a governance outage cannot produce a 500 on a customer analysis.
 */
export async function pinGovernedRelease(
  dataSource: DataSource | null | undefined,
  mode: GovernedCutoverMode,
): Promise<GovernedReleasePin> {
  const pinnedAt = new Date().toISOString();
  if (mode === 'LEGACY') {
    // LEGACY does not read the pointer at all. Not an optimisation -- it is what makes LEGACY a
    // provable no-op in database behaviour as well as in output.
    return { releaseId: null, pinnedAt, mode, reason: 'MODE_IS_LEGACY' };
  }
  if (!dataSource) {
    return { releaseId: null, pinnedAt, mode, reason: 'PIN_LOOKUP_FAILED' };
  }
  try {
    const rows = await dataSource.query(
      `SELECT "releaseId", "manifestChecksum" FROM regulatory_releases WHERE status = 'active' LIMIT 1`,
    );
    const releaseId = rows?.[0]?.releaseId ? String(rows[0].releaseId) : null;
    const manifestChecksum = rows?.[0]?.manifestChecksum ? String(rows[0].manifestChecksum) : null;
    return releaseId
      ? { releaseId, pinnedAt, mode, reason: 'PINNED_ACTIVE_RELEASE', manifestChecksum }
      : { releaseId: null, pinnedAt, mode, reason: 'NO_ACTIVE_RELEASE', manifestChecksum: null };
  } catch {
    return { releaseId: null, pinnedAt, mode, reason: 'PIN_LOOKUP_FAILED' };
  }
}

/** Detects the KG-3F migration-order condition: approval columns absent means a stale schema. */
function isStaleSchemaError(error: unknown): boolean {
  const message = String((error as any)?.message || '');
  return /column .*(approvalDigest|approvalContractVersion|substantiveContentDigest).* does not exist/i.test(message)
    || /relation "regulatory_release_records" does not exist/i.test(message)
    || /relation "regulatory_release_record_reviews" does not exist/i.test(message);
}

/**
 * Resolves one citation against the PINNED release.
 *
 * Total: never throws, for any input or any database condition. Every failure is mapped onto a
 * `GovernedBackingState` the fallback contract already has a row for, which is the Phase 10
 * requirement that no raw 500 escapes for a condition the contract knows how to handle.
 */
export async function resolveGoverned(
  dataSource: DataSource | null | undefined,
  pin: GovernedReleasePin,
  citation: string,
): Promise<GovernedResolutionResult> {
  const requested = String(citation || '').trim();

  if (!pin.releaseId) {
    return emptyResult(
      requested, null,
      pin.reason === 'PIN_LOOKUP_FAILED' ? 'RESOLVER_UNAVAILABLE' : 'NO_ACTIVE_RELEASE',
      pin.reason === 'PIN_LOOKUP_FAILED' ? 'QUERY_FAILED' : 'NO_ACTIVE_RELEASE',
      pin.reason === 'PIN_LOOKUP_FAILED'
        ? 'The active-release pointer could not be read; governed backing is unknown, not absent.'
        : 'No governed release is active. This is the expected state of every environment today.',
    );
  }
  if (!dataSource) {
    return emptyResult(requested, pin.releaseId, 'RESOLVER_UNAVAILABLE', 'QUERY_FAILED',
      'No data source available to the governed resolver.');
  }
  if (!releaseCitationKey(requested)) {
    // Not a resolver failure: HazLenz supplied nothing resolvable. Treated as "the release holds
    // no record", which is true, rather than as an integrity failure, which it is not.
    return emptyResult(requested, pin.releaseId, 'NOT_IN_RELEASE', 'OK',
      'No resolvable citation identity was supplied.');
  }

  let resolution: Awaited<ReturnType<typeof resolveGovernedCitation>>;
  try {
    resolution = await resolveGovernedCitation(dataSource, pin.releaseId, requested);
  } catch (error) {
    const stale = isStaleSchemaError(error);
    return emptyResult(
      requested, pin.releaseId, 'RESOLVER_UNAVAILABLE', stale ? 'STALE_SCHEMA' : 'QUERY_FAILED',
      stale
        // The KG-3F hard requirement, surfaced rather than swallowed: migration 1800000014000 must
        // run before anything reads the approval identity. A stale schema fails LOUDLY here, and
        // the customer still receives legacy behaviour rather than an error.
        ? 'Governed schema is stale: migration 1800000014000 (ApprovalProvenanceContract) has not run.'
        : 'The governed resolver query failed; governed backing is unknown, not absent.',
    );
  }

  if (resolution.backing === 'NOT_IN_RELEASE' || resolution.backing === 'CITATION_ONLY') {
    // The exact citation is absent. Before answering NOT_IN_RELEASE, check whether the parent
    // SECTION is approved -- purely so the state is MEASURABLE. It confers nothing: the granularity
    // is recorded, no text is carried across, and `resolvedCitation` stays the requested citation.
    const sectionOnly = await probeSectionOnly(dataSource, pin.releaseId, requested);
    if (sectionOnly) {
      return {
        ...emptyResult(requested, pin.releaseId, 'APPROVED_SECTION_ONLY', 'OK',
          `Release ${pin.releaseId} approves the parent section '${sectionOnly}' but not the ` +
          `requested paragraph. Section text is NOT substituted for the paragraph.`),
        granularity: 'SECTION_ONLY',
      };
    }
    return emptyResult(requested, pin.releaseId, 'NOT_IN_RELEASE', 'OK', resolution.reason);
  }

  const backing: GovernedBackingState =
    resolution.backing === 'CORPUS_BACKED' ? 'APPROVED_EXACT'
    : resolution.backing === 'APPROVED_NO_TEXT' ? 'APPROVED_NO_TEXT'
    : 'UNAPPROVED_RECORD';

  // Content is carried ONLY for APPROVED_EXACT. Every other state gets null text, so no downstream
  // caller can accidentally render unattested governed text by reading a field that "happened to
  // be populated". The type system cannot express this, so the resolver enforces it structurally.
  const approved = backing === 'APPROVED_EXACT';

  return {
    requestedCitation: requested,
    resolvedCitation: requested,
    citationKey: resolution.citationKey,
    granularity: 'EXACT',
    backing,
    standardText: approved ? resolution.standardText : null,
    plainLanguageSummary: approved ? resolution.plainLanguageSummary : null,
    title: approved ? resolution.title : null,
    sourceKey: resolution.sourceKey,
    sourceName: resolution.sourceName,
    authorityTier: resolution.authorityTier,
    jurisdiction: resolution.jurisdiction,
    placeholderSource: resolution.placeholderSource,
    releaseId: pin.releaseId,
    recordChecksum: resolution.recordChecksum,
    effectiveReviewState: resolution.effectiveReviewState,
    health: 'OK',
    reason: resolution.reason,
  };
}

/**
 * Is the parent SECTION of this paragraph approved in the release?
 *
 * Read-only and deliberately narrow: it uses `isSameSection` + `citationSpecificity` so a SIBLING
 * paragraph can never satisfy it (1910.303(b)(1) is not answered by 1910.303(g)(2)(i)), and a
 * DIFFERENT section can never satisfy it (1926.50 is not answered by 1926.501). Returns the parent
 * citation for diagnostics only.
 */
async function probeSectionOnly(
  dataSource: DataSource, releaseId: string, citation: string,
): Promise<string | null> {
  if (citationSpecificity(citation) === 0) return null;  // already a bare section; nothing above it
  try {
    const rows = await dataSource.query(
      `SELECT e.citation
         FROM (SELECT r."citationKey", r.citation FROM regulatory_release_records r
                WHERE r."releaseId" = $1) AS e
        LIMIT 500`,
      [releaseId],
    );
    for (const row of rows || []) {
      const candidate = String(row?.citation || '');
      if (!candidate) continue;
      if (isSameSection(candidate, citation) && citationSpecificity(candidate) === 0) return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Projects a governed resolution onto the `GovernedBackingInput` that
 * `standards/display/standards-backing-contract.ts` already accepts.
 *
 * This is the whole integration seam. The KG-3C resolver keeps its one rule set; KG-4A supplies it
 * with a real governed input instead of `null`. Returns null for every state that must NOT be
 * presented as governed, so the existing contract's approved branch is unreachable except from
 * `APPROVED_EXACT` and `APPROVED_NO_TEXT`.
 */
export function toGovernedBackingInput(result: GovernedResolutionResult): {
  releaseId: string; effectiveReviewState: string | null; placeholderSource: boolean; hasContent: boolean;
} | null {
  if (!result.releaseId) return null;
  if (result.backing === 'RESOLVER_UNAVAILABLE' || result.backing === 'NO_ACTIVE_RELEASE') return null;
  // SECTION_ONLY and NOT_IN_RELEASE resolve no record at all; handing the display contract a
  // release id with no record would make it report "not approved in release X" about a citation
  // release X was never asked to hold.
  if (result.backing === 'APPROVED_SECTION_ONLY' || result.backing === 'NOT_IN_RELEASE') return null;
  return {
    releaseId: result.releaseId,
    effectiveReviewState: result.effectiveReviewState,
    placeholderSource: result.placeholderSource,
    hasContent: Boolean(
      String(result.standardText || '').trim() || String(result.plainLanguageSummary || '').trim(),
    ),
  };
}
