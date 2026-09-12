/**
 * §203 EXPERT HAZLENZ -- SUCCESSOR RECEIVING BOUNDARY FOR THE FIRST-PASS PROJECTION.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * Lineage: WRAPS `expert-first-pass-owed-fact-projection.ts` (FROZEN_BY_RECORDED_EVIDENCE, see
 * `ANCESTOR_PINS`). The frozen `projectDeclaredOwedFacts` is delegated to UNMODIFIED; this module
 * enforces, at the receiving boundary and before any frozen code runs, the three §202 category-A
 * guards whose unsafe values are wrapper-visible inputs:
 *
 *   ABF-1  `declaringStageViolations`             the stage decides OwedFact.source; a non-member
 *                                                 poisons every fact, so it rejects the WHOLE call
 *   ABF-2  `acceptableEvidenceProvenanceViolations` a held criterion whose provenance is not a
 *                                                 member of the closed set refuses the declaration
 *                                                 that would bind it
 *   ABF-7  `nestedForbiddenGovernanceFields`      the depth-8 recursive walk the canonical boundary
 *                                                 performs and the frozen projection does not
 *
 * The guards are IMPORTED from `expert-202-authority-boundary-guards.ts`, never reimplemented, so
 * they cannot drift from the contract they enforce.
 *
 * ==================== RECORDED SUCCESSOR-CONTRACT DIVERGENCES ====================
 *
 * These are part of the successor version identity (`SUCCESSOR_CONTRACT_VERSION`), recorded here
 * and pinned by regression tests in `test-203-boundary-guards.ts`. The frozen path's own behavior
 * is unchanged and remains reproducible byte-for-byte.
 *
 * D1 (ANCHOR ORDINALS -- Agent A's declared divergence). A declaration refused at this boundary
 *    never reaches the frozen function, so it never increments the frozen internal `anchorCounts`
 *    (`expert-first-pass-owed-fact-projection.ts:574-575`). Two declarations sharing an anchor
 *    where the first is boundary-refused therefore yield ordinal 1 for the second (successor),
 *    where §202's recorded in-place ABF-2 insertion would have yielded ordinal 2. Successor rule:
 *    IDENTITY IS COMPUTED OVER DECLARATIONS THAT SURVIVE THE SUCCESSOR RECEIVING BOUNDARY.
 *
 * D2 (CLOSED TOP-LEVEL KEY SET -- Ruling 4). The frozen projection admits a declaration carrying a
 *    benign unknown top-level key. The successor boundary refuses it
 *    (`UNKNOWN_FIELD_AT_CLOSED_BOUNDARY`): an unknown field must not survive parsing at a closed
 *    model-facing boundary, whether or not today's downstream code reads it. The closed key set is
 *    `SUCCESSOR_DECLARATION_KEYS`, exactly the wire contract's twelve fields.
 *
 * D3 (ABF-2 BREADTH). The frozen path reads only the FIRST bound governed id holding a criterion
 *    (`:599-611`). The successor pre-screen checks EVERY bound governed id's held criterion and
 *    refuses the declaration if ANY is provenance-invalid -- fail-closed is not order-dependent.
 */

import {
  type AuthorityBoundaryViolation,
  acceptableEvidenceProvenanceViolations,
  declaringStageViolations,
  nestedForbiddenGovernanceFields,
  suppliedCriteriaViolations,
} from './expert-202-authority-boundary-guards';
import {
  type ProjectionInput, type ProjectionResult,
  projectDeclaredOwedFacts,
} from './expert-first-pass-owed-fact-projection';
import { SUCCESSOR_CONTRACT_VERSION } from './expert-203-successor-identity';

/**
 * The successor wire contract's closed top-level key set: exactly the twelve fields of
 * `StructuredUnresolvedFactDeclaration`. Divergence D2: an unknown key refuses the declaration.
 */
export const SUCCESSOR_DECLARATION_KEYS = [
  'declarationId', 'missingFact', 'observationSourceId', 'observationSpan',
  'notEstablishedBecause', 'affectedDecision', 'branchA', 'decisionIfA', 'branchB', 'decisionIfB',
  'whyNecessaryNow', 'governedEvidenceSourceIds',
] as const;

/**
 * The model-facing schema for one successor declaration, Ruling-4 closed at the actual schema
 * boundary: `additionalProperties: false` is set on the object node itself, not promised in a
 * comment. Held as data so a suite (and Agent D) can assert closure on every object node.
 */
export const SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203 = {
  type: 'object',
  additionalProperties: false,
  required: [
    'declarationId', 'missingFact', 'observationSourceId', 'observationSpan',
    'notEstablishedBecause', 'affectedDecision', 'branchA', 'decisionIfA', 'branchB', 'decisionIfB',
    'whyNecessaryNow',
  ],
  properties: {
    declarationId: { type: 'string' },
    missingFact: { type: 'string' },
    observationSourceId: { type: 'string' },
    observationSpan: { type: 'string' },
    notEstablishedBecause: { type: 'string' },
    affectedDecision: { type: 'string' },
    branchA: { type: 'string' },
    decisionIfA: { type: 'string' },
    branchB: { type: 'string' },
    decisionIfB: { type: 'string' },
    whyNecessaryNow: { type: 'string' },
    governedEvidenceSourceIds: { type: 'array', items: { type: 'string' } },
  },
} as const;

/** Boundary refusal vocabulary. Closed, so a suite counts members rather than trusting a list. */
export const SUCCESSOR_PROJECTION_BOUNDARY_CODES = [
  'DECLARING_STAGE_NOT_A_MEMBER',
  'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER',
  'ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK',
  'NESTED_FORBIDDEN_GOVERNANCE_FIELD',
  'UNKNOWN_FIELD_AT_CLOSED_BOUNDARY',
] as const;
export type SuccessorProjectionBoundaryCode = (typeof SUCCESSOR_PROJECTION_BOUNDARY_CODES)[number];

export interface SuccessorBoundaryRefusal {
  /** Index in the supplied declarations array, so a refusal is addressable without an id. */
  readonly index: number;
  /** The declared id when one exists as a string; a refusal must still be reportable without it. */
  readonly declarationId: string | null;
  readonly codes: readonly SuccessorProjectionBoundaryCode[];
  /** Genuine §202 guard violations only. A successor-vocabulary refusal explains itself in detail. */
  readonly violations: readonly AuthorityBoundaryViolation[];
  readonly detail: readonly string[];
}

export interface SuccessorProjectionResult {
  readonly successorVersion: typeof SUCCESSOR_CONTRACT_VERSION;
  /**
   * STAGE_REJECTED: ABF-1 fired; NOTHING was delegated and no fact exists (`projection: null`).
   * DELEGATED: surviving declarations were passed to the UNMODIFIED frozen function.
   */
  readonly boundaryState: 'DELEGATED' | 'STAGE_REJECTED';
  readonly stageViolations: readonly AuthorityBoundaryViolation[];
  /** Declarations refused at this boundary. Refusal is per declaration and never silent. */
  readonly boundaryRefusals: readonly SuccessorBoundaryRefusal[];
  /**
   * ABF-2 over the WHOLE supplied criteria map, advisory: a provenance-invalid criterion bound by
   * no declaration refuses nothing (nothing would consume it) but is never silently unremarked.
   */
  readonly criteriaMapViolations: readonly AuthorityBoundaryViolation[];
  /** The frozen function's result over the surviving declarations. Null iff STAGE_REJECTED. */
  readonly projection: ProjectionResult | null;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The successor receiving boundary. Validates, then delegates to the UNMODIFIED frozen
 * `projectDeclaredOwedFacts`. Total and pure, like its ancestor.
 */
export function projectDeclaredOwedFacts203(input: ProjectionInput): SuccessorProjectionResult {
  // ---- ABF-1. The stage decides `OwedFact.source` for every fact this call would produce, so a
  // non-member rejects the whole call as an explicit structural state -- never a throw a caller can
  // forget to catch into a silent skip, and never delegation with a poisoned stage.
  const stageViolations = declaringStageViolations(input.stage);
  if (stageViolations.length > 0) {
    return {
      successorVersion: SUCCESSOR_CONTRACT_VERSION,
      boundaryState: 'STAGE_REJECTED',
      stageViolations,
      boundaryRefusals: [],
      criteriaMapViolations: suppliedCriteriaViolations(input.acceptableEvidenceBySourceId),
      projection: null,
    };
  }

  const criteria = input.acceptableEvidenceBySourceId ?? {};
  const boundaryRefusals: SuccessorBoundaryRefusal[] = [];
  const survivors: unknown[] = [];

  for (let index = 0; index < input.declarations.length; index += 1) {
    const raw = input.declarations[index];
    // A non-object declaration has no keys to screen; the frozen function already refuses it with
    // DECLARATION_NOT_AN_OBJECT, and that refusal must stay on the frozen path (divergence-free).
    if (!isPlainObject(raw)) { survivors.push(raw); continue; }

    const codes: SuccessorProjectionBoundaryCode[] = [];
    const violations: AuthorityBoundaryViolation[] = [];
    const detail: string[] = [];

    // ---- D2 / Ruling 4: the top-level key set is closed at the boundary.
    for (const key of Object.keys(raw)) {
      if (!(SUCCESSOR_DECLARATION_KEYS as readonly string[]).includes(key)) {
        codes.push('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY');
        detail.push(`declaration[${index}] carries unknown top-level field '${key}'; the successor `
          + 'contract is closed and an unknown field must not survive parsing');
      }
    }

    // ---- ABF-7: the recursive walk the canonical boundary performs and the frozen shallow scan
    // does not. Depth > 0 only, exactly as the guard documents.
    const nested = nestedForbiddenGovernanceFields(raw);
    if (nested.length > 0) {
      codes.push('NESTED_FORBIDDEN_GOVERNANCE_FIELD');
      violations.push(...nested);
    }

    // ---- ABF-2 (divergence D3: every bound governed id, not only the first with a criterion).
    if (Array.isArray(raw.governedEvidenceSourceIds)) {
      for (const gid of raw.governedEvidenceSourceIds) {
        if (typeof gid !== 'string') continue; // membership itself is the frozen function's refusal
        const criterionViolations =
          acceptableEvidenceProvenanceViolations(criteria[gid], `acceptableEvidence[${gid}]`);
        for (const v of criterionViolations) {
          codes.push(v.code === 'ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK'
            ? 'ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK'
            : 'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER');
          violations.push(v);
        }
      }
    }

    if (codes.length > 0) {
      const id = raw.declarationId;
      boundaryRefusals.push({
        index,
        declarationId: typeof id === 'string' ? id : null,
        codes: [...new Set(codes)],
        violations,
        detail,
      });
    } else {
      survivors.push(raw);
    }
  }

  // ---- Delegation to the UNMODIFIED frozen function, over survivors only (divergence D1).
  const projection = projectDeclaredOwedFacts({
    declarations: survivors,
    sources: input.sources,
    suppliedGovernedSourceIds: input.suppliedGovernedSourceIds,
    stage: input.stage,
    acceptableEvidenceBySourceId: input.acceptableEvidenceBySourceId,
  });

  return {
    successorVersion: SUCCESSOR_CONTRACT_VERSION,
    boundaryState: 'DELEGATED',
    stageViolations: [],
    boundaryRefusals,
    criteriaMapViolations: suppliedCriteriaViolations(input.acceptableEvidenceBySourceId),
    projection,
  };
}

/** Asserted by the suite: the successor boundary decides nothing semantic and reaches nothing. */
export function successorProjectionEffect(): {
  providerCalls: 0; databaseOperations: 0; modifiesFrozenProjection: false;
  factsMayBeSettled: false; prioritiesMayBeEscalated: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, modifiesFrozenProjection: false,
    factsMayBeSettled: false, prioritiesMayBeEscalated: false,
  };
}
