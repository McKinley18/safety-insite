/**
 * §227 PHASE B -- FROZEN SINGLE-ARM HOSTED EXECUTION.
 * CEILING 10 PROVIDER CALLS / USD 1.10. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * No semantic-preference retries. No reruns. No rescue calls. No alternate provider or model. No
 * mid-run remediation. No prompt or schema change. No case change.
 *
 * Raw evidence is persisted immediately after every call, BEFORE any derivation. A malformed output
 * is preserved exactly and NEVER repaired, and a stringified structured field is never parsed.
 *
 * CONTINGENCY CALLS are spendable ONLY on a transport or HTTP failure where the call did not reach
 * inference, and every use records its exact reason in the ledger. A contingency call spent to
 * replace a semantically undesirable answer is a protocol violation.
 */
import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

{
  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  }
}

import {
  EXPERT_HOSTED_INFERENCE_CONFIG, EXPERT_TOOL_NAME, applyStrictSchemaWrapper,
  stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  MAX_PROVIDER_CALLS_227, SPEND_CEILING_USD_227, PLANNED_CALLS_227, CONTINGENCY_CALLS_227,
  CONTINGENCY_POLICY_227,
} from './lib/expert-227-hosted-instrument';
import { assemble227, type AssembledCall227 } from './lib/expert-227-assembly';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-227-hosted-semantic-capability-confirmation-2026-09-11');
const PROTO = join(EVID, 'SECTION-227-FROZEN-PROTOCOL.json');
const EXECUTOR_VERSION = 'hazlenz.expert.227.hosted-capability-execution.v1';
const FIRST_PASS_MAX_TOKENS = 4000;
const WORST_CALL_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 15 + (40_000 / 1e6) * 3;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
const write = (f: string, line: unknown): void => {
  appendFileSync(join(EVID, f), `${JSON.stringify(line)}\n`);
};

// ---- the frozen protocol must be present and unchanged
const protoText = readFileSync(PROTO, 'utf8');
const FROZEN_DIGEST = readFileSync(join(EVID, 'SECTION-227-FROZEN-PROTOCOL.sha256'), 'utf8')
  .split('  ')[0];
if (sha(protoText) !== FROZEN_DIGEST) {
  throw new Error('§227 ABORT: the frozen protocol digest moved. Nothing is transmitted.');
}
const proto = JSON.parse(protoText) as Record<string, any>;
if (proto.preSpendIntegrity?.passed !== true || proto.truthConsistencyPreflight?.passed !== true) {
  throw new Error('§227 ABORT: the frozen protocol does not record a passed preflight.');
}

// ---- the assembled calls must match the frozen per-case identities, byte for byte
const order: AssembledCall227[] = [...assemble227()];
for (const x of order) {
  const pinned = (proto.perCaseIdentities as Array<Record<string, string>>)
    .find(p => p.caseId === x.caseId);
  if (!pinned
    || pinned.instructionSha256 !== x.identities.instruction
    || pinned.userPromptSha256 !== x.identities.userPrompt
    || pinned.wireSchemaSha256 !== x.identities.schema) {
    throw new Error(`§227 ABORT: assembled call ${x.caseId} does not match the frozen identity. `
      + 'The bytes inspected before the freeze are not the bytes about to be transmitted.');
  }
}

// ---- resume ledger: a re-invocation may never re-spend a drawn call
const LEDGER = join(EVID, 'CALL-LEDGER-227.jsonl');
const drawn = new Set<string>();
let priorCalls = 0; let priorSpend = 0;
if (existsSync(LEDGER)) {
  for (const l of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as { caseId: string; costUsd: number; callKind: string };
    if (r.callKind === 'PRIMARY') drawn.add(r.caseId);
    priorCalls += 1; priorSpend += r.costUsd;
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
let callsMade = priorCalls;
let spendUsd = priorSpend;
let contingencyUsed = 0;
let stopped: string | null = null;
const contingencyLog: { caseId: string; reason: string; replacedFailureClass: string }[] = [];

interface CallOutcome {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: Record<string, unknown> | null; raw: Record<string, any>;
  inputTokens: number | null; outputTokens: number | null; costUsd: number;
  stopReason: string | null; latencyMs: number;
  providerErrorType: string | null; providerErrorMessage: string | null;
  transmittedBodyBytes: number; respondedModel: string | null;
}

async function transmit(body: Record<string, unknown>): Promise<CallOutcome> {
  const wire = JSON.stringify(body);
  if (wire.includes('cache_control')) {
    throw new Error('§227 ABORT: cache_control in the request body. Not transmitting.');
  }
  callsMade += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 180_000);
  let json: Record<string, any> = {};
  let httpStatus: number | null = null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = res.status;
    json = await res.json() as Record<string, any>;
  } catch (e) {
    json = { error: { type: 'transport', message: (e as Error).message } };
  } finally { clearTimeout(timer); }
  const latencyMs = Date.now() - started;

  const usage = json.usage as Record<string, number> | undefined;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const costUsd = (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(x => x.type === 'tool_use' && x.name === EXPERT_TOOL_NAME);
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;
  const reachedInference = (outputTokens ?? 0) > 0 || Array.isArray(json.content);
  const failureClass = httpStatus === null ? 'TRANSPORT_TRANSIENT'
    : (httpStatus === 429 || httpStatus >= 500) ? 'TRANSPORT_TRANSIENT'
      : httpStatus !== 200 ? 'TRANSPORT_STRUCTURAL'
        : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
          : parsed === null ? 'OUTPUT_UNPARSEABLE' : 'NO_FAILURE';

  return {
    httpStatus, reachedInference, failureClass, parsed, raw: json,
    inputTokens, outputTokens, costUsd,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    latencyMs,
    providerErrorType: (json?.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json?.error?.message as string | undefined) ?? null,
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    respondedModel: (json.model as string | undefined) ?? null,
  };
}

function spendGuard(): boolean {
  if (callsMade >= MAX_PROVIDER_CALLS_227) { stopped = 'CALL_CEILING_REACHED'; return false; }
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD_227) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; return false;
  }
  return true;
}

/**
 * OUTPUT-SHAPE OBSERVATION ONLY. Records the SHAPE of each structured field without parsing,
 * repairing or interpreting a malformed one. A stringified field is recorded as a string and is
 * never parsed: the frozen executor does not authorize that and §227 does not add it.
 */
function observeShape(parsed: Record<string, unknown> | null): Record<string, unknown> {
  if (parsed === null) return { parsed: false };
  const shapeOf = (v: unknown): string =>
    v === undefined ? 'ABSENT' : Array.isArray(v) ? 'ARRAY' : typeof v === 'string' ? 'STRING'
      : v === null ? 'NULL' : typeof v;
  const d = parsed.unresolvedFactDeclarations;
  const k = parsed.expertHazardCandidates;
  const q = parsed.decisionCriticalClarifications;
  return {
    parsed: true,
    declarationsShape: shapeOf(d),
    declarationCount: Array.isArray(d) ? d.length : null,
    candidatesShape: shapeOf(k),
    candidateCount: Array.isArray(k) ? k.length : null,
    clarificationsShape: shapeOf(q),
    clarificationCount: Array.isArray(q) ? q.length : null,
    uncertaintyShape: shapeOf((parsed.uncertainty as Record<string, unknown> | undefined)
      ?.statements),
    outcome: typeof parsed.outcome === 'string' ? parsed.outcome : shapeOf(parsed.outcome),
  };
}

async function draw(
  x: AssembledCall227, callKind: 'PRIMARY' | 'CONTINGENCY', contingencyReason: string | null,
): Promise<CallOutcome> {
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(x.wireSchema));
  const out = await transmit({
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: FIRST_PASS_MAX_TOKENS,
    system: x.systemPrompt,
    messages: [{ role: 'user', content: x.userPrompt }],
    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      input_schema: asSent,
    }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  });

  // RAW EVIDENCE PERSISTED BEFORE ANY DERIVATION.
  write('RAW-227.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_227', callKind, contingencyReason,
    executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
    arm: x.arm, contractVersion: x.contractVersion, caseId: x.caseId, ordinal: x.ordinal,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    instructionIdentity: x.identities.instruction,
    userPromptIdentity: x.identities.userPrompt,
    wireSchemaIdentity: x.identities.schema,
    transmittedSchemaSha256: sha(JSON.stringify(asSent)),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: out.respondedModel,
    transmittedBodyBytes: out.transmittedBodyBytes,
    cachingEnabled: false,
    httpStatus: out.httpStatus, providerErrorType: out.providerErrorType,
    providerErrorMessage: out.providerErrorMessage,
    reachedInference: out.reachedInference, stopReason: out.stopReason,
    inputTokens: out.inputTokens, outputTokens: out.outputTokens,
    costUsd: Number(out.costUsd.toFixed(6)),
    cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: out.latencyMs, failureClass: out.failureClass,
    rawPersistedBeforeDerivation: true,
    raw: out.raw, parsed: out.parsed,
    outputShape: observeShape(out.parsed),
    timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-227.jsonl', {
    callIndex: callsMade, callKind, contingencyReason, caseId: x.caseId,
    costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
    httpStatus: out.httpStatus,
  });

  const s = observeShape(out.parsed) as Record<string, any>;
  console.log(`  ${String(callsMade).padStart(2)}  ${callKind.padEnd(11)} ${x.caseId.padEnd(3)} `
    + `${out.failureClass.padEnd(18)} decls=${s.declarationsShape ?? '-'}`
    + `${s.declarationCount === null || s.declarationCount === undefined ? '' : `(${s.declarationCount})`}`
    + `  cand=${s.candidateCount ?? '-'}  clar=${s.clarificationCount ?? '-'}`
    + `  out=${out.outputTokens ?? '-'}tok  USD ${spendUsd.toFixed(4)}`);
  return out;
}

void (async () => {
  console.log(`§227 EXECUTION — ${order.length} primary calls, ceiling ${MAX_PROVIDER_CALLS_227}, `
    + `spend ceiling USD ${SPEND_CEILING_USD_227}\n`
    + `  single arm: REMEDIATED_226 · caching DISABLED · semantic-preference retries 0\n`);

  for (const x of order) {
    if (drawn.has(x.caseId)) {
      console.log(`  skip  ${x.caseId} already drawn; not re-spent`);
      continue;
    }
    if (!spendGuard()) { console.log(`  STOPPED before ${x.caseId}: ${stopped}`); break; }

    const out = await draw(x, 'PRIMARY', null);

    // CONTINGENCY: authorized ONLY where the call did not reach inference on a transport failure.
    const transportFailed = !out.reachedInference
      && (out.failureClass === 'TRANSPORT_TRANSIENT' || out.failureClass === 'TRANSPORT_STRUCTURAL');
    if (transportFailed && contingencyUsed < CONTINGENCY_CALLS_227 && spendGuard()) {
      const reason = `${CONTINGENCY_POLICY_227.authorizedReason} — observed `
        + `${out.failureClass}, httpStatus ${String(out.httpStatus)}, reachedInference false`;
      contingencyUsed += 1;
      contingencyLog.push({
        caseId: x.caseId, reason, replacedFailureClass: out.failureClass,
      });
      console.log(`      contingency ${contingencyUsed}/${CONTINGENCY_CALLS_227}: ${reason}`);
      await draw(x, 'CONTINGENCY', reason);
    }
  }

  writeFileSync(join(EVID, 'EXECUTION-SUMMARY-227.json'), `${JSON.stringify({
    artifact: 'SECTION-227-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
    plannedCalls: PLANNED_CALLS_227, callsExecuted: callsMade,
    contingencyCallsExecuted: contingencyUsed,
    contingencyCallsAuthorized: CONTINGENCY_CALLS_227,
    contingencyLog,
    ceiling: MAX_PROVIDER_CALLS_227,
    spendUsd: Number(spendUsd.toFixed(6)), spendCeilingUsd: SPEND_CEILING_USD_227,
    semanticPreferenceRetries: 0, databaseOperations: 0,
    stoppedEarly: stopped, promptChangedDuringExecution: false, schemaChanged: false,
    caseChangedAfterFreeze: false,
    malformedOutputRepaired: false, stringifiedFieldsParsed: false,
    completedAt: new Date().toISOString(),
  }, null, 2)}\n`);

  console.log(`\nCALLS ${callsMade} of ${MAX_PROVIDER_CALLS_227} `
    + `(${contingencyUsed} contingency) · SPEND USD ${spendUsd.toFixed(4)} of `
    + `${SPEND_CEILING_USD_227} · SEMANTIC-PREFERENCE RETRIES 0 · DATABASE OPERATIONS 0`
    + `${stopped ? ` · STOPPED: ${stopped}` : ''}`);
})();
