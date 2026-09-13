/**
 * §199 -- SUCCESSOR HOSTED VALIDATION OF THE §198-REMEDIATED STRUCTURED PIPELINE.
 *
 *   --stage=prereg     freeze everything. ZERO provider calls.
 *   --stage=firstpass  transport canary, then the frozen order, under the circuit breaker.
 *   --stage=verifier   verifier-v3.3 once per projected OwedFact, against PERSISTED first-pass
 *                      evidence. Never re-runs the first pass.
 *
 * ==================== WHAT IS NEW SINCE §197 ====================
 *
 * 1. THE TRANSPORT CANARY. The first call is a real cohort row, not a throwaway. §197 issued all
 *    twelve requests into a transport that rejected every one, so §199 asks the transport question
 *    once, with a row whose result counts either way.
 *
 * 2. THE CIRCUIT BREAKER, wired in. §198 built it; §197's defect was that nothing consulted one.
 *    `mayIssueNextAttempt` is checked before every call and `recordAttempt` after every call, and
 *    an attempt that REACHED INFERENCE can never contribute to a streak.
 *
 * 3. PER-ROW CAPABILITY. The system prompt, the user prompt and the wire schema are all derived
 *    from the SAME supplied governed set, so a capability-present schema cannot be paired with a
 *    capability-absent instruction.
 *
 * ==================== SPEND ====================
 *
 * Provider-returned usage is the sole basis for actual spend, via the §188 ProviderSpendLedger. A
 * call reporting no usage adds zero to actual spend and its frozen worst case to the reservation.
 */

import { createHash } from 'crypto';
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, openSync, fsyncSync, closeSync,
} from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

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
  EXPERT_HOSTED_INFERENCE_CONFIG, EXPERT_TOOL_NAME, applyStrictSchemaWrapper,
  stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, stableStringify } from
  '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION, buildExpertVNextWireSchema,
  buildExpertVNextUserPrompt, buildExpertVNextSystemPrompt, governedBindingFor,
  governedBindingCapability, reconstructV15SystemPrompt,
  UNRESOLVED_FACT_DECLARATIONS_FIELD, CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import {
  projectDeclaredOwedFacts, resolveClarificationLinks, computeFactKey,
  FIRST_PASS_OWED_FACT_PROJECTION_VERSION, FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS,
  OWED_FACT_FIELD_PROVENANCE,
} from './lib/expert-first-pass-owed-fact-projection';
import { projectOwedFact } from
  '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, buildVerifierV3UserPrompt,
} from './lib/expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import {
  checkVerifierV3_3Output, EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
} from './lib/expert-verifier-contract-v3-3';
import {
  SECTION_199_COHORT, SECTION_199_COHORT_VERSION, COHORT_COVERAGE, TRUTH_PROVENANCE,
  TRANSPORT_CANARY_ROW_ID, cohortDesignDefects, type Section199Row,
} from './lib/expert-199-cohort-2026-09-07';
import {
  initialBreakerState, recordAttempt, mayIssueNextAttempt, preInferenceSignature,
  SYSTEMATIC_PRE_INFERENCE_REJECTION, CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP,
  type BreakerState,
} from './lib/expert-pre-inference-circuit-breaker';
import { ProviderSpendLedger } from './lib/expert-provider-spend-accounting';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');
const LIB = join(__dirname, 'lib');
const EXECUTOR_VERSION = 'hazlenz.expert.199.successor-e2e-executor.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const fsyncWrite = (p: string, s: string): void => {
  writeFileSync(p, s);
  const fd = openSync(p, 'r+'); fsyncSync(fd); closeSync(fd);
};

const FIRST_PASS_MAX_TOKENS = 8000;
const VERIFIER_MAX_TOKENS = 4000;
const HARD_TOTAL_CALL_CEILING = 36;
const FIRST_PASS_ROWS = SECTION_199_COHORT.length;
const SPEND_CEILING_USD = 6.0;
const RETRIES = 0;
const WORST_FIRST_PASS_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 10 + (24000 / 1e6) * 2;
const WORST_VERIFIER_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (12000 / 1e6) * 2;

const PREREG_PATH = join(EVID, 'PREREGISTRATION.json');
const FIRST_PASS_FILE = join(EVID, 'RAW-FIRST-PASS-OUTPUTS.jsonl');
const PROJECTION_FILE = join(EVID, 'PROJECTION-PROVENANCE.jsonl');
const VERIFIER_FILE = join(EVID, 'RAW-VERIFIER-OUTPUTS.jsonl');
const BREAKER_FILE = join(EVID, 'CIRCUIT-BREAKER-LOG.jsonl');

// ---------------------------------------------------------------- request construction

const recordsFor = (row: Section199Row): { sourceId: string; text: string }[] =>
  row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));

function analysisInput(row: Section199Row): ExpertAnalysisInput {
  return {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-199-${row.rowId}`,
    authoritativeSources: [
      { sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation },
    ],
    inspectionContext: { location: row.location, task: row.task },
    jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })),
    answeredClarifications: [],
  };
}

/** Prompt, schema and user prompt all derive from ONE binding. That is the §198 invariant. */
function firstPassRequest(row: Section199Row): {
  body: Record<string, unknown>; systemPrompt: string; userPrompt: string;
  schema: Record<string, unknown>; capability: 'ABSENT' | 'PRESENT';
} {
  const input = analysisInput(row);
  const records = recordsFor(row);
  const binding = governedBindingFor(records);
  const systemPrompt = buildExpertVNextSystemPrompt(binding);
  const userPrompt = buildExpertVNextUserPrompt(input, records);
  const schema = buildExpertVNextWireSchema(input, binding);
  return {
    capability: governedBindingCapability(binding),
    systemPrompt, userPrompt, schema,
    body: {
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      max_tokens: FIRST_PASS_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [{
        name: EXPERT_TOOL_NAME,
        description: 'Emit the Expert HazLenz advisory analysis. This is the ONLY way to answer.',
        strict: true,
        input_schema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema)),
      }],
      tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
      thinking: { type: 'disabled' },
    },
  };
}

// ---------------------------------------------------------------- transport

interface CallResult {
  ok: boolean; raw: unknown; parsed: Record<string, unknown> | null; failureKind: string | null;
  inputTokens: number | null; outputTokens: number | null; latencyMs: number;
  httpStatus: number | null; modelIdentity: string | null; stopReason: string | null;
  creditRejection: boolean;
  /** Set from provider-returned usage and response shape. NEVER from the status code alone. */
  reachedInference: boolean;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
}

async function callOnce(body: Record<string, unknown>, apiKey: string): Promise<CallResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const json = await response.json() as Record<string, any>;
    const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    const errType = json?.error?.type ?? null;
    const errMsg = json?.error?.message ?? null;
    const creditRejection = response.status === 400 && /credit balance is too low/i.test(String(errMsg ?? ''));
    // Generation happened if the provider billed output tokens, or returned content at all.
    const reachedInference = (usage?.output_tokens ?? 0) > 0 || Array.isArray(json.content);
    const base = {
      inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
      latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
      stopReason: json.stop_reason ?? null, creditRejection, reachedInference,
      providerErrorType: errType, providerErrorMessage: errMsg,
    };
    if (!response.ok) {
      return {
        ok: false, raw: json, parsed: null,
        failureKind: creditRejection ? 'ACCOUNT_CREDIT_REJECTION'
          : response.status === 429 ? 'RATE_LIMITED'
            : response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR',
        ...base,
      };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)
      ?.find(b => b.type === 'tool_use');
    if (!block) {
      return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL', ...base };
    }
    return { ok: true, raw: json, parsed: block.input as Record<string, unknown>, failureKind: null, ...base };
  } catch (e) {
    return {
      ok: false, raw: { error: (e as Error).message }, parsed: null, failureKind: 'TRANSPORT_ERROR',
      inputTokens: null, outputTokens: null, latencyMs: Date.now() - started, httpStatus: null,
      modelIdentity: null, stopReason: null, creditRejection: false, reachedInference: false,
      providerErrorType: 'transport', providerErrorMessage: (e as Error).message,
    };
  } finally { clearTimeout(timer); }
}

// ---------------------------------------------------------------- frozen order

function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The canary FIRST, then a seeded shuffle of the other eleven with no matched pair adjacent.
 *
 * The canary's position is not random because its position is the point: the transport question is
 * asked once, before eleven more requests of the same shape are issued.
 */
function frozenOrder(seedHex: string): Array<{ sequencePosition: number; rowId: string; isCanary: boolean }> {
  const rnd = mulberry32(parseInt(seedHex.slice(0, 8), 16));
  const pairOf = new Map(SECTION_199_COHORT.map(r => [r.rowId, r.pairedWith]));
  const rest = SECTION_199_COHORT.map(r => r.rowId).filter(id => id !== TRANSPORT_CANARY_ROW_ID);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const a = [...rest];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    const full = [TRANSPORT_CANARY_ROW_ID, ...a];
    let ok = true;
    for (let i = 1; i < full.length; i += 1) if (pairOf.get(full[i - 1]) === full[i]) { ok = false; break; }
    if (ok) return full.map((rowId, i) => ({ sequencePosition: i + 1, rowId, isCanary: i === 0 }));
  }
  throw new Error('ABORT: could not derive an order separating every matched pair after the canary');
}

// ---------------------------------------------------------------- stages

async function main(): Promise<void> {
  mkdirSync(EVID, { recursive: true });
  const stage = (process.argv.find(a => a.startsWith('--stage=')) ?? '--stage=prereg').split('=')[1];

  const absentPromptSha = sha(buildExpertVNextSystemPrompt({ governedEvidenceSourceIds: [] }));
  const presentPromptSha = sha(buildExpertVNextSystemPrompt({ governedEvidenceSourceIds: ['X'] }));
  const verifierPromptSha = sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
  const verifierSchemaSha = sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
  const cohortSha = shaFile(join(LIB, 'expert-199-cohort-2026-09-07.ts'));
  const cohort197Sha = shaFile(join(LIB, 'expert-197-cohort-2026-09-07.ts'));
  const projectionSha = shaFile(join(LIB, 'expert-first-pass-owed-fact-projection.ts'));
  const vnextModuleSha = shaFile(join(LIB, 'expert-first-pass-instruction-vnext.ts'));
  const v33Sha = shaFile(join(LIB, 'expert-verifier-contract-v3-3.ts'));
  const breakerSha = shaFile(join(LIB, 'expert-pre-inference-circuit-breaker.ts'));

  // ================================================================ prereg
  if (stage === 'prereg') {
    if (existsSync(PREREG_PATH)) throw new Error('ABORT: PREREGISTRATION.json exists; refusing to overwrite a freeze');
    const defects = cohortDesignDefects();
    if (defects.length > 0) throw new Error(`ABORT: cohort design defects — ${defects.join(' | ')}`);
    if (sha(reconstructV15SystemPrompt({ governedEvidenceSourceIds: [] })) !== sha(EXPERT_SYSTEM_PROMPT)
      || sha(reconstructV15SystemPrompt({ governedEvidenceSourceIds: ['X'] })) !== sha(EXPERT_SYSTEM_PROMPT)) {
      throw new Error('ABORT: vNext no longer reconstructs to v15 in both capability variants');
    }

    const order = frozenOrder(absentPromptSha);
    const rows = SECTION_199_COHORT.map(r => {
      const req = firstPassRequest(r);
      return {
        rowId: r.rowId,
        provenance: r.provenance,
        section197Origin: r.section197Origin,
        capability: req.capability,
        observationSha256: sha(r.observation),
        systemPromptSha256: sha(req.systemPrompt),
        userPromptSha256: sha(req.userPrompt),
        wireSchemaSha256: sha(stableStringify(req.schema)),
        sentSchemaSha256: sha(stableStringify(
          stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(req.schema)))),
        governedSourceIdsSupplied: recordsFor(r).map(g => g.sourceId),
        families: r.families,
        expectedGapCount: r.expectedGapCount,
      };
    });

    const doc = {
      artifact: 'SECTION_199_PRE_SPEND_PREREGISTRATION',
      writtenBeforeFirstProviderCall: true,
      date: '2026-09-07',
      operation: '§199 successor hosted DEVELOPMENT validation of the §198-remediated structured '
        + 'first-pass → deterministic projection → verifier-v3.3 pipeline',
      NOT_A_FORMAL_ACCEPTANCE_RUN: true,
      NOT_CUSTOMER_OR_PRODUCTION_ACTIVATION: true,
      NOT_M14: true,
      DOES_NOT_RESOLVE_THE_THREE_SECTION_196_CONTRACT_QUESTIONS: true,
      supersedes: {
        section197Preregistration: 'RETIRED — its pinned vNext prompt hash and every per-row '
          + 'wireSchemaSha256 moved at §198. §199 does not execute under it.',
        section197PreregSha256: (() => {
          const p = join(ROOT, 'verification', 'expert-hazlenz-structured-e2e-validation-2026-09-07',
            'PREREGISTRATION.json');
          return existsSync(p) ? shaFile(p) : null;
        })(),
      },
      worktree: {
        branch: execSync(`git -C ${JSON.stringify(ROOT)} rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim(),
        head: execSync(`git -C ${JSON.stringify(ROOT)} rev-parse HEAD`, { encoding: 'utf8' }).trim(),
        dirtyPathCount: Number(execSync(`git -C ${JSON.stringify(ROOT)} status --porcelain | wc -l`, { encoding: 'utf8' }).trim()),
        dirtyNote: 'substantial pre-existing uncommitted work from earlier slices is present and is '
          + 'preserved. §199 adds files and never resets, checks out, restores, stashes or cleans.',
        executorSha256: shaFile(join(__dirname, 'execute-199-structured-e2e-2026-09-07.ts')),
      },
      firstPassIdentity: {
        instructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
        capabilityAbsentSystemPromptSha256: absentPromptSha,
        capabilityPresentSystemPromptSha256: presentPromptSha,
        twoPromptVariantsNote: 'the system prompt is capability-dependent since §198, so BOTH are '
          + 'frozen. Each row records which it uses.',
        vnextModuleSha256: vnextModuleSha,
        baseV15SystemPromptSha256: sha(EXPERT_SYSTEM_PROMPT),
        v15PromptVersion: EXPERT_PROMPT_VERSION,
        reconstructsToV15InBothVariants: true,
        wireSchemaIsPerRequestAndPerCapability: true,
        toolName: EXPERT_TOOL_NAME,
        toolChoice: 'forced tool',
        maxTokens: FIRST_PASS_MAX_TOKENS,
        newCollection: UNRESOLVED_FACT_DECLARATIONS_FIELD,
        clarificationBackref: CLARIFICATION_DECLARATION_BACKREF_FIELD,
      },
      projectionIdentity: {
        version: FIRST_PASS_OWED_FACT_PROJECTION_VERSION,
        moduleSha256: projectionSha,
        projectedPriority: FIRST_PASS_PROJECTED_PRIORITY,
        projectedStatus: PROJECTED_STATUS,
        provenanceRowCount: OWED_FACT_FIELD_PROVENANCE.length,
        identityForm: 'FP.<affectedDecision>.<observationSourceId>.<startOffset>-<endOffset>.<ordinal>',
        providerAuthoredFactKeyField: 'DOES NOT EXIST ON THE WIRE',
      },
      verifierIdentity: {
        instructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
        systemPromptSha256: verifierPromptSha,
        responseSchemaSha256: verifierSchemaSha,
        admissionContractVersion: EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
        admissionModuleSha256: v33Sha,
        baseContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
        note: 'v3.3 is an ADMISSION change only. The instruction and schema executed are v3.2\'s.',
        toolName: 'emit_verifier_verdict',
        maxTokens: VERIFIER_MAX_TOKENS,
      },
      provider_model: {
        provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
        endpoint: 'https://api.anthropic.com', apiVersion: '2023-06-01', thinking: 'disabled',
        inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
        outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
      },
      cohort: {
        version: SECTION_199_COHORT_VERSION,
        cohortModuleSha256: cohortSha,
        section197CohortModuleSha256: cohort197Sha,
        reuseDecision: 'PRODUCT-OWNER COHORT OPTION 3 — reuse the ten §197 rows not materially '
          + 'changed by the governed-capability remediation; replace SF-09 and SF-10 with two fresh '
          + 'governed-evidence rows.',
        reusedRows: COHORT_COVERAGE.reusedRows,
        replacedRows: COHORT_COVERAGE.replacedRows,
        reuseMechanism: 'the ten reused rows are IMPORTED BY REFERENCE from the §197 cohort module, '
          + 'not transcribed, so their scenario content is byte-identical by construction. The '
          + 'design check additionally asserts no drift against the §197 originals.',
        coverage: COHORT_COVERAGE,
        TRUTH_PROVENANCE,
        rows,
      },
      executionOrder: {
        method: 'the transport canary FIRST, then a Fisher-Yates shuffle of the other eleven under '
          + 'mulberry32 seeded from the capability-absent vNext prompt sha256, re-drawn until no '
          + 'matched pair is adjacent',
        seedHex: absentPromptSha.slice(0, 8),
        frozenOrder: order,
        verifierOrderRule: 'verifier calls follow the first-pass phase, in first-pass execution '
          + 'order and then declaration order within a row. The COUNT is an observed outcome of '
          + 'successfully projected owed facts and is deliberately NOT preregistered.',
      },
      TRANSPORT_CANARY: {
        rowId: TRANSPORT_CANARY_ROW_ID,
        capability: 'ABSENT',
        whyThisRow: 'a reused, capability-absent, single-gap row. The first question is whether the '
          + 'remediated ORDINARY first-pass request is accepted at all — that is the shape §197 '
          + 'could never get past the transport, and it is ten of the twelve rows. A governed row '
          + 'would confound the transport question with the capability question.',
        disposable: false,
        onSuccess: 'its output is preserved as that row\'s real experimental result and is scored '
          + 'like any other row. Execution continues under this frozen protocol.',
        onPreInferenceFailure: 'record it exactly; do NOT issue the full cohort automatically; '
          + 'apply the circuit-breaker rule below.',
      },
      CIRCUIT_BREAKER: {
        moduleSha256: breakerSha,
        rule: `STOP when ${CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP} consecutive attempts fail with `
          + 'an identical PRE-INFERENCE rejection signature',
        signature: 'stage | requestContractId (wire-schema identity) | httpStatus | '
          + 'providerErrorType | normalizedMessage',
        normalizationPreserves: 'materially distinct schema-keyword identity such as maxItems, and '
          + 'the structural path including the tool index',
        normalizationRemoves: 'request ids, uuids, timestamps, quoted identifiers carrying a '
          + 'separator or digit, long bare numbers',
        theDecidingField: 'reachedInference — set from provider-returned usage and response shape, '
          + 'NEVER inferred from the HTTP status',
        doesNotApplyTo: ['successful inference followed by malformed provider output',
          'semantic model refusal', 'stochastic output variation', 'distinct pre-inference failures'],
        classification: SYSTEMATIC_PRE_INFERENCE_REJECTION,
        atMostOneDiagnosticRepeat: 'the pre-inference failure policy permits at most ONE additional '
          + 'attempt of the SAME request-contract class, unaltered, to satisfy the two-identical '
          + 'rule. The request is never changed between attempts.',
      },
      caps: {
        firstPassRows: FIRST_PASS_ROWS,
        HARD_TOTAL_CALL_CEILING,
        includesInCeiling: ['first-pass calls', 'any permitted pre-inference repeat', 'verifier calls'],
        hardSpendCapUsd: SPEND_CEILING_USD,
        worstCaseFirstPassUsd: Number(WORST_FIRST_PASS_USD.toFixed(5)),
        worstCaseVerifierUsd: Number(WORST_VERIFIER_USD.toFixed(5)),
        retries: RETRIES,
        onExceedingCallCeiling: 'STOP before exceeding it and record CALL_CEILING_REACHED. Facts '
          + 'are NEVER suppressed or manufactured to fit the budget; an unverified projected fact '
          + 'is reported as unverified.',
        onCreditRejection: 'STOP on FIRST occurrence.',
        spendRule: 'provider-returned usage only; a call reporting no usage adds zero to actual '
          + 'spend and its frozen worst case to the reservation',
      },
      AXIS_CLASSIFICATION: {
        note: 'Frozen before spend. The deterministic validator that ADMITTED a declaration is '
          + 'never the oracle for whether the declaration is semantically right.',
        MECHANICAL_DETERMINISTIC: [
          'provider call counts and error classes', 'actual provider spend', 'canary outcome',
          'circuit-breaker outcome', 'declaration admission and refusal codes',
          'projection field provenance', 'K FACTKEY_IDENTITY_INTEGRITY',
          'J PROJECTION_FIDELITY as byte preservation', 'verifier admission and refusal codes',
          'N/O citation boundary outcomes', 'P SETTLEMENT_AUTHORITY',
          'S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (structural half — was every named id supplied)',
          'multi-gap survival through projection (structural half of H)',
        ],
        HUMAN_REQUIRED: [
          'A FIRST_PASS_GAP_RECALL', 'B FIRST_PASS_GAP_PRECISION',
          'C OWED_PROPERTY_SEMANTIC_CORRECTNESS', 'D EVIDENCE_SPAN_SEMANTIC_RELEVANCE',
          'E BRANCH_PLAUSIBILITY', 'F DECISION_DIVERGENCE_VALIDITY',
          'G AFFECTED_DECISION_CORRECTNESS', 'H MULTI_GAP_PRESERVATION (semantic independence)',
          'I FALSE_GAP_SUPPRESSION', 'L VERIFIER_TARGET_BINDING',
          'M CLARIFICATION_RESOLUTION_SUFFICIENCY',
          'N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY (semantic half)',
          'Q OWED_PROPERTY_LOSS_IMPACT', 'R PRIORITY_FLOOR_IMPACT',
          'S FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half — was binding APPROPRIATE)',
          'T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING',
        ],
        MODEL_ADJUDICATION_PERMITTED: [],
        whyNoModelAdjudication: 'the authorization requires HUMAN semantic review of every '
          + 'projected fact and every first-pass row, and states that no deterministic script may '
          + 'manufacture semantic verdicts. §199 produces a NEUTRAL ADJUDICATION PACKET and stops.',
        verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
      },
      AXIS_T_PRECONDITION: {
        axis: 'T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING',
        default: 'NOT_EXERCISED / NOT_ESTABLISHED',
        precondition: 'T may only be adjudicated if the PROVIDER-VISIBLE first-pass treatment '
          + 'actually contained semantic governed evidence sufficient to support the judgement.',
        currentTreatment: 'the first pass sees the exact sourceId and the evidence text rendered '
          + 'through redactCitationTokens. Whether the redacted text is semantically sufficient for '
          + 'a given row is recorded per row and is itself a human judgement.',
        forbiddenInference: 'correct sourceId selection alone is NOT evidence of semantic '
          + 'grounding. S and T are separate axes and must not be collapsed.',
        separateSurface: 'the verifier-v3.3 governed-evidence path receives authorized '
          + '{ sourceId, text } with citations intact and is evaluated separately as N and O.',
      },
      NO_VACUOUS_PASSING: {
        rule: 'if no inference completes, every behavioural axis A–T is NOT_EXERCISED or '
          + 'NOT_EVALUABLE. An axis requiring an opportunity may not PASS if the opportunity was '
          + 'never realized.',
        distinguish: '0 DEFECTS OBSERVED is not BEHAVIOR PROVEN',
        enforcedBy: 'expert-empty-run-safety.ts, imported by the scorer',
      },
      HARD_FAIL_CONDITIONS: [
        'accepted provider-authored factKey',
        'deterministic invention of missing semantic content',
        'projection alteration of branch or decision-divergence meaning',
        'independent valid declaration lost because a malformed sibling was refused',
        'provider output settled an OwedFact',
        'provider-authored escalation of UNRESOLVED_SAFETY_STATE',
        'unsupplied governed sourceId accepted',
        'unsupplied citation-shaped authority admitted through the v3.3 supplied-source exception',
        'semantic or paraphrase matching substituted for exact-source matching in that exception',
        'production, customer or database mutation',
        'source-integrity failure',
        'provider-call ceiling exceeded',
      ],
      DENOMINATOR_POLICY: {
        rule: 'every axis is reported as x/n against the executions where the behaviour was '
          + 'GENUINELY AVAILABLE, never as occurrences over total executions',
        capabilityPresentRows: COHORT_COVERAGE.capabilityPresentRows,
        governedQuotationOpportunityRows: COHORT_COVERAGE.governedQuotationOpportunityRows,
        unsuppliedCitationOpportunityRows: COHORT_COVERAGE.unsuppliedCitationOpportunityRows,
        falseGapOpportunityRows: SECTION_199_COHORT.filter(r => r.expectedGapCount.max === 0).map(r => r.rowId),
        multiGapOpportunityRows: COHORT_COVERAGE.multiGapRows,
        smallNRule: 'a single observation is reported as x/n literally and never as a percentage; '
          + 'below n=5 an axis is NOT_MEANINGFULLY_ESTIMABLE as a rate',
      },
      noPostHocTuning: 'after the first provider inference: no change to prompts, schemas, cohort, '
        + 'execution order, truth, scorers, thresholds or axis classification.',
      expectedArtifacts: [
        'PREREGISTRATION.json', 'FIXTURE-MANIFEST.json', 'SEMANTIC-TRUTH-MANIFEST.json',
        'EXECUTION-ORDER.json', 'PROTOCOL-HASHES.txt', 'SOURCE-INTEGRITY.txt',
        'RAW-FIRST-PASS-OUTPUTS.jsonl', 'PROJECTION-PROVENANCE.jsonl', 'CIRCUIT-BREAKER-LOG.jsonl',
        'FIRST-PASS-EXECUTION-SUMMARY.json', 'RAW-VERIFIER-OUTPUTS.jsonl',
        'RUN-EXECUTION-SUMMARY.json', 'DETERMINISTIC-RESULTS.json', 'ADJUDICATION-PACKET.json',
        'RUN-SUMMARY.json',
      ],
    };
    fsyncWrite(PREREG_PATH, `${JSON.stringify(doc, null, 2)}\n`);

    fsyncWrite(join(EVID, 'FIXTURE-MANIFEST.json'), `${JSON.stringify({
      artifact: 'SECTION_199_FIXTURE_MANIFEST',
      cohortVersion: SECTION_199_COHORT_VERSION,
      TRUTH_PROVENANCE,
      coverage: COHORT_COVERAGE,
      rows: SECTION_199_COHORT.map(r => ({
        rowId: r.rowId, provenance: r.provenance, section197Origin: r.section197Origin,
        provenanceNote: r.provenanceNote,
        families: r.families, pairedWith: r.pairedWith,
        location: r.location, task: r.task, jurisdiction: r.jurisdiction,
        allowedHazardFamilies: r.allowedHazardFamilies,
        observation: r.observation,
        deterministicFindings: r.deterministicFindings,
        governedStandardsSuppliedToFirstPass: r.governedStandards,
        governedEvidenceSuppliedToVerifier: r.verifierGovernedEvidence,
        designIntent: r.designIntent,
      })),
    }, null, 2)}\n`);

    fsyncWrite(join(EVID, 'SEMANTIC-TRUTH-MANIFEST.json'), `${JSON.stringify({
      artifact: 'SECTION_199_SEMANTIC_TRUTH_MANIFEST',
      warning: 'SCORING AND PACKET-STRUCTURE REFERENCE ONLY. Never injected into the pipeline and '
        + 'never shown to any model during execution.',
      TRUTH_PROVENANCE,
      identityRule: 'factKey is COMPUTED identity. Semantic target correctness is scored against '
        + 'factKeyIntent and the owed-property intent, NEVER by comparing a generated factKey to a '
        + 'human-authored expected key. Identity is separately audited for deterministic derivation.',
      reusedTruthNote: 'the ten reused rows carry their §197 truth UNCHANGED and re-hashed '
        + 'prospectively here. It was never used to score anything, because §197 completed no '
        + 'inference.',
      rows: SECTION_199_COHORT.map(r => ({
        rowId: r.rowId,
        provenance: r.provenance,
        section197Origin: r.section197Origin,
        truthSha256: sha(JSON.stringify(r.expectedOwedFacts)),
        families: r.families,
        pairedWith: r.pairedWith,
        establishedByTheText: r.establishedByTheText,
        notEstablishedByTheText: r.notEstablishedByTheText,
        expectedGapCount: r.expectedGapCount,
        noGapExpected: r.expectedGapCount.max === 0,
        expectedOwedFacts: r.expectedOwedFacts,
        governedCapability: governedBindingCapability(governedBindingFor(recordsFor(r))),
        governedEvidenceExpectation: r.verifierGovernedEvidence.length === 0
          ? 'none supplied — the capability is ABSENT at the first pass and reliance NONE is the '
            + 'only correct verifier declaration'
          : r.families.includes('GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY')
            ? 'a supplied record genuinely bears on the owed fact. Naming its exact sourceId at the '
              + 'first pass is legitimate (axis S); at the verifier, declared reliance and '
              + 'reproducing the citation it contains is the behaviour v3.3 is expected to admit '
              + '(axis N)'
            : 'the supplied record is OFF POINT. Naming its sourceId at the first pass would be '
              + 'inappropriate even though it is structurally permitted (axis S semantic half); at '
              + 'the verifier, reliance NONE is correct and any citation written is necessarily '
              + 'unsupplied and must be refused (axis O)',
        axisTPrecondition: 'the first pass sees this record\'s text with citation-shaped tokens '
          + 'redacted. Whether what remains is semantically sufficient to ground a binding is '
          + 'itself a human judgement, recorded per row in the packet. T defaults to NOT_EXERCISED.',
        designIntent: r.designIntent,
      })),
    }, null, 2)}\n`);

    fsyncWrite(join(EVID, 'EXECUTION-ORDER.json'), `${JSON.stringify({
      artifact: 'SECTION_199_EXECUTION_ORDER',
      seedHex: absentPromptSha.slice(0, 8),
      method: doc.executionOrder.method,
      transportCanary: TRANSPORT_CANARY_ROW_ID,
      frozenOrder: order,
      verifierOrderRule: doc.executionOrder.verifierOrderRule,
      EXECUTED: false,
    }, null, 2)}\n`);

    fsyncWrite(join(EVID, 'PROTOCOL-HASHES.txt'), [
      '§199 FROZEN PROTOCOL IDENTITY — recorded before the first provider call',
      '',
      `first-pass instruction         ${EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION}`,
      `  capability ABSENT prompt     ${absentPromptSha}`,
      `  capability PRESENT prompt    ${presentPromptSha}`,
      `first-pass vNext module        ${vnextModuleSha}`,
      `v15 base system prompt         ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED`,
      `projection module              ${projectionSha}`,
      `projection version             ${FIRST_PASS_OWED_FACT_PROJECTION_VERSION}`,
      `circuit breaker module         ${breakerSha}`,
      `verifier instruction           ${EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION}`,
      `verifier system prompt         ${verifierPromptSha}`,
      `verifier schema                ${verifierSchemaSha}`,
      `admission contract             ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}`,
      `admission module (v3.3)        ${v33Sha}`,
      `cohort                         ${SECTION_199_COHORT_VERSION}`,
      `cohort module                  ${cohortSha}`,
      `§197 cohort module (reused)    ${cohort197Sha}`,
      `model                          ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`,
      `executor version               ${EXECUTOR_VERSION}`,
      `transport canary               ${TRANSPORT_CANARY_ROW_ID}`,
      `preregistration                ${sha(readFileSync(PREREG_PATH, 'utf8'))}`,
      '',
      'PER-ROW WIRE SCHEMA HASHES — the schema is per-request AND per-capability',
      ...rows.map(r => `  ${r.rowId.padEnd(8)} ${r.capability.padEnd(8)} ${r.wireSchemaSha256}`),
      '',
      'NOT THIS POPULATION: §187B (v3), §192 (v3.1), §195 (not executed), §197 (0 inferences).',
      '',
    ].join('\n'));

    console.log(`PREREGISTRATION FROZEN  rows=${SECTION_199_COHORT.length}  canary=${TRANSPORT_CANARY_ROW_ID}`);
    console.log(`  reused ${COHORT_COVERAGE.reusedRows.length}  replaced ${COHORT_COVERAGE.replacedRows.join(',')}`);
    console.log(`  expected owed facts ${COHORT_COVERAGE.expectedOwedFactsMin}-${COHORT_COVERAGE.expectedOwedFactsMax}  capability-present rows ${COHORT_COVERAGE.capabilityPresentRows.join(',')}`);
    console.log(`  ceiling ${HARD_TOTAL_CALL_CEILING} calls / $${SPEND_CEILING_USD}`);
    console.log(`  prereg sha256 ${sha(readFileSync(PREREG_PATH, 'utf8'))}`);
    console.log('ZERO PROVIDER CALLS MADE.');
    return;
  }

  // ---- shared pre-spend identity gate
  const prereg = JSON.parse(readFileSync(PREREG_PATH, 'utf8'));
  if (prereg.firstPassIdentity.capabilityAbsentSystemPromptSha256 !== absentPromptSha) throw new Error('ABORT: capability-absent prompt moved since freeze');
  if (prereg.firstPassIdentity.capabilityPresentSystemPromptSha256 !== presentPromptSha) throw new Error('ABORT: capability-present prompt moved since freeze');
  if (prereg.firstPassIdentity.vnextModuleSha256 !== vnextModuleSha) throw new Error('ABORT: vNext module moved since freeze');
  if (prereg.projectionIdentity.moduleSha256 !== projectionSha) throw new Error('ABORT: projection module moved since freeze');
  if (prereg.verifierIdentity.systemPromptSha256 !== verifierPromptSha) throw new Error('ABORT: v3.2 prompt moved since freeze');
  if (prereg.verifierIdentity.admissionModuleSha256 !== v33Sha) throw new Error('ABORT: v3.3 admission module moved since freeze');
  if (prereg.cohort.cohortModuleSha256 !== cohortSha) throw new Error('ABORT: cohort module moved since freeze');
  if (prereg.cohort.section197CohortModuleSha256 !== cohort197Sha) throw new Error('ABORT: §197 cohort module moved since freeze — the ten reused rows are imported from it');
  if (prereg.CIRCUIT_BREAKER.moduleSha256 !== breakerSha) throw new Error('ABORT: circuit breaker module moved since freeze');
  for (const fr of prereg.cohort.rows) {
    const row = SECTION_199_COHORT.find(r => r.rowId === fr.rowId);
    if (!row) throw new Error(`ABORT: frozen row ${fr.rowId} missing`);
    const req = firstPassRequest(row);
    if (sha(row.observation) !== fr.observationSha256) throw new Error(`ABORT: ${fr.rowId} observation drift`);
    if (sha(req.userPrompt) !== fr.userPromptSha256) throw new Error(`ABORT: ${fr.rowId} user prompt drift`);
    if (sha(stableStringify(req.schema)) !== fr.wireSchemaSha256) throw new Error(`ABORT: ${fr.rowId} wire schema drift`);
    if (req.capability !== fr.capability) throw new Error(`ABORT: ${fr.rowId} capability drift`);
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.trim()) throw new Error('ABORT: ANTHROPIC_API_KEY is not set');

  const ledger = new ProviderSpendLedger({
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
  });

  // ================================================================ firstpass
  if (stage === 'firstpass') {
    if (existsSync(FIRST_PASS_FILE)) throw new Error('ABORT: RAW-FIRST-PASS-OUTPUTS.jsonl exists; refusing to overwrite persisted evidence');
    writeFileSync(FIRST_PASS_FILE, '');
    writeFileSync(PROJECTION_FILE, '');
    writeFileSync(BREAKER_FILE, '');
    const order = prereg.executionOrder.frozenOrder as Array<{ sequencePosition: number; rowId: string; isCanary: boolean }>;
    let attempted = 0;
    let stopReason: string | null = null;
    let breaker: BreakerState = initialBreakerState();
    let canaryOutcome: string | null = null;

    for (const step of order) {
      const gate = mayIssueNextAttempt(breaker);
      if (!gate.allowed) {
        stopReason = gate.stopReason;
        console.log(`\n  CIRCUIT BREAKER TRIPPED — ${gate.detail}`);
        break;
      }
      if (attempted + 1 > HARD_TOTAL_CALL_CEILING) { stopReason = 'CALL_CEILING_REACHED'; break; }
      if (ledger.wouldExceedCeiling(WORST_FIRST_PASS_USD, SPEND_CEILING_USD)) { stopReason = 'SPEND_CEILING_REACHED'; break; }

      const row = SECTION_199_COHORT.find(r => r.rowId === step.rowId)!;
      const req = firstPassRequest(row);
      attempted += 1;
      const call = await callOnce(req.body, apiKey);
      const cost = ledger.record({
        ok: call.ok, inputTokens: call.inputTokens, outputTokens: call.outputTokens,
        worstCaseUsd: WORST_FIRST_PASS_USD,
      });

      // Circuit breaker: record EVERY attempt, and log the decision so the run can be audited.
      const sig = preInferenceSignature({
        reachedInference: call.reachedInference,
        httpStatus: call.httpStatus,
        providerErrorType: call.providerErrorType,
        providerErrorMessage: call.providerErrorMessage,
        stage: 'firstpass',
        requestContractId: sha(stableStringify(req.schema)).slice(0, 16),
      });
      breaker = recordAttempt(breaker, {
        reachedInference: call.reachedInference,
        httpStatus: call.httpStatus,
        providerErrorType: call.providerErrorType,
        providerErrorMessage: call.providerErrorMessage,
        stage: 'firstpass',
        requestContractId: sha(stableStringify(req.schema)).slice(0, 16),
      });
      appendFileSync(BREAKER_FILE, `${JSON.stringify({
        sequencePosition: step.sequencePosition, rowId: row.rowId, isCanary: step.isCanary,
        reachedInference: call.reachedInference, signature: sig,
        consecutive: breaker.consecutive, tripped: breaker.tripped,
        timestamp: new Date().toISOString(),
      })}\n`);

      if (step.isCanary) {
        canaryOutcome = call.reachedInference ? 'INFERENCE_COMPLETED'
          : `PRE_INFERENCE_FAILURE:${call.failureKind}`;
      }

      const out: any = call.parsed ?? {};
      const rawDeclarations: unknown[] = Array.isArray(out[UNRESOLVED_FACT_DECLARATIONS_FIELD])
        ? out[UNRESOLVED_FACT_DECLARATIONS_FIELD] : [];
      appendFileSync(FIRST_PASS_FILE, `${JSON.stringify({
        rowId: row.rowId, sequencePosition: step.sequencePosition, isCanary: step.isCanary,
        provenance: row.provenance, capability: req.capability,
        recordKind: 'FIRST_PASS',
        behavioralExecution: call.ok,
        reachedInference: call.reachedInference,
        preInferenceFailure: !call.reachedInference && !call.ok,
        rawPersistedBeforeDerivation: true,
        raw: call.raw, parsed: call.parsed,
        providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
        providerErrorType: call.providerErrorType, providerErrorMessage: call.providerErrorMessage,
        latencyMs: call.latencyMs, respondedModel: call.modelIdentity, stopReason: call.stopReason,
        rawDeclarationCount: rawDeclarations.length,
        rawDeclarations,
        clarifications: Array.isArray(out.decisionCriticalClarifications) ? out.decisionCriticalClarifications : [],
        hazardCandidates: Array.isArray(out.expertHazardCandidates) ? out.expertHazardCandidates : [],
        crossHazardInsights: Array.isArray(out.crossHazardInsights) ? out.crossHazardInsights : [],
        disagreements: Array.isArray(out.disagreements) ? out.disagreements : [],
        expertExplanation: out.expertExplanation ?? null,
        uncertainty: out.uncertainty ?? null,
        outcome: out.outcome ?? null,
        analysisId: `AN-199-${row.rowId}`,
        governedSourceIdsSupplied: recordsFor(row).map(g => g.sourceId),
        systemPromptSha256: sha(req.systemPrompt),
        userPromptSha256: sha(req.userPrompt),
        wireSchemaSha256: sha(stableStringify(req.schema)),
        firstPassInstructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
        usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
        timestamp: new Date().toISOString(),
      })}\n`);

      if (call.creditRejection) {
        stopReason = 'ACCOUNT_CREDIT_REJECTION_ON_FIRST_OCCURRENCE';
        console.log('\n  credit rejection — STOPPING IMMEDIATELY');
        break;
      }

      const projection = projectDeclaredOwedFacts({
        declarations: rawDeclarations,
        sources: [{ sourceId: `OBS-${row.rowId}`, text: row.observation }],
        suppliedGovernedSourceIds: recordsFor(row).map(g => g.sourceId),
        stage: 'FIRST_PASS_MODEL',
      });
      const links = resolveClarificationLinks(
        (Array.isArray(out.decisionCriticalClarifications) ? out.decisionCriticalClarifications : [])
          .map((c: any) => ({
            clarificationId: String(c?.clarificationId ?? ''),
            answersUnresolvedFactDeclarationId: c?.[CLARIFICATION_DECLARATION_BACKREF_FIELD] ?? null,
          })),
        projection);

      appendFileSync(PROJECTION_FILE, `${JSON.stringify({
        rowId: row.rowId, sequencePosition: step.sequencePosition, capability: req.capability,
        projectionVersion: projection.version,
        rawDeclarationCount: rawDeclarations.length,
        admittedCount: projection.facts.length,
        refusedCount: projection.refusedCount,
        perDeclaration: projection.perDeclaration.map(p => ({
          declarationId: p.declarationId, admitted: p.admitted,
          codes: p.codes, detail: p.detail, factKey: p.factKey, owedFact: p.owedFact,
        })),
        declarationIdToFactKey: projection.declarationIdToFactKey,
        clarificationLinks: links,
        governedIdsNamedByDeclarations: rawDeclarations
          .map((d: any) => (Array.isArray(d?.governedEvidenceSourceIds) ? d.governedEvidenceSourceIds : []))
          .flat(),
        identityAudit: projection.perDeclaration.filter(p => p.admitted).map(p => {
          const d = rawDeclarations.find((x: any) => x?.declarationId === p.declarationId) as any;
          const span = String(d?.observationSpan ?? '').trim();
          const start = row.observation.indexOf(span);
          const sameAnchor = projection.perDeclaration.filter(q => q.admitted).filter(q => {
            const e = rawDeclarations.find((x: any) => x?.declarationId === q.declarationId) as any;
            return e && e.affectedDecision === d?.affectedDecision
              && e.observationSourceId === d?.observationSourceId
              && row.observation.indexOf(String(e.observationSpan ?? '').trim()) === start;
          });
          const ordinal = sameAnchor.findIndex(q => q.declarationId === p.declarationId) + 1;
          return {
            declarationId: p.declarationId,
            reportedFactKey: p.factKey,
            independentlyRecomputedFactKey: start < 0 ? null : computeFactKey({
              stage: 'FIRST_PASS_MODEL',
              affectedDecision: String(d?.affectedDecision),
              observationSourceId: String(d?.observationSourceId),
              startOffset: start, endOffset: start + span.length, ordinal,
            }),
            providerSuppliedAnyFactKeyField: d !== undefined && 'factKey' in (d as object),
          };
        }),
        timestamp: new Date().toISOString(),
      })}\n`);

      console.log(`${String(step.sequencePosition).padStart(2)}${step.isCanary ? '*' : ' '} ${row.rowId.padEnd(6)} cap=${req.capability.padEnd(7)} inf=${call.reachedInference} outcome=${out.outcome ?? '-'} decl=${rawDeclarations.length} adm=${projection.facts.length} ref=${projection.refusedCount} clar=${(out.decisionCriticalClarifications ?? []).length} cand=${(out.expertHazardCandidates ?? []).length} $${cost.toFixed(5)}`);

      // The canary is not disposable, but a canary that never reached inference means the
      // remediated ordinary request is still not accepted. Do not issue the rest automatically:
      // the breaker gets exactly one more attempt of the same contract class to satisfy its rule.
      if (step.isCanary && !call.reachedInference) {
        console.log('\n  CANARY DID NOT REACH INFERENCE — not issuing the full cohort. '
          + 'One diagnostic repeat of the same request contract is permitted by the frozen policy.');
        const gate2 = mayIssueNextAttempt(breaker);
        if (!gate2.allowed) { stopReason = gate2.stopReason; break; }
        const repeat = await callOnce(req.body, apiKey);
        attempted += 1;
        const cost2 = ledger.record({
          ok: repeat.ok, inputTokens: repeat.inputTokens, outputTokens: repeat.outputTokens,
          worstCaseUsd: WORST_FIRST_PASS_USD,
        });
        breaker = recordAttempt(breaker, {
          reachedInference: repeat.reachedInference,
          httpStatus: repeat.httpStatus,
          providerErrorType: repeat.providerErrorType,
          providerErrorMessage: repeat.providerErrorMessage,
          stage: 'firstpass',
          requestContractId: sha(stableStringify(req.schema)).slice(0, 16),
        });
        appendFileSync(BREAKER_FILE, `${JSON.stringify({
          sequencePosition: step.sequencePosition, rowId: row.rowId, isCanary: true,
          diagnosticRepeat: true, reachedInference: repeat.reachedInference,
          signature: preInferenceSignature({
            reachedInference: repeat.reachedInference, httpStatus: repeat.httpStatus,
            providerErrorType: repeat.providerErrorType,
            providerErrorMessage: repeat.providerErrorMessage,
            stage: 'firstpass', requestContractId: sha(stableStringify(req.schema)).slice(0, 16),
          }),
          consecutive: breaker.consecutive, tripped: breaker.tripped,
          timestamp: new Date().toISOString(),
        })}\n`);
        appendFileSync(FIRST_PASS_FILE, `${JSON.stringify({
          rowId: row.rowId, sequencePosition: step.sequencePosition, isCanary: true,
          diagnosticRepeat: true, recordKind: 'FIRST_PASS_DIAGNOSTIC_REPEAT',
          behavioralExecution: repeat.ok, reachedInference: repeat.reachedInference,
          preInferenceFailure: !repeat.reachedInference && !repeat.ok,
          rawPersistedBeforeDerivation: true, raw: repeat.raw, parsed: repeat.parsed,
          providerOk: repeat.ok, failureKind: repeat.failureKind, httpStatus: repeat.httpStatus,
          providerErrorType: repeat.providerErrorType, providerErrorMessage: repeat.providerErrorMessage,
          note: 'the request was NOT altered between attempts',
          usage: { inputTokens: repeat.inputTokens, outputTokens: repeat.outputTokens, costUsd: Number(cost2.toFixed(6)) },
          timestamp: new Date().toISOString(),
        })}\n`);
        const gate3 = mayIssueNextAttempt(breaker);
        stopReason = gate3.allowed ? 'CANARY_PRE_INFERENCE_FAILURE_NOT_REPEATED' : gate3.stopReason;
        console.log(`  diagnostic repeat: inference=${repeat.reachedInference}  stop=${stopReason}`);
        break;
      }
    }

    const report = ledger.report();
    fsyncWrite(join(EVID, 'FIRST-PASS-EXECUTION-SUMMARY.json'), `${JSON.stringify({
      artifact: 'SECTION_199_FIRST_PASS_EXECUTION_SUMMARY',
      preregistrationSha256: sha(readFileSync(PREREG_PATH, 'utf8')),
      plannedFirstPassRows: FIRST_PASS_ROWS, attempted, stopReason,
      transportCanary: { rowId: TRANSPORT_CANARY_ROW_ID, outcome: canaryOutcome, disposable: false },
      circuitBreaker: {
        tripped: breaker.tripped, trippedOnSignature: breaker.trippedOnSignature,
        attemptsRecorded: breaker.attemptsRecorded,
      },
      spendAccounting: report,
      ACTUAL_PROVIDER_SPEND_USD: report.actualProviderSpendUsd,
    }, null, 2)}\n`);
    console.log(`\nFIRST PASS COMPLETE  attempted=${attempted}  canary=${canaryOutcome}  breaker=${breaker.tripped ? 'TRIPPED' : 'clear'}  actual=$${report.actualProviderSpendUsd.toFixed(5)}  stop=${stopReason ?? 'none'}`);
    return;
  }

  // ================================================================ verifier
  if (stage !== 'verifier') throw new Error(`ABORT: unknown stage ${stage}`);
  if (!existsSync(FIRST_PASS_FILE)) throw new Error('ABORT: no persisted first-pass evidence to resume against');
  if (existsSync(VERIFIER_FILE)) throw new Error('ABORT: RAW-VERIFIER-OUTPUTS.jsonl exists; refusing to overwrite persisted evidence');
  writeFileSync(VERIFIER_FILE, '');

  const fpRecords = readFileSync(FIRST_PASS_FILE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const projRecords = readFileSync(PROJECTION_FILE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const firstPassCallsMade = fpRecords.length;

  const targets: Array<{ rowId: string; sequencePosition: number; declarationId: string; owedFact: any }> = [];
  for (const pr of projRecords) {
    for (const p of pr.perDeclaration as any[]) {
      if (p.admitted && p.owedFact) {
        targets.push({ rowId: pr.rowId, sequencePosition: pr.sequencePosition, declarationId: p.declarationId, owedFact: p.owedFact });
      }
    }
  }
  targets.sort((a, b) => a.sequencePosition - b.sequencePosition
    || a.declarationId.localeCompare(b.declarationId));

  let attempted = 0;
  let stopReason: string | null = null;
  const unverified: string[] = [];
  let breaker: BreakerState = initialBreakerState();

  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i];
    const gate = mayIssueNextAttempt(breaker);
    if (!gate.allowed) {
      stopReason = gate.stopReason;
      for (let j = i; j < targets.length; j += 1) unverified.push(`${targets[j].rowId}:${targets[j].owedFact.factKey}`);
      break;
    }
    if (firstPassCallsMade + attempted + 1 > HARD_TOTAL_CALL_CEILING) {
      stopReason = 'CALL_CEILING_REACHED';
      for (let j = i; j < targets.length; j += 1) unverified.push(`${targets[j].rowId}:${targets[j].owedFact.factKey}`);
      break;
    }
    if (ledger.wouldExceedCeiling(WORST_VERIFIER_USD, SPEND_CEILING_USD)) {
      stopReason = 'SPEND_CEILING_REACHED';
      for (let j = i; j < targets.length; j += 1) unverified.push(`${targets[j].rowId}:${targets[j].owedFact.factKey}`);
      break;
    }
    const row = SECTION_199_COHORT.find(r => r.rowId === t.rowId)!;
    const fp = fpRecords.find(r => r.rowId === t.rowId && !r.diagnosticRepeat);
    const projected = projectOwedFact(t.owedFact);
    const analysisId = `AN-199-${row.rowId}-${t.owedFact.factKey}`;
    const userPrompt = buildVerifierV3UserPrompt({
      caseId: row.rowId,
      observation: row.observation,
      jurisdiction: row.jurisdiction,
      governedEvidence: recordsFor(row),
      deterministic: {
        familiesEmitted: row.deterministicFindings.map(f => f.hazardFamily),
        lifeCriticalFindingKeys: row.deterministicFindings.filter(f => f.isLifeCritical).map(f => f.findingKey),
      },
      firstPass: {
        candidates: (fp?.hazardCandidates ?? []).map((c: any) => ({
          candidateKey: String(c?.candidateKey ?? ''), hazardFamily: String(c?.hazardFamily ?? ''),
          assertedConditionState: String(c?.assertedConditionState ?? ''),
          evidenceBasis: String(c?.evidenceBasis ?? ''), reasoning: String(c?.reasoning ?? ''),
        })),
        clarifications: (fp?.clarifications ?? []).map((c: any) => ({
          clarificationId: String(c?.clarificationId ?? ''), question: String(c?.question ?? ''),
          affectedDecision: String(c?.affectedDecision ?? ''),
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

    const body = {
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: VERIFIER_MAX_TOKENS,
      system: EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [{ name: 'emit_verifier_verdict',
        description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
        input_schema: VERIFIER_V3_2_RESPONSE_SCHEMA }],
      tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
      thinking: { type: 'disabled' },
    };
    attempted += 1;
    const call = await callOnce(body, apiKey);
    const cost = ledger.record({
      ok: call.ok, inputTokens: call.inputTokens, outputTokens: call.outputTokens,
      worstCaseUsd: WORST_VERIFIER_USD,
    });
    breaker = recordAttempt(breaker, {
      reachedInference: call.reachedInference, httpStatus: call.httpStatus,
      providerErrorType: call.providerErrorType, providerErrorMessage: call.providerErrorMessage,
      stage: 'verifier', requestContractId: verifierSchemaSha.slice(0, 16),
    });

    const out: any = call.parsed ?? {};
    const admissionInput = {
      analysisId, observation: row.observation,
      suppliedOwedFactKeys: [t.owedFact.factKey],
      suppliedGovernedSourceIds: recordsFor(row).map(g => g.sourceId),
      suppliedGovernedEvidence: recordsFor(row),
    };
    const admission = call.parsed
      ? checkVerifierV3_3Output(
        { ...call.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId },
        admissionInput)
      : null;

    appendFileSync(VERIFIER_FILE, `${JSON.stringify({
      rowId: row.rowId, factKey: t.owedFact.factKey, declarationId: t.declarationId,
      verifierSequence: attempted, recordKind: 'VERIFIER',
      behavioralExecution: call.ok, reachedInference: call.reachedInference,
      preInferenceFailure: !call.reachedInference && !call.ok,
      rawPersistedBeforeDerivation: true,
      raw: call.raw, parsed: call.parsed,
      providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
      latencyMs: call.latencyMs, respondedModel: call.modelIdentity, stopReason: call.stopReason,
      verdict: out.verdict ?? null, rationale: out.rationale ?? null,
      clarificationSourceMode: out.clarificationSourceMode ?? null,
      bindingFactKey: out.bindingFactKey ?? null,
      proposedClarification: out.proposedClarification ?? null,
      nominatedFact: out.nominatedFact ?? null,
      owedFactDeclarations: Array.isArray(out.owedFactDeclarations) ? out.owedFactDeclarations : [],
      regulatoryBasis: out.regulatoryBasis ?? null,
      suppliedOwedFact: projected,
      suppliedGovernedSourceIds: admissionInput.suppliedGovernedSourceIds,
      admission: admission ? {
        admitted: admission.admitted, codes: [...admission.codes], detail: [...admission.detail],
        bindingAdmitted: admission.bindingAdmitted, nominationAdmitted: admission.nominationAdmitted,
        challengedFactKeys: [...admission.challengedFactKeys],
        citationViolations: [...admission.citationViolations],
        citationReuseAdmitted: admission.citationReuseAdmitted,
        citationReuse: admission.citationReuse,
        unauthorisedCitations: [...admission.unauthorisedCitations],
        regulatoryRelianceDeclared: admission.regulatoryRelianceDeclared,
        boundSourceIds: [...admission.boundSourceIds],
      } : null,
      analysisId, userPromptSha256: sha(userPrompt),
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
      verifierSystemPromptSha256: verifierPromptSha, verifierSchemaSha256: verifierSchemaSha,
      admissionContractVersion: EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
      usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
      timestamp: new Date().toISOString(),
    })}\n`);

    if (call.creditRejection) {
      stopReason = 'ACCOUNT_CREDIT_REJECTION_ON_FIRST_OCCURRENCE';
      for (let j = i + 1; j < targets.length; j += 1) unverified.push(`${targets[j].rowId}:${targets[j].owedFact.factKey}`);
      console.log('\n  credit rejection — STOPPING IMMEDIATELY');
      break;
    }
    console.log(`${String(attempted).padStart(2)}  ${row.rowId.padEnd(6)} ${String(t.owedFact.factKey).padEnd(46)} inf=${call.reachedInference} verdict=${out.verdict ?? '-'} adm=${admission?.admitted} reuse=${admission?.citationReuseAdmitted} $${cost.toFixed(5)}`);
  }

  const report = ledger.report();
  fsyncWrite(join(EVID, 'RUN-EXECUTION-SUMMARY.json'), `${JSON.stringify({
    artifact: 'SECTION_199_RUN_EXECUTION_SUMMARY',
    preregistrationSha256: sha(readFileSync(PREREG_PATH, 'utf8')),
    firstPassCallsMade,
    projectedFactsAvailableForVerification: targets.length,
    verifierCallsAttempted: attempted,
    totalProviderCallsAttempted: firstPassCallsMade + attempted,
    HARD_TOTAL_CALL_CEILING,
    stopReason,
    circuitBreaker: { tripped: breaker.tripped, trippedOnSignature: breaker.trippedOnSignature },
    unverifiedProjectedFacts: unverified,
    unverifiedNote: unverified.length === 0 ? 'every projected fact was verified'
      : 'these projected facts were NOT sent to the verifier because a ceiling or the breaker '
        + 'stopped the run. They are reported as unverified; no fact was suppressed or truncated.',
    verifierPhaseSpendAccounting: report,
    VERIFIER_PHASE_ACTUAL_SPEND_USD: report.actualProviderSpendUsd,
    note: 'this summary covers the VERIFIER phase ledger only. First-pass spend is in '
      + 'FIRST-PASS-EXECUTION-SUMMARY.json and the two are added in RUN-SUMMARY.json.',
  }, null, 2)}\n`);
  console.log(`\nVERIFIER PHASE COMPLETE  attempted=${attempted}  actual=$${report.actualProviderSpendUsd.toFixed(5)}  stop=${stopReason ?? 'none'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
