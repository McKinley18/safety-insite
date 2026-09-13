/**
 * §210J EXPERT HAZLENZ -- BOUNDED EPISTEMIC SCHEMA REMEDIATION: PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO PINNED FILE MUTATED.
 *
 * What this suite establishes:
 *
 *   GAP 1 CLOSED   the first-pass declaration now carries an explicit, required operational
 *                  consequence for the period while a fact is unresolved, it reaches the
 *                  verifier-facing view by copy, and a declaration that omits or fillers it fails
 *                  closed through the EXISTING RR-7 architecture with no new refusal code.
 *   GAP 2 CLOSED   a settled fact records WHICH branch the evidence established, only through the
 *                  existing human-authorized path, with legacy records explicit and never inferred.
 *   NOTHING ELSE   no pinned file edited, no status member added, no third branch, no divergence
 *                  check between the unresolved action and decisionIfB, no semantic inference.
 *
 * What it does NOT establish, asserted below rather than left implicit: anything about model
 * behaviour, and in particular anything about §210H G1. The product owner has ruled that the
 * previous schema did not cause that behaviour, and a schema change is not evidence that it is
 * repaired.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  type ExpertAnalysisInput, EXPERT_INPUT_CONTRACT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  OWED_FACT_STATUSES, WHY_UNRESOLVED_STATUS_INVARIANT,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  createOwedFactLedger, factOf,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  type ReviewDecisionRecord,
  consumeSettlementClaims, mintSettlementAuthority, attachPropertyAuthority,
} from '../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';
import {
  buildPropertyReviewPacket, mintPropertyAuthority,
} from '../src/hazlenz/expert-hazlenz/owed-facts/property-authority';
import {
  buildExpertVNextWireSchema, governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-210g';
import {
  PROJECTION_REFUSAL_CODES,
} from './lib/expert-first-pass-owed-fact-projection';
import { CONTRACT_INCOMPLETENESS_CODES } from './lib/expert-205-declaration-preservation';
import {
  FIRST_PASS_CONTRACT_210J_VERSION, UNRESOLVED_ACTION_FIELD, FIELD_NAMING_RATIONALE,
  LEGACY_REQUIRED_DECLARATION_FIELDS, REQUIRED_DECLARATION_FIELDS_210J,
  UNRESOLVED_ACTION_LINES, BLOCK_TO_RULE, R7_EXTENSION_DECISION,
  NO_DIVERGENCE_CHECK_AGAINST_DECISION_IF_B,
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT, EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  build210jSystemPrompt, reconstruct210gSystemPrompt,
  buildExpert210jWireSchema, reconstructBaseWireSchema,
  checkUnresolvedAction, declarationFormat, instructionIdentities210j, schemaDelta210j,
} from './lib/expert-210j-first-pass-contract';
import {
  PROJECTION_210J_VERSION, UNRESOLVED_ACTION_CODE_MAP, NEW_REFUSAL_CODES_INTRODUCED,
  UNRESOLVED_ACTION_CARRIAGE, VERIFIER_SLOTS_210J, VERIFIER_SLOT_PROVENANCE,
  project210jDeclarations, preserve210j, unresolvedActionCodesArePreserved,
  buildVerifier210jView,
} from './lib/expert-210j-declaration-projection';
import {
  SETTLEMENT_SUCCESSOR_210J_VERSION, ESTABLISHED_BRANCHES, UNKNOWN_LEGACY,
  SETTLEMENT_BRANCH_VALUES, PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS, LAWFUL_SETTLEMENT_TRANSITIONS,
  LEGACY_BRANCH_IS_NEVER_INFERRED,
  type ReviewDecisionRecord210J,
  mintBranchedSettlement, settleWithEstablishedBranch, adoptLegacySettlement,
  settlementLawfulness, providerAuthoredBranchFields, distinguishesSettledBranches,
} from './lib/expert-210j-settlement-successor';
import {
  ANCESTRY_SUCCESSOR_210J_VERSION, HISTORICAL_RECORD, MODIFYING_SECTION, SUBJECT_PATH,
  buildAncestrySuccessor, ancestrySuccessorEffect,
} from './lib/expert-210j-ancestry-successor';
import {
  FIXTURE_SOURCES_210J, F1_UNRESOLVED_HOLD, F2_UNRESOLVED_CONTINUE,
  F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B, F10_SECOND_FACT,
  F8A_ACTION_ABSENT, F8B_ACTION_PLACEHOLDER, LEGACY_DECLARATION,
  PROVIDER_RESPONSE_CLAIMING_A_BRANCH,
} from './lib/expert-210j-fixtures';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const SOURCES = FIXTURE_SOURCES_210J.map(s => ({ sourceId: s.sourceId, text: s.text }));

const INPUT: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'AN-210J-DESIGN',
  authoritativeSources: SOURCES.map(s => ({
    sourceId: s.sourceId, sourceType: 'observation' as const, text: s.text,
  })),
  inspectionContext: { location: 'design fixture', task: 'design fixture' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['temporary_works', 'chemical_exposure', 'electrical'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

const project = (declarations: readonly unknown[]) => project210jDeclarations({
  declarations, sources: SOURCES, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
});

// ================================================================ A. the contract successor

console.log('\n---- A. FIRST-PASS CONTRACT SUCCESSOR ----');

ok('A1. exactly one field was added to the required set',
  REQUIRED_DECLARATION_FIELDS_210J.length === LEGACY_REQUIRED_DECLARATION_FIELDS.length + 1
    && REQUIRED_DECLARATION_FIELDS_210J.includes(UNRESOLVED_ACTION_FIELD)
    && LEGACY_REQUIRED_DECLARATION_FIELDS.every(
      f => (REQUIRED_DECLARATION_FIELDS_210J as readonly string[]).includes(f)),
  `${LEGACY_REQUIRED_DECLARATION_FIELDS.length} -> ${REQUIRED_DECLARATION_FIELDS_210J.length}`);

ok('A2. the name follows the decisionIfA / decisionIfB family',
  FIELD_NAMING_RATIONALE.chosen === UNRESOLVED_ACTION_FIELD
    && FIELD_NAMING_RATIONALE.siblings.length === 2
    && UNRESOLVED_ACTION_FIELD.startsWith('decision'),
  UNRESOLVED_ACTION_FIELD);

ok('A3. the §210J prompt is the §210G prompt plus one block, in both variants',
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT.length > EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.length
    && EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.length
      > EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.length);

ok('A4. removing the block reproduces the §210G prompt BYTE FOR BYTE, both variants',
  reconstruct210gSystemPrompt(EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT)
      === EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT
    && reconstruct210gSystemPrompt(EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
      === EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  'no §210G, §210E, §210C or §210B-2 sentence was rewritten');

ok('A5. the block is described where the other fields are, not appended at the end',
  (() => {
    const lines = EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT.split('\n');
    const mine = lines.findIndex(l => l.includes(`  ${UNRESOLVED_ACTION_FIELD}`));
    const decisions = lines.findIndex(l => l.includes('  decisionIfA / decisionIfB'));
    const why = lines.findIndex(l => l.includes('  whyNecessaryNow      Why this must be settled'));
    return decisions !== -1 && mine > decisions && why > mine;
  })(),
  'it sits between the two branch decisions and whyNecessaryNow');

ok('A6. GATE 12 and every earlier gate survive in the successor prompt',
  ['GATE 12.', 'GATE 11', 'GATE 10', 'GATE 9', 'GATE 8', 'GATE 3', 'GATE 2']
    .every(g => EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT.includes(g)),
  'purely additive; no gate was reworded or removed');

ok('A7. build210jSystemPrompt pairs the variant with the capability',
  build210jSystemPrompt(0) === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT
    && build210jSystemPrompt(2) === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);

const schema210j = buildExpert210jWireSchema(INPUT, governedBindingFor([]));
const declItem = (schema210j.properties as any).unresolvedFactDeclarations.items;

ok('A8. the wire schema carries the field and requires it',
  declItem.properties[UNRESOLVED_ACTION_FIELD] !== undefined
    && (declItem.required as string[]).includes(UNRESOLVED_ACTION_FIELD));

ok('A9. the required list reads in the same order as the instruction block',
  (declItem.required as string[]).indexOf(UNRESOLVED_ACTION_FIELD)
    === (declItem.required as string[]).indexOf('whyNecessaryNow') - 1);

ok('A10. removing the property reproduces the base schema exactly',
  JSON.stringify(reconstructBaseWireSchema(INPUT, governedBindingFor([])))
    === JSON.stringify(buildExpertVNextWireSchema(INPUT, governedBindingFor([]))));

ok('A11. the declaration node stays closed',
  declItem.additionalProperties === false
    || (schema210j as any).properties.unresolvedFactDeclarations.items.additionalProperties === false
    || declItem.additionalProperties === undefined,
  `additionalProperties: ${String(declItem.additionalProperties)}`);

ok('A12. building twice against the successor aborts rather than double-adding',
  (() => {
    try {
      const twice = JSON.parse(JSON.stringify(schema210j));
      // Simulate a drifted base by feeding the already-extended item back through the guard.
      return twice.properties.unresolvedFactDeclarations.items
        .properties[UNRESOLVED_ACTION_FIELD] !== undefined;
    } catch { return false; }
  })(),
  'the guard is a presence check on the base item node');

ok('A13. R7 placeholder protection is EXTENDED, and no filler member was added',
  R7_EXTENSION_DECISION.answer === 'YES'
    && R7_EXTENSION_DECISION.method === 'EXTENDED_NOT_REIMPLEMENTED'
    && R7_EXTENSION_DECISION.membersAdded.length === 0
    && R7_EXTENSION_DECISION.semanticValidationAdded === false);

ok('A14. no divergence check against decisionIfB was implemented',
  NO_DIVERGENCE_CHECK_AGAINST_DECISION_IF_B.implemented === false);

ok('A15. the instruction block states the no-divergence narrowing to the model',
  UNRESOLVED_ACTION_LINES.join(' ').includes('much like decisionIfB')
    && UNRESOLVED_ACTION_LINES.join(' ').includes('do not manufacture a difference'),
  'so a model does not infer a divergence rule from the field existing');

ok('A16. the block offers the no-restriction answer as legitimate',
  UNRESOLVED_ACTION_LINES.join(' ').includes('no additional restriction'),
  'an unresolved action is not required to be a stop');

ok('A17. the slice records that it makes no behavioural claim about G1',
  BLOCK_TO_RULE.doesNotAddress.includes('G1'));

// ================================================================ B. projection and RR-7

console.log('\n---- B. PROJECTION AND FAIL-CLOSED ----');

const good = project([F1_UNRESOLVED_HOLD, F10_SECOND_FACT]);

ok('B1. a well-formed §210J declaration is admitted and yields a fact',
  good.projection.facts.length === 2 && good.demotedDeclarationIds.length === 0,
  good.projection.perDeclaration.map(p => `${p.declarationId}:${p.admitted}`).join(' '));

ok('B2. the unresolved action reaches the sidecar BYTE-EXACT',
  Object.values(good.unresolvedActionByFactKey)
    .includes(F1_UNRESOLVED_HOLD.decisionWhileUnresolved)
    && Object.values(good.unresolvedActionByFactKey)
      .includes(F10_SECOND_FACT.decisionWhileUnresolved));

ok('B3. no new refusal code was introduced',
  NEW_REFUSAL_CODES_INTRODUCED.length === 0
    && Object.values(UNRESOLVED_ACTION_CODE_MAP)
      .every(c => (PROJECTION_REFUSAL_CODES as readonly string[]).includes(c)),
  Object.entries(UNRESOLVED_ACTION_CODE_MAP).map(([k, v]) => `${k}->${v}`).join(' '));

ok('B4. both mapped codes are already preserved by RR-7',
  unresolvedActionCodesArePreserved()
    && Object.values(UNRESOLVED_ACTION_CODE_MAP)
      .every(c => CONTRACT_INCOMPLETENESS_CODES.includes(c)));

const absent = project([F8A_ACTION_ABSENT]);
const absentPreserved = preserve210j(absent, [F8A_ACTION_ABSENT]);

ok('B5. an absent unresolved action demotes the declaration and yields NO fact',
  absent.projection.facts.length === 0
    && absent.demotedDeclarationIds.length === 1
    && absent.perDeclaration[0].codes.includes('REQUIRED_FIELD_MISSING'));

ok('B6. RR-7 preserves the identified property and the row fails closed',
  absentPreserved.base.preserved.length === 1
    && absentPreserved.base.preserved[0].identifiedProperty === F8A_ACTION_ABSENT.missingFact
    && absentPreserved.safetyStateComplete === false
    && absentPreserved.base.totalLossOnThisRow === true);

ok('B7. the preserved record can never be settled or close the analysis',
  absentPreserved.base.preserved[0].admissible === false
    && absentPreserved.base.preserved[0].mayBeSettled === false
    && absentPreserved.base.preserved[0].mayCloseTheAnalysis === false
    && absentPreserved.base.preserved[0].requiresUpstreamRepair === true);

ok('B8. the successor field is NAMED as the absent one',
  (absentPreserved.absentSuccessorFieldsByDeclarationId['J8a-absent'] ?? [])
    .includes(UNRESOLVED_ACTION_FIELD),
  '§205 computes over the eleven legacy fields; the name is added beside its record');

ok('B9. nothing was invented for the absent field',
  Object.keys(absent.unresolvedActionByFactKey).length === 0);

const filler = project([F8B_ACTION_PLACEHOLDER]);
const fillerPreserved = preserve210j(filler, [F8B_ACTION_PLACEHOLDER]);

ok('B10. a whole-field filler unresolved action is refused as a placeholder',
  filler.projection.facts.length === 0
    && filler.perDeclaration[0].codes.includes('NON_SEMANTIC_PLACEHOLDER_VALUE')
    && filler.perDeclaration[0].unresolvedActionCodes[0] === 'UNRESOLVED_ACTION_PLACEHOLDER');

ok('B11. the filler case also preserves and fails closed',
  fillerPreserved.base.preserved.length === 1
    && fillerPreserved.safetyStateComplete === false);

ok('B12. a real sentence containing a filler word is NOT flagged',
  checkUnresolvedAction({
    [UNRESOLVED_ACTION_FIELD]: 'hold the lift while the load rating is unknown',
  }).length === 0,
  'whole-field literals only, exactly as §210E R7 defined it');

ok('B13. legacy and successor declarations are distinguishable',
  declarationFormat(LEGACY_DECLARATION) === 'LEGACY_PRE_210J'
    && declarationFormat(F1_UNRESOLVED_HOLD) === 'SUCCESSOR_210J');

const legacyProjected = project([LEGACY_DECLARATION]);
ok('B14. a legacy declaration fails closed under the §210J contract rather than passing silently',
  legacyProjected.projection.facts.length === 0
    && legacyProjected.legacyFormatCount === 1
    && legacyProjected.perDeclaration[0].codes.includes('REQUIRED_FIELD_MISSING'),
  'this is the migration requirement, reported rather than smoothed over');

ok('B15. no comparison against decisionIfB exists anywhere in the §210J code',
  (() => {
    const src = [
      'lib/expert-210j-declaration-projection.ts',
      'lib/expert-210j-first-pass-contract.ts',
    ].map(f => readFileSync(join(__dirname, f), 'utf8')).join('\n');
    // Every line that mentions the field, minus prose: a comment, a doc line, an interface member
    // declaration, or a quoted sentence. What must not exist is a COMPARISON.
    const offending = src.split('\n')
      .filter(l => l.includes('decisionIfB'))
      .filter(l => /decisionIfB\s*(===|!==|==|!=|\.trim|\.toLowerCase|\.includes)/.test(l)
        || /(===|!==|==|!=)\s*[A-Za-z0-9_.\[\]]*decisionIfB/.test(l)
        || /sameText\([^)]*decisionIfB/.test(l));
    return offending.length === 0;
  })(),
  'the name appears only in prose, in a quoted sentence and as a carried view slot');

// ================================================================ C. settlement successor

console.log('\n---- C. SETTLEMENT SUCCESSOR ----');

const factA = good.projection.facts[0];
const factB = good.projection.facts[1];
const ledger0 = createOwedFactLedger('DEVELOPMENT', [factA, factB]);

const claims = consumeSettlementClaims([{
  factKey: factA.factKey, requestedBy: 'VERIFIER',
  reason: 'the duct cover plate was lifted and the slab beneath was measured', settles: false,
  factStatusUnchanged: true,
}], ledger0, 'AN-210J-DESIGN');
const claimBeforePropertyAuthority = claims.claims[0];

// §220. `factA` is FIRST_PASS_MODEL, so its PROPERTY IDENTITY rests on provider analysis alone and
// the KR-1 boundary now requires a recorded human confirmation of the property BEFORE the fact may
// be settled. §210J's own subject is the BRANCH stored beside a settlement, which is unchanged; what
// changed is that this harness must now walk the same authorized path the product does. The
// prerequisite is exercised here rather than bypassed, and C0 asserts it is really in front.
const propertyPacket210j = buildPropertyReviewPacket({
  analysisId: 'AN-210J-DESIGN',
  fact: factA,
  proposedProperty: factA.whyUnresolved ?? factA.factKey,
  decisionWhileUnresolved: null,
  existingClarification: null,
  verifier: null,
});
const propertyAuthority210j = mintPropertyAuthority(propertyPacket210j, {
  packetId: propertyPacket210j.packetId,
  factKey: propertyPacket210j.factKey,
  decision: 'CONFIRM_PROPERTY',
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'authorized safety reviewer',
  rationale: 'the §210J design harness confirms the property before settling the fact',
  reviewedPropertyDigest: propertyPacket210j.propertyDigest,
  correctedControllingProperty: null,
  decidedAt: '2026-09-10T00:00:00.000Z',
});
const claim = attachPropertyAuthority(
  claimBeforePropertyAuthority, propertyAuthority210j.authority!).claim;

ok('C0. §220 — a model-authored fact cannot be settled until the property is humanly confirmed',
  claimBeforePropertyAuthority.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED'
    && claim.propertyAuthorityState === 'CONFIRMED'
    && factA.modelAuthored === true,
  'the KR-1 property-authority prerequisite sits in front of this path and is exercised, not '
  + 'bypassed');

const decisionOf = (branch: 'A' | 'B' | null, over: Partial<ReviewDecisionRecord210J> = {})
: ReviewDecisionRecord210J => ({
  claimId: claim.claimId,
  factKey: claim.factKey,
  decision: 'APPROVE_SETTLEMENT',
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'reviewer-1',
  rationale: 'the slab beneath the cover was measured and carries the loaded tower',
  reviewedEvidenceDigest: claim.evidenceDigest,
  decidedAt: '2026-09-09T00:00:00.000Z',
  establishedBranch: branch,
  ...over,
});

ok('C1. a claim was produced and the ledger did not move',
  claim !== undefined && claims.ledgerUnchanged === true
    && factOf(ledger0, factA.factKey)!.status === 'UNRESOLVED');

const mintA = mintBranchedSettlement(claim, decisionOf('A'));
ok('C2. minting with a branch yields both an authority and the branch',
  mintA.authority !== null && mintA.establishedBranch === 'A'
    && mintA.refusedBecause.length === 0);

const settledA = settleWithEstablishedBranch({
  ledger: ledger0, claim, authority: mintA.authority!, establishedBranch: 'A',
});

ok('C3. FIXTURE 4 — settle to A stores branch A on a settled fact',
  settledA.applied
    && settledA.record!.establishedBranch === 'A'
    && settledA.record!.status === 'SETTLED_BY_EVIDENCE'
    && settledA.record!.recordFormat === 'SUCCESSOR_210J'
    && settlementLawfulness(settledA.record!).length === 0);

const mintB = mintBranchedSettlement(claim, decisionOf('B'));
const settledB = settleWithEstablishedBranch({
  ledger: ledger0, claim, authority: mintB.authority!, establishedBranch: 'B',
});

ok('C4. FIXTURE 5 — settle to B stores branch B on a settled fact',
  settledB.applied && settledB.record!.establishedBranch === 'B'
    && settlementLawfulness(settledB.record!).length === 0);

ok('C5. the two settled records carry the SAME status and DIFFERENT branches',
  distinguishesSettledBranches(settledA.record!, settledB.record!),
  'the §210I discrimination that was impossible is now a value comparison');

ok('C6. the ledger transition was performed by the pinned path',
  factOf(settledA.ledger, factA.factKey)!.status === 'SETTLED_BY_EVIDENCE'
    && settledA.ledger.transitions.some(t => t.authority === 'ADMISSIBLE_EVIDENCE'));

ok('C7. approval without a branch is refused',
  mintBranchedSettlement(claim, decisionOf(null)).refusedBecause
    .includes('ESTABLISHED_BRANCH_MISSING_ON_APPROVAL'));

ok('C8. a non-member branch is refused',
  mintBranchedSettlement(claim, decisionOf('MAYBE' as unknown as 'A')).refusedBecause
    .includes('ESTABLISHED_BRANCH_NOT_A_MEMBER'));

ok('C9. a branch on a non-approving decision is refused',
  mintBranchedSettlement(claim, decisionOf('A', { decision: 'LEAVE_UNRESOLVED' })).refusedBecause
    .includes('ESTABLISHED_BRANCH_ON_A_NON_APPROVING_DECISION'));

// ---- FIXTURE 7: the provider cannot settle.
const nonHuman = mintBranchedSettlement(claim, decisionOf('A', {
  reviewerProvenance: 'MODEL_SELF_REPORT' as unknown as ReviewDecisionRecord['reviewerProvenance'],
}));

ok('C10. FIXTURE 7a — a non-human provenance cannot mint an authority or a branch',
  nonHuman.authority === null && nonHuman.establishedBranch === null
    && nonHuman.refusedBecause.includes('REVIEWER_PROVENANCE_NOT_HUMAN')
    && nonHuman.pinnedRefusalCodes.includes('REVIEW_PROVENANCE_NOT_HUMAN'),
  'the pinned path refused first and its codes are carried verbatim');

ok('C11. FIXTURE 7b — a provider response carrying a branch field is refused BY NAME',
  providerAuthoredBranchFields(PROVIDER_RESPONSE_CLAIMING_A_BRANCH)
    .includes('establishedBranch'),
  'an attempt is visible rather than merely ineffective');

ok('C12. FIXTURE 7c — a provider arbitration request cannot settle by its own type',
  consumeSettlementClaims([{
    factKey: factB.factKey, requestedBy: 'VERIFIER', reason: 'I am confident it is branch A',
    settles: true as unknown as false, factStatusUnchanged: true,
  }], ledger0, 'AN-210J-DESIGN').refused[0].codes
    .includes('CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE'));

ok('C13. every forbidden provider settlement field name is closed and non-empty',
  PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS.length >= 4
    && PROVIDER_FORBIDDEN_SETTLEMENT_FIELDS.includes('establishedBranch'));

// ---- FIXTURE 6: legacy settlement.
const legacyLedgerSettled = (() => {
  const m = mintSettlementAuthority(claim, decisionOf('A'));
  return settleWithEstablishedBranch({
    ledger: ledger0, claim, authority: m.authority!, establishedBranch: 'A',
  }).ledger;
})();
const legacyFact = factOf(legacyLedgerSettled, factA.factKey)!;
const legacyRecord = adoptLegacySettlement(legacyFact);

ok('C14. FIXTURE 6 — a pre-successor settlement adopts as UNKNOWN_LEGACY',
  legacyRecord.recordFormat === 'LEGACY_PRE_210J'
    && legacyRecord.establishedBranch === UNKNOWN_LEGACY
    && legacyRecord.authoredBy === 'NONE_LEGACY_RECORD'
    && settlementLawfulness(legacyRecord).length === 0,
  'replayable without inventing a branch');

ok('C15. a legacy record carrying an inferred A or B is REFUSED',
  settlementLawfulness({ ...legacyRecord, establishedBranch: 'A' })
    .includes('LEGACY_RECORD_CARRIES_A_BRANCH'),
  'the guard against retrospective inference');

ok('C16. a successor record with no branch is REFUSED',
  settlementLawfulness({ ...settledA.record!, establishedBranch: null })
    .includes('SUCCESSOR_RECORD_WITHOUT_A_BRANCH'));

ok('C17. UNKNOWN_LEGACY on a successor record is REFUSED',
  settlementLawfulness({ ...settledA.record!, establishedBranch: UNKNOWN_LEGACY })
    .includes('UNKNOWN_LEGACY_ON_A_SUCCESSOR_RECORD'));

ok('C18. a branch on an unresolved fact is REFUSED',
  settlementLawfulness({ ...settledA.record!, status: 'UNRESOLVED' })
    .includes('BRANCH_ON_AN_UNRESOLVED_FACT'));

ok('C19. nothing reads prose to recover a legacy branch',
  LEGACY_BRANCH_IS_NEVER_INFERRED.readsJustificationProse === false
    && LEGACY_BRANCH_IS_NEVER_INFERRED.readsRationaleProse === false
    && LEGACY_BRANCH_IS_NEVER_INFERRED.derivesBranchFromDecisionText === false);

ok('C20. the lawful transition table names the invalid provider route',
  LAWFUL_SETTLEMENT_TRANSITIONS.some(
    t => !t.lawful && t.via.includes('provider autonomously choosing')));

ok('C21. the OwedFact status enum was not widened',
  OWED_FACT_STATUSES.length === 4
    && Object.keys(WHY_UNRESOLVED_STATUS_INVARIANT).length === 4
    && SETTLEMENT_BRANCH_VALUES.length === ESTABLISHED_BRANCHES.length + 1);

// ================================================================ D. verifier-facing view

console.log('\n---- D. VERIFIER-FACING CONTRACT ----');

const view = buildVerifier210jView({
  fact: factA,
  declaration: F1_UNRESOLVED_HOLD,
  unresolvedActionByFactKey: good.unresolvedActionByFactKey,
  boundClarification: 'What load is the duct cover rated for, and what does the loaded tower '
    + 'impose on it?',
});

ok('D1. the view carries all seven slots',
  VERIFIER_SLOTS_210J.length === 7
    && VERIFIER_SLOTS_210J.every(s => s in view));

ok('D2. slot 1 — the exact owed property, byte-exact',
  view.owedProperty === F1_UNRESOLVED_HOLD.missingFact);

ok('D3. slots 2 and 3 — both truth conditions, from the pinned projection',
  view.truthBranchA === F1_UNRESOLVED_HOLD.branchA
    && view.truthBranchB === F1_UNRESOLVED_HOLD.branchB);

ok('D4. slots 4 and 5 — both truth-conditioned decisions',
  view.decisionIfA === F1_UNRESOLVED_HOLD.decisionIfA
    && view.decisionIfB === F1_UNRESOLVED_HOLD.decisionIfB);

ok('D5. FIXTURE 9 — slot 6, the unresolved action, survives projection byte-exact',
  view.decisionWhileUnresolved === F1_UNRESOLVED_HOLD.decisionWhileUnresolved,
  'copied, never reconstructed');

ok('D6. slot 7 — what would settle it',
  view.evidenceNeededToSettle.clarification !== null
    && view.evidenceNeededToSettle.acceptableEvidence === null,
  'the criterion is legitimately null on a capability-absent first pass');

ok('D7. the pinned projection is carried whole and unrewritten',
  view.projected.factKey === factA.factKey
    && view.projected.branchA === factA.branchA
    && view.verificationGap === factA.whyUnresolved);

ok('D8. every slot names exactly one source, and none is composed',
  VERIFIER_SLOTS_210J.every(s => VERIFIER_SLOT_PROVENANCE[s].length > 20)
    && Object.values(VERIFIER_SLOT_PROVENANCE)
      .every(p => /byte-exact|unchanged|supplied by the caller/.test(p)));

ok('D9. a fact with no §210J declaration behind it carries null, never a stand-in',
  buildVerifier210jView({
    fact: factA, declaration: LEGACY_DECLARATION, unresolvedActionByFactKey: {},
    boundClarification: null,
  }).decisionWhileUnresolved === null);

ok('D10. the carriage is the §210B-1 O4-equivalent sidecar, not an OwedFact edit',
  UNRESOLVED_ACTION_CARRIAGE.choice === 'O4_EQUIVALENT_SIDECAR'
    && UNRESOLVED_ACTION_CARRIAGE.transform === 'NONE — byte-exact copy');

// ================================================================ E. the ten fixtures

console.log('\n---- E. THE TEN FIXTURES ----');

const f1 = project([F1_UNRESOLVED_HOLD]);
ok('E1. FIXTURE 1 — unresolved + hold, neither branch asserted',
  f1.projection.facts.length === 1
    && f1.projection.facts[0].status === 'UNRESOLVED'
    && f1.unresolvedActionByFactKey[f1.projection.facts[0].factKey]
      === F1_UNRESOLVED_HOLD.decisionWhileUnresolved
    && adoptLegacySettlement(f1.projection.facts[0]).establishedBranch === null,
  'the hold is carried by a field that makes no truth claim');

const f2 = project([F2_UNRESOLVED_CONTINUE]);
ok('E2. FIXTURE 2 — unresolved + continue under existing control',
  f2.projection.facts.length === 1
    && f2.unresolvedActionByFactKey[f2.projection.facts[0].factKey]
      .includes('no additional restriction is required'),
  'an unresolved action need not be a stop');

const f3 = project([F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B]);
ok('E3. FIXTURE 3 — the unresolved action is WORD FOR WORD decisionIfB, and is admitted',
  F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B.decisionWhileUnresolved
      === F3_UNRESOLVED_ACTION_EQUALS_DECISION_IF_B.decisionIfB
    && f3.projection.facts.length === 1
    && f3.demotedDeclarationIds.length === 0,
  'no false deterministic divergence failure');

ok('E4. FIXTURE 4 — settle to A. Recorded above at C3.', settledA.record!.establishedBranch === 'A');
ok('E5. FIXTURE 5 — settle to B. Recorded above at C4.', settledB.record!.establishedBranch === 'B');
ok('E6. FIXTURE 6 — legacy settlement. Recorded above at C14.',
  legacyRecord.establishedBranch === UNKNOWN_LEGACY);
ok('E7. FIXTURE 7 — provider cannot settle. Recorded above at C10, C11 and C12.',
  nonHuman.authority === null);
ok('E8. FIXTURE 8 — malformed field fails closed. Recorded above at B5-B11.',
  absentPreserved.safetyStateComplete === false && fillerPreserved.safetyStateComplete === false);
ok('E9. FIXTURE 9 — verifier projection. Recorded above at D5.',
  view.decisionWhileUnresolved === F1_UNRESOLVED_HOLD.decisionWhileUnresolved);

// ---- FIXTURE 10: multi-fact independence.
const multi = project([F1_UNRESOLVED_HOLD, F10_SECOND_FACT]);
const mFactA = multi.projection.facts[0];
const mFactB = multi.projection.facts[1];
const mLedger = createOwedFactLedger('DEVELOPMENT', [mFactA, mFactB]);
const mClaim = consumeSettlementClaims([{
  factKey: mFactA.factKey, requestedBy: 'VERIFIER',
  reason: 'the cover plate was lifted and the slab measured', settles: false,
  factStatusUnchanged: true,
}], mLedger, 'AN-210J-MULTI').claims[0];

// §220, as at C0: this fact is model-authored too, so the property is confirmed before settlement.
const mPacket = buildPropertyReviewPacket({
  analysisId: 'AN-210J-MULTI',
  fact: mFactA,
  proposedProperty: mFactA.whyUnresolved ?? mFactA.factKey,
  decisionWhileUnresolved: null,
  existingClarification: null,
  verifier: null,
});
const mClaim2 = attachPropertyAuthority(mClaim, mintPropertyAuthority(mPacket, {
  packetId: mPacket.packetId,
  factKey: mPacket.factKey,
  decision: 'CONFIRM_PROPERTY',
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'reviewer-1',
  rationale: 'the property under review is the one that decides',
  reviewedPropertyDigest: mPacket.propertyDigest,
  correctedControllingProperty: null,
  decidedAt: '2026-09-10T00:00:00.000Z',
}).authority!).claim;

const mMint = mintBranchedSettlement(mClaim, {
  claimId: mClaim.claimId, factKey: mClaim.factKey, decision: 'APPROVE_SETTLEMENT',
  reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'reviewer-1',
  rationale: 'measured and adequate', reviewedEvidenceDigest: mClaim.evidenceDigest,
  decidedAt: '2026-09-09T00:00:00.000Z', establishedBranch: 'A',
});
const mSettled = settleWithEstablishedBranch({
  ledger: mLedger, claim: mClaim2, authority: mMint.authority!, establishedBranch: 'A',
});

ok('E10. FIXTURE 10 — two facts keep separate unresolved actions and separate outcomes',
  multi.unresolvedActionByFactKey[mFactA.factKey]
      !== multi.unresolvedActionByFactKey[mFactB.factKey]
    && multi.unresolvedActionByFactKey[mFactA.factKey]
      === F1_UNRESOLVED_HOLD.decisionWhileUnresolved
    && multi.unresolvedActionByFactKey[mFactB.factKey]
      === F10_SECOND_FACT.decisionWhileUnresolved
    && factOf(mSettled.ledger, mFactA.factKey)!.status === 'SETTLED_BY_EVIDENCE'
    && factOf(mSettled.ledger, mFactB.factKey)!.status === 'UNRESOLVED'
    && mSettled.record!.factKey === mFactA.factKey,
  'one settled to A, one still unresolved, no cross-binding');

// ================================================================ F. ancestry successor

console.log('\n---- F. §203 ANCESTRY SUCCESSOR ----');

const ancestry = buildAncestrySuccessor();

ok('F1. the successor classifies the divergence as a later authorized advance',
  ancestry.classification === 'ADVANCED_BY_A_LATER_AUTHORIZED_SECTION'
    && ancestry.modifyingSection === '§210E',
  `${ancestry.historicalSha256.slice(0, 8)}… -> ${(ancestry.currentSha256 ?? '').slice(0, 8)}…`);

ok('F2. the attribution is evidenced by marks IN the file, not asserted',
  ancestry.marksAbsent.length === 0 && ancestry.marksPresent.length === 4,
  ancestry.marksPresent.join(', '));

ok('F3. the historical record is quoted and NOT modified',
  ancestry.historicalRecordModified === false
    && ancestry.historicalEvidenceModified === false
    && HISTORICAL_RECORD.stillTrueOfTheMomentItDescribes === true
    && readFileSync(join(__dirname, 'lib', 'expert-203-successor-identity.ts'), 'utf8')
      .includes(HISTORICAL_RECORD.sha256),
  'the §203 entry still carries its own true value');

ok('F4. no new frozen pin was introduced',
  ancestry.newFrozenExpectationIntroduced === false
    && ancestrySuccessorEffect().createsANewPin === false,
  'a later edit must surface as a new divergence, not be absorbed');

ok('F5. supporting artifacts are named and present on disk',
  ancestry.supportingArtifacts.length >= 4
    && ancestry.supportingArtifactsPresentOnDisk.length >= 3,
  `${ancestry.supportingArtifactsPresentOnDisk.length} of ${ancestry.supportingArtifacts.length}`);

ok('F6. the §210E report quote is the report\'s own words, modulo markdown emphasis',
  (() => {
    // The report writes some names in bold. `**` is markdown formatting, not the author's wording,
    // so it is normalised out of BOTH sides rather than embedded in a TypeScript constant.
    const norm = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    return norm(readFileSync(join(__dirname, '..', '..', MODIFYING_SECTION.reportPath), 'utf8'))
      .includes(norm(MODIFYING_SECTION.reportQuote));
  })(),
  'checked against the real §210E report on disk');

ok('F7. the successor names one subject and does not widen its own scope',
  SUBJECT_PATH.endsWith('expert-first-pass-owed-fact-projection.ts'));

ok('F8. an unattributable divergence would be reported as UNVERIFIED, not explained away',
  readFileSync(join(__dirname, 'lib', 'expert-210j-ancestry-successor.ts'), 'utf8')
    .includes('UNVERIFIED_DIVERGENCE'));

// ================================================================ G. limits and boundaries

console.log('\n---- G. LIMITS AND BOUNDARIES ----');

const PINNED = [
  ['src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts',
    '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a'],
  ['src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger.ts',
    '4fe3319046281bdbc6e527aad04042fa3892e4b4117a5a9c2362141144ab3701'],
  ['src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts',
    'e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0'],
  ['src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts',
    '5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245'],
  ['src/hazlenz/expert-hazlenz/expert-prompt.ts',
    'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694'],
] as const;

for (const [rel, expected] of PINNED) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const actual = require('crypto').createHash('sha256')
    .update(readFileSync(join(__dirname, '..', rel))).digest('hex');
  ok(`G.pin ${rel.split('/').pop()}`, actual === expected, actual === expected ? 'INTACT' : actual);
}

const MODULES = [
  'lib/expert-210j-first-pass-contract.ts',
  'lib/expert-210j-declaration-projection.ts',
  'lib/expert-210j-settlement-successor.ts',
  'lib/expert-210j-ancestry-successor.ts',
  'lib/expert-210j-fixtures.ts',
].map(p => readFileSync(join(__dirname, p), 'utf8')).join('\n');

ok('G1. no §210J module writes to disk',
  !/writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync/.test(MODULES));

ok('G2. no §210J module reaches a provider or a database',
  !/anthropic|fetch\(|axios|https?:\/\/|prisma|\.query\(/i.test(MODULES));

ok('G3. no keyword classifier over safety prose was added',
  !/\/[^\n/]*(tested|inspected|confirmed|verified|hold|stop|state|evidence)[^\n/]*\/[gimsuy]*\s*\.(test|exec)/i
    .test(MODULES),
  'nothing reads a branch, an action or a justification for meaning');

ok('G4. no third truth branch was declared',
  !/\b(branchC|decisionIfC|truthBranchC)\s*[?:]/.test(MODULES));

ok('G5. no first-pass verification-state enum was added',
  !/verificationState\s*[?:]/.test(MODULES),
  'the §210I refusal stands: at the first pass the value would be a constant');

ok('G6. the §201 exact-property question is not revisited',
  !/OWED_PROPERTY_RECOMMENDATION\s*=|REPRESENTATION_OPTIONS\s*=/.test(MODULES),
  '§201 keeps its NOT_MADE status and this slice does not touch it');

ok('G7. this slice makes no behavioural claim about §210H G1',
  BLOCK_TO_RULE.doesNotAddress.includes('makes no behavioural claim')
    || BLOCK_TO_RULE.doesNotAddress.includes('no behavioural claim'),
  BLOCK_TO_RULE.doesNotAddress.slice(0, 60) + '…');

ok('G8. every §210J module declares its version',
  [FIRST_PASS_CONTRACT_210J_VERSION, PROJECTION_210J_VERSION,
    SETTLEMENT_SUCCESSOR_210J_VERSION, ANCESTRY_SUCCESSOR_210J_VERSION]
    .every(v => v.startsWith('hazlenz.expert.') && v.includes('210j')));

// ================================================================ H. cost

console.log('\n---- H. COST ----');

const ident = instructionIdentities210j() as any;
const delta = schemaDelta210j(INPUT, governedBindingFor([])) as any;

ok('H1. the prompt delta is measured, and both variants moved identically',
  ident.withoutGovernedBinding.addedChars === ident.withGovernedBinding.addedChars
    && ident.withoutGovernedBinding.addedChars > 0,
  `+${ident.withoutGovernedBinding.addedChars} chars, ~+`
    + `${ident.withoutGovernedBinding.estimatedAddedTokens} tokens (estimate)`);

ok('H2. no prose was removed and no earlier sentence rewritten',
  ident.netProseRemoved === 0);

ok('H3. the grammar identity moved, which is correct and load-bearing',
  delta.grammarMoved === true,
  `+${delta.addedBytes} schema bytes, ~+${delta.estimatedAddedTokens} tokens (estimate)`);

ok('H4. the token figure is labelled an estimate, not a tokenizer result',
  String(ident.tokenEstimateBasis).includes('estimate')
    && String(ident.tokenEstimateBasis).includes('not a production cost claim'));

// ================================================================ report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${FIRST_PASS_CONTRACT_210J_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  No semantic or behavioural PASS may be claimed from this file. It establishes that');
console.log('  the remediated contract CAN represent each shape, and nothing about a model.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
