/**
 * §210B-3B -- UNCACHED HOSTED PROBE EXECUTION. BOUNDED PROVIDER EXECUTION. ZERO DATABASE OPS.
 *
 * Eight FIRST_PASS calls, one per frozen §210B-3A stimulus, against
 * `hazlenz.expert.first-pass-instruction.210b2-S1-S6`. DEVELOPMENT evidence. NOT acceptance.
 *
 * ==================== WHY CACHING IS OFF, AND WHY THAT IS NOT A SILENT DISABLE ====================
 *
 * §210B-3A projected USD 0.3519 by treating the 46,306-byte system prompt as a cacheable prefix.
 * The cache preflight showed it is not one: the provider's cache prefix is ordered tools -> system
 * -> messages, and this probe sends a per-case tool schema, so the stable system prompt always sits
 * behind bytes that change every call. Marking it would have written eight entries and read none,
 * at the 1.25x write premium -- dearer than not caching. The product owner reviewed that finding,
 * accepted it as an INFRASTRUCTURE / ECONOMIC PREREGISTRATION DEFECT, refused to re-cut the probe
 * or drop cases, and raised the ceiling to USD 0.65 to run the frozen probe uncached.
 *
 * No `cache_control` key is constructed anywhere in this file, and the request body is asserted to
 * contain none immediately before transmission.
 *
 * ==================== WHAT MAY NOT HAPPEN ONCE THE FIRST CALL IS MADE ====================
 *
 * No prompt, schema, contract or truth change. No semantic retry. No second draw for any reason,
 * transport included. No replacement case. No selective skipping on semantic grounds. No output
 * repair and no inference of an omitted field. FAILURES ARE PRESERVED -- they are the evidence.
 *
 * ==================== BOUNDS ====================
 *
 *   calls               8, exactly one per frozen case
 *   retries             0
 *   verifier calls      0
 *   governed stage      0
 *   HARD SPEND CEILING  USD 0.65, enforced before every call
 *   database operations 0
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
  EXPERT_HOSTED_INFERENCE_CONFIG, EXPERT_TOOL_NAME,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { describeGrammarProjection203 } from './lib/expert-203-effective-grammar-identity';
import { instructionIdentities } from './lib/expert-first-pass-instruction-210b2';
import {
  CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import { PROBE_STIMULI } from './lib/section-210b3-probe-preregistration';
import {
  FROZEN_GOVERNED_SOURCE_IDS, PROBE_CASES, type ProbeCase, toolBlockFor,
} from './lib/section-210b3-probe-cases';

const ROOT = join(__dirname, '..', '..');
const PREREG_DIR = join(
  ROOT, 'verification', 'expert-hazlenz-210b3-probe-preregistration-2026-09-08');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09');

const EXECUTOR_VERSION = 'hazlenz.expert.210b3b.uncached-probe-execution.v1' as const;
const AUTHORIZATION_REFERENCE = 'SECTION-210B-3B-PRODUCT-OWNER-AUTHORIZATION-2026-09-09' as const;
const AUTHORIZED_PREREGISTRATION_SHA =
  '7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5' as const;

const HARD_SPEND_CEILING_USD = 0.65;
const FIRST_PASS_MAX_TOKENS = 4000; // §208 parity. Outputs are NOT truncated to fit a budget.
const CALLS = 8;
/** Worst case for one call: the full output allowance plus a generous input bound. */
const WORST_INPUT_TOKENS = 28_000;
const WORST_CALL_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok
  + (WORST_INPUT_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;
/** Used only to gate call 1, before any economics have been observed. */
const PRIOR_PER_CALL_USD = 0.5779 / CALLS;

const LEDGER = join(EVID, 'CALL-LEDGER-210B3B.jsonl');
const RAW = join(EVID, 'RAW-FIRST-PASS-210B3B.jsonl');
const PROJECTION = join(EVID, 'PROJECTION-210B3B.jsonl');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

// ================================================================ pre-execution gate

const preregRaw = readFileSync(join(PREREG_DIR, 'PROBE-PREREGISTRATION-210B3A.json'));
const preregSha = createHash('sha256').update(preregRaw).digest('hex');
const prereg = JSON.parse(preregRaw.toString('utf8')) as any;
const ids = instructionIdentities() as any;

console.log('================ §210B-3B EXECUTION GATE (zero provider calls so far)');
console.log(`  executor         : ${EXECUTOR_VERSION}`);
console.log(`  authorization    : ${AUTHORIZATION_REFERENCE}`);
console.log(`  preregistration  : ${preregSha}`);
console.log(`  model            : ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
console.log(`  caching          : DISABLED (no cache_control constructed anywhere)`);
console.log(`  spend ceiling    : USD ${HARD_SPEND_CEILING_USD.toFixed(2)}`);

let priorCalls = 0;
let priorSpendUsd = 0;
const blockers: string[] = [];
if (preregSha !== AUTHORIZED_PREREGISTRATION_SHA) {
  blockers.push(`preregistration sha ${preregSha} is not the authorized artifact`);
}
if (ids.withoutGovernedBinding.newIdentity !== prereg.instruction.newIdentity) {
  blockers.push('plain instruction identity is not the frozen one');
}
if (ids.withGovernedBinding.newIdentity !== prereg.instruction.newIdentityGovernedVariant) {
  blockers.push('governed instruction identity is not the frozen one');
}
// The in-repo stimuli must still BE the frozen stimuli, compared as data.
const frozen = prereg.stimuli as any[];
if (frozen.length !== PROBE_STIMULI.length) blockers.push('stimulus count differs');
for (let i = 0; i < Math.min(frozen.length, PROBE_STIMULI.length); i += 1) {
  const f = frozen[i]; const l = PROBE_STIMULI[i] as any;
  for (const k of ['caseId', 'observation', 'jurisdiction', 'expectedDeclarationCount',
    'suppliedContext', 'hazardFamilies', 'governedEvidence']) {
    if (JSON.stringify(f[k]) !== JSON.stringify(l[k])) blockers.push(`${f.caseId}: ${k} drifted`);
  }
}
if (PROBE_CASES.length !== CALLS) blockers.push(`${PROBE_CASES.length} cases built, expected 8`);
for (const c of PROBE_CASES) {
  const expect = FROZEN_GOVERNED_SOURCE_IDS[c.caseId];
  const actual = c.governedRecords.map(r => r.sourceId);
  if (expect === undefined || JSON.stringify(expect) !== JSON.stringify(actual)) {
    blockers.push(`${c.caseId}: governed evidence set ${JSON.stringify(actual)} is not frozen`);
  }
}
const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey === undefined || apiKey === '') blockers.push('ANTHROPIC_API_KEY is not set');
/**
 * RESUME. §206's operator error -- a re-invocation that silently re-spent a call -- is why a plain
 * re-run is refused outright. `--resume` appends to the existing evidence instead, and every case
 * already present in the ledger is REFUSED, so no case can be drawn twice by any invocation.
 */
const RESUME = process.argv.includes('--resume');
const alreadyExecuted = new Set<string>();
if (existsSync(LEDGER)) {
  for (const line of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line) as { caseId: string; costUsd: number };
    alreadyExecuted.add(r.caseId);
    priorCalls += 1;
    priorSpendUsd += r.costUsd;
  }
}
for (const p of [LEDGER, RAW, PROJECTION]) {
  if (existsSync(p) && !RESUME) {
    blockers.push(`${p} already exists; refusing to overwrite persisted evidence `
      + '(pass --resume to append the cases that have NOT been drawn)');
  }
}

for (const b of blockers) console.log(`  BLOCKER          : ${b}`);
if (blockers.length > 0) {
  console.error('\n§210B-3B ABORT BEFORE PROVIDER EXECUTION. ZERO PROVIDER CALLS WERE MADE. '
    + 'A prerequisite is NOT repaired inside an already-started run.');
  process.exit(1);
}
console.log('  permitted        : true');

// ================================================================ transport

interface CallRecord {
  callIndex: number;
  leg: 'FIRST_PASS';
  caseId: string;
  provider: string;
  requestedModel: string;
  respondedModel: string | null;
  instructionVersion: string;
  instructionIdentitySha256: string;
  systemPromptSha256: string;
  userPromptSha256: string;
  inputIdentitySha256: string;
  canonicalSchemaGrammarId: string;
  transmittedSchemaSha256: string;
  transmittedBodyBytes: number;
  cacheControlPresentInRequest: false;
  governedSourceIdsSupplied: readonly string[];
  httpStatus: number | null;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
  reachedInference: boolean;
  stopReason: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheCreationInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED';
  cacheReadInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED';
  providerReportedCacheFields: Record<string, unknown>;
  costUsd: number;
  latencyMs: number;
  rawStructuralOutcome: string;
  failureClass: string;
  retried: false;
  timestamp: string;
}

let callsMade = priorCalls;
let spendUsd = priorSpendUsd;
/** Only the calls THIS invocation made. Prior calls are read back from the ledger for reporting. */
const records: CallRecord[] = [];

/** The FROZEN §207 failure vocabulary. Nothing here decides a semantic verdict. */
function classify(a: {
  httpStatus: number | null; stopReason: string | null;
  parsed: unknown; hadToolUseBlock: boolean;
}): string {
  if (a.httpStatus === null) return 'TRANSPORT_TRANSIENT';
  if (a.httpStatus === 429 || a.httpStatus >= 500) return 'TRANSPORT_TRANSIENT';
  if (a.httpStatus !== 200) return 'TRANSPORT_STRUCTURAL';
  if (a.stopReason === 'max_tokens') return 'OUTPUT_TRUNCATED';
  if (!a.hadToolUseBlock || a.parsed === null) return 'OUTPUT_UNPARSEABLE';
  return 'NO_FAILURE';
}

/**
 * The spend gate the authorization specifies: observed economics, not a fixed pessimistic bound.
 * Two conditions must BOTH hold, so neither an optimistic mean nor a single expensive call can
 * carry actual spend past the ceiling.
 */
function spendGate(remainingCalls: number): { permitted: boolean; reason: string } {
  const observedMean = callsMade > 0 ? spendUsd / callsMade : PRIOR_PER_CALL_USD;
  const projectedTotal = spendUsd + observedMean * remainingCalls;
  if (spendUsd + WORST_CALL_USD > HARD_SPEND_CEILING_USD) {
    return {
      permitted: false,
      reason: `spent ${spendUsd.toFixed(4)} + worst-case single call ${WORST_CALL_USD.toFixed(4)} `
        + `would exceed the ${HARD_SPEND_CEILING_USD.toFixed(2)} ceiling`,
    };
  }
  if (projectedTotal > HARD_SPEND_CEILING_USD) {
    return {
      permitted: false,
      reason: `projected cumulative ${projectedTotal.toFixed(4)} (spent ${spendUsd.toFixed(4)} + `
        + `${remainingCalls} x observed mean ${observedMean.toFixed(4)}) exceeds the `
        + `${HARD_SPEND_CEILING_USD.toFixed(2)} ceiling`,
    };
  }
  return { permitted: true, reason: `projected cumulative ${projectedTotal.toFixed(4)}` };
}

async function providerCall(c: ProbeCase): Promise<{
  record: CallRecord; parsed: Record<string, unknown> | null; raw: unknown;
}> {
  const tool = toolBlockFor(c);
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: FIRST_PASS_MAX_TOKENS,
    system: c.systemPrompt,
    messages: [{ role: 'user', content: c.userPrompt }],
    tools: [tool],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);

  // ---- FINAL GUARDS, immediately before transmission.
  if (wire.includes('cache_control')) {
    throw new Error('§210B-3B ABORT: caching is disabled for this execution and the request body '
      + 'carries a cache_control key. Refusing to transmit.');
  }
  const expectGoverned = FROZEN_GOVERNED_SOURCE_IDS[c.caseId] ?? [];
  const supplied = c.governedRecords.map(r => r.sourceId);
  if (JSON.stringify(expectGoverned) !== JSON.stringify(supplied)) {
    throw new Error(`§210B-3B ABORT: ${c.caseId} would transmit governed evidence `
      + `${JSON.stringify(supplied)}, frozen set is ${JSON.stringify(expectGoverned)}.`);
  }
  if (expectGoverned.length === 0 && wire.includes('governedEvidenceSourceIds')) {
    throw new Error(`§210B-3B ABORT: ${c.caseId} is a capability-ABSENT case and its request `
      + 'carries a governed-binding property. Refusing to transmit.');
  }

  callsMade += 1;
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

  const usage = json.usage as Record<string, any> | undefined;
  const inputTokens = (usage?.input_tokens as number | undefined) ?? null;
  const outputTokens = (usage?.output_tokens as number | undefined) ?? null;
  const costUsd =
    (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(b => b.type === 'tool_use');
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;
  const failureClass = classify({
    httpStatus,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    parsed,
    hadToolUseBlock: block !== undefined,
  });

  const record: CallRecord = {
    callIndex: callsMade,
    leg: 'FIRST_PASS',
    caseId: c.caseId,
    provider: 'anthropic',
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: (json.model as string | undefined) ?? null,
    instructionVersion: 'hazlenz.expert.first-pass-instruction.210b2-S1-S6',
    instructionIdentitySha256: sha(c.systemPrompt),
    systemPromptSha256: sha(c.systemPrompt),
    userPromptSha256: sha(c.userPrompt),
    inputIdentitySha256: sha(`${c.systemPrompt} ${c.userPrompt}`),
    canonicalSchemaGrammarId: describeGrammarProjection203(
      c.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity,
    transmittedSchemaSha256: sha(JSON.stringify(c.schemaAsSent)),
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    cacheControlPresentInRequest: false,
    governedSourceIdsSupplied: supplied,
    httpStatus,
    providerErrorType: (json?.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json?.error?.message as string | undefined) ?? null,
    reachedInference: (outputTokens ?? 0) > 0 || Array.isArray(json.content),
    stopReason: (json.stop_reason as string | undefined) ?? null,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
    cacheReadInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
    // Recorded verbatim for completeness. Absent or zero here is NOT evidence about caching.
    providerReportedCacheFields: {
      cache_creation_input_tokens: usage?.cache_creation_input_tokens ?? 'ABSENT',
      cache_read_input_tokens: usage?.cache_read_input_tokens ?? 'ABSENT',
    },
    costUsd,
    latencyMs,
    rawStructuralOutcome:
      httpStatus === null ? 'TRANSPORT_ERROR'
        : httpStatus !== 200 ? `HTTP_${httpStatus}`
          : block !== undefined ? 'TOOL_USE_BLOCK_RETURNED' : 'NO_TOOL_USE_BLOCK',
    failureClass,
    retried: false,
    timestamp: new Date().toISOString(),
  };
  records.push(record);
  appendFileSync(LEDGER, `${JSON.stringify(record)}\n`);
  return { record, parsed, raw: json };
}

// ================================================================ run

async function main(): Promise<void> {
  mkdirSync(EVID, { recursive: true });
  if (!RESUME) {
    writeFileSync(LEDGER, '');
    writeFileSync(RAW, '');
    writeFileSync(PROJECTION, '');
  } else {
    console.log(`  RESUME: ${priorCalls} prior call(s), USD ${priorSpendUsd.toFixed(4)} spent, `
      + `already drawn: ${Array.from(alreadyExecuted).join(', ')}`);
  }

  console.log('\n================ FIRST PASS, 8 CALLS, UNCACHED');
  let stopped: string | null = null;
  const structurallyBlocked: string[] = [];

  for (let i = 0; i < PROBE_CASES.length; i += 1) {
    const c = PROBE_CASES[i] as ProbeCase;
    if (alreadyExecuted.has(c.caseId)) {
      console.log(`  ${c.caseId} ... ALREADY DRAWN; refusing a second draw`);
      continue;
    }
    const gate = spendGate(PROBE_CASES.length - i);
    if (!gate.permitted) {
      stopped = `HOSTED_EXECUTION_STOPPED_FOR_SPEND_REVIEW before ${c.caseId}: ${gate.reason}`;
      console.log(`\n  STOP before ${c.caseId}: ${gate.reason}`);
      break;
    }
    process.stdout.write(`  ${c.caseId} ... `);
    const out = await providerCall(c);

    const parsed = out.parsed ?? {};
    const declarations = Array.isArray((parsed as any).unresolvedFactDeclarations)
      ? (parsed as any).unresolvedFactDeclarations as Record<string, unknown>[]
      : [];

    // RAW IS PERSISTED BEFORE ANY DERIVATION.
    appendFileSync(RAW, `${JSON.stringify({
      caseId: c.caseId,
      recordKind: 'FIRST_PASS',
      callIndex: out.record.callIndex,
      executorVersion: EXECUTOR_VERSION,
      authorizationReference: AUTHORIZATION_REFERENCE,
      preregistrationSha256: preregSha,
      instructionVersion: out.record.instructionVersion,
      instructionIdentitySha256: out.record.instructionIdentitySha256,
      grammarIdentity: out.record.canonicalSchemaGrammarId,
      inputIdentitySha256: out.record.inputIdentitySha256,
      requestedModel: out.record.requestedModel,
      respondedModel: out.record.respondedModel,
      cachingEnabled: false,
      governedSourceIdsSupplied: out.record.governedSourceIdsSupplied,
      httpStatus: out.record.httpStatus,
      failureClass: out.record.failureClass,
      reachedInference: out.record.reachedInference,
      stopReason: out.record.stopReason,
      rawPersistedBeforeDerivation: true,
      raw: out.raw,
      parsed: out.parsed,
      declarationCount: declarations.length,
      usage: {
        inputTokens: out.record.inputTokens,
        outputTokens: out.record.outputTokens,
        cacheCreationInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
        cacheReadInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
        costUsd: Number(out.record.costUsd.toFixed(6)),
      },
      timestamp: out.record.timestamp,
    })}\n`);

    // A faithful projection: model-authored fields copied verbatim, nothing repaired or inferred.
    appendFileSync(PROJECTION, `${JSON.stringify({
      caseId: c.caseId,
      expectedDeclarationCount: c.expectedDeclarationCount,
      observedDeclarationCount: declarations.length,
      failureClass: out.record.failureClass,
      declarations: declarations.map(d => ({
        declarationId: d.declarationId ?? null,
        missingFact: d.missingFact ?? null,
        observationSourceId: d.observationSourceId ?? null,
        observationSpan: d.observationSpan ?? null,
        notEstablishedBecause: d.notEstablishedBecause ?? null,
        affectedDecision: d.affectedDecision ?? null,
        branchA: d.branchA ?? null,
        decisionIfA: d.decisionIfA ?? null,
        branchB: d.branchB ?? null,
        decisionIfB: d.decisionIfB ?? null,
        whyNecessaryNow: d.whyNecessaryNow ?? null,
        governedEvidenceSourceIds: d.governedEvidenceSourceIds ?? 'PROPERTY_ABSENT',
      })),
      clarifications: Array.isArray((parsed as any).decisionCriticalClarifications)
        ? ((parsed as any).decisionCriticalClarifications as Record<string, unknown>[]).map(q => ({
          question: q.question ?? null,
          criticality: q.criticality ?? null,
          // EXECUTOR_DEFECT_1 corrected (§210E). The contract's field name is taken from the
          // contract module, never retyped. The §210B-3B adjudication did not probe this binding,
          // so no §210B-3B verdict depends on it and none changes.
          [CLARIFICATION_DECLARATION_BACKREF_FIELD]:
            q[CLARIFICATION_DECLARATION_BACKREF_FIELD] ?? 'FIELD_NOT_AUTHORED_BY_MODEL',
        }))
        : [],
      hazardCandidates: Array.isArray((parsed as any).expertHazardCandidates)
        ? ((parsed as any).expertHazardCandidates as Record<string, unknown>[]).map(h => ({
          hazardFamily: h.hazardFamily ?? null,
          assertedConditionState: h.assertedConditionState ?? null,
        }))
        : [],
    })}\n`);

    console.log(`${out.record.failureClass}  decl=${declarations.length}`
      + `  in=${String(out.record.inputTokens)} out=${String(out.record.outputTokens)}`
      + `  USD ${out.record.costUsd.toFixed(4)}  cum ${spendUsd.toFixed(4)}`);

    /**
     * A structural provider rejection is a TRANSPORT fact about ONE case's request shape. It is not
     * a semantic verdict and it says nothing about any other case, so it is recorded and the run
     * continues to the cases it does not affect. It is never retried -- no second draw -- and the
     * blocked case is reported as structurally unexecutable, never as a semantic failure.
     * A TRANSIENT failure is different: it is not case-local, so it halts the run.
     */
    if (out.record.failureClass === 'TRANSPORT_STRUCTURAL') {
      structurallyBlocked.push(c.caseId);
      console.log(`      STRUCTURAL REJECTION on ${c.caseId}; not retried, not a semantic verdict; `
        + 'continuing to the unaffected cases');
      continue;
    }
    if (out.record.failureClass === 'TRANSPORT_TRANSIENT') {
      stopped = `HOSTED_EXECUTION_STOPPED_FOR_TRANSPORT_REVIEW at ${c.caseId}: `
        + `${out.record.failureClass}. No second draw is authorized.`;
      console.log(`\n  STOP: ${stopped}`);
      break;
    }
  }

  // ================================================================ token report

  const allRecords: CallRecord[] = existsSync(LEDGER)
    ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as CallRecord)
    : records;
  const priorStructural = allRecords
    .filter(r => r.failureClass === 'TRANSPORT_STRUCTURAL').map(r => r.caseId);
  const blockedAll = Array.from(new Set([...structurallyBlocked, ...priorStructural]));
  const ok = allRecords.filter(r => r.inputTokens !== null && r.outputTokens !== null);
  const median = (xs: number[]): number | null => {
    if (xs.length === 0) return null;
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 === 1 ? (s[m] as number) : (((s[m - 1] as number) + (s[m] as number)) / 2);
  };
  const medIn = median(ok.map(r => r.inputTokens as number));
  const medOut = median(ok.map(r => r.outputTokens as number));
  const SECTION_208_MEDIAN_INPUT = 24_440;

  const report = {
    artifact: 'SECTION_210B3B_TOKEN_REPORT',
    executorVersion: EXECUTOR_VERSION,
    authorizationReference: AUTHORIZATION_REFERENCE,
    preregistrationSha256: preregSha,
    cachingEnabled: false,
    cacheCreationInputTokens: 'NOT_APPLICABLE — CACHING_DISABLED',
    cacheReadInputTokens: 'NOT_APPLICABLE — CACHING_DISABLED',
    cacheNote: 'Caching was deliberately disabled. Absent or zero provider cache fields in this '
      + 'run are NOT evidence about cache effectiveness and may not be read as such.',
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModels: Array.from(new Set(allRecords.map(r => r.respondedModel))),
    callsCompleted: allRecords.length,
    callsSucceeded: ok.length,
    callsAuthorized: CALLS,
    retries: 0,
    verifierCalls: 0,
    governedStageCalls: 0,
    databaseOperations: 0,
    structurallyBlockedCases: blockedAll,
    perCall: allRecords.map(r => ({
      caseId: r.caseId,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      costUsd: Number(r.costUsd.toFixed(6)),
      latencyMs: r.latencyMs,
      stopReason: r.stopReason,
      failureClass: r.failureClass,
    })),
    logicalInputTokensTotal: ok.reduce((a, r) => a + (r.inputTokens as number), 0),
    outputTokensTotal: ok.reduce((a, r) => a + (r.outputTokens as number), 0),
    medianInputTokens: medIn,
    medianOutputTokens: medOut,
    cumulativeCostUsd: Number(spendUsd.toFixed(6)),
    costPerCaseUsd: callsMade > 0 ? Number((spendUsd / callsMade).toFixed(6)) : null,
    hardCeilingUsd: HARD_SPEND_CEILING_USD,
    withinCeiling: spendUsd <= HARD_SPEND_CEILING_USD,
    priorProjectionUncachedUsd: 0.5779,
    section208FirstPassMedianInputTokens: SECTION_208_MEDIAN_INPUT,
    medianInputDeltaVs208: medIn === null ? null : medIn - SECTION_208_MEDIAN_INPUT,
    staticTokenIncreaseAttributableTo210B2: {
      estimatedFromChars: ids.withoutGovernedBinding.estimatedAddedTokens,
      basis: ids.tokenEstimateBasis,
      measuredNote: 'The observed median-input delta against the §208 median is the measurable '
        + 'quantity. It is NOT purely the §210B-2 static delta: the §210B-3A stimuli are different '
        + 'observations from the §208 cohort, so per-case input varies for that reason too.',
    },
    stopped,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'TOKEN-REPORT-210B3B.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log('\n================ TOKEN REPORT');
  console.log(`  calls completed        : ${allRecords.length} of ${CALLS} (${ok.length} reached inference)`);
  if (blockedAll.length > 0) {
    console.log(`  structurally blocked   : ${blockedAll.join(', ')} (TRANSPORT, not semantic)`);
  }
  console.log(`  cumulative cost        : USD ${spendUsd.toFixed(4)} (ceiling ${HARD_SPEND_CEILING_USD.toFixed(2)})`);
  console.log(`  cost per case          : USD ${(callsMade > 0 ? spendUsd / callsMade : 0).toFixed(4)}`);
  console.log(`  median input tokens    : ${String(medIn)} (§208 median ${SECTION_208_MEDIAN_INPUT})`);
  console.log(`  median output tokens   : ${String(medOut)}`);
  console.log(`  cache fields           : NOT_APPLICABLE — CACHING_DISABLED`);
  if (stopped !== null) console.log(`  STOPPED                : ${stopped}`);
  console.log(`\n  evidence written to ${EVID}`);
  void bytes;
}

main().catch((e: Error) => {
  console.error(`\n§210B-3B ABORT: ${e.message}`);
  console.error(`  calls made: ${callsMade}, spend USD ${spendUsd.toFixed(4)}. Evidence preserved.`);
  process.exit(2);
});
