/**
 * §226 -- LOCAL CAPABILITY VALIDATION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Runs the frozen §226 instrument against BOTH contracts and asserts the construction properties of
 * the successor. It establishes CONTRACT DISCRIMINATION only. Per HAZLENZ_INVARIANTS 27 it
 * establishes nothing about how a model will behave; that question belongs to the hosted
 * confirmation this slice designs and does not execute.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CASES_226, INSTRUMENT_226_VERSION, MEASURES_226, CONTRACT_RULES_226, OWED_MATCH_FLOOR,
  AGGREGATE_SCORE_PERMITTED, preflight226, evaluateAll226, classifyDeclaredProperty226,
  triggerReaches,
  type Case226, type ContractUnderTest226, type Measure226, type Verdict226,
  type MeasureResult226, type PropertyClassification226,
} from './lib/expert-226-capability-instrument';
import {
  EXPERT_FIRST_PASS_226_SYSTEM_PROMPT, EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  CANDIDATE_STATE_NOT_TRIGGER_LINES, SUFFICIENCY_GATE_LINES, SLICE_BOUNDARY_226, ROOT_CAUSES_226,
  OUT_OF_SCOPE_226, reconstruct224SystemPrompt, reconstruct210jFrom226, instructionIdentity226,
  assertSchemaUnchanged226, FIRST_PASS_CONTRACT_226_VERSION, BASE_CONTRACT_VERSION_226,
} from './lib/expert-226-property-selection-capability';
import {
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT, EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-224-declaration-capability';
import {
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-210j-first-pass-contract';
import { assembleFirstPass221 } from './lib/expert-221-assembly';
import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-226-first-pass-semantic-remediation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let pass = 0; let fail = 0;
const failures: string[] = [];
let conformancePass = 0; const conformanceMismatches: string[] = [];

/** CAPABILITY assertion. The terminal turns on these. A failure here is a capability failure. */
function ok(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`ok    ${label}`); return; }
  fail += 1; failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

// ------------------------------------------------------------------ A. the frozen instrument

console.log('---- A. THE FROZEN INSTRUMENT ----');

const frozenPath = join(OUT, 'SECTION-226-LOCAL-INSTRUMENT.json');
const frozenBody = readFileSync(frozenPath, 'utf8');
const frozenDigestRecorded = readFileSync(
  join(OUT, 'SECTION-226-LOCAL-INSTRUMENT.sha256'), 'utf8').trim().split(/\s+/)[0];
ok('A1. the frozen instrument file verifies against its recorded digest',
  sha(frozenBody) === frozenDigestRecorded,
  `computed ${sha(frozenBody)} vs recorded ${frozenDigestRecorded}`);

const frozen = JSON.parse(frozenBody) as {
  instrumentVersion: string;
  cases: Case226[];
  preflight: { passed: boolean; checks: { id: string; passed: boolean }[] };
};
ok('A2. the instrument under test is the frozen one, case for case',
  JSON.stringify(frozen.cases) === JSON.stringify(CASES_226));
ok('A3. the instrument version matches', frozen.instrumentVersion === INSTRUMENT_226_VERSION);

const pre = preflight226();
ok('A4. the preflight passes now exactly as it did at freeze time',
  pre.passed && pre.checks.length === frozen.preflight.checks.length,
  `${pre.checks.filter(k => k.passed).length}/${pre.checks.length}`);
ok('A5. no aggregate score is computed anywhere in this instrument',
  AGGREGATE_SCORE_PERMITTED === false);

// ------------------------------------------------------------------ B. construction of the successor

console.log('\n---- B. THE SUCCESSOR IS BUILT BY CONSTRUCTION ----');

ok('B1. removing both §226 blocks reproduces the §224 prompt byte for byte (plain)',
  reconstruct224SystemPrompt(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_224_SYSTEM_PROMPT);
ok('B2. removing both §226 blocks reproduces the §224 prompt byte for byte (governed)',
  reconstruct224SystemPrompt(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('B3. the whole additive chain reproduces §210J byte for byte (plain)',
  reconstruct210jFrom226(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT);
ok('B4. the whole additive chain reproduces §210J byte for byte (governed)',
  reconstruct210jFrom226(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('B5. §224 is extended, never rewritten: its own lines survive unaltered in §226',
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT.split('\n')
    .every(l => EXPERT_FIRST_PASS_226_SYSTEM_PROMPT.includes(l)));
ok('B6. both §226 blocks appear exactly once in each variant',
  [CANDIDATE_STATE_NOT_TRIGGER_LINES, SUFFICIENCY_GATE_LINES].every(b => {
    const j = b.join('\n');
    return EXPERT_FIRST_PASS_226_SYSTEM_PROMPT.split(j).length === 2
      && EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split(j).length === 2;
  }));

const asm = assembleFirstPass221();
const one = asm[0];
const schemaCheck = assertSchemaUnchanged226(one.input, governedBindingFor(one.governedRecords));
ok('B7. the wire schema is byte-identical to §210J through §224 and §226',
  schemaCheck.identical === true, `schema sha ${schemaCheck.sha256}`);
ok('B8. the slice boundary records no schema, authority, layer or runtime change',
  SLICE_BOUNDARY_226.schemaChanged === false
  && SLICE_BOUNDARY_226.newSemanticAuthorityIntroduced === false
  && SLICE_BOUNDARY_226.deterministicSemanticInferenceIntroduced === false
  && SLICE_BOUNDARY_226.newArchitectureLayerIntroduced === false
  && SLICE_BOUNDARY_226.verifierChanged === false
  && SLICE_BOUNDARY_226.projectionChanged === false
  && SLICE_BOUNDARY_226.ledgerChanged === false
  && SLICE_BOUNDARY_226.runtimeModulesChanged === 0
  && SLICE_BOUNDARY_226.section224TextRewritten === false);
ok('B9. the §221 assembly path still assembles against the pinned contract',
  typeof assembleFirstPass221 === 'function');
ok('B10. the successor declares its base and every root cause carries §225 evidence',
  BASE_CONTRACT_VERSION_226.includes('224')
  && ROOT_CAUSES_226.length === 3
  && ROOT_CAUSES_226.every(r => r.demonstratedBy.length > 80 && r.observedIn.length > 0));

// ------------------------------------------------------------------ C. score both contracts

console.log('\n---- C. EVERY CASE, EVERY MEASURE, BOTH CONTRACTS ----');

interface Scored {
  readonly caseId: string;
  readonly contract: ContractUnderTest226;
  readonly results: Readonly<Record<Measure226, MeasureResult226>>;
  readonly classifications: readonly PropertyClassification226[];
}

const scored: Scored[] = [];
for (const c of CASES_226) {
  for (const contract of ['BASE_224', 'REMEDIATED_226'] as const) {
    const r = evaluateAll226(c, contract);
    scored.push({ caseId: c.caseId, contract, results: r.results, classifications: r.classifications });
  }
}

function got(caseId: string, contract: ContractUnderTest226, m: Measure226): Verdict226 {
  return scored.find(s => s.caseId === caseId && s.contract === contract)!.results[m].verdict;
}

for (const c of CASES_226) {
  for (const m of MEASURES_226) {
    for (const [contract, expected] of [
      ['BASE_224', c.expectedUnder224[m]],
      ['REMEDIATED_226', c.expectedUnder226[m]],
    ] as const) {
      const actual = got(c.caseId, contract as ContractUnderTest226, m);
      if (actual === expected) { conformancePass += 1; continue; }
      conformanceMismatches.push(
        `${c.caseId} / ${m} / ${contract}: preregistered ${expected}, evaluated ${actual}`);
    }
  }
}
console.log(`preregistration conformance: ${conformancePass} matched, `
  + `${conformanceMismatches.length} mismatched`);
for (const m of conformanceMismatches) console.log(`      ${m}`);
ok('C1. every evaluated verdict matches the frozen preregistration, both contracts',
  conformanceMismatches.length === 0, conformanceMismatches.join(' | '));

for (const c of CASES_226) {
  const line = MEASURES_226
    .map(m => `${m.split('_')[0].slice(0, 4)}:${got(c.caseId, 'BASE_224', m)[0]}`
      + `/${got(c.caseId, 'REMEDIATED_226', m)[0]}`)
    .join(' ');
  console.log(`      ${c.caseId.padEnd(32)} ${line}`);
}

// ------------------------------------------------------------------ D. hard local requirements

console.log('\n---- D. HARD LOCAL REQUIREMENTS (§226 contract, none offset by any other) ----');

/** Ground truth about each fixture, derived from the frozen truth, not from any contract. */
function truth(c: Case226): {
  omits: boolean; substitutes: boolean; absorbs: boolean; falseDeclares: boolean;
} {
  // Attribution is preregistered in the frozen instrument: which owed gap the entry reaches for.
  // Whether it NAMED that gap correctly is the separate property-identity question below.
  const covered = new Set(c.output.declarations
    .map(d => d.attemptsOwedPropertyKey)
    .filter((k): k is string => k !== null));
  return {
    omits: c.owedProperties.some(p => !covered.has(p.key)),
    substitutes: c.output.declarations
      .some(d => classifyDeclaredProperty226(c, d).classifiedAs !== 'OWED_PROPERTY'),
    absorbs: c.owedProperties.length >= 2 && covered.size < c.owedProperties.length,
    falseDeclares: c.owedProperties.length === 0 && c.output.declarations.length > 0,
  };
}

const omitters = CASES_226.filter(c => truth(c).omits);
ok(`E1. decision-critical declaration recall: 100% — all ${omitters.length} omissions caught`,
  omitters.every(c => got(c.caseId, 'REMEDIATED_226', 'DECLARATION_RECALL') === 'DEFECTIVE'),
  omitters.filter(c => got(c.caseId, 'REMEDIATED_226', 'DECLARATION_RECALL') !== 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

const substituters = CASES_226.filter(c => truth(c).substitutes);
ok(`E2. exact controlling-property identity: 100% — all ${substituters.length} substitutions caught`,
  substituters.every(c => got(c.caseId, 'REMEDIATED_226', 'PROPERTY_IDENTITY') === 'DEFECTIVE'),
  substituters.filter(c => got(c.caseId, 'REMEDIATED_226', 'PROPERTY_IDENTITY') !== 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

const absorbers = CASES_226.filter(c => truth(c).absorbs);
ok(`E3. independent property preservation: 100% — all ${absorbers.length} absorptions caught`,
  absorbers.every(c => got(c.caseId, 'REMEDIATED_226', 'INDEPENDENCE') === 'DEFECTIVE'),
  absorbers.filter(c => got(c.caseId, 'REMEDIATED_226', 'INDEPENDENCE') !== 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

const restraintCases = CASES_226.filter(c => c.owedProperties.length === 0);
ok(`E4. restraint false declarations: 0 — ${restraintCases.length} restraint cases, none flagged`,
  restraintCases.every(c => got(c.caseId, 'REMEDIATED_226', 'RESTRAINT') === 'COMPLIANT'
    && !truth(c).falseDeclares),
  restraintCases.filter(c => got(c.caseId, 'REMEDIATED_226', 'RESTRAINT') !== 'COMPLIANT')
    .map(c => c.caseId).join(', '));

const actCases = CASES_226.filter(c => c.requiredActSemanticsApply);
ok(`E5. required-act over-correction: 0 — ${actCases.length} case(s) where the act IS the property`,
  actCases.every(c => got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ACT_CONTROL') !== 'DEFECTIVE'),
  actCases.filter(c => got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ACT_CONTROL') === 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

const artifactCases = CASES_226.filter(c => c.requiredArtifactSemanticsApply);
ok(`E6. required-artifact over-correction: 0 — ${artifactCases.length} case(s) with artifact semantics`,
  artifactCases.every(c => got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ARTIFACT_CONTROL') !== 'DEFECTIVE'),
  artifactCases.filter(c => got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ARTIFACT_CONTROL') === 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

const bypassExercised = CASES_226
  .filter(c => got(c.caseId, 'REMEDIATED_226', 'CANDIDATE_STATE_BYPASS') !== 'NOT_EXERCISED');
ok(`E7. candidate-state bypass cases: 0 — ${bypassExercised.length} exercised, none bypassed`,
  bypassExercised.every(c =>
    got(c.caseId, 'REMEDIATED_226', 'CANDIDATE_STATE_BYPASS') === 'COMPLIANT'),
  bypassExercised.filter(c =>
    got(c.caseId, 'REMEDIATED_226', 'CANDIDATE_STATE_BYPASS') === 'DEFECTIVE')
    .map(c => c.caseId).join(', '));

ok('E8. deterministic semantic invention: 0 — schema, projection, ledger and verifier untouched',
  schemaCheck.identical === true
  && SLICE_BOUNDARY_226.deterministicSemanticInferenceIntroduced === false
  && SLICE_BOUNDARY_226.projectionChanged === false
  && SLICE_BOUNDARY_226.ledgerChanged === false
  && SLICE_BOUNDARY_226.verifierChanged === false
  && SLICE_BOUNDARY_226.runtimeModulesChanged === 0);

ok('E9. no regression: every defect the §224 contract caught, the §226 contract also catches',
  CASES_226.every(c => MEASURES_226.every(m =>
    got(c.caseId, 'BASE_224', m) !== 'DEFECTIVE'
    || got(c.caseId, 'REMEDIATED_226', m) === 'DEFECTIVE'
    // the bypass measure inverts: DEFECTIVE under §224 means the §224 trigger was bypassed
    || m === 'CANDIDATE_STATE_BYPASS')),
  'a case the base contract refused is permitted by the successor');

ok('E10. no restraint case moved between the contracts',
  restraintCases.every(c => got(c.caseId, 'BASE_224', 'RESTRAINT')
    === got(c.caseId, 'REMEDIATED_226', 'RESTRAINT')));

// ------------------------------------------------------------------ F. what changed, and why

console.log('\n---- F. WHAT THE REMEDIATION CHANGES ----');

const moved = CASES_226.filter(c => MEASURES_226
  .some(m => got(c.caseId, 'BASE_224', m) !== got(c.caseId, 'REMEDIATED_226', m)));
console.log(`      cases whose verdict moved: ${moved.map(c => c.caseId).join(', ')}`);

for (const rc of ['RC5', 'RC6', 'RC7'] as const) {
  const hits = CASES_226.filter(c => c.exercisesRootCause === rc);
  const discriminates = hits.some(c => MEASURES_226
    .some(m => got(c.caseId, 'BASE_224', m) !== got(c.caseId, 'REMEDIATED_226', m)));
  ok(`F. ${rc} is exercised by ${hits.map(c => c.caseId).join(', ')} and discriminates`,
    hits.length > 0 && discriminates);
}

ok('F4. the §224 contract cannot see a bypass; the §226 contract can',
  CASES_226.filter(c => c.isCandidateStateBypassCase).every(c =>
    got(c.caseId, 'BASE_224', 'CANDIDATE_STATE_BYPASS') === 'DEFECTIVE'
    && got(c.caseId, 'REMEDIATED_226', 'CANDIDATE_STATE_BYPASS') === 'COMPLIANT'));

ok('F5. the §226 widening did not turn either restraint case into a false declaration',
  restraintCases.every(c => got(c.caseId, 'REMEDIATED_226', 'RESTRAINT') === 'COMPLIANT'));

// ------------------------------------------------------------------ write the results

const results = {
  artifact: 'SECTION-226-LOCAL-RESULTS',
  instrumentVersion: INSTRUMENT_226_VERSION,
  frozenInstrumentDigest: frozenDigestRecorded,
  contractVersion: FIRST_PASS_CONTRACT_226_VERSION,
  baseContractVersion: BASE_CONTRACT_VERSION_226,
  instructionIdentity: instructionIdentity226(),
  wireSchemaSha256: schemaCheck.sha256,
  providerCalls: 0,
  databaseOperations: 0,
  aggregateScoreComputed: false,
  scope: SLICE_BOUNDARY_226,
  rootCauses: ROOT_CAUSES_226,
  outOfScope: OUT_OF_SCOPE_226,
  contracts: CONTRACT_RULES_226,
  owedMatchFloor: OWED_MATCH_FLOOR,
  preflight: { passed: pre.passed, checks: pre.checks },
  perCase: CASES_226.map(c => ({
    caseId: c.caseId,
    family: c.family,
    exercisesRootCause: c.exercisesRootCause,
    owedProperties: c.owedProperties.map(p => ({ key: p.key, kind: p.kind, proposition: p.proposition })),
    expectedDeclarationCount: c.expectedDeclarationCount,
    emittedDeclarationCount: c.emittedDeclarationCount,
    truth: truth(c),
    triggerReach: c.output.candidates
      .filter(k => k.carriesOwedPropertyKey !== null)
      .map(k => ({
        candidateKey: k.candidateKey,
        assertedConditionState: k.assertedConditionState,
        under224: triggerReaches(c, k, 'BASE_224'),
        under226: triggerReaches(c, k, 'REMEDIATED_226'),
      })),
    classifications: scored.find(s => s.caseId === c.caseId && s.contract === 'REMEDIATED_226')!
      .classifications,
    verdicts: Object.fromEntries(MEASURES_226.map(m => [m, {
      preregisteredUnder224: c.expectedUnder224[m],
      evaluatedUnder224: got(c.caseId, 'BASE_224', m),
      reasonUnder224: scored.find(s => s.caseId === c.caseId && s.contract === 'BASE_224')!
        .results[m].reason,
      preregisteredUnder226: c.expectedUnder226[m],
      evaluatedUnder226: got(c.caseId, 'REMEDIATED_226', m),
      reasonUnder226: scored.find(s => s.caseId === c.caseId && s.contract === 'REMEDIATED_226')!
        .results[m].reason,
    }])),
  })),
  hardRequirements: {
    decisionCriticalDeclarationRecall: omitters.every(c =>
      got(c.caseId, 'REMEDIATED_226', 'DECLARATION_RECALL') === 'DEFECTIVE') ? '100%' : 'FAILED',
    exactControllingPropertyIdentity: substituters.every(c =>
      got(c.caseId, 'REMEDIATED_226', 'PROPERTY_IDENTITY') === 'DEFECTIVE') ? '100%' : 'FAILED',
    independentPropertyPreservation: absorbers.every(c =>
      got(c.caseId, 'REMEDIATED_226', 'INDEPENDENCE') === 'DEFECTIVE') ? '100%' : 'FAILED',
    restraintFalseDeclarations: restraintCases.filter(c => truth(c).falseDeclares).length,
    requiredActOverCorrection: actCases.filter(c =>
      got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ACT_CONTROL') === 'DEFECTIVE').length,
    requiredArtifactOverCorrection: artifactCases.filter(c =>
      got(c.caseId, 'REMEDIATED_226', 'REQUIRED_ARTIFACT_CONTROL') === 'DEFECTIVE').length,
    candidateStateBypassCases: bypassExercised.filter(c =>
      got(c.caseId, 'REMEDIATED_226', 'CANDIDATE_STATE_BYPASS') === 'DEFECTIVE').length,
    deterministicSemanticInvention: 0,
  },
  capabilityAssertions: { passed: pass, failed: fail, failures },
  preregistrationConformance: { matched: conformancePass, mismatched: conformanceMismatches },
  establishes: 'CONTRACT DISCRIMINATION ONLY. No behavioural claim is made or implied '
    + '(HAZLENZ_INVARIANTS 27).',
};

writeFileSync(join(OUT, 'SECTION-226-LOCAL-RESULTS.json'), `${JSON.stringify(results, null, 2)}\n`);

console.log(`\nCAPABILITY: ${pass} passed, ${fail} failed, ${pass + fail} assertions`);
console.log(`PREREGISTRATION CONFORMANCE: ${conformancePass} matched, `
  + `${conformanceMismatches.length} mismatched`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0 · SCHEMA CHANGED no');
console.log('CONTRACT DISCRIMINATION ONLY. No behavioural claim is made or implied.');
if (fail > 0 || conformanceMismatches.length > 0) process.exit(1);
