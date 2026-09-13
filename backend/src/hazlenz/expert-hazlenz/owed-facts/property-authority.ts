/**
 * EXPERT HAZLENZ -- KR-1 HUMAN PROPERTY-AUTHORITY BOUNDARY. §220.
 * INTEGRATED AND INACTIVE. NO PROVIDER CALL, NO DATABASE ACCESS, NO CUSTOMER ROUTE.
 *
 * ==================== WHY THIS EXISTS, AND WHAT §219 ACTUALLY SHOWED ====================
 *
 * §219 A1 supplied a property that was EVIDENCE for a latent physical condition -- whether a weekly
 * loaded brake run had been carried out, standing in for whether the truck's brakes will hold on the
 * gradient. The verifier declared it `REQUIRED_ACT_ITSELF` and `VALID`. §218's consistency layer
 * admitted the output, correctly, because the model's own structured fields did not contradict each
 * other. §219 A3 supplied a genuine required act -- a ward notification -- and the verifier declared
 * it `REQUIRED_ACT_ITSELF` and `VALID` too.
 *
 * THE TWO STRUCTURED SIGNATURES ARE IDENTICAL. `sameStructuredSignature219()` proves it from the
 * persisted evidence rather than asserting it. No deterministic rule reading verifier output can
 * separate the mistake from the right answer, and this module does not pretend otherwise. It
 * contains NO classifier, NO keyword list, NO vocabulary test and NO semantic inference of any kind.
 *
 * ==================== SO THE BOUNDARY IS NOT WHERE THE MISTAKE IS ====================
 *
 * It is where the mistake would become HARMFUL. A wrong property sitting in an UNRESOLVED fact
 * harms nobody: the hold stands, `decisionDivergence` stands, nothing is released. The harm is the
 * moment that fact is SETTLED -- because then the answer to the wrong question retires the right
 * one, and work is released on a proxy.
 *
 * So §220 adds ONE prerequisite at ONE transition:
 *
 *      PROPERTY AUTHORITY   before   FACT SETTLEMENT AUTHORITY
 *
 * and scopes it by PROVENANCE, which is a property of where the fact came from and never of what it
 * says. A property identity that rests on provider analysis alone requires a human to confirm it
 * before that fact may be settled. A property identity already established by authoritative supplied
 * context -- a deterministic rule, a governed record, or a human -- requires nothing new.
 *
 * `OwedFact.modelAuthored` already carries exactly that distinction, is already derived from
 * `source` by rule, and is already invariant-checked in `owedFactDefects`. §220 reads it and adds no
 * new provenance concept.
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT DO ====================
 *
 * It does not gate analysis. It does not gate the clarification binding that produces `COVERED`. It
 * does not block a property for containing act, document, test or record vocabulary -- it cannot,
 * because it never reads the property text at all. It does not decide whether the property is
 * right; that is the reviewer's judgement and the whole point.
 *
 * And confirming a property is NOT settling a fact. `impliesFactSettled` is the literal `false`.
 */

import { createHash } from 'crypto';

import type { OwedFact } from './owed-fact.types';
// §247. The normalized review model, so property review and evidence review share one assembled
// context instead of duplicating semantic state on two surfaces.
import {
  buildDecisionReviewContext, projectPropertyResidual, projectRemainingOpenAfterReview,
  type EstablishedContextSpan, type SiblingOpenFact, type PropertyDisagreement,
  type ResidualAfterDecision,
} from './decision-review-model';

export const PROPERTY_AUTHORITY_CONTRACT_VERSION =
  'hazlenz.expert.kr1-property-authority.v1' as const;

/** Recorded in code so the finding travels with the mechanism that depends on it. */
export const KR1_STATUS = 'OPEN — HUMAN-GATED V1.0 LIMITATION' as const;
export const KR1_PROVIDER_CAPABILITY_REMEDIATED = false as const;
export const AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED = false as const;

/** The invariant this module exists to make structurally true. */
export const PROVIDER_PROPERTY_AUTHORITY = 'NEVER' as const;

// ---------------------------------------------------------------- the scoping decision

/**
 * Every explicit structured signal the §220 authorization named as a candidate trigger, with the
 * measured reason each was or was not used. Held as data so the scoping argument is auditable and
 * so a later edit that quietly adopts a semantic trigger contradicts a published constant.
 */
export const TRIGGER_SOURCES_EVALUATED_220: readonly {
  readonly signal: string;
  readonly usedAsTrigger: boolean;
  readonly reason: string;
}[] = [
  {
    signal: 'propertyReview.propertySemanticRole',
    usedAsTrigger: false,
    reason: '§219 A1 (the mistake) and A3 (the right answer) both returned REQUIRED_ACT_ITSELF. The '
      + 'field does not separate them, and reading it as a risk signal would gate every legitimate '
      + 'required act while still missing a mistake declared UNDERLYING_SAFETY_STATE.',
  },
  {
    signal: 'propertyReview.propertyValidity',
    usedAsTrigger: false,
    reason: 'A1 and A3 both returned VALID. Same reason.',
  },
  {
    signal: 'verifier challenge / concern structures',
    usedAsTrigger: false,
    reason: 'A1 emitted none. A challenge indicates the verifier NOTICED a property problem, so it '
      + 'marks the cases already handled and is silent on the ones that matter.',
  },
  {
    signal: 'verifier ABSTAIN and deterministic refusal states',
    usedAsTrigger: false,
    reason: 'these are already fail-closed and already keep the fact unresolved. §219 A2 is the '
      + 'worked example: the §218 layer refused the whole output, so nothing reached the ledger and '
      + 'no new gate was needed. Adding one here would duplicate an existing containment.',
  },
  {
    signal: 'the property text itself',
    usedAsTrigger: false,
    reason: 'FORBIDDEN. Deciding from words like test, certificate, inspection, measurement or '
      + 'record is the keyword classifier this architecture has refused since §160, and it is '
      + 'exactly what the §220 authorization prohibits.',
  },
  {
    signal: 'OwedFact.source / OwedFact.modelAuthored',
    usedAsTrigger: true,
    reason: 'PROVENANCE, not semantics. It answers "was this property identity established by '
      + 'authoritative supplied context, or by provider analysis alone" -- which is the exact '
      + 'condition the containment boundary is written against. It is already derived by rule, '
      + 'already invariant-checked, and reading it involves no judgement about what the property '
      + 'means.',
  },
  {
    signal: 'the transition being attempted',
    usedAsTrigger: true,
    reason: 'the boundary applies at SETTLEMENT and nowhere else, because settlement is the only '
      + 'place a wrong property retires a right question. Analysis, clarification binding and the '
      + 'COVERED transition are untouched.',
  },
];

/**
 * The limitation, stated plainly rather than engineered around. Asserted by the §220 suite against
 * the persisted §219 evidence.
 */
export const SCOPING_LIMITATION_220 = {
  canDeterministicallyIdentifyKr1RiskyFacts: false,
  why: '§219 A1 and A3 produced identical structured verifier signatures. Separating them requires '
    + 'reading what the property means, which is the boundary this architecture does not cross.',
  consequence: 'the requirement is scoped by provenance and by transition, so it applies to every '
    + 'model-authored property at settlement rather than to a semantically selected subset.',
  whatThisCosts: 'a settlement of a model-authored fact carries one additional recorded human '
    + 'confirmation. Settlement already required a human, so no analysis becomes manual and no '
    + 'property is blocked for its vocabulary.',
  whatThisDoesNotDo: 'it does not make the reviewer right. It converts an autonomous provider '
    + 'property decision into a human-authorized one, and a reviewer who confirms a wrong property '
    + 'has exercised real authority to do so. That residual is reported, not hidden.',
} as const;

// ---------------------------------------------------------------- requirement

export const PROPERTY_AUTHORITY_REQUIREMENTS = ['NOT_REQUIRED', 'REQUIRED'] as const;
export type PropertyAuthorityRequirement = (typeof PROPERTY_AUTHORITY_REQUIREMENTS)[number];

export const PROPERTY_AUTHORITY_STATES = [
  'NOT_REQUIRED',
  'REQUIRED_NOT_OBTAINED',
  'CONFIRMED',
  'CORRECTED',
  'DECLINED_KEEP_UNRESOLVED',
] as const;
export type PropertyAuthorityState = (typeof PROPERTY_AUTHORITY_STATES)[number];

/**
 * The ONLY states under which a fact may be settled.
 *
 * `CORRECTED` is deliberately absent. A reviewer who corrects the property has said the fact in
 * front of them is not the proposition that decides, so settling THAT fact would settle the wrong
 * property -- the exact outcome the boundary exists to prevent. The correction is recorded and the
 * original fact stays open.
 */
export const SETTLEMENT_PERMITTING_STATES: readonly PropertyAuthorityState[] =
  ['NOT_REQUIRED', 'CONFIRMED'];

/**
 * Whether settling this fact requires a human property confirmation first.
 *
 * Reads `modelAuthored` and NOTHING else. No field carrying free text is consulted anywhere in this
 * function, and there is no branch on any string value.
 */
export function propertyAuthorityRequirementFor(fact: OwedFact): PropertyAuthorityRequirement {
  return fact.modelAuthored ? 'REQUIRED' : 'NOT_REQUIRED';
}

export function initialPropertyAuthorityState(fact: OwedFact): PropertyAuthorityState {
  return propertyAuthorityRequirementFor(fact) === 'REQUIRED'
    ? 'REQUIRED_NOT_OBTAINED'
    : 'NOT_REQUIRED';
}

export function mayBeSettledUnderPropertyAuthority(state: PropertyAuthorityState): boolean {
  return SETTLEMENT_PERMITTING_STATES.includes(state);
}

// ---------------------------------------------------------------- the reviewer packet

/**
 * What the reviewer is shown. The minimum needed to answer one question, copied verbatim from state
 * that already exists, and never parsed, scored, summarised or compared against anything.
 *
 * The product principle is preserved: HazLenz did the analysis, found the gap, drafted the question
 * and named what it believes decides. The reviewer is not asked to reconstruct the inspection.
 */
/**
 * §247 ADDITIVE FIELDS. Four fields were added to this packet, and nothing was removed or changed.
 * Each closes a named §243 occurrence in which a reviewer could not answer the question they were
 * asked: G3 lacked the adjacent established fact that makes an assurance a proxy, C6 lacked the open
 * sibling property, and no surface stated what remains true after each available decision. Every one
 * is copying or projection over state that already exists.
 */
export interface PropertyReviewPacket {
  readonly packetId: string;
  readonly analysisId: string;
  readonly factKey: string;
  /** The observation span the fact was raised from. Verbatim. */
  readonly observationSpan: string;
  /** The property the first pass named. Verbatim. */
  readonly proposedProperty: string;
  /** Why HazLenz says it is not established. Verbatim. */
  readonly hazlenzExplanation: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  /** What is done while neither branch is established. The hold that stands regardless. */
  readonly decisionWhileUnresolved: string | null;
  /** The question already bound to this fact, where one exists. Verbatim. */
  readonly existingClarification: string | null;
  /**
   * The verifier's §218 advisory statement of what it believes actually decides, where one is
   * available. ADVISORY. It is not an owed fact, is not settled, is not compared against anything,
   * and on §219 A1 it restated the proxy -- so it is shown as help that may be wrong, never as an
   * answer.
   */
  readonly verifierDecisionControllingProperty: string | null;
  readonly verifierPropertySemanticRole: string | null;
  readonly verifierPropertyValidity: string | null;
  /** The one question the reviewer is being asked. A fixed sentence, identical on every packet. */
  readonly reviewerQuestion: string;
  readonly availableDecisions: readonly PropertyConfirmationDecision[];
  /** Digest of the exact property text the reviewer read. Binds the decision to what was shown. */
  readonly propertyDigest: string;
  readonly requirement: PropertyAuthorityRequirement;
  readonly state: PropertyAuthorityState;
  /** Stated on every packet so confirming is never mistaken for settling. */
  /**
   * §247, G3. The verbatim observation spans the first pass cited as evidence on its OWN admitted
   * candidates, excluding this fact's own span. Pure copying. Without it a reviewer judging whether
   * a property is a prohibited proxy cannot see the adjacent fact that makes it one.
   */
  readonly establishedContext: readonly EstablishedContextSpan[];
  /**
   * §247, C6. Every other open fact in this analysis, with its property and status. Pure copying.
   * Deciding this one does not dispose of those, and the packet used to be single-target by
   * construction, so that was invisible.
   */
  readonly siblingOpenFacts: readonly SiblingOpenFact[];
  /**
   * §247. The model's property, the verifier's, and whether the two strings are identical. A
   * LITERAL comparison. Deterministic code must not decide whether a difference is material; it may
   * state that a difference exists.
   */
  readonly propertyDisagreement: PropertyDisagreement | null;
  /**
   * §247. For each available decision, the deterministic state that results, projected from the
   * existing authority transition table. Nothing is granted by reading it.
   */
  readonly residualAfterEachDecision: readonly ResidualAfterDecision[];
  /** §247. Which facts are still open once this review is done, whichever way it goes. */
  readonly remainingOpenAfterReview: readonly string[];
  readonly confirmationIsNotSettlement: string;
}

export const REVIEWER_QUESTION: string =
  'Is the property below the proposition whose truth actually decides this, or is it evidence for a '
  + 'different underlying condition that could be satisfactory or adverse either way? Confirm it, '
  + 'correct it, or leave it open.';

export const CONFIRMATION_IS_NOT_SETTLEMENT: string =
  'Confirming the property says WHICH QUESTION MATTERS. It does not say the answer is satisfactory, '
  + 'does not say it is adverse, and does not settle the fact. The hold stands until the fact is '
  + 'separately settled by reviewed evidence.';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

export function propertyDigestFor(property: string): string {
  return sha(`${PROPERTY_AUTHORITY_CONTRACT_VERSION}\n${property}`);
}

export function packetIdFor(analysisId: string, factKey: string, property: string): string {
  return sha(`${PROPERTY_AUTHORITY_CONTRACT_VERSION}\n${analysisId}\n${factKey}\n${property}`);
}

/** Advisory verifier context, supplied by the caller from the §218 propertyReview if it has one. */
export interface VerifierPropertyContext {
  readonly decisionControllingProperty: string | null;
  readonly propertySemanticRole: string | null;
  readonly propertyValidity: string | null;
}

/**
 * Build the packet. Pure copying: every field is taken from the fact or from the caller's supplied
 * context, and nothing is derived from the meaning of any of it.
 */
export function buildPropertyReviewPacket(input: {
  analysisId: string;
  fact: OwedFact;
  proposedProperty: string;
  decisionWhileUnresolved: string | null;
  existingClarification: string | null;
  verifier?: VerifierPropertyContext | null;
  /** §247. Optional and additive: omitting them yields empty context, never a fabricated one. */
  establishedContext?: readonly EstablishedContextSpan[];
  siblingOpenFacts?: readonly SiblingOpenFact[];
}): PropertyReviewPacket {
  const { analysisId, fact, proposedProperty } = input;
  const v = input.verifier ?? null;
  const ctx = buildDecisionReviewContext({
    analysisId, fact, proposedProperty,
    propertyAuthorityRequirement: propertyAuthorityRequirementFor(fact),
    propertyAuthorityState: initialPropertyAuthorityState(fact),
    establishedContext: input.establishedContext,
    siblingOpenFacts: input.siblingOpenFacts,
    verifierProperty: v === null ? undefined : (v.decisionControllingProperty ?? null),
  });
  return {
    packetId: packetIdFor(analysisId, fact.factKey, proposedProperty),
    analysisId,
    factKey: fact.factKey,
    observationSpan: fact.evidenceSpan,
    proposedProperty,
    hazlenzExplanation: fact.whyUnresolved ?? '',
    branchA: fact.branchA,
    branchB: fact.branchB,
    decisionIfA: fact.decisionDivergence.ifA,
    decisionIfB: fact.decisionDivergence.ifB,
    decisionWhileUnresolved: input.decisionWhileUnresolved,
    existingClarification: input.existingClarification,
    verifierDecisionControllingProperty: v?.decisionControllingProperty ?? null,
    verifierPropertySemanticRole: v?.propertySemanticRole ?? null,
    verifierPropertyValidity: v?.propertyValidity ?? null,
    reviewerQuestion: REVIEWER_QUESTION,
    availableDecisions: PROPERTY_CONFIRMATION_DECISIONS,
    propertyDigest: propertyDigestFor(proposedProperty),
    requirement: propertyAuthorityRequirementFor(fact),
    state: initialPropertyAuthorityState(fact),
    establishedContext: ctx.establishedContext,
    siblingOpenFacts: ctx.siblingOpenFacts,
    propertyDisagreement: ctx.propertyDisagreement,
    residualAfterEachDecision:
      projectPropertyResidual(ctx, [...PROPERTY_CONFIRMATION_DECISIONS]),
    remainingOpenAfterReview: projectRemainingOpenAfterReview(ctx),
    confirmationIsNotSettlement: CONFIRMATION_IS_NOT_SETTLEMENT,
  };
}

// ---------------------------------------------------------------- the decision

/**
 * Three actions and no more. There is deliberately no degree, no confidence and no "probably":
 * a reviewer who is unsure returns KEEP_UNRESOLVED, which is the same outcome as doing nothing.
 */
export const PROPERTY_CONFIRMATION_DECISIONS = [
  'CONFIRM_PROPERTY', 'CORRECT_PROPERTY', 'KEEP_UNRESOLVED',
] as const;
export type PropertyConfirmationDecision = (typeof PROPERTY_CONFIRMATION_DECISIONS)[number];

/** The only provenance that may confirm a property. Mirrors the settlement-review boundary. */
export const PERMITTED_PROPERTY_REVIEW_PROVENANCES = ['HUMAN_REVIEW'] as const;
export const REFUSED_PROPERTY_REVIEW_PROVENANCES = [
  'PROVIDER_DECLARATION',
  'MODEL_ADJUDICATION',
  'HISTORICAL_EVALUATION_LABEL',
  'AUTOMATED_MATCHER',
  'DERIVED_HEURISTIC',
] as const;
export type PropertyReviewProvenance =
  (typeof PERMITTED_PROPERTY_REVIEW_PROVENANCES)[number]
  | (typeof REFUSED_PROPERTY_REVIEW_PROVENANCES)[number];

export interface PropertyDecisionRecord {
  readonly packetId: string;
  readonly factKey: string;
  readonly decision: PropertyConfirmationDecision;
  readonly reviewerProvenance: PropertyReviewProvenance;
  readonly reviewerId: string;
  readonly rationale: string;
  /** Digest of the exact property the reviewer was shown. */
  readonly reviewedPropertyDigest: string;
  /** Required on CORRECT_PROPERTY and forbidden otherwise. The reviewer's own words. */
  readonly correctedControllingProperty: string | null;
  readonly decidedAt: string;
}

// ---------------------------------------------------------------- the authority

/**
 * A real module-private symbol. Never exported, so a `PropertyAuthority` cannot be object-literalled
 * by a caller who skipped the review: a forged authority is an impossible value at runtime and not
 * merely a type error.
 */
const PROPERTY_AUTHORITY_BRAND: unique symbol = Symbol('hazlenz.expert.property-authority');

export interface PropertyAuthority {
  readonly [PROPERTY_AUTHORITY_BRAND]: true;
  readonly authority: 'HUMAN_CONFIRMED_PROPERTY';
  readonly factKey: string;
  readonly packetId: string;
  readonly propertyDigest: string;
  readonly outcome: 'CONFIRMED' | 'CORRECTED';
  /** On CONFIRMED, the property as shown. On CORRECTED, the reviewer's replacement. */
  readonly controllingProperty: string;
  readonly reviewerProvenance: 'HUMAN_REVIEW';
  readonly justification: string;
  readonly scope: 'SINGLE_FACT_SINGLE_PACKET_SINGLE_USE';
  /** Typed as literals so no caller can read a property confirmation as a settlement. */
  readonly impliesFactSettled: false;
  readonly impliesSatisfactorySettlement: false;
  readonly impliesAdverseSettlement: false;
  readonly impliesWorkRelease: false;
}

export const PROPERTY_AUTHORITY_REFUSAL_CODES = [
  'DECISION_MINTS_NO_AUTHORITY',
  'REVIEW_PROVENANCE_NOT_HUMAN',
  'PACKET_ID_MISMATCH',
  'FACT_KEY_MISMATCH',
  'REVIEWED_PROPERTY_DIGEST_MISMATCH',
  'RATIONALE_MISSING',
  'REVIEWER_IDENTITY_MISSING',
  'CORRECTED_PROPERTY_MISSING',
  'CORRECTED_PROPERTY_PRESENT_WITHOUT_A_CORRECTION',
] as const;
export type PropertyAuthorityRefusalCode = (typeof PROPERTY_AUTHORITY_REFUSAL_CODES)[number];

export interface PropertyAuthorityMintResult {
  readonly authority: PropertyAuthority | null;
  readonly state: PropertyAuthorityState;
  readonly refusedBecause: readonly PropertyAuthorityRefusalCode[];
}

/**
 * THE PRODUCER. The only function in the repository that constructs a `HUMAN_CONFIRMED_PROPERTY`
 * authority, and it requires a recorded human decision.
 *
 * `KEEP_UNRESOLVED` mints nothing and is not a failure -- it is the fail-closed answer and it leaves
 * the fact exactly where it was.
 */
export function mintPropertyAuthority(
  packet: PropertyReviewPacket, decision: PropertyDecisionRecord,
): PropertyAuthorityMintResult {
  const refused: PropertyAuthorityRefusalCode[] = [];

  if (decision.reviewerProvenance !== 'HUMAN_REVIEW') refused.push('REVIEW_PROVENANCE_NOT_HUMAN');
  if (decision.packetId !== packet.packetId) refused.push('PACKET_ID_MISMATCH');
  if (decision.factKey !== packet.factKey) refused.push('FACT_KEY_MISMATCH');
  if (decision.reviewedPropertyDigest !== packet.propertyDigest) {
    refused.push('REVIEWED_PROPERTY_DIGEST_MISMATCH');
  }
  if (blank(decision.rationale)) refused.push('RATIONALE_MISSING');
  if (blank(decision.reviewerId)) refused.push('REVIEWER_IDENTITY_MISSING');

  if (decision.decision === 'CORRECT_PROPERTY' && blank(decision.correctedControllingProperty)) {
    refused.push('CORRECTED_PROPERTY_MISSING');
  }
  if (decision.decision !== 'CORRECT_PROPERTY'
    && !blank(decision.correctedControllingProperty)) {
    refused.push('CORRECTED_PROPERTY_PRESENT_WITHOUT_A_CORRECTION');
  }

  if (decision.decision === 'KEEP_UNRESOLVED') {
    return {
      authority: null,
      state: refused.length > 0 ? 'REQUIRED_NOT_OBTAINED' : 'DECLINED_KEEP_UNRESOLVED',
      refusedBecause: refused.length > 0 ? refused : ['DECISION_MINTS_NO_AUTHORITY'],
    };
  }

  if (refused.length > 0) {
    return { authority: null, state: 'REQUIRED_NOT_OBTAINED', refusedBecause: refused };
  }

  const corrected = decision.decision === 'CORRECT_PROPERTY';
  return {
    authority: {
      [PROPERTY_AUTHORITY_BRAND]: true,
      authority: 'HUMAN_CONFIRMED_PROPERTY',
      factKey: packet.factKey,
      packetId: packet.packetId,
      propertyDigest: packet.propertyDigest,
      outcome: corrected ? 'CORRECTED' : 'CONFIRMED',
      controllingProperty: corrected
        ? String(decision.correctedControllingProperty)
        : packet.proposedProperty,
      reviewerProvenance: 'HUMAN_REVIEW',
      justification: `human review ${decision.reviewerId} `
        + `${corrected ? 'corrected' : 'confirmed'} the controlling property: `
        + `${decision.rationale.trim()}`,
      scope: 'SINGLE_FACT_SINGLE_PACKET_SINGLE_USE',
      impliesFactSettled: false,
      impliesSatisfactorySettlement: false,
      impliesAdverseSettlement: false,
      impliesWorkRelease: false,
    } as PropertyAuthority,
    state: corrected ? 'CORRECTED' : 'CONFIRMED',
    refusedBecause: [],
  };
}

/**
 * What a fail-closed property-authority state does and does not do. Typed as literals so a caller
 * cannot read a refusal as a finding and the suite can assert it mechanically.
 */
export function propertyAuthorityFailClosedEffect(): {
  unresolvedTruthRemainsOpen: true;
  decisionWhileUnresolvedRemainsAuthoritative: true;
  workReleaseImplied: false;
  automaticSatisfactorySettlement: false;
  automaticAdverseSettlement: false;
  canonicalFactDeleted: false;
  clarificationChanged: false;
  providerClassificationRepaired: false;
} {
  return {
    unresolvedTruthRemainsOpen: true,
    decisionWhileUnresolvedRemainsAuthoritative: true,
    workReleaseImplied: false,
    automaticSatisfactorySettlement: false,
    automaticAdverseSettlement: false,
    canonicalFactDeleted: false,
    clarificationChanged: false,
    providerClassificationRepaired: false,
  };
}

/** Recorded as literals, asserted by the suite. This module classifies nothing. */
export function propertyAuthorityEffect(): {
  providerCalls: 0; databaseOperations: 0;
  readsThePropertyTextForMeaning: false; usesAKeywordList: false;
  infersSemanticRole: false; classifiesEvidenceVersusState: false;
  gatesAnalysis: false; gatesClarificationBinding: false;
  blocksAPropertyForItsVocabulary: false; weakensAnyExistingFailClosedBehaviour: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    readsThePropertyTextForMeaning: false,
    usesAKeywordList: false,
    infersSemanticRole: false,
    classifiesEvidenceVersusState: false,
    gatesAnalysis: false,
    gatesClarificationBinding: false,
    blocksAPropertyForItsVocabulary: false,
    weakensAnyExistingFailClosedBehaviour: false,
  };
}

/**
 * The transitions out of UNRESOLVED and whether §220 gates each one, with the reason. A future
 * producer for `REJECTED_BY_ARBITRATION` must consult this rather than rediscover it: the repository
 * currently has none, which is recorded rather than assumed.
 */
export const TRANSITION_COVERAGE_220 = [
  {
    to: 'COVERED',
    authority: 'ADMITTED_BINDING',
    gatedBy220: false,
    reason: 'binding a clarification asks the question; it does not answer it. The hold stands and '
      + 'nothing is released, so gating it would make analysis manual for no safety gain.',
  },
  {
    to: 'SETTLED_BY_EVIDENCE',
    authority: 'ADMISSIBLE_EVIDENCE',
    gatedBy220: true,
    reason: 'this is where a wrong property retires a right question. The prerequisite is enforced '
      + 'in settleByReviewedEvidence.',
  },
  {
    to: 'REJECTED_BY_ARBITRATION',
    authority: 'RECORDED_ARBITRATION',
    gatedBy220: false,
    reason: 'NO RUNTIME PRODUCER EXISTS anywhere in this codebase. Recorded rather than gated '
      + 'a future producer must apply mayBeSettledUnderPropertyAuthority before transitioning.',
  },
] as const;
