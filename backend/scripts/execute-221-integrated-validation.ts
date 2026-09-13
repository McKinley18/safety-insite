/**
 * §221 PHASE B -- FROZEN INTEGRATED EXPERT PIPELINE EXECUTION.
 * HOSTED. MAXIMUM 22 PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * No retries. No reruns. No rescue calls. No alternate provider or model. No mid-run remediation of
 * any kind. Raw evidence is persisted immediately after every call, BEFORE projection, scoring or
 * any derived interpretation. A malformed output is preserved exactly and never repaired.
 *
 * THE FIRST CALL IS THE INTEGRATED-RUNTIME COMPATIBILITY CANARY. The §210J first-pass wire schema
 * has never been transmitted hosted and measures above the size at which §199 was refused. If call
 * one fails before inference for a structural reason, the WHOLE run stops, the instrument is NOT
 * altered, and the execution-blocked terminal is returned.
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
import { VERIFIER_TOOL_NAME } from './lib/expert-208b-verifier-recovery';
import {
  MAX_PROVIDER_CALLS_221, SPEND_CEILING_USD_221, INTEGRATED_CASES_221, TERMINALS_221,
  providerCallPlan221,
} from './lib/expert-221-integrated-instrument';
import {
  assembleFirstPass221, assembleVerifierFor221, verifierLegIdentities221,
} from './lib/expert-221-assembly';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-221-integrated-pipeline-validation-2026-09-10');
const PREREG = join(EVID, 'INTEGRATED-PREREGISTRATION-221.json');
const FROZEN_DIGEST = '82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6';

const EXECUTOR_VERSION = 'hazlenz.expert.221.integrated-validation-execution.v1';
const FIRST_PASS_MAX_TOKENS = 4000;
const VERIFIER_MAX_TOKENS = 4000;
const WORST_FIRST_PASS_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 10 + (32_000 / 1e6) * 2;
const WORST_VERIFIER_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (22_000 / 1e6) * 2;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
const write = (f: string, line: unknown): void => {
  appendFileSync(join(EVID, f), `${JSON.stringify(line)}\n`);
};

// ================================================================ PREFLIGHT

console.log('§221 PHASE B PREFLIGHT — nothing is transmitted until every check passes\n');
const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
const pf = (id: string, ok: boolean, detail = ''): void => {
  checks.push({ id, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`);
};

const preregBytes = readFileSync(PREREG, 'utf8');
pf('frozen §221 digest', sha(preregBytes) === FROZEN_DIGEST, sha(preregBytes));
const prereg = JSON.parse(preregBytes);

const FP = assembleFirstPass221();
pf('assembly reproduces the frozen first-pass call set',
  FP.length === 10 && FP.every((x, i) =>
    x.identities.userPrompt === prereg.plannedFirstPassCalls[i].userPromptSha256
    && x.identities.instruction === prereg.plannedFirstPassCalls[i].systemPromptSha256
    && x.identities.schema === prereg.plannedFirstPassCalls[i].wireSchemaSha256
    && x.caseId === prereg.plannedFirstPassCalls[i].caseId),
  'ten user-prompt, instruction and schema identities match the freeze');
const vlid = verifierLegIdentities221();
pf('verifier leg identities match the freeze',
  vlid.instruction === prereg.identities.verifierLeg.instruction
  && vlid.schema === prereg.identities.verifierLeg.schema);
pf('execution order is the frozen order',
  FP.map(x => x.caseId).join(',') === prereg.executionOrder
    .map((s: { caseId: string }) => s.caseId).join(','),
  FP.map(x => x.caseId).join(','));
pf('model is the frozen model',
  EXPERT_HOSTED_INFERENCE_CONFIG.model === prereg.modelAndProvider.requestedModel,
  EXPERT_HOSTED_INFERENCE_CONFIG.model);
pf('api key present', typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY as string).length > 10);
pf('no cache_control anywhere in the assembled requests',
  FP.every(x => !JSON.stringify(x.wireSchema).includes('cache_control')));
/**
 * RESUME. §210H's discipline, reused: `--resume` APPENDS, and every leg already in the ledger is
 * refused, so no call already drawn can be drawn twice by any invocation. A plain re-run is still
 * refused outright.
 *
 * §221 EXECUTOR DEFECT, RECORDED RATHER THAN HIDDEN: the first invocation crashed after call 10
 * because IG7 returned `unresolvedFactDeclarations` as a JSON STRING rather than an array and this
 * executor assumed an array. That is a HARNESS defect, not an instrument defect. The fix is the
 * fail-closed guard below and this resume path; NO pinned artifact is touched, no prompt, schema,
 * deterministic rule, truth or case changes, the malformed provider field is NEVER parsed or
 * repaired, and no already-drawn call is re-spent.
 */
const RESUME = process.argv.includes('--resume');
const drawnFirstPass = new Set<string>();
const drawnVerifier = new Set<string>();
let priorCalls = 0;
let priorSpendUsd = 0;
const LEDGER = join(EVID, 'CALL-LEDGER-221.jsonl');
if (existsSync(LEDGER)) {
  for (const line of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line) as {
      leg: string; caseId: string; declarationId?: string; costUsd: number;
    };
    if (r.leg === 'FIRST_PASS') drawnFirstPass.add(r.caseId);
    else drawnVerifier.add(`${r.caseId}::${r.declarationId ?? ''}`);
    priorCalls += 1;
    priorSpendUsd += r.costUsd;
  }
}
pf('evidence state is consistent with the invocation mode',
  RESUME
    ? existsSync(LEDGER)
    : !existsSync(join(EVID, 'RAW-FIRST-PASS-221.jsonl'))
      && !existsSync(join(EVID, 'RAW-VERIFIER-221.jsonl')),
  RESUME
    ? `--resume: ${priorCalls} calls already drawn, USD ${priorSpendUsd.toFixed(4)} already spent`
    : 'a re-invocation may not silently re-spend calls');

if (checks.some(c => !c.ok)) {
  console.log('\n§221 PREFLIGHT FAILED. PROVIDER CALLS = 0. Nothing was transmitted.');
  process.exit(1);
}
writeFileSync(join(EVID, 'PREFLIGHT-221.json'), JSON.stringify({
  executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST, digestVerified: true, checks,
  callCeiling: MAX_PROVIDER_CALLS_221, spendCeilingUsd: SPEND_CEILING_USD_221,
  worstFirstPassUsd: Number(WORST_FIRST_PASS_USD.toFixed(6)),
  worstVerifierUsd: Number(WORST_VERIFIER_USD.toFixed(6)),
  retriesAuthorized: 0, databaseOperations: 0, cachingPosture: 'DISABLED',
  callPlan: providerCallPlan221(),
  transportAccounting: prereg.transportAccounting,
}, null, 2) + '\n');
console.log(`\n  PREFLIGHT PASSED. ceiling ${MAX_PROVIDER_CALLS_221} calls / `
  + `USD ${SPEND_CEILING_USD_221}\n`);

// ================================================================ EXECUTION

const apiKey = process.env.ANTHROPIC_API_KEY as string;
let callsMade = priorCalls;
let spendUsd = priorSpendUsd;
let stopped: string | null = null;
let canaryOutcome = priorCalls > 0 ? 'REACHED_INFERENCE_ON_THE_FIRST_INVOCATION'
  : 'NOT_YET_EXERCISED';

interface CallOutcome {
  httpStatus: number | null;
  reachedInference: boolean;
  failureClass: string;
  parsed: Record<string, unknown> | null;
  raw: Record<string, any>;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number;
  stopReason: string | null;
  latencyMs: number;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
  transmittedBodyBytes: number;
  respondedModel: string | null;
}

async function transmit(
  body: Record<string, unknown>, toolName: string,
): Promise<CallOutcome> {
  const wire = JSON.stringify(body);
  if (wire.includes('cache_control')) {
    throw new Error('§221 ABORT: cache_control in the request body. Not transmitting.');
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
    ?.find(x => x.type === 'tool_use' && x.name === toolName);
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

function spendGuard(worst: number): boolean {
  if (callsMade >= MAX_PROVIDER_CALLS_221) {
    stopped = 'CALL_CEILING_REACHED';
    return false;
  }
  if (spendUsd + worst > SPEND_CEILING_USD_221) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED';
    return false;
  }
  return true;
}

void (async () => {
  console.log('EXECUTION — frozen order, first pass then verifier, per case\n');

  const firstPassByCase = new Map<string, Record<string, unknown> | null>();

  for (const x of FP) {
    if (drawnFirstPass.has(x.caseId)) {
      console.log(`  skip  --  ${x.caseId} FIRST_PASS already drawn; not re-spent`);
      const prior = readFileSync(join(EVID, 'RAW-FIRST-PASS-221.jsonl'), 'utf8')
        .split('\n').filter(Boolean).map(l => JSON.parse(l))
        .find(r => r.caseId === x.caseId);
      firstPassByCase.set(x.caseId, (prior?.parsed ?? null) as Record<string, unknown> | null);
      const priorDecls = prior?.parsed == null
        ? undefined
        : (prior.parsed as Record<string, unknown>).unresolvedFactDeclarations;
      if (prior?.parsed != null && !Array.isArray(priorDecls)) {
        console.log(`        ${x.caseId} declarations are `
          + `${priorDecls === undefined ? 'absent' : typeof priorDecls}, not an array; `
          + 'verifier leg elided');
        write('CALL-ELISIONS-221.jsonl', {
          caseId: x.caseId, leg: 'VERIFIER',
          reason: 'FIRST_PASS_DECLARATIONS_NOT_AN_ARRAY',
          observedType: priorDecls === undefined ? 'absent' : typeof priorDecls,
          note: 'the malformed field is preserved exactly and is NEVER parsed or repaired',
        });
      }
      continue;
    }
    if (!spendGuard(WORST_FIRST_PASS_USD)) {
      console.log(`  STOPPED before ${x.caseId} first pass: ${stopped}`);
      break;
    }
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

    // RAW EVIDENCE PERSISTED BEFORE ANY DERIVATION.
    write('RAW-FIRST-PASS-221.jsonl', {
      callIndex: callsMade, leg: 'FIRST_PASS', recordKind: 'RAW_FIRST_PASS_221',
      executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
      caseId: x.caseId, ordinal: x.ordinal, analysisId: x.analysisId,
      observationSourceId: x.observationSourceId,
      instructionIdentity: x.identities.instruction,
      userPromptIdentity: x.identities.userPrompt,
      wireSchemaIdentity: x.identities.schema,
      transmittedSchemaSha256: sha(JSON.stringify(asSent)),
      governedSourceIds: x.governedRecords.map(r => r.sourceId),
      requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      respondedModel: out.respondedModel,
      transmittedBodyBytes: out.transmittedBodyBytes,
      cachingEnabled: false,
      httpStatus: out.httpStatus,
      providerErrorType: out.providerErrorType,
      providerErrorMessage: out.providerErrorMessage,
      reachedInference: out.reachedInference,
      stopReason: out.stopReason,
      inputTokens: out.inputTokens, outputTokens: out.outputTokens,
      costUsd: out.costUsd, cumulativeSpendUsd: spendUsd, latencyMs: out.latencyMs,
      failureClass: out.failureClass,
      rawPersistedBeforeDerivation: true,
      raw: out.raw, parsed: out.parsed,
      timestamp: new Date().toISOString(),
    });
    write('CALL-LEDGER-221.jsonl', {
      callIndex: callsMade, leg: 'FIRST_PASS', caseId: x.caseId, httpStatus: out.httpStatus,
      reachedInference: out.reachedInference, failureClass: out.failureClass,
      inputTokens: out.inputTokens, outputTokens: out.outputTokens, costUsd: out.costUsd,
      cumulativeSpendUsd: spendUsd, stopReason: out.stopReason, latencyMs: out.latencyMs,
    });
    console.log(`  ${out.failureClass === 'NO_FAILURE' ? 'ok  ' : 'FAIL'}  `
      + `${callsMade.toString().padStart(2)}  ${x.caseId} FIRST_PASS  http=${out.httpStatus}`
      + `  in=${out.inputTokens} out=${out.outputTokens}  $${out.costUsd.toFixed(4)}`
      + `  cum=$${spendUsd.toFixed(4)}  ${out.failureClass}`);

    // ---- THE CANARY, on call one only.
    if (x.ordinal === 1) {
      if (out.reachedInference) {
        canaryOutcome = 'REACHED_INFERENCE';
      } else {
        const schemaAttributable = out.httpStatus === 400
          || out.providerErrorType === 'invalid_request_error'
          || /schema|grammar|tool/i.test(String(out.providerErrorMessage ?? ''));
        canaryOutcome = schemaAttributable
          ? 'PRE_INFERENCE_REJECTION_STRUCTURALLY_ATTRIBUTABLE_TO_THE_FIRST_PASS_SCHEMA'
          : 'PRE_INFERENCE_FAILURE_NOT_SCHEMA_ATTRIBUTABLE';
        stopped = 'INTEGRATED_RUNTIME_COMPATIBILITY_STOP';
        console.log(`\n  COMPATIBILITY STOP — ${canaryOutcome}`);
        console.log(`  ${TERMINALS_221.executionBlocked}`);
        break;
      }
    }

    firstPassByCase.set(x.caseId, out.parsed);
    if (out.parsed === null) {
      console.log(`        no parseable declaration set for ${x.caseId}; verifier leg elided`);
      write('CALL-ELISIONS-221.jsonl', {
        caseId: x.caseId, leg: 'VERIFIER', reason: 'FIRST_PASS_OUTPUT_UNPARSEABLE',
      });
      continue;
    }

    // ---- FAIL CLOSED. A structured field that is not the shape the contract requires is a
    // provider structural defect. It is recorded and the leg is elided; the field is NEVER parsed
    // into the shape it should have had, because that would be repairing the stimulus.
    const declsRaw = (out.parsed as Record<string, unknown>).unresolvedFactDeclarations;
    if (!Array.isArray(declsRaw)) {
      console.log(`        ${x.caseId} declarations are `
        + `${declsRaw === undefined ? 'absent' : typeof declsRaw}, not an array; `
        + 'verifier leg elided and the defect preserved');
      write('CALL-ELISIONS-221.jsonl', {
        caseId: x.caseId, leg: 'VERIFIER', reason: 'FIRST_PASS_DECLARATIONS_NOT_AN_ARRAY',
        observedType: declsRaw === undefined ? 'absent' : typeof declsRaw,
        note: 'the malformed field is preserved exactly and is NEVER parsed or repaired',
      });
      continue;
    }

    // ---- verifier leg, built from THIS case's own first-pass output.
    const va = assembleVerifierFor221(x.caseId, out.parsed);
    write('VERIFIER-ASSEMBLY-221.jsonl', {
      caseId: x.caseId,
      built: va.built.map(b => ({ declarationId: b.declarationId, factKey: b.factKey })),
      refused: va.refused,
      projectionCodes: va.projectionCodes,
    });

    const c = INTEGRATED_CASES_221.find(k => k.caseId === x.caseId)!;
    if (c.verifierCalls === 0 && va.built.length > 0) {
      console.log(`        ${x.caseId} plans no verifier call; `
        + `${va.built.length} admitted declaration(s) recorded and the call is elided per the freeze`);
      write('CALL-ELISIONS-221.jsonl', {
        caseId: x.caseId, leg: 'VERIFIER', reason: 'ELIDED_BY_FROZEN_DESIGN',
        condition: c.verifierCallCondition, admittedDeclarations: va.built.length,
      });
      continue;
    }
    if (va.built.length === 0) {
      console.log(`        ${x.caseId} has no admitted declaration; verifier leg elided`);
      write('CALL-ELISIONS-221.jsonl', {
        caseId: x.caseId, leg: 'VERIFIER', reason: 'NO_ADMITTED_DECLARATION',
        refused: va.refused,
      });
      continue;
    }

    for (const b of va.built) {
      if (drawnVerifier.has(`${b.caseId}::${b.declarationId}`)) {
        console.log(`  skip  --  ${b.caseId} VERIFIER ${b.declarationId} already drawn`);
        continue;
      }
      if (!spendGuard(WORST_VERIFIER_USD)) {
        console.log(`  STOPPED before ${x.caseId} verifier: ${stopped}`);
        break;
      }
      const vout = await transmit({
        model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
        max_tokens: VERIFIER_MAX_TOKENS,
        system: b.systemPrompt,
        messages: [{ role: 'user', content: b.userPrompt }],
        tools: [{
          name: VERIFIER_TOOL_NAME,
          description: String((b.toolBlock as Record<string, unknown>).description),
          input_schema: (b.toolBlock as Record<string, unknown>).input_schema,
        }],
        tool_choice: { type: 'tool', name: VERIFIER_TOOL_NAME },
        thinking: { type: 'disabled' },
      }, VERIFIER_TOOL_NAME);

      write('RAW-VERIFIER-221.jsonl', {
        callIndex: callsMade, leg: 'VERIFIER', recordKind: 'RAW_VERIFIER_221',
        executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
        caseId: b.caseId, declarationId: b.declarationId, targetFactKey: b.factKey,
        instructionIdentity: b.identities.instruction,
        userPromptIdentity: b.identities.userPrompt,
        toolSchemaIdentity: b.identities.schema,
        requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
        respondedModel: vout.respondedModel,
        transmittedBodyBytes: vout.transmittedBodyBytes,
        cachingEnabled: false,
        httpStatus: vout.httpStatus,
        providerErrorType: vout.providerErrorType,
        providerErrorMessage: vout.providerErrorMessage,
        reachedInference: vout.reachedInference,
        stopReason: vout.stopReason,
        inputTokens: vout.inputTokens, outputTokens: vout.outputTokens,
        costUsd: vout.costUsd, cumulativeSpendUsd: spendUsd, latencyMs: vout.latencyMs,
        failureClass: vout.failureClass,
        rawPersistedBeforeDerivation: true,
        raw: vout.raw, parsed: vout.parsed,
        timestamp: new Date().toISOString(),
      });
      write('CALL-LEDGER-221.jsonl', {
        callIndex: callsMade, leg: 'VERIFIER', caseId: b.caseId,
        declarationId: b.declarationId, httpStatus: vout.httpStatus,
        reachedInference: vout.reachedInference, failureClass: vout.failureClass,
        inputTokens: vout.inputTokens, outputTokens: vout.outputTokens, costUsd: vout.costUsd,
        cumulativeSpendUsd: spendUsd, stopReason: vout.stopReason, latencyMs: vout.latencyMs,
      });
      console.log(`  ${vout.failureClass === 'NO_FAILURE' ? 'ok  ' : 'FAIL'}  `
        + `${callsMade.toString().padStart(2)}  ${b.caseId} VERIFIER ${b.declarationId}`
        + `  http=${vout.httpStatus}  in=${vout.inputTokens} out=${vout.outputTokens}`
        + `  $${vout.costUsd.toFixed(4)}  cum=$${spendUsd.toFixed(4)}  ${vout.failureClass}`);
    }
    if (stopped !== null) break;
  }

  writeFileSync(join(EVID, 'EXECUTION-SUMMARY-221.json'), JSON.stringify({
    executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
    callsAuthorized: MAX_PROVIDER_CALLS_221, callsAttempted: callsMade,
    spendCeilingUsd: SPEND_CEILING_USD_221,
    cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    projectedSpendUsd: prereg.projectedSpendUsd,
    stopped, retriesUsed: 0, databaseOperations: 0,
    integratedRuntimeCanaryOutcome: canaryOutcome,
    cachingPosture: 'DISABLED',
    completedAt: new Date().toISOString(),
  }, null, 2) + '\n');

  console.log(`\nCALLS ${callsMade}/${MAX_PROVIDER_CALLS_221}   SPEND $${spendUsd.toFixed(4)}/`
    + `$${SPEND_CEILING_USD_221}   CANARY ${canaryOutcome}`
    + `   STOPPED: ${stopped ?? 'no — cohort complete'}`);
  console.log('RAW EVIDENCE PERSISTED. No derivation, scoring or adjudication has been performed.');
})();
