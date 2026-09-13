/**
 * §247 -- THE NORMALIZED DECISION-REVIEW MODEL. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY A SHARED MODEL RATHER THAN TWO PACKETS ====================
 *
 * §244 found the property review packet missing six of thirteen information elements and found no
 * evidence-review artifact at all. Three §243 occurrences map exactly onto three of the absences:
 * G3 onto the adjacent established fact that makes an assurance a proxy, C6 onto the open sibling
 * property, C2 onto the missing evidence artifact.
 *
 * The authorization prefers a normalized review model with task-specific projections where that
 * avoids duplicating semantic state. It does. Property review and evidence review need the same
 * target fact, the same authority state and the same sibling context; only the DECISION differs. So
 * the shared context is assembled once here and each surface projects what its own reviewer needs.
 *
 * ==================== THE INVARIANT THIS EXISTS TO SATISFY ====================
 *
 * A HUMAN DECISION MAY COUNT AS CONTAINMENT ONLY IF THE PRODUCT ARTIFACT SURFACES THE INFORMATION
 * NECESSARY TO MAKE THAT DECISION.
 *
 * ==================== WHAT IT MAY NOT DO ====================
 *
 * Every field is COPYING or PROJECTION over state that already exists. Nothing here reads meaning
 * out of prose, and nothing decides whether a difference is material -- `propertyDisagreement`
 * reports that two strings differ, never that the difference matters. Deterministic code may state
 * that a disagreement exists; only a human may judge it.
 *
 * This is deliberately NOT an internal-state dump. There is no candidate list, no declaration array,
 * no projection codes and no raw provider output. Each field is here because a named §243 occurrence
 * demonstrated a reviewer could not answer the question without it.
 */

import type { OwedFact } from './owed-fact.types';

/** A sibling fact in the same analysis. C6: deciding one does not dispose of the other. */
export interface SiblingOpenFact {
  readonly factKey: string;
  readonly proposedProperty: string;
  /** The sibling's own authority state, copied. Never recomputed from this surface. */
  readonly status: string;
}

/** An observation span the first pass already cited on one of its OWN admitted candidates. */
export interface EstablishedContextSpan {
  readonly sourceId: string;
  /** Verbatim. G3: this is where the compactor-1 defeat becomes visible to the reviewer. */
  readonly span: string;
}

/**
 * A literal string comparison between the model's property and the verifier's.
 *
 * `identical` is `===` on the two strings and nothing more. Deterministic code must not decide
 * whether a difference is material; it may state that a difference exists.
 */
export interface PropertyDisagreement {
  readonly modelProperty: string;
  readonly verifierProperty: string | null;
  readonly identical: boolean;
}

/** The one assembled context both review surfaces project from. */
export interface DecisionReviewContext {
  readonly analysisId: string;
  readonly factKey: string;
  readonly proposedProperty: string;
  readonly observationSpan: string;
  readonly establishedContext: readonly EstablishedContextSpan[];
  readonly siblingOpenFacts: readonly SiblingOpenFact[];
  readonly propertyDisagreement: PropertyDisagreement | null;
  readonly propertyAuthorityRequirement: string;
  readonly propertyAuthorityState: string;
  readonly evidenceAuthorityRequirement: string | null;
  readonly evidenceAuthorityState: string | null;
}

export function buildDecisionReviewContext(input: {
  analysisId: string;
  fact: OwedFact;
  proposedProperty: string;
  propertyAuthorityRequirement: string;
  propertyAuthorityState: string;
  evidenceAuthorityRequirement?: string | null;
  evidenceAuthorityState?: string | null;
  /** Spans the first pass cited on its own admitted candidates, EXCLUDING this fact's own span. */
  establishedContext?: readonly EstablishedContextSpan[];
  siblingOpenFacts?: readonly SiblingOpenFact[];
  verifierProperty?: string | null;
}): DecisionReviewContext {
  const own = input.fact.evidenceSpan;
  return {
    analysisId: input.analysisId,
    factKey: input.fact.factKey,
    proposedProperty: input.proposedProperty,
    observationSpan: own,
    // Pure copying, minus the target's own span so the reviewer sees CONTEXT, not a repeat.
    establishedContext: (input.establishedContext ?? []).filter(s => s.span !== own),
    siblingOpenFacts: (input.siblingOpenFacts ?? []).filter(s => s.factKey !== input.fact.factKey),
    propertyDisagreement: input.verifierProperty === undefined ? null : {
      modelProperty: input.proposedProperty,
      verifierProperty: input.verifierProperty,
      identical: input.proposedProperty === input.verifierProperty,
    },
    propertyAuthorityRequirement: input.propertyAuthorityRequirement,
    propertyAuthorityState: input.propertyAuthorityState,
    evidenceAuthorityRequirement: input.evidenceAuthorityRequirement ?? null,
    evidenceAuthorityState: input.evidenceAuthorityState ?? null,
  };
}

// ---------------------------------------------------------------- residual projection

/**
 * What remains true after each available decision.
 *
 * This is a projection of the EXISTING authority transition table, restated as data the reviewer can
 * read before choosing. It grants nothing and changes nothing.
 *
 * The three rows are the authority boundaries the authorization requires preserved:
 * CONFIRM_PROPERTY may establish property authority and leaves the fact unresolved; CORRECT_PROPERTY
 * replaces the property and does NOT itself settle; KEEP_UNRESOLVED changes nothing.
 */
export interface ResidualAfterDecision {
  readonly decision: string;
  readonly propertyAuthorityAfter: string;
  readonly factRemainsUnresolved: boolean;
  readonly consequence: string;
}

export function projectPropertyResidual(
  ctx: DecisionReviewContext, decisions: readonly string[],
): readonly ResidualAfterDecision[] {
  return decisions.map(decision => {
    if (decision === 'CONFIRM_PROPERTY') {
      return {
        decision,
        propertyAuthorityAfter: ctx.propertyAuthorityRequirement === 'REQUIRED'
          ? 'OBTAINED' : ctx.propertyAuthorityState,
        factRemainsUnresolved: true,
        consequence: 'property authority is established by your action. The fact itself is still '
          + 'unresolved, and confirming is not settling it.',
      };
    }
    if (decision === 'CORRECT_PROPERTY') {
      return {
        decision,
        propertyAuthorityAfter: ctx.propertyAuthorityState,
        factRemainsUnresolved: true,
        consequence: 'the property is replaced by the one you write. Correcting does not itself '
          + 'settle the corrected fact, and authority is not granted by the correction.',
      };
    }
    return {
      decision,
      propertyAuthorityAfter: ctx.propertyAuthorityState,
      factRemainsUnresolved: true,
      consequence: 'nothing changes. This is the same outcome as taking no action.',
    };
  });
}

/** What is still open once this review is done, whichever way it goes. C6 made visible. */
export function projectRemainingOpenAfterReview(
  ctx: DecisionReviewContext,
): readonly string[] {
  return [ctx.factKey, ...ctx.siblingOpenFacts.map(s => s.factKey)];
}
