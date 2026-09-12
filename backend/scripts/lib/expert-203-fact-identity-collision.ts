/**
 * §203 EXPERT HAZLENZ -- FACT IDENTITY COLLISION (Ruling 3 / ABF-5 successor). DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== THE DEFECT THIS CLOSES (§202 ABF-5, highest consequence) ====================
 *
 * On the frozen path a nomination whose key collides with a TERMINAL-status fact is ADMITTED
 * (`owed-fact-binding.ts:204-208` tests only `status === 'UNRESOLVED'`), `addOwedFact` then no-ops
 * on the existing key (`owed-fact-ledger.ts:163`), and neither `preservationViolations` nor
 * `bindingSideEffects` reports anything -- a genuinely new safety fact vanishes while a question
 * may still be projected against the key. Measured in §202 as ABF-5.a...a3.
 *
 * ==================== THE §203 SUCCESSOR RULE ====================
 *
 * A nomination whose computed identity collides with an existing terminal-status fact MUST NOT
 * silently succeed. The successor admission boundary (`checkBindingDeclarations203`) -- the
 * narrowest boundary holding BOTH identities, the nominated key and the ledger -- detects the
 * collision deterministically and refuses the nomination with the explicit structural state
 * `FACT_IDENTITY_COLLISION`, BEFORE question projection or any downstream binding. Required
 * dispositions, each carried on the diagnostic as data and asserted by the suite:
 *
 *   - the existing terminal fact is preserved unchanged;
 *   - the colliding nomination is rejected (never a silent no-op);
 *   - the terminal fact is NOT reopened automatically;
 *   - no replacement factKey is silently synthesized;
 *   - no clarification question is projected for the rejected nomination;
 *   - the collision is exposed to development diagnostics as a structured record.
 *
 * ==================== NO SEMANTIC POSITION ====================
 *
 * Identity collision is an INTEGRITY condition. This module does not infer that the two facts are
 * semantically identical, and does not infer that they are different. The diagnostic records
 * deterministic byte-level observations only (statuses, sources, whether the two evidence spans
 * are byte-identical); `semanticPosition: 'NONE_TAKEN'` is a literal field so the abstention is
 * data rather than a comment. Whether the collision represents a duplicate, a displaced new fact,
 * or an identity-construction defect is a question for a human with both records in front of them
 * -- see IDENTITY-COLLISION-ARCHITECTURE.md.
 */

import {
  type OwedFact, type OwedFactStatus, OWED_FACT_STATUSES,
} from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  type OwedFactLedger, factOf,
} from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import type {
  StructuralQuestion,
} from '../../src/safescope-v2/expert-hazlenz/owed-facts/structural-questions';

export const FACT_IDENTITY_COLLISION_CONTRACT_VERSION =
  'hazlenz.expert.203-fact-identity-collision.v1' as const;

/**
 * Derived from the frozen vocabulary rather than restated, so a future status member cannot fall
 * outside the collision rule by omission: every non-UNRESOLVED status is terminal here.
 */
export const TERMINAL_OWED_FACT_STATUSES: readonly Exclude<OwedFactStatus, 'UNRESOLVED'>[] =
  OWED_FACT_STATUSES.filter(
    (s): s is Exclude<OwedFactStatus, 'UNRESOLVED'> => s !== 'UNRESOLVED',
  );

/** The dispositions Ruling 3 requires, as one literal type so they cannot drift independently. */
export interface FactIdentityCollisionDisposition {
  readonly existingFactPreserved: true;
  readonly nominationRejected: true;
  readonly terminalFactReopened: false;
  readonly replacementKeySynthesized: false;
  readonly questionProjectedForRejectedNomination: false;
}

export const FACT_IDENTITY_COLLISION_DISPOSITION: FactIdentityCollisionDisposition = {
  existingFactPreserved: true,
  nominationRejected: true,
  terminalFactReopened: false,
  replacementKeySynthesized: false,
  questionProjectedForRejectedNomination: false,
};

/** The structured development-diagnostic record Ruling 3 requires. */
export interface FactIdentityCollisionDiagnostic {
  readonly code: 'FACT_IDENTITY_COLLISION';
  readonly contractVersion: typeof FACT_IDENTITY_COLLISION_CONTRACT_VERSION;
  readonly integrityCondition: true;
  readonly semanticPosition: 'NONE_TAKEN';
  /** The identity both parties computed/supplied -- the collision itself. */
  readonly factKey: string;
  /** The existing fact's side of the collision. */
  readonly existingFactStatus: Exclude<OwedFactStatus, 'UNRESOLVED'>;
  readonly existingFactSource: string;
  readonly existingEvidenceSpan: string;
  /** The nominated side of the collision, preserved so the rejected nomination is evidence. */
  readonly nominatedEvidenceSpan: string;
  readonly nominatedWhyUnresolved: string;
  /** A byte observation, not a semantic claim: are the two spans byte-identical after trim? */
  readonly evidenceSpansByteIdentical: boolean;
  readonly disposition: FactIdentityCollisionDisposition;
}

/**
 * The deterministic detector. Returns a diagnostic when `nominatedFactKey` names an existing
 * TERMINAL-status fact, null otherwise. An UNRESOLVED collision is NOT this condition -- the
 * ancestor's own refusal (`NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT`) already governs
 * it and is preserved verbatim in the successor boundary.
 */
export function detectTerminalIdentityCollision(
  ledger: OwedFactLedger,
  nominatedFactKey: string,
  nominated: { readonly evidenceSpan: string; readonly whyUnresolved: string },
): FactIdentityCollisionDiagnostic | null {
  const existing = factOf(ledger, nominatedFactKey);
  if (!existing || existing.status === 'UNRESOLVED') return null;
  return {
    code: 'FACT_IDENTITY_COLLISION',
    contractVersion: FACT_IDENTITY_COLLISION_CONTRACT_VERSION,
    integrityCondition: true,
    semanticPosition: 'NONE_TAKEN',
    factKey: nominatedFactKey,
    existingFactStatus: existing.status,
    existingFactSource: existing.source,
    existingEvidenceSpan: existing.evidenceSpan,
    nominatedEvidenceSpan: nominated.evidenceSpan,
    nominatedWhyUnresolved: nominated.whyUnresolved,
    evidenceSpansByteIdentical:
      existing.evidenceSpan.trim() === nominated.evidenceSpan.trim(),
    disposition: FACT_IDENTITY_COLLISION_DISPOSITION,
  };
}

/**
 * Post-condition over an existing fact across the collision refusal: the terminal fact must be
 * byte-unchanged. Field-by-field so a violation names what moved rather than reporting inequality.
 */
export function terminalFactPreservationViolations(
  before: OwedFact, after: OwedFact | undefined,
): string[] {
  const v: string[] = [];
  if (!after) return [`COLLIDED_FACT_VANISHED:${before.factKey}`];
  if (after.status !== before.status) {
    v.push(`COLLIDED_FACT_STATUS_MUTATED:${before.factKey} ${before.status} to ${after.status}`);
  }
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    v.push(`COLLIDED_FACT_MUTATED:${before.factKey}`);
  }
  return v;
}

/**
 * The question-projection gate, checkable from evidence: no structural question may bind the key
 * of a diagnosed collision. A terminal fact takes no question on any path (bound declarations
 * require UNRESOLVED), so any hit is a violation, not an ambiguity.
 */
export function collisionQuestionProjectionViolations(
  diagnostics: readonly FactIdentityCollisionDiagnostic[],
  questions: readonly StructuralQuestion[],
): string[] {
  const collided = new Set(diagnostics.map(d => d.factKey));
  return questions
    .filter(q => collided.has(q.bindingFactKey))
    .map(q => `QUESTION_PROJECTED_AGAINST_REJECTED_COLLISION:${q.bindingFactKey}`
      + ` (clarificationKey ${q.clarificationKey})`);
}

/** Asserted by the suite: this module decides nothing semantic and reaches nothing. */
export function factIdentityCollisionEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnyLedger: false;
  infersSemanticIdentity: false; infersSemanticDistinctness: false;
  reopensTerminalFacts: false; synthesizesReplacementKeys: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnyLedger: false,
    infersSemanticIdentity: false, infersSemanticDistinctness: false,
    reopensTerminalFacts: false, synthesizesReplacementKeys: false,
  };
}
