/**
 * §219 PHASE A -- PREREGISTRATION VALIDATION AND THE FROZEN SCORER SUITE. ZERO PROVIDER CALLS.
 * Everything below runs BEFORE the freeze and before any spend.
 */
import { createHash } from 'crypto';

import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  checkDeclarationEntry212, type DeclarationEntry212,
} from './lib/expert-212-challenge-vocabulary';
import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import { EXPERT_VERIFIER_216_SYSTEM_PROMPT } from './lib/expert-216-disposition-remediation';
import { dispositionRoutingIsClosed } from './lib/expert-216-disposition-closure';
import {
  VERIFIER_218_RESPONSE_SCHEMA, reconstruct212Schema, PROPERTY_SEMANTIC_ROLES_218,
  PROPERTY_VALIDITIES_218, schemaAccounting218,
} from './lib/expert-218-property-review-contract';
import {
  EXPERT_VERIFIER_218_SYSTEM_PROMPT, reconstruct216SystemPrompt,
} from './lib/expert-218-property-instruction';
import {
  checkPropertyReview218, consistencyEffect218, CONSISTENCY_DECISION_INPUTS_218,
} from './lib/expert-218-property-consistency';
import {
  STRUCTURED_CONFIRMATION_INSTRUMENT_219_VERSION, PROVIDER_CALLS_IN_PHASE_A,
  MAX_VERIFIER_CALLS_219, SPEND_CEILING_USD_219, PROJECTED_SPEND_USD_219,
  DATABASE_OPERATIONS_AUTHORIZED_219, PRIOR_CASES_NOT_REUSED,
  SECTION_218_FIXTURE_SETTINGS_NOT_REUSED, HARD_GATES_219, HARD_GATE_RULE_219, STANDING_GATES_219,
  HG9_EXERCISED_ON, FAILURE_CLASSES_219, CONTAINMENT_RULE_219, STRUCTURAL_IS_NOT_SEMANTIC_219,
  SCHEMA_CANARY_219, CONFIRMATION_CASES_219, EXECUTION_ORDER_219, NON_DEGENERACY_219,
  DOCUMENT_SHAPED_CASES_219, DISPOSITION_CONSISTENCY_219,
  DECISION_CONTROLLING_PROPERTY_SCORING_219, providerCallCount219, hardGateCoverage219,
  trivialStrategyFailures219, KR1_MOVEMENT_RULE_219, ACCEPTANCE_CHARACTER_219, STOPPING_RULE_219,
  AUTHORIZATION_BOUNDARY_219, TERMINALS_219,
} from './lib/expert-219-structured-confirmation-instrument';
import {
  assemble219, semanticFieldsSurvive219, ADAPTER_SUPPLIES_219, SEMANTIC_FIELDS_219,
} from './lib/expert-219-assembly';
import {
  scoreCall219, gateOccurrenceCounts219, scoringEffect219, SCORING_219_VERSION,
} from './lib/expert-219-scoring';

let passed = 0; let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const A = assemble219();
const byCase = (id: string) => CONFIRMATION_CASES_219.find(c => c.caseId === id)!;
const built = (id: string) => A.built.find(b => b.caseId === id)!;

console.log('\n---- A. SHAPE, NOVELTY AND BOUNDARY ----');
ok('A1. five cases, five calls, one per case',
  CONFIRMATION_CASES_219.length === 5 && providerCallCount219() === 5
    && providerCallCount219() === MAX_VERIFIER_CALLS_219
    && CONFIRMATION_CASES_219.every(c => c.providerCalls === 1));
ok('A2. the five required mechanisms are present, one per case',
  new Set(CONFIRMATION_CASES_219.map(c => c.mechanism)).size === 5
    && byCase('A1').mechanism.includes('EVIDENCE PROXY / PHYSICAL LATENT STATE')
    && byCase('A2').mechanism.includes('EVIDENCE PROXY / DOCUMENT OR CERTIFICATE')
    && byCase('A3').mechanism.includes('LEGITIMATE REQUIRED ACT')
    && byCase('A4').mechanism.includes('LEGITIMATE REQUIRED ARTIFACT')
    && byCase('A5').mechanism.includes('CORRECT UNDERLYING SAFETY STATE'));
ok('A3. execution order is frozen and covers the five calls',
  EXECUTION_ORDER_219.length === 5 && new Set(EXECUTION_ORDER_219.map(s => s.caseId)).size === 5
    && EXECUTION_ORDER_219.every((s, i) => s.caseId === `A${i + 1}`));
ok('A4. no §217, §215 or §213 setting is reused',
  (() => {
    const t = CONFIRMATION_CASES_219.map(c => `${c.observation} ${c.suppliedContext.location}`)
      .join(' ').toLowerCase();
    return ['poultry', 'standby generator', 'leisure centre', 'swimming pool', 'gas processing',
      'export compressor', 'materials recovery', 'picking cabin', 'baler',
      'tanker', 'fire door', 'gangway', 'precast', 'ironer', 'steel frame', 'lifting eye',
      'bund', 'fumigat', 'ammonia', 'party wall', 'fire damper', 'auger', 'truss']
      .every(w => !t.includes(w));
  })(), 'checked mechanically against §217, §215 and §213 settings');
ok('A5. no §216 or §218 local fixture setting is reused',
  (() => {
    const t = CONFIRMATION_CASES_219.map(c => c.observation).join(' ').toLowerCase();
    return ['distribution board', 'packing line', 'boiler house', 'racking upright', 'grandstand',
      'ultrasonic thickness', 'loler', 'gantry hoist', 'buried services', 'confined-space',
      'edge protection', 'tank farm', 'exhaust ventilation', 'welding bay', 'hydrotherapy',
      'mezzanine guardrail'].every(w => !t.includes(w))
      && SECTION_218_FIXTURE_SETTINGS_NOT_REUSED.length === 9;
  })());
ok('A6. five distinct industries',
  new Set(CONFIRMATION_CASES_219.map(c => c.suppliedContext.location.split(',')[0])).size === 5,
  CONFIRMATION_CASES_219.map(c => c.suppliedContext.location.split(',')[0]).join(' | '));
ok('A7. no prior case id appears in any observation',
  PRIOR_CASES_NOT_REUSED.every(t =>
    !CONFIRMATION_CASES_219.some(c => c.observation.includes(t))));
ok('A8. Phase A made no provider call and no database operation',
  PROVIDER_CALLS_IN_PHASE_A === 0 && DATABASE_OPERATIONS_AUTHORIZED_219 === 0);
ok('A9. the authorization boundary is frozen as literals',
  AUTHORIZATION_BOUNDARY_219.retries === 0 && AUTHORIZATION_BOUNDARY_219.secondDraws === 0
    && AUTHORIZATION_BOUNDARY_219.rescueCalls === 0
    && AUTHORIZATION_BOUNDARY_219.alternateModel === false
    && AUTHORIZATION_BOUNDARY_219.firstPassCalls === 0
    && AUTHORIZATION_BOUNDARY_219.governedStageCalls === 0
    && AUTHORIZATION_BOUNDARY_219.remediation === false
    && AUTHORIZATION_BOUNDARY_219.promptChanges === false
    && AUTHORIZATION_BOUNDARY_219.schemaChanges === false
    && AUTHORIZATION_BOUNDARY_219.commit === false && AUTHORIZATION_BOUNDARY_219.push === false
    && AUTHORIZATION_BOUNDARY_219.tag === false && AUTHORIZATION_BOUNDARY_219.deploy === false);
ok('A10. the preferred design uses no first-pass and no governed-stage call',
  A.built.every(b => b.request.ancillary.included === false)
    && AUTHORIZATION_BOUNDARY_219.firstPassCalls === 0);

console.log('\n---- B. FROZEN TRUTH ----');
ok('B1. every case freezes the role, the validity, the controlling property and the role truth',
  CONFIRMATION_CASES_219.every(c =>
    (PROPERTY_SEMANTIC_ROLES_218 as readonly string[]).includes(c.expectedRole)
    && (PROPERTY_VALIDITIES_218 as readonly string[]).includes(c.expectedValidity)
    && c.controllingProperty.length > 30
    && c.propertyRoleTruth.startsWith('FROZEN:') && c.propertyRoleTruth.length > 250));
ok('B2. the frozen role and the frozen validity agree on every case',
  CONFIRMATION_CASES_219.every(c =>
    (c.expectedRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY') === (c.expectedValidity === 'INVALID')
    && (c.expectedRole === 'AMBIGUOUS_OR_UNRESOLVED') === (c.expectedValidity === 'UNCERTAIN')),
  'the §218 cross-field invariants hold on the frozen truth itself');
ok('B3. the property test agrees with the required disposition on every case',
  CONFIRMATION_CASES_219.every(c => c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
    ? (!c.propertyTest.wouldKnowingItAnswerTheSafetyQuestion
      && c.propertyTest.canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay)
    : (c.propertyTest.wouldKnowingItAnswerTheSafetyQuestion
      && !c.propertyTest.canItBeSatisfiedOrAbsentWhileTheRealConditionGoesEitherWay)),
  'frozen truth is internally consistent, checked rather than trusted');
ok('B4. the required disposition follows from the frozen validity on every case',
  CONFIRMATION_CASES_219.every(c => (c.expectedValidity === 'INVALID')
    === (c.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')));
ok('B5. A1 freezes a customary, useful, required proxy — not a straw case',
  byCase('A1').propertyRoleTruth.includes('required, customary, useful and practical')
    && byCase('A1').propertyRoleTruth.includes('reasonable, customary, necessary evidence'));
ok('B6. A2 freezes the "lack documentation proving X" vs "the owed property is the document" line',
  byCase('A2').propertyRoleTruth.includes('we lack documentation proving X')
    && byCase('A2').propertyRoleTruth.includes('the artifact is NOT the controlling requirement')
    && byCase('A2').propertyRoleTruth.includes('THE PAIR TO A4'));
ok('B7. A3 freezes why performance of the act controls, and names HG3',
  byCase('A3').propertyRoleTruth.includes('NO separate condition')
    && byCase('A3').propertyRoleTruth.includes('HG3'));
ok('B8. A4 freezes why the artifact itself is the requirement, and names HG4',
  byCase('A4').propertyRoleTruth.includes('the paper IS')
    && byCase('A4').propertyRoleTruth.includes('no separate condition underneath')
    && byCase('A4').propertyRoleTruth.includes('HG4'));
ok('B9. A5 freezes why the supplied property already names the underlying state, and names HG5',
  byCase('A5').propertyRoleTruth.includes('IS the physical condition')
    && byCase('A5').propertyRoleTruth.includes('HG5'));
ok('B10. every case names what the observation establishes',
  CONFIRMATION_CASES_219.every(c => c.establishedByTheObservation.length >= 3));
ok('B11. every case carries at least three mandatory evaluation questions',
  CONFIRMATION_CASES_219.every(c => c.evaluationQuestions.filter(q => q.mandatory).length >= 3));
ok('B12. every case that can be over-asserted freezes what must NOT be asserted',
  byCase('A1').mustNotAssert !== null && byCase('A2').mustNotAssert !== null
    && byCase('A5').mustNotAssert !== null
    && HG9_EXERCISED_ON.join() === 'A1,A2,A5',
  'HG9 is scored only where the case gives a genuine opportunity to fail');
ok('B13. every hard gate a case can trip is declared on that case',
  byCase('A1').hardGatesIfWrong.includes('HG1') && byCase('A2').hardGatesIfWrong.includes('HG1')
    && byCase('A3').hardGatesIfWrong.includes('HG3')
    && byCase('A4').hardGatesIfWrong.includes('HG4')
    && byCase('A5').hardGatesIfWrong.includes('HG5'));

console.log('\n---- C. NON-DEGENERACY, ASSERTED BEFORE THE FREEZE ----');
ok('C1. two cases must be challenged and three must be left alone',
  NON_DEGENERACY_219.mustChallenge.length === 2 && NON_DEGENERACY_219.mustLeaveAlone.length === 3
    && NON_DEGENERACY_219.mustChallenge.every(id =>
      byCase(id).requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')
    && NON_DEGENERACY_219.mustLeaveAlone.every(id =>
      byCase(id).requiredDisposition === 'ACCEPT_PROPERTY_UNCHANGED'));
for (const s of NON_DEGENERACY_219.strategies) {
  const actual = trivialStrategyFailures219(s.strategy);
  ok(`C2.${s.strategy} fails exactly ${s.mustFail.join(', ')}`,
    actual.join(',') === [...s.mustFail].join(','), `computed: ${actual.join(',') || 'none'}`);
}
ok('C3. A2 and A4 are both document-shaped and their required answers are OPPOSITE',
  DOCUMENT_SHAPED_CASES_219.join() === 'A2,A4'
    && byCase('A2').expectedRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY'
    && byCase('A4').expectedRole === 'REQUIRED_ARTIFACT_ITSELF'
    && byCase('A2').expectedValidity !== byCase('A4').expectedValidity,
  'the pairing is the reason both are in the set');
ok('C4. no trivial strategy scores five of five',
  NON_DEGENERACY_219.strategies.every(s => trivialStrategyFailures219(s.strategy).length > 0));
ok('C5. the three roles that may stand are all represented',
  new Set(CONFIRMATION_CASES_219.map(c => c.expectedRole)).size === 4,
  [...new Set(CONFIRMATION_CASES_219.map(c => c.expectedRole))].join(' | '));

console.log('\n---- D. REPRESENTABILITY AND ASSEMBLY ----');
const entryFor = (disp: string, key: string): DeclarationEntry212 =>
  disp === 'CHALLENGE_PROPERTY_IDENTITY'
    ? { factKey: key, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'frozen reason',
      challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
      propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', representationConcern: 'NONE' }
    : { factKey: key, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
      propertyMismatchKind: null, representationConcern: 'NONE' };
ok('D1. every required disposition is representable in the UNCHANGED §212 vocabulary',
  CONFIRMATION_CASES_219.every(c =>
    checkDeclarationEntry212(entryFor(c.requiredDisposition, 'FP:k')).length === 0)
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3,
  'no vocabulary member is added by §219');
ok('D2. all five calls assemble with no failure',
  A.built.length === 5 && A.failures.length === 0,
  A.failures.map(f => `${f.caseId}:${f.reason}`).join(', ') || 'clean');
ok('D3. every span is verbatim in its own observation',
  CONFIRMATION_CASES_219.every(c => c.declarations
    .every(d => c.observation.includes(d.observationSpan))));
ok('D4. the adapter supplies exactly one mechanical field and every semantic field survives',
  ADAPTER_SUPPLIES_219.length === 1 && ADAPTER_SUPPLIES_219[0] === 'observationSourceId'
    && semanticFieldsSurvive219() && SEMANTIC_FIELDS_219.length === 11);
ok('D5. every payload carries the property, the branches and the unresolved action byte-exact',
  A.built.every(b => {
    const c = byCase(b.caseId);
    const d = c.declarations.find(x => x.declarationId === b.declarationId)!;
    const p = b.request.payload!;
    return p.owedProperty === d.missingFact
      && p.decisionWhileUnresolved === d.decisionWhileUnresolved
      && p.branchA === d.branchA && p.branchB === d.branchB
      && p.declarationId === d.declarationId;
  }));
ok('D6. the declaration id reaches the fact block, so targetDeclarationId is copyable',
  A.built.every(b => b.userPrompt.includes(`declaration id: ${b.declarationId}`)));
ok('D7. the §218 instruction is the one assembled, and there is one identity',
  A.built.every(b => b.systemPrompt === EXPERT_VERIFIER_218_SYSTEM_PROMPT)
    && new Set(A.built.map(b => b.identities.instruction)).size === 1
    && A.built[0].identities.instruction === sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT));
ok('D8. the §218 instruction is the §216 prompt plus the property block, byte for byte',
  reconstruct216SystemPrompt(EXPERT_VERIFIER_218_SYSTEM_PROMPT)
    === EXPERT_VERIFIER_216_SYSTEM_PROMPT,
  `${EXPERT_VERIFIER_218_SYSTEM_PROMPT.length} -> ${EXPERT_VERIFIER_216_SYSTEM_PROMPT.length}`);
ok('D9. the §218 schema is the one assembled, with one identity, and is additive by construction',
  new Set(A.built.map(b => b.identities.schema)).size === 1
    && A.built.every(b => JSON.stringify(b.toolBlock.input_schema)
      === JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA))
    && JSON.stringify(reconstruct212Schema()) === JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA));
ok('D10. propertyReview is required and carries the five fields',
  (() => {
    const s = VERIFIER_218_RESPONSE_SCHEMA as Record<string, any>;
    const n = s.properties.propertyReview;
    return (s.required as string[]).includes('propertyReview')
      && (n.required as string[]).length === 5
      && n.properties.propertySemanticRole.enum.length === 5
      && n.properties.propertyValidity.enum.length === 3;
  })());
ok('D11. five distinct user prompts, no strict flag, no cache_control',
  new Set(A.built.map(b => b.identities.userPrompt)).size === 5
    && A.built.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')
      && !JSON.stringify(b.toolBlock).includes('cache_control')));
ok('D12. the §216 structural closure still holds and the §214 scope rule still refuses a nomination',
  dispositionRoutingIsClosed()
    && !checkScopeContainment({
      scope: {
        targetFactKey: built('A5').factKey, suppliedFactKeys: [built('A5').factKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: { anything: 'a sibling' }, clarificationSourceMode: 'NOMINATED_FACT',
        owedFactDeclarations: [{ factKey: built('A5').factKey }],
      },
    }).admitted);
ok('D13. the schema canary figures match the measured §218 accounting',
  (() => {
    const acc = schemaAccounting218();
    return Number(acc.baseBytes) === SCHEMA_CANARY_219.baseSchemaBytes
      && Number(acc.successorBytes) === SCHEMA_CANARY_219.successorSchemaBytes;
  })(), `${SCHEMA_CANARY_219.baseSchemaBytes} -> ${SCHEMA_CANARY_219.successorSchemaBytes}`);

console.log('\n---- E. GATES, CLASSIFICATION AND STATUS ----');
ok('E1. eleven separate hard gates, zero-occurrence, no compensation of any kind',
  HARD_GATES_219.length === 11 && HARD_GATE_RULE_219.threshold === 'ZERO_OCCURRENCE'
    && HARD_GATE_RULE_219.mayBeOffsetByAnAggregateScore === false
    && HARD_GATE_RULE_219.mayBeOffsetByAnotherGate === false
    && HARD_GATE_RULE_219.aggregatePercentageReported === false
    && HARD_GATE_RULE_219.gatesAreSeparate === true);
ok('E2. every hard gate is covered by at least one case or is a standing gate',
  Object.values(hardGateCoverage219()).every(v => v.length > 0),
  JSON.stringify(hardGateCoverage219()));
ok('E3. HG7-HG11 are standing gates on every call',
  STANDING_GATES_219.join() === 'HG7,HG8,HG9,HG10,HG11'
    && STANDING_GATES_219.every(g => hardGateCoverage219()[g].length > 0));
ok('E4. three failure classes and the containment rule are frozen before execution',
  FAILURE_CLASSES_219.length === 3
    && CONTAINMENT_RULE_219.consequence.includes('at most Class B'));
ok('E5. a structural failure may never be converted into a semantic verdict',
  STRUCTURAL_IS_NOT_SEMANTIC_219.consequence.includes('no such failure is recorded as an occurrence')
    && STRUCTURAL_IS_NOT_SEMANTIC_219.notExercisedIsNotCorrect.includes('NOT_EXERCISED'));
ok('E6. the schema canary is call A1 and is not a separate smoke call',
  SCHEMA_CANARY_219.canaryCall === 'A1' && SCHEMA_CANARY_219.isASeparateSmokeCall === false
    && SCHEMA_CANARY_219.stopConditions.length === 4
    && SCHEMA_CANARY_219.onStop.retry === false
    && SCHEMA_CANARY_219.onStop.shrinkTheSchema === false
    && SCHEMA_CANARY_219.onStop.executeRemainingCalls === false
    && SCHEMA_CANARY_219.onStop.terminal === TERMINALS_219.canaryFailed);
ok('E7. KR-1 begins §219 OPEN and no §217 result is reclassified',
  KR1_MOVEMENT_RULE_219.before === 'OPEN'
    && KR1_MOVEMENT_RULE_219.mayNotMoveTo === 'GLOBALLY_CLOSED'
    && KR1_MOVEMENT_RULE_219.noSection217ResultIsReclassified === true);
ok('E8. the acceptance character is a confirmation, not acceptance or validation',
  ACCEPTANCE_CHARACTER_219.isExpertAcceptance === false
    && ACCEPTANCE_CHARACTER_219.isProductionValidation === false
    && ACCEPTANCE_CHARACTER_219.isIntegratedPipelineValidation === false
    && ACCEPTANCE_CHARACTER_219.aggregatePercentageReported === false
    && ACCEPTANCE_CHARACTER_219.purposeMayNotWidenDuringExecution === true
    && ACCEPTANCE_CHARACTER_219.isADiscoveryExercise === false);
ok('E9. the A1/A2 stopping rule forbids every form of remediation',
  STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.remediate === false
    && STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.editThePrompt === false
    && STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.addAnotherEnum === false
    && STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.addAnotherVerifierLayer === false
    && STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.runAnotherConfirmation === false
    && STOPPING_RULE_219.ifA1OrA2MaterialMisclassification.productOwnerChoices.length === 3);
ok('E10. spend is projected and ceilinged, and coverage may not be cut for savings',
  PROJECTED_SPEND_USD_219 < SPEND_CEILING_USD_219 && SPEND_CEILING_USD_219 === 0.28
    && MAX_VERIFIER_CALLS_219 === 5);

console.log('\n---- F. DISPOSITION CONSISTENCY, STATED BEFORE EXECUTION ----');
ok('F1. INVALID may not survive as VERIFIED_AS_IS, NO_CLARIFICATION_REQUIRED or clarification-only',
  DISPOSITION_CONSISTENCY_219.INVALID.mayNotSurviveAs.length === 3
    && DISPOSITION_CONSISTENCY_219.INVALID.aGoodClarificationMayNotRescueIt === true);
ok('F2. the §218 layer deterministically refuses INVALID + VERIFIED_AS_IS',
  (() => {
    const r = checkPropertyReview218({
      scope: { targetDeclarationId: 'A1-D1', targetFactKey: 'FP:k' },
      output: {
        propertyReview: {
          targetDeclarationId: 'A1-D1', propertySemanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
          propertyValidity: 'INVALID', decisionControllingProperty: 'the underlying condition',
          propertyReviewReason: 'the named property is the test, not the condition',
        },
        verdict: 'VERIFIED_AS_IS',
        owedFactDeclarations: [{
          factKey: 'FP:k', declaration: 'CHALLENGE_FACT_VALIDITY',
          challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
          propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
        }],
      },
    });
    return !r.admitted && r.codes.includes('INVALID_PROPERTY_VERIFIED_AS_IS')
      && r.route === 'FAIL_CLOSED';
  })());
ok('F3. the §218 layer deterministically refuses a good clarification rescuing an INVALID property',
  (() => {
    const r = checkPropertyReview218({
      scope: { targetDeclarationId: 'A2-D1', targetFactKey: 'FP:k' },
      output: {
        propertyReview: {
          targetDeclarationId: 'A2-D1', propertySemanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
          propertyValidity: 'INVALID', decisionControllingProperty: 'the underlying condition',
          propertyReviewReason: 'the certificate records a finding about the plant',
        },
        verdict: 'ADD_OR_REPLACE_CLARIFICATION',
        owedFactDeclarations: [{
          factKey: 'FP:k', declaration: 'CHALLENGE_FACT_VALIDITY',
          challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
          propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
        }],
      },
    });
    return !r.admitted && r.codes.includes('INVALID_PROPERTY_ROUTED_TO_CLARIFICATION');
  })());
ok('F4. UNCERTAIN may not become ordinary acceptance',
  DISPOSITION_CONSISTENCY_219.UNCERTAIN.requiresVerdict === 'ABSTAIN'
    && DISPOSITION_CONSISTENCY_219.UNCERTAIN.mayNotBecome === 'ORDINARY_ACCEPTANCE'
    && (() => {
      const r = checkPropertyReview218({
        scope: { targetDeclarationId: 'A5-D1', targetFactKey: 'FP:k' },
        output: {
          propertyReview: {
            targetDeclarationId: 'A5-D1', propertySemanticRole: 'AMBIGUOUS_OR_UNRESOLVED',
            propertyValidity: 'UNCERTAIN', decisionControllingProperty: 'cannot be placed',
            propertyReviewReason: 'the role cannot be determined from what was supplied',
          },
          verdict: 'VERIFIED_AS_IS',
          owedFactDeclarations: [{ factKey: 'FP:k', declaration: 'STILL_UNRESOLVED' }],
        },
      });
      return !r.admitted && r.codes.includes('UNCERTAIN_PROPERTY_NOT_ABSTAINED');
    })());
ok('F5. VALID does not itself guarantee VERIFIED_AS_IS',
  DISPOSITION_CONSISTENCY_219.VALID.guaranteesVerifiedAsIs === false
    && (() => {
      const r = checkPropertyReview218({
        scope: { targetDeclarationId: 'A5-D1', targetFactKey: 'FP:k' },
        output: {
          propertyReview: {
            targetDeclarationId: 'A5-D1', propertySemanticRole: 'UNDERLYING_SAFETY_STATE',
            propertyValidity: 'VALID', decisionControllingProperty: 'the wall\'s capacity',
            propertyReviewReason: 'the supplied property is the condition itself',
          },
          verdict: 'ADD_OR_REPLACE_CLARIFICATION',
          owedFactDeclarations: [{ factKey: 'FP:k', declaration: 'BOUND_BY_CLARIFICATION' }],
        },
      });
      return r.admitted && r.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED';
    })(),
  'a VALID property reaching a clarification route is admitted, not failed');
ok('F6. decisionControllingProperty is scored semantically, never promoted and never settled',
  DECISION_CONTROLLING_PROPERTY_SCORING_219.requiresWordingIdentity === false
    && DECISION_CONTROLLING_PROPERTY_SCORING_219.isPromotedToACanonicalOwedFact === false
    && DECISION_CONTROLLING_PROPERTY_SCORING_219.isSettled === false
    && DECISION_CONTROLLING_PROPERTY_SCORING_219.isParsedForMeaningByDeterministicCode === false
    && DECISION_CONTROLLING_PROPERTY_SCORING_219.adjudicatedBy
      === 'HUMAN_READING_AGAINST_THE_FROZEN_TRUTH');

console.log('\n---- G. THE FROZEN SCORER, RUN AGAINST SYNTHETIC OUTPUTS ----');
const key = (id: string) => built(id).factKey;
const decl = (id: string) => built(id).declarationId;
const review = (id: string, role: string, validity: string, target?: string) => ({
  targetDeclarationId: target ?? decl(id),
  propertySemanticRole: role,
  propertyValidity: validity,
  decisionControllingProperty: 'the underlying condition the decision turns on',
  propertyReviewReason: 'a reason a reviewer can act on',
});
const challengeOut = (id: string) => ({
  verdict: 'ABSTAIN',
  rationale: 'r',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{
    factKey: key(id), declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: 'the named property '
      + 'is evidence for a different condition',
    challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
    propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE', representationConcern: 'NONE',
  }],
  propertyReview: review(id, 'EVIDENCE_FOR_ANOTHER_PROPERTY', 'INVALID'),
});
const acceptOut = (id: string, role: string) => ({
  verdict: 'VERIFIED_AS_IS',
  rationale: 'r',
  clarificationSourceMode: null,
  proposedClarification: null,
  bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{
    factKey: key(id), declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
    propertyMismatchKind: null, representationConcern: 'NONE',
  }],
  propertyReview: review(id, role, 'VALID'),
});
const call = (id: string, parsed: Record<string, unknown> | null,
  reached = true, failureClass = 'NO_FAILURE') => ({
  caseId: id, declarationId: decl(id), targetFactKey: key(id),
  reachedInference: reached, failureClass, parsed,
});

const perfect = [
  scoreCall219(call('A1', challengeOut('A1'))),
  scoreCall219(call('A2', challengeOut('A2'))),
  scoreCall219(call('A3', acceptOut('A3', 'REQUIRED_ACT_ITSELF'))),
  scoreCall219(call('A4', acceptOut('A4', 'REQUIRED_ARTIFACT_ITSELF'))),
  scoreCall219(call('A5', acceptOut('A5', 'UNDERLYING_SAFETY_STATE'))),
];
ok('G1. a fully correct set produces zero gate occurrences',
  Object.keys(gateOccurrenceCounts219(perfect)).length === 0,
  JSON.stringify(gateOccurrenceCounts219(perfect)));
ok('G2. a fully correct set is machine-correct only where nothing is left for a human to read',
  perfect[0].machineVerdict === 'PENDING' && perfect[1].machineVerdict === 'PENDING'
    && perfect[2].machineVerdict === 'CORRECT' && perfect[3].machineVerdict === 'CORRECT'
    && perfect[4].machineVerdict === 'PENDING'
    && perfect[0].pendingHumanAdjudication.join() === 'HG6,HG9'
    && perfect[1].pendingHumanAdjudication.join() === 'HG6,HG9'
    && perfect[4].pendingHumanAdjudication.join() === 'HG9'
    && perfect.every(s => !s.machineVerdict.startsWith('INCORRECT')),
  'HG6 and HG9 are never machine-decided; A1, A2 and A5 always await a human read');
ok('G3. every deterministic layer admits the fully correct set',
  perfect.every(s => s.deterministic.admitted && s.deterministic.propertyReviewCodes.length === 0));

const section217Replay = [
  scoreCall219(call('A1', acceptOut('A1', 'REQUIRED_ACT_ITSELF'))),
  scoreCall219(call('A2', acceptOut('A2', 'REQUIRED_ARTIFACT_ITSELF'))),
];
ok('G4. the §217 K1 failure shape trips HG1 and HG2 on A1',
  section217Replay[0].gateOccurrences.map(g => g.gate).join() === 'HG1,HG2'
    && section217Replay[0].machineVerdict === 'INCORRECT');
ok('G5. treating the A2 certificate as a substantive requirement trips HG1 and HG2',
  section217Replay[1].gateOccurrences.map(g => g.gate).join() === 'HG1,HG2'
    && section217Replay[1].axes.roleCorrect === 'INCORRECT');

const overcorrected = [
  scoreCall219(call('A3', { ...challengeOut('A3'), propertyReview: review('A3',
    'EVIDENCE_FOR_ANOTHER_PROPERTY', 'INVALID') })),
  scoreCall219(call('A4', { ...challengeOut('A4'), propertyReview: review('A4',
    'EVIDENCE_FOR_ANOTHER_PROPERTY', 'INVALID') })),
  scoreCall219(call('A5', { ...challengeOut('A5'), propertyReview: review('A5',
    'EVIDENCE_FOR_ANOTHER_PROPERTY', 'INVALID') })),
];
ok('G6. a challenge-everything verifier trips HG3, HG4 and HG5',
  overcorrected[0].gateOccurrences.some(g => g.gate === 'HG3')
    && overcorrected[1].gateOccurrences.some(g => g.gate === 'HG4')
    && overcorrected[2].gateOccurrences.some(g => g.gate === 'HG5')
    && overcorrected.every(s => s.machineVerdict === 'INCORRECT'));

const foreign = { ...acceptOut('A5', 'UNDERLYING_SAFETY_STATE'),
  propertyReview: review('A5', 'UNDERLYING_SAFETY_STATE', 'VALID', 'A5-SOMETHING-ELSE') };
ok('G7. a target identity violation trips HG7',
  scoreCall219(call('A5', foreign)).gateOccurrences.some(g => g.gate === 'HG7'));

const nominated = { ...acceptOut('A5', 'UNDERLYING_SAFETY_STATE'),
  nominatedFact: { anything: 'a sibling' }, clarificationSourceMode: 'NOMINATED_FACT' };
ok('G8. a structured sibling nomination trips HG8 and is deterministically contained',
  (() => {
    const s = scoreCall219(call('A5', nominated));
    return s.gateOccurrences.some(g => g.gate === 'HG8')
      && s.gateOccurrences.filter(g => g.gate === 'HG8').every(g => g.containedByDeterministicLayer)
      && s.deterministic.targetRemainsUnresolved;
  })());

const settling = { ...acceptOut('A4', 'REQUIRED_ARTIFACT_ITSELF'),
  owedFactDeclarations: [{ factKey: key('A4'), declaration: 'STILL_UNRESOLVED',
    challengeReason: null, challengeGround: null, propertyMismatchKind: null,
    representationConcern: 'NONE', settled: true }] };
ok('G9. a settlement attempt trips HG10',
  scoreCall219(call('A4', settling)).gateOccurrences.some(g => g.gate === 'HG10'));

const structural = scoreCall219(call('A1', null, false, 'TRANSPORT_STRUCTURAL'));
ok('G10. a structural failure is NOT_EXERCISED on every semantic axis and trips no gate',
  structural.machineVerdict === 'NOT_EXERCISED'
    && structural.gateOccurrences.length === 0
    && Object.values(structural.axes).every(a => a === 'NOT_EXERCISED'),
  'STRUCTURAL_IS_NOT_SEMANTIC, run rather than asserted');

ok('G11. the scorer produces no aggregate percentage and never repairs a classification',
  (() => {
    const e = scoringEffect219();
    return e.producesAnAggregatePercentage === false && e.offsetsOneGateWithAnother === false
      && e.readsDecisionControllingPropertyForMeaning === false
      && e.readsRationaleForMeaning === false && e.repairsAModelClassification === false
      && e.scoresAStructuralFailureAsSemantic === false && e.modifiesTheParsedOutput === false;
  })());
ok('G12. the scorer never mutates the output it is given',
  (() => {
    const out = challengeOut('A1');
    const before = JSON.stringify(out);
    scoreCall219(call('A1', out));
    return JSON.stringify(out) === before;
  })());

console.log('\n---- H. HG11 — THE DETERMINISTIC LAYER INVENTS NOTHING ----');
ok('H1. the §218 consistency layer still declares that it invents and repairs nothing',
  (() => {
    const e = consistencyEffect218();
    return e.providerCalls === 0 && e.databaseOperations === 0
      && e.infersWhetherSomethingIsEvidence === false && e.inspectsVocabularyToClassify === false
      && e.reconstructsThePropertyFromProse === false && e.repairsAModelClassification === false
      && e.inventsAReplacementOwedFact === false && e.readsAnyFieldForMeaning === false
      && e.usesAKeywordList === false && e.addsAVerdict === false
      && e.addsAChallengeGround === false;
  })());
ok('H2. the §218 consistency surface is still eleven membership/equality/presence inputs',
  CONSISTENCY_DECISION_INPUTS_218.length === 11);
ok('H3. neither the §219 instrument nor the §219 scorer imports a fact constructor or projection',
  (() => {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const files = [
      'lib/expert-219-structured-confirmation-instrument.ts',
      'lib/expert-219-scoring.ts',
    ];
    const forbidden = ['expert-210j-declaration-projection', 'expert-first-pass-owed-fact-projection',
      'expert-212-verifier-payload', 'attachOwedProperty', 'buildOwedFact'];
    return files.every(f => {
      const imports = fs.readFileSync(path.join(__dirname, f), 'utf8')
        .split('\n').filter(l => l.trimStart().startsWith('import') || l.includes("from '."));
      return forbidden.every(t => !imports.join('\n').includes(t));
    });
  })(),
  'the scorer names settlement FIELDS in order to refuse them; it constructs and settles nothing');
ok('H4. the §219 assembly imports the §218 prompt and schema and modifies neither',
  (() => {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const src = fs.readFileSync(path.join(__dirname, 'lib/expert-219-assembly.ts'), 'utf8');
    return src.includes('EXPERT_VERIFIER_218_SYSTEM_PROMPT')
      && src.includes('VERIFIER_218_RESPONSE_SCHEMA')
      && !src.includes('PROPERTY_REVIEW_BLOCK_218')
      && !src.includes('buildVerifier218ResponseSchema');
  })());

console.log('\n---- I. VERSIONS ----');
ok('I1. every §219 module carries a version identity',
  STRUCTURED_CONFIRMATION_INSTRUMENT_219_VERSION.startsWith('hazlenz.expert.219.')
    && SCORING_219_VERSION.startsWith('hazlenz.expert.219.'));

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} assertions`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
if (failed > 0) process.exit(1);
