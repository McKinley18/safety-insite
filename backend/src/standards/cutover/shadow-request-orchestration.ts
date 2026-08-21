/**
 * KG-4D -- the ONE request-path orchestration boundary for production-shadow execution.
 *
 * WHY THIS MODULE EXISTS. KG-4C built six safety modules and verified them thoroughly, and then
 * recorded honestly that none of them was reachable from a customer request. Verified-but-unwired
 * safety machinery protects nothing. KG-4D wires them in -- and does it in exactly one place, so a
 * future reader has one file to understand rather than six call sites scattered through HazLenz.
 *
 * THE SHAPE, AND THE ONE PROPERTY THAT MATTERS MOST.
 *
 *   In SHADOW this function runs the customer pipeline FOUR times and **returns the output of the
 *   first one** -- the run made on the original analysis object with no cutover context. Always.
 *   Not the shadow one, not a merged one, not the shadow one "because the comparison passed".
 *
 * That single decision is what makes "SHADOW cannot alter customer output" structural rather than
 * a property the comparison happens to confirm. KG-4B proved SHADOW was invisible by comparing
 * payloads and finding them equal; KG-4D makes the equality *irrelevant to the customer*, because
 * the bytes the customer receives were computed by a branch the governed resolver never touched.
 * The comparison still runs -- it is the entire point of a shadow -- but it now measures the gap
 * rather than guarding the customer.
 *
 * THE VOLATILE-FIELD METHODOLOGY IS KG-4B's, PRESERVED. The legacy branch is run twice and the
 * fields that differ between two runs of identical code are excluded empirically. A hand-written
 * ignore-list would be a promise that the pipeline will never grow a new timestamp, and that
 * promise always eventually breaks -- at which point the check either fires constantly and gets
 * disabled, or is widened until it proves nothing.
 *
 * THE FOUR RUNS, AND WHY EACH EXISTS.
 *
 *   1. pristine, no context   -> the CUSTOMER payload. Copies nothing, so it is byte-identical to
 *                                what the pre-integration controller produced.
 *   2. copy, no context       -> legacy probe A, the left side of the comparison.
 *   3. copy, no context       -> legacy probe B; diff(2,3) IS the volatile set, derived not declared.
 *   4. copy, with context     -> the shadow payload, compared against probe A.
 *
 * Runs 2-4 are all copies so that copy artifacts -- a JSON copy drops functions and class
 * references -- appear identically on both sides of the comparison and cancel out. Comparing the
 * pristine run against a copied run would attribute those artifacts to SHADOW and manufacture a
 * mismatch.
 *
 * COST, STATED PLAINLY. Four pipeline executions per SHADOW analysis instead of one. That is a real
 * cost and it is paid ONLY by explicitly allowlisted shadow principals; a LEGACY request runs the
 * pipeline exactly once and never constructs anything in this file. Against a classify path
 * dominated by seconds of AI inference the extra hydration passes are immaterial -- the same
 * argument KG-4B made for the resolver, measured rather than assumed (KG-4D Phase 18).
 *
 * NO DUPLICATE MODEL CALL. The pipeline this module re-runs begins AFTER the AI analysis is
 * complete: the caller passes a closure over an already-computed HazLenz result. The governed
 * comparison reuses that same evidence foundation. Nothing here re-invokes a provider.
 *
 * TWO PIECES OF MODULE-LEVEL STATE, AND WHY THEY ARE DELIBERATE. A circuit breaker scoped to one
 * request cannot stop anything, and neither can a metrics counter. Both are process-global here and
 * nowhere else in the cutover subsystem. Their only transitions make shadow LESS active, never
 * more, so neither can widen exposure.
 */

import { DataSource } from 'typeorm';
import {
  GovernedCutoverContext,
} from './governed-cutover-context';
import {
  resolveCutoverMode, resolveCutoverEnablement,
  type CutoverPrincipal, type GovernedCutoverMode,
} from './cutover-mode';
import {
  resolveProductionShadowAuthorization, resolveKillSwitch, resolveShadowStage,
  type ProductionShadowStage, type KillSwitchState,
} from './production-shadow-authorization';
import {
  ShadowBreakerWindow, applyBreakerVerdict,
  type BreakerVerdict, type HardInvariantViolation,
} from './shadow-circuit-breaker';
import {
  deriveVolatilePaths, compareCustomerOutput, type InvarianceResult,
} from './customer-output-invariance';
import {
  buildShadowEventV2, emitShadowEvent, StdoutJsonlSink, NullSink,
  type TelemetrySink, type EligibilitySource, type SinkDeliveryResult,
} from './shadow-telemetry-sink';
import { shadowMetrics } from './shadow-operational-metrics';
import { shadowProvenanceIsCompliant } from './shadow-provenance-invariant';
import { resolveAnalysisProvenance } from './governed-provenance';

// ------------------------------------------------------------------ process-global breaker

/**
 * The breaker window for this process. Global on purpose -- see the header.
 *
 * It is never reset automatically. One clean request does not clear a latched breaker, because the
 * condition that latched it was a hard invariant violation, and "it did not happen again on the
 * next request" is not evidence that it was fixed. Reset is an explicit operator/test action.
 */
let breakerWindow = new ShadowBreakerWindow();

/** Explicit reset. Used by operators and by verification suites; never by request handling. */
export function resetShadowBreakerWindow(): void {
  breakerWindow = new ShadowBreakerWindow();
}

export function shadowBreakerObservation() {
  return breakerWindow.observation();
}

// ------------------------------------------------------------------ result types

export type ShadowExecutionOutcome =
  /** No governed or shadow work ran. The default, and the only path any customer takes today. */
  | 'LEGACY_NO_CONTEXT'
  /** A governed delivery mode ran and its output is authoritative. */
  | 'GOVERNED_DELIVERY'
  /** SHADOW ran, was compared, and the customer received the legacy payload. */
  | 'SHADOW_EXECUTED'
  /** SHADOW was eligible but suppressed. See `skipReason`. */
  | 'SHADOW_SKIPPED';

export type ShadowSkipReason =
  | 'KILL_SWITCH_ENGAGED'
  | 'CIRCUIT_BREAKER_LATCHED'
  | 'PRODUCTION_LOCKS_NOT_SATISFIED'
  | 'SHADOW_EXECUTION_FAILED';

export interface ShadowOrchestrationResult<T> {
  /** What the customer receives. In SHADOW this is ALWAYS the legacy-branch payload. */
  payload: T;
  outcome: ShadowExecutionOutcome;
  skipReason: ShadowSkipReason | null;
  configuredMode: GovernedCutoverMode;
  effectiveMode: GovernedCutoverMode;
  stage: ProductionShadowStage;
  eligibilitySource: EligibilitySource;
  killSwitch: KillSwitchState;
  invariance: InvarianceResult | null;
  hardViolations: HardInvariantViolation[];
  breakerVerdict: BreakerVerdict | null;
  telemetry: { attempted: number; delivered: number; dropped: number };
  /** True when the analysis recorded no governed customer provenance. Must be true in SHADOW. */
  shadowProvenanceNull: boolean;
  comparisons: number;
  shadowLatencyMs: number;
}

export interface ShadowOrchestrationInput<T> {
  dataSource: DataSource | null | undefined;
  principal: CutoverPrincipal | null | undefined;
  analysisTraceId?: string | null;
  env?: Record<string, string | undefined>;
  /** Categorical hazard family / jurisdiction for aggregation. Never customer prose. */
  hazardFamily?: string | null;
  jurisdiction?: string | null;
  /**
   * The customer pipeline, as a closure over an ALREADY-COMPUTED analysis. Called with `null` for
   * the legacy branch and with a context for the governed/shadow branch. Must not re-invoke a model.
   *
   * `options.pristine` is true for the ONE invocation whose output reaches the customer; that call
   * must run on the original analysis object, so the customer payload is produced by a path that
   * copies nothing. Every other invocation gets `pristine: false` and must operate on its own copy,
   * because the pipeline mutates its input in place.
   */
  runPipeline: (
    cutover: GovernedCutoverContext | null,
    options: { pristine: boolean },
  ) => Promise<T>;
  /** Test seam. Defaults to stdout JSONL. */
  sink?: TelemetrySink;
}

function sinkFor(env: Record<string, string | undefined>, override?: TelemetrySink): TelemetrySink {
  if (override) return override;
  return String(env.GOVERNED_CUTOVER_OBSERVABILITY || '').trim() === 'enabled'
    ? new StdoutJsonlSink()
    : new NullSink();
}

function eligibilitySourceFrom(reason: string): EligibilitySource {
  if (reason === 'ACCOUNT_ALLOWLISTED') return 'ACCOUNT_ALLOWLIST';
  if (reason === 'ORGANIZATION_ALLOWLISTED') return 'ORGANIZATION_ALLOWLIST';
  return 'NONE';
}

/**
 * THE orchestration boundary.
 *
 * Total: it never throws. Every failure inside shadow-only work degrades to the legacy payload,
 * because the caller is inside a customer request and no shadow outcome may become a customer
 * error. This is the request-level fail-open contract, implemented rather than asserted.
 */
export async function orchestrateShadowRequest<T>(
  input: ShadowOrchestrationInput<T>,
): Promise<ShadowOrchestrationResult<T>> {
  const env = input.env ?? process.env;
  const configured = resolveCutoverMode(env);
  const enablement = resolveCutoverEnablement(input.principal, env, configured);
  const killSwitch = resolveKillSwitch(env);
  const stage = resolveShadowStage(env).stage;
  const eligibilitySource = eligibilitySourceFrom(enablement.reason);

  const base = <U>(over: Partial<ShadowOrchestrationResult<U>>): ShadowOrchestrationResult<U> => ({
    payload: undefined as unknown as U,
    outcome: 'LEGACY_NO_CONTEXT',
    skipReason: null,
    configuredMode: configured.mode,
    effectiveMode: enablement.effectiveMode,
    stage,
    eligibilitySource,
    killSwitch,
    invariance: null,
    hardViolations: [],
    breakerVerdict: null,
    telemetry: { attempted: 0, delivered: 0, dropped: 0 },
    shadowProvenanceNull: true,
    comparisons: 0,
    shadowLatencyMs: 0,
    ...over,
  });

  // ---------------------------------------------------------------- the legacy fast path
  //
  // Nothing in this module allocates, queries or measures for a LEGACY request. The context is not
  // created, so no code in `standards/cutover/` executes at all -- which is what keeps "LEGACY is a
  // structural no-op" true after integration, not merely before it.
  if (enablement.effectiveMode === 'LEGACY') {
    shadowMetrics.increment('shadow_skipped');
    return base<T>({ payload: await input.runPipeline(null, { pristine: true }), outcome: 'LEGACY_NO_CONTEXT' });
  }

  shadowMetrics.increment('shadow_eligible_requests');

  // ---------------------------------------------------------------- disabling overrides
  //
  // Evaluated before anything else that could execute governed code, and unconditionally. A kill
  // switch that only applies once every other check has passed is not a kill switch.
  if (killSwitch.engaged) {
    shadowMetrics.increment('shadow_skipped');
    return base<T>({
      payload: await input.runPipeline(null, { pristine: true }),
      outcome: 'SHADOW_SKIPPED', skipReason: 'KILL_SWITCH_ENGAGED',
      effectiveMode: 'LEGACY',
    });
  }

  const standingVerdict = breakerWindow.evaluate();
  if (standingVerdict.action === 'STOP_SHADOW') {
    shadowMetrics.increment('shadow_skipped');
    return base<T>({
      payload: await input.runPipeline(null, { pristine: true }),
      outcome: 'SHADOW_SKIPPED', skipReason: 'CIRCUIT_BREAKER_LATCHED',
      effectiveMode: 'LEGACY', breakerVerdict: standingVerdict,
    });
  }

  // ---------------------------------------------------------------- governed delivery modes
  //
  // GOVERNED_WITH_FALLBACK / GOVERNED_STRICT are not shadow. Their output IS authoritative, and the
  // invariance oracle deliberately does not run: they are permitted to differ from legacy, which is
  // the entire point of a governed delivery mode.
  if (enablement.effectiveMode !== 'SHADOW') {
    const context = await GovernedCutoverContext.create({
      dataSource: input.dataSource, principal: input.principal,
      analysisTraceId: input.analysisTraceId ?? null, env,
    });
    shadowMetrics.increment('shadow_executed');
    return base<T>({
      payload: await input.runPipeline(context, { pristine: true }),
      outcome: 'GOVERNED_DELIVERY',
    });
  }

  // ---------------------------------------------------------------- production lock gate
  //
  // Outside production this returns NOT_PRODUCTION, which is not a refusal of shadow -- KG-4A/KG-4B
  // enablement continues to govern non-production servers exactly as before. In production the four
  // locks apply and all must be open.
  const authorization = resolveProductionShadowAuthorization({
    principal: input.principal, env, configured,
  });
  if (authorization.isProduction && !authorization.authorized) {
    shadowMetrics.increment('shadow_skipped');
    return base<T>({
      payload: await input.runPipeline(null, { pristine: true }),
      outcome: 'SHADOW_SKIPPED', skipReason: 'PRODUCTION_LOCKS_NOT_SATISFIED',
      effectiveMode: 'LEGACY',
    });
  }

  // ---------------------------------------------------------------- SHADOW
  return runShadowBranch(input, env, base, stage, eligibilitySource);
}

async function runShadowBranch<T>(
  input: ShadowOrchestrationInput<T>,
  env: Record<string, string | undefined>,
  base: <U>(over: Partial<ShadowOrchestrationResult<U>>) => ShadowOrchestrationResult<U>,
  stage: ProductionShadowStage,
  eligibilitySource: EligibilitySource,
): Promise<ShadowOrchestrationResult<T>> {
  const startedAt = Date.now();
  const hardViolations: HardInvariantViolation[] = [];
  const telemetry = { attempted: 0, delivered: 0, dropped: 0 };

  // THE customer payload. Runs on the ORIGINAL analysis object with NO cutover context, so the
  // governed resolver provably did not participate in producing the bytes the customer receives --
  // and neither did any copying step. This is the first thing that happens and it is what returns,
  // whatever the comparison below concludes.
  const legacyPayload = await input.runPipeline(null, { pristine: true });

  let invariance: InvarianceResult | null = null;
  let comparisons = 0;
  let provenanceNull = true;
  let breakerVerdict: BreakerVerdict | null = null;

  try {
    // THE COMPARISON RUNS ENTIRELY ON COPIES, and that is deliberate.
    //
    // Copying is not free of consequence -- a JSON copy drops functions and class references -- so
    // comparing the pristine run against a copied run would attribute copy artifacts to SHADOW.
    // Both sides of the comparison are therefore copies: two legacy probes derive the volatile set
    // (KG-4B's empirical methodology, preserved), and the shadow run is compared against one of
    // them. Copy artifacts appear identically on both sides and cancel out, so what remains is
    // exactly the governed-versus-legacy difference the shadow exists to measure.
    const legacyProbeA = await input.runPipeline(null, { pristine: false });
    const legacyProbeB = await input.runPipeline(null, { pristine: false });
    const volatilePaths = deriveVolatilePaths(legacyProbeA, legacyProbeB);

    const context = await GovernedCutoverContext.create({
      dataSource: input.dataSource, principal: input.principal,
      analysisTraceId: input.analysisTraceId ?? null, env,
    });

    const shadowPayload = await input.runPipeline(context, { pristine: false });
    shadowMetrics.increment('shadow_executed');

    invariance = compareCustomerOutput({
      legacyPayload: legacyProbeA, shadowPayload, volatilePaths,
    });

    if (invariance.verdict === 'MUTATED') {
      hardViolations.push('CUSTOMER_OUTPUT_MUTATED');
      shadowMetrics.increment('shadow_output_hash_mismatch');
    } else if (invariance.verdict === 'INDETERMINATE') {
      // Unverified is not verified. KG-4C made this a hard invariant precisely so a check that
      // could not run cannot be mistaken for a check that passed.
      hardViolations.push('CUSTOMER_OUTPUT_UNVERIFIED');
      shadowMetrics.increment('shadow_output_hash_unverified');
    }

    // ------------------------------------------------------------ provenance invariant
    if (context) {
      const provenance = resolveAnalysisProvenance(context.pin, context.provenanceContributions());
      provenanceNull = shadowProvenanceIsCompliant('SHADOW', provenance);
      if (!provenanceNull || provenance.shadowProvenanceViolation) {
        hardViolations.push('GOVERNED_PROVENANCE_WRITTEN_IN_SHADOW');
        shadowMetrics.increment('shadow_provenance_violation');
      }
    }

    // ------------------------------------------------------------ telemetry
    const records = context ? context.shadowComparisons() : [];
    comparisons = records.length;
    const sink = sinkFor(env, input.sink);

    for (const record of records) {
      // A substituted citation is a violation of this system's own invariant, not a corpus finding.
      if (record.governedResolvedCitation && record.governedResolvedCitation !== record.requestedCitation) {
        if (!hardViolations.includes('CITATION_SUBSTITUTED')) hardViolations.push('CITATION_SUBSTITUTED');
      }
      if (record.mismatch === 'INTEGRITY_FAILURE') {
        shadowMetrics.increment('shadow_integrity_failure');
      }
      if (record.resolverHealth !== 'OK') shadowMetrics.increment('shadow_resolver_failure');
      shadowMetrics.increment('shadow_comparisons');
      shadowMetrics.recordMismatch(record.mismatch, record.severity, record.rootCause);

      const event = buildShadowEventV2(record, {
        stage,
        eligibilitySource,
        outputInvarianceVerdict: invariance.verdict,
        outputInvarianceHash: invariance.legacyHash,
        outputInvarianceDifferingPaths: invariance.differingPathCount,
        shadowProvenanceNull: provenanceNull,
      });

      telemetry.attempted += 1;
      const delivery: SinkDeliveryResult = emitShadowEvent({
        event: event as unknown as Record<string, unknown>, sink, env,
      });
      if (delivery.status === 'DELIVERED') {
        telemetry.delivered += 1;
      } else if (delivery.status !== 'SUPPRESSED_DISABLED') {
        telemetry.dropped += 1;
        shadowMetrics.increment('shadow_telemetry_dropped');
        if (delivery.status === 'DROPPED_PRIVACY') {
          shadowMetrics.increment('shadow_privacy_violation');
          if (!hardViolations.includes('PRIVACY_SCHEMA_VIOLATION')) {
            hardViolations.push('PRIVACY_SCHEMA_VIOLATION');
          }
        }
      }

      breakerWindow.recordComparison({
        resolverFailed: record.resolverHealth !== 'OK',
        telemetryFailed: delivery.status !== 'DELIVERED' && delivery.status !== 'SUPPRESSED_DISABLED',
        blocking: record.severity === 'BLOCKING',
        overheadMs: record.latencyMs ?? 0,
      });
    }
  } catch (error) {
    // Any failure in shadow-only work. The customer already has a payload; nothing here may change
    // that. The failure is counted so silent loss becomes a measured rate rather than a mystery.
    shadowMetrics.increment('shadow_telemetry_dropped');
    telemetry.dropped += 1;
    breakerWindow.recordComparison({ telemetryFailed: true });
    return base<T>({
      payload: legacyPayload,
      outcome: 'SHADOW_SKIPPED', skipReason: 'SHADOW_EXECUTION_FAILED',
      invariance, hardViolations, telemetry, comparisons,
      shadowProvenanceNull: provenanceNull,
      shadowLatencyMs: Date.now() - startedAt,
    });
  }

  // ------------------------------------------------------------------ breaker
  for (const violation of hardViolations) breakerWindow.recordHardViolation(violation);
  breakerVerdict = breakerWindow.evaluate();
  if (breakerVerdict.action === 'STOP_SHADOW') applyBreakerVerdict(breakerVerdict);

  shadowMetrics.observeLatency(Date.now() - startedAt);

  return base<T>({
    // THE customer payload: the legacy branch, unconditionally.
    payload: legacyPayload,
    outcome: 'SHADOW_EXECUTED',
    invariance, hardViolations, breakerVerdict, telemetry, comparisons,
    shadowProvenanceNull: provenanceNull,
    shadowLatencyMs: Date.now() - startedAt,
  });
}
