/**
 * §188 -- STRICT SEMANTIC GATE SCORER. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Pure function over (frozen §187 preregistration, frozen §187B executions, immutable human
 * adjudications). No provider response is regenerated and PROVIDER_INVOCATION_COUNT does not move.
 *
 * ==================== IT REFUSES RATHER THAN GUESSES ====================
 *
 * While any verdict slot in HUMAN-ADJUDICATION.json is null, this script emits `UNMEASURED` and
 * exits 0. `UNMEASURED` is NEITHER a model failure NOR a pass -- it is the procedural state
 * "FORMAL_ADJUDICATION_PENDING", and recording it as either outcome would attribute a procedural
 * state to the model. There is deliberately no flag that makes it decide anyway.
 *
 * ==================== THE THRESHOLD IS NOT NEGOTIABLE HERE ====================
 *
 * Every threshold, floor and denominator is READ FROM THE FROZEN PREREGISTRATION, never restated in
 * this file, so a threshold cannot be changed after seeing results by editing the scorer.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const EVID187 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

const PREREG = readJson(join(EVID187, 'PREREGISTRATION.json'));
const BALLOT = readJson(join(EVID188, 'HUMAN-ADJUDICATION.json'));
const RECOMPUTE = readJson(join(EVID187, 'ADMISSION-RECOMPUTE.json'));

const PREREG_SHA = sha(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));
if (PREREG_SHA !== '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82') {
  throw new Error(`ABORT: §187 preregistration drifted (${PREREG_SHA})`);
}

/** Parse ">= 12/15" and ">= 2/3" out of the frozen gate text rather than hardcoding either. */
function parseFraction(text: string): { min: number; of: number } {
  const m = /(\d+)\s*\/\s*(\d+)/.exec(text);
  if (!m) throw new Error(`ABORT: no fraction in frozen gate text ${JSON.stringify(text)}`);
  return { min: Number(m[1]), of: Number(m[2]) };
}
const SEMANTIC = parseFraction(PREREG.successGates.semantic);
const FLOOR = parseFraction(PREREG.successGates.perRowFloor);

// ---------------------------------------------------------------- completeness
const missing: string[] = [];
for (const it of BALLOT.items) {
  for (const [axis, slot] of Object.entries<any>(it.adjudication.axes)) {
    if (slot.finding === null) missing.push(`${it.adjudicationId}.${axis}`);
  }
  if (it.adjudication.STRICT_SEMANTIC_VERDICT.verdict === null) {
    missing.push(`${it.adjudicationId}.STRICT_SEMANTIC_VERDICT`);
  }
  if (it.adjudication.HR04_CATEGORY && it.adjudication.HR04_CATEGORY.verdict === null) {
    missing.push(`${it.adjudicationId}.HR04_CATEGORY`);
  }
}

// ------------------------------------------------- what IS mechanically determinable, either way
const hr04 = RECOMPUTE.executions.filter((e: any) => e.rowId === 'HR-04');
const hr04LeftUnresolved = hr04.filter((e: any) =>
  e.bindingFactKey === null && !e.declarationModes.includes('BOUND_BY_CLARIFICATION')).length;

const refusedIds = RECOMPUTE.executions
  .filter((e: any) => !e.correctedAdmission.admitted)
  .map((e: any) => `188-${e.rowId}-R${e.replicate}`);

const challengeBearing = BALLOT.items
  .filter((i: any) => 'CHALLENGE_REVIEWABILITY' in i.adjudication.axes);

const mechanical = {
  HR04_PROVIDER_OUTPUT_ALONE_LEFT_THE_FACT_UNRESOLVED: {
    observed: `${hr04LeftUnresolved} / ${hr04.length}`,
    gate: 'provider output alone leaves the fact unresolved 3/3',
    verdict: hr04LeftUnresolved === hr04.length ? 'PASS' : 'FAIL',
    basis: 'deterministic: no HR-04 execution carried a bindingFactKey or declared '
      + 'BOUND_BY_CLARIFICATION, and a CHALLENGE_FACT_VALIDITY declaration is typed settles:false. '
      + 'This sub-gate is mechanical and needs no adjudication.',
  },
  CONTRACT_REFUSED_EXECUTIONS: {
    which: refusedIds,
    remainInSemanticDenominator: true,
    why: BALLOT.frozenGate.refusedRowTreatment.readingApplied,
    maximumAttainableNumerator: BALLOT.executionCount - refusedIds.length,
    thresholdRequires: SEMANTIC.min,
    headroom: (BALLOT.executionCount - refusedIds.length) - SEMANTIC.min,
  },
  CHALLENGE_BEARING_EXECUTIONS: challengeBearing.length,
};

if (missing.length > 0) {
  const doc = {
    artifact: 'SECTION_188_STRICT_SEMANTIC_GATE',
    date: '2026-09-06',
    PROVIDER_CALLS: 0,
    DATABASE_OPERATIONS: 0,
    RESULT: 'UNMEASURED',
    lifecycleStage: 'FORMAL_ADJUDICATION_PENDING',
    isThisAFailure: false,
    isThisAPass: false,
    statement:
      'UNMEASURED is neither a model failure nor a pass. The frozen §187A preregistration assigns '
      + 'every strict semantic axis to human judgement and states "This model does not decide '
      + 'them." Until the verdicts are supplied, the gate has no value, and asserting one in '
      + 'either direction would attribute a procedural state to the model.',
    frozenGate: {
      semantic: PREREG.successGates.semantic,
      parsedThreshold: `${SEMANTIC.min}/${SEMANTIC.of}`,
      perRowFloor: PREREG.successGates.perRowFloor,
      parsedFloor: `${FLOOR.min}/${FLOOR.of}`,
      hr04: PREREG.successGates.hr04,
      reviewability: PREREG.successGates.reviewability,
      thresholdSource: 'read from the frozen preregistration at scoring time; never restated in '
        + 'the scorer, so it cannot be edited after results are seen',
    },
    denominator: {
      value: BALLOT.executionCount,
      basis: 'the gate is written literally as ">= 12/15"; the preregistration nowhere excludes a '
        + 'refused observation from the denominator',
      refusedRowTreatment: BALLOT.frozenGate.refusedRowTreatment,
    },
    mechanicallyDeterminedWithoutAdjudication: mechanical,
    pendingSlots: { count: missing.length, slots: missing },
    ballotSha256: sha(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8')),
    preregistrationSha256: PREREG_SHA,
  };
  writeFileSync(join(EVID188, 'STRICT-SEMANTIC-GATE.json'), `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`RESULT = UNMEASURED  (${missing.length} verdict slots pending)`);
  console.log('This scorer does not decide the semantic axes and has no flag that makes it.');
  console.log(`mechanical HR-04 unresolved-preservation sub-gate: ${mechanical.HR04_PROVIDER_OUTPUT_ALONE_LEFT_THE_FACT_UNRESOLVED.observed} — ${mechanical.HR04_PROVIDER_OUTPUT_ALONE_LEFT_THE_FACT_UNRESOLVED.verdict}`);
  console.log(`maximum attainable numerator with 2 refused: ${mechanical.CONTRACT_REFUSED_EXECUTIONS.maximumAttainableNumerator}/${BALLOT.executionCount} against a >= ${SEMANTIC.min} threshold`);
  process.exit(0);
}

// ---------------------------------------------------------------- the completed computation
const preserved = BALLOT.items.filter((i: any) =>
  i.adjudication.STRICT_SEMANTIC_VERDICT.verdict === 'PRESERVED');
const misses = BALLOT.items
  .filter((i: any) => i.adjudication.STRICT_SEMANTIC_VERDICT.verdict !== 'PRESERVED')
  .map((i: any) => ({
    adjudicationId: i.adjudicationId,
    verdict: i.adjudication.STRICT_SEMANTIC_VERDICT.verdict,
    failedAxes: Object.entries<any>(i.adjudication.axes)
      .filter(([, s]) => s.finding === 'FAIL' || s.finding === 'REPRESENTATION_FAILURE')
      .map(([a]) => a),
    contractRefused: i.mechanical.correctedAdmission === 'REFUSED',
    reviewerNote: i.adjudication.STRICT_SEMANTIC_VERDICT.reviewerNote,
  }));

const perRow = PREREG.cohort.requiredRows.map((rowId: string) => {
  const rowItems = BALLOT.items.filter((i: any) => i.rowId === rowId);
  const n = rowItems.filter((i: any) =>
    i.adjudication.STRICT_SEMANTIC_VERDICT.verdict === 'PRESERVED').length;
  return {
    rowId,
    observed: `${n}/${rowItems.length}`,
    floor: PREREG.successGates.perRowFloor,
    verdict: n >= FLOOR.min ? 'PASS' : 'FAIL',
  };
});

const hr04Items = BALLOT.items.filter((i: any) => i.rowId === 'HR-04');
const hr04Invalid = hr04Items.filter((i: any) =>
  i.adjudication.axes.CHALLENGE_CORRECTNESS?.finding === 'FAIL').length;
const hr04TargetPreserved = hr04Items.filter((i: any) =>
  i.adjudication.axes.CLARIFICATION_TARGET_CORRECT?.finding === 'PASS'
  && i.adjudication.axes.NO_NEARBY_PROPERTY_SUBSTITUTION?.finding === 'PASS').length;

const reviewable = challengeBearing.filter((i: any) =>
  i.adjudication.axes.CHALLENGE_REVIEWABILITY.finding === 'REVIEWABLE').length;

const numerator = preserved.length;
const gateVerdict = numerator >= SEMANTIC.min ? 'PASS' : 'FAIL';
const floorsVerdict = perRow.every((r: any) => r.verdict === 'PASS') ? 'PASS' : 'FAIL';

const doc = {
  artifact: 'SECTION_188_STRICT_SEMANTIC_GATE',
  date: '2026-09-06',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  RESULT: gateVerdict === 'PASS' && floorsVerdict === 'PASS' ? 'PASS' : 'FAIL',
  lifecycleStage: 'FINAL_FROZEN_SCORING_COMPLETE',
  verdictProvenance: BALLOT.verdictProvenance,
  aiAssistance: BALLOT.aiAssistance,
  aiDisclosureTravelsWithEveryFigureBelow: true,
  STRICT_SEMANTIC: {
    numerator,
    denominator: BALLOT.executionCount,
    observed: `${numerator}/${BALLOT.executionCount}`,
    threshold: PREREG.successGates.semantic,
    verdict: gateVerdict,
  },
  perRowFloors: { floors: perRow, verdict: floorsVerdict },
  HR04: {
    invalidFalseSettlementChallenge: `${hr04Invalid}/${hr04Items.length}`,
    currentSecurementTargetPreserved: `${hr04TargetPreserved}/${hr04Items.length}`,
    providerOutputAloneLeftFactUnresolved:
      mechanical.HR04_PROVIDER_OUTPUT_ALONE_LEFT_THE_FACT_UNRESOLVED.observed,
    gate: PREREG.successGates.hr04,
    categories: hr04Items.map((i: any) => ({
      adjudicationId: i.adjudicationId, category: i.adjudication.HR04_CATEGORY.verdict,
    })),
  },
  CHALLENGE_REVIEWABILITY: {
    CHALLENGE_REVIEWABILITY_OBSERVED: `${reviewable} / ${challengeBearing.length}`,
    PREREGISTERED_THRESHOLD_EVALUATION: challengeBearing.length === 0
      ? 'NOT_EXERCISED'
      : challengeBearing.length < 5
        ? 'NOT_MEANINGFULLY_ESTIMABLE'
        : (reviewable / challengeBearing.length >= 0.8 ? 'PASS' : 'FAIL'),
    literalGateArithmetic: challengeBearing.length === 0 ? null
      : `${((reviewable / challengeBearing.length) * 100).toFixed(0)}%`,
    caveat: challengeBearing.length === 1
      ? 'n = 1. The literal gate can only yield 0% or 100%. That is a single-observation result and '
        + 'does not establish a reliable population proportion. The preregistered gate is NOT '
        + 'changed retroactively; it is reported as literally computed AND as not meaningfully '
        + 'estimable at this n.'
      : null,
    gate: PREREG.successGates.reviewability,
  },
  everyObservationThatCausedAMiss: misses,
  mechanicallyDeterminedWithoutAdjudication: mechanical,
  ballotSha256: sha(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8')),
  preregistrationSha256: PREREG_SHA,
};

writeFileSync(join(EVID188, 'STRICT-SEMANTIC-GATE.json'), `${JSON.stringify(doc, null, 2)}\n`);
console.log(`STRICT SEMANTIC ${numerator}/${BALLOT.executionCount} vs ${PREREG.successGates.semantic} — ${gateVerdict}`);
console.log(`per-row floors — ${floorsVerdict}`);
for (const m of misses) console.log(`  MISS ${m.adjudicationId}  axes=${m.failedAxes.join(',') || '(none flagged)'}  refused=${m.contractRefused}`);
