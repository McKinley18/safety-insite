/**
 * EXPERT HAZLENZ -- the FORMAL COHORT HARNESS. §121.
 *
 * Built, frozen and validated at $0.00 BEFORE any reserved material is opened and before the formal
 * cohort is authorized to spend. Provider execution is DISABLED by default and the default cannot be
 * changed by accident: `mode: 'ENABLED'` requires an explicit provider object, and `mode: 'DISABLED'`
 * refuses to accept one.
 *
 * ==================== IT CALLS THE PERMANENT PATH, NOT A COPY OF IT ====================
 *
 * Input construction goes through `buildExpertAnalysisInputFromAnalysis`, the same canonical
 * constructor a customer-reachable caller would use. Execution goes through `runExpertAnalysis`, the
 * real runner. Nothing here rebuilds a prompt, re-implements the projection, or bypasses the
 * boundary. §120 GAP 5 named the alternative and the cost of it: an evaluation-only path would be
 * measured alongside the model.
 *
 * ==================== THE DETERMINISTIC SIDE IS REAL TOO ====================
 *
 * `MultiHazardDecompositionService.decompose` and `applyEvidenceFoundation` are the production
 * deterministic layer, invoked here exactly as the customer path invokes them, at $0.00 and with no
 * database. What the engine says about a row is therefore a measurement of the engine, not an
 * assumption about it -- which is what M01's "the deterministic set did not contain" requires.
 *
 * ==================== THE CEILINGS ARE HARD ====================
 *
 * `callCeiling` and `spendCeilingUsd` are checked BEFORE each call, not after. A run that would
 * exceed either stops with `CEILING_REACHED` and reports what it completed. There is no flag that
 * raises a ceiling mid-run.
 */

import { MultiHazardDecompositionService } from '../../src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service';
import { applyEvidenceFoundation } from '../../src/safescope-v2/evidence/evidence-foundation';
import type { ClassifyDto } from '../../src/safescope-v2/dto/classify.dto';
import {
  buildExpertAnalysisInputFromAnalysis, permuteForOrderSensitivity,
  type HazLenzAnalysisState,
} from '../../src/safescope-v2/expert-hazlenz/expert-input-constructor';
import { runExpertAnalysis } from '../../src/safescope-v2/expert-hazlenz/expert-runner';
import type { ExpertProvider } from '../../src/safescope-v2/expert-hazlenz/expert-provider';
import type { ExpertAnalysisInput } from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
  type DeterministicAuthorityResult, type GovernedAuthorityResult,
} from '../../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import {
  validateCohortRow, type CohortRowProblem, type FormalCohortRow,
} from '../../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  buildAdjudicationQueue, buildScoringReport,
  type AdjudicationQueueItem, type AdjudicationRecord, type CallArm, type CallRecord,
  type CohortRunRecord, type ScoringReport,
} from '../../src/safescope-v2/expert-hazlenz/expert-measure-scorers';

export const EXPERT_COHORT_HARNESS_VERSION = 'hazlenz.expert.cohort.harness.v1' as const;

// ---------------------------------------------------------------- execution mode

export type ProviderExecutionMode = 'DISABLED' | 'ENABLED';

/**
 * The zero-call guarantee, as a counter rather than a claim.
 *
 * Incremented only inside `executeCall`, which is the only function in this file that touches a
 * provider. A validation run asserts it is still zero afterwards, so "no hosted call was made" is a
 * measured fact rather than a reading of the code.
 */
let providerInvocations = 0;
export function providerInvocationCount(): number { return providerInvocations; }
export function resetProviderInvocationCount(): void { providerInvocations = 0; }

/**
 * The exact provider and model this run is bound to. §135 (R4).
 *
 * Supplying it makes the run FAIL CLOSED on identity: before a single request, the provider's
 * qualified model must equal `model`. `EXPERT_ANTHROPIC_MODEL` resolves BOTH the model the adapter
 * calls and the identity the runner checks the response against, so without this the guard compares
 * the answer to whatever the environment said. It protects against a provider substituting a model;
 * it never protected against an operator doing so.
 *
 * Scoped to the formal harness. Omitting it leaves ordinary runtime configurability untouched.
 */
export interface FrozenExecutionIdentity {
  provider: string;
  model: string;
}

export interface HarnessOptions {
  mode: ProviderExecutionMode;
  /** REQUIRED when ENABLED, and REFUSED when DISABLED. */
  provider?: ExpertProvider | null;
  /**
   * Hard stop on LOGICAL calls, checked before each one.
   *
   * Retained and still enforced, but it is NOT the spend bound: a logical call may issue two
   * provider requests. `requestCeiling` is what actually bounds billable requests.
   */
  callCeiling: number;
  /**
   * Hard stop on PROVIDER REQUESTS -- initial and retry alike -- checked before each request.
   * Absent leaves request counting on but unbounded, which is the pre-§135 behaviour.
   */
  requestCeiling?: number;
  /** Hard stop on the global retry allowance, checked before each retry request. */
  retryRequestBudget?: number;
  /**
   * Worst-case cost of one request, used for PROSPECTIVE spend enforcement. Final usage is unknown
   * before a request returns, so the gate prices the next request at its frozen worst case.
   */
  worstCaseRequestUsd?: number;
  /** Bind the run to an exact provider and model, or leave undefined for ordinary runs. */
  frozenIdentity?: FrozenExecutionIdentity;
  /** Hard stop, checked before each call against spend already incurred. */
  spendCeilingUsd: number;
  /** Which arms to run. `BASE` alone is the minimum; M14 needs PERMUTED, M17 needs CROSS_PROCESS. */
  arms: CallArm[];
  /** Identifies this OS process, so an M17 pair built inside one process is detectable. */
  processId: string;
  /** Injected so a replay is byte-reproducible, exactly as the runner requires. */
  nowIso: string;
  /** Per-call usage, supplied by the caller's adapter. Absent in DISABLED mode. */
  usageOf?: (callId: string) => { inputTokens: number; outputTokens: number; costUsd: number };
  /**
   * DURABLE EVIDENCE SINK, called with each `CohortRunRecord` the moment it is complete. §139.
   *
   * The 2026-09-01 formal run proved that returning the records at the end is not persistence: the
   * caller never wrote them and the frozen rescoring path was lost for good. A sink invoked DURING
   * execution means a crash, a kill or a ceiling stop at call N+1 still leaves calls 1..N scoreable.
   *
   * The harness deliberately does not open files itself -- it has no business choosing a directory
   * or a format -- but it does guarantee the call happens before the next row starts. A sink that
   * throws stops the run, which is correct: evidence that cannot be persisted must not be spent
   * past.
   */
  recordSink?: (record: CohortRunRecord) => void;
}

export const HARNESS_STOP_REASONS = [
  'COMPLETED',
  'CALL_CEILING_REACHED',
  'REQUEST_CEILING_REACHED',
  'SPEND_CEILING_REACHED',
  'PROVIDER_EXECUTION_DISABLED',
  'COHORT_INVALID',
  'EXECUTION_IDENTITY_MISMATCH',
] as const;
export type HarnessStopReason = (typeof HARNESS_STOP_REASONS)[number];

// ---------------------------------------------------------------- the deterministic side

export interface DeterministicRowResult {
  familiesEmitted: string[];
  analysisState: HazLenzAnalysisState;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  lifeCriticalFindingKeys: string[];
}

const decomposer = new MultiHazardDecompositionService();

/**
 * Run the REAL deterministic layer over a row and assemble both the Expert-facing analysis state and
 * the merge-side authority result.
 *
 * The two are deliberately different objects. The analysis state feeds the canonical constructor and
 * may reach the model; the merge-side `DeterministicAuthorityResult` carries the corpus
 * life-criticality label and never does. That separation is what makes M04 measurable without
 * telling the model which findings to protect.
 */
export function runDeterministicSide(row: FormalCohortRow): DeterministicRowResult {
  const decomposition = decomposer.decompose(row.source.observation, {
    location: row.source.inspectionContext.location,
    task: row.source.inspectionContext.task,
  });

  const request = {
    text: row.source.observation,
    regulatoryContext: {
      value: row.source.jurisdiction,
      provenance: 'USER_CONFIRMED',
      source: 'inspection',
    },
  } as unknown as ClassifyDto;

  const engineResult: Record<string, unknown> = {};
  applyEvidenceFoundation(engineResult, request);
  const applicabilityDecisions = (engineResult.applicabilityDecisions ?? []) as ReadonlyArray<{
    family: string; status: string; confidence: number;
    requiredPredicates: ReadonlyArray<{ name: string; status: string }>;
  }>;

  const hazards = decomposition.hazards.map((h, i) => ({
    hazardId: h.hazardId ?? `f-${i + 1}`,
    domainId: h.domainId,
    hazardFamily: h.domainId,
    conditionState: h.conditionState,
    observationFragment: h.observationFragment,
  }));

  const familiesEmitted = Array.from(new Set(hazards.map(h => h.hazardFamily).filter(Boolean))) as string[];

  const analysisState: HazLenzAnalysisState = {
    analysisId: row.source.rowId,
    observation: row.source.observation,
    inspectionContext: row.source.inspectionContext,
    jurisdiction: row.source.jurisdiction,
    allowedHazardFamilies: row.source.allowedHazardFamilies,
    hazards,
    applicabilityDecisions: applicabilityDecisions.map(d => ({ ...d })),
    governedStandards: row.source.governedStandards,
    answeredClarifications: row.source.answeredClarifications,
    supplementaryContext: row.source.supplementaryContext,
    // Deliberately EMPTY. Production establishes no life-criticality and no required actions, so
    // Expert is shown none. Filling this from the truth key would be an evaluation-only input.
    findingMetadataByKey: {},
  };

  const lifeCritical = new Set(row.truth.lifeCriticalHazardFamilies);
  const lifeCriticalFindingKeys = hazards
    .filter(h => lifeCritical.has(String(h.hazardFamily)))
    .map(h => h.hazardId);

  const deterministic: DeterministicAuthorityResult = {
    analysisId: row.source.rowId,
    jurisdiction: row.source.jurisdiction,
    findings: hazards.map(h => ({
      findingKey: h.hazardId,
      hazardFamily: String(h.hazardFamily ?? 'unknown'),
      conditionState: String(h.conditionState ?? 'UNKNOWN'),
      isLifeCritical: lifeCritical.has(String(h.hazardFamily)),
      isActionable: true,
      requiredActions: [],
    })),
  };

  const governed: GovernedAuthorityResult = {
    knowledgeReleaseId: null,
    citations: row.source.governedStandards.map(g => ({
      findingKey: hazards[0]?.hazardId ?? 'f-none',
      citation: g.citation,
      backingState: g.backingState,
      governedProvenanceEligible: g.backingState === 'APPROVED',
      isApproved: g.backingState === 'APPROVED',
    })),
  };

  return { familiesEmitted, analysisState, deterministic, governed, lifeCriticalFindingKeys };
}

// ---------------------------------------------------------------- the run

export interface HarnessRunResult {
  harnessVersion: string;
  mode: ProviderExecutionMode;
  stopReason: HarnessStopReason;
  rowProblems: CohortRowProblem[];
  records: CohortRunRecord[];
  /** Every request actually built, retained so a run is auditable and reproducible. */
  requestsBuilt: Array<{ rowId: string; arm: CallArm; input: ExpertAnalysisInput }>;
  adjudicationQueue: AdjudicationQueueItem[];
  scoring: ScoringReport | null;
  accounting: {
    /** Logical calls STARTED -- one per row per arm. */
    callsAttempted: number;
    callsCompleted: number;
    /** PROVIDER REQUESTS issued: initial requests plus retry requests. The billable number. */
    providerRequestsAttempted: number;
    /** The retry subset of the above. */
    retryRequestsAttempted: number;
    inputTokens: number;
    outputTokens: number;
    spendUsd: number;
    callCeiling: number;
    requestCeiling: number;
    retryRequestBudget: number;
    spendCeilingUsd: number;
  };
  /** Every retry cause observed, in order, so exhaustion can be classified by cause. */
  retryCauses: string[];
  /** Retries that were EARNED but refused by a budget. Never silently dropped. */
  retriesSuppressed: Array<{ rowId: string; arm: CallArm; cause: string; reason: string }>;
  identityViolation: string | null;
  providerInvocations: number;
}

async function executeCall(
  provider: ExpertProvider, input: ExpertAnalysisInput, nowIso: string,
  mayIssueRetry: () => { allowed: boolean; reason: string },
): Promise<Awaited<ReturnType<typeof runExpertAnalysis>>> {
  providerInvocations += 1;
  const started = Date.now();
  const result = await runExpertAnalysis(provider, input, { nowIso, elapsedMs: 0, mayIssueRetry });
  return { ...result, trace: { ...result.trace, totalMs: Date.now() - started } };
}

/**
 * Run the cohort.
 *
 * In DISABLED mode this builds every request, validates every row, and returns without touching a
 * provider -- which is exactly what a freeze-time proof needs and is the mode this operation uses.
 */
export async function runFormalCohort(
  rows: readonly FormalCohortRow[],
  options: HarnessOptions,
  adjudications: readonly AdjudicationRecord[] = [],
): Promise<HarnessRunResult> {
  if (options.mode === 'DISABLED' && options.provider) {
    throw new Error('a provider was supplied in DISABLED mode -- refusing, because a harness that '
      + 'accepts one cannot prove it did not use it');
  }
  if (options.mode === 'ENABLED' && !options.provider) {
    throw new Error('ENABLED mode requires an explicit provider');
  }

  const rowProblems = rows.flatMap(validateCohortRow);
  const requestCeiling = options.requestCeiling ?? Number.POSITIVE_INFINITY;
  const retryRequestBudget = options.retryRequestBudget ?? Number.POSITIVE_INFINITY;
  const worstCaseRequestUsd = options.worstCaseRequestUsd ?? 0;
  const accounting = {
    callsAttempted: 0, callsCompleted: 0,
    providerRequestsAttempted: 0, retryRequestsAttempted: 0,
    inputTokens: 0, outputTokens: 0, spendUsd: 0,
    callCeiling: options.callCeiling,
    requestCeiling, retryRequestBudget,
    spendCeilingUsd: options.spendCeilingUsd,
  };
  const records: CohortRunRecord[] = [];
  const requestsBuilt: HarnessRunResult['requestsBuilt'] = [];
  const retryCauses: string[] = [];
  const retriesSuppressed: HarnessRunResult['retriesSuppressed'] = [];

  const bail = (stopReason: HarnessStopReason, identityViolation: string | null = null):
  HarnessRunResult => ({
    harnessVersion: EXPERT_COHORT_HARNESS_VERSION, mode: options.mode,
    stopReason, rowProblems, records, requestsBuilt,
    adjudicationQueue: [], scoring: null, accounting,
    retryCauses, retriesSuppressed, identityViolation,
    providerInvocations: providerInvocations,
  });

  if (rowProblems.length > 0) return bail('COHORT_INVALID');

  // ---- R4. IDENTITY IS BOUND BEFORE A SINGLE REQUEST, NOT VALIDATED AFTERWARDS.
  if (options.mode === 'ENABLED' && options.frozenIdentity) {
    const p = options.provider!;
    const f = options.frozenIdentity;
    // providerId is `<vendor>:<model>` by adapter convention; the vendor half is what is bound.
    const vendor = p.providerId.split(':')[0];
    if (vendor !== f.provider) {
      return bail('EXECUTION_IDENTITY_MISMATCH',
        `provider is '${vendor}' but the frozen cohort binds '${f.provider}'`);
    }
    if (p.qualifiedModelIdentity !== f.model) {
      return bail('EXECUTION_IDENTITY_MISMATCH',
        `provider qualified model is '${String(p.qualifiedModelIdentity)}' but the frozen cohort `
        + `binds '${f.model}'. An environment override cannot redefine the formal execution target.`);
    }
  }

  let stopReason: HarnessStopReason =
    options.mode === 'DISABLED' ? 'PROVIDER_EXECUTION_DISABLED' : 'COMPLETED';

  for (const row of rows) {
    const det = runDeterministicSide(row);
    const baseInput = buildExpertAnalysisInputFromAnalysis(det.analysisState);
    const calls: CallRecord[] = [];

    for (const arm of options.arms) {
      const input = arm === 'PERMUTED' ? permuteForOrderSensitivity(baseInput) : baseInput;
      requestsBuilt.push({ rowId: row.source.rowId, arm, input });

      if (options.mode === 'DISABLED') continue;

      // HARD CEILINGS, checked BEFORE the call. There is no path that spends first and checks after.
      if (accounting.callsAttempted + 1 > options.callCeiling) { stopReason = 'CALL_CEILING_REACHED'; break; }
      // R1. The INITIAL request is gated here, because the harness owns the counter. The RETRY is
      // gated inside the runner by `mayIssueRetry` below. Between the two, every provider request
      // in a formal run is checked before it is issued -- so a 216th is unreachable.
      if (accounting.providerRequestsAttempted + 1 > requestCeiling) {
        stopReason = 'REQUEST_CEILING_REACHED'; break;
      }
      // R2. Fail-closed PROSPECTIVE spend enforcement: price the next request at its frozen worst
      // case rather than discovering after it returns that the ceiling was crossed.
      if (accounting.spendUsd + worstCaseRequestUsd > options.spendCeilingUsd + 1e-9) {
        stopReason = 'SPEND_CEILING_REACHED'; break;
      }

      const callId = `${row.source.rowId}-${arm}-${options.processId}`;
      accounting.callsAttempted += 1;

      // The retry gate closes over the LIVE accounting, so it sees the initial request this call is
      // about to make. It is consulted only when a retry has actually been earned.
      const mayIssueRetry = (): { allowed: boolean; reason: string } => {
        if (accounting.providerRequestsAttempted + 1 > requestCeiling) {
          return { allowed: false,
            reason: `PROVIDER_REQUEST_CEILING_REACHED at ${accounting.providerRequestsAttempted}` };
        }
        if (accounting.spendUsd + worstCaseRequestUsd > options.spendCeilingUsd + 1e-9) {
          return { allowed: false,
            reason: `SPEND_CEILING_REACHED at $${accounting.spendUsd.toFixed(6)}` };
        }
        if (accounting.retryRequestsAttempted + 1 > retryRequestBudget) {
          return { allowed: false,
            reason: `RETRY_BUDGET_EXHAUSTED at ${accounting.retryRequestsAttempted} of `
              + `${retryRequestBudget}` };
        }
        // Counted at the moment of authorization, so the next gate call sees it.
        accounting.providerRequestsAttempted += 1;
        accounting.retryRequestsAttempted += 1;
        return { allowed: true, reason: '' };
      };

      accounting.providerRequestsAttempted += 1;          // the initial request, now authorized
      const run = await executeCall(options.provider!, input, options.nowIso, mayIssueRetry);

      // R2/R3. Usage accumulates across EVERY attempt, including one later replaced by a retry.
      // `usageOf` remains as an explicit override for replay and synthetic tests; when it is absent
      // the real per-attempt usage the adapter reported is used, which is the production path.
      const override = options.usageOf?.(callId);
      const attemptUsage = run.attempts.map(a => a.usage);
      const sum = (pick: (u: NonNullable<typeof attemptUsage[number]>) => number | null) =>
        attemptUsage.reduce((t, u) => t + (u ? (pick(u) ?? 0) : 0), 0);
      const usage = override ?? {
        inputTokens: sum(u => u.inputTokens),
        outputTokens: sum(u => u.outputTokens),
        costUsd: sum(u => u.costUsd),
      };
      accounting.inputTokens += usage.inputTokens;
      accounting.outputTokens += usage.outputTokens;
      accounting.spendUsd += usage.costUsd;
      if (run.layer.status === 'PRESENT' || run.layer.status === 'OUTPUT_REJECTED') {
        accounting.callsCompleted += 1;
      }
      for (const a of run.attempts) if (a.causedRetry) retryCauses.push(a.causedRetry);
      if (run.retrySuppressed) {
        retriesSuppressed.push({ rowId: row.source.rowId, arm,
          cause: run.retrySuppressed.cause, reason: run.retrySuppressed.reason });
      }

      const merged = mergeExpertIntelligence(det.deterministic, det.governed, run.layer);
      calls.push({
        rowId: row.source.rowId,
        callId,
        arm,
        processId: options.processId,
        layerStatus: run.layer.status,
        failureKind: run.failure?.kind ?? null,
        issues: run.issues,
        analysis: run.layer.validated?.analysis ?? null,
        merged,
        mergeViolations: verifyMergeInvariants(merged, det.deterministic, det.governed),
        latencyMs: run.trace.totalMs,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.costUsd,
        modelIdentity: run.trace.providerModelIdentity,
        // R3. The attempt history is PERSISTED, not recomputed. M13's frozen denominator reads it.
        attempts: run.attempts,
        retrySuppressed: run.retrySuppressed,
      });
    }

    const record: CohortRunRecord = {
      row,
      deterministicFamiliesEmitted: det.familiesEmitted,
      lifeCriticalFindingKeys: det.lifeCriticalFindingKeys,
      calls,
    };
    records.push(record);
    // §139. DURABLE BEFORE THE NEXT ROW. Deliberately not wrapped in try/catch: if the evidence for
    // a spent call cannot be written down, continuing would spend more money producing more
    // evidence that also cannot be written down.
    options.recordSink?.(record);

    if (stopReason === 'CALL_CEILING_REACHED' || stopReason === 'SPEND_CEILING_REACHED'
        || stopReason === 'REQUEST_CEILING_REACHED') break;
  }

  const adjudicationQueue = buildAdjudicationQueue(records);
  const scoring = options.mode === 'ENABLED'
    ? buildScoringReport(records, adjudications)
    : null;

  return {
    harnessVersion: EXPERT_COHORT_HARNESS_VERSION, mode: options.mode, stopReason, rowProblems,
    records, requestsBuilt, adjudicationQueue, scoring, accounting,
    retryCauses, retriesSuppressed, identityViolation: null,
    providerInvocations: providerInvocations,
  };
}
