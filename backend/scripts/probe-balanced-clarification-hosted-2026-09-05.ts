/**
 * §175 — BOUNDED HOSTED DEVELOPMENT VALIDATION AGAINST THE FROZEN BALANCED CLARIFICATION INSTRUMENT.
 *
 * TEN logical calls, one per frozen row, against a TWELVE-request ceiling and a $3.00 spend ceiling.
 * DEVELOPMENT validation only. Not acceptance, not production validation, not customer activation.
 *
 * ==================== WHAT THIS SCRIPT SCORES, AND WHAT IT REFUSES TO SCORE ====================
 *
 * SILENCE rows are scored EXACTLY and MECHANICALLY. The frozen truth says nothing is owed on those
 * rows, so ANY clarification emitted there is a failure by definition. That needs no semantic
 * judgement and no authored target, which is why SILENCE_PRECISION is a real number here.
 *
 * REQUIRED rows are scored only to a BOUND. The authorization makes a REQUIRED row correct solely
 * when the clarification addresses "the material unresolved fact represented by that row" -- and the
 * frozen §174 record carries MATERIAL_UNRESOLVED_FACTS = null on all ten rows, because the product
 * owner supplied the binary verdict alone. The only per-row statement of that fact anywhere is the
 * authoring-side PAIR-MAP written by this model family in §173.
 *
 * So this script computes REQUIRED_RECALL_LOOSE -- did any clarification appear -- and stops. It
 * does NOT decide whether the question addressed the owed fact. Scoring this model family against a
 * target the same family authored is the closed loop refused since §162, and §169 is the concrete
 * reason: under human review, 4 of 12 clarifications that named the right fact were still only
 * partially correct. No string comparison and no model judgement reproduces that distinction.
 *
 * Every emitted clarification is written verbatim to the adjudication packet beside its row, so the
 * strict determination is a human read away rather than an invented number.
 *
 * ==================== THE UNIFORM INPUT DECISION, MADE BEFORE SEEING ANY RESULT ====================
 *
 * `allowedHazardFamilies` is model-visible and the instrument never specified it. Rather than curate
 * one per row -- which would be authoring, and could bias a pair -- every row receives the SAME
 * vocabulary: the union of the families the REAL deterministic decomposer emits across the ten
 * frozen observations. Identical across rows, so it cannot separate the classes; production-derived,
 * so it is not invented here.
 *
 * This is safe for the primary question because clarifications are NOT family-gated: the enum on
 * `hazardFamily` constrains hazard CANDIDATES only, so the vocabulary cannot prevent Expert from
 * asking about anything.
 *
 * ==================== SAFETY PROPERTIES ====================
 *
 *   - PROSPECTIVE spend enforcement at the frozen worst case, checked BEFORE each request.
 *   - Frozen-artifact hashes verified before the first request; a mismatch aborts before spend.
 *   - fsync-backed append-only run records, read back from disk mid-run.
 *   - The credential is read from the environment and NEVER logged, returned or persisted.
 *   - Retries count against the hard cap. Retry policy is ZERO retries.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, openSync, fsyncSync, closeSync } from 'fs';
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
import { MultiHazardDecompositionService } from '../src/hazlenz/multi-hazard-decomposition/multi-hazard-decomposition.service';
import {
  buildExpertAnalysisInputFromAnalysis, type HazLenzAnalysisState,
} from '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { EXPERT_SYSTEM_PROMPT, expertPromptIdentity } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';

// §177 Phase B writes to its OWN directory. The §175 preregistration, run records and scored
// result are immutable evidence of a DIFFERENT prompt identity (v13, systemPrompt c4b31624) and
// must not be overwritten or appended to by a run against v14.
const EVID = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-post-remediation-validation-2026-09-05');
const INSTR = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-balanced-clarification-instrument-2026-09-05');

const CALL_CEILING = 12;
const SPEND_CEILING_USD = 3.00;
const RETRIES = 0;
/** Frozen worst case: full 8000 output tokens plus a generous input allowance, priced at config. */
const WORST_CASE_USD = (8000 / 1e6) * 10 + (12000 / 1e6) * 2;

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(readFileSync(p, 'utf8'));

interface Row { id: string; text: string; truthRequired: boolean }

export function loadFrozenRows(): Row[] {
  const frozen = JSON.parse(readFileSync(join(INSTR, 'FROZEN-ROW-HASHES.json'), 'utf8'));
  const pkt = JSON.parse(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'));
  const rec = JSON.parse(readFileSync(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'), 'utf8'));

  // Integrity BEFORE spend. A drifted row would attribute a human verdict to text no human read.
  const packetOk = sha(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'))
    === frozen.REVIEW_PACKET_HASH['BLINDED-HUMAN-REVIEW-PACKET.json'];
  if (!packetOk) throw new Error('ABORT: review packet hash mismatch');
  const truthHash = sha(readFileSync(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'), 'utf8'));
  if (!truthHash.startsWith('4412990912bef4e9')) throw new Error(`ABORT: truth record hash ${truthHash}`);

  const verdict = new Map<string, boolean>(
    rec.rows.map((r: any) => [r.REVIEW_ROW_ID, r.HUMAN_CLARIFICATION_REQUIRED]));
  const rows: Row[] = [];
  for (const r of pkt.rows) {
    const id = r.REVIEW_ROW_ID as string;
    const want = frozen.rowTextHashes[id].rowTextSha256;
    if (sha(r.TEXT) !== want) throw new Error(`ABORT: row ${id} text drifted from freeze`);
    const v = verdict.get(id);
    if (typeof v !== 'boolean') throw new Error(`ABORT: no frozen verdict for ${id}`);
    rows.push({ id, text: r.TEXT, truthRequired: v });
  }
  if (rows.length !== 10) throw new Error(`ABORT: expected 10 rows, got ${rows.length}`);
  return rows;
}

const decomposer = new MultiHazardDecompositionService();

export function analysisStateFor(row: Row, vocabulary: string[]): HazLenzAnalysisState {
  const d: any = decomposer.decompose(row.text, { location: null, task: null });
  const hazards = (d.hazards ?? []).map((h: any, i: number) => ({
    hazardId: h.hazardId ?? `f-${i + 1}`,
    domainId: h.domainId,
    hazardFamily: h.domainId,
    conditionState: h.conditionState,
    observationFragment: h.observationFragment,
  }));
  return {
    analysisId: row.id,
    observation: row.text,
    inspectionContext: { location: null, task: null },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: vocabulary,
    hazards,
    governedStandards: [],
    answeredClarifications: [],
    supplementaryContext: [],
    // Production establishes no life-criticality and no required actions, so Expert is shown none.
    findingMetadataByKey: {},
  } as unknown as HazLenzAnalysisState;
}


/**
 * Turn ONE provider result into ONE run record. Exported so the zero-call preflight exercises the
 * REAL derivation rather than a copy of it -- a preflight that tests a duplicate proves nothing
 * about the code that will actually spend money.
 *
 * A provider success carries RAW output, never a validated analysis. It MUST pass through the
 * production normalizer before anything is read from it; reading fields off `raw` directly is what
 * made §175 attempt 1 measure zero on every row and void the run.
 */
export function deriveRowRecord(
  res: any, input: any, row: { id: string; truthRequired: boolean }, t: any,
): any {
  const norm = res?.ok === true
    ? normalizeExpertOutput(res.raw, input, new Date().toISOString())
    : null;
  const analysis: any = norm?.state === 'VALID' ? norm.validated?.analysis : null;
  const clar = analysis?.decisionCriticalClarifications ?? [];
  return {
    rowId: row.id,
    truthRequired: row.truthRequired,
    ok: res?.ok === true,
    normalizationState: norm?.state ?? null,
    // A deliberate NOTHING_TO_ADD is different evidence from an ANALYZED carrying no
    // clarification, and collapsing them would hide which one the model actually chose.
    declaredOutcome: (res?.ok === true && (res.raw as any)?.outcome) || null,
    // A REJECTED normalization is a CONTRACT FAILURE. It is never silence: the model may have
    // asked a perfectly good question that the payload made unreadable.
    contractFailure: res?.ok !== true || norm?.state !== 'VALID',
    normalizationIssues: (norm?.issues ?? []).map((i: any) => (
      { code: i.code, collection: i.collection, index: i.index, detail: i.detail })),
    failureKind: res?.ok === true ? null : (res?.kind ?? 'UNKNOWN'),
    clarificationCount: clar.length,
    clarifications: clar.map((c: any) => ({
      clarificationId: c.clarificationId, question: c.question,
      whyItMatters: c.whyItMatters, evidenceGap: c.evidenceGap,
      affectedDecision: c.affectedDecision, criticality: c.criticality,
    })),
    candidateCount: analysis ? (analysis.expertHazardCandidates ?? []).length : null,
    // EVIDENCE PERSISTENCE. Attempt 1 spent ten calls and kept only derived counts, so when the
    // extraction turned out to be wrong the responses were unrecoverable. The raw payload is
    // carried on the record and written to disk BEFORE any figure is derived from it.
    rawProviderOutput: res?.ok === true ? res.raw : null,
    deterministicFindingCount: input.deterministicFindings.length,
    telemetry: t ? {
      latencyMs: t.latencyMs, promptTokens: t.promptTokens, outputTokens: t.outputTokens,
      respondedModel: t.respondedModel, httpStatus: t.httpStatus, stopReason: t.stopReason,
      computedCostUsd: t.computedCostUsd,
    } : null,
  };
}

async function main(): Promise<void> {
  const dry = process.argv.includes('--dry-run');
  mkdirSync(EVID, { recursive: true });
  const rows = loadFrozenRows();

  // ---- the uniform vocabulary, derived from production over the frozen texts
  const vocab = new Set<string>();
  for (const r of rows) {
    const d: any = decomposer.decompose(r.text, { location: null, task: null });
    for (const h of d.hazards ?? []) {
      const f = String(h.domainId ?? h.hazardFamily ?? '');
      if (f) vocab.add(f);
    }
  }
  const VOCABULARY = [...vocab].sort();

  const sample = buildExpertAnalysisInputFromAnalysis(analysisStateFor(rows[0], VOCABULARY));
  const identity = expertPromptIdentity(sample);

  const prereg = {
    artifact: 'SECTION_175_PRE_SPEND_PREREGISTRATION',
    writtenBeforeFirstProviderCall: true,
    '1_provider_model': {
      provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
      maxTokens: EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens,
      thinking: EXPERT_HOSTED_INFERENCE_CONFIG.thinking,
      inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
      outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
    },
    '2_prompt_identity': {
      promptVersion: identity.promptVersion,
      systemPromptSha256: identity.systemPromptSha256,
      systemPromptChars: EXPERT_SYSTEM_PROMPT.length,
    },
    '3_contract_schema': {
      analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
      inputContractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      validatorVersion: EXPERT_VALIDATOR_VERSION,
      wireSchemaSha256: identity.wireSchemaSha256,
    },
    '4_frozen_rows': rows.map(r => ({ id: r.id, textSha256: sha(r.text), truthRequired: r.truthRequired })),
    '5_execution_order': rows.map(r => r.id),
    '6_executions_per_row': 1,
    '7_scoring_rules': {
      SILENCE_PRECISION: 'EXACT AND MECHANICAL. Frozen truth owes nothing on a SILENCE row, so a row '
        + 'is correct iff ZERO clarifications were emitted. Any clarification there is unnecessary by '
        + 'definition. No semantic judgement, no authored target.',
      REQUIRED_RECALL_LOOSE: 'MECHANICAL UPPER BOUND. Correct iff at least one clarification was '
        + 'emitted. This does NOT establish that the question addressed the owed fact.',
      REQUIRED_RECALL_STRICT: 'NOT COMPUTED BY THIS SCRIPT. The frozen §174 record has '
        + 'MATERIAL_UNRESOLVED_FACTS = null on 10/10 rows, so no human-supplied target exists. Every '
        + 'emitted clarification is exported verbatim for human adjudication instead.',
      BALANCED_ACCURACY: 'Reported as a RANGE only: the lower bound assumes every REQUIRED emission '
        + 'missed its fact, the upper bound assumes every one hit. A point estimate is not available.',
      ROW_LEVEL_ACCURACY: 'Reported as the same range, for the same reason.',
    },
    '8_malformed_handling': 'A response failing contract validation is recorded as CONTRACT_FAILURE '
      + 'and scored as NO clarification emitted. It is never silently retried and never dropped.',
    '9_retry_policy': { retries: RETRIES, note: 'zero. A failed call is recorded as a failure.' },
    '10_provider_call_hard_cap': CALL_CEILING,
    '11_dollar_hard_cap_usd': SPEND_CEILING_USD,
    '12_interpretation_rules': {
      sharedAuthorship: 'Claude authored the rows; GPT-5.6 Sol reviewed before owner finalization; '
        + 'Expert HazLenz is Claude-family. A high score does NOT remove provenance uncertainty.',
      ifTenOfTen: 'PERFECT_DEVELOPMENT_CONCORDANCE — SHARED_MODEL_FAMILY_INSTRUMENT_CHALLENGE_REQUIRED. '
        + 'Do not declare validated. Do not discard the ten rows.',
      ifBelowTenOfTen: 'Each failure is initially MODEL_OR_CONTRACT_FAILURE_CANDIDATE. Do not blame '
        + 'the instrument without identifying a specific defect in the frozen wording.',
      allAskOrAllSilent: 'Neither may be described as successful balanced clarification behaviour.',
      truthIsNotRedefined: 'Frozen verdicts are never edited to agree with Expert.',
    },
    uniformInputDecision: {
      allowedHazardFamilies: VOCABULARY,
      derivation: 'union of families the real deterministic decomposer emits across the ten frozen '
        + 'observations; IDENTICAL for every row so it cannot separate the classes',
      whyThisIsSafe: 'clarifications are not family-gated — the hazardFamily enum constrains hazard '
        + 'CANDIDATES only — so the vocabulary cannot prevent Expert from asking about anything',
      jurisdiction: 'osha-general-industry',
      inspectionContext: 'location null, task null, for every row',
      governedStandards: 'none supplied, for every row',
    },
    knownInputAsymmetry: {
      observed: 'the deterministic decomposer emits a different number of findings per row',
      note: 'recorded BEFORE the run as a limitation on interpretation, not discovered afterwards',
    },
    provenanceLimitation: {
      AI_ASSISTED_HUMAN_VERDICT_GENERATION: true,
      FULLY_INDEPENDENT_HUMAN_ADJUDICATION: false,
      HUMAN_AI_AGREEMENT: '10 / 10',
      mustNotBeDescribedAs: 'independent human adjudication',
    },
  };

  const preregPath = join(EVID, 'PRE-SPEND-PREREGISTRATION-V14.json');
  if (existsSync(preregPath) && !dry) {
    const onDisk = shaFile(preregPath);
    const now = sha(JSON.stringify(prereg, null, 2) + '\n');
    if (onDisk !== now) throw new Error('ABORT: preregistration on disk differs from current identity');
  } else if (!dry) {
    writeFileSync(preregPath, JSON.stringify(prereg, null, 2) + '\n');
  }
  const preregHash = dry ? sha(JSON.stringify(prereg, null, 2) + '\n') : shaFile(preregPath);
  console.log(`PREREGISTRATION_SHA256 = ${preregHash}`);
  console.log(`model=${prereg['1_provider_model'].model}  promptSha=${identity.systemPromptSha256.slice(0, 16)}`);
  console.log(`vocabulary(${VOCABULARY.length}) = ${VOCABULARY.join(', ')}`);
  console.log(`worstCasePerCall=$${WORST_CASE_USD.toFixed(5)}  ceiling=$${SPEND_CEILING_USD}  calls<=${CALL_CEILING}\n`);

  if (dry) { console.log('DRY RUN — no provider call made, preregistration NOT consumed.'); return; }

  const provider = new AnthropicExpertProvider();
  const runFile = join(EVID, 'POST-REMEDIATION-RUN-RECORDS.jsonl');
  writeFileSync(runFile, '');
  let attempted = 0; let spent = 0; let stopReason: string | null = null;
  const results: any[] = [];

  for (const row of rows) {
    if (attempted + 1 > CALL_CEILING) { stopReason = 'CALL_CEILING_REACHED'; break; }
    if (spent + WORST_CASE_USD > SPEND_CEILING_USD + 1e-9) { stopReason = 'SPEND_CEILING_REACHED'; break; }

    const input = buildExpertAnalysisInputFromAnalysis(analysisStateFor(row, VOCABULARY));
    attempted += 1;
    const res: any = await provider.analyze(input);
    const t = provider.lastTelemetry;
    spent += t?.computedCostUsd ?? WORST_CASE_USD;

    const rec = deriveRowRecord(res, input, row, t);
    results.push(rec);

    appendFileSync(runFile, JSON.stringify(rec) + '\n');
    const fd = openSync(runFile, 'r+'); fsyncSync(fd); closeSync(fd);
    console.log(`${row.id}  truth=${row.truthRequired ? 'REQUIRED' : 'SILENCE '}  ok=${rec.ok}  `
      + `norm=${rec.normalizationState}  clarifications=${rec.clarificationCount}  cand=${rec.candidateCount}  `
      + `$${(t?.computedCostUsd ?? 0).toFixed(5)}`);
  }

  // Mid-run persistence proof: read back from disk, not from memory.
  const back = readFileSync(runFile, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));

  const req = results.filter(r => r.truthRequired);
  const sil = results.filter(r => !r.truthRequired);
  const silCorrect = sil.filter(r => !r.contractFailure && r.clarificationCount === 0).length;
  const reqLoose = req.filter(r => !r.contractFailure && r.clarificationCount > 0).length;

  const summary = {
    preregistrationSha256: preregHash,
    model: prereg['1_provider_model'].model,
    promptIdentity: identity,
    PROVIDER_INVOCATION_COUNT: attempted,
    TOTAL_ACTUAL_COST_USD: Number(spent.toFixed(5)),
    retries: 0,
    stopReason,
    rowsExecuted: results.length,
    recordsOnDisk: back.length,
    contractFailures: results.filter(r => r.contractFailure)
      .map(r => ({ rowId: r.rowId, kind: r.failureKind, normalizationState: r.normalizationState })),
    totalPromptTokens: results.reduce((a, r) => a + (r.telemetry?.promptTokens ?? 0), 0),
    totalOutputTokens: results.reduce((a, r) => a + (r.telemetry?.outputTokens ?? 0), 0),
    meanLatencyMs: Math.round(results.reduce((a, r) => a + (r.telemetry?.latencyMs ?? 0), 0) / Math.max(results.length, 1)),
    SILENCE_PRECISION: { correct: silCorrect, of: sil.length, exact: true },
    REQUIRED_RECALL_LOOSE: { emitted: reqLoose, of: req.length, isUpperBound: true },
    REQUIRED_RECALL_STRICT: 'PENDING_HUMAN_ADJUDICATION',
    rows: results.map(r => ({
      rowId: r.rowId, truth: r.truthRequired ? 'REQUIRED' : 'SILENCE',
      clarificationCount: r.clarificationCount, ok: r.ok,
      mechanicalOutcome: r.truthRequired
        ? (r.ok && r.normalizationState === 'VALID' && r.clarificationCount > 0
            ? 'EMITTED (loose pass, strict pending)' : 'NO CLARIFICATION (fail)')
        : (r.ok && r.normalizationState === 'VALID' && r.clarificationCount === 0
            ? 'SILENT (pass)' : 'EMITTED OR INVALID (fail)'),
    })),
  };
  writeFileSync(join(EVID, 'POST-REMEDIATION-RUN-SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');

  const packet = {
    artifact: 'SECTION_175_STRICT_ADJUDICATION_PACKET',
    purpose: 'For each REQUIRED row that emitted a clarification, a human decides whether the question '
      + 'addresses the material unresolved fact. This model did not decide it and must not.',
    rows: results.filter(r => r.truthRequired).map(r => ({
      rowId: r.rowId,
      observation: rows.find(x => x.id === r.rowId)!.text,
      emittedClarifications: r.clarifications,
      HUMAN_ADDRESSES_THE_OWED_FACT: null,
      HUMAN_RATIONALE: null,
    })),
    silenceFailures: results.filter(r => !r.truthRequired && r.clarificationCount > 0).map(r => ({
      rowId: r.rowId,
      observation: rows.find(x => x.id === r.rowId)!.text,
      unnecessaryQuestions: r.clarifications,
    })),
  };
  writeFileSync(join(EVID, 'POST-REMEDIATION-STRICT-ADJUDICATION-PACKET.json'), JSON.stringify(packet, null, 2) + '\n');

  console.log(`\nPROVIDER_INVOCATION_COUNT = ${attempted}   TOTAL_ACTUAL_COST_USD = $${spent.toFixed(5)}`);
  console.log(`SILENCE_PRECISION = ${silCorrect}/${sil.length} (exact)`);
  console.log(`REQUIRED_RECALL_LOOSE = ${reqLoose}/${req.length} (upper bound; strict pending human)`);
  console.log(`records on disk = ${back.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error(String(e?.message ?? e)); process.exit(1); });
}
