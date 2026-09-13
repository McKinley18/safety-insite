/**
 * §234 — EXECUTE the frozen hosted immediate safety posture discrimination cohort.
 *
 * SIXTEEN provider calls maximum. SINGLE ARM. FIRST-PASS LEG ONLY. Hard ceiling USD 1.80.
 * ZERO database operations. No commit, no push, no tag, no deploy.
 *
 * No semantic-preference retries. No reruns. No rescue calls. No alternate provider or model. No
 * output repair. A retry is spendable ONLY for a transport or HTTP failure that produces no
 * adjudicable HazLenz output, it is drawn from the same sixteen, and its reason is recorded.
 *
 * Unused calls are NOT spendable on investigating interesting outputs.
 *
 * The executor REFUSES TO TRANSMIT unless the frozen package digest, the frozen instrument digest,
 * the §233 implementation digest and the 29-module protected composite identity are exactly the
 * ones frozen before the spend.
 */

import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
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
import {
  POSTURE_CASES_234, instrumentDigest234, FROZEN_EXECUTION_CONFIGURATION_234,
} from './lib/expert-234-posture-discrimination-instrument';
import {
  assembleFirstPass234, ASSEMBLY_234_VERSION, type AssembledFirstPass234,
} from './lib/expert-234-assembly';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';

const EXECUTOR_VERSION = 'hazlenz.expert.234.posture-discrimination-execution.v1';

const AUTHORIZED_PACKAGE_DIGEST =
  '856b564802d0f36dbd702cce535f9a64f48d6fc392b2dc8d40ac31f94bcabc42';
const AUTHORIZED_INSTRUMENT_DIGEST =
  'd988f2904c77185c047f06fd680a83d8733e1d5d7451d8e4e6b1128145cd7c64';
const AUTHORIZED_IMPLEMENTATION_DIGEST_233 =
  '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
const AUTHORIZED_COMPOSITE_IDENTITY =
  '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const MAX_CALLS = 16;
const SPEND_CEILING_USD = 1.80;
const FIRST_PASS_MAX_TOKENS = FROZEN_EXECUTION_CONFIGURATION_234.firstPassMaxTokens;
const WORST_CALL_USD = FROZEN_EXECUTION_CONFIGURATION_234.guardWorstCaseCallUsd;

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
mkdirSync(EVID, { recursive: true });

const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => {
  appendFileSync(join(EVID, f), JSON.stringify(o) + '\n');
};
const abort = (m: string): never => { throw new Error(`§234 ABORT BEFORE PROVIDER EXECUTION: ${m}`); };

// ================================================================ pre-spend identity

const FILES = ['SECTION-234-INSTRUMENT.json', 'SECTION-234-TRUTH-CONTRACT.json',
  'SECTION-234-TRUTH-PREFLIGHT.json', 'SECTION-234-SCORING-RULES.json',
  'SECTION-234-FROZEN-PROTOCOL.json'];
const docs = FILES.map(f => [f, JSON.parse(readFileSync(join(EVID, f), 'utf8'))] as const);
const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
const protocol = docs.find(([n]) => n === 'SECTION-234-FROZEN-PROTOCOL.json')![1] as any;
const preflightDoc = docs.find(([n]) => n === 'SECTION-234-TRUTH-PREFLIGHT.json')![1] as any;
const truthDoc = docs.find(([n]) => n === 'SECTION-234-TRUTH-CONTRACT.json')![1] as any;

if (preflightDoc.result !== 'PASS') abort('the frozen truth preflight did not pass');
if (protocol.instrumentDigest !== AUTHORIZED_INSTRUMENT_DIGEST) abort('frozen instrument digest mismatch');
const liveInstrument = instrumentDigest234();
if (liveInstrument !== AUTHORIZED_INSTRUMENT_DIGEST) {
  abort(`recomputed instrument digest ${liveInstrument} is not the authorized digest`);
}

// the §233 implementation must be byte-identical to the state frozen before the spend
const MODULES_233: Readonly<Record<string, string>> = {
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
};
const moduleDigests233 = Object.fromEntries(Object.entries(MODULES_233)
  .map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
if (implementationDigest233 !== AUTHORIZED_IMPLEMENTATION_DIGEST_233) {
  abort(`the §233 implementation has changed since the freeze (${implementationDigest233})`);
}

// the protected composite identity, recomputed now
const PROT = join(EVID, 'PROTECTED-IDENTITIES-234-AT-EXECUTION.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const PROTECTED = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
if (PROTECTED.compositeIdentity !== AUTHORIZED_COMPOSITE_IDENTITY) {
  abort(`recomputed protected composite identity ${PROTECTED.compositeIdentity} differs`);
}
if (PROTECTED.moduleCount !== 29 || PROTECTED.missingModules.length !== 0) {
  abort('the 29-module protected identity is not intact');
}

const firstPass: AssembledFirstPass234[] = [...assembleFirstPass234()];
if (firstPass.length !== 16) abort('assembly did not produce sixteen first-pass calls');
for (const x of firstPass) {
  const c = POSTURE_CASES_234.find(y => y.caseId === x.caseId)!;
  if (x.input.authoritativeSources[0].text !== c.observation) {
    abort(`${x.caseId}: the transmitted observation is not the frozen observation`);
  }
  if (x.governedRecords.length !== 0) abort(`${x.caseId}: a governed record would be transmitted`);
  const frozenIds = (protocol.assemblyIdentity.perCase as Array<Record<string, string>>)
    .find(p => p.caseId === x.caseId);
  if (frozenIds === undefined) abort(`${x.caseId}: not in the frozen assembly identity`);
  if (frozenIds.systemPromptDigest !== x.identities.systemPrompt
    || frozenIds.userPromptDigest !== x.identities.userPrompt
    || frozenIds.wireSchemaDigest !== x.identities.wireSchema) {
    abort(`${x.caseId}: the assembled bytes differ from the frozen assembly identity`);
  }
}
// the expected postures were frozen and are NOT loaded into anything the executor transmits
if (truthDoc.perCase.length !== 16) abort('the frozen truth contract is not sixteen cases');

const preSpend = {
  artifact: 'SECTION-234-PRE-SPEND-IDENTITY',
  executorVersion: EXECUTOR_VERSION,
  assemblyVersion: ASSEMBLY_234_VERSION,
  capturedAt: new Date().toISOString(),
  recomputedBeforeAnyProviderCall: true,
  frozenPackageDigest: packageDigest,
  frozenPackageDigestAuthorized: AUTHORIZED_PACKAGE_DIGEST,
  frozenPackageDigestMatches: packageDigest === AUTHORIZED_PACKAGE_DIGEST,
  frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
  frozenInstrumentDigestRecomputed: liveInstrument,
  implementationDigest233,
  implementationDigest233Authorized: AUTHORIZED_IMPLEMENTATION_DIGEST_233,
  section233ModulesUnchanged: true,
  moduleDigests233,
  protectedIdentity: {
    compositeIdentity: PROTECTED.compositeIdentity,
    moduleCount: PROTECTED.moduleCount,
    missingModules: PROTECTED.missingModules,
    unauthorizedMutations: 0,
  },
  providerIdentity: {
    endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
    thinking: 'disabled', cachingEnabled: false,
    inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
    outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
  },
  frozenExecutionConfiguration: {
    ...FROZEN_EXECUTION_CONFIGURATION_234,
    maximumTotalCalls: MAX_CALLS,
    spendCeilingUsd: SPEND_CEILING_USD,
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
  })),
};
writeFileSync(join(EVID, 'SECTION-234-PRE-SPEND-IDENTITY.json'),
  JSON.stringify(preSpend, null, 2) + '\n');

if (process.argv[2] === '--identity-only') {
  console.log('pre-spend identity written. No provider call made.');
  console.log(`package digest   ${packageDigest}`);
  console.log(`authorized       ${AUTHORIZED_PACKAGE_DIGEST}`);
  console.log(`match            ${packageDigest === AUTHORIZED_PACKAGE_DIGEST}`);
  console.log(`impl §233 digest ${implementationDigest233}`);
  console.log(`composite        ${PROTECTED.compositeIdentity}`);
  process.exit(0);
}
if (packageDigest !== AUTHORIZED_PACKAGE_DIGEST) {
  abort(`frozen package digest ${packageDigest} is not the authorized ${AUTHORIZED_PACKAGE_DIGEST}`);
}

// ================================================================ resume ledger

const LEDGER = join(EVID, 'CALL-LEDGER-234.jsonl');
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
let retriesUsed = 0;
let stopped: string | null = null;
const retryLog: { key: string; reason: string; replacedFailureClass: string }[] = [];

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

/** The ceiling can never be breached. If this trips the run STOPS; coverage is never reduced. */
function guard(): boolean {
  if (callsMade >= MAX_CALLS) { stopped = 'CALL_CEILING_REACHED'; return false; }
  if (spendUsd + WORST_CALL_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; return false;
  }
  return true;
}

/** A retry is authorized ONLY for these. Never for a semantic outcome, never to investigate. */
const RETRY_ELIGIBLE = new Set(['TRANSPORT_FAILURE', 'HTTP_FAILURE']);

async function drawFirstPass(
  x: AssembledFirstPass234, kind: 'PRIMARY' | 'RETRY', reason: string | null,
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

  write('RAW-234-FIRST-PASS.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_234', callKind: kind,
    retryReason: reason, executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_234_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    implementationDigest233: AUTHORIZED_IMPLEMENTATION_DIGEST_233,
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    systemPromptIdentity: x.identities.systemPrompt,
    userPromptIdentity: x.identities.userPrompt,
    wireSchemaIdentity: x.identities.wireSchema,
    transmittedSchemaSha256: sha(JSON.stringify(asSent)),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
    transmittedBodyBytes: out.transmittedBodyBytes, cachingEnabled: false,
    maxTokens: FIRST_PASS_MAX_TOKENS,
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
  write('CALL-LEDGER-234.jsonl', {
    callIndex: callsMade, key: `FP:${x.caseId}`, leg: 'FIRST_PASS', callKind: kind,
    retryReason: reason, caseId: x.caseId,
    costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
    httpStatus: out.httpStatus,
  });

  const p = out.parsed?.immediateSafetyPosture as Record<string, unknown> | undefined;
  console.log(`  ${String(callsMade).padStart(2)} ${kind.padEnd(7)} ${x.caseId.padEnd(3)} `
    + `${out.failureClass.padEnd(17)} posture=${String(p?.posture ?? '-').padEnd(25)} `
    + `out=${out.outputTokens ?? '-'}tok  USD ${spendUsd.toFixed(4)}`);
  return out;
}

// ================================================================ run

void (async () => {
  console.log(`§234 POSTURE DISCRIMINATION EXECUTION — instrument ${AUTHORIZED_INSTRUMENT_DIGEST.slice(0, 16)}…`);
  console.log(`§233 impl ${AUTHORIZED_IMPLEMENTATION_DIGEST_233.slice(0, 16)}… · composite ${AUTHORIZED_COMPOSITE_IDENTITY.slice(0, 16)}…`);
  console.log(`16 calls max, single arm, first-pass only, ceiling USD ${SPEND_CEILING_USD}\n`);

  for (const x of firstPass) {
    if (drawn.has(`FP:${x.caseId}`)) { console.log(`  -- ${x.caseId} already drawn`); continue; }
    if (!guard()) break;
    let out = await drawFirstPass(x, 'PRIMARY', null);
    if (RETRY_ELIGIBLE.has(out.failureClass) && guard()) {
      const replaced = out.failureClass;
      retriesUsed += 1;
      retryLog.push({ key: `FP:${x.caseId}`, reason: replaced, replacedFailureClass: replaced });
      out = await drawFirstPass(x, 'RETRY', replaced);
    }
  }

  const summary = {
    artifact: 'SECTION-234-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION,
    assemblyVersion: ASSEMBLY_234_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    frozenPackageDigest: packageDigest,
    implementationDigest233: AUTHORIZED_IMPLEMENTATION_DIGEST_233,
    section233ImplementationModifiedDuringExecution: false,
    preSpendIdentity: 'PASS',
    plannedPrimaryCalls: 16,
    callsExecuted: callsMade,
    retriesExecuted: retriesUsed,
    retryLog,
    maxAuthorizedCalls: MAX_CALLS,
    spendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD,
    semanticPreferenceRetries: 0,
    unusedCallsSpentOnInvestigation: 0,
    databaseOperations: 0,
    stoppedEarly: stopped,
    promptChangedDuringExecution: false,
    schemaChanged: false,
    caseChangedAfterFreeze: false,
    malformedOutputRepaired: false,
    stringifiedFieldsParsed: false,
    earlyResultsUsedToAlterLaterExecution: false,
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'SECTION-234-EXECUTION-SUMMARY.json'),
    JSON.stringify(summary, null, 2) + '\n');

  console.log(`\n${callsMade} calls (${retriesUsed} retry) · USD ${spendUsd.toFixed(4)} of `
    + `${SPEND_CEILING_USD} · stopped=${stopped ?? 'no'}`);
})();
