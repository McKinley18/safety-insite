/**
 * §155 EXPERT HAZLENZ -- RELIABILITY OBSERVABILITY COUNTERS. DEVELOPMENT PROTOTYPE ONLY.
 *
 * ==================== THE COUNTER THIS FILE EXISTS TO RETIRE ====================
 *
 * `HISTORICAL_PROVIDER_INVOCATION_COUNT = 195` was copied verbatim into nine probe scripts between
 * 2026-09-02 and 2026-09-03 and never advanced. It therefore excludes §152, §153 and §154 -- three
 * runs of sixteen calls each -- and reading it as "how many provider calls have been made" is
 * wrong by 48 and would get worse with every run. Nothing was ever computed from it, so no metric
 * is affected; the defect is that the name promises a cumulative ledger the value is not.
 *
 * §155 renames the concept rather than repairing the number, because the number was never wrong for
 * what it actually is:
 *
 *   FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT = 195
 *
 * -- the IMMUTABLE count associated with the historical formal evaluation, which is spent and
 * whose result (FORMAL_EVALUATION_FAIL, NOT ACCEPTED) is preserved. It is a historical constant,
 * not a running total, and it must never be incremented.
 *
 * >>> NO HISTORICAL ARTIFACT IS EDITED TO ADD ANY OF THIS. §152-§154's stored records keep the
 * >>> field name and value they were written with. Retrofitting counters into artifacts written
 * >>> before the counters existed would make the evidence say something it did not say at the time.
 */

export const EXPERT_RELIABILITY_COUNTERS_VERSION =
  'hazlenz.expert.reliability-counters.v1' as const;

/**
 * The immutable historical formal count. Exported as a named constant so a future script consumes
 * THIS rather than re-declaring `195` with an ambiguous name for the tenth time.
 */
export const FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT = 195 as const;

/**
 * The deprecated name, kept only so a reader who greps for it finds the explanation instead of the
 * value. It is a string, not a number, and it is deliberately unusable in arithmetic.
 */
export const HISTORICAL_PROVIDER_INVOCATION_COUNT_DEPRECATED =
  'DEPRECATED — see FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT (195, the immutable count of the '
  + 'historical formal evaluation). This name was ambiguous between a frozen historical figure and '
  + 'a running total, was never advanced across nine probes, and must not be used for new '
  + 'development evidence.';

export interface ExpertReliabilityCounters {
  /** Requests THIS process issued. The only number a single run may report as its own. */
  PROVIDER_REQUEST_COUNT_THIS_RUN: number;
  /**
   * Cumulative development requests. `null` until a real append-only ledger exists -- and null is
   * the honest value, because summing the runs by hand produces a figure no artifact attests.
   * §155 designs the field and does NOT invent the number.
   */
  DEVELOPMENT_PROVIDER_REQUEST_COUNT_CUMULATIVE: number | null;
  /** Immutable. Never incremented, never derived from, never added to a running total. */
  FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT: typeof FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT;

  DEGENERATE_PROVIDER_OUTPUT_COUNT: number;
  DEGENERATE_REISSUE_COUNT: number;
  /** Reissues whose SECOND response was not degenerate. Recovery, measured rather than assumed. */
  DEGENERATE_REISSUE_RECOVERY_COUNT: number;
  /** Reissues earned and refused by a budget. A suppression must never look like an absence. */
  DEGENERATE_REISSUE_SUPPRESSED_COUNT: number;
  /** Degenerate on both attempts. The fail-closed tail. */
  DEGENERATE_FAILED_CLOSED_COUNT: number;

  SELECTIVE_VERIFICATION_TRIGGER_COUNT: number;
  SELECTIVE_VERIFICATION_CALL_COUNT: number;
  SELECTIVE_VERIFICATION_CHANGED_CLARIFICATION_COUNT: number;
  SELECTIVE_VERIFICATION_ABSTAIN_COUNT: number;
  /** Verifier outputs the miniature boundary refused. Distinct from an abstention. */
  SELECTIVE_VERIFICATION_REJECTED_OUTPUT_COUNT: number;
}

export function emptyReliabilityCounters(): ExpertReliabilityCounters {
  return {
    PROVIDER_REQUEST_COUNT_THIS_RUN: 0,
    DEVELOPMENT_PROVIDER_REQUEST_COUNT_CUMULATIVE: null,
    FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT,
    DEGENERATE_PROVIDER_OUTPUT_COUNT: 0,
    DEGENERATE_REISSUE_COUNT: 0,
    DEGENERATE_REISSUE_RECOVERY_COUNT: 0,
    DEGENERATE_REISSUE_SUPPRESSED_COUNT: 0,
    DEGENERATE_FAILED_CLOSED_COUNT: 0,
    SELECTIVE_VERIFICATION_TRIGGER_COUNT: 0,
    SELECTIVE_VERIFICATION_CALL_COUNT: 0,
    SELECTIVE_VERIFICATION_CHANGED_CLARIFICATION_COUNT: 0,
    SELECTIVE_VERIFICATION_ABSTAIN_COUNT: 0,
    SELECTIVE_VERIFICATION_REJECTED_OUTPUT_COUNT: 0,
  };
}

/**
 * Invariants a run's counters must satisfy. Returned as violations rather than thrown, so a harness
 * reports them beside the run instead of losing the run to an exception.
 */
export function counterInvariantViolations(c: ExpertReliabilityCounters): string[] {
  const v: string[] = [];
  if (c.FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT !== 195) {
    v.push('FROZEN_FORMAL_COUNT_MUTATED — it is 195 and immutable');
  }
  if (c.DEGENERATE_REISSUE_COUNT > c.DEGENERATE_PROVIDER_OUTPUT_COUNT) {
    v.push('MORE_REISSUES_THAN_DEGENERATE_RESPONSES');
  }
  if (c.DEGENERATE_REISSUE_RECOVERY_COUNT > c.DEGENERATE_REISSUE_COUNT) {
    v.push('MORE_RECOVERIES_THAN_REISSUES');
  }
  if (c.DEGENERATE_REISSUE_COUNT + c.DEGENERATE_REISSUE_SUPPRESSED_COUNT
      + c.DEGENERATE_FAILED_CLOSED_COUNT > c.DEGENERATE_PROVIDER_OUTPUT_COUNT
      + c.DEGENERATE_REISSUE_COUNT) {
    v.push('DEGENERATE_DISPOSITIONS_EXCEED_DEGENERATE_OBSERVATIONS');
  }
  if (c.SELECTIVE_VERIFICATION_CALL_COUNT > c.SELECTIVE_VERIFICATION_TRIGGER_COUNT) {
    v.push('MORE_VERIFIER_CALLS_THAN_TRIGGERS');
  }
  if (c.SELECTIVE_VERIFICATION_CHANGED_CLARIFICATION_COUNT
      + c.SELECTIVE_VERIFICATION_ABSTAIN_COUNT > c.SELECTIVE_VERIFICATION_CALL_COUNT) {
    v.push('MORE_VERIFIER_OUTCOMES_THAN_VERIFIER_CALLS');
  }
  return v;
}
