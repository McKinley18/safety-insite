/**
 * §212 -- R-C: CHALLENGE VOCABULARY SUCCESSOR. THE SMALLEST CLOSED SET THAT EXPRESSES KR-1.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO PRODUCTION.
 *
 * ==================== THE DEFECT ====================
 *
 * `CHALLENGE_FACT_VALIDITY` has exactly two grounds in the v3 instruction: the observation already
 * settles the fact, or both answers lead to the same action today. Neither can say
 *
 *     THE PROPOSED OWED PROPERTY IS AN EVIDENCE OR VERIFICATION PROXY RATHER THAN THE
 *     DECISION-CRITICAL SAFETY PROPERTY
 *
 * so a verifier that noticed the §210H G1 shape had no structured way to report it. §211 measured
 * that and §212 closes it.
 *
 * ==================== WHY THIS IS SEVEN MEMBERS AND NOT SEVENTY ====================
 *
 * The authorization's constraint is explicit: a small closed enum plus human-readable reason text,
 * and no taxonomy explosion. The discipline used here is that EVERY added member must map to a
 * named §211 capability and to a named hard-failure class, and `VOCABULARY_JUSTIFICATION` records
 * that mapping as data so the suite can assert it. A member that serves no validated capability is
 * not added, and three candidates were refused on exactly that test -- see `REFUSED_MEMBERS`.
 *
 * ==================== TWO KINDS OF FINDING, AND WHY THEY ARE SEPARATE FIELDS ====================
 *
 * A challenge says THE FACT SHOULD NOT STAND AS PUT. A representation concern says THE FACT IS THE
 * RIGHT FACT AND SOMETHING ABOUT ITS REPRESENTATION IS WRONG. §211's own frozen truth requires both:
 * T1 must be challenged, while T9 and T10 must have their property ACCEPTED and a specific field
 * flagged. Collapsing them into one field would force the verifier to challenge a fact it has just
 * agreed with, which is the overcorrection shape this programme keeps having to undo.
 *
 * ==================== WHAT IS DELIBERATELY NOT ADDED ====================
 *
 * No replacement property. The authorization says the verifier must not be required to author a
 * complete replacement OwedFact, and `avoid turning the verifier into a second unrestricted first
 * pass` is the reason a voluntary one is not offered either. A challenge names the defect; the
 * repair is a first-pass or human act. See `NO_REPLACEMENT_PROPERTY_FIELD`.
 *
 * No keyword classifier. Nothing deterministic decides whether a phrase names a state or its
 * evidence. Membership, pairing and presence only.
 */

export const CHALLENGE_VOCABULARY_212_VERSION =
  'hazlenz.expert.212.challenge-vocabulary.v1' as const;

/** The two grounds the v3 instruction already states, preserved verbatim in meaning and in name. */
export const INHERITED_CHALLENGE_GROUNDS = [
  'THE_OBSERVATION_ALREADY_ESTABLISHES_IT',
  'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
] as const;

/** The one ground §212 adds. */
export const ADDED_CHALLENGE_GROUND = 'PROPERTY_IDENTITY_MISMATCH' as const;

/** The closed successor set. Three members, and the first two are the inherited ones unchanged. */
export const CHALLENGE_GROUNDS_212 = [
  ...INHERITED_CHALLENGE_GROUNDS, ADDED_CHALLENGE_GROUND,
] as const;
export type ChallengeGround212 = (typeof CHALLENGE_GROUNDS_212)[number];

/**
 * The subcase, required only under `PROPERTY_IDENTITY_MISMATCH`. Two members.
 *
 * `EVIDENCE_PROXY_FOR_UNDERLYING_STATE` is named by the authorization. `ADJACENT_PROPERTY_SUBSTITUTED`
 * is the §211 V8 and HF-3 shape and cannot be folded into the first without losing the distinction
 * a reviewer needs: one says "you named the way of finding out", the other says "you named the
 * neighbour".
 */
export const PROPERTY_MISMATCH_KINDS = [
  'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
  'ADJACENT_PROPERTY_SUBSTITUTED',
] as const;
export type PropertyMismatchKind = (typeof PROPERTY_MISMATCH_KINDS)[number];

/**
 * Findings that do NOT invalidate the fact. Usable alongside any declaration, including
 * `STILL_UNRESOLVED`, because the property is agreed and a field is not.
 *
 * `NONE` is a real member rather than an absence so the field is always answered and its silence is
 * never ambiguous between "nothing wrong" and "did not look".
 */
export const REPRESENTATION_CONCERNS_212 = [
  'NONE',
  'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
  'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
] as const;
export type RepresentationConcern212 = (typeof REPRESENTATION_CONCERNS_212)[number];

/** Every added member, with the capability and hard-failure class it exists for. */
export const VOCABULARY_JUSTIFICATION: readonly {
  readonly member: string;
  readonly field: 'challengeGround' | 'propertyMismatchKind' | 'representationConcern';
  readonly capability: string;
  readonly hardFailure: string;
  readonly frozen211Case: string;
}[] = [
  { member: ADDED_CHALLENGE_GROUND, field: 'challengeGround',
    capability: 'V1_EXACT_PROPERTY_IDENTITY', hardFailure: 'HF-1', frozen211Case: 'T1, T2, T3' },
  { member: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', field: 'propertyMismatchKind',
    capability: 'V2_STATE_VERSUS_EVIDENCE', hardFailure: 'HF-1', frozen211Case: 'T1, T2, T3' },
  { member: 'ADJACENT_PROPERTY_SUBSTITUTED', field: 'propertyMismatchKind',
    capability: 'V8_ADJACENT_FACT_DRIFT', hardFailure: 'HF-3', frozen211Case: 'T5, T6' },
  { member: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY', field: 'representationConcern',
    capability: 'V4_BRANCH_ALIGNMENT', hardFailure: 'HF-4', frozen211Case: 'T1, T10' },
  { member: 'UNRESOLVED_ACTION_PRESUMES_A_BRANCH', field: 'representationConcern',
    capability: 'V7_DECISION_WHILE_UNRESOLVED', hardFailure: 'HF-6', frozen211Case: 'T9' },
];

/** Members considered and refused, because no validated capability needed them. */
export const REFUSED_MEMBERS: readonly { member: string; refusedBecause: string }[] = [
  {
    member: 'CLARIFICATION_CANNOT_SETTLE_THE_PROPERTY',
    refusedBecause: 'it is not a challenge to the FACT. The property is right and the question is '
      + 'wrong, which is exactly what ADD_OR_REPLACE_CLARIFICATION already expresses. Adding it as '
      + 'a challenge ground would let a verifier invalidate a correct fact over a weak question.',
  },
  {
    member: 'PROPERTY_TOO_BROAD / PROPERTY_TOO_NARROW',
    refusedBecause: 'no §211 capability or hard-failure class targets breadth as distinct from '
      + 'identity, and a breadth judgement with no frozen case behind it is a vocabulary a verifier '
      + 'would force-fit. §176 spent a remediation on exactly that failure mode.',
  },
  {
    member: 'LOW_CONFIDENCE / UNCERTAIN',
    refusedBecause: 'ABSTAIN already exists as a verdict and STILL_UNRESOLVED as a declaration. A '
      + 'confidence member turns a verdict into a score, and confidence is never authority here.',
  },
];

/**
 * The verifier must NOT be asked, or permitted, to author a replacement property.
 */
export const NO_REPLACEMENT_PROPERTY_FIELD = {
  added: false,
  instructedBy: 'PRODUCT_OWNER_212 — do not require a complete replacement OwedFact, and avoid '
    + 'turning the verifier into a second unrestricted first pass',
  consequence: 'a challenge names the defect and the ground; the repair is a first-pass act or a '
    + 'human one, and neither is this contract\'s job',
} as const;

// ---------------------------------------------------------------- admission rules

export const CHALLENGE_ADMISSION_CODES_212 = [
  'CHALLENGE_GROUND_MISSING',
  'CHALLENGE_GROUND_NOT_A_MEMBER',
  'CHALLENGE_GROUND_WITHOUT_A_CHALLENGE',
  'PROPERTY_MISMATCH_KIND_MISSING',
  'PROPERTY_MISMATCH_KIND_NOT_A_MEMBER',
  'PROPERTY_MISMATCH_KIND_WITHOUT_A_MISMATCH_GROUND',
  'CHALLENGE_REASON_MISSING',
  'REPRESENTATION_CONCERN_NOT_A_MEMBER',
  'CHALLENGE_TARGET_FACT_KEY_MISSING',
] as const;
export type ChallengeAdmissionCode212 = (typeof CHALLENGE_ADMISSION_CODES_212)[number];

/** One declaration entry as §212 shapes it. */
export interface DeclarationEntry212 {
  readonly factKey: string;
  readonly declaration: string;
  readonly challengeReason: string | null;
  readonly challengeGround: ChallengeGround212 | null;
  readonly propertyMismatchKind: PropertyMismatchKind | null;
  readonly representationConcern: RepresentationConcern212;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;
const member = (set: readonly string[], v: unknown): boolean =>
  typeof v === 'string' && set.includes(v);

/**
 * Validate one declaration entry. Membership, pairing and presence. Nothing reads a reason for
 * meaning, and nothing decides whether the named defect is the right defect -- that is the human
 * judgement the reason text exists to support.
 */
export function checkDeclarationEntry212(e: DeclarationEntry212): ChallengeAdmissionCode212[] {
  const codes: ChallengeAdmissionCode212[] = [];
  const isChallenge = e.declaration === 'CHALLENGE_FACT_VALIDITY';

  if (isChallenge && blank(e.factKey)) codes.push('CHALLENGE_TARGET_FACT_KEY_MISSING');
  if (isChallenge && blank(e.challengeReason)) codes.push('CHALLENGE_REASON_MISSING');

  if (isChallenge) {
    if (e.challengeGround === null) codes.push('CHALLENGE_GROUND_MISSING');
    else if (!member(CHALLENGE_GROUNDS_212, e.challengeGround)) {
      codes.push('CHALLENGE_GROUND_NOT_A_MEMBER');
    }
  } else if (e.challengeGround !== null) {
    codes.push('CHALLENGE_GROUND_WITHOUT_A_CHALLENGE');
  }

  const mismatchGround = e.challengeGround === ADDED_CHALLENGE_GROUND;
  if (mismatchGround) {
    if (e.propertyMismatchKind === null) codes.push('PROPERTY_MISMATCH_KIND_MISSING');
    else if (!member(PROPERTY_MISMATCH_KINDS, e.propertyMismatchKind)) {
      codes.push('PROPERTY_MISMATCH_KIND_NOT_A_MEMBER');
    }
  } else if (e.propertyMismatchKind !== null) {
    codes.push('PROPERTY_MISMATCH_KIND_WITHOUT_A_MISMATCH_GROUND');
  }

  if (!member(REPRESENTATION_CONCERNS_212, e.representationConcern)) {
    codes.push('REPRESENTATION_CONCERN_NOT_A_MEMBER');
  }
  return codes;
}

/** Can the vocabulary express the KR-1 finding at all? Answered structurally, not by a model. */
export function kr1IsRepresentable(): boolean {
  const e: DeclarationEntry212 = {
    factKey: 'FP:some-key',
    declaration: 'CHALLENGE_FACT_VALIDITY',
    challengeReason: 'the property names the crack test, which is how the soundness of the welds '
      + 'would be established, rather than their soundness',
    challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
    propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
    representationConcern: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
  };
  return checkDeclarationEntry212(e).length === 0;
}

/** A challenge is still a REQUEST. Typed so no caller can read it as a decision. */
export const CHALLENGE_IS_NEVER_A_SETTLEMENT = {
  settles: false as const,
  factStatusUnchanged: true as const,
  requiresHumanAuthorization: true as const,
  note: 'R-C widens what a challenge can SAY. It does not widen what a challenge can DO, and the '
    + 'v3 admission already refuses CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT.',
} as const;
