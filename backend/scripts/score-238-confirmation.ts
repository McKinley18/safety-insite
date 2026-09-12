/**
 * §238 — SCORE the final posture semantic confirmation. ZERO provider calls, ZERO database ops.
 *
 * WRITTEN AND DIGESTED BEFORE THE FIRST PROVIDER CALL. Its digest is recorded in the §238 frozen
 * protocol, so the scoring code cannot have been shaped by the output it scores.
 *
 * ==================== TWO VERDICTS, NEVER COLLAPSED ====================
 *
 * POSTURE IDENTITY and DRIVER-ROLE IDENTITY are computed separately and reported in a four-cell
 * table. A correct posture reached through the wrong semantic role is recorded as exactly that, and
 * it fails the cohort.
 *
 * Driver-role identity is decided on ROLE PRESENCE, because the model authors its own identifiers
 * and the frozen truth cannot name them. For each of the two decision-carrying roles the truth says
 * AT_LEAST_ONE, NONE or NOT_SCORED, and the scorer reads that off the admitted basis with no prose
 * and no adjudication.
 *
 * Every structural verdict comes from the frozen §233, §235 and §237 modules. This file compares
 * labels, resolves references and counts.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CONFIRMATION_CASES_238, INSTRUMENT_238_VERSION, SCORING_RULES_238, instrumentDigest238,
  TERMINALS_238,
} from './lib/expert-238-confirmation-instrument';
import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_PROTECTIVE_RANK, POSTURE_PERMITS_CONTINUED_WORK,
  CONTROL_TIMINGS_233, POSTURE_FIELD, type ImmediateSafetyPosture233,
} from './lib/expert-233-posture-contract';
import { checkRecommendationNotLessProtective233 } from './lib/expert-233-posture-projection';
import {
  POSTURE_DRIVER_ROLES_237, CESSATION_ROLE_237, DRIVER_ROLE_FIELD,
  type PostureDriverRole237,
} from './lib/expert-237-posture-contract';
import { projectPosture237 } from './lib/expert-237-posture-projection';
import { assembleFirstPass238 } from './lib/expert-238-assembly';

const SCORER_VERSION = 'hazlenz.expert.238.scoring.v1';
const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const RAW = join(EVID, 'RAW-238-FIRST-PASS.jsonl');
if (!existsSync(RAW)) throw new Error('§238 SCORING ABORT: no raw provider output on disk');
const rows = readFileSync(RAW, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as Record<string, any>);
const byCase = new Map<string, Record<string, any>>();
for (const r of rows) byCase.set(r.caseId, r);
const asm = new Map(assembleFirstPass238().map(x => [x.caseId, x]));

function unionTypesIn(node: unknown, path = '$'): string[] {
  if (Array.isArray(node)) return node.flatMap((v, i) => unionTypesIn(v, `${path}[${i}]`));
  if (typeof node !== 'object' || node === null) return [];
  const o = node as Record<string, unknown>;
  const hits: string[] = [];
  if (Array.isArray(o.type)) hits.push(`${path}.type`);
  for (const kw of ['anyOf', 'oneOf', 'allOf']) if (o[kw] !== undefined) hits.push(`${path}.${kw}`);
  for (const [k, v] of Object.entries(o)) hits.push(...unionTypesIn(v, `${path}.${k}`));
  return hits;
}
const transmittedUnionTypes = [...asm.values()]
  .flatMap(x => unionTypesIn(x.wireSchema, `${x.caseId}$`));

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Raw array length without normalizing, for the fail-open guard. UNKNOWN is never treated as 0. */
function rawArrayCount(raw: unknown, field: string): number | 'UNKNOWN' {
  if (!isObj(raw)) return 'UNKNOWN';
  let body = raw;
  const keys = Object.keys(raw);
  if (keys.length === 1 && !(field in raw) && isObj(raw[keys[0]])) {
    body = raw[keys[0]] as Record<string, unknown>;
  }
  const v = body[field];
  if (Array.isArray(v)) return v.length;
  if (v === undefined || v === null) return 0;
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v) as unknown;
      if (Array.isArray(p)) return p.length;
      if (isObj(p) && Array.isArray(p[field])) return (p[field] as unknown[]).length;
      return 'UNKNOWN';
    } catch { return 'UNKNOWN'; }
  }
  return 'UNKNOWN';
}

type Conservatism = 'EXACT' | 'UNDER_CONSERVATIVE' | 'OVER_CONSERVATIVE' | 'NO_POSTURE';
type Cell = 'POSTURE_OK_ROLES_OK' | 'POSTURE_OK_ROLES_WRONG' | 'POSTURE_WRONG_ROLES_OK'
  | 'POSTURE_WRONG_ROLES_WRONG' | 'NOT_ADMITTED';

interface CaseScore238 {
  caseId: string; category: string;
  expectedPosture: ImmediateSafetyPosture233; actualPosture: string | null;
  admissible: boolean;
  postureIdentity: 'CORRECT' | 'INCORRECT';
  conservatism: Conservatism;
  unsafeUnderConservative: boolean; overConservative: boolean;
  driverRoleIdentity: 'CORRECT' | 'INCORRECT' | 'NOT_ADMITTED';
  cell: Cell;
  roles: {
    emitted: { ref: string; refKind: string; role: string }[];
    cessationCount: number; controllingCount: number;
    expected: Record<string, string>;
    falseCessationDriver: boolean;
    missingCessationDriver: boolean;
    responseUncertaintyElevated: boolean;
    missingControllingDriver: boolean;
    violations: string[];
  };
  normalization: Record<string, unknown>;
  failOpen: { isFailOpen: boolean; detail: string[] };
  manufacturedDeclarations: string[];
  contractChecks: Record<string, boolean>;
  recommendation: { faithful: boolean; codes: string[] };
  adjudicationPayload: Record<string, unknown>;
}

const scores: CaseScore238[] = [];

for (const c of CONFIRMATION_CASES_238) {
  const row = byCase.get(c.caseId);
  const raw = (row?.parsed ?? null) as unknown;
  const transportClass = String(row?.failureClass ?? 'NO_OUTPUT');
  const schema = asm.get(c.caseId)!.wireSchema;

  const proj = projectPosture237(raw, schema);
  const n = proj.normalization;
  const seen = (n.analysis ?? {}) as Record<string, unknown>;
  const actualPosture = proj.posture?.posture ?? null;
  const admissible = proj.admitted;

  // ---- FAIL-OPEN GUARD
  const failDetail: string[] = [];
  if (admissible) {
    for (const field of ['expertHazardCandidates', 'unresolvedFactDeclarations',
      'decisionCriticalClarifications']) {
      const rawN = rawArrayCount(raw, field);
      const seenV = seen[field];
      const seenN = Array.isArray(seenV) ? seenV.length : (seenV === undefined ? 0 : 'UNPARSED');
      if (rawN === 'UNKNOWN' || seenN === 'UNPARSED') {
        failDetail.push(`${field}: admitted while the raw value could not be counted`);
      } else if (seenN < rawN) {
        failDetail.push(`${field}: raw carried ${rawN}, the projection saw ${seenN}`);
      }
    }
  }
  const failOpen = { isFailOpen: failDetail.length > 0, detail: failDetail };

  // ---- POSTURE IDENTITY
  const postureIdentity: 'CORRECT' | 'INCORRECT' =
    actualPosture === c.expectedPosture ? 'CORRECT' : 'INCORRECT';
  let conservatism: Conservatism = 'NO_POSTURE';
  let under = false; let over = false;
  if (actualPosture !== null && IMMEDIATE_SAFETY_POSTURES_233.includes(actualPosture)) {
    const ar = POSTURE_PROTECTIVE_RANK[actualPosture];
    const er = POSTURE_PROTECTIVE_RANK[c.expectedPosture];
    conservatism = ar === er ? 'EXACT' : ar < er ? 'UNDER_CONSERVATIVE' : 'OVER_CONSERVATIVE';
    under = ar < er; over = ar > er;
  }

  // ---- DRIVER-ROLE IDENTITY, on presence
  const emitted = (proj.posture?.requiredBy ?? []).map(d => ({
    ref: d.ref, refKind: d.refKind, role: d.driverRole as string,
  }));
  const cessationCount = emitted.filter(d => d.role === CESSATION_ROLE_237).length;
  const controllingCount = emitted
    .filter(d => d.role === 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION').length;
  const expCess = c.expectedRolePresence.ESTABLISHED_CONDITION_REQUIRING_CESSATION;
  const expCtrl = c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION;
  const violations: string[] = [];
  const falseCessationDriver = expCess === 'NONE' && cessationCount > 0;
  const missingCessationDriver = expCess === 'AT_LEAST_ONE' && cessationCount === 0;
  const responseUncertaintyElevated = expCtrl === 'NONE' && controllingCount > 0;
  const missingControllingDriver = expCtrl === 'AT_LEAST_ONE' && controllingCount === 0;
  if (falseCessationDriver) violations.push('FALSE_CESSATION_DRIVER');
  if (missingCessationDriver) violations.push('MISSING_CESSATION_DRIVER');
  if (responseUncertaintyElevated) violations.push('RESPONSE_UNCERTAINTY_ELEVATED_TO_CONTROLLING');
  if (missingControllingDriver) violations.push('MISSING_CONTINUATION_CONTROLLING_DRIVER');
  const driverRoleIdentity: 'CORRECT' | 'INCORRECT' | 'NOT_ADMITTED' =
    !admissible ? 'NOT_ADMITTED' : violations.length === 0 ? 'CORRECT' : 'INCORRECT';

  const cell: Cell = !admissible ? 'NOT_ADMITTED'
    : postureIdentity === 'CORRECT'
      ? (driverRoleIdentity === 'CORRECT' ? 'POSTURE_OK_ROLES_OK' : 'POSTURE_OK_ROLES_WRONG')
      : (driverRoleIdentity === 'CORRECT' ? 'POSTURE_WRONG_ROLES_OK' : 'POSTURE_WRONG_ROLES_WRONG');

  // ---- manufactured declarations, the frozen §234 test carried forward unchanged
  const declsSeen = Array.isArray(seen.unresolvedFactDeclarations)
    ? seen.unresolvedFactDeclarations as Record<string, unknown>[] : [];
  const requiredByDeclIds = new Set(emitted
    .filter(d => d.refKind === 'UNRESOLVED_DECLARATION').map(d => d.ref));
  const resumeIds = new Set(proj.posture?.resumeCondition.resolvedByDeclarationIds ?? []);
  const manufactured: string[] = [];
  if (c.controllingPropertyState === 'ESTABLISHED' && actualPosture !== null) {
    for (const d of declsSeen) {
      const id = String(d.declarationId ?? '');
      if (!requiredByDeclIds.has(id)) continue;
      if (actualPosture === 'STOP' || actualPosture === 'HOLD_PENDING_VERIFICATION'
        || resumeIds.has(id)) manufactured.push(id);
    }
  }

  // ---- contract admission checks
  const recState = proj.recommendationState;
  const completeness = (recState !== null && proj.posture !== null)
    ? checkRecommendationNotLessProtective233(recState, proj.posture) : ['NO_RECOMMENDATION_STATE'];
  const controls = proj.posture?.requiredControls ?? [];
  const contractChecks: Record<string, boolean> = {
    K01_requiredByStructureValid: !proj.codes.includes('POSTURE_BASIS_NOT_AN_ARRAY')
      && !proj.codes.includes('POSTURE_BASIS_ITEM_MALFORMED'),
    K02_refValid: !proj.codes.includes('POSTURE_BASIS_REF_UNRESOLVED')
      && !proj.codes.includes('POSTURE_BASIS_REF_DUPLICATED'),
    K03_refKindValid: !proj.codes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'),
    K04_driverRoleValid: !proj.codes.includes('POSTURE_DRIVER_ROLE_MISSING')
      && !proj.codes.includes('POSTURE_DRIVER_ROLE_INVALID')
      && emitted.every(d => POSTURE_DRIVER_ROLES_237.includes(d.role as PostureDriverRole237)),
    K05_noContradictoryDriverPostureState:
      !proj.codes.includes('ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE'),
    K06_cessationDriverForcesStop: cessationCount === 0 || actualPosture === 'STOP',
    K07_stopNotSupportedSolelyByControlLevelDrivers:
      !proj.codes.includes('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'),
    K08_coverageValid: !proj.codes.includes('DECLARATION_NOT_COVERED')
      && !proj.codes.includes('ACTIVE_CANDIDATE_NOT_COVERED'),
    K09_controlsAndTimingValid: controls.every(x => CONTROL_TIMINGS_233.includes(x.timing))
      && !proj.codes.includes('CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS')
      && !proj.codes.includes('CONTROLS_PRESENT_UNDER_CONTINUE')
      && !proj.codes.includes('CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE'),
    K10_resumeRuleValid: !proj.codes.includes('RESUME_CONDITION_EMPTY')
      && !proj.codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE')
      && !proj.codes.includes('RESUME_CONDITION_REF_UNRESOLVED'),
    K11_recommendationAgreesWithPosture: recState !== null && completeness.length === 0
      && recState.workMayContinue
        === POSTURE_PERMITS_CONTINUED_WORK[actualPosture as ImmediateSafetyPosture233],
    K12_noFailOpen: !failOpen.isFailOpen,
    K13_normalizationLossless: n.changedContainerOnly === true
      && n.semanticFieldsInventedOrRepaired === 0,
    K14_noUnionOnTheWire: transmittedUnionTypes.length === 0,
  };

  scores.push({
    caseId: c.caseId, category: c.category,
    expectedPosture: c.expectedPosture, actualPosture, admissible,
    postureIdentity, conservatism, unsafeUnderConservative: under, overConservative: over,
    driverRoleIdentity, cell,
    roles: {
      emitted, cessationCount, controllingCount,
      expected: { cessation: expCess, controlling: expCtrl },
      falseCessationDriver, missingCessationDriver,
      responseUncertaintyElevated, missingControllingDriver, violations,
    },
    normalization: {
      anomaliesObserved: n.anomaliesObserved,
      envelopeAction: n.envelope?.action ?? null,
      fieldActions: n.fields.map(f => ({ field: f.field, action: f.action })),
      failsClosed: n.failsClosed, failClosedReasons: n.failClosedReasons,
      neededNormalization: (n.envelope?.action ?? 'NONE') !== 'NONE' || n.fields.length > 0,
    },
    failOpen, manufacturedDeclarations: manufactured, contractChecks,
    recommendation: { faithful: contractChecks.K11_recommendationAgreesWithPosture,
      codes: completeness as string[] },
    adjudicationPayload: {
      transportFailureClass: transportClass,
      frozenControllingProperty: c.controllingSafetyProperty,
      frozenControllingPropertyState: c.controllingPropertyState,
      frozenExpectedControllingDriverRole: c.expectedControllingDriverRole,
      frozenExpectedControllingDriverDescription: c.expectedControllingDriverDescription,
      frozenDistractor: c.distractor,
      frozenRequiredResumeCondition: c.requiredResumeCondition,
      frozenNewControlsRequired: c.newControlsRequired,
      modelCandidates: (Array.isArray(seen.expertHazardCandidates)
        ? seen.expertHazardCandidates as Record<string, unknown>[] : [])
        .map(x => ({ candidateKey: x.candidateKey, state: x.assertedConditionState })),
      modelDeclarations: declsSeen.map(d => ({ declarationId: d.declarationId,
        affectedDecision: d.affectedDecision ?? null,
        decisionWhileUnresolved: d.decisionWhileUnresolved ?? null })),
      modelBasisWithRoles: emitted,
      modelAccepted: proj.posture?.acceptedWithoutImmediateAction ?? null,
      modelControls: controls,
      modelResumeCondition: proj.posture?.resumeCondition ?? null,
      modelWhatHappensNow: proj.posture?.whatHappensNow ?? null,
      derivedCessationDrivers: proj.derivedCessationDrivers,
      refusalCodes: proj.codes,
      declarationSubordination: proj.declarationSubordination,
    },
  });
}

// ---------------------------------------------------------------- cohort verdict

const admitted = scores.filter(s => s.admissible).length;
const postureOk = scores.filter(s => s.postureIdentity === 'CORRECT').length;
const rolesOk = scores.filter(s => s.driverRoleIdentity === 'CORRECT').length;
const under = scores.filter(s => s.unsafeUnderConservative);
const over = scores.filter(s => s.overConservative);
const failOpen = scores.filter(s => s.failOpen.isFailOpen);
const manufactured = scores.filter(s => s.manufacturedDeclarations.length > 0
  && s.postureIdentity === 'INCORRECT');
const elevated = scores.filter(s => s.roles.responseUncertaintyElevated);
const falseCess = scores.filter(s => s.roles.falseCessationDriver);
const missingCess = scores.filter(s => s.roles.missingCessationDriver);
const recBad = scores.filter(s => s.admissible && !s.recommendation.faithful);
const contractBad = scores.filter(s => Object.values(s.contractChecks).some(v => !v));

const requirements = {
  R1_allAdmitted: { required: '6/6', actual: `${admitted}/6`, pass: admitted === 6 },
  R2_exactPostureIdentity: { required: '6/6', actual: `${postureOk}/6`, pass: postureOk === 6 },
  R3_driverRoleIdentity: { required: '6/6', actual: `${rolesOk}/6`, pass: rolesOk === 6 },
  R4_zeroUnsafeUnderConservative: { required: 0, actual: under.length, pass: under.length === 0 },
  R5_zeroOverConservative: { required: 0, actual: over.length, pass: over.length === 0 },
  R6_zeroManufacturedUncertaintyAlteringPosture: {
    required: 0, actual: manufactured.length, pass: manufactured.length === 0 },
  R7_zeroResponseUncertaintyElevated: {
    required: 0, actual: elevated.length, pass: elevated.length === 0 },
  R8_zeroFalseCessationDrivers: {
    required: 0, actual: falseCess.length, pass: falseCess.length === 0 },
  R9_zeroRecommendationContradictions: {
    required: 0, actual: recBad.length, pass: recBad.length === 0 },
  R10_zeroStructuralContractFailures: {
    required: 0, actual: contractBad.length, pass: contractBad.length === 0 },
  R11_zeroFailOpen: { required: 0, actual: failOpen.length, pass: failOpen.length === 0 },
};
const allPass = Object.values(requirements).every(r => r.pass);

const summary = {
  artifact: 'SECTION-238-JUDGMENT', version: INSTRUMENT_238_VERSION,
  scorerVersion: SCORER_VERSION, instrumentDigest: instrumentDigest238(),
  providerCalls: 0, databaseOperations: 0,
  scoredCases: scores.length, rawRecords: rows.length,
  transmittedUnionTypes,
  admitted: `${admitted}/6`,
  exactPostureIdentity: `${postureOk}/6`,
  driverRoleIdentity: `${rolesOk}/6`,
  fourCellTable: Object.fromEntries((['POSTURE_OK_ROLES_OK', 'POSTURE_OK_ROLES_WRONG',
    'POSTURE_WRONG_ROLES_OK', 'POSTURE_WRONG_ROLES_WRONG', 'NOT_ADMITTED'] as Cell[])
    .map(cell => [cell, scores.filter(s => s.cell === cell).map(s => s.caseId)])),
  arrival: {
    admittedWithoutAnyNormalization: scores
      .filter(s => s.admissible && s.normalization.neededNormalization !== true).map(s => s.caseId),
    admittedAfterSafeNormalization: scores
      .filter(s => s.admissible && s.normalization.neededNormalization === true).map(s => s.caseId),
    refused: scores.filter(s => !s.admissible)
      .map(s => ({ caseId: s.caseId, codes: s.adjudicationPayload.refusalCodes })),
    anomalyClassesObserved: [...new Set(scores
      .flatMap(s => s.normalization.anomaliesObserved as string[]))],
    driverRoleArrivedOnEveryBasisEntry: scores.every(s =>
      !(s.adjudicationPayload.refusalCodes as string[]).includes('POSTURE_DRIVER_ROLE_MISSING')),
  },
  confusion: Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(e => [e,
    Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(a => [a,
      scores.filter(s => s.expectedPosture === e && s.actualPosture === a).length]))])),
  byCategory: Object.fromEntries(['ESTABLISHED_STOP_WITH_DISTRACTOR', 'LEGITIMATE_HOLD',
    'PERMISSIVE_WITH_RESPONSE_UNCERTAINTY'].map(cat => [cat, {
    cases: scores.filter(s => s.category === cat).map(s => s.caseId),
    admitted: scores.filter(s => s.category === cat && s.admissible).length,
    postureCorrect: scores.filter(s => s.category === cat && s.postureIdentity === 'CORRECT').length,
    rolesCorrect: scores.filter(s => s.category === cat && s.driverRoleIdentity === 'CORRECT').length,
  }])),
  unsafeUnderConservative: under.map(s => ({ caseId: s.caseId, expected: s.expectedPosture,
    actual: s.actualPosture })),
  overConservative: over.map(s => ({ caseId: s.caseId, expected: s.expectedPosture,
    actual: s.actualPosture })),
  responseUncertaintyElevated: elevated.map(s => ({ caseId: s.caseId,
    controllingDrivers: s.roles.emitted
      .filter(d => d.role === 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION') })),
  falseCessationDrivers: falseCess.map(s => ({ caseId: s.caseId,
    drivers: s.roles.emitted.filter(d => d.role === CESSATION_ROLE_237) })),
  missingCessationDrivers: missingCess.map(s => s.caseId),
  manufacturedUncertainty: manufactured.map(s => ({ caseId: s.caseId,
    declarationIds: s.manufacturedDeclarations })),
  recommendationContradictions: recBad.map(s => s.caseId),
  contractRequirementFailures: contractBad.map(s => ({ caseId: s.caseId,
    failed: Object.entries(s.contractChecks).filter(([, v]) => !v).map(([k]) => k) })),
  failOpen: failOpen.map(s => ({ caseId: s.caseId, detail: s.failOpen.detail })),
  requirements,
  passRule: SCORING_RULES_238.passRule,
  decision: allPass ? 'PASS' : 'FAIL',
  terminal: allPass ? TERMINALS_238.pass : TERMINALS_238.fail,
  interpretationLimit: SCORING_RULES_238.interpretationLimit,
  theFourOptionsIfItFails: SCORING_RULES_238.theFourOptionsIfItFails,
  perCase: scores,
};

writeFileSync(join(EVID, 'SECTION-238-JUDGMENT.json'), JSON.stringify(summary, null, 2) + '\n');
writeFileSync(join(EVID, 'SECTION-238-JUDGMENT.sha256'),
  `${sha(JSON.stringify(summary))}  SECTION-238-JUDGMENT.json\n`);

console.log(`§238 JUDGMENT — ${summary.decision}`);
console.log(`  admitted                          ${admitted}/6`);
console.log(`  exact posture identity            ${postureOk}/6`);
console.log(`  driver-role identity              ${rolesOk}/6`);
console.log(`  unsafe under-conservative         ${under.length}`);
console.log(`  over-conservative                 ${over.length}`);
console.log(`  response uncertainty elevated     ${elevated.length}`);
console.log(`  false cessation drivers           ${falseCess.length}`);
console.log(`  missing cessation drivers         ${missingCess.length}`);
console.log(`  manufactured altering posture     ${manufactured.length}`);
console.log(`  recommendation contradictions     ${recBad.length}`);
console.log(`  structural contract failures      ${contractBad.length}`);
console.log(`  fail-open outcomes                ${failOpen.length}`);
console.log(`  needed safe normalization         ${scores.filter(s => s.normalization.neededNormalization === true).length}/6`);
console.log('');
for (const s of scores) {
  const mark = !s.admissible ? 'REFUSED' : s.cell === 'POSTURE_OK_ROLES_OK' ? 'ok     '
    : s.cell === 'POSTURE_OK_ROLES_WRONG' ? 'ROLES  '
      : s.unsafeUnderConservative ? 'UNDER  ' : 'OVER   ';
  console.log(`  ${mark} ${s.caseId} ${s.category.padEnd(38)} `
    + `exp ${s.expectedPosture.padEnd(25)} act ${String(s.actualPosture).padEnd(25)} `
    + `cess=${s.roles.cessationCount}/${s.roles.expected.cessation} `
    + `ctrl=${s.roles.controllingCount}/${s.roles.expected.controlling}`
    + `${s.roles.violations.length ? '  ' + s.roles.violations.join(',') : ''}`);
}
console.log(`\n${summary.terminal}`);
