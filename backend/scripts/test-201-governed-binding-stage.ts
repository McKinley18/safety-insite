/**
 * §201 -- GOVERNED-BINDING STAGE PROOF SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Proves the boundary properties of `expert-201-governed-binding-stage.ts` and MEASURES the grammar
 * comparison the §200 decision packet asked for, so the architecture memo quotes numbers this file
 * recomputes rather than numbers somebody typed.
 *
 * THE PROPERTY THIS SUITE EXISTS FOR IS SECTION A. Option C is only worth anything if the ordinary
 * capability-ABSENT first pass -- the one path in this programme that has completed hosted inference
 * on ten of ten rows -- is left literally untouched. Section A asserts that against §199's own
 * frozen per-row schema hashes and its frozen prompt hashes, read off the immutable evidence
 * directory. If §201 had perturbed the working path, those ten hashes would move and this suite
 * would fail before any binding property was ever considered.
 *
 * WHAT THIS SUITE DOES NOT DO. It supplies no semantic verdict about any §199 model output, judges
 * no §200 adjudication axis, and makes no claim that any binding is CORRECT. Every fixture below is
 * a STRUCTURAL fixture: it exercises shapes the boundary must accept or refuse, and asserts nothing
 * about safety truth.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { stableStringify } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import type { AcceptableEvidence } from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  buildExpertVNextWireSchema, buildExpertVNextSystemPrompt, buildExpertVNextUserPrompt,
  governedBindingFor, governedBindingCapability,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-vnext';
import {
  evaluateNarrowedInvariants,
} from './lib/expert-212-pm1-assertion-repair';
import {
  projectDeclaredOwedFacts,
} from './lib/expert-first-pass-owed-fact-projection';
import { SECTION_199_COHORT } from './lib/expert-199-cohort-2026-09-07';
import {
  GOVERNED_BINDING_STAGE_VERSION, GOVERNED_BINDING_REQUEST_CONTRACT_ID,
  GOVERNED_BINDING_STAGE_SYSTEM_PROMPT, BINDING_DETERMINATIONS, BINDING_FORBIDDEN_FIELDS,
  FACT_BINDING_OUTCOMES, GRAMMAR_MEASUREMENT_CLAIMS, STAGE_DEPENDENCIES, STAGE_RESIDUAL_LIMITS,
  type BindingCandidateFact, type GovernedBindingStageInput,
  buildGovernedBindingWireSchema, buildGovernedBindingUserPrompt, checkGovernedBindings,
  applyGovernedBindings, governedBindingStageEffect, measureSchemaComplexity, mintFactRefs,
  stageInvocation,
} from './lib/expert-201-governed-binding-stage';

const ROOT = join(__dirname, '..', '..');
const E199 = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ---------------------------------------------------------------- shared fixtures

const row = (id: string) => SECTION_199_COHORT.find(r => r.rowId === id)!;
const SG01 = row('SG-01');
const SF01 = row('SF-01');

const inputFor = (r: typeof SECTION_199_COHORT[number]): ExpertAnalysisInput => ({
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: `AN-199-${r.rowId}`,
  authoritativeSources: [{ sourceId: `OBS-${r.rowId}`, sourceType: 'observation', text: r.observation }],
  inspectionContext: { location: r.location, task: r.task },
  jurisdiction: r.jurisdiction,
  allowedHazardFamilies: [...r.allowedHazardFamilies],
  deterministicFindings: r.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
  governedStandards: r.governedStandards.map(g => ({ ...g })),
  answeredClarifications: [],
});
const recordsFor = (r: typeof SECTION_199_COHORT[number]) =>
  r.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));

const EMPTY_BINDING = { governedEvidenceSourceIds: [] as readonly string[] };
const asSent = (schema: Record<string, unknown>): unknown =>
  stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));

/**
 * A STRUCTURAL declaration fixture for SG-01. The span is copied verbatim from the row's own
 * observation so the real projection admits it; nothing here is a semantic claim about SG-01, about
 * §199's model output, or about what the correct owed fact for that row is.
 */
const SG01_DECLARATION = {
  declarationId: 'D1',
  missingFact: 'whether the eyewash supply sustains uninterrupted flow for a full flushing period',
  observationSourceId: 'OBS-SG-01',
  observationSpan: 'Nobody present could say whether the supply sustains flow for a full flushing '
    + 'period without interruption',
  notEstablishedBecause: 'the unit was run for about twenty seconds and no flow or duration record '
    + 'was available',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the supply sustains uninterrupted flow for a full flushing period',
  branchB: 'the supply drops or is interrupted before a full flushing period elapses',
  decisionIfA: 'decanting continues with the eyewash accepted as the emergency provision',
  decisionIfB: 'decanting stops until a facility that sustains the full period is available here',
  whyNecessaryNow: 'two operators are decanting concentrated acid at this position now',
};

const SG01_PROJECTION = projectDeclaredOwedFacts({
  declarations: [SG01_DECLARATION],
  sources: [{ sourceId: 'OBS-SG-01', text: SG01.observation }],
  suppliedGovernedSourceIds: [],
  stage: 'FIRST_PASS_MODEL',
});
const SG01_FACT = SG01_PROJECTION.facts[0];

const SG01_CANDIDATE: BindingCandidateFact = {
  factKey: SG01_FACT?.factKey ?? 'FP.REQUIRED_CONTROL.OBS-SG-01.0-0.1',
  owedProperty: SG01_DECLARATION.missingFact,
  affectedDecision: 'REQUIRED_CONTROL',
  evidenceSpan: SG01_DECLARATION.observationSpan,
  whyUnresolved: SG01_DECLARATION.notEstablishedBecause,
  branchA: SG01_DECLARATION.branchA,
  branchB: SG01_DECLARATION.branchB,
};

const SUPPLIED_ID = recordsFor(SG01)[0].sourceId;

const STAGE_INPUT: GovernedBindingStageInput = {
  analysisId: 'AN-201-SG-01',
  facts: [SG01_CANDIDATE],
  governedRecords: recordsFor(SG01),
  inspectionContext: { location: SG01.location, task: SG01.task },
};

const entry = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  factRef: 'F1',
  determination: 'BINDS',
  governedEvidenceSourceIds: [SUPPLIED_ID],
  bearingStatement: 'the record states what a drenching facility must be able to provide',
  ...over,
});
const response = (...items: unknown[]): unknown => ({ bindings: items });

// ================================================================ A. THE WORKING PATH IS UNTOUCHED

const protocolHashes = readFileSync(join(E199, 'PROTOCOL-HASHES.txt'), 'utf8');
const frozenRowHash = (rowId: string): string | null => {
  const m = new RegExp(`^\\s*${rowId}\\s+(ABSENT|PRESENT)\\s+([0-9a-f]{64})\\s*$`, 'm')
    .exec(protocolHashes);
  return m ? m[2] : null;
};

ok('A1. §199 frozen protocol hashes are readable', protocolHashes.length > 0
  && frozenRowHash('SF-01') !== null && frozenRowHash('SG-01') !== null,
  'read from the IMMUTABLE §199 evidence directory');

ok('A2. the capability-ABSENT vNext system prompt is byte-unchanged',
  sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT)
  === 'bdb3af044340dac164b979672ab61be8f14e5d190abbd7e496b82dd5010b4f7b',
  'the prompt the ten accepted rows used');

ok('A3. §201 imports the vNext module and changes nothing in it',
  sha(readFileSync(join(__dirname, 'lib', 'expert-first-pass-instruction-vnext.ts'), 'utf8'))
  === 'a81c63c8314f16290e0e5ead451b9f2c7e127d6eaa6c66e754ae605bec0e756e',
  'first-pass vNext module hash equals §199\'s frozen value');

// §212 PM-1, CLASS 2 NARROWING. This assertion never meant "the file has a particular hash"; it
// meant "§201 changed nothing in the projection module". The whole-file hash was a blunt instrument
// for that: it fails when a DIFFERENT authorized section legitimately advances the file -- §210E's
// accepted R7 remediation did, adding NON_SEMANTIC_PLACEHOLDER_VALUE -- and it would equally have
// passed a file edited and reverted. The six narrowed invariants say the intended thing directly.
// The §199-frozen hash is RETAINED below as a documented historical reference and is not erased.
const SECTION_199_FROZEN_PROJECTION_HASH =
  'aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c';
const a4Invariants = evaluateNarrowedInvariants();
ok('A4. §201 changed nothing in the projection module (narrowed, §212 PM-1 CLASS 2)',
  a4Invariants.every(r => r.holds),
  a4Invariants.filter(r => !r.holds).map(r => r.id).join(', ')
  || `${a4Invariants.length} invariants hold; historical §199 hash `
     + `${SECTION_199_FROZEN_PROJECTION_HASH.slice(0, 12)}… superseded by §210E, see `
     + 'SUCCESSOR_ANCESTRY_PIN_212');

let absentDrift = 0;
const absentRows = SECTION_199_COHORT.filter(r => r.verifierGovernedEvidence.length === 0);
for (const r of absentRows) {
  const schema = buildExpertVNextWireSchema(inputFor(r), governedBindingFor(recordsFor(r)));
  if (sha(stableStringify(schema)) !== frozenRowHash(r.rowId)) absentDrift += 1;
}
ok('A5. all ten capability-ABSENT per-row wire schemas reproduce §199\'s frozen hashes',
  absentRows.length === 10 && absentDrift === 0, `${absentRows.length} rows, ${absentDrift} drifted`);

/**
 * The Option C claim, made checkable: under Option C a governed row's FIRST PASS is built with an
 * empty binding, so its schema is capability-ABSENT and its shape is the shape that succeeded ten
 * times. It is NOT the same hash as SF-01's, because the schema is per-request (it enumerates this
 * row's own source ids) -- what must match is the CAPABILITY, not the row.
 */
const sg01OptionC = buildExpertVNextWireSchema(inputFor(SG01), EMPTY_BINDING);
const sg01Section199 = buildExpertVNextWireSchema(inputFor(SG01), governedBindingFor(recordsFor(SG01)));

ok('A6. under Option C the governed row\'s first pass is capability-ABSENT',
  governedBindingCapability(EMPTY_BINDING) === 'ABSENT'
  && governedBindingCapability(governedBindingFor(recordsFor(SG01))) === 'PRESENT');

ok('A7. Option C\'s SG-01 first-pass schema is NOT §199\'s rejected capability-PRESENT schema',
  sha(stableStringify(sg01Section199)) === frozenRowHash('SG-01')
  && sha(stableStringify(sg01OptionC)) !== frozenRowHash('SG-01'),
  'the rejected schema is reproduced, and Option C does not send it');

ok('A8. Option C\'s SG-01 first-pass schema carries no governed-binding property at all',
  !JSON.stringify(sg01OptionC).includes('governedEvidenceSourceIds')
  && JSON.stringify(sg01Section199).includes('governedEvidenceSourceIds'));

ok('A9. under Option C the governed row uses the ABSENT prompt, not the PRESENT one',
  buildExpertVNextSystemPrompt(EMPTY_BINDING) === EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT
  && EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT !== EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);

ok('A10. under Option C the AVAILABLE GOVERNED EVIDENCE block leaves the first-pass user prompt',
  !buildExpertVNextUserPrompt(inputFor(SG01), []).includes('AVAILABLE GOVERNED EVIDENCE')
  && buildExpertVNextUserPrompt(inputFor(SG01), recordsFor(SG01)).includes('AVAILABLE GOVERNED EVIDENCE'));

ok('A11. the v15 governed records are still rendered to the first pass under opaque handles',
  buildExpertVNextUserPrompt(inputFor(SG01), []).includes('Medical services and first aid'),
  'Option C removes the id block, not the v15 governed-standards rendering');

// ================================================================ B. GRAMMAR COMPLEXITY

const mAbsentSF01 = measureSchemaComplexity(asSent(
  buildExpertVNextWireSchema(inputFor(SF01), EMPTY_BINDING)));
const mAbsentSG01 = measureSchemaComplexity(asSent(sg01OptionC));
const mPresentSG01 = measureSchemaComplexity(asSent(sg01Section199));
const mStageEnum = measureSchemaComplexity(asSent(buildGovernedBindingWireSchema(STAGE_INPUT)));
const mStagePlain = measureSchemaComplexity(asSent(buildGovernedBindingWireSchema(
  { ...STAGE_INPUT, governedIdTransport: 'PLAIN_STRING' })));

console.log('\n  GRAMMAR COMPLEXITY — as sent (strict wrapper + §108 Anthropic strip)');
console.log('  schema                                       enums   alts   objs  props   reqs  descChars  chars  utf8B');
const line = (name: string, m: typeof mAbsentSF01): void => {
  console.log(`  ${name.padEnd(42)} ${String(m.enumConstructs).padStart(5)} `
    + `${String(m.enumAlternatives).padStart(6)} ${String(m.objectNodes).padStart(6)} `
    + `${String(m.propertyNodes).padStart(6)} ${String(m.requiredEntries).padStart(6)} `
    + `${String(m.descriptionChars).padStart(10)} ${String(m.serialisedChars).padStart(6)} `
    + `${String(m.serialisedBytes).padStart(6)}`);
};
line('first pass vNext ABSENT   (SF-01)', mAbsentSF01);
line('first pass vNext ABSENT   (SG-01, Option C)', mAbsentSG01);
line('first pass vNext PRESENT  (SG-01, REJECTED)', mPresentSG01);
line('§201 binding stage        (CLOSED_ENUM)', mStageEnum);
line('§201 binding stage        (PLAIN_STRING)', mStagePlain);
console.log('');

/**
 * RECONCILING AGAINST §199's RECORDED FIGURES, AND THE DISCREPANCY THAT FELL OUT OF IT.
 *
 * The table above is built the way the §199 EXECUTOR builds a request: one authoritative source
 * whose `sourceId` is `OBS-${rowId}`. §199's CAPABILITY-TRANSPORT-DIAGNOSIS records 18,617 for
 * SF-01 and 19,062 for SG-01, and those figures are reproduced EXACTLY -- but only when the source
 * id is the generic literal `OBS`. The diagnosis's offline rebuild used a placeholder source id
 * rather than the executor's own, so every per-row figure it records is 12 characters short of what
 * was actually sent (6 short for the v15 base, where the id enum occurs once instead of twice).
 *
 * This is recorded rather than smoothed over, and it changes NOTHING about §199's conclusion: the
 * offset is a constant, it is identical on every row, and the capability-PRESENT/ABSENT comparison
 * the diagnosis draws is a difference of two figures that both carry it. It matters only because a
 * later reader comparing a fresh measurement against the frozen one would otherwise be 12 bytes
 * adrift with no explanation -- and because the correct absolute figure for what was sent is 12
 * higher than the frozen artifact says.
 */
const genericIdInput = (r: typeof SECTION_199_COHORT[number]): ExpertAnalysisInput =>
  ({ ...inputFor(r), authoritativeSources: [{ sourceId: 'OBS', sourceType: 'observation', text: r.observation }] });

const diagSF01 = measureSchemaComplexity(asSent(
  buildExpertVNextWireSchema(genericIdInput(SF01), EMPTY_BINDING)));
const diagSG01 = measureSchemaComplexity(asSent(
  buildExpertVNextWireSchema(genericIdInput(SG01), governedBindingFor(recordsFor(SG01)))));

ok('B1. §199\'s recorded 19,062 for capability-PRESENT SG-01 is reproduced exactly',
  diagSG01.serialisedChars === 19062, `measured ${diagSG01.serialisedChars}`);
ok('B2. §199\'s recorded 18,617 for capability-ABSENT SF-01 is reproduced exactly',
  diagSF01.serialisedChars === 18617, `measured ${diagSF01.serialisedChars}`);
ok('B2a. the diagnosis figures are 12 short of what the executor actually sent, on every row',
  SECTION_199_COHORT.every(r => {
    const b = governedBindingFor(recordsFor(r));
    return measureSchemaComplexity(asSent(buildExpertVNextWireSchema(inputFor(r), b))).serialisedChars
      - measureSchemaComplexity(asSent(buildExpertVNextWireSchema(genericIdInput(r), b))).serialisedChars
      === 12;
  }),
  'the offline rebuild used a placeholder sourceId, not the executor\'s OBS-${rowId}');
ok('B3. the capability-PRESENT schema adds exactly one enum construct over the ABSENT one',
  mPresentSG01.enumConstructs - mAbsentSG01.enumConstructs === 1,
  `${mAbsentSG01.enumConstructs} -> ${mPresentSG01.enumConstructs} enums`);
ok('B4. the binding stage is an order of magnitude smaller on every axis',
  mStageEnum.serialisedBytes * 8 < mPresentSG01.serialisedBytes
  && mStageEnum.enumAlternatives < mPresentSG01.enumAlternatives
  && mStageEnum.propertyNodes * 5 < mPresentSG01.propertyNodes,
  `${mStageEnum.serialisedBytes} vs ${mPresentSG01.serialisedBytes} bytes; `
  + `${mStageEnum.propertyNodes} vs ${mPresentSG01.propertyNodes} properties`);
ok('B5. Option B composes with Option C: PLAIN_STRING removes an enum from the stage schema',
  mStagePlain.enumConstructs === mStageEnum.enumConstructs - 1
  && mStagePlain.serialisedBytes < mStageEnum.serialisedBytes,
  `${mStageEnum.enumConstructs} -> ${mStagePlain.enumConstructs} enums`);
ok('B6. the measurement does not claim to be the provider\'s metric',
  GRAMMAR_MEASUREMENT_CLAIMS.IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC === false
  && GRAMMAR_MEASUREMENT_CLAIMS.PROVES_A_REQUEST_WILL_BE_ACCEPTED === false
  && GRAMMAR_MEASUREMENT_CLAIMS.KNOWS_THE_THRESHOLD === false);

// ================================================================ C. NOTHING ON THE WIRE NAMES A FACT

const stageSchemaJson = JSON.stringify(buildGovernedBindingWireSchema(STAGE_INPUT));
const stageUserPrompt = buildGovernedBindingUserPrompt(STAGE_INPUT);

ok('C1. the projection produced a real computed factKey for the fixture',
  typeof SG01_FACT?.factKey === 'string' && SG01_FACT.factKey.startsWith('FP.REQUIRED_CONTROL.'),
  SG01_FACT?.factKey ?? '(no fact)');
ok('C2. no `factKey` property anywhere in the stage wire schema',
  !stageSchemaJson.includes('factKey'));
ok('C3. the computed factKey value never appears in the request at all',
  !stageSchemaJson.includes(SG01_CANDIDATE.factKey)
  && !stageUserPrompt.includes(SG01_CANDIDATE.factKey)
  && !GOVERNED_BINDING_STAGE_SYSTEM_PROMPT.includes(SG01_CANDIDATE.factKey),
  'the model addresses facts by a HazLenz-minted request-scoped reference');
ok('C4. the minted reference resolves back to the factKey deterministically',
  mintFactRefs(STAGE_INPUT.facts).refToFactKey.F1 === SG01_CANDIDATE.factKey
  && mintFactRefs(STAGE_INPUT.facts).refs.join(',') === 'F1');
ok('C5. no HazLenz-owned decision field is offered on the wire',
  ['status', 'priority', 'acceptableEvidence', 'settled', 'covered', 'resolved', 'source',
    'modelAuthored'].every(f => !stageSchemaJson.includes(`"${f}"`)));
ok('C6. the stage schema offers exactly four properties on one item',
  measureSchemaComplexity(buildGovernedBindingWireSchema(STAGE_INPUT)).propertyNodes === 5,
  'one top-level `bindings` + four item properties');
ok('C7. the stage carries its own request-contract identity for the circuit breaker',
  (GOVERNED_BINDING_REQUEST_CONTRACT_ID as string) !== 'hazlenz.expert.first-pass-instruction.vNext'
  && GOVERNED_BINDING_STAGE_VERSION.includes('governed-binding-stage'));
ok('C8. the governed record text is rendered REDACTED, and the id exactly',
  stageUserPrompt.includes(`sourceId: ${SUPPLIED_ID}`)
  && !/\b\d{2}\s*CFR\s*\d+/i.test(stageUserPrompt),
  'v15\'s citation-containment posture is unchanged by this stage');
ok('C9. the stage prompt forbids writing a citation',
  /DO NOT WRITE A REGULATORY CITATION/.test(GOVERNED_BINDING_STAGE_SYSTEM_PROMPT));

// ================================================================ D. THE BOUNDARY

const admitted = checkGovernedBindings(response(entry()), STAGE_INPUT);
ok('D1. a well-formed binding to a supplied id is admitted',
  admitted.perFact[0].outcome === 'BOUND'
  && admitted.perFact[0].boundGovernedSourceIds.join(',') === SUPPLIED_ID
  && admitted.boundPairs.length === 1
  && admitted.boundPairs[0].factKey === SG01_CANDIDATE.factKey);

const unsupplied = checkGovernedBindings(
  response(entry({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })), STAGE_INPUT);
ok('D2. an UNSUPPLIED sourceId is refused by exact set membership',
  unsupplied.perFact[0].outcome === 'REFUSED'
  && unsupplied.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')
  && unsupplied.perFact[0].boundGovernedSourceIds.length === 0
  && unsupplied.boundPairs.length === 0);

const respelled = checkGovernedBindings(
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID.toLowerCase()] })), STAGE_INPUT);
ok('D3. a respelled id is refused rather than normalised to the near match',
  respelled.perFact[0].outcome === 'REFUSED'
  && respelled.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'),
  `${SUPPLIED_ID.toLowerCase()} is not ${SUPPLIED_ID}`);

const plainModeUnsupplied = checkGovernedBindings(
  response(entry({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })),
  { ...STAGE_INPUT, governedIdTransport: 'PLAIN_STRING' });
ok('D4. dropping the transport enum does NOT weaken the boundary',
  plainModeUnsupplied.perFact[0].outcome === 'REFUSED'
  && plainModeUnsupplied.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'),
  'the closed set has always actually lived at the boundary');

const noBinding = checkGovernedBindings(response(entry({
  determination: 'NO_BINDING', governedEvidenceSourceIds: [],
  bearingStatement: 'the supplied records concern something else',
})), STAGE_INPUT);
ok('D5. explicit NO_BINDING is representable and is not a refusal',
  noBinding.perFact[0].outcome === 'NOT_BOUND' && noBinding.perFact[0].codes.length === 0
  && noBinding.refusedCount === 0 && noBinding.undeterminedCount === 0);

const cannot = checkGovernedBindings(response(entry({
  determination: 'CANNOT_DETERMINE', governedEvidenceSourceIds: [],
  bearingStatement: 'deciding would need more of the observation than I was shown',
})), STAGE_INPUT);
ok('D6. CANNOT_DETERMINE is a distinct, non-refusal abstention',
  cannot.perFact[0].outcome === 'CANNOT_DETERMINE' && cannot.perFact[0].codes.length === 0
  && cannot.perFact[0].outcome !== noBinding.perFact[0].outcome,
  'abstention and a negative result are not the same event');

const silent = checkGovernedBindings(response(), STAGE_INPUT);
ok('D7. a fact nobody answered is NO_DETERMINATION_RETURNED, never NOT_BOUND',
  silent.perFact[0].outcome === 'NO_DETERMINATION_RETURNED' && silent.undeterminedCount === 1
  && (silent.perFact[0].outcome as string) !== 'NOT_BOUND',
  'silence and a finding are never the same observable outcome');

const contradictionA = checkGovernedBindings(
  response(entry({ determination: 'BINDS', governedEvidenceSourceIds: [] })), STAGE_INPUT);
const contradictionB = checkGovernedBindings(
  response(entry({ determination: 'NO_BINDING' })), STAGE_INPUT);
ok('D8. a determination that contradicts its id list is refused, not repaired',
  contradictionA.perFact[0].codes.includes('BINDS_NAMES_NO_SOURCE')
  && contradictionB.perFact[0].codes.includes('NON_BINDING_CARRIES_A_SOURCE')
  && contradictionA.perFact[0].outcome === 'REFUSED'
  && contradictionB.perFact[0].outcome === 'REFUSED');

const withFactKey = checkGovernedBindings(
  response(entry({ factKey: 'FP.REQUIRED_CONTROL.OBS-SG-01.0-9.1' })), STAGE_INPUT);
ok('D9. an entry that tries to NAME a fact is refused with a countable code',
  withFactKey.perFact[0].outcome === 'REFUSED'
  && withFactKey.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));

let forbiddenMissed = 0;
for (const f of BINDING_FORBIDDEN_FIELDS) {
  const r = checkGovernedBindings(response(entry({ [f]: 'x' })), STAGE_INPUT);
  if (!r.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')) forbiddenMissed += 1;
}
ok('D10. every forbidden field name is refused, not just factKey',
  forbiddenMissed === 0, `${BINDING_FORBIDDEN_FIELDS.length} names checked`);

const cited = checkGovernedBindings(response(entry({
  bearingStatement: 'the record at 29 CFR 1910.151 requires drenching facilities',
})), STAGE_INPUT);
ok('D11. a citation in the one free-text field refuses the entry',
  cited.perFact[0].outcome === 'REFUSED'
  && cited.perFact[0].codes.includes('PROHIBITED_REGULATORY_CITATION'));

const noStatement = checkGovernedBindings(response(entry({ bearingStatement: '   ' })), STAGE_INPUT);
ok('D12. a missing bearing statement refuses the entry',
  noStatement.perFact[0].codes.includes('BEARING_STATEMENT_MISSING'));

const orphan = checkGovernedBindings(response(entry({ factRef: 'F9' })), STAGE_INPUT);
ok('D13. an entry naming an unminted reference is counted as an orphan, never reattached',
  orphan.orphanEntries === 1 && orphan.perFact[0].outcome === 'NO_DETERMINATION_RETURNED'
  && orphan.boundPairs.length === 0,
  'attaching a binding to the wrong fact is worse than losing it');

const dup = checkGovernedBindings(response(entry(), entry({ determination: 'NO_BINDING', governedEvidenceSourceIds: [] })), STAGE_INPUT);
ok('D14. two answers for one fact is a contradiction and refuses that fact',
  dup.perFact[0].outcome === 'REFUSED' && dup.perFact[0].codes.includes('FACT_REF_DUPLICATED')
  && dup.boundPairs.length === 0);

// Per-entry refusal isolation, over a two-fact input.
const SECOND: BindingCandidateFact = { ...SG01_CANDIDATE, factKey: `${SG01_CANDIDATE.factKey}Z` };
const TWO_FACTS: GovernedBindingStageInput = { ...STAGE_INPUT, facts: [SG01_CANDIDATE, SECOND] };
const isolated = checkGovernedBindings(
  { bindings: [
    { ...entry(), governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] },
    { ...entry(), factRef: 'F2' },
  ] }, TWO_FACTS);
ok('D15. a refused entry does not destroy an independent well-formed one',
  isolated.perFact[0].outcome === 'REFUSED' && isolated.perFact[1].outcome === 'BOUND'
  && isolated.boundPairs.length === 1 && isolated.boundPairs[0].factKey === SECOND.factKey,
  'the displacement failure the owed-fact layer exists to prevent');

const notObject = checkGovernedBindings('not an object', STAGE_INPUT);
const notArray = checkGovernedBindings({ bindings: 'nope' }, STAGE_INPUT);
ok('D16. a response of the wrong SHAPE is refused whole, and every fact is undetermined',
  notObject.responseCodes.includes('RESPONSE_NOT_AN_OBJECT')
  && notArray.responseCodes.includes('BINDINGS_NOT_AN_ARRAY')
  && notObject.perFact.every(f => f.outcome === 'NO_DETERMINATION_RETURNED')
  && notArray.perFact.every(f => f.outcome === 'NO_DETERMINATION_RETURNED'));

ok('D17. the determination vocabulary and the outcome vocabulary are both closed',
  BINDING_DETERMINATIONS.length === 3 && FACT_BINDING_OUTCOMES.length === 5
  && checkGovernedBindings(response(entry({ determination: 'SETTLED' })), STAGE_INPUT)
    .perFact[0].codes.includes('DETERMINATION_NOT_A_MEMBER'));

// ================================================================ E. NO SETTLEMENT, NO ESCALATION

const CRITERION: AcceptableEvidence = {
  requirement: 'evidence that the supply sustains flow to both heads for the full flushing period',
  provenance: 'GOVERNED_EVIDENCE',
};
const enriched = applyGovernedBindings([SG01_FACT], admitted, { [SUPPLIED_ID]: CRITERION });

ok('E1. a bound fact stays UNRESOLVED',
  enriched.facts[0].status === 'UNRESOLVED' && SG01_FACT.status === 'UNRESOLVED');
ok('E2. a bound fact does not change priority',
  enriched.facts[0].priority === SG01_FACT.priority && SG01_FACT.priority === 'OTHER',
  'a model-selected binding cannot escalate a fact toward UNRESOLVED_SAFETY_STATE');
ok('E3. binding attaches only the criterion HazLenz already held',
  enriched.facts[0].acceptableEvidence === CRITERION
  && enriched.outcomes[0].reason === 'CRITERION_ATTACHED'
  && enriched.outcomes[0].sourceId === SUPPLIED_ID);
ok('E4. no other field of the fact is altered',
  (['factKey', 'affectedDecision', 'source', 'evidenceSpan', 'whyUnresolved', 'branchA', 'branchB',
    'modelAuthored'] as const).every(k => JSON.stringify(enriched.facts[0][k]) === JSON.stringify(SG01_FACT[k]))
  && JSON.stringify(enriched.facts[0].decisionDivergence) === JSON.stringify(SG01_FACT.decisionDivergence));
ok('E5. no fact is added and none is removed',
  enriched.facts.length === 1 && enriched.facts[0].factKey === SG01_FACT.factKey);

const already = applyGovernedBindings(
  [{ ...SG01_FACT, acceptableEvidence: CRITERION }], admitted,
  { [SUPPLIED_ID]: { ...CRITERION, requirement: 'a different criterion' } });
ok('E6. an existing criterion is never overwritten by a model-selected binding',
  already.outcomes[0].reason === 'CRITERION_ALREADY_HELD'
  && already.facts[0].acceptableEvidence?.requirement === CRITERION.requirement);

const noCriterion = applyGovernedBindings([SG01_FACT], admitted, {});
ok('E7. a binding with no criterion held changes nothing and is not an error',
  noCriterion.outcomes[0].reason === 'NO_CRITERION_HELD'
  && noCriterion.facts[0].acceptableEvidence === null);

const unbound = applyGovernedBindings([SG01_FACT], noBinding, { [SUPPLIED_ID]: CRITERION });
ok('E8. a NOT_BOUND fact receives nothing',
  unbound.outcomes[0].reason === 'NO_BINDING' && unbound.facts[0].acceptableEvidence === null);

const eff = governedBindingStageEffect();
ok('E9. the stage\'s declared effect is all-false and typed as literals',
  Object.values(eff).every(v => v === false) && Object.keys(eff).length === 8);

// ================================================================ F. INVOCATION AND RESIDUALS

ok('F1. the stage is not called when no governed evidence was supplied',
  stageInvocation({ ...STAGE_INPUT, governedRecords: [] }).shouldCall === false
  && stageInvocation({ ...STAGE_INPUT, governedRecords: [] }).reason === 'NO_GOVERNED_EVIDENCE_SUPPLIED',
  'ten of §199\'s twelve rows would issue zero extra calls');
ok('F2. the stage is not called when the projection admitted no fact',
  stageInvocation({ ...STAGE_INPUT, facts: [] }).shouldCall === false
  && stageInvocation({ ...STAGE_INPUT, facts: [] }).reason === 'NO_PROJECTED_FACTS_TO_BIND');
ok('F3. the stage IS called for a governed row with at least one projected fact',
  stageInvocation(STAGE_INPUT).shouldCall === true);

let duplicateKeyRefused = false;
try { mintFactRefs([SG01_CANDIDATE, SG01_CANDIDATE]); } catch { duplicateKeyRefused = true; }
let malformedKeyRefused = false;
try { mintFactRefs([{ ...SG01_CANDIDATE, factKey: 'not a key!' }]); } catch { malformedKeyRefused = true; }
ok('F4. a duplicate or malformed factKey aborts minting rather than being rewritten',
  duplicateKeyRefused && malformedKeyRefused);

ok('F5. the stage records what it depends on elsewhere rather than absorbing it',
  STAGE_DEPENDENCIES.length >= 3
  && STAGE_DEPENDENCIES.some(d => d.includes('OwedFact has no field for the owed property')));
ok('F6. the stage records its residual limits, including non-atomicity',
  STAGE_RESIDUAL_LIMITS.length >= 5
  && STAGE_RESIDUAL_LIMITS.some(d => d.includes('no longer atomic'))
  && STAGE_RESIDUAL_LIMITS.some(d => d.includes('threshold is undocumented')));

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  NO SEMANTIC VERDICT IS SUPPLIED OR IMPLIED BY THIS SUITE.');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
