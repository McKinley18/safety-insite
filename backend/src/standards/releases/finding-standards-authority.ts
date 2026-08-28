import { DataSource } from 'typeorm';
import { releaseCitationKey } from './citation-identity';
import { ReleaseRecordReviewState } from './review-state';

/**
 * FINDING-LEVEL GOVERNED STANDARDS AUTHORITY — 2026-08-28.
 *
 * =====================================================================================
 * WHAT THIS ANSWERS
 * =====================================================================================
 *
 * A customer finding's citations come from `evidence-foundation.ts`, a code-resident rule set with
 * no database, no release and no review state. `governed-corpus-lookup.ts` holds the governed
 * contract but is a SHADOW evaluator wired into no customer path. So today a finding's citation
 * can be honest only by omission: it never claims governed authority because nothing ever grants
 * it.
 *
 * Wiring governed authority into that path creates exactly one new way to mislead a customer:
 * labelling code-resident output as reviewer-approved regulation. This module is the single place
 * that grants — or refuses — that label, so there is one rule rather than one per call site.
 *
 * =====================================================================================
 * AUTHORITY COMES FROM IDENTITY AND MEMBERSHIP, NEVER FROM THE CITATION STRING
 * =====================================================================================
 *
 * The code-resident rules emit citation STRINGS, and several are strings the governed release also
 * holds. If authority were derived from the string, a rule firing on evidence no reviewer ever saw
 * would inherit that reviewer's approval. So a citation earns governed authority only when ALL of:
 *
 *   1. a governed record with that citation IDENTITY (`releaseCitationKey`, not the raw string) is
 *      a MEMBER of the release governing this finding; and
 *   2. that member's EFFECTIVE review state is `reviewer_approved` in THAT release; and
 *   3. the member carries usable regulatory content.
 *
 * Approval is scoped to the release it was granted in and does not travel between releases.
 *
 * =====================================================================================
 * THE STATES
 * =====================================================================================
 *
 *   APPROVED_GOVERNED_CONTENT      all three conditions hold. The ONLY state that may be presented
 *                                  as reviewed, governed regulation.
 *   UNAPPROVED_GOVERNED_CONTENT    a release member exists but is not reviewer-approved, or is
 *                                  approved with no usable content. Its text may be correct;
 *                                  nothing attests to it.
 *   REJECTED_GOVERNED_CONTENT      a governed record for this citation exists in the source corpus
 *                                  but is EXCLUDED from the release governing this finding. For
 *                                  the reviewed release that is precisely what a
 *                                  REJECT_CORRECTION_REQUIRED disposition produces, and it is the
 *                                  laundering route this module exists to close: the citation
 *                                  string is emittable by a code rule and the record is present in
 *                                  the corpus, so only membership tells them apart.
 *   LEGACY_CODE_RESIDENT_CONTENT   the candidate never went through governed resolution. Retained
 *                                  as a fallback the contract permits, and never confusable with
 *                                  governed authority.
 *   NO_GOVERNED_MATCH              governed resolution ran and found no record at all.
 *
 * =====================================================================================
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 * =====================================================================================
 *
 * It does not decide whether a hazard exists, and it never suppresses one. Regulatory authority
 * and hazard recognition are separate concerns: a finding whose standards resolve to
 * `NO_GOVERNED_MATCH` is a finding with an honest authority label, NOT a finding that disappears.
 * It also does not activate, select or prefer a release — the caller names the release that governs
 * the finding, so a persisted finding can be re-resolved against the release it was created under.
 */

export type FindingAuthorityState =
  | 'APPROVED_GOVERNED_CONTENT'
  | 'UNAPPROVED_GOVERNED_CONTENT'
  | 'REJECTED_GOVERNED_CONTENT'
  | 'LEGACY_CODE_RESIDENT_CONTENT'
  | 'NO_GOVERNED_MATCH';

export interface FindingStandardAuthority {
  citation: string;
  citationKey: string;
  /** The release the caller asked this citation to be resolved under. */
  releaseId: string | null;
  state: FindingAuthorityState;
  /** True only when the citation identity is a member of `releaseId`. */
  releaseMember: boolean;
  effectiveReviewState: ReleaseRecordReviewState | null;
  /** Reviewer attribution, populated ONLY for an approved member of this release. */
  reviewerId: string | null;
  reviewerRole: string | null;
  decidedAt: string | null;
  /** Pins the exact record version the finding cited, for deterministic reconstruction. */
  recordChecksum: string | null;
  /** Derived from `state`; true only for APPROVED_GOVERNED_CONTENT. Never computed from a source key. */
  corpusBacked: boolean;
  /** Whose words any displayed regulatory text is. */
  contentDisclosure: 'GOVERNED_APPROVED' | 'HAZLENZ_AUTHORED' | 'NONE';
  jurisdiction: string | null;
  reason: string;
}

export interface FindingAuthorityRequest {
  citation: string;
  /** The release governing this finding. `null` means no release governs it. */
  releaseId: string | null;
  /**
   * Set when the caller is deliberately NOT consulting governed authority (offline, no release
   * bound, or a path that has not been integrated). The result is `LEGACY_CODE_RESIDENT_CONTENT`,
   * which is honest, and it can never be `APPROVED_GOVERNED_CONTENT`.
   */
  skipGovernedResolution?: boolean;
}

function legacy(citation: string, citationKey: string, releaseId: string | null, reason: string): FindingStandardAuthority {
  return {
    citation, citationKey, releaseId,
    state: 'LEGACY_CODE_RESIDENT_CONTENT',
    releaseMember: false,
    effectiveReviewState: null, reviewerId: null, reviewerRole: null, decidedAt: null,
    recordChecksum: null, corpusBacked: false, contentDisclosure: 'HAZLENZ_AUTHORED',
    jurisdiction: null, reason,
  };
}

/**
 * Resolves the authority state of ONE citation on ONE finding, under ONE named release.
 *
 * Read-only. It issues SELECTs and nothing else, so it can never mutate a corpus, a release or a
 * review ledger, and it never consults an activation pointer.
 */
export async function resolveFindingStandardAuthority(
  dataSource: DataSource,
  request: FindingAuthorityRequest,
): Promise<FindingStandardAuthority> {
  const citation = String(request.citation || '').trim();
  const citationKey = citation ? releaseCitationKey(citation) : '';
  const releaseId = request.releaseId ?? null;

  if (!citation) return legacy(citation, citationKey, releaseId, 'No citation to resolve.');
  if (request.skipGovernedResolution) {
    return legacy(citation, citationKey, releaseId,
      'Governed resolution was not consulted for this candidate; it carries no governed authority.');
  }
  if (!releaseId) {
    return legacy(citation, citationKey, null,
      'No knowledge release governs this finding, so no governed authority can be claimed.');
  }

  // Membership and effective review state, in ONE query, keyed by citation IDENTITY.
  const member = await dataSource.query(
    `SELECT r."recordChecksum",
            r."reviewState"          AS frozen_state,
            r.payload->>'scope'      AS jurisdiction,
            r.payload->>'summary'    AS summary,
            r.payload->>'canonicalText' AS canonical_text,
            v.decision               AS decision,
            v."reviewerId"           AS reviewer_id,
            v."reviewerRole"         AS reviewer_role,
            v."decidedAt"            AS decided_at
       FROM regulatory_release_records r
       LEFT JOIN LATERAL (
         SELECT decision, "reviewerId", "reviewerRole", "decidedAt"
           FROM regulatory_release_record_reviews
          WHERE "releaseId" = r."releaseId" AND "citationKey" = r."citationKey"
          ORDER BY "decidedAt" DESC LIMIT 1
       ) v ON TRUE
      WHERE r."releaseId" = $1 AND r."citationKey" = $2
      LIMIT 1`,
    [releaseId, citationKey],
  );

  if (!member.length) {
    // Not a member. Distinguish "the governed corpus knows this regulation but this release
    // excludes it" from "nothing governed knows it at all" — the first is the laundering route.
    const inCorpus = await dataSource.query(
      `SELECT 1 FROM standards_master WHERE $1 = ANY(ARRAY[citation]) LIMIT 1`, [citation],
    ).catch(() => [] as unknown[]);
    const knownElsewhere = inCorpus.length > 0 || (await dataSource.query(
      `SELECT 1 FROM regulatory_release_records WHERE "citationKey" = $1 LIMIT 1`, [citationKey],
    )).length > 0;
    return {
      citation, citationKey, releaseId,
      state: knownElsewhere ? 'REJECTED_GOVERNED_CONTENT' : 'NO_GOVERNED_MATCH',
      releaseMember: false,
      effectiveReviewState: null, reviewerId: null, reviewerRole: null, decidedAt: null,
      recordChecksum: null, corpusBacked: false, contentDisclosure: 'HAZLENZ_AUTHORED',
      jurisdiction: null,
      reason: knownElsewhere
        ? `A governed record for ${citation} exists but is NOT a member of ${releaseId}; it carries no authority under this release.`
        : `${releaseId} holds no record for ${citation}.`,
    };
  }

  const row = member[0];
  const approved = row.decision === 'approved';
  const hasContent = Boolean(String(row.summary || '').trim() || String(row.canonical_text || '').trim());
  const effective: ReleaseRecordReviewState | null = approved
    ? 'reviewer_approved'
    : (row.frozen_state as ReleaseRecordReviewState | null) ?? null;

  if (approved && hasContent) {
    return {
      citation, citationKey, releaseId,
      state: 'APPROVED_GOVERNED_CONTENT',
      releaseMember: true,
      effectiveReviewState: 'reviewer_approved',
      reviewerId: row.reviewer_id ?? null,
      reviewerRole: row.reviewer_role ?? null,
      decidedAt: row.decided_at ? new Date(row.decided_at).toISOString() : null,
      recordChecksum: row.recordChecksum ?? null,
      corpusBacked: true,
      contentDisclosure: 'GOVERNED_APPROVED',
      jurisdiction: row.jurisdiction ?? null,
      reason: `Reviewer-approved member of ${releaseId} carrying regulatory content.`,
    };
  }

  return {
    citation, citationKey, releaseId,
    state: 'UNAPPROVED_GOVERNED_CONTENT',
    releaseMember: true,
    effectiveReviewState: effective,
    // Reviewer attribution is withheld unless the decision actually approved this record: an
    // unapproved or revoked record must never carry a reviewer's name.
    reviewerId: null, reviewerRole: null, decidedAt: null,
    recordChecksum: row.recordChecksum ?? null,
    corpusBacked: false,
    contentDisclosure: 'HAZLENZ_AUTHORED',
    jurisdiction: row.jurisdiction ?? null,
    reason: approved
      ? `Member of ${releaseId} is reviewer-approved but carries no usable regulatory content.`
      : `Member of ${releaseId} is not reviewer-approved (effective state: ${effective ?? 'unknown'}).`,
  };
}
