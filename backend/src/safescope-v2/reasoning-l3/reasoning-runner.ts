/**
 * L3-2 -- the validation SEQUENCE, off the customer request path.
 *
 * This is the only place the four stages are composed, and the order is the safety property:
 *
 *     provider  ->  deterministic validator  ->  semantic evidence binder  ->  outcome
 *
 * Nothing may skip a stage. A provider result is a proposal; a validated proposal is still not a
 * conclusion until its evidence has been semantically bound; and even then the outcome is
 * comparison evidence, never a customer finding (L3-2 authority rule).
 *
 * RETRY CEILING IS ONE, as L3-1 fixed it. A provider that fabricated evidence is never asked again
 * for the same observation -- `NON_RETRYABLE_VALIDATION_REASONS` decides that, not this file.
 */
import type { HazLenzReasoningProvider, ReasoningProviderResult } from './hazlenz-reasoning-provider';
import { isRetryableProviderFailure } from './hazlenz-reasoning-provider';
import type { ReasoningInput } from './reasoning-contract.types';
import { validateReasoningProposal, type L3ValidationOutcome } from './deterministic-safety-validator';
import { bindEvidenceSemantically, type L3SemanticBindingOutcome } from './semantic-evidence-binding';
import type { L3ReasoningOutcome } from './reasoning-outcome';
import { RETRYABLE_VALIDATION_REASONS } from './validation-result.types';

export interface L3RunResult {
  outcome: L3ReasoningOutcome;
  /** Present when the deterministic validator ran. */
  validation: L3ValidationOutcome | null;
  /** Present only when deterministic validation passed. */
  semantic: L3SemanticBindingOutcome | null;
  attempts: number;
  providerId: string;
  totalMs: number;
}

function outcomeForProviderFailure(result: Extract<ReasoningProviderResult, { ok: false }>): L3ReasoningOutcome {
  switch (result.kind) {
    case 'TIMEOUT': return { kind: 'PROVIDER_TIMEOUT', detail: result.detail };
    case 'MALFORMED_STRUCTURED_OUTPUT': return { kind: 'MALFORMED_OUTPUT', detail: result.detail };
    default: return { kind: 'PROVIDER_UNAVAILABLE', failure: result.kind, detail: result.detail };
  }
}

export async function runValidatedReasoning(
  provider: HazLenzReasoningProvider, input: ReasoningInput,
): Promise<L3RunResult> {
  const started = Date.now();
  let attempts = 0;
  let providerResult: ReasoningProviderResult = await provider.analyzeObservation(input);
  attempts += 1;

  if (!providerResult.ok && isRetryableProviderFailure(providerResult.kind)) {
    providerResult = await provider.analyzeObservation(input);
    attempts += 1;
  }
  if (!providerResult.ok) {
    return {
      outcome: outcomeForProviderFailure(providerResult),
      validation: null, semantic: null, attempts,
      providerId: provider.providerId, totalMs: Date.now() - started,
    };
  }

  let validation = validateReasoningProposal(providerResult.proposal, input);

  // A retryable SHAPE problem earns the one remaining attempt; a fabricated span does not.
  if (validation.state === 'RETRYABLE_MODEL_OUTPUT'
      && attempts === 1
      && validation.issues.every(i => RETRYABLE_VALIDATION_REASONS.includes(i.code))) {
    const second = await provider.analyzeObservation(input);
    attempts += 1;
    if (second.ok) validation = validateReasoningProposal(second.proposal, input);
  }

  if (validation.state !== 'VALID' || !validation.validated) {
    return {
      outcome: { kind: 'REJECTED_OUTPUT', issues: validation.issues },
      validation, semantic: null, attempts,
      providerId: provider.providerId, totalMs: Date.now() - started,
    };
  }

  const semantic = bindEvidenceSemantically(validation.validated, input);

  // Semantic rejection removes the candidate. What remains determines the outcome kind, and an
  // emptied ANALYZED becomes INSUFFICIENT_EVIDENCE rather than a silently weaker hazard claim.
  const bound = { ...validation.validated, hazards: semantic.boundHazards };
  let outcome: L3ReasoningOutcome;
  // L3-2c. A proposal whose every surviving candidate was demoted to INSUFFICIENT_EVIDENCE has not
  // ANALYZED anything -- it has a question. The candidates are kept so the clarification travels;
  // the OUTCOME follows what they now say, which is the same rule the empty case already used.
  const undecided = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
  if (bound.outcome === 'ANALYZED' && semantic.boundHazards.length > 0
      && semantic.boundHazards.every(h => undecided.includes(h.conditionState))
      && semantic.demoted.length > 0) {
    outcome = { kind: 'INSUFFICIENT_EVIDENCE', reasoning: { ...bound, outcome: 'INSUFFICIENT_EVIDENCE' } };
  } else if (bound.outcome === 'ANALYZED' && semantic.boundHazards.length === 0) {
    outcome = { kind: 'INSUFFICIENT_EVIDENCE', reasoning: { ...bound, outcome: 'INSUFFICIENT_EVIDENCE' } };
  } else if (bound.outcome === 'NO_HAZARD_ESTABLISHED') {
    outcome = { kind: 'NO_HAZARD_ESTABLISHED', reasoning: bound };
  } else if (bound.outcome === 'INSUFFICIENT_EVIDENCE') {
    outcome = { kind: 'INSUFFICIENT_EVIDENCE', reasoning: bound };
  } else {
    outcome = { kind: 'VALIDATED', reasoning: bound };
  }

  return {
    outcome, validation, semantic, attempts,
    providerId: provider.providerId, totalMs: Date.now() - started,
  };
}
