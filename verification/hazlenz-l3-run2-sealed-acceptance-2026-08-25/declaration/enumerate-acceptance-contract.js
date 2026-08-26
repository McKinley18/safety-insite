#!/usr/bin/env node
/*
 * PHASE 0 -- THE COMPLETE ACCEPTANCE CONTRACT, ENUMERATED AND HASHED BEFORE SEMANTIC EXPOSURE.
 *
 * Every rule that could decide this run is written down and hashed HERE, before a single Run-2
 * observation value is opened. NO RULE MAY CHANGE AFTER SEMANTIC EXPOSURE, and this digest is what
 * makes that checkable rather than asserted.
 *
 * It reads the holdout's TRUTH METADATA ONLY -- gate-membership booleans and counts. It reads NO
 * `observation` value and prints none. The denominators it derives are the ones the Run-2 freeze
 * already published in sections 4 and 7; deriving rather than copying them is the point.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const H = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json');
const holdout = JSON.parse(fs.readFileSync(H, 'utf8'));
const rows = holdout.rows;
const n = (f) => rows.filter(f).length;

const contract = {
  contractId: 'hazlenz.l3.run2.acceptance-contract.v1',
  enumeratedBeforeSemanticExposure: true,
  holdoutSha256: sha(H),
  expectedRows: rows.length,
  expectedRowIds: rows.map((r) => r.rowId),
  provenanceComposition: {
    INDEPENDENT_GAUNTLET: n((r) => r.provenanceClass === 'INDEPENDENT_GAUNTLET'),
    INDEPENDENT_REALISM: n((r) => r.provenanceClass === 'INDEPENDENT_REALISM'),
    AUTHORED_CONTROL: n((r) => r.provenanceClass === 'AUTHORED_CONTROL'),
  },
  gates: {
    G1:  { name: 'high-consequence misses (VALIDATED tier)', threshold: 'ZERO', hard: true, denominator: n((r) => r.expect.highConsequence === true) },
    G2:  { name: 'clarification precision', threshold: '100%', hard: true, denominator: 'result-dependent (rows that raised)' },
    G3:  { name: 'clarification recall on BOTH denominators, never merged (D-58)', threshold: '100% on BOTH', hard: true,
           denominatorA: n((r) => r.expect.clarificationExpected === true),
           authoredWithinDenominatorA: n((r) => r.expect.clarificationExpected === true && r.provenanceClass === 'AUTHORED_CONTROL'),
           denominatorB: 'DEN_A rows that produced a candidate (result-dependent)' },
    G4:  { name: 'false ACTIVE', threshold: 'ZERO', hard: true, denominator: n((r) => r.expect.inG4Denominator === true) },
    G5:  { name: 'safety-consequential validator rejections', threshold: 'ZERO', hard: true, denominator: rows.length },
    G6:  { name: 'every NON_RETRYABLE_VALIDATION_REASONS code', threshold: 'ZERO (every code)', hard: true, denominator: rows.length },
    G7:  { name: 'CLARIFICATION_MUST_NOT_ASK violations', threshold: 'ZERO', hard: true, denominator: n((r) => r.expect.inG7Pole === true) },
    G8:  { name: 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL and INVALID_CLARIFICATION_DEPENDENCY', threshold: 'ZERO', hard: true, denominator: rows.length },
    G9:  { name: 'material safety-outcome reproducibility across 2 isolated processes', threshold: '100%', hard: true, denominator: rows.length },
    G10: { name: 'schema conformance after <=1 retry', threshold: '>=99%', hard: false, denominator: rows.length },
  },
  hardZeroGates: ['G1', 'G4', 'G5', 'G6', 'G7', 'G8'],
  thresholdGates: { G2: '100%', G3: '100% on BOTH', G9: '100%', G10: '>=99%' },
  completeProviderEvaluationPredicate: {
    rule: 'EXPECTED_ROWS = PROVIDER_EVALUATED_ROWS AND PROVIDER_EVALUATED_ROW_IDS = EXPECTED_ROW_IDS (SET EQUALITY, not cardinality alone), for EVERY required process including G9 second process.',
    providerEvaluatedTrue: ['{ok:true} proposal', 'MALFORMED_STRUCTURED_OUTPUT', 'PROVIDER_REFUSAL'],
    providerEvaluatedFalse: ['TIMEOUT', 'UNAVAILABLE', 'TRANSIENT_ERROR', 'PERMANENT_CONFIGURATION_ERROR'],
    neverInferredFrom: ['transmission', 'attempt', 'error placeholder existing', 'result record existing'],
    failClosed: 'A record that does not DECLARE providerEvaluated is treated as NOT evaluated and raises PROVIDER_EVALUATION_NOT_DECLARED.',
    requiredProviderEvaluations: rows.length * 2,
  },
  scorablePredicate: 'scorable = frozenScorer.scorable AND completeProviderEvaluation',
  monotonicity: 'pass_v2 = pass_frozen AND completeProviderEvaluation. v2 can ONLY move a run from a substantive verdict to NOT_SCORABLE.',
  invalidRunRules: {
    frozenVocabulary: ['MALFORMED_RESULT_RECORD', 'MISSING_RESULTS', 'EXTRA_RESULTS', 'DUPLICATE_RESULTS', 'DEN_A_EMPTY'],
    amendment3Additions: ['PROVIDER_EVALUATION_NOT_DECLARED', 'INCOMPLETE_PROVIDER_EVALUATION', 'INCOMPLETE_PROVIDER_EVALUATION_PROCESS_B'],
    onInvalid: 'The frozen arithmetic is still emitted but is explicitly NON-AUTHORITATIVE for model acceptance. Never a substantive PASS and never a substantive FAIL.',
  },
  dkAbortPredicate: {
    rule: 'After spend, the run ABORTS at the first required row that ends PROVIDER_EVALUATED = FALSE once the frozen retry policy for that row is exhausted.',
    noStreak: true, noThreshold: true, noTuningConstant: true, noSemanticInspection: true,
    onFire: { HOLDOUT_SPENT: 'stays TRUE', offsets: 'stay RETIRED', SCORABLE: false,
              terminal: 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION',
              MODEL_ACCEPTANCE_RESULT: 'NOT_ESTABLISHED', automaticRerun: 'NONE', corpusRestored: false },
    scope: 'GLOBAL across the required process pair.',
  },
  terminalClassificationRules: {
    scorableAndPass: 'L3_ACCEPTANCE_PASSED — ALL_TEN_GATES_MET',
    scorableAndFail: 'L3_ACCEPTANCE_FAILED — <failed gates>',
    notScorableIncomplete: 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION',
    notScorableResultSet: 'L3_ACCEPTANCE_NOT_SCORABLE — RESULT_SET_INVALID',
    spendIsOrthogonal: 'D-H: RUN2_HOLDOUT_SPENT = TRUE from TRANSMISSION alone. INVALID NEVER IMPLIES UNSPENT.',
    noNewTerminalMayBeCreated: true,
  },
  frozenIdentities: {
    originalScorer: sha(path.join(ROOT, 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js')),
    v2Wrapper: sha(path.join(ROOT, 'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js')),
    prompt: sha(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts')),
    contractTypes: sha(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/reasoning-contract.types.ts')),
    validator: sha(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts')),
    binder: sha(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts')),
    inputBuilder: sha(path.join(ROOT, 'backend/src/safescope-v2/reasoning-l3/reasoning-input-builder.ts')),
    cohortHarness: sha(path.join(ROOT, 'backend/scripts/ablate-l32g-state-separation.ts')),
    shim: sha(path.join(ROOT, 'verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js')),
    dkGuard: sha(path.join(ROOT, 'verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/guard/dk-abort-guard.ts')),
    executionLoop: sha(path.join(ROOT, 'verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/guard/acceptance-execution-loop.ts')),
    runner: sha(path.join(ROOT, 'verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/runner/run-run2-acceptance.ts')),
    runShell: sha(path.join(ROOT, 'verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/runner/run-run2-sealed.sh')),
  },
  boundIdentities: {
    RUN2_ACCEPTANCE_ARTIFACT_IDENTITY: '9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc',
    RUN2_EXECUTION_GUARD_IDENTITY: 'eee8e587cd19183024d9a00b0ace5efbdcc73d587dddf801c51aaa0beab303c1',
  },
  observationValuesReadByThisEnumeration: 0,
};

const canonical = JSON.stringify(contract, Object.keys(contract).sort ? undefined : undefined, 2);
const digest = crypto.createHash('sha256').update(canonical).digest('hex');
fs.writeFileSync(path.join(__dirname, 'ACCEPTANCE_CONTRACT.json'), canonical + '\n');
console.log(canonical);
console.log('\nACCEPTANCE_CONTRACT_SHA256 = ' + digest);
