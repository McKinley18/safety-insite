/**
 * §219 PHASE B -- FROZEN FINAL STRUCTURED VERIFIER CONFIRMATION EXECUTION.
 * HOSTED. MAXIMUM 5 VERIFIER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * No retries. No second draws. No rescue calls. No alternate model. No alternate provider. No
 * first-pass calls. No governed-stage calls. No remediation. The frozen digest is verified before
 * anything is transmitted, and raw output is persisted before any derivation.
 *
 * CALL A1 IS ALSO THE SUCCESSOR-SCHEMA CANARY. If it is rejected BEFORE inference the WHOLE run
 * stops, the schema is not shrunk, nothing is retried, and A2-A5 are not executed.
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
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { VERIFIER_TOOL_NAME } from './lib/expert-208b-verifier-recovery';
import {
  MAX_VERIFIER_CALLS_219, SPEND_CEILING_USD_219, SCHEMA_CANARY_219, TERMINALS_219,
} from './lib/expert-219-structured-confirmation-instrument';
import { assemble219 } from './lib/expert-219-assembly';
import { scoreCall219, gateOccurrenceCounts219 } from './lib/expert-219-scoring';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-219-final-structured-verifier-confirmation-2026-09-10');
const PREREG = join(EVID, 'CONFIRMATION-PREREGISTRATION-219.json');
const FROZEN_DIGEST = '491bf18a1094c99c22a80719001c207c7d72e92c1f547086284b3331d5918d56';

const EXECUTOR_VERSION = 'hazlenz.expert.219.final-structured-confirmation-execution.v1';
const VERIFIER_MAX_TOKENS = 4000;
/** Worst case for the guard: the full output allowance plus a generous input allowance. */
const WORST_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (15_000 / 1e6) * 2;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
const write = (f: string, line: unknown): void => {
  appendFileSync(join(EVID, f), `${JSON.stringify(line)}\n`);
};

// ================================================================ PREFLIGHT

console.log('§219 PHASE B PREFLIGHT — nothing is transmitted until every check passes\n');
const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
const pf = (id: string, ok: boolean, detail = ''): void => {
  checks.push({ id, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`);
};

const preregBytes = readFileSync(PREREG, 'utf8');
pf('frozen §219 digest', sha(preregBytes) === FROZEN_DIGEST, sha(preregBytes));

const prereg = JSON.parse(preregBytes);
const A = assemble219();
pf('assembly reproduces the frozen call set',
  A.failures.length === 0 && A.built.length === MAX_VERIFIER_CALLS_219
  && A.built.every((b, i) => b.identities.userPrompt === prereg.plannedCalls[i].userPromptSha256
    && b.factKey === prereg.plannedCalls[i].factKey
    && b.declarationId === prereg.plannedCalls[i].declarationId),
  'five user-prompt identities, five fact keys and five declaration ids match the freeze');
pf('§218 instruction identity matches the freeze',
  A.built[0].identities.instruction === prereg.identities.instructionSha256);
pf('§218 schema identity matches the freeze',
  A.built[0].identities.schema === prereg.identities.toolSchemaSha256);
pf('execution order is the frozen order',
  A.built.map(b => b.caseId).join(',') === prereg.executionOrder
    .map((s: { caseId: string }) => s.caseId).join(','),
  A.built.map(b => b.caseId).join(','));
pf('api key present', typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY as string).length > 10);
pf('no strict flag and no cache_control in any tool block',
  A.built.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')
    && !JSON.stringify(b.toolBlock).includes('cache_control')));
pf('the canary is call A1', SCHEMA_CANARY_219.canaryCall === A.built[0].caseId);

if (checks.some(c => !c.ok)) {
  console.log('\n§219 PREFLIGHT FAILED. PROVIDER CALLS = 0. Nothing was transmitted.');
  process.exit(1);
}
writeFileSync(join(EVID, 'PREFLIGHT-219.json'), JSON.stringify({
  executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
  digestVerified: true, checks,
  callCeiling: MAX_VERIFIER_CALLS_219, spendCeilingUsd: SPEND_CEILING_USD_219,
  worstCaseCallUsd: Number(WORST_CALL_USD.toFixed(6)),
  retriesAuthorized: 0, databaseOperations: 0, cachingPosture: 'DISABLED',
  requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
}, null, 2) + '\n');
console.log(`\n  PREFLIGHT PASSED. ${A.built.length} frozen calls. ceiling `
  + `${MAX_VERIFIER_CALLS_219} calls / USD ${SPEND_CEILING_USD_219}\n`);

// ================================================================ EXECUTION

const apiKey = process.env.ANTHROPIC_API_KEY as string;
let callsMade = 0;
let spendUsd = 0;
let stopped: string | null = null;
let canaryOutcome: string = 'NOT_YET_EXERCISED';

type Built = (typeof A.built)[number];

async function providerCall(b: Built): Promise<Record<string, any>> {
  if (callsMade >= MAX_VERIFIER_CALLS_219) throw new Error('§219 HARD CALL CEILING reached');
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD_219) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED';
    throw new Error(`§219 SPEND CEILING USD ${SPEND_CEILING_USD_219} would be exceeded `
      + `(spent ${spendUsd.toFixed(4)}, worst case ${WORST_CALL_USD.toFixed(4)}). Stopping the `
      + 'WHOLE run for spend review; no favourable subset is executed and no frozen coverage is '
      + 'cut.');
  }
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: VERIFIER_MAX_TOKENS,
    system: b.systemPrompt,
    messages: [{ role: 'user', content: b.userPrompt }],
    tools: [b.toolBlock],
    tool_choice: { type: 'tool', name: VERIFIER_TOOL_NAME },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);
  if (wire.includes('"strict"') || wire.includes('cache_control')) {
    throw new Error('§219 ABORT: forbidden field in the request body. Not transmitting.');
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
    ?.find(x => x.type === 'tool_use');
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;
  const reachedInference = (outputTokens ?? 0) > 0 || Array.isArray(json.content);
  const failureClass = httpStatus === null ? 'TRANSPORT_TRANSIENT'
    : httpStatus !== 200 ? 'TRANSPORT_STRUCTURAL'
      : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
        : parsed === null ? 'OUTPUT_UNPARSEABLE' : 'NO_FAILURE';

  // RAW EVIDENCE PERSISTED BEFORE ANY DERIVATION.
  const record = {
    callIndex: callsMade,
    recordKind: 'RAW_VERIFIER_CALL_219',
    executorVersion: EXECUTOR_VERSION,
    frozenDigest: FROZEN_DIGEST,
    caseId: b.caseId,
    ordinal: b.ordinal,
    targetFactKey: b.factKey,
    declarationId: b.declarationId,
    instructionIdentity: b.identities.instruction,
    userPromptIdentity: b.identities.userPrompt,
    toolSchemaIdentity: b.identities.schema,
    toolName: VERIFIER_TOOL_NAME,
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: (json.model as string | undefined) ?? null,
    cachingEnabled: false,
    httpStatus,
    providerErrorType: (json?.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json?.error?.message as string | undefined) ?? null,
    reachedInference,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens: usage?.cache_creation_input_tokens ?? null,
    cacheReadInputTokens: usage?.cache_read_input_tokens ?? null,
    costUsd,
    cumulativeSpendUsd: spendUsd,
    latencyMs,
    failureClass,
    rawPersistedBeforeDerivation: true,
    raw: json,
    parsed,
    timestamp: new Date().toISOString(),
  };
  write('RAW-VERIFIER-219.jsonl', record);
  write('CALL-LEDGER-219.jsonl', {
    callIndex: callsMade, caseId: b.caseId, declarationId: b.declarationId, httpStatus,
    reachedInference, failureClass, inputTokens, outputTokens, costUsd,
    cumulativeSpendUsd: spendUsd, stopReason: record.stopReason, latencyMs,
  });
  return record;
}

/**
 * The canary rule, applied to A1 only. A pre-inference rejection stops the WHOLE run. It is
 * classified separately from semantic behaviour and never scored as one.
 */
function canaryVerdict(rec: Record<string, any>): { stop: boolean; outcome: string } {
  if (rec.reachedInference === true) return { stop: false, outcome: 'REACHED_INFERENCE' };
  if (rec.httpStatus === null) {
    return { stop: true, outcome: 'PRE_INFERENCE_TRANSPORT_TRANSIENT_NOT_SCHEMA_ATTRIBUTABLE' };
  }
  const t = String(rec.providerErrorType ?? '');
  const m = String(rec.providerErrorMessage ?? '').toLowerCase();
  const schemaAttributable = rec.httpStatus === 400 || t === 'invalid_request_error'
    || m.includes('schema') || m.includes('grammar') || m.includes('tool');
  return {
    stop: true,
    outcome: schemaAttributable
      ? 'PRE_INFERENCE_REJECTION_STRUCTURALLY_ATTRIBUTABLE_TO_THE_SUCCESSOR_SCHEMA'
      : 'PRE_INFERENCE_REJECTION_NOT_SCHEMA_ATTRIBUTABLE',
  };
}

void (async () => {
  console.log('EXECUTION\n');
  for (const b of A.built) {
    let rec: Record<string, any>;
    try {
      rec = await providerCall(b);
    } catch (e) {
      console.log(`  STOPPED before call ${callsMade + 1}: ${(e as Error).message}`);
      stopped = stopped ?? 'EXECUTION_GUARD';
      break;
    }
    const tag = rec.failureClass === 'NO_FAILURE' ? 'ok  ' : 'FAIL';
    console.log(`  ${tag}  call ${rec.callIndex}  ${b.caseId}/${b.declarationId}`
      + `  http=${rec.httpStatus}  in=${rec.inputTokens} out=${rec.outputTokens}`
      + `  $${(rec.costUsd as number).toFixed(4)}  cum=$${(rec.cumulativeSpendUsd as number).toFixed(4)}`
      + `  ${rec.failureClass}`);

    if (b.caseId === SCHEMA_CANARY_219.canaryCall) {
      const v = canaryVerdict(rec);
      canaryOutcome = v.outcome;
      if (v.stop) {
        stopped = 'SCHEMA_CANARY_STOP';
        console.log(`\n  SCHEMA CANARY STOP — ${v.outcome}`);
        console.log('  No retry. The schema is not shrunk. A2-A5 are not executed.');
        console.log(`  ${TERMINALS_219.canaryFailed}`);
        break;
      }
    }
  }

  writeFileSync(join(EVID, 'EXECUTION-SUMMARY-219.json'), JSON.stringify({
    executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
    callsAuthorized: MAX_VERIFIER_CALLS_219, callsAttempted: callsMade,
    spendCeilingUsd: SPEND_CEILING_USD_219,
    cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    projectedSpendUsd: prereg.projectedSpendUsd,
    stopped, retriesUsed: 0, databaseOperations: 0,
    schemaCanaryOutcome: canaryOutcome,
    cachingPosture: 'DISABLED', completedAt: new Date().toISOString(),
  }, null, 2) + '\n');
  console.log(`\nCALLS ${callsMade}/${MAX_VERIFIER_CALLS_219}   SPEND $${spendUsd.toFixed(4)}/`
    + `$${SPEND_CEILING_USD_219}   CANARY ${canaryOutcome}`
    + `   STOPPED: ${stopped ?? 'no — cohort complete'}`);

  // ---------------- Deterministic validation and the frozen scorer, AFTER persistence.
  const rows = readFileSync(join(EVID, 'RAW-VERIFIER-219.jsonl'), 'utf8').trim().split('\n')
    .map(l => JSON.parse(l));
  const scores = rows.map(r => scoreCall219({
    caseId: r.caseId,
    declarationId: r.declarationId,
    targetFactKey: r.targetFactKey,
    reachedInference: r.reachedInference,
    failureClass: r.failureClass,
    parsed: r.parsed,
  }));
  for (const s of scores) write('CONTRACT-VALIDATION-219.jsonl', s);

  const counts = gateOccurrenceCounts219(scores);
  writeFileSync(join(EVID, 'GATE-OCCURRENCES-219.json'), JSON.stringify({
    frozenDigest: FROZEN_DIGEST,
    perGateOccurrenceCounts: counts,
    aggregatePercentageReported: false,
    gatesPendingHumanAdjudication: [...new Set(scores.flatMap(s => s.pendingHumanAdjudication))],
    machineVerdictByCase: Object.fromEntries(scores.map(s => [s.caseId, s.machineVerdict])),
  }, null, 2) + '\n');

  console.log('\nDETERMINISTIC VALIDATION AND FROZEN SCORING');
  for (const s of scores) {
    console.log(`  ${s.caseId}  role=${s.observed.propertySemanticRole}`
      + `  validity=${s.observed.propertyValidity}  verdict=${s.observed.verdict}`
      + `  decl=${s.observed.declaration}  route=${s.deterministic.propertyRoute}`
      + `  admitted=${s.deterministic.admitted}  machine=${s.machineVerdict}`
      + `  gates=${s.gateOccurrences.map(g => g.gate).join('/') || 'none'}`);
  }
  console.log('\nPER-GATE OCCURRENCES:', JSON.stringify(counts));
  console.log('PENDING HUMAN ADJUDICATION:',
    [...new Set(scores.flatMap(s => s.pendingHumanAdjudication))].join(', ') || 'none');
})();
