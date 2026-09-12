/**
 * §118 -- BOUNDED HOSTED DETERMINISTIC->EXPERT PROJECTION A/B. FROZEN CAUSAL MEASUREMENT.
 *
 * Nothing is repaired during this run. Prompt v6, the §117 deterministic repair, the §116
 * projection design, normalization, grounding and the scorer are all frozen and untouched.
 *
 * ==================== EXPERIMENT ====================
 *
 *   ARM A (baseline)   the exact request `buildAnthropicRequestBody(input)` produces today.
 *   ARM B (projected)  the SAME request, with the §116 deterministic-disposition block appended
 *                      to the user message.
 *
 * Exactly one variable differs. Observation text, deterministic facts, system prompt, wire schema,
 * strict wrapper, Anthropic compatibility strip, model, max_tokens, thinking, endpoint, api
 * version, quote binder and normalizer are byte-identical between arms.
 *
 * ==================== DISCLOSED TRANSPORT DEVIATION ====================
 *
 * The HTTP call is issued here rather than through `AnthropicExpertProvider.analyze()`, for one
 * reason: `analyze()` builds the user prompt internally and offers no seam, so Arm B could not be
 * expressed without editing a production file during a frozen measurement. This is NOT the §106/
 * §107 "compatibility diagnostic bypass" -- that bypassed the schema pipeline. Here the request
 * body comes from the REAL `buildAnthropicRequestBody`, so the canonical schema, the strict-mode
 * wrapper and the `stripAnthropicUnsupportedKeywords` strip are all applied exactly as in
 * production; the endpoint, headers and api-version are copied verbatim from the adapter; and the
 * model-identity check, `bindWireAnalysis` and `normalizeExpertOutput` are the real ones. The same
 * transport is used for BOTH arms, so it cannot confound the comparison. §110's probe set the
 * precedent for a probe-local transport that replicates the adapter inline.
 *
 * ==================== SPEND ====================
 *
 * `--preflight-only` computes worst-case spend from the real request bodies and makes ZERO calls.
 * Execution refuses to start if the projection exceeds the ceiling, and there is no retry: a
 * failed call is recorded as failed. 18 calls maximum, hard-coded. No nineteenth call.
 */

import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { applyEvidenceFoundation } from '../src/safescope-v2/evidence/evidence-foundation';
import {
  EXPERT_TOOL_NAME, EXPERT_HOSTED_INFERENCE_CONFIG, buildAnthropicRequestBody,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { bindWireAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';
import { ADVERSARIAL_RECALL_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/hazard-actuality-fixtures';
import { RESTORATION_TRANSITION_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/restoration-transition-fixtures';
import type { ExpertAnalysisInput } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  projectDeterministicDispositions, renderDeterministicDispositionBlock,
  type DeterministicFamilyDisposition,
} from './lib/expert-deterministic-projection';
import { recordStateAware, type StateAwareRecord } from './lib/expert-state-aware-scoring';

// ---------------------------------------------------------------- env (probe-local, §104 pattern)
function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const key = m[1];
    const value = m[2].replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(join(__dirname, '..', '.env'));

const PREFLIGHT_ONLY = process.argv.includes('--preflight-only');
const CALL_CEILING = 18;
const SPEND_CEILING_USD = 3.00;
const NOW = '2026-08-31T00:00:00.000Z';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-hosted-projection-ab-2026-08-31');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'preflight'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });

// ---------------------------------------------------------------- the frozen matrix

interface Case {
  id: string; role: string; reps: number; gate: string;
  input: ExpertAnalysisInput;
  constructedDispositions?: DeterministicFamilyDisposition[];
}

const routing = (id: string) => ROUTING_FIXTURES.find(f => f.id === id)!;
const adversarial = (id: string) => ADVERSARIAL_RECALL_FIXTURES.find(f => f.id === id)!;
const restoration = (id: string) => RESTORATION_TRANSITION_FIXTURES.find(f => f.id === id)!;

const CASES: Case[] = [
  { id: 'R6', role: 'PRIMARY', reps: 3, input: routing('R6').input,
    gate: 'Projected must be 3/3 clean: no unsupported current machine_guarding hazard and no '
      + 'non-decision-critical future-transition clarification.' },
  { id: 'V7', role: 'ANTI_RUBBER_STAMP', reps: 1, input: adversarial('V7').input,
    gate: 'Current point-of-operation contact. Hazard must survive.' },
  { id: 'R6-I', role: 'ANTI_RUBBER_STAMP', reps: 1, input: restoration('R6-I').input,
    gate: 'Machine returned to operation, guard absent. Current machine_guarding must survive.' },
  {
    id: 'V1-CTRL', role: 'ANTI_RUBBER_STAMP', reps: 1, input: adversarial('V1').input,
    gate: 'A CONSTRUCTED lockout_tagout=CONTROLLED is projected onto an observation stating the '
      + 'stored energy was NOT bled. Expert must override, not rubber-stamp.',
    constructedDispositions: [{
      hazardFamily: 'lockout_tagout', disposition: 'CONTROLLED', isActionable: false,
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
  { id: 'R6-H', role: 'TRANSITION', reps: 1, input: restoration('R6-H').input,
    gate: 'Re-energizing NOW with the guard absent. The transition/restoration issue must survive.' },
  { id: 'V8', role: 'CROSS_FAMILY', reps: 1, input: adversarial('V8').input,
    gate: 'A different-family current hazard the engine did not assess must survive.' },
  { id: 'V5', role: 'UNKNOWN_STATE', reps: 1, input: adversarial('V5').input,
    gate: 'Legitimate uncertainty must survive; a clarification is an acceptable carrier.' },
];

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

/** The frozen call plan, in execution order. */
interface PlannedCall {
  order: number; caseId: string; arm: 'baseline' | 'projected'; rep: number;
  role: string; gate: string;
  body: Record<string, unknown>;
  dispositions: DeterministicFamilyDisposition[];
}

const PLAN: PlannedCall[] = [];
{
  let order = 0;
  for (const c of CASES) {
    const dispositions = dispositionsFor(c);
    const block = renderDeterministicDispositionBlock(dispositions);
    for (const arm of ['baseline', 'projected'] as const) {
      for (let rep = 1; rep <= c.reps; rep++) {
        const body = buildAnthropicRequestBody(c.input) as Record<string, unknown>;
        if (arm === 'projected' && block) {
          const messages = body.messages as Array<{ role: string; content: string }>;
          messages[0].content = `${messages[0].content}\n\n${block}`;
        }
        PLAN.push({
          order: ++order, caseId: c.id, arm, rep, role: c.role, gate: c.gate, body,
          dispositions: arm === 'projected' ? dispositions : [],
        });
      }
    }
  }
}

// ---------------------------------------------------------------- spend preflight (REAL bodies)

const cfg = EXPERT_HOSTED_INFERENCE_CONFIG;
/**
 * CALIBRATED AGAINST MEASURED DATA, not assumed.
 *
 * A first pass used 3.0 on the reasoning that English runs ~3.5-4 chars/token. That was WRONG for
 * this request shape and would have UNDER-estimated spend: §114's nine hosted calls measured
 * 9,163 input tokens on average (max 9,199) for a body of the same construction, which implies
 * ~2.52 chars/token — the request is mostly JSON schema, which tokenises far denser than prose.
 *
 * 2.2 is therefore used: it over-estimates input tokens by roughly 15% against the measured
 * figure, so the ceiling check cannot be passed by an optimistic assumption.
 */
const CHARS_PER_TOKEN = 2.2;
const CHARS_PER_TOKEN_CALIBRATION =
  'Calibrated against §114 measured input tokens (avg 9163, max 9199 over 9 calls), which imply '
  + '~2.52 chars/token for this request shape. 2.2 over-estimates by ~15%.';

const preflightRows = PLAN.map(p => {
  const chars = JSON.stringify(p.body).length;
  const projectedInputTokens = Math.ceil(chars / CHARS_PER_TOKEN);
  const inputCost = (projectedInputTokens / 1e6) * cfg.inputUsdPerMTok;
  const outputCost = (cfg.maxTokens / 1e6) * cfg.outputUsdPerMTok;
  return {
    order: p.order, caseId: p.caseId, arm: p.arm, rep: p.rep,
    requestBodyChars: chars, projectedInputTokens,
    maxOutputAllowance: cfg.maxTokens,
    inputUsdPerMTok: cfg.inputUsdPerMTok, outputUsdPerMTok: cfg.outputUsdPerMTok,
    worstCaseInputUsd: Number(inputCost.toFixed(6)),
    worstCaseOutputUsd: Number(outputCost.toFixed(6)),
    worstCaseCallUsd: Number((inputCost + outputCost).toFixed(6)),
  };
});
const projectedWorstCaseSpend = Number(
  preflightRows.reduce((a, r) => a + r.worstCaseCallUsd, 0).toFixed(6));

const preflight = {
  generatedAt: new Date().toISOString(),
  provider: 'anthropic', model: cfg.model, apiVersion: cfg.apiVersion,
  promptVersion: 'hazlenz.expert.prompt.v6', contractVersion: 'hazlenz.expert.analysis.v2',
  thinking: cfg.thinking, maxOutputTokens: cfg.maxTokens,
  p2DeterminismControl: 'ABSENT',
  charsPerTokenAssumption: CHARS_PER_TOKEN,
  charsPerTokenNote: CHARS_PER_TOKEN_CALIBRATION,
  plannedCalls: PLAN.length, callCeiling: CALL_CEILING, spendCeilingUsd: SPEND_CEILING_USD,
  projectedWorstCaseSpendUsd: projectedWorstCaseSpend,
  withinCeiling: projectedWorstCaseSpend <= SPEND_CEILING_USD && PLAN.length <= CALL_CEILING,
  perCall: preflightRows,
};
writeFileSync(join(OUT, 'preflight', 'preflight.json'), JSON.stringify(preflight, null, 2) + '\n');

console.log('=== SPEND PREFLIGHT (from the REAL request bodies) ===');
console.log(`provider=anthropic model=${cfg.model} thinking=${cfg.thinking} maxTokens=${cfg.maxTokens}`);
console.log(`pricing: input $${cfg.inputUsdPerMTok}/MTok  output $${cfg.outputUsdPerMTok}/MTok`);
console.log(`planned calls: ${PLAN.length} (ceiling ${CALL_CEILING})`);
console.log(`projected worst-case spend: $${projectedWorstCaseSpend.toFixed(6)} (ceiling $${SPEND_CEILING_USD.toFixed(2)})`);
console.log(`WITHIN CEILING: ${preflight.withinCeiling}`);
for (const r of preflightRows) {
  console.log(`  ${String(r.order).padStart(2)} ${r.caseId.padEnd(8)} ${r.arm.padEnd(10)} rep${r.rep}  `
    + `chars=${String(r.requestBodyChars).padStart(6)} inTok~${String(r.projectedInputTokens).padStart(5)} `
    + `worstCase=$${r.worstCaseCallUsd.toFixed(6)}`);
}

if (PREFLIGHT_ONLY) {
  console.log('\n--preflight-only: ZERO hosted calls made.');
  process.exit(0);
}
if (!preflight.withinCeiling) {
  console.error('\nPROJECTED WORST-CASE SPEND EXCEEDS CEILING -- refusing to execute. Zero calls made.');
  process.exit(2);
}

// ---------------------------------------------------------------- execution

const LOG = join(OUT, 'transport', 'projection-ab.jsonl');
if (existsSync(LOG)) throw new Error(`refusing to overwrite existing evidence at ${LOG}`);
writeFileSync(LOG, '');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey.trim() === '') {
  console.error('ANTHROPIC_API_KEY is ABSENT. Zero calls made.');
  process.exit(3);
}

async function callOnce(p: PlannedCall) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetch(`${cfg.endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
        'anthropic-version': cfg.apiVersion,
      },
      body: JSON.stringify(p.body),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const requestId = response.headers.get('request-id');
    if (!response.ok) {
      const t = await response.text().catch(() => '');
      return { ok: false as const, latencyMs, httpStatus: response.status, requestId,
        detail: `HTTP ${response.status}`, errorTypeOnly: /"type"\s*:\s*"([^"]+)"/.exec(t)?.[1] ?? null };
    }
    const envelope = await response.json() as Record<string, unknown>;
    const usage = (envelope.usage ?? {}) as Record<string, number>;
    const content = Array.isArray(envelope.content) ? envelope.content as unknown[] : [];
    const toolUse = content.find(b => {
      const block = (b ?? {}) as Record<string, unknown>;
      return block.type === 'tool_use' && block.name === EXPERT_TOOL_NAME;
    }) as Record<string, unknown> | undefined;
    return {
      ok: true as const, latencyMs, httpStatus: response.status, requestId,
      respondedModel: typeof envelope.model === 'string' ? envelope.model : null,
      stopReason: typeof envelope.stop_reason === 'string' ? envelope.stop_reason : null,
      inputTokens: usage.input_tokens ?? null, outputTokens: usage.output_tokens ?? null,
      wire: toolUse?.input ?? null,
    };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return { ok: false as const, latencyMs: Date.now() - started, httpStatus: null, requestId: null,
      detail: name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', errorTypeOnly: null };
  } finally { clearTimeout(timer); }
}

async function main() {
  let spent = 0;
  let attempted = 0;
  let completedClean = 0;
  const records: StateAwareRecord[] = [];

  for (const p of PLAN) {
    if (attempted >= CALL_CEILING) { console.error('CALL CEILING REACHED -- stopping.'); break; }
    if (spent >= SPEND_CEILING_USD) { console.error('SPEND CEILING REACHED -- stopping.'); break; }
    attempted += 1;
    const r = await callOnce(p);

    const row: Record<string, unknown> = {
      order: p.order, caseId: p.caseId, arm: p.arm, rep: p.rep, role: p.role, gate: p.gate,
      projectedDispositions: p.dispositions.map(
        d => `${d.hazardFamily}=${d.disposition}@${d.confidence}[${d.provenance}]`),
      ok: r.ok, httpStatus: r.httpStatus, requestId: r.requestId, latencyMs: r.latencyMs,
    };

    if (!r.ok) {
      row.failure = r.detail;
      row.errorTypeOnly = r.errorTypeOnly;
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      console.log(`${String(p.order).padStart(2)} ${p.caseId.padEnd(8)} ${p.arm.padEnd(10)} FAILED ${r.detail}`);
      // NO RETRY, by design. A failed call is recorded as failed.
      continue;
    }

    const cost = ((r.inputTokens ?? 0) / 1e6) * cfg.inputUsdPerMTok
      + ((r.outputTokens ?? 0) / 1e6) * cfg.outputUsdPerMTok;
    spent += cost;
    row.respondedModel = r.respondedModel;
    row.stopReason = r.stopReason;
    row.inputTokens = r.inputTokens;
    row.outputTokens = r.outputTokens;
    row.costUsd = Number(cost.toFixed(6));

    // Real model-identity gate, exactly as the runner applies it.
    if (r.respondedModel !== cfg.model) {
      row.failure = `UNEXPECTED_MODEL_IDENTITY expected=${cfg.model} got=${String(r.respondedModel)}`;
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      console.log(`${String(p.order).padStart(2)} ${p.caseId} ${p.arm} UNEXPECTED_MODEL_IDENTITY`);
      continue;
    }
    if (r.stopReason === 'max_tokens') row.truncated = true;

    const caseInput = CASES.find(c => c.id === p.caseId)!.input;
    const bound = bindWireAnalysis(r.wire, caseInput);
    const normalized = normalizeExpertOutput(bound.raw, caseInput, NOW);
    row.binding = bound.binding;
    row.normalizationState = normalized.state;
    row.issues = normalized.issues.map(i => i.code);
    row.wire = r.wire;

    if (normalized.state === 'VALID' && normalized.validated) {
      completedClean += 1;
      const rec = recordStateAware(p.caseId, p.arm, p.rep, normalized.validated.analysis, p.dispositions);
      records.push(rec);
      row.stateAware = rec;
      row.analysis = normalized.validated.analysis;
    }
    appendFileSync(LOG, JSON.stringify(row) + '\n');
    const summary = normalized.state === 'VALID' && normalized.validated
      ? normalized.validated.analysis.expertHazardCandidates
          .map(c => `${c.hazardFamily}/${c.assertedConditionState}`).join(',') || '(no candidates)'
      : `NORMALIZATION_${normalized.state}`;
    console.log(`${String(p.order).padStart(2)} ${p.caseId.padEnd(8)} ${p.arm.padEnd(10)} rep${p.rep}  `
      + `$${cost.toFixed(6)}  ${summary}`);
  }

  const summary = {
    plannedCalls: PLAN.length, attempted, completedClean,
    projectedWorstCaseSpendUsd: projectedWorstCaseSpend,
    actualSpendUsd: Number(spent.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD, callCeiling: CALL_CEILING,
    provider: 'anthropic', model: cfg.model, promptVersion: 'hazlenz.expert.prompt.v6',
    contractVersion: 'hazlenz.expert.analysis.v2', thinking: cfg.thinking,
    p2DeterminismControl: 'ABSENT',
    retriesUsed: 0,
    note: 'Frozen measurement. Nothing was repaired. No retry was used to improve any score.',
  };
  writeFileSync(join(OUT, 'results', 'run-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('\n=== RUN SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
