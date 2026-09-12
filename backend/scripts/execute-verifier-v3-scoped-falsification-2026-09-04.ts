/**
 * §167 EXPERT HAZLENZ -- SCOPED HOSTED VERIFIER-v3 BINDING FALSIFICATION. BOUNDED DEVELOPMENT SPEND.
 *
 * 12 hosted verifier calls. No retries, no replacement calls, no first-pass invocations.
 * Hard prospective cost cap $0.68, checked BEFORE every request against the worst case that request
 * could cost. Authorized by the product owner, 2026-09-04.
 *
 * ==================== WHAT THIS EXPERIMENT CAN AND CANNOT SETTLE ====================
 *
 * SCOPED to falsifiers A, B, C, E and a scoped F. **`FALSIFIER_D_TESTABLE = FALSE`** -- zero
 * human-authoritative silence rows survive §162, so no false-question rate, legitimate-silence
 * specificity or manufactured-question precision may be computed from this run, and the absence of
 * obviously bad questions is NOT evidence on D. HS-J1, HS-N1, HS-P1 and HS-R1 are never used.
 *
 * ==================== THE SEPARATION THAT DECIDES HOW THIS IS READ ====================
 *
 * Two different things are being measured and they must not be collapsed:
 *
 *   ARCHITECTURE_DETECTION_SUCCESS   does the deterministic machinery bind, refuse, account for
 *                                    every owed fact, and keep TARGET_COVERAGE_WARNING live when a
 *                                    fact is unresolved? This is scored by code.
 *   MODEL_SEMANTIC_RECOVERY_SUCCESS  does the MODEL actually reach the human-authoritative target
 *                                    now that it can bind? This is scored against frozen §162 human
 *                                    truth, and a miss here does NOT invalidate the machinery.
 *
 * A schema-valid response with a populated binding field and a firing warning is not validation of
 * anything. The substantive question is whether explicit owed-fact state changes what the model
 * addresses.
 *
 * ==================== EXECUTION DISCIPLINE ====================
 *
 *   - Both request bodies are frozen and hashed BEFORE spend, and asserted against the §166
 *     preflight's recorded hashes. One changed character stops the run at $0.00.
 *   - The allocation is preregistered in `DRAW_PLAN` and iterated in order. Draws are never
 *     rebalanced and a failed draw is never replaced.
 *   - Every attempt is appended and fsynced before the next request is issued. Nothing is ever
 *     overwritten, and a transport failure is a SPENT DRAW that stays in the record.
 */

import 'dotenv/config';

import { appendFileSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync,
  writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3';
import {
  checkVerifierV3Output, bridgeV3OutputToLedgerInputs, EXPERT_VERIFIER_CONTRACT_V3_VERSION,
  type ExpertVerifierV3Output,
} from './lib/expert-verifier-contract-v3';
import { EXPERT_VERIFIER_V2_SYSTEM_PROMPT } from './lib/expert-verifier-instruction-v2';
import { VERIFIER_FORBIDDEN_FIELDS } from './lib/expert-verifier-contract';
import {
  DRAW_PLAN, SUPPLIED_OWED_FACTS, OWED_TARGET_KEY, EXPECTED_FROZEN_REQUEST_SHA256,
  V3_EXPERIMENT_MODEL, V3_EXPERIMENT_MAX_TOKENS, V3_EXPERIMENT_CASES_VERSION,
  buildV3RequestBody, assertFrozenRequestHashes, sha256, type ExperimentPacketCase,
} from './lib/expert-v3-experiment-cases-2026-09-04';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import {
  owedFact, createOwedFactLedger, factOf, factsRemoved, unresolvedFacts,
  preservationViolations, type OwedFactLedger,
} from './lib/expert-owed-facts';
import {
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects, bindingMap,
  type ClarificationDeclaration,
} from './lib/expert-owed-fact-binding';
import { evaluateTargetCoverage } from './lib/expert-target-coverage';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';
import {
  assertTargetsMatchSection162, assertCuesNotSatisfiedByObservation, HUMAN_SEMANTIC_TARGETS,
} from './lib/expert-human-semantic-targets-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC163 = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V162 = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');
const V166 = join(V, 'expert-hazlenz-verifier-v3-binding-protocol-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04');

const PINNED = {
  v3InstructionSha: '678160c95bc7db385d49f3b4d5077fb84d63076f41a198925fd80ae0ff43cd88',
  v3SchemaSha: '1bddc1a51fb2d1cad43a7444a45728a6ca10296d448183fd2d3af60f02ca662a',
  v2InstructionSha: 'ffc63119b5a30ec88e09a078b75ae45e20c15b2efe82e6feef51ceaa0a8e33f4',
  packetSha: '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a',
  v13PromptModuleSha: '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa',
  v9FixtureSha: '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb',
} as const;

const BUDGET = {
  hardProviderRequestCap: 12,
  retryBudget: 0,
  replacementBudget: 0,
  firstPassInvocations: 0,
  hardProspectiveCostCapUsd: 0.68,
  conservativeInputTokenBound: 8_000,
  maxTokensPerCall: V3_EXPERIMENT_MAX_TOKENS,
} as const;
const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;
/** The worst case ANY single call can cost. The spend guard's unit. */
const WORST_CASE_CALL_USD =
  (BUDGET.conservativeInputTokenBound * PRICE_IN_PER_M
    + BUDGET.maxTokensPerCall * PRICE_OUT_PER_M) / 1e6;

const sha256File = (p: string): string => sha256(readFileSync(p, 'utf8'));

let passed = 0;
let failed = 0;
const gates: Array<{ id: string; ok: boolean; detail: string }> = [];
function gate(id: string, condition: boolean, detail = ''): void {
  gates.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- append-only record store

function createStore(path: string): { append(r: unknown): void; close(): void; count(): number } {
  if (existsSync(path) && readFileSync(path, 'utf8').trim().length > 0) {
    throw new Error(`${path} already has content — refusing to append a second run into it`);
  }
  const fd = openSync(path, 'a');
  let n = 0;
  return {
    append(r: unknown): void {
      // fsync before returning: a record that has been appended has reached the disk, so a crash
      // at call N+1 cannot erase calls 1..N. §139's lesson, applied.
      const s = JSON.stringify(r) + '\n';
      appendFileSync(fd, s);
      fsyncSync(fd);
      n += 1;
    },
    close(): void { closeSync(fd); },
    count: () => n,
  };
}

// ---------------------------------------------------------------- the single provider call

interface CallResult {
  ok: boolean; raw: unknown; parsed: Record<string, unknown> | null;
  failureKind: string | null; inputTokens: number | null; outputTokens: number | null;
  latencyMs: number; httpStatus: number | null; modelIdentity: string | null;
  stopReason: string | null;
}

async function callOnce(body: Record<string, unknown>, apiKey: string): Promise<CallResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey,
        'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const json = await response.json() as Record<string, any>;
    const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    if (!response.ok) {
      return { ok: false, raw: json, parsed: null,
        failureKind: response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR',
        inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
        latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
        stopReason: json.stop_reason ?? null };
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

// ---------------------------------------------------------------- main

async function main(): Promise<void> {
  const dryRun = process.env.EXPERIMENT_DRY_RUN === '1';
  console.log('§167 SCOPED HOSTED VERIFIER-v3 BINDING FALSIFICATION');
  console.log('='.repeat(100));
  console.log(`  BOUNDED DEVELOPMENT SAMPLE — NOT a production rate, NOT an accuracy claim`);
  console.log(`  FALSIFIER_D_TESTABLE = FALSE (no human-authoritative silence truth)\n`);
  console.log(`--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  // ---- A. protocol identity, pinned to the authorization.
  gate('A.1 verifier-v3 instruction hash matches the authorization',
    sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT) === PINNED.v3InstructionSha,
    `${EXPERT_VERIFIER_INSTRUCTION_V3_VERSION} ${PINNED.v3InstructionSha.slice(0, 24)}…`);
  gate('A.2 verifier-v3 response schema hash matches the authorization',
    sha256(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)) === PINNED.v3SchemaSha,
    `${PINNED.v3SchemaSha.slice(0, 24)}…`);
  gate('A.3 verifier-v3 contract is the one under test',
    EXPERT_VERIFIER_CONTRACT_V3_VERSION === 'hazlenz.expert.verifier.v3',
    EXPERT_VERIFIER_CONTRACT_V3_VERSION);
  gate('A.4 verifier-v2 instruction remains BYTE-UNCHANGED',
    sha256(EXPERT_VERIFIER_V2_SYSTEM_PROMPT) === PINNED.v2InstructionSha, 'immutable');
  gate('A.5 the §156 blinded packet is unchanged',
    sha256File(join(SRC163, 'VERIFIER-PACKET.json')) === PINNED.packetSha, 'unchanged');
  gate('A.6 the v13 first-pass prompt module is unchanged — no first-pass call will occur',
    sha256File(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts'))
      === PINNED.v13PromptModuleSha, 'unchanged');
  gate('A.7 the hardened v9 fixture is unchanged',
    sha256File(join(ROOT,
      'backend/src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
      === PINNED.v9FixtureSha, 'unchanged');

  // ---- B. the frozen payload and the preregistered allocation.
  const packet = JSON.parse(readFileSync(join(SRC163, 'VERIFIER-PACKET.json'), 'utf8')) as
  { cases: ExperimentPacketCase[] };
  const caseIds = [...new Set(DRAW_PLAN.map(d => d.caseId))];
  const cases = caseIds.map(id => packet.cases.find(c => c.caseId === id)!);
  let hashes: Record<string, string> = {};
  let hashOk = true;
  let hashDetail = '';
  try {
    hashes = assertFrozenRequestHashes(cases);
    hashDetail = caseIds.map(id => `${id} ${hashes[id].slice(0, 16)}…`).join('  ');
  } catch (e) { hashOk = false; hashDetail = (e as Error).message; }
  gate('B.1 both request bodies rebuild to the §166 preflight hashes, byte for byte', hashOk,
    hashDetail);
  gate('B.2 the case allocation is PREREGISTERED and frozen — 2 cases × 6 draws, in order',
    DRAW_PLAN.length === 12 && caseIds.length === 2
      && caseIds.every(id => DRAW_PLAN.filter(d => d.caseId === id).length === 6)
      && DRAW_PLAN.every((d, i) => d.draw === (i % 6) + 1),
    `${V3_EXPERIMENT_CASES_VERSION}; draws are never rebalanced and never replaced`);
  gate('B.3 exactly one owed fact is supplied per case, and each names the frozen owed target',
    caseIds.every(id => SUPPLIED_OWED_FACTS[id].length === 1
      && SUPPLIED_OWED_FACTS[id][0].factKey === OWED_TARGET_KEY[id]),
    Object.values(OWED_TARGET_KEY).map(k => k.split(':').pop()).join(' · '));
  gate('B.4 HS-A1 is NOT told about the auger gap — the displacement question stays open',
    !JSON.stringify(SUPPLIED_OWED_FACTS['VC-08']).toLowerCase().includes('auger'),
    'supplying it would answer the question instead of measuring it');

  // ---- C. blinding.
  const bodies = cases.map(c => ({ caseId: c.caseId, body: buildV3RequestBody(c) }));
  const WHOLE: Array<[string, RegExp]> = [
    ['row id', /HS-[A-Z]\d/], ['disposition', /AUTHORING_(VALID|AMBIGUOUS|INVALID)|DISPLACED_FACT_/],
    ['expected outcome', /TARGET_REACHED|VALID_BUT_TARGET_DISPLACED|INVALID_WRONG_FACT/],
    ['historical result', /\b(3\/10|1\/10|7\/10|8\/10|4\/20)\b/],
    ['scoring vocabulary', /acceptableSelectors|denominator|semanticSuccess|selectorAccuracy/],
    ['human semantic target', /flame-failure safeguard|rotor-guard interlock protective/],
    ['human review vocabulary', /human-reviewed|ELIGIBLE|INELIGIBLE|dispositionedBy/],
    ['section ref', /§1\d\d/],
  ];
  const USERMSG: Array<[string, RegExp]> = [
    ['fixture label', /(?<![-\w])(REQUIRED|FORBIDDEN)(?![-_\w])/],
    ['scoring state', /(?<![-\w])(PASS|FAIL)(?![-_\w])|SEMANTIC_SUCCESS|scoredAs/],
    ['historical verdict', /VERIFIED_AS_IS|NO_CLARIFICATION_REQUIRED|ADD_OR_REPLACE/],
    ['draw label', /\bR[123]\b|drawIndex/],
  ];
  for (const b of bodies) {
    const whole = JSON.stringify(b.body);
    const msg = String((b.body.messages as Array<Record<string, string>>)[0].content);
    const h1 = WHOLE.filter(([, re]) => re.test(whole)).map(([n]) => n);
    const h2 = USERMSG.filter(([, re]) => re.test(msg)).map(([n]) => n);
    gate(`C.${b.caseId} no human truth leaks into the provider-visible payload`,
      h1.length === 0 && h2.length === 0,
      [...h1, ...h2].length ? `LEAKS: ${[...h1, ...h2].join(', ')}`
        : `${WHOLE.length + USERMSG.length} patterns, 0 matches`);
  }

  // ---- D. frozen truth cannot drift, and cannot repeat the retired scorer's defect.
  let truthOk = true;
  let truthDetail = '';
  try {
    const s162 = JSON.parse(readFileSync(join(V162, 'HUMAN-SEMANTIC-REDERIVATION.json'), 'utf8'))
      .humanSemanticTargets;
    assertTargetsMatchSection162(s162);
    assertCuesNotSatisfiedByObservation(Object.fromEntries(
      DRAW_PLAN.map(d => [d.rowId, cases.find(c => c.caseId === d.caseId)!.observation])));
    truthDetail = 'deep-equal to §162; cues not satisfied by either observation';
  } catch (e) { truthOk = false; truthDetail = (e as Error).message; }
  gate('D.1 frozen human targets match §162 and are not satisfied by the observations themselves',
    truthOk, truthDetail);
  gate('D.2 the two authoritative rows and no others',
    Object.keys(HUMAN_SEMANTIC_TARGETS).length === 2
      && ['HS-A1', 'HS-E1'].every(r => r in HUMAN_SEMANTIC_TARGETS), 'HS-A1, HS-E1');
  gate('D.3 no ineligible row is used anywhere in this experiment',
    !bodies.some(b => ['HS-J1', 'HS-N1', 'HS-P1', 'HS-R1']
      .some(r => JSON.stringify(b.body).includes(r)))
      && !DRAW_PLAN.some(d => ['HS-J1', 'HS-N1', 'HS-P1', 'HS-R1'].includes(d.rowId)),
    'FALSIFIER_D_TESTABLE = FALSE; no silence-control denominator is manufactured');

  // ---- E. budget and containment.
  const worstTotal = DRAW_PLAN.length * WORST_CASE_CALL_USD;
  gate('E.1 12 requests, 0 retries, 0 replacements, 0 first-pass invocations',
    DRAW_PLAN.length === BUDGET.hardProviderRequestCap && BUDGET.retryBudget === 0
      && BUDGET.replacementBudget === 0 && BUDGET.firstPassInvocations === 0,
    'no retry path exists in this script');
  gate('E.2 the prospective worst case fits inside the $0.68 cap',
    worstTotal <= BUDGET.hardProspectiveCostCapUsd,
    `12 × $${WORST_CASE_CALL_USD.toFixed(5)} = $${worstTotal.toFixed(5)} of `
    + `$${BUDGET.hardProspectiveCostCapUsd.toFixed(2)}`);
  gate('E.3 max_tokens is 4000 and was not lowered',
    BUDGET.maxTokensPerCall === 4000
      && bodies.every(b => b.body.max_tokens === 4000), '4000');
  gate('E.4 no sampling or determinism control is introduced',
    bodies.every(b => !('temperature' in b.body) && !('top_p' in b.body)
      && !('top_k' in b.body) && !('seed' in b.body)), 'none present');
  gate('E.5 an API credential is present',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');
  const storePath = join(OUT, 'RUN-RECORDS.jsonl');
  gate('E.6 the append-only record store is empty or absent',
    !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');
  gate('E.7 the frozen formal invocation count is intact',
    FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195, '195, immutable');
  const ownImports = readFileSync(__filename, 'utf8').split('\n').filter(l => /^import /.test(l));
  gate('E.8 this script imports nothing from src/ — no first-pass entry point is reachable',
    ownImports.filter(l => /from '\.\.\/src\//.test(l)).length === 0,
    `${ownImports.length} imports, 0 from src/`);
  gate('E.9 the §166 preflight artifact is present and its hashes agree with this run',
    existsSync(join(V166, 'FALSIFICATION-HARNESS-PREFLIGHT-V3.json'))
      && caseIds.every(id => hashes[id] === EXPECTED_FROZEN_REQUEST_SHA256[id]),
    'the payload spent against is the payload preflighted');

  console.log(`\n  PRE-SPEND GATE: ${passed}/${passed + failed} `
    + `${failed === 0 ? 'PASS' : 'FAIL'}. $0.00 spent so far.`);

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'FROZEN-REQUESTS.json'), JSON.stringify({
    frozenAt: new Date().toISOString(),
    version: V3_EXPERIMENT_CASES_VERSION,
    model: V3_EXPERIMENT_MODEL,
    maxTokens: BUDGET.maxTokensPerCall,
    instruction: { version: EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
      sha256: sha256(EXPERT_VERIFIER_V3_SYSTEM_PROMPT) },
    responseSchemaSha256: sha256(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)),
    contract: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
    drawPlan: DRAW_PLAN,
    suppliedOwedFacts: SUPPLIED_OWED_FACTS,
    owedTargetKey: OWED_TARGET_KEY,
    requests: caseIds.map(id => ({
      caseId: id,
      semanticRequestSha256: hashes[id] ?? null,
      requestBytes: JSON.stringify(bodies.find(b => b.caseId === id)!.body).length,
      body: bodies.find(b => b.caseId === id)!.body,
    })),
    budget: { ...BUDGET, worstCaseCallUsd: WORST_CASE_CALL_USD,
      prospectiveWorstCaseTotalUsd: worstTotal },
    preSpendGate: gates,
  }, null, 2) + '\n');
  console.log(`  wrote FROZEN-REQUESTS.json (before any spend)`);

  if (failed > 0) {
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      `VERIFIER_V3_SCOPED_FALSIFICATION_BLOCKED — PRESPEND_GATE_FAILURE\n`
      + gates.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nBLOCKED BEFORE SPEND. $0.00 spent.');
    process.exit(1);
  }
  if (dryRun) { console.log('\nDRY RUN — stopping before spend. $0.00 spent.'); return; }

  // ------------------------------------------------------------ spend

  console.log(`\n--- EXECUTION: ${DRAW_PLAN.length} calls, cap `
    + `$${BUDGET.hardProspectiveCostCapUsd.toFixed(2)}\n`);
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  const store = createStore(storePath);
  let spentUsd = 0;
  let requestsIssued = 0;
  const summaries: Array<Record<string, unknown>> = [];

  for (const plan of DRAW_PLAN) {
    // THE SPEND GUARD. Evaluated BEFORE the request, against the worst case it could cost.
    if (requestsIssued + 1 > BUDGET.hardProviderRequestCap) {
      console.log(`STOP: request cap ${BUDGET.hardProviderRequestCap} reached`);
      break;
    }
    if (spentUsd + WORST_CASE_CALL_USD > BUDGET.hardProspectiveCostCapUsd) {
      console.log(`STOP: prospective cost cap would be crossed — $${spentUsd.toFixed(5)} + `
        + `$${WORST_CASE_CALL_USD.toFixed(5)} > $${BUDGET.hardProspectiveCostCapUsd.toFixed(2)}`);
      break;
    }

    const body = bodies.find(b => b.caseId === plan.caseId)!.body;
    const r = await callOnce(body, apiKey);
    requestsIssued += 1;
    const costUsd = ((r.inputTokens ?? 0) * PRICE_IN_PER_M
      + (r.outputTokens ?? 0) * PRICE_OUT_PER_M) / 1e6;
    spentUsd += costUsd;

    // ---- deterministic processing of whatever came back.
    const parsed = r.parsed;
    const suppliedKeys = SUPPLIED_OWED_FACTS[plan.caseId].map(f => f.factKey);
    const observation = cases.find(c => c.caseId === plan.caseId)!.observation;
    const admission = parsed
      ? checkVerifierV3Output(
        { ...parsed, verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
          analysisId: `${plan.caseId}-${plan.draw}` },
        { analysisId: `${plan.caseId}-${plan.draw}`, observation,
          suppliedOwedFactKeys: suppliedKeys })
      : { admitted: false, codes: ['OUTPUT_NOT_AN_OBJECT'] as never[], detail: ['no tool_use block'],
        bindingAdmitted: false, nominationAdmitted: false, challengedFactKeys: [] as string[] };

    const proposal = parsed?.proposedClarification as Record<string, unknown> | null | undefined;
    const degen = detectDegenerateOutput({
      rowId: plan.caseId,
      candidates: [],
      clarifications: proposal ? [{ clarificationId: 'proposed', question: proposal.question,
        whyItMatters: proposal.whyItMatters, evidenceGap: proposal.evidenceGap }] : [],
      summary: parsed?.rationale,
    });
    const truncated = r.stopReason === 'max_tokens';
    const forbidden = parsed
      ? VERIFIER_FORBIDDEN_FIELDS.filter(f => f in parsed) : [];
    const responseState = !r.ok ? 'TRANSPORT_FAILURE'
      : truncated ? 'TRUNCATED'
        : degen.DEGENERATE_PROVIDER_OUTPUT ? 'DEGENERATE' : 'COMPLETE';
    const executionValid = r.ok && !truncated && admission.admitted
      && !degen.DEGENERATE_PROVIDER_OUTPUT;

    // ---- run the admitted verdict through the §165 ledger, exactly as production would.
    const ledgerBefore: OwedFactLedger = createOwedFactLedger('DEVELOPMENT',
      SUPPLIED_OWED_FACTS[plan.caseId].map(f => owedFact({
        factKey: f.factKey,
        affectedDecision: f.affectedDecision as never,
        source: 'DEVELOPMENT_HUMAN_TRUTH',
        evidenceSpan: f.evidenceSpan ?? '',
        whyUnresolved: f.whyUnresolved,
        branchA: f.branchA,
        branchB: f.branchB,
        decisionDivergence: f.decisionDivergence,
        priority: 'REQUIRED_CONTROL',
      })));
    let ledgerAfter = ledgerBefore;
    let bindingCheck: ReturnType<typeof checkBindingDeclarations> | null = null;
    let bridged: ReturnType<typeof bridgeV3OutputToLedgerInputs> | null = null;
    if (admission.admitted && parsed) {
      bridged = bridgeV3OutputToLedgerInputs(
        { ...(parsed as unknown as ExpertVerifierV3Output),
          verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION,
          analysisId: `${plan.caseId}-${plan.draw}` },
        admission as never,
        { analysisId: `${plan.caseId}-${plan.draw}`, nominatedPriority: 'REQUIRED_CONTROL' });
      bindingCheck = checkBindingDeclarations(
        bridged.declarations as ClarificationDeclaration[], ledgerBefore, observation);
      ledgerAfter = applyAdmittedDeclarations(ledgerBefore, bindingCheck);
    }
    const coverage = evaluateTargetCoverage(
      ledgerAfter, bindingCheck?.boundFactKeys ?? [],
      bindingCheck ? bindingMap(bindingCheck) : {});

    const owedKey = OWED_TARGET_KEY[plan.caseId];
    const record = {
      rowId: plan.rowId,
      caseId: plan.caseId,
      draw: plan.draw,
      semanticRequestSha256: hashes[plan.caseId],
      // --- transport / provider
      transportOk: r.ok,
      failureKind: r.failureKind,
      httpStatus: r.httpStatus,
      modelIdentity: r.modelIdentity,
      stopReason: r.stopReason,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      latencyMs: r.latencyMs,
      costUsd: Number(costUsd.toFixed(6)),
      // --- response state
      responseState,
      truncated,
      degenerate: degen.DEGENERATE_PROVIDER_OUTPUT,
      degenerateSignals: degen.signals,
      forbiddenFields: forbidden,
      executionValid,
      // --- contract
      contractAdmitted: admission.admitted,
      admissionCodes: admission.codes,
      admissionDetail: admission.detail,
      // --- verdict content
      verdict: (parsed?.verdict as string) ?? null,
      clarificationSourceMode: (parsed?.clarificationSourceMode as string) ?? null,
      bindingFactKey: (parsed?.bindingFactKey as string) ?? null,
      owedFactDeclarations: (parsed?.owedFactDeclarations as unknown) ?? null,
      proposedQuestion: (proposal?.question as string) ?? null,
      proposedAffectedDecision: (proposal?.affectedDecision as string) ?? null,
      nominationPresent: !!parsed?.nominatedFact,
      nominatedFact: (parsed?.nominatedFact as unknown) ?? null,
      rationale: (parsed?.rationale as string) ?? null,
      // --- architecture outcome
      owedTargetKey: owedKey,
      boundToOwedTarget: (parsed?.bindingFactKey as string) === owedKey && admission.admitted,
      bindAndNominateCoexisted: admission.bindingAdmitted && admission.nominationAdmitted,
      ledgerFactCountBefore: ledgerBefore.facts.length,
      ledgerFactCountAfter: ledgerAfter.facts.length,
      factsRemoved: factsRemoved(ledgerBefore, ledgerAfter),
      preservationViolations: preservationViolations(ledgerBefore, ledgerAfter),
      bindingSideEffects: bindingCheck
        ? bindingSideEffects(ledgerBefore, ledgerAfter, bindingCheck) : [],
      coverageTransitions: ledgerAfter.transitions,
      owedTargetStatusAfter: factOf(ledgerAfter, owedKey)?.status ?? null,
      unresolvedSuppliedFactKeys: unresolvedFacts(ledgerAfter)
        .filter(f => suppliedKeys.includes(f.factKey)).map(f => f.factKey),
      uncoveredFactKeys: coverage.uncoveredFactKeys,
      TARGET_COVERAGE_WARNING: coverage.TARGET_COVERAGE_WARNING,
      arbitrationRequests: bridged?.arbitrationRequests ?? [],
      // --- question burden
      customerQuestionCount: proposal ? 1 : 0,
      distinctFactsRepresented: (admission.bindingAdmitted ? 1 : 0)
        + (admission.nominationAdmitted ? 1 : 0),
      // --- raw, never overwritten
      rawResponse: r.raw,
    };
    store.append(record);
    summaries.push(record as unknown as Record<string, unknown>);

    console.log(
      `  ${plan.rowId} draw ${plan.draw}  ${responseState.padEnd(10)} `
      + `${String(record.verdict ?? '-').padEnd(28)} `
      + `bind=${record.boundToOwedTarget ? 'OWED' : (record.bindingFactKey ? 'other' : 'none')} `
      + `nom=${record.nominationPresent ? 'Y' : 'N'} `
      + `warn=${record.TARGET_COVERAGE_WARNING ? 'T' : 'F'} `
      + `$${costUsd.toFixed(5)}  spent=$${spentUsd.toFixed(5)}`);
  }
  store.close();

  const totalIn = summaries.reduce((t, s) => t + ((s.inputTokens as number) ?? 0), 0);
  const totalOut = summaries.reduce((t, s) => t + ((s.outputTokens as number) ?? 0), 0);
  writeFileSync(join(OUT, 'EXECUTION-ACCOUNTING.json'), JSON.stringify({
    executedAt: new Date().toISOString(),
    plannedRequests: DRAW_PLAN.length,
    requestsIssued,
    retries: 0,
    replacementCalls: 0,
    firstPassInvocations: 0,
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
    totalActualCostUsd: Number(spentUsd.toFixed(6)),
    hardProspectiveCostCapUsd: BUDGET.hardProspectiveCostCapUsd,
    worstCaseCallUsd: WORST_CASE_CALL_USD,
    capCompliance: spentUsd <= BUDGET.hardProspectiveCostCapUsd,
    modelIdentities: [...new Set(summaries.map(s => s.modelIdentity))],
    recordStore: 'RUN-RECORDS.jsonl',
    recordsAppended: summaries.length,
  }, null, 2) + '\n');

  console.log(`\n${'='.repeat(100)}`);
  console.log(`  ${requestsIssued}/${DRAW_PLAN.length} requests · ${totalIn} in / ${totalOut} out `
    + `tokens · ACTUAL COST $${spentUsd.toFixed(5)} of $${BUDGET.hardProspectiveCostCapUsd.toFixed(2)}`);
  console.log(`  0 retries · 0 replacement calls · 0 first-pass invocations`);
  console.log('='.repeat(100));
}

main().catch(e => { console.error(e); process.exit(1); });
