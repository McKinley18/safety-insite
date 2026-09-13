/**
 * §203 EXPERT HAZLENZ -- SUCCESSOR CLOSED-SET BINDING. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * Lineage: COPIED_FROM `owed-fact-binding.ts` (§187-pinned, byte-unmodified; see `ANCESTOR_PINS`).
 * Exactly two ancestor functions are reproduced -- `checkBindingDeclarations` (:118-230) and
 * `applyAdmittedDeclarations` (:329-361) -- because their own contracts must change to enforce the
 * §203-authorized invariants. Everything else (`bindingSideEffects`, `evaluateTargetCoverage`,
 * `parseOwedFactDeclarations`, the whole ledger module) is IMPORTED from the frozen sources,
 * never duplicated. The copy is faithful to the ancestor except at the recorded divergences below.
 *
 * ==================== RECORDED SUCCESSOR-CONTRACT DIVERGENCES ====================
 *
 * Pinned by regression tests in `test-203-boundary-guards.ts`; each cites its ancestor lines.
 *
 * B1 (ABF-3, ancestor :179-209). The ancestor scans the DECLARATION for HazLenz-owned fields
 *    (:137-142) and never scans `d.nomination` -- the object a provider actually populates. The
 *    successor calls §202's `nominationHazLenzOwnedFieldScan` in the NOMINATED_NEW branch and
 *    refuses on any hit (`NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD`).
 *
 * B2 (Ruling 5, ancestor :61-71, :201-203). The ancestor's `NominationPayload.priority` is a
 *    REQUIRED provider-authored field written straight onto `OwedFact.priority` (:345) -- the exact
 *    ABF-4 contract contradiction. The successor nomination contract carries NO authoritative
 *    priority field at all: a nomination bearing `priority` is refused
 *    (`NOMINATION_CARRIES_PROVIDER_PRIORITY`), actual priority is the deterministic constant
 *    `SUCCESSOR_NOMINATED_FACT_PRIORITY`, and model urgency, if the provider supplies it, travels
 *    only in `urgencyNomination` -- a NON-AUTHORITATIVE nomination that maps into no priority and
 *    no escalation state. `NOMINATION_PRIORITY_NOT_A_MEMBER` is therefore not in the successor
 *    vocabulary: the field it validated does not exist here. ABF-4 is dissolved FOR THE SUCCESSOR
 *    CONTRACT ONLY; the historical contradiction stands, untouched, for the product owner.
 *
 * B3 (ABF-8, ancestor :122). The ancestor ceiling is a bare default parameter (`maxNominations =
 *    1`) a caller may widen. The successor takes NO widening parameter -- the ceiling is
 *    `SUCCESSOR_NOMINATION_CEILING`, bound to §202's `FROZEN_NOMINATION_CEILING`, and §202's
 *    `nominationCeilingViolations` is exercised on every call as an edit tripwire: any future
 *    change of the successor ceiling makes every call throw before admitting anything.
 *
 * B4 (Ruling 4). The successor declaration and nomination key sets are CLOSED at the runtime parse
 *    boundary (`UNKNOWN_FIELD_AT_CLOSED_BOUNDARY`), and the model-facing schema constant sets
 *    `additionalProperties: false` on every object node. The ancestor relied on the transport
 *    keyword alone.
 *
 * B5 (post-condition, §202 G6). `applyAdmittedDeclarations203` calls §202's
 *    `nominationOutcomeViolations` and THROWS on any violation: an admitted nomination that
 *    produced no fact is an integrity failure, never a silent no-op. This closes ABF-5's silent
 *    path at the apply boundary even before the admission-side fix lands.
 *
 * C1 (Ruling 3 / ABF-5, ancestor :204-208 -- implemented by Agent C at the declared handoff).
 *    The ancestor refuses a nomination-key collision only when the existing fact is UNRESOLVED; a
 *    TERMINAL-status collision was admitted and then silently no-opped by the frozen ledger
 *    (`owed-fact-ledger.ts:163`), with zero audit output -- §202's ABF-5. The successor widens the
 *    collision test AT ADMISSION, the narrowest boundary holding both identities (the nominated
 *    key and the ledger): an UNRESOLVED collision keeps the ancestor refusal verbatim; a
 *    terminal-status collision is refused with the explicit structural state
 *    `FACT_IDENTITY_COLLISION` and a structured `FactIdentityCollisionDiagnostic` on the result
 *    (`collisionDiagnostics`). The existing terminal fact is preserved unchanged, never reopened;
 *    no replacement key is synthesized; the refused declaration never reaches `check.admitted`, so
 *    question projection (which reads only admitted declarations) cannot emit a question for it.
 *    No semantic position is taken on whether the two facts are the same fact -- see
 *    `expert-203-fact-identity-collision.ts` and IDENTITY-COLLISION-ARCHITECTURE.md.
 */

import {
  type OwedFactAffectedDecision, type OwedFactPriority,
  OWED_FACT_AFFECTED_DECISIONS, OWED_FACT_PRIORITIES, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  type OwedFactLedger, factOf, nominateAdditiveFact, owedFact, transition,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import type { BindingCheckResult } from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  FROZEN_NOMINATION_CEILING,
  nominationCeilingViolations,
  nominationHazLenzOwnedFieldScan,
  nominationOutcomeViolations,
} from './expert-202-authority-boundary-guards';
import { SUCCESSOR_CONTRACT_VERSION } from './expert-203-successor-identity';
import {
  type FactIdentityCollisionDiagnostic, detectTerminalIdentityCollision,
} from './expert-203-fact-identity-collision';

export const SUCCESSOR_BINDING_CONTRACT_VERSION =
  'hazlenz.expert.203-successor-binding.v1' as const;

/** B2: the deterministic priority every successor-nominated fact enters at. Ruling 5: the
 * non-escalating floor, the same policy `FIRST_PASS_PROJECTED_PRIORITY` states for the first pass.
 * A provider cannot raise `UNRESOLVED_SAFETY_STATE` by calling its own nomination life-critical. */
export const SUCCESSOR_NOMINATED_FACT_PRIORITY: OwedFactPriority = 'OTHER';

/** B3: the successor ceiling. Bound to the §202 constant, not restated as a literal. */
export const SUCCESSOR_NOMINATION_CEILING = FROZEN_NOMINATION_CEILING;

export const SUCCESSOR_BINDING_MODES = ['BOUND_TO_OWED_FACT', 'NOMINATED_NEW'] as const;
export type SuccessorBindingMode = (typeof SUCCESSOR_BINDING_MODES)[number];

/**
 * B2: the successor nomination payload. NO `priority` field exists. `urgencyNomination` is
 * NON-AUTHORITATIVE: it is carried onto the admission record for observability and future
 * escalation-policy work, is validated for vocabulary membership only, and is read by NOTHING that
 * assigns priority, ranks a budget, or raises a safety state. (No final escalation-policy redesign
 * is performed here -- Ruling 5.)
 */
export interface SuccessorNominationPayload {
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly evidenceSpan: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  readonly urgencyNomination?: string | null;
}

export interface SuccessorClarificationDeclaration {
  readonly declarationId: string;
  readonly bindingMode: SuccessorBindingMode;
  readonly coversFactKey: string | null;
  readonly nomination: SuccessorNominationPayload | null;
  /** Carried for the customer surface and observability. NEVER read by a coverage decision. */
  readonly question: string;
  readonly affectedDecision: OwedFactAffectedDecision;
}

/** B4: the closed key sets, held as data so the parse boundary and the suite count the same list. */
export const SUCCESSOR_DECLARATION_KEYS = [
  'declarationId', 'bindingMode', 'coversFactKey', 'nomination', 'question', 'affectedDecision',
] as const;
export const SUCCESSOR_NOMINATION_KEYS = [
  'factKey', 'affectedDecision', 'evidenceSpan', 'whyUnresolved', 'branchA', 'branchB',
  'decisionIfA', 'decisionIfB', 'urgencyNomination',
] as const;

/**
 * B4 / Ruling 4: the model-facing schema, closed at the actual schema boundary. Every object node
 * sets `additionalProperties: false`; the suite asserts that property on every node rather than
 * trusting this comment.
 */
export const SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203 = {
  type: 'object',
  additionalProperties: false,
  required: ['declarationId', 'bindingMode', 'coversFactKey', 'nomination', 'question',
    'affectedDecision'],
  properties: {
    declarationId: { type: 'string' },
    bindingMode: { type: 'string', enum: ['BOUND_TO_OWED_FACT', 'NOMINATED_NEW'] },
    coversFactKey: { type: ['string', 'null'] },
    nomination: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['factKey', 'affectedDecision', 'evidenceSpan', 'whyUnresolved', 'branchA',
        'branchB', 'decisionIfA', 'decisionIfB'],
      properties: {
        factKey: { type: 'string' },
        affectedDecision: { type: 'string' },
        evidenceSpan: { type: 'string' },
        whyUnresolved: { type: 'string' },
        branchA: { type: 'string' },
        branchB: { type: 'string' },
        decisionIfA: { type: 'string' },
        decisionIfB: { type: 'string' },
        urgencyNomination: { type: ['string', 'null'] },
      },
    },
    question: { type: 'string' },
    affectedDecision: { type: 'string' },
  },
} as const;

/**
 * The successor admission vocabulary. Ancestor codes minus `NOMINATION_PRIORITY_NOT_A_MEMBER`
 * (B2: the field it validated does not exist in this contract), plus the successor members.
 * `FACT_IDENTITY_COLLISION` is declared now so the vocabulary is stable across the C handoff.
 */
export const SUCCESSOR_BINDING_ADMISSION_CODES = [
  'BINDING_MODE_NOT_A_MEMBER', 'BOUND_KEY_MISSING', 'BOUND_KEY_NOT_IN_CLOSED_SET',
  'BOUND_FACT_NOT_UNRESOLVED', 'BINDING_MODE_CARRIES_A_NOMINATION',
  'NOMINATION_MISSING_FOR_NOMINATED_MODE', 'NOMINATION_CARRIES_A_BOUND_KEY',
  'NOMINATION_FIELD_MISSING', 'NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM',
  'NOMINATION_BRANCHES_IDENTICAL', 'NOMINATION_DECISIONS_DO_NOT_DIVERGE',
  'NOMINATION_AFFECTED_DECISION_NOT_A_MEMBER',
  'NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT', 'MORE_THAN_ONE_NOMINATION',
  'DUPLICATE_DECLARATION_ID', 'TWO_DECLARATIONS_BIND_THE_SAME_FACT',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
  // ---- successor members
  'NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD',   // B1 / ABF-3
  'NOMINATION_CARRIES_PROVIDER_PRIORITY',       // B2 / Ruling 5
  'URGENCY_NOMINATION_NOT_A_MEMBER',            // B2
  'UNKNOWN_FIELD_AT_CLOSED_BOUNDARY',           // B4 / Ruling 4
  'FACT_IDENTITY_COLLISION',                    // Ruling 3 -- emitted by Agent C's widening
] as const;
export type SuccessorBindingAdmissionCode = (typeof SUCCESSOR_BINDING_ADMISSION_CODES)[number];

export interface SuccessorDeclarationAdmission {
  readonly declarationId: string;
  readonly admitted: boolean;
  readonly codes: readonly SuccessorBindingAdmissionCode[];
  readonly detail: readonly string[];
  /** B2: the non-authoritative urgency the nomination carried, preserved for observability only. */
  readonly urgencyNomination: string | null;
}

export interface SuccessorBindingCheckResult {
  readonly version: typeof SUCCESSOR_BINDING_CONTRACT_VERSION;
  readonly successorVersion: typeof SUCCESSOR_CONTRACT_VERSION;
  readonly perDeclaration: readonly SuccessorDeclarationAdmission[];
  readonly admitted: readonly SuccessorClarificationDeclaration[];
  readonly refused: readonly SuccessorClarificationDeclaration[];
  readonly boundFactKeys: readonly string[];
  readonly nominationCount: number;
  /** C1: every terminal-status identity collision this check refused, as structured evidence. */
  readonly collisionDiagnostics: readonly FactIdentityCollisionDiagnostic[];
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

const unknownKeys = (obj: object, closed: readonly string[]): string[] =>
  Object.keys(obj).filter(k => !closed.includes(k));

/**
 * B: the successor admission boundary. Refuses a declaration WHOLE on any violation, which leaves
 * every owed fact where it was -- the ancestor's rule, kept. Signature is THREE parameters: there
 * is no ceiling to widen (B3).
 */
export function checkBindingDeclarations203(
  declarations: readonly SuccessorClarificationDeclaration[],
  ledger: OwedFactLedger,
  observation: string,
): SuccessorBindingCheckResult {
  // B3 edit tripwire: §202's guard is exercised on EVERY call. If a future edit changes the
  // successor ceiling away from the frozen constant, every call fails before admitting anything.
  const ceiling = nominationCeilingViolations(SUCCESSOR_NOMINATION_CEILING);
  if (ceiling.length > 0) {
    throw new Error(`SUCCESSOR_NOMINATION_CEILING_EDITED -- ${ceiling[0].detail}`);
  }

  const perDeclaration: SuccessorDeclarationAdmission[] = [];
  const admitted: SuccessorClarificationDeclaration[] = [];
  const refused: SuccessorClarificationDeclaration[] = [];
  const collisionDiagnostics: FactIdentityCollisionDiagnostic[] = [];
  const seenIds = new Set<string>();
  const boundSoFar = new Set<string>();
  let nominationsSeen = 0;

  for (const d of declarations) {
    const codes: SuccessorBindingAdmissionCode[] = [];
    const detail: string[] = [];
    const fail = (c: SuccessorBindingAdmissionCode, why: string): void => {
      codes.push(c); detail.push(why);
    };
    let urgencyNomination: string | null = null;

    // ---- ancestor :137-142, copied: a provider may not return HazLenz-owned task state.
    for (const forbidden of PROVIDER_FORBIDDEN_OWED_FACT_FIELDS) {
      if (forbidden in (d as unknown as Record<string, unknown>)) {
        fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
          `declaration carried '${forbidden}', which only HazLenz may set`);
      }
    }
    // ---- B4: the declaration key set is closed at the runtime parse boundary.
    for (const k of unknownKeys(d as object, SUCCESSOR_DECLARATION_KEYS)) {
      fail('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY',
        `declaration carries unknown field '${k}'; the successor contract is closed`);
    }
    if (seenIds.has(d.declarationId)) {
      fail('DUPLICATE_DECLARATION_ID', `${d.declarationId} appears more than once`);
    }
    seenIds.add(d.declarationId);

    if (!(SUCCESSOR_BINDING_MODES as readonly string[]).includes(d.bindingMode)) {
      fail('BINDING_MODE_NOT_A_MEMBER', String(d.bindingMode));
    } else if (d.bindingMode === 'BOUND_TO_OWED_FACT') {
      // ---- ancestor :150-168, copied verbatim.
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
      // ---- ancestor :170-209, copied, with B1/B2/B3 divergences marked.
      if (!blank(d.coversFactKey)) {
        fail('NOMINATION_CARRIES_A_BOUND_KEY',
          'a nomination is additive and does not bind an existing key');
      }
      nominationsSeen += 1;
      if (nominationsSeen > SUCCESSOR_NOMINATION_CEILING) { // B3: constant, not a parameter
        fail('MORE_THAN_ONE_NOMINATION',
          `${nominationsSeen} nominations; the ceiling is ${SUCCESSOR_NOMINATION_CEILING}`);
      }
      const n = d.nomination;
      if (!n || typeof n !== 'object') {
        fail('NOMINATION_MISSING_FOR_NOMINATED_MODE', 'NOMINATED_NEW must carry its proof');
      } else {
        // ---- B1 / ABF-3: §202's scan over the nomination object, exercised here, at the
        // narrowest boundary that has the object. `priority` is routed, not exempted:
        const scan = nominationHazLenzOwnedFieldScan(d as unknown as Record<string, unknown>);
        for (const v of scan.violations) {
          fail('NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD', v.detail);
        }
        // ---- B2 / Ruling 5: the successor contract has no provider priority channel at all.
        // The scan's advisory (a member value) and a raw presence check (any value) both refuse.
        if (scan.providerAuthoredPriority !== null
            || 'priority' in (n as unknown as Record<string, unknown>)) {
          fail('NOMINATION_CARRIES_PROVIDER_PRIORITY',
            'the successor nomination contract carries no provider-authored priority; actual '
            + `priority is deterministically ${SUCCESSOR_NOMINATED_FACT_PRIORITY} and urgency, if `
            + 'preserved, travels only in the non-authoritative urgencyNomination field');
        }
        // ---- B4: the nomination key set is closed.
        for (const k of unknownKeys(n as object, SUCCESSOR_NOMINATION_KEYS)) {
          if (k === 'priority') continue; // already refused above under its own named code
          fail('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY',
            `nomination carries unknown field '${k}'; the successor contract is closed`);
        }
        // ---- B2: the non-authoritative urgency channel, vocabulary-checked and carried only.
        if (n.urgencyNomination !== undefined && n.urgencyNomination !== null) {
          if ((OWED_FACT_PRIORITIES as readonly string[]).includes(n.urgencyNomination)) {
            urgencyNomination = n.urgencyNomination;
          } else {
            fail('URGENCY_NOMINATION_NOT_A_MEMBER', String(n.urgencyNomination));
          }
        }
        // ---- ancestor :183-199, copied verbatim (minus the priority membership check, B2).
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
        // ================================================================ C1 (Ruling 3 / ABF-5)
        // The ancestor's UNRESOLVED refusal (:204-208) is preserved verbatim; the successor adds
        // the terminal-status branch that the ancestor admitted into a silent ledger no-op.
        const collision = !blank(n.factKey) ? factOf(ledger, n.factKey) : undefined;
        if (collision && collision.status === 'UNRESOLVED') {
          fail('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT',
            `${n.factKey} is already an unresolved owed fact; bind to it instead of nominating it`);
        } else if (collision) {
          const diag = detectTerminalIdentityCollision(ledger, n.factKey, {
            evidenceSpan: n.evidenceSpan, whyUnresolved: n.whyUnresolved,
          });
          // The detector re-derives from the same ledger, so it cannot disagree with `collision`;
          // fail closed loudly if it somehow does rather than admit on a contradiction.
          if (!diag) {
            throw new Error(`FACT_IDENTITY_COLLISION_DETECTOR_DISAGREES -- ${n.factKey}`);
          }
          collisionDiagnostics.push(diag);
          fail('FACT_IDENTITY_COLLISION',
            `${n.factKey} already names a ${collision.status} fact. Identity collision is an `
            + 'integrity condition: the existing terminal fact is preserved unchanged, this '
            + 'nomination is rejected, no key is synthesized, no question will be projected for '
            + 'it, and no semantic identity or distinctness is inferred');
        }
        // ================================================================ end C1
      }
    }

    const ok = codes.length === 0;
    perDeclaration.push({
      declarationId: d.declarationId, admitted: ok, codes, detail, urgencyNomination,
    });
    if (ok) {
      admitted.push(d);
      if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) boundSoFar.add(d.coversFactKey);
    } else {
      refused.push(d);
    }
  }

  return {
    version: SUCCESSOR_BINDING_CONTRACT_VERSION,
    successorVersion: SUCCESSOR_CONTRACT_VERSION,
    perDeclaration,
    admitted,
    refused,
    boundFactKeys: [...boundSoFar],
    nominationCount: admitted.filter(d => d.bindingMode === 'NOMINATED_NEW').length,
    collisionDiagnostics,
  };
}

export interface SuccessorApplyResult {
  readonly ledger: OwedFactLedger;
  /** Always empty on return: a non-empty set THROWS instead (B5). Present so the invariant is
   * visible in the result type rather than implied. */
  readonly nominationOutcomeViolations: readonly never[];
}

/**
 * B: the successor apply. Ancestor :329-361 copied, with two divergences: the nominated fact's
 * priority is the deterministic `SUCCESSOR_NOMINATED_FACT_PRIORITY` (B2 -- the ancestor wrote
 * `priority: n.priority` from the provider payload at :345), and the §202 G6 post-condition runs
 * before the ledger is returned (B5): an admitted nomination that produced no fact THROWS.
 *
 * The frozen import path is used for the binding transition, exactly as the ancestor: a nomination
 * ADDS its fact; a binding transitions EXACTLY its own key to COVERED.
 */
export function applyAdmittedDeclarations203(
  ledger: OwedFactLedger, check: SuccessorBindingCheckResult,
): SuccessorApplyResult {
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
        priority: SUCCESSOR_NOMINATED_FACT_PRIORITY, // B2: deterministic, never provider-authored
        acceptableEvidence: null,
      }));
    }
  }
  for (const d of check.admitted) {
    if (d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey) {
      // The transition itself stays on the FROZEN ledger module, keeping the copy surface at
      // exactly the two named functions.
      next = successorTransitionToCovered(next, d.coversFactKey, d.declarationId);
    }
  }

  // ---- B5: §202 G6, exercised on every apply. The guard reads only bindingMode,
  // nomination.factKey and declarationId off the check -- every one present and truthful on the
  // successor shape; the cast asserts structural sufficiency (no field value is invented) and the
  // suite proves the guard fires on successor-shaped input.
  const outcome = nominationOutcomeViolations(ledger, next, check as unknown as BindingCheckResult);
  if (outcome.length > 0) {
    throw new Error('ADMITTED_NOMINATION_PRODUCED_NO_FACT -- '
      + outcome.map(v => v.detail).join(' | '));
  }
  return { ledger: next, nominationOutcomeViolations: [] };
}

function successorTransitionToCovered(
  l: OwedFactLedger, factKey: string, declarationId: string,
): OwedFactLedger {
  return transition(l, {
    factKey,
    to: 'COVERED',
    authority: 'ADMITTED_BINDING',
    justification: `declaration ${declarationId} explicitly bound ${factKey}`,
  });
}

/** Asserted by the suite: this module decides nothing semantic and reaches nothing. */
export function successorBindingEffect(): {
  providerCalls: 0; databaseOperations: 0; modifiesFrozenBinding: false;
  providerMaySetPriority: false; urgencyNominationMapsToPriority: false;
  admittedNominationMayVanishSilently: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, modifiesFrozenBinding: false,
    providerMaySetPriority: false, urgencyNominationMapsToPriority: false,
    admittedNominationMayVanishSilently: false,
  };
}
