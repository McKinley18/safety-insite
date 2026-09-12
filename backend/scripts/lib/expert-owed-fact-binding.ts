/**
 * §165 EXPERT HAZLENZ -- CLOSED-SET BINDING CONTRACT. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== THE ONE IDEA, IMPLEMENTED ====================
 *
 * §164's central move is to stop asking what a question MEANS and start requiring a DECLARATION that
 * can be checked by set membership. Every clarification declares one of exactly two things:
 *
 *   A. `BOUND_TO_OWED_FACT` -- it covers `coversFactKey`, which must be a member of the closed owed
 *      set supplied before the verifier ran, and must still be `UNRESOLVED`;
 *   B. `NOMINATED_NEW`      -- it concerns a fact the set did not contain, supplied with the full
 *      two-branch divergence proof the v2 nomination contract already requires.
 *
 * There is no third option, and B is ADDITIVE. `applyAdmittedDeclarations` cannot express
 * replacement: it calls `nominateAdditiveFact`, whose signature has nowhere to name a fact to drop.
 *
 * ==================== WHAT THIS MODULE DELIBERATELY NEVER READS ====================
 *
 * The question text, the rationale, the nominated fact's prose, and any similarity between them and
 * an owed fact's text. `COVERAGE_DECISION_INPUTS` names every field a coverage decision consults,
 * and the accompanying test greps this file to prove no lexical-overlap helper exists in it. §160's
 * FINDING 1 -- a keyword scorer satisfied by the observation text itself -- is the failure that
 * makes this discipline non-negotiable, and the §164 design's whole warrant is that binding
 * sidesteps it by never asking a matcher what text means.
 *
 * The verbatim `evidenceSpan` check IS performed, and is not an exception: byte equality against the
 * observation is not a semantic judgement, and it is the same check the v2 nomination contract and
 * the first-pass quote binder already run.
 */

import {
  type OwedFactLedger, type OwedFact, type OwedFactPriority, type OwedFactAffectedDecision,
  OWED_FACT_AFFECTED_DECISIONS, OWED_FACT_PRIORITIES,
  factOf, owedFact, nominateAdditiveFact, transition, unresolvedFacts,
} from './expert-owed-facts';

export const BINDING_CONTRACT_VERSION = 'hazlenz.expert.owed-fact-binding.v1' as const;

export const BINDING_MODES = ['BOUND_TO_OWED_FACT', 'NOMINATED_NEW'] as const;
export type BindingMode = (typeof BINDING_MODES)[number];

/**
 * The exact fields any coverage decision in this layer is permitted to consult. Recorded in code so
 * that a later edit adding a text comparison contradicts a published constant rather than a comment.
 */
export const COVERAGE_DECISION_INPUTS = [
  'declaration.bindingMode',
  'declaration.coversFactKey',
  'owedFact.factKey',
  'owedFact.status',
  'owedFact.evidenceSpan (byte equality against the observation only)',
] as const;

/** What a coverage decision may NEVER consult. Asserted by the proof suite against this file. */
export const COVERAGE_DECISION_FORBIDDEN_INPUTS = [
  'the clarification question text',
  'the verifier rationale',
  'lexical or keyword overlap between any two strings',
  'an embedding or similarity score',
  'the model\'s own assertion that it covered a fact',
] as const;

export interface NominationPayload {
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  /** Copied verbatim from the observation. Checked by byte equality. */
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
  /** Set when and only when `bindingMode === 'BOUND_TO_OWED_FACT'`. */
  readonly coversFactKey: string | null;
  /** Set when and only when `bindingMode === 'NOMINATED_NEW'`. */
  readonly nomination: NominationPayload | null;
  /** Carried for observability and for the customer surface. NEVER read by a coverage decision. */
  readonly question: string;
  readonly affectedDecision: OwedFactAffectedDecision;
}

export const BINDING_ADMISSION_CODES = [
  'BINDING_MODE_NOT_A_MEMBER',
  'BOUND_KEY_MISSING',
  'BOUND_KEY_NOT_IN_CLOSED_SET',
  'BOUND_FACT_NOT_UNRESOLVED',
  'BINDING_MODE_CARRIES_A_NOMINATION',
  'NOMINATION_MISSING_FOR_NOMINATED_MODE',
  'NOMINATION_CARRIES_A_BOUND_KEY',
  'NOMINATION_FIELD_MISSING',
  'NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM',
  'NOMINATION_BRANCHES_IDENTICAL',
  'NOMINATION_DECISIONS_DO_NOT_DIVERGE',
  'NOMINATION_AFFECTED_DECISION_NOT_A_MEMBER',
  'NOMINATION_PRIORITY_NOT_A_MEMBER',
  'NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT',
  'MORE_THAN_ONE_NOMINATION',
  'DUPLICATE_DECLARATION_ID',
  'TWO_DECLARATIONS_BIND_THE_SAME_FACT',
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
  /** Fact keys an admitted declaration explicitly bound. The only keys coverage may clear. */
  readonly boundFactKeys: readonly string[];
  readonly nominationCount: number;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * The admission rule. Refuses a declaration WHOLE on any violation, exactly as the v2 contract does:
 * a partly-valid declaration is not a partly-correct one, and refusing it leaves every owed fact
 * where it was, which is safe by construction.
 *
 * `maxNominations` is 1 by default -- the frozen v2 ceiling -- and is a parameter only so the proof
 * suite can exercise the refusal path without editing the contract.
 */
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
    const fail = (c: BindingAdmissionCode, why: string): void => {
      codes.push(c); detail.push(why);
    };

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
      // NOMINATED_NEW
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
          fail('NOMINATION_DECISIONS_DO_NOT_DIVERGE',
            'the same thing is done under both branches');
        }
        if (!(OWED_FACT_AFFECTED_DECISIONS as readonly string[]).includes(n.affectedDecision)) {
          fail('NOMINATION_AFFECTED_DECISION_NOT_A_MEMBER', String(n.affectedDecision));
        }
        if (!(OWED_FACT_PRIORITIES as readonly string[]).includes(n.priority)) {
          fail('NOMINATION_PRIORITY_NOT_A_MEMBER', String(n.priority));
        }
        // A nomination that reuses an UNRESOLVED owed fact's key is a rename of that fact, and
        // admitting it would let a nomination silently claim an existing gap.
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
      if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) {
        boundSoFar.add(d.coversFactKey);
      }
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

/**
 * Apply admitted declarations to the ledger.
 *
 * Two effects, and no others:
 *   - a `NOMINATED_NEW` declaration ADDS its fact. Nothing is removed and no existing status moves.
 *   - a `BOUND_TO_OWED_FACT` declaration transitions EXACTLY its own key to `COVERED`, under
 *     authority `ADMITTED_BINDING`. A sibling fact -- same equipment, same hazard family, same
 *     affected decision -- is untouched, because the loop iterates declarations and names one key.
 *
 * This function is where §163's failure would have had to occur, and there is no statement in it
 * that could produce it.
 */
export function applyAdmittedDeclarations(
  ledger: OwedFactLedger,
  check: BindingCheckResult,
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

/**
 * Adversarial check: did applying these declarations disturb anything they were not entitled to?
 *
 * Reports keys that changed status without a matching admitted binding, and keys that disappeared.
 * Used by the proof suite to establish the HS-A1 shape mechanically rather than by inspection.
 */
export function bindingSideEffects(
  before: OwedFactLedger, after: OwedFactLedger, check: BindingCheckResult,
): string[] {
  const entitled = new Set(check.boundFactKeys);
  const problems: string[] = [];
  const beforeUnresolved = unresolvedFacts(before).map(f => f.factKey);
  for (const key of beforeUnresolved) {
    const a = factOf(after, key);
    if (!a) { problems.push(`FACT_VANISHED:${key}`); continue; }
    if (a.status === 'COVERED' && !entitled.has(key)) {
      problems.push(`IMPLICIT_COVERAGE:${key} became COVERED with no admitted binding naming it`);
    }
  }
  return problems;
}

/** Convenience for the customer surface and observability: which declaration bound which fact. */
export function bindingMap(check: BindingCheckResult): Readonly<Record<string, string>> {
  const m: Record<string, string> = {};
  for (const d of check.admitted) {
    if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) {
      m[d.declarationId] = d.coversFactKey;
    }
  }
  return m;
}

export type { OwedFact };
