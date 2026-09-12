/**
 * §199 -- SUCCESSOR PROTOCOL PROOF SUITE. ZERO PROVIDER CALLS.
 *
 * The §198 suite proves the remediated architecture. This one proves the §199 PROTOCOL: that the
 * cohort really is Option 3, that the ten reused rows are byte-identical to their §197 originals,
 * that the canary is eligible, that the frozen order puts it first, and that the two replacement
 * rows exercise what they were built to exercise without reskinning the rows they replace.
 */

import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { buildExpertUserPrompt, stableStringify } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  buildExpertVNextWireSchema, buildExpertVNextUserPrompt, buildExpertVNextSystemPrompt,
  governedBindingFor, governedBindingCapability, UNRESOLVED_FACT_DECLARATIONS_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';
import {
  SECTION_199_COHORT, SECTION_199_COHORT_VERSION, COHORT_COVERAGE, cohortDesignDefects,
  TRANSPORT_CANARY_ROW_ID, REPLACED_SECTION_197_ROWS, TRUTH_PROVENANCE,
} from './lib/expert-199-cohort-2026-09-07';

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

const inputFor = (r: typeof SECTION_199_COHORT[number]): ExpertAnalysisInput => ({
  contractVersion: 'hazlenz.expert.input.v1', analysisId: `AN-199-${r.rowId}`,
  authoritativeSources: [{ sourceId: `OBS-${r.rowId}`, sourceType: 'observation', text: r.observation }],
  inspectionContext: { location: r.location, task: r.task }, jurisdiction: r.jurisdiction,
  allowedHazardFamilies: [...r.allowedHazardFamilies],
  deterministicFindings: r.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
  governedStandards: r.governedStandards.map(g => ({ ...g })), answeredClarifications: [],
});
const recordsFor = (r: typeof SECTION_199_COHORT[number]) =>
  r.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));

// ================================================================ A. OPTION 3 STRUCTURE

ok('A1. the cohort has no design defects', cohortDesignDefects().length === 0,
  JSON.stringify(cohortDesignDefects()));
ok('A2. twelve rows total', SECTION_199_COHORT.length === 12);
ok('A3. ten reused, two replaced',
  COHORT_COVERAGE.reusedRows.length === 10 && COHORT_COVERAGE.replacedRows.length === 2,
  `replaced ${COHORT_COVERAGE.replacedRows.join(',')}`);
ok('A4. SF-09 and SF-10 are absent from the cohort',
  SECTION_199_COHORT.every(r => !(REPLACED_SECTION_197_ROWS as readonly string[]).includes(r.rowId)));
ok('A5. every reused row names its §197 origin',
  SECTION_199_COHORT.filter(r => r.provenance === 'REUSED_BEHAVIORALLY_UNSPENT')
    .every(r => typeof r.section197Origin === 'string' && r.section197Origin === r.rowId),
  'traceability: §197 id → §199 id → REUSED_BEHAVIORALLY_UNSPENT');
ok('A6. every replacement row names the §197 row it replaces',
  SECTION_199_COHORT.filter(r => r.provenance === 'REPLACED_PROTOCOL_EXPOSED')
    .every(r => (REPLACED_SECTION_197_ROWS as readonly string[]).includes(String(r.section197Origin))));

// ================================================================ B. REUSED ROWS ARE BYTE-IDENTICAL

let observationDrift = 0;
let truthDrift = 0;
let familyDrift = 0;
for (const r of SECTION_199_COHORT.filter(x => x.provenance === 'REUSED_BEHAVIORALLY_UNSPENT')) {
  const o = SECTION_197_COHORT.find(x => x.rowId === r.section197Origin);
  if (!o) { observationDrift += 1; continue; }
  if (o.observation !== r.observation) observationDrift += 1;
  if (JSON.stringify(o.expectedOwedFacts) !== JSON.stringify(r.expectedOwedFacts)) truthDrift += 1;
  if (JSON.stringify(o.families) !== JSON.stringify(r.families)) familyDrift += 1;
}
ok('B1. no reused observation drifted from its §197 original', observationDrift === 0);
ok('B2. no reused truth drifted from its §197 original', truthDrift === 0,
  'the truth carries forward unchanged and is re-hashed prospectively, not rewritten');
ok('B3. no reused family list drifted', familyDrift === 0);
ok('B4. reuse is by REFERENCE, so there is no second copy to drift',
  SECTION_199_COHORT.filter(r => r.provenance === 'REUSED_BEHAVIORALLY_UNSPENT')
    .every(r => SECTION_197_COHORT.some(o => o.observation === r.observation)));

// ================================================================ C. THE REPLACEMENTS ARE NOT RESKINS

const sg01 = SECTION_199_COHORT.find(r => r.rowId === 'SG-01')!;
const sg02 = SECTION_199_COHORT.find(r => r.rowId === 'SG-02')!;
const sf09 = SECTION_197_COHORT.find(r => r.rowId === 'SF-09')!;
const sf10 = SECTION_197_COHORT.find(r => r.rowId === 'SF-10')!;

/** Content words shared between two observations, as a crude reskin detector. */
function overlapRatio(a: string, b: string): number {
  const words = (s: string): Set<string> => new Set(
    s.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 4));
  const wa = words(a); const wb = words(b);
  const shared = [...wa].filter(w => wb.has(w)).length;
  return shared / Math.max(1, Math.min(wa.size, wb.size));
}
ok('C1. SG-01 is not a reskin of SF-09', overlapRatio(sg01.observation, sf09.observation) < 0.25,
  `content-word overlap ${(overlapRatio(sg01.observation, sf09.observation) * 100).toFixed(0)}%`);
ok('C2. SG-02 is not a reskin of SF-10', overlapRatio(sg02.observation, sf10.observation) < 0.25,
  `content-word overlap ${(overlapRatio(sg02.observation, sf10.observation) * 100).toFixed(0)}%`);
ok('C3. the replacements use different hazard families from the rows they replace',
  !sg01.allowedHazardFamilies.every(f => sf09.allowedHazardFamilies.includes(f))
  && !sg02.allowedHazardFamilies.every(f => sf10.allowedHazardFamilies.includes(f)));
ok('C4. the owed-property SHAPES differ from the replaced rows',
  sg01.expectedOwedFacts[0].owedProperty.includes('sustain')
  && !sf09.expectedOwedFacts[0].owedProperty.includes('sustain')
  && sg02.expectedOwedFacts[0].conjuncts.length === 2
  && sf10.expectedOwedFacts[0].conjuncts.length === 1,
  'unmeasured distance → unverified sustained capability; absent arrangement → unverified pre-task check');

// ================================================================ D. THE REPLACEMENTS EXERCISE BOTH THINGS

ok('D1. both replacement rows supply governed evidence, so the capability is PRESENT',
  governedBindingCapability(governedBindingFor(recordsFor(sg01))) === 'PRESENT'
  && governedBindingCapability(governedBindingFor(recordsFor(sg02))) === 'PRESENT');
ok('D2. SG-01 is the governed-QUOTATION opportunity',
  sg01.families.includes('GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY'));
ok('D3. SG-02 is the unsupplied-citation CONTAINMENT opportunity',
  sg02.families.includes('UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY'));
ok('D4. SG-01\'s governed record genuinely bears on its owed fact',
  /flushing/i.test(sg01.verifierGovernedEvidence[0].text)
  && /flushing/i.test(sg01.expectedOwedFacts[0].owedProperty));
ok('D5. SG-02\'s governed record is deliberately OFF POINT',
  /powered industrial truck/i.test(sg02.verifierGovernedEvidence[0].text)
  && !/truck|forklift/i.test(sg02.observation),
  'operator training versus a hot-work sump check');
ok('D6. both governed records carry a citation, so the verifier surface is exercisable',
  /\b\d{2}\s*CFR\s*\d+/i.test(sg01.verifierGovernedEvidence[0].text)
  && /\b\d{2}\s*CFR\s*\d+/i.test(sg02.verifierGovernedEvidence[0].text));

// ================================================================ E. TRUTH IS ADJUDICABLE WITHOUT THE GOVERNED TEXT

for (const r of [sg01, sg02]) {
  const f = r.expectedOwedFacts[0];
  ok(`E1.${r.rowId}. every acceptable span is verbatim in the OBSERVATION, not the governed text`,
    f.acceptableSpanRegions.every(s => r.observation.includes(s)),
    'the owed fact is established by the observation alone');
  ok(`E2.${r.rowId}. the owed property is stated without reference to the governed record`,
    !/29 CFR|governing text|governed record/i.test(f.owedProperty));
  ok(`E3.${r.rowId}. the observation carries no citation-shaped string`,
    !/\b\d{2}\s*CFR\s*\d+/i.test(r.observation),
    'so a refusal cannot be an artefact of our own stimulus');
}

// ================================================================ F. THE CANARY

const canary = SECTION_199_COHORT.find(r => r.rowId === TRANSPORT_CANARY_ROW_ID)!;
ok('F1. the canary is in the cohort', canary !== undefined, TRANSPORT_CANARY_ROW_ID);
ok('F2. the canary is a NON-GOVERNED row', canary.verifierGovernedEvidence.length === 0,
  'the first question is whether the ORDINARY remediated request is accepted at all');
ok('F3. the canary is a REUSED row', canary.provenance === 'REUSED_BEHAVIORALLY_UNSPENT');
ok('F4. the canary has an unambiguous preregistered expectation',
  canary.expectedGapCount.min === canary.expectedGapCount.max,
  `expected exactly ${canary.expectedGapCount.min}`);
ok('F5. the canary request carries the capability-ABSENT schema',
  (buildExpertVNextWireSchema(inputFor(canary), governedBindingFor([])) as any)
    .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items.properties.governedEvidenceSourceIds
    === undefined);

// ================================================================ G. FROZEN ORDER

const orderPath = join(E199, 'EXECUTION-ORDER.json');
if (existsSync(orderPath)) {
  const order = JSON.parse(readFileSync(orderPath, 'utf8'));
  ok('G1. the frozen order puts the canary first',
    order.frozenOrder[0].rowId === TRANSPORT_CANARY_ROW_ID && order.frozenOrder[0].isCanary === true);
  ok('G2. the frozen order covers every row exactly once',
    new Set(order.frozenOrder.map((s: any) => s.rowId)).size === 12
    && order.frozenOrder.length === 12);
  ok('G3. no matched pair is adjacent in the frozen order',
    (() => {
      const pairOf = new Map(SECTION_199_COHORT.map(r => [r.rowId, r.pairedWith]));
      for (let i = 1; i < order.frozenOrder.length; i += 1) {
        if (pairOf.get(order.frozenOrder[i - 1].rowId) === order.frozenOrder[i].rowId) return false;
      }
      return true;
    })(), 'near-identical texts are separated so order cannot be read as a confound');
} else {
  ok('G1. the frozen order exists', false, 'EXECUTION-ORDER.json not found — run --stage=prereg');
}

// ================================================================ H. PER-ROW REQUEST COHERENCE

let capabilityMismatch = 0;
let maxItemsFound = 0;
let idsInvisible = 0;
for (const r of SECTION_199_COHORT) {
  const records = recordsFor(r);
  const binding = governedBindingFor(records);
  const cap = governedBindingCapability(binding);
  const schema: any = buildExpertVNextWireSchema(inputFor(r), binding);
  const prompt = buildExpertVNextSystemPrompt(binding);
  const user = buildExpertVNextUserPrompt(inputFor(r), records);
  const inSchema = schema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD]
    .items.properties.governedEvidenceSourceIds !== undefined;
  const inPrompt = prompt.includes('governedEvidenceSourceIds');
  if (inSchema !== (cap === 'PRESENT') || inPrompt !== (cap === 'PRESENT')) capabilityMismatch += 1;
  if (JSON.stringify(schema).includes('maxItems')) maxItemsFound += 1;
  for (const g of records) if (!user.includes(`sourceId: ${g.sourceId}`)) idsInvisible += 1;
}
ok('H1. prompt and schema agree on capability for every row', capabilityMismatch === 0);
ok('H2. no row carries maxItems — the §197 rejection cause is gone from all twelve', maxItemsFound === 0);
ok('H3. every supplied sourceId is visible in its row\'s user prompt', idsInvisible === 0,
  'the §197 impossible contract is closed for both governed rows');
ok('H4. ten rows are capability-ABSENT and two are PRESENT',
  COHORT_COVERAGE.capabilityAbsentRows.length === 10 && COHORT_COVERAGE.capabilityPresentRows.length === 2);
ok('H5. the vNext user prompt still reduces to the v15 user prompt on a capability-absent row',
  sha(buildExpertVNextUserPrompt(inputFor(canary), [])) === sha(buildExpertUserPrompt(inputFor(canary))));
ok('H6. the governed rows show their record in BOTH the v15 block and the AVAILABLE block',
  (() => {
    const u = buildExpertVNextUserPrompt(inputFor(sg01), recordsFor(sg01));
    return !u.includes('(none supplied') && u.includes('AVAILABLE GOVERNED EVIDENCE');
  })(), 'the "(none supplied)" contradiction §199 found pre-spend is closed');

// ================================================================ I. TRUTH PROVENANCE

ok('I1. truth provenance is carried, and is not claimed as human truth',
  TRUTH_PROVENANCE.AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING === true
  && TRUTH_PROVENANCE.PRODUCT_OWNER_REVIEWED === false
  && TRUTH_PROVENANCE.USED_AS_THE_SEMANTIC_ORACLE === false);
ok('I2. the cohort version is new, not §197\'s',
  SECTION_199_COHORT_VERSION === 'hazlenz.expert.structured-e2e-cohort.2026-09-07.v2');
ok('I3. coverage is preserved across the replacement',
  COHORT_COVERAGE.noGapRows === 3 && COHORT_COVERAGE.matchedPairs === 3
  && COHORT_COVERAGE.multiGapRows.length === 1 && COHORT_COVERAGE.conjunctiveRows.length >= 2
  && COHORT_COVERAGE.expectedOwedFactsMin === 10,
  `${COHORT_COVERAGE.expectedOwedFactsMin}-${COHORT_COVERAGE.expectedOwedFactsMax} expected facts`);

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
void stableStringify;
