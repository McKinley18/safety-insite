/**
 * §198 -- EMPTY-RUN SAFETY. A PERMANENT INVARIANT, EXTRACTED FROM THE §197 CORRECTION.
 *
 * ==================== ABSENCE OF OBSERVATIONS IS NOT EVIDENCE OF SAFE BEHAVIOUR ====================
 *
 * §197's scorer, on a run where NOTHING EXECUTED, printed:
 *
 *     P settlement      NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT
 *     HARD FAILS        none triggered
 *
 * Both were literally true. No provider output settled any fact, because there was no provider
 * output. No hard fail triggered, because nothing ran. And both read as green.
 *
 * That is the §193 lesson arriving on a different instrument: an audit that cannot see its subject
 * must SAY SO rather than return clean, because a silent no-match is indistinguishable from a clean
 * result. §197 corrected it in place; §198 makes it an invariant that lives in one module, is
 * imported by every scorer, and is regression-tested.
 *
 * ==================== THE RULE ====================
 *
 *   completed model executions = 0  =>  NO behavioural or semantic axis may emit a positive verdict
 *
 * Not "should not". The functions below cannot express one: on an empty denominator they return the
 * empty-run state regardless of what the caller computed, so a caller that gets the arithmetic right
 * and the reporting wrong is not possible.
 */

export const EMPTY_RUN_SAFETY_VERSION = 'hazlenz.expert.empty-run-safety.v1' as const;

export const NOT_EXERCISED = 'NOT_EXERCISED' as const;
export const NOT_EVALUABLE = 'NOT_EVALUABLE' as const;

/**
 * Wording that must never appear as an axis result on a run with zero completed executions.
 *
 * Held as data so the regression can assert the absence of the CLASS rather than of one string
 * somebody happened to think of. Every entry is a phrase that asserts something POSITIVE about
 * observed behaviour.
 */
export const FORBIDDEN_EMPTY_RUN_PHRASES: readonly string[] = [
  'NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT',
  'NO_UNSUPPLIED_CITATION_WAS_ADMITTED',
  'none triggered',
  'PASS',
  'CLEAN',
  'HELD',
  'NO_VIOLATIONS',
];

/**
 * The result of one axis.
 *
 * `n` is the number of executions where the behaviour was GENUINELY AVAILABLE — the opportunity
 * denominator, not the total call count. An axis nobody had a chance to exercise is `NOT_EXERCISED`
 * whether or not the run as a whole produced output.
 */
export function axisResult(n: number, verdictWhenExercised: string): string {
  if (!Number.isFinite(n) || n <= 0) {
    return `${NOT_EXERCISED} — empty denominator; this axis is neither a pass nor a failure`;
  }
  return verdictWhenExercised;
}

/** `x/n` where n > 0, and the empty-run state otherwise. Never `0/0`, which reads as a score. */
export function axisRatio(x: number, n: number): string {
  if (!Number.isFinite(n) || n <= 0) {
    return `${NOT_EXERCISED} — empty denominator`;
  }
  // A single observation is reported literally and never as a percentage.
  return n < 5 ? `${x}/${n} (NOT_MEANINGFULLY_ESTIMABLE as a rate at n=${n})` : `${x}/${n}`;
}

export interface HardFailEvaluability {
  readonly EVALUABLE: boolean;
  readonly anyTriggered: boolean | null;
  readonly note: string | null;
}

/**
 * Whether the hard-fail block means anything on this run.
 *
 * `anyTriggered` is `null` and not `false` when nothing ran. `false` asserts that the conditions
 * were checked and held; `null` says the question was not askable. The difference is the entire
 * point of this module.
 */
export function hardFailEvaluability(
  completedExecutions: number, anyTriggeredWhenEvaluable: boolean,
): HardFailEvaluability {
  if (completedExecutions > 0) {
    return { EVALUABLE: true, anyTriggered: anyTriggeredWhenEvaluable, note: null };
  }
  return {
    EVALUABLE: false,
    anyTriggered: null,
    note: 'NOT EVALUABLE. No inference occurred, so no hard-fail condition could have been '
      + 'triggered or cleared. "none triggered" on such a run means "nothing ran", NOT "the '
      + 'architecture held".',
  };
}

/**
 * The whole-run guard a scorer applies to its own output before writing it.
 *
 * Returns the offending values rather than throwing, so a scorer can record its own defect in the
 * evidence instead of dying and leaving nothing behind — which is what an instrument that catches
 * itself should do.
 */
export function emptyRunReportingViolations(
  completedExecutions: number, axisResults: Readonly<Record<string, string>>,
): string[] {
  if (completedExecutions > 0) return [];
  const violations: string[] = [];
  for (const [axis, value] of Object.entries(axisResults)) {
    if (typeof value !== 'string') continue;
    if (value.startsWith(NOT_EXERCISED) || value.startsWith(NOT_EVALUABLE)) continue;
    for (const phrase of FORBIDDEN_EMPTY_RUN_PHRASES) {
      if (value.toUpperCase().includes(phrase.toUpperCase())) {
        violations.push(`${axis}: ${JSON.stringify(value)} asserts observed behaviour on a run with `
          + 'zero completed executions');
        break;
      }
    }
  }
  return violations;
}
