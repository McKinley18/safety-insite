/**
 * §210I -- EXPERT HAZLENZ: SAFETY-TRUTH / VERIFICATION-STATE SEPARATION. ARCHITECTURE REVIEW.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * This module is a DESIGN PROTOTYPE in the §201 tradition: types, a carrier audit recorded as data,
 * an option table, and fixtures that can be executed. It changes no contract, edits no pinned file,
 * touches no prompt, and is imported by nothing but its own suite.
 *
 * ==================== THE QUESTION §210I WAS ASKED ====================
 *
 * Is the final remaining R4 behaviour -- §210H's G1 -- caused by an insufficient semantic
 * representation?
 *
 * The answer is NEITHER of the two terminals the authorization anticipated, and forcing it into
 * either would misreport it. Stated precisely, in two halves that must not be merged:
 *
 *   HALF ONE, ON EXPRESSIVENESS.  The existing representation CAN express the correct G1 entry.
 *   §210H proves it on its own evidence: G2 met the same shape -- a present physical state, an
 *   absent check, a fail-closed action -- with the same eleven fields, and put the epistemic content
 *   in `notEstablishedBecause` ("only that its condition is unconfirmed") while both branches stayed
 *   on the state. G3 did the same for an act-shaped property. A representation two of three cases
 *   used correctly is not a representation that makes correctness impossible. Any claim that the
 *   schema FORCED G1's collapse is falsified by G2, and this module does not make it.
 *
 *   HALF TWO, ON CARRIERS.  There is nonetheless a real and demonstrable representational gap, and
 *   it is established by reading the types alone -- it does not rest on G1, on any single case, or
 *   on any model behaviour at all. Of the three concepts the authorization requires be kept
 *   distinct, one has no first-class carrier anywhere in the contract, and a second is carried only
 *   on the declaration and is dropped before the verifier ever sees it. See `CARRIER_AUDIT`.
 *
 * The gap and the G1 defect are therefore RELATED BUT NOT IDENTICAL, and this module is careful to
 * keep them apart. Closing the gap is justified on architectural grounds -- the §210I core
 * invariant, and the verifier consequence the authorization names. Whether closing it also moves R4
 * is an OPEN EMPIRICAL QUESTION that a zero-provider slice cannot answer and this module does not
 * pretend to. See `WHAT_THIS_DOES_NOT_ESTABLISH`.
 *
 * ==================== WHAT THE MISSING CARRIER ACTUALLY IS ====================
 *
 * Not a verification-state enum. See `VERIFICATION_STATE_ENUM_REJECTED`: at the first pass an
 * epistemic state would be a CONSTANT, because every member of `unresolvedFactDeclarations` is
 * unresolved by the collection's own definition, and downstream it is already carried by
 * `OwedFact.status`. Adding one would be a duplicate field restating existing semantics.
 *
 * The missing carrier is the OPERATIONAL CONSEQUENCE WHILE THE TRUTH REMAINS UNRESOLVED -- the
 * third member of the authorization's own core invariant, and the one member of the critical
 * three-state example the current contract cannot represent. `decisionIfA` and `decisionIfB` are
 * both conditioned on a branch BEING TRUE; the instruction says so in as many words. Nothing
 * carries what must happen while neither is established.
 *
 * That absence has a direction. An entry whose correct current action is a hold must reach that
 * hold through one of the two truth-conditioned slots, because they are the only slots that carry
 * an action at all. GATE 12 forbids routing the unresolved world into branchB. It does not supply
 * anywhere else to route it. G1's own text shows both moves being made at once -- branchB reads
 * "the restraint the ties provide is UNCONFIRMED or inadequate", a literal union of an epistemic
 * state and a safety state in one field, and `decisionIfA` reads "ONCE THIS IS CONFIRMED ... no
 * further tie-related action is needed", a decision conditioned on confirmation rather than truth.
 *
 * This is recorded as a MECHANISM CONSISTENT WITH THE EVIDENCE, not as a proven cause. G2 shows the
 * same pressure resolved correctly, so the pressure is not sufficient to produce the defect.
 *
 * ==================== THE SECOND GAP, WHICH THE FIXTURE LIST SURFACES ====================
 *
 * Fixtures 1, 2 and 6 of the authorization all require distinguishing "settled, and the satisfactory
 * branch is what was established" from "settled, and the adverse branch is what was established".
 * `OWED_FACT_STATUSES` cannot: `SETTLED_BY_EVIDENCE` records that admissible evidence arrived and
 * an authority was minted. It does not record WHICH branch the evidence established. That outcome
 * survives only inside `OwedFactTransition.justification`, as prose.
 *
 * So evidence PRESENCE and satisfactory TRUTH are, at the type level, currently indistinguishable
 * on a settled fact -- which is fixture 6 stated as a defect rather than as a test.
 *
 * ==================== THE MODEL / DETERMINISTIC BOUNDARY IS UNCHANGED ====================
 *
 * Everything proposed here is authored by a MODEL (the declaration field) or by a HUMAN REVIEWER
 * (the settlement outcome). Deterministic code validates presence, membership and linkage, and
 * nothing else. `NO_SEMANTIC_MATCHER_ADDED` records what was deliberately NOT built, and the suite
 * asserts this file contains no keyword rule over safety prose.
 */

import {
  type OwedFactStatus, type OwedFactPriority, type OwedFactAffectedDecision,
  OWED_FACT_STATUSES,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { isNonSemanticFiller } from './expert-first-pass-owed-fact-projection';

export const EPISTEMIC_REPRESENTATION_VERSION =
  'hazlenz.expert.210i.epistemic-representation.prototype.v1' as const;

export const PROVIDER_CALLS = 0 as const;
export const DATABASE_OPERATIONS = 0 as const;

// ================================================================ 1. the carrier audit

/** The three concepts the §210I core invariant requires be distinguishable. */
export const CORE_CONCEPTS = [
  'SAFETY_PROPERTY',
  'SUBSTANTIVE_TRUTH_BRANCHES',
  'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE',
  'OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED',
  'ESTABLISHED_TRUTH_OUTCOME_AT_SETTLEMENT',
] as const;
export type CoreConcept = (typeof CORE_CONCEPTS)[number];

/** The three representational layers a concept must survive. */
export const LAYERS = ['FIRST_PASS_DECLARATION', 'OWED_FACT_RUNTIME', 'VERIFIER_FACING'] as const;
export type Layer = (typeof LAYERS)[number];

export type CarrierVerdict =
  | 'FIRST_CLASS'
  | 'PROSE_ONLY'
  | 'PRESENT_BUT_CLOSED_TO_THE_AUTHOR'
  | 'CONSTANT_BY_CONSTRUCTION'
  | 'SIDECAR_ONLY'
  | 'ABSENT';

export interface CarrierRow {
  readonly concept: CoreConcept;
  readonly layer: Layer;
  readonly field: string | null;
  readonly verdict: CarrierVerdict;
  readonly note: string;
}

/**
 * WHERE EACH CONCEPT LIVES TODAY. Read out of the actual types, not assumed from prose.
 *
 * Sources, so a reviewer can check every row without trusting this table:
 *   declaration  scripts/lib/expert-first-pass-instruction-vnext.ts unresolvedFactDeclarationItemSchema
 *   OwedFact     src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts
 *   verifier     src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts
 *   sidecar      scripts/lib/section-210b-verifier-payload.ts
 */
export const CARRIER_AUDIT: readonly CarrierRow[] = [
  // ---- A. the exact safety property
  {
    concept: 'SAFETY_PROPERTY', layer: 'FIRST_PASS_DECLARATION', field: 'missingFact',
    verdict: 'FIRST_CLASS',
    note: 'required, model-authored, one plain phrase, one fact per entry',
  },
  {
    concept: 'SAFETY_PROPERTY', layer: 'OWED_FACT_RUNTIME', field: null, verdict: 'ABSENT',
    note: 'no OwedFact field exists. §196 NON_PROJECTING_DECLARATION_FIELDS records the drop and '
      + 'PROJECTION_RESIDUAL_LIMITS states it: "OwedFact has no field for the owed property itself". '
      + 'The property survives only implicitly across whyUnresolved and the two branches.',
  },
  {
    concept: 'SAFETY_PROPERTY', layer: 'VERIFIER_FACING', field: 'the §210B-1 O4 sidecar',
    verdict: 'SIDECAR_ONLY',
    note: 'projectOwedFact cannot carry what OwedFact does not hold. §210B-1 attaches the property '
      + 'beside the pinned projection, byte-exact. That closes it on the §210B path only; a '
      + 'consumer handed the fact alone silently sees the old behaviour rather than failing.',
  },
  // ---- B. the substantive truth branches
  {
    concept: 'SUBSTANTIVE_TRUTH_BRANCHES', layer: 'FIRST_PASS_DECLARATION',
    field: 'branchA / branchB / decisionIfA / decisionIfB', verdict: 'FIRST_CLASS',
    note: 'all four required, all four non-blank-checked, branches checked distinct and decisions '
      + 'checked divergent',
  },
  {
    concept: 'SUBSTANTIVE_TRUTH_BRANCHES', layer: 'OWED_FACT_RUNTIME',
    field: 'branchA / branchB / decisionDivergence', verdict: 'FIRST_CLASS',
    note: 'projected explicitly by name, and owedFactDefects refuses a fact whose two branches '
      + 'state the same thing',
  },
  {
    concept: 'SUBSTANTIVE_TRUTH_BRANCHES', layer: 'VERIFIER_FACING',
    field: 'branchA / branchB / decisionDivergence', verdict: 'FIRST_CLASS',
    note: 'carried by projectOwedFact unchanged, and the only concept of the five that survives '
      + 'every layer intact',
  },
  // ---- C. evidence sufficiency / verification state
  {
    concept: 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE', layer: 'FIRST_PASS_DECLARATION',
    field: 'notEstablishedBecause', verdict: 'PROSE_ONLY',
    note: 'carries WHY the fact is not established by what was supplied. It is a reason, not a '
      + 'state, and §196 forbids composing anything else into it. It cannot carry what evidence '
      + 'would settle the fact, and it cannot carry an action.',
  },
  {
    concept: 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE', layer: 'FIRST_PASS_DECLARATION',
    field: 'the collection itself', verdict: 'CONSTANT_BY_CONSTRUCTION',
    note: 'every member of unresolvedFactDeclarations is unresolved by the collection\'s own '
      + 'definition. At this layer an epistemic state has exactly one legal value.',
  },
  {
    concept: 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE', layer: 'OWED_FACT_RUNTIME',
    field: 'status', verdict: 'FIRST_CLASS',
    note: 'UNRESOLVED / COVERED / SETTLED_BY_EVIDENCE / REJECTED_BY_ARBITRATION, each gated by a '
      + 'named transition authority. This IS the verification state, and it varies here.',
  },
  {
    concept: 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE', layer: 'OWED_FACT_RUNTIME',
    field: 'acceptableEvidence', verdict: 'PRESENT_BUT_CLOSED_TO_THE_AUTHOR',
    note: 'the structurally correct home for "what evidence is still required", already projected '
      + 'to the verifier and already null-valid. But acceptableEvidence is in '
      + 'PROVIDER_FORBIDDEN_OWED_FACT_FIELDS and MODEL_SELF_AUTHORED is in '
      + 'PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES, so on a capability-absent first pass it is '
      + 'null every time. The field exists; the model may not fill it.',
  },
  {
    concept: 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE', layer: 'VERIFIER_FACING',
    field: 'whyUnresolved + acceptableEvidence', verdict: 'PROSE_ONLY',
    note: 'status is in PROJECTION_FORBIDDEN_FIELDS and is deliberately never shown. The verifier '
      + 'infers unresolvedness from being handed the fact at all.',
  },
  // ---- D. the operational consequence while unresolved -- THE GAP
  {
    concept: 'OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED', layer: 'FIRST_PASS_DECLARATION',
    field: null, verdict: 'ABSENT',
    note: 'decisionIfA and decisionIfB are both conditioned on a branch BEING TRUE -- the schema '
      + 'description says "What is done TODAY if branchA holds". No field carries what is done '
      + 'while neither holds.',
  },
  {
    concept: 'OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED', layer: 'OWED_FACT_RUNTIME',
    field: null, verdict: 'ABSENT',
    note: 'decisionDivergence mirrors the two truth-conditioned decisions and adds no third slot',
  },
  {
    concept: 'OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED', layer: 'VERIFIER_FACING',
    field: null, verdict: 'ABSENT',
    note: 'nothing to project, because nothing upstream carries it. The verifier is told what is '
      + 'unresolved and what would settle it, and never what to do meanwhile.',
  },
  // ---- E. which branch was established at settlement -- THE SECOND GAP
  {
    concept: 'ESTABLISHED_TRUTH_OUTCOME_AT_SETTLEMENT', layer: 'OWED_FACT_RUNTIME',
    field: 'OwedFactTransition.justification', verdict: 'PROSE_ONLY',
    note: 'SETTLED_BY_EVIDENCE records that admissible evidence arrived and an authority was '
      + 'minted. It does not record whether branchA or branchB was established. At the type level '
      + 'a settled-satisfactory fact and a settled-adverse fact are the same value.',
  },
  {
    concept: 'ESTABLISHED_TRUTH_OUTCOME_AT_SETTLEMENT', layer: 'VERIFIER_FACING',
    field: null, verdict: 'ABSENT',
    note: 'settled facts are not projected at all; projectOwedFactsForVerifier filters to unresolved',
  },
];

/** The two concepts with no first-class carrier at any layer. Derived, not asserted. */
export function conceptsWithNoFirstClassCarrier(): CoreConcept[] {
  return CORE_CONCEPTS.filter(c =>
    !CARRIER_AUDIT.some(r => r.concept === c && r.verdict === 'FIRST_CLASS'));
}

// ================================================================ 2. what is NOT recommended

/**
 * WHY A FIRST-PASS `verificationState` ENUM IS REFUSED.
 *
 * The authorization forbids duplicate fields that merely restate existing semantics, and this would
 * be one. Recorded so the refusal is auditable rather than merely omitted.
 */
export const VERIFICATION_STATE_ENUM_REJECTED = {
  proposal: 'add a verificationState enum to the first-pass declaration',
  refused: true,
  reasons: [
    'at the first pass the value is a CONSTANT: unresolvedFactDeclarations is defined as one entry '
      + 'per UNRESOLVED fact, so every entry would carry the same member and the field would carry '
      + 'no information',
    'downstream the concept already varies and is already first-class: OwedFact.status moves only '
      + 'through a recorded transition carrying a named authority, which is a stronger guarantee '
      + 'than a model-authored enum would be',
    'a model-authored epistemic state would additionally be a settlement-adjacent claim, and '
      + 'PROVIDER_SETTLEMENT_AUTHORITY is the literal string NEVER',
  ],
} as const;

/**
 * WHY THE TWO-BRANCH TRUTH MODEL IS NOT TOUCHED.
 *
 * The authorization warns against turning branchA/branchB into three branches by accident. Nothing
 * proposed here does. The unresolved state is carried OUTSIDE the truth branches, by a field that
 * makes no truth claim at all, and by a status that asserts neither branch.
 */
export const TWO_BRANCH_MODEL_PRESERVED = {
  branchCount: 2,
  unresolvedIsNotABranch: true,
  where: 'unresolved lives in OwedFact.status (UNRESOLVED asserts neither branch) and, for the '
    + 'action it implies, in a separate non-truth-conditioned field',
  neverDone: 'no branchC, no third decisionIfC, no widening of branchB to admit the unresolved world',
} as const;

/**
 * CONCEPT A IS NOT DECIDED HERE, AND THAT IS DELIBERATE.
 *
 * Getting `missingFact` onto OwedFact is §201's question. It has five options already prototyped
 * (O1_UNCHANGED .. O5_ADDITIVE_SUCCESSOR_TYPE), an explicit `OWED_PROPERTY_RECOMMENDATION` of
 * `NOT_MADE`, and a recorded reason for withholding: §200 axis Q is unadjudicated. §210B-1 then
 * adopted O4 as a verifier-facing sidecar on its own path. Folding that decision into §210I would
 * settle a question another slice deliberately left open.
 */
export const CONCEPT_A_DEFERRED_TO_201 = {
  concept: 'SAFETY_PROPERTY' as CoreConcept,
  decidedHere: false,
  owner: '§201 REPRESENTATION_OPTIONS O1..O5, recommendation NOT_MADE pending §200 axis Q',
  partialClosure: '§210B-1 O4_EQUIVALENT_SIDECAR, verifier-facing, on the §210B path only',
  consequenceIfLeftOpen: 'the authorization\'s verifier requirement -- that the verifier receive '
    + 'the exact owed safety property explicitly -- is met only where the §210B-1 sidecar is '
    + 'assembled. A verifier handed a bare ProjectedOwedFact still cannot see the property.',
} as const;

/** No semantic matcher was built. Asserted by the suite against this file's own bytes. */
export const NO_SEMANTIC_MATCHER_ADDED = {
  hasKeywordRuleOverSafetyProse: false,
  reason: 'deciding whether a phrase names a state or its evidence requires reading it AS safety '
    + 'semantics. §210G recorded the same refusal for R4B and this slice does not reverse it. '
    + 'Everything validated below is presence, membership, linkage or closed-set filler.',
  whatDeterministicCodeMayCheckOnTheProposedField: [
    'the field is present',
    'the field is a non-blank string',
    'the field is not a member of the existing closed NON_SEMANTIC_FILLER set',
  ],
  whatDeterministicCodeMayNotCheck: [
    'that the action is fail-closed',
    'that the action is appropriate to the property',
    'that the action differs meaningfully from decisionIfB',
  ],
} as const;

/**
 * WHY NO DIVERGENCE RULE IS PROPOSED AGAINST `decisionIfB`.
 *
 * A fail-closed current action normally RESEMBLES the adverse-branch action, because both hold the
 * work. G1's frozen truth holds the gang off under branchB AND while unresolved; G3's holds the
 * fitter back under branchB AND while unresolved. A deterministic rule demanding they differ would
 * force the model to invent a difference, which is precisely the failure §210E R7 was built to
 * refuse and which the vNext instruction already forbids for decisionIfA/decisionIfB.
 */
export const NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B = {
  proposed: false,
  reason: 'a fail-closed unresolved action legitimately resembles the adverse-branch action; '
    + 'demanding a difference would demand an invention',
  whatDistinguishesThemInstead: 'the CONDITION, which is semantic and model-authored: decisionIfB '
    + 'follows from branchB being TRUE, the unresolved action follows from neither branch being '
    + 'established. Deterministic code does not and may not adjudicate that.',
} as const;

// ================================================================ 3. the recommendation

export interface SchemaChangeProposal {
  readonly id: string;
  readonly gap: CoreConcept;
  readonly layer: Layer;
  readonly shape: string;
  readonly required: boolean;
  readonly authoredBy: 'MODEL' | 'HUMAN_REVIEWER' | 'HAZLENZ';
  readonly touchesPinnedFile: boolean;
  readonly mechanism: string;
  readonly rejectedAlternatives: readonly string[];
}

/**
 * The smallest change that makes the boundary explicit. TWO fields, at two different layers, for
 * the two concepts that have no first-class carrier. Nothing else moves.
 *
 * NAMES ARE PLACEHOLDERS. The authorization does not authorize field names and this module does not
 * claim any. They exist so the fixtures below can be written and executed.
 */
export const RECOMMENDED_CHANGES: readonly SchemaChangeProposal[] = [
  {
    id: 'C1_ACTION_WHILE_UNRESOLVED',
    gap: 'OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED',
    layer: 'FIRST_PASS_DECLARATION',
    shape: 'one REQUIRED string on the declaration item: what must happen now, given that neither '
      + 'branch is established',
    required: true,
    authoredBy: 'MODEL',
    touchesPinnedFile: false,
    mechanism: 'the declaration item schema is built by unresolvedFactDeclarationItemSchema in '
      + 'scripts/lib/expert-first-pass-instruction-vnext.ts, which is a development-side builder '
      + 'and is not among the §187 pins. Required rather than optional because every entry in the '
      + 'collection is unresolved, so there is no entry for which the field is vacuous -- and an '
      + 'optional field would be omitted exactly on the entries under pressure.',
    rejectedAlternatives: [
      'a third truth branch -- would break the two-branch model the authorization protects',
      'widening branchB to admit the unresolved world -- this IS the defect',
      'folding it into whyNecessaryNow -- that field answers why the fact must be settled now, not '
        + 'what is done meanwhile, and overloading it is the semantic overloading forbidden here',
      'folding it into notEstablishedBecause -- backward-looking by definition; §196 forbids '
        + 'composing anything into it',
    ],
  },
  {
    id: 'C2_ESTABLISHED_BRANCH_AT_SETTLEMENT',
    gap: 'ESTABLISHED_TRUTH_OUTCOME_AT_SETTLEMENT',
    layer: 'OWED_FACT_RUNTIME',
    shape: "an additive successor carrying establishedBranch: 'A' | 'B' | null on the settlement "
      + 'record, non-null exactly when the decision approves settlement',
    required: false,
    authoredBy: 'HUMAN_REVIEWER',
    touchesPinnedFile: false,
    mechanism: 'owed-fact.types.ts is sha256-pinned by §187 and re-asserted by the verify-188..199 '
      + 'source-integrity scripts, so the O5 additive-successor discipline applies: a separate '
      + 'module widens the type and the pinned file is not edited. The value is authored by the '
      + 'human reviewer who already mints the SettlementAuthority, so no provider gains settlement '
      + 'authority and no deterministic code decides which branch the evidence established.',
    rejectedAlternatives: [
      'a new OWED_FACT_STATUSES member such as SETTLED_SATISFACTORY -- would need a transition '
        + 'authority that does not exist, and would break WHY_UNRESOLVED_STATUS_INVARIANT, which is '
        + 'a `satisfies Readonly<Record<OwedFactStatus, ...>>` and stops compiling on a new member',
      'reading the branch out of OwedFactTransition.justification -- parsing model or reviewer '
        + 'prose for a safety outcome is the semantic matcher the architecture forbids',
    ],
  },
];

/** What §210I explicitly does NOT establish. Stated so no reader infers more than was shown. */
export const WHAT_THIS_DOES_NOT_ESTABLISH: readonly string[] = [
  'that the representational gap CAUSED §210H G1. G2 met the same shape with the same fields and '
    + 'did not collapse, which falsifies any claim that the schema made correctness impossible.',
  'that closing the gap would move R4. That is a behavioural question and no provider was called.',
  'that the proposed representation DETECTS the G1 defect. It does not, and it is not built to: a '
    + 'declaration whose property is evidence-shaped would still be structurally valid under it, '
    + 'exactly as it was under the current contract.',
  'anything about the verifier, about G6, or about S6. No verifier call was made and S6 remains '
    + 'NOT_EXERCISED.',
  'anything general from three cases, or from any single case.',
];

/** Gate 12 is preserved and reclassified, exactly as the authorization directs. */
export const GATE_12_DISPOSITION = {
  action: 'PRESERVED_UNCHANGED',
  classification: 'USEFUL_BUT_INSUFFICIENT_FOR_LATENT_STATE_EVIDENCE_SEPARATION_CASES',
  evidence: '§210H: GATE 12 held on G2 and on G3, and both §210G narrowings survived. It failed on '
    + 'G1 only. It is an ALIGNMENT gate -- it asks whether the fields agree with each other -- and '
    + 'G1\'s fields did agree with each other, around the wrong anchor.',
  gate13Added: false,
  gate13Reason: 'the architecture review did NOT prove that no representational change is needed, '
    + 'so the authorization\'s precondition for adding Gate 13 is not met',
} as const;

// ================================================================ 4. the prototype types

/** The eleven fields the declaration carries today, unchanged. */
export interface CurrentDeclarationFields {
  readonly declarationId: string;
  readonly missingFact: string;
  readonly observationSourceId: string;
  readonly observationSpan: string;
  readonly notEstablishedBecause: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly branchA: string;
  readonly decisionIfA: string;
  readonly branchB: string;
  readonly decisionIfB: string;
  readonly whyNecessaryNow: string;
}

/**
 * The proposal, as a type. Exactly one added field, and it makes no truth claim.
 *
 * PLACEHOLDER NAME. See `RECOMMENDED_CHANGES`.
 */
export interface ProposedDeclaration extends CurrentDeclarationFields {
  /**
   * What must happen NOW, given that neither branch is established. Not conditioned on either
   * branch being true, and never a statement that either branch IS true.
   */
  readonly actionWhileUnresolved: string;
}

export const PROPOSED_DECLARATION_ADDED_FIELDS = ['actionWhileUnresolved'] as const;

export type EstablishedBranch = 'A' | 'B';

/**
 * The settlement outcome, as a type. Carried on an additive successor; `owed-fact.types.ts` is not
 * edited.
 */
export interface SettlementOutcome {
  readonly factKey: string;
  readonly status: OwedFactStatus;
  /** Non-null exactly when the fact reached a settled status. Null while unresolved. */
  readonly establishedBranch: EstablishedBranch | null;
  /** Authored by the human reviewer who minted the authority. Never by a provider, never derived. */
  readonly authoredBy: 'HUMAN_REVIEWER' | 'NOT_YET_SETTLED';
}

/**
 * The verifier-facing shape under the proposal: the property, both truth conditions, whether the
 * truth is established, what evidence remains necessary, and the action meanwhile -- each in its
 * own slot, each copied, none reconstructed.
 */
export interface ProposedVerifierView {
  readonly factKey: string;
  /** From declaration.missingFact, byte-exact. Null where no declaration authored one. */
  readonly owedProperty: string | null;
  readonly truthBranchA: string;
  readonly truthBranchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  readonly truthEstablished: boolean;
  readonly establishedBranch: EstablishedBranch | null;
  /** From declaration.notEstablishedBecause. Null once the fact is settled. */
  readonly verificationGap: string | null;
  readonly actionWhileUnresolved: string;
  /** The clarification that could settle it, where one is bound. Null is legal. */
  readonly settlingClarification: string | null;
}

// ================================================================ 5. copy-or-refuse projection

export const PROJECTION_CODES = [
  'ACTION_WHILE_UNRESOLVED_ABSENT',
  'ACTION_WHILE_UNRESOLVED_BLANK',
  'ACTION_WHILE_UNRESOLVED_IS_FILLER',
  'ESTABLISHED_BRANCH_ON_AN_UNRESOLVED_FACT',
  'SETTLED_WITHOUT_AN_ESTABLISHED_BRANCH',
  'ESTABLISHED_BRANCH_NOT_A_MEMBER',
  'VERIFICATION_GAP_ON_A_SETTLED_FACT',
] as const;
export type ProjectionCode = (typeof PROJECTION_CODES)[number];

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * Validate the one added declaration field. Presence, non-blankness, and the EXISTING closed filler
 * set. Nothing here reads the field for meaning.
 */
export function checkActionWhileUnresolved(d: Partial<ProposedDeclaration>): ProjectionCode[] {
  const codes: ProjectionCode[] = [];
  const v = d.actionWhileUnresolved;
  if (v === undefined) return ['ACTION_WHILE_UNRESOLVED_ABSENT'];
  if (blank(v)) codes.push('ACTION_WHILE_UNRESOLVED_BLANK');
  else if (isNonSemanticFiller(v)) codes.push('ACTION_WHILE_UNRESOLVED_IS_FILLER');
  return codes;
}

/**
 * Validate the settlement outcome against the status it accompanies. Closed-set membership and a
 * stated pairing rule. It never decides which branch the evidence established.
 */
export function checkSettlementOutcome(o: SettlementOutcome): ProjectionCode[] {
  const codes: ProjectionCode[] = [];
  const settled = o.status === 'SETTLED_BY_EVIDENCE';
  if (o.establishedBranch !== null && o.establishedBranch !== 'A' && o.establishedBranch !== 'B') {
    codes.push('ESTABLISHED_BRANCH_NOT_A_MEMBER');
  }
  if (o.status === 'UNRESOLVED' && o.establishedBranch !== null) {
    codes.push('ESTABLISHED_BRANCH_ON_AN_UNRESOLVED_FACT');
  }
  if (settled && o.establishedBranch === null) codes.push('SETTLED_WITHOUT_AN_ESTABLISHED_BRANCH');
  return codes;
}

/**
 * Build the verifier view. EVERY semantic string is COPIED. Nothing is composed, summarised,
 * normalised or inferred, and an absent property yields null rather than a stand-in.
 */
export function buildVerifierView(args: {
  factKey: string;
  declaration: ProposedDeclaration;
  outcome: SettlementOutcome;
  settlingClarification: string | null;
}): ProposedVerifierView {
  const settled = args.outcome.establishedBranch !== null;
  return {
    factKey: args.factKey,
    owedProperty: blank(args.declaration.missingFact) ? null : args.declaration.missingFact,
    truthBranchA: args.declaration.branchA,
    truthBranchB: args.declaration.branchB,
    decisionIfA: args.declaration.decisionIfA,
    decisionIfB: args.declaration.decisionIfB,
    truthEstablished: settled,
    establishedBranch: args.outcome.establishedBranch,
    verificationGap: settled ? null : args.declaration.notEstablishedBecause,
    actionWhileUnresolved: args.declaration.actionWhileUnresolved,
    settlingClarification: args.settlingClarification,
  };
}

// ================================================================ 6. the fixtures

export const FIXTURE_IDS = [
  'F1_SAFE_STATE_SUFFICIENT_EVIDENCE',
  'F2_ADVERSE_STATE_SUFFICIENT_EVIDENCE',
  'F3_POTENTIALLY_SATISFACTORY_INSUFFICIENT_EVIDENCE',
  'F4_TEST_RESULT_AS_EVIDENCE',
  'F5_REQUIRED_ACT_AS_PROPERTY',
  'F6_EVIDENCE_CONTRADICTS_ASSUMED_STATE',
  'F7_MULTIPLE_INDEPENDENT_PROPERTIES',
  'F8_VERIFIER_FACING_PROJECTION',
] as const;
export type FixtureId = (typeof FIXTURE_IDS)[number];

export interface EpistemicFixture {
  readonly id: FixtureId;
  readonly title: string;
  /** What this fixture must be able to say, in the authorization's own terms. */
  readonly mustExpress: string;
  readonly declarations: readonly ProposedDeclaration[];
  readonly outcomes: readonly SettlementOutcome[];
  readonly settlingClarifications: readonly (string | null)[];
  /**
   * The claim the representation must NOT be forced to make. Checked structurally: the fixture
   * asserts no branch was established while the fact is unresolved.
   */
  readonly mustNotAssert: string | null;
}

const decl = (d: ProposedDeclaration): ProposedDeclaration => d;

/**
 * The fixture set. Every string is authored HERE, as design material. None is model output, none is
 * a §210H observation, and nothing below is compared against any hosted result.
 */
export const EPISTEMIC_FIXTURES: readonly EpistemicFixture[] = [
  // ---------------------------------------------------------------- F1
  {
    id: 'F1_SAFE_STATE_SUFFICIENT_EVIDENCE',
    title: 'property satisfactory, verification sufficient, positive consequence permitted',
    mustExpress: 'a settled fact whose established branch is the satisfactory one, distinguishable '
      + 'from a settled fact whose established branch is the adverse one',
    declarations: [decl({
      declarationId: 'F1-D1',
      missingFact: 'whether the anchor bolts securing the press frame to the floor are tight to the '
        + 'specified torque',
      observationSourceId: 'OBS-F1',
      observationSpan: 'the frame rocks slightly when the ram returns',
      notEstablishedBecause: 'the text records movement at the frame and says nothing about the '
        + 'condition of the bolts themselves',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the anchor bolts are tight to the specified torque and the frame is secured to the '
        + 'floor',
      decisionIfA: 'pressing may continue as observed',
      branchB: 'one or more anchor bolts are slack or missing, so the frame is not secured',
      decisionIfB: 'stop pressing and re-anchor the frame before further use',
      whyNecessaryNow: 'the press is in production and the operator is loading the next blank',
      actionWhileUnresolved: 'keep the press out of the cycle until the anchor condition is '
        + 'established',
    })],
    outcomes: [{
      factKey: 'F1', status: 'SETTLED_BY_EVIDENCE', establishedBranch: 'A',
      authoredBy: 'HUMAN_REVIEWER',
    }],
    settlingClarifications: ['What torque reading was obtained on each anchor bolt?'],
    mustNotAssert: null,
  },
  // ---------------------------------------------------------------- F2
  {
    id: 'F2_ADVERSE_STATE_SUFFICIENT_EVIDENCE',
    title: 'property adverse, verification sufficient, adverse consequence',
    mustExpress: 'the same settled status as F1 carrying the OPPOSITE established branch, so the '
      + 'two are distinguishable at the type level rather than only in prose',
    declarations: [decl({
      declarationId: 'F2-D1',
      missingFact: 'whether the anchor bolts securing the press frame to the floor are tight to the '
        + 'specified torque',
      observationSourceId: 'OBS-F2',
      observationSpan: 'the frame rocks slightly when the ram returns',
      notEstablishedBecause: 'the text records movement at the frame and says nothing about the '
        + 'condition of the bolts themselves',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the anchor bolts are tight to the specified torque and the frame is secured to the '
        + 'floor',
      decisionIfA: 'pressing may continue as observed',
      branchB: 'one or more anchor bolts are slack or missing, so the frame is not secured',
      decisionIfB: 'stop pressing and re-anchor the frame before further use',
      whyNecessaryNow: 'the press is in production and the operator is loading the next blank',
      actionWhileUnresolved: 'keep the press out of the cycle until the anchor condition is '
        + 'established',
    })],
    outcomes: [{
      factKey: 'F2', status: 'SETTLED_BY_EVIDENCE', establishedBranch: 'B',
      authoredBy: 'HUMAN_REVIEWER',
    }],
    settlingClarifications: ['What torque reading was obtained on each anchor bolt?'],
    mustNotAssert: null,
  },
  // ---------------------------------------------------------------- F3
  {
    id: 'F3_POTENTIALLY_SATISFACTORY_INSUFFICIENT_EVIDENCE',
    title: 'the state may well be satisfactory; the evidence cannot establish it; the work holds',
    mustExpress: 'INSUFFICIENT EVIDENCE without asserting the adverse property. The world in which '
      + 'the ties are sound and the test sheet was never found must belong to branchA, and the hold '
      + 'must be carried by a field that makes no truth claim.',
    declarations: [decl({
      declarationId: 'F3-D1',
      missingFact: 'whether the scaffold ties are anchored in sound blockwork behind the render, so '
        + 'that the scaffold is restrained against the gable',
      observationSourceId: 'OBS-F3',
      observationSpan: 'the render goes over the original blockwork at a depth nobody on site could '
        + 'give',
      notEstablishedBecause: 'the text establishes that the render depth is unknown to everyone '
        + 'present; it says nothing about what the tie fixings are actually anchored into',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the ties are anchored in sound blockwork behind the render and are holding the '
        + 'scaffold against the gable',
      decisionIfA: 'the roofing gang may go up and work off the scaffold',
      branchB: 'one or more ties are fixed only into render, or into blockwork too weak to hold, so '
        + 'the scaffold is not restrained against the gable',
      decisionIfB: 'keep the gang off the scaffold until the ties are made good into sound material',
      whyNecessaryNow: 'the roofing gang are at the foot of the ladder with their tools',
      actionWhileUnresolved: 'keep the gang off the scaffold until what the ties are anchored into '
        + 'is established',
    })],
    outcomes: [{ factKey: 'F3', status: 'UNRESOLVED', establishedBranch: null,
      authoredBy: 'NOT_YET_SETTLED' }],
    settlingClarifications: ['What did a pull test on the ties as fixed read against the load the '
      + 'tie pattern requires, or what are the fixings anchored into behind the render?'],
    mustNotAssert: 'the ties lack sufficient holding capacity',
  },
  // ---------------------------------------------------------------- F4
  {
    id: 'F4_TEST_RESULT_AS_EVIDENCE',
    title: 'the physical state is the property; a measurement settles it',
    mustExpress: 'a test named as the SETTLING EVIDENCE while the property stays the physical '
      + 'state, so that a satisfactory-but-unmeasured world still belongs to branchA',
    declarations: [decl({
      declarationId: 'F4-D1',
      missingFact: 'whether the atmosphere in the vessel is within the breathable range at the '
        + 'working depth',
      observationSourceId: 'OBS-F4',
      observationSpan: 'the vessel was purged overnight and the lid has been off since first thing',
      notEstablishedBecause: 'the text records a purge and an open lid; it does not state what the '
        + 'atmosphere at the working depth actually is now',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the atmosphere at the working depth is within the breathable range',
      decisionIfA: 'entry may proceed under the stated controls',
      branchB: 'the atmosphere at the working depth is outside the breathable range',
      decisionIfB: 'no entry; ventilate and re-establish the atmosphere before anyone goes in',
      whyNecessaryNow: 'the entrant is at the manway with the harness on',
      actionWhileUnresolved: 'nobody enters while the atmosphere at depth is unestablished',
    })],
    outcomes: [{ factKey: 'F4', status: 'UNRESOLVED', establishedBranch: null,
      authoredBy: 'NOT_YET_SETTLED' }],
    settlingClarifications: ['What did the gas meter read at the working depth, and when was it '
      + 'taken?'],
    mustNotAssert: 'the atmosphere is outside the breathable range',
  },
  // ---------------------------------------------------------------- F5
  {
    id: 'F5_REQUIRED_ACT_AS_PROPERTY',
    title: 'whether the act occurred IS the property',
    mustExpress: 'an act-shaped property with act-shaped branches, surviving unchanged. The '
      + 'representation must not push this toward a physical state.',
    declarations: [decl({
      declarationId: 'F5-D1',
      missingFact: 'whether the second crane has been booked off the runway and its driver told in '
        + 'person before the walkway is used',
      observationSourceId: 'OBS-F5',
      observationSpan: 'he thinks it was arranged at the start of the shift but would not put it '
        + 'higher than that',
      notEstablishedBecause: 'the fitter\'s own account is explicitly non-authoritative and the '
        + 'person who performs the step is unreachable',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the second crane was booked off the runway and its driver was told in person',
      decisionIfA: 'the fitter may go onto the walkway',
      branchB: 'the second crane was not booked off, or its driver was not told, so it remains free '
        + 'to travel the shared runway',
      decisionIfB: 'the fitter does not go onto the walkway until the crane is booked off and the '
        + 'driver told',
      whyNecessaryNow: 'the fitter is at the foot of the ladder about to climb',
      actionWhileUnresolved: 'the fitter stays off the walkway until the booking-off is established',
    })],
    outcomes: [{ factKey: 'F5', status: 'UNRESOLVED', establishedBranch: null,
      authoredBy: 'NOT_YET_SETTLED' }],
    settlingClarifications: ['Was the second crane booked off the runway for this job, and was its '
      + 'driver told in person?'],
    mustNotAssert: 'the second crane was not booked off',
  },
  // ---------------------------------------------------------------- F6
  {
    id: 'F6_EVIDENCE_CONTRADICTS_ASSUMED_STATE',
    title: 'evidence arrives and establishes the ADVERSE branch',
    mustExpress: 'that evidence PRESENCE is not satisfactory truth. The settled fact here carries '
      + 'branch B, and it is the same status value F1 carries with branch A.',
    declarations: [decl({
      declarationId: 'F6-D1',
      missingFact: 'whether the residual current device on the site board trips within its rated '
        + 'time',
      observationSourceId: 'OBS-F6',
      observationSpan: 'the board carries a device with a test button and a label from last year',
      notEstablishedBecause: 'the text records the presence of a device and a label; it does not '
        + 'state how the device performs when tested',
      affectedDecision: 'REQUIRED_CONTROL',
      branchA: 'the device trips within its rated time',
      decisionIfA: 'the board may stay in service',
      branchB: 'the device does not trip within its rated time',
      decisionIfB: 'take the board out of service and replace the device before further use',
      whyNecessaryNow: 'hand tools are being run off this board now',
      actionWhileUnresolved: 'do not add further loads to this board until its trip performance is '
        + 'established',
    })],
    outcomes: [{
      factKey: 'F6', status: 'SETTLED_BY_EVIDENCE', establishedBranch: 'B',
      authoredBy: 'HUMAN_REVIEWER',
    }],
    settlingClarifications: ['What trip time was measured on the device?'],
    mustNotAssert: null,
  },
  // ---------------------------------------------------------------- F7
  {
    id: 'F7_MULTIPLE_INDEPENDENT_PROPERTIES',
    title: 'two properties, two verification states, no cross-binding',
    mustExpress: 'each property carrying its own verification state independently, with one settled '
      + 'and one unresolved on the same analysis',
    declarations: [
      decl({
        declarationId: 'F7-D1',
        missingFact: 'whether the guard interlock on the mixer lid stops the paddle when the lid is '
          + 'raised',
        observationSourceId: 'OBS-F7',
        observationSpan: 'the lid is fitted with an interlock switch',
        notEstablishedBecause: 'the text records that a switch is fitted and says nothing about '
          + 'whether it stops the paddle',
        affectedDecision: 'REQUIRED_CONTROL',
        branchA: 'raising the lid stops the paddle',
        decisionIfA: 'mixing may continue as observed',
        branchB: 'raising the lid does not stop the paddle',
        decisionIfB: 'stop mixing and repair the interlock before further use',
        whyNecessaryNow: 'the operator is charging the mixer by hand between batches',
        actionWhileUnresolved: 'the lid stays down while the paddle turns, until the interlock '
          + 'behaviour is established',
      }),
      decl({
        declarationId: 'F7-D2',
        missingFact: 'whether the extraction at the weigh station captures dust at the operator\'s '
          + 'breathing zone',
        observationSourceId: 'OBS-F7',
        observationSpan: 'a hood is mounted above the weigh station',
        notEstablishedBecause: 'the text records the presence of a hood and says nothing about what '
          + 'it captures',
        affectedDecision: 'EXPOSURE',
        branchA: 'the extraction captures dust at the breathing zone',
        decisionIfA: 'weighing may continue as observed',
        branchB: 'the extraction does not capture dust at the breathing zone',
        decisionIfB: 'stop weighing this material until capture is achieved or respiratory '
          + 'protection is in use',
        whyNecessaryNow: 'the operator is weighing out the next batch now',
        actionWhileUnresolved: 'respiratory protection is worn at the weigh station until capture '
          + 'is established',
      }),
    ],
    outcomes: [
      { factKey: 'F7-1', status: 'SETTLED_BY_EVIDENCE', establishedBranch: 'A',
        authoredBy: 'HUMAN_REVIEWER' },
      { factKey: 'F7-2', status: 'UNRESOLVED', establishedBranch: null,
        authoredBy: 'NOT_YET_SETTLED' },
    ],
    settlingClarifications: [
      'What happened to the paddle when the lid was raised on test?',
      'What did a dust measurement at the operator\'s breathing zone read during weighing?',
    ],
    mustNotAssert: 'the extraction does not capture dust at the breathing zone',
  },
  // ---------------------------------------------------------------- F8
  {
    id: 'F8_VERIFIER_FACING_PROJECTION',
    title: 'the property and the gap both survive to the verifier without reconstruction',
    mustExpress: 'the exact owed property and the exact verification gap reaching the verifier as '
      + 'their own fields, byte-identical to what the model authored',
    declarations: [decl({
      declarationId: 'F8-D1',
      missingFact: 'whether the trench sides are supported to full depth where the crew are working',
      observationSourceId: 'OBS-F8',
      observationSpan: 'boxes are stacked at the near end of the trench',
      notEstablishedBecause: 'the text records boxes present at one end and does not state what '
        + 'support is in place where the crew are working',
      affectedDecision: 'HAZARD_EXISTENCE',
      branchA: 'the sides are supported to full depth where the crew are working',
      decisionIfA: 'work in the trench may continue',
      branchB: 'the sides are unsupported, or supported only to part depth, where the crew are '
        + 'working',
      decisionIfB: 'get the crew out and support the sides to full depth before work resumes',
      whyNecessaryNow: 'the crew are in the trench now',
      actionWhileUnresolved: 'the crew come out of the trench until the support at the working '
        + 'position is established',
    })],
    outcomes: [{ factKey: 'F8', status: 'UNRESOLVED', establishedBranch: null,
      authoredBy: 'NOT_YET_SETTLED' }],
    settlingClarifications: ['What support is in place at the position where the crew are working, '
      + 'and to what depth?'],
    mustNotAssert: 'the trench sides are unsupported',
  },
];

// ================================================================ 7. structural checks

export interface FixtureFinding {
  readonly fixtureId: FixtureId;
  readonly check: string;
  readonly held: boolean;
  readonly detail: string;
}

/**
 * Run the structural checks one fixture owes. These establish EXPRESSIVENESS -- that the proposed
 * representation can say the thing -- and nothing about model behaviour.
 */
export function checkFixture(f: EpistemicFixture): FixtureFinding[] {
  const out: FixtureFinding[] = [];
  const add = (check: string, held: boolean, detail: string): void => {
    out.push({ fixtureId: f.id, check, held, detail });
  };

  add('DECLARATION_AND_OUTCOME_COUNTS_AGREE',
    f.declarations.length === f.outcomes.length
      && f.declarations.length === f.settlingClarifications.length,
    `${f.declarations.length} declarations, ${f.outcomes.length} outcomes`);

  f.declarations.forEach((d, i) => {
    const outcome = f.outcomes[i];
    add(`D${i + 1}_ACTION_WHILE_UNRESOLVED_VALID`,
      checkActionWhileUnresolved(d).length === 0,
      'present, non-blank, not a member of the closed filler set');
    add(`D${i + 1}_SETTLEMENT_OUTCOME_VALID`,
      checkSettlementOutcome(outcome).length === 0,
      `status ${outcome.status}, establishedBranch ${String(outcome.establishedBranch)}`);
    add(`D${i + 1}_BRANCHES_ARE_TWO`,
      d.branchA.trim() !== '' && d.branchB.trim() !== '' && d.branchA.trim() !== d.branchB.trim(),
      'branchA and branchB are both present and differ');
    add(`D${i + 1}_DECISIONS_DIVERGE`,
      d.decisionIfA.trim() !== d.decisionIfB.trim(),
      'decisionIfA and decisionIfB differ, as the existing contract already requires');
    add(`D${i + 1}_UNRESOLVED_ACTION_IS_NOT_A_TRUTH_BRANCH`,
      d.actionWhileUnresolved.trim() !== d.branchA.trim()
        && d.actionWhileUnresolved.trim() !== d.branchB.trim(),
      'the added field carries an action, never a truth claim');

    const view = buildVerifierView({
      factKey: outcome.factKey, declaration: d, outcome,
      settlingClarification: f.settlingClarifications[i],
    });
    add(`D${i + 1}_PROPERTY_SURVIVES_BYTE_EXACT`,
      view.owedProperty === d.missingFact,
      'the verifier view carries declaration.missingFact byte for byte');
    add(`D${i + 1}_GAP_SURVIVES_OR_IS_NULLED_ON_SETTLEMENT`,
      view.truthEstablished
        ? view.verificationGap === null
        : view.verificationGap === d.notEstablishedBecause,
      view.truthEstablished
        ? 'settled: the gap is null rather than a false sentence, matching '
          + 'WHY_UNRESOLVED_STATUS_INVARIANT'
        : 'unresolved: the gap is the authored sentence, byte for byte');
    add(`D${i + 1}_ACTION_SURVIVES_BYTE_EXACT`,
      view.actionWhileUnresolved === d.actionWhileUnresolved,
      'copied, never composed');
    add(`D${i + 1}_TRUTH_AND_VERIFICATION_ARE_SEPARATE_SLOTS`,
      view.truthEstablished === (view.establishedBranch !== null),
      'establishment is a slot of its own and is not read off either branch string');

    if (outcome.status === 'UNRESOLVED') {
      add(`D${i + 1}_NEITHER_BRANCH_IS_ASSERTED_WHILE_UNRESOLVED`,
        view.establishedBranch === null && view.truthEstablished === false,
        'insufficient evidence is represented without asserting the adverse branch');
    }
  });

  return out;
}

/** F1 against F2, and F1 against F6: the discriminations the current status enum cannot make. */
export function settledBranchDiscrimination(): {
  sameStatus: boolean; differentBranch: boolean; distinguishableToday: boolean;
} {
  const f1 = EPISTEMIC_FIXTURES.find(f => f.id === 'F1_SAFE_STATE_SUFFICIENT_EVIDENCE')!.outcomes[0];
  const f2 = EPISTEMIC_FIXTURES
    .find(f => f.id === 'F2_ADVERSE_STATE_SUFFICIENT_EVIDENCE')!.outcomes[0];
  return {
    sameStatus: f1.status === f2.status,
    differentBranch: f1.establishedBranch !== f2.establishedBranch,
    // Today OwedFact carries status and nothing else about the outcome, so these two facts are the
    // same value. That is the second gap, demonstrated rather than asserted.
    distinguishableToday: false,
  };
}

/** The cross-product the core invariant requires be representable. */
export function truthByVerificationMatrix(): ReadonlyArray<{
  truth: 'A' | 'B' | 'UNRESOLVED'; verification: 'SUFFICIENT' | 'INSUFFICIENT';
  representable: boolean; fixture: FixtureId | null;
}> {
  return [
    { truth: 'A', verification: 'SUFFICIENT', representable: true,
      fixture: 'F1_SAFE_STATE_SUFFICIENT_EVIDENCE' },
    { truth: 'B', verification: 'SUFFICIENT', representable: true,
      fixture: 'F2_ADVERSE_STATE_SUFFICIENT_EVIDENCE' },
    { truth: 'UNRESOLVED', verification: 'INSUFFICIENT', representable: true,
      fixture: 'F3_POTENTIALLY_SATISFACTORY_INSUFFICIENT_EVIDENCE' },
    // The remaining two cells are deliberately absent rather than filled. A truth known while the
    // evidence is insufficient is a contradiction in this architecture -- HazLenz knows a property
    // only through admissible evidence -- and inventing a fixture for it would be inventing a state.
    { truth: 'A', verification: 'INSUFFICIENT', representable: false, fixture: null },
    { truth: 'B', verification: 'INSUFFICIENT', representable: false, fixture: null },
  ];
}

/** Statuses this prototype touches. Recorded so a suite can prove the enum was not widened. */
export const STATUS_ENUM_UNCHANGED = {
  members: [...OWED_FACT_STATUSES],
  count: OWED_FACT_STATUSES.length,
  addedHere: [] as readonly string[],
} as const;

export type { OwedFactPriority };
