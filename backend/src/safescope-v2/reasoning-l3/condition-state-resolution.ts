/**
 * THE DETERMINISTIC CONDITION-STATE RESOLUTION BOUNDARY.  `RC-2`
 *
 * ============================ THE INVARIANT ============================
 *
 *     `ACTIVE REQUIRES AFFIRMATIVE, DECISION-SUFFICIENT EVIDENCE.`
 *     `ABSENCE OF A DECIDING FACT MUST NEVER BECOME A DECIDED STATE.`
 *
 * This is `L3-INV-04` stated as a boundary rather than as a hope about the prompt. `L3-INV-04` says
 * there is no default member and no unrecognized member that resolves to `ACTIVE`; what it did not
 * say, because nothing enforced it, is what happens when the PROPOSAL ITSELF CONTRADICTS THE STATE
 * IT CARRIES.
 *
 * ============================ WHY A NEW STAGE, AND WHY HERE ============================
 *
 * Four placements were evaluated mechanically against ONE question -- which is the EARLIEST layer at
 * which the inputs a correct state decision needs actually exist, without consulting anything hidden?
 *
 *   A. immediately after the provider proposal   REJECTED. Offsets are unverified there. A state
 *      decided on an unresolved span is decided on text the pipeline has not proven exists, and
 *      `EVIDENCE_OUT_OF_BOUNDS` / `EVIDENCE_TEXT_MISMATCH` are exactly the cases where it does not.
 *   B. between the validator and the binder       CHOSEN. Every contract guarantee is in force --
 *      offsets resolve, quoted text is equal to the source, the family is in the taxonomy, the
 *      clarification has its required shape -- and no evidence SEMANTICS have been consumed yet, so
 *      the boundary decides state from the proposal's own declared structure and nothing else.
 *   C. inside the semantic binder                 REJECTED AS THE HOME, though the binder remains the
 *      right owner of judgements that need evidence TEXT. Two reasons. The binder's verdict is a
 *      separate tier by design (`D-58`), so a state resolved there is INVISIBLE to every consumer
 *      reading the validated tier -- measured at 93/93 versus 86/93 on Run 2. And the binder's own
 *      job is falsifying claims against spans, which is a different question from whether the
 *      proposal decided anything at all.
 *   D. inside the deterministic validator          REJECTED. Section 29's contradiction C-1: the
 *      validator enforces CONTRACTS and must never grow into a second reasoning engine. It also has
 *      only accept/reject available, and the correct response to an undecided proposal is to RESOLVE
 *      it, not to destroy it -- `L3-2c` paid a phase for learning that deleting a candidate deletes
 *      the question it was carrying.
 *
 * So the sequence becomes:
 *
 *     provider -> deterministic validator -> CONDITION-STATE RESOLUTION -> semantic binder -> outcome
 *
 * ============================ WHAT THE RULE READS, AND WHAT IT REFUSES TO READ ============================
 *
 * The rule reads TWO fields of the frozen contract and nothing else: `HazardCandidate.conditionState`
 * and `ClarificationDecision.affectedDecision`. Both are frozen contract vocabulary that predates
 * this module.
 *
 * IT DOES NOT READ, AND CANNOT READ: a truth label, an expected-gate membership, a provenance class,
 * a holdout row id, a scenario family, a corpus identifier, an observation sentence or any lexical
 * pattern. There is no string literal in this file drawn from any evaluation corpus, and no branch
 * keyed to one. `F6` is not named here and neither is any other family.
 *
 * ============================ THE CONTRADICTION IT DETECTS ============================
 *
 * `ClarificationDecision.affectedDecision` names the decision a question changes. When it is
 * `condition_state`, the question is about THE VERY FIELD THE CANDIDATE ALSO FILLS IN. A candidate
 * that says `conditionState: ACTIVE` and, in the same object, `this question changes the
 * condition_state decision` has asserted a decision and declared it open simultaneously. Exactly one
 * of the two can be true.
 *
 * `L3-2d` already found this collision and resolved it IN FAVOUR OF THE STATE -- the question is
 * dropped as noise (`SEMANTIC_CLARIFICATION_ON_DECIDED_STATE`) and the state stands. That was
 * measured to buy clarification PRECISION, and it is not overturned here: for every other
 * `affectedDecision` -- `corrective_action`, `regulatory_applicability`, `risk`, `hazard_identity` --
 * the state genuinely IS decided and a question hung on it genuinely IS noise, and `L3-2d`'s rule
 * continues to govern those unchanged.
 *
 * This boundary narrows to the ONE case `L3-2d` could not distinguish, because it did not look at
 * `affectedDecision` at all: a question about the condition state itself. There, resolving in favour
 * of the state keeps an assertion the proposal has already disowned, and `L3-INV-04`'s failure
 * direction says the pipeline must not do that.
 *
 * ============================ TWO MODES, AND WHY THE DEFAULT IS `CHECK` ============================
 *
 *   `CHECK`    the contradiction is RECORDED with full traceability and NOTHING IS CHANGED.
 *   `RESOLVE`  the candidate is resolved to `INSUFFICIENT_EVIDENCE`, KEEPING its key, family,
 *              evidence, rationale and -- decisively -- its question, which the binder will now
 *              retain because the state is no longer decided.
 *
 * `CHECK` IS THE DEFAULT AND THAT IS A MEASURED DECISION, NOT TIMIDITY. `RESOLVE` moves a state away
 * from a decided claim, and this programme has measured that direction cost a hazard before
 * (`H-NG-02`, section 35.2: every deterministic check added to this pipeline deleted a correct
 * hazard before it earned its place). The evidence that would settle whether `RESOLVE` is safe --
 * WHICH candidate carried the question -- was never persisted by the sealed runs, so it cannot be
 * settled by replay at zero cost. Recording changes nothing on its own, which is precisely why it
 * can be adopted before the measurement exists; the same two-mode discipline `state-facts.ts`
 * already declares for the same reason.
 *
 * `L3-INV-08` IS PRESERVED IN BOTH MODES. This boundary may REFUSE a state. It may never CREATE a
 * hazard, a family, an evidence span, a corrective action or a customer-authoritative output, and
 * every arm below moves toward `INSUFFICIENT_EVIDENCE` and never toward `ACTIVE`. There is no arm
 * that produces `ACTIVE`, and the suite asserts that mechanically rather than trusting this comment.
 *
 * `AUTHORITY: NOT CUSTOMER-AUTHORITATIVE.` `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
 */
import {
  L3_UNDECIDED_STATES, type ClarificationDecision, type L3ConditionState,
} from './reasoning-contract.types';
import type { ValidatedHazard, ValidatedReasoning } from './validated-reasoning.types';
import { resolveConditionState, type L3StateFacts } from './state-facts';

export const L3_STATE_RESOLVER_VERSION = 'hazlenz.l3.state-resolution.v1' as const;

export type L3StateResolutionMode = 'CHECK' | 'RESOLVE';

export const L3_STATE_RESOLUTION_RULES = [
  /** The candidate's own question declares the condition-state decision unresolved. */
  'CANDIDATE_DECLARES_CONDITION_STATE_UNRESOLVED',
  /** Separated semantic facts were supplied and the deterministic resolver derived the state. */
  'FACTS_DERIVED_STATE',
  /** Nothing in the proposal contradicts the state it carries. */
  'NO_CONTRADICTION',
] as const;
export type L3StateResolutionRule = (typeof L3_STATE_RESOLUTION_RULES)[number];

/**
 * `affectedDecision` values that name THE CANDIDATE'S OWN `conditionState` FIELD.
 *
 * Exactly one member, and the narrowness is the point. `hazard_identity` asks whether the hazard is
 * this hazard; `regulatory_applicability`, `risk` and `corrective_action` ask about fields that are
 * downstream of the state. Only `condition_state` asks about the state itself, so only it can
 * contradict the state. Widening this set is a behaviour change with a measurable hazard cost and
 * belongs to a phase that measures it.
 */
const DECISIONS_ABOUT_THE_STATE_ITSELF: ReadonlyArray<ClarificationDecision['affectedDecision']> = [
  'condition_state',
];

export interface L3CandidateStateResolution {
  candidateKey: string;
  /** The state the proposal carried. */
  modelState: L3ConditionState;
  /** The state this boundary derives. Equal to `modelState` when nothing contradicts it. */
  resolvedState: L3ConditionState;
  rule: L3StateResolutionRule;
  agrees: boolean;
  /**
   * True when the resolution withdraws an assertion of present, uncontrolled exposure. This is the
   * only direction that can lose a hazard, so it is named rather than left to be inferred from a
   * pair of enum values.
   */
  withdrawsExposureAssertion: boolean;
  /** True when the resolution withdraws a REASSURING decided state -- the opposite risk. */
  withdrawsReassuringState: boolean;
  why: string;
}

export interface L3StateResolutionOutcome {
  resolverVersion: typeof L3_STATE_RESOLVER_VERSION;
  mode: L3StateResolutionMode;
  /** In `CHECK` this is the input, unchanged and reference-identical in its hazards. */
  reasoning: ValidatedReasoning;
  resolutions: L3CandidateStateResolution[];
  /** Candidates whose carried state the proposal contradicts. */
  contradictions: number;
  /** Candidates actually changed. Always 0 in `CHECK`. */
  applied: number;
}

export interface L3StateResolutionOptions {
  mode?: L3StateResolutionMode;
  /**
   * Optional separated semantic facts, keyed by `candidateKey`.
   *
   * When supplied, `state-facts.ts`'s `resolveConditionState` decides the state and this boundary is
   * the ONE place that decision enters the pipeline -- rather than the ablation harness owning a
   * private copy of the resolution order. Absent (the shipped path today) the facts arm never runs
   * and the boundary falls back to the contradiction rule.
   */
  stateFacts?: ReadonlyMap<string, L3StateFacts>;
}

const isUndecided = (s: L3ConditionState): boolean => L3_UNDECIDED_STATES.includes(s);

/** One candidate, decided. Pure: no I/O, no clock, no randomness, no shared state. */
function resolveOne(h: ValidatedHazard, facts: L3StateFacts | undefined): L3CandidateStateResolution {
  const model = h.conditionState;

  const settle = (resolved: L3ConditionState, rule: L3StateResolutionRule, why: string): L3CandidateStateResolution => ({
    candidateKey: h.candidateKey,
    modelState: model,
    resolvedState: resolved,
    rule,
    agrees: resolved === model,
    withdrawsExposureAssertion: model === 'ACTIVE' && resolved !== 'ACTIVE',
    withdrawsReassuringState: model !== 'ACTIVE' && !isUndecided(model) && isUndecided(resolved),
    why,
  });

  // ARM 1 -- separated facts, when the proposal carried them. The resolver is `state-facts.ts`'s,
  // imported rather than restated, so there is one resolution order in the codebase.
  if (facts) {
    const derived = resolveConditionState(facts);
    return settle(derived.state, 'FACTS_DERIVED_STATE',
      `resolved from the candidate's own separated facts by rule ${derived.rule}: ${derived.why}`);
  }

  // ARM 2 -- the proposal contradicts itself about the state.
  const cl = h.clarification;
  if (cl
      && DECISIONS_ABOUT_THE_STATE_ITSELF.includes(cl.affectedDecision)
      && !isUndecided(model)) {
    return settle('INSUFFICIENT_EVIDENCE', 'CANDIDATE_DECLARES_CONDITION_STATE_UNRESOLVED',
      `the candidate carries conditionState '${model}' while its own clarification declares the `
      + `condition_state decision unresolved (${JSON.stringify(cl.unresolvedFact)}); a decision `
      + 'cannot be both made and open, and L3-INV-04 resolves that in favour of the open one');
  }

  return settle(model, 'NO_CONTRADICTION', 'nothing in the proposal contradicts the state it carries');
}

/**
 * Resolve every candidate's condition state.
 *
 * FAIL-CLOSED ON AN EMPTY SET. A proposal with no hazards is a legitimate and common result, so an
 * empty `resolutions` array is a correct answer -- but it is returned explicitly with
 * `contradictions: 0` rather than by falling off the end, so a caller can never read "no
 * contradictions found" out of a run that examined nothing.
 */
export function resolveConditionStates(
  validated: ValidatedReasoning, options?: L3StateResolutionOptions,
): L3StateResolutionOutcome {
  const mode: L3StateResolutionMode = options?.mode ?? 'CHECK';
  const facts = options?.stateFacts;
  const hazards = Array.isArray(validated.hazards) ? validated.hazards : [];

  const resolutions = hazards.map(h => resolveOne(h, facts?.get(h.candidateKey)));
  const contradictions = resolutions.filter(r => !r.agrees).length;

  if (mode === 'CHECK') {
    return {
      resolverVersion: L3_STATE_RESOLVER_VERSION, mode,
      reasoning: validated, resolutions, contradictions, applied: 0,
    };
  }

  // RESOLVE. The candidate is never deleted and never re-created: family, evidence, rationales,
  // uncertainties, corrective-action intent, risk factors, regulatory refs AND THE QUESTION are all
  // carried across untouched. Only `conditionState` moves.
  const byKey = new Map(resolutions.map(r => [r.candidateKey, r]));
  let applied = 0;
  const hazardsOut = hazards.map(h => {
    const r = byKey.get(h.candidateKey);
    if (!r || r.agrees) return h;
    applied += 1;
    return { ...h, conditionState: r.resolvedState };
  });

  return {
    resolverVersion: L3_STATE_RESOLVER_VERSION, mode,
    reasoning: { ...validated, hazards: hazardsOut },
    resolutions, contradictions, applied,
  };
}
