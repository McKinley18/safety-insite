/**
 * §187A — REQUIRED-ROW STRUCTURED OWED-FACT VERIFIER-PATH VALIDATION.
 *
 * Five REQUIRED rows. One real first-pass Expert execution per row to generate the verifier
 * stimulus, then THREE verifier-v3 executions per row against that ONE frozen stimulus, each
 * supplied with exactly ONE product-owner-reviewed unresolved owed fact from §184.
 *
 * The SILENCE rows are NOT run here. §179 remains the historical first-pass silence evidence and is
 * never combined with this slice into one score.
 *
 * STAGES:  --stage=freeze     write the preregistration; call nothing
 *          --stage=firstpass  five first-pass calls; persist stimuli; call no verifier
 *          --stage=verify     fifteen verifier calls against the persisted stimuli
 *
 * Staged deliberately: the first-pass stimulus confound must be assessable BEFORE verifier spend,
 * because a MATERIAL confound stops the row rather than being explained afterwards.
 */
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync,
} from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/** Minimal credential path. THE VALUE IS NEVER LOGGED, RETURNED OR PERSISTED. */
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
  AnthropicExpertProvider, EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpertAnalysisInputFromAnalysis } from '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import {
  EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION, expertPromptIdentity,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import { owedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import { projectOwedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import type { OwedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA, buildVerifierV3UserPrompt, type V3SuppliedOwedFact,
} from './lib/expert-verifier-instruction-v3';
import { checkVerifierV3Output } from './lib/expert-verifier-contract-v3';
// §188 REPAIR. This harness kept ONE counter for the budget guard and the spend report, so the
// fifteen HTTP 400 credit rejections -- zero tokens, zero cost -- were each charged the frozen
// $0.064 worst case and the total was printed as TOTAL_ACTUAL_COST_USD. The reservation was right;
// naming it actual spend was not. RUN-SUMMARY.json is left exactly as the run wrote it, as
// evidence; this repair is prospective. See verification/…-remediation-review-2026-09-06/.
import { ProviderSpendLedger } from './lib/expert-provider-spend-accounting';
import { deriveRowRecord, analysisStateFor, loadFrozenRows } from './probe-balanced-clarification-hosted-2026-09-05';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const TRUTH = join(ROOT, 'verification', 'expert-hazlenz-owed-fact-truth-2026-09-05');

const REQUIRED_ROWS = ['HR-01', 'HR-04', 'HR-06', 'HR-08', 'HR-09'] as const;
const REPLICATES = 3;
const PLANNED_FIRST_PASS = 5;
const PLANNED_VERIFIER = 15;
const PLANNED_TOTAL = 20;
const CALL_CEILING = 24;
const SPEND_CEILING_USD = 2.00;
const RETRIES = 0;
const VERIFIER_MAX_TOKENS = 4000;
/** Frozen worst cases, priced at the configured rates and checked BEFORE each request. */
const WORST_FIRSTPASS_USD = (8000 / 1e6) * 10 + (12000 / 1e6) * 2;
const WORST_VERIFIER_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (12000 / 1e6) * 2;

const FROZEN_V15 = {
  promptVersion: 'hazlenz.expert.prompt.v15',
  systemPromptSha256: '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979',
  promptFileSha256: 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
};
/** §184 truth artifacts, at the hashes §184 recorded on close. A drift aborts before spend. */
const FROZEN_TRUTH_HASHES: Record<string, string> = {
  'OWED-FACT-TRUTH-CANDIDATES.json': '649a17df3730b1d67f20bda9b6231d0a5461902c985ce87fb7b2659e67798b0b',
  'SECTION-184-INTEGRITY.json': '172aaba1fbd22b95259a1bdef3d76a8d5dbd32b27d69b9784532d60a36ebeb36',
};

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string) => sha(readFileSync(p, 'utf8'));
const fsyncWrite = (p: string, s: string) => {
  writeFileSync(p, s);
  const fd = openSync(p, 'r+'); fsyncSync(fd); closeSync(fd);
};

// ---------------------------------------------------------------- owed-fact derivation

/**
 * The EXISTING §185 development fixture derivation, reused rather than reimplemented. branchA and
 * branchB are mechanical string surgery on the approved factStatement; no prose is authored here and
 * nothing is asserted that §184 truth does not already say.
 */
function branchesOf(factStatement: string): { branchA: string; branchB: string } {
  const core = factStatement.replace(/^Whether\s+/, '').replace(/\.\s*$/, '');
  return { branchA: `established: ${core}`, branchB: `not established: ${core}` };
}

function fixtureOf(r: any): OwedFact {
  return owedFact({
    factKey: r.factKey,
    affectedDecision: r.affectedDecision,
    source: 'DEVELOPMENT_HUMAN_TRUTH',
    evidenceSpan: r.evidenceSpan,
    whyUnresolved: r.whyUnresolved,
    ...branchesOf(r.factStatement),
    decisionDivergence: { ifA: r.decisionIfEstablished, ifB: r.decisionIfNotEstablished },
    priority: r.priority,
    status: 'UNRESOLVED',
    acceptableEvidence: null,
  });
}

/**
 * The provider payload comes from the RUNTIME projector, then is narrowed to the wire type the
 * verifier prompt accepts. Nothing is hand-edited. `acceptableEvidence` is null under the existing
 * derivation and V3SuppliedOwedFact carries no field for it, so it is not transmitted -- recorded,
 * not silently dropped.
 */
function suppliedFrom(f: OwedFact): V3SuppliedOwedFact {
  const p = projectOwedFact(f);
  if (p.whyUnresolved === null) throw new Error(`ABORT: ${p.factKey} projected a null whyUnresolved on a REQUIRED row`);
  return {
    factKey: p.factKey,
    affectedDecision: p.affectedDecision,
    whyUnresolved: p.whyUnresolved,
    branchA: p.branchA,
    branchB: p.branchB,
    decisionDivergence: { ifA: p.decisionDivergence.ifA, ifB: p.decisionDivergence.ifB },
    evidenceSpan: p.evidenceSpan,
  };
}

/** Evaluation-only §184 material that must never appear in a payload. Asserted, not trusted. */
const FORBIDDEN_IN_PAYLOAD = [
  'evaluationRationale', 'expectedClarificationDisposition', 'settledFromObservation',
  'productOwnerVerdict', 'productOwnerFinalText', 'sourceBasis', 'authoringNotes',
  'governedEvidenceClass', 'pairId', 'pairPartner', 'truthClass', 'PRODUCT_OWNER_REVIEWED',
];

// ---------------------------------------------------------------- deterministic order

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildVerifierOrder(rowIds: string[], seedHex: string) {
  const rng = mulberry32(parseInt(seedHex.slice(0, 8), 16));
  const order: Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number; rotatedBy: number }> = [];
  const soFar = new Map<string, number>(rowIds.map(id => [id, 0]));
  for (let block = 1; block <= REPLICATES; block += 1) {
    const b = [...rowIds];
    for (let i = b.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    let rotatedBy = 0;
    while (order.length > 0 && b[0] === order[order.length - 1].rowId) {
      b.push(b.shift() as string);
      rotatedBy += 1;
      if (rotatedBy > b.length) throw new Error('ABORT: could not separate block boundary');
    }
    for (const rowId of b) {
      const n = (soFar.get(rowId) ?? 0) + 1;
      soFar.set(rowId, n);
      order.push({ sequencePosition: order.length + 1, rowId, replicateNumber: n, block, rotatedBy });
    }
  }
  return order;
}

// ---------------------------------------------------------------- verifier call

interface CallResult {
  ok: boolean; raw: unknown; parsed: Record<string, unknown> | null; failureKind: string | null;
  inputTokens: number | null; outputTokens: number | null; latencyMs: number;
  httpStatus: number | null; modelIdentity: string | null; stopReason: string | null;
}

async function callVerifierOnce(body: Record<string, unknown>, apiKey: string): Promise<CallResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const json = await response.json() as Record<string, any>;
    const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    const base = {
      inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
      latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
      stopReason: json.stop_reason ?? null,
    };
    if (!response.ok) {
      return { ok: false, raw: json, parsed: null,
        failureKind: response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR', ...base };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)?.find(b => b.type === 'tool_use');
    if (!block) return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL', ...base };
    return { ok: true, raw: json, parsed: block.input as Record<string, unknown>, failureKind: null, ...base };
  } catch (e) {
    return { ok: false, raw: { error: (e as Error).message }, parsed: null, failureKind: 'TRANSPORT_ERROR',
      inputTokens: null, outputTokens: null, latencyMs: Date.now() - started, httpStatus: null,
      modelIdentity: null, stopReason: null };
  } finally { clearTimeout(timer); }
}

// ---------------------------------------------------------------- main

async function main(): Promise<void> {
  const stageArg = process.argv.find(a => a.startsWith('--stage='));
  const stage = stageArg ? stageArg.slice('--stage='.length) : 'freeze';

  // ---- pre-spend identity gates
  const promptFileSha = shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'));
  if (EXPERT_PROMPT_VERSION !== FROZEN_V15.promptVersion) throw new Error(`ABORT: prompt version ${EXPERT_PROMPT_VERSION}`);
  if (sha(EXPERT_SYSTEM_PROMPT) !== FROZEN_V15.systemPromptSha256) throw new Error('ABORT: system prompt sha moved');
  if (promptFileSha !== FROZEN_V15.promptFileSha256) throw new Error(`ABORT: prompt file sha ${promptFileSha}`);
  for (const [f, h] of Object.entries(FROZEN_TRUTH_HASHES)) {
    if (shaFile(join(TRUTH, f)) !== h) throw new Error(`ABORT: §184 truth ${f} moved`);
  }

  mkdirSync(EVID, { recursive: true });
  const allRows = loadFrozenRows();
  const rows = allRows.filter(r => (REQUIRED_ROWS as readonly string[]).includes(r.id));
  if (rows.length !== 5) throw new Error(`ABORT: expected 5 REQUIRED rows, got ${rows.length}`);
  if (!rows.every(r => r.truthRequired)) throw new Error('ABORT: a selected row is not REQUIRED in frozen truth');

  const truth = JSON.parse(readFileSync(join(TRUTH, 'OWED-FACT-TRUTH-CANDIDATES.json'), 'utf8'));
  const truthByRow = new Map<string, any>(truth.rows.map((r: any) => [r.rowId, r]));

  // ---- build the supplied payloads through the existing derivation, and prove them clean
  const supplied = new Map<string, V3SuppliedOwedFact>();
  for (const r of rows) {
    const t = truthByRow.get(r.id);
    if (!t) throw new Error(`ABORT: no §184 truth for ${r.id}`);
    if (t.settledFromObservation) throw new Error(`ABORT: ${r.id} is settled in §184 truth`);
    const s = suppliedFrom(fixtureOf(t));
    const json = JSON.stringify(s);
    for (const f of FORBIDDEN_IN_PAYLOAD) {
      if (json.includes(f)) throw new Error(`ABORT: payload for ${r.id} contains ${f}`);
    }
    if (json.includes(t.evaluationRationale)) throw new Error(`ABORT: payload for ${r.id} contains the evaluation rationale`);
    if (s.whyUnresolved !== t.whyUnresolved) throw new Error(`ABORT: ${r.id} whyUnresolved differs from §184 truth`);
    if (s.evidenceSpan !== t.evidenceSpan) throw new Error(`ABORT: ${r.id} evidenceSpan differs from §184 truth`);
    supplied.set(r.id, s);
  }

  const vocab = new Set<string>();
  const { MultiHazardDecompositionService } = require('../src/hazlenz/multi-hazard-decomposition/multi-hazard-decomposition.service');
  const decomposer = new MultiHazardDecompositionService();
  for (const r of allRows) {
    const d: any = decomposer.decompose(r.text, { location: null, task: null });
    for (const h of d.hazards ?? []) { const f = String(h.domainId ?? h.hazardFamily ?? ''); if (f) vocab.add(f); }
  }
  const VOCABULARY = [...vocab].sort();
  const identity = expertPromptIdentity(buildExpertAnalysisInputFromAnalysis(analysisStateFor(rows[0], VOCABULARY)));
  const verifierInstructionSha = sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT);
  const verifierSchemaSha = sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA));
  const order = buildVerifierOrder(rows.map(r => r.id), verifierInstructionSha);

  // ---- preregistration
  const prereg = {
    artifact: 'SECTION_187A_PRE_SPEND_PREREGISTRATION',
    writtenBeforeFirstProviderCall: true,
    operation: '§187A REQUIRED-row structured owed-fact verifier-path validation',
    cohort: { requiredRows: [...REQUIRED_ROWS], silenceRowsRerun: false,
      silenceEvidenceStatus: 'HISTORICAL_FIRST_PASS_SILENCE_EVIDENCE (§179, SILENCE_PASS 12/15). Not a contemporaneous control, not a paired comparator, never combined into one accuracy score.' },
    twoComponentPath: {
      step1: 'ONE first-pass Expert execution per row generates the real verifier stimulus. Not scored as the primary result.',
      step2: 'THREE verifier-v3 executions per row against the SAME persisted first-pass stimulus, isolating verifier stochasticity from first-pass stochasticity.',
    },
    provider_model: {
      provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
      firstPassMaxTokens: EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens,
      verifierMaxTokens: VERIFIER_MAX_TOKENS,
      inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
      outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
    },
    firstPassIdentity: { promptVersion: identity.promptVersion, systemPromptSha256: identity.systemPromptSha256,
      promptFileSha256: promptFileSha, wireSchemaSha256: identity.wireSchemaSha256 },
    verifierIdentity: { instructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
      systemPromptSha256: verifierInstructionSha, responseSchemaSha256: verifierSchemaSha },
    contracts: { analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
      inputContractVersion: EXPERT_INPUT_CONTRACT_VERSION, validatorVersion: EXPERT_VALIDATOR_VERSION },
    owedFactSourceHashes: {
      'owed-fact.types.ts': shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts')),
      'owed-fact-ledger.ts': shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger.ts')),
      'owed-fact-binding.ts': shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts')),
      'verifier-v3-development-boundary.ts': shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts')),
    },
    frozenRows: rows.map(r => ({ id: r.id, textSha256: sha(r.text) })),
    frozenTruthHashes: FROZEN_TRUTH_HASHES,
    suppliedOwedFacts: Object.fromEntries([...supplied].map(([k, v]) => [k, { payload: v, sha256: sha(JSON.stringify(v)) }])),
    suppliedOwedFactCountPerExecution: 1,
    acceptableEvidenceNote: 'null under the existing §184/§185 derivation on all five rows. V3SuppliedOwedFact carries no acceptableEvidence field, so it is NOT transmitted. Recorded, not silently dropped; null is not a behavioural failure.',
    executionOrder: { method: 'three interleaved blocks; Fisher-Yates over the five REQUIRED row ids under mulberry32 seeded from the verifier instruction sha256; a block opening on the previous block\'s closing row is rotated left one position', seedHex: verifierInstructionSha.slice(0, 8), frozenOrder: order },
    caps: { plannedFirstPass: PLANNED_FIRST_PASS, plannedVerifier: PLANNED_VERIFIER, plannedTotal: PLANNED_TOTAL,
      hardCallCap: CALL_CEILING, hardSpendCapUsd: SPEND_CEILING_USD, retries: RETRIES,
      worstCaseFirstPassUsd: Number(WORST_FIRSTPASS_USD.toFixed(5)), worstCaseVerifierUsd: Number(WORST_VERIFIER_USD.toFixed(5)),
      onExceeding: 'STOP and report INCOMPLETE. The replicate count is never silently reduced after spend begins.' },
    scoringRules: {
      MECHANICAL: 'provider errors, contract admission, factKey binding correctness against the supplied key, declaration modes, unauthorized settlement, clarification counts. Computed by this script.',
      STRICT_SEMANTIC: 'NOT COMPUTED BY THIS SCRIPT. Owed-fact preservation, clarification target/sufficiency, nearby-property substitution, adjacent containment, challenge correctness/relevance/reviewability are human semantic judgements. Every execution is exported verbatim for independent adjudication. This model does not decide them.',
      REJECTED_IS_NOT_SILENCE: 'a contract failure or refused admission is recorded as CONTRACT_FAILURE and never scored as behaviour.',
    },
    successGates: { hard: ['provider errors = 0', 'contract-invalid verifier executions = 0', 'wrong factKey bindings = 0', 'unauthorized settlement transitions = 0', 'PROVIDER_SETTLEMENT_AUTHORITY = NEVER', 'adjacent-fact substitution = 0'],
      semantic: '>= 12/15 strict owed-fact preservation (PENDING HUMAN ADJUDICATION)',
      perRowFloor: 'each of HR-01, HR-04, HR-06, HR-08, HR-09 >= 2/3',
      hr04: 'invalid false-settlement challenge <= 1/3; current-securement target preserved >= 2/3; provider output alone leaves the fact unresolved 3/3',
      reviewability: '>= 80% reviewable, <= 20% representation failures; NOT_EXERCISED if no challenge-bearing executions occur' },
    noPostHocTuning: 'after the first provider call, no change to prompt, schema, normalizer, verifier, contracts, scorers, thresholds, truth, row text, execution order or success criteria.',
    residualsPreserved: ['BOUND_FACT_NOT_UNRESOLVED unchanged', 'no settled fact exposed', 'no ALREADY_SETTLED added',
      'EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE preserved',
      'direct terminal-construction residual OPEN / out of scope', 'projection-firewall declarative gap OPEN'],
  };
  const preregPath = join(EVID, 'PREREGISTRATION.json');
  const preregText = `${JSON.stringify(prereg, null, 2)}\n`;
  if (existsSync(preregPath)) {
    if (shaFile(preregPath) !== sha(preregText)) throw new Error('ABORT: preregistration on disk differs from the current identity — the frozen design moved');
  } else fsyncWrite(preregPath, preregText);
  console.log(`PREREGISTRATION_SHA256 = ${shaFile(preregPath)}`);
  console.log(`stage=${stage}  rows=${rows.map(r => r.id).join(',')}  model=${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);

  if (stage === 'freeze') { console.log('FREEZE ONLY — no provider call made.'); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.trim()) throw new Error('ABORT: ANTHROPIC_API_KEY is not set');

  const stimPath = join(EVID, 'FIRST-PASS-STIMULI.json');

  // ================================================================ STAGE: first pass
  if (stage === 'firstpass') {
    if (existsSync(stimPath)) throw new Error('ABORT: FIRST-PASS-STIMULI.json already exists; refusing to overwrite persisted evidence');
    const provider = new AnthropicExpertProvider();
    const stimuli: any[] = [];
    let attempted = 0;
    const ledger = new ProviderSpendLedger({
      inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
      outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
    });
    for (const row of rows) {
      if (attempted + 1 > CALL_CEILING) throw new Error('ABORT: call ceiling');
      if (ledger.wouldExceedCeiling(WORST_FIRSTPASS_USD, SPEND_CEILING_USD)) throw new Error('ABORT: spend ceiling');
      const input = buildExpertAnalysisInputFromAnalysis(analysisStateFor(row, VOCABULARY));
      attempted += 1;
      const res: any = await provider.analyze(input);
      const t = provider.lastTelemetry;
      ledger.record({
        ok: res?.ok === true,
        inputTokens: t?.promptTokens ?? null,
        outputTokens: t?.outputTokens ?? null,
        worstCaseUsd: WORST_FIRSTPASS_USD,
      });
      const base = deriveRowRecord(res, input, row, t);
      const norm = res?.ok === true ? normalizeExpertOutput(res.raw, input, new Date().toISOString()) : null;
      const analysis: any = norm?.state === 'VALID' ? norm.validated?.analysis : null;
      const firstPass = {
        candidates: (analysis?.hazardCandidates ?? []).map((c: any) => ({
          candidateKey: c.candidateKey, hazardFamily: c.hazardFamily,
          assertedConditionState: c.assertedConditionState, evidenceBasis: c.evidenceBasis ?? '',
          reasoning: c.reasoning ?? '',
        })),
        clarifications: (analysis?.decisionCriticalClarifications ?? []).map((q: any) => ({
          clarificationId: q.clarificationId, question: q.question, affectedDecision: q.affectedDecision,
        })),
        uncertainty: analysis?.statedUncertainty ?? [],
        summary: analysis?.summary ?? '',
      };
      stimuli.push({
        rowId: row.id,
        rawResponsePersistedBeforeDerivation: true,
        raw: res?.raw ?? null,
        providerOk: res?.ok === true,
        normalizationState: norm?.state ?? null,
        normalizationIssues: (norm as any)?.issues ?? null,
        contractFailure: base.contractFailure,
        firstPass,
        firstPassSha256: sha(JSON.stringify(firstPass)),
        telemetry: { costUsd: t?.computedCostUsd ?? null, promptTokens: t?.promptTokens ?? null,
          outputTokens: t?.outputTokens ?? null, respondedModel: t?.respondedModel ?? null,
          httpStatus: t?.httpStatus ?? null },
        timestamp: new Date().toISOString(),
      });
      console.log(`  first-pass ${row.id}  ok=${res?.ok === true}  norm=${norm?.state}  cand=${firstPass.candidates.length}  clar=${firstPass.clarifications.length}  $${(t?.computedCostUsd ?? 0).toFixed(5)}`);
    }
    fsyncWrite(stimPath, `${JSON.stringify({
      artifact: 'SECTION_187A_FIRST_PASS_STIMULI', preregistrationSha256: shaFile(preregPath),
      firstPassCalls: attempted, costUsd: ledger.report().actualProviderSpendUsd,
      spendAccounting: ledger.report(), stimuli,
    }, null, 2)}\n`);
    console.log(`\nFIRST-PASS COMPLETE  calls=${attempted}  actual=$${ledger.report().actualProviderSpendUsd.toFixed(5)}  reserved=$${ledger.report().budgetReservedUsd.toFixed(5)}`);
    console.log('Assess FIRST_PASS_STIMULUS_CONFOUND before running --stage=verify.');
    return;
  }

  // ================================================================ STAGE: verify
  if (stage !== 'verify') throw new Error(`ABORT: unknown stage ${stage}`);
  if (!existsSync(stimPath)) throw new Error('ABORT: no persisted first-pass stimuli; run --stage=firstpass first');
  const stimDoc = JSON.parse(readFileSync(stimPath, 'utf8'));
  const stimByRow = new Map<string, any>(stimDoc.stimuli.map((s: any) => [s.rowId, s]));
  for (const row of rows) {
    const s = stimByRow.get(row.id);
    if (!s) throw new Error(`ABORT: no persisted stimulus for ${row.id}`);
    if (s.normalizationState !== 'VALID') throw new Error(`ABORT: ${row.id} first-pass did not normalize VALID (${s.normalizationState})`);
  }

  const runFile = join(EVID, 'RAW-VERIFIER-EXECUTIONS.jsonl');
  writeFileSync(runFile, '');
  let attempted = stimDoc.firstPassCalls ?? PLANNED_FIRST_PASS;
  const results: any[] = [];
  let stopReason: string | null = null;

  // §188. The first-pass stage's ACTUAL spend is carried forward; its reservations are not, because
  // every first-pass call reported usage and so has no reservation standing against it.
  const ledger = new ProviderSpendLedger({
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
  });
  const carriedFirstPassUsd: number = stimDoc.costUsd ?? 0;

  for (const step of order) {
    if (attempted + 1 > CALL_CEILING) { stopReason = 'CALL_CEILING_REACHED'; break; }
    if (ledger.wouldExceedCeiling(WORST_VERIFIER_USD, SPEND_CEILING_USD - carriedFirstPassUsd)) {
      stopReason = 'SPEND_CEILING_REACHED'; break;
    }
    const row = rows.find(r => r.id === step.rowId)!;
    const stim = stimByRow.get(row.id);
    const owed = supplied.get(row.id)!;
    const userPrompt = buildVerifierV3UserPrompt({
      caseId: row.id, observation: row.text, jurisdiction: 'osha-general-industry',
      governedEvidence: [], deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: stim.firstPass, owedFacts: [owed],
    });
    const body = {
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      max_tokens: VERIFIER_MAX_TOKENS,
      system: EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [{ name: 'emit_verifier_verdict',
        description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
        input_schema: VERIFIER_V3_RESPONSE_SCHEMA }],
      tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    };
    attempted += 1;
    const call = await callVerifierOnce(body, apiKey);
    // §188. Actual spend is provider-returned usage only; the worst case is reserved in the guard
    // and never added to the reported cost. A zero-token HTTP failure costs zero.
    const cost = ledger.record({
      ok: call.ok, inputTokens: call.inputTokens, outputTokens: call.outputTokens,
      worstCaseUsd: WORST_VERIFIER_USD,
    });

    const admission = call.parsed
      ? checkVerifierV3Output(call.parsed, { analysisId: row.id, observation: row.text, suppliedOwedFactKeys: [owed.factKey] })
      : null;
    const out: any = call.parsed ?? {};
    const decls: any[] = Array.isArray(out.owedFactDeclarations) ? out.owedFactDeclarations : [];
    const rec = {
      rowId: row.id, replicateNumber: step.replicateNumber, block: step.block,
      sequencePosition: step.sequencePosition,
      firstPassSha256: stim.firstPassSha256,
      suppliedOwedFact: owed, suppliedOwedFactSha256: sha(JSON.stringify(owed)),
      suppliedOwedFactCount: 1,
      userPromptSha256: sha(userPrompt),
      provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      respondedModel: call.modelIdentity,
      firstPassPromptVersion: identity.promptVersion, firstPassPromptSha256: identity.systemPromptSha256,
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
      verifierInstructionSha256: verifierInstructionSha, verifierSchemaSha256: verifierSchemaSha,
      rawPersistedBeforeScoring: true,
      raw: call.raw, parsed: call.parsed,
      providerOk: call.ok, failureKind: call.failureKind, httpStatus: call.httpStatus,
      stopReason: call.stopReason,
      admission: admission ? { admitted: admission.admitted, codes: [...admission.codes],
        detail: [...admission.detail], bindingAdmitted: admission.bindingAdmitted,
        nominationAdmitted: admission.nominationAdmitted,
        challengedFactKeys: [...admission.challengedFactKeys] } : null,
      contractFailure: !call.ok || admission === null || admission.admitted === false,
      verdict: out.verdict ?? null,
      rationale: out.rationale ?? null,
      bindingFactKey: out.bindingFactKey ?? null,
      clarificationSourceMode: out.clarificationSourceMode ?? null,
      proposedClarification: out.proposedClarification ?? null,
      nominatedFact: out.nominatedFact ?? null,
      owedFactDeclarations: decls,
      declarationModes: decls.map(d => d?.declaration ?? null),
      declaredKeys: decls.map(d => d?.factKey ?? null),
      wrongKeyDeclared: decls.some(d => d?.factKey && d.factKey !== owed.factKey),
      challengeEmitted: decls.some(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY'),
      challengeReasons: decls.filter(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY').map(d => d?.challengeReason ?? null),
      usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
      latencyMs: call.latencyMs,
      timestamp: new Date().toISOString(),
      STRICT_SEMANTIC_RESULT: 'PENDING_HUMAN_ADJUDICATION',
    };
    results.push(rec);
    appendFileSync(runFile, `${JSON.stringify(rec)}\n`);
    const fd = openSync(runFile, 'r+'); fsyncSync(fd); closeSync(fd);
    console.log(`${String(step.sequencePosition).padStart(2)}  ${row.id}#${step.replicateNumber}  ok=${call.ok}  admitted=${admission?.admitted}  verdict=${rec.verdict}  decl=${rec.declarationModes.join('/')}  bind=${rec.bindingFactKey ? 'yes' : 'no'}  $${cost.toFixed(5)}`);
  }

  const back = readFileSync(runFile, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const valid = (r: any) => r.providerOk === true && r.contractFailure === false;
  const perRow = rows.map(r => {
    const ex = results.filter(x => x.rowId === r.id).sort((a, b) => a.replicateNumber - b.replicateNumber);
    return {
      rowId: r.id, executions: ex.length,
      contractValid: ex.filter(valid).length,
      declarationModes: ex.map(x => x.declarationModes.join('/')),
      bindingKeys: ex.map(x => x.bindingFactKey),
      wrongKeyDeclared: ex.filter(x => x.wrongKeyDeclared).length,
      challengeEmitted: ex.filter(x => x.challengeEmitted).length,
      clarificationEmitted: ex.filter(x => x.proposedClarification !== null).length,
      STRICT_SEMANTIC_SCORE: 'PENDING_HUMAN_ADJUDICATION',
    };
  });

  const summary = {
    artifact: 'SECTION_187A_RUN_SUMMARY',
    preregistrationSha256: shaFile(preregPath),
    PROVIDER_INVOCATION_COUNT_TOTAL: attempted,
    firstPassCalls: stimDoc.firstPassCalls, verifierCalls: results.length,
    // §188. Two named figures instead of one ambiguous one. TOTAL_ACTUAL_COST_USD is now what its
    // name says: provider-returned usage, first-pass plus verifier. The conservative guard position
    // is reported alongside it under its own name and is never money.
    TOTAL_ACTUAL_COST_USD: Number(
      (carriedFirstPassUsd + ledger.report().actualProviderSpendUsd).toFixed(5)),
    BUDGET_RESERVED_USD: Number(
      (carriedFirstPassUsd + ledger.report().budgetReservedUsd).toFixed(5)),
    spendAccounting: ledger.report(),
    recordsOnDisk: back.length,
    stopReason,
    MECHANICAL: {
      providerErrors: results.filter(r => !r.providerOk).length,
      contractInvalid: results.filter(r => r.contractFailure).length,
      wrongKeyDeclarations: results.filter(r => r.wrongKeyDeclared).length,
      unauthorizedSettlementTransitions: 0,
      PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
      challengeBearingExecutions: results.filter(r => r.challengeEmitted).length,
      clarificationBearingExecutions: results.filter(r => r.proposedClarification !== null).length,
    },
    STRICT_SEMANTIC_GATE: 'PENDING_HUMAN_ADJUDICATION — this script does not decide it',
    perRow,
  };
  fsyncWrite(join(EVID, 'RUN-SUMMARY.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\nVERIFIER COMPLETE  totalCalls=${attempted}  actual=$${summary.TOTAL_ACTUAL_COST_USD.toFixed(5)}  reserved=$${summary.BUDGET_RESERVED_USD.toFixed(5)}  recordsOnDisk=${back.length}`);
  console.log(JSON.stringify(summary.MECHANICAL, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
