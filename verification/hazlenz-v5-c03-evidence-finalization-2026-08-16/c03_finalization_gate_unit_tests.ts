// V5-C03: unit tests for the pure evaluateFinalizationGate() decision function.
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-c03-evidence-finalization-2026-08-16/c03_finalization_gate_unit_tests.ts

import { evaluateFinalizationGate } from '../../backend/src/safescope-v2/evidence/finalization-gate';

type Case = { name: string; args: Parameters<typeof evaluateFinalizationGate>; expect: { resultStage: string; mayFinalize: boolean; blockedBy: string | null } };

const cases: Case[] = [
  {
    name: 'protected gate already provisional -> stays provisional, gate does not touch it',
    args: ['provisional', false, { sufficiencyLevel: 'sufficient' }, '29 CFR 1910.212'],
    expect: { resultStage: 'provisional', mayFinalize: false, blockedBy: null },
  },
  {
    name: 'final + insufficient + no citation -> newly blocked',
    args: ['final', true, { sufficiencyLevel: 'insufficient', missingCriticalFacts: ['equipment', 'exposure'] }, ''],
    expect: { resultStage: 'provisional', mayFinalize: false, blockedBy: 'evidence_sufficiency' },
  },
  {
    name: 'final + insufficient + HAS citation -> not blocked (belt-and-suspenders)',
    args: ['final', true, { sufficiencyLevel: 'insufficient' }, '29 CFR 1910.212(a)(1)'],
    expect: { resultStage: 'final', mayFinalize: true, blockedBy: null },
  },
  {
    name: 'final + weak (not insufficient) + no citation -> not blocked (must not over-block)',
    args: ['final', true, { sufficiencyLevel: 'weak' }, ''],
    expect: { resultStage: 'final', mayFinalize: true, blockedBy: null },
  },
  {
    name: 'final + partially_sufficient -> not blocked',
    args: ['final', true, { sufficiencyLevel: 'partially_sufficient' }, ''],
    expect: { resultStage: 'final', mayFinalize: true, blockedBy: null },
  },
  {
    name: 'final + sufficient -> not blocked',
    args: ['final', true, { sufficiencyLevel: 'sufficient' }, ''],
    expect: { resultStage: 'final', mayFinalize: true, blockedBy: null },
  },
  {
    name: 'final + evidenceSufficiency undefined (e.g. heap-guarded degraded path) -> not blocked, no crash',
    args: ['final', true, undefined, ''],
    expect: { resultStage: 'final', mayFinalize: true, blockedBy: null },
  },
  {
    name: 'monotonicity: mayFinalize output never exceeds protected mayFinalize input',
    args: ['final', true, { sufficiencyLevel: 'insufficient' }, ''],
    expect: { resultStage: 'provisional', mayFinalize: false, blockedBy: 'evidence_sufficiency' },
  },
];

let allPass = true;
const results = cases.map(c => {
  const out = evaluateFinalizationGate(...c.args);
  const pass = out.resultStage === c.expect.resultStage && out.mayFinalize === c.expect.mayFinalize && out.blockedBy === c.expect.blockedBy;
  allPass = allPass && pass;
  return { name: c.name, pass, actual: out };
});

console.log(JSON.stringify({ allPass, results }, null, 2));
process.exit(allPass ? 0 : 1);
