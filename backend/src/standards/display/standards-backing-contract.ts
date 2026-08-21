/**
 * KG-3C -- the canonical standards backing contract.
 *
 * ROOT CAUSE THIS REPLACES.
 *
 * `safescope-v2.service.ts` set `corpusBacked = Boolean(hydrated?.sourceKey)`. That is a false
 * equivalence in this system, for a specific and demonstrated reason:
 * `finalize-regulatory-release.ts` SYNTHESIZES a source key for every corpus row that arrives
 * without source metadata --
 *
 *     starter-unverified:<agency>:<citation>
 *
 * -- so after any finalization, EVERY row has a non-empty `source_key`, and the four
 * placeholder-provenance records in the real corpus satisfied `corpusBacked === true`. A field
 * literally named "unverified" was conferring corpus backing. KG-3B measured this directly
 * (difference class `LEGACY_PLACEHOLDER_BACKING_REMOVED`, 2 of 23 emitted citations).
 *
 * The deeper problem is that presence of *a row* was standing in for three distinct claims:
 * that a record exists, that it carries usable regulatory content, and that someone approved it.
 * This module separates them into one explicit status.
 *
 * ONE TRUTH SYSTEM. Everything downstream -- `corpusBacked`, `sourceStatus`, the customer notice,
 * the Standard Detail rendering -- is DERIVED from `backingStatus` here. Nothing recomputes
 * backing from `sourceKey`, from the presence of text, or from the truthiness of a generic field.
 *
 * PURE AND DB-FREE, DELIBERATELY. Resolving governed approval requires the active release and the
 * reviewer-decision log; that lookup lives in `standards/releases/governed-corpus-lookup.ts`.
 * This function accepts an ALREADY-RESOLVED governed input instead of performing the query, so
 * that:
 *
 *   - the live customer path can call it with `governed: null` and stay byte-for-byte unchanged
 *     in its database behaviour (KG-3C does NOT enable the governed read-path cutover);
 *   - the governed/shadow path can call the SAME function with a real resolution;
 *   - the two can never disagree, because there is only one rule set.
 */

export type StandardsBackingStatus =
  /**
   * The governed release supplies a reviewer-approved record for this exact citation, with
   * registered provenance and usable regulatory content. Only this state may be presented as
   * governed, approved regulatory backing.
   */
  | 'APPROVED_GOVERNED_CONTENT'
  /**
   * A corpus record exists but does not meet the governed approval contract -- not approved, or
   * approved-but-placeholder, or no governed release resolves it. Its content may well be
   * correct; nothing attests to it, so it must never be presented as approved regulation.
   */
  | 'UNAPPROVED_CONTENT'
  /**
   * HazLenz legitimately selected this citation, but no usable corpus content backs it. The
   * citation still stands on the evidence-based decision that produced it.
   */
  | 'CITATION_ONLY';

/**
 * What the displayed body text actually IS. Kept separate from `backingStatus` because they
 * answer different questions: the status says whether the corpus record is governed-approved,
 * this says whose words the reader is looking at.
 *
 * `HAZLENZ_AUTHORED` is the honest description of every `standards_master` text field today --
 * `standard_text` and `plain_language_summary` are HazLenz-authored paraphrase, never verbatim
 * CFR/MSHA language (established by the P1 standards-label integrity contract,
 * `verification/insite-p1-remediation-2026-08-16/P1_STANDARDS_INTEGRITY_CONTRACT.md`, which is
 * why the UI labels that tier "HazLenz standard summary" rather than "Official standard text").
 * Verbatim agency text is a SEPARATE, already-honest surface served from `regulatory_sections`
 * by the "Official regulation text" panel; this contract does not govern it and does not change it.
 */
export type StandardsContentDisclosure =
  | 'GOVERNED_APPROVED'
  | 'HAZLENZ_AUTHORED'
  | 'NONE';

export interface GovernedBackingInput {
  releaseId: string;
  /** Effective review state: frozen snapshot state overlaid with the latest checksum-bound decision. */
  effectiveReviewState: string | null;
  placeholderSource: boolean;
  /** Whether the governed release actually carries regulatory text or a summary. */
  hasContent: boolean;
}

export interface BackingResolutionInput {
  citation?: string | null;
  /** What corpus hydration returned. */
  sourceKey?: string | null;
  title?: string | null;
  standardText?: string | null;
  plainLanguageSummary?: string | null;
  /**
   * A resolved governed lookup, or null/undefined when no governed resolution was performed.
   *
   * The live customer path passes nothing. That is not a limitation being worked around -- with
   * no active release and zero reviewer-approved records, "not governed-approved" is the
   * TRUTHFUL answer for every citation today, and manufacturing an approval to avoid it is
   * exactly what KG-3A removed.
   */
  governed?: GovernedBackingInput | null;
}

export interface StandardsBacking {
  backingStatus: StandardsBackingStatus;
  /**
   * Backward-compatible boolean, DERIVED -- never computed independently. True only for
   * `APPROVED_GOVERNED_CONTENT`.
   */
  corpusBacked: boolean;
  contentDisclosure: StandardsContentDisclosure;
  /** Internal diagnostic. Never customer copy -- see `customerBackingNotice()` for that. */
  backingReason: string;
}

export const PLACEHOLDER_SOURCE_KEY_PREFIX = 'starter-unverified:';

export function isPlaceholderSourceKey(sourceKey: unknown): boolean {
  return String(sourceKey ?? '').startsWith(PLACEHOLDER_SOURCE_KEY_PREFIX);
}

const present = (value: unknown) => Boolean(String(value ?? '').trim());

/**
 * The single decision point. Order is load-bearing: the placeholder check runs before the
 * approval check, exactly as `assessReviewState` does, so a synthesized key can never be
 * laundered into an approved status by any caller.
 */
export function resolveStandardsBacking(input: BackingResolutionInput): StandardsBacking {
  const placeholder = isPlaceholderSourceKey(input.sourceKey);
  const hasCorpusContent = present(input.standardText) || present(input.plainLanguageSummary);
  // A corpus row is evidenced by a source key or by corpus content — NOT by a title. Titles
  // legitimately come from the in-code rule family when hydration found nothing, so treating a
  // title as proof of a corpus record would be the same loose inference this contract exists to
  // remove. Every finalized corpus row carries a source key, so `sourceKey` is a reliable
  // indicator; a rule-family title is not. Neither is ever enough to say the record is APPROVED.
  const hasCorpusRecord = present(input.sourceKey) || hasCorpusContent;

  const governed = input.governed ?? null;

  if (governed) {
    if (placeholder || governed.placeholderSource) {
      return {
        backingStatus: 'UNAPPROVED_CONTENT',
        corpusBacked: false,
        contentDisclosure: hasCorpusContent ? 'HAZLENZ_AUTHORED' : 'NONE',
        backingReason:
          'Source key is a synthesized placeholder; provenance is unestablished and cannot be ' +
          'approved without remediation.',
      };
    }
    if (governed.effectiveReviewState === 'reviewer_approved' && governed.hasContent) {
      return {
        backingStatus: 'APPROVED_GOVERNED_CONTENT',
        corpusBacked: true,
        contentDisclosure: 'GOVERNED_APPROVED',
        backingReason: `Reviewer-approved record with regulatory content in release ${governed.releaseId}.`,
      };
    }
    if (governed.effectiveReviewState === 'reviewer_approved' && !governed.hasContent) {
      // Approved, registered provenance, but the release carries nothing substantive to show.
      // Deliberately NOT a fourth public state: the customer-visible consequence is identical to
      // having no content, and the distinction is a corpus-remediation detail, not a display one.
      return {
        backingStatus: 'CITATION_ONLY',
        corpusBacked: false,
        contentDisclosure: 'NONE',
        backingReason:
          `Record is approved in release ${governed.releaseId} but carries no regulatory text or summary.`,
      };
    }
    return {
      backingStatus: hasCorpusRecord ? 'UNAPPROVED_CONTENT' : 'CITATION_ONLY',
      corpusBacked: false,
      contentDisclosure: hasCorpusContent ? 'HAZLENZ_AUTHORED' : 'NONE',
      backingReason:
        `Record in release ${governed.releaseId} is '${governed.effectiveReviewState ?? 'unresolved'}'; ` +
        'no reviewer has attested to this exact version.',
    };
  }

  if (!hasCorpusRecord) {
    return {
      backingStatus: 'CITATION_ONLY',
      corpusBacked: false,
      contentDisclosure: 'NONE',
      backingReason: 'No corpus record resolved for this citation.',
    };
  }

  return {
    backingStatus: 'UNAPPROVED_CONTENT',
    corpusBacked: false,
    contentDisclosure: hasCorpusContent ? 'HAZLENZ_AUTHORED' : 'NONE',
    backingReason: placeholder
      ? 'Corpus record has placeholder provenance and no governed approval.'
      : 'Corpus record exists but no governed release resolution establishes reviewer approval.',
  };
}

/**
 * KG-3B Phase 4 disposition, implemented.
 *
 * `guided-finding-response.ts` derived `sourceStatus` from `record?.reviewerApproved === true`,
 * a field `hydrateStandardReferences()` never selects -- so the approved branch was unreachable
 * and every customer received a non-approved value regardless of any real approval. Rather than
 * reviving the dead read (which would create a SECOND, independent notion of approval alongside
 * `backingStatus`), the field is now MAPPED from the canonical status. `sourceStatus` is retained
 * only for wire compatibility; `backingStatus` is the field to read.
 *
 * The three values are unchanged, so no client contract breaks:
 *
 *   approved-versioned-regulation    <- APPROVED_GOVERNED_CONTENT
 *   provisional-versioned-regulation <- UNAPPROVED_CONTENT with a regulation-authority decision
 *   source-review-required           <- everything else
 */
export function mapBackingToSourceStatus(
  backingStatus: StandardsBackingStatus,
  decisionAuthorityIsRegulation: boolean,
): 'approved-versioned-regulation' | 'provisional-versioned-regulation' | 'source-review-required' {
  if (backingStatus === 'APPROVED_GOVERNED_CONTENT') return 'approved-versioned-regulation';
  if (decisionAuthorityIsRegulation) return 'provisional-versioned-regulation';
  return 'source-review-required';
}

/**
 * The customer-facing notice for a backing status, or null when none is warranted.
 *
 * Deliberately in product voice and free of governance vocabulary -- no "reviewer_approved",
 * "release", "checksum", "corpus", "starter-unverified" or state names. The goal is a reader who
 * understands what they can rely on, not one who learns the internal model.
 *
 * `UNAPPROVED_CONTENT` returns null on purpose. The summary shown in that state is already
 * labelled "HazLenz standard summary" by the P1 label-integrity contract, which is a true and
 * sufficient statement of what it is; adding a second caution to the state that covers the ENTIRE
 * corpus today (0 of 26 records approved) would attach a warning to every standard in the
 * product, which reads as breakage rather than as precision. The distinction is instead carried
 * by the provenance line, which states positively when text IS verified.
 */
export function customerBackingNotice(backingStatus: StandardsBackingStatus): string | null {
  if (backingStatus === 'CITATION_ONLY') {
    return 'Verified standard text is not currently available for this citation.';
  }
  return null;
}
