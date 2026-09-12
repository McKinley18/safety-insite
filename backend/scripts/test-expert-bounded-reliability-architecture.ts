/**
 * §165 EXPERT HAZLENZ -- BOUNDED RELIABILITY / TARGET-COVERAGE LOCAL PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE ACCESS. NOTHING IN `src/` IS TOUCHED OR IMPORTED.
 *
 * Cases A-T are the §165 authorization's matrix, in its order, with its letters. X1-X14 are the
 * adversarial cases the matrix requires in addition.
 *
 * The HS-A1 and HS-E1 fixtures are built from the REAL §156 blinded packet and the REAL §163 draw
 * records, read from disk and hashed, so no observation text and no draw outcome is retyped here.
 *
 * ==================== ONE THING THIS SUITE IS CAREFUL NOT TO DO ====================
 *
 * It does not claim that any §163 draw "bound" anything. Binding did not exist when those draws were
 * made. The replay in R1/R2 maps a draw's RECORDED `sourceMode` -- `SUPPLIED_FACT` or
 * `NOMINATED_FACT`, a field the provider emitted and §163 persisted -- onto the binding mode it
 * corresponds to, and asserts what the architecture would have done with that declaration. That is a
 * mechanical mapping over a stored enum, not a semantic judgement about question text.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  type OwedFact, type OwedFactLedger,
  owedFact, createOwedFactLedger, addOwedFact, nominateAdditiveFact, transition,
  unresolvedFacts, factOf, factsRemoved, preservationViolations, dedupeByIdentity,
  modelAuthoredOnlyFailClosedKeys, PRODUCTION_PERMITTED_SOURCES, OWED_FACT_STATUSES,
  OWED_FACT_SOURCES, TRANSITION_AUTHORITIES, OWED_FACT_CONTRACT_VERSION,
} from './lib/expert-owed-facts';
import {
  type ClarificationDeclaration,
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects, bindingMap,
  BINDING_CONTRACT_VERSION, COVERAGE_DECISION_INPUTS,
} from './lib/expert-owed-fact-binding';
import {
  evaluateTargetCoverage, permittedResponses, unexplainedCoverageClearances,
  COVERAGE_COMPUTATION_METHOD, TARGET_COVERAGE_VERSION, COVERAGE_RESPONSES,
} from './lib/expert-target-coverage';
import {
  selectQuestions, questionBudgetViolations, mayCombine, QUESTION_BUDGET_VERSION,
} from './lib/expert-question-budget';
import {
  type DrawObservation,
  evaluateSecondDrawGate, resolveDrawOutcome, stateMachineViolations, runBoundedDraws,
  emptyProviderCallBudget, recordProviderCall, mayIssueProviderCall,
  assertCallCapInternallyConsistent, MAX_PROVIDER_CALLS_PER_ANALYSIS, MAX_RELIABILITY_DRAWS,
  PROVIDER_CALL_CHANNELS, STATE_MACHINE_COMPOSITION, ACTIVATION_STATUS,
  RELIABILITY_STATE_MACHINE_VERSION,
} from './lib/expert-bounded-reliability-state-machine';
import {
  type ObservabilityRecord, type VerifierAttemptObservation,
  emptyObservabilityRecord, appendAttempt, observabilityViolations, reconstructionGaps,
  RECONSTRUCTABLE_FACTS, RELIABILITY_OBSERVABILITY_VERSION,
} from './lib/expert-reliability-observability';
import {
  SEMANTIC_OUTCOMES_V2, SEMANTIC_OUTCOME_V2_PROPERTIES, HUMAN_AUTHORITY_ONLY_OUTCOMES,
  UNKNOWN_SEMANTIC_VALIDITY, EXPERT_SEMANTIC_OUTCOME_V2_VERSION,
  classifyDeterministically, assignHumanAdjudicatedOutcome, humanAuthorityViolations,
  summariseOutcomes, assertRecallAndPrecisionNotNetted, type SemanticOutcomeRecord,
} from './lib/expert-semantic-outcome-v2';
import { decideDegeneratePolicy } from './lib/expert-degenerate-policy';
import { evaluateSelectiveVerificationTrigger } from './lib/expert-selective-verification-trigger';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const PACKET = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03', 'VERIFIER-PACKET.json');
const DRAWS = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04',
  'DRAW-RUN-RECORDS.jsonl');
const LIB = join(__dirname, 'lib');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
function threw(fn: () => unknown): string | null {
  try { fn(); return null; } catch (e) { return (e as Error).message; }
}
const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');

// ---------------------------------------------------------------- real material, read not retyped

interface PacketCase {
  caseId: string; observation: string;
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>;
  firstPass: { candidates: unknown[]; clarifications: unknown[]; uncertainty: string[] };
  triggerConditions: string[];
}
const packet = JSON.parse(readFileSync(PACKET, 'utf8')) as { cases: PacketCase[] };
const VC08 = packet.cases.find(c => c.caseId === 'VC-08')!;   // HS-A1
const VC04 = packet.cases.find(c => c.caseId === 'VC-04')!;   // HS-E1

interface DrawRecord {
  rowId: string; draw: number; contractAdmitted: boolean; verdict: string;
  sourceMode: string | null; clarificationEmitted: boolean; question: string | null;
  nominatedFact: string | null; transportOk: boolean; responseState: string;
  affectedDecision: string | null;
}
const drawRecords = readFileSync(DRAWS, 'utf8').trim().split('\n')
  .map(l => JSON.parse(l) as DrawRecord);
const A1_DRAWS = drawRecords.filter(d => d.rowId === 'HS-A1');
const E1_DRAWS = drawRecords.filter(d => d.rowId === 'HS-E1');

console.log('§165 BOUNDED RELIABILITY + TARGET COVERAGE — LOCAL PROOF MATRIX');
console.log('='.repeat(100));
console.log(`  packet   ${sha256File(PACKET).slice(0, 32)}…`);
console.log(`  draws    ${sha256File(DRAWS).slice(0, 32)}…  (${drawRecords.length} records)`);
console.log(`  versions ${OWED_FACT_CONTRACT_VERSION} · ${BINDING_CONTRACT_VERSION} · `
  + `${TARGET_COVERAGE_VERSION}`);
console.log(`           ${QUESTION_BUDGET_VERSION} · ${RELIABILITY_STATE_MACHINE_VERSION}`);
console.log(`           ${RELIABILITY_OBSERVABILITY_VERSION} · ${EXPERT_SEMANTIC_OUTCOME_V2_VERSION}`);
console.log(`  activation ${ACTIVATION_STATUS}\n`);

// ---------------------------------------------------------------- fixtures

const FLAME_KEY = 'owed:hs-a1:flame_failure_safeguard_functional_status';
const AUGER_KEY = 'nominated:hs-a1:discharge_auger_drive_isolation_state';
const INTERLOCK_KEY = 'owed:hs-e1:rotor_guard_interlock_function_verified';

/**
 * The HS-A1 owed target, as §162 human review left it. `DEVELOPMENT_HUMAN_TRUTH` by construction:
 * this is the standard the system is measured against, and case R proves it cannot reach production.
 */
const flameFact: OwedFact = owedFact({
  factKey: FLAME_KEY,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DEVELOPMENT_HUMAN_TRUTH',
  evidenceSpan: 'the flame-failure device and its wiring are behind that shroud and cannot be seen',
  whyUnresolved: 'the span states the safeguard cannot be seen; a control that cannot be seen is '
    + 'not a control that was checked, and the text states nothing about its functional status',
  branchA: 'the flame-failure safeguard is functional',
  branchB: 'the flame-failure safeguard is bypassed, failed or otherwise nonfunctional',
  decisionDivergence: {
    ifA: 'drying continues under the existing controls',
    ifB: 'the burner is shut down and the safeguard restored before drying continues',
  },
  priority: 'REQUIRED_CONTROL',
});

/**
 * The auger fact the product owner adjudicated `DISPLACED_FACT_VALID_DECISION_CRITICAL`.
 *
 * Its branches and divergence are stated in the OWNER'S OWN NARROWER TERMS: the isolation state is
 * unresolved and can materially change whether clearing the blockage may safely continue. No
 * unconditional regulatory claim about grain-dryer blockage clearance is encoded here, because the
 * disposition explicitly prohibited one.
 */
const augerFact: OwedFact = owedFact({
  factKey: AUGER_KEY,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'VERIFIER_NOMINATION',
  evidenceSpan: 'An operative is clearing a blockage at the discharge auger with the dryer running.',
  whyUnresolved: 'the span states the dryer is running while the blockage is cleared and states '
    + 'nothing about the energy state of the auger drive either way',
  branchA: 'the auger drive was isolated or de-energised before the operative began',
  branchB: 'the auger drive remains capable of powered motion while the operative works at it',
  decisionDivergence: {
    ifA: 'clearing the blockage may continue as observed',
    ifB: 'whether clearing may safely continue is not established and must be resolved before work '
      + 'proceeds',
  },
  priority: 'REQUIRED_CONTROL',
});

const interlockFact: OwedFact = owedFact({
  factKey: INTERLOCK_KEY,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DEVELOPMENT_HUMAN_TRUTH',
  evidenceSpan: 'The machine was returned to service this morning after a rotor tooth change '
    + 'carried out overnight by the maintenance fitter, who has gone off shift.',
  whyUnresolved: 'the span states the machine was returned to service and states nothing about '
    + 'whether the guard interlock protective function was verified after reassembly',
  branchA: 'the interlock protective function was verified before return to service',
  branchB: 'the interlock protective function was not verified before return to service',
  decisionDivergence: {
    ifA: 'the debarker continues to run as observed',
    ifB: 'the protective function is verified before the debarker continues to run',
  },
  priority: 'REQUIRED_CONTROL',
});

const hsA1Ledger = (): OwedFactLedger => createOwedFactLedger('DEVELOPMENT', [flameFact]);
const hsE1Ledger = (): OwedFactLedger => createOwedFactLedger('DEVELOPMENT', [interlockFact]);

const augerDeclaration: ClarificationDeclaration = {
  declarationId: 'D-auger',
  bindingMode: 'NOMINATED_NEW',
  coversFactKey: null,
  nomination: {
    factKey: AUGER_KEY,
    affectedDecision: 'REQUIRED_CONTROL',
    evidenceSpan: augerFact.evidenceSpan,
    whyUnresolved: augerFact.whyUnresolved,
    branchA: augerFact.branchA,
    branchB: augerFact.branchB,
    decisionIfA: augerFact.decisionDivergence.ifA,
    decisionIfB: augerFact.decisionDivergence.ifB,
    priority: 'REQUIRED_CONTROL',
  },
  question: 'Has the discharge auger drive been isolated or de-energised before the operative '
    + 'began clearing the blockage?',
  affectedDecision: 'REQUIRED_CONTROL',
};

const flameDeclaration: ClarificationDeclaration = {
  declarationId: 'D-flame',
  bindingMode: 'BOUND_TO_OWED_FACT',
  coversFactKey: FLAME_KEY,
  nomination: null,
  question: 'Has the burner flame-failure safeguard been function-tested or otherwise verified as '
    + 'operating correctly?',
  affectedDecision: 'REQUIRED_CONTROL',
};

const silentDraw = (i: 1 | 2): DrawObservation => ({
  drawIndex: i, transportOk: true, degenerate: false, responseState: 'COMPLETE',
  contractAdmitted: true, verdict: 'NO_CLARIFICATION_REQUIRED', clarificationEmitted: false,
});

// ================================================================== A — E : the HS-A1 shape

console.log('--- A–E  HS-A1 SHAPE: AN ADDITIVE NOMINATION CANNOT ERASE THE OWED TARGET\n');

const a1Before = hsA1Ledger();
const a1Check = checkBindingDeclarations([augerDeclaration], a1Before, VC08.observation);
const a1After = applyAdmittedDeclarations(a1Before, a1Check);

ok('A. the owed flame-failure fact survives an additive auger nomination',
  !!factOf(a1After, FLAME_KEY) && factOf(a1After, FLAME_KEY)!.status === 'UNRESOLVED'
    && factsRemoved(a1Before, a1After).length === 0,
  `${FLAME_KEY} is present and UNRESOLVED; 0 facts removed`);

ok('B. both facts coexist in one ledger',
  a1After.facts.length === 2 && !!factOf(a1After, FLAME_KEY) && !!factOf(a1After, AUGER_KEY),
  `${a1After.facts.map(f => f.factKey.split(':').pop()).join(' + ')}`);

const a1Bound = applyAdmittedDeclarations(
  a1After,
  checkBindingDeclarations([{
    ...augerDeclaration, declarationId: 'D-auger-bind', bindingMode: 'BOUND_TO_OWED_FACT',
    coversFactKey: AUGER_KEY, nomination: null,
  }], a1After, VC08.observation),
);
ok('C. binding the auger fact does NOT cover the flame-failure fact',
  factOf(a1Bound, AUGER_KEY)!.status === 'COVERED'
    && factOf(a1Bound, FLAME_KEY)!.status === 'UNRESOLVED',
  'auger COVERED, flame-failure still UNRESOLVED — no implicit sibling coverage');

const a1Coverage = evaluateTargetCoverage(a1Bound, [AUGER_KEY],
  { 'D-auger-bind': AUGER_KEY });
ok('D. the flame-failure key remains in uncoveredFactKeys',
  a1Coverage.TARGET_COVERAGE_WARNING
    && a1Coverage.uncoveredFactKeys.length === 1
    && a1Coverage.uncoveredFactKeys[0] === FLAME_KEY,
  `TARGET_COVERAGE_WARNING=true, uncovered=[${a1Coverage.uncoveredFactKeys.join(', ')}]`);

ok('E. the additive nomination preserved the original owed fact byte for byte',
  preservationViolations(a1Before, a1After).length === 0
    && JSON.stringify(factOf(a1After, FLAME_KEY)) === JSON.stringify(flameFact),
  '0 preservation violations; the owed fact object is unchanged');

// ================================================================== F — I : the HS-E1 shape

console.log('\n--- F–I  HS-E1 SHAPE: SILENCE, THE SECOND DRAW, AND WHAT TWO NOs DO NOT PROVE\n');

const e1Ledger = hsE1Ledger();
const e1NoDeclarations = checkBindingDeclarations([], e1Ledger, VC04.observation);
const e1Coverage = evaluateTargetCoverage(e1Ledger, e1NoDeclarations.boundFactKeys);
ok('F. NO_CLARIFICATION_REQUIRED while the interlock fact is unresolved raises the warning',
  e1Coverage.TARGET_COVERAGE_WARNING && e1Coverage.uncoveredFactKeys[0] === INTERLOCK_KEY,
  `uncovered=[${INTERLOCK_KEY.split(':').pop()}]`);

const e1Trigger = evaluateSelectiveVerificationTrigger({
  rowId: 'HS-E1', candidates: [], clarifications: [], uncertainty: [],
  postconditionWarningCodes: [],
});
const gate = evaluateSecondDrawGate({
  observation: silentDraw(1), triggerPositive: e1Trigger.ESCALATE,
  unresolvedOwedFactRemains: unresolvedFacts(e1Ledger).length > 0,
  budget: recordProviderCall(emptyProviderCallBudget(), 'RELIABILITY_DRAW'),
});
ok('G. a trigger-positive admitted silence makes exactly one second draw eligible',
  e1Trigger.ESCALATE && gate.SECOND_DRAW_ELIGIBLE && gate.state === 'SECOND_DRAW_ELIGIBLE',
  `trigger fired [${e1Trigger.fired.join(', ')}]; SECOND_DRAW_ELIGIBLE=true`);

const twoSilences = resolveDrawOutcome([silentDraw(1), silentDraw(2)], true);
ok('H. a second silence clears nothing',
  twoSilences.drawCount === 2
    && twoSilences.outcome.outcome === 'SETTLED_SILENCE'
    && !twoSilences.mayClearOwedFact && !twoSilences.coverageWarningMayClear
    && unresolvedFacts(e1Ledger)[0].status === 'UNRESOLVED',
  'SETTLED_SILENCE drawCount 2; owed fact still UNRESOLVED');

const e1CoverageAfter = evaluateTargetCoverage(e1Ledger, []);
ok('I. two matching NO draws do not produce COVERED and do not clear the warning',
  !e1Ledger.facts.some(f => f.status === 'COVERED')
    && e1CoverageAfter.TARGET_COVERAGE_WARNING
    && twoSilences.consensusClaimed === false
    && stateMachineViolations({
      budget: { spent: { FIRST_PASS: 1, DEGENERATE_REISSUE: 0, RELIABILITY_DRAW: 2,
        COVERAGE_RECHECK: 0 }, total: 3 },
      draws: [silentDraw(1), silentDraw(2)], resolution: twoSilences,
      ledgerAfter: e1Ledger, targetCoverageWarning: true,
    }).length === 0,
  'no COVERED fact, warning still TRUE, consensusClaimed=false, 0 state-machine violations');

// ================================================================== J — L : the three exits

console.log('\n--- J–L  THE ONLY THREE WAYS A FACT LEAVES UNRESOLVED\n');

const jLedger = hsA1Ledger();
const jCheck = checkBindingDeclarations([flameDeclaration], jLedger, VC08.observation);
const jAfter = applyAdmittedDeclarations(jLedger, jCheck);
const jCoverage = evaluateTargetCoverage(jAfter, jCheck.boundFactKeys, bindingMap(jCheck));
ok('J. an explicit admitted binding produces COVERED and clears the warning',
  jCheck.admitted.length === 1 && factOf(jAfter, FLAME_KEY)!.status === 'COVERED'
    && !jCoverage.TARGET_COVERAGE_WARNING && jAfter.transitions.length === 1
    && jAfter.transitions[0].authority === 'ADMITTED_BINDING',
  'COVERED via ADMITTED_BINDING; warning FALSE; 1 recorded transition');

const kAfter = transition(hsA1Ledger(), {
  factKey: FLAME_KEY, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
  justification: 'a governed maintenance record naming a completed function test was admitted',
});
const kWrongAuthority = threw(() => transition(hsA1Ledger(), {
  factKey: FLAME_KEY, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMITTED_BINDING',
  justification: 'a binding is not evidence',
}));
ok('K. SETTLED_BY_EVIDENCE requires the evidence authority and refuses any other',
  factOf(kAfter, FLAME_KEY)!.status === 'SETTLED_BY_EVIDENCE'
    && kAfter.transitions[0].authority === 'ADMISSIBLE_EVIDENCE'
    && kWrongAuthority !== null && /TRANSITION_AUTHORITY_MISMATCH/.test(kWrongAuthority),
  'ADMISSIBLE_EVIDENCE accepted; ADMITTED_BINDING refused');

const lAfter = transition(hsA1Ledger(), {
  factKey: FLAME_KEY, to: 'REJECTED_BY_ARBITRATION', authority: 'RECORDED_ARBITRATION',
  justification: 'arbitration recorded a reason; see the arbitration record',
});
const lNoReason = threw(() => transition(hsA1Ledger(), {
  factKey: FLAME_KEY, to: 'REJECTED_BY_ARBITRATION', authority: 'RECORDED_ARBITRATION',
  justification: '   ',
}));
ok('L. REJECTED_BY_ARBITRATION requires a recorded reason',
  factOf(lAfter, FLAME_KEY)!.status === 'REJECTED_BY_ARBITRATION'
    && lNoReason !== null && /TRANSITION_JUSTIFICATION_MISSING/.test(lNoReason),
  'recorded reason required; an empty one is refused');

// ================================================================== M — N : deduplication

console.log('\n--- M–N  DEDUPLICATION IS IDENTITY, NEVER SIMILARITY\n');

const mLedger = addOwedFact(hsA1Ledger(), flameFact);
ok('M. an exact factKey collision deduplicates and changes nothing',
  mLedger.facts.length === 1 && dedupeByIdentity([flameFact, flameFact]).length === 1
    && preservationViolations(hsA1Ledger(), mLedger).length === 0,
  '1 fact, 0 preservation violations');

const nearDuplicate = owedFact({
  ...flameFact,
  factKey: `${FLAME_KEY}__restated`,
  source: 'VERIFIER_NOMINATION',
});
const nLedger = addOwedFact(hsA1Ledger(), nearDuplicate);
ok('N. two facts with near-identical text and different keys BOTH survive',
  nLedger.facts.length === 2 && dedupeByIdentity([flameFact, nearDuplicate]).length === 2,
  'similarity merges nothing — merging is how a gap disappears');

// ================================================================== O : question budget

console.log('\n--- O  THE BUDGET NEVER SILENTLY DISCARDS A LIFE-CRITICAL GAP\n');

const lifeCritical = (n: number): OwedFact => owedFact({
  ...flameFact,
  factKey: `owed:life-critical-${n}`,
  source: 'DETERMINISTIC',
  priority: 'LIFE_CRITICAL',
});
const oLedger = createOwedFactLedger('DEVELOPMENT', [
  lifeCritical(1), lifeCritical(2),
  owedFact({ ...flameFact, factKey: 'owed:other-1', source: 'DETERMINISTIC', priority: 'OTHER' }),
]);
const oResult = selectQuestions(oLedger, 1);
ok('O. a life-critical gap that will not fit surfaces an unresolved safety state, not a short list',
  oResult.selected.length === 1
    && oResult.UNRESOLVED_SAFETY_STATE
    && oResult.unresolvedLifeCriticalFactKeys.length === 1
    && oResult.survivingInternally.length === 3
    && oResult.deterministicFindingsStillShown === true
    && questionBudgetViolations(oLedger, oResult).length === 0,
  `budget 1 · selected 1 · surviving 3 · unresolved life-critical `
  + `[${oResult.unresolvedLifeCriticalFactKeys.join(', ')}] · deferred `
  + `${oResult.deferred.length}`);

// ================================================================== P — Q : the call cap

console.log('\n--- P–Q  THE CALL CAP, AND THE SEPARATION OF THE TWO RETRY BUDGETS\n');

assertCallCapInternallyConsistent();
let capBudget = emptyProviderCallBudget();
for (const ch of ['FIRST_PASS', 'DEGENERATE_REISSUE', 'RELIABILITY_DRAW', 'RELIABILITY_DRAW',
  'COVERAGE_RECHECK'] as const) {
  capBudget = recordProviderCall(capBudget, ch);
}
const overCap = threw(() => recordProviderCall(capBudget, 'RELIABILITY_DRAW'));
ok('P. the bounded path is exactly 5 provider calls and the sixth is refused',
  MAX_PROVIDER_CALLS_PER_ANALYSIS === 5 && capBudget.total === 5
    && overCap !== null && /CHANNEL_CEILING_REACHED/.test(overCap),
  `1 first pass + 1 degenerate reissue + ${MAX_RELIABILITY_DRAWS} draws + 1 re-check = `
  + `${MAX_PROVIDER_CALLS_PER_ANALYSIS}`);

const degenerateExhausted = recordProviderCall(emptyProviderCallBudget(), 'DEGENERATE_REISSUE');
const drawExhausted = ['RELIABILITY_DRAW', 'RELIABILITY_DRAW'].reduce(
  (b, c) => recordProviderCall(b, c as 'RELIABILITY_DRAW'), emptyProviderCallBudget());
ok('Q. an exhausted channel cannot borrow another channel\'s allowance in either direction',
  !mayIssueProviderCall(degenerateExhausted, 'DEGENERATE_REISSUE').allowed
    && mayIssueProviderCall(degenerateExhausted, 'RELIABILITY_DRAW').allowed
    && !mayIssueProviderCall(drawExhausted, 'RELIABILITY_DRAW').allowed
    && mayIssueProviderCall(drawExhausted, 'DEGENERATE_REISSUE').allowed
    && evaluateSecondDrawGate({
      observation: silentDraw(1), triggerPositive: true, unresolvedOwedFactRemains: true,
      budget: drawExhausted,
    }).SECOND_DRAW_ELIGIBLE === false,
  'degenerate exhaustion does not block a draw; draw exhaustion does not unlock a reissue; '
  + 'and the gate refuses when its own channel is spent');

// ================================================================== R : the population boundary

console.log('\n--- R  DEVELOPMENT HUMAN TRUTH CANNOT ENTER A PRODUCTION LEDGER\n');

const rCreate = threw(() => createOwedFactLedger('PRODUCTION', [flameFact]));
const rAdd = threw(() => addOwedFact(
  createOwedFactLedger('PRODUCTION', []), interlockFact));
const prodLedger = createOwedFactLedger('PRODUCTION', [
  owedFact({ ...flameFact, source: 'DETERMINISTIC' }),
]);
ok('R. a DEVELOPMENT_HUMAN_TRUTH fact is refused by a PRODUCTION ledger at creation and at add',
  rCreate !== null && /DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION/.test(rCreate)
    && rAdd !== null && /DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION/.test(rAdd)
    && !PRODUCTION_PERMITTED_SOURCES.includes('DEVELOPMENT_HUMAN_TRUTH')
    && prodLedger.facts.length === 1,
  'both entry points throw; the permitted-source list omits it; a rule-derived fact is accepted');

const modelOnlyProd = createOwedFactLedger('PRODUCTION', [
  owedFact({ ...augerFact, source: 'VERIFIER_NOMINATION' }),
]);
ok('R2. a production owed fact sourced only from model output cannot alone justify fail-closed',
  modelOnlyProd.facts[0].modelAuthored === true
    && modelAuthoredOnlyFailClosedKeys(modelOnlyProd, [AUGER_KEY]).length === 1,
  'modelAuthored=true and the reliance is reported, not silently honoured');

// ================================================================== S : model explanation

console.log('\n--- S  A MODEL EXPLANATION IS NOT AN AUTHORITY\n');

const sBadAuthority = threw(() => transition(hsA1Ledger(), {
  factKey: FLAME_KEY, to: 'COVERED',
  authority: 'MODEL_EXPLANATION' as unknown as 'ADMITTED_BINDING',
  justification: 'the model explained at length why the other fact matters more',
}));
const sTerminal = threw(() => transition(jAfter, {
  factKey: FLAME_KEY, to: 'REJECTED_BY_ARBITRATION', authority: 'RECORDED_ARBITRATION',
  justification: 'second thoughts',
}));
ok('S. no authority member exists for a model explanation, and a terminal status cannot be reopened',
  sBadAuthority !== null && /TRANSITION_AUTHORITY_NOT_A_MEMBER/.test(sBadAuthority)
    && !(TRANSITION_AUTHORITIES as readonly string[]).includes('MODEL_EXPLANATION')
    && sTerminal !== null && /TRANSITION_FROM_TERMINAL_STATUS/.test(sTerminal),
  `authorities = [${TRANSITION_AUTHORITIES.join(', ')}]`);

// ================================================================== T : observability

console.log('\n--- T  RAW ATTEMPT HISTORY IS APPEND-ONLY\n');

const attempt = (seq: number, drawIndex: number | null,
  channel: VerifierAttemptObservation['channel']): VerifierAttemptObservation => ({
  attemptSeq: seq, channel, drawIndex, transportOk: true, responseState: 'COMPLETE',
  degenerate: false, contractAdmitted: true, admissionCodes: [],
  verdict: 'NO_CLARIFICATION_REQUIRED', clarificationEmitted: false, rawPreserved: true,
  costUsd: 0.0172, latencyMs: 7623,
});
const silentOutcome: SemanticOutcomeRecord = classifyDeterministically({
  transportOk: true, degenerate: false, responseState: 'COMPLETE', contractAdmitted: true,
  clarificationEmitted: false, owedFactExists: true,
});
let obs = emptyObservabilityRecord('HS-E1-local', 'DEVELOPMENT', [interlockFact], silentOutcome);
const obs1 = appendAttempt(obs, attempt(1, 1, 'RELIABILITY_DRAW'));
const obs2 = appendAttempt(obs1, attempt(2, 2, 'RELIABILITY_DRAW'));
const overwritten: ObservabilityRecord = {
  ...obs2,
  attempts: [attempt(1, 1, 'DEGENERATE_REISSUE'), obs2.attempts[1]],
};
obs = {
  ...obs2,
  SECOND_DRAW_ELIGIBLE: true,
  uncoveredFactKeys: [INTERLOCK_KEY],
  TARGET_COVERAGE_WARNING: true,
  statusTransitions: [],
  finalQuestionSelection: [],
  questionsSuppressedByBudget: [],
  unresolvedLifeCriticalFacts: [],
  failClosedReason: 'TARGET_COVERAGE_WARNING remained TRUE after two admitted silences',
};
ok('T. two draws are both retained, and an overwrite of the first is reported as a violation',
  obs2.attempts.length === 2 && obs2.reliabilityDrawCount === 2
    && observabilityViolations(obs1, obs2).length === 0
    && observabilityViolations(obs2, overwritten).some(v => /ATTEMPT_OVERWRITTEN/.test(v)),
  '2 attempts preserved; an edited attempt 1 raises ATTEMPT_OVERWRITTEN');

const t2Gaps = reconstructionGaps(obs);
ok('T2. the record reconstructs all 17 required facts',
  t2Gaps.length === 0 && RECONSTRUCTABLE_FACTS.length === 17,
  `${RECONSTRUCTABLE_FACTS.length} obligations, ${t2Gaps.length} gaps`
  + (t2Gaps.length ? `: ${t2Gaps.join('; ')}` : ''));

// ================================================================== X : adversarial

console.log('\n--- X  ADVERSARIAL CASES\n');

const outsideSet: ClarificationDeclaration = {
  ...flameDeclaration, declarationId: 'X1', coversFactKey: 'owed:not-in-the-set',
};
const x1 = checkBindingDeclarations([outsideSet], hsA1Ledger(), VC08.observation);
ok('X1. a binding to a key outside the closed set is refused',
  !x1.perDeclaration[0].admitted
    && x1.perDeclaration[0].codes.includes('BOUND_KEY_NOT_IN_CLOSED_SET')
    && x1.boundFactKeys.length === 0,
  x1.perDeclaration[0].detail[0]);

const x2 = checkBindingDeclarations([{ ...flameDeclaration, declarationId: 'X2' }],
  jAfter, VC08.observation);
ok('X2. a binding to an already-COVERED fact is refused',
  !x2.perDeclaration[0].admitted
    && x2.perDeclaration[0].codes.includes('BOUND_FACT_NOT_UNRESOLVED'),
  x2.perDeclaration[0].detail[0]);

const renameAttack: ClarificationDeclaration = {
  ...augerDeclaration,
  declarationId: 'X3',
  nomination: { ...augerDeclaration.nomination!, factKey: FLAME_KEY },
};
const x3 = checkBindingDeclarations([renameAttack], hsA1Ledger(), VC08.observation);
ok('X3. a nomination that reuses an unresolved owed fact\'s key is refused',
  !x3.perDeclaration[0].admitted
    && x3.perDeclaration[0].codes
      .includes('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT'),
  'a rename is not a nomination');

const x4 = checkBindingDeclarations(
  [flameDeclaration, { ...flameDeclaration, declarationId: 'X4b' }],
  hsA1Ledger(), VC08.observation);
ok('X4. two declarations binding the same fact: the second is refused',
  x4.perDeclaration[0].admitted && !x4.perDeclaration[1].admitted
    && x4.perDeclaration[1].codes.includes('TWO_DECLARATIONS_BIND_THE_SAME_FACT')
    && x4.boundFactKeys.length === 1,
  'one binding per fact');

const inventedHazard: ClarificationDeclaration = {
  ...augerDeclaration,
  declarationId: 'X5',
  nomination: {
    ...augerDeclaration.nomination!,
    factKey: 'nominated:invented',
    evidenceSpan: 'a nitrogen purge line runs beside the plenum',
  },
};
const x5 = checkBindingDeclarations([inventedHazard], hsA1Ledger(), VC08.observation);
ok('X5. a nomination whose evidence span is not verbatim in the observation is refused',
  !x5.perDeclaration[0].admitted
    && x5.perDeclaration[0].codes.includes('NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM'),
  'no invented hazard reaches the ledger');

const noDivergence: ClarificationDeclaration = {
  ...augerDeclaration,
  declarationId: 'X6',
  nomination: {
    ...augerDeclaration.nomination!,
    factKey: 'nominated:no-divergence',
    decisionIfA: 'work continues', decisionIfB: 'work continues',
  },
};
const x6 = checkBindingDeclarations([noDivergence], hsA1Ledger(), VC08.observation);
ok('X6. a nomination whose two branches lead to the same action is refused',
  !x6.perDeclaration[0].admitted
    && x6.perDeclaration[0].codes.includes('NOMINATION_DECISIONS_DO_NOT_DIVERGE'),
  'a fact whose answer changes nothing is not a clarification');

const handDeleted: OwedFactLedger = {
  ...a1After, facts: a1After.facts.filter(f => f.factKey !== FLAME_KEY),
};
ok('X7. a hand-built successor ledger with the owed fact deleted is caught',
  preservationViolations(a1After, handDeleted).some(v => v.startsWith('FACT_DELETED:'))
    && factsRemoved(a1After, handDeleted)[0] === FLAME_KEY,
  'FACT_DELETED is reported rather than silently accepted');

const detAttempt = classifyDeterministically({
  transportOk: true, degenerate: false, responseState: 'COMPLETE', contractAdmitted: true,
  clarificationEmitted: true, owedFactExists: true,
});
const x8bad = threw(() => assignHumanAdjudicatedOutcome(
  'VALID_BUT_TARGET_DISPLACED', 'DETERMINISTIC_EXECUTION_STATE', 'the model', 'it said so'));
const x8good = assignHumanAdjudicatedOutcome(
  'VALID_BUT_TARGET_DISPLACED', 'HUMAN_ADJUDICATION', 'product owner',
  'DISPLACED_FACT_VALID_DECISION_CRITICAL, 2026-09-04');
ok('X8. the displaced/invalid split is unreachable except through named human adjudication',
  detAttempt.outcome === UNKNOWN_SEMANTIC_VALIDITY
    && x8bad !== null && /SEMANTIC_OUTCOME_PROVENANCE_REFUSED/.test(x8bad)
    && x8good.provenance === 'HUMAN_ADJUDICATION'
    && humanAuthorityViolations([x8good]).length === 0
    && humanAuthorityViolations([{ ...x8good, provenance: 'DETERMINISTIC_EXECUTION_STATE' }])
      .some(v => /HUMAN_AUTHORITY_BYPASSED/.test(v)),
  `deterministic classification returns ${UNKNOWN_SEMANTIC_VALIDITY}; a forged provenance is caught`);

const nettedSummary = summariseOutcomes([
  x8good, x8good, x8good,
  assignHumanAdjudicatedOutcome('TARGET_REACHED', 'HUMAN_ADJUDICATION', 'product owner', 'reached'),
]);
const x9Netting = threw(() => assertRecallAndPrecisionNotNetted({
  ...nettedSummary, recall: { ...nettedSummary.recall, pass: 4 },
}));
ok('X9. a displaced outcome is a recall MISS and is refused as a recall success',
  nettedSummary.recall.pass === 1 && nettedSummary.recall.miss === 3
    && nettedSummary.precision.notADefect === 3 && nettedSummary.precision.defect === 0
    && x9Netting !== null && /RECALL_NETTED_AGAINST_PRECISION/.test(x9Netting),
  'recall 1 pass / 3 miss, precision 3 NOT_A_DEFECT / 0 defect — reported separately, never netted');

const coverageSrc = readFileSync(join(LIB, 'expert-target-coverage.ts'), 'utf8');
const bindingSrc = readFileSync(join(LIB, 'expert-owed-fact-binding.ts'), 'utf8');
const bindingBody = bindingSrc.slice(
  bindingSrc.indexOf('export function checkBindingDeclarations'),
  bindingSrc.indexOf('export function applyAdmittedDeclarations'));
const SEMANTIC_MATCHER_TOKENS = /similarit|embedding|cosine|jaccard|levenshtein|overlap|fuzzy|keyword/i;
ok('X10. neither the coverage postcondition nor the binding rule contains a semantic matcher',
  !SEMANTIC_MATCHER_TOKENS.test(coverageSrc)
    && !SEMANTIC_MATCHER_TOKENS.test(bindingBody)
    && !/\.question/.test(bindingBody)
    && COVERAGE_COMPUTATION_METHOD === 'DETERMINISTIC_CLOSED_SET_MEMBERSHIP_OVER_DECLARED_BINDINGS'
    && COVERAGE_DECISION_INPUTS.length === 5,
  'no similarity machinery; the admission rule never reads question text');

const x11 = threw(() => resolveDrawOutcome(
  [silentDraw(1), silentDraw(2), silentDraw(2)], true));
ok('X11. a third draw is refused structurally',
  x11 !== null && /DRAW_COUNT_OUT_OF_BOUNDS/.test(x11), x11!.split('—')[0].trim());

const x12Ledger = createOwedFactLedger('DEVELOPMENT',
  [1, 2, 3, 4].map(n => owedFact({ ...flameFact, factKey: `owed:q${n}`, source: 'DETERMINISTIC',
    priority: 'REQUIRED_CONTROL' })));
const x12 = selectQuestions(x12Ledger, 2);
ok('X12. the budget is never exceeded and every unselected fact is accounted for',
  x12.selected.length === 2 && x12.deferred.length === 2
    && x12.survivingInternally.length === 4
    && questionBudgetViolations(x12Ledger, x12).length === 0,
  '2 selected, 2 deferred and recorded, 4 preserved internally');

const beforeCov = evaluateTargetCoverage(hsA1Ledger(), []);
const forgedLedger: OwedFactLedger = {
  ...hsA1Ledger(),
  facts: [{ ...flameFact, status: 'COVERED' }],
};
const afterCov = evaluateTargetCoverage(forgedLedger, [FLAME_KEY]);
ok('X13. a warning that cleared with no recorded transition is caught',
  !afterCov.TARGET_COVERAGE_WARNING
    && unexplainedCoverageClearances(beforeCov, afterCov, forgedLedger)
      .some(v => /COVERAGE_CLEARED_WITHOUT_A_RECORDED_TRANSITION/.test(v)),
  'the postcondition never silently clears');

ok('X14. combination requires all four declared conditions and defaults to not combining',
  !mayCombine(flameFact, augerFact, [])
    && !mayCombine(flameFact, augerFact, [
      { factKey: FLAME_KEY, equipmentOrTaskKey: 'dryer',
        independentlyAnswerableInOneReply: true },
      { factKey: AUGER_KEY, equipmentOrTaskKey: 'auger',
        independentlyAnswerableInOneReply: true },
    ])
    && mayCombine(flameFact, augerFact, [
      { factKey: FLAME_KEY, equipmentOrTaskKey: 'dryer',
        independentlyAnswerableInOneReply: true },
      { factKey: AUGER_KEY, equipmentOrTaskKey: 'dryer',
        independentlyAnswerableInOneReply: true },
    ]),
  'no declaration → no combination; different equipment → no combination');

// ================================================================== composition + replays

console.log('\n--- COMPOSITION WITH THE DEGENERATE POLICY\n');

const degenerateFirst = decideDegeneratePolicy(
  { DEGENERATE_PROVIDER_OUTPUT: true, suspect: true, signals: ['PLACEHOLDER_KEY'] } as never,
  { purpose: 'CUSTOMER', reissueAttemptIndex: 0 });
const degenerateSecond = decideDegeneratePolicy(
  { DEGENERATE_PROVIDER_OUTPUT: true, suspect: true, signals: ['PLACEHOLDER_KEY'] } as never,
  { purpose: 'CUSTOMER', reissueAttemptIndex: 1 });
const degenerateGate = evaluateSecondDrawGate({
  observation: { ...silentDraw(1), degenerate: true },
  triggerPositive: true, unresolvedOwedFactRemains: true, budget: emptyProviderCallBudget(),
});
ok('C1. the degenerate policy is unchanged and the reliability layer never reissues a degenerate '
  + 'response',
degenerateFirst.decision === 'REISSUE_ONCE'
    && degenerateSecond.decision === 'FAIL_CLOSED_AFTER_REISSUE'
    && degenerateGate.state === 'DEGENERATE_POLICY_PATH'
    && degenerateGate.SECOND_DRAW_ELIGIBLE === false,
`degenerate → ${degenerateGate.state}; the reliability gate declines jurisdiction`);

ok('C2. the composition order is the frozen one',
  STATE_MACHINE_COMPOSITION.join(' → ') === [
    'TRANSPORT', 'RESPONSE_STATE_CLASSIFICATION', 'DEGENERATE_HANDLING', 'CONTRACT_ADMISSION',
    'SEMANTIC_RELIABILITY_DRAW_HANDLING', 'OWED_FACT_COVERAGE', 'ARBITRATION', 'QUESTION_BUDGET',
    'FINAL_AUGMENTATION'].join(' → '),
  `${STATE_MACHINE_COMPOSITION.length} stages`);

console.log('\n--- REPLAY OF THE REAL §163 DRAWS THROUGH THE BINDING ARCHITECTURE\n');

/**
 * The mapping, stated once: a draw's RECORDED `sourceMode` decides its binding mode. Nothing reads
 * the question text. `SUPPLIED_FACT` binds the supplied owed key; `NOMINATED_FACT` nominates
 * additively; an admitted silence declares nothing.
 */
function replay(
  ledgerFactory: () => OwedFactLedger, observation: string, draws: DrawRecord[], suppliedKey: string,
): { erased: number; coexisted: number; warningTrue: number; covered: number } {
  let erased = 0; let coexisted = 0; let warningTrue = 0; let covered = 0;
  for (const d of draws) {
    const before = ledgerFactory();
    const decls: ClarificationDeclaration[] = [];
    if (d.contractAdmitted && d.clarificationEmitted && d.sourceMode === 'SUPPLIED_FACT') {
      decls.push({ ...flameDeclaration, declarationId: `R${d.draw}`, coversFactKey: suppliedKey,
        question: d.question ?? '' });
    } else if (d.contractAdmitted && d.clarificationEmitted && d.sourceMode === 'NOMINATED_FACT') {
      decls.push({ ...augerDeclaration, declarationId: `R${d.draw}`,
        nomination: { ...augerDeclaration.nomination!, factKey: `${AUGER_KEY}:${d.draw}` },
        question: d.question ?? '' });
    }
    const check = checkBindingDeclarations(decls, before, observation);
    const after = applyAdmittedDeclarations(before, check);
    const cov = evaluateTargetCoverage(after, check.boundFactKeys, bindingMap(check));
    if (factsRemoved(before, after).length > 0) erased += 1;
    if (after.facts.length > before.facts.length && factOf(after, suppliedKey)) coexisted += 1;
    if (cov.TARGET_COVERAGE_WARNING) warningTrue += 1;
    if (factOf(after, suppliedKey)!.status === 'COVERED') covered += 1;
    if (bindingSideEffects(before, after, check).length > 0) erased += 1;
  }
  return { erased, coexisted, warningTrue, covered };
}

const a1Replay = replay(hsA1Ledger, VC08.observation, A1_DRAWS, FLAME_KEY);
ok('R1. HS-A1 — across all 10 real draws the owed flame-failure fact is never erased',
  A1_DRAWS.length === 10 && a1Replay.erased === 0 && a1Replay.coexisted === 7
    && a1Replay.covered === 3 && a1Replay.warningTrue === 7,
  `0 erasures · 7 draws carried both facts · 3 draws bound the owed key · `
  + `TARGET_COVERAGE_WARNING true on ${a1Replay.warningTrue}/10`);

const e1Replay = replay(hsE1Ledger, VC04.observation, E1_DRAWS, INTERLOCK_KEY);
ok('R2. HS-E1 — across all 10 real draws the owed interlock fact is never erased',
  E1_DRAWS.length === 10 && e1Replay.erased === 0 && e1Replay.covered === 0
    && e1Replay.warningTrue === 10,
  `0 erasures · 0 draws bound the owed key · TARGET_COVERAGE_WARNING true on `
  + `${e1Replay.warningTrue}/10`);

// ---------------------------------------------------------------- hosted-execution containment

const selfSrc = readFileSync(__filename, 'utf8');
const libFiles = ['expert-owed-facts.ts', 'expert-owed-fact-binding.ts', 'expert-target-coverage.ts',
  'expert-question-budget.ts', 'expert-bounded-reliability-state-machine.ts',
  'expert-reliability-observability.ts', 'expert-semantic-outcome-v2.ts'];
const libSrc = libFiles.map(f => readFileSync(join(LIB, f), 'utf8')).join('\n');
/** Assembled from fragments so that this file's own guard cannot match itself. */
const PROVIDER_TOKENS = ['fet' + 'ch(', 'ANTHROPIC_' + 'API_KEY', 'anthro' + 'pic',
  'clau' + 'de-', 'process.' + 'env'];
const providerHits = PROVIDER_TOKENS
  .filter(t => libSrc.toLowerCase().includes(t.toLowerCase()));
const srcImports = libSrc.split('\n')
  .filter(l => /^import[\s\S]*from '\.\.\/(\.\.\/)?src\//.test(l));
const selfCredentialImports = selfSrc.split('\n')
  .filter(l => /^import /.test(l) && /(dotenv|\/src\/)/.test(l));
ok('C3. no new module imports from src/, names a provider, or can issue a network request',
  providerHits.length === 0 && srcImports.length === 0 && selfCredentialImports.length === 0,
  `${libFiles.length} modules · ${srcImports.length} src/ imports · ${providerHits.length} `
  + `provider/network/credential tokens · this suite imports no credential loader`);

let refusedDraw: string | null = null;
void (async () => {
  try { await runBoundedDraws({ triggerPositive: true, unresolvedOwedFactRemains: true,
    owedFactExists: true }); } catch (e) { refusedDraw = (e as Error).message; }
})();

// ---------------------------------------------------------------- report

setTimeout(() => {
  ok('C4. the default draw function refuses to execute',
    refusedDraw !== null && /HOSTED_EXECUTION_NOT_AUTHORIZED/.test(String(refusedDraw)),
    ACTIVATION_STATUS);
  ok('C5. every frozen enum is the size §164 specified',
    SEMANTIC_OUTCOMES_V2.length === 9 && OWED_FACT_STATUSES.length === 4
      && OWED_FACT_SOURCES.length === 5 && TRANSITION_AUTHORITIES.length === 3
      && COVERAGE_RESPONSES.length === 3 && HUMAN_AUTHORITY_ONLY_OUTCOMES.length === 4
      && Object.keys(SEMANTIC_OUTCOME_V2_PROPERTIES).length === 9
      && Object.keys(PROVIDER_CALL_CHANNELS).length === 4,
    '9 outcomes · 4 statuses · 5 sources · 3 authorities · 3 responses · 4 channels');
  ok('C6. permitted responses to a warning are the bounded ordered three',
    permittedResponses(a1Coverage).join(' → ') === COVERAGE_RESPONSES.join(' → ')
      && permittedResponses(jCoverage).length === 0,
    'no "accept anyway" member exists');

  console.log('\n' + '='.repeat(100));
  console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
  console.log(`  PROVIDER CALLS: 0   COST: $0.00   DATABASE ACCESS: none   src/ CHANGES: none`);
  console.log('='.repeat(100));
  if (failed > 0) {
    console.log('\nFAILED:');
    for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
    process.exit(1);
  }
}, 25);
