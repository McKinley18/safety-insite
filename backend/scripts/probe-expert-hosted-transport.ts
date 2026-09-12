/**
 * EXPERT HAZLENZ -- the HOSTED transport probe (Anthropic / claude-sonnet-5).
 *
 * ==================== WHAT THIS MEASURES, AND WHAT IT DOES NOT ====================
 *
 * It measures whether a PRODUCTION-CLASS HOSTED MODEL can carry the repaired provider-neutral
 * contract: callability, model identity, structured parsing, normalization, the validation
 * boundary, typed routing, the negative control, merge invariance, tokens, latency, bounded cost,
 * and — newly first-class this phase — EVIDENCE GROUNDING.
 *
 * It does NOT measure safety quality, Expert precision or recall, regulatory correctness, provider
 * validation, production selection or customer readiness. A PASS authorizes exactly one thing:
 * ASKING the product owner whether to spend the seventeen-measure evaluation cohort.
 * `EXPERT_HAZLENZ_PROVIDER_VALIDATED` and `EXPERT_HAZLENZ_CUSTOMER_ACTIVE` stay FALSE either way.
 *
 * ==================== WHY THIS IS A SEPARATE SCRIPT ====================
 *
 * `probe:expert-routing` and `probe:expert-transport` are ACCEPTED §101 evidence and they are
 * hard-wired to the local provider. Editing them to switch providers would mutate an accepted
 * artifact and would destroy the ability to re-run the local baseline unchanged. This script is
 * additive; those two are untouched.
 *
 * ==================== SPEND ====================
 *
 * Hard ceilings, enforced BEFORE each request rather than checked afterwards: 8 calls and $3.00.
 * The pre-flight bound is computed from the configured `max_tokens` and the published rates, so a
 * call is refused unless its WORST CASE still fits under the cap. Seven fixtures are planned, which
 * leaves headroom deliberately — the brief says not to consume calls merely to reach eight.
 *
 * Run: npx ts-node scripts/probe-expert-hosted-transport.ts
 */
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG, EXPERT_TOOL_NAME,
  buildAnthropicRequestBody, type HostedExpertTelemetry,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { runExpertAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-runner';
import { mergeExpertIntelligence, verifyMergeInvariants } from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import { GROUNDING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/grounding-fixtures';
import { scoreRouting, totalRouting, type RoutingScore } from '../src/safescope-v2/expert-hazlenz/expert-routing-metrics';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import type { ExpertProviderResult } from '../src/safescope-v2/expert-hazlenz/expert-provider';

const MAX_HOSTED_CALLS = 8;
const MAX_HOSTED_COST_USD = 3.00;

/**
 * Minimal `.env` reader — six lines instead of a dependency, and it keeps credential handling
 * auditable in one visible place. `dotenv` resolves here only transitively, which is not something
 * a credential path should rest on. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED.
 */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const key = s.slice(0, s.indexOf('=')).trim().replace(/^export\s+/, '');
    const value = s.slice(s.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(join(__dirname, '..', '.env'));

// TOOLING FIX, dated 2026-08-30, unrelated to Expert HazLenz contract/prompt/schema behaviour.
// This path was a FIXED, date-stamped directory from the run that first created it. A second run
// on a later date -- exactly what happened during the v4 re-probe -- wrote into the SAME directory
// and silently overwrote the first run's `results/hosted-probe-summary.json` and
// `transport/hosted-probe.jsonl`, destroying the only raw copy of that earlier evidence. Prior
// figures survived only because they had already been transcribed into the blueprint and state
// JSON; the primary artifact did not. This must not be possible for a paid, non-repeatable probe.
//
// The fix: if a PRIOR summary already exists at the base directory, this run is diverted to a
// SIBLING directory suffixed with its own start time instead of overwriting it. A first run at a
// clean path is completely unaffected -- it still writes to the base directory, so nothing about
// where evidence normally lands has changed.
const BASE_OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-hosted-transport-probe-2026-08-29');
const PRIOR_SUMMARY_EXISTS = existsSync(join(BASE_OUT, 'results', 'hosted-probe-summary.json'));
const OUT = PRIOR_SUMMARY_EXISTS
  ? `${BASE_OUT}-rerun-${new Date().toISOString().replace(/[:.]/g, '-')}`
  : BASE_OUT;
if (PRIOR_SUMMARY_EXISTS) {
  console.log(`NOTE: prior evidence exists at ${BASE_OUT} — this run writes to ${OUT} instead, so it is never overwritten.`);
}
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', 'hosted-probe.jsonl');
writeFileSync(LOG, '');

// ---------------------------------------------------------------- fixture plan (H1..H8)

interface Plan {
  hostedCase: string;
  fixture: (typeof ROUTING_FIXTURES)[number] | (typeof GROUNDING_FIXTURES)[number];
  /** Present only on the two grounding fixtures. */
  anchor?: string;
}

const byId = <T extends { id: string }>(list: readonly T[], id: string): T => {
  const f = list.find(x => x.id === id);
  if (!f) throw new Error(`fixture ${id} not found`);
  return f;
};

/**
 * Seven calls, not eight. H1 and H2 are covered by ONE fixture because R1's zero-candidate
 * clarification case also exercises callability, parsing, normalization and validation — which is
 * the whole of H1. Combining them is explicitly allowed and it buys a spare call.
 */
const PLAN: Plan[] = [
  { hostedCase: 'H1+H2 basic structure + zero-candidate clarification', fixture: byId(ROUTING_FIXTURES, 'R1') },
  { hostedCase: 'H3 cross-hazard', fixture: byId(ROUTING_FIXTURES, 'R2') },
  { hostedCase: 'H4 additional plausible hazard', fixture: byId(ROUTING_FIXTURES, 'R4') },
  { hostedCase: 'H5 multi-collection', fixture: byId(ROUTING_FIXTURES, 'R5') },
  { hostedCase: 'H6 negative control', fixture: byId(ROUTING_FIXTURES, 'R6') },
  { hostedCase: 'H7 exact evidence grounding', fixture: byId(GROUNDING_FIXTURES, 'H7'), anchor: byId(GROUNDING_FIXTURES, 'H7').anchor },
  { hostedCase: 'H8 second grounding control', fixture: byId(GROUNDING_FIXTURES, 'H8'), anchor: byId(GROUNDING_FIXTURES, 'H8').anchor },
];

// ---------------------------------------------------------------- spend ceiling

const WORST_INPUT_TOKENS = 5000;   // measured worst fixture is ~4,136 at 3 chars/token
const perCallWorstUsd =
  (WORST_INPUT_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
  + (EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;

class BudgetedProvider extends AnthropicExpertProvider {
  calls = 0;
  spentUsd = 0;
  stopped: string | null = null;

  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    if (this.calls >= MAX_HOSTED_CALLS) {
      this.stopped = `call ceiling ${MAX_HOSTED_CALLS} reached`;
      return { ok: false, kind: 'NOT_CONFIGURED', detail: this.stopped };
    }
    // Refuse unless the WORST CASE of this call still fits. Checking afterwards would be checking
    // after the money is gone.
    if (this.spentUsd + perCallWorstUsd > MAX_HOSTED_COST_USD) {
      this.stopped = `cost ceiling $${MAX_HOSTED_COST_USD.toFixed(2)} would be exceeded`;
      return { ok: false, kind: 'NOT_CONFIGURED', detail: this.stopped };
    }
    this.calls += 1;
    const result = await super.analyze(input);
    this.spentUsd += this.lastTelemetry?.computedCostUsd ?? 0;
    return result;
  }
}

// ---------------------------------------------------------------- grounding measurement

interface GroundingRow {
  fixtureId: string;
  isGroundingFixture: boolean;
  opportunities: number;
  emitted: number;
  exactlyBound: number;
  unbindable: number;
  fabricated: number;
  supportsClaim: boolean | null;
  groundedObjects: number;
  ungroundedObjects: number;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * UNBINDABLE and FABRICATED are deliberately different measurements, and collapsing them would
 * hide the one that matters.
 *
 *   UNBINDABLE  -- the quote is not found verbatim in the source it named. A paraphrase, a
 *                  whitespace slip and an invention all land here first.
 *   FABRICATED  -- a STRICT SUBSET: not present in ANY supplied source even after aggressive
 *                  normalization (case, punctuation, whitespace). That is invented text, not a
 *                  copying error.
 *
 * Both are recorded. Neither is converted into "no evidence", and nothing is discarded — the
 * unbindable quote is already bound to `[-1,-1)` by the adapter and refused by the core validator,
 * exactly as designed.
 */
function measureGrounding(
  fixtureId: string, isGroundingFixture: boolean, analysis: any,
  telemetry: HostedExpertTelemetry | null, input: ExpertAnalysisInput, anchor?: string,
): GroundingRow {
  const sources = input.authoritativeSources;
  const normalizedSources = sources.map(s => normalize(s.text));
  const candidates: any[] = analysis?.expertHazardCandidates ?? [];

  let emitted = 0, exactlyBound = 0, unbindable = 0, fabricated = 0;
  let groundedObjects = 0, ungroundedObjects = 0;
  let supportsClaim: boolean | null = anchor ? false : null;

  for (const c of candidates) {
    const refs: any[] = Array.isArray(c?.evidence) ? c.evidence : [];
    let boundOnThisObject = 0;
    for (const ref of refs) {
      emitted += 1;
      const quoted = typeof ref?.quotedText === 'string' ? ref.quotedText : '';
      const bound = typeof ref?.startOffset === 'number' && ref.startOffset >= 0;
      if (bound) {
        exactlyBound += 1;
        boundOnThisObject += 1;
        // Does the exact quote actually SUPPORT the claim the fixture set up? An exact quote of an
        // irrelevant span is exact and useless, and the probe must be able to tell them apart.
        if (anchor && (quoted.includes(anchor) || anchor.includes(quoted)) && quoted.length >= 12) {
          supportsClaim = true;
        }
      } else {
        unbindable += 1;
        const n = normalize(quoted);
        if (n.length > 0 && !normalizedSources.some(s => s.includes(n))) fabricated += 1;
      }
    }
    if (boundOnThisObject > 0) groundedObjects += 1; else ungroundedObjects += 1;
  }

  // A grounding fixture creates exactly one evidence OPPORTUNITY: it hands the model a short exact
  // phrase that supports a candidate. Routing fixtures create none — evidence is optional there and
  // counting them would inflate the denominator with cases never designed to be groundable.
  const opportunities = isGroundingFixture ? 1 : 0;

  return {
    fixtureId, isGroundingFixture, opportunities, emitted, exactlyBound, unbindable, fabricated,
    supportsClaim, groundedObjects, ungroundedObjects,
  };
}

// ---------------------------------------------------------------- confinement (gate 18)

function customerPathUntouched(): boolean {
  const roots = [join(__dirname, '..', 'src'), join(__dirname, '..', '..', 'frontend-next')];
  const walk = (d: string): string[] => {
    if (!existsSync(d)) return [];
    return readdirSync(d).flatMap((n: string) => {
      if (n === 'node_modules' || n === '.next' || n.startsWith('.next-')) return [];
      const full = join(d, n);
      try { return statSync(full).isDirectory() ? walk(full) : [full]; } catch { return []; }
    });
  };
  const offenders = walk(roots[0]).concat(walk(roots[1]))
    .filter(f => /\.(ts|tsx)$/.test(f))
    .filter(f => !f.includes('expert-hazlenz'))
    .filter(f => readFileSync(f, 'utf8').includes('expert-hazlenz'));
  return offenders.length === 0;
}

// ---------------------------------------------------------------- run

interface Row {
  hostedCase: string; id: string; title: string; ran: boolean;
  httpStatus: number | null; failureKind: string | null; layerStatus: string | null;
  respondedModel: string | null; stopReason: string | null; requestId: string | null;
  latencyMs: number | null; promptTokens: number | null; outputTokens: number | null;
  cacheReadTokens: number | null; costUsd: number | null;
  issues: string[];
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  score: RoutingScore | null;
  protectedShapeUnchanged: boolean;
  mergeViolations: string[];
  grounding: GroundingRow | null;
}

const provider = new BudgetedProvider();
const rows: Row[] = [];
const NOW = '2026-08-29T00:00:00.000Z';
const protectedShape = (m: ReturnType<typeof mergeExpertIntelligence>) =>
  JSON.stringify({ a: m.authoritative, g: m.governed, j: m.jurisdiction });

(async function main() {
  console.log('EXPERT HAZLENZ — HOSTED TRANSPORT PROBE');
  console.log(`provider   anthropic   model ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
  console.log(`contract   ${EXPERT_ANALYSIS_CONTRACT_VERSION}   prompt ${EXPERT_PROMPT_VERSION}`);
  console.log(`thinking   ${EXPERT_HOSTED_INFERENCE_CONFIG.thinking}   max_tokens ${EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens}`);
  console.log(`ceiling    ${MAX_HOSTED_CALLS} calls   $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  console.log(`worst/call $${perCallWorstUsd.toFixed(4)}   worst total $${(perCallWorstUsd * PLAN.length).toFixed(4)}`);
  console.log(`planned    ${PLAN.length} calls\n`);

  // PRE-FLIGHT, before any spend. A typo in an answer key must never be readable as a model failure.
  for (const g of GROUNDING_FIXTURES) {
    const present = g.input.authoritativeSources.some(s => s.text.includes(g.anchor));
    if (!present) {
      console.error(`FATAL: ${g.id} anchor is not verbatim in its own observation. Refusing to spend.`);
      process.exit(2);
    }
  }
  console.log('pre-flight  both grounding anchors verified verbatim in their sources\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('BLOCKED — ANTHROPIC_API_KEY is not reachable. No call attempted, $0.00 spent.');
    console.error('Terminal: EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_BLOCKED — VALID_HOSTED_PROVIDER_CREDENTIAL_REQUIRED');
    process.exit(3);
  }

  for (const plan of PLAN) {
    const f = plan.fixture;
    const isGrounding = plan.anchor !== undefined;

    if (provider.stopped) {
      console.log(`  ${f.id}  NOT RUN — ${provider.stopped}`);
      continue;
    }

    const baseline = protectedShape(mergeExpertIntelligence(
      f.deterministic, f.governed, { status: 'NOT_CONFIGURED', validated: null, detail: null }));

    const run = await runExpertAnalysis(provider, f.input, { nowIso: NOW });
    const t = provider.lastTelemetry;
    const merged = mergeExpertIntelligence(f.deterministic, f.governed, run.layer);
    const analysis = run.layer.validated?.analysis ?? null;
    const score = analysis ? scoreRouting(f.id, analysis, f.expectations, f.probes) : null;
    const violations = verifyMergeInvariants(merged, f.deterministic, f.governed).map(v => v.invariant);

    const row: Row = {
      hostedCase: plan.hostedCase, id: f.id, title: f.title, ran: true,
      httpStatus: t?.httpStatus ?? null,
      failureKind: run.failure?.kind ?? null,
      layerStatus: merged.expertLayer.status,
      respondedModel: t?.respondedModel ?? null,
      stopReason: t?.stopReason ?? null,
      requestId: t?.requestId ?? null,
      latencyMs: t?.latencyMs ?? null,
      promptTokens: t?.promptTokens ?? null,
      outputTokens: t?.outputTokens ?? null,
      cacheReadTokens: t?.cacheReadTokens ?? null,
      costUsd: t?.computedCostUsd ?? null,
      issues: run.issues.map((i: any) => i.code),
      counts: {
        candidates: merged.expertAdvisory.hazardCandidates.length,
        clarifications: merged.expertAdvisory.clarifications.length,
        insights: merged.expertAdvisory.crossHazardInsights.length,
        disagreements: merged.expertAdvisory.disagreements.length,
      },
      score,
      protectedShapeUnchanged: protectedShape(merged) === baseline,
      mergeViolations: violations,
      grounding: measureGrounding(f.id, isGrounding, analysis, t, f.input, plan.anchor),
    };
    rows.push(row);
    appendFileSync(LOG, JSON.stringify(row) + '\n');

    const g = row.grounding!;
    console.log(`  ${plan.hostedCase}`);
    console.log(`     HTTP ${row.httpStatus ?? '—'}  ${row.failureKind ?? 'ok'}  model=${row.respondedModel ?? '—'}`
      + `  ${row.latencyMs ?? '—'}ms  in=${row.promptTokens ?? '—'} out=${row.outputTokens ?? '—'}`
      + `  $${(row.costUsd ?? 0).toFixed(4)}`);
    console.log(`     cand=${row.counts.candidates} clar=${row.counts.clarifications} `
      + `ins=${row.counts.insights} dis=${row.counts.disagreements}`
      + `  quotes emitted=${g.emitted} bound=${g.exactlyBound} unbindable=${g.unbindable} fabricated=${g.fabricated}`
      + (isGrounding ? `  supportsClaim=${g.supportsClaim}` : ''));
    if (row.issues.length) console.log(`     issues: ${row.issues.join(', ')}`);
  }

  // ---------------------------------------------------------------- totals

  const ran = rows.filter(r => r.ran);
  const ok = ran.filter(r => r.failureKind === null);
  const scores = ran.map(r => r.score).filter(Boolean) as RoutingScore[];
  const totals = totalRouting(scores);
  const gr = ran.map(r => r.grounding!).filter(Boolean);

  const sum = (k: keyof GroundingRow) => gr.reduce((a, x) => a + (x[k] as number), 0);
  const G = {
    EVIDENCE_OPPORTUNITIES: sum('opportunities'),
    EVIDENCE_QUOTES_EMITTED: sum('emitted'),
    EVIDENCE_QUOTES_EXACTLY_BOUND: sum('exactlyBound'),
    EVIDENCE_QUOTES_UNBINDABLE: sum('unbindable'),
    EVIDENCE_QUOTES_FABRICATED: sum('fabricated'),
    GROUNDED_TYPED_OBJECTS: sum('groundedObjects'),
    UNGROUNDED_TYPED_OBJECTS: sum('ungroundedObjects'),
  };
  const groundingFixturesBound = gr.filter(x => x.isGroundingFixture && x.exactlyBound > 0 && x.supportsClaim === true).length;

  const totalIn = ran.reduce((a, r) => a + (r.promptTokens ?? 0), 0);
  const totalOut = ran.reduce((a, r) => a + (r.outputTokens ?? 0), 0);
  const totalCost = ran.reduce((a, r) => a + (r.costUsd ?? 0), 0);
  const latencies = ran.map(r => r.latencyMs ?? 0).filter(n => n > 0).sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;

  const negative = rows.find(r => r.id === 'R6');
  const r1 = rows.find(r => r.id === 'R1');
  const r2 = rows.find(r => r.id === 'R2');
  const r4 = rows.find(r => r.id === 'R4');
  const r5 = rows.find(r => r.id === 'R5');

  // ---------------------------------------------------------------- the 18 hard gates

  interface Gate { id: string; label: string; pass: boolean | null; note: string }
  const gates: Gate[] = [
    { id: 'HG01', label: 'hosted credential usable', pass: ok.length > 0,
      note: `${ok.length}/${ran.length} calls authenticated` },
    { id: 'HG02', label: 'exact model callable', pass: ran.some(r => r.httpStatus === 200),
      note: `requested ${EXPERT_HOSTED_INFERENCE_CONFIG.model}` },
    { id: 'HG03', label: 'provider identity from response body', pass: ok.every(r => r.respondedModel !== null),
      note: `responded ${[...new Set(ok.map(r => r.respondedModel))].join(', ') || '—'}` },
    { id: 'HG04', label: 'transport errors = 0 on intended-success calls', pass: ok.length === ran.length,
      note: `${ran.length - ok.length} failures` },
    { id: 'HG05', label: 'responses parse', pass: ran.every(r => r.failureKind !== 'MALFORMED_JSON'),
      note: 'no MALFORMED_JSON' },
    { id: 'HG06', label: 'responses normalize through the adapter',
      pass: ran.every(r => r.failureKind !== 'SCHEMA_INVALID_STRUCTURED_OUTPUT'),
      note: `forced tool_choice ${EXPERT_TOOL_NAME}` },
    { id: 'HG07', label: 'responses validate at the Expert boundary',
      pass: ok.every(r => r.layerStatus === 'VALIDATED' || r.layerStatus === 'PRESENT'),
      note: [...new Set(ok.map(r => r.layerStatus))].join(', ') || '—' },
    { id: 'HG08', label: 'zero-candidate clarification survives',
      pass: r1 ? r1.counts.clarifications > 0 : null,
      note: r1 ? `R1 clar=${r1.counts.clarifications} cand=${r1.counts.candidates}` : 'not run' },
    { id: 'HG09', label: 'typed cross-hazard routing survives',
      pass: r2 ? r2.counts.insights > 0 : null,
      note: r2 ? `R2 insights=${r2.counts.insights}` : 'not run' },
    { id: 'HG10', label: 'candidate routing survives',
      pass: r4 ? r4.counts.candidates > 0 : null,
      note: r4 ? `R4 candidates=${r4.counts.candidates}` : 'not run' },
    { id: 'HG11', label: 'multi-collection sibling routing survives',
      pass: r5 ? (r5.counts.candidates > 0 && r5.counts.clarifications > 0 && r5.counts.insights > 0) : null,
      note: r5 ? `R5 cand=${r5.counts.candidates} clar=${r5.counts.clarifications} ins=${r5.counts.insights}` : 'not run' },
    { id: 'HG12', label: 'negative control not materially over-routed',
      pass: negative?.score ? negative.score.overRouted === 0 : null,
      note: negative ? `R6 over-routed=${negative.score?.overRouted ?? '—'}` : 'not run' },
    { id: 'HG13', label: 'protected merge halves invariant',
      pass: ran.every(r => r.protectedShapeUnchanged) && ran.every(r => r.mergeViolations.length === 0),
      note: `${ran.filter(r => r.protectedShapeUnchanged).length}/${ran.length} byte-identical, `
        + `${ran.reduce((a, r) => a + r.mergeViolations.length, 0)} invariant violations` },
    { id: 'HG14', label: 'token usage measurable',
      pass: ok.every(r => r.promptTokens !== null && r.outputTokens !== null),
      note: `${totalIn} in / ${totalOut} out (provider-reported)` },
    { id: 'HG15', label: 'latency measured', pass: latencies.length === ran.length,
      note: `p50 ${p50 ?? '—'}ms, max ${latencies[latencies.length - 1] ?? '—'}ms` },
    { id: 'HG16', label: 'cost below cap', pass: totalCost <= MAX_HOSTED_COST_USD,
      note: `$${totalCost.toFixed(4)} of $${MAX_HOSTED_COST_USD.toFixed(2)}` },
    { id: 'HG17', label: 'fabricated/unbindable evidence cannot cross as grounded',
      pass: G.EVIDENCE_QUOTES_FABRICATED === 0 && G.EVIDENCE_QUOTES_UNBINDABLE === 0,
      note: `unbindable=${G.EVIDENCE_QUOTES_UNBINDABLE} fabricated=${G.EVIDENCE_QUOTES_FABRICATED}`
        + (G.EVIDENCE_QUOTES_UNBINDABLE === 0 && G.EVIDENCE_QUOTES_EMITTED === 0
          ? ' — VACUOUS: no malformed quote arose' : '') },
    { id: 'HG18', label: 'production/customer path untouched', pass: customerPathUntouched(),
      note: 'no file outside expert-hazlenz* references the module' },
  ];

  // Grounding readiness is reported separately from the transport gates, because it answers a
  // different question: not "did the contract survive" but "can this model quote at all".
  const groundingReady =
    G.EVIDENCE_QUOTES_EXACTLY_BOUND >= 2 && groundingFixturesBound >= 2
    && G.EVIDENCE_QUOTES_UNBINDABLE === 0 && G.EVIDENCE_QUOTES_FABRICATED === 0;
  const routingClean = totals.EXPLANATION_ONLY_LOSSES === 0 && totals.TYPED_ROUTING_MISSES === 0;

  console.log('\n---------------- ROUTING ----------------');
  console.log(JSON.stringify(totals, null, 2));
  console.log('\n---------------- GROUNDING ----------------');
  console.log(JSON.stringify(G, null, 2));
  console.log(`grounding fixtures with a supporting exact quote: ${groundingFixturesBound}/2`);
  console.log(`GROUNDING_READY (>=2 bound across distinct fixtures, 0 unbindable, 0 fabricated): ${groundingReady}`);

  console.log('\n---------------- 18 HARD GATES ----------------');
  for (const g of gates) {
    const mark = g.pass === null ? 'NOT MEASURED' : g.pass ? 'PASS' : 'FAIL';
    console.log(`  ${g.id}  ${mark.padEnd(12)} ${g.label}  —  ${g.note}`);
  }

  const measured = gates.filter(g => g.pass !== null);
  const failed = measured.filter(g => !g.pass);
  const unmeasured = gates.filter(g => g.pass === null);

  console.log(`\ngates: ${measured.filter(g => g.pass).length} passed, ${failed.length} failed, `
    + `${unmeasured.length} NOT MEASURED (an unmeasured gate is never counted as a pass)`);
  console.log(`calls: ${provider.calls} attempted / ${ok.length} completed clean   `
    + `cost $${totalCost.toFixed(4)}   ceiling ${MAX_HOSTED_CALLS} / $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  if (provider.stopped) console.log(`STOPPED EARLY: ${provider.stopped}`);

  const terminal =
    failed.length === 0 && unmeasured.length === 0 && groundingReady && routingClean
      ? 'EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_PASSED — BOUNDED_PROVIDER_EVALUATION_AUTHORIZATION_REQUIRED'
      : ok.length === 0
        ? 'EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_BLOCKED — HOSTED_PROVIDER_ACCOUNT_OR_CREDENTIAL_REMEDIATION_REQUIRED'
        : failed.some(g => ['HG01', 'HG02', 'HG04', 'HG05', 'HG06', 'HG07'].includes(g.id))
          ? 'EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_FAILED — PROVIDER_SELECTION_OR_ADAPTER_REMEDIATION_REQUIRED'
          : 'EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_INCONCLUSIVE — NO_EVALUATION_COHORT_SPEND_AUTHORIZED';

  console.log(`\nTERMINAL: ${terminal}`);
  console.log('EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE   EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE');

  writeFileSync(join(OUT, 'results', 'hosted-probe-summary.json'), JSON.stringify({
    provider: 'anthropic',
    modelRequested: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(ok.map(r => r.respondedModel))],
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    promptVersion: EXPERT_PROMPT_VERSION,
    thinking: EXPERT_HOSTED_INFERENCE_CONFIG.thinking,
    determinismControl: 'NONE — temperature/top_p/top_k are removed on this model and there is no seed',
    callsAttempted: provider.calls,
    callsCompletedClean: ok.length,
    ceilingCalls: MAX_HOSTED_CALLS,
    ceilingCostUsd: MAX_HOSTED_COST_USD,
    stoppedEarly: provider.stopped,
    inputTokens: totalIn, outputTokens: totalOut,
    latencyP50Ms: p50, latencyMaxMs: latencies[latencies.length - 1] ?? null,
    actualCostUsd: Number(totalCost.toFixed(6)),
    routing: totals,
    grounding: G,
    groundingFixturesWithSupportingExactQuote: groundingFixturesBound,
    groundingReady,
    gates: gates.map(g => ({ id: g.id, label: g.label, verdict: g.pass === null ? 'NOT_MEASURED' : g.pass ? 'PASS' : 'FAIL', note: g.note })),
    terminal,
    EXPERT_HAZLENZ_PROVIDER_VALIDATED: false,
    EXPERT_HAZLENZ_CUSTOMER_ACTIVE: false,
    rows,
  }, null, 2) + '\n');

  process.exit(failed.length === 0 && unmeasured.length === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
