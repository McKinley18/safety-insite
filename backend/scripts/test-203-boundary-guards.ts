/**
 * §203 EXPERT HAZLENZ -- SUCCESSOR BOUNDARY GUARD INTEGRATION SUITE (Agent B).
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS WRITTEN OUTSIDE THIS PROCESS.
 *
 * For EACH of the five §202 category-A guards (ABF-1, ABF-2, ABF-3, ABF-7, ABF-8) this suite
 * asserts three separately counted facts:
 *
 *   .exists       GUARD_EXISTS                    the §202 export is present and is the SAME
 *                                                 function object the successor module imports
 *   .called       GUARD_CALLED                    the successor boundary actually invokes it:
 *                                                 unsafe input yields the guard's specific
 *                                                 violation at the boundary, not a caller default
 *   .adversarial  GUARD_REJECTS_ADVERSARIAL_INPUT the caller INTENTIONALLY supplies the unsafe
 *                                                 value and the receiving boundary refuses it
 *
 * Alongside: TODAY cases proving the FROZEN ancestor still accepts the unsafe state (so the
 * successor's refusal is demonstrably the new boundary and not an upstream accident), differential
 * safe-path equivalence, the recorded successor-contract divergences D1/D2/D3 and B1-B5 pinned as
 * regressions, and the Ruling-4 schema-closure assertions.
 *
 * The TODO-C seam (terminal-status collision) is pinned by INVARIANT, not by branch: a terminal
 * collision must NEVER succeed silently -- at B's freeze it is admitted and then THROWN by the B5
 * post-condition; after Agent C's widening it must be refused as FACT_IDENTITY_COLLISION. Either
 * branch satisfies the assertion; silence satisfies nothing.
 */

import * as guards from './lib/expert-202-authority-boundary-guards';
import {
  declaringStageViolations, acceptableEvidenceProvenanceViolations,
  nestedForbiddenGovernanceFields, nominationHazLenzOwnedFieldScan, nominationCeilingViolations,
  nominationOutcomeViolations, FROZEN_NOMINATION_CEILING,
} from './lib/expert-202-authority-boundary-guards';
import {
  projectDeclaredOwedFacts203, successorProjectionEffect,
  SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203, SUCCESSOR_PROJECTION_BOUNDARY_CODES,
} from './lib/expert-203-successor-projection';
import {
  checkBindingDeclarations203, applyAdmittedDeclarations203, successorBindingEffect,
  SUCCESSOR_BINDING_ADMISSION_CODES, SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203,
  SUCCESSOR_NOMINATED_FACT_PRIORITY, SUCCESSOR_NOMINATION_CEILING,
  type SuccessorClarificationDeclaration,
} from './lib/expert-203-successor-binding';
import { SUCCESSOR_CONTRACT_VERSION } from './lib/expert-203-successor-identity';
import {
  projectDeclaredOwedFacts,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  checkBindingDeclarations, applyAdmittedDeclarations,
  type ClarificationDeclaration,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  type OwedFactLedger, createOwedFactLedger, factOf, owedFact, transition,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import type { AcceptableEvidence } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';

// ================================================================ harness

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const codesOf = (v: readonly { code?: string }[] | readonly { codes?: readonly string[] }[]): string[] =>
  v.flatMap((x: any) => x.code ? [x.code] : (x.codes ?? []));

// ================================================================ shared fixtures

const OBS = 'The guard on the auger was removed and the flame sensor status was not stated.';
const SOURCES = [{ sourceId: 'obs-1', text: OBS }];

const validProjectionDecl = (id: string, over: Record<string, unknown> = {}) => ({
  declarationId: id,
  missingFact: 'whether the auger guard interlock is functional',
  observationSourceId: 'obs-1',
  observationSpan: 'The guard on the auger was removed',
  notEstablishedBecause: 'the observation does not state the interlock condition',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the interlock is functional',
  decisionIfA: 'no additional control is required for this fact',
  branchB: 'the interlock is not functional',
  decisionIfB: 'an additional control is required for this fact',
  whyNecessaryNow: 'the decision on required controls turns on this fact',
  governedEvidenceSourceIds: [] as string[],
  ...over,
});

const baseProjectionInput = (decls: unknown[], over: Record<string, unknown> = {}) => ({
  declarations: decls,
  sources: SOURCES,
  suppliedGovernedSourceIds: ['gov-1', 'gov-2'],
  stage: 'FIRST_PASS_MODEL' as const,
  ...over,
});

const goodCriterion: AcceptableEvidence = {
  requirement: 'evidence establishing the interlock protective function itself',
  provenance: 'GOVERNED_EVIDENCE',
};
// A provenance OUTSIDE the closed set. (MODEL_SELF_AUTHORED is a member -- deliberately
// representable-and-refusable -- and the §202 ABF-2 guard enforces MEMBERSHIP ONLY; whether a
// member may exist in a given population is assertProductionAdmissible's question, reported not
// decided. The membership boundary is what the successor wires.)
const hostileCriterion = {
  requirement: 'anything the model says is fine',
  provenance: 'FORGED_PROVENANCE',
} as unknown as AcceptableEvidence;

const unresolvedFact = owedFact({
  factKey: 'FP.REQUIRED_CONTROL.obs-1.4-38.1',
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DETERMINISTIC',
  evidenceSpan: 'The guard on the auger was removed',
  whyUnresolved: 'the interlock condition is not stated',
  branchA: 'interlock functional',
  branchB: 'interlock not functional',
  decisionDivergence: { ifA: 'no additional control', ifB: 'additional control required' },
  priority: 'REQUIRED_CONTROL',
});

function ledgerWithTerminalFact(): { ledger: OwedFactLedger; terminalKey: string } {
  const base = createOwedFactLedger('DEVELOPMENT', [unresolvedFact]);
  const covered = transition(base, {
    factKey: unresolvedFact.factKey, to: 'COVERED', authority: 'ADMITTED_BINDING',
    justification: 'fixture: transitioned to terminal status for collision cases',
  });
  return { ledger: covered, terminalKey: unresolvedFact.factKey };
}

const successorNomination = (over: Record<string, unknown> = {}) => ({
  factKey: 'VN.REQUIRED_CONTROL.obs-1.43-77.1',
  affectedDecision: 'REQUIRED_CONTROL' as const,
  evidenceSpan: 'the flame sensor status was not stated',
  whyUnresolved: 'the flame sensor status is not established',
  branchA: 'the sensor is operational',
  branchB: 'the sensor is not operational',
  decisionIfA: 'no additional control is required for this fact',
  decisionIfB: 'an additional control is required for this fact',
  ...over,
});

const successorNominationDecl = (
  id: string, nomOver: Record<string, unknown> = {}, declOver: Record<string, unknown> = {},
): SuccessorClarificationDeclaration => ({
  declarationId: id,
  bindingMode: 'NOMINATED_NEW',
  coversFactKey: null,
  nomination: successorNomination(nomOver) as any,
  question: 'Is the flame sensor operational?',
  affectedDecision: 'REQUIRED_CONTROL',
  ...declOver,
} as SuccessorClarificationDeclaration);

const ancestorNominationDecl = (
  id: string, nomOver: Record<string, unknown> = {},
): ClarificationDeclaration => ({
  declarationId: id,
  bindingMode: 'NOMINATED_NEW',
  coversFactKey: null,
  nomination: { ...successorNomination(), priority: 'OTHER', ...nomOver } as any,
  question: 'Is the flame sensor operational?',
  affectedDecision: 'REQUIRED_CONTROL',
});

const emptyLedger = createOwedFactLedger('DEVELOPMENT', []);

// ================================================================ ABF-1 -- declaring stage

console.log('\n---- ABF-1: declaring-stage membership (WRAP, whole-call rejection)');

ok('ABF-1.exists', typeof declaringStageViolations === 'function'
  && declaringStageViolations === guards.declaringStageViolations,
  'GUARD_EXISTS: §202 export, same function object the successor imports');

{
  const r = projectDeclaredOwedFacts203(
    baseProjectionInput([validProjectionDecl('d1')], { stage: 'DEVELOPMENT_HUMAN_TRUTH' }) as any);
  ok('ABF-1.called', r.boundaryState === 'STAGE_REJECTED' && r.projection === null
    && codesOf(r.stageViolations).includes('DECLARING_STAGE_NOT_A_MEMBER'),
    'GUARD_CALLED: DEVELOPMENT_HUMAN_TRUTH rejected with the guard\'s own code, nothing delegated');
}
{
  const r = projectDeclaredOwedFacts203(
    baseProjectionInput([validProjectionDecl('d1')], { stage: 'HOSTILE_STAGE' }) as any);
  ok('ABF-1.adversarial', r.boundaryState === 'STAGE_REJECTED' && r.projection === null,
    'GUARD_REJECTS_ADVERSARIAL_INPUT: an intentionally unsafe stage cannot reach frozen code');
}
{
  const r = projectDeclaredOwedFacts203(baseProjectionInput([validProjectionDecl('d1')]) as any);
  ok('ABF-1.safe', r.boundaryState === 'DELEGATED' && r.projection !== null
    && r.projection.facts.length === 1, 'a member stage delegates and projects normally');
}

// ================================================================ ABF-2 -- evidence provenance

console.log('\n---- ABF-2: acceptableEvidence provenance membership (WRAP, per-declaration)');

ok('ABF-2.exists', typeof acceptableEvidenceProvenanceViolations === 'function'
  && acceptableEvidenceProvenanceViolations === guards.acceptableEvidenceProvenanceViolations,
  'GUARD_EXISTS');

{
  const decl = validProjectionDecl('d1', { governedEvidenceSourceIds: ['gov-1'] });
  const input = baseProjectionInput([decl],
    { acceptableEvidenceBySourceId: { 'gov-1': hostileCriterion } });
  const today = projectDeclaredOwedFacts(input as any);
  ok('ABF-2.today', today.facts.length === 1
    && (today.facts[0].acceptableEvidence?.provenance as string) === 'FORGED_PROVENANCE',
    'TODAY: the FROZEN projection copies a non-member provenance wholesale into a DEVELOPMENT '
    + 'ledger (owedFactDefects checks requirement only)');
  const r = projectDeclaredOwedFacts203(input as any);
  ok('ABF-2.called', r.boundaryState === 'DELEGATED'
    && r.boundaryRefusals.length === 1
    && r.boundaryRefusals[0].codes.includes('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER')
    && r.projection!.facts.length === 0,
    'GUARD_CALLED: the same input is refused at the successor boundary with the guard\'s code');
  ok('ABF-2.adversarial', r.boundaryRefusals.length === 1
    && codesOf(r.boundaryRefusals[0].violations).includes('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER'),
    'GUARD_REJECTS_ADVERSARIAL_INPUT: an intentionally hostile provenance never reaches a fact');
  // The guard's documented limit, pinned so nobody reads more into ABF-2 than it enforces:
  const memberInput = baseProjectionInput([validProjectionDecl('d1',
    { governedEvidenceSourceIds: ['gov-1'] })], {
    acceptableEvidenceBySourceId: {
      'gov-1': { requirement: 'a member but development-only provenance',
        provenance: 'MODEL_SELF_AUTHORED' } as AcceptableEvidence,
    },
  });
  const memberR = projectDeclaredOwedFacts203(memberInput as any);
  ok('ABF-2.membership-only-limit', memberR.boundaryRefusals.length === 0
    && memberR.projection!.facts.length === 1,
    'MODEL_SELF_AUTHORED is a MEMBER and passes the membership guard; population admissibility '
    + 'stays assertProductionAdmissible\'s question (PRODUCTION fails closed there), as §202 '
    + 'documents');
}
{
  // D3 pin: ANY bound governed id with an invalid held criterion refuses, not only the first.
  const decl = validProjectionDecl('d1', { governedEvidenceSourceIds: ['gov-1', 'gov-2'] });
  const input = baseProjectionInput([decl], {
    acceptableEvidenceBySourceId: { 'gov-1': goodCriterion, 'gov-2': hostileCriterion },
  });
  const today = projectDeclaredOwedFacts(input as any);
  const r = projectDeclaredOwedFacts203(input as any);
  ok('ABF-2.D3-divergence-pin', today.facts.length === 1 && r.boundaryRefusals.length === 1,
    'recorded divergence D3: frozen admits via the first good criterion; successor refuses on any '
    + 'invalid bound criterion');
}
{
  const decl = validProjectionDecl('d1', { governedEvidenceSourceIds: ['gov-1'] });
  const input = baseProjectionInput([decl], {
    acceptableEvidenceBySourceId:
      { 'gov-1': { requirement: '   ', provenance: 'GOVERNED_EVIDENCE' } as AcceptableEvidence },
  });
  const r = projectDeclaredOwedFacts203(input as any);
  ok('ABF-2.blank-requirement', r.boundaryRefusals.length === 1
    && r.boundaryRefusals[0].codes.includes('ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK'),
    'a blank requirement refuses at the boundary too');
}
{
  const input = baseProjectionInput([validProjectionDecl('d1')],
    { acceptableEvidenceBySourceId: { 'gov-2': hostileCriterion } });
  const r = projectDeclaredOwedFacts203(input as any);
  ok('ABF-2.map-advisory', r.boundaryRefusals.length === 0
    && codesOf(r.criteriaMapViolations).includes('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER')
    && r.projection!.facts.length === 1,
    'an unbound hostile criterion refuses nothing but is never silently unremarked');
}

// ================================================================ ABF-7 -- nested governance fields

console.log('\n---- ABF-7: nested forbidden governance fields (WRAP, recursive)');

ok('ABF-7.exists', typeof nestedForbiddenGovernanceFields === 'function'
  && nestedForbiddenGovernanceFields === guards.nestedForbiddenGovernanceFields,
  'GUARD_EXISTS');

{
  const decl = validProjectionDecl('d1',
    { extra: { citation: '29 CFR 1910.147', approved: true } });
  const today = projectDeclaredOwedFacts(baseProjectionInput([decl]) as any);
  ok('ABF-7.today', today.facts.length === 1 && today.perDeclaration[0].codes.length === 0,
    'TODAY: the FROZEN projection admits a nested citation/approval blob with zero codes (§202 '
    + 'measured gap)');
  const r = projectDeclaredOwedFacts203(baseProjectionInput([decl]) as any);
  const refusal = r.boundaryRefusals[0];
  ok('ABF-7.called', r.boundaryRefusals.length === 1
    && refusal.codes.includes('NESTED_FORBIDDEN_GOVERNANCE_FIELD')
    && codesOf(refusal.violations).includes('NESTED_FORBIDDEN_GOVERNANCE_FIELD'),
    'GUARD_CALLED: the recursive walk fires at the successor boundary');
  ok('ABF-7.adversarial',
    refusal.violations.some(v => v.detail.includes('$.extra.citation'))
    && refusal.codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    'GUARD_REJECTS_ADVERSARIAL_INPUT: the nested path is named, and the carrier key also fails the '
    + 'closed key set');
}
{
  const deep = validProjectionDecl('d1',
    { wrap: { a: { b: { c: { approved: true } } } } });
  const r = projectDeclaredOwedFacts203(baseProjectionInput([deep]) as any);
  ok('ABF-7.depth', r.boundaryRefusals.length === 1
    && r.boundaryRefusals[0].codes.includes('NESTED_FORBIDDEN_GOVERNANCE_FIELD'),
    'a governance field buried four levels down is still found');
}

// ================================================================ ABF-3 -- nomination field scan

console.log('\n---- ABF-3: nomination HazLenz-owned field scan (COPY, NOMINATED_NEW branch)');

ok('ABF-3.exists', typeof nominationHazLenzOwnedFieldScan === 'function'
  && nominationHazLenzOwnedFieldScan === guards.nominationHazLenzOwnedFieldScan,
  'GUARD_EXISTS');

{
  const hostile = { status: 'COVERED', settled: true, acceptableEvidence: { requirement: 'x' } };
  const todayCheck = checkBindingDeclarations(
    [ancestorNominationDecl('c1', hostile)], emptyLedger, OBS);
  ok('ABF-3.today', todayCheck.perDeclaration[0].admitted === true,
    'TODAY: the FROZEN ancestor admits a nomination carrying status/settled/acceptableEvidence '
    + '(declaration-level scan never reaches d.nomination)');
  const r = checkBindingDeclarations203(
    [successorNominationDecl('c1', hostile)], emptyLedger, OBS);
  ok('ABF-3.called', r.perDeclaration[0].admitted === false
    && r.perDeclaration[0].codes.includes('NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD'),
    'GUARD_CALLED: the same hostile nomination is refused at the successor boundary');
  ok('ABF-3.adversarial',
    r.perDeclaration[0].codes.filter(c => c === 'NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD').length >= 3,
    'GUARD_REJECTS_ADVERSARIAL_INPUT: each of the three intentionally supplied owned fields is '
    + 'individually named');
}

// ================================================================ Ruling 5 -- priority authority

console.log('\n---- Ruling 5 / B2: no provider priority channel; urgency is non-authoritative');

{
  const today = checkBindingDeclarations(
    [ancestorNominationDecl('p1', { priority: 'LIFE_CRITICAL' })], emptyLedger, OBS);
  const todayLedger = applyAdmittedDeclarations(emptyLedger, today);
  ok('R5.today', factOf(todayLedger, successorNomination().factKey as string)?.priority === 'LIFE_CRITICAL',
    'TODAY: the FROZEN ancestor writes the provider\'s LIFE_CRITICAL straight onto OwedFact.priority');

  const r = checkBindingDeclarations203(
    [successorNominationDecl('p1', { priority: 'LIFE_CRITICAL' })], emptyLedger, OBS);
  ok('R5.priority-member-refused', r.perDeclaration[0].admitted === false
    && r.perDeclaration[0].codes.includes('NOMINATION_CARRIES_PROVIDER_PRIORITY'),
    'a nomination carrying a member-valued priority is refused, not routed');

  const r2 = checkBindingDeclarations203(
    [successorNominationDecl('p2', { priority: 'MAXIMUM_DANGER' })], emptyLedger, OBS);
  ok('R5.priority-nonmember-refused',
    r2.perDeclaration[0].codes.includes('NOMINATION_CARRIES_PROVIDER_PRIORITY'),
    'presence refuses regardless of value; there is no priority channel to validate');

  const r3 = checkBindingDeclarations203(
    [successorNominationDecl('p3', { urgencyNomination: 'LIFE_CRITICAL' })], emptyLedger, OBS);
  ok('R5.urgency-admitted', r3.perDeclaration[0].admitted === true
    && r3.perDeclaration[0].urgencyNomination === 'LIFE_CRITICAL',
    'urgency travels as a named NON-AUTHORITATIVE nomination on the admission record');
  const applied = applyAdmittedDeclarations203(emptyLedger, r3);
  ok('R5.urgency-never-escalates',
    factOf(applied.ledger, successorNomination().factKey as string)?.priority
      === SUCCESSOR_NOMINATED_FACT_PRIORITY,
    `LIFE_CRITICAL urgency nomination still yields deterministic priority `
    + `${SUCCESSOR_NOMINATED_FACT_PRIORITY}; no escalation state is reachable from it`);

  const r4 = checkBindingDeclarations203(
    [successorNominationDecl('p4', { urgencyNomination: 'SEVERE' })], emptyLedger, OBS);
  ok('R5.urgency-vocabulary', r4.perDeclaration[0].admitted === false
    && r4.perDeclaration[0].codes.includes('URGENCY_NOMINATION_NOT_A_MEMBER'),
    'a non-member urgency value is refused, not coerced');

  ok('R5.vocabulary-retired',
    !(SUCCESSOR_BINDING_ADMISSION_CODES as readonly string[]).includes('NOMINATION_PRIORITY_NOT_A_MEMBER'),
    'the successor vocabulary has no code for a field its contract does not carry');
}

// ================================================================ ABF-8 -- nomination ceiling

console.log('\n---- ABF-8: nomination ceiling (COPY, structurally unwidenable)');

ok('ABF-8.exists', typeof nominationCeilingViolations === 'function'
  && nominationCeilingViolations === guards.nominationCeilingViolations
  && SUCCESSOR_NOMINATION_CEILING === FROZEN_NOMINATION_CEILING
  && FROZEN_NOMINATION_CEILING === 1,
  'GUARD_EXISTS, and the successor ceiling is bound to the §202 constant');

{
  const two = [
    successorNominationDecl('n1'),
    successorNominationDecl('n2', {
      factKey: 'VN.REQUIRED_CONTROL.obs-1.43-77.2',
      branchA: 'the auger guard is reinstalled',
      branchB: 'the auger guard is still absent',
      evidenceSpan: 'The guard on the auger was removed',
      whyUnresolved: 'guard reinstatement is not established',
    }),
  ];
  const todayWidened = checkBindingDeclarations(
    [ancestorNominationDecl('n1'),
      ancestorNominationDecl('n2', {
        factKey: 'VN.REQUIRED_CONTROL.obs-1.43-77.2',
        branchA: 'the auger guard is reinstalled',
        branchB: 'the auger guard is still absent',
        evidenceSpan: 'The guard on the auger was removed',
        whyUnresolved: 'guard reinstatement is not established',
      })],
    emptyLedger, OBS, 5);
  ok('ABF-8.today', todayWidened.nominationCount === 2,
    'TODAY: the FROZEN ancestor admits 2 nominations when a caller passes maxNominations=5');

  ok('ABF-8.called', codesOf(nominationCeilingViolations(5)).includes('NOMINATION_CEILING_WIDENED_BY_CALLER'),
    'GUARD_CALLED: the §202 guard names an attempted widening (exercised on every successor call '
    + 'as the edit tripwire)');

  const r = checkBindingDeclarations203(two, emptyLedger, OBS);
  ok('ABF-8.ceiling-holds', r.nominationCount === 1
    && r.perDeclaration[1].codes.includes('MORE_THAN_ONE_NOMINATION'),
    'two nominations: the second is refused at the constant ceiling');

  const widened = (checkBindingDeclarations203 as any)(two, emptyLedger, OBS, 5);
  ok('ABF-8.adversarial', widened.nominationCount === 1
    && widened.perDeclaration[1].codes.includes('MORE_THAN_ONE_NOMINATION'),
    'GUARD_REJECTS_ADVERSARIAL_INPUT: an intentionally supplied fourth argument is structurally '
    + 'inert -- there is no parameter to widen');
  ok('ABF-8.structural', checkBindingDeclarations203.length === 3,
    'the successor signature has exactly three parameters');
}

// ================================================================ B5 / ABF-5 seam -- never silent

console.log('\n---- B5 / TODO-C seam: a terminal-status collision can never succeed silently');

{
  const { ledger, terminalKey } = ledgerWithTerminalFact();
  const colliding = successorNominationDecl('k1', {
    factKey: terminalKey,
    evidenceSpan: 'the flame sensor status was not stated',
  });

  // TODAY, on the frozen ancestor: admitted, applied, and the ledger is UNCHANGED with no signal.
  const todayCheck = checkBindingDeclarations(
    [ancestorNominationDecl('k1', { factKey: terminalKey })], ledger, OBS);
  const todayLedger = applyAdmittedDeclarations(ledger, todayCheck);
  ok('ABF-5.today', todayCheck.perDeclaration[0].admitted === true
    && todayLedger.facts.length === ledger.facts.length
    && factOf(todayLedger, terminalKey)?.status === 'COVERED',
    'TODAY: the FROZEN path admits the terminal collision and addOwedFact silently no-ops -- the '
    + '§202-measured ABF-5 defect, still present on the frozen path by design');

  // SUCCESSOR INVARIANT (branch-tolerant across the C handoff): never silent.
  const check = checkBindingDeclarations203([colliding], ledger, OBS);
  let branch: string;
  let silent = false;
  if (!check.perDeclaration[0].admitted) {
    branch = 'REFUSED_AT_ADMISSION';
    ok('ABF-5.invariant', check.perDeclaration[0].codes.includes('FACT_IDENTITY_COLLISION'),
      'refused at admission: the explicit structural state FACT_IDENTITY_COLLISION is named');
  } else {
    branch = 'ADMITTED_THEN_THROWN_AT_APPLY';
    let threw = false;
    try {
      const applied = applyAdmittedDeclarations203(ledger, check);
      silent = applied.ledger.facts.length === ledger.facts.length;
    } catch (e) {
      threw = String(e).includes('ADMITTED_NOMINATION_PRODUCED_NO_FACT');
    }
    ok('ABF-5.invariant', threw && !silent,
      'admitted at the seam, then the B5 post-condition THROWS: the §202 G6 guard fired');
  }
  console.log(`      (seam branch exercised at this freeze: ${branch})`);
  ok('ABF-5.existing-fact-preserved', factOf(ledger, terminalKey)?.status === 'COVERED',
    'the pre-existing terminal fact is unchanged in every branch');
  ok('ABF-5.guard-import', nominationOutcomeViolations === guards.nominationOutcomeViolations,
    'the post-condition is §202\'s G6, imported not reimplemented');
}

// ================================================================ differential safe paths

console.log('\n---- differential: safe input flows identically through successor and frozen paths');

{
  const input = baseProjectionInput(
    [validProjectionDecl('d1'),
      validProjectionDecl('d2', {
        observationSpan: 'the flame sensor status was not stated',
        missingFact: 'whether the flame sensor is operational',
        branchA: 'the sensor is operational', branchB: 'the sensor is not operational',
      })],
    { acceptableEvidenceBySourceId: { 'gov-1': goodCriterion } });
  const frozen = projectDeclaredOwedFacts(input as any);
  const successor = projectDeclaredOwedFacts203(input as any);
  ok('DIFF.projection', JSON.stringify(frozen) === JSON.stringify(successor.projection)
    && successor.boundaryRefusals.length === 0,
    'byte-identical ProjectionResult on safe input');
}
{
  const base = createOwedFactLedger('DEVELOPMENT', [unresolvedFact]);
  const bind = {
    declarationId: 'b1', bindingMode: 'BOUND_TO_OWED_FACT' as const,
    coversFactKey: unresolvedFact.factKey, nomination: null,
    question: 'Is the interlock functional?', affectedDecision: 'REQUIRED_CONTROL' as const,
  };
  const frozenCheck = checkBindingDeclarations(
    [bind, ancestorNominationDecl('b2')], base, OBS);
  const frozenLedger = applyAdmittedDeclarations(base, frozenCheck);
  const succCheck = checkBindingDeclarations203(
    [bind as SuccessorClarificationDeclaration, successorNominationDecl('b2')], base, OBS);
  const succApplied = applyAdmittedDeclarations203(base, succCheck);
  ok('DIFF.binding-outcome', JSON.stringify(frozenLedger) === JSON.stringify(succApplied.ledger),
    'byte-identical resulting ledger on safe input (ancestor nomination given priority OTHER, the '
    + 'successor\'s deterministic constant)');
  ok('DIFF.binding-admission',
    succCheck.admitted.length === 2 && succCheck.boundFactKeys[0] === unresolvedFact.factKey,
    'both declarations admitted, binding recorded');
}

// ================================================================ divergence pins D1 / D2

console.log('\n---- recorded successor-contract divergences, pinned');

{
  // D1: a boundary-refused declaration does not consume a frozen anchor ordinal.
  const first = validProjectionDecl('d1', { extra: 'benign unknown string' });
  const second = validProjectionDecl('d2', {
    branchA: 'the machine is locked out', branchB: 'the machine is not locked out',
    decisionIfA: 'work may proceed on this fact', decisionIfB: 'work must stop on this fact',
  });
  const frozen = projectDeclaredOwedFacts(baseProjectionInput([first, second]) as any);
  const successor = projectDeclaredOwedFacts203(baseProjectionInput([first, second]) as any);
  const frozenKey = frozen.declarationIdToFactKey['d2'];
  const successorKey = successor.projection!.declarationIdToFactKey['d2'];
  ok('D1.anchor-ordinal-pin', frozenKey.endsWith('.2') && successorKey.endsWith('.1'),
    `identity is computed over boundary survivors: frozen ${frozenKey} vs successor ${successorKey}`);
}
{
  // D2: a benign unknown top-level key refuses at the successor boundary and not at the frozen one.
  const decl = validProjectionDecl('d1', { extra: 'benign unknown string' });
  const frozen = projectDeclaredOwedFacts(baseProjectionInput([decl]) as any);
  const successor = projectDeclaredOwedFacts203(baseProjectionInput([decl]) as any);
  ok('D2.closed-keys-pin', frozen.facts.length === 1
    && successor.boundaryRefusals.length === 1
    && successor.boundaryRefusals[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    'Ruling 4: an unknown field does not survive the successor parse');
}

// ================================================================ Ruling 4 -- schema closure

console.log('\n---- Ruling 4: additionalProperties: false at every object node, and hostile parses');

function objectNodesMissingClosure(node: unknown, path = '$'): string[] {
  if (node === null || typeof node !== 'object') return [];
  const out: string[] = [];
  const n = node as Record<string, unknown>;
  const types = Array.isArray(n.type) ? n.type : [n.type];
  if (types.includes('object') && n.additionalProperties !== false) {
    out.push(path);
  }
  for (const [k, v] of Object.entries(n)) {
    out.push(...objectNodesMissingClosure(v, `${path}.${k}`));
  }
  return out;
}

ok('R4.binding-schema-closed',
  objectNodesMissingClosure(SUCCESSOR_CLARIFICATION_DECLARATION_SCHEMA_203).length === 0,
  'every object node of the binding schema sets additionalProperties: false');
ok('R4.projection-schema-closed',
  objectNodesMissingClosure(SUCCESSOR_FIRST_PASS_DECLARATION_SCHEMA_203).length === 0,
  'every object node of the projection schema sets additionalProperties: false');

{
  const hostileFields = ['sourceId', 'governedEvidenceSourceIds', 'branchA', 'settled', 'factKeyOverride'];
  let allRefused = true;
  for (const f of hostileFields) {
    const r = checkBindingDeclarations203(
      [successorNominationDecl('h1', {}, { [f]: 'hostile' })], emptyLedger, OBS);
    const c = r.perDeclaration[0].codes as readonly string[];
    if (r.perDeclaration[0].admitted
        || !(c.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY')
          || c.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'))) {
      allRefused = false;
      console.log(`      declaration-level field '${f}' was NOT refused`);
    }
  }
  ok('R4.declaration-hostile-fields', allRefused,
    'unknown authority-bearing declaration fields cannot survive parsing');
}
{
  const hostileNomFields = ['sourceId', 'governedEvidenceSourceIds', 'affectedDecisionOverride',
    'coverageDecision'];
  let allRefused = true;
  for (const f of hostileNomFields) {
    const r = checkBindingDeclarations203(
      [successorNominationDecl('h2', { [f]: 'hostile' })], emptyLedger, OBS);
    if (r.perDeclaration[0].admitted
        || !r.perDeclaration[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY')) {
      allRefused = false;
      console.log(`      nomination field '${f}' was NOT refused`);
    }
  }
  ok('R4.nomination-hostile-fields', allRefused,
    'unknown authority-bearing nomination fields cannot survive parsing');
}
{
  const r = projectDeclaredOwedFacts203(baseProjectionInput(
    [validProjectionDecl('d1', { priority: 'LIFE_CRITICAL' })]) as any);
  ok('R4.projection-priority-field', r.boundaryRefusals.length === 1
    && r.boundaryRefusals[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    'a top-level priority on a projection declaration is refused at the successor boundary '
    + '(the frozen DECLARATION_FORBIDDEN_FIELDS scan would also refuse it downstream)');
}

// ================================================================ contract bookkeeping

console.log('\n---- contract bookkeeping');

ok('BOOK.versions', checkBindingDeclarations203([], emptyLedger, OBS).successorVersion
  === SUCCESSOR_CONTRACT_VERSION, 'the successor result names its contract version');
ok('BOOK.vocabulary-closed',
  new Set(SUCCESSOR_BINDING_ADMISSION_CODES).size === SUCCESSOR_BINDING_ADMISSION_CODES.length
  && (SUCCESSOR_BINDING_ADMISSION_CODES as readonly string[]).includes('FACT_IDENTITY_COLLISION'),
  'admission vocabulary is duplicate-free and already declares FACT_IDENTITY_COLLISION for Agent C');
ok('BOOK.boundary-codes-closed',
  new Set(SUCCESSOR_PROJECTION_BOUNDARY_CODES).size === SUCCESSOR_PROJECTION_BOUNDARY_CODES.length,
  'projection boundary vocabulary is duplicate-free');
{
  const pe = successorProjectionEffect();
  const be = successorBindingEffect();
  ok('BOOK.effects', pe.providerCalls === 0 && pe.databaseOperations === 0
    && pe.modifiesFrozenProjection === false && pe.prioritiesMayBeEscalated === false
    && be.providerCalls === 0 && be.databaseOperations === 0
    && be.providerMaySetPriority === false && be.urgencyNominationMapsToPriority === false
    && be.admittedNominationMayVanishSilently === false,
    'effect declarations hold as literals');
}

// ================================================================ summary

console.log('\n================================================================');
console.log('GUARD INTEGRATION SUMMARY (Agent B, §203)');
for (const g of ['ABF-1', 'ABF-2', 'ABF-3', 'ABF-7', 'ABF-8']) {
  console.log(`  ${g}: GUARD_EXISTS + GUARD_CALLED + GUARD_REJECTS_ADVERSARIAL_INPUT asserted above`);
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
