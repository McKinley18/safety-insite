/**
 * EXPERT HAZLENZ -- BOUNDED HOSTED CONFIRMATION OF THE PROMPT-v6 HAZARD-ACTUALITY REPAIR (2026-08-30).
 *
 * ==================== WHAT THIS IS ====================
 *
 * §112/D-124 measured `R6` 0/3 clean against prompt v5: the hosted model promoted a removed guard
 * into an independent CURRENT `machine_guarding` candidate under a fully verified zero-energy
 * isolation, justifying `ACTIVE` only with hypotheticals it added itself. §113/D-125 built a
 * local-only (Ollama, $0.00) prompt v6 repair -- a new "A HAZARD-RELEVANT FACT IS NOT YET A CURRENT
 * HAZARD" system-prompt section -- and reached a 350/350 local acceptance matrix including an 8-fixture
 * adversarial recall hard gate. This script is the bounded hosted confirmation §113 required.
 *
 * FROZEN MEASUREMENT. No prompt, schema, or normalization change is made during or because of this
 * run, whatever it finds. The permanent adapter path is used unmodified -- no diagnostic bypass.
 *
 * MATRIX (frozen, in this exact order):
 *   1-3. R6  x3   -- primary hard gate, must be 3/3 CLEAN
 *   4.   U-A      -- controlled ancillary condition, must be clean
 *   5.   U-B      -- stopped but NOT isolated, HARD recall gate
 *   6.   U-C      -- incomplete control, danger must remain represented (silence = hard failure)
 *   7.   U-F      -- legitimate future-transition clarification, HARD clarification gate
 *   8.   T5       -- OPTIONAL recall/routing spot-check (only if the 7 primaries completed)
 *   9.   R4       -- OPTIONAL candidate-survival spot-check (only if the 7 primaries completed)
 * Absolute ceiling 9 calls. No tenth. Optional calls are NEVER used as retries.
 *
 * Run: npx ts-node scripts/probe-expert-hosted-v6-hazard-actuality-confirmation.ts
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
import { HAZARD_ACTUALITY_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/hazard-actuality-fixtures';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const MAX_HOSTED_CALLS = 9;
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
  'expert-hazlenz-v6-hazard-actuality-hosted-confirmation-2026-08-30');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
mkdirSync(join(OUT, 'preflight'), { recursive: true });
const LOG = join(OUT, 'transport', 'v6-confirmation.jsonl');
if (existsSync(LOG)) throw new Error(`refusing to overwrite existing evidence at ${LOG}`);
writeFileSync(LOG, '');

// ---------------------------------------------------------------- fixture resolution

function fixtureFor(id: string): { input: ExpertAnalysisInput; expectations: any; probes: readonly any[] } {
  const r = ROUTING_FIXTURES.find(f => f.id === id);
  if (r) return { input: r.input, expectations: r.expectations, probes: r.probes };
  const t = TEMPORAL_STATE_FIXTURES.find(f => f.id === id);
  if (t) return { input: t.input, expectations: t.expectations, probes: [] };
  const u = HAZARD_ACTUALITY_FIXTURES.find(f => f.id === id);
  if (u) return { input: u.input, expectations: u.expectations, probes: [] };
  throw new Error(`fixture ${id} not found`);
}

type Role = 'R6_PRIMARY' | 'U_A_CONTROL' | 'U_B_RECALL_GATE' | 'U_C_DANGER_GATE'
  | 'U_F_CLARIFICATION_GATE' | 'T5_OPTIONAL' | 'R4_OPTIONAL';
interface PlanItem { fixtureId: string; role: Role; rep: number; }

const PRIMARY_PLAN: PlanItem[] = [
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 1 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 2 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 3 },
  { fixtureId: 'U-A', role: 'U_A_CONTROL', rep: 1 },
  { fixtureId: 'U-B', role: 'U_B_RECALL_GATE', rep: 1 },
  { fixtureId: 'U-C', role: 'U_C_DANGER_GATE', rep: 1 },
  { fixtureId: 'U-F', role: 'U_F_CLARIFICATION_GATE', rep: 1 },
];
const OPTIONAL_PLAN: PlanItem[] = [
  { fixtureId: 'T5', role: 'T5_OPTIONAL', rep: 1 },
  { fixtureId: 'R4', role: 'R4_OPTIONAL', rep: 1 },
];
if (PRIMARY_PLAN.length + OPTIONAL_PLAN.length > MAX_HOSTED_CALLS) throw new Error('plan exceeds ceiling');

// ---------------------------------------------------------------- preflight artifact

const promptHash = createHash('sha256').update(EXPERT_SYSTEM_PROMPT).digest('hex');
const fx = (id: string) => createHash('sha256').update(JSON.stringify(fixtureFor(id).input)).digest('hex');
const preflight = {
  timestamp: NOW,
  promptVersion: EXPERT_PROMPT_VERSION,
  systemPromptSha256: promptHash,
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  fixtureHashes: Object.fromEntries(['R6', 'U-A', 'U-B', 'U-C', 'U-F', 'T5', 'R4'].map(id => [id, fx(id)])),
  hostedConfig: EXPERT_HOSTED_INFERENCE_CONFIG,
  plannedPrimaryCalls: PRIMARY_PLAN.length,
  plannedOptionalCalls: OPTIONAL_PLAN.length,
  absoluteCeiling: MAX_HOSTED_CALLS,
  costCeilingUsd: MAX_HOSTED_COST_USD,
  adapterPath: 'permanent AnthropicExpertProvider / buildAnthropicRequestBody -- no diagnostic bypass',
};

// ---------------------------------------------------------------- spend gate (pre-call)

function worstCaseUsdFor(input: ExpertAnalysisInput): number {
  const body = buildAnthropicRequestBody(input, EXPERT_HOSTED_INFERENCE_CONFIG);
  const worstCaseInputTokens = Math.ceil(JSON.stringify(body).length / 3);
  return (worstCaseInputTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
}
const projectedWorstCaseUsd = [...PRIMARY_PLAN, ...OPTIONAL_PLAN]
  .reduce((a, p) => a + worstCaseUsdFor(fixtureFor(p.fixtureId).input), 0);
(preflight as any).projectedWorstCaseUsd = Number(projectedWorstCaseUsd.toFixed(6));
writeFileSync(join(OUT, 'preflight', 'preflight.json'), JSON.stringify(preflight, null, 2) + '\n');

class BudgetedProvider extends AnthropicExpertProvider {
  calls = 0;
  spentUsd = 0;
  stopped: string | null = null;

  async analyzeOnce(input: ExpertAnalysisInput) {
    if (this.calls >= MAX_HOSTED_CALLS) {
      this.stopped = `call ceiling ${MAX_HOSTED_CALLS} reached`;
      return { ok: false as const, kind: 'NOT_CONFIGURED' as const, detail: this.stopped };
    }
    const worstCase = worstCaseUsdFor(input);
    if (this.spentUsd + worstCase > MAX_HOSTED_COST_USD) {
      this.stopped = `cost ceiling $${MAX_HOSTED_COST_USD.toFixed(2)} would be exceeded`;
      return { ok: false as const, kind: 'NOT_CONFIGURED' as const, detail: this.stopped };
    }
    this.calls += 1;
    const result = await this.analyze(input);
    this.spentUsd += this.lastTelemetry?.computedCostUsd ?? 0;
    return result;
  }
}

// ---------------------------------------------------------------- R6 content scoring

const GUARD_PATTERN = /guard|point.of.operation|pinch point|nip point/i;
const REINSTATEMENT_PATTERN = /re-?energiz|reinstall|reinstat|restor|before.*(?:restart|return|service|cycl)|back (?:on|in)/i;
const ZERO_ENERGY_PATTERN = /residual|stored energy|zero energy|bled down|verified at zero|de-?energ|lock(?:ed)?\s?out|tag/i;

interface R6Score {
  MACHINE_GUARDING_CANDIDATE_PRESENT: boolean;
  REINSTATEMENT_TIMING_CLARIFICATION_PRESENT: boolean;
  REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: boolean;
  OTHER_UNSUPPORTED_TYPED_CONTENT: boolean;
  clean: boolean;
}

function scoreR6(analysis: any | null): R6Score {
  if (!analysis) {
    return {
      MACHINE_GUARDING_CANDIDATE_PRESENT: false, REINSTATEMENT_TIMING_CLARIFICATION_PRESENT: false,
      REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: false, OTHER_UNSUPPORTED_TYPED_CONTENT: true, clean: false,
    };
  }
  let mgCandidate = false, other = false;
  for (const c of analysis.expertHazardCandidates) {
    const text = `${c.hazardFamily} ${c.reasoning} ${c.evidenceBasis}`;
    if (c.hazardFamily === 'machine_guarding' || GUARD_PATTERN.test(text)) mgCandidate = true;
    else other = true;
  }
  let reinstatement = false, zeroEnergy = false;
  for (const cl of analysis.decisionCriticalClarifications) {
    const text = `${cl.question} ${cl.whyItMatters} ${cl.evidenceGap}`;
    const isRe = REINSTATEMENT_PATTERN.test(text);
    const isZe = ZERO_ENERGY_PATTERN.test(text);
    if (isRe) reinstatement = true;
    if (isZe) zeroEnergy = true;
    if (!isRe && !isZe) other = true;
  }
  if (analysis.crossHazardInsights.length > 0) other = true;
  if (analysis.disagreements.length > 0) other = true;

  const clean = analysis.expertHazardCandidates.length === 0
    && analysis.decisionCriticalClarifications.length === 0
    && analysis.crossHazardInsights.length === 0
    && analysis.disagreements.length === 0;

  return {
    MACHINE_GUARDING_CANDIDATE_PRESENT: mgCandidate,
    REINSTATEMENT_TIMING_CLARIFICATION_PRESENT: reinstatement,
    REDUNDANT_ZERO_ENERGY_CLARIFICATION_PRESENT: zeroEnergy,
    OTHER_UNSUPPORTED_TYPED_CONTENT: other,
    clean,
  };
}

/** Which typed collections carry anything at all -- used for the "silence is failure" gates. */
function routingOf(analysis: any | null): string {
  if (!analysis) return 'NO_ANALYSIS';
  const parts: string[] = [];
  if (analysis.expertHazardCandidates.length > 0) parts.push('candidate');
  if (analysis.decisionCriticalClarifications.length > 0) parts.push('clarification');
  if (analysis.crossHazardInsights.length > 0) parts.push('insight');
  if (analysis.disagreements.length > 0) parts.push('disagreement');
  return parts.length === 0 ? 'silence' : parts.join('+');
}

interface Row {
  order: number;
  fixtureId: string; role: Role; rep: number; ran: boolean; optional: boolean;
  httpStatus: number | null; failureKind: string | null; stopReason: string | null;
  requestId: string | null; latencyMs: number | null; promptTokens: number | null;
  outputTokens: number | null; costUsd: number | null; respondedModel: string | null;
  layerStatus: string | null; normalizationState: string | null; issues: string[];
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  outcome: unknown; expertExplanation: unknown; uncertainty: unknown;
  candidateDetail: unknown[]; clarificationDetail: unknown[];
  insightDetail: unknown[]; disagreementDetail: unknown[];
  routing: string;
  score: RoutingScore | null;
  r6: R6Score | null;
  bindingTotal: number | null; bindingBound: number | null; bindingUnbindable: number | null;
}

const provider = new BudgetedProvider();
const rows: Row[] = [];
let order = 0;

(async function main() {
  console.log('EXPERT HAZLENZ -- BOUNDED HOSTED CONFIRMATION OF PROMPT v6 HAZARD-ACTUALITY REPAIR');
  console.log(`provider   anthropic   model ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
  console.log(`contract   ${EXPERT_ANALYSIS_CONTRACT_VERSION}   prompt ${EXPERT_PROMPT_VERSION}   (FROZEN THIS RUN)`);
  console.log(`thinking   ${EXPERT_HOSTED_INFERENCE_CONFIG.thinking}   maxTokens ${EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens}`);
  console.log(`system prompt sha256  ${promptHash}`);
  console.log(`ceiling    ${MAX_HOSTED_CALLS} calls   $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  console.log(`PROJECTED WORST-CASE SPEND for all ${PRIMARY_PLAN.length + OPTIONAL_PLAN.length} calls: `
    + `$${projectedWorstCaseUsd.toFixed(4)}`);

  if (projectedWorstCaseUsd > MAX_HOSTED_COST_USD) {
    console.error(`BLOCKED -- projected worst case $${projectedWorstCaseUsd.toFixed(4)} exceeds `
      + `$${MAX_HOSTED_COST_USD.toFixed(2)}. No call attempted, $0.00 spent.`);
    process.exit(3);
  }
  console.log('SPEND GATE: PASS -- proceeding.\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('BLOCKED -- ANTHROPIC_API_KEY is not reachable. No call attempted, $0.00 spent.');
    console.error('Terminal: EXPERT_HAZLENZ_V6_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED');
    process.exit(3);
  }

  async function runOne(plan: PlanItem, optional: boolean): Promise<void> {
    order += 1;
    const f = fixtureFor(plan.fixtureId);

    if (provider.stopped) {
      console.log(`  [${order}] ${plan.fixtureId} (${plan.role})  NOT RUN -- ${provider.stopped}`);
      rows.push({
        order, fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: false, optional,
        httpStatus: null, failureKind: 'STOPPED_EARLY', stopReason: null, requestId: null,
        latencyMs: null, promptTokens: null, outputTokens: null, costUsd: null, respondedModel: null,
        layerStatus: null, normalizationState: null, issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null,
        candidateDetail: [], clarificationDetail: [], insightDetail: [], disagreementDetail: [],
        routing: 'NOT_RUN', score: null, r6: null,
        bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      });
      return;
    }

    const result = await provider.analyzeOnce(f.input);
    const t = provider.lastTelemetry;

    if (!result.ok) {
      const row: Row = {
        order, fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true, optional,
        httpStatus: t?.httpStatus ?? null, failureKind: result.kind, stopReason: t?.stopReason ?? null,
        requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
        promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
        costUsd: t?.computedCostUsd ?? null, respondedModel: t?.respondedModel ?? null,
        layerStatus: 'PROVIDER_FAILED', normalizationState: null, issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null,
        candidateDetail: [], clarificationDetail: [], insightDetail: [], disagreementDetail: [],
        routing: 'PROVIDER_FAILED',
        score: null, r6: plan.role === 'R6_PRIMARY' ? scoreR6(null) : null,
        bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      console.log(`  [${order}] ${plan.fixtureId} (${plan.role})  FAILED  ${result.kind}  ${t?.httpStatus ?? ''}`);
      if (provider.stopped) console.log(`     STOPPING: ${provider.stopped}`);
      return;
    }

    if (provider.qualifiedModelIdentity !== null && result.modelIdentity !== provider.qualifiedModelIdentity) {
      console.log(`  [${order}] ${plan.fixtureId} (${plan.role})  UNEXPECTED_MODEL_IDENTITY  `
        + `expected ${provider.qualifiedModelIdentity}, got ${String(result.modelIdentity)}`);
      const row: Row = {
        order, fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true, optional,
        httpStatus: t?.httpStatus ?? null, failureKind: 'UNEXPECTED_MODEL_IDENTITY', stopReason: t?.stopReason ?? null,
        requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
        promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
        costUsd: t?.computedCostUsd ?? null, respondedModel: result.modelIdentity ?? null,
        layerStatus: 'PROVIDER_FAILED', normalizationState: null, issues: [],
        counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, expertExplanation: null, uncertainty: null,
        candidateDetail: [], clarificationDetail: [], insightDetail: [], disagreementDetail: [],
        routing: 'PROVIDER_FAILED', score: null, r6: null,
        bindingTotal: null, bindingBound: null, bindingUnbindable: null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      return;
    }

    const raw = result.raw as Record<string, unknown>;
    const normalized = normalizeExpertOutput(raw, f.input, NOW);
    const analysis = normalized.state === 'VALID' ? normalized.validated!.analysis : null;
    const score = analysis ? scoreRouting(plan.fixtureId, analysis, f.expectations, f.probes) : null;

    const row: Row = {
      order, fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: true, optional,
      httpStatus: t?.httpStatus ?? null, failureKind: null, stopReason: t?.stopReason ?? null,
      requestId: t?.requestId ?? null, latencyMs: t?.latencyMs ?? null,
      promptTokens: t?.promptTokens ?? null, outputTokens: t?.outputTokens ?? null,
      costUsd: t?.computedCostUsd ?? null, respondedModel: t?.respondedModel ?? null,
      layerStatus: normalized.state === 'VALID' ? 'PRESENT' : 'OUTPUT_REJECTED',
      normalizationState: normalized.state,
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
      candidateDetail: (analysis?.expertHazardCandidates ?? []).map((c: any) => ({
        hazardFamily: c.hazardFamily, assertedConditionState: c.assertedConditionState,
        confidence: c.confidence, reasoning: c.reasoning, evidenceBasis: c.evidenceBasis,
      })),
      clarificationDetail: (analysis?.decisionCriticalClarifications ?? []).map((c: any) => ({
        question: c.question, whyItMatters: c.whyItMatters, evidenceGap: c.evidenceGap,
        criticality: c.criticality, affectedDecision: c.affectedDecision,
      })),
      insightDetail: (analysis?.crossHazardInsights ?? []).map((i: any) => ({
        interactionKind: i.interactionKind, participants: i.participants, reasoning: i.reasoning,
      })),
      disagreementDetail: (analysis?.disagreements ?? []).map((d: any) => ({
        surface: d.surface, disagreementType: d.disagreementType, reasoning: d.reasoning,
      })),
      routing: routingOf(analysis),
      score,
      r6: plan.role === 'R6_PRIMARY' ? scoreR6(analysis) : null,
      bindingTotal: t?.binding?.total ?? null, bindingBound: t?.binding?.bound ?? null,
      bindingUnbindable: t?.binding?.unbindable ?? null,
    };
    rows.push(row);
    appendFileSync(LOG, JSON.stringify({ ...row, rawWire: raw }) + '\n');

    console.log(`  [${order}] ${plan.fixtureId} (${plan.role})  HTTP ${row.httpStatus}  `
      + `${row.latencyMs}ms  in=${row.promptTokens} out=${row.outputTokens}  $${(row.costUsd ?? 0).toFixed(4)}`);
    console.log(`     state=${row.normalizationState}  cand=${row.counts.candidates} clar=${row.counts.clarifications} `
      + `ins=${row.counts.insights} dis=${row.counts.disagreements}  routing=${row.routing}  outcome=${row.outcome}`);
    if (row.issues.length) console.log(`     issues: ${row.issues.join(', ')}`);
    row.candidateDetail.forEach((c: any) => console.log(`     CANDIDATE  [${c.hazardFamily}/${c.assertedConditionState}] ${c.reasoning}`));
    row.clarificationDetail.forEach((c: any) => console.log(`     CLARIFY    ${c.question}`));
    row.insightDetail.forEach((i: any) => console.log(`     INSIGHT    ${i.reasoning}`));
    if (row.r6) console.log(`     R6 score: ${JSON.stringify(row.r6)}`);
  }

  console.log('---------------- PRIMARY MATRIX (7 calls) ----------------');
  for (const plan of PRIMARY_PLAN) await runOne(plan, false);

  const primaryRan = rows.filter(r => r.ran && !r.optional);
  const primaryOk = primaryRan.filter(r => r.failureKind === null);
  const primariesComplete = primaryRan.length === PRIMARY_PLAN.length && primaryOk.length === PRIMARY_PLAN.length;

  if (primariesComplete && !provider.stopped) {
    console.log('\n---------------- OPTIONAL SPOT-CHECKS (2 calls) ----------------');
    for (const plan of OPTIONAL_PLAN) await runOne(plan, true);
  } else {
    console.log('\n-- primary matrix did NOT complete cleanly; optional spot-checks NOT authorized, skipping --');
  }

  // ---------------------------------------------------------------- gates

  const ran = rows.filter(r => r.ran);
  const ok = ran.filter(r => r.failureKind === null);
  const totalIn = ran.reduce((a, r) => a + (r.promptTokens ?? 0), 0);
  const totalOut = ran.reduce((a, r) => a + (r.outputTokens ?? 0), 0);
  const totalCost = ran.reduce((a, r) => a + (r.costUsd ?? 0), 0);
  const latencies = ran.map(r => r.latencyMs ?? 0).filter(n => n > 0).sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;

  const r6Rows = rows.filter(r => r.role === 'R6_PRIMARY');
  const uaRow = rows.find(r => r.role === 'U_A_CONTROL') ?? null;
  const ubRow = rows.find(r => r.role === 'U_B_RECALL_GATE') ?? null;
  const ucRow = rows.find(r => r.role === 'U_C_DANGER_GATE') ?? null;
  const ufRow = rows.find(r => r.role === 'U_F_CLARIFICATION_GATE') ?? null;
  const t5Row = rows.find(r => r.role === 'T5_OPTIONAL') ?? null;
  const r4Row = rows.find(r => r.role === 'R4_OPTIONAL') ?? null;

  const r6CleanCount = r6Rows.filter(r => r.r6?.clean === true).length;
  const R6_ALL_CLEAN = r6Rows.length === 3 && r6CleanCount === 3;

  // U-A: controlled ancillary condition must NOT become an unsupported current hazard.
  const U_A_HAZARD_ACTUALITY_CONTROL: 'PASS' | 'FAIL' =
    uaRow !== null && uaRow.failureKind === null
      && uaRow.counts.candidates === 0 && uaRow.counts.clarifications === 0 ? 'PASS' : 'FAIL';

  // U-B: HARD recall gate. Danger must survive; the fixture expects a candidate, and a merely
  // stopped machine must not be treated as isolated. Recorded both ways, gated on danger surviving.
  const U_B_CURRENT_HAZARD_RECALL: 'PASS' | 'FAIL' =
    ubRow !== null && ubRow.failureKind === null && ubRow.routing !== 'silence' ? 'PASS' : 'FAIL';
  const U_B_CANDIDATE_SURVIVED = (ubRow?.counts.candidates ?? 0) > 0;

  // U-C: danger must remain represented somewhere typed. Silence is a hard failure.
  const U_C_DANGER_PRESERVED: 'PASS' | 'FAIL' =
    ucRow !== null && ucRow.failureKind === null && ucRow.routing !== 'silence' ? 'PASS' : 'FAIL';

  // U-F: HARD clarification gate.
  const U_F_CLARIFICATION_PRESERVED: 'PASS' | 'FAIL' =
    ufRow !== null && ufRow.failureKind === null && ufRow.counts.clarifications > 0 ? 'PASS' : 'FAIL';

  const T5_DANGER_REPRESENTED: 'PASS' | 'FAIL' | 'NOT_RUN' =
    t5Row === null ? 'NOT_RUN'
      : (t5Row.failureKind === null && t5Row.routing !== 'silence') ? 'PASS' : 'FAIL';

  const R4_HOSTED_CANDIDATE_SURVIVAL: 'PASS' | 'FAIL' | 'NOT_RUN' =
    r4Row === null ? 'NOT_RUN'
      : (r4Row.failureKind === null && r4Row.counts.candidates > 0) ? 'PASS' : 'FAIL';

  // ---------------------------------------------------------------- grounding / boundary accounting

  const groundingOpportunities = ran.reduce((a, r) => a + r.counts.candidates, 0);
  const quotesEmitted = ran.reduce((a, r) => a + (r.bindingTotal ?? 0), 0);
  const quotesBound = ran.reduce((a, r) => a + (r.bindingBound ?? 0), 0);
  const quotesUnbindable = ran.reduce((a, r) => a + (r.bindingUnbindable ?? 0), 0);
  const evidenceOutOfBounds = ran.reduce((a, r) => a + r.issues.filter(i => i === 'EVIDENCE_OUT_OF_BOUNDS').length, 0);
  const analysisLevelRejections = ran.filter(r => r.normalizationState === 'REJECTED').length;
  const itemLevelRejections = ran.filter(r => r.normalizationState === 'VALID')
    .reduce((a, r) => a + r.issues.length, 0);
  const malformedResponses = ran.reduce((a, r) => a + r.issues.filter(i => i.includes('MALFORMED')).length, 0);
  const outcomeContentInconsistencies = ran.filter(r => {
    if (r.normalizationState !== 'VALID') return false;
    const nonEmpty = r.counts.candidates + r.counts.clarifications + r.counts.insights + r.counts.disagreements > 0;
    if (r.outcome === 'NOTHING_TO_ADD' && nonEmpty) return true;
    if (r.outcome === 'ANALYZED' && !nonEmpty) return true;
    return false;
  }).length;
  const explanationOnlyLosses = ran.reduce((a, r) => a + (r.score?.explanationOnlyLosses.length ?? 0), 0);
  const routingTotals = ran.reduce((acc, r) => {
    if (!r.score) return acc;
    acc.opportunities += r.score.opportunities; acc.hits += r.score.hits;
    acc.misses += r.score.misses; acc.overRouted += r.score.overRouted;
    return acc;
  }, { opportunities: 0, hits: 0, misses: 0, overRouted: 0 });

  const transportClean = ran.length > 0 && ok.length === ran.length;
  const anyNewMaterialDefect = malformedResponses > 0 || evidenceOutOfBounds > 0
    || outcomeContentInconsistencies > 0 || analysisLevelRejections > 0;

  console.log('\n================ GATES ================');
  console.log('---- R6 (3 reps, no averaging) ----');
  r6Rows.forEach((r, i) => console.log(`  rep ${i + 1}: clean=${r.r6?.clean}  ${JSON.stringify(r.r6)}`));
  console.log(`  R6_ALL_CLEAN = ${R6_ALL_CLEAN}  (${r6CleanCount}/3)`);
  console.log(`---- U_A_HAZARD_ACTUALITY_CONTROL = ${U_A_HAZARD_ACTUALITY_CONTROL}  (routing=${uaRow?.routing})`);
  console.log(`---- U_B_CURRENT_HAZARD_RECALL   = ${U_B_CURRENT_HAZARD_RECALL}  (routing=${ubRow?.routing}, candidateSurvived=${U_B_CANDIDATE_SURVIVED})`);
  console.log(`---- U_C_DANGER_PRESERVED        = ${U_C_DANGER_PRESERVED}  (routing=${ucRow?.routing})`);
  console.log(`---- U_F_CLARIFICATION_PRESERVED = ${U_F_CLARIFICATION_PRESERVED}  (routing=${ufRow?.routing})`);
  console.log(`---- T5_DANGER_REPRESENTED       = ${T5_DANGER_REPRESENTED}  (routing=${t5Row?.routing ?? 'n/a'})`);
  console.log(`---- R4_HOSTED_CANDIDATE_SURVIVAL= ${R4_HOSTED_CANDIDATE_SURVIVAL}  (routing=${r4Row?.routing ?? 'n/a'})`);

  console.log('\n---- GROUNDING / BOUNDARY ----');
  console.log(`  groundingOpportunities=${groundingOpportunities} quotesEmitted=${quotesEmitted} `
    + `exactlyBound=${quotesBound} unbindable=${quotesUnbindable}`);
  console.log(`  EVIDENCE_OUT_OF_BOUNDS=${evidenceOutOfBounds} itemLevelRejections=${itemLevelRejections} `
    + `analysisLevelRejections=${analysisLevelRejections}`);
  console.log(`  malformed=${malformedResponses} outcomeContentInconsistencies=${outcomeContentInconsistencies} `
    + `explanationOnlyLosses=${explanationOnlyLosses}`);
  console.log(`  routing: opp=${routingTotals.opportunities} hits=${routingTotals.hits} `
    + `misses=${routingTotals.misses} overRouted=${routingTotals.overRouted}`);

  // ---------------------------------------------------------------- terminal

  let terminal: string;
  if (ok.length === 0) {
    terminal = 'EXPERT_HAZLENZ_V6_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED';
  } else if (U_B_CURRENT_HAZARD_RECALL === 'FAIL' || U_C_DANGER_PRESERVED === 'FAIL'
    || T5_DANGER_REPRESENTED === 'FAIL' || R4_HOSTED_CANDIDATE_SURVIVAL === 'FAIL') {
    terminal = 'EXPERT_HAZLENZ_V6_HAZARD_ACTUALITY_REPAIR_REJECTED -- CURRENT_HAZARD_RECALL_REGRESSED';
  } else if (U_F_CLARIFICATION_PRESERVED === 'FAIL') {
    terminal = 'EXPERT_HAZLENZ_V6_HAZARD_ACTUALITY_REPAIR_REJECTED -- LEGITIMATE_CLARIFICATION_REGRESSED';
  } else if (anyNewMaterialDefect) {
    terminal = 'EXPERT_HAZLENZ_V6_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_OR_NEW_BEHAVIORAL_DEFECTS';
  } else if (!R6_ALL_CLEAN || U_A_HAZARD_ACTUALITY_CONTROL === 'FAIL') {
    terminal = 'EXPERT_HAZLENZ_V6_HAZARD_ACTUALITY_REPAIR_FAILED -- HOSTED_OVERROUTING_REMAINS';
  } else if (!transportClean) {
    terminal = 'EXPERT_HAZLENZ_V6_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED';
  } else {
    terminal = 'EXPERT_HAZLENZ_V6_HAZARD_ACTUALITY_HOSTED_CONFIRMATION_ACCEPTED -- EVALUATION_COHORT_AUTHORIZATION_REQUIRED';
  }

  console.log(`\nTERMINAL: ${terminal}`);
  console.log(`calls: ${provider.calls}/${MAX_HOSTED_CALLS} attempted  ${ok.length}/${ran.length} completed clean`);
  console.log(`spend: projected worst case $${projectedWorstCaseUsd.toFixed(4)}  actual $${totalCost.toFixed(6)} of $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  console.log(`tokens: in=${totalIn} out=${totalOut}   latency p50=${p50}ms max=${latencies[latencies.length - 1] ?? null}ms`);
  if (provider.stopped) console.log(`STOPPED EARLY: ${provider.stopped}`);
  console.log('EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE   EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE');

  writeFileSync(join(OUT, 'results', 'v6-confirmation-summary.json'), JSON.stringify({
    preflight,
    provider: 'anthropic', modelRequested: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(ok.map(r => r.respondedModel))],
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, promptVersion: EXPERT_PROMPT_VERSION,
    systemPromptSha256: promptHash,
    determinismControl: 'NONE -- temperature/top_p/top_k removed on this model, no seed',
    callsPlanned: PRIMARY_PLAN.length + OPTIONAL_PLAN.length,
    callsAttempted: provider.calls, callsCompletedClean: ok.length,
    ceilingCalls: MAX_HOSTED_CALLS, ceilingCostUsd: MAX_HOSTED_COST_USD,
    projectedWorstCaseUsd: Number(projectedWorstCaseUsd.toFixed(6)),
    actualCostUsd: Number(totalCost.toFixed(6)),
    inputTokens: totalIn, outputTokens: totalOut,
    latencyP50Ms: p50, latencyMaxMs: latencies[latencies.length - 1] ?? null,
    latencyPerCall: rows.filter(r => r.ran).map(r => ({ order: r.order, fixtureId: r.fixtureId, latencyMs: r.latencyMs })),
    stoppedEarly: provider.stopped,
    gates: {
      R6_ALL_CLEAN, r6CleanCount, r6Rows,
      U_A_HAZARD_ACTUALITY_CONTROL, uaRow,
      U_B_CURRENT_HAZARD_RECALL, U_B_CANDIDATE_SURVIVED, ubRow,
      U_C_DANGER_PRESERVED, ucRouting: ucRow?.routing ?? null, ucRow,
      U_F_CLARIFICATION_PRESERVED, ufRow,
      T5_DANGER_REPRESENTED, t5Row,
      R4_HOSTED_CANDIDATE_SURVIVAL, r4Row,
    },
    groundingBoundary: {
      groundingOpportunities, quotesEmitted, quotesExactlyBound: quotesBound,
      quotesUnbindable, quotesFabricated: quotesUnbindable,
      evidenceOutOfBounds, itemLevelRejections, analysisLevelRejections,
      malformedResponses, outcomeContentInconsistencies, explanationOnlyLosses,
    },
    routingTotals,
    transportClean, anyNewMaterialDefect, terminal,
    EXPERT_HAZLENZ_PROVIDER_VALIDATED: false, EXPERT_HAZLENZ_CUSTOMER_ACTIVE: false,
    rows,
  }, null, 2) + '\n');

  console.log(`\nevidence written to ${OUT}`);
  process.exit(terminal.includes('ACCEPTED') ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
