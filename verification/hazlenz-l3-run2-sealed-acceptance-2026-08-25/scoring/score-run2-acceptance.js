/**
 * L3 RUN-2 FINAL SINGLE-USE SEALED ACCEPTANCE -- SCORING DRIVER.
 *
 * It REQUIRES the frozen v2 validity wrapper and calls it. The wrapper in turn REQUIRES and CALLS
 * the original frozen scorer `ea5e50ae…` and THROWS if that digest has drifted. Nothing here
 * reimplements, wraps, adjusts, pre-processes or post-processes any gate.
 *
 * Its only work is:
 *   1. assert the v2 wrapper digest is b9a0a6bc…, the original scorer digest is ea5e50ae… and the
 *      holdout digest is f887cfd1…  -- each THROWS on drift;
 *   2. project each raw result row onto EXACTLY the frozen nine-field result-record contract PLUS
 *      the Amendment-3 `providerEvaluated` declaration -- taken VERBATIM from the raw result, with
 *      no recomputation and no repair;
 *   3. call scoreAcceptanceV2(holdout, resultsA, resultsB);
 *   4. print and persist what it returns, unaltered.
 *
 * NO RESULT IS PRE-PROCESSED TO IMPROVE SCORING. A row that failed stays failed. A row the provider
 * never evaluated is passed through declaring exactly that, and is NEVER repaired into an evaluated
 * one. Rows for which no record exists at all (never issued, because D-K aborted) are simply absent,
 * which is what the frozen validity gate is built to read -- `D-G.3` forbids inferring
 * PROVIDER_EVALUATED from record existence in either direction.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', '..');
const RUN2 = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25');
const V2 = path.join(RUN2, 'scorer', 'acceptance-scorer-v2.frozen-copy.js');
const ORIGINAL = path.join(ROOT, 'verification', 'hazlenz-l3-acceptance-holdout-attempt2-2026-08-24', 'scorer', 'acceptance-scorer.js');
const HOLDOUT = path.join(RUN2, 'holdout', 'holdout-l3-acceptance-run2.json');

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const V2_SHA = 'b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100';
const ORIGINAL_SHA = 'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6';
const HOLDOUT_SHA = 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f';

const gotV2 = sha(V2), gotOriginal = sha(ORIGINAL), gotHoldout = sha(HOLDOUT);
if (gotV2 !== V2_SHA) throw new Error(`v2 wrapper digest mismatch: ${gotV2}`);
if (gotOriginal !== ORIGINAL_SHA) throw new Error(`original scorer digest mismatch: ${gotOriginal}`);
if (gotHoldout !== HOLDOUT_SHA) throw new Error(`holdout digest mismatch: ${gotHoldout}`);

// Loading the wrapper independently re-asserts the original scorer's digest and throws on drift.
const { scoreAcceptanceV2 } = require(V2);
const holdout = JSON.parse(fs.readFileSync(HOLDOUT, 'utf8'));

/** The frozen nine fields PLUS the D-G.3 declaration. Verbatim. Nothing else is passed. */
const project = (r) => ({
  rowId: r.rowId,
  schemaValid: r.schemaValid,
  retries: r.retries,
  candidates: r.candidates,
  raisedClarification: r.raisedClarification,
  assertedState: r.assertedState,
  nonRetryableValidationReasons: r.nonRetryableValidationReasons,
  safetyConsequentialRejection: r.safetyConsequentialRejection,
  decisionBoundaryCodes: r.decisionBoundaryCodes,
  providerEvaluated: r.providerEvaluated,
});

const rawA = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const rawB = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const resultsA = rawA.rows.map(project);
const resultsB = rawB.rows.map(project);

const score = scoreAcceptanceV2(holdout, resultsA, resultsB);

const envelope = {
  phase: 'L3 RUN-2 FINAL SINGLE-USE SEALED ACCEPTANCE',
  scoredAt: new Date().toISOString(),
  run2AcceptanceArtifactIdentity: '9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc',
  run2ExecutionGuardIdentity: 'eee8e587cd19183024d9a00b0ace5efbdcc73d587dddf801c51aaa0beab303c1',
  preExecutionGateDeclarationSha256: 'eec48a5d032db4f3d5adfa86b191c83d3f33c21ddfcd94bac000010db60c3f58',
  acceptanceContractSha256: '9d94efb642c35957ea1b342ca50c1d8b4da9890b99762a5c3dc23897e5f6febe',
  v2WrapperSha256: gotV2,
  originalScorerSha256: gotOriginal,
  holdoutSha256: gotHoldout,
  rawProcessA: { path: process.argv[2], sha256: sha(process.argv[2]), rows: rawA.rows.length, requestsScheduled: rawA.requestsScheduled, providerCalls: rawA.providerCalls, dkFired: rawA.dkFired },
  rawProcessB: { path: process.argv[3], sha256: sha(process.argv[3]), rows: rawB.rows.length, requestsScheduled: rawB.requestsScheduled, providerCalls: rawB.providerCalls, dkFired: rawB.dkFired },
  // RUN2_HOLDOUT_SPENT is NEVER derived from the score. D-H: it follows from transmission alone.
  RUN2_HOLDOUT_SPENT: true,
  GAUNTLET_OFFSET_1: 'RETIRED',
  REALISM_OFFSET_0: 'RETIRED',
  score,
};

const OUT = path.join(__dirname, 'ACCEPTANCE_SCORE.json');
fs.writeFileSync(OUT, JSON.stringify(envelope, null, 2));
console.log(JSON.stringify(envelope, null, 2));
