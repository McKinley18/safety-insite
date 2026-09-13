/**
 * EXPERT HAZLENZ -- the authority merge layer.
 *
 * THREE AUTHORITIES MEET HERE AND NONE OF THEM IS FLATTENED:
 *
 *      A. DETERMINISTIC_AUTHORITY          protected Level-1 HazLenz
 *      B. GOVERNED_REGULATORY_AUTHORITY    approved corpus, active release, finding-level backing
 *      C. EXPERT_ADVISORY                  this phase
 *
 * A consumer must be able to tell them apart, so `MergedIntelligence` keeps three separate,
 * separately typed collections and every entry carries its own `source`. There is no combined
 * `findings: []` array, because the moment one exists somebody downstream renders it and the
 * distinction that makes Expert safe disappears into a list.
 *
 * ==================== WHY REMOVAL IS STRUCTURAL, NOT POLICED ====================
 *
 * `mergeExpertIntelligence` never reads an Expert value to decide what a deterministic or governed
 * entry should be. It copies A verbatim, copies B verbatim, and APPENDS C. There is no branch in
 * this file where an Expert field influences a protected one -- so "Expert cannot remove a Level-1
 * hazard" is a property of the data flow rather than a rule the code remembers.
 *
 * `verifyMergeInvariants()` then checks that claim against the inputs after the fact, and the merge
 * suite runs it on every scenario including the adversarial ones. Two mechanisms deliberately: the
 * construction makes violation impossible, and the verifier makes a future refactor that breaks the
 * construction fail loudly instead of quietly.
 *
 * ==================== THE FIVE FAILURE SHAPES, ALL ONE BRANCH ====================
 *
 * Expert failure, timeout, malformed output, contradiction and omission are five different things
 * to the evaluation plan and exactly ONE thing here: `expert === null`, or an Expert analysis whose
 * collections are appended without being consulted. That is why the invariant holds identically
 * across all five -- there is no separate degraded path for any of them to take.
 */

import { getAuthoritySurface, isExpertActionPermitted } from './expert-authority-matrix';
import type {
  CrossHazardInsight, DecisionCriticalClarification, ExpertDisagreement, ExpertExplanation,
  ExpertHazardCandidate, ExpertUncertainty, ValidatedExpertAnalysis,
} from './expert-contract.types';

// ---------------------------------------------------------------- source identity

export const AUTHORITY_SOURCES = [
  'DETERMINISTIC_AUTHORITY',
  'GOVERNED_REGULATORY_AUTHORITY',
  'EXPERT_ADVISORY',
] as const;
export type AuthoritySource = (typeof AUTHORITY_SOURCES)[number];

// ---------------------------------------------------------------- the three inputs

/** A. The protected deterministic result, as the merge layer consumes it. */
export interface DeterministicFinding {
  findingKey: string;
  hazardFamily: string;
  conditionState: string;
  isLifeCritical: boolean;
  isActionable: boolean;
  requiredActions: string[];
}

export interface DeterministicAuthorityResult {
  analysisId: string;
  findings: DeterministicFinding[];
  /** The inspection's jurisdiction. Decided upstream; never re-decided here. */
  jurisdiction: string;
}

/** B. The governed regulatory result. */
export interface GovernedCitation {
  findingKey: string;
  citation: string;
  backingState: string;
  /** True only where governed content actually changed what the customer sees. */
  governedProvenanceEligible: boolean;
  /** Whether the record behind this citation is reviewer-approved. */
  isApproved: boolean;
}

export interface GovernedAuthorityResult {
  /** Resolved once, upstream, before analysis. Copied here; never computed here. */
  knowledgeReleaseId: string | null;
  citations: GovernedCitation[];
}

/** C. What the Expert layer did, whether or not it produced anything. */
export const EXPERT_LAYER_STATUSES = [
  'PRESENT',
  'NOT_CONFIGURED',
  'PROVIDER_FAILED',
  'OUTPUT_REJECTED',
] as const;
export type ExpertLayerStatus = (typeof EXPERT_LAYER_STATUSES)[number];

export interface ExpertLayerInput {
  status: ExpertLayerStatus;
  /** Present only when `status === 'PRESENT'`. Anything else merges as if Expert never ran. */
  validated: ValidatedExpertAnalysis | null;
  /** Operator-facing reason. Observable failure is half of the fail-closed contract. */
  detail: string | null;
}

// ---------------------------------------------------------------- the merged result

export interface AuthoritativeFindingEntry extends DeterministicFinding {
  source: 'DETERMINISTIC_AUTHORITY';
}

export interface GovernedCitationEntry extends GovernedCitation {
  source: 'GOVERNED_REGULATORY_AUTHORITY';
}

/** Every Expert item carries the same label. One label, applied at one place, by construction. */
export interface ExpertAdvisoryBlock {
  source: 'EXPERT_ADVISORY';
  hazardCandidates: ExpertHazardCandidate[];
  clarifications: DecisionCriticalClarification[];
  crossHazardInsights: CrossHazardInsight[];
  disagreements: ExpertDisagreement[];
  explanation: ExpertExplanation | null;
  uncertainty: ExpertUncertainty;
}

export const EMPTY_EXPERT_ADVISORY: ExpertAdvisoryBlock = {
  source: 'EXPERT_ADVISORY',
  hazardCandidates: [], clarifications: [], crossHazardInsights: [], disagreements: [],
  explanation: null, uncertainty: { statements: [] },
};

export interface MergedIntelligence {
  analysisId: string;
  jurisdiction: string;
  /** A. Verbatim. Same order, same length, same members. */
  authoritative: AuthoritativeFindingEntry[];
  /** B. Verbatim, including the release id. */
  governed: {
    source: 'GOVERNED_REGULATORY_AUTHORITY';
    knowledgeReleaseId: string | null;
    citations: GovernedCitationEntry[];
  };
  /** C. Appended. Empty whenever Expert did not produce a validated analysis. */
  expertAdvisory: ExpertAdvisoryBlock;
  /** Observable, always. `PRESENT` is not the interesting value; the other three are. */
  expertLayer: { status: ExpertLayerStatus; detail: string | null };
  /**
   * D. §170. Present ONLY when the verifier-v3 development stage attached one, which requires
   * `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` -- a literal `false`. The key is therefore ABSENT from
   * every merged result today, and `mergeExpertIntelligence` called with three arguments returns an
   * object deep-equal to the one it returned before this field existed.
   *
   * It is typed `unknown` deliberately: the merge must not acquire a dependency on the owed-fact
   * module, because that would let a coverage concern reach the place where protected authority is
   * composed. The stage owns the shape; the merge only carries it.
   */
  owedFactCoverage?: unknown;
}

// ---------------------------------------------------------------- the merge

/**
 * Compose the three authorities. Pure, total, and free of any branch in which an Expert value
 * decides a protected one.
 */
export function mergeExpertIntelligence(
  deterministic: DeterministicAuthorityResult,
  governed: GovernedAuthorityResult,
  expert: ExpertLayerInput,
  /**
   * §170. Owed-fact coverage, attached only by the gated verifier-v3 development stage. Omitted
   * everywhere today, and when omitted the returned object carries no `owedFactCoverage` key at
   * all -- so the result is deep-equal to the pre-§170 result rather than merely equivalent.
   *
   * It cannot change A or B: it is spread last into the returned literal and touches no branch
   * above. There is no path from a coverage value to a protected finding or a governed citation.
   */
  owedFactCoverage?: unknown,
): MergedIntelligence {
  // A -- copied, not filtered. No predicate, no sort, no dedupe: those are all places a removal
  // could hide, and none of them is needed to attach a label.
  const authoritative: AuthoritativeFindingEntry[] = deterministic.findings.map(f => ({
    ...f,
    requiredActions: [...f.requiredActions],
    source: 'DETERMINISTIC_AUTHORITY',
  }));

  // B -- copied likewise. `knowledgeReleaseId` is READ from the governed input and written nowhere
  // else in this file; grep for it and there is exactly one assignment.
  const citations: GovernedCitationEntry[] = governed.citations.map(c => ({
    ...c, source: 'GOVERNED_REGULATORY_AUTHORITY',
  }));

  // C -- appended. Anything other than a PRESENT status with a validated analysis merges as empty,
  // which is the same result as Expert never having been invoked.
  const expertAdvisory: ExpertAdvisoryBlock =
    expert.status === 'PRESENT' && expert.validated
      ? {
          source: 'EXPERT_ADVISORY',
          hazardCandidates: [...expert.validated.analysis.expertHazardCandidates],
          clarifications: [...expert.validated.analysis.decisionCriticalClarifications],
          crossHazardInsights: [...expert.validated.analysis.crossHazardInsights],
          disagreements: [...expert.validated.analysis.disagreements],
          explanation: expert.validated.analysis.expertExplanation,
          uncertainty: { statements: [...expert.validated.analysis.uncertainty.statements] },
        }
      : { ...EMPTY_EXPERT_ADVISORY, uncertainty: { statements: [] } };

  return {
    analysisId: deterministic.analysisId,
    jurisdiction: deterministic.jurisdiction,
    authoritative,
    governed: {
      source: 'GOVERNED_REGULATORY_AUTHORITY',
      knowledgeReleaseId: governed.knowledgeReleaseId,
      citations,
    },
    expertAdvisory,
    expertLayer: { status: expert.status, detail: expert.detail },
    // Absent unless supplied. A conditional spread rather than `owedFactCoverage: undefined`,
    // because a key present with an undefined value is a different object from no key at all, and
    // the invariance proof compares objects.
    ...(owedFactCoverage === undefined ? {} : { owedFactCoverage }),
  };
}

// ---------------------------------------------------------------- the invariants, verified

export const MERGE_INVARIANTS = [
  'EXPERT_CANNOT_REMOVE_DETERMINISTIC_FINDING',
  'EXPERT_CANNOT_ALTER_DETERMINISTIC_FINDING',
  'EXPERT_CANNOT_REMOVE_REQUIRED_ACTION',
  'EXPERT_CANNOT_REMOVE_GOVERNED_CITATION',
  'EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID',
  'EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE',
  'EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD',
  'EXPERT_CANNOT_CHANGE_JURISDICTION',
  'EXPERT_ADVISORY_IS_SOURCE_LABELLED',
  'EXPERT_DISAGREEMENT_TARGETS_A_GOVERNED_SURFACE',
  'EXPERT_LAYER_STATUS_IS_OBSERVABLE',
] as const;
export type MergeInvariant = (typeof MERGE_INVARIANTS)[number];

export interface MergeInvariantViolation {
  invariant: MergeInvariant;
  detail: string;
}

/**
 * Check the merged result against the inputs that produced it.
 *
 * This is an AFTER-THE-FACT audit, not the enforcement mechanism -- the construction above is. It
 * exists so that a future edit which reintroduces a filter, a sort or a governed write is caught by
 * a test rather than discovered by a customer whose life-critical finding went missing.
 */
export function verifyMergeInvariants(
  merged: MergedIntelligence,
  deterministic: DeterministicAuthorityResult,
  governed: GovernedAuthorityResult,
): MergeInvariantViolation[] {
  const v: MergeInvariantViolation[] = [];
  const push = (invariant: MergeInvariant, detail: string) => v.push({ invariant, detail });

  // A. every deterministic finding is present, in order, unchanged.
  if (merged.authoritative.length !== deterministic.findings.length) {
    push('EXPERT_CANNOT_REMOVE_DETERMINISTIC_FINDING',
      `${deterministic.findings.length} in, ${merged.authoritative.length} out`);
  }
  deterministic.findings.forEach((f, i) => {
    const m = merged.authoritative[i];
    if (!m || m.findingKey !== f.findingKey) {
      push('EXPERT_CANNOT_REMOVE_DETERMINISTIC_FINDING', `position ${i}: ${f.findingKey}`);
      return;
    }
    if (m.source !== 'DETERMINISTIC_AUTHORITY') {
      push('EXPERT_ADVISORY_IS_SOURCE_LABELLED', `${f.findingKey} mislabelled ${m.source}`);
    }
    if (m.hazardFamily !== f.hazardFamily || m.conditionState !== f.conditionState
        || m.isLifeCritical !== f.isLifeCritical || m.isActionable !== f.isActionable) {
      push('EXPERT_CANNOT_ALTER_DETERMINISTIC_FINDING', f.findingKey);
    }
    const missing = f.requiredActions.filter(a => !m.requiredActions.includes(a));
    if (missing.length > 0) {
      push('EXPERT_CANNOT_REMOVE_REQUIRED_ACTION', `${f.findingKey}: ${missing.join(' | ')}`);
    }
  });

  // B. governed side, including the two provenance rules that matter most.
  if (merged.governed.citations.length !== governed.citations.length) {
    push('EXPERT_CANNOT_REMOVE_GOVERNED_CITATION',
      `${governed.citations.length} in, ${merged.governed.citations.length} out`);
  }
  governed.citations.forEach((c, i) => {
    const m = merged.governed.citations[i];
    if (!m || m.citation !== c.citation) {
      push('EXPERT_CANNOT_REMOVE_GOVERNED_CITATION', `position ${i}: ${c.citation}`);
      return;
    }
    if (m.governedProvenanceEligible !== c.governedProvenanceEligible) {
      push('EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE', c.citation);
    }
    if (m.isApproved !== c.isApproved) {
      push('EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD', c.citation);
    }
    if (m.backingState !== c.backingState) {
      push('EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE', `${c.citation}: backingState changed`);
    }
  });
  if (merged.governed.knowledgeReleaseId !== governed.knowledgeReleaseId) {
    push('EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID',
      `${String(governed.knowledgeReleaseId)} -> ${String(merged.governed.knowledgeReleaseId)}`);
  }

  if (merged.jurisdiction !== deterministic.jurisdiction) {
    push('EXPERT_CANNOT_CHANGE_JURISDICTION',
      `${deterministic.jurisdiction} -> ${merged.jurisdiction}`);
  }

  // C. advisory side: labelled, and every disagreement aimed at a surface the matrix governs and
  // permits being challenged.
  if (merged.expertAdvisory.source !== 'EXPERT_ADVISORY') {
    push('EXPERT_ADVISORY_IS_SOURCE_LABELLED', merged.expertAdvisory.source);
  }
  for (const d of merged.expertAdvisory.disagreements) {
    if (!getAuthoritySurface(d.surface)) {
      push('EXPERT_DISAGREEMENT_TARGETS_A_GOVERNED_SURFACE', `unknown surface ${d.surface}`);
    } else if (!isExpertActionPermitted(d.surface, 'CHALLENGE')) {
      push('EXPERT_DISAGREEMENT_TARGETS_A_GOVERNED_SURFACE', `not challengeable: ${d.surface}`);
    }
  }

  if (!merged.expertLayer || !EXPERT_LAYER_STATUSES.includes(merged.expertLayer.status)) {
    push('EXPERT_LAYER_STATUS_IS_OBSERVABLE', String(merged.expertLayer?.status));
  }

  return v;
}
