/**
 * §165 EXPERT HAZLENZ -- TARGET-COVERAGE POSTCONDITION. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS COMPUTES, AND WHAT IT REFUSES TO ====================
 *
 * A SET DIFFERENCE. Nothing else. The owed set is known before the verifier runs; the admitted
 * declarations name the keys they bound; the uncovered set is the unresolved facts whose keys are
 * absent from that list. There is no matcher, no threshold, no score and no model input.
 *
 * `evaluateTargetCoverage` takes fact keys and statuses. It is not GIVEN the question text, so it
 * cannot consult it -- the restriction is in the type signature rather than in a rule someone could
 * relax later.
 *
 * ==================== THE TWO THRESHOLDS, STATED RATHER THAN CHOSEN QUIETLY ====================
 *
 * §164 §8 defines the warning over `LIFE_CRITICAL` and `REQUIRED_CONTROL` facts. The §165
 * authorization defines it over EVERY fact that remains `UNRESOLVED`. These differ, and the
 * difference is not editorial: the §165 form fires on an uncovered `OTHER`-priority gap and the
 * §164 form does not.
 *
 * This module implements the STRICTER §165 form as `TARGET_COVERAGE_WARNING`, and reports the §164
 * form alongside it as `priorityGatedWarning` so neither reading is lost. Choosing the looser rule
 * silently would be a relaxation of a governance surface, and choosing the stricter one without
 * saying so would misreport §164.
 *
 * ==================== IT NEVER SILENTLY CLEARS ====================
 *
 * The result is persisted whether or not it was resolved, and the permitted responses are bounded
 * and ordered: one targeted re-check naming the uncovered keys, then arbitration, then fail closed.
 * `permittedResponses()` returns that order; there is no fourth option and no "accept" member.
 */

import {
  type OwedFactLedger, type OwedFactPriority, factOf,
} from './expert-owed-facts';

export const TARGET_COVERAGE_VERSION = 'hazlenz.expert.target-coverage.v1' as const;

/**
 * How the verdict is computed. A constant rather than a comment so that a later edit introducing a
 * semantic step contradicts a published value the proof suite asserts.
 */
export const COVERAGE_COMPUTATION_METHOD =
  'DETERMINISTIC_CLOSED_SET_MEMBERSHIP_OVER_DECLARED_BINDINGS' as const;

/** Priorities §164 §8 gates its warning on. */
export const COVERAGE_PRIORITY_GATE: readonly OwedFactPriority[] =
  ['LIFE_CRITICAL', 'REQUIRED_CONTROL'];

export const COVERAGE_RESPONSES = [
  'ONE_BOUNDED_RECHECK_NAMING_THE_UNCOVERED_KEYS',
  'ARBITRATION_WITH_A_RECORDED_REASON',
  'FAIL_CLOSED_SURFACE_THE_UNRESOLVED_SAFETY_STATE',
] as const;
export type CoverageResponse = (typeof COVERAGE_RESPONSES)[number];

export interface CoverageFactState {
  readonly factKey: string;
  readonly priority: OwedFactPriority;
  readonly status: string;
  readonly boundByDeclarationIds: readonly string[];
  readonly covered: boolean;
}

export interface TargetCoverageResult {
  readonly version: string;
  readonly method: typeof COVERAGE_COMPUTATION_METHOD;
  /** The §165 rule: TRUE if ANY owed fact remains UNRESOLVED and unbound. */
  readonly TARGET_COVERAGE_WARNING: boolean;
  /** The §164 §8 rule: gated on LIFE_CRITICAL / REQUIRED_CONTROL. Reported, never substituted. */
  readonly priorityGatedWarning: boolean;
  readonly uncoveredFactKeys: readonly string[];
  readonly uncoveredPriorityGatedFactKeys: readonly string[];
  readonly perFact: readonly CoverageFactState[];
  readonly reason: string;
}

/**
 * The postcondition. Inputs are keys and statuses only.
 *
 * `boundFactKeys` must come from ADMITTED declarations. A refused declaration binds nothing, which
 * is why `checkBindingDeclarations` returns `boundFactKeys` from its admitted set rather than from
 * everything it was handed.
 */
export function evaluateTargetCoverage(
  ledger: OwedFactLedger,
  boundFactKeys: readonly string[],
  bindingMap: Readonly<Record<string, string>> = {},
): TargetCoverageResult {
  const bound = new Set(boundFactKeys);
  const perFact: CoverageFactState[] = ledger.facts.map(f => {
    const declarationIds = Object.entries(bindingMap)
      .filter(([, key]) => key === f.factKey).map(([id]) => id);
    return {
      factKey: f.factKey,
      priority: f.priority,
      status: f.status,
      boundByDeclarationIds: declarationIds,
      covered: f.status === 'COVERED' && bound.has(f.factKey),
    };
  });

  const uncovered = ledger.facts
    .filter(f => f.status === 'UNRESOLVED' && !bound.has(f.factKey))
    .map(f => f.factKey);
  const uncoveredGated = uncovered
    .filter(k => COVERAGE_PRIORITY_GATE.includes(factOf(ledger, k)!.priority));

  return {
    version: TARGET_COVERAGE_VERSION,
    method: COVERAGE_COMPUTATION_METHOD,
    TARGET_COVERAGE_WARNING: uncovered.length > 0,
    priorityGatedWarning: uncoveredGated.length > 0,
    uncoveredFactKeys: uncovered,
    uncoveredPriorityGatedFactKeys: uncoveredGated,
    perFact,
    reason: uncovered.length === 0
      ? 'every owed fact is COVERED by an admitted binding, SETTLED_BY_EVIDENCE, or '
        + 'REJECTED_BY_ARBITRATION'
      : `${uncovered.length} owed fact(s) remain UNRESOLVED with no admitted binding: `
        + uncovered.join(', '),
  };
}

/**
 * The bounded, ordered responses to a warning. There is no member meaning "proceed anyway", and the
 * ordering is returned rather than left to a call site to remember.
 */
export function permittedResponses(result: TargetCoverageResult): readonly CoverageResponse[] {
  return result.TARGET_COVERAGE_WARNING ? COVERAGE_RESPONSES : [];
}

/**
 * Refuses a claim that a warning was cleared without a recorded cause.
 *
 * A warning may go from TRUE to FALSE only if every previously uncovered key now carries a recorded
 * transition -- a binding, an evidence settlement or an arbitration. "It cleared on the second look"
 * is not a cause, and neither is a second silence.
 */
export function unexplainedCoverageClearances(
  before: TargetCoverageResult,
  after: TargetCoverageResult,
  ledgerAfter: OwedFactLedger,
): string[] {
  if (!before.TARGET_COVERAGE_WARNING) return [];
  const stillUncovered = new Set(after.uncoveredFactKeys);
  const problems: string[] = [];
  for (const key of before.uncoveredFactKeys) {
    if (stillUncovered.has(key)) continue;
    const transitioned = ledgerAfter.transitions.some(t => t.factKey === key);
    if (!transitioned) {
      problems.push(`COVERAGE_CLEARED_WITHOUT_A_RECORDED_TRANSITION:${key}`);
    }
  }
  return problems;
}
