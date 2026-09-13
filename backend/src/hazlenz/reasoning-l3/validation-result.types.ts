/**
 * Deterministic validation states and stable reason codes.
 *
 * Reason codes are the machine contract. Callers must branch on `code`, never on message prose --
 * the same lesson the shadow taxonomy learned (blueprint D-32).
 */
export const L3_VALIDATION_STATES = ['VALID', 'RETRYABLE_MODEL_OUTPUT', 'REJECTED_MODEL_OUTPUT'] as const;
export type L3ValidationState = (typeof L3_VALIDATION_STATES)[number];

export const L3_VALIDATION_REASONS = [
  // structure
  'SCHEMA_INVALID',
  'CONTRACT_VERSION_MISMATCH',
  'ANALYSIS_ID_MISMATCH',
  // taxonomy + state
  'UNSUPPORTED_HAZARD_FAMILY',
  'INVALID_CONDITION_STATE',
  'DUPLICATE_CANDIDATE',
  // evidence
  'EVIDENCE_MISSING',
  'EVIDENCE_SOURCE_UNKNOWN',
  'EVIDENCE_OUT_OF_BOUNDS',
  'EVIDENCE_TEXT_MISMATCH',
  'EVIDENCE_NEGATION_SCOPE_TRUNCATED',
  // regulatory
  'INVENTED_REGULATORY_CANDIDATE',
  'UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE',
  'REGULATORY_TEXT_NOT_PERMITTED',
  // governance
  'GOVERNANCE_FIELD_NOT_PERMITTED',
  'JURISDICTION_PROVENANCE_NOT_PERMITTED',
  // grounding
  'UNGROUNDED_CORRECTIVE_ACTION',
  'INVALID_CLARIFICATION_DEPENDENCY',
  // L3-2i -- proposal-level (candidate-independent) clarification carrier
  'UNRESOLVED_DECISION_MALFORMED',
  'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL',
  'ADVISORY_SIGNAL_CANNOT_GROUND_FINDING',
  // outcome coherence
  'OUTCOME_CANDIDATE_MISMATCH',
  'UNAVAILABLE_CANNOT_CARRY_CANDIDATES',
] as const;
export type L3ValidationReason = (typeof L3_VALIDATION_REASONS)[number];

export interface L3ValidationIssue {
  code: L3ValidationReason;
  /** Which candidate the issue belongs to, when candidate-scoped. */
  candidateKey?: string;
  detail: string;
}

/** Reasons that indicate a well-formed provider that produced a fixable shape. */
export const RETRYABLE_VALIDATION_REASONS: readonly L3ValidationReason[] = [
  'SCHEMA_INVALID', 'CONTRACT_VERSION_MISMATCH',
];

/**
 * Reasons that must NEVER be retried. A proposer that invented evidence or a citation is not asked
 * again for the same observation (blueprint section 29.6).
 */
export const NON_RETRYABLE_VALIDATION_REASONS: readonly L3ValidationReason[] = [
  'EVIDENCE_TEXT_MISMATCH', 'EVIDENCE_OUT_OF_BOUNDS', 'EVIDENCE_SOURCE_UNKNOWN',
  'EVIDENCE_NEGATION_SCOPE_TRUNCATED', 'INVENTED_REGULATORY_CANDIDATE',
  'UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE', 'GOVERNANCE_FIELD_NOT_PERMITTED',
  'REGULATORY_TEXT_NOT_PERMITTED', 'JURISDICTION_PROVENANCE_NOT_PERMITTED',
  'ADVISORY_SIGNAL_CANNOT_GROUND_FINDING',
];

/**
 * L3-2i. Reasons that are RECORDED but do not invalidate the proposal, because the thing refused is
 * a QUESTION and a question is not the hazard.
 *
 * `A SUPERFLUOUS QUESTION IS DROPPED; IT NEVER DESTROYS THE ANALYSIS THAT CARRIED IT`
 *
 * This is section 34.2's rule, lifted verbatim from the candidate level where it already holds:
 * *"IT NEVER TOUCHES THE HAZARD. The candidate, its family, its state, its evidence and its
 * rationale are returned unchanged; only the question is removed, and the removal is recorded as an
 * advisory."* Making a proposal-level question fatal would throw away a correct analysis over
 * something the pipeline can simply not ask -- measured on `C-CS-05`, whose correct HYPOTHETICAL
 * candidate was being discarded along with its unnecessary question.
 *
 * ONLY the two L3-2i codes are in this set. No pre-existing reason changes fatality, and the suite
 * asserts that.
 */
export const NON_BLOCKING_VALIDATION_REASONS: readonly L3ValidationReason[] = [
  'UNRESOLVED_DECISION_MALFORMED',
  'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL',
];

export function validationStateForIssues(issues: L3ValidationIssue[]): L3ValidationState {
  // Non-blocking issues stay in `issues` for the operator and are excluded from the verdict.
  const deciding = issues.filter(i => !NON_BLOCKING_VALIDATION_REASONS.includes(i.code));
  if (deciding.length === 0) return 'VALID';
  if (deciding.some(i => NON_RETRYABLE_VALIDATION_REASONS.includes(i.code))) return 'REJECTED_MODEL_OUTPUT';
  if (deciding.every(i => RETRYABLE_VALIDATION_REASONS.includes(i.code))) return 'RETRYABLE_MODEL_OUTPUT';
  return 'REJECTED_MODEL_OUTPUT';
}
