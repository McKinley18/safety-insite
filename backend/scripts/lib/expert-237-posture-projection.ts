/**
 * §237 -- POSTURE PROJECTION SUCCESSOR. Normalize, delegate to §233, enforce the driver roles.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233's `projectPosture233` is CALLED, not copied and not edited. §235's normalizer is IMPORTED
 * unchanged, because §236 proved the transport layer sound and the authorization forbids reopening
 * it. Neither §233 nor §235 is modified, so the digests the frozen §236 protocol records still hold.
 *
 *   D1..D4  THE DRIVER ROLES. Replaces the whole of §235 P7. The cessation set is now DERIVED from
 *           requiredBy rather than authored a second time, so the seven §235 cessation codes are
 *           gone and with them the two that only ever checked a copy against its original.
 *
 *   P8      RESUME COHERENCE, retained from §235 and reimplemented here rather than imported,
 *           because §235's checker computes P7 in the same pass and P7 no longer exists. §235 is
 *           left untouched on disk as the §236 provenance anchor; the suite asserts §237 agrees
 *           with §235 on every §235 fixture that P8 governs.
 *
 *   P9      TRANSPORT INTEGRITY, retained. Anything the normalizer refuses to undo means the output
 *           did not arrive intact and the analysis is refused whole. This is what closed the
 *           fail-open where an unparsed candidate array read as no candidates at all.
 *
 *   >>> NO PROSE IS READ FOR MEANING. Every check is a membership test, a reference resolution or a
 *   >>> comparison between two labels the model itself authored.
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
import {
  DRIVER_ROLE_FIELD, POSTURE_DRIVER_ROLES_237, DRIVER_ROLE_REF_KIND_237,
  DECISION_CONTROLLING_ROLES_237, CESSATION_ROLE_237,
  type PostureDriverRole237, type PostureDriver237, type ImmediateSafetyPostureObject237,
} from './expert-237-posture-contract';

export const PROJECTION_237_VERSION = 'hazlenz.expert.237.posture-projection.v1' as const;

export const POSTURE_REFUSAL_CODES_237 = [
  // D driver roles
  'POSTURE_DRIVER_ROLE_MISSING',
  'POSTURE_DRIVER_ROLE_INVALID',
  'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
  'ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE',
  'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER',
  // P8 resume coherence, retained from §235
  'RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
  // P9 transport integrity, retained from §235
  'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT',
] as const;
export type PostureRefusalCode237 = (typeof POSTURE_REFUSAL_CODES_237)[number];

export const CODE_TO_INVARIANT_237:
Readonly<Record<PostureRefusalCode237, 'D' | 'P8' | 'P9'>> = {
  POSTURE_DRIVER_ROLE_MISSING: 'D',
  POSTURE_DRIVER_ROLE_INVALID: 'D',
  DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND: 'D',
  ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE: 'D',
  NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER: 'D',
  RESUME_CONDITION_UNDER_PERMITTING_POSTURE: 'P8',
  WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT: 'P9',
};

/** The §235 codes §237 retires, held as data so the consistency suite can assert they are gone. */
export const CODES_RETIRED_FROM_235: readonly string[] = [
  'CESSATION_LIST_MISSING', 'CESSATION_LIST_NOT_AN_ARRAY', 'CESSATION_ITEM_MALFORMED',
  'CESSATION_REF_UNRESOLVED', 'CESSATION_REF_NOT_A_CANDIDATE', 'CESSATION_CONDITION_NOT_IN_BASIS',
  'ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE',
];

export interface PreservedInvalidPosture237 {
  readonly recordKind: 'STRUCTURALLY_INVALID_POSTURE';
  readonly presentFields: Record<string, unknown>;
  readonly refusalCodes: readonly string[];
  readonly admissible: false;
  readonly mayCloseTheAnalysis: false;
  readonly requiresUpstreamRepair: true;
}

export interface PostureProjectionResult237 {
  readonly version: typeof PROJECTION_237_VERSION;
  readonly normalization: NormalizationResult235;
  readonly base233: PostureProjectionResult233 | null;
  readonly admitted: boolean;
  readonly codes: readonly string[];
  readonly codes233: readonly string[];
  readonly codes237: readonly PostureRefusalCode237[];
  readonly invariantsViolated: readonly string[];
  readonly posture: ImmediateSafetyPostureObject237 | null;
  /** DERIVED, never authored. requiredBy filtered on one enum member. */
  readonly derivedCessationDrivers: readonly PostureDriver237[];
  readonly recommendationState: RecommendationState233 | null;
  readonly declarationSubordination: readonly DeclarationSubordination233[];
  readonly preserved: PreservedInvalidPosture237 | null;
  readonly mayPresentAsCompletedAnalysis: boolean;
}

const obj = (v: unknown): Record<string, unknown> | null =>
  (typeof v === 'object' && v !== null && !Array.isArray(v)) ? v as Record<string, unknown> : null;
const str = (v: unknown): string | null =>
  (typeof v === 'string' && v.trim().length > 0) ? v : null;

/**
 * D1..D4 and P8. Run on the same normalized analysis §233 sees, so one pass reports everything
 * wrong with the output rather than only the first family.
 */
export function checkPosture237(analysisRaw: unknown): {
  codes: PostureRefusalCode237[]; drivers: PostureDriver237[];
} {
  const codes: PostureRefusalCode237[] = [];
  const drivers: PostureDriver237[] = [];
  const analysis = obj(analysisRaw) ?? {};
  const p = obj(analysis[POSTURE_FIELD]);
  if (p === null) return { codes, drivers }; // §233 P1 already refuses this; do not double-report

  // ---- D1, D2. Every basis entry carries a role, and the role suits the kind of thing it is on.
  const rawBasis = Array.isArray(p.requiredBy) ? p.requiredBy as unknown[] : [];
  for (const r of rawBasis) {
    const o = obj(r);
    const ref = o === null ? null : str(o.ref);
    const kind = o === null ? null : o.refKind;
    // a malformed ref or refKind is already §233 POSTURE_BASIS_ITEM_MALFORMED; do not repeat it
    if (ref === null || typeof kind !== 'string') continue;
    const role = o === null ? undefined : o[DRIVER_ROLE_FIELD];
    if (role === undefined || role === null) { codes.push('POSTURE_DRIVER_ROLE_MISSING'); continue; }
    if (!POSTURE_DRIVER_ROLES_237.includes(role as PostureDriverRole237)) {
      codes.push('POSTURE_DRIVER_ROLE_INVALID'); continue;
    }
    const typed = role as PostureDriverRole237;
    if (DRIVER_ROLE_REF_KIND_237[typed] !== kind) {
      codes.push('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'); continue;
    }
    drivers.push({ ref, refKind: kind as PostureDriver237['refKind'], driverRole: typed });
  }

  const posture = p.posture as ImmediateSafetyPosture233;
  const postureValid = IMMEDIATE_SAFETY_POSTURES_233.includes(posture);

  if (postureValid) {
    // ---- D3. THE POSTURE FLOOR, derived from the basis rather than from a second field.
    // A driver the model itself labelled as an established condition already requiring cessation
    // cannot sit under a posture that is anything other than STOP.
    if (drivers.some(d => d.driverRole === CESSATION_ROLE_237) && posture !== 'STOP') {
      codes.push('ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE');
    }

    // ---- D4. THE C2 REPAIR. A posture that does not permit work must be driven by something that
    // decides whether work is acceptable: an established condition requiring cessation, or an
    // unresolved property controlling continuation. An analysis whose only reasons are controls to
    // apply or follow-up to chase has not given a reason to wait.
    if (!POSTURE_PERMITS_CONTINUED_WORK[posture]
      && !drivers.some(d => DECISION_CONTROLLING_ROLES_237.includes(d.driverRole))) {
      codes.push('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER');
    }

    // ---- P8, retained from §235. Work that may continue is not waiting to resume.
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
 * The §237 entry point. `transmittedSchema` is the schema that went out with THIS call, because
 * normalization accepts a parse only against the contract the model actually saw.
 */
export function projectPosture237(
  rawToolInput: unknown, transmittedSchema: unknown,
): PostureProjectionResult237 {
  const normalization = normalizeExpertToolOutput235(rawToolInput, transmittedSchema);
  const analysis = normalization.analysis;

  const base = analysis === null ? null : projectPosture233(analysis);
  const { codes: codes237, drivers } = analysis === null
    ? { codes: [] as PostureRefusalCode237[], drivers: [] as PostureDriver237[] }
    : checkPosture237(analysis);

  // ---- P9, retained from §235. The normalizer and the projection may not disagree.
  if (normalization.failsClosed) codes237.push('WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT');

  const codes233 = base?.codes ?? ['POSTURE_MISSING'];
  const allCodes = [...codes233, ...codes237];
  const admitted = base !== null && base.admitted && codes237.length === 0;

  const posture: ImmediateSafetyPostureObject237 | null = admitted && base?.posture != null
    ? { ...base.posture, requiredBy: drivers }
    : null;

  return {
    version: PROJECTION_237_VERSION,
    normalization,
    base233: base,
    admitted,
    codes: allCodes,
    codes233,
    codes237,
    invariantsViolated: [
      ...(base?.invariantsViolated ?? []),
      ...[...new Set(codes237.map(c => CODE_TO_INVARIANT_237[c]))],
    ],
    posture,
    derivedCessationDrivers: admitted
      ? drivers.filter(d => d.driverRole === CESSATION_ROLE_237) : [],
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
export function deriveCessationDrivers237(
  posture: ImmediateSafetyPostureObject237,
): readonly PostureDriver237[] {
  return posture.requiredBy.filter(d => d.driverRole === CESSATION_ROLE_237);
}

export function projectionIdentity237(): Record<string, unknown> {
  return {
    projectionVersion: PROJECTION_237_VERSION,
    refusalCodes237: [...POSTURE_REFUSAL_CODES_237],
    codeToInvariant237: CODE_TO_INVARIANT_237,
    codesRetiredFrom235: CODES_RETIRED_FROM_235,
    delegatesTo233: true,
    section233CodesUnchanged: true,
    reusesSection235Normalizer: true,
    section235ModulesModified: false,
    cessationSetIsDerivedNotAuthored: true,
    readsProseForMeaning: false,
    derivesPostureFromAnything: false,
  };
}
