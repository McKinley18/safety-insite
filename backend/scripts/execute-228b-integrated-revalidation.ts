/**
 * §228B — EXECUTE the frozen §228A targeted integrated revalidation.
 *
 * 14 primary calls, 16 maximum, hard ceiling USD 1.23, 0 database operations.
 *
 * No semantic-preference retries. No reruns. No rescue calls. No alternate provider or model. No
 * output repair. A contingency call is spendable ONLY for a transport, HTTP or never-reached-
 * inference failure, and its reason is recorded.
 *
 * The executor REFUSES TO TRANSMIT unless every assembled call matches the identity §228A pinned.
 * The bytes inspected before the freeze are the bytes transmitted after it.
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
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { INTEGRATED_CASES_228A } from './lib/expert-228a-integrated-instrument';
import {
  assembleFirstPass228B, assembleVerifierFor228B, ASSEMBLY_228B_VERSION,
  type AssembledFirstPass228B,
} from './lib/expert-228b-assembly';

const EXECUTOR_VERSION = 'hazlenz.expert.228b.integrated-execution.v1';
const FROZEN_DIGEST = '4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc';
const PRIMARY_CALLS = 14;
const MAX_CALLS = 16;
const SPEND_CEILING_USD = 1.23;
const FIRST_PASS_MAX_TOKENS = 4000;
const VERIFIER_MAX_TOKENS = 4000;
const WORST_CALL_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 10 + (40_000 / 1e6) * 2;

const A28A = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228a-integrated-revalidation-instrument-2026-09-11');
const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228-targeted-integrated-revalidation-2026-09-11');
mkdirSync(EVID, { recursive: true });

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => {
  appendFileSync(join(EVID, f), JSON.stringify(o) + '\n');
};

// ================================================================ pre-spend identity

const FILES = ['SECTION-228A-INSTRUMENT.json', 'SECTION-228A-TRUTH-PREFLIGHT.json',
  'SECTION-228A-COVERAGE-MAP.json', 'SECTION-228A-CALL-PLAN.json',
  'SECTION-228A-FROZEN-PROTOCOL.json'];
const docs = FILES.map(f => [f, JSON.parse(readFileSync(join(A28A, f), 'utf8'))] as const);
const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
if (packageDigest !== FROZEN_DIGEST) {
  throw new Error(`§228B ABORT: package digest ${packageDigest} is not the authorized frozen digest`);
}
const frozen = docs.find(([n]) => n === 'SECTION-228A-FROZEN-PROTOCOL.json')![1] as any;
const plan = docs.find(([n]) => n === 'SECTION-228A-CALL-PLAN.json')![1] as any;
if (plan.exactPrimaryCallCount !== PRIMARY_CALLS || plan.maximumAuthorizedCalls !== MAX_CALLS) {
  throw new Error('§228B ABORT: the frozen call plan does not match the authorized limits');
}

const firstPass: AssembledFirstPass228B[] = [...assembleFirstPass228B()];
for (const x of firstPass) {
  const p = (frozen.identity.perCase as Array<Record<string, string>>)
    .find(y => y.caseId === x.caseId);
  if (!p || p.systemPromptDigest !== x.identities.systemPrompt
    || p.userPromptDigest !== x.identities.userPrompt
    || p.wireSchemaDigest !== x.identities.wireSchema) {
    throw new Error(`§228B ABORT: assembled first pass ${x.caseId} does not match its frozen `
      + 'identity. The bytes inspected before the freeze are not the bytes about to be transmitted.');
  }
}

// ================================================================ resume ledger

const LEDGER = join(EVID, 'CALL-LEDGER-228.jsonl');
const drawn = new Set<string>();
let callsMade = 0; let spendUsd = 0;
if (existsSync(LEDGER)) {
  for (const l of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as { key: string; costUsd: number; callKind: string };
    if (r.callKind === 'PRIMARY') drawn.add(r.key);
    callsMade += 1; spendUsd += r.costUsd;
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
if (!apiKey) throw new Error('§228B ABORT: no ANTHROPIC_API_KEY');
let contingencyUsed = 0;
let stopped: string | null = null;
const contingencyLog: { key: string; reason: string; replacedFailureClass: string }[] = [];

interface CallOutcome {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: Record<string, unknown> | null; raw: Record<string, any>;
  inputTokens: number | null; outputTokens: number | null; costUsd: number;
  stopReason: string | null; latencyMs: number;
  providerErrorType: string | null; providerErrorMessage: string | null;
  transmittedBodyBytes: number; respondedModel: string | null;
}

async function transmit(body: Record<string, unknown>, toolName: string): Promise<CallOutcome> {
  const wire = JSON.stringify(body);
  if (wire.includes('cache_control')) {
    throw new Error('§228B ABORT: cache_control in the request body. Not transmitting.');
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
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = res.status;
    json = await res.json() as Record<string, any>;
  } catch (e) {
    clearTimeout(timer);
    return {
      httpStatus, reachedInference: false, failureClass: 'TRANSPORT_FAILURE',
      parsed: null, raw: { transportError: String(e) },
      inputTokens: null, outputTokens: null, costUsd: 0, stopReason: null,
      latencyMs: Date.now() - started, providerErrorType: 'transport',
      providerErrorMessage: String(e), transmittedBodyBytes: wire.length, respondedModel: null,
    };
  }
  clearTimeout(timer);

  const inputTokens = (json.usage?.input_tokens as number | undefined) ?? null;
  const outputTokens = (json.usage?.output_tokens as number | undefined) ?? null;
  const costUsd = (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(x => x.type === 'tool_use' && x.name === toolName);
  const parsed = (block?.input as Record<string, unknown> | undefined) ?? null;
  const failureClass = httpStatus !== 200 ? 'HTTP_FAILURE'
    : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
      : parsed === null ? 'NO_TOOL_USE_BLOCK' : 'NO_FAILURE';

  return {
    httpStatus, reachedInference: httpStatus === 200 && json.content !== undefined,
    failureClass, parsed, raw: json, inputTokens, outputTokens, costUsd,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    latencyMs: Date.now() - started,
    providerErrorType: (json.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json.error?.message as string | undefined) ?? null,
    transmittedBodyBytes: wire.length,
    respondedModel: (json.model as string | undefined) ?? null,
  };
}

function guard(): boolean {
  if (callsMade >= MAX_CALLS) { stopped = 'CALL_CEILING_REACHED'; return false; }
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; return false;
  }
  return true;
}

/** A contingency call is authorized ONLY for these. Never for a semantic outcome. */
const CONTINGENCY_ELIGIBLE = new Set(['TRANSPORT_FAILURE', 'HTTP_FAILURE']);

function shapeOf(v: unknown): 'ARRAY' | 'STRING' | 'ABSENT' | 'OTHER' {
  if (v === undefined || v === null) return 'ABSENT';
  if (Array.isArray(v)) return 'ARRAY';
  if (typeof v === 'string') return 'STRING';
  return 'OTHER';
}

// ================================================================ legs

async function drawFirstPass(
  x: AssembledFirstPass228B, kind: 'PRIMARY' | 'CONTINGENCY', reason: string | null,
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
  }, EXPERT_TOOL_NAME);

  write('RAW-228-FIRST-PASS.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_228', callKind: kind,
    contingencyReason: reason, executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_228B_VERSION, frozenDigest: FROZEN_DIGEST,
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    systemPromptIdentity: x.identities.systemPrompt,
    userPromptIdentity: x.identities.userPrompt,
    wireSchemaIdentity: x.identities.wireSchema,
    transmittedSchemaSha256: sha(JSON.stringify(asSent)),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
    transmittedBodyBytes: out.transmittedBodyBytes, cachingEnabled: false,
    httpStatus: out.httpStatus, providerErrorType: out.providerErrorType,
    providerErrorMessage: out.providerErrorMessage,
    reachedInference: out.reachedInference, stopReason: out.stopReason,
    inputTokens: out.inputTokens, outputTokens: out.outputTokens,
    costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: out.latencyMs, failureClass: out.failureClass,
    rawPersistedBeforeDerivation: true, outputRepaired: false,
    raw: out.raw, parsed: out.parsed,
    timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-228.jsonl', {
    callIndex: callsMade, key: `FP:${x.caseId}`, leg: 'FIRST_PASS', callKind: kind,
    contingencyReason: reason, caseId: x.caseId,
    costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
    httpStatus: out.httpStatus,
  });

  const d = out.parsed?.unresolvedFactDeclarations;
  console.log(`  ${String(callsMade).padStart(2)} FP  ${kind.padEnd(11)} ${x.caseId} `
    + `${out.failureClass.padEnd(18)} decls=${shapeOf(d)}`
    + `${Array.isArray(d) ? `(${d.length})` : ''}  out=${out.outputTokens ?? '-'}tok  `
    + `USD ${spendUsd.toFixed(4)}`);
  return out;
}

// ================================================================ run

void (async () => {
  console.log(`§228B EXECUTION — frozen ${FROZEN_DIGEST.slice(0, 16)}…`);
  console.log(`${PRIMARY_CALLS} primary, ${MAX_CALLS} max, ceiling USD ${SPEND_CEILING_USD}\n`);
  console.log('LEG 1 — FIRST PASS');

  const fpByCase = new Map<string, CallOutcome>();
  for (const x of firstPass) {
    if (drawn.has(`FP:${x.caseId}`)) { console.log(`  -- FP ${x.caseId} already drawn`); continue; }
    if (!guard()) break;
    let out = await drawFirstPass(x, 'PRIMARY', null);
    if (CONTINGENCY_ELIGIBLE.has(out.failureClass) && contingencyUsed < 2 && guard()) {
      const replaced = out.failureClass;
      contingencyUsed += 1;
      contingencyLog.push({ key: `FP:${x.caseId}`, reason: replaced, replacedFailureClass: replaced });
      out = await drawFirstPass(x, 'CONTINGENCY', replaced);
    }
    fpByCase.set(x.caseId, out);
  }

  console.log('\nLEG 2 — VERIFIER');
  const vfByCase = new Map<string, CallOutcome>();
  const verifierAssembly: Record<string, unknown> = {};
  for (const c of INTEGRATED_CASES_228A) {
    if (c.verifierCalls === 0) {
      console.log(`  -- VF ${c.caseId} ELIDED (frozen): ${c.verifierCallElidedBecause?.slice(0, 60)}…`);
      verifierAssembly[c.caseId] = { elided: true, frozen: true,
        reason: c.verifierCallElidedBecause };
      continue;
    }
    const fp = fpByCase.get(c.caseId);
    if (!fp || fp.parsed === null) {
      console.log(`  -- VF ${c.caseId} NOT_EXERCISED — no usable first-pass output`);
      verifierAssembly[c.caseId] = { elided: true, frozen: false,
        reason: 'NO_USABLE_FIRST_PASS_OUTPUT' };
      continue;
    }
    const asm = assembleVerifierFor228B(c.caseId, fp.parsed);
    verifierAssembly[c.caseId] = {
      elided: asm.built.length === 0,
      reason: asm.built.length === 0 ? 'NO_ADMITTED_DECLARATION' : null,
      refused: asm.refused, projectionCodes: asm.projectionCodes,
      admittedCount: asm.admittedFacts.length,
      identities: asm.built[0]?.identities ?? null,
    };
    write('VERIFIER-ASSEMBLY-228.jsonl', { caseId: c.caseId, ...verifierAssembly[c.caseId] as object });
    if (asm.built.length === 0) {
      console.log(`  -- VF ${c.caseId} NOT_EXERCISED — nothing admitted to review`);
      continue;
    }
    if (!guard()) break;

    const v = asm.built[0];
    const out = await transmit({
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      max_tokens: VERIFIER_MAX_TOKENS,
      system: v.systemPrompt,
      messages: [{ role: 'user', content: v.userPrompt }],
      tools: [{ name: v.toolBlock.name, description: v.toolBlock.description,
        input_schema: stripAnthropicUnsupportedKeywords(
          applyStrictSchemaWrapper(v.toolBlock.input_schema as Record<string, unknown>)) }],
      tool_choice: { type: 'tool', name: v.toolBlock.name },
      thinking: { type: 'disabled' },
    }, v.toolBlock.name);

    write('RAW-228-VERIFIER.jsonl', {
      callIndex: callsMade, recordKind: 'RAW_VERIFIER_228', callKind: 'PRIMARY',
      executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
      caseId: c.caseId, declarationId: v.declarationId, factKey: v.factKey,
      instructionIdentity: v.identities.instruction, userPromptIdentity: v.identities.userPrompt,
      schemaIdentity: v.identities.schema,
      requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
      httpStatus: out.httpStatus, reachedInference: out.reachedInference,
      stopReason: out.stopReason, inputTokens: out.inputTokens, outputTokens: out.outputTokens,
      costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
      latencyMs: out.latencyMs, failureClass: out.failureClass,
      rawPersistedBeforeDerivation: true, outputRepaired: false,
      raw: out.raw, parsed: out.parsed, timestamp: new Date().toISOString(),
    });
    write('CALL-LEDGER-228.jsonl', {
      callIndex: callsMade, key: `VF:${c.caseId}`, leg: 'VERIFIER', callKind: 'PRIMARY',
      contingencyReason: null, caseId: c.caseId,
      costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
      httpStatus: out.httpStatus,
    });
    const pr = out.parsed?.propertyReview as Record<string, unknown> | undefined;
    console.log(`  ${String(callsMade).padStart(2)} VF  PRIMARY     ${c.caseId} `
      + `${out.failureClass.padEnd(18)} role=${pr?.propertySemanticRole ?? '-'} `
      + `valid=${pr?.propertyValidity ?? '-'}  USD ${spendUsd.toFixed(4)}`);
    vfByCase.set(c.caseId, out);
  }

  const summary = {
    artifact: 'SECTION-228-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_228B_VERSION,
    frozenDigest: FROZEN_DIGEST,
    preSpendIdentity: 'PASS',
    plannedPrimaryCalls: PRIMARY_CALLS,
    callsExecuted: callsMade,
    contingencyCallsExecuted: contingencyUsed,
    contingencyCallsAuthorized: 2,
    contingencyLog,
    maxAuthorizedCalls: MAX_CALLS,
    spendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD,
    projectedSpendUsd: 0.9399,
    semanticPreferenceRetries: 0,
    databaseOperations: 0,
    stoppedEarly: stopped,
    promptChangedDuringExecution: false,
    schemaChanged: false,
    caseChangedAfterFreeze: false,
    malformedOutputRepaired: false,
    stringifiedFieldsParsed: false,
    verifierAssembly,
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'SECTION-228-EXECUTION-SUMMARY.json'),
    JSON.stringify(summary, null, 2) + '\n');

  console.log(`\n${callsMade} calls (${contingencyUsed} contingency) · `
    + `USD ${spendUsd.toFixed(4)} of ${SPEND_CEILING_USD} · stopped=${stopped ?? 'no'}`);
})();
