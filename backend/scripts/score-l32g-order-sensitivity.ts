/**
 * L3-2g -- ORDER SENSITIVITY, MEASURED AGAINST A NOISE FLOOR. This is the answer to Question C.
 *
 * THE MEASUREMENT. For a pair of runs, count the scenarios whose OUTCOME differs. An outcome is the
 * pair (asserts ACTIVE, clarification owed) -- the two axes every gate in this programme is written
 * against -- evaluated at the tier the pair belongs to.
 *
 * WHY A NOISE FLOOR IS NOT OPTIONAL. `V_S_STRUCT` and `V_S_STRUCT_REPEAT` are byte-identical
 * prompts. Every scenario on which they differ is PROVIDER VARIANCE at temperature 0, and no
 * difference at or below that count may be read as an effect of ordering. §36.7's 97/97
 * reproducibility was measured on the OLD single-enum contract and does not transfer to a schema
 * carrying a new required object.
 *
 * WHY PERTURBATION SIZE IS CONTROLLED. §36.7 moved ONE block. `V_S_STRUCT_INV` reverses SIX. The
 * honest comparison against the ladder is `V_S_STRUCT_MOVE1`, which moves one. Both are reported,
 * and the one-block figure is the one that answers the question the ladder pair asks.
 *
 * Run: IN1=... IN2=... OUT=... npx ts-node scripts/score-l32g-order-sensitivity.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { resolveConditionState, type L3StateFacts } from '../src/safescope-v2/reasoning-l3/state-facts';

/** The winning ordering from `rederive-l32g-resolution.ts`: missing-fact arm consulted first. */
function resolveR1(facts: L3StateFacts) {
  const settledFirst = (facts.hazardExplicitlyDenied && !facts.hazardAsserted)
    || facts.disposition !== 'NONE'
    || (facts.framing === 'CONDITIONAL' && !facts.hazardAsserted);
  if (facts.decisionCriticalFactMissing && !settledFirst) {
    return { state: 'INSUFFICIENT_EVIDENCE' as const, clarificationOwed: true };
  }
  const r = resolveConditionState(facts);
  return { state: r.state, clarificationOwed: r.clarificationOwed };
}

interface Row {
  scenarioId: string; pole: string; variant: string;
  expectActive: boolean; expectClarification: boolean;
  modelAssertsActive: boolean; raisedClarification: boolean;
  derived: Array<{ facts?: L3StateFacts }> | null;
}

/** The outcome pair, at the tier the variant belongs to. */
function outcomeOf(r: Row, tier: 'MODEL' | 'DERIVED_R1'): string {
  if (tier === 'MODEL') return `${r.modelAssertsActive ? 'A' : '.'}${r.raisedClarification ? '?' : '-'}`;
  const facts = (r.derived || []).map(d => d.facts).filter(Boolean) as L3StateFacts[];
  if (!facts.length) return 'NONE';
  const res = facts.map(resolveR1);
  return `${res.some(x => x.state === 'ACTIVE') ? 'A' : '.'}${res.some(x => x.clarificationOwed) ? '?' : '-'}`;
}

function loadRows(paths: string[]): Row[] {
  const out: Row[] = [];
  for (const p of paths) out.push(...JSON.parse(readFileSync(p, 'utf8')).rows);
  return out;
}

function comparePair(rows: Row[], a: string, b: string, tier: 'MODEL' | 'DERIVED_R1') {
  const A = new Map(rows.filter(r => r.variant === a).map(r => [r.scenarioId, r]));
  const B = new Map(rows.filter(r => r.variant === b).map(r => [r.scenarioId, r]));
  const ids = [...A.keys()].filter(id => B.has(id));
  const differing: any[] = [];
  for (const id of ids) {
    const oa = outcomeOf(A.get(id)!, tier);
    const ob = outcomeOf(B.get(id)!, tier);
    if (oa !== ob) differing.push({ scenarioId: id, pole: A.get(id)!.pole, [a]: oa, [b]: ob });
  }
  return { pair: `${a} vs ${b}`, tier, scenarios: ids.length, differing: differing.length, rows: differing };
}

function main() {
  const paths = [process.env.IN1, process.env.IN2].filter(Boolean) as string[];
  const rows = loadRows(paths);

  const noise = comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_REPEAT', 'MODEL');
  const noiseDerived = comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_REPEAT', 'DERIVED_R1');

  const comparisons = [
    { ...comparePair(rows, 'V_B_LADDER', 'V_A_LADDER', 'MODEL'), manipulation: 'ONE_BLOCK_MOVED', family: 'LADDER' },
    { ...comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_MOVE1', 'MODEL'), manipulation: 'ONE_BLOCK_MOVED', family: 'STRUCTURAL_MODEL_LABEL' },
    { ...comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_MOVE1', 'DERIVED_R1'), manipulation: 'ONE_BLOCK_MOVED', family: 'STRUCTURAL_DERIVED' },
    { ...comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_INV', 'MODEL'), manipulation: 'SIX_BLOCKS_REVERSED', family: 'STRUCTURAL_MODEL_LABEL' },
    { ...comparePair(rows, 'V_S_STRUCT', 'V_S_STRUCT_INV', 'DERIVED_R1'), manipulation: 'SIX_BLOCKS_REVERSED', family: 'STRUCTURAL_DERIVED' },
  ];

  const out = {
    phase: 'L3-2g', role: 'ORDER_SENSITIVITY_AGAINST_MEASURED_NOISE_FLOOR',
    generatedAt: new Date().toISOString(),
    noiseFloor: {
      modelLabel: noise.differing, derivedR1: noiseDerived.differing,
      scenarios: noise.scenarios,
      rows: noise.rows, derivedRows: noiseDerived.rows,
      note: 'byte-identical prompts at temperature 0. Differences here are provider variance and '
        + 'are the floor below which no ordering difference may be read as an effect.',
    },
    comparisons,
    interpretation: comparisons.map(c => ({
      pair: c.pair, tier: c.tier, manipulation: c.manipulation, differing: c.differing,
      exceedsNoiseFloor: c.differing > (c.tier === 'MODEL' ? noise.differing : noiseDerived.differing),
    })),
  };

  const dest = process.env.OUT || 'order-sensitivity.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nNOISE FLOOR (identical prompts, T=0): model-label ${noise.differing}/${noise.scenarios}`
    + `, derived-R1 ${noiseDerived.differing}/${noiseDerived.scenarios}`);
  if (noise.rows.length) console.log('  model-label variance on: ' + noise.rows.map((r: any) => r.scenarioId).join(', '));
  if (noiseDerived.rows.length) console.log('  derived variance on:     ' + noiseDerived.rows.map((r: any) => r.scenarioId).join(', '));
  console.log('');
  console.log(pad('pair', 40) + pad('tier', 14) + pad('manipulation', 22) + pad('differ', 8) + 'above noise?');
  for (const c of out.interpretation) {
    console.log(pad(c.pair, 40) + pad(c.tier, 14) + pad(c.manipulation, 22)
      + pad(c.differing, 8) + (c.exceedsNoiseFloor ? 'YES' : 'no'));
  }
  console.log('');
  for (const c of comparisons) {
    if (c.rows.length) {
      console.log(`${c.pair} [${c.tier}] differs on:`);
      for (const r of c.rows) console.log('   ', JSON.stringify(r));
    }
  }
  console.log(`\nwrote ${dest}`);
}

main();
