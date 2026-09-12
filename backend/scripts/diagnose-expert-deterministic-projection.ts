/**
 * EXPERT HAZLENZ -- DETERMINISTIC -> EXPERT PROJECTION: LOCAL A/B DIAGNOSTIC (§116).
 *
 * ZERO HOSTED CALLS. Local Ollama (qwen3-coder:30b) only, $0.00, no network beyond localhost.
 *
 * ==================== WHAT THIS MEASURES ====================
 *
 * Exactly ONE variable changes between the two arms:
 *
 *   baseline   EXPERT_SYSTEM_PROMPT + buildExpertUserPrompt(input)
 *   projected  EXPERT_SYSTEM_PROMPT + buildExpertUserPrompt(input) + <deterministic disposition block>
 *
 * Everything else -- system prompt, wire schema, quote binder, normalizer, seed, temperature,
 * fixture input -- is byte-identical and comes from the unmodified production modules. The
 * projection block is APPENDED; no production prompt text is edited.
 *
 * ==================== WHY THE ANTI-RUBBER-STAMP CASES ARE REAL, NOT CONSTRUCTED ====================
 *
 * This phase set out to CONSTRUCT a "deliberately incomplete deterministic view" to prove the
 * projection does not merely silence Expert. That construction turned out to be unnecessary: the
 * REAL production engine already emits `machine_guarding = NOT_APPLICABLE` at confidence 0.96 on
 * `V2` (accumulator still charged), `V4` (a second energy source still live -- with ALL FOUR of its
 * own predicates reading SUPPORTED), `V7` (a technician's hands in the point of operation) and
 * `R6-I` (the press running unguarded), because `notApplicable = guardPresent || energySafe`
 * short-circuits on `energySafe` regardless of every other fact.
 *
 * That makes these the strongest possible anti-rubber-stamp gates: if Expert defers to the
 * projected disposition on them, the projection is unsafe and must not be built. They are HARD
 * GATES here for that reason, and the local result decides the phase's terminal.
 */

import { mkdirSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { applyEvidenceFoundation } from '../src/safescope-v2/evidence/evidence-foundation';
import {
  EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertUserPrompt, buildExpertWireSchema,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import { EXPERT_PROBE_INFERENCE_CONFIG } from '../src/safescope-v2/expert-hazlenz-adapters/ollama-expert-provider';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import { ADVERSARIAL_RECALL_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/hazard-actuality-fixtures';
import { RESTORATION_TRANSITION_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/restoration-transition-fixtures';
import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  projectDeterministicDispositions, renderDeterministicDispositionBlock,
  type DeterministicFamilyDisposition,
} from './lib/expert-deterministic-projection';
import {
  recordStateAware, summarizeStateAware, type StateAwareRecord,
} from './lib/expert-state-aware-scoring';

const label = (process.argv.find(a => a.startsWith('--label=')) ?? '--label=unlabeled').split('=')[1];
const REPEATS = Number(process.env.DIAG_REPEATS || 3);
const NOW = '2026-08-31T00:00:00.000Z';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-deterministic-projection-design-2026-08-31');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', `${label}.jsonl`);
if (existsSync(LOG)) throw new Error(`refusing to overwrite existing evidence at ${LOG} -- choose a new --label`);
writeFileSync(LOG, '');

// ---------------------------------------------------------------- the case matrix

interface Case {
  id: string;
  /** Which Phase-7 control this is. */
  control: string;
  input: ExpertAnalysisInput;
  /** What the case proves if it holds. */
  gate: string;
  hardGate: boolean;
  /** Overrides the engine-derived projection, for the CONTROLLED-that-failed case only. */
  constructedDispositions?: DeterministicFamilyDisposition[];
}

const routing = (id: string) => ROUTING_FIXTURES.find(f => f.id === id)!;
const adversarial = (id: string) => ADVERSARIAL_RECALL_FIXTURES.find(f => f.id === id)!;
const restoration = (id: string) => RESTORATION_TRANSITION_FIXTURES.find(f => f.id === id)!;

const CASES: Case[] = [
  { id: 'R6', control: 'A_R6_EXACT', input: routing('R6').input, hardGate: true,
    gate: 'No same-family ACTIVE candidate without a concrete override pathway. The primary defect.' },
  { id: 'R6-H', control: 'CURRENT_TRANSITION', input: restoration('R6-H').input, hardGate: true,
    gate: 'A clarification/candidate must engage the STATED restart with the guard still off.' },
  { id: 'R6-I', control: 'F_DETERMINISTIC_FALSE_NEGATIVE', input: restoration('R6-I').input, hardGate: true,
    gate: 'Engine says machine_guarding NOT_APPLICABLE 0.96 while the press RUNS unguarded. Expert MUST override.' },
  { id: 'V7', control: 'E_SEPARATE_CURRENT_EXPOSURE', input: adversarial('V7').input, hardGate: true,
    gate: 'Engine says NOT_APPLICABLE 0.96 while a technician reaches into the point of operation. Expert MUST override.' },
  { id: 'V4', control: 'C_INCOMPLETE_ISOLATION', input: adversarial('V4').input, hardGate: true,
    gate: 'Engine says NOT_APPLICABLE 0.96 with ALL predicates SUPPORTED and a live second source. Recall must survive.' },
  { id: 'V2', control: 'D_STORED_ENERGY_REMAINS', input: adversarial('V2').input, hardGate: true,
    gate: 'Engine says NOT_APPLICABLE 0.96 with the accumulator charged. Recall must survive.' },
  { id: 'V5', control: 'B_STOPPED_NOT_ISOLATED / G_UNKNOWN_STATE', input: adversarial('V5').input, hardGate: true,
    gate: 'Engine says machine_guarding UNKNOWN 0.45. Recall must survive; UNKNOWN must not silence Expert.' },
  { id: 'V8', control: 'E2_DIFFERENT_FAMILY_ADDITION', input: adversarial('V8').input, hardGate: true,
    gate: 'Expert must still ADD a different family (chemical/spark) the engine never assessed.' },
  {
    id: 'V1-CTRL', control: 'H_CONTROLLED_BUT_CONTROL_FAILED', input: adversarial('V1').input, hardGate: true,
    gate: 'A CONSTRUCTED lockout_tagout=CONTROLLED is projected onto an observation that states the '
      + 'stored energy has NOT been bled. Expert must disagree rather than accept the control.',
    constructedDispositions: [{
      hazardFamily: 'lockout_tagout',
      disposition: 'CONTROLLED',
      isActionable: false,
      confidence: 0.94,
      controllingFacts: [
        { fact: 'general-industry jurisdiction', status: 'SUPPORTED' },
        { fact: 'energy isolated and locked', status: 'SUPPORTED' },
      ],
      rationale: 'The deterministic layer evaluated this family and found the condition present but '
        + 'controlled by a stated, verified control.',
      evidenceQuotes: ['The press was locked out with the supervisor tag applied'],
      provenance: 'CONSTRUCTED_FOR_DIAGNOSTIC',
    }],
  },
];

// ---------------------------------------------------------------- projection from the REAL engine

function dispositionsFor(c: Case): DeterministicFamilyDisposition[] {
  if (c.constructedDispositions) return c.constructedDispositions;
  const observation = c.input.authoritativeSources[0].text;
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result, { text: observation, scopes: ['osha_general_industry'] } as never);
  const decisions = (result.applicabilityDecisions ?? []) as Array<{
    family: string; status: string; confidence: number;
    requiredPredicates: Array<{ name: string; status: string }>;
  }>;
  return projectDeterministicDispositions(decisions);
}

// ---------------------------------------------------------------- diagnostic-only transport

/**
 * Inline transport, probe-only. It reuses the production system prompt, user prompt, wire schema,
 * quote binder and normalizer unchanged, and differs from `OllamaExpertProvider.analyze` in exactly
 * one way: it can append the projection block. Written inline rather than by editing the adapter so
 * no production file changes, following §110's precedent for a probe-local transport.
 */
async function analyze(input: ExpertAnalysisInput, projectionBlock: string, seed: number) {
  const cfg = EXPERT_PROBE_INFERENCE_CONFIG;
  const userPrompt = projectionBlock
    ? `${buildExpertUserPrompt(input)}\n\n${projectionBlock}`
    : buildExpertUserPrompt(input);
  const body = {
    model: cfg.model, stream: false, format: buildExpertWireSchema(input),
    options: { temperature: cfg.temperature, seed, num_ctx: cfg.numCtx },
    messages: [
      { role: 'system', content: EXPERT_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetch(`${cfg.endpoint}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    if (!response.ok) return { ok: false as const, detail: `HTTP ${response.status}` };
    const json = await response.json() as { message?: { content?: string }; model?: string };
    // Model identity is checked exactly as the runner checks it; a different model invalidates the run.
    if (json.model !== cfg.model) return { ok: false as const, detail: `UNEXPECTED_MODEL_IDENTITY ${json.model}` };
    let wire: unknown;
    try { wire = JSON.parse(json.message?.content ?? ''); }
    catch { return { ok: false as const, detail: 'MALFORMED_JSON' }; }
    const { raw, binding } = bindWireAnalysis(wire, input);
    const normalized = normalizeExpertOutput(raw, input, NOW);
    return { ok: true as const, wire, normalized, binding, promptChars: userPrompt.length };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return { ok: false as const, detail: name === 'AbortError' ? 'TIMEOUT' : String(e) };
  } finally { clearTimeout(timer); }
}

// ---------------------------------------------------------------- run

async function main() {
  const records: StateAwareRecord[] = [];
  const started = Date.now();

  for (const c of CASES) {
    const dispositions = dispositionsFor(c);
    const block = renderDeterministicDispositionBlock(dispositions);
    for (const arm of ['baseline', 'projected'] as const) {
      for (let rep = 1; rep <= REPEATS; rep++) {
        const seed = EXPERT_PROBE_INFERENCE_CONFIG.seed + rep;
        const r = await analyze(c.input, arm === 'projected' ? block : '', seed);
        const row: Record<string, unknown> = {
          caseId: c.id, control: c.control, arm, rep, seed,
          hardGate: c.hardGate, gate: c.gate,
          projectedDispositions: arm === 'projected'
            ? dispositions.map(d => `${d.hazardFamily}=${d.disposition}@${d.confidence}[${d.provenance}]`)
            : [],
          ok: r.ok,
        };
        if (!r.ok) {
          row.failure = r.detail;
        } else {
          row.normalizationState = r.normalized.state;
          row.issues = r.normalized.issues.map(i => i.code);
          row.binding = r.binding;
          row.promptChars = r.promptChars;
          row.wire = r.wire;
          if (r.normalized.state === 'VALID' && r.normalized.validated) {
            const rec = recordStateAware(c.id, arm, rep, r.normalized.validated.analysis, dispositions);
            records.push(rec);
            row.stateAware = rec;
          }
        }
        appendFileSync(LOG, JSON.stringify(row) + '\n');
        const st = r.ok && r.normalized.state === 'VALID' && r.normalized.validated
          ? r.normalized.validated.analysis.expertHazardCandidates
              .map(x => `${x.hazardFamily}/${x.assertedConditionState}`).join(',') || '(no candidates)'
          : `FAILED:${r.ok ? r.normalized.state : r.detail}`;
        console.log(`${c.id.padEnd(8)} ${arm.padEnd(10)} rep${rep}  ${st}`);
      }
    }
  }

  // ---- per-case, per-arm summary
  const summary: Record<string, unknown> = {
    label, repeats: REPEATS, model: EXPERT_PROBE_INFERENCE_CONFIG.model,
    provider: 'local-ollama', hostedCalls: 0, costUsd: 0,
    elapsedMs: Date.now() - started,
    note: 'RECORDING-ONLY instrumentation. No pass/fail gate in expert-routing-metrics.ts was changed.',
    perCase: {} as Record<string, unknown>,
  };
  for (const c of CASES) {
    const forCase = (arm: string) => summarizeStateAware(records.filter(r => r.fixtureId === c.id && r.arm === arm));
    (summary.perCase as Record<string, unknown>)[c.id] = {
      control: c.control, hardGate: c.hardGate, gate: c.gate,
      baseline: forCase('baseline'), projected: forCase('projected'),
    };
  }
  writeFileSync(join(OUT, 'results', `${label}-summary.json`), JSON.stringify(summary, null, 2) + '\n');
  console.log('\n=== written:', join(OUT, 'results', `${label}-summary.json`));
}

main().catch(e => { console.error(e); process.exit(1); });
