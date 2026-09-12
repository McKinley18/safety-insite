/**
 * §202 EXPERT HAZLENZ -- ADJUDICATION GROUPING AND VERDICT RECORDING.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== WHAT THIS MODULE IS ====================
 *
 * The §200 worksheet holds 152 verdict slots and 0 supplied verdicts. Filling them means hand-editing
 * a 210 KB JSON file, which is why none of them are filled. This module builds the machinery that
 * lets the product owner supply those verdicts ROW BY ROW in a spoken session: it regroups the frozen
 * §199/§200 evidence into self-contained REVIEW UNITS, emits a §202 worksheet whose every open slot
 * carries its own question and its own allowed vocabulary, and provides the one function that is
 * permitted to write a verdict into it.
 *
 * ==================== WHAT THIS MODULE IS NOT ====================
 *
 *      IT SUPPLIES NO SEMANTIC VERDICT, AND NO SEMANTIC VERDICT IS REPRESENTABLE FROM MODEL CODE.
 *
 * `recordVerdict` requires `attribution === 'PRODUCT_OWNER'` and refuses every other value, including
 * every string a model could plausibly reach for. There is no second entry point, no default, and no
 * flag that relaxes it. The regrouping is a rearrangement of frozen bytes: every observation,
 * expectation, declaration, projected fact, verifier output and neutral observation is copied
 * verbatim out of the immutable §199/§200 evidence, and nothing in this file ranks a unit, orders one
 * by expected outcome, or characterises any model output as right or wrong.
 *
 * ==================== THE THREE COUNTS, CARRIED FORWARD, NOT RECOMPUTED DIFFERENTLY ====================
 *
 *   TOTAL SLOTS 152  ·  STRUCTURALLY PRE-FILLED 24  ·  GENUINELY OPEN 128  ·  SUPPLIED 0
 *
 * The 24 pre-filled slots are axes N, S and T on the eight projected facts, all `NOT_EXERCISED`. The
 * product owner ruled these legitimate execution-reality states. They are carried forward unchanged,
 * they are never presented as open, and `recordVerdict` refuses to write into any of them.
 *
 * The headline 152 is `12 rows x 4 row axes` + `8 facts x 13 fact axes`. §200's own completeness
 * block excludes the 56 verifier sub-axis fields and the 2 refused-declaration questions that also
 * sit null in that worksheet. This module carries those 58 fields as SUPPLEMENTARY slots so they are
 * not lost, and counts them SEPARATELY so the frozen 152/24/128 arithmetic is preserved exactly.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join, sep } from 'path';

export const SECTION_202_GROUPING_VERSION =
  'hazlenz.expert.202.adjudication-grouping.v1' as const;

// ---------------------------------------------------------------- frozen source pins

export const SECTION_200_DIR = 'expert-hazlenz-semantic-adjudication-2026-09-07' as const;
export const SECTION_199_DIR = 'expert-hazlenz-successor-structured-e2e-2026-09-07' as const;
export const SECTION_202_DIR = 'expert-hazlenz-governed-stage-integration-2026-09-07' as const;

/** sha256 of the §200 worksheet this module was written against, computed from the file itself. */
export const SECTION_200_WORKSHEET_SHA256 =
  '07dbb1707fa7bca43438ad2e7daade8c53d39acf0af9ea10513b1b37af9900f2' as const;
export const SECTION_200_SESSION_SHA256 =
  'ea70f67c2e297114f711ab1796550e1c00855ddeef1fa109bb809a2fa3e31278' as const;
export const SECTION_199_RAW_FIRST_PASS_SHA256 =
  'eafc0f2e2d4385c43f3c6a8fad480075a6d9e867a5b31f2efaa0d7a9ff052204' as const;
export const SECTION_199_RAW_VERIFIER_SHA256 =
  '351d52c47d6be6d7ce6cf5998f18a644a982c2191ad697c24108913f4470684c' as const;
export const SECTION_199_PREREGISTRATION_SHA256 =
  'ddd6f63d56de4e6e62037457bed06b3de59b1100d169ec1b28d427d6f3d4fea4' as const;

/** The frozen split. Asserted against the loaded §200 worksheet, never recomputed differently. */
export const FROZEN_SLOT_SPLIT = {
  totalSlots: 152,
  structurallyPrefilled: 24,
  genuinelyOpen: 128,
  supplied: 0,
} as const;

// ---------------------------------------------------------------- vocabularies

/** §200 `verdictVocabulary`, copied verbatim. */
export const VERDICT_VOCABULARY = [
  'CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED',
] as const;

/** §200 axis Q `scale`, copied verbatim. */
export const Q_LOSS_SCALE = [
  'NO_OBSERVABLE_LOSS', 'MINOR_WORDING_LOSS', 'TARGET_AMBIGUITY',
  'NEIGHBOURING_PROPERTY_AMBIGUITY', 'CLARIFICATION_INSUFFICIENCY',
  'INCORRECT_VERIFIER_BINDING', 'HUMAN_REVIEW_DIFFICULTY',
] as const;

/** §200 axis R `scale`, copied verbatim. Answers `R_SAFETY_CLASSIFICATION`. */
export const R_SAFETY_CLASSIFICATION_SCALE = [
  'ORDINARY_NON_ESCALATING', 'SAFETY_SIGNIFICANT', 'PLAUSIBLY_LIFE_CRITICAL', 'INDETERMINATE',
] as const;

/**
 * §200 carries a SECOND R slot -- `R_PRIORITY_FLOOR_IMPACT`, "does the OTHER floor under-escalate
 * it" -- and enumerates NO vocabulary for it anywhere in the worksheet or the session document.
 * The three members below are a §202 PROPOSAL to make the slot answerable in a spoken session. They
 * are flagged as such on every slot that uses them and REQUIRE PRODUCT-OWNER CONFIRMATION before the
 * slot is presented. They encode no view about which member applies to any fact.
 */
export const R_FLOOR_IMPACT_SCALE_SECTION_202_PROPOSED = [
  'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE',
  'FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE',
  'INDETERMINATE',
] as const;

export const VOCABULARY_SOURCE = {
  SECTION_200_VERDICT_VOCABULARY: 'SECTION_200_VERDICT_VOCABULARY_VERBATIM',
  SECTION_200_AXIS_SCALE: 'SECTION_200_AXIS_SCALE_VERBATIM',
  SECTION_200_APPLIED_BY_202:
    'SECTION_200_GLOBAL_VERDICT_VOCABULARY_APPLIED_BY_SECTION_202_BECAUSE_SECTION_200_ENUMERATED_NONE',
  SECTION_202_PROPOSED:
    'SECTION_202_PROPOSED_VOCABULARY_REQUIRES_PRODUCT_OWNER_CONFIRMATION_SECTION_200_ENUMERATED_NONE',
} as const;

// ---------------------------------------------------------------- attribution

/**
 * THE ONLY ATTRIBUTION A VERDICT MAY CARRY. There is no model-authored, agent-authored, inferred or
 * assumed alternative, and no code path produces one.
 */
export const PRODUCT_OWNER_ATTRIBUTION = 'PRODUCT_OWNER' as const;
export type VerdictAttribution = typeof PRODUCT_OWNER_ATTRIBUTION;

export const VERDICT_REFUSAL_CODES = [
  'UNKNOWN_SLOT',
  'STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE',
  'VALUE_NOT_IN_ALLOWED_VOCABULARY',
  'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
  'CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG',
] as const;
export type VerdictRefusalCode = (typeof VERDICT_REFUSAL_CODES)[number];

// ---------------------------------------------------------------- types

export type SlotKind =
  | 'ROW_AXIS'
  | 'FACT_AXIS'
  | 'FACT_VERIFIER_SUB_AXIS'
  | 'REFUSED_DECLARATION_QUESTION';

export interface SlotProvenance {
  /** the §199 row this slot belongs to */
  readonly rowId: string;
  /** the §199 projected fact key, where the slot is about a fact */
  readonly factKey: string | null;
  /** the first-pass declarationId, where the slot is about a declaration */
  readonly declarationId: string | null;
  /** the review unit that presents this slot */
  readonly reviewUnitId: string;
  /** the §200 worksheet path this slot derives from, and its sha256 */
  readonly derivedFrom: string;
  readonly section200WorksheetSha256: string;
  /** the JSON pointer of the corresponding field in the §200 worksheet */
  readonly section200Pointer: string;
}

export interface VerdictSlot {
  readonly slotId: string;
  readonly kind: SlotKind;
  readonly axisId: string;
  readonly axisName: string;
  readonly question: string;
  readonly allowedVocabulary: readonly string[];
  readonly vocabularySource: string;
  /** true for the 152 slots §200's completeness block counts; false for the 58 supplementary ones */
  readonly countsTowardHeadlineTotal: boolean;
  /** true only for the 24 governed axes N/S/T on the eight projected facts */
  readonly structurallyPrefilled: boolean;
  readonly prefilledReason: string | null;
  /** any §200 note about when the slot applies, carried verbatim */
  readonly applicabilityNote: string | null;
  readonly provenance: SlotProvenance;
  /** the supplied string, VERBATIM, with no normalisation of any kind */
  verdict: string | null;
  attribution: VerdictAttribution | null;
  recordedAt: string | null;
}

export type ReviewUnitKind =
  | 'ROW_FIRST_PASS_BEHAVIOUR'
  | 'PROJECTED_FACT'
  | 'REFUSED_DECLARATION';

/**
 * The unit as the worksheet records it: identity, the slots it presents, and the counts. The
 * evidence itself lives ONCE, in the presentation packet, so the two artifacts cannot drift into
 * disagreeing copies of the same frozen bytes.
 */
export interface ReviewUnitSummary {
  readonly unitId: string;
  readonly ordinal: number;
  readonly kind: ReviewUnitKind;
  readonly rowId: string;
  readonly factKey: string | null;
  readonly declarationId: string | null;
  readonly headline: string;
  readonly slotIds: readonly string[];
  readonly headlineSlotCount: number;
  readonly supplementarySlotCount: number;
  readonly openSlotCount: number;
  readonly structurallyPrefilledSlotCount: number;
  readonly evidenceIn: string;
  /**
   * ADDITIVE, NOT A VERDICT. §200 makes TRUTH_SPECIFICATION_DEFECT a first-class outcome recorded
   * alongside the verdicts, never in place of one, and never by rewriting the frozen
   * preregistration. Both fields are free text and both require PRODUCT_OWNER attribution.
   */
  truthSpecificationDefect: string | null;
  reviewerNotes: string | null;
  additiveAttribution: VerdictAttribution | null;
}

export const ADDITIVE_FIELDS = ['truthSpecificationDefect', 'reviewerNotes'] as const;
export type AdditiveField = (typeof ADDITIVE_FIELDS)[number];

export interface ReviewUnit extends Omit<ReviewUnitSummary,
  'openSlotCount' | 'structurallyPrefilledSlotCount' | 'evidenceIn'
  | 'truthSpecificationDefect' | 'reviewerNotes' | 'additiveAttribution'> {
  /** every piece of evidence the unit shows, copied verbatim from frozen sources */
  readonly evidence: ReviewUnitEvidence;
}

export interface ReviewUnitEvidence {
  readonly observation: string;
  readonly inspectionContext: unknown;
  readonly rowFacts: {
    readonly provenance: string;
    readonly section197Origin: string;
    readonly capability: string;
    readonly families: readonly string[];
    readonly pairedWith: string | null;
    readonly isTransportCanary: boolean;
    readonly adjudicable: boolean;
    readonly notAdjudicableReason: string | null;
    readonly governedRecordsShownToFirstPass: unknown;
    readonly governedSourceIdsShownToFirstPass: readonly string[];
    readonly deterministicFindingsShown: unknown;
  };
  readonly frozenExpectedIntent: {
    readonly establishedByTheText: readonly string[];
    readonly notEstablishedByTheText: readonly string[];
    readonly expectedGapCount: unknown;
    readonly expectedOwedFacts: unknown;
    readonly designIntent: string;
    /** present on PROJECTED_FACT units: the single expectation §200 pointed at, with its caveat */
    readonly nearestExpectation: unknown | null;
    readonly nearestExpectationNote: string | null;
  };
  readonly truthProvenanceDisclosure: readonly string[];
  readonly rawFirstPass: {
    readonly reachedInference: boolean;
    readonly preInferenceFailure: boolean;
    readonly httpStatus: number | null;
    readonly providerErrorType: string | null;
    readonly providerErrorMessage: string | null;
    readonly respondedModel: string | null;
    readonly stopReason: string | null;
    readonly outcome: string | null;
    /** the verbatim tool-call payload the provider returned, or null where none exists */
    readonly toolCallPayload: unknown;
  };
  readonly declarations: readonly unknown[];
  readonly admission: {
    readonly admittedFactKeys: readonly string[];
    readonly rejectedDeclarations: readonly unknown[];
    readonly refusalCodes: readonly string[];
    readonly refusalDetail: readonly string[];
    readonly verifierAdmissionAdmitted: boolean | null;
    readonly verifierAdmissionCodes: readonly string[];
  };
  readonly projectedOwedFact: unknown | null;
  readonly whatTheVerifierActuallyReceived: unknown | null;
  readonly missingFactInDeclaration: string | null;
  readonly missingFactCarriedIntoProjectedOwedFact: boolean | null;
  readonly verifier: unknown | null;
  readonly neutralObservations: readonly unknown[];
  /** disclosures about the neutral observations themselves, carried forward from §200 */
  readonly neutralObservationCaveats: readonly string[];
}

export interface Worksheet202 {
  readonly artifact: 'SECTION_202_ADJUDICATION_WORKSHEET';
  status: string;
  readonly groupingVersion: string;
  readonly writtenBy: string;
  readonly semanticOracle: string;
  readonly derivedFrom: {
    readonly section200Worksheet: string;
    readonly section200WorksheetSha256: string;
    readonly section200Session: string;
    readonly section200SessionSha256: string;
    readonly section199RawFirstPass: string;
    readonly section199RawFirstPassSha256: string;
    readonly section199RawVerifier: string;
    readonly section199RawVerifierSha256: string;
    readonly section199PreregistrationSha256: string;
  };
  readonly truthProvenance: unknown;
  readonly reviewUnits: readonly ReviewUnitSummary[];
  readonly slots: VerdictSlot[];
  completeness: {
    totalSlots: number;
    structurallyPrefilled: number;
    genuinelyOpen: number;
    supplied: number;
    remaining: number;
    readonly headlineDerivation: string;
    supplementaryTotalSlots: number;
    supplementarySupplied: number;
    supplementaryRemaining: number;
    readonly supplementaryNote: string;
  };
  readonly openQuestionsForTheProductOwner: readonly string[];
}

// ---------------------------------------------------------------- disclosures, carried forward

/**
 * §3 of every review unit. §200 records this once at the top of its worksheet; the authorization for
 * §202 requires it on EVERY unit, because a disclosure read once at the start of a long session is
 * not in view when a divergence is being weighed forty minutes later.
 */
export const TRUTH_PROVENANCE_DISCLOSURE: readonly string[] = [
  'THE FROZEN EXPECTED SEMANTIC INTENT SHOWN IN THIS UNIT WAS AI-ASSISTED AND WAS NOT PREVIOUSLY '
    + 'PRODUCT-OWNER REVIEWED.',
  '§199 TRUTH_PROVENANCE records AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING = true, '
    + 'PRODUCT_OWNER_REVIEWED = false, FULLY_INDEPENDENT_HUMAN_AUTHORING = false, '
    + 'USED_AS_THE_SEMANTIC_ORACLE = false.',
  'Its recorded role is "cohort design and adjudication-packet structure only", and it must never be '
    + 'described as independent human truth.',
  'A divergence between a model output and this expectation is EQUALLY CONSISTENT with a defective '
    + 'output and a defective expectation. TRUTH_SPECIFICATION_DEFECT is recorded additively in this '
    + 'unit\'s own field; the frozen preregistration is never rewritten.',
];

export const NEUTRAL_OBSERVATION_CAVEATS: readonly string[] = [
  'Each observation below is a byte-level or set-membership comparison whose answer is not in '
    + 'dispute. It states a comparison, not its implication.',
  'An observation can be right about the comparison and wrong about what matters, because the truth '
    + 'it compares against is unreviewed.',
  'DISCLOSED AS NOISY, carried forward from §200: the shared-vocabulary comparison against the '
    + 'preregistered unacceptableNeighbouringProperties is A WEAK POINTER. Words in common are not a '
    + 'substitution, and few words in common are not a defence.',
];

// ---------------------------------------------------------------- loading the frozen evidence

export interface FrozenEvidence {
  readonly repoRoot: string;
  readonly worksheet200: any;
  readonly worksheet200Sha256: string;
  readonly session200Sha256: string;
  readonly firstPass199: readonly any[];
  readonly firstPass199Sha256: string;
  readonly verifier199: readonly any[];
  readonly verifier199Sha256: string;
}

const sha256OfFile = (path: string): string =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

export function loadFrozenEvidence(repoRoot: string): FrozenEvidence {
  const v = join(repoRoot, 'verification');
  const wsPath = join(v, SECTION_200_DIR, 'ADJUDICATION-WORKSHEET.json');
  const sessionPath = join(v, SECTION_200_DIR, 'ADJUDICATION-SESSION.md');
  const fpPath = join(v, SECTION_199_DIR, 'RAW-FIRST-PASS-OUTPUTS.jsonl');
  const vfPath = join(v, SECTION_199_DIR, 'RAW-VERIFIER-OUTPUTS.jsonl');

  const jsonl = (p: string): any[] => readFileSync(p, 'utf8')
    .split('\n').filter(l => l.trim().length > 0).map(l => JSON.parse(l));

  return {
    repoRoot,
    worksheet200: JSON.parse(readFileSync(wsPath, 'utf8')),
    worksheet200Sha256: sha256OfFile(wsPath),
    session200Sha256: sha256OfFile(sessionPath),
    firstPass199: jsonl(fpPath),
    firstPass199Sha256: sha256OfFile(fpPath),
    verifier199: jsonl(vfPath),
    verifier199Sha256: sha256OfFile(vfPath),
  };
}

// ---------------------------------------------------------------- the §202 output boundary

/**
 * The ONLY directory this builder may write into. Every §195-§201 evidence directory is immutable,
 * and the ownership map assigns `backend/package.json` and every tsconfig to the orchestrator.
 */
export function resolveSection202Path(repoRoot: string, fileName: string): string {
  if (fileName.length === 0
    || fileName.includes('/') || fileName.includes('\\') || fileName.includes(sep)
    || fileName.includes('..')) {
    throw new Error(
      `§202 output boundary: refusing file name "${fileName}" — a bare file name inside `
      + `verification/${SECTION_202_DIR}/ is the only permitted output target`);
  }
  return join(repoRoot, 'verification', SECTION_202_DIR, fileName);
}

export const SECTION_202_OUTPUT_FILES = [
  'ADJUDICATION-WORKSHEET-202.json',
  'ADJUDICATION-PRESENTATION-PACKET.md',
  'ADJUDICATION-SESSION-202.md',
] as const;

// ---------------------------------------------------------------- grouping

const ROW_AXIS_ORDER = [
  'A_FIRST_PASS_GAP_RECALL', 'B_FIRST_PASS_GAP_PRECISION',
  'H_MULTI_GAP_PRESERVATION', 'I_FALSE_GAP_SUPPRESSION',
] as const;

const FACT_AXIS_ORDER = [
  'C_OWED_PROPERTY_SEMANTIC_CORRECTNESS', 'D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE',
  'E_BRANCH_PLAUSIBILITY', 'F_DECISION_DIVERGENCE_VALIDITY', 'G_AFFECTED_DECISION_CORRECTNESS',
  'L_VERIFIER_TARGET_BINDING', 'M_CLARIFICATION_RESOLUTION_SUFFICIENCY',
  'N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY', 'Q_OWED_PROPERTY_LOSS_IMPACT',
  'R_PRIORITY_FLOOR_IMPACT', 'R_SAFETY_CLASSIFICATION',
  'S_GOVERNED_ID_BINDING_APPROPRIATENESS', 'T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING',
] as const;

const VERIFIER_SUB_AXIS_ORDER = [
  'TARGET_TOPIC_REACH', 'EXACT_OWED_PROPERTY_BINDING', 'CLARIFICATION_RESOLUTION_SUFFICIENCY',
  'AFFECTED_DECISION_ALIGNMENT', 'BRANCH_DECISION_CONSISTENCY', 'CHALLENGE_REVIEWABILITY',
  'LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION',
] as const;

const VERIFIER_SUB_AXIS_QUESTIONS: Record<string, string> = {
  TARGET_TOPIC_REACH:
    'Did the verifier verdict reach the TOPIC of this projected fact at all?',
  EXACT_OWED_PROPERTY_BINDING:
    'Did the verifier verdict bind to the EXACT owed property, as distinct from reaching its topic?',
  CLARIFICATION_RESOLUTION_SUFFICIENCY:
    'Would the clarification the verifier accepted obtain evidence capable of SETTLING this fact?',
  AFFECTED_DECISION_ALIGNMENT:
    'Is the verifier\'s treatment aligned with the affectedDecision the projected fact carries?',
  BRANCH_DECISION_CONSISTENCY:
    'Is the verifier\'s treatment consistent with the two branches and the two decisions it received?',
  CHALLENGE_REVIEWABILITY:
    'Where the verifier issued a challenge, is the stated reason reviewable on its face?',
  LOSS_BETWEEN_MISSINGFACT_AND_OWEDFACT_CAUSED_DEGRADATION:
    'Did the first-pass missingFact NOT reaching the verifier degrade the verifier\'s treatment of '
    + 'this fact?',
};

/** §200 states this sub-axis is applicable on SF-04. The note is carried; nothing is pre-filled. */
const CHALLENGE_REVIEWABILITY_APPLICABILITY =
  '§200 records CHALLENGE_REVIEWABILITY as "(applicable on SF-04)" — the one fact whose verifier '
  + 'issued CHALLENGE_FACT_VALIDITY. §200 nevertheless leaves the field null on all eight facts and '
  + 'enumerates no vocabulary for it. It is carried on every fact unit unfilled.';

const REFUSED_QUESTION_AXES = [
  'STRUCTURAL_REFUSAL_CORRECTNESS', 'UNDERLYING_SEMANTIC_INTENT',
] as const;

function vocabularyFor(kind: SlotKind, axisKey: string): {
  vocab: readonly string[]; source: string;
} {
  if (kind === 'FACT_AXIS') {
    if (axisKey === 'Q_OWED_PROPERTY_LOSS_IMPACT') {
      return { vocab: Q_LOSS_SCALE, source: VOCABULARY_SOURCE.SECTION_200_AXIS_SCALE };
    }
    if (axisKey === 'R_SAFETY_CLASSIFICATION') {
      return {
        vocab: R_SAFETY_CLASSIFICATION_SCALE, source: VOCABULARY_SOURCE.SECTION_200_AXIS_SCALE,
      };
    }
    if (axisKey === 'R_PRIORITY_FLOOR_IMPACT') {
      return {
        vocab: R_FLOOR_IMPACT_SCALE_SECTION_202_PROPOSED,
        source: VOCABULARY_SOURCE.SECTION_202_PROPOSED,
      };
    }
    return { vocab: VERDICT_VOCABULARY, source: VOCABULARY_SOURCE.SECTION_200_VERDICT_VOCABULARY };
  }
  if (kind === 'ROW_AXIS') {
    return { vocab: VERDICT_VOCABULARY, source: VOCABULARY_SOURCE.SECTION_200_VERDICT_VOCABULARY };
  }
  // verifier sub-axes and the two refused-declaration questions: §200 enumerates no vocabulary.
  return { vocab: VERDICT_VOCABULARY, source: VOCABULARY_SOURCE.SECTION_200_APPLIED_BY_202 };
}

const axisLetterOf = (axisKey: string): string => {
  const m = /^([A-Z])_/.exec(axisKey);
  return m ? m[1] : axisKey;
};

/**
 * Row presentation order. Fully mechanical, and it carries no information about any unit's content:
 * ascending rowId, except that a row named as an earlier row's matched partner is placed immediately
 * after that row. The partner rule exists because §199's matched-pair design requires the pair to be
 * read together.
 */
export function orderRowIds(rows: readonly any[]): string[] {
  const byId = new Map<string, any>(rows.map(r => [r.rowId as string, r]));
  const ascending = rows.map(r => r.rowId as string).slice().sort();
  const placed = new Set<string>();
  const out: string[] = [];
  for (const id of ascending) {
    if (placed.has(id)) continue;
    out.push(id); placed.add(id);
    const partner = byId.get(id)?.pairedWith as string | null | undefined;
    if (partner && byId.has(partner) && !placed.has(partner)) {
      out.push(partner); placed.add(partner);
    }
  }
  return out;
}

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

export interface BuildResult {
  readonly units: readonly ReviewUnit[];
  readonly slots: readonly VerdictSlot[];
}

export function buildReviewUnitsAndSlots(evidence: FrozenEvidence): BuildResult {
  const ws = evidence.worksheet200;
  const rowAxisDefs = new Map<string, any>(
    (ws.rowAxes as any[]).map(a => [a.id as string, a]));
  const factAxisDefs = new Map<string, any>(
    (ws.factAxes as any[]).map(a => [a.id as string, a]));
  const firstPassByRow = new Map<string, any>(
    evidence.firstPass199.map(r => [r.rowId as string, r]));
  const verifierByFactKey = new Map<string, any>(
    evidence.verifier199.map(r => [r.factKey as string, r]));

  const units: ReviewUnit[] = [];
  const slots: VerdictSlot[] = [];
  let ordinal = 0;

  const rowsById = new Map<string, any>((ws.rows as any[]).map(r => [r.rowId as string, r]));
  const factsByRow = new Map<string, any[]>();
  (ws.facts as any[]).forEach((f, idx) => {
    const list = factsByRow.get(f.rowId) ?? [];
    list.push({ ...f, __section200Index: idx });
    factsByRow.set(f.rowId, list);
  });
  const refusedByRow = new Map<string, any[]>();
  (ws.refusedDeclarations as any[]).forEach((d, idx) => {
    const list = refusedByRow.get(d.rowId) ?? [];
    list.push({ ...d, __section200Index: idx });
    refusedByRow.set(d.rowId, list);
  });
  const rowIndexById = new Map<string, number>(
    (ws.rows as any[]).map((r, i) => [r.rowId as string, i]));

  const truthProvenanceDisclosure = TRUTH_PROVENANCE_DISCLOSURE;

  for (const rowId of orderRowIds(ws.rows)) {
    const row = rowsById.get(rowId)!;
    const fp = firstPassByRow.get(rowId) ?? null;
    const rowIdx = rowIndexById.get(rowId)!;

    // ---------------- the row unit
    ordinal += 1;
    const rowUnitId = `U${pad2(ordinal)}`;
    const rowSlotIds: string[] = [];
    for (const axisKey of ROW_AXIS_ORDER) {
      const letter = axisLetterOf(axisKey);
      const def = rowAxisDefs.get(letter);
      const { vocab, source } = vocabularyFor('ROW_AXIS', axisKey);
      const slotId = `ROW:${rowId}:${axisKey}`;
      rowSlotIds.push(slotId);
      slots.push({
        slotId,
        kind: 'ROW_AXIS',
        axisId: letter,
        axisName: def?.name ?? axisKey,
        question: def?.question ?? axisKey,
        allowedVocabulary: vocab,
        vocabularySource: source,
        countsTowardHeadlineTotal: true,
        structurallyPrefilled: false,
        prefilledReason: null,
        applicabilityNote: row.ADJUDICABLE === false
          ? String(row.notAdjudicableReason ?? '')
          : null,
        provenance: {
          rowId,
          factKey: null,
          declarationId: null,
          reviewUnitId: rowUnitId,
          derivedFrom: `verification/${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
          section200WorksheetSha256: evidence.worksheet200Sha256,
          section200Pointer: `/rows/${rowIdx}/verdicts/${axisKey}`,
        },
        verdict: null,
        attribution: null,
        recordedAt: null,
      });
    }

    units.push({
      unitId: rowUnitId,
      ordinal,
      kind: 'ROW_FIRST_PASS_BEHAVIOUR',
      rowId,
      factKey: null,
      declarationId: null,
      headline: `${rowId} — the row's whole first-pass response`,
      slotIds: rowSlotIds,
      headlineSlotCount: rowSlotIds.length,
      supplementarySlotCount: 0,
      evidence: rowEvidence(row, fp, null, null, truthProvenanceDisclosure),
    });

    // ---------------- one unit per projected fact, in the order §200 lists them
    for (const fact of factsByRow.get(rowId) ?? []) {
      ordinal += 1;
      const factUnitId = `U${pad2(ordinal)}`;
      const factIdx = fact.__section200Index as number;
      const factSlotIds: string[] = [];

      for (const axisKey of FACT_AXIS_ORDER) {
        const letter = axisLetterOf(axisKey);
        const def = factAxisDefs.get(letter);
        const { vocab, source } = vocabularyFor('FACT_AXIS', axisKey);
        const prefilledValue = fact.verdicts?.[axisKey];
        const isPrefilled = prefilledValue !== null && prefilledValue !== undefined;
        const slotId = `FACT:${fact.factKey}:${axisKey}`;
        factSlotIds.push(slotId);
        slots.push({
          slotId,
          kind: 'FACT_AXIS',
          axisId: axisKey === 'R_SAFETY_CLASSIFICATION' ? 'R' : letter,
          axisName: def?.name ?? axisKey,
          question: axisKey === 'R_SAFETY_CLASSIFICATION'
            ? 'How would you classify this fact\'s safety significance?'
            : (axisKey === 'R_PRIORITY_FLOOR_IMPACT'
              ? 'Does the projected priority floor of OTHER materially under-escalate this fact?'
              : (def?.question ?? axisKey)),
          allowedVocabulary: vocab,
          vocabularySource: source,
          countsTowardHeadlineTotal: true,
          structurallyPrefilled: isPrefilled,
          prefilledReason: isPrefilled ? String(fact.prefilledNotVerdicts ?? '') : null,
          applicabilityNote: null,
          provenance: {
            rowId,
            factKey: fact.factKey,
            declarationId: fact.declarationId,
            reviewUnitId: factUnitId,
            derivedFrom: `verification/${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
            section200WorksheetSha256: evidence.worksheet200Sha256,
            section200Pointer: `/facts/${factIdx}/verdicts/${axisKey}`,
          },
          verdict: isPrefilled ? String(prefilledValue) : null,
          attribution: null,
          recordedAt: null,
        });
      }

      for (const subKey of VERIFIER_SUB_AXIS_ORDER) {
        const { vocab, source } = vocabularyFor('FACT_VERIFIER_SUB_AXIS', subKey);
        const slotId = `FACT_VERIFIER_SUB_AXIS:${fact.factKey}:${subKey}`;
        factSlotIds.push(slotId);
        slots.push({
          slotId,
          kind: 'FACT_VERIFIER_SUB_AXIS',
          axisId: `SUB.${subKey}`,
          axisName: subKey,
          question: VERIFIER_SUB_AXIS_QUESTIONS[subKey],
          allowedVocabulary: vocab,
          vocabularySource: source,
          countsTowardHeadlineTotal: false,
          structurallyPrefilled: false,
          prefilledReason: null,
          applicabilityNote: subKey === 'CHALLENGE_REVIEWABILITY'
            ? CHALLENGE_REVIEWABILITY_APPLICABILITY : null,
          provenance: {
            rowId,
            factKey: fact.factKey,
            declarationId: fact.declarationId,
            reviewUnitId: factUnitId,
            derivedFrom: `verification/${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
            section200WorksheetSha256: evidence.worksheet200Sha256,
            section200Pointer: `/facts/${factIdx}/verifierSubAxes/${subKey}`,
          },
          verdict: null,
          attribution: null,
          recordedAt: null,
        });
      }

      units.push({
        unitId: factUnitId,
        ordinal,
        kind: 'PROJECTED_FACT',
        rowId,
        factKey: fact.factKey,
        declarationId: fact.declarationId,
        headline: `${rowId} — projected fact ${fact.factKey}`,
        slotIds: factSlotIds,
        headlineSlotCount: FACT_AXIS_ORDER.length,
        supplementarySlotCount: VERIFIER_SUB_AXIS_ORDER.length,
        evidence: rowEvidence(
          row, fp, fact, verifierByFactKey.get(fact.factKey) ?? null, truthProvenanceDisclosure),
      });
    }

    // ---------------- the refused-declaration unit, where one exists
    for (const refused of refusedByRow.get(rowId) ?? []) {
      ordinal += 1;
      const refUnitId = `U${pad2(ordinal)}`;
      const refIdx = refused.__section200Index as number;
      const refSlotIds: string[] = [];
      for (const axisKey of REFUSED_QUESTION_AXES) {
        const { vocab, source } = vocabularyFor('REFUSED_DECLARATION_QUESTION', axisKey);
        const slotId = `REFUSED:${rowId}:${refused.declarationId}:${axisKey}`;
        refSlotIds.push(slotId);
        slots.push({
          slotId,
          kind: 'REFUSED_DECLARATION_QUESTION',
          axisId: axisKey,
          axisName: axisKey,
          question: axisKey === 'STRUCTURAL_REFUSAL_CORRECTNESS'
            ? String(refused.twoSeparateQuestions?.structuralQuestion ?? '')
            : String(refused.twoSeparateQuestions?.semanticQuestion ?? ''),
          allowedVocabulary: vocab,
          vocabularySource: source,
          countsTowardHeadlineTotal: false,
          structurallyPrefilled: false,
          prefilledReason: null,
          applicabilityNote:
            '§200 requires these two to be answered SEPARATELY. A structurally malformed output can '
            + 'reveal semantic capability or semantic failure, and these must not be collapsed.',
          provenance: {
            rowId,
            factKey: null,
            declarationId: refused.declarationId,
            reviewUnitId: refUnitId,
            derivedFrom: `verification/${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
            section200WorksheetSha256: evidence.worksheet200Sha256,
            section200Pointer: `/refusedDeclarations/${refIdx}/twoSeparateQuestions/${axisKey}`,
          },
          verdict: null,
          attribution: null,
          recordedAt: null,
        });
      }

      units.push({
        unitId: refUnitId,
        ordinal,
        kind: 'REFUSED_DECLARATION',
        rowId,
        factKey: null,
        declarationId: refused.declarationId,
        headline: `${rowId} — refused declaration ${refused.declarationId}`,
        slotIds: refSlotIds,
        headlineSlotCount: 0,
        supplementarySlotCount: refSlotIds.length,
        evidence: refusedEvidence(row, fp, refused, truthProvenanceDisclosure),
      });
    }
  }

  return { units, slots };
}

function rowLevelFacts(row: any): ReviewUnitEvidence['rowFacts'] {
  return {
    provenance: row.provenance,
    section197Origin: row.section197Origin,
    capability: row.capability,
    families: row.families ?? [],
    pairedWith: row.pairedWith ?? null,
    isTransportCanary: Boolean(row.isTransportCanary),
    adjudicable: Boolean(row.ADJUDICABLE),
    notAdjudicableReason: row.notAdjudicableReason ?? null,
    governedRecordsShownToFirstPass: row.governedRecordsShownToFirstPass ?? [],
    governedSourceIdsShownToFirstPass: row.governedSourceIdsShownToFirstPass ?? [],
    deterministicFindingsShown: row.deterministicFindingsShown ?? [],
  };
}

function toolCallPayloadOf(fp: any): unknown {
  if (!fp) return null;
  if (fp.parsed !== null && fp.parsed !== undefined) return fp.parsed;
  return fp.raw ?? null;
}

function rowEvidence(
  row: any, fp: any, fact: any | null, verifierRecord: any | null,
  disclosure: readonly string[],
): ReviewUnitEvidence {
  return {
    observation: row.observation,
    inspectionContext: row.inspectionContext,
    rowFacts: rowLevelFacts(row),
    frozenExpectedIntent: {
      establishedByTheText: row.preregisteredEstablishedByTheText ?? [],
      notEstablishedByTheText: row.preregisteredNotEstablishedByTheText ?? [],
      expectedGapCount: row.preregisteredExpectedGapCount ?? null,
      expectedOwedFacts: fact
        ? (fact.allPreregisteredExpectationsForThisRow ?? [])
        : (row.preregisteredExpectedOwedFacts ?? []),
      designIntent: row.designIntent,
      nearestExpectation: fact ? (fact.nearestPreregisteredExpectation ?? null) : null,
      nearestExpectationNote: fact ? (fact.nearestExpectationNote ?? null) : null,
    },
    truthProvenanceDisclosure: disclosure,
    rawFirstPass: {
      reachedInference: Boolean(fp?.reachedInference),
      preInferenceFailure: Boolean(fp?.preInferenceFailure),
      httpStatus: fp?.httpStatus ?? null,
      providerErrorType: fp?.providerErrorType ?? null,
      providerErrorMessage: fp?.providerErrorMessage ?? null,
      respondedModel: fp?.respondedModel ?? null,
      stopReason: fp?.stopReason ?? null,
      outcome: fp?.outcome ?? row.modelOutcome ?? null,
      toolCallPayload: toolCallPayloadOf(fp),
    },
    declarations: fact ? [fact.declaration] : (row.rawDeclarations ?? []),
    admission: {
      admittedFactKeys: row.admittedFactKeys ?? [],
      rejectedDeclarations: row.rejectedDeclarations ?? [],
      refusalCodes: (row.rejectedDeclarations ?? [])
        .flatMap((d: any) => d.refusalCodes ?? d.codes ?? []),
      refusalDetail: (row.rejectedDeclarations ?? [])
        .flatMap((d: any) => d.refusalDetail ?? d.detail ?? []),
      verifierAdmissionAdmitted: fact ? (fact.verifier?.admissionAdmitted ?? null) : null,
      verifierAdmissionCodes: fact ? (fact.verifier?.admissionCodes ?? []) : [],
    },
    projectedOwedFact: fact ? fact.projectedOwedFact : null,
    whatTheVerifierActuallyReceived: fact ? fact.whatTheVerifierActuallyReceived : null,
    missingFactInDeclaration: fact ? (fact.missingFactInDeclaration ?? null) : null,
    missingFactCarriedIntoProjectedOwedFact: fact
      ? Boolean(fact.missingFactInProjectedOwedFact) : null,
    verifier: fact
      ? { ...fact.verifier, rawProviderRecord: verifierRecordSummary(verifierRecord) }
      : null,
    neutralObservations: fact ? (fact.neutralObservations ?? []) : (row.neutralObservations ?? []),
    neutralObservationCaveats: NEUTRAL_OBSERVATION_CAVEATS,
  };
}

function verifierRecordSummary(v: any): unknown {
  if (!v) return null;
  return {
    reachedInference: v.reachedInference,
    httpStatus: v.httpStatus,
    respondedModel: v.respondedModel,
    stopReason: v.stopReason,
    verifierInstructionVersion: v.verifierInstructionVersion,
    admissionContractVersion: v.admissionContractVersion,
    suppliedGovernedSourceIds: v.suppliedGovernedSourceIds ?? [],
    parsed: v.parsed ?? null,
    admission: v.admission ?? null,
  };
}

function refusedEvidence(
  row: any, fp: any, refused: any, disclosure: readonly string[],
): ReviewUnitEvidence {
  const base = rowEvidence(row, fp, null, null, disclosure);
  return {
    ...base,
    frozenExpectedIntent: {
      ...base.frozenExpectedIntent,
      expectedOwedFacts: refused.preregisteredExpectations ?? [],
    },
    declarations: [refused.declaration],
    admission: {
      admittedFactKeys: row.admittedFactKeys ?? [],
      rejectedDeclarations: row.rejectedDeclarations ?? [],
      refusalCodes: refused.refusalCodes ?? [],
      refusalDetail: refused.refusalDetail ?? [],
      verifierAdmissionAdmitted: null,
      verifierAdmissionCodes: [],
    },
    projectedOwedFact: null,
    whatTheVerifierActuallyReceived: null,
    verifier: null,
  };
}

// ---------------------------------------------------------------- the worksheet

export const OPEN_QUESTIONS_FOR_THE_PRODUCT_OWNER: readonly string[] = [
  'ROW-AXIS SLOTS ON SG-01 AND SG-02. §200 counts 4 open row-axis slots on each of the two rows that '
    + 'were rejected before inference, and those 8 slots are inside the frozen 128. The same §200 '
    + 'worksheet records notAdjudicableReason on both rows: "No model output exists. Every axis is '
    + 'NOT_EXERCISED and no semantic judgement is possible or permitted." §202 has carried the slots '
    + 'forward unfilled and unchanged rather than resolve the tension in either direction. Whether '
    + 'those 8 slots are answered NOT_EXERCISED, or excluded from the denominator, is a '
    + 'product-owner decision.',
  'THE 58 SUPPLEMENTARY FIELDS. §200 leaves 56 verifier sub-axis fields and 2 refused-declaration '
    + 'questions null, and its completeness block counts none of them in the 152. §202 carries all '
    + '58 as supplementary slots with their own counters so they are not silently dropped. Whether '
    + 'they are answered in this session is a product-owner decision.',
  'VOCABULARY FOR R_PRIORITY_FLOOR_IMPACT. §200 enumerates a scale for the safety classification '
    + 'half of axis R and none for the floor-impact half. §202 proposes three members and flags '
    + 'every slot that uses them as SECTION_202_PROPOSED. They require confirmation before use.',
  'VOCABULARY FOR THE 58 SUPPLEMENTARY FIELDS. §200 enumerates none. §202 applies the global §200 '
    + 'verdict vocabulary and flags the source. It requires confirmation before use.',
  'AXIS O. The §200 session states that "Axes N, O, S and T are NOT_EXERCISED for every fact". The '
    + '§200 worksheet defines no axis O, carries no O slot, and pre-fills exactly three axes per '
    + 'fact — N, S and T, giving the 24. §202 reproduces the worksheet, not the sentence.',
];

export function summariseUnit(
  unit: ReviewUnit, slots: readonly VerdictSlot[],
): ReviewUnitSummary {
  const mine = unit.slotIds
    .map(id => slots.find(s => s.slotId === id))
    .filter((s): s is VerdictSlot => Boolean(s));
  return {
    unitId: unit.unitId,
    ordinal: unit.ordinal,
    kind: unit.kind,
    rowId: unit.rowId,
    factKey: unit.factKey,
    declarationId: unit.declarationId,
    headline: unit.headline,
    slotIds: unit.slotIds,
    headlineSlotCount: unit.headlineSlotCount,
    supplementarySlotCount: unit.supplementarySlotCount,
    openSlotCount: mine.filter(s => !s.structurallyPrefilled).length,
    structurallyPrefilledSlotCount: mine.filter(s => s.structurallyPrefilled).length,
    evidenceIn:
      `verification/${SECTION_202_DIR}/ADJUDICATION-PRESENTATION-PACKET.md#${unit.unitId}`,
    truthSpecificationDefect: null,
    reviewerNotes: null,
    additiveAttribution: null,
  };
}

export type RecordAdditiveResult =
  | { readonly ok: true; readonly unit: ReviewUnitSummary }
  | { readonly ok: false; readonly refusalCode: string; readonly detail: string };

/**
 * Records an ADDITIVE finding on a review unit: a TRUTH_SPECIFICATION_DEFECT, or a free-text note.
 * It is not a verdict, it never replaces one, and it carries the same attribution requirement — the
 * product owner is the sole source of both.
 */
export function recordAdditive(
  worksheet: Worksheet202,
  unitId: string,
  field: AdditiveField,
  text: string,
  attribution: string,
): RecordAdditiveResult {
  if (attribution !== PRODUCT_OWNER_ATTRIBUTION) {
    return {
      ok: false,
      refusalCode: 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
      detail: `attribution must be exactly "${PRODUCT_OWNER_ATTRIBUTION}"; received `
        + `${JSON.stringify(attribution)}.`,
    };
  }
  if (!ADDITIVE_FIELDS.includes(field)) {
    return {
      ok: false,
      refusalCode: 'UNKNOWN_ADDITIVE_FIELD',
      detail: `${JSON.stringify(field)} is not one of [${ADDITIVE_FIELDS.join(', ')}]`,
    };
  }
  const unit = worksheet.reviewUnits.find(u => u.unitId === unitId);
  if (!unit) {
    return { ok: false, refusalCode: 'UNKNOWN_REVIEW_UNIT', detail: `no unit with id ${unitId}` };
  }
  unit[field] = text;
  unit.additiveAttribution = PRODUCT_OWNER_ATTRIBUTION;
  return { ok: true, unit };
}

export function buildWorksheet202(evidence: FrozenEvidence, built: BuildResult): Worksheet202 {
  const headline = built.slots.filter(s => s.countsTowardHeadlineTotal);
  const supplementary = built.slots.filter(s => !s.countsTowardHeadlineTotal);
  const prefilled = headline.filter(s => s.structurallyPrefilled);
  const open = headline.filter(s => !s.structurallyPrefilled);

  return {
    artifact: 'SECTION_202_ADJUDICATION_WORKSHEET',
    status: 'PENDING_PRODUCT_OWNER_ADJUDICATION',
    groupingVersion: SECTION_202_GROUPING_VERSION,
    writtenBy:
      'the §202 adjudication-session builder. EVERY OPEN SLOT IS NULL AND THIS MODEL FILLED NONE. '
      + 'The only non-null verdicts are the 24 structurally pre-filled NOT_EXERCISED values carried '
      + 'forward verbatim from §200.',
    semanticOracle:
      'THE PRODUCT OWNER, SOLELY. recordVerdict refuses every attribution other than PRODUCT_OWNER, '
      + 'so no model-authored verdict is representable in this worksheet.',
    derivedFrom: {
      section200Worksheet: `verification/${SECTION_200_DIR}/ADJUDICATION-WORKSHEET.json`,
      section200WorksheetSha256: evidence.worksheet200Sha256,
      section200Session: `verification/${SECTION_200_DIR}/ADJUDICATION-SESSION.md`,
      section200SessionSha256: evidence.session200Sha256,
      section199RawFirstPass: `verification/${SECTION_199_DIR}/RAW-FIRST-PASS-OUTPUTS.jsonl`,
      section199RawFirstPassSha256: evidence.firstPass199Sha256,
      section199RawVerifier: `verification/${SECTION_199_DIR}/RAW-VERIFIER-OUTPUTS.jsonl`,
      section199RawVerifierSha256: evidence.verifier199Sha256,
      section199PreregistrationSha256: String(evidence.worksheet200.section199PreregistrationSha256),
    },
    truthProvenance: evidence.worksheet200.TRUTH_PROVENANCE,
    reviewUnits: built.units.map(u => summariseUnit(u, built.slots)),
    slots: built.slots.map(s => ({ ...s })),
    completeness: {
      totalSlots: headline.length,
      structurallyPrefilled: prefilled.length,
      genuinelyOpen: open.length,
      supplied: 0,
      remaining: open.length,
      headlineDerivation:
        '12 rows x 4 row axes = 48, plus 8 projected facts x 13 fact axes = 104, total 152. '
        + '24 of the 104 are the governed axes N, S and T pre-filled NOT_EXERCISED. '
        + '48 + 80 = 128 genuinely open. This is §200\'s arithmetic, reproduced, not recomputed '
        + 'differently.',
      supplementaryTotalSlots: supplementary.length,
      supplementarySupplied: 0,
      supplementaryRemaining: supplementary.length,
      supplementaryNote:
        '56 verifier sub-axis fields plus 2 refused-declaration questions. §200 leaves all 58 null '
        + 'and counts none of them in its 152. They are carried here so they are not lost, and '
        + 'counted separately so the frozen 152/24/128 split is preserved exactly.',
    },
    openQuestionsForTheProductOwner: OPEN_QUESTIONS_FOR_THE_PRODUCT_OWNER,
  };
}

// ---------------------------------------------------------------- recording a verdict

export interface RecordVerdictOptions {
  /** an ISO timestamp supplied by the caller; the module never reads a clock */
  readonly recordedAt?: string;
  /** an explicit acknowledgement that an already-supplied verdict is being changed */
  readonly revision?: boolean;
}

export type RecordVerdictResult =
  | { readonly ok: true; readonly slot: VerdictSlot; readonly changed: boolean }
  | { readonly ok: false; readonly refusalCode: VerdictRefusalCode; readonly detail: string };

/**
 * THE ONLY WAY A VERDICT ENTERS THE §202 WORKSHEET.
 *
 * It refuses a structurally pre-filled slot, refuses any value outside that slot's allowed
 * vocabulary, refuses any attribution other than PRODUCT_OWNER, and stores the supplied string
 * EXACTLY as given — no trimming, no case folding, no aliasing. Re-supplying the identical verdict
 * is a no-op that succeeds; supplying a different one requires `revision: true`.
 */
export function recordVerdict(
  worksheet: Worksheet202,
  slotId: string,
  verdict: string,
  attribution: string,
  options: RecordVerdictOptions = {},
): RecordVerdictResult {
  if (attribution !== PRODUCT_OWNER_ATTRIBUTION) {
    return {
      ok: false,
      refusalCode: 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
      detail:
        `attribution must be exactly "${PRODUCT_OWNER_ATTRIBUTION}"; received `
        + `${JSON.stringify(attribution)}. The product owner is the sole semantic oracle and no `
        + 'model-authored verdict is representable.',
    };
  }

  const slot = worksheet.slots.find(s => s.slotId === slotId);
  if (!slot) {
    return { ok: false, refusalCode: 'UNKNOWN_SLOT', detail: `no slot with id ${slotId}` };
  }

  if (slot.structurallyPrefilled) {
    return {
      ok: false,
      refusalCode: 'STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE',
      detail:
        `${slotId} carries the structurally pre-filled value ${JSON.stringify(slot.verdict)}. `
        + 'The product owner ruled these legitimate execution-reality states; they are carried '
        + 'forward unchanged and are never presented as open.',
    };
  }

  if (!slot.allowedVocabulary.includes(verdict)) {
    return {
      ok: false,
      refusalCode: 'VALUE_NOT_IN_ALLOWED_VOCABULARY',
      detail:
        `${JSON.stringify(verdict)} is not a member of the allowed vocabulary for ${slotId}: `
        + `[${slot.allowedVocabulary.join(', ')}]. The comparison is exact — no trimming, no case `
        + 'folding, no aliasing.',
    };
  }

  if (slot.verdict !== null && slot.verdict !== verdict && options.revision !== true) {
    return {
      ok: false,
      refusalCode: 'CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG',
      detail:
        `${slotId} already carries ${JSON.stringify(slot.verdict)}. Supplying a different verdict `
        + 'requires an explicit revision, so that a change of answer is a deliberate act and never '
        + 'a silent overwrite.',
    };
  }

  const changed = slot.verdict !== verdict;
  slot.verdict = verdict;
  slot.attribution = PRODUCT_OWNER_ATTRIBUTION;
  slot.recordedAt = options.recordedAt ?? slot.recordedAt ?? null;
  recountCompleteness(worksheet);
  return { ok: true, slot, changed };
}

export function recountCompleteness(worksheet: Worksheet202): void {
  const headline = worksheet.slots.filter(s => s.countsTowardHeadlineTotal);
  const supplementary = worksheet.slots.filter(s => !s.countsTowardHeadlineTotal);
  const open = headline.filter(s => !s.structurallyPrefilled);
  const suppliedHeadline = open.filter(s => s.verdict !== null).length;
  const suppliedSupplementary = supplementary.filter(s => s.verdict !== null).length;
  worksheet.completeness.totalSlots = headline.length;
  worksheet.completeness.structurallyPrefilled =
    headline.filter(s => s.structurallyPrefilled).length;
  worksheet.completeness.genuinelyOpen = open.length;
  worksheet.completeness.supplied = suppliedHeadline;
  worksheet.completeness.remaining = open.length - suppliedHeadline;
  worksheet.completeness.supplementaryTotalSlots = supplementary.length;
  worksheet.completeness.supplementarySupplied = suppliedSupplementary;
  worksheet.completeness.supplementaryRemaining = supplementary.length - suppliedSupplementary;
  worksheet.status = worksheet.completeness.remaining === 0
    ? 'PRODUCT_OWNER_ADJUDICATION_COMPLETE_ON_THE_152'
    : 'PENDING_PRODUCT_OWNER_ADJUDICATION';
}

// ---------------------------------------------------------------- rendering

const fence = (label: string, value: unknown): string =>
  `\`\`\`json\n${label ? `// ${label}\n` : ''}${JSON.stringify(value, null, 2)}\n\`\`\``;

const bullets = (xs: readonly string[]): string =>
  xs.length === 0 ? '_(none)_' : xs.map(x => `- ${x}`).join('\n');

export function renderReviewUnit(unit: ReviewUnit, slots: readonly VerdictSlot[]): string {
  const e = unit.evidence;
  const mine = unit.slotIds
    .map(id => slots.find(s => s.slotId === id))
    .filter((s): s is VerdictSlot => Boolean(s));
  const open = mine.filter(s => !s.structurallyPrefilled);
  const prefilled = mine.filter(s => s.structurallyPrefilled);

  const out: string[] = [];
  out.push(`## ${unit.unitId} · ${unit.headline}`);
  out.push('');
  out.push(`**Unit kind:** \`${unit.kind}\` · **row** \`${unit.rowId}\``
    + (unit.factKey ? ` · **factKey** \`${unit.factKey}\`` : '')
    + (unit.declarationId ? ` · **declarationId** \`${unit.declarationId}\`` : ''));
  out.push(`**Questions in this unit:** ${open.length} open`
    + (prefilled.length > 0
      ? `, ${prefilled.length} structurally pre-filled and carried forward unchanged` : '')
    + ` · ${unit.headlineSlotCount} count toward the 152`
    + (unit.supplementarySlotCount > 0
      ? `, ${unit.supplementarySlotCount} supplementary` : ''));
  out.push('');

  // 1 -- the observation
  out.push('### 1. The observation, as the model received it');
  out.push('');
  out.push('> ' + e.observation.replace(/\n/g, '\n> '));
  out.push('');
  out.push(fence('inspection context', e.inspectionContext));
  out.push('');
  out.push(fence('row facts', e.rowFacts));
  out.push('');

  // 2 -- the frozen expected semantic intent
  out.push('### 2. The frozen expected semantic intent (preregistered)');
  out.push('');
  out.push('**Preregistered as ESTABLISHED by the text:**');
  out.push(bullets(e.frozenExpectedIntent.establishedByTheText));
  out.push('');
  out.push('**Preregistered as NOT ESTABLISHED by the text:**');
  out.push(bullets(e.frozenExpectedIntent.notEstablishedByTheText));
  out.push('');
  out.push(fence('preregistered expected gap count', e.frozenExpectedIntent.expectedGapCount));
  out.push('');
  out.push(fence('preregistered expected owed facts', e.frozenExpectedIntent.expectedOwedFacts));
  out.push('');
  out.push(`**Preregistered design intent:** ${e.frozenExpectedIntent.designIntent}`);
  if (e.frozenExpectedIntent.nearestExpectation) {
    out.push('');
    out.push(fence(
      'the single expectation §200 pointed at for this fact',
      e.frozenExpectedIntent.nearestExpectation));
    out.push('');
    out.push(`**§200's own caveat on that pointer:** ${e.frozenExpectedIntent.nearestExpectationNote}`);
  }
  out.push('');

  // 3 -- the disclosure, on EVERY unit
  out.push('### 3. Truth-specification provenance — read this in every unit');
  out.push('');
  out.push(bullets(e.truthProvenanceDisclosure));
  out.push('');

  // 4 -- the raw first-pass response
  out.push('### 4. The raw first-pass response');
  out.push('');
  out.push(fence('transport and provider state', {
    reachedInference: e.rawFirstPass.reachedInference,
    preInferenceFailure: e.rawFirstPass.preInferenceFailure,
    httpStatus: e.rawFirstPass.httpStatus,
    providerErrorType: e.rawFirstPass.providerErrorType,
    providerErrorMessage: e.rawFirstPass.providerErrorMessage,
    respondedModel: e.rawFirstPass.respondedModel,
    stopReason: e.rawFirstPass.stopReason,
    outcome: e.rawFirstPass.outcome,
  }));
  out.push('');
  out.push(fence(
    e.rawFirstPass.reachedInference
      ? 'the verbatim tool-call payload the provider returned'
      : 'no tool-call payload exists for this row; the provider record is shown instead',
    e.rawFirstPass.toolCallPayload));
  out.push('');

  // 5 -- the declarations
  out.push('### 5. The declaration(s)');
  out.push('');
  out.push(fence(
    unit.kind === 'PROJECTED_FACT'
      ? 'the declaration this unit reviews'
      : 'every declaration this row emitted',
    e.declarations));
  out.push('');

  // 6 -- admission / refusal
  out.push('### 6. Admission and refusal');
  out.push('');
  out.push(fence('admission and refusal record', e.admission));
  out.push('');

  // 7 -- projected owed fact
  out.push('### 7. The projected OwedFact');
  out.push('');
  if (e.projectedOwedFact) {
    out.push(fence('the projected OwedFact', e.projectedOwedFact));
    out.push('');
    out.push(fence(
      'exactly what the verifier received — this object carries no missingFact field',
      e.whatTheVerifierActuallyReceived));
    out.push('');
    out.push('**The field pair axis Q measures:**');
    out.push('');
    out.push(`- \`missingFact\` in the declaration: ${JSON.stringify(e.missingFactInDeclaration)}`);
    out.push(`- \`missingFact\` present in the projected OwedFact: `
      + `${JSON.stringify(e.missingFactCarriedIntoProjectedOwedFact)}`);
  } else {
    out.push('_No OwedFact was projected for this unit._');
  }
  out.push('');

  // 8 -- verifier output
  out.push('### 8. Verifier v3.3 output');
  out.push('');
  out.push(e.verifier
    ? fence('the verifier record for this fact', e.verifier)
    : '_No verifier call exists for this unit; no OwedFact was projected._');
  out.push('');

  // 9 -- neutral deterministic observations
  out.push('### 9. Neutral deterministic observations');
  out.push('');
  out.push(bullets(e.neutralObservationCaveats));
  out.push('');
  if (e.neutralObservations.length === 0) {
    out.push('_No deterministic comparison was recorded for this unit._');
  } else {
    for (const o of e.neutralObservations as any[]) {
      out.push(`- **${o.what}**`);
      out.push(`  - compared: ${o.compared}`);
      out.push(`  - finding: ${o.finding}`);
      out.push(`  - isAVerdict: ${JSON.stringify(o.isAVerdict)}`);
    }
  }
  out.push('');

  // 10 -- the questions
  out.push('### 10. The questions to be answered in this unit');
  out.push('');
  if (prefilled.length > 0) {
    out.push('**Carried forward unchanged and NOT open for judgement:**');
    out.push('');
    for (const s of prefilled) {
      out.push(`- \`${s.slotId}\` — axis ${s.axisId} ${s.axisName} — value \`${s.verdict}\``);
    }
    out.push('');
    out.push(`_${prefilled[0].prefilledReason}_`);
    out.push('');
  }
  let n = 0;
  for (const s of open) {
    n += 1;
    out.push(`**Q${n}. Axis ${s.axisId} — ${s.axisName}**`);
    out.push('');
    out.push(`> ${s.question}`);
    out.push('');
    out.push(`- slot id: \`${s.slotId}\``);
    out.push(`- allowed answers: ${s.allowedVocabulary.map(v => `\`${v}\``).join(' · ')}`);
    out.push(`- vocabulary source: \`${s.vocabularySource}\``);
    out.push(`- counts toward the 152: ${s.countsTowardHeadlineTotal ? 'yes' : 'no — supplementary'}`);
    if (s.applicabilityNote) out.push(`- note carried from §200: ${s.applicabilityNote}`);
    out.push('');
  }
  out.push('**Additive, not a verdict.** A `TRUTH_SPECIFICATION_DEFECT` for this unit, and any '
    + 'free-text note, are recorded with '
    + `\`recordAdditive(worksheet, "${unit.unitId}", "truthSpecificationDefect" | "reviewerNotes", `
    + 'text, "PRODUCT_OWNER")\` — alongside the verdicts, never in place of one, and never by '
    + 'rewriting the frozen preregistration.');
  out.push('');
  out.push('---');
  out.push('');
  return out.join('\n');
}

export function renderAxisReference(worksheet200: any): string {
  const out: string[] = [];
  out.push('## Axis reference — every axis, as §200 froze it');
  out.push('');
  out.push('Reproduced verbatim. Each axis states what would justify each outcome and what must not '
    + 'influence the answer.');
  out.push('');
  out.push('### Row-level axes');
  out.push('');
  for (const a of worksheet200.rowAxes as any[]) {
    out.push(`#### ${a.id} — ${a.name}`);
    out.push('');
    out.push(`- **question:** ${a.question}`);
    if (a.whatBearsOnIt) out.push(`- **what bears on it:** ${a.whatBearsOnIt}`);
    if (a.correctWhen) out.push(`- **CORRECT when:** ${a.correctWhen}`);
    if (a.partialWhen) out.push(`- **PARTIALLY_CORRECT when:** ${a.partialWhen}`);
    if (a.incorrectWhen) out.push(`- **INCORRECT when:** ${a.incorrectWhen}`);
    if (a.mustNotInfluence) out.push(`- **must not influence:** ${a.mustNotInfluence}`);
    out.push('');
  }
  out.push('### Fact-level axes');
  out.push('');
  for (const a of worksheet200.factAxes as any[]) {
    out.push(`#### ${a.id} — ${a.name}`);
    out.push('');
    out.push(`- **question:** ${a.question}`);
    if (a.correctWhen) out.push(`- **CORRECT when:** ${a.correctWhen}`);
    if (a.partialWhen) out.push(`- **PARTIALLY_CORRECT when:** ${a.partialWhen}`);
    if (a.incorrectWhen) out.push(`- **INCORRECT when:** ${a.incorrectWhen}`);
    if (a.scale) out.push(`- **scale:** ${(a.scale as string[]).map(s => `\`${s}\``).join(' · ')}`);
    if (a.method) out.push(`- **method:** ${a.method}`);
    if (a.mustNotInfluence) out.push(`- **must not influence:** ${a.mustNotInfluence}`);
    out.push('');
  }
  return out.join('\n');
}

export const UNIT_ORDER_RULE =
  'Rows are ordered by ascending rowId, except that a row named as an earlier row\'s matched '
  + 'partner is placed immediately after that row, because §199\'s matched-pair design requires the '
  + 'pair to be read together. Within a row: the row unit first, then one unit per projected fact in '
  + 'the order §200 lists them, then any refused-declaration unit. THE ORDER IS MECHANICAL AND '
  + 'CARRIES NO INFORMATION ABOUT ANY UNIT\'S CONTENT.';

export function renderPresentationPacket(
  worksheet: Worksheet202, units: readonly ReviewUnit[], worksheet200: any,
): string {
  const out: string[] = [];
  const c = worksheet.completeness;

  out.push('# §202 — the adjudication presentation packet');
  out.push('');
  out.push('**Zero provider calls. Zero database operations. No §199 row re-run. No §195–§201 '
    + 'evidence modified.**');
  out.push('');
  out.push('## What this document is');
  out.push('');
  out.push('This is the material to be read to the product owner, one review unit at a time. Each '
    + 'unit is self-contained: it repeats the observation, the frozen expectation, the provenance '
    + 'disclosure and every model output it bears on, so no unit requires a previous one to be held '
    + 'in mind.');
  out.push('');
  out.push('**No verdict in this packet is filled, suggested, ranked or implied.** The product owner '
    + 'is the sole semantic oracle. The builder that produced this file cannot represent a '
    + 'model-authored verdict: `recordVerdict` refuses every attribution other than `PRODUCT_OWNER`.');
  out.push('');
  out.push('**The neutrality rule this document is written under.** A deterministic observation is a '
    + 'byte or set comparison whose answer is not in dispute, and it is stated as the comparison, '
    + 'never as its implication. "The span is not inside any acceptable region" is a fact; '
    + '"therefore D is INCORRECT" is a verdict, and no line in this packet draws it.');
  out.push('');
  out.push('## The counts');
  out.push('');
  out.push('| | count |');
  out.push('|---|---|');
  out.push(`| total slots | **${c.totalSlots}** |`);
  out.push(`| structurally pre-filled (carried forward unchanged) | **${c.structurallyPrefilled}** |`);
  out.push(`| genuinely open | **${c.genuinelyOpen}** |`);
  out.push(`| supplied | **${c.supplied}** |`);
  out.push(`| remaining | **${c.remaining}** |`);
  out.push(`| supplementary slots, counted separately | ${c.supplementaryTotalSlots} |`);
  out.push('');
  out.push(`_${c.headlineDerivation}_`);
  out.push('');
  out.push(`_${c.supplementaryNote}_`);
  out.push('');
  out.push('**The 24 pre-filled slots are axes N, S and T on the eight projected facts, all '
    + '`NOT_EXERCISED`.** The governed capability was never present on a row that reached inference. '
    + 'That is a statement about the run, not about the model. They are carried forward unchanged, '
    + 'they are never presented as open, and the recording function refuses to write into them.');
  out.push('');
  out.push('## Ordering');
  out.push('');
  out.push(UNIT_ORDER_RULE);
  out.push('');
  out.push('## Unit index');
  out.push('');
  out.push('| unit | kind | row | open questions | of which count toward the 152 |');
  out.push('|---|---|---|---|---|');
  for (const u of worksheet.reviewUnits) {
    const mine = u.slotIds.map(id => worksheet.slots.find(s => s.slotId === id)!);
    const openCount = mine.filter(s => !s.structurallyPrefilled).length;
    const headlineOpen = mine.filter(s => !s.structurallyPrefilled && s.countsTowardHeadlineTotal)
      .length;
    out.push(`| \`${u.unitId}\` | ${u.kind} | \`${u.rowId}\` | ${openCount} | ${headlineOpen} |`);
  }
  out.push('');
  out.push('## Questions that are for the product owner and are not settled here');
  out.push('');
  out.push(bullets(worksheet.openQuestionsForTheProductOwner));
  out.push('');
  out.push('---');
  out.push('');
  out.push('# The review units');
  out.push('');
  for (const u of units) out.push(renderReviewUnit(u, worksheet.slots));
  out.push(renderAxisReference(worksheet200));
  out.push('');
  out.push('---');
  out.push('');
  out.push('## Provenance of every byte in this packet');
  out.push('');
  out.push(fence('frozen sources', worksheet.derivedFrom));
  out.push('');
  out.push(`Built by \`${SECTION_202_GROUPING_VERSION}\`.`);
  out.push('');
  return out.join('\n');
}

export function renderSessionDocument(worksheet: Worksheet202): string {
  const c = worksheet.completeness;
  const out: string[] = [];
  out.push('# §202 — the adjudication session');
  out.push('');
  out.push('**Zero provider calls. Zero database operations. No §199 row re-run. No §195–§201 '
    + 'evidence modified.**');
  out.push('');
  out.push('## Read this first');
  out.push('');
  out.push('§200 built a worksheet with 152 slots and left every semantic verdict null, on the '
    + 'standing rule that a verdict supplied by the evaluated component makes it its own examiner. '
    + 'That rule is unchanged here. What §202 adds is the machinery: the same evidence regrouped '
    + 'into self-contained review units so the verdicts can be supplied out loud, and a recording '
    + 'function that is the only way a verdict enters the worksheet.');
  out.push('');
  out.push('**No model may supply a verdict, and in this worksheet none can.** `recordVerdict` '
    + 'requires `attribution === "PRODUCT_OWNER"` and refuses every other value. There is no second '
    + 'entry point and no flag that relaxes it.');
  out.push('');
  out.push('## The counts, unchanged from §200');
  out.push('');
  out.push('| | count |');
  out.push('|---|---|');
  out.push(`| total slots | **${c.totalSlots}** |`);
  out.push(`| structurally pre-filled | **${c.structurallyPrefilled}** |`);
  out.push(`| genuinely open | **${c.genuinelyOpen}** |`);
  out.push(`| supplied | **${c.supplied}** |`);
  out.push(`| remaining | **${c.remaining}** |`);
  out.push('');
  out.push(`${c.headlineDerivation}`);
  out.push('');
  out.push(`${c.supplementaryNote}`);
  out.push('');
  out.push('## How the session runs');
  out.push('');
  out.push('1. The orchestrator reads one review unit from `ADJUDICATION-PRESENTATION-PACKET.md` — '
    + 'the observation, the frozen expectation, the provenance disclosure, the raw model output, '
    + 'the declarations, admission or refusal, the projected fact, the verifier output and the '
    + 'neutral observations — and then the unit\'s questions with their allowed answers.');
  out.push('2. The product owner answers each question. The orchestrator may explain any axis in as '
    + 'much depth as is wanted. It does not choose a verdict, suggest one, or nudge toward one, '
    + 'including if asked what it thinks the answer is.');
  out.push('3. The orchestrator records each answer with '
    + '`recordVerdict(worksheet, slotId, verdict, "PRODUCT_OWNER")`. The supplied string is stored '
    + 'verbatim. A value outside the slot\'s vocabulary is refused rather than coerced.');
  out.push('4. A `TRUTH_SPECIFICATION_DEFECT` is recorded ADDITIVELY on the unit with '
    + '`recordAdditive(worksheet, unitId, "truthSpecificationDefect", text, "PRODUCT_OWNER")`. It '
    + 'is not a member of any slot vocabulary and never replaces a verdict. The frozen '
    + 'preregistration is never rewritten, and the model is not forced to fail against bad truth.');
  out.push('');
  out.push('## What the recording function refuses');
  out.push('');
  out.push('| refusal | when |');
  out.push('|---|---|');
  out.push('| `ATTRIBUTION_MUST_BE_PRODUCT_OWNER` | any attribution other than the exact string '
    + '`PRODUCT_OWNER` |');
  out.push('| `STRUCTURALLY_PREFILLED_SLOT_IS_NOT_WRITABLE` | any of the 24 carried-forward '
    + '`NOT_EXERCISED` slots |');
  out.push('| `VALUE_NOT_IN_ALLOWED_VOCABULARY` | any string not exactly in that slot\'s vocabulary '
    + '— no trimming, no case folding, no aliasing |');
  out.push('| `UNKNOWN_SLOT` | a slot id that does not exist |');
  out.push('| `CONFLICTING_REVISION_REQUIRES_EXPLICIT_REVISION_FLAG` | a different verdict over an '
    + 'already-supplied one, without an explicit revision |');
  out.push('');
  out.push('Re-supplying the identical verdict for the same slot succeeds and changes nothing, so a '
    + 'session that is interrupted and resumed cannot double-count or corrupt an answer.');
  out.push('');
  out.push('## Review units');
  out.push('');
  out.push(UNIT_ORDER_RULE);
  out.push('');
  out.push('| unit | kind | row | factKey / declarationId | open questions |');
  out.push('|---|---|---|---|---|');
  for (const u of worksheet.reviewUnits) {
    const mine = u.slotIds.map(id => worksheet.slots.find(s => s.slotId === id)!);
    const openCount = mine.filter(s => !s.structurallyPrefilled).length;
    const target = u.factKey ?? u.declarationId ?? '—';
    out.push(`| \`${u.unitId}\` | ${u.kind} | \`${u.rowId}\` | \`${target}\` | ${openCount} |`);
  }
  out.push('');
  out.push('## Questions that belong to the product owner and are not settled here');
  out.push('');
  out.push(bullets(worksheet.openQuestionsForTheProductOwner));
  out.push('');
  out.push('## Files');
  out.push('');
  out.push('- `ADJUDICATION-PRESENTATION-PACKET.md` — the read-aloud material, one review unit at a '
    + 'time.');
  out.push('- `ADJUDICATION-WORKSHEET-202.json` — every slot with its axis, question, allowed '
    + 'vocabulary and provenance; open slots null, the 24 structural slots carried forward.');
  out.push('- `backend/scripts/lib/expert-202-adjudication-grouping.ts` — the grouping and the '
    + 'recording function.');
  out.push('- `backend/scripts/build-202-adjudication-session.ts` — the deterministic builder.');
  out.push('- `backend/scripts/test-202-adjudication-grouping.ts` — the proof suite.');
  out.push('');
  out.push(fence('frozen sources', worksheet.derivedFrom));
  out.push('');
  out.push(`Built by \`${SECTION_202_GROUPING_VERSION}\`.`);
  out.push('');
  return out.join('\n');
}

// ---------------------------------------------------------------- one-call assembly

export interface Section202Artifacts {
  readonly worksheet: Worksheet202;
  readonly packetMarkdown: string;
  readonly sessionMarkdown: string;
  readonly units: readonly ReviewUnit[];
}

export function buildSection202(repoRoot: string): Section202Artifacts {
  const evidence = loadFrozenEvidence(repoRoot);
  const built = buildReviewUnitsAndSlots(evidence);
  const worksheet = buildWorksheet202(evidence, built);
  return {
    worksheet,
    packetMarkdown: renderPresentationPacket(worksheet, built.units, evidence.worksheet200),
    sessionMarkdown: renderSessionDocument(worksheet),
    units: built.units,
  };
}
