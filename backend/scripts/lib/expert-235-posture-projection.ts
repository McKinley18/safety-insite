/**
 * §235 -- POSTURE PROJECTION SUCCESSOR. Normalize the container, delegate to §233, add two rules.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233's `projectPosture233` is CALLED, not copied and not edited. Everything it refused before it
 * still refuses, on the same codes, and the §234 evidence stays meaningful. §235 adds:
 *
 *   P7  ESTABLISHED CESSATION CONDITIONS. The manufactured-uncertainty repair. A model-authored
 *       list of its own candidates whose current established state already requires cessation. A
 *       non-empty list forces STOP, so an invented unknown can no longer stand between an
 *       established stop and the posture that reports it.
 *
 *   P8  RESUME CONDITION UNDER A PERMITTING POSTURE. The §234 E2 finding, and it is included for
 *       one narrow reason: the SCHEMA ALREADY TOLD THE MODEL to leave both lists empty when work
 *       may continue, and nothing enforced it. That is the same alignment defect §235 exists to
 *       close, running in the other direction, so leaving it would leave the contract incoherent by
 *       the standard §235 is being held to. It was NOT a §234 failure driver and is not claimed as
 *       one.
 *
 *   >>> STILL NO PROSE IS READ FOR MEANING. Every §235 check is a membership test, a reference
 *   >>> resolution, a set comparison, or a comparison between two labels the model itself authored.
 */

import {
  POSTURE_FIELD, IMMEDIATE_SAFETY_POSTURES_233, POSTURE_PERMITS_CONTINUED_WORK,
  type ImmediateSafetyPosture233, type PostureRef233,
} from './expert-233-posture-contract';
import {
  projectPosture233, projectRecommendationState233,
  type PostureProjectionResult233, type RecommendationState233,
  type DeclarationSubordination233,
} from './expert-233-posture-projection';
import {
  CESSATION_FIELD, type ImmediateSafetyPostureObject235,
} from './expert-235-posture-contract';
import {
  normalizeExpertToolOutput235, type NormalizationResult235,
} from './expert-235-wire-normalization';

export const PROJECTION_235_VERSION = 'hazlenz.expert.235.posture-projection.v1' as const;

export const POSTURE_REFUSAL_CODES_235 = [
  // P7 established cessation conditions
  'CESSATION_LIST_MISSING',
  'CESSATION_LIST_NOT_AN_ARRAY',
  'CESSATION_ITEM_MALFORMED',
  'CESSATION_REF_UNRESOLVED',
  'CESSATION_REF_NOT_A_CANDIDATE',
  'CESSATION_CONDITION_NOT_IN_BASIS',
  'ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE',
  // P8 resume-condition coherence
  'RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
  // P9 transport integrity
  'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT',
] as const;
export type PostureRefusalCode235 = (typeof POSTURE_REFUSAL_CODES_235)[number];

export const CODE_TO_INVARIANT_235: Readonly<Record<PostureRefusalCode235, 'P7' | 'P8' | 'P9'>> = {
  CESSATION_LIST_MISSING: 'P7',
  CESSATION_LIST_NOT_AN_ARRAY: 'P7',
  CESSATION_ITEM_MALFORMED: 'P7',
  CESSATION_REF_UNRESOLVED: 'P7',
  CESSATION_REF_NOT_A_CANDIDATE: 'P7',
  CESSATION_CONDITION_NOT_IN_BASIS: 'P7',
  ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE: 'P7',
  RESUME_CONDITION_UNDER_PERMITTING_POSTURE: 'P8',
  WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT: 'P9',
};

/**
 * RR-7 FOR A §235-ONLY REFUSAL. §233 builds a preservation record when IT refuses; an analysis that
 * §233 admits and §235 refuses would otherwise be refused with nothing preserved, which is the one
 * thing RR-7 exists to prevent. What was identified is carried verbatim and remains inadmissible.
 */
export interface PreservedInvalidPosture235 {
  readonly recordKind: 'STRUCTURALLY_INVALID_POSTURE';
  readonly presentFields: Record<string, unknown>;
  readonly refusalCodes: readonly string[];
  readonly admissible: false;
  readonly mayCloseTheAnalysis: false;
  readonly requiresUpstreamRepair: true;
}

export interface PostureProjectionResult235 {
  readonly version: typeof PROJECTION_235_VERSION;
  readonly normalization: NormalizationResult235;
  readonly base233: PostureProjectionResult233 | null;
  readonly admitted: boolean;
  readonly codes: readonly string[];
  readonly codes233: readonly string[];
  readonly codes235: readonly PostureRefusalCode235[];
  readonly invariantsViolated: readonly string[];
  readonly posture: ImmediateSafetyPostureObject235 | null;
  readonly recommendationState: RecommendationState233 | null;
  readonly declarationSubordination: readonly DeclarationSubordination233[];
  readonly preserved: PreservedInvalidPosture235 | null;
  readonly mayPresentAsCompletedAnalysis: boolean;
}

const obj = (v: unknown): Record<string, unknown> | null =>
  (typeof v === 'object' && v !== null && !Array.isArray(v)) ? v as Record<string, unknown> : null;
const str = (v: unknown): string | null =>
  (typeof v === 'string' && v.trim().length > 0) ? v : null;

/** Candidate keys the model itself declared, read defensively and never repaired. */
function candidateKeys(analysis: Record<string, unknown>): Set<string> {
  const out = new Set<string>();
  const cands = Array.isArray(analysis.expertHazardCandidates)
    ? analysis.expertHazardCandidates as unknown[] : [];
  for (const c of cands) {
    const o = obj(c); if (o === null) continue;
    const k = str(o.candidateKey); if (k !== null) out.add(k);
  }
  return out;
}

/**
 * P7 and P8. Run on the same normalized analysis §233 sees, independently of whether §233 admitted,
 * so a single pass reports everything wrong with the output rather than only the first family.
 */
export function checkPosture235(analysisRaw: unknown): {
  codes: PostureRefusalCode235[]; cessation: PostureRef233[];
} {
  const codes: PostureRefusalCode235[] = [];
  const analysis = obj(analysisRaw) ?? {};
  const p = obj(analysis[POSTURE_FIELD]);
  const cessation: PostureRef233[] = [];
  if (p === null) return { codes, cessation }; // §233 P1 already refuses this; do not double-report

  const rawList = p[CESSATION_FIELD];
  if (rawList === undefined || rawList === null) {
    codes.push('CESSATION_LIST_MISSING');
  } else if (!Array.isArray(rawList)) {
    codes.push('CESSATION_LIST_NOT_AN_ARRAY');
  } else {
    const keys = candidateKeys(analysis);
    for (const r of rawList) {
      const o = obj(r);
      const ref = o === null ? null : str(o.ref);
      const kind = o === null ? null : o.refKind;
      if (ref === null || typeof kind !== 'string') { codes.push('CESSATION_ITEM_MALFORMED'); continue; }
      if (kind !== 'HAZARD_CANDIDATE') { codes.push('CESSATION_REF_NOT_A_CANDIDATE'); continue; }
      if (!keys.has(ref)) { codes.push('CESSATION_REF_UNRESOLVED'); continue; }
      cessation.push({ ref, refKind: 'HAZARD_CANDIDATE' });
    }

    // every established cessation condition is, by definition, a reason for the posture
    const basis = new Set((Array.isArray(p.requiredBy) ? p.requiredBy as unknown[] : [])
      .map(r => obj(r)).filter((o): o is Record<string, unknown> => o !== null)
      .filter(o => o.refKind === 'HAZARD_CANDIDATE')
      .map(o => str(o.ref)).filter((s): s is string => s !== null));
    for (const c of cessation) {
      if (!basis.has(c.ref)) codes.push('CESSATION_CONDITION_NOT_IN_BASIS');
    }

    // ---- THE MANUFACTURED-UNCERTAINTY REPAIR, and the whole of it.
    // A model that names an established condition already requiring cessation may not then report a
    // posture that permits work or merely waits on a result. Nothing here judges WHETHER a condition
    // requires cessation: that is the model's own label, and this compares it with the model's own
    // posture.
    const posture = p.posture as ImmediateSafetyPosture233;
    if (cessation.length > 0 && IMMEDIATE_SAFETY_POSTURES_233.includes(posture)
      && posture !== 'STOP') {
      codes.push('ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE');
    }
  }

  // ---- P8. Work that may continue is not waiting to resume.
  const posture = p.posture as ImmediateSafetyPosture233;
  if (IMMEDIATE_SAFETY_POSTURES_233.includes(posture)
    && POSTURE_PERMITS_CONTINUED_WORK[posture]) {
    const r = obj(p.resumeCondition);
    const n = (Array.isArray(r?.resolvedByDeclarationIds) ? r!.resolvedByDeclarationIds.length : 0)
      + (Array.isArray(r?.correctionsRequired) ? r!.correctionsRequired.length : 0);
    if (n > 0) codes.push('RESUME_CONDITION_UNDER_PERMITTING_POSTURE');
  }

  return { codes: [...new Set(codes)], cessation };
}

/**
 * The §235 entry point. `transmittedSchema` is the schema that went out with THIS call, because a
 * parse is accepted only against the contract the model actually saw.
 */
export function projectPosture235(
  rawToolInput: unknown, transmittedSchema: unknown,
): PostureProjectionResult235 {
  const normalization = normalizeExpertToolOutput235(rawToolInput, transmittedSchema);
  const analysis = normalization.analysis;

  const base = analysis === null ? null : projectPosture233(analysis);
  const { codes: codes235, cessation } = analysis === null
    ? { codes: [] as PostureRefusalCode235[], cessation: [] as PostureRef233[] }
    : checkPosture235(analysis);

  /**
   * P9. THE NORMALIZER AND THE PROJECTION MAY NOT DISAGREE.
   *
   * Anything the normalizer refused to undo -- an ambiguous envelope, a required root field that is
   * simply absent, a JSON string that does not parse, a parsed value that does not satisfy the
   * transmitted schema -- means the output DID NOT ARRIVE INTACT. Admitting it because the part the
   * posture projection happens to read survived would be a fail-open, and the local suite caught
   * exactly that: a candidate array left unparsed reads as no candidates at all, and coverage is
   * then satisfied vacuously.
   *
   * This is WIDER than §233, deliberately: it refuses on a base-contract root field the posture
   * projection never reads. The transmitted schema declared that field required, so an output
   * without it is not the output the contract asked for.
   */
  if (normalization.failsClosed) codes235.push('WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT');

  const codes233 = base?.codes ?? ['POSTURE_MISSING'];
  const allCodes = [...codes233, ...codes235];
  const admitted = base !== null && base.admitted && codes235.length === 0;

  const posture: ImmediateSafetyPostureObject235 | null = admitted && base?.posture != null
    ? { ...base.posture, establishedConditionsRequiringCessation: cessation }
    : null;

  return {
    version: PROJECTION_235_VERSION,
    normalization,
    base233: base,
    admitted,
    codes: allCodes,
    codes233,
    codes235,
    invariantsViolated: [
      ...(base?.invariantsViolated ?? []),
      ...[...new Set(codes235.map(c => CODE_TO_INVARIANT_235[c]))],
    ],
    posture,
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

export function projectionIdentity235(): Record<string, unknown> {
  return {
    projectionVersion: PROJECTION_235_VERSION,
    refusalCodes235: [...POSTURE_REFUSAL_CODES_235],
    codeToInvariant235: CODE_TO_INVARIANT_235,
    delegatesTo233: true,
    section233CodesUnchanged: true,
    readsProseForMeaning: false,
    derivesPostureFromAnything: false,
    normalizesContainerOnly: true,
  };
}
