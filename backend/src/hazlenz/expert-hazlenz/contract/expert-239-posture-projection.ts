/**
 * §239 -- POSTURE PROJECTION SUCCESSOR. Normalize, delegate to §233, enforce the broadened binding.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233's `projectPosture233` is CALLED, not copied and not edited. §235's normalizer is IMPORTED
 * unchanged. §237 is left untouched on disk as the §238 provenance anchor, and the suite asserts
 * that §239 reproduces §237 exactly on every §237 scenario, so the successor is a widening of one
 * rule rather than a reinterpretation of the others.
 *
 *   D1   EVERY BASIS ENTRY CARRIES A ROLE. Unchanged from §237.
 *   D2   THE ROLE SUITS THE KIND OF THING IT IS ON. Widened: a set of admissible kinds per role
 *        instead of a single kind. This is the B1 repair and the only binding §239 loosens.
 *   D2S  AND WHERE IT IS ON A CANDIDATE, THE CANDIDATE'S OWN STATE MUST AGREE WITH IT. New. This is
 *        the B2 preservation: the model's two labels must not contradict each other, and where they
 *        do the analysis is refused rather than reinterpreted, repaired or supplemented.
 *   D3   THE STOP FLOOR. Unchanged from §237.
 *   D4   A POSTURE THAT DOES NOT PERMIT WORK NEEDS A DECISION-CONTROLLING DRIVER. Unchanged.
 *   P8   RESUME COHERENCE. Unchanged from §237, which retained it from §235. This is the C1
 *        preservation and it is not weakened.
 *   P9   TRANSPORT INTEGRITY. Unchanged.
 *
 *   >>> NO PROSE IS READ FOR MEANING. Every check is a membership test, a reference resolution or a
 *   >>> comparison between two labels the model itself authored. `assertedConditionState` is a
 *   >>> governed enum the model wrote, not a reading of its reasoning.
 */

import {
  POSTURE_FIELD, IMMEDIATE_SAFETY_POSTURES_233, POSTURE_PERMITS_CONTINUED_WORK,
  type ImmediateSafetyPosture233,
} from './expert-233-posture-contract';
import {
  projectPosture233, projectRecommendationState233,
  type PostureProjectionResult233, type RecommendationState233,
  type DeclarationSubordination233,
} from './expert-233-posture-projection';
import {
  normalizeExpertToolOutput235, type NormalizationResult235,
} from './expert-235-wire-normalization';
import { DRIVER_ROLE_FIELD } from './expert-237-posture-contract';
import {
  POSTURE_DRIVER_ROLES_239, DRIVER_ROLE_REF_KINDS_239, CANDIDATE_STATE_REQUIREMENT_239,
  DECISION_CONTROLLING_ROLES_239, CESSATION_ROLE_239,
  type PostureDriverRole239, type PostureDriver239, type ImmediateSafetyPostureObject239,
} from './expert-239-posture-contract';

export const PROJECTION_239_VERSION = 'hazlenz.expert.239.posture-projection.v1' as const;

export const POSTURE_REFUSAL_CODES_239 = [
  // D driver roles
  'POSTURE_DRIVER_ROLE_MISSING',
  'POSTURE_DRIVER_ROLE_INVALID',
  'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
  'UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE',
  'ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE',
  'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER',
  // P8 resume coherence, retained from §235 through §237
  'RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
  // P9 transport integrity, retained from §235 through §237
  'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT',
] as const;
export type PostureRefusalCode239 = (typeof POSTURE_REFUSAL_CODES_239)[number];

export const CODE_TO_INVARIANT_239:
Readonly<Record<PostureRefusalCode239, 'D' | 'P8' | 'P9'>> = {
  POSTURE_DRIVER_ROLE_MISSING: 'D',
  POSTURE_DRIVER_ROLE_INVALID: 'D',
  DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND: 'D',
  UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE: 'D',
  ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE: 'D',
  NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER: 'D',
  RESUME_CONDITION_UNDER_PERMITTING_POSTURE: 'P8',
  WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT: 'P9',
};

/** §239 retires nothing. Held as data so the consistency suite can assert the empty set. */
export const CODES_RETIRED_FROM_237: readonly string[] = [];

/** The one code §239 adds, and the one §237 behaviour it changes. Data, for the report. */
export const CODES_ADDED_BY_239: readonly string[] =
  ['UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'];

export const BEHAVIOUR_CHANGED_FROM_237 = {
  admitsThatSection237Refused:
    'a requiredBy entry whose driverRole is UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION and whose '
    + 'refKind is HAZARD_CANDIDATE, where that candidate\'s own assertedConditionState is '
    + 'INSUFFICIENT_EVIDENCE or UNKNOWN. §237 refused it as DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND. '
    + 'This is the §238 B1 shape.',
  stillRefusesUnderANewCode:
    'the same entry where the candidate\'s state is ACTIVE, CONTROLLED, CORRECTED, '
    + 'REMOVED_FROM_SERVICE, NEGATED or HYPOTHETICAL. §237 refused it as '
    + 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND; §239 refuses it as '
    + 'UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE, so the two shapes are never again '
    + 'counted as one defect. This is the §238 B2 shape.',
  refusesNothingSection237Admitted: true,
  changesNoOtherCheck: true,
} as const;

export interface PreservedInvalidPosture239 {
  readonly recordKind: 'STRUCTURALLY_INVALID_POSTURE';
  readonly presentFields: Record<string, unknown>;
  readonly refusalCodes: readonly string[];
  readonly admissible: false;
  readonly mayCloseTheAnalysis: false;
  readonly requiresUpstreamRepair: true;
}

export interface PostureProjectionResult239 {
  readonly version: typeof PROJECTION_239_VERSION;
  readonly normalization: NormalizationResult235;
  readonly base233: PostureProjectionResult233 | null;
  readonly admitted: boolean;
  readonly codes: readonly string[];
  readonly codes233: readonly string[];
  readonly codes239: readonly PostureRefusalCode239[];
  readonly invariantsViolated: readonly string[];
  readonly posture: ImmediateSafetyPostureObject239 | null;
  /** DERIVED, never authored. requiredBy filtered on one enum member. */
  readonly derivedCessationDrivers: readonly PostureDriver239[];
  /** DERIVED, never authored. The drivers that decide whether work may go on, whatever carries them. */
  readonly derivedControllingDrivers: readonly PostureDriver239[];
  readonly recommendationState: RecommendationState233 | null;
  readonly declarationSubordination: readonly DeclarationSubordination233[];
  readonly preserved: PreservedInvalidPosture239 | null;
  readonly mayPresentAsCompletedAnalysis: boolean;
}

const obj = (v: unknown): Record<string, unknown> | null =>
  (typeof v === 'object' && v !== null && !Array.isArray(v)) ? v as Record<string, unknown> : null;
const str = (v: unknown): string | null =>
  (typeof v === 'string' && v.trim().length > 0) ? v : null;

/**
 * THE CANDIDATE STATES THE MODEL ITSELF WROTE, read as labels and never repaired. A candidate whose
 * key is present but whose state is absent or outside the governed enum is carried here as the raw
 * value, so the state condition below refuses it rather than skipping it.
 *
 * EVERY state written against a key is collected, not the first. A repeated candidateKey carrying
 * two different states is an output whose own labels disagree, and the state condition requires ALL
 * of them to permit the role. Taking the first would let a duplicate key carry a controlling role
 * onto a candidate the analysis elsewhere calls ACTIVE, which is the B2 contradiction through a
 * side door.
 */
function candidateStates(analysis: Record<string, unknown>): Map<string, unknown[]> {
  const out = new Map<string, unknown[]>();
  const cands = Array.isArray(analysis.expertHazardCandidates)
    ? analysis.expertHazardCandidates as unknown[] : [];
  for (const c of cands) {
    const o = obj(c); if (o === null) continue;
    const k = str(o.candidateKey); if (k === null) continue;
    out.set(k, [...(out.get(k) ?? []), o.assertedConditionState]);
  }
  return out;
}

/**
 * D1, D2, D2S, D3, D4 and P8. Run on the same normalized analysis §233 sees, so one pass reports
 * everything wrong with the output rather than only the first family.
 */
export function checkPosture239(analysisRaw: unknown): {
  codes: PostureRefusalCode239[]; drivers: PostureDriver239[];
} {
  const codes: PostureRefusalCode239[] = [];
  const drivers: PostureDriver239[] = [];
  const analysis = obj(analysisRaw) ?? {};
  const p = obj(analysis[POSTURE_FIELD]);
  if (p === null) return { codes, drivers }; // §233 P1 already refuses this; do not double-report
  const states = candidateStates(analysis);

  // ---- D1, D2, D2S.
  const rawBasis = Array.isArray(p.requiredBy) ? p.requiredBy as unknown[] : [];
  for (const r of rawBasis) {
    const o = obj(r);
    const ref = o === null ? null : str(o.ref);
    const kind = o === null ? null : o.refKind;
    // a malformed ref or refKind is already §233 POSTURE_BASIS_ITEM_MALFORMED; do not repeat it
    if (ref === null || typeof kind !== 'string') continue;
    const role = o === null ? undefined : o[DRIVER_ROLE_FIELD];
    if (role === undefined || role === null) { codes.push('POSTURE_DRIVER_ROLE_MISSING'); continue; }
    if (!POSTURE_DRIVER_ROLES_239.includes(role as PostureDriverRole239)) {
      codes.push('POSTURE_DRIVER_ROLE_INVALID'); continue;
    }
    const typed = role as PostureDriverRole239;

    // ---- D2. THE BINDING, WIDENED. A membership test against a governed set, nothing inferred.
    if (!DRIVER_ROLE_REF_KINDS_239[typed].includes(kind as PostureDriver239['refKind'])) {
      codes.push('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'); continue;
    }

    // ---- D2S. THE STATE CONDITION. The model's own two labels are compared with each other. An
    // ---- unresolvable ref is already §233 POSTURE_BASIS_REF_UNRESOLVED and is left to behave
    // ---- exactly as it did under §237, so no code moves on an output §233 already refuses. A
    // ---- candidate that DOES resolve and whose state disagrees is refused here, and one that
    // ---- resolves carrying no governed state at all is refused here too, fail-closed.
    const required = CANDIDATE_STATE_REQUIREMENT_239[typed];
    if (required !== undefined && kind === 'HAZARD_CANDIDATE' && states.has(ref)
      && !states.get(ref)!.every(st => required.includes(st as never))) {
      codes.push('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'); continue;
    }

    drivers.push({ ref, refKind: kind as PostureDriver239['refKind'], driverRole: typed });
  }

  const posture = p.posture as ImmediateSafetyPosture233;
  const postureValid = IMMEDIATE_SAFETY_POSTURES_233.includes(posture);

  if (postureValid) {
    // ---- D3. THE POSTURE FLOOR, unchanged from §237.
    if (drivers.some(d => d.driverRole === CESSATION_ROLE_239) && posture !== 'STOP') {
      codes.push('ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE');
    }

    // ---- D4. A POSTURE THAT DOES NOT PERMIT WORK NEEDS A DRIVER THAT DECIDES WHETHER WORK IS
    // ---- ACCEPTABLE, unchanged from §237. What §239 changes is only WHERE such a driver may be
    // ---- written, never WHICH ROLES QUALIFY: response uncertainty cannot become controlling by
    // ---- being attached to a candidate any more than it could by being attached to a declaration.
    if (!POSTURE_PERMITS_CONTINUED_WORK[posture]
      && !drivers.some(d => DECISION_CONTROLLING_ROLES_239.includes(d.driverRole))) {
      codes.push('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER');
    }

    // ---- P8, retained. Work that may continue is not waiting to resume. THE C1 INVARIANT.
    if (POSTURE_PERMITS_CONTINUED_WORK[posture]) {
      const r = obj(p.resumeCondition);
      const n = (Array.isArray(r?.resolvedByDeclarationIds) ? r!.resolvedByDeclarationIds.length : 0)
        + (Array.isArray(r?.correctionsRequired) ? r!.correctionsRequired.length : 0);
      if (n > 0) codes.push('RESUME_CONDITION_UNDER_PERMITTING_POSTURE');
    }
  }

  return { codes: [...new Set(codes)], drivers };
}

/**
 * The §239 entry point. `transmittedSchema` is the schema that went out with THIS call, because
 * normalization accepts a parse only against the contract the model actually saw.
 */
export function projectPosture239(
  rawToolInput: unknown, transmittedSchema: unknown,
): PostureProjectionResult239 {
  const normalization = normalizeExpertToolOutput235(rawToolInput, transmittedSchema);
  const analysis = normalization.analysis;

  const base = analysis === null ? null : projectPosture233(analysis);
  const { codes: codes239, drivers } = analysis === null
    ? { codes: [] as PostureRefusalCode239[], drivers: [] as PostureDriver239[] }
    : checkPosture239(analysis);

  // ---- P9, retained. The normalizer and the projection may not disagree.
  if (normalization.failsClosed) codes239.push('WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT');

  const codes233 = base?.codes ?? ['POSTURE_MISSING'];
  const allCodes = [...codes233, ...codes239];
  const admitted = base !== null && base.admitted && codes239.length === 0;

  const posture: ImmediateSafetyPostureObject239 | null = admitted && base?.posture != null
    ? { ...base.posture, requiredBy: drivers }
    : null;

  return {
    version: PROJECTION_239_VERSION,
    normalization,
    base233: base,
    admitted,
    codes: allCodes,
    codes233,
    codes239,
    invariantsViolated: [
      ...(base?.invariantsViolated ?? []),
      ...[...new Set(codes239.map(c => CODE_TO_INVARIANT_239[c]))],
    ],
    posture,
    derivedCessationDrivers: admitted ? deriveCessationDrivers239({ requiredBy: drivers }) : [],
    derivedControllingDrivers: admitted ? deriveControllingDrivers239({ requiredBy: drivers }) : [],
    recommendationState: posture === null ? null : projectRecommendationState233(posture),
    declarationSubordination: base?.declarationSubordination ?? [],
    preserved: admitted ? null : {
      recordKind: 'STRUCTURALLY_INVALID_POSTURE',
      presentFields: base?.preserved?.presentFields
        ?? (obj(obj(analysis ?? {})?.[POSTURE_FIELD]) ?? {}),
      refusalCodes: allCodes,
      admissible: false,
      mayCloseTheAnalysis: false,
      requiresUpstreamRepair: true,
    },
    mayPresentAsCompletedAnalysis: admitted,
  };
}

/**
 * THE DERIVED CESSATION SET, exposed as its own function so an auditor can see that it is a filter
 * and nothing more. There is no second provider field, no default and no inference.
 */
export function deriveCessationDrivers239(
  posture: { readonly requiredBy: readonly PostureDriver239[] },
): readonly PostureDriver239[] {
  return posture.requiredBy.filter(d => d.driverRole === CESSATION_ROLE_239);
}

/**
 * THE DERIVED CONTROLLING SET. The same filter over the two roles that decide whether work may go
 * on. §239 exists because such a driver may now be carried by a declaration OR by an undecided
 * candidate, and this is the one place downstream code should ask which drivers those are, so that
 * the carrier stops mattering anywhere else.
 */
export function deriveControllingDrivers239(
  posture: { readonly requiredBy: readonly PostureDriver239[] },
): readonly PostureDriver239[] {
  return posture.requiredBy.filter(d => DECISION_CONTROLLING_ROLES_239.includes(d.driverRole));
}

export function projectionIdentity239(): Record<string, unknown> {
  return {
    projectionVersion: PROJECTION_239_VERSION,
    refusalCodes239: [...POSTURE_REFUSAL_CODES_239],
    codeToInvariant239: CODE_TO_INVARIANT_239,
    codesRetiredFrom237: CODES_RETIRED_FROM_237,
    codesAddedBy239: CODES_ADDED_BY_239,
    behaviourChangedFrom237: BEHAVIOUR_CHANGED_FROM_237,
    delegatesTo233: true,
    section233CodesUnchanged: true,
    reusesSection235Normalizer: true,
    section233ModulesModified: false,
    section235ModulesModified: false,
    section237ModulesModified: false,
    cessationSetIsDerivedNotAuthored: true,
    controllingSetIsDerivedNotAuthored: true,
    readsProseForMeaning: false,
    derivesPostureFromAnything: false,
    repairsContradictoryModelState: false,
  };
}
