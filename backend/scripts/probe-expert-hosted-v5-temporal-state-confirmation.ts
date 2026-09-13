/**
 * EXPERT HAZLENZ -- BOUNDED HOSTED CONFIRMATION OF THE PROMPT-v5 TEMPORAL-STATE REPAIR (2026-08-30).
 *
 * ==================== WHAT THIS IS AND IS NOT ====================
 *
 * §110/D-122 measured `R6_HOSTED_OVERROUTING_REPRODUCED` 3/3 against prompt v4. §111/D-123 built a
 * local-only (Ollama, $0.00) prompt v5 repair -- a new "CURRENT STATE, NOT HISTORICAL STATE" system
 * prompt section -- and accepted it with a disclosed single-seed residual, on the explicit condition
 * that only a HOSTED confirmation against the real target model (Claude Sonnet 5) could establish
 * whether the actual defect is fixed and whether current-hazard recall survives. This script is that
 * confirmation. It is a FROZEN MEASUREMENT: no prompt, schema, or normalization change is made
 * during or because of this run, regardless of what it finds.
 *
 * PLAN: R6 x3 (direct reproduction test), T1 (historical/resolved generalization control), T5 (true
 * current-positive recall control -- the exact fixture that caught a real over-suppression regression
 * during v2/v3/v4 local prompt iteration), T3 (current-state uncertainty control -- clarification may
 * survive without a candidate). 6 calls. ONE optional R4 spot-check (prior 3/3 hosted survival under
 * v4) authorized ONLY if the six primary calls complete cleanly at the transport level. 7 calls
 * planned, 7 absolute ceiling, no retry beyond it.
 *
 * Uses the REAL, PERMANENT adapter path (`AnthropicExpertProvider`, `buildAnthropicRequestBody`)
 * completely unmodified -- no diagnostic bypass, no schema strip beyond what the permanent adapter
 * already does for Anthropic compatibility (`stripAnthropicUnsupportedKeywords`, untouched here).
 *
 * ==================== WHY `provider.analyze()` DIRECTLY, NOT `runExpertAnalysis` ====================
 *
 * Same reasoning as §110's `probe-expert-hosted-r4-r6-targeted-confirmation.ts`: this operation's
 * own authorization says to stop rather than burn calls on a repeated transport failure, and no
 * eighth call. One attempt per repetition, no retry, calling `provider.analyze()` directly and
 * running `normalizeExpertOutput()` on the raw result gives the identical outcome `runExpertAnalysis`
 * would for a transport-successful call, while keeping the call budget exact and exposing the raw
 * pre-normalization wire object.
 *
 * Run: npx ts-node scripts/probe-expert-hosted-v5-temporal-state-confirmation.ts
 */
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import {
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG, buildAnthropicRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { scoreRouting, type RoutingScore } from '../src/hazlenz/expert-hazlenz/expert-routing-metrics';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import { TEMPORAL_STATE_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/temporal-state-fixtures';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const MAX_HOSTED_CALLS = 7;
const MAX_HOSTED_COST_USD = 3.00;
const NOW = '2026-08-30T00:00:00.000Z';

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

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-v5-temporal-state-hosted-confirmation-2026-08-30');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
mkdirSync(join(OUT, 'preflight'), { recursive: true });
const LOG = join(OUT, 'transport', 'v5-confirmation.jsonl');
if (existsSync(LOG)) throw new Error(`refusing to overwrite existing evidence at ${LOG}`);
writeFileSync(LOG, '');

const routingById = (id: string) => {
  const f = ROUTING_FIXTURES.find(x => x.id === id);
  if (!f) throw new Error(`routing fixture ${id} not found`);
  return f;
};
const temporalById = (id: string) => {
  const f = TEMPORAL_STATE_FIXTURES.find(x => x.id === id);
  if (!f) throw new Error(`temporal fixture ${id} not found`);
  return f;
};

type Role = 'R6_PRIMARY' | 'T1_HISTORICAL_RESOLVED' | 'T5_CURRENT_POSITIVE'
  | 'T3_UNCERTAINTY_CONTROL' | 'R4_SPOT_CHECK';
interface PlanItem { fixtureId: string; role: Role; rep: number; optional?: boolean; }
const PRIMARY_PLAN: PlanItem[] = [
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 1 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 2 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 3 },
  { fixtureId: 'T1', role: 'T1_HISTORICAL_RESOLVED', rep: 1 },
  { fixtureId: 'T5', role: 'T5_CURRENT_POSITIVE', rep: 1 },
  { fixtureId: 'T3', role: 'T3_UNCERTAINTY_CONTROL', rep: 1 },
];
const OPTIONAL_PLAN: PlanItem = { fixtureId: 'R4', role: 'R4_SPOT_CHECK', rep: 1, optional: true };
if (PRIMARY_PLAN.length + 1 > MAX_HOSTED_CALLS) throw new Error('plan exceeds call ceiling');

function inputFor(id: string): ExpertAnalysisInput {
  if (id === 'R4' || id === 'R6') return routingById(id).input;
  return temporalById(id).input;
}
function expectationsFor(id: string) {
  if (id === 'R4' || id === 'R6') return routingById(id).expectations;
  return temporalById(id).expectations;
}
function probesFor(id: string) {
  if (id === 'R4' || id === 'R6') return routingById(id).probes;
  return [];
}

// ---------------------------------------------------------------- preflight: hashes, git state

const promptHash = createHash('sha256').update(EXPERT_SYSTEM_PROMPT).digest('hex');
const fixtureHash = (obj: unknown) => createHash('sha256').update(JSON.stringify(obj)).digest('hex');
const preflight = {
  timestamp: NOW,
  promptVersion: EXPERT_PROMPT_VERSION,
  systemPromptSha256: promptHash,
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  fixtureHashes: {
    R6: fixtureHash(routingById('R6').input),
    R4: fixtureHash(routingById('R4').input),
    T1: fixtureHash(temporalById('T1').input),
    T5: fixtureHash(temporalById('T5').input),
    T3: fixtureHash(temporalById('T3').input),
  },
  hostedConfig: EXPERT_HOSTED_INFERENCE_CONFIG,
  plannedCalls: PRIMARY_PLAN.length + 1,
  absoluteCeiling: MAX_HOSTED_CALLS,
  costCeilingUsd: MAX_HOSTED_COST_USD,
};
writeFileSync(join(OUT, 'preflight', 'preflight.json'), JSON.stringify(preflight, null, 2) + '\n');

// ---------------------------------------------------------------- spend ceiling

class BudgetedProvider extends AnthropicExpertProvider {
  calls = 0;
  spentUsd = 0;
  stopped: string | null = null;

  async analyzeOnce(input: ExpertAnalysisInput) {
    if (this.calls >= MAX_HOSTED_CALLS) {
      this.stopped = `call ceiling ${MAX_HOSTED_CALLS} reached`;
      return { ok: false as const, kind: 'NOT_CONFIGURED' as const, detail: this.stopped };
    }
    const sourceBody = buildAnthropicRequestBody(input, EXPERT_HOSTED_INFERENCE_CONFIG);
    const worstCaseInputTokens = Math.ceil(JSON.stringify(sourceBody).length / 3);
    const worstCaseUsd = (worstCaseInputTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
      + (EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
    if (this.spentUsd + worstCaseUsd > MAX_HOSTED_COST_USD) {
      this.stopped = `cost ceiling $${MAX_HOSTED_COST_USD.toFixed(2)} would be exceeded `
        + `(spent $${this.spentUsd.toFixed(4)} + worst case $${worstCaseUsd.toFixed(4)})`;
      return { ok: false as const, kind: 'NOT_CONFIGURED' as const, detail: this.stopped };
    }
    this.calls += 1;
    const result = await this.analyze(input);
    this.spentUsd += this.lastTelemetry?.computedCostUsd ?? 0;
    return result;
  }
}

// ---------------------------------------------------------------- R6-specific content scoring

const GUARD_PATTERN = /guard|point.of.operation|pinch point/i;
const REENERGIZATION_PATTERN = /re-?energiz|reinstall|restore[ds]?\s+(the\s+)?guard|before.*(?:restart|return|service|cycl)/i;
const RESIDUAL_ENERGY_PATTERN = /residual|stored energy|zero energy|bled down|verified at zero/i;

interface R6ContentScore {
  RESOLVED_GUARD_CANDIDATE_PRESENT: boolean;
  REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: boolean;
  HYPOTHETICAL_REENERGIZATION_CLARIFICATION_PRESENT: boolean;
  OTHER_UNSUPPORTED_TYPED_CONTENT: boolean;
  clean: boolean;
}

function scoreR6Content(analysis: {
  expertHazardCandidates: Array<{ hazardFamily: string; reasoning: string; evidenceBasis: string }>;
  decisionCriticalClarifications: Array<{ question: string; whyItMatters: string; evidenceGap: string }>;
  crossHazardInsights: unknown[];
  disagreements: unknown[];
} | null): R6ContentScore {
  if (!analysis) {
    return {
      RESOLVED_GUARD_CANDIDATE_PRESENT: false, REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: false,
      HYPOTHETICAL_REENERGIZATION_CLARIFICATION_PRESENT: false, OTHER_UNSUPPORTED_TYPED_CONTENT: true,
      clean: false,
    };
  }
  let resolvedGuardCandidate = false;
  let otherUnsupported = false;

  for (const c of analysis.expertHazardCandidates) {
    const text = `${c.hazardFamily} ${c.reasoning} ${c.evidenceBasis}`;
    if (c.hazardFamily === 'machine_guarding' || GUARD_PATTERN.test(text)) resolvedGuardCandidate = true;
    else otherUnsupported = true;
  }

  let redundantZeroEnergy = false;
  let hypotheticalReenergization = false;
  for (const cl of analysis.decisionCriticalClarifications) {
    const text = `${cl.question} ${cl.whyItMatters} ${cl.evidenceGap}`;
    const isResidual = RESIDUAL_ENERGY_PATTERN.test(text);
    const isReenergization = REENERGIZATION_PATTERN.test(text);
    if (isResidual) redundantZeroEnergy = true;
    if (isReenergization) hypotheticalReenergization = true;
    if (!isResidual && !isReenergization) otherUnsupported = true;
  }

  if (analysis.crossHazardInsights.length > 0) otherUnsupported = true;
  if (analysis.disagreements.length > 0) otherUnsupported = true;

  const clean = analysis.expertHazardCandidates.length === 0
    && analysis.decisionCriticalClarifications.length === 0
    && analysis.crossHazardInsights.length === 0
    && analysis.disagreements.length === 0;

  return {
    RESOLVED_GUARD_CANDIDATE_PRESENT: resolvedGuardCandidate,
    REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: redundantZeroEnergy,
    HYPOTHETICAL_REENERGIZATION_CLARIFICATION_PRESENT: hypotheticalReenergization,
    OTHER_UNSUPPORTED_TYPED_CONTENT: otherUnsupported,
    clean,
  };
}

// ---------------------------------------------------------------- row shape

interface Row {
  fixtureId: string; role: Role; rep: number; ran: boolean;
  httpStatus: number | null; failureKind: string | null; stopReason: string | null;
  requestId: string | null; latencyMs: number | null; promptTokens: number | null;
  outputTokens: number | null; costUsd: number | null; respondedModel: string | null;
  layerStatus: string | null; issues: string[];
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  outcome: unknown;
  expertExplanation: unknown;
  uncertainty: unknown;
  candidateDetail: unknown[];
  clarificationDetail: unknown[];
  score: RoutingScore | null;
  r6Content: R6ContentScore | null;
  bindingTotal: number | null; bindingBound: number | null; bindingUnbindable: number | null;
}

const provider = new BudgetedProvider();
const rows: Row[] = [];

(async function main() {
  console.log('EXPERT HAZLENZ -- BOUNDED HOSTED CONFIRMATION OF PROMPT v5 TEMPORAL-STATE REPAIR');
  console.log(`provider   anthropic   model ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
  console.log(`contract   ${EXPERT_ANALYSIS_CONTRACT_VERSION}   prompt ${EXPERT_PROMPT_VERSION}   (UNCHANGED THIS RUN)`);
  console.log(`ceiling    ${MAX_HOSTED_CALLS} calls   $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  console.log(`system prompt sha256  ${promptHash}`);
  console.log(`planned    ${PRIMARY_PLAN.length} primary + 1 optional (R4 spot-check)\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('BLOCKED -- ANTHROPIC_API_KEY is not reachable. No call attempted, $0.00 spent.');
    console.error('Terminal: EXPERT_HAZLENZ_V5_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED');
    process.exit(3);
  }

  async function runOne(plan: PlanItem): Promise<void> {
    const input = inputFor(plan.fixtureId);

    if (provider.stopped) {
      console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  NOT RUN -- ${provider.stopped}`);
      rows.push({
        fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: false,
        httpStatus: null, failureKind: 'STOPPED_EARLY', stopReason: null, requestId: null,
        latencyMs: null, promptTokens: null, outputTokens: null, costUsd: null, respondedModel: null,
        layerStatus: null, issues: [], counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null, candidateDetail: [], clarificationDetail: [],
        score: null, r6Content: null, bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      });
      return;
    }

    const result = await provider.analyzeOnce(input);
    const t = provider.lastTelemetry;

    if (!result.ok) {
      const row: Row = {
        fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true,
        httpStatus: t?.httpStatus ?? null, failureKind: result.kind, stopReason: t?.stopReason ?? null,
        requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
        promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
        costUsd: t?.computedCostUsd ?? null, respondedModel: t?.respondedModel ?? null,
        layerStatus: 'PROVIDER_FAILED', issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null, candidateDetail: [], clarificationDetail: [],
        score: null, r6Content: plan.role === 'R6_PRIMARY' ? scoreR6Content(null) : null,
        bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  FAILED  ${result.kind}  ${t?.httpStatus ?? ''}`);
      if (provider.stopped) console.log(`     STOPPING: ${provider.stopped}`);
      return;
    }

    if (provider.qualifiedModelIdentity !== null && result.modelIdentity !== provider.qualifiedModelIdentity) {
      console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  UNEXPECTED_MODEL_IDENTITY  `
        + `expected ${provider.qualifiedModelIdentity}, got ${String(result.modelIdentity)}`);
      const row: Row = {
        fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true,
        httpStatus: t?.httpStatus ?? null, failureKind: 'UNEXPECTED_MODEL_IDENTITY', stopReason: t?.stopReason ?? null,
        requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
        promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
        costUsd: t?.computedCostUsd ?? null, respondedModel: result.modelIdentity ?? null,
        layerStatus: 'PROVIDER_FAILED', issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null, candidateDetail: [], clarificationDetail: [],
        score: null, r6Content: null, bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      return;
    }

    const raw = result.raw as Record<string, unknown>;
    const normalized = normalizeExpertOutput(raw, input, NOW);
    const analysis = normalized.state === 'VALID' ? normalized.validated!.analysis : null;
    const score = analysis ? scoreRouting(plan.fixtureId, analysis, expectationsFor(plan.fixtureId), probesFor(plan.fixtureId)) : null;
    const r6Content = plan.role === 'R6_PRIMARY' ? scoreR6Content(analysis) : null;

    const row: Row = {
      fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true,
      httpStatus: t?.httpStatus ?? null, failureKind: null, stopReason: t?.stopReason ?? null,
      requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
      promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
      costUsd: t?.computedCostUsd ?? null, respondedModel: t?.respondedModel ?? null,
      layerStatus: normalized.state === 'VALID' ? 'PRESENT' : 'OUTPUT_REJECTED',
      issues: normalized.issues.map(i => i.code),
      counts: {
        candidates: analysis?.expertHazardCandidates.length ?? 0,
        clarifications: analysis?.decisionCriticalClarifications.length ?? 0,
        insights: analysis?.crossHazardInsights.length ?? 0,
        disagreements: analysis?.disagreements.length ?? 0,
      },
      outcome: raw.outcome ?? null,
      expertExplanation: analysis?.expertExplanation ?? raw.expertExplanation ?? null,
      uncertainty: analysis?.uncertainty ?? raw.uncertainty ?? null,
      candidateDetail: (analysis?.expertHazardCandidates ?? []).map(c => ({
        hazardFamily: c.hazardFamily, reasoning: c.reasoning, evidenceBasis: c.evidenceBasis,
        assertedConditionState: c.assertedConditionState, confidence: c.confidence,
      })),
      clarificationDetail: (analysis?.decisionCriticalClarifications ?? []).map(c => ({
        question: c.question, whyItMatters: c.whyItMatters, evidenceGap: c.evidenceGap, criticality: c.criticality,
      })),
      score, r6Content,
      bindingTotal: t?.binding?.total ?? null, bindingBound: t?.binding?.bound ?? null,
      bindingUnbindable: t?.binding?.unbindable ?? null,
    };
    rows.push(row);
    appendFileSync(LOG, JSON.stringify({ ...row, rawWire: raw }) + '\n');

    console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  HTTP ${row.httpStatus}  `
      + `${row.latencyMs}ms  in=${row.promptTokens} out=${row.outputTokens}  $${(row.costUsd ?? 0).toFixed(4)}`);
    console.log(`     cand=${row.counts.candidates} clar=${row.counts.clarifications} `
      + `ins=${row.counts.insights} dis=${row.counts.disagreements}  outcome=${row.outcome}`);
    if (row.issues.length) console.log(`     issues: ${row.issues.join(', ')}`);
    row.candidateDetail.forEach((c: any) => console.log(`     CANDIDATE  ${c.hazardFamily}: ${c.reasoning}`));
    row.clarificationDetail.forEach((c: any) => console.log(`     CLARIFY    ${c.question} (${c.evidenceGap})`));
    if (row.r6Content) console.log(`     R6 content score: ${JSON.stringify(row.r6Content)}`);
  }

  for (const plan of PRIMARY_PLAN) await runOne(plan);

  const primaryRan = rows.filter(r => r.ran);
  const primaryOk = primaryRan.filter(r => r.failureKind === null);
  const primaryCleanTransport = primaryRan.length === PRIMARY_PLAN.length && primaryOk.length === PRIMARY_PLAN.length;

  let r4Row: Row | null = null;
  if (primaryCleanTransport && !provider.stopped) {
    console.log('\n-- six primary calls completed cleanly; running optional R4 spot-check --');
    await runOne(OPTIONAL_PLAN);
    r4Row = rows.find(r => r.role === 'R4_SPOT_CHECK') ?? null;
  } else {
    console.log('\n-- six primary calls did NOT all complete cleanly; R4 spot-check NOT authorized, skipping --');
  }

  // ---------------------------------------------------------------- scoring & terminal

  const ran = rows.filter(r => r.ran);
  const ok = ran.filter(r => r.failureKind === null);
  const totalIn = ran.reduce((a, r) => a + (r.promptTokens ?? 0), 0);
  const totalOut = ran.reduce((a, r) => a + (r.outputTokens ?? 0), 0);
  const totalCost = ran.reduce((a, r) => a + (r.costUsd ?? 0), 0);
  const latencies = ran.map(r => r.latencyMs ?? 0).filter(n => n > 0).sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;

  const r6Rows = rows.filter(r => r.role === 'R6_PRIMARY');
  const t1Row = rows.find(r => r.role === 'T1_HISTORICAL_RESOLVED') ?? null;
  const t5Row = rows.find(r => r.role === 'T5_CURRENT_POSITIVE') ?? null;
  const t3Row = rows.find(r => r.role === 'T3_UNCERTAINTY_CONTROL') ?? null;

  const r6CleanCount = r6Rows.filter(r => r.r6Content?.clean === true).length;
  const R6_ALL_CLEAN = r6Rows.length === 3 && r6CleanCount === 3;

  const T1_RESOLVED_STATE_CLEAN = t1Row !== null && t1Row.failureKind === null
    && (t1Row.score?.overRouted ?? 1) === 0;

  const T5_CURRENT_HAZARD_RECALLED = t5Row !== null && t5Row.failureKind === null
    && t5Row.counts.candidates > 0;

  const CURRENT_STATE_CLARIFICATION_SURVIVED = t3Row !== null && t3Row.failureKind === null
    && t3Row.counts.clarifications > 0;

  const R4_HOSTED_CANDIDATE_SURVIVAL: 'PASS' | 'FAIL' | 'NOT_RUN' =
    r4Row === null ? 'NOT_RUN'
    : (r4Row.failureKind === null && r4Row.counts.candidates > 0) ? 'PASS' : 'FAIL';

  // grounding / boundary aggregate
  const quotesEmitted = ran.reduce((a, r) => a + (r.bindingTotal ?? 0), 0);
  const quotesBound = ran.reduce((a, r) => a + (r.bindingBound ?? 0), 0);
  const quotesUnbindable = ran.reduce((a, r) => a + (r.bindingUnbindable ?? 0), 0);
  const evidenceOutOfBoundsCount = ran.filter(r => r.issues.includes('EVIDENCE_OUT_OF_BOUNDS')).length;
  const analysesLostToEvidenceFailure = ran.filter(r => r.layerStatus === 'OUTPUT_REJECTED'
    && r.issues.includes('EVIDENCE_OUT_OF_BOUNDS')).length;
  const malformedResponses = ran.filter(r => r.issues.some(i => i.includes('MALFORMED'))).length;
  const outcomeContentInconsistencies = ran.filter(r => {
    const nonEmpty = r.counts.candidates + r.counts.clarifications + r.counts.insights + r.counts.disagreements > 0;
    if (r.outcome === 'NOTHING_TO_ADD' && nonEmpty) return true;
    if (r.outcome === 'ANALYZED' && !nonEmpty) return true;
    return false;
  }).length;

  const transportClean = ok.length === ran.length && ran.length === (r4Row ? 7 : 6);
  const anyNewMaterialDefect = malformedResponses > 0 || evidenceOutOfBoundsCount > 0
    || outcomeContentInconsistencies > 0;

  console.log('\n---------------- R6 (3 reps, no averaging) ----------------');
  r6Rows.forEach((r, i) => console.log(`  rep ${i + 1}: clean=${r.r6Content?.clean}  ${JSON.stringify(r.r6Content)}`));
  console.log(`  R6_ALL_CLEAN = ${R6_ALL_CLEAN}`);
  console.log('---------------- T1 (historical/resolved) ----------------');
  console.log(`  T1_RESOLVED_STATE_CLEAN = ${T1_RESOLVED_STATE_CLEAN}`);
  console.log('---------------- T5 (true current positive, recall) ----------------');
  console.log(`  T5_CURRENT_HAZARD_RECALLED = ${T5_CURRENT_HAZARD_RECALLED}`);
  console.log('---------------- T3 (current-state uncertainty control) ----------------');
  console.log(`  CURRENT_STATE_CLARIFICATION_SURVIVED = ${CURRENT_STATE_CLARIFICATION_SURVIVED}`);
  console.log('---------------- R4 (optional spot-check) ----------------');
  console.log(`  R4_HOSTED_CANDIDATE_SURVIVAL = ${R4_HOSTED_CANDIDATE_SURVIVAL}`);

  let terminal: string;
  if (!transportClean && ok.length === 0) {
    terminal = 'EXPERT_HAZLENZ_V5_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED';
  } else if (!T5_CURRENT_HAZARD_RECALLED) {
    terminal = 'EXPERT_HAZLENZ_V5_TEMPORAL_STATE_REPAIR_REJECTED -- CURRENT_HAZARD_RECALL_REGRESSED';
  } else if (!CURRENT_STATE_CLARIFICATION_SURVIVED) {
    terminal = 'EXPERT_HAZLENZ_V5_TEMPORAL_STATE_REPAIR_REJECTED -- DECISION_CRITICAL_CLARIFICATION_REGRESSED';
  } else if (anyNewMaterialDefect || R4_HOSTED_CANDIDATE_SURVIVAL === 'FAIL') {
    terminal = 'EXPERT_HAZLENZ_V5_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_OR_NEW_BEHAVIORAL_DEFECTS';
  } else if (!R6_ALL_CLEAN || !T1_RESOLVED_STATE_CLEAN) {
    terminal = 'EXPERT_HAZLENZ_V5_TEMPORAL_STATE_REPAIR_FAILED -- HOSTED_OVERROUTING_REMAINS';
  } else if (R6_ALL_CLEAN && T1_RESOLVED_STATE_CLEAN && T5_CURRENT_HAZARD_RECALLED
    && CURRENT_STATE_CLARIFICATION_SURVIVED && transportClean) {
    terminal = 'EXPERT_HAZLENZ_V5_TEMPORAL_STATE_HOSTED_CONFIRMATION_ACCEPTED -- EVALUATION_COHORT_AUTHORIZATION_REQUIRED';
  } else {
    terminal = 'EXPERT_HAZLENZ_V5_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_OR_NEW_BEHAVIORAL_DEFECTS';
  }

  console.log(`\nTERMINAL: ${terminal}`);
  console.log(`calls: ${provider.calls}/${MAX_HOSTED_CALLS} attempted  ${ok.length}/${ran.length} completed clean  `
    + `cost $${totalCost.toFixed(4)} of $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  if (provider.stopped) console.log(`STOPPED EARLY: ${provider.stopped}`);
  console.log('EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE   EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE');

  writeFileSync(join(OUT, 'results', 'v5-confirmation-summary.json'), JSON.stringify({
    provider: 'anthropic', modelRequested: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(ok.map(r => r.respondedModel))],
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, promptVersion: EXPERT_PROMPT_VERSION,
    systemPromptSha256: promptHash,
    determinismControl: 'NONE -- temperature/top_p/top_k removed on this model, no seed',
    callsAttempted: provider.calls, callsCompletedClean: ok.length,
    ceilingCalls: MAX_HOSTED_CALLS, ceilingCostUsd: MAX_HOSTED_COST_USD, stoppedEarly: provider.stopped,
    inputTokens: totalIn, outputTokens: totalOut, latencyP50Ms: p50,
    latencyMaxMs: latencies[latencies.length - 1] ?? null, actualCostUsd: Number(totalCost.toFixed(6)),
    r6: { rows: r6Rows, R6_ALL_CLEAN },
    t1: { row: t1Row, T1_RESOLVED_STATE_CLEAN },
    t5: { row: t5Row, T5_CURRENT_HAZARD_RECALLED },
    t3: { row: t3Row, CURRENT_STATE_CLARIFICATION_SURVIVED },
    r4SpotCheck: { row: r4Row, R4_HOSTED_CANDIDATE_SURVIVAL },
    grounding: {
      quotesEmitted, quotesBound, quotesUnbindable,
      evidenceOutOfBoundsCount, analysesLostToEvidenceFailure, malformedResponses, outcomeContentInconsistencies,
    },
    transportClean, anyNewMaterialDefect, terminal,
    EXPERT_HAZLENZ_PROVIDER_VALIDATED: false, EXPERT_HAZLENZ_CUSTOMER_ACTIVE: false,
    rows,
  }, null, 2) + '\n');

  console.log(`\nevidence written to ${OUT}`);
  process.exit(terminal.includes('ACCEPTED') ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
