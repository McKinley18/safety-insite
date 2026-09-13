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
  type ExpertRequestUsage,
} from './expert-provider';
import type { ExpertAnalysisInput, ExpertTrace } from './expert-contract.types';
import { normalizeExpertOutput, type ExpertNormalizationIssue } from './expert-normalization';
import type { ExpertLayerInput } from './expert-authority-merge';

/**
 * One PROVIDER REQUEST, recorded immutably. §135 (R3).
 *
 * The retry replaces the RESPONSE the logical call uses. It must not erase the evidence that the
 * first request happened: that request reached the provider, may have billed, and its failure kind
 * is the only observation of how often the permanent path actually needs a retry. Before this
 * existed, `trace.attempts` was a bare integer and the harness discarded even that, so
 * `M13_PROVIDER_CALLABILITY` -- whose frozen denominator is "All attempted calls, every row, every
 * repetition, retries included" -- could not be computed as specified.
 */
export interface ExpertAttemptRecord {
  /** 0-based. Index 1 is by definition a retry, because the ceiling is one. */
  attemptIndex: number;
  isRetry: boolean;
  ok: boolean;
  failureKind: ExpertProviderFailureKind | null;
  detail: string | null;
  /** What the provider said it was, on THIS request. */
  modelIdentity: string | null;
  /** Set on the attempt that CAUSED a retry, so the cause survives the replacement. */
  causedRetry: ExpertProviderFailureKind | null;
  usage: ExpertRequestUsage | null;
}

export interface ExpertRunResult {
  /** Exactly what `mergeExpertIntelligence` consumes. */
  layer: ExpertLayerInput;
  /** Present when the provider failed. */
  failure: { kind: ExpertProviderFailureKind; detail: string } | null;
  /** Present when the boundary ran. Item-level issues appear even on a PRESENT layer. */
  issues: ExpertNormalizationIssue[];
  trace: ExpertTrace;
  /** EVERY provider request this logical call issued, in order. Never fewer than one. */
  attempts: ExpertAttemptRecord[];
  /**
   * Set when a retry was EARNED but not issued because a budget refused it.
   *
   * The first attempt's real outcome is preserved and returned unchanged. Nothing is fabricated
   * into a success, and the suppression is visible rather than looking like a non-retryable failure.
   */
  retrySuppressed: { cause: ExpertProviderFailureKind; reason: string } | null;
}

export interface ExpertRunOptions {
  /**
   * Injected so a run is reproducible in replay. The harness passes a fixed instant; production
   * would pass the real one. A validator that read the clock itself could not be replayed.
   */
  nowIso: string;
  /** Injected for the same reason: elapsed time must not vary between identical replays. */
  elapsedMs?: number;
  /**
   * Consulted BEFORE a retry request is issued. §135 (R1).
   *
   * ABSENT MEANS UNBOUNDED, which is the production default and leaves customer-path behaviour
   * exactly as it was. The formal harness passes a gate that consults the frozen request ceiling,
   * the global retry budget and the spend ceiling, so no formal retry can be issued outside them.
   *
   * The INITIAL request is not gated here: the harness owns the request counter and checks before
   * it invokes this function at all. Between the two, every provider request in a formal run passes
   * a check before it is issued.
   */
  mayIssueRetry?: () => { allowed: boolean; reason: string };
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
  const attemptRecords: ExpertAttemptRecord[] = [];
  let retrySuppressed: ExpertRunResult['retrySuppressed'] = null;
  const trace = (): ExpertTrace => ({
    providerId: provider.providerId,
    providerModelIdentity: null,
    attempts,
    totalMs: options.elapsedMs ?? 0,
  });

  const record = (r: ExpertProviderResult, attemptIndex: number): void => {
    attemptRecords.push({
      attemptIndex,
      isRetry: attemptIndex > 0,
      ok: r.ok,
      failureKind: r.ok ? null : r.kind,
      detail: r.ok ? null : r.detail,
      modelIdentity: r.ok ? r.modelIdentity : (r.usage?.modelIdentity ?? null),
      causedRetry: null,
      usage: r.usage ?? null,
    });
  };

  let result = await callOnce(provider, input);
  attempts += 1;
  record(result, 0);

  if (!result.ok && isRetryableExpertFailure(result.kind)) {
    const cause = result.kind;
    const gate = options.mayIssueRetry?.() ?? { allowed: true, reason: '' };
    // The cause is stamped on attempt 0 whether or not the retry is issued, so a suppressed retry
    // and a taken one leave the same evidence about WHY one was earned.
    attemptRecords[0].causedRetry = cause;
    if (gate.allowed) {
      result = await callOnce(provider, input);
      attempts += 1;
      record(result, 1);
    } else {
      // The first attempt's real outcome stands. Nothing is fabricated into a success.
      retrySuppressed = { cause, reason: gate.reason };
    }
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
      attempts: attemptRecords,
      retrySuppressed,
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
      attempts: attemptRecords,
      retrySuppressed,
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
      attempts: attemptRecords,
      retrySuppressed,
    };
  }

  return {
    layer: { status: 'PRESENT', validated: normalized.validated, detail: null },
    failure: null,
    issues: normalized.issues,
    trace: { ...trace(), providerModelIdentity: result.modelIdentity },
    attempts: attemptRecords,
    retrySuppressed,
  };
}
