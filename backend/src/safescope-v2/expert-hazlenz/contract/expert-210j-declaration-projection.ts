/**
 * §210J -- PROJECTION AND VERIFIER-FACING CARRIAGE FOR THE UNRESOLVED OPERATIONAL CONSEQUENCE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== WHY THIS IS A WRAPPER AND NOT AN EDIT ====================
 *
 * `expert-first-pass-owed-fact-projection.ts` is FROZEN_BY_RECORDED_EVIDENCE: its sha256 is
 * recorded inside §196/§197/§198 evidence and two verify scripts assert a byte-level property of
 * it. `owed-fact.types.ts` and `verifier-v3-development-boundary.ts` are sha256-PINNED by §187 and
 * re-asserted by verify-188..199. None of the three is edited here.
 *
 * So the frozen projection is CALLED UNCHANGED and this module adds a layer above it. The base
 * projection does not reject unknown declaration keys, so a §210J declaration passes through it
 * intact and the added field is simply invisible to it -- which is exactly the property that makes
 * a wrapper sufficient.
 *
 * ==================== FAILING CLOSED THROUGH THE EXISTING RR-7 ARCHITECTURE ====================
 *
 * A declaration missing or fillering the new field must fail closed, and §210J was instructed to do
 * that through the existing contract-incompleteness / RR-7 machinery rather than a new mechanism.
 *
 * It does, and NO NEW REFUSAL CODE WAS INTRODUCED. The two failures map exactly onto codes that
 * already exist and are already members of `CONTRACT_INCOMPLETENESS_CODES`:
 *
 *     absent or blank   ->  REQUIRED_FIELD_MISSING
 *     whole-field filler ->  NON_SEMANTIC_PLACEHOLDER_VALUE
 *
 * `preserveIdentifiedSafetyFacts` therefore treats a §210J-incomplete declaration EXACTLY as it
 * treats the §204 SF-05 shape: the identified property is preserved as a
 * STRUCTURALLY_INVALID_DECLARATION that is not admissible, not settleable and cannot close the
 * analysis, `safetyStateComplete` goes false, and nothing is repaired or invented. Reusing the
 * codes rather than adding members is what lets §205 stay untouched.
 *
 * The one thing §205 cannot know about is the NAME of the field it is missing -- its
 * `absentRequiredFields` is computed over the eleven legacy fields. `preserve210j` adds that name
 * beside the §205 record rather than editing §205 to know about a successor field.
 *
 * ==================== THE UNRESOLVED ACTION REACHES THE VERIFIER EXPLICITLY ====================
 *
 * `OwedFact` has no field for it and cannot gain one without breaking a pin, so the carriage is the
 * §210B-1 O4-equivalent sidecar: a byte-exact copy, keyed by the computed `factKey`, travelling
 * beside the pinned projection rather than rewriting it. `buildVerifier210jView` assembles the
 * seven slots the §210J verifier-facing contract names. Every semantic string is COPIED. Nothing is
 * summarised, parsed, normalised, regenerated or inferred when absent.
 */

import {
  type OwedFact,
} from '../owed-facts/owed-fact.types';
import {
  type ProjectedOwedFact, projectOwedFact,
} from '../owed-facts/verifier-v3-development-boundary';
import {
  type DeclarationProjection, type ProjectionInput, type ProjectionRefusalCode,
  type ProjectionResult,
  projectDeclaredOwedFacts,
} from './expert-first-pass-owed-fact-projection';
import {
  type DeclarationPreservationResult, CONTRACT_INCOMPLETENESS_CODES,
  preserveIdentifiedSafetyFacts,
} from './expert-205-declaration-preservation';
import { explicitOwedProperty } from './section-210b-verifier-payload';
import {
  type UnresolvedActionCode, UNRESOLVED_ACTION_FIELD, checkUnresolvedAction, declarationFormat,
} from './expert-210j-first-pass-contract';

export const PROJECTION_210J_VERSION =
  'hazlenz.expert.210j.declaration-projection.v1' as const;

/**
 * The mapping from a §210J field failure onto the code the existing architecture already uses.
 * Held as data so the suite asserts the reuse instead of trusting this comment.
 */
export const UNRESOLVED_ACTION_CODE_MAP: Readonly<Record<UnresolvedActionCode, ProjectionRefusalCode>> = {
  UNRESOLVED_ACTION_MISSING: 'REQUIRED_FIELD_MISSING',
  UNRESOLVED_ACTION_PLACEHOLDER: 'NON_SEMANTIC_PLACEHOLDER_VALUE',
};

/** No new refusal code was introduced. Asserted by the suite against the closed base vocabulary. */
export const NEW_REFUSAL_CODES_INTRODUCED: readonly string[] = [];

/** The sidecar. Byte-exact, append-only, and never a stand-in when the model authored nothing. */
export const UNRESOLVED_ACTION_CARRIAGE = {
  choice: 'O4_EQUIVALENT_SIDECAR',
  why: 'OwedFact cannot carry the field: owed-fact.types.ts is sha256-pinned by §187 and '
    + 'verifier-v3-development-boundary.ts with it. A sidecar is the narrowest explicit '
    + 'verifier-facing representation that adds the consequence without touching a frozen contract, '
    + 'and it is the representation §210B-1 already established for the owed property.',
  source: `unresolvedFactDeclarations[].${UNRESOLVED_ACTION_FIELD}, model-authored`,
  transform: 'NONE — byte-exact copy',
  deterministicCodeMayNot: [
    'rewrite it', 'summarise it', 'parse it', 'normalise it', 'regenerate it',
    'infer it when absent', 'compare it against decisionIfB',
  ],
} as const;

// ---------------------------------------------------------------- the projection successor

export interface Declaration210JProjection extends DeclarationProjection {
  /** Which format the declaration arrived in. Read from key presence, never guessed. */
  readonly format: 'SUCCESSOR_210J' | 'LEGACY_PRE_210J';
  /** The §210J field failures, in §210J vocabulary, alongside the base codes they mapped onto. */
  readonly unresolvedActionCodes: readonly UnresolvedActionCode[];
  /** True when this declaration was admitted by the base projection and demoted here. */
  readonly demotedBy210J: boolean;
}

export interface Projection210JResult {
  readonly version: typeof PROJECTION_210J_VERSION;
  /**
   * A `ProjectionResult` in the exact base shape, so `preserveIdentifiedSafetyFacts` consumes it
   * without knowing §210J exists. Demoted declarations appear here as ordinary refusals.
   */
  readonly projection: ProjectionResult;
  readonly perDeclaration: readonly Declaration210JProjection[];
  /** The model-authored unresolved action, keyed by computed factKey. Byte-exact. */
  readonly unresolvedActionByFactKey: Readonly<Record<string, string>>;
  readonly demotedDeclarationIds: readonly string[];
  /** How many declarations arrived without the successor field at all. */
  readonly legacyFormatCount: number;
}

const readField = (raw: unknown, field: string): string | null => {
  const d = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  const v = d[field];
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
};

/**
 * Project §210J declarations. The frozen projection runs first and unchanged; this adds the
 * successor field's admission and the sidecar.
 *
 * Total and pure. Adds no fact the base did not admit, repairs nothing, and never composes a value
 * for the added field.
 */
export function project210jDeclarations(input: ProjectionInput): Projection210JResult {
  const base = projectDeclaredOwedFacts(input);

  const perDeclaration: Declaration210JProjection[] = [];
  const demoted: string[] = [];
  const sidecar: Record<string, string> = {};
  const removedKeys = new Set<string>();
  let legacyFormatCount = 0;

  for (let i = 0; i < base.perDeclaration.length; i += 1) {
    const per = base.perDeclaration[i];
    const raw = input.declarations[i];
    const format = declarationFormat(raw);
    if (format === 'LEGACY_PRE_210J') legacyFormatCount += 1;

    const codes210j = checkUnresolvedAction(raw);
    const mapped = codes210j.map(c => UNRESOLVED_ACTION_CODE_MAP[c]);
    const detail210j = codes210j.map(c => (
      c === 'UNRESOLVED_ACTION_MISSING'
        ? `${UNRESOLVED_ACTION_FIELD} is empty`
        : `${UNRESOLVED_ACTION_FIELD} is `
          + `${JSON.stringify(String(readField(raw, UNRESOLVED_ACTION_FIELD) ?? '').slice(0, 32))}`
          + ', which states no action'
    ));

    if (codes210j.length === 0) {
      perDeclaration.push({ ...per, format, unresolvedActionCodes: [], demotedBy210J: false });
      if (per.admitted && per.factKey !== null) {
        // Copied, never composed. `checkUnresolvedAction` already established it is a real string.
        sidecar[per.factKey] = readField(raw, UNRESOLVED_ACTION_FIELD) as string;
      }
      continue;
    }

    const wasAdmitted = per.admitted;
    if (wasAdmitted && per.factKey !== null) removedKeys.add(per.factKey);
    if (wasAdmitted) demoted.push(per.declarationId);

    perDeclaration.push({
      declarationId: per.declarationId,
      admitted: false,
      codes: [...per.codes, ...mapped],
      detail: [...per.detail, ...detail210j],
      // A demoted declaration yields NO fact and NO key, exactly as a base refusal does.
      factKey: null,
      owedFact: null,
      format,
      unresolvedActionCodes: codes210j,
      demotedBy210J: wasAdmitted,
    });
  }

  const projection: ProjectionResult = {
    version: base.version,
    perDeclaration: perDeclaration.map(p => ({
      declarationId: p.declarationId, admitted: p.admitted, codes: p.codes, detail: p.detail,
      factKey: p.factKey, owedFact: p.owedFact,
    })),
    facts: base.facts.filter(f => !removedKeys.has(f.factKey)),
    refusedCount: perDeclaration.filter(p => !p.admitted).length,
    declarationIdToFactKey: Object.fromEntries(
      Object.entries(base.declarationIdToFactKey).filter(([, k]) => !removedKeys.has(k))),
  };

  return {
    version: PROJECTION_210J_VERSION,
    projection,
    perDeclaration,
    unresolvedActionByFactKey: Object.freeze(sidecar),
    demotedDeclarationIds: demoted,
    legacyFormatCount,
  };
}

// ---------------------------------------------------------------- RR-7 successor

export interface Preservation210JResult {
  readonly base: DeclarationPreservationResult;
  /**
   * The successor field names each preserved record was missing. §205 computes
   * `absentRequiredFields` over the eleven legacy fields and cannot know about a twelfth; this adds
   * the name beside its record rather than editing §205 to know.
   */
  readonly absentSuccessorFieldsByDeclarationId: Readonly<Record<string, readonly string[]>>;
  readonly safetyStateComplete: boolean;
}

export function preserve210j(
  result: Projection210JResult, declarations: readonly unknown[],
): Preservation210JResult {
  const base = preserveIdentifiedSafetyFacts(result.projection, declarations);
  const absent: Record<string, readonly string[]> = {};
  for (const per of result.perDeclaration) {
    if (per.unresolvedActionCodes.includes('UNRESOLVED_ACTION_MISSING')) {
      absent[per.declarationId] = [UNRESOLVED_ACTION_FIELD];
    }
  }
  return {
    base,
    absentSuccessorFieldsByDeclarationId: Object.freeze(absent),
    safetyStateComplete: base.safetyStateComplete,
  };
}

/** Every §210J incompleteness maps onto a code RR-7 already preserves. Asserted, not assumed. */
export function unresolvedActionCodesArePreserved(): boolean {
  return Object.values(UNRESOLVED_ACTION_CODE_MAP)
    .every(c => CONTRACT_INCOMPLETENESS_CODES.includes(c));
}

// ---------------------------------------------------------------- verifier-facing view

/** What the verifier can distinguish after §210J, without semantic inference. Seven slots. */
export const VERIFIER_SLOTS_210J = [
  'owedProperty',
  'truthBranchA',
  'truthBranchB',
  'decisionIfA',
  'decisionIfB',
  'decisionWhileUnresolved',
  'evidenceNeededToSettle',
] as const;
export type VerifierSlot210J = (typeof VERIFIER_SLOTS_210J)[number];

export interface Verifier210JView {
  readonly factKey: string;
  /** 1. From declaration.missingFact, byte-exact. Null where the model authored none. */
  readonly owedProperty: string | null;
  /** 2 and 3. From the pinned projection, unchanged. */
  readonly truthBranchA: string;
  readonly truthBranchB: string;
  /** 4 and 5. From the pinned projection's decisionDivergence, unchanged. */
  readonly decisionIfA: string;
  readonly decisionIfB: string;
  /** 6. From the §210J sidecar, byte-exact. Null where no §210J declaration authored one. */
  readonly decisionWhileUnresolved: string | null;
  /**
   * 7. What would settle it: the bound clarification where one exists, and the HazLenz-held
   * criterion where one exists. Both may legitimately be null.
   */
  readonly evidenceNeededToSettle: {
    readonly clarification: string | null;
    readonly acceptableEvidence: ProjectedOwedFact['acceptableEvidence'];
  };
  /** The unchanged pinned projection, carried whole so nothing is lost by assembling this view. */
  readonly projected: ProjectedOwedFact;
  /** Why the fact is not established. From the pinned projection. */
  readonly verificationGap: string | null;
}

/**
 * Assemble the verifier-facing view. The pinned `projectOwedFact` is called unchanged and its
 * output is ACCOMPANIED by, never rewritten with, the property and the unresolved consequence.
 */
export function buildVerifier210jView(args: {
  fact: OwedFact;
  declaration: unknown;
  unresolvedActionByFactKey: Readonly<Record<string, string>>;
  boundClarification: string | null;
}): Verifier210JView {
  const projected = projectOwedFact(args.fact);
  const sidecarValue = args.unresolvedActionByFactKey[args.fact.factKey];
  return {
    factKey: args.fact.factKey,
    owedProperty: explicitOwedProperty(
      (args.declaration ?? {}) as { declarationId: string; missingFact?: unknown }),
    truthBranchA: projected.branchA,
    truthBranchB: projected.branchB,
    decisionIfA: projected.decisionDivergence.ifA,
    decisionIfB: projected.decisionDivergence.ifB,
    decisionWhileUnresolved: typeof sidecarValue === 'string' && sidecarValue.length > 0
      ? sidecarValue : null,
    evidenceNeededToSettle: {
      clarification: args.boundClarification,
      acceptableEvidence: projected.acceptableEvidence,
    },
    projected,
    verificationGap: projected.whyUnresolved,
  };
}

/** Every slot filled from exactly one source, by copy. Recorded so the suite can iterate it. */
export const VERIFIER_SLOT_PROVENANCE: Readonly<Record<VerifierSlot210J, string>> = {
  owedProperty: 'declaration.missingFact — §210B-1 sidecar, byte-exact',
  truthBranchA: 'projectOwedFact(fact).branchA — pinned projection, unchanged',
  truthBranchB: 'projectOwedFact(fact).branchB — pinned projection, unchanged',
  decisionIfA: 'projectOwedFact(fact).decisionDivergence.ifA — pinned projection, unchanged',
  decisionIfB: 'projectOwedFact(fact).decisionDivergence.ifB — pinned projection, unchanged',
  decisionWhileUnresolved:
    `declaration.${UNRESOLVED_ACTION_FIELD} — §210J sidecar, byte-exact`,
  evidenceNeededToSettle:
    'the bound clarification supplied by the caller, plus projectOwedFact(fact).acceptableEvidence',
};
