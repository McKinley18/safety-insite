/**
 * EXPERT HAZLENZ -- §147. THE SETTLEMENT RULE, THE CLARIFICATION-RECALL REGRESSION SET, AND THE
 * REJECTION-DIAGNOSTIC REPAIR, frozen as deterministic contract tests.
 *
 * ==================== WHAT A ZERO-COST SUITE CAN AND CANNOT PROVE ====================
 *
 * It CANNOT prove that the model now asks the question. That is a behavioural claim about a hosted
 * provider and only a hosted probe settles it. Saying otherwise would be the §140 mistake in a new
 * costume: measuring the instrument and reporting it as the product.
 *
 * What it CAN prove, and does:
 *
 *   A  the v10 settlement semantics are actually PRESENT, in the system prompt AND the wire schema,
 *      and in the right ORDER -- "what counts as established" must precede the counterfactual test,
 *      because a test that asks what is missing is unanswerable while inference counts as evidence.
 *   B  the v9 PRECISION text is still there, every clause of it. This is the half of the suite that
 *      stops a recall repair from being bought with precision, and it is asserted needle by needle
 *      rather than by a version label.
 *   C  the regression set is structurally sound: every REQUIRED row carries two answers and two
 *      DIFFERENT current outcomes, every FORBIDDEN row states a per-row reason, all eight paired
 *      structures appear, the halves are balanced, and no §142 or §146 row is reused.
 *   D  a REQUIRED clarification SURVIVES the boundary end to end, and silence stays silence --
 *      nothing is fabricated into an empty collection.
 *   E  no regression on the axes this operation must not disturb: linkage precedence, governed
 *      abstention, citation containment, candidate routing.
 *   F  the §147 (P7) rejection diagnostic: the model's own offending quote is now recoverable,
 *      bounded, citation-redacted, absent from accepted output, and absent from the customer-facing
 *      layer detail.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No spent-cohort row is read or copied, and no
 * historical artifact is touched.
 */

import {
  EXPERT_INPUT_CONTRACT_VERSION, CITATION_SHAPED_PATTERN, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  stableStringify,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  normalizeExpertOutput, isFatal, offendingTextFor,
} from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import {
  CLARIFICATION_RECALL_FIXTURES, CLARIFICATION_RECALL_BUDGET, CLARIFICATION_RECALL_GATES,
  CLARIFICATION_STRUCTURES, CLARIFICATION_RECALL_FIXTURE_SET_VERSION,
} from '../src/safescope-v2/expert-hazlenz/fixtures/clarification-recall-probe-v5';
import { validateCohortRow } from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  THRESHOLD_ARBITRATION_FIXTURES, THRESHOLD_ARBITRATION_BUDGET, THRESHOLD_ARBITRATION_GATES,
  THRESHOLD_ARBITRATION_FIXTURE_SET_VERSION, PROBE_OPPORTUNITIES,
  type ThresholdShape, type ThresholdArbitrationFixture,
} from '../src/safescope-v2/expert-hazlenz/fixtures/threshold-arbitration-probe-v6';
import { EXPERT_AFFECTED_DECISIONS } from
  '../src/safescope-v2/expert-hazlenz/expert-contract.types';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const NOW = '2026-09-03T00:00:00.000Z';
const OBS = 'A pump was left running with its coupling guard removed while a fitter worked at the '
  + 'adjacent bench.';

function input(over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'r-1',
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
    inspectionContext: { location: 'Pump house', task: 'walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'electrical', 'lockout_tagout'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
    ...over,
  };
}
const wire = (over: Record<string, unknown> = {}) => ({
  outcome: 'ANALYZED',
  expertHazardCandidates: [], decisionCriticalClarifications: [],
  crossHazardInsights: [], disagreements: [],
  expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  ...over,
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
  whyItMatters: 'if proved stopped, the finding is the missing guard; if not, work stops now',
  affectedDecision: 'REQUIRED_CONTROL', criticality: 'BLOCKING',
  evidenceGap: 'the shaft state at the point of work is not stated',
  ...over,
});
const run = (over: Record<string, unknown>, inp = input()) =>
  normalizeExpertOutput(bindWireAnalysis(wire(over), inp).raw, inp, NOW);

const sys = EXPERT_SYSTEM_PROMPT;
const schemaText = stableStringify(buildExpertWireSchema(input()));

console.log('§147 CLARIFICATION SETTLEMENT CONTRACT — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== A
section('A. the v10 settlement semantics are present, and ordered');
{
  // §148 re-anchored v10 -> v11 for the settlement-threshold narrowing. The settlement rule itself
  // is unchanged and every clause of it is still asserted needle by needle below; only the third
  // ESTABLISHED bullet moved, and section A2 gates the replacement in both directions.
  // §149 re-anchored v11 -> v12 for the unsupported-settlement repair. Sections A2 and A3 still
  // gate the §148 semantics needle by needle, so this pin never carries the meaning on its own.
  // §150 re-anchored v12 -> v13 for the retention-bridge repair. Sections A2/A3 still gate the
  // §148 semantics needle by needle, so this pin never carries the meaning on its own.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'A.1 the prompt is v13 — bumped for the §150 retention-bridge repair',
    EXPERT_PROMPT_VERSION);

  assert(/WHAT COUNTS AS ESTABLISHED/.test(sys),
    'A.2 the system prompt states WHAT COUNTS AS ESTABLISHED');

  // ORDER IS THE POINT, not mere presence. The counterfactual test asks what is MISSING, and that
  // question is unanswerable while the model's own inference still counts as evidence.
  const iEstablished = sys.indexOf('WHAT COUNTS AS ESTABLISHED');
  const iTest = sys.indexOf('THE COUNTERFACTUAL TEST');
  assert(iEstablished > -1 && iTest > -1 && iEstablished < iTest,
    'A.3 it comes BEFORE the counterfactual test', `${iEstablished} vs ${iTest}`);

  assert(/ASSUMED the worse of two possible states/.test(sys),
    'A.4 worst-case assumption is named as NOT establishing the state (the EV-A4 mechanism)');
  assert(/RESEMBLE the ones it covers/.test(sys),
    'A.5 resemblance-to-a-programme is named as NOT establishing coverage (the LP-B2 mechanism)');
  assert(/A THRESHOLD IS NOT A GAP/.test(sys),
    'A.6 the threshold case is addressed, and §148 states the SETTLED reading first');
  assert(/is not thereby absent, and not thereby present/.test(sys),
    'A.7 an unmentioned fact is neither ruled in nor ruled out');
  assert(/THE ABSENCE IS USUALLY NOT ANNOUNCED/.test(sys),
    'A.8 the prompt states that most absences are not advertised by the text — the discriminating '
    + 'variable the root-cause reconstruction found');

  assert(/JUDGE SAMENESS AGAINST THE DECISION THIS FACT GOVERNS/.test(sys),
    'A.9 the invariance limb is SCOPED to the decision the fact governs (the EV-A2 mechanism)');
  assert(/already identified for a DIFFERENT[\s\S]{0,80}reason does not make these two answers equivalent/
    .test(sys),
    'A.10 an action already owed for another reason does not collapse the branches');

  assert(/THE SETTLEMENT CHECK/.test(sys), 'A.11 the settlement self-check exists');
  const iNoLoss = sys.indexOf('THE NO-LOSS RULE');
  const iCheck = sys.indexOf('THE SETTLEMENT CHECK');
  assert(iNoLoss > -1 && iCheck > iNoLoss,
    'A.12 it sits beside the NO-LOSS RULE, which it extends from ADMITTED gaps to RESOLVED ones');
  assert(/catches a gap you ADMITTED, and this[\s\S]{0,40}check is the only thing that catches one you RESOLVED/
    .test(sys),
    'A.13 and says exactly that, so the two rules are not read as duplicates');
  assert(/It does not excuse them from it/.test(sys),
    'A.14 the check FINDS candidates for the test; it does not bypass the test');

  // The interpretive gap EV-A6 fell into: the entry gate demanded a missing FACT while the
  // vocabulary offered REGULATORY_INTERPRETATION, which can be live when every measurement is known.
  assert(/an interpretive question can be live even when every measurement is known/.test(sys),
    'A.15 condition (b) now admits the interpretive case the affectedDecision vocabulary already had');

  // The wire schema carries the same semantics, because structured decoding attends to it.
  assert(/WHAT COUNTS AS MISSING/.test(schemaText),
    'A.16 the wire schema mirrors the settlement rule');
  assert(/WHAT COUNTS AS THE SAME OUTCOME/.test(schemaText),
    'A.17 and the scoped invariance rule');
  assert(/A value you supplied yourself/.test(schemaText),
    'A.18 evidenceGap says an inferred value counts as MISSING, not as known');
}

// ===================================================================== A2
section('A2. §148 — the threshold clause is CONJUNCTIVE and OPERATIVE, not illustrative');
{
  // ==================== WHAT THIS SECTION IS GATING, AND WHY ====================
  //
  // §147's CR-D1 is the defect: the model computed the record's band itself, wrote that 1,050 mm
  // "falls within the 965-1143 mm range... so on its face the guardrail appears compliant", and then
  // asked anyway. v10's clause qualified on "close to the value" OR "not measured on the same
  // basis". NEITHER held. A disjunction of two soft descriptions is satisfiable by any reading that
  // half-resembles either limb, so the clause reached a case with neither property.
  //
  // These assertions are DIRECTIONAL. They do not merely check that words changed: they check that
  // the SETTLED reading is stated FIRST and affirmatively, that reopening now requires BOTH limbs,
  // and that each of the four insufficient reasons is named. A future edit that restores a
  // disjunction, or drops an insufficiency, fails here rather than on a $2.00 hosted probe.

  const iEstablished = sys.indexOf('WHAT COUNTS AS ESTABLISHED');
  const iThreshold = sys.indexOf('A THRESHOLD IS NOT A GAP');
  const iTest2 = sys.indexOf('THE COUNTERFACTUAL TEST');
  assert(iThreshold > iEstablished && iThreshold < iTest2,
    'A2.1 the threshold clause sits inside WHAT COUNTS AS ESTABLISHED, before the test',
    `${iEstablished} < ${iThreshold} < ${iTest2}`);

  // The affirmative half. A threshold whose value, basis and side are all supplied is SETTLED, and
  // the model is told to finish the arithmetic rather than convert it into a question.
  assert(/A fact is not unresolved merely because a supplied record turns[\s\S]{0,40}on a stated value/
    .test(sys),
    'A2.2 a threshold existing is explicitly NOT a gap');
  assert(/IS ESTABLISHED for the decision it governs/.test(sys),
    'A2.3 and the three supplied things make the reading ESTABLISHED, stated positively');
  assert(/Do the[\s\S]{0,20}arithmetic, state the answer and move on/.test(sys),
    'A2.4 with an operative instruction rather than a description');
  // The two cases §147 proved must stay silent: a converted unit (CR-D1 is mm against inches) and a
  // threshold the facts FAIL (structure D). Neither is a reason to reopen.
  assert(/even where you had to[\s\S]{0,40}convert units or read a band/.test(sys),
    'A2.5 unit conversion does not unsettle a reading — CR-D1 converted mm to inches and was right');
  assert(/even where the answer is that the record is NOT met/.test(sys),
    'A2.6 and a threshold the facts FAIL is settled too, not only one they satisfy');

  // THE CONJUNCTION. This is the repair.
  assert(/It is unsettled ONLY where BOTH of these hold/.test(sys),
    'A2.7 reopening requires BOTH limbs — the v10 disjunction is gone');
  assert(/BOTH, never either/.test(sys),
    'A2.8 and the prompt says so in terms, so the limbs cannot be read as alternatives');
  assert(/\(i\)\s+something OBJECTIVE/.test(sys),
    'A2.9 limb (i) is an OBJECTIVE reason the value or basis is not the record\'s comparison');
  assert(/in the record itself -- gives a concrete reason/.test(sys),
    'A2.9b sourced to the observation, the findings or the record — never to the model\'s imagination');
  assert(/\(ii\) resolving that could put these facts on the OTHER SIDE of the line/.test(sys),
    'A2.10 limb (ii) requires the answer to be able to cross a decision-changing boundary');

  // THE FOUR INSUFFICIENCIES. Each is a move that was actually made or was available to be made.
  assert(/Proximity on a stated, matching basis is still[\s\S]{0,20}settled/.test(sys),
    'A2.11 PROXIMITY alone is insufficient — the CR-D1 defect, named');
  assert(/near the line is a side of the line/.test(sys),
    'A2.11b stated memorably enough to survive a paraphrase');
  assert(/its mere availability is not a reason/.test(sys),
    'A2.12 the mere EXISTENCE of another measurement basis is insufficient');
  assert(/you can IMAGINE measurement uncertainty the record and the observation do not report/
    .test(sys),
    'A2.13 IMAGINED measurement uncertainty is insufficient');
  assert(/a more exact figure could in principle be obtained[\s\S]{0,60}never a gap/.test(sys),
    'A2.14 and the availability of a more exact figure is insufficient');

  // The clause must not have been narrowed into uselessness. The two shapes that legitimately reopen
  // -- a different datum, and an aggregate the record itself demands -- must still be reachable,
  // because CR-E2 depends on the second one and CR-E2 is the recovery §147 proved.
  assert(/measures from a different[\s\S]{0,40}datum than the observation reports/.test(sys),
    'A2.15 a genuinely different DATUM is still a reason to reopen');
  assert(/requires a quantity the text never gives[\s\S]{0,60}such as an aggregate the record itself says to combine/
    .test(sys),
    'A2.16 and an AGGREGATE the record demands but the text withholds — the CR-E2 shape, preserved');

  // The wire schema carries the same narrowing, because structured decoding attends to it and the
  // §147 suite established that a semantics present in only one of the two places is not present.
  assert(/A THRESHOLD IS NOT A GAP/.test(schemaText),
    'A2.17 the wire schema mirrors the narrowed clause');
  assert(/It is unsettled only when BOTH/.test(schemaText),
    'A2.18 including the conjunction');
  assert(/Proximity to the boundary alone, the mere[\s\S]{0,60}existence of another measurement basis, imagined uncertainty/
    .test(schemaText),
    'A2.19 and all four insufficiencies');

  // NOT A REVERT. The other two settlement mechanisms are untouched by this narrowing.
  assert(/ASSUMED the worse of two possible states/.test(sys) && /RESEMBLE the ones it covers/.test(sys),
    'A2.20 the worst-case and resemblance mechanisms are UNTOUCHED — this narrows one bullet only');
}

// ===================================================================== A3
section('A3. §148 — affectedDecision routing, and the destructive consequence, are disclosed');
{
  // ==================== WHY THIS IS DISCLOSURE, NOT INSTRUCTION ====================
  //
  // §147's CR-F2 lost a substantively correct scope question to a HAZARD_EXISTENCE label on the
  // model's own ACTIVE candidate. §148 evaluated five policies and RETAINED the fail-closed
  // arbitration unchanged, repairing the label at the model instead. The one thing v10 never said is
  // what a wrong label COSTS: the producer was given the rule and never the consequence.
  //
  // Every assertion here is about a LABEL. None of them can raise the number of questions asked, and
  // A3.7 gates that property directly.

  assert(/BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST/.test(sys),
    'A3.1 the self-check against the model\'s own candidate list exists');
  assert(/you have already answered the existence question and[\s\S]{0,20}the label is wrong/.test(sys),
    'A3.2 and states why an ACTIVE candidate closes the existence question');

  // The four routes. CR-F2 needed the first of them.
  for (const [needle, label] of [
    ['zone or control framework reaches these facts at all', 'APPLICABILITY (the CR-F2 route)'],
    ['whether a control was applied, or which one is required', 'REQUIRED_CONTROL'],
    ['who or what is actually exposed', 'EXPOSURE'],
    ['what a SUPPLIED record means or how its stated conditions apply', 'REGULATORY_INTERPRETATION'],
  ] as const) {
    assert(sys.includes(needle), `A3.3 the mislabelled case routes to ${label}`);
  }

  assert(/THE LABEL IS LOAD-BEARING, AND A WRONG ONE DESTROYS THE QUESTION/.test(sys),
    'A3.4 the CONSEQUENCE is disclosed — the part v10 never said');
  assert(/DISCARDED IN FULL/.test(sys) && /the reviewer never sees it/.test(sys),
    'A3.5 in terms: the whole clarification is lost, not merely the label');
  assert(/The[\s\S]{0,20}candidate is kept; only the question is lost/.test(sys),
    'A3.6 and the DIRECTION is stated too — a hazard is never suppressed to tidy an output');

  // The property that makes this safe to ship: it cannot buy recall with precision, because it adds
  // no reason to ask. If a future edit turns it into one, this fails.
  assert(/This is not a reason to ask MORE questions, and it never lowers the test in 2/.test(sys),
    'A3.7 and it says in terms that it adds no reason to ask — it only redirects a label');

  assert(/BEFORE WRITING HAZARD_EXISTENCE, re-read your own candidate list/.test(schemaText),
    'A3.8 the wire schema carries the same self-check');
  assert(/DISCARDED IN FULL and the reviewer never sees it/.test(schemaText),
    'A3.9 and the same consequence');
}

// ===================================================================== B
section('B. the v9 precision text survives intact — the repair is not bought with precision');
{
  assert(/THIS LIST STARTS EMPTY AND STAYS EMPTY/.test(sys),
    'B.1 the list still starts empty');
  assert(/The burden is on asking, never on staying silent/.test(sys),
    'B.2 the burden still sits on asking');
  assert(/This does NOT lower the bar/.test(sys),
    'B.3 the new block says in terms that it does not lower the bar');
  assert(/An unestablished fact whose answers all[\s\S]{0,40}lead to the same action today is still silence/
    .test(sys),
    'B.4 and that an unestablished fact is not thereby a question');

  const sevenShapes = [
    'merely useful to know', 'best-practice follow-up', 'documentation, records or paperwork',
    'historical context', 'severity refinement', 'routine due diligence',
    'unrelated secondary hazard',
  ];
  const missing = sevenShapes.filter(s => !sys.includes(s));
  assert(missing.length === 0,
    'B.5 all seven NOT-DECISION-CRITICAL shapes are still listed', missing.join(', '));

  assert(/COVERAGE HABIT/.test(sys), 'B.6 the coverage-habit warning survives');
  assert(/by that very[\s\S]{0,20}genericness, not decision-critical/.test(sys),
    'B.7 and the genericness rule with it');
  assert(/ALL FIVE hold/.test(sys), 'B.8 the counterfactual test is still all five conditions');
  assert(/If you cannot write[\s\S]{0,20}both, the question is not decision-critical/.test(schemaText),
    'B.9 whyItMatters still refuses a question whose two branches cannot be written');
  assert(/EMPTY BY DEFAULT/.test(schemaText), 'B.10 the schema still says EMPTY BY DEFAULT');
  assert(/coverage habit and is wrong/.test(schemaText),
    'B.11 and still names the coverage habit as wrong');
}

// ===================================================================== C
section('C. the regression set is structurally sound');
{
  const F = CLARIFICATION_RECALL_FIXTURES;
  assert(F.length === CLARIFICATION_RECALL_BUDGET.targetLogicalCalls && F.length === 10,
    'C.1 ten rows, matching the frozen budget', String(F.length));

  const required = F.filter(f => f.expectation.kind === 'REQUIRED');
  const forbidden = F.filter(f => f.expectation.kind === 'FORBIDDEN');
  assert(required.length === 5 && forbidden.length === 5,
    'C.2 the halves are BALANCED — a repair that fires everywhere is not a repair',
    `${required.length} required / ${forbidden.length} forbidden`);

  const structures = new Set(F.map(f => f.structure));
  const missingStructures = CLARIFICATION_STRUCTURES.filter(s => !structures.has(s));
  assert(missingStructures.length === 0,
    'C.3 all eight paired semantic structures are represented',
    missingStructures.join(', '));

  const domains = new Set(F.map(f => f.domain));
  assert(domains.size === F.length,
    'C.4 ten distinct domains — the set is not over-sampled on one family', String(domains.size));

  // §140's DP-B4: an authored gap whose two answers lead to the SAME action is a fixture defect,
  // and the model was right to refuse it. Every REQUIRED row must survive its own counterfactual.
  const badCounterfactual = required.filter(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || t.answerA.trim() === t.answerB.trim() || t.outcomeA.trim() === t.outcomeB.trim();
  });
  assert(badCounterfactual.length === 0,
    'C.5 every REQUIRED row names two answers AND two DIFFERENT current outcomes',
    badCounterfactual.map(f => f.row.source.rowId).join(', '));

  const noWhy = required.filter(f =>
    ((f.expectation as unknown as { truth: { whyNotEstablished: string } }).truth
      .whyNotEstablished ?? '').length < 40);
  assert(noWhy.length === 0,
    'C.6 and states why the observation, findings and any record do NOT settle it',
    noWhy.map(f => f.row.source.rowId).join(', '));

  // §142: no blanket labels. Every FORBIDDEN row owes a per-row reason, not a category name.
  const blanket = forbidden.filter(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return !t.temptingQuestion || (t.whyNotDecisionCritical ?? '').length < 60;
  });
  assert(blanket.length === 0,
    'C.7 every FORBIDDEN row names the tempting question and a per-row reason, never a blanket label',
    blanket.map(f => f.row.source.rowId).join(', '));

  // The established defect is the UNMARKED absence. If every REQUIRED row announced its own gap,
  // the probe would re-measure what v9 already passes and prove nothing about the repair.
  const unmarked = required.filter(f =>
    (f.expectation as unknown as { truth: { absenceIsUnmarked: boolean } }).truth.absenceIsUnmarked);
  assert(unmarked.length >= 3,
    'C.8 at least three REQUIRED rows mark the absence NOWHERE — the established defect shape',
    `${unmarked.length}: ${unmarked.map(f => f.row.source.rowId).join(', ')}`);

  // ...and at least one announced case, so a regression on the EASY shape stays visible.
  assert(required.some(f =>
    !(f.expectation as unknown as { truth: { absenceIsUnmarked: boolean } })
      .truth.absenceIsUnmarked),
    'C.9 and at least one ANNOUNCED case, as a non-regression control on what v9 already recovers');

  // The two settlement moves the hosted evidence actually caught must both be on the probe.
  const temptations = new Set(F.map(f => f.temptation));
  assert(temptations.has('RESEMBLANCE_TO_A_PROGRAMME')
    && temptations.has('THRESHOLD_ACROSS_INCOMPARABLE_BASES')
    && (temptations.has('BENIGN_ASSUMPTION') || temptations.has('WORST_CASE_ASSUMPTION')),
    'C.10 the three caught settlement mechanisms are each represented',
    [...temptations].join(', '));

  // C and D are the anti-overcorrection pair, and they only work with a supplied record.
  const thresholdControls = F.filter(f =>
    f.structure === 'C_KNOWN_THRESHOLD_SATISFIED'
    || f.structure === 'D_KNOWN_THRESHOLD_NOT_SATISFIED');
  assert(thresholdControls.length === 2
    && thresholdControls.every(f => f.row.source.governedStandards.length > 0
      && f.expectation.kind === 'FORBIDDEN'),
    'C.11 both settled-threshold controls supply a record and must stay SILENT');

  // Every REQUIRED row citing REGULATORY_INTERPRETATION must actually have a record to interpret.
  const interp = required.filter(f =>
    (f.expectation as unknown as { truth: { affectedDecision: string } }).truth.affectedDecision
      === 'REGULATORY_INTERPRETATION');
  assert(interp.every(f => f.row.source.governedStandards.length > 0),
    'C.12 REGULATORY_INTERPRETATION is never claimed without a SUPPLIED record',
    interp.map(f => f.row.source.rowId).join(', '));

  // Truth must not exceed the observation: a forbidden family may not also be asserted present.
  const contradictory = F.filter(f => {
    const t = f.row.truth;
    return t.forbiddenHazardFamilies.some(x => t.presentHazardFamilies.includes(x)
      || t.defensibleHazardFamilies.includes(x));
  });
  assert(contradictory.length === 0,
    'C.13 no row asserts a family as both forbidden and present or defensible',
    contradictory.map(f => f.row.source.rowId).join(', '));

  const familyEscape = F.filter(f => {
    const allowed = new Set(f.row.source.allowedHazardFamilies);
    const t = f.row.truth;
    return [...t.presentHazardFamilies, ...t.defensibleHazardFamilies, ...t.forbiddenHazardFamilies,
      ...t.negatedOrSafeStateFamilies].some(x => !allowed.has(x));
  });
  assert(familyEscape.length === 0,
    'C.14 every family named in truth is inside the row\'s allowed vocabulary',
    familyEscape.map(f => f.row.source.rowId).join(', '));

  // The COMPLEMENT of C.14, and it caught six real fixture defects on this set's first dry run:
  // every allowed family must land in a partition bucket, and negatedOrSafeState is an independent
  // OVERLAY rather than a fourth bucket, so a family recorded there still needs a partition home.
  const incomplete = F.filter(f => validateCohortRow(f.row).length > 0);
  assert(incomplete.length === 0,
    'C.14b and every allowed family lands in a partition bucket (the row contract agrees)',
    incomplete.map(f => `${f.row.source.rowId}: ${validateCohortRow(f.row).map(p => p.detail)
      .join('; ')}`).join(' | '));

  // Confinement: no §142 or §146 row is reused, and the ids are fresh.
  const ids = F.map(f => f.row.source.rowId);
  assert(ids.every(i => /^CR-[A-H]\d$/.test(i)) && new Set(ids).size === ids.length,
    'C.15 ids are fresh CR-* development ids and unique', ids.join(' '));

  // Only REQUIRED rows may carry authored gaps, and exactly one each — retention must be unambiguous.
  const gapMismatch = F.filter(f => f.expectation.kind === 'REQUIRED'
    ? f.row.truth.decisionCriticalGaps.length !== 1
    : f.row.truth.decisionCriticalGaps.length !== 0);
  assert(gapMismatch.length === 0,
    'C.16 exactly one authored gap on each REQUIRED row and none on any FORBIDDEN row',
    gapMismatch.map(f => f.row.source.rowId).join(', '));

  // §146 authored disagreement truth blind to deterministic output and the measure came out VOID.
  // This set does not repeat that: it authors no disagreement or insight truth at all.
  const keys = new Set(F.flatMap(f => Object.keys(f)));
  assert(!keys.has('disagreement') && !keys.has('insight'),
    'C.17 the set authors NO disagreement or insight truth — §146 proved that denominator invalid',
    [...keys].join(', '));

  assert(CLARIFICATION_RECALL_BUDGET.hardProviderRequestCeiling === 12
    && CLARIFICATION_RECALL_BUDGET.hardSpendCeilingUsd === 2.00
    && CLARIFICATION_RECALL_BUDGET.arms.length === 1,
    'C.18 the frozen budget matches the authorization: 12 requests, $2.00, ONE arm');
  assert(CLARIFICATION_RECALL_GATES.strictRequiredRecall === 1.0
    && CLARIFICATION_RECALL_GATES.maxForbiddenViolations === 0,
    'C.19 the frozen gates are STRICT recall 100% and zero forbidden violations');
  assert(CLARIFICATION_RECALL_FIXTURE_SET_VERSION.endsWith('.v5'),
    'C.20 the fixture set carries its own version, distinct from the spent v4 set');
}

// ===================================================================== C2
section('C2. §148 — the v6 threshold/arbitration set covers the nine required local cases');
{
  // ==================== WHAT A ZERO-COST SUITE CAN PROVE ABOUT A HOSTED SET ====================
  //
  // Not that the model behaves. That is a $2.00 claim and section headers in this file have said so
  // since §147. What it proves is that the set is CAPABLE of discriminating: that each of the nine
  // local cases the authorization enumerates is actually present, that the halves are balanced, that
  // every REQUIRED row survives its own counterfactual, and -- the one that matters most for
  // Workstream A -- that the FORBIDDEN threshold controls between them remove every foothold the
  // over-firing clause could reach for. A set that omitted the near-boundary control would report
  // success on the exact defect it was built to catch.

  const F = THRESHOLD_ARBITRATION_FIXTURES;
  const byShape = (s: ThresholdShape) => F.filter(f => f.thresholdShape === s);
  const required = F.filter(f => f.expectation.kind === 'REQUIRED');
  const forbidden = F.filter(f => f.expectation.kind === 'FORBIDDEN');
  const rtruth = (f: ThresholdArbitrationFixture) =>
    (f.expectation as unknown as { truth: Record<string, string | boolean> }).truth;

  assert(F.length === 10 && F.length === THRESHOLD_ARBITRATION_BUDGET.targetLogicalCalls,
    'C2.1 ten rows, matching the frozen budget', String(F.length));
  assert(required.length === 5 && forbidden.length === 5,
    'C2.2 the halves are BALANCED — a narrowing that silences everything is not a narrowing',
    `${required.length}/${forbidden.length}`);
  assert(new Set(F.map(f => f.domain)).size === 10,
    'C2.3 ten distinct domains, none reused from the §147 v5 set');
  const v5domains = new Set(CLARIFICATION_RECALL_FIXTURES.map(f => f.domain));
  assert(F.every(f => !v5domains.has(f.domain)),
    'C2.3b and provably distinct from v5, checked against the v5 module rather than asserted',
    F.filter(f => v5domains.has(f.domain)).map(f => f.domain).join(', '));

  // ---- THE NINE LOCAL CASES THE AUTHORIZATION ENUMERATES, each located by STRUCTURE.
  const nine: Array<[string, boolean, string]> = [
    ['a clearly settled BELOW-threshold case',
      byShape('SETTLED_BELOW').length === 1 && byShape('SETTLED_BELOW')[0].expectation.kind === 'FORBIDDEN',
      'TR-B1'],
    ['a clearly settled ABOVE-threshold case, where the record BITES and its demand is met',
      byShape('SETTLED_ABOVE').length === 1 && byShape('SETTLED_ABOVE')[0].expectation.kind === 'FORBIDDEN',
      'TR-B2'],
    ['a CLOSE-to-threshold but fully settled case — the CR-D1 analog',
      byShape('SETTLED_NEAR_BOUNDARY').length === 1
        && byShape('SETTLED_NEAR_BOUNDARY')[0].expectation.kind === 'FORBIDDEN', 'TR-B3'],
    ['a genuinely ambiguous MEASUREMENT-BASIS case that must still ask',
      byShape('BASIS_AMBIGUOUS').length === 1
        && byShape('BASIS_AMBIGUOUS')[0].expectation.kind === 'REQUIRED', 'TR-C1'],
    ['genuine measurement uncertainty CAPABLE OF CROSSING the threshold',
      byShape('AGGREGATE_MISSING').length === 1
        && byShape('AGGREGATE_MISSING')[0].expectation.kind === 'REQUIRED', 'TR-C2'],
    ['a different measurement concept that exists but is IRRELEVANT',
      byShape('IRRELEVANT_CONCEPT').length === 1
        && byShape('IRRELEVANT_CONCEPT')[0].expectation.kind === 'FORBIDDEN', 'TR-B4'],
    ['an UNMARKED missing fact that must still survive',
      required.filter(f => rtruth(f).absenceIsUnmarked === true).length >= 3, 'TR-A1/C2/E1'],
    ['an observation-ADVERTISED missing fact that must survive',
      required.some(f => rtruth(f).absenceIsUnmarked === false), 'TR-C1/D1'],
    ['an unknown but DECISION-INVARIANT fact that must remain silent',
      forbidden.some(f => f.thresholdShape === 'NONE'), 'TR-F1'],
  ];
  nine.forEach(([name, ok, where], i) =>
    assert(ok, `C2.4.${i + 1} ${name}`, where));

  // ---- THE ANTI-OVERCORRECTION PROPERTY. Four settled controls, each removing ONE foothold.
  const settled = F.filter(f => f.thresholdShape.startsWith('SETTLED_')
    || f.thresholdShape === 'IRRELEVANT_CONCEPT');
  assert(settled.length === 4 && settled.every(f => f.expectation.kind === 'FORBIDDEN'
    && f.row.source.governedStandards.length > 0),
    'C2.5 all FOUR settled-threshold controls supply a record and must stay SILENT',
    settled.map(f => f.row.source.rowId).join(' '));
  assert(settled.every(f => String((f.expectation as unknown as
    { truth: { whatMakesItSettled: string } }).truth.whatMakesItSettled).length > 80),
    'C2.5b and each states the value, the basis and the side that make it settled — so a violation '
    + 'names the missing element instead of being counted');

  // ---- AND THE PROPERTY THAT STOPS THE NARROWING BECOMING A REVERT.
  const live = F.filter(f => f.thresholdShape === 'BASIS_AMBIGUOUS'
    || f.thresholdShape === 'AGGREGATE_MISSING');
  assert(live.length === 2 && live.every(f => f.expectation.kind === 'REQUIRED'
    && f.row.source.governedStandards.length > 0),
    'C2.6 and BOTH genuinely live threshold rows supply a record and must still ASK — this is what '
    + 'distinguishes a narrowing from a revert', live.map(f => f.row.source.rowId).join(' '));

  // ---- THE ARBITRATION ROWS. Neither may author HAZARD_EXISTENCE as the owed label: on a row whose
  //      hazard the text ESTABLISHES, an existence question is the contradiction, not the answer.
  const arb = F.filter(f => f.opportunity === 'D_ACTIVE_CANDIDATE_DIFFERENT_AFFECTED_DECISION'
    || f.opportunity === 'E_EXISTENCE_CONTRADICTION_OPPORTUNITY');
  assert(arb.length === 2,
    'C2.7 both arbitration opportunity rows are present', arb.map(f => f.row.source.rowId).join(' '));
  assert(arb.every(f => f.expectation.kind === 'REQUIRED'
    && rtruth(f).affectedDecision !== 'HAZARD_EXISTENCE'),
    'C2.7b and neither authors HAZARD_EXISTENCE as the owed label — on a row whose hazard the text '
    + 'establishes, an existence question IS the contradiction',
    arb.map(f => `${f.row.source.rowId}=${String(rtruth(f).affectedDecision)}`).join(' '));
  assert(arb.every(f => f.row.truth.presentHazardFamilies.length > 0 && f.arbitrationExposed),
    'C2.7c and both assert a PRESENT hazard family, so an ACTIVE candidate is the expected output '
    + 'and the clarification really does land beside one');
  assert(F.filter(f => f.existenceContradictionTemptation).length === 1,
    'C2.7d exactly one row carries the existence-contradiction temptation, and it is scored as an '
    + 'EXERCISE — a true contradiction requires the model to err and cannot be commissioned');

  // ---- The §147 truth-quality gates, applied unchanged. A new fixture set does not get new rules.
  const badCounterfactual = required.filter(f => {
    const t = rtruth(f);
    return !t.missingFact || !t.answerA || !t.answerB || !t.outcomeA || !t.outcomeB
      || String(t.outcomeA).trim() === String(t.outcomeB).trim();
  });
  assert(badCounterfactual.length === 0,
    'C2.8 every REQUIRED row names two answers AND two DIFFERENT current outcomes (§140 DP-B4)',
    badCounterfactual.map(f => f.row.source.rowId).join(', '));
  assert(required.every(f => String(rtruth(f).whyNotEstablished).length >= 40),
    'C2.8b and states why the observation, findings and record do NOT settle it');
  assert(forbidden.every(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return t.temptingQuestion.length > 10 && t.whyNotDecisionCritical.length > 60;
  }), 'C2.9 every FORBIDDEN row names the tempting question and a per-row reason, never a label');
  assert(F.every(f => f.row.truth.decisionCriticalGaps.length
    === (f.expectation.kind === 'REQUIRED' ? 1 : 0)),
    'C2.10 exactly one authored gap per REQUIRED row and none on any FORBIDDEN row');
  assert(required.every(f => rtruth(f).affectedDecision !== 'REGULATORY_INTERPRETATION'
    || f.row.source.governedStandards.length > 0),
    'C2.11 REGULATORY_INTERPRETATION is never claimed without a SUPPLIED record');
  assert(required.every(f => (EXPERT_AFFECTED_DECISIONS as readonly string[])
    .includes(String(rtruth(f).affectedDecision))),
    'C2.11b and every authored label is in the frozen vocabulary');
  assert(required.every(f => f.row.truth.decisionCriticalGaps[0].affectedDecision
    === rtruth(f).affectedDecision),
    'C2.11c and the row-truth gap agrees with the expectation truth — one label per row, not two',
    required.map(f => `${f.row.source.rowId}:${f.row.truth.decisionCriticalGaps[0].affectedDecision}`)
      .join(' '));

  // The row-contract completeness check that caught six real defects on the v5 set's first dry run.
  const incomplete = F.filter(f => validateCohortRow(f.row).length > 0);
  assert(incomplete.length === 0,
    'C2.12 every row satisfies the cohort row contract — families partition, life-critical implies '
    + 'present, gap ids unique',
    incomplete.map(f => `${f.row.source.rowId}: ${validateCohortRow(f.row).map(p => p.detail)
      .join('; ')}`).join(' | '));

  const ids = F.map(f => f.row.source.rowId);
  assert(ids.every(i => /^TR-[A-F]\d$/.test(i)) && new Set(ids).size === ids.length,
    'C2.13 ids are fresh TR-* development ids and unique', ids.join(' '));
  const keys = new Set(F.flatMap(f => Object.keys(f)));
  assert(!keys.has('disagreement') && !keys.has('insight'),
    'C2.14 the set authors NO disagreement or insight truth — §146 proved that denominator invalid');

  // ---- The frozen budget and gates, transcribed from the authorization rather than chosen here.
  assert(THRESHOLD_ARBITRATION_BUDGET.hardProviderRequestCeiling === 12
    && THRESHOLD_ARBITRATION_BUDGET.hardSpendCeilingUsd === 2.00
    && THRESHOLD_ARBITRATION_BUDGET.arms.length === 1,
    'C2.15 the frozen budget matches the §148 authorization: 12 requests, $2.00, ONE arm');
  assert(THRESHOLD_ARBITRATION_GATES.strictRequiredRecall === 1.0
    && THRESHOLD_ARBITRATION_GATES.maxForbiddenViolations === 0
    && THRESHOLD_ARBITRATION_GATES.affectedDecisionSurvival === 1.0
    && THRESHOLD_ARBITRATION_GATES.trueContradictionRejection === 1.0,
    'C2.16 and the four frozen hosted gates are transcribed at 100% / zero, as authorized');
  assert(THRESHOLD_ARBITRATION_FIXTURE_SET_VERSION.endsWith('.v6'),
    'C2.17 the fixture set carries its own version, distinct from the spent v5 set');

  // Every one of the six opportunity classes the authorization requires must actually be supplied.
  const opportunities = new Set(F.map(f => f.opportunity));
  const missingOpps = PROBE_OPPORTUNITIES.filter(o => !opportunities.has(o));
  assert(missingOpps.length === 0,
    'C2.18 all six authorized probe-content opportunity classes are supplied',
    missingOpps.join(', '));
}

// ===================================================================== D
section('D. a REQUIRED clarification survives the boundary, and silence stays silence');
{
  const kept = run({ expertHazardCandidates: [cand()], decisionCriticalClarifications: [clar()] });
  assert(kept.state === 'VALID', 'D.1 a well-formed clarification is accepted');
  assert((kept.validated?.analysis.decisionCriticalClarifications ?? []).length === 1,
    'D.2 and SURVIVES to the validated analysis');
  assert(kept.issues.length === 0, 'D.3 with no issue recorded against it');

  // The linkage repair must keep the QUESTION even when the key is unresolvable.
  const broken = run({
    expertHazardCandidates: [cand()],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'no-such-key' })],
  });
  assert(broken.state === 'VALID'
    && (broken.validated?.analysis.decisionCriticalClarifications ?? []).length === 1,
    'D.4 an unresolvable link strips the key and KEEPS the question');
  assert(broken.issues.some(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED'),
    'D.5 and records the broken link against it');

  const silent = run({ expertHazardCandidates: [cand()] });
  assert(silent.state === 'VALID'
    && (silent.validated?.analysis.decisionCriticalClarifications ?? []).length === 0,
    'D.6 silence stays silence — nothing is fabricated into an empty collection');

  const nothing = run({ outcome: 'NOTHING_TO_ADD' });
  assert(nothing.state === 'VALID'
    && (nothing.validated?.analysis.decisionCriticalClarifications ?? []).length === 0,
    'D.7 and NOTHING_TO_ADD remains a legal, empty answer');
}

// ===================================================================== E
section('E. no regression on the axes this operation must not disturb');
{
  // §143/§145 linkage precedence, asserted here too because a prompt edit is how it would be lost.
  assert(/what the question DOES to a candidate decides/.test(sys),
    'E.1 the linkage governing principle is intact');
  assert(/TEST 1 --/.test(sys) && /TEST 2 --/.test(sys) && /TEST 3 --/.test(sys),
    'E.2 the three ordered linkage tests are intact');
  assert(/"Generic" is the word that matters/.test(sys),
    'E.3 and the clause §143 repaired');

  // §139 governed abstention.
  assert(/governed record/i.test(sys), 'E.4 governed-record handling is still addressed');

  // Citation containment is still FATAL, not softened.
  assert(isFatal('CITATION_SHAPED_TEXT_NOT_PERMITTED'),
    'E.5 citation-shaped text is still an ANALYSIS-FATAL refusal');
  const smuggled = run({ expertExplanation: { summary: 'as required by 29 CFR 1910.212' } });
  assert(smuggled.state === 'REJECTED'
    && smuggled.issues.some(i => i.code === 'CITATION_SHAPED_TEXT_NOT_PERMITTED'),
    'E.6 and a citation smuggled into prose is still refused');
  assert(!CITATION_SHAPED_PATTERN.test(sys),
    'E.7 the system prompt itself still contains no citation-shaped text');

  // Candidate routing: the four typed lists are still separately described.
  assert(/1\. PLAUSIBLE HAZARDS/.test(sys) && /3\. CONDITIONS THAT ARE WORSE TOGETHER/.test(sys)
    && /4\. CHALLENGES TO THE AUTHORITATIVE RESULT/.test(sys),
    'E.8 candidate, insight and disagreement routing is untouched');
  assert(/6\. UNCERTAINTY/.test(sys)
    && /If an uncertainty can be phrased as a question that would/.test(sys),
    'E.9 the uncertainty overflow rule is untouched');

  // A candidate is still refused for an unbindable quote. The §146 boundary behaviour is unchanged.
  const badQuote = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: 'a sentence that is not in the observation' }],
    })],
  });
  assert(badQuote.state === 'REJECTED'
    && badQuote.issues.some(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS'),
    'E.10 an unbindable quote is still fatal — the repair is observability, not permissiveness');
}

// ===================================================================== F
section('F. §147 (P7) the rejection diagnostic — a condemned output is now diagnosable');
{
  const QUOTE = 'a sentence that is nowhere in the observation text';
  const r = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: QUOTE }],
    })],
  });
  const issue = r.issues.find(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS');

  // §146 lost a whole row to exactly this code and could not say WHAT was quoted.
  assert(issue?.offendingText === QUOTE,
    'F.1 the offending quote is now recorded verbatim on the issue', String(issue?.offendingText));
  assert(r.state === 'REJECTED' && r.validated === null,
    'F.2 and the analysis is still condemned — nothing was made acceptable by being diagnosable');

  const long = 'x'.repeat(500);
  const rLong = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: long }],
    })],
  });
  const iLong = rLong.issues.find(i => i.code === 'EVIDENCE_OUT_OF_BOUNDS');
  assert((iLong?.offendingText ?? '').length < 300 && /\+260 chars/.test(iLong?.offendingText ?? ''),
    'F.3 it is BOUNDED, and says how much was clipped — a diagnostic, never a copy of the payload',
    String((iLong?.offendingText ?? '').length));

  // Citation containment holds by ORDER, and this is the honest way to say so. The payload-wide
  // citation scan condemns the analysis BEFORE any evidence is validated, so a citation-shaped quote
  // never reaches the diagnostic at all -- and the diagnostic is therefore never the thing that
  // would leak one.
  const cited = 'the requirement at 29 CFR 1910.212(a)(1) applies to this guard';
  const rCited = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: cited }],
    })],
  });
  assert(rCited.state === 'REJECTED'
    && rCited.issues.some(i => i.code === 'CITATION_SHAPED_TEXT_NOT_PERMITTED'),
    'F.4 a citation-shaped quote is condemned by the payload-wide scan, before the evidence path');
  assert(rCited.issues.every(i => !CITATION_SHAPED_PATTERN.test(i.offendingText ?? '')),
    'F.4b so no issue from that rejection carries citation-shaped text');

  // The redaction inside the diagnostic is therefore a SECOND line, unreachable in the current
  // order. It is tested directly rather than trusted, because a guard nobody can exercise is a
  // guard nobody can rely on after a future reordering.
  assert(!CITATION_SHAPED_PATTERN.test(offendingTextFor(cited) ?? '')
    && /CITATION REDACTED/.test(offendingTextFor(cited) ?? ''),
    'F.4c and it does redact, proved on the helper itself', String(offendingTextFor(cited)));
  assert(offendingTextFor('') === undefined && offendingTextFor(undefined) === undefined
    && offendingTextFor(42) === undefined,
    'F.4d a non-string or empty value yields no field at all, rather than an empty one');

  // It cannot contaminate accepted output: all three evidence codes are analysis-fatal, so a
  // populated field implies validated === null. Proved rather than asserted.
  for (const code of ['EVIDENCE_SOURCE_UNKNOWN', 'EVIDENCE_OUT_OF_BOUNDS',
    'EVIDENCE_TEXT_MISMATCH'] as const) {
    assert(isFatal(code), `F.5 ${code} is analysis-fatal, so offendingText implies no accepted output`);
  }
  const clean = run({ expertHazardCandidates: [cand()] });
  assert(clean.state === 'VALID' && clean.issues.every(i => i.offendingText === undefined),
    'F.6 no accepted analysis carries an offendingText field');

  // An unknown source id names a source, not a quote, and must still carry the quote for diagnosis.
  const rSrc = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'not-a-source', quotedText: 'some text' }],
    })],
  });
  assert(rSrc.issues.find(i => i.code === 'EVIDENCE_SOURCE_UNKNOWN')?.offendingText === 'some text',
    'F.7 an unknown-source refusal is diagnosable too');

  // The customer-facing layer detail is codes only. The diagnostic stays internal by construction.
  assert(!JSON.stringify(r.validated).includes(QUOTE),
    'F.8 the offending text never reaches a validated analysis');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
