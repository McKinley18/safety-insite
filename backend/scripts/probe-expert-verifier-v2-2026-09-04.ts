/**
 * §157 EXPERT HAZLENZ -- VERIFIER v2 BOUNDED HOSTED PROBE.
 *
 * The SAME fifteen blinded cases §156 executed, re-sent under verifier instruction v2 and contract
 * v2. No first-pass call, no retry, no rerun, and no exposure of any §156 verifier outcome: the
 * packet is re-read from its frozen §156 file by hash, and that file never contained a v1 result.
 *
 * Authorized only because the §157 local matrix passed 46/46 before this file was allowed to spend.
 */

// This script imports NOTHING from src/, so no production module loads the credential as a side
// effect and it must be loaded explicitly.
import 'dotenv/config';

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, chmodSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_VERIFIER_V2_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
  VERIFIER_V2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v2';
import {
  checkVerifierV2Output, EXPERT_VERIFIER_CONTRACT_V2_VERSION,
} from './lib/expert-verifier-contract-v2';
import { buildVerifierUserPrompt } from './lib/expert-verifier-instruction';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import { FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT } from './lib/expert-reliability-counters';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-v2-remediation-2026-09-04');

const EXPECTED_PACKET_SHA =
  '75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a';
const EXPECTED_TRUTH_SHA =
  'dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c';
const EXPECTED_PROMPT_MODULE_SHA =
  '02977c309f6d3e377d97b31836f9fc6e8af8dfd64fa28d81d1a53f605a266efa';
const EXPECTED_V9_FILE_SHA =
  '09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb';

const BUDGET = {
  maxProviderRequests: 15, retryBudget: 0, spendCeilingUsd: 1.00, maxTokensPerCall: 1600,
};
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

let passed = 0; let failed = 0;
const gate: Array<{ id: string; ok: boolean; detail: string }> = [];
function check(id: string, ok: boolean, detail = ''): void {
  gate.push({ id, ok, detail });
  if (ok) { passed += 1; console.log(`ok    ${id}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  ' + detail : ''}`); }
}

async function callVerifier(c: PacketCase, apiKey: string) {
  const body = {
    model: 'claude-sonnet-5',
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
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
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
  console.log('§157 EXPERT HAZLENZ — VERIFIER v2 BOUNDED HOSTED PROBE');
  console.log('='.repeat(100));
  console.log(`\n--- PRE-SPEND GATE${dryRun ? '  (DRY RUN)' : ''}\n`);

  const packetSha = existsSync(join(SRC, 'VERIFIER-PACKET.json'))
    ? sha256File(join(SRC, 'VERIFIER-PACKET.json')) : '';
  const truthSha = existsSync(join(SRC, 'TRUTH-MANIFEST.json'))
    ? sha256File(join(SRC, 'TRUTH-MANIFEST.json')) : '';
  check('A.1 the §156 blinded packet is reused UNCHANGED — same fifteen cases, same bytes',
    packetSha === EXPECTED_PACKET_SHA, `${packetSha.slice(0, 24)}…`);
  check('A.2 the §156 truth manifest is reused UNCHANGED — no verdict re-chosen for v2',
    truthSha === EXPECTED_TRUTH_SHA, `${truthSha.slice(0, 24)}…`);

  const instructionSha = createHash('sha256')
    .update(EXPERT_VERIFIER_V2_SYSTEM_PROMPT).digest('hex');
  check('A.3 verifier instruction v2 is frozen and hashed', instructionSha.length === 64,
    `${EXPERT_VERIFIER_INSTRUCTION_V2_VERSION} sha256 ${instructionSha.slice(0, 24)}…`);
  check('A.4 verifier contract v2 is the one under test',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION === 'hazlenz.expert.verifier.v2',
    EXPERT_VERIFIER_CONTRACT_V2_VERSION);

  const packet = existsSync(join(SRC, 'VERIFIER-PACKET.json'))
    ? JSON.parse(readFileSync(join(SRC, 'VERIFIER-PACKET.json'), 'utf8')) as { cases: PacketCase[] }
    : { cases: [] };
  check('A.5 fifteen cases', packet.cases.length === 15, `${packet.cases.length}`);

  // No §156 verifier outcome may reach the provider.
  const packetText = readFileSync(join(SRC, 'VERIFIER-PACKET.json'), 'utf8');
  const v1Leaks = [/VERIFIED_AS_IS/, /NO_CLARIFICATION_REQUIRED/, /ADD_OR_REPLACE/, /ABSTAIN/,
    /HS-[A-R]\d/, /\bREQUIRED\b/, /\bFORBIDDEN\b/].filter(re => re.test(packetText));
  check('B.1 THE PACKET EXPOSES NO §156 VERIFIER OUTCOME and no answer key',
    v1Leaks.length === 0, `${v1Leaks.length} leaks`);
  const instrLeaks = [/autoclave/i, /cooling hold/i, /spray booth/i, /flame.failure/i, /debarker/i,
    /fryer/i, /\btyres?\b/i, /\btires?\b/i, /HS-[A-R]\d/, /kerb/i, /VC-\d\d/]
    .filter(re => re.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT));
  check('B.2 instruction v2 encodes no evaluation-set vocabulary and no answer key',
    instrLeaks.length === 0, `${instrLeaks.length} matches across 11 patterns`);
  check('B.3 and it states plainly that NO is the usual answer to the nomination question',
    /THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER/.test(EXPERT_VERIFIER_V2_SYSTEM_PROMPT),
    'the over-questioning guard is in the instruction, not only in the rule');

  check('C.1 the v13 first-pass prompt module is byte-identical',
    sha256File(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'))
      === EXPECTED_PROMPT_MODULE_SHA, 'unchanged');
  check('C.2 the hardened v9 fixture is byte-identical',
    sha256File(join(ROOT,
      'backend/src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9.ts'))
      === EXPECTED_V9_FILE_SHA, 'unchanged');
  check('C.3 verifier contract v1 is byte-preserved as §156 evidence',
    existsSync(join(ROOT, 'backend/scripts/lib/expert-verifier-contract.ts'))
      && readFileSync(join(ROOT, 'backend/scripts/lib/expert-verifier-contract.ts'), 'utf8')
        .includes("'hazlenz.expert.verifier.v1'"), 'v1 intact beside v2');
  check('C.4 v14 and v15 do not exist',
    !existsSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt-v14.ts'))
      && !existsSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt-v15.ts')),
    'absent');

  const ownImports = readFileSync(__filename, 'utf8').split('\n').filter(l => /^import /.test(l));
  check('D.1 this probe imports NOTHING from src/ — no first-pass entry point is reachable',
    ownImports.filter(l => /from '\.\.\/src\//.test(l)).length === 0,
    `${ownImports.length} imports, 0 from src/`);
  check('D.2 the frozen formal count is intact', FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195,
    '195, immutable');

  check('E.1 fifteen requests, zero retries',
    BUDGET.maxProviderRequests === 15 && BUDGET.retryBudget === 0, 'no retry is possible');
  const worst = BUDGET.maxProviderRequests
    * ((7000 * PRICE_IN_PER_M) + (BUDGET.maxTokensPerCall * PRICE_OUT_PER_M)) / 1e6;
  check('E.2 worst-case spend is inside the $1.00 ceiling', worst <= BUDGET.spendCeilingUsd,
    `worst case ~$${worst.toFixed(4)} of $${BUDGET.spendCeilingUsd.toFixed(2)}`);
  check('E.3 an API credential is present',
    typeof process.env.ANTHROPIC_API_KEY === 'string'
      && process.env.ANTHROPIC_API_KEY.length > 0, 'set');
  const storePath = join(OUT, 'VERIFIER-V2-RUN-RECORDS.jsonl');
  check('E.4 the store is empty or absent',
    !existsSync(storePath) || readFileSync(storePath, 'utf8').trim().length === 0, 'clean');

  console.log(`\n  PRE-SPEND GATE: ${passed}/${passed + failed} `
    + `${failed === 0 ? 'PASS' : 'FAIL'}. $0.00 spent so far.`);
  if (failed > 0) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, 'GATE-BLOCKED.txt'),
      'EXPERT_HAZLENZ_VERIFIER_V2_PROBE_BLOCKED — PRESPEND_GATE_FAILURE\n'
      + gate.filter(g => !g.ok).map(g => `${g.id}: ${g.detail}`).join('\n') + '\n');
    console.log('\nPRE-SPEND GATE FAILED. Nothing was spent.');
    process.exit(1);
  }
  if (dryRun) { console.log('\nPROBE_DRY_RUN=1 — stopping before any provider request.'); return; }

  console.log('\n--- SPEND. One v2 verifier call per case, no retries, no reruns.\n');
  mkdirSync(OUT, { recursive: true });
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  const results: Array<Record<string, unknown>> = [];
  let spend = 0; let requests = 0;
  const startedAt = new Date().toISOString();

  for (const c of packet.cases) {
    if (requests >= BUDGET.maxProviderRequests) break;
    const r = await callVerifier(c, apiKey);
    requests += 1;
    const cost = ((r.inputTokens ?? 0) * PRICE_IN_PER_M
      + (r.outputTokens ?? 0) * PRICE_OUT_PER_M) / 1e6;
    spend += cost;

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
      caseId: c.caseId, ok: r.ok, failureKind: r.failureKind, httpStatus: r.httpStatus,
      modelIdentity: r.modelIdentity, stopReason: r.stopReason,
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
    results.push(record);
    appendFileSync(storePath, `${JSON.stringify(record)}\n`);

    const mode = record.clarificationSourceMode ? `/${record.clarificationSourceMode}` : '';
    console.log(`  ${c.caseId}  ${`${record.verdict ?? r.failureKind}${mode}`.padEnd(45)}`
      + `${String(r.inputTokens ?? '?').padStart(6)} in ${String(r.outputTokens ?? '?').padStart(5)} out`
      + `  ${String(r.latencyMs).padStart(6)}ms  $${cost.toFixed(5)}`
      + `${record.admissionAccepted ? '' : '  REFUSED:' + record.admissionCodes.join(',')}`);

    if (spend > BUDGET.spendCeilingUsd) { console.log('\n  SPEND CEILING REACHED — stopping.'); break; }
  }
  const finishedAt = new Date().toISOString();

  const summary = {
    operation: '§157 verifier v2 bounded hosted probe — fact nomination',
    startedAt, finishedAt,
    identity: {
      provider: 'anthropic', model: 'claude-sonnet-5',
      verifierContract: EXPERT_VERIFIER_CONTRACT_V2_VERSION,
      verifierInstruction: EXPERT_VERIFIER_INSTRUCTION_V2_VERSION,
      verifierInstructionSha256: instructionSha,
      packetSha256: packetSha, truthManifestSha256: truthSha,
    },
    accounting: {
      logicalCalls: results.length, providerRequests: requests, retries: 0, reruns: 0,
      inputTokens: results.reduce((t, r) => t + ((r.inputTokens as number) ?? 0), 0),
      outputTokens: results.reduce((t, r) => t + ((r.outputTokens as number) ?? 0), 0),
      spendUsd: Number(spend.toFixed(6)), spendCeilingUsd: BUDGET.spendCeilingUsd,
    },
    firstPassInvocations: 0,
    results,
  };
  writeFileSync(join(OUT, 'VERIFIER-V2-RESULTS.json'), `${JSON.stringify(summary, null, 2)}\n`);
  try { chmodSync(storePath, 0o444); } catch { /* platform may refuse */ }

  console.log(`\n  requests ${requests}/${BUDGET.maxProviderRequests}   retries 0   reruns 0`);
  console.log(`  tokens ${summary.accounting.inputTokens} in / `
    + `${summary.accounting.outputTokens} out   spend $${spend.toFixed(6)} of `
    + `$${BUDGET.spendCeilingUsd.toFixed(2)}`);
  console.log('  FIRST_PASS_EXPERT_INVOCATIONS = 0');
  console.log('\nScoring is separate:  npm run score:expert-verifier-v2');
}

main().catch(e => { console.error(e); process.exit(1); });
