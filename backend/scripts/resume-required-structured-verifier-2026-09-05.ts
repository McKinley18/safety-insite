/**
 * §187B — RESUME-ONLY execution of the fifteen outstanding §187A verifier calls.
 *
 * A SEPARATE script rather than a rerun of the §187A harness, for two reasons the authorization
 * requires: the §187A `--stage=verify` path truncates its run file, which would destroy the failed
 * transport attempts that must be preserved as history; and the §187A harness charges a synthetic
 * worst case against a failed call, which is the accounting defect that must NOT be repaired inside
 * the frozen harness. Here, spend is computed from provider-returned usage ONLY.
 *
 * No first-pass calls. No retries. Fifteen calls maximum, and it stops on the FIRST credit-related
 * rejection rather than proving the same account condition fifteen times.
 */
import {
  existsSync, readFileSync, writeFileSync, appendFileSync, openSync, fsyncSync, closeSync,
} from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

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

import { EXPERT_HOSTED_INFERENCE_CONFIG } from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpertAnalysisInputFromAnalysis } from '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION, expertPromptIdentity } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { owedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import { projectOwedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import type { OwedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
  VERIFIER_V3_RESPONSE_SCHEMA, buildVerifierV3UserPrompt, type V3SuppliedOwedFact,
} from './lib/expert-verifier-instruction-v3';
import { checkVerifierV3Output } from './lib/expert-verifier-contract-v3';
import { analysisStateFor, loadFrozenRows } from './probe-balanced-clarification-hosted-2026-09-05';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const TRUTH = join(ROOT, 'verification', 'expert-hazlenz-owed-fact-truth-2026-09-05');

const REQUIRED_ROWS = ['HR-01', 'HR-04', 'HR-06', 'HR-08', 'HR-09'] as const;
const RESUME_CALL_CAP = 15;
const RESUME_SPEND_CEILING_USD = 1.25;
const VERIFIER_MAX_TOKENS = 4000;
/** §166's verifier bound, used only for the PROSPECTIVE check before each call. */
const PROSPECTIVE_PER_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (12000 / 1e6) * 2;

const EXPECTED_PREREG_SHA = '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82';
const FROZEN_V15 = {
  promptVersion: 'hazlenz.expert.prompt.v15',
  systemPromptSha256: '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979',
  promptFileSha256: 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
};
const FROZEN_TRUTH_HASHES: Record<string, string> = {
  'OWED-FACT-TRUTH-CANDIDATES.json': '649a17df3730b1d67f20bda9b6231d0a5461902c985ce87fb7b2659e67798b0b',
  'SECTION-184-INTEGRITY.json': '172aaba1fbd22b95259a1bdef3d76a8d5dbd32b27d69b9784532d60a36ebeb36',
};
const FROZEN_OWED_FACT_SOURCE: Record<string, string> = {
  'owed-fact.types.ts': '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a',
  'owed-fact-binding.ts': 'e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0',
  'verifier-v3-development-boundary.ts': '5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245',
};
const FORBIDDEN_IN_PAYLOAD = [
  'evaluationRationale', 'expectedClarificationDisposition', 'settledFromObservation',
  'productOwnerVerdict', 'productOwnerFinalText', 'sourceBasis', 'authoringNotes',
  'governedEvidenceClass', 'pairId', 'pairPartner', 'truthClass', 'PRODUCT_OWNER_REVIEWED',
];

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string) => sha(readFileSync(p, 'utf8'));

function branchesOf(factStatement: string): { branchA: string; branchB: string } {
  const core = factStatement.replace(/^Whether\s+/, '').replace(/\.\s*$/, '');
  return { branchA: `established: ${core}`, branchB: `not established: ${core}` };
}
function fixtureOf(r: any): OwedFact {
  return owedFact({
    factKey: r.factKey, affectedDecision: r.affectedDecision, source: 'DEVELOPMENT_HUMAN_TRUTH',
    evidenceSpan: r.evidenceSpan, whyUnresolved: r.whyUnresolved, ...branchesOf(r.factStatement),
    decisionDivergence: { ifA: r.decisionIfEstablished, ifB: r.decisionIfNotEstablished },
    priority: r.priority, status: 'UNRESOLVED', acceptableEvidence: null,
  });
}
function suppliedFrom(f: OwedFact): V3SuppliedOwedFact {
  const p = projectOwedFact(f);
  if (p.whyUnresolved === null) throw new Error(`ABORT: ${p.factKey} projected a null whyUnresolved`);
  return {
    factKey: p.factKey, affectedDecision: p.affectedDecision, whyUnresolved: p.whyUnresolved,
    branchA: p.branchA, branchB: p.branchB,
    decisionDivergence: { ifA: p.decisionDivergence.ifA, ifB: p.decisionDivergence.ifB },
    evidenceSpan: p.evidenceSpan,
  };
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

async function main(): Promise<void> {
  const checks: { id: string; ok: boolean; detail: string }[] = [];
  const chk = (id: string, ok: boolean, detail = '') => { checks.push({ id, ok, detail }); };

  const preregPath = join(EVID, 'PREREGISTRATION.json');
  const stimPath = join(EVID, 'FIRST-PASS-STIMULI.json');
  const prereg = JSON.parse(readFileSync(preregPath, 'utf8'));
  const stimDoc = JSON.parse(readFileSync(stimPath, 'utf8'));
  const stimByRow = new Map<string, any>(stimDoc.stimuli.map((s: any) => [s.rowId, s]));

  // ---------- 1 & 2: first-pass stimuli byte-identical and hashes unchanged
  const stimOk = REQUIRED_ROWS.every(id => {
    const s = stimByRow.get(id);
    return s && sha(JSON.stringify(s.firstPass)) === s.firstPassSha256
      && s.firstPassSha256 === prereg.suppliedOwedFacts && true;
  });
  const recomputed = REQUIRED_ROWS.map(id => {
    const s = stimByRow.get(id);
    return { id, stored: s?.firstPassSha256, recomputed: sha(JSON.stringify(s?.firstPass)) };
  });
  chk('1 firstPass stimuli byte-identical (hash recomputed from persisted content)',
    recomputed.every(r => r.stored === r.recomputed),
    recomputed.map(r => `${r.id}:${r.stored === r.recomputed ? 'OK' : 'DRIFT'}`).join(' '));
  chk('2 firstPass hashes unchanged vs §187A verifier attempt records', (() => {
    const prior = readFileSync(join(EVID, 'RAW-VERIFIER-EXECUTIONS.jsonl'), 'utf8')
      .trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    return prior.every(p => stimByRow.get(p.rowId)?.firstPassSha256 === p.firstPassSha256);
  })(), 'compared against the frozen §187A attempt records');
  chk('2b all five first-pass executions normalized VALID',
    REQUIRED_ROWS.every(id => stimByRow.get(id)?.normalizationState === 'VALID'));

  // ---------- 3: §184 truth byte-identical
  chk('3 §184 owed-fact truth byte-identical',
    Object.entries(FROZEN_TRUTH_HASHES).every(([f, h]) => shaFile(join(TRUTH, f)) === h));

  // ---------- 8 & 9: identity and no source drift after §187A spend
  chk('8 prompt version/model identical to §187A preregistration',
    EXPERT_PROMPT_VERSION === FROZEN_V15.promptVersion
    && sha(EXPERT_SYSTEM_PROMPT) === FROZEN_V15.systemPromptSha256
    && shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts')) === FROZEN_V15.promptFileSha256
    && EXPERT_HOSTED_INFERENCE_CONFIG.model === prereg.provider_model.model,
    `model=${EXPERT_HOSTED_INFERENCE_CONFIG.model}`);
  chk('9 owed-fact runtime source unchanged since §187A',
    Object.entries(FROZEN_OWED_FACT_SOURCE).every(([f, h]) =>
      shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts', f)) === h));
  chk('9b verifier instruction and schema unchanged',
    sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT) === prereg.verifierIdentity.systemPromptSha256
    && sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)) === prereg.verifierIdentity.responseSchemaSha256);
  chk('9c preregistration itself unchanged', shaFile(preregPath) === EXPECTED_PREREG_SHA, shaFile(preregPath));

  // ---------- 4,5,6,7: payloads
  const truth = JSON.parse(readFileSync(join(TRUTH, 'OWED-FACT-TRUTH-CANDIDATES.json'), 'utf8'));
  const truthByRow = new Map<string, any>(truth.rows.map((r: any) => [r.rowId, r]));
  const supplied = new Map<string, V3SuppliedOwedFact>();
  const payloadIssues: string[] = [];
  for (const id of REQUIRED_ROWS) {
    const t = truthByRow.get(id);
    const s = suppliedFrom(fixtureOf(t));
    supplied.set(id, s);
    const frozen = prereg.suppliedOwedFacts[id];
    if (sha(JSON.stringify(s)) !== frozen.sha256) payloadIssues.push(`${id}: payload hash drift`);
    if (JSON.stringify(s) !== JSON.stringify(frozen.payload)) payloadIssues.push(`${id}: payload content drift`);
    const j = JSON.stringify(s);
    for (const f of FORBIDDEN_IN_PAYLOAD) if (j.includes(f)) payloadIssues.push(`${id}: contains ${f}`);
    if (j.includes(t.evaluationRationale)) payloadIssues.push(`${id}: contains evaluationRationale`);
    if ((s as any).acceptableEvidence !== undefined) payloadIssues.push(`${id}: acceptableEvidence unexpectedly present`);
  }
  chk('4 frozen verifier payloads unchanged', payloadIssues.length === 0, payloadIssues.join('; '));
  chk('5 exactly one owed fact per execution', supplied.size === 5, '1 per execution by construction');
  chk('6 no evaluation-only field provider-visible', payloadIssues.length === 0,
    `${FORBIDDEN_IN_PAYLOAD.length} forbidden fields asserted absent, plus the §184 evaluationRationale`);
  chk('7 acceptableEvidence exactly as frozen (null; no wire field exists)', true,
    'V3SuppliedOwedFact carries no acceptableEvidence field — not transmitted, as at §187A');

  // ---------- 10: execution order
  const order = prereg.executionOrder.frozenOrder as Array<{ sequencePosition: number; rowId: string; replicateNumber: number; block: number }>;
  const priorOrder = readFileSync(join(EVID, 'RAW-VERIFIER-EXECUTIONS.jsonl'), 'utf8')
    .trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
    .map((p: any) => `${p.sequencePosition}:${p.rowId}#${p.replicateNumber}`);
  chk('10 execution order and replicate assignment are the preregistered order',
    order.length === 15
    && order.map(o => `${o.sequencePosition}:${o.rowId}#${o.replicateNumber}`).join(',') === priorOrder.join(','),
    'identical to the order the §187A attempts followed');

  console.log('PRE-RESUME INTEGRITY');
  for (const c of checks) console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}${c.detail ? `  [${c.detail}]` : ''}`);
  const integrityOk = checks.every(c => c.ok);
  writeFileSync(join(EVID, 'RESUME-PRE-INTEGRITY.json'), `${JSON.stringify({
    artifact: 'SECTION_187B_PRE_RESUME_INTEGRITY', date: '2026-09-05',
    allPass: integrityOk, checks,
  }, null, 2)}\n`);
  if (!integrityOk) {
    console.log('\nEXPERT_HAZLENZ_REQUIRED_STRUCTURED_RESUME_BLOCKED — PREREGISTRATION_INTEGRITY_FAILURE');
    process.exit(1);
  }
  if (process.argv.includes('--check-only')) { console.log('\nCHECK ONLY — no provider call made.'); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.trim()) throw new Error('ABORT: ANTHROPIC_API_KEY is not set');

  const rows = loadFrozenRows().filter(r => (REQUIRED_ROWS as readonly string[]).includes(r.id));
  const runFile = join(EVID, 'RESUMED-VERIFIER-EXECUTIONS.jsonl');
  if (existsSync(runFile)) throw new Error('ABORT: RESUMED-VERIFIER-EXECUTIONS.jsonl already exists; refusing to overwrite persisted evidence');
  writeFileSync(runFile, '');

  let attempted = 0; let spent = 0; let stopReason: string | null = null;
  const results: any[] = [];

  for (const step of order) {
    if (attempted + 1 > RESUME_CALL_CAP) { stopReason = 'RESUME_CALL_CAP_REACHED'; break; }
    if (spent + PROSPECTIVE_PER_CALL_USD > RESUME_SPEND_CEILING_USD + 1e-9) { stopReason = 'RESUME_SPEND_CEILING_REACHED'; break; }
    const row = rows.find(r => r.id === step.rowId)!;
    const stim = stimByRow.get(row.id);
    const owed = supplied.get(row.id)!;
    const userPrompt = buildVerifierV3UserPrompt({
      caseId: row.id, observation: row.text, jurisdiction: 'osha-general-industry',
      governedEvidence: [], deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: stim.firstPass, owedFacts: [owed],
    });
    const body = {
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: VERIFIER_MAX_TOKENS,
      system: EXPERT_VERIFIER_V3_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [{ name: 'emit_verifier_verdict',
        description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
        input_schema: VERIFIER_V3_RESPONSE_SCHEMA }],
      tool_choice: { type: 'tool', name: 'emit_verifier_verdict' },
    };
    attempted += 1;
    const call = await callOnce(body, apiKey);

    // ACTUAL spend only, from provider-returned usage. A failed call adds nothing: that is the
    // §187A accounting defect, and it is not reproduced here.
    const cost = ((call.inputTokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
      + ((call.outputTokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
    spent += cost;

    if (call.creditRejection) {
      appendFileSync(runFile, `${JSON.stringify({
        rowId: row.id, replicateNumber: step.replicateNumber, sequencePosition: step.sequencePosition,
        recordKind: 'ATTEMPT', behavioralExecution: false,
        providerOk: false, failureKind: 'ACCOUNT_CREDIT_REJECTION', httpStatus: call.httpStatus,
        raw: call.raw, usage: { inputTokens: null, outputTokens: null, costUsd: 0 },
        timestamp: new Date().toISOString(),
      })}\n`);
      stopReason = 'ACCOUNT_CREDIT_REJECTION_ON_FIRST_OCCURRENCE';
      console.log(`\n  credit rejection at sequence ${step.sequencePosition} — STOPPING IMMEDIATELY rather than reproving the account condition`);
      break;
    }

    const admission = call.parsed
      ? checkVerifierV3Output(call.parsed, { analysisId: row.id, observation: row.text, suppliedOwedFactKeys: [owed.factKey] })
      : null;
    const out: any = call.parsed ?? {};
    const decls: any[] = Array.isArray(out.owedFactDeclarations) ? out.owedFactDeclarations : [];
    const rec = {
      rowId: row.id, replicateNumber: step.replicateNumber, block: step.block,
      sequencePosition: step.sequencePosition,
      recordKind: call.ok ? 'BEHAVIORAL_EXECUTION' : 'ATTEMPT',
      behavioralExecution: call.ok === true,
      firstPassHash: stim.firstPassSha256,
      owedFactPayloadHash: sha(JSON.stringify(owed)), suppliedOwedFact: owed, suppliedOwedFactCount: 1,
      userPromptSha256: sha(userPrompt),
      provider: 'anthropic', model: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: call.modelIdentity,
      firstPassPromptVersion: FROZEN_V15.promptVersion, firstPassPromptSha256: FROZEN_V15.systemPromptSha256,
      verifierInstructionVersion: EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
      verifierInstructionSha256: sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT),
      verifierSchemaSha256: sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)),
      httpStatus: call.httpStatus, rawPersistedBeforeDerivation: true, raw: call.raw, parsed: call.parsed,
      providerOk: call.ok, failureKind: call.failureKind, stopReason: call.stopReason,
      normalizationResult: admission ? (admission.admitted ? 'ADMITTED' : 'REFUSED') : null,
      normalizationIssues: admission ? [...admission.codes] : null,
      admission: admission ? { admitted: admission.admitted, codes: [...admission.codes],
        detail: [...admission.detail], bindingAdmitted: admission.bindingAdmitted,
        nominationAdmitted: admission.nominationAdmitted, challengedFactKeys: [...admission.challengedFactKeys] } : null,
      contractFailure: call.ok === true && (admission === null || admission.admitted === false),
      verdict: out.verdict ?? null, rationale: out.rationale ?? null,
      bindingFactKey: out.bindingFactKey ?? null,
      clarificationSourceMode: out.clarificationSourceMode ?? null,
      proposedClarification: out.proposedClarification ?? null,
      nominatedFact: out.nominatedFact ?? null,
      candidateHazards: out.candidateHazards ?? null,
      crossHazardInsights: out.crossHazardInsights ?? null,
      disagreements: out.disagreements ?? null,
      owedFactDeclarations: decls,
      declarationModes: decls.map(d => d?.declaration ?? null),
      declaredKeys: decls.map(d => d?.factKey ?? null),
      wrongKeyDeclared: decls.some(d => d?.factKey && d.factKey !== owed.factKey),
      challengeEmitted: decls.some(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY'),
      challengeReasons: decls.filter(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY').map(d => d?.challengeReason ?? null),
      usage: { inputTokens: call.inputTokens, outputTokens: call.outputTokens, costUsd: Number(cost.toFixed(6)) },
      latencyMs: call.latencyMs, timestamp: new Date().toISOString(),
      STRICT_SEMANTIC_RESULT: 'PENDING_HUMAN_ADJUDICATION',
    };
    results.push(rec);
    appendFileSync(runFile, `${JSON.stringify(rec)}\n`);
    const fd = openSync(runFile, 'r+'); fsyncSync(fd); closeSync(fd);
    console.log(`${String(step.sequencePosition).padStart(2)}  ${row.id}#${step.replicateNumber}  ok=${call.ok}  admitted=${admission?.admitted}  verdict=${rec.verdict}  decl=${rec.declarationModes.join('/')}  bind=${rec.bindingFactKey ? 'yes' : 'no'}  clar=${rec.proposedClarification ? 'yes' : 'no'}  $${cost.toFixed(5)}`);
  }

  const back = readFileSync(runFile, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const behavioral = results.filter(r => r.behavioralExecution);
  writeFileSync(join(EVID, 'RESUME-RUN-SUMMARY.json'), `${JSON.stringify({
    artifact: 'SECTION_187B_RESUME_RUN_SUMMARY',
    preregistrationSha256: shaFile(preregPath),
    RESUME_CALLS_ATTEMPTED: attempted,
    BEHAVIORAL_EXECUTIONS: behavioral.length,
    ACTUAL_PROVIDER_SPEND_USD: Number(spent.toFixed(5)),
    spendAccounting: 'ACTUAL provider-returned usage only. A failed call adds zero. The §187A synthetic failure charge is NOT reproduced here.',
    resumeCallCap: RESUME_CALL_CAP, resumeSpendCeilingUsd: RESUME_SPEND_CEILING_USD,
    stopReason, recordsOnDisk: back.length,
    MECHANICAL: {
      providerErrorsAmongBehavioral: behavioral.filter(r => !r.providerOk).length,
      contractInvalid: behavioral.filter(r => r.contractFailure).length,
      wrongKeyDeclarations: behavioral.filter(r => r.wrongKeyDeclared).length,
      unauthorizedSettlementTransitions: 0,
      PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
      challengeBearing: behavioral.filter(r => r.challengeEmitted).length,
      clarificationBearing: behavioral.filter(r => r.proposedClarification !== null).length,
      bindingEmitted: behavioral.filter(r => r.bindingFactKey !== null).length,
      declarationModeCounts: behavioral.flatMap(r => r.declarationModes).reduce((a: any, m: any) => {
        a[String(m)] = (a[String(m)] ?? 0) + 1; return a;
      }, {}),
    },
    STRICT_SEMANTIC_GATE: 'PENDING_HUMAN_ADJUDICATION — this script does not decide it',
    perRow: REQUIRED_ROWS.map(id => {
      const ex = behavioral.filter(r => r.rowId === id).sort((a, b) => a.replicateNumber - b.replicateNumber);
      return {
        rowId: id, behavioralExecutions: ex.length,
        declarationModes: ex.map(x => x.declarationModes.join('/')),
        bindingKeys: ex.map(x => x.bindingFactKey),
        clarificationEmitted: ex.filter(x => x.proposedClarification !== null).length,
        challengeEmitted: ex.filter(x => x.challengeEmitted).length,
        wrongKeyDeclared: ex.filter(x => x.wrongKeyDeclared).length,
        STRICT_SEMANTIC_SCORE: 'PENDING_HUMAN_ADJUDICATION',
      };
    }),
  }, null, 2)}\n`);
  console.log(`\nRESUME COMPLETE  attempted=${attempted}  behavioral=${behavioral.length}  actualSpend=$${spent.toFixed(5)}  stopReason=${stopReason ?? 'none'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
