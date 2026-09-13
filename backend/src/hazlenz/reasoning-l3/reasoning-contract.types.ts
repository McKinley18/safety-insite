/**
 * HazLenz Level-3 reasoning contract -- types only.
 *
 * AUTHORITY. Nothing in this file is customer-authoritative. A `ReasoningProposal` is a PROPOSAL
 * (L3-INV-08); only `deterministic-safety-validator.ts` may turn one into a `ValidatedReasoning`,
 * and even that is not a customer finding. The current Level-1 engine remains authoritative.
 *
 * Blueprint section 29. Invariants L3-INV-01 .. L3-INV-12.
 */

export const REASONING_INPUT_CONTRACT_VERSION = 'hazlenz.l3.input.v1' as const;
export const REASONING_PROPOSAL_CONTRACT_VERSION = 'hazlenz.l3.proposal.v1' as const;

// ---------------------------------------------------------------- condition state

/**
 * L3-INV-04. There is deliberately no default member and no "unrecognized" member that resolves to
 * ACTIVE. A caller that cannot establish a state must say so with INSUFFICIENT_EVIDENCE or UNKNOWN.
 */
export const L3_CONDITION_STATES = [
  'ACTIVE',
  'CONTROLLED',
  'CORRECTED',
  'REMOVED_FROM_SERVICE',
  'NEGATED',
  'HYPOTHETICAL',
  'INSUFFICIENT_EVIDENCE',
  'UNKNOWN',
] as const;
export type L3ConditionState = (typeof L3_CONDITION_STATES)[number];

/** The states that assert a present, uncontrolled exposure. Only ACTIVE qualifies. */
export const L3_EXPOSURE_ASSERTING_STATES: readonly L3ConditionState[] = ['ACTIVE'];

/**
 * The states that say THE DECISION WAS NOT MADE. The other six ARE the decision (section 34.2).
 *
 * ONE definition, deliberately. This vocabulary decides whether a clarification resolves a real
 * decision boundary under L3-INV-06, and it is now consulted in two places -- the deterministic
 * validator (proposal-level carrier) and the semantic binder (candidate-level drop). Two copies of
 * a load-bearing list is the failure mode section 32.5 names; there is one list and both import it.
 */
export const L3_UNDECIDED_STATES: readonly L3ConditionState[] = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

// ---------------------------------------------------------------- evidence references

export type EvidenceSourceType = 'observation' | 'inspection_context' | 'clarification_answer';

/**
 * A mechanically verifiable pointer into a supplied source (L3-INV-02).
 * Offsets are half-open [startOffset, endOffset) over the EXACT string the input contract carried,
 * so validation is an equality check rather than a re-match.
 */
export interface EvidenceReference {
  sourceId: string;
  sourceType: EvidenceSourceType;
  startOffset: number;
  endOffset: number;
  /** What the proposer believes the span says. Validated against the source; never trusted. */
  quotedText: string;
}

// ---------------------------------------------------------------- input contract

/** Direct customer/inspection fact. May ground a finding. */
export interface AuthoritativeSource {
  sourceId: string;
  sourceType: EvidenceSourceType;
  text: string;
}

/**
 * L3-INV-12. A deterministic hint from the existing lexical engine. It may inform reasoning and it
 * may NOT, alone, ground a validated finding. The validator enforces this.
 */
export interface AdvisorySignal {
  signalId: string;
  kind: 'lexical_family_hint' | 'taxonomy_route_hint' | 'evidence_fact_hint';
  value: string;
}

export type L3RegulatoryContextValue =
  | 'osha-general-industry'
  | 'osha-construction'
  | 'msha'
  | 'unknown';

/** HYBRID (blueprint section 29.8). `unknown` is a real state, never silently resolved. */
export interface L3RegulatoryContext {
  value: L3RegulatoryContextValue;
  provenance: 'USER_CONFIRMED' | 'UNKNOWN';
}

export interface ClarificationAnswer {
  questionId: string;
  answeredFact: string;
  answer: string;
}

/**
 * Minimum sufficient context. Deliberately absent: personal/site names, photos, arbitrary
 * persistence entities, governed review/release state, reviewed regulatory text, other orgs' data.
 */
export interface ReasoningInput {
  contractVersion: typeof REASONING_INPUT_CONTRACT_VERSION;
  analysisId: string;

  /** Every evidence reference must resolve into exactly one of these. */
  authoritativeSources: AuthoritativeSource[];

  regulatoryContext: L3RegulatoryContext;

  /** Closed vocabulary. A proposal may not name a family outside it (validated). */
  allowedHazardFamilies: string[];

  /**
   * Deterministically retrieved eligible citations, id + label only. L3-INV-01: a proposal may
   * reference these ids and nothing else. Empty means "no applicability proposal is permitted".
   */
  eligibleRegulatoryCandidates?: Array<{ candidateId: string; citation: string; title?: string }>;

  answeredClarifications?: ClarificationAnswer[];

  /** Duplicate control only. Never evidence. */
  establishedFindings?: Array<{ findingId: string; hazardFamily: string; conditionState: L3ConditionState }>;

  advisorySignals?: AdvisorySignal[];
}

// ---------------------------------------------------------------- proposal contract

export const L3_ANALYSIS_OUTCOMES = [
  'ANALYZED',
  'NO_HAZARD_ESTABLISHED',
  'INSUFFICIENT_EVIDENCE',
  'ANALYSIS_UNAVAILABLE',
] as const;
export type L3AnalysisOutcome = (typeof L3_ANALYSIS_OUTCOMES)[number];

export const L3_CONTROL_HIERARCHY_LEVELS = [
  'elimination', 'substitution', 'engineering', 'administrative', 'ppe', 'unknown',
] as const;
export type L3ControlHierarchyLevel = (typeof L3_CONTROL_HIERARCHY_LEVELS)[number];

/** L3-INV-06. A question with no decision it changes is structurally invalid. */
export interface ClarificationDecision {
  unresolvedFact: string;
  affectedDecision: 'hazard_identity' | 'condition_state' | 'regulatory_applicability' | 'risk' | 'corrective_action';
  branches: string[];
  question: string;
}

export interface CorrectiveActionIntent {
  objective: string;
  hierarchyLevel: L3ControlHierarchyLevel;
  /** Must be a subset of the candidate's own evidence (validated). */
  groundedInEvidence: EvidenceReference[];
}

export interface RiskFactors {
  consequenceSeverity: 'low' | 'moderate' | 'serious' | 'severe' | 'unknown';
  exposureLikelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'unknown';
  affectedPersons: 'none_established' | 'one' | 'few' | 'many' | 'unknown';
  existingControls: string[];
  uncertainty: string[];
}

/**
 * A hazard PROPOSAL. Note what is absent by construction (L3-INV-03, L3-INV-09): no citation string,
 * no review state, no release id, no badge, no governed content, no regulatory text.
 */
export interface HazardCandidate {
  candidateKey: string;
  hazardFamily: string;
  conditionState: L3ConditionState;
  evidence: EvidenceReference[];
  conditionRationale: string;
  independentHazardRationale: string;
  uncertainties: string[];
  clarification: ClarificationDecision | null;
  correctiveActionIntent: CorrectiveActionIntent | null;
  riskFactors: RiskFactors | null;
  /** L3-INV-01: ids from `eligibleRegulatoryCandidates` only. Never a free-form citation. */
  regulatoryCandidateRefs?: string[];
}

export interface JurisdictionProposal {
  value: L3RegulatoryContextValue;
  /** HYBRID: never USER_CONFIRMED from a proposal. */
  provenance: 'HAZLENZ_INFERRED' | 'UNKNOWN';
  basis: EvidenceReference[];
}

export interface ReasoningProposal {
  contractVersion: typeof REASONING_PROPOSAL_CONTRACT_VERSION;
  analysisId: string;
  outcome: L3AnalysisOutcome;
  observationInterpretation: string;
  hazardCandidates: HazardCandidate[];
  jurisdictionProposal: JurisdictionProposal | null;

  /**
   * L3-2i. The CANDIDATE-INDEPENDENT clarification carrier.
   *
   * `A CLARIFICATION MUST NOT REQUIRE A hazardCandidate TO EXIST` (blueprint section 39.5.1).
   *
   * Measured defect this closes: when the model correctly concluded an observation was
   * underdetermined and returned `INSUFFICIENT_EVIDENCE` with an EMPTY `hazardCandidates` array,
   * `HazardCandidate.clarification` gave the question nowhere to live -- so the pipeline destroyed
   * the clarification in exactly the case that most needed one. Proven on `F-CL-01` and `B10`.
   *
   * ADDITIVE AND BACKWARD COMPATIBLE, deliberately. The field is optional and
   * `REASONING_PROPOSAL_CONTRACT_VERSION` is NOT bumped: every proposal that validated before
   * L3-2i still validates unchanged, and every frozen L3-2/L3-2b..L3-2h artifact stays readable.
   *
   * SCOPE, and it is narrow on purpose (section 22, smallest correct remediation):
   *  - it carries a QUESTION, never an answer, never evidence, never a hazard;
   *  - it is legitimate ONLY when `outcome === 'INSUFFICIENT_EVIDENCE'` -- the two outcomes that
   *    made a determination (`ANALYZED`, `NO_HAZARD_ESTABLISHED`) did not leave a decision open, and
   *    `ANALYSIS_UNAVAILABLE` did not reach one to leave open. This is L3-INV-06's decision-boundary
   *    rule (section 34.2) lifted from the candidate to the proposal, not a new policy;
   *  - it may NOT create an ACTIVE hazard, a finding, a standard, a corrective action or any
   *    customer-authoritative output. It is a proposal (L3-INV-08) and the deterministic validator
   *    is still the only thing that may accept it.
   */
  unresolvedDecisions?: ClarificationDecision[];

  /** Set only when outcome is ANALYSIS_UNAVAILABLE. */
  unavailableReason?: string;
}
