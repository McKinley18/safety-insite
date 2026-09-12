/**
 * §217 PHASE B -- FROZEN MINIMAL VERIFIER CONFIRMATION EXECUTION.
 * HOSTED. MAXIMUM 7 VERIFIER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * No retries. No second draws. No rescue calls. No alternate model. No first-pass calls. No
 * governed-stage calls. The frozen digest is verified before anything is transmitted.
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
import { checkDeclarationEntry212 } from './lib/expert-212-challenge-vocabulary';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import { MAX_VERIFIER_CALLS_217 as MAX_VERIFIER_CALLS, SPEND_CEILING_USD_217 as SPEND_CEILING_USD } from './lib/expert-217-final-confirmation-instrument';
import { assemble217 } from './lib/expert-217-assembly';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-217-final-minimal-verifier-confirmation-2026-09-09');
const PREREG = join(EVID, 'CONFIRMATION-PREREGISTRATION-217.json');
const FROZEN_DIGEST = '99f9f6b82842cb0ad4c0e1ea78418af3606dc4dcadde353699ed8d18998fa2a4';

const EXECUTOR_VERSION = 'hazlenz.expert.217.final-confirmation-execution.v1';
const VERIFIER_MAX_TOKENS = 4000;
const WORST_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (14_000 / 1e6) * 2;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
const write = (f: string, line: unknown): void => {
  appendFileSync(join(EVID, f), `${JSON.stringify(line)}\n`);
};

// ================================================================ PREFLIGHT

console.log('§217 PHASE B PREFLIGHT — nothing is transmitted until every check passes\n');
const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
const pf = (id: string, ok: boolean, detail = ''): void => {
  checks.push({ id, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`);
};

const preregBytes = readFileSync(PREREG, 'utf8');
pf('frozen §217 digest', sha(preregBytes) === FROZEN_DIGEST, sha(preregBytes));

const prereg = JSON.parse(preregBytes);
const A = assemble217();
pf('assembly reproduces the frozen call set',
  A.failures.length === 0 && A.built.length === MAX_VERIFIER_CALLS
  && A.built.every((b, i) => b.identities.userPrompt === prereg.plannedCalls[i].userPromptSha256
    && b.factKey === prereg.plannedCalls[i].factKey),
  'seven user-prompt identities and seven fact keys match the freeze');
pf('instruction identity matches the freeze',
  A.built[0].identities.instruction === prereg.identities.instructionSha256);
pf('schema identity matches the freeze',
  A.built[0].identities.schema === prereg.identities.toolSchemaSha256);
pf('api key present', typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY as string).length > 10);
pf('no strict flag and no cache_control in any tool block',
  A.built.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')
    && !JSON.stringify(b.toolBlock).includes('cache_control')));

if (checks.some(c => !c.ok)) {
  console.log('\n§217 PREFLIGHT FAILED. PROVIDER CALLS = 0. Nothing was transmitted.');
  process.exit(1);
}
writeFileSync(join(EVID, 'PREFLIGHT-217.json'), JSON.stringify({
  executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
  digestVerified: true, checks,
  callCeiling: MAX_VERIFIER_CALLS, spendCeilingUsd: SPEND_CEILING_USD, retriesAuthorized: 0,
  cachingPosture: 'DISABLED',
}, null, 2) + '\n');
console.log(`\n  PREFLIGHT PASSED. ${A.built.length} frozen calls. ceiling `
  + `${MAX_VERIFIER_CALLS} calls / USD ${SPEND_CEILING_USD}\n`);

// ================================================================ EXECUTION

const apiKey = process.env.ANTHROPIC_API_KEY as string;
let callsMade = 0;
let spendUsd = 0;
let stopped: string | null = null;
let transportFailures = 0;

type Built = (typeof A.built)[number];

async function providerCall(b: Built): Promise<Record<string, any>> {
  if (callsMade >= MAX_VERIFIER_CALLS) throw new Error('§217 HARD CALL CEILING reached');
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED';
    throw new Error(`§217 SPEND CEILING USD ${SPEND_CEILING_USD} would be exceeded `
      + `(spent ${spendUsd.toFixed(4)}, worst case ${WORST_CALL_USD.toFixed(4)}). Stopping the `
      + 'WHOLE run for review; no favourable subset is executed.');
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
    throw new Error('§217 ABORT: forbidden field in the request body. Not transmitting.');
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
  if (failureClass.startsWith('TRANSPORT')) transportFailures += 1;

  // RAW EVIDENCE PERSISTED BEFORE ANY DERIVATION.
  const record = {
    callIndex: callsMade,
    recordKind: 'RAW_VERIFIER_CALL_217',
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
  write('RAW-VERIFIER-217.jsonl', record);
  write('CALL-LEDGER-217.jsonl', {
    callIndex: callsMade, caseId: b.caseId, declarationId: b.declarationId, httpStatus,
    reachedInference, failureClass, inputTokens, outputTokens, costUsd,
    cumulativeSpendUsd: spendUsd, stopReason: record.stopReason, latencyMs,
  });
  return record;
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
    if (rec.failureClass.startsWith('TRANSPORT')) {
      console.log('    transport failure preserved exactly. No retry. Continuing only because the '
        + 'frozen protocol and the remaining calls stay valid.');
    }
  }

  writeFileSync(join(EVID, 'EXECUTION-SUMMARY-217.json'), JSON.stringify({
    executorVersion: EXECUTOR_VERSION, frozenDigest: FROZEN_DIGEST,
    callsAuthorized: MAX_VERIFIER_CALLS, callsAttempted: callsMade,
    transportFailures, spendCeilingUsd: SPEND_CEILING_USD,
    cumulativeSpendUsd: Number(spendUsd.toFixed(6)), stopped, retriesUsed: 0,
    cachingPosture: 'DISABLED', completedAt: new Date().toISOString(),
  }, null, 2) + '\n');
  console.log(`\nCALLS ${callsMade}/${MAX_VERIFIER_CALLS}   SPEND $${spendUsd.toFixed(4)}/`
    + `$${SPEND_CEILING_USD}   TRANSPORT FAILURES ${transportFailures}`
    + `   STOPPED: ${stopped ?? 'no — cohort complete'}`);

  // Deterministic validation, applied AFTER every raw record is persisted.
  const rows = readFileSync(join(EVID, 'RAW-VERIFIER-217.jsonl'), 'utf8').trim().split('\n')
    .map(l => JSON.parse(l));
  for (const r of rows) {
    const entries = (r.parsed?.owedFactDeclarations ?? []) as any[];
    const vocabCodes = entries.flatMap(e => checkDeclarationEntry212({
      factKey: String(e?.factKey ?? ''),
      declaration: String(e?.declaration ?? ''),
      challengeReason: e?.challengeReason ?? null,
      challengeGround: e?.challengeGround ?? null,
      propertyMismatchKind: e?.propertyMismatchKind ?? null,
      representationConcern: e?.representationConcern ?? 'NONE',
    }));
    const scope = checkScopeContainment({
      scope: {
        targetFactKey: r.targetFactKey, suppliedFactKeys: [r.targetFactKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: r.parsed?.nominatedFact ?? null,
        clarificationSourceMode: r.parsed?.clarificationSourceMode ?? null,
        owedFactDeclarations: entries,
      },
    });
    write('CONTRACT-VALIDATION-217.jsonl', {
      callIndex: r.callIndex, caseId: r.caseId, declarationId: r.declarationId,
      verdict: r.parsed?.verdict ?? null,
      declarationCount: entries.length,
      declaredFactKeys: entries.map(e => e?.factKey ?? null),
      targetFactKey: r.targetFactKey,
      declaration: entries[0]?.declaration ?? null,
      challengeGround: entries[0]?.challengeGround ?? null,
      propertyMismatchKind: entries[0]?.propertyMismatchKind ?? null,
      representationConcern: entries[0]?.representationConcern ?? null,
      nominatedFactPresent: (r.parsed?.nominatedFact ?? null) !== null,
      clarificationSourceMode: r.parsed?.clarificationSourceMode ?? null,
      proposedClarificationPresent: (r.parsed?.proposedClarification ?? null) !== null,
      vocabularyAdmissionCodes: vocabCodes,
      scopeAdmissionCodes: scope.codes,
      admitted: vocabCodes.length === 0 && scope.admitted,
    });
  }
  console.log('deterministic validation written for', rows.length, 'calls');
})();
