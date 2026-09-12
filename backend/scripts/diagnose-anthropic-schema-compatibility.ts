/**
 * EXPERT HAZLENZ -- §107 ISOLATED ANTHROPIC STRICT-SCHEMA COMPATIBILITY DIAGNOSTIC (2026-08-30).
 *
 * ONE HOSTED CALL, HARD-CEILINGED, NO RETRY. This file exists to answer exactly one question: does
 * Anthropic's strict tool-schema mode reject the v4 wire schema because it now carries `minLength`
 * and `minItems` (added in §105 to close the wire-schema-weaker-than-boundary defect), or is the
 * §106 transport block (7/7 HTTP 400, 136-433ms, before any generation) caused by something else?
 *
 * WHAT THIS FILE DOES NOT DO. It does not mutate the canonical wire schema
 * (`buildExpertWireSchema` in `expert-prompt.ts`) or the local-provider adapter. It builds the exact
 * production request body via the SAME `buildAnthropicRequestBody` the real probe and the real
 * adapter use, then clones it and swaps ONLY `tools[0].input_schema` for a stripped copy. Every other
 * field -- system prompt, user prompt, model, max_tokens, thinking, tool_choice, tool name,
 * description, strict flag -- is byte-identical to what production would send. Nothing here is
 * persisted as a new canonical schema; the stripped copy exists only inside this process's memory
 * for the duration of one request.
 *
 * CREDENTIAL HANDLING mirrors `anthropic-expert-provider.ts` exactly: read from
 * `process.env.ANTHROPIC_API_KEY` at call time, placed only in the `x-api-key` header, never logged,
 * never returned, never persisted. The only part of a non-2xx response body ever parsed is the
 * provider's own `error.type` and `error.message` fields -- schema-diagnostic text the provider
 * generates about OUR request, not a echo of API-key or observation content.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/** Same minimal reader as probe-expert-hosted-transport.ts, for the same reason: the credential
 *  path stays auditable in one visible place rather than resting on transitive dotenv resolution.
 *  THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED. */
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

import {
  buildAnthropicRequestBody, EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';

const MAX_HOSTED_CALLS = 1;
const MAX_HOSTED_COST_USD = 1.00;

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-anthropic-schema-diagnostic-2026-08-30');
if (existsSync(join(OUT, 'diagnostic-result.json'))) {
  console.error(`FATAL: ${OUT}/diagnostic-result.json already exists. Refusing to overwrite prior evidence.`);
  process.exit(4);
}
mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- Phase 1: build source + diagnostic schemas

const FIXTURE = ROUTING_FIXTURES.find(f => f.id === 'R2')!;
console.log(`fixture    ${FIXTURE.id}  ${FIXTURE.title}`);
console.log(`reason     non-adversarial, non-grounding, non-negative-control; produced a rich`);
console.log(`           real response under v3 (3 candidates, 4 clarifications, 2 insights)\n`);

/** Source: the exact request body production sends right now, unmodified. */
const sourceBody = buildAnthropicRequestBody(FIXTURE.input, EXPERT_HOSTED_INFERENCE_CONFIG);
const sourceSchema = (sourceBody.tools as any[])[0].input_schema;

/** Strip ONLY minLength / minItems keys, recursively. Every other key is preserved untouched. */
function stripKeys(node: unknown, keys: Set<string>): unknown {
  if (Array.isArray(node)) return node.map(v => stripKeys(v, keys));
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (keys.has(k)) continue;
      out[k] = stripKeys(v, keys);
    }
    return out;
  }
  return node;
}
const diagnosticSchema = stripKeys(JSON.parse(JSON.stringify(sourceSchema)), new Set(['minLength', 'minItems']));

// ---------------------------------------------------------------- Phase 2: deterministic diff proof

interface Diff { path: string; kind: 'REMOVED' | 'ADDED' | 'CHANGED'; key?: string; from?: unknown; to?: unknown }
function diff(a: unknown, b: unknown, path = ''): Diff[] {
  const out: Diff[] = [];
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i += 1) out.push(...diff(a[i], b[i], `${path}[${i}]`));
    return out;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ao = a as Record<string, unknown>; const bo = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
    for (const k of keys) {
      const inA = k in ao; const inB = k in bo;
      if (inA && !inB) out.push({ path, kind: 'REMOVED', key: k, from: ao[k] });
      else if (!inA && inB) out.push({ path, kind: 'ADDED', key: k, to: bo[k] });
      else out.push(...diff(ao[k], bo[k], `${path}.${k}`));
    }
    return out;
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) out.push({ path, kind: 'CHANGED', from: a, to: b });
  return out;
}
const schemaDiff = diff(sourceSchema, diagnosticSchema);
const removedMinLength = schemaDiff.filter(d => d.kind === 'REMOVED' && d.key === 'minLength').length;
const removedMinItems = schemaDiff.filter(d => d.kind === 'REMOVED' && d.key === 'minItems').length;
const unexpectedDiffs = schemaDiff.filter(d => !(d.kind === 'REMOVED' && (d.key === 'minLength' || d.key === 'minItems')));

const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const sourceHash = hash(sourceSchema);
const diagnosticHash = hash(diagnosticSchema);

console.log(`source schema hash      ${sourceHash}`);
console.log(`diagnostic schema hash  ${diagnosticHash}`);
console.log(`minLength removed       ${removedMinLength}`);
console.log(`minItems removed        ${removedMinItems}`);
console.log(`unexpected differences  ${unexpectedDiffs.length}\n`);

writeFileSync(join(OUT, 'source-schema.json'), JSON.stringify(sourceSchema, null, 2));
writeFileSync(join(OUT, 'diagnostic-schema.json'), JSON.stringify(diagnosticSchema, null, 2));
writeFileSync(join(OUT, 'schema-diff.json'), JSON.stringify(schemaDiff, null, 2));

if (unexpectedDiffs.length > 0) {
  writeFileSync(join(OUT, 'diagnostic-result.json'), JSON.stringify({
    terminal: 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_ABORTED — DIAGNOSTIC_SCHEMA_NOT_ISOLATED',
    fixture: FIXTURE.id, sourceHash, diagnosticHash, removedMinLength, removedMinItems,
    unexpectedDiffs, hostedCallsMade: 0, actualCostUsd: 0,
  }, null, 2));
  console.error('ABORTED — diagnostic schema is not cleanly isolated to minLength/minItems removal.');
  console.error('TERMINAL: EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_ABORTED — DIAGNOSTIC_SCHEMA_NOT_ISOLATED');
  process.exit(2);
}
console.log('pre-flight  diff is isolated to minLength/minItems removal only — proceeding to Phase 3\n');

// ---------------------------------------------------------------- Phase 3/4: one hosted call, no retry

const worstCaseInputTokens = Math.ceil(JSON.stringify(sourceBody).length / 3);
const worstCaseUsd = (worstCaseInputTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
  + (EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
console.log(`ceiling    ${MAX_HOSTED_CALLS} call   $${MAX_HOSTED_COST_USD.toFixed(2)}`);
console.log(`worst case $${worstCaseUsd.toFixed(4)} for this one call\n`);
if (worstCaseUsd > MAX_HOSTED_COST_USD) {
  writeFileSync(join(OUT, 'diagnostic-result.json'), JSON.stringify({
    terminal: 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_ABORTED — PROJECTED_COST_EXCEEDS_CEILING',
    fixture: FIXTURE.id, worstCaseUsd, ceilingUsd: MAX_HOSTED_COST_USD, hostedCallsMade: 0, actualCostUsd: 0,
  }, null, 2));
  console.error('ABORTED before any network call — projected cost exceeds ceiling.');
  process.exit(3);
}

const diagnosticBody: Record<string, unknown> = JSON.parse(JSON.stringify(sourceBody));
(diagnosticBody.tools as any[])[0].input_schema = diagnosticSchema;

function errorTypeAndMessage(bodyText: string): { type: string; message: string } {
  try {
    const parsed = JSON.parse(bodyText) as { error?: { type?: unknown; message?: unknown } };
    const t = parsed?.error?.type; const m = parsed?.error?.message;
    return {
      type: typeof t === 'string' ? t : 'unknown_error',
      message: typeof m === 'string' ? m : '',
    };
  } catch { return { type: 'unparseable_error_body', message: '' }; }
}

(async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const result = {
      terminal: 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_BLOCKED — PROVIDER_OR_ACCOUNT_REMEDIATION_REQUIRED',
      reason: 'ANTHROPIC_API_KEY not reachable', hostedCallsMade: 0, actualCostUsd: 0,
    };
    writeFileSync(join(OUT, 'diagnostic-result.json'), JSON.stringify(result, null, 2));
    console.error(result.terminal);
    process.exit(3);
  }

  console.log('EXECUTING THE ONE AUTHORIZED CALL. No retry, no substitute fixture, no second call.\n');
  const started = Date.now();
  let httpStatus: number | null = null;
  let requestId: string | null = null;
  let latencyMs = 0;
  let errorType: string | null = null;
  let errorMessage: string | null = null;
  let generationBegan = false;
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;
  let respondedModel: string | null = null;
  let stopReason: string | null = null;
  let normalizedCandidateCount: number | null = null;
  let normalizedClarificationCount: number | null = null;
  let normalizedInsightCount: number | null = null;
  let networkFailure: string | null = null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EXPERT_HOSTED_INFERENCE_CONFIG.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${EXPERT_HOSTED_INFERENCE_CONFIG.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
        },
        body: JSON.stringify(diagnosticBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    latencyMs = Date.now() - started;
    httpStatus = response.status;
    requestId = response.headers.get('request-id');

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const et = errorTypeAndMessage(errText);
      errorType = et.type; errorMessage = et.message;
    } else {
      generationBegan = true;
      const envelope = await response.json() as Record<string, unknown>;
      respondedModel = typeof envelope.model === 'string' ? envelope.model : null;
      stopReason = typeof envelope.stop_reason === 'string' ? envelope.stop_reason : null;
      const usage = (envelope.usage ?? {}) as Record<string, unknown>;
      inputTokens = typeof usage.input_tokens === 'number' ? usage.input_tokens : null;
      outputTokens = typeof usage.output_tokens === 'number' ? usage.output_tokens : null;
      const content = Array.isArray(envelope.content) ? envelope.content : [];
      const toolUse = content.find((c: any) => c && c.type === 'tool_use');
      if (toolUse && toolUse.input && typeof toolUse.input === 'object') {
        const wire = toolUse.input as Record<string, unknown>;
        normalizedCandidateCount = Array.isArray(wire.expertHazardCandidates) ? wire.expertHazardCandidates.length : null;
        normalizedClarificationCount = Array.isArray(wire.decisionCriticalClarifications) ? wire.decisionCriticalClarifications.length : null;
        normalizedInsightCount = Array.isArray(wire.crossHazardInsights) ? wire.crossHazardInsights.length : null;
      }
    }
  } catch (e: unknown) {
    latencyMs = Date.now() - started;
    const name = (e as { name?: string })?.name;
    networkFailure = name === 'AbortError' ? 'TIMEOUT' : `NETWORK_ERROR`;
  }

  const actualCostUsd = (inputTokens !== null && outputTokens !== null)
    ? (inputTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
      + (outputTokens / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok
    : 0;

  let terminal: string;
  if (networkFailure) {
    terminal = 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_BLOCKED — PROVIDER_OR_ACCOUNT_REMEDIATION_REQUIRED';
  } else if (httpStatus === 401 || httpStatus === 403 || httpStatus === 429 || httpStatus === 529
             || (httpStatus === 400 && /credit balance|insufficient (credit|funds)|billing/i.test(errorMessage ?? ''))) {
    terminal = 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_DIAGNOSTIC_BLOCKED — PROVIDER_OR_ACCOUNT_REMEDIATION_REQUIRED';
  } else if (generationBegan) {
    terminal = 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_COMPATIBILITY_CONFIRMED — ADAPTER_WRAPPER_REPAIR_AUTHORIZATION_REQUIRED';
  } else {
    terminal = 'EXPERT_HAZLENZ_ANTHROPIC_SCHEMA_COMPATIBILITY_NOT_CONFIRMED — FURTHER_TRANSPORT_DIAGNOSIS_REQUIRED';
  }

  const result = {
    fixture: FIXTURE.id, fixtureTitle: FIXTURE.title,
    sourceSchemaHash: sourceHash, diagnosticSchemaHash: diagnosticHash,
    minLengthRemoved: removedMinLength, minItemsRemoved: removedMinItems, unexpectedSchemaDiffs: 0,
    hostedCallsAttempted: 1, hostedCallsMade: 1,
    httpStatus, requestId, latencyMs, networkFailure,
    errorType, errorMessage,
    generationBegan, respondedModel, stopReason, inputTokens, outputTokens, actualCostUsd,
    normalizedCandidateCount, normalizedClarificationCount, normalizedInsightCount,
    terminal,
  };
  writeFileSync(join(OUT, 'diagnostic-result.json'), JSON.stringify(result, null, 2));

  console.log(`HTTP ${httpStatus ?? '—'}  latency ${latencyMs}ms  requestId ${requestId ?? '—'}`);
  console.log(`generationBegan ${generationBegan}  errorType ${errorType ?? '—'}`);
  if (errorMessage) console.log(`errorMessage ${JSON.stringify(errorMessage)}`);
  console.log(`tokens in=${inputTokens ?? '—'} out=${outputTokens ?? '—'}  cost $${actualCostUsd.toFixed(4)}`);
  if (generationBegan) {
    console.log(`normalized candidates=${normalizedCandidateCount} clarifications=${normalizedClarificationCount} insights=${normalizedInsightCount}`);
  }
  console.log(`\nTERMINAL: ${terminal}`);
})();
