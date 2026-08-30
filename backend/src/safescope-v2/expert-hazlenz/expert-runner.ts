/**
 * EXPERT HAZLENZ -- the run sequence, off the customer request path.
 *
 * THE ORDER IS THE SAFETY PROPERTY, and it is the only thing this file contributes:
 *
 *      provider  ->  model-identity check  ->  normalization boundary  ->  ExpertLayerInput
 *
 * Nothing may skip a stage. A provider result is raw `unknown`; a normalized analysis is still only
 * advisory; and what leaves here is an `ExpertLayerInput` for `expert-authority-merge.ts`, which is
 * the sole thing that may place it beside protected authority.
 *
 * ==================== THIS FUNCTION DOES NOT THROW ====================
 *
 * Every failure -- transport, timeout, refusal, malformed JSON, schema violation, wrong model --
 * becomes a returned status. An exception would propagate into the customer request and turn an
 * Expert outage into an inspection outage, which is exactly the fail-open half of the contract
 * inverted. A provider that throws is caught and classified as `NETWORK_ERROR` unless it is an
 * abort, which is `TIMEOUT`.
 *
 * ==================== RETRY CEILING IS ONE ====================
 *
 * Inherited from L3, for the same reason: a provider that produced output the boundary REJECTED is
 * never asked again for the same observation. Only a transport-shaped failure earns the retry, and
 * a rejected normalization never does -- asking a model to re-answer a question it just answered
 * unsafely is how a validator gets talked out of a refusal.
 *
 * ==================== NO CACHE, DELIBERATELY ====================
 *
 * There is no stale-response substitution here and no place to add one by accident. The
 * authorization allows a cache only under a future explicit contract; until that contract exists, a
 * missing Expert answer is reported missing.
 */

import {
  isRetryableExpertFailure,
  type ExpertProvider, type ExpertProviderFailureKind, type ExpertProviderResult,
} from './expert-provider';
import type { ExpertAnalysisInput, ExpertTrace } from './expert-contract.types';
import { normalizeExpertOutput, type ExpertNormalizationIssue } from './expert-normalization';
import type { ExpertLayerInput } from './expert-authority-merge';

export interface ExpertRunResult {
  /** Exactly what `mergeExpertIntelligence` consumes. */
  layer: ExpertLayerInput;
  /** Present when the provider failed. */
  failure: { kind: ExpertProviderFailureKind; detail: string } | null;
  /** Present when the boundary ran. Item-level issues appear even on a PRESENT layer. */
  issues: ExpertNormalizationIssue[];
  trace: ExpertTrace;
}

export interface ExpertRunOptions {
  /**
   * Injected so a run is reproducible in replay. The harness passes a fixed instant; production
   * would pass the real one. A validator that read the clock itself could not be replayed.
   */
  nowIso: string;
  /** Injected for the same reason: elapsed time must not vary between identical replays. */
  elapsedMs?: number;
}

/** Classify a thrown transport error without letting it escape. */
function classifyThrown(error: unknown): { kind: ExpertProviderFailureKind; detail: string } {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : '';
  if (name === 'AbortError' || /timeout|timed out/i.test(message)) {
    return { kind: 'TIMEOUT', detail: message };
  }
  return { kind: 'NETWORK_ERROR', detail: message };
}

async function callOnce(provider: ExpertProvider, input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
  try {
    return await provider.analyze(input);
  } catch (error) {
    const { kind, detail } = classifyThrown(error);
    return { ok: false, kind, detail };
  }
}

export async function runExpertAnalysis(
  provider: ExpertProvider, input: ExpertAnalysisInput, options: ExpertRunOptions,
): Promise<ExpertRunResult> {
  let attempts = 0;
  const trace = (): ExpertTrace => ({
    providerId: provider.providerId,
    providerModelIdentity: null,
    attempts,
    totalMs: options.elapsedMs ?? 0,
  });

  let result = await callOnce(provider, input);
  attempts += 1;

  if (!result.ok && isRetryableExpertFailure(result.kind)) {
    result = await callOnce(provider, input);
    attempts += 1;
  }

  if (!result.ok) {
    // FAIL OPEN for availability: the caller merges an empty advisory block and the inspection
    // continues. FAIL CLOSED for authority: nothing is synthesized to stand in for the answer.
    const status = result.kind === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'PROVIDER_FAILED';
    return {
      layer: { status, validated: null, detail: `${result.kind}: ${result.detail}` },
      failure: { kind: result.kind, detail: result.detail },
      issues: [],
      trace: trace(),
    };
  }

  // A provider that answers as a model other than the one it was qualified as has invalidated the
  // qualification. Accepting the answer would make the evaluation unattributable, so it is refused
  // BEFORE the boundary rather than scored as if it came from the qualified model.
  if (provider.qualifiedModelIdentity !== null
      && result.modelIdentity !== provider.qualifiedModelIdentity) {
    const detail = `expected ${provider.qualifiedModelIdentity}, got ${String(result.modelIdentity)}`;
    return {
      layer: { status: 'PROVIDER_FAILED', validated: null, detail: `UNEXPECTED_MODEL_IDENTITY: ${detail}` },
      failure: { kind: 'UNEXPECTED_MODEL_IDENTITY', detail },
      issues: [],
      trace: { ...trace(), providerModelIdentity: result.modelIdentity },
    };
  }

  const normalized = normalizeExpertOutput(result.raw, input, options.nowIso);

  if (normalized.state !== 'VALID' || !normalized.validated) {
    // REJECTED is NOT retried. See the header.
    return {
      layer: {
        status: 'OUTPUT_REJECTED',
        validated: null,
        detail: normalized.issues.map(i => i.code).join(','),
      },
      failure: null,
      issues: normalized.issues,
      trace: { ...trace(), providerModelIdentity: result.modelIdentity },
    };
  }

  return {
    layer: { status: 'PRESENT', validated: normalized.validated, detail: null },
    failure: null,
    issues: normalized.issues,
    trace: { ...trace(), providerModelIdentity: result.modelIdentity },
  };
}
