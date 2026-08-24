/**
 * Provider abstraction for HazLenz Level-3 semantic reasoning.
 *
 * PROVIDER-NEUTRAL BY CONSTRUCTION. This file names no vendor, no model, no endpoint and no
 * credential, and imports nothing outside the reasoning contract. Transport belongs behind this
 * interface; the validator never sees a provider.
 *
 * No provider is selected and no inference is performed at L3-1. Selection is an L3-2 decision.
 */
import type { ReasoningInput, ReasoningProposal } from './reasoning-contract.types';

export const REASONING_PROVIDER_FAILURES = [
  'TIMEOUT',
  'UNAVAILABLE',
  'MALFORMED_STRUCTURED_OUTPUT',
  'PROVIDER_REFUSAL',
  'TRANSIENT_ERROR',
  'PERMANENT_CONFIGURATION_ERROR',
] as const;
export type ReasoningProviderFailureKind = (typeof REASONING_PROVIDER_FAILURES)[number];

/** Failure categories that a bounded single retry may address. */
export const RETRYABLE_PROVIDER_FAILURES: readonly ReasoningProviderFailureKind[] = [
  'TIMEOUT', 'TRANSIENT_ERROR', 'MALFORMED_STRUCTURED_OUTPUT',
];

export interface ReasoningProviderFailure {
  ok: false;
  kind: ReasoningProviderFailureKind;
  /** Operator-facing detail. Never rendered to a customer as an analysis result. */
  detail: string;
}

export interface ReasoningProviderSuccess {
  ok: true;
  proposal: ReasoningProposal;
}

export type ReasoningProviderResult = ReasoningProviderSuccess | ReasoningProviderFailure;

/**
 * The single operation L3-2 must implement. A provider returns a PROPOSAL; it can never return a
 * customer finding, because the type does not exist here (L3-INV-08).
 */
export interface HazLenzReasoningProvider {
  readonly providerId: string;
  analyzeObservation(input: ReasoningInput): Promise<ReasoningProviderResult>;
}

export function isRetryableProviderFailure(kind: ReasoningProviderFailureKind): boolean {
  return RETRYABLE_PROVIDER_FAILURES.includes(kind);
}
