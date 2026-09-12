/**
 * §155 EXPERT HAZLENZ -- THE VERIFIER WIRE CONTRACT. DEVELOPMENT PROTOTYPE ONLY.
 * NOT CONNECTED TO A PROVIDER. NO PROMPT IS WRITTEN HERE. NOTHING CALLS THIS.
 *
 * ==================== THE SMALLEST CONTRACT THAT CAN DO THE JOB ====================
 *
 * The verifier answers ONE question -- did the first pass ask about the right unresolved fact, or
 * fail to ask at all -- and it is given no vocabulary for anything else. It cannot regenerate the
 * analysis because there is no field for one. It cannot rewrite a candidate, add a citation, or
 * touch deterministic output because none of those types are reachable from this file. That is the
 * same construction `expert-provider.ts` uses: a producer's authority is bounded by what its return
 * type can express, not by an instruction it might ignore.
 *
 * ==================== WHY IT MAY NOT REGENERATE ====================
 *
 * §101 and §105 both measured the same failure from opposite directions: when a whole analysis is
 * condemned or regenerated over one bad item, correct content dies with the incorrect content --
 * nine of ten iterations returned nothing at all. A verifier that re-answers the whole question
 * re-runs that risk on every escalation, and it also destroys the thing being verified. The first
 * pass's candidates, evidence and citations are EVIDENCE. The verifier reads them and may not edit
 * them.
 *
 * ==================== WHY ABSTAIN IS A FIRST-CLASS ANSWER ====================
 *
 * The trigger escalates a population in which correct and incorrect retention are structurally
 * identical (see `expert-selective-verification-trigger.ts`). A verifier that must choose on every
 * escalation will manufacture a verdict on the cases it cannot separate. ABSTAIN keeps the first
 * pass exactly as it was and records that the second look reached no conclusion, which is a true
 * statement about the state of the evidence and is worth more than a guess.
 *
 * >>> ABSTAIN AND NO_CLARIFICATION_REQUIRED ARE NOT THE SAME ANSWER AND MUST NOT BE MERGED.
 * >>> NO_CLARIFICATION_REQUIRED asserts the unknown does not change what is done now.
 * >>> ABSTAIN asserts nothing. Collapsing them would turn "I could not tell" into "it is fine",
 * >>> which is the precise move §149 spent an operation removing from the first-pass prompt.
 */

export const EXPERT_VERIFIER_CONTRACT_VERSION = 'hazlenz.expert.verifier.v1' as const;

/**
 * WHAT THE VERIFIER RECEIVES.
 *
 * Everything here is READ-ONLY by type. The verifier is handed the first pass rather than asked to
 * reproduce it, and it is handed the SPECIFIC unresolved facts the trigger identified rather than
 * being asked to find them again -- a second search is a second chance to anchor on the wrong fact,
 * which is the §152-§154 HS-H1 mechanism itself.
 */
export interface ExpertVerifierInput {
  readonly verifierContractVersion: typeof EXPERT_VERIFIER_CONTRACT_VERSION;
  /** Ties the verification to exactly one first-pass analysis. */
  readonly analysisId: string;
  /** The observation the first pass saw, unchanged and unabridged. */
  readonly observationText: string;
  /** Governed evidence as supplied to the first pass. Never re-fetched, never re-selected. */
  readonly governedEvidence: ReadonlyArray<{
    readonly sourceId: string;
    readonly text: string;
  }>;
  /** What deterministic HazLenz already found. Context the verifier may use and may not change. */
  readonly deterministicFindings: ReadonlyArray<{
    readonly findingKey: string;
    readonly hazardFamily: string;
  }>;
  /** The first-pass result, flattened to what a verification actually needs. */
  readonly firstPass: {
    readonly candidates: ReadonlyArray<{
      readonly candidateKey: string;
      readonly hazardFamily: string;
      readonly assertedConditionState: string;
      readonly evidenceBasis: string;
      readonly reasoning: string;
    }>;
    readonly clarifications: ReadonlyArray<{
      readonly clarificationId: string;
      readonly question: string;
      readonly affectedDecision: string;
      readonly relatesToCandidateKey: string | null;
    }>;
    readonly uncertainty: readonly string[];
    readonly summary: string;
  };
  /** Named by the trigger. The verifier judges THESE, not the analysis at large. */
  readonly unresolvedFacts: ReadonlyArray<{
    readonly kind: 'CANDIDATE' | 'UNCERTAINTY_STATEMENT';
    readonly ref: string;
  }>;
  /** Deterministic postcondition codes that fired, if any. */
  readonly postconditionWarnings: readonly string[];
}

export const VERIFIER_VERDICTS = [
  /** The first pass asked the right question, or correctly asked nothing. Change nothing. */
  'VERIFIED_AS_IS',
  /** A decision-critical unknown is unasked, or the emitted question addresses a lesser one. */
  'ADD_OR_REPLACE_CLARIFICATION',
  /** The retained unknown does not change what is done now. An ASSERTION, not a shrug. */
  'NO_CLARIFICATION_REQUIRED',
  /** The verifier could not determine which of the above holds. Asserts nothing. */
  'ABSTAIN',
] as const;
export type ExpertVerifierVerdict = (typeof VERIFIER_VERDICTS)[number];

/**
 * WHAT THE VERIFIER MAY RETURN. The whole authority surface, and it is one collection wide.
 *
 * `proposedClarification` is present ONLY on `ADD_OR_REPLACE_CLARIFICATION`. It carries no
 * `relatesToCandidateKey`: linkage is decided at the normalization boundary against the candidates
 * that actually exist (§141), and letting a second model declare a link would reintroduce the
 * broken back-reference §149 built raw-linkage instrumentation to see.
 */
export interface ExpertVerifierOutput {
  readonly verifierContractVersion: typeof EXPERT_VERIFIER_CONTRACT_VERSION;
  readonly analysisId: string;
  readonly verdict: ExpertVerifierVerdict;
  /** One sentence, operator-facing. Why this verdict on these unresolved facts. */
  readonly rationale: string;
  /** Which supplied unresolved fact the verdict is about. Must be one the input named. */
  readonly aboutUnresolvedFactRef: string | null;
  readonly proposedClarification: {
    readonly question: string;
    readonly whyItMatters: string;
    readonly affectedDecision: string;
    readonly evidenceGap: string;
    /** Which existing clarification this replaces, or null to add. */
    readonly replacesClarificationId: string | null;
  } | null;
}

/**
 * THE FIELDS A VERIFIER OUTPUT MAY NEVER CARRY.
 *
 * Enforced as data so the acceptance matrix can assert it mechanically rather than by reading the
 * type. A key appearing here is refused at the boundary regardless of what a model produced.
 */
export const VERIFIER_FORBIDDEN_FIELDS = [
  'expertHazardCandidates', 'candidates', 'hazardCandidates',
  'citations', 'governedCitations', 'regulatoryCitations',
  'deterministicFindings', 'authoritativeFindings',
  'crossHazardInsights', 'disagreements', 'explanation',
  'releaseId', 'authoritySource', 'source',
] as const;

export interface VerifierBoundaryResult {
  accepted: boolean;
  violations: string[];
}

/**
 * The verifier's own normalization boundary, in miniature.
 *
 * It is deliberately stricter than the first pass's: the first pass may produce a partly-usable
 * analysis whose bad items are dropped item-by-item, whereas a verifier output is ONE verdict and a
 * verdict that broke the contract in any respect is not partly correct. It is refused whole, and
 * refusing it means the first pass stands unchanged -- which is a safe outcome by construction.
 */
export function checkVerifierOutput(
  raw: unknown, input: Pick<ExpertVerifierInput, 'analysisId' | 'unresolvedFacts'>,
): VerifierBoundaryResult {
  const violations: string[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { accepted: false, violations: ['OUTPUT_NOT_AN_OBJECT'] };
  }
  const o = raw as Record<string, unknown>;

  for (const forbidden of VERIFIER_FORBIDDEN_FIELDS) {
    if (forbidden in o) violations.push(`FORBIDDEN_FIELD:${forbidden}`);
  }
  if (o.verifierContractVersion !== EXPERT_VERIFIER_CONTRACT_VERSION) {
    violations.push('CONTRACT_VERSION_MISMATCH');
  }
  if (o.analysisId !== input.analysisId) violations.push('ANALYSIS_ID_MISMATCH');
  if (typeof o.verdict !== 'string'
      || !(VERIFIER_VERDICTS as readonly string[]).includes(o.verdict)) {
    violations.push('INVALID_VERDICT');
  }
  if (typeof o.rationale !== 'string' || o.rationale.trim().length === 0) {
    violations.push('RATIONALE_MISSING');
  }

  const refs = new Set(input.unresolvedFacts.map(f => f.ref));
  const about = o.aboutUnresolvedFactRef;
  if (about !== null && (typeof about !== 'string' || !refs.has(about))) {
    // A verdict about a fact nobody supplied is the verifier having gone looking, which is exactly
    // what the narrow contract exists to prevent.
    violations.push('UNRESOLVED_FACT_REF_NOT_SUPPLIED');
  }

  const proposal = o.proposedClarification;
  if (o.verdict === 'ADD_OR_REPLACE_CLARIFICATION') {
    if (typeof proposal !== 'object' || proposal === null) {
      violations.push('PROPOSAL_REQUIRED_FOR_THIS_VERDICT');
    } else {
      const p = proposal as Record<string, unknown>;
      for (const f of ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap']) {
        if (typeof p[f] !== 'string' || (p[f] as string).trim().length === 0) {
          violations.push(`PROPOSAL_FIELD_MISSING:${f}`);
        }
      }
      if ('relatesToCandidateKey' in p) violations.push('PROPOSAL_MAY_NOT_DECLARE_LINKAGE');
    }
  } else if (proposal !== null && proposal !== undefined) {
    violations.push('PROPOSAL_NOT_PERMITTED_FOR_THIS_VERDICT');
  }

  return { accepted: violations.length === 0, violations };
}

/**
 * What an accepted verdict is permitted to do to the merged result.
 *
 * The mapping is total and the only mutable surface is `clarifications`. There is no branch that
 * touches candidates, citations or deterministic findings, and adding one would require changing
 * this function's return type -- which the acceptance matrix asserts.
 */
export function verifierEffect(verdict: ExpertVerifierVerdict): {
  clarificationsMayChange: boolean;
  candidatesMayChange: false;
  citationsMayChange: false;
  deterministicMayChange: false;
} {
  return {
    clarificationsMayChange: verdict === 'ADD_OR_REPLACE_CLARIFICATION',
    candidatesMayChange: false,
    citationsMayChange: false,
    deterministicMayChange: false,
  };
}
