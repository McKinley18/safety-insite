/**
 * §192 -- FRESH PROSPECTIVE HOSTED VALIDATION OF VERIFIER-v3.1.
 *
 *   --stage=prereg    freeze everything. ZERO provider calls.
 *   --stage=execute   run the frozen order. Provider calls: up to the frozen cap.
 *
 * ==================== SEPARATION FROM v3 ====================
 *
 * This is a NEW POPULATION. §187B's fifteen executions belong to v3 and are never combined with
 * these. The preregistration records v3.1's own hashes and this harness refuses to run if the v3.1
 * identity does not match what was frozen.
 *
 * ==================== NO MID-RUN REPAIR ====================
 *
 * After the first provider call nothing may change: prompt, schema, fixtures, order, scorer,
 * thresholds are all frozen and hash-pinned. Raw provider output is persisted BEFORE any derivation,
 * and a credit rejection stops the run on FIRST occurrence rather than reproving the account
 * condition 39 times -- the §187A failure mode.
 *
 * ==================== SPEND ====================
 *
 * Provider-returned usage is the sole basis for actual spend, via the §188 ProviderSpendLedger. A
 * call reporting no usage adds zero. The conservative reservation governs the ceiling and is never
 * reported as money.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, openSync, fsyncSync, closeSync } from 'fs';
import { join } from 'path';

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

import { EXPERT_HOSTED_INFERENCE_CONFIG } from
  '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION, buildVerifierV3UserPrompt,
} from './lib/expert-verifier-instruction-v3-1';
import {
  checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
} from './lib/expert-verifier-contract-v3';
import {
  PROSPECTIVE_COHORT, PROSPECTIVE_COHORT_VERSION, COHORT_COVERAGE, verifyEvidenceSpansVerbatim,
} from './lib/expert-v3-1-prospective-cohort-2026-09-06';
import { ProviderSpendLedger } from './lib/expert-provider-spend-accounting';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const EXECUTOR_VERSION = 'hazlenz.expert.v3-1.prospective-executor.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const fsyncWrite = (p: string, s: string): void => {
  writeFileSync(p, s);
  const fd = openSync(p, 'r+'); fsyncSync(fd); closeSync(fd);
};

const REPLICATES = 3;
const PLANNED_CALLS = PROSPECTIVE_COHORT.length * REPLICATES;
const HARD_CALL_CAP = 44;
const SPEND_CEILING_USD = 3.25;
const VERIFIER_MAX_TOKENS = 4000;
const WORST_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (16000 / 1e6) * 2;
const RETRIES = 0;

/** Deterministic order: three interleaved blocks, Fisher-Yates under mulberry32 seeded from the
 *  v3.1 prompt hash, a block opening on the previous block's closing row rotated left one. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function frozenOrder(seedHex: string): Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number; rotatedBy: number }> {
  const rnd = mulberry32(parseInt(seedHex.slice(0, 8), 16));
  const ids = PROSPECTIVE_COHORT.map(r => r.rowId);
  const out: Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number; rotatedBy: number }> = [];
  let prevLast: string | null = null;
  let seq = 0;
  for (let block = 1; block <= REPLICATES; block += 1) {
    const a = [...ids];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    let rotatedBy = 0;
    if (prevLast !== null && a[0] === prevLast) { a.push(a.shift() as string); rotatedBy = 1; }
    for (const rowId of a) {
      seq += 1;
      out.push({ sequencePosition: seq, rowId, replicateNumber: block, block, rotatedBy });
    }
    prevLast = a[a.length - 1];
  }
  return out;
}

interface CallResult {
  ok: boolean; raw: unknown; parsed: Record<string, unknown> | null; failureKind: string | null;
  inputTokens: number | null; outputTokens: number | null; latencyMs: number;
  httpStatus: number | null; modelIdentity: string | null; stopReason: string | null;
  creditRejection: boolean;
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
      return { ok: false, raw: json, parsed: null,
        failureKind: creditRejection ? 'ACCOUNT_CREDIT_REJECTION'
          : response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR', ...base };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)?.find(b => b.type === 'tool_use');
    if (!block) return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL', ...base };
    return { ok: true, raw: json, parsed: block.input as Record<string, unknown>, failureKind: null, ...base };
  } catch (e) {
    return { ok: false, raw: { error: (e as Error).message }, parsed: null, failureKind: 'TRANSPORT_ERROR',
      inputTokens: null, outputTokens: null, latencyMs: Date.now() - started, httpStatus: null,
      modelIdentity: null, stopReason: null, creditRejection: false };
  } finally { clearTimeout(timer); }
}

function userPromptFor(row: typeof PROSPECTIVE_COHORT[number]): string {
  return buildVerifierV3UserPrompt({
    caseId: row.rowId,
    observation: row.observation,
    jurisdiction: 'osha-general-industry',
    governedEvidence: [],
    deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
    firstPass: {
      candidates: [],
      clarifications: row.firstPassClarifications.map((q, i) => ({
        clarificationId: `fp-${i + 1}`, question: q.question, affectedDecision: q.affectedDecision,
      })),
      uncertainty: [],
      summary: '',
    },
    owedFacts: [row.owedFact],
  });
}

const PREREG_PATH = join(EVID, 'PREREGISTRATION.json');

async function main(): Promise<void> {
  mkdirSync(EVID, { recursive: true });
  const stage = (process.argv.find(a => a.startsWith('--stage=')) ?? '--stage=prereg').split('=')[1];

  const promptSha = sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT);
  const schemaSha = sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA));

  // ================================================================ STAGE: prereg
  if (stage === 'prereg') {
    if (existsSync(PREREG_PATH)) throw new Error('ABORT: PREREGISTRATION.json exists; refusing to overwrite a freeze');
    const badSpans = verifyEvidenceSpansVerbatim();
    if (badSpans.length > 0) throw new Error(`ABORT: non-verbatim evidenceSpan on ${badSpans.join(',')}`);
    if (COHORT_COVERAGE.unconditionalProposalOpportunities < 6) throw new Error('ABORT: fewer than 6 unconditional proposal opportunities');
    if (COHORT_COVERAGE.opportunityPropertyFamilies.length < 3) throw new Error('ABORT: opportunities span fewer than 3 property families');
    if (COHORT_COVERAGE.challengeOpportunities < 2) throw new Error('ABORT: fewer than 2 challenge opportunities');
    if (COHORT_COVERAGE.regressionRows < 3) throw new Error('ABORT: fewer than 3 regression rows');

    const order = frozenOrder(promptSha);
    const doc = {
      artifact: 'SECTION_192_PRE_SPEND_PREREGISTRATION',
      writtenBeforeFirstProviderCall: true,
      operation: '§192 fresh prospective hosted development validation of verifier-v3.1',
      POPULATION_SEPARATION: {
        statement: 'v3.1 is a NEW POPULATION. §187B\'s fifteen v3 executions are never combined '
          + 'with these results, and no §187 stimulus, owed fact or output is reused.',
        v3_systemPromptSha256: '678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88',
        v3_schemaSha256: '1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a',
      },
      verifierIdentity: {
        instructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION,
        systemPromptSha256: promptSha,
        responseSchemaSha256: schemaSha,
        contractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
        admissionValidatorSha256: sha(readFileSync(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts'), 'utf8')),
        executorVersion: EXECUTOR_VERSION,
        toolName: 'emit_verifier_verdict',
        toolChoice: 'forced tool',
      },
      provider_model: {
        provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
        endpoint: 'https://api.anthropic.com', verifierMaxTokens: VERIFIER_MAX_TOKENS,
        inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
        outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
      },
      cohort: {
        version: PROSPECTIVE_COHORT_VERSION,
        cohortModuleSha256: sha(readFileSync(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts'), 'utf8')),
        rows: PROSPECTIVE_COHORT.length,
        replicates: REPLICATES,
        coverage: COHORT_COVERAGE,
        firstPassSetsAreAuthored: true,
        whyAuthored: 'the cohort must GUARANTEE its behaviour families; a generated first pass '
          + 'cannot. Cost: this validates the verifier IN ISOLATION, not the end-to-end pipeline, '
          + 'and says nothing about whether a real first pass would produce these questions.',
        sizeJustification: '13 rows rather than the suggested 8-10, because the coverage floors '
          + '(>=6 unconditional opportunities across >=3 property families, >=3 regression rows, '
          + '>=2 challenge opportunities, one A^B and one A^B^C conjunctive row, plus '
          + 'fully-established and obstructed families) cannot all be met in 10 rows. 39 calls '
          + 'sits inside the frozen cap and ceiling.',
      },
      frozenRows: PROSPECTIVE_COHORT.map(r => ({
        rowId: r.rowId,
        observationSha256: sha(r.observation),
        owedFactSha256: sha(JSON.stringify(r.owedFact)),
        firstPassSha256: sha(JSON.stringify(r.firstPassClarifications)),
        userPromptSha256: sha(userPromptFor(r)),
        families: r.families,
        owedPropertyFamily: r.owedPropertyFamily,
        conjunctCount: r.conjuncts.length,
        unconditionalProposalOpportunity: r.unconditionalProposalOpportunity,
        challengeOpportunity: r.challengeOpportunity,
      })),
      executionOrder: {
        method: 'three interleaved blocks; Fisher-Yates over the thirteen row ids under mulberry32 '
          + 'seeded from the v3.1 system prompt sha256; a block opening on the previous block\'s '
          + 'closing row is rotated left one position',
        seedHex: promptSha.slice(0, 8),
        frozenOrder: order,
      },
      caps: {
        plannedCalls: PLANNED_CALLS, hardCallCap: HARD_CALL_CAP,
        hardSpendCapUsd: SPEND_CEILING_USD, worstCasePerCallUsd: Number(WORST_CALL_USD.toFixed(5)),
        worstCaseTotalUsd: Number((WORST_CALL_USD * PLANNED_CALLS).toFixed(5)),
        retries: RETRIES,
        onExceeding: 'STOP and report INCOMPLETE. The replicate count is never silently reduced.',
        onCreditRejection: 'STOP on FIRST occurrence. §187A proved that reproving an account '
          + 'condition 15 times establishes nothing.',
        spendRule: 'provider-returned usage only; a call reporting no usage adds zero',
      },
      AXIS_CLASSIFICATION: {
        note: 'Preregistered before spend so the §189 ambiguity cannot recur. The main §192 result '
          + 'is a DEVELOPMENT result adjudicated by a MODEL and labelled diagnostic. No '
          + 'model-produced adjudication is ever called human.',
        MECHANICAL: ['provider errors', 'contract admission and refusal codes',
          'factKey binding correctness against the supplied key', 'declaration modes',
          'unauthorized settlement transitions', 'PROVIDER_SETTLEMENT_AUTHORITY',
          'proposedClarification emission counts', 'nomination counts', 'verdict distribution',
          'adjacent-state ledger mutation'],
        MODEL_DIAGNOSTIC: ['exact owed-fact preservation', 'clarification target correctness',
          'clarification evidence sufficiency', 'nearby-property substitution',
          'adjacent-fact containment', 'unnecessary clarification', 'missed clarification',
          'good-behaviour regression', 'conjunctive sufficiency',
          'challenge validity and reviewability'],
        HUMAN_REQUIRED: [],
        humanAcceptanceGate: 'NOT PART OF §192. A human acceptance gate remains a separate later '
          + 'step, and §192 does not discharge it.',
      },
      MECHANICAL_GATES: {
        providerErrors: 0,
        contractInvalid: 0,
        wrongSuppliedFactKeyBindings: 0,
        unauthorizedSettlementTransitions: 0,
        PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
        adjacentStateLedgerMutation: 0,
        waiverPolicy: 'no mechanical gate may be waived after observing outputs',
      },
      SEMANTIC_DEVELOPMENT_GATES: {
        note: 'Development thresholds, frozen before spend. Reported separately and never collapsed '
          + 'into one aggregate.',
        G1_owedFactPreserved: { scope: 'the 33 executions on the 11 rows whose fact is genuinely open (all but FV-12, FV-13)', threshold: '>= 31/33' },
        G2_clarificationTargetCorrect: { scope: 'executions where a clarification exists, first-pass or proposed', threshold: '>= 90%' },
        G3_clarificationEvidenceSufficient: { scope: 'executions where a clarification exists', threshold: '>= 90%' },
        G4_nearbyPropertySubstitution: { scope: 'all 39', threshold: '= 0' },
        G5_adjacentFactContained: { scope: 'all 39', threshold: '>= 37/39' },
        G6_unnecessaryClarification: { scope: 'the 15 executions on FV-01..03, FV-12, FV-13', threshold: '<= 1/15' },
        G7_missedClarificationOnOpportunities: { scope: 'the 18 executions on the 6 unconditional opportunity rows', threshold: 'appropriate proposals >= 15/18' },
        G8_goodBehaviourRegression: { scope: 'the 9 executions on FV-01..03', threshold: 'fact preserved and no unnecessary replacement >= 8/9' },
        G9_conjunctiveSufficiency: { scope: 'the 6 executions on FV-04, FV-05', threshold: 'insufficiency identified >= 5/6' },
        G10_challengeValidityAndReviewability: { scope: 'challenge-bearing executions', threshold: 'reported as x/n; NOT_MEANINGFULLY_ESTIMABLE below n=5; no threshold applied at small n' },
      },
      CLARIFICATION_POLICY_DENOMINATOR: {
        rule: 'NEVER raw proposedClarification / total executions. Report OPPORTUNITIES, PROPOSALS, '
          + 'APPROPRIATE_PROPOSALS, MISSED_PROPOSALS and UNNECESSARY_PROPOSALS separately.',
        opportunities: COHORT_COVERAGE.unconditionalProposalOpportunities * REPLICATES,
        opportunityRows: PROSPECTIVE_COHORT.filter(r => r.unconditionalProposalOpportunity).map(r => r.rowId),
        opportunityPropertyFamilies: COHORT_COVERAGE.opportunityPropertyFamilies,
      },
      noPostHocTuning: 'after the first provider call: no change to prompt, schema, fixtures, '
        + 'execution order, scorers, thresholds or gates.',
    };
    fsyncWrite(PREREG_PATH, `${JSON.stringify(doc, null, 2)}\n`);
    fsyncWrite(join(EVID, 'FIXTURE-MANIFEST.json'), `${JSON.stringify({
      artifact: 'SECTION_192_FIXTURE_MANIFEST', cohortVersion: PROSPECTIVE_COHORT_VERSION,
      coverage: COHORT_COVERAGE,
      rows: PROSPECTIVE_COHORT.map(r => ({
        rowId: r.rowId, observation: r.observation, owedFact: r.owedFact,
        firstPassClarifications: r.firstPassClarifications, families: r.families,
        owedPropertyFamily: r.owedPropertyFamily, conjuncts: r.conjuncts,
        unconditionalProposalOpportunity: r.unconditionalProposalOpportunity,
        challengeOpportunity: r.challengeOpportunity, designIntent: r.designIntent,
      })),
    }, null, 2)}\n`);
    fsyncWrite(join(EVID, 'EXECUTION-ORDER.json'), `${JSON.stringify({
      artifact: 'SECTION_192_EXECUTION_ORDER', seedHex: promptSha.slice(0, 8),
      method: doc.executionOrder.method, frozenOrder: order,
    }, null, 2)}\n`);
    fsyncWrite(join(EVID, 'PROMPT-SCHEMA-HASHES.txt'),
      [`§192 FROZEN IDENTITY — recorded before the first provider call`, '',
        `v3.1 instruction version   ${EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION}`,
        `v3.1 system prompt sha256  ${promptSha}`,
        `v3.1 schema sha256         ${schemaSha}`,
        `admission contract version ${EXPERT_VERIFIER_CONTRACT_V3_VERSION}`,
        `admission validator sha256 ${sha(readFileSync(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts'), 'utf8'))}`,
        `executor version           ${EXECUTOR_VERSION}`,
        `cohort version             ${PROSPECTIVE_COHORT_VERSION}`,
        `cohort module sha256       ${sha(readFileSync(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts'), 'utf8'))}`,
        `model                      ${EXPERT_HOSTED_INFERENCE_CONFIG.model}`,
        `preregistration sha256     ${sha(readFileSync(PREREG_PATH, 'utf8'))}`,
        '',
        'NOT THIS POPULATION — verifier-v3, whose §187B results are never combined with these:',
        '  v3 system prompt sha256  678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88',
        '  v3 schema sha256         1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a',
        ''].join('\n'));
    console.log(`PREREGISTRATION FROZEN  rows=${PROSPECTIVE_COHORT.length} replicates=${REPLICATES} calls=${PLANNED_CALLS}`);
    console.log(`  opportunities ${COHORT_COVERAGE.unconditionalProposalOpportunities} across ${COHORT_COVERAGE.opportunityPropertyFamilies.length} property families`);
    console.log(`  challenge opportunities ${COHORT_COVERAGE.challengeOpportunities}   regression rows ${COHORT_COVERAGE.regressionRows}`);
    console.log(`  ceiling $${SPEND_CEILING_USD}  worst case $${(WORST_CALL_USD * PLANNED_CALLS).toFixed(5)}`);
    console.log(`  prereg sha256 ${sha(readFileSync(PREREG_PATH, 'utf8'))}`);
    console.log('ZERO PROVIDER CALLS MADE.');
    return;
  }

  // ================================================================ STAGE: execute
  if (stage !== 'execute') throw new Error(`ABORT: unknown stage ${stage}`);
  const prereg = JSON.parse(readFileSync(PREREG_PATH, 'utf8'));

  // pre-spend identity gates
  if (prereg.verifierIdentity.systemPromptSha256 !== promptSha) throw new Error('ABORT: v3.1 prompt moved since freeze');
  if (prereg.verifierIdentity.responseSchemaSha256 !== schemaSha) throw new Error('ABORT: v3.1 schema moved since freeze');
  if (prereg.cohort.cohortModuleSha256 !== sha(readFileSync(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts'), 'utf8'))) {
    throw new Error('ABORT: cohort module moved since freeze');
  }
  for (const fr of prereg.frozenRows) {
    const row = PROSPECTIVE_COHORT.find(r => r.rowId === fr.rowId);
    if (!row) throw new Error(`ABORT: frozen row ${fr.rowId} missing`);
    if (sha(row.observation) !== fr.observationSha256) throw new Error(`ABORT: ${fr.rowId} observation drift`);
    if (sha(JSON.stringify(row.owedFact)) !== fr.owedFactSha256) throw new Error(`ABORT: ${fr.rowId} owed fact drift`);
    if (sha(userPromptFor(row)) !== fr.userPromptSha256) throw new Error(`ABORT: ${fr.rowId} user prompt drift`);
  }

  const runFile = join(EVID, 'RAW-PROVIDER-OUTPUTS.jsonl');
  if (existsSync(runFile)) throw new Error('ABORT: RAW-PROVIDER-OUTPUTS.jsonl exists; refusing to overwrite persisted evidence');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.trim()) throw new Error('ABORT: ANTHROPIC_API_KEY is not set');
  writeFileSync(runFile, '');

  const ledger = new ProviderSpendLedger({
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
  });
  const order = prereg.executionOrder.frozenOrder as Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number }>;
  let attempted = 0; let stopReason: string | null = null;

  for (const step of order) {
    if (attempted + 1 > HARD_CALL_CAP) { stopReason = 'CALL_CAP_REACHED'; break; }
    if (ledger.wouldExceedCeiling(WORST_CALL_USD, SPEND_CEILING_USD)) { stopReason = 'SPEND_CEILING_REACHED'; break; }
    const row = PROSPECTIVE_COHORT.find(r => r.rowId === step.rowId)!;
    const userPrompt = userPromptFor(row);
    const body = {
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: VERIFIER_MAX_TOKENS,
      system: EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [{ name: 'emit_verifier_verdict',
        description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
        input_schema: VERIFIER_V3_1_RESPONSE_SCHEMA }],
      tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    };
    attempted += 1;
    const call = await callOnce(body, apiKey);
    const cost = ledger.record({
      ok: call.ok, inputTokens: call.inputTokens, outputTokens: call.outputTokens,
      worstCaseUsd: WORST_CALL_USD,
    });

    if (call.creditRejection) {
      appendFileSync(runFile, `${JSON.stringify({
        rowId: row.rowId, replicateNumber: step.replicateNumber, sequencePosition: step.sequencePosition,
        recordKind: 'ATTEMPT', behavioralExecution: false, providerOk: false,
        failureKind: 'ACCOUNT_CREDIT_REJECTION', httpStatus: call.httpStatus, raw: call.raw,
        usage: { inputTokens: null, outputTokens: null, costUsd: 0 },
        timestamp: new Date().toISOString(),
      })}\n`);
      stopReason = 'ACCOUNT_CREDIT_REJECTION_ON_FIRST_OCCURRENCE';
      console.log(`\n  credit rejection at sequence ${step.sequencePosition} — STOPPING IMMEDIATELY`);
      break;
    }

    const analysisId = `${row.rowId}-${step.replicateNumber}`;
    const admission = call.parsed
      ? checkVerifierV3Output(
        { ...call.parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId },
        { analysisId, observation: row.observation, suppliedOwedFactKeys: [row.owedFact.factKey] })
      : null;
    const out: any = call.parsed ?? {};
    const decls: any[] = Array.isArray(out.owedFactDeclarations) ? out.owedFactDeclarations : [];

    appendFileSync(runFile, `${JSON.stringify({
      rowId: row.rowId, replicateNumber: step.replicateNumber, sequencePosition: step.sequencePosition,
      block: step.block, recordKind: 'BEHAVIORAL', behavioralExecution: call.ok,
      rawPersistedBeforeDerivation: true, raw: call.raw,
      providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
      latencyMs: call.latencyMs, respondedModel: call.modelIdentity, stopReason: call.stopReason,
      parsed: call.parsed,
      verdict: out.verdict ?? null,
      clarificationSourceMode: out.clarificationSourceMode ?? null,
      bindingFactKey: out.bindingFactKey ?? null,
      proposedClarification: out.proposedClarification ?? null,
      nominatedFact: out.nominatedFact ?? null,
      owedFactDeclarations: decls,
      declarationModes: decls.map(d => d?.declaration),
      declaredKeys: decls.map(d => d?.factKey),
      challengeEmitted: decls.some(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY'),
      challengeReasons: decls.filter(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY').map(d => d?.challengeReason),
      rationale: out.rationale ?? null,
      wrongKeyDeclared: decls.some(d => d?.factKey && d.factKey !== row.owedFact.factKey),
      admission: admission ? { admitted: admission.admitted, codes: [...admission.codes], detail: [...admission.detail], bindingAdmitted: admission.bindingAdmitted, challengedFactKeys: [...admission.challengedFactKeys] } : null,
      contractFailure: admission ? !admission.admitted : true,
      suppliedOwedFact: row.owedFact, suppliedOwedFactSha256: sha(JSON.stringify(row.owedFact)),
      userPromptSha256: sha(userPrompt),
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION,
      verifierInstructionSha256: promptSha, verifierSchemaSha256: schemaSha,
      usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
      timestamp: new Date().toISOString(),
    })}\n`);

    console.log(`${String(step.sequencePosition).padStart(2)}  ${row.rowId}#${step.replicateNumber}  ok=${call.ok}  admitted=${admission?.admitted}  verdict=${out.verdict}  decl=${decls.map(d => d?.declaration).join('/')}  prop=${out.proposedClarification ? 'yes' : 'no'}  $${cost.toFixed(5)}`);
  }

  const report = ledger.report();
  fsyncWrite(join(EVID, 'RUN-EXECUTION-SUMMARY.json'), `${JSON.stringify({
    artifact: 'SECTION_192_RUN_EXECUTION_SUMMARY',
    preregistrationSha256: sha(readFileSync(PREREG_PATH, 'utf8')),
    plannedCalls: PLANNED_CALLS, attempted, stopReason,
    spendAccounting: report,
    ACTUAL_PROVIDER_SPEND_USD: report.actualProviderSpendUsd,
    spendCeilingUsd: SPEND_CEILING_USD, hardCallCap: HARD_CALL_CAP,
  }, null, 2)}\n`);
  console.log(`\nEXECUTION COMPLETE  attempted=${attempted}  actual=$${report.actualProviderSpendUsd.toFixed(5)}  reserved=$${report.budgetReservedUsd.toFixed(5)}  stopReason=${stopReason ?? 'none'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
