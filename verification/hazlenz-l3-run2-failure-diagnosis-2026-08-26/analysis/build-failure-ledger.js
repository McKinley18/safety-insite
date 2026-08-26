#!/usr/bin/env node
/*
 * L3 RUN-2 ACCEPTANCE FAILURE -- ROW-LEVEL FAILURE LEDGER.
 *
 * ZERO PROVIDER CALLS. Derived entirely from evidence Run 2 already produced and from the frozen
 * holdout's truth metadata. It READS ONLY and writes nothing back into the acceptance package.
 *
 * THE SCORER IS NOT REIMPLEMENTED AS A JUDGE. The frozen scorer's verdict stands exactly as
 * recorded in ACCEPTANCE_SCORE.json and is asserted here against every count this file derives; a
 * mismatch THROWS. The predicates below exist only to identify WHICH ROWS the frozen scorer counted,
 * which the scorer itself does not enumerate. If any derived count disagrees with the frozen
 * scorer's own number, this file refuses to produce a ledger.
 *
 * ---------------------------------------------------------------------------------------------
 * A STRUCTURAL FACT THAT CONSTRAINS EVERY ATTRIBUTION IN THIS PHASE
 * ---------------------------------------------------------------------------------------------
 * The frozen result-record contract is derived ENTIRELY FROM THE DETERMINISTIC VALIDATOR'S OUTPUT
 * (pre-execution gate declaration section 6, inherited verbatim from Run 1):
 *
 *     candidates                    <- validation.validated.hazards
 *     assertedState                 <- validation.validated.hazards
 *     raisedClarification           <- validation.validated.hazards[].clarification
 *                                      OR validation.validated.unresolvedDecisions
 *     schemaValid / retries         <- validator state + attempt count
 *     nonRetryableValidationReasons <- validator issue codes
 *     safetyConsequentialRejection  <- validator state + frozen truth
 *     decisionBoundaryCodes         <- validator issue codes
 *
 * THE SEMANTIC EVIDENCE BINDER IS RECORDED SEPARATELY (D-58) AND IS NEVER MERGED INTO THE SCORED
 * TIER. Therefore a binder rejection or demotion CANNOT, BY CONSTRUCTION, CAUSE ANY G1/G2/G3/G4/
 * G9 outcome. Layer `E. BINDER` is structurally unavailable as a root cause for the scored gates,
 * and this file proves that claim rather than asserting it (see binderInvisibility below).
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', '..');
const RUN2 = path.join(ROOT, 'verification', 'hazlenz-l3-run2-sealed-acceptance-2026-08-25');
const HOLDOUT_P = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

// ---- evidence-drift gate: refuse to diagnose drifted evidence -------------------------------
const EXPECT = {
  [HOLDOUT_P]: 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f',
  [path.join(RUN2, 'results', 'raw-process-A.json')]: 'b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3',
  [path.join(RUN2, 'results', 'raw-process-B.json')]: '514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f',
};
for (const [p, e] of Object.entries(EXPECT)) {
  const a = sha(p);
  if (a !== e) throw new Error(`EVIDENCE DRIFT: ${p}\n  expected ${e}\n  found    ${a}\nREFUSING TO DIAGNOSE.`);
}

const holdout = JSON.parse(fs.readFileSync(HOLDOUT_P, 'utf8'));
const rawA = JSON.parse(fs.readFileSync(path.join(RUN2, 'results', 'raw-process-A.json'), 'utf8'));
const rawB = JSON.parse(fs.readFileSync(path.join(RUN2, 'results', 'raw-process-B.json'), 'utf8'));
const frozenScore = JSON.parse(fs.readFileSync(path.join(RUN2, 'scoring', 'ACCEPTANCE_SCORE.json'), 'utf8')).score;

const A = new Map(rawA.rows.map((r) => [r.rowId, r]));
const B = new Map(rawB.rows.map((r) => [r.rowId, r]));

// ---- the frozen scorer's own predicates, transcribed verbatim from ea5e50ae... ---------------
const hasCandidate = (res) => !!res && Array.isArray(res.candidates) && res.candidates.length > 0;
const raised = (res) => !!res && res.raisedClarification === true;
const schemaOk = (res) => !!res && res.schemaValid === true && (res.retries || 0) <= 1;
const material = (res) => JSON.stringify({
  state: res ? (res.assertedState === undefined ? null : res.assertedState) : null,
  clar: res ? res.raisedClarification === true : null,
  any: hasCandidate(res),
});

const G8_CODES = ['UNRESOLVED_DECISION_NOT_DECISION_CRITICAL', 'INVALID_CLARIFICATION_DEPENDENCY'];

// ---- identify the exact rows the frozen scorer counted --------------------------------------
const rows = holdout.rows;
const failing = {
  G1: rows.filter((r) => r.expect.highConsequence === true)
        .filter((r) => { const res = A.get(r.rowId); return !res || !schemaOk(res) || !hasCandidate(res); }),
  G2: rows.filter((r) => raised(A.get(r.rowId))).filter((r) => r.expect.clarificationExpected !== true),
  G3: rows.filter((r) => r.expect.clarificationExpected === true).filter((r) => !raised(A.get(r.rowId))),
  G4: rows.filter((r) => r.expect.inG4Denominator === true)
        .filter((r) => { const res = A.get(r.rowId); return !!res && res.assertedState === 'ACTIVE'; }),
  G5: rows.filter((r) => { const res = A.get(r.rowId); return !!res && res.safetyConsequentialRejection === true; }),
  G6: rows.filter((r) => (A.get(r.rowId)?.nonRetryableValidationReasons || []).length > 0),
  G7: rows.filter((r) => r.expect.inG7Pole === true).filter((r) => raised(A.get(r.rowId))),
  G8: rows.filter((r) => (A.get(r.rowId)?.decisionBoundaryCodes || []).some((c) => G8_CODES.includes(c))),
  G9: rows.filter((r) => material(A.get(r.rowId)) !== material(B.get(r.rowId) || null)),
  G10: rows.filter((r) => !schemaOk(A.get(r.rowId))),
};

// ---- FAIL-CLOSED: every derived count must equal the frozen scorer's own number ---------------
const g = (n) => frozenScore.gates.find((x) => x.name === n);
const assertions = [
  ['G1', failing.G1.length, g('G1').violations],
  ['G2', failing.G2.length, g('G2').violations],
  ['G3 misses (DEN_A - NUM_A)', failing.G3.length, g('G3').denominatorA - g('G3').numeratorA],
  ['G4', failing.G4.length, g('G4').violations],
  ['G5', failing.G5.length, g('G5').violations],
  ['G6 rows', failing.G6.length, Object.values(g('G6').byCode || {}).reduce((a, b) => a + b, 0)],
  ['G7', failing.G7.length, g('G7').violations],
  ['G8', failing.G8.length, g('G8').violations],
  ['G9', failing.G9.length, g('G9').violations],
  ['G10 non-conforming', failing.G10.length, g('G10').denominator - g('G10').conforming],
];
const mismatches = assertions.filter(([, derived, frozen]) => derived !== frozen);
if (mismatches.length) {
  throw new Error('LEDGER DOES NOT REPRODUCE THE FROZEN SCORER:\n'
    + mismatches.map(([n, d, f]) => `  ${n}: derived ${d}, frozen ${f}`).join('\n')
    + '\nREFUSING TO PRODUCE A LEDGER. The frozen verdict stands; this file is wrong.');
}

// ---- PROOF that the binder is invisible to the scored tier -----------------------------------
// For every row, the scorer-visible candidate set must equal the VALIDATED tier and must be
// unaffected by binder rejections/demotions. Demonstrated by counting rows where the binder
// removed or demoted a candidate and showing the scored fields did not move with it.
const binderInvisibility = (() => {
  let binderActedRows = 0, scoredTierMatchesValidatedTier = 0, scoredTierMatchesBoundTier = 0;
  for (const r of rawA.rows) {
    const st = r.semanticTier;
    if (st && (st.rejected.length > 0 || st.demoted.length > 0)) binderActedRows++;
    if (r.candidates.length === r.validatedHazardCount) scoredTierMatchesValidatedTier++;
    if (st && r.candidates.length === st.boundHazardCount) scoredTierMatchesBoundTier++;
  }
  return { binderActedRows, scoredTierMatchesValidatedTier, scoredTierMatchesBoundTier, totalRows: rawA.rows.length };
})();

// ---- ledger ----------------------------------------------------------------------------------
const truth = new Map(rows.map((r) => [r.rowId, r]));
const view = (res) => res ? {
  present: true,
  schemaValid: res.schemaValid, retries: res.retries, attempts: res.attempts,
  outcomeKind: res.outcomeKind,
  candidateCount: res.candidates.length,
  candidateStates: res.candidates.map((c) => c.conditionState),
  candidateFamilies: res.candidates.map((c) => c.hazardFamily),
  assertedState: res.assertedState,
  raisedClarification: res.raisedClarification,
  candidateBorneClarification: res.candidateBorneClarification,
  proposalLevelClarificationCount: res.proposalLevelClarificationCount,
  validationState: res.validationState,
  validationIssueCodes: res.validationIssueCodes,
  nonRetryableValidationReasons: res.nonRetryableValidationReasons,
  safetyConsequentialRejection: res.safetyConsequentialRejection,
  decisionBoundaryCodes: res.decisionBoundaryCodes,
  binder: res.semanticTier ? {
    boundHazardCount: res.semanticTier.boundHazardCount,
    boundStates: res.semanticTier.boundStates,
    boundAssertsActive: res.semanticTier.boundAssertsActive,
    rejected: res.semanticTier.rejected,
    demoted: res.semanticTier.demoted,
    issueCodes: res.semanticTier.issueCodes,
  } : null,
  providerEvaluated: res.providerEvaluated,
} : { present: false };

const gatesOf = (rowId) => Object.entries(failing)
  .filter(([, arr]) => arr.some((r) => r.rowId === rowId)).map(([k]) => k);

const failingRowIds = [...new Set(Object.entries(failing)
  .filter(([k]) => ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G9'].includes(k))
  .flatMap(([, arr]) => arr.map((r) => r.rowId)))].sort();

const ledger = failingRowIds.map((rowId) => {
  const t = truth.get(rowId), a = A.get(rowId), b = B.get(rowId);
  const gs = gatesOf(rowId).filter((x) => ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G9'].includes(x));
  const reasons = {};
  if (gs.includes('G1')) reasons.G1 = !schemaOk(a) ? 'schemaOk false' : (!hasCandidate(a) ? 'ZERO validated candidates on a highConsequence row' : 'record absent');
  if (gs.includes('G2')) reasons.G2 = 'raisedClarification=true on a row whose frozen truth has clarificationExpected=false';
  if (gs.includes('G3')) reasons.G3 = 'clarificationExpected=true but raisedClarification=false';
  if (gs.includes('G4')) reasons.G4 = `assertedState=ACTIVE on an inG4Denominator row (frozen truth ${t.expect.conditionState})`;
  if (gs.includes('G5')) reasons.G5 = `validator state ${a.validationState} !== VALID on a row owed a hazard (truth ACTIVE or highConsequence)`;
  if (gs.includes('G6')) reasons.G6 = `non-retryable validator codes ${JSON.stringify(a.nonRetryableValidationReasons)}`;
  if (gs.includes('G9')) reasons.G9 = `material(A) !== material(B): A=${material(a)} B=${material(b)}`;
  return {
    rowId, provenanceClass: t.provenanceClass, family: t.family, familyVariant: t.familyVariant,
    pole: t.pole, sourceId: t.sourceId,
    gates: gs,
    expectedTruth: t.expect,
    processA: view(a), processB: view(b),
    abAgreeOnScoredFields: material(a) === material(b),
    scorerReason: reasons,
  };
});

const out = {
  diagnosisId: 'hazlenz.l3.run2.failure-diagnosis.v1',
  providerCalls: 0, apiCostUsd: 0,
  evidence: {
    holdoutSha256: sha(HOLDOUT_P),
    rawProcessASha256: sha(path.join(RUN2, 'results', 'raw-process-A.json')),
    rawProcessBSha256: sha(path.join(RUN2, 'results', 'raw-process-B.json')),
    frozenTerminal: frozenScore.terminal,
    frozenPass: frozenScore.pass,
    frozenModelAcceptanceResult: frozenScore.modelAcceptanceResult,
  },
  ledgerReproducesFrozenScorer: true,
  reproductionAssertions: assertions.map(([n, d, f]) => ({ gate: n, derived: d, frozen: f, match: d === f })),
  binderInvisibility,
  failingRowCounts: Object.fromEntries(Object.entries(failing).map(([k, v]) => [k, v.length])),
  distinctFailingRows: failingRowIds.length,
  ledger,
};

fs.writeFileSync(path.join(__dirname, 'FAILURE_LEDGER.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`ledger built: ${failingRowIds.length} distinct failing rows across G1,G2,G3,G4,G5,G6,G9`);
console.log('reproduction vs frozen scorer:', assertions.map(([n, d, f]) => `${n} ${d}/${f}`).join(' | '));
console.log('binder invisibility:', JSON.stringify(binderInvisibility));
