/**
 * §155 EXPERT HAZLENZ -- DETERMINISTIC RELIABILITY POSTCONDITIONS. DEVELOPMENT PROTOTYPE ONLY.
 *
 * ==================== THE BOUNDARY THIS FILE DEFENDS ====================
 *
 * A postcondition here may check STRUCTURE, IDENTITY and INTERNAL CONSISTENCY. It may never decide
 * whether a hazard exists, whether a question is worth asking, or whether a label is the right one.
 * §148 measured what happens when that line is crossed: a keyword reclassifier built to "fix"
 * `affectedDecision` labels was measured out of sample and corrupted CORRECT labels -- the word
 * "guardrail" pulled a question to REQUIRED_CONTROL, and the bare adverb "actually" pulled one to
 * HAZARD_EXISTENCE. The reclassifier was rejected on that evidence, and this file exists partly so
 * the same thing cannot be smuggled back in wearing the word "postcondition".
 *
 * The test each check must pass: **could a careful engineer disagree with the verdict on the same
 * bytes?** If yes, it is not deterministic and it does not belong here.
 *
 * ==================== WARNINGS ARE NOT REJECTIONS ====================
 *
 * Nothing in this module withholds a response. A warning routes to
 * `SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING`, which is a DELIVERED state. The only thing
 * a warning can do is make a response eligible for the selective-verification trigger, and the
 * trigger is itself bounded and off by default.
 *
 * ==================== WHAT IS DELIBERATELY ABSENT ====================
 *
 * NO OUTPUT-TOKEN FLOOR. The three hardened draws show the correlation and also refute it as a rule:
 * the four degenerate executions produced 473, 637, 287 and 240 output tokens against a per-draw
 * median near 1,400 -- but §152's HS-K1 produced 2,325 tokens and was fine, while a legitimately
 * terse and CORRECT silence on a FORBIDDEN row is short by nature. A floor would convict brevity.
 * Token counts belong in observability, where they inform a human, and not in a gate.
 *
 * NO RETAINED-UNKNOWN GATE. "The model kept an unknown and asked nothing" is measured in §155's
 * replay to be structurally IDENTICAL on rows where silence is correct and on rows where it is a
 * miss. It is a trigger input, not a defect, and it is classified SEMANTIC_JUDGMENT_REQUIRED below.
 */

export const RELIABILITY_POSTCONDITION_VERSION =
  'hazlenz.expert.reliability-postconditions.v1' as const;

/**
 * Every reliability question §155 considered, with its classification recorded in the code rather
 * than only in prose, so a later operation cannot quietly reclassify one.
 */
export const POSTCONDITION_CLASSIFICATION = {
  DEGENERATE_STRUCTURAL_OUTPUT: 'SAFE_DETERMINISTIC_POSTCONDITION',
  CLARIFICATION_LINK_UNRESOLVED: 'SAFE_DETERMINISTIC_POSTCONDITION',
  CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE: 'SAFE_DETERMINISTIC_POSTCONDITION',
  REQUIRED_OBJECT_COMPLETENESS: 'SAFE_DETERMINISTIC_POSTCONDITION',
  MEANINGLESS_IDENTIFIER: 'SAFE_DETERMINISTIC_POSTCONDITION',
  EVIDENCE_REFERENCE_INTEGRITY: 'SAFE_DETERMINISTIC_POSTCONDITION',
  DUPLICATE_CANDIDATE_KEY: 'SAFE_DETERMINISTIC_POSTCONDITION',
  COLLECTION_RELATIONSHIP_WELLFORMED: 'SAFE_DETERMINISTIC_POSTCONDITION',
  WHOLLY_EMPTY_ANALYSIS: 'SAFE_DETERMINISTIC_POSTCONDITION',
  // ---- the other side of the line ----
  IS_AN_EMPTY_ANALYSIS_CORRECT: 'SEMANTIC_JUDGMENT_REQUIRED',
  IS_A_RETAINED_UNKNOWN_DECISION_CRITICAL: 'SEMANTIC_JUDGMENT_REQUIRED',
  DOES_THE_QUESTION_ADDRESS_THE_HIGHEST_VALUE_UNKNOWN: 'SEMANTIC_JUDGMENT_REQUIRED',
  IS_THE_AFFECTED_DECISION_LABEL_CORRECT: 'SEMANTIC_JUDGMENT_REQUIRED',
  IS_THE_REASONING_SOUND: 'SEMANTIC_JUDGMENT_REQUIRED',
  IS_THE_RESPONSE_TOO_SHORT: 'SEMANTIC_JUDGMENT_REQUIRED',
} as const;
export type PostconditionSubject = keyof typeof POSTCONDITION_CLASSIFICATION;

/** Only the SAFE ones can be raised as warnings. The others have no code path at all. */
export const POSTCONDITION_WARNINGS = [
  'CLARIFICATION_LINK_UNRESOLVED',
  'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE',
  'MEANINGLESS_IDENTIFIER',
  'DUPLICATE_CANDIDATE_KEY',
  'WHOLLY_EMPTY_ANALYSIS',
  'CANDIDATE_WITHOUT_EVIDENCE_OR_BASIS',
] as const;
export type PostconditionWarningCode = (typeof POSTCONDITION_WARNINGS)[number];

export interface PostconditionInput {
  rowId: string;
  candidates: ReadonlyArray<{
    candidateKey?: unknown;
    assertedConditionState?: unknown;
    evidenceBasis?: unknown;
    quotedEvidence?: readonly unknown[];
  }>;
  clarifications: ReadonlyArray<{
    clarificationId?: unknown;
    affectedDecision?: unknown;
    relatesToCandidateKey?: unknown;
  }>;
  /**
   * Codes the normalization boundary already raised. Several postconditions here are RESTATEMENTS
   * of a check the boundary performs, and they are read from it rather than reimplemented -- a
   * second implementation of the same rule is a second thing to drift.
   */
  normalizationIssueCodes: readonly string[];
}

export interface PostconditionWarning {
  code: PostconditionWarningCode;
  detail: string;
}

export interface PostconditionReport {
  version: string;
  rowId: string;
  warnings: PostconditionWarning[];
  /** True when a check fired that the boundary ALSO raised. Recorded so the overlap is visible. */
  echoesNormalization: boolean;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

const meaninglessIdentifier = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  const alnum = v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (alnum.length === 0) return false;
  if (alnum.length === 1) return true;
  return new Set(alnum).size === 1 && alnum.length <= 4;
};

export function evaluateReliabilityPostconditions(
  input: PostconditionInput,
): PostconditionReport {
  const warnings: PostconditionWarning[] = [];
  const add = (code: PostconditionWarningCode, detail: string) => warnings.push({ code, detail });

  // 1. A declared link naming no emitted candidate. The boundary strips the link and keeps the
  //    question (§141); the warning exists so the stripped link is visible downstream too.
  const keys = new Set(input.candidates
    .map(c => (typeof c.candidateKey === 'string' ? c.candidateKey : null))
    .filter((k): k is string => k !== null));
  for (const q of input.clarifications) {
    const link = q.relatesToCandidateKey;
    if (typeof link === 'string' && link.length > 0 && !keys.has(link)) {
      add('CLARIFICATION_LINK_UNRESOLVED',
        `clarification ${String(q.clarificationId)} links to absent candidate ${JSON.stringify(link)}`);
    }
  }

  // 2. Arbitration's own condition, RESTATED, not re-decided. HAZARD_EXISTENCE + a declared link to
  //    a candidate the model itself asserted ACTIVE. §139 owns the disposition; this only reports.
  for (const q of input.clarifications) {
    if (q.affectedDecision !== 'HAZARD_EXISTENCE') continue;
    const link = typeof q.relatesToCandidateKey === 'string' ? q.relatesToCandidateKey : null;
    if (link === null) continue;
    const target = input.candidates.find(c => c.candidateKey === link);
    if (target && target.assertedConditionState === 'ACTIVE') {
      add('CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE',
        `clarification ${String(q.clarificationId)} asks whether ${link} exists while asserting it ACTIVE`);
    }
  }

  // 3. An identifier carrying no identity. §153's `candidateKey: "x"`.
  for (const c of input.candidates) {
    if (meaninglessIdentifier(c.candidateKey)) {
      add('MEANINGLESS_IDENTIFIER', `candidateKey ${JSON.stringify(c.candidateKey)}`);
    }
  }
  for (const q of input.clarifications) {
    if (meaninglessIdentifier(q.clarificationId)) {
      add('MEANINGLESS_IDENTIFIER', `clarificationId ${JSON.stringify(q.clarificationId)}`);
    }
  }

  // 4. Two candidates under one key. Identity, not meaning.
  const seen = new Set<string>();
  for (const c of input.candidates) {
    if (typeof c.candidateKey !== 'string') continue;
    if (seen.has(c.candidateKey)) {
      add('DUPLICATE_CANDIDATE_KEY', `candidateKey ${JSON.stringify(c.candidateKey)} appears twice`);
    }
    seen.add(c.candidateKey);
  }

  // 5. A candidate asserting a state with neither a quote nor a basis. NOT a judgement about
  //    whether the basis is GOOD -- only that the response asserted something and showed nothing.
  for (const c of input.candidates) {
    const noQuote = !Array.isArray(c.quotedEvidence) || c.quotedEvidence.length === 0;
    if (noQuote && blank(c.evidenceBasis)) {
      add('CANDIDATE_WITHOUT_EVIDENCE_OR_BASIS',
        `candidate ${String(c.candidateKey)} asserts ${String(c.assertedConditionState)} with no quote and no basis`);
    }
  }

  // 6. A wholly empty analysis. THE FACT is deterministic; whether it is CORRECT is not, and that
  //    question is classified SEMANTIC_JUDGMENT_REQUIRED above. §149's US-H1 and §150's RB-I1 were
  //    both empty and both right, so this warns and never rejects.
  if (input.candidates.length === 0 && input.clarifications.length === 0) {
    add('WHOLLY_EMPTY_ANALYSIS', 'zero candidates and zero clarifications');
  }

  const echoed = new Set(input.normalizationIssueCodes);
  return {
    version: RELIABILITY_POSTCONDITION_VERSION,
    rowId: input.rowId,
    warnings,
    echoesNormalization: warnings.some(w => echoed.has(w.code)),
  };
}
