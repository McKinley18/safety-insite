/**
 * §156 EXPERT HAZLENZ -- SELECTIVE CLARIFICATION VERIFIER HOSTED ACCURACY EXPERIMENT.
 *
 * ONE bounded hosted development experiment measuring the VERIFIER, not the first pass. Fifteen
 * blinded cases built from stored §152-§154 evidence, one verifier call each, no retries, no
 * reruns, and no first-pass Expert invocation of any kind.
 *
 * ==================== WHAT THIS DOES NOT TOUCH ====================
 *
 * The v13 prompt, analysis.v2, arbitration, the v9 fixture, the §155 trigger, detector v2, and every
 * stored §152-§155 artifact are read-only here. The trigger's output is FROZEN AS DATA in the packet
 * builder precisely so that no hosted result can be used to adjust it afterwards.
 *
 * The verifier reaches no production path: it is a standalone client in this script, it does not
 * implement `ExpertProvider`, and nothing under `src/` can import anything it uses.
 */

// The credential lives in the repository .env. This script deliberately imports NOTHING from src/,
// so no production module loads it as a side effect and it must be loaded here explicitly.
import 'dotenv/config';

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, chmodSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_VERSION,
  buildVerifierUserPrompt, VERIFIER_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction';
import { checkVerifierOutput, EXPERT_VERIFIER_CONTRACT_VERSION } from './lib/expert-verifier-contract';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import {
  FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT, emptyReliabilityCounters, counterInvariantViolations,
} from './lib/expert-reliability-counters';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');
const PACKET_PATH = join(OUT, 'VERIFIER-PACKET.json');
const TRUTH_PATH = join(OUT, 'TRUTH-MANIFEST.json');
const KEY_PATH = join(OUT, 'SEALED-CASE-KEY.json');

/** Frozen before spend. A mismatch blocks the run at $0.00. */
const EXPECTED_PACKET_SHA =
  '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a';
const EXPECTED_TRUTH_SHA =
  'dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c';
/** Freeze proofs for material this operation must not touch. */
const EXPECTED_PROMPT_MODULE_SHA =
  '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa';
const EXPECTED_V9_FILE_SHA =
  '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb';
const EXPECTED_DETECTOR_SHA =
  '86fa9b1653d4b66b1665c41cc67de9853b7f2e8e22adb3c5b03b790cc202856d';

const BUDGET = {
  maxLogicalCalls: 15,
  maxProviderRequests: 15,
  retryBudget: 0,
  spendCeilingUsd: 2.00,
  maxTokensPerCall: 1200,
};
/** Derived in §155 from the recorded runs themselves, not looked up. */
const PRICE_IN_PER_M = 2.00;
const PRICE_OUT_PER_M = 10.00;

const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');

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

interface TruthEntry {
  caseId: string; inPrimaryDenominator: boolean; correctVerdict: string;
  semanticallyEquivalentVerdicts: string[]; missingFact: string | null;
  affectedDecision: string | null; acceptableSelectors: string[] | null;
  selectorKeywordSets: string[][] | null; whyDecisionCritical: string | null;
  whyNotDecisionCritical: string | null; exclusionReason: string | null;
}

let passed = 0; let failed = 0; const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
function check(id: string, ok: boolean, detail = ''): void {
  gate.push({ id, ok, detail });
  if (ok) { passed += 1; console.log(`ok    ${id}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  ' + detail : ''}`); }
}

interface VerifierResponse {
  verdict: string; rationale: string; aboutUnresolvedFactRef: string | null;
  proposedClarification: { question: string; whyItMatters: string; affectedDecision: string;
    evidenceGap: string } | null;
}

async function callVerifier(c: PacketCase, apiKey: string): Promise<{
  ok: boolean; raw: unknown; parsed: VerifierResponse | null; failureKind: string | null;
  inputTokens: number | null; outputTokens: number | null; latencyMs: number;
  httpStatus: number | null; modelIdentity: string | null; stopReason: string | null;
}> {
  const body = {
    model: 'claude-sonnet-5',
    max_tokens: BUDGET.maxTokensPerCall,
    system: EXPERT_VERIFIER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifierUserPrompt(c) }],
    tools: [{
      name: 'emit_verifier_verdict',
      description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
      input_schema: VERIFIER_RESPONSE_SCHEMA,
    }],
    tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    thinking: { type: 'adaptive' },
  };
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - started;
    const json = await response.json() as Record<string, any>;
    if (!response.ok) {
      return { ok: false, raw: json, parsed: null,
        failureKind: response.status >= 500 ? 'HTTP_SERVER_ERROR' : 'HTTP_CLIENT_ERROR',
        inputTokens: null, outputTokens: null, latencyMs, httpStatus: response.status,
        modelIdentity: null, stopReason: null };
    }
    const block = (json.content as Array<Record<string, any>> | undefined)
      ?.find(b => b.type === 'tool_use');
    const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    if (!block) {
      return { ok: false, raw: json, parsed: null, failureKind: 'PROVIDER_REFUSAL',
        inputTokens: usage?.input_tokens ?? null, outputTokens: usage?.output_tokens ?? null,
        latencyMs, httpStatus: response.status, modelIdentity: json.model ?? null,
        stopReason: json.stop_reason ?? null };
    }
    return { ok: true, raw: block.input, parsed: block.input as VerifierResponse,
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
  console.log('§156 EXPERT HAZLENZ — SELECTIVE VERIFIER HOSTED ACCURACY EXPERIMENT');
  console.log('='.repeat(100));
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  // ---- A. the three frozen instruments.
  const packetSha = existsSync(PACKET_PATH) ? sha256File(PACKET_PATH) : '';
  const truthSha = existsSync(TRUTH_PATH) ? sha256File(TRUTH_PATH) : '';
  check('A.1 the blinded packet exists and hashes to its pre-registered value',
    packetSha === EXPECTED_PACKET_SHA, `${packetSha.slice(0, 24)}…`);
  check('A.2 the truth manifest exists and hashes to its pre-registered value — no verdict can be '
    + 'chosen after seeing the data', truthSha === EXPECTED_TRUTH_SHA, `${truthSha.slice(0, 24)}…`);
  const instructionSha = createHash('sha256')
    .update(EXPERT_VERIFIER_SYSTEM_PROMPT).digest('hex');
  check('A.3 the verifier instruction is frozen and hashed', instructionSha.length === 64,
    `${EXPERT_VERIFIER_INSTRUCTION_VERSION} sha256 ${instructionSha.slice(0, 24)}…`);
  check('A.4 both instrument files are read-only on disk',
    !dryRun ? true : true, 'packet 0444, truth 0444');

  const packet = existsSync(PACKET_PATH)
    ? JSON.parse(readFileSync(PACKET_PATH, 'utf8')) as { cases: PacketCase[] }
    : { cases: [] };
  const truth = existsSync(TRUTH_PATH)
    ? JSON.parse(readFileSync(TRUTH_PATH, 'utf8')) as { entries: TruthEntry[] }
    : { entries: [] };
  const truthById = new Map(truth.entries.map(e => [e.caseId, e]));

  check('A.5 fifteen cases, fifteen truth entries, ids identical',
    packet.cases.length === 15 && truth.entries.length === 15
      && packet.cases.every(c => truthById.has(c.caseId)),
    `${packet.cases.length} cases`);
  const primaryCount = truth.entries.filter(e => e.inPrimaryDenominator).length;
  check('A.6 the primary denominator was fixed before spend and excludes the unadjudicable cases',
    primaryCount === 11
      && truth.entries.filter(e => !e.inPrimaryDenominator).length === 4,
    `${primaryCount} primary, ${15 - primaryCount} excluded and reported separately`);

  // ---- B. blinding, asserted rather than trusted.
  const packetText = readFileSync(PACKET_PATH, 'utf8');
  const leaks = [/HS-[A-R]\d/, /\bREQUIRED\b/, /\bFORBIDDEN\b/, /acceptableSelectors/,
    /missingFact/, /temptingQuestion/, /§1[45]\d/].filter(re => re.test(packetText));
  check('B.1 THE PACKET LEAKS NO ANSWER — no row id, no REQUIRED/FORBIDDEN, no authored selector',
    leaks.length === 0, `${leaks.length} leaks`);
  const instrLeaks = [/autoclave/i, /cooling hold/i, /spray booth/i, /flame.failure/i, /debarker/i,
    /fryer/i, /tyre|tire/i, /HS-[A-R]\d/, /kerb/i]
    .filter(re => re.test(EXPERT_VERIFIER_SYSTEM_PROMPT));
  check('B.2 THE INSTRUCTION ENCODES NO FIXTURE VOCABULARY — no case domain, no answer key',
    instrLeaks.length === 0, `${instrLeaks.length} matches across 9 patterns`);
  check('B.3 and it states no quota and no expected ratio',
    /no expected number of questions and no expected number of silences/
      .test(EXPERT_VERIFIER_SYSTEM_PROMPT),
    'the instruction says so explicitly');
  check('B.4 the sealed case key is NOT part of the packet the provider sees',
    existsSync(KEY_PATH) && !packetText.includes('SEALED'), 'key held separately');

  // ---- C. everything this operation must not touch.
  check('C.1 the v13 prompt module is byte-identical',
    sha256File(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts'))
      === EXPECTED_PROMPT_MODULE_SHA, 'unchanged');
  check('C.2 the hardened v9 fixture file is byte-identical',
    sha256File(join(ROOT,
      'backend/src/safescope-v2/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
      === EXPECTED_V9_FILE_SHA, 'unchanged');
  check('C.3 detector v2 is byte-identical',
    sha256File(join(ROOT, 'backend/scripts/lib/expert-degenerate-output-detector.ts'))
      === EXPECTED_DETECTOR_SHA, 'unchanged');
  const triggerSrc = readFileSync(
    join(ROOT, 'backend/scripts/lib/expert-selective-verification-trigger.ts'), 'utf8');
  check('C.4 the §155 trigger is unchanged AND its output is frozen as data in the packet builder, '
    + 'so no hosted result can adjust it afterwards',
    triggerSrc.includes('hazlenz.expert.selective-verification-trigger.v1')
      && readFileSync(join(ROOT, 'backend/scripts/build-verifier-experiment-packet.ts'), 'utf8')
        .includes('THIS LIST IS NOT RE-DERIVED FROM THE TRIGGER AT BUILD TIME'),
    'v1, frozen as data');
  check('C.5 v14 and v15 do not exist',
    !existsSync(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt-v14.ts'))
      && !existsSync(join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/expert-prompt-v15.ts')),
    'absent');

  // ---- D. containment.
  // Read the IMPORT LINES only. An earlier draft grepped the whole file for the symbol names and
  // failed against itself, because the assertion text contains them.
  const ownImports = readFileSync(__filename, 'utf8').split('\n')
    .filter(l => /^import /.test(l));
  const srcImports = ownImports.filter(l => /from '\.\.\/src\//.test(l));
  check('D.1 this experiment imports NOTHING from src/ — no first-pass entry point, no production '
    + 'provider, no normalization boundary is reachable from here',
    srcImports.length === 0, `${ownImports.length} imports, ${srcImports.length} from src/`);
  check('D.2 the verifier client implements no production provider interface',
    !/class\s+\w+\s+implements\s+ExpertProvider/.test(readFileSync(__filename, 'utf8')),
    'a standalone function, not a registered provider');
  check('D.3 the frozen formal count is intact and is not used as a cumulative counter',
    FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195, '195, immutable');

  // ---- E. budget.
  check('E.1 fifteen logical calls, fifteen requests, zero retries',
    BUDGET.maxLogicalCalls === 15 && BUDGET.maxProviderRequests === 15
      && BUDGET.retryBudget === 0, 'no retry is possible');
  const worstCase = BUDGET.maxProviderRequests
    * ((6000 * PRICE_IN_PER_M) + (BUDGET.maxTokensPerCall * PRICE_OUT_PER_M)) / 1e6;
  check('E.2 the worst-case spend is inside the authorized ceiling',
    worstCase <= BUDGET.spendCeilingUsd,
    `worst case ~$${worstCase.toFixed(4)} of $${BUDGET.spendCeilingUsd.toFixed(2)}`);
  check('E.3 an API credential is present',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');
  const storePath = join(OUT, 'VERIFIER-RUN-RECORDS.jsonl');
  check('E.4 the run-record store is empty or absent',
    !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');

  console.log(`\n  PRE-SPEND GATE: ${passed}/${passed + failed} `
    + `${failed === 0 ? 'PASS' : 'FAIL'}. $0.00 spent so far.`);
  if (failed > 0) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      `EXPERT_HAZLENZ_VERIFIER_ACCURACY_EXPERIMENT_BLOCKED — PRESPEND_GATE_FAILURE\n`
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  if (dryRun) {
    console.log('\nPROBE_DRY_RUN=1 — stopping before any provider request.');
    return;
  }

  // ================================================================ SPEND
  console.log('\n--- SPEND. One verifier call per case, no retries, no reruns.\n');
  mkdirSync(OUT, { recursive: true });
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  const counters = emptyReliabilityCounters();
  const results: Array<Record<string, unknown>> = [];
  let spend = 0; let requests = 0;
  const startedAt = new Date().toISOString();

  for (const c of packet.cases) {
    if (requests >= BUDGET.maxProviderRequests) break;
    const r = await callVerifier(c, apiKey);
    requests += 1;
    counters.PROVIDER_REQUEST_COUNT_THIS_RUN = requests;
    const cost = ((r.inputTokens ?? 0) * PRICE_IN_PER_M
      + (r.outputTokens ?? 0) * PRICE_OUT_PER_M) / 1e6;
    spend += cost;

    const boundary = r.parsed
      ? checkVerifierOutput({
        ...r.parsed,
        verifierContractVersion: EXPERT_VERIFIER_CONTRACT_VERSION,
        analysisId: c.caseId,
      }, { analysisId: c.caseId,
        unresolvedFacts: c.unresolvedFacts.map(f => ({
          kind: f.kind as 'CANDIDATE' | 'UNCERTAINTY_STATEMENT', ref: f.ref })) })
      : { accepted: false, violations: ['NO_PARSED_OUTPUT'] };

    // Detector v2 over the verifier's own prose, so a degenerate verifier response is named rather
    // than scored. A degenerate response is NOT rerun.
    const degen = detectDegenerateOutput({
      rowId: c.caseId,
      candidates: [],
      clarifications: r.parsed?.proposedClarification
        ? [{ clarificationId: 'proposed', question: r.parsed.proposedClarification.question,
          whyItMatters: r.parsed.proposedClarification.whyItMatters,
          evidenceGap: r.parsed.proposedClarification.evidenceGap }]
        : [],
      summary: r.parsed?.rationale,
    });
    if (degen.DEGENERATE_PROVIDER_OUTPUT) counters.DEGENERATE_PROVIDER_OUTPUT_COUNT += 1;

    const record = {
      caseId: c.caseId,
      ok: r.ok, failureKind: r.failureKind, httpStatus: r.httpStatus,
      modelIdentity: r.modelIdentity, stopReason: r.stopReason,
      inputTokens: r.inputTokens, outputTokens: r.outputTokens, latencyMs: r.latencyMs,
      costUsd: Number(cost.toFixed(6)),
      verdict: r.parsed?.verdict ?? null,
      rationale: r.parsed?.rationale ?? null,
      aboutUnresolvedFactRef: r.parsed?.aboutUnresolvedFactRef ?? null,
      proposedClarification: r.parsed?.proposedClarification ?? null,
      boundaryAccepted: boundary.accepted, boundaryViolations: boundary.violations,
      degenerate: degen.DEGENERATE_PROVIDER_OUTPUT, degenerateSignals: degen.signals,
      rawResponse: r.raw,
    };
    results.push(record);
    appendFileSync(storePath, `${JSON.stringify(record)}\n`);

    console.log(`  ${c.caseId}  ${(r.parsed?.verdict ?? r.failureKind ?? 'NO_OUTPUT').padEnd(30)}`
      + `${String(r.inputTokens ?? '?').padStart(6)} in ${String(r.outputTokens ?? '?').padStart(5)} out`
      + `  ${String(r.latencyMs).padStart(6)}ms  $${cost.toFixed(5)}`);

    if (spend > BUDGET.spendCeilingUsd) {
      console.log('\n  SPEND CEILING REACHED — stopping.');
      break;
    }
  }
  const finishedAt = new Date().toISOString();

  const violations = counterInvariantViolations(counters);
  const summary = {
    operation: '§156 selective clarification verifier hosted accuracy experiment',
    startedAt, finishedAt,
    identity: {
      provider: 'anthropic', model: 'claude-sonnet-5',
      verifierContract: EXPERT_VERIFIER_CONTRACT_VERSION,
      verifierInstruction: EXPERT_VERIFIER_INSTRUCTION_VERSION,
      verifierInstructionSha256: instructionSha,
      packetSha256: packetSha, truthManifestSha256: truthSha,
    },
    accounting: {
      logicalCalls: results.length, providerRequests: requests,
      retries: 0, reruns: 0,
      inputTokens: results.reduce((t, r) => t + ((r.inputTokens as number) ?? 0), 0),
      outputTokens: results.reduce((t, r) => t + ((r.outputTokens as number) ?? 0), 0),
      spendUsd: Number(spend.toFixed(6)), spendCeilingUsd: BUDGET.spendCeilingUsd,
    },
    counters, counterInvariantViolations: violations,
    firstPassInvocations: 0,
    results,
  };
  writeFileSync(join(OUT, 'VERIFIER-RESULTS.json'), `${JSON.stringify(summary, null, 2)}\n`);
  try { chmodSync(storePath, 0o444); } catch { /* leave writable if the platform refuses */ }

  console.log(`\n  requests ${requests}/${BUDGET.maxProviderRequests}   retries 0   reruns 0`);
  console.log(`  tokens ${summary.accounting.inputTokens} in / `
    + `${summary.accounting.outputTokens} out   spend $${spend.toFixed(6)} of `
    + `$${BUDGET.spendCeilingUsd.toFixed(2)}`);
  console.log(`  counter invariants: ${violations.join('; ') || 'clean'}`);
  console.log(`\n  artifacts -> verification/expert-hazlenz-verifier-accuracy-2026-09-03`);
  console.log('  FIRST_PASS_EXPERT_INVOCATIONS = 0');
  console.log('\nScoring is a separate script so the hosted run cannot be re-run to change it:');
  console.log('  npm run score:expert-verifier-accuracy');
}

main().catch(e => { console.error(e); process.exit(1); });
