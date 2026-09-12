/**
 * §203 EXPERT HAZLENZ -- ABF-5 / FACT_IDENTITY_COLLISION REGRESSION SUITE (Agent C).
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS WRITTEN OUTSIDE THIS PROCESS.
 *
 * Ruling 3: a nomination whose computed identity collides with an existing TERMINAL-status fact
 * must not silently succeed. The nine mandated regression cases are numbered C1..C9 below, plus
 * the frozen-vs-successor differential that reproduces §202's measured ABF-5.a silence on the
 * frozen path and proves the successor refuses the same input loudly. The frozen modules are
 * exercised read-only as measurement subjects; nothing here modifies them.
 */

import {
  checkBindingDeclarations203, applyAdmittedDeclarations203,
  type SuccessorBindingCheckResult, type SuccessorClarificationDeclaration,
} from './lib/expert-203-successor-binding';
import {
  FACT_IDENTITY_COLLISION_DISPOSITION, TERMINAL_OWED_FACT_STATUSES,
  collisionQuestionProjectionViolations, detectTerminalIdentityCollision,
  factIdentityCollisionEffect, terminalFactPreservationViolations,
} from './lib/expert-203-fact-identity-collision';
import {
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects,
  type BindingCheckResult, type ClarificationDeclaration,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  type OwedFactLedger, createOwedFactLedger, factOf, owedFact, preservationViolations, transition,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  OWED_FACT_STATUSES, REQUIRED_AUTHORITY, type OwedFactStatus,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  projectStructuralQuestions, type StructuralQuestion,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/structural-questions';

// ================================================================ harness

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${id}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${id}${detail ? ` -- ${detail}` : ''}`);
  }
}

// ================================================================ fixtures

const OBS = 'The panel door interlock is defeated with a zip tie. '
  + 'The forklift charger cable insulation is abraded near the plug. '
  + 'The mezzanine ladder self-closing gate is missing.';

const SPAN_A = 'panel door interlock is defeated with a zip tie';
const SPAN_B = 'forklift charger cable insulation is abraded near the plug';
const SPAN_C = 'mezzanine ladder self-closing gate is missing';

const KEY_A = 'VN.REQUIRED_CONTROL.OBS-1.4-51.1';
const KEY_B = 'VN.HAZARD_EXISTENCE.OBS-1.57-115.1';
const KEY_C = 'VN.REQUIRED_CONTROL.OBS-1.121-166.1';

function unresolvedFact(factKey: string, evidenceSpan: string) {
  return owedFact({
    factKey,
    affectedDecision: 'REQUIRED_CONTROL',
    source: 'VERIFIER_NOMINATION',
    evidenceSpan,
    whyUnresolved: 'the observation does not establish whether a control is functioning',
    branchA: 'the control is functioning',
    branchB: 'the control is defeated',
    decisionDivergence: { ifA: 'no additional control is required', ifB: 'an additional control is required' },
    priority: 'OTHER',
  });
}

function devLedger(facts: Parameters<typeof createOwedFactLedger>[1]): OwedFactLedger {
  return createOwedFactLedger('DEVELOPMENT', facts);
}

/** A ledger whose only fact for `factKey` has been transitioned to the given terminal status. */
function terminalLedger(
  factKey: string, span: string, to: Exclude<OwedFactStatus, 'UNRESOLVED'>,
  extraFacts: ReturnType<typeof unresolvedFact>[] = [],
): OwedFactLedger {
  const base = devLedger([unresolvedFact(factKey, span), ...extraFacts]);
  return transition(base, {
    factKey, to, authority: REQUIRED_AUTHORITY[to],
    justification: `suite fixture: ${factKey} moved to ${to} before the colliding nomination`,
  });
}

function successorNomination(
  factKey: string, evidenceSpan: string, declarationId = 'D-NOM-1',
): SuccessorClarificationDeclaration {
  return {
    declarationId,
    bindingMode: 'NOMINATED_NEW',
    coversFactKey: null,
    nomination: {
      factKey,
      affectedDecision: 'REQUIRED_CONTROL',
      evidenceSpan,
      whyUnresolved: 'the span raises a distinct unresolved protective-function question',
      branchA: 'the second condition is controlled',
      branchB: 'the second condition is uncontrolled',
      decisionIfA: 'record the existing control as adequate',
      decisionIfB: 'require an additional control for the second condition',
    },
    question: 'Is the second condition controlled?',
    affectedDecision: 'REQUIRED_CONTROL',
  };
}

/** The frozen ancestor's shape for the same nomination (its contract REQUIRES priority). */
function frozenNomination(
  factKey: string, evidenceSpan: string, declarationId = 'D-NOM-1',
): ClarificationDeclaration {
  const s = successorNomination(factKey, evidenceSpan, declarationId);
  return {
    declarationId: s.declarationId,
    bindingMode: 'NOMINATED_NEW',
    coversFactKey: null,
    nomination: {
      factKey,
      affectedDecision: 'REQUIRED_CONTROL',
      evidenceSpan,
      whyUnresolved: s.nomination!.whyUnresolved,
      branchA: s.nomination!.branchA,
      branchB: s.nomination!.branchB,
      decisionIfA: s.nomination!.decisionIfA,
      decisionIfB: s.nomination!.decisionIfB,
      priority: 'OTHER',
    },
    question: s.question,
    affectedDecision: 'REQUIRED_CONTROL',
  };
}

function boundDeclaration(coversFactKey: string, declarationId = 'D-BND-1'): SuccessorClarificationDeclaration {
  return {
    declarationId,
    bindingMode: 'BOUND_TO_OWED_FACT',
    coversFactKey,
    nomination: null,
    question: 'Is the named control functioning?',
    affectedDecision: 'REQUIRED_CONTROL',
  };
}

const check203 = (
  ds: readonly SuccessorClarificationDeclaration[], l: OwedFactLedger,
): SuccessorBindingCheckResult => checkBindingDeclarations203(ds, l, OBS);

console.log('§203 identity-collision suite (Agent C)');

// ================================================================ C1. no collision
{
  console.log('C1. no collision -- nomination admitted, fact added, factKey stable');
  const ledger = devLedger([unresolvedFact(KEY_A, SPAN_A)]);
  const check = check203([successorNomination(KEY_B, SPAN_B)], ledger);
  ok('C1.admitted', check.perDeclaration[0].admitted === true
    && check.perDeclaration[0].codes.length === 0, JSON.stringify(check.perDeclaration[0].codes));
  ok('C1.no-diagnostic', check.collisionDiagnostics.length === 0);
  const applied = applyAdmittedDeclarations203(ledger, check);
  ok('C1.fact-added', applied.ledger.facts.length === 2);
  const added = factOf(applied.ledger, KEY_B);
  ok('C1.factKey-stable', added !== undefined && added.factKey === KEY_B,
    'the supplied key is the admitted key, unmodified');
  ok('C1.status-unresolved', added?.status === 'UNRESOLVED');
}

// ================================================================ C2. UNRESOLVED collision
{
  console.log('C2. collision with an UNRESOLVED fact -- ancestor refusal preserved');
  const ledger = devLedger([unresolvedFact(KEY_A, SPAN_A)]);
  const check = check203([successorNomination(KEY_A, SPAN_B)], ledger);
  ok('C2.refused', check.perDeclaration[0].admitted === false);
  ok('C2.ancestor-code', check.perDeclaration[0].codes
    .includes('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT'));
  ok('C2.not-identity-collision',
    !check.perDeclaration[0].codes.includes('FACT_IDENTITY_COLLISION'),
    'an UNRESOLVED collision is the ancestor condition, not the terminal integrity condition');
  ok('C2.no-diagnostic', check.collisionDiagnostics.length === 0);
  // outcome parity with the frozen ancestor for the same input: same code, same detail sentence.
  const frozen = checkBindingDeclarations([frozenNomination(KEY_A, SPAN_B)], ledger, OBS);
  const fIdx = frozen.perDeclaration[0].codes
    .indexOf('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT');
  const sIdx = check.perDeclaration[0].codes
    .indexOf('NOMINATION_KEY_COLLIDES_WITH_AN_UNRESOLVED_OWED_FACT');
  ok('C2.detail-byte-identical', fIdx >= 0 && sIdx >= 0
    && frozen.perDeclaration[0].detail[fIdx] === check.perDeclaration[0].detail[sIdx],
    `frozen ${JSON.stringify(frozen.perDeclaration[0].detail[fIdx])} vs successor `
    + JSON.stringify(check.perDeclaration[0].detail[sIdx]));
}

// ================================================================ C3 + C4. terminal collisions
{
  console.log('C3/C4. collision with every terminal status -- FACT_IDENTITY_COLLISION');
  ok('C4.vocabulary-derived', JSON.stringify(TERMINAL_OWED_FACT_STATUSES)
    === JSON.stringify(OWED_FACT_STATUSES.filter(s => s !== 'UNRESOLVED')),
    'the terminal list is derived from the frozen vocabulary, covering every non-UNRESOLVED status');
  for (const status of TERMINAL_OWED_FACT_STATUSES) {
    const ledger = terminalLedger(KEY_A, SPAN_A, status);
    const before = factOf(ledger, KEY_A)!;
    const check = check203([successorNomination(KEY_A, SPAN_B)], ledger);
    const p = check.perDeclaration[0];
    ok(`C3.${status}.refused`, p.admitted === false && check.admitted.length === 0);
    ok(`C3.${status}.code`, p.codes.includes('FACT_IDENTITY_COLLISION'),
      JSON.stringify(p.codes));
    ok(`C3.${status}.not-silent`, p.codes.length > 0 && p.detail.length > 0,
      'an explicit structural state, never a silent no-op');
    ok(`C3.${status}.diagnostic`, check.collisionDiagnostics.length === 1
      && check.collisionDiagnostics[0].factKey === KEY_A
      && check.collisionDiagnostics[0].existingFactStatus === status
      && check.collisionDiagnostics[0].semanticPosition === 'NONE_TAKEN');
    const applied = applyAdmittedDeclarations203(ledger, check);
    const after = factOf(applied.ledger, KEY_A);
    ok(`C3.${status}.fact-unchanged`,
      terminalFactPreservationViolations(before, after).length === 0
      && JSON.stringify(after) === JSON.stringify(before));
    ok(`C3.${status}.not-reopened`, after?.status === status,
      'the terminal fact is never automatically reopened');
    ok(`C3.${status}.no-synthesized-key`,
      applied.ledger.facts.length === ledger.facts.length
      && JSON.stringify(applied.ledger.facts.map(f => f.factKey))
        === JSON.stringify(ledger.facts.map(f => f.factKey)),
      'the rejected nomination appears under no key at all');
    ok(`C3.${status}.no-transition-added`,
      applied.ledger.transitions.length === ledger.transitions.length,
      'no settlement or transition authority was exercised by the refusal');
  }
}

// ================================================================ C5. no question projection
{
  console.log('C5. question projection after a rejected collision');
  const ledger = terminalLedger(KEY_A, SPAN_A, 'COVERED', [unresolvedFact(KEY_C, SPAN_C)]);
  const check = check203([
    successorNomination(KEY_A, SPAN_B, 'D-NOM-1'),
    boundDeclaration(KEY_C, 'D-BND-1'),
  ], ledger);
  ok('C5.collision-refused', check.perDeclaration[0].admitted === false
    && check.perDeclaration[0].codes.includes('FACT_IDENTITY_COLLISION'));
  ok('C5.bound-admitted', check.perDeclaration[1].admitted === true);
  // The frozen projector reads only fields the successor shape carries truthfully; the cast
  // asserts structural sufficiency exactly as the B5 call site does (no field value is invented).
  const projection = projectStructuralQuestions(
    check as unknown as BindingCheckResult, ledger, { attemptId: 'C5' },
  );
  ok('C5.no-question-for-collision',
    projection.questions.every(q => q.bindingFactKey !== KEY_A),
    'no clarification is projected against the rejected nomination');
  ok('C5.helper-clean',
    collisionQuestionProjectionViolations(check.collisionDiagnostics, projection.questions)
      .length === 0);
  ok('C5.unaffected-fact-still-projected',
    projection.questions.some(q => q.bindingFactKey === KEY_C),
    'the sibling bound fact keeps its own question -- projection behavior otherwise unchanged');
  // Adversarial: the helper actually detects, rather than passing vacuously.
  const forged: StructuralQuestion = {
    clarificationKey: 'forged:KEY_A', bindingFactKey: KEY_A, question: 'forged?',
    affectedDecision: 'REQUIRED_CONTROL', sourceAttempt: null,
    priority: 'OTHER', presentationStatus: 'SELECTED',
  };
  ok('C5.helper-detects-forged',
    collisionQuestionProjectionViolations(check.collisionDiagnostics, [forged]).length === 1);
}

// ================================================================ C6. sibling independence
{
  console.log('C6. a sibling independent fact admits normally beside the collision');
  const ledger = terminalLedger(KEY_A, SPAN_A, 'COVERED', [unresolvedFact(KEY_C, SPAN_C)]);
  const check = check203([
    successorNomination(KEY_A, SPAN_B, 'D-NOM-1'),
    boundDeclaration(KEY_C, 'D-BND-1'),
  ], ledger);
  const applied = applyAdmittedDeclarations203(ledger, check);
  ok('C6.sibling-bound-applied', factOf(applied.ledger, KEY_C)?.status === 'COVERED',
    'the admitted sibling binding proceeded untouched by the refusal beside it');
  ok('C6.collided-fact-untouched',
    JSON.stringify(factOf(applied.ledger, KEY_A)) === JSON.stringify(factOf(ledger, KEY_A)));
  // A sibling NOMINATION (its own check, under the 1-nomination ceiling) is equally unaffected.
  const nomCheck = check203([successorNomination(KEY_B, SPAN_B, 'D-NOM-2')], applied.ledger);
  ok('C6.sibling-nomination-admits', nomCheck.perDeclaration[0].admitted === true);
  ok('C6.sibling-nomination-applies',
    factOf(applyAdmittedDeclarations203(applied.ledger, nomCheck).ledger, KEY_B) !== undefined);
}

// ================================================================ C7. repeated collision
{
  console.log('C7. repeated collision is deterministic and accumulates nothing');
  const ledger = terminalLedger(KEY_A, SPAN_A, 'COVERED');
  const one = check203([successorNomination(KEY_A, SPAN_B)], ledger);
  const two = check203([successorNomination(KEY_A, SPAN_B)], ledger);
  ok('C7.deterministic', JSON.stringify(one) === JSON.stringify(two),
    'the same input yields the byte-identical result both times');
  const l1 = applyAdmittedDeclarations203(ledger, one).ledger;
  const l2 = applyAdmittedDeclarations203(l1, two).ledger;
  ok('C7.no-accumulation', JSON.stringify(l2) === JSON.stringify(ledger),
    'two refusals leave the ledger exactly as it began');
  const batch = check203([
    successorNomination(KEY_A, SPAN_B, 'D-NOM-1'),
    successorNomination(KEY_A, SPAN_B, 'D-NOM-1'),
  ], ledger);
  ok('C7.batch-both-refused', batch.perDeclaration.every(p => !p.admitted));
  ok('C7.batch-duplicate-also-named',
    batch.perDeclaration[1].codes.includes('DUPLICATE_DECLARATION_ID'));
}

// ================================================================ C8. diagnostic vs §202 silence
{
  console.log('C8. the frozen path is still silent (ABF-5.a reproduced); the successor is loud');
  const ledger = terminalLedger(KEY_A, SPAN_A, 'COVERED');
  const before = ledger;
  // ---- frozen path, §202 ABF-5.a: admitted, applied, and every audit reports nothing.
  const frozenCheck = checkBindingDeclarations([frozenNomination(KEY_A, SPAN_B)], ledger, OBS);
  ok('C8.frozen-admits', frozenCheck.perDeclaration[0].admitted === true
    && frozenCheck.perDeclaration[0].codes.length === 0
    && frozenCheck.nominationCount === 1,
    'the frozen boundary still admits the terminal collision -- by design, unmodified');
  const frozenAfter = applyAdmittedDeclarations(ledger, frozenCheck);
  ok('C8.frozen-no-op', frozenAfter.facts.length === before.facts.length,
    'the admitted nomination produced no fact -- the silent discard');
  ok('C8.frozen-preservation-silent', preservationViolations(before, frozenAfter).length === 0);
  ok('C8.frozen-side-effects-silent',
    bindingSideEffects(before, frozenAfter, frozenCheck).length === 0);
  ok('C8.frozen-span-stands-in',
    factOf(frozenAfter, KEY_A)?.evidenceSpan === SPAN_A,
    'the pre-existing fact, with its own span, stands in for the nominated one');
  // ---- successor path, same input: refused, with the structured diagnostic as evidence.
  const succ = check203([successorNomination(KEY_A, SPAN_B)], ledger);
  const d = succ.collisionDiagnostics[0];
  ok('C8.successor-refuses', succ.perDeclaration[0].admitted === false
    && succ.perDeclaration[0].codes.includes('FACT_IDENTITY_COLLISION'));
  ok('C8.diagnostic-names-both-identities', d !== undefined
    && d.factKey === KEY_A && d.existingFactStatus === 'COVERED'
    && d.existingEvidenceSpan === SPAN_A && d.nominatedEvidenceSpan === SPAN_B
    && d.evidenceSpansByteIdentical === false);
  ok('C8.diagnostic-takes-no-position', d?.semanticPosition === 'NONE_TAKEN'
    && d?.integrityCondition === true);
  ok('C8.disposition-as-data',
    JSON.stringify(d?.disposition) === JSON.stringify(FACT_IDENTITY_COLLISION_DISPOSITION));
  const detached = detectTerminalIdentityCollision(ledger, KEY_A,
    { evidenceSpan: SPAN_B, whyUnresolved: 'x' });
  ok('C8.detector-standalone', detached !== null && detached.existingFactStatus === 'COVERED');
  ok('C8.detector-null-on-fresh-key',
    detectTerminalIdentityCollision(ledger, KEY_B, { evidenceSpan: SPAN_B, whyUnresolved: 'x' })
      === null);
}

// ================================================================ C9. key stability
{
  console.log('C9. factKey stability for non-colliding facts');
  const ledger = devLedger([unresolvedFact(KEY_A, SPAN_A)]);
  const keys = [KEY_B, KEY_C, 'FP.EXPOSURE.OBS-9.0-12.3', 'a', 'K_1:x.y-z'];
  let stable = true;
  let l203 = ledger;
  let lFrozen = ledger;
  for (const [i, k] of keys.entries()) {
    const sCheck = check203([successorNomination(k, SPAN_B, `D-NOM-${i}`)], l203);
    const fCheck = checkBindingDeclarations([frozenNomination(k, SPAN_B, `D-NOM-${i}`)], lFrozen, OBS);
    if (!sCheck.perDeclaration[0].admitted || !fCheck.perDeclaration[0].admitted) stable = false;
    l203 = applyAdmittedDeclarations203(l203, sCheck).ledger;
    lFrozen = applyAdmittedDeclarations(lFrozen, fCheck);
    if (factOf(l203, k)?.factKey !== k) stable = false;
  }
  ok('C9.keys-stable-and-admitted', stable, 'every supplied non-colliding key is admitted as-is');
  ok('C9.key-sets-identical-to-frozen',
    JSON.stringify(l203.facts.map(f => f.factKey))
      === JSON.stringify(lFrozen.facts.map(f => f.factKey)),
    'the successor changes admission on collision only; identity of admitted keys is untouched');
}

// ================================================================ effect assertions
{
  console.log('E. module effect claims hold as literals');
  const e = factIdentityCollisionEffect();
  ok('E.effect', e.providerCalls === 0 && e.databaseOperations === 0
    && e.mutatesAnyLedger === false && e.infersSemanticIdentity === false
    && e.infersSemanticDistinctness === false && e.reopensTerminalFacts === false
    && e.synthesizesReplacementKeys === false);
}

console.log(`\n§203 identity-collision suite: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
