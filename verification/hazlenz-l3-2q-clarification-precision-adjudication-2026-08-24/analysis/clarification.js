/**
 * L3-2q -- clarification precision adjudication.
 *
 * ZERO INFERENCE. Every number is recomputed from FROZEN run artifacts and from the LOCKED cohort
 * definition in backend/scripts/ablate-l32g-state-separation.ts. No provider is called; no prompt,
 * schema, validator, binder, scorer or harness is modified; B08 is not altered.
 *
 * Run:  node clarification.js <repo-root>
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || '/Users/mckinley/Desktop/Safety_InSite';
const V = path.join(ROOT, 'verification');
const rows = f => JSON.parse(fs.readFileSync(path.join(V, f), 'utf8')).rows || [];

/** The locked cohort, parsed from the harness that owns it -- poles are a FROZEN property. */
function cohort() {
  const src = fs.readFileSync(path.join(ROOT, 'backend/scripts/ablate-l32g-state-separation.ts'), 'utf8');
  const block = src.slice(src.indexOf('const S: Scen[] = ['), src.indexOf('\nconst FAM = ['));
  const re = /\{\s*id:\s*'([^']+)',\s*pole:\s*'([^']+)',[^}]*?expectClarification:\s*(true|false),/g;
  const out = {}; let m;
  while ((m = re.exec(block))) out[m[1]] = { pole: m[2], expectClarification: m[3] === 'true' };
  return out;
}

const RUNS = {
  'claude-sonnet-5 A':     'hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_A.json',
  'claude-sonnet-5 B':     'hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/results/S5-SHIPPED_B.json',
  'gemini-3.7-flash A *':  'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F37-SHIPPED_A.json',
  'gemini-3.6-flash A *':  'hazlenz-l3-2n-provider-qualification-2026-08-24/results/F36-SHIPPED_A.json',
  'gemini-3.1-pro-prev *': 'hazlenz-l3-2j-cross-provider-closure-2026-08-24/results/shipped-gemini-V_PRE_ACTIVATION.json',
  'qwen3-coder:30b *':     'hazlenz-l3-2j-carrier-activation-2026-08-24/results/shipped-qwen-V_PRE_ACTIVATION.json',
};

const C = cohort();
const out = { phase: 'L3-2q', role: 'CLARIFICATION PRECISION ADJUDICATION -- zero inference, frozen artifacts only', cohort: {}, providers: {}, b08: {} };

/* The cohort's own pole census. CLARIFICATION_MUST_NOT_ASK is a NAMED pole with its own members;
 * `expectClarification: false` is a much larger set and means something weaker. */
for (const [id, s] of Object.entries(C)) {
  (out.cohort[s.pole] = out.cohort[s.pole] || []).push(id + (s.expectClarification ? ' [Q required]' : ''));
}

for (const [name, f] of Object.entries(RUNS)) {
  const R = rows(f);
  const mna = R.filter(r => C[r.scenarioId] && C[r.scenarioId].pole === 'CLARIFICATION_MUST_NOT_ASK');
  const required = R.filter(r => r.expectClarification === true);
  const raised = R.filter(r => r.clarificationCarriedAnywhere);
  const unnecessary = raised.filter(r => r.expectClarification === false);
  out.providers[name] = {
    // The HARD boundary: the two scenarios whose whole purpose is to forbid a question.
    mustNotAskPole: {
      scenarios: mna.map(r => r.scenarioId),
      askedOnAny: mna.some(r => r.clarificationCarriedAnywhere),
      score: mna.filter(r => !r.clarificationCarriedAnywhere).length + '/' + mna.length,
    },
    recallCandidate: required.filter(r => r.candidateBorneClarification).length + '/' + required.length,
    recallScenario: required.filter(r => r.clarificationCarriedAnywhere).length + '/' + required.length,
    precision: required.filter(r => r.clarificationCarriedAnywhere).length + '/' + raised.length,
    unnecessaryQuestions: unnecessary.map(r => ({ id: r.scenarioId, pole: C[r.scenarioId] && C[r.scenarioId].pole })),
  };
  // B08: the whole of it, from the frozen row.
  const b = R.find(r => r.scenarioId === 'B08');
  if (b) out.b08[name] = {
    pole: C['B08'].pole, expectActive: b.expectActive, expectClarification: b.expectClarification,
    candidateCount: b.candidateCount, modelStates: b.modelStates,
    validationState: b.validationState, validationIssues: b.validationIssues,
    validatedAssertsActive: b.validatedAssertsActive, validatedHazardCount: b.validatedHazardCount,
    raisedQuestion: b.clarificationCarriedAnywhere,
    carriedBy: b.candidateBorneClarification ? 'CANDIDATE' : (b.proposalLevelClarification ? 'PROPOSAL' : 'none'),
    // The decision-boundary test L3-INV-06 actually states: was there an UNDECIDED candidate for the
    // question to attach to? section 34.2 fixes the other six states as "the decision".
    undecidedCandidatePresent: (b.modelStates || []).some(s => s === 'INSUFFICIENT_EVIDENCE' || s === 'UNKNOWN'),
  };
}
console.log(JSON.stringify(out, null, 2));
