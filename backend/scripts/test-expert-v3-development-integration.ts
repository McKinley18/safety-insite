/**
 * §170 EXPERT HAZLENZ -- BOUNDED DEVELOPMENT INTEGRATION PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Cases A-AK are the §170 authorization's matrix, in its order, with its letters.
 *
 * The §167 replay cases (AI, AJ, AK) read the real stored run records and the real §169 product-
 * owner dispositions from disk. Nothing here re-adjudicates them: the point of those three cases is
 * that DETERMINISTIC CODE PRESERVES the human findings rather than rounding them up.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ---- the integrated runtime contract, from src/
import {
  type AcceptableEvidence, type OwedFact,
  OWED_FACT_STATUSES, TRANSITION_AUTHORITIES, PRODUCTION_PERMITTED_SOURCES,
  PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES, PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES,
  NULL_ACCEPTABLE_EVIDENCE_IS_VALID, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  type OwedFactLedger,
  owedFact, createOwedFactLedger, transition, factOf, factsRemoved, preservationViolations,
  unresolvedFacts,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  type ClarificationDeclaration,
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects,
  parseOwedFactDeclarations, evaluateTargetCoverage,
  CLARIFICATION_EVIDENCE_SUFFICIENCY, COVERAGE_COMPUTATION_METHOD,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  projectStructuralQuestions, selectQuestionsForBudget, questionRepresentationViolations,
  questionBudgetViolations,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/structural-questions';
import {
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED, verifierV3BoundaryState, runOwedFactCoverageStage,
  projectOwedFactsForVerifier, PROJECTION_FORBIDDEN_FIELDS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  emptyObservabilityRecord, appendAttempt, observabilityViolations, reconstructionGaps,
  type ProviderAttemptObservation,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-observability';
import { mergeExpertIntelligence } from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';

// ---- the §165 prototypes, still the authority for the components NOT integrated
import {
  MAX_PROVIDER_CALLS_PER_ANALYSIS, MAX_RELIABILITY_DRAWS, PROVIDER_CALL_CHANNELS,
  ACTIVATION_STATUS, emptyProviderCallBudget, recordProviderCall, mayIssueProviderCall,
  evaluateSecondDrawGate, resolveDrawOutcome, REFUSING_DRAW_FUNCTION,
} from './lib/expert-bounded-reliability-state-machine';
import { decideDegeneratePolicy } from './lib/expert-degenerate-policy';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const S167 = join(V, 'expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04');
const S169 = join(V, 'expert-hazlenz-verifier-v3-human-binding-review-2026-09-04');
const SRC_DIR = join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
/**
 * Comments are stripped before any source scan. Every guard below is a claim about what the CODE
 * does; a comment stating "there is no toggle" must not fail a check looking for the word "toggle",
 * because that would force the modules to be harder to explain in order to pass a test.
 */
function executableLines(src: string): string {
  return src.split('\n')
    .filter(l => { const t = l.trim();
      return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
    .join('\n');
}

function threw(fn: () => unknown): string | null {
  try { fn(); return null; } catch (e) { return (e as Error).message; }
}

console.log('§170 BOUNDED DEVELOPMENT INTEGRATION — PROOF MATRIX');
console.log('='.repeat(100));
console.log(`  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED = ${EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0\n');

// ---------------------------------------------------------------- fixtures

const FLAME = 'owed:hs-a1:flame_failure_safeguard_functional_status';
const SIBLING = 'owed:hs-a1:flame_failure_safeguard_functional_status.wiring';
const AUGER = 'nominated:hs-a1:discharge_auger_drive_isolation_state';
const OBSERVATION = 'A grain dryer is running on the farm drying floor. The burner unit sits at the '
  + 'far end of the plenum behind a steel shroud, and from the walkway the flame-failure device and '
  + 'its wiring are behind that shroud and cannot be seen. Grain dust has settled on the horizontal '
  + 'surfaces of the walkway and on the motor housings. An operative is clearing a blockage at the '
  + 'discharge auger with the dryer running.';

const FLAME_EVIDENCE: AcceptableEvidence = {
  requirement: 'Evidence establishing that the flame-failure protective function currently operates '
    + 'as intended.',
  examples: ['a documented recent functional test', 'a functional test verified now',
    'an authoritative maintenance record establishing current operability'],
  insufficientExamples: ['the device merely being visible', 'wiring merely being present',
    'physical installation alone', 'a status light alone'],
  provenance: 'AUTHORED_HAZLENZ_SAFETY_CONTRACT',
};

const flameFact = (over: Partial<OwedFact> = {}): OwedFact => owedFact({
  factKey: FLAME,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DETERMINISTIC',
  evidenceSpan: 'the flame-failure device and its wiring are behind that shroud and cannot be seen',
  whyUnresolved: 'the span states the safeguard cannot be seen and states nothing about whether it '
    + 'functions',
  branchA: 'the safeguard is functional',
  branchB: 'the safeguard is bypassed, failed or otherwise nonfunctional',
  decisionDivergence: {
    ifA: 'drying continues under the existing controls',
    ifB: 'the burner is shut down and the safeguard restored before drying continues',
  },
  priority: 'REQUIRED_CONTROL',
  acceptableEvidence: FLAME_EVIDENCE,
  ...over,
});

const augerNomination = {
  factKey: AUGER,
  affectedDecision: 'REQUIRED_CONTROL' as const,
  evidenceSpan: 'An operative is clearing a blockage at the discharge auger with the dryer running.',
  whyUnresolved: 'the span states the dryer is running and states nothing about the energy state of '
    + 'the auger drive',
  branchA: 'the auger drive was isolated before the operative began',
  branchB: 'the auger drive remains capable of powered motion',
  decisionIfA: 'clearing may continue as observed',
  decisionIfB: 'whether clearing may safely continue is not established',
  priority: 'REQUIRED_CONTROL' as const,
};

const bindDecl = (id = 'D-bind', key = FLAME): ClarificationDeclaration => ({
  declarationId: id, bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: key, nomination: null,
  question: 'Has the burner flame-failure safeguard been function-tested?',
  affectedDecision: 'REQUIRED_CONTROL',
});
const nominateDecl = (id = 'D-nom'): ClarificationDeclaration => ({
  declarationId: id, bindingMode: 'NOMINATED_NEW', coversFactKey: null,
  nomination: augerNomination,
  question: 'Has the discharge auger drive been isolated?',
  affectedDecision: 'REQUIRED_CONTROL',
});

const dev = (...facts: OwedFact[]): OwedFactLedger => createOwedFactLedger('DEVELOPMENT', facts);

// ================================================================== A–B : boundary and invariance

console.log('--- A–B  FEATURE BOUNDARY AND ACTIVE-PATH INVARIANCE\n');

const boundary = verifierV3BoundaryState();
const srcFiles = readFileSync(join(SRC_DIR, 'owed-facts', 'verifier-v3-development-boundary.ts'),
  'utf8');
ok('A. the feature is default OFF, reads no configuration, and cannot be enabled by environment',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false
    && boundary.enabled === false && boundary.readsConfiguration === false
    && !/process\.env/.test(srcFiles)
    && /EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false/.test(srcFiles),
  'declared as the literal false; the module reads no environment variable at all');

const detAuth = {
  analysisId: 'A-1', jurisdiction: 'osha-general-industry',
  findings: [{ findingKey: 'f1', title: 'T', severity: 'HIGH', requiredActions: ['a'] }],
} as never;
const govAuth = { knowledgeReleaseId: 'rel-1', citations: [] } as never;
const expertIn = { status: 'NOT_CONFIGURED', validated: null, detail: null } as never;
const mergedWithout = mergeExpertIntelligence(detAuth, govAuth, expertIn);
const mergedWithUndefined = mergeExpertIntelligence(detAuth, govAuth, expertIn, undefined);
ok('B. the active merge path is byte-identical with the new optional parameter absent',
  JSON.stringify(mergedWithout) === JSON.stringify(mergedWithUndefined)
    && !('owedFactCoverage' in mergedWithout)
    && Object.keys(mergedWithout).join(',')
      === 'analysisId,jurisdiction,authoritative,governed,expertAdvisory,expertLayer',
  'no owedFactCoverage key; the 6 pre-§170 keys in the same order');

// ================================================================== C–F : ledger behaviour

console.log('\n--- C–F  LEDGER, BINDING AND ADDITIVITY\n');

const base = dev(flameFact());
ok('C. an owed fact enters UNRESOLVED',
  factOf(base, FLAME)!.status === 'UNRESOLVED' && base.transitions.length === 0,
  'UNRESOLVED with 0 transitions');

const twoFact = dev(flameFact(), flameFact({ factKey: SIBLING }));
const dCheck = checkBindingDeclarations([bindDecl()], twoFact, OBSERVATION);
const dAfter = applyAdmittedDeclarations(twoFact, dCheck);
ok('D. an exact binding covers only the named fact',
  factOf(dAfter, FLAME)!.status === 'COVERED'
    && dAfter.transitions.length === 1
    && dAfter.transitions[0].authority === 'ADMITTED_BINDING'
    && bindingSideEffects(twoFact, dAfter, dCheck).length === 0,
  'one transition, via ADMITTED_BINDING, zero side effects');

const dCov = evaluateTargetCoverage(dAfter, dCheck.boundFactKeys);
ok('E. the sibling with byte-identical descriptive text remains UNRESOLVED and uncovered',
  factOf(dAfter, SIBLING)!.status === 'UNRESOLVED'
    && dCov.TARGET_COVERAGE_WARNING && dCov.uncoveredFactKeys[0] === SIBLING,
  'identical whyUnresolved prose; only the bound key moved');

const fCheck = checkBindingDeclarations([bindDecl(), nominateDecl()], dev(flameFact()), OBSERVATION);
const fAfter = applyAdmittedDeclarations(dev(flameFact()), fCheck);
ok('F. an additive nomination creates another fact without replacing the first',
  fAfter.facts.length === 2 && !!factOf(fAfter, FLAME) && !!factOf(fAfter, AUGER)
    && factsRemoved(dev(flameFact()), fAfter).length === 0
    && factOf(fAfter, AUGER)!.source === 'VERIFIER_NOMINATION',
  '2 facts, 0 removed');

// ================================================================== G–J : acceptableEvidence

console.log('\n--- G–J  acceptableEvidence AND ITS PROVENANCE BOUNDARY\n');

const projected = projectOwedFactsForVerifier(dev(flameFact()));
const projJson = JSON.stringify(projected);
ok('G. acceptableEvidence projects intact and the projection leaks no grading state',
  projected[0].acceptableEvidence!.requirement === FLAME_EVIDENCE.requirement
    && projected[0].acceptableEvidence!.insufficientExamples.length === 4
    && PROJECTION_FORBIDDEN_FIELDS.every(f => !projJson.includes(`"${f}"`)),
  `requirement + 4 insufficientExamples; ${PROJECTION_FORBIDDEN_FIELDS.length} forbidden fields, `
  + '0 present');

const mutating = { ...bindDecl(), acceptableEvidence: { requirement: 'anything goes' } };
const hCheck = checkBindingDeclarations([mutating as never], dev(flameFact()), OBSERVATION);
const hAfter = applyAdmittedDeclarations(dev(flameFact()), hCheck);
ok('H. a provider cannot mutate acceptableEvidence — the declaration is refused whole',
  !hCheck.perDeclaration[0].admitted
    && hCheck.perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
    && preservationViolations(dev(flameFact()), hAfter).length === 0
    && PROVIDER_FORBIDDEN_OWED_FACT_FIELDS.includes('acceptableEvidence'),
  'refused; the criterion is unchanged');

const nullEvidence = dev(flameFact({ acceptableEvidence: null }));
ok('I. acceptableEvidence: null is accepted and projects as null',
  NULL_ACCEPTABLE_EVIDENCE_IS_VALID
    && factOf(nullEvidence, FLAME)!.acceptableEvidence === null
    && projectOwedFactsForVerifier(nullEvidence)[0].acceptableEvidence === null,
  'no criterion is invented where none exists');

const jTruthFact = flameFact({ source: 'DEVELOPMENT_HUMAN_TRUTH' });
const jTruth = threw(() => createOwedFactLedger('PRODUCTION', [jTruthFact]));
const jEvidence = threw(() => createOwedFactLedger('PRODUCTION', [flameFact({
  acceptableEvidence: { ...FLAME_EVIDENCE, provenance: 'DEVELOPMENT_HUMAN_TRUTH' },
})]));
const jAdjudication = threw(() => createOwedFactLedger('PRODUCTION', [flameFact({
  acceptableEvidence: { ...FLAME_EVIDENCE, provenance: 'ADJUDICATION_LABEL' },
})]));
const jModel = threw(() => createOwedFactLedger('PRODUCTION', [flameFact({
  acceptableEvidence: { ...FLAME_EVIDENCE, provenance: 'MODEL_SELF_AUTHORED' },
})]));
ok('J. development truth, adjudication labels and model self-authorship are all refused in PRODUCTION',
  /DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION/.test(String(jTruth))
    && /ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED/.test(String(jEvidence))
    && /ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED/.test(String(jAdjudication))
    && /ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED/.test(String(jModel))
    && PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES.length === 3
    && PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES.length === 4,
  '4 permitted provenances, 3 forbidden, all three throw');

// ================================================================== K–L : semantic boundary

console.log('\n--- K–L  NO SEMANTIC GATE\n');

const similarQuestion: ClarificationDeclaration = {
  ...bindDecl('D-similar'), bindingMode: 'NOMINATED_NEW', coversFactKey: null,
  nomination: augerNomination,
  question: 'Is the flame-failure safeguard functional and has loss-of-flame shutdown been '
    + 'function-tested?',
};
const kCheck = checkBindingDeclarations([similarQuestion], dev(flameFact()), OBSERVATION);
const kAfter = applyAdmittedDeclarations(dev(flameFact()), kCheck);
const kCov = evaluateTargetCoverage(kAfter, kCheck.boundFactKeys);
ok('K. a question matching the owed fact word for word settles nothing without a binding',
  factOf(kAfter, FLAME)!.status === 'UNRESOLVED' && kCov.TARGET_COVERAGE_WARNING
    && kCov.uncoveredFactKeys.includes(FLAME),
  'admitted as a nomination; the owed fact stays UNRESOLVED');

const bindingSrc = readFileSync(join(SRC_DIR, 'owed-facts', 'owed-fact-binding.ts'), 'utf8');
const executableOnly = bindingSrc.split('\n')
  .filter(l => { const t = l.trim();
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
  .join('\n');
ok('L. no topic cue, similarity score or threshold exists in the integrated admission code',
  !/similarit|embedding|cosine|jaccard|levenshtein|overlap|fuzzy|threshold/i.test(executableOnly)
    && CLARIFICATION_EVIDENCE_SUFFICIENCY === 'SEMANTIC_JUDGMENT_REQUIRED'
    && COVERAGE_COMPUTATION_METHOD === 'DETERMINISTIC_CLOSED_SET_MEMBERSHIP_OVER_DECLARED_BINDINGS',
  'resolution sufficiency stays SEMANTIC_JUDGMENT_REQUIRED');

// ================================================================== M–Q : question representation

console.log('\n--- M–Q  STRUCTURAL QUESTION REPRESENTATION\n');

const mLedger = applyAdmittedDeclarations(dev(flameFact()), fCheck);
const proj = projectStructuralQuestions(fCheck, mLedger, { attemptId: 'att-1' });
ok('M. one structural question object binds exactly one factKey',
  proj.questions.every(q => typeof q.bindingFactKey === 'string')
    && questionRepresentationViolations(proj.questions).length === 0,
  `${proj.questions.length} question objects, 0 representation violations`);

ok('N. two independent facts create two slots, not one',
  proj.questions.length === 2
    && new Set(proj.questions.map(q => q.bindingFactKey)).size === 2,
  'one slot per fact');

const boundQ = proj.questions.find(q => q.bindingFactKey === FLAME)!;
const nomQ = proj.questions.find(q => q.bindingFactKey === AUGER)!;
ok('O. the provider\'s single string cannot consume one slot for two facts',
  boundQ.question === bindDecl().question && nomQ.question === null,
  'the string belongs to the bound fact; the nominated fact gets no invented wording');

ok('P. the raw compound prose is preserved diagnostically and never parsed',
  proj.compoundDiagnostics.length === 1
    && proj.compoundDiagnostics[0].rawQuestion === bindDecl().question
    && proj.compoundDiagnostics[0].additionalFactKeysAlsoDeclaredInThisResponse[0] === AUGER
    && !/\.split\(|\.match\(|RegExp|replace\(/.test(
      executableLines(readFileSync(join(SRC_DIR, 'owed-facts', 'structural-questions.ts'), 'utf8'))),
  'retained for diagnostics; the module contains no string-splitting machinery at all');

const qCov = evaluateTargetCoverage(mLedger, fCheck.boundFactKeys);
ok('Q. the nominated fact remains UNRESOLVED when no valid second question exists',
  factOf(mLedger, AUGER)!.status === 'UNRESOLVED'
    && qCov.TARGET_COVERAGE_WARNING && qCov.uncoveredFactKeys.includes(AUGER)
    && nomQ.presentationStatus === 'NO_WORDING_AVAILABLE',
  'the warning stays live rather than wording being invented');

// ================================================================== R–S : budget

console.log('\n--- R–S  BUDGET CANNOT SETTLE OR DROP\n');

const budgetResult = selectQuestionsForBudget(mLedger, proj.questions, 1);
const afterBudget = mLedger;   // selection performs no transition, by construction
ok('R. question suppression cannot mark a fact covered',
  budgetResult.selected.length === 1 && budgetResult.suppressed.length === 1
    && factOf(afterBudget, AUGER)!.status === 'UNRESOLVED'
    && questionBudgetViolations(mLedger, afterBudget, budgetResult).length === 0
    && afterBudget.transitions.length === mLedger.transitions.length,
  '1 selected, 1 suppressed, 0 transitions recorded by selection');

const lcLedger = dev(
  flameFact({ factKey: 'owed:lc-1', priority: 'LIFE_CRITICAL', acceptableEvidence: null }),
  flameFact({ factKey: 'owed:lc-2', priority: 'LIFE_CRITICAL', acceptableEvidence: null }),
);
const lcCheck = checkBindingDeclarations([], lcLedger, OBSERVATION);
const lcProj = projectStructuralQuestions(lcCheck, lcLedger);
const lcBudget = selectQuestionsForBudget(lcLedger, lcProj.questions, 1);
ok('S. a budget cannot remove life-critical unresolved state',
  lcBudget.unresolvedLifeCriticalFactKeys.length === 2
    && lcBudget.UNRESOLVED_SAFETY_STATE
    && lcBudget.survivingInternally.length === 2
    && lcBudget.deterministicFindingsStillShown === true,
  'both surface as an unresolved safety state; deterministic findings still shown');

// ================================================================== T–X : reliability boundaries

console.log('\n--- T–X  RELIABILITY BOUNDARIES, UNCHANGED AND INACTIVE\n');

const silent = (i: 1 | 2) => ({ drawIndex: i, transportOk: true, degenerate: false,
  responseState: 'COMPLETE', contractAdmitted: true, verdict: 'NO_CLARIFICATION_REQUIRED',
  clarificationEmitted: false });
const twoNo = resolveDrawOutcome([silent(1), silent(2)], true);
ok('T. two NO outcomes do not settle a fact',
  twoNo.outcome.outcome === 'SETTLED_SILENCE' && !twoNo.mayClearOwedFact
    && !twoNo.coverageWarningMayClear && twoNo.consensusClaimed === false
    && factOf(dev(flameFact()), FLAME)!.status === 'UNRESOLVED',
  'SETTLED_SILENCE with drawCount 2; nothing cleared');

let refused = '';
void REFUSING_DRAW_FUNCTION(1).catch((e: Error) => { refused = e.message; });
ok('U. policy C remains inactive and unintegrated',
  ACTIVATION_STATUS === 'DEVELOPMENT_INACTIVE' && MAX_RELIABILITY_DRAWS === 2
    && !readFileSync(join(SRC_DIR, 'owed-facts', 'verifier-v3-development-boundary.ts'), 'utf8')
      .includes('SECOND_DRAW'),
  'no second-draw machinery was integrated into src/');

const degenFirst = decideDegeneratePolicy(
  { DEGENERATE_PROVIDER_OUTPUT: true, suspect: true, signals: ['X'] } as never,
  { purpose: 'CUSTOMER', reissueAttemptIndex: 0 });
ok('V. the degenerate hosted reissue remains inactive and its policy unchanged',
  degenFirst.decision === 'REISSUE_ONCE'
    && !readFileSync(join(SRC_DIR, 'owed-facts', 'owed-fact-binding.ts'), 'utf8')
      .includes('REISSUE'),
  'policy unchanged in scripts/; no reissue path integrated into src/');

const degenSpent = recordProviderCall(emptyProviderCallBudget(), 'DEGENERATE_REISSUE');
const drawSpent = ['RELIABILITY_DRAW', 'RELIABILITY_DRAW'].reduce(
  (b, c) => recordProviderCall(b, c as 'RELIABILITY_DRAW'), emptyProviderCallBudget());
ok('W. the retry budgets remain separate in both directions',
  !mayIssueProviderCall(degenSpent, 'DEGENERATE_REISSUE').allowed
    && mayIssueProviderCall(degenSpent, 'RELIABILITY_DRAW').allowed
    && !mayIssueProviderCall(drawSpent, 'RELIABILITY_DRAW').allowed
    && mayIssueProviderCall(drawSpent, 'DEGENERATE_REISSUE').allowed
    && evaluateSecondDrawGate({ observation: silent(1), triggerPositive: true,
      unresolvedOwedFactRemains: true, budget: drawSpent }).SECOND_DRAW_ELIGIBLE === false,
  'neither channel lends to the other');

let cap = emptyProviderCallBudget();
for (const ch of ['FIRST_PASS', 'DEGENERATE_REISSUE', 'RELIABILITY_DRAW', 'RELIABILITY_DRAW',
  'COVERAGE_RECHECK'] as const) cap = recordProviderCall(cap, ch);
ok('X. the hard total-call bound is structurally maintained',
  MAX_PROVIDER_CALLS_PER_ANALYSIS === 5 && cap.total === 5
    && Object.keys(PROVIDER_CALL_CHANNELS).length === 4
    && threw(() => recordProviderCall(cap, 'RELIABILITY_DRAW')) !== null,
  '5-call cap across 4 channels; the sixth is refused');

// ================================================================== Y–AB : authority

console.log('\n--- Y–AB  AUTHORITY AND SCORING BOUNDARIES\n');

const yRejected = transition(dev(flameFact()), {
  factKey: FLAME, to: 'REJECTED_BY_ARBITRATION', authority: 'RECORDED_ARBITRATION',
  justification: 'arbitration recorded a reason',
});
const yWrong = threw(() => transition(dev(flameFact()), {
  factKey: FLAME, to: 'REJECTED_BY_ARBITRATION', authority: 'ADMITTED_BINDING',
  justification: 'a binding is not arbitration',
}));
ok('Y. arbitration exclusively owns the rejection transition',
  factOf(yRejected, FLAME)!.status === 'REJECTED_BY_ARBITRATION'
    && /TRANSITION_AUTHORITY_MISMATCH/.test(String(yWrong))
    && TRANSITION_AUTHORITIES.length === 3,
  '3 authorities; a binding cannot reject');

const zBad = threw(() => transition(dev(flameFact()), {
  factKey: FLAME, to: 'COVERED',
  authority: 'MODEL_EXPLANATION' as never,
  justification: 'the model explained at length why this is covered',
}));
ok('Z. explanation text cannot mutate fact state — no authority member exists for it',
  /TRANSITION_AUTHORITY_NOT_A_MEMBER/.test(String(zBad))
    && !(TRANSITION_AUTHORITIES as readonly string[]).includes('MODEL_EXPLANATION'),
  `authorities = [${TRANSITION_AUTHORITIES.join(', ')}]`);

const aaLedger = dev(flameFact(), flameFact({ factKey: SIBLING }));
const aa1 = evaluateTargetCoverage(aaLedger, []);
const aa2 = evaluateTargetCoverage(aaLedger, [FLAME]);
ok('AA. the coverage warning is a deterministic set difference',
  aa1.uncoveredFactKeys.length === 2 && aa2.uncoveredFactKeys.length === 1
    && aa2.uncoveredFactKeys[0] === SIBLING
    && JSON.stringify(evaluateTargetCoverage(aaLedger, [])) === JSON.stringify(aa1),
  'stable and repeatable over the same inputs');

const abNoNomination = checkBindingDeclarations([bindDecl()], dev(flameFact()), OBSERVATION);
ok('AB. the absence of an additive nomination is not scored as a failure',
  abNoNomination.admitted.length === 1 && abNoNomination.refused.length === 0
    && abNoNomination.nominationCount === 0
    && !JSON.stringify(abNoNomination).includes('MISSING_NOMINATION'),
  'no admission code exists for a missing nomination');

// ================================================================== AC–AH : confinement

console.log('\n--- AC–AH  CONFINEMENT\n');

ok('AC. fixture-truth population refuses rather than filters',
  /DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION/.test(String(jTruth))
    && !PRODUCTION_PERMITTED_SOURCES.includes('DEVELOPMENT_HUMAN_TRUTH')
    && createOwedFactLedger('DEVELOPMENT', [jTruthFact]).facts.length === 1,
  'throws in PRODUCTION, accepted in DEVELOPMENT');

const mergeSrc = readFileSync(join(SRC_DIR, 'expert-authority-merge.ts'), 'utf8');
/**
 * Import SPECIFIERS, not import lines: a multi-line `import { … } from '…'` is one dependency and
 * three lines, and counting lines would measure formatting instead of coupling.
 */
const importSpecifiers = (src: string): string[] =>
  [...src.matchAll(/from '([^']+)'/g)].map(m => m[1]);
/** The merge depended on exactly these two modules before §170 and must depend on the same two. */
const MERGE_IMPORTS_BEFORE = 2;
ok('AD. the v2 active path is unchanged — the merge gained one optional parameter and no branch',
  mergeSrc.includes('owedFactCoverage?: unknown')
    && mergeSrc.includes('...(owedFactCoverage === undefined ? {} : { owedFactCoverage })')
    && !executableLines(mergeSrc).includes('EXPERT_VERIFIER_V3')
    && !executableLines(mergeSrc).includes('owed-facts')
    && importSpecifiers(mergeSrc).length === MERGE_IMPORTS_BEFORE
    && importSpecifiers(mergeSrc).every(spec => !spec.includes('owed-fact')),
  `the merge depends on ${MERGE_IMPORTS_BEFORE} modules, unchanged, neither of them the owed-fact `
  + 'module; and its code never references the gate');

const stage = runOwedFactCoverageStage({
  ledger: mLedger, coverage: qCov, questions: proj.questions,
});
ok('AE. the owed-fact stage cannot run without explicit development enablement',
  stage.attached === false && stage.attachment === null
    && /EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED is false/.test(stage.reason),
  'attaches nothing; the merged result is unchanged');

const allSrc = ['owed-fact.types.ts', 'owed-fact-ledger.ts', 'owed-fact-binding.ts',
  'structural-questions.ts', 'verifier-v3-development-boundary.ts', 'owed-fact-observability.ts']
  .map(f => readFileSync(join(SRC_DIR, 'owed-facts', f), 'utf8')).join('\n');
const moduleFiles = ['owed-fact.types.ts', 'owed-fact-ledger.ts', 'owed-fact-binding.ts',
  'structural-questions.ts', 'verifier-v3-development-boundary.ts', 'owed-fact-observability.ts'];
const allImports = moduleFiles.flatMap(
  f => importSpecifiers(readFileSync(join(SRC_DIR, 'owed-facts', f), 'utf8')));
const foreignImports = allImports.filter(
  spec => !/^\.\/(owed-fact|structural-questions)/.test(spec));
ok('AF. no customer-facing toggle exists — the modules import nothing outside their own directory',
  boundary.customerFacingToggleExists === false
    && foreignImports.length === 0
    && !executableLines(allSrc).includes('process.env'),
  `${allImports.length} module dependencies across ${moduleFiles.length} files, all `
  + 'intra-directory; '
  + 'no settings, config, flag service or environment read exists to carry a toggle');

ok('AG. no database access is required or possible from the integrated modules',
  !/repository|getRepository|createQueryBuilder|dataSource|entityManager|typeorm/i
    .test(executableLines(allSrc))
    && !/SELECT |INSERT |UPDATE |DELETE /.test(executableLines(allSrc)),
  '0 persistence primitives across 6 modules');

const attempt = (seq: number): ProviderAttemptObservation => ({
  attemptSeq: seq, channel: 'RELIABILITY_DRAW', drawIndex: seq, transportOk: true,
  responseState: 'COMPLETE', degenerate: false, contractAdmitted: true, admissionCodes: [],
  verdict: 'ADD_OR_REPLACE_CLARIFICATION', bindingFactKey: FLAME, rawPreserved: true,
  rawResponse: { draw: seq },
});
const obs0 = emptyObservabilityRecord('A-1', 'DEVELOPMENT', [flameFact()]);
const obs1 = appendAttempt(obs0, attempt(1));
const obs2 = appendAttempt(obs1, attempt(2));
const tampered = { ...obs2, providerAttempts: [attempt(9), obs2.providerAttempts[1]] };
const obsFull = { ...obs2, uncoveredFactKeys: [FLAME], TARGET_COVERAGE_WARNING: true };
ok('AH. raw attempt history is append-only and the record reconstructs every obligation',
  obs2.providerAttempts.length === 2 && obs2.reliabilityDrawCount === 2
    && observabilityViolations(obs1, obs2).length === 0
    && observabilityViolations(obs2, tampered).some(v => /ATTEMPT_OVERWRITTEN/.test(v))
    && reconstructionGaps(obsFull).length === 0,
  '2 attempts preserved; an overwrite is reported; 18 obligations, 0 gaps');

// ================================================================== AI–AK : §169 replay

console.log('\n--- AI–AK  §169 HUMAN FINDINGS SURVIVE DETERMINISTIC HANDLING\n');

interface Rec { caseId: string; draw: number; proposedQuestion: string | null;
  bindingFactKey: string | null; nominationPresent: boolean }
const recs = readFileSync(join(S167, 'RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')
  .map(l => JSON.parse(l) as Rec);
const counts = JSON.parse(readFileSync(join(S169, 'HUMAN-VALIDATED-COUNTS.json'), 'utf8')) as {
  perPair: Array<{ pairId: string; disposition: string; B_answerResolvesIt: string }>;
  compound: { pairs: string[] };
  evidenceSufficiencyWeaknesses: { pairs: string[] };
  temporalScopeWeaknesses: { pairs: string[] };
};
const dispOf = (id: string) => counts.perPair.find(p => p.pairId === id)!;

/** Replay one stored draw through the integrated structural-question projection. */
function replay(pairId: string): { questions: number; compoundDiagnostics: number } {
  const r = recs.find(x => `${x.caseId}-${x.draw}` === pairId)!;
  const ledger = dev(flameFact());
  const decls: ClarificationDeclaration[] = [
    { ...bindDecl(`R-${pairId}`), question: r.proposedQuestion ?? '' },
  ];
  if (r.nominationPresent) decls.push(nominateDecl(`R-${pairId}-nom`));
  const check = checkBindingDeclarations(decls, ledger, OBSERVATION);
  const after = applyAdmittedDeclarations(ledger, check);
  const p = projectStructuralQuestions(check, after, { attemptId: pairId });
  return { questions: p.questions.length, compoundDiagnostics: p.compoundDiagnostics.length };
}

for (const pairId of ['VC-08-2', 'VC-08-3']) {
  const d = dispOf(pairId);
  const r = replay(pairId);
  ok(`AI. ${pairId} — semantic binding CORRECT and representation defect recorded separately`,
    d.disposition === 'BINDING_SEMANTICALLY_CORRECT'
      && counts.compound.pairs.includes(pairId)
      && r.questions === 2 && r.compoundDiagnostics === 1,
    'binding not downgraded; the compound string yields 2 slots and 1 diagnostic');
}

const ajPairs = counts.evidenceSufficiencyWeaknesses.pairs;
ok('AJ. VC-08-1/4/6 keep their evidence-sufficiency weakness and are not promoted to fully correct',
  ajPairs.length === 3
    && ajPairs.every(p => dispOf(p).disposition === 'BINDING_PARTIALLY_CORRECT')
    && ajPairs.every(p => dispOf(p).B_answerResolvesIt === 'Partially')
    && CLARIFICATION_EVIDENCE_SUFFICIENCY === 'SEMANTIC_JUDGMENT_REQUIRED',
  `${ajPairs.join(', ')} remain PARTIALLY_CORRECT; no code promotes them`);

const akPairs = counts.temporalScopeWeaknesses.pairs;
ok('AK. VC-04-1 keeps its temporal-scope weakness',
  akPairs.length === 1 && akPairs[0] === 'VC-04-1'
    && dispOf('VC-04-1').disposition === 'BINDING_PARTIALLY_CORRECT'
    && recs.filter(r => r.caseId === 'VC-04').length === 6,
  'VC-04-1 remains PARTIALLY_CORRECT against 5 fully-correct siblings');

// ---------------------------------------------------------------- report

setTimeout(() => {
  ok('AE2. the default draw function still refuses to execute',
    /HOSTED_EXECUTION_NOT_AUTHORIZED/.test(refused), ACTIVATION_STATUS);
  ok('C2. every integrated enum is the size the contract specifies',
    OWED_FACT_STATUSES.length === 4 && TRANSITION_AUTHORITIES.length === 3
      && PRODUCTION_PERMITTED_SOURCES.length === 4
      && PROVIDER_FORBIDDEN_OWED_FACT_FIELDS.length === 10,
    '4 statuses · 3 authorities · 4 production sources · 10 forbidden provider fields');

  console.log('\n' + '='.repeat(100));
  console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
  console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   '
    + `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: ${EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED}`);
  console.log('='.repeat(100));
  if (failed > 0) {
    console.log('\nFAILED:');
    for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
    process.exit(1);
  }
}, 25);
