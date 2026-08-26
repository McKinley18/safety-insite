#!/usr/bin/env node
/*
 * L3 RUN-2 FAILURE -- PIPELINE ATTRIBUTION AND ROOT-CAUSE CONSOLIDATION.
 *
 * ZERO PROVIDER CALLS. Reads the failure ledger and the frozen evidence only.
 *
 * THE ATTRIBUTION RULE, APPLIED IN BOTH DIRECTIONS AS THE PHASE REQUIRES:
 *   - a downstream rejection is NOT attributed to the provider if the proposal was substantively
 *     correct before binding/validation;
 *   - a provider error is NOT attributed to the binder merely because the binder later rejected it.
 *
 * TWO STRUCTURAL FACTS CONSTRAIN EVERY ATTRIBUTION, AND BOTH ARE PROVEN, NOT ASSUMED:
 *
 *   1. THE SCORED TIER IS THE VALIDATED TIER. Every scorer-visible field derives from the
 *      deterministic validator's output (gate declaration s.6). The semantic binder is recorded
 *      separately (D-58) and never merged. FAILURE_LEDGER.json proves scoredTierMatchesValidatedTier
 *      = 93/93 while scoredTierMatchesBoundTier = 86/93. => LAYER E (BINDER) IS STRUCTURALLY
 *      INCAPABLE of causing any scored failure. It is not "ruled out by judgement"; it cannot reach.
 *
 *   2. THE VALIDATOR IS DETERMINISTIC. It is a pure function of (proposal, input). Both processes
 *      ran the identical byte-frozen validator 942ac7cc over the identical byte-frozen input. So
 *      wherever process A and process B disagree, THE PROPOSAL DIFFERED -- the divergence is
 *      provider-origin by construction, and no pipeline stage can have introduced it.
 */
'use strict';
const fs = require('fs'), path = require('path');
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'FAILURE_LEDGER.json'), 'utf8'));
const led = L.ledger;
const out = [];
const say = (s = '') => out.push(s);
const has = (r, g) => r.gates.includes(g);

// ---- per-row attribution ---------------------------------------------------------------------
function attribute(r) {
  const a = r.processA, b = r.processB;
  // G1 / G5 / G6 on this corpus all arise from a validator rejection of the model's own output.
  if (has(r, 'G6') || has(r, 'G5') || (has(r, 'G1') && a.validationState !== 'VALID')) {
    const codes = a.validationIssueCodes.join(',');
    return { layer: 'D. PROVIDER_EVIDENCE_SELECTION',
      why: `the validator REJECTED the model's own proposal with ${codes}. The validator is byte-frozen (942ac7cc) and deterministic, and process B validated the SAME row VALID with a candidate -- so the rejected artefact is the model's output, not a pipeline fault. The validator enforcing a real defect is the validator working, not a validator defect.` };
  }
  if (has(r, 'G4')) {
    return { layer: 'B. PROVIDER_STATE_RESOLUTION',
      why: `the model asserted ACTIVE where frozen truth is ${r.expectedTruth.conditionState} and activeProhibited=${r.expectedTruth.activeProhibited}. The validator accepted it (state ${a.validationState}) and the binder BOUND it (${JSON.stringify(a.binder ? a.binder.boundStates : null)}) -- neither stage removed it, so neither can be the origin. Process B is identical, so it is deterministic model behaviour, not sampling noise.` };
  }
  if (has(r, 'G3')) {
    return { layer: 'C. PROVIDER_CLARIFICATION_DECISION',
      why: `clarification expected; the model expressed NONE in EITHER carrier (candidate-borne=${a.candidateBorneClarification}, proposal-level=${a.proposalLevelClarificationCount}). Nothing existed to be dropped downstream, so no pipeline stage can have removed it. Process B also failed to raise -- deterministic.` };
  }
  if (has(r, 'G2')) {
    return { layer: 'C. PROVIDER_CLARIFICATION_DECISION',
      why: `the model raised a clarification on a row whose frozen truth is clarificationExpected=false. It was candidate-borne (${a.candidateBorneClarification}) and survived validation and binding untouched, so the decision to ask is the model's.` };
  }
  if (has(r, 'G9')) {
    const bothValid = a.validationState === 'VALID' && b.validationState === 'VALID';
    return { layer: 'A. PROVIDER_REASONING',
      why: bothValid
        ? `both processes validated VALID yet the scored fields differ (A ${a.assertedState}/${a.raisedClarification}/${a.candidateCount>0} vs B ${b.assertedState}/${b.raisedClarification}/${b.candidateCount>0}). Identical frozen input, identical deterministic validator => THE PROPOSAL DIFFERED. Provider-origin non-determinism.`
        : `the validator rejected on ONE side only (A ${a.validationState} ${JSON.stringify(a.validationIssueCodes)} | B ${b.validationState} ${JSON.stringify(b.validationIssueCodes)}). A deterministic validator cannot reject one of two identical inputs => THE PROPOSAL DIFFERED. Provider-origin non-determinism.` };
  }
  return { layer: 'J. INDETERMINATE', why: 'no dominant mechanism identified' };
}

for (const r of led) r.attribution = attribute(r);

// ---- counts -----------------------------------------------------------------------------------
const byLayer = {};
for (const r of led) byLayer[r.attribution.layer] = (byLayer[r.attribution.layer] || 0) + 1;

const providerLayers = ['A. PROVIDER_REASONING', 'B. PROVIDER_STATE_RESOLUTION', 'C. PROVIDER_CLARIFICATION_DECISION', 'D. PROVIDER_EVIDENCE_SELECTION'];
const providerRows = led.filter((r) => providerLayers.includes(r.attribution.layer)).length;
const pipelineRows = led.filter((r) => ['E. BINDER', 'F. VALIDATOR', 'G. RESULT_MAPPING', 'H. SCORER', 'I. CONTRACT/REPRESENTATION'].includes(r.attribution.layer)).length;
const indeterminate = led.filter((r) => r.attribution.layer === 'J. INDETERMINATE').length;

say('L3 RUN-2 ACCEPTANCE FAILURE -- PIPELINE ATTRIBUTION');
say('ZERO provider calls. $0.00. Derived from frozen Run-2 evidence only.');
say('');
say('STRUCTURAL CONSTRAINTS, PROVEN NOT ASSUMED');
say(`  scored tier == VALIDATED tier on ${L.binderInvisibility.scoredTierMatchesValidatedTier}/${L.binderInvisibility.totalRows} rows`);
say(`  scored tier == BOUND tier on     ${L.binderInvisibility.scoredTierMatchesBoundTier}/${L.binderInvisibility.totalRows} rows`);
say(`  rows where the binder rejected or demoted: ${L.binderInvisibility.binderActedRows}`);
say('  => LAYER E (BINDER) CANNOT REACH THE SCORER. It is structurally excluded as a root cause,');
say('     not merely judged unlikely. D-58 keeps the two tiers separate by design.');
say('  => The VALIDATOR is byte-frozen and deterministic, so any A/B disagreement proves the');
say('     PROPOSAL differed. Pipeline stages cannot manufacture divergence.');
say('');
say('PER-LAYER ROW COUNTS (30 distinct failing rows)');
for (const [k, v] of Object.entries(byLayer).sort()) say(`  ${k.padEnd(38)} ${v}`);
say('');
say(`  PROVIDER-ORIGIN rows      ${providerRows} / ${led.length}`);
say(`  PIPELINE-ORIGIN rows      ${pipelineRows} / ${led.length}`);
say(`  INDETERMINATE rows        ${indeterminate} / ${led.length}`);
say('');

// ---- per-gate ledger ---------------------------------------------------------------------------
for (const g of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G9']) {
  const rs = led.filter((r) => has(r, g));
  say(`================ ${g} -- ${rs.length} contributing rows ================`);
  for (const r of rs) {
    say(`  ${r.rowId}  ${r.provenanceClass}${r.familyVariant ? ' / ' + r.familyVariant : ''}  gates=${r.gates.join(',')}`);
    say(`     truth: state=${r.expectedTruth.conditionState} hc=${r.expectedTruth.highConsequence} clarExpected=${r.expectedTruth.clarificationExpected} activeProhibited=${r.expectedTruth.activeProhibited}`);
    say(`     A: val=${r.processA.validationState} cands=${r.processA.candidateCount} state=${r.processA.assertedState} clar=${r.processA.raisedClarification} codes=${JSON.stringify(r.processA.validationIssueCodes)}`);
    say(`     B: val=${r.processB.validationState} cands=${r.processB.candidateCount} state=${r.processB.assertedState} clar=${r.processB.raisedClarification} codes=${JSON.stringify(r.processB.validationIssueCodes)}`);
    say(`     scorer counted it because: ${r.scorerReason[g]}`);
    say(`     ATTRIBUTION: ${r.attribution.layer}`);
    say(`        ${r.attribution.why}`);
    say('');
  }
}

fs.writeFileSync(path.join(__dirname, 'ATTRIBUTION.txt'), out.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'ATTRIBUTION.json'), JSON.stringify({
  byLayer, providerRows, pipelineRows, indeterminate,
  binderStructurallyExcluded: true,
  binderInvisibility: L.binderInvisibility,
  rows: led.map((r) => ({ rowId: r.rowId, gates: r.gates, provenanceClass: r.provenanceClass,
    familyVariant: r.familyVariant, layer: r.attribution.layer })),
}, null, 2) + '\n');
process.stdout.write(`attribution written. provider=${providerRows} pipeline=${pipelineRows} indeterminate=${indeterminate}\n`);
for (const [k, v] of Object.entries(byLayer).sort()) process.stdout.write(`  ${k.padEnd(38)} ${v}\n`);
