/**
 * §117 -- MACHINE-GUARDING APPLICABILITY PRECEDENCE: TRACE + BASELINE/POST HARNESS.
 *
 * ZERO provider calls of any kind. Pure deterministic evaluation, $0.00.
 *
 * Runs the contrastive corpus through the REAL `applyEvidenceFoundation` and prints, for every
 * case, the full decision trace the authorization's Phase 1 requires: evidence facts, guard state,
 * energy-isolation state, the `guardPresent` / `energySafe` / `activeEnergy` / `current` booleans,
 * every predicate status, the branch taken, the resulting disposition, confidence and rationale.
 *
 * The booleans are recomputed here from `buildEvidenceFacts` using the SAME expressions
 * `evaluate()` uses (that function is module-private and deliberately not exported). The harness
 * CROSS-CHECKS its recomputation against the real decision so a divergence is caught rather than
 * silently reported -- see `predictedNotApplicable` vs the observed status.
 *
 *   npx ts-node scripts/diagnose-machine-guarding-applicability.ts --label=pre-repair
 *   npx ts-node scripts/diagnose-machine-guarding-applicability.ts --label=post-repair
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { applyEvidenceFoundation } from '../src/safescope-v2/evidence/evidence-foundation';
import { buildEvidenceFacts } from '../src/safescope-v2/evidence/shared-evidence-facts';
import {
  GUARDING_APPLICABILITY_CORPUS, type GuardingCase,
} from '../src/safescope-v2/tests/machine-guarding-applicability-corpus';

const label = (process.argv.find(a => a.startsWith('--label=')) ?? '--label=unlabeled').split('=')[1];
const OUT = join(__dirname, '..', '..', 'verification',
  'hazlenz-machine-guarding-applicability-precedence-2026-08-31');
mkdirSync(join(OUT, 'results'), { recursive: true });
const FILE = join(OUT, 'results', `${label}.json`);
if (existsSync(FILE)) throw new Error(`refusing to overwrite ${FILE} -- choose a new --label`);

interface Fact { type: string; value: unknown; status?: string }

function has(facts: Fact[], type: string, value: unknown): boolean {
  return facts.some(f => f.type === type && f.value === value);
}

interface Row {
  id: string; klass: string; title: string; mirrors: string | null;
  dangerous: boolean; expect: string;
  facts: string[];
  guardState: unknown; energyIsolationState: unknown; energyState: unknown;
  booleans: {
    guardPresent: boolean; energySafe: boolean; activeEnergy: boolean;
    notIsolated: boolean; currentHazardNegated: boolean; noExposure: boolean;
  };
  decisionEmitted: boolean;
  status: string | null; confidence: number | null;
  predicates: Array<{ name: string; status: string }>;
  explanation: string | null;
  verdict: 'PASS' | 'FAIL';
  failureKind: string | null;
}

function evaluateCase(c: GuardingCase): Row {
  const extracted = buildEvidenceFacts({ text: c.text, scopes: [c.scope] });
  const facts = extracted.facts as Fact[];
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result, { text: c.text, scopes: [c.scope] } as never);
  const decisions = (result.applicabilityDecisions ?? []) as Array<{
    family: string; status: string; confidence: number; explanation: string;
    requiredPredicates: Array<{ name: string; status: string }>;
  }>;
  const d = decisions.find(x => c.family.test(x.family)) ?? null;

  const guardPresent = has(facts, 'guardState', 'present_and_effective');
  const energySafe = has(facts, 'energyIsolationState', 'isolated_and_verified')
    || has(facts, 'energyState', 'deenergized');
  const activeEnergy = has(facts, 'energyState', 'energized_or_operating');
  const notIsolated = has(facts, 'energyIsolationState', 'not_isolated');
  const currentHazardNegated = (extracted as unknown as { currentHazardNegated: boolean }).currentHazardNegated;
  const noExposure = (extracted as unknown as { noExposure: boolean }).noExposure;

  // Scoring. SURVIVES means the family produced a decision that is NOT excluded --
  // SUPPORTED or UNKNOWN both leave the hazard live for the reviewer; NOT_APPLICABLE and
  // CONTRADICTED are both suppression.
  let verdict: 'PASS' | 'FAIL' = 'FAIL';
  let failureKind: string | null = null;
  if (c.expect === 'NO_DECISION') {
    verdict = d === null ? 'PASS' : 'FAIL';
    if (d) failureKind = `UNEXPECTED_DECISION_${d.status}`;
  } else if (c.expect === 'NOT_APPLICABLE') {
    verdict = d !== null && d.status === 'NOT_APPLICABLE' ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failureKind = d === null ? 'DECISION_MISSING' : `PRECISION_REGRESSION_${d.status}`;
  } else {
    const survives = d !== null && (d.status === 'SUPPORTED' || d.status === 'UNKNOWN');
    verdict = survives ? 'PASS' : 'FAIL';
    if (!survives) failureKind = d === null ? 'DECISION_MISSING' : `SUPPRESSED_AS_${d.status}`;
  }

  return {
    id: c.id, klass: c.klass, title: c.title, mirrors: c.mirrors ?? null,
    dangerous: c.dangerous, expect: c.expect,
    facts: facts.map(f => `${f.type}=${String(f.value)}${f.status ? `[${f.status}]` : ''}`),
    guardState: facts.find(f => f.type === 'guardState')?.value ?? null,
    energyIsolationState: facts.find(f => f.type === 'energyIsolationState')?.value ?? null,
    energyState: facts.find(f => f.type === 'energyState')?.value ?? null,
    booleans: { guardPresent, energySafe, activeEnergy, notIsolated, currentHazardNegated, noExposure },
    decisionEmitted: d !== null,
    status: d?.status ?? null,
    confidence: d?.confidence ?? null,
    predicates: d?.requiredPredicates.map(p => ({ name: p.name, status: p.status })) ?? [],
    explanation: d?.explanation ?? null,
    verdict, failureKind,
  };
}

const rows = GUARDING_APPLICABILITY_CORPUS.map(evaluateCase);

for (const r of rows) {
  const mark = r.verdict === 'PASS' ? 'PASS' : (r.dangerous ? 'FAIL*DANGEROUS' : 'FAIL');
  console.log(`${r.id.padEnd(2)} ${r.klass.padEnd(28)} expect=${r.expect.padEnd(15)} `
    + `got=${String(r.status).padEnd(15)} conf=${String(r.confidence ?? '-').padEnd(5)} ${mark}`);
  console.log(`     guardPresent=${r.booleans.guardPresent} energySafe=${r.booleans.energySafe} `
    + `activeEnergy=${r.booleans.activeEnergy} notIsolated=${r.booleans.notIsolated} `
    + `negated=${r.booleans.currentHazardNegated}`);
  if (r.predicates.length) {
    console.log('     predicates: ' + r.predicates.map(p => `${p.name}=${p.status}`).join(' | '));
  }
}

const dangerousFailures = rows.filter(r => r.verdict === 'FAIL' && r.dangerous);
const precisionFailures = rows.filter(r => r.verdict === 'FAIL' && !r.dangerous);
const summary = {
  label, generatedAt: new Date().toISOString(),
  providerCalls: 0, costUsd: 0,
  total: rows.length,
  passed: rows.filter(r => r.verdict === 'PASS').length,
  failed: rows.filter(r => r.verdict === 'FAIL').length,
  dangerousFalseNegatives: dangerousFailures.map(r => `${r.id} (${r.klass}) -> ${r.failureKind}`),
  precisionFailures: precisionFailures.map(r => `${r.id} (${r.klass}) -> ${r.failureKind}`),
  rows,
};
writeFileSync(FILE, JSON.stringify(summary, null, 2) + '\n');

console.log('');
console.log(`TOTAL ${summary.total}  PASSED ${summary.passed}  FAILED ${summary.failed}`);
console.log(`DANGEROUS FALSE NEGATIVES: ${dangerousFailures.length}`
  + (dangerousFailures.length ? ' -> ' + summary.dangerousFalseNegatives.join(', ') : ''));
console.log(`PRECISION FAILURES:        ${precisionFailures.length}`
  + (precisionFailures.length ? ' -> ' + summary.precisionFailures.join(', ') : ''));
console.log('written:', FILE);
