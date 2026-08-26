#!/usr/bin/env node
/*
 * L3 ACCEPTANCE SCORER v2 -- THE COMPLETE-PROVIDER-EVALUATION VALIDITY GATE.
 *
 * WHAT THIS IS. A PRE-SCORING VALIDITY GATE wrapped around the frozen scorer
 * `acceptance-scorer.js` @ ea5e50ae..., which is REQUIRED AND CALLED, NOT REIMPLEMENTED AND NOT
 * MODIFIED. Its digest is asserted at load; a drifted frozen scorer THROWS.
 *
 * WHY IT EXISTS (root cause, proven in ROOT_CAUSE_BEFORE_REMEDIATION.txt). The frozen scorer's
 * invalidity vocabulary asks only RESULT-SET-SHAPE questions -- missing, extra, duplicate,
 * malformed, DEN_A empty. It has no way to ask whether a provider ANSWERED. Every field of the
 * frozen result-record contract encodes "not evaluated" IN-BAND, using values a genuinely
 * evaluated row could also produce, so on an incomplete run the hard-zero gates drift toward a
 * FABRICATED PASS, the recall and conformance gates toward a FABRICATED FAILURE, and G9 toward
 * both at once.
 *
 * WHAT IT CHANGES: NOTHING SUBSTANTIVE. No threshold, no denominator, no gate predicate, no truth
 * label, no G1..G10 arithmetic. For a run with COMPLETE provider evaluation, v2 returns the frozen
 * scorer's verdict UNCHANGED -- `gates`, `byProvenance`, `failedGates`, `terminal` and `pass` are
 * the frozen object's own values, passed through.
 *
 * MONOTONICITY, BY CONSTRUCTION:
 *     pass_v2 = pass_frozen AND completeProviderEvaluation
 * Since `completeProviderEvaluation` is true for every complete run, pass_v2 === pass_frozen there.
 * Where it is false, pass_v2 is false. THEREFORE v2 CAN ONLY EVER MOVE A RUN FROM A SUBSTANTIVE
 * VERDICT TO NOT_SCORABLE. IT CAN NEVER TURN A FAILURE INTO A PASS, WEAKEN A THRESHOLD, REMOVE A
 * HARD-ZERO REQUIREMENT, OR IMPROVE A COMPLETE RESULT.
 *
 * PROVIDER_EVALUATED IS MECHANICAL AND CONTENT-BLIND. It is declared per row by the runner from
 * the FROZEN transport taxonomy, never inferred by this file from answer quality:
 *
 *   TRUE   the provider returned HTTP 200 through the frozen shim AND the response reached the
 *          frozen response/schema boundary -- i.e. the shipped provider returned {ok:true}, or
 *          {ok:false} with kind MALFORMED_STRUCTURED_OUTPUT or PROVIDER_REFUSAL. In all three the
 *          MODEL PRODUCED OUTPUT; a malformed or refusing answer is model behaviour and must stay
 *          measurable, or G10 would lose its teeth.
 *   FALSE  TIMEOUT | UNAVAILABLE | TRANSIENT_ERROR | PERMANENT_CONFIGURATION_ERROR -- the request
 *          was rejected or lost BEFORE any model output existed.
 *
 * IT IS NEVER INFERRED from "a request was transmitted", "a row was attempted", "an error
 * placeholder exists" or "a scorer-input record exists". FAIL-CLOSED: a record that does not
 * DECLARE providerEvaluated is treated as NOT evaluated and additionally raises
 * PROVIDER_EVALUATION_NOT_DECLARED, so silence can never buy a pass.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const FROZEN_SCORER_SHA = 'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6';
const FROZEN_SCORER_PATH = path.join(
  __dirname, '..', '..', 'hazlenz-l3-acceptance-holdout-attempt2-2026-08-24', 'scorer', 'acceptance-scorer.js');

const actual = crypto.createHash('sha256').update(fs.readFileSync(FROZEN_SCORER_PATH)).digest('hex');
if (actual !== FROZEN_SCORER_SHA) {
  throw new Error(`FROZEN SCORER DRIFT: expected ${FROZEN_SCORER_SHA}, found ${actual}. REFUSING TO SCORE.`);
}
const frozen = require(FROZEN_SCORER_PATH);

const SCORER_V2_ID = 'hazlenz.l3.acceptance-scorer.v2.complete-provider-evaluation';

/** The frozen transport taxonomy. Kinds in which the MODEL PRODUCED OUTPUT. */
const EVALUATED_FAILURE_KINDS = ['MALFORMED_STRUCTURED_OUTPUT', 'PROVIDER_REFUSAL'];
/** Kinds in which NO model output ever existed. */
const NOT_EVALUATED_FAILURE_KINDS = ['TIMEOUT', 'UNAVAILABLE', 'TRANSIENT_ERROR', 'PERMANENT_CONFIGURATION_ERROR'];

/**
 * @param holdout          the frozen holdout document.
 * @param results          the frozen nine-field records, PLUS `providerEvaluated: boolean`.
 * @param resultsProcessB  optional second isolated process (G9).
 */
function scoreAcceptanceV2(holdout, results, resultsProcessB) {
  const base = frozen.scoreAcceptance(holdout, results, resultsProcessB);

  const expectedIds = holdout.rows.map((r) => r.rowId);
  const expectedSet = new Set(expectedIds);

  const undeclared = [];
  const evaluatedIds = new Set();
  for (const r of results || []) {
    if (!r || typeof r.rowId !== 'string') continue;
    if (typeof r.providerEvaluated !== 'boolean') { undeclared.push(r.rowId); continue; }
    if (r.providerEvaluated === true && expectedSet.has(r.rowId)) evaluatedIds.add(r.rowId);
  }
  const notEvaluated = expectedIds.filter((id) => !evaluatedIds.has(id));

  const EXPECTED_ROWS = expectedIds.length;
  const PROVIDER_EVALUATED_ROWS = evaluatedIds.size;
  const rowIdSetsEqual = notEvaluated.length === 0 && PROVIDER_EVALUATED_ROWS === EXPECTED_ROWS;

  // G9's second process is a REQUIRED part of the acceptance contract, so its completeness is
  // part of the validity gate. Absent entirely, the frozen scorer already fails G9; here the
  // question is only whether a supplied process B was itself completely evaluated.
  let processBEvaluatedRows = null, processBNotEvaluated = [];
  if (resultsProcessB) {
    const bEval = new Set();
    for (const r of resultsProcessB) {
      if (!r || typeof r.rowId !== 'string') continue;
      if (r.providerEvaluated === true && expectedSet.has(r.rowId)) bEval.add(r.rowId);
    }
    processBEvaluatedRows = bEval.size;
    processBNotEvaluated = expectedIds.filter((id) => !bEval.has(id));
  }

  const invalidReasons = base.invalidReasons.slice();
  if (undeclared.length) invalidReasons.push('PROVIDER_EVALUATION_NOT_DECLARED');
  if (!rowIdSetsEqual) invalidReasons.push('INCOMPLETE_PROVIDER_EVALUATION');
  if (resultsProcessB && processBNotEvaluated.length) invalidReasons.push('INCOMPLETE_PROVIDER_EVALUATION_PROCESS_B');

  const completeProviderEvaluation =
    rowIdSetsEqual && undeclared.length === 0 &&
    (!resultsProcessB || processBNotEvaluated.length === 0);

  const scorable = base.scorable && completeProviderEvaluation;

  // The frozen gate arithmetic is ALWAYS carried, but on an invalid run it is explicitly
  // NON-AUTHORITATIVE for model acceptance -- diagnostic only.
  const terminal = scorable
    ? base.terminal
    : (completeProviderEvaluation
        ? 'L3_ACCEPTANCE_NOT_SCORABLE — RESULT_SET_INVALID'
        : 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION');

  return {
    scorerV2Id: SCORER_V2_ID,
    frozenScorerId: base.scorerId,
    frozenScorerSha256: actual,
    holdoutId: base.holdoutId,

    providerEvaluation: {
      EXPECTED_ROWS,
      PROVIDER_EVALUATED_ROWS,
      rowIdSetsEqual,
      notEvaluatedRowIds: notEvaluated,
      undeclaredRowIds: undeclared,
      processBEvaluatedRows,
      processBNotEvaluatedRowIds: processBNotEvaluated,
      completeProviderEvaluation,
      definition: 'PROVIDER_EVALUATED = the provider returned HTTP 200 through the frozen shim and '
        + 'the response reached the frozen response/schema boundary ({ok:true}, or {ok:false} with '
        + 'MALFORMED_STRUCTURED_OUTPUT or PROVIDER_REFUSAL). Transport, billing, authentication, '
        + 'workspace, model-access and other pre-output rejections are NOT provider-evaluated. '
        + 'Never inferred from transmission, attempt, error placeholder or record existence.',
      evaluatedFailureKinds: EVALUATED_FAILURE_KINDS.slice(),
      notEvaluatedFailureKinds: NOT_EVALUATED_FAILURE_KINDS.slice(),
    },

    scorable,
    invalidReasons,
    resultSet: base.resultSet,

    // Frozen arithmetic, byte-for-byte from the frozen scorer. Unchanged in every case.
    gates: base.gates,
    byProvenance: base.byProvenance,
    failedGates: base.failedGates,
    gateArithmeticAuthoritative: scorable,
    gateArithmeticNote: scorable
      ? 'AUTHORITATIVE -- complete provider evaluation, frozen gate verdicts stand as returned.'
      : 'NON-AUTHORITATIVE FOR MODEL ACCEPTANCE -- diagnostic arithmetic only. Rows the provider '
        + 'never evaluated contaminate hard-zero gates toward a vacuous PASS and recall/conformance '
        + 'gates toward a fabricated FAILURE. No value here is a model result.',

    terminal,
    pass: base.pass && completeProviderEvaluation,

    modelAcceptanceResult: scorable
      ? (base.pass ? 'ESTABLISHED_PASS' : 'ESTABLISHED_FAIL')
      : 'NOT_ESTABLISHED',
  };
}

module.exports = { scoreAcceptanceV2, SCORER_V2_ID, FROZEN_SCORER_SHA,
                   EVALUATED_FAILURE_KINDS, NOT_EVALUATED_FAILURE_KINDS };
