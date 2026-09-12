/**
 * §218 -- LEGACY COMPATIBILITY. WHAT MAY BE CARRIED FORWARD, AND WHAT MAY NOT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO HISTORICAL EVIDENCE IS EDITED.
 *
 * ==================== THE RULE ====================
 *
 * Structured property-review values are NEVER inferred from historical verifier prose. §213, §215
 * and §217 remain legacy evidence, executed under the contracts they were executed under, and the
 * frozen digests in their preregistrations still describe what was sent. Nothing here rewrites,
 * upgrades, rescores or reclassifies any of it.
 *
 * ==================== WHY A SPLIT AND NOT A BLANKET REFUSAL ====================
 *
 * The authorization permits a successor adapter to add EXPLICITLY FROZEN MECHANICAL VALUES where the
 * semantics are already authored. That is a real and narrow permission, and the split is exactly
 * where §212's payload provenance table put it: `targetDeclarationId` is a value the REQUEST already
 * carried and the model was already shown -- it is copied, not judged. The role, the validity, the
 * controlling property and the reason are judgements, and no historical output contains them.
 *
 * So `adaptForDevelopmentFixture` supplies the one mechanical field and REFUSES the four semantic
 * ones, and `mayUpgradeALegacyOutput` answers NO for every historical section, by construction
 * rather than by policy: there is nothing to copy, and the only way to fill the fields would be to
 * read a §217 rationale and decide what it meant. That is the semantic reconstruction §201 refused,
 * §212 refused, and this module refuses again.
 *
 * §217's own adjudication is the reason this matters. Its K1 rationale reads "This is a case where
 * the act itself is the required control" -- an explicit, confident, WRONG role statement. An
 * adapter that mined prose for role vocabulary would have recorded REQUIRED_ACT_ITSELF and VALID for
 * a case the frozen truth marks FAIL, and the §218 gate would have passed on manufactured evidence.
 */

import {
  type PropertyReview218, PROPERTY_REVIEW_FIELDS_218,
} from './expert-218-property-review-contract';

export const LEGACY_COMPATIBILITY_218_VERSION =
  'hazlenz.expert.218.legacy-compatibility.v1' as const;

/** Sections whose evidence is frozen and stays exactly as executed. */
export const FROZEN_HISTORICAL_SECTIONS: readonly string[] = [
  'SECTION_213', 'SECTION_215', 'SECTION_217',
];

export const HISTORICAL_EVIDENCE_DISPOSITION = {
  rewritten: false,
  upgraded: false,
  rescored: false,
  reclassified: false,
  digestsRecomputed: false,
  note: '§217 evidence is preserved exactly: HF1 x2 on K1 and K2, HF2 x1 on K2, HF4 x1 on K4, HF3 '
    + 'HF5 HF6 HF7 clean, K3 PASS, K4 target accepted and the sibling nomination deterministically '
    + 'refused, HF1 and HF2 CLASS A, HF4 CLASS B, KR-1 OPEN.',
} as const;

/**
 * §217's result, preserved exactly as adjudicated and held as data so the suite asserts it rather
 * than a report restating it. Nothing in §218 may change a value here.
 */
export const SECTION_217_EVIDENCE = {
  callsAttempted: 4,
  callsReachingInference: 4,
  transportFailures: 0,
  deterministicRefusals: 1,
  gateOccurrences: {
    HF1_EVIDENCE_PROXY_ACCEPTED: { count: 2, on: ['K1', 'K2'] as readonly string[] },
    HF2_PROPERTY_INVALID_ROUTED_AS_CLARIFICATION: { count: 1, on: ['K2'] as readonly string[] },
    HF3_LEGITIMATE_ACT_CHALLENGED: { count: 0, on: [] as readonly string[] },
    HF4_SIBLING_NOMINATION: { count: 1, on: ['K4'] as readonly string[] },
    HF5_TARGET_BINDING_VIOLATION: { count: 0, on: [] as readonly string[] },
    HF6_UNRESOLVED_BECAME_ADVERSE: { count: 0, on: [] as readonly string[] },
    HF7_PROVIDER_SETTLEMENT_AUTHORITY: { count: 0, on: [] as readonly string[] },
  },
  caseResults: {
    K1: 'FAIL', K2: 'FAIL', K3: 'PASS', K4: 'PART_FAIL',
  },
  k3LegitimateActControl: 'PASS',
  k4TargetProperty: 'CORRECTLY_ACCEPTED',
  k4SiblingNomination: 'ATTEMPTED_BY_PROVIDER_DETERMINISTICALLY_REFUSED',
  classification: { HF1: 'CLASS_A', HF2: 'CLASS_A', HF4: 'CLASS_B' },
  kr1: 'OPEN',
  frozenDigest: '99f9f6b82842cb0ad4c0e1ea78418af3606dc4dcadde353699ed8d18998fa2a4',
  mayBeReclassifiedBySection218: false,
} as const;

/**
 * Which §218 fields are MECHANICAL -- present in the request and copied -- and which are SEMANTIC.
 * Iterated by the suite so the split is a table rather than a sentence.
 */
export const FIELD_PROVENANCE_218: Readonly<Record<string, 'MECHANICAL' | 'MODEL_SEMANTIC'>> = {
  targetDeclarationId: 'MECHANICAL',
  propertySemanticRole: 'MODEL_SEMANTIC',
  propertyValidity: 'MODEL_SEMANTIC',
  decisionControllingProperty: 'MODEL_SEMANTIC',
  propertyReviewReason: 'MODEL_SEMANTIC',
};

export const MECHANICAL_FIELDS_218: readonly string[] =
  PROPERTY_REVIEW_FIELDS_218.filter(f => FIELD_PROVENANCE_218[f] === 'MECHANICAL');
export const SEMANTIC_FIELDS_218: readonly string[] =
  PROPERTY_REVIEW_FIELDS_218.filter(f => FIELD_PROVENANCE_218[f] === 'MODEL_SEMANTIC');

export const ADAPTER_CODES_218 = [
  'SEMANTIC_FIELD_NOT_AUTHORED',
  'MECHANICAL_VALUE_NOT_SUPPLIED',
  'LEGACY_OUTPUT_MAY_NOT_BE_UPGRADED',
] as const;
export type AdapterCode218 = (typeof ADAPTER_CODES_218)[number];

export interface AdapterResult218 {
  readonly adapted: boolean;
  readonly codes: readonly AdapterCode218[];
  readonly detail: readonly string[];
  readonly review: PropertyReview218 | null;
  /** Which fields the adapter supplied itself. Only ever the mechanical ones. */
  readonly suppliedByAdapter: readonly string[];
}

/**
 * Adapt a CURRENT development output that already carries the model's semantic judgements but was
 * assembled without the mechanical id. Copies the id and nothing else.
 *
 * It refuses rather than fills. An adapter that filled a semantic field would be authoring a safety
 * judgement in deterministic code.
 */
export function adaptForDevelopmentFixture(args: {
  readonly authored: {
    readonly propertySemanticRole?: unknown;
    readonly propertyValidity?: unknown;
    readonly decisionControllingProperty?: unknown;
    readonly propertyReviewReason?: unknown;
  };
  /** The id the request carried. Frozen and mechanical. */
  readonly frozenTargetDeclarationId: string;
}): AdapterResult218 {
  const codes: AdapterCode218[] = [];
  const detail: string[] = [];
  const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

  if (blank(args.frozenTargetDeclarationId)) {
    codes.push('MECHANICAL_VALUE_NOT_SUPPLIED');
    detail.push('the frozen targetDeclarationId is empty; it is copied, never derived');
  }
  for (const f of SEMANTIC_FIELDS_218) {
    if (blank((args.authored as Record<string, unknown>)[f])) {
      codes.push('SEMANTIC_FIELD_NOT_AUTHORED');
      detail.push(`${f} was not authored by the model and is not inferred from prose`);
    }
  }
  if (codes.length > 0) {
    return { adapted: false, codes, detail, review: null, suppliedByAdapter: [] };
  }
  const a = args.authored as Record<string, string>;
  return {
    adapted: true,
    codes: [],
    detail: [],
    review: {
      targetDeclarationId: args.frozenTargetDeclarationId,
      propertySemanticRole: a.propertySemanticRole as PropertyReview218['propertySemanticRole'],
      propertyValidity: a.propertyValidity as PropertyReview218['propertyValidity'],
      decisionControllingProperty: a.decisionControllingProperty,
      propertyReviewReason: a.propertyReviewReason,
    },
    suppliedByAdapter: [...MECHANICAL_FIELDS_218],
  };
}

/**
 * May a historical verifier output be upgraded into a §218 one? Always NO, and the reason is
 * structural: a §213, §215 or §217 output carries none of the four semantic fields, so the adapter
 * refuses on SEMANTIC_FIELD_NOT_AUTHORED. Run rather than asserted.
 */
export function mayUpgradeALegacyOutput(legacyOutput: Record<string, unknown>): AdapterResult218 {
  const review = legacyOutput.propertyReview;
  if (review === undefined || review === null) {
    return {
      adapted: false,
      codes: ['LEGACY_OUTPUT_MAY_NOT_BE_UPGRADED', 'SEMANTIC_FIELD_NOT_AUTHORED'],
      detail: [
        'the historical output carries no propertyReview, and the four semantic fields are not '
        + 'reconstructed from its rationale. §217 K1 wrote a confident and wrong role statement '
        + 'into its prose; mining that would have manufactured evidence rather than recovered it.',
      ],
      review: null,
      suppliedByAdapter: [],
    };
  }
  return adaptForDevelopmentFixture({
    authored: review as Record<string, unknown>,
    frozenTargetDeclarationId: String(legacyOutput.declarationId ?? ''),
  });
}

/** Routes considered and refused. Held as data so a later slice cannot quietly take one. */
export const REFUSED_ADAPTATIONS_218: readonly { route: string; refusedBecause: string }[] = [
  {
    route: 'read a historical rationale for role vocabulary and record propertySemanticRole',
    refusedBecause: 'that is a keyword classifier over prose, refused since §160, and §217 K1 '
      + 'proves it would have produced the wrong answer with high confidence.',
  },
  {
    route: 'set propertyValidity from the historical declaration -- CHALLENGE means INVALID, '
      + 'STILL_UNRESOLVED means VALID',
    refusedBecause: 'the declaration answers a different question. §217 K1 declared '
      + 'STILL_UNRESOLVED on a property the frozen truth marks INVALID, so the mapping would '
      + 'record VALID for the case §218 exists to catch.',
  },
  {
    route: 'set decisionControllingProperty from the first pass\'s own missingFact',
    refusedBecause: 'that is the supplied property, which is the very thing under review. Copying '
      + 'it would make every legacy review self-confirming.',
  },
  {
    route: 'backfill the §217 CONTRACT-VALIDATION file with §218 codes',
    refusedBecause: '§217 was executed under the §212 schema and validated by the §212 layer. '
      + 'Adding codes from a layer that did not exist would misdescribe what was actually run.',
  },
];

export function legacyEffect218(): {
  providerCalls: 0; databaseOperations: 0;
  historicalEvidenceEdited: false; historicalResultReclassified: false;
  semanticRoleInferredFromProse: false; frozenDigestRecomputed: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    historicalEvidenceEdited: false,
    historicalResultReclassified: false,
    semanticRoleInferredFromProse: false,
    frozenDigestRecomputed: false,
  };
}
