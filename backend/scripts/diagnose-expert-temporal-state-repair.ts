/**
 * EXPERT HAZLENZ -- TEMPORAL-STATE REPAIR: LOCAL BASELINE/POST-REPAIR INSTRUMENT (2026-08-30).
 *
 * ZERO HOSTED CALLS. Runs the R6 hosted negative-control repair's contrastive corpus
 * (`TEMPORAL_STATE_FIXTURES`, T1-T6) plus the protected frozen fixtures this repair must not
 * damage (`R4`, `R5`/HG11, `R6`/HG12, `R7`) against the LOCAL provider (qwen3-coder:30b via
 * Ollama), $0.00, no network beyond localhost.
 *
 * Run TWICE, once before the prompt edit and once after, with a distinct `--label`, so the two
 * runs land in SEPARATE result files rather than one overwriting the other (the §106/D-118
 * lesson: a fixed, non-run-scoped output path silently destroyed a prior run's evidence once
 * already in this programme).
 *
 *   npx ts-node scripts/diagnose-expert-temporal-state-repair.ts --label=baseline
 *   npx ts-node scripts/diagnose-expert-temporal-state-repair.ts --label=post-repair
 */

import { mkdirSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  OllamaExpertProvider, EXPERT_PROBE_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/ollama-expert-provider';
import { normalizeExpertOutput } from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import { TEMPORAL_STATE_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/temporal-state-fixtures';
import {
  scoreRouting, totalRouting, type RoutingScore,
} from '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';
import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const label = (process.argv.find(a => a.startsWith('--label=')) ?? '--label=unlabeled').split('=')[1];
const REPEATS = Number(process.env.DIAG_REPEATS || 5);
const NOW = '2026-08-30T00:00:00.000Z';

const OUT = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-temporal-state-repair-2026-08-30');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', `${label}.jsonl`);
if (existsSync(LOG)) {
  throw new Error(`refusing to overwrite existing evidence at ${LOG} -- choose a new --label`);
}
writeFileSync(LOG, '');

interface FixtureCase {
  id: string;
  input: ExpertAnalysisInput;
  expectations: import('../src/safescope-v2/expert-hazlenz/expert-routing-metrics').RoutingExpectations;
  probes: readonly import('../src/safescope-v2/expert-hazlenz/expert-routing-metrics').ConceptProbe[];
}

const PROTECTED: FixtureCase[] = ['R4', 'R5', 'R6', 'R7'].map(id => {
  const f = ROUTING_FIXTURES.find(x => x.id === id)!;
  return { id: f.id, input: f.input, expectations: f.expectations, probes: f.probes };
});
const CONTRASTIVE: FixtureCase[] = TEMPORAL_STATE_FIXTURES.map(f => ({
  id: f.id, input: f.input, expectations: f.expectations, probes: [],
}));

interface Row {
  fixtureId: string;
  rep: number;
  seed: number;
  ok: boolean;
  failureKind: string | null;
  outcome: unknown;
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  score: RoutingScore | null;
  candidateSummaries: string[];
  clarificationSummaries: string[];
}

async function runOnce(fixtureInput: ExpertAnalysisInput, seed: number) {
  const provider = new OllamaExpertProvider({ ...EXPERT_PROBE_INFERENCE_CONFIG, seed });
  const result = await provider.analyze(fixtureInput);
  if (!result.ok) return { ok: false as const, failureKind: result.kind };
  const normalized = normalizeExpertOutput(result.raw, fixtureInput, NOW);
  return { ok: true as const, raw: result.raw as Record<string, unknown>, normalized };
}

(async function main() {
  console.log(`EXPERT HAZLENZ -- TEMPORAL-STATE REPAIR INSTRUMENT  label=${label}  repeats=${REPEATS}\n`);

  const allRows: Row[] = [];
  const allScores: RoutingScore[] = [];

  for (const fc of [...PROTECTED, ...CONTRASTIVE]) {
    console.log(`\n== ${fc.id} ==`);
    for (let i = 0; i < REPEATS; i++) {
      const seed = EXPERT_PROBE_INFERENCE_CONFIG.seed + i;
      const r = await runOnce(fc.input, seed);
      if (!r.ok) {
        console.log(`  rep ${i} seed=${seed}  PROVIDER_FAILED  ${r.failureKind}`);
        const row: Row = {
          fixtureId: fc.id, rep: i, seed, ok: false, failureKind: r.failureKind, outcome: null,
          counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
          score: null, candidateSummaries: [], clarificationSummaries: [],
        };
        allRows.push(row);
        appendFileSync(LOG, JSON.stringify(row) + '\n');
        continue;
      }
      const raw = r.raw;
      const analysis = r.normalized.state === 'VALID' ? r.normalized.validated!.analysis : null;
      const cand = analysis?.expertHazardCandidates ?? [];
      const clar = analysis?.decisionCriticalClarifications ?? [];
      const ins = analysis?.crossHazardInsights ?? [];
      const dis = analysis?.disagreements ?? [];

      let score: RoutingScore | null = null;
      if (analysis) {
        score = scoreRouting(fc.id, analysis, fc.expectations, fc.probes);
        allScores.push(score);
      }

      const row: Row = {
        fixtureId: fc.id, rep: i, seed, ok: true, failureKind: null, outcome: raw.outcome,
        counts: { candidates: cand.length, clarifications: clar.length, insights: ins.length, disagreements: dis.length },
        score,
        candidateSummaries: cand.map(c => `${c.hazardFamily}: ${c.reasoning}`),
        clarificationSummaries: clar.map(c => `${c.question} (${c.evidenceGap})`),
      };
      allRows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      const overRouted = score ? score.overRouted : 'n/a';
      console.log(`  rep ${i} seed=${seed}  c=${row.counts.candidates} q=${row.counts.clarifications} `
        + `i=${row.counts.insights} d=${row.counts.disagreements}  overRouted=${overRouted}  outcome=${row.outcome}`);
      row.candidateSummaries.forEach(s => console.log(`        CANDIDATE  ${s}`));
      row.clarificationSummaries.forEach(s => console.log(`        CLARIFY    ${s}`));
    }
  }

  const totals = totalRouting(allScores);
  console.log('\n== TOTALS ==');
  console.log(JSON.stringify(totals, null, 2));

  const byFixture: Record<string, { cleanReps: number; totalReps: number; overRoutedItems: number }> = {};
  for (const fc of [...PROTECTED, ...CONTRASTIVE]) {
    const rows = allRows.filter(r => r.fixtureId === fc.id && r.ok);
    const overRoutedItems = rows.reduce((a, r) => a + (r.score?.overRouted ?? 0), 0);
    byFixture[fc.id] = {
      cleanReps: rows.filter(r => (r.score?.overRouted ?? 0) === 0).length,
      totalReps: rows.length,
      overRoutedItems,
    };
  }
  console.log('\n== BY FIXTURE (over-routing only) ==');
  console.log(JSON.stringify(byFixture, null, 2));

  writeFileSync(join(OUT, 'results', `${label}-summary.json`), JSON.stringify({
    label, repeats: REPEATS, provider: 'local-ollama', model: EXPERT_PROBE_INFERENCE_CONFIG.model,
    costUsd: 0, hostedCalls: 0,
    totals, byFixture, rows: allRows,
  }, null, 2) + '\n');

  console.log(`\nevidence written to ${OUT} (label=${label})`);
})();
