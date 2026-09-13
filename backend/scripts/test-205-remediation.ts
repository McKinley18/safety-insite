/**
 * §205 EXPERT HAZLENZ -- POST-120 REMEDIATION SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS WRITTEN OUTSIDE THIS PROCESS.
 *
 * Covers, in order: the R2 first-pass instruction (RR-1/RR-2A/RR-2B/RR-3/RR-5) and its byte-exact
 * reversal to vNext; RR-7 declaration preservation against the SF-05 signature; the RR-4 property-
 * preservation audit and the O1-versus-O4 conclusion; T1 append integrity including legacy
 * adoption; the governed capability-present transport construction and size budget; the RR-6
 * escalation design exercised against the eight §204 facts; and the fifteen-fixture matrix.
 *
 * NO HOSTED BEHAVIOUR CLAIM IS MADE ANYWHERE IN THIS SUITE. Every assertion is about deterministic
 * behaviour on hand-written input.
 */

import {
  EXPERT_FIRST_PASS_INSTRUCTION_R2_VERSION, EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING, R2_BASE_PROMPTS, R2_BLOCK_PROVENANCE,
  R2_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING, R2_DECLARATION_LINES_WITH_GOVERNED_BINDING,
  R2_REMEDIATION_BLOCK, buildExpertR2SystemPrompt, firstPassR2Effect, reconstructVNextLines,
} from './lib/expert-205-first-pass-instruction-r2';
import {
  UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING,
  UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-vnext';
import {
  AUTHORITY_VIOLATION_CODES, CONTRACT_INCOMPLETENESS_CODES,
  declarationPreservationEffect, preserveIdentifiedSafetyFacts,
} from './lib/expert-205-declaration-preservation';
import {
  ADDITIVE_ENTRY_SEPARATOR, LEGACY_ADOPTION_BATCH_ID,
  additiveAppendEffect, appendAdditive, deriveFlatView, priorEvidenceIntact,
  type AppendableReviewUnit,
} from './lib/expert-205-additive-append';
import {
  ANNOTATED_FIXTURES, FIXTURE_IDS, HOSTED_BEHAVIOUR_CLAIMS_PERMITTED, REMEDIATION_FIXTURES,
} from './lib/expert-205-remediation-fixtures';
import {
  QUALIFIER_CLASSES, REPRESENTATION_CONCLUSION_205, auditPropertyPreservation,
  buildO4SidecarForComparison, o4ResolvesProperty, propertyPreservationEffect,
} from './lib/expert-205-property-preservation-audit';
import {
  ESCALATION_ACTIVATION_STATE, ESCALATION_OPTIONS, SECTION_204_ESCALATION_CASES,
  escalationDesignEffect, exerciseEscalationOption, recommendEscalationDesign,
} from './lib/expert-205-escalation-design';
import {
  RECORDED_REJECTION, SECTION_199_MEASURED_ENVELOPE,
  assessGovernedTransport, governedTransportEffect,
} from './lib/expert-205-governed-transport';
import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { projectDeclaredOwedFacts203 } from './lib/expert-203-successor-projection';
import { PRODUCT_OWNER_ATTRIBUTION, type Worksheet202 } from './lib/expert-202-adjudication-grouping';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';

// ================================================================ harness

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
}
const section = (t: string): void => console.log(`\n---------------- ${t}`);

// ================================================================ 1. R2 instruction

section('1. R2 FIRST-PASS INSTRUCTION (RR-1, RR-2A, RR-2B, RR-3, RR-5)');

ok('R2.version', EXPERT_FIRST_PASS_INSTRUCTION_R2_VERSION
  === 'hazlenz.expert.first-pass-instruction.vNext-R2');

ok('R2.reversal-without-governed',
  JSON.stringify(reconstructVNextLines(R2_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING))
  === JSON.stringify(UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING),
  'removing the R2 block reproduces the vNext line array byte-identically');

ok('R2.reversal-with-governed',
  JSON.stringify(reconstructVNextLines(R2_DECLARATION_LINES_WITH_GOVERNED_BINDING))
  === JSON.stringify(UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING),
  'the governed variant reverses byte-identically too');

ok('R2.vnext-prompt-untouched',
  R2_BASE_PROMPTS.withoutGovernedBinding.length > 0
  && !R2_BASE_PROMPTS.withoutGovernedBinding.includes('MAY NOT OUTRUN THEIR OWN BRANCH')
  && EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT.includes('MAY NOT OUTRUN THEIR OWN BRANCH'),
  'the §199-executed vNext prompt object does not contain the R2 block; R2 does');

ok('R2.is-a-superset',
  EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT.length
    > R2_BASE_PROMPTS.withoutGovernedBinding.length
  && EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.length
    > R2_BASE_PROMPTS.withGovernedBinding.length,
  `R2 adds ${EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT.length
    - R2_BASE_PROMPTS.withoutGovernedBinding.length} characters`);

for (const [rr, meta] of Object.entries(R2_BLOCK_PROVENANCE)) {
  ok(`R2.provenance.${rr}`, typeof meta.answers === 'string' && meta.evidence.length > 0,
    `${rr} answers ${meta.answers} on ${meta.evidence}`);
}

{
  const text = R2_REMEDIATION_BLOCK.join('\n');
  ok('R2.rr1-present', text.includes('ONE ENTRY PER INDEPENDENT FACT'));
  ok('R2.rr2a-present', text.includes('AN UNKNOWN IS NOT A GAP UNTIL IT CHANGES SOMETHING'));
  ok('R2.rr2b-both-sides',
    text.includes('so nothing further is required') && text.includes('so it is controlled by'),
    'RR-2B names both F7 shapes: the SF-07 positive branch and the SF-11 negative branch');
  ok('R2.rr3-is-a-test-not-a-shape',
    text.includes('THIS IS A TEST TO APPLY, NOT A SHAPE TO IMPOSE'),
    'RR-3 does not impose universal ternary branching -- SF-11 was CORRECT on axis E as a binary');
  ok('R2.rr5-result-not-performance',
    text.includes('asking whether something was DONE when the property is what it SHOWED'));
  ok('R2.adds-no-new-reason',
    text.includes('This is not a request for more entries'),
    'the block narrows or distinguishes; it never asks for more output');
}

{
  const withoutIds = buildExpertR2SystemPrompt({ governedEvidenceSourceIds: [] });
  const withIds = buildExpertR2SystemPrompt({ governedEvidenceSourceIds: ['GOV-1'] });
  ok('R2.prompt-schema-pairing',
    withoutIds === EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT
    && withIds === EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    && withoutIds !== withIds,
    'the prompt is selected from the binding, so a caller cannot mismatch prompt and schema');
}

{
  const e = firstPassR2Effect();
  ok('R2.effects', e.providerCalls === 0 && e.databaseOperations === 0
    && e.mutatesTheVNextPrompt === false && e.mutatesTheWireSchema === false
    && e.recoversOmittedGapsByParsingProse === false);
}

// ================================================================ 2. RR-7 preservation

section('2. RR-7 DECLARATION CONTRACT COMPLETENESS (F8 / the SF-05 signature)');

const fixture = (id: string) => REMEDIATION_FIXTURES.find(f => f.fixtureId === id)!;

{
  const fx = fixture('FX-10_VALID_SEMANTIC_FACT_MALFORMED_CONTRACT');
  const proj = projectDeclaredOwedFacts(fx.projection!);
  const pres = preserveIdentifiedSafetyFacts(proj, fx.projection!.declarations);

  ok('RR7.reproduces-sf05-refusal',
    proj.facts.length === 0 && proj.refusedCount === 1
    && proj.perDeclaration[0].codes.filter(c => c === 'REQUIRED_FIELD_MISSING').length === 2,
    `codes=[${proj.perDeclaration[0].codes.join(', ')}] detail=[${
      proj.perDeclaration[0].detail.join(' | ')}]`);

  ok('RR7.fails-closed', pres.safetyStateComplete === false && pres.totalLossOnThisRow === true,
    'safetyStateComplete=false and totalLossOnThisRow=true -- the §204 SF-05 outcome is now visible');

  ok('RR7.preserves-the-identification',
    pres.preserved.length === 1
    && pres.preserved[0].identifiedProperty
      === 'Whether opening the interlocked gate actually stops hazardous motion',
    pres.preserved[0]?.identifiedProperty ?? 'nothing preserved');

  ok('RR7.reports-absent-fields-without-inventing-them',
    pres.preserved[0].absentRequiredFields.includes('decisionIfA')
    && pres.preserved[0].absentRequiredFields.includes('decisionIfB')
    && !('decisionIfA' in pres.preserved[0].presentFields)
    && !('decisionIfB' in pres.preserved[0].presentFields),
    `absent=[${pres.preserved[0].absentRequiredFields.join(', ')}]; no value was composed for either`);

  ok('RR7.carries-surviving-fields-verbatim',
    pres.preserved[0].presentFields.branchA === 'Opening the gate stops hazardous motion'
    && pres.preserved[0].presentFields.observationSpan
      === 'The interlock switch was not accessible for inspection',
    'fields that did arrive are copied, not summarised');

  ok('RR7.record-can-never-settle',
    pres.preserved[0].admissible === false && pres.preserved[0].mayBeSettled === false
    && pres.preserved[0].mayCloseTheAnalysis === false
    && pres.preserved[0].requiresUpstreamRepair === true
    && !('factKey' in pres.preserved[0]) && !('status' in pres.preserved[0])
    && !('priority' in pres.preserved[0]),
    'the record has no factKey, no status and no priority -- it is outside the ledger state machine');

  ok('RR7.produces-no-owed-fact', pres.facts.length === 0,
    'preservation adds nothing to `facts`; a refused declaration still yields no OwedFact');
}

{
  // The negative control that gives the fail-closed flag its meaning.
  const fx = fixture('FX-12_ORDINARY_NON_ESCALATING_CONTROL');
  const proj = projectDeclaredOwedFacts(fx.projection!);
  const pres = preserveIdentifiedSafetyFacts(proj, fx.projection!.declarations);
  ok('RR7.empty-row-is-not-a-loss',
    proj.facts.length === 0 && pres.safetyStateComplete === true
    && pres.totalLossOnThisRow === false,
    'a genuinely empty row stays distinguishable from FX-10\'s total loss');
}

{
  // A manufactured gap: refused for identical branches, still visible rather than silent.
  const fx = fixture('FX-02_DECISION_NEUTRAL_UNKNOWN_WITH_TEMPTING_ADVERSE_HYPOTHETICAL');
  const proj = projectDeclaredOwedFacts(fx.projection!);
  const pres = preserveIdentifiedSafetyFacts(proj, fx.projection!.declarations);
  ok('RR7.manufactured-gap-refused-and-visible',
    proj.facts.length === 0 && pres.preserved.length === 1
    && pres.dispositions[0].disposition === 'PRESERVED_STRUCTURALLY_INVALID',
    `codes=[${proj.perDeclaration[0].codes.join(', ')}]`);
}

{
  // An authority violation is CONTAINED, never carried forward under a new record name.
  const withCitation = {
    declarationId: 'auth-violation',
    missingFact: 'Whether the guard complies with the standard',
    observationSourceId: 'OBS-R2',
    observationSpan: 'The ladder carried a current inspection tag',
    notEstablishedBecause: 'Not stated.',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'It complies with 29 CFR 1910.212',
    decisionIfA: 'No action',
    branchB: 'It does not comply',
    decisionIfB: 'Take it out of service',
    whyNecessaryNow: 'In use now.',
    governedEvidenceSourceIds: [],
  };
  const proj = projectDeclaredOwedFacts({
    declarations: [withCitation], sources: fixture('FX-01_INDEPENDENT_TWO_GAP_RECALL')
      .projection!.sources, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  const pres = preserveIdentifiedSafetyFacts(proj, [withCitation]);
  const isAuthorityRefusal = proj.perDeclaration[0].codes
    .some(c => (AUTHORITY_VIOLATION_CODES as readonly string[]).includes(c));
  ok('RR7.authority-violation-contained-not-preserved',
    !proj.perDeclaration[0].admitted && isAuthorityRefusal
    && pres.preserved.length === 0
    && pres.dispositions[0].disposition === 'CONTAINED_AUTHORITY_VIOLATION',
    `codes=[${proj.perDeclaration[0].codes.join(', ')}] -- content is not carried forward`);
}

ok('RR7.code-partition-is-disjoint',
  CONTRACT_INCOMPLETENESS_CODES.every(c => !(AUTHORITY_VIOLATION_CODES as readonly string[])
    .includes(c)),
  'no refusal code is both a contract incompleteness and an authority violation');

{
  const e = declarationPreservationEffect();
  ok('RR7.effects', e.providerCalls === 0 && e.databaseOperations === 0
    && e.inventsDecisionSemantics === false && e.repairsRefusedDeclarations === false
    && e.producesOwedFacts === false && e.mayMarkAFactSettled === false);
}

// ================================================================ 3. projection behaviour

section('3. FIXTURE MATRIX -- PROJECTION BEHAVIOUR');

{
  const fx = fixture('FX-01_INDEPENDENT_TWO_GAP_RECALL');
  const proj = projectDeclaredOwedFacts(fx.projection!);
  ok('FX-01.both-independent-gaps-survive',
    proj.facts.length === 2 && new Set(proj.facts.map(f => f.factKey)).size === 2,
    `factKeys: ${proj.facts.map(f => f.factKey).join(' , ')}`);
  ok('FX-01.no-merge',
    proj.facts[0].affectedDecision === 'REQUIRED_CONTROL'
    && proj.facts[1].affectedDecision === 'EXPOSURE',
    'the two facts keep their own affectedDecision -- neither was folded into the other');
}

for (const id of ['FX-03_VERIFICATION_PERFORMED_AND_PASSED',
  'FX-04_VERIFICATION_NOT_PERFORMED',
  'FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH',
  'FX-06_TEMPORAL_BEFORE_RETURN_TO_USE',
  'FX-07_CONJUNCTIVE_TWO_COMPONENT_PROPERTY',
  'FX-11_EXPOSURE_NOT_OBSERVED_IS_NOT_ABSENT']) {
  const fx = fixture(id);
  const proj = projectDeclaredOwedFacts(fx.projection!);
  ok(`${id.split('_')[0]}.admitted`, proj.facts.length === 1 && proj.refusedCount === 0,
    proj.facts.length === 1 ? proj.facts[0].factKey
      : `codes=[${proj.perDeclaration.map(p => p.codes.join('/')).join(' ; ')}]`);
}

{
  // RR-3: the three verification states are three DISTINCT representations, not one shape.
  const notPerformed = projectDeclaredOwedFacts(
    fixture('FX-04_VERIFICATION_NOT_PERFORMED').projection!).facts[0];
  const failedToEstablish = projectDeclaredOwedFacts(
    fixture('FX-05_VERIFICATION_PERFORMED_AND_FAILED_TO_ESTABLISH').projection!).facts[0];
  ok('RR3.three-states-are-distinguishable',
    notPerformed.factKey !== failedToEstablish.factKey
    && notPerformed.branchB.includes('No load test was carried out')
    && failedToEstablish.branchB.includes('did NOT establish'),
    'not-performed and performed-but-did-not-establish are different facts with different branches');
}

{
  // RR-2B is NOT boundary-enforceable, and the suite records that as a finding rather than hiding it.
  const a = projectDeclaredOwedFacts(
    fixture('FX-08_DOWNSTREAM_OVERREACH_POSITIVE_BRANCH').projection!);
  const b = projectDeclaredOwedFacts(
    fixture('FX-09_DOWNSTREAM_OVERREACH_NEGATIVE_BRANCH').projection!);
  ok('RR2B.overreach-is-structurally-well-formed',
    a.facts.length === 1 && b.facts.length === 1,
    'BOTH overreaching declarations are admitted -- F7 is unreachable by deterministic code and is '
    + 'answered by the R2 instruction and by adjudication only. STATED RESIDUAL LIMIT.');
}

{
  // The successor boundary still refuses what §203 says it refuses, with R2 in the picture.
  const fx = fixture('FX-01_INDEPENDENT_TWO_GAP_RECALL');
  const withUnknownField = [
    { ...(fx.projection!.declarations[0] as Record<string, unknown>), noSuchField: 'x' },
  ];
  const r = projectDeclaredOwedFacts203({ ...fx.projection!, declarations: withUnknownField });
  ok('SUCCESSOR.closed-key-set-still-refuses',
    r.boundaryState === 'DELEGATED' && r.boundaryRefusals.length === 1
    && r.boundaryRefusals[0].codes.includes('UNKNOWN_FIELD_AT_CLOSED_BOUNDARY'),
    '§203 divergence D2 is unaffected by §205');
}

// ================================================================ 4. RR-4 audit and O1/O4

section('4. RR-4 PROPERTY PRESERVATION AUDIT AND THE O1-vs-O4 CONCLUSION');

{
  const audit = auditPropertyPreservation(ANNOTATED_FIXTURES);
  ok('RR4.invariant-holds', audit.invariantHolds,
    `${audit.rows.length} annotated qualifier classes; ${audit.violations.length} violations`);
  ok('RR4.every-class-reaches-the-verifier',
    audit.rows.every(r => r.outcome === 'SURVIVES_IN_VERIFIER_VISIBLE_FIELDS'),
    audit.rows.map(r => `${r.qualifier}:${r.survivingFields.length}`).join(' '));
  ok('RR4.not-runtime-auditable', audit.auditableAtRuntime === false
    && audit.auditableAtRuntimeBecause.includes('§160'),
    'stated: deciding qualifier classes at runtime would be the retired semantic matcher');
  ok('RR4.qualifier-vocabulary-closed',
    new Set(QUALIFIER_CLASSES).size === QUALIFIER_CLASSES.length && QUALIFIER_CLASSES.length === 6);

  const covered = new Set(audit.rows.map(r => r.qualifier));
  ok('RR4.fixtures-cover-the-classes-that-failed-in-204',
    covered.has('BEFORE_AFTER_SEQUENCING') && covered.has('ACTUAL_CONTROL_RESULT')
    && covered.has('POINT_OR_LOCATION_OF_VERIFICATION') && covered.has('EXPOSURE_CONDITION')
    && covered.has('CONJUNCTION'),
    `${covered.size} of ${QUALIFIER_CLASSES.length} classes exercised by fixtures`);
}

{
  const proj = projectDeclaredOwedFacts(
    fixture('FX-06_TEMPORAL_BEFORE_RETURN_TO_USE').projection!);
  const declaration = fixture('FX-06_TEMPORAL_BEFORE_RETURN_TO_USE')
    .projection!.declarations[0] as never;
  const { sidecar, records } = buildO4SidecarForComparison([{ fact: proj.facts[0], declaration }]);
  ok('O4.constructible-and-resolves',
    records.length === 1 && o4ResolvesProperty(sidecar, proj.facts[0].factKey)
      === 'Whether the load test was carried out BEFORE the crane was returned to use',
    'O4 works; the question is whether it earns its cost, not whether it functions');
  ok('O4.not-adopted',
    REPRESENTATION_CONCLUSION_205.conclusion === 'O1_RETAINED_AS_BASELINE'
    && REPRESENTATION_CONCLUSION_205.o4Disposition === 'AVAILABLE_NOT_ADOPTED'
    && REPRESENTATION_CONCLUSION_205.o4RevisitTrigger.length > 0,
    'O1 baseline retained; O4 available with a stated revisit trigger');
  ok('O4.conclusion-matches-the-204-record',
    REPRESENTATION_CONCLUSION_205.section204Evidence.factsAdjudicatedOnAxisQ === 8
    && REPRESENTATION_CONCLUSION_205.section204Evidence.noObservableLoss === 7
    && REPRESENTATION_CONCLUSION_205.section204Evidence.consequentialLoss === 1);
}

{
  const e = propertyPreservationEffect();
  ok('RR4.effects', e.providerCalls === 0 && e.mutatesOwedFact === false && e.adoptsO4 === false);
}

// ================================================================ 5. T1 append integrity

section('5. T1 -- APPEND-ONLY ADDITIVE EVIDENCE');

function stubWorksheet(unit: Partial<AppendableReviewUnit> = {}): Worksheet202 {
  const u = {
    unitId: 'U-T1', ordinal: 1, kind: 'ROW_FIRST_PASS_BEHAVIOUR', rowId: 'FX', factKey: null,
    declarationId: null, headline: 'stub', slotIds: [], headlineSlotCount: 0,
    supplementarySlotCount: 0, openSlotCount: 0, structurallyPrefilledSlotCount: 0,
    evidenceIn: 'stub', truthSpecificationDefect: null, reviewerNotes: null,
    additiveAttribution: null, ...unit,
  } as unknown as AppendableReviewUnit;
  return { reviewUnits: [u] } as unknown as Worksheet202;
}

{
  const w = stubWorksheet();
  const at = '2026-09-07T00:00:00.000Z';
  const r1 = appendAdditive(w, 'U-T1', 'reviewerNotes', 'FIRST', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B1', recordedAt: at });
  const r2 = appendAdditive(w, 'U-T1', 'reviewerNotes', 'SECOND', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B2', recordedAt: at });
  const r3 = appendAdditive(w, 'U-T1', 'reviewerNotes', 'THIRD', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B3', recordedAt: at });
  const unit = w.reviewUnits[0] as AppendableReviewUnit;

  ok('T1.three-appends-succeed', r1.ok && r2.ok && r3.ok);
  ok('T1.nothing-overwritten',
    unit.additiveEntries!.length === 3
    && unit.additiveEntries!.map(e => e.text).join('|') === 'FIRST|SECOND|THIRD',
    'all three texts survive');
  ok('T1.order-preserved',
    unit.additiveEntries!.map(e => e.seq).join(',') === '1,2,3');
  ok('T1.batch-identity-visible',
    unit.additiveEntries!.map(e => e.batchId).join(',') === 'B1,B2,B3');
  ok('T1.derived-view-matches-caller-side-concatenation',
    unit.reviewerNotes === ['FIRST', 'SECOND', 'THIRD'].join(ADDITIVE_ENTRY_SEPARATOR),
    'the flat field is a read view identical to what §204 produced by hand');
  ok('T1.prior-evidence-intact',
    priorEvidenceIntact('FIRST', unit.additiveEntries!, 'reviewerNotes').intact,
    'the first text survives exactly once, as a prefix');
  ok('T1.no-caller-side-concatenation-needed',
    (unit.reviewerNotes!.split('FIRST').length - 1) === 1,
    'FIRST appears once, not twice -- the caller passed only the new text');
  ok('T1.fields-are-independent',
    deriveFlatView(unit.additiveEntries!, 'truthSpecificationDefect') === null,
    'appending to reviewerNotes does not populate the other additive field');
}

{
  // Migration: a unit already carrying §204-era concatenated text is adopted byte-identically.
  const legacy = 'SECTION 204 TEXT\n\nwith paragraphs and a separator ' + '-'.repeat(78);
  const w = stubWorksheet({ reviewerNotes: legacy });
  const at = '2026-09-07T00:00:00.000Z';
  const before = (w.reviewUnits[0] as AppendableReviewUnit).reviewerNotes;
  const r = appendAdditive(w, 'U-T1', 'reviewerNotes', 'NEW §205 TEXT', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B205', recordedAt: at });
  const unit = w.reviewUnits[0] as AppendableReviewUnit;

  ok('T1.legacy-adopted', r.ok && unit.additiveEntries!.length === 2
    && unit.additiveEntries![0].batchId === LEGACY_ADOPTION_BATCH_ID
    && unit.additiveEntries![0].adoptedFromLegacyFlatField === true);
  ok('T1.legacy-text-byte-identical',
    unit.additiveEntries![0].text === legacy,
    'the adopted entry holds the original bytes, unmodified');
  ok('T1.legacy-prefix-survives',
    priorEvidenceIntact(before, unit.additiveEntries!, 'reviewerNotes').intact
    && unit.reviewerNotes!.startsWith(legacy),
    'the §204 record is still a prefix of the derived view');

  // Replay: adopting twice must not duplicate.
  const r2 = appendAdditive(w, 'U-T1', 'reviewerNotes', 'THIRD', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B205b', recordedAt: at });
  ok('T1.adoption-is-idempotent',
    r2.ok && unit.additiveEntries!.filter(e => e.adoptedFromLegacyFlatField).length === 1,
    'a second append does not re-adopt the legacy text');
}

{
  // Single-entry derivation must be byte-identical to the entry, or migration would mutate.
  const w = stubWorksheet();
  appendAdditive(w, 'U-T1', 'reviewerNotes', 'ONLY', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B1', recordedAt: 'x' });
  ok('T1.single-entry-view-has-no-separator',
    (w.reviewUnits[0] as AppendableReviewUnit).reviewerNotes === 'ONLY',
    'one entry derives to exactly its own bytes -- the property migration depends on');
}

{
  const w = stubWorksheet();
  const bad = appendAdditive(w, 'U-T1', 'reviewerNotes', 'x', 'AGENT',
    { batchId: 'B1', recordedAt: 'x' });
  const blank = appendAdditive(w, 'U-T1', 'reviewerNotes', '   ', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B1', recordedAt: 'x' });
  const nobatch = appendAdditive(w, 'U-T1', 'reviewerNotes', 'x', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: '', recordedAt: 'x' });
  const nounit = appendAdditive(w, 'NOPE', 'reviewerNotes', 'x', PRODUCT_OWNER_ATTRIBUTION,
    { batchId: 'B1', recordedAt: 'x' });
  ok('T1.refuses-non-product-owner',
    !bad.ok && bad.refusalCode === 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER');
  ok('T1.refuses-blank', !blank.ok && blank.refusalCode === 'ADDITIVE_TEXT_BLANK');
  ok('T1.refuses-missing-batch-identity',
    !nobatch.ok && nobatch.refusalCode === 'BATCH_IDENTITY_MISSING');
  ok('T1.refuses-unknown-unit', !nounit.ok && nounit.refusalCode === 'UNKNOWN_REVIEW_UNIT');
  ok('T1.no-entry-written-on-refusal',
    ((w.reviewUnits[0] as AppendableReviewUnit).additiveEntries ?? []).length === 0,
    'four refusals left the unit empty');
}

{
  const e = additiveAppendEffect();
  ok('T1.effects', e.overwritesPriorEvidence === false && e.mutatesHistoricalLedger === false
    && e.requiresCallerSideConcatenation === false
    && e.isAnExpertSemanticDefectRepair === false,
    'T1 is adjudication/evidence-tooling infrastructure, NOT an Expert semantic defect');
}

// ================================================================ 6. governed transport

section('6. GOVERNED CAPABILITY-PRESENT TRANSPORT');

const transportInput: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'fx-205-governed',
  authoritativeSources: [
    { sourceId: 'OBS-R7', sourceType: 'observation',
      text: 'Guarded press in the toolroom. The interlocked gate was closed and the green status '
        + 'lamp was lit. The interlock switch was not accessible for inspection.' },
  ],
  inspectionContext: { location: 'toolroom', task: 'press operation' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding', 'electrical'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

{
  const assessment = assessGovernedTransport({
    analysisId: 'fx-205-governed',
    input: transportInput,
    facts: [{
      factKey: 'FP.REQUIRED_CONTROL.OBS-R7.100-140.1',
      owedProperty: 'whether opening the gate stops hazardous motion',
      affectedDecision: 'REQUIRED_CONTROL',
      evidenceSpan: 'The interlock switch was not accessible for inspection',
      whyUnresolved: 'A closed gate does not establish the protective function.',
      branchA: 'Opening the gate stops hazardous motion',
      branchB: 'Opening the gate does not stop hazardous motion',
    }],
    governedRecords: [{ sourceId: 'GOV-1', text: 'Governed record text held by HazLenz.' }],
    inspectionContext: { location: 'toolroom', task: 'press operation' },
  });

  for (const f of assessment.findings) {
    ok(`TRANSPORT.${f.checkId}`, f.held, `${f.statement} :: ${f.measured}`);
  }
  ok('TRANSPORT.all-held', assessment.allHeld);
  ok('TRANSPORT.routed-binding-is-absent',
    assessment.routed.firstPassBinding.governedEvidenceSourceIds.length === 0,
    'the governed row sends the capability-ABSENT first pass, per §202\'s own guard');
  ok('TRANSPORT.recorded-rejection-quoted',
    RECORDED_REJECTION.rejectionCode === 'COMPILED_GRAMMAR_TOO_LARGE'
    && RECORDED_REJECTION.affectedRows.length === 2
    && SECTION_199_MEASURED_ENVELOPE.capabilityPresent.totalBytes === 67_086
    && SECTION_199_MEASURED_ENVELOPE.capabilityAbsent.totalBytes === 63_691);
  ok('TRANSPORT.does-not-claim-provider-acceptance',
    assessment.claims.PROVES_THE_PROVIDER_WILL_ACCEPT_IT === false
    && assessment.claims.ANY_REQUEST_IS_SENT === false
    && assessment.claims.UPGRADED_ONLY_BY_A_HOSTED_TRANSPORT_SMOKE === true,
    'CONSTRUCTIBLE AND WITHIN THE ACCEPTED ENVELOPE -- not PROVIDER ACCEPTED');
  console.log(`        measured: first pass ${assessment.measuredBytes.routedFirstPassSchema} B, `
    + `retired PRESENT ${assessment.measuredBytes.retiredPresentSchema} B, `
    + `governed stage ${assessment.measuredBytes.governedStageSchema} B`);
  console.log(`        grammar : routed ${assessment.grammarIdentities.routedFirstPass}, `
    + `retired ${assessment.grammarIdentities.retiredPresent}, `
    + `stage ${assessment.grammarIdentities.governedStage}`);

  const e = governedTransportEffect();
  ok('TRANSPORT.effects', e.providerCalls === 0 && e.sendsAnything === false
    && e.provesProviderAcceptance === false
    && e.copiesGovernedTextIntoModelAuthoredCitationAuthority === false);
}

// ================================================================ 7. RR-6 escalation design

section('7. RR-6 DETERMINISTIC ESCALATION DESIGN (DESIGNED, NOT ACTIVATED)');

{
  ok('RR6.cohort-matches-the-204-record',
    SECTION_204_ESCALATION_CASES.length === 8
    && SECTION_204_ESCALATION_CASES.filter(
      c => c.recordedFloorImpact === 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE').length === 7
    && SECTION_204_ESCALATION_CASES.filter(
      c => c.recordedSafetyClassification === 'PLAUSIBLY_LIFE_CRITICAL').length === 4,
    '8 facts, 7 under-escalated, 4 plausibly life-critical -- as recorded');

  const rec = recommendEscalationDesign();
  for (const o of rec.outcomes) {
    console.log(`        ${o.option}: correctlyRaised=${o.correctlyRaised} `
      + `overRaised=${o.overRaised} stillUnderEscalated=${o.stillUnderEscalated}`);
  }

  const e0 = exerciseEscalationOption('E0_UNCHANGED_CONSTANT_FLOOR');
  ok('RR6.E0-reproduces-the-defect',
    e0.correctlyRaised === 0 && e0.stillUnderEscalated === 7,
    'the shipped constant floor leaves all 7 under-escalated -- the measured §204 state');

  const e1 = exerciseEscalationOption('E1_AFFECTED_DECISION_FLOOR_MAP');
  ok('RR6.E1-over-raises-U07',
    e1.overRaised === 1 && e1.perFact.find(p => p.unitId === 'U07')!.raised === true,
    'affectedDecision alone cannot separate U07 from the four life-critical REQUIRED_CONTROL facts');

  const e3 = exerciseEscalationOption('E3_AFFECTED_DECISION_PLUS_PERSON_PRESENT');
  ok('RR6.E3-separates-U07',
    e3.overRaised === 0 && e3.perFact.find(p => p.unitId === 'U07')!.raised === false,
    `E3 raises ${e3.correctlyRaised} of 7 correctly with 0 over-escalations`);

  ok('RR6.nothing-reaches-life-critical',
    rec.outcomes.every(o => o.perFact.every(p => p.priority !== 'LIFE_CRITICAL')),
    'no option lets a model-originated fact reach the value that raises UNRESOLVED_SAFETY_STATE');

  ok('RR6.not-authorized',
    rec.recommendationIsAuthorized === false
    && ESCALATION_ACTIVATION_STATE.AUTHORIZES_A_POLICY_CHANGE === false
    && ESCALATION_ACTIVATION_STATE.GRANTS_PROVIDER_ESCALATION_AUTHORITY === false
    && ESCALATION_ACTIVATION_STATE.RULING_5_UNCHANGED === true
    && ESCALATION_ACTIVATION_STATE.SHIPPED_FLOOR === 'OTHER',
    'design only; the shipped floor is unchanged and D14 stays open');

  ok('RR6.limits-are-stated', rec.honestLimits.length >= 4
    && rec.honestLimits.some(l => l.includes('n = 8')),
    'E3 is fitted to eight facts and says so');

  ok('RR6.option-vocabulary-closed',
    new Set(ESCALATION_OPTIONS).size === ESCALATION_OPTIONS.length);

  const e = escalationDesignEffect();
  ok('RR6.effects', e.activatesAPolicy === false && e.readsModelAuthoredUrgency === false
    && e.mayReachLifeCritical === false && e.mutatesTheShippedFloor === false);
}

// ================================================================ 8. matrix completeness

section('8. FIXTURE MATRIX COMPLETENESS AND SCOPE');

ok('MATRIX.fifteen-fixtures', FIXTURE_IDS.length === 15
  && REMEDIATION_FIXTURES.length === 15
  && new Set(REMEDIATION_FIXTURES.map(f => f.fixtureId)).size === 15);
ok('MATRIX.every-fixture-declares-what-it-exercises',
  REMEDIATION_FIXTURES.every(f => f.exercises.length > 0 && f.expectation.length > 0));
ok('MATRIX.projection-fixtures-carry-input',
  REMEDIATION_FIXTURES.filter(f => f.kind === 'PROJECTION').every(f => f.projection !== null));
ok('MATRIX.no-hosted-behaviour-claims',
  HOSTED_BEHAVIOUR_CLAIMS_PERMITTED === false,
  'nothing in §205 may be reported as hosted behaviour');

// ================================================================ summary

console.log('\n================================================================');
console.log('§205 POST-120 REMEDIATION SUITE');
console.log('  provider calls: 0    database operations: 0    policy changes: 0');
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
