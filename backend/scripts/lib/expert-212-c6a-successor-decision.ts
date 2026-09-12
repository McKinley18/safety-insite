/**
 * §212 -- ADDITIVE SUCCESSOR DECISION ON §201 CANDIDATE C6a.
 * ZERO PROVIDER CALLS. NOTHING IN §201 IS MODIFIED, RESCORED OR RESTATED.
 *
 * §201's `C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE` is the registry's highest-ranked candidate and it
 * is a good candidate. Its analysis stands, its score stands, and its prototype stands. This record
 * does not touch any of it.
 *
 * What changed is not the candidate. It is the REMIT. §201 scored C6a against a verifier whose job
 * was choosing which clarification to ask, and under that remit a two-member `challengeGround` enum
 * is a complete vocabulary: the observation already settles the fact, or both answers lead to the
 * same action. Those are the only two reasons a clarification-selecting verifier could have for
 * saying a fact should not have been raised.
 *
 * §211 then found KR-1 unrepresentable and the product owner authorized R-B, which widened the remit
 * to the semantic validity of the fact itself. Under THAT remit the same two members are no longer
 * complete, and closing the enum at two would make a property-identity challenge structurally
 * impossible rather than merely unnamed -- a strictly worse position than the open free-text
 * `challengeReason` field the contract has today.
 *
 * So this is a decision about a changed premise, not a correction of §201's work. §201 was right on
 * the facts it had.
 */

import {
  CHALLENGE_GROUNDS_212, INHERITED_CHALLENGE_GROUNDS, ADDED_CHALLENGE_GROUND,
} from './expert-212-challenge-vocabulary';

export const C6A_SUCCESSOR_DECISION_212_VERSION =
  'hazlenz.expert.212.c6a-successor-decision.v1' as const;

export const SUBJECT_CANDIDATE = 'C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE' as const;

/** §201's status, quoted to be preserved rather than superseded. */
export const SECTION_201_STATUS_PRESERVED = {
  registry: 'backend/scripts/lib/expert-201-verifier-vnext-candidates.ts',
  build: 'PROTOTYPED',
  rank: 'highest in the registry',
  historicalRecordModified: false,
  scoreRestated: false,
  candidateRescored: false,
  note: '§201 explicitly names no candidate a protocol version, and this record claims none either.',
} as const;

export const DECISION = 'ADOPT_C6A_STRUCTURE_WITH_A_THIRD_GROUND' as const;

export const DECISION_BASIS = {
  whatC6aDoesWell: 'a challenge is the one verifier output whose entire purpose is to be reviewed, '
    + 'and C6a makes it carry the evidence its own stated ground requires. §212 keeps that: the '
    + 'ground is declared, the target fact key is required, and the reason is required.',
  whatChangedSince201: 'the verifier remit. §201 scored C6a against a clarification-selection '
    + 'verifier; §212 R-B widens the remit to the semantic validity of the proposed fact.',
  whyTwoMembersIsNowInsufficient: 'neither inherited ground can express that the named property is '
    + 'the evidence used to establish the real property. Under a two-member closed enum that '
    + 'finding becomes unrepresentable, where today it can at least be written in free text — so '
    + 'adopting C6a unchanged would move KR-1 backwards.',
  whatIsAddedAndWhyItIsTheSmallestChange: 'one ground, and one two-member subcase beneath it. No '
    + 'existing member is renamed, reworded or removed, so a C6a-shaped verdict remains valid '
    + 'under the successor vocabulary.',
} as const;

/** The two inherited members survive unchanged. Asserted by the suite against §201's own literals. */
export const INHERITED_MEMBERS_UNCHANGED = {
  inherited: [...INHERITED_CHALLENGE_GROUNDS],
  added: [ADDED_CHALLENGE_GROUND],
  total: CHALLENGE_GROUNDS_212.length,
  anyInheritedMemberRenamed: false,
  anyInheritedMemberRemoved: false,
} as const;

/**
 * The part of C6a §212 does NOT adopt, recorded so the difference is explicit rather than implied.
 *
 * C6a also requires a `challengeObservationSpan` for the establishes-ground and a
 * `commonActionUnderBothBranches` for the same-action ground. Both are good and both are OUT OF
 * SCOPE here: §212's authorization is bounded to the property-identity gap, and adding two more
 * conditional fields would widen a slice that was asked to stay small. They remain available as
 * §201 prototyped them.
 */
export const C6A_PARTS_NOT_ADOPTED_HERE: readonly { part: string; reason: string }[] = [
  {
    part: 'challengeObservationSpan',
    reason: 'evidence for the ALREADY_ESTABLISHES ground. Good, and outside the bounded §212 gap.',
  },
  {
    part: 'commonActionUnderBothBranches',
    reason: 'evidence for the SAME_ACTION ground. Good, and outside the bounded §212 gap.',
  },
];

export const HISTORY_REWRITTEN = false as const;
