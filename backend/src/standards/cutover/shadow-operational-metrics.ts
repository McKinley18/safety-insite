/**
 * KG-4C sections 15 and 16 -- the operational metric catalog and the alert/stop mapping.
 *
 * WHY A CATALOG RATHER THAN AD-HOC COUNTERS. A dashboard assembled during an incident measures
 * whatever was easy to reach, which is rarely what the decision needs. This catalog is written
 * before the run, names every metric a stop/continue decision depends on, and states its
 * aggregation dimensions -- so the question "is shadow safe to continue" has a fixed set of numbers
 * behind it rather than a judgement call.
 *
 * NO BROADLY IDENTIFYING DIMENSIONS. Aggregation is by hazard family, jurisdiction, backing state,
 * mismatch category, severity and root cause. NOT by account, organization, inspection, user or
 * correlation id. A dashboard sliced by customer turns an operational tool into a surveillance one,
 * and the questions this programme asks -- does governed content agree with legacy content -- are
 * about the CORPUS, not about who happened to trigger the comparison.
 *
 * THE COUNTERS ARE DERIVED FROM EVENTS, NOT WRITTEN SEPARATELY. Every metric below is computable by
 * aggregating the v2 shadow events. Nothing here requires a second write path that could disagree
 * with the event stream.
 */

import { RATE_THRESHOLDS, HARD_INVARIANT_VIOLATIONS } from './shadow-circuit-breaker';

export type MetricKind = 'COUNTER' | 'RATE' | 'LATENCY';

export interface ShadowMetric {
  name: string;
  kind: MetricKind;
  /** What it answers. One sentence; this is what an operator reads at 3am. */
  question: string;
  /** Where its value comes from in the v2 event stream. */
  derivedFrom: string;
}

/** Dimensions a metric may be sliced by. Deliberately none of them identify a customer. */
export const METRIC_DIMENSIONS: readonly string[] = Object.freeze([
  'hazardFamily', 'jurisdiction', 'governedBackingState', 'mismatch', 'severity', 'rootCause',
  'stage', 'releaseId',
]);

/** Dimensions that must NEVER appear on a dashboard, asserted by the contract suite. */
export const FORBIDDEN_METRIC_DIMENSIONS: readonly string[] = Object.freeze([
  'correlationId', 'findingKey', 'eventKey', 'userId', 'accountId', 'organizationId',
  'inspectionId', 'observationId', 'email',
]);

export const SHADOW_METRICS: readonly ShadowMetric[] = Object.freeze([
  { name: 'shadow_eligible_requests', kind: 'COUNTER',
    question: 'How many requests were eligible for shadow at all?',
    derivedFrom: 'authorization gate, counted per analysis' },
  { name: 'shadow_executed', kind: 'COUNTER',
    question: 'How many analyses actually ran a shadow comparison?',
    derivedFrom: 'distinct correlationId in the event stream' },
  { name: 'shadow_skipped', kind: 'COUNTER',
    question: 'How many eligible analyses did NOT run one, and why?',
    derivedFrom: 'eligible minus executed, bucketed by refusal reason' },
  { name: 'shadow_comparisons', kind: 'COUNTER',
    question: 'The denominator. Every rate below is meaningless without it.',
    derivedFrom: 'event count' },
  { name: 'shadow_exact_match', kind: 'COUNTER',
    question: 'How often do governed and legacy agree completely?',
    derivedFrom: 'mismatch = EXACT_MATCH' },
  { name: 'shadow_expected_fallback', kind: 'COUNTER',
    question: 'How much of the difference is the contract working as designed?',
    derivedFrom: 'rootCause = EXPECTED_FALLBACK' },
  { name: 'shadow_review_mismatch', kind: 'COUNTER',
    question: 'How much needs a human look before widening?',
    derivedFrom: 'severity = REVIEW' },
  { name: 'shadow_blocking_mismatch', kind: 'COUNTER',
    question: 'How many would put a wrong claim in front of a customer? Each is listed individually.',
    derivedFrom: 'severity = BLOCKING' },
  { name: 'shadow_resolver_failure', kind: 'COUNTER',
    question: 'Is the governed resolver healthy?',
    derivedFrom: 'resolverHealth != OK' },
  { name: 'shadow_integrity_failure', kind: 'COUNTER',
    question: 'Is the corpus internally coherent?',
    derivedFrom: 'mismatch = INTEGRITY_FAILURE' },
  { name: 'shadow_output_hash_mismatch', kind: 'COUNTER',
    question: 'Did the customer payload change? Must be zero.',
    derivedFrom: 'outputInvarianceVerdict = MUTATED' },
  { name: 'shadow_output_hash_unverified', kind: 'COUNTER',
    question: 'Could the invariance check not run? Unverified is not verified.',
    derivedFrom: 'outputInvarianceVerdict = INDETERMINATE' },
  { name: 'shadow_provenance_violation', kind: 'COUNTER',
    question: 'Did SHADOW write governed provenance? Must be zero.',
    derivedFrom: 'shadowProvenanceNull = false' },
  { name: 'shadow_privacy_violation', kind: 'COUNTER',
    question: 'Did an event fail the privacy guard? Must be zero.',
    derivedFrom: 'sink delivery status = DROPPED_PRIVACY' },
  { name: 'shadow_telemetry_dropped', kind: 'COUNTER',
    question: 'How much of the evidence is being lost?',
    derivedFrom: 'sink delivery status != DELIVERED' },
  { name: 'shadow_overhead_p50_ms', kind: 'LATENCY',
    question: 'Typical added cost per analysis.',
    derivedFrom: 'latencyMs, p50' },
  { name: 'shadow_overhead_p95_ms', kind: 'LATENCY',
    question: 'Tail added cost per analysis.',
    derivedFrom: 'latencyMs, p95' },
]);

// ------------------------------------------------------------------ alert / stop mapping

export type OperationalAction = 'CONTINUE' | 'REVIEW' | 'STOP_SHADOW';

export interface AlertRule {
  condition: string;
  action: OperationalAction;
  /** Zero-tolerance rules trip on a single occurrence. */
  zeroTolerance: boolean;
  justification: string;
}

/**
 * The complete mapping from an observable condition to an operational action.
 *
 * The zero-tolerance block is derived from `HARD_INVARIANT_VIOLATIONS` rather than restated, so the
 * dashboard and the circuit breaker cannot drift apart. The rate block is derived from
 * `RATE_THRESHOLDS` for the same reason -- there is one place where a number lives.
 */
export const ALERT_RULES: readonly AlertRule[] = Object.freeze([
  ...HARD_INVARIANT_VIOLATIONS.map((violation) => ({
    condition: 'hard invariant: ' + violation,
    action: 'STOP_SHADOW' as OperationalAction,
    zeroTolerance: true,
    justification:
      'A single occurrence falsifies a claim this programme has already made in writing. There is ' +
      'no rate at which it becomes acceptable, and the investigation happens with shadow OFF.',
  })),
  ...RATE_THRESHOLDS.map((threshold) => ({
    condition: threshold.condition + ' > ' + String(threshold.threshold) +
      ' over at least ' + String(threshold.minimumSample) + ' comparisons',
    action: 'STOP_SHADOW' as OperationalAction,
    zeroTolerance: false,
    justification: threshold.basis,
  })),
  ...RATE_THRESHOLDS.map((threshold) => ({
    condition: threshold.condition + ' > ' + String(threshold.threshold * 0.5) +
      ' (half the stop threshold) over at least ' + String(threshold.minimumSample) + ' comparisons',
    action: 'REVIEW' as OperationalAction,
    zeroTolerance: false,
    justification:
      'Elevated but not disqualifying. Half is a deliberately simple review band -- a more ' +
      'elaborate curve would imply a precision the underlying measurements do not support.',
  })),
  {
    condition: 'any individual BLOCKING mismatch, at any rate',
    action: 'REVIEW',
    zeroTolerance: false,
    justification:
      'Every blocking mismatch is captured and reviewed individually even when the RATE is below ' +
      'its stop threshold. Discovering them is the reason a production shadow runs; summarising ' +
      'them into a percentage alone is how a single catastrophic case gets lost in a good average.',
  },
]);

/** Metrics whose only acceptable value is zero. */
export const ZERO_TOLERANCE_METRICS: readonly string[] = Object.freeze([
  'shadow_output_hash_mismatch',
  'shadow_output_hash_unverified',
  'shadow_provenance_violation',
  'shadow_privacy_violation',
  'shadow_integrity_failure',
]);

// ------------------------------------------------------------------ KG-4D: the recorder

/**
 * KG-4D. The in-process metric registry the request path actually writes to.
 *
 * COUNTERS ONLY, AND BOUNDED BY CONSTRUCTION. It holds one integer per metric name, one integer per
 * taxonomy category/severity/root-cause, and a fixed-size latency reservoir. It cannot grow with
 * traffic, and it retains nothing about any individual request -- no correlation id, no finding key,
 * no identifier of any kind. That is not a convention here; there is no field to put one in.
 *
 * PROCESS-GLOBAL, deliberately, for the same reason the circuit breaker is: a counter scoped to one
 * request measures nothing. Its only transitions are increments, so it cannot affect behaviour.
 *
 * NOT A DASHBOARD. This is the source a metrics exporter would read. The forbidden-dimension rule
 * (`FORBIDDEN_METRIC_DIMENSIONS`) is enforced structurally -- the registry has no per-principal
 * dimension to expose, so a dashboard cannot slice by one even if someone wanted to.
 */
export class ShadowMetricsRegistry {
  private readonly counters = new Map<string, number>();
  private readonly mismatches = new Map<string, number>();
  private readonly severities = new Map<string, number>();
  private readonly rootCauses = new Map<string, number>();
  private readonly latencies: number[] = [];

  /** Latency samples retained. Fixed so memory cannot track traffic. */
  private static readonly MAX_LATENCY_SAMPLES = 512;

  increment(metric: string, by = 1): void {
    this.counters.set(metric, (this.counters.get(metric) ?? 0) + by);
  }

  recordMismatch(mismatch: string, severity: string, rootCause: string): void {
    this.mismatches.set(mismatch, (this.mismatches.get(mismatch) ?? 0) + 1);
    this.severities.set(severity, (this.severities.get(severity) ?? 0) + 1);
    this.rootCauses.set(rootCause, (this.rootCauses.get(rootCause) ?? 0) + 1);
    if (severity === 'BLOCKING') this.increment('shadow_blocking_mismatch');
    if (severity === 'REVIEW') this.increment('shadow_review_mismatch');
    if (mismatch === 'EXACT_MATCH') this.increment('shadow_exact_match');
    if (rootCause === 'EXPECTED_FALLBACK') this.increment('shadow_expected_fallback');
  }

  observeLatency(ms: number): void {
    if (!Number.isFinite(ms)) return;
    this.latencies.push(ms);
    // Drop the OLDEST sample, so the reservoir tracks recent behaviour rather than start-up.
    if (this.latencies.length > ShadowMetricsRegistry.MAX_LATENCY_SAMPLES) this.latencies.shift();
  }

  get(metric: string): number {
    return this.counters.get(metric) ?? 0;
  }

  percentile(p: number): number {
    if (!this.latencies.length) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[index];
  }

  /** A privacy-safe snapshot. Every key is a metric name or a categorical taxonomy value. */
  snapshot(): Record<string, unknown> {
    return {
      counters: Object.fromEntries(this.counters),
      mismatches: Object.fromEntries(this.mismatches),
      severities: Object.fromEntries(this.severities),
      rootCauses: Object.fromEntries(this.rootCauses),
      shadow_overhead_p50_ms: this.percentile(50),
      shadow_overhead_p95_ms: this.percentile(95),
      latencySamples: this.latencies.length,
    };
  }

  reset(): void {
    this.counters.clear();
    this.mismatches.clear();
    this.severities.clear();
    this.rootCauses.clear();
    this.latencies.length = 0;
  }
}

/** The process registry the request path writes to. */
export const shadowMetrics = new ShadowMetricsRegistry();
