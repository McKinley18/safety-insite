/**
 * EXPERT HAZLENZ -- the provider abstraction and the failure taxonomy.
 *
 * PROVIDER-NEUTRAL BY CONSTRUCTION. This file names no vendor, no model, no endpoint, no header and
 * no credential, and it imports nothing but the Expert contract. That is a Phase-8 requirement and
 * also the lesson the L3 programme paid for: `l32h`/`l32o` compared Anthropic, Gemini and a local
 * qwen/Ollama shim, and the comparison was only possible because the core never learned any of
 * their response shapes. Adapters translate; the core does not.
 *
 * ==================== FAIL OPEN FOR AVAILABILITY, FAIL CLOSED FOR AUTHORITY ====================
 *
 * Both halves, stated together because either alone is wrong:
 *
 *   FAIL OPEN  -- the inspection still works, deterministic HazLenz still works, governed standards
 *                 still work, the customer continues. Expert being down is not an outage.
 *   FAIL CLOSED -- no fake Expert response is synthesized, no stale response is substituted, no
 *                 lexical result is relabelled as Expert reasoning, and the failure is observable.
 *
 * There is deliberately no `ExpertProviderResult` member meaning "degraded but usable". A caller
 * that wants the deterministic result asks the deterministic engine for it and must not describe it
 * as Expert analysis.
 *
 * ==================== THE HISTORICAL FAILURE THIS TAXONOMY REMEMBERS ====================
 *
 * `PROVIDER_NOT_CALLABLE` exists because it happened. The L3 provider-readiness gate recorded a
 * provider that could not be reached at all -- credentials provisioned, shim written, and the call
 * still did not execute. It is a distinct member rather than a flavour of `UNAVAILABLE` because the
 * operational response is different: an unavailable provider is retried later, a non-callable one
 * means the integration is wrong and retrying accomplishes nothing.
 *
 * `UNEXPECTED_MODEL_IDENTITY` is likewise its own member. A provider that answers as a different
 * model than the one qualified has invalidated the qualification, and silently accepting the answer
 * would make every subsequent evaluation unattributable.
 */

import type { ExpertAnalysisInput } from './expert-contract.types';

export const EXPERT_PROVIDER_FAILURES = [
  'TIMEOUT',
  'NETWORK_ERROR',
  'HTTP_CLIENT_ERROR',
  'HTTP_SERVER_ERROR',
  'RATE_LIMITED',
  'CREDITS_EXHAUSTED',
  'MALFORMED_JSON',
  'SCHEMA_INVALID_STRUCTURED_OUTPUT',
  'EMPTY_RESPONSE',
  'TRUNCATED_RESPONSE',
  'PROVIDER_REFUSAL',
  'UNEXPECTED_MODEL_IDENTITY',
  'PROVIDER_NOT_CALLABLE',
  'NOT_CONFIGURED',
] as const;
export type ExpertProviderFailureKind = (typeof EXPERT_PROVIDER_FAILURES)[number];

/**
 * Failures a single bounded retry may address, because the same request could plausibly succeed.
 *
 * `TRUNCATED_RESPONSE` is here and `PROVIDER_REFUSAL` is not: a truncation is a transport accident,
 * a refusal is a decision the provider made and asking again is asking it to change its mind.
 * `CREDITS_EXHAUSTED` and `PROVIDER_NOT_CALLABLE` are configuration facts -- retrying spends
 * latency to reach the same answer.
 */
export const RETRYABLE_EXPERT_FAILURES: readonly ExpertProviderFailureKind[] = [
  'TIMEOUT', 'NETWORK_ERROR', 'HTTP_SERVER_ERROR', 'MALFORMED_JSON', 'TRUNCATED_RESPONSE',
  'EMPTY_RESPONSE',
];

export function isRetryableExpertFailure(kind: ExpertProviderFailureKind): boolean {
  return RETRYABLE_EXPERT_FAILURES.includes(kind);
}

/**
 * What ONE provider request cost, reported by the adapter that made it. §135 (R2/R3).
 *
 * Attached to BOTH success and failure, because a request that failed after generation was still
 * billed. A truncated or malformed response is the clearest case: the tokens were produced and
 * charged, and the run's accounting must see them even though the logical call is later retried.
 *
 * Every field is nullable because not every transport reports usage, and a null must stay a null:
 * substituting an estimate here would put a guess into `M16_COST_PER_ROW`, whose frozen contract
 * says cost is "reported per run, never estimated".
 */
export interface ExpertRequestUsage {
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number | null;
  latencyMs: number | null;
  httpStatus: number | null;
  /** What the provider said it was, for this individual request. */
  modelIdentity: string | null;
}

export interface ExpertProviderFailure {
  ok: false;
  kind: ExpertProviderFailureKind;
  /** Operator-facing. Never rendered to a customer as an analysis result. */
  detail: string;
  /** Present when the transport produced one. Kept out of business logic on purpose. */
  httpStatus?: number;
  /** Present when the request billed. A failure is not the same as a free request. */
  usage?: ExpertRequestUsage;
}

export interface ExpertProviderSuccess {
  ok: true;
  /**
   * RAW provider output, deliberately typed `unknown`.
   *
   * A provider adapter may not hand back an `ExpertAnalysis`, because that type asserts validation
   * has happened. `unknown` forces the result through `normalizeExpertOutput` -- the boundary is
   * enforced by the type system rather than by a convention someone can forget.
   */
  raw: unknown;
  /** What the provider says it is. Compared against the qualified identity by the runner. */
  modelIdentity: string | null;
  /** What this individual request cost. See `ExpertRequestUsage`. */
  usage?: ExpertRequestUsage;
}

export type ExpertProviderResult = ExpertProviderSuccess | ExpertProviderFailure;

/**
 * The single operation an Expert provider implements.
 *
 * A provider can never return a customer finding, an authoritative hazard, a citation or a release
 * id -- not because it is forbidden to, but because none of those types are reachable from here.
 */
export interface ExpertProvider {
  readonly providerId: string;
  /** The model this provider was qualified as. `null` means identity is not checked. */
  readonly qualifiedModelIdentity: string | null;
  analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult>;
}

/**
 * The only provider that exists at this phase: one that performs no inference and always reports
 * `NOT_CONFIGURED`.
 *
 * It exists so the interface can be exercised without a provider call, and so nothing is tempted to
 * wire the deterministic lexical engine in behind this interface and call it Expert reasoning. It
 * synthesizes nothing and is not registered with the customer path.
 */
export class UnavailableExpertProvider implements ExpertProvider {
  readonly providerId = 'expert-unavailable-no-inference';
  readonly qualifiedModelIdentity = null;

  async analyze(_input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    return {
      ok: false,
      kind: 'NOT_CONFIGURED',
      detail: 'No Expert HazLenz provider is configured. This phase performs no inference.',
    };
  }
}
