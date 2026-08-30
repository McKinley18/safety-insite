/**
 * EXPERT HAZLENZ -- the provider-neutral contract. Types and closed vocabularies only.
 *
 * AUTHORITY. Nothing in this file is customer-authoritative and nothing in it can become so. An
 * `ExpertAnalysis` is ADVISORY (blueprint section 98.7, `D-110`); `expert-normalization.ts` is the
 * only thing that may turn raw provider output into a `ValidatedExpertAnalysis`, and even a
 * validated one reaches the customer only through `expert-authority-merge.ts`, labelled
 * `EXPERT_ADVISORY` and standing beside deterministic and governed results rather than inside them.
 *
 * ==================== WHAT THIS CONTRACT IS FOR, IN ONE PARAGRAPH ====================
 *
 * The target is not "add an LLM". It is a competent safety-and-health reasoning layer that
 * understands the inspection context, notices what is missing, asks a small number of decisive
 * questions, explains why a hazard matters, sees how hazards interact, and helps produce a
 * defensible finding -- WITHOUT becoming the ungoverned source of regulatory truth.
 *
 * ==================== SIX INDEPENDENT COLLECTIONS, AND WHY ====================
 *
 * The L3 programme measured what happens when one output rides inside another. `D-56` recorded the
 * zero-candidate case where a clarification had nowhere to live because `HazardCandidate` owned it,
 * and the pipeline destroyed the question in exactly the case that most needed one. L3-2i repaired
 * that by ADDING a proposal-level carrier alongside the candidate-level one -- and L3-2j then
 * measured that the shipped prompt never used it, so the coupling survived as a shape even after
 * the capability existed.
 *
 * This contract does not repeat that. There is no candidate-owned clarification field to fall back
 * to. `decisionCriticalClarifications`, `expertHazardCandidates`, `crossHazardInsights` and
 * `disagreements` are FOUR SIBLINGS. A clarification cannot be coupled to a hazard because there is
 * no place to couple it to, which is a structural guarantee rather than a tested behaviour.
 *
 * ==================== NON-GOALS ARE PART OF THE TYPE ====================
 *
 * `EXPERT_NON_GOALS` and `FORBIDDEN_EXPERT_FIELD_NAMES` are exported and enforced by the
 * normalizer. A provider that returns `citation`, `knowledgeReleaseId` or `approvalStatus` is
 * rejected at the boundary -- not sanitized, not ignored. Sanitizing teaches nothing; rejecting is
 * measurable.
 */

/**
 * ============ WHY THIS MODULE DEPENDS ON NOTHING IN THE LEVEL-3 REASONING TIER ============
 *
 * The obvious move was to import `EvidenceReference` and the condition-state vocabulary from the
 * Level-3 contract, which already models both well. It is the WRONG move, for two reasons that
 * agree, and this module deliberately does not even NAME that directory -- see the third point.
 *
 * The mechanical one: `test:l32i-clarification-carrier` F3 and `test:l32j-carrier-activation` D5
 * assert that no file under `src/` outside the Level-3 module mentions it, and the assertion's own
 * label says what it protects -- `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`. That guard
 * is the quarantine keeping an unaccepted reasoning tier off the customer path. An Expert module
 * that imported from it would break the guard, and the correct response to breaking a protected
 * guard is to change the new code, never the guard.
 *
 * The architectural one, which is why the guard is right rather than merely binding: that tier
 * FAILED its sealed acceptance (`MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`, seven gates). Expert
 * HazLenz is authorized as a NEW additive layer, and coupling it to a tier that may be retired
 * would make Expert inherit both the quarantine and the fate.
 *
 * The third point, learned by tripping it: THE GUARD IS A CONTENT GREP, NOT AN IMPORT-GRAPH CHECK.
 * It matches the directory name anywhere in a file, so a prose mention in a comment breaks it just
 * as an import does. That is not a flaw -- a comment naming the module is the first step toward
 * depending on it -- so this file refers to it as "the Level-3 reasoning tier" throughout.
 *
 * So the two definitions below are DELIBERATE, DOCUMENTED DUPLICATES. Their values are identical to
 * the Level-3 vocabularies on purpose -- an Expert condition assertion must stay directly
 * comparable to a Level-3 one for evaluation -- and `test-expert-contract-foundation.ts` asserts
 * that equality explicitly, by reading the Level-3 file as DATA at a path it builds at runtime.
 * That is the one arrangement that keeps the vocabularies aligned without creating a dependency.
 */

export const EXPERT_INPUT_CONTRACT_VERSION = 'hazlenz.expert.input.v1' as const;
/**
 * v2 (routing repair). v1 gave `expertExplanation` three free-text arrays -- `whatMatters`,
 * `whatIsMissing`, `howConditionsInteract` -- that duplicated the semantics of three typed
 * collections. Measured consequence, on 6 of 6 live calls: the model reasoned correctly and filed
 * the reasoning in the free-text twin instead of the typed collection. The version is bumped
 * because removing those fields is a SUBTRACTIVE change, unlike L3-2i's additive carrier which
 * deliberately did not bump.
 */
export const EXPERT_ANALYSIS_CONTRACT_VERSION = 'hazlenz.expert.analysis.v2' as const;

// ---------------------------------------------------------------- shared vocabularies

/**
 * A mechanically verifiable pointer into a supplied source.
 *
 * Offsets are half-open `[startOffset, endOffset)` over the EXACT string the input contract
 * carried, so validation is an equality check rather than a re-match. That is what makes a
 * fabricated span detectable instead of merely implausible.
 */
export interface EvidenceReference {
  sourceId: string;
  sourceType: 'observation' | 'inspection_context' | 'clarification_answer';
  startOffset: number;
  endOffset: number;
  /** What the proposer believes the span says. Validated against the source; never trusted. */
  quotedText: string;
}

/**
 * Ordinal, not numeric. A float invites threshold tuning, and a threshold is how an advisory tier
 * quietly becomes a decision tier. Three named levels can be scored and cannot be tuned.
 */
export const EXPERT_CONFIDENCE_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type ExpertConfidence = (typeof EXPERT_CONFIDENCE_LEVELS)[number];

/**
 * The condition-state vocabulary. Byte-identical to `L3_CONDITION_STATES`, and asserted to be so by
 * the foundation suite -- see the header for why it is copied rather than imported.
 *
 * There is deliberately no default member and no "unrecognized" member resolving to ACTIVE. A layer
 * that cannot establish a state must say `INSUFFICIENT_EVIDENCE` or `UNKNOWN`.
 */
export const EXPERT_CONDITION_STATES = [
  'ACTIVE',
  'CONTROLLED',
  'CORRECTED',
  'REMOVED_FROM_SERVICE',
  'NEGATED',
  'HYPOTHETICAL',
  'INSUFFICIENT_EVIDENCE',
  'UNKNOWN',
] as const;
export type ExpertConditionState = (typeof EXPERT_CONDITION_STATES)[number];

// ---------------------------------------------------------------- A. hazard candidates

/**
 * How an Expert candidate stands relative to the deterministic set it was shown.
 * `CONTRADICTS_DETERMINISTIC` is a legal value and it still does not remove anything -- it routes
 * to a disagreement, which is evidence.
 */
export const EXPERT_CANDIDATE_RELATIONSHIPS = [
  'ADDITIONAL_TO_DETERMINISTIC',
  'AGREES_WITH_DETERMINISTIC',
  'REFINES_DETERMINISTIC',
  'CONTRADICTS_DETERMINISTIC',
] as const;
export type ExpertCandidateRelationship = (typeof EXPERT_CANDIDATE_RELATIONSHIPS)[number];

/**
 * A plausible hazard the deterministic candidate set did not contain.
 *
 * Note what is absent by construction: no citation, no release id, no approval state, no severity
 * score, no corrective action the customer must perform. Those belong to protected surfaces, and
 * the type does not offer a field to put them in.
 */
export interface ExpertHazardCandidate {
  /** Stable within one analysis. Identity for evaluation and for merge ordering. */
  candidateKey: string;
  hazardFamily: string;
  /** ADVISORY. Expert may not set a condition state; this is what it believes, for comparison. */
  assertedConditionState: ExpertConditionState;
  /** Verifiable spans into the supplied sources. Empty is legal and scores as ungrounded. */
  evidence: EvidenceReference[];
  /** What in the observation supports this, in the Expert's words. */
  evidenceBasis: string;
  /** Why this constitutes a hazard. Distinct from the basis: one is evidence, one is inference. */
  reasoning: string;
  confidence: ExpertConfidence;
  relationshipToDeterministic: ExpertCandidateRelationship;
  /** True when the candidate should not be acted on until the customer confirms a fact. */
  requiresUserConfirmation: boolean;
}

// ---------------------------------------------------------------- B. clarifications

/**
 * What a missing fact could change. Every member is a decision the product actually makes; a
 * question that changes none of them is not decision-critical and the normalizer refuses it.
 */
export const EXPERT_AFFECTED_DECISIONS = [
  'HAZARD_EXISTENCE',
  'HAZARD_SEVERITY',
  'EXPOSURE',
  'APPLICABILITY',
  'REQUIRED_CONTROL',
  'REGULATORY_INTERPRETATION',
] as const;
export type ExpertAffectedDecision = (typeof EXPERT_AFFECTED_DECISIONS)[number];

export const EXPERT_CLARIFICATION_CRITICALITY = ['ROUTINE', 'IMPORTANT', 'BLOCKING'] as const;
export type ExpertClarificationCriticality = (typeof EXPERT_CLARIFICATION_CRITICALITY)[number];

/**
 * A FIRST-CLASS output. It has no owner and needs none.
 *
 * `A CLARIFICATION MUST NOT REQUIRE A hazardCandidate TO EXIST` (blueprint section 39.5.1). Here
 * that is not a rule the pipeline must remember -- it is the absence of a field.
 */
export interface DecisionCriticalClarification {
  /** Stable identity, so a question survives re-ordering and can be answered later. */
  clarificationId: string;
  question: string;
  /** The reason the answer matters, in customer-facing terms. */
  whyItMatters: string;
  affectedDecision: ExpertAffectedDecision;
  criticality: ExpertClarificationCriticality;
  /** What is missing from the evidence, stated as a fact rather than as a question. */
  evidenceGap: string;
}

// ---------------------------------------------------------------- C. cross-hazard insights

/**
 * The interaction families the authorization named, plus `OTHER` so a real interaction outside the
 * list is expressible rather than forced into a wrong member or dropped.
 */
export const EXPERT_INTERACTION_KINDS = [
  'ELECTRICAL_WET_ENVIRONMENT',
  'EXCAVATION_UTILITIES',
  'CONFINED_SPACE_ATMOSPHERIC',
  'FALL_EXPOSURE_ANCHORAGE',
  'LOTO_STORED_ENERGY',
  'CHEMICAL_PPE_VENTILATION',
  'MOBILE_EQUIPMENT_PEDESTRIAN',
  'OTHER',
] as const;
export type ExpertInteractionKind = (typeof EXPERT_INTERACTION_KINDS)[number];

export interface CrossHazardInsight {
  insightId: string;
  interactionKind: ExpertInteractionKind;
  /**
   * Hazard families or candidate keys that participate. At least two -- an interaction between one
   * thing is not an interaction, and the normalizer enforces the count.
   */
  participants: string[];
  reasoning: string;
  confidence: ExpertConfidence;
}

// ---------------------------------------------------------------- D. disagreements

export const EXPERT_DISAGREEMENT_TARGETS = [
  'DETERMINISTIC_RESULT',
  'GOVERNED_STANDARD',
  'AVAILABLE_EVIDENCE',
] as const;
export type ExpertDisagreementTarget = (typeof EXPERT_DISAGREEMENT_TARGETS)[number];

/** The four structural things Expert must be able to say, from the authorization, and no more. */
export const EXPERT_DISAGREEMENT_TYPES = [
  'MAY_BE_INCOMPLETE',
  'MAY_BE_OVERINCLUSIVE',
  'MAY_REQUIRE_CLOSER_REVIEW',
  'EVIDENCE_INSUFFICIENT',
] as const;
export type ExpertDisagreementType = (typeof EXPERT_DISAGREEMENT_TYPES)[number];

/**
 * A typed challenge. It is evidence for evaluation and for future improvement.
 * It is NOT authority to rewrite the frozen result, and the merge layer gives it no write path.
 */
export interface ExpertDisagreement {
  disagreementId: string;
  target: ExpertDisagreementTarget;
  /**
   * Which protected surface is challenged -- a key from `EXPERT_AUTHORITY_SURFACES`. The normalizer
   * rejects an unknown surface, so a disagreement can never be filed against something the matrix
   * does not govern.
   */
  surface: string;
  /** Free-form pointer at the challenged object (finding key, citation, candidate key). */
  targetRef: string | null;
  disagreementType: ExpertDisagreementType;
  reasoning: string;
  confidence: ExpertConfidence;
  recommendsReview: boolean;
}

// ---------------------------------------------------------------- E/F. explanation, uncertainty

/**
 * SYNTHESIS ONLY, and it is one field on purpose.
 *
 * ==================== WHAT WAS REMOVED, AND WHY REMOVAL RATHER THAN INSTRUCTION ====================
 *
 * v1 carried `whatMatters`, `whatIsMissing` and `howConditionsInteract` beside `summary`. Each was
 * a free-text twin of a typed collection:
 *
 *      whatIsMissing          <-> decisionCriticalClarifications
 *      howConditionsInteract  <-> crossHazardInsights
 *      whatMatters            <-> expertHazardCandidates
 *
 * A model asked to fill both fills the easier one. The §100 diagnostic measured exactly that: four
 * genuinely decision-critical missing facts in `whatIsMissing`, a real wet/electrical interaction in
 * `howConditionsInteract`, and a plausible confined-space hazard in `whatMatters` -- with all three
 * typed collections empty and the outcome reported as `NOTHING_TO_ADD`.
 *
 * The fix is to delete the twin, not to add a sentence asking the model not to use it. An
 * instruction competes with a field; an absent field does not compete. This is the same reasoning
 * that made `decisionCriticalClarifications` a sibling collection rather than a candidate-owned
 * one: where a defect can be removed structurally, a rule is the weaker choice.
 *
 * `summary` survives because synthesis is genuinely useful and has no typed twin.
 */
export interface ExpertExplanation {
  /** Two or three sentences a customer could read. Never a regulatory assertion. */
  summary: string;
}

export interface ExpertUncertainty {
  /** Things the Expert layer could not settle. Always present; empty means "nothing unsettled". */
  statements: string[];
}

// ---------------------------------------------------------------- the input contract

export interface ExpertAuthoritativeSource {
  sourceId: string;
  sourceType: 'observation' | 'inspection_context' | 'clarification_answer';
  text: string;
}

/**
 * A deterministic finding as SHOWN TO Expert. Read-only by construction: this projection is what
 * Expert reasons about, and there is no return path that writes back into it.
 */
export interface DeterministicFindingView {
  findingKey: string;
  hazardFamily: string;
  conditionState: ExpertConditionState;
  isLifeCritical: boolean;
  isActionable: boolean;
  requiredActions: string[];
}

/**
 * A governed record as SUPPLIED to Expert. Expert may reason about this. It may not invent one, and
 * the normalizer rejects any citation-shaped string in Expert output.
 */
export interface GovernedStandardView {
  citation: string;
  title: string | null;
  approvedText: string | null;
  backingState: string;
}

export interface ExpertAnalysisInput {
  contractVersion: typeof EXPERT_INPUT_CONTRACT_VERSION;
  analysisId: string;
  authoritativeSources: ExpertAuthoritativeSource[];
  /** Where and what: the location/task context the authorization asked Expert to reason across. */
  inspectionContext: { location: string | null; task: string | null };
  /** The inspection's jurisdiction. Supplied as a fact; never re-decided. */
  jurisdiction: string;
  /** Closed vocabulary. An Expert candidate outside it is rejected. */
  allowedHazardFamilies: string[];
  /** The protected deterministic result, as context. */
  deterministicFindings: DeterministicFindingView[];
  /** Governed records the system chose to supply. Empty means Expert may cite nothing at all. */
  governedStandards: GovernedStandardView[];
  /** Answers already collected in this workflow. */
  answeredClarifications: Array<{ clarificationId: string; answer: string }>;
}

// ---------------------------------------------------------------- the analysis contract

export const EXPERT_OUTCOMES = [
  'ANALYZED',
  'NOTHING_TO_ADD',
  'INSUFFICIENT_EVIDENCE',
  'EXPERT_UNAVAILABLE',
] as const;
export type ExpertOutcome = (typeof EXPERT_OUTCOMES)[number];

/**
 * The whole Expert output. Six independently addressable collections plus a trace.
 *
 * Every collection is REQUIRED and may be empty. "Absent" and "none" are the same thing to a
 * consumer, and forcing the producer to say which one it means removes a class of ambiguity the L3
 * optional carrier had to document its way around.
 */
export interface ExpertAnalysis {
  contractVersion: typeof EXPERT_ANALYSIS_CONTRACT_VERSION;
  analysisId: string;
  outcome: ExpertOutcome;
  expertHazardCandidates: ExpertHazardCandidate[];
  decisionCriticalClarifications: DecisionCriticalClarification[];
  crossHazardInsights: CrossHazardInsight[];
  disagreements: ExpertDisagreement[];
  expertExplanation: ExpertExplanation | null;
  uncertainty: ExpertUncertainty;
}

/** Provider-supplied trace. Operator-facing; never rendered as an analysis result. */
export interface ExpertTrace {
  providerId: string;
  /** Whatever the adapter knows. Lives here rather than in business logic, by Phase-8 rule. */
  providerModelIdentity: string | null;
  attempts: number;
  totalMs: number;
}

/**
 * The output of normalization: an analysis proven to satisfy the contract, plus what the validator
 * recorded while proving it. Deliberately not a customer entity, and it carries no governed field.
 */
export interface ValidatedExpertAnalysis {
  analysis: ExpertAnalysis;
  validator: {
    inputContractVersion: string;
    analysisContractVersion: string;
    validatorVersion: string;
    validatedAt: string;
  };
}

export const EXPERT_VALIDATOR_VERSION = 'hazlenz.expert.validator.v1' as const;

// ---------------------------------------------------------------- non-goals, enforced

/**
 * PHASE 3. What Expert HazLenz must never become. Exported so the foundation suite can assert each
 * one has a structural reason it cannot happen, rather than a promise that it will not.
 */
export const EXPERT_NON_GOALS = [
  'AUTONOMOUS_REGULATORY_DATABASE',
  'UNCONTROLLED_CITATION_GENERATOR',
  'REPLACEMENT_FOR_KNOWLEDGE_GOVERNANCE',
  'REPLACEMENT_FOR_DETERMINISTIC_LEVEL1',
  'MECHANISM_THAT_HIDES_DETERMINISTIC_HAZARDS',
  'MECHANISM_THAT_REWRITES_INSPECTION_PROVENANCE',
  'FREE_FORM_CHATBOT_DETACHED_FROM_INSPECTION_STATE',
  'AUTONOMOUS_MODEL_TRAINING_LOOP',
  'IMMEDIATE_CROSS_CUSTOMER_LEARNING_FROM_ONE_CORRECTION',
  'PROVIDER_SPECIFIC_ARCHITECTURE',
] as const;
export type ExpertNonGoal = (typeof EXPERT_NON_GOALS)[number];

/**
 * Field names a provider must never send. Presence is a REJECTION, not a sanitization.
 *
 * Sanitizing a governance field teaches nothing and hides a provider that is trying to write one.
 * Rejecting produces a reason code the evaluation phase can count.
 */
export const FORBIDDEN_EXPERT_FIELD_NAMES: readonly string[] = [
  'citation', 'citations', 'regulation', 'regulations', 'cfr',
  'knowledgeReleaseId', 'releaseId', 'knowledge_release_id',
  'approvalStatus', 'approved', 'approvedBy', 'reviewState', 'reviewerId',
  'standardText', 'standard_text', 'plainLanguageSummary',
  'severityScore', 'riskScore', 'isActionable', 'findingId',
];

/**
 * A string that looks like a regulatory citation. Used to refuse a citation smuggled into prose --
 * the anti-citation-laundering contract applied to free text, not only to field names.
 */
export const CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i;
