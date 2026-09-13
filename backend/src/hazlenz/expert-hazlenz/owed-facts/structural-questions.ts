/**
 * EXPERT HAZLENZ -- STRUCTURAL PER-FACT QUESTION REPRESENTATION AND BUDGET SKELETON. §170.
 * INTEGRATED AND INACTIVE.
 *
 * ==================== THE GAP THIS CLOSES ====================
 *
 * §169 adjudicated two hosted draws `COMPOUND_QUESTION_REPRESENTATION = UNACCEPTABLE`: each packed
 * two independently answerable facts, with different equipment and different immediate controls,
 * into one customer-visible string. The §165 question-budget rule governs how HazLenz ASSEMBLES
 * questions and never reached the string a verifier returns, so the rule and the artefact it should
 * govern were administered by different mechanisms.
 *
 * The repair is structural, and the architecture now refuses to equate
 *
 *      one string   with   one decision-critical fact.
 *
 * A `StructuralQuestion` binds exactly one `factKey`. Two facts require two objects. There is no
 * representation in which one object carries two.
 *
 * ==================== WHAT IS DELIBERATELY NOT DONE ====================
 *
 * No parser over generated English. Splitting a compound string on a conjunction is a lexical
 * heuristic over model prose, and a mis-split safety question is worse than a compound one. When a
 * provider returns one string covering two facts, only the EXPLICITLY BOUND fact is projected; the
 * nominated fact travels its own additive path and, if no wording exists for it that HazLenz did
 * not invent, it simply stays `UNRESOLVED` with the coverage warning live.
 *
 * Inventing customer-facing wording deterministically is the one thing this module must never do.
 */

import type { OwedFactAffectedDecision, OwedFactPriority } from './owed-fact.types';
import { type OwedFactLedger, factOf, unresolvedFacts } from './owed-fact-ledger';
import type { BindingCheckResult, ClarificationDeclaration } from './owed-fact-binding';

export const STRUCTURAL_QUESTION_VERSION = 'hazlenz.expert.structural-questions.v1' as const;

export const PRESENTATION_STATUSES = [
  'SELECTED', 'DEFERRED', 'SUPPRESSED_BY_BUDGET', 'NO_WORDING_AVAILABLE',
] as const;
export type PresentationStatus = (typeof PRESENTATION_STATUSES)[number];

/**
 * One question, one fact. The invariant is in the type: `bindingFactKey` is a single string and
 * there is no array of keys anywhere in this interface.
 */
export interface StructuralQuestion {
  readonly clarificationKey: string;
  readonly bindingFactKey: string;
  /** Null when no wording exists that HazLenz did not invent. The fact still survives. */
  readonly question: string | null;
  readonly affectedDecision: OwedFactAffectedDecision;
  /** Which provider attempt produced the wording, for diagnostics. */
  readonly sourceAttempt: string | null;
  readonly priority: OwedFactPriority;
  readonly presentationStatus: PresentationStatus;
}

/**
 * Raw provider prose kept for diagnostics when it covered more than the fact it bound. Preserved,
 * never parsed, and never shown to a customer.
 */
export interface CompoundProviderOutputDiagnostic {
  readonly declarationId: string;
  readonly boundFactKey: string;
  readonly rawQuestion: string;
  readonly additionalFactKeysAlsoDeclaredInThisResponse: readonly string[];
  readonly note: string;
}

export interface QuestionProjectionResult {
  readonly questions: readonly StructuralQuestion[];
  readonly compoundDiagnostics: readonly CompoundProviderOutputDiagnostic[];
  /** Facts left with no wording. They remain UNRESOLVED; the coverage warning stays live. */
  readonly factsWithoutWording: readonly string[];
}

/**
 * Project admitted declarations into one question object per fact.
 *
 * A `BOUND_TO_OWED_FACT` declaration yields a question for its key, carrying the provider's wording.
 * A `NOMINATED_NEW` declaration yields a question for the nominated key ONLY when the response gave
 * that nomination its own wording. When the same response bound a fact and nominated another while
 * supplying a single string, the string belongs to the bound fact and the nominated fact gets
 * `question: null` -- because the alternative is to invent wording, or to cut a safety question in
 * half on a conjunction.
 */
export function projectStructuralQuestions(
  check: BindingCheckResult,
  ledger: OwedFactLedger,
  opts: { attemptId?: string; nominationWording?: Readonly<Record<string, string>> } = {},
): QuestionProjectionResult {
  const questions: StructuralQuestion[] = [];
  const compoundDiagnostics: CompoundProviderOutputDiagnostic[] = [];
  const factsWithoutWording: string[] = [];

  const bound = check.admitted.filter(d => d.bindingMode === 'BOUND_TO_OWED_FACT');
  const nominated = check.admitted.filter(d => d.bindingMode === 'NOMINATED_NEW');

  for (const d of bound) {
    const key = String(d.coversFactKey);
    const fact = factOf(ledger, key);
    questions.push({
      clarificationKey: `${d.declarationId}:${key}`,
      bindingFactKey: key,
      question: d.question,
      affectedDecision: d.affectedDecision,
      sourceAttempt: opts.attemptId ?? null,
      priority: fact?.priority ?? 'OTHER',
      presentationStatus: 'SELECTED',
    });
    // A response that bound one fact and nominated another carried its wording in one field. That
    // string may well mention both; it is preserved as a diagnostic and never split.
    if (nominated.length > 0) {
      compoundDiagnostics.push({
        declarationId: d.declarationId,
        boundFactKey: key,
        rawQuestion: d.question,
        additionalFactKeysAlsoDeclaredInThisResponse:
          nominated.map(n => String(n.nomination?.factKey ?? '')).filter(k => k.length > 0),
        note: 'the response bound one fact and nominated another. Only the bound fact is projected '
          + 'from this string. The raw wording is retained for diagnostics and is not parsed.',
      });
    }
  }

  for (const d of nominated) {
    const key = String(d.nomination?.factKey ?? '');
    if (key.length === 0) continue;
    const fact = factOf(ledger, key);
    const wording = opts.nominationWording?.[key] ?? null;
    if (wording === null) factsWithoutWording.push(key);
    questions.push({
      clarificationKey: `${d.declarationId}:${key}`,
      bindingFactKey: key,
      question: wording,
      affectedDecision: d.nomination?.affectedDecision ?? d.affectedDecision,
      sourceAttempt: opts.attemptId ?? null,
      priority: fact?.priority ?? d.nomination?.priority ?? 'OTHER',
      presentationStatus: wording === null ? 'NO_WORDING_AVAILABLE' : 'SELECTED',
    });
  }

  return { questions, compoundDiagnostics, factsWithoutWording };
}

/** Structural invariants a caller can assert over a projection. */
export function questionRepresentationViolations(
  questions: readonly StructuralQuestion[],
): string[] {
  const v: string[] = [];
  const seenKeys = new Map<string, number>();
  for (const q of questions) {
    if (typeof q.bindingFactKey !== 'string' || q.bindingFactKey.length === 0) {
      v.push(`QUESTION_BINDS_NO_FACT:${q.clarificationKey}`);
    }
    seenKeys.set(q.bindingFactKey, (seenKeys.get(q.bindingFactKey) ?? 0) + 1);
  }
  for (const [key, n] of seenKeys) {
    if (n > 1) v.push(`TWO_QUESTIONS_BIND_THE_SAME_FACT:${key}`);
  }
  const ids = questions.map(q => q.clarificationKey);
  if (new Set(ids).size !== ids.length) v.push('DUPLICATE_CLARIFICATION_KEY');
  return v;
}

// ---------------------------------------------------------------- budget skeleton

export const PRIORITY_RANK: readonly OwedFactPriority[] =
  ['LIFE_CRITICAL', 'REQUIRED_CONTROL', 'OTHER'];

export const UNDROPPABLE_PRIORITIES: readonly OwedFactPriority[] = ['LIFE_CRITICAL'];

export interface QuestionBudgetResult {
  readonly budget: number;
  /** Every unresolved owed fact. Unbounded by budget. The preservation guarantee. */
  readonly survivingInternally: readonly string[];
  readonly selected: readonly StructuralQuestion[];
  readonly suppressed: readonly StructuralQuestion[];
  readonly unresolvedLifeCriticalFactKeys: readonly string[];
  readonly UNRESOLVED_SAFETY_STATE: boolean;
  readonly deterministicFindingsStillShown: true;
  readonly reason: string;
}

/**
 * PRESERVE FIRST, RANK SECOND.
 *
 * Ranking runs over the surviving set and cannot shrink it. A question suppressed by budget leaves
 * its fact `UNRESOLVED`, and suppression never touches coverage state -- the only way a fact leaves
 * `UNRESOLVED` is a recorded transition, and this function performs none.
 *
 * `presentationThresholds` are deliberately NOT finalised here: the customer surface is not yet
 * designed and the burden question is unmeasurable while no silence-control truth exists.
 */
export function selectQuestionsForBudget(
  ledger: OwedFactLedger,
  questions: readonly StructuralQuestion[],
  budget: number,
): QuestionBudgetResult {
  if (!Number.isInteger(budget) || budget < 0) {
    throw new Error(`QUESTION_BUDGET_INVALID -- ${String(budget)} is not a non-negative integer`);
  }
  const surviving = unresolvedFacts(ledger).map(f => f.factKey);

  const ranked = [...questions].sort((a, b) => {
    const pa = PRIORITY_RANK.indexOf(a.priority);
    const pb = PRIORITY_RANK.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return ledger.admittedKeys.indexOf(a.bindingFactKey)
      - ledger.admittedKeys.indexOf(b.bindingFactKey);
  });

  const selected: StructuralQuestion[] = [];
  const suppressed: StructuralQuestion[] = [];
  for (const q of ranked) {
    // A question with no wording is not presentable, whatever the budget allows.
    if (q.question === null) {
      suppressed.push({ ...q, presentationStatus: 'NO_WORDING_AVAILABLE' });
      continue;
    }
    if (selected.length < budget) selected.push({ ...q, presentationStatus: 'SELECTED' });
    else suppressed.push({ ...q, presentationStatus: 'SUPPRESSED_BY_BUDGET' });
  }

  const presentedKeys = new Set(selected.map(q => q.bindingFactKey));
  const unresolvedLifeCritical = unresolvedFacts(ledger)
    .filter(f => UNDROPPABLE_PRIORITIES.includes(f.priority) && !presentedKeys.has(f.factKey))
    .map(f => f.factKey);

  return {
    budget,
    survivingInternally: surviving,
    selected,
    suppressed,
    unresolvedLifeCriticalFactKeys: unresolvedLifeCritical,
    UNRESOLVED_SAFETY_STATE: unresolvedLifeCritical.length > 0,
    deterministicFindingsStillShown: true,
    reason: unresolvedLifeCritical.length > 0
      ? `${unresolvedLifeCritical.length} LIFE_CRITICAL gap(s) could not be presented within a `
        + `budget of ${budget}; surfacing an unresolved safety state rather than a tidy list`
      : `${selected.length} question(s) selected, ${suppressed.length} suppressed, `
        + `${surviving.length} facts preserved internally`,
  };
}

/** The invariants a caller asserts over a budget result. */
export function questionBudgetViolations(
  before: OwedFactLedger, after: OwedFactLedger, result: QuestionBudgetResult,
): string[] {
  const v: string[] = [];
  const unresolvedBefore = unresolvedFacts(before).map(f => f.factKey);
  for (const k of unresolvedBefore) {
    if (!result.survivingInternally.includes(k)) {
      v.push(`FACT_LOST_FROM_INTERNAL_SET:${k} -- budgeting may not shrink the owed set`);
    }
    const a = factOf(after, k);
    if (a && a.status !== 'UNRESOLVED') {
      v.push(`BUDGET_SETTLED_A_FACT:${k} became ${a.status} -- a budget may not settle anything`);
    }
  }
  if (result.selected.length > result.budget) {
    v.push(`BUDGET_EXCEEDED -- ${result.selected.length} selected against ${result.budget}`);
  }
  if (result.unresolvedLifeCriticalFactKeys.length > 0 && !result.UNRESOLVED_SAFETY_STATE) {
    v.push('LIFE_CRITICAL_GAP_NOT_SURFACED');
  }
  if (after.transitions.length !== before.transitions.length) {
    v.push('BUDGET_RECORDED_A_TRANSITION -- selection is not an authority');
  }
  return v;
}

export type { ClarificationDeclaration };
