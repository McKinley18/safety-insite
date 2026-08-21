/**
 * KG-4A Phases 7 and 8 -- truthful release-provenance propagation, including MIXED provenance.
 *
 * THE ONE RULE, from the KG-4A brief, restated because everything here is a consequence of it:
 *
 *      `knowledgeReleaseId` may become non-NULL ONLY when the customer-visible analysis actually
 *      consumed governed release information in a way covered by the provenance contract.
 *
 * KG-1 set this column to NULL unconditionally, and was right to: the retrieval path did not
 * consume governed data, so any id would have been false. KG-4A does not relax that rule -- it
 * supplies the missing evidence for it. A release id is written only when at least one finding's
 * fallback decision returned `governedProvenanceEligible`, which is true only where governed
 * content actually changed what the customer sees.
 *
 * WHY SHADOW STAYS NULL. A shadow run reads the release, resolves every citation, and records a
 * comparison -- and changes nothing the customer receives. "The server consulted a release" and
 * "this analysis was governed by that release" are different claims. Marking a shadow analysis as
 * governed would make the whole shadow programme unfalsifiable: every subsequent audit would show
 * governed provenance on analyses whose output was, by construction, legacy.
 *
 * MIXED PROVENANCE (Phase 8). A real analysis has several findings and they need not agree:
 *
 *      finding A  approved governed content        -> governed
 *      finding B  fell back to legacy text         -> NOT governed
 *      finding C  citation-only                    -> governed (the release decided the outcome)
 *      finding D  applicability uncertain          -> whichever its BACKING was; uncertainty is
 *                                                     an applicability fact and never a provenance one
 *
 * A single analysis-level id cannot express that, so this module keeps BOTH levels and constrains
 * them. The existing schema is sufficient -- `hazlenz_analyses.knowledgeReleaseId` and
 * `inspection_findings.knowledgeReleaseId` both already exist from KG-1 -- so no migration, no new
 * column and no standard-level table is introduced. The brief's "do not over-engineer if existing
 * finding-level fields are sufficient" applies, and they are.
 */

import {
  resolveKnowledgeReleaseProvenance,
  type KnowledgeRetrievalScoping,
  type KnowledgeReleaseResolution,
} from '../../inspection/knowledge-release-provenance';
import type { GovernedReleasePin } from './governed-resolution';
import type { FallbackDecision } from './fallback-contract';
import { enforceShadowProvenanceInvariant } from './shadow-provenance-invariant';

/** One finding's contribution to the analysis's provenance. */
export interface FindingProvenanceContribution {
  findingKey: string;
  citation: string;
  /** Straight from `decideFallback()`. Never recomputed here. */
  governedProvenanceEligible: boolean;
}

export interface AnalysisProvenanceResult {
  /** What to persist on `hazlenz_analyses.knowledgeReleaseId`. */
  analysisKnowledgeReleaseId: string | null;
  /**
   * What to persist per finding. A finding is either governed by the SAME release as its analysis
   * or by none -- never by a different one. That preserves the KG-1 invariant (a finding can never
   * claim a release its analysis did not use) while allowing a fallen-back finding to say NULL,
   * which is what makes mixed provenance truthful rather than merely tolerated.
   */
  findingKnowledgeReleaseIds: Record<string, string | null>;
  /** True when the findings disagree -- the case a single analysis-level id cannot explain alone. */
  mixed: boolean;
  governedFindingCount: number;
  totalFindingCount: number;
  reason: string;
  /**
   * KG-4C. True when the SHADOW provenance invariant had to coerce an id to NULL.
   *
   * Under every correct code path this is false, because SHADOW already produces NULL by three
   * independent mechanisms. It exists so that if a future change breaks one of them, the breach is
   * a counted hard-invariant violation that stops shadow, rather than a silently persisted false
   * provenance stamp on a real customer record.
   */
  shadowProvenanceViolation: boolean;
}

/**
 * Translates a pin plus the findings' actual consumption into KG-1's scoping vocabulary.
 *
 * Deliberately routed through KG-1's `resolveKnowledgeReleaseProvenance()` rather than writing the
 * id directly, so KG-1's own guards (empty id, over-long id) still run and there remains exactly
 * one function that decides what a truthful release id looks like.
 */
export function describeGovernedRetrievalScoping(
  pin: GovernedReleasePin,
  contributions: readonly FindingProvenanceContribution[],
): KnowledgeRetrievalScoping {
  if (pin.mode === 'LEGACY') {
    return {
      mode: 'unscoped_corpus',
      reason: 'Cutover mode is LEGACY: the governed resolver did not run and no release informed this analysis.',
    };
  }
  if (pin.mode === 'SHADOW') {
    return {
      mode: 'unscoped_corpus',
      reason:
        'Cutover mode is SHADOW: governed resolution ran for comparison only and did not influence ' +
        'any customer-visible result. A background comparison is not consumption.',
    };
  }
  if (!pin.releaseId) {
    return {
      mode: 'unscoped_corpus',
      reason: `Governed mode was active but no release was pinned (${pin.reason}); retrieval fell back to the unscoped corpus.`,
    };
  }
  const consumed = contributions.filter((item) => item.governedProvenanceEligible);
  if (!consumed.length) {
    return {
      mode: 'unscoped_corpus',
      reason:
        `Governed mode was active and release ${pin.releaseId} was pinned, but no finding consumed ` +
        'governed content -- every citation fell back to legacy behaviour, so the customer-visible ' +
        'result is identical to LEGACY and naming a release would be false provenance.',
    };
  }
  return {
    mode: 'single_release',
    releaseId: pin.releaseId,
    reason:
      `${consumed.length} of ${contributions.length} findings consumed governed content from the ` +
      `pinned release ${pin.releaseId}, which was read once at analysis start and used for every ` +
      'resolution in this analysis.',
  };
}

/**
 * The analysis-level and finding-level provenance for one analysis.
 *
 * Note the asymmetry, which is intentional: the ANALYSIS is governed if ANY finding consumed
 * governed content (that is what "this analysis used release X" means -- release X is materially
 * present in it), while a FINDING is governed only if IT consumed governed content. Reading the
 * analysis id alone therefore never tells you a specific finding was governed; the finding row does.
 * `mixed` is surfaced so a reader of the analysis row knows to look.
 */
export function resolveAnalysisProvenance(
  pin: GovernedReleasePin,
  contributions: readonly FindingProvenanceContribution[],
): AnalysisProvenanceResult {
  const scoping = describeGovernedRetrievalScoping(pin, contributions);
  const resolved: KnowledgeReleaseResolution = resolveKnowledgeReleaseProvenance(scoping);
  const analysisId = resolved.knowledgeReleaseId;

  const findingKnowledgeReleaseIds: Record<string, string | null> = {};
  let governedFindingCount = 0;
  for (const contribution of contributions) {
    const governed = Boolean(analysisId) && contribution.governedProvenanceEligible;
    if (governed) governedFindingCount += 1;
    findingKnowledgeReleaseIds[contribution.findingKey] = governed ? analysisId : null;
  }

  const candidate: AnalysisProvenanceResult = {
    analysisKnowledgeReleaseId: analysisId,
    findingKnowledgeReleaseIds,
    mixed: Boolean(analysisId) && governedFindingCount > 0 && governedFindingCount < contributions.length,
    governedFindingCount,
    totalFindingCount: contributions.length,
    reason: resolved.reason,
    shadowProvenanceViolation: false,
  };

  // KG-4C. The last gate before a release id can be persisted. In every mode but SHADOW this is a
  // pass-through; in SHADOW it coerces to NULL and reports, so a broken upstream mechanism cannot
  // put a false provenance stamp on a customer record. It corrects rather than throws because the
  // caller is inside a customer request -- see `shadow-provenance-invariant.ts`.
  const enforced = enforceShadowProvenanceInvariant(pin.mode, candidate);
  return enforced.violated
    ? {
        ...enforced.result,
        mixed: false,
        governedFindingCount: 0,
        reason:
          'SHADOW provenance invariant coerced this analysis to NULL provenance. ' +
          enforced.violations.join(', '),
        shadowProvenanceViolation: true,
      }
    : enforced.result;
}

/**
 * Rollback safety check (Phase 14), as an assertion rather than as documentation.
 *
 * Rollback means changing the MODE. It must never mean rewriting an analysis that was truthfully
 * governed when it ran: that record is historically accurate and stays accurate. This predicate
 * exists so `test:kg4a-rollback` can state the property directly -- a historical id is preserved
 * regardless of what the mode is now.
 */
export function historicalProvenanceIsPreserved(
  persistedBeforeRollback: string | null,
  persistedAfterRollback: string | null,
): boolean {
  // Deliberately plain equality, including the NULL case. Rollback changes the MODE, and the mode
  // is consulted only when an analysis is CREATED -- a persisted row is never recomputed, so the
  // correct assertion is that the stored value did not move at all, in either direction. A
  // previously-governed analysis must not become NULL, and a previously-legacy one must not
  // acquire an id.
  return persistedBeforeRollback === persistedAfterRollback;
}
