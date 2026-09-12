/**
 * §166 EXPERT HAZLENZ -- VERIFIER-v3 BINDING PROTOCOL LOCAL PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE ACCESS. NOTHING IN `src/` IS TOUCHED OR IMPORTED.
 *
 * Cases A-X are the §166 authorization's matrix, in its order, with its letters. Y1-Y14 are the
 * adversarial malformed cases the matrix requires in addition. D1-D4 prove the semantic-preservation
 * diff, and C1-C5 prove confinement.
 *
 * The HS-A1 and HS-E1 material is read from the real §156 blinded packet on disk and hashed, so no
 * observation text is retyped here.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA, OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3,
  buildVerifierV3UserPrompt, type V3SuppliedOwedFact,
} from './lib/expert-verifier-instruction-v3';
import {
  checkVerifierV3Output, bridgeV3OutputToLedgerInputs, verifierV3Effect,
  EXPERT_VERIFIER_CONTRACT_V3_VERSION, V3_ADMISSION_CODES, HUMAN_TRUTH_PROVENANCE_FIELDS,
  type ExpertVerifierV3Output, type V3AdmissionCode,
} from './lib/expert-verifier-contract-v3';
import { EXPERT_VERIFIER_V2_SYSTEM_PROMPT } from './lib/expert-verifier-instruction-v2';
import {
  classifyInstructionDiff, survivingBlockFailures, CONTRACT_FIELD_CHANGES,
  CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT, V2_BLOCKS_THAT_MUST_SURVIVE,
} from './lib/expert-verifier-v2-v3-diff';
import {
  type OwedFact, type OwedFactLedger,
  owedFact, createOwedFactLedger, transition, factOf, factsRemoved, preservationViolations,
  unresolvedFacts,
} from './lib/expert-owed-facts';
import {
  type ClarificationDeclaration,
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects, bindingMap,
} from './lib/expert-owed-fact-binding';
import { evaluateTargetCoverage } from './lib/expert-target-coverage';
import {
  emptyProviderCallBudget, recordProviderCall, assertCallCapInternallyConsistent,
  MAX_PROVIDER_CALLS_PER_ANALYSIS, MAX_RELIABILITY_DRAWS, PROVIDER_CALL_CHANNELS,
} from './lib/expert-bounded-reliability-state-machine';
import {
  emptyObservabilityRecord, appendAttempt, observabilityViolations,
  type VerifierAttemptObservation,
} from './lib/expert-reliability-observability';
import { classifyDeterministically } from './lib/expert-semantic-outcome-v2';

const ROOT = join(__dirname, '..', '..');
const PACKET = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03',
  'VERIFIER-PACKET.json');
const LIB = join(__dirname, 'lib');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

interface PacketCase { caseId: string; observation: string; jurisdiction: string;
  governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: { candidates: Array<{ candidateKey: string; hazardFamily: string;
    assertedConditionState: string; evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[]; summary: string }; }
const packet = JSON.parse(readFileSync(PACKET, 'utf8')) as { cases: PacketCase[] };
const VC08 = packet.cases.find(c => c.caseId === 'VC-08')!;
const VC04 = packet.cases.find(c => c.caseId === 'VC-04')!;

console.log('§166 VERIFIER-v3 BINDING PROTOCOL — LOCAL PROOF MATRIX');
console.log('='.repeat(100));
console.log(`  instruction  ${EXPERT_VERIFIER_INSTRUCTION_V3_VERSION}  `
  + `${sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT).slice(0, 32)}…`);
console.log(`  contract     ${EXPERT_VERIFIER_CONTRACT_V3_VERSION}`);
console.log(`  packet       ${createHash('sha256').update(readFileSync(PACKET)).digest('hex')
  .slice(0, 32)}…\n`);

// ---------------------------------------------------------------- fixtures

const FLAME_KEY = 'owed:hs-a1:flame_failure_safeguard_functional_status';
const AUGER_KEY = 'owed:hs-a1:discharge_auger_drive_isolation_state';
const INTERLOCK_KEY = 'owed:hs-e1:rotor_guard_interlock_function_verified';

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

/** The §165-adjudicated auger fact, in the owner's narrower terms. No regulatory claim encoded. */
const augerFact: OwedFact = owedFact({
  factKey: AUGER_KEY,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DEVELOPMENT_HUMAN_TRUTH',
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

const asSupplied = (f: OwedFact): V3SuppliedOwedFact => ({
  factKey: f.factKey,
  affectedDecision: f.affectedDecision,
  whyUnresolved: f.whyUnresolved,
  branchA: f.branchA,
  branchB: f.branchB,
  decisionDivergence: f.decisionDivergence,
  evidenceSpan: f.evidenceSpan,
});

const ledgerOf = (...facts: OwedFact[]): OwedFactLedger =>
  createOwedFactLedger('DEVELOPMENT', facts);

const AUGER_NOMINATION = {
  missingFact: 'whether the discharge auger drive was isolated before the blockage was cleared',
  observationSpan:
    'An operative is clearing a blockage at the discharge auger with the dryer running.',
  notEstablishedBecause: 'the span states the dryer is running and states nothing about the energy '
    + 'state of the auger drive either way',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the auger drive was isolated before the operative began',
  decisionIfA: 'clearing the blockage may continue as observed',
  branchB: 'the auger drive remains capable of powered motion',
  decisionIfB: 'whether clearing may safely continue is not established',
  whyNecessaryNow: 'the operative is at the discharge point now',
};

const CLARIFICATION = {
  question: 'Has the burner flame-failure safeguard been function-tested or otherwise verified as '
    + 'operating correctly?',
  whyItMatters: 'a safeguard that cannot be seen is not a safeguard that was checked',
  affectedDecision: 'REQUIRED_CONTROL',
  evidenceGap: 'the observation does not state the safeguard\'s functional status',
};

type Decl = { factKey: string; declaration: string; challengeReason: string | null };
function v3(over: Partial<Record<string, unknown>> = {}): unknown {
  return {
    verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
    analysisId: 'T1',
    verdict: 'ADD_OR_REPLACE_CLARIFICATION',
    rationale: 'the safeguard cannot be seen and its status changes what is done today',
    clarificationSourceMode: 'SUPPLIED_FACT',
    proposedClarification: CLARIFICATION,
    bindingFactKey: FLAME_KEY,
    nominatedFact: null,
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
    ] as Decl[],
    ...over,
  };
}
const check = (raw: unknown, keys: readonly string[], obs = VC08.observation, id = 'T1') =>
  checkVerifierV3Output(raw, { analysisId: id, observation: obs, suppliedOwedFactKeys: keys });

const has = (codes: readonly V3AdmissionCode[], c: V3AdmissionCode) => codes.includes(c);

/** Run an admitted v3 output all the way through the §165 ledger and return the end state. */
function applyToLedger(
  output: unknown, ledger: OwedFactLedger, observation: string, id = 'T1',
): { admitted: boolean; codes: readonly V3AdmissionCode[]; after: OwedFactLedger;
  coverage: ReturnType<typeof evaluateTargetCoverage>; arbitrationRequests: number;
  sideEffects: string[] } {
  const keys = ledger.facts.map(f => f.factKey);
  const admission = check(output, keys, observation, id);
  const bridged = bridgeV3OutputToLedgerInputs(
    output as ExpertVerifierV3Output, admission, { analysisId: id,
      nominatedPriority: 'REQUIRED_CONTROL' });
  const bindingCheck = checkBindingDeclarations(
    bridged.declarations as ClarificationDeclaration[], ledger, observation);
  const after = applyAdmittedDeclarations(ledger, bindingCheck);
  return {
    admitted: admission.admitted,
    codes: admission.codes,
    after,
    coverage: evaluateTargetCoverage(after, bindingCheck.boundFactKeys, bindingMap(bindingCheck)),
    arbitrationRequests: bridged.arbitrationRequests.length,
    sideEffects: bindingSideEffects(ledger, after, bindingCheck),
  };
}

// ================================================================== A–D : binding and additivity

console.log('--- A–D  BINDING, MULTIPLE SUPPLIED FACTS, AND ADDITIVITY\n');

const a = applyToLedger(v3(), ledgerOf(flameFact), VC08.observation);
ok('A. one supplied fact + a correct binding is admitted and covers exactly it',
  a.admitted && factOf(a.after, FLAME_KEY)!.status === 'COVERED'
    && !a.coverage.TARGET_COVERAGE_WARNING && a.sideEffects.length === 0,
  'admitted, COVERED via ADMITTED_BINDING, warning FALSE, 0 side effects');

const twoFactLedger = () => ledgerOf(flameFact, augerFact);
const bOut = v3({
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
    { factKey: AUGER_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const b = applyToLedger(bOut, twoFactLedger(), VC08.observation);
ok('B. two supplied facts, binding the first leaves the second UNRESOLVED',
  b.admitted && factOf(b.after, FLAME_KEY)!.status === 'COVERED'
    && factOf(b.after, AUGER_KEY)!.status === 'UNRESOLVED'
    && b.coverage.TARGET_COVERAGE_WARNING
    && b.coverage.uncoveredFactKeys.length === 1
    && b.coverage.uncoveredFactKeys[0] === AUGER_KEY,
  `warning TRUE, uncovered=[${b.coverage.uncoveredFactKeys.map(k => k.split(':').pop())}]`);

const cOut = v3({
  clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
  nominatedFact: {
    ...AUGER_NOMINATION,
    missingFact: 'whether the plenum access door interlock was refitted after the last clean',
    observationSpan: 'Grain dust has settled on the horizontal surfaces of the walkway',
  },
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
    { factKey: AUGER_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const c = applyToLedger(cOut, twoFactLedger(), VC08.observation);
ok('C. two supplied facts + binding the first + an additive nomination: all three representable',
  c.admitted && c.after.facts.length === 3
    && factOf(c.after, FLAME_KEY)!.status === 'COVERED'
    && factOf(c.after, AUGER_KEY)!.status === 'UNRESOLVED'
    && c.after.facts.some(f => f.source === 'VERIFIER_NOMINATION')
    && c.coverage.TARGET_COVERAGE_WARNING,
  `${c.after.facts.length} facts in the ledger; the nominated one is UNRESOLVED alongside both`);

ok('D. the additive nomination did not delete the second supplied fact',
  factsRemoved(twoFactLedger(), c.after).length === 0
    && preservationViolations(twoFactLedger(), c.after)
      .filter(v => v.startsWith('FACT_DELETED')).length === 0
    && !!factOf(c.after, AUGER_KEY),
  '0 facts removed, 0 deletion violations');

// ================================================================== E–F : invalid binding keys

console.log('\n--- E–F  A BINDING KEY IS A CLOSED-SET MEMBER OR IT IS NOTHING\n');

const e = check(v3({ bindingFactKey: 'owed:not-in-the-set',
  owedFactDeclarations: [{ factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED',
    challengeReason: null }] }), [FLAME_KEY]);
ok('E. a binding to a nonexistent factKey is refused',
  !e.admitted && has(e.codes, 'BINDING_KEY_NOT_IN_SUPPLIED_SET'), e.detail[0]);

const typo = `${FLAME_KEY.slice(0, -1)}` + 'S';
const f = check(v3({ bindingFactKey: typo,
  owedFactDeclarations: [{ factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED',
    challengeReason: null }] }), [FLAME_KEY]);
const upper = check(v3({ bindingFactKey: FLAME_KEY.toUpperCase(),
  owedFactDeclarations: [{ factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED',
    challengeReason: null }] }), [FLAME_KEY]);
ok('F. a one-character typo and a case change are BOTH refused — no fuzzy match exists',
  !f.admitted && has(f.codes, 'BINDING_KEY_NOT_IN_SUPPLIED_SET')
    && !upper.admitted && has(upper.codes, 'BINDING_KEY_NOT_IN_SUPPLIED_SET'),
  'exact string equality, no normalisation, no nearest neighbour');

// ================================================================== G : no free-text coverage

console.log('\n--- G  FREE TEXT CANNOT CLEAR COVERAGE\n');

const gOut = v3({
  clarificationSourceMode: 'NOMINATED_FACT',
  bindingFactKey: null,
  // A question whose words match the owed fact almost exactly, deliberately.
  proposedClarification: {
    ...CLARIFICATION,
    question: 'Is the flame-failure safeguard functional and has loss-of-flame shutdown been '
      + 'function-tested?',
  },
  nominatedFact: AUGER_NOMINATION,
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const g = applyToLedger(gOut, ledgerOf(flameFact), VC08.observation);
ok('G. a question that matches the owed fact word for word but binds nothing clears no coverage',
  g.admitted && factOf(g.after, FLAME_KEY)!.status === 'UNRESOLVED'
    && g.coverage.TARGET_COVERAGE_WARNING
    && g.coverage.uncoveredFactKeys[0] === FLAME_KEY,
  'admitted as a valid nomination; the owed fact stays UNRESOLVED because nothing bound it');

// ================================================================== H–I : silence

console.log('\n--- H–I  SILENCE RESOLVES NOTHING\n');

const noOut = v3({
  verdict: 'NO_CLARIFICATION_REQUIRED',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [
    { factKey: INTERLOCK_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const h = applyToLedger(noOut, ledgerOf(interlockFact), VC04.observation);
ok('H. NO_CLARIFICATION_REQUIRED with an unresolved supplied fact leaves the warning standing',
  h.admitted && factOf(h.after, INTERLOCK_KEY)!.status === 'UNRESOLVED'
    && h.coverage.TARGET_COVERAGE_WARNING && h.after.transitions.length === 0,
  'admitted, 0 transitions, warning TRUE');

let twoNoLedger = ledgerOf(interlockFact);
for (const draw of [1, 2]) {
  const r = applyToLedger(noOut, twoNoLedger, VC04.observation, 'T1');
  twoNoLedger = r.after;
  void draw;
}
const twoNoCoverage = evaluateTargetCoverage(twoNoLedger, []);
ok('I. two consecutive NO declarations make no fact COVERED',
  !twoNoLedger.facts.some(x => x.status === 'COVERED')
    && twoNoLedger.transitions.length === 0
    && twoNoCoverage.TARGET_COVERAGE_WARNING,
  'no COVERED fact, 0 transitions, warning still TRUE after both draws');

// ================================================================== J–L : challenge and arbitration

console.log('\n--- J–L  A CHALLENGE IS A REQUEST; HAZLENZ OWNS THE TRANSITION\n');

const challengeOut = v3({
  verdict: 'NO_CLARIFICATION_REQUIRED',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'CHALLENGE_FACT_VALIDITY',
      challengeReason: 'the observation states the shroud obstructs the view but states no fact '
        + 'suggesting the safeguard is out of service' },
  ],
});
const j = applyToLedger(challengeOut, ledgerOf(flameFact), VC08.observation);
const jAdmission = check(challengeOut, [FLAME_KEY]);
ok('J. a challenge produces an arbitration request and does NOT clear the fact',
  j.admitted && j.arbitrationRequests === 1
    && factOf(j.after, FLAME_KEY)!.status === 'UNRESOLVED'
    && j.after.transitions.length === 0
    && j.coverage.TARGET_COVERAGE_WARNING
    && jAdmission.challengedFactKeys[0] === FLAME_KEY,
  '1 arbitration request, fact UNRESOLVED, 0 transitions, warning TRUE');

const bridged = bridgeV3OutputToLedgerInputs(
  challengeOut as ExpertVerifierV3Output, jAdmission, { analysisId: 'T1' });
ok('K. a challenge that is not upheld leaves the original fact exactly where it was',
  bridged.arbitrationRequests[0].settles === false
    && bridged.arbitrationRequests[0].factStatusUnchanged === true
    && bridged.declarations.length === 0
    && verifierV3Effect('NO_CLARIFICATION_REQUIRED', false).challengeMaySettleAFact === false
    && preservationViolations(ledgerOf(flameFact), j.after).length === 0,
  'the request carries settles:false as a literal type and produces no ledger declaration');

const lLedger = transition(j.after, {
  factKey: FLAME_KEY, to: 'REJECTED_BY_ARBITRATION', authority: 'RECORDED_ARBITRATION',
  justification: 'arbitration upheld the challenge; reason recorded in the arbitration record',
});
ok('L. arbitration CAN reject the fact, but only through the HazLenz-owned transition',
  factOf(lLedger, FLAME_KEY)!.status === 'REJECTED_BY_ARBITRATION'
    && lLedger.transitions.length === 1
    && lLedger.transitions[0].authority === 'RECORDED_ARBITRATION'
    && !evaluateTargetCoverage(lLedger, []).TARGET_COVERAGE_WARNING,
  'RECORDED_ARBITRATION, 1 transition, warning clears only now');

// ================================================================== M : sibling coverage

console.log('\n--- M  ONE FACT DOES NOT COVER ANOTHER, HOWEVER SIMILAR THE TEXT\n');

const SIBLING_KEY = 'owed:hs-a1:flame_failure_safeguard_functional_status.wiring';
const siblingFact = owedFact({
  ...flameFact,
  factKey: SIBLING_KEY,
  whyUnresolved: flameFact.whyUnresolved,   // deliberately identical prose
});
const mOut = v3({
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
    { factKey: SIBLING_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const m = applyToLedger(mOut, ledgerOf(flameFact, siblingFact), VC08.observation);
ok('M. binding fact A leaves fact B uncovered even with byte-identical descriptive text',
  m.admitted && factOf(m.after, FLAME_KEY)!.status === 'COVERED'
    && factOf(m.after, SIBLING_KEY)!.status === 'UNRESOLVED'
    && m.coverage.uncoveredFactKeys[0] === SIBLING_KEY
    && m.sideEffects.length === 0,
  'identical whyUnresolved prose; only the bound key moved');

// ================================================================== N–P : nomination shape

console.log('\n--- N–P  THE NOMINATION CEILING AND THE SOURCE-MODE AGREEMENT RULE\n');

const n1 = check(v3({
  clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
  nominatedFact: [AUGER_NOMINATION, AUGER_NOMINATION],
}), [FLAME_KEY]);
ok('N. more than one nomination is refused; the ceiling is one and the field is not a list',
  !n1.admitted && has(n1.codes, 'MORE_THAN_ONE_NOMINATION'),
  'a nomination is one object, never a list');

const o1 = check(v3({
  clarificationSourceMode: null,
  nominatedFact: AUGER_NOMINATION,
}), [FLAME_KEY]);
ok('O. a nomination with no source mode is refused',
  !o1.admitted && has(o1.codes, 'SOURCE_MODE_MISSING_ON_A_CLARIFICATION'),
  o1.detail[0]);

const p1 = check(v3({
  clarificationSourceMode: 'NOMINATED_FACT',
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{ factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED',
    challengeReason: null }],
}), [FLAME_KEY]);
const p2 = check(v3({
  clarificationSourceMode: 'SUPPLIED_FACT',
  nominatedFact: AUGER_NOMINATION,
}), [FLAME_KEY]);
ok('P. a nominating source mode with no nomination — and a supplied mode carrying one — are refused',
  !p1.admitted && has(p1.codes, 'NOMINATION_REQUIRED_FOR_THIS_SOURCE_MODE')
    && !p2.admitted && has(p2.codes, 'SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD'),
  'the declared mode must agree with the payload in both directions');

// ================================================================== Q–T : carried §165 invariants

console.log('\n--- Q–T  INVARIANTS CARRIED FORWARD FROM §165, RE-PROVEN UNDER v3\n');

const qOut = v3({
  verdict: 'NO_CLARIFICATION_REQUIRED',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  rationale: 'I have fully covered and resolved the flame-failure question in my reasoning above, '
    + 'so this fact should be considered answered and closed.',
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
  ],
});
const q = applyToLedger(qOut, ledgerOf(flameFact), VC08.observation);
ok('Q. a rationale asserting coverage mutates nothing',
  q.admitted && factOf(q.after, FLAME_KEY)!.status === 'UNRESOLVED'
    && q.coverage.TARGET_COVERAGE_WARNING && q.after.transitions.length === 0,
  'the verdict is admitted and the claim in its prose has no effect whatsoever');

let rThrew = '';
try { createOwedFactLedger('PRODUCTION', [flameFact]); } catch (err) { rThrew = (err as Error).message; }
ok('R. development human truth still cannot enter a production ledger under v3',
  /DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION/.test(rThrew), 'throws at creation');

const attempt = (seq: number, drawIndex: number): VerifierAttemptObservation => ({
  attemptSeq: seq, channel: 'RELIABILITY_DRAW', drawIndex, transportOk: true,
  responseState: 'COMPLETE', degenerate: false, contractAdmitted: true, admissionCodes: [],
  verdict: 'NO_CLARIFICATION_REQUIRED', clarificationEmitted: false, rawPreserved: true,
  costUsd: 0.0172, latencyMs: 7623,
});
const obs0 = emptyObservabilityRecord('T1', 'DEVELOPMENT', [interlockFact],
  classifyDeterministically({ transportOk: true, degenerate: false, responseState: 'COMPLETE',
    contractAdmitted: true, clarificationEmitted: false, owedFactExists: true }));
const obs1 = appendAttempt(obs0, attempt(1, 1));
const obs2 = appendAttempt(obs1, attempt(2, 2));
const tampered = { ...obs2, attempts: [attempt(1, 2), obs2.attempts[1]] };
ok('S. raw verifier attempts remain append-only under v3',
  obs2.attempts.length === 2 && observabilityViolations(obs1, obs2).length === 0
    && observabilityViolations(obs2, tampered).some(v => /ATTEMPT_OVERWRITTEN/.test(v)),
  '2 attempts preserved; an edited first attempt is reported');

assertCallCapInternallyConsistent();
let budget = emptyProviderCallBudget();
for (const ch of ['FIRST_PASS', 'DEGENERATE_REISSUE', 'RELIABILITY_DRAW', 'RELIABILITY_DRAW',
  'COVERAGE_RECHECK'] as const) budget = recordProviderCall(budget, ch);
let overCap = '';
try { recordProviderCall(budget, 'RELIABILITY_DRAW'); } catch (err) { overCap = (err as Error).message; }
ok('T. the call-budget invariants are unchanged by the protocol revision',
  MAX_PROVIDER_CALLS_PER_ANALYSIS === 5 && MAX_RELIABILITY_DRAWS === 2
    && Object.keys(PROVIDER_CALL_CHANNELS).length === 4 && budget.total === 5
    && /CHANNEL_CEILING_REACHED/.test(overCap),
  '5-call cap, 4 channels, unchanged');

// ================================================================== U–X : the two real shapes

console.log('\n--- U–X  THE HS-A1 AND HS-E1 SHAPES THE EXPERIMENT WILL TEST\n');

const uOut = v3({
  clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
  bindingFactKey: FLAME_KEY,
  nominatedFact: AUGER_NOMINATION,
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
  ],
});
const u = applyToLedger(uOut, ledgerOf(flameFact), VC08.observation);
ok('U. HS-A1 — bind the flame-failure target AND nominate the auger gap in ONE response',
  u.admitted && factOf(u.after, FLAME_KEY)!.status === 'COVERED'
    && u.after.facts.length === 2
    && u.after.facts.some(x => x.source === 'VERIFIER_NOMINATION'
      && x.status === 'UNRESOLVED'),
  'the shape §165 proved v2 REFUSES is admitted by v3, and both facts survive');

const vOut = v3({
  bindingFactKey: AUGER_KEY,
  proposedClarification: {
    ...CLARIFICATION,
    question: 'Has the discharge auger drive been isolated or de-energised before the operative '
      + 'began clearing the blockage?',
  },
  owedFactDeclarations: [
    { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null },
    { factKey: AUGER_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
  ],
});
const vRes = applyToLedger(vOut, twoFactLedger(), VC08.observation);
const vUnsupplied = check(v3({ bindingFactKey: AUGER_KEY,
  owedFactDeclarations: [{ factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED',
    challengeReason: null }] }), [FLAME_KEY]);
ok('V. HS-A1 — the auger fact can be bound ONLY when it was supplied, and the target survives either way',
  vRes.admitted && factOf(vRes.after, AUGER_KEY)!.status === 'COVERED'
    && factOf(vRes.after, FLAME_KEY)!.status === 'UNRESOLVED'
    && vRes.coverage.uncoveredFactKeys[0] === FLAME_KEY
    && !vUnsupplied.admitted && has(vUnsupplied.codes, 'BINDING_KEY_NOT_IN_SUPPLIED_SET'),
  'bound when supplied; refused when not; the flame-failure target stays uncovered in both');

const wOut = v3({
  bindingFactKey: INTERLOCK_KEY,
  proposedClarification: {
    ...CLARIFICATION,
    question: 'Was the guard interlock protective function verified after the rotor tooth change '
      + 'and before the debarker was returned to service?',
  },
  owedFactDeclarations: [
    { factKey: INTERLOCK_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
  ],
});
const w = applyToLedger(wOut, ledgerOf(interlockFact), VC04.observation);
ok('W. HS-E1 — the interlock-function fact can be bound',
  w.admitted && factOf(w.after, INTERLOCK_KEY)!.status === 'COVERED'
    && !w.coverage.TARGET_COVERAGE_WARNING,
  'COVERED via ADMITTED_BINDING; warning clears');

ok('X. HS-E1 — a NO verdict leaves the target coverage warning TRUE',
  h.coverage.TARGET_COVERAGE_WARNING && h.coverage.uncoveredFactKeys[0] === INTERLOCK_KEY,
  'the §163 settled-silence shape now leaves a live, named, uncovered key');

// ================================================================== Y : adversarial

console.log('\n--- Y  ADVERSARIAL MALFORMED CASES\n');

const adversarial: Array<[string, unknown, V3AdmissionCode, readonly string[]]> = [
  ['Y1. an undeclared supplied fact', v3({
    owedFactDeclarations: [] }), 'OWED_FACT_NOT_DECLARED', [FLAME_KEY]],
  ['Y2. a declaration for a key that was not supplied', v3({
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
      { factKey: 'owed:invented', declaration: 'STILL_UNRESOLVED', challengeReason: null }] }),
  'OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', [FLAME_KEY]],
  ['Y3. the same key declared twice', v3({
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
      { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null }] }),
  'OWED_FACT_DECLARATION_DUPLICATED', [FLAME_KEY]],
  ['Y4. two facts declared bound at once', v3({
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
      { factKey: AUGER_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }] }),
  'MORE_THAN_ONE_FACT_DECLARED_BOUND', [FLAME_KEY, AUGER_KEY]],
  ['Y5. a bound declaration disagreeing with bindingFactKey', v3({
    bindingFactKey: FLAME_KEY,
    owedFactDeclarations: [
      { factKey: AUGER_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null },
      { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null }] }),
  'BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY', [FLAME_KEY, AUGER_KEY]],
  ['Y6. a challenge with no reason', v3({
    verdict: 'NO_CLARIFICATION_REQUIRED', clarificationSourceMode: null,
    proposedClarification: null, bindingFactKey: null,
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: '  ' }] }),
  'CHALLENGE_WITHOUT_A_REASON', [FLAME_KEY]],
  ['Y7. a challenge smuggling a settlement flag', v3({
    verdict: 'NO_CLARIFICATION_REQUIRED', clarificationSourceMode: null,
    proposedClarification: null, bindingFactKey: null,
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: 'already settled', factNotDecisionCritical: true }] }),
  'CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT', [FLAME_KEY]],
  ['Y8. a silent verdict declaring a fact bound', v3({
    verdict: 'NO_CLARIFICATION_REQUIRED', clarificationSourceMode: null,
    proposedClarification: null, bindingFactKey: null,
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }] }),
  'BOUND_DECLARATION_WITHOUT_A_CLARIFICATION', [FLAME_KEY]],
  ['Y9. a binding key on a silent verdict', v3({
    verdict: 'NO_CLARIFICATION_REQUIRED', clarificationSourceMode: null,
    proposedClarification: null,
    owedFactDeclarations: [
      { factKey: FLAME_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null }] }),
  'BINDING_DECLARED_BY_A_NON_ADD_VERDICT', [FLAME_KEY]],
  ['Y10. a nomination whose span is not verbatim', v3({
    clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
    nominatedFact: { ...AUGER_NOMINATION,
      observationSpan: 'a nitrogen purge line runs beside the plenum' } }),
  'OBSERVATION_SPAN_NOT_VERBATIM', [FLAME_KEY]],
  ['Y11. a nomination whose branches lead to the same action', v3({
    clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
    nominatedFact: { ...AUGER_NOMINATION, decisionIfA: 'work continues',
      decisionIfB: 'work continues' } }), 'DECISIONS_DO_NOT_DIVERGE', [FLAME_KEY]],
  ['Y12. a nomination that renames a supplied key', v3({
    clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
    nominatedFact: { ...AUGER_NOMINATION, missingFact: FLAME_KEY } }),
  'NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY', [FLAME_KEY]],
  ['Y13. evaluation truth echoed back in the response', v3({
    disposition: 'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS' }),
  'HUMAN_TRUTH_PROVENANCE_IN_RESPONSE', [FLAME_KEY]],
  ['Y14. a forbidden collection returned alongside the verdict', v3({
    expertHazardCandidates: [{ candidateKey: 'x' }] }), 'FORBIDDEN_FIELD', [FLAME_KEY]],
];
for (const [id, output, expected, keys] of adversarial) {
  const r = check(output, keys);
  ok(id, !r.admitted && has(r.codes, expected), `refused with ${expected}`);
}

const y15 = check(v3({ bindingFactKey: { key: FLAME_KEY } as unknown as string }), [FLAME_KEY]);
ok('Y15. a non-string binding key is refused rather than coerced',
  !y15.admitted && has(y15.codes, 'BINDING_KEY_MALFORMED'), 'no coercion');
const y16 = check(v3({ owedFactDeclarations: 'BOUND' as unknown as [] }), [FLAME_KEY]);
ok('Y16. a non-array declaration block is refused',
  !y16.admitted && has(y16.codes, 'OWED_FACT_DECLARATIONS_MISSING'), 'must be an array');

// ================================================================== D : the semantic diff

console.log('\n--- D1–D4  SEMANTIC-PRESERVATION DIFF\n');

const diff = classifyInstructionDiff(EXPERT_VERIFIER_V2_SYSTEM_PROMPT,
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
ok('D1. every changed line is classified, and no classification is stale',
  diff.unclassifiedChanges.length === 0 && diff.staleClassifications.length === 0,
  `${diff.addedCount} added, ${diff.removedCount} removed, ${diff.blankLineChanges} blank; `
  + '0 unclassified, 0 stale');

ok('D2. SUBSTANTIVE_SEMANTIC_CHANGE_COUNT = 0',
  diff.SUBSTANTIVE_SEMANTIC_CHANGE_COUNT === 0
    && diff.V2_SEMANTIC_INSTRUCTION_PRESERVED_EXCEPT_BINDING_PROTOCOL,
  `binding-protocol ${diff.byClassification.BINDING_PROTOCOL_REQUIRED}, `
  + `schema-alignment ${diff.byClassification.SCHEMA_ALIGNMENT_REQUIRED}, substantive 0`);

const blockFailures = survivingBlockFailures(EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
ok('D3. every v2 block that must survive is present in v3, byte for byte',
  blockFailures.length === 0,
  `${V2_BLOCKS_THAT_MUST_SURVIVE.length} blocks checked positively, including the "usually NO" prior`);

const schemaProps = Object.keys(
  (VERIFIER_V3_RESPONSE_SCHEMA as { properties: Record<string, unknown> }).properties);
ok('D4. the contract diff matches the live schema and adds no substantive semantic change',
  CONTRACT_SUBSTANTIVE_SEMANTIC_CHANGE_COUNT === 0
    && schemaProps.includes('bindingFactKey') && schemaProps.includes('owedFactDeclarations')
    && !schemaProps.includes('aboutUnresolvedFactRef')
    && CONTRACT_FIELD_CHANGES.length === 6,
  `${CONTRACT_FIELD_CHANGES.length} field changes: 2 added, 2 removed, 2 redefined`);

// ================================================================== C : confinement

console.log('\n--- C  CONFINEMENT AND CONTRACT SURFACE\n');

const libFiles = ['expert-verifier-instruction-v3.ts', 'expert-verifier-contract-v3.ts',
  'expert-verifier-v2-v3-diff.ts'];
const libSrc = libFiles.map(f => readFileSync(join(LIB, f), 'utf8')).join('\n');
const PROVIDER_TOKENS = ['fet' + 'ch(', 'ANTHROPIC_' + 'API_KEY', 'anthro' + 'pic',
  'clau' + 'de-', 'process.' + 'env'];
const providerHits = PROVIDER_TOKENS.filter(t => libSrc.toLowerCase().includes(t.toLowerCase()));
const srcImports = libSrc.split('\n').filter(l => /^import[\s\S]*from '\.\.\/(\.\.\/)?src\//.test(l));
ok('C1. the v3 modules import nothing from src/ and can reach no provider',
  providerHits.length === 0 && srcImports.length === 0,
  `${libFiles.length} modules · 0 src/ imports · 0 provider tokens`);

const contractBody = readFileSync(join(LIB, 'expert-verifier-contract-v3.ts'), 'utf8');
/**
 * Comments are stripped before scanning. The guard is a claim about what the CODE does, and a
 * comment saying "no fuzzy match" must not be able to fail a test looking for the word "fuzzy" --
 * that would make the file harder to explain in order to make the guard pass.
 */
const executableOnly = (src: string): string => src.split('\n')
  .filter(l => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  }).join('\n');
const checkBody = executableOnly(contractBody.slice(
  contractBody.indexOf('export function checkVerifierV3Output'),
  contractBody.indexOf('export function verifierV3Effect')));
const MATCHER_TOKENS = /similarit|embedding|cosine|jaccard|levenshtein|contentOverlap|fuzzy|threshold|toLowerCase/i;
ok('C2. the v3 admission rule contains no semantic matcher and no lexical threshold',
  !MATCHER_TOKENS.test(checkBody) && !/DUPLICATE_OVERLAP_THRESHOLD/.test(contractBody),
  'binding is exact string equality; v2\'s 0.8 overlap threshold is dropped, not tightened');

ok('C3. an admitted v3 verdict may affect clarifications and coverage, and nothing else',
  (() => {
    const eff = verifierV3Effect('ADD_OR_REPLACE_CLARIFICATION', true);
    return eff.clarificationsMayChange && eff.owedFactCoverageMayChange
      && !eff.candidatesMayChange && !eff.citationsMayChange && !eff.deterministicMayChange
      && !eff.riskMayChange && !eff.correctiveActionsMayChange && !eff.insightsMayChange
      && !eff.disagreementsMayChange && eff.challengeMaySettleAFact === false;
  })(),
  'candidates, citations, deterministic output, risk, actions, insights and disagreements are all false');

const suppliedPrompt = buildVerifierV3UserPrompt({
  caseId: 'VC-08', observation: VC08.observation, jurisdiction: VC08.jurisdiction,
  governedEvidence: VC08.governedEvidence, deterministic: VC08.deterministic,
  firstPass: VC08.firstPass, owedFacts: [asSupplied(flameFact), asSupplied(augerFact)],
});
const LEAK_PATTERNS: Array<[string, RegExp]> = [
  ['row id', /HS-[A-Z]\d/], ['disposition', /AUTHORING_|DISPLACED_FACT_/],
  ['fixture label', /\b(REQUIRED|FORBIDDEN)\b/], ['expected outcome', /TARGET_REACHED|VALID_BUT_TARGET_DISPLACED/],
  ['historical result', /3\/10|1\/10|7\/10|8\/10/], ['scoring vocabulary', /selector|denominator|semanticSuccess|pass\/fail/i],
  ['human review vocabulary', /human-reviewed|acceptableEquivalents|ELIGIBLE/],
];
const leaks = LEAK_PATTERNS.filter(([, re]) => re.test(suppliedPrompt)).map(([n]) => n);
ok('C4. the supplied owedFacts block leaks no grading truth',
  leaks.length === 0,
  leaks.length ? `LEAKS: ${leaks.join(', ')}` : `${LEAK_PATTERNS.length} patterns, 0 matches; `
    + `${suppliedPrompt.split('\n').length} prompt lines`);

ok('C5. every frozen v3 enum is the size the protocol specifies',
  OWED_FACT_DECLARATIONS_V3.length === 3 && CLARIFICATION_SOURCE_MODES_V3.length === 3
    && V3_ADMISSION_CODES.length === 41 && HUMAN_TRUTH_PROVENANCE_FIELDS.length === 9,
  `3 declarations · 3 source modes · ${V3_ADMISSION_CODES.length} admission codes`);

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   COST: $0.00   DATABASE ACCESS: none   src/ CHANGES: none');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
