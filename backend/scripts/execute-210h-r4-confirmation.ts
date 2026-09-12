/**
 * §210H -- FINAL R4-ONLY HOSTED CONFIRMATION. BOUNDED PROVIDER EXECUTION.
 * ZERO DATABASE OPERATIONS.
 *
 * Three FIRST_PASS calls, one per frozen §210H case, against
 * `hazlenz.expert.first-pass-instruction.210g-R4B`. DEVELOPMENT evidence. NOT acceptance.
 *
 * ==================== WHAT MAY NOT HAPPEN ONCE THE FIRST CALL IS MADE ====================
 *
 * No prompt, schema, contract or truth change. No semantic retry. No rescue call. No second draw
 * for any reason, transport included. No replacement case. No selective skipping on semantic
 * grounds. No output repair and no inference of an omitted field. FAILURES ARE PRESERVED -- they
 * are the evidence.
 *
 * ==================== BOUNDS ====================
 *
 *   calls               3, exactly one per frozen case
 *   retries             0
 *   verifier calls      0
 *   governed stage      0
 *   HARD SPEND CEILING  USD 0.35, enforced before every call on observed economics
 *   caching             DISABLED. No cache_control is constructed anywhere in this file.
 *   database operations 0
 *
 * ==================== DETERMINISTIC CONTRACT ====================
 *
 * The current contract is applied exactly as implemented, INCLUDING the §210E R7 refusal code
 * `NON_SEMANTIC_PLACEHOLDER_VALUE` and its routing through `CONTRACT_INCOMPLETENESS_CODES` so RR-7
 * preserves the identified property. A refusal is RECORDED; a declaration is never repaired.
 *
 * NO R4B DETERMINISTIC MATCHER IS ADDED HERE. R4B is a semantic model responsibility: the model
 * authors safety meaning, deterministic code validates closed structural and contract boundaries.
 * Alignment is adjudicated by a reader against the frozen truth, never by code reading a branch.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---- .env, exactly as §199, §206, §208, §210B-3B and §210D load it: never overwriting an export.
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
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  CLARIFICATION_DECLARATION_BACKREF_FIELD, buildExpertVNextUserPrompt, buildExpertVNextWireSchema,
  governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT, EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
  instructionIdentities210g,
} from './lib/expert-first-pass-instruction-210g';
import { describeGrammarProjection203 } from './lib/expert-203-effective-grammar-identity';
import {
  projectDeclaredOwedFacts, resolveClarificationLinks,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  CONTRACT_INCOMPLETENESS_CODES, preserveIdentifiedSafetyFacts,
} from './lib/expert-205-declaration-preservation';
import { R4_CONFIRMATION_STIMULI } from './lib/section-210h-r4-confirmation-preregistration';

const ROOT = join(__dirname, '..', '..');
const PREREG_DIR = join(
  ROOT, 'verification', 'expert-hazlenz-210h-final-r4-confirmation-preregistration-2026-09-09');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-210h-hosted-confirmation-2026-09-09');

const EXECUTOR_VERSION = 'hazlenz.expert.210h.final-r4-confirmation-execution.v1' as const;
const AUTHORIZATION_REFERENCE = 'SECTION-210H-PRODUCT-OWNER-EXECUTION-AUTHORIZATION-2026-09-09';
const AUTHORIZED_PREREGISTRATION_SHA =
  '2c578a2ce4e1a1012c6797b83799b9a3ebd804e063ce09a1361fdd69a4f2d4a2' as const;
const AUTHORIZED_PLAIN_INSTRUCTION_IDENTITY =
  '0f547b124afe0f6db51af6a63af8c42273f34c81b3d1ee4f291c93d6dba76591' as const;
const AUTHORIZED_GOVERNED_INSTRUCTION_IDENTITY =
  '32b10f090c136b2e7b302d798de52193f1bd01296f364e189488457006a494e0' as const;
/** §210G is built on the exact prompt §210F tested. A drifted base invalidates the comparison. */
const AUTHORIZED_BASE_PLAIN_IDENTITY =
  '874d26d4d036ca419dd0ffaee2a43f89ecec26f6b6bfba93e7a423a10658d831' as const;

const HARD_SPEND_CEILING_USD = 0.35;
const FIRST_PASS_MAX_TOKENS = 4000; // frozen. Outputs are NOT truncated to fit a budget.
const CALLS = 3;
const WORST_INPUT_TOKENS = 29_000;
const WORST_CALL_USD =
  (FIRST_PASS_MAX_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok
  + (WORST_INPUT_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;
/** Gates call 1 only, before any economics have been observed. Frozen projection / 3. */
const PRIOR_PER_CALL_USD = 0.2369 / CALLS;

const LEDGER = join(EVID, 'CALL-LEDGER-210H.jsonl');
const RAW = join(EVID, 'RAW-FIRST-PASS-210H.jsonl');
const PROJECTION = join(EVID, 'PROJECTION-210H.jsonl');
const CONTRACT = join(EVID, 'CONTRACT-VALIDATION-210H.jsonl');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ================================================================ pre-execution gate

const preregRaw = readFileSync(join(PREREG_DIR, 'FINAL-R4-CONFIRMATION-PREREGISTRATION-210H.json'));
const preregSha = createHash('sha256').update(preregRaw).digest('hex');
const prereg = JSON.parse(preregRaw.toString('utf8')) as any;
const ids = instructionIdentities210g() as any;

console.log('================ §210H EXECUTION GATE (zero provider calls so far)');
console.log(`  executor         : ${EXECUTOR_VERSION}`);
console.log(`  authorization    : ${AUTHORIZATION_REFERENCE}`);
console.log(`  preregistration  : ${preregSha}`);
console.log(`  instruction      : ${EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION}`);
console.log(`  model            : ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
console.log(`  caching          : DISABLED (no cache_control constructed anywhere)`);
console.log(`  spend ceiling    : USD ${HARD_SPEND_CEILING_USD.toFixed(2)}`);

let priorCalls = 0;
let priorSpendUsd = 0;
const blockers: string[] = [];

if (preregSha !== AUTHORIZED_PREREGISTRATION_SHA) {
  blockers.push(`preregistration sha ${preregSha} is not the authorized artifact`);
}
if (ids.withoutGovernedBinding.newIdentity !== AUTHORIZED_PLAIN_INSTRUCTION_IDENTITY) {
  blockers.push('the plain instruction identity is not the authorized one');
}
if (ids.withGovernedBinding.newIdentity !== AUTHORIZED_GOVERNED_INSTRUCTION_IDENTITY) {
  blockers.push('the governed instruction identity is not the authorized one');
}
if (ids.withoutGovernedBinding.oldIdentity !== AUTHORIZED_BASE_PLAIN_IDENTITY) {
  blockers.push('the §210G base is not the §210F instruction under test');
}
if (ids.withoutGovernedBinding.newIdentity !== prereg.instructionUnderTest.plainIdentitySha256) {
  blockers.push('the plain instruction identity is not the frozen one');
}
if (ids.withGovernedBinding.newIdentity !== prereg.instructionUnderTest.governedIdentitySha256) {
  blockers.push('the governed instruction identity drifted from the frozen record');
}

/** The in-repo stimuli must still BE the frozen stimuli, compared as data. */
const frozen = prereg.stimuli as any[];
if (frozen.length !== R4_CONFIRMATION_STIMULI.length) blockers.push('stimulus count differs');
for (let i = 0; i < Math.min(frozen.length, R4_CONFIRMATION_STIMULI.length); i += 1) {
  const f = frozen[i]; const l = R4_CONFIRMATION_STIMULI[i] as any;
  for (const k of ['caseId', 'observation', 'jurisdiction', 'expectedDeclarationCount',
    'suppliedContext', 'hazardFamilies', 'governedEvidence', 'decisionUnderAnalysis',
    'requiredOwedProperties', 'evaluationQuestions']) {
    if (JSON.stringify(f[k]) !== JSON.stringify(l[k])) blockers.push(`${f.caseId}: ${k} drifted`);
  }
}
if (R4_CONFIRMATION_STIMULI.length !== CALLS) {
  blockers.push(`${R4_CONFIRMATION_STIMULI.length} cases, expected ${CALLS}`);
}
for (const s of R4_CONFIRMATION_STIMULI) {
  if (s.governedEvidence.length !== 0) {
    blockers.push(`${s.caseId}: §210H is capability-ABSENT on every case`);
  }
}
/** R7's deterministic half must actually be wired, or the contract check would be theatre. */
if (!CONTRACT_INCOMPLETENESS_CODES.includes('NON_SEMANTIC_PLACEHOLDER_VALUE')) {
  blockers.push('NON_SEMANTIC_PLACEHOLDER_VALUE is not routed through CONTRACT_INCOMPLETENESS_CODES');
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey === undefined || apiKey === '') blockers.push('ANTHROPIC_API_KEY is not set');

/**
 * RESUME. §206's operator error -- a re-invocation that silently re-spent a call -- is why a plain
 * re-run is refused. `--resume` appends, and every case already in the ledger is REFUSED, so no
 * case can be drawn twice by any invocation.
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
for (const p of [LEDGER, RAW, PROJECTION, CONTRACT]) {
  if (existsSync(p) && !RESUME) {
    blockers.push(`${p} already exists; refusing to overwrite persisted evidence `
      + '(pass --resume to append cases that have NOT been drawn)');
  }
}

for (const b of blockers) console.log(`  BLOCKER          : ${b}`);
if (blockers.length > 0) {
  console.error('\n§210H ABORT BEFORE PROVIDER EXECUTION. ZERO PROVIDER CALLS WERE MADE. '
    + 'A prerequisite is NOT repaired inside an already-started run.');
  process.exit(1);
}
console.log('  permitted        : true');

// ================================================================ request construction

interface Built {
  caseId: string;
  input: ExpertAnalysisInput;
  systemPrompt: string;
  userPrompt: string;
  canonicalSchema: Record<string, unknown>;
  schemaAsSent: unknown;
  expectedDeclarationCount: number;
  observationSourceId: string;
  observation: string;
}

function build(s: (typeof R4_CONFIRMATION_STIMULI)[number]): Built {
  const observationSourceId = `OBS-${s.caseId}`;
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `AN-210H-${s.caseId}`,
    authoritativeSources: [
      { sourceId: observationSourceId, sourceType: 'observation', text: s.observation },
    ],
    inspectionContext: { location: s.suppliedContext.location, task: s.suppliedContext.task },
    jurisdiction: s.jurisdiction,
    allowedHazardFamilies: [...s.hazardFamilies],
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
  };
  const canonicalSchema = buildExpertVNextWireSchema(input, governedBindingFor([]));
  return {
    caseId: s.caseId,
    input,
    // Capability-ABSENT on every case: the PLAIN §210E prompt, never the governed variant.
    systemPrompt: EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
    userPrompt: buildExpertVNextUserPrompt(input, []),
    canonicalSchema,
    schemaAsSent: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(canonicalSchema)),
    expectedDeclarationCount: s.expectedDeclarationCount,
    observationSourceId,
    observation: s.observation,
  };
}

const CASES: readonly Built[] = R4_CONFIRMATION_STIMULI.map(build);

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
  userPromptSha256: string;
  inputIdentitySha256: string;
  canonicalSchemaGrammarId: string;
  transmittedSchemaSha256: string;
  transmittedBodyBytes: number;
  cacheControlPresentInRequest: false;
  capabilityAbsent: true;
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

/** Observed economics, as the authorization specifies. Both conditions must hold. */
function spendGate(remaining: number): { permitted: boolean; reason: string } {
  const observedMean = callsMade > 0 ? spendUsd / callsMade : PRIOR_PER_CALL_USD;
  const projectedTotal = spendUsd + observedMean * remaining;
  if (spendUsd + WORST_CALL_USD > HARD_SPEND_CEILING_USD) {
    return { permitted: false,
      reason: `spent ${spendUsd.toFixed(4)} + worst-case call ${WORST_CALL_USD.toFixed(4)} `
        + `would exceed ${HARD_SPEND_CEILING_USD.toFixed(2)}` };
  }
  if (projectedTotal > HARD_SPEND_CEILING_USD) {
    return { permitted: false,
      reason: `projected cumulative ${projectedTotal.toFixed(4)} exceeds `
        + `${HARD_SPEND_CEILING_USD.toFixed(2)}` };
  }
  return { permitted: true, reason: `projected cumulative ${projectedTotal.toFixed(4)}` };
}

async function providerCall(c: Built): Promise<{
  record: CallRecord; parsed: Record<string, unknown> | null; raw: unknown;
}> {
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: FIRST_PASS_MAX_TOKENS,
    system: c.systemPrompt,
    messages: [{ role: 'user', content: c.userPrompt }],
    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      strict: true,
      input_schema: c.schemaAsSent,
    }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);

  // ---- FINAL GUARDS, immediately before transmission.
  if (wire.includes('cache_control')) {
    throw new Error('§210H ABORT: caching is disabled and the body carries cache_control.');
  }
  if (wire.includes('governedEvidenceSourceIds')) {
    throw new Error(`§210H ABORT: ${c.caseId} is capability-ABSENT and its request carries a `
      + 'governed-binding property. Refusing to transmit.');
  }
  if (sha(c.systemPrompt) !== AUTHORIZED_PLAIN_INSTRUCTION_IDENTITY) {
    throw new Error('§210H ABORT: the system prompt is not the authorized plain instruction.');
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
    instructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
    instructionIdentitySha256: sha(c.systemPrompt),
    userPromptSha256: sha(c.userPrompt),
    inputIdentitySha256: sha(`${c.systemPrompt} ${c.userPrompt}`),
    canonicalSchemaGrammarId: describeGrammarProjection203(
      c.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity,
    transmittedSchemaSha256: sha(JSON.stringify(c.schemaAsSent)),
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    cacheControlPresentInRequest: false,
    capabilityAbsent: true,
    httpStatus,
    providerErrorType: (json?.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json?.error?.message as string | undefined) ?? null,
    reachedInference: (outputTokens ?? 0) > 0 || Array.isArray(json.content),
    stopReason: (json.stop_reason as string | undefined) ?? null,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
    cacheReadInputTokens: 'NOT_APPLICABLE_CACHING_DISABLED',
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
  appendFileSync(LEDGER, `${JSON.stringify(record)}\n`);
  return { record, parsed, raw: json };
}

// ================================================================ run

async function main(): Promise<void> {
  mkdirSync(EVID, { recursive: true });
  if (!RESUME) {
    writeFileSync(LEDGER, ''); writeFileSync(RAW, '');
    writeFileSync(PROJECTION, ''); writeFileSync(CONTRACT, '');
  } else {
    console.log(`  RESUME: ${priorCalls} prior call(s), USD ${priorSpendUsd.toFixed(4)}, `
      + `already drawn: ${Array.from(alreadyExecuted).join(', ')}`);
  }

  console.log('\n================ FIRST PASS, 3 CALLS, UNCACHED, CAPABILITY-ABSENT');
  let stopped: string | null = null;
  const structurallyBlocked: string[] = [];

  for (let i = 0; i < CASES.length; i += 1) {
    const c = CASES[i] as Built;
    if (alreadyExecuted.has(c.caseId)) {
      console.log(`  ${c.caseId} ... ALREADY DRAWN; refusing a second draw`);
      continue;
    }
    const gate = spendGate(CASES.length - i);
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
    const rawClarifications = Array.isArray((parsed as any).decisionCriticalClarifications)
      ? (parsed as any).decisionCriticalClarifications as Record<string, unknown>[]
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
      capabilityAbsent: true,
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

    // Faithful projection: model-authored fields copied verbatim. Nothing repaired or inferred.
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
      })),
      clarifications: rawClarifications.map(q => ({
        clarificationId: q.clarificationId ?? null,
        question: q.question ?? null,
        criticality: q.criticality ?? null,
        // EXECUTOR_DEFECT_1 stays corrected: the back-reference is read under the CONTRACT'S field
        // name, imported from the contract module rather than retyped.
        [CLARIFICATION_DECLARATION_BACKREF_FIELD]:
          q[CLARIFICATION_DECLARATION_BACKREF_FIELD] ?? 'FIELD_NOT_AUTHORED_BY_MODEL',
      })),
      hazardCandidates: Array.isArray((parsed as any).expertHazardCandidates)
        ? ((parsed as any).expertHazardCandidates as Record<string, unknown>[]).map(h => ({
          hazardFamily: h.hazardFamily ?? null,
          assertedConditionState: h.assertedConditionState ?? null,
        }))
        : [],
    })}\n`);

    // ---- DETERMINISTIC CONTRACT, applied exactly as implemented. Refusals recorded, never repaired.
    const projection = projectDeclaredOwedFacts({
      declarations,
      sources: [{ sourceId: c.observationSourceId, text: c.observation }],
      suppliedGovernedSourceIds: [],
      stage: 'FIRST_PASS_MODEL',
    });
    const preservation = preserveIdentifiedSafetyFacts(projection, declarations);
    const links = resolveClarificationLinks(
      rawClarifications.map(q => ({
        clarificationId: String(q.clarificationId ?? ''),
        answersUnresolvedFactDeclarationId:
          (q[CLARIFICATION_DECLARATION_BACKREF_FIELD] as string | undefined) ?? null,
      })),
      projection,
    );
    const placeholderRefusals = projection.perDeclaration
      .filter(p => p.codes.includes('NON_SEMANTIC_PLACEHOLDER_VALUE'));

    appendFileSync(CONTRACT, `${JSON.stringify({
      caseId: c.caseId,
      projectionVersion: projection.version,
      admittedFactCount: projection.facts.length,
      refusedCount: projection.refusedCount,
      perDeclaration: projection.perDeclaration.map(p => ({
        declarationId: p.declarationId,
        admitted: p.admitted,
        codes: p.codes,
        detail: p.detail,
        factKey: p.factKey,
      })),
      nonSemanticPlaceholderRefusals: placeholderRefusals.map(p => ({
        declarationId: p.declarationId, detail: p.detail,
      })),
      rr7: {
        safetyStateComplete: preservation.safetyStateComplete,
        totalLossOnThisRow: preservation.totalLossOnThisRow,
        dispositions: preservation.dispositions,
        preserved: preservation.preserved.map(r => ({
          recordKind: r.recordKind,
          declarationId: r.declarationId,
          identifiedProperty: r.identifiedProperty,
        })),
      },
      clarificationLinks: links,
      blockingClarificationsWithoutBinding: rawClarifications
        .filter(q => String(q.criticality) === 'BLOCKING')
        .filter(q => {
          const v = q[CLARIFICATION_DECLARATION_BACKREF_FIELD];
          return typeof v !== 'string' || v.length === 0;
        })
        .map(q => q.clarificationId ?? null),
      deterministicRefusalIsRecordedSeparatelyFromSemanticAdjudication: true,
      declarationRepaired: false,
      timestamp: new Date().toISOString(),
    })}\n`);

    console.log(`${out.record.failureClass}  decl=${declarations.length}`
      + `(exp ${c.expectedDeclarationCount})  admitted=${projection.facts.length}`
      + `  refused=${projection.refusedCount}  in=${String(out.record.inputTokens)} `
      + `out=${String(out.record.outputTokens)}  USD ${out.record.costUsd.toFixed(4)}  `
      + `cum ${spendUsd.toFixed(4)}`);

    if (out.record.failureClass === 'TRANSPORT_STRUCTURAL') {
      structurallyBlocked.push(c.caseId);
      console.log('      STRUCTURAL REJECTION; not retried, not a semantic verdict; continuing');
      continue;
    }
    if (out.record.failureClass === 'TRANSPORT_TRANSIENT') {
      stopped = `HOSTED_EXECUTION_STOPPED_FOR_TRANSPORT_REVIEW at ${c.caseId}. No second draw.`;
      console.log(`\n  STOP: ${stopped}`);
      break;
    }
  }

  // ================================================================ token report

  const all: CallRecord[] = existsSync(LEDGER)
    ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as CallRecord)
    : [];
  const ok = all.filter(r => r.inputTokens !== null && r.outputTokens !== null);
  const median = (xs: number[]): number | null => {
    if (xs.length === 0) return null;
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 === 1 ? (s[m] as number) : (((s[m - 1] as number) + (s[m] as number)) / 2);
  };
  const medIn = median(ok.map(r => r.inputTokens as number));
  const medOut = median(ok.map(r => r.outputTokens as number));

  /**
   * §210F's OWN measured figures, read from its persisted token report rather than retyped. A
   * retyped literal is exactly the EXECUTOR_DEFECT_1 shape, and a wrong comparison number is a
   * defect even when it changes no verdict. §210F is the right comparison: it is the immediately
   * prior run in this lineage and the §210H projection was derived from its medians.
   */
  const f210Report = JSON.parse(readFileSync(join(
    ROOT, 'verification', 'expert-hazlenz-210f-hosted-confirmation-2026-09-09',
    'TOKEN-REPORT-210F.json'), 'utf8')) as any;
  const F210_MEDIAN_INPUT = f210Report.medianInputTokens as number;
  const F210_MEDIAN_OUTPUT = f210Report.medianOutputTokens as number;
  const F210_CUMULATIVE_USD = f210Report.cumulativeCostUsd as number;
  const F210_PER_CALL_USD = f210Report.costPerObservationUsd as number;

  const G_DELTA =
    prereg.tokenAndSpendProjection.section210gStaticDeltaTokensEstimated as number;
  const PROJECTED_IN = prereg.tokenAndSpendProjection.projectedInputTokensPerCall as number;

  const report = {
    artifact: 'SECTION_210H_TOKEN_REPORT',
    executorVersion: EXECUTOR_VERSION,
    authorizationReference: AUTHORIZATION_REFERENCE,
    preregistrationSha256: preregSha,
    instructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
    instructionIdentitySha256: AUTHORIZED_PLAIN_INSTRUCTION_IDENTITY,
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModels: Array.from(new Set(all.map(r => r.respondedModel))),
    cachingEnabled: false,
    cacheCreationInputTokens: 'NOT_APPLICABLE — CACHING_DISABLED',
    cacheReadInputTokens: 'NOT_APPLICABLE — CACHING_DISABLED',
    cacheNote: 'Caching was deliberately disabled. Absent or zero provider cache fields in this run '
      + 'are NOT evidence about cache effectiveness and may not be read as such.',
    callsAttempted: all.length,
    callsReachingInference: ok.length,
    transportFailures: all.filter(r => r.failureClass.startsWith('TRANSPORT')).map(r => ({
      caseId: r.caseId, failureClass: r.failureClass, httpStatus: r.httpStatus,
    })),
    structurallyBlockedCases: structurallyBlocked,
    anyCallReachedMaxTokens: all.some(r => r.stopReason === 'max_tokens'),
    retries: 0,
    verifierCalls: 0,
    governedStageCalls: 0,
    databaseOperations: 0,
    perCall: all.map(r => ({
      caseId: r.caseId, inputTokens: r.inputTokens, outputTokens: r.outputTokens,
      costUsd: Number(r.costUsd.toFixed(6)), latencyMs: r.latencyMs, stopReason: r.stopReason,
      failureClass: r.failureClass,
    })),
    logicalInputTokensTotal: ok.reduce((a, r) => a + (r.inputTokens as number), 0),
    outputTokensTotal: ok.reduce((a, r) => a + (r.outputTokens as number), 0),
    medianInputTokens: medIn,
    medianOutputTokens: medOut,
    cumulativeCostUsd: Number(spendUsd.toFixed(6)),
    costPerObservationUsd: all.length > 0 ? Number((spendUsd / all.length).toFixed(6)) : null,
    hardCeilingUsd: HARD_SPEND_CEILING_USD,
    withinCeiling: spendUsd <= HARD_SPEND_CEILING_USD,
    projectedSpendUsd: prereg.tokenAndSpendProjection.projectedSpendUsd,
    projectedInputTokensPerCall: PROJECTED_IN,
    comparisonWith210F: {
      section210fMedianInputTokens: F210_MEDIAN_INPUT,
      section210fMedianOutputTokens: F210_MEDIAN_OUTPUT,
      section210fCumulativeCostUsd: F210_CUMULATIVE_USD,
      section210fCostPerObservationUsd: F210_PER_CALL_USD,
      section210hMedianInputTokens: medIn,
      section210hMedianOutputTokens: medOut,
      observedMedianInputDelta: medIn === null ? null : medIn - F210_MEDIAN_INPUT,
      section210gEstimatedStaticDeltaTokens: G_DELTA,
      consistencyStatement: 'The observed median-input delta is NOT a clean measurement of the '
        + '§210G static delta. The §210H observations are different texts from the §210F stimuli, '
        + 'with different lengths and different per-case schema enums, so per-case input varies for '
        + 'several reasons at once. Reported as broadly consistent or not, without claiming '
        + 'precision an uncontrolled comparison cannot support. §210F figures are read from its own '
        + 'persisted token report, not retyped.',
    },
    productionEconomicsClaim: 'NONE. Three development cases do not establish production token '
      + 'economics and none is claimed.',
    stopped,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'TOKEN-REPORT-210H.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log('\n================ TOKEN REPORT');
  console.log(`  calls attempted        : ${all.length} of ${CALLS} `
    + `(${ok.length} reached inference)`);
  console.log(`  transport failures     : ${report.transportFailures.length}`);
  console.log(`  reached max_tokens     : ${String(report.anyCallReachedMaxTokens)}`);
  console.log(`  cumulative cost        : USD ${spendUsd.toFixed(4)} `
    + `(ceiling ${HARD_SPEND_CEILING_USD.toFixed(2)}, projected 0.2369)`);
  console.log(`  cost per observation   : USD ${(spendUsd / Math.max(all.length, 1)).toFixed(4)}`);
  console.log(`  median input tokens    : ${String(medIn)} (projected ${PROJECTED_IN}, `
    + `§210F ${F210_MEDIAN_INPUT})`);
  console.log(`  median output tokens   : ${String(medOut)} (§210F ${F210_MEDIAN_OUTPUT})`);
  console.log(`  cache fields           : NOT_APPLICABLE — CACHING_DISABLED`);
  if (stopped !== null) console.log(`  STOPPED                : ${stopped}`);
  console.log(`\n  evidence written to ${EVID}`);
}

main().catch((e: Error) => {
  console.error(`\n§210H ABORT: ${e.message}`);
  console.error(`  calls made: ${callsMade}, spend USD ${spendUsd.toFixed(4)}. Evidence preserved.`);
  process.exit(2);
});
