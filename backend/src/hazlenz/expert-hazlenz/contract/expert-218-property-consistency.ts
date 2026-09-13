/**
 * §218 -- DETERMINISTIC CROSS-FIELD CONSISTENCY FOR THE STRUCTURED PROPERTY REVIEW.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO PRODUCTION.
 *
 * ==================== THE BOUNDARY, RESTATED BEFORE ANY CODE ====================
 *
 * THE MODEL makes every semantic judgement. This module:
 *
 *   validates structure                    presence and object shape
 *   validates closed enums                 membership, nothing else
 *   validates target identity              exact string equality against the supplied id
 *   enforces consistency BETWEEN           two model-authored enums that cannot both be true
 *     model-authored decisions
 *   routes fail-closed states              a defective review never reaches a disposition
 *   preserves unresolved truth             a refusal leaves the fact exactly where it was
 *   prevents unauthorized settlement       unchanged from v3; nothing here can settle anything
 *
 * It does NOT infer whether something is evidence or a safety property, does not inspect vocabulary
 * to classify tests or records, does not reconstruct the decision-controlling property from prose,
 * does not repair a model classification and does not invent a replacement OwedFact. Every string
 * comparison in this file is exact equality or closed-set membership. The ONE exception is the
 * whole-field filler test, which is `isNonSemanticFiller` -- the §210E rule already in the
 * first-pass projection, reused rather than reinvented, and which decides that a field is a
 * NON-ANSWER rather than deciding what an answer means.
 *
 * ==================== A REFUSAL §216 MADE, AND WHY §218 OVERTURNS IT ====================
 *
 * §216 considered forbidding VERIFIED_AS_IS alongside a property-identity challenge and REFUSED,
 * on the ground that a challenge addresses the FACT while a verdict addresses the CLARIFICATION
 * layer, so the combination might be correct and a rule refusing it would refuse a right answer.
 *
 * That reasoning was sound WHEN THE ARCHITECTURE HAD NO STRUCTURED PROPERTY DECISION. It is not the
 * same rule now. `propertyValidity: INVALID` is an explicit statement that the proposition under
 * review is not the one that decides; VERIFIED_AS_IS asserts the first pass asked the right question
 * about that same proposition. Those cannot both be true of one target. The refusal is recorded as
 * SUPERSEDED with its original reason intact rather than quietly dropped -- see
 * `SUPERSEDED_REFUSALS_216`.
 */

import {
  type PropertyReview218, type PropertySemanticRole218, type PropertyValidity218,
  PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218, PROPERTY_REVIEW_FIELDS_218,
} from './expert-218-property-review-contract';
import { isNonSemanticFiller } from './expert-first-pass-owed-fact-projection';

export const PROPERTY_CONSISTENCY_218_VERSION =
  'hazlenz.expert.218.property-consistency.v1' as const;

// ---------------------------------------------------------------- the ordered decision

/**
 * The decision order, as data. The point of §218 is that this order is STRUCTURAL: the property
 * question is answered in fields, and the clarification question is not reached until it has been.
 */
export const ORDERED_DECISION_STEPS_218: readonly {
  step: 1 | 2 | 3 | 4; what: string; reachedOnlyIf: string | null;
}[] = [
  { step: 1, what: 'evaluate the identity of the target property', reachedOnlyIf: null },
  { step: 2, what: 'record propertySemanticRole', reachedOnlyIf: null },
  { step: 3, what: 'record propertyValidity', reachedOnlyIf: null },
  {
    step: 4,
    what: 'ordinary branch, representation and clarification review, toward VERIFIED_AS_IS or '
      + 'ADD_OR_REPLACE_CLARIFICATION',
    reachedOnlyIf: 'propertyValidity === VALID',
  },
];

/** A better clarification must never make an INVALID property valid. Stated as a predicate. */
export function mayProceedToRepresentationReview(validity: PropertyValidity218): boolean {
  return validity === 'VALID';
}

// ---------------------------------------------------------------- codes

export const PROPERTY_REVIEW_CODES_218 = [
  // ---- structure
  'PROPERTY_REVIEW_MISSING',
  'PROPERTY_REVIEW_NOT_AN_OBJECT',
  'PROPERTY_REVIEW_FIELD_MISSING',
  'PROPERTY_REVIEW_FIELD_PLACEHOLDER',
  'PROPERTY_REVIEW_UNKNOWN_FIELD',
  // ---- closed enums
  'PROPERTY_SEMANTIC_ROLE_NOT_A_MEMBER',
  'PROPERTY_VALIDITY_NOT_A_MEMBER',
  // ---- target identity
  'PROPERTY_REVIEW_TARGET_MISMATCH',
  'PROPERTY_REVIEW_TARGET_NOT_DECLARED',
  // ---- role against validity
  'EVIDENCE_ROLE_MUST_BE_INVALID',
  'AMBIGUOUS_ROLE_MUST_BE_UNCERTAIN',
  'ROLE_AND_MISMATCH_KIND_INCONSISTENT',
  // ---- validity against disposition
  'INVALID_PROPERTY_NOT_CHALLENGED',
  'INVALID_PROPERTY_VERIFIED_AS_IS',
  'INVALID_PROPERTY_ROUTED_TO_CLARIFICATION',
  'INVALID_PROPERTY_GROUND_NOT_PROPERTY_IDENTITY',
  'UNCERTAIN_PROPERTY_NOT_ABSTAINED',
  'UNCERTAIN_PROPERTY_CHALLENGED_ON_IDENTITY',
  'VALID_PROPERTY_CHALLENGED_ON_IDENTITY',
] as const;
export type PropertyReviewCode218 = (typeof PROPERTY_REVIEW_CODES_218)[number];

/** Which conditions this module actually decides, in §166's own vocabulary. */
export const CONSISTENCY_RULE_CLASSIFICATION_218 = {
  PROPERTY_REVIEW_IS_PRESENT_AND_WELL_SHAPED: 'SAFE_DETERMINISTIC',
  ROLE_AND_VALIDITY_ARE_CLOSED_SET_MEMBERS: 'SAFE_DETERMINISTIC',
  TARGET_DECLARATION_ID_MATCHES_THE_SUPPLIED_ID: 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY',
  TWO_MODEL_AUTHORED_ENUMS_DO_NOT_CONTRADICT: 'SAFE_DETERMINISTIC_CROSS_FIELD_PAIRING',
  VALIDITY_AND_DISPOSITION_DO_NOT_CONTRADICT: 'SAFE_DETERMINISTIC_CROSS_FIELD_PAIRING',
  THE_ROLE_IS_THE_RIGHT_ROLE: 'REQUIRES_MODEL_SEMANTICS',
  THE_PROPERTY_IS_REALLY_EVIDENCE: 'REQUIRES_MODEL_SEMANTICS',
  THE_DECISION_CONTROLLING_PROPERTY_IS_THE_RIGHT_ONE: 'REQUIRES_HUMAN_TRUTH',
  THE_REASON_TEXT_IS_A_GOOD_REASON: 'REQUIRES_HUMAN_TRUTH',
} as const;

// ---------------------------------------------------------------- input and result

/** What the request supplied, as identifiers only. */
export interface PropertyReviewScope218 {
  /** The declaration id printed in the fact block. */
  readonly targetDeclarationId: string;
  /** The one fact key under review. */
  readonly targetFactKey: string;
}

/** The declaration entry as §212 shapes it, read for pairing only. */
export interface DeclarationForConsistency218 {
  readonly factKey?: unknown;
  readonly declaration?: unknown;
  readonly challengeGround?: unknown;
  readonly propertyMismatchKind?: unknown;
}

export interface PropertyReviewCheckInput218 {
  readonly scope: PropertyReviewScope218;
  readonly output: {
    readonly propertyReview?: unknown;
    readonly verdict?: unknown;
    readonly owedFactDeclarations?: readonly DeclarationForConsistency218[];
  };
}

export type PropertyRoute218 =
  | 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED'
  | 'PROPERTY_CHALLENGED'
  | 'PROPERTY_UNCERTAIN_ABSTAINED'
  | 'FAIL_CLOSED';

export interface PropertyReviewCheckResult218 {
  readonly admitted: boolean;
  readonly codes: readonly PropertyReviewCode218[];
  readonly detail: readonly string[];
  readonly route: PropertyRoute218;
  /** Set only when the review is admitted. Null on any fail-closed route. */
  readonly review: PropertyReview218 | null;
  /** Whether step 4 of the ordered decision is reachable for this output. */
  readonly representationReviewMayProceed: boolean;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;
const member = (set: readonly string[], v: unknown): boolean =>
  typeof v === 'string' && set.includes(v);

const PROPERTY_IDENTITY_MISMATCH = 'PROPERTY_IDENTITY_MISMATCH';
const EVIDENCE_PROXY_KIND = 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE';
const ADJACENT_KIND = 'ADJACENT_PROPERTY_SUBSTITUTED';

/**
 * The mismatch kind each role implies WHEN THE MODEL HAS ALREADY SAID THE PROPERTY IS INVALID.
 *
 * This is a pairing between two model-authored enums and not a classification: the model decided the
 * role and the model decided the validity, and only certain pairs of its own answers are coherent.
 * A property the model called EVIDENCE cannot be challenged as a NEIGHBOUR, and a property the model
 * called a genuine state, act or artifact cannot be challenged as a proxy.
 */
export const KIND_IMPLIED_BY_ROLE_218:
Readonly<Record<PropertySemanticRole218, string | null>> = {
  UNDERLYING_SAFETY_STATE: ADJACENT_KIND,
  REQUIRED_ACT_ITSELF: ADJACENT_KIND,
  REQUIRED_ARTIFACT_ITSELF: ADJACENT_KIND,
  EVIDENCE_FOR_ANOTHER_PROPERTY: EVIDENCE_PROXY_KIND,
  AMBIGUOUS_OR_UNRESOLVED: null,
};

/**
 * Apply the §218 consistency rules. Total and pure. Membership, presence, exact equality and
 * cross-field pairing; no text is read for meaning and nothing is repaired.
 */
export function checkPropertyReview218(
  input: PropertyReviewCheckInput218,
): PropertyReviewCheckResult218 {
  const codes: PropertyReviewCode218[] = [];
  const detail: string[] = [];
  const fail = (c: PropertyReviewCode218, why: string): void => { codes.push(c); detail.push(why); };
  const failClosed = (): PropertyReviewCheckResult218 => ({
    admitted: false, codes, detail, route: 'FAIL_CLOSED', review: null,
    representationReviewMayProceed: false,
  });

  const raw = input.output.propertyReview;
  if (raw === undefined || raw === null) {
    fail('PROPERTY_REVIEW_MISSING', 'the output carries no propertyReview; the semantic judgement '
      + 'is not inferred from prose and the target stays unresolved');
    return failClosed();
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    fail('PROPERTY_REVIEW_NOT_AN_OBJECT', `propertyReview is ${Array.isArray(raw) ? 'an array' : typeof raw}`);
    return failClosed();
  }
  const r = raw as Record<string, unknown>;

  // ---- structure. Every field is required and there is no null.
  for (const f of PROPERTY_REVIEW_FIELDS_218) {
    if (blank(r[f])) fail('PROPERTY_REVIEW_FIELD_MISSING', `propertyReview.${f} is empty`);
  }
  for (const k of Object.keys(r)) {
    if (!(PROPERTY_REVIEW_FIELDS_218 as readonly string[]).includes(k)) {
      fail('PROPERTY_REVIEW_UNKNOWN_FIELD', `propertyReview carries ${JSON.stringify(k.slice(0, 48))}`);
    }
  }
  // ---- §210E R7, reused: a whole field that is filler states nothing. Refused, never repaired.
  for (const f of ['targetDeclarationId', 'decisionControllingProperty',
    'propertyReviewReason'] as const) {
    if (isNonSemanticFiller(r[f])) {
      fail('PROPERTY_REVIEW_FIELD_PLACEHOLDER',
        `propertyReview.${f} is ${JSON.stringify(String(r[f]).slice(0, 32))}, which answers nothing`);
    }
  }

  // ---- closed enums. Membership only.
  if (!member(PROPERTY_SEMANTIC_ROLES_218, r.propertySemanticRole)) {
    fail('PROPERTY_SEMANTIC_ROLE_NOT_A_MEMBER', String(r.propertySemanticRole));
  }
  if (!member(PROPERTY_VALIDITIES_218, r.propertyValidity)) {
    fail('PROPERTY_VALIDITY_NOT_A_MEMBER', String(r.propertyValidity));
  }

  // ---- target identity. Exact string equality; no normalisation, no nearest neighbour.
  if (typeof r.targetDeclarationId === 'string'
      && r.targetDeclarationId !== input.scope.targetDeclarationId) {
    fail('PROPERTY_REVIEW_TARGET_MISMATCH',
      `propertyReview names ${JSON.stringify(String(r.targetDeclarationId).slice(0, 48))}, the `
      + `request supplied ${JSON.stringify(input.scope.targetDeclarationId)}`);
  }

  const declarations = input.output.owedFactDeclarations ?? [];
  const target = declarations.find(d => String(d?.factKey ?? '') === input.scope.targetFactKey);
  if (target === undefined) {
    fail('PROPERTY_REVIEW_TARGET_NOT_DECLARED',
      `${input.scope.targetFactKey} carries no declaration, so the property review has nothing to `
      + 'be consistent with');
  }

  if (codes.length > 0) return failClosed();

  const role = r.propertySemanticRole as PropertySemanticRole218;
  const validity = r.propertyValidity as PropertyValidity218;
  const declaration = String(target?.declaration ?? '');
  const ground = target?.challengeGround ?? null;
  const kind = target?.propertyMismatchKind ?? null;
  const verdict = String(input.output.verdict ?? '');

  // ---- role against validity. The two preferred invariants, and nothing invented beside them.
  if (role === 'EVIDENCE_FOR_ANOTHER_PROPERTY' && validity !== 'INVALID') {
    fail('EVIDENCE_ROLE_MUST_BE_INVALID',
      `the role says the property is evidence for a different property and the validity says `
      + `${validity}. Evidence can be probative, required and the only practical route, and none of `
      + 'that makes it the proposition whose truth decides.');
  }
  if (role === 'AMBIGUOUS_OR_UNRESOLVED' && validity !== 'UNCERTAIN') {
    fail('AMBIGUOUS_ROLE_MUST_BE_UNCERTAIN',
      `the role says the semantic role could not be determined and the validity says ${validity}. `
      + 'An undetermined role is not permission to decide validity anyway.');
  }

  // ---- validity against disposition.
  if (validity === 'INVALID') {
    if (declaration !== 'CHALLENGE_FACT_VALIDITY') {
      fail('INVALID_PROPERTY_NOT_CHALLENGED',
        `the property was declared INVALID and the target was declared ${declaration || '(none)'}`);
    }
    if (verdict === 'VERIFIED_AS_IS') {
      fail('INVALID_PROPERTY_VERIFIED_AS_IS',
        'VERIFIED_AS_IS asserts the first pass asked the right question about a proposition the '
        + 'verifier has just said does not control the decision');
    }
    if (verdict === 'ADD_OR_REPLACE_CLARIFICATION') {
      fail('INVALID_PROPERTY_ROUTED_TO_CLARIFICATION',
        'a better question does not make a wrong property right; it hides it. The fact stays open '
        + 'and a person decides.');
    }
    if (ground !== PROPERTY_IDENTITY_MISMATCH) {
      fail('INVALID_PROPERTY_GROUND_NOT_PROPERTY_IDENTITY',
        `INVALID says the supplied property is not the decision-controlling one, which is exactly `
        + `${PROPERTY_IDENTITY_MISMATCH}; the ground given was ${String(ground)}`);
    }
    const implied = KIND_IMPLIED_BY_ROLE_218[role];
    if (implied !== null && ground === PROPERTY_IDENTITY_MISMATCH && kind !== implied) {
      fail('ROLE_AND_MISMATCH_KIND_INCONSISTENT',
        `role ${role} pairs with ${implied}; the kind given was ${String(kind)}`);
    }
  }

  if (validity === 'UNCERTAIN') {
    if (verdict !== 'ABSTAIN') {
      fail('UNCERTAIN_PROPERTY_NOT_ABSTAINED',
        `validity UNCERTAIN routes fail closed to ABSTAIN; the verdict was ${verdict || '(none)'}`);
    }
    if (ground === PROPERTY_IDENTITY_MISMATCH) {
      fail('UNCERTAIN_PROPERTY_CHALLENGED_ON_IDENTITY',
        'a verifier that cannot establish whether the property is the right one cannot assert that '
        + 'it is the wrong one');
    }
  }

  if (validity === 'VALID' && ground === PROPERTY_IDENTITY_MISMATCH) {
    fail('VALID_PROPERTY_CHALLENGED_ON_IDENTITY',
      'the property was accepted and then challenged on its identity');
  }

  if (codes.length > 0) return failClosed();

  return {
    admitted: true,
    codes: [],
    detail: [],
    route: validity === 'VALID' ? 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED'
      : validity === 'INVALID' ? 'PROPERTY_CHALLENGED' : 'PROPERTY_UNCERTAIN_ABSTAINED',
    review: {
      targetDeclarationId: String(r.targetDeclarationId),
      propertySemanticRole: role,
      propertyValidity: validity,
      decisionControllingProperty: String(r.decisionControllingProperty),
      propertyReviewReason: String(r.propertyReviewReason),
    },
    representationReviewMayProceed: mayProceedToRepresentationReview(validity),
  };
}

// ---------------------------------------------------------------- fail-closed posture

/**
 * What a fail-closed route does, and does not do. Typed as literals so no caller can read a refusal
 * as a finding and the suite can assert it mechanically.
 */
export function failClosedEffect218(): {
  rawOutputPreserved: true;
  targetRemainsUnresolved: true;
  clarificationsMayChange: false;
  factMayBeSettled: false;
  missingSemanticJudgementIsInferred: false;
  aReplacementOwedFactIsCreated: false;
  theModelClassificationIsRepaired: false;
} {
  return {
    rawOutputPreserved: true,
    targetRemainsUnresolved: true,
    clarificationsMayChange: false,
    factMayBeSettled: false,
    missingSemanticJudgementIsInferred: false,
    aReplacementOwedFactIsCreated: false,
    theModelClassificationIsRepaired: false,
  };
}

/** The exact fields consulted. Exported so the suite counts them rather than trusting a sentence. */
export const CONSISTENCY_DECISION_INPUTS_218: readonly string[] = [
  'output.propertyReview (presence and object shape)',
  'output.propertyReview.targetDeclarationId (exact string equality only)',
  'output.propertyReview.propertySemanticRole (closed-set membership only)',
  'output.propertyReview.propertyValidity (closed-set membership only)',
  'output.propertyReview.decisionControllingProperty (non-blank and whole-field filler only)',
  'output.propertyReview.propertyReviewReason (non-blank and whole-field filler only)',
  'output.verdict (closed-set membership only)',
  'output.owedFactDeclarations[].factKey (exact string equality only)',
  'output.owedFactDeclarations[].declaration (closed-set membership only)',
  'output.owedFactDeclarations[].challengeGround (closed-set membership only)',
  'output.owedFactDeclarations[].propertyMismatchKind (closed-set membership only)',
];

export function consistencyEffect218(): {
  providerCalls: 0; databaseOperations: 0;
  infersWhetherSomethingIsEvidence: false; inspectsVocabularyToClassify: false;
  reconstructsThePropertyFromProse: false; repairsAModelClassification: false;
  inventsAReplacementOwedFact: false; readsAnyFieldForMeaning: false;
  usesAKeywordList: false; addsAVerdict: false; addsAChallengeGround: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    infersWhetherSomethingIsEvidence: false,
    inspectsVocabularyToClassify: false,
    reconstructsThePropertyFromProse: false,
    repairsAModelClassification: false,
    inventsAReplacementOwedFact: false,
    readsAnyFieldForMeaning: false,
    usesAKeywordList: false,
    addsAVerdict: false,
    addsAChallengeGround: false,
  };
}

// ---------------------------------------------------------------- what was refused, and what moved

/** Rules considered for §218 and NOT added, with the reason. */
export const REFUSED_RULES_218: readonly { rule: string; refusedBecause: string }[] = [
  {
    rule: 'require propertyValidity UNCERTAIN whenever propertySemanticRole is not '
      + 'AMBIGUOUS_OR_UNRESOLVED but the reason text hedges',
    refusedBecause: 'reading a reason for hedging is reading free text for meaning, which is the '
      + 'line this architecture has held since §160.',
  },
  {
    rule: 'make AMBIGUOUS_OR_UNRESOLVED and UNCERTAIN a biconditional, so that UNCERTAIN forces the '
      + 'ambiguous role',
    refusedBecause: 'a verifier can be sure a property is an act and still unable to establish '
      + 'whether that act is what this decision turns on. Forcing the role would refuse a right '
      + 'answer, which is the overcorrection shape §212, §214 and §216 each had to undo.',
  },
  {
    rule: 'forbid NO_CLARIFICATION_REQUIRED alongside propertyValidity INVALID',
    refusedBecause: '§216 refused the same rule and the reason still holds: whether the unknown '
      + 'changes what is done today is a semantic judgement about the case, not a structural '
      + 'property of the output. §218 was directed to close VERIFIED_AS_IS and '
      + 'ADD_OR_REPLACE_CLARIFICATION, and it closes exactly those.',
  },
  {
    rule: 'check that decisionControllingProperty concerns the target rather than a sibling',
    refusedBecause: 'that is a semantic comparison of two prose statements. Sibling containment '
      + 'stays where §214 put it -- on the structured nomination, which is refused by request '
      + 'shape -- and the prose half remains instruction-led. Recorded as a residual.',
  },
  {
    rule: 'derive propertySemanticRole from the property text when the model omits it',
    refusedBecause: 'that is the keyword classifier this architecture has refused since §160, and '
      + '§212, §214 and §216 each recorded the same refusal. A missing role fails closed.',
  },
];

/**
 * The one §216 refusal §218 overturns, with §216's original reason preserved verbatim in substance.
 * Recorded rather than dropped, because a programme that quietly reverses its own refusals cannot be
 * audited.
 */
export const SUPERSEDED_REFUSALS_216: readonly {
  rule: string; section216Reason: string; section218Reason: string;
}[] = [
  {
    rule: 'forbid VERIFIED_AS_IS alongside a property-identity challenge',
    section216Reason: 'a challenge addresses the FACT and the verdict addresses the CLARIFICATION '
      + 'layer, so the combination may be correct, and a rule refusing it would refuse a right '
      + 'answer',
    section218Reason: 'that reasoning applied to an architecture with no structured property '
      + 'decision. With propertyValidity explicit, INVALID and VERIFIED_AS_IS are two statements '
      + 'about the same proposition that cannot both hold: one says it does not control the '
      + 'decision, the other says the right question was asked about it. The product-owner '
      + 'authorization directs the refusal and the structured field makes it checkable without '
      + 'semantics.',
  },
];
