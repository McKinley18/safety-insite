/**
 * EXPERT HAZLENZ -- OWED-FACT RUNTIME CONTRACT. §170.
 *
 * The shared runtime type for the owed-fact architecture proven locally in §165, exercised hosted
 * in §167 and human-reviewed in §169. It is INTEGRATED AND INACTIVE: nothing in the customer path
 * reaches the Expert layer at all, and the verifier-v3 stage is additionally gated behind a
 * compile-time constant that is the literal `false`.
 *
 * ==================== WHAT HAZLENZ OWNS, STATED AS A TYPE ====================
 *
 * A provider returns bounded DECLARATIONS. It never returns a status, a coverage verdict, an
 * arbitration outcome or an evidence criterion. Every field on `OwedFact` that decides anything is
 * populated by HazLenz, and `status` moves only through a recorded transition carrying an authority.
 *
 * ==================== acceptableEvidence, AND WHAT IT IS NOT ====================
 *
 * §169's human review found four questions that named the right fact while accepting evidence that
 * could not settle it -- physical presence, visibility, a status indicator. The remedy belongs in
 * HazLenz task state, not in a prompt prior, so the owed fact itself may now carry what would
 * actually resolve it.
 *
 * `acceptableEvidence` is bounded settlement guidance. It is NOT a grading answer, NOT expected
 * wording, NOT an output template, NOT a human-truth label, and NOT a matcher. Nothing compares a
 * question against it, because "does this question demand evidence sufficient to settle the fact"
 * is a semantic judgement and a deterministic gate for it would be the matcher §160 retired.
 *
 * `acceptableEvidence: null` is VALID and must stay valid. Where no trustworthy production source
 * exists for a given fact, the correct value is null and not an invented one.
 */

export const OWED_FACT_CONTRACT_VERSION = 'hazlenz.expert.owed-facts.runtime.v1' as const;

export const OWED_FACT_STATUSES = [
  'UNRESOLVED', 'COVERED', 'SETTLED_BY_EVIDENCE', 'REJECTED_BY_ARBITRATION',
] as const;
export type OwedFactStatus = (typeof OWED_FACT_STATUSES)[number];

export const OWED_FACT_PRIORITIES = ['LIFE_CRITICAL', 'REQUIRED_CONTROL', 'OTHER'] as const;
export type OwedFactPriority = (typeof OWED_FACT_PRIORITIES)[number];

export const OWED_FACT_AFFECTED_DECISIONS = [
  'HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY', 'REQUIRED_CONTROL',
  'REGULATORY_INTERPRETATION',
] as const;
export type OwedFactAffectedDecision = (typeof OWED_FACT_AFFECTED_DECISIONS)[number];

/** Where an owed fact came from. Decides what it is permitted to do. */
export const OWED_FACT_SOURCES = [
  'DETERMINISTIC',
  'GOVERNED_EVIDENCE',
  'FIRST_PASS_MODEL',
  'VERIFIER_NOMINATION',
  'DEVELOPMENT_HUMAN_TRUTH',
] as const;
export type OwedFactSource = (typeof OWED_FACT_SOURCES)[number];

export const OWED_FACT_POPULATIONS = ['PRODUCTION', 'DEVELOPMENT'] as const;
export type OwedFactPopulation = (typeof OWED_FACT_POPULATIONS)[number];

/**
 * Sources a PRODUCTION ledger may be populated from. `DEVELOPMENT_HUMAN_TRUTH` is absent, and its
 * absence is the point: fixture truth is the standard the system is MEASURED AGAINST, so admitting
 * it into production would make the ruler part of the thing being measured.
 */
export const PRODUCTION_PERMITTED_SOURCES: readonly OwedFactSource[] =
  ['DETERMINISTIC', 'GOVERNED_EVIDENCE', 'FIRST_PASS_MODEL', 'VERIFIER_NOMINATION'];

/** Sources whose facts are authored by a model rather than derived by a rule or governed record. */
export const MODEL_AUTHORED_SOURCES: readonly OwedFactSource[] =
  ['FIRST_PASS_MODEL', 'VERIFIER_NOMINATION'];

// ---------------------------------------------------------------- acceptable evidence

/**
 * What would actually resolve an owed fact. Bounded, capability-oriented, and deliberately short.
 *
 * `insufficientExamples` is the half §169 exists for: naming the evidence classes that LOOK like
 * settlement and are not.
 */
export interface AcceptableEvidence {
  /** One sentence naming the capability the evidence must establish. */
  readonly requirement: string;
  /** Evidence classes that would settle the fact. Illustrative, never exhaustive. */
  readonly examples?: readonly string[];
  /** Evidence classes that would NOT settle it, however superficially similar. */
  readonly insufficientExamples?: readonly string[];
  /** Which authority supplied this. Governs whether it may exist in production at all. */
  readonly provenance: AcceptableEvidenceProvenance;
}

/**
 * Who may author an evidence criterion.
 *
 * The first four are architecture-owned and may reach production. The last three exist so that an
 * illegitimate source is REPRESENTABLE AND REFUSABLE rather than merely undocumented -- a value the
 * type system can carry is a value a check can reject.
 */
export const ACCEPTABLE_EVIDENCE_PROVENANCES = [
  'DETERMINISTIC_RULE_METADATA',
  'GOVERNED_EVIDENCE',
  'AUTHORED_HAZLENZ_SAFETY_CONTRACT',
  'VALIDATED_DOMAIN_CONTROL_DEFINITION',
  'DEVELOPMENT_HUMAN_TRUTH',
  'ADJUDICATION_LABEL',
  'MODEL_SELF_AUTHORED',
] as const;
export type AcceptableEvidenceProvenance = (typeof ACCEPTABLE_EVIDENCE_PROVENANCES)[number];

/** The only provenances permitted to populate `acceptableEvidence` in PRODUCTION. */
export const PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES: readonly AcceptableEvidenceProvenance[] = [
  'DETERMINISTIC_RULE_METADATA',
  'GOVERNED_EVIDENCE',
  'AUTHORED_HAZLENZ_SAFETY_CONTRACT',
  'VALIDATED_DOMAIN_CONTROL_DEFINITION',
];

/**
 * Recorded in code so a later edit that admits one contradicts a published constant.
 *
 * `ADJUDICATION_LABEL` is listed separately from `DEVELOPMENT_HUMAN_TRUTH` because a §169-style
 * disposition is a judgement ABOUT the system's output, and feeding it back in as task state would
 * close the loop the evaluation depends on being open.
 */
export const PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES: readonly AcceptableEvidenceProvenance[] = [
  'DEVELOPMENT_HUMAN_TRUTH',
  'ADJUDICATION_LABEL',
  'MODEL_SELF_AUTHORED',
];

/**
 * The rule for the case that will be common at first, stated so nobody fills the gap with
 * invention: when no trustworthy production source exists, `acceptableEvidence` is null.
 */
export const NULL_ACCEPTABLE_EVIDENCE_IS_VALID = true as const;

// ---------------------------------------------------------------- whyUnresolved

/**
 * `whyUnresolved` IS BOUND TO `status`, AND THE BINDING IS STRICT IN BOTH DIRECTIONS.
 *
 * `UNRESOLVED` requires a truthful non-blank sentence. Every other status requires null.
 *
 * The second half is the half this constant exists for. The field was previously required
 * unconditionally, so a truthfully SETTLED fact could not be represented at all without inventing a
 * sentence saying why it was unresolved -- and `projectOwedFact` puts that sentence in front of a
 * provider. On a settled control row any such sentence is false, and a false sentence projected onto
 * exactly the rows that exist as controls corrupts the control rather than merely annoying the type
 * checker.
 *
 * So the rule is NEVER WRITE A FALSE FIELD VALUE TO SATISFY A RUNTIME TYPE. Nullable here does not
 * mean optional: an `UNRESOLVED` fact with a null or blank `whyUnresolved` is still refused, and a
 * non-`UNRESOLVED` fact carrying any string at all -- including the empty string -- is refused too.
 * There is no synthetic stand-in. "already resolved", "not unresolved", "settled" and "no
 * uncertainty" are all false-by-construction and none of them is written anywhere.
 */
export const WHY_UNRESOLVED_STATUS_INVARIANT = {
  UNRESOLVED: 'REQUIRED_NON_BLANK',
  COVERED: 'MUST_BE_NULL',
  SETTLED_BY_EVIDENCE: 'MUST_BE_NULL',
  REJECTED_BY_ARBITRATION: 'MUST_BE_NULL',
} as const satisfies Readonly<Record<OwedFactStatus, 'REQUIRED_NON_BLANK' | 'MUST_BE_NULL'>>;

// ---------------------------------------------------------------- the owed fact

export interface OwedFact {
  /** Stable identifier, unique within the analysis. The unit of binding and of deduplication. */
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly source: OwedFactSource;
  /** Verbatim span of the observation or governed record. */
  readonly evidenceSpan: string;
  /**
   * Why the fact is not established, and null once it is not `UNRESOLVED`. See
   * `WHY_UNRESOLVED_STATUS_INVARIANT`: the nullability exists so a settled fact can be represented
   * truthfully, NOT so the field can be omitted where it is owed.
   */
  readonly whyUnresolved: string | null;
  readonly branchA: string;
  readonly branchB: string;
  /** What is done today under each branch. The two must differ. */
  readonly decisionDivergence: { readonly ifA: string; readonly ifB: string };
  readonly priority: OwedFactPriority;
  readonly status: OwedFactStatus;
  /** What would actually settle this fact. Null is valid and must stay valid. */
  readonly acceptableEvidence: AcceptableEvidence | null;
  /**
   * True when the fact came from model output. Such a fact may raise a question; it may not alone
   * justify a fail-closed customer-visible state.
   */
  readonly modelAuthored: boolean;
}

// ---------------------------------------------------------------- transitions

/**
 * What may move a fact out of `UNRESOLVED`, and nothing else may.
 *
 * There is deliberately no member for a model explanation. §167's draws each carried a long, fluent
 * rationale; every one of them would have been persuasive to a rule that accepted explanation as
 * authority.
 */
export const TRANSITION_AUTHORITIES = [
  'ADMITTED_BINDING',
  'ADMISSIBLE_EVIDENCE',
  'RECORDED_ARBITRATION',
] as const;
export type TransitionAuthority = (typeof TRANSITION_AUTHORITIES)[number];

/** Which authority each terminal status requires. One-to-one, with no wildcard. */
export const REQUIRED_AUTHORITY:
Readonly<Record<Exclude<OwedFactStatus, 'UNRESOLVED'>, TransitionAuthority>> = {
  COVERED: 'ADMITTED_BINDING',
  SETTLED_BY_EVIDENCE: 'ADMISSIBLE_EVIDENCE',
  REJECTED_BY_ARBITRATION: 'RECORDED_ARBITRATION',
};

export interface OwedFactTransition {
  readonly seq: number;
  readonly factKey: string;
  readonly from: OwedFactStatus;
  readonly to: OwedFactStatus;
  readonly authority: TransitionAuthority;
  readonly justification: string;
  /**
   * The `whyUnresolved` the fact carried immediately before this transition, preserved because the
   * transition nulls it to satisfy `WHY_UNRESOLVED_STATUS_INVARIANT`.
   *
   * Clearing the field without recording it here would destroy the evidence that the fact was ever
   * unresolved and why -- the ledger is append-only precisely so a value that goes away leaves a
   * record behind. Never reconstructed after the fact.
   */
  readonly whyUnresolvedAtTransition: string | null;
}

// ---------------------------------------------------------------- provider-side declarations

/** The declaration a provider returns for each supplied owed fact. Bounded, and never a status. */
export const OWED_FACT_DECLARATIONS = [
  'BOUND_BY_CLARIFICATION', 'STILL_UNRESOLVED', 'CHALLENGE_FACT_VALIDITY',
] as const;
export type OwedFactDeclaration = (typeof OWED_FACT_DECLARATIONS)[number];

/**
 * A challenge is a REQUEST FOR ARBITRATION and never a settlement. `settles` is typed as the
 * literal `false` so no caller can read it as a decision, and HazLenz owns the transition.
 */
export interface ArbitrationRequest {
  readonly factKey: string;
  readonly requestedBy: 'VERIFIER';
  readonly reason: string;
  readonly settles: false;
  readonly factStatusUnchanged: true;
}

/**
 * Fields a provider may never return. `acceptableEvidence` is here because it is HazLenz task
 * state projected INTO the request: a response echoing it back would be the evaluated component
 * editing its own settlement criterion.
 */
export const PROVIDER_FORBIDDEN_OWED_FACT_FIELDS = [
  'acceptableEvidence', 'status', 'priority', 'source', 'modelAuthored',
  'settled', 'resolved', 'covered', 'rejected', 'factNotDecisionCritical',
] as const;
