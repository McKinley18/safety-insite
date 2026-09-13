/**
 * §261 — THE DETERMINISTIC CONFIRMATION-REQUIRED RULE, frozen by §260 section 8.
 *
 * WHAT THIS IS. Pure server logic that answers one question about an ADMITTED Expert analysis:
 * must a human settle the operational classification before the analysis's consequential
 * conclusion becomes authoritative? It reads ONLY closed-vocabulary structured fields. It reads no
 * prose, asks no model, and consults nothing outside the posture object handed to it.
 *
 * WHY IT IS A PURE FUNCTION AND NOT A METHOD. The §255 boundary it enforces is a product
 * invariant, so it must be testable without a database, a provider, a request or a user. Every
 * §261 confirmation test drives this function directly.
 *
 * THE RULE, VERBATIM FROM THE FROZEN DESIGN. Confirmation is REQUIRED when the admitted posture's
 * `requiredBy` contains EITHER
 *
 *   (a) an entry whose `driverRole` is UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION — the analysis
 *       claims an unresolved fact controls whether work continues; OR
 *
 *   (b) an entry whose `driverRole` is UNRESOLVED_RESPONSE_OR_FOLLOW_UP WHILE
 *       POSTURE_PERMITS_CONTINUED_WORK[posture] is true — the analysis classified an unresolved
 *       fact as non-controlling and work continues on that basis.
 *
 * BOTH DIRECTIONS ARE DELIBERATE, AND NARROWING THE RULE TO ONE OF THEM IS PROHIBITED. Branch (a)
 * catches OVER-restriction, which is the only direction §254 observed. Branch (b) catches
 * UNDER-restriction, which §254 did not observe, which nothing excludes, and which is the
 * dangerous direction: an analysis that files a genuinely continuation-controlling unknown as
 * routine follow-up lets work proceed on an unexamined assumption. A rule fitted only to the
 * observed failure would be a rule fitted to a sample of six.
 *
 * AN ESTABLISHED-CONDITION DRIVER ALONE NEVER TRIGGERS CONFIRMATION. §255 bounded the
 * continuation-controlling versus follow-up distinction, not the assessment of established
 * conditions. Making every posture confirmable would convert a bounded human-authority boundary
 * into blanket distrust of the layer, which is a different product and a worse one.
 *
 * PERMISSIVENESS IS READ FROM THE FROZEN TOTAL MAP, NEVER INFERRED. POSTURE_PERMITS_CONTINUED_WORK
 * is imported from the §233 contract and is total over the four postures. This module does not
 * restate it, does not derive it from the posture's name, and does not read `whatHappensNow`.
 *
 * WHAT THIS RULE CONSUMES FROM C2, AND WHAT IT DOES NOT TOUCH. The C2 admission invariant
 * NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER guarantees that an admitted
 * non-permitting posture carries at least one driver from DECISION_CONTROLLING_ROLES_239. This
 * rule consumes that STRUCTURAL CONSEQUENCE — it may assume a non-permitting admitted posture is
 * not silent about what drives it — and it neither reimplements, weakens nor replaces the
 * invariant. Admission remains the only authority on whether an output is admissible at all.
 */
import {
  POSTURE_FIELD, POSTURE_PERMITS_CONTINUED_WORK, IMMEDIATE_SAFETY_POSTURES_233,
  POSTURE_REF_KINDS_233, type ImmediateSafetyPosture233,
} from '../expert-hazlenz/contract/expert-233-posture-contract';
import {
  POSTURE_DRIVER_ROLES_239, DECISION_CONTROLLING_ROLES_239, type PostureDriverRole239,
} from '../expert-hazlenz/contract/expert-239-posture-contract';

/**
 * THE RULE'S OWN IDENTITY, PERSISTED WITH EVERY FLAG IT PRODUCES.
 *
 * A stored confirmation flag is only auditable if a future reader can establish WHICH rule
 * produced it. Without this, a later widening or narrowing of the rule would silently reinterpret
 * every historical flag, and no one could tell what an earlier reviewer was actually asked.
 * Bump this whenever the decision the rule makes changes; never for a comment.
 */
export const CONFIRMATION_RULE_VERSION =
  'hazlenz.expert.confirmation-required.261-unresolved-classification-boundary' as const;

/** Branch (a). The analysis claims an unresolved fact controls whether work continues. */
export const CONFIRMATION_TRIGGER_ROLE_CONTROLLING =
  'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION' as const;

/** Branch (b). The analysis classified an unresolved fact as non-controlling follow-up. */
export const CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP =
  'UNRESOLVED_RESPONSE_OR_FOLLOW_UP' as const;

/**
 * Why a determination failed closed. Each member names a STRUCTURAL impossibility that the §252
 * admission layer should already have refused, so reaching one is a defect signal and not a
 * routine outcome. The codes are distinct so a failure can be diagnosed without re-reading the
 * output that caused it.
 */
export const CONFIRMATION_FAIL_CLOSED_CODES = [
  'POSTURE_ABSENT',
  'POSTURE_NOT_AN_OBJECT',
  'POSTURE_VALUE_NOT_IN_CLOSED_VOCABULARY',
  'REQUIRED_BY_NOT_AN_ARRAY',
  'REQUIRED_BY_ENTRY_NOT_AN_OBJECT',
  'DRIVER_ROLE_NOT_IN_CLOSED_VOCABULARY',
  'REF_KIND_NOT_IN_CLOSED_VOCABULARY',
] as const;
export type ConfirmationFailClosedCode = (typeof CONFIRMATION_FAIL_CLOSED_CODES)[number];

/** Which branch of the frozen rule fired on one entry. Recorded so the subject is reconstructible. */
export type ConfirmationTriggerBranch = 'A_CONTROLLING_CLAIM' | 'B_FOLLOW_UP_WHILE_PERMITTING';

/**
 * ONE TRIGGERING ENTRY, IDENTIFIED STRUCTURALLY.
 *
 * `refKind:ref` is the confirmation subject's key (§260 section 9) and is carried as the pair the
 * model emitted, never resolved to prose. A confirmation prompt built in a later slice binds to
 * exactly these entries.
 */
export interface ConfirmationTrigger {
  readonly refKind: string;
  readonly ref: string;
  readonly driverRole: PostureDriverRole239;
  readonly branch: ConfirmationTriggerBranch;
}

export interface ConfirmationDetermination {
  readonly ruleVersion: typeof CONFIRMATION_RULE_VERSION;
  readonly confirmationRequired: boolean;
  /**
   * TRUE means the rule could not read the structure it was given and required confirmation
   * because it could not establish that none was needed. Never conflated with a substantive
   * determination: a failed-closed TRUE and a branch-(a) TRUE mean different things to a reviewer
   * and to anyone diagnosing the pipeline.
   */
  readonly failedClosed: boolean;
  readonly failClosedCode: ConfirmationFailClosedCode | null;
  /** The posture actually read, or NULL when it could not be read from the closed vocabulary. */
  readonly posture: ImmediateSafetyPosture233 | null;
  /** Read from the frozen total map. NULL only when the posture itself could not be read. */
  readonly posturePermitsContinuedWork: boolean | null;
  /** Empty when confirmation is not required, or when the determination failed closed. */
  readonly triggers: readonly ConfirmationTrigger[];
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const failClosed = (
  code: ConfirmationFailClosedCode,
  posture: ImmediateSafetyPosture233 | null,
): ConfirmationDetermination => ({
  ruleVersion: CONFIRMATION_RULE_VERSION,
  confirmationRequired: true,
  failedClosed: true,
  failClosedCode: code,
  posture,
  posturePermitsContinuedWork: posture === null ? null : POSTURE_PERMITS_CONTINUED_WORK[posture],
  triggers: [],
});

/**
 * THE RULE. Accepts the admitted analysis's posture object — the value the §239 posture projection
 * returned, which is the same object shape the provider emitted under `immediateSafetyPosture`.
 *
 * FAIL-CLOSED IS DIRECTED, NOT DEFENSIVE HABIT. §261 requires that an impossible or unknown
 * structured state require confirmation rather than be guessed. The alternative — treating an
 * unreadable posture as "no confirmation needed" — would let a malformed output present as a
 * settled conclusion, which is the one outcome §260 section 12 names as the worst the product
 * could produce. Failing closed here costs a human one confirmation; failing open costs the
 * guarantee.
 */
export function deriveConfirmationRequired(posture: unknown): ConfirmationDetermination {
  if (posture === null || posture === undefined) return failClosed('POSTURE_ABSENT', null);
  if (!isRecord(posture)) return failClosed('POSTURE_NOT_AN_OBJECT', null);

  const postureValue = posture.posture;
  if (typeof postureValue !== 'string'
    || !(IMMEDIATE_SAFETY_POSTURES_233 as readonly string[]).includes(postureValue)) {
    return failClosed('POSTURE_VALUE_NOT_IN_CLOSED_VOCABULARY', null);
  }
  const resolved = postureValue as ImmediateSafetyPosture233;
  const permits = POSTURE_PERMITS_CONTINUED_WORK[resolved];

  const requiredBy = posture.requiredBy;
  if (!Array.isArray(requiredBy)) return failClosed('REQUIRED_BY_NOT_AN_ARRAY', resolved);

  const triggers: ConfirmationTrigger[] = [];
  for (const entry of requiredBy) {
    if (!isRecord(entry)) return failClosed('REQUIRED_BY_ENTRY_NOT_AN_OBJECT', resolved);

    const role = entry.driverRole;
    if (typeof role !== 'string'
      || !(POSTURE_DRIVER_ROLES_239 as readonly string[]).includes(role)) {
      return failClosed('DRIVER_ROLE_NOT_IN_CLOSED_VOCABULARY', resolved);
    }
    const refKind = entry.refKind;
    if (typeof refKind !== 'string'
      || !(POSTURE_REF_KINDS_233 as readonly string[]).includes(refKind)) {
      return failClosed('REF_KIND_NOT_IN_CLOSED_VOCABULARY', resolved);
    }
    const ref = typeof entry.ref === 'string' ? entry.ref : '';

    const driverRole = role as PostureDriverRole239;
    if (driverRole === CONFIRMATION_TRIGGER_ROLE_CONTROLLING) {
      triggers.push({ refKind, ref, driverRole, branch: 'A_CONTROLLING_CLAIM' });
    } else if (driverRole === CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP && permits) {
      triggers.push({ refKind, ref, driverRole, branch: 'B_FOLLOW_UP_WHILE_PERMITTING' });
    }
  }

  return {
    ruleVersion: CONFIRMATION_RULE_VERSION,
    confirmationRequired: triggers.length > 0,
    failedClosed: false,
    failClosedCode: null,
    posture: resolved,
    posturePermitsContinuedWork: permits,
    triggers,
  };
}

/** Convenience for a caller holding the whole admitted analysis rather than its posture. */
export function deriveConfirmationRequiredFromAnalysis(
  analysis: unknown,
): ConfirmationDetermination {
  if (!isRecord(analysis)) return failClosed('POSTURE_ABSENT', null);
  return deriveConfirmationRequired(analysis[POSTURE_FIELD]);
}

// ================================================================ load-time construction guards

/**
 * THE MAP MUST BE TOTAL, AND THE TRIGGER ROLES MUST BE REAL MEMBERS.
 *
 * Asserted at load rather than in a test, so a contract edit that removes a posture or renames a
 * driver role cannot ship a rule that silently reads `undefined` as falsy — which would turn
 * branch (b) off for the renamed posture and leave every other test passing.
 */
function assertConfirmationRuleVocabulary261(): void {
  for (const posture of IMMEDIATE_SAFETY_POSTURES_233) {
    if (typeof POSTURE_PERMITS_CONTINUED_WORK[posture] !== 'boolean') {
      throw new Error('CONFIRMATION_RULE_261_ABORT: POSTURE_PERMITS_CONTINUED_WORK is not total '
        + `over the closed posture vocabulary; ${posture} is missing`);
    }
  }
  const roles = POSTURE_DRIVER_ROLES_239 as readonly string[];
  for (const role of [CONFIRMATION_TRIGGER_ROLE_CONTROLLING, CONFIRMATION_TRIGGER_ROLE_FOLLOW_UP]) {
    if (!roles.includes(role)) {
      throw new Error(`CONFIRMATION_RULE_261_ABORT: trigger role ${role} is not a member of `
        + 'POSTURE_DRIVER_ROLES_239; the contract drifted under the rule');
    }
  }
  // The C2 consequence this rule consumes: branch (a)'s role must still be a decision-controlling
  // role. If it stopped being one, the rule would be consuming a guarantee that no longer exists.
  if (!(DECISION_CONTROLLING_ROLES_239 as readonly string[])
    .includes(CONFIRMATION_TRIGGER_ROLE_CONTROLLING)) {
    throw new Error('CONFIRMATION_RULE_261_ABORT: '
      + `${CONFIRMATION_TRIGGER_ROLE_CONTROLLING} is no longer a decision-controlling role; `
      + 'the C2 consequence branch (a) consumes has changed');
  }
}
assertConfirmationRuleVocabulary261();
