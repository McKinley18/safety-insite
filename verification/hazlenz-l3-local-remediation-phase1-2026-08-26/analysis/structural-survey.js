/**
 * STRUCTURAL SURVEY of the recorded Run-2 output -- what a deterministic downstream layer could
 * actually SEE, before any truth label is consulted.
 *
 * Selection is by RECORDED STRUCTURE ONLY. Truth is joined afterwards, for reporting, so the survey
 * can state whether a structurally-selected cohort happens to align with a failure -- which is a
 * measurement, not a rule.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('../replay/recorded-output-replay');

const UNDECIDED = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN'];
const loaded = H.load();

function survey(rows, label) {
  const cohorts = {
    activeAsserted: [],
    activeWithUndecidedSibling: [],
    activeWithUndecidedSiblingAndCandidateClarification: [],
    activeWithCandidateClarification: [],
    proposalLevelCarrierUsed: [],
    zeroCandidates: [],
    validatorRejected: [],
    binderRejectedAll: [],
    binderDemoted: [],
  };
  for (const r of rows) {
    const states = r.providerTier.candidates.map(c => c.conditionState);
    const active = r.scoredTier.assertedState === 'ACTIVE';
    const undecidedSibling = states.some(s => UNDECIDED.includes(s));
    const candClar = r.providerTier.candidateBorneClarification === true;
    if (active) cohorts.activeAsserted.push(r.rowId);
    if (active && undecidedSibling) cohorts.activeWithUndecidedSibling.push(r.rowId);
    if (active && undecidedSibling && candClar) cohorts.activeWithUndecidedSiblingAndCandidateClarification.push(r.rowId);
    if (active && candClar) cohorts.activeWithCandidateClarification.push(r.rowId);
    if ((r.providerTier.proposalLevelClarificationCount || 0) > 0) cohorts.proposalLevelCarrierUsed.push(r.rowId);
    if (r.providerTier.candidates.length === 0) cohorts.zeroCandidates.push(r.rowId);
    if (r.validatorTier.validationState !== 'VALID') cohorts.validatorRejected.push(r.rowId);
    if (r.binderTier && (r.binderTier.rejected || []).length > 0 && (r.binderTier.boundStates || []).length === 0) cohorts.binderRejectedAll.push(r.rowId);
    if (r.binderTier && (r.binderTier.demoted || []).length > 0) cohorts.binderDemoted.push(r.rowId);
  }
  console.log(`\n=== PROCESS ${label} ===`);
  for (const [k, v] of Object.entries(cohorts)) console.log(`${String(v.length).padStart(3)}  ${k}${v.length && v.length <= 12 ? '  ' + v.join(',') : ''}`);
  return cohorts;
}

const A = survey(loaded.A, 'A');
const B = survey(loaded.B, 'B');

// Truth joined AFTER selection, for reporting only.
const truthOf = new Map(loaded.A.map(r => [r.rowId, r.truth]));
console.log('\n=== does the structural cohort "ACTIVE + undecided sibling + candidate clarification" align with G4? ===');
const g4Den = loaded.A.filter(r => r.truth.inG4Denominator).map(r => r.rowId);
const g4False = loaded.A.filter(r => r.truth.inG4Denominator && r.scoredTier.assertedState === 'ACTIVE').map(r => r.rowId);
console.log(`G4 denominator (${g4Den.length}) = ${g4Den.join(',')}`);
console.log(`G4 false ACTIVE (A) = ${g4False.join(',')}`);
console.log(`cohort A = ${A.activeWithUndecidedSiblingAndCandidateClarification.join(',')}`);
const inter = A.activeWithUndecidedSiblingAndCandidateClarification.filter(id => g4False.includes(id));
const collateral = A.activeWithUndecidedSiblingAndCandidateClarification.filter(id => !g4False.includes(id));
console.log(`  overlap with G4 false-ACTIVE: ${inter.length} -> ${inter.join(',')}`);
console.log(`  rows the cohort would also change: ${collateral.length} -> ${collateral.join(',')}`);
for (const id of collateral) {
  const t = truthOf.get(id);
  console.log(`     ${id}: truth state=${t.conditionState} activeProhibited=${t.activeProhibited} HC=${t.highConsequence} clarExpected=${t.clarificationExpected} inG4Den=${t.inG4Denominator}`);
}

console.log('\n=== the 4 G4 false-ACTIVE rows, full recorded structure (A and B) ===');
for (const id of g4False) {
  for (const [label, rows] of [['A', loaded.A], ['B', loaded.B]]) {
    const r = rows.find(x => x.rowId === id);
    console.log(`${id} ${label}: cands=${JSON.stringify(r.providerTier.candidates)} clar=${r.providerTier.raisedClarification} candBorne=${r.providerTier.candidateBorneClarification} propCarrier=${r.providerTier.proposalLevelClarificationCount} outcome=${r.providerTier.outcomeKind} val=${r.validatorTier.validationState} bound=${JSON.stringify(r.binderTier && r.binderTier.boundStates)} binderIssues=${JSON.stringify(r.binderTier && r.binderTier.issueCodes)}`);
  }
}

console.log('\n=== the 13 G3 misses: was a clarification present anywhere upstream? ===');
const denA = loaded.A.filter(r => r.truth.clarificationExpected === true).map(r => r.rowId);
const missA = loaded.A.filter(r => r.truth.clarificationExpected === true && r.scoredTier.raisedClarification !== true).map(r => r.rowId);
console.log(`DEN_A=${denA.length}  misses=${missA.length}`);
for (const id of missA) {
  const a = loaded.A.find(x => x.rowId === id), b = loaded.B.find(x => x.rowId === id);
  console.log(`${id}  A: cands=${JSON.stringify(a.providerTier.candidates.map(c=>c.conditionState))} candBorne=${a.providerTier.candidateBorneClarification} propCarrier=${a.providerTier.proposalLevelClarificationCount} bound=${JSON.stringify(a.binderTier&&a.binderTier.boundStates)} demoted=${JSON.stringify(a.binderTier&&a.binderTier.demoted)}`);
  console.log(`        B: cands=${JSON.stringify(b.providerTier.candidates.map(c=>c.conditionState))} candBorne=${b.providerTier.candidateBorneClarification} propCarrier=${b.providerTier.proposalLevelClarificationCount} clar=${b.scoredTier.raisedClarification}`);
}
fs.writeFileSync(path.join(__dirname, '..', 'results', 'STRUCTURAL_SURVEY.json'), JSON.stringify({ A, B, g4Den, g4False, denA, missA }, null, 2));
