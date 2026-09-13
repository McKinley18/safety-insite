/**
 * §201 EXPERT HAZLENZ -- OWED-PROPERTY REPRESENTATION OPTIONS. DEVELOPMENT PROTOTYPE ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== THE PROBLEM, STATED WITHOUT A PREFERENCE ====================
 *
 * The structured first-pass declaration carries `missingFact` -- THE OWED PROPERTY ITSELF, in one
 * phrase. `OwedFact` has no field for it. `projectDeclaredOwedFacts` therefore drops it, and
 * `projectOwedFact` -- the only owed-fact shape a verifier ever sees -- cannot carry what the
 * `OwedFact` does not hold. The property survives only IMPLICITLY, spread across `whyUnresolved`,
 * `branchA`, `branchB` and the two halves of `decisionDivergence`.
 *
 * §196 recorded this in `NON_PROJECTING_DECLARATION_FIELDS` and ESCALATED it rather than closing it.
 * §200's adjudication axis Q (`OWED_PROPERTY_LOSS_IMPACT`) exists to MEASURE the loss, and its
 * `mustNotInfluence` line says so in as many words: "MEASUREMENT ONLY. Does not authorise adding a
 * field or mutating the contract."
 *
 * ==================== WHAT THIS MODULE IS, AND WHAT IT IS NOT ====================
 *
 * It is five prototype representations, side by side, each buildable from a REAL declaration and the
 * REAL `OwedFact` today's production projection already produced, so every option can be tested
 * against the same requirements with the same inputs.
 *
 * It is NOT a recommendation. Axis Q carries 0 of 8 verdicts and §200's worksheet is
 * `PENDING_HUMAN_ADJUDICATION` at 0/152. Choosing a representation before the loss is measured would
 * be the evaluated component answering its own open question. `OWED_PROPERTY_RECOMMENDATION` below
 * is the literal string `NOT_MADE`, and there is no code path that produces any other value.
 *
 * ==================== THE ONE RULE, INHERITED FROM §196 ====================
 *
 *      THE MODEL AUTHORS THE PROPERTY. THIS FILE COPIES IT VERBATIM OR REFUSES.
 *
 * `attachOwedProperty` reads exactly one declaration field. Where that field is absent, blank or not
 * a string it returns a REFUSAL. It never falls back to `notEstablishedBecause`, never joins two
 * branches into a phrase, never derives a property from `affectedDecision`, and never emits a
 * synthetic stand-in. Composition is invention, and the whole owed-fact layer exists not to invent.
 */

import { createHash } from 'crypto';
import type { OwedFact } from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import type {
  DeclaringStage, StructuredUnresolvedFactDeclaration,
} from './expert-first-pass-owed-fact-projection';

export const OWED_PROPERTY_REPRESENTATION_VERSION =
  'hazlenz.expert.201.owed-property-representation.prototype.v1' as const;

/**
 * THE STATED NON-RECOMMENDATION, as a literal type.
 *
 * §200 axis Q is the instrument that measures whether the omission costs anything, and it is
 * unadjudicated. A prototype that quietly ranked its own options would supply the answer the
 * instrument exists to obtain.
 */
export const OWED_PROPERTY_RECOMMENDATION: 'NOT_MADE' = 'NOT_MADE';

export const RECOMMENDATION_WITHHELD_BECAUSE: readonly string[] = [
  'the §200 adjudication axis Q (OWED_PROPERTY_LOSS_IMPACT) carries null for all 8 §199 facts',
  'the §200 worksheet status is PENDING_HUMAN_ADJUDICATION at 0/152 verdicts supplied',
  'axis Q\'s own mustNotInfluence line states it is MEASUREMENT ONLY and does not authorise adding '
    + 'a field or mutating the contract',
  'the product owner supplies every semantic judgement; a representation choice made before the '
    + 'loss is measured would prejudge it',
];

// ---------------------------------------------------------------- the options

export const REPRESENTATION_OPTIONS = [
  'O1_UNCHANGED',
  'O2_OWED_PROPERTY_FIELD',
  'O3_UNRESOLVED_TARGET_OBJECT',
  'O4_DECLARATION_REFERENCE_SIDECAR',
  'O5_ADDITIVE_SUCCESSOR_TYPE',
] as const;
export type RepresentationOption = (typeof REPRESENTATION_OPTIONS)[number];

/**
 * The requirements every option is tested against. Stated as data so the suite iterates them rather
 * than trusting a prose list.
 */
export const REPRESENTATION_REQUIREMENTS = [
  'R1_PRESERVES_FACT_KEY_IDENTITY',
  'R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION',
  'R3_NO_DETERMINISTIC_INVENTION',
  'R4_BACKWARD_COMPATIBILITY',
  'R5_NO_PROVIDER_SETTLEMENT_AUTHORITY',
  'R6_NO_PRODUCTION_ACTIVATION',
] as const;
export type RequirementId = (typeof REPRESENTATION_REQUIREMENTS)[number];

/**
 * A STRUCTURAL outcome, never a semantic verdict. These say what the type system and the
 * deterministic checks establish about a representation -- not whether any §199 fact was harmed.
 */
export type RequirementOutcome =
  | 'MET_BY_CONSTRUCTION'
  | 'MET'
  | 'MET_ONLY_UNDER_A_STATED_CONDITION'
  | 'NOT_APPLICABLE'
  | 'NOT_MET';

export const DOWNSTREAM_CONSUMERS = [
  'projectOwedFact',
  'owedFactDefects',
  'createOwedFactLedger',
  'preservationViolations',
  'structuralQuestions',
  'owedFactObservability',
  'settlementReview',
  'provenanceTableCaseB3',
] as const;
export type DownstreamConsumer = (typeof DOWNSTREAM_CONSUMERS)[number];

// ---------------------------------------------------------------- the copy-or-refuse boundary

export const OWED_PROPERTY_REFUSAL_CODES = [
  'OWED_PROPERTY_FIELD_ABSENT',
  'OWED_PROPERTY_NOT_A_STRING',
  'OWED_PROPERTY_BLANK',
] as const;
export type OwedPropertyRefusalCode = (typeof OWED_PROPERTY_REFUSAL_CODES)[number];

/**
 * Fields this module will NEVER read to manufacture an owed property. Exported so the suite can
 * feed a declaration that is rich in every one of them, blank in `missingFact`, and prove the result
 * is a refusal rather than a composition.
 */
export const NEVER_COMPOSED_FROM: readonly string[] = [
  'notEstablishedBecause', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
  'observationSpan', 'whyNecessaryNow', 'affectedDecision', 'governedEvidenceSourceIds',
];

/** The single declaration field the owed property may come from. There is no second source. */
export const OWED_PROPERTY_SOURCE_FIELD = 'missingFact' as const;

export type OwedPropertyAttachment =
  | { readonly ok: true; readonly owedProperty: string }
  | { readonly ok: false; readonly code: OwedPropertyRefusalCode; readonly detail: string };

/**
 * Copy the owed property, or refuse.
 *
 * Total, pure and single-source: it reads `declaration.missingFact` and nothing else. Whitespace
 * trimming is the only transformation, which is the same allowance `evidenceSpan` already has in
 * `OWED_FACT_FIELD_PROVENANCE`. A refusal detail names the field and the code -- never any other
 * field's text -- so a refusal cannot leak a composed sentence back to a caller.
 */
export function attachOwedProperty(
  declaration: Partial<StructuredUnresolvedFactDeclaration> | Record<string, unknown>,
): OwedPropertyAttachment {
  const raw = (declaration as Record<string, unknown>)[OWED_PROPERTY_SOURCE_FIELD];
  if (raw === undefined || raw === null) {
    return {
      ok: false,
      code: 'OWED_PROPERTY_FIELD_ABSENT',
      detail: `the declaration carries no ${OWED_PROPERTY_SOURCE_FIELD}; nothing is composed from `
        + `the ${NEVER_COMPOSED_FROM.length} other declaration fields`,
    };
  }
  if (typeof raw !== 'string') {
    return {
      ok: false,
      code: 'OWED_PROPERTY_NOT_A_STRING',
      detail: `${OWED_PROPERTY_SOURCE_FIELD} is ${Array.isArray(raw) ? 'an array' : typeof raw}`,
    };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      code: 'OWED_PROPERTY_BLANK',
      detail: `${OWED_PROPERTY_SOURCE_FIELD} is blank; a blank property is refused, never filled`,
    };
  }
  return { ok: true, owedProperty: trimmed };
}

// ---------------------------------------------------------------- O2: a dedicated field

/**
 * OPTION 2. `OwedFact` gains `owedProperty: string`, REQUIRED.
 *
 * Required is the interesting half. A required field says every owed fact names its property, which
 * is the strongest form of the guarantee -- and it is also what makes the migration expensive: every
 * `OwedFact` literal in the repository, including the §184 human-truth fixtures and the settled
 * control rows, stops compiling until it is given a value, and there is no value to give a
 * DETERMINISTIC or GOVERNED_EVIDENCE fact that was never declared by a model.
 */
export interface O2OwedFact extends OwedFact {
  /** Verbatim `declaration.missingFact`. Never composed. */
  readonly owedProperty: string;
}

export function buildO2(base: OwedFact, owedProperty: string): O2OwedFact {
  return { ...base, owedProperty };
}

// ---------------------------------------------------------------- O3: a structured target

/**
 * OPTION 3. `OwedFact` gains `unresolvedTarget: UnresolvedTarget | null`.
 *
 * The object carries the property AND the fact that it was copied rather than assembled. `composed`
 * is typed as the literal `false` for the same reason `ArbitrationRequest.settles` is: a caller
 * cannot read it as anything else, and a future edit that wants to set it true has to change a type.
 */
export interface UnresolvedTarget {
  /** Verbatim `declaration.missingFact`. */
  readonly property: string;
  /** Which declaration field it came from. One value exists. */
  readonly declarationField: typeof OWED_PROPERTY_SOURCE_FIELD;
  /** Which stage authored it. Mirrors `OwedFact.source`; never a settlement authority. */
  readonly authoredBy: DeclaringStage;
  /** Typed `false` so no code path can claim the property was assembled here. */
  readonly composed: false;
}

export interface O3OwedFact extends OwedFact {
  readonly unresolvedTarget: UnresolvedTarget | null;
}

export function buildO3(
  base: OwedFact, owedProperty: string, authoredBy: DeclaringStage,
): O3OwedFact {
  return {
    ...base,
    unresolvedTarget: {
      property: owedProperty,
      declarationField: OWED_PROPERTY_SOURCE_FIELD,
      authoredBy,
      composed: false,
    },
  };
}

/** A fact with no declaration behind it carries null, not an invented target. */
export function buildO3WithoutTarget(base: OwedFact): O3OwedFact {
  return { ...base, unresolvedTarget: null };
}

// ---------------------------------------------------------------- O4: reference the declaration

/**
 * OPTION 4. `OwedFact` is untouched. The declaration is retained whole, immutably, addressed by the
 * computed `factKey`, and anything that wants the property looks it up.
 *
 * This is the option in which the property is stored exactly once, in the artefact that authored it,
 * and the `OwedFact` remains what §170 made it: the object that carries what HazLenz DECIDES. The
 * cost is that the property is no longer reachable from an `OwedFact` alone -- every consumer that
 * wants it must be handed the sidecar too, and a consumer given only the fact silently sees today's
 * behaviour rather than failing.
 */
export interface RetainedDeclarationRecord {
  readonly factKey: string;
  readonly declarationId: string;
  /** Verbatim `declaration.missingFact`. */
  readonly missingFact: string;
  readonly observationSourceId: string;
  readonly whyNecessaryNow: string;
  readonly governedEvidenceSourceIds: readonly string[];
  readonly stage: DeclaringStage;
  /** Typed `true`: the record is the declaration, not a summary of it. */
  readonly capturedVerbatim: true;
}

export type DeclarationSidecar = Readonly<Record<string, RetainedDeclarationRecord>>;

export function buildDeclarationRecord(args: {
  factKey: string;
  declaration: StructuredUnresolvedFactDeclaration;
  stage: DeclaringStage;
  owedProperty: string;
}): RetainedDeclarationRecord {
  return {
    factKey: args.factKey,
    declarationId: args.declaration.declarationId,
    missingFact: args.owedProperty,
    observationSourceId: args.declaration.observationSourceId,
    whyNecessaryNow: args.declaration.whyNecessaryNow,
    governedEvidenceSourceIds: [...(args.declaration.governedEvidenceSourceIds ?? [])],
    stage: args.stage,
    capturedVerbatim: true,
  };
}

/**
 * Add one record. Additive and refusing: an existing key is never overwritten, because a sidecar
 * that can be rewritten is a sidecar that can lose the declaration it exists to preserve.
 */
export function addToSidecar(
  sidecar: DeclarationSidecar, record: RetainedDeclarationRecord,
): DeclarationSidecar {
  if (Object.prototype.hasOwnProperty.call(sidecar, record.factKey)) {
    throw new Error(`SIDECAR_KEY_ALREADY_PRESENT -- ${record.factKey}; the retained declaration `
      + 'record is append-only and is never replaced');
  }
  return Object.freeze({ ...sidecar, [record.factKey]: record });
}

/** Look up the property for a fact. `null` where no declaration was retained; never a stand-in. */
export function owedPropertyFromSidecar(
  sidecar: DeclarationSidecar, factKey: string,
): string | null {
  const r = sidecar[factKey];
  return r === undefined ? null : r.missingFact;
}

// ---------------------------------------------------------------- O5: an additive successor type

/**
 * OPTION 5. The minimally invasive one: `owed-fact.types.ts` is NOT TOUCHED AT ALL, and a SUCCESSOR
 * type declared in a separate module widens it.
 *
 * This is the repository's established discipline elsewhere -- v3 -> v3.1 -> v3.2 -> v3.3, v15 ->
 * vNext, and the §201 ownership map's own resolution for the circuit breaker: "build an additive
 * successor module rather than mutate either file, [which] keeps §198's 89/89 and §199's evidence
 * attached to the module hashes that produced them."
 *
 * `owedProperty` is `string | null` because a successor that widens must accept every existing fact,
 * and a DETERMINISTIC or GOVERNED_EVIDENCE fact has no declared property. Null is the truthful value
 * and it must stay valid, exactly as `acceptableEvidence: null` does.
 */
export interface OwedFactV2 extends OwedFact {
  /** Verbatim `declaration.missingFact`, or null where no declaration authored one. */
  readonly owedProperty: string | null;
}

export function widenToV2(base: OwedFact, owedProperty: string | null): OwedFactV2 {
  return { ...base, owedProperty };
}

/** Narrow a successor back to the pinned contract shape, byte-for-byte. */
export function narrowToV1(f: OwedFactV2): OwedFact {
  const { owedProperty, ...rest } = f;
  void owedProperty;
  return rest;
}

// ---------------------------------------------------------------- projection variants

/**
 * The verifier-visible shape under each option.
 *
 * O1 is EXACTLY the seven fields `projectOwedFact` returns today plus `acceptableEvidence`; the
 * suite asserts byte-equality against the production function rather than describing it.
 */
export interface ProjectedUnderOption {
  readonly option: RepresentationOption;
  readonly factKey: string;
  readonly affectedDecision: string;
  readonly whyUnresolved: string | null;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionDivergence: { readonly ifA: string; readonly ifB: string };
  readonly evidenceSpan: string;
  /**
   * The owed property as the verifier would see it. `null` under O1 -- which is the omission, stated
   * as a value rather than as an absent key, so a reader can tell "not carried" from "not declared".
   */
  readonly owedProperty: string | null;
  /** True only where the option puts the property on the wire. */
  readonly owedPropertyReachesTheVerifier: boolean;
}

const baseProjection = (f: OwedFact): Omit<ProjectedUnderOption,
'option' | 'owedProperty' | 'owedPropertyReachesTheVerifier'> => ({
  factKey: f.factKey,
  affectedDecision: f.affectedDecision,
  whyUnresolved: f.whyUnresolved,
  branchA: f.branchA,
  branchB: f.branchB,
  decisionDivergence: { ifA: f.decisionDivergence.ifA, ifB: f.decisionDivergence.ifB },
  evidenceSpan: f.evidenceSpan,
});

export function projectUnderO1(f: OwedFact): ProjectedUnderOption {
  return {
    option: 'O1_UNCHANGED', ...baseProjection(f),
    owedProperty: null, owedPropertyReachesTheVerifier: false,
  };
}

export function projectUnderO2(f: O2OwedFact): ProjectedUnderOption {
  return {
    option: 'O2_OWED_PROPERTY_FIELD', ...baseProjection(f),
    owedProperty: f.owedProperty, owedPropertyReachesTheVerifier: true,
  };
}

export function projectUnderO3(f: O3OwedFact): ProjectedUnderOption {
  return {
    option: 'O3_UNRESOLVED_TARGET_OBJECT', ...baseProjection(f),
    owedProperty: f.unresolvedTarget === null ? null : f.unresolvedTarget.property,
    owedPropertyReachesTheVerifier: f.unresolvedTarget !== null,
  };
}

/**
 * O4 needs the sidecar as a SECOND argument, and that is the whole architectural point of the
 * option: a call site holding only an `OwedFact` cannot reach the property, and gets today's
 * behaviour rather than an error.
 */
export function projectUnderO4(f: OwedFact, sidecar: DeclarationSidecar): ProjectedUnderOption {
  const p = owedPropertyFromSidecar(sidecar, f.factKey);
  return {
    option: 'O4_DECLARATION_REFERENCE_SIDECAR', ...baseProjection(f),
    owedProperty: p, owedPropertyReachesTheVerifier: p !== null,
  };
}

export function projectUnderO5(f: OwedFactV2): ProjectedUnderOption {
  return {
    option: 'O5_ADDITIVE_SUCCESSOR_TYPE', ...baseProjection(f),
    owedProperty: f.owedProperty, owedPropertyReachesTheVerifier: f.owedProperty !== null,
  };
}

// ---------------------------------------------------------------- the assessment table, as data

export interface OptionAssessment {
  readonly option: RepresentationOption;
  readonly summary: string;
  readonly fieldsAddedToOwedFact: readonly string[];
  readonly mutatesPinnedContractFile: boolean;
  readonly section187HashConsequence: string;
  readonly migrationBurden: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly downstream: Readonly<Record<DownstreamConsumer, string>>;
  readonly requirements: Readonly<Record<RequirementId, RequirementOutcome>>;
  /** The honest cost. Never empty: every option costs something. */
  readonly residual: readonly string[];
}

/** The file whose sha256 §187 pins, and the pinned value, recorded so a test can recompute it. */
export const PINNED_CONTRACT_FILE =
  'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts' as const;
export const SECTION_187_PINNED_SHA256 =
  '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a' as const;

/**
 * The verification scripts that assert `PINNED_CONTRACT_FILE`'s sha256 against §187's
 * `owedFactSourceHashes`. Counted from the repository, not remembered.
 */
export const SECTION_187_PIN_ASSERTING_SCRIPTS: readonly string[] = [
  'backend/scripts/verify-188-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-190-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-191-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-192-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-193-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-194-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-195-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-196-source-integrity-2026-09-06.ts',
  'backend/scripts/verify-197-source-integrity-2026-09-07.ts',
  'backend/scripts/verify-198-source-integrity-2026-09-07.ts',
  'backend/scripts/verify-199-source-integrity-2026-09-07.ts',
];

/**
 * THE PRECEDENT, recorded because it changes what "breaks the pin" actually means.
 *
 * §185 changed `owed-fact.types.ts` under explicit authorization. §182's pin
 * (`f77c7febb55a056271174c4efd4375506145344bd0748e5d56f93c698074c1d1`, asserted at P20c of
 * `test-settlement-review-integration-2026-09-05.ts`) has not matched since, and §186 classified
 * that as `EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE` with
 * `actionTaken: NONE. Not relaxed, not refreshed, not rewritten.`
 *
 * So the repository already has a settled answer for what happens to a historical pin when the
 * contract legitimately moves. What it does NOT have is an answer for the ELEVEN CURRENTLY-LIVE
 * §187 assertions above, which are not historical: they are re-run.
 */
export const HISTORICAL_PIN_DIVERGENCE_PRECEDENT = {
  section: 186,
  classification: 'EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE',
  artifact: 'verification/expert-hazlenz-settled-fact-projection-review-2026-09-05/'
    + 'HISTORICAL-PIN-CLASSIFICATION.json',
  divergedPin: 'f77c7febb55a056271174c4efd4375506145344bd0748e5d56f93c698074c1d1',
  actionTaken: 'NONE. Not relaxed, not refreshed, not rewritten.',
  whatItDoesNotSettle: 'the eleven live §187 source-integrity assertions, which are re-executed '
    + 'rather than archived, and one §196 suite case (B3) that asserts the provenance table covers '
    + 'the projected OwedFact keys EXACTLY',
} as const;

export const OPTION_ASSESSMENTS: readonly OptionAssessment[] = [
  {
    option: 'O1_UNCHANGED',
    summary: 'Leave OwedFact as it is. `missingFact` stays on the declaration record and never '
      + 'reaches a fact, a projection or a verifier.',
    fieldsAddedToOwedFact: [],
    mutatesPinnedContractFile: false,
    section187HashConsequence: 'NONE. The sha256 stays 102d059b…; all eleven live assertions and '
      + 'every archived §184/§192 evidence attachment continue to hold unchanged.',
    migrationBurden: 'NONE',
    downstream: {
      projectOwedFact: 'unchanged',
      owedFactDefects: 'unchanged',
      createOwedFactLedger: 'unchanged',
      preservationViolations: 'unchanged',
      structuralQuestions: 'unchanged',
      owedFactObservability: 'unchanged — the declaration is already reconstructable from the '
        + 'persisted first-pass record, though not from an OwedFact',
      settlementReview: 'unchanged',
      provenanceTableCaseB3: 'unchanged — the table already covers the projected OwedFact exactly',
    },
    requirements: {
      R1_PRESERVES_FACT_KEY_IDENTITY: 'MET_BY_CONSTRUCTION',
      R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION: 'MET_BY_CONSTRUCTION',
      R3_NO_DETERMINISTIC_INVENTION: 'MET_BY_CONSTRUCTION',
      R4_BACKWARD_COMPATIBILITY: 'MET_BY_CONSTRUCTION',
      R5_NO_PROVIDER_SETTLEMENT_AUTHORITY: 'MET_BY_CONSTRUCTION',
      R6_NO_PRODUCTION_ACTIVATION: 'MET_BY_CONSTRUCTION',
    },
    residual: [
      'the verifier never sees the phrase the first pass wrote to name the gap',
      'a human reviewing an OwedFact alone must reconstruct the property from five other fields',
      'the loss is what §200 axis Q was built to measure, and axis Q is unadjudicated',
    ],
  },
  {
    option: 'O2_OWED_PROPERTY_FIELD',
    summary: 'Add `owedProperty: string` to OwedFact, required on every fact.',
    fieldsAddedToOwedFact: ['owedProperty'],
    mutatesPinnedContractFile: true,
    section187HashConsequence: 'BREAKS THE PIN. The sha256 changes and all eleven live §187 '
      + 'assertions fail until §187\'s owedFactSourceHashes is re-preregistered under a new '
      + 'authorization. §186\'s precedent covers ARCHIVED pins, not live ones.',
    migrationBurden: 'HIGH',
    downstream: {
      projectOwedFact: 'must add the field, or deliberately withhold it — a choice that has to be '
        + 'argued, since PROJECTION_FORBIDDEN_FIELDS exists to keep grading state off the wire and '
        + 'owedProperty is not grading state',
      owedFactDefects: 'must decide whether a blank owedProperty is a defect; a required field '
        + 'with no validation rule is the shape §170 warns about',
      createOwedFactLedger: 'unchanged in mechanism; every existing construction site must supply '
        + 'the field',
      preservationViolations: 'should arguably add owedProperty to FACT_IDENTITY_MUTATED, since a '
        + 'silently edited property is exactly the displacement the ledger exists to prevent',
      structuralQuestions: 'unchanged — it reads priority and factKey only',
      owedFactObservability: 'RECONSTRUCTABLE_FACTS gains an obligation; initialOwedFacts already '
        + 'carries whole facts so the record widens automatically',
      settlementReview: 'unchanged in mechanism; it reads status and acceptableEvidence, not the '
        + 'property. NEVER_PROJECTED_TO_PROVIDER must be re-checked so a review decision cannot '
        + 'travel beside the new field',
      provenanceTableCaseB3: 'FAILS until OWED_FACT_FIELD_PROVENANCE gains a row — which is the '
        + 'gate working as designed, not a defect',
    },
    requirements: {
      R1_PRESERVES_FACT_KEY_IDENTITY: 'MET',
      R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION: 'MET_ONLY_UNDER_A_STATED_CONDITION',
      R3_NO_DETERMINISTIC_INVENTION: 'MET_ONLY_UNDER_A_STATED_CONDITION',
      R4_BACKWARD_COMPATIBILITY: 'NOT_MET',
      R5_NO_PROVIDER_SETTLEMENT_AUTHORITY: 'MET',
      R6_NO_PRODUCTION_ACTIVATION: 'MET',
    },
    residual: [
      'REQUIRED is the problem: a DETERMINISTIC or GOVERNED_EVIDENCE fact never had a declared '
        + 'property, so the field would have to be filled with something, and the only honest '
        + 'something is a value the type forbids',
      'every existing OwedFact literal — §184 human-truth fixtures and settled control rows '
        + 'included — stops compiling until given a value',
      'R3 holds only while the field is populated by attachOwedProperty or refused; a call site '
        + 'that composes one satisfies the type and breaks the rule',
    ],
  },
  {
    option: 'O3_UNRESOLVED_TARGET_OBJECT',
    summary: 'Add `unresolvedTarget: UnresolvedTarget | null` to OwedFact: the property plus the '
      + 'declaration field it came from, who authored it, and `composed: false`.',
    fieldsAddedToOwedFact: ['unresolvedTarget'],
    mutatesPinnedContractFile: true,
    section187HashConsequence: 'BREAKS THE PIN, identically to O2. Eleven live assertions fail '
      + 'until §187 is re-preregistered.',
    migrationBurden: 'MEDIUM',
    downstream: {
      projectOwedFact: 'must decide what to project — the property alone, or the object. Projecting '
        + '`authoredBy` would tell a verifier which stage wrote the fact, which is precisely what '
        + 'the existing comment on `provenance` says not to do',
      owedFactDefects: 'gains a rule mirroring acceptableEvidence: non-null must carry a non-blank '
        + 'property',
      createOwedFactLedger: 'unchanged; nullable means existing construction sites still compile',
      preservationViolations: 'should add the object to the mutation check, as acceptableEvidence '
        + 'already is',
      structuralQuestions: 'unchanged',
      owedFactObservability: 'widens automatically with initialOwedFacts',
      settlementReview: 'unchanged in mechanism; the same NEVER_PROJECTED_TO_PROVIDER re-check '
        + 'applies, and more so, because the object is larger',
      provenanceTableCaseB3: 'FAILS until a row is added',
    },
    requirements: {
      R1_PRESERVES_FACT_KEY_IDENTITY: 'MET',
      R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION: 'MET_ONLY_UNDER_A_STATED_CONDITION',
      R3_NO_DETERMINISTIC_INVENTION: 'MET',
      R4_BACKWARD_COMPATIBILITY: 'MET_ONLY_UNDER_A_STATED_CONDITION',
      R5_NO_PROVIDER_SETTLEMENT_AUTHORITY: 'MET',
      R6_NO_PRODUCTION_ACTIVATION: 'MET',
    },
    residual: [
      '`authoredBy` restates OwedFact.source, and `declarationField` has exactly one legal value — '
        + 'two of the four members carry no information a reader could not already obtain',
      'nullable keeps existing literals compiling, but a nullable field is one a call site can '
        + 'forget; the §196 projection would have to be the only thing that populates it',
      'a richer object is a larger surface for a later edit to add a decision-bearing member to',
    ],
  },
  {
    option: 'O4_DECLARATION_REFERENCE_SIDECAR',
    summary: 'OwedFact untouched. The declaration is retained verbatim, immutably, keyed by the '
      + 'computed factKey, and consumers that want the property look it up.',
    fieldsAddedToOwedFact: [],
    mutatesPinnedContractFile: false,
    section187HashConsequence: 'NONE. The sha256 stays 102d059b… and all eleven live assertions '
      + 'hold. The sidecar is a new, unpinned module.',
    migrationBurden: 'LOW',
    downstream: {
      projectOwedFact: 'unchanged; a NEW two-argument projection is needed for any call site that '
        + 'should see the property',
      owedFactDefects: 'unchanged',
      createOwedFactLedger: 'unchanged',
      preservationViolations: 'unchanged for facts; the sidecar needs its own append-only proof, '
        + 'which addToSidecar enforces by refusing to overwrite a key',
      structuralQuestions: 'unchanged',
      owedFactObservability: 'the sidecar must be persisted alongside the record or the property is '
        + 'unreconstructable from evidence — a real obligation, not a formality',
      settlementReview: 'unchanged; it never sees the sidecar and never needs to',
      provenanceTableCaseB3: 'unchanged and still passes; the table covers OwedFact, which has not '
        + 'moved',
    },
    requirements: {
      R1_PRESERVES_FACT_KEY_IDENTITY: 'MET_BY_CONSTRUCTION',
      R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION: 'MET_BY_CONSTRUCTION',
      R3_NO_DETERMINISTIC_INVENTION: 'MET',
      R4_BACKWARD_COMPATIBILITY: 'MET_BY_CONSTRUCTION',
      R5_NO_PROVIDER_SETTLEMENT_AUTHORITY: 'MET',
      R6_NO_PRODUCTION_ACTIVATION: 'MET',
    },
    residual: [
      'THE FAILURE MODE IS SILENCE: a consumer handed only an OwedFact gets today\'s behaviour and '
        + 'no error. That is the shape of defect this repository has repeatedly refused elsewhere '
        + '("a check that cannot inspect its target must fail visibly")',
      'two objects must travel together for the property to exist at all, and nothing in the type '
        + 'system makes them travel together',
      'the ledger has an append-only proof; the sidecar would need its own, and its own persistence',
    ],
  },
  {
    option: 'O5_ADDITIVE_SUCCESSOR_TYPE',
    summary: 'owed-fact.types.ts is not touched. A successor type in a NEW module widens OwedFact '
      + 'with `owedProperty: string | null`, following the repository\'s v3→v3.1→v3.2→v3.3 and '
      + 'v15→vNext discipline.',
    fieldsAddedToOwedFact: [],
    mutatesPinnedContractFile: false,
    section187HashConsequence: 'NONE. The sha256 stays 102d059b… and all eleven live assertions '
      + 'hold, because the pinned FILE is unchanged. The §201 ownership map applies exactly this '
      + 'reasoning to the circuit breaker: an additive successor "keeps §198\'s 89/89 and §199\'s '
      + 'evidence attached to the module hashes that produced them".',
    migrationBurden: 'LOW',
    downstream: {
      projectOwedFact: 'unchanged; a successor projection accepting OwedFactV2 is additive, and '
        + 'narrowToV1 reproduces today\'s bytes exactly',
      owedFactDefects: 'unchanged — an OwedFactV2 IS an OwedFact and passes the existing rules; a '
        + 'successor defect rule can be added in the new module',
      createOwedFactLedger: 'unchanged; a V2 fact is structurally admissible today',
      preservationViolations: 'unchanged; a successor check would cover owedProperty',
      structuralQuestions: 'unchanged',
      owedFactObservability: 'widens automatically — initialOwedFacts carries whole facts, and a V2 '
        + 'fact serialises with its property',
      settlementReview: 'unchanged; a V2 fact satisfies every V1 signature it is passed to',
      provenanceTableCaseB3: 'STILL PASSES on OwedFact. A successor provenance table is owed for '
        + 'OwedFactV2, and B3\'s exactness rule should be mirrored onto it or the guarantee is lost',
    },
    requirements: {
      R1_PRESERVES_FACT_KEY_IDENTITY: 'MET_BY_CONSTRUCTION',
      R2_NO_UNNECESSARY_SEMANTIC_DUPLICATION: 'MET_BY_CONSTRUCTION',
      R3_NO_DETERMINISTIC_INVENTION: 'MET',
      R4_BACKWARD_COMPATIBILITY: 'MET_BY_CONSTRUCTION',
      R5_NO_PROVIDER_SETTLEMENT_AUTHORITY: 'MET',
      R6_NO_PRODUCTION_ACTIVATION: 'MET',
    },
    residual: [
      'TWO TYPES NOW DESCRIBE ONE THING. Every future field must be placed in one of them, and the '
        + '"which type does this belong to" question never goes away',
      'a V1 consumer handed a V2 fact silently ignores the property — the same silence as O4, moved '
        + 'from two objects into two types',
      'defers rather than answers the question of whether the CONTRACT should name the property',
    ],
  },
];

// ---------------------------------------------------------------- what §199 actually shows

/**
 * A FACTUAL characterisation of the §199 loss. Every number here is recomputed by the suite from the
 * immutable evidence files; none is copied from a description.
 *
 * IT IS LEXICAL, AND LEXICAL IS NOT SEMANTIC. "Every content token of the property also appears
 * somewhere in the projected fields" does NOT mean the property is recoverable from them, and
 * "three tokens are absent" does NOT mean it is lost. Whether the omission cost anything for any
 * given fact is axis Q, and axis Q is unadjudicated.
 */
export interface Section199LossCharacterisation {
  readonly rawDeclarations: number;
  readonly admittedDeclarations: number;
  readonly refusedDeclarations: number;
  readonly declarationsCarryingMissingFact: number;
  readonly projectedFactsCarryingTheProperty: number;
  readonly missingFactVerbatimInProjectedFact: number;
  readonly totalPropertyBytesNotProjected: number;
  readonly factsWhereEveryContentTokenAlsoAppearsInTheProjection: number;
  readonly factsWithAtLeastOneContentTokenAbsent: number;
  readonly interpretationBoundary: string;
}

export const SECTION_199_EXPECTED_CHARACTERISATION: Section199LossCharacterisation = {
  rawDeclarations: 9,
  admittedDeclarations: 8,
  refusedDeclarations: 1,
  declarationsCarryingMissingFact: 9,
  projectedFactsCarryingTheProperty: 0,
  missingFactVerbatimInProjectedFact: 0,
  totalPropertyBytesNotProjected: 770,
  factsWhereEveryContentTokenAlsoAppearsInTheProjection: 2,
  factsWithAtLeastOneContentTokenAbsent: 6,
  interpretationBoundary: 'LEXICAL OVERLAP IS NOT SEMANTIC RECOVERABILITY. These counts say what '
    + 'strings did and did not travel. They say nothing about whether any fact was harmed, which is '
    + '§200 axis Q and is unadjudicated.',
};

/** Stopwords for the lexical characterisation. Stated as data so the measure is reproducible. */
export const CHARACTERISATION_STOPWORDS: readonly string[] = [
  'a', 'an', 'the', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'to', 'in', 'on',
  'at', 'for', 'from', 'by', 'with', 'and', 'or', 'not', 'that', 'this', 'it', 'its', 'as',
  'which', 'whether', 'if', 'any', 'some', 'no',
];

export function contentTokens(s: string): readonly string[] {
  const stop = new Set(CHARACTERISATION_STOPWORDS);
  const toks = (s.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(t => !stop.has(t));
  return [...new Set(toks)];
}

/** Tokens of the owed property that appear nowhere in the projected fields. Purely lexical. */
export function propertyTokensAbsentFromProjection(
  owedProperty: string, projected: ProjectedUnderOption,
): readonly string[] {
  const hay = [
    projected.whyUnresolved ?? '', projected.branchA, projected.branchB,
    projected.decisionDivergence.ifA, projected.decisionDivergence.ifB,
    projected.evidenceSpan, projected.affectedDecision,
  ].join(' ').toLowerCase();
  const present = new Set(hay.match(/[a-z0-9']+/g) ?? []);
  return contentTokens(owedProperty).filter(t => !present.has(t));
}

// ---------------------------------------------------------------- effect declaration

/** Asserted by the suite: this module decides nothing and activates nothing. */
export function owedPropertyRepresentationEffect(): {
  contractMutated: false; productionActivated: false; providerCallsMade: 0; databaseOperations: 0;
  recommendationMade: false; semanticVerdictSupplied: false;
} {
  return {
    contractMutated: false,
    productionActivated: false,
    providerCallsMade: 0,
    databaseOperations: 0,
    recommendationMade: false,
    semanticVerdictSupplied: false,
  };
}

/** Field names no prototype representation may introduce. Checked against the production list. */
export const PROTOTYPE_FORBIDDEN_FIELD_NAMES: readonly string[] = [
  ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
];

export const sha256 = (s: string): string =>
  createHash('sha256').update(s, 'utf8').digest('hex');
