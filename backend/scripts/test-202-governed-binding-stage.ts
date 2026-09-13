/**
 * §202 -- GOVERNED-BINDING STAGE INTEGRATION SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Proves the B1..B20 properties the §202 authorization names, plus the supporting properties that
 * make them mean anything: that the ordinary capability-ABSENT first pass is untouched, that §202's
 * boundary agrees with §201's in the default exposure mode, and that the identity seal is enforced.
 *
 * WHAT THIS SUITE DOES NOT DO. It supplies no semantic verdict about any §199 model output, fills no
 * §200 adjudication slot, and makes no claim that any binding is CORRECT, PARTIALLY_CORRECT,
 * INCORRECT, AMBIGUOUS or a TRUTH_SPECIFICATION_DEFECT. Every fixture is a STRUCTURAL fixture: it
 * exercises shapes the boundary must accept or refuse and asserts nothing about safety truth.
 *
 * B20 IS DIAGNOSTIC EVIDENCE, NOT PROVIDER ACCEPTANCE. No figure in section B is the provider's
 * compiled-grammar metric, none of them proves any request will be accepted, and the threshold
 * remains undocumented.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { stableStringify } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import type { AcceptableEvidence } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  buildExpertVNextWireSchema, buildExpertVNextSystemPrompt, buildExpertVNextUserPrompt,
  governedBindingFor, governedBindingCapability,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-vnext';
import { evaluateNarrowedInvariants } from './lib/expert-212-pm1-assertion-repair';
import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { SECTION_199_COHORT } from './lib/expert-199-cohort-2026-09-07';
import {
  checkGovernedBindings as check201, type GovernedBindingStageInput as Stage201Input,
} from './lib/expert-201-governed-binding-stage';
import {
  GOVERNED_BINDING_CONTRACT_202_VERSION, GOVERNED_BINDING_202_REQUEST_CONTRACT_ID,
  GOVERNED_BINDING_202_SYSTEM_PROMPT, BINDING_DETERMINATIONS_202, FACT_BINDING_OUTCOMES_202,
  BINDING_REFUSAL_CODES_202, GOVERNED_STAGE_202_FORBIDDEN_FIELDS,
  GOVERNED_STAGE_202_SEMANTIC_FIELDS, GOVERNED_STAGE_202_TEXT_RETURN_FIELDS,
  GOVERNED_STAGE_202_PERMITTED_AUTHORITY, GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY,
  GOVERNED_TEXT_EXPOSURE_CONCLUSIONS, STAGE_202_CITATION_AUTHORITY, DUPLICATE_HANDLING_RULES,
  ENTRY_ISOLATION_IS_PART_OF_THE_CONTRACT, GRAMMAR_MEASUREMENT_CLAIMS_202, IDENTITY_SEAL_CLAIMS,
  STAGE_202_DEPENDENCIES, STAGE_202_RESIDUAL_LIMITS, STAGE_202_WITHHELD_DECISIONS,
  STAGE_202_ACTIVATION, DEFAULT_GOVERNED_TEXT_EXPOSURE,
  type BindingCandidateFact202, type Governed202StageInput,
  applyGoverned202Bindings, buildGoverned202UserPrompt, buildGoverned202WireSchema,
  buildStage202SystemPrompt, checkGoverned202Bindings, governed202StageEffect,
  measureRequest202, measureSchemaComplexity202, mintFactRefs202, sealFactIdentities,
  stageInvocation202,
} from './lib/expert-202-governed-binding-contract';
import {
  GOVERNED_STAGE_PIPELINE_ORDER, PLACEMENT_RATIONALE, FIRST_PASS_PRESERVATION_CLAIMS,
  PIPELINE_202_ACTIVATION_CLAIMS, BINDING_EXCLUSION_REASONS,
  buildGoverned202Request, firstPassBindingUnderSeparateStage, runGovernedStagePipeline,
  type Governed202Request,
} from './lib/expert-202-governed-stage-pipeline';

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
const SG02 = row('SG-02');
const SF01 = row('SF-01');

/** The REAL sourceId shape the §199 executor builds: `OBS-${rowId}`, never a placeholder. */
const inputFor = (r: typeof SECTION_199_COHORT[number]): ExpertAnalysisInput => ({
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: `AN-199-${r.rowId}`,
  authoritativeSources: [
    { sourceId: `OBS-${r.rowId}`, sourceType: 'observation', text: r.observation },
  ],
  inspectionContext: { location: r.location, task: r.task },
  jurisdiction: r.jurisdiction,
  allowedHazardFamilies: [...r.allowedHazardFamilies],
  deterministicFindings: r.deterministicFindings.map(
    f => ({ ...f, requiredActions: [...f.requiredActions] })),
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
 * observation so the real projection admits it. Nothing here is a semantic claim about SG-01, about
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

const SG01_CANDIDATE: BindingCandidateFact202 = {
  factKey: SG01_FACT.factKey,
  owedProperty: SG01_DECLARATION.missingFact,
  affectedDecision: 'REQUIRED_CONTROL',
  evidenceSpan: SG01_DECLARATION.observationSpan,
  whyUnresolved: SG01_DECLARATION.notEstablishedBecause,
  branchA: SG01_DECLARATION.branchA,
  branchB: SG01_DECLARATION.branchB,
};

const GOV_SG01 = recordsFor(SG01);
const GOV_SG02 = recordsFor(SG02);
const SUPPLIED_ID = GOV_SG01[0].sourceId;
const SUPPLIED_ID_2 = GOV_SG02[0].sourceId;

const sealFor = (facts: readonly BindingCandidateFact202[]) =>
  sealFactIdentities('AN-202-SG-01', facts);

const STAGE_INPUT: Governed202StageInput = {
  analysisId: 'AN-202-SG-01',
  facts: [SG01_CANDIDATE],
  governedRecords: GOV_SG01,
  inspectionContext: { location: SG01.location, task: SG01.task },
  identitySeal: sealFor([SG01_CANDIDATE]),
};

const entry = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  factRef: 'F1',
  determination: 'BINDS',
  governedEvidenceSourceIds: [SUPPLIED_ID],
  bearingStatement: 'the record states what a drenching facility must be able to provide',
  ...over,
});
const response = (...items: unknown[]): unknown => ({ bindings: items });

// ================================================================ P. PLACEMENT AND ACTIVATION

ok('P1. the pipeline order places the stage after identity and before enrichment',
  GOVERNED_STAGE_PIPELINE_ORDER.map(s => s.name).join(' > ')
  === 'FIRST_PASS > STRUCTURED_DECLARATIONS > DETERMINISTIC_VALIDATION_AND_IDENTITY > '
  + 'IDENTITY_SEAL > GOVERNED_BINDING_STAGE_GATE > GOVERNED_BINDING_NOMINATION > '
  + 'GOVERNED_BINDING_BOUNDARY > ENRICHMENT > VERIFIER');

ok('P2. the chosen placement is recorded with the three rejected alternatives and their evidence',
  PLACEMENT_RATIONALE.filter(p => !p.rejected).length === 1
  && PLACEMENT_RATIONALE.filter(p => p.rejected).length === 4
  && PLACEMENT_RATIONALE.every(p => p.repositoryEvidence.length > 80),
  '4 rejected, 1 chosen, every one carrying repository evidence');

ok('P3. nothing here is activated on any customer or active Expert path',
  Object.values(STAGE_202_ACTIVATION).every(v => v === false)
  && Object.values(PIPELINE_202_ACTIVATION_CLAIMS).every(v => v === false));

ok('P4. the stage carries its own request-contract identity for the circuit breaker',
  (GOVERNED_BINDING_202_REQUEST_CONTRACT_ID as string)
  !== 'hazlenz.expert.first-pass-instruction.vNext'
  && (GOVERNED_BINDING_202_REQUEST_CONTRACT_ID as string)
  !== 'hazlenz.expert.governed-binding-stage.v1.request'
  && GOVERNED_BINDING_CONTRACT_202_VERSION.includes('governed-binding-contract.202'));

ok('P5. §202 records what it is not allowed to decide, rather than deciding it',
  STAGE_202_WITHHELD_DECISIONS.length === 3
  && STAGE_202_WITHHELD_DECISIONS.some(d => d.includes('OwedFact representation decision'))
  && STAGE_202_WITHHELD_DECISIONS.some(d => d.includes('escalation policy'))
  && STAGE_202_WITHHELD_DECISIONS.some(d => d.includes('semantic verdict')));

ok('P6. the authority contract lists four permitted acts and eleven named prohibitions',
  GOVERNED_STAGE_202_PERMITTED_AUTHORITY.length === 4
  && GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY.length === 11
  && GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY.every(f => f.mechanism.length > 40),
  'every prohibition names a structural mechanism, never an instruction alone');

// ================================================================ B1..B20

// ---------------------------------------------------------------- B1. zero governed sources

const noGovernedGate = stageInvocation202({ facts: [SG01_CANDIDATE], governedRecords: [] });
const noFactsGate = stageInvocation202({ facts: [], governedRecords: GOV_SG01 });
ok('B1. zero governed sources means the stage is NOT invoked, and that is not a failure',
  noGovernedGate.shouldCall === false
  && noGovernedGate.reason === 'NO_GOVERNED_EVIDENCE_SUPPLIED'
  && noFactsGate.shouldCall === false
  && noFactsGate.reason === 'NO_PROJECTED_FACTS_TO_BIND'
  && stageInvocation202({ facts: [SG01_CANDIDATE], governedRecords: GOV_SG01 }).shouldCall === true,
  'ten of §199\'s twelve rows would issue zero extra calls');

// ---------------------------------------------------------------- B2. one governed source

const oneSource = checkGoverned202Bindings(response(entry()), STAGE_INPUT);
ok('B2. one governed source: a well-formed binding to the supplied id is admitted',
  oneSource.perFact[0].outcome === 'BOUND'
  && oneSource.perFact[0].boundGovernedSourceIds.join(',') === SUPPLIED_ID
  && oneSource.boundPairs.length === 1
  && oneSource.boundPairs[0].factKey === SG01_CANDIDATE.factKey
  && oneSource.boundPairs[0].sourceId === SUPPLIED_ID);

// ---------------------------------------------------------------- B3. multiple governed sources

const TWO_RECORDS = [...GOV_SG01, ...GOV_SG02];
const MULTI_INPUT: Governed202StageInput = { ...STAGE_INPUT, governedRecords: TWO_RECORDS };
const multi = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID, SUPPLIED_ID_2] })), MULTI_INPUT);
ok('B3. multiple governed sources: both supplied ids bind, in the order the model named them',
  multi.perFact[0].outcome === 'BOUND'
  && multi.perFact[0].boundGovernedSourceIds.join(',') === `${SUPPLIED_ID},${SUPPLIED_ID_2}`
  && multi.boundPairs.length === 2
  && JSON.stringify(buildGoverned202WireSchema(MULTI_INPUT)).includes(SUPPLIED_ID_2),
  `${TWO_RECORDS.length} supplied records enumerated in the closed set`);

// ---------------------------------------------------------------- B4. supplied id accepted

const schemaIds = ((buildGoverned202WireSchema(MULTI_INPUT).properties as any)
  .bindings.items.properties.governedEvidenceSourceIds.items.enum) as string[];
ok('B4. a supplied id is accepted structurally: it is in the transport enum AND in the closed set',
  schemaIds.join(',') === `${SUPPLIED_ID},${SUPPLIED_ID_2}`
  && checkGoverned202Bindings(response(entry()), STAGE_INPUT).perFact[0].outcome === 'BOUND');

// ---------------------------------------------------------------- B5. unsupplied id rejected

const unsupplied = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })), STAGE_INPUT);
const respelled = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID.toLowerCase()] })), STAGE_INPUT);
const crossRow = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID_2] })), STAGE_INPUT);
ok('B5. an unsupplied, respelled or other-row id is refused by exact set membership',
  unsupplied.perFact[0].outcome === 'REFUSED'
  && unsupplied.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')
  && unsupplied.boundPairs.length === 0
  && respelled.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')
  && crossRow.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'),
  'refused rather than normalised to the near match');

const plainUnsupplied = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })),
  { ...STAGE_INPUT, governedIdTransport: 'PLAIN_STRING' });
ok('B5a. dropping the transport enum does NOT weaken the boundary',
  plainUnsupplied.perFact[0].outcome === 'REFUSED'
  && plainUnsupplied.perFact[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'),
  'the closed set has always actually lived at the boundary, not in the transport');

// ---------------------------------------------------------------- B6. duplicate supplied ids

const dupWithinEntry = checkGoverned202Bindings(
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID, SUPPLIED_ID] })), STAGE_INPUT);
let dupSuppliedSetAborted = false;
try {
  buildGoverned202WireSchema({ ...STAGE_INPUT, governedRecords: [...GOV_SG01, ...GOV_SG01] });
} catch { dupSuppliedSetAborted = true; }
const dupFactRef = checkGoverned202Bindings(
  response(entry(), entry({ determination: 'NO_BINDING', governedEvidenceSourceIds: [] })),
  STAGE_INPUT);
ok('B6. every duplicate case REJECTS, per the explicit rule table — nothing is normalised',
  DUPLICATE_HANDLING_RULES.length === 5
  && dupWithinEntry.perFact[0].outcome === 'REFUSED'
  && dupWithinEntry.perFact[0].codes.includes('GOVERNED_SOURCE_ID_DUPLICATED')
  && dupSuppliedSetAborted
  && dupFactRef.perFact[0].outcome === 'REFUSED'
  && dupFactRef.perFact[0].codes.includes('FACT_REF_DUPLICATED')
  && dupFactRef.boundPairs.length === 0,
  'within-entry duplicate, duplicate supplied record, and two answers for one fact');

// ---------------------------------------------------------------- B7. malformed supplied id

const malformedIds = ['GOV WITH SPACE', '', '-leading-hyphen', 'x'.repeat(200), 'göv-01'];
let malformedAborts = 0;
for (const bad of malformedIds) {
  try {
    buildGoverned202WireSchema({
      ...STAGE_INPUT, governedRecords: [{ sourceId: bad, text: 'some governed text' }],
    });
  } catch { malformedAborts += 1; }
}
let emptyTextAborted = false;
try {
  buildGoverned202WireSchema({
    ...STAGE_INPUT, governedRecords: [{ sourceId: 'GOV-OK-01', text: '  ' }],
  });
} catch { emptyTextAborted = true; }
ok('B7. a malformed supplied id ABORTS the stage rather than being normalised into legality',
  malformedAborts === malformedIds.length && emptyTextAborted,
  `${malformedAborts}/${malformedIds.length} malformed ids aborted; empty record text aborted too`);

// ---------------------------------------------------------------- B8. sourceId/text pairing

const stageSchemaJson = JSON.stringify(buildGoverned202WireSchema(STAGE_INPUT));
const stageUserPrompt = buildGoverned202UserPrompt(STAGE_INPUT);
let textFieldsRefused = 0;
for (const f of GOVERNED_STAGE_202_TEXT_RETURN_FIELDS) {
  const r = checkGoverned202Bindings(response(entry({ [f]: 'invented governed text' })), STAGE_INPUT);
  if (r.perFact[0].outcome === 'REFUSED'
    && r.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')) textFieldsRefused += 1;
}
ok('B8. an incorrect sourceId/text pairing is structurally impossible',
  // no text-bearing property exists on the wire in either direction …
  GOVERNED_STAGE_202_TEXT_RETURN_FIELDS.every(f => !stageSchemaJson.includes(`"${f}"`))
  // … the pairing is held by HazLenz, keyed by the supplied id, and rendered from it …
  && stageUserPrompt.includes(`sourceId: ${SUPPLIED_ID}`)
  // … and a provider that invents a text field is COUNTED, not silently ignored.
  && textFieldsRefused === GOVERNED_STAGE_202_TEXT_RETURN_FIELDS.length,
  `${textFieldsRefused} text-return field names refused; the model can only ever name an id`);

// ---------------------------------------------------------------- B9. abstention / no binding

const noBinding = checkGoverned202Bindings(response(entry({
  determination: 'NO_BINDING', governedEvidenceSourceIds: [],
  bearingStatement: 'the supplied records concern something else',
})), STAGE_INPUT);
const cannot = checkGoverned202Bindings(response(entry({
  determination: 'CANNOT_DETERMINE', governedEvidenceSourceIds: [],
  bearingStatement: 'deciding would need more of the observation than I was shown',
})), STAGE_INPUT);
const silent = checkGoverned202Bindings(response(), STAGE_INPUT);
ok('B9. abstention is representable three separate ways, and none of them is a refusal',
  noBinding.perFact[0].outcome === 'NOT_BOUND' && noBinding.perFact[0].codes.length === 0
  && cannot.perFact[0].outcome === 'CANNOT_DETERMINE' && cannot.perFact[0].codes.length === 0
  && silent.perFact[0].outcome === 'NO_DETERMINATION_RETURNED' && silent.undeterminedCount === 1
  && new Set([noBinding.perFact[0].outcome, cannot.perFact[0].outcome,
    silent.perFact[0].outcome]).size === 3,
  'a negative finding, an abstention and silence are three different events');

// ---------------------------------------------------------------- B10. cannot author factKey

const withFactKey = checkGoverned202Bindings(
  response(entry({ factKey: 'FP.REQUIRED_CONTROL.OBS-SG-01.0-9.1' })), STAGE_INPUT);
ok('B10. the provider cannot author a factKey',
  !stageSchemaJson.includes('factKey')
  && !stageUserPrompt.includes(SG01_CANDIDATE.factKey)
  && !GOVERNED_BINDING_202_SYSTEM_PROMPT.includes(SG01_CANDIDATE.factKey)
  && withFactKey.perFact[0].outcome === 'REFUSED'
  && withFactKey.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
  && mintFactRefs202(STAGE_INPUT.facts).refToFactKey.F1 === SG01_CANDIDATE.factKey,
  'no field on the wire, the value never transmitted, and the name refused if invented');

// ---------------------------------------------------------------- B11. cannot change decision

const withDecision = checkGoverned202Bindings(
  response(entry({ affectedDecision: 'APPLICABILITY' })), STAGE_INPUT);
ok('B11. the provider cannot change affectedDecision',
  GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes('affectedDecision')
  && !stageSchemaJson.includes('"affectedDecision"')
  && withDecision.perFact[0].outcome === 'REFUSED'
  && withDecision.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'),
  '§201 left this to additionalProperties alone; §202 names it at the boundary');

// ---------------------------------------------------------------- B12. cannot change branches

const branchFields = ['branchA', 'branchB', 'decisionIfA', 'decisionIfB', 'decisionDivergence',
  'evidenceSpan', 'whyUnresolved'];
let branchRefused = 0;
for (const f of branchFields) {
  const r = checkGoverned202Bindings(response(entry({ [f]: 'rewritten' })), STAGE_INPUT);
  if (r.perFact[0].outcome === 'REFUSED'
    && r.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')) branchRefused += 1;
}
ok('B12. the provider cannot rewrite branch semantics or the span',
  branchRefused === branchFields.length
  && branchFields.every(f => GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes(f))
  && branchFields.every(f => !stageSchemaJson.includes(`"${f}"`)),
  `${branchRefused}/${branchFields.length} refused at the boundary and absent from the wire`);

// ---------------------------------------------------------------- B13. cannot settle

const settleFields = ['status', 'settled', 'resolved', 'covered', 'acceptableEvidence'];
let settleRefused = 0;
for (const f of settleFields) {
  const r = checkGoverned202Bindings(response(entry({ [f]: 'SETTLED' })), STAGE_INPUT);
  if (r.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')) settleRefused += 1;
}
const CRITERION: AcceptableEvidence = {
  requirement: 'evidence that the supply sustains flow to both heads for the full flushing period',
  provenance: 'GOVERNED_EVIDENCE',
};
const enriched = applyGoverned202Bindings([SG01_FACT], oneSource, { [SUPPLIED_ID]: CRITERION });
ok('B13. the provider cannot settle a fact, and a bound fact stays UNRESOLVED',
  settleRefused === settleFields.length
  && checkGoverned202Bindings(response(entry({ determination: 'SETTLED' })), STAGE_INPUT)
    .perFact[0].codes.includes('DETERMINATION_NOT_A_MEMBER')
  && enriched.facts[0].status === 'UNRESOLVED'
  && SG01_FACT.status === 'UNRESOLVED'
  && governed202StageEffect().factsMayBeSettled === false,
  'binding attaches a criterion HazLenz already held and changes no task state');

// ---------------------------------------------------------------- B14. cannot escalate priority

const withPriority = checkGoverned202Bindings(
  response(entry({ priority: 'LIFE_CRITICAL' })), STAGE_INPUT);
ok('B14. the provider cannot escalate priority or reach UNRESOLVED_SAFETY_STATE',
  withPriority.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
  && !stageSchemaJson.includes('"priority"')
  && enriched.facts[0].priority === SG01_FACT.priority
  && SG01_FACT.priority === 'OTHER'
  && governed202StageEffect().priorityMayChange === false
  && governed202StageEffect().unresolvedSafetyStateMayBeEscalated === false,
  'the enrichment copies priority unchanged; escalation policy is withheld from §202 entirely');

// ---------------------------------------------------------------- B15/B16. citation authority

/** The real citation token the §199 governed record for SG-01 actually contains. */
const SUPPLIED_TOKEN = '29 CFR 1910.151(c)';
/** A citation the supplied record does NOT contain. */
const UNSUPPLIED_TOKEN = '29 CFR 1910.147';
/** A near-miss: the right section, a paragraph the supplied text does not carry. */
const ALTERED_TOKEN = '29 CFR 1910.151(d)';

const VERBATIM_INPUT: Governed202StageInput = {
  ...STAGE_INPUT,
  governedTextExposure: 'SUPPLIED_VERBATIM',
  verbatimExposureRuling: 'TEST-FIXTURE-ONLY: no product-owner ruling exists; this exercises the '
    + 'gate mechanism offline and activates nothing',
};

ok('B15pre. the supplied governed record really does contain the token being reused',
  GOV_SG01[0].text.includes(SUPPLIED_TOKEN)
  && !GOV_SG01[0].text.includes(UNSUPPLIED_TOKEN)
  && !GOV_SG01[0].text.includes(ALTERED_TOKEN),
  'the fixture is anchored in the real §199 record, not in an invented one');

const citedSupplied = checkGoverned202Bindings(response(entry({
  bearingStatement: `the supplied record at ${SUPPLIED_TOKEN} states what a drenching facility `
    + 'must provide',
})), VERBATIM_INPUT);
ok('B15. citation-shaped text that WAS supplied is admitted as reproduction, in verbatim exposure',
  citedSupplied.perFact[0].outcome === 'BOUND'
  && citedSupplied.perFact[0].codes.length === 0
  && citedSupplied.perFact[0].citationReuse?.allReuse === true
  && citedSupplied.exposure === 'SUPPLIED_VERBATIM',
  'exact equality against a token present in the SUPPLIED set — nothing fuzzy');

const citedUnsupplied = checkGoverned202Bindings(response(entry({
  bearingStatement: `the record at ${UNSUPPLIED_TOKEN} governs this`,
})), VERBATIM_INPUT);
const citedAltered = checkGoverned202Bindings(response(entry({
  bearingStatement: `the record at ${ALTERED_TOKEN} governs this`,
})), VERBATIM_INPUT);
const citedMixed = checkGoverned202Bindings(response(entry({
  bearingStatement: `${SUPPLIED_TOKEN} and also ${UNSUPPLIED_TOKEN}`,
})), VERBATIM_INPUT);
const citedRedacted = checkGoverned202Bindings(response(entry({
  bearingStatement: `the supplied record at ${SUPPLIED_TOKEN} states what is required`,
})), STAGE_INPUT);
ok('B16. citation-shaped text that was NOT supplied remains outside the stage\'s authority',
  citedUnsupplied.perFact[0].outcome === 'REFUSED'
  && citedUnsupplied.perFact[0].codes.includes('UNAUTHORISED_REGULATORY_CITATION')
  && citedAltered.perFact[0].codes.includes('UNAUTHORISED_REGULATORY_CITATION')
  && citedMixed.perFact[0].codes.includes('UNAUTHORISED_REGULATORY_CITATION')
  && citedRedacted.perFact[0].outcome === 'REFUSED'
  && citedRedacted.perFact[0].codes.includes('PROHIBITED_REGULATORY_CITATION'),
  'invented, altered, mixed — all refused; and in the DEFAULT exposure even the supplied one is');

ok('B16a. the non-default exposure cannot be activated without an explicit ruling reference',
  (() => {
    try {
      buildGoverned202UserPrompt({ ...STAGE_INPUT, governedTextExposure: 'SUPPLIED_VERBATIM' });
      return false;
    } catch { return true; }
  })()
  && DEFAULT_GOVERNED_TEXT_EXPOSURE === 'REDACTED'
  && GOVERNED_TEXT_EXPOSURE_CONCLUSIONS.SUPPLIED_VERBATIM_IS_THE_DEFAULT === false
  && GOVERNED_TEXT_EXPOSURE_CONCLUSIONS.ACTIVATING_SUPPLIED_VERBATIM_NEEDS_A_PRODUCT_OWNER_RULING
  === true,
  'a boolean would be an authorization nobody had to obtain; a ruling reference is not');

ok('B16b. the default exposure renders governed text REDACTED, exactly as §198 and §201 do',
  !/\b\d{2}\s*CFR\s*\d+/i.test(stageUserPrompt)
  && stageUserPrompt.includes(`sourceId: ${SUPPLIED_ID}`)
  && /\b\d{2}\s*CFR\s*\d+/i.test(buildGoverned202UserPrompt(VERBATIM_INPUT))
  && GOVERNED_TEXT_EXPOSURE_CONCLUSIONS
    .VERIFIER_V3_3_EXACT_SUPPLIED_SOURCE_CONTAINMENT_IS_WEAKENED === false
  && STAGE_202_CITATION_AUTHORITY.SYNTHESISING_EXTERNAL_AUTHORITY_IS_PERMITTED === false,
  'the id is exposed exactly in both modes; only the TEXT differs');

// ---------------------------------------------------------------- B17. isolation

const SECOND: BindingCandidateFact202 = {
  ...SG01_CANDIDATE, factKey: `${SG01_CANDIDATE.factKey}Z`,
};
const TWO_FACTS: Governed202StageInput = {
  ...STAGE_INPUT, facts: [SG01_CANDIDATE, SECOND],
  identitySeal: sealFor([SG01_CANDIDATE, SECOND]),
};
const isolated = checkGoverned202Bindings({
  bindings: [
    { ...entry(), governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] },
    { ...entry(), factRef: 'F2' },
  ],
}, TWO_FACTS);
const isolatedOrphan = checkGoverned202Bindings({
  bindings: [{ ...entry(), factRef: 'F9' }, { ...entry(), factRef: 'F2' }],
}, TWO_FACTS);
ok('B17. ISOLATION IS PART OF THE CONTRACT: a malformed sibling never corrupts a valid binding',
  ENTRY_ISOLATION_IS_PART_OF_THE_CONTRACT === true
  && isolated.perFact[0].outcome === 'REFUSED'
  && isolated.perFact[1].outcome === 'BOUND'
  && isolated.boundPairs.length === 1
  && isolated.boundPairs[0].factKey === SECOND.factKey
  && isolatedOrphan.orphanEntries === 1
  && isolatedOrphan.perFact[1].outcome === 'BOUND'
  && isolatedOrphan.perFact[0].outcome === 'NO_DETERMINATION_RETURNED',
  'per-entry refusal; only a wrong-SHAPE response refuses whole');

const wholeShape = checkGoverned202Bindings('not an object', TWO_FACTS);
const wholeArray = checkGoverned202Bindings({ bindings: 'nope' }, TWO_FACTS);
ok('B17a. the two exceptions to isolation are stated and behave as stated',
  wholeShape.responseCodes.includes('RESPONSE_NOT_AN_OBJECT')
  && wholeArray.responseCodes.includes('BINDINGS_NOT_AN_ARRAY')
  && wholeShape.perFact.every(f => f.outcome === 'NO_DETERMINATION_RETURNED')
  && wholeArray.perFact.every(f => f.outcome === 'NO_DETERMINATION_RETURNED'),
  'and every fact becomes undetermined, never NOT_BOUND');

// ---------------------------------------------------------------- B18. first-pass hashes

const protocolHashes = readFileSync(join(E199, 'PROTOCOL-HASHES.txt'), 'utf8');
const frozenRowHash = (rowId: string): string | null => {
  const m = new RegExp(`^\\s*${rowId}\\s+(ABSENT|PRESENT)\\s+([0-9a-f]{64})\\s*$`, 'm')
    .exec(protocolHashes);
  return m ? m[2] : null;
};

const FROZEN = {
  vnextModule: 'a81c63c8314f16290e0e5ead451b9f2c7e127d6eaa6c66e754ae605bec0e756e',
  projectionModule: 'aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c',
  expertPrompt: 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
  absentSystemPrompt: 'bdb3af044340dac164b979672ab61be8f14e5d190abbd7e496b82dd5010b4f7b',
};

const hashOf = (p: string): string => sha(readFileSync(p, 'utf8'));

// §212 PM-1, CLASS 2 NARROWING — PROJECTION SUB-CLAUSE ONLY. Three of the four files here have NOT
// legitimately moved, so their whole-file hashes still tell the truth and are left exactly as they
// were. The projection module HAS moved, by §210E's accepted R7 remediation, so its sub-clause is
// replaced by the narrowed invariants that state what this assertion actually meant. FROZEN
// .projectionModule is retained in the record below and is not erased.
const b18Invariants = evaluateNarrowedInvariants();
ok('B18. the first-pass protocol files are byte-unchanged by §202 '
  + '(projection sub-clause narrowed, §212 PM-1 CLASS 2)',
  hashOf(join(__dirname, 'lib', 'expert-first-pass-instruction-vnext.ts')) === FROZEN.vnextModule
  && hashOf(join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz', 'expert-prompt.ts'))
  === FROZEN.expertPrompt
  && sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT) === FROZEN.absentSystemPrompt
  && b18Invariants.every(r => r.holds),
  'vNext module, expert-prompt.ts and the ABSENT system prompt still by hash; the projection '
  + `module by ${b18Invariants.length} narrowed invariants (historical §199 hash `
  + `${FROZEN.projectionModule.slice(0, 12)}… superseded by §210E)`);

let absentDrift = 0;
const absentRows = SECTION_199_COHORT.filter(r => r.verifierGovernedEvidence.length === 0);
for (const r of absentRows) {
  const schema = buildExpertVNextWireSchema(inputFor(r), governedBindingFor(recordsFor(r)));
  if (sha(stableStringify(schema)) !== frozenRowHash(r.rowId)) absentDrift += 1;
}
ok('B18a. all ten capability-ABSENT per-row wire schemas reproduce §199\'s frozen hashes',
  absentRows.length === 10 && absentDrift === 0,
  `${absentRows.length} rows, ${absentDrift} drifted — read from the IMMUTABLE §199 evidence dir`);

const sg01SeparateStage = buildExpertVNextWireSchema(
  inputFor(SG01), firstPassBindingUnderSeparateStage());
const sg01Section199 = buildExpertVNextWireSchema(
  inputFor(SG01), governedBindingFor(recordsFor(SG01)));
ok('B18b. under §202 a governed row\'s first pass is capability-ABSENT, not §199\'s rejected schema',
  governedBindingCapability(firstPassBindingUnderSeparateStage()) === 'ABSENT'
  && sha(stableStringify(sg01Section199)) === frozenRowHash('SG-01')
  && sha(stableStringify(sg01SeparateStage)) !== frozenRowHash('SG-01')
  && !JSON.stringify(sg01SeparateStage).includes('governedEvidenceSourceIds')
  && buildExpertVNextSystemPrompt(EMPTY_BINDING) === EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT
  && EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT
  !== EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
  && Object.entries(FIRST_PASS_PRESERVATION_CLAIMS)
    .every(([k, v]) => (k.endsWith('_IS_MODIFIED') ? v === false : v === true)),
  'the rejected schema is reproduced, and §202 does not send it');

ok('B18c. the v15 governed-standards rendering under opaque handles is retained',
  !buildExpertVNextUserPrompt(inputFor(SG01), []).includes('AVAILABLE GOVERNED EVIDENCE')
  && buildExpertVNextUserPrompt(inputFor(SG01), []).includes('Medical services and first aid'),
  '§202 removes the first-pass id block, not the v15 treatment');

// ---------------------------------------------------------------- B19. §201 differential agreement

/**
 * §202 does not import §201's boundary at runtime. It is imported HERE so "§202 is §201 plus the
 * four additions" is a checked claim rather than a comment: over a battery of fixtures, in the
 * DEFAULT exposure, the two boundaries must agree outcome for outcome.
 */
const STAGE_INPUT_201: Stage201Input = {
  analysisId: STAGE_INPUT.analysisId,
  facts: [{ ...SG01_CANDIDATE }],
  governedRecords: [...GOV_SG01],
  inspectionContext: STAGE_INPUT.inspectionContext,
};
const differentialFixtures: unknown[] = [
  response(entry()),
  response(entry({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })),
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID.toLowerCase()] })),
  response(entry({ determination: 'NO_BINDING', governedEvidenceSourceIds: [] })),
  response(entry({ determination: 'CANNOT_DETERMINE', governedEvidenceSourceIds: [] })),
  response(entry({ determination: 'BINDS', governedEvidenceSourceIds: [] })),
  response(entry({ determination: 'NO_BINDING' })),
  response(entry({ determination: 'SETTLED' })),
  response(entry({ bearingStatement: '  ' })),
  response(entry({ bearingStatement: `see ${SUPPLIED_TOKEN}` })),
  response(entry({ factKey: 'FP.X.Y.0-1.1' })),
  response(entry({ factRef: 'F9' })),
  response(entry(), entry()),
  response(entry({ governedEvidenceSourceIds: [SUPPLIED_ID, SUPPLIED_ID] })),
  response(),
  'not an object',
  { bindings: 'nope' },
];
let differentialDisagreements = 0;
for (const fx of differentialFixtures) {
  const a = checkGovernedBindings202Outcome(fx);
  const b = check201(fx, STAGE_INPUT_201).perFact[0].outcome as string;
  if (a !== b) differentialDisagreements += 1;
}
function checkGovernedBindings202Outcome(fx: unknown): string {
  return checkGoverned202Bindings(fx, STAGE_INPUT).perFact[0].outcome as string;
}
ok('B19. §202\'s boundary agrees with §201\'s outcome-for-outcome in the default exposure',
  differentialDisagreements === 0,
  `${differentialFixtures.length} fixtures, ${differentialDisagreements} disagreements — §202 is `
  + '§201 plus the identity seal, the semantic-field names, the text-return names and the '
  + 'exposure contract');

ok('B19a. the §202 additions are exactly the four claimed, and each is refused by §202 alone',
  // a semantic field §201's list does not carry
  check201(response(entry({ affectedDecision: 'APPLICABILITY' })), STAGE_INPUT_201)
    .perFact[0].outcome === 'BOUND'
  && withDecision.perFact[0].outcome === 'REFUSED'
  // a text-return field §201's list does not carry
  && check201(response(entry({ sourceText: 'x' })), STAGE_INPUT_201).perFact[0].outcome === 'BOUND'
  && checkGoverned202Bindings(response(entry({ sourceText: 'x' })), STAGE_INPUT)
    .perFact[0].outcome === 'REFUSED',
  'the gap §201 left to additionalProperties alone is now named at the boundary');

// ---------------------------------------------------------------- B20. grammar comparison

/**
 * ============ B20 IS DIAGNOSTIC EVIDENCE, NOT PROVIDER ACCEPTANCE ============
 *
 * Every figure below is an OFFLINE PROXY measured on the axes the provider's own error message
 * points at ("simplify your tool schemas"). NONE of them is the provider's compiled-grammar metric,
 * none of them proves any request will be accepted, and the threshold remains undocumented. §199
 * established that a 2.3% byte difference separated an ACCEPTED request from a REJECTED one, which
 * is the sharpest available demonstration that size is not the thing.
 *
 * Measured on the request AS ACTUALLY SENT — after the strict-tool-schema wrapper and the §108
 * Anthropic keyword strip — and with the REAL sourceId shape the §199 executor builds
 * (`OBS-${rowId}`), not the placeholder `OBS` whose use §201 found had left every per-row figure in
 * the frozen §199 diagnosis 12 characters short.
 */
const REQUEST_202 = buildGoverned202Request(STAGE_INPUT);
const REQUEST_202_MULTI = buildGoverned202Request(MULTI_INPUT);
const REQUEST_202_PLAIN = buildGoverned202Request(
  { ...STAGE_INPUT, governedIdTransport: 'PLAIN_STRING' });

const measurements = [
  measureRequest202({
    label: '§199 first pass ABSENT   (SF-01, ACCEPTED 10/10)',
    schemaAsSent: asSent(buildExpertVNextWireSchema(inputFor(SF01), EMPTY_BINDING)),
    systemPrompt: buildExpertVNextSystemPrompt(EMPTY_BINDING),
    userPrompt: buildExpertVNextUserPrompt(inputFor(SF01), []),
  }),
  measureRequest202({
    label: '§199 first pass ABSENT   (SG-01, under §202)',
    schemaAsSent: asSent(sg01SeparateStage),
    systemPrompt: buildExpertVNextSystemPrompt(EMPTY_BINDING),
    userPrompt: buildExpertVNextUserPrompt(inputFor(SG01), []),
  }),
  measureRequest202({
    label: '§199 first pass PRESENT  (SG-01, REJECTED pre-inference)',
    schemaAsSent: asSent(sg01Section199),
    systemPrompt: buildExpertVNextSystemPrompt(governedBindingFor(GOV_SG01)),
    userPrompt: buildExpertVNextUserPrompt(inputFor(SG01), GOV_SG01),
  }),
  measureRequest202({
    label: '§202 governed stage      (1 record, CLOSED_ENUM)',
    schemaAsSent: REQUEST_202.schemaAsSent,
    systemPrompt: REQUEST_202.systemPrompt,
    userPrompt: REQUEST_202.userPrompt,
  }),
  measureRequest202({
    label: '§202 governed stage      (2 records, CLOSED_ENUM)',
    schemaAsSent: REQUEST_202_MULTI.schemaAsSent,
    systemPrompt: REQUEST_202_MULTI.systemPrompt,
    userPrompt: REQUEST_202_MULTI.userPrompt,
  }),
  measureRequest202({
    label: '§202 governed stage      (1 record, PLAIN_STRING)',
    schemaAsSent: REQUEST_202_PLAIN.schemaAsSent,
    systemPrompt: REQUEST_202_PLAIN.systemPrompt,
    userPrompt: REQUEST_202_PLAIN.userPrompt,
  }),
];

console.log('\n  OFFLINE GRAMMAR / REQUEST MEASUREMENT — request AS SENT (strict wrapper + §108 strip),');
console.log('  real sourceId shape OBS-${rowId}. DIAGNOSTIC EVIDENCE ONLY — NOT provider compiled-grammar');
console.log('  complexity, NOT evidence of provider acceptance.\n');
console.log('  request                                                   enums  alts  objs props  reqs depth  descCh  schemaB   sysB   usrB  totalB');
for (const m of measurements) {
  console.log(`  ${m.label.padEnd(55)} ${String(m.schema.enumConstructs).padStart(5)}`
    + ` ${String(m.schema.enumAlternatives).padStart(5)}`
    + ` ${String(m.schema.objectNodes).padStart(5)}`
    + ` ${String(m.schema.propertyNodes).padStart(5)}`
    + ` ${String(m.schema.requiredEntries).padStart(5)}`
    + ` ${String(m.schema.maxNestingDepth).padStart(5)}`
    + ` ${String(m.schema.descriptionChars).padStart(7)}`
    + ` ${String(m.schema.serialisedBytes).padStart(8)}`
    + ` ${String(m.systemPromptBytes).padStart(6)}`
    + ` ${String(m.userPromptBytes).padStart(6)}`
    + ` ${String(m.totalRequestBytes).padStart(7)}`);
}
console.log('');

const mAbsentSF01 = measurements[0];
const mAbsentSG01 = measurements[1];
const mPresentSG01 = measurements[2];
const mStage = measurements[3];
const mStagePlain = measurements[5];

ok('B20. the §202 governed-stage request is materially smaller and simpler than §199\'s REJECTED one',
  mStage.schema.serialisedBytes * 8 < mPresentSG01.schema.serialisedBytes
  && mStage.schema.enumConstructs * 5 < mPresentSG01.schema.enumConstructs
  && mStage.schema.enumAlternatives * 10 < mPresentSG01.schema.enumAlternatives
  && mStage.schema.propertyNodes * 5 < mPresentSG01.schema.propertyNodes
  && mStage.schema.maxNestingDepth < mPresentSG01.schema.maxNestingDepth
  && mStage.totalRequestBytes * 2 < mPresentSG01.totalRequestBytes,
  `schema ${mStage.schema.serialisedBytes}B vs ${mPresentSG01.schema.serialisedBytes}B; `
  + `${mStage.schema.enumConstructs} vs ${mPresentSG01.schema.enumConstructs} enums; `
  + `${mStage.schema.enumAlternatives} vs ${mPresentSG01.schema.enumAlternatives} alternatives; `
  + `whole request ${mStage.totalRequestBytes}B vs ${mPresentSG01.totalRequestBytes}B`);

ok('B20a. this is DIAGNOSTIC EVIDENCE and claims no provider acceptance',
  GRAMMAR_MEASUREMENT_CLAIMS_202.IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC === false
  && GRAMMAR_MEASUREMENT_CLAIMS_202.EQUALS_PROVIDER_COMPILED_GRAMMAR_COMPLEXITY === false
  && GRAMMAR_MEASUREMENT_CLAIMS_202.PROVES_A_REQUEST_WILL_BE_ACCEPTED === false
  && GRAMMAR_MEASUREMENT_CLAIMS_202.IS_EVIDENCE_OF_PROVIDER_ACCEPTANCE === false
  && GRAMMAR_MEASUREMENT_CLAIMS_202.KNOWS_THE_THRESHOLD === false
  && GRAMMAR_MEASUREMENT_CLAIMS_202
    .MEASURED_ON_THE_REQUEST_AS_SENT_WITH_THE_REAL_SOURCE_ID_SHAPE === true);

ok('B20b. the §199 accepted/rejected pair differs by ONE enum construct — size is not the metric',
  mPresentSG01.schema.enumConstructs - mAbsentSG01.schema.enumConstructs === 1
  && mPresentSG01.schema.propertyNodes - mAbsentSG01.schema.propertyNodes === 1
  && (mPresentSG01.schema.serialisedBytes - mAbsentSG01.schema.serialisedBytes)
  / mAbsentSG01.schema.serialisedBytes < 0.03,
  `${mAbsentSG01.schema.serialisedBytes}B accepted vs ${mPresentSG01.schema.serialisedBytes}B `
  + 'rejected — a sub-3% difference separating acceptance from pre-inference refusal');

ok('B20c. the exposure mode changes the USER PROMPT only, never the grammar',
  JSON.stringify(buildGoverned202WireSchema(STAGE_INPUT))
  === JSON.stringify(buildGoverned202WireSchema(VERBATIM_INPUT))
  && buildGoverned202UserPrompt(STAGE_INPUT) !== buildGoverned202UserPrompt(VERBATIM_INPUT)
  && buildStage202SystemPrompt('REDACTED') !== buildStage202SystemPrompt('SUPPLIED_VERBATIM'),
  'so the grammar comparison holds in both modes');

ok('B20d. the plain-string transport composes, removing one further enum construct',
  mStagePlain.schema.enumConstructs === mStage.schema.enumConstructs - 1
  && mStagePlain.schema.serialisedBytes < mStage.schema.serialisedBytes,
  `${mStage.schema.enumConstructs} -> ${mStagePlain.schema.enumConstructs} enums`);

ok('B20e. the SF-01 accepted baseline is measured the same way as everything else',
  mAbsentSF01.schema.enumConstructs === mAbsentSG01.schema.enumConstructs
  && mAbsentSF01.totalRequestBytes > 0,
  'same axes, same as-sent treatment, same real sourceId shape');

// ================================================================ S. THE IDENTITY SEAL

const wrongSeal = checkGoverned202Bindings(response(entry()), {
  ...STAGE_INPUT, identitySeal: sealFor([SECOND]),
});
const reorderedSeal = checkGoverned202Bindings(response(entry()), {
  ...TWO_FACTS, identitySeal: sealFactIdentities('AN-202-SG-01', [SECOND, SG01_CANDIDATE]),
});
ok('S1. a response scored against a fact set that is not the sealed one is refused WHOLE',
  wrongSeal.responseCodes.includes('IDENTITY_SEAL_MISMATCH')
  && wrongSeal.perFact.every(f => f.outcome === 'NO_DETERMINATION_RETURNED')
  && wrongSeal.boundPairs.length === 0
  && reorderedSeal.responseCodes.includes('IDENTITY_SEAL_MISMATCH'),
  'a re-ordered fact list is a different seal, because order fixes the minted references');

ok('S2. the seal\'s claims are stated honestly, including what it does NOT prove',
  IDENTITY_SEAL_CLAIMS.THE_SCORED_FACT_SET_IS_THE_REQUESTED_FACT_SET === true
  && IDENTITY_SEAL_CLAIMS.ORDERING_IS_PROVEN_FOR_ANYTHING_ROUTED_THROUGH_THE_PIPELINE === true
  && IDENTITY_SEAL_CLAIMS.THE_SEAL_IS_A_CLOCK === false
  && IDENTITY_SEAL_CLAIMS.A_CALLER_BYPASSING_THE_PIPELINE_CANNOT_RESEAL === false,
  'the seal closes the accidental failure and makes the deliberate one a visible act');

ok('S3. a malformed or duplicated factKey aborts minting rather than being rewritten',
  (() => { try { mintFactRefs202([SG01_CANDIDATE, SG01_CANDIDATE]); return false; } catch { return true; } })()
  && (() => { try { mintFactRefs202([{ ...SG01_CANDIDATE, factKey: 'not a key!' }]); return false; } catch { return true; } })());

// ================================================================ T. THE PIPELINE, END TO END

/** An offline nominator. It reaches no network, and it is handed the REQUEST and never the facts. */
const seenRequests: Governed202Request[] = [];
const offlineNominator = (request: Governed202Request): unknown => {
  seenRequests.push(request);
  return { bindings: [{
    factRef: 'F1',
    determination: 'BINDS',
    governedEvidenceSourceIds: [SUPPLIED_ID],
    bearingStatement: 'the named record speaks to what would have to be established here',
  }] };
};

const PIPE_INPUT = {
  analysisId: 'AN-202-PIPE-SG-01',
  declarations: [SG01_DECLARATION] as readonly unknown[],
  sources: [{ sourceId: 'OBS-SG-01', text: SG01.observation }],
  stage: 'FIRST_PASS_MODEL' as const,
  governedRecords: GOV_SG01,
  inspectionContext: { location: SG01.location, task: SG01.task },
  owedPropertyByDeclarationId: { D1: SG01_DECLARATION.missingFact },
  criteriaBySourceId: { [SUPPLIED_ID]: CRITERION },
};

void (async () => {
  const run = await runGovernedStagePipeline(PIPE_INPUT, offlineNominator);
  ok('T1. the pipeline runs projection -> seal -> gate -> request -> boundary -> enrichment',
    run.projection.facts.length === 1
    && run.invocation.shouldCall === true
    && run.request !== null
    && run.binding !== null
    && run.binding!.perFact[0].outcome === 'BOUND'
    && run.enrichment[0].reason === 'CRITERION_ATTACHED'
    && run.facts[0].acceptableEvidence?.requirement === CRITERION.requirement
    && run.nominationsIssued === 1);

  ok('T2. the nominator is handed the REQUEST and is never handed a fact identity',
    seenRequests.length === 1
    && !('facts' in (seenRequests[0] as unknown as Record<string, unknown>))
    && !('identitySeal' in (seenRequests[0] as unknown as Record<string, unknown>))
    && !JSON.stringify(seenRequests[0]).includes(run.identitySeal.factKeys[0])
    && seenRequests[0].requestContractId === GOVERNED_BINDING_202_REQUEST_CONTRACT_ID,
    'so "identity preceded nomination" is a property of the call graph, not of a comment');

  const noGovernedRun = await runGovernedStagePipeline(
    { ...PIPE_INPUT, governedRecords: [] }, offlineNominator);
  ok('T3. a row with no governed evidence issues ZERO nominations and still returns its facts',
    noGovernedRun.nominationsIssued === 0
    && noGovernedRun.request === null
    && noGovernedRun.binding === null
    && noGovernedRun.facts.length === 1
    && noGovernedRun.invocation.reason === 'NO_GOVERNED_EVIDENCE_SUPPLIED'
    && seenRequests.length === 1);

  const hostileRun = await runGovernedStagePipeline(PIPE_INPUT, () => ({
    bindings: [{
      factRef: 'F1',
      determination: 'BINDS',
      governedEvidenceSourceIds: [SUPPLIED_ID],
      bearingStatement: 'ok',
      factKey: 'FP.FORGED.1',
      priority: 'LIFE_CRITICAL',
      status: 'SETTLED',
      affectedDecision: 'APPLICABILITY',
      branchA: 'rewritten',
    }],
  }));
  ok('T4. a hostile nomination is refused end to end and changes nothing downstream',
    hostileRun.binding!.perFact[0].outcome === 'REFUSED'
    && hostileRun.binding!.perFact[0].codes
      .filter(c => c === 'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD').length === 5
    && hostileRun.binding!.boundPairs.length === 0
    && hostileRun.facts[0].status === 'UNRESOLVED'
    && hostileRun.facts[0].priority === 'OTHER'
    && hostileRun.facts[0].affectedDecision === 'REQUIRED_CONTROL'
    && hostileRun.facts[0].acceptableEvidence === null
    && hostileRun.enrichment[0].reason === 'NO_BINDING',
    'five HazLenz-owned fields named in one entry, five counted refusals, zero effect');

  ok('T5. a fact kept out of the candidate set is RECORDED, never silently dropped',
    BINDING_EXCLUSION_REASONS.length === 2
    && BINDING_EXCLUSION_REASONS.includes('WHY_UNRESOLVED_ABSENT_ON_AN_OPEN_FACT')
    && run.excludedFromBinding.length === 0
    && run.projection.facts.length === run.binding!.perFact.length,
    'no exclusion is reachable through the projection today — WHY_UNRESOLVED_STATUS_INVARIANT '
    + 'guarantees it — and the vocabulary exists so a future violation is visible rather than silent');

  // ================================================================ V. VOCABULARIES AND RESIDUALS

  ok('V1. the vocabularies are closed and the §202 additions are exactly two codes',
    BINDING_DETERMINATIONS_202.length === 3
    && FACT_BINDING_OUTCOMES_202.length === 5
    && BINDING_REFUSAL_CODES_202.includes('IDENTITY_SEAL_MISMATCH')
    && BINDING_REFUSAL_CODES_202.includes('UNAUTHORISED_REGULATORY_CITATION')
    && BINDING_REFUSAL_CODES_202.length === 14);

  ok('V2. the forbidden-field list is deduplicated and covers all four families',
    new Set(GOVERNED_STAGE_202_FORBIDDEN_FIELDS).size
    === GOVERNED_STAGE_202_FORBIDDEN_FIELDS.length
    && GOVERNED_STAGE_202_SEMANTIC_FIELDS.every(
      f => GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes(f))
    && GOVERNED_STAGE_202_TEXT_RETURN_FIELDS.every(
      f => GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes(f))
    && GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes('modelAuthored')
    && GOVERNED_STAGE_202_FORBIDDEN_FIELDS.includes('knowledgeReleaseId'),
    `${GOVERNED_STAGE_202_FORBIDDEN_FIELDS.length} distinct names`);

  let forbiddenMissed = 0;
  for (const f of GOVERNED_STAGE_202_FORBIDDEN_FIELDS) {
    const r = checkGoverned202Bindings(response(entry({ [f]: 'x' })), STAGE_INPUT);
    if (!r.perFact[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')) forbiddenMissed += 1;
  }
  ok('V3. every forbidden field name is refused at the boundary, not just in the transport',
    forbiddenMissed === 0, `${GOVERNED_STAGE_202_FORBIDDEN_FIELDS.length} names checked`);

  ok('V4. the stage declares its effect all-false across twelve axes',
    Object.values(governed202StageEffect()).every(v => v === false)
    && Object.keys(governed202StageEffect()).length === 12);

  const already = applyGoverned202Bindings(
    [{ ...SG01_FACT, acceptableEvidence: CRITERION }], oneSource,
    { [SUPPLIED_ID]: { ...CRITERION, requirement: 'a different criterion' } });
  const noCriterion = applyGoverned202Bindings([SG01_FACT], oneSource, {});
  const unbound = applyGoverned202Bindings([SG01_FACT], noBinding, { [SUPPLIED_ID]: CRITERION });
  ok('V5. the enrichment never overwrites, never invents and never errors on an empty case',
    already.outcomes[0].reason === 'CRITERION_ALREADY_HELD'
    && already.facts[0].acceptableEvidence?.requirement === CRITERION.requirement
    && noCriterion.outcomes[0].reason === 'NO_CRITERION_HELD'
    && noCriterion.facts[0].acceptableEvidence === null
    && unbound.outcomes[0].reason === 'NO_BINDING'
    && enriched.facts.length === 1
    && (['factKey', 'affectedDecision', 'source', 'evidenceSpan', 'whyUnresolved', 'branchA',
      'branchB', 'modelAuthored'] as const)
      .every(k => JSON.stringify(enriched.facts[0][k]) === JSON.stringify(SG01_FACT[k])));

  ok('V6. §202 records its dependencies and residual limits rather than absorbing them',
    STAGE_202_DEPENDENCIES.length === 5
    && STAGE_202_DEPENDENCIES.some(d => d.includes('OwedFact has no field for the owed property'))
    && STAGE_202_DEPENDENCIES.some(d => d.includes('product-owner ruling'))
    && STAGE_202_RESIDUAL_LIMITS.length === 6
    && STAGE_202_RESIDUAL_LIMITS.some(d => d.includes('no longer atomic'))
    && STAGE_202_RESIDUAL_LIMITS.some(d => d.includes('threshold is undocumented'))
    && STAGE_202_RESIDUAL_LIMITS.some(d => d.includes('not a clock')));

  // ---------------------------------------------------------------- report

  console.log('\n' + '='.repeat(100));
  console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
  console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
  console.log('  NO SEMANTIC VERDICT IS SUPPLIED OR IMPLIED BY THIS SUITE.');
  console.log('  B20 IS DIAGNOSTIC EVIDENCE ONLY AND IS NOT EVIDENCE OF PROVIDER ACCEPTANCE.');
  console.log('='.repeat(100));
  if (failed > 0) {
    console.log('\nFAILED:');
    for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
    process.exitCode = 1;
  }
})();
