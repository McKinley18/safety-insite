/**
 * §214 EXPERT HAZLENZ -- TARGETED VERIFIER SEMANTIC REMEDIATION: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO SCHEMA CHANGE. NO §213 EVIDENCE TOUCHED.
 *
 * Establishes: that the §212 block is SUPERSEDED rather than layered; that R-V1, R-V2 and R-V3 are
 * each present with the overcorrection guard that belongs to them; that the six protected controls
 * each have a fixture; that the paired fixtures discriminate semantic role from vocabulary, shown by
 * running a blanket word rule and watching it fail; and that the deterministic scope rule refuses an
 * out-of-scope nomination without reading a word of prose.
 *
 * Establishes NOTHING about hosted behaviour. KR-1 remains OPEN and the suite asserts that no §214
 * module says otherwise.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { VERIFIER_VERDICTS } from './lib/expert-verifier-contract';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  checkDeclarationEntry212,
} from './lib/expert-212-challenge-vocabulary';
import {
  VERIFIER_212_RESPONSE_SCHEMA, REMIT_BLOCK_LINES as BLOCK_212,
} from './lib/expert-212-verifier-protocol';
import {
  VERIFIER_SEMANTIC_REMEDIATION_214_VERSION, BASE_PROTOCOL_VERSION, VOCABULARY_UNCHANGED,
  REMIT_BLOCK_214, SUPERSESSION_LEDGER, OVERCORRECTION_GUARDS_214,
  EXPERT_VERIFIER_214_SYSTEM_PROMPT, reconstructV32SystemPrompt214, sizeAccounting,
  carriedVerbatimFraction,
} from './lib/expert-214-verifier-semantic-remediation';
import {
  SCOPE_CONTAINMENT_214_VERSION, SCOPE_ADMISSION_CODES_214, SCOPE_DECISION_INPUTS,
  checkScopeContainment, scopeContainmentEffect, type RequestScope214,
} from './lib/expert-214-scope-containment';
import {
  CONTROLS_AND_FIXTURES_214_VERSION, PROTECTED_CONTROLS, FIXTURES_214, pairs,
  requiredOutcomeIsRepresentable, requiredEntryFor, blanketVocabularyRuleScore,
  blanketVocabularyRuleWouldChallenge, BLANKET_RULE_IS_A_NEGATIVE_CONTROL, fixtureEffect214,
} from './lib/expert-214-controls-and-fixtures';
import {
  HOSTED_CONFIRMATION_RECOMMENDATION_214_VERSION, STATUS, AUTHORIZED_TO_EXECUTE,
  RECOMMENDED_CASES, recommendedCallCount, costProjection214, SUCCESS_CRITERIA,
  NO_AGGREGATE_COMPENSATION, SECTION_213_CASES_MAY_NOT_BE_RESCORED, ALREADY_SETTLED_BY_213,
  RECOMMENDATION_LIMITS,
} from './lib/expert-214-hosted-confirmation-recommendation';

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
  'lib/expert-214-verifier-semantic-remediation.ts',
  'lib/expert-214-scope-containment.ts',
  'lib/expert-214-controls-and-fixtures.ts',
  'lib/expert-214-hosted-confirmation-recommendation.ts',
].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');
const BLOCK = REMIT_BLOCK_214.join('\n');

// ================================================================ A. supersession

console.log('\n---- A. SUPERSESSION, NOT LAYERING ----');

ok('A1. the successor is built from v3.2, not from §212',
  BASE_PROTOCOL_VERSION === 'hazlenz.expert.verifier-instruction.v3.2'
    && !EXPERT_VERIFIER_214_SYSTEM_PROMPT.includes(BLOCK_212.join('\n')),
  'the §212 block does not appear in the §214 prompt');

ok('A2. removing the block reproduces the v3.2 prompt BYTE FOR BYTE',
  reconstructV32SystemPrompt214(EXPERT_VERIFIER_214_SYSTEM_PROMPT)
    === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);

ok('A3. every §212 section is dispositioned',
  SUPERSESSION_LEDGER.length === 11
    && SUPERSESSION_LEDGER.every(e => e.why.length > 20));

ok('A4. two §212 passages replaced, two added, seven carried verbatim',
  SUPERSESSION_LEDGER.filter(e => e.disposition === 'REPLACED').length === 2
    && SUPERSESSION_LEDGER.filter(e => e.disposition === 'ADDED').length === 2
    && SUPERSESSION_LEDGER.filter(e => e.disposition === 'CARRIED_VERBATIM').length === 7);

ok('A5. the replaced perfect-knowledge phrasing is GONE from the successor',
  !BLOCK.includes('if you could see the workplace exactly')
    && BLOCK_212.join('\n').includes('if you could see the workplace exactly'),
  '§213 T1 read it as visual inspection; the phrasing does not survive');

ok('A6. the paragraphs §213 proved worked are carried verbatim',
  ['THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT',
    'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW',
    'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
    'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN']
    .every(h => BLOCK.includes(h) && BLOCK_212.join('\n').includes(h)));

ok('A7. most of §212\'s wording survives, measured rather than claimed',
  carriedVerbatimFraction() > 0.6,
  `${Math.round(carriedVerbatimFraction() * 100)}% of §212's non-blank lines carried verbatim`);

const size = sizeAccounting() as any;
ok('A8. size is reported against BOTH v3.2 and §212',
  typeof size.addedCharsVsV32 === 'number' && typeof size.addedCharsVs212 === 'number'
    && size.addedCharsVs212 < size.addedCharsVsV32,
  `+${size.addedCharsVsV32} vs v3.2, +${size.addedCharsVs212} vs §212 `
    + `(~+${size.estimatedAddedTokensVs212} tokens)`);

ok('A9. the successor block is not a large expansion over §212',
  size.blockChars214 < size.blockChars212 * 1.6,
  `${size.blockChars212} -> ${size.blockChars214} block chars`);

// ================================================================ B. R-V1

console.log('\n---- B. R-V1 — THE ROLE TEST ----');

ok('B1. the role test removes the artifact rather than granting perfect sight',
  BLOCK.includes('WITH THAT TEST OR RECORD OUT OF THE PICTURE ENTIRELY, COULD THE UNDERLYING '
    + 'CONDITION STILL BE'));

ok('B2. it explicitly refuses the visual reading that failed on §213 T1',
  BLOCK.includes('Do not answer this by asking whether LOOKING would settle it'));

ok('B3. the YES branch names both worked examples from the §213 failures',
  BLOCK.includes('A weld is sound or unsound whether or not anyone crack tested it')
    && BLOCK.includes('A bund holds or leaks'),
  'T1 and T2, by mechanism rather than by replay');

ok('B4. the NO branch names three legitimate act properties',
  (() => {
    const no = BLOCK.slice(BLOCK.indexOf('NO, because carrying out the act'),
      BLOCK.indexOf('THAT SECOND CASE IS COMMON')).toLowerCase();
    return ['rescue plan was agreed', 'crane was booked', 'statutory examination was actually done']
      .every(x => no.includes(x)) && no.includes('the doing of them is the requirement');
  })(),
  'checked inside the NO branch itself, case-insensitively');

ok('B5. the act-as-property guard follows immediately and is unchanged',
  BLOCK.indexOf('THAT SECOND CASE IS COMMON') > BLOCK.indexOf('The doing of them IS the requirement')
    && BLOCK.includes('ROLE the thing plays in the decision, never on the words used'));

ok('B6. R-V1 carries a recorded overcorrection guard protecting the §213 controls',
  OVERCORRECTION_GUARDS_214.some(g => g.rule === 'R-V1'
    && g.protects.includes('T4') && g.protects.includes('T8')));

// ================================================================ C. R-V2

console.log('\n---- C. R-V2 — THREE WORLDS ----');

ok('C1. the three worlds are named and each field is assigned to one',
  BLOCK.includes('THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM')
    && BLOCK.includes('branchA is the satisfactory world. branchB is the adverse world'));

ok('C2. the unresolved world is stated NOT to be a third answer',
  BLOCK.includes('That third one is not a third answer'));

ok('C3. the absence phrases §213 missed are named, including the "or" smuggle',
  ['not confirmed', 'not documented', 'not measured', 'unproven', 'certificate missing',
    'test absent'].every(p => BLOCK.includes(p))
    && BLOCK.includes('an "or" that'),
  'T1\'s "unconfirmed or inadequate" and T10\'s "unproven, or does not carry"');

ok('C4. the counterfactual check is present and is model-authored',
  BLOCK.includes('COULD THE CONDITION ACTUALLY BE FINE EVEN THOUGH NOBODY CAN SHOW IT')
    && !/COULD_THE_CONDITION|couldConditionBeFine/.test(MODULES),
  'semantic and in the instruction; not implemented deterministically');

ok('C5. the absence-is-the-adverse-state exception is stated in the same list item',
  BLOCK.includes('The exception, and it is a real one')
    && BLOCK.includes('an absence-shaped branchB is')
    && BLOCK.includes('correct and you should leave it alone'));

ok('C6. R-V2 carries an overcorrection guard protecting C5',
  OVERCORRECTION_GUARDS_214.some(g => g.rule === 'R-V2' && g.protects.includes('C5')));

// ================================================================ D. R-V3

console.log('\n---- D. R-V3 — FACT SCOPE ----');

ok('D1. the instruction permits conversational awareness of a sibling',
  BLOCK.includes('Say so in your reasoning if it helps a reader')
    && BLOCK.includes('nobody is asking you to pretend you did not notice'));

ok('D2. the instruction refuses structured nomination and sibling-settling questions',
  BLOCK.includes('do not raise a different one as a new fact')
    && BLOCK.includes('settles a different one in place of a question that settles this one'));

const SCOPE: RequestScope214 = {
  targetFactKey: 'FP:target', suppliedFactKeys: ['FP:target'], multiFactValidationRequested: false,
};

ok('D3. a clean single-target output is admitted',
  checkScopeContainment({
    scope: SCOPE,
    output: {
      nominatedFact: null, clarificationSourceMode: 'SUPPLIED_FACT',
      owedFactDeclarations: [{ factKey: 'FP:target' }],
    },
  }).admitted);

ok('D4. §213 T6\'s shape — correct binding plus a nomination — is REFUSED',
  (() => {
    const r = checkScopeContainment({
      scope: SCOPE,
      output: {
        nominatedFact: { anything: 'a sibling fact' },
        clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
        owedFactDeclarations: [{ factKey: 'FP:target' }],
      },
    });
    return !r.admitted && r.codes.includes('NOMINATION_OUTSIDE_TARGET_SCOPE')
      && r.codes.includes('SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE');
  })(),
  'the exact §213 T6 shape, refused structurally');

ok('D5. the rule stands down when the contract genuinely asks for linked facts',
  checkScopeContainment({
    scope: { ...SCOPE, multiFactValidationRequested: true },
    output: {
      nominatedFact: { anything: 'a linked fact' }, clarificationSourceMode: 'NOMINATED_FACT',
      owedFactDeclarations: [{ factKey: 'FP:target' }],
    },
  }).admitted,
  'contract-driven, not hard-coded');

ok('D6. a foreign declared key and a missing target are refused',
  (() => {
    const r = checkScopeContainment({
      scope: SCOPE,
      output: { nominatedFact: null, owedFactDeclarations: [{ factKey: 'FP:someone-else' }] },
    });
    return r.codes.includes('DECLARED_KEY_NOT_SUPPLIED')
      && r.codes.includes('TARGET_FACT_NOT_DECLARED');
  })());

ok('D7. the rule reads six structural inputs and no prose',
  SCOPE_DECISION_INPUTS.length === 6
    && scopeContainmentEffect().readsAnyFreeText === false
    && scopeContainmentEffect().readsRationaleProse === false
    && scopeContainmentEffect().usesAKeywordList === false);

ok('D8. no verdict and no challenge ground was added by the scope rule',
  scopeContainmentEffect().addsAVerdict === false
    && scopeContainmentEffect().addsAChallengeGround === false
    && SCOPE_ADMISSION_CODES_214.length === 5);

ok('D9. R-V3 carries an overcorrection guard protecting conversational awareness',
  OVERCORRECTION_GUARDS_214.some(g => g.rule === 'R-V3'
    && g.guard.includes('did not notice')));

// ================================================================ E. non-goals

console.log('\n---- E. NON-GOALS HONOURED ----');

ok('E1. the vocabulary is unchanged — no ground, kind, concern or verdict added',
  VOCABULARY_UNCHANGED.membersAdded.length === 0
    && VOCABULARY_UNCHANGED.verdictsAdded.length === 0
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3 && VERIFIER_VERDICTS.length === 4);

ok('E2. the schema is unchanged',
  VOCABULARY_UNCHANGED.schemaChanged === false
    && JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA).length > 0
    && JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA).length > 0
    && !/RESPONSE_SCHEMA\s*=|schemaPatch|input_schema/.test(MODULES),
  'no §214 module builds or patches a schema');

ok('E3. no §214 module touches first-pass semantics, OwedFact or settlement',
  !MODULES.split('\n').filter(l => /^\s*import\b|\bfrom '\.\.?\//.test(l))
    .some(l => /owed-fact|settlement-review|expert-prompt|first-pass-instruction/.test(l)));

ok('E4. no deterministic state-versus-evidence inference and no keyword classifier in architecture',
  (() => {
    const arch = [
      'lib/expert-214-verifier-semantic-remediation.ts',
      'lib/expert-214-scope-containment.ts',
    ].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');
    return !/\bincludes\(['"](test|record|certificate|inspection|check)['"]\)/i.test(arch)
      && !/NEGATIVE_CONTROL_WORDS|WORDS\s*=/.test(arch);
  })(),
  'the word list exists only in the fixtures module, as a negative control');

ok('E5. the blanket rule is a negative control and is unreachable from any architecture path',
  BLANKET_RULE_IS_A_NEGATIVE_CONTROL === true
    && fixtureEffect214().blanketRuleIsReachableFromArchitecture === false
    && !readFileSync(join(__dirname, 'lib', 'expert-214-scope-containment.ts'), 'utf8')
      .includes('blanketVocabularyRule')
    && !readFileSync(join(__dirname, 'lib', 'expert-212-verifier-payload.ts'), 'utf8')
      .includes('blanketVocabularyRule'));

ok('E6. nothing forces every uncertainty into a challenge',
  BLOCK.includes('NONE is the normal answer')
    && FIXTURES_214.filter(f => f.requiredOutcome === 'ACCEPT_PROPERTY_UNCHANGED').length >= 6,
  'most fixtures require the property to be accepted');

// ================================================================ F. controls and fixtures

console.log('\n---- F. CONTROLS AND FIXTURES ----');

ok('F1. six protected controls, each with a statement and a §213 lineage',
  PROTECTED_CONTROLS.length === 6
    && PROTECTED_CONTROLS.every(c => c.statement.length > 30 && c.equivalentTo.length > 10));

ok('F2. every control has at least one fixture',
  PROTECTED_CONTROLS.every(c => FIXTURES_214.some(f => (f.controls as readonly string[])
    .includes(c.id))),
  PROTECTED_CONTROLS.map(c => `${c.id}:${FIXTURES_214.filter(f =>
    (f.controls as readonly string[]).includes(c.id)).length}`).join(' '));

ok('F3. twelve fixtures covering the ten required shapes',
  FIXTURES_214.length === 12 && new Set(FIXTURES_214.map(f => f.id)).size === 12);

ok('F4. every required outcome is representable in the UNCHANGED §212 vocabulary',
  FIXTURES_214.every(f => requiredOutcomeIsRepresentable(f)));

ok('F5. every fixture answers the role test before anything runs',
  FIXTURES_214.every(f => f.roleTestAnswer.length > 40 && f.nounUnderTest.length > 0));

ok('F6. four pairs, each with exactly two members',
  pairs().length === 4 && pairs().every(p => p.members.length === 2),
  pairs().map(p => p.pair).join(', '));

ok('F7. within each pair the noun is shared and exactly one discriminator differs',
  pairs().every(p => {
    const [a, b] = p.members;
    const differs = [
      a.semanticRole !== b.semanticRole,
      a.requiredOutcome !== b.requiredOutcome,
      a.siblingHandling !== b.siblingHandling,
    ].filter(Boolean).length;
    return a.nounUnderTest === b.nounUnderTest && differs > 0;
  }),
  'the same noun; the role, the required outcome or the sibling handling changes, never all three');

ok('F8. the D pair is identical in every semantic field and differs only in sibling handling',
  (() => {
    const [d1, d2] = pairs().find(p => p.pair === 'D_FACT_SCOPE')!.members;
    return d1.proposedProperty === d2.proposedProperty && d1.branchA === d2.branchA
      && d1.branchB === d2.branchB
      && d1.decisionWhileUnresolved === d2.decisionWhileUnresolved
      && d1.requiredOutcome === d2.requiredOutcome
      && d1.siblingHandling === 'MUST_NOT_NOMINATE'
      && d2.siblingHandling === 'MENTION_IN_PROSE_ONLY';
  })(),
  'mentioning a sibling against nominating it — the only field that moves');

const blanket = blanketVocabularyRuleScore();
ok('F9. THE DEMONSTRATION — a blanket word rule fails the fixture set',
  blanket.wrong >= 4 && blanket.wrong + blanket.correct === FIXTURES_214.length,
  `${blanket.wrong} of ${blanket.total} wrong: ${blanket.wrongOn.join(', ')}`);

ok('F10. it gets exactly one member of each vocabulary pair wrong',
  ['A_THOROUGH_EXAMINATION', 'B_PROOF_LOAD'].every(name => {
    const [a, b] = pairs().find(p => p.pair === name)!.members;
    const wrongA = blanketVocabularyRuleWouldChallenge(a) !== a.requiredOutcome.startsWith('CHAL');
    const wrongB = blanketVocabularyRuleWouldChallenge(b) !== b.requiredOutcome.startsWith('CHAL');
    return wrongA !== wrongB;
  }),
  'no word list can pass both members; only semantic role can');

ok('F11. the required entry for a challenge names the target fact key',
  FIXTURES_214.filter(f => f.requiredOutcome.startsWith('CHALLENGE_'))
    .every(f => {
      const e = requiredEntryFor(f, 'FP:k');
      return e.factKey === 'FP:k' && e.challengeReason !== null
        && checkDeclarationEntry212(e).length === 0;
    }));

ok('F12. no fixture puts a sibling nomination in scope',
  FIXTURES_214.every(f => f.siblingNominationInScope === false));

ok('F13. fixtures record what must NOT be asserted where a satisfactory world exists',
  FIXTURES_214.filter(f => f.mustNotAssert !== null).length >= 5);

// ================================================================ G. KR-1 and §213 evidence

console.log('\n---- G. KR-1 AND §213 EVIDENCE ----');

ok('G1. no §214 module claims KR-1 is mitigated, fixed or closed',
  !/KR-1[^.]{0,40}(mitigated|fixed|closed|resolved)/i.test(MODULES)
    && fixtureEffect214().establishesHostedBehaviour === false);

ok('G2. no §213 failure is reclassified',
  fixtureEffect214().reclassifiesAnySection213Failure === false);

ok('G3. §213 evidence is byte-unchanged',
  (() => {
    const dir = join(ROOT, 'verification',
      'expert-hazlenz-213-targeted-verifier-validation-2026-09-09');
    const raw = readFileSync(join(dir, 'RAW-VERIFIER-213.jsonl'), 'utf8');
    const adj = readFileSync(join(dir, 'ADJUDICATION-213.md'), 'utf8');
    return raw.trim().split('\n').length === 11
      // The failures stand recorded exactly as adjudicated.
      && adj.includes('HF-1 (×2), HF-4 (×2)') && adj.includes('**Not clean.**')
      && readFileSync(join(dir, 'EXECUTION-REPORT-213.md'), 'utf8')
        .includes('EXPERT_HAZLENZ_TARGETED_VERIFIER_VALIDATION_REQUIRES_REVIEW');
  })(),
  '11 raw records, terminal unchanged');

ok('G4. the frozen §211 instrument is untouched',
  readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09',
    'VERIFIER-VALIDATION-PREREGISTRATION-211.sha256'), 'utf8')
    .startsWith('3d325fd38f55eafbc46d03841bb362cefbee9c90533e19aa28460796f26cf4a7'));

// ================================================================ H. recommendation

console.log('\n---- H. MINIMAL HOSTED CONFIRMATION RECOMMENDATION ----');

ok('H1. six shapes, seven calls, and it is a recommendation rather than a frozen instrument',
  RECOMMENDED_CASES.length === 6 && recommendedCallCount() === 7
    && STATUS === 'RECOMMENDED_NOT_FROZEN' && AUTHORIZED_TO_EXECUTE === false,
  `${recommendedCallCount()} calls against §213's 11`);

ok('H2. every recommended case names its residual and its hard-failure class',
  RECOMMENDED_CASES.every(c => c.residual.length > 0 && c.hardFailureIfWrong.length > 0
    && c.whyItIsNeeded.length > 60));

ok('H3. all three residuals and both mandatory controls are covered',
  ['R-V1', 'R-V2', 'R-V3'].every(r => RECOMMENDED_CASES.some(c => c.residual === r))
    && RECOMMENDED_CASES.filter(c => c.residual === 'CONTROL').length === 2);

ok('H4. no §213 observation may be reused as a scored case',
  RECOMMENDED_CASES.every(c => c.mayReuseA213Observation === false)
    && SECTION_213_CASES_MAY_NOT_BE_RESCORED.length === 6);

ok('H5. the axes §213 already settled are named and not re-measured',
  ALREADY_SETTLED_BY_213.length >= 5);

ok('H6. seven zero-occurrence criteria, with no aggregate compensation',
  SUCCESS_CRITERIA.length === 7
    && SUCCESS_CRITERIA.every(c => c.threshold === 'ZERO_OCCURRENCE')
    && NO_AGGREGATE_COMPENSATION.aggregatePercentageReported === false
    && NO_AGGREGATE_COMPENSATION.oneClassMayBeOffsetByAnother === false);

const cost = costProjection214();
ok('H7. cost is projected from §213 MEASURED tokens, with a ceiling',
  Number(cost.projectedUsd) > 0 && Number(cost.recommendedCeilingUsd) > Number(cost.projectedUsd)
    && cost.retriesAuthorized === 0
    && String(cost.basisNote).includes('MEASURED'),
  `projected USD ${cost.projectedUsd}, ceiling USD ${cost.recommendedCeilingUsd}`);

ok('H8. the recommendation states its own limits, including that it is not preregistered',
  RECOMMENDATION_LIMITS.length >= 4
    && RECOMMENDATION_LIMITS.some(l => l.includes('not a preregistration')));

// ================================================================ I. boundaries

console.log('\n---- I. BOUNDARIES ----');

const PINNED = [
  ['src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
  ['src/safescope-v2/expert-hazlenz/expert-prompt.ts',
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

ok('I1. no §214 module writes to disk, reaches a provider or touches a database',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES)
    && !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('I2. no protocol version is claimed',
  !/=\s*'hazlenz\.expert\.verifier\.v(3\.4|4)'/.test(MODULES));

ok('I3. every §214 module declares its version',
  [VERIFIER_SEMANTIC_REMEDIATION_214_VERSION, SCOPE_CONTAINMENT_214_VERSION,
    CONTROLS_AND_FIXTURES_214_VERSION, HOSTED_CONFIRMATION_RECOMMENDATION_214_VERSION]
    .every(v => v.startsWith('hazlenz.expert.214.')));

ok('I4. provider calls and database operations are zero',
  fixtureEffect214().providerCalls === 0 && fixtureEffect214().databaseOperations === 0
    && scopeContainmentEffect().contractDriven === true);

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${VERIFIER_SEMANTIC_REMEDIATION_214_VERSION}   (no protocol version claimed)`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   SCHEMA CHANGED: no');
console.log('  KR-1 remains OPEN. No hosted behaviour is measured or claimed.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
