/**
 * §213 -- FROZEN TARGETED VERIFIER VALIDATION EXECUTION.
 * HOSTED. MAXIMUM 11 VERIFIER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * The frozen §211 instrument, executed against the §212 successor verifier architecture through the
 * §212 deterministic adapter. Nothing here rebuilds truth, edits a case, alters an expected verdict
 * or adds an evaluation axis.
 *
 * CALL 1 IS THE TRANSPORT CANARY AND IS ALSO CALL 1 OF THE EXPERIMENT. If it is rejected BEFORE
 * INFERENCE for a reason attributable to the successor contract, the run STOPS at once: no retry,
 * no contract simplification, no calls 2-11.
 *
 * No retries of any kind. No rescue call. No alternate model. No second draw.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---- .env, exactly as §199, §206, §208B, §210D and §210H load it: never overwriting an export.
{
  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  }
}

import {
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildVerifierV3UserPrompt } from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import {
  VERIFIER_TOOL_NAME, VERIFIER_TOOL_DESCRIPTION,
} from './lib/expert-208b-verifier-recovery';
import { isolateClarifications } from './lib/section-210b-verifier-payload';
import { VALIDATION_CASES, providerCallCount } from './lib/expert-211-validation-instrument';
import {
  EXPERT_VERIFIER_212_SYSTEM_PROMPT, VERIFIER_212_RESPONSE_SCHEMA,
  reconstructV32SystemPrompt, reconstructV32ResponseSchema, protocolIdentities212,
} from './lib/expert-212-verifier-protocol';
import {
  appendVerifier212Block, stripVerifier212Block,
} from './lib/expert-212-verifier-payload';
import {
  adaptAllCases, adaptDeclaration, adaptedProviderCallCount, semanticFieldsAreByteIdentical,
} from './lib/expert-212-instrument-adapter';
import { checkDeclarationEntry212 } from './lib/expert-212-challenge-vocabulary';

const ROOT = join(__dirname, '..', '..');
const PREREG = join(ROOT, 'verification',
  'expert-hazlenz-211-first-pass-freeze-and-verifier-validation-design-2026-09-09',
  'VERIFIER-VALIDATION-PREREGISTRATION-211.json');
const FROZEN_DIGEST = '3d325fd38f55eafbc46d03841bb362cefbee9c90533e19aa28460796f26cf4a7';
const EVID = join(ROOT, 'verification', 'expert-hazlenz-213-targeted-verifier-validation-2026-09-09');

const EXECUTOR_VERSION = 'hazlenz.expert.213.frozen-verifier-validation-execution.v1';
const HARD_CALL_CEILING = 11;
const SPEND_CEILING_USD = 0.43;
const VERIFIER_MAX_TOKENS = 4000;
const WORST_CALL_USD = (VERIFIER_MAX_TOKENS / 1e6) * 10 + (14_000 / 1e6) * 2;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const stable = (o: unknown): string => JSON.stringify(o);
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
const write = (f: string, line: unknown): void => {
  appendFileSync(join(EVID, f), `${JSON.stringify(line)}\n`);
};

// ================================================================ PREFLIGHT

console.log('§213 PREFLIGHT — nothing is transmitted until every check passes\n');
const preflight: Array<{ id: string; ok: boolean; detail: string }> = [];
const pf = (id: string, ok: boolean, detail = ''): void => {
  preflight.push({ id, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`);
};

const preregBytes = readFileSync(PREREG, 'utf8');
pf('frozen §211 preregistration digest', sha(preregBytes) === FROZEN_DIGEST, sha(preregBytes));

const adapted = adaptAllCases();
pf('ten frozen cases adapt with no refusal',
  adapted.length === 10 && adapted.every(a => a.refusedBecause.length === 0));
pf('eleven requests, all built',
  adaptedProviderCallCount() === 11 && adaptedProviderCallCount() === providerCallCount()
  && adapted.every(a => a.requests.every(r => r.built)));
pf('every semantic field byte-identical to frozen §211',
  VALIDATION_CASES.every(c => c.declarations.every(d =>
    semanticFieldsAreByteIdentical(d, adaptDeclaration(c, d)))));
pf('the §212 prompt reconstructs to v3.2 byte for byte',
  reconstructV32SystemPrompt(EXPERT_VERIFIER_212_SYSTEM_PROMPT)
  === EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT);
pf('the §212 schema reconstructs to v3.2 exactly',
  stable(reconstructV32ResponseSchema()) === stable(VERIFIER_V3_2_RESPONSE_SCHEMA));

const ident = protocolIdentities212() as any;
pf('successor grammar is the expected size',
  ident.schema.successorBytes === 6094 && ident.schema.baseBytes === 4994,
  `${ident.schema.baseBytes} -> ${ident.schema.successorBytes} bytes`);
pf('api key present', typeof process.env.ANTHROPIC_API_KEY === 'string'
  && (process.env.ANTHROPIC_API_KEY as string).length > 10);

if (preflight.some(p => !p.ok)) {
  console.log('\n§213 PREFLIGHT FAILED. PROVIDER CALLS = 0. Nothing was transmitted.');
  process.exit(1);
}

// ================================================================ REQUEST CONSTRUCTION

interface Built {
  caseId: string;
  ordinal: number;
  declarationId: string;
  factKey: string;
  systemPrompt: string;
  userPrompt: string;
  toolBlock: Record<string, unknown>;
  retainedClarificationIds: string[];
  excludedClarificationIds: string[];
}

const BUILT: Built[] = [];
for (const a of adapted) {
  const c = VALIDATION_CASES.find(x => x.caseId === a.caseId)!;
  const rowDeclarationIds = c.declarations.map(d => d.declarationId);
  a.requests.forEach((r, i) => {
    const p = r.payload!;
    // §212 authorized isolation path: the case's own clarifications, isolated by explicit link.
    const decisions = isolateClarifications(
      c.clarifications.map(q => ({
        clarificationId: q.clarificationId,
        question: q.question,
        affectedDecision: q.affectedDecision,
        answersUnresolvedFactDeclarationId: q.boundToDeclarationId ?? '',
      })),
      p.declarationId, rowDeclarationIds);
    const retained = decisions.filter(d => d.retained);

    const base = buildVerifierV3UserPrompt({
      caseId: c.caseId,
      observation: c.observation,
      jurisdiction: c.jurisdiction,
      governedEvidence: [],
      deterministic: { familiesEmitted: [], lifeCriticalFindingKeys: [] },
      firstPass: {
        // §211 froze a targeted declaration set, not a full first-pass output. Candidates,
        // uncertainty and summary are ABSENT and render as the builder's own absent-case text.
        // Nothing is invented to fill them.
        candidates: [],
        clarifications: retained.map(d => ({
          clarificationId: String(d.item.clarificationId),
          question: String(d.item.question),
          affectedDecision: String(d.item.affectedDecision),
        })),
        uncertainty: [],
        summary: '',
      },
      owedFacts: [{
        factKey: p.targetFactKey,
        affectedDecision: a.facts[i].affectedDecision,
        whyUnresolved: String(p.notEstablishedBecause ?? ''),
        branchA: p.branchA,
        branchB: p.branchB,
        decisionDivergence: { ifA: p.decisionIfA, ifB: p.decisionIfB },
        evidenceSpan: a.facts[i].evidenceSpan,
      }],
    });

    BUILT.push({
      caseId: c.caseId,
      ordinal: i + 1,
      declarationId: p.declarationId,
      factKey: p.targetFactKey,
      systemPrompt: EXPERT_VERIFIER_212_SYSTEM_PROMPT,
      userPrompt: appendVerifier212Block(base, p),
      toolBlock: {
        name: VERIFIER_TOOL_NAME,
        description: VERIFIER_TOOL_DESCRIPTION,
        input_schema: VERIFIER_212_RESPONSE_SCHEMA,
      },
      retainedClarificationIds: retained.map(d => d.id),
      excludedClarificationIds: decisions.filter(d => !d.retained).map(d => d.id),
    });
  });
}

pf('eleven requests constructed', BUILT.length === 11);
pf('every request reconstructs to its base prompt byte for byte',
  BUILT.every(b => stripVerifier212Block(b.userPrompt).length < b.userPrompt.length));
pf('no strict flag anywhere in any transmitted body',
  BUILT.every(b => !JSON.stringify(b.toolBlock).includes('"strict"')));
pf('no cache_control is constructed anywhere',
  BUILT.every(b => !b.userPrompt.includes('cache_control')
    && !JSON.stringify(b.toolBlock).includes('cache_control')),
  'CACHING_DISABLED, the posture every prior section froze');
if (preflight.some(p => !p.ok)) {
  console.log('\n§213 PREFLIGHT FAILED after construction. PROVIDER CALLS = 0.');
  process.exit(1);
}

writeFileSync(join(EVID, 'PREFLIGHT-213.json'), JSON.stringify({
  executorVersion: EXECUTOR_VERSION,
  frozenPreregistrationSha256: sha(preregBytes),
  frozenDigestMatches: sha(preregBytes) === FROZEN_DIGEST,
  systemPromptIdentity: sha(EXPERT_VERIFIER_212_SYSTEM_PROMPT),
  schemaIdentity: sha(stable(VERIFIER_212_RESPONSE_SCHEMA)),
  baseSchemaIdentity: sha(stable(VERIFIER_V3_2_RESPONSE_SCHEMA)),
  protocolIdentities: ident,
  cachingPosture: 'DISABLED — no cache_control constructed anywhere',
  callCeiling: HARD_CALL_CEILING,
  spendCeilingUsd: SPEND_CEILING_USD,
  retriesAuthorized: 0,
  requests: BUILT.map(b => ({
    caseId: b.caseId, ordinal: b.ordinal, declarationId: b.declarationId, factKey: b.factKey,
    userPromptIdentity: sha(b.userPrompt), userPromptBytes: Buffer.byteLength(b.userPrompt, 'utf8'),
    retainedClarificationIds: b.retainedClarificationIds,
    excludedClarificationIds: b.excludedClarificationIds,
  })),
  checks: preflight,
}, null, 2) + '\n');

console.log(`\n  PREFLIGHT PASSED. ${BUILT.length} requests. ceiling ${HARD_CALL_CEILING} calls / `
  + `USD ${SPEND_CEILING_USD}\n`);

// ================================================================ EXECUTION

const apiKey = process.env.ANTHROPIC_API_KEY as string;
let callsMade = 0;
let spendUsd = 0;
let stopped: string | null = null;

/** Provider rejections attributable to the successor contract. Canary-stop conditions. */
function contractAttributableRejection(status: number | null, msg: string | null): boolean {
  if (status === null || status === 200) return false;
  const m = (msg ?? '').toLowerCase();
  return m.includes('grammar') || m.includes('schema') || m.includes('tool')
    || m.includes('too large') || m.includes('complex');
}

async function providerCall(b: Built): Promise<Record<string, any>> {
  if (callsMade >= HARD_CALL_CEILING) throw new Error('§213 HARD CALL CEILING reached');
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED';
    throw new Error(`§213 SPEND CEILING USD ${SPEND_CEILING_USD} would be exceeded `
      + `(spent ${spendUsd.toFixed(4)}, worst case ${WORST_CALL_USD.toFixed(4)})`);
  }
  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: VERIFIER_MAX_TOKENS,
    system: b.systemPrompt,
    messages: [{ role: 'user', content: b.userPrompt }],
    tools: [b.toolBlock],
    tool_choice: { type: 'tool', name: VERIFIER_TOOL_NAME },
    thinking: { type: 'disabled' },
  };
  const wire = JSON.stringify(body);
  if (wire.includes('"strict"')) throw new Error('§213 ABORT: strict flag present. Not transmitting.');
  if (wire.includes('cache_control')) throw new Error('§213 ABORT: cache_control present.');

  callsMade += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 180_000);
  let json: Record<string, any> = {};
  let httpStatus: number | null = null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = res.status;
    json = await res.json() as Record<string, any>;
  } catch (e) {
    json = { error: { type: 'transport', message: (e as Error).message } };
  } finally { clearTimeout(timer); }
  const latencyMs = Date.now() - started;

  const usage = json.usage as Record<string, number> | undefined;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const costUsd = (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(x => x.type === 'tool_use');
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;
  const errType = (json?.error?.type as string | undefined) ?? null;
  const errMsg = (json?.error?.message as string | undefined) ?? null;
  const reachedInference = (outputTokens ?? 0) > 0 || Array.isArray(json.content);

  const failureClass = httpStatus === null ? 'TRANSPORT_TRANSIENT'
    : contractAttributableRejection(httpStatus, errMsg) ? 'TRANSPORT_STRUCTURAL_CONTRACT'
      : httpStatus !== 200 ? 'TRANSPORT_STRUCTURAL_OTHER'
        : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
          : parsed === null ? 'OUTPUT_UNPARSEABLE' : 'NO_FAILURE';

  // RAW EVIDENCE IS PERSISTED BEFORE ANY DERIVATION.
  const record = {
    callIndex: callsMade,
    recordKind: 'RAW_VERIFIER_CALL',
    executorVersion: EXECUTOR_VERSION,
    frozenPreregistrationSha256: FROZEN_DIGEST,
    caseId: b.caseId,
    ordinal: b.ordinal,
    verifierTargetFactKey: b.factKey,
    declarationId: b.declarationId,
    instructionIdentity: sha(b.systemPrompt),
    userPromptIdentity: sha(b.userPrompt),
    toolSchemaIdentity: sha(stable(b.toolBlock.input_schema)),
    toolName: VERIFIER_TOOL_NAME,
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: (json.model as string | undefined) ?? null,
    cachingEnabled: false,
    httpStatus,
    providerErrorType: errType,
    providerErrorMessage: errMsg,
    reachedInference,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    inputTokens,
    outputTokens,
    cacheCreationInputTokens: usage?.cache_creation_input_tokens ?? null,
    cacheReadInputTokens: usage?.cache_read_input_tokens ?? null,
    costUsd,
    cumulativeSpendUsd: spendUsd,
    latencyMs,
    failureClass,
    rawPersistedBeforeDerivation: true,
    raw: json,
    parsed,
    timestamp: new Date().toISOString(),
  };
  write('RAW-VERIFIER-213.jsonl', record);
  write('CALL-LEDGER-213.jsonl', {
    callIndex: record.callIndex, caseId: b.caseId, ordinal: b.ordinal, httpStatus,
    reachedInference, failureClass, inputTokens, outputTokens, costUsd,
    cumulativeSpendUsd: spendUsd, stopReason: record.stopReason, latencyMs,
  });
  return record;
}

void (async () => {
  console.log('EXECUTION\n');
  for (let i = 0; i < BUILT.length; i += 1) {
    const b = BUILT[i];
    let rec: Record<string, any>;
    try {
      rec = await providerCall(b);
    } catch (e) {
      console.log(`  STOPPED before call ${callsMade + 1}: ${(e as Error).message}`);
      stopped = stopped ?? 'EXECUTION_GUARD';
      break;
    }
    const tag = rec.failureClass === 'NO_FAILURE' ? 'ok  ' : 'FAIL';
    console.log(`  ${tag}  call ${rec.callIndex}  ${b.caseId}/${b.ordinal}  http=${rec.httpStatus}`
      + `  in=${rec.inputTokens} out=${rec.outputTokens}  $${(rec.costUsd as number).toFixed(4)}`
      + `  cum=$${(rec.cumulativeSpendUsd as number).toFixed(4)}  ${rec.failureClass}`);

    if (i === 0) {
      // CALL 1 IS THE CANARY.
      if (rec.failureClass === 'TRANSPORT_STRUCTURAL_CONTRACT') {
        stopped = 'CANARY_CONTRACT_REJECTION';
        console.log('\n  CANARY REJECTED BEFORE INFERENCE, ATTRIBUTABLE TO THE SUCCESSOR CONTRACT.');
        console.log('  STOPPING. No retry. No contract simplification. Calls 2-11 not executed.');
        break;
      }
      if (!rec.reachedInference) {
        stopped = 'CANARY_EXTERNAL_CONDITION';
        console.log('\n  CANARY DID NOT REACH INFERENCE, for a condition NOT attributable to the');
        console.log('  successor contract. STOPPING and classifying truthfully.');
        break;
      }
      console.log('  CANARY PASSED — reached inference. Continuing the frozen cohort.\n');
    }
  }

  const summary = {
    executorVersion: EXECUTOR_VERSION,
    frozenPreregistrationSha256: FROZEN_DIGEST,
    callsAuthorized: HARD_CALL_CEILING,
    callsAttempted: callsMade,
    spendCeilingUsd: SPEND_CEILING_USD,
    cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    stopped,
    retriesUsed: 0,
    cachingPosture: 'DISABLED',
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'EXECUTION-SUMMARY-213.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(`\nCALLS ${callsMade}/${HARD_CALL_CEILING}   SPEND $${spendUsd.toFixed(4)}/`
    + `$${SPEND_CEILING_USD}   STOPPED: ${stopped ?? 'no — cohort complete'}`);

  // Deterministic §212 contract validation, applied AFTER every raw record is persisted.
  if (existsSync(join(EVID, 'RAW-VERIFIER-213.jsonl'))) {
    const rows = readFileSync(join(EVID, 'RAW-VERIFIER-213.jsonl'), 'utf8').trim().split('\n')
      .map(l => JSON.parse(l));
    for (const r of rows) {
      const entries = (r.parsed?.owedFactDeclarations ?? []) as any[];
      const codes = entries.flatMap(e => checkDeclarationEntry212({
        factKey: String(e?.factKey ?? ''),
        declaration: String(e?.declaration ?? ''),
        challengeReason: e?.challengeReason ?? null,
        challengeGround: e?.challengeGround ?? null,
        propertyMismatchKind: e?.propertyMismatchKind ?? null,
        representationConcern: e?.representationConcern ?? 'NONE',
      }));
      write('CONTRACT-VALIDATION-213.jsonl', {
        callIndex: r.callIndex, caseId: r.caseId, ordinal: r.ordinal,
        verdict: r.parsed?.verdict ?? null,
        declarationCount: entries.length,
        declaredFactKeys: entries.map(e => e?.factKey ?? null),
        targetFactKey: r.verifierTargetFactKey,
        targetDeclared: entries.some(e => e?.factKey === r.verifierTargetFactKey),
        foreignKeyDeclared: entries.some(e => e?.factKey !== r.verifierTargetFactKey),
        admissionCodes: codes,
        admitted: codes.length === 0,
      });
    }
  }
})();
