/**
 * §231 — EXECUTE the frozen §230 final fresh Expert HazLenz acceptance.
 *
 * 52 primary calls, 54 maximum, hard ceiling USD 4.28, 0 database operations.
 *
 * No semantic-preference retries. No reruns. No rescue calls. No alternate provider or model. No
 * output repair. A contingency call is spendable ONLY for a transport, HTTP or never-reached-
 * inference failure, and its reason is recorded.
 *
 * The executor REFUSES TO TRANSMIT unless the frozen package digest, the candidate baseline and the
 * 29-module protected composite identity are exactly the authorized ones.
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
  EXPERT_HOSTED_INFERENCE_CONFIG, EXPERT_TOOL_NAME, applyStrictSchemaWrapper,
  stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import { ACCEPTANCE_CASES_230, CANDIDATE_BASELINE_230, instrumentDigest230 }
  from './lib/expert-230-final-acceptance-instrument';
import {
  assembleFirstPass231, assembleVerifierFor231, ASSEMBLY_231_VERSION,
  type AssembledFirstPass231,
} from './lib/expert-231-assembly';

const EXECUTOR_VERSION = 'hazlenz.expert.231.final-acceptance-execution.v1';
const AUTHORIZED_BASELINE =
  '48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200';
const AUTHORIZED_INSTRUMENT_DIGEST =
  'bbde6ca0a1d1253ea8dc78d46bef8a26b3ef75ac2d59f72ed051e9e8fbe06844';
const AUTHORIZED_PACKAGE_DIGEST =
  '4bb37d515e142902254e1ebb6cb7e67c8899f6f776f3625c7ec7ff8e9f626d1f';
const AUTHORIZED_COMPOSITE_IDENTITY =
  '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const PRIMARY_CALLS = 52;
const MAX_CALLS = 54;
const SPEND_CEILING_USD = 4.28;
const FIRST_PASS_MAX_TOKENS = 4000;
const VERIFIER_MAX_TOKENS = 4000;
const WORST_CALL_USD = (FIRST_PASS_MAX_TOKENS / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok
  + (40_000 / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;

const I230 = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-230-final-fresh-acceptance-instrument-2026-09-11');
const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-231-final-fresh-acceptance-2026-09-11');
mkdirSync(EVID, { recursive: true });

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => {
  appendFileSync(join(EVID, f), JSON.stringify(o) + '\n');
};

// ================================================================ pre-spend identity

const FILES = ['SECTION-230-ACCEPTANCE-INSTRUMENT.json', 'SECTION-230-TRUTH-PREFLIGHT.json',
  'SECTION-230-COVERAGE-MAP.json', 'SECTION-230-JUDGMENT-SLOTS.json',
  'SECTION-230-CALL-PLAN.json', 'SECTION-230-ACCEPTANCE-GATES.json',
  'SECTION-230-FROZEN-PROTOCOL.json'];
const docs = FILES.map(f => [f, JSON.parse(readFileSync(join(I230, f), 'utf8'))] as const);
const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
const frozen = docs.find(([n]) => n === 'SECTION-230-FROZEN-PROTOCOL.json')![1] as any;
const plan = docs.find(([n]) => n === 'SECTION-230-CALL-PLAN.json')![1] as any;
const inst = docs.find(([n]) => n === 'SECTION-230-ACCEPTANCE-INSTRUMENT.json')![1] as any;
const slotsDoc = docs.find(([n]) => n === 'SECTION-230-JUDGMENT-SLOTS.json')![1] as any;

const abort = (m: string): never => { throw new Error(`§231 ABORT BEFORE PROVIDER EXECUTION: ${m}`); };

if (frozen.candidateBaseline !== AUTHORIZED_BASELINE) abort('frozen protocol baseline mismatch');
if (CANDIDATE_BASELINE_230 !== AUTHORIZED_BASELINE) abort('instrument module baseline mismatch');
if (inst.candidateBaseline !== AUTHORIZED_BASELINE) abort('instrument document baseline mismatch');
if (frozen.instrumentDigest !== AUTHORIZED_INSTRUMENT_DIGEST) abort('instrument digest mismatch');
const liveInstrumentDigest = instrumentDigest230();
if (liveInstrumentDigest !== AUTHORIZED_INSTRUMENT_DIGEST) {
  abort(`recomputed instrument digest ${liveInstrumentDigest} is not the authorized digest`);
}
if (plan.exactPrimaryCallCount !== PRIMARY_CALLS || plan.maximumTotalCalls !== MAX_CALLS) {
  abort('the frozen call plan does not match the authorized limits');
}
if (plan.recommendedHardCeilingUsd !== SPEND_CEILING_USD) abort('ceiling mismatch');
if (inst.caseCount !== 30 || ACCEPTANCE_CASES_230.length !== 30) abort('cohort is not 30 cases');
if (slotsDoc.slotCount !== 163) abort('judgment slot count is not 163');

const BASELINE_DOC = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-229-baseline-compartmentalization-2026-09-11',
  'EXPERT-HAZLENZ-CANDIDATE-BASELINE.json');
const baseline = JSON.parse(readFileSync(BASELINE_DOC, 'utf8')) as Record<string, any>;
if (baseline.baselineDigest !== AUTHORIZED_BASELINE) abort('candidate baseline on disk differs');
if (baseline.protectedIdentities.compositeIdentity !== AUTHORIZED_COMPOSITE_IDENTITY) {
  abort('baseline composite identity differs');
}

const PROTECTED = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Record<string, any>;
if (PROTECTED.compositeIdentity !== AUTHORIZED_COMPOSITE_IDENTITY) {
  abort(`recomputed protected composite identity ${PROTECTED.compositeIdentity} differs`);
}
if (PROTECTED.moduleCount !== 29 || PROTECTED.missingModules.length !== 0) {
  abort('the 29-module protected identity is not intact');
}

const firstPass: AssembledFirstPass231[] = [...assembleFirstPass231()];
if (firstPass.length !== 30) abort('assembly did not produce 30 first-pass calls');
for (const x of firstPass) {
  const c = ACCEPTANCE_CASES_230.find(y => y.caseId === x.caseId)!;
  if (x.input.authoritativeSources[0].text !== c.observation) {
    abort(`${x.caseId}: the transmitted observation is not the frozen observation`);
  }
  if (x.governedRecords.length !== c.governedRecords.length) {
    abort(`${x.caseId}: governed record count differs from the frozen case`);
  }
}

const preSpend = {
  artifact: 'SECTION-231-PRE-SPEND-IDENTITY',
  executorVersion: EXECUTOR_VERSION,
  assemblyVersion: ASSEMBLY_231_VERSION,
  capturedAt: new Date().toISOString(),
  recomputedBeforeAnyProviderCall: true,
  candidateBaselineDigest: AUTHORIZED_BASELINE,
  candidateBaselineVerified: true,
  frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
  frozenInstrumentDigestRecomputedFromModule: liveInstrumentDigest,
  frozenPackageDigest: packageDigest,
  frozenPackageDigestAuthorized: AUTHORIZED_PACKAGE_DIGEST,
  frozenPackageDigestMatches: packageDigest === AUTHORIZED_PACKAGE_DIGEST,
  protectedIdentity: {
    compositeIdentity: PROTECTED.compositeIdentity,
    moduleCount: PROTECTED.moduleCount,
    missingModules: PROTECTED.missingModules,
    matchesBaseline: true,
    semanticIdentities: PROTECTED.semanticIdentities,
  },
  providerIdentity: {
    endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
    thinking: 'disabled',
    cachingEnabled: false,
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
  },
  frozenExecutionConfiguration: {
    firstPassMaxTokens: FIRST_PASS_MAX_TOKENS,
    verifierMaxTokens: VERIFIER_MAX_TOKENS,
    primaryCalls: PRIMARY_CALLS,
    maximumTotalCalls: MAX_CALLS,
    contingencyCalls: 2,
    contingencyEligibleFailureClasses: ['TRANSPORT_FAILURE', 'HTTP_FAILURE'],
    semanticPreferenceRetries: 0,
    spendCeilingUsd: SPEND_CEILING_USD,
    projectedSpendUsd: plan.projectedSpendUsd,
    databaseOperations: 0,
  },
  startingProviderCallCount: 0,
  startingSpendLedgerUsd: 0,
  perCaseAssembledIdentity: firstPass.map(x => ({
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    systemPromptDigest: x.identities.systemPrompt,
    userPromptDigest: x.identities.userPrompt,
    wireSchemaDigest: x.identities.wireSchema,
    governedRecordIds: x.governedRecords.map(g => g.sourceId),
  })),
};
writeFileSync(join(EVID, 'SECTION-231-PRE-SPEND-IDENTITY.json'),
  JSON.stringify(preSpend, null, 2) + '\n');

if (process.argv[3] === '--identity-only') {
  console.log('pre-spend identity written. No provider call made.');
  console.log(`package digest  ${packageDigest}`);
  console.log(`authorized      ${AUTHORIZED_PACKAGE_DIGEST}`);
  console.log(`match           ${packageDigest === AUTHORIZED_PACKAGE_DIGEST}`);
  process.exit(0);
}
if (packageDigest !== AUTHORIZED_PACKAGE_DIGEST) {
  abort(`frozen package digest ${packageDigest} is not the authorized ${AUTHORIZED_PACKAGE_DIGEST}`);
}

// ================================================================ resume ledger

const LEDGER = join(EVID, 'CALL-LEDGER-231.jsonl');
const drawn = new Set<string>();
let callsMade = 0; let spendUsd = 0;
if (existsSync(LEDGER)) {
  for (const l of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as { key: string; costUsd: number; callKind: string };
    if (r.callKind === 'PRIMARY') drawn.add(r.key);
    callsMade += 1; spendUsd += r.costUsd;
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
if (!apiKey) abort('no ANTHROPIC_API_KEY');
let contingencyUsed = 0;
let stopped: string | null = null;
const contingencyLog: { key: string; reason: string; replacedFailureClass: string }[] = [];

interface CallOutcome {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: Record<string, unknown> | null; raw: Record<string, any>;
  inputTokens: number | null; outputTokens: number | null; costUsd: number;
  stopReason: string | null; latencyMs: number;
  providerErrorType: string | null; providerErrorMessage: string | null;
  transmittedBodyBytes: number; respondedModel: string | null;
}

async function transmit(body: Record<string, unknown>, toolName: string): Promise<CallOutcome> {
  const wire = JSON.stringify(body);
  if (wire.includes('cache_control')) abort('cache_control in the request body. Not transmitting.');
  callsMade += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 180_000);
  let json: Record<string, any> = {};
  let httpStatus: number | null = null;
  try {
    const res = await fetch(`${EXPERT_HOSTED_INFERENCE_CONFIG.endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = res.status;
    json = await res.json() as Record<string, any>;
  } catch (e) {
    clearTimeout(timer);
    return {
      httpStatus, reachedInference: false, failureClass: 'TRANSPORT_FAILURE',
      parsed: null, raw: { transportError: String(e) },
      inputTokens: null, outputTokens: null, costUsd: 0, stopReason: null,
      latencyMs: Date.now() - started, providerErrorType: 'transport',
      providerErrorMessage: String(e), transmittedBodyBytes: wire.length, respondedModel: null,
    };
  }
  clearTimeout(timer);

  const inputTokens = (json.usage?.input_tokens as number | undefined) ?? null;
  const outputTokens = (json.usage?.output_tokens as number | undefined) ?? null;
  const costUsd = (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(x => x.type === 'tool_use' && x.name === toolName);
  const parsed = (block?.input as Record<string, unknown> | undefined) ?? null;
  const failureClass = httpStatus !== 200 ? 'HTTP_FAILURE'
    : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
      : parsed === null ? 'NO_TOOL_USE_BLOCK' : 'NO_FAILURE';

  return {
    httpStatus, reachedInference: httpStatus === 200 && json.content !== undefined,
    failureClass, parsed, raw: json, inputTokens, outputTokens, costUsd,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    latencyMs: Date.now() - started,
    providerErrorType: (json.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json.error?.message as string | undefined) ?? null,
    transmittedBodyBytes: wire.length,
    respondedModel: (json.model as string | undefined) ?? null,
  };
}

function guard(): boolean {
  if (callsMade >= MAX_CALLS) { stopped = 'CALL_CEILING_REACHED'; return false; }
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; return false;
  }
  return true;
}

/** A contingency call is authorized ONLY for these. Never for a semantic outcome. */
const CONTINGENCY_ELIGIBLE = new Set(['TRANSPORT_FAILURE', 'HTTP_FAILURE']);

const shapeOf = (v: unknown): string =>
  Array.isArray(v) ? 'ARRAY' : typeof v === 'string' ? 'STRING'
    : v === undefined || v === null ? 'ABSENT' : 'OTHER';

// ================================================================ legs

async function drawFirstPass(
  x: AssembledFirstPass231, kind: 'PRIMARY' | 'CONTINGENCY', reason: string | null,
): Promise<CallOutcome> {
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(x.wireSchema));
  const out = await transmit({
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: FIRST_PASS_MAX_TOKENS,
    system: x.systemPrompt,
    messages: [{ role: 'user', content: x.userPrompt }],
    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      input_schema: asSent,
    }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  }, EXPERT_TOOL_NAME);

  write('RAW-231-FIRST-PASS.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_231', callKind: kind,
    contingencyReason: reason, executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_231_VERSION, frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    candidateBaseline: AUTHORIZED_BASELINE,
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    systemPromptIdentity: x.identities.systemPrompt,
    userPromptIdentity: x.identities.userPrompt,
    wireSchemaIdentity: x.identities.wireSchema,
    transmittedSchemaSha256: sha(JSON.stringify(asSent)),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
    transmittedBodyBytes: out.transmittedBodyBytes, cachingEnabled: false,
    httpStatus: out.httpStatus, providerErrorType: out.providerErrorType,
    providerErrorMessage: out.providerErrorMessage,
    reachedInference: out.reachedInference, stopReason: out.stopReason,
    inputTokens: out.inputTokens, outputTokens: out.outputTokens,
    costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: out.latencyMs, failureClass: out.failureClass,
    rawPersistedBeforeDerivation: true, outputRepaired: false,
    raw: out.raw, parsed: out.parsed,
    timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-231.jsonl', {
    callIndex: callsMade, key: `FP:${x.caseId}`, leg: 'FIRST_PASS', callKind: kind,
    contingencyReason: reason, caseId: x.caseId,
    costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
    httpStatus: out.httpStatus,
  });

  const d = out.parsed?.unresolvedFactDeclarations;
  console.log(`  ${String(callsMade).padStart(2)} FP  ${kind.padEnd(11)} ${x.caseId.padEnd(4)} `
    + `${out.failureClass.padEnd(18)} decls=${shapeOf(d)}`
    + `${Array.isArray(d) ? `(${d.length})` : ''}  out=${out.outputTokens ?? '-'}tok  `
    + `USD ${spendUsd.toFixed(4)}`);
  return out;
}

// ================================================================ run

void (async () => {
  console.log(`§231 FINAL ACCEPTANCE EXECUTION — instrument ${AUTHORIZED_INSTRUMENT_DIGEST.slice(0, 16)}…`);
  console.log(`candidate ${AUTHORIZED_BASELINE.slice(0, 16)}… · composite ${AUTHORIZED_COMPOSITE_IDENTITY.slice(0, 16)}…`);
  console.log(`${PRIMARY_CALLS} primary, ${MAX_CALLS} max, ceiling USD ${SPEND_CEILING_USD}\n`);
  console.log('LEG 1 — FIRST PASS');

  const fpByCase = new Map<string, CallOutcome>();
  for (const x of firstPass) {
    if (drawn.has(`FP:${x.caseId}`)) { console.log(`  -- FP ${x.caseId} already drawn`); continue; }
    if (!guard()) break;
    let out = await drawFirstPass(x, 'PRIMARY', null);
    if (CONTINGENCY_ELIGIBLE.has(out.failureClass) && contingencyUsed < 2 && guard()) {
      const replaced = out.failureClass;
      contingencyUsed += 1;
      contingencyLog.push({ key: `FP:${x.caseId}`, reason: replaced, replacedFailureClass: replaced });
      out = await drawFirstPass(x, 'CONTINGENCY', replaced);
    }
    fpByCase.set(x.caseId, out);
  }

  console.log('\nLEG 2 — VERIFIER');
  const verifierAssembly: Record<string, unknown> = {};
  for (const c of ACCEPTANCE_CASES_230) {
    if (c.verifierCalls === 0) {
      console.log(`  -- VF ${c.caseId.padEnd(4)} ELIDED (frozen)`);
      verifierAssembly[c.caseId] = { elided: true, frozen: true,
        reason: c.verifierCallElidedBecause };
      write('VERIFIER-ASSEMBLY-231.jsonl',
        { caseId: c.caseId, ...verifierAssembly[c.caseId] as object });
      continue;
    }
    if (drawn.has(`VF:${c.caseId}`)) { console.log(`  -- VF ${c.caseId} already drawn`); continue; }
    const fp = fpByCase.get(c.caseId);
    if (!fp || fp.parsed === null) {
      console.log(`  -- VF ${c.caseId.padEnd(4)} NOT_EXERCISED — no usable first-pass output`);
      verifierAssembly[c.caseId] = { elided: true, frozen: false,
        reason: 'NO_USABLE_FIRST_PASS_OUTPUT' };
      write('VERIFIER-ASSEMBLY-231.jsonl',
        { caseId: c.caseId, ...verifierAssembly[c.caseId] as object });
      continue;
    }
    const asm = assembleVerifierFor231(c.caseId, fp.parsed);
    verifierAssembly[c.caseId] = {
      elided: asm.built.length === 0,
      reason: asm.built.length === 0 ? 'NO_ADMITTED_DECLARATION' : null,
      refused: asm.refused, projectionCodes: asm.projectionCodes,
      admittedCount: asm.admittedFacts.length,
      identities: asm.built[0]?.identities ?? null,
    };
    write('VERIFIER-ASSEMBLY-231.jsonl',
      { caseId: c.caseId, ...verifierAssembly[c.caseId] as object });
    if (asm.built.length === 0) {
      console.log(`  -- VF ${c.caseId.padEnd(4)} NOT_EXERCISED — nothing admitted to review`);
      continue;
    }
    if (!guard()) break;

    const v = asm.built[0];
    const out = await transmit({
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
      max_tokens: VERIFIER_MAX_TOKENS,
      system: v.systemPrompt,
      messages: [{ role: 'user', content: v.userPrompt }],
      tools: [{ name: v.toolBlock.name, description: v.toolBlock.description,
        input_schema: stripAnthropicUnsupportedKeywords(
          applyStrictSchemaWrapper(v.toolBlock.input_schema as Record<string, unknown>)) }],
      tool_choice: { type: 'tool', name: v.toolBlock.name },
      thinking: { type: 'disabled' },
    }, v.toolBlock.name);

    write('RAW-231-VERIFIER.jsonl', {
      callIndex: callsMade, recordKind: 'RAW_VERIFIER_231', callKind: 'PRIMARY',
      executorVersion: EXECUTOR_VERSION, frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
      caseId: c.caseId, declarationId: v.declarationId, factKey: v.factKey,
      instructionIdentity: v.identities.instruction, userPromptIdentity: v.identities.userPrompt,
      schemaIdentity: v.identities.schema,
      requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
      httpStatus: out.httpStatus, reachedInference: out.reachedInference,
      stopReason: out.stopReason, inputTokens: out.inputTokens, outputTokens: out.outputTokens,
      costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
      latencyMs: out.latencyMs, failureClass: out.failureClass,
      rawPersistedBeforeDerivation: true, outputRepaired: false,
      raw: out.raw, parsed: out.parsed, timestamp: new Date().toISOString(),
    });
    write('CALL-LEDGER-231.jsonl', {
      callIndex: callsMade, key: `VF:${c.caseId}`, leg: 'VERIFIER', callKind: 'PRIMARY',
      contingencyReason: null, caseId: c.caseId,
      costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
      httpStatus: out.httpStatus,
    });
    const pr = out.parsed?.propertyReview as Record<string, unknown> | undefined;
    console.log(`  ${String(callsMade).padStart(2)} VF  PRIMARY     ${c.caseId.padEnd(4)} `
      + `${out.failureClass.padEnd(18)} role=${pr?.propertySemanticRole ?? '-'} `
      + `valid=${pr?.propertyValidity ?? '-'}  USD ${spendUsd.toFixed(4)}`);
  }

  const summary = {
    artifact: 'SECTION-231-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_231_VERSION,
    candidateBaseline: AUTHORIZED_BASELINE,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    frozenPackageDigest: packageDigest,
    preSpendIdentity: 'PASS',
    plannedPrimaryCalls: PRIMARY_CALLS,
    callsExecuted: callsMade,
    contingencyCallsExecuted: contingencyUsed,
    contingencyCallsAuthorized: 2,
    contingencyLog,
    maxAuthorizedCalls: MAX_CALLS,
    spendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD,
    projectedSpendUsd: plan.projectedSpendUsd,
    semanticPreferenceRetries: 0,
    databaseOperations: 0,
    stoppedEarly: stopped,
    promptChangedDuringExecution: false,
    schemaChanged: false,
    caseChangedAfterFreeze: false,
    malformedOutputRepaired: false,
    stringifiedFieldsParsed: false,
    earlyResultsUsedToAlterLaterExecution: false,
    verifierAssembly,
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'SECTION-231-EXECUTION-SUMMARY.json'),
    JSON.stringify(summary, null, 2) + '\n');

  console.log(`\n${callsMade} calls (${contingencyUsed} contingency) · `
    + `USD ${spendUsd.toFixed(4)} of ${SPEND_CEILING_USD} · stopped=${stopped ?? 'no'}`);
})();
