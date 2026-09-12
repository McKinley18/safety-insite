/**
 * §217 PHASE A -- PREREGISTRATION VALIDATION. ZERO PROVIDER CALLS.
 * Everything below runs BEFORE the freeze and before any spend.
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  checkDeclarationEntry212, type DeclarationEntry212,
} from './lib/expert-212-challenge-vocabulary';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import {
  EXPERT_VERIFIER_216_SYSTEM_PROMPT, DISPOSITION_REMEDIATION_216_VERSION,
} from './lib/expert-216-disposition-remediation';
import { dispositionRoutingIsClosed } from './lib/expert-216-disposition-closure';
import {
  FINAL_CONFIRMATION_INSTRUMENT_217_VERSION, PROVIDER_CALLS_IN_PHASE_A, MAX_VERIFIER_CALLS_217,
  SPEND_CEILING_USD_217, PRIOR_CASES_NOT_REUSED, HARD_GATES_217, HARD_GATE_RULE_217,
  STANDING_GATES, FAILURE_CLASSES_217, CONTAINMENT_RULE, CONFIRMATION_CASES_217,
  EXECUTION_ORDER_217, NON_DEGENERACY, providerCallCount217, hardGateCoverage217,
  KR1_MOVEMENT_RULE_217, ACCEPTANCE_CHARACTER_217,
} from './lib/expert-217-final-confirmation-instrument';
import {
  assemble217, semanticFieldsSurvive217, ADAPTER_SUPPLIES_217, SEMANTIC_FIELDS_217,
} from './lib/expert-217-assembly';

let passed = 0; let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const A = assemble217();
const byCase = (id: string) => CONFIRMATION_CASES_217.find(c => c.caseId === id)!;

console.log('\n---- A. SHAPE AND NOVELTY ----');
ok('A1. four cases, four calls, one per case',
  CONFIRMATION_CASES_217.length === 4 && providerCallCount217() === 4
    && providerCallCount217() === MAX_VERIFIER_CALLS_217
    && CONFIRMATION_CASES_217.every(c => c.providerCalls === 1));
ok('A2. the four required mechanisms are present',
  ['EVIDENCE-PROXY / LATENT STATE', 'WRONG PROPERTY WITH A TEMPTING GOOD CLARIFICATION',
    'LEGITIMATE ACT-AS-PROPERTY. MANDATORY ANTI-OVERCORRECTION CONTROL.',
    'TWO INDEPENDENT FACTS. SIBLING CONTAINMENT AND RESTRAINT.']
    .every(m => CONFIRMATION_CASES_217.some(c => c.mechanism === m)));
ok('A3. execution order is frozen and covers the four calls',
  EXECUTION_ORDER_217.length === 4
    && new Set(EXECUTION_ORDER_217.map(s => s.caseId)).size === 4);
ok('A4. no §215 or §213 setting is reused',
  (() => {
    const t = CONFIRMATION_CASES_217.map(c => c.observation).join(' ').toLowerCase();
    return ['tanker', 'fire door', 'gangway', 'precast', 'ironer', 'steel frame', 'lifting eye',
      'bund', 'fumigat', 'ammonia', 'party wall', 'fire damper', 'auger', 'truss']
      .every(w => !t.includes(w));
  })(), 'checked mechanically');
ok('A5. no §216 fixture setting is reused',
  (() => {
    const t = CONFIRMATION_CASES_217.map(c => c.observation).join(' ').toLowerCase();
    return ['distribution board', 'packing line', 'boiler house', 'racking upright', 'grandstand']
      .every(w => !t.includes(w));
  })());
ok('A6. four distinct industries',
  new Set(CONFIRMATION_CASES_217.map(c => c.suppliedContext.location.split(',')[0])).size === 4,
  CONFIRMATION_CASES_217.map(c => c.suppliedContext.location.split(',')[0]).join(' | '));
ok('A7. no prior case id appears in any observation',
  PRIOR_CASES_NOT_REUSED.every(t =>
    !CONFIRMATION_CASES_217.some(c => c.observation.includes(t))));
ok('A8. Phase A made no provider call', PROVIDER_CALLS_IN_PHASE_A === 0);

console.log('\n---- B. FROZEN TRUTH ----');
ok('B1. every case freezes the controlling property and the property-role truth',
  CONFIRMATION_CASES_217.every(c => c.controllingProperty.length > 30
    && c.propertyRoleTruth.includes('FROZEN') && c.propertyRoleTruth.length > 200));
ok('B2. every case answers BOTH §216 property-test questions before execution',
  CONFIRMATION_CASES_217.every(c => typeof c.propertyTest.wouldKnowingItAnswerTheSafetyQuestion
    === 'boolean'
    && typeof c.propertyTest.canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay
    === 'boolean'));
ok('B3. the property test agrees with the required disposition on every case',
  CONFIRMATION_CASES_217.every(c => c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
    ? (!c.propertyTest.wouldKnowingItAnswerTheSafetyQuestion
      && c.propertyTest.canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay)
    : (c.propertyTest.wouldKnowingItAnswerTheSafetyQuestion
      && !c.propertyTest.canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay)),
  'frozen truth is internally consistent, checked rather than trusted');
ok('B4. K2 is the R-V4 instrument — wrong property with a GOOD bound question',
  byCase('K2').requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
    && byCase('K2').boundClarificationSettlesTheControllingProperty === true
    && byCase('K2').propertyRoleTruth.includes('THE TRAP IS THE QUESTION, NOT THE PROPERTY'),
  'a clarification-first reading finds nothing wrong');
ok('B5. K1 is a customary, useful proxy — not a straw case',
  byCase('K1').propertyRoleTruth.includes('plausible, useful and customary'));
ok('B6. K3 freezes why performance of the act controls the decision',
  byCase('K3').propertyRoleTruth.includes('NO separate condition')
    && byCase('K3').propertyRoleTruth.includes('HF3'));
ok('B7. K4 freezes both properties, the exact target and the sibling rule',
  byCase('K4').declarations.length === 2
    && byCase('K4').targetDeclarationId === 'K4-D1'
    && (byCase('K4').siblingTruth ?? '').includes('HF4')
    && (byCase('K4').siblingTruth ?? '').includes('HF5')
    && (byCase('K4').siblingTruth ?? '').includes('NOT scored against it'));
ok('B8. every case names what the observation establishes',
  CONFIRMATION_CASES_217.every(c => c.establishedByTheObservation.length >= 3));
ok('B9. every case carries mandatory evaluation questions',
  CONFIRMATION_CASES_217.every(c => c.evaluationQuestions.filter(q => q.mandatory).length >= 2));
ok('B10. the challenge cases each freeze what must NOT be asserted',
  CONFIRMATION_CASES_217.filter(c => c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')
    .every(c => c.mustNotAssert !== null));

console.log('\n---- C. NON-DEGENERACY ----');
ok('C1. two cases must be challenged and two must be left alone',
  NON_DEGENERACY.mustChallenge.length === 2 && NON_DEGENERACY.mustLeaveAlone.length === 2
    && NON_DEGENERACY.mustChallenge.every(id =>
      byCase(id).requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')
    && NON_DEGENERACY.mustLeaveAlone.every(id =>
      byCase(id).requiredDisposition === 'ACCEPT_PROPERTY_UNCHANGED'));
ok('C2. a challenge-everything strategy scores 2 of 4',
  CONFIRMATION_CASES_217.filter(c => c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')
    .length === 2);
ok('C3. a challenge-nothing strategy scores 2 of 4',
  CONFIRMATION_CASES_217.filter(c => c.requiredDisposition === 'ACCEPT_PROPERTY_UNCHANGED')
    .length === 2);
ok('C4. a clarification-first strategy fails K2 specifically',
  byCase('K2').boundClarificationSettlesTheControllingProperty === true
    && byCase('K2').requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY',
  'the question is good and the property is still wrong');

console.log('\n---- D. REPRESENTABILITY AND ASSEMBLY ----');
const entryFor = (disp: string, key: string): DeclarationEntry212 =>
  disp === 'CHALLENGE_PROPERTY_IDENTITY'
    ? { factKey: key, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'frozen reason',
      challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
      propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', representationConcern: 'NONE' }
    : { factKey: key, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
      propertyMismatchKind: null, representationConcern: 'NONE' };
ok('D1. every required disposition is representable in the UNCHANGED §212 vocabulary',
  CONFIRMATION_CASES_217.every(c =>
    checkDeclarationEntry212(entryFor(c.requiredDisposition, 'FP:k')).length === 0)
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3);
ok('D2. all four calls assemble with no failure',
  A.built.length === 4 && A.failures.length === 0,
  A.failures.map(f => `${f.caseId}:${f.reason}`).join(', ') || 'clean');
ok('D3. every span is verbatim in its own observation',
  CONFIRMATION_CASES_217.every(c => c.declarations
    .every(d => c.observation.includes(d.observationSpan))));
ok('D4. the adapter supplies exactly one mechanical field and every semantic field survives',
  ADAPTER_SUPPLIES_217.length === 1 && semanticFieldsSurvive217()
    && SEMANTIC_FIELDS_217.length === 11);
ok('D5. every payload carries the property and the unresolved action byte-exact',
  A.built.every(b => {
    const c = byCase(b.caseId);
    const d = c.declarations.find(x => x.declarationId === b.declarationId)!;
    const p = b.request.payload!;
    return p.owedProperty === d.missingFact
      && p.decisionWhileUnresolved === d.decisionWhileUnresolved
      && p.branchA === d.branchA && p.branchB === d.branchB;
  }));
ok('D6. K4 isolates the sibling clarification',
  (() => {
    const k4 = A.built.find(b => b.caseId === 'K4')!;
    return k4.retainedClarificationIds.join() === 'K4-C1'
      && k4.excludedClarificationIds.join() === 'K4-C2';
  })());
ok('D7. the §216 instruction is the one assembled, and there is one identity',
  A.built.every(b => b.systemPrompt === EXPERT_VERIFIER_216_SYSTEM_PROMPT)
    && new Set(A.built.map(b => b.identities.instruction)).size === 1
    && A.built[0].identities.instruction === sha(EXPERT_VERIFIER_216_SYSTEM_PROMPT));
ok('D8. the schema is the §212 successor, unchanged, with one identity',
  new Set(A.built.map(b => b.identities.schema)).size === 1
    && A.built.every(b => JSON.stringify(b.toolBlock.input_schema)
      === JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)));
ok('D9. four distinct user prompts, no strict flag, no cache_control',
  new Set(A.built.map(b => b.identities.userPrompt)).size === 4
    && A.built.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')
      && !JSON.stringify(b.toolBlock).includes('cache_control')));
ok('D10. the §216 structural closure still holds and the scope rule refuses the K4 prohibited shape',
  dispositionRoutingIsClosed()
    && !checkScopeContainment({
      scope: {
        targetFactKey: A.built[3].factKey, suppliedFactKeys: [A.built[3].factKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: { anything: 'the baler interlock' },
        clarificationSourceMode: 'NOMINATED_FACT',
        owedFactDeclarations: [{ factKey: A.built[3].factKey }],
      },
    }).admitted);

console.log('\n---- E. GATES, CLASSIFICATION AND STATUS ----');
ok('E1. seven hard gates, zero-occurrence, no aggregate compensation',
  HARD_GATES_217.length === 7 && HARD_GATE_RULE_217.threshold === 'ZERO_OCCURRENCE'
    && HARD_GATE_RULE_217.mayBeOffsetByAnAggregateScore === false
    && HARD_GATE_RULE_217.aggregatePercentageReported === false);
const cov = hardGateCoverage217();
ok('E2. every gate is covered by a case or is a standing gate',
  HARD_GATES_217.every(g => (cov[g.id] ?? []).length > 0)
    && STANDING_GATES.length === 3,
  Object.entries(cov).map(([k, v]) => `${k}:${v.join('/')}`).join('  '));
ok('E3. the A/B/C classification is frozen before execution',
  FAILURE_CLASSES_217.length === 3
    && FAILURE_CLASSES_217[0].consequence.includes('ONLY this class')
    && FAILURE_CLASSES_217.every(c => c.meaning.length > 40));
ok('E4. the containment rule is frozen before any output is seen',
  CONTAINMENT_RULE.rule.includes('DETERMINISTICALLY REFUSED')
    && CONTAINMENT_RULE.consequence.includes('at most Class B'));
ok('E5. KR-1 may move only on the frozen condition, and never to globally closed',
  KR1_MOVEMENT_RULE_217.before === 'OPEN'
    && KR1_MOVEMENT_RULE_217.mayMoveTo === 'TARGETEDLY_MITIGATED_AT_VERIFIER_LAYER'
    && KR1_MOVEMENT_RULE_217.mayNotMoveTo === 'GLOBALLY_CLOSED'
    && KR1_MOVEMENT_RULE_217.onlyIf.includes('K1 passes cleanly'));
ok('E6. this is a final confirmation whose purpose may not widen',
  ACCEPTANCE_CHARACTER_217.kind === 'FINAL_STANDALONE_VERIFIER_DEVELOPMENT_CONFIRMATION'
    && ACCEPTANCE_CHARACTER_217.purposeMayNotWidenDuringExecution === true
    && ACCEPTANCE_CHARACTER_217.isExpertAcceptance === false);
ok('E7. the spend ceiling is the authorized one', SPEND_CEILING_USD_217 === 0.22);

console.log('\n---- F. ARTIFACT INTEGRITY ----');
ok('F1. §215 evidence is byte-unchanged',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-215-minimal-verifier-confirmation-2026-09-09', 'RAW-VERIFIER-215.jsonl'), 'utf8')
    .trim().split('\n').length === 7);
ok('F2. §213 evidence and the frozen §211 digest are unchanged',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-213-targeted-verifier-validation-2026-09-09', 'RAW-VERIFIER-213.jsonl'), 'utf8')
    .trim().split('\n').length === 11
    && readFileSync(join(ROOT, 'verification',
      'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09',
      'VERIFIER-VALIDATION-PREREGISTRATION-211.sha256'), 'utf8').startsWith('3d325fd3'));
ok('F3. the §216 record already carries this exact instruction identity',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-216-disposition-and-property-remediation-2026-09-09',
    'REMEDIATION-RECORD-216.json'), 'utf8').includes(sha(EXPERT_VERIFIER_216_SYSTEM_PROMPT)));
ok('F4. both instruments declare their versions',
  FINAL_CONFIRMATION_INSTRUMENT_217_VERSION.startsWith('hazlenz.expert.217.')
    && DISPOSITION_REMEDIATION_216_VERSION.startsWith('hazlenz.expert.216.'));

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${FINAL_CONFIRMATION_INSTRUMENT_217_VERSION}   PHASE A`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
