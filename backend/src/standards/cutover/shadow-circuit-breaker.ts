/**
 * KG-4C -- the SHADOW circuit breaker.
 *
 * THE DISTINCTION THIS MODULE EXISTS TO MAKE. KG-4A/KG-4B already guarantee REQUEST-level safety:
 * any single shadow failure degrades that request to legacy and the customer never notices. That is
 * necessary and it is not sufficient. A mechanism that fails safely on every individual request can
 * still be systemically broken -- failing on all of them, or producing wrong comparisons at a rate
 * that makes the whole exercise worthless. Request-level fallback handles ONE bad request; the
 * circuit breaker decides that SHADOW ITSELF should stop.
 *
 * TWO CLASSES OF CONDITION, AND THEY ARE NOT NEGOTIABLE AGAINST EACH OTHER.
 *
 *   HARD INVARIANTS   Threshold ZERO. One occurrence trips the breaker. These are the properties
 *                     the whole programme rests on -- customer invisibility, provenance, privacy,
 *                     integrity, determinism. A "rate" of invariant violations is a category error:
 *                     there is no acceptable number of times the customer payload may change.
 *
 *   RATE CONDITIONS   Threshold non-zero, and every one is derived from a KG-4B measurement below,
 *                     with a minimum sample size. A threshold without a measurement behind it is a
 *                     magic number, and magic numbers get tuned until they stop firing.
 *
 * THE MINIMUM-SAMPLE RULE. No rate condition may trip before its minimum sample is reached. Without
 * it, the first two requests of a run -- one of which failed transiently -- read as a 50% failure
 * rate and stop a healthy shadow. Sample floors are stated per condition and are part of the
 * contract, not a tuning knob.
 */

import {
  engageRuntimeKillSwitch, type KillSwitchState,
} from './production-shadow-authorization';

// ------------------------------------------------------------------ hard invariants

/**
 * Violations that stop SHADOW on a single occurrence.
 *
 * Each one means a claim this programme has already made in writing is false. There is no
 * investigation that makes one of these acceptable while shadow keeps running -- the investigation
 * happens with shadow OFF.
 */
export type HardInvariantViolation =
  /** The shadow customer payload differs from the legacy one. KG-4B's central obligation. */
  | 'CUSTOMER_OUTPUT_MUTATED'
  /** The invariance comparison could not be performed. Unverified is not verified. */
  | 'CUSTOMER_OUTPUT_UNVERIFIED'
  /** A governed release id was written as customer provenance while in SHADOW. */
  | 'GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW'
  /** An event failed the privacy allowlist or carried a prohibited marker. */
  | 'PRIVACY_SCHEMA_VIOLATION'
  /** Approval/provenance identity is internally impossible (digest present with no release, etc). */
  | 'APPROVAL_INTEGRITY_IMPOSSIBLE'
  /** The same inputs produced two different governed classifications. */
  | 'NONDETERMINISTIC_RESULT'
  /** The governed layer answered for a citation other than the one requested. */
  | 'CITATION_SUBSTITUTED';

export const HARD_INVARIANT_VIOLATIONS: readonly HardInvariantViolation[] = Object.freeze([
  'CUSTOMER_OUTPUT_MUTATED', 'CUSTOMER_OUTPUT_UNVERIFIED',
  'GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW', 'PRIVACY_SCHEMA_VIOLATION',
  'APPROVAL_INTEGRITY_IMPOSSIBLE', 'NONDETERMINISTIC_RESULT', 'CITATION_SUBSTITUTED',
] as const);

// ------------------------------------------------------------------ rate conditions

export type RateCondition =
  | 'RESOLVER_FAILURE_RATE'
  | 'TELEMETRY_FAILURE_RATE'
  | 'BLOCKING_MISMATCH_RATE'
  | 'SHADOW_LATENCY_OVERHEAD';

export interface RateThreshold {
  condition: RateCondition;
  /** Trip when the measured value EXCEEDS this. Fractions are rates in [0,1]; latency is ms. */
  threshold: number;
  /** No trip before this many observations. */
  minimumSample: number;
  /** The KG-4B measurement this threshold is derived from. Recorded so it can be argued with. */
  basis: string;
}

/**
 * Every rate threshold, each tied to a KG-4B baseline.
 *
 * These are STOP thresholds, not alert thresholds. Alerting happens far earlier (see the runbook);
 * by the time one of these is exceeded, shadow is not producing usable evidence any more.
 */
export const RATE_THRESHOLDS: readonly RateThreshold[] = Object.freeze([
  {
    condition: 'RESOLVER_FAILURE_RATE',
    threshold: 0.02,
    minimumSample: 200,
    basis:
      'KG-4B measured resolverHealth OK on 83 of 83 comparisons (100%) across 43 analyses, four ' +
      'regimes and ten observation shapes. The observed failure rate is 0. A 2% ceiling therefore ' +
      'permits roughly a hundredfold degradation from the measured baseline before stopping, which ' +
      'is wide enough to absorb ordinary production transients (a connection reset, a failover) and ' +
      'narrow enough that a systemic resolver fault is caught within a few hundred requests. The ' +
      '200-observation floor is set so a single early failure cannot trip a run: 1/200 = 0.5%, ' +
      'comfortably under the threshold.',
  },
  {
    condition: 'TELEMETRY_FAILURE_RATE',
    threshold: 0.05,
    minimumSample: 200,
    basis:
      'Telemetry loss degrades the EVIDENCE, not the customer -- KG-4B measured the customer path ' +
      'unaffected by six injected failure modes. It is therefore given a looser ceiling than the ' +
      'resolver. 5% is the point at which the mismatch corpus stops being a usable denominator: ' +
      'above it, an operator can no longer say what fraction of comparisons a rate describes, which ' +
      'is the specific error KG-4B refused when it declined to report a rate without stating its ' +
      'denominator.',
  },
  {
    condition: 'BLOCKING_MISMATCH_RATE',
    threshold: 0.001,
    minimumSample: 500,
    basis:
      'KG-4B measured 0 BLOCKING mismatches in 83 comparisons. Zero observed does not license a ' +
      'zero threshold here, because unlike a hard invariant a blocking mismatch is a finding ABOUT ' +
      'the corpus that shadow exists to discover -- stopping on the first one would defeat the ' +
      'purpose of running shadow at all. 0.1% over at least 500 comparisons means roughly one ' +
      'blocking case is tolerated, captured and reviewed, while a systematic problem (dozens) stops ' +
      'the run. Every individual blocking mismatch is still captured and alerted regardless of rate.',
  },
  {
    condition: 'SHADOW_LATENCY_OVERHEAD',
    threshold: 12,
    minimumSample: 200,
    basis:
      'KG-4B measured SHADOW overhead at 1.187 ms/analysis (p95 1.275 ms, worst observed 1.827 ms) ' +
      'at 10 findings over 6 distinct citations, with query count tracking distinct citations and ' +
      'no N+1. 12 ms is roughly ten times the measured mean and six times the worst single ' +
      'observation, so it cannot fire on ordinary variance, and it will fire on a regression that ' +
      'reintroduces per-finding queries. Against a classify path dominated by seconds of AI ' +
      'inference, 12 ms remains immaterial to the customer -- this threshold protects the SERVER, ' +
      'not the response time.',
  },
] as const);

export function thresholdFor(condition: RateCondition): RateThreshold {
  const found = RATE_THRESHOLDS.find((entry) => entry.condition === condition);
  if (!found) throw new Error('No threshold defined for condition ' + condition);
  return found;
}

// ------------------------------------------------------------------ the breaker

export type BreakerAction = 'CONTINUE' | 'REVIEW' | 'STOP_SHADOW';

export interface BreakerObservation {
  /** Total shadow comparisons observed. The denominator for every rate. */
  comparisons: number;
  resolverFailures: number;
  telemetryFailures: number;
  blockingMismatches: number;
  /** Mean added milliseconds per analysis attributable to shadow. */
  meanShadowOverheadMs: number;
  /** Hard invariant violations seen since the run started. */
  hardViolations: readonly HardInvariantViolation[];
}

export interface BreakerVerdict {
  action: BreakerAction;
  /** Categorical reasons, most severe first. Safe to log; never customer data. */
  reasons: string[];
  trippedBy: HardInvariantViolation | RateCondition | null;
  /** Conditions that are elevated but below their stop threshold. */
  review: string[];
}

/**
 * The REVIEW band: a fraction of the stop threshold at which a condition is worth a human look but
 * not a stop. Set at half, deliberately simply -- a more elaborate curve would imply a precision the
 * underlying measurements do not support.
 */
const REVIEW_FRACTION = 0.5;

/**
 * Evaluates one observation window.
 *
 * PURE. It decides; it does not act. Acting (engaging the kill switch) is `applyBreakerVerdict()`,
 * kept separate so the whole decision table can be tested exhaustively without any global state.
 */
export function evaluateCircuitBreaker(observation: BreakerObservation): BreakerVerdict {
  const reasons: string[] = [];
  const review: string[] = [];

  // Hard invariants first, unconditionally, with no sample floor. One is enough.
  if (observation.hardViolations.length > 0) {
    const first = observation.hardViolations[0];
    for (const violation of observation.hardViolations) {
      reasons.push('HARD_INVARIANT:' + violation);
    }
    return { action: 'STOP_SHADOW', reasons, trippedBy: first, review };
  }

  const comparisons = Math.max(0, observation.comparisons);
  const rates: Array<{ condition: RateCondition; value: number }> = [
    { condition: 'RESOLVER_FAILURE_RATE', value: comparisons ? observation.resolverFailures / comparisons : 0 },
    { condition: 'TELEMETRY_FAILURE_RATE', value: comparisons ? observation.telemetryFailures / comparisons : 0 },
    { condition: 'BLOCKING_MISMATCH_RATE', value: comparisons ? observation.blockingMismatches / comparisons : 0 },
    { condition: 'SHADOW_LATENCY_OVERHEAD', value: observation.meanShadowOverheadMs },
  ];

  let trippedBy: RateCondition | null = null;
  for (const rate of rates) {
    const threshold = thresholdFor(rate.condition);
    // The latency condition is sampled on comparisons too, so an early outlier cannot stop a run.
    if (comparisons < threshold.minimumSample) {
      if (rate.value > threshold.threshold) {
        review.push('BELOW_MINIMUM_SAMPLE:' + rate.condition);
      }
      continue;
    }
    if (rate.value > threshold.threshold) {
      reasons.push('RATE_EXCEEDED:' + rate.condition);
      if (!trippedBy) trippedBy = rate.condition;
    } else if (rate.value > threshold.threshold * REVIEW_FRACTION) {
      review.push('ELEVATED:' + rate.condition);
    }
  }

  if (trippedBy) return { action: 'STOP_SHADOW', reasons, trippedBy, review };
  if (review.length > 0) return { action: 'REVIEW', reasons, trippedBy: null, review };
  return { action: 'CONTINUE', reasons, trippedBy: null, review };
}

/**
 * Applies a verdict. The ONLY thing a STOP does is engage the runtime kill switch.
 *
 * It does not de-activate a release, revoke an approval, roll back a corpus, delete an event or
 * rewrite a customer record. Stopping shadow is a decision about whether a comparison keeps
 * running; it is not a decision about governed knowledge, and conflating the two would make the
 * safest available action also the most destructive one.
 */
export function applyBreakerVerdict(verdict: BreakerVerdict): KillSwitchState | null {
  if (verdict.action !== 'STOP_SHADOW') return null;
  return engageRuntimeKillSwitch('CIRCUIT_BREAKER:' + String(verdict.trippedBy ?? 'UNSPECIFIED'));
}

/**
 * A running accumulator an operator process can feed per comparison.
 *
 * Counters only -- no payloads, no identifiers, no per-request retention. The window is bounded by
 * construction: it holds seven numbers and a de-duplicated set of violation names, so it cannot
 * grow with traffic.
 */
export class ShadowBreakerWindow {
  private comparisons = 0;
  private resolverFailures = 0;
  private telemetryFailures = 0;
  private blockingMismatches = 0;
  private overheadTotalMs = 0;
  private readonly violations = new Set<HardInvariantViolation>();

  recordComparison(input: {
    resolverFailed?: boolean;
    telemetryFailed?: boolean;
    blocking?: boolean;
    overheadMs?: number;
  }): void {
    this.comparisons += 1;
    if (input.resolverFailed) this.resolverFailures += 1;
    if (input.telemetryFailed) this.telemetryFailures += 1;
    if (input.blocking) this.blockingMismatches += 1;
    this.overheadTotalMs += Number.isFinite(input.overheadMs) ? Number(input.overheadMs) : 0;
  }

  recordHardViolation(violation: HardInvariantViolation): void {
    this.violations.add(violation);
  }

  observation(): BreakerObservation {
    return {
      comparisons: this.comparisons,
      resolverFailures: this.resolverFailures,
      telemetryFailures: this.telemetryFailures,
      blockingMismatches: this.blockingMismatches,
      meanShadowOverheadMs: this.comparisons ? this.overheadTotalMs / this.comparisons : 0,
      hardViolations: [...this.violations],
    };
  }

  evaluate(): BreakerVerdict {
    return evaluateCircuitBreaker(this.observation());
  }
}
