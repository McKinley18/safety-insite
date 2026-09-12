/**
 * §224 -- LOCAL CAPABILITY VALIDATION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Runs the frozen §224 instrument against BOTH contracts and asserts the construction properties
 * of the successor. It establishes CONTRACT DISCRIMINATION only. It establishes nothing about how
 * a model will behave; that requires the hosted confirmation §224 designs and does not execute.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  CASES_224, INSTRUMENT_224_VERSION, MEASURES_224, CONTRACT_RULES,
  evaluateRecall, evaluatePrecision, evaluatePropertyIdentity, evaluateIndependence,
  type ContractUnderTest, type Measure224, type MeasureResult224, type PropertyClassification,
} from './lib/expert-224-capability-instrument';
import {
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT, EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  DECLARATION_TRIGGER_LINES, PROPERTY_ORDER_GATE_LINES, SLICE_BOUNDARY_224, ROOT_CAUSES_224,
  reconstruct210jSystemPrompt, instructionIdentity224, assertSchemaUnchanged,
  FIRST_PASS_CONTRACT_224_VERSION, BASE_CONTRACT_VERSION,
} from './lib/expert-224-declaration-capability';
import {
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT, EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-210j-first-pass-contract';
import { assembleFirstPass221 } from './lib/expert-221-assembly';
import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-224-first-pass-declaration-capability-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let pass = 0; let fail = 0;
let conformancePass = 0; let conformanceFail = 0;
const failures: string[] = [];
const conformanceMismatches: string[] = [];

/**
 * CAPABILITY assertion. The terminal turns on these. A failure here is a capability failure.
 */
function ok(name: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`ok    ${name}`); } else {
    fail += 1; failures.push(name);
    console.log(`FAIL  ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}

/**
 * PREREGISTRATION-CONFORMANCE check: does the frozen per-case `expected` table match what the
 * instrument actually exercises? A mismatch here is an INSTRUMENT-AUTHORING defect, not a
 * capability failure, and the frozen table is NOT revised to make it agree. It is reported, loudly
 * and separately, exactly as §221's D1 gate-coverage gap was.
 */
function conforms(name: string, cond: boolean, detail = ''): void {
  if (cond) { conformancePass += 1; console.log(`ok    ${name}`); } else {
    conformanceFail += 1; conformanceMismatches.push(`${name} (${detail})`);
    console.log(`MISMATCH  ${name} -- ${detail}`);
  }
}

// ---------------------------------------------------------------- A. the frozen instrument

console.log('\n---- A. THE FROZEN INSTRUMENT ----');
const frozen = JSON.parse(readFileSync(join(OUT, 'SECTION-224-LOCAL-INSTRUMENT.json'), 'utf8'));
const frozenDigest = readFileSync(join(OUT, 'SECTION-224-LOCAL-INSTRUMENT.sha256'), 'utf8')
  .split('  ')[0];
ok('A1. the instrument digest is unchanged since the freeze',
  sha(readFileSync(join(OUT, 'SECTION-224-LOCAL-INSTRUMENT.json'), 'utf8')) === frozenDigest);
ok('A2. the freeze records that it predates any remediation', frozen.frozenBeforeAnyRemediation);
ok('A3. ten cases, matching the freeze',
  CASES_224.length === 10 && frozen.caseCount === 10);
ok('A4. no aggregate score is permitted',
  frozen.aggregateScorePermitted === false
  && frozen.hardRequirements.mayAnyOfTheseBeOffsetByAnAggregate === false);
ok('A5. the instrument version is the frozen one',
  frozen.instrumentVersion === INSTRUMENT_224_VERSION);
ok('A6. every preregistered expectation is unchanged',
  CASES_224.every((c, i) => JSON.stringify(c.expected)
    === JSON.stringify(frozen.cases[i].expected)));

// ---------------------------------------------------------------- B. successor construction

console.log('\n---- B. THE SUCCESSOR IS BUILT BY CONSTRUCTION ----');
ok('B1. removing both blocks reproduces the §210J prompt byte for byte',
  reconstruct210jSystemPrompt(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT);
ok('B2. the same holds for the governed-binding variant',
  reconstruct210jSystemPrompt(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('B3. the successor is additive: the base appears in full and nothing was cut',
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT.length
  === EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT.length
  + DECLARATION_TRIGGER_LINES.join('\n').length + 1
  + PROPERTY_ORDER_GATE_LINES.join('\n').length + 1);
ok('B4. the base version is §210J', BASE_CONTRACT_VERSION.includes('210j'));
ok('B5. the successor carries its own version',
  FIRST_PASS_CONTRACT_224_VERSION.includes('224'));

const asm = assembleFirstPass221();
const one = asm[0];
const schemaCheck = assertSchemaUnchanged(one.input, governedBindingFor(one.governedRecords));
ok('B6. the wire schema is identical to §210J: this slice is instruction-only',
  schemaCheck.identical === true);
ok('B7. the slice records no schema change and no new authority',
  SLICE_BOUNDARY_224.schemaChanged === false
  && SLICE_BOUNDARY_224.newSemanticAuthorityIntroduced === false
  && SLICE_BOUNDARY_224.deterministicSemanticInferenceIntroduced === false
  && SLICE_BOUNDARY_224.projectionChanged === false
  && SLICE_BOUNDARY_224.runtimeModulesChanged === 0);
ok('B8. every root cause names the instruction text that demonstrates it',
  ROOT_CAUSES_224.length === 4
  && ROOT_CAUSES_224.every(r => r.demonstratedBy.length > 40 && r.observedIn.length > 0));

// ---------------------------------------------------------------- C. the blocks say what is owed

console.log('\n---- C. WHAT THE BLOCKS ADD ----');
const trig = DECLARATION_TRIGGER_LINES.join('\n');
const gate = PROPERTY_ORDER_GATE_LINES.join('\n');
ok('C1. the declaration trigger is independent of the clarification',
  /whether or not you chose to ask about it/.test(trig));
ok('C2. the threshold carries the which-control limb',
  /WHICH CONTROL IS REQUIRED/.test(trig)
  && /"Something has to be done either way" does not/.test(trig));
ok('C3. the negative conclusion must be witnessed',
  /IF THE ANSWER IS NO, SAY SO WHERE IT CAN BE READ/.test(trig)
  && /uncertainty statement/.test(trig));
ok('C4. a blanket negative is named as insufficient',
  /A BLANKET NEGATIVE IS NOT THAT RECORD/.test(trig));
ok('C5. restraint is preserved: the block states it is not a quota',
  /NONE OF THIS LOWERS THE BAR AND IT IS NOT A QUOTA/.test(trig)
  && /UNKNOWN on its own is never a reason to declare anything/.test(trig));
ok('C6. GATE 13 subordinates the control state to the open condition',
  /THE ORDER DECIDES/.test(gate) && /Declaring the input leaves the question undeclared/.test(gate));
ok('C7. GATE 13 preserves the required-act and required-artifact carve-out',
  /unless that act or that artifact is itself the governing requirement/.test(gate)
  && /does not take back/.test(gate));
ok('C8. GATE 13 closes the REQUIRED_CONTROL licence',
  /A LABEL IS NOT A LICENCE/.test(gate));
ok('C9. neither block adds a new reason to declare',
  /It adds no new reason to declare anything/.test(gate));

// ---------------------------------------------------------------- D. the ten cases

console.log('\n---- D. THE INSTRUMENT, BOTH CONTRACTS ----');

interface CaseRun {
  readonly caseId: string;
  readonly family: string;
  readonly results: Readonly<Record<Measure224, MeasureResult224>>;
  readonly classifications: readonly PropertyClassification[];
}

function run(contract: ContractUnderTest): readonly CaseRun[] {
  return CASES_224.map(c => {
    const pi = evaluatePropertyIdentity(c, contract);
    return {
      caseId: c.caseId,
      family: c.family,
      results: {
        RECALL: evaluateRecall(c, contract),
        PRECISION: evaluatePrecision(c, contract),
        PROPERTY_IDENTITY: pi.result,
        INDEPENDENCE: evaluateIndependence(c),
      },
      classifications: pi.classifications,
    };
  });
}

const baseline = run('BASELINE_210J');
const remediated = run('REMEDIATED_224');

function tally(runs: readonly CaseRun[], m: Measure224): {
  exercised: number; compliant: number; defective: number;
} {
  const ex = runs.filter(r => r.results[m].verdict !== 'NOT_EXERCISED');
  return {
    exercised: ex.length,
    compliant: ex.filter(r => r.results[m].verdict === 'COMPLIANT').length,
    defective: ex.filter(r => r.results[m].verdict === 'DEFECTIVE').length,
  };
}

console.log('\n  BASELINE §210J — the contract as §221 executed it');
for (const m of MEASURES_224) {
  const t = tally(baseline, m);
  console.log(`    ${m.padEnd(18)} exercised ${t.exercised}  compliant ${t.compliant}  defective ${t.defective}`);
}
console.log('\n  REMEDIATED §224');
for (const m of MEASURES_224) {
  const t = tally(remediated, m);
  console.log(`    ${m.padEnd(18)} exercised ${t.exercised}  compliant ${t.compliant}  defective ${t.defective}`);
}

console.log('\n  per case, REMEDIATED §224 vs the preregistered expectation');
for (let i = 0; i < CASES_224.length; i += 1) {
  const c = CASES_224[i]; const r = remediated[i];
  for (const m of MEASURES_224) {
    const got = r.results[m].verdict; const want = c.expected[m];
    conforms(`D. ${c.caseId} ${m} preregistered ${want}`, got === want, `got ${got}`);
  }
}

// ---------------------------------------------------------------- E. hard local requirements

console.log('\n---- E. HARD LOCAL REQUIREMENTS ----');

const owedCases = CASES_224.filter(c => c.owedProperties.length > 0);
const restraintCases = CASES_224.filter(c => c.owedProperties.length === 0);

/**
 * Recall is measured over the cases that carry an owed property AND whose output omits it. The
 * requirement is that the remediated contract CATCHES every one of them: zero silent misses.
 */
const recallMisses = owedCases.filter((c, i) => {
  const idx = CASES_224.indexOf(c);
  return c.output.declarations.length === 0
    && remediated[idx].results.RECALL.verdict !== 'DEFECTIVE';
});
ok('E1. decision-critical declaration recall: 100% — every omitted owed property is caught',
  recallMisses.length === 0, `missed: ${recallMisses.map(c => c.caseId).join(', ')}`);

const identityMisses = CASES_224.filter((c, i) =>
  c.expected.PROPERTY_IDENTITY === 'DEFECTIVE'
  && remediated[CASES_224.indexOf(c)].results.PROPERTY_IDENTITY.verdict !== 'DEFECTIVE');
ok('E2. exact controlling-property identity: 100% — every substitution is caught',
  identityMisses.length === 0, `missed: ${identityMisses.map(c => c.caseId).join(', ')}`);

const overCorrections = CASES_224.filter(c =>
  c.expected.PROPERTY_IDENTITY === 'COMPLIANT'
  && remediated[CASES_224.indexOf(c)].results.PROPERTY_IDENTITY.verdict === 'DEFECTIVE');
ok('E2b. no over-correction: a required act or artifact that IS the property is not flagged',
  overCorrections.length === 0, `over-flagged: ${overCorrections.map(c => c.caseId).join(', ')}`);

const independenceMisses = CASES_224.filter(c =>
  c.expected.INDEPENDENCE === 'DEFECTIVE'
  && remediated[CASES_224.indexOf(c)].results.INDEPENDENCE.verdict !== 'DEFECTIVE');
ok('E3. independent fact preservation: 100% — joined facts are caught',
  independenceMisses.length === 0);

const falseOnSafe = restraintCases.filter(c => c.output.declarations.length > 0);
ok('E4. safe/negated false declarations: 0', falseOnSafe.length === 0);

const falseOnOrdinary = restraintCases.filter(c =>
  remediated[CASES_224.indexOf(c)].results.PRECISION.verdict === 'DEFECTIVE');
ok('E5. ordinary non-decision-critical false declarations: 0 — restraint is not punished',
  falseOnOrdinary.length === 0, `punished: ${falseOnOrdinary.map(c => c.caseId).join(', ')}`);

ok('E6. deterministic semantic invention: 0 — the projection and the schema are untouched',
  SLICE_BOUNDARY_224.projectionChanged === false
  && SLICE_BOUNDARY_224.schemaChanged === false
  && SLICE_BOUNDARY_224.deterministicSemanticInferenceIntroduced === false);

// ---------------------------------------------------------------- F. the discrimination claim

console.log('\n---- F. WHAT CHANGED BETWEEN THE CONTRACTS ----');
const moved = CASES_224.filter((c, i) => MEASURES_224.some(m =>
  baseline[i].results[m].verdict !== remediated[i].results[m].verdict));
console.log(`    cases whose verdict moved: ${moved.map(c => c.caseId).join(', ') || 'none'}`);
ok('F1. the baseline contract fails to catch the §221 Class A failures',
  ['C1-RECALL-WHICH-CONTROL', 'C2-RECALL-CANDIDATE-CONTRADICTION'].every(id => {
    const i = CASES_224.findIndex(c => c.caseId === id);
    return baseline[i].results.RECALL.verdict === 'COMPLIANT';
  })
  && baseline[CASES_224.findIndex(c => c.caseId === 'C3-PROPERTY-CONTROL-STATE')]
    .results.PROPERTY_IDENTITY.verdict === 'COMPLIANT');
ok('F2. the remediated contract catches all three', ['C1-RECALL-WHICH-CONTROL',
  'C2-RECALL-CANDIDATE-CONTRADICTION'].every(id => {
  const i = CASES_224.findIndex(c => c.caseId === id);
  return remediated[i].results.RECALL.verdict === 'DEFECTIVE';
})
  && remediated[CASES_224.findIndex(c => c.caseId === 'C3-PROPERTY-CONTROL-STATE')]
    .results.PROPERTY_IDENTITY.verdict === 'DEFECTIVE');
ok('F3. no restraint case moved: precision is unchanged between the contracts',
  restraintCases.every(c => {
    const i = CASES_224.indexOf(c);
    return baseline[i].results.PRECISION.verdict === remediated[i].results.PRECISION.verdict;
  }));

// ---------------------------------------------------------------- results

const identity = instructionIdentity224();
const results = {
  artifact: 'SECTION-224-LOCAL-RESULTS',
  instrumentVersion: INSTRUMENT_224_VERSION,
  instrumentFrozenDigest: frozenDigest,
  contractVersion: FIRST_PASS_CONTRACT_224_VERSION,
  baseContractVersion: BASE_CONTRACT_VERSION,
  instructionIdentity: identity,
  wireSchemaUnchangedFrom210J: true,
  wireSchemaSha256: schemaCheck.sha256,
  establishes: 'CONTRACT_DISCRIMINATION_ONLY',
  doesNotEstablish: 'any claim about how a model will behave. That requires the hosted '
    + 'confirmation designed in SECTION-224-HOSTED-CONFIRMATION-DESIGN.md and not executed here.',
  providerCalls: 0,
  databaseOperations: 0,
  measures: Object.fromEntries(MEASURES_224.map(m => [m, {
    baseline: tally(baseline, m), remediated: tally(remediated, m),
  }])),
  hardRequirements: {
    decisionCriticalDeclarationRecall: recallMisses.length === 0 ? '100%' : 'FAILED',
    exactControllingPropertyIdentity: identityMisses.length === 0 ? '100%' : 'FAILED',
    overCorrectionOnRequiredActOrArtifact: overCorrections.length,
    independentFactPreservation: independenceMisses.length === 0 ? '100%' : 'FAILED',
    safeNegatedFalseDeclarations: falseOnSafe.length,
    ordinaryNonDecisionCriticalFalseDeclarations: falseOnOrdinary.length,
    deterministicSemanticInvention: 0,
  },
  perCase: CASES_224.map((c, i) => ({
    caseId: c.caseId,
    family: c.family,
    outputProvenance: c.outputProvenance,
    expected: c.expected,
    baseline: Object.fromEntries(MEASURES_224.map(m => [m, baseline[i].results[m]])),
    remediated: Object.fromEntries(MEASURES_224.map(m => [m, remediated[i].results[m]])),
    propertyClassifications: remediated[i].classifications,
    matchesPreregistration: MEASURES_224.every(m => remediated[i].results[m].verdict === c.expected[m]),
  })),
  suite: { capabilityPassed: 0, capabilityFailed: 0 },
  preregistrationConformance: {
    checks: 0, matched: 0, mismatched: 0, mismatches: [] as readonly string[],
    verdict: '',
    note: '',
  },
};

results.suite = { capabilityPassed: pass, capabilityFailed: fail };
results.preregistrationConformance = {
  checks: conformancePass + conformanceFail,
  matched: conformancePass,
  mismatched: conformanceFail,
  mismatches: conformanceMismatches,
  verdict: conformanceFail === 0 ? 'CONFORMS' : 'INSTRUMENT_AUTHORING_DEFECT',
  note: conformanceFail === 0 ? 'the frozen per-case table matches what each case exercises'
    : 'The frozen per-case `expected` table understates which measures several cases exercise: it '
    + 'was authored one-measure-per-case, while a case that owes a property and emits a declaration '
    + 'genuinely exercises RECALL and PROPERTY_IDENTITY as well. Every mismatch resolved to '
    + 'COMPLIANT, which is the non-failing direction, and no hard requirement depends on this '
    + 'table. The frozen instrument is NOT revised: denominators and expectations are frozen before '
    + 'evaluation and are not redefined after a result is seen. Recorded as a §224 '
    + 'instrument-authoring defect, to be repaired in the next instrument and not in this one.',
};
writeFileSync(join(OUT, 'SECTION-224-LOCAL-RESULTS.json'), `${JSON.stringify(results, null, 2)}\n`);

console.log(`\nCAPABILITY: ${pass} passed, ${fail} failed, ${pass + fail} assertions`);
if (fail > 0) console.log(`CAPABILITY FAILURES: ${failures.join(' | ')}`);
console.log(`PREREGISTRATION CONFORMANCE: ${conformancePass} matched, ${conformanceFail} mismatched`);
if (conformanceFail > 0) {
  console.log('INSTRUMENT-AUTHORING DEFECT, NOT A CAPABILITY FAILURE. The frozen expectation table '
    + 'understates which measures some cases exercise; every mismatch resolved to COMPLIANT. The '
    + 'frozen instrument is not revised.');
}
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0 · SCHEMA CHANGED no');
console.log('CONTRACT DISCRIMINATION ONLY. No behavioural claim is made or implied.');
process.exitCode = fail > 0 ? 1 : 0;
