/**
 * §236 — SCORE the stabilized-contract confirmation. ZERO provider calls, ZERO database operations.
 *
 * WRITTEN AND DIGESTED BEFORE THE FIRST PROVIDER CALL. Its digest is recorded in the §236 frozen
 * protocol, so the scoring code cannot have been shaped by the output it scores.
 *
 * Every structural verdict comes from the FROZEN §233 and §235 modules — `projectPosture235`,
 * `checkRecommendationNotLessProtective233` — and from nothing authored here. This file compares
 * labels, resolves references and counts. It reads no prose for meaning.
 *
 * ==================== THE FAIL-OPEN GUARD, IMPLEMENTED RATHER THAN ASSERTED ====================
 *
 * The §236 authorization singles out candidate parsing. For every case this scorer compares the
 * candidate and declaration arrays PRESENT IN THE RAW OUTPUT with the arrays the projection
 * actually saw, and any shrink on an admitted case is a FAIL_OPEN. A coverage check that passed
 * because state disappeared during normalization is a §236 failure, not a pass.
 *
 * ==================== BOTH DIRECTIONS OF THE §235 CONSTRAINT ====================
 *
 * The cessation list can fail by not firing and by firing wrongly. A case whose frozen truth says
 * MUST_BE_POPULATED and comes back empty on a STOP is a missing cessation driver. A case whose
 * frozen truth says MUST_BE_EMPTY and comes back populated is a FALSE cessation candidate, and if
 * it escalated the posture it is an over-conservative failure. Both are counted.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CONFIRMATION_CASES_236, INSTRUMENT_236_VERSION, SCORING_RULES_236, instrumentDigest236,
  TERMINALS_236, FAILURE_CLASSES_236, type FailureClass236,
} from './lib/expert-236-confirmation-instrument';
import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_PROTECTIVE_RANK, POSTURE_PERMITS_CONTINUED_WORK,
  CONTROL_TIMINGS_233, POSTURE_FIELD, type ImmediateSafetyPosture233,
} from './lib/expert-233-posture-contract';
import { checkRecommendationNotLessProtective233 } from './lib/expert-233-posture-projection';
import { CESSATION_FIELD } from './lib/expert-235-posture-contract';
import { projectPosture235 } from './lib/expert-235-posture-projection';
import { assembleFirstPass236 } from './lib/expert-236-assembly';

const SCORER_VERSION = 'hazlenz.expert.236.scoring.v1';
const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

const RAW = join(EVID, 'RAW-236-FIRST-PASS.jsonl');
if (!existsSync(RAW)) throw new Error('§236 SCORING ABORT: no raw provider output on disk');
const rows = readFileSync(RAW, 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l) as Record<string, any>);
const byCase = new Map<string, Record<string, any>>();
for (const r of rows) byCase.set(r.caseId, r);
const asm = new Map(assembleFirstPass236().map(x => [x.caseId, x]));

// ---------------------------------------------------------------- cohort-level wire shape

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

// ---------------------------------------------------------------- helpers

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * How many entries a structured array carries in the RAW output, counted without normalizing.
 * A JSON string that parses to an array counts its members; an unparseable one counts as UNKNOWN so
 * an admitted case carrying it can never be scored as "nothing was lost".
 */
function rawArrayCount(raw: unknown, field: string): number | 'UNKNOWN' {
  if (!isObj(raw)) return 'UNKNOWN';
  let body = raw;
  const keys = Object.keys(raw);
  if (keys.length === 1 && !(field in raw) && isObj(raw[keys[0]])) body = raw[keys[0]] as Record<string, unknown>;
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

interface CaseScore236 {
  caseId: string; category: string;
  expectedPosture: ImmediateSafetyPosture233;
  actualPosture: string | null;
  admissible: boolean;
  primary: 'CORRECT' | 'INCORRECT';
  conservatism: Conservatism;
  unsafeUnderConservative: boolean;
  overConservative: boolean;
  normalization: Record<string, unknown>;
  failOpen: { isFailOpen: boolean; detail: string[] };
  cessation: {
    expected: string; actualCount: number; actualRefs: string[];
    missingDriver: boolean; falseCandidate: boolean; falseCandidateEscalated: boolean;
  };
  manufacturedDeclarations: string[];
  contractChecks: Record<string, boolean>;
  recommendation: { faithful: boolean; codes: string[]; workMayContinue: boolean | null };
  failureClasses: FailureClass236[];
  adjudicationPayload: Record<string, unknown>;
}

const scores: CaseScore236[] = [];

for (const c of CONFIRMATION_CASES_236) {
  const row = byCase.get(c.caseId);
  const raw = (row?.parsed ?? null) as unknown;
  const transportClass = String(row?.failureClass ?? 'NO_OUTPUT');
  const schema = asm.get(c.caseId)!.wireSchema;

  const proj = projectPosture235(raw, schema);
  const n = proj.normalization;
  const seen = n.analysis ?? {};
  const actualPosture = proj.posture?.posture ?? null;
  const admissible = proj.admitted;

  // ---- FAIL-OPEN GUARD
  const failDetail: string[] = [];
  for (const field of ['expertHazardCandidates', 'unresolvedFactDeclarations',
    'decisionCriticalClarifications']) {
    const rawN = rawArrayCount(raw, field);
    const seenV = (seen as Record<string, unknown>)[field];
    const seenN = Array.isArray(seenV) ? seenV.length : (seenV === undefined ? 0 : 'UNPARSED');
    if (!admissible) continue;
    if (rawN === 'UNKNOWN' || seenN === 'UNPARSED') {
      failDetail.push(`${field}: admitted while the raw value could not be counted or was not an `
        + 'array after normalization');
      continue;
    }
    if (seenN < rawN) {
      failDetail.push(`${field}: raw carried ${rawN}, the projection saw ${seenN}`);
    }
  }
  const failOpen = { isFailOpen: failDetail.length > 0, detail: failDetail };

  // ---- posture degree
  const primary: 'CORRECT' | 'INCORRECT' =
    actualPosture === c.expectedPosture ? 'CORRECT' : 'INCORRECT';
  let conservatism: Conservatism = 'NO_POSTURE';
  let under = false; let over = false;
  if (actualPosture !== null && IMMEDIATE_SAFETY_POSTURES_233.includes(actualPosture)) {
    const ar = POSTURE_PROTECTIVE_RANK[actualPosture];
    const er = POSTURE_PROTECTIVE_RANK[c.expectedPosture];
    conservatism = ar === er ? 'EXACT' : ar < er ? 'UNDER_CONSERVATIVE' : 'OVER_CONSERVATIVE';
    under = ar < er; over = ar > er;
  }

  // ---- the §235 cessation list, in BOTH directions
  const posturedRaw = isObj((seen as Record<string, unknown>)[POSTURE_FIELD])
    ? (seen as Record<string, unknown>)[POSTURE_FIELD] as Record<string, unknown> : {};
  const cessRaw = Array.isArray(posturedRaw[CESSATION_FIELD])
    ? posturedRaw[CESSATION_FIELD] as Record<string, unknown>[] : [];
  const cessRefs = cessRaw.map(x => String(x?.ref ?? '')).filter(Boolean);
  const expectedPopulated = c.expectedCessationList === 'MUST_BE_POPULATED';
  const missingDriver = expectedPopulated && cessRefs.length === 0;
  const falseCandidate = !expectedPopulated && cessRefs.length > 0;
  const cessation = {
    expected: c.expectedCessationList,
    actualCount: cessRefs.length, actualRefs: cessRefs,
    missingDriver, falseCandidate,
    falseCandidateEscalated: falseCandidate && over,
  };

  // ---- manufactured declarations, the frozen §234 test carried forward unchanged
  const declsSeen = Array.isArray((seen as Record<string, unknown>).unresolvedFactDeclarations)
    ? (seen as Record<string, unknown>).unresolvedFactDeclarations as Record<string, unknown>[] : [];
  const requiredByDeclIds = new Set((proj.posture?.requiredBy ?? [])
    .filter(r => r.refKind === 'UNRESOLVED_DECLARATION').map(r => r.ref));
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

  // ---- contract requirements, all fourteen
  const recState = proj.recommendationState;
  const completeness = (recState !== null && proj.posture !== null)
    ? checkRecommendationNotLessProtective233(recState, proj.posture) : ['NO_RECOMMENDATION_STATE'];
  const controls = proj.posture?.requiredControls ?? [];
  const contractChecks: Record<string, boolean> = {
    K01_rootContractValid: n.analysis !== null && !n.failsClosed,
    K02_posturePresent: isObj(posturedRaw) && Object.keys(posturedRaw).length > 0,
    K03_postureValueValid: actualPosture !== null
      && IMMEDIATE_SAFETY_POSTURES_233.includes(actualPosture),
    K04_basisValid: !proj.codes.includes('POSTURE_BASIS_ITEM_MALFORMED')
      && !proj.codes.includes('POSTURE_BASIS_REF_UNRESOLVED')
      && !proj.codes.includes('POSTURE_BASIS_NOT_AN_ARRAY'),
    K05_declarationCoverageValid: !proj.codes.includes('DECLARATION_NOT_COVERED'),
    K06_activeCandidateCoverageValid: !proj.codes.includes('ACTIVE_CANDIDATE_NOT_COVERED'),
    K07_noProhibitedBasisOverlap: !proj.codes.includes('POSTURE_BASIS_REF_DUPLICATED'),
    K08_acceptanceListValid: !proj.codes.includes('POSTURE_BASIS_ITEM_MALFORMED'),
    K09_controlsAndTimingValid: controls.every(x => CONTROL_TIMINGS_233.includes(x.timing))
      && !proj.codes.includes('CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS')
      && !proj.codes.includes('CONTROLS_PRESENT_UNDER_CONTINUE')
      && !proj.codes.includes('CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE'),
    K10_resumeConditionRuleValid: !proj.codes.includes('RESUME_CONDITION_EMPTY')
      && !proj.codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE')
      && !proj.codes.includes('RESUME_CONDITION_REF_UNRESOLVED'),
    K11_normalizationOutcomeRecorded: Array.isArray(n.fields) && typeof n.failsClosed === 'boolean',
    K12_normalizationLossless: n.changedContainerOnly === true
      && n.semanticFieldsInventedOrRepaired === 0,
    K13_normalizationRefusalTerminates: n.failsClosed ? !proj.admitted : true,
    K14_noProhibitedUnionOnTheWire: transmittedUnionTypes.length === 0,
  };

  const recommendation = {
    faithful: recState !== null && completeness.length === 0
      && recState.workMayContinue === POSTURE_PERMITS_CONTINUED_WORK[
        actualPosture as ImmediateSafetyPosture233],
    codes: completeness as string[],
    workMayContinue: recState?.workMayContinue ?? null,
  };

  const failureClasses: FailureClass236[] = [];
  if (transportClass === 'TRANSPORT_FAILURE' || transportClass === 'HTTP_FAILURE'
    || transportClass === 'OUTPUT_TRUNCATED' || transportClass === 'NO_TOOL_USE_BLOCK') {
    failureClasses.push('WIRE_OR_PROVIDER_REPRESENTATION');
  }
  if (!admissible && n.failsClosed) failureClasses.push('NORMALIZATION');
  if (!admissible && !n.failsClosed) failureClasses.push('CONTRACT_ALIGNMENT');
  if (missingDriver) failureClasses.push('MISSING_CESSATION_DRIVING_CANDIDATE');
  if (manufactured.length > 0 && under) failureClasses.push('MANUFACTURED_UNCERTAINTY');
  if (cessation.falseCandidateEscalated) failureClasses.push('FALSE_CESSATION_CANDIDATE_ESCALATION');
  if (primary === 'INCORRECT' && actualPosture !== null
    && !failureClasses.includes('MANUFACTURED_UNCERTAINTY')
    && !failureClasses.includes('FALSE_CESSATION_CANDIDATE_ESCALATION')) {
    failureClasses.push('WRONG_POSTURE_DEGREE');
  }
  if (admissible && !recommendation.faithful) failureClasses.push('RECOMMENDATION_PROJECTION');
  if (failOpen.isFailOpen) failureClasses.push('OTHER');

  scores.push({
    caseId: c.caseId, category: c.category,
    expectedPosture: c.expectedPosture, actualPosture, admissible,
    primary, conservatism, unsafeUnderConservative: under, overConservative: over,
    normalization: {
      anomaliesObserved: n.anomaliesObserved,
      envelopeAction: n.envelope?.action ?? null,
      fieldActions: n.fields.map(f => ({ field: f.field, action: f.action, anomaly: f.anomaly })),
      failsClosed: n.failsClosed, failClosedReasons: n.failClosedReasons,
      changedContainerOnly: n.changedContainerOnly,
      semanticFieldsInventedOrRepaired: n.semanticFieldsInventedOrRepaired,
      neededNormalization: (n.envelope?.action ?? 'NONE') !== 'NONE' || n.fields.length > 0,
    },
    failOpen, cessation, manufacturedDeclarations: manufactured,
    contractChecks, recommendation,
    failureClasses: [...new Set(failureClasses)],
    adjudicationPayload: {
      frozenControllingProperty: c.controllingSafetyProperty,
      frozenControllingPropertyState: c.controllingPropertyState,
      frozenExpectedCessationDriver: c.expectedCessationDriver,
      frozenRequiredResumeCondition: c.requiredResumeCondition,
      frozenNewControlsRequired: c.newControlsRequired,
      frozenLegitimateSeparateProperties: c.legitimateSeparateUnresolvedProperties,
      expectedCandidateCountAtLeast: c.expectedCandidateCountAtLeast,
      expectedDeclarationCountAtLeast: c.expectedDeclarationCountAtLeast,
      modelCandidateCount: Array.isArray((seen as Record<string, unknown>).expertHazardCandidates)
        ? ((seen as Record<string, unknown>).expertHazardCandidates as unknown[]).length : null,
      modelDeclarationCount: declsSeen.length,
      modelCandidates: (Array.isArray((seen as Record<string, unknown>).expertHazardCandidates)
        ? (seen as Record<string, unknown>).expertHazardCandidates as Record<string, unknown>[] : [])
        .map(x => ({ candidateKey: x.candidateKey, state: x.assertedConditionState })),
      modelDeclarations: declsSeen.map(d => ({ declarationId: d.declarationId,
        decisionWhileUnresolved: d.decisionWhileUnresolved ?? null })),
      modelPostureBasis: proj.posture?.requiredBy ?? null,
      modelAccepted: proj.posture?.acceptedWithoutImmediateAction ?? null,
      modelCessationList: proj.posture?.establishedConditionsRequiringCessation ?? null,
      modelControls: controls,
      modelResumeCondition: proj.posture?.resumeCondition ?? null,
      modelWhatHappensNow: proj.posture?.whatHappensNow ?? null,
      refusalCodes: proj.codes,
      declarationSubordination: proj.declarationSubordination,
    },
  });
}

// ---------------------------------------------------------------- cohort verdict

const admissible = scores.filter(s => s.admissible).length;
const exact = scores.filter(s => s.primary === 'CORRECT').length;
const under = scores.filter(s => s.unsafeUnderConservative);
const over = scores.filter(s => s.overConservative);
const failOpen = scores.filter(s => s.failOpen.isFailOpen);
const manufactured = scores.filter(s => s.manufacturedDeclarations.length > 0
  && s.unsafeUnderConservative);
const falseCessation = scores.filter(s => s.cessation.falseCandidate);
const missingDriver = scores.filter(s => s.cessation.missingDriver);
const recBad = scores.filter(s => s.admissible && !s.recommendation.faithful);
const contractBad = scores.filter(s => Object.values(s.contractChecks).some(v => !v));
const neededNormalization = scores.filter(s => s.normalization.neededNormalization === true);

const requirements = {
  R1_allAdmissible: { required: '9/9', actual: `${admissible}/9`, pass: admissible === 9 },
  R2_exactPostureIdentity: { required: '9/9', actual: `${exact}/9`, pass: exact === 9 },
  R3_zeroUnsafeUnderConservative: { required: 0, actual: under.length, pass: under.length === 0 },
  R4_zeroOverConservative: { required: 0, actual: over.length, pass: over.length === 0 },
  R5_zeroFailOpen: { required: 0, actual: failOpen.length, pass: failOpen.length === 0 },
  R6_zeroManufacturedWeakeningAnEstablishedPosture: {
    required: 0, actual: manufactured.length, pass: manufactured.length === 0 },
  R7_zeroFalseCessationCandidates: {
    required: 0, actual: falseCessation.length, pass: falseCessation.length === 0 },
  R8_zeroMissingCessationDrivers: {
    required: 0, actual: missingDriver.length, pass: missingDriver.length === 0 },
  R9_zeroRecommendationContradictions: {
    required: 0, actual: recBad.length, pass: recBad.length === 0 },
  R10_allContractRequirementsMet: {
    required: 0, actual: contractBad.length, pass: contractBad.length === 0 },
};
const allPass = Object.values(requirements).every(r => r.pass);

const summary = {
  artifact: 'SECTION-236-JUDGMENT', version: INSTRUMENT_236_VERSION,
  scorerVersion: SCORER_VERSION,
  instrumentDigest: instrumentDigest236(),
  providerCalls: 0, databaseOperations: 0,
  scoredCases: scores.length, rawRecords: rows.length,
  transmittedUnionTypes,
  admissible: `${admissible}/9`,
  exactPostureIdentity: `${exact}/9`,
  arrival: {
    admittedWithoutAnyNormalization: scores.filter(s => s.admissible
      && s.normalization.neededNormalization !== true).map(s => s.caseId),
    admittedAfterSafeNormalization: neededNormalization.filter(s => s.admissible).map(s => s.caseId),
    refused: scores.filter(s => !s.admissible).map(s => ({ caseId: s.caseId,
      codes: s.adjudicationPayload.refusalCodes })),
    anomalyClassesObserved: [...new Set(scores.flatMap(s =>
      s.normalization.anomaliesObserved as string[]))],
  },
  confusion: Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(e => [e,
    Object.fromEntries(IMMEDIATE_SAFETY_POSTURES_233.map(a => [a,
      scores.filter(s => s.expectedPosture === e && s.actualPosture === a).length]))])),
  byCategory: Object.fromEntries(['WIRE_ARRIVAL_STRESS', 'ESTABLISHED_PROPERTY_TRAP',
    'NEIGHBOURING_DEGREE'].map(cat => [cat, {
    cases: scores.filter(s => s.category === cat).map(s => s.caseId),
    admissible: scores.filter(s => s.category === cat && s.admissible).length,
    exact: scores.filter(s => s.category === cat && s.primary === 'CORRECT').length,
  }])),
  unsafeUnderConservative: under.map(s => ({ caseId: s.caseId, expected: s.expectedPosture,
    actual: s.actualPosture })),
  overConservative: over.map(s => ({ caseId: s.caseId, expected: s.expectedPosture,
    actual: s.actualPosture, falseCessationCandidate: s.cessation.falseCandidate })),
  failOpen: failOpen.map(s => ({ caseId: s.caseId, detail: s.failOpen.detail })),
  manufacturedUncertainty: manufactured.map(s => ({ caseId: s.caseId,
    declarationIds: s.manufacturedDeclarations })),
  falseCessationCandidates: falseCessation.map(s => ({ caseId: s.caseId, refs: s.cessation.actualRefs })),
  missingCessationDrivers: missingDriver.map(s => ({ caseId: s.caseId,
    expectedDriver: s.adjudicationPayload.frozenExpectedCessationDriver })),
  recommendationContradictions: recBad.map(s => ({ caseId: s.caseId, codes: s.recommendation.codes })),
  contractRequirementFailures: contractBad.map(s => ({ caseId: s.caseId,
    failed: Object.entries(s.contractChecks).filter(([, v]) => !v).map(([k]) => k) })),
  requirements,
  passRule: SCORING_RULES_236.passRule,
  decision: allPass ? 'PASS' : 'FAIL',
  terminal: allPass ? TERMINALS_236.pass : TERMINALS_236.fail,
  failureClassesObserved: [...new Set(scores.flatMap(s => s.failureClasses))]
    .filter(f => FAILURE_CLASSES_236.includes(f)),
  whatAPassDoesNotLicense: SCORING_RULES_236.whatAPassDoesNotLicense,
  perCase: scores,
};

writeFileSync(join(EVID, 'SECTION-236-JUDGMENT.json'), JSON.stringify(summary, null, 2) + '\n');
writeFileSync(join(EVID, 'SECTION-236-JUDGMENT.sha256'),
  `${sha(JSON.stringify(summary))}  SECTION-236-JUDGMENT.json\n`);

console.log(`§236 JUDGMENT — ${summary.decision}`);
console.log(`  admissible                       ${admissible}/9`);
console.log(`  exact posture identity           ${exact}/9`);
console.log(`  unsafe under-conservative        ${under.length}`);
console.log(`  over-conservative                ${over.length}`);
console.log(`  fail-open normalization outcomes ${failOpen.length}`);
console.log(`  manufactured uncertainty         ${manufactured.length}`);
console.log(`  false cessation candidates       ${falseCessation.length}`);
console.log(`  missing cessation drivers        ${missingDriver.length}`);
console.log(`  recommendation contradictions    ${recBad.length}`);
console.log(`  contract requirement failures    ${contractBad.length}`);
console.log(`  needed safe normalization        ${neededNormalization.length}/9`);
console.log('');
for (const s of scores) {
  const mark = !s.admissible ? 'REFUSED'
    : s.primary === 'CORRECT' ? 'ok     '
      : s.unsafeUnderConservative ? 'UNDER  ' : 'OVER   ';
  console.log(`  ${mark} ${s.caseId.padEnd(3)} ${s.category.padEnd(26)} `
    + `expected ${s.expectedPosture.padEnd(25)} actual ${String(s.actualPosture).padEnd(25)} `
    + `cess=${s.cessation.actualCount}(${s.cessation.expected === 'MUST_BE_POPULATED' ? 'pop' : 'empty'})`);
}
console.log(`\n${summary.terminal}`);
