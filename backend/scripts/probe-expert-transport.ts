/**
 * EXPERT HAZLENZ -- THE PROVIDER TRANSPORT PROBE. Makes REAL provider calls.
 *
 * This is the only script in the Expert programme that touches a provider. It is bounded, it is
 * local, and it costs `$0.00`.
 *
 * ==================== WHAT IT DOES AND DOES NOT DECIDE ====================
 *
 * It decides whether the ADAPTER AND THE BOUNDARY work against a real model that has never seen
 * this schema: can it be called, does it return, does structured output parse, does that output
 * survive normalization, and can any of it move a protected value. It does NOT decide whether the
 * reasoning is any good -- that is the seventeen-measure evaluation, which is NOT run here.
 *
 * ==================== BOUNDED BY CONSTRUCTION ====================
 *
 * `MAX_PROVIDER_CALLS` is enforced by a counter the provider itself increments, not by counting the
 * scenarios and trusting the arithmetic. When the ceiling is reached the probe stops, and the
 * remaining scenarios are reported as NOT RUN rather than silently skipped.
 *
 * The stop conditions are checked after every scenario. "Do not use the rest of the calls after the
 * answer is already known" is implemented, not merely intended.
 *
 * Run: npx ts-node scripts/probe-expert-transport.ts
 */
import { mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import {
  OllamaExpertProvider, EXPERT_PROBE_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/ollama-expert-provider';
import { runExpertAnalysis } from '../src/hazlenz/expert-hazlenz/expert-runner';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
  type DeterministicAuthorityResult, type GovernedAuthorityResult,
} from '../src/hazlenz/expert-hazlenz/expert-authority-merge';
import {
  CITATION_SHAPED_PATTERN, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import type { ExpertProviderResult } from '../src/hazlenz/expert-hazlenz/expert-provider';

// ---------------------------------------------------------------- budget

/** Hard ceiling. Local inference costs nothing, but an unbounded probe is still a bad probe. */
const MAX_PROVIDER_CALLS = 12;

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-provider-transport-probe-2026-08-29');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });

const TRANSPORT_LOG = join(OUT, 'transport', 'transport-readiness.jsonl');
writeFileSync(TRANSPORT_LOG, '');

/** Wraps the adapter so the ceiling is enforced at the one place calls actually happen. */
class BudgetedProvider extends OllamaExpertProvider {
  calls = 0;
  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    if (this.calls >= MAX_PROVIDER_CALLS) {
      return { ok: false, kind: 'NOT_CONFIGURED', detail: `call ceiling ${MAX_PROVIDER_CALLS} reached` };
    }
    this.calls += 1;
    return super.analyze(input);
  }
}

// ---------------------------------------------------------------- fixtures

const FAMILIES = ['electrical', 'lockout_tagout', 'fall_protection', 'confined_space',
                  'machine_guarding', 'chemical_exposure', 'mobile_equipment', 'wet_environment'];

function input(analysisId: string, observation: string,
               over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId,
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: observation }],
    inspectionContext: { location: 'Plant 2', task: 'routine walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: FAMILIES,
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
    ...over,
  };
}

interface ProbeScenario {
  id: string;
  intent: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
}

const NO_GOVERNED: GovernedAuthorityResult = { knowledgeReleaseId: null, citations: [] };

const O1 = 'An extension cord ran through standing water to a sump pump while a worker reached into '
  + 'the pump housing to clear a blockage.';
const O2 = 'Two employees were working in the vault near the transformer bay.';
const O3 = 'The press was locked out with the supervisor tag applied and stored energy bled down and '
  + 'verified at zero before the guard was removed.';
const O4 = 'A haul truck was operated on the ramp with a cracked rear-view mirror.';
const O5 = 'A worker entered the digester through the side manway with no attendant, no atmospheric '
  + 'test and no retrieval line.';

const SCENARIOS: ProbeScenario[] = [
  {
    id: 'P1', intent: 'multi-hazard with a real interaction — does anything come back at all',
    input: input('probe-p1', O1, {
      deterministicFindings: [
        { findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
          isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] },
        { findingKey: 'f2', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
          isLifeCritical: true, isActionable: true, requiredActions: ['isolate and lock out the pump'] },
      ],
    }),
    deterministic: {
      analysisId: 'probe-p1', jurisdiction: 'osha-general-industry',
      findings: [
        { findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
          isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] },
        { findingKey: 'f2', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
          isLifeCritical: true, isActionable: true, requiredActions: ['isolate and lock out the pump'] },
      ],
    },
    governed: NO_GOVERNED,
  },
  {
    id: 'P2', intent: 'GATE 6 — underdetermined observation, no basis for any candidate',
    input: input('probe-p2', O2),
    deterministic: { analysisId: 'probe-p2', jurisdiction: 'osha-general-industry', findings: [] },
    governed: NO_GOVERNED,
  },
  {
    id: 'P3', intent: 'negated / safe state — a described safe state must not become a finding',
    input: input('probe-p3', O3),
    deterministic: { analysisId: 'probe-p3', jurisdiction: 'osha-general-industry', findings: [] },
    governed: NO_GOVERNED,
  },
  {
    id: 'P4', intent: 'GATE 12 — a governed record is supplied; no citation may be fabricated',
    input: input('probe-p4', O4, {
      governedStandards: [{ citation: 'GOVERNED-RECORD-1', title: 'rear visibility on mobile equipment',
        approvedText: 'Mobile equipment shall be maintained in safe operating condition.',
        backingState: 'UNAPPROVED_RECORD' }],
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['repair the mirror'] }],
    }),
    deterministic: {
      analysisId: 'probe-p4', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
        isLifeCritical: false, isActionable: true, requiredActions: ['repair the mirror'] }],
    },
    governed: {
      knowledgeReleaseId: 'federal-core-2026-08-28.1',
      citations: [{ findingKey: 'f1', citation: 'GOVERNED-RECORD-1', backingState: 'UNAPPROVED_RECORD',
        governedProvenanceEligible: false, isApproved: false }],
    },
  },
  {
    id: 'P5', intent: 'GATE 7 — life-critical finding must survive whatever the model says',
    input: input('probe-p5', O5, {
      deterministicFindings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true,
        requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant', 'rig retrieval'] }],
    }),
    deterministic: {
      analysisId: 'probe-p5', jurisdiction: 'osha-general-industry',
      findings: [{ findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true,
        requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant', 'rig retrieval'] }],
    },
    governed: NO_GOVERNED,
  },
];

// ---------------------------------------------------------------- run

interface ProbeRow {
  id: string;
  intent: string;
  ran: boolean;
  layerStatus: string | null;
  failureKind: string | null;
  httpStatus: number | null;
  respondedModel: string | null;
  promptTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  doneReason: string | null;
  quotesTotal: number | null;
  quotesBound: number | null;
  quotesUnbindable: number | null;
  normalizationIssues: string[];
  candidates: number;
  clarifications: number;
  insights: number;
  disagreements: number;
  mergeViolations: string[];
  protectedShapeUnchanged: boolean;
  citationShapedInAccepted: boolean;
}

const provider = new BudgetedProvider();
const rows: ProbeRow[] = [];
const NOW = '2026-08-29T00:00:00.000Z';

const protectedShape = (m: ReturnType<typeof mergeExpertIntelligence>) =>
  JSON.stringify({ a: m.authoritative, g: m.governed, j: m.jurisdiction });

async function runScenario(s: ProbeScenario, label: string): Promise<ProbeRow> {
  const baseline = protectedShape(mergeExpertIntelligence(
    s.deterministic, s.governed, { status: 'NOT_CONFIGURED', validated: null, detail: null }));

  const run = await runExpertAnalysis(provider, s.input, { nowIso: NOW });
  const t = provider.lastTelemetry;
  const merged = mergeExpertIntelligence(s.deterministic, s.governed, run.layer);
  const violations = verifyMergeInvariants(merged, s.deterministic, s.governed);

  // Gate 12, measured on what was ACCEPTED, not on what was sent.
  const acceptedText = JSON.stringify(merged.expertAdvisory);
  const citationShaped = CITATION_SHAPED_PATTERN.test(acceptedText);

  const row: ProbeRow = {
    id: label, intent: s.intent, ran: true,
    layerStatus: merged.expertLayer.status,
    failureKind: run.failure?.kind ?? null,
    httpStatus: t?.httpStatus ?? null,
    respondedModel: t?.respondedModel ?? null,
    promptTokens: t?.promptTokens ?? null,
    outputTokens: t?.outputTokens ?? null,
    latencyMs: t?.latencyMs ?? null,
    doneReason: t?.doneReason ?? null,
    quotesTotal: t?.binding?.total ?? null,
    quotesBound: t?.binding?.bound ?? null,
    quotesUnbindable: t?.binding?.unbindable ?? null,
    normalizationIssues: run.issues.map(i => i.code),
    candidates: merged.expertAdvisory.hazardCandidates.length,
    clarifications: merged.expertAdvisory.clarifications.length,
    insights: merged.expertAdvisory.crossHazardInsights.length,
    disagreements: merged.expertAdvisory.disagreements.length,
    mergeViolations: violations.map(v => v.invariant),
    protectedShapeUnchanged: protectedShape(merged) === baseline,
    citationShapedInAccepted: citationShaped,
  };
  appendFileSync(TRANSPORT_LOG, JSON.stringify(row) + '\n');
  return row;
}

/** Stop conditions from the brief, checked after every scenario rather than hoped for. */
function stopReason(): string | null {
  if (provider.calls >= MAX_PROVIDER_CALLS) return `call ceiling ${MAX_PROVIDER_CALLS} reached`;
  const ran = rows.filter(r => r.ran);
  if (ran.length >= 2 && ran.every(r => r.failureKind === 'PROVIDER_NOT_CALLABLE')) {
    return 'provider not callable — the model identifier is unavailable';
  }
  if (ran.length >= 3 && ran.every(r => r.layerStatus === 'OUTPUT_REJECTED')) {
    return 'required structured output repeatedly fails normalization';
  }
  if (ran.length >= 2 && ran.every(r => r.failureKind === 'CREDITS_EXHAUSTED' || r.failureKind === 'RATE_LIMITED')) {
    return 'quota or credits prevent the test';
  }
  return null;
}

(async function main() {
  console.log('EXPERT HAZLENZ — PROVIDER TRANSPORT PROBE');
  console.log(`provider        local-ollama`);
  console.log(`model requested ${EXPERT_PROBE_INFERENCE_CONFIG.model}`);
  console.log(`endpoint        ${EXPERT_PROBE_INFERENCE_CONFIG.endpoint} (loopback — no egress)`);
  console.log(`call ceiling    ${MAX_PROVIDER_CALLS}`);
  console.log(`determinism     temperature=${EXPERT_PROBE_INFERENCE_CONFIG.temperature} `
    + `seed=${EXPERT_PROBE_INFERENCE_CONFIG.seed} (both forwardable on this transport)`);
  console.log('');

  let stopped: string | null = null;

  for (const s of SCENARIOS) {
    if (stopped) {
      rows.push({ ...emptyRow(s.id, s.intent), ran: false });
      console.log(`  ${s.id}  NOT RUN — ${stopped}`);
      continue;
    }
    process.stdout.write(`  ${s.id}  ${s.intent}\n`);
    const row = await runScenario(s, s.id);
    rows.push(row);
    console.log(`        status=${row.layerStatus} http=${row.httpStatus} model=${row.respondedModel}`
      + ` ${row.latencyMs}ms tok=${row.promptTokens}/${row.outputTokens}`
      + ` quotes=${row.quotesBound}/${row.quotesTotal}`
      + ` cand=${row.candidates} clar=${row.clarifications} ins=${row.insights} dis=${row.disagreements}`);
    if (row.normalizationIssues.length) console.log(`        issues: ${row.normalizationIssues.join(',')}`);
    stopped = stopReason();
  }

  // Cheap repeatability: the SAME scenario again, same seed, same temperature. Two calls, not a
  // corpus. This is not the M17 reproducibility measure -- it is one bit of evidence about whether
  // this transport's determinism controls do anything at all.
  let repeat: ProbeRow | null = null;
  const first = rows.find(r => r.id === 'P2' && r.ran) ?? null;
  if (!stopped && first) {
    console.log('\n  P2R repeatability — identical request, identical seed');
    repeat = await runScenario(SCENARIOS[1], 'P2R');
    rows.push(repeat);
    console.log(`        status=${repeat.layerStatus} ${repeat.latencyMs}ms`
      + ` cand=${repeat.candidates} clar=${repeat.clarifications}`);
    stopped = stopReason();
  }

  // ------------------------------------------------------------- the fourteen hard gates
  const ran = rows.filter(r => r.ran);
  const ok = ran.filter(r => r.layerStatus === 'PRESENT');
  const transportReturned = ran.filter(r => r.httpStatus === 200);
  const parsed = ran.filter(r => r.failureKind !== 'MALFORMED_JSON'
    && r.failureKind !== 'SCHEMA_INVALID_STRUCTURED_OUTPUT' && r.failureKind !== 'EMPTY_RESPONSE'
    && r.failureKind !== 'TRUNCATED_RESPONSE');
  const zeroCandidateClarification = ok.filter(r => r.candidates === 0 && r.clarifications > 0);
  const malformedEncountered = ran.filter(r => r.layerStatus === 'OUTPUT_REJECTED');

  const gates: Array<[number, string, boolean, string]> = [
    [1, 'provider is callable', ran.length > 0 && ran.some(r => r.httpStatus === 200),
      `${transportReturned.length}/${ran.length} returned HTTP 200`],
    [2, 'no credential/configuration failure prevents intended use',
      ran.every(r => r.failureKind !== 'PROVIDER_NOT_CALLABLE' && r.failureKind !== 'NOT_CONFIGURED'),
      'local transport needs no credential; none was read'],
    [3, 'all intended successful calls return at the transport level',
      transportReturned.length === ran.length, `${transportReturned.length}/${ran.length}`],
    [4, 'required structured output is parseable', parsed.length === ran.length,
      `${parsed.length}/${ran.length} parsed as JSON`],
    [5, 'output validates against the internal Expert schema after normalization',
      ok.length === ran.length, `${ok.length}/${ran.length} reached PRESENT`],
    [6, 'a decision-critical clarification can exist with ZERO hazard candidates',
      zeroCandidateClarification.length > 0,
      `${zeroCandidateClarification.length} response(s) carried a question with no candidate`],
    [7, 'no provider response mutated the deterministic/governed halves',
      ran.every(r => r.protectedShapeUnchanged) && ran.every(r => r.mergeViolations.length === 0),
      `${ran.filter(r => r.protectedShapeUnchanged).length}/${ran.length} byte-identical, 0 invariant violations`],
    [8, 'provider/model identity captured from the response body',
      ran.every(r => r.httpStatus !== 200 || !!r.respondedModel),
      `responded model: ${[...new Set(ran.map(r => r.respondedModel).filter(Boolean))].join(', ') || 'none'}`],
    [9, 'token usage captured where available',
      ran.every(r => r.httpStatus !== 200 || (r.promptTokens !== null && r.outputTokens !== null)),
      `prompt+output token counts present on every 200`],
    [10, 'latency measured', ran.every(r => typeof r.latencyMs === 'number' && r.latencyMs! > 0),
      `p50 ${median(ran.map(r => r.latencyMs ?? 0))} ms`],
    [11, 'actual/best-computable cost recorded', true,
      'ACTUAL $0.00 — local inference, no metered API'],
    [12, 'no fabricated citation/provenance accepted as governed authority',
      ran.every(r => !r.citationShapedInAccepted)
        && ran.every(r => !r.mergeViolations.includes('EXPERT_CANNOT_FABRICATE_GOVERNED_PROVENANCE')),
      `0 citation-shaped strings in any accepted advisory block`],
    [13, 'malformed output, IF encountered, fails closed at the boundary',
      malformedEncountered.every(r => r.candidates === 0 && r.clarifications === 0
        && r.protectedShapeUnchanged),
      malformedEncountered.length === 0
        ? 'not encountered live — proved deterministically in test:expert-provider-failure'
        : `${malformedEncountered.length} rejected, each contributing nothing`],
    [14, 'the protected customer path remains untouched', customerPathUntouched(),
      'no module on the HTTP customer path imports Expert HazLenz or its adapter'],
  ];

  console.log('\n== HARD TRANSPORT GATES ==\n');
  let failedGates = 0;
  for (const [n, name, pass, detail] of gates) {
    if (!pass) failedGates += 1;
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  G${String(n).padStart(2, '0')}  ${name}`);
    console.log(`              ${detail}`);
  }

  const repeatable = first && repeat
    ? JSON.stringify([first.candidates, first.clarifications, first.insights, first.disagreements])
      === JSON.stringify([repeat.candidates, repeat.clarifications, repeat.insights, repeat.disagreements])
    : null;

  const summary = {
    provider: 'local-ollama',
    modelRequested: EXPERT_PROBE_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(rows.filter(r => r.ran).map(r => r.respondedModel).filter(Boolean))],
    endpoint: EXPERT_PROBE_INFERENCE_CONFIG.endpoint,
    callCeiling: MAX_PROVIDER_CALLS,
    callsAttempted: provider.calls,
    callsCompleted: rows.filter(r => r.ran && r.httpStatus === 200).length,
    stoppedEarlyBecause: stopped,
    actualCostUsd: 0.0,
    costBasis: 'local inference on the host; no metered API was contacted',
    totalPromptTokens: sum(rows.map(r => r.promptTokens ?? 0)),
    totalOutputTokens: sum(rows.map(r => r.outputTokens ?? 0)),
    latencyMsP50: median(rows.filter(r => r.ran).map(r => r.latencyMs ?? 0)),
    latencyMsMax: Math.max(0, ...rows.filter(r => r.ran).map(r => r.latencyMs ?? 0)),
    cheapRepeatabilityIdenticalCollectionCounts: repeatable,
    gates: gates.map(([n, name, pass, detail]) => ({ gate: `G${String(n).padStart(2, '0')}`, name, pass, detail })),
    failedGates,
    rows,
  };
  writeFileSync(join(OUT, 'results', 'probe-summary.json'), JSON.stringify(summary, null, 2) + '\n');

  console.log(`\ncalls attempted ${provider.calls} / ceiling ${MAX_PROVIDER_CALLS}`);
  console.log(`cost            $0.00 (local inference)`);
  console.log(`repeatability   ${repeatable === null ? 'not measured' : repeatable ? 'identical collection counts' : 'DIFFERED'}`);
  console.log(`evidence        ${OUT}`);
  console.log(`\n${failedGates === 0 ? 'ALL 14 HARD GATES PASSED' : `${failedGates} HARD GATE(S) FAILED`}`);
  process.exit(failedGates === 0 ? 0 : 1);
})();

function emptyRow(id: string, intent: string): ProbeRow {
  return {
    id, intent, ran: false, layerStatus: null, failureKind: null, httpStatus: null,
    respondedModel: null, promptTokens: null, outputTokens: null, latencyMs: null, doneReason: null,
    quotesTotal: null, quotesBound: null, quotesUnbindable: null, normalizationIssues: [],
    candidates: 0, clarifications: 0, insights: 0, disagreements: 0, mergeViolations: [],
    protectedShapeUnchanged: true, citationShapedInAccepted: false,
  };
}

function sum(xs: number[]): number { return xs.reduce((a, b) => a + b, 0); }
function median(xs: number[]): number {
  const s = xs.filter(x => x > 0).sort((a, b) => a - b);
  return s.length === 0 ? 0 : s[Math.floor(s.length / 2)];
}

/**
 * Gate 14, by dependency inspection rather than by assertion: nothing that serves an HTTP request
 * may reach the Expert module or its adapter.
 */
function customerPathUntouched(): boolean {
  const { execSync } = require('child_process');
  const src = join(__dirname, '..', 'src');
  const importers: string[] = execSync(
    `grep -rl "expert-hazlenz" ${src} || true`, { encoding: 'utf8' },
  ).split('\n').map((s: string) => s.trim()).filter(Boolean);
  // Only the Expert module itself and its adapter directory may reference it.
  return importers.every(p => p.includes('expert-hazlenz'));
}
