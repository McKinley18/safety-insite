/**
 * §233 -- IMMEDIATE SAFETY POSTURE PROJECTION. Validate, project, refuse. Nothing else.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Invariant 2 is the whole design brief for this file, and invariant 3 is the whole prohibition:
 *
 *   >>> NOT ONE FUNCTION HERE READS A PROSE FIELD FOR MEANING. Every check is a membership test, a
 *   >>> reference resolution, a presence test, or a comparison between two MODEL-AUTHORED LABELS.
 *   >>> `whatHappensNow`, `reason`, `control` and `correctionRequired` are carried verbatim and
 *   >>> never parsed. The only predicate applied to any prose is `isNonSemanticFiller`, imported
 *   >>> from the frozen projection module, which is a closed literal set and not a reading.
 *
 * A refused posture is refused WHOLE and the analysis may not be presented as a completed result.
 * That is invariant 13 applied to the new field, and it is what makes P1 a guarantee rather than a
 * hope: the posture cannot silently disappear, because its absence terminates the analysis.
 */

import {
  POSTURE_FIELD, IMMEDIATE_SAFETY_POSTURES_233, POSTURE_REF_KINDS_233, CONTROL_TIMINGS_233,
  POSTURE_PERMITS_CONTINUED_WORK, POSTURE_PROTECTIVE_RANK, PROTECTIVE_SEQUENCE_233,
  checkPostureFields, FIRST_PASS_CONTRACT_233_VERSION,
  type ImmediateSafetyPosture233, type ImmediateSafetyPostureObject233,
  type PostureRef233, type PostureAcceptance233, type RequiredControl233,
  type ResumeCondition233, type PostureFieldCode233,
} from './expert-233-posture-contract';

export const PROJECTION_233_VERSION = 'hazlenz.expert.233.posture-projection.v1' as const;

// ================================================================ refusal codes

export const POSTURE_REFUSAL_CODES_233 = [
  // P1 presence and shape
  'POSTURE_MISSING', 'POSTURE_NOT_AN_OBJECT', 'POSTURE_VALUE_INVALID',
  'POSTURE_NARRATIVE_MISSING', 'POSTURE_NARRATIVE_PLACEHOLDER',
  'POSTURE_BASIS_NOT_AN_ARRAY', 'POSTURE_BASIS_ITEM_MALFORMED',
  'POSTURE_CONTROLS_NOT_AN_ARRAY', 'POSTURE_CONTROL_ITEM_MALFORMED',
  'POSTURE_RESUME_CONDITION_MALFORMED',
  // P2 referential integrity
  'POSTURE_BASIS_REF_UNRESOLVED', 'POSTURE_BASIS_REF_DUPLICATED',
  'RESUME_CONDITION_REF_UNRESOLVED',
  // P3 coverage
  'ACTIVE_CANDIDATE_NOT_COVERED', 'DECLARATION_NOT_COVERED',
  // P4 resume condition
  'RESUME_CONDITION_EMPTY',
  // P5 label consistency
  'BLOCKING_CLARIFICATION_WITH_CONTINUE',
  // controls / sequencing
  'CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS', 'CONTROLS_PRESENT_UNDER_CONTINUE',
  'CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE',
] as const;
export type PostureRefusalCode233 = (typeof POSTURE_REFUSAL_CODES_233)[number];

/** Which frozen §232 invariant each code serves. Data, so the suite asserts the mapping. */
export const CODE_TO_INVARIANT_233: Readonly<Record<PostureRefusalCode233, 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'>> = {
  POSTURE_MISSING: 'P1', POSTURE_NOT_AN_OBJECT: 'P1', POSTURE_VALUE_INVALID: 'P1',
  POSTURE_NARRATIVE_MISSING: 'P1', POSTURE_NARRATIVE_PLACEHOLDER: 'P1',
  POSTURE_BASIS_NOT_AN_ARRAY: 'P1', POSTURE_BASIS_ITEM_MALFORMED: 'P1',
  POSTURE_CONTROLS_NOT_AN_ARRAY: 'P1', POSTURE_CONTROL_ITEM_MALFORMED: 'P1',
  POSTURE_RESUME_CONDITION_MALFORMED: 'P1',
  POSTURE_BASIS_REF_UNRESOLVED: 'P2', POSTURE_BASIS_REF_DUPLICATED: 'P2',
  RESUME_CONDITION_REF_UNRESOLVED: 'P2',
  ACTIVE_CANDIDATE_NOT_COVERED: 'P3', DECLARATION_NOT_COVERED: 'P3',
  RESUME_CONDITION_EMPTY: 'P4',
  BLOCKING_CLARIFICATION_WITH_CONTINUE: 'P5',
  CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS: 'P6',
  CONTROLS_PRESENT_UNDER_CONTINUE: 'P6',
  CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE: 'P6',
};

// ================================================================ projected state

/**
 * The recommendation state, DERIVED FROM THE POSTURE and from nothing else.
 *
 * This is how recommendation silence stops being possible. The consequence is not written by a
 * generator that may omit it; it is projected from the authoritative label, so omission would
 * require deleting the posture, which P1 refuses.
 */
export interface RecommendationState233 {
  readonly posture: ImmediateSafetyPosture233;
  readonly postureRank: number;
  readonly workMayContinue: boolean;
  readonly operationalConsequenceRequired: boolean;
  readonly requiredControls: readonly RequiredControl233[];
  readonly resumeCondition: ResumeCondition233;
  readonly protectiveSequence: readonly string[] | null;
  readonly derivedFrom: 'AUTHORITATIVE_POSTURE';
  readonly proseParticipatedInDerivation: false;
}

/** Per-declaration subordination record. The legacy action string survives, demoted. */
export interface DeclarationSubordination233 {
  readonly declarationId: string;
  readonly decisionWhileUnresolved: string | null;
  readonly authority: 'ADVISORY_NOT_AUTHORITATIVE';
  readonly authoritativePostureIs: ImmediateSafetyPosture233;
  readonly mayContradictAuthoritativePosture: false;
}

/** RR-7 analogue for the posture. Preservation is not repair. */
export interface PreservedInvalidPosture233 {
  readonly recordKind: 'STRUCTURALLY_INVALID_POSTURE';
  readonly presentFields: Record<string, unknown>;
  readonly refusalCodes: readonly PostureRefusalCode233[];
  readonly admissible: false;
  readonly mayCloseTheAnalysis: false;
  readonly requiresUpstreamRepair: true;
}

export interface PostureProjectionResult233 {
  readonly version: typeof PROJECTION_233_VERSION;
  readonly admitted: boolean;
  readonly codes: readonly PostureRefusalCode233[];
  readonly invariantsViolated: readonly ('P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6')[];
  readonly posture: ImmediateSafetyPostureObject233 | null;
  readonly recommendationState: RecommendationState233 | null;
  readonly declarationSubordination: readonly DeclarationSubordination233[];
  readonly preserved: PreservedInvalidPosture233 | null;
  readonly mayPresentAsCompletedAnalysis: boolean;
}

// ================================================================ helpers

const obj = (v: unknown): Record<string, unknown> | null =>
  (typeof v === 'object' && v !== null && !Array.isArray(v)) ? v as Record<string, unknown> : null;
const str = (v: unknown): string | null =>
  (typeof v === 'string' && v.trim().length > 0) ? v : null;

/** Read the model's own labels. Defensive about shape; never repairs one. */
function readAnalysis(analysis: Record<string, unknown>): {
  candidateKeys: Set<string>; activeCandidateKeys: Set<string>;
  declarationIds: Set<string>; declarations: Record<string, unknown>[];
  blockingBoundDeclarationIds: Set<string>;
} {
  const cands = Array.isArray(analysis.expertHazardCandidates)
    ? analysis.expertHazardCandidates as unknown[] : [];
  const candidateKeys = new Set<string>();
  const activeCandidateKeys = new Set<string>();
  for (const c of cands) {
    const o = obj(c); if (o === null) continue;
    const k = str(o.candidateKey); if (k === null) continue;
    candidateKeys.add(k);
    if (o.assertedConditionState === 'ACTIVE') activeCandidateKeys.add(k);
  }
  const rawDecls = Array.isArray(analysis.unresolvedFactDeclarations)
    ? analysis.unresolvedFactDeclarations as unknown[] : [];
  const declarationIds = new Set<string>();
  const declarations: Record<string, unknown>[] = [];
  for (const d of rawDecls) {
    const o = obj(d); if (o === null) continue;
    declarations.push(o);
    const id = str(o.declarationId); if (id !== null) declarationIds.add(id);
  }
  const clars = Array.isArray(analysis.decisionCriticalClarifications)
    ? analysis.decisionCriticalClarifications as unknown[] : [];
  const blockingBoundDeclarationIds = new Set<string>();
  for (const q of clars) {
    const o = obj(q); if (o === null) continue;
    if (o.criticality !== 'BLOCKING') continue;
    const bound = str(o.answersUnresolvedFactDeclarationId);
    if (bound !== null && declarationIds.has(bound)) blockingBoundDeclarationIds.add(bound);
  }
  return { candidateKeys, activeCandidateKeys, declarationIds, declarations,
    blockingBoundDeclarationIds };
}

/** Build the recommendation state from the posture. The only producer of this type. */
export function projectRecommendationState233(
  p: ImmediateSafetyPostureObject233,
): RecommendationState233 {
  const permits = POSTURE_PERMITS_CONTINUED_WORK[p.posture];
  return {
    posture: p.posture,
    postureRank: POSTURE_PROTECTIVE_RANK[p.posture],
    workMayContinue: permits,
    operationalConsequenceRequired: !permits,
    requiredControls: p.requiredControls,
    resumeCondition: p.resumeCondition,
    protectiveSequence: permits ? null : PROTECTIVE_SEQUENCE_233,
    derivedFrom: 'AUTHORITATIVE_POSTURE',
    proseParticipatedInDerivation: false,
  };
}

export const RECOMMENDATION_COMPLETENESS_CODES_233 = [
  'RECOMMENDATION_CONTRADICTS_POSTURE',
  'RECOMMENDATION_LESS_PROTECTIVE_THAN_POSTURE',
  'RECOMMENDATION_OMITS_OPERATIONAL_CONSEQUENCE',
  'RECOMMENDATION_DROPS_REQUIRED_CONTROLS',
  'RECOMMENDATION_DROPS_RESUME_CONDITION',
] as const;
export type RecommendationCompletenessCode233 =
  (typeof RECOMMENDATION_COMPLETENESS_CODES_233)[number];

/**
 * P6. A downstream recommendation state may never be less protective than the authorised posture,
 * and may never drop the consequence through omission. Label and reference comparison only.
 */
export function checkRecommendationNotLessProtective233(
  state: RecommendationState233, authorised: ImmediateSafetyPostureObject233,
): RecommendationCompletenessCode233[] {
  const codes: RecommendationCompletenessCode233[] = [];
  const permits = POSTURE_PERMITS_CONTINUED_WORK[authorised.posture];
  if (state.postureRank < POSTURE_PROTECTIVE_RANK[authorised.posture]) {
    codes.push('RECOMMENDATION_LESS_PROTECTIVE_THAN_POSTURE');
  }
  if (state.workMayContinue !== permits) codes.push('RECOMMENDATION_CONTRADICTS_POSTURE');
  if (!permits && (state.protectiveSequence === null || state.protectiveSequence.length === 0)) {
    codes.push('RECOMMENDATION_OMITS_OPERATIONAL_CONSEQUENCE');
  }
  if (state.requiredControls.length < authorised.requiredControls.length) {
    codes.push('RECOMMENDATION_DROPS_REQUIRED_CONTROLS');
  }
  const total = (r: ResumeCondition233): number =>
    r.resolvedByDeclarationIds.length + r.correctionsRequired.length;
  if (total(state.resumeCondition) < total(authorised.resumeCondition)) {
    codes.push('RECOMMENDATION_DROPS_RESUME_CONDITION');
  }
  return codes;
}

/**
 * What a declaration-level action string is, and is not, once §233 exists. Typed as literals so a
 * caller cannot read it as an authority and the suite can assert it mechanically. This is the
 * counterpart to `propertyAuthorityFailClosedEffect()`, which §232 found asserting the authority of
 * a field whose existence the architecture did not guarantee.
 */
export function declarationActionAuthority233(): {
  isAuthoritativeWorkPosture: false;
  mayContradictTheAnalysisPosture: false;
  survivesForCompatibility: true;
  carriedVerbatim: true;
  repairedOrRewritten: false;
  theSingleAuthorityIs: typeof POSTURE_FIELD;
} {
  return {
    isAuthoritativeWorkPosture: false,
    mayContradictTheAnalysisPosture: false,
    survivesForCompatibility: true,
    carriedVerbatim: true,
    repairedOrRewritten: false,
    theSingleAuthorityIs: POSTURE_FIELD,
  };
}

// ================================================================ the projection

export function projectPosture233(analysisRaw: unknown): PostureProjectionResult233 {
  const codes: PostureRefusalCode233[] = [];
  const analysis = obj(analysisRaw) ?? {};
  const seen = readAnalysis(analysis);

  // ---- P1 presence and shape
  for (const c of checkPostureFields(analysis) as PostureFieldCode233[]) {
    codes.push(c as PostureRefusalCode233);
  }
  const p = obj(analysis[POSTURE_FIELD]);
  if (p === null) return refuse(codes, analysis, seen);

  const requiredByRaw = p.requiredBy;
  const acceptedRaw = p.acceptedWithoutImmediateAction;
  const controlsRaw = p.requiredControls;
  if (!Array.isArray(requiredByRaw) || !Array.isArray(acceptedRaw)) {
    codes.push('POSTURE_BASIS_NOT_AN_ARRAY');
  }
  if (!Array.isArray(controlsRaw)) codes.push('POSTURE_CONTROLS_NOT_AN_ARRAY');

  const requiredBy: PostureRef233[] = [];
  const accepted: PostureAcceptance233[] = [];
  if (Array.isArray(requiredByRaw)) {
    for (const r of requiredByRaw) {
      const o = obj(r);
      const ref = o === null ? null : str(o.ref);
      const kind = o === null ? null : o.refKind;
      if (ref === null || !POSTURE_REF_KINDS_233.includes(kind as never)) {
        codes.push('POSTURE_BASIS_ITEM_MALFORMED'); continue;
      }
      requiredBy.push({ ref, refKind: kind as PostureRef233['refKind'] });
    }
  }
  if (Array.isArray(acceptedRaw)) {
    for (const r of acceptedRaw) {
      const o = obj(r);
      const ref = o === null ? null : str(o.ref);
      const kind = o === null ? null : o.refKind;
      const reason = o === null ? null : str(o.reason);
      if (ref === null || reason === null || !POSTURE_REF_KINDS_233.includes(kind as never)) {
        codes.push('POSTURE_BASIS_ITEM_MALFORMED'); continue;
      }
      accepted.push({ ref, refKind: kind as PostureRef233['refKind'], reason });
    }
  }
  const controls: RequiredControl233[] = [];
  if (Array.isArray(controlsRaw)) {
    for (const r of controlsRaw) {
      const o = obj(r);
      const control = o === null ? null : str(o.control);
      const timing = o === null ? null : o.timing;
      if (control === null || !CONTROL_TIMINGS_233.includes(timing as never)) {
        codes.push('POSTURE_CONTROL_ITEM_MALFORMED'); continue;
      }
      controls.push({ control, timing: timing as RequiredControl233['timing'] });
    }
  }

  let resume: ResumeCondition233 = { resolvedByDeclarationIds: [], correctionsRequired: [] };
  {
    const o = obj(p.resumeCondition);
    if (o === null || !Array.isArray(o.resolvedByDeclarationIds)
      || !Array.isArray(o.correctionsRequired)) {
      codes.push('POSTURE_RESUME_CONDITION_MALFORMED');
    } else {
      resume = {
        resolvedByDeclarationIds: (o.resolvedByDeclarationIds as unknown[])
          .map(x => str(x)).filter((x): x is string => x !== null),
        correctionsRequired: (o.correctionsRequired as unknown[])
          .map(x => str(x)).filter((x): x is string => x !== null),
      };
    }
  }

  const posture = p.posture as ImmediateSafetyPosture233;
  const postureValid = IMMEDIATE_SAFETY_POSTURES_233.includes(posture);

  // ---- P2 referential integrity, and no reference in both lists
  const resolves = (r: PostureRef233): boolean => r.refKind === 'HAZARD_CANDIDATE'
    ? seen.candidateKeys.has(r.ref) : seen.declarationIds.has(r.ref);
  for (const r of [...requiredBy, ...accepted]) {
    if (!resolves(r)) codes.push('POSTURE_BASIS_REF_UNRESOLVED');
  }
  const requiredKeys = new Set(requiredBy.map(r => `${r.refKind}:${r.ref}`));
  for (const a of accepted) {
    if (requiredKeys.has(`${a.refKind}:${a.ref}`)) codes.push('POSTURE_BASIS_REF_DUPLICATED');
  }
  for (const id of resume.resolvedByDeclarationIds) {
    if (!seen.declarationIds.has(id)) codes.push('RESUME_CONDITION_REF_UNRESOLVED');
  }

  // ---- P3 coverage. Every self-asserted ACTIVE candidate and every emitted declaration is either
  // ---- a reason for the posture or consciously accepted. This is what removes the incentive to
  // ---- manufacture a declaration in order to have somewhere to put an instruction, and the
  // ---- acceptance list is what stops it becoming a stop-forcing rule.
  const covered = new Set([...requiredBy, ...accepted].map(r => `${r.refKind}:${r.ref}`));
  for (const k of seen.activeCandidateKeys) {
    if (!covered.has(`HAZARD_CANDIDATE:${k}`)) codes.push('ACTIVE_CANDIDATE_NOT_COVERED');
  }
  for (const id of seen.declarationIds) {
    if (!covered.has(`UNRESOLVED_DECLARATION:${id}`)) codes.push('DECLARATION_NOT_COVERED');
  }

  if (postureValid) {
    const permits = POSTURE_PERMITS_CONTINUED_WORK[posture];
    // ---- P4 a non-permitting posture must name what must become true, not when someone will look
    if (!permits
      && resume.resolvedByDeclarationIds.length === 0 && resume.correctionsRequired.length === 0) {
      codes.push('RESUME_CONDITION_EMPTY');
    }
    // ---- P5 two model-authored labels that cannot both be true
    if (posture === 'CONTINUE' && seen.blockingBoundDeclarationIds.size > 0) {
      codes.push('BLOCKING_CLARIFICATION_WITH_CONTINUE');
    }
    // ---- P6 controls and sequencing
    if (posture === 'CONTINUE_WITH_CONTROLS' && controls.length === 0) {
      codes.push('CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS');
    }
    if (posture === 'CONTINUE' && controls.length > 0) {
      codes.push('CONTROLS_PRESENT_UNDER_CONTINUE');
    }
    if (!permits && controls.some(c => c.timing === 'DURING_CONTINUED_WORK')) {
      codes.push('CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE');
    }
  }

  if (codes.length > 0) return refuse(codes, analysis, seen);

  const built: ImmediateSafetyPostureObject233 = {
    posture, requiredBy, acceptedWithoutImmediateAction: accepted,
    requiredControls: controls, resumeCondition: resume,
    whatHappensNow: String(p.whatHappensNow),
  };
  return {
    version: PROJECTION_233_VERSION,
    admitted: true,
    codes: [],
    invariantsViolated: [],
    posture: built,
    recommendationState: projectRecommendationState233(built),
    declarationSubordination: seen.declarations.map(d => ({
      declarationId: String(d.declarationId ?? '(unnamed)'),
      decisionWhileUnresolved: typeof d.decisionWhileUnresolved === 'string'
        ? d.decisionWhileUnresolved : null,
      authority: 'ADVISORY_NOT_AUTHORITATIVE' as const,
      authoritativePostureIs: posture,
      mayContradictAuthoritativePosture: false as const,
    })),
    preserved: null,
    mayPresentAsCompletedAnalysis: true,
  };
}

/** Refused whole. What was identified is preserved verbatim and cannot close the analysis. */
function refuse(
  codes: PostureRefusalCode233[], analysis: Record<string, unknown>,
  seen: ReturnType<typeof readAnalysis>,
): PostureProjectionResult233 {
  const unique = [...new Set(codes)];
  const raw = obj(analysis[POSTURE_FIELD]);
  return {
    version: PROJECTION_233_VERSION,
    admitted: false,
    codes: unique,
    invariantsViolated: [...new Set(unique.map(c => CODE_TO_INVARIANT_233[c]))],
    posture: null,
    recommendationState: null,
    declarationSubordination: seen.declarations.map(d => ({
      declarationId: String(d.declarationId ?? '(unnamed)'),
      decisionWhileUnresolved: typeof d.decisionWhileUnresolved === 'string'
        ? d.decisionWhileUnresolved : null,
      authority: 'ADVISORY_NOT_AUTHORITATIVE' as const,
      authoritativePostureIs: 'STOP' as ImmediateSafetyPosture233,
      mayContradictAuthoritativePosture: false as const,
    })),
    preserved: {
      recordKind: 'STRUCTURALLY_INVALID_POSTURE',
      presentFields: raw === null ? {} : { ...raw },
      refusalCodes: unique,
      admissible: false,
      mayCloseTheAnalysis: false,
      requiresUpstreamRepair: true,
    },
    mayPresentAsCompletedAnalysis: false,
  };
}

/** Identity, for the freeze record. */
export function projectionIdentity233(): Record<string, unknown> {
  return {
    projectionVersion: PROJECTION_233_VERSION,
    contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
    refusalCodes: [...POSTURE_REFUSAL_CODES_233],
    codeToInvariant: CODE_TO_INVARIANT_233,
    recommendationCompletenessCodes: [...RECOMMENDATION_COMPLETENESS_CODES_233],
    readsProseForMeaning: false,
    derivesPostureFromAnything: false,
  };
}
