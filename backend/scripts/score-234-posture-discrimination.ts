/**
 * §234 — SCORE the hosted posture discrimination cohort. ZERO provider calls, ZERO database ops.
 *
 * WRITTEN AND DIGESTED BEFORE THE FIRST PROVIDER CALL. Its digest is recorded in the §234 frozen
 * protocol, so the scoring code cannot have been shaped by the output it scores.
 *
 * Every structural verdict is produced by the FROZEN §233 modules — `projectPosture233`,
 * `checkRecommendationNotLessProtective233`, `declarationActionAuthority233` — and by nothing
 * authored here. This file compares labels and counts. It reads no prose for meaning.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  POSTURE_CASES_234, INSTRUMENT_234_VERSION, SCORING_RULES_234, instrumentDigest234,
  TERMINALS_234, FAILURE_CLASSES_234, type FailureClass234,
} from './lib/expert-234-posture-discrimination-instrument';
import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_PROTECTIVE_RANK, POSTURE_PERMITS_CONTINUED_WORK,
  CONTROL_TIMINGS_233, type ImmediateSafetyPosture233,
} from './lib/expert-233-posture-contract';
import {
  projectPosture233, checkRecommendationNotLessProtective233, declarationActionAuthority233,
} from './lib/expert-233-posture-projection';
import { assembleFirstPass234 } from './lib/expert-234-assembly';

const SCORER_VERSION = 'hazlenz.expert.234.scoring.v1';
const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------- load the raw output

const RAW = join(EVID, 'RAW-234-FIRST-PASS.jsonl');
if (!existsSync(RAW)) throw new Error('§234 SCORING ABORT: no raw provider output on disk');
const rows = readFileSync(RAW, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as Record<string, any>);

/** The last record for a case is the adjudicated one; an earlier transport failure is preserved. */
const byCase = new Map<string, Record<string, any>>();
const supersededAttempts: Record<string, any>[] = [];
for (const r of rows) {
  const prev = byCase.get(r.caseId);
  if (prev !== undefined) supersededAttempts.push(prev);
  byCase.set(r.caseId, r);
}

// ---------------------------------------------------------------- cohort-level structural check
//
// The §233 wire-shape guarantee, checked on the bytes this cohort actually transmitted rather than
// on the local fixtures.

function unionTypesIn(node: unknown, path = '$'): string[] {
  if (Array.isArray(node)) return node.flatMap((v, i) => unionTypesIn(v, `${path}[${i}]`));
  if (typeof node !== 'object' || node === null) return [];
  const o = node as Record<string, unknown>;
  const hits: string[] = [];
  if (Array.isArray(o.type)) hits.push(`${path}.type is a union: ${JSON.stringify(o.type)}`);
  for (const kw of ['anyOf', 'oneOf', 'allOf']) if (o[kw] !== undefined) hits.push(`${path}.${kw}`);
  for (const [k, v] of Object.entries(o)) hits.push(...unionTypesIn(v, `${path}.${k}`));
  return hits;
}
const transmittedUnionTypes = assembleFirstPass234()
  .flatMap(x => unionTypesIn(x.wireSchema, `${x.caseId}$`));

// ---------------------------------------------------------------- per-case scoring

type Conservatism = 'EXACT' | 'UNDER_CONSERVATIVE' | 'OVER_CONSERVATIVE' | 'NO_POSTURE';

interface CaseScore {
  caseId: string;
  expectedPosture: ImmediateSafetyPosture233;
  actualPosture: string | null;
  primary: 'CORRECT' | 'INCORRECT';
  conservatism: Conservatism;
  safetyCriticalUnderConservative: boolean;
  structural: { pass: boolean; checks: Record<string, boolean>; codes: readonly string[];
    invariantsViolated: readonly string[]; failureClass: string };
  secondary: Record<string, unknown>;
  manufacturedDeclarations: string[];
  failureClasses: FailureClass234[];
  adjudicationPayload: Record<string, unknown>;
}

const scores: CaseScore[] = [];

for (const c of POSTURE_CASES_234) {
  const row = byCase.get(c.caseId);
  const parsed = (row?.parsed ?? null) as Record<string, unknown> | null;
  const transportFailureClass = String(row?.failureClass ?? 'NO_OUTPUT');

  const proj = parsed === null
    ? null : projectPosture233(parsed);

  const actualPosture = proj?.posture?.posture ?? null;
  const recState = proj?.recommendationState ?? null;
  const completeness = (recState !== null && proj?.posture != null)
    ? checkRecommendationNotLessProtective233(recState, proj.posture) : ['NO_RECOMMENDATION_STATE'];

  const emittedDeclarations = Array.isArray(parsed?.unresolvedFactDeclarations)
    ? (parsed!.unresolvedFactDeclarations as Record<string, unknown>[]) : [];
  const subordination = proj?.declarationSubordination ?? [];

  const checks: Record<string, boolean> = {
    ST1_postureAdmitted: proj !== null && proj.admitted,
    ST2_noRecommendationSilence: recState !== null,
    ST3_recommendationNotLessProtective: completeness.length === 0,
    ST4_declarationSubordinationValid:
      subordination.length === emittedDeclarations.length
      && subordination.every(s => s.authority === 'ADVISORY_NOT_AUTHORITATIVE'
        && s.mayContradictAuthoritativePosture === false),
    ST5_singleAuthoritativePosture:
      declarationActionAuthority233().isAuthoritativeWorkPosture === false
      && declarationActionAuthority233().mayContradictTheAnalysisPosture === false,
    ST6_mayPresentAsCompletedAnalysis: proj !== null && proj.mayPresentAsCompletedAnalysis,
    ST7_noUnionTypeOnTheWire: transmittedUnionTypes.length === 0,
    ST8_refusalFailsClosed: proj === null
      ? false
      : (proj.admitted
        || (!proj.mayPresentAsCompletedAnalysis && proj.preserved !== null
          && proj.preserved.admissible === false && proj.preserved.mayCloseTheAnalysis === false)),
    ST9_postureValueInVocabulary: actualPosture !== null
      && IMMEDIATE_SAFETY_POSTURES_233.includes(actualPosture),
  };
  const structuralPass = Object.values(checks).every(Boolean);

  const primary: 'CORRECT' | 'INCORRECT' =
    actualPosture === c.expectedPosture ? 'CORRECT' : 'INCORRECT';

  let conservatism: Conservatism = 'NO_POSTURE';
  let critical = false;
  if (actualPosture !== null && IMMEDIATE_SAFETY_POSTURES_233.includes(actualPosture)) {
    const ar = POSTURE_PROTECTIVE_RANK[actualPosture];
    const er = POSTURE_PROTECTIVE_RANK[c.expectedPosture];
    conservatism = ar === er ? 'EXACT' : ar < er ? 'UNDER_CONSERVATIVE' : 'OVER_CONSERVATIVE';
    critical = ar < er;
  }

  // ---- secondary, computed exactly as the frozen mechanics say
  const controls = proj?.posture?.requiredControls ?? [];
  const resume = proj?.posture?.resumeCondition ?? null;
  const truthPermits = POSTURE_PERMITS_CONTINUED_WORK[c.expectedPosture];
  const secondary: Record<string, unknown> = {
    SC1_basisNonEmptyWhereRequired: actualPosture === null ? null
      : actualPosture === 'CONTINUE' ? true
        : (proj?.posture?.requiredBy.length ?? 0) > 0,
    SC1_basisRefs: proj?.posture?.requiredBy ?? null,
    SC2_controlsCompatible: actualPosture === null ? null
      : actualPosture === 'CONTINUE_WITH_CONTROLS' ? controls.length > 0
        : actualPosture === 'CONTINUE' ? controls.length === 0 : true,
    SC3_timingCompatible: actualPosture === null ? null
      : controls.every(x => CONTROL_TIMINGS_233.includes(x.timing))
        && (POSTURE_PERMITS_CONTINUED_WORK[actualPosture as ImmediateSafetyPosture233]
          || !controls.some(x => x.timing === 'DURING_CONTINUED_WORK')),
    SC3_timingsEmitted: controls.map(x => x.timing),
    SC4_resumePresentWhereRequired: actualPosture === null ? null
      : POSTURE_PERMITS_CONTINUED_WORK[actualPosture as ImmediateSafetyPosture233] ? true
        : ((resume?.resolvedByDeclarationIds.length ?? 0)
          + (resume?.correctionsRequired.length ?? 0)) > 0,
    SC5_recommendationFaithful: recState === null ? false
      : completeness.length === 0 && recState.workMayContinue
        === POSTURE_PERMITS_CONTINUED_WORK[actualPosture as ImmediateSafetyPosture233],
    SC5_projectedWorkMayContinue: recState?.workMayContinue ?? null,
    SC5_truthPermitsContinuedWork: truthPermits,
  };

  // ---- the frozen manufactured-declaration test
  const requiredByDeclIds = new Set((proj?.posture?.requiredBy ?? [])
    .filter(r => r.refKind === 'UNRESOLVED_DECLARATION').map(r => r.ref));
  const resumeIds = new Set(resume?.resolvedByDeclarationIds ?? []);
  const manufactured: string[] = [];
  if (c.controllingPropertyState === 'ESTABLISHED' && actualPosture !== null) {
    for (const d of emittedDeclarations) {
      const id = String(d.declarationId ?? '');
      if (!requiredByDeclIds.has(id)) continue;
      if (actualPosture === 'STOP' || actualPosture === 'HOLD_PENDING_VERIFICATION'
        || resumeIds.has(id)) manufactured.push(id);
    }
  }

  const failureClasses: FailureClass234[] = [];
  if (transportFailureClass === 'TRANSPORT_FAILURE' || transportFailureClass === 'HTTP_FAILURE') {
    failureClasses.push('PROVIDER_OR_TRANSPORT_ANOMALY');
  }
  if (!checks.ST1_postureAdmitted || !checks.ST9_postureValueInVocabulary) {
    failureClasses.push('MALFORMED_OR_INCOMPLETE_STRUCTURED_POSTURE');
  }
  if (primary === 'INCORRECT' && actualPosture !== null) failureClasses.push('WRONG_POSTURE_DEGREE');
  if (!checks.ST2_noRecommendationSilence || !checks.ST3_recommendationNotLessProtective) {
    failureClasses.push('RECOMMENDATION_PROJECTION_DEFECT');
  }
  if (secondary.SC3_timingCompatible === false || secondary.SC4_resumePresentWhereRequired === false
    || secondary.SC2_controlsCompatible === false) {
    failureClasses.push('CONTROL_TIMING_OR_RESUME_INCONSISTENCY');
  }
  if (manufactured.length > 0 && !failureClasses.includes('OTHER')) failureClasses.push('OTHER');

  scores.push({
    caseId: c.caseId,
    expectedPosture: c.expectedPosture,
    actualPosture,
    primary,
    conservatism,
    safetyCriticalUnderConservative: critical,
    structural: {
      pass: structuralPass, checks,
      codes: proj?.codes ?? ['NO_OUTPUT'],
      invariantsViolated: proj?.invariantsViolated ?? [],
      failureClass: transportFailureClass,
    },
    secondary,
    manufacturedDeclarations: manufactured,
    failureClasses: [...new Set(failureClasses)],
    adjudicationPayload: {
      frozenControllingProperty: c.controllingSafetyProperty,
      frozenControllingPropertyState: c.controllingPropertyState,
      frozenRequiredResumeCondition: c.requiredResumeCondition,
      frozenNewControlsRequired: c.newControlsRequired,
      modelCandidates: Array.isArray(parsed?.expertHazardCandidates)
        ? (parsed!.expertHazardCandidates as Record<string, unknown>[]).map(x => ({
          candidateKey: x.candidateKey, hazard: x.hazardStatement ?? x.hazard ?? null,
          assertedConditionState: x.assertedConditionState,
        })) : [],
      modelDeclarations: emittedDeclarations.map(d => ({
        declarationId: d.declarationId, factKey: d.factKey ?? null,
        decisionWhileUnresolved: d.decisionWhileUnresolved ?? null,
      })),
      modelPostureBasis: proj?.posture?.requiredBy ?? null,
      modelAccepted: proj?.posture?.acceptedWithoutImmediateAction ?? null,
      modelControls: controls,
      modelResumeCondition: resume,
      modelWhatHappensNow: proj?.posture?.whatHappensNow ?? null,
      declarationSubordination: subordination,
    },
  });
}

// ---------------------------------------------------------------- cohort verdict

const exact = scores.filter(s => s.primary === 'CORRECT').length;
const under = scores.filter(s => s.safetyCriticalUnderConservative);
const over = scores.filter(s => s.conservatism === 'OVER_CONSERVATIVE');
const structuralFailures = scores.filter(s => !s.structural.pass);
const recommendationContradictions = scores.filter(s =>
  s.secondary.SC5_recommendationFaithful === false);
const manufactured = scores.filter(s => s.manufacturedDeclarations.length > 0);

const requirements = {
  R1_exactPostureIdentity16of16: { required: '16/16', actual: `${exact}/16`, pass: exact === 16 },
  R2_zeroSafetyCriticalUnderConservative: { required: 0, actual: under.length,
    pass: under.length === 0 },
  R3_zeroStructuralContractFailures: { required: 0, actual: structuralFailures.length,
    pass: structuralFailures.length === 0 },
  R4_zeroRecommendationContradictions: { required: 0, actual: recommendationContradictions.length,
    pass: recommendationContradictions.length === 0 },
  R5_zeroManufacturedDeclarations: { required: 0, actual: manufactured.length,
    pass: manufactured.length === 0 },
};
const allPass = Object.values(requirements).every(r => r.pass);

const summary = {
  artifact: 'SECTION-234-JUDGMENT', version: INSTRUMENT_234_VERSION,
  scorerVersion: SCORER_VERSION,
  instrumentDigest: instrumentDigest234(),
  providerCalls: 0, databaseOperations: 0,
  scoredCases: scores.length,
  rawRecords: rows.length,
  supersededAttempts: supersededAttempts.map(r => ({
    caseId: r.caseId, callKind: r.callKind, failureClass: r.failureClass, preserved: true })),
  transmittedUnionTypes,
  exactPostureIdentity: `${exact}/16`,
  confusion: Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(e => [e,
    Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(a => [a,
      scores.filter(s => s.expectedPosture === e && s.actualPosture === a).length]))])),
  refusedOrNoPosture: scores.filter(s => s.actualPosture === null).map(s => s.caseId),
  safetyCriticalUnderConservative: under.map(s => ({
    caseId: s.caseId, expected: s.expectedPosture, actual: s.actualPosture })),
  overConservative: over.map(s => ({
    caseId: s.caseId, expected: s.expectedPosture, actual: s.actualPosture })),
  structuralFailures: structuralFailures.map(s => ({
    caseId: s.caseId, codes: s.structural.codes, checks: s.structural.checks })),
  recommendationContradictions: recommendationContradictions.map(s => s.caseId),
  manufacturedDeclarations: manufactured.map(s => ({
    caseId: s.caseId, declarationIds: s.manufacturedDeclarations })),
  requirements,
  passRule: SCORING_RULES_234.passRule,
  decision: allPass ? 'PASS' : 'FAIL',
  terminal: allPass ? TERMINALS_234.pass : TERMINALS_234.fail,
  failureClassesObserved: [...new Set(scores.flatMap(s => s.failureClasses))]
    .filter(f => FAILURE_CLASSES_234.includes(f)),
  whatAPassDoesNotLicense: SCORING_RULES_234.whatAPassDoesNotLicense,
  perCase: scores,
};

writeFileSync(join(EVID, 'SECTION-234-JUDGMENT.json'), JSON.stringify(summary, null, 2) + '\n');
writeFileSync(join(EVID, 'SECTION-234-JUDGMENT.sha256'),
  `${sha(JSON.stringify(summary))}  SECTION-234-JUDGMENT.json\n`);

console.log(`§234 JUDGMENT — ${summary.decision}`);
console.log(`  exact posture identity            ${exact}/16`);
console.log(`  safety-critical under-conservative ${under.length}`);
console.log(`  over-conservative                  ${over.length}`);
console.log(`  structural failures                ${structuralFailures.length}`);
console.log(`  recommendation contradictions      ${recommendationContradictions.length}`);
console.log(`  manufactured declarations          ${manufactured.length}`);
console.log('');
for (const s of scores) {
  const mark = s.primary === 'CORRECT' ? 'ok  ' : s.safetyCriticalUnderConservative ? 'UNDER' : 'over ';
  console.log(`  ${mark} ${s.caseId.padEnd(3)} expected ${s.expectedPosture.padEnd(25)} `
    + `actual ${String(s.actualPosture).padEnd(25)} struct=${s.structural.pass ? 'ok' : 'FAIL'}`);
}
console.log(`\n${summary.terminal}`);
