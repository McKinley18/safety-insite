/**
 * `D-K` — SYSTEMIC PERMANENT-PROVIDER-FAILURE ABORT.  THE WIRING, NOT A REDESIGN.
 *
 * This file implements the ALREADY-FROZEN Amendment-3 `D-K` predicate exactly as written in
 * `verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md`
 * (sha256 `a7da57e4…`, lines 951-996) and restated in section 7 of the Run-2
 * `ACCEPTANCE_ARTIFACT_FREEZE.txt`. It CHANGES NOTHING about that predicate.
 *
 *   D-K.2, verbatim:
 *     "After spend, the run ABORTS at the first required row that ends PROVIDER_EVALUATED = FALSE
 *      once the frozen retry policy for that row is exhausted."
 *
 * NO STREAK. NO CONFIGURABLE THRESHOLD. NO TUNING CONSTANT. NO SEMANTIC INSPECTION. NO
 * HAZARD-DEPENDENT BEHAVIOUR. NO RESPONSE-QUALITY JUDGEMENT. This file reads exactly one thing —
 * the frozen transport/provider failure classification carried on the frozen `L3ReasoningOutcome`
 * union — and it reads nothing else. It never sees observation text, expected truth, gate
 * membership, hazard family or any prior model performance, because none of those values is even
 * passed to it.
 *
 * NO RETRY IS ADDED AND NO RETRY IS REMOVED. The frozen retry policy lives entirely inside
 * `runValidatedReasoning` (`reasoning-runner.ts`): a transport retry ceiling of one over
 * `RETRYABLE_PROVIDER_FAILURES`, plus the single frozen SHAPE retry over
 * `RETRYABLE_VALIDATION_REASONS`. This file is only ever consulted AFTER that function has
 * returned, which is precisely "once the frozen retry policy for that row is exhausted". No
 * semantic retry is introduced here and none is reachable from here.
 *
 * ---------------------------------------------------------------------------------------------
 * `PROVIDER_EVALUATED`, per `D-G.3` — MECHANICAL AND CONTENT-BLIND
 * ---------------------------------------------------------------------------------------------
 * TRUE  iff the provider returned HTTP 200 through the frozen shim AND the response reached the
 *       frozen response/schema boundary. Against the frozen taxonomy of
 *       `hazlenz-reasoning-provider.ts`, as surfaced by `reasoning-runner.ts`:
 *
 *   outcome.kind                    frozen provider result            PROVIDER_EVALUATED
 *   ------------------------------  --------------------------------  ------------------
 *   VALIDATED                       {ok:true, proposal}               TRUE
 *   NO_HAZARD_ESTABLISHED           {ok:true, proposal}               TRUE
 *   INSUFFICIENT_EVIDENCE           {ok:true, proposal}               TRUE
 *   REJECTED_OUTPUT                 {ok:true, proposal}               TRUE   (validator rejected a
 *                                                                            real model answer)
 *   MALFORMED_OUTPUT                MALFORMED_STRUCTURED_OUTPUT       TRUE   (the model produced
 *                                                                            output; G10 measures
 *                                                                            exactly this)
 *   PROVIDER_UNAVAILABLE + failure  PROVIDER_REFUSAL                  TRUE   (a refusal is model
 *                                                                            behaviour)
 *   PROVIDER_TIMEOUT                TIMEOUT                           FALSE
 *   PROVIDER_UNAVAILABLE + failure  UNAVAILABLE                       FALSE
 *   PROVIDER_UNAVAILABLE + failure  TRANSIENT_ERROR                   FALSE
 *   PROVIDER_UNAVAILABLE + failure  PERMANENT_CONFIGURATION_ERROR     FALSE
 *
 * FAIL-CLOSED. Any outcome kind or failure kind this file does not recognise is NOT evaluated and
 * is reported as `UNRECOGNISED_OUTCOME`. Silence can never buy a pass, and it can never buy a
 * continued run either.
 *
 * IT IS NEVER INFERRED from transmission, from a row having been attempted, from an error
 * placeholder existing, or from a scorer-input record existing.
 *
 * ---------------------------------------------------------------------------------------------
 * PROCESS-PAIR COORDINATION
 * ---------------------------------------------------------------------------------------------
 * Run 2 requires TWO isolated evaluation processes (section 38.3, `G9`). By `D-G.2` the complete
 * measurement requires set equality of evaluated row ids with expected row ids in EVERY required
 * process, so the FIRST required unevaluated row in EITHER process already makes the complete
 * Run-2 measurement impossible. The abort is therefore GLOBAL, not per-process.
 *
 * The signal is a single file in the run directory, written once and never removed by this code.
 * It is checked BETWEEN rows only — never mid-flight — so an already-issued request always runs to
 * completion and its raw evidence is recorded intact. This is the mechanism that prevents the
 * Run-1 pattern in which process B issued 92 further calls after complete-run scorability had
 * already become impossible in process A.
 */
import { readFileSync, writeFileSync, renameSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/** The frozen retryable transport class (`RETRYABLE_PROVIDER_FAILURES`), for classification only. */
export const TRANSIENT_TRANSPORT_FAILURE_KINDS = ['TIMEOUT', 'TRANSIENT_ERROR', 'MALFORMED_STRUCTURED_OUTPUT'] as const;
/** The frozen non-retryable permanent class. */
export const PERMANENT_PROVIDER_REJECTION_KINDS = ['PERMANENT_CONFIGURATION_ERROR'] as const;
/** `D-G.3`: kinds in which the MODEL PRODUCED OUTPUT. */
export const EVALUATED_FAILURE_KINDS = ['MALFORMED_STRUCTURED_OUTPUT', 'PROVIDER_REFUSAL'] as const;
/** `D-G.3`: kinds in which NO model output ever existed. */
export const NOT_EVALUATED_FAILURE_KINDS = ['TIMEOUT', 'UNAVAILABLE', 'TRANSIENT_ERROR', 'PERMANENT_CONFIGURATION_ERROR'] as const;

export type DkFailureClass =
  | 'PROVIDER_EVALUATED'
  | 'TRANSIENT_TRANSPORT_FAILURE'
  | 'PERMANENT_PROVIDER_REJECTION'
  | 'UNRECOGNISED_OUTCOME';

export interface DkClassification {
  /** The `D-G.3` declaration. The scorer consumes this field and fails closed without it. */
  providerEvaluated: boolean;
  /** The frozen provider failure kind, or `null` when the provider answered. */
  failureKind: string | null;
  /** The frozen outcome kind, recorded verbatim. */
  outcomeKind: string;
  /** `D-K.1` class. Recorded as evidence; the abort predicate does NOT branch on it. */
  failureClass: DkFailureClass;
}

/** The minimum shape of a frozen `L3RunResult` this predicate reads. It reads nothing else. */
export interface RunOutcomeLike {
  outcome: { kind: string; failure?: string };
}

/**
 * `D-G.3`, applied to the frozen outcome union. PURE. No I/O, no clock, no configuration.
 *
 * NOTE ON `MALFORMED_OUTCOME` AND `PROVIDER_REFUSAL`: both are `PROVIDER_EVALUATED = TRUE` and are
 * therefore incapable of firing `D-K`, exactly as Amendment 3 freezes them. A provider cannot
 * escape `G10` by emitting garbage, and it cannot convert its own refusal into a transport fault.
 */
export function classifyProviderEvaluation(run: RunOutcomeLike): DkClassification {
  const kind = run?.outcome?.kind;
  const failure = (run?.outcome as any)?.failure ?? null;

  switch (kind) {
    // The provider returned {ok:true} and the response reached the frozen response/schema
    // boundary. Whatever the validator or the binder then decided is MODEL BEHAVIOUR, not a
    // transport fault, and stays measurable.
    case 'VALIDATED':
    case 'NO_HAZARD_ESTABLISHED':
    case 'INSUFFICIENT_EVIDENCE':
    case 'REJECTED_OUTPUT':
      return { providerEvaluated: true, failureKind: null, outcomeKind: kind, failureClass: 'PROVIDER_EVALUATED' };

    // MALFORMED_STRUCTURED_OUTPUT. HTTP 200; the model produced output that failed at the
    // boundary. EVALUATED. It is also a member of the frozen transient class, so the frozen retry
    // ceiling of one has ALREADY been applied by `runValidatedReasoning` before we are called.
    case 'MALFORMED_OUTPUT':
      return {
        providerEvaluated: true, failureKind: 'MALFORMED_STRUCTURED_OUTPUT', outcomeKind: kind,
        failureClass: 'PROVIDER_EVALUATED',
      };

    // TIMEOUT. No response ever existed.
    case 'PROVIDER_TIMEOUT':
      return {
        providerEvaluated: false, failureKind: 'TIMEOUT', outcomeKind: kind,
        failureClass: 'TRANSIENT_TRANSPORT_FAILURE',
      };

    // Everything the frozen runner funnels through `PROVIDER_UNAVAILABLE`, discriminated by the
    // preserved `failure` field, which carries the frozen provider's OWN classification.
    case 'PROVIDER_UNAVAILABLE': {
      if (failure === 'PROVIDER_REFUSAL') {
        return {
          providerEvaluated: true, failureKind: failure, outcomeKind: kind,
          failureClass: 'PROVIDER_EVALUATED',
        };
      }
      if (failure === 'PERMANENT_CONFIGURATION_ERROR') {
        return {
          providerEvaluated: false, failureKind: failure, outcomeKind: kind,
          failureClass: 'PERMANENT_PROVIDER_REJECTION',
        };
      }
      if (failure === 'TRANSIENT_ERROR' || failure === 'UNAVAILABLE') {
        return {
          providerEvaluated: false, failureKind: failure, outcomeKind: kind,
          failureClass: 'TRANSIENT_TRANSPORT_FAILURE',
        };
      }
      // FAIL-CLOSED on an unrecognised failure kind.
      return {
        providerEvaluated: false, failureKind: failure === null ? null : String(failure),
        outcomeKind: kind, failureClass: 'UNRECOGNISED_OUTCOME',
      };
    }

    // FAIL-CLOSED on an unrecognised outcome kind.
    default:
      return {
        providerEvaluated: false, failureKind: failure === null ? null : String(failure),
        outcomeKind: typeof kind === 'string' ? kind : String(kind), failureClass: 'UNRECOGNISED_OUTCOME',
      };
  }
}

export interface DkAbortRecord {
  event: 'D_K_ABORT';
  /** The row at which the FIRST required unevaluated evaluation occurred. */
  abortRowId: string;
  abortExecutionIndex: number;
  abortProcessLabel: string;
  abortPid: number;
  failureKind: string | null;
  outcomeKind: string;
  failureClass: DkFailureClass;
  ts: string;
  /** `D-H`: spend is orthogonal to scorability and is NEVER reverted by this abort. */
  HOLDOUT_SPENT: true;
  SCORABLE: false;
  terminal: 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION';
  MODEL_ACCEPTANCE_RESULT: 'NOT_ESTABLISHED';
  automaticRerun: 'NONE';
  corpusRestored: false;
}

/**
 * The GLOBAL abort state shared by the required process pair. A file, written once.
 *
 * There is deliberately NO clear/reset/unfire operation on this class. Once a required provider
 * evaluation is permanently absent, nothing in this process or its sibling may make the run
 * schedulable again.
 */
export class DkGlobalAbort {
  constructor(private readonly flagPath: string, private readonly logPath?: string) {}

  /** True once EITHER required process has fired `D-K`. Checked BETWEEN rows only. */
  isAborted(): boolean {
    return existsSync(this.flagPath);
  }

  read(): DkAbortRecord | null {
    if (!existsSync(this.flagPath)) return null;
    try { return JSON.parse(readFileSync(this.flagPath, 'utf8')); } catch { return null; }
  }

  /**
   * Establish the global abort state. Written atomically (temp + rename) so a sibling process can
   * never observe a partial record, and NEVER overwritten — the FIRST abort is the abort, so a
   * later firing in the sibling process cannot rewrite which row ended the run.
   */
  fire(record: DkAbortRecord): DkAbortRecord {
    const existing = this.read();
    if (existing) return existing;
    mkdirSync(dirname(this.flagPath), { recursive: true });
    const tmp = `${this.flagPath}.tmp-${process.pid}`;
    writeFileSync(tmp, JSON.stringify(record, null, 2));
    renameSync(tmp, this.flagPath);
    if (this.logPath) {
      mkdirSync(dirname(this.logPath), { recursive: true });
      appendFileSync(this.logPath, JSON.stringify(record) + '\n');
    }
    return record;
  }
}
