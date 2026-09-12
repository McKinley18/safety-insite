/**
 * §238 — EXECUTE the frozen final posture semantic confirmation cohort.
 *
 * SIX provider calls, exactly. SINGLE ARM. FIRST-PASS LEG ONLY. Hard ceiling USD 0.85.
 * ZERO database operations. No commit, no push, no tag, no deploy.
 *
 * NO RETRIES OF ANY KIND. The authorization books six calls with no retry allowance, so a transport
 * or HTTP failure that yields no adjudicable response TERMINATES the run as EXECUTION INCOMPLETE
 * and returns for authorization. Remaining calls are never spent investigating results.
 *
 * The executor REFUSES TO TRANSMIT unless the frozen package digest, the frozen instrument digest,
 * the §233 implementation digest, the §235 stabilization digest, the §237 closure digest and the
 * 29-module protected composite identity are exactly the ones frozen before the spend.
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
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  CONFIRMATION_CASES_238, instrumentDigest238, FROZEN_EXECUTION_CONFIGURATION_238,
} from './lib/expert-238-confirmation-instrument';
import {
  assembleFirstPass238, ASSEMBLY_238_VERSION, type AssembledFirstPass238,
} from './lib/expert-238-assembly';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { consistencyIdentity235 } from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import { contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION }
  from './lib/expert-237-posture-contract';
import { projectionIdentity237 } from './lib/expert-237-posture-projection';
import { consistencyIdentity237 } from './lib/expert-237-contract-consistency';

const EXECUTOR_VERSION = 'hazlenz.expert.238.final-confirmation-execution.v1';

const AUTHORIZED_PACKAGE_DIGEST =
  'a77ba19ecad8a53406684f37adbeaaffd0ac8b02aabe2c289a956ed6b8265cf5';
const AUTHORIZED_INSTRUMENT_DIGEST =
  '21ea0832330ff73fa928aa8b8e8854fccc10a5a33a61c52a3933ec30eaa70f1f';
const AUTHORIZED_DIGEST_233 =
  '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
const AUTHORIZED_DIGEST_235 =
  '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd';
const AUTHORIZED_COMPOSITE_IDENTITY =
  '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const MAX_CALLS = 6;
const SPEND_CEILING_USD = 0.85;
const FIRST_PASS_MAX_TOKENS = FROZEN_EXECUTION_CONFIGURATION_238.firstPassMaxTokens;
const WORST_CALL_USD = FROZEN_EXECUTION_CONFIGURATION_238.guardWorstCaseCallUsd;

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
mkdirSync(EVID, { recursive: true });

const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => {
  appendFileSync(join(EVID, f), JSON.stringify(o) + '\n');
};
const abort = (m: string): never => { throw new Error(`§238 ABORT BEFORE PROVIDER EXECUTION: ${m}`); };

// ================================================================ pre-spend identity

const FILES = ['SECTION-238-INSTRUMENT.json', 'SECTION-238-TRUTH-CONTRACT.json',
  'SECTION-238-TRUTH-PREFLIGHT.json', 'SECTION-238-SCORING-RULES.json',
  'SECTION-238-PREREGISTERED-FAILURE-OPTIONS.json', 'SECTION-238-FROZEN-PROTOCOL.json'];
const docs = FILES.map(f => [f, JSON.parse(readFileSync(join(EVID, f), 'utf8'))] as const);
const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
const protocol = docs.find(([n]) => n === 'SECTION-238-FROZEN-PROTOCOL.json')![1] as any;
const preflightDoc = docs.find(([n]) => n === 'SECTION-238-TRUTH-PREFLIGHT.json')![1] as any;
const truthDoc = docs.find(([n]) => n === 'SECTION-238-TRUTH-CONTRACT.json')![1] as any;
const optionsDoc = docs.find(([n]) => n === 'SECTION-238-PREREGISTERED-FAILURE-OPTIONS.json')![1] as any;

if (preflightDoc.result !== 'PASS') abort('the frozen truth preflight did not pass');
if (truthDoc.perCase.length !== 6) abort('the frozen truth contract is not six cases');
if ((optionsDoc.theFourOptions as unknown[]).length !== 4) {
  abort('the four preregistered product-level options are not frozen');
}
if (protocol.instrumentDigest !== AUTHORIZED_INSTRUMENT_DIGEST) abort('instrument digest mismatch');
const liveInstrument = instrumentDigest238();
if (liveInstrument !== AUTHORIZED_INSTRUMENT_DIGEST) {
  abort(`recomputed instrument digest ${liveInstrument} is not the authorized digest`);
}

const dig = (files: Readonly<Record<string, string>>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));

const moduleDigests233 = dig({
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
});
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
if (implementationDigest233 !== AUTHORIZED_DIGEST_233) abort('the §233 implementation changed');

const moduleDigests235 = dig({
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
});
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));
if (stabilizationDigest235 !== AUTHORIZED_DIGEST_235) abort('the §235 stabilization changed');

const moduleDigests237 = dig({
  contract: 'backend/scripts/lib/expert-237-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-237-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-237-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-237-posture-fixtures.ts',
  suite: 'backend/scripts/test-237-posture-closure.ts',
});
const closureDigest237 = sha(JSON.stringify({
  moduleDigests237, contractIdentity237: contractIdentities237(),
  projectionIdentity: projectionIdentity237(), consistency: consistencyIdentity237(),
  contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
}));
if (closureDigest237 !== protocol.closureDigest237) abort('the §237 closure changed since the freeze');

const PROT = join(EVID, 'PROTECTED-IDENTITIES-238-AT-EXECUTION.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const PROTECTED = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
if (PROTECTED.compositeIdentity !== AUTHORIZED_COMPOSITE_IDENTITY) {
  abort(`recomputed protected composite identity ${PROTECTED.compositeIdentity} differs`);
}
if (PROTECTED.moduleCount !== 29 || PROTECTED.missingModules.length !== 0) {
  abort('the 29-module protected identity is not intact');
}

const firstPass: AssembledFirstPass238[] = [...assembleFirstPass238()];
if (firstPass.length !== 6) abort('assembly did not produce six first-pass calls');
for (const x of firstPass) {
  const c = CONFIRMATION_CASES_238.find(y => y.caseId === x.caseId)!;
  if (x.input.authoritativeSources[0].text !== c.observation) {
    abort(`${x.caseId}: the transmitted observation is not the frozen observation`);
  }
  if (x.governedRecords.length !== 0) abort(`${x.caseId}: a governed record would be transmitted`);
  const f = (protocol.assemblyIdentity.perCase as Array<Record<string, string>>)
    .find(p => p.caseId === x.caseId);
  if (f === undefined) abort(`${x.caseId}: not in the frozen assembly identity`);
  if (f.systemPromptDigest !== x.identities.systemPrompt
    || f.userPromptDigest !== x.identities.userPrompt
    || f.wireSchemaDigest !== x.identities.wireSchema) {
    abort(`${x.caseId}: the assembled bytes differ from the frozen assembly identity`);
  }
}

const preSpend = {
  artifact: 'SECTION-238-PRE-SPEND-IDENTITY',
  executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_238_VERSION,
  capturedAt: new Date().toISOString(), recomputedBeforeAnyProviderCall: true,
  frozenPackageDigest: packageDigest,
  frozenPackageDigestAuthorized: AUTHORIZED_PACKAGE_DIGEST,
  frozenPackageDigestMatches: packageDigest === AUTHORIZED_PACKAGE_DIGEST,
  frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
  implementationDigest233, stabilizationDigest235, closureDigest237,
  section233Unchanged: true, section235Unchanged: true, section237Unchanged: true,
  moduleDigests233, moduleDigests235, moduleDigests237,
  fourPreregisteredOptionsFrozen: true,
  protectedIdentity: {
    compositeIdentity: PROTECTED.compositeIdentity, moduleCount: PROTECTED.moduleCount,
    missingModules: PROTECTED.missingModules, unauthorizedMutations: 0,
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
    ...FROZEN_EXECUTION_CONFIGURATION_238,
    maximumTotalCalls: MAX_CALLS, spendCeilingUsd: SPEND_CEILING_USD, databaseOperations: 0,
  },
  startingProviderCallCount: 0, startingSpendLedgerUsd: 0,
  perCaseAssembledIdentity: firstPass.map(x => ({
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    systemPromptDigest: x.identities.systemPrompt,
    userPromptDigest: x.identities.userPrompt,
    wireSchemaDigest: x.identities.wireSchema,
  })),
};
writeFileSync(join(EVID, 'SECTION-238-PRE-SPEND-IDENTITY.json'),
  JSON.stringify(preSpend, null, 2) + '\n');

if (process.argv[2] === '--identity-only') {
  console.log('pre-spend identity written. No provider call made.');
  console.log(`package digest  ${packageDigest}`);
  console.log(`authorized      ${AUTHORIZED_PACKAGE_DIGEST}`);
  console.log(`match           ${packageDigest === AUTHORIZED_PACKAGE_DIGEST}`);
  console.log(`§233 / §235 / §237  ${implementationDigest233.slice(0, 12)}… / ${stabilizationDigest235.slice(0, 12)}… / ${closureDigest237.slice(0, 12)}…`);
  console.log(`composite       ${PROTECTED.compositeIdentity}`);
  process.exit(0);
}
if (packageDigest !== AUTHORIZED_PACKAGE_DIGEST) {
  abort(`frozen package digest ${packageDigest} is not the authorized ${AUTHORIZED_PACKAGE_DIGEST}`);
}

// ================================================================ resume ledger

const LEDGER = join(EVID, 'CALL-LEDGER-238.jsonl');
const drawn = new Set<string>();
let callsMade = 0; let spendUsd = 0;
if (existsSync(LEDGER)) {
  for (const l of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as { key: string; costUsd: number };
    drawn.add(r.key); callsMade += 1; spendUsd += r.costUsd;
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
if (!apiKey) abort('no ANTHROPIC_API_KEY');
let stopped: string | null = null;

interface CallOutcome {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: unknown; raw: Record<string, any>;
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
        'content-type': 'application/json', 'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire, signal: controller.signal,
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
  const parsed = (block?.input as unknown) ?? null;
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

async function drawFirstPass(x: AssembledFirstPass238): Promise<CallOutcome> {
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

  write('RAW-238-FIRST-PASS.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_238', callKind: 'PRIMARY',
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_238_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    implementationDigest233: AUTHORIZED_DIGEST_233,
    stabilizationDigest235: AUTHORIZED_DIGEST_235,
    closureDigest237,
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
    raw: out.raw, parsed: out.parsed, timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-238.jsonl', {
    callIndex: callsMade, key: `FP:${x.caseId}`, leg: 'FIRST_PASS', callKind: 'PRIMARY',
    caseId: x.caseId, costUsd: Number(out.costUsd.toFixed(6)),
    failureClass: out.failureClass, httpStatus: out.httpStatus,
  });

  const p = (out.parsed as Record<string, any> | null)?.immediateSafetyPosture;
  const posture = typeof p === 'object' && p !== null ? String(p.posture ?? '-')
    : typeof p === 'string' ? 'STRING' : '-';
  const roles = typeof p === 'object' && p !== null && Array.isArray(p.requiredBy)
    ? (p.requiredBy as Record<string, any>[])
      .map(r => String(r.driverRole ?? '?').replace('ESTABLISHED_CONDITION_REQUIRING_', 'E:')
        .replace('UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION', 'U:CONTROLLING')
        .replace('UNRESOLVED_RESPONSE_OR_FOLLOW_UP', 'U:RESPONSE')).join(',')
    : '-';
  console.log(`  ${String(callsMade)} ${x.caseId} ${out.failureClass.padEnd(14)} `
    + `${posture.padEnd(25)} [${roles}]  out=${out.outputTokens ?? '-'}tok  USD ${spendUsd.toFixed(4)}`);
  return out;
}

// ================================================================ run

void (async () => {
  console.log(`§238 FINAL POSTURE SEMANTIC CONFIRMATION — instrument ${AUTHORIZED_INSTRUMENT_DIGEST.slice(0, 16)}…`);
  console.log(`§233 ${AUTHORIZED_DIGEST_233.slice(0, 10)}… · §235 ${AUTHORIZED_DIGEST_235.slice(0, 10)}… · `
    + `§237 ${closureDigest237.slice(0, 10)}… · composite ${AUTHORIZED_COMPOSITE_IDENTITY.slice(0, 10)}…`);
  console.log(`6 calls, single arm, first-pass only, no retries, ceiling USD ${SPEND_CEILING_USD}\n`);

  const transportFailures: { caseId: string; failureClass: string }[] = [];

  for (const x of firstPass) {
    if (drawn.has(`FP:${x.caseId}`)) { console.log(`  -- ${x.caseId} already drawn`); continue; }
    if (!guard()) break;
    const out = await drawFirstPass(x);
    if (out.failureClass === 'TRANSPORT_FAILURE' || out.failureClass === 'HTTP_FAILURE') {
      transportFailures.push({ caseId: x.caseId, failureClass: out.failureClass });
      stopped = 'TRANSPORT_FAILURE_NO_RETRY_AUTHORIZED';
      console.log(`\n  ${out.failureClass} on ${x.caseId}. No retry is authorized. Stopping.`);
      break;
    }
  }

  const summary = {
    artifact: 'SECTION-238-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_238_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    frozenPackageDigest: packageDigest,
    implementationDigest233: AUTHORIZED_DIGEST_233,
    stabilizationDigest235: AUTHORIZED_DIGEST_235,
    closureDigest237,
    section233Or235Or237ModifiedDuringExecution: false,
    preSpendIdentity: 'PASS',
    plannedPrimaryCalls: 6, callsExecuted: callsMade,
    retriesExecuted: 0, retriesAuthorized: 0, semanticRetries: 0,
    transportFailures, maxAuthorizedCalls: MAX_CALLS,
    spendUsd: Number(spendUsd.toFixed(6)), spendCeilingUsd: SPEND_CEILING_USD,
    withinCeiling: spendUsd <= SPEND_CEILING_USD,
    databaseOperations: 0, stoppedEarly: stopped,
    complete: callsMade === 6 && transportFailures.length === 0,
    unusedCallsSpentOnInvestigation: 0,
    promptChangedDuringExecution: false, schemaChanged: false, caseChangedAfterFreeze: false,
    malformedOutputRepaired: false, earlyResultsUsedToAlterLaterExecution: false,
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(EVID, 'SECTION-238-EXECUTION-SUMMARY.json'),
    JSON.stringify(summary, null, 2) + '\n');

  console.log(`\n${callsMade} calls (0 retries) · USD ${spendUsd.toFixed(4)} of `
    + `${SPEND_CEILING_USD} · complete=${summary.complete} · stopped=${stopped ?? 'no'}`);
})();
