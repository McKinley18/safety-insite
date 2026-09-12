/**
 * §163 EXPERT HAZLENZ -- VERIFIER-v2 PER-DRAW RELIABILITY. BOUNDED HOSTED MEASUREMENT.
 *
 * ==================== WHAT THIS MEASURES, AND WHY IT IS NOT §157/§158 AGAIN ====================
 *
 * §157 and §158 disagreed on byte-identical VC-04 input, but the §157 draw was contract-invalid
 * because a 1600-token ceiling truncated it. So the instability observation carried a confound: the
 * two draws differed in EXECUTION VALIDITY as well as in content.
 *
 * This operation removes that confound by running every draw under the SAME adequate ceiling, so
 * every draw is eligible to complete. Ten draws each on the only two rows human review left
 * authoritative -- HS-A1 (VC-08) and HS-E1 (VC-04).
 *
 * ==================== WHY max_tokens IS 4000 AND NOT LOWER ====================
 *
 * A lower ceiling could be argued non-binding: the largest completed verifier-v2 output ever observed
 * is 1412 tokens. But 4000 is the ceiling §158 used, and holding it makes THE HS-E1 REQUEST BYTES
 * IDENTICAL TO §158's. That turns §158 into an eleventh draw of the same configuration and lets the
 * new draws be compared to it directly instead of across a changed parameter. Removing the confound
 * is the whole point of the operation, so the ceiling stays where §158 put it.
 *
 * Worst case at 4000: (4598*2 + 40000)/1e6 * 10 + (5234*2 + 40000)/1e6 * 10 = $0.99664, inside the
 * $1.00 cap. A running spend guard stops the loop before the cap regardless.
 *
 * ==================== BLINDING ====================
 *
 * The hosted verifier receives exactly the blinded packet case it received historically. Row ids,
 * REQUIRED labels, authored truth, human dispositions, expected selectors, historical outcomes, draw
 * labels and section references are all absent from the request, and gate B below greps the
 * serialised body to prove it rather than asserting it.
 *
 * ==================== SCORING ====================
 *
 * No model grades anything. Classification traces to the frozen §162 human-reviewed targets, which
 * are imported rather than retyped and are proven identical to the §162 record before any spend.
 */

// Imports NOTHING from src/: no first-pass entry point is reachable and no production module loads
// the credential as a side effect.
import 'dotenv/config';

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, chmodSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
  VERIFIER_V2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v2';
import {
  checkVerifierV2Output, EXPERT_VERIFIER_CONTRACT_V2_VERSION, VERIFIER_FORBIDDEN_FIELDS,
} from './lib/expert-verifier-contract-v2';
import { buildVerifierUserPrompt } from './lib/expert-verifier-instruction';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';
import {
  HUMAN_SEMANTIC_TARGETS, HUMAN_SEMANTIC_TARGETS_VERSION, semanticCueMatch,
  assertCuesNotSatisfiedByObservation, assertTargetsMatchSection162,
} from './lib/expert-human-semantic-targets-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V162 = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04');

/** The two rows human review left authoritative, and the blinded case each maps to. */
const CASES: Array<{ rowId: string; caseId: string }> = [
  { rowId: 'HS-A1', caseId: 'VC-08' },
  { rowId: 'HS-E1', caseId: 'VC-04' },
];
const DRAWS_PER_CASE = 10;

const EXPECTED_PACKET_SHA =
  '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a';
const EXPECTED_INSTRUCTION_V2_SHA =
  'ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4';
const EXPECTED_PROMPT_MODULE_SHA =
  '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa';
const EXPECTED_V9_FILE_SHA =
  '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb';
/** §158's observed input-token counts. Identical bytes must meter identically. */
const EXPECTED_INPUT_TOKENS: Record<string, number> = { 'VC-04': 4598, 'VC-08': 5234 };

const BUDGET = {
  maxProviderRequests: DRAWS_PER_CASE * CASES.length,
  retryBudget: 0, rerunBudget: 0, replacementBudget: 0,
  spendCeilingUsd: 1.00, maxTokensPerCall: 4000,
};
const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;
const MODEL = 'claude-sonnet-5';

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');

let passed = 0; let failed = 0;
const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
function check(id: string, ok: boolean, detail = ''): void {
  gate.push({ id, ok, detail });
  if (ok) { passed += 1; console.log(`ok    ${id}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  ' + detail : ''}`); }
}

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

/** Byte-identical to the §158 body builder. Only the case varies between the two cases. */
function buildBody(c: PacketCase): Record<string, unknown> {
  return {
    model: MODEL,
    max_tokens: BUDGET.maxTokensPerCall,
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
  console.log('§163 VERIFIER-v2 PER-DRAW RELIABILITY — BOUNDED_DEVELOPMENT_RELIABILITY_SAMPLE');
  console.log('='.repeat(100));
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  // ---- A. Frozen material.
  const packetPath = join(SRC, 'VERIFIER-PACKET.json');
  const packetSha = existsSync(packetPath) ? sha256File(packetPath) : '';
  check('A.1 the §156 blinded packet is reused UNCHANGED', packetSha === EXPECTED_PACKET_SHA,
    `${packetSha.slice(0, 24)}…`);
  const instructionSha = sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT);
  check('A.2 verifier instruction v2 is BYTE-IDENTICAL — no prompt experiment in this operation',
    instructionSha === EXPECTED_INSTRUCTION_V2_SHA, `${instructionSha.slice(0, 24)}…`);
  check('A.3 the "usually NO" nomination prior is preserved byte-for-byte',
    EXPERT_VERIFIER_V2_SYSTEM_PROMPT.includes(
      'THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER'), 'unmodified');
  check('A.4 verifier contract v2 is the one under test',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION === 'hazlenz.expert.verifier.v2',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION);
  check('A.5 the v13 first-pass prompt module is byte-identical',
    sha256File(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts'))
      === EXPECTED_PROMPT_MODULE_SHA, 'unchanged');
  check('A.6 the hardened v9 fixture is byte-identical',
    sha256File(join(ROOT,
      'backend/src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
      === EXPECTED_V9_FILE_SHA, 'unchanged');

  const packet = JSON.parse(readFileSync(packetPath, 'utf8')) as { cases: PacketCase[] };
  const cases = CASES.map(c => ({ ...c, pc: packet.cases.find(x => x.caseId === c.caseId)! }));
  check('A.7 both authoritative cases are present', cases.every(c => !!c.pc),
    cases.map(c => `${c.rowId}/${c.caseId}`).join(', '));

  // ---- B. Blinding. Scoped deliberately, because a crude grep over the whole body flags the
  // ---- CONTRACT's own vocabulary. The verdict enum and the word REQUIRED appear in the system
  // ---- prompt and the response schema BY DESIGN -- the verifier cannot choose a verdict it has
  // ---- not been shown. Those are not leaks of this evaluation's truth. So:
  // ----   * the WHOLE body is checked for evaluation-truth artefacts (row ids, dispositions,
  // ----     section refs, authored selectors, the human targets, draw labels);
  // ----   * the USER MESSAGE, which carries the case payload, is checked additionally for the
  // ----     fixture labels and historical outcomes that must never reach the provider.
  // ---- The blinded case id (VC-08 / VC-04) IS present in the user message. That is intentional and
  // ---- historical: it is the anonymised handle the packet was built around, it encodes no row
  // ---- identity or truth, and removing it would change the bytes and destroy comparability
  // ---- with §158.
  const bodies = cases.map(c => ({ ...c, body: buildBody(c.pc) }));
  const wholeBodyLeaks: Array<[string, RegExp]> = [
    ['row id', /HS-[A-Z]\d/], ['disposition', /AUTHORING_(VALID|AMBIGUOUS|INVALID)/],
    ['section ref', /§1\d\d/], ['authored selector list', /acceptableSelectors/],
    ['human semantic target', /flame-failure safeguard|rotor-guard interlock protective/],
    ['authored counterfactual', /answerA|answerB|outcomeA|outcomeB/],
    ['human review vocabulary', /human-reviewed|AUTHORING_|ELIGIBLE|INELIGIBLE/],
  ];
  const userMessageLeaks: Array<[string, RegExp]> = [
    ['REQUIRED/FORBIDDEN fixture label', /\b(REQUIRED|FORBIDDEN)\b/],
    ['historical verdict', /VERIFIED_AS_IS|NO_CLARIFICATION_REQUIRED|ADD_OR_REPLACE/],
    ['draw label', /\bR[123]\b/], ['fixture form', /NOT_VISIBLE|PRIOR_EVENT|WORST_CASE/],
  ];
  for (const b of bodies) {
    const whole = JSON.stringify(b.body);
    const userMsg = String((b.body.messages as Array<Record<string, string>>)[0].content);
    const l1 = wholeBodyLeaks.filter(([, re]) => re.test(whole)).map(([n]) => n);
    const l2 = userMessageLeaks.filter(([, re]) => re.test(userMsg)).map(([n]) => n);
    check(`B.${b.caseId} no evaluation-truth artefact anywhere in the request`,
      l1.length === 0, l1.length ? `LEAKS: ${l1.join(', ')}` : `${wholeBodyLeaks.length} patterns, 0 matches`);
    check(`B.${b.caseId} no fixture label, historical verdict or draw label in the case payload`,
      l2.length === 0, l2.length ? `LEAKS: ${l2.join(', ')}` : `${userMessageLeaks.length} patterns, 0 matches`);
  }
  check('B.0 the contract vocabulary present in the system prompt and schema is BY DESIGN',
    /VERIFIED_AS_IS/.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT)
      && !/VERIFIED_AS_IS/.test(String((bodies[0].body.messages as Array<Record<string, string>>)[0]
        .content)),
    'the verdict enum is in the instruction, never in the case payload');

  // ---- C. Semantic request identity, frozen and hashed BEFORE spend.
  const frozen = bodies.map(b => ({ rowId: b.rowId, caseId: b.caseId,
    semanticRequestSha256: sha256(JSON.stringify(b.body)) }));
  check('C.1 each case has ONE frozen semantic request hash, reused for all of its draws',
    new Set(frozen.map(f => f.semanticRequestSha256)).size === CASES.length,
    frozen.map(f => `${f.caseId} ${f.semanticRequestSha256.slice(0, 16)}…`).join('  '));
  check('C.2 the two cases differ from each other',
    frozen[0].semanticRequestSha256 !== frozen[1].semanticRequestSha256, 'distinct');
  check('C.3 max_tokens is 4000 — the §158 ceiling, so HS-E1 draws are byte-identical to §158',
    BUDGET.maxTokensPerCall === 4000, 'not 1600; comparable to §158 without a changed parameter');
  // POSITIVE identity proof, stronger than any grep: the HS-E1 body must be the §158 body.
  const s158 = JSON.parse(readFileSync(
    join(V, 'expert-hazlenz-vc04-measurement-repair-2026-09-04', 'VC04-REPAIR-RESULT.json'), 'utf8'));
  const stripMaxTokens = (b: Record<string, unknown>): string => {
    const { max_tokens: _drop, ...rest } = b; return JSON.stringify(rest);
  };
  const vc04Body = bodies.find(b => b.caseId === 'VC-04')!.body;
  check('C.5 the HS-E1 request is BYTE-IDENTICAL to the §158 request — the truncation confound is '
    + 'removed by construction, not by assertion',
  sha256(stripMaxTokens(vc04Body))
      === s158.onlyChangeProof.requestBodySha256WithMaxTokensRemoved_repair
      && BUDGET.maxTokensPerCall === s158.onlyChangeProof.repairMaxTokens,
  `sha256 ${sha256(stripMaxTokens(vc04Body)).slice(0, 32)}… and max_tokens `
    + `${s158.onlyChangeProof.repairMaxTokens} both match §158`);
  check('C.4 no sampling control and no determinism control is introduced',
    bodies.every(b => !('temperature' in b.body) && !('top_p' in b.body)
      && !('top_k' in b.body) && !('seed' in b.body)), 'none present');

  // ---- D. Truth cannot drift, and cannot repeat the retired scorer's defect.
  let truthOk = true; let truthDetail = '';
  try {
    const s162 = JSON.parse(readFileSync(join(V162, 'HUMAN-SEMANTIC-REDERIVATION.json'), 'utf8'))
      .humanSemanticTargets;
    assertTargetsMatchSection162(s162);
    assertCuesNotSatisfiedByObservation(
      Object.fromEntries(cases.map(c => [c.rowId, c.pc.observation])));
    truthDetail = `${HUMAN_SEMANTIC_TARGETS_VERSION}; deep-equal to §162; cues not satisfied by `
      + 'either observation';
  } catch (e) { truthOk = false; truthDetail = (e as Error).message; }
  check('D.1 frozen human targets match §162 AND their cues are not satisfied by the observations',
    truthOk, truthDetail);
  check('D.2 truth is not broadened — the two authoritative rows and no others',
    Object.keys(HUMAN_SEMANTIC_TARGETS).length === 2
      && CASES.every(c => c.rowId in HUMAN_SEMANTIC_TARGETS), 'HS-A1, HS-E1');

  // ---- E. Containment and budget.
  const ownImports = readFileSync(__filename, 'utf8').split('\n').filter(l => /^import /.test(l));
  check('E.1 this probe imports NOTHING from src/ — no first-pass entry point is reachable',
    ownImports.filter(l => /from '\.\.\/src\//.test(l)).length === 0,
    `${ownImports.length} imports, 0 from src/`);
  check('E.2 the frozen formal count is intact', FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195,
    '195, immutable');
  const worst = cases.reduce((t, c) =>
    t + DRAWS_PER_CASE * ((EXPECTED_INPUT_TOKENS[c.caseId] * PRICE_IN_PER_M)
      + (BUDGET.maxTokensPerCall * PRICE_OUT_PER_M)) / 1e6, 0);
  check('E.3 20 requests, zero retries, zero reruns, zero replacements',
    BUDGET.maxProviderRequests === 20 && BUDGET.retryBudget === 0
      && BUDGET.rerunBudget === 0 && BUDGET.replacementBudget === 0, 'no retry path exists');
  check('E.4 worst-case spend is inside the $1.00 cap', worst <= BUDGET.spendCeilingUsd,
    `worst case $${worst.toFixed(5)} of $${BUDGET.spendCeilingUsd.toFixed(2)}; `
    + `expected ~$0.48 at the observed 1412-token maximum`);
  check('E.5 an API credential is present',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');
  const storePath = join(OUT, 'DRAW-RUN-RECORDS.jsonl');
  check('E.6 the store is empty or absent',
    !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');

  console.log(`\n  PRE-SPEND GATE: ${passed}/${passed + failed} `
    + `${failed === 0 ? 'PASS' : 'FAIL'}. $0.00 spent so far.`);
  if (failed > 0) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'VERIFIER_DRAW_RELIABILITY_BLOCKED — PRESPEND_GATE_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'FROZEN-REQUESTS.json'), `${JSON.stringify({
    frozenAt: new Date().toISOString(),
    model: MODEL, maxTokens: BUDGET.maxTokensPerCall,
    verifierInstruction: EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
    verifierInstructionSha256: instructionSha,
    verifierContract: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
    packetSha256: packetSha,
    humanSemanticTargetsVersion: HUMAN_SEMANTIC_TARGETS_VERSION,
    requests: frozen,
    note: 'every draw of a case re-sends these exact bytes; identity is re-asserted per draw',
  }, null, 2)}\n`);
  if (dryRun) { console.log('\nPROBE_DRY_RUN=1 — stopping before any provider request.'); return; }

  // ================================================================ SPEND
  console.log('\n--- SPEND. 20 independent draws. No retries. No replacements.\n');
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  const records: Array<Record<string, unknown>> = [];
  let spend = 0; let requests = 0;
  const startedAt = new Date().toISOString();
  let stopped: string | null = null;

  for (const b of bodies) {
    const frozenSha = frozen.find(f => f.caseId === b.caseId)!.semanticRequestSha256;
    for (let draw = 1; draw <= DRAWS_PER_CASE; draw += 1) {
      // Per-draw identity re-assertion: the bytes must not have moved between draws.
      const nowSha = sha256(JSON.stringify(b.body));
      if (nowSha !== frozenSha) { stopped = `REQUEST_BYTES_CHANGED on ${b.caseId} draw ${draw}`; break; }
      const projected = spend
        + ((EXPECTED_INPUT_TOKENS[b.caseId] * PRICE_IN_PER_M)
          + (BUDGET.maxTokensPerCall * PRICE_OUT_PER_M)) / 1e6;
      if (projected > BUDGET.spendCeilingUsd) { stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; break; }
      if (requests >= BUDGET.maxProviderRequests) { stopped = 'REQUEST_CAP_REACHED'; break; }

      const r = await callOnce(b.body, apiKey);
      requests += 1;
      const cost = ((r.inputTokens ?? 0) * PRICE_IN_PER_M
        + (r.outputTokens ?? 0) * PRICE_OUT_PER_M) / 1e6;
      spend += cost;

      if (r.ok && r.modelIdentity !== MODEL) { stopped = `MODEL_IDENTITY_CHANGED: ${r.modelIdentity}`; }

      const admission = r.parsed
        ? checkVerifierV2Output({ ...r.parsed,
          verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V2_VERSION, analysisId: b.caseId },
        { analysisId: b.caseId, observation: b.pc.observation,
          suppliedFacts: b.pc.unresolvedFacts.map(f => ({ ref: f.ref, text: f.text })) })
        : { admitted: false, codes: [], nominationAdmitted: false, detail: ['NO_PARSED_OUTPUT'] };
      const proposed = r.parsed?.proposedClarification as Record<string, any> | null | undefined;
      const nominated = r.parsed?.nominatedFact as Record<string, any> | null | undefined;
      const degen = detectDegenerateOutput({
        rowId: b.caseId, candidates: [],
        clarifications: proposed ? [{ clarificationId: 'proposed', question: proposed.question,
          whyItMatters: proposed.whyItMatters, evidenceGap: proposed.evidenceGap }] : [],
        summary: r.parsed?.rationale,
      });
      const truncated = r.stopReason === 'max_tokens';
      const forbidden = r.parsed
        ? VERIFIER_FORBIDDEN_FIELDS.filter(f => f in (r.parsed as Record<string, unknown>)) : [];
      const executionValid = r.ok && !truncated && admission.admitted
        && !degen.DEGENERATE_PROVIDER_OUTPUT;

      const cue = proposed?.question
        ? semanticCueMatch(String(proposed.question), b.rowId)
        : { reached: false, via: null };
      const reached = executionValid && proposed ? cue.reached : null;

      // Execution failures are kept strictly separate from semantic failures.
      const missType = !r.ok ? 'TRANSPORT_FAILURE'
        : degen.DEGENERATE_PROVIDER_OUTPUT ? 'DEGENERATE_OUTPUT'
          : truncated ? 'CONTRACT_INVALID'
            : !admission.admitted ? 'BOUNDARY_REJECTION'
              : reached === true
                ? (proposed!.affectedDecision === HUMAN_SEMANTIC_TARGETS[b.rowId].affectedDecision
                  ? null : 'WRONG_AFFECTED_DECISION')
                : proposed ? 'WRONG_FACT_CLARIFICATION' : 'SETTLED_SILENCE';

      const rec = {
        rowId: b.rowId, caseId: b.caseId, draw,
        semanticRequestSha256: frozenSha,
        transportOk: r.ok, failureKind: r.failureKind, httpStatus: r.httpStatus,
        modelIdentity: r.modelIdentity, stopReason: r.stopReason,
        inputTokens: r.inputTokens, outputTokens: r.outputTokens, latencyMs: r.latencyMs,
        costUsd: Number(cost.toFixed(6)),
        responseState: !r.ok ? 'TRANSPORT_FAILURE' : truncated ? 'TRUNCATED'
          : degen.DEGENERATE_PROVIDER_OUTPUT ? 'DEGENERATE' : 'COMPLETE',
        contractAdmitted: admission.admitted, admissionCodes: admission.codes,
        verdict: (r.parsed?.verdict as string) ?? null,
        sourceMode: (r.parsed?.clarificationSourceMode as string) ?? null,
        nominationEmitted: !!nominated, clarificationEmitted: !!proposed,
        affectedDecision: proposed?.affectedDecision ?? null,
        question: proposed?.question ?? null,
        nominatedFact: nominated?.missingFact ?? null,
        rationale: (r.parsed?.rationale as string) ?? null,
        semanticTargetReached: reached, semanticCueMatched: reached ? cue.via : null,
        semanticMissType: missType,
        forbiddenFieldCount: forbidden.length,
        degenerate: degen.DEGENERATE_PROVIDER_OUTPUT, degenerateSignals: degen.signals,
        executionValid,
        rawResponse: r.raw,
      };
      records.push(rec);
      appendFileSync(storePath, `${JSON.stringify(rec)}\n`);
      console.log(`  ${b.rowId} ${b.caseId} d${String(draw).padStart(2)}  `
        + `${String(rec.verdict ?? r.failureKind).padEnd(30)}`
        + `${String(rec.sourceMode ?? '-').padEnd(15)}`
        + `valid=${executionValid ? 'Y' : 'N'} reach=${reached === null ? '-' : reached ? 'Y' : 'N'} `
        + `${String(r.outputTokens ?? '?').padStart(5)}out $${cost.toFixed(5)}`);
      if (stopped) break;
    }
    if (stopped) break;
  }
  const finishedAt = new Date().toISOString();
  if (stopped) console.log(`\n  STOPPED EARLY: ${stopped}`);
  try { chmodSync(storePath, 0o444); } catch { /* platform may refuse */ }

  writeFileSync(join(OUT, 'DRAW-RESULTS.json'), `${JSON.stringify({
    operation: '§163 verifier-v2 per-draw reliability',
    label: 'BOUNDED_DEVELOPMENT_RELIABILITY_SAMPLE — NOT a production error-rate estimate',
    startedAt, finishedAt, stoppedEarly: stopped,
    identity: { provider: 'anthropic', model: MODEL,
      verifierInstruction: EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
      verifierInstructionSha256: instructionSha,
      verifierContract: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
      packetSha256: packetSha, maxTokens: BUDGET.maxTokensPerCall,
      humanSemanticTargetsVersion: HUMAN_SEMANTIC_TARGETS_VERSION },
    frozenRequests: frozen,
    accounting: { plannedCalls: BUDGET.maxProviderRequests, providerRequests: requests,
      retries: 0, reruns: 0, replacements: 0,
      inputTokens: records.reduce((t, r) => t + ((r.inputTokens as number) ?? 0), 0),
      outputTokens: records.reduce((t, r) => t + ((r.outputTokens as number) ?? 0), 0),
      spendUsd: Number(spend.toFixed(6)), spendCeilingUsd: BUDGET.spendCeilingUsd },
    firstPassInvocations: 0,
    records,
  }, null, 2)}\n`);

  console.log(`\n  requests ${requests}/${BUDGET.maxProviderRequests}   retries 0   reruns 0`);
  console.log(`  spend $${spend.toFixed(6)} of $${BUDGET.spendCeilingUsd.toFixed(2)}`);
  console.log('  FIRST_PASS_EXPERT_INVOCATIONS = 0');
  console.log('\n  Scoring is separate:  npm run score:verifier-draw-reliability');
}

main().catch(e => { console.error(e); process.exit(1); });
