/**
 * §192 -- MODEL SEMANTIC ADJUDICATION + DEVELOPMENT GATE SCORING. ZERO provider calls.
 *
 * ==================== GOVERNANCE, STATED BEFORE ANYTHING ELSE ====================
 *
 * These are MODEL judgements. The §192 preregistration classified every semantic axis
 * MODEL_DIAGNOSTIC before spend and recorded HUMAN_REQUIRED as empty, precisely so the §189
 * ambiguity cannot recur. No artifact this file writes is a human verdict, and a human acceptance
 * gate remains a separate later step that §192 does not discharge.
 *
 * Thresholds are READ FROM THE FROZEN PREREGISTRATION at scoring time, never restated here, so no
 * gate can be moved after seeing results.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { PROSPECTIVE_COHORT } from './lib/expert-v3-1-prospective-cohort-2026-09-06';
import { V3_1_MODEL_JUDGEMENTS } from './lib/expert-v3-1-model-judgements-2026-09-06';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const PREREG = JSON.parse(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8'));
const GATES = PREREG.SEMANTIC_DEVELOPMENT_GATES;
const behavioral = readFileSync(join(EVID, 'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
  .filter(r => r.recordKind === 'BEHAVIORAL' && r.behavioralExecution === true);
const admission = JSON.parse(readFileSync(join(EVID, 'ADMISSION-RESULTS.json'), 'utf8'));
const rowById = new Map(PROSPECTIVE_COHORT.map(r => [r.rowId, r]));
const jById = new Map(V3_1_MODEL_JUDGEMENTS.map(j => [j.executionId, j]));

/** Parse "n/m" or ">= n/m" or ">= 90%" out of a frozen threshold string. Never restated here. */
function parseThreshold(t: string): { kind: 'fraction'; min: number; of: number } | { kind: 'percent'; min: number } | { kind: 'max'; max: number; of: number } | { kind: 'zero' } {
  if (/=\s*0\s*$/.test(t)) return { kind: 'zero' };
  const le = /<=\s*(\d+)\s*\/\s*(\d+)/.exec(t);
  if (le) return { kind: 'max', max: Number(le[1]), of: Number(le[2]) };
  const fr = /(\d+)\s*\/\s*(\d+)/.exec(t);
  if (fr) return { kind: 'fraction', min: Number(fr[1]), of: Number(fr[2]) };
  const pc = /(\d+)\s*%/.exec(t);
  if (pc) return { kind: 'percent', min: Number(pc[1]) };
  throw new Error(`ABORT: unparseable frozen threshold ${JSON.stringify(t)}`);
}

// ---------------------------------------------------------------- completeness
const missing = behavioral
  .map(r => `${r.rowId}-R${r.replicateNumber}`)
  .filter(id => !jById.has(id));
if (missing.length > 0) throw new Error(`ABORT: model judgements missing for ${missing.join(', ')}`);

const items = behavioral
  .slice().sort((a, b) => a.sequencePosition - b.sequencePosition)
  .map(r => {
    const id = `${r.rowId}-R${r.replicateNumber}`;
    const j = jById.get(id)!;
    const row = rowById.get(r.rowId)!;
    const adm = admission.executions.find((a: any) => a.rowId === r.rowId && a.replicate === r.replicateNumber);
    return {
      executionId: id, rowId: r.rowId, replicate: r.replicateNumber,
      sequencePosition: r.sequencePosition,
      families: row.families,
      unconditionalProposalOpportunity: row.unconditionalProposalOpportunity,
      challengeOpportunity: row.challengeOpportunity,
      conjunctCount: row.conjuncts.length,
      providerVerdict: r.verdict,
      declarations: r.declarationModes,
      proposedQuestion: r.proposedClarification?.question ?? null,
      bindingFactKey: r.bindingFactKey,
      challengeReasons: r.challengeReasons ?? [],
      correctedAdmission: adm?.recomputedAdmission.admitted ? 'ADMITTED' : 'REFUSED',
      modelAxes: j.axes,
      MODEL_OUTCOME: j.outcome,
    };
  });

const n = (pred: (i: typeof items[number]) => boolean): typeof items => items.filter(pred);
const axis = (i: typeof items[number], a: string): string | undefined => (i.modelAxes as any)[a]?.finding;
const passOn = (set: typeof items, a: string): number => set.filter(i => axis(i, a) === 'PASS').length;
const failOn = (set: typeof items, a: string): typeof items => set.filter(i => axis(i, a) === 'FAIL');
const applicable = (set: typeof items, a: string): typeof items => set.filter(i => axis(i, a) !== undefined && axis(i, a) !== 'NOT_APPLICABLE');

// ---- gate scopes, derived from the frozen cohort rather than hardcoded
const openFactRows = PROSPECTIVE_COHORT.filter(r => !r.challengeOpportunity).map(r => r.rowId);
const openFact = n(i => openFactRows.includes(i.rowId));
const opportunities = n(i => i.unconditionalProposalOpportunity);
const regression = n(i => i.families.includes('EXISTING_SUFFICIENT_QUESTION'));
const conjunctive = n(i => i.conjunctCount > 1);
const challengeBearing = n(i => i.challengeReasons.length > 0);
const noProposalExpected = n(i => i.families.includes('EXISTING_SUFFICIENT_QUESTION') || i.challengeOpportunity);

function verdictFor(t: string, observedNum: number, observedDen: number): string {
  const p = parseThreshold(t);
  if (p.kind === 'zero') return observedNum === 0 ? 'PASS' : 'FAIL';
  if (p.kind === 'max') return observedNum <= p.max ? 'PASS' : 'FAIL';
  if (p.kind === 'percent') return observedDen === 0 ? 'NOT_EXERCISED'
    : (observedNum / observedDen) * 100 >= p.min ? 'PASS' : 'FAIL';
  return observedNum >= p.min ? 'PASS' : 'FAIL';
}

// ---- clarification policy, on the preregistered denominator (never proposals/total)
const APPROPRIATE = opportunities.filter(i => i.MODEL_OUTCOME.appropriateProposal === true).length;
const MISSED = opportunities.filter(i => i.MODEL_OUTCOME.appropriateProposal === false).length;
const UNNECESSARY = noProposalExpected.filter(i => i.MODEL_OUTCOME.unnecessaryProposal === true).length;
const PROPOSALS_ON_OPPORTUNITIES = opportunities.filter(i => i.proposedQuestion !== null).length;

const g = [
  { id: 'G1_owedFactPreserved', scope: GATES.G1_owedFactPreserved.scope,
    observed: `${passOn(openFact, 'OWED_FACT_PRESERVED')}/${openFact.length}`,
    threshold: GATES.G1_owedFactPreserved.threshold,
    verdict: verdictFor(GATES.G1_owedFactPreserved.threshold, passOn(openFact, 'OWED_FACT_PRESERVED'), openFact.length) },
  { id: 'G2_clarificationTargetCorrect', scope: GATES.G2_clarificationTargetCorrect.scope,
    observed: `${passOn(applicable(items, 'CLARIFICATION_TARGET_CORRECT'), 'CLARIFICATION_TARGET_CORRECT')}/${applicable(items, 'CLARIFICATION_TARGET_CORRECT').length}`,
    threshold: GATES.G2_clarificationTargetCorrect.threshold,
    verdict: verdictFor(GATES.G2_clarificationTargetCorrect.threshold, passOn(applicable(items, 'CLARIFICATION_TARGET_CORRECT'), 'CLARIFICATION_TARGET_CORRECT'), applicable(items, 'CLARIFICATION_TARGET_CORRECT').length) },
  { id: 'G3_clarificationEvidenceSufficient', scope: GATES.G3_clarificationEvidenceSufficient.scope,
    observed: `${passOn(applicable(items, 'CLARIFICATION_EVIDENCE_SUFFICIENT'), 'CLARIFICATION_EVIDENCE_SUFFICIENT')}/${applicable(items, 'CLARIFICATION_EVIDENCE_SUFFICIENT').length}`,
    threshold: GATES.G3_clarificationEvidenceSufficient.threshold,
    verdict: verdictFor(GATES.G3_clarificationEvidenceSufficient.threshold, passOn(applicable(items, 'CLARIFICATION_EVIDENCE_SUFFICIENT'), 'CLARIFICATION_EVIDENCE_SUFFICIENT'), applicable(items, 'CLARIFICATION_EVIDENCE_SUFFICIENT').length) },
  { id: 'G4_nearbyPropertySubstitution', scope: GATES.G4_nearbyPropertySubstitution.scope,
    observed: failOn(items, 'NO_NEARBY_PROPERTY_SUBSTITUTION').length,
    which: failOn(items, 'NO_NEARBY_PROPERTY_SUBSTITUTION').map(i => i.executionId),
    threshold: GATES.G4_nearbyPropertySubstitution.threshold,
    verdict: verdictFor(GATES.G4_nearbyPropertySubstitution.threshold, failOn(items, 'NO_NEARBY_PROPERTY_SUBSTITUTION').length, items.length) },
  { id: 'G5_adjacentFactContained', scope: GATES.G5_adjacentFactContained.scope,
    observed: `${passOn(items, 'ADJACENT_FACT_CONTAINED')}/${items.length}`,
    threshold: GATES.G5_adjacentFactContained.threshold,
    verdict: verdictFor(GATES.G5_adjacentFactContained.threshold, passOn(items, 'ADJACENT_FACT_CONTAINED'), items.length) },
  { id: 'G6_unnecessaryClarification', scope: GATES.G6_unnecessaryClarification.scope,
    observed: `${UNNECESSARY}/${noProposalExpected.length}`,
    which: noProposalExpected.filter(i => i.MODEL_OUTCOME.unnecessaryProposal === true).map(i => i.executionId),
    threshold: GATES.G6_unnecessaryClarification.threshold,
    verdict: verdictFor(GATES.G6_unnecessaryClarification.threshold, UNNECESSARY, noProposalExpected.length) },
  { id: 'G7_missedClarificationOnOpportunities', scope: GATES.G7_missedClarificationOnOpportunities.scope,
    observed: `${APPROPRIATE}/${opportunities.length}`,
    threshold: GATES.G7_missedClarificationOnOpportunities.threshold,
    verdict: verdictFor(GATES.G7_missedClarificationOnOpportunities.threshold, APPROPRIATE, opportunities.length) },
  { id: 'G8_goodBehaviourRegression', scope: GATES.G8_goodBehaviourRegression.scope,
    observed: `${regression.filter(i => i.MODEL_OUTCOME.goodBehaviourPreserved === true).length}/${regression.length}`,
    threshold: GATES.G8_goodBehaviourRegression.threshold,
    verdict: verdictFor(GATES.G8_goodBehaviourRegression.threshold, regression.filter(i => i.MODEL_OUTCOME.goodBehaviourPreserved === true).length, regression.length) },
  { id: 'G9_conjunctiveSufficiency', scope: GATES.G9_conjunctiveSufficiency.scope,
    observed: `${conjunctive.filter(i => i.MODEL_OUTCOME.conjunctiveInsufficiencyIdentified === true).length}/${conjunctive.length}`,
    threshold: GATES.G9_conjunctiveSufficiency.threshold,
    verdict: verdictFor(GATES.G9_conjunctiveSufficiency.threshold, conjunctive.filter(i => i.MODEL_OUTCOME.conjunctiveInsufficiencyIdentified === true).length, conjunctive.length) },
];

const challengeValid = challengeBearing.filter(i => axis(i, 'CHALLENGE_CORRECTNESS') === 'PASS').length;
const challengeReviewable = challengeBearing.filter(i => axis(i, 'CHALLENGE_REVIEWABILITY') === 'REVIEWABLE').length;
const g10 = {
  id: 'G10_challengeValidityAndReviewability',
  scope: GATES.G10_challengeValidityAndReviewability.scope,
  challengeBearingExecutions: challengeBearing.length,
  CHALLENGE_VALIDITY_OBSERVED: `${challengeValid} / ${challengeBearing.length}`,
  CHALLENGE_REVIEWABILITY_OBSERVED: `${challengeReviewable} / ${challengeBearing.length}`,
  threshold: GATES.G10_challengeValidityAndReviewability.threshold,
  PREREGISTERED_THRESHOLD_EVALUATION: challengeBearing.length === 0 ? 'NOT_EXERCISED'
    : challengeBearing.length < 5 ? 'NOT_MEANINGFULLY_ESTIMABLE' : 'ESTIMABLE',
  caveat: challengeBearing.length < 5
    ? `n = ${challengeBearing.length}. Reported as x/n. Not a population proportion, and no `
      + 'threshold is applied at this n. The gate is not modified.'
    : null,
};

const allSemanticPass = g.every(x => x.verdict === 'PASS');

const doc = {
  artifact: 'SECTION_192_MODEL_SEMANTIC_ADJUDICATION',
  date: '2026-09-06',
  ADJUDICATION_KIND: 'MODEL_SEMANTIC_ADJUDICATION',
  adjudicator: 'MODEL (claude-opus-5) — NOT a human reviewer',
  IS_THIS_A_HUMAN_ADJUDICATION: false,
  preregisteredAxisClass: 'MODEL_DIAGNOSTIC — classified before spend; HUMAN_REQUIRED was empty',
  humanAcceptanceGate: 'NOT DISCHARGED BY §192. It remains a separate later step.',
  POPULATION: 'verifier-v3.1 — never combined with the §187B v3 cohort',
  PROVIDER_CALLS: 0,
  DATABASE_OPERATIONS: 0,
  thresholdProvenance: 'every threshold read from the frozen preregistration at scoring time',
  preregistrationSha256: sha(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8')),
  executionsJudged: items.length,
  SEMANTIC_DEVELOPMENT_GATES: g,
  G10_challenge: g10,
  ALL_SEMANTIC_DEVELOPMENT_GATES_PASS: allSemanticPass,
  CLARIFICATION_POLICY: {
    denominatorRule: PREREG.CLARIFICATION_POLICY_DENOMINATOR.rule,
    OPPORTUNITIES: opportunities.length,
    opportunityRows: PREREG.CLARIFICATION_POLICY_DENOMINATOR.opportunityRows,
    opportunityPropertyFamilies: PREREG.CLARIFICATION_POLICY_DENOMINATOR.opportunityPropertyFamilies,
    PROPOSALS: PROPOSALS_ON_OPPORTUNITIES,
    APPROPRIATE_PROPOSALS: APPROPRIATE,
    MISSED_PROPOSALS: MISSED,
    UNNECESSARY_PROPOSALS: UNNECESSARY,
    unnecessaryScope: `${noProposalExpected.length} executions where no proposal was owed`,
    rawRateNotUsed: `${items.filter(i => i.proposedQuestion !== null).length}/${items.length} is the raw emission count and is NOT the policy denominator`,
  },
  items,
};
writeFileSync(join(EVID, 'MODEL-SEMANTIC-ADJUDICATION.json'), `${JSON.stringify(doc, null, 2)}\n`);

console.log(`MODEL SEMANTIC ADJUDICATION — ${items.length} executions judged`);
for (const x of g) console.log(`  ${x.verdict.padEnd(5)} ${x.id}  ${x.observed}  (gate ${x.threshold})`);
console.log(`  ---   ${g10.id}  validity ${g10.CHALLENGE_VALIDITY_OBSERVED}  reviewability ${g10.CHALLENGE_REVIEWABILITY_OBSERVED}  ${g10.PREREGISTERED_THRESHOLD_EVALUATION}`);
console.log(`ALL SEMANTIC DEVELOPMENT GATES PASS: ${allSemanticPass}`);
console.log(`CLARIFICATION POLICY  opportunities=${opportunities.length} proposals=${PROPOSALS_ON_OPPORTUNITIES} appropriate=${APPROPRIATE} missed=${MISSED} unnecessary=${UNNECESSARY}`);
