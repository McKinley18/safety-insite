/**
 * The safe-failure contract: the closed set of outcomes future orchestration may observe.
 *
 * L3-INV-05 / L3-INV-10. No member of this union carries a hazard conclusion derived from anything
 * other than a validated proposal, and there is deliberately no member meaning "fell back to the
 * lexical engine and succeeded". A caller that wants the Level-1 result must ask the Level-1 engine
 * for it explicitly and must not describe it as Level-3 analysis.
 */
import type { ReasoningProviderFailureKind } from './hazlenz-reasoning-provider';
import type { L3ValidationIssue } from './validation-result.types';
import type { ValidatedReasoning } from './validated-reasoning.types';

export type L3ReasoningOutcome =
  | { kind: 'VALIDATED'; reasoning: ValidatedReasoning }
  | { kind: 'NO_HAZARD_ESTABLISHED'; reasoning: ValidatedReasoning }
  | { kind: 'INSUFFICIENT_EVIDENCE'; reasoning: ValidatedReasoning }
  | { kind: 'PROVIDER_UNAVAILABLE'; failure: ReasoningProviderFailureKind; detail: string }
  | { kind: 'PROVIDER_TIMEOUT'; detail: string }
  | { kind: 'MALFORMED_OUTPUT'; detail: string }
  | { kind: 'REJECTED_OUTPUT'; issues: L3ValidationIssue[] };

/**
 * True only where a hazard conclusion is available AND was validated. Every infrastructure failure
 * answers false, which is what makes "failure cannot become ACTIVE" checkable rather than asserted.
 */
export function carriesHazardConclusion(outcome: L3ReasoningOutcome): boolean {
  return outcome.kind === 'VALIDATED';
}

/** Outcomes the customer must be told did not produce an analysis (never a degraded stand-in). */
export function isInfrastructureFailure(outcome: L3ReasoningOutcome): boolean {
  return outcome.kind === 'PROVIDER_UNAVAILABLE'
    || outcome.kind === 'PROVIDER_TIMEOUT'
    || outcome.kind === 'MALFORMED_OUTPUT'
    || outcome.kind === 'REJECTED_OUTPUT';
}
