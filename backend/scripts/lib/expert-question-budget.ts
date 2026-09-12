/**
 * §165 EXPERT HAZLENZ -- QUESTION BUDGET SKELETON. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== PRESERVE FIRST, RANK SECOND ====================
 *
 * The product principle is unchanged: few questions, only decision-critical questions. A design that
 * raises internal recall by asking users more things has solved nothing. But the §163 failure was a
 * gap DISAPPEARING, so the two concerns are separated completely:
 *
 *   `survivingInternally`  every unresolved owed fact, always, unbounded by budget.
 *   `selected`             the customer-facing subset, bounded.
 *   `deferred`             recorded, never discarded.
 *
 * Ranking runs over the surviving set and cannot shrink it. A fact that is not selected is still
 * present, still `UNRESOLVED`, and still counted by the coverage postcondition.
 *
 * ==================== WHAT IS DELIBERATELY NOT IMPLEMENTED ====================
 *
 * Semantic ranking. Nothing here reads a question's text to decide how important it is, and nothing
 * here decides that two differently-worded gaps are the same gap. §164 classified both as
 * `REQUIRES_HUMAN_TRUTH`, and this skeleton implements only the parts §164 classified
 * `PROVABLE_LOCAL`.
 *
 * Combination and deferral therefore run on DECLARED fields, never on inferred ones. If a caller
 * does not declare that two gaps concern the same equipment and are independently answerable in one
 * reply, they are not combined -- the default is the safe one, and there is no heuristic fallback.
 *
 * ==================== RULE 5, WHICH IS THE ONE THAT MATTERS ====================
 *
 * A `LIFE_CRITICAL` gap is never dropped to fit the budget. If one cannot be presented, the analysis
 * surfaces `UNRESOLVED_SAFETY_STATE` rather than a tidy list, and the deterministic HazLenz findings
 * still stand and are still shown. `selectQuestions` returns that state; it does not return a
 * shorter list and a clean conscience.
 */

import {
  type OwedFact, type OwedFactLedger, type OwedFactPriority, unresolvedFacts,
} from './expert-owed-facts';

export const QUESTION_BUDGET_VERSION = 'hazlenz.expert.question-budget.v1' as const;

/** Rank order. Index is the rank; there is no score and no tie-break beyond input order. */
export const PRIORITY_RANK: readonly OwedFactPriority[] =
  ['LIFE_CRITICAL', 'REQUIRED_CONTROL', 'OTHER'];

/** Priorities that may never be dropped to fit a budget. */
export const UNDROPPABLE_PRIORITIES: readonly OwedFactPriority[] = ['LIFE_CRITICAL'];

/**
 * Declared, checkable properties a caller may attach to an owed fact for budgeting purposes.
 *
 * Every field is something the caller ASSERTS and this module CHECKS the use of. None is inferred
 * from text. An absent declaration means the conservative branch: not combinable, not deferrable.
 */
export interface BudgetDeclaration {
  readonly factKey: string;
  /** Same equipment or task. Two facts may combine only if these are equal and non-empty. */
  readonly equipmentOrTaskKey?: string;
  /** The caller asserts a single reply can answer this gap unambiguously alongside another. */
  readonly independentlyAnswerableInOneReply?: boolean;
  /** The caller asserts the answer cannot change what must be done before the next interaction. */
  readonly answerCannotChangeActionBeforeNextInteraction?: boolean;
}

export interface QuestionGroup {
  readonly groupId: string;
  readonly factKeys: readonly string[];
  readonly affectedDecision: string;
  readonly combined: boolean;
  readonly priority: OwedFactPriority;
}

export interface DeferralRecord {
  readonly factKey: string;
  readonly priority: OwedFactPriority;
  readonly reason: string;
}

export interface QuestionBudgetResult {
  readonly version: string;
  readonly budget: number;
  /** Every unresolved owed fact. Unbounded by budget. This is the preservation guarantee. */
  readonly survivingInternally: readonly string[];
  readonly selected: readonly QuestionGroup[];
  readonly deferred: readonly DeferralRecord[];
  /** Life-critical gaps that could not be presented. Never empty AND silent. */
  readonly unresolvedLifeCriticalFactKeys: readonly string[];
  readonly UNRESOLVED_SAFETY_STATE: boolean;
  readonly deterministicFindingsStillShown: true;
  readonly reason: string;
}

const declarationFor = (
  decls: readonly BudgetDeclaration[], key: string,
): BudgetDeclaration | undefined => decls.find(d => d.factKey === key);

/**
 * The strict combination test, stated as one predicate so it cannot be partially applied.
 *
 * All four conditions, and nothing weaker: same affected decision, same declared equipment or task,
 * and BOTH facts declared independently answerable in one reply. §164: if combining could produce a
 * single answer that resolves one fact and leaves the other unclear, do not combine.
 */
export function mayCombine(
  a: OwedFact, b: OwedFact, decls: readonly BudgetDeclaration[],
): boolean {
  if (a.affectedDecision !== b.affectedDecision) return false;
  const da = declarationFor(decls, a.factKey);
  const db = declarationFor(decls, b.factKey);
  if (!da || !db) return false;
  if (!da.equipmentOrTaskKey || !db.equipmentOrTaskKey) return false;
  if (da.equipmentOrTaskKey !== db.equipmentOrTaskKey) return false;
  return da.independentlyAnswerableInOneReply === true
    && db.independentlyAnswerableInOneReply === true;
}

/**
 * Select the customer-facing questions.
 *
 * The order of operations is the §164 policy verbatim: rank, combine under the strict test, defer
 * only what declares it can be deferred, never drop a life-critical gap, fail closed when one will
 * not fit.
 */
export function selectQuestions(
  ledger: OwedFactLedger,
  budget: number,
  declarations: readonly BudgetDeclaration[] = [],
): QuestionBudgetResult {
  if (!Number.isInteger(budget) || budget < 0) {
    throw new Error(`QUESTION_BUDGET_INVALID — ${String(budget)} is not a non-negative integer`);
  }
  const surviving = [...unresolvedFacts(ledger)];
  const survivingKeys = surviving.map(f => f.factKey);

  // 1. RANK. Stable: priority index, then the order the facts were admitted in.
  const ranked = [...surviving].sort((a, b) => {
    const pa = PRIORITY_RANK.indexOf(a.priority);
    const pb = PRIORITY_RANK.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return ledger.admittedKeys.indexOf(a.factKey) - ledger.admittedKeys.indexOf(b.factKey);
  });

  // 2. COMBINE, under the strict test only. Groups are built greedily in rank order; a fact joins
  //    an existing group only if it may combine with EVERY member, so a group never contains a pair
  //    that failed the test.
  const groups: Array<{ facts: OwedFact[] }> = [];
  for (const f of ranked) {
    const target = groups.find(g => g.facts.every(m => mayCombine(m, f, declarations)));
    if (target) target.facts.push(f);
    else groups.push({ facts: [f] });
  }
  const asGroup = (g: { facts: OwedFact[] }, i: number): QuestionGroup => ({
    groupId: `Q${i + 1}`,
    factKeys: g.facts.map(f => f.factKey),
    affectedDecision: g.facts[0].affectedDecision,
    combined: g.facts.length > 1,
    // A group carries the HIGHEST priority of its members; combining never demotes a gap.
    priority: PRIORITY_RANK[Math.min(...g.facts.map(f => PRIORITY_RANK.indexOf(f.priority)))],
  });
  const allGroups = groups.map(asGroup);

  // 3. FIT THE BUDGET. Groups are already in rank order because `ranked` was.
  const selected: QuestionGroup[] = [];
  const deferred: DeferralRecord[] = [];
  for (const g of allGroups) {
    if (selected.length < budget) { selected.push(g); continue; }
    for (const key of g.factKeys) {
      const f = surviving.find(x => x.factKey === key)!;
      const d = declarationFor(declarations, key);
      // 4. NEVER DROP A LIFE_CRITICAL GAP. It is not deferred, not dropped, and not silently
      //    absorbed: it falls through to the unresolved safety state below.
      if (UNDROPPABLE_PRIORITIES.includes(f.priority)) continue;
      deferred.push({
        factKey: key,
        priority: f.priority,
        reason: d?.answerCannotChangeActionBeforeNextInteraction === true
          ? 'declared: the answer cannot change what must be done before the next interaction'
          : 'budget exhausted; deferral is RECORDED and the fact remains UNRESOLVED internally',
      });
    }
  }

  const selectedKeys = new Set(selected.flatMap(g => g.factKeys));
  const unresolvedLifeCritical = surviving
    .filter(f => UNDROPPABLE_PRIORITIES.includes(f.priority) && !selectedKeys.has(f.factKey))
    .map(f => f.factKey);

  return {
    version: QUESTION_BUDGET_VERSION,
    budget,
    survivingInternally: survivingKeys,
    selected,
    deferred,
    unresolvedLifeCriticalFactKeys: unresolvedLifeCritical,
    UNRESOLVED_SAFETY_STATE: unresolvedLifeCritical.length > 0,
    deterministicFindingsStillShown: true,
    reason: unresolvedLifeCritical.length > 0
      ? `${unresolvedLifeCritical.length} LIFE_CRITICAL gap(s) could not be presented within a `
        + `budget of ${budget}; surfacing an unresolved safety state rather than a tidy list`
      : `${selected.length} question group(s) selected, ${deferred.length} deferred, `
        + `${survivingKeys.length} facts preserved internally`,
  };
}

/**
 * The invariants a caller can assert over a result. Each is one of the §165 Phase 7 rules, and each
 * is checkable without knowing anything about the domain.
 */
export function questionBudgetViolations(
  ledger: OwedFactLedger, result: QuestionBudgetResult,
): string[] {
  const v: string[] = [];
  const unresolved = unresolvedFacts(ledger).map(f => f.factKey);
  for (const k of unresolved) {
    if (!result.survivingInternally.includes(k)) {
      v.push(`FACT_LOST_FROM_INTERNAL_SET:${k} — budgeting may not shrink the owed set`);
    }
  }
  const accounted = new Set([
    ...result.selected.flatMap(g => g.factKeys),
    ...result.deferred.map(d => d.factKey),
    ...result.unresolvedLifeCriticalFactKeys,
  ]);
  for (const k of unresolved) {
    if (!accounted.has(k)) {
      v.push(`FACT_SILENTLY_DROPPED:${k} — neither selected, deferred nor surfaced`);
    }
  }
  if (result.unresolvedLifeCriticalFactKeys.length > 0 && !result.UNRESOLVED_SAFETY_STATE) {
    v.push('LIFE_CRITICAL_GAP_NOT_SURFACED — an unpresented life-critical fact must set '
      + 'UNRESOLVED_SAFETY_STATE');
  }
  if (result.selected.length > result.budget) {
    v.push(`BUDGET_EXCEEDED — ${result.selected.length} selected against a budget of `
      + `${result.budget}`);
  }
  return v;
}
