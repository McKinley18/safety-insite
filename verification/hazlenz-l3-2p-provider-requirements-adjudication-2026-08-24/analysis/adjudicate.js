/**
 * L3-2p -- provider-requirements adjudication.
 *
 * ZERO INFERENCE. Every number below is recomputed from FROZEN run artifacts already in the
 * repository. No provider is called, no prompt/schema/validator/binder/scorer/harness is read for
 * anything but its identity, and nothing is written back into any prior evidence package.
 *
 * Run:  node adjudicate.js <repo-root>
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || '/Users/mckinley/Desktop/Safety_InSite';
const V = path.join(ROOT, 'verification');
const load = f => JSON.parse(fs.readFileSync(path.join(V, f), 'utf8')).rows || [];

/** The six frozen shipped-cohort runs. `*` marks a baseline this phase re-read but did not re-run. */
const RUNS = {
  'claude-sonnet-5 A':      'hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_A.json',
  'claude-sonnet-5 B':      'hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_B.json',
  'gemini-3.7-flash A *':   'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F37-SHIPPED_A.json',
  'gemini-3.6-flash A *':   'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F36-SHIPPED_A.json',
  'gemini-3.1-pro-prev *':  'hazlenz-l3-2j-cross-provider-closure-2026-08-24/results/shipped-gemini-V_PRE_ACTIVATION.json',
  'qwen3-coder:30b *':      'hazlenz-l3-2j-carrier-activation-2026-08-24/results/shipped-qwen-V_PRE_ACTIVATION.json',
};
/** Repeat pairs, each half run in its own process (section 38.3). */
const PAIRS = {
  'claude-sonnet-5':     ['hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_A.json',
                          'hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_B.json'],
  'gemini-3.7-flash':    ['hazlenz-l3-2n-provider-qualification-2026-08-24/results/F37-SHIPPED_A.json',
                          'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F37-SHIPPED_B.json'],
  'gemini-3.6-flash':    ['hazlenz-l3-2n-provider-qualification-2026-08-24/results/F36-SHIPPED_A.json',
                          'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F36-SHIPPED_B.json'],
  'gemini-3.1-pro-prev': ['hazlenz-l3-2j-cross-provider-closure-2026-08-24/results/shipped-gemini-V_PRE_ACTIVATION.json',
                          'hazlenz-l3-2j-cross-provider-closure-2026-08-24/results/shipped-gemini-V_PRE_ACTIVATION_REPEAT.json'],
};

/* ------------------------------------------------------------------ A. severity taxonomy */
/**
 * A rejection is SAFETY_CONSEQUENTIAL exactly when the row's ground truth owed a hazard
 * (`expectActive === true`), because the runner discards the whole proposal on any deciding issue,
 * so the owed hazard is not delivered. It is SAFETY_PRESERVING when the row owed no hazard: the
 * deterministic layer refused unsupported output and the customer-facing safety decision -- no
 * hazard here -- is unchanged. This is the split the aggregate >=99% metric cannot express.
 */
function severity(rows) {
  const rej = rows.filter(r => r.validationState && r.validationState !== 'VALID');
  const consequential = rej.filter(r => r.expectActive === true);
  const preserving = rej.filter(r => r.expectActive !== true);
  const codes = {};
  for (const r of rej) for (const i of (r.validationIssues || [])) {
    const c = i.code || i; codes[c] = (codes[c] || 0) + 1;
  }
  return {
    rows: rows.length, rejections: rej.length,
    aggregateValidityPct: +(((rows.length - rej.length) / rows.length) * 100).toFixed(1),
    safetyConsequential: consequential.map(r => ({ id: r.scenarioId, pole: r.pole })),
    safetyPreserving: preserving.map(r => ({ id: r.scenarioId, pole: r.pole })),
    codes,
  };
}

/* ------------------------------------------------------------------ B. safety axes */
function axes(rows) {
  const pos = rows.filter(r => r.expectActive === true);
  const neg = rows.filter(r => r.expectActive !== true);
  const clarExpected = rows.filter(r => r.expectClarification === true);
  const raised = rows.filter(r => r.clarificationCarriedAnywhere);
  return {
    hcValidated: pos.filter(r => r.validatedAssertsActive).length + '/' + pos.length,
    hcModel: pos.filter(r => r.modelAssertsActive).length + '/' + pos.length,
    falseActive: neg.filter(r => r.validatedAssertsActive).length + '/' + neg.length,
    clarRecallCandidate: clarExpected.filter(r => r.candidateBorneClarification).length + '/' + clarExpected.length,
    clarRecallScenario: clarExpected.filter(r => r.clarificationCarriedAnywhere).length + '/' + clarExpected.length,
    clarPrecision: clarExpected.filter(r => r.clarificationCarriedAnywhere).length + '/' + raised.length,
    unnecessary: rows.filter(r => r.expectClarification === false && r.clarificationCarriedAnywhere).map(r => r.scenarioId),
  };
}

/* ------------------------------------------------------------------ C. reproducibility keys */
/** L3-2o's preserved key. Includes hazard-decomposition granularity. */
const KEY_L32O = ['outcome', 'candidateCount', 'modelStates', 'modelAssertsActive',
  'validationState', 'validatedAssertsActive', 'candidateBorneClarification', 'validatedProposalLevelClarification'];
/** The key that reproduces L3-2n's RECORDED 2/24 and 3/24 -- i.e. L3-2o's minus the two granularity fields. */
const KEY_L32N = ['outcome', 'modelAssertsActive', 'validationState', 'validatedAssertsActive',
  'candidateBorneClarification', 'validatedProposalLevelClarification'];
/** Material safety outcome only: what HazLenz tells the customer after deterministic validation. */
const KEY_SAFETY = ['modelAssertsActive', 'validatedAssertsActive', 'candidateBorneClarification', 'clarificationCarriedAnywhere'];

function differing(A, B, keys) {
  const k = r => keys.map(f => JSON.stringify(r[f])).join('|');
  return A.filter((r, i) => k(r) !== k(B[i])).map(r => r.scenarioId);
}

/* ------------------------------------------------------------------ emit */
const out = { phase: 'L3-2p', role: 'REQUIREMENTS ADJUDICATION -- zero inference, frozen artifacts only', providers: {}, reproducibility: {} };
for (const [name, f] of Object.entries(RUNS)) {
  const rows = load(f);
  out.providers[name] = { source: f, ...severity(rows), ...axes(rows) };
}
for (const [name, [fa, fb]] of Object.entries(PAIRS)) {
  const A = load(fa), B = load(fb);
  out.reproducibility[name] = {
    rows: A.length,
    underL32oKey: differing(A, B, KEY_L32O),
    underL32nKey: differing(A, B, KEY_L32N),
    underSafetyKey: differing(A, B, KEY_SAFETY),
  };
}
out.keyDefinitions = { KEY_L32O, KEY_L32N, KEY_SAFETY };
console.log(JSON.stringify(out, null, 2));
