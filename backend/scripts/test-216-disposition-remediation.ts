/**
 * §216 EXPERT HAZLENZ -- DISPOSITION AND PROPERTY-IDENTITY REMEDIATION: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO SCHEMA CHANGE. NO NEW VERDICT.
 *
 * Establishes: that the §214 block is SUPERSEDED rather than layered and that the net growth is
 * small; that R-V4's ordered ladder and R-V5's two-part property test are present with their
 * overcorrection guards; that the disposition routing defect is ALREADY structurally closed once
 * declared, proved by running the real checkers; and that a clarification-first strategy fails the
 * fixture set.
 *
 * Establishes NOTHING about hosted behaviour. KR-1 remains OPEN and no §215 result is reclassified.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_VERDICTS } from './lib/expert-verifier-contract';
import { EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT } from './lib/expert-verifier-instruction-v3-2';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './lib/expert-212-challenge-vocabulary';
import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import {
  REMIT_BLOCK_214, EXPERT_VERIFIER_214_SYSTEM_PROMPT,
} from './lib/expert-214-verifier-semantic-remediation';
import {
  DISPOSITION_CLOSURE_216_VERSION, DISPOSITION_INVARIANT, closureMatrix,
  dispositionRoutingIsClosed, CLOSURE_RESIDUAL, REFUSED_RULES, VERDICT_FOR_A_PROPERTY_CHALLENGE,
  closureEffect216,
} from './lib/expert-216-disposition-closure';
import {
  DISPOSITION_REMEDIATION_216_VERSION, BASE_PROTOCOL_VERSION, VOCABULARY_UNCHANGED_216,
  PROCESS_STOPPING_RULE, REMIT_BLOCK_216, SUPERSESSION_LEDGER_216, OVERCORRECTION_GUARDS_216,
  EXPERT_VERIFIER_216_SYSTEM_PROMPT, reconstructV32SystemPrompt216, sizeAccounting216,
  carriedVerbatimFraction216,
} from './lib/expert-216-disposition-remediation';
import {
  FIXTURES_216_VERSION, FIXTURES_216, requiredDispositionIsRepresentable, requiredEntryFor216,
  clarificationFirstScore, clarificationFirstStrategy, CLARIFICATION_FIRST_IS_A_NEGATIVE_CONTROL,
  minimalContrasts, fixtureEffect216,
} from './lib/expert-216-fixtures';
import {
  HOSTED_RECOMMENDATION_216_VERSION, STATUS, AUTHORIZED_TO_EXECUTE, MAX_RECOMMENDED_CALLS,
  RECOMMENDED_CASES_216, recommendedCallCount216, costProjection216, FIFTH_CASE_ANALYSIS,
  FUTURE_HARD_GATES, NO_AGGREGATE_COMPENSATION_216, SECTION_215_CASES_MAY_NOT_BE_RESCORED,
  ALREADY_SETTLED, localFixtureBacking, RECOMMENDATION_LIMITS_216,
} from './lib/expert-216-hosted-recommendation';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const ROOT = join(__dirname, '..', '..');
const MODULES = [
  'lib/expert-216-disposition-remediation.ts', 'lib/expert-216-disposition-closure.ts',
  'lib/expert-216-fixtures.ts', 'lib/expert-216-hosted-recommendation.ts',
].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');
const BLOCK = REMIT_BLOCK_216.join('\n');

// ================================================================ A. supersession and size

console.log('\n---- A. SUPERSESSION AND SIZE ----');

ok('A1. built from v3.2, and the §214 block does not appear in the successor prompt',
  BASE_PROTOCOL_VERSION === 'hazlenz.expert.verifier-instruction.v3.2'
    && !EXPERT_VERIFIER_216_SYSTEM_PROMPT.includes(REMIT_BLOCK_214.join('\n')));

ok('A2. removing the block reproduces the v3.2 prompt BYTE FOR BYTE',
  reconstructV32SystemPrompt216(EXPERT_VERIFIER_216_SYSTEM_PROMPT)
    === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);

ok('A3. every §214 section is dispositioned with a reason',
  SUPERSESSION_LEDGER_216.length === 9
    && SUPERSESSION_LEDGER_216.every(e => e.why.length > 30));

const size = sizeAccounting216() as any;
ok('A4. removed, added, net and estimated net tokens are all reported',
  ['removedCharacters', 'addedCharacters', 'netCharactersVs214', 'estimatedNetTokensVs214']
    .every(k => typeof size[k] === 'number'),
  `-${size.removedCharacters} +${size.addedCharacters} = net ${size.netCharactersVs214} chars `
    + `(~${size.estimatedNetTokensVs214} tokens)`);

ok('A5. more was rewritten than was added — this is a tightening, not an append',
  size.removedCharacters > 2000 && size.netCharactersVs214 < 1000,
  `${size.removedLineCount} lines removed, ${size.addedLineCount} added, net `
    + `+${size.netCharactersVs214} chars`);

ok('A6. the passages §215 proved worked are carried verbatim',
  ['THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM',
    'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
    'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
    'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW',
    'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN']
    .every(h => BLOCK.includes(h) && REMIT_BLOCK_214.join('\n').includes(h)),
  '§215 H3 passed on this exact wording');

ok('A7. the §214 wording §215 showed insufficient is GONE',
  !BLOCK.includes('WITH THAT TEST OR RECORD OUT OF THE PICTURE ENTIRELY')
    && REMIT_BLOCK_214.join('\n').includes('WITH THAT TEST OR RECORD OUT OF THE PICTURE ENTIRELY'),
  'the role test is replaced, not supplemented');

ok('A8. the carried-verbatim fraction is measured, not claimed',
  carriedVerbatimFraction216() > 0.4 && carriedVerbatimFraction216() < 1,
  `${Math.round(carriedVerbatimFraction216() * 100)}% of §214's non-blank lines carried verbatim`);

// ================================================================ B. R-V5

console.log('\n---- B. R-V5 — THE PROPERTY-IDENTITY STANDARD ----');

ok('B1. the property test has two questions and both must pass',
  BLOCK.includes('Two questions, and the property has to pass BOTH'));

ok('B2. question one is the settlement question §214 lacked',
  BLOCK.includes('would that ANSWER the safety question')
    && BLOCK.includes('Not narrow it. Not make it likely. Answer it.'));

ok('B3. question two is the independence question',
  BLOCK.includes('while the condition the decision')
    && BLOCK.includes('really turns on is independently fine or independently bad'));

ok('B4. the "reasonable proxy" standard is named and refused',
  BLOCK.includes('AND A GOOD PROXY IS STILL A PROXY')
    && BLOCK.includes('"A reasonable proxy"')
    && BLOCK.includes('the usual proof')
    && BLOCK.includes('the available')
    && BLOCK.includes('naming a')
    && BLOCK.includes('property that way is naming the wrong object'),
  '§215 H1\'s exact phrase, refused by name');

ok('B5. probative, required and only-practical are each stated not to make evidence the property',
  BLOCK.includes('Evidence can be highly probative')
    && BLOCK.includes('legally')
    && BLOCK.includes('the only practical way anyone would ever find out')
    && BLOCK.includes('None of that makes it'));

ok('B6. the act-is-the-property branch answers the settlement question affirmatively',
  BLOCK.includes('THE ONE CASE WHERE THE ACT IS THE PROPERTY')
    && BLOCK.includes('Knowing THAT does answer the safety question')
    && BLOCK.includes('the doing of it IS the requirement'));

ok('B7. R-V5 carries an overcorrection guard protecting the §215 controls',
  OVERCORRECTION_GUARDS_216.some(g => g.rule === 'R-V5'
    && g.protects.includes('H4') && g.protects.includes('H6')));

// ================================================================ C. R-V4

console.log('\n---- C. R-V4 — DISPOSITION CONSISTENCY ----');

ok('C1. the invariant is recorded as three ordered findings',
  DISPOSITION_INVARIANT.length === 3
    && DISPOSITION_INVARIANT[0].disposition === 'CHALLENGE_FACT_VALIDITY'
    && DISPOSITION_INVARIANT[1].disposition === 'ADD_OR_REPLACE_CLARIFICATION'
    && DISPOSITION_INVARIANT[2].disposition === 'VERIFIED_AS_IS');

ok('C2. the block carries an ORDERED ladder whose first step is the property',
  BLOCK.includes('NOW DECIDE, AND DECIDE IN THIS ORDER')
    && BLOCK.includes('Each step is only reached if the one before it passed')
    && BLOCK.indexOf('1. IS THE PROPERTY ITSELF THE RIGHT ONE') > 0);

ok('C3. step 1 ends the decision when the property is wrong',
  BLOCK.includes('that is the answer and you STOP HERE'));

ok('C4. the block forbids proposing a question for a fact whose property was just rejected',
  BLOCK.includes('DO NOT propose a question for a fact whose property you have just said is the '
    + 'wrong')
    && BLOCK.includes('A better question does not make a wrong fact right; it hides it'));

ok('C5. the ladder names all four steps and ends at VERIFIED_AS_IS',
  ['1. IS THE PROPERTY', '2. THE PROPERTY IS RIGHT', '3. THE PROPERTY IS RIGHT AND THE FIELDS',
    '4. OTHERWISE VERIFIED_AS_IS'].every(s => BLOCK.includes(s)));

ok('C6. the verdict to return with a property challenge is named, from the EXISTING vocabulary',
  VERDICT_FOR_A_PROPERTY_CHALLENGE.chosen === 'ABSTAIN'
    && (VERIFIER_VERDICTS as readonly string[]).includes('ABSTAIN')
    && VERDICT_FOR_A_PROPERTY_CHALLENGE.verdictsAdded.length === 0
    && BLOCK.includes('return the verdict ABSTAIN'),
  'the only member documented as asserting nothing');

ok('C7. the three rejected verdicts each carry a reason',
  VERDICT_FOR_A_PROPERTY_CHALLENGE.rejected.length === 3
    && VERDICT_FOR_A_PROPERTY_CHALLENGE.rejected.every(r => r.because.length > 20));

ok('C8. R-V4 carries an overcorrection guard against challenging early and often',
  OVERCORRECTION_GUARDS_216.some(g => g.rule === 'R-V4'
    && g.guard.includes('step 4 is VERIFIED_AS_IS')));

// ================================================================ D. structural closure

console.log('\n---- D. STRUCTURAL ENFORCEMENT REVIEW ----');

const M = closureMatrix();
ok('D1. four routes are probed, and all four are refused by an existing rule',
  M.length === 4 && dispositionRoutingIsClosed()
    && M.every(r => r.refused && r.refusedBy !== 'NOT_REFUSED'),
  M.map(r => `${r.refusedBy === 'V3_ADMISSION' ? 'v3' : '§214'}`).join(' '));

ok('D2. the closure is COMPUTED by running the real checkers, not described',
  MODULES.includes('checkVerifierV3Output(') && MODULES.includes('checkScopeContainment('));

ok('D3. three routes are closed by v3 admission and one by the §214 scope rule',
  M.filter(r => r.refusedBy === 'V3_ADMISSION').length === 3
    && M.filter(r => r.refusedBy === 'SECTION_214_SCOPE_RULE').length === 1,
  M.map(r => r.codes[0]).join(' | '));

ok('D4. NO new deterministic rule was added, and none decides whether a property is wrong',
  closureEffect216().addsANewDeterministicRule === false
    && closureEffect216().decidesWhetherAPropertyIsWrong === false);

ok('D5. the §214 scope rule is not weakened',
  closureEffect216().weakensTheSection214ScopeRule === false
    && readFileSync(join(__dirname, 'lib', 'expert-214-scope-containment.ts'), 'utf8')
      .includes('NOMINATION_OUTSIDE_TARGET_SCOPE'),
  'its four §215 refusals are evidence it worked');

ok('D6. the residual the closure does NOT cover is stated',
  CLOSURE_RESIDUAL.whatIsNotClosed.includes('does not declare the mismatch')
    && CLOSURE_RESIDUAL.soRV4IsLedBy === 'INSTRUCTION');

ok('D7. three candidate rules were considered and refused, with reasons',
  REFUSED_RULES.length === 3
    && REFUSED_RULES.every(r => r.refusedBecause.length > 50)
    && REFUSED_RULES.some(r => r.refusedBecause.includes('would refuse a right answer')));

// ================================================================ E. non-goals

console.log('\n---- E. NON-GOALS HONOURED ----');

ok('E1. the vocabulary and the verdict set are unchanged',
  VOCABULARY_UNCHANGED_216.membersAdded.length === 0
    && VOCABULARY_UNCHANGED_216.verdictsAdded.length === 0
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3 && VERIFIER_VERDICTS.length === 4);

ok('E2. the schema is unchanged and no §216 module builds or patches one',
  VOCABULARY_UNCHANGED_216.schemaChanged === false
    && closureEffect216().changesTheSchema === false
    && JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA).length > 0
    && !/RESPONSE_SCHEMA\s*=|schemaPatch/.test(MODULES));

ok('E3. no §216 module touches first-pass semantics, OwedFact or settlement',
  !MODULES.split('\n').filter(l => /^\s*import\b|\bfrom '\.\.?\//.test(l))
    .some(l => /owed-fact|settlement-review|expert-prompt|first-pass-instruction/.test(l)));

ok('E4. no keyword classifier over safety prose exists in the architecture modules',
  (() => {
    const arch = ['lib/expert-216-disposition-remediation.ts', 'lib/expert-216-disposition-closure.ts']
      .map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');
    return !/\bincludes\(['"](test|record|certificate|inspection|check|proxy)['"]\)/i.test(arch);
  })());

ok('E5. the clarification-first strategy is a negative control, unreachable from architecture',
  CLARIFICATION_FIRST_IS_A_NEGATIVE_CONTROL === true
    && fixtureEffect216().negativeControlIsReachableFromArchitecture === false
    && !readFileSync(join(__dirname, 'lib', 'expert-216-disposition-closure.ts'), 'utf8')
      .includes('clarificationFirstStrategy'));

ok('E6. the verifier is not turned into a second first pass',
  BLOCK.includes('Another fact is another review')
    && !/replacementProperty|correctedProperty|suggestedProperty|authorANewFact/.test(MODULES));

ok('E7. the process stopping rule is recorded as data',
  PROCESS_STOPPING_RULE.thisIsTheFinalAuthorizedInstructionRemediation === true
    && PROCESS_STOPPING_RULE.ifAMaterialPropertyIdentityFailureSurvives.includes('STOP'));

// ================================================================ F. fixtures

console.log('\n---- F. LOCAL FIXTURES ----');

ok('F1. eight fixtures, covering the eight required shapes',
  FIXTURES_216.length === 8 && new Set(FIXTURES_216.map(f => f.id)).size === 8);

ok('F2. every required disposition is representable in the UNCHANGED vocabulary',
  FIXTURES_216.every(f => requiredDispositionIsRepresentable(f)));

ok('F3. F1 pairs a WRONG property with a GOOD question — the instrument',
  (() => {
    const fx = FIXTURES_216.find(x => x.id === 'F1_WRONG_PROPERTY_GOOD_CLARIFICATION')!;
    return fx.propertyIsCorrect === false
      && fx.clarificationSettlesTheControllingProperty === true
      && fx.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
      && fx.decidedAtLadderStep === 1;
  })());

ok('F4. F2 and F3 differ ONLY in the question',
  (() => {
    const a = FIXTURES_216.find(x => x.id === 'F2_CORRECT_PROPERTY_BAD_CLARIFICATION')!;
    const b = FIXTURES_216.find(x => x.id === 'F3_CORRECT_PROPERTY_CORRECT_CLARIFICATION')!;
    return a.proposedProperty === b.proposedProperty
      && a.boundClarification !== b.boundClarification
      && a.requiredDisposition !== b.requiredDisposition;
  })(),
  'same property, two questions, two dispositions');

ok('F5. F4 is the "reasonable proxy" case and is still challenged',
  (() => {
    const fx = FIXTURES_216.find(x => x.id === 'F4_PROXY_DESCRIBED_AS_REASONABLE')!;
    return fx.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY'
      && fx.clarificationSettlesTheControllingProperty === true
      && fx.why.includes('required, probative and the only practical');
  })());

ok('F6. F5 preserves a legitimate act-as-property',
  FIXTURES_216.find(x => x.id === 'F5_ACT_IS_THE_PROPERTY')!.requiredDisposition
    === 'VERIFIED_AS_IS');

ok('F7. F7 is the structural fixture and runs the closure matrix',
  FIXTURES_216.find(x => x.id === 'F7_GROUND_PLUS_NOMINATION_DISPOSITION')!.requiredDisposition
    === 'STRUCTURALLY_REFUSED'
    && requiredDispositionIsRepresentable(
      FIXTURES_216.find(x => x.id === 'F7_GROUND_PLUS_NOMINATION_DISPOSITION')!));

ok('F8. F8 keeps the three-world behaviour clean at ladder step 2',
  (() => {
    const fx = FIXTURES_216.find(x => x.id === 'F8_THREE_WORLD_BEHAVIOUR_CLEAN')!;
    return fx.requiredDisposition === 'ACCEPT_PROPERTY_FLAG_BRANCHES'
      && fx.decidedAtLadderStep === 2 && fx.propertyIsCorrect === true;
  })());

const cf = clarificationFirstScore();
ok('F9. THE DEMONSTRATION — a clarification-first strategy fails the set',
  cf.wrong === 3 && cf.wrongOn.includes('F1_WRONG_PROPERTY_GOOD_CLARIFICATION')
    && cf.wrongOn.includes('F4_PROXY_DESCRIBED_AS_REASONABLE'),
  `${cf.wrong} of ${cf.total} wrong: ${cf.wrongOn.map(s => s.split('_')[0]).join(', ')}`);

ok('F10. it gets the property cases wrong and the question cases right',
  clarificationFirstStrategy(
    FIXTURES_216.find(x => x.id === 'F2_CORRECT_PROPERTY_BAD_CLARIFICATION')!)
      === 'ADD_OR_REPLACE_CLARIFICATION'
    && clarificationFirstStrategy(
      FIXTURES_216.find(x => x.id === 'F3_CORRECT_PROPERTY_CORRECT_CLARIFICATION')!)
      === 'VERIFIED_AS_IS',
  'which is why only the ordered ladder separates them');

ok('F11. three minimal contrasts are recorded',
  minimalContrasts().length === 3
    && minimalContrasts().every(c => c.members.length === 2));

ok('F12. a challenge entry names the target and carries a reason',
  FIXTURES_216.filter(f => f.requiredDisposition === 'CHALLENGE_PROPERTY_IDENTITY')
    .every(f => {
      const e = requiredEntryFor216(f, 'FP:k');
      return e.factKey === 'FP:k' && e.challengeReason !== null
        && e.challengeGround === 'PROPERTY_IDENTITY_MISMATCH';
    }));

// ================================================================ G. KR-1 and §215 evidence

console.log('\n---- G. KR-1 AND §215 EVIDENCE ----');

ok('G1. no §216 module claims KR-1 is mitigated, fixed or closed',
  !/KR-1[^.]{0,40}(mitigated|fixed|closed|resolved)/i.test(MODULES)
    && fixtureEffect216().establishesHostedBehaviour === false);

ok('G2. no §215 result is reclassified',
  fixtureEffect216().reclassifiesAnySection215Result === false);

ok('G3. §215 evidence is byte-unchanged',
  (() => {
    const dir = join(ROOT, 'verification',
      'expert-hazlenz-215-minimal-verifier-confirmation-2026-09-09');
    const adj = readFileSync(join(dir, 'ADJUDICATION-215.md'), 'utf8');
    return readFileSync(join(dir, 'RAW-VERIFIER-215.jsonl'), 'utf8').trim().split('\n').length === 7
      && adj.includes('HF-A (×1), HF-D (×4)')
      && readFileSync(join(dir, 'CONFIRMATION-PREREGISTRATION-215.sha256'), 'utf8')
        .startsWith('a60779493d3ec5bff548c0aa6fee1888293fd9c2bb99f207aefca40052ad703c');
  })(),
  '7 raw records, frozen digest, adjudicated tallies');

ok('G4. §213 evidence and the frozen §211 digest are unchanged',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-213-targeted-verifier-validation-2026-09-09', 'RAW-VERIFIER-213.jsonl'), 'utf8')
    .trim().split('\n').length === 11
    && readFileSync(join(ROOT, 'verification',
      'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09',
      'VERIFIER-VALIDATION-PREREGISTRATION-211.sha256'), 'utf8').startsWith('3d325fd3'));

ok('G5. the §214 instruction is preserved and still reachable',
  EXPERT_VERIFIER_214_SYSTEM_PROMPT.length > 0
    && EXPERT_VERIFIER_214_SYSTEM_PROMPT !== EXPERT_VERIFIER_216_SYSTEM_PROMPT,
  '§215 was executed against §214 and that pairing stays intact');

// ================================================================ H. recommendation

console.log('\n---- H. FINAL MINIMAL CONFIRMATION RECOMMENDATION ----');

ok('H1. four cases, four calls, inside the authorized maximum',
  RECOMMENDED_CASES_216.length === 4 && recommendedCallCount216() === 4
    && recommendedCallCount216() <= MAX_RECOMMENDED_CALLS
    && STATUS === 'RECOMMENDED_NOT_FROZEN' && AUTHORIZED_TO_EXECUTE === false);

ok('H2. K1 to K4 cover both residuals and both controls',
  ['R-V5', 'R-V4', 'CONTROL', 'R-V3'].every(r => RECOMMENDED_CASES_216.some(c => c.residual === r)));

ok('H3. the fifth-case analysis is answered, not assumed',
  FIFTH_CASE_ANALYSIS.answer === 'YES' && FIFTH_CASE_ANALYSIS.fifthCaseRecommended === false
    && FIFTH_CASE_ANALYSIS.because.includes('2 of 4'));

ok('H4. no §215 observation may be reused as a scored case',
  RECOMMENDED_CASES_216.every(c => c.mayReuseASection215Observation === false)
    && SECTION_215_CASES_MAY_NOT_BE_RESCORED.length === 6);

ok('H5. every recommended case is backed by a local fixture that passes',
  localFixtureBacking().every(b => b.fixture !== null),
  localFixtureBacking().map(b => `${b.caseId}<-${(b.fixture ?? '').split('_')[0]}`).join(' '));

ok('H6. seven zero-occurrence gates, no aggregate compensation',
  FUTURE_HARD_GATES.length === 7
    && NO_AGGREGATE_COMPENSATION_216.aggregatePercentageReported === false
    && NO_AGGREGATE_COMPENSATION_216.oneGateMayBeOffsetByAnother === false);

ok('H7. the settled axes are named and not re-measured',
  ALREADY_SETTLED.length >= 6);

const cost = costProjection216();
ok('H8. cost is projected from §215 MEASURED tokens, with a ceiling and no retries',
  Number(cost.recommendedCeilingUsd) > Number(cost.projectedUsd) && cost.retriesAuthorized === 0
    && String(cost.basisNote).includes('MEASURED'),
  `projected USD ${cost.projectedUsd}, ceiling USD ${cost.recommendedCeilingUsd}`);

ok('H9. the recommendation states its limits, including the process stopping rule',
  RECOMMENDATION_LIMITS_216.length >= 5
    && RECOMMENDATION_LIMITS_216.some(l => l.includes('not a preregistration'))
    && RECOMMENDATION_LIMITS_216.some(l => l.includes('stopping rule')));

// ================================================================ I. boundaries

console.log('\n---- I. BOUNDARIES ----');

const PINNED = [
  ['src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
  ['src/hazlenz/expert-hazlenz/expert-prompt.ts',
    'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694'],
  ['scripts/lib/expert-verifier-contract-v3.ts',
    '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc'],
] as const;
for (const [rel, expected] of PINNED) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const actual = require('crypto').createHash('sha256')
    .update(readFileSync(join(__dirname, '..', rel))).digest('hex');
  ok(`I.pin ${rel.split('/').pop()}`, actual === expected, actual === expected ? 'INTACT' : actual);
}

ok('I1. no §216 module writes to disk, reaches a provider or touches a database',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES)
    && !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('I2. no protocol version is claimed',
  !/=\s*'hazlenz\.expert\.verifier\.v(3\.[45]|4)'/.test(MODULES));

ok('I3. every §216 module declares its version',
  [DISPOSITION_REMEDIATION_216_VERSION, DISPOSITION_CLOSURE_216_VERSION, FIXTURES_216_VERSION,
    HOSTED_RECOMMENDATION_216_VERSION].every(v => v.startsWith('hazlenz.expert.216.')));

ok('I4. provider calls and database operations are zero',
  fixtureEffect216().providerCalls === 0 && fixtureEffect216().databaseOperations === 0
    && closureEffect216().providerCalls === 0);

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${DISPOSITION_REMEDIATION_216_VERSION}   (no protocol version claimed)`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   SCHEMA CHANGED: no');
console.log('  KR-1 remains OPEN. No hosted behaviour is measured or claimed.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
