/**
 * §155 EXPERT HAZLENZ -- SELECTIVE VERIFICATION TRIGGER. DEVELOPMENT PROTOTYPE ONLY.
 * NOT CONNECTED TO ANY PROVIDER. NOT DEPLOYED. NOT ENABLED ANYWHERE.
 *
 * ==================== WHAT THE REPLAY MEASURED, BEFORE ANY CLAIM IS MADE ====================
 *
 * Measured over the 44 non-degenerate row-executions in §152, §153 and §154 -- three draws of
 * sixteen frozen rows, minus the four executions detector v2 condemns:
 *
 *   T_RETAINED   fires 14/44   catches 3 of the 5 REQUIRED misses   escalates 11 of 22 FORBIDDEN
 *   T_EMPTY      fires  2/44   catches 1 of the 5 REQUIRED misses   escalates  1 of 22 FORBIDDEN
 *   union        fires 15/44   catches 4 of the 5 REQUIRED misses   escalates 11 of 22 FORBIDDEN
 *   ...and escalates 0 of the 17 REQUIRED executions that DID deliver a clarification.
 *
 * **THE CENTRAL FINDING IS A NEGATIVE ONE, AND IT DECIDES THE ARCHITECTURE.** On this evidence a
 * correct retention and an incorrect retention are STRUCTURALLY IDENTICAL. Compare, from §154:
 *
 *   HS-H1 (REQUIRED, a miss)  "...cannot be determined from the observation alone, though this
 *                              does not change the present door-opening exposure being assessed."
 *   HS-J1 (FORBIDDEN, right)  "...leaving the flammable-atmosphere risk unassessed, though this
 *                              does not change the currently observed and controlled inhalation
 *                              exposure."
 *   HS-R1 (FORBIDDEN, right)  "...which affects cumulative exposure duration but not the presence
 *                              or adequacy of the controls observed at this moment."
 *
 * Same shape: an unresolved candidate, a stated uncertainty, no question, and an explicit denial of
 * decision-relevance. One is a miss and two are correct, and NOTHING DETERMINISTIC SEPARATES THEM.
 *
 * So the trigger CANNOT be precise, and trying to make it precise is exactly the semantic overreach
 * §148 already measured and rejected. Its honest job is narrower: identify the POPULATION in which
 * the distinction lives, cheaply, and hand the judgement to something that can judge. Precision is
 * the verifier's to supply, not the trigger's.
 *
 * ==================== WHAT THE TRIGGER CATEGORICALLY CANNOT REACH ====================
 *
 * Two of the five observed miss shapes expose NO first-pass signal at all:
 *
 *   §152 HS-H1  spoke -- a fluent, well-formed question about the wrong fact. A response that
 *               confidently answers the wrong question looks exactly like one that answers the
 *               right one. No structural signal exists.
 *   §153 HS-E1  raised a candidate at CORRECTED, stated no uncertainty, asked nothing. It had
 *               SETTLED the fact rather than retained it, so there is nothing retained to trigger on.
 *
 * A selective verifier keyed on retained uncertainty is structurally blind to both. That is a
 * property of the design, not a tuning problem, and it must be stated wherever the design is.
 *
 * ==================== DISCLOSURE ABOUT HOW THESE WERE CHOSEN ====================
 *
 * The four candidate conditions come from the §155 authorization, not from the data. They were then
 * MEASURED against stored evidence, and two were rejected on that measurement (see `REJECTED_...`
 * below). The stored draws were visible while measuring, so these figures are IN-SAMPLE and are not
 * a prediction. No condition was tuned to a row: there is no row identifier anywhere in this file.
 */

export const SELECTIVE_VERIFICATION_TRIGGER_VERSION =
  'hazlenz.expert.selective-verification-trigger.v1' as const;

export const TRIGGER_CONDITIONS = [
  /**
   * The model kept a decision-relevant unknown and asked nothing about it. Either it stated an
   * uncertainty, or it left a candidate in an unresolved state, and emitted no clarification.
   */
  'T_RETAINED_UNKNOWN_WITHOUT_QUESTION',
  /**
   * The model returned no candidates and no clarifications at all. An empty analysis is a LEGAL and
   * frequently CORRECT answer -- §149's US-H1 and §150's RB-I1 were both empty and both right -- so
   * this escalates for a look rather than convicting. It is cheap: 2 of 44 executions.
   */
  'T_WHOLLY_EMPTY_ANALYSIS',
] as const;
export type TriggerCondition = (typeof TRIGGER_CONDITIONS)[number];

/**
 * A DETERMINISTIC POSTCONDITION WARNING DOES NOT ESCALATE TO THE VERIFIER, AND THAT IS DELIBERATE.
 *
 * An unresolved link, a meaningless identifier, a duplicate key: each is a STRUCTURAL defect that a
 * deterministic check has already named exactly. There is no question left for a semantic judge to
 * answer, and paying a provider call to be told what the boundary already recorded buys nothing.
 * Structural warnings route to operator observability, where a human reads them.
 *
 * The one warning that DOES raise a semantic question -- is an empty analysis correct here? -- is
 * already its own trigger condition above, so nothing is lost by this separation.
 *
 * DISCLOSURE: this separation was made AFTER the first replay measurement, in which any
 * postcondition warning escalated and cost two escalations of REQUIRED rows that had answered
 * correctly. Both variants are measured and reported; the reason for the change is the argument
 * above, which does not depend on those two rows.
 */

/**
 * Conditions considered and REJECTED, with the measurement that rejected each. Recorded in code so
 * a later operation re-proposing one meets its own refutation first.
 */
export const REJECTED_TRIGGER_CONDITIONS = {
  /**
   * "A clarification was emitted, but none of them links to the unresolved candidate."
   *
   * Fires on 6 of 22 valid REQUIRED executions and 0 of 22 FORBIDDEN -- perfect specificity, and
   * useless for the purpose. Every one of those 6 executions DELIVERED a clarification and is
   * scored a success under LOOSE recall, and it fires on NONE of the five observed misses. Whether
   * any of the 6 is a STRICT miss is a human adjudication that has not been performed, so no yield
   * can be claimed for it. Escalating six successes to catch zero known misses is not selective
   * robustness; it is paying for the answer you already had.
   */
  T_UNLINKED_QUESTION: 'fires 6/22 REQUIRED, 0/22 FORBIDDEN, catches 0 of 5 observed misses',
  /**
   * "Output tokens fall below a floor."
   *
   * The four degenerate executions produced 473, 637, 287 and 240 output tokens against per-draw
   * medians near 1,400, so the correlation is real -- and §152's HS-K1 produced 2,325 tokens and
   * was degenerate-free, while a correct silence on a FORBIDDEN row is short BY NATURE. A floor
   * convicts brevity. It belongs in observability, where a human reads it, not in a trigger.
   */
  T_OUTPUT_TOKEN_FLOOR: 'convicts terse-and-correct responses; correlation is not a rule',
} as const;

export interface TriggerInput {
  rowId: string;
  candidates: ReadonlyArray<{ candidateKey?: unknown; assertedConditionState?: unknown }>;
  clarifications: ReadonlyArray<{ clarificationId?: unknown }>;
  /** The model's own uncertainty statements. Non-empty means it said something is unresolved. */
  uncertainty: readonly unknown[];
  /** Codes from `evaluateReliabilityPostconditions`. Reported, never escalated. See above. */
  postconditionWarningCodes: readonly string[];
}

/** States in which the model has NOT settled the fact. The trigger's whole subject. */
const UNRESOLVED_STATES = new Set(['INSUFFICIENT_EVIDENCE', 'UNKNOWN']);

export interface TriggerVerdict {
  version: string;
  rowId: string;
  fired: TriggerCondition[];
  /** Structural warnings observed. They travel with the verdict and never cause a provider call. */
  structuralWarnings: readonly string[];
  ESCALATE: boolean;
  /** What ESCALATE would be if structural warnings also escalated. Reported for comparison. */
  ESCALATE_IF_STRUCTURAL_WARNINGS_ALSO_ESCALATED: boolean;
  /** The specific unresolved material a verifier would be handed. Never the whole analysis. */
  unresolvedFacts: Array<{ kind: 'CANDIDATE' | 'UNCERTAINTY_STATEMENT'; ref: string }>;
  reason: string;
}

export function evaluateSelectiveVerificationTrigger(input: TriggerInput): TriggerVerdict {
  const fired: TriggerCondition[] = [];
  const unresolvedFacts: TriggerVerdict['unresolvedFacts'] = [];

  const unresolvedCandidates = input.candidates.filter(
    c => typeof c.assertedConditionState === 'string'
      && UNRESOLVED_STATES.has(c.assertedConditionState));
  for (const c of unresolvedCandidates) {
    unresolvedFacts.push({ kind: 'CANDIDATE', ref: String(c.candidateKey) });
  }
  input.uncertainty.forEach((u, i) => {
    if (typeof u === 'string' && u.trim().length > 0) {
      unresolvedFacts.push({ kind: 'UNCERTAINTY_STATEMENT', ref: `uncertainty[${i}]` });
    }
  });

  const askedNothing = input.clarifications.length === 0;
  if (askedNothing && unresolvedFacts.length > 0) {
    fired.push('T_RETAINED_UNKNOWN_WITHOUT_QUESTION');
  }
  if (input.candidates.length === 0 && input.clarifications.length === 0) {
    fired.push('T_WHOLLY_EMPTY_ANALYSIS');
  }

  return {
    version: SELECTIVE_VERIFICATION_TRIGGER_VERSION,
    rowId: input.rowId,
    fired,
    structuralWarnings: input.postconditionWarningCodes,
    ESCALATE: fired.length > 0,
    ESCALATE_IF_STRUCTURAL_WARNINGS_ALSO_ESCALATED:
      fired.length > 0 || input.postconditionWarningCodes.length > 0,
    unresolvedFacts,
    reason: fired.length === 0
      ? 'no retained unknown and no empty analysis'
      : fired.join(', '),
  };
}

/**
 * THE TWO RULES THE AUTHORIZATION NAMED AS FORBIDDEN, ENFORCED AS CODE RATHER THAN AS PROSE.
 *
 * A caller can assert these against any trigger implementation. They exist because both mistakes
 * are easy to make by loosening one condition, and neither would be visible in a cost report until
 * the bill arrived.
 */
export function triggerRuleViolations(
  verdicts: readonly TriggerVerdict[],
  insufficientEvidenceRowIds: readonly string[],
): string[] {
  const violations: string[] = [];
  const escalated = new Set(verdicts.filter(v => v.ESCALATE).map(v => v.rowId));

  if (verdicts.length > 0 && verdicts.every(v => v.ESCALATE)) {
    violations.push('EVERY_CALL_ESCALATED — the trigger is not selective');
  }
  const ieAllEscalated = insufficientEvidenceRowIds.length > 0
    && insufficientEvidenceRowIds.every(id => escalated.has(id));
  const someIeNotEscalated = insufficientEvidenceRowIds.some(id => !escalated.has(id));
  if (ieAllEscalated && !someIeNotEscalated && insufficientEvidenceRowIds.length >= 3) {
    violations.push(
      'INSUFFICIENT_EVIDENCE_ALWAYS_ESCALATES — the authorization forbids this rule exactly');
  }
  return violations;
}
