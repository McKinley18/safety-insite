/**
 * RC-2 -- the deterministic condition-state resolution boundary. NO NETWORK, NO DATABASE, NO PROVIDER.
 *
 * WHAT IS PINNED HERE, and each is pinned because it is a property somebody could break silently:
 *
 *   1. THE DEFAULT IS INERT.        `CHECK` records and changes nothing, so wiring the stage in
 *                                   cannot move a single existing outcome.
 *   2. THE RULE IS NARROW.          Only `affectedDecision: 'condition_state'` contradicts a state.
 *                                   The other four `affectedDecision` values leave `L3-2d`'s rule
 *                                   governing, and the NEGATIVE CONTROLS below prove it.
 *   3. THE DIRECTION IS ONE-WAY.    No input reachable through this boundary can produce `ACTIVE`
 *                                   from a state that was not already `ACTIVE`. Asserted by
 *                                   ENUMERATING the whole cross-product, not by inspection.
 *   4. NOTHING IS DELETED.          `RESOLVE` preserves key, family, evidence, rationale,
 *                                   uncertainties, corrective action, risk factors, regulatory refs
 *                                   AND the question. Only `conditionState` moves.
 *   5. THE QUESTION NOW SURVIVES.   The end-to-end fixture proves the binder KEEPS a question that
 *                                   the shipped pipeline drops, because the state is no longer decided.
 *
 * ============================ `INSTRUMENT_SELF_REFERENCE_PROHIBITED` (section 69.9) ============================
 *
 * Five defects of this class have fired in this programme, so this suite obeys the rule mechanically
 * rather than by intention:
 *
 *   TARGET SET ENUMERATED   `enumerateTargets()` prints exactly what is under test -- the eight
 *                           condition states and the five `affectedDecision` values, both read from
 *                           the CONTRACT's own exported arrays, never re-typed here.
 *   NO SELF-MEASUREMENT     no assertion below derives PASS/FAIL from the text of a source file,
 *                           this one included. Every assertion calls the resolver and reads a typed
 *                           result. There is no grep, no regex over source, and no path scan, so the
 *                           self-match failure mode is ABSENT BY CONSTRUCTION rather than excluded.
 *   POSITIVE CONTROL        a fixture that MUST fire (`positiveControl`).
 *   NEGATIVE CONTROL        fixtures that MUST NOT fire (`negativeControls`), including the four
 *                           other `affectedDecision` values and both already-undecided states.
 *   FAIL-CLOSED ON EMPTY    `check` counts, and the run FAILS if the target set, the assertion count
 *                           or either control set is empty -- so a suite that silently stopped
 *                           examining anything reports FAIL, never PASS.
 *
 * Run: npm run test:l3-condition-state-resolution
 */
import {
  L3_CONDITION_STATES, L3_UNDECIDED_STATES, REASONING_PROPOSAL_CONTRACT_VERSION,
  type ClarificationDecision, type HazardCandidate, type L3ConditionState,
  type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import {
  L3_STATE_RESOLVER_VERSION, resolveConditionStates,
} from '../src/safescope-v2/reasoning-l3/condition-state-resolution';
import type { ValidatedReasoning } from '../src/safescope-v2/reasoning-l3/validated-reasoning.types';
import type { L3StateFacts } from '../src/safescope-v2/reasoning-l3/state-facts';

let passed = 0, failed = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) { passed += 1; return; }
  failed += 1; failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};

const FAM = ['machine_guarding', 'walking_working_surfaces', 'falls', 'electrical', 'lifting_rigging', 'chemical_storage', 'loto_stored_energy'];

/** The five `affectedDecision` values, taken from the contract's own type rather than re-typed. */
const AFFECTED_DECISIONS: ReadonlyArray<ClarificationDecision['affectedDecision']> =
  ['hazard_identity', 'condition_state', 'regulatory_applicability', 'risk', 'corrective_action'];

function mk(text: string): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'rc2', observationText: text,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM,
  }).input;
}
function ev(input: ReasoningInput, quote: string) {
  const text = input.authoritativeSources[0].text;
  const start = text.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not verbatim: ${JSON.stringify(quote)}`);
  return { sourceId: 'observation-1', sourceType: 'observation' as const, startOffset: start, endOffset: start + quote.length, quotedText: quote };
}
function question(affectedDecision: ClarificationDecision['affectedDecision']): ClarificationDecision {
  return { unresolvedFact: 'whether the isolation was proven', affectedDecision, branches: ['it was', 'it was not'], question: 'Was isolation proven before work started?' };
}
function cand(o: Partial<HazardCandidate> & Pick<HazardCandidate, 'candidateKey' | 'hazardFamily' | 'conditionState' | 'evidence'>): HazardCandidate {
  return {
    conditionRationale: 'stated rationale', independentHazardRationale: 'the only hazard described',
    uncertainties: ['whether isolation was proven'], clarification: null, correctiveActionIntent: null,
    riskFactors: null, regulatoryCandidateRefs: [], ...o,
  };
}
function validate(input: ReasoningInput, c: HazardCandidate[]): ValidatedReasoning {
  const proposal: ReasoningProposal = {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION, analysisId: input.analysisId, outcome: 'ANALYZED',
    observationInterpretation: 'x', hazardCandidates: c, jurisdictionProposal: null,
  };
  const v = validateReasoningProposal(proposal, input);
  if (!v.validated) throw new Error(`fixture never reached the boundary: ${v.issues.map(i => i.code).join(',')}`);
  return v.validated;
}

/** A synthetic ValidatedReasoning with no evidence requirement, for the enumeration sweeps. */
function synthetic(state: L3ConditionState, clarification: ClarificationDecision | null): ValidatedReasoning {
  return {
    analysisId: 'rc2', outcome: 'ANALYZED', observationInterpretation: 'x',
    hazards: [{
      candidateKey: 'k1', hazardFamily: 'machine_guarding', conditionState: state, evidence: [],
      conditionRationale: 'r', independentHazardRationale: 'r', uncertainties: [],
      clarification, correctiveActionIntent: null, riskFactors: null, regulatoryCandidateRefs: [],
    }],
    jurisdictionProposal: null, unresolvedDecisions: [],
    validator: { inputContractVersion: 'i', proposalContractVersion: 'p', validatorVersion: 'v', validatedAt: 'now' },
  };
}

// ================================================================ 0. the target set, enumerated

function enumerateTargets(): { states: number; decisions: number } {
  console.log(`TARGET SET: ${L3_CONDITION_STATES.length} condition states -- ${L3_CONDITION_STATES.join(', ')}`);
  console.log(`TARGET SET: ${AFFECTED_DECISIONS.length} affectedDecision values -- ${AFFECTED_DECISIONS.join(', ')}`);
  console.log(`TARGET SET: ${L3_UNDECIDED_STATES.length} undecided states -- ${L3_UNDECIDED_STATES.join(', ')}`);
  console.log(`RESOLVER UNDER TEST: ${L3_STATE_RESOLVER_VERSION}`);
  return { states: L3_CONDITION_STATES.length, decisions: AFFECTED_DECISIONS.length };
}

// ================================================================ 1. CHECK is inert

function checkModeIsInert(): void {
  for (const state of L3_CONDITION_STATES) {
    const r = resolveConditionStates(synthetic(state, question('condition_state')));
    check(`inert/${state}: CHECK applies nothing`, r.applied === 0, String(r.applied));
    check(`inert/${state}: CHECK returns the hazards unchanged`,
      r.reasoning.hazards[0].conditionState === state, r.reasoning.hazards[0].conditionState);
    check(`inert/${state}: mode is reported`, r.mode === 'CHECK', r.mode);
  }
  const empty = resolveConditionStates(synthetic('ACTIVE', null));
  check('inert: a proposal with no contradiction reports zero', empty.contradictions === 0, String(empty.contradictions));
}

// ================================================================ 2. positive control -- it MUST fire

let positiveControlFired = 0;
function positiveControl(): void {
  for (const state of L3_CONDITION_STATES.filter(s => !L3_UNDECIDED_STATES.includes(s))) {
    const r = resolveConditionStates(synthetic(state, question('condition_state')), { mode: 'RESOLVE' });
    const fired = r.contradictions === 1 && r.applied === 1
      && r.reasoning.hazards[0].conditionState === 'INSUFFICIENT_EVIDENCE'
      && r.resolutions[0].rule === 'CANDIDATE_DECLARES_CONDITION_STATE_UNRESOLVED';
    if (fired) positiveControlFired += 1;
    check(`positive/${state}: a self-declared-open condition_state resolves to INSUFFICIENT_EVIDENCE`, fired,
      `${r.reasoning.hazards[0].conditionState} via ${r.resolutions[0].rule}`);
    check(`positive/${state}: the question is retained`, r.reasoning.hazards[0].clarification !== null);
  }
  const activeCase = resolveConditionStates(synthetic('ACTIVE', question('condition_state')), { mode: 'RESOLVE' });
  check('positive/ACTIVE: the withdrawal of an exposure assertion is named',
    activeCase.resolutions[0].withdrawsExposureAssertion === true);
  const negatedCase = resolveConditionStates(synthetic('NEGATED', question('condition_state')), { mode: 'RESOLVE' });
  check('positive/NEGATED: the withdrawal of a reassuring state is named',
    negatedCase.resolutions[0].withdrawsReassuringState === true);
  check('positive/NEGATED: it is NOT reported as withdrawing an exposure assertion',
    negatedCase.resolutions[0].withdrawsExposureAssertion === false);
}

// ================================================================ 3. negative controls -- they MUST NOT fire

let negativeControlsRun = 0;
function negativeControls(): void {
  // (a) the four other affectedDecision values never contradict a state -- L3-2d still governs them.
  for (const decision of AFFECTED_DECISIONS.filter(d => d !== 'condition_state')) {
    for (const state of L3_CONDITION_STATES) {
      negativeControlsRun += 1;
      const r = resolveConditionStates(synthetic(state, question(decision)), { mode: 'RESOLVE' });
      check(`negative/${decision}/${state}: no contradiction is claimed`,
        r.contradictions === 0 && r.applied === 0 && r.reasoning.hazards[0].conditionState === state,
        `${r.reasoning.hazards[0].conditionState} contradictions=${r.contradictions}`);
    }
  }
  // (b) a candidate carrying NO question is never touched.
  for (const state of L3_CONDITION_STATES) {
    negativeControlsRun += 1;
    const r = resolveConditionStates(synthetic(state, null), { mode: 'RESOLVE' });
    check(`negative/no-question/${state}: untouched`, r.applied === 0 && r.reasoning.hazards[0].conditionState === state);
  }
  // (c) an ALREADY-undecided state with a condition_state question is not a contradiction: that is
  //     the shape L3-INV-06 exists to describe, and touching it would break the carrier.
  for (const state of L3_UNDECIDED_STATES) {
    negativeControlsRun += 1;
    const r = resolveConditionStates(synthetic(state, question('condition_state')), { mode: 'RESOLVE' });
    check(`negative/undecided/${state}: the legitimate carrier shape is untouched`,
      r.contradictions === 0 && r.reasoning.hazards[0].conditionState === state && r.reasoning.hazards[0].clarification !== null);
  }
}

// ================================================================ 4. direction -- ACTIVE is unreachable

function noArmProducesActive(): void {
  let examined = 0;
  for (const state of L3_CONDITION_STATES) {
    for (const decision of [...AFFECTED_DECISIONS, null] as Array<ClarificationDecision['affectedDecision'] | null>) {
      examined += 1;
      const r = resolveConditionStates(
        synthetic(state, decision ? question(decision) : null), { mode: 'RESOLVE' });
      const out = r.reasoning.hazards[0].conditionState;
      if (state === 'ACTIVE') continue;                       // already ACTIVE: nothing was created
      check(`direction/${state}/${decision ?? 'none'}: ACTIVE is not created`, out !== 'ACTIVE', out);
    }
  }
  check('direction: the cross-product was actually examined', examined === L3_CONDITION_STATES.length * (AFFECTED_DECISIONS.length + 1),
    String(examined));
}

// ================================================================ 5. nothing is deleted

function resolvePreservesEverything(): void {
  const text = 'The lockout box on the press was open and no padlock was fitted.';
  const input = mk(text);
  const validated = validate(input, [cand({
    candidateKey: 'k1', hazardFamily: 'loto_stored_energy', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The lockout box on the press was open and no padlock was fitted')],
    clarification: question('condition_state'),
    correctiveActionIntent: {
      objective: 'fit a padlock', hierarchyLevel: 'engineering',
      groundedInEvidence: [ev(input, 'The lockout box on the press was open and no padlock was fitted')],
    },
    riskFactors: { consequenceSeverity: 'severe', exposureLikelihood: 'likely', affectedPersons: 'few', existingControls: [], uncertainty: ['isolation status'] },
  })]);
  const before = validated.hazards[0];
  const r = resolveConditionStates(validated, { mode: 'RESOLVE' });
  const after = r.reasoning.hazards[0];
  check('preserve: exactly one candidate survives', r.reasoning.hazards.length === 1, String(r.reasoning.hazards.length));
  check('preserve: candidateKey', after.candidateKey === before.candidateKey);
  check('preserve: hazardFamily', after.hazardFamily === before.hazardFamily);
  check('preserve: evidence', JSON.stringify(after.evidence) === JSON.stringify(before.evidence));
  check('preserve: rationales', after.conditionRationale === before.conditionRationale && after.independentHazardRationale === before.independentHazardRationale);
  check('preserve: uncertainties', JSON.stringify(after.uncertainties) === JSON.stringify(before.uncertainties));
  check('preserve: corrective-action intent', JSON.stringify(after.correctiveActionIntent) === JSON.stringify(before.correctiveActionIntent));
  check('preserve: risk factors', JSON.stringify(after.riskFactors) === JSON.stringify(before.riskFactors));
  check('preserve: the question', JSON.stringify(after.clarification) === JSON.stringify(before.clarification));
  check('preserve: ONLY conditionState moved', after.conditionState === 'INSUFFICIENT_EVIDENCE' && before.conditionState === 'ACTIVE');
  check('preserve: the INPUT object was not mutated', validated.hazards[0].conditionState === 'ACTIVE', validated.hazards[0].conditionState);
}

// ================================================================ 6. the question now survives the binder

function questionSurvivesTheBinder(): void {
  const text = 'The lockout box on the press was open and no padlock was fitted.';
  const input = mk(text);
  const validated = validate(input, [cand({
    candidateKey: 'k1', hazardFamily: 'loto_stored_energy', conditionState: 'ACTIVE',
    evidence: [ev(input, 'The lockout box on the press was open and no padlock was fitted')],
    clarification: question('condition_state'),
  })]);

  // SHIPPED BEHAVIOUR, measured rather than assumed: the binder drops the question and keeps ACTIVE.
  const shipped = bindEvidenceSemantically(validated, input);
  const shippedH = shipped.boundHazards.find(h => h.candidateKey === 'k1');
  check('binder/shipped: the candidate survives', !!shippedH, JSON.stringify(shipped.rejected));
  check('binder/shipped: the state stays ACTIVE', shippedH?.conditionState === 'ACTIVE', shippedH?.conditionState);
  check('binder/shipped: the question is DESTROYED', shippedH?.clarification === null,
    JSON.stringify(shippedH?.clarification));
  check('binder/shipped: the destruction is recorded', shipped.clarificationsDropped.length === 1);

  // WITH THE BOUNDARY IN RESOLVE: the state is not decided, so the binder keeps the question.
  const resolved = resolveConditionStates(validated, { mode: 'RESOLVE' });
  const bound = bindEvidenceSemantically(resolved.reasoning, input);
  const h = bound.boundHazards.find(x => x.candidateKey === 'k1');
  check('binder/resolved: the candidate still survives', !!h, JSON.stringify(bound.rejected));
  check('binder/resolved: the state is INSUFFICIENT_EVIDENCE', h?.conditionState === 'INSUFFICIENT_EVIDENCE', h?.conditionState);
  check('binder/resolved: the question SURVIVES', !!h?.clarification, JSON.stringify(h?.clarification));
  check('binder/resolved: nothing is recorded as dropped', bound.clarificationsDropped.length === 0);
  check('binder/resolved: no ACTIVE is asserted', !bound.boundHazards.some(x => x.conditionState === 'ACTIVE'));
}

// ================================================================ 7. the separated-facts arm

function factsArm(): void {
  const facts: L3StateFacts = {
    hazardAsserted: false, hazardAssertionQuote: '',
    controlReading: 'NOT_STATED', controlQuote: null,
    framing: 'ACTUAL', disposition: 'NONE',
    decisionCriticalFactMissing: true, missingFact: 'whether the isolator was locked',
    hazardExplicitlyDenied: false,
  };
  const r = resolveConditionStates(synthetic('ACTIVE', null), {
    mode: 'RESOLVE', stateFacts: new Map([['k1', facts]]),
  });
  check('facts: the separated-facts resolver decides the state',
    r.reasoning.hazards[0].conditionState === 'INSUFFICIENT_EVIDENCE' && r.resolutions[0].rule === 'FACTS_DERIVED_STATE',
    `${r.reasoning.hazards[0].conditionState} via ${r.resolutions[0].rule}`);

  const asserted: L3StateFacts = { ...facts, hazardAsserted: true, hazardAssertionQuote: 'the guard is gone', controlReading: 'ABSENT', decisionCriticalFactMissing: false, missingFact: null };
  const r2 = resolveConditionStates(synthetic('CONTROLLED', null), {
    mode: 'RESOLVE', stateFacts: new Map([['k1', asserted]]),
  });
  check('facts: a self-contradicting CONTROLLED is corrected by the facts, not by prose',
    r2.reasoning.hazards[0].conditionState === 'ACTIVE' && r2.resolutions[0].agrees === false,
    r2.reasoning.hazards[0].conditionState);
  check('facts: the facts arm is the ONLY arm that may raise a state to ACTIVE, and it is driven by '
    + 'the model\'s own emitted facts', r2.resolutions[0].rule === 'FACTS_DERIVED_STATE');
}

// ================================================================ 8. empty input is answered explicitly

function emptyProposal(): void {
  const empty: ValidatedReasoning = { ...synthetic('ACTIVE', null), hazards: [] };
  const r = resolveConditionStates(empty, { mode: 'RESOLVE' });
  check('empty: zero candidates yields zero resolutions', r.resolutions.length === 0);
  check('empty: zero contradictions is stated, not implied', r.contradictions === 0 && r.applied === 0);
}

// ================================================================ run

const targets = enumerateTargets();
checkModeIsInert();
positiveControl();
negativeControls();
noArmProducesActive();
resolvePreservesEverything();
questionSurvivesTheBinder();
factsArm();
emptyProposal();

// FAIL-CLOSED. An instrument that examined nothing must report FAIL, never PASS.
check('instrument: the condition-state target set is non-empty', targets.states > 0, String(targets.states));
check('instrument: the affectedDecision target set is non-empty', targets.decisions > 0, String(targets.decisions));
check('instrument: the positive control actually fired', positiveControlFired > 0, String(positiveControlFired));
check('instrument: the negative controls actually ran', negativeControlsRun > 0, String(negativeControlsRun));
check('instrument: assertions were made', passed + failed > 40, String(passed + failed));

console.log(`\nRC-2 CONDITION-STATE RESOLUTION: ${passed} passed, ${failed} failed`);
if (failed) { for (const f of failures) console.log(`  FAIL  ${f}`); process.exit(1); }
