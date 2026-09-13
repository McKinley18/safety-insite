/**
 * §210J -- ADDITIVE SETTLEMENT SUCCESSOR: WHICH SUBSTANTIVE BRANCH WAS ESTABLISHED. GAP 2.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== THE GAP ====================
 *
 * `SETTLED_BY_EVIDENCE` records that admissible evidence arrived and an authority was minted. It
 * does not record WHICH branch the evidence established, so at the type level a settled-satisfactory
 * fact and a settled-adverse fact are the same value and the outcome survives only inside
 * `OwedFactTransition.justification`, as prose. §210I demonstrated this rather than asserting it.
 *
 * ==================== ADDITIVE, BECAUSE THE ALTERNATIVE BREAKS A PIN ====================
 *
 * A new `OWED_FACT_STATUSES` member -- `SETTLED_SATISFACTORY`, say -- would need a transition
 * authority that does not exist in `TRANSITION_AUTHORITIES`, and would break
 * `WHY_UNRESOLVED_STATUS_INVARIANT`, which is a `satisfies Readonly<Record<OwedFactStatus, ...>>`
 * and stops compiling the moment the enum grows. `owed-fact.types.ts`, `owed-fact-ledger.ts` and
 * `settlement-review.ts` are all left untouched: the branch travels on a SUCCESSOR RECORD beside
 * the ledger, and the ledger transition is performed by the existing pinned function.
 *
 * ==================== THE PROVIDER STILL CANNOT SETTLE ANYTHING ====================
 *
 * The branch is authored by the HUMAN REVIEWER who already mints the authority, and it is
 * inseparable from that act: `mintBranchedSettlement` calls the pinned `mintSettlementAuthority`
 * FIRST and refuses whenever that refuses. A `SettlementAuthority` carries a module-private brand
 * symbol that nothing outside `settlement-review.ts` can construct, so a branch cannot be recorded
 * without one that the human path actually produced.
 *
 * A provider's route into settlement is an `ArbitrationRequest`, whose `settles` is typed as the
 * literal `false`. It is an input to a CLAIM, never to a DECISION. A provider response carrying a
 * branch field is refused by name -- see `PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS` -- rather than
 * silently ignored, so an attempt is visible instead of merely ineffective.
 *
 * ==================== LEGACY RECORDS ARE EXPLICIT, NEVER RECONSTRUCTED ====================
 *
 * A settlement recorded before this successor existed has no stored branch. It is represented as
 * `UNKNOWN_LEGACY`, which is a real value a check can reject rather than an absence a reader may
 * fill in. Nothing here reads a justification, a rationale or any prose to recover an A or a B.
 * `LEGACY_RECORD_CARRIES_A_BRANCH` exists precisely so that a retrospectively inferred branch is
 * REFUSED rather than accepted -- the guard against exactly the semantic reconstruction the
 * authorization forbids.
 */

import {
  type OwedFact, type OwedFactStatus,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  type OwedFactLedger, factOf,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  type ReviewDecisionRecord, type SettlementAuthority, type SettlementClaim,
  mintSettlementAuthority, settleByReviewedEvidence,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';

export const SETTLEMENT_SUCCESSOR_210J_VERSION =
  'hazlenz.expert.210j.settlement-successor.v1' as const;

/** The two substantive branches. Exactly the two the truth model already has. */
export const ESTABLISHED_BRANCHES = ['A', 'B'] as const;
export type EstablishedBranch = (typeof ESTABLISHED_BRANCHES)[number];

/** The explicit compatibility state. A value, not an absence. */
export const UNKNOWN_LEGACY = 'UNKNOWN_LEGACY' as const;

export const SETTLEMENT_BRANCH_VALUES = [...ESTABLISHED_BRANCHES, UNKNOWN_LEGACY] as const;
export type SettlementBranchValue = (typeof SETTLEMENT_BRANCH_VALUES)[number];

export const SETTLEMENT_RECORD_FORMATS = ['SUCCESSOR_210J', 'LEGACY_PRE_210J'] as const;
export type SettlementRecordFormat = (typeof SETTLEMENT_RECORD_FORMATS)[number];

/** Field names a provider may never send. Refused by name so an attempt is visible. */
export const PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS: readonly string[] = [
  'establishedBranch', 'settledBranch', 'branchEstablished', 'settlementBranch',
  'establishedTruth', 'resolvedBranch',
];

// ---------------------------------------------------------------- the review decision successor

/**
 * The human review decision, widened by exactly one field.
 *
 * `establishedBranch` is null for `REJECT_SETTLEMENT` and `LEAVE_UNRESOLVED`, because neither
 * establishes anything, and non-null for `APPROVE_SETTLEMENT`. The reviewer authors it; nothing
 * derives it.
 */
export interface ReviewDecisionRecord210J extends ReviewDecisionRecord {
  readonly establishedBranch: EstablishedBranch | null;
}

// ---------------------------------------------------------------- the settlement record

/**
 * The additive successor record. It sits BESIDE the ledger and carries no status authority of its
 * own: `status` here is a copy of what the ledger already holds, not a second source of truth.
 */
export interface BranchedSettlementRecord {
  readonly recordKind: 'BRANCHED_SETTLEMENT';
  readonly recordFormat: SettlementRecordFormat;
  readonly factKey: string;
  /** Null on a legacy record, which was never associated with a claim in this representation. */
  readonly claimId: string | null;
  readonly status: OwedFactStatus;
  readonly establishedBranch: SettlementBranchValue | null;
  readonly authoredBy: 'HUMAN_REVIEWER' | 'NONE_LEGACY_RECORD';
  /** Which evidence the reviewer actually read. Null on a legacy record. */
  readonly evidenceDigest: string | null;
  /** Literal, asserted by the suite: no provider ever authored this. */
  readonly providerAuthored: false;
}

export const SETTLEMENT_REFUSAL_CODES_210J = [
  'AUTHORITY_REFUSED_BY_THE_PINNED_PATH',
  'ESTABLISHED_BRANCH_MISSING_ON_APPROVAL',
  'ESTABLISHED_BRANCH_NOT_A_MEMBER',
  'ESTABLISHED_BRANCH_ON_A_NON_APPROVING_DECISION',
  'PROVIDER_AUTHORED_BRANCH',
  'REVIEWER_PROVENANCE_NOT_HUMAN',
] as const;
export type SettlementRefusalCode210J = (typeof SETTLEMENT_REFUSAL_CODES_210J)[number];

export interface BranchedMintResult {
  readonly authority: SettlementAuthority | null;
  readonly establishedBranch: EstablishedBranch | null;
  readonly refusedBecause: readonly SettlementRefusalCode210J[];
  /** The pinned path's own refusal codes, carried verbatim and never reinterpreted. */
  readonly pinnedRefusalCodes: readonly string[];
}

/**
 * Mint an authority AND the branch together, so neither can exist without the other.
 *
 * The pinned `mintSettlementAuthority` runs first and unchanged. Where it refuses, this refuses,
 * and its codes are carried through rather than restated.
 */
export function mintBranchedSettlement(
  claim: SettlementClaim, decision: ReviewDecisionRecord210J,
): BranchedMintResult {
  const refused: SettlementRefusalCode210J[] = [];

  const pinned = mintSettlementAuthority(claim, decision);
  if (pinned.authority === null) refused.push('AUTHORITY_REFUSED_BY_THE_PINNED_PATH');
  if (decision.reviewerProvenance !== 'HUMAN_REVIEW') refused.push('REVIEWER_PROVENANCE_NOT_HUMAN');

  const approving = decision.decision === 'APPROVE_SETTLEMENT';
  const branch = decision.establishedBranch;

  if (branch !== null && !(ESTABLISHED_BRANCHES as readonly string[]).includes(branch)) {
    refused.push('ESTABLISHED_BRANCH_NOT_A_MEMBER');
  } else if (approving && branch === null) {
    refused.push('ESTABLISHED_BRANCH_MISSING_ON_APPROVAL');
  } else if (!approving && branch !== null) {
    refused.push('ESTABLISHED_BRANCH_ON_A_NON_APPROVING_DECISION');
  }

  if (refused.length > 0) {
    return {
      authority: null, establishedBranch: null, refusedBecause: refused,
      pinnedRefusalCodes: [...pinned.refusedBecause],
    };
  }
  return {
    authority: pinned.authority,
    establishedBranch: branch,
    refusedBecause: [],
    pinnedRefusalCodes: [],
  };
}

export interface BranchedSettlementResult {
  readonly ledger: OwedFactLedger;
  readonly applied: boolean;
  readonly record: BranchedSettlementRecord | null;
  /** The pinned application's own refusal codes, verbatim. */
  readonly pinnedRefusalCodes: readonly string[];
  readonly appliedClaimIds: readonly string[];
}

/**
 * Apply a minted authority through the pinned path, then record the branch beside it.
 *
 * The ledger transition is performed by `settleByReviewedEvidence` and by nothing here. If that
 * refuses, no record is produced -- a branch without a settled fact is not a thing this module can
 * make.
 */
export function settleWithEstablishedBranch(args: {
  ledger: OwedFactLedger;
  claim: SettlementClaim;
  authority: SettlementAuthority;
  establishedBranch: EstablishedBranch;
  appliedClaimIds?: readonly string[];
}): BranchedSettlementResult {
  const applied = settleByReviewedEvidence(
    args.ledger, args.claim, args.authority, args.appliedClaimIds ?? []);

  if (!applied.applied) {
    return {
      ledger: applied.ledger, applied: false, record: null,
      pinnedRefusalCodes: [...applied.refusedBecause],
      appliedClaimIds: applied.appliedClaimIds,
    };
  }
  const fact = factOf(applied.ledger, args.claim.factKey);
  return {
    ledger: applied.ledger,
    applied: true,
    record: {
      recordKind: 'BRANCHED_SETTLEMENT',
      recordFormat: 'SUCCESSOR_210J',
      factKey: args.claim.factKey,
      claimId: args.claim.claimId,
      status: fact ? fact.status : 'SETTLED_BY_EVIDENCE',
      establishedBranch: args.establishedBranch,
      authoredBy: 'HUMAN_REVIEWER',
      evidenceDigest: args.authority.evidenceDigest,
      providerAuthored: false,
    },
    pinnedRefusalCodes: [],
    appliedClaimIds: applied.appliedClaimIds,
  };
}

/**
 * Represent a settlement that predates this successor. The branch is `UNKNOWN_LEGACY` and is never
 * recovered from prose.
 */
export function adoptLegacySettlement(fact: OwedFact): BranchedSettlementRecord {
  return {
    recordKind: 'BRANCHED_SETTLEMENT',
    recordFormat: 'LEGACY_PRE_210J',
    factKey: fact.factKey,
    claimId: null,
    status: fact.status,
    establishedBranch: fact.status === 'SETTLED_BY_EVIDENCE' ? UNKNOWN_LEGACY : null,
    authoredBy: 'NONE_LEGACY_RECORD',
    evidenceDigest: null,
    providerAuthored: false,
  };
}

/** Recorded as a literal so a later reader cannot mistake the omission for an oversight. */
export const LEGACY_BRANCH_IS_NEVER_INFERRED = {
  readsJustificationProse: false,
  readsRationaleProse: false,
  derivesBranchFromDecisionText: false,
  reason: 'recovering an A or a B from a sentence is a semantic judgement, and deterministic code '
    + 'in this architecture may validate and refuse model- or reviewer-authored semantics but never '
    + 'reconstruct them',
} as const;

// ---------------------------------------------------------------- lawful state

export const LAWFULNESS_CODES = [
  'SUCCESSOR_RECORD_WITHOUT_A_BRANCH',
  'LEGACY_RECORD_CARRIES_A_BRANCH',
  'BRANCH_ON_AN_UNRESOLVED_FACT',
  'BRANCH_NOT_A_MEMBER',
  'UNKNOWN_LEGACY_ON_A_SUCCESSOR_RECORD',
  'PROVIDER_AUTHORED_RECORD',
] as const;
export type LawfulnessCode = (typeof LAWFULNESS_CODES)[number];

/**
 * The closed rule table for a settlement record. Membership and pairing only -- it never decides
 * which branch the evidence established.
 */
export function settlementLawfulness(r: BranchedSettlementRecord): LawfulnessCode[] {
  const codes: LawfulnessCode[] = [];
  const settled = r.status === 'SETTLED_BY_EVIDENCE';
  const b = r.establishedBranch;

  if (r.providerAuthored as boolean) codes.push('PROVIDER_AUTHORED_RECORD');
  if (b !== null && !(SETTLEMENT_BRANCH_VALUES as readonly string[]).includes(b)) {
    codes.push('BRANCH_NOT_A_MEMBER');
    return codes;
  }
  if (!settled && b !== null) codes.push('BRANCH_ON_AN_UNRESOLVED_FACT');

  if (r.recordFormat === 'SUCCESSOR_210J') {
    if (settled && b === null) codes.push('SUCCESSOR_RECORD_WITHOUT_A_BRANCH');
    if (b === UNKNOWN_LEGACY) codes.push('UNKNOWN_LEGACY_ON_A_SUCCESSOR_RECORD');
  } else {
    // A legacy record has no stored branch. An A or a B on one could only have been inferred.
    if (b === 'A' || b === 'B') codes.push('LEGACY_RECORD_CARRIES_A_BRANCH');
  }
  return codes;
}

/**
 * The lawful transition, stated as data rather than as prose so the suite iterates it.
 */
export const LAWFUL_SETTLEMENT_TRANSITIONS = [
  {
    from: 'UNRESOLVED',
    via: 'human-authorized settlement with admissible evidence',
    to: 'SETTLED_BY_EVIDENCE + branch A or B',
    lawful: true,
  },
  {
    from: 'UNRESOLVED',
    via: 'provider autonomously choosing A or B',
    to: 'SETTLED_BY_EVIDENCE + branch',
    lawful: false,
    refusedBy: 'mintSettlementAuthority requires a ReviewDecisionRecord carrying HUMAN_REVIEW, '
      + 'which no provider response can produce; and PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS refuses '
      + 'a branch by name',
  },
  {
    from: 'UNRESOLVED',
    via: 'anything',
    to: 'SETTLED_BY_EVIDENCE with no branch on a successor record',
    lawful: false,
    refusedBy: 'SUCCESSOR_RECORD_WITHOUT_A_BRANCH',
  },
  {
    from: 'pre-successor SETTLED_BY_EVIDENCE',
    via: 'adoption',
    to: 'SETTLED_BY_EVIDENCE + UNKNOWN_LEGACY',
    lawful: true,
  },
  {
    from: 'pre-successor SETTLED_BY_EVIDENCE',
    via: 'reading the justification prose',
    to: 'SETTLED_BY_EVIDENCE + A or B',
    lawful: false,
    refusedBy: 'LEGACY_RECORD_CARRIES_A_BRANCH',
  },
] as const;

/**
 * Refuse a provider response that tried to author a settlement branch. Names only -- nothing here
 * reads a value.
 */
export function providerAuthoredBranchFields(raw: unknown): string[] {
  const d = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  return PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS.filter(f => f in d);
}

/** The discrimination §210I demonstrated was impossible. Now a value comparison. */
export function distinguishesSettledBranches(
  a: BranchedSettlementRecord, b: BranchedSettlementRecord,
): boolean {
  return a.status === b.status && a.establishedBranch !== b.establishedBranch;
}
