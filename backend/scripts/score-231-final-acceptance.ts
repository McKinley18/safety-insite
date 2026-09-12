/**
 * §231 — compute the fourteen frozen hard safety gates and the thirteen frozen quality measures
 * from the completed adjudication, and apply the frozen decision rule.
 *
 * ZERO provider calls. No threshold, denominator or gate definition is read from anywhere but the
 * frozen §230 documents. Nothing here may be run before every mandatory slot is filled.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const V = join(__dirname, '..', '..', 'verification');
const I230 = join(V, 'expert-hazlenz-230-final-fresh-acceptance-instrument-2026-09-11');
const EVID = join(V, 'expert-hazlenz-231-final-fresh-acceptance-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const rd = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

const gatesDoc = rd(join(I230, 'SECTION-230-ACCEPTANCE-GATES.json'));
const slotsDoc = rd(join(I230, 'SECTION-230-JUDGMENT-SLOTS.json'));
const coverage = rd(join(I230, 'SECTION-230-COVERAGE-MAP.json'));
const adjudication = rd(join(EVID, 'ADJUDICATION-231-SLOTS.json'));
const measures = rd(join(EVID, 'ADJUDICATION-231-MEASURES.json'));

// ---- completeness: every mandatory slot filled, none invented
const frozenSlotIds = (slotsDoc.slots as any[]).map(s => s.id);
const filled = new Map<string, any>((adjudication.slots as any[]).map(s => [s.slotId, s]));
const missing = frozenSlotIds.filter(id => !filled.has(id));
const invented = [...filled.keys()].filter(id => !frozenSlotIds.includes(id));
if (missing.length > 0) throw new Error(`§231 ABORT: unfilled mandatory slots: ${missing.join(',')}`);
if (invented.length > 0) throw new Error(`§231 ABORT: slots invented after freeze: ${invented.join(',')}`);
const VOCAB = new Set(slotsDoc.verdictVocabulary as string[]);
for (const s of filled.values()) {
  if (!VOCAB.has(s.verdict)) throw new Error(`§231 ABORT: ${s.slotId} verdict ${s.verdict} is not in the frozen vocabulary`);
  if (typeof s.rationale !== 'string' || s.rationale.length < 20) {
    throw new Error(`§231 ABORT: ${s.slotId} carries no adjudication rationale`);
  }
}

// ================================================================ hard safety gates

const perCase = new Map<string, any>((measures.cases as any[]).map(c => [c.caseId, c]));
const gateResults = (gatesDoc.hardSafetyGates as any[]).map(g => {
  const exercisedCases: string[] = coverage.hardGateCoverage[g.id].cases;
  const occurrences: any[] = [];
  let opportunities = 0;
  for (const caseId of exercisedCases) {
    const c = perCase.get(caseId);
    if (c === undefined) throw new Error(`§231 ABORT: no measurement record for ${caseId}`);
    const v = c.gates[g.id];
    if (v === undefined) throw new Error(`§231 ABORT: ${caseId} carries no determination for ${g.id}`);
    if (v.status === 'NOT_EXERCISED') continue;
    opportunities += 1;
    if (v.status === 'FIRED' || v.status === 'AMBIGUOUS') {
      occurrences.push({ caseId, status: v.status, ...v });
    }
  }
  const result = opportunities === 0 ? 'COVERAGE_INSUFFICIENT'
    : occurrences.length === 0 ? 'PASS' : 'FAIL';
  return {
    id: g.id, name: g.name, threshold: g.threshold, statement: g.statement,
    casesFrozenAsExercising: exercisedCases,
    exercisedOpportunities: opportunities,
    occurrences, occurrenceCount: occurrences.length,
    result,
  };
});

// ================================================================ quality measures

const sumOf = (field: string, part: 'n' | 'd'): number =>
  (measures.cases as any[]).reduce((t, c) => {
    const m = c[field];
    if (m === undefined || m === null) return t;
    if (typeof m === 'string') {
      // a PASS/FAIL/AMBIGUOUS/NOT_EXERCISED axis contributes 1 to the denominator unless
      // NOT_EXERCISED, and 1 to the numerator only on PASS
      if (m === 'NOT_EXERCISED') return t;
      return t + (part === 'd' ? 1 : (m === 'PASS' ? 1 : 0));
    }
    return t + (part === 'd' ? m.d : m.n);
  }, 0);

const QFIELD: Record<string, string> = {
  Q1: 'q1', Q2: 'q2', Q3: 'q3', Q4: 'q4', Q5: 'q5', Q6: 'q6', Q7: 'q7',
  Q8: 'q8', Q9: 'q9', Q10: 'q10', Q11: 'q11', Q12: 'q12', Q13: 'q13',
};

const qualityResults = (gatesDoc.qualityMeasures as any[]).map(q => {
  const f = QFIELD[q.id];
  const n = sumOf(f, 'n');
  const d = sumOf(f, 'd');
  const rate = d === 0 ? null : n / d;
  const result = d === 0 ? 'NOT_EXERCISED'
    : (rate as number) >= q.threshold ? 'PASS' : 'FAIL';
  return {
    id: q.id, name: q.name, threshold: q.threshold, unit: q.unit,
    obligation: q.obligation ?? null,
    numerator: n, denominator: d,
    rate: rate === null ? null : Number(rate.toFixed(4)),
    result,
    perCase: (measures.cases as any[])
      .filter(c => c[f] !== undefined && c[f] !== null && c[f] !== 'NOT_EXERCISED')
      .map(c => ({ caseId: c.caseId, value: c[f] })),
  };
});

// ================================================================ before-beta measurements

const obligations = rd(join(I230, 'SECTION-230-ACCEPTANCE-INSTRUMENT.json'))
  .measurementObligations as any[];

const mo1 = {
  id: 'MO-1', name: 'SILENT_NON_DECLARATION',
  q2: qualityResults.find(q => q.id === 'Q2'),
  hs1: gateResults.find(g => g.id === 'HS1'),
  cases: coverage.measurementObligationCoverage['MO-1'].cases,
};
const mo2 = {
  id: 'MO-2', name: 'WRONG_PROPERTY_SELECTION',
  q4: qualityResults.find(q => q.id === 'Q4'),
  hs2: gateResults.find(g => g.id === 'HS2'),
  cases: coverage.measurementObligationCoverage['MO-2'].cases,
};

// ================================================================ the frozen decision rule

const hardGateFailures = gateResults.filter(g => g.result === 'FAIL');
const coverageInsufficient = gateResults.filter(g => g.result === 'COVERAGE_INSUFFICIENT');
const qualityFailures = qualityResults.filter(q => q.result === 'FAIL');
const qualityNotExercised = qualityResults.filter(q => q.result === 'NOT_EXERCISED');

const hardGatesAllPass = hardGateFailures.length === 0 && coverageInsufficient.length === 0;
const qualityAllPass = qualityFailures.length === 0 && qualityNotExercised.length === 0;

const section231Decision = !hardGatesAllPass
  ? 'EXPERT_HAZLENZ_v1.0_FINAL_ACCEPTANCE_FAILED'
  : qualityAllPass
    ? 'EXPERT_HAZLENZ_v1.0_FINAL_ACCEPTANCE_PASSED'
    : 'EXPERT_HAZLENZ_v1.0_FINAL_ACCEPTANCE_FAILED';

const section230Taxonomy = hardGateFailures.length > 0 ? 'NOT_ACCEPTED'
  : coverageInsufficient.length > 0 ? 'NOT_ACCEPTED_COVERAGE_INSUFFICIENT_PREVENTS_ACCEPTED'
    : qualityFailures.length > 0 ? 'ACCEPTED_WITH_DOCUMENTED_LIMITATIONS'
      : 'ACCEPTED';

const doc = {
  artifact: 'SECTION-231-GATES-AND-MEASURES',
  candidateBaseline: '48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200',
  frozenInstrumentDigest: 'bbde6ca0a1d1253ea8dc78d46bef8a26b3ef75ac2d59f72ed051e9e8fbe06844',
  providerCalls: 0, databaseOperations: 0,
  adjudicationBlinded: true,
  slotsFilled: filled.size, slotsFrozen: frozenSlotIds.length,
  productOwnerSlots: [...filled.values()].filter(s => s.adjudicator === 'PRODUCT_OWNER').length,
  deterministicSlots: [...filled.values()].filter(s => s.adjudicator === 'DETERMINISTIC').length,
  verdictCounts: [...filled.values()].reduce((a: Record<string, number>, s) => {
    a[s.verdict] = (a[s.verdict] ?? 0) + 1; return a;
  }, {}),
  hardSafetyGates: gateResults,
  hardGateRule: gatesDoc.hardGateRule,
  hardGateFailures: hardGateFailures.map(g => g.id),
  coverageInsufficientGates: coverageInsufficient.map(g => g.id),
  qualityMeasures: qualityResults,
  qualityFailures: qualityFailures.map(q => q.id),
  beforeBetaMeasurements: {
    frozenObligations: obligations,
    MO1: mo1, MO2: mo2,
    areAcceptanceGates: false,
    convertedIntoRemediationRequirements: false,
    addedToTheHardGateSet: false,
    changedTheAcceptanceDecision: false,
  },
  decisionRule: {
    hardGatesEvaluatedFirst: true,
    aggregateCompensationPermitted: false,
    hardGatesAllPass, qualityAllPass,
  },
  section230Taxonomy,
  decision: section231Decision,
};
writeFileSync(join(EVID, 'SECTION-231-GATES-AND-MEASURES.json'), JSON.stringify(doc, null, 2) + '\n');

console.log('---- HARD SAFETY GATES ----');
for (const g of gateResults) {
  console.log(`  ${g.id.padEnd(5)} ${g.name.padEnd(50)} opp=${String(g.exercisedOpportunities).padStart(2)} `
    + `occ=${g.occurrenceCount} ${g.result}`);
  for (const o of g.occurrences) console.log(`        -> ${o.caseId}: ${o.why ?? o.status}`);
}
console.log('---- QUALITY MEASURES ----');
for (const q of qualityResults) {
  console.log(`  ${q.id.padEnd(4)} ${q.name.padEnd(36)} ${String(q.numerator).padStart(3)}/${String(q.denominator).padEnd(3)} `
    + `= ${q.rate === null ? '  n/a' : q.rate.toFixed(4)}  thr ${q.threshold}  ${q.result}`);
}
console.log(`\n§230 taxonomy: ${section230Taxonomy}`);
console.log(`DECISION: ${section231Decision}`);
console.log(`digest: ${sha(JSON.stringify(doc))}`);
