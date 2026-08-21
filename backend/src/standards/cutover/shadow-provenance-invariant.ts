/**
 * KG-4C -- the SHADOW provenance invariant, made structural.
 *
 * THE RULE, WITH NO EXCEPTIONS.
 *
 *     In SHADOW, `knowledgeReleaseId` is NULL. Analysis level and finding level. Always.
 *
 * Even when an active release exists, even when the governed content is `APPROVED_EXACT`, even when
 * the account is allowlisted, even when every shadow comparison succeeded. A background comparison
 * is not consumption, and provenance is a claim that the customer-visible result was influenced by a
 * governed release. In SHADOW it was not, so any id would be a false claim about a real customer
 * record -- and unlike a telemetry error, a false provenance stamp is PERSISTED and outlives the run.
 *
 * WHY THIS EXISTS WHEN THE BEHAVIOUR IS ALREADY CORRECT. KG-4A/KG-4B already produce NULL here, by
 * three independent mechanisms: `decideFallback()` returns `governedProvenanceEligible: false` for
 * every SHADOW row, the context returns a null backing input, and
 * `describeGovernedRetrievalScoping()` returns `unscoped_corpus` for SHADOW. Three mechanisms
 * agreeing is good; it is not the same as one mechanism that cannot be bypassed. A future mode, a
 * refactor, or a well-meaning "SHADOW should record which release it compared against" would only
 * have to break ONE of the three. This function is the place where breaking any of them is caught.
 *
 * IT CORRECTS RATHER THAN THROWS. The caller is inside a customer request. Throwing would convert a
 * governance bug into a customer 500, which is precisely the failure mode KG-4B's six injections
 * were built to prevent. So the invariant coerces to NULL -- the safe value -- and reports the
 * violation, which the circuit breaker treats as a hard, threshold-zero condition and stops shadow
 * entirely. Safe result for this customer, immediate stop for everyone else.
 */

import type { GovernedCutoverMode } from './cutover-mode';

export interface ShadowProvenanceSubject {
  analysisKnowledgeReleaseId: string | null;
  findingKnowledgeReleaseIds: Record<string, string | null>;
}

export type ShadowProvenanceViolationKind =
  | 'ANALYSIS_ID_WRITTEN_IN_SHADOW'
  | 'FINDING_ID_WRITTEN_IN_SHADOW';

export interface ShadowProvenanceEnforcement<T extends ShadowProvenanceSubject> {
  /** The corrected subject. In SHADOW every id is NULL; in other modes the input is untouched. */
  result: T;
  violated: boolean;
  /** Categorical violation kinds. Finding KEYS are structural identifiers, never customer data. */
  violations: ShadowProvenanceViolationKind[];
  /** How many finding ids had to be coerced. A count, for the breaker. */
  coercedFindingCount: number;
}

/**
 * Enforces the invariant.
 *
 * Non-SHADOW modes pass through completely untouched -- this function has no opinion about governed
 * delivery, which is allowed and required to write provenance. Its whole scope is SHADOW.
 */
export function enforceShadowProvenanceInvariant<T extends ShadowProvenanceSubject>(
  mode: GovernedCutoverMode,
  subject: T,
): ShadowProvenanceEnforcement<T> {
  if (mode !== 'SHADOW') {
    return { result: subject, violated: false, violations: [], coercedFindingCount: 0 };
  }

  const violations: ShadowProvenanceViolationKind[] = [];
  let coercedFindingCount = 0;

  const analysisViolated = subject.analysisKnowledgeReleaseId !== null;
  if (analysisViolated) violations.push('ANALYSIS_ID_WRITTEN_IN_SHADOW');

  const findingKnowledgeReleaseIds: Record<string, string | null> = {};
  for (const [findingKey, value] of Object.entries(subject.findingKnowledgeReleaseIds ?? {})) {
    if (value !== null) {
      coercedFindingCount += 1;
      if (!violations.includes('FINDING_ID_WRITTEN_IN_SHADOW')) {
        violations.push('FINDING_ID_WRITTEN_IN_SHADOW');
      }
    }
    findingKnowledgeReleaseIds[findingKey] = null;
  }

  return {
    result: { ...subject, analysisKnowledgeReleaseId: null, findingKnowledgeReleaseIds },
    violated: violations.length > 0,
    violations,
    coercedFindingCount,
  };
}

/**
 * A pure predicate for suites and for the readiness gate: is this subject compliant for this mode?
 *
 * Separate from the enforcement function on purpose. A test that asserts compliance by calling the
 * enforcer would be asserting that the enforcer corrected the value, not that the SYSTEM produced a
 * compliant one -- which is the difference between testing the guard and testing the thing guarded.
 */
export function shadowProvenanceIsCompliant(
  mode: GovernedCutoverMode,
  subject: ShadowProvenanceSubject,
): boolean {
  if (mode !== 'SHADOW') return true;
  if (subject.analysisKnowledgeReleaseId !== null) return false;
  return Object.values(subject.findingKnowledgeReleaseIds ?? {}).every((value) => value === null);
}
