/**
 * §205 -- ACCEPTANCE DESIGN SUITE. Asserts the fresh cohort manifest, the risk-targeted instrument
 * budget, and the proposed gates are well-formed, bounded, and NOT preregistered.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED.
 */

import {
  COHORT_CASES, FACT_AXES, GATES_ARE_PREREGISTERED, ORDINARY_QUALITY_AGGREGATE_THRESHOLD,
  PROPOSED_GATES, ROW_AXES, TARGETABLE_FINDINGS, TRUTH_SPECIFICATION_STATE,
  acceptanceCohortEffect, computeInstrumentBudget, executionPermitted, findingCoverage,
} from './lib/expert-205-acceptance-cohort';

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
}
const section = (t: string): void => console.log(`\n---------------- ${t}`);

section('1. COHORT MANIFEST');

ok('COHORT.size-in-range', COHORT_CASES.length >= 20 && COHORT_CASES.length <= 30,
  `${COHORT_CASES.length} cases`);
ok('COHORT.ids-unique', new Set(COHORT_CASES.map(c => c.caseId)).size === COHORT_CASES.length);
ok('COHORT.every-case-declares-a-target-and-a-design-note',
  COHORT_CASES.every(c => c.targets.length > 0 && c.designNote.length > 20));
ok('COHORT.every-case-declares-families', COHORT_CASES.every(c => c.families.length > 0));
ok('COHORT.axes-are-from-the-closed-vocabularies',
  COHORT_CASES.every(c => c.rowAxes.every(a => (ROW_AXES as readonly string[]).includes(a))
    && c.factAxisSets.every(s => s.every(a => (FACT_AXES as readonly string[]).includes(a)))));

{
  const cov = findingCoverage();
  console.log(`        coverage: ${Object.entries(cov).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  for (const f of ['F1', 'F2', 'F3', 'F4', 'F7', 'F8'] as const) {
    ok(`COHORT.replication.${f}`, cov[f] >= 3, `${f} targeted by ${cov[f]} cases (n>=3 required)`);
  }
  ok('COHORT.governed-coverage', cov.COVERAGE_GOVERNED >= 3,
    `the §204 coverage hole is targeted by ${cov.COVERAGE_GOVERNED} cases`);
  ok('COHORT.hazard-severity-coverage', cov.COVERAGE_HAZARD_SEVERITY >= 1,
    'HAZARD_SEVERITY was adjudicated once in §204 and is re-covered');
  ok('COHORT.preserved-behaviour-guards',
    cov.S2 >= 3 && cov.S5 >= 2 && cov.S8 >= 1,
    `S2=${cov.S2} S5=${cov.S5} S8=${cov.S8} -- clean-row suppression, conjunctive, not-observed`);
  ok('COHORT.every-finding-vocabulary-member-is-real',
    Object.keys(cov).length === TARGETABLE_FINDINGS.length);
}

{
  const governed = COHORT_CASES.filter(c => c.governed);
  ok('COHORT.governed-block-exists', governed.length >= 3,
    `${governed.length} governed cases -- the only way axes N/S/T get a real verdict`);
  ok('COHORT.governed-includes-a-no-gap-control',
    governed.some(c => c.families.includes('NO_REAL_GAP')),
    'governed input must not itself manufacture a declaration');
}

{
  const overCorrectionGuard = COHORT_CASES.find(c => c.caseId === 'AC-12');
  ok('COHORT.rr3-over-correction-guard-present',
    overCorrectionGuard !== undefined
    && overCorrectionGuard.designNote.includes('GENUINELY BINARY'),
    'a genuinely binary property in a verification setting, so RR-3 cannot pass by always '
    + 'producing three branches');
}

section('2. RISK-TARGETED INSTRUMENT BUDGET');

{
  const b = computeInstrumentBudget();
  console.log(`        ${b.cases} cases -> ${b.rowJudgments} row + ${b.factJudgments} fact = `
    + `${b.totalJudgments} judgments (full factorial would be ${b.fullFactorialWouldBe})`);
  ok('BUDGET.within-target', b.withinTarget,
    `${b.totalJudgments} judgments, target ${b.targetRange[0]}-${b.targetRange[1]}`);
  ok('BUDGET.materially-cheaper-than-full-factorial',
    b.savedByRiskTargeting > 0 && b.totalJudgments < b.fullFactorialWouldBe * 0.75,
    `risk targeting saves ${b.savedByRiskTargeting} judgments `
    + `(${Math.round(100 * b.totalJudgments / b.fullFactorialWouldBe)}% of full factorial)`);
  ok('BUDGET.under-the-204-burden', b.totalJudgments < 300,
    `${b.totalJudgments} vs the 300-356 a full-factorial 24-case instrument would cost`);
}

section('3. PROPOSED GATES');

ok('GATES.count', PROPOSED_GATES.length >= 13, `${PROPOSED_GATES.length} gates proposed`);
ok('GATES.ids-unique', new Set(PROPOSED_GATES.map(g => g.gateId)).size === PROPOSED_GATES.length);
ok('GATES.every-gate-states-threshold-measure-and-failure',
  PROPOSED_GATES.every(g => g.threshold.length > 0 && g.measuredOn.length > 0
    && g.failsIf.length > 0));

{
  const hard = PROPOSED_GATES.filter(g => g.kind === 'HARD_SAFETY_CRITICAL');
  ok('GATES.hard-safety-critical-count', hard.length >= 12,
    `${hard.length} hard safety-critical gates`);
  ok('GATES.hard-gates-are-absolute',
    hard.every(g => g.threshold === '100%' || g.threshold.startsWith('0 ')),
    'every hard gate is 100% or zero-occurrence -- no partial credit on a safety-critical gate');
}

{
  const measurementOnly = PROPOSED_GATES.filter(g => g.kind === 'MEASUREMENT_ONLY');
  ok('GATES.rr6-is-not-a-gate',
    measurementOnly.length === 1 && measurementOnly[0].gateId === 'G15'
    && measurementOnly[0].failsIf.includes('nothing'),
    'the priority-floor gate passes and fails nothing -- RR-6 is diagnostic and D14 is open');
}

{
  const coverage = PROPOSED_GATES.filter(g => g.kind === 'COVERAGE');
  ok('GATES.governed-coverage-gate-forbids-a-claim-rather-than-blocking',
    coverage.length === 1 && coverage[0].gateId === 'G14'
    && coverage[0].failsIf.includes('FORBIDS any claim about governed behaviour'),
    'failing G14 does not block the non-governed surface but forbids the governed claim');
}

ok('GATES.each-204-defect-has-a-gate',
  ['F1', 'F2', 'F3', 'F4', 'F7', 'F8'].every(f => {
    const map: Record<string, string> = { F1: 'G2', F2: 'G4', F3: 'G8', F4: 'G5', F7: 'G9', F8: 'G3' };
    return PROPOSED_GATES.some(g => g.gateId === map[f]);
  }),
  'F1->G2, F2->G4, F3->G8, F4->G5, F7->G9, F8->G3');

ok('GATES.not-preregistered', GATES_ARE_PREREGISTERED === false,
  'PROPOSED. Preregistration is an act the product owner performs before the cohort runs');

ok('GATES.no-self-set-aggregate-threshold',
  ORDINARY_QUALITY_AGGREGATE_THRESHOLD.proposed === null
  && ORDINARY_QUALITY_AGGREGATE_THRESHOLD.withheldBecause.includes('grade itself'),
  'the broader ordinary-quality threshold is deliberately left to the product owner');

section('4. EXECUTION GATE');

{
  const now = executionPermitted({
    truthSpecificationState: TRUTH_SPECIFICATION_STATE,
    governedTransportSmokePassed: false,
    gatesPreregistered: GATES_ARE_PREREGISTERED,
  });
  ok('EXEC.blocked-today', !now.permitted && now.blockers.length === 3,
    now.blockers.join(' | '));

  const ready = executionPermitted({
    truthSpecificationState: 'FROZEN_BEFORE_PROVIDER_EXECUTION',
    governedTransportSmokePassed: true,
    gatesPreregistered: true,
  });
  ok('EXEC.permitted-only-when-all-three-hold', ready.permitted && ready.blockers.length === 0);

  const reviewedNotFrozen = executionPermitted({
    truthSpecificationState: 'PRODUCT_OWNER_REVIEWED',
    governedTransportSmokePassed: true,
    gatesPreregistered: true,
  });
  ok('EXEC.reviewed-is-not-frozen', !reviewedNotFrozen.permitted,
    'product-owner review alone does not permit execution; the freeze is a separate act');
}

{
  const e = acceptanceCohortEffect();
  ok('DESIGN.effects', e.providerCalls === 0 && e.databaseOperations === 0
    && e.cohortIsFrozen === false && e.gatesArePreregistered === false
    && e.anythingIsExecuted === false);
}

console.log('\n================================================================');
console.log('§205 ACCEPTANCE DESIGN SUITE');
console.log('  provider calls: 0    database operations: 0    cohort executions: 0');
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
