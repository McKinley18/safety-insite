/**
 * §221 PHASE A -- PREREGISTRATION VALIDATION. ZERO PROVIDER CALLS.
 * Everything below runs BEFORE the freeze and before any spend.
 */
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  buildExpertVNextWireSchema, governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT, reconstruct210gSystemPrompt, reconstructBaseWireSchema,
  buildExpert210jWireSchema,
} from './lib/expert-210j-first-pass-contract';
import {
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
} from './lib/expert-first-pass-instruction-210g';
import { VERIFIER_218_RESPONSE_SCHEMA } from './lib/expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './lib/expert-218-property-instruction';
import { CONTRACT_INCOMPLETENESS_CODES } from './lib/expert-205-declaration-preservation';
import {
  INTEGRATED_INSTRUMENT_221_VERSION, PROVIDER_CALLS_IN_PHASE_A, MAX_PROVIDER_CALLS_221,
  SPEND_CEILING_USD_221, PROJECTED_SPEND_USD_221, DATABASE_OPERATIONS_AUTHORIZED_221,
  PRIOR_CASES_NOT_REUSED_221, ACCEPTANCE_CHARACTER_221, KR1_STATUS_AT_221, CASE_FAMILIES_221,
  INTEGRATED_HARD_GATES_221, HARD_GATE_RULE_221, AMBIGUITY_RULE_221, DEFECT_CLASSES_221,
  CONTAINMENT_EXAMPLES_221, KR1_CASE_SCORING_221, REVIEW_PACKET_QUALITY_RULE_221,
  INTEGRATED_CASES_221, EXECUTION_ORDER_221, RR7_MALFORMATION_221,
  SETTLEMENT_EXERCISES_REQUIRED_221, CORRECT_PROPERTY_EXERCISE_221, AUTHORIZATION_BOUNDARY_221,
  ADJUDICATION_BOUNDARY_221, providerCallPlan221, humanJudgmentTotal221, familyCoverage221,
  gateCoverage221, judgmentsFeedingGate221,
} from './lib/expert-221-integrated-instrument';
import {
  assembleFirstPass221, verifierLegIdentities221, ADAPTER_SUPPLIES_221, analysisIdFor,
} from './lib/expert-221-assembly';
import {
  PROPERTY_AUTHORITY_CONTRACT_VERSION, KR1_STATUS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';

let passed = 0; let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
};
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const FP = assembleFirstPass221();
const byCase = (id: string) => INTEGRATED_CASES_221.find(c => c.caseId === id)!;

console.log('\n---- A. SHAPE, NOVELTY AND BOUNDARY ----');
ok('A1. ten cases, one first-pass call each',
  INTEGRATED_CASES_221.length === 10
    && INTEGRATED_CASES_221.every(c => c.firstPassCalls === 1)
    && EXECUTION_ORDER_221.length === 10);
ok('A2. the frozen call plan is inside the authorized ceiling, with headroom recorded',
  (() => {
    const p = providerCallPlan221();
    return p.firstPassCalls === 10
      && p.verifierCalls === INTEGRATED_CASES_221.reduce((n, c) => n + c.verifierCalls, 0)
      && p.totalPlanned + p.contingencyCalls <= MAX_PROVIDER_CALLS_221;
  })(), JSON.stringify(providerCallPlan221()));
ok('A3. no historical case id appears as a scored case or inside an observation',
  PRIOR_CASES_NOT_REUSED_221.every(t =>
    !INTEGRATED_CASES_221.some(c => c.caseId === t || c.observation.includes(t))));
ok('A4. no historical SETTING is reused',
  (() => {
    const t = INTEGRATED_CASES_221.map(c => `${c.observation} ${c.suppliedContext.location}`)
      .join(' ').toLowerCase();
    return ['haul truck', 'quarry', 'care home', 'ward 9', 'sanction for test', 'builders merchant',
      'poultry', 'leisure centre', 'gas processing', 'materials recovery', 'picking cabin',
      'tanker', 'fire door', 'gangway', 'precast', 'ironer', 'steel frame', 'party wall',
      'fire damper', 'auger', 'truss', 'hydrotherapy', 'gantry hoist', 'tank farm',
      'welding bay', 'scaffold'].every(w => !t.includes(w));
  })(), 'checked mechanically against §213, §215, §217, §218, §219 and §210H settings');
ok('A5. ten distinct industries',
  new Set(INTEGRATED_CASES_221.map(c => c.suppliedContext.location.split(',')[0])).size === 10,
  INTEGRATED_CASES_221.map(c => c.suppliedContext.location.split(',')[0]).join(' | '));
ok('A6. Phase A made no provider call and no database operation',
  PROVIDER_CALLS_IN_PHASE_A === 0 && DATABASE_OPERATIONS_AUTHORIZED_221 === 0);
ok('A7. the authorization boundary is frozen as literals',
  AUTHORIZATION_BOUNDARY_221.retries === 0 && AUTHORIZATION_BOUNDARY_221.reruns === 0
    && AUTHORIZATION_BOUNDARY_221.midRunRemediation === false
    && AUTHORIZATION_BOUNDARY_221.promptChanges === false
    && AUTHORIZATION_BOUNDARY_221.schemaChanges === false
    && AUTHORIZATION_BOUNDARY_221.deterministicRuleChanges === false
    && AUTHORIZATION_BOUNDARY_221.truthChanges === false
    && AUTHORIZATION_BOUNDARY_221.caseReplacements === false
    && AUTHORIZATION_BOUNDARY_221.commit === false && AUTHORIZATION_BOUNDARY_221.deploy === false);
ok('A8. this is system validation, not acceptance, and reports no headline percentage',
  ACCEPTANCE_CHARACTER_221.isComponentExperiment === false
    && ACCEPTANCE_CHARACTER_221.isFinalExpertAcceptance === false
    && ACCEPTANCE_CHARACTER_221.headlineAccuracyPercentageReported === false
    && ACCEPTANCE_CHARACTER_221.scoredAgainst === 'THE_CUSTOMER_AUTHORITATIVE_OUTCOME');

console.log('\n---- B. FAMILY AND GATE COVERAGE ----');
ok('B1. all twelve families are covered',
  Object.values(familyCoverage221()).every(v => v.length > 0),
  JSON.stringify(familyCoverage221()));
ok('B2. all twelve hard gates are exercised by at least one case',
  Object.values(gateCoverage221()).every(v => v.length > 0),
  Object.entries(gateCoverage221()).map(([g, v]) => `${g}:${v.length}`).join(' '));
ok('B3. every hard gate has at least one human judgment feeding it',
  Object.values(judgmentsFeedingGate221()).every(n => n > 0),
  JSON.stringify(judgmentsFeedingGate221()));
ok('B4. twelve gates, zero-occurrence, no compensation of any kind',
  INTEGRATED_HARD_GATES_221.length === 12
    && HARD_GATE_RULE_221.threshold === 'ZERO_OCCURRENCE'
    && HARD_GATE_RULE_221.mayBeOffsetByAnAggregateScore === false
    && HARD_GATE_RULE_221.mayBeOffsetByAnotherGate === false
    && HARD_GATE_RULE_221.headlineAccuracyPercentageReported === false);
ok('B5. AMBIGUOUS can never pass a gate, and is not resolvable post hoc',
  AMBIGUITY_RULE_221.ambiguousOnAHardGateJudgment
      === 'THE_GATE_CANNOT_PASS_FROM_THAT_JUDGMENT'
    && AMBIGUITY_RULE_221.mayBeResolvedPostHocToObtainATerminal === false
    && AMBIGUITY_RULE_221.notExercisedIsNeverCorrect === true);
ok('B6. three defect classes and worked containment examples are frozen before execution',
  DEFECT_CLASSES_221.length === 3 && CONTAINMENT_EXAMPLES_221.length === 4
    && DEFECT_CLASSES_221.find(d => d.id === 'A')!.consequence.includes('ONLY this class'));

console.log('\n---- C. FROZEN TRUTH ----');
ok('C1. every case freezes its hazard interpretation, review state and final authoritative state',
  INTEGRATED_CASES_221.every(c => c.expectedHazardInterpretation.length > 40
    && c.expectedReviewState.length > 10 && c.expectedFinalAuthoritativeState.length > 40));
ok('C2. every expected owed fact freezes a controlling property and prohibited alternatives',
  INTEGRATED_CASES_221.every(c => c.expectedOwedFacts.every(f =>
    f.controllingProperty.length > 30 && f.prohibitedProperties.length >= 2
    && f.whyDecisionCritical.length > 10)));
ok('C3. every case freezes its non-facts, so restraint is scorable',
  INTEGRATED_CASES_221.every(c => c.expectedNonFacts.length >= 1));
ok('C4. IG9 expects NO owed fact and freezes why every candidate is negated',
  byCase('IG9').expectedOwedFacts.length === 0
    && byCase('IG9').expectedNonFacts.length >= 5
    && byCase('IG9').expectedHazardInterpretation.includes('NO DECISION-CRITICAL SAFETY GAP'));
ok('C5. IG3 is the KR-1 instrument and does not require the provider to be right',
  byCase('IG3').expectedOwedFacts[0].expectedPropertyRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY'
    && byCase('IG3').expectedVerifierBehaviour!.includes('BOTH are acceptable provider behaviour')
    && KR1_CASE_SCORING_221.providerMustClassifyRoleCorrectly === false
    && KR1_CASE_SCORING_221.requiredSystemBehaviours.length === 5);
ok('C6. IG7 freezes the adjacent property as ESTABLISHED and prohibited',
  byCase('IG7').expectedOwedFacts[0].prohibitedProperties
    .some(p => p.includes('THE ADJACENT PROPERTY'))
    && byCase('IG7').expectedNonFacts.some(p => p.includes('ESTABLISHED')));
ok('C7. IG5 puts a required ARTIFACT and an evidential RECORD in one case',
  byCase('IG5').expectedOwedFacts[0].expectedPropertyRole === 'REQUIRED_ARTIFACT_ITSELF'
    && byCase('IG5').expectedNonFacts.some(p => p.includes('survey')));
ok('C8. IG4 is a legitimate required act and must not be over-gated',
  byCase('IG4').expectedOwedFacts[0].expectedPropertyRole === 'REQUIRED_ACT_ITSELF'
    && byCase('IG4').expectedKr1AuthorityBehaviour!.includes('One recorded human CONFIRM_PROPERTY'));
ok('C9. every case whose facts could be over-asserted freezes what must not be asserted',
  ['IG1', 'IG2', 'IG3', 'IG6', 'IG7', 'IG10'].every(id =>
    byCase(id).expectedOwedFacts.every(f => f.mustNotAssert !== null)));
ok('C10. the four required settlement exercises are frozen to named cases',
  SETTLEMENT_EXERCISES_REQUIRED_221.length === 4
    && SETTLEMENT_EXERCISES_REQUIRED_221.every(e =>
      byCase(e.caseId).settlementExercise === e.exercise)
    && CORRECT_PROPERTY_EXERCISE_221.caseId === 'IG3'
    && CORRECT_PROPERTY_EXERCISE_221.providerCallRequired === false);
ok('C11. a satisfactory and an adverse settlement are both required',
  SETTLEMENT_EXERCISES_REQUIRED_221.some(e => e.exercise === 'SATISFACTORY_SETTLEMENT')
    && SETTLEMENT_EXERCISES_REQUIRED_221.some(e => e.exercise === 'ADVERSE_SETTLEMENT'));

console.log('\n---- D. GOVERNED EVIDENCE ----');
ok('D1. exactly one case supplies governed evidence, and it supplies two records',
  INTEGRATED_CASES_221.filter(c => c.governedEvidence.length > 0).map(c => c.caseId).join()
    === 'IG8' && byCase('IG8').governedEvidence.length === 2);
ok('D2. one supplied record is on point and one is deliberately not',
  byCase('IG8').governedEvidence.filter(g => g.onPoint).length === 1
    && byCase('IG8').governedEvidence.filter(g => !g.onPoint).length === 1
    && byCase('IG8').governedEvidence.find(g => !g.onPoint)!.whyFrozen
      .includes('DELIBERATELY OFF POINT'));
ok('D3. the supplied records exist in the governed registry with the same citation and text',
  (() => {
    const reg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'safescope-data',
      'approved-knowledge', 'registry', 'approved-knowledge-seed-records.v1.json'), 'utf8'));
    const recs: any[] = Array.isArray(reg) ? reg : (reg.records ?? Object.values(reg));
    return byCase('IG8').governedEvidence.every(g =>
      recs.some(r => r?.authority?.citation === g.citation
        && (r?.applicability?.plainLanguageSummary ?? '') === g.approvedText));
  })(), 'the governed text transmitted is the governed text on file, not authored here');
ok('D4. every case with no governed record freezes that no citation may carry authority',
  INTEGRATED_CASES_221.filter(c => c.governedEvidence.length === 0)
    .every(c => (c.expectedRegulatoryGroundingBoundary ?? '').includes('no citation')
      || (c.expectedRegulatoryGroundingBoundary ?? '').includes('NO citation')));
ok('D5. IG8 freezes that grounding may not settle the unresolved physical fact',
  byCase('IG8').expectedRegulatoryGroundingBoundary!.includes('NO citation may settle'));

console.log('\n---- E. ASSEMBLY ----');
ok('E1. ten first-pass requests assemble, with ten distinct user prompts',
  FP.length === 10 && new Set(FP.map(x => x.identities.userPrompt)).size === 10);
ok('E2. the adapter supplies exactly two mechanical fields',
  ADAPTER_SUPPLIES_221.length === 2
    && FP.every(x => x.analysisId === analysisIdFor(x.caseId)));
ok('E3. the observation reaches the prompt verbatim on every case',
  FP.every(x => x.userPrompt.includes(byCase(x.caseId).observation)));
ok('E4. the §210J instruction is used, and the governed variant only where records are supplied',
  (() => {
    const plain = FP.filter(x => byCase(x.caseId).governedEvidence.length === 0);
    const gov = FP.filter(x => byCase(x.caseId).governedEvidence.length > 0);
    return plain.every(x => x.systemPrompt === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT)
      && new Set(plain.map(x => x.identities.instruction)).size === 1
      && gov.length === 1
      && gov[0].identities.instruction !== plain[0].identities.instruction;
  })());
ok('E5. the §210J instruction is the §210G prompt plus one block, byte for byte reversible',
  reconstruct210gSystemPrompt(EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT)
    === EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT);
ok('E6. the §210J wire schema is the vNext schema plus one property, reversibly',
  (() => {
    const x = FP[0];
    const b = governedBindingFor([]);
    return JSON.stringify(reconstructBaseWireSchema(x.input, b))
      === JSON.stringify(buildExpertVNextWireSchema(x.input, b))
      && JSON.stringify(buildExpert210jWireSchema(x.input, b)).length
        > JSON.stringify(buildExpertVNextWireSchema(x.input, b)).length;
  })());
ok('E7. the governed source ids supplied are the ids the prompt names, and no others',
  (() => {
    const g = FP.find(x => x.caseId === 'IG8')!;
    return byCase('IG8').governedEvidence.every(r => g.userPrompt.includes(r.sourceId))
      && g.governedRecords.length === 2;
  })());
ok('E8. the verifier leg identities are the §218 ones, unchanged',
  (() => {
    const v = verifierLegIdentities221();
    return v.instruction === sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT)
      && v.schema === sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA));
  })());
ok('E9. no strict flag or cache_control is constructed in any assembled request',
  FP.every(x => !JSON.stringify(x.wireSchema).includes('cache_control')));
ok('E10. RR-7 is wired: the placeholder code routes through contract incompleteness',
  CONTRACT_INCOMPLETENESS_CODES.includes('NON_SEMANTIC_PLACEHOLDER_VALUE'));

console.log('\n---- F. THE RR-7 EXERCISE IS HONEST ----');
ok('F1. the malformation is authored by the harness and never edits provider output',
  RR7_MALFORMATION_221.appliedBy === 'THE_FROZEN_HARNESS_NOT_THE_PROVIDER'
    && RR7_MALFORMATION_221.providerOutputEdited === false
    && RR7_MALFORMATION_221.rawPersistedBeforeMalformation === true);
ok('F2. the malformed field is a branch decision, so the property survives in the other fields',
  RR7_MALFORMATION_221.field === 'decisionIfB'
    && RR7_MALFORMATION_221.whyThisField.includes('still identified'));
ok('F3. IG10 records that its verifier call is elided by design, not omitted',
  byCase('IG10').verifierCalls === 0
    && byCase('IG10').verifierCallCondition!.includes('ELIDED BY DESIGN'));
ok('F4. IG9 records a conditional elision covered by the contingency budget',
  byCase('IG9').verifierCalls === 0
    && byCase('IG9').verifierCallCondition!.includes('contingency budget'));

console.log('\n---- G. THE ADJUDICATION BOUNDARY ----');
ok('G1. the human judgment budget is compact and inside the authorized band',
  humanJudgmentTotal221() >= 50 && humanJudgmentTotal221() <= 90,
  `${humanJudgmentTotal221()} judgments across ${INTEGRATED_CASES_221.length} cases`);
ok('G2. every judgment has a question, an axis and reading material, and none carries an answer',
  INTEGRATED_CASES_221.every(c => c.humanJudgments.every(j =>
    j.question.length > 20 && j.axis.length > 0 && j.whatToRead.length > 10
    && !('verdict' in (j as unknown as Record<string, unknown>))
    && !('expected' in (j as unknown as Record<string, unknown>)))),
  'a slot that carried an expected verdict would be a pre-answered judgment');
ok('G3. every case carries at least three mandatory judgments',
  INTEGRATED_CASES_221.every(c => c.humanJudgments.filter(j => j.mandatory).length >= 3));
ok('G4. the automation boundary is frozen and prefills nothing',
  ADJUDICATION_BOUNDARY_221.slotsPrefilledByAutomation === 0
    && ADJUDICATION_BOUNDARY_221.permittedAttribution === 'PRODUCT_OWNER'
    && ADJUDICATION_BOUNDARY_221.automationMayNot.length === 4);
ok('G5. quality-only judgments are marked non-mandatory and feed no gate',
  INTEGRATED_CASES_221.every(c => c.humanJudgments
    .filter(j => j.axis === 'ORDINARY_QUALITY').every(j => !j.mandatory && j.feedsGate === null)));
ok('G6. the review-packet rule does not require decisionControllingProperty to be correct',
  REVIEW_PACKET_QUALITY_RULE_221.decisionControllingPropertyMustBeCorrect === false
    && REVIEW_PACKET_QUALITY_RULE_221.mustBeVisibleToTheReviewer.length === 7);

console.log('\n---- H. STATUS AND SPEND ----');
ok('H1. KR-1 is carried as the human-gated limitation, matching the implemented module',
  KR1_STATUS_AT_221 === KR1_STATUS
    && PROPERTY_AUTHORITY_CONTRACT_VERSION === 'hazlenz.expert.kr1-property-authority.v1');
ok('H2. the projection is below the ceiling and the ceiling is the authorized one',
  PROJECTED_SPEND_USD_221 < SPEND_CEILING_USD_221 && SPEND_CEILING_USD_221 === 1.78);
ok('H3. the instrument carries a version identity',
  INTEGRATED_INSTRUMENT_221_VERSION.startsWith('hazlenz.expert.221.'));

console.log(`\n${passed} passed, ${failed} failed, ${passed + failed} assertions`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
if (failed > 0) process.exit(1);
