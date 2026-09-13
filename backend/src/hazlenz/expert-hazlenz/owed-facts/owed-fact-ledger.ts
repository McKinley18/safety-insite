/**
 * EXPERT HAZLENZ -- OWED-FACT LEDGER. §170. INTEGRATED AND INACTIVE.
 *
 * The append-only ledger the §165 prototype proved locally and §167 exercised hosted over 12 draws
 * with zero preservation violations, promoted to the runtime contract.
 *
 * ==================== WHY A LEDGER AND NOT AN ARRAY ====================
 *
 * The failure this layer exists for is DISPLACEMENT: a legitimate unresolved fact disappearing
 * because a different legitimate concern was more salient. An array any caller can rebuild makes
 * that invisible -- the second array simply has one fewer entry and nothing records that the first
 * one had it.
 *
 * So facts are added and never removed, statuses change only through `transition()`, which appends
 * a record carrying its authority and justification, and `factsRemoved()` returns empty on any
 * ledger built through this module. A test can prove that against an adversarially constructed
 * successor rather than trust the constructor.
 *
 * ==================== THE POPULATION BOUNDARY ====================
 *
 * `DEVELOPMENT_HUMAN_TRUTH` is a permitted SOURCE and a forbidden PRODUCTION source, and the
 * enforcement THROWS rather than filters. A silent drop would let a caller believe the fact was
 * represented, and an evaluation-truth fact quietly absent from a production owed set is the
 * hardest kind of defect to notice later.
 */

import {
  type AcceptableEvidence, type OwedFact, type OwedFactPopulation, type OwedFactStatus,
  type OwedFactTransition, type TransitionAuthority,
  OWED_FACT_AFFECTED_DECISIONS, OWED_FACT_PRIORITIES, OWED_FACT_SOURCES, OWED_FACT_STATUSES,
  MODEL_AUTHORED_SOURCES, PRODUCTION_PERMITTED_SOURCES, REQUIRED_AUTHORITY,
  TRANSITION_AUTHORITIES, PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES,
} from './owed-fact.types';

export interface OwedFactLedger {
  readonly population: OwedFactPopulation;
  readonly facts: readonly OwedFact[];
  readonly transitions: readonly OwedFactTransition[];
  /** Every fact key ever admitted, in admission order. Never shrinks. */
  readonly admittedKeys: readonly string[];
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/** Field-level validity. A fact missing any part of its proof is not an owed fact. */
export function owedFactDefects(f: OwedFact): string[] {
  const d: string[] = [];
  if (blank(f.factKey)) d.push('FACT_KEY_MISSING');
  if (!(OWED_FACT_AFFECTED_DECISIONS as readonly string[]).includes(f.affectedDecision)) {
    d.push(`AFFECTED_DECISION_NOT_A_MEMBER:${String(f.affectedDecision)}`);
  }
  if (!(OWED_FACT_SOURCES as readonly string[]).includes(f.source)) {
    d.push(`SOURCE_NOT_A_MEMBER:${String(f.source)}`);
  }
  if (blank(f.evidenceSpan)) d.push('EVIDENCE_SPAN_MISSING');
  // `whyUnresolved` is bound to `status` in BOTH directions. Nullable is not optional: an
  // UNRESOLVED fact still owes a sentence, and a settled one must carry null rather than a
  // manufactured stand-in that `projectOwedFact` would put in front of a provider.
  if (f.status === 'UNRESOLVED') {
    if (blank(f.whyUnresolved)) d.push('WHY_UNRESOLVED_MISSING');
  } else if (f.whyUnresolved !== null) {
    d.push(`WHY_UNRESOLVED_PRESENT_ON_NON_UNRESOLVED_FACT:${String(f.status)}`);
  }
  if (blank(f.branchA) || blank(f.branchB)) d.push('BRANCH_MISSING');
  if (!blank(f.branchA) && !blank(f.branchB) && f.branchA.trim() === f.branchB.trim()) {
    d.push('BRANCHES_IDENTICAL');
  }
  if (blank(f.decisionDivergence?.ifA) || blank(f.decisionDivergence?.ifB)) {
    d.push('DECISION_DIVERGENCE_MISSING');
  } else if (f.decisionDivergence.ifA.trim() === f.decisionDivergence.ifB.trim()) {
    d.push('DECISIONS_DO_NOT_DIVERGE');
  }
  if (!(OWED_FACT_PRIORITIES as readonly string[]).includes(f.priority)) {
    d.push(`PRIORITY_NOT_A_MEMBER:${String(f.priority)}`);
  }
  if (!(OWED_FACT_STATUSES as readonly string[]).includes(f.status)) {
    d.push(`STATUS_NOT_A_MEMBER:${String(f.status)}`);
  }
  if (f.modelAuthored !== MODEL_AUTHORED_SOURCES.includes(f.source)) {
    d.push(`MODEL_AUTHORED_FLAG_INCONSISTENT_WITH_SOURCE:${f.source}`);
  }
  // acceptableEvidence may be null. When present it must actually say something.
  if (f.acceptableEvidence !== null && blank(f.acceptableEvidence?.requirement)) {
    d.push('ACCEPTABLE_EVIDENCE_REQUIREMENT_EMPTY');
  }
  return d;
}

/** Set `modelAuthored` from the source so no call site can disagree with the provenance. */
export function owedFact(
  input: Omit<OwedFact, 'modelAuthored' | 'status' | 'acceptableEvidence'>
  & { status?: OwedFactStatus; acceptableEvidence?: AcceptableEvidence | null },
): OwedFact {
  return {
    ...input,
    status: input.status ?? 'UNRESOLVED',
    acceptableEvidence: input.acceptableEvidence ?? null,
    modelAuthored: MODEL_AUTHORED_SOURCES.includes(input.source),
  };
}

/**
 * THE POPULATION BOUNDARY, and the evidence-provenance boundary beside it.
 *
 * Both throw. A `DEVELOPMENT_HUMAN_TRUTH` fact cannot enter a PRODUCTION ledger, and neither can an
 * `acceptableEvidence` criterion authored by a development fixture, an adjudication label, or the
 * model itself.
 */
export function createOwedFactLedger(
  population: OwedFactPopulation, facts: readonly OwedFact[],
): OwedFactLedger {
  const defects: string[] = [];
  const seen = new Set<string>();
  for (const f of facts) {
    const d = owedFactDefects(f);
    if (d.length > 0) defects.push(`${f.factKey || '(no key)'}: ${d.join(', ')}`);
    if (seen.has(f.factKey)) defects.push(`${f.factKey}: DUPLICATE_FACT_KEY_IN_INITIAL_SET`);
    seen.add(f.factKey);
    assertProductionAdmissible(population, f);
  }
  if (defects.length > 0) throw new Error(`OWED_FACT_SET_INVALID -- ${defects.join(' | ')}`);
  return {
    population,
    facts: [...facts],
    transitions: [],
    admittedKeys: facts.map(f => f.factKey),
  };
}

function assertProductionAdmissible(population: OwedFactPopulation, f: OwedFact): void {
  if (population !== 'PRODUCTION') return;
  if (!PRODUCTION_PERMITTED_SOURCES.includes(f.source)) {
    throw new Error('DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION -- '
      + `fact ${f.factKey} carries source ${f.source}, which may populate a DEVELOPMENT ledger `
      + 'only. Fixture truth is the standard the system is measured against and must never become '
      + 'part of the system being measured.');
  }
  const p = f.acceptableEvidence?.provenance;
  if (p !== undefined && !PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES.includes(p)) {
    throw new Error('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED_IN_PRODUCTION -- '
      + `fact ${f.factKey} carries evidence provenance ${p}. Where no trustworthy production `
      + 'source exists the correct value is null, not an invented criterion.');
  }
}

export const factOf = (l: OwedFactLedger, key: string): OwedFact | undefined =>
  l.facts.find(f => f.factKey === key);

export const unresolvedFacts = (l: OwedFactLedger): readonly OwedFact[] =>
  l.facts.filter(f => f.status === 'UNRESOLVED');

/**
 * ADD a fact. Additive by construction: the returned ledger contains every prior fact unchanged.
 *
 * An exact `factKey` collision is a no-op rather than an error, and that is the ONLY deduplication
 * performed anywhere. Deduplicate on identity, never on similarity -- merging similar-sounding
 * facts is precisely how a gap disappears.
 */
export function addOwedFact(l: OwedFactLedger, f: OwedFact): OwedFactLedger {
  const defects = owedFactDefects(f);
  if (defects.length > 0) throw new Error(`OWED_FACT_INVALID -- ${f.factKey}: ${defects.join(', ')}`);
  assertProductionAdmissible(l.population, f);
  if (factOf(l, f.factKey)) return l;
  return { ...l, facts: [...l.facts, f], admittedKeys: [...l.admittedKeys, f.factKey] };
}

/**
 * A verifier nomination, added under the ADDITIVE-ONLY rule.
 *
 * This function cannot express replacement: it takes no key to remove and returns a ledger whose
 * fact list is a superset of the input's. Substitution is unrepresentable rather than forbidden.
 */
export function nominateAdditiveFact(l: OwedFactLedger, nominated: OwedFact): OwedFactLedger {
  if (nominated.source !== 'VERIFIER_NOMINATION') {
    throw new Error('NOMINATION_SOURCE_MUST_BE_VERIFIER_NOMINATION -- '
      + `${nominated.factKey} carries ${nominated.source}`);
  }
  return addOwedFact(l, nominated);
}

export interface TransitionRequest {
  readonly factKey: string;
  readonly to: Exclude<OwedFactStatus, 'UNRESOLVED'>;
  readonly authority: TransitionAuthority;
  readonly justification: string;
}

/** The ONLY way a fact leaves `UNRESOLVED`. Salience is not among the authorities. */
export function transition(l: OwedFactLedger, req: TransitionRequest): OwedFactLedger {
  const f = factOf(l, req.factKey);
  if (!f) throw new Error(`TRANSITION_TARGET_NOT_IN_LEDGER -- ${req.factKey} was never admitted`);
  if (f.status !== 'UNRESOLVED') {
    throw new Error(`TRANSITION_FROM_TERMINAL_STATUS -- ${req.factKey} is already ${f.status}`);
  }
  if (!(TRANSITION_AUTHORITIES as readonly string[]).includes(req.authority)) {
    throw new Error(`TRANSITION_AUTHORITY_NOT_A_MEMBER -- ${String(req.authority)}; a model `
      + 'explanation is not an authority and there is no member for one');
  }
  if (REQUIRED_AUTHORITY[req.to] !== req.authority) {
    throw new Error(`TRANSITION_AUTHORITY_MISMATCH -- ${req.to} requires `
      + `${REQUIRED_AUTHORITY[req.to]}, got ${req.authority}`);
  }
  if (blank(req.justification)) {
    throw new Error(`TRANSITION_JUSTIFICATION_MISSING -- ${req.factKey} to ${req.to}`);
  }
  // Leaving UNRESOLVED nulls `whyUnresolved`, because the fact is no longer unresolved and the
  // sentence would be false the moment the status moved. The sentence is not discarded: it is
  // preserved verbatim on the transition record, so the ledger still shows the fact was unresolved
  // and why. Preserve first, then clear.
  const whyUnresolvedAtTransition = f.whyUnresolved;
  return {
    ...l,
    facts: l.facts.map(x => (
      x.factKey === req.factKey ? { ...x, status: req.to, whyUnresolved: null } : x
    )),
    transitions: [...l.transitions, {
      seq: l.transitions.length + 1,
      factKey: req.factKey,
      from: 'UNRESOLVED',
      to: req.to,
      authority: req.authority,
      justification: req.justification.trim(),
      whyUnresolvedAtTransition,
    }],
  };
}

// ---------------------------------------------------------------- preservation invariants

export function factsRemoved(before: OwedFactLedger, after: OwedFactLedger): string[] {
  const afterKeys = new Set(after.facts.map(f => f.factKey));
  return before.facts.map(f => f.factKey).filter(k => !afterKeys.has(k));
}

/** Reports every violation rather than the first, so a caller sees the whole picture. */
export function preservationViolations(
  before: OwedFactLedger, after: OwedFactLedger,
): string[] {
  const v: string[] = [];
  for (const k of factsRemoved(before, after)) {
    v.push(`FACT_DELETED:${k} -- an owed fact may never be removed`);
  }
  const transitioned = new Set(after.transitions.map(t => t.factKey));
  for (const b of before.facts) {
    const a = after.facts.find(f => f.factKey === b.factKey);
    if (!a) continue;
    if (a.status !== b.status) {
      if (b.status !== 'UNRESOLVED') {
        v.push(`TERMINAL_STATUS_MUTATED:${b.factKey} ${b.status} to ${a.status}`);
      }
      if (!transitioned.has(b.factKey)) {
        v.push(`STATUS_CHANGED_WITHOUT_A_RECORDED_TRANSITION:${b.factKey}`);
      }
    }
    if (a.evidenceSpan !== b.evidenceSpan || a.affectedDecision !== b.affectedDecision
        || a.source !== b.source || a.priority !== b.priority) {
      v.push(`FACT_IDENTITY_MUTATED:${b.factKey}`);
    }
    // The settlement criterion is HazLenz task state; nothing downstream may edit it.
    if (JSON.stringify(a.acceptableEvidence) !== JSON.stringify(b.acceptableEvidence)) {
      v.push(`ACCEPTABLE_EVIDENCE_MUTATED:${b.factKey}`);
    }
  }
  if (after.transitions.length < before.transitions.length) {
    v.push('TRANSITION_LEDGER_TRUNCATED -- the transition record is append-only');
  }
  for (let i = 0; i < before.transitions.length; i += 1) {
    if (JSON.stringify(before.transitions[i]) !== JSON.stringify(after.transitions[i])) {
      v.push(`TRANSITION_REWRITTEN:seq ${before.transitions[i].seq}`);
    }
  }
  return v;
}

/** Exact-identity deduplication. Compares `factKey` and nothing else. */
export function dedupeByIdentity(facts: readonly OwedFact[]): readonly OwedFact[] {
  const seen = new Set<string>();
  const out: OwedFact[] = [];
  for (const f of facts) {
    if (seen.has(f.factKey)) continue;
    seen.add(f.factKey);
    out.push(f);
  }
  return out;
}

/**
 * A production owed fact sourced from model output cannot ALONE justify a fail-closed
 * customer-visible state. Returns the keys that would be relied on illegitimately.
 */
export function modelAuthoredOnlyFailClosedKeys(
  l: OwedFactLedger, reliedOnKeys: readonly string[],
): string[] {
  if (l.population !== 'PRODUCTION') return [];
  const relied = reliedOnKeys.map(k => factOf(l, k)).filter((f): f is OwedFact => !!f);
  if (relied.length === 0) return [];
  return relied.every(f => f.modelAuthored) ? relied.map(f => f.factKey) : [];
}
