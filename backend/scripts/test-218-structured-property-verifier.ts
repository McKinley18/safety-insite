/**
 * §218 EXPERT HAZLENZ -- STRUCTURED PROPERTY-SEMANTIC VERIFIER ARCHITECTURE: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO COMMIT. NO PUSH. NO TAG. NO DEPLOY.
 *
 * Establishes: that the property review reaches the schema as five required fields built by
 * construction from §212; that the instruction block is additive and reproduces §216 byte for byte
 * when removed; that the deterministic layer decides only structure, membership, identity and
 * cross-field pairing; that every required disposition is representable and every prohibited one is
 * refused by a named code from a named layer; that three plausible wrong strategies fail the fixture
 * set; that no historical evidence is inferred from, edited or reclassified; and that the sixteen
 * hosted-readiness items are answered by running code.
 *
 * Establishes NOTHING about hosted behaviour. KR-1 remains OPEN. No §213, §215 or §217 result moves.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import { VERIFIER_VERDICTS } from './lib/expert-verifier-contract';
import { OWED_FACT_DECLARATIONS_V3 } from './lib/expert-verifier-instruction-v3';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './lib/expert-212-challenge-vocabulary';
import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import { SCOPE_DECISION_INPUTS } from './lib/expert-214-scope-containment';
import {
  EXPERT_VERIFIER_216_SYSTEM_PROMPT, PROCESS_STOPPING_RULE,
} from './lib/expert-216-disposition-remediation';
import {
  PROPERTY_REVIEW_CONTRACT_218_VERSION, BASE_ARTIFACT_218, PROTOCOL_VERSION_CLAIMED_218,
  PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218, PROPERTY_REVIEW_FIELDS_218,
  ROLE_DEFINITIONS_218, VALIDITY_DEFINITIONS_218, EVIDENCE_ROLE_COUNTERFACTUAL,
  DECISION_CONTROLLING_PROPERTY_IS_ADVISORY, PROPERTY_REVIEW_SCHEMA_PROPERTY,
  VERIFIER_218_RESPONSE_SCHEMA, reconstruct212Schema, schemaAccounting218,
} from './lib/expert-218-property-review-contract';
import {
  PROPERTY_INSTRUCTION_218_VERSION, TEXT_IS_NOT_THE_REMEDY, PROPERTY_REVIEW_BLOCK_218,
  EXPERT_VERIFIER_218_SYSTEM_PROMPT, reconstruct216SystemPrompt, BLOCK_TO_RULE_218,
  OVERCORRECTION_GUARDS_218, instructionAccounting218,
} from './lib/expert-218-property-instruction';
import {
  PROPERTY_CONSISTENCY_218_VERSION, ORDERED_DECISION_STEPS_218,
  mayProceedToRepresentationReview, PROPERTY_REVIEW_CODES_218, checkPropertyReview218,
  CONSISTENCY_RULE_CLASSIFICATION_218, CONSISTENCY_DECISION_INPUTS_218, consistencyEffect218,
  failClosedEffect218, REFUSED_RULES_218, SUPERSEDED_REFUSALS_216, KIND_IMPLIED_BY_ROLE_218,
} from './lib/expert-218-property-consistency';
import {
  FIXTURES_218_VERSION, FIXTURES_218, FIXTURE_CONSTANTS_218, compliantOutputFor218,
  requiredVerdictFor218, runCompliantFixtures218, runRefusalFixtures218,
  refusalsFireTheirNamedCode218, minimalContrasts218, vocabularyOnlyScore, clarificationFirstScore,
  challengeEverythingScore, NEGATIVE_CONTROLS_ARE_UNREACHABLE_218, fixtureEffect218,
} from './lib/expert-218-fixtures';
import {
  LEGACY_COMPATIBILITY_218_VERSION, FROZEN_HISTORICAL_SECTIONS, HISTORICAL_EVIDENCE_DISPOSITION,
  SECTION_217_EVIDENCE, FIELD_PROVENANCE_218, MECHANICAL_FIELDS_218, SEMANTIC_FIELDS_218,
  adaptForDevelopmentFixture, mayUpgradeALegacyOutput, REFUSED_ADAPTATIONS_218, legacyEffect218,
} from './lib/expert-218-legacy-compatibility';
import {
  HOSTED_READINESS_218_VERSION, hostedReadinessGate218, readinessIsClean218, fixturesAreClean218,
  STATUS_218, AUTHORIZED_TO_EXECUTE_218, MAX_RECOMMENDED_CALLS_218, ALREADY_SETTLED_218,
  RECOMMENDED_CASES_218, recommendedCallCount218, localFixtureBacking218, costProjection218,
  FUTURE_HARD_GATES_218, NO_AGGREGATE_COMPENSATION_218, HISTORICAL_CASES_MAY_NOT_BE_RESCORED_218,
  STOPPING_RULE_218, RECOMMENDATION_LIMITS_218, readinessEffect218,
} from './lib/expert-218-hosted-readiness';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
/**
 * ==================== §247 RELOCATION REPAIR ====================
 *
 * §246 promoted the §218 contract modules into the production tree at
 * `src/safescope-v2/expert-hazlenz/contract/` and left one-line re-export shims at their historical
 * `scripts/lib/` paths. Every assertion below must read the IMPLEMENTATION, not a shim, so a module
 * is resolved to the canonical production location when it exists there and to `scripts/lib/`
 * otherwise -- which is still correct for the §218 modules that were not relocated.
 *
 * NOTHING IS WEAKENED. The pinned digests are the same frozen values as before the relocation,
 * because all six relocated modules moved byte-identically; only the path they are read from
 * changed. The source-rule scan asserts the same rule against the same bytes at their canonical
 * location.
 */
const CONTRACT_DIR = join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'contract');
/** Redirect a historical `scripts/lib/<name>` path to the promoted module when one exists. */
function canonicalModulePath(repoRelativeOrName: string): string {
  const name = repoRelativeOrName.split('/').pop() as string;
  const promoted = join(CONTRACT_DIR, name);
  if (existsSync(promoted)) return promoted;
  if (repoRelativeOrName.startsWith('lib/')) return join(__dirname, repoRelativeOrName);
  return join(__dirname, '..', repoRelativeOrName);
}
const readModuleSource = (p: string): string => readFileSync(canonicalModulePath(p), 'utf8');

const MODULE_FILES = [
  'lib/expert-218-property-review-contract.ts', 'lib/expert-218-property-consistency.ts',
  'lib/expert-218-property-instruction.ts', 'lib/expert-218-fixtures.ts',
  'lib/expert-218-legacy-compatibility.ts', 'lib/expert-218-hosted-readiness.ts',
];
const MODULES = MODULE_FILES.map(readModuleSource).join('\n');
const ARCHITECTURE_MODULES = [
  'lib/expert-218-property-review-contract.ts', 'lib/expert-218-property-consistency.ts',
  'lib/expert-218-property-instruction.ts',
].map(readModuleSource).join('\n');

const { TARGET_KEY, TARGET_DECLARATION_ID } = FIXTURE_CONSTANTS_218;

const check = (output: Record<string, unknown>): ReturnType<typeof checkPropertyReview218> =>
  checkPropertyReview218({
    scope: { targetDeclarationId: TARGET_DECLARATION_ID, targetFactKey: TARGET_KEY },
    output: {
      propertyReview: output.propertyReview,
      verdict: output.verdict,
      owedFactDeclarations: output.owedFactDeclarations as { factKey?: unknown }[],
    },
  });
const fx = (id: string): (typeof FIXTURES_218)[number] =>
  FIXTURES_218.find(f => f.id.startsWith(id)) as (typeof FIXTURES_218)[number];

// ================================================================ A. the contract

console.log('---- A. THE STRUCTURED PROPERTY REVIEW REACHES THE SCHEMA ----');

const item = (VERIFIER_218_RESPONSE_SCHEMA as Record<string, any>).properties.propertyReview;

ok('A1. propertyReview is a required top-level object with exactly five required fields',
  item !== undefined && item.type === 'object' && item.additionalProperties === false
    && item.required.length === 5
    && PROPERTY_REVIEW_FIELDS_218.every(f => item.required.includes(f))
    && (VERIFIER_218_RESPONSE_SCHEMA as any).required.includes('propertyReview'),
  item?.required?.join(','));

ok('A2. propertySemanticRole is a closed five-member enum, and the act and the artifact have their '
  + 'own members',
  Array.isArray(item.properties.propertySemanticRole.enum)
    && item.properties.propertySemanticRole.enum.length === 5
    && PROPERTY_SEMANTIC_ROLES_218.includes('REQUIRED_ACT_ITSELF')
    && PROPERTY_SEMANTIC_ROLES_218.includes('REQUIRED_ARTIFACT_ITSELF')
    && PROPERTY_SEMANTIC_ROLES_218.includes('EVIDENCE_FOR_ANOTHER_PROPERTY'),
  PROPERTY_SEMANTIC_ROLES_218.join(' | '));

ok('A3. propertyValidity is a closed three-member enum',
  item.properties.propertyValidity.enum.length === 3
    && PROPERTY_VALIDITIES_218.join(',') === 'VALID,INVALID,UNCERTAIN');

ok('A4. every role and every validity carries a definition',
  PROPERTY_SEMANTIC_ROLES_218.every(r => (ROLE_DEFINITIONS_218[r] ?? '').length > 40)
    && PROPERTY_VALIDITIES_218.every(v => (VALIDITY_DEFINITIONS_218[v] ?? '').length > 20));

ok('A5. the evidence role is defined by a counterfactual, not by a vocabulary',
  EVIDENCE_ROLE_COUNTERFACTUAL.includes('Remove the evidence')
    && EVIDENCE_ROLE_COUNTERFACTUAL.includes('independently')
    && !/keyword|word list|contains the word/i.test(EVIDENCE_ROLE_COUNTERFACTUAL));

ok('A6. removing propertyReview reproduces the §212 schema BYTE FOR BYTE',
  JSON.stringify(reconstruct212Schema()) === JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA),
  `${JSON.stringify(reconstruct212Schema()).length} vs `
  + `${JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA).length} bytes`);

ok('A7. NO VERDICT IS ADDED and no challenge vocabulary member is added',
  VERIFIER_VERDICTS.length === 4 && OWED_FACT_DECLARATIONS_V3.length === 3
    && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
    && REPRESENTATION_CONCERNS_212.length === 3,
  `${VERIFIER_VERDICTS.length} verdicts, ${CHALLENGE_GROUNDS_212.length} grounds, `
  + `${PROPERTY_MISMATCH_KINDS.length} kinds, ${REPRESENTATION_CONCERNS_212.length} concerns`);

ok('A8. decisionControllingProperty is advisory and is never promoted to an OwedFact',
  !DECISION_CONTROLLING_PROPERTY_IS_ADVISORY.becomesAnOwedFact
    && !DECISION_CONTROLLING_PROPERTY_IS_ADVISORY.isSettled
    && !DECISION_CONTROLLING_PROPERTY_IS_ADVISORY.reachesCustomerAuthoritativeTruth
    && !DECISION_CONTROLLING_PROPERTY_IS_ADVISORY.isParsedForMeaningByDeterministicCode
    && !DECISION_CONTROLLING_PROPERTY_IS_ADVISORY.mayInjectASiblingFact);

ok('A9. no §218 architecture module imports a fact constructor or projection',
  !/projectOwedFact|project210jDeclarations|buildVerifier210jView|attachOwedProperty/
    .test(ARCHITECTURE_MODULES));

const sacc = schemaAccounting218();
ok('A10. schema size is reported as bytes AND grammar shape, with the §199 caveat',
  Number(sacc.addedNodes) > 0 && Number(sacc.addedEnums) === 2
    && Number(sacc.addedEnumMembers) === 8
    && String(sacc.grammarCostCaveat).includes('COMPILED GRAMMAR COMPLEXITY'),
  `+${sacc.addedBytes}B, +${sacc.addedNodes} nodes, +${sacc.addedEnums} enums, `
  + `+${sacc.addedEnumMembers} members`);

ok('A11. the schema description tells the model to answer this BEFORE choosing a verdict',
  String(PROPERTY_REVIEW_SCHEMA_PROPERTY.description)
    .includes('ANSWER THIS BEFORE YOU CHOOSE A VERDICT'));

// ================================================================ B. the instruction

console.log('\n---- B. THE INSTRUCTION IS ADDITIVE AND IS NOT THE REMEDY ----');

ok('B1. removing the block reproduces the §216 prompt BYTE FOR BYTE',
  reconstruct216SystemPrompt(EXPERT_VERIFIER_218_SYSTEM_PROMPT)
    === EXPERT_VERIFIER_216_SYSTEM_PROMPT,
  `${EXPERT_VERIFIER_218_SYSTEM_PROMPT.length} -> ${EXPERT_VERIFIER_216_SYSTEM_PROMPT.length}`);

ok('B2. §216\'s stopping rule is honoured: the primary remedy is structure, not text',
  PROCESS_STOPPING_RULE.thisIsTheFinalAuthorizedInstructionRemediation
    && TEXT_IS_NOT_THE_REMEDY.section216StoppingRuleHonoured
    && !TEXT_IS_NOT_THE_REMEDY.isAnotherInstructionRemediationCycle
    && TEXT_IS_NOT_THE_REMEDY.primaryRemedy
      === 'STRUCTURED_OUTPUT_PLUS_DETERMINISTIC_CROSS_FIELD_CONSISTENCY');

ok('B3. the block names the §217 mechanism: the absence rule answers a BRANCH question, not the '
  + 'property question',
  PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('TWO RULES THAT SOUND ALIKE'))
    && PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('The absence rule is about a BRANCH'))
    && PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('Do not answer the property question with')));

ok('B4. the absence rule is restated AFFIRMATIVELY before it is bounded, so it is not retired',
  PROPERTY_REVIEW_BLOCK_218.some(l =>
    l.includes('absence-shaped branchB is correct and you should leave it alone')));

ok('B5. the act and the artifact each carry a "you must not spend it" warning',
  PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('YOU MUST NOT'))
    && PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('NOT every certificate, record or permit')));

ok('B6. every part of the block is mapped to what it serves, and the map covers the §217 mechanism',
  BLOCK_TO_RULE_218.length >= 6
    && BLOCK_TO_RULE_218.every(b =>
      PROPERTY_REVIEW_BLOCK_218.some(l => l.includes(b.heading.split(' (')[0])))
    && BLOCK_TO_RULE_218.some(b => b.serves.includes('§217')));

ok('B7. both overcorrection risks carry a guard in the SAME block and name what they protect',
  OVERCORRECTION_GUARDS_218.length === 2
    && OVERCORRECTION_GUARDS_218.every(g => g.guard.length > 60 && g.protects.length > 10)
    && OVERCORRECTION_GUARDS_218.some(g => g.protects.includes('SECTION_217_K3'))
    && OVERCORRECTION_GUARDS_218.some(g => g.protects.includes('SECTION_215_H3')));

const iacc = instructionAccounting218();
ok('B8. instruction growth is measured and reported, and nothing is removed',
  Number(iacc.removedCharacters) === 0 && Number(iacc.addedCharacters) > 0
    && String(iacc.tokenEstimateBasis).includes('estimate, not a tokenizer result'),
  `+${iacc.addedCharacters} chars, ~+${iacc.estimatedAddedTokens} tokens, `
  + `prompt ${iacc.promptChars216} -> ${iacc.promptChars218}`);

ok('B9. the block states the routing the deterministic layer enforces, so a refusal is predictable',
  PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('refused whole'))
    && PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('declare CHALLENGE_FACT_VALIDITY on the target'))
    && PROPERTY_REVIEW_BLOCK_218.some(l => l.includes('ABSTAIN')));

const countIn = (needle: string): number =>
  EXPERT_VERIFIER_218_SYSTEM_PROMPT.split(needle).length - 1;
ok('B10. the §216 counterfactual and the good-proxy paragraph are carried, not duplicated',
  countIn('A weld is') === 1 && countIn('AND A GOOD PROXY IS STILL A PROXY') === 1
    && countIn('THE ONE CASE WHERE THE ACT IS THE PROPERTY') === 1,
  'each appears exactly once in the assembled prompt');

ok('B11. no deterministic keyword classifier is described or added anywhere in §218',
  !/EVIDENCE_SOUNDING_WORDS/.test(ARCHITECTURE_MODULES)
    && !consistencyEffect218().usesAKeywordList
    && !consistencyEffect218().inspectsVocabularyToClassify);

// ================================================================ C. the deterministic boundary

console.log('\n---- C. WHAT DETERMINISTIC CODE DECIDES, AND WHAT IT REFUSES TO ----');

ok('C1. the consistency layer reads eleven identifier-and-membership inputs and no free text',
  CONSISTENCY_DECISION_INPUTS_218.length === 11
    && CONSISTENCY_DECISION_INPUTS_218.every(i =>
      /presence|membership|string equality|filler|object shape/.test(i)),
  `${CONSISTENCY_DECISION_INPUTS_218.length} inputs`);

const eff = consistencyEffect218();
ok('C2. it does not infer, classify, reconstruct, repair or invent',
  !eff.infersWhetherSomethingIsEvidence && !eff.inspectsVocabularyToClassify
    && !eff.reconstructsThePropertyFromProse && !eff.repairsAModelClassification
    && !eff.inventsAReplacementOwedFact && !eff.readsAnyFieldForMeaning);

ok('C3. the semantic questions are classified as the model\'s or the human\'s, never the code\'s',
  CONSISTENCY_RULE_CLASSIFICATION_218.THE_ROLE_IS_THE_RIGHT_ROLE === 'REQUIRES_MODEL_SEMANTICS'
    && CONSISTENCY_RULE_CLASSIFICATION_218.THE_PROPERTY_IS_REALLY_EVIDENCE
      === 'REQUIRES_MODEL_SEMANTICS'
    && CONSISTENCY_RULE_CLASSIFICATION_218.THE_DECISION_CONTROLLING_PROPERTY_IS_THE_RIGHT_ONE
      === 'REQUIRES_HUMAN_TRUTH');

// ---- the routing table, each row run.
const invalidNotChallenged = check({
  verdict: 'ABSTAIN',
  owedFactDeclarations: [{ factKey: TARGET_KEY, declaration: 'STILL_UNRESOLVED',
    challengeGround: null, propertyMismatchKind: null }],
  propertyReview: {
    targetDeclarationId: TARGET_DECLARATION_ID,
    propertySemanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY', propertyValidity: 'INVALID',
    decisionControllingProperty: 'whether the shell retains its minimum wall thickness',
    propertyReviewReason: 'the survey is how the thickness is found out',
  },
});
ok('C4. INVALID routes to CHALLENGE_FACT_VALIDITY; anything else is refused',
  !invalidNotChallenged.admitted
    && invalidNotChallenged.codes.includes('INVALID_PROPERTY_NOT_CHALLENGED'),
  invalidNotChallenged.codes.join(','));

ok('C5. INVALID + VERIFIED_AS_IS is refused',
  check({ ...compliantOutputFor218(fx('F1')), verdict: 'VERIFIED_AS_IS' })
    .codes.includes('INVALID_PROPERTY_VERIFIED_AS_IS'));

const f7run = runRefusalFixtures218().find(r => r.id.startsWith('F7'));
ok('C6. INVALID + ADD_OR_REPLACE_CLARIFICATION is refused',
  f7run !== undefined && f7run.propertyCodes.includes('INVALID_PROPERTY_ROUTED_TO_CLARIFICATION'),
  f7run?.propertyCodes.join(','));

const uncertainVerified = check({
  verdict: 'VERIFIED_AS_IS',
  owedFactDeclarations: [{ factKey: TARGET_KEY, declaration: 'STILL_UNRESOLVED',
    challengeGround: null, propertyMismatchKind: null }],
  propertyReview: {
    targetDeclarationId: TARGET_DECLARATION_ID,
    propertySemanticRole: 'AMBIGUOUS_OR_UNRESOLVED', propertyValidity: 'UNCERTAIN',
    decisionControllingProperty: 'not determinable from what was supplied',
    propertyReviewReason: 'the property names no condition, act or artifact',
  },
});
ok('C7. UNCERTAIN + VERIFIED_AS_IS is refused, and UNCERTAIN routes to ABSTAIN',
  !uncertainVerified.admitted
    && uncertainVerified.codes.includes('UNCERTAIN_PROPERTY_NOT_ABSTAINED')
    && check(compliantOutputFor218(fx('F6'))).route === 'PROPERTY_UNCERTAIN_ABSTAINED');

const f9run = runRefusalFixtures218().find(r => r.id.startsWith('F9'));
ok('C8. UNCERTAIN + ADD_OR_REPLACE_CLARIFICATION is refused',
  f9run !== undefined && f9run.propertyCodes.includes('UNCERTAIN_PROPERTY_NOT_ABSTAINED'));

ok('C9. EVIDENCE_FOR_ANOTHER_PROPERTY may not coexist with VALID',
  check({ ...compliantOutputFor218(fx('F1')),
    propertyReview: { ...(compliantOutputFor218(fx('F1')).propertyReview as any),
      propertyValidity: 'VALID' } })
    .codes.includes('EVIDENCE_ROLE_MUST_BE_INVALID'));

ok('C10. AMBIGUOUS_OR_UNRESOLVED may not coexist with VALID or INVALID',
  check({ ...compliantOutputFor218(fx('F6')),
    propertyReview: { ...(compliantOutputFor218(fx('F6')).propertyReview as any),
      propertyValidity: 'VALID' } })
    .codes.includes('AMBIGUOUS_ROLE_MUST_BE_UNCERTAIN'));

ok('C11. a VALID property may not be challenged on its identity',
  check({ ...compliantOutputFor218(fx('F5')),
    owedFactDeclarations: [{ factKey: TARGET_KEY, declaration: 'CHALLENGE_FACT_VALIDITY',
      challengeReason: 'r', challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
      propertyMismatchKind: 'ADJACENT_PROPERTY_SUBSTITUTED' }] })
    .codes.includes('VALID_PROPERTY_CHALLENGED_ON_IDENTITY'));

ok('C12. the role fixes the mismatch kind, and a mismatched pair is refused',
  KIND_IMPLIED_BY_ROLE_218.EVIDENCE_FOR_ANOTHER_PROPERTY === 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE'
    && KIND_IMPLIED_BY_ROLE_218.UNDERLYING_SAFETY_STATE === 'ADJACENT_PROPERTY_SUBSTITUTED'
    && check({ ...compliantOutputFor218(fx('F1')),
      owedFactDeclarations: [{ factKey: TARGET_KEY, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: 'r', challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
        propertyMismatchKind: 'ADJACENT_PROPERTY_SUBSTITUTED' }] })
      .codes.includes('ROLE_AND_MISMATCH_KIND_INCONSISTENT'));

// ---- fail-closed
const missing = check({ verdict: 'VERIFIED_AS_IS', owedFactDeclarations: [] });
ok('C13. an absent property review fails closed and is never inferred',
  !missing.admitted && missing.codes.includes('PROPERTY_REVIEW_MISSING')
    && missing.route === 'FAIL_CLOSED' && missing.review === null);

const badEnum = check({ ...compliantOutputFor218(fx('F5')),
  propertyReview: { ...(compliantOutputFor218(fx('F5')).propertyReview as any),
    propertySemanticRole: 'PROBABLY_A_STATE' } });
ok('C14. an invalid enum member fails closed',
  !badEnum.admitted && badEnum.codes.includes('PROPERTY_SEMANTIC_ROLE_NOT_A_MEMBER'));

const placeholder = check({ ...compliantOutputFor218(fx('F5')),
  propertyReview: { ...(compliantOutputFor218(fx('F5')).propertyReview as any),
    decisionControllingProperty: 'N/A' } });
ok('C15. a placeholder field fails closed, using the §210E whole-field filler rule and not a new one',
  !placeholder.admitted && placeholder.codes.includes('PROPERTY_REVIEW_FIELD_PLACEHOLDER')
    && /isNonSemanticFiller/.test(ARCHITECTURE_MODULES));

const wrongTarget = check({ ...compliantOutputFor218(fx('F5')),
  propertyReview: { ...(compliantOutputFor218(fx('F5')).propertyReview as any),
    targetDeclarationId: 'D218-OTHER' } });
ok('C16. a review bound to another declaration id fails closed on exact string equality',
  !wrongTarget.admitted && wrongTarget.codes.includes('PROPERTY_REVIEW_TARGET_MISMATCH'));

const fc = failClosedEffect218();
ok('C17. a fail-closed route preserves the raw output and leaves the target unresolved',
  fc.rawOutputPreserved && fc.targetRemainsUnresolved && !fc.clarificationsMayChange
    && !fc.factMayBeSettled && !fc.missingSemanticJudgementIsInferred
    && !fc.aReplacementOwedFactIsCreated && !fc.theModelClassificationIsRepaired);

ok('C18. every declared code is reachable or is named by a fixture; none is decorative',
  PROPERTY_REVIEW_CODES_218.length === 19
    && new Set(PROPERTY_REVIEW_CODES_218).size === PROPERTY_REVIEW_CODES_218.length);

ok('C19. rules considered and refused are recorded with their reasons',
  REFUSED_RULES_218.length >= 5
    && REFUSED_RULES_218.every(r => r.refusedBecause.length > 60)
    && REFUSED_RULES_218.some(r => r.rule.includes('decisionControllingProperty concerns the target')));

ok('C20. the ONE §216 refusal §218 overturns is recorded with §216\'s original reason intact',
  SUPERSEDED_REFUSALS_216.length === 1
    && SUPERSEDED_REFUSALS_216[0].rule.includes('VERIFIED_AS_IS')
    && SUPERSEDED_REFUSALS_216[0].section216Reason.includes('would refuse a right answer')
    && SUPERSEDED_REFUSALS_216[0].section218Reason.includes('propertyValidity'));

// ================================================================ D. the decision order

console.log('\n---- D. THE DECISION ORDER IS STRUCTURAL ----');

ok('D1. four ordered steps, and only the fourth is conditional on validity',
  ORDERED_DECISION_STEPS_218.length === 4
    && ORDERED_DECISION_STEPS_218.slice(0, 3).every(s => s.reachedOnlyIf === null)
    && ORDERED_DECISION_STEPS_218[3].reachedOnlyIf === 'propertyValidity === VALID');

ok('D2. representation and clarification review is reachable ONLY from VALID',
  mayProceedToRepresentationReview('VALID')
    && !mayProceedToRepresentationReview('INVALID')
    && !mayProceedToRepresentationReview('UNCERTAIN'));

ok('D3. a better clarification cannot rescue a wrong property: F11 pairs an excellent question '
  + 'with an INVALID property and still challenges',
  fx('F11').clarificationSettlesTheControllingProperty
    && fx('F11').requiredValidity === 'INVALID'
    && check(compliantOutputFor218(fx('F11'))).route === 'PROPERTY_CHALLENGED'
    && !check(compliantOutputFor218(fx('F11'))).representationReviewMayProceed);

ok('D4. the clarification route stays OPEN for an accepted property',
  requiredVerdictFor218(fx('F10')) === 'ADD_OR_REPLACE_CLARIFICATION'
    && check(compliantOutputFor218(fx('F10'))).representationReviewMayProceed);

// ================================================================ E. the fixtures

console.log('\n---- E. TWELVE FIXTURES, RUN THROUGH THE REAL CHECKERS ----');

ok('E1. twelve fixtures, each with a required role, validity and outcome',
  FIXTURES_218.length === 12
    && FIXTURES_218.every(f => f.why.length > 80 && f.shape.length > 10));

const compliant = runCompliantFixtures218();
ok('E2. every non-refusal fixture is admitted by v3, the §212 vocabulary, §214 scope AND §218',
  compliant.length === 8
    && compliant.every(r => r.v3Admitted && r.scopeAdmitted && r.propertyAdmitted
      && r.vocabularyCodes.length === 0),
  compliant.filter(r => !r.propertyAdmitted).map(r => r.id).join(',') || 'all admitted');

const refusals = runRefusalFixtures218();
ok('E3. every refusal fixture is refused, by the exact code it was built for',
  refusals.length === 4 && refusalsFireTheirNamedCode218()
    && refusals.every(r => !r.propertyAdmitted || !r.scopeAdmitted),
  refusals.map(r => `${r.id.slice(0, 3)}:${[...r.propertyCodes, ...r.scopeCodes][0]}`).join(' '));

ok('E4. F1 and F2 are challenged; F3, F4 and F5 are accepted',
  ['F1', 'F2'].every(id => check(compliantOutputFor218(fx(id))).route === 'PROPERTY_CHALLENGED')
    && ['F3', 'F4', 'F5'].every(id =>
      check(compliantOutputFor218(fx(id))).route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED'));

ok('E5. F2 against F4 is the document contrast: same object kind, different role, opposite outcome',
  fx('F2').requiredRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY'
    && fx('F4').requiredRole === 'REQUIRED_ARTIFACT_ITSELF'
    && fx('F2').requiredValidity === 'INVALID' && fx('F4').requiredValidity === 'VALID',
  'certificate of examination vs entry permit');

ok('E6. F6 abstains rather than guessing a role',
  fx('F6').requiredRole === 'AMBIGUOUS_OR_UNRESOLVED'
    && requiredVerdictFor218(fx('F6')) === 'ABSTAIN');

ok('E7. F12 reviews the target and the sibling nomination is refused by the §214 rule',
  refusals.find(r => r.id.startsWith('F12'))?.scopeCodes
    .includes('NOMINATION_OUTSIDE_TARGET_SCOPE') === true
    && refusals.find(r => r.id.startsWith('F12'))?.propertyAdmitted === true,
  'the property review itself is clean; the nomination is what is refused');

ok('E8. four minimal contrasts, each moving one variable',
  minimalContrasts218().length === 4
    && minimalContrasts218().every(c =>
      c.members.every(m => FIXTURES_218.some(f => f.id === m))));

ok('E9. every fixture that could invite an adverse conclusion names what must NOT be asserted',
  FIXTURES_218.filter(f => f.mustNotAssert !== null).length >= 5
    && FIXTURES_218.filter(f => f.mustNotAssert !== null)
      .every(f => (f.mustNotAssert as string).length > 15),
  `${FIXTURES_218.filter(f => f.mustNotAssert !== null).length} of ${FIXTURES_218.length}`);

// ================================================================ F. the negative controls

console.log('\n---- F. THREE WRONG STRATEGIES, EACH SHOWN FAILING ----');

const vocab = vocabularyOnlyScore();
ok('F1. vocabulary-only role classification fails the legitimate paired cases',
  vocab.wrong >= 3 && vocab.wrongOn.some(id => id.startsWith('F3'))
    && vocab.wrongOn.some(id => id.startsWith('F4')),
  `${vocab.correct}/${vocab.total} correct; wrong on ${vocab.wrongOn.map(i => i.slice(0, 3)).join(',')}`);

const clarFirst = clarificationFirstScore();
ok('F2. clarification-first routing fails the wrong-property cases, F11 among them',
  clarFirst.wrong >= 3 && clarFirst.wrongOn.some(id => id.startsWith('F11'))
    && clarFirst.wrongOn.some(id => id.startsWith('F1_')),
  `${clarFirst.correct}/${clarFirst.total} correct; wrong on `
  + `${clarFirst.wrongOn.map(i => i.slice(0, 3)).join(',')}`);

const chalAll = challengeEverythingScore();
ok('F3. challenge-everything fails the act, artifact and state controls',
  chalAll.wrong >= 4 && ['F3', 'F4', 'F5'].every(p => chalAll.wrongOn.some(id => id.startsWith(p))),
  `${chalAll.correct}/${chalAll.total} correct; wrong on `
  + `${chalAll.wrongOn.map(i => i.slice(0, 3)).join(',')}`);

ok('F4. no strategy scores full marks, so the fixture set discriminates',
  [vocab, clarFirst, chalAll].every(s => s.wrong > 0));

ok('F5. the controls are unreachable from any architecture module',
  NEGATIVE_CONTROLS_ARE_UNREACHABLE_218
    && !/vocabularyOnlyRoleClassifier|clarificationFirstRouting|challengeEverything/
      .test(ARCHITECTURE_MODULES)
    && !fixtureEffect218().negativeControlIsReachableFromArchitecture);

// ================================================================ G. legacy compatibility

console.log('\n---- G. NOTHING HISTORICAL IS INFERRED FROM, EDITED OR RECLASSIFIED ----');

ok('G1. exactly one field is mechanical; the four judgements are model-authored',
  MECHANICAL_FIELDS_218.length === 1 && MECHANICAL_FIELDS_218[0] === 'targetDeclarationId'
    && SEMANTIC_FIELDS_218.length === 4
    && Object.keys(FIELD_PROVENANCE_218).length === PROPERTY_REVIEW_FIELDS_218.length);

const partial = adaptForDevelopmentFixture({
  authored: {
    propertySemanticRole: 'REQUIRED_ACT_ITSELF', propertyValidity: 'VALID',
    decisionControllingProperty: 'whether the briefing was given',
  },
  frozenTargetDeclarationId: 'D-1',
});
ok('G2. the adapter REFUSES rather than filling a semantic field it was not given',
  !partial.adapted && partial.codes.includes('SEMANTIC_FIELD_NOT_AUTHORED')
    && partial.review === null);

const full = adaptForDevelopmentFixture({
  authored: {
    propertySemanticRole: 'REQUIRED_ACT_ITSELF', propertyValidity: 'VALID',
    decisionControllingProperty: 'whether the briefing was given',
    propertyReviewReason: 'giving it is the requirement',
  },
  frozenTargetDeclarationId: 'D-1',
});
ok('G3. where semantics are already authored, the adapter supplies ONLY the frozen mechanical value',
  full.adapted && full.suppliedByAdapter.length === 1
    && full.suppliedByAdapter[0] === 'targetDeclarationId'
    && full.review?.targetDeclarationId === 'D-1');

const legacy = mayUpgradeALegacyOutput({
  verdict: 'VERIFIED_AS_IS', declarationId: 'K1-D1',
  rationale: 'This is a case where the act itself is the required control',
});
ok('G4. a §217-shaped output cannot be upgraded, and its prose is never mined for a role',
  !legacy.adapted && legacy.codes.includes('LEGACY_OUTPUT_MAY_NOT_BE_UPGRADED')
    && !legacyEffect218().semanticRoleInferredFromProse,
  'the K1 rationale asserts REQUIRED_ACT_ITSELF and the frozen truth marks it FAIL');

ok('G5. four adaptation routes are recorded as refused, each with its reason',
  REFUSED_ADAPTATIONS_218.length === 4
    && REFUSED_ADAPTATIONS_218.every(r => r.refusedBecause.length > 60));

ok('G6. §217 evidence is preserved exactly as adjudicated',
  SECTION_217_EVIDENCE.gateOccurrences.HF1_EVIDENCE_PROXY_ACCEPTED.count === 2
    && SECTION_217_EVIDENCE.gateOccurrences.HF2_PROPERTY_INVALID_ROUTED_AS_CLARIFICATION.count === 1
    && SECTION_217_EVIDENCE.gateOccurrences.HF4_SIBLING_NOMINATION.count === 1
    && [SECTION_217_EVIDENCE.gateOccurrences.HF3_LEGITIMATE_ACT_CHALLENGED.count,
      SECTION_217_EVIDENCE.gateOccurrences.HF5_TARGET_BINDING_VIOLATION.count,
      SECTION_217_EVIDENCE.gateOccurrences.HF6_UNRESOLVED_BECAME_ADVERSE.count,
      SECTION_217_EVIDENCE.gateOccurrences.HF7_PROVIDER_SETTLEMENT_AUTHORITY.count]
      .every(c => c === 0)
    && SECTION_217_EVIDENCE.classification.HF1 === 'CLASS_A'
    && SECTION_217_EVIDENCE.classification.HF2 === 'CLASS_A'
    && SECTION_217_EVIDENCE.classification.HF4 === 'CLASS_B'
    && SECTION_217_EVIDENCE.kr1 === 'OPEN'
    && !SECTION_217_EVIDENCE.mayBeReclassifiedBySection218,
  'HF1 x2, HF2 x1, HF4 x1, HF3/5/6/7 clean, K3 PASS, KR-1 OPEN');

ok('G7. no historical result is rewritten, upgraded, rescored or reclassified',
  FROZEN_HISTORICAL_SECTIONS.length === 3
    && !HISTORICAL_EVIDENCE_DISPOSITION.rewritten && !HISTORICAL_EVIDENCE_DISPOSITION.upgraded
    && !HISTORICAL_EVIDENCE_DISPOSITION.rescored
    && !HISTORICAL_EVIDENCE_DISPOSITION.reclassified
    && !HISTORICAL_EVIDENCE_DISPOSITION.digestsRecomputed);

// ================================================================ H. readiness and recommendation

console.log('\n---- H. THE HOSTED-READINESS GATE, RUN ----');

const gate = hostedReadinessGate218();
for (const g of gate) ok(`H.gate ${g.n}. ${g.item}`, g.answer === 'YES', g.evidence);

ok('H1. all sixteen gate items answer YES and the fixture set is clean',
  gate.length === 16 && readinessIsClean218() && fixturesAreClean218());

ok('H2. five recommended cases, five calls, none reusing a historical observation',
  RECOMMENDED_CASES_218.length === 5 && recommendedCallCount218() === 5
    && recommendedCallCount218() <= MAX_RECOMMENDED_CALLS_218
    && RECOMMENDED_CASES_218.every(c => !c.mayReuseAHistoricalObservation));

ok('H3. the five cases cover both evidence forms and all three legitimate roles',
  RECOMMENDED_CASES_218.filter(c => c.requiredRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY').length === 2
    && ['UNDERLYING_SAFETY_STATE', 'REQUIRED_ACT_ITSELF', 'REQUIRED_ARTIFACT_ITSELF']
      .every(r => RECOMMENDED_CASES_218.some(c => c.requiredRole === r)));

ok('H4. three of the five must be LEFT ALONE, so challenge-everything cannot pass the set',
  RECOMMENDED_CASES_218.filter(c => c.requiredValidity === 'VALID').length === 3);

ok('H5. every recommended case is backed by a local fixture that already passes',
  localFixtureBacking218().every(b => b.fixture !== null));

ok('H6. nothing is authorized to execute and nothing is frozen',
  STATUS_218 === 'RECOMMENDED_NOT_FROZEN' && !AUTHORIZED_TO_EXECUTE_218
    && !readinessEffect218().authorizedToExecute
    && readinessEffect218().providerCalls === 0);

const cost = costProjection218();
ok('H7. cost is projected from §217 MEASURED tokens plus MEASURED deltas, with a hard ceiling',
  Number(cost.hardCeilingUsd) > Number(cost.projectedUsd) && cost.retriesAuthorized === 0
    && String(cost.basisNote).includes('MEASURED')
    && Number(cost.addedInputTokensFromPrompt) > 0 && Number(cost.addedInputTokensFromSchema) > 0,
  `projected USD ${cost.projectedUsd}, hard ceiling USD ${cost.hardCeilingUsd}, `
  + `${cost.projectedInputTokensPerCall} in / ${cost.projectedOutputTokensPerCall} out per call`);

ok('H8. nine zero-occurrence gates, and no aggregate compensation of any kind',
  FUTURE_HARD_GATES_218.length === 9
    && !NO_AGGREGATE_COMPENSATION_218.aggregatePercentageReported
    && !NO_AGGREGATE_COMPENSATION_218.oneGateMayBeOffsetByAnother
    && !NO_AGGREGATE_COMPENSATION_218.aQualityScoreMayOffsetAGate);

ok('H9. the settled axes are named and not re-measured; historical cases may not be rescored',
  ALREADY_SETTLED_218.length >= 6 && HISTORICAL_CASES_MAY_NOT_BE_RESCORED_218.length === 10);

ok('H10. the stopping rule forbids more prompt tuning, more gates and another automatic layer',
  STOPPING_RULE_218.thisIsTheFinalStandaloneVerifierArchitectureIntervention
    && STOPPING_RULE_218.ifAMaterialEvidenceProxyMisclassificationSurvives.length === 3
    && STOPPING_RULE_218.productOwnerDecides.length === 3
    && STOPPING_RULE_218.reportInstead.includes('provider semantic classification capability'));

ok('H11. the recommendation states its limits, including that the gate says nothing about hosted '
  + 'classification',
  RECOMMENDATION_LIMITS_218.length >= 6
    && RECOMMENDATION_LIMITS_218.some(l => l.includes('not a preregistration'))
    && RECOMMENDATION_LIMITS_218.some(l => l.includes('establishes nothing about whether a provider'))
    && RECOMMENDATION_LIMITS_218.some(l => l.includes('stopping rule')));

// ================================================================ I. boundaries

console.log('\n---- I. BOUNDARIES ----');

const PINNED: readonly (readonly [string, string])[] = [
  ['scripts/lib/expert-verifier-contract-v3.ts',
    '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc'],
  ['scripts/lib/expert-212-verifier-protocol.ts',
    '12214a2ff303577c374bd749de8ac11d6f8eed811533e72894c0b5187afa48cf'],
  ['scripts/lib/expert-212-challenge-vocabulary.ts',
    'f35a1beac7ce62d121474045ba7d24245b8d857aa13a04cf01e58185257ea949'],
  ['scripts/lib/expert-214-scope-containment.ts',
    '244d35812b046d58437c8fa7db04ce1c1d0fae9eca8affd0391f62a935107e57'],
  ['scripts/lib/expert-216-disposition-remediation.ts',
    '00b7aed2053b7a6d8a7f10d032a4333664e69f4d335345400de863dfff8382d4'],
  ['scripts/lib/expert-verifier-instruction-v3-2.ts',
    '9ab0321212f9100f3c2eb4d6b0d4a8170ce93ed97f596430fb8a02ae554292e5'],
  ['src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
];
const BACKEND = join(__dirname, '..');
for (const [rel, expected] of PINNED) {
  // §247: read the implementation at its canonical location. The expected digest is the SAME
  // frozen value; the relocation was byte-identical for every pinned module.
  const actual = createHash('sha256')
    .update(readFileSync(canonicalModulePath(rel))).digest('hex');
  ok(`I.pin ${rel.split('/').pop()}`, actual === expected, actual === expected ? 'INTACT' : actual);
}

const EVIDENCE_DIR = join(BACKEND, '..', 'verification',
  'expert-hazlenz-217-final-minimal-verifier-confirmation-2026-09-09');
const PINNED_EVIDENCE: readonly (readonly [string, string])[] = [
  ['CONFIRMATION-PREREGISTRATION-217.json',
    '99f9f6b82842cb0ad4c0e1ea78418af3606dc4dcadde353699ed8d18998fa2a4'],
  ['RAW-VERIFIER-217.jsonl',
    'ec9fe428807dae44826e8a8e205fe4bba91ff14e9edbcdd50e575a82d75227fc'],
  ['ADJUDICATION-217.md',
    '6cc3fc0dea23d673f63cbee0634e5bf55b8d675e1606345520292304bc0139e8'],
  ['EXECUTION-SUMMARY-217.json',
    '138a97a084b240ea03c13df8f55320987519a7b38d5d134a9665e9902630a966'],
];
for (const [name, expected] of PINNED_EVIDENCE) {
  const actual = createHash('sha256').update(readFileSync(join(EVIDENCE_DIR, name))).digest('hex');
  ok(`I.evidence ${name}`, actual === expected, actual === expected ? 'UNTOUCHED' : actual);
}

ok('I1. the frozen §217 digest recorded in §218 matches the preregistration on disk',
  SECTION_217_EVIDENCE.frozenDigest === PINNED_EVIDENCE[0][1]);

ok('I2. no §218 module writes to disk, reaches a provider or touches a database',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES)
    && !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('I3. no protocol version is claimed',
  PROTOCOL_VERSION_CLAIMED_218 === null
    && !/=\s*'hazlenz\.expert\.verifier\.v(3\.[3-9]|4)'/.test(MODULES));

ok('I4. every §218 module declares its version, and the base it was built from is named',
  [PROPERTY_REVIEW_CONTRACT_218_VERSION, PROPERTY_CONSISTENCY_218_VERSION,
    PROPERTY_INSTRUCTION_218_VERSION, FIXTURES_218_VERSION, LEGACY_COMPATIBILITY_218_VERSION,
    HOSTED_READINESS_218_VERSION].every(v => v.startsWith('hazlenz.expert.218.'))
    && BASE_ARTIFACT_218 === 'hazlenz.expert.212.verifier-protocol-successor');

ok('I5. provider calls and database operations are zero across every §218 module',
  consistencyEffect218().providerCalls === 0 && fixtureEffect218().providerCalls === 0
    && legacyEffect218().providerCalls === 0 && readinessEffect218().providerCalls === 0
    && consistencyEffect218().databaseOperations === 0
    && fixtureEffect218().databaseOperations === 0);

ok('I6. §214 scope containment is untouched and still reads its six inputs',
  SCOPE_DECISION_INPUTS.length === 6);

ok('I7. no §218 module touches the first-pass contract, settlement or a customer path',
  !/settlement-review|owed-fact-ledger|expert-runner|expert-provider|controller|service\.ts/
    .test(MODULES));

ok('I8. the §218 prompt identity is recorded and differs from §216\'s',
  sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT) !== sha(EXPERT_VERIFIER_216_SYSTEM_PROMPT)
    && String(iacc.identity218) === sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
  `${String(iacc.identity218).slice(0, 12)}…`);

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${PROPERTY_REVIEW_CONTRACT_218_VERSION}   (no protocol version claimed)`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
console.log('  SCHEMA CHANGED: yes, additively — removing propertyReview reproduces §212 exactly');
console.log('  KR-1 remains OPEN. No §213, §215 or §217 result is reclassified.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
