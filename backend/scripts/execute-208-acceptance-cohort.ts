/**
 * §208 -- FRESH EXPERT HAZLENZ ACCEPTANCE COHORT EXECUTION. BOUNDED PROVIDER EXECUTION.
 *
 * THIS IS THE ACCEPTANCE EXECUTION. IT IS NOT A DEVELOPMENT EXPERIMENT.
 *
 * ==================== WHAT MAY NOT HAPPEN ONCE THE FIRST CALL IS MADE ====================
 *
 * No prompt, contract, representation, verifier, settlement-boundary or escalation change. No
 * truth-specification change. No gate, denominator or applicability change. No regeneration of a
 * case with different wording. No retry of a case because its answer looked poor. FAILURES ARE
 * PRESERVED -- they are the acceptance evidence.
 *
 * ==================== STAGES, AND WHY THEY ARE SEPARATE INVOCATIONS ====================
 *
 *   --stage=first-pass   one R2 call per frozen case, capability-ABSENT, 24 calls
 *   --stage=governed     one governed-binding call per governed case that admitted a fact
 *   --stage=verifier     one verifier-v3.2 call per admitted OwedFact
 *
 * Each stage writes an APPEND-ONLY evidence file and REFUSES to overwrite one that exists. §206's
 * operator error -- a diagnostic command that re-required the executor and silently re-spent a
 * first-pass call -- is the reason. A stage that has already run cannot be re-run into the same
 * evidence file, so a re-invocation cannot quietly re-spend.
 *
 * ==================== WHY GOVERNED RECORDS DO NOT REACH THE FIRST PASS ====================
 *
 * The frozen architecture is §202's SEPARATE GOVERNED STAGE, hosted-proven in §206. The first pass
 * is capability-ABSENT on every case, governed or not: its schema carries no governed-binding
 * property, and the §206 guard -- retained here unchanged -- refuses to transmit a first-pass
 * request containing one anywhere. The governed relation crosses on its own call, against the
 * facts the first pass actually produced. Supplying the records to the first pass would send the
 * retired capability-PRESENT shape that §199 recorded as COMPILED_GRAMMAR_TOO_LARGE.
 *
 * ==================== BOUNDS ====================
 *
 *   first pass          24 calls (one per frozen case)
 *   governed stage      <= 3 calls
 *   verifier            <= 24 calls
 *   structural maximum  51
 *   HARD CALL CEILING   57  (structural max + the 6 preregistered retries)
 *   HARD SPEND CEILING  USD 6.00, enforced before every call against the worst case
 *   database operations 0
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---- .env, exactly as §199 and §206 load it: never overwriting an already-exported variable.
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
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema,
} from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_INSTRUCTION_R2_VERSION, buildExpertR2SystemPrompt,
} from './lib/expert-205-first-pass-instruction-r2';
import { describeGrammarProjection203 } from './lib/expert-203-effective-grammar-identity';
import {
  type BindingCandidateFact202, type Governed202Record, type Governed202StageInput,
  sealFactIdentities,
} from './lib/expert-202-governed-binding-contract';
import { buildGoverned202Request } from './lib/expert-202-governed-stage-pipeline';
import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { projectOwedFact } from
  '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
  VERIFIER_V3_2_RESPONSE_SCHEMA, buildVerifierV3UserPrompt,
} from './lib/expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import {
  EXPERT_VERIFIER_CONTRACT_V3_3_VERSION, checkVerifierV3_3Output,
} from './lib/expert-verifier-contract-v3-3';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { FROZEN_TRUTH_CASES } from './lib/expert-207-truth-specification';
import { cohortExecutionPermitted } from './lib/expert-207-execution-gate';
import { callPlan } from './lib/expert-207-protocols';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const EXECUTOR_VERSION = 'hazlenz.expert.208.acceptance-cohort-execution.v1' as const;

/** The §208 product-owner authorization this run is executed under. */
const AUTHORIZATION_REFERENCE = 'SECTION-208-PRODUCT-OWNER-AUTHORIZATION-2026-09-08' as const;
const AUTHORIZED_PREREGISTRATION_IDENTITY =
  '879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

// ================================================================ bounds

const HARD_CALL_CEILING = 57;
const SPEND_CEILING_USD = 6.0;
const FIRST_PASS_MAX_TOKENS = 4000;
const VERIFIER_MAX_TOKENS = 4000;
const GOVERNED_MAX_TOKENS = 1500;
const GOVERNED_TOOL_NAME = 'emit_governed_binding';

const WORST_FIRST_PASS_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 10 + (26_000 / 1e6) * 2;
const WORST_VERIFIER_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (14_000 / 1e6) * 2;
const WORST_GOVERNED_USD = (GOVERNED_MAX_TOKENS / 1e6) * 10 + (6_000 / 1e6) * 2;

const STAGE = (process.argv.find(a => a.startsWith('--stage='))?.slice(8) ?? '') as
  'first-pass' | 'governed' | 'verifier' | '';

const LEDGER = join(EVID, 'CALL-LEDGER-208.jsonl');
const FIRST_PASS_FILE = join(EVID, 'RAW-FIRST-PASS-208.jsonl');
const PROJECTION_FILE = join(EVID, 'PROJECTION-208.jsonl');
/**
 * The corrected first-pass projection, re-derived from the PERSISTED raw output after the executor
 * parameterisation defect recorded in EXECUTOR-DEFECT-REGISTER-208.md. Downstream stages read it
 * where it exists; the original is preserved and never deleted.
 */
const PROJECTION_CORRECTED_FILE = join(EVID, 'PROJECTION-208-CORRECTED.jsonl');
const GOVERNED_FILE = join(EVID, 'RAW-GOVERNED-208.jsonl');
const VERIFIER_FILE = join(EVID, 'RAW-VERIFIER-208.jsonl');

// ================================================================ execution gate

const gate = cohortExecutionPermitted({
  repoRoot: ROOT,
  governedTransportSmokePassed: true,
  authorization: {
    productOwnerReviewRecorded: true,
    cohortExecutionAuthorized: true,
    authorizationReference: AUTHORIZATION_REFERENCE,
  },
});

console.log('================ §208 EXECUTION GATE (zero provider calls so far)');
console.log(`  pin              : ${gate.pin}`);
console.log(`  source identity  : ${gate.sourceIdentity}`);
console.log(`  record verified  : ${gate.verification?.code ?? 'record not loaded'}`);
console.log(`  authorization    : ${AUTHORIZATION_REFERENCE}`);
console.log(`  permitted        : ${String(gate.permitted)}`);
for (const b of gate.blockers) console.log(`  BLOCKER          : ${b}`);

if (!gate.permitted) {
  console.error('\n§208 ABORT BEFORE PROVIDER EXECUTION: the execution gate refuses. ZERO PROVIDER '
    + 'CALLS WERE MADE. A prerequisite is NOT repaired inside an already-started acceptance run.');
  process.exit(1);
}
if (gate.sourceIdentity !== AUTHORIZED_PREREGISTRATION_IDENTITY
  || gate.pin !== AUTHORIZED_PREREGISTRATION_IDENTITY) {
  console.error('\n§208 ABORT: the identity authorized by the product owner '
    + `(${AUTHORIZED_PREREGISTRATION_IDENTITY}) is not the identity the gate reports. ZERO `
    + 'PROVIDER CALLS WERE MADE.');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey === undefined || apiKey === '') {
  console.error('\n§208 ABORT: ANTHROPIC_API_KEY is not set. ZERO PROVIDER CALLS WERE MADE.');
  process.exit(1);
}

// ================================================================ frozen inputs

interface CaseExecutionInput {
  readonly caseId: string;
  readonly input: ExpertAnalysisInput;
  readonly observation: string;
  readonly jurisdiction: string;
  readonly governedRecords: readonly Governed202Record[];
  readonly location: string;
  readonly task: string;
}

function buildCaseInput(c: (typeof FROZEN_TRUTH_CASES)[number]): CaseExecutionInput {
  return {
    caseId: c.caseId,
    observation: c.observation,
    jurisdiction: c.jurisdiction,
    location: c.location,
    task: c.task,
    governedRecords: (c.governed?.records ?? []).map(r => ({ sourceId: r.sourceId, text: r.text })),
    input: {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId: `AN-208-${c.caseId}`,
      authoritativeSources: [
        { sourceId: `OBS-${c.caseId}`, sourceType: 'observation', text: c.observation },
      ],
      inspectionContext: { location: c.location, task: c.task },
      jurisdiction: c.jurisdiction,
      allowedHazardFamilies: [...c.allowedHazardFamilies],
      deterministicFindings: [],
      // The separate governed stage owns governed evidence. The first pass sees none.
      governedStandards: [],
      answeredClarifications: [],
    },
  };
}

const CASES: readonly CaseExecutionInput[] = FROZEN_TRUTH_CASES.map(buildCaseInput);

/**
 * The retired capability-PRESENT shape, per case, built ONLY so the pre-transmission guard can
 * compare against real objects rather than against a property name. Never placed in a request body
 * and never returned from any function that a transmission path calls.
 */
function retiredPresentForComparisonOnly(c: CaseExecutionInput): {
  canonical: string; asSent: string; identity: string;
} {
  const ids = c.governedRecords.map(r => r.sourceId);
  const schema = buildExpertVNextWireSchema(c.input, {
    governedEvidenceSourceIds: ids.length > 0 ? ids : ['GOV-PLACEHOLDER'],
  });
  return {
    canonical: JSON.stringify(schema),
    asSent: JSON.stringify(stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema))),
    identity: describeGrammarProjection203(
      schema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity,
  };
}

// ================================================================ transport

interface CallRecord {
  callIndex: number;
  leg: 'FIRST_PASS' | 'GOVERNED_STAGE' | 'VERIFIER';
  caseId: string;
  factKey: string | null;
  provider: string;
  requestedModel: string;
  respondedModel: string | null;
  canonicalSchemaBytes: number;
  canonicalSchemaGrammarId: string;
  transmittedSchemaBytes: number;
  transmittedBodyBytes: number;
  transmittedSchemaSha256: string;
  inputIdentitySha256: string;
  retiredPresentFormTransmitted: false;
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

function loadLedgerState(): void {
  if (!existsSync(LEDGER)) return;
  for (const line of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line) as CallRecord;
    callsMade += 1;
    spendUsd += r.costUsd;
    if (r.retried) retriesUsed += 1;
  }
  console.log(`  resumed ledger   : ${callsMade} prior calls, USD ${spendUsd.toFixed(6)} spent`);
}

/**
 * Classify a provider outcome against the FROZEN §207 failure vocabulary. Nothing here decides a
 * semantic verdict, and a structural failure never becomes one.
 */
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

interface CallOutcome {
  record: CallRecord;
  parsed: Record<string, unknown> | null;
  raw: unknown;
}

interface CallArgs {
  leg: CallRecord['leg'];
  caseId: string;
  factKey?: string | null;
  systemPrompt: string;
  userPrompt: string;
  toolName: string;
  canonicalSchema: Record<string, unknown>;
  schemaAsSent: unknown;
  maxTokens: number;
  worstCaseUsd: number;
  guardCase?: CaseExecutionInput;
  retryReason?: string;
  /**
   * Anthropic strict tool mode. TRUE for the first pass and the governed stage, which is what §206
   * transmitted and what the provider accepted. FALSE for the verifier, because §199 executed the
   * verifier leg 8/8 with `input_schema: VERIFIER_V3_2_RESPONSE_SCHEMA` and NO strict flag, and
   * that is the artifact under test. See EXECUTOR-DEFECT-REGISTER-208.md entry 2.
   */
  strictTool: boolean;
}

async function providerCall(args: CallArgs): Promise<CallOutcome> {
  if (callsMade >= HARD_CALL_CEILING) {
    throw new Error(`§208 HARD CALL CEILING ${HARD_CALL_CEILING} reached; refusing to call. `
      + 'Evidence is preserved; a new product-owner authorization is required.');
  }
  if (spendUsd + args.worstCaseUsd > SPEND_CEILING_USD) {
    throw new Error(`§208 HARD SPEND CEILING USD ${SPEND_CEILING_USD} would be exceeded `
      + `(spent ${spendUsd.toFixed(4)}, worst case ${args.worstCaseUsd.toFixed(4)}); refusing.`);
  }

  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: args.maxTokens,
    system: args.systemPrompt,
    messages: [{ role: 'user', content: args.userPrompt }],
    tools: [args.strictTool
      ? {
        name: args.toolName,
        description: 'Emit the structured result. This is the ONLY way to answer.',
        strict: true,
        input_schema: args.schemaAsSent,
      }
      : {
        name: args.toolName,
        description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
        input_schema: args.schemaAsSent,
      }],
    tool_choice: { type: 'tool', name: args.toolName },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);

  // FINAL GUARD, immediately before transmission. Carried forward from §206 UNCHANGED in meaning:
  // the retired capability-PRESENT FIRST-PASS schema is refused by whole-schema equality and by
  // grammar identity, and a capability-ABSENT first pass must carry no governed-binding property
  // anywhere in its request.
  if (args.guardCase !== undefined) {
    const retired = retiredPresentForComparisonOnly(args.guardCase);
    const canonicalJson = JSON.stringify(args.canonicalSchema);
    if (canonicalJson === retired.canonical
      || JSON.stringify(args.schemaAsSent) === retired.asSent) {
      throw new Error('§208 ABORT: the retired capability-PRESENT first-pass schema is in a '
        + 'request body. Refusing to transmit.');
    }
    if (describeGrammarProjection203(
      args.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity
      === retired.identity) {
      throw new Error('§208 ABORT: a first-pass request carries the retired capability-PRESENT '
        + 'grammar identity. Refusing to transmit.');
    }
  }
  if (args.leg === 'FIRST_PASS' && wire.includes('governedEvidenceSourceIds')) {
    throw new Error('§208 ABORT: the capability-ABSENT first pass must carry no governed-binding '
      + 'property anywhere in its request. Refusing to transmit.');
  }

  callsMade += 1;
  if (args.retryReason !== undefined) retriesUsed += 1;
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

  const failureClass = classify({
    httpStatus,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    parsed,
    hadToolUseBlock: block !== undefined,
  });

  const record: CallRecord = {
    callIndex: callsMade,
    leg: args.leg,
    caseId: args.caseId,
    factKey: args.factKey ?? null,
    provider: 'anthropic',
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: (json.model as string | undefined) ?? null,
    canonicalSchemaBytes: bytes(args.canonicalSchema),
    canonicalSchemaGrammarId: describeGrammarProjection203(
      args.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity,
    transmittedSchemaBytes: bytes(args.schemaAsSent),
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    transmittedSchemaSha256: sha(JSON.stringify(args.schemaAsSent)),
    inputIdentitySha256: sha(`${args.systemPrompt} ${args.userPrompt}`),
    retiredPresentFormTransmitted: false,
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
    failureClass,
    retried: args.retryReason !== undefined,
    retryReason: args.retryReason ?? null,
    timestamp: new Date().toISOString(),
  };

  mkdirSync(EVID, { recursive: true });
  appendFileSync(LEDGER, `${JSON.stringify(record)}\n`);
  return { record, parsed, raw: json };
}

/**
 * Apply the FROZEN retry rule: exactly one BYTE-IDENTICAL retry, and only for the three
 * transport-class failures. Degenerate output is NEVER retried, and a zero-declaration response is
 * NO_FAILURE and is never retried either -- on four frozen cases it is the correct answer.
 */
async function callWithFrozenRetryPolicy(args: CallArgs): Promise<CallOutcome> {
  const first = await providerCall(args);
  const cls = first.record.failureClass;
  if (cls === 'NO_FAILURE' || cls === 'TRANSPORT_STRUCTURAL') return first;
  if (retriesUsed >= callPlan().retryAllowancePerRun) {
    console.log(`      retry budget exhausted (${retriesUsed}); not retrying ${cls}`);
    return first;
  }
  console.log(`      ${cls} -> ONE BYTE-IDENTICAL RETRY`);
  return providerCall({ ...args, retryReason: cls });
}

function abortOnStructuralRejection(rec: CallRecord): void {
  if (rec.failureClass !== 'TRANSPORT_STRUCTURAL') return;
  console.error('\n§208 ABORT: STRUCTURAL PROVIDER REJECTION. The frozen protocol makes the run '
    + 'VOID for acceptance purposes. Evidence is preserved and NOTHING is simplified, shortened, '
    + 'rewritten or re-grammared to obtain acceptance.');
  console.error(`  case ${rec.caseId} leg ${rec.leg} HTTP ${String(rec.httpStatus)} `
    + `${rec.providerErrorType ?? ''} ${rec.providerErrorMessage ?? ''}`);
  process.exit(2);
}

// ================================================================ stages

const refuseOverwrite = (path: string, label: string): void => {
  if (existsSync(path)) {
    throw new Error(`§208 ABORT: ${label} already exists at ${path}. Refusing to overwrite `
      + 'persisted acceptance evidence. A stage that has run cannot be re-run into the same file.');
  }
};

async function runFirstPass(): Promise<void> {
  refuseOverwrite(FIRST_PASS_FILE, 'RAW-FIRST-PASS-208.jsonl');
  refuseOverwrite(PROJECTION_FILE, 'PROJECTION-208.jsonl');
  mkdirSync(EVID, { recursive: true });
  writeFileSync(FIRST_PASS_FILE, '');
  writeFileSync(PROJECTION_FILE, '');

  for (const c of CASES) {
    const schema = buildExpertVNextWireSchema(c.input, { governedEvidenceSourceIds: [] });
    const schemaAsSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));
    const systemPrompt = buildExpertR2SystemPrompt({ governedEvidenceSourceIds: [] });
    const userPrompt = buildExpertVNextUserPrompt(c.input, []);

    process.stdout.write(`  ${c.caseId} first pass ... `);
    const out = await callWithFrozenRetryPolicy({
      leg: 'FIRST_PASS',
      caseId: c.caseId,
      systemPrompt,
      userPrompt,
      toolName: EXPERT_TOOL_NAME,
      canonicalSchema: schema,
      schemaAsSent,
      maxTokens: FIRST_PASS_MAX_TOKENS,
      worstCaseUsd: WORST_FIRST_PASS_USD,
      strictTool: true,
      guardCase: c,
    });
    abortOnStructuralRejection(out.record);

    const parsed = out.parsed ?? {};
    const rawDeclarations = Array.isArray((parsed as any).unresolvedFactDeclarations)
      ? (parsed as any).unresolvedFactDeclarations as unknown[]
      : [];

    appendFileSync(FIRST_PASS_FILE, `${JSON.stringify({
      caseId: c.caseId,
      recordKind: 'FIRST_PASS',
      callIndex: out.record.callIndex,
      preregistrationIdentity: AUTHORIZED_PREREGISTRATION_IDENTITY,
      firstPassInstructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_R2_VERSION,
      grammarIdentity: out.record.canonicalSchemaGrammarId,
      inputIdentitySha256: out.record.inputIdentitySha256,
      respondedModel: out.record.respondedModel,
      failureClass: out.record.failureClass,
      reachedInference: out.record.reachedInference,
      stopReason: out.record.stopReason,
      rawPersistedBeforeDerivation: true,
      raw: out.raw,
      parsed: out.parsed,
      declarationCount: rawDeclarations.length,
      usage: {
        inputTokens: out.record.inputTokens,
        outputTokens: out.record.outputTokens,
        costUsd: Number(out.record.costUsd.toFixed(6)),
      },
      timestamp: out.record.timestamp,
    })}\n`);

    const projection = projectDeclaredOwedFacts({
      declarations: rawDeclarations,
      sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
      suppliedGovernedSourceIds: c.governedRecords.map(g => g.sourceId),
      stage: 'FIRST_PASS_MODEL',
    });
    const preservation = preserveIdentifiedSafetyFacts(projection, rawDeclarations);

    appendFileSync(PROJECTION_FILE, `${JSON.stringify({
      caseId: c.caseId,
      projectionVersion: projection.version,
      rawDeclarationCount: rawDeclarations.length,
      admittedCount: projection.facts.length,
      refusedCount: projection.refusedCount,
      perDeclaration: projection.perDeclaration.map(p => ({
        declarationId: p.declarationId,
        admitted: p.admitted,
        codes: p.codes,
        detail: p.detail,
        factKey: p.factKey,
        owedFact: p.owedFact,
      })),
      declarationIdToFactKey: projection.declarationIdToFactKey,
      rr7: {
        preservedCount: preservation.preserved.length,
        preserved: preservation.preserved,
        dispositions: preservation.dispositions,
        safetyStateComplete: preservation.safetyStateComplete,
        totalLossOnThisRow: preservation.totalLossOnThisRow,
      },
      governedIdsNamedByDeclarations: rawDeclarations
        .map((d: any) => (Array.isArray(d?.governedEvidenceSourceIds)
          ? d.governedEvidenceSourceIds as string[] : []))
        .flat(),
      timestamp: new Date().toISOString(),
    })}\n`);

    console.log(`${out.record.rawStructuralOutcome} decl=${rawDeclarations.length} `
      + `admitted=${projection.facts.length} refused=${projection.refusedCount} `
      + `preserved=${preservation.preserved.length} complete=${String(preservation.safetyStateComplete)} `
      + `$${out.record.costUsd.toFixed(4)}`);
  }
}

interface ProjectedTarget {
  caseId: string;
  declarationId: string;
  owedFact: any;
  factKey: string;
}

function loadTargets(): ProjectedTarget[] {
  const source = existsSync(PROJECTION_CORRECTED_FILE) ? PROJECTION_CORRECTED_FILE : PROJECTION_FILE;
  if (!existsSync(source)) {
    throw new Error('§208 ABORT: no persisted projection evidence to resume against.');
  }
  console.log(`  projection source: ${source.split('/').pop() ?? ''}`);
  const targets: ProjectedTarget[] = [];
  for (const line of readFileSync(source, 'utf8').split('\n').filter(Boolean)) {
    const pr = JSON.parse(line) as any;
    for (const p of pr.perDeclaration as any[]) {
      if (p.admitted === true && p.owedFact !== null && p.owedFact !== undefined) {
        targets.push({
          caseId: pr.caseId as string,
          declarationId: p.declarationId as string,
          owedFact: p.owedFact,
          factKey: p.factKey as string,
        });
      }
    }
  }
  return targets;
}

async function runGoverned(): Promise<void> {
  refuseOverwrite(GOVERNED_FILE, 'RAW-GOVERNED-208.jsonl');
  mkdirSync(EVID, { recursive: true });
  writeFileSync(GOVERNED_FILE, '');
  loadLedgerState();

  const targets = loadTargets();
  for (const c of CASES) {
    if (c.governedRecords.length === 0) continue;
    const facts = targets.filter(t => t.caseId === c.caseId);
    if (facts.length === 0) {
      appendFileSync(GOVERNED_FILE, `${JSON.stringify({
        caseId: c.caseId,
        recordKind: 'GOVERNED_STAGE_NOT_CALLED',
        reason: 'the first pass admitted no owed fact on this case, so there is no candidate fact '
          + 'to nominate a governed binding for. This is NOT a provider failure and NOT a '
          + 'degenerate output; on AC-24 zero declarations is the frozen correct answer.',
        timestamp: new Date().toISOString(),
      })}\n`);
      console.log(`  ${c.caseId} governed  ... NOT CALLED (no admitted fact)`);
      continue;
    }

    const candidates: BindingCandidateFact202[] = facts.map(t => ({
      factKey: t.owedFact.factKey as string,
      owedProperty: null,
      affectedDecision: t.owedFact.affectedDecision as string,
      evidenceSpan: String(t.owedFact.evidenceSpan ?? ''),
      whyUnresolved: String(t.owedFact.whyUnresolved ?? ''),
      branchA: String(t.owedFact.branchA ?? ''),
      branchB: String(t.owedFact.branchB ?? ''),
    })) as unknown as BindingCandidateFact202[];

    const stageInput: Governed202StageInput = {
      analysisId: `AN-208-${c.caseId}`,
      facts: candidates,
      governedRecords: c.governedRecords,
      inspectionContext: { location: c.location, task: c.task },
      identitySeal: sealFactIdentities(`AN-208-${c.caseId}`, candidates),
    };
    const request = buildGoverned202Request(stageInput);

    process.stdout.write(`  ${c.caseId} governed  ... `);
    const out = await callWithFrozenRetryPolicy({
      leg: 'GOVERNED_STAGE',
      caseId: c.caseId,
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt,
      toolName: GOVERNED_TOOL_NAME,
      canonicalSchema: request.schema as Record<string, unknown>,
      schemaAsSent: request.schemaAsSent,
      maxTokens: GOVERNED_MAX_TOKENS,
      worstCaseUsd: WORST_GOVERNED_USD,
      strictTool: true,
    });
    abortOnStructuralRejection(out.record);

    appendFileSync(GOVERNED_FILE, `${JSON.stringify({
      caseId: c.caseId,
      recordKind: 'GOVERNED_STAGE',
      callIndex: out.record.callIndex,
      suppliedSourceIds: c.governedRecords.map(g => g.sourceId),
      mintedReferences: candidates.map((f, i) => ({ ref: `F${i + 1}`, factKey: f.factKey })),
      grammarIdentity: out.record.canonicalSchemaGrammarId,
      canonicalSchemaBytes: out.record.canonicalSchemaBytes,
      failureClass: out.record.failureClass,
      stopReason: out.record.stopReason,
      rawPersistedBeforeDerivation: true,
      raw: out.raw,
      parsed: out.parsed,
      topLevelKeys: out.parsed === null ? [] : Object.keys(out.parsed),
      usage: {
        inputTokens: out.record.inputTokens,
        outputTokens: out.record.outputTokens,
        costUsd: Number(out.record.costUsd.toFixed(6)),
      },
      timestamp: out.record.timestamp,
    })}\n`);
    console.log(`${out.record.rawStructuralOutcome} keys=`
      + `${out.parsed === null ? '-' : Object.keys(out.parsed).join(',')} `
      + `$${out.record.costUsd.toFixed(4)}`);
  }
}

async function runVerifier(): Promise<void> {
  refuseOverwrite(VERIFIER_FILE, 'RAW-VERIFIER-208.jsonl');
  mkdirSync(EVID, { recursive: true });
  writeFileSync(VERIFIER_FILE, '');
  loadLedgerState();

  const fpByCase = new Map<string, any>();
  for (const line of readFileSync(FIRST_PASS_FILE, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line) as any;
    fpByCase.set(r.caseId as string, r);
  }

  const targets = loadTargets();
  for (const t of targets) {
    const c = CASES.find(x => x.caseId === t.caseId);
    if (c === undefined) throw new Error(`§208 ABORT: unknown case ${t.caseId}`);
    const fp = fpByCase.get(t.caseId)?.parsed ?? {};
    const projected = projectOwedFact(t.owedFact);
    const analysisId = `AN-208-${t.caseId}-${t.factKey}`;

    const userPrompt = buildVerifierV3UserPrompt({
      caseId: t.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: c.governedRecords.map(g => ({ sourceId: g.sourceId, text: g.text })),
      deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: {
        candidates: (Array.isArray(fp.hazardCandidates) ? fp.hazardCandidates : [])
          .map((x: any) => ({
            candidateKey: String(x?.candidateKey ?? ''),
            hazardFamily: String(x?.hazardFamily ?? ''),
            assertedConditionState: String(x?.assertedConditionState ?? ''),
            evidenceBasis: String(x?.evidenceBasis ?? ''),
            reasoning: String(x?.reasoning ?? ''),
          })),
        clarifications: (Array.isArray(fp.decisionCriticalClarifications)
          ? fp.decisionCriticalClarifications : [])
          .map((x: any) => ({
            clarificationId: String(x?.clarificationId ?? ''),
            question: String(x?.question ?? ''),
            affectedDecision: String(x?.affectedDecision ?? ''),
          })),
        uncertainty: Array.isArray(fp?.uncertainty?.statements) ? fp.uncertainty.statements : [],
        summary: String(fp?.expertExplanation?.summary ?? ''),
      },
      owedFacts: [{
        factKey: projected.factKey,
        affectedDecision: projected.affectedDecision,
        whyUnresolved: String(projected.whyUnresolved ?? ''),
        branchA: projected.branchA,
        branchB: projected.branchB,
        decisionDivergence: projected.decisionDivergence,
        evidenceSpan: projected.evidenceSpan,
      }],
    });

    process.stdout.write(`  ${t.caseId} verifier ${t.factKey.slice(0, 34)} ... `);
    const out = await callWithFrozenRetryPolicy({
      leg: 'VERIFIER',
      caseId: t.caseId,
      factKey: t.factKey,
      systemPrompt: EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
      userPrompt,
      toolName: 'emit_verifier_verdict',
      canonicalSchema: VERIFIER_V3_2_RESPONSE_SCHEMA as Record<string, unknown>,
      schemaAsSent: VERIFIER_V3_2_RESPONSE_SCHEMA,
      maxTokens: VERIFIER_MAX_TOKENS,
      worstCaseUsd: WORST_VERIFIER_USD,
      // §199's shape exactly. The schema itself is byte-unchanged.
      strictTool: false,
    });
    abortOnStructuralRejection(out.record);

    const parsed = out.parsed;
    const admission = parsed === null ? null : checkVerifierV3_3Output(
      { ...parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId } as any,
      {
        analysisId,
        observation: c.observation,
        suppliedOwedFactKeys: [t.factKey],
        suppliedGovernedSourceIds: c.governedRecords.map(g => g.sourceId),
        suppliedGovernedEvidence: c.governedRecords.map(g => ({ sourceId: g.sourceId, text: g.text })),
      } as any);

    appendFileSync(VERIFIER_FILE, `${JSON.stringify({
      caseId: t.caseId,
      factKey: t.factKey,
      declarationId: t.declarationId,
      recordKind: 'VERIFIER',
      callIndex: out.record.callIndex,
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
      admissionContractVersion: EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
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
      + `${String((parsed as any)?.verdict ?? '-')} $${out.record.costUsd.toFixed(4)}`);
  }
}

// ================================================================ run

(async () => {
  mkdirSync(EVID, { recursive: true });
  if (STAGE === 'first-pass') {
    loadLedgerState();
    console.log(`\n================ §208 FIRST PASS — ${CASES.length} cases, R2 capability-ABSENT`);
    await runFirstPass();
  } else if (STAGE === 'governed') {
    console.log('\n================ §208 GOVERNED STAGE');
    await runGoverned();
  } else if (STAGE === 'verifier') {
    console.log('\n================ §208 VERIFIER STAGE');
    await runVerifier();
  } else {
    console.error('§208: --stage=first-pass | governed | verifier is required. '
      + 'ZERO PROVIDER CALLS WERE MADE.');
    process.exit(1);
  }

  console.log(`\n================ §208 STAGE COMPLETE (${STAGE})`);
  console.log(`  executor         : ${EXECUTOR_VERSION}`);
  console.log(`  calls this ledger: ${callsMade} of hard ceiling ${HARD_CALL_CEILING}`);
  console.log(`  retries used     : ${retriesUsed} of ${callPlan().retryAllowancePerRun}`);
  console.log(`  spend            : USD ${spendUsd.toFixed(6)} of ceiling ${SPEND_CEILING_USD}`);
  console.log('  database ops     : 0');
})().catch((e: Error) => {
  console.error(`\n§208 STOPPED: ${e.message}`);
  console.error('Evidence written so far is preserved. An invalid run is NOT turned into a '
    + 'completed run by ad hoc repair.');
  process.exit(3);
});
