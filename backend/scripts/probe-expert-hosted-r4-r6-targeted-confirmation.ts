/**
 * EXPERT HAZLENZ -- TARGETED HOSTED CONFIRMATION FOR R4 (HG10) AND R6 (HG12) ONLY (2026-08-31).
 *
 * ==================== WHAT THIS IS AND IS NOT ====================
 *
 * This is NOT the frozen `probe:expert-hosted-transport` (which covers all seven routing
 * fixtures plus both grounding fixtures) and it does not modify that script. §109/D-121
 * established, at $0.00, that neither R4 nor R6 reproduces against the local provider across 13
 * combined repetitions, and that R4 has a proven offline structural mechanism (the Anthropic-only
 * minLength/minItems compatibility strip) while R6 has none. Local diagnosis is now exhausted --
 * the only way forward on the open question ("were section 108's two hosted failures stable
 * defects or one-off draws from a provider with no temperature/seed control?") is a hosted call.
 * This script makes the minimum number of them.
 *
 * PLAN: R4 x3, R6 x3, plus ONE stable control fixture (R5 / HG11, chosen because it passed
 * cleanly on BOTH the v3 and v4 hosted runs -- the most reliable available signal that a failure
 * is fixture-specific rather than general provider degradation). 7 calls total, matching the
 * authorization's planned ceiling of 6 primary + 1 optional control.
 *
 * Uses the REAL, PERMANENT adapter path (`AnthropicExpertProvider`, `buildAnthropicRequestBody`)
 * completely unmodified -- no schema change, no prompt change, no normalization change. This
 * script is additive only.
 *
 * ==================== WHY THIS SCRIPT CALLS `provider.analyze()` DIRECTLY, NOT `runExpertAnalysis` ====================
 *
 * `runExpertAnalysis` retries once on a transport-shaped failure. That is correct for the
 * customer path and for the frozen 7/8-fixture probe, where a spare call is budgeted for exactly
 * that. This authorization's own text says the opposite for THIS operation: "if the provider
 * begins returning transport/schema errors, stop rather than burning the remaining calls" and "no
 * eighth call." So each repetition here is ONE attempt, no retry -- calling `provider.analyze()`
 * directly and running `normalizeExpertOutput()` on the result gives the identical outcome
 * `runExpertAnalysis` would for a call that succeeds at the transport level (which is the case
 * this script exists to measure), while keeping the call budget exact. It also exposes the RAW
 * pre-normalization wire object, which `runExpertAnalysis` does not return on a REJECTED
 * normalization -- and the R4 taxonomy below needs that to name the exact empty/invalid field.
 *
 * Run: npx ts-node scripts/probe-expert-hosted-r4-r6-targeted-confirmation.ts
 */
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG, buildAnthropicRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { scoreRouting, type RoutingScore } from '../src/hazlenz/expert-hazlenz/expert-routing-metrics';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const MAX_HOSTED_CALLS = 7;
const MAX_HOSTED_COST_USD = 3.00;
const NOW = '2026-08-31T00:00:00.000Z';

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
  'expert-hazlenz-r4-r6-targeted-hosted-confirmation-2026-08-31');
mkdirSync(join(OUT, 'transport'), { recursive: true });
mkdirSync(join(OUT, 'results'), { recursive: true });
const LOG = join(OUT, 'transport', 'targeted-confirmation.jsonl');
writeFileSync(LOG, '');

const byId = (id: string) => {
  const f = ROUTING_FIXTURES.find(x => x.id === id);
  if (!f) throw new Error(`fixture ${id} not found`);
  return f;
};

interface PlanItem { fixtureId: string; role: 'R4_PRIMARY' | 'R6_PRIMARY' | 'CONTROL'; rep: number; }
const PLAN: PlanItem[] = [
  { fixtureId: 'R4', role: 'R4_PRIMARY', rep: 1 },
  { fixtureId: 'R4', role: 'R4_PRIMARY', rep: 2 },
  { fixtureId: 'R4', role: 'R4_PRIMARY', rep: 3 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 1 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 2 },
  { fixtureId: 'R6', role: 'R6_PRIMARY', rep: 3 },
  { fixtureId: 'R5', role: 'CONTROL', rep: 1 },
];
if (PLAN.length > MAX_HOSTED_CALLS) throw new Error('plan exceeds call ceiling');

// ---------------------------------------------------------------- spend ceiling, pre-flight

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

const CONFINED_SPACE_PATTERN = /confined space|permit.required|entrapment|asphyxiat|oxygen deficien/i;

/** Field-by-field replay of the boundary's own candidate-shape check -- names the exact field. */
function explainCandidateShape(item: unknown): string[] {
  const reasons: string[] = [];
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return ['not an object'];
  const c = item as Record<string, unknown>;
  const nonEmpty = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  if (!nonEmpty(c.candidateKey)) reasons.push(`candidateKey=${JSON.stringify(c.candidateKey)}`);
  if (!nonEmpty(c.evidenceBasis)) reasons.push(`evidenceBasis=${JSON.stringify(c.evidenceBasis)}`);
  if (!nonEmpty(c.reasoning)) reasons.push(`reasoning=${JSON.stringify(c.reasoning)}`);
  if (typeof c.confidence !== 'string') reasons.push(`confidence=${JSON.stringify(c.confidence)}`);
  if (typeof c.relationshipToDeterministic !== 'string') {
    reasons.push(`relationshipToDeterministic=${JSON.stringify(c.relationshipToDeterministic)}`);
  }
  if (typeof c.requiresUserConfirmation !== 'boolean') {
    reasons.push(`requiresUserConfirmation=${JSON.stringify(c.requiresUserConfirmation)}`);
  }
  return reasons;
}

type R4Classification =
  | 'R4_CANDIDATE_SURVIVED' | 'R4_MODEL_OMITTED_CANDIDATE' | 'R4_EMPTY_REQUIRED_FIELD'
  | 'R4_UNDERPOPULATED_COLLECTION' | 'R4_OTHER_STRUCTURED_MALFORMATION' | 'R4_EXPLANATION_ONLY_LOSS'
  | 'TRANSPORT_FAILURE';

function classifyR4(raw: Record<string, unknown> | null, normalized: ReturnType<typeof normalizeExpertOutput> | null): {
  classification: R4Classification; malformedFieldDetail: string[];
} {
  if (!raw || !normalized) return { classification: 'TRANSPORT_FAILURE', malformedFieldDetail: [] };
  const rawCandidates = Array.isArray(raw.expertHazardCandidates) ? raw.expertHazardCandidates : [];
  const afterCount = normalized.state === 'VALID' ? normalized.validated!.analysis.expertHazardCandidates.length : 0;
  if (afterCount > 0) return { classification: 'R4_CANDIDATE_SURVIVED', malformedFieldDetail: [] };

  if (rawCandidates.length === 0) {
    const explanationRaw = raw.expertExplanation as Record<string, unknown> | null | undefined;
    const summary = explanationRaw && typeof explanationRaw.summary === 'string' ? explanationRaw.summary : '';
    const uncertaintyRaw = raw.uncertainty as { statements?: unknown } | null | undefined;
    const statements = Array.isArray(uncertaintyRaw?.statements) ? uncertaintyRaw!.statements as string[] : [];
    if (CONFINED_SPACE_PATTERN.test(summary) || statements.some(s => CONFINED_SPACE_PATTERN.test(s))) {
      return { classification: 'R4_EXPLANATION_ONLY_LOSS', malformedFieldDetail: [] };
    }
    return { classification: 'R4_MODEL_OMITTED_CANDIDATE', malformedFieldDetail: [] };
  }

  const shapeIssues = rawCandidates.flatMap(explainCandidateShape);
  if (shapeIssues.length > 0) {
    return { classification: 'R4_EMPTY_REQUIRED_FIELD', malformedFieldDetail: shapeIssues };
  }
  const codes = normalized.issues.map(i => i.code);
  if (codes.includes('INSIGHT_INSUFFICIENT_PARTICIPANTS')) {
    return { classification: 'R4_UNDERPOPULATED_COLLECTION', malformedFieldDetail: codes };
  }
  return { classification: 'R4_OTHER_STRUCTURED_MALFORMATION', malformedFieldDetail: codes };
}

type R6ItemClass = 'unsupported candidate' | 'unnecessary clarification' | 'generic insight'
  | 'speculative disagreement' | 'other over-routing';

function classifyR6Items(raw: Record<string, unknown> | null): Array<{ collection: string; index: number; exactText: string; class: R6ItemClass }> {
  if (!raw) return [];
  const out: Array<{ collection: string; index: number; exactText: string; class: R6ItemClass }> = [];
  const cand = Array.isArray(raw.expertHazardCandidates) ? raw.expertHazardCandidates : [];
  const clar = Array.isArray(raw.decisionCriticalClarifications) ? raw.decisionCriticalClarifications : [];
  const ins = Array.isArray(raw.crossHazardInsights) ? raw.crossHazardInsights : [];
  const dis = Array.isArray(raw.disagreements) ? raw.disagreements : [];
  cand.forEach((c: unknown, i: number) => {
    const item = (c ?? {}) as Record<string, unknown>;
    out.push({ collection: 'expertHazardCandidates', index: i,
      exactText: `${String(item.hazardFamily)} / ${String(item.evidenceBasis)}`, class: 'unsupported candidate' });
  });
  clar.forEach((c: unknown, i: number) => {
    const item = (c ?? {}) as Record<string, unknown>;
    out.push({ collection: 'decisionCriticalClarifications', index: i,
      exactText: String(item.question), class: 'unnecessary clarification' });
  });
  ins.forEach((c: unknown, i: number) => {
    const item = (c ?? {}) as Record<string, unknown>;
    out.push({ collection: 'crossHazardInsights', index: i,
      exactText: String(item.reasoning), class: 'generic insight' });
  });
  dis.forEach((c: unknown, i: number) => {
    const item = (c ?? {}) as Record<string, unknown>;
    out.push({ collection: 'disagreements', index: i,
      exactText: String(item.reasoning), class: 'speculative disagreement' });
  });
  return out;
}

interface Row {
  fixtureId: string; role: string; rep: number; ran: boolean;
  httpStatus: number | null; failureKind: string | null; stopReason: string | null;
  requestId: string | null; latencyMs: number | null; promptTokens: number | null;
  outputTokens: number | null; costUsd: number | null; respondedModel: string | null;
  layerStatus: string | null; issues: string[];
  counts: { candidates: number; clarifications: number; insights: number; disagreements: number };
  outcome: unknown;
  score: RoutingScore | null;
  r4: { classification: R4Classification; malformedFieldDetail: string[] } | null;
  r6Items: Array<{ collection: string; index: number; exactText: string; class: R6ItemClass }> | null;
}

const provider = new BudgetedProvider();
const rows: Row[] = [];

(async function main() {
  console.log('EXPERT HAZLENZ -- TARGETED HOSTED CONFIRMATION (R4 x3, R6 x3, R5 control x1)');
  console.log(`provider   anthropic   model ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
  console.log(`contract   ${EXPERT_ANALYSIS_CONTRACT_VERSION}   prompt ${EXPERT_PROMPT_VERSION}   (UNCHANGED)`);
  console.log(`ceiling    ${MAX_HOSTED_CALLS} calls   $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  console.log(`planned    ${PLAN.length} calls\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('BLOCKED -- ANTHROPIC_API_KEY is not reachable. No call attempted, $0.00 spent.');
    console.error('Terminal: EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED');
    process.exit(3);
  }

  for (const plan of PLAN) {
    const f = byId(plan.fixtureId);

    if (provider.stopped) {
      console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  NOT RUN -- ${provider.stopped}`);
      rows.push({
        fixtureId: plan.fixtureId, role: plan.role, rep: plan.rep, ran: false,
        httpStatus: null, failureKind: 'STOPPED_EARLY', stopReason: null, requestId: null,
        latencyMs: null, promptTokens: null, outputTokens: null, costUsd: null, respondedModel: null,
        layerStatus: null, issues: [], counts: { candidates: 0, clarifications: 0, insights: 0, disagreements: 0 },
        outcome: null, score: null, r4: null, r6Items: null,
      });
      continue;
    }

    const result = await provider.analyzeOnce(f.input);
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
        outcome: null, score: null,
        r4: plan.role === 'R4_PRIMARY' ? classifyR4(null, null) : null,
        r6Items: plan.role === 'R6_PRIMARY' ? [] : null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  FAILED  ${result.kind}  ${t?.httpStatus ?? ''}`);
      if (provider.stopped) console.log(`     STOPPING: ${provider.stopped}`);
      continue;
    }

    // Unexpected-model-identity check, replicated inline since this script bypasses runExpertAnalysis.
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
        outcome: null, score: null, r4: null, r6Items: null,
      };
      rows.push(row);
      appendFileSync(LOG, JSON.stringify(row) + '\n');
      continue;
    }

    const raw = result.raw as Record<string, unknown>;
    const normalized = normalizeExpertOutput(raw, f.input, NOW);
    const analysis = normalized.state === 'VALID' ? normalized.validated!.analysis : null;
    const score = analysis ? scoreRouting(f.id, analysis, f.expectations, f.probes) : null;

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
      score,
      r4: plan.role === 'R4_PRIMARY' ? classifyR4(raw, normalized) : null,
      r6Items: plan.role === 'R6_PRIMARY' ? classifyR6Items(raw) : null,
    };
    rows.push(row);
    appendFileSync(LOG, JSON.stringify({ ...row, rawWire: raw }) + '\n');

    console.log(`  ${plan.fixtureId} #${plan.rep} (${plan.role})  HTTP ${row.httpStatus}  `
      + `${row.latencyMs}ms  in=${row.promptTokens} out=${row.outputTokens}  $${(row.costUsd ?? 0).toFixed(4)}`);
    console.log(`     cand=${row.counts.candidates} clar=${row.counts.clarifications} `
      + `ins=${row.counts.insights} dis=${row.counts.disagreements}  outcome=${row.outcome}`);
    if (row.issues.length) console.log(`     issues: ${row.issues.join(', ')}`);
    if (row.r4) console.log(`     R4 classification: ${row.r4.classification}`
      + (row.r4.malformedFieldDetail.length ? `  [${row.r4.malformedFieldDetail.join(', ')}]` : ''));
    if (row.r6Items && row.r6Items.length > 0) {
      for (const it of row.r6Items) console.log(`     OVER-ROUTED  ${it.collection}[${it.index}] (${it.class})  "${it.exactText}"`);
    }
  }

  // ---------------------------------------------------------------- totals & decision rules

  const ran = rows.filter(r => r.ran);
  const ok = ran.filter(r => r.failureKind === null);
  const totalIn = ran.reduce((a, r) => a + (r.promptTokens ?? 0), 0);
  const totalOut = ran.reduce((a, r) => a + (r.outputTokens ?? 0), 0);
  const totalCost = ran.reduce((a, r) => a + (r.costUsd ?? 0), 0);
  const latencies = ran.map(r => r.latencyMs ?? 0).filter(n => n > 0).sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;

  const r4Rows = rows.filter(r => r.role === 'R4_PRIMARY');
  const r6Rows = rows.filter(r => r.role === 'R6_PRIMARY');
  const controlRows = rows.filter(r => r.role === 'CONTROL');

  const r4Survived = r4Rows.filter(r => r.r4?.classification === 'R4_CANDIDATE_SURVIVED').length;
  const r4SameSignatureAsD121 = r4Rows.filter(r =>
    r.r4?.classification === 'R4_EMPTY_REQUIRED_FIELD'
    && r.issues.includes('CANDIDATE_MALFORMED') && r.issues.includes('EXPLANATION_MALFORMED')).length;
  const r4Verdict =
    r4Survived === r4Rows.length && r4Rows.length > 0 ? 'R4_HOSTED_FAILURE_NOT_REPRODUCED'
    : r4SameSignatureAsD121 > 0 ? 'R4_HOSTED_FAILURE_REPRODUCED'
    : r4Rows.some(r => r.r4 && r.r4.classification !== 'R4_CANDIDATE_SURVIVED') ? 'R4_HOSTED_FAILURE_CHANGED'
    : 'R4_INCONCLUSIVE_TRANSPORT_FAILURE';

  const r6TotalOverRouted = r6Rows.reduce((a, r) => a + (r.r6Items?.length ?? 0), 0);
  const r6CleanReps = r6Rows.filter(r => (r.r6Items?.length ?? 0) === 0).length;
  const r6Verdict =
    r6CleanReps === r6Rows.length && r6Rows.length > 0 ? 'R6_HOSTED_OVERROUTING_NOT_REPRODUCED'
    : r6TotalOverRouted > 0 ? 'R6_HOSTED_OVERROUTING_REPRODUCED'
    : 'R6_INCONCLUSIVE_TRANSPORT_FAILURE';

  const r6OverRoutedCollections = [...new Set(r6Rows.flatMap(r => (r.r6Items ?? []).map(i => i.collection)))];

  const controlOk = controlRows.length > 0 && controlRows.every(r =>
    r.failureKind === null && r.counts.candidates > 0 && r.counts.clarifications > 0 && r.counts.insights > 0);

  const anyNewDefect = ran.some(r =>
    r.failureKind !== null && r.failureKind !== 'STOPPED_EARLY'
    && !['PROVIDER_FAILED'].includes(r.layerStatus ?? ''));

  console.log('\n---------------- R4 VERDICT ----------------');
  console.log(`  ${r4Survived}/${r4Rows.length} survived   verdict=${r4Verdict}`);
  console.log('---------------- R6 VERDICT ----------------');
  console.log(`  ${r6CleanReps}/${r6Rows.length} clean   total over-routed items=${r6TotalOverRouted}   `
    + `collections=${r6OverRoutedCollections.join(', ') || 'none'}   verdict=${r6Verdict}`);
  console.log('---------------- CONTROL (R5/HG11) ----------------');
  console.log(`  ok=${controlOk}   rows=${JSON.stringify(controlRows.map(r => r.counts))}`);

  let terminal: string;
  if (ok.length === 0) {
    terminal = 'EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_BLOCKED -- HOSTED_PROVIDER_OR_TRANSPORT_REMEDIATION_REQUIRED';
  } else if (r4Verdict === 'R4_HOSTED_FAILURE_REPRODUCED' && r6Verdict === 'R6_HOSTED_OVERROUTING_REPRODUCED') {
    terminal = 'EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_HOSTED_BEHAVIOR_DEFECTS_REMAIN';
  } else if (anyNewDefect) {
    terminal = 'EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_HOSTED_BEHAVIOR_DEFECTS_REMAIN';
  } else if (r4Verdict === 'R4_HOSTED_FAILURE_REPRODUCED' || r4Verdict === 'R4_HOSTED_FAILURE_CHANGED') {
    terminal = 'EXPERT_HAZLENZ_R4_HOSTED_MALFORMATION_CONFIRMED -- ANTHROPIC_OUTPUT_GUARDRAIL_DECISION_REQUIRED';
  } else if (r6Verdict === 'R6_HOSTED_OVERROUTING_REPRODUCED') {
    terminal = 'EXPERT_HAZLENZ_R6_HOSTED_OVERROUTING_CONFIRMED -- HOSTED_NEGATIVE_CONTROL_REPAIR_REQUIRED';
  } else if (r4Verdict === 'R4_HOSTED_FAILURE_NOT_REPRODUCED' && r6Verdict === 'R6_HOSTED_OVERROUTING_NOT_REPRODUCED') {
    terminal = 'EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_ACCEPTED -- EVALUATION_COHORT_AUTHORIZATION_REQUIRED';
  } else {
    terminal = 'EXPERT_HAZLENZ_TARGETED_HOSTED_CONFIRMATION_FAILED -- MULTIPLE_HOSTED_BEHAVIOR_DEFECTS_REMAIN';
  }

  console.log(`\nTERMINAL: ${terminal}`);
  console.log(`calls: ${provider.calls}/${MAX_HOSTED_CALLS} attempted  ${ok.length}/${ran.length} completed clean  `
    + `cost $${totalCost.toFixed(4)} of $${MAX_HOSTED_COST_USD.toFixed(2)}`);
  if (provider.stopped) console.log(`STOPPED EARLY: ${provider.stopped}`);
  console.log('EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE   EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE');

  writeFileSync(join(OUT, 'results', 'targeted-confirmation-summary.json'), JSON.stringify({
    provider: 'anthropic', modelRequested: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    modelResponded: [...new Set(ok.map(r => r.respondedModel))],
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION, promptVersion: EXPERT_PROMPT_VERSION,
    determinismControl: 'NONE -- temperature/top_p/top_k removed on this model, no seed',
    callsAttempted: provider.calls, callsCompletedClean: ok.length,
    ceilingCalls: MAX_HOSTED_CALLS, ceilingCostUsd: MAX_HOSTED_COST_USD, stoppedEarly: provider.stopped,
    inputTokens: totalIn, outputTokens: totalOut, latencyP50Ms: p50,
    latencyMaxMs: latencies[latencies.length - 1] ?? null, actualCostUsd: Number(totalCost.toFixed(6)),
    r4: { rows: r4Rows, survived: r4Survived, total: r4Rows.length, verdict: r4Verdict },
    r6: {
      rows: r6Rows, cleanReps: r6CleanReps, total: r6Rows.length,
      totalOverRoutedItems: r6TotalOverRouted, overRoutedCollections: r6OverRoutedCollections, verdict: r6Verdict,
    },
    control: { rows: controlRows, ok: controlOk },
    anyNewDefect, terminal,
    EXPERT_HAZLENZ_PROVIDER_VALIDATED: false, EXPERT_HAZLENZ_CUSTOMER_ACTIVE: false,
    rows,
  }, null, 2) + '\n');

  process.exit(terminal.includes('ACCEPTED') ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
