/**
 * §158 EXPERT HAZLENZ -- VC-04 MEASUREMENT REPAIR. ONE HOSTED CALL. INSTRUMENT REPAIR ONLY.
 *
 * ==================== WHAT THIS IS, AND WHAT IT IS NOT ====================
 *
 * §157 sent fifteen blinded cases under verifier instruction v2 at `max_tokens: 1600`. Fourteen
 * completed. VC-04 did not: the provider returned `stop_reason: "max_tokens"` at exactly 1600 output
 * tokens, having emitted `verdict`, `rationale`, `clarificationSourceMode: NOMINATED_FACT` and a
 * complete `nominatedFact` -- and NOT `proposedClarification`, which the v2 admission rule requires on
 * an ADD_OR_REPLACE verdict. The contract therefore refused the verdict whole
 * (`PROPOSAL_REQUIRED_FOR_THIS_VERDICT`).
 *
 * THAT REFUSAL IS CORRECT AND IS NOT THE DEFECT. The defect is that the harness truncated the
 * response before the model could finish emitting it, so §157 never measured whether bounded
 * nomination COMPLETES hosted. A destroyed output is not a measured failure.
 *
 * This file is therefore NOT:
 *   - a fresh evaluation;          - a verifier-v2 redesign;
 *   - a second attempt because the semantic answer was undesirable;
 *   - a first-pass rerun;          - expanded validation.
 *
 * ==================== THE ONLY PERMITTED CHANGE ====================
 *
 * `max_tokens`. Everything else -- the blinded VC-04 case bytes, the v2 system prompt, the v2 tool
 * schema, `tool_choice`, `thinking`, the model id, the endpoint, the contract, the truth manifest --
 * is reused unchanged, and gate F below PROVES it by hashing the §157 request body and this one with
 * `max_tokens` deleted from both. Those two hashes must be equal or nothing is spent.
 *
 * ==================== THE CEILING, AND WHERE THE NUMBER COMES FROM ====================
 *
 * Justified only from observed §156/§157 verifier outputs -- no round number picked for comfort:
 *
 *   §156 (v1, 15 calls)   largest completed output          835 tokens   (VC-04, ADD_OR_REPLACE)
 *   §157 (v2, 15 calls)   largest completed output        1,412 tokens   (VC-08, ADD_OR_REPLACE
 *                                                                        WITH a proposedClarification)
 *   §157 VC-04            truncation point                 1,600 tokens   (proposal never reached)
 *
 * VC-04 is the only observed case that must emit BOTH a full `nominatedFact` (nine proof fields) and
 * a `proposedClarification` (four fields), on top of adaptive thinking. 1,600 was insufficient by an
 * unknown margin, so the ceiling is set to the largest value the $0.05 hard ceiling admits:
 *
 *   input is byte-identical to §157's, which the provider metered at 4,598 tokens
 *   4,598 x $2.00/M = $0.009196          4,000 x $10.00/M = $0.040000        total $0.049196
 *
 * 4,000 is 2.50x the truncation point, 2.83x the largest completed v2 output, and 4.79x the largest
 * v1 output. Choosing the maximum the ceiling allows is deliberate: there is exactly one call and no
 * retry, so headroom is the only defence left against a second truncation.
 */

// Imports NOTHING from src/, exactly as the §157 probe does: no first-pass entry point is reachable
// from this file and no production module loads the credential as a side effect.
import 'dotenv/config';

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, chmodSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
  VERIFIER_V2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v2';
import {
  checkVerifierV2Output, EXPERT_VERIFIER_CONTRACT_V2_VERSION, EXPERT_AFFECTED_DECISIONS,
  VERIFIER_FORBIDDEN_FIELDS,
} from './lib/expert-verifier-contract-v2';
import { buildVerifierUserPrompt } from './lib/expert-verifier-instruction';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(ROOT, 'verification', 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-vc04-measurement-repair-2026-09-04');

const CASE_ID = 'VC-04';

const EXPECTED_PACKET_SHA =
  '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a';
const EXPECTED_TRUTH_SHA =
  'dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c';
const EXPECTED_INSTRUCTION_V2_SHA =
  'ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4';
const EXPECTED_PROMPT_MODULE_SHA =
  '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa';
const EXPECTED_V9_FILE_SHA =
  '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb';

/** The §157 execution parameters, restated so the diff below is against a literal, not a memory. */
const ORIGINAL = {
  maxTokens: 1600,
  observedInputTokens: 4598,
  observedOutputTokens: 1600,
  observedStopReason: 'max_tokens',
} as const;

const BUDGET = {
  maxProviderRequests: 1, retryBudget: 0, rerunBudget: 0, spendCeilingUsd: 0.05,
  maxTokensPerCall: 4000,
};
const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;

const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');
const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');

interface PacketCase {
  caseId: string; observation: string; jurisdiction: string; governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: {
    candidates: Array<{ candidateKey: string; hazardFamily: string;
      assertedConditionState: string; evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[]; summary: string;
  };
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>;
  triggerConditions: string[];
}

let passed = 0; let failed = 0;
const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
function check(id: string, ok: boolean, detail = ''): void {
  gate.push({ id, ok, detail });
  if (ok) { passed += 1; console.log(`ok    ${id}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  ' + detail : ''}`); }
}

/**
 * The request body, parameterised ONLY by the token ceiling.
 *
 * Byte-for-byte the §157 `callVerifier` body with `BUDGET.maxTokensPerCall` lifted into an argument.
 * Nothing else in this function may differ from that one, and gate F proves it did not.
 */
function buildBody(c: PacketCase, maxTokens: number): Record<string, unknown> {
  return {
    model: 'claude-sonnet-5',
    max_tokens: maxTokens,
    system: EXPERT_VERIFIER_V2_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifierUserPrompt(c) }],
    tools: [{
      name: 'emit_verifier_verdict',
      description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
      input_schema: VERIFIER_V2_RESPONSE_SCHEMA,
    }],
    tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    thinking: { type: 'adaptive' },
  };
}

/** Every top-level key whose serialised value differs between the two bodies. */
function differingKeys(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return keys.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

async function callOnce(body: Record<string, unknown>, apiKey: string) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey,
        'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const json = await response.json() as Record<string, any>;
    const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    if (!response.ok) {
      return { ok: false, raw: json, parsed: null,
        failureKind: response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR',
        inputTokens: null, outputTokens: null, latencyMs, httpStatus: response.status,
        modelIdentity: null, stopReason: null };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)
      ?.find(b => b.type === 'tool_use');
    if (!block) {
      return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL',
        inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
        latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
        stopReason: json.stop_reason ?? null };
    }
    return { ok: true, raw: block.input, parsed: block.input as Record<string, unknown>,
      failureKind: null, inputTokens: usage?.input_tokens ?? null,
      outputTokens: usage?.output_tokens ?? null, latencyMs, httpStatus: response.status,
      modelIdentity: json.model ?? null, stopReason: json.stop_reason ?? null };
  } catch (e) {
    return { ok: false, raw: { error: (e as Error).message }, parsed: null,
      failureKind: (e as Error).name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      inputTokens: null, outputTokens: null, latencyMs: Date.now() - started,
      httpStatus: null, modelIdentity: null, stopReason: null };
  } finally { clearTimeout(timer); }
}

async function main(): Promise<void> {
  const dryRun = process.env.PROBE_DRY_RUN === '1';
  console.log('§158 EXPERT HAZLENZ — VC-04 MEASUREMENT REPAIR (ONE CALL, TOKEN CEILING ONLY)');
  console.log('='.repeat(100));
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  // ---- A. The evaluation object is the §157 one, unchanged.
  const packetPath = join(SRC, 'VERIFIER-PACKET.json');
  const truthPath = join(SRC, 'TRUTH-MANIFEST.json');
  const packetSha = existsSync(packetPath) ? sha256File(packetPath) : '';
  const truthSha = existsSync(truthPath) ? sha256File(truthPath) : '';
  check('A.1 the §156 blinded packet is reused UNCHANGED — same bytes §157 sent',
    packetSha === EXPECTED_PACKET_SHA, `${packetSha.slice(0, 24)}…`);
  check('A.2 the §156 truth manifest is reused UNCHANGED — no verdict re-chosen for the repair',
    truthSha === EXPECTED_TRUTH_SHA, `${truthSha.slice(0, 24)}…`);
  const instructionSha = sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT);
  check('A.3 verifier instruction v2 is BYTE-IDENTICAL to the one §157 executed',
    instructionSha === EXPECTED_INSTRUCTION_V2_SHA, `${instructionSha.slice(0, 24)}…`);
  check('A.4 the "usually NO" nomination prior is preserved byte-for-byte — NOT the variable here',
    EXPERT_VERIFIER_V2_SYSTEM_PROMPT.includes(
      'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER'), 'present, unmodified');
  check('A.5 verifier contract v2 is the one under test',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION === 'hazlenz.expert.verifier.v2',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION);

  const packet = existsSync(packetPath)
    ? JSON.parse(readFileSync(packetPath, 'utf8')) as { cases: PacketCase[] } : { cases: [] };
  const c = packet.cases.find(x => x.caseId === CASE_ID);
  check('A.6 VC-04 is present in the packet and is the ONLY case sent',
    !!c && packet.cases.length === 15, `${packet.cases.length} in packet, 1 sent`);
  if (!c) { console.log('\nVC-04 absent. Nothing spent.'); process.exit(1); }

  // ---- B. The §157 execution is preserved, and its defect is the stated one.
  const v157ResultsPath = join(V157, 'VERIFIER-V2-RESULTS.json');
  const v157RecordsPath = join(V157, 'VERIFIER-V2-RUN-RECORDS.jsonl');
  check('B.1 the §157 run records are still present and will NOT be written by this file',
    existsSync(v157RecordsPath) && !v157RecordsPath.startsWith(OUT),
    `sha256 ${sha256File(v157RecordsPath).slice(0, 24)}…`);
  const v157 = JSON.parse(readFileSync(v157ResultsPath, 'utf8')) as {
    results: Array<Record<string, any>> };
  const orig = v157.results.find(r => r.caseId === CASE_ID)!;
  check('B.2 the §157 VC-04 execution truncated at the ceiling — the defect being repaired',
    orig.stopReason === ORIGINAL.observedStopReason
      && orig.outputTokens === ORIGINAL.observedOutputTokens,
    `stop_reason=${orig.stopReason} output_tokens=${orig.outputTokens} of max_tokens=1600`);
  check('B.3 the §157 VC-04 output was DESTROYED, not refused on its merits',
    orig.admissionAccepted === false
      && (orig.admissionDetail as string[]).includes('PROPOSAL_REQUIRED_FOR_THIS_VERDICT')
      && orig.proposedClarification === null && orig.nominatedFact !== null,
    'nominatedFact complete, proposedClarification never emitted');
  check('B.4 the repair writes to a DIFFERENT directory — no historical file is replaced',
    OUT !== V157 && OUT !== SRC, 'expert-hazlenz-vc04-measurement-repair-2026-09-04');

  // ---- C. Nothing on the first-pass side moved.
  check('C.1 the v13 first-pass prompt module is byte-identical',
    sha256File(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'))
      === EXPECTED_PROMPT_MODULE_SHA, 'unchanged');
  check('C.2 the hardened v9 fixture is byte-identical',
    sha256File(join(ROOT,
      'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
      === EXPECTED_V9_FILE_SHA, 'unchanged');
  check('C.3 v14 and v15 do not exist',
    !existsSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt-v14.ts'))
      && !existsSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt-v15.ts')),
    'absent');
  const ownImports = readFileSync(__filename, 'utf8').split('\n').filter(l => /^import /.test(l));
  check('C.4 this file imports NOTHING from src/ — no first-pass entry point is reachable',
    ownImports.filter(l => /from '\.\.\/src\//.test(l)).length === 0,
    `${ownImports.length} imports, 0 from src/`);
  check('C.5 the frozen formal count is intact', FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195,
    '195, immutable');

  // ---- F. THE ONLY-CHANGE PROOF. Two bodies, one differing key.
  const originalBody = buildBody(c, ORIGINAL.maxTokens);
  const repairBody = buildBody(c, BUDGET.maxTokensPerCall);
  const stripped = (b: Record<string, unknown>): string => {
    const { max_tokens: _drop, ...rest } = b;
    return JSON.stringify(rest);
  };
  const strippedOriginalSha = sha256(stripped(originalBody));
  const strippedRepairSha = sha256(stripped(repairBody));
  const diff = differingKeys(originalBody, repairBody);
  check('F.1 with max_tokens removed the two request bodies are the SAME BYTES',
    strippedOriginalSha === strippedRepairSha, `sha256 ${strippedOriginalSha.slice(0, 32)}…`);
  check('F.2 exactly one top-level key differs, and it is max_tokens',
    diff.length === 1 && diff[0] === 'max_tokens',
    `[${diff.join(', ')}]  ${ORIGINAL.maxTokens} -> ${BUDGET.maxTokensPerCall}`);
  check('F.3 model, tool schema, tool_choice, thinking and system are untouched',
    repairBody.model === 'claude-sonnet-5'
      && JSON.stringify(repairBody.tools) === JSON.stringify(originalBody.tools)
      && JSON.stringify(repairBody.tool_choice) === JSON.stringify(originalBody.tool_choice)
      && JSON.stringify(repairBody.thinking) === JSON.stringify(originalBody.thinking)
      && repairBody.system === originalBody.system,
    'identical');
  check('F.4 no sampling control is introduced that §157 did not send',
    !('temperature' in repairBody) && !('top_p' in repairBody) && !('top_k' in repairBody)
      && !('temperature' in originalBody), 'none present in either body');

  // ---- E. The budget.
  const worst = (ORIGINAL.observedInputTokens * PRICE_IN_PER_M
    + BUDGET.maxTokensPerCall * PRICE_OUT_PER_M) / 1e6;
  check('E.1 exactly one request, zero retries, zero reruns',
    BUDGET.maxProviderRequests === 1 && BUDGET.retryBudget === 0 && BUDGET.rerunBudget === 0,
    'no retry path exists in this file');
  check('E.2 the ceiling is justified from observed outputs and fits $0.05',
    worst <= BUDGET.spendCeilingUsd,
    `4000 = 2.50x the 1600 truncation, 2.83x the 1412 largest completed v2 output, `
    + `4.79x the 835 largest v1 output; worst case $${worst.toFixed(6)} of $0.05`);
  check('E.3 an API credential is present',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');
  const storePath = join(OUT, 'VC04-REPAIR-RUN-RECORD.jsonl');
  check('E.4 the repair store is empty or absent',
    !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');

  console.log(`\n  PRE-SPEND GATE: ${passed}/${passed + failed} `
    + `${failed === 0 ? 'PASS' : 'FAIL'}. $0.00 spent so far.`);
  if (failed > 0) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'VC04_MEASUREMENT_REPAIR_BLOCKED — PRESPEND_GATE_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  if (dryRun) { console.log('\nPROBE_DRY_RUN=1 — stopping before the provider request.'); return; }

  // ---- SPEND. One request.
  console.log('\n--- SPEND. One request. No retry path exists in this file.\n');
  mkdirSync(OUT, { recursive: true });
  const startedAt = new Date().toISOString();
  const r = await callOnce(repairBody, process.env.ANTHROPIC_API_KEY as string);
  const finishedAt = new Date().toISOString();
  const cost = ((r.inputTokens ?? 0) * PRICE_IN_PER_M
    + (r.outputTokens ?? 0) * PRICE_OUT_PER_M) / 1e6;

  const admission = r.parsed
    ? checkVerifierV2Output({ ...r.parsed,
      verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V2_VERSION, analysisId: c.caseId },
    { analysisId: c.caseId, observation: c.observation,
      suppliedFacts: c.unresolvedFacts.map(f => ({ ref: f.ref, text: f.text })) })
    : { admitted: false, codes: [], nominationAdmitted: false, detail: ['NO_PARSED_OUTPUT'] };

  const proposed = r.parsed?.proposedClarification as Record<string, unknown> | null | undefined;
  const nominated = r.parsed?.nominatedFact as Record<string, unknown> | null | undefined;
  const degen = detectDegenerateOutput({
    rowId: c.caseId, candidates: [],
    clarifications: proposed ? [{ clarificationId: 'proposed', question: proposed.question,
      whyItMatters: proposed.whyItMatters, evidenceGap: proposed.evidenceGap }] : [],
    summary: r.parsed?.rationale,
  });

  const record = {
    execution: 'REPAIRED', supersedes: null,
    caseId: c.caseId, ok: r.ok, failureKind: r.failureKind, httpStatus: r.httpStatus,
    modelIdentity: r.modelIdentity, stopReason: r.stopReason,
    maxTokens: BUDGET.maxTokensPerCall,
    inputTokens: r.inputTokens, outputTokens: r.outputTokens, latencyMs: r.latencyMs,
    costUsd: Number(cost.toFixed(6)),
    verdict: (r.parsed?.verdict as string) ?? null,
    clarificationSourceMode: (r.parsed?.clarificationSourceMode as string) ?? null,
    rationale: (r.parsed?.rationale as string) ?? null,
    aboutUnresolvedFactRef: (r.parsed?.aboutUnresolvedFactRef as string) ?? null,
    proposedClarification: proposed ?? null,
    nominatedFact: nominated ?? null,
    admissionAccepted: admission.admitted,
    nominationAdmitted: admission.nominationAdmitted,
    admissionCodes: admission.codes, admissionDetail: admission.detail,
    degenerate: degen.DEGENERATE_PROVIDER_OUTPUT, degenerateSignals: degen.signals,
    rawResponse: r.raw,
  };
  appendFileSync(storePath, `${JSON.stringify(record)}\n`);

  console.log(`  ${c.caseId}  ${String(record.verdict ?? r.failureKind).padEnd(32)}`
    + `${String(r.inputTokens ?? '?').padStart(6)} in ${String(r.outputTokens ?? '?').padStart(5)} out`
    + `  stop=${r.stopReason}  ${String(r.latencyMs).padStart(6)}ms  $${cost.toFixed(5)}`);

  // ---- PART A SCORING. Eight questions, answered from the record, plus the reproduction check.
  console.log('\n--- PART A SCORING — the repaired VC-04 execution, reported independently\n');
  const truth = (JSON.parse(readFileSync(truthPath, 'utf8')) as {
    entries: Array<Record<string, any>> }).entries.find(e => e.caseId === CASE_ID)!;
  const suppliedTexts = c.unresolvedFacts.map(f => f.text);
  const n = nominated as Record<string, string> | null | undefined;
  const selectorReached = (q: string, sets: string[][] | null): boolean =>
    !!sets && sets.some(set => set.every(k => q.toLowerCase().includes(k)));

  const q: Array<{ id: string; answer: string; detail: string }> = [];
  const ask = (id: string, answer: boolean | string, detail: string) =>
    q.push({ id, answer: typeof answer === 'string' ? answer : (answer ? 'YES' : 'NO'), detail });

  ask('1. nominated a previously unsupplied fact',
    !!n && record.clarificationSourceMode === 'NOMINATED_FACT'
      && !admission.codes.includes('NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT'),
    n ? `"${n.missingFact}"` : 'no nomination present');
  ask('2. the fact is inside observation/evidence bounds',
    !!n && c.observation.includes((n.observationSpan ?? '').trim()),
    n ? `observationSpan verbatim in the observation: ${
      c.observation.includes((n.observationSpan ?? '').trim())}` : 'n/a');
  ask('3. both counterfactual branches supplied',
    !!n && !!n.branchA?.trim() && !!n.branchB?.trim(),
    n ? `A: ${(n.branchA ?? '').slice(0, 60)}… | B: ${(n.branchB ?? '').slice(0, 60)}…` : 'n/a');
  ask('4. the decisions genuinely diverge under the existing authored truth',
    !!n && !!n.decisionIfA?.trim() && !!n.decisionIfB?.trim()
      && n.decisionIfA.trim() !== n.decisionIfB.trim()
      && !admission.codes.includes('DECISIONS_DO_NOT_DIVERGE'),
    truth.whyDecisionCritical
      ? `authored truth holds the same divergence: "${
        String(truth.whyDecisionCritical).slice(0, 110)}…"` : 'no authored divergence recorded');
  ask('5. affectedDecision is valid',
    !!n && (EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(n.affectedDecision),
    n ? `${n.affectedDecision} (authored truth: ${truth.affectedDecision})` : 'n/a');
  ask('6. proposedClarification is present',
    !!proposed,
    proposed ? `"${String(proposed.question)}" [${String(proposed.affectedDecision)}]`
      : 'ABSENT — the §157 truncation condition reproduced');
  ask('7. the contract accepted the result', admission.admitted,
    admission.admitted ? 'admitted whole'
      : `codes [${admission.codes.join(', ')}] detail [${admission.detail.join(', ')}]`);
  const forbiddenPresent = r.parsed
    ? VERIFIER_FORBIDDEN_FIELDS.filter(f => f in (r.parsed as Record<string, unknown>)) : [];
  ask('8. any forbidden field changed', forbiddenPresent.length === 0 ? 'NO' : 'YES',
    forbiddenPresent.length === 0
      ? `none of ${VERIFIER_FORBIDDEN_FIELDS.length} forbidden fields present`
      : forbiddenPresent.join(', '));

  for (const x of q) console.log(`  ${x.id.padEnd(58)} ${x.answer.padEnd(4)} ${x.detail}`);

  // Reproduction of the truncated nomination, field by field.
  const origNom = orig.nominatedFact as Record<string, string> | null;
  const nomFields = ['missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
    'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow'] as const;
  const identical = origNom && n ? nomFields.filter(f => origNom[f] === n[f]) : [];
  const changed = origNom && n ? nomFields.filter(f => origNom[f] !== n[f]) : [];
  console.log('\n--- REPRODUCTION OF THE TRUNCATED NOMINATION\n');
  console.log(`  verdict            ${orig.verdict} -> ${record.verdict}`);
  console.log(`  sourceMode         ${orig.clarificationSourceMode} -> ${record.clarificationSourceMode}`);
  console.log(`  nomination fields identical to the truncated one: ${identical.length}/9`);
  if (changed.length) console.log(`  differing fields: ${changed.join(', ')}`);
  const selOk = proposed ? selectorReached(String(proposed.question), truth.selectorKeywordSets)
    : null;
  console.log(`  proposed question reaches the authored owed fact: ${
    selOk === null ? 'NO PROPOSAL EMITTED' : selOk ? 'YES' : 'NO'}`);
  console.log(`    authored owed fact: ${truth.missingFact}`);

  const mechanismDemonstrated = record.ok && !!n && !!proposed && admission.admitted
    && admission.nominationAdmitted && record.stopReason !== 'max_tokens';
  console.log(`\n  VC04_BOUNDED_NOMINATION_MECHANISM_HOSTED_DEMONSTRATED = ${
    mechanismDemonstrated ? 'TRUE' : 'FALSE'}`);
  console.log('  This proves ONLY that the bounded nomination mechanism can operate hosted.');
  console.log('  The verifier architecture is NOT upgraded to PROVEN by this result.');

  const summary = {
    operation: '§158 VC-04 measurement repair — instrument repair only, one hosted call',
    startedAt, finishedAt,
    whatWasRepaired: 'the §157 harness truncated VC-04 at max_tokens=1600 before the model emitted '
      + 'proposedClarification; the contract then refused a destroyed output. This rerun changes the '
      + 'output-token ceiling and nothing else.',
    onlyChangeProof: {
      differingTopLevelKeys: diff,
      originalMaxTokens: ORIGINAL.maxTokens, repairMaxTokens: BUDGET.maxTokensPerCall,
      requestBodySha256WithMaxTokensRemoved_original: strippedOriginalSha,
      requestBodySha256WithMaxTokensRemoved_repair: strippedRepairSha,
      identical: strippedOriginalSha === strippedRepairSha,
      observedInputTokensOriginal: ORIGINAL.observedInputTokens,
      observedInputTokensRepair: r.inputTokens,
      inputTokensMatch: r.inputTokens === ORIGINAL.observedInputTokens,
    },
    ceilingJustification: {
      largestCompletedV1Output: 835, largestCompletedV2Output: 1412,
      truncationPoint: 1600, chosenCeiling: BUDGET.maxTokensPerCall,
      multipleOfTruncationPoint: BUDGET.maxTokensPerCall / 1600,
      worstCaseUsd: Number(worst.toFixed(6)), hardCeilingUsd: BUDGET.spendCeilingUsd,
    },
    identity: {
      provider: 'anthropic', model: 'claude-sonnet-5',
      verifierContract: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
      verifierInstruction: EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
      verifierInstructionSha256: instructionSha,
      packetSha256: packetSha, truthManifestSha256: truthSha,
    },
    accounting: {
      logicalCalls: 1, providerRequests: 1, retries: 0, reruns: 0,
      inputTokens: r.inputTokens, outputTokens: r.outputTokens,
      spendUsd: Number(cost.toFixed(6)), spendCeilingUsd: BUDGET.spendCeilingUsd,
    },
    firstPassInvocations: 0,
    partAScoring: q,
    reproduction: {
      nominationFieldsIdentical: identical.length, nominationFieldsTotal: nomFields.length,
      differingFields: changed,
      proposedQuestionReachesAuthoredOwedFact: selOk,
      authoredOwedFact: truth.missingFact,
      authoredAcceptableSelectors: truth.acceptableSelectors,
    },
    VC04_BOUNDED_NOMINATION_MECHANISM_HOSTED_DEMONSTRATED: mechanismDemonstrated,
    ARCHITECTURE_STATUS: 'NOT_UPGRADED — this is a mechanism demonstration on one case, not '
      + 'architecture proof. §157 gate figures are NOT restated as PROVEN.',
    TRUTH_AUTHORITY_CAVEAT: 'Scored against a standard authored by the model family being graded, '
      + 'not independently reviewed. DEVELOPMENT EVIDENCE, NOT ACCEPTANCE EVIDENCE.',
    originalExecutionPreservedAt:
      'verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RUN-RECORDS.jsonl',
    originalExecution: orig,
    repairedExecution: record,
  };
  writeFileSync(join(OUT, 'VC04-REPAIR-RESULT.json'), `${JSON.stringify(summary, null, 2)}\n`);
  try { chmodSync(storePath, 0o444); } catch { /* platform may refuse */ }

  console.log(`\n  requests 1/${BUDGET.maxProviderRequests}   retries 0   reruns 0`);
  console.log(`  tokens ${r.inputTokens} in / ${r.outputTokens} out   `
    + `spend $${cost.toFixed(6)} of $${BUDGET.spendCeilingUsd.toFixed(2)}`);
  console.log('  FIRST_PASS_EXPERT_INVOCATIONS = 0');
  console.log('\n  -> VC04-REPAIR-RESULT.json');
}

main().catch(e => { console.error(e); process.exit(1); });
