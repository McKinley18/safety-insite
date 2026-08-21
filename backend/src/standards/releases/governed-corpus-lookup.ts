import { DataSource } from 'typeorm';
import { releaseCitationKey } from './citation-identity';
import { ReleaseRecordReviewState } from './review-state';
import { EFFECTIVE_STATE_SQL } from './release-record-review.service';

/**
 * KG-3B -- the governed corpus-backing contract (Phases 11 and 12), as a SHADOW evaluator.
 *
 * NOT WIRED INTO ANY CUSTOMER PATH. Nothing imports this outside `standards/releases/` and the
 * KG-3B verification scripts. `grep` proof is part of the KG-3B verification record. It exists so
 * the contract can be measured before it is adopted, which is exactly what KG-3A showed was
 * missing: the tracked 31-case gold set exercises `applyFindingScopedStandards()`, which has no
 * database access at all, so it is structurally incapable of detecting what release scoping does
 * to corpus enrichment.
 *
 * WHAT THE LIVE PATH DOES TODAY (measured, see the KG-3B consumer map):
 *
 *   `ApplicableStandardsService.hydrateStandardReferences()` matches a code-selected citation
 *   against `standards_master` with `is_active = true` and a fuzzy `citation ILIKE '%needle%'`,
 *   with no release scope and no review-state condition. `safescope-v2.service.ts` then sets
 *   `corpusBacked = Boolean(hydrated?.sourceKey)`.
 *
 * That last line is the reason this module defines backing as a graded contract rather than a
 * boolean. After finalization every corpus row has a `source_key`, because the finalizer
 * synthesizes `starter-unverified:<agency>:<citation>` for rows that arrived without one. So
 * `corpusBacked` is currently satisfied by a placeholder literally named "unverified", and it is
 * satisfied whether or not the row carries any regulatory text.
 *
 * THE CONTRACT. A citation is `CORPUS_BACKED` only when the governed release can supply a
 * reviewer-approved record that actually carries regulatory content:
 *
 *   CORPUS_BACKED       an approved record for this exact citation exists in the release AND
 *                       carries regulatory text or a plain-language summary, plus a registered
 *                       (non-placeholder) source. This is the only state that may present
 *                       standard text as authoritative regulation.
 *   APPROVED_NO_TEXT    approved, registered source, but no usable text. The citation and title
 *                       are trustworthy; there is no regulatory text to display.
 *   UNAPPROVED_RECORD   a record exists but is not reviewer-approved. Its text exists and may be
 *                       correct, but nothing attests to it.
 *   NOT_IN_RELEASE      the governed release holds no record for this citation.
 *   CITATION_ONLY       no citation could be resolved at all.
 *
 * Note what the contract does NOT do: it never claims backing on the strength of a source key
 * alone, and it never treats `approved_for_auto_ingestion` as evidence of review.
 */

export type CorpusBackingState =
  | 'CORPUS_BACKED'
  | 'APPROVED_NO_TEXT'
  | 'UNAPPROVED_RECORD'
  | 'NOT_IN_RELEASE'
  | 'CITATION_ONLY';

export interface GovernedCorpusResolution {
  citation: string;
  citationKey: string;
  releaseId: string;
  backing: CorpusBackingState;
  /** True only for CORPUS_BACKED. The single boolean a future live path should trust. */
  corpusBacked: boolean;
  frozenReviewState: ReleaseRecordReviewState | null;
  effectiveReviewState: ReleaseRecordReviewState | null;
  recordChecksum: string | null;
  title: string | null;
  /** Authoritative regulatory text, from the release snapshot -- never from the live corpus. */
  standardText: string | null;
  plainLanguageSummary: string | null;
  agency: string | null;
  jurisdiction: string | null;
  sourceKey: string | null;
  sourceName: string | null;
  authorityTier: string | null;
  placeholderSource: boolean;
  reason: string;
}

/**
 * PHASE 12 -- recommended product behavior when governed backing is missing.
 *
 * The options considered were: (A) suppress the citation, (B) show the citation but mark the
 * regulatory text unavailable, (C) fall back to the unapproved corpus row, (D) fail the
 * standards result.
 *
 * The recommendation is (B), and it is a recommendation only -- KG-3B does NOT implement it in
 * any customer path. The reasoning, which follows from how the system actually works rather than
 * from convenience:
 *
 *  - (A) suppress is wrong because citation SELECTION is in code and has no corpus dependency
 *    (KG-3A §12). Suppressing on missing backing would delete a correct, evidence-derived
 *    citation because of a governance gap in a different subsystem, turning an unreviewed
 *    corpus into silently degraded hazard reasoning. Today's measurement makes the scale
 *    concrete: it would remove all 24 distinct gold-set citations.
 *  - (C) fall back to the unapproved corpus is the exact failure KG-3A closed. It presents text
 *    nobody attested to as authoritative regulation -- false regulatory authority, which is the
 *    most serious of the four risks.
 *  - (D) fail the result destroys useful hazard reasoning for a reason the user cannot act on.
 *  - (B) keeps every citation the evidence supports, keeps the hazard reasoning, and refuses to
 *    render unattested text as regulation. The one thing it must not do is show the citation
 *    with NO indication that the regulatory text is unverified, because the current UI presents
 *    hydrated text and HazLenz-generated text in the same visual slot.
 *
 * Implementing (B) requires a display-layer distinction that does not exist yet: `corpusBacked`
 * is a boolean and the UI has no "regulatory text unavailable" state. That is the KG-3C work.
 */
export const MISSING_BACKING_RECOMMENDED_BEHAVIOR = 'B_SHOW_CITATION_MARK_TEXT_UNVERIFIED';

interface GovernedRow {
  citation: string;
  citationKey: string;
  recordChecksum: string;
  frozenState: ReleaseRecordReviewState;
  effectiveState: ReleaseRecordReviewState;
  payload: Record<string, any>;
}

function isPlaceholder(sourceKey: unknown): boolean {
  return String(sourceKey || '').startsWith('starter-unverified:');
}

function jurisdictionOf(payload: Record<string, any>): string | null {
  const agency = payload?.agency ?? null;
  const scope = payload?.scope ?? null;
  if (!agency && !scope) return null;
  return [agency, scope].filter(Boolean).join('/');
}

/**
 * Resolves one code-selected citation against a specific governed release.
 *
 * Reads the release SNAPSHOT (`regulatory_release_records.payload`), never `standards_master`.
 * That is what makes the answer historically stable: a finding recorded under release A resolves
 * A's text even after release B revises the same citation.
 */
export async function resolveGovernedCitation(
  dataSource: DataSource, releaseId: string, citation: string,
): Promise<GovernedCorpusResolution> {
  const citationKey = releaseCitationKey(citation);

  const base = (backing: CorpusBackingState, reason: string): GovernedCorpusResolution => ({
    citation, citationKey, releaseId, backing, corpusBacked: backing === 'CORPUS_BACKED',
    frozenReviewState: null, effectiveReviewState: null, recordChecksum: null,
    title: null, standardText: null, plainLanguageSummary: null, agency: null,
    jurisdiction: null, sourceKey: null, sourceName: null, authorityTier: null,
    placeholderSource: false, reason,
  });

  if (!citationKey) {
    return base('CITATION_ONLY', 'No resolvable citation identity.');
  }

  const [row]: GovernedRow[] = await dataSource.query(
    `SELECT e.citation, e."citationKey", e."recordChecksum", e."frozenState", e."effectiveState",
            r.payload
       FROM (${EFFECTIVE_STATE_SQL}) AS e
       JOIN regulatory_release_records r
         ON r."releaseId" = $1 AND r."citationKey" = e."citationKey"
      WHERE e."citationKey" = $2`,
    [releaseId, citationKey],
  );

  if (!row) {
    return base('NOT_IN_RELEASE', `Release ${releaseId} holds no record for '${citationKey}'.`);
  }

  const payload = row.payload || {};
  const standardText = payload.canonicalText ?? null;
  const summary = payload.summary ?? null;
  const sourceKey = payload.sourceKey ?? null;
  const placeholder = isPlaceholder(sourceKey);
  const hasText = Boolean(String(standardText || '').trim() || String(summary || '').trim());

  const resolved: GovernedCorpusResolution = {
    citation: row.citation,
    citationKey,
    releaseId,
    backing: 'UNAPPROVED_RECORD',
    corpusBacked: false,
    frozenReviewState: row.frozenState,
    effectiveReviewState: row.effectiveState,
    recordChecksum: row.recordChecksum,
    title: payload.title ?? null,
    standardText,
    plainLanguageSummary: summary,
    agency: payload.agency ?? null,
    jurisdiction: jurisdictionOf(payload),
    sourceKey,
    sourceName: payload.sourceName ?? null,
    authorityTier: payload.authorityTier ?? null,
    placeholderSource: placeholder,
    reason: '',
  };

  if (row.effectiveState !== 'reviewer_approved') {
    return {
      ...resolved,
      backing: 'UNAPPROVED_RECORD',
      reason: `Record exists but is '${row.effectiveState}'; no reviewer has attested to this content.`,
    };
  }
  // A placeholder source cannot reach `reviewer_approved` -- the review service refuses to
  // approve an `unreviewed` record, and `assessReviewState` freezes placeholders as unreviewed.
  // Checked anyway: a governed contract should not depend on another module's gate holding.
  if (placeholder) {
    return {
      ...resolved,
      backing: 'UNAPPROVED_RECORD',
      reason: `Record is approved but its source key '${sourceKey}' is a synthesized placeholder.`,
    };
  }
  if (!hasText) {
    return {
      ...resolved,
      backing: 'APPROVED_NO_TEXT',
      reason: 'Approved with registered provenance, but the release carries no regulatory text or summary.',
    };
  }
  return {
    ...resolved,
    backing: 'CORPUS_BACKED',
    corpusBacked: true,
    reason: `Reviewer-approved record from '${sourceKey}' with regulatory content, frozen in ${releaseId}.`,
  };
}

/**
 * The legacy (current, unscoped) resolution, reproduced for shadow comparison.
 *
 * Deliberately mirrors what `hydrateStandardReferences` actually does -- `is_active = true`, a
 * fuzzy `ILIKE` on the citation, no release scope, no review condition -- rather than what it
 * ought to do. A shadow comparison against an idealized legacy path would understate the
 * difference the governed contract makes.
 */
export async function resolveLegacyCitation(
  dataSource: DataSource, citation: string,
): Promise<{
  matched: boolean; citation: string | null; title: string | null; standardText: string | null;
  plainLanguageSummary: string | null; sourceKey: string | null; agency: string | null;
  placeholderSource: boolean; corpusBackedUnderCurrentRule: boolean;
}> {
  const needle = String(citation || '')
    .replace(/^(29|30)\s*CFR\s*/i, '')
    .replace(/§/g, '')
    .trim();
  const empty = {
    matched: false, citation: null, title: null, standardText: null, plainLanguageSummary: null,
    sourceKey: null, agency: null, placeholderSource: false, corpusBackedUnderCurrentRule: false,
  };
  if (!needle) return empty;

  const [row] = await dataSource.query(
    `SELECT citation, title, standard_text, plain_language_summary, source_key, agency_code
       FROM standards_master
      WHERE is_active = true AND citation ILIKE $1
      ORDER BY length(citation) ASC
      LIMIT 1`,
    [`%${needle}%`],
  );
  if (!row) return empty;

  return {
    matched: true,
    citation: row.citation,
    title: row.title ?? null,
    standardText: row.standard_text ?? null,
    plainLanguageSummary: row.plain_language_summary ?? null,
    sourceKey: row.source_key ?? null,
    agency: row.agency_code ?? null,
    placeholderSource: isPlaceholder(row.source_key),
    // Reproduces `corpusBacked = Boolean(hydrated?.sourceKey)` from safescope-v2.service.ts.
    corpusBackedUnderCurrentRule: Boolean(row.source_key),
  };
}

export type BackingDifference =
  | 'IDENTICAL'
  | 'GOVERNED_ONLY'
  | 'LEGACY_ONLY_LOSES_BACKING'
  | 'BOTH_MISSING'
  | 'TEXT_DIFFERS'
  | 'LEGACY_PLACEHOLDER_BACKING_REMOVED';

/** Classifies what changes for one citation if the governed contract replaced the current rule. */
export function classifyDifference(
  legacy: Awaited<ReturnType<typeof resolveLegacyCitation>>,
  governed: GovernedCorpusResolution,
): BackingDifference {
  if (!legacy.corpusBackedUnderCurrentRule && !governed.corpusBacked) return 'BOTH_MISSING';
  if (!legacy.corpusBackedUnderCurrentRule && governed.corpusBacked) return 'GOVERNED_ONLY';
  if (legacy.corpusBackedUnderCurrentRule && !governed.corpusBacked) {
    // Worth separating: backing conferred purely by a synthesized placeholder key is backing the
    // current rule should never have granted, so removing it is a correction, not a regression.
    return legacy.placeholderSource ? 'LEGACY_PLACEHOLDER_BACKING_REMOVED' : 'LEGACY_ONLY_LOSES_BACKING';
  }
  const legacyText = String(legacy.standardText || legacy.plainLanguageSummary || '').trim();
  const governedText = String(governed.standardText || governed.plainLanguageSummary || '').trim();
  return legacyText === governedText ? 'IDENTICAL' : 'TEXT_DIFFERS';
}
