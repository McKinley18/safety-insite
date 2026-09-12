/**
 * §165 EXPERT HAZLENZ -- SEMANTIC OUTCOME TAXONOMY v2. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * Implements the §164 specification `hazlenz.expert.verifier.semantic-outcome.v2` as executable
 * code. §163 is NOT rescored and remains immutable under v1: this taxonomy is PROSPECTIVE.
 *
 * ==================== THE BOUNDARY THIS FILE EXISTS TO HOLD ====================
 *
 * Two of the nine members -- `VALID_BUT_TARGET_DISPLACED` and `INVALID_WRONG_FACT` -- are separated
 * by a judgement no code in this repository is permitted to make. They differ on whether an emitted
 * question that missed the owed target is nonetheless an independently decision-critical safety
 * question, and answering that is a product-owner act. §164 recorded the rule; this file ENFORCES it:
 *
 *   - `classifyDeterministically()` can never return either member. It returns an execution-class
 *     member, `SETTLED_SILENCE`, or `UNKNOWN_SEMANTIC_VALIDITY`.
 *   - `assignHumanAdjudicatedOutcome()` is the ONLY way either member enters a record, and it
 *     refuses any provenance other than `HUMAN_ADJUDICATION`.
 *
 * `TARGET_REACHED` is likewise NOT deterministically assignable. It asserts that an emitted question
 * reaches the owed human-reviewed fact, which is the semantic comparison §160 retired the keyword
 * scorer for attempting. It is reachable only through the same human-authority entry point.
 *
 * ==================== RULE 1, ENCODED RATHER THAN WRITTEN DOWN ====================
 *
 * `VALID_BUT_TARGET_DISPLACED` is an owed-target-recall MISS and NOT a clarification-precision
 * defect. It must never be netted against `TARGET_REACHED`. `recallOf()` and `precisionOf()` are
 * separate functions over separate fields precisely so that no caller can compute one number that
 * hides the other, and `assertRecallAndPrecisionNotNetted()` refuses a summary that tries.
 */

export const EXPERT_SEMANTIC_OUTCOME_V2_VERSION =
  'hazlenz.expert.verifier.semantic-outcome.v2' as const;

export const SEMANTIC_OUTCOMES_V2 = [
  'TARGET_REACHED',
  'VALID_BUT_TARGET_DISPLACED',
  'INVALID_WRONG_FACT',
  'SETTLED_SILENCE',
  'WRONG_AFFECTED_DECISION',
  'BOUNDARY_REJECTION',
  'CONTRACT_INVALID',
  'DEGENERATE_OUTPUT',
  'TRANSPORT_FAILURE',
] as const;
export type SemanticOutcomeV2 = (typeof SEMANTIC_OUTCOMES_V2)[number];

/**
 * What the runtime persists when a response was execution-valid but its semantic outcome is one of
 * the members only a human may assign. It is a RECORDED STATE, not a missing value: an analysis that
 * emitted a question nobody has adjudicated is in a definite and reportable condition.
 */
export const UNKNOWN_SEMANTIC_VALIDITY = 'UNKNOWN_SEMANTIC_VALIDITY' as const;
export type UnknownSemanticValidity = typeof UNKNOWN_SEMANTIC_VALIDITY;

export type OwedTargetRecall = 'PASS' | 'MISS' | 'NOT_SCOREABLE';
export type ClarificationPrecision = 'PASS' | 'DEFECT' | 'NOT_A_DEFECT' | 'EXECUTION';

export interface SemanticOutcomeProperties {
  readonly owedTargetRecall: OwedTargetRecall;
  readonly clarificationPrecision: ClarificationPrecision;
  /** True when no code may assign this member. See the header. */
  readonly requiresHumanAuthority: boolean;
  readonly definition: string;
}

/** The §164 table, transcribed. The two columns are independent BY CONSTRUCTION. */
export const SEMANTIC_OUTCOME_V2_PROPERTIES:
Readonly<Record<SemanticOutcomeV2, SemanticOutcomeProperties>> = {
  TARGET_REACHED: {
    owedTargetRecall: 'PASS',
    clarificationPrecision: 'PASS',
    requiresHumanAuthority: true,
    definition: 'the owed human-reviewed fact is addressed with an acceptable semantic equivalent',
  },
  VALID_BUT_TARGET_DISPLACED: {
    owedTargetRecall: 'MISS',
    clarificationPrecision: 'NOT_A_DEFECT',
    requiresHumanAuthority: true,
    definition: 'the owed target is not addressed, but the emitted clarification independently '
      + 'appears capable of changing a current safety / regulatory / control decision',
  },
  INVALID_WRONG_FACT: {
    owedTargetRecall: 'MISS',
    clarificationPrecision: 'DEFECT',
    requiresHumanAuthority: true,
    definition: 'the emitted question reaches neither the owed target nor an independently '
      + 'decision-critical, necessary-now fact',
  },
  SETTLED_SILENCE: {
    owedTargetRecall: 'MISS',
    clarificationPrecision: 'DEFECT',
    requiresHumanAuthority: false,
    definition: 'no clarification emitted where a human-reviewed owed fact exists',
  },
  WRONG_AFFECTED_DECISION: {
    owedTargetRecall: 'MISS',
    clarificationPrecision: 'DEFECT',
    requiresHumanAuthority: true,
    definition: 'the owed fact is reached but labelled with the wrong decision class',
  },
  BOUNDARY_REJECTION: {
    owedTargetRecall: 'NOT_SCOREABLE',
    clarificationPrecision: 'EXECUTION',
    requiresHumanAuthority: false,
    definition: 'contract refused the verdict on admission grounds',
  },
  CONTRACT_INVALID: {
    owedTargetRecall: 'NOT_SCOREABLE',
    clarificationPrecision: 'EXECUTION',
    requiresHumanAuthority: false,
    definition: 'truncation or malformed output; the verdict could not be admitted',
  },
  DEGENERATE_OUTPUT: {
    owedTargetRecall: 'NOT_SCOREABLE',
    clarificationPrecision: 'EXECUTION',
    requiresHumanAuthority: false,
    definition: 'the degenerate detector fired',
  },
  TRANSPORT_FAILURE: {
    owedTargetRecall: 'NOT_SCOREABLE',
    clarificationPrecision: 'EXECUTION',
    requiresHumanAuthority: false,
    definition: 'no usable response',
  },
};

/** The members no code may assign. Derived from the table, never hand-listed twice. */
export const HUMAN_AUTHORITY_ONLY_OUTCOMES: readonly SemanticOutcomeV2[] =
  SEMANTIC_OUTCOMES_V2.filter(m => SEMANTIC_OUTCOME_V2_PROPERTIES[m].requiresHumanAuthority);

/** The one distinction §164 named as `DO_NOT_AUTOMATE` in both directions. */
export const DISPLACED_VS_INVALID_PAIR: readonly SemanticOutcomeV2[] =
  ['VALID_BUT_TARGET_DISPLACED', 'INVALID_WRONG_FACT'];

export const SEMANTIC_OUTCOME_PROVENANCES = [
  'DETERMINISTIC_EXECUTION_STATE',
  'HUMAN_ADJUDICATION',
] as const;
export type SemanticOutcomeProvenance = (typeof SEMANTIC_OUTCOME_PROVENANCES)[number];

export interface SemanticOutcomeRecord {
  readonly outcome: SemanticOutcomeV2 | UnknownSemanticValidity;
  readonly provenance: SemanticOutcomeProvenance | null;
  readonly reason: string;
  /** Present only when a human assigned it. The adjudicating authority, recorded. */
  readonly adjudicatedBy: string | null;
}

export interface ExecutionFacts {
  readonly transportOk: boolean;
  readonly degenerate: boolean;
  /** The response state classifier's verdict; anything other than COMPLETE is not scoreable. */
  readonly responseState: string;
  readonly contractAdmitted: boolean;
  readonly clarificationEmitted: boolean;
  /** Whether at least one human-reviewed owed fact existed for this analysis. */
  readonly owedFactExists: boolean;
}

/**
 * The ONLY automatic classifier, and it is deliberately unable to reach a semantic verdict.
 *
 * `SETTLED_SILENCE` is included because it is decidable without reading any question text: no
 * clarification was emitted, and an owed fact existed. That is a structural fact, not a judgement
 * about meaning. Everything else that survived execution returns `UNKNOWN_SEMANTIC_VALIDITY`.
 */
export function classifyDeterministically(f: ExecutionFacts): SemanticOutcomeRecord {
  const det = (outcome: SemanticOutcomeV2 | UnknownSemanticValidity, reason: string):
  SemanticOutcomeRecord => ({
    outcome, provenance: 'DETERMINISTIC_EXECUTION_STATE', reason, adjudicatedBy: null,
  });

  if (!f.transportOk) return det('TRANSPORT_FAILURE', 'no usable response reached the caller');
  if (f.degenerate) return det('DEGENERATE_OUTPUT', 'the degenerate detector fired');
  if (f.responseState !== 'COMPLETE') {
    return det('CONTRACT_INVALID', `response state ${f.responseState} is not COMPLETE`);
  }
  if (!f.contractAdmitted) {
    return det('BOUNDARY_REJECTION', 'the contract refused the verdict on admission grounds');
  }
  if (!f.clarificationEmitted && f.owedFactExists) {
    return det('SETTLED_SILENCE',
      'no clarification was emitted while a human-reviewed owed fact existed');
  }
  return det(UNKNOWN_SEMANTIC_VALIDITY,
    'execution-valid; the semantic outcome is one this code may not assign');
}

/**
 * The single door through which a human-authority member enters a record.
 *
 * Refuses any provenance but `HUMAN_ADJUDICATION`, refuses an unnamed adjudicator, and refuses a
 * member that is not in the frozen list. A model rationale, a similarity score, a cue match and a
 * majority of draws are all equally unable to reach this function.
 */
export function assignHumanAdjudicatedOutcome(
  outcome: SemanticOutcomeV2,
  provenance: SemanticOutcomeProvenance,
  adjudicatedBy: string,
  reason: string,
): SemanticOutcomeRecord {
  if (!(SEMANTIC_OUTCOMES_V2 as readonly string[]).includes(outcome)) {
    throw new Error(`SEMANTIC_OUTCOME_NOT_A_FROZEN_MEMBER: ${String(outcome)}`);
  }
  if (provenance !== 'HUMAN_ADJUDICATION') {
    throw new Error('SEMANTIC_OUTCOME_PROVENANCE_REFUSED — only HUMAN_ADJUDICATION may assign a '
      + `semantic outcome here; got ${String(provenance)}`);
  }
  if (typeof adjudicatedBy !== 'string' || adjudicatedBy.trim().length === 0) {
    throw new Error('SEMANTIC_OUTCOME_ADJUDICATOR_MISSING — an adjudication without a named '
      + 'authority is not an adjudication');
  }
  return { outcome, provenance, reason, adjudicatedBy: adjudicatedBy.trim() };
}

/**
 * The guard §164 called `DO_NOT_AUTOMATE`, as an assertion any caller can run against a record.
 *
 * Returns the violations rather than throwing, so a test can enumerate them and a harness can report
 * them without control flow deciding what is reported.
 */
export function humanAuthorityViolations(records: readonly SemanticOutcomeRecord[]): string[] {
  const v: string[] = [];
  for (const r of records) {
    if (r.outcome === UNKNOWN_SEMANTIC_VALIDITY) continue;
    const props = SEMANTIC_OUTCOME_V2_PROPERTIES[r.outcome];
    if (!props) { v.push(`UNKNOWN_MEMBER:${String(r.outcome)}`); continue; }
    if (props.requiresHumanAuthority && r.provenance !== 'HUMAN_ADJUDICATION') {
      v.push(`HUMAN_AUTHORITY_BYPASSED:${r.outcome} carried provenance ${String(r.provenance)}`);
    }
    if (props.requiresHumanAuthority && !r.adjudicatedBy) {
      v.push(`ADJUDICATOR_MISSING:${r.outcome}`);
    }
  }
  return v;
}

export const recallOf = (o: SemanticOutcomeV2): OwedTargetRecall =>
  SEMANTIC_OUTCOME_V2_PROPERTIES[o].owedTargetRecall;
export const precisionOf = (o: SemanticOutcomeV2): ClarificationPrecision =>
  SEMANTIC_OUTCOME_V2_PROPERTIES[o].clarificationPrecision;

export interface OutcomeSummary {
  readonly total: number;
  /** Owed-target recall, counted over scoreable outcomes only. */
  readonly recall: { pass: number; miss: number; notScoreable: number };
  /** Clarification precision, counted independently. `NOT_A_DEFECT` is its own column. */
  readonly precision: { pass: number; defect: number; notADefect: number; execution: number };
  readonly byOutcome: Readonly<Record<string, number>>;
}

/**
 * Summarise WITHOUT netting. The two dimensions are returned as separate objects and there is no
 * combined "accuracy" field, because §164's rule 1 is exactly that a `VALID_BUT_TARGET_DISPLACED`
 * outcome must not be allowed to offset a recall miss by scoring as a precision success.
 */
export function summariseOutcomes(
  records: readonly SemanticOutcomeRecord[],
): OutcomeSummary {
  const recall = { pass: 0, miss: 0, notScoreable: 0 };
  const precision = { pass: 0, defect: 0, notADefect: 0, execution: 0 };
  const byOutcome: Record<string, number> = {};
  for (const r of records) {
    byOutcome[r.outcome] = (byOutcome[r.outcome] ?? 0) + 1;
    if (r.outcome === UNKNOWN_SEMANTIC_VALIDITY) continue;
    const p = SEMANTIC_OUTCOME_V2_PROPERTIES[r.outcome];
    if (p.owedTargetRecall === 'PASS') recall.pass += 1;
    else if (p.owedTargetRecall === 'MISS') recall.miss += 1;
    else recall.notScoreable += 1;
    if (p.clarificationPrecision === 'PASS') precision.pass += 1;
    else if (p.clarificationPrecision === 'DEFECT') precision.defect += 1;
    else if (p.clarificationPrecision === 'NOT_A_DEFECT') precision.notADefect += 1;
    else precision.execution += 1;
  }
  return { total: records.length, recall, precision, byOutcome };
}

/**
 * Refuses a summary that has netted the two dimensions together.
 *
 * The specific failure this catches: treating `VALID_BUT_TARGET_DISPLACED` as a success because it
 * is not a precision defect, and thereby reporting a recall figure larger than the number of
 * outcomes that actually reached the owed target.
 */
export function assertRecallAndPrecisionNotNetted(summary: OutcomeSummary): void {
  const displaced = summary.byOutcome.VALID_BUT_TARGET_DISPLACED ?? 0;
  const reached = summary.byOutcome.TARGET_REACHED ?? 0;
  if (summary.recall.pass !== reached) {
    throw new Error('RECALL_NETTED_AGAINST_PRECISION — recall PASS count '
      + `${summary.recall.pass} does not equal the ${reached} TARGET_REACHED outcomes; `
      + `${displaced} displaced outcomes appear to have been counted as recall successes`);
  }
}
