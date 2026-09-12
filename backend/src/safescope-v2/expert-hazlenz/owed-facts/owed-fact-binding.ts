/**
 * EXPERT HAZLENZ -- CLOSED-SET BINDING, PER-FACT DECLARATIONS, AND COVERAGE. §170.
 * INTEGRATED AND INACTIVE.
 *
 * ==================== THE ONE IDEA ====================
 *
 * Do not match meaning. Require a DECLARATION and check it deterministically. Coverage is then a
 * set difference over declared bindings rather than a judgement about what a question means.
 *
 * §167 measured this hosted: 12 of 12 draws bound a member of the closed set, and §169's human
 * review confirmed all 12 named the right fact with zero incorrect bindings.
 *
 * ==================== WHAT THIS MODULE NEVER READS ====================
 *
 * The question text, the rationale, and any similarity between them and an owed fact's text.
 * `COVERAGE_DECISION_INPUTS` names every field a coverage decision consults. The only string
 * comparisons here are exact equality on a key and substring containment for a verbatim span --
 * both byte checks, neither a semantic one.
 *
 * ==================== AND WHAT IT CANNOT CHECK, STATED PLAINLY ====================
 *
 * That a bound question would actually RESOLVE the fact it bound to. §169 found four cases where it
 * would not: the question named the right fact and accepted evidence -- visibility, a status
 * indicator, physical inspection -- that cannot establish a protective function.
 *
 * `CLARIFICATION_EVIDENCE_SUFFICIENCY` is therefore `SEMANTIC_JUDGMENT_REQUIRED` and is answered by
 * human sampling. No matcher is added here, because a deterministic gate over question prose would
 * be exactly the instrument retired for being satisfiable by the observation itself.
 */

import {
  type OwedFactAffectedDecision, type OwedFactDeclaration, type OwedFactPriority,
  type ArbitrationRequest,
  OWED_FACT_AFFECTED_DECISIONS, OWED_FACT_DECLARATIONS, OWED_FACT_PRIORITIES,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from './owed-fact.types';
import {
  type OwedFactLedger, factOf, nominateAdditiveFact, owedFact, transition, unresolvedFacts,
} from './owed-fact-ledger';

export const BINDING_CONTRACT_VERSION = 'hazlenz.expert.owed-fact-binding.runtime.v1' as const;

/**
 * The residual semantic question, named as a constant so it cannot quietly acquire an
 * implementation.
 */
export const CLARIFICATION_EVIDENCE_SUFFICIENCY = 'SEMANTIC_JUDGMENT_REQUIRED' as const;

/** The exact fields any coverage decision is permitted to consult. */
export const COVERAGE_DECISION_INPUTS = [
  'declaration.bindingMode',
  'declaration.coversFactKey',
  'owedFact.factKey',
  'owedFact.status',
  'owedFact.evidenceSpan (byte equality against the observation only)',
] as const;

export const BINDING_MODES = ['BOUND_TO_OWED_FACT', 'NOMINATED_NEW'] as const;
export type BindingMode = (typeof BINDING_MODES)[number];

export interface NominationPayload {
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly evidenceSpan: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  readonly priority: OwedFactPriority;
}

export interface ClarificationDeclaration {
  readonly declarationId: string;
  readonly bindingMode: BindingMode;
  readonly coversFactKey: string | null;
  readonly nomination: NominationPayload | null;
  /** Carried for the customer surface and observability. NEVER read by a coverage decision. */
  readonly question: string;
  readonly affectedDecision: OwedFactAffectedDecision;
}

export const BINDING_ADMISSION_CODES = [
  'BINDING_MODE_NOT_A_MEMBER', 'BOUND_KEY_MISSING', 'BOUND_KEY_NOT_IN_CLOSED_SET',
  'BOUND_FACT_NOT_UNRESOLVED', 'BINDING_MODE_CARRIES_A_NOMINATION',
  'NOMINATION_MISSING_FOR_NOMINATED_MODE', 'NOMINATION_CARRIES_A_BOUND_KEY',
  'NOMINATION_FIELD_MISSING', 'NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM',
  'NOMINATION_BRANCHES_IDENTICAL', 'NOMINATION_DECISIONS_DO_NOT_DIVERGE',
  'NOMINATION_AFFECTED_DECISION_NOT_A_MEMBER', 'NOMINATION_PRIORITY_NOT_A_MEMBER',
  'NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT', 'MORE_THAN_ONE_NOMINATION',
  'DUPLICATE_DECLARATION_ID', 'TWO_DECLARATIONS_BIND_THE_SAME_FACT',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
  'OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', 'OWED_FACT_DECLARATION_DUPLICATED',
  'OWED_FACT_NOT_DECLARED', 'MORE_THAN_ONE_FACT_DECLARED_BOUND',
  'BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY', 'CHALLENGE_WITHOUT_A_REASON',
] as const;
export type BindingAdmissionCode = (typeof BINDING_ADMISSION_CODES)[number];

export interface DeclarationAdmission {
  readonly declarationId: string;
  readonly admitted: boolean;
  readonly codes: readonly BindingAdmissionCode[];
  readonly detail: readonly string[];
}

export interface BindingCheckResult {
  readonly version: string;
  readonly perDeclaration: readonly DeclarationAdmission[];
  readonly admitted: readonly ClarificationDeclaration[];
  readonly refused: readonly ClarificationDeclaration[];
  readonly boundFactKeys: readonly string[];
  readonly nominationCount: number;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/** Refuses a declaration WHOLE on any violation, which leaves every owed fact where it was. */
export function checkBindingDeclarations(
  declarations: readonly ClarificationDeclaration[],
  ledger: OwedFactLedger,
  observation: string,
  maxNominations = 1,
): BindingCheckResult {
  const perDeclaration: DeclarationAdmission[] = [];
  const admitted: ClarificationDeclaration[] = [];
  const refused: ClarificationDeclaration[] = [];
  const seenIds = new Set<string>();
  const boundSoFar = new Set<string>();
  let nominationsSeen = 0;

  for (const d of declarations) {
    const codes: BindingAdmissionCode[] = [];
    const detail: string[] = [];
    const fail = (c: BindingAdmissionCode, why: string): void => { codes.push(c); detail.push(why); };

    // A provider may not return HazLenz-owned task state, `acceptableEvidence` above all.
    for (const forbidden of PROVIDER_FORBIDDEN_OWED_FACT_FIELDS) {
      if (forbidden in (d as unknown as Record<string, unknown>)) {
        fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
          `declaration carried '${forbidden}', which only HazLenz may set`);
      }
    }
    if (seenIds.has(d.declarationId)) {
      fail('DUPLICATE_DECLARATION_ID', `${d.declarationId} appears more than once`);
    }
    seenIds.add(d.declarationId);

    if (!(BINDING_MODES as readonly string[]).includes(d.bindingMode)) {
      fail('BINDING_MODE_NOT_A_MEMBER', String(d.bindingMode));
    } else if (d.bindingMode === 'BOUND_TO_OWED_FACT') {
      if (d.nomination !== null && d.nomination !== undefined) {
        fail('BINDING_MODE_CARRIES_A_NOMINATION',
          'a bound declaration may not also nominate; nominate as its own declaration');
      }
      if (blank(d.coversFactKey)) {
        fail('BOUND_KEY_MISSING', 'BOUND_TO_OWED_FACT must name a factKey');
      } else {
        const key = String(d.coversFactKey);
        const target = factOf(ledger, key);
        if (!target) {
          fail('BOUND_KEY_NOT_IN_CLOSED_SET',
            `${key} is not a member of the ${ledger.facts.length}-fact closed set`);
        } else if (target.status !== 'UNRESOLVED') {
          fail('BOUND_FACT_NOT_UNRESOLVED', `${key} is already ${target.status}`);
        } else if (boundSoFar.has(key)) {
          fail('TWO_DECLARATIONS_BIND_THE_SAME_FACT', `${key} was already bound in this set`);
        }
      }
    } else {
      if (!blank(d.coversFactKey)) {
        fail('NOMINATION_CARRIES_A_BOUND_KEY',
          'a nomination is additive and does not bind an existing key');
      }
      nominationsSeen += 1;
      if (nominationsSeen > maxNominations) {
        fail('MORE_THAN_ONE_NOMINATION',
          `${nominationsSeen} nominations; the ceiling is ${maxNominations}`);
      }
      const n = d.nomination;
      if (!n || typeof n !== 'object') {
        fail('NOMINATION_MISSING_FOR_NOMINATED_MODE', 'NOMINATED_NEW must carry its proof');
      } else {
        for (const f of ['factKey', 'evidenceSpan', 'whyUnresolved', 'branchA', 'branchB',
          'decisionIfA', 'decisionIfB'] as const) {
          if (blank(n[f])) fail('NOMINATION_FIELD_MISSING', `nomination.${f} is empty`);
        }
        if (!blank(n.evidenceSpan) && !observation.includes(n.evidenceSpan.trim())) {
          fail('NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM',
            `${JSON.stringify(n.evidenceSpan.slice(0, 60))} is not a verbatim observation span`);
        }
        if (!blank(n.branchA) && !blank(n.branchB) && n.branchA.trim() === n.branchB.trim()) {
          fail('NOMINATION_BRANCHES_IDENTICAL', 'branchA and branchB state the same thing');
        }
        if (!blank(n.decisionIfA) && !blank(n.decisionIfB)
            && n.decisionIfA.trim() === n.decisionIfB.trim()) {
          fail('NOMINATION_DECISIONS_DO_NOT_DIVERGE', 'the same thing is done under both branches');
        }
        if (!(OWED_FACT_AFFECTED_DECISIONS as readonly string[]).includes(n.affectedDecision)) {
          fail('NOMINATION_AFFECTED_DECISION_NOT_A_MEMBER', String(n.affectedDecision));
        }
        if (!(OWED_FACT_PRIORITIES as readonly string[]).includes(n.priority)) {
          fail('NOMINATION_PRIORITY_NOT_A_MEMBER', String(n.priority));
        }
        const collision = !blank(n.factKey) ? factOf(ledger, n.factKey) : undefined;
        if (collision && collision.status === 'UNRESOLVED') {
          fail('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT',
            `${n.factKey} is already an unresolved owed fact; bind to it instead of nominating it`);
        }
      }
    }

    const ok = codes.length === 0;
    perDeclaration.push({ declarationId: d.declarationId, admitted: ok, codes, detail });
    if (ok) {
      admitted.push(d);
      if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) boundSoFar.add(d.coversFactKey);
    } else {
      refused.push(d);
    }
  }

  return {
    version: BINDING_CONTRACT_VERSION,
    perDeclaration,
    admitted,
    refused,
    boundFactKeys: [...boundSoFar],
    nominationCount: admitted.filter(d => d.bindingMode === 'NOMINATED_NEW').length,
  };
}

// ---------------------------------------------------------------- per-fact declarations

export interface OwedFactDeclarationEntry {
  readonly factKey: string;
  readonly declaration: OwedFactDeclaration;
  readonly challengeReason: string | null;
}

export interface DeclarationParseResult {
  readonly admitted: boolean;
  readonly codes: readonly BindingAdmissionCode[];
  readonly detail: readonly string[];
  readonly arbitrationRequests: readonly ArbitrationRequest[];
  readonly stillUnresolvedFactKeys: readonly string[];
}

/**
 * Every supplied key gets exactly one declaration and no other key appears at all. A fact nobody
 * mentions is not thereby handled.
 */
export function parseOwedFactDeclarations(
  entries: readonly OwedFactDeclarationEntry[],
  suppliedFactKeys: readonly string[],
  bindingFactKey: string | null,
): DeclarationParseResult {
  const codes: BindingAdmissionCode[] = [];
  const detail: string[] = [];
  const fail = (c: BindingAdmissionCode, why: string): void => { codes.push(c); detail.push(why); };
  const supplied = new Set(suppliedFactKeys);
  const seen = new Set<string>();
  const arbitration: ArbitrationRequest[] = [];
  let bound = 0;

  for (const e of entries) {
    if (!supplied.has(e.factKey)) {
      fail('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', `${e.factKey} was not supplied`);
      continue;
    }
    if (seen.has(e.factKey)) {
      fail('OWED_FACT_DECLARATION_DUPLICATED', `${e.factKey} declared more than once`);
      continue;
    }
    seen.add(e.factKey);
    if (!(OWED_FACT_DECLARATIONS as readonly string[]).includes(e.declaration)) {
      fail('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', `${e.factKey}: ${String(e.declaration)}`);
      continue;
    }
    if (e.declaration === 'CHALLENGE_FACT_VALIDITY') {
      if (blank(e.challengeReason)) {
        fail('CHALLENGE_WITHOUT_A_REASON', `${e.factKey} was challenged with no reason`);
      } else {
        arbitration.push({
          factKey: e.factKey,
          requestedBy: 'VERIFIER',
          reason: String(e.challengeReason),
          settles: false,
          factStatusUnchanged: true,
        });
      }
    }
    if (e.declaration === 'BOUND_BY_CLARIFICATION') {
      bound += 1;
      if (bindingFactKey === null || e.factKey !== bindingFactKey) {
        fail('BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY',
          `${e.factKey} declared bound but bindingFactKey is ${String(bindingFactKey)}`);
      }
    }
  }
  for (const key of suppliedFactKeys) {
    if (!seen.has(key)) fail('OWED_FACT_NOT_DECLARED', `${key} received no declaration`);
  }
  if (bound > 1) {
    fail('MORE_THAN_ONE_FACT_DECLARED_BOUND', `${bound} facts declared bound; one binds one`);
  }

  const admitted = codes.length === 0;
  return {
    admitted,
    codes,
    detail,
    arbitrationRequests: admitted ? arbitration : [],
    stillUnresolvedFactKeys: entries
      .filter(e => e.declaration !== 'BOUND_BY_CLARIFICATION').map(e => e.factKey),
  };
}

// ---------------------------------------------------------------- applying admitted declarations

/**
 * Two effects and no others: a nomination ADDS its fact; a binding transitions EXACTLY its own key
 * to `COVERED`. A sibling fact -- same equipment, same hazard family, same affected decision -- is
 * untouched, because the loop names one key.
 *
 * A nominated fact inherits `acceptableEvidence: null`. HazLenz has no trustworthy criterion for a
 * fact it did not author, and inventing one here would be exactly the manufacture the provenance
 * policy forbids.
 */
export function applyAdmittedDeclarations(
  ledger: OwedFactLedger, check: BindingCheckResult,
): OwedFactLedger {
  let next = ledger;
  for (const d of check.admitted) {
    if (d.bindingMode === 'NOMINATED_NEW' && d.nomination) {
      const n = d.nomination;
      next = nominateAdditiveFact(next, owedFact({
        factKey: n.factKey,
        affectedDecision: n.affectedDecision,
        source: 'VERIFIER_NOMINATION',
        evidenceSpan: n.evidenceSpan,
        whyUnresolved: n.whyUnresolved,
        branchA: n.branchA,
        branchB: n.branchB,
        decisionDivergence: { ifA: n.decisionIfA, ifB: n.decisionIfB },
        priority: n.priority,
        acceptableEvidence: null,
      }));
    }
  }
  for (const d of check.admitted) {
    if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) {
      next = transition(next, {
        factKey: d.coversFactKey,
        to: 'COVERED',
        authority: 'ADMITTED_BINDING',
        justification: `declaration ${d.declarationId} explicitly bound ${d.coversFactKey}`,
      });
    }
  }
  return next;
}

/** Keys that changed status without an admitted binding entitling them to. */
export function bindingSideEffects(
  before: OwedFactLedger, after: OwedFactLedger, check: BindingCheckResult,
): string[] {
  const entitled = new Set(check.boundFactKeys);
  const problems: string[] = [];
  for (const key of unresolvedFacts(before).map(f => f.factKey)) {
    const a = factOf(after, key);
    if (!a) { problems.push(`FACT_VANISHED:${key}`); continue; }
    if (a.status === 'COVERED' && !entitled.has(key)) {
      problems.push(`IMPLICIT_COVERAGE:${key} became COVERED with no admitted binding naming it`);
    }
  }
  return problems;
}

export function bindingMap(check: BindingCheckResult): Readonly<Record<string, string>> {
  const m: Record<string, string> = {};
  for (const d of check.admitted) {
    if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) m[d.declarationId] = d.coversFactKey;
  }
  return m;
}

// ---------------------------------------------------------------- coverage

export const COVERAGE_COMPUTATION_METHOD =
  'DETERMINISTIC_CLOSED_SET_MEMBERSHIP_OVER_DECLARED_BINDINGS' as const;

export const COVERAGE_PRIORITY_GATE: readonly OwedFactPriority[] =
  ['LIFE_CRITICAL', 'REQUIRED_CONTROL'];

export interface TargetCoverageResult {
  readonly method: typeof COVERAGE_COMPUTATION_METHOD;
  /** TRUE if ANY owed fact remains UNRESOLVED and unbound. The stricter of the two rules. */
  readonly TARGET_COVERAGE_WARNING: boolean;
  /** The priority-gated reading, reported alongside so neither is lost. */
  readonly priorityGatedWarning: boolean;
  readonly uncoveredFactKeys: readonly string[];
  readonly uncoveredPriorityGatedFactKeys: readonly string[];
  readonly reason: string;
}

/**
 * A set difference. Inputs are keys and statuses only -- the function is not GIVEN question text,
 * so it cannot consult it.
 */
export function evaluateTargetCoverage(
  ledger: OwedFactLedger, boundFactKeys: readonly string[],
): TargetCoverageResult {
  const bound = new Set(boundFactKeys);
  const uncovered = ledger.facts
    .filter(f => f.status === 'UNRESOLVED' && !bound.has(f.factKey))
    .map(f => f.factKey);
  const gated = uncovered.filter(k => COVERAGE_PRIORITY_GATE.includes(factOf(ledger, k)!.priority));
  return {
    method: COVERAGE_COMPUTATION_METHOD,
    TARGET_COVERAGE_WARNING: uncovered.length > 0,
    priorityGatedWarning: gated.length > 0,
    uncoveredFactKeys: uncovered,
    uncoveredPriorityGatedFactKeys: gated,
    reason: uncovered.length === 0
      ? 'every owed fact is COVERED by an admitted binding, SETTLED_BY_EVIDENCE, or '
        + 'REJECTED_BY_ARBITRATION'
      : `${uncovered.length} owed fact(s) remain UNRESOLVED with no admitted binding: `
        + uncovered.join(', '),
  };
}
