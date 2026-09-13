/**
 * §197 -- FRESH PROSPECTIVE HOSTED VALIDATION OF THE STRUCTURED FIRST-PASS PIPELINE.
 *
 *   --stage=prereg     freeze everything. ZERO provider calls.
 *   --stage=firstpass  run the frozen row order through first-pass vNext.
 *   --stage=verifier   run verifier-v3.3 once per projected OwedFact, against the PERSISTED
 *                      first-pass evidence. Never re-runs the first pass.
 *
 * ==================== WHY THE TWO EXECUTION STAGES ARE SEPARATE ====================
 *
 * The authorization's retry policy: "Once a first-pass output is successfully persisted into the
 * §197 evidence set, it becomes frozen execution evidence for this protocol. Resume later stages
 * against that persisted output if an authorized resume is later required."
 *
 * A single stage could not honour that. If the verifier phase failed halfway, re-running one script
 * would either re-issue the first-pass calls -- spending again and producing a DIFFERENT stimulus
 * for the verifier, which would silently replace frozen evidence -- or need a resume flag whose
 * correctness nobody could check. Two stages make the boundary structural: `--stage=verifier` reads
 * `RAW-FIRST-PASS-OUTPUTS.jsonl` and cannot issue a first-pass call, because it never builds one.
 *
 * ==================== NEW POPULATION ====================
 *
 * vNext and v3.3 have no prior hosted evidence. Nothing here is combined with §187B (v3), §192
 * (v3.1) or any §195 material -- §195 is neither read nor executed by this file.
 *
 * ==================== SPEND ====================
 *
 * Provider-returned usage is the sole basis for actual spend, via the §188 ProviderSpendLedger. A
 * call that reports no usage adds zero to actual spend and its frozen worst case to the reservation.
 * The reservation governs the ceiling and is never reported as money.
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
import { buildExpertUserPrompt, EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, stableStringify } from
  '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT, EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
  buildExpertVNextWireSchema, UNRESOLVED_FACT_DECLARATIONS_FIELD,
  CLARIFICATION_DECLARATION_BACKREF_FIELD, reconstructV15SystemPrompt, reconstructV15WireSchema,
} from './lib/expert-first-pass-instruction-vnext';
import {
  projectDeclaredOwedFacts, resolveClarificationLinks,
  FIRST_PASS_OWED_FACT_PROJECTION_VERSION, FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS,
  computeFactKey, OWED_FACT_FIELD_PROVENANCE,
} from './lib/expert-first-pass-owed-fact-projection';
import { projectOwedFact } from
  '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import { createOwedFactLedger } from
  '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, buildVerifierV3UserPrompt,
} from './lib/expert-verifier-instruction-v3-2';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import {
  checkVerifierV3_3Output, EXPERT_VERIFIER_CONTRACT_V3_3_VERSION,
} from './lib/expert-verifier-contract-v3-3';
import {
  SECTION_197_COHORT, SECTION_197_COHORT_VERSION, COHORT_COVERAGE, TRUTH_PROVENANCE,
  cohortDesignDefects, type CohortRow,
} from './lib/expert-197-cohort-2026-09-07';
import { ProviderSpendLedger } from './lib/expert-provider-spend-accounting';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-structured-e2e-validation-2026-09-07');
const LIB = join(__dirname, 'lib');
const EXECUTOR_VERSION = 'hazlenz.expert.197.structured-e2e-executor.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const fsyncWrite = (p: string, s: string): void => {
  writeFileSync(p, s);
  const fd = openSync(p, 'r+'); fsyncSync(fd); closeSync(fd);
};

// ---------------------------------------------------------------- frozen caps

const FIRST_PASS_MAX_TOKENS = 8000;
const VERIFIER_MAX_TOKENS = 4000;
/** The authorization's recommended ceiling, taken as the hard total. */
const HARD_TOTAL_CALL_CEILING = 36;
const FIRST_PASS_CALLS = SECTION_197_COHORT.length;
const VERIFIER_CALL_BUDGET = HARD_TOTAL_CALL_CEILING - FIRST_PASS_CALLS;
const SPEND_CEILING_USD = 6.0;
const RETRIES = 0;
/** Worst case per call, from the frozen max_tokens and a generous input allowance. */
const WORST_FIRST_PASS_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * 10 + (24000 / 1e6) * 2;
const WORST_VERIFIER_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (12000 / 1e6) * 2;

const PREREG_PATH = join(EVID, 'PREREGISTRATION.json');
const FIRST_PASS_FILE = join(EVID, 'RAW-FIRST-PASS-OUTPUTS.jsonl');
const PROJECTION_FILE = join(EVID, 'PROJECTION-PROVENANCE.jsonl');
const VERIFIER_FILE = join(EVID, 'RAW-VERIFIER-OUTPUTS.jsonl');

// ---------------------------------------------------------------- request construction

const GOVERNED_BINDING_FOR_FIRST_PASS = { governedEvidenceSourceIds: [] as string[] };

function analysisInput(row: CohortRow): ExpertAnalysisInput {
  return {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-197-${row.rowId}`,
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

function firstPassBody(row: CohortRow): Record<string, unknown> {
  const input = analysisInput(row);
  return {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: FIRST_PASS_MAX_TOKENS,
    system: EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildExpertUserPrompt(input) }],
    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the Expert HazLenz advisory analysis. This is the ONLY way to answer.',
      strict: true,
      input_schema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(
        buildExpertVNextWireSchema(input, GOVERNED_BINDING_FOR_FIRST_PASS))),
    }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  };
}

// ---------------------------------------------------------------- transport

interface CallResult {
  ok: boolean; raw: unknown; parsed: Record<string, unknown> | null; failureKind: string | null;
  inputTokens: number | null; outputTokens: number | null; latencyMs: number;
  httpStatus: number | null; modelIdentity: string | null; stopReason: string | null;
  creditRejection: boolean; preInference: boolean;
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
    const msg = String(json?.error?.message ?? '');
    const creditRejection = response.status === 400 && /credit balance is too low/i.test(msg);
    const base = {
      inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
      latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
      stopReason: json.stop_reason ?? null, creditRejection,
    };
    if (!response.ok) {
      // A rejection carrying no usage never reached inference. That distinction decides whether the
      // event is scoreable as model behaviour, so it is recorded rather than inferred later.
      const preInference = (usage?.output_tokens ?? 0) === 0;
      return {
        ok: false, raw: json, parsed: null, preInference,
        failureKind: creditRejection ? 'ACCOUNT_CREDIT_REJECTION'
          : response.status === 429 ? 'RATE_LIMITED'
            : response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR',
        ...base,
      };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)
      ?.find(b => b.type === 'tool_use');
    if (!block) {
      return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL', preInference: false, ...base };
    }
    return { ok: true, raw: json, parsed: block.input as Record<string, unknown>, failureKind: null, preInference: false, ...base };
  } catch (e) {
    return {
      ok: false, raw: { error: (e as Error).message }, parsed: null, failureKind: 'TRANSPORT_ERROR',
      inputTokens: null, outputTokens: null, latencyMs: Date.now() - started, httpStatus: null,
      modelIdentity: null, stopReason: null, creditRejection: false, preInference: true,
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
 * One pass over the twelve rows in a seeded shuffle, with no matched pair adjacent.
 *
 * Adjacency matters here in a way it did not at §192: SF-01/SF-03, SF-05/SF-12 and SF-06/SF-04 are
 * near-identical texts differing in one clause. Running them back to back would not contaminate the
 * model -- each call is independent -- but it would make the ORDER itself a confound a reader could
 * reasonably question, and separating them costs nothing.
 */
function frozenOrder(seedHex: string): Array<{ sequencePosition: number; rowId: string }> {
  const rnd = mulberry32(parseInt(seedHex.slice(0, 8), 16));
  const pairOf = new Map(SECTION_197_COHORT.map(r => [r.rowId, r.pairedWith]));
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const a = SECTION_197_COHORT.map(r => r.rowId);
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    let ok = true;
    for (let i = 1; i < a.length; i += 1) if (pairOf.get(a[i - 1]) === a[i]) { ok = false; break; }
    if (ok) return a.map((rowId, i) => ({ sequencePosition: i + 1, rowId }));
  }
  throw new Error('ABORT: could not derive an order separating every matched pair');
}

// ---------------------------------------------------------------- stages

async function main(): Promise<void> {
  mkdirSync(EVID, { recursive: true });
  const stage = (process.argv.find(a => a.startsWith('--stage=')) ?? '--stage=prereg').split('=')[1];

  const vnextPromptSha = sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT);
  const verifierPromptSha = sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
  const verifierSchemaSha = sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
  const cohortSha = shaFile(join(LIB, 'expert-197-cohort-2026-09-07.ts'));
  const projectionSha = shaFile(join(LIB, 'expert-first-pass-owed-fact-projection.ts'));
  const vnextModuleSha = shaFile(join(LIB, 'expert-first-pass-instruction-vnext.ts'));
  const v33Sha = shaFile(join(LIB, 'expert-verifier-contract-v3-3.ts'));

  // ================================================================ prereg
  if (stage === 'prereg') {
    if (existsSync(PREREG_PATH)) throw new Error('ABORT: PREREGISTRATION.json exists; refusing to overwrite a freeze');
    const defects = cohortDesignDefects();
    if (defects.length > 0) throw new Error(`ABORT: cohort design defects — ${defects.join(' | ')}`);

    // vNext must still be v15 plus its block, checked here as well as in the integrity gate: a
    // preregistration that froze a drifted protocol would be worthless.
    if (sha(reconstructV15SystemPrompt()) !== sha(EXPERT_SYSTEM_PROMPT)) {
      throw new Error('ABORT: vNext no longer reconstructs to v15');
    }

    const order = frozenOrder(vnextPromptSha);
    const rowSchemas = SECTION_197_COHORT.map(r => {
      const input = analysisInput(r);
      return {
        rowId: r.rowId,
        observationSha256: sha(r.observation),
        userPromptSha256: sha(buildExpertUserPrompt(input)),
        wireSchemaSha256: sha(stableStringify(buildExpertVNextWireSchema(input, GOVERNED_BINDING_FOR_FIRST_PASS))),
        v15WireSchemaSha256: sha(stableStringify(reconstructV15WireSchema(input, GOVERNED_BINDING_FOR_FIRST_PASS))),
        families: r.families,
        expectedGapCount: r.expectedGapCount,
        governedRecordsSuppliedToFirstPass: r.governedStandards.length,
        governedEvidenceSuppliedToVerifier: r.verifierGovernedEvidence.map(g => g.sourceId),
      };
    });

    const doc = {
      artifact: 'SECTION_197_PRE_SPEND_PREREGISTRATION',
      writtenBeforeFirstProviderCall: true,
      date: '2026-09-07',
      operation: '§197 fresh prospective hosted DEVELOPMENT validation of the structured '
        + 'first-pass → deterministic projection → verifier-v3.3 pipeline',
      NOT_A_FORMAL_ACCEPTANCE_RUN: true,
      NOT_CUSTOMER_OR_PRODUCTION_ACTIVATION: true,
      systemUnderTest: [
        'RAW OBSERVATION / GOVERNED CONTEXT', 'FIRST-PASS vNext',
        'STRUCTURED UNRESOLVED-FACT DECLARATIONS', 'DETERMINISTIC VALIDATION',
        'DETERMINISTIC PROJECTION', 'OwedFact / task state', 'VERIFIER-v3.3', 'ADMISSION',
        'HUMAN-AUTHORIZED SETTLEMENT',
      ],
      POPULATION_SEPARATION: {
        statement: 'vNext and v3.3 are NEW POPULATIONS with no prior hosted evidence. No §187B '
          + '(v3), §192 (v3.1) or §195 material is reused, read as stimulus, or combined with '
          + 'these results. The frozen §195 cohort is not executed.',
        v15_systemPromptSha256: sha(EXPERT_SYSTEM_PROMPT),
        v15_promptVersion: EXPERT_PROMPT_VERSION,
      },
      worktree: {
        branch: execSync(`git -C ${JSON.stringify(ROOT)} rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim(),
        head: execSync(`git -C ${JSON.stringify(ROOT)} rev-parse HEAD`, { encoding: 'utf8' }).trim(),
        dirtyPathCount: Number(execSync(`git -C ${JSON.stringify(ROOT)} status --porcelain | wc -l`, { encoding: 'utf8' }).trim()),
        dirtyNote: 'substantial pre-existing uncommitted work from earlier slices is present and is '
          + 'preserved. §197 adds files and never resets, checks out, restores, stashes or cleans.',
        executorSha256: shaFile(join(__dirname, 'execute-197-structured-e2e-2026-09-07.ts')),
        integrityGateSha256: shaFile(join(__dirname, 'verify-197-source-integrity-2026-09-07.ts')),
      },
      firstPassIdentity: {
        instructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
        systemPromptSha256: vnextPromptSha,
        vnextModuleSha256: vnextModuleSha,
        baseV15SystemPromptSha256: sha(EXPERT_SYSTEM_PROMPT),
        reconstructsToV15: true,
        wireSchemaIsPerRequest: true,
        wireSchemaNote: 'the first-pass wire schema binds enums to each request\'s own '
          + 'vocabularies, so a per-row schema hash is frozen rather than one protocol-wide hash',
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
        note: 'v3.3 is an ADMISSION change only. The instruction and schema executed are v3.2\'s, '
          + 'byte-unchanged. There is no v3.3 prompt.',
        toolName: 'emit_verifier_verdict',
        maxTokens: VERIFIER_MAX_TOKENS,
      },
      provider_model: {
        provider: 'anthropic',
        model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
        endpoint: 'https://api.anthropic.com',
        apiVersion: '2023-06-01',
        thinking: 'disabled',
        inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
        outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
      },
      cohort: {
        version: SECTION_197_COHORT_VERSION,
        cohortModuleSha256: cohortSha,
        coverage: COHORT_COVERAGE,
        TRUTH_PROVENANCE,
        rows: rowSchemas,
        freshness: 'twelve fresh scenarios. No §195/§192/§187 row and no reserved formal-acceptance '
          + 'material is used as stimulus.',
      },
      executionOrder: {
        method: 'one pass over the twelve rows; Fisher-Yates under mulberry32 seeded from the vNext '
          + 'system prompt sha256, re-drawn until no matched pair is adjacent',
        seedHex: vnextPromptSha.slice(0, 8),
        frozenOrder: order,
        verifierOrderRule: 'verifier calls follow the first-pass phase, in first-pass execution '
          + 'order and then declaration order within a row. The COUNT is an observed outcome and '
          + 'is deliberately not frozen.',
      },
      caps: {
        firstPassCalls: FIRST_PASS_CALLS,
        verifierCallBudget: VERIFIER_CALL_BUDGET,
        HARD_TOTAL_CALL_CEILING,
        hardSpendCapUsd: SPEND_CEILING_USD,
        worstCaseFirstPassUsd: Number(WORST_FIRST_PASS_USD.toFixed(5)),
        worstCaseVerifierUsd: Number(WORST_VERIFIER_USD.toFixed(5)),
        worstCaseTotalUsd: Number((FIRST_PASS_CALLS * WORST_FIRST_PASS_USD
          + VERIFIER_CALL_BUDGET * WORST_VERIFIER_USD).toFixed(5)),
        retries: RETRIES,
        onExceedingCallCeiling: 'STOP before exceeding it, record CALL_CEILING_REACHED, and '
          + 'preserve every artifact already obtained. Facts are NEVER silently truncated to fit '
          + 'the budget — an unverified projected fact is reported as unverified.',
        onCreditRejection: 'STOP on FIRST occurrence.',
        spendRule: 'provider-returned usage only; a call reporting no usage adds zero to actual '
          + 'spend and its frozen worst case to the reservation',
      },
      PROVIDER_ERROR_POLICY: {
        retries: 0,
        rationale: 'a behavioural replicate is not the purpose of this protocol, and a retry after '
          + 'a refusal asks the provider to change its mind',
        notBehavioural: ['TRANSPORT_ERROR', 'HTTP_SERVER_ERROR', 'RATE_LIMITED',
          'ACCOUNT_CREDIT_REJECTION', 'HTTP_CLIENT_ERROR before inference'],
        notBehaviouralTreatment: 'recorded as an EXECUTION/INFRASTRUCTURE event with '
          + 'behavioralExecution=false. NEVER scored as model behaviour, and never counted in any '
          + 'behavioural denominator.',
        behavioural: ['PROVIDER_REFUSAL', 'a returned tool_use block of any content'],
        firstPassFreezeRule: 'once a first-pass output is persisted it is frozen execution '
          + 'evidence. The verifier stage reads it and cannot re-issue a first-pass call.',
        noRegenerationRule: 'a first-pass output is never regenerated because a later verifier call '
          + 'failed.',
      },
      AXIS_CLASSIFICATION: {
        note: 'Frozen before spend. The deterministic validator that ADMITTED a declaration is '
          + 'never the oracle for whether the declaration is semantically right.',
        MECHANICAL_DETERMINISTIC: [
          'provider call counts and error classes', 'actual provider spend',
          'declaration admission and refusal codes', 'projection field provenance',
          'factKey derivation audit (K)', 'projection fidelity as byte preservation (J)',
          'verifier admission and refusal codes', 'citation boundary outcomes (N, O)',
          'settlement authority (P)', 'multi-gap survival through projection (structural half of H)',
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
        ],
        MODEL_ADJUDICATION_PERMITTED: [],
        whyNoModelAdjudication: 'the authorization requires HUMAN semantic review of every '
          + 'projected fact and every first-pass row, and forbids the admitting validator from '
          + 'acting as the semantic oracle. §197 therefore produces a NEUTRAL ADJUDICATION PACKET '
          + 'and stops; it supplies no semantic verdict of its own, not even one labelled '
          + 'diagnostic.',
        verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
      },
      HARD_FAIL_CONDITIONS: [
        'a provider-authored factKey is accepted',
        'deterministic projection invents missing semantic content',
        'deterministic projection alters branch or decision-divergence meaning',
        'a malformed declaration corrupts or removes an independent valid declaration',
        'provider output directly settles an OwedFact',
        'provider-authored priority escalates UNRESOLVED_SAFETY_STATE',
        'v3.3 admits unsupplied citation-shaped authority through the supplied-source exception',
        'exact-source matching is broadened into semantic or paraphrase matching',
        'execution mutates production, customer or database state',
        'the source-integrity gate fails',
        'the preregistered provider-call ceiling would be exceeded',
      ],
      DENOMINATOR_POLICY: {
        rule: 'every axis is reported as x/n against the executions where the behaviour was '
          + 'GENUINELY AVAILABLE, never as occurrences over total executions.',
        governedQuotationOpportunityRows: COHORT_COVERAGE.governedQuotationOpportunityRows,
        unsuppliedCitationOpportunityRows: COHORT_COVERAGE.unsuppliedCitationOpportunityRows,
        falseGapOpportunityRows: SECTION_197_COHORT.filter(r => r.expectedGapCount.max === 0).map(r => r.rowId),
        multiGapOpportunityRows: COHORT_COVERAGE.multiGapRows,
        smallNRule: 'a single observation is reported as x/n literally and never as a percentage; '
          + 'below n=5 an axis is reported NOT_MEANINGFULLY_ESTIMABLE and no threshold is applied.',
      },
      KNOWN_OPEN_CONTRACT_QUESTIONS_NOT_RESOLVED_HERE: {
        OWED_PROPERTY_REPRESENTATION: 'OwedFact has no dedicated owed-property field. §197 does not '
          + 'mutate owed-fact.types.ts, does not add a field, and does not fold missingFact into '
          + 'whyUnresolved. Axis Q collects evidence about the omission and nothing else.',
        PRIORITY_ESCALATION_AUTHORITY: 'projected facts enter at the non-escalating OTHER floor and '
          + 'that is preserved. Axis R records whether a human reviewer judges a gap '
          + 'under-escalated. Evidence for a later policy decision, not a change to the gate.',
        SEMANTIC_CORRECTNESS: 'structural validity does not establish semantic correctness. '
          + 'Measuring that risk is the primary purpose of this run.',
      },
      noPostHocTuning: 'after the first provider call: no change to prompts, schemas, cohort, '
        + 'execution order, truth, scorers, thresholds or axis classification.',
      expectedArtifacts: [
        'PREREGISTRATION.json', 'FIXTURE-MANIFEST.json', 'SEMANTIC-TRUTH-MANIFEST.json',
        'EXECUTION-ORDER.json', 'PROTOCOL-HASHES.txt', 'SOURCE-INTEGRITY.txt',
        'RAW-FIRST-PASS-OUTPUTS.jsonl', 'PROJECTION-PROVENANCE.jsonl',
        'RAW-VERIFIER-OUTPUTS.jsonl', 'RUN-EXECUTION-SUMMARY.json',
        'DETERMINISTIC-RESULTS.json', 'ADJUDICATION-PACKET.json', 'RUN-SUMMARY.json',
      ],
    };
    fsyncWrite(PREREG_PATH, `${JSON.stringify(doc, null, 2)}\n`);

    fsyncWrite(join(EVID, 'FIXTURE-MANIFEST.json'), `${JSON.stringify({
      artifact: 'SECTION_197_FIXTURE_MANIFEST',
      cohortVersion: SECTION_197_COHORT_VERSION,
      TRUTH_PROVENANCE,
      coverage: COHORT_COVERAGE,
      rows: SECTION_197_COHORT.map(r => ({
        rowId: r.rowId, families: r.families, pairedWith: r.pairedWith,
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
      artifact: 'SECTION_197_SEMANTIC_TRUTH_MANIFEST',
      warning: 'SCORING AND PACKET-STRUCTURE REFERENCE ONLY. Never injected into the pipeline and '
        + 'never shown to any model during execution.',
      TRUTH_PROVENANCE,
      identityRule: 'factKey is COMPUTED identity. Semantic target correctness is scored against '
        + 'factKeyIntent and the owed-property intent, NEVER by comparing a generated factKey to a '
        + 'human-authored expected key. Identity is separately audited for deterministic derivation.',
      rows: SECTION_197_COHORT.map(r => ({
        rowId: r.rowId,
        families: r.families,
        pairedWith: r.pairedWith,
        establishedByTheText: r.establishedByTheText,
        notEstablishedByTheText: r.notEstablishedByTheText,
        expectedGapCount: r.expectedGapCount,
        noGapExpected: r.expectedGapCount.max === 0,
        expectedOwedFacts: r.expectedOwedFacts,
        governedEvidenceExpectation: r.verifierGovernedEvidence.length === 0
          ? 'none supplied — reliance NONE is the only correct declaration'
          : r.families.includes('GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY')
            ? 'a supplied record genuinely bears on the owed fact; declared reliance naming its '
              + 'exact sourceId is legitimate, and reproducing the citation it contains is the '
              + 'behaviour v3.3 is expected to admit'
            : 'the supplied record is OFF POINT; reliance NONE is correct and any citation written '
              + 'is necessarily unsupplied and must be refused',
        designIntent: r.designIntent,
      })),
    }, null, 2)}\n`);

    fsyncWrite(join(EVID, 'EXECUTION-ORDER.json'), `${JSON.stringify({
      artifact: 'SECTION_197_EXECUTION_ORDER',
      seedHex: vnextPromptSha.slice(0, 8),
      method: doc.executionOrder.method,
      frozenOrder: order,
      verifierOrderRule: doc.executionOrder.verifierOrderRule,
      EXECUTED: false,
    }, null, 2)}\n`);

    fsyncWrite(join(EVID, 'PROTOCOL-HASHES.txt'), [
      '§197 FROZEN PROTOCOL IDENTITY — recorded before the first provider call',
      '',
      `first-pass instruction      ${EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION}`,
      `first-pass system prompt    ${vnextPromptSha}`,
      `first-pass vNext module     ${vnextModuleSha}`,
      `v15 base system prompt      ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED`,
      `projection module           ${projectionSha}`,
      `projection version          ${FIRST_PASS_OWED_FACT_PROJECTION_VERSION}`,
      `verifier instruction        ${EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION}`,
      `verifier system prompt      ${verifierPromptSha}`,
      `verifier schema             ${verifierSchemaSha}`,
      `admission contract          ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}`,
      `admission module (v3.3)     ${v33Sha}`,
      `cohort                      ${SECTION_197_COHORT_VERSION}`,
      `cohort module               ${cohortSha}`,
      `model                       ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`,
      `executor version            ${EXECUTOR_VERSION}`,
      `preregistration             ${sha(readFileSync(PREREG_PATH, 'utf8'))}`,
      '',
      'v3.3 IS AN ADMISSION CHANGE ONLY — the prompt and schema executed are v3.2\'s.',
      'NOT THIS POPULATION: §187B (v3), §192 (v3.1), §195 (not executed).',
      '',
    ].join('\n'));

    console.log(`PREREGISTRATION FROZEN  rows=${SECTION_197_COHORT.length}`);
    console.log(`  expected owed facts ${COHORT_COVERAGE.expectedOwedFactsMin}-${COHORT_COVERAGE.expectedOwedFactsMax}   no-gap rows ${COHORT_COVERAGE.noGapRows}   matched pairs ${COHORT_COVERAGE.matchedPairs}`);
    console.log(`  ceiling ${HARD_TOTAL_CALL_CEILING} calls / $${SPEND_CEILING_USD}   worst case $${doc.caps.worstCaseTotalUsd}`);
    console.log(`  prereg sha256 ${sha(readFileSync(PREREG_PATH, 'utf8'))}`);
    console.log('ZERO PROVIDER CALLS MADE.');
    return;
  }

  // ---- shared pre-spend identity gate for both execution stages
  const prereg = JSON.parse(readFileSync(PREREG_PATH, 'utf8'));
  if (prereg.firstPassIdentity.systemPromptSha256 !== vnextPromptSha) throw new Error('ABORT: vNext prompt moved since freeze');
  if (prereg.firstPassIdentity.vnextModuleSha256 !== vnextModuleSha) throw new Error('ABORT: vNext module moved since freeze');
  if (prereg.projectionIdentity.moduleSha256 !== projectionSha) throw new Error('ABORT: projection module moved since freeze');
  if (prereg.verifierIdentity.systemPromptSha256 !== verifierPromptSha) throw new Error('ABORT: v3.2 prompt moved since freeze');
  if (prereg.verifierIdentity.responseSchemaSha256 !== verifierSchemaSha) throw new Error('ABORT: v3.2 schema moved since freeze');
  if (prereg.verifierIdentity.admissionModuleSha256 !== v33Sha) throw new Error('ABORT: v3.3 admission module moved since freeze');
  if (prereg.cohort.cohortModuleSha256 !== cohortSha) throw new Error('ABORT: cohort module moved since freeze');
  for (const fr of prereg.cohort.rows) {
    const row = SECTION_197_COHORT.find(r => r.rowId === fr.rowId);
    if (!row) throw new Error(`ABORT: frozen row ${fr.rowId} missing`);
    if (sha(row.observation) !== fr.observationSha256) throw new Error(`ABORT: ${fr.rowId} observation drift`);
    if (sha(buildExpertUserPrompt(analysisInput(row))) !== fr.userPromptSha256) throw new Error(`ABORT: ${fr.rowId} user prompt drift`);
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
    const order = prereg.executionOrder.frozenOrder as Array<{ sequencePosition: number; rowId: string }>;
    let attempted = 0;
    let stopReason: string | null = null;

    for (const step of order) {
      if (attempted + 1 > FIRST_PASS_CALLS) { stopReason = 'FIRST_PASS_CALL_BUDGET_REACHED'; break; }
      if (ledger.wouldExceedCeiling(WORST_FIRST_PASS_USD, SPEND_CEILING_USD)) { stopReason = 'SPEND_CEILING_REACHED'; break; }
      const row = SECTION_197_COHORT.find(r => r.rowId === step.rowId)!;
      const input = analysisInput(row);
      const body = firstPassBody(row);
      attempted += 1;
      const call = await callOnce(body, apiKey);
      const cost = ledger.record({
        ok: call.ok, inputTokens: call.inputTokens, outputTokens: call.outputTokens,
        worstCaseUsd: WORST_FIRST_PASS_USD,
      });

      // RAW IS PERSISTED BEFORE ANY DERIVATION. Nothing below this line can lose it.
      const out: any = call.parsed ?? {};
      const rawDeclarations: unknown[] = Array.isArray(out[UNRESOLVED_FACT_DECLARATIONS_FIELD])
        ? out[UNRESOLVED_FACT_DECLARATIONS_FIELD] : [];
      appendFileSync(FIRST_PASS_FILE, `${JSON.stringify({
        rowId: row.rowId, sequencePosition: step.sequencePosition,
        recordKind: 'FIRST_PASS',
        behavioralExecution: call.ok,
        preInferenceFailure: call.ok ? false : call.preInference,
        rawPersistedBeforeDerivation: true,
        raw: call.raw,
        parsed: call.parsed,
        providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
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
        analysisId: input.analysisId,
        userPromptSha256: sha(buildExpertUserPrompt(input)),
        firstPassInstructionVersion: EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
        firstPassSystemPromptSha256: vnextPromptSha,
        wireSchemaSha256: sha(stableStringify(buildExpertVNextWireSchema(input, GOVERNED_BINDING_FOR_FIRST_PASS))),
        usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
        timestamp: new Date().toISOString(),
      })}\n`);

      if (call.creditRejection) {
        stopReason = 'ACCOUNT_CREDIT_REJECTION_ON_FIRST_OCCURRENCE';
        console.log(`\n  credit rejection at sequence ${step.sequencePosition} — STOPPING IMMEDIATELY`);
        break;
      }

      // ---- deterministic projection, persisted with its provenance.
      const projection = projectDeclaredOwedFacts({
        declarations: rawDeclarations,
        sources: [{ sourceId: `OBS-${row.rowId}`, text: row.observation }],
        suppliedGovernedSourceIds: GOVERNED_BINDING_FOR_FIRST_PASS.governedEvidenceSourceIds,
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
        rowId: row.rowId, sequencePosition: step.sequencePosition,
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
        // The audit re-derives every admitted key from the declaration and the observation, with no
        // reference to what the projection returned. Compared in the scorer, not here.
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

      console.log(`${String(step.sequencePosition).padStart(2)}  ${row.rowId}  ok=${call.ok}  outcome=${out.outcome}  decl=${rawDeclarations.length}  admitted=${projection.facts.length}  refused=${projection.refusedCount}  clar=${(out.decisionCriticalClarifications ?? []).length}  cand=${(out.expertHazardCandidates ?? []).length}  $${cost.toFixed(5)}`);
    }

    const report = ledger.report();
    fsyncWrite(join(EVID, 'FIRST-PASS-EXECUTION-SUMMARY.json'), `${JSON.stringify({
      artifact: 'SECTION_197_FIRST_PASS_EXECUTION_SUMMARY',
      preregistrationSha256: sha(readFileSync(PREREG_PATH, 'utf8')),
      plannedFirstPassCalls: FIRST_PASS_CALLS, attempted, stopReason,
      spendAccounting: report,
      ACTUAL_PROVIDER_SPEND_USD: report.actualProviderSpendUsd,
    }, null, 2)}\n`);
    console.log(`\nFIRST PASS COMPLETE  attempted=${attempted}  actual=$${report.actualProviderSpendUsd.toFixed(5)}  reserved=$${report.budgetReservedUsd.toFixed(5)}  stop=${stopReason ?? 'none'}`);
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

  // Every projected fact, in first-pass execution order then declaration order.
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

  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i];
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
    const row = SECTION_197_COHORT.find(r => r.rowId === t.rowId)!;
    const fp = fpRecords.find(r => r.rowId === t.rowId);
    const projected = projectOwedFact(t.owedFact);
    const analysisId = `AN-197-${row.rowId}-${t.owedFact.factKey}`;
    const userPrompt = buildVerifierV3UserPrompt({
      caseId: `${row.rowId}`,
      observation: row.observation,
      jurisdiction: row.jurisdiction,
      governedEvidence: row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text })),
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

    const out: any = call.parsed ?? {};
    const admissionInput = {
      analysisId, observation: row.observation,
      suppliedOwedFactKeys: [t.owedFact.factKey],
      suppliedGovernedSourceIds: row.verifierGovernedEvidence.map(g => g.sourceId),
      suppliedGovernedEvidence: row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text })),
    };
    const admission = call.parsed
      ? checkVerifierV3_3Output(
        { ...call.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId },
        admissionInput)
      : null;

    appendFileSync(VERIFIER_FILE, `${JSON.stringify({
      rowId: row.rowId, factKey: t.owedFact.factKey, declarationId: t.declarationId,
      verifierSequence: attempted,
      recordKind: 'VERIFIER',
      behavioralExecution: call.ok,
      preInferenceFailure: call.ok ? false : call.preInference,
      rawPersistedBeforeDerivation: true,
      raw: call.raw, parsed: call.parsed,
      providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
      latencyMs: call.latencyMs, respondedModel: call.modelIdentity, stopReason: call.stopReason,
      verdict: out.verdict ?? null,
      rationale: out.rationale ?? null,
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
      analysisId,
      userPromptSha256: sha(userPrompt),
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION,
      verifierSystemPromptSha256: verifierPromptSha,
      verifierSchemaSha256: verifierSchemaSha,
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
    console.log(`${String(attempted).padStart(2)}  ${row.rowId}  ${t.owedFact.factKey}  ok=${call.ok}  verdict=${out.verdict}  admitted=${admission?.admitted}  reuse=${admission?.citationReuseAdmitted}  $${cost.toFixed(5)}`);
  }

  const report = ledger.report();
  fsyncWrite(join(EVID, 'RUN-EXECUTION-SUMMARY.json'), `${JSON.stringify({
    artifact: 'SECTION_197_RUN_EXECUTION_SUMMARY',
    preregistrationSha256: sha(readFileSync(PREREG_PATH, 'utf8')),
    firstPassCallsMade,
    projectedFactsAvailableForVerification: targets.length,
    verifierCallsAttempted: attempted,
    totalProviderCallsAttempted: firstPassCallsMade + attempted,
    HARD_TOTAL_CALL_CEILING,
    stopReason,
    unverifiedProjectedFacts: unverified,
    unverifiedNote: unverified.length === 0 ? 'every projected fact was verified'
      : 'these projected facts were NOT sent to the verifier because a ceiling was reached. They '
        + 'are reported as unverified; no fact was truncated or discarded to fit the budget.',
    verifierPhaseSpendAccounting: report,
    VERIFIER_PHASE_ACTUAL_SPEND_USD: report.actualProviderSpendUsd,
    note: 'this summary covers the VERIFIER phase ledger only. First-pass spend is in '
      + 'FIRST-PASS-EXECUTION-SUMMARY.json and the two are added in RUN-SUMMARY.json.',
  }, null, 2)}\n`);
  console.log(`\nVERIFIER PHASE COMPLETE  attempted=${attempted}  actual=$${report.actualProviderSpendUsd.toFixed(5)}  stop=${stopReason ?? 'none'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
