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
 *
 * ==================== EVERY MEMBER IS DEFINED, AND THAT IS §139 WORK ====================
 *
 * These were bare names until §139. The §138 instrument audit verified that no member carried a
 * definition in this type, in `EXPERT_SYSTEM_PROMPT`, or in the wire schema -- the schema emitted
 * `enum: [...EXPERT_AFFECTED_DECISIONS]` with no per-value `description` at all. Two independent
 * labellers, the model and the evaluation answer-key author, then disagreed BIDIRECTIONALLY on the
 * same pairs (`REQUIRED_CONTROL` <-> `HAZARD_EXISTENCE` three times, `HAZARD_SEVERITY` <->
 * `HAZARD_EXISTENCE` in both directions). Disagreement running both ways between two labellers is
 * the signature of an under-specified vocabulary, not of a model biased in one direction, so the
 * repair is to DEFINE the vocabulary rather than to correct the model.
 *
 * `EXPERT_MEASURE_SCORERS` reads `affectedDecision` for equality, and one frozen gate triggers
 * exclusively on `HAZARD_EXISTENCE`. A label is therefore load-bearing and is not a topic tag.
 *
 *  - `HAZARD_EXISTENCE`         Does the hazardous condition exist at all, right now? Legitimate
 *                               ONLY while existence is genuinely open. A question asked alongside
 *                               the asker's own `ACTIVE` candidate for that hazard is a
 *                               contradiction, not a clarification.
 *  - `HAZARD_SEVERITY`          The hazard exists; how severe is the consequence, or how large is
 *                               the magnitude. "How much / how many / how long / how far."
 *  - `EXPOSURE`                 Who or what is exposed, or whether exposure is occurring at all.
 *  - `APPLICABILITY`            Whether a rule, programme or control framework governs the facts as
 *                               established. About SCOPE. Not about which control to use.
 *  - `REQUIRED_CONTROL`         Which control is required, or whether a specific control was
 *                               applied, once hazard and framework are settled. "Was it isolated,
 *                               locked out, bled down, guarded" is THIS, never `HAZARD_EXISTENCE`.
 *  - `REGULATORY_INTERPRETATION` What a SUPPLIED governed record means, or how its stated conditions
 *                               apply here. Unusable when no governed record was supplied, because
 *                               there is then no text to interpret.
 *
 * The three collision pairs are decided explicitly and the same three sentences appear in the prompt
 * and in the wire schema, so the model and this type cannot drift apart.
 *
 * ==================== §148: THE LABEL IS DESTRUCTIVE, AND THE MODEL IS NOW TOLD SO ====================
 *
 * §147 produced the first hosted exercise of `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`. On CR-F2
 * the model asked a substantively correct SCOPE question -- whether a solvent loading pad is a
 * classified hazardous area -- labelled it `HAZARD_EXISTENCE`, linked it to its own `fire_explosion`
 * candidate which it had asserted `ACTIVE`, and arbitration destroyed the question. Arbitration
 * behaved exactly as §141 specified and proved. **The LABEL was wrong; the arbitration was not.**
 *
 * §148 evaluated five policies for that case and RETAINED the fail-closed behaviour unchanged:
 *
 *   A  reject the whole clarification                    -- RETAINED, this is the current behaviour
 *   B  keep the question, strip/neutralize the label     -- REFUSED
 *   C  deterministically reclassify `affectedDecision`   -- REFUSED
 *   D  reclassify only where another reading is inferable-- REFUSED
 *   E  keep A and repair label accuracy at the model     -- ADOPTED, alongside A
 *
 * B is not expressible without a contract change: `affectedDecision` is `required` on the wire and
 * non-nullable here, `EXPERT_MEASURE_SCORERS` reads it for equality, and a neutralized label would
 * hand the reviewer a question whose decision relationship is unknown -- strictly worse than the
 * arbitration it replaces, because a question that contradicts an ACTIVE candidate would then reach
 * the customer with no label to contradict on.
 *
 * C and D fail for the same reason and it is the reason this stage exists: reclassification requires
 * reading an arbitrary natural-language question and deciding what decision it turns on. That is
 * SEMANTIC INFERENCE, the capability the arbitration stage was deliberately built WITHOUT, and §138
 * measured the cost of guessing there -- 6 of 11 row-level flags were label artefacts rather than
 * real contradictions. A keyword rule would additionally contradict the governing principle already
 * written into `relatesToCandidateKey` below: classify by the DECISION RELATIONSHIP, never by whether
 * the question's words include a particular term. D is C with a confidence gate, and the gate is the
 * same inference.
 *
 * E is the owner's earliest-trustworthy-layer principle applied: the untrusted input is the LABEL, so
 * the label is repaired where it is produced. v11 adds the self-check against the model's own
 * candidate list, routes the four cases that get mislabelled as existence, and -- the part that was
 * missing -- DISCLOSES THE CONSEQUENCE. Until §148 the producer was told the rule and never told that
 * breaking it destroys the question.
 *
 * `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE` IS NOT WEAKENED, NOT NARROWED AND NOT MADE
 * CONDITIONAL. Its trigger is byte-unchanged. A genuine existence contradiction is still rejected in
 * full, and `affectedDecision` accuracy is now a REQUIRED MODEL-SIDE GATE rather than a cosmetic
 * measure -- which is the disposition §141 left open and §147 made costly.
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
  /**
   * OPTIONAL declared linkage to a candidate in the same analysis. §139.
   *
   * The blueprint rule that a clarification must not REQUIRE a candidate is unchanged -- this is a
   * nullable back-reference the producer may set, never a dependency. It exists so cross-collection
   * arbitration can tell "you say this hazard is active and also ask whether it exists" from "you
   * ask about a different hazard than the one you raised". Without it the two are indistinguishable
   * and any arbitration must either over-suppress or do nothing; §138 measured the cost of guessing,
   * finding that 6 of 11 flagged contradictions were label artefacts rather than real ones.
   *
   * `null` means the producer declared no link, and arbitration then ABSTAINS rather than assuming.
   *
   * OPTIONAL in the type as well as on the wire, so every construction site that predates §139 --
   * fixtures, tests, other producers -- keeps compiling and keeps meaning exactly what it meant:
   * no declared link. `normalizeExpertOutput` always writes an explicit `string | null`.
   *
   * ==================== §141: WHEN IT MUST BE SET, MAY BE SET, AND MUST NOT BE ====================
   *
   * §140 measured 3 linkage opportunities under a definition that counted ANY clarification emitted
   * beside ANY candidate. That definition conflated three different situations, and the resulting
   * "1 of 3 populated" was not evidence of under-population. Re-read against the rule below, all
   * three of those decisions were CORRECT. The defect was the under-specified contract, not the
   * model. So the contract now states the three cases explicitly.
   *
   * ==================== §143: THE GOVERNING PRINCIPLE, AND THE PRECEDENCE ====================
   *
   *      SPECIFIC SEMANTIC RELATIONSHIP OVERRIDES SUPERFICIAL QUESTION FORM.
   *
   * A clarification is classified by the DECISION RELATIONSHIP it has to an actual emitted
   * candidate -- never by whether its words include PPE, procedure, documentation, inspection or
   * training. §142 measured what the older wording cost: a question about the PPE worn during one
   * specific decanting task, uniquely qualifying one of four candidates, was scored a FORBIDDEN
   * link because the old clause said "general PPE ... follow-up" without saying that GENERAL was
   * doing the work. The categories collided, and a correct model behaviour was recorded as a
   * violation.
   *
   * The three tests are now applied IN ORDER, and the first that matches decides:
   *
   *   1. REQUIRED  -- all THREE hold:
   *        (a) exactly ONE emitted candidate is the direct subject of the missing fact;
   *        (b) materially different answers would change that candidate's existence, active/current
   *            status, applicability, required control, exposure characterization, or accepted
   *            interpretation;
   *        (c) the clarification cannot be interpreted correctly without knowing which candidate it
   *            qualifies.
   *
   *   2. ALLOWED   -- one candidate is clearly the primary subject and the question materially
   *        refines it, but the question stands on its own and is decision-useful without the link.
   *
   *   3. FORBIDDEN -- everything else, and only for a POSITIVE reason: no candidate is the direct
   *        semantic subject; two or more candidates are equally plausible; the question is genuinely
   *        row-level or general; it concerns a different hazard; the only connection is a shared
   *        family or category; or it is GENERIC PPE / procedure / documentation / training follow-up
   *        WITH NO CANDIDATE-SPECIFIC DECISION EFFECT.
   *
   * "Generic" is the operative word in that last clause. A PPE, procedure or documentation question
   * that satisfies the REQUIRED test is REQUIRED -- the form of the question never demotes a real
   * candidate-specific relationship, because REQUIRED is tested FIRST.
   *
   * A key must name a candidate this analysis actually emitted. An invented or unresolvable key is
   * not honoured: `normalizeExpertOutput` strips it to `null` and records
   * `CLARIFICATION_LINK_UNRESOLVED` against the item, so the question survives, the false
   * back-reference does not, and arbitration abstains rather than acting on a name that means
   * nothing.
   *
   * REQUIRED-ness is SEMANTIC and therefore cannot be decided at the production boundary -- nothing
   * here rejects a clarification for failing to link. Missing-when-required is detectable only
   * against an authored expectation, which is a DEVELOPMENT instrument concern and lives in
   * `scripts/lib/expert-probe-measures.ts`.
   */
  relatesToCandidateKey?: string | null;
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

// ---------------------------------------------------------------- deterministic family dispositions

/**
 * What the deterministic layer concluded about ONE hazard family. §119, promoting the §116 design
 * hosted-confirmed in §118/D-130.
 *
 * ==================== WHY THIS IS NOT A `DeterministicFindingView` ====================
 *
 * A `DeterministicFindingView` is a FINDING -- something the engine concluded exists. A
 * `NOT_APPLICABLE` determination is the opposite: a statement that a family was considered and NO
 * finding arises. Representing "there is no finding here" as an entry in a findings array is a
 * category error, and §116 rejected that extension point for exactly that reason.
 *
 * ==================== WHY ITS OWN VOCABULARY, NOT `ExpertConditionState` ====================
 *
 * `EXPERT_CONDITION_STATES` has no member meaning "evaluated and excluded", and it may not gain
 * one: `test-expert-contract-foundation.ts` E.3 asserts that vocabulary is BYTE-IDENTICAL to the
 * Level-3 one, read as data at runtime. Adding `NOT_APPLICABLE` there would break a frozen shared
 * vocabulary and make an Expert condition assertion stop being comparable to a Level-3 one. So this
 * is a separate, smaller vocabulary describing what the DETERMINISTIC layer said, not what Expert
 * asserts.
 */
export const DETERMINISTIC_DISPOSITIONS = ['ACTIVE', 'CONTROLLED', 'NOT_APPLICABLE', 'UNKNOWN'] as const;
export type DeterministicDisposition = (typeof DETERMINISTIC_DISPOSITIONS)[number];

export interface DeterministicControllingFact {
  /** The deterministic layer's own predicate name, verbatim. */
  fact: string;
  status: 'SUPPORTED' | 'NOT_SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN' | 'NOT_APPLICABLE';
}

/**
 * ==================== CITATION-FREE BY NECESSITY, NOT BY OVERSIGHT ====================
 *
 * `FORBIDDEN_EXPERT_FIELD_NAMES` includes `citation`/`cfr`, and `CITATION_SHAPED_PATTERN` refuses a
 * citation smuggled into PROSE, not only into a field. The deterministic decision this is derived
 * from carries `citation: '29 CFR 1910.212(a)(1)'`. Projecting it would hand the model a citation
 * and invite it to echo one back -- and the normalizer would then reject the ENTIRE analysis. So
 * this type carries the Expert taxonomy family and never the citation, the bundle or the source.
 */
export interface DeterministicFamilyDisposition {
  /** Expert taxonomy family. NEVER a citation. */
  hazardFamily: string;
  disposition: DeterministicDisposition;
  isActionable: boolean;
  /** The engine's own confidence in this disposition. */
  confidence: number;
  /** The named predicates that produced the disposition, with their statuses. */
  controllingFacts: DeterministicControllingFact[];
  /** One derived, citation-free sentence. Never hand-written per family. */
  rationale: string;
  /** Verbatim spans of the observation that established the controlling state facts. */
  evidenceQuotes: string[];
  /** So a constructed diagnostic row is distinguishable from a derived one. */
  provenance: 'DERIVED_FROM_PRODUCTION_ENGINE' | 'CONSTRUCTED_FOR_DIAGNOSTIC';
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
  /**
   * What the deterministic layer concluded about each hazard family it EVALUATED, including the
   * families it evaluated and EXCLUDED. §119, promoting the §116 design hosted-confirmed in §118.
   *
   * ==================== ABSENT IS NOT THE SAME AS "EVALUATED AND EXCLUDED" ====================
   *
   * OPTIONAL, and the optionality is the whole point. Three states must stay distinguishable:
   *
   *   undefined  the caller has no deterministic family evaluation to offer. Backward compatible:
   *              the prompt renders NO section at all and the request is byte-identical to one
   *              built before this field existed.
   *   []         an evaluation ran and produced nothing projectable. Also renders no section --
   *              silence is the honest rendering of "nothing to say", and synthesising an empty
   *              NOT_APPLICABLE here would fabricate a determination the engine never made.
   *   [rows]     these families WERE evaluated, with these dispositions.
   *
   * `deterministicFindings` cannot carry this: it renders a family that was evaluated-and-excluded
   * identically to a family never considered -- as absence -- which is the §116 root cause of the
   * hosted R6 over-routing.
   */
  deterministicFamilyDispositions?: DeterministicFamilyDisposition[];
  /** Governed records the system chose to supply. Empty means Expert may cite nothing at all. */
  governedStandards: GovernedStandardView[];
  /** Answers already collected in this workflow. */
  answeredClarifications: Array<{ clarificationId: string; answer: string }>;
}

// ---------------------------------------------------------------- the analysis contract

/**
 * Whether a hazard candidate CLAIMS an exact quote from the observation.
 *
 * §104's hosted probe measured `EVIDENCE_QUOTES_EMITTED = 0` across both grounding fixtures, and
 * §100/§101 measured the same `quotes = 0/0` locally across fourteen calls. The cause was not model
 * incapacity: `evidence` was optional on the wire AND the prompt actively told the producer to omit
 * it ("A QUOTE IS OPTIONAL ... raise the candidate anyway with an empty list"), so silence was the
 * cheapest legal answer and every producer took it.
 *
 * A required status field replaces silence with a DECLARATION. The producer must say which case it
 * is in, and the boundary then holds it to that claim:
 *
 *   EXACT_QUOTE_SUPPLIED     evidence MUST be non-empty and every quote MUST bind exactly.
 *                            A claim with nothing behind it FAILS CLOSED — the candidate is dropped.
 *   NO_EXACT_QUOTE_AVAILABLE evidence MUST be empty. The candidate SURVIVES and scores as
 *                            ungrounded, exactly as before. This is the escape hatch that keeps the
 *                            §101 failure from returning: attempt 1 of the routing repair demanded a
 *                            quote for every candidate and suppressed the whole collection.
 *
 * The point is that omission is no longer free and no longer silent. It costs an explicit statement
 * that the observation contains nothing quotable, which is FALSIFIABLE against the observation.
 */
export const EXPERT_GROUNDING_STATUSES = [
  'EXACT_QUOTE_SUPPLIED',
  'NO_EXACT_QUOTE_AVAILABLE',
] as const;
export type ExpertGroundingStatus = (typeof EXPERT_GROUNDING_STATUSES)[number];

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
