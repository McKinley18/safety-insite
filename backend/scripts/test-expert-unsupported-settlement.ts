/**
 * EXPERT HAZLENZ -- §149. THE UNSUPPORTED-SETTLEMENT RULE, THE FOURTEEN-CASE ADVERSARIAL MATRIX,
 * AND THE RAW-LINKAGE INSTRUMENTATION CLOSURE, frozen as deterministic contract tests.
 *
 * ==================== WHAT A ZERO-COST SUITE CAN AND CANNOT PROVE ====================
 *
 * Unchanged from §147 and §148, and worth restating because §149's claim is a behavioural one: THIS
 * SUITE CANNOT PROVE THAT THE MODEL STOPS SETTLING. That is a hosted claim and only a hosted probe
 * settles it. What it proves is that the v12 semantics are present, correctly placed and correctly
 * scoped; that nothing v10 or v11 established was lost; that the fourteen enumerated adversarial
 * cases are each actually represented; and -- the one thing here that IS a complete proof -- that
 * the raw-linkage instrument reconciles, because that is deterministic arithmetic over a captured
 * wire rather than a claim about a model.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No historical artifact is read or touched.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { validateCohortRow } from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  UNSUPPORTED_SETTLEMENT_FIXTURES, UNSUPPORTED_SETTLEMENT_BUDGET, UNSUPPORTED_SETTLEMENT_GATES,
  UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION, ABSENCE_FORMS,
  type AbsenceForm, type UnsupportedSettlementFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/unsupported-settlement-probe-v7';
import {
  THRESHOLD_ARBITRATION_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/threshold-arbitration-probe-v6';
import {
  CLARIFICATION_RECALL_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/clarification-recall-probe-v5';
import {
  rawLinkageDiagnostics, RAW_LINKAGE_DIAGNOSTICS_VERSION,
} from './lib/expert-raw-linkage-diagnostics';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const NOW = '2026-09-03T00:00:00.000Z';
const OBS = 'A pump was left running with its coupling guard removed while a fitter worked at the '
  + 'adjacent bench.';
const input = (): ExpertAnalysisInput => ({
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'us-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'Pump house', task: 'walkthrough' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding', 'electrical', 'lockout_tagout'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
});
const wire = (over: Record<string, unknown> = {}) => ({
  outcome: 'ANALYZED', expertHazardCandidates: [], decisionCriticalClarifications: [],
  crossHazardInsights: [], disagreements: [],
  expertExplanation: { summary: 's' }, uncertainty: { statements: [] }, ...over,
});
const cand = (over: Record<string, unknown> = {}) => ({
  candidateKey: 'c1', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE',
  groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
  evidenceBasis: 'b', reasoning: 'r', confidence: 'HIGH',
  relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: false,
  ...over,
});
const clar = (over: Record<string, unknown> = {}) => ({
  clarificationId: 'q1', question: 'Has the coupling been proved stopped at the shaft?',
  whyItMatters: 'if proved stopped the finding is the guard; if not, work stops now',
  affectedDecision: 'REQUIRED_CONTROL', criticality: 'BLOCKING',
  evidenceGap: 'the shaft state at the point of work is not stated', ...over,
});
const run = (over: Record<string, unknown>) => {
  const inp = input();
  return normalizeExpertOutput(bindWireAnalysis(wire(over), inp).raw, inp, NOW);
};

const sys = EXPERT_SYSTEM_PROMPT;
const schemaText = stableStringify(buildExpertWireSchema(input()));
const F = UNSUPPORTED_SETTLEMENT_FIXTURES;
const byForm = (f: AbsenceForm) => F.filter(x => x.absenceForm === f);
const required = F.filter(f => f.expectation.kind === 'REQUIRED');
const forbidden = F.filter(f => f.expectation.kind === 'FORBIDDEN');
const rtruth = (f: UnsupportedSettlementFixture) =>
  (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

console.log('§149 UNSUPPORTED-SETTLEMENT CONTRACT — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== S
section('S. the v12 rule is present, placed where the crossing happens, and correctly scoped');
{
  // §150 re-anchored v12 -> v13. Section S below still asserts every v12 clause needle by needle,
  // so the §149 closure is protected by its semantics rather than by this label.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'S.1 the prompt is v13 — the §149 v12 semantics are re-anchored, not relaxed',
    EXPERT_PROMPT_VERSION);

  // ---- THE RULE ITSELF, and its placement inside the ESTABLISHED block rather than beside it.
  assert(/NOT OBSERVED IS NOT ABSENT/.test(sys), 'S.2 the rule exists and is named');
  const iEst = sys.indexOf('WHAT COUNTS AS ESTABLISHED');
  const iRule = sys.indexOf('NOT OBSERVED IS NOT ABSENT');
  const iTest = sys.indexOf('THE COUNTERFACTUAL TEST');
  assert(iEst > -1 && iRule > iEst && iRule < iTest,
    'S.3 it sits INSIDE the ESTABLISHED block and before the counterfactual test — TR-E1 settled the '
    + 'fact long before that test ran', `${iEst} < ${iRule} < ${iTest}`);

  // The predicate list. Each of these is a form of "failure to observe" that must not become
  // "evidence of absence"; the authorization enumerates them and the prompt must too.
  for (const needle of ['not VISIBLE', 'not SEEN', 'not SHOWN', 'not PRODUCED', 'not AVAILABLE',
    'not MENTIONED', 'nobody could DETERMINE']) {
    assert(sys.includes(needle), `S.4 the predicate "${needle}" is named as establishing only itself`);
  }
  assert(/Read a negative sentence for EXACTLY the predicate it uses/.test(sys),
    'S.5 and the governing instruction is to read the predicate you actually have');
  assert(/one person's vantage point at one[\s\S]{0,40}moment[\s\S]{0,40}not an inventory/.test(sys),
    'S.6 with the reason: an observation is a vantage point, not an inventory of the site');

  // ---- THE FORBIDDEN STRENGTHENINGS. TR-E1 wrote two of these verbatim.
  for (const needle of ['there is no X', 'no X exists', 'X is not provided',
    'the programme is absent', 'nothing is being done', 'no controls are in place']) {
    assert(sys.includes(needle), `S.7 "${needle}" is named as a forbidden restatement`);
  }

  // ---- THE TWO JUMPS. Naming them separately is the point: TR-E1 made BOTH, and the second is the
  //      one that destroyed the question, because the missing fact was about the PAST.
  assert(/from a THING not being there to an ACTIVITY not happening/.test(sys),
    'S.8 JUMP 1 — thing-not-present to activity-not-happening — is named');
  assert(/Equipment you cannot see[\s\S]{0,40}may have been used and put away/.test(sys),
    'S.8b with the counterexample that makes it concrete');
  assert(/from the state NOW to what was or was not done BEFORE/.test(sys),
    'S.9 JUMP 2 — present state to past action — is named, and it is the one that killed TR-E1');
  assert(/A check made before the work[\s\S]{0,40}began leaves nothing to see afterwards/.test(sys),
    'S.9b with its counterexample too');

  // ---- SCOPE. Without this the rule is an instruction to doubt the text, and US-F1 would fail.
  assert(/THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT/.test(sys),
    'S.10 the rule is explicitly SCOPED — a stated absence is still a fact');
  assert(/that is a fact like any other and you should use it/.test(sys),
    'S.10b and the model is told to USE a real stated absence, not merely permitted to');
  assert(/about which sentence you actually have, not about being cautious/.test(sys),
    'S.10c and the rule names itself as being about sentences rather than about caution');

  // ---- LIKELIHOOD. v11 named nothing at all for this; US-D1 is the row it exists for.
  assert(/LIKELY IS NOT ESTABLISHED/.test(sys), 'S.11 likelihood is named as not establishing');
  assert(/common practice[\s\S]{0,80}what you would expect to see/.test(sys),
    'S.11b with the four sources of likelihood the model actually reaches for');
  assert(/Being able to write a confident sentence is not the same as[\s\S]{0,40}having been told the fact/
    .test(sys), 'S.11c and the self-check that makes it usable');

  // ---- THE EXPLAIN / SETTLE BOUNDARY. The model already does this correctly in insights.
  assert(/WORST CASE MAY EXPLAIN\. IT MUST NEVER SETTLE/.test(sys),
    'S.12 the explain/settle boundary is stated as a boundary');
  assert(/Keep it a conditional/.test(sys) && /does not establish/.test(sys),
    'S.12b with the conditional form preserved');
  assert(/you[\s\S]{0,30}have answered your own question, and it will never be asked/.test(sys),
    'S.12c and the CONSEQUENCE — which is what makes it a rule rather than a preference');

  // ---- THE ENTAILMENT DISCIPLINE, in the EVIDENCE section. THIS IS WHERE TR-E1 ACTUALLY CROSSED:
  //      the quote was exact and in-bounds, and `evidenceBasis` said something stronger.
  assert(/YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES/.test(sys),
    'S.13 the entailment discipline exists');
  const iEvidence = sys.indexOf('EVIDENCE. Every hazard candidate must DECLARE its grounding');
  const iBasis = sys.indexOf('YOUR EVIDENCE BASIS MUST NOT SAY MORE');
  assert(iEvidence > -1 && iBasis > iEvidence,
    'S.13b and it sits in the EVIDENCE section, beside the grounding rules it qualifies');
  assert(/RESTATING A NEGATIVE MORE STRONGLY THAN THE TEXT WROTE IT/.test(sys),
    'S.14 it names the exact move by name');
  assert(/checked for where it[\s\S]{0,30}came FROM, never for whether these sentences follow from it/
    .test(sys),
    'S.15 and states honestly that grounding is a PROVENANCE check, so nothing below the model '
    + 'catches this — which is why it is a prompt rule and not a validator');
  assert(/a POSSIBILITY in reasoning and a QUESTION in/.test(sys),
    'S.16 with the correct destination for a stronger claim the model believes');

  // ---- AND IT MUST NOT COST A CANDIDATE. §101/§105.
  assert(/None of this is a reason to withhold a candidate/.test(sys),
    'S.17 the rule explicitly does NOT suppress a hazard — the §101/§105 direction');
  assert(/Raise the hazard exactly as you would have/.test(sys),
    'S.17b stated as an instruction, not as a permission');

  // ---- THE SETTLEMENT CHECK gains a pointer at written absences.
  assert(/Look hardest at any sentence where you wrote an ABSENCE/.test(sys),
    'S.18 the settlement self-check is pointed at written absences');
  const iCheck = sys.indexOf('THE SETTLEMENT CHECK');
  const iLook = sys.indexOf('Look hardest at any sentence where you wrote an ABSENCE');
  assert(iCheck > -1 && iLook > iCheck,
    'S.18b inside the check rather than as a free-floating sentence');

  // ---- WIRE SCHEMA MIRRORS. §147 established that a semantics present in only one place is not
  //      present, because structured decoding attends to the schema.
  assert(/NOT OBSERVED IS NOT ABSENT/.test(schemaText),
    'S.19 the wire schema mirrors the rule');
  assert(/A thing not being there does not establish an activity not happening/.test(schemaText),
    'S.19b including jump 1');
  assert(/the state now does not establish what was or was not done before/.test(schemaText),
    'S.19c and jump 2');
  assert(/An absence the text really does state IS established/.test(schemaText),
    'S.19d and the scope that keeps US-F1 silent');
  assert(/may EXPLAIN[\s\S]{0,30}why a missing fact matters but must never SETTLE it/.test(schemaText),
    'S.19e and the explain/settle boundary');
  assert(/never as more than that span establishes/.test(schemaText),
    'S.20 and evidenceBasis carries the entailment discipline per-field');
  assert(/This never justifies withholding the candidate/.test(schemaText),
    'S.20b with the no-suppression clause, where the model reads the field');
}

// ===================================================================== N
section('N. nothing v10 or v11 established was lost — asserted needle by needle, not by version');
{
  // If §149 had been bought by weakening an earlier repair, this is where it would show.
  const carried: Array<[string, RegExp]> = [
    ['v10 worst-case assumption limb', /ASSUMED the worse of two possible states/],
    ['v10 resemblance limb', /RESEMBLE the ones it covers/],
    ['v10 unmentioned-fact limb', /is not thereby absent, and not thereby present/],
    ['v10 absence-not-announced', /THE ABSENCE IS USUALLY NOT ANNOUNCED/],
    ['v10 scoped invariance', /JUDGE SAMENESS AGAINST THE DECISION THIS FACT GOVERNS/],
    ['v10 SETTLEMENT CHECK', /THE SETTLEMENT CHECK/],
    ['v10 no-loss rule', /THE NO-LOSS RULE/],
    ['v11 affirmative threshold rule', /A THRESHOLD IS NOT A GAP/],
    ['v11 conjunctive reopening', /It is unsettled ONLY where BOTH of these hold/],
    ['v11 BOTH-never-either', /BOTH, never either/],
    ['v11 proximity insufficiency', /near the line is a side of the line/],
    ['v11 other-basis insufficiency', /its mere availability is not a reason/],
    ['v11 aggregate reopening shape', /an aggregate the record itself says to combine/],
    ['v11 affectedDecision self-check', /BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST/],
    ['v11 destruction consequence', /DISCARDED IN FULL/],
    ['v9 list starts empty', /THIS LIST STARTS EMPTY AND STAYS EMPTY/],
    ['v9 burden on asking', /The burden is on asking, never on staying silent/],
    ['v9 coverage habit', /COVERAGE HABIT/],
    ['v9 five conditions', /ALL FIVE hold/],
    ['linkage governing principle', /what the question DOES to a candidate decides/],
  ];
  for (const [name, re] of carried) {
    assert(re.test(sys), `N.1 ${name} survives v12`);
  }
  const sevenShapes = ['merely useful to know', 'best-practice follow-up',
    'documentation, records or paperwork', 'historical context', 'severity refinement',
    'routine due diligence', 'unrelated secondary hazard'];
  const missing = sevenShapes.filter(s => !sys.includes(s));
  assert(missing.length === 0,
    'N.2 all seven NOT-DECISION-CRITICAL shapes survive', missing.join(', '));

  // THE CONTRACT DID NOT MOVE. This is the claim a future reader most wants to trust without
  // re-deriving, so it is gated rather than asserted in prose.
  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'N.3 analysis.v2 is UNCHANGED — no field, enum member or required entry moved',
    EXPERT_ANALYSIS_CONTRACT_VERSION);
  assert(EXPERT_AFFECTED_DECISIONS.length === 6,
    'N.3b the affectedDecision vocabulary is unchanged — six members');

  // ARBITRATION IS BYTE-UNCHANGED. Proved behaviourally, not by reading the file.
  const contradiction = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(contradiction.state === 'VALID'
    && (contradiction.validated?.analysis.decisionCriticalClarifications ?? []).length === 0
    && contradiction.issues.some(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'),
    'N.4 MATRIX CASE N — a true contradiction is STILL REJECTED, and the rejection property is '
    + 'proved here deterministically because a hosted run cannot commission a model error');
  assert(contradiction.validated!.analysis.expertHazardCandidates.length === 1,
    'N.4b and the ACTIVE candidate is kept — the §101/§105 direction, unchanged');
  const control = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'REQUIRED_CONTROL',
      relatesToCandidateKey: 'k1' })],
  });
  assert((control.validated?.analysis.decisionCriticalClarifications ?? []).length === 1,
    'N.5 MATRIX CASE M — an ACTIVE candidate plus a valid non-existence label SURVIVES');
  const silent = run({ expertHazardCandidates: [cand()] });
  assert(silent.state === 'VALID'
    && (silent.validated?.analysis.decisionCriticalClarifications ?? []).length === 0,
    'N.6 silence stays silence — nothing is fabricated into an empty collection');
}

// ===================================================================== M
section('M. the fourteen enumerated adversarial cases are each represented');
{
  assert(F.length === 10 && F.length === UNSUPPORTED_SETTLEMENT_BUDGET.targetLogicalCalls,
    'M.0 ten rows, matching the frozen budget', String(F.length));
  assert(required.length === 5 && forbidden.length === 5,
    'M.0b five REQUIRED and five FORBIDDEN, as the authorization asks',
    `${required.length}/${forbidden.length}`);

  // A..N, located by STRUCTURE rather than by row id, so a renamed row cannot silently drop a case.
  const cases: Array<[string, string, boolean]> = [
    ['A  control explicitly absent -> nothing to ask about its existence',
      'EXPLICITLY_ABSENT', byForm('EXPLICITLY_ABSENT').length === 1
        && byForm('EXPLICITLY_ABSENT')[0].expectation.kind === 'FORBIDDEN'],
    ['B  control not visible -> status remains unknown',
      'NOT_VISIBLE', byForm('NOT_VISIBLE').length === 1
        && byForm('NOT_VISIBLE')[0].expectation.kind === 'REQUIRED'],
    ['C  control not mentioned -> status remains unknown',
      'NOT_MENTIONED', byForm('NOT_MENTIONED').length === 1
        && byForm('NOT_MENTIONED')[0].expectation.kind === 'REQUIRED'],
    ['D  record states control PRESENT -> settled',
      'EXPLICITLY_PRESENT', byForm('EXPLICITLY_PRESENT').length === 1
        && byForm('EXPLICITLY_PRESENT')[0].expectation.kind === 'FORBIDDEN'],
    ['E  record states control ABSENT -> settled',
      'EXPLICITLY_ABSENT', byForm('EXPLICITLY_ABSENT')[0].row.source.governedStandards.length > 0],
    ['F  observer cannot determine -> clarification required',
      'OBSERVER_CANNOT_DETERMINE', byForm('OBSERVER_CANNOT_DETERMINE').length === 1
        && byForm('OBSERVER_CANNOT_DETERMINE')[0].expectation.kind === 'REQUIRED'],
    ['G  likely absence, not established -> clarification required',
      'LIKELY_BUT_UNESTABLISHED', byForm('LIKELY_BUT_UNESTABLISHED').length === 1
        && byForm('LIKELY_BUT_UNESTABLISHED')[0].expectation.kind === 'REQUIRED'],
    ['H  worst-case branch useful for risk, must not become fact',
      'WORST_CASE_TEMPTATION', byForm('WORST_CASE_TEMPTATION').length === 1
        && byForm('WORST_CASE_TEMPTATION')[0].expectation.kind === 'REQUIRED'],
    ['I  absence deterministically derivable -> settled',
      'DETERMINISTIC_DERIVATION', byForm('DETERMINISTIC_DERIVATION').length === 1
        && byForm('DETERMINISTIC_DERIVATION')[0].expectation.kind === 'FORBIDDEN'],
    ['J  unknown but decision-invariant -> silence',
      'DECISION_INVARIANT_UNKNOWN', byForm('DECISION_INVARIANT_UNKNOWN').length === 1
        && byForm('DECISION_INVARIANT_UNKNOWN')[0].expectation.kind === 'FORBIDDEN'],
    ['K  §148 settled threshold -> remains silent',
      'SETTLED_THRESHOLD', byForm('SETTLED_THRESHOLD').length === 1
        && byForm('SETTLED_THRESHOLD')[0].expectation.kind === 'FORBIDDEN'
        && byForm('SETTLED_THRESHOLD')[0].row.source.governedStandards.length > 0],
    ['L  §148 unmarked aggregation gap -> remains recovered',
      'NOT_MENTIONED', byForm('NOT_MENTIONED')[0].row.source.governedStandards.length > 0
        && String(rtruth(byForm('NOT_MENTIONED')[0]).affectedDecision) === 'REGULATORY_INTERPRETATION'
        && rtruth(byForm('NOT_MENTIONED')[0]).absenceIsUnmarked === true],
    ['M  ACTIVE candidate + valid non-existence label -> survives',
      'deterministic + fixture', required.filter(f => f.hazardEstablished).length >= 3],
    ['N  ACTIVE candidate + true contradiction -> rejected',
      'deterministic only', true],
  ];
  cases.forEach(([name, where, ok], i) => assert(ok, `M.${i + 1} case ${name}`, where));

  // Case N is deterministic-only ON PURPOSE, and saying so is part of the result.
  assert(!Object.keys(UNSUPPORTED_SETTLEMENT_GATES).includes('trueContradictionRejection'),
    'M.15 the frozen gates carry NO numeric true-contradiction target — a realized opportunity '
    + 'requires the MODEL to make an error v12 tells it not to make, so it cannot be commissioned; '
    + 'N.4 proves the rejection property deterministically instead');
}

// ===================================================================== C
section('C. the v7 set is structurally sound and confined');
{
  assert(new Set(F.map(f => f.domain)).size === 10, 'C.1 ten distinct domains');
  const prior = new Set([...CLARIFICATION_RECALL_FIXTURES, ...THRESHOLD_ARBITRATION_FIXTURES]
    .map(f => f.domain));
  assert(F.every(f => !prior.has(f.domain)),
    'C.1b and provably distinct from the v5 and v6 sets, checked against those modules',
    F.filter(f => prior.has(f.domain)).map(f => f.domain).join(', '));
  const ids = F.map(f => f.row.source.rowId);
  assert(ids.every(i => /^US-[A-J]\d$/.test(i)) && new Set(ids).size === ids.length,
    'C.2 ids are fresh US-* development ids and unique', ids.join(' '));
  const forms = new Set(F.map(f => f.absenceForm));
  assert(ABSENCE_FORMS.every(a => forms.has(a)) && forms.size === ABSENCE_FORMS.length,
    'C.3 every absence form appears exactly once — a miss names its own mechanism');

  // §140 DP-B4, enforced rather than trusted, on every REQUIRED row.
  const bad = required.filter(f => {
    const t = rtruth(f);
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || String(t.outcomeA).trim() === String(t.outcomeB).trim();
  });
  assert(bad.length === 0,
    'C.4 every REQUIRED row names two answers AND two DIFFERENT current outcomes',
    bad.map(f => f.row.source.rowId).join(', '));
  assert(required.every(f => String(rtruth(f).whyNotEstablished).length >= 60),
    'C.4b and states at length why the text does NOT settle it');
  assert(forbidden.every(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return t.temptingQuestion.length > 10 && t.whyNotDecisionCritical.length > 60
      && t.whatMakesItSettled.length > 60;
  }), 'C.5 every FORBIDDEN row names the tempting question, a per-row reason and what settles it');

  // THE ADJUDICATION KEY. Without it the unsupported-settlement gate is a matter of opinion.
  const strengthenable = required;
  assert(strengthenable.every(f => f.forbiddenStrengthening !== null
    && f.forbiddenStrengthening.textEstablishes.length > 30
    && f.forbiddenStrengthening.mustNotAssert.length > 30),
    'C.6 every REQUIRED row states BOTH what the text establishes AND the affirmative sentence the '
    + 'model must not write — the pair a human adjudicates the settlement gate against',
    strengthenable.filter(f => !f.forbiddenStrengthening).map(f => f.row.source.rowId).join(', '));
  assert(forbidden.every(f => f.forbiddenStrengthening === null),
    'C.6b and no FORBIDDEN row carries one, because there is no strengthening available on a row '
    + 'whose facts are settled');

  // No row may author HAZARD_EXISTENCE, for the §148 reason.
  assert(required.every(f => rtruth(f).affectedDecision !== 'HAZARD_EXISTENCE'),
    'C.7 no row authors HAZARD_EXISTENCE as the owed label');
  assert(required.every(f => (EXPERT_AFFECTED_DECISIONS as readonly string[])
    .includes(String(rtruth(f).affectedDecision))),
    'C.7b and every authored label is in the frozen vocabulary');
  assert(required.every(f => rtruth(f).affectedDecision !== 'REGULATORY_INTERPRETATION'
    || f.row.source.governedStandards.length > 0),
    'C.7c REGULATORY_INTERPRETATION is never claimed without a supplied record');
  assert(required.every(f => f.row.truth.decisionCriticalGaps[0].affectedDecision
    === rtruth(f).affectedDecision),
    'C.7d and the row-truth gap agrees with the expectation truth — one label per row');
  assert(F.every(f => f.row.truth.decisionCriticalGaps.length
    === (f.expectation.kind === 'REQUIRED' ? 1 : 0)),
    'C.8 exactly one authored gap per REQUIRED row and none on any FORBIDDEN row');

  // THE CANDIDATE PROPERTY. §149 must not cost a hazard, so the set must be able to detect it.
  assert(F.filter(f => f.hazardEstablished).length >= 5
    && F.filter(f => f.hazardEstablished).every(f => f.row.truth.presentHazardFamilies.length > 0),
    'C.9 at least five rows establish a hazard the model MUST still raise, so a repair that bought '
    + 'silence with suppressed candidates would be visible',
    F.filter(f => f.hazardEstablished).map(f => f.row.source.rowId).join(' '));
  assert(F.filter(f => f.hazardEstablished && f.expectation.kind === 'FORBIDDEN').length >= 1,
    'C.9b including at least one FORBIDDEN row, so "raise the hazard, ask nothing" is testable');

  const incomplete = F.filter(f => validateCohortRow(f.row).length > 0);
  assert(incomplete.length === 0,
    'C.10 every row satisfies the cohort row contract',
    incomplete.map(f => `${f.row.source.rowId}: ${validateCohortRow(f.row)
      .map(p => p.detail).join('; ')}`).join(' | '));
  const keys = new Set(F.flatMap(f => Object.keys(f)));
  assert(!keys.has('disagreement') && !keys.has('insight'),
    'C.11 the set authors NO disagreement or insight truth — §146 proved that denominator invalid');

  assert(UNSUPPORTED_SETTLEMENT_BUDGET.hardProviderRequestCeiling === 10
    && UNSUPPORTED_SETTLEMENT_BUDGET.hardSpendCeilingUsd === 1.50
    && UNSUPPORTED_SETTLEMENT_BUDGET.arms.length === 1
    && UNSUPPORTED_SETTLEMENT_BUDGET.maxRetriesPerLogicalCall === 0,
    'C.12 the frozen budget matches the §149 authorization: 10 requests, $1.50, ONE arm, NO retries');
  assert(UNSUPPORTED_SETTLEMENT_GATES.strictRequiredRecall === 1.0
    && UNSUPPORTED_SETTLEMENT_GATES.maxForbiddenViolations === 0
    && UNSUPPORTED_SETTLEMENT_GATES.maxUnsupportedSettlements === 0
    && UNSUPPORTED_SETTLEMENT_GATES.rawLinkageReconciliationRequired === true,
    'C.13 and the frozen gates are transcribed at 100% / zero, with raw-linkage reconciliation '
    + 'required');
  assert(UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION.endsWith('.v7'),
    'C.14 the fixture set carries its own version, distinct from the spent v5 and v6 sets');
}

// ===================================================================== L
section('L. §149 PHASE 5 — the raw-linkage instrument, self-tested to the §148 blind spot');
{
  assert(RAW_LINKAGE_DIAGNOSTICS_VERSION.endsWith('.v1'), 'L.0 the instrument carries a version');

  // ---- L.1 THE §148 BLIND SPOT, REPRODUCED. This is TR-C2 exactly: the model declared "haz-2",
  //      the boundary stripped it, and the OLD metric — which reads the validated output — saw
  //      nothing. The new instrument reads the wire and sees the attempt.
  const tr_c2_like = rawLinkageDiagnostics([{
    rowId: 'X1',
    wire: { candidates: [{ candidateKey: 'cand-real' }],
            clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'haz-2' }] },
    // What the VALIDATED analysis looks like after the strip — the only view §148 had.
    normalizedClarifications: [{ relatesToCandidateKey: null }],
    issueCodes: ['CLARIFICATION_LINK_UNRESOLVED'],
  }]);
  assert(tr_c2_like.RAW_LINKAGE_ATTEMPTS === 1,
    'L.1 the model\'s attempt is now COUNTED — §148 reported 0 attempts on exactly this shape',
    String(tr_c2_like.RAW_LINKAGE_ATTEMPTS));
  assert(tr_c2_like.RAW_INVALID_LINKAGE_ATTEMPTS === 1
    && tr_c2_like.perRow[0].rawInvalidKeys[0] === 'haz-2',
    'L.1b and the invalid KEY ITSELF is recoverable, not merely a count');
  assert(tr_c2_like.NORMALIZED_VALID_LINKAGES === 0 && tr_c2_like.STRIPPED_INVALID_LINKAGES === 1,
    'L.1c while the normalized view is reported unchanged beside it — four numbers, not one');
  assert(tr_c2_like.reconciled === true,
    'L.1d and the two views RECONCILE: every strip corresponds to an attempt the wire shows',
    tr_c2_like.reconciliationDetail);

  // ---- L.2 A CLEAN VALID LINK.
  const valid = rawLinkageDiagnostics([{
    rowId: 'X2',
    wire: { candidates: [{ candidateKey: 'k1' }],
            clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] },
    normalizedClarifications: [{ relatesToCandidateKey: 'k1' }],
    issueCodes: [],
  }]);
  assert(valid.RAW_LINKAGE_ATTEMPTS === 1 && valid.RAW_INVALID_LINKAGE_ATTEMPTS === 0
    && valid.NORMALIZED_VALID_LINKAGES === 1 && valid.STRIPPED_INVALID_LINKAGES === 0
    && valid.reconciled === true,
    'L.2 a valid link counts as an attempt and survives — attempts are not a defect metric');

  // ---- L.3 AN OMITTED LINK IS NOT AN ATTEMPT. §141: omission is always legal.
  const omitted = rawLinkageDiagnostics([{
    rowId: 'X3',
    wire: { candidates: [{ candidateKey: 'k1' }],
            clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: null }] },
    normalizedClarifications: [{ relatesToCandidateKey: null }],
    issueCodes: [],
  }]);
  assert(omitted.RAW_LINKAGE_ATTEMPTS === 0 && omitted.reconciled === true,
    'L.3 an OMITTED link is not an attempt — omission is legal and must not inflate the numerator');

  // ---- L.4 NOT MEASURED IS NULL, NEVER ZERO. This is what stops the instrument reconstructing
  //      history: every run before §148 has no captured wire, and it must say so.
  const noCapture = rawLinkageDiagnostics([
    { rowId: 'H1', wire: null, normalizedClarifications: [{ relatesToCandidateKey: 'k1' }],
      issueCodes: [] },
  ]);
  assert(noCapture.RAW_LINKAGE_ATTEMPTS === null && noCapture.RAW_INVALID_LINKAGE_ATTEMPTS === null,
    'L.4 with no captured wire the raw figures are NULL, not zero — nothing is reconstructed');
  assert(noCapture.rawCaptureAvailable === false && noCapture.reconciled === null,
    'L.4b and reconciliation abstains rather than passing vacuously');
  assert(noCapture.NORMALIZED_VALID_LINKAGES === 1,
    'L.4c while the normalized figures, which ARE measurable, are still reported');
  assert(/NOT RECONCILABLE/.test(noCapture.reconciliationDetail),
    'L.4d and the detail says so in words, so a reader cannot mistake null for a clean run');

  // ---- L.5 A MIXED RUN IS NOT SILENTLY AVERAGED.
  const mixed = rawLinkageDiagnostics([
    { rowId: 'M1', wire: { candidates: [{ candidateKey: 'k1' }],
        clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] },
      normalizedClarifications: [{ relatesToCandidateKey: 'k1' }], issueCodes: [] },
    { rowId: 'M2', wire: null, normalizedClarifications: [], issueCodes: [] },
  ]);
  assert(mixed.rawCaptureAvailable === false && mixed.callsWithRawCapture === 1
    && mixed.callsWithoutRawCapture === 1 && mixed.RAW_LINKAGE_ATTEMPTS === null,
    'L.5 one missing capture makes the RUN-LEVEL raw figure null — a partial measurement is not '
    + 'presented as a whole one');
  assert(mixed.perRow[0].rawAttempts === 1 && mixed.perRow[1].rawAttempts === null,
    'L.5b while the per-row view keeps what was measured and marks what was not');

  // ---- L.6 THE INSTRUMENT REPORTS ITS OWN DISAGREEMENT rather than the smaller number. If the
  //      boundary ever stripped something the wire does not show as invalid, that is a defect in one
  //      of the two and must surface loudly.
  const disagree = rawLinkageDiagnostics([{
    rowId: 'D1',
    wire: { candidates: [{ candidateKey: 'k1' }],
            clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] },
    normalizedClarifications: [{ relatesToCandidateKey: null }],
    issueCodes: ['CLARIFICATION_LINK_UNRESOLVED'],
  }]);
  assert(disagree.reconciled === false && /INSTRUMENT DISAGREEMENT/.test(disagree.reconciliationDetail),
    'L.6 a raw/normalized disagreement FAILS reconciliation loudly instead of being averaged away');
  assert(disagree.perRow[0].consistent === false,
    'L.6b and the offending row is locatable');

  // ---- L.7 THE PRODUCTION BOUNDARY IS UNTOUCHED. Proved against the real normalizer, because the
  //      whole point is that this is a measurement change and not a behaviour change.
  const real = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'ghost' })],
  });
  assert(real.state === 'VALID'
    && (real.validated?.analysis.decisionCriticalClarifications ?? []).length === 1
    && real.validated!.analysis.decisionCriticalClarifications[0].relatesToCandidateKey === null
    && real.issues.some(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED'),
    'L.7 the boundary still strips the key, KEEPS the question and records the issue — §141 '
    + 'behaviour is byte-unchanged and §149 changed measurement only');
  assert(real.issues.filter(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED')
    .every(i => i.offendingText === undefined),
    'L.7b and offendingText was NOT widened to carry the broken key — that field is safe only '
    + 'because every code carrying it is ANALYSIS_FATAL, and this one is not');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
