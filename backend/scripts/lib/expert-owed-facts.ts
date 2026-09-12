/**
 * §165 EXPERT HAZLENZ -- OWED-FACT REPRESENTATION AND LEDGER. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * The §164 `owedFacts[]` structure, made executable, together with the state machine that governs
 * how a fact may leave `UNRESOLVED`.
 *
 * ==================== WHY A LEDGER RATHER THAN AN ARRAY ====================
 *
 * The §163 failure this whole layer exists for is DISPLACEMENT: a legitimate unresolved fact
 * disappeared because a different legitimate concern was more salient. An array of facts that any
 * caller can rebuild makes that failure invisible -- the second array simply has one fewer entry and
 * nothing records that the first one had it.
 *
 * So the owed set is held as an APPEND-ONLY LEDGER. Facts are added; statuses change only through
 * `transition()`, which appends a transition record carrying its justification; and NOTHING is ever
 * removed. `factsRemoved()` therefore always returns empty on a ledger built through this module,
 * and a test can prove it rather than trust it.
 *
 * ==================== THE POPULATION BOUNDARY ====================
 *
 * `DEVELOPMENT_HUMAN_TRUTH` is a permitted SOURCE and a forbidden PRODUCTION source. §164 stated the
 * reason and `docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md` exists to defend it: human-authored fixture
 * truth is the standard the system is measured against, so seeding production owed facts from it
 * would make the ruler part of the thing being measured.
 *
 * The enforcement is not a comment. `createOwedFactLedger()` takes a `population` and THROWS if a
 * `DEVELOPMENT_HUMAN_TRUTH` fact is presented to a `PRODUCTION` ledger. Development instrumentation
 * and production architecture share this structure; they do not share this call.
 */

export const OWED_FACT_CONTRACT_VERSION = 'hazlenz.expert.owed-facts.v1' as const;

export const OWED_FACT_STATUSES = [
  'UNRESOLVED', 'COVERED', 'SETTLED_BY_EVIDENCE', 'REJECTED_BY_ARBITRATION',
] as const;
export type OwedFactStatus = (typeof OWED_FACT_STATUSES)[number];

export const OWED_FACT_PRIORITIES = ['LIFE_CRITICAL', 'REQUIRED_CONTROL', 'OTHER'] as const;
export type OwedFactPriority = (typeof OWED_FACT_PRIORITIES)[number];

export const OWED_FACT_AFFECTED_DECISIONS = [
  'HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY', 'REQUIRED_CONTROL',
  'REGULATORY_INTERPRETATION',
] as const;
export type OwedFactAffectedDecision = (typeof OWED_FACT_AFFECTED_DECISIONS)[number];

/** Provenance sufficient to distinguish every population path §164 named. */
export const OWED_FACT_SOURCES = [
  'DETERMINISTIC',
  'GOVERNED_EVIDENCE',
  'FIRST_PASS_MODEL',
  'VERIFIER_NOMINATION',
  'DEVELOPMENT_HUMAN_TRUTH',
] as const;
export type OwedFactSource = (typeof OWED_FACT_SOURCES)[number];

export const OWED_FACT_POPULATIONS = ['PRODUCTION', 'DEVELOPMENT'] as const;
export type OwedFactPopulation = (typeof OWED_FACT_POPULATIONS)[number];

/** Sources a PRODUCTION ledger may be populated from. The omission is the whole point. */
export const PRODUCTION_PERMITTED_SOURCES: readonly OwedFactSource[] =
  ['DETERMINISTIC', 'GOVERNED_EVIDENCE', 'FIRST_PASS_MODEL', 'VERIFIER_NOMINATION'];

/** Sources whose facts are authored by a model rather than derived by a rule or a governed record. */
export const MODEL_AUTHORED_SOURCES: readonly OwedFactSource[] =
  ['FIRST_PASS_MODEL', 'VERIFIER_NOMINATION'];

export interface OwedFact {
  /** Stable identifier, unique within the analysis. The unit of binding and of deduplication. */
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly source: OwedFactSource;
  /** Verbatim span of the observation or governed record. */
  readonly evidenceSpan: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
  /** What is done today under each branch. The two must differ. */
  readonly decisionDivergence: { readonly ifA: string; readonly ifB: string };
  readonly priority: OwedFactPriority;
  readonly status: OwedFactStatus;
  /**
   * True when the fact came from model output. §164: such a fact may raise a question; it may not
   * alone justify a fail-closed customer-visible state.
   */
  readonly modelAuthored: boolean;
}

export interface OwedFactTransition {
  readonly seq: number;
  readonly factKey: string;
  readonly from: OwedFactStatus;
  readonly to: OwedFactStatus;
  /** What authorised the transition. Never a model explanation -- see `TRANSITION_AUTHORITIES`. */
  readonly authority: TransitionAuthority;
  readonly justification: string;
}

/**
 * What may move a fact out of `UNRESOLVED`, and nothing else may.
 *
 * `MODEL_EXPLANATION` is deliberately absent, and its absence is asserted by
 * `transition()` refusing any authority not in this list. §163's seven displaced draws each carried
 * a long, fluent, internally coherent rationale for why the auger fact mattered more. Every one of
 * those rationales would have been persuasive to a rule that accepted explanation as authority.
 */
export const TRANSITION_AUTHORITIES = [
  'ADMITTED_BINDING',
  'ADMISSIBLE_EVIDENCE',
  'RECORDED_ARBITRATION',
] as const;
export type TransitionAuthority = (typeof TRANSITION_AUTHORITIES)[number];

/** Which authority each terminal status requires. One-to-one, with no wildcard. */
export const REQUIRED_AUTHORITY: Readonly<Record<Exclude<OwedFactStatus, 'UNRESOLVED'>,
TransitionAuthority>> = {
  COVERED: 'ADMITTED_BINDING',
  SETTLED_BY_EVIDENCE: 'ADMISSIBLE_EVIDENCE',
  REJECTED_BY_ARBITRATION: 'RECORDED_ARBITRATION',
};

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
  if (blank(f.whyUnresolved)) d.push('WHY_UNRESOLVED_MISSING');
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
  const shouldBeModelAuthored = MODEL_AUTHORED_SOURCES.includes(f.source);
  if (f.modelAuthored !== shouldBeModelAuthored) {
    d.push(`MODEL_AUTHORED_FLAG_INCONSISTENT_WITH_SOURCE:${f.source}`);
  }
  return d;
}

/** Set `modelAuthored` from the source so no call site can disagree with the provenance. */
export function owedFact(
  input: Omit<OwedFact, 'modelAuthored' | 'status'> & { status?: OwedFactStatus },
): OwedFact {
  return {
    ...input,
    status: input.status ?? 'UNRESOLVED',
    modelAuthored: MODEL_AUTHORED_SOURCES.includes(input.source),
  };
}

/**
 * THE POPULATION BOUNDARY. A `DEVELOPMENT_HUMAN_TRUTH` fact cannot enter a `PRODUCTION` ledger, and
 * the refusal is a throw rather than a filter: silently dropping it would let a caller believe the
 * fact was represented.
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
    if (population === 'PRODUCTION' && !PRODUCTION_PERMITTED_SOURCES.includes(f.source)) {
      throw new Error('DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION — '
        + `fact ${f.factKey} carries source ${f.source}, which may populate a DEVELOPMENT ledger `
        + 'only. Fixture truth is the standard the system is measured against and must never '
        + 'become part of the system being measured.');
    }
  }
  if (defects.length > 0) {
    throw new Error(`OWED_FACT_SET_INVALID — ${defects.join(' | ')}`);
  }
  return {
    population,
    facts: [...facts],
    transitions: [],
    admittedKeys: facts.map(f => f.factKey),
  };
}

export const factOf = (l: OwedFactLedger, key: string): OwedFact | undefined =>
  l.facts.find(f => f.factKey === key);

export const unresolvedFacts = (l: OwedFactLedger): readonly OwedFact[] =>
  l.facts.filter(f => f.status === 'UNRESOLVED');

/**
 * ADD a fact. Additive by construction: the returned ledger contains every prior fact unchanged.
 *
 * An exact `factKey` collision is a no-op rather than an error, and that is the ONLY deduplication
 * this module performs. §164: deduplicate on identity, never on similarity, because merging
 * similar-sounding facts is precisely how a gap disappears.
 */
export function addOwedFact(l: OwedFactLedger, f: OwedFact): OwedFactLedger {
  const defects = owedFactDefects(f);
  if (defects.length > 0) throw new Error(`OWED_FACT_INVALID — ${f.factKey}: ${defects.join(', ')}`);
  if (l.population === 'PRODUCTION' && !PRODUCTION_PERMITTED_SOURCES.includes(f.source)) {
    throw new Error('DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION — '
      + `fact ${f.factKey} carries source ${f.source}`);
  }
  const existing = factOf(l, f.factKey);
  if (existing) {
    // Exact identity. The set is unchanged; nothing is merged, replaced or re-stated.
    return l;
  }
  return {
    ...l,
    facts: [...l.facts, f],
    admittedKeys: [...l.admittedKeys, f.factKey],
  };
}

/**
 * A verifier nomination, added under the ADDITIVE-ONLY rule.
 *
 * This function cannot express replacement. It takes no key to remove, and it returns a ledger whose
 * fact list is a superset of the input's. That is the §164 invariant "a nomination is additive,
 * never substitutive", enforced by the shape of the call rather than by a check inside it.
 */
export function nominateAdditiveFact(l: OwedFactLedger, nominated: OwedFact): OwedFactLedger {
  if (nominated.source !== 'VERIFIER_NOMINATION') {
    throw new Error('NOMINATION_SOURCE_MUST_BE_VERIFIER_NOMINATION — '
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

/**
 * The ONLY way a fact leaves `UNRESOLVED`.
 *
 * Refuses: an unknown key; a fact that is not currently `UNRESOLVED`; an authority that does not
 * match the target status; an empty justification. Each refusal is one of §164's invariants, and
 * together they make "another gap was more interesting" unrepresentable -- there is no authority
 * member for salience.
 */
export function transition(l: OwedFactLedger, req: TransitionRequest): OwedFactLedger {
  const f = factOf(l, req.factKey);
  if (!f) {
    throw new Error(`TRANSITION_TARGET_NOT_IN_LEDGER — ${req.factKey} was never admitted`);
  }
  if (f.status !== 'UNRESOLVED') {
    throw new Error(`TRANSITION_FROM_TERMINAL_STATUS — ${req.factKey} is already ${f.status}`);
  }
  if (!(TRANSITION_AUTHORITIES as readonly string[]).includes(req.authority)) {
    throw new Error(`TRANSITION_AUTHORITY_NOT_A_MEMBER — ${String(req.authority)}; a model `
      + 'explanation is not an authority and there is no member for one');
  }
  if (REQUIRED_AUTHORITY[req.to] !== req.authority) {
    throw new Error(`TRANSITION_AUTHORITY_MISMATCH — ${req.to} requires `
      + `${REQUIRED_AUTHORITY[req.to]}, got ${req.authority}`);
  }
  if (blank(req.justification)) {
    throw new Error(`TRANSITION_JUSTIFICATION_MISSING — ${req.factKey} → ${req.to}`);
  }
  return {
    ...l,
    facts: l.facts.map(x => (x.factKey === req.factKey ? { ...x, status: req.to } : x)),
    transitions: [...l.transitions, {
      seq: l.transitions.length + 1,
      factKey: req.factKey,
      from: 'UNRESOLVED',
      to: req.to,
      authority: req.authority,
      justification: req.justification.trim(),
    }],
  };
}

// ------------------------------------------------------------------ preservation invariants

/**
 * Keys present in `before` and absent from `after`. On a ledger built through this module this is
 * always empty; the function exists so a test can PROVE that against an adversarially constructed
 * successor rather than trusting the constructor.
 */
export function factsRemoved(before: OwedFactLedger, after: OwedFactLedger): string[] {
  const afterKeys = new Set(after.facts.map(f => f.factKey));
  return before.facts.map(f => f.factKey).filter(k => !afterKeys.has(k));
}

/**
 * The full §164 preservation check between two ledger states. Reports every violation rather than
 * the first, so a caller sees the whole picture.
 */
export function preservationViolations(
  before: OwedFactLedger, after: OwedFactLedger,
): string[] {
  const v: string[] = [];
  for (const k of factsRemoved(before, after)) {
    v.push(`FACT_DELETED:${k} — an owed fact may never be removed`);
  }
  const transitionedKeys = new Set(after.transitions.map(t => t.factKey));
  for (const b of before.facts) {
    const a = after.facts.find(f => f.factKey === b.factKey);
    if (!a) continue;
    if (a.status !== b.status) {
      if (b.status !== 'UNRESOLVED') {
        v.push(`TERMINAL_STATUS_MUTATED:${b.factKey} ${b.status} → ${a.status}`);
      }
      if (!transitionedKeys.has(b.factKey)) {
        v.push(`STATUS_CHANGED_WITHOUT_A_RECORDED_TRANSITION:${b.factKey} `
          + `${b.status} → ${a.status}`);
      }
    }
    // Identity fields are immutable once admitted. A "clarified" evidence span is a different fact.
    if (a.evidenceSpan !== b.evidenceSpan || a.affectedDecision !== b.affectedDecision
        || a.source !== b.source || a.priority !== b.priority) {
      v.push(`FACT_IDENTITY_MUTATED:${b.factKey}`);
    }
  }
  if (after.transitions.length < before.transitions.length) {
    v.push('TRANSITION_LEDGER_TRUNCATED — the transition record is append-only');
  }
  for (let i = 0; i < before.transitions.length; i += 1) {
    if (JSON.stringify(before.transitions[i]) !== JSON.stringify(after.transitions[i])) {
      v.push(`TRANSITION_REWRITTEN:seq ${before.transitions[i].seq}`);
    }
  }
  return v;
}

/**
 * Exact-identity deduplication, offered as a named function so nothing has to improvise one.
 *
 * It compares `factKey` and NOTHING else. Two facts whose text is near-identical but whose keys
 * differ both survive: that is the intended, and safety-relevant, behaviour.
 */
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

/** Facts a model authored. Reported so a caller can honour the §164 `modelAuthored` limit. */
export const modelAuthoredFacts = (l: OwedFactLedger): readonly OwedFact[] =>
  l.facts.filter(f => f.modelAuthored);

/**
 * §164: a production owed fact sourced from model output cannot ALONE justify a fail-closed
 * customer-visible state. Returns the keys that would be relied on illegitimately.
 */
export function modelAuthoredOnlyFailClosedKeys(
  l: OwedFactLedger, reliedOnKeys: readonly string[],
): string[] {
  if (l.population !== 'PRODUCTION') return [];
  const relied = reliedOnKeys
    .map(k => factOf(l, k))
    .filter((f): f is OwedFact => !!f);
  if (relied.length === 0) return [];
  return relied.every(f => f.modelAuthored) ? relied.map(f => f.factKey) : [];
}
