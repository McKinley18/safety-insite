/**
 * §208B -- FROZEN-COHORT VERIFIER-LEG RECOVERY. BOUNDED PROVIDER EXECUTION.
 *
 * EXECUTION-INFRASTRUCTURE RECOVERY ONLY. This produces the clean verifier evidence §208 failed to
 * establish. It is NOT a second cohort and NOT a semantic re-roll.
 *
 * ==================== WHAT IS FROZEN AND REUSED, NOT REGENERATED ====================
 *
 * Every stimulus comes from persisted §208 evidence: the 24 first-pass responses byte-untouched,
 * their hazard candidates, clarifications, uncertainty and summary, and the admitted OwedFacts from
 * the CORRECTED deterministic projection. NO first-pass call and NO governed-stage call is made by
 * this executor -- it has no code path that could make one, and the ledger it writes carries a
 * single leg value.
 *
 * ==================== WHAT CHANGED FROM §208's VERIFIER LEG, AND ONLY THIS ====================
 *
 *   1. the hazard-candidate block is populated from `parsed.expertHazardCandidates` (§208 read
 *      §199's PERSISTED field name out of the PARSED payload and silently got an empty array);
 *   2. the tool wrapper carries no `strict` flag, which is §199's envelope, executed 8/8 at HTTP 200.
 *
 * The verifier system prompt, response schema, admission contract, provider and model are
 * BYTE-UNCHANGED. No semantic treatment is tuned. Assembly happens in
 * `expert-208b-verifier-recovery.ts`, the same module the offline preflight inspected, so what was
 * proved is what is sent.
 *
 * ==================== BOUNDS ====================
 *
 *   expected calls        24
 *   HARD CALL CEILING     30   (24 + the preregistered transient-retry allowance)
 *   HARD SPEND CEILING    USD 1.50, enforced before every call against the worst case
 *   first-pass calls      0
 *   governed-stage calls  0
 *   database operations   0
 *   human verdicts        0
 *
 * A STRUCTURAL PROVIDER REJECTION STOPS THE RUN. Nothing -- wrapper, prompt, schema, candidates or
 * grammar -- is modified inside an active recovery run; the executor returns for product-owner
 * review instead.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---- .env, exactly as §199, §206 and §208 load it: never overwriting an exported variable.
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
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import {
  EXPERT_VERIFIER_CONTRACT_V3_3_VERSION, checkVerifierV3_3Output,
} from './lib/expert-verifier-contract-v3-3';
import {
  AUTHORIZATION_REFERENCE, AUTHORIZED_PREREGISTRATION_IDENTITY, RECOVERY_208B_VERSION,
  assembleVerifierRequests, extractCandidateBlock, preRunIdentityChecks,
} from './lib/expert-208b-verifier-recovery';
import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { preregistrationIdentity } from './lib/expert-207-preregistration';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');
const LEDGER = join(EVID, 'CALL-LEDGER-208B.jsonl');
const VERIFIER_FILE = join(EVID, 'RAW-VERIFIER-208B.jsonl');

const HARD_CALL_CEILING = 30;
const SPEND_CEILING_USD = 1.5;
const VERIFIER_MAX_TOKENS = 4000;
const RETRY_ALLOWANCE_PER_RUN = 6;
const RETRY_ALLOWANCE_PER_CALL = 1;
const WORST_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (14_000 / 1e6) * 2;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

// ================================================================ pre-run identity checks

console.log('================ §208B PRE-RUN IDENTITY CHECKS (zero provider calls so far)');
const checks = preRunIdentityChecks(ROOT);
for (const c of checks) {
  console.log(`  ${c.held ? 'PASS' : 'FAIL'}  ${c.id.padEnd(5)} ${c.statement}`);
  if (!c.held) console.log(`        expected=${c.expected}  actual=${c.actual}`);
}
if (checks.some(c => !c.held)) {
  console.error('\n§208B ABORT BEFORE INFERENCE: a pre-run identity check failed. ZERO PROVIDER '
    + 'CALLS WERE MADE. A prerequisite is not repaired inside an active recovery run.');
  process.exit(1);
}
if (preregistrationIdentity() !== AUTHORIZED_PREREGISTRATION_IDENTITY) {
  console.error('\n§208B ABORT: the preregistration identity is not the authorized one.');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey === undefined || apiKey === '') {
  console.error('\n§208B ABORT: ANTHROPIC_API_KEY is not set. ZERO PROVIDER CALLS WERE MADE.');
  process.exit(1);
}

if (existsSync(VERIFIER_FILE)) {
  console.error(`\n§208B ABORT: ${VERIFIER_FILE} exists. Refusing to overwrite persisted recovery `
    + 'evidence; a stage that has run cannot be re-run into the same file.');
  process.exit(1);
}

const requests = assembleVerifierRequests(ROOT);
console.log(`\n  assembled ${requests.length} verifier requests, `
  + `${requests.reduce((n, r) => n + r.candidateCount, 0)} candidate entries in total`);

// ================================================================ transport

interface CallRecord {
  callIndex: number;
  leg: 'VERIFIER_RECOVERY';
  caseId: string;
  factKey: string;
  ordinal: number;
  provider: string;
  requestedModel: string;
  respondedModel: string | null;
  candidateCount: number;
  candidateBlockIdentity: string;
  owedFactIdentity: string;
  firstPassRawIdentity: string;
  systemPromptIdentity: string;
  userPromptIdentity: string;
  schemaIdentity: string;
  wrapperIdentity: string;
  wrapperCarriesStrictFlag: false;
  transmittedBodyBytes: number;
  httpStatus: number | null;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
  reachedInference: boolean;
  stopReason: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number;
  latencyMs: number;
  rawStructuralOutcome: string;
  failureClass: string;
  retried: boolean;
  retryReason: string | null;
  timestamp: string;
}

let callsMade = 0;
let retriesUsed = 0;
let spendUsd = 0;

function classify(args: {
  httpStatus: number | null;
  stopReason: string | null;
  parsed: unknown;
  hadToolUseBlock: boolean;
}): string {
  if (args.httpStatus === null) return 'TRANSPORT_TRANSIENT';
  if (args.httpStatus === 429 || args.httpStatus >= 500) return 'TRANSPORT_TRANSIENT';
  if (args.httpStatus !== 200) return 'TRANSPORT_STRUCTURAL';
  if (args.stopReason === 'max_tokens') return 'OUTPUT_TRUNCATED';
  if (!args.hadToolUseBlock || args.parsed === null) return 'OUTPUT_UNPARSEABLE';
  return 'NO_FAILURE';
}

type Req = (typeof requests)[number];

async function providerCall(
  r: Req, retryReason?: string,
): Promise<{ record: CallRecord; parsed: Record<string, unknown> | null; raw: unknown }> {
  if (callsMade >= HARD_CALL_CEILING) {
    throw new Error(`§208B HARD CALL CEILING ${HARD_CALL_CEILING} reached. STOPPING and returning `
      + 'for product-owner review. Unused capacity is not spent and the ceiling is not raised.');
  }
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    throw new Error(`§208B HARD SPEND CEILING USD ${SPEND_CEILING_USD} would be exceeded `
      + `(spent ${spendUsd.toFixed(4)}, worst case ${WORST_CALL_USD.toFixed(4)}). STOPPING and `
      + 'returning for product-owner review.');
  }

  // The §199 envelope: name, description, input_schema. NO strict flag.
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: VERIFIER_MAX_TOKENS,
    system: r.systemPrompt,
    messages: [{ role: 'user', content: r.userPrompt }],
    tools: [r.toolBlock],
    tool_choice: { type: 'tool', name: String(r.toolBlock.name) },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);

  // FINAL GUARDS, immediately before transmission.
  if (wire.includes('"strict"')) {
    throw new Error('§208B ABORT: a strict flag is present in the request body. The §199 envelope '
      + 'carries none and defect 2 must not recur. Refusing to transmit.');
  }
  if (extractCandidateBlock(r.userPrompt) === '(none raised)') {
    throw new Error(`§208B ABORT: ${r.caseId} would transmit an empty candidate block. This is the `
      + 'defect-3 signature and the recovery exists to prevent it. Refusing to transmit.');
  }

  callsMade += 1;
  if (retryReason !== undefined) retriesUsed += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 180_000);
  let json: Record<string, any> = {};
  let httpStatus: number | null = null;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = response.status;
    json = await response.json() as Record<string, any>;
  } catch (e) {
    json = { error: { type: 'transport', message: (e as Error).message } };
  } finally { clearTimeout(timer); }
  const latencyMs = Date.now() - started;

  const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const costUsd =
    (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(b => b.type === 'tool_use');
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;

  const record: CallRecord = {
    callIndex: callsMade,
    leg: 'VERIFIER_RECOVERY',
    caseId: r.caseId,
    factKey: r.factKey,
    ordinal: r.ordinal,
    provider: 'anthropic',
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: (json.model as string | undefined) ?? null,
    candidateCount: r.candidateCount,
    candidateBlockIdentity: r.candidateBlockIdentity,
    owedFactIdentity: r.owedFactIdentity,
    firstPassRawIdentity: r.firstPassRawIdentity,
    systemPromptIdentity: r.systemPromptIdentity,
    userPromptIdentity: r.userPromptIdentity,
    schemaIdentity: r.schemaIdentity,
    wrapperIdentity: r.wrapperIdentity,
    wrapperCarriesStrictFlag: false,
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    httpStatus,
    providerErrorType: (json?.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json?.error?.message as string | undefined) ?? null,
    reachedInference: (outputTokens ?? 0) > 0 || Array.isArray(json.content),
    stopReason: (json.stop_reason as string | undefined) ?? null,
    inputTokens,
    outputTokens,
    costUsd,
    latencyMs,
    rawStructuralOutcome:
      httpStatus === null ? 'TRANSPORT_ERROR'
        : httpStatus !== 200 ? `HTTP_${httpStatus}`
          : block !== undefined ? 'TOOL_USE_BLOCK_RETURNED' : 'NO_TOOL_USE_BLOCK',
    failureClass: classify({
      httpStatus,
      stopReason: (json.stop_reason as string | undefined) ?? null,
      parsed,
      hadToolUseBlock: block !== undefined,
    }),
    retried: retryReason !== undefined,
    retryReason: retryReason ?? null,
    timestamp: new Date().toISOString(),
  };

  mkdirSync(EVID, { recursive: true });
  appendFileSync(LEDGER, `${JSON.stringify(record)}\n`);
  return { record, parsed, raw: json };
}

/** The frozen §207 retry rule. Semantic dissatisfaction and degenerate output are NEVER retried. */
async function callWithFrozenRetryPolicy(r: Req): ReturnType<typeof providerCall> {
  const first = await providerCall(r);
  const cls = first.record.failureClass;
  if (cls === 'NO_FAILURE' || cls === 'TRANSPORT_STRUCTURAL') return first;
  if (retriesUsed >= RETRY_ALLOWANCE_PER_RUN) {
    console.log(`      retry budget exhausted (${retriesUsed}); not retrying ${cls}`);
    return first;
  }
  console.log(`      ${cls} -> ${RETRY_ALLOWANCE_PER_CALL} BYTE-IDENTICAL RETRY`);
  return providerCall(r, cls);
}

// ================================================================ run

(async () => {
  mkdirSync(EVID, { recursive: true });
  writeFileSync(VERIFIER_FILE, '');
  console.log('\n================ §208B VERIFIER RECOVERY — 24 calls, §199 envelope, '
    + 'candidate blocks populated');

  for (const r of requests) {
    process.stdout.write(`  ${String(r.ordinal).padStart(2)} ${r.caseId} cand=${r.candidateCount} `
      + `${r.factKey.slice(0, 30)} ... `);
    const out = await callWithFrozenRetryPolicy(r);

    if (out.record.failureClass === 'TRANSPORT_STRUCTURAL') {
      appendFileSync(VERIFIER_FILE, `${JSON.stringify({
        caseId: r.caseId, factKey: r.factKey, recordKind: 'VERIFIER_RECOVERY_STRUCTURAL_REJECTION',
        callIndex: out.record.callIndex, raw: out.raw, timestamp: out.record.timestamp,
      })}\n`);
      console.error('\n\n§208B STOP: STRUCTURAL PROVIDER REJECTION. The frozen protocol stops the '
        + 'run. Nothing — wrapper, prompt, schema, candidates or grammar — is modified inside an '
        + 'active recovery run. Returning for product-owner review.');
      console.error(`  case ${r.caseId} HTTP ${String(out.record.httpStatus)} `
        + `${out.record.providerErrorType ?? ''} ${out.record.providerErrorMessage ?? ''}`);
      process.exit(2);
    }

    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === r.caseId);
    const parsed = out.parsed;
    const admission = parsed === null ? null : checkVerifierV3_3Output(
      {
        ...parsed,
        verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
        analysisId: r.analysisId,
      } as any,
      {
        analysisId: r.analysisId,
        observation: c?.observation ?? '',
        suppliedOwedFactKeys: [r.factKey],
        suppliedGovernedSourceIds: [...r.governedSourceIds],
        suppliedGovernedEvidence: (c?.governed?.records ?? [])
          .map(g => ({ sourceId: g.sourceId, text: g.text })),
      } as any);

    appendFileSync(VERIFIER_FILE, `${JSON.stringify({
      caseId: r.caseId,
      factKey: r.factKey,
      declarationId: r.declarationId,
      ordinal: r.ordinal,
      recordKind: 'ACCEPTANCE_VERIFIER_EVIDENCE',
      supersedes: 'the corresponding record in RAW-VERIFIER-208.jsonl, which is preserved as '
        + 'DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE and is NOT used for any preregistered judgment',
      callIndex: out.record.callIndex,
      recoveryVersion: RECOVERY_208B_VERSION,
      preregistrationIdentity: AUTHORIZED_PREREGISTRATION_IDENTITY,
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
      admissionContractVersion: EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
      candidateCount: r.candidateCount,
      candidateBlockIdentity: r.candidateBlockIdentity,
      candidateSetIdentity: r.candidateSetIdentity,
      owedFactIdentity: r.owedFactIdentity,
      firstPassRawIdentity: r.firstPassRawIdentity,
      userPromptIdentity: r.userPromptIdentity,
      schemaIdentity: r.schemaIdentity,
      wrapperIdentity: r.wrapperIdentity,
      failureClass: out.record.failureClass,
      stopReason: out.record.stopReason,
      rawPersistedBeforeDerivation: true,
      raw: out.raw,
      parsed,
      admission,
      usage: {
        inputTokens: out.record.inputTokens,
        outputTokens: out.record.outputTokens,
        costUsd: Number(out.record.costUsd.toFixed(6)),
      },
      timestamp: out.record.timestamp,
    })}\n`);

    console.log(`${out.record.rawStructuralOutcome} verdict=`
      + `${String((parsed as any)?.verdict ?? '-')} admitted=`
      + `${String((admission as any)?.admitted ?? '-')} $${out.record.costUsd.toFixed(4)}`);
  }

  console.log('\n================ §208B RECOVERY COMPLETE');
  console.log(`  recovery version      : ${RECOVERY_208B_VERSION}`);
  console.log(`  authorization         : ${AUTHORIZATION_REFERENCE}`);
  console.log(`  verifier calls        : ${callsMade} of hard ceiling ${HARD_CALL_CEILING}`);
  console.log(`  retries used          : ${retriesUsed} of ${RETRY_ALLOWANCE_PER_RUN}`);
  console.log(`  spend                 : USD ${spendUsd.toFixed(6)} of ceiling ${SPEND_CEILING_USD}`);
  console.log('  first-pass calls      : 0');
  console.log('  governed-stage calls  : 0');
  console.log('  database operations   : 0');
  console.log('  human verdicts written: 0');
  console.log(`  schema identity       : ${sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)).slice(0, 16)}`);
  console.log(`  ledger bytes          : ${bytes(readFileSync(LEDGER, 'utf8'))}`);
})().catch((e: Error) => {
  console.error(`\n§208B STOPPED: ${e.message}`);
  console.error('Evidence written so far is preserved. An invalid run is NOT turned into a '
    + 'completed run by ad hoc repair.');
  process.exit(3);
});
