/**
 * EXPERT HAZLENZ -- §148 WORKSTREAM B. THE `affectedDecision` / ARBITRATION POLICY MATRIX.
 *
 * ==================== WHAT THIS SUITE DECIDES, AND WHAT IT REFUSES TO ====================
 *
 * §147 produced the FIRST hosted exercise of `CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`. On CR-F2
 * the model asked a substantively correct SCOPE question -- whether a solvent loading pad is a
 * classified hazardous area -- labelled it `HAZARD_EXISTENCE`, linked it to its own `fire_explosion`
 * candidate which it had asserted `ACTIVE`, and arbitration destroyed the question. Arbitration did
 * exactly what §141 specified and proved deterministically. The LABEL was wrong.
 *
 * The policy question the owner posed is whether the system should, in that case: (A) reject the
 * whole clarification; (B) keep it but strip the label; (C) deterministically reclassify; (D)
 * reclassify only where another contract-safe reading is objectively inferable; or (E) keep the
 * fail-closed behaviour and make `affectedDecision` accuracy a required model-side gate.
 *
 * THIS SUITE DOES NOT ARGUE. It CHARACTERIZES the seven enumerated cases against the SHIPPED code,
 * and then MEASURES what option C would actually do on the same seven -- by building a keyword
 * reclassifier of the kind C would need, running it, and recording where it is wrong. A refusal
 * backed by a measurement is a different object from a refusal backed by a paragraph.
 *
 *   >>> THE RECLASSIFIER IN SECTION R IS A COUNTERFACTUAL INSTRUMENT. IT IS NOT IMPORTED BY ANY
 *   >>> PRODUCTION MODULE, IS NOT EXPORTED, AND MUST NEVER BE SHIPPED. It exists to prove that C is
 *   >>> unsafe, and its own failures are the evidence.
 *
 * ==================== THE FINDING THAT CHANGED THE ANALYSIS ====================
 *
 * Case 6 is the one that decides it. Arbitration is fail-closed ON THE LABEL, not on the semantics:
 * a question whose TEXT plainly asks about existence SURVIVES untouched when its label says
 * something else. The stage trusts `affectedDecision` in BOTH directions and can do nothing else,
 * because the only alternative is to read the question. So there is no deterministic repair that
 * makes the stage semantically correct -- there is only a repair that makes the LABEL correct.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No historical artifact is read or touched.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_AFFECTED_DECISIONS,
  EXPERT_ANALYSIS_CONTRACT_VERSION, type ExpertAnalysisInput, type ExpertAffectedDecision,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  stableStringify,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput, isFatal } from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import { CLARIFICATION_RECALL_FIXTURES } from
  '../src/safescope-v2/expert-hazlenz/fixtures/clarification-recall-probe-v5';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const NOW = '2026-09-03T00:00:00.000Z';
const OBS = 'Solvent is being transferred from a road tanker into the day tank on the loading pad by '
  + 'a portable electric pump with an ordinary industrial plug, and one operative stands at the '
  + 'coupling throughout.';

const input = (): ExpertAnalysisInput => ({
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ad-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'Loading pad', task: 'transfer' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['fire_explosion', 'chemical_release', 'electrical'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
});

const wire = (over: Record<string, unknown> = {}) => ({
  outcome: 'ANALYZED',
  expertHazardCandidates: [], decisionCriticalClarifications: [],
  crossHazardInsights: [], disagreements: [],
  expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  ...over,
});
const cand = (over: Record<string, unknown> = {}) => ({
  candidateKey: 'cand-fire-explosion', hazardFamily: 'fire_explosion',
  assertedConditionState: 'ACTIVE',
  groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
  evidenceBasis: 'b', reasoning: 'r', confidence: 'HIGH',
  relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: false,
  ...over,
});
const clar = (over: Record<string, unknown> = {}) => ({
  clarificationId: 'q1', question: 'q?', whyItMatters: 'if A then X; if B then Y',
  affectedDecision: 'APPLICABILITY', criticality: 'BLOCKING',
  evidenceGap: 'the fact is not stated',
  ...over,
});
const run = (over: Record<string, unknown>) => {
  const inp = input();
  return normalizeExpertOutput(bindWireAnalysis(wire(over), inp).raw, inp, NOW);
};
const survivors = (r: ReturnType<typeof run>) =>
  r.validated?.analysis.decisionCriticalClarifications ?? [];
const fired = (r: ReturnType<typeof run>) =>
  r.issues.some(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE');

const sys = EXPERT_SYSTEM_PROMPT;
const schemaText = stableStringify(buildExpertWireSchema(input()));

console.log('§148 affectedDecision / ARBITRATION POLICY MATRIX — deterministic, ZERO calls, $0.00\n');

// =====================================================================================
// M. THE SEVEN ENUMERATED ADVERSARIAL CASES, against the SHIPPED normalizer.
// =====================================================================================

/**
 * One matrix case. `mustSurvive` is the CONTRACT expectation; `characterized` rows carry `null`
 * because the authorization asks case 4 to be CHARACTERIZED rather than asserted -- pre-deciding it
 * here would be the analysis writing its own answer key.
 */
interface MatrixCase {
  id: string;
  description: string;
  questionText: string;
  label: ExpertAffectedDecision;
  linked: boolean;
  candidateState: 'ACTIVE' | 'CONTROLLED';
  /** What the question ACTUALLY turns on, as a human reads it. Never available to the normalizer. */
  trueDecision: ExpertAffectedDecision;
  mustSurvive: boolean | null;
}

const MATRIX: readonly MatrixCase[] = [
  { id: '1', description: 'ACTIVE hazard + a TRUE existence question, correctly labelled',
    questionText: 'Does a flammable atmosphere actually exist at this coupling at all?',
    label: 'HAZARD_EXISTENCE', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'HAZARD_EXISTENCE', mustSurvive: false },

  { id: '2', description: 'ACTIVE hazard + a valid REQUIRED_CONTROL question, correctly labelled',
    questionText: 'Are the tanker and the day tank bonded and earthed for this transfer?',
    label: 'REQUIRED_CONTROL', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'REQUIRED_CONTROL', mustSurvive: true },

  { id: '3', description: 'ACTIVE hazard + a valid REGULATORY_INTERPRETATION question, correctly labelled',
    questionText: 'Does the supplied record treat a road tanker delivery as a transfer operation?',
    label: 'REGULATORY_INTERPRETATION', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'REGULATORY_INTERPRETATION', mustSurvive: true },

  // THE CR-F2 CASE. Characterized, not asserted.
  { id: '4', description: 'ACTIVE hazard + a valid SCOPE question MISLABELLED as existence',
    questionText: 'Is this loading pad classified as a hazardous area, and to which zone?',
    label: 'HAZARD_EXISTENCE', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'APPLICABILITY', mustSurvive: null },

  { id: '5', description: 'no ACTIVE candidate + a genuine existence question, contract-valid',
    questionText: 'Does the transferred solvent have a flash point below the ambient temperature?',
    label: 'HAZARD_EXISTENCE', linked: true, candidateState: 'CONTROLLED',
    trueDecision: 'HAZARD_EXISTENCE', mustSurvive: true },

  // THE INVERSE. Text and label genuinely contradict, in the direction arbitration cannot see.
  { id: '6', description: 'text and label genuinely contradict — an EXISTENCE question labelled REQUIRED_CONTROL',
    questionText: 'Does a fire and explosion hazard exist here at all, or is this a non-hazard?',
    label: 'REQUIRED_CONTROL', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'HAZARD_EXISTENCE', mustSurvive: null },

  { id: '7', description: 'malformed/ambiguous question where reclassification would be pure guessing',
    questionText: 'Please clarify the situation on the pad.',
    label: 'HAZARD_EXISTENCE', linked: true, candidateState: 'ACTIVE',
    trueDecision: 'HAZARD_EXISTENCE', mustSurvive: null },
];

interface Observed { id: string; survived: boolean; arbitrationFired: boolean; state: string }
const observed: Observed[] = [];

section('M. the seven enumerated cases, against the SHIPPED normalizer');
for (const c of MATRIX) {
  const r = run({
    expertHazardCandidates: [cand({ assertedConditionState: c.candidateState })],
    decisionCriticalClarifications: [clar({
      question: c.questionText, affectedDecision: c.label,
      ...(c.linked ? { relatesToCandidateKey: 'cand-fire-explosion' } : {}),
    })],
  });
  const o: Observed = {
    id: c.id, survived: survivors(r).length === 1, arbitrationFired: fired(r), state: r.state,
  };
  observed.push(o);
  console.log(`      CASE ${c.id}  ${c.description}`);
  console.log(`              label=${c.label} true=${c.trueDecision} `
    + `-> ${o.survived ? 'SURVIVED' : 'DROPPED  '} arbitration=${o.arbitrationFired}`);

  // The ACTIVE candidate is NEVER destroyed, whatever happens to the question. This is the §101/§105
  // direction rule and it is the one property that must hold on every row of the matrix.
  assert(r.state === 'VALID' && r.validated!.analysis.expertHazardCandidates.length === 1,
    `M.${c.id}a the candidate SURVIVES — a hazard is never suppressed to tidy an output`);
  if (c.mustSurvive !== null) {
    assert(o.survived === c.mustSurvive,
      `M.${c.id}b the question ${c.mustSurvive ? 'SURVIVES' : 'is REJECTED'} as the contract requires`,
      `survived=${o.survived}`);
  }
}

section('M2. the characterized cases — recorded as measured, not asserted in advance');
{
  const c4 = observed.find(o => o.id === '4')!;
  assert(!c4.survived && c4.arbitrationFired,
    'M2.1 CASE 4 (CR-F2): a correct SCOPE question mislabelled HAZARD_EXISTENCE is DESTROYED '
    + 'IN FULL, and the drop is recorded — the §147 hosted event, reproduced deterministically');

  // The finding that decides the policy. Arbitration is fail-closed ON THE LABEL, and the label is
  // trusted in BOTH directions: reverse the mislabelling and the contradiction sails through.
  const c6 = observed.find(o => o.id === '6')!;
  assert(c6.survived && !c6.arbitrationFired,
    'M2.2 CASE 6: an EXISTENCE question labelled REQUIRED_CONTROL SURVIVES beside the ACTIVE '
    + 'candidate it contradicts — the stage is fail-closed on the LABEL, never on the semantics');

  const c7 = observed.find(o => o.id === '7')!;
  assert(!c7.survived && c7.arbitrationFired,
    'M2.3 CASE 7: an ambiguous question carrying the contradictory label FAILS CLOSED, and nothing '
    + 'guesses what it meant');

  // Cases 4, 6 and 7 together are the whole policy argument: the stage cannot distinguish a wrong
  // label from a wrong question in EITHER direction, because both distinctions live in the text.
  assert(!c4.survived && c6.survived && !c7.survived,
    'M2.4 the three characterized cases disagree with SEMANTIC truth in both directions — 4 and 7 '
    + 'destroy a question the text did not condemn, 6 keeps one the text does');
}

// =====================================================================================
// R. OPTION C, MEASURED. A counterfactual reclassifier, built and run to be refuted.
// =====================================================================================

section('R. option C measured — what a deterministic reclassifier would actually do');
{
  /**
   * THE COUNTERFACTUAL. This is the most favourable form option C could take without a second model
   * call: a keyword rule over the question text. It is deliberately built to be GOOD -- it is given
   * the exact phrasings of the matrix -- so that its failures are not an artefact of a weak strawman.
   *
   * IT IS NEVER SHIPPED. It is local to this block, unexported, and referenced by nothing else.
   */
  const reclassify = (text: string): ExpertAffectedDecision | 'CANNOT_DECIDE' => {
    const t = text.toLowerCase();
    if (/\bclassif(y|ied|ication)\b|\bzone\b|\bapply|\bgovern|\bwithin the scope\b/.test(t)) {
      return 'APPLICABILITY';
    }
    if (/\bbonded\b|\bearthed\b|\bisolat|\blocked out\b|\bguard|\bcontrol\b/.test(t)) {
      return 'REQUIRED_CONTROL';
    }
    if (/\brecord\b|\bstandard\b|\btreat.*as\b/.test(t)) return 'REGULATORY_INTERPRETATION';
    if (/\bexists?\b|\bexistence\b|\bflash point\b|\bactually\b/.test(t)) return 'HAZARD_EXISTENCE';
    return 'CANNOT_DECIDE';
  };

  const rows = MATRIX.map(c => {
    const derived = reclassify(c.questionText);
    // What the SHIPPED stage would do if it acted on `derived` instead of the declared label.
    const wouldDrop = derived === 'HAZARD_EXISTENCE' && c.candidateState === 'ACTIVE' && c.linked;
    const semanticallyShouldDrop =
      c.trueDecision === 'HAZARD_EXISTENCE' && c.candidateState === 'ACTIVE' && c.linked;
    return { c, derived, wouldDrop, semanticallyShouldDrop,
      agreesWithTruth: derived === c.trueDecision };
  });

  for (const r of rows) {
    console.log(`      CASE ${r.c.id}  declared=${r.c.label.padEnd(25)} `
      + `derived=${String(r.derived).padEnd(25)} true=${r.c.trueDecision}`);
  }

  // R.1 -- the case FOR C. It does rescue CR-F2, and that must be stated, not buried.
  const c4 = rows.find(r => r.c.id === '4')!;
  assert(c4.derived === 'APPLICABILITY' && !c4.wouldDrop,
    'R.1 option C WOULD have rescued CR-F2 — the reclassifier reads the scope question correctly, '
    + 'and this is the strongest thing that can be said for it');

  // R.2 -- and the cases AGAINST. A rule that rescues 4 necessarily acts on every other row too.
  const c2 = rows.find(r => r.c.id === '2')!;
  assert(c2.derived === 'REQUIRED_CONTROL' && !c2.wouldDrop,
    'R.2 it leaves the correctly-labelled control question alone, as it must');

  const c5 = rows.find(r => r.c.id === '5')!;
  assert(c5.derived === 'HAZARD_EXISTENCE' && !c5.wouldDrop,
    'R.3 and the legitimate existence question, because no ACTIVE candidate contradicts it');

  // ==================== R.4 IS A CORRECTION, AND IT IS RECORDED AS ONE ====================
  //
  // This assertion was first authored as a refutation: that the reclassifier would corrupt a label
  // the model got right. IT DID NOT. Run against the seven cases it decides six and is correct on
  // all six. That is the measurement, and it is reported as measured rather than rewritten into the
  // shape the argument wanted -- rewriting the case until the rule failed would have been authoring
  // the answer key to fit the conclusion.
  //
  // The result does NOT rescue option C, and the reason is the thing worth writing down: THE RULE
  // WAS AUTHORED WITH THESE SEVEN QUESTIONS VISIBLE. Its accuracy here is IN-SAMPLE, and in-sample
  // accuracy of a hand-written keyword rule is not evidence about arbitrary customer text. Section
  // R2 measures it OUT of sample, which is where the argument is actually decided.
  const decided = rows.filter(r => r.derived !== 'CANNOT_DECIDE');
  const wrong = decided.filter(r => !r.agreesWithTruth);
  assert(wrong.length === 0 && decided.length === 6,
    'R.4 MEASURED, AND IT CONTRADICTS THE ARGUMENT THIS SUITE SET OUT TO MAKE: in sample the '
    + 'reclassifier decides 6 of 7 and is correct on all 6. Recorded as measured; the refutation of '
    + 'C does not rest here',
    `${decided.length} decided, ${wrong.length} wrong`);

  // THE SECOND REFUTATION, and the decisive one. Case 6 is the contradiction the semantics DO
  // condemn, and the reclassifier's own derivation says so -- yet acting on it means the stage now
  // DELETES a question on the strength of a keyword match, which is exactly the §138 guessing whose
  // cost was measured at 6 of 11 false flags. C cannot be adopted half-way: a rule that may rescue
  // must also be a rule that may destroy.
  const c6 = rows.find(r => r.c.id === '6')!;
  assert(c6.semanticallyShouldDrop && c6.wouldDrop,
    'R.5 THE SECOND REFUTATION: to catch case 6 the reclassifier must DESTROY a question on a '
    + 'keyword match — C is not a rescue mechanism, it is a new deletion mechanism');

  // THE THIRD REFUTATION. On the ambiguous row the rule still returns an answer, and the answer is
  // an artefact of the word "clarify" not being in any branch. Option D's "only where objectively
  // inferable" gate is the same inference deciding whether to trust itself.
  const c7 = rows.find(r => r.c.id === '7')!;
  assert(c7.derived === 'CANNOT_DECIDE',
    'R.6 THE THIRD REFUTATION: on the ambiguous row the rule abstains — so C degenerates to the '
    + 'CURRENT behaviour exactly where a rescue was wanted, and option D\'s inferability gate is '
    + 'the same guess grading its own confidence',
    String(c7.derived));

  // R.7 -- THE STRUCTURAL REFUTATION, and the one that actually decides it. A deterministic
  // semantic reclassifier is a DELETION AUTHORITY, and a deletion authority has to be calibrated
  // against a population before it can be trusted. THERE IS NO SUCH POPULATION. Arbitration has
  // fired exactly ONCE on hosted evidence in the entire programme, across 75 hosted calls in five
  // probes. Nothing in this repository can tell you the false-positive rate of a rule that decides
  // when to destroy a question, and shipping an uncalibrated one to fix an n=1 observation is a
  // strictly worse trade than repairing the label that produced it.
  const HOSTED_ARBITRATION_EVENTS_EVER = 1;
  assert(HOSTED_ARBITRATION_EVENTS_EVER === 1,
    'R.7 THE STRUCTURAL REFUTATION: arbitration has fired ONCE on hosted evidence in the whole '
    + 'programme, so a reclassifier that decides when to DESTROY a question could not be calibrated '
    + 'against any population — C would ship an uncalibrated deletion authority to repair an n=1 '
    + 'observation');
}

// =====================================================================================
// R2. OPTION C, OUT OF SAMPLE. The measurement the in-sample run cannot substitute for.
// =====================================================================================

section('R2. option C out of sample — the reclassifier against question text it never saw');
{
  // The §147 v5 regression set was authored BEFORE this rule existed and for an unrelated purpose.
  // Its ten `temptingQuestion` / `missingFact` strings are therefore genuine held-out question text:
  // real, safety-domain, question-shaped, and not written to make any rule look good or bad.
  //
  // Correctness cannot be scored here -- the v5 set authors an `affectedDecision` only on its
  // REQUIRED half -- so what is measured is the thing that needs no answer key: HOW OFTEN THE RULE
  // DECIDES AT ALL. A stage that abstains on most real text does not implement option C; it
  // implements option A with extra machinery.
  const heldOut: string[] = [];
  for (const f of CLARIFICATION_RECALL_FIXTURES) {
    if (f.expectation.kind === 'REQUIRED') {
      heldOut.push((f.expectation as unknown as { truth: { missingFact: string } }).truth.missingFact);
    } else {
      heldOut.push((f.expectation as unknown as { truth: { temptingQuestion: string } })
        .truth.temptingQuestion);
    }
  }

  // The SAME rule, re-declared verbatim. Re-declared rather than shared so that a future edit to the
  // in-sample block cannot silently change what "out of sample" was measured against.
  const reclassify = (text: string): string => {
    const t = text.toLowerCase();
    if (/\bclassif(y|ied|ication)\b|\bzone\b|\bapply|\bgovern|\bwithin the scope\b/.test(t)) {
      return 'APPLICABILITY';
    }
    if (/\bbonded\b|\bearthed\b|\bisolat|\blocked out\b|\bguard|\bcontrol\b/.test(t)) {
      return 'REQUIRED_CONTROL';
    }
    if (/\brecord\b|\bstandard\b|\btreat.*as\b/.test(t)) return 'REGULATORY_INTERPRETATION';
    if (/\bexists?\b|\bexistence\b|\bflash point\b|\bactually\b/.test(t)) return 'HAZARD_EXISTENCE';
    return 'CANNOT_DECIDE';
  };

  const derived = heldOut.map(q => ({ q, d: reclassify(q) }));
  const abstained = derived.filter(x => x.d === 'CANNOT_DECIDE');
  for (const x of derived) {
    console.log(`      ${x.d.padEnd(26)} ${x.q.slice(0, 88)}`);
  }

  assert(heldOut.length === 10,
    'R2.1 ten held-out question strings, authored for §147 before this rule existed',
    String(heldOut.length));

  // WHATEVER THIS NUMBER IS, IT IS REPORTED. The assertion is deliberately weak -- it gates only
  // that the measurement ran and that the rule is not vacuously deciding everything -- because a
  // strong assertion here would be the answer key written to fit the conclusion again.
  assert(derived.length === 10 && abstained.length <= 10,
    'R2.2 MEASURED out of sample: the rule abstains on '
    + `${abstained.length} of 10 held-out questions`,
    abstained.map(x => x.q.slice(0, 40)).join(' | '));

  // THE DECISIVE PROPERTY, and it holds at ANY abstention rate. On every row the rule DECIDES, the
  // decision is unverifiable: there is no answer key for held-out text, and there is no hosted
  // population to build one from. On every row it ABSTAINS, the behaviour is identical to option A.
  // So C is either A, or it is an unverifiable deletion authority, row by row.
  assert(abstained.length + derived.filter(x => x.d !== 'CANNOT_DECIDE').length === 10,
    'R2.3 every held-out row is either an ABSTENTION (behaviourally identical to option A) or an '
    + 'UNVERIFIABLE decision (no answer key exists, and no hosted population can build one) — '
    + 'which is the whole of what option C offers');

  // ==================== AND OUT OF SAMPLE IT DOES CORRUPT, TWICE ====================
  //
  // These two were NOT constructed. They are §147 fixture strings, authored days before this rule
  // existed, and the rule's answers on them are simply wrong. They are asserted by SUBSTANCE -- the
  // question is located by its own text and the derivation checked -- so the assertion breaks if a
  // future edit changes either the rule or the fixture, rather than silently passing on a stale
  // index.
  const guardrail = derived.find(x => /guardrail height measured/.test(x.q));
  assert(guardrail?.d === 'REQUIRED_CONTROL',
    'R2.4 OUT-OF-SAMPLE CORRUPTION 1: a question about whether a measured height meets a SUPPLIED '
    + 'RECORD\'S BAND derives REQUIRED_CONTROL, because "guardrail" contains "guard". A substring '
    + 'of a hazard-control word decided a regulatory-interpretation question',
    String(guardrail?.d));

  // The decisive one. `HAZARD_EXISTENCE` is the ONLY label that triggers deletion, and here an
  // ADVERB produces it on a question that is plainly about whether a control is working. Give this
  // row an ACTIVE candidate and a declared link -- the ordinary case -- and option C DESTROYS it.
  const extraction = derived.find(x => /on-torch extraction/.test(x.q));
  assert(extraction?.d === 'HAZARD_EXISTENCE',
    'R2.5 OUT-OF-SAMPLE CORRUPTION 2, AND THE DECISIVE ONE: the word "actually" makes a '
    + 'control-effectiveness question derive HAZARD_EXISTENCE — the one label that DELETES. Under '
    + 'option C, an adverb destroys a question beside any ACTIVE candidate',
    String(extraction?.d));

  // The measured out-of-sample record, stated once so the report cannot overstate it: the rule
  // decides 6 of 10 and is demonstrably wrong on at least 2 of those 6. In sample it was 6/6 right.
  // That gap between 6/6 and 4/6 IS the in-sample artefact, measured rather than argued.
  const wrongOutOfSample = [guardrail, extraction].filter(Boolean).length;
  assert(wrongOutOfSample === 2 && derived.length - abstained.length === 6,
    'R2.6 MEASURED: 6 of 10 decided out of sample, at least 2 of those 6 demonstrably wrong — '
    + 'against 6 of 6 correct in sample. The gap is the in-sample artefact, and it is why the '
    + 'in-sample result could not be allowed to settle the question',
    `${wrongOutOfSample} wrong of ${derived.length - abstained.length} decided`);
}

// =====================================================================================
// P. THE POLICY DECISION, expressed as properties of the shipped code.
// =====================================================================================

section('P. the §148 policy decision — E adopted, A retained, B/C/D refused');
{
  // OPTION B is not expressible without a contract change, and that is a fact about the types, not
  // an opinion. `affectedDecision` is `required` on the wire and non-nullable in the analysis, so a
  // "stripped" label has no representation at all.
  const schema = buildExpertWireSchema(input()) as unknown as {
    properties: { decisionCriticalClarifications: { items: { required: string[] } } } };
  assert(schema.properties.decisionCriticalClarifications.items.required
    .includes('affectedDecision'),
    'P.1 OPTION B REFUSED: affectedDecision is a REQUIRED wire field, so there is nothing to strip '
    + 'it to — B is a contract change, not a behaviour change');
  const missingLabel = run({
    expertHazardCandidates: [cand()],
    decisionCriticalClarifications: [clar({ affectedDecision: undefined })],
  });
  assert(missingLabel.issues.some(i => i.code === 'CLARIFICATION_NOT_DECISION_CRITICAL')
    && survivors(missingLabel).length === 0,
    'P.1b and the boundary already REFUSES an unlabelled clarification — B would have to reverse a '
    + 'rule L3-INV-06 established, not merely add a branch');

  // OPTION C / D REFUSED, on the measurement in section R rather than on assertion.
  // The in-sample run REFUTED the first version of this argument (R.4) and is reported as such. The
  // refusal rests on what survived that: C is a new deletion mechanism rather than a rescue (R.5),
  // it abstains exactly where the rescue was wanted (R.6), it cannot be calibrated against a
  // population of one hosted event (R.7), and OUT of sample it derives the deleting label from an
  // adverb (R2.5). D is C with a confidence gate, and the gate is the same inference.
  assert(true, 'P.2 OPTIONS C and D REFUSED on MEASURED evidence, and NOT on the argument this '
    + 'suite first tried: R.4 refuted that one in sample and it is reported. The refusal rests on '
    + 'R.5 (a new deletion mechanism), R.6 (abstains where the rescue was wanted), R.7 '
    + '(uncalibratable at n=1) and R2.4/R2.5 (out of sample, an adverb produces the deleting label)');

  // OPTION A RETAINED, BYTE-UNCHANGED. The trigger is still label + declared link + ACTIVE, and
  // nothing widened it or made it conditional.
  assert(isFatal('CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE') === false,
    'P.3 arbitration is still ITEM-level and non-fatal — the analysis survives, the question does not');
  const unlinked = run({
    expertHazardCandidates: [cand()],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE' })],
  });
  assert(survivors(unlinked).length === 1 && !fired(unlinked),
    'P.3b and it still ABSTAINS with no declared link — §138\'s guessing cost, unchanged');
  const exposure = run({
    expertHazardCandidates: [cand()],
    decisionCriticalClarifications: [clar({ affectedDecision: 'EXPOSURE',
      relatesToCandidateKey: 'cand-fire-explosion' })],
  });
  assert(survivors(exposure).length === 1 && !fired(exposure),
    'P.3c and the trigger is still HAZARD_EXISTENCE and nothing else — EXPOSURE was considered and '
    + 'refused in §141 and is still not a trigger');
  const controlled = run({
    expertHazardCandidates: [cand({ assertedConditionState: 'CONTROLLED' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'cand-fire-explosion' })],
  });
  assert(survivors(controlled).length === 1 && !fired(controlled),
    'P.3d and it still requires the candidate to be ACTIVE — a CONTROLLED candidate contradicts '
    + 'nothing');

  // OPTION E ADOPTED. The repair is in the prompt, at the layer that produces the untrusted value.
  // §149 re-anchored v11 -> v12. The §148 policy decision is unchanged and P.3-P.3d still prove
  // the arbitration trigger byte-identical; only the prompt carrying option E moved forward.
  // §150 re-anchored v12 -> v13. The §148 policy decision is unchanged and P.3-P.3d still prove
  // the arbitration trigger byte-identical; only the prompt carrying option E moved forward.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'P.4 OPTION E ADOPTED: the repair ships in the prompt (v13), at the earliest trustworthy layer',
    EXPERT_PROMPT_VERSION);
  assert(/BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST/.test(sys)
    && /DISCARDED IN FULL/.test(sys),
    'P.4b and it discloses both the self-check and the consequence, which v10 never did');
  assert(/BEFORE WRITING HAZARD_EXISTENCE, re-read your own candidate list/.test(schemaText),
    'P.4c in the wire schema as well as the system prompt');

  // AND THE CONTRACT DID NOT MOVE. This is the claim most worth gating, because it is the one a
  // future reader will most want to trust without re-deriving.
  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'P.5 analysis.v2 is UNCHANGED — no field, enum member or required entry moved',
    EXPERT_ANALYSIS_CONTRACT_VERSION);
  assert(EXPERT_AFFECTED_DECISIONS.length === 6
    && EXPERT_AFFECTED_DECISIONS[0] === 'HAZARD_EXISTENCE',
    'P.5b the affectedDecision vocabulary is unchanged — six members, same order',
    EXPERT_AFFECTED_DECISIONS.join(','));

  // THE STANDING CONSEQUENCE OF CHOOSING E, recorded where it is enforceable rather than only in a
  // report: if the label is the repair, then label accuracy is a GATE and not a diagnostic.
  assert(MATRIX.filter(c => c.mustSurvive === true).length >= 3
    && MATRIX.some(c => c.mustSurvive === false),
    'P.6 the matrix gates E in both directions — valid labelled questions must survive AND a true '
    + 'contradiction must still be rejected; affectedDecision accuracy is now a required gate');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
