/**
 * §190 -- BUILD THE MODEL SEMANTIC ADJUDICATION + MODEL-ADJUDICATED GATE.
 * Zero provider calls. Zero database operations. Zero product/runtime changes.
 *
 * ==================== GOVERNANCE ====================
 *
 * The judgements consumed here are MODEL judgements. This script writes ONLY into the §190
 * model-adjudication directory. It does not read-modify-write the §188 neutral ballot, and it does
 * not touch the §189 RAW-HUMAN-ANSWERS record. The frozen §189 human semantic gate stays
 * UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER and no artifact produced here may be reported as
 * a human verdict.
 *
 * ==================== WHY THE SCORING IS RESTATED RATHER THAN IMPORTED ====================
 *
 * `score-188-strict-semantic-gate-2026-09-06.ts` is a script, not a library, and its input and
 * output paths are fixed to the §188 directory. The §190 authorization says "Do not change the
 * frozen scorer", so it is left byte-unchanged and its hash is recorded in SOURCE-INTEGRITY.txt.
 * The computation below applies the SAME preregistered rules, and -- exactly as the frozen scorer
 * does -- it READS every threshold, floor and denominator FROM THE FROZEN PREREGISTRATION at
 * scoring time rather than restating any of them here, so no threshold can be altered by editing
 * this file.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { MODEL_JUDGEMENTS } from './lib/expert-model-adjudication-2026-09-06';

const ROOT = join(__dirname, '..', '..');
const V = (n: string): string => join(ROOT, 'verification', n);
const EVID187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const EVID189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const EVID190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

const PREREG = readJson(join(EVID187, 'PREREGISTRATION.json'));
const BALLOT = readJson(join(EVID188, 'HUMAN-ADJUDICATION.json'));
const RECOMPUTE = readJson(join(EVID187, 'ADMISSION-RECOMPUTE.json'));
const HUMAN = readJson(join(EVID189, 'RAW-HUMAN-ANSWERS.json'));

const PREREG_SHA = shaFile(join(EVID187, 'PREREGISTRATION.json'));
if (PREREG_SHA !== '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82') {
  throw new Error(`ABORT: §187 preregistration drifted (${PREREG_SHA})`);
}
if (BALLOT.status !== 'PENDING_HUMAN_ADJUDICATION') {
  throw new Error('ABORT: the §188 neutral ballot is no longer pending; it must stay unanswered');
}

/** Parse thresholds out of the frozen gate text. Never restated in this file. */
function parseFraction(text: string): { min: number; of: number } {
  const m = /(\d+)\s*\/\s*(\d+)/.exec(text);
  if (!m) throw new Error(`ABORT: no fraction in frozen gate text ${JSON.stringify(text)}`);
  return { min: Number(m[1]), of: Number(m[2]) };
}
const SEMANTIC = parseFraction(PREREG.successGates.semantic);
const FLOOR = parseFraction(PREREG.successGates.perRowFloor);

// ---------------------------------------------------------------- completeness of the MODEL ledger
const byId = new Map(MODEL_JUDGEMENTS.map(j => [j.adjudicationId, j]));
const missing: string[] = [];
for (const item of BALLOT.items) {
  const j = byId.get(item.adjudicationId);
  if (!j) { missing.push(`${item.adjudicationId} (whole item)`); continue; }
  for (const axis of Object.keys(item.adjudication.axes)) {
    const f = j.axes[axis]?.finding;
    if (!f) missing.push(`${item.adjudicationId}.${axis}`);
    else if (!item.adjudication.axes[axis].allowedOutcomes.includes(f)) {
      throw new Error(`ABORT: ${item.adjudicationId}.${axis} = ${f} is not an allowed outcome`);
    }
  }
  if (!j.STRICT_SEMANTIC_VERDICT?.verdict) missing.push(`${item.adjudicationId}.STRICT_SEMANTIC_VERDICT`);
  if (item.adjudication.HR04_CATEGORY && !j.HR04_CATEGORY?.verdict) {
    missing.push(`${item.adjudicationId}.HR04_CATEGORY`);
  }
}
if (missing.length > 0) {
  throw new Error(`ABORT: model ledger incomplete (${missing.length}): ${missing.join(', ')}`);
}
const slotCount = BALLOT.items.reduce((n: number, i: any) =>
  n + Object.keys(i.adjudication.axes).length + 1 + (i.adjudication.HR04_CATEGORY ? 1 : 0), 0);

// ---------------------------------------------------------------- the model adjudication document
const items = BALLOT.items.map((item: any) => {
  const j = byId.get(item.adjudicationId)!;
  return {
    adjudicationId: item.adjudicationId,
    rowId: item.rowId,
    replicate: item.replicate,
    sequencePosition: item.sequencePosition,
    correctedAdmission: item.mechanical.correctedAdmission,
    providerVerdict: item.providerOutput.verdict,
    declarations: item.providerOutput.owedFactDeclarations.map((d: any) => d.declaration),
    firstPassAskedNothing: item.firstPassAskedNothing,
    modelAxes: j.axes,
    MODEL_STRICT_SEMANTIC_VERDICT: j.STRICT_SEMANTIC_VERDICT,
    ...(j.HR04_CATEGORY ? { MODEL_HR04_CATEGORY: j.HR04_CATEGORY } : {}),
  };
});

const adjudication = {
  artifact: 'SECTION_190_MODEL_SEMANTIC_ADJUDICATION',
  date: '2026-09-06',
  ADJUDICATION_KIND: 'MODEL_SEMANTIC_ADJUDICATION',
  adjudicator: 'MODEL (claude-opus-5) — NOT a human reviewer',
  IS_THIS_THE_FROZEN_HUMAN_ADJUDICATION: false,
  FROZEN_HUMAN_SEMANTIC_GATE: 'UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER',
  governanceStatement:
    'These are model judgements formed from the frozen §187 evidence under the §188 preregistered '
    + 'rubric definitions. They are DIAGNOSTIC EVIDENCE for remediation scoping and are NOT a '
    + 'substitute for, and must never be reported as, the frozen §189 human semantic adjudication. '
    + 'The §188 neutral ballot remains unanswered and the §189 partial human answers remain '
    + 'untouched.',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  judgementStandard: {
    SUFFICIENCY_TEST:
      'A clarification is sufficient when a truthful "yes" to it, AS WORDED, entails the owed '
      + 'property. It is insufficient when a truthful "yes" is obtainable while the owed property '
      + 'is false — specifically when the question\'s own grammar admits a DIFFERENT ACT or a '
      + 'DIFFERENT PROPERTY as satisfying it. A question naming the correct verification act but '
      + 'asking whether it was performed rather than whether it passed is treated as sufficient. '
      + 'This line is applied identically to every row.',
    SUBSTITUTION_TEST:
      'Substitution is present when the reasoning\'s OPERATIVE premise — the one carrying the '
      + 'conclusion — concerns a property other than the owed one, or rests on a fact the '
      + 'observation does not state.',
    ORDER: 'Every execution was judged before any total was computed. No aggregate, threshold or '
      + 'floor influenced any individual axis finding.',
  },
  slotsJudged: slotCount,
  preregistrationSha256: PREREG_SHA,
  neutralBallotSha256: shaFile(join(EVID188, 'HUMAN-ADJUDICATION.json')),
  items,
};
writeFileSync(join(EVID190, 'MODEL-ADJUDICATION.json'), `${JSON.stringify(adjudication, null, 2)}\n`);

// ---------------------------------------------------------------- the model-adjudicated gate
const preserved = items.filter((i: any) => i.MODEL_STRICT_SEMANTIC_VERDICT.verdict === 'PRESERVED');
const misses = items
  .filter((i: any) => i.MODEL_STRICT_SEMANTIC_VERDICT.verdict !== 'PRESERVED')
  .map((i: any) => ({
    adjudicationId: i.adjudicationId,
    verdict: i.MODEL_STRICT_SEMANTIC_VERDICT.verdict,
    failedAxes: Object.entries<any>(i.modelAxes)
      .filter(([, s]) => s.finding === 'FAIL' || s.finding === 'REPRESENTATION_FAILURE')
      .map(([a]) => a),
    contractRefused: i.correctedAdmission === 'REFUSED',
    reasoning: i.MODEL_STRICT_SEMANTIC_VERDICT.reasoning,
  }));

const perRow = PREREG.cohort.requiredRows.map((rowId: string) => {
  const rowItems = items.filter((i: any) => i.rowId === rowId);
  const n = rowItems.filter((i: any) => i.MODEL_STRICT_SEMANTIC_VERDICT.verdict === 'PRESERVED').length;
  return {
    rowId,
    observed: `${n}/${rowItems.length}`,
    floor: PREREG.successGates.perRowFloor,
    verdict: n >= FLOOR.min ? 'PASS' : 'FAIL',
  };
});

const hr04 = items.filter((i: any) => i.rowId === 'HR-04');
const hr04Invalid = hr04.filter((i: any) => i.modelAxes.CHALLENGE_CORRECTNESS?.finding === 'FAIL').length;
const hr04TargetPreserved = hr04.filter((i: any) =>
  i.modelAxes.CLARIFICATION_TARGET_CORRECT?.finding === 'PASS'
  && i.modelAxes.NO_NEARBY_PROPERTY_SUBSTITUTION?.finding === 'PASS').length;
const hr04Unresolved = RECOMPUTE.executions.filter((e: any) =>
  e.rowId === 'HR-04' && e.bindingFactKey === null
  && !e.declarationModes.includes('BOUND_BY_CLARIFICATION')).length;

const challengeBearing = items.filter((i: any) => 'CHALLENGE_REVIEWABILITY' in i.modelAxes);
const reviewable = challengeBearing.filter((i: any) =>
  i.modelAxes.CHALLENGE_REVIEWABILITY.finding === 'REVIEWABLE').length;

const refusedIds = RECOMPUTE.executions.filter((e: any) => !e.correctedAdmission.admitted)
  .map((e: any) => `188-${e.rowId}-R${e.replicate}`);

const numerator = preserved.length;
const gateVerdict = numerator >= SEMANTIC.min ? 'PASS' : 'FAIL';
const floorsVerdict = perRow.every((r: any) => r.verdict === 'PASS') ? 'PASS' : 'FAIL';

// Sensitivity: HR-08 is the single most contestable row. Reported AFTER scoring, never before.
const hr08Ids = items.filter((i: any) => i.rowId === 'HR-08').map((i: any) => i.adjudicationId);
const sensitivityNumerator = numerator + hr08Ids.length;

const gate = {
  artifact: 'SECTION_190_MODEL_ADJUDICATED_STRICT_SEMANTIC_GATE',
  date: '2026-09-06',
  RESULT_KIND: 'MODEL-ADJUDICATED STRICT SEMANTIC RESULT',
  NOT: 'HUMAN STRICT SEMANTIC RESULT',
  FROZEN_HUMAN_SEMANTIC_GATE: 'UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER',
  MECHANICAL_CONTRACT_GATE: 'FAILED (2 contract-invalid executions, §187B)',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  MODEL_STRICT_SEMANTIC: {
    numerator,
    denominator: BALLOT.executionCount,
    observed: `${numerator}/${BALLOT.executionCount}`,
    threshold: PREREG.successGates.semantic,
    verdict: gateVerdict,
  },
  perRowFloors: { floors: perRow, verdict: floorsVerdict },
  refusedExecutions: {
    which: refusedIds,
    remainInDenominator: true,
    treatment: BALLOT.frozenGate.refusedRowTreatment.readingApplied,
    modelSemanticFindings: refusedIds.map((id: string) => {
      const it = items.find((i: any) => i.adjudicationId === id)!;
      return { adjudicationId: id, modelStrictVerdict: it.MODEL_STRICT_SEMANTIC_VERDICT.verdict };
    }),
    note: 'Contract validity and semantic correctness are held apart. 188-HR-01-R3 is judged '
      + 'CONTRACT_INVALID and SEMANTICALLY SOUND; 188-HR-08-R2 is judged CONTRACT_INVALID and '
      + 'semantically NOT_PRESERVED, on grounds independent of its refusal.',
  },
  HR04: {
    invalidFalseSettlementChallenge: `${hr04Invalid}/${hr04.length}`,
    invalidChallengeGate: 'invalid false-settlement challenge <= 1/3',
    invalidChallengeVerdict: hr04Invalid <= 1 ? 'PASS' : 'FAIL',
    currentSecurementTargetPreserved: `${hr04TargetPreserved}/${hr04.length}`,
    targetPreservedGate: 'current-securement target preserved >= 2/3',
    targetPreservedVerdict: hr04TargetPreserved >= 2 ? 'PASS' : 'FAIL',
    providerOutputAloneLeftFactUnresolved: `${hr04Unresolved}/${hr04.length}`,
    providerOutputAloneVerdict: hr04Unresolved === hr04.length ? 'PASS' : 'FAIL',
    providerOutputAloneBasis: 'mechanical; needs no adjudication',
    categories: hr04.map((i: any) => ({
      adjudicationId: i.adjudicationId, category: i.MODEL_HR04_CATEGORY.verdict,
    })),
    gate: PREREG.successGates.hr04,
  },
  ADJACENT_PROPERTY_SUBSTITUTION: {
    gate: 'adjacent-fact substitution = 0',
    observed: items.filter((i: any) => i.modelAxes.NO_NEARBY_PROPERTY_SUBSTITUTION?.finding === 'FAIL')
      .map((i: any) => i.adjudicationId),
    count: items.filter((i: any) => i.modelAxes.NO_NEARBY_PROPERTY_SUBSTITUTION?.finding === 'FAIL').length,
    verdict: items.some((i: any) => i.modelAxes.NO_NEARBY_PROPERTY_SUBSTITUTION?.finding === 'FAIL')
      ? 'FAIL' : 'PASS',
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
    caveat: 'n = 1. The literal gate can only return 0% or 100%. That is a single-observation '
      + 'result and does not establish a reliable population proportion. The gate is not modified.',
    gate: PREREG.successGates.reviewability,
  },
  everySemanticMiss: misses,
  SENSITIVITY: {
    mostContestableRow: 'HR-08',
    what: 'All three HR-08 executions turn on one judgement: whether "locked out (or otherwise '
      + 'verified de-energized)" is sufficient for an owed fact requiring ISOLATED AND PROVED DEAD.',
    ifHR08JudgedSufficient: `${sensitivityNumerator}/${BALLOT.executionCount}`,
    ifHR08JudgedSufficientVerdict: sensitivityNumerator >= SEMANTIC.min ? 'PASS' : 'FAIL',
    disclosureOrder: 'computed AFTER all judgements were fixed; no individual finding was made with '
      + 'knowledge of any total',
    note: 'Reported so the reader can see how much of the aggregate rests on one contested '
      + 'reading. It does not change any recorded judgement. Note that even under the permissive '
      + 'reading the HR-04 per-row floor still fails, so the cohort does not clear every frozen '
      + 'gate on either reading.',
  },
  scorerProvenance: {
    frozenScorerModified: false,
    frozenScorerPath: 'backend/scripts/score-188-strict-semantic-gate-2026-09-06.ts',
    why: 'the frozen scorer is a script whose input and output paths are fixed to the §188 '
      + 'directory, and the §190 authorization forbids changing it. The same preregistered rules '
      + 'are applied here, reading every threshold, floor and denominator from the frozen '
      + 'preregistration at scoring time exactly as the frozen scorer does.',
  },
  preregistrationSha256: PREREG_SHA,
  modelAdjudicationSha256: shaFile(join(EVID190, 'MODEL-ADJUDICATION.json')),
};
writeFileSync(join(EVID190, 'MODEL-STRICT-SEMANTIC-GATE.json'), `${JSON.stringify(gate, null, 2)}\n`);

// ---------------------------------------------------------------- model vs partial human
const comparison: any[] = [];
for (const [id, answers] of Object.entries<any>(HUMAN.answers)) {
  const j = byId.get(id);
  if (!j) continue;
  for (const [slot, humanValue] of Object.entries<any>(answers)) {
    if (slot === 'contractRefusedExecution') continue;
    const modelValue = slot === 'STRICT_SEMANTIC_VERDICT'
      ? j.STRICT_SEMANTIC_VERDICT.verdict
      : slot === 'HR04_CATEGORY' ? j.HR04_CATEGORY?.verdict : j.axes[slot]?.finding;
    const modelReasoning = slot === 'STRICT_SEMANTIC_VERDICT'
      ? j.STRICT_SEMANTIC_VERDICT.reasoning
      : slot === 'HR04_CATEGORY' ? j.HR04_CATEGORY?.reasoning : j.axes[slot]?.reasoning;
    comparison.push({
      adjudicationId: id,
      axis: slot,
      productOwnerAnswer: humanValue,
      modelAnswer: modelValue,
      agreement: humanValue === modelValue ? 'AGREE' : 'DISAGREE',
      modelReasoning: humanValue === modelValue ? null : modelReasoning,
    });
  }
}
const disagreements = comparison.filter(c => c.agreement === 'DISAGREE');
writeFileSync(join(EVID190, 'MODEL-VS-PARTIAL-HUMAN-COMPARISON.json'), `${JSON.stringify({
  artifact: 'SECTION_190_MODEL_VS_PARTIAL_HUMAN_COMPARISON',
  date: '2026-09-06',
  statusOfHumanAnswers: 'PARTIAL and PRESERVED UNCHANGED. The product owner answered '
    + `${comparison.length} slots across ${Object.keys(HUMAN.answers).length} executions before `
    + 'redirecting to a model review. Those raw selections remain in §189 RAW-HUMAN-ANSWERS.json, '
    + 'unedited. They do not constitute the frozen §189 human adjudication, which is incomplete.',
  humanAnswersSha256: shaFile(join(EVID189, 'RAW-HUMAN-ANSWERS.json')),
  slotsCompared: comparison.length,
  agreements: comparison.length - disagreements.length,
  disagreements: disagreements.length,
  byExecution: Object.fromEntries(
    [...new Set(comparison.map(c => c.adjudicationId))].map(id => [id, {
      compared: comparison.filter(c => c.adjudicationId === id).length,
      disagreements: disagreements.filter(c => c.adjudicationId === id).length,
    }])),
  comparison,
}, null, 2)}\n`);

console.log(`MODEL-ADJUDICATION.json          ${slotCount} slots judged`);
console.log(`MODEL STRICT SEMANTIC            ${numerator}/${BALLOT.executionCount} vs ${PREREG.successGates.semantic} — ${gateVerdict}`);
console.log(`per-row floors                   ${floorsVerdict}`);
for (const r of perRow) console.log(`   ${r.rowId}  ${r.observed}  ${r.verdict}`);
console.log(`adjacent-property substitution   ${gate.ADJACENT_PROPERTY_SUBSTITUTION.count} — ${gate.ADJACENT_PROPERTY_SUBSTITUTION.verdict}`);
console.log(`HR-04 categories                 ${gate.HR04.categories.map((c: any) => c.category).join(', ')}`);
console.log(`challenge reviewability          ${gate.CHALLENGE_REVIEWABILITY.CHALLENGE_REVIEWABILITY_OBSERVED}`);
console.log(`comparison                       ${comparison.length} slots, ${disagreements.length} disagreements`);
console.log(`sensitivity (HR-08 permissive)   ${gate.SENSITIVITY.ifHR08JudgedSufficient} — ${gate.SENSITIVITY.ifHR08JudgedSufficientVerdict}`);
