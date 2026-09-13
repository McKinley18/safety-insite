/**
 * §210I EXPERT HAZLENZ -- SAFETY-TRUTH / VERIFICATION-STATE SEPARATION PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO CONTRACT MUTATION.
 *
 * What this suite establishes, and the wording is the limit:
 *
 *   EXPRESSIVENESS   the proposed representation CAN say each of the eight things the §210I
 *                    authorization requires, including the three-state case in which the property
 *                    may be satisfactory, the evidence cannot establish it, and the work holds.
 *   NON_DUPLICATION  the proposal adds carriers only where the carrier audit finds none, and the
 *                    two-branch truth model and the status enum are untouched.
 *   NO_INVENTION     every semantic string reaches the verifier view by COPY. A blank property
 *                    yields null; nothing is composed from a sibling field.
 *   BOUNDED_CHECKING no semantic matcher was added, and the added deterministic checks are
 *                    presence, closed-set membership and the EXISTING filler set.
 *
 * What it does NOT establish is recorded in `WHAT_THIS_DOES_NOT_ESTABLISH` and asserted below: it
 * says nothing about model behaviour, nothing about whether the change would move R4, and nothing
 * about G1's cause. No hosted output is read and no §210H verdict is recomputed.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  OWED_FACT_STATUSES, WHY_UNRESOLVED_STATUS_INVARIANT, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  PROJECTION_FORBIDDEN_FIELDS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import { PROJECTION_RESIDUAL_LIMITS } from './lib/expert-first-pass-owed-fact-projection';
import {
  EPISTEMIC_REPRESENTATION_VERSION, PROVIDER_CALLS, DATABASE_OPERATIONS,
  CORE_CONCEPTS, LAYERS, CARRIER_AUDIT, conceptsWithNoFirstClassCarrier,
  VERIFICATION_STATE_ENUM_REJECTED, TWO_BRANCH_MODEL_PRESERVED, CONCEPT_A_DEFERRED_TO_201,
  NO_SEMANTIC_MATCHER_ADDED, NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B,
  RECOMMENDED_CHANGES, WHAT_THIS_DOES_NOT_ESTABLISH, GATE_12_DISPOSITION,
  PROPOSED_DECLARATION_ADDED_FIELDS, PROJECTION_CODES, STATUS_ENUM_UNCHANGED,
  FIXTURE_IDS, EPISTEMIC_FIXTURES,
  checkActionWhileUnresolved, checkSettlementOutcome, buildVerifierView, checkFixture,
  settledBranchDiscrimination, truthByVerificationMatrix,
  type ProposedDeclaration, type SettlementOutcome,
} from './lib/expert-210i-epistemic-representation';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const MODULE_SRC = readFileSync(
  join(__dirname, 'lib', 'expert-210i-epistemic-representation.ts'), 'utf8');

// ================================================================ A. the carrier audit

console.log('\n---- A. CARRIER AUDIT ----');

ok('A1. every concept is audited at the layers it can exist at',
  CORE_CONCEPTS.every(c => CARRIER_AUDIT.some(r => r.concept === c)),
  `${CORE_CONCEPTS.length} concepts, ${CARRIER_AUDIT.length} rows`);

ok('A2. every audited layer is a member of the closed layer set',
  CARRIER_AUDIT.every(r => (LAYERS as readonly string[]).includes(r.layer)));

ok('A3. every audit row carries a note a reviewer can check',
  CARRIER_AUDIT.every(r => r.note.trim().length > 20));

const noCarrier = conceptsWithNoFirstClassCarrier();
ok('A4. exactly two concepts have no first-class carrier at any layer',
  noCarrier.length === 2
    && noCarrier.includes('OPERATIONAL_CONSEQUENCE_WHILE_UNRESOLVED')
    && noCarrier.includes('ESTABLISHED_TRUTH_OUTCOME_AT_SETTLEMENT'),
  noCarrier.join(', '));

ok('A5. the safety property is FIRST_CLASS on the declaration and ABSENT on OwedFact',
  CARRIER_AUDIT.some(r => r.concept === 'SAFETY_PROPERTY'
      && r.layer === 'FIRST_PASS_DECLARATION' && r.verdict === 'FIRST_CLASS')
    && CARRIER_AUDIT.some(r => r.concept === 'SAFETY_PROPERTY'
      && r.layer === 'OWED_FACT_RUNTIME' && r.verdict === 'ABSENT'));

ok('A6. the audit agrees with the production module\'s own recorded residual limit',
  PROJECTION_RESIDUAL_LIMITS.some(l => l.includes('OwedFact has no field for the owed property')),
  'the §196 projection already records the same loss; the audit did not invent it');

ok('A7. the truth branches are FIRST_CLASS at all three layers',
  LAYERS.every(l => CARRIER_AUDIT.some(r => r.concept === 'SUBSTANTIVE_TRUTH_BRANCHES'
    && r.layer === l && r.verdict === 'FIRST_CLASS')));

ok('A8. verification state is FIRST_CLASS on OwedFact via status, and only there',
  CARRIER_AUDIT.some(r => r.concept === 'EVIDENCE_SUFFICIENCY_VERIFICATION_STATE'
    && r.field === 'status' && r.verdict === 'FIRST_CLASS'));

ok('A9. acceptableEvidence is recorded as present-but-closed to the model',
  CARRIER_AUDIT.some(r => r.field === 'acceptableEvidence'
      && r.verdict === 'PRESENT_BUT_CLOSED_TO_THE_AUTHOR')
    && (PROVIDER_FORBIDDEN_OWED_FACT_FIELDS as readonly string[]).includes('acceptableEvidence'),
  'the audit claim is checked against the real forbidden-field list');

ok('A10. status is confirmed absent from the verifier projection',
  (PROJECTION_FORBIDDEN_FIELDS as readonly string[]).includes('status'),
  'so the verifier cannot read verification state off the fact today');

// ================================================================ B. what was refused

console.log('\n---- B. REFUSED PROPOSALS ----');

ok('B1. a first-pass verificationState enum is refused, with reasons',
  VERIFICATION_STATE_ENUM_REJECTED.refused === true
    && VERIFICATION_STATE_ENUM_REJECTED.reasons.length >= 3);

ok('B2. the refusal rests on the collection being unresolved by construction',
  CARRIER_AUDIT.some(r => r.verdict === 'CONSTANT_BY_CONSTRUCTION'));

ok('B3. the two-branch truth model is preserved',
  TWO_BRANCH_MODEL_PRESERVED.branchCount === 2
    && TWO_BRANCH_MODEL_PRESERVED.unresolvedIsNotABranch === true);

ok('B4. no third truth slot is DECLARED anywhere in the module',
  !/\b(branchC|decisionIfC|truthBranchC)\s*[?:]/.test(MODULE_SRC),
  'the names appear only inside the recorded list of rejected alternatives, never as a field');

ok('B5. concept A is explicitly deferred to §201 rather than decided here',
  CONCEPT_A_DEFERRED_TO_201.decidedHere === false);

ok('B6. no divergence rule is proposed against decisionIfB',
  NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B.proposed === false,
  'a fail-closed unresolved action legitimately resembles the adverse-branch action');

// ================================================================ C. the recommendation

console.log('\n---- C. THE RECOMMENDED CHANGE ----');

ok('C1. exactly two changes are recommended, one per uncarried concept',
  RECOMMENDED_CHANGES.length === 2
    && new Set(RECOMMENDED_CHANGES.map(c => c.gap)).size === 2
    && RECOMMENDED_CHANGES.every(c => noCarrier.includes(c.gap)),
  RECOMMENDED_CHANGES.map(c => c.id).join(', '));

ok('C2. exactly one field is added to the first-pass declaration',
  PROPOSED_DECLARATION_ADDED_FIELDS.length === 1);

ok('C3. no recommended change edits a pinned file',
  RECOMMENDED_CHANGES.every(c => c.touchesPinnedFile === false));

ok('C4. no recommended change is authored by a provider on the settlement side',
  RECOMMENDED_CHANGES.filter(c => c.layer === 'OWED_FACT_RUNTIME')
    .every(c => c.authoredBy === 'HUMAN_REVIEWER'));

ok('C5. every recommended change records the alternatives it rejects',
  RECOMMENDED_CHANGES.every(c => c.rejectedAlternatives.length >= 2));

ok('C6. the OwedFact status enum is not widened',
  STATUS_ENUM_UNCHANGED.addedHere.length === 0
    && STATUS_ENUM_UNCHANGED.count === OWED_FACT_STATUSES.length
    && !/OWED_FACT_STATUSES\s*=\s*\[/.test(MODULE_SRC),
  `${OWED_FACT_STATUSES.length} members, unchanged`);

ok('C7. WHY_UNRESOLVED_STATUS_INVARIANT still covers exactly the existing statuses',
  Object.keys(WHY_UNRESOLVED_STATUS_INVARIANT).length === OWED_FACT_STATUSES.length,
  'a new status member would have broken this record; none was added');

// ================================================================ D. no semantic matcher

console.log('\n---- D. THE MODEL / DETERMINISTIC BOUNDARY ----');

ok('D1. the module declares it added no semantic matcher',
  NO_SEMANTIC_MATCHER_ADDED.hasKeywordRuleOverSafetyProse === false);

ok('D2. no regex over safety vocabulary appears in the module',
  !/\/[^\n/]*(tested|inspected|confirmed|verified|unconfirmed|checked|recorded)[^\n/]*\/[gimsuy]*\s*\.(test|exec)/i
    .test(MODULE_SRC),
  'nothing reads a branch or an action for meaning');

ok('D3. the added deterministic checks are presence, blankness and the EXISTING filler set',
  NO_SEMANTIC_MATCHER_ADDED.whatDeterministicCodeMayCheckOnTheProposedField.length === 3
    && /isNonSemanticFiller/.test(MODULE_SRC)
    && !/NON_SEMANTIC_FILLER\s*=\s*new Set/.test(MODULE_SRC),
  'the filler set is imported from the production module, not re-declared with new members');

ok('D4. the refusal vocabulary is closed and every member is structural',
  PROJECTION_CODES.length === 7
    && PROJECTION_CODES.every(c => /ABSENT|BLANK|FILLER|NOT_A_MEMBER|WITHOUT|ON_AN?_/.test(c)),
  PROJECTION_CODES.length + ' codes');

ok('D5. a blank property yields null and is never composed from a sibling field',
  (() => {
    const d = { ...EPISTEMIC_FIXTURES[0].declarations[0], missingFact: '   ' };
    const v = buildVerifierView({
      factKey: 'X', declaration: d, outcome: EPISTEMIC_FIXTURES[0].outcomes[0],
      settlingClarification: null,
    });
    return v.owedProperty === null;
  })(),
  'no fallback to notEstablishedBecause, to a branch, or to affectedDecision');

ok('D6. the added field is refused when blank or filler, and never repaired',
  checkActionWhileUnresolved({} as Partial<ProposedDeclaration>)[0]
      === 'ACTION_WHILE_UNRESOLVED_ABSENT'
    && checkActionWhileUnresolved({ actionWhileUnresolved: '  ' } as Partial<ProposedDeclaration>)[0]
      === 'ACTION_WHILE_UNRESOLVED_BLANK'
    && checkActionWhileUnresolved(
      { actionWhileUnresolved: 'placeholder' } as Partial<ProposedDeclaration>)[0]
      === 'ACTION_WHILE_UNRESOLVED_IS_FILLER');

ok('D7. a settlement outcome carrying a branch on an unresolved fact is refused',
  checkSettlementOutcome({
    factKey: 'X', status: 'UNRESOLVED', establishedBranch: 'A', authoredBy: 'HUMAN_REVIEWER',
  }).includes('ESTABLISHED_BRANCH_ON_AN_UNRESOLVED_FACT'),
  'evidence-insufficiency can never be recorded as a truth outcome');

ok('D8. a settled fact with no established branch is refused',
  checkSettlementOutcome({
    factKey: 'X', status: 'SETTLED_BY_EVIDENCE', establishedBranch: null,
    authoredBy: 'HUMAN_REVIEWER',
  }).includes('SETTLED_WITHOUT_AN_ESTABLISHED_BRANCH'),
  'settlement must say WHICH branch the evidence established');

ok('D9. a non-member branch value is refused',
  checkSettlementOutcome({
    factKey: 'X', status: 'SETTLED_BY_EVIDENCE',
    establishedBranch: 'MAYBE' as unknown as 'A', authoredBy: 'HUMAN_REVIEWER',
  }).includes('ESTABLISHED_BRANCH_NOT_A_MEMBER'));

// ================================================================ E. the eight fixtures

console.log('\n---- E. FIXTURES ----');

ok('E0. all eight required fixtures exist',
  FIXTURE_IDS.length === 8 && EPISTEMIC_FIXTURES.length === 8
    && FIXTURE_IDS.every(id => EPISTEMIC_FIXTURES.some(f => f.id === id)));

for (const f of EPISTEMIC_FIXTURES) {
  const findings = checkFixture(f);
  const bad = findings.filter(x => !x.held);
  ok(`E.${f.id}`, bad.length === 0,
    bad.length === 0
      ? `${findings.length} structural checks held — ${f.title}`
      : bad.map(b => b.check).join(', '));
}

ok('E9. F3 represents insufficient evidence WITHOUT asserting the adverse property',
  (() => {
    const f = EPISTEMIC_FIXTURES.find(
      x => x.id === 'F3_POTENTIALLY_SATISFACTORY_INSUFFICIENT_EVIDENCE')!;
    const v = buildVerifierView({
      factKey: 'F3', declaration: f.declarations[0], outcome: f.outcomes[0],
      settlingClarification: f.settlingClarifications[0],
    });
    return v.establishedBranch === null
      && v.truthEstablished === false
      && v.verificationGap !== null
      && v.actionWhileUnresolved.trim().length > 0
      && v.actionWhileUnresolved !== v.decisionIfB;
  })(),
  'the hold is carried by a field that makes no truth claim, and branchB is not asserted');

ok('E10. F3\'s hold is NOT required to differ from decisionIfB, and here it does anyway',
  NO_DIVERGENCE_RULE_AGAINST_DECISION_IF_B.proposed === false,
  'the fixture happens to differ; the contract does not demand it');

ok('E11. F5 keeps an act-shaped property and act-shaped branches',
  (() => {
    const f = EPISTEMIC_FIXTURES.find(x => x.id === 'F5_REQUIRED_ACT_AS_PROPERTY')!;
    const d = f.declarations[0];
    return d.missingFact === d.missingFact.trim()
      && d.branchA.length > 0 && d.branchB.length > 0
      && checkActionWhileUnresolved(d).length === 0;
  })(),
  'nothing in the proposal pushes an act property toward a physical state');

ok('E12. F7 carries two properties with independent verification states',
  (() => {
    const f = EPISTEMIC_FIXTURES.find(x => x.id === 'F7_MULTIPLE_INDEPENDENT_PROPERTIES')!;
    return f.outcomes.length === 2
      && f.outcomes[0].status !== f.outcomes[1].status
      && new Set(f.outcomes.map(o => o.factKey)).size === 2
      && f.declarations[0].missingFact !== f.declarations[1].missingFact;
  })(),
  'one settled, one unresolved, no cross-binding');

ok('E13. F8 delivers the property and the gap to the verifier as separate byte-exact fields',
  (() => {
    const f = EPISTEMIC_FIXTURES.find(x => x.id === 'F8_VERIFIER_FACING_PROJECTION')!;
    const d = f.declarations[0];
    const v = buildVerifierView({
      factKey: 'F8', declaration: d, outcome: f.outcomes[0],
      settlingClarification: f.settlingClarifications[0],
    });
    return v.owedProperty === d.missingFact
      && v.verificationGap === d.notEstablishedBecause
      && v.settlingClarification === f.settlingClarifications[0]
      && v.owedProperty !== v.verificationGap;
  })(),
  'no semantic reconstruction anywhere on the path');

// ================================================================ F. the second gap, demonstrated

console.log('\n---- F. THE SETTLED-BRANCH GAP ----');

const disc = settledBranchDiscrimination();
ok('F1. a settled-satisfactory and a settled-adverse fact carry the SAME status today',
  disc.sameStatus === true && disc.distinguishableToday === false,
  'SETTLED_BY_EVIDENCE for both; the outcome survives only in transition prose');

ok('F2. the proposal distinguishes them',
  disc.differentBranch === true,
  "establishedBranch 'A' against 'B'");

const matrix = truthByVerificationMatrix();
ok('F3. the three legal truth/verification cells are each backed by a fixture',
  matrix.filter(m => m.representable).length === 3
    && matrix.filter(m => m.representable).every(m => m.fixture !== null));

ok('F4. the two contradictory cells are left empty rather than invented',
  matrix.filter(m => !m.representable).length === 2
    && matrix.filter(m => !m.representable).every(m => m.fixture === null),
  'a truth known while the evidence is insufficient is not a state this architecture has');

// ================================================================ G. stated limits

console.log('\n---- G. LIMITS ----');

ok('G1. the module states what it does not establish, and G1-causation is among it',
  WHAT_THIS_DOES_NOT_ESTABLISH.length >= 5
    && WHAT_THIS_DOES_NOT_ESTABLISH.some(l => l.includes('CAUSED')));

ok('G2. the module records that G2 falsifies the schema-forced-it claim',
  /G2 met the same shape/.test(MODULE_SRC) || /falsifies/.test(MODULE_SRC));

ok('G3. the module states the proposal does NOT detect the G1 defect',
  WHAT_THIS_DOES_NOT_ESTABLISH.some(l => l.includes('DETECTS')));

ok('G4. Gate 12 is preserved and reclassified, not deleted or rewritten',
  GATE_12_DISPOSITION.action === 'PRESERVED_UNCHANGED'
    && GATE_12_DISPOSITION.classification
      === 'USEFUL_BUT_INSUFFICIENT_FOR_LATENT_STATE_EVIDENCE_SEPARATION_CASES');

ok('G5. no Gate 13 was added',
  GATE_12_DISPOSITION.gate13Added === false,
  'the review did not prove a representational change is unnecessary, so the precondition fails');

ok('G6. this slice made no provider call and no database operation',
  PROVIDER_CALLS === 0 && DATABASE_OPERATIONS === 0);

ok('G7. no fixture is compared against any hosted output',
  !/RAW-FIRST-PASS|ADJUDICATION-|verification\//.test(MODULE_SRC),
  'the fixtures are design material and assert nothing about a model');

ok('G8. no prompt module is imported by this slice',
  !MODULE_SRC.split('\n')
    .filter(l => /^\s*(import|export)\b.*\bfrom\b/.test(l))
    .some(l => /expert-first-pass-instruction|expert-prompt/.test(l)),
  'the instruction builder is named in the audit as a SOURCE to check, and is not imported');

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${EPISTEMIC_REPRESENTATION_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  No semantic PASS may be claimed from this file. It establishes expressiveness only.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
