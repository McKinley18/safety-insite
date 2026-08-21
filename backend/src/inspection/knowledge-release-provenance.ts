/**
 * KG-1 -- Knowledge release provenance resolution.
 *
 * One place decides which governed knowledge release informed a HazLenz analysis. The
 * decision is made once, at the authoritative analysis-persistence layer, and everything
 * downstream (findings, reports) inherits the persisted value rather than re-deciding.
 *
 * The rule this module exists to enforce: `knowledgeReleaseId` names the release that was
 * ACTUALLY and DETERMINISTICALLY used. It is never the newest release, never the most
 * recently finalized one, never "active" inferred from a timestamp. When the live
 * retrieval path draws from an unscoped corpus, the honest answer is NULL. Unknown
 * provenance is better than false provenance.
 */

/**
 * How the live knowledge/standards retrieval path is scoped when an analysis runs.
 *
 * `unscoped_corpus` -- retrieval may draw from records that are not constrained to a
 * single release, so no one release governed the result.
 * `single_release`  -- retrieval is provably constrained to exactly one release, whose id
 * can be recorded truthfully.
 */
export type KnowledgeRetrievalScoping =
  | { mode: 'unscoped_corpus'; reason: string }
  | { mode: 'single_release'; releaseId: string; reason: string };

export interface KnowledgeReleaseResolution {
  knowledgeReleaseId: string | null;
  reason: string;
}

/**
 * The measured, current truth about production retrieval, as of KG-1.
 *
 * `ApplicableStandardsService` queries `standards_master` filtered only by
 * `s.is_active = true` plus jurisdiction (agency/scope) predicates -- it never filters on
 * `release_id` or `reviewer_approved` -- and additionally draws candidates from
 * `safescope_knowledge_chunks` and from in-code knowledge shards that carry no release id
 * at all.
 *
 * KG-2 added a real release lifecycle and an active-release pointer
 * (`standards/releases/regulatory-release-lifecycle.service.ts`). That deliberately does NOT
 * change the answer here, and this function must not consult the pointer. "A governed
 * release is active" and "this analysis used only that release" are different claims, and
 * collapsing them would put a release id on an analysis that in fact selected standards from
 * the whole unscoped corpus -- precisely the false provenance KG-1 exists to prevent.
 *
 * Therefore no single release can be named for an analysis today. This function may only
 * change when the RETRIEVAL PATH itself becomes release-scoped and that change is verified
 * (KG-3) -- never to make the column non-null.
 */
export function describeLiveKnowledgeRetrievalScoping(): KnowledgeRetrievalScoping {
  return {
    mode: 'unscoped_corpus',
    reason:
      'Standards retrieval is not scoped to a knowledge release: standards_master is filtered ' +
      'only by is_active and jurisdiction, and candidates are also drawn from knowledge chunks ' +
      'and in-code shards. A KG-2 active-release pointer may exist, but the retrieval path does ' +
      'not consume it, so no single release governed this analysis.',
  };
}

/**
 * Resolves the provenance value to persist on an analysis.
 *
 * The scoping argument exists so provenance-propagation mechanics can be exercised against
 * a deterministic fixture without inventing production semantics; production always uses
 * the measured live scoping above.
 */
export function resolveKnowledgeReleaseProvenance(
  scoping: KnowledgeRetrievalScoping = describeLiveKnowledgeRetrievalScoping(),
): KnowledgeReleaseResolution {
  if (scoping.mode === 'single_release') {
    const releaseId = scoping.releaseId.trim();
    // An empty or over-long id is not a truthful release name; record nothing rather than
    // something that cannot be resolved back to a real release.
    if (!releaseId || releaseId.length > 120) {
      return {
        knowledgeReleaseId: null,
        reason: 'Retrieval reported a single release but supplied no usable release id.',
      };
    }
    return { knowledgeReleaseId: releaseId, reason: scoping.reason };
  }
  return { knowledgeReleaseId: null, reason: scoping.reason };
}
