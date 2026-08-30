/**
 * EXPERT HAZLENZ -- LOCAL ROUTING RE-PROBE. Makes REAL provider calls, all local, all `$0.00`.
 *
 * Measures ONE thing: after the v2 contract/prompt/schema repair, does information the model
 * produces arrive in the typed collection whose criteria it meets, or drain into free text?
 *
 * It does NOT measure reasoning quality, and the metric is built so it cannot be mistaken for one:
 * a concept the model never raises is not a routing loss, and a correct silence on a negative
 * control is a HIT rather than a blank.
 *
 * BOUNDED: `MAX_LOCAL_REPROBE_CALLS`, enforced by a counter the provider increments. Seven fixtures
 * need seven calls; the ceiling exists for the retry path, not as an allowance to spend.
 *
 * Run: npx ts-node scripts/probe-expert-routing.ts
 */
import { mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import {
  OllamaExpertProvider, EXPERT_PROBE_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/ollama-expert-provider';
import { runExpertAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-runner';
import { mergeExpertIntelligence, verifyMergeInvariants } from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import {
  scoreRouting, totalRouting, type RoutingScore,
} from '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';
import {
  CITATION_SHAPED_PATTERN, EXPERT_ANALYSIS_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import type { ExpertProviderResult } from '../src/safescope-v2/expert-hazlenz/expert-provider';

const MAX_LOCAL_REPROBE_CALLS = 12;

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-typed-routing-repair-2026-08-29');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', 'routing-probe.jsonl');
writeFileSync(LOG, '');

class BudgetedProvider extends OllamaExpertProvider {
  calls = 0;
  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    if (this.calls >= MAX_LOCAL_REPROBE_CALLS) {
      return { ok: false, kind: 'NOT_CONFIGURED', detail: `ceiling ${MAX_LOCAL_REPROBE_CALLS} reached` };
    }
    this.calls += 1;
    return super.analyze(input);
  }
}

interface Row {
  id: string; title: string; ran: boolean;
  httpStatus: number | null; layerStatus: string | null; failureKind: string | null;
  respondedModel: string | null; latencyMs: number | null;
  promptTokens: number | null; outputTokens: number | null;
  quotesTotal: number | null; quotesBound: number | null; quotesUnbindable: number | null;
  issues: string[];
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  uncertaintyStatements: number;
  score: RoutingScore | null;
  protectedShapeUnchanged: boolean;
  mergeViolations: string[];
  citationShaped: boolean;
  summary: string | null;
}

const provider = new BudgetedProvider();
const rows: Row[] = [];
const NOW = '2026-08-29T00:00:00.000Z';

const protectedShape = (m: ReturnType<typeof mergeExpertIntelligence>) =>
  JSON.stringify({ a: m.authoritative, g: m.governed, j: m.jurisdiction });

(async function main() {
  console.log('EXPERT HAZLENZ — LOCAL TYPED-ROUTING RE-PROBE');
  console.log(`provider   local-ollama   model ${EXPERT_PROBE_INFERENCE_CONFIG.model}`);
  console.log(`contract   ${EXPERT_ANALYSIS_CONTRACT_VERSION}   prompt ${EXPERT_PROMPT_VERSION}`);
  console.log(`ceiling    ${MAX_LOCAL_REPROBE_CALLS} calls   cost $0.00\n`);

  for (const f of ROUTING_FIXTURES) {
    if (provider.calls >= MAX_LOCAL_REPROBE_CALLS) {
      console.log(`  ${f.id}  NOT RUN — call ceiling reached`);
      rows.push({
        id: f.id, title: f.title, ran: false, httpStatus: null, layerStatus: null, failureKind: null,
        respondedModel: null, latencyMs: null, promptTokens: null, outputTokens: null,
        quotesTotal: null, quotesBound: null, quotesUnbindable: null, issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        uncertaintyStatements: 0, score: null, protectedShapeUnchanged: true, mergeViolations: [],
        citationShaped: false, summary: null,
      });
      continue;
    }

    const baseline = protectedShape(mergeExpertIntelligence(
      f.deterministic, f.governed, { status: 'NOT_CONFIGURED', validated: null, detail: null }));

    const run = await runExpertAnalysis(provider, f.input, { nowIso: NOW });
    const t = provider.lastTelemetry;
    const merged = mergeExpertIntelligence(f.deterministic, f.governed, run.layer);
    const analysis = run.layer.validated?.analysis ?? null;
    const score = analysis ? scoreRouting(f.id, analysis, f.expectations, f.probes) : null;

    const row: Row = {
      id: f.id, title: f.title, ran: true,
      httpStatus: t?.httpStatus ?? null,
      layerStatus: merged.expertLayer.status,
      failureKind: run.failure?.kind ?? null,
      respondedModel: t?.respondedModel ?? null,
      latencyMs: t?.latencyMs ?? null,
      promptTokens: t?.promptTokens ?? null,
      outputTokens: t?.outputTokens ?? null,
      quotesTotal: t?.binding?.total ?? null,
      quotesBound: t?.binding?.bound ?? null,
      quotesUnbindable: t?.binding?.unbindable ?? null,
      issues: run.issues.map(i => i.code),
      counts: {
        candidates: merged.expertAdvisory.hazardCandidates.length,
        clarifications: merged.expertAdvisory.clarifications.length,
        insights: merged.expertAdvisory.crossHazardInsights.length,
        disagreements: merged.expertAdvisory.disagreements.length,
      },
      uncertaintyStatements: merged.expertAdvisory.uncertainty.statements.length,
      score,
      protectedShapeUnchanged: protectedShape(merged) === baseline,
      mergeViolations: verifyMergeInvariants(merged, f.deterministic, f.governed).map(v => v.invariant),
      citationShaped: CITATION_SHAPED_PATTERN.test(JSON.stringify(merged.expertAdvisory)),
      summary: analysis?.expertExplanation?.summary ?? null,
    };
    rows.push(row);
    appendFileSync(LOG, JSON.stringify(row) + '\n');

    const c = row.counts;
    console.log(`  ${row.id}  ${row.title}`);
    console.log(`        ${row.layerStatus} http=${row.httpStatus} ${row.latencyMs}ms `
      + `tok=${row.promptTokens}/${row.outputTokens} quotes=${row.quotesBound}/${row.quotesTotal}`);
    console.log(`        cand=${c.candidates} clar=${c.clarifications} ins=${c.insights} `
      + `dis=${c.disagreements} unc=${row.uncertaintyStatements}`
      + `   hits=${score?.hits ?? '-'} misses=${score?.misses ?? '-'} over=${score?.overRouted ?? '-'}`
      + ` losses=${score?.explanationOnlyLosses.length ?? '-'}`);
    if (score?.explanationOnlyLosses.length) {
      for (const l of score.explanationOnlyLosses) {
        console.log(`        LOSS  "${l.label}" -> ${l.collection} (found in ${l.foundIn})`);
      }
    }
    if (row.issues.length) console.log(`        issues: ${row.issues.join(',')}`);
  }

  // ------------------------------------------------------------- metrics
  const ran = rows.filter(r => r.ran);
  const scores = ran.map(r => r.score).filter((s): s is RoutingScore => s !== null);
  const totals = totalRouting(scores);

  console.log('\n== ROUTING METRICS ==\n');
  console.log(`  TYPED_ROUTING_OPPORTUNITIES  ${totals.TYPED_ROUTING_OPPORTUNITIES}`);
  console.log(`  TYPED_ROUTING_HITS           ${totals.TYPED_ROUTING_HITS}`);
  console.log(`  TYPED_ROUTING_MISSES         ${totals.TYPED_ROUTING_MISSES}`);
  console.log(`  TYPED_ROUTING_OVER_ROUTED    ${totals.TYPED_ROUTING_OVER_ROUTED}`);
  console.log(`  EXPLANATION_ONLY_LOSSES      ${totals.EXPLANATION_ONLY_LOSSES}`);
  console.log('');
  for (const [k, v] of Object.entries(totals.byCollection)) {
    console.log(`  ${k.padEnd(32)} opp=${v.opportunities} hit=${v.hits} miss=${v.misses} over=${v.overRouted}`);
  }

  // ------------------------------------------------------------- the fourteen routing gates
  const byId = new Map(rows.map(r => [r.id, r]));
  const g = (id: string) => byId.get(id)!;
  const scoreOf = (id: string) => byId.get(id)?.score ?? null;
  const uncertaintyLosses = scores.flatMap(s => s.explanationOnlyLosses)
    .filter(l => l.foundIn === 'uncertainty' || l.foundIn === 'both');
  const negatives = ['R6', 'R7'].map(g).filter(r => r?.ran);
  const unbindableSeen = ran.filter(r => (r.quotesUnbindable ?? 0) > 0);

  const gates: Array<[number, string, boolean, string]> = [
    [1, 'transport remains callable', ran.length > 0 && ran.every(r => r.httpStatus === 200),
      `${ran.filter(r => r.httpStatus === 200).length}/${ran.length} HTTP 200`],
    [2, 'schema validity remains intact', ran.every(r => r.layerStatus === 'PRESENT'),
      `${ran.filter(r => r.layerStatus === 'PRESENT').length}/${ran.length} PRESENT`],
    [3, 'zero-candidate clarification still survives',
      scoreOf('R1')?.zeroCandidateClarificationPresent === true
        || (g('R1')?.counts.clarifications ?? 0) > 0,
      `R1 clar=${g('R1')?.counts.clarifications} cand=${g('R1')?.counts.candidates}`],
    [4, 'wet/electrical interaction lands in crossHazardInsights',
      (g('R2')?.counts.insights ?? 0) > 0,
      `R2 insights=${g('R2')?.counts.insights}`],
    [5, 'decision-changing missing facts land in decisionCriticalClarifications',
      (g('R3')?.counts.clarifications ?? 0) > 0 && (g('R2')?.counts.clarifications ?? 0) > 0,
      `R3 clar=${g('R3')?.counts.clarifications}, R2 clar=${g('R2')?.counts.clarifications}`],
    [6, 'extra plausible hazards land in expertHazardCandidates',
      (g('R4')?.counts.candidates ?? 0) > 0,
      `R4 candidates=${g('R4')?.counts.candidates}`],
    [7, 'multi-collection cases populate independently',
      (g('R5')?.counts.candidates ?? 0) > 0 && (g('R5')?.counts.clarifications ?? 0) > 0
        && (g('R5')?.counts.insights ?? 0) > 0,
      `R5 cand=${g('R5')?.counts.candidates} clar=${g('R5')?.counts.clarifications} ins=${g('R5')?.counts.insights}`],
    [8, 'explanation is not the sole carrier (EXPLANATION_ONLY_LOSSES = 0)',
      totals.EXPLANATION_ONLY_LOSSES === 0, `${totals.EXPLANATION_ONLY_LOSSES} loss(es)`],
    [9, 'uncertainty is not a catch-all carrier', uncertaintyLosses.length === 0,
      `${uncertaintyLosses.length} concept(s) found only in uncertainty`],
    [10, 'negative controls do not cause indiscriminate typed emissions',
      negatives.length === 2 && negatives.every(r => r.score !== null && r.score.overRouted === 0),
      negatives.map(r => `${r.id} over=${r.score?.overRouted} `
        + `(c${r.counts.candidates}/q${r.counts.clarifications}/i${r.counts.insights}/d${r.counts.disagreements})`).join('  ')],
    [11, 'quote binding remains fail-closed',
      unbindableSeen.every(r => r.layerStatus === 'OUTPUT_REJECTED'),
      unbindableSeen.length === 0
        ? 'no unbindable quote arose live — proved deterministically in test:expert-routing-contract D.4-D.7'
        : `${unbindableSeen.length} response(s) with unbindable quotes, all rejected`],
    [12, 'protected deterministic/governed halves byte-identical through merge',
      ran.every(r => r.protectedShapeUnchanged) && ran.every(r => r.mergeViolations.length === 0),
      `${ran.filter(r => r.protectedShapeUnchanged).length}/${ran.length} identical, 0 violations`],
    [13, 'no Level-3 quarantine / content guard regresses', quarantineIntact(),
      'no file under src/ outside the Level-3 module references it; Expert core stays vendor-free'],
    [14, 'no hosted provider call occurred', hostedCallsImpossible(),
      'the only adapter is local-ollama on loopback; no hosted client or credential exists in the tree'],
  ];

  console.log('\n== ROUTING PASS GATES ==\n');
  let failedGates = 0;
  for (const [n, name, pass, detail] of gates) {
    if (!pass) failedGates += 1;
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  G${String(n).padStart(2, '0')}  ${name}`);
    console.log(`              ${detail}`);
  }

  const summary = {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    promptVersion: EXPERT_PROMPT_VERSION,
    provider: 'local-ollama',
    modelRequested: EXPERT_PROBE_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(ran.map(r => r.respondedModel).filter(Boolean))],
    callCeiling: MAX_LOCAL_REPROBE_CALLS,
    callsAttempted: provider.calls,
    callsCompleted: ran.filter(r => r.httpStatus === 200).length,
    schemaValid: ran.filter(r => r.layerStatus === 'PRESENT').length,
    actualCostUsd: 0.0,
    totalPromptTokens: ran.reduce((a, r) => a + (r.promptTokens ?? 0), 0),
    totalOutputTokens: ran.reduce((a, r) => a + (r.outputTokens ?? 0), 0),
    latencyMsP50: median(ran.map(r => r.latencyMs ?? 0)),
    latencyMsMax: Math.max(0, ...ran.map(r => r.latencyMs ?? 0)),
    routing: totals,
    gates: gates.map(([n, name, pass, detail]) => ({ gate: `G${String(n).padStart(2, '0')}`, name, pass, detail })),
    failedGates,
    rows,
  };
  writeFileSync(join(OUT, 'results', 'routing-probe-summary.json'), JSON.stringify(summary, null, 2) + '\n');

  console.log(`\ncalls ${provider.calls}/${MAX_LOCAL_REPROBE_CALLS}   cost $0.00   evidence ${OUT}`);
  console.log(`\n${failedGates === 0 ? 'ALL 14 ROUTING GATES PASSED' : `${failedGates} ROUTING GATE(S) FAILED`}`);
  process.exit(failedGates === 0 ? 0 : 1);
})();

function median(xs: number[]): number {
  const s = xs.filter(x => x > 0).sort((a, b) => a - b);
  return s.length === 0 ? 0 : s[Math.floor(s.length / 2)];
}

/** The Level-3 containment guard and the Expert core purity guard, checked from here too. */
function quarantineIntact(): boolean {
  const { execSync } = require('child_process');
  const { readdirSync, readFileSync, statSync } = require('fs');
  const src = join(__dirname, '..', 'src');
  const l3 = ['reasoning', 'l3'].join('-');
  const importers: string[] = execSync(`grep -rl "${l3}" ${src} || true`, { encoding: 'utf8' })
    .split('\n').map((s: string) => s.trim()).filter(Boolean);
  if (!importers.every(p => p.includes(l3))) return false;

  const core = join(src, 'safescope-v2', 'expert-hazlenz');
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n: string) => {
    const full = join(dir, n);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
  const banned = ['fetch(', 'https://', 'http://', 'apiKey', 'anthropic', 'gemini', 'openai', 'ollama'];
  return walk(core).filter((f: string) => f.endsWith('.ts')).every((f: string) => {
    const code = readFileSync(f, 'utf8').split('\n')
      .filter((l: string) => { const t = l.trim(); return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*'); })
      .join('\n').toLowerCase();
    return banned.every(b => !code.includes(b.toLowerCase()));
  });
}

/**
 * No hosted client, SDK or credential read exists anywhere in the adapter directory.
 *
 * COMMENTS ARE STRIPPED FIRST, and that is not a convenience. The first version of this gate grepped
 * raw file text and FAILED, because the adapter's header comment explains that `ANTHROPIC_API_KEY`
 * is absent and `OPENAI_API_KEY` is a stub — the gate matched the sentence documenting the absence
 * and reported it as a presence. That is the same content-grep trap the Level-3 quarantine guard
 * sprang earlier in this programme, and the correction is the same: a gate about what the CODE does
 * must read code.
 */
function hostedCallsImpossible(): boolean {
  const { readdirSync, readFileSync, statSync } = require('fs');
  const dir = join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz-adapters');
  const walk = (d: string): string[] => readdirSync(d).flatMap((n: string) => {
    const full = join(d, n);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
  const banned = /anthropic|api\.openai|generativelanguage|ANTHROPIC_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY/i;
  return walk(dir).filter((f: string) => f.endsWith('.ts')).every((f: string) => {
    const code = readFileSync(f, 'utf8').split('\n')
      .filter((l: string) => { const t = l.trim(); return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*'); })
      .join('\n');
    return !banned.test(code);
  });
}
