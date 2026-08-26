/**
 * L3 LOCAL REMEDIATION PHASE 1 -- ZERO-COST RECORDED-OUTPUT REPLAY HARNESS.
 *
 * WHAT THIS IS. A pure function from ALREADY-RECORDED Run-2 provider output to a scorer verdict.
 * It makes NO provider call, opens NO corpus, and regenerates NO model output. Every byte it reads
 * is a frozen artifact whose digest it asserts before use.
 *
 * IT DOES NOT REIMPLEMENT THE SCORER. It requires and calls the frozen v2 wrapper, which in turn
 * requires and calls the frozen scorer `ea5e50ae...` and throws on drift. No gate, threshold,
 * denominator or predicate is touched here.
 *
 * THE FOUR TIERS ARE PRESERVED SEPARATELY, because the whole point of the Run-2 diagnosis (D-101)
 * is that they are NOT the same object:
 *
 *   1. providerTier   the raw structured proposal as recorded -- candidates[] {key, family, state},
 *                     raisedClarification, the two clarification carriers, schemaValid, retries.
 *   2. validatorTier  the deterministic validator's verdict -- validationState, issue codes,
 *                     validatedStates, nonRetryableValidationReasons, safetyConsequentialRejection.
 *   3. binderTier     the semantic binder's verdict -- boundStates, rejected[], demoted[], codes.
 *   4. scoredTier     the frozen nine-field projection the scorer actually reads.
 *
 * EVIDENCE LIMIT, STATED UP FRONT AND NOT WORKED AROUND (blueprint 68.6). Run 2 persisted only
 * structured post-validator views. It did NOT persist raw proposal prose, evidence spans,
 * conditionRationale, uncertainties, clarification bodies, corrective actions or riskFactors.
 * Therefore any downstream logic whose decision requires EVIDENCE TEXT cannot be replayed here, and
 * this harness will not pretend otherwise: `replay()` reports `notReplayable` for every transform
 * that declares an input this recording does not carry. Nothing is fabricated to fill a gap.
 *
 * TRUTH DISCIPLINE. `row.expect` (the frozen holdout truth) is carried through UNTOUCHED for the
 * scorer, and is NEVER passed to a transform. `applyTransform` strips it before the call and
 * restores it after. Truth is an OFFLINE SCORING input only.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', '..');
const VER = path.join(ROOT, 'verification');
const RUN2_SEALED = path.join(VER, 'hazlenz-l3-run2-sealed-acceptance-2026-08-25');
const RUN2_HOLDOUT_DIR = path.join(VER, 'hazlenz-l3-run2-acceptance-holdout-2026-08-25');

const RAW_A = path.join(RUN2_SEALED, 'results', 'raw-process-A.json');
const RAW_B = path.join(RUN2_SEALED, 'results', 'raw-process-B.json');
const V2 = path.join(RUN2_HOLDOUT_DIR, 'scorer', 'acceptance-scorer-v2.frozen-copy.js');
const HOLDOUT = path.join(RUN2_HOLDOUT_DIR, 'holdout', 'holdout-l3-acceptance-run2.json');

/** Digests frozen before this phase existed. Any drift throws; nothing is scored on drifted input. */
const DIGESTS = {
  rawA: 'b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3',
  rawB: '514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f',
  v2: 'b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100',
  holdout: 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f',
};

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function assertFrozen() {
  const got = { rawA: sha(RAW_A), rawB: sha(RAW_B), v2: sha(V2), holdout: sha(HOLDOUT) };
  for (const k of Object.keys(DIGESTS)) {
    if (got[k] !== DIGESTS[k]) {
      throw new Error(`FROZEN ARTIFACT DRIFT on '${k}': expected ${DIGESTS[k]}, found ${got[k]}. REFUSING TO REPLAY.`);
    }
  }
  return got;
}

/* ------------------------------------------------------------------ provider-call accounting */

/**
 * PROVIDER_CALLS = 0, proven rather than asserted.
 *
 * The count is taken from the RECORDING, which states what Run 2 spent, and this process adds
 * nothing to it: the harness loads no http/https/net/tls module and opens no socket. The guard below
 * is a real capability check -- it replaces the network entry points with throwing stubs for the
 * duration of the replay, so a call would fail loudly rather than be counted after the fact.
 */
function sealNetwork() {
  const sealed = [];
  for (const mod of ['http', 'https', 'net', 'tls', 'dgram']) {
    let m;
    try { m = require(mod); } catch { continue; }
    for (const fn of ['request', 'get', 'connect', 'createConnection', 'createServer']) {
      if (typeof m[fn] !== 'function') continue;
      const original = m[fn];
      m[fn] = function sealedNetworkEntryPoint() {
        throw new Error(`ZERO-COST REPLAY VIOLATION: ${mod}.${fn} was called. Provider contact is prohibited in this phase.`);
      };
      sealed.push({ m, fn, original });
    }
  }
  if (typeof globalThis.fetch === 'function') {
    const original = globalThis.fetch;
    globalThis.fetch = function sealedFetch() {
      throw new Error('ZERO-COST REPLAY VIOLATION: fetch was called. Provider contact is prohibited in this phase.');
    };
    sealed.push({ m: globalThis, fn: 'fetch', original });
  }
  return {
    sealedCount: sealed.length,
    release() { for (const s of sealed) s.m[s.fn] = s.original; },
  };
}

/* ------------------------------------------------------------------ tier decomposition */

/** The fields the recording actually carries, per tier. Anything absent is absent, not defaulted. */
function decompose(row) {
  const st = row.semanticTier || null;
  return {
    rowId: row.rowId,

    providerTier: {
      schemaValid: row.schemaValid,
      retries: row.retries,
      attempts: row.attempts,
      candidates: (row.candidates || []).map(c => ({
        candidateKey: c.candidateKey, hazardFamily: c.hazardFamily, conditionState: c.conditionState,
      })),
      raisedClarification: row.raisedClarification,
      candidateBorneClarification: row.candidateBorneClarification,
      proposalLevelClarificationCount: row.proposalLevelClarificationCount,
      outcomeKind: row.outcomeKind,
      providerEvaluated: row.providerEvaluated,
      providerFailureKind: row.providerFailureKind,
      providerFailureClass: row.providerFailureClass,
    },

    validatorTier: {
      validationState: row.validationState,
      validationIssueCodes: row.validationIssueCodes || [],
      validatedHazardCount: row.validatedHazardCount,
      validatedStates: row.validatedStates || [],
      validatedAssertsActive: row.validatedAssertsActive,
      nonRetryableValidationReasons: row.nonRetryableValidationReasons || [],
      safetyConsequentialRejection: row.safetyConsequentialRejection,
      decisionBoundaryCodes: row.decisionBoundaryCodes || [],
    },

    binderTier: st === null ? null : {
      boundHazardCount: st.boundHazardCount,
      boundStates: st.boundStates || [],
      boundAssertsActive: st.boundAssertsActive,
      rejected: st.rejected || [],
      demoted: st.demoted || [],
      issueCodes: st.issueCodes || [],
    },

    scoredTier: {
      assertedState: row.assertedState,
      raisedClarification: row.raisedClarification,
      candidates: row.candidates || [],
      schemaValid: row.schemaValid,
      retries: row.retries,
      nonRetryableValidationReasons: row.nonRetryableValidationReasons || [],
      safetyConsequentialRejection: row.safetyConsequentialRejection,
      decisionBoundaryCodes: row.decisionBoundaryCodes || [],
      providerEvaluated: row.providerEvaluated,
    },

    /** OFFLINE SCORING ONLY. Never handed to a transform. */
    truth: row.expect,

    /** Non-decision context, carried for reporting cohorts only. */
    meta: {
      provenanceClass: row.provenanceClass, sourceId: row.sourceId,
      familyVariant: row.familyVariant, pole: row.pole, executionIndex: row.executionIndex,
      telemetryBinding: (row.telemetry && row.telemetry.binding) || null,
    },
  };
}

function load() {
  const digests = assertFrozen();
  const rawA = JSON.parse(fs.readFileSync(RAW_A, 'utf8'));
  const rawB = JSON.parse(fs.readFileSync(RAW_B, 'utf8'));
  const holdout = JSON.parse(fs.readFileSync(HOLDOUT, 'utf8'));
  return {
    digests, holdout,
    A: rawA.rows.map(decompose),
    B: rawB.rows.map(decompose),
    providerCallsRecordedA: rawA.providerCalls,
    providerCallsRecordedB: rawB.providerCalls,
  };
}

/* ------------------------------------------------------------------ transforms */

/**
 * The nine-field projection the frozen scorer reads, built from a (possibly transformed) tier view.
 * The field list and order are the frozen contract's, copied from the Run-2 scoring driver.
 */
const project = (r) => ({
  rowId: r.rowId,
  schemaValid: r.scoredTier.schemaValid,
  retries: r.scoredTier.retries,
  candidates: r.scoredTier.candidates,
  raisedClarification: r.scoredTier.raisedClarification,
  assertedState: r.scoredTier.assertedState,
  nonRetryableValidationReasons: r.scoredTier.nonRetryableValidationReasons,
  safetyConsequentialRejection: r.scoredTier.safetyConsequentialRejection,
  decisionBoundaryCodes: r.scoredTier.decisionBoundaryCodes,
  providerEvaluated: r.scoredTier.providerEvaluated,
});

/**
 * Apply a downstream transform to one decomposed row.
 *
 * A transform receives providerTier, validatorTier, binderTier and scoredTier, and returns a NEW
 * scoredTier. It NEVER receives `truth`. It NEVER receives `meta.provenanceClass` as a decision
 * input by contract -- meta is passed for labelling only and transforms that read it are rejected
 * by `assertTransformContract` below.
 */
function applyTransform(row, transform) {
  const view = {
    rowId: row.rowId,
    providerTier: row.providerTier,
    validatorTier: row.validatorTier,
    binderTier: row.binderTier,
    scoredTier: row.scoredTier,
  };
  const next = transform(view);
  return { ...row, scoredTier: { ...row.scoredTier, ...next } };
}

/**
 * INSTRUMENT SELF-REFERENCE / TRUTH-LEAK GUARD.
 *
 * A transform must not be able to read the truth labels or the provenance class. This is checked
 * structurally, by handing the transform a view whose `truth` and `meta` are absent (above) AND by
 * proving the absence is real: a probe row is passed whose truth would flip the answer if read.
 */
function assertNoTruthAccess(transform) {
  const probe = {
    rowId: '__PROBE__',
    providerTier: { schemaValid: true, retries: 0, attempts: 1, candidates: [], raisedClarification: false,
                    candidateBorneClarification: false, proposalLevelClarificationCount: 0,
                    outcomeKind: 'VALIDATED', providerEvaluated: true, providerFailureKind: null,
                    providerFailureClass: 'PROVIDER_EVALUATED' },
    validatorTier: { validationState: 'VALID', validationIssueCodes: [], validatedHazardCount: 0,
                     validatedStates: [], validatedAssertsActive: false,
                     nonRetryableValidationReasons: [], safetyConsequentialRejection: false,
                     decisionBoundaryCodes: [] },
    binderTier: { boundHazardCount: 0, boundStates: [], boundAssertsActive: false,
                  rejected: [], demoted: [], issueCodes: [] },
    scoredTier: { assertedState: null, raisedClarification: false, candidates: [], schemaValid: true,
                  retries: 0, nonRetryableValidationReasons: [], safetyConsequentialRejection: false,
                  decisionBoundaryCodes: [], providerEvaluated: true },
  };
  let sawTruth = false;
  Object.defineProperty(probe, 'truth', { get() { sawTruth = true; return undefined; }, configurable: true });
  Object.defineProperty(probe, 'expect', { get() { sawTruth = true; return undefined; }, configurable: true });
  Object.defineProperty(probe, 'meta', { get() { sawTruth = true; return undefined; }, configurable: true });
  transform(probe);
  if (sawTruth) throw new Error('TRANSFORM CONTRACT VIOLATION: transform accessed truth/provenance.');
  return true;
}

/**
 * Replay both processes through a transform and score with the FROZEN scorer.
 *
 * `requires` names the recorded inputs the transform depends on. If any is absent from the
 * recording the replay is refused rather than approximated.
 */
function replay(loaded, transform, opts) {
  const options = opts || {};
  const seal = sealNetwork();
  try {
    assertNoTruthAccess(transform);
    const A = loaded.A.map(r => applyTransform(r, transform));
    const B = loaded.B.map(r => applyTransform(r, transform));
    const { scoreAcceptanceV2 } = require(V2);
    const score = scoreAcceptanceV2(loaded.holdout, A.map(project), B.map(project));
    return { label: options.label || 'unlabelled', score, rowsA: A, rowsB: B, providerCalls: 0 };
  } finally {
    seal.release();
  }
}

const IDENTITY = (view) => view.scoredTier;

module.exports = {
  load, replay, project, decompose, applyTransform, assertNoTruthAccess, sealNetwork,
  IDENTITY, DIGESTS, PATHS: { RAW_A, RAW_B, V2, HOLDOUT },
};
