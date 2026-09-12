/**
 * EXPERT HAZLENZ -- §150. THE CLARIFICATION RETENTION BRIDGE, THE FOURTEEN-CASE MATRIX, THE TWO
 * REPAIRED §149 FIXTURE DEFECTS, AND THE CORRECTED TRUE-CONTRADICTION GATE SEMANTICS.
 *
 * ==================== WHAT A ZERO-COST SUITE CAN AND CANNOT PROVE ====================
 *
 * It CANNOT prove that the model now promotes a retained unknown into a question. That is a hosted
 * claim. What it proves: the v13 bridge is present, placed last, correctly conjunctive and correctly
 * deferential to the counterfactual test; nothing from v9-v12 was lost -- and §149's
 * unsupported-settlement closure in particular is protected clause by clause; the fourteen
 * enumerated cases are represented; the two §149 fixture defects are actually repaired rather than
 * relabelled; and -- the parts that ARE complete proofs, because they are deterministic --
 * arbitration's rejection behaviour and the raw-linkage reconciliation.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No historical artifact is read or touched.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_AFFECTED_DECISIONS, EXPERT_ANALYSIS_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  stableStringify,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import { validateCohortRow } from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  RETENTION_BRIDGE_FIXTURES, RETENTION_BRIDGE_BUDGET, RETENTION_BRIDGE_GATES,
  RETENTION_BRIDGE_FIXTURE_SET_VERSION, RETENTION_FORMS,
  type RetentionForm, type RetentionBridgeFixture,
} from '../src/safescope-v2/expert-hazlenz/fixtures/retention-bridge-probe-v8';
import {
  UNSUPPORTED_SETTLEMENT_FIXTURES,
} from '../src/safescope-v2/expert-hazlenz/fixtures/unsupported-settlement-probe-v7';
import {
  THRESHOLD_ARBITRATION_FIXTURES,
} from '../src/safescope-v2/expert-hazlenz/fixtures/threshold-arbitration-probe-v6';
import {
  CLARIFICATION_RECALL_FIXTURES,
} from '../src/safescope-v2/expert-hazlenz/fixtures/clarification-recall-probe-v5';
import { rawLinkageDiagnostics } from './lib/expert-raw-linkage-diagnostics';

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
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'rb-1',
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
const survivors = (r: ReturnType<typeof run>) =>
  r.validated?.analysis.decisionCriticalClarifications ?? [];

const sys = EXPERT_SYSTEM_PROMPT;
const schemaText = stableStringify(buildExpertWireSchema(input()));
const F = RETENTION_BRIDGE_FIXTURES;
const byForm = (f: RetentionForm) => F.filter(x => x.retentionForm === f);
const required = F.filter(f => f.expectation.kind === 'REQUIRED');
const forbidden = F.filter(f => f.expectation.kind === 'FORBIDDEN');
const rtruth = (f: RetentionBridgeFixture) =>
  (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

console.log('§150 RETENTION-BRIDGE CONTRACT — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== B
section('B. the v13 retention bridge is present, placed LAST, and correctly conjunctive');
{
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'B.1 the prompt is v13 — bumped for the §150 retention-bridge repair', EXPERT_PROMPT_VERSION);

  assert(/THE RETENTION BRIDGE/.test(sys), 'B.2 the bridge exists and is named');

  // ---- PLACEMENT. The bridge re-reads the model's OWN FINISHED OUTPUT, so it must come after the
  //      two checks it completes, for the same reason THE SETTLEMENT CHECK comes after the lists.
  const iNoLoss = sys.indexOf('THE NO-LOSS RULE');
  const iSettle = sys.indexOf('THE SETTLEMENT CHECK');
  const iBridge = sys.indexOf('THE RETENTION BRIDGE');
  assert(iNoLoss > -1 && iSettle > iNoLoss && iBridge > iSettle,
    'B.3 it sits AFTER the no-loss rule and the settlement check, in that order',
    `${iNoLoss} < ${iSettle} < ${iBridge}`);
  assert(/Run this LAST, over everything you have just written/.test(sys),
    'B.3b and says so — it is a re-read of finished output, not a rule applied while writing');

  // ---- THE DISTINCTION FROM THE SETTLEMENT CHECK. This is the whole diagnosis in one sentence, and
  //      if a future edit blurs it the two checks collapse into one and US-D1's class escapes again.
  assert(/catches a fact you RESOLVED\. This one catches a fact you correctly left OPEN/.test(sys),
    'B.4 it states the distinction: the settlement check catches a RESOLVED gap, this catches an '
    + 'OPEN one — the gap that had no rule at all');

  // ---- THE FOUR CHANNELS. US-D1 used three of them simultaneously.
  for (const [needle, label] of [
    ['a candidate you left INSUFFICIENT_EVIDENCE or UNKNOWN', 'candidate state'],
    ['reasoning or an evidenceBasis that calls something unconfirmed', 'reasoning / evidenceBasis'],
    ['a summary sentence that says a fact is not settled', 'summary'],
    ['an uncertainty statement', 'uncertainty'],
  ] as const) {
    assert(sys.includes(needle), `B.5 channel named: ${label}`);
  }
  assert(/LOW confidence because you[\s\S]{0,30}could not establish it/.test(sys),
    'B.5b including a LOW-confidence candidate, which is the same retention wearing another face');

  // ---- THE CONJUNCTION. The bridge must not become "INSUFFICIENT_EVIDENCE -> ASK".
  assert(/WOULD LEARNING THIS FACT CHANGE WHAT IS DONE NOW/.test(sys),
    'B.6 the single gating question is the counterfactual, not the candidate state');
  assert(/If YES, there MUST be a decisionCriticalClarification for it/.test(sys),
    'B.6b YES is obligatory — "must", not "consider"');
  assert(/If NO, say nothing/.test(sys)
    && /Insufficiency that changes no decision is not a question, and most is not/.test(sys),
    'B.6c and NO is silence, with the majority case stated so the default is not asking');
  assert(/INSUFFICIENT_EVIDENCE[\s\S]{0,20}ON ITS OWN IS NEVER A REASON TO ASK/.test(sys),
    'B.7 THE ANTI-OVERFIRE CLAUSE — the state alone is explicitly not a trigger');
  assert(/the test in 2 still decides, all five of its conditions[\s\S]{0,20}still hold/.test(sys),
    'B.7b and the counterfactual test remains binding, by name and by count');
  assert(/THIS DOES NOT LOWER THE BAR AND IT IS NOT A QUOTA/.test(sys),
    'B.7c and the bridge says so in terms');
  assert(/It adds no reason to ask/.test(sys),
    'B.7d — its whole function is routing something already concluded, not concluding it');

  // ---- NO DUPLICATES. Without this the bridge doubles questions it already asked.
  assert(/If you have already asked it, do NOT ask again\. One question per fact/.test(sys),
    'B.8 a fact already asked about is not asked twice');

  // ---- THE NOT-A-SUBSTITUTE LIST. Every item is something US-D1 actually did.
  for (const [needle, label] of [
    ['leaving the candidate INSUFFICIENT_EVIDENCE', 'the candidate state'],
    ['saying in reasoning that the evidence is insufficient', 'reasoning'],
    ['writing out both branches without asking which one holds', 'both branches'],
    ['noting it in the summary or in uncertainty', 'summary / uncertainty'],
  ] as const) {
    assert(sys.includes(needle), `B.9 named as NOT a substitute: ${label}`);
  }
  assert(/it records that YOU do not know, and asks nobody who might/.test(sys),
    'B.10 and the reason is given: a state records ignorance, a question seeks an answer');
  assert(/It cannot be answered, so it cannot be closed/.test(sys),
    'B.10b with the consequence for the customer, which is what makes it a defect and not a style');

  // ---- WIRE SCHEMA MIRROR. §147 established that a semantics present in only one place is absent.
  assert(/A RETAINED UNKNOWN BELONGS HERE, NOT ONLY IN A CANDIDATE STATE/.test(schemaText),
    'B.11 the wire schema carries the bridge');
  assert(/Leaving it as a state or[\s\S]{0,20}a sentence records that you do not know/.test(schemaText),
    'B.11b including the reason');
  assert(/Insufficiency that[\s\S]{0,20}changes no decision stays silent/.test(schemaText),
    'B.11c and the anti-overfire clause, where the model reads the field');
  assert(/a fact already asked about is not asked twice/.test(schemaText),
    'B.11d and the no-duplicate rule');
}

// ===================================================================== N
section('N. nothing from v9-v12 was lost — and §149\'s closure is protected clause by clause');
{
  const carried: Array<[string, RegExp]> = [
    ['v10 worst-case limb', /ASSUMED the worse of two possible states/],
    ['v10 resemblance limb', /RESEMBLE the ones it covers/],
    ['v10 unmentioned-fact limb', /is not thereby absent, and not thereby present/],
    ['v10 absence-not-announced', /THE ABSENCE IS USUALLY NOT ANNOUNCED/],
    ['v10 scoped invariance', /JUDGE SAMENESS AGAINST THE DECISION THIS FACT GOVERNS/],
    ['v10 SETTLEMENT CHECK', /THE SETTLEMENT CHECK/],
    ['v10 no-loss rule', /THE NO-LOSS RULE/],
    ['v11 affirmative threshold rule', /A THRESHOLD IS NOT A GAP/],
    ['v11 conjunctive reopening', /It is unsettled ONLY where BOTH of these hold/],
    ['v11 proximity insufficiency', /near the line is a side of the line/],
    ['v11 aggregate reopening shape', /an aggregate the record itself says to combine/],
    ['v11 affectedDecision self-check', /BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST/],
    ['v11 destruction consequence', /DISCARDED IN FULL/],
    ['v9 list starts empty', /THIS LIST STARTS EMPTY AND STAYS EMPTY/],
    ['v9 burden on asking', /The burden is on asking, never on staying silent/],
    ['v9 coverage habit', /COVERAGE HABIT/],
    ['v9 five conditions', /ALL FIVE hold/],
    ['linkage governing principle', /what the question DOES to a candidate decides/],
  ];
  for (const [name, re] of carried) assert(re.test(sys), `N.1 ${name} survives v13`);

  // ---- §149'S CLOSURE IS THE ONE MOST AT RISK, because v13 sits in the same region of the prompt
  //      and the owner's standing instruction is not to reopen it. Asserted clause by clause.
  const v12: Array<[string, RegExp]> = [
    ['NOT OBSERVED IS NOT ABSENT', /NOT OBSERVED IS NOT ABSENT/],
    ['exact-predicate instruction', /Read a negative sentence for EXACTLY the predicate it uses/],
    ['jump 1 thing->activity', /from a THING not being there to an ACTIVITY not happening/],
    ['jump 2 now->before', /from the state NOW to what was or was not done BEFORE/],
    ['the SCOPE clause', /THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT/],
    ['a stated absence is usable', /that is a fact like any other and you should use it/],
    ['LIKELY IS NOT ESTABLISHED', /LIKELY IS NOT ESTABLISHED/],
    ['explain/settle boundary', /WORST CASE MAY EXPLAIN\. IT MUST NEVER SETTLE/],
    ['entailment discipline', /YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES/],
    ['no-suppression clause', /None of this is a reason to withhold a candidate/],
    ['settlement check absence pointer', /Look hardest at any sentence where you wrote an ABSENCE/],
  ];
  for (const [name, re] of v12) {
    assert(re.test(sys), `N.2 §149 v12 clause intact: ${name}`);
  }

  // ---- LIST 6's EXISTING BRIDGE must survive verbatim. v13 completes it; it does not replace it.
  assert(/If an uncertainty can be phrased as a question that would/.test(sys)
    && /it is a decisionCriticalClarification, not an uncertainty/.test(sys),
    'N.3 list 6\'s uncertainty->clarification bridge survives verbatim — v13 completes it rather '
    + 'than replacing it');
  assert(/ONLY residual ambiguity you could not turn into a candidate/.test(sys),
    'N.3b including the clause that closed it to candidate-shaped doubts, which is left ALONE — the '
    + 'repair adds a path rather than reopening a routing rule that works');

  // ---- THE `INSUFFICIENT_EVIDENCE` STATE ITSELF. Weakening it would reopen §112-§115.
  assert(/If you cannot establish the state, say INSUFFICIENT_EVIDENCE or UNKNOWN\. Both are real answers/
    .test(sys),
    'N.4 the INSUFFICIENT_EVIDENCE state is UNTOUCHED and still a real answer');
  assert(/NEVER assert a condition is ACTIVE when the observation does not establish present exposure/
    .test(sys),
    'N.4b and the prohibition it serves is intact');

  const sevenShapes = ['merely useful to know', 'best-practice follow-up',
    'documentation, records or paperwork', 'historical context', 'severity refinement',
    'routine due diligence', 'unrelated secondary hazard'];
  const missing = sevenShapes.filter(s => !sys.includes(s));
  assert(missing.length === 0, 'N.5 all seven NOT-DECISION-CRITICAL shapes survive', missing.join(', '));

  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'N.6 analysis.v2 is UNCHANGED — no field, enum member or required entry moved',
    EXPERT_ANALYSIS_CONTRACT_VERSION);
  assert(EXPERT_AFFECTED_DECISIONS.length === 6,
    'N.6b the affectedDecision vocabulary is unchanged — six members');
}

// ===================================================================== M
section('M. the fourteen enumerated matrix cases');
{
  // A-J are FIXTURE cases: only a hosted probe can settle them, so what is proved here is that each
  // is actually represented and correctly polarised. K-N are DETERMINISTIC and are proved outright.
  const cases: Array<[string, boolean, string]> = [
    ['A  recognized unknown + decision-changing + candidate INSUFFICIENT_EVIDENCE -> REQUIRED',
      byForm('UNKNOWN_IS_THE_CANDIDATE').length === 1
        && byForm('UNKNOWN_IS_THE_CANDIDATE')[0].expectation.kind === 'REQUIRED'
        && byForm('UNKNOWN_IS_THE_CANDIDATE')[0].unknownIsCandidateShaped, 'RB-A1'],
    ['B  recognized unknown + reasoning describes the uncertainty -> REQUIRED',
      required.filter(f => (f.retention?.retentionChannel ?? '').includes('reasoning')).length >= 2,
      'RB-A1/B1/C1/E1'],
    ['C  recognized unknown + both branches explained -> REQUIRED',
      required.every(f => String(rtruth(f).outcomeA).trim() !== String(rtruth(f).outcomeB).trim()),
      'every REQUIRED row states two different current outcomes'],
    ['D  recognized unknown + decision-INVARIANT -> FORBIDDEN',
      byForm('DECISION_INVARIANT_INSUFFICIENCY').length === 1
        && byForm('DECISION_INVARIANT_INSUFFICIENCY')[0].expectation.kind === 'FORBIDDEN', 'RB-F1'],
    ['E  INSUFFICIENT_EVIDENCE for a NON-decision-critical detail -> FORBIDDEN',
      byForm('NON_DECISION_CRITICAL_DETAIL').length === 1
        && byForm('NON_DECISION_CRITICAL_DETAIL')[0].expectation.kind === 'FORBIDDEN', 'RB-G1'],
    ['F  unknown already carried by one clarification -> no duplicate',
      /One question per fact/.test(sys), 'prompt rule B.8'],
    ['G  explicitly absent fact -> settled',
      byForm('EXPLICITLY_ABSENT').length === 1
        && byForm('EXPLICITLY_ABSENT')[0].expectation.kind === 'FORBIDDEN', 'RB-H1'],
    ['H  not visible / not observed + decision-critical -> remains unknown',
      /NOT OBSERVED IS NOT ABSENT/.test(sys)
        && UNSUPPORTED_SETTLEMENT_FIXTURES.some(f => f.absenceForm === 'NOT_VISIBLE'),
      '§149 v12 rule intact + US-A1 proved it hosted'],
    ['I  threshold fully settled -> silent',
      byForm('SETTLED_THRESHOLD').length === 1
        && byForm('SETTLED_THRESHOLD')[0].expectation.kind === 'FORBIDDEN'
        && byForm('SETTLED_THRESHOLD')[0].row.source.governedStandards.length > 0, 'RB-I1'],
    ['J  genuine deterministic derivation -> silent',
      byForm('TRUE_DETERMINISTIC_DERIVATION').length === 1
        && byForm('TRUE_DETERMINISTIC_DERIVATION')[0].expectation.kind === 'FORBIDDEN', 'RB-J1'],
  ];
  cases.forEach(([name, ok, where], i) => assert(ok, `M.${i + 1} case ${name}`, where));

  // ---- K and L are DETERMINISTIC and proved outright against the real normalizer.
  const control = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'REQUIRED_CONTROL',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(control).length === 1 && survivors(control)[0].relatesToCandidateKey === 'k1',
    'M.11 case K  ACTIVE candidate + valid REQUIRED_CONTROL clarification -> SURVIVES with its link');
  const contradiction = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(contradiction.state === 'VALID' && survivors(contradiction).length === 0
    && contradiction.issues.some(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'),
    'M.12 case L  ACTIVE candidate + TRUE contradiction -> REJECTED deterministically');
  assert(contradiction.validated!.analysis.expertHazardCandidates.length === 1,
    'M.12b and the candidate is KEPT — the §101/§105 direction, unchanged');

  // ---- M and N are the NEGATIVE cases the authorization requires the LOCAL TEST TO FAIL on. They
  //      are behavioural claims about a model, which no local test can decide -- so what is proved
  //      here is that the CONTRACT forbids them in terms. Saying otherwise would be the §140 mistake.
  assert(/A decision-critical unknown that reaches the reviewer only as a candidate state or a sentence of/
    .test(sys),
    'M.13 case M/N  uncertainty retained ONLY in explanation or candidate state is named as a '
    + 'FAILURE by the contract — the local proof available for a behavioural claim');
  assert(required.every(f => f.retention !== null),
    'M.13b and every REQUIRED row carries the retention key a hosted adjudicator scores it against');
}

// ===================================================================== R
section('R. the two §149 fixture defects are REPAIRED, not relabelled');
{
  // ---- US-D1: the observation presupposed the closure it withheld. The repaired analogue must not.
  const a1 = byForm('UNKNOWN_IS_THE_CANDIDATE')[0];
  // Checked against the §149 module rather than against a literal, so the assertion survives a
  // rename on either side and cannot be satisfied by a coincidence of naming.
  const v7ids = new Set(UNSUPPORTED_SETTLEMENT_FIXTURES.map(f => f.row.source.rowId));
  assert(a1.row.source.rowId === 'RB-A1' && F.every(f => !v7ids.has(f.row.source.rowId)),
    'R.1 no §149 row — US-D1 included — is reused as a scored row; RB-A1 is a fresh structural '
    + 'analogue', a1.row.source.rowId);
  const obs = a1.row.source.observation;
  // The defect was a DEFINITE ARTICLE presupposing a partitioned state ("the open lane"). The
  // repaired row must contain no such construction about the missing arrangement.
  assert(!/\bthe open\b|\bthe closed\b|\bthe other lane\b/i.test(obs),
    'R.1b and its observation contains no definite-article construction presupposing the missing '
    + 'arrangement — the exact defect US-D1 carried', obs.slice(0, 80));
  const gapWords = ['check-in', 'monitor', 'monitoring', 'lone-worker', 'lone worker', 'supervisor'];
  const leaked = gapWords.filter(w => obs.toLowerCase().includes(w.toLowerCase())
    && !obs.toLowerCase().includes('gas detector'));
  assert(!/check-in|lone-worker|monitoring arrangement|call schedule/i.test(obs),
    'R.1c and the missing arrangement is never named in the observation, in either direction',
    leaked.join(', '));
  assert(/no other person at the site/i.test(obs),
    'R.1d the row states PRESENCE at the location, which is a different fact from remote '
    + 'monitoring — the distinction the row exists to test');

  // ---- US-I1: the derivation needed an unstated premise about future conduct. The repair must not.
  const j1 = byForm('TRUE_DETERMINISTIC_DERIVATION')[0];
  assert(j1.row.source.rowId === 'RB-J1' && j1.expectation.kind === 'FORBIDDEN',
    'R.2 US-I1 leaves the FORBIDDEN denominator; RB-J1 replaces it', j1.row.source.rowId);
  const jobs = j1.row.source.observation;
  // The repair is that there is NOTHING TO RECONNECT: the motive element is physically absent AND
  // the text states positively that no other drive exists. Both halves are required — the first
  // alone was what US-I1 had, and it was not enough.
  assert(/physically removed/i.test(jobs) && /no other drive of any kind/i.test(jobs),
    'R.2b its derivation rests on the motive element being PHYSICALLY ABSENT *and* on a positive '
    + 'statement that no other drive exists — US-I1 had only the first half, which is why its '
    + 'conclusion needed an unstated premise about who might reconnect it');
  assert(/no motor, no electrical supply/i.test(jobs),
    'R.2c with the energy sources closed positively rather than by omission');
  assert(/Two roofers are working at the same level nearby/i.test(jobs),
    'R.2d and it deliberately keeps US-I1\'s "other people present" element, which changes nothing '
    + 'here because a person cannot restore a drive that is not there — so the row tests the '
    + 'repaired derivation rather than avoiding the question');
  const jt = (j1.expectation as unknown as { truth: { whatMakesItSettled: string } }).truth;
  assert(/NO added premise/i.test(jt.whatMakesItSettled),
    'R.2e and the row states its own derivation standard, so a future reader can check it');
}

// ===================================================================== C
section('C. the v8 set is structurally sound and confined');
{
  assert(F.length === 10 && F.length === RETENTION_BRIDGE_BUDGET.targetLogicalCalls,
    'C.1 ten rows, matching the frozen budget', String(F.length));
  assert(required.length === 5 && forbidden.length === 5,
    'C.1b five REQUIRED and five FORBIDDEN', `${required.length}/${forbidden.length}`);
  assert(new Set(F.map(f => f.domain)).size === 10, 'C.2 ten distinct domains');
  const prior = new Set([...CLARIFICATION_RECALL_FIXTURES, ...THRESHOLD_ARBITRATION_FIXTURES,
    ...UNSUPPORTED_SETTLEMENT_FIXTURES].map(f => f.domain));
  assert(F.every(f => !prior.has(f.domain)),
    'C.2b and provably distinct from the v5, v6 and v7 sets, checked against those modules',
    F.filter(f => prior.has(f.domain)).map(f => f.domain).join(', '));
  const ids = F.map(f => f.row.source.rowId);
  assert(ids.every(i => /^RB-[A-J]\d$/.test(i)) && new Set(ids).size === ids.length,
    'C.3 ids are fresh RB-* development ids and unique', ids.join(' '));
  const forms = new Set(F.map(f => f.retentionForm));
  assert(RETENTION_FORMS.every(a => forms.has(a)) && forms.size === RETENTION_FORMS.length,
    'C.4 every retention form appears exactly once — a miss names its own mechanism');

  // ---- THE PROPERTY THAT MAKES THIS A BRIDGE TEST RATHER THAN A NOTICING TEST.
  assert(required.every(f => f.unknownIsCandidateShaped),
    'C.5 EVERY REQUIRED row\'s unknown is CANDIDATE-SHAPED, so INSUFFICIENT_EVIDENCE is an '
    + 'available parking place and only the bridge can carry it to a question',
    required.filter(f => !f.unknownIsCandidateShaped).map(f => f.row.source.rowId).join(', '));
  assert(required.every(f => f.row.source.governedStandards.length === 0),
    'C.5b and NO REQUIRED row supplies a governed record, so v11\'s threshold limb cannot carry any '
    + 'of them either — the two drivers that rescued the §148/§149 successes are both absent',
    required.filter(f => f.row.source.governedStandards.length > 0)
      .map(f => f.row.source.rowId).join(', '));
  assert(required.every(f => f.retention !== null
    && f.retention.retainedFact.length > 30 && f.retention.retentionChannel.length > 40),
    'C.5c and each names the fact and the channel a hosted adjudicator scores RETAINED-BUT-NOT-ASKED '
    + 'against');
  assert(forbidden.every(f => f.retention === null),
    'C.5d while no FORBIDDEN row carries one, because nothing should be retained there');

  // ---- Label spread, so the set does not test one affectedDecision repeatedly.
  const labels = new Set(required.map(f => String(rtruth(f).affectedDecision)));
  assert(labels.size >= 3, 'C.6 the REQUIRED half spans at least three affectedDecision values',
    [...labels].join(', '));
  assert(required.every(f => rtruth(f).affectedDecision !== 'HAZARD_EXISTENCE'),
    'C.6b and none authors HAZARD_EXISTENCE, for the §148 reason');
  assert(required.every(f => (EXPERT_AFFECTED_DECISIONS as readonly string[])
    .includes(String(rtruth(f).affectedDecision))),
    'C.6c every authored label is in the frozen vocabulary');
  assert(required.every(f => rtruth(f).affectedDecision !== 'REGULATORY_INTERPRETATION'
    || f.row.source.governedStandards.length > 0),
    'C.6d REGULATORY_INTERPRETATION is never claimed without a supplied record');
  assert(required.every(f => f.row.truth.decisionCriticalGaps[0].affectedDecision
    === rtruth(f).affectedDecision),
    'C.6e and the row-truth gap agrees with the expectation truth');

  // ---- §140 DP-B4 and the §142 per-row-reason rule, applied unchanged.
  const bad = required.filter(f => {
    const t = rtruth(f);
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || String(t.outcomeA).trim() === String(t.outcomeB).trim();
  });
  assert(bad.length === 0,
    'C.7 every REQUIRED row names two answers AND two DIFFERENT current outcomes',
    bad.map(f => f.row.source.rowId).join(', '));
  assert(required.every(f => String(rtruth(f).whyNotEstablished).length >= 60),
    'C.7b and states at length why the text does not settle it');
  assert(forbidden.every(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return t.temptingQuestion.length > 10 && t.whyNotDecisionCritical.length > 60
      && t.whatMakesItSettled.length > 60;
  }), 'C.8 every FORBIDDEN row names the tempting question, a per-row reason and what settles it');
  assert(F.every(f => f.row.truth.decisionCriticalGaps.length
    === (f.expectation.kind === 'REQUIRED' ? 1 : 0)),
    'C.9 exactly one authored gap per REQUIRED row and none on any FORBIDDEN row');

  // ---- Candidate non-suppression must stay visible.
  assert(F.filter(f => f.hazardEstablished).length >= 4
    && F.filter(f => f.hazardEstablished).every(f => f.row.truth.presentHazardFamilies.length > 0),
    'C.10 rows that establish a hazard the model must still raise',
    F.filter(f => f.hazardEstablished).map(f => f.row.source.rowId).join(' '));
  assert(F.filter(f => f.hazardEstablished && f.expectation.kind === 'FORBIDDEN').length >= 1,
    'C.10b including a FORBIDDEN one, so "raise the hazard, ask nothing" stays testable');

  const incomplete = F.filter(f => validateCohortRow(f.row).length > 0);
  assert(incomplete.length === 0, 'C.11 every row satisfies the cohort row contract',
    incomplete.map(f => `${f.row.source.rowId}: ${validateCohortRow(f.row)
      .map(p => p.detail).join('; ')}`).join(' | '));
  const keys = new Set(F.flatMap(f => Object.keys(f)));
  assert(!keys.has('disagreement') && !keys.has('insight'),
    'C.12 the set authors NO disagreement or insight truth');

  assert(RETENTION_BRIDGE_BUDGET.hardProviderRequestCeiling === 10
    && RETENTION_BRIDGE_BUDGET.hardSpendCeilingUsd === 1.50
    && RETENTION_BRIDGE_BUDGET.arms.length === 1
    && RETENTION_BRIDGE_BUDGET.maxRetriesPerLogicalCall === 0,
    'C.13 the frozen budget matches the §150 authorization: 10 requests, $1.50, ONE arm, NO retries');
  assert(RETENTION_BRIDGE_GATES.strictRequiredRecall === 1.0
    && RETENTION_BRIDGE_GATES.maxRetainedButNotAsked === 0
    && RETENTION_BRIDGE_GATES.maxForbiddenViolations === 0
    && RETENTION_BRIDGE_GATES.maxUnsupportedSettlements === 0,
    'C.14 and the frozen gates are transcribed at 100% / zero, with RETAINED-BUT-NOT-ASKED as a '
    + 'first-class gate');
  assert(RETENTION_BRIDGE_FIXTURE_SET_VERSION.endsWith('.v8'),
    'C.15 the fixture set carries its own version, distinct from v5, v6 and v7');
}

// ===================================================================== T
section('T. §150 PHASE 6 — the corrected true-contradiction gate semantics');
{
  // The §149 gate required a REALIZED hosted contradiction, which needs the MODEL to emit
  // HAZARD_EXISTENCE naming its own ACTIVE candidate -- an error every prompt since v11 instructs
  // against. §150 corrects the evidence structure: the deterministic proof is REQUIRED and the
  // hosted denominator is OBSERVATIONAL.
  assert(RETENTION_BRIDGE_GATES.trueContradictionDeterministicProofRequired === true,
    'T.1 the deterministic rejection proof is REQUIRED by the frozen gates');
  assert(RETENTION_BRIDGE_GATES.hostedTrueContradictionIsObservational === true,
    'T.1b and the hosted denominator is declared OBSERVATIONAL rather than a pass/fail gate');
  assert(!Object.keys(RETENTION_BRIDGE_GATES).includes('trueContradictionRejection'),
    'T.1c with NO numeric hosted target, so a zero denominator is neither a failure nor a 100%');

  // And the proof itself, discharged here rather than referenced: M.12 rejects, M.11 retains, and
  // the three abstention conditions are each exercised so "fail-closed" is precise rather than
  // approximate.
  const unlinked = run({
    expertHazardCandidates: [cand({ assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE' })],
  });
  assert(survivors(unlinked).length === 1,
    'T.2 arbitration ABSTAINS with no declared link — §138\'s guessing cost, unchanged');
  const controlled = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'CONTROLLED' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(controlled).length === 1,
    'T.2b and requires the candidate to be ACTIVE — a CONTROLLED candidate contradicts nothing');
  const exposure = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'EXPOSURE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(exposure).length === 1,
    'T.2c and fires on HAZARD_EXISTENCE and nothing else — EXPOSURE was refused in §141 and still is');
}

// ===================================================================== L
section('L. the §149 raw-linkage instrument still reconciles — carried forward, not re-derived');
{
  // Re-run the §148 blind-spot shape against the shipped instrument, so a §150 edit that broke it
  // would fail here rather than on a $1.50 probe.
  const d = rawLinkageDiagnostics([{
    rowId: 'X1',
    wire: { candidates: [{ candidateKey: 'cand-real' }],
            clarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'haz-2' }] },
    normalizedClarifications: [{ relatesToCandidateKey: null }],
    issueCodes: ['CLARIFICATION_LINK_UNRESOLVED'],
  }]);
  assert(d.RAW_LINKAGE_ATTEMPTS === 1 && d.RAW_INVALID_LINKAGE_ATTEMPTS === 1
    && d.STRIPPED_INVALID_LINKAGES === 1 && d.reconciled === true,
    'L.1 the §148 blind-spot shape is still counted and still reconciles');
  const none = rawLinkageDiagnostics([{ rowId: 'H1', wire: null,
    normalizedClarifications: [], issueCodes: [] }]);
  assert(none.RAW_LINKAGE_ATTEMPTS === null && none.reconciled === null,
    'L.2 and a missing capture still yields NULL rather than zero — no history is back-inferred');

  // The production boundary is still non-destructive on a broken key.
  const real = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'ghost' })],
  });
  assert(survivors(real).length === 1 && survivors(real)[0].relatesToCandidateKey === null
    && real.issues.some(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED'),
    'L.3 the boundary still strips the key, KEEPS the question and records the issue');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
