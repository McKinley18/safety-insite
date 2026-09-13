/**
 * §205 EXPERT HAZLENZ -- RR-7: DECLARATION CONTRACT COMPLETENESS AND SAFETY-FACT PRESERVATION.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== THE DEFECT THIS ANSWERS (F8) ====================
 *
 * §204 row SF-05. The first pass CORRECTLY identified the decision-critical unresolved property --
 * whether opening the interlocked door actually stops hazardous motion. The product owner recorded
 * `A_FIRST_PASS_GAP_RECALL = CORRECT` and `B_FIRST_PASS_GAP_PRECISION = CORRECT` for exactly that
 * reason. The declaration then failed structural admission:
 *
 *     codes  : REQUIRED_FIELD_MISSING, REQUIRED_FIELD_MISSING
 *     detail : "decisionIfA is empty", "decisionIfB is empty"
 *     result : admittedFactKeys = []   -- ZERO admitted owed facts on the row
 *
 * The safety question did not become a bad fact. It became NO fact. The projection's per-declaration
 * refusal record existed, but nothing downstream of `ProjectionResult.facts` could see that a
 * genuine safety property had been identified and then lost, so the row's admitted safety state was
 * indistinguishable from a row with nothing to say.
 *
 * ==================== WHAT THIS MODULE DOES AND DOES NOT DO ====================
 *
 * IT DOES NOT INVENT DECISION SEMANTICS. A refused declaration stays refused, yields no `OwedFact`,
 * and is never repaired. `decisionIfA` was empty; it remains empty; no branch decision is composed,
 * inferred from `branchA`, copied from a sibling, or defaulted. That is the §196 rule
 * ("where required semantic content is absent it REFUSES the declaration") and §205 does not
 * weaken it -- weakening it would replace a visible loss with an invisible fabrication.
 *
 * IT PRESERVES THE IDENTIFICATION. The distinction this module exists to hold is:
 *
 *     SEMANTIC IDENTIFICATION        the model named an unresolved property   -- happened on SF-05
 *     STRUCTURAL CONTRACT ADMISSION  the declaration satisfied the contract   -- failed on SF-05
 *
 * These are different events and §204 proved they can diverge. A refusal of the second must not
 * erase the first. So a refused declaration that carried a semantic identification becomes an
 * explicit `UnresolvedSafetyFactRecord` in a state that is NOT admissible, NOT settleable, and NOT
 * closable -- visible precisely as "a safety property was identified here and its declaration is
 * structurally invalid".
 *
 * IT FAILS CLOSED. `safetyStateComplete` is false whenever any such record exists. A caller that
 * reads only `facts` and ignores this flag has the §204 behaviour; a caller that reads the flag
 * cannot mistake SF-05 for an empty row. The flag is the smallest state transition that satisfies
 * the requirement, which is why no new `OwedFactStatus` member is introduced: adding a status would
 * put a structurally invalid thing inside the settleable state machine, where `transition` and the
 * three `TRANSITION_AUTHORITIES` would then have to have an opinion about it. They must not.
 */

import {
  type DeclarationProjection, type ProjectionRefusalCode, type ProjectionResult,
  REQUIRED_DECLARATION_STRING_FIELDS,
} from './expert-first-pass-owed-fact-projection';

export const DECLARATION_PRESERVATION_205_VERSION =
  'hazlenz.expert.205.declaration-preservation.v1' as const;

/**
 * The field whose presence constitutes SEMANTIC IDENTIFICATION.
 *
 * `missingFact` is the unresolved property itself -- the one field whose content is the safety
 * question. A declaration carrying a non-blank `missingFact` has identified something even if every
 * other field is malformed. A declaration without one has identified nothing and is ordinary noise:
 * preserving it would dilute the signal this record exists to carry.
 */
export const SEMANTIC_IDENTIFICATION_FIELD = 'missingFact' as const;

/**
 * Refusal codes that mean "the contract was not satisfied", as distinct from codes that mean "the
 * provider attempted something it has no authority to attempt".
 *
 * The split matters. A declaration refused for `REQUIRED_FIELD_MISSING` is a well-intentioned
 * malformed declaration and its identification is worth preserving. A declaration refused for
 * `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD` or `PROHIBITED_REGULATORY_CITATION` is an authority
 * violation, and preserving its content would carry the violating material forward under a new
 * name. Authority violations are recorded as refusals and are NOT preserved as safety facts.
 */
export const CONTRACT_INCOMPLETENESS_CODES: readonly ProjectionRefusalCode[] = [
  'REQUIRED_FIELD_MISSING',
  'AFFECTED_DECISION_NOT_A_MEMBER',
  'EVIDENCE_SPAN_NOT_VERBATIM',
  'BRANCHES_IDENTICAL',
  'DECISIONS_DO_NOT_DIVERGE',
  // §210E R7. A filler branch or decision is a contract incompleteness, so the identified property
  // is PRESERVED and fails closed rather than being discarded with the empty shape.
  'NON_SEMANTIC_PLACEHOLDER_VALUE',
  'OBSERVATION_SOURCE_UNKNOWN',
  'COMPUTED_FACT_KEY_MALFORMED',
];

/** Refusal codes that are authority violations. Never preserved; recorded and contained. */
export const AUTHORITY_VIOLATION_CODES: readonly ProjectionRefusalCode[] = [
  'PROHIBITED_REGULATORY_CITATION',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
  'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ',
  'GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
];

export const PRESERVATION_DISPOSITIONS = [
  /** A semantic identification exists and its declaration is structurally invalid. Fail closed. */
  'PRESERVED_STRUCTURALLY_INVALID',
  /** Refused for an authority violation. Contained, not preserved, never carried forward. */
  'CONTAINED_AUTHORITY_VIOLATION',
  /** Refused with no semantic identification to preserve. Ordinary malformed output. */
  'NOTHING_TO_PRESERVE',
] as const;
export type PreservationDisposition = (typeof PRESERVATION_DISPOSITIONS)[number];

/**
 * One preserved record. NOT an `OwedFact` and deliberately not shaped like one -- it has no
 * `factKey`, no `priority`, no `status`, and no place in the ledger's state machine, because every
 * one of those would imply it can be settled. It cannot. It can only be repaired upstream or
 * remain visible.
 */
export interface UnresolvedSafetyFactRecord {
  readonly recordKind: 'STRUCTURALLY_INVALID_DECLARATION';
  readonly declarationId: string;
  /**
   * The identified property, VERBATIM from the declaration. This is the only semantic content the
   * record carries, and it is copied, never composed.
   */
  readonly identifiedProperty: string;
  /** Which contract fields were absent or blank. Names only -- no values are invented for them. */
  readonly absentRequiredFields: readonly string[];
  /** Fields that DID arrive, verbatim, so a reviewer can repair upstream without re-reading prose. */
  readonly presentFields: Readonly<Record<string, string>>;
  readonly refusalCodes: readonly ProjectionRefusalCode[];
  readonly refusalDetail: readonly string[];
  /** Literals, asserted by the suite. This record can never become a settled safety conclusion. */
  readonly admissible: false;
  readonly mayBeSettled: false;
  readonly mayCloseTheAnalysis: false;
  readonly requiresUpstreamRepair: true;
}

export interface DeclarationPreservationResult {
  readonly version: typeof DECLARATION_PRESERVATION_205_VERSION;
  /** The frozen projection's facts, untouched. This module adds nothing to them and removes none. */
  readonly facts: ProjectionResult['facts'];
  readonly preserved: readonly UnresolvedSafetyFactRecord[];
  readonly dispositions: readonly {
    readonly declarationId: string;
    readonly disposition: PreservationDisposition;
  }[];
  /**
   * FALSE whenever any semantic identification failed structural admission. The fail-closed signal.
   * A row where this is false has NOT told the whole truth through `facts` alone.
   */
  readonly safetyStateComplete: boolean;
  /**
   * The exact SF-05 signature: the row admitted nothing at all, yet a safety property was
   * identified. Counted separately because it is the total-loss case, not a partial one.
   */
  readonly totalLossOnThisRow: boolean;
}

const nonBlank = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

const intersects = (
  codes: readonly ProjectionRefusalCode[], set: readonly ProjectionRefusalCode[],
): boolean => codes.some(c => set.includes(c));

/**
 * Read the declaration a projection refused, WITHOUT re-validating it and without repairing it.
 *
 * The raw declaration is supplied alongside the projection because `DeclarationProjection` records
 * the refusal, not the input. Nothing here parses prose: every field read is a top-level string
 * copy, and a field that is not a non-blank string is reported as absent rather than defaulted.
 */
function readRefusedDeclaration(raw: unknown): {
  identifiedProperty: string | null;
  absentRequiredFields: string[];
  presentFields: Record<string, string>;
} {
  const absentRequiredFields: string[] = [];
  const presentFields: Record<string, string> = {};
  const obj: Record<string, unknown> =
    typeof raw === 'object' && raw !== null && !Array.isArray(raw)
      ? (raw as Record<string, unknown>) : {};

  for (const field of REQUIRED_DECLARATION_STRING_FIELDS) {
    const v = obj[field];
    if (nonBlank(v)) presentFields[field] = v.trim();
    else absentRequiredFields.push(field);
  }
  const identified = obj[SEMANTIC_IDENTIFICATION_FIELD];
  return {
    identifiedProperty: nonBlank(identified) ? identified.trim() : null,
    absentRequiredFields,
    presentFields,
  };
}

/**
 * RR-7. Given a completed projection and the declarations that produced it, preserve every semantic
 * identification whose declaration failed structural admission.
 *
 * Total and pure. Adds no fact, repairs no field, and changes no refusal.
 */
export function preserveIdentifiedSafetyFacts(
  projection: ProjectionResult,
  declarations: readonly unknown[],
): DeclarationPreservationResult {
  const preserved: UnresolvedSafetyFactRecord[] = [];
  const dispositions: { declarationId: string; disposition: PreservationDisposition }[] = [];

  for (let i = 0; i < projection.perDeclaration.length; i += 1) {
    const per: DeclarationProjection = projection.perDeclaration[i];
    if (per.admitted) continue;

    // An authority violation is contained, never preserved: carrying its content forward under a
    // new record name would be the containment failure with an extra step.
    if (intersects(per.codes, AUTHORITY_VIOLATION_CODES)) {
      dispositions.push({
        declarationId: per.declarationId, disposition: 'CONTAINED_AUTHORITY_VIOLATION',
      });
      continue;
    }

    const read = readRefusedDeclaration(declarations[i]);
    const contractIncomplete = intersects(per.codes, CONTRACT_INCOMPLETENESS_CODES);

    if (read.identifiedProperty === null || !contractIncomplete) {
      dispositions.push({ declarationId: per.declarationId, disposition: 'NOTHING_TO_PRESERVE' });
      continue;
    }

    preserved.push({
      recordKind: 'STRUCTURALLY_INVALID_DECLARATION',
      declarationId: per.declarationId,
      identifiedProperty: read.identifiedProperty,
      absentRequiredFields: read.absentRequiredFields,
      presentFields: read.presentFields,
      refusalCodes: per.codes,
      refusalDetail: per.detail,
      admissible: false,
      mayBeSettled: false,
      mayCloseTheAnalysis: false,
      requiresUpstreamRepair: true,
    });
    dispositions.push({
      declarationId: per.declarationId, disposition: 'PRESERVED_STRUCTURALLY_INVALID',
    });
  }

  return {
    version: DECLARATION_PRESERVATION_205_VERSION,
    facts: projection.facts,
    preserved,
    dispositions,
    safetyStateComplete: preserved.length === 0,
    totalLossOnThisRow: preserved.length > 0 && projection.facts.length === 0,
  };
}

/** Asserted by the suite as literals: RR-7 decides nothing semantic and reaches nothing. */
export function declarationPreservationEffect(): {
  providerCalls: 0; databaseOperations: 0;
  inventsDecisionSemantics: false; repairsRefusedDeclarations: false;
  producesOwedFacts: false; mayMarkAFactSettled: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    inventsDecisionSemantics: false, repairsRefusedDeclarations: false,
    producesOwedFacts: false, mayMarkAFactSettled: false,
  };
}
