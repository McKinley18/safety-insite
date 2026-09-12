/**
 * EXPERT HAZLENZ -- SETTLEMENT CLAIM CONSUMER AND HUMAN-REVIEW AUTHORITY PRODUCER. §182.
 * INTEGRATED AND INACTIVE. NO PROVIDER CALL, NO DATABASE ACCESS, NO CUSTOMER ROUTE.
 *
 * ==================== THE TWO ABSENCES THIS CLOSES ====================
 *
 * §181 established the state machine is complete and tested, and that two things were missing:
 *
 *   RUNTIME_SETTLEMENT_AUTHORITY_PRODUCER_PRESENT = FALSE
 *   CHALLENGE_FACT_VALIDITY_CONSUMER_PRESENT      = FALSE
 *
 * A provider could already say "the observation already settles this fact" through
 * `CHALLENGE_FACT_VALIDITY`, and the resulting `ArbitrationRequest` was carried into observability
 * and read by nothing. Meanwhile `SETTLED_BY_EVIDENCE` had no producer for the `ADMISSIBLE_EVIDENCE`
 * authority it requires. This module supplies the consumer and the producer, and nothing else: no
 * new owed-fact field, no new provider declaration, no new status.
 *
 * ==================== THE AUTHORITY BOUNDARY, WHICH IS THE WHOLE POINT ====================
 *
 *      PROVIDER_SETTLEMENT_AUTHORITY = NEVER
 *
 * A provider claim is an input to a review. It is never a decision. The chain is
 *
 *      claim -> reviewable record -> HUMAN decision -> authority -> transition -> SETTLED_BY_EVIDENCE
 *
 * and every arrow after the first requires something a provider cannot produce. `SettlementAuthority`
 * carries a private brand, so it cannot be object-literalled by a caller who did not go through
 * `mintSettlementAuthority`, and that function refuses any decision that is not `APPROVE_SETTLEMENT`
 * carrying `HUMAN_REVIEW` provenance.
 *
 * ==================== WHAT THIS MODULE REFUSES TO DECIDE ====================
 *
 * Whether the evidence actually settles the fact. That is
 * `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED` and it belongs to the human.
 * Code here validates identity, provenance, binding, lifecycle and transition legality -- all
 * properties of FORM. There is no comparison of any text against any other text anywhere in this
 * file, and no score, threshold, matcher or similarity of any kind.
 *
 * `acceptableEvidence` is exposed to the reviewer verbatim, including when it is null and including
 * when it is coarse. §181 found the governed registry contains no functional-test verification
 * method at all, so a reviewer will often be shown a criterion that cannot settle the property in
 * front of them. The correct outcome then is to refuse settlement, and the architecture's job is to
 * make that refusal easy and its grounds visible -- never to strengthen the criterion in code.
 */

import { createHash } from 'crypto';
import type { AcceptableEvidence, ArbitrationRequest, OwedFactStatus } from './owed-fact.types';
// §247. The normalized review model, shared with the property surface so the two artifacts do not
// duplicate semantic state.
import type { OwedFact } from './owed-fact.types';
import {
  buildDecisionReviewContext, projectRemainingOpenAfterReview,
  type EstablishedContextSpan, type SiblingOpenFact,
} from './decision-review-model';
import { type OwedFactLedger, factOf, transition } from './owed-fact-ledger';
import { type ProjectedAcceptableEvidence, projectAcceptableEvidence } from './verifier-v3-development-boundary';
import {
  type PropertyAuthority, type PropertyAuthorityRequirement, type PropertyAuthorityState,
  initialPropertyAuthorityState, mayBeSettledUnderPropertyAuthority,
  propertyAuthorityRequirementFor,
} from './property-authority';

export const SETTLEMENT_REVIEW_CONTRACT_VERSION = 'hazlenz.expert.settlement-review.v1' as const;

/** Recorded in code so the §181 knowledge finding travels with the mechanism that depends on it. */
export const GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT = false as const;
export const EVIDENCE_QUESTION_METHOD_ALIGNMENT_GAPS_PRESENT = true as const;

/** The invariant this module exists to make structurally true. */
export const PROVIDER_SETTLEMENT_AUTHORITY = 'NEVER' as const;

// ---------------------------------------------------------------- review provenance

/**
 * The ONLY provenance that may authorize settlement.
 *
 * The refused list is not decoration. A value the type system can carry is a value a check can
 * reject, and each of these is a source that has at some point looked authoritative:
 * `HISTORICAL_EVALUATION_LABEL` is the §162/§169 disposition that must never re-enter the loop it
 * judges, and `AUTOMATED_MATCHER` is the scorer §160/§161 retired.
 */
export const PERMITTED_REVIEW_PROVENANCES = ['HUMAN_REVIEW'] as const;
export const REFUSED_REVIEW_PROVENANCES = [
  'PROVIDER_DECLARATION',
  'MODEL_ADJUDICATION',
  'HISTORICAL_EVALUATION_LABEL',
  'AUTOMATED_MATCHER',
  'DERIVED_HEURISTIC',
] as const;
export type ReviewProvenance =
  (typeof PERMITTED_REVIEW_PROVENANCES)[number] | (typeof REFUSED_REVIEW_PROVENANCES)[number];

// ---------------------------------------------------------------- decisions

/**
 * Small, closed and authority-bearing. Exactly one member mints anything.
 *
 * There is deliberately no member expressing a degree, a confidence or a partial match: a reviewer
 * who is unsure returns `LEAVE_UNRESOLVED`, which is the same outcome as doing nothing and is the
 * right answer whenever the criterion cannot settle the property.
 */
export const REVIEW_DECISIONS = ['APPROVE_SETTLEMENT', 'REJECT_SETTLEMENT', 'LEAVE_UNRESOLVED'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/** The one decision that may produce an authority. Stated as data so a test can assert on it. */
export const SETTLEMENT_APPROVING_DECISIONS: readonly ReviewDecision[] = ['APPROVE_SETTLEMENT'];

// ---------------------------------------------------------------- the claim

export const CLAIM_ORIGINS = ['CHALLENGE_FACT_VALIDITY'] as const;
export type ClaimOrigin = (typeof CLAIM_ORIGINS)[number];

/**
 * A preserved, reviewable settlement claim. The consumer's whole output.
 *
 * `claimId` and `evidenceDigest` are the smallest identity that makes replay detectable, which is
 * why they exist at all -- §182 asked for the minimal form and this is it. `claimId` is derived
 * from the analysis, the fact and the reason, so the same claim always yields the same id and a
 * different reason yields a different one. `evidenceDigest` covers the reason text alone, so an
 * approval cannot be replayed against edited evidence.
 */
export interface SettlementClaim {
  readonly claimId: string;
  readonly analysisId: string;
  readonly factKey: string;
  readonly claimOrigin: ClaimOrigin;
  /** The provider's own words. Preserved verbatim, never parsed. */
  readonly providerReason: string;
  readonly evidenceDigest: string;
  /** Guidance for the reviewer. Null is normal and must stay visible as null. */
  readonly acceptableEvidence: ProjectedAcceptableEvidence | null;
  readonly acceptableEvidenceAbsent: boolean;
  readonly factStatusAtClaim: OwedFactStatus;
  readonly reviewState: 'AWAITING_HUMAN_REVIEW';
  /** Recorded so a reviewer is never told the criterion is stronger than it is. */
  readonly settlementGuidanceCaveat: string;
  /**
   * §220. Whether this fact's PROPERTY IDENTITY rests on provider analysis alone, and if so whether
   * a human has confirmed it. Derived from the fact's provenance by
   * `propertyAuthorityRequirementFor`, which reads `modelAuthored` and no text at all.
   *
   * The claim is born `REQUIRED_NOT_OBTAINED` wherever the requirement applies, so the path is
   * fail-closed by construction: the only way to move it is `attachPropertyAuthority` carrying a
   * branded `PropertyAuthority` that only a recorded human decision can mint.
   */
  readonly propertyAuthorityRequirement: PropertyAuthorityRequirement;
  readonly propertyAuthorityState: PropertyAuthorityState;
}

export const CLAIM_REFUSAL_CODES = [
  'FACT_NOT_IN_LEDGER',
  'FACT_NOT_UNRESOLVED',
  'CLAIM_REASON_MISSING',
  'CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE',
] as const;
export type ClaimRefusalCode = (typeof CLAIM_REFUSAL_CODES)[number];

export interface ClaimConsumptionResult {
  readonly version: string;
  readonly claims: readonly SettlementClaim[];
  readonly refused: readonly { readonly factKey: string; readonly codes: readonly ClaimRefusalCode[] }[];
  /** Asserted, not hoped for: consuming claims never changes a status. */
  readonly ledgerUnchanged: true;
}

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

export function claimIdFor(analysisId: string, factKey: string, reason: string): string {
  return sha(`${SETTLEMENT_REVIEW_CONTRACT_VERSION}\n${analysisId}\n${factKey}\n${reason}`);
}

const GUIDANCE_CAVEAT =
  'acceptableEvidence states what the governed record recognises as verification. It does NOT state '
  + 'that this evidence settles this property. §181 found the governed registry contains no '
  + 'functional-test verification method, so a criterion shown here may be incapable of settling a '
  + 'protective-function fact. Deciding that is the reviewer\'s judgement.';

/**
 * THE CONSUMER. Turns arbitration requests into reviewable records and changes nothing.
 *
 * It does not decide whether a claim is correct, and it has no way to: it reads the fact's status
 * and identity and copies the provider's reason. The returned ledger is the input ledger, and
 * `ledgerUnchanged` is typed as the literal `true` so a caller cannot read this as a mutation.
 */
export function consumeSettlementClaims(
  requests: readonly ArbitrationRequest[],
  ledger: OwedFactLedger,
  analysisId: string,
): ClaimConsumptionResult {
  const claims: SettlementClaim[] = [];
  const refused: { factKey: string; codes: ClaimRefusalCode[] }[] = [];

  for (const r of requests) {
    const codes: ClaimRefusalCode[] = [];
    const fact = factOf(ledger, r.factKey);
    if (!fact) codes.push('FACT_NOT_IN_LEDGER');
    else if (fact.status !== 'UNRESOLVED') codes.push('FACT_NOT_UNRESOLVED');
    if (blank(r.reason)) codes.push('CLAIM_REASON_MISSING');
    // Structural sanity: the type says a challenge settles nothing. If a caller hands us one that
    // claims otherwise, the object did not come from the producer we trust.
    if ((r as { settles?: unknown }).settles !== false
      || (r as { factStatusUnchanged?: unknown }).factStatusUnchanged !== true) {
      codes.push('CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE');
    }
    if (codes.length > 0) { refused.push({ factKey: r.factKey, codes }); continue; }

    const ae: AcceptableEvidence | null = fact!.acceptableEvidence;
    claims.push({
      claimId: claimIdFor(analysisId, r.factKey, r.reason),
      analysisId,
      factKey: r.factKey,
      claimOrigin: 'CHALLENGE_FACT_VALIDITY',
      providerReason: r.reason,
      evidenceDigest: sha(r.reason),
      acceptableEvidence: projectAcceptableEvidence(ae),
      acceptableEvidenceAbsent: ae === null,
      factStatusAtClaim: fact!.status,
      reviewState: 'AWAITING_HUMAN_REVIEW',
      settlementGuidanceCaveat: GUIDANCE_CAVEAT,
      propertyAuthorityRequirement: propertyAuthorityRequirementFor(fact!),
      propertyAuthorityState: initialPropertyAuthorityState(fact!),
    });
  }
  return {
    version: SETTLEMENT_REVIEW_CONTRACT_VERSION,
    claims,
    refused,
    ledgerUnchanged: true,
  };
}

// ---------------------------------------------------------------- the review decision

export interface ReviewDecisionRecord {
  readonly claimId: string;
  readonly factKey: string;
  readonly decision: ReviewDecision;
  readonly reviewerProvenance: ReviewProvenance;
  /** Who decided. Free text, recorded, never parsed. */
  readonly reviewerId: string;
  readonly rationale: string;
  /** Digest of the exact evidence the reviewer read. Guards against approving text A and applying it to text B. */
  readonly reviewedEvidenceDigest: string;
  readonly decidedAt: string;
}

// ---------------------------------------------------------------- the authority

/**
 * A REAL module-private symbol, not a type-only brand. Because it is never exported, code outside
 * this module cannot construct an object carrying this key — so the brand holds at runtime as well
 * as at compile time, and a forged authority is not merely a type error but an impossible value.
 */
const SETTLEMENT_AUTHORITY_BRAND: unique symbol = Symbol('hazlenz.expert.settlement-authority');

/**
 * A narrowly scoped, single-use authorization to settle ONE fact on ONE claim.
 *
 * The brand is the point: this interface cannot be satisfied by an object literal written elsewhere,
 * so `settleByReviewedEvidence` cannot be handed a forged authority by a caller who skipped the
 * review. A boolean flag would have been trivially forgeable, which is why §182 asked for a typed
 * object.
 *
 * SCOPE, stated in the type and enforced on use: `factKey` binds it to one fact, `claimId` to one
 * claim, `evidenceDigest` to one exact piece of reviewed text. It authorizes ONE transition and
 * implies NOTHING about any other fact, any sibling, any later analysis, or any future evidence that
 * happens to look the same.
 */
export interface SettlementAuthority {
  readonly [SETTLEMENT_AUTHORITY_BRAND]: true;
  readonly authority: 'ADMISSIBLE_EVIDENCE';
  readonly factKey: string;
  readonly claimId: string;
  readonly evidenceDigest: string;
  readonly reviewerProvenance: 'HUMAN_REVIEW';
  readonly justification: string;
  readonly scope: 'SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE';
  readonly impliesFutureSufficiency: false;
}

export const AUTHORITY_REFUSAL_CODES = [
  'DECISION_DOES_NOT_APPROVE_SETTLEMENT',
  'REVIEW_PROVENANCE_NOT_HUMAN',
  'CLAIM_ID_MISMATCH',
  'FACT_KEY_MISMATCH',
  'REVIEWED_EVIDENCE_DIGEST_MISMATCH',
  'RATIONALE_MISSING',
  'REVIEWER_IDENTITY_MISSING',
] as const;
export type AuthorityRefusalCode = (typeof AUTHORITY_REFUSAL_CODES)[number];

export interface AuthorityMintResult {
  readonly authority: SettlementAuthority | null;
  readonly refusedBecause: readonly AuthorityRefusalCode[];
}

/**
 * THE PRODUCER. The only function in the repository that constructs an `ADMISSIBLE_EVIDENCE`
 * authority, and it requires a recorded human decision that explicitly approves settlement.
 *
 * A provider cannot reach this: its output is an `ArbitrationRequest`, which is an input to the
 * CLAIM, not to the DECISION. Nothing in a provider response can produce a `ReviewDecisionRecord`
 * carrying `HUMAN_REVIEW`, and the four other refusal codes fail closed independently.
 */
export function mintSettlementAuthority(
  claim: SettlementClaim, decision: ReviewDecisionRecord,
): AuthorityMintResult {
  const refused: AuthorityRefusalCode[] = [];

  if (!SETTLEMENT_APPROVING_DECISIONS.includes(decision.decision)) {
    refused.push('DECISION_DOES_NOT_APPROVE_SETTLEMENT');
  }
  if (decision.reviewerProvenance !== 'HUMAN_REVIEW') refused.push('REVIEW_PROVENANCE_NOT_HUMAN');
  if (decision.claimId !== claim.claimId) refused.push('CLAIM_ID_MISMATCH');
  if (decision.factKey !== claim.factKey) refused.push('FACT_KEY_MISMATCH');
  if (decision.reviewedEvidenceDigest !== claim.evidenceDigest) {
    refused.push('REVIEWED_EVIDENCE_DIGEST_MISMATCH');
  }
  if (blank(decision.rationale)) refused.push('RATIONALE_MISSING');
  if (blank(decision.reviewerId)) refused.push('REVIEWER_IDENTITY_MISSING');

  if (refused.length > 0) return { authority: null, refusedBecause: refused };

  return {
    authority: {
      [SETTLEMENT_AUTHORITY_BRAND]: true,
      authority: 'ADMISSIBLE_EVIDENCE',
      factKey: claim.factKey,
      claimId: claim.claimId,
      evidenceDigest: claim.evidenceDigest,
      reviewerProvenance: 'HUMAN_REVIEW',
      justification: `human review ${decision.reviewerId} approved settlement: ${decision.rationale.trim()}`,
      scope: 'SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE',
      impliesFutureSufficiency: false,
    } as SettlementAuthority,
    refusedBecause: [],
  };
}

// ---------------------------------------------------------------- applying the authority

// ---------------------------------------------------------------- §220 property authority

export const PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES = [
  'PROPERTY_AUTHORITY_NOT_FOR_THIS_FACT',
  'PROPERTY_AUTHORITY_NOT_REQUIRED_FOR_THIS_CLAIM',
] as const;
export type PropertyAuthorityAttachRefusalCode =
  (typeof PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES)[number];

export interface PropertyAuthorityAttachResult {
  readonly claim: SettlementClaim;
  readonly attached: boolean;
  readonly refusedBecause: readonly PropertyAuthorityAttachRefusalCode[];
}

/**
 * §220. Record an obtained property authority against a claim.
 *
 * The ONLY way a claim's `propertyAuthorityState` moves off `REQUIRED_NOT_OBTAINED`. It takes a
 * branded `PropertyAuthority`, which cannot be constructed outside `property-authority.ts` and which
 * `mintPropertyAuthority` produces only from a recorded human decision. A refusal returns the claim
 * unchanged, so the fail-closed state survives.
 *
 * A `CORRECTED` outcome is attached and recorded, and it does NOT permit settlement: the reviewer
 * said this is not the property that decides, so settling this fact would settle the wrong one.
 */
export function attachPropertyAuthority(
  claim: SettlementClaim, authority: PropertyAuthority,
): PropertyAuthorityAttachResult {
  const refused: PropertyAuthorityAttachRefusalCode[] = [];
  if (authority.factKey !== claim.factKey) refused.push('PROPERTY_AUTHORITY_NOT_FOR_THIS_FACT');
  if (claim.propertyAuthorityRequirement !== 'REQUIRED') {
    refused.push('PROPERTY_AUTHORITY_NOT_REQUIRED_FOR_THIS_CLAIM');
  }
  if (refused.length > 0) return { claim, attached: false, refusedBecause: refused };
  return {
    claim: { ...claim, propertyAuthorityState: authority.outcome },
    attached: true,
    refusedBecause: [],
  };
}

/** §220. Record a reviewer who declined to confirm. Fail-closed and explicitly recorded. */
export function recordPropertyAuthorityDeclined(claim: SettlementClaim): SettlementClaim {
  return claim.propertyAuthorityRequirement === 'REQUIRED'
    ? { ...claim, propertyAuthorityState: 'DECLINED_KEEP_UNRESOLVED' }
    : claim;
}

// ---------------------------------------------------------------- applying the authority

export const APPLICATION_REFUSAL_CODES = [
  'AUTHORITY_NOT_FOR_THIS_CLAIM',
  'AUTHORITY_NOT_FOR_THIS_FACT',
  'AUTHORITY_EVIDENCE_DIGEST_MISMATCH',
  'CLAIM_ALREADY_APPLIED',
  'FACT_NOT_IN_LEDGER',
  'FACT_NOT_UNRESOLVED',
  'LEDGER_MOVED_SINCE_CLAIM',
  'PROPERTY_AUTHORITY_NOT_OBTAINED',
] as const;
export type ApplicationRefusalCode = (typeof APPLICATION_REFUSAL_CODES)[number];

export interface SettlementApplicationResult {
  readonly ledger: OwedFactLedger;
  readonly applied: boolean;
  readonly refusedBecause: readonly ApplicationRefusalCode[];
  readonly appliedClaimIds: readonly string[];
}

/**
 * Apply one authority to one fact. The only call site of `transition(..., 'ADMISSIBLE_EVIDENCE')`
 * outside development harnesses.
 *
 * `appliedClaimIds` is carried by the caller rather than stored globally, so replay protection is
 * explicit at the call site instead of hidden in module state. A second application of the same
 * claim fails closed with `CLAIM_ALREADY_APPLIED` -- it does not widen the authority and does not
 * silently succeed.
 */
export function settleByReviewedEvidence(
  ledger: OwedFactLedger,
  claim: SettlementClaim,
  authority: SettlementAuthority,
  appliedClaimIds: readonly string[] = [],
): SettlementApplicationResult {
  const refused: ApplicationRefusalCode[] = [];

  if (authority.claimId !== claim.claimId) refused.push('AUTHORITY_NOT_FOR_THIS_CLAIM');
  if (authority.factKey !== claim.factKey) refused.push('AUTHORITY_NOT_FOR_THIS_FACT');
  if (authority.evidenceDigest !== claim.evidenceDigest) refused.push('AUTHORITY_EVIDENCE_DIGEST_MISMATCH');
  if (appliedClaimIds.includes(claim.claimId)) refused.push('CLAIM_ALREADY_APPLIED');

  // §220. PROPERTY AUTHORITY BEFORE FACT SETTLEMENT AUTHORITY.
  //
  // Evidence authority says the ANSWER is good enough. Property authority says the QUESTION is the
  // right one. §219 A1 showed a provider can be confidently, coherently wrong about the second while
  // the first looks impeccable, so a settlement that has only the first is refused here and the fact
  // stays exactly where it was.
  if (!mayBeSettledUnderPropertyAuthority(claim.propertyAuthorityState)) {
    refused.push('PROPERTY_AUTHORITY_NOT_OBTAINED');
  }

  const fact = factOf(ledger, claim.factKey);
  if (!fact) refused.push('FACT_NOT_IN_LEDGER');
  else if (fact.status !== 'UNRESOLVED') refused.push('FACT_NOT_UNRESOLVED');
  else if (fact.status !== claim.factStatusAtClaim) refused.push('LEDGER_MOVED_SINCE_CLAIM');

  if (refused.length > 0) {
    return { ledger, applied: false, refusedBecause: refused, appliedClaimIds: [...appliedClaimIds] };
  }

  const next = transition(ledger, {
    factKey: authority.factKey,
    to: 'SETTLED_BY_EVIDENCE',
    authority: authority.authority,
    justification: authority.justification,
  });
  return {
    ledger: next,
    applied: true,
    refusedBecause: [],
    appliedClaimIds: [...appliedClaimIds, claim.claimId],
  };
}

// ---------------------------------------------------------------- observability

/**
 * One development-only record per reviewed claim, carrying enough to reconstruct the decision.
 *
 * NOT recorded and never projected to a provider: the review decision, the rationale, and the final
 * settlement outcome. Feeding a judgement about the system's output back into the system's input is
 * the closed loop the evaluation depends on being open, which is why `ADJUDICATION_LABEL` is already
 * a production-forbidden evidence provenance.
 */
export interface SettlementReviewObservation {
  readonly version: string;
  readonly analysisId: string;
  readonly factKey: string;
  readonly claimId: string;
  readonly claimOrigin: ClaimOrigin;
  readonly providerReason: string;
  readonly acceptableEvidence: ProjectedAcceptableEvidence | null;
  readonly acceptableEvidenceAbsent: boolean;
  readonly factStatusBeforeReview: OwedFactStatus;
  readonly reviewerProvenance: ReviewProvenance | null;
  readonly reviewDecision: ReviewDecision | null;
  readonly authorityMinted: boolean;
  readonly authorityRefusedBecause: readonly AuthorityRefusalCode[];
  readonly transitionAttempted: boolean;
  readonly applicationRefusedBecause: readonly ApplicationRefusalCode[];
  readonly factStatusAfterReview: OwedFactStatus | null;
  readonly PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER';
  readonly GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT: false;
  /** §220. Carried into observability so a refused settlement records WHY it was refused. */
  readonly propertyAuthorityRequirement: PropertyAuthorityRequirement;
  readonly propertyAuthorityState: PropertyAuthorityState;
}

export function observeSettlementReview(input: {
  claim: SettlementClaim;
  decision: ReviewDecisionRecord | null;
  mint: AuthorityMintResult | null;
  application: SettlementApplicationResult | null;
  ledgerAfter: OwedFactLedger | null;
}): SettlementReviewObservation {
  const { claim, decision, mint, application, ledgerAfter } = input;
  const after = ledgerAfter ? factOf(ledgerAfter, claim.factKey)?.status ?? null : null;
  return {
    version: SETTLEMENT_REVIEW_CONTRACT_VERSION,
    analysisId: claim.analysisId,
    factKey: claim.factKey,
    claimId: claim.claimId,
    claimOrigin: claim.claimOrigin,
    providerReason: claim.providerReason,
    acceptableEvidence: claim.acceptableEvidence,
    acceptableEvidenceAbsent: claim.acceptableEvidenceAbsent,
    factStatusBeforeReview: claim.factStatusAtClaim,
    reviewerProvenance: decision?.reviewerProvenance ?? null,
    reviewDecision: decision?.decision ?? null,
    authorityMinted: mint?.authority != null,
    authorityRefusedBecause: mint?.refusedBecause ?? [],
    transitionAttempted: application != null,
    applicationRefusedBecause: application?.refusedBecause ?? [],
    factStatusAfterReview: after,
    PROVIDER_SETTLEMENT_AUTHORITY,
    GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT,
    propertyAuthorityRequirement: claim.propertyAuthorityRequirement,
    propertyAuthorityState: claim.propertyAuthorityState,
  };
}

/**
 * Fields this module must never project into a provider request, recorded so a later edit that adds
 * one contradicts a published constant.
 */
export const NEVER_PROJECTED_TO_PROVIDER: readonly string[] = [
  'reviewDecision',
  'reviewerProvenance',
  'reviewerId',
  'rationale',
  'authorityMinted',
  'factStatusAfterReview',
];

// ================================================================ §247 EVIDENCE REVIEW ARTIFACT

/**
 * ==================== WHY THIS ARTIFACT EXISTS ====================
 *
 * Before §247 this module carried NO reviewer-facing artifact of any kind. It held an evidence
 * digest on the claim and on the authority, which are identity values for replay detection, not
 * anything rendered to a human.
 *
 * §243 C2 is what that cost. A reviewer was asked to decide whether a hire company's scan supported
 * a proposition, and the surface showed none of the five things the frozen list required — above all
 * that approving the evidence cannot settle the question, because property authority had not been
 * obtained. The reviewer could not have known that from what they were shown.
 *
 * ==================== THE AUTHORITY BOUNDARY, RESTATED ON THE ARTIFACT ====================
 *
 * EVIDENCE_APPROVAL may establish EVIDENCE authority only. It cannot substitute for property
 * authority, and settlement still requires every authority the existing settlement contract
 * requires. The packet says so in a fixed sentence on every instance, and `consequenceOfApproval`
 * is computed from the CURRENT property authority state rather than assumed.
 *
 * Every field is copying or projection. Nothing here reads meaning out of prose, decides whether
 * evidence is sufficient, or grants any authority by being read.
 */
export const EVIDENCE_REVIEW_CONTRACT_VERSION =
  'hazlenz.expert.evidence-review.247.v1' as const;

/** Three actions and no more, mirroring the property surface. Unsure returns LEAVE_UNRESOLVED. */
export const EVIDENCE_REVIEW_DECISIONS = [
  'APPROVE_EVIDENCE', 'REJECT_EVIDENCE', 'LEAVE_UNRESOLVED',
] as const;
export type EvidenceReviewDecision = (typeof EVIDENCE_REVIEW_DECISIONS)[number];

export const EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT =
  'Approving this evidence establishes EVIDENCE authority only. It does not settle the fact, and it '
  + 'is not a substitute for property authority. Settlement still requires every authority the '
  + 'settlement contract requires.';

export const EVIDENCE_REVIEWER_QUESTION =
  'Does the evidence shown below support the proposition it is offered for?';

export interface EvidenceReviewPacket {
  readonly packetId: string;
  readonly contractVersion: typeof EVIDENCE_REVIEW_CONTRACT_VERSION;
  readonly analysisId: string;
  readonly factKey: string;
  /** The property as currently stated. Verbatim. */
  readonly proposedProperty: string;
  /** The observation span the fact was raised from. Verbatim. */
  readonly observationSpan: string;
  /** §247, G3-shaped: adjacent established context, so a proxy concern is visible here too. */
  readonly establishedContext: readonly EstablishedContextSpan[];
  /** §247, C6-shaped: what else is open, so approving here is not mistaken for disposing of all. */
  readonly siblingOpenFacts: readonly SiblingOpenFact[];
  /** The evidence text under review, verbatim, with the digest that binds the decision to it. */
  readonly evidenceText: string;
  readonly evidenceDigest: string;
  /** The proposition the claim offers this evidence FOR. Verbatim from the claim. */
  readonly propositionSupported: string;
  readonly propertyAuthorityRequirement: string;
  readonly propertyAuthorityState: string;
  readonly evidenceAuthorityRequirement: string | null;
  readonly evidenceAuthorityState: string | null;
  readonly reviewerQuestion: string;
  readonly availableDecisions: readonly EvidenceReviewDecision[];
  /** Computed from the CURRENT property authority state, never assumed. This is the C2 field. */
  readonly consequenceOfApproval: string;
  /** What is still open after approval. The second C2 field. */
  readonly remainingUnresolvedAfterApproval: readonly string[];
  readonly evidenceApprovalIsNotSettlement: typeof EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT;
}

export function buildEvidenceReviewPacket(input: {
  analysisId: string;
  fact: OwedFact;
  proposedProperty: string;
  evidenceText: string;
  propositionSupported: string;
  propertyAuthorityRequirement: string;
  propertyAuthorityState: string;
  evidenceAuthorityRequirement?: string | null;
  evidenceAuthorityState?: string | null;
  establishedContext?: readonly EstablishedContextSpan[];
  siblingOpenFacts?: readonly SiblingOpenFact[];
}): EvidenceReviewPacket {
  const ctx = buildDecisionReviewContext({
    analysisId: input.analysisId,
    fact: input.fact,
    proposedProperty: input.proposedProperty,
    propertyAuthorityRequirement: input.propertyAuthorityRequirement,
    propertyAuthorityState: input.propertyAuthorityState,
    evidenceAuthorityRequirement: input.evidenceAuthorityRequirement,
    evidenceAuthorityState: input.evidenceAuthorityState,
    establishedContext: input.establishedContext,
    siblingOpenFacts: input.siblingOpenFacts,
  });
  const digest = createHash('sha256').update(input.evidenceText, 'utf8').digest('hex');

  // The C2 sentence. Stated from the CURRENT property authority state, so a reviewer is told
  // plainly when approval cannot settle rather than being left to infer it.
  const propertyBlocks = input.propertyAuthorityRequirement === 'REQUIRED'
    && input.propertyAuthorityState !== 'OBTAINED';
  const consequenceOfApproval = propertyBlocks
    ? 'Evidence authority is established. The fact still CANNOT be settled, because property '
      + `authority for ${input.fact.factKey} is required and has not been obtained. Approving this `
      + 'evidence does not obtain it.'
    : 'Evidence authority is established. Settlement remains subject to every other authority the '
      + 'settlement contract requires.';

  return {
    packetId: createHash('sha256')
      .update(`${input.analysisId}|${input.fact.factKey}|${digest}`, 'utf8').digest('hex'),
    contractVersion: EVIDENCE_REVIEW_CONTRACT_VERSION,
    analysisId: input.analysisId,
    factKey: input.fact.factKey,
    proposedProperty: input.proposedProperty,
    observationSpan: ctx.observationSpan,
    establishedContext: ctx.establishedContext,
    siblingOpenFacts: ctx.siblingOpenFacts,
    evidenceText: input.evidenceText,
    evidenceDigest: digest,
    propositionSupported: input.propositionSupported,
    propertyAuthorityRequirement: ctx.propertyAuthorityRequirement,
    propertyAuthorityState: ctx.propertyAuthorityState,
    evidenceAuthorityRequirement: ctx.evidenceAuthorityRequirement,
    evidenceAuthorityState: ctx.evidenceAuthorityState,
    reviewerQuestion: EVIDENCE_REVIEWER_QUESTION,
    availableDecisions: EVIDENCE_REVIEW_DECISIONS,
    consequenceOfApproval,
    remainingUnresolvedAfterApproval: projectRemainingOpenAfterReview(ctx),
    evidenceApprovalIsNotSettlement: EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT,
  };
}
