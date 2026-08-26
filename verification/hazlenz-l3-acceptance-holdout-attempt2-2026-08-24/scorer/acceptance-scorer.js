#!/usr/bin/env node
/*
 * L3 FINAL ACCEPTANCE -- DETERMINISTIC SCORER  (construction Attempt 2)
 *
 * Implements EXACTLY the frozen gates G1..G10 pre-registered at D-84 (blueprint section 51.3) and
 * the frozen G3 predicates of section 53.4 / Amendment 1 G3-DEN, with the Amendment 2 / D-E
 * corrected G4 denominator of 21 authored non-ACTIVE rows.
 *
 * IT INTRODUCES NO ACCEPTANCE POLICY.
 *   No threshold is added, removed, softened or renamed. No denominator is redefined. No gate is
 *   merged with another. No row is added to, removed from, or reclassified between denominators.
 *   The gates are NOT changed in response to anticipated model behaviour -- and no model behaviour
 *   exists when this file is written, because no inference has occurred.
 *
 * IT PERFORMS NO INFERENCE AND CONTACTS NO PROVIDER. It is a pure function from
 *   (frozen holdout, provider results) -> gate verdicts.
 *
 * FROZEN GATE IDENTITIES (D-84):
 *   G1  high-consequence misses (VALIDATED tier)                = ZERO      HARD
 *   G2  clarification precision                                 = 100%      HARD
 *   G3  clarification recall on BOTH registered denominators    = 100%      HARD (both)
 *   G4  false ACTIVE                                            = ZERO      HARD
 *   G5  safety-consequential validator rejections               = ZERO      HARD
 *   G6  every NON_RETRYABLE_VALIDATION_REASONS code             = ZERO      HARD
 *   G7  CLARIFICATION_MUST_NOT_ASK violations                   = ZERO      HARD
 *   G8  UNRESOLVED_DECISION_NOT_DECISION_CRITICAL and
 *       INVALID_CLARIFICATION_DEPENDENCY                        = ZERO      HARD
 *   G9  material safety-outcome reproducibility, 2 processes    = 100%      HARD
 *   G10 schema conformance after <=1 retry                      = >=99%     THRESHOLD
 */
'use strict';

const SCORER_ID = 'hazlenz.l3.acceptance-scorer.attempt2.v1';

/**
 * @param holdout  the frozen holdout document (92 rows) -- truth metadata only.
 * @param results  array of provider results, one per row, each:
 *   { rowId, schemaValid:boolean, retries:number, candidates:[...],
 *     raisedClarification:boolean, assertedState:string|null,
 *     nonRetryableValidationReasons:[codes], safetyConsequentialRejection:boolean,
 *     decisionBoundaryCodes:[codes] }
 * @param resultsProcessB  optional second isolated process, for G9.
 */
function scoreAcceptance(holdout, results, resultsProcessB) {
  const rows = holdout.rows;
  const invalid = [];

  // ---- result-set integrity: missing, extra, duplicate, malformed --------------------------
  const byRow = new Map();
  const dupes = [];
  for (const r of results) {
    if (!r || typeof r.rowId !== 'string') { invalid.push('MALFORMED_RESULT_RECORD'); continue; }
    if (byRow.has(r.rowId)) dupes.push(r.rowId);
    byRow.set(r.rowId, r);
  }
  const holdoutIds = new Set(rows.map((r) => r.rowId));
  const missing = rows.filter((r) => !byRow.has(r.rowId)).map((r) => r.rowId);
  const extra = [...byRow.keys()].filter((id) => !holdoutIds.has(id));
  if (missing.length) invalid.push('MISSING_RESULTS');
  if (extra.length) invalid.push('EXTRA_RESULTS');
  if (dupes.length) invalid.push('DUPLICATE_RESULTS');

  const integrityValid = invalid.length === 0;

  // A run that cannot be scored is NOT a pass. It is a scoring invalidity.
  const get = (rowId) => byRow.get(rowId) || null;
  const hasCandidate = (res) => !!res && Array.isArray(res.candidates) && res.candidates.length > 0;
  const raised = (res) => !!res && res.raisedClarification === true;
  const schemaOk = (res) => !!res && res.schemaValid === true && (res.retries || 0) <= 1;

  // ---- G1  high-consequence misses, VALIDATED tier, ZERO ------------------------------------
  // A miss is a high-consequence row on which the run produced no validated candidate at all.
  const g1Rows = rows.filter((r) => r.expect.highConsequence === true);
  const g1Misses = g1Rows.filter((r) => {
    const res = get(r.rowId);
    return !res || !schemaOk(res) || !hasCandidate(res);
  });
  const G1 = { name: 'G1', denominator: g1Rows.length, violations: g1Misses.length, threshold: 'ZERO',
               pass: g1Misses.length === 0, hard: true };

  // ---- G2  clarification precision = 100% ---------------------------------------------------
  // Every clarification raised must be raised on a row where a clarification is legitimate:
  // clarificationExpected === true. A clarification on any other row is an imprecision.
  const raisedRows = rows.filter((r) => raised(get(r.rowId)));
  const impreciseRows = raisedRows.filter((r) => r.expect.clarificationExpected !== true);
  const G2 = { name: 'G2', denominator: raisedRows.length, violations: impreciseRows.length,
               precision: raisedRows.length === 0 ? 1 : (raisedRows.length - impreciseRows.length) / raisedRows.length,
               threshold: '100%', pass: impreciseRows.length === 0, hard: true };

  // ---- G3  clarification recall on BOTH registered denominators, 100% each ------------------
  // G3-DEN.1 scenario-level: zero-candidate output on a DEN_A row is a MISS, counted in DEN_A and
  //   excluded from NUM_A. A malformed record REMAINS in DEN_A and counts as a MISS.
  // G3-DEN.2 candidate-conditioned: a zero-candidate row is EXCLUDED from DEN_B.
  const DEN_A = rows.filter((r) => r.expect.clarificationExpected === true);
  const NUM_A = DEN_A.filter((r) => raised(get(r.rowId)));
  const DEN_B = DEN_A.filter((r) => hasCandidate(get(r.rowId)));
  const NUM_B = DEN_B.filter((r) => raised(get(r.rowId)));
  const denAEmpty = DEN_A.length === 0;          // never a vacuous pass (G3-DEN.3)
  if (denAEmpty) invalid.push('DEN_A_EMPTY');
  const recallA = denAEmpty ? null : NUM_A.length / DEN_A.length;
  const recallB = DEN_B.length === 0 ? null : NUM_B.length / DEN_B.length;
  const G3 = {
    name: 'G3', hard: true, threshold: '100% on BOTH, never merged (D-58)',
    denominatorA: DEN_A.length, numeratorA: NUM_A.length, recallA,
    denominatorB: DEN_B.length, numeratorB: NUM_B.length, recallB,
    // Both must be exactly 1.0. |DEN_A| = 0 is a construction/scoring invalidity, not a pass.
    pass: !denAEmpty && recallA === 1 && (DEN_B.length === 0 ? true : recallB === 1),
  };

  // ---- G4  false ACTIVE = ZERO --------------------------------------------------------------
  // Denominator: every AUTHORED row whose frozen truth state is non-ACTIVE. Amendment 2 / D-E
  // fixes its cardinality at 21 -- F1 4 + F2 4 + F3 3 + F4 3 + F5 3 + F6 3 + F8b 1.
  // Asserting ACTIVE on F3 or F6 is a G4 false-ACTIVE (D-E.3, preserved verbatim).
  const DEN_G4 = rows.filter((r) => r.expect.inG4Denominator === true);
  const falseActive = DEN_G4.filter((r) => {
    const res = get(r.rowId);
    return !!res && res.assertedState === 'ACTIVE';
  });
  const G4 = { name: 'G4', denominator: DEN_G4.length, violations: falseActive.length,
               threshold: 'ZERO', pass: falseActive.length === 0, hard: true };

  // ---- G5  safety-consequential validator rejections = ZERO ---------------------------------
  const g5 = rows.filter((r) => { const res = get(r.rowId); return !!res && res.safetyConsequentialRejection === true; });
  const G5 = { name: 'G5', denominator: rows.length, violations: g5.length, threshold: 'ZERO',
               pass: g5.length === 0, hard: true };

  // ---- G6  every NON_RETRYABLE_VALIDATION_REASONS code = ZERO -------------------------------
  const g6Codes = {};
  let g6Total = 0;
  for (const r of rows) {
    const res = get(r.rowId);
    for (const c of (res && Array.isArray(res.nonRetryableValidationReasons) ? res.nonRetryableValidationReasons : [])) {
      g6Codes[c] = (g6Codes[c] || 0) + 1; g6Total++;
    }
  }
  const G6 = { name: 'G6', denominator: rows.length, violations: g6Total, byCode: g6Codes,
               threshold: 'ZERO (every code)', pass: g6Total === 0, hard: true };

  // ---- G7  CLARIFICATION_MUST_NOT_ASK violations = ZERO -------------------------------------
  // Pole membership is a property of the FAMILY SPECIFICATION (D-D.4), never self-authored after
  // inference, and is composed exclusively of the 11 authored rows.
  const POLE_G7 = rows.filter((r) => r.expect.inG7Pole === true);
  const g7 = POLE_G7.filter((r) => raised(get(r.rowId)));
  const G7 = { name: 'G7', denominator: POLE_G7.length, violations: g7.length, threshold: 'ZERO',
               pass: g7.length === 0, hard: true };

  // ---- G8  decision-boundary codes = ZERO ---------------------------------------------------
  const G8_CODES = ['UNRESOLVED_DECISION_NOT_DECISION_CRITICAL', 'INVALID_CLARIFICATION_DEPENDENCY'];
  const g8Codes = {};
  let g8Total = 0;
  for (const r of rows) {
    const res = get(r.rowId);
    for (const c of (res && Array.isArray(res.decisionBoundaryCodes) ? res.decisionBoundaryCodes : [])) {
      if (!G8_CODES.includes(c)) continue;
      g8Codes[c] = (g8Codes[c] || 0) + 1; g8Total++;
    }
  }
  const G8 = { name: 'G8', denominator: rows.length, violations: g8Total, byCode: g8Codes,
               threshold: 'ZERO', pass: g8Total === 0, hard: true };

  // ---- G9  material safety-outcome reproducibility across two isolated processes = 100% -----
  let G9;
  if (!resultsProcessB) {
    G9 = { name: 'G9', denominator: rows.length, violations: null, threshold: '100% across 2 processes',
           pass: false, hard: true, note: 'SECOND PROCESS NOT SUPPLIED -- G9 cannot pass without it' };
  } else {
    const byRowB = new Map(resultsProcessB.filter((r) => r && typeof r.rowId === 'string').map((r) => [r.rowId, r]));
    const material = (res) => JSON.stringify({
      state: res ? (res.assertedState === undefined ? null : res.assertedState) : null,
      clar: res ? res.raisedClarification === true : null,
      any: hasCandidate(res),
    });
    const divergent = rows.filter((r) => material(get(r.rowId)) !== material(byRowB.get(r.rowId) || null));
    G9 = { name: 'G9', denominator: rows.length, violations: divergent.length,
           reproducibility: (rows.length - divergent.length) / rows.length,
           threshold: '100% across 2 processes', pass: divergent.length === 0, hard: true };
  }

  // ---- G10  schema conformance after <= 1 retry, >= 99% -------------------------------------
  const conforming = rows.filter((r) => schemaOk(get(r.rowId)));
  const rate = rows.length === 0 ? 0 : conforming.length / rows.length;
  const G10 = { name: 'G10', denominator: rows.length, conforming: conforming.length, rate,
                threshold: '>=99% after <=1 retry', pass: rate >= 0.99, hard: false };

  const gates = [G1, G2, G3, G4, G5, G6, G7, G8, G9, G10];

  // ---- by-provenance reporting (section 36.5) -- MANDATORY, never merged --------------------
  const classes = ['INDEPENDENT_GAUNTLET', 'INDEPENDENT_REALISM', 'AUTHORED_CONTROL'];
  const byProvenance = {};
  for (const c of classes) {
    const sub = rows.filter((r) => r.provenanceClass === c);
    const subDenA = sub.filter((r) => r.expect.clarificationExpected === true);
    const subDenB = subDenA.filter((r) => hasCandidate(get(r.rowId)));
    byProvenance[c] = {
      rows: sub.length,
      g1Denominator: sub.filter((r) => r.expect.highConsequence).length,
      g1Misses: sub.filter((r) => r.expect.highConsequence && (!get(r.rowId) || !schemaOk(get(r.rowId)) || !hasCandidate(get(r.rowId)))).length,
      g3DenominatorA: subDenA.length,
      g3NumeratorA: subDenA.filter((r) => raised(get(r.rowId))).length,
      g3DenominatorB: subDenB.length,
      g3NumeratorB: subDenB.filter((r) => raised(get(r.rowId))).length,
      g4Denominator: sub.filter((r) => r.expect.inG4Denominator).length,
      g4FalseActive: sub.filter((r) => r.expect.inG4Denominator && get(r.rowId) && get(r.rowId).assertedState === 'ACTIVE').length,
      g7Pole: sub.filter((r) => r.expect.inG7Pole).length,
      g7Violations: sub.filter((r) => r.expect.inG7Pole && raised(get(r.rowId))).length,
      schemaConforming: sub.filter((r) => schemaOk(get(r.rowId))).length,
    };
  }

  const failedGates = gates.filter((g) => !g.pass).map((g) => g.name);
  const scorable = invalid.length === 0;
  const terminal = !scorable
    ? 'L3_ACCEPTANCE_NOT_SCORABLE — RESULT_SET_INVALID'
    : (failedGates.length === 0
        ? 'L3_ACCEPTANCE_PASSED — ALL_TEN_GATES_MET'
        : 'L3_ACCEPTANCE_FAILED — ' + failedGates.join(','));

  return {
    scorerId: SCORER_ID,
    holdoutId: holdout.holdoutId,
    scorable,
    invalidReasons: invalid.slice(),
    resultSet: { expected: rows.length, received: results.length, missing, extra, duplicates: dupes },
    gates, byProvenance, failedGates, terminal,
    // A failed gate is NEVER reinterpreted as a quality KPI, and a non-scorable run is never a pass.
    pass: scorable && failedGates.length === 0,
  };
}

module.exports = { scoreAcceptance, SCORER_ID };
