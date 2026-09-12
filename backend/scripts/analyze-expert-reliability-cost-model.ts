/**
 * §155 EXPERT HAZLENZ -- COST AND LATENCY MODEL. ZERO PROVIDER CALLS.
 *
 * Every price used here is DERIVED FROM THE RECORDED RUNS, not looked up and not invented. §153 and
 * §154 issued the same sixteen prompts, so their input token counts are identical (292,688) and
 * only their output differs -- which makes the output price solvable exactly, and the input price
 * follows. The derivation is printed so a reader can check it rather than trust it.
 *
 * Anything that is NOT derivable is labelled ASSUMPTION in the output. There is exactly one: the
 * verifier's own token profile, because no verifier has ever run.
 */

import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const load = (dir: string) =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require(join(ROOT, 'verification', dir, 'RESULTS-SUMMARY.json')) as {
    accounting: { inputTokens: number; outputTokens: number; spendUsd: number };
  };

const R1 = load('expert-hazlenz-hardened-v13-baseline-2026-09-03').accounting;
const R2 = load('expert-hazlenz-hardened-v13-replicate2-2026-09-03').accounting;
const R3 = load('expert-hazlenz-hardened-v13-replicate3-2026-09-03').accounting;
const CALLS_PER_RUN = 16;

console.log('§155 EXPERT HAZLENZ — COST AND LATENCY MODEL');
console.log('='.repeat(100));

// ---- 1. PRICES, SOLVED FROM THE RECORDED RUNS.
console.log('\n--- 1. UNIT PRICES, DERIVED (not looked up)\n');
console.log(`  §153  in ${R2.inputTokens}  out ${R2.outputTokens}  $${R2.spendUsd.toFixed(6)}`);
console.log(`  §154  in ${R3.inputTokens}  out ${R3.outputTokens}  $${R3.spendUsd.toFixed(6)}`);
if (R2.inputTokens !== R3.inputTokens) {
  throw new Error('input tokens differ between the two runs; the derivation below assumes they do not');
}
const outPricePerM = ((R3.spendUsd - R2.spendUsd) / (R3.outputTokens - R2.outputTokens)) * 1e6;
const inPricePerM = ((R2.spendUsd - (R2.outputTokens * outPricePerM) / 1e6) / R2.inputTokens) * 1e6;
console.log(`\n  identical input tokens -> the cost delta is pure output:`);
console.log(`    ($${R3.spendUsd.toFixed(6)} - $${R2.spendUsd.toFixed(6)}) / `
  + `(${R3.outputTokens} - ${R2.outputTokens}) = $${outPricePerM.toFixed(3)} per 1M output`);
console.log(`    remainder over input                                     = `
  + `$${inPricePerM.toFixed(3)} per 1M input`);
const check = (R1.inputTokens * inPricePerM + R1.outputTokens * outPricePerM) / 1e6;
console.log(`  CHECK against §152, which was not used to derive them: predicted `
  + `$${check.toFixed(6)} vs recorded $${R1.spendUsd.toFixed(6)}  `
  + `(delta $${Math.abs(check - R1.spendUsd).toFixed(6)})`);

// ---- 2. OBSERVED PER-CALL FIGURES.
const avgIn = R3.inputTokens / CALLS_PER_RUN;
const avgOut = (R1.outputTokens + R2.outputTokens + R3.outputTokens) / (3 * CALLS_PER_RUN);
const avgCall = (R1.spendUsd + R2.spendUsd + R3.spendUsd) / (3 * CALLS_PER_RUN);
console.log('\n--- 2. OBSERVED PER-CALL, across the three hardened draws\n');
console.log(`  input tokens per call      ${avgIn.toFixed(0)}  (identical prompts, all three draws)`);
console.log(`  output tokens per call     ${avgOut.toFixed(0)}  (mean over 48 executions)`);
console.log(`  cost per first-pass call   $${avgCall.toFixed(5)}`);

// ---- 3. THE VERIFIER'S PROFILE. THE ONE ASSUMPTION IN THIS MODEL.
const verifierIn = avgIn + 600;
const verifierOut = 300;
const verifierCall = (verifierIn * inPricePerM + verifierOut * outPricePerM) / 1e6;
console.log('\n--- 3. VERIFIER CALL COST — ASSUMPTION, CLEARLY LABELLED\n');
console.log('  ASSUMPTION: a verifier call carries the same observation and governed evidence as the');
console.log('  first pass, PLUS the first-pass result (~600 tokens), and returns ONE verdict with a');
console.log('  one-sentence rationale and at most one proposed question (~300 output tokens). No');
console.log('  verifier has ever run, so this is an estimate and not a measurement.');
console.log(`  -> in ${verifierIn.toFixed(0)}  out ${verifierOut}  = $${verifierCall.toFixed(5)} per verifier call`);
console.log(`  Output is where a verifier is cheap: ${verifierOut} tokens against a first pass's `
  + `${avgOut.toFixed(0)}. Input dominates and is nearly unchanged, so a verifier costs roughly `
  + `${((verifierCall / avgCall) * 100).toFixed(0)}% of a first pass rather than a fraction of it.`);

// ---- 4. OBSERVED FREQUENCIES. DEVELOPMENT SAMPLE ONLY.
const DEGENERATE = 4 / 48;
const ESCALATION = 15 / 44;
console.log('\n--- 4. OBSERVED FREQUENCIES — DEVELOPMENT SAMPLE, NOT PRODUCTION RATES\n');
console.log(`  degenerate provider output   4 of 48 row-executions   (${(DEGENERATE * 100).toFixed(1)}%)`);
console.log(`  selective-verification fires 15 of 44 valid executions (${(ESCALATION * 100).toFixed(1)}%)`);
console.log('  Sixteen rows, three draws, one model, one prompt version. These are the only');
console.log('  frequencies that exist. THEY ARE NOT A PRODUCTION RATE and must not be quoted as one.');

// ---- 5. THE FIVE SCENARIOS, per 100 Expert analyses.
interface Scenario {
  key: string; label: string; extraCalls: number; extraCost: number; latency: string;
  worstCaseRequests: number;
}
const per100 = 100;
const baseCost = per100 * avgCall;
const degenerateExtra = per100 * DEGENERATE;
const verifierExtra = per100 * ESCALATION;

const scenarios: Scenario[] = [
  { key: 'A', label: 'no verification, no reissue',
    extraCalls: 0, extraCost: 0,
    latency: 'unchanged — one round trip, observed median 15.7s, max 38.2s',
    worstCaseRequests: 1 },
  { key: 'B', label: 'reissue on degenerate output only',
    extraCalls: degenerateExtra, extraCost: degenerateExtra * avgCall,
    latency: 'one extra round trip on ~8% of analyses; unaffected analyses unchanged',
    worstCaseRequests: 2 },
  { key: 'C', label: 'selective verification only',
    extraCalls: verifierExtra, extraCost: verifierExtra * verifierCall,
    latency: 'one extra round trip on ~34% of analyses; the verifier is output-light so its '
      + 'latency is shorter than a first pass but not negligible',
    worstCaseRequests: 2 },
  { key: 'D', label: 'both — reissue AND selective verification',
    extraCalls: degenerateExtra + verifierExtra,
    extraCost: degenerateExtra * avgCall + verifierExtra * verifierCall,
    latency: 'as B and C; the two are independent and never compound on the same analysis, '
      + 'because a degenerate response is never escalated to a verifier',
    worstCaseRequests: 3 },
  { key: 'E', label: 'universal two-pass verification',
    extraCalls: per100, extraCost: per100 * verifierCall,
    latency: 'one extra round trip on EVERY analysis — the only option that changes the latency '
      + 'profile of the product rather than of a subset',
    worstCaseRequests: 2 },
];

console.log('\n--- 5. PER 100 EXPERT ANALYSES\n');
console.log('  scenario                                extra calls    total $     vs baseline');
for (const s of scenarios) {
  const total = baseCost + s.extraCost;
  const pct = ((total / baseCost - 1) * 100);
  console.log(`  ${s.key}. ${s.label.padEnd(38)}${s.extraCalls.toFixed(1).padStart(6)}`
    + `      $${total.toFixed(2).padStart(6)}     ${pct === 0 ? 'baseline' : `+${pct.toFixed(1)}%`}`);
}
console.log(`\n  baseline (100 first-pass calls at $${avgCall.toFixed(5)}): $${baseCost.toFixed(2)}`);

console.log('\n--- 6. LATENCY AND BOUNDED-CALL BEHAVIOUR\n');
console.log('  observed first-pass latency, 48 executions: min 5.7s  median 15.7s  max 38.2s');
for (const s of scenarios) {
  console.log(`  ${s.key}. worst case ${s.worstCaseRequests} provider request(s) per analysis`);
  console.log(`     ${s.latency}`);
}
console.log('\n  THE BOUND IS STRUCTURAL, NOT BUDGETARY. Under D — the fullest design — one analysis');
console.log('  can issue at most three provider requests: a first pass, at most one reissue if and');
console.log('  only if the deterministic detector convicts it, and at most one verifier call. There');
console.log('  is no path that issues a fourth, and a degenerate response is never escalated to a');
console.log('  verifier, so the reissue and verification paths cannot compound.');

console.log('\nPROVIDER_CALLS_THIS_SCRIPT = 0');
