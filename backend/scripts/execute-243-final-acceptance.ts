/**
 * §243 — EXECUTE the re-frozen §242A final fresh acceptance instrument.
 *
 * 24 first-pass calls + 8 verifier calls = 32 primary. Maximum 34. Hard ceiling USD 3.60.
 * ZERO database operations. No commit, no push, no tag, no deploy.
 *
 * NO SEMANTIC RETRY OF ANY KIND. The two contingency calls are spendable ONLY on a preregistered
 * execution failure — a transport failure, an HTTP failure, or a response that never reached
 * inference. A truncation reached inference and is a RESULT. A contract refusal is a RESULT.
 *
 * The executor REFUSES TO TRANSMIT unless the re-frozen instrument digest, the frozen package
 * manifest and the 29-module protected composite are exactly the ones authorised before the spend.
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
import {
  assembleFirstPass243, assembleVerifierFor243, frozenCases243, frozenInstrumentDigest243,
  ASSEMBLY_243_VERSION, FROZEN_242A_PACKAGE, type AssembledFirstPass243,
} from './lib/expert-243-assembly';
import { projectPosture239, projectionIdentity239 } from './lib/expert-239-posture-projection';
import { contractIdentities239, FIRST_PASS_CONTRACT_239_VERSION }
  from './lib/expert-239-posture-contract';

const EXECUTOR_VERSION = 'hazlenz.expert.243.final-acceptance-execution.v1';

const AUTHORIZED_INSTRUMENT_DIGEST =
  'cb36885a07fa5b14bbf257dbe69663f1829dbc9f6f4aef13a1460d05e2ec151c';
const AUTHORIZED_PACKAGE_DIGEST =
  '486d9d7666bf6c58cba7a9d3392eebb56499667e19e358194a338939aecaf5ec';
const AUTHORIZED_CANDIDATE_DIGEST =
  'b22e43957625afe696b417253ac46031f62b763a52e52b3eb9464ace0a81676e';
const AUTHORIZED_COMPOSITE_IDENTITY =
  '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const MAX_CALLS = 34;
const PRIMARY_CALLS = 32;
const SPEND_CEILING_USD = 3.60;
const PER_CALL_GUARD_USD = 0.16;
const FIRST_PASS_MAX_TOKENS = 8000;
const VERIFIER_MAX_TOKENS = 4000;

const ROOT = join(__dirname, '..', '..');
const FROZEN = join(ROOT, FROZEN_242A_PACKAGE);
const EVID = join(ROOT, 'verification', 'expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12');
mkdirSync(EVID, { recursive: true });

const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => { appendFileSync(join(EVID, f), JSON.stringify(o) + '\n'); };
const abort = (m: string): never => { throw new Error(`§243 ABORT BEFORE PROVIDER EXECUTION: ${m}`); };

// ================================================================ pre-spend identity

const instrumentDigest = frozenInstrumentDigest243();
if (instrumentDigest !== AUTHORIZED_INSTRUMENT_DIGEST) {
  abort(`re-frozen instrument digest ${instrumentDigest} is not the authorised `
    + AUTHORIZED_INSTRUMENT_DIGEST);
}

const manifestLines = readFileSync(join(FROZEN, 'REPORT-242A.sha256'), 'utf8')
  .split('\n').filter(Boolean);
const manifestBad = manifestLines.filter(l => {
  const [digest, name] = l.split(/\s+/);
  return sha(readFileSync(join(FROZEN, name))) !== digest;
});
if (manifestBad.length !== 0) abort(`frozen package manifest does not verify: ${manifestBad.length} files`);
const packageDigest = sha(manifestLines.join('\n') + '\n');
if (packageDigest !== AUTHORIZED_PACKAGE_DIGEST) {
  abort(`frozen package digest ${packageDigest} is not the authorised ${AUTHORIZED_PACKAGE_DIGEST}`);
}

const prot = JSON.parse(readFileSync(join(FROZEN, 'SECTION-242A-PROTECTED-IDENTITIES.json'), 'utf8'));
if (prot.compositeIdentity !== AUTHORIZED_COMPOSITE_IDENTITY) abort('protected composite differs');
if (prot.moduleCount !== 29 || (prot.missingModules as unknown[]).length !== 0) {
  abort('the 29-module protected identity is not intact');
}
const moduleMismatch: string[] = [];
for (const [name, digest] of Object.entries(prot.moduleDigests as Record<string, string>)) {
  const path = (prot.modulePaths as Record<string, string>)[name];
  const file = join(ROOT, 'backend', path);
  if (!existsSync(file)) { moduleMismatch.push(`${name}: missing`); continue; }
  if (sha(readFileSync(file)) !== digest) moduleMismatch.push(`${name}: ${path}`);
}
if (moduleMismatch.length !== 0) abort(`protected module inputs differ: ${moduleMismatch.join(', ')}`);

const candidateIdentity =
  JSON.parse(readFileSync(join(FROZEN, 'SECTION-242A-CANDIDATE-IDENTITY.json'), 'utf8'));
if (candidateIdentity.successorCandidateDigest !== AUTHORIZED_CANDIDATE_DIGEST) {
  abort('the frozen candidate identity is not the authorised successor candidate');
}

// ---- assembly, validated against the frozen cases before anything is transmitted

const cases = frozenCases243();
const firstPass: AssembledFirstPass243[] = [...assembleFirstPass243()];
if (firstPass.length !== 24) abort('assembly did not produce twenty-four first-pass calls');
for (const x of firstPass) {
  const c = cases.find(y => y.caseId === x.caseId)!;
  if (x.input.authoritativeSources[0].text !== c.observation) {
    abort(`${x.caseId}: the transmitted observation is not the frozen observation`);
  }
  if (x.input.jurisdiction !== c.jurisdiction) abort(`${x.caseId}: jurisdiction differs`);
  const sent = x.governedRecords.map(g => g.sourceId).join(',');
  const frozenIds = c.governedRecords.map(g => g.sourceId).join(',');
  if (sent !== frozenIds) abort(`${x.caseId}: governed record ids differ (${sent} vs ${frozenIds})`);
  for (const g of x.governedRecords) {
    const f = c.governedRecords.find(y => y.sourceId === g.sourceId)!;
    if (g.text !== f.approvedText) abort(`${x.caseId}/${g.sourceId}: approved text differs`);
  }
  if (x.contractVersion !== FIRST_PASS_CONTRACT_239_VERSION) abort(`${x.caseId}: contract version`);
}
const verifierBearing = cases.filter(c => c.verifierCalls === 1).map(c => c.caseId);
if (verifierBearing.length !== 8) abort(`expected eight verifier-bearing cases, found ${verifierBearing.length}`);

const preSpend = {
  artifact: 'SECTION-243-PRE-SPEND-IDENTITY',
  executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_243_VERSION,
  capturedAt: new Date().toISOString(), recomputedBeforeAnyProviderCall: true,
  providerCallsSoFar: 0, databaseOperations: 0,
  frozenInstrumentDigest: instrumentDigest,
  frozenInstrumentDigestAuthorized: AUTHORIZED_INSTRUMENT_DIGEST,
  frozenInstrumentDigestMatches: instrumentDigest === AUTHORIZED_INSTRUMENT_DIGEST,
  frozenPackageDigest: packageDigest,
  frozenPackageDigestAuthorized: AUTHORIZED_PACKAGE_DIGEST,
  frozenPackageDigestMatches: packageDigest === AUTHORIZED_PACKAGE_DIGEST,
  frozenPackageManifestFiles: manifestLines.length, frozenPackageManifestMismatches: 0,
  successorCandidateDigest: candidateIdentity.successorCandidateDigest,
  candidateDigestRecomputed: false,
  candidateDigestRecomputationRefusedBecause:
    'the only path that recomputes it is build-240-freeze.ts, which writes into the frozen §240 '
    + 'directory. §243 forbids invoking the destructive builder. The authorised non-mutating '
    + 'protected-input verification was performed instead.',
  protectedIdentity: {
    compositeIdentity: prot.compositeIdentity, moduleCount: prot.moduleCount,
    modulesByteIdentical: Object.keys(prot.moduleDigests).length, mismatches: 0,
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
    arm: 'SINGLE', legs: ['FIRST_PASS', 'VERIFIER'], thinking: 'disabled', cachingEnabled: false,
    firstPassMaxTokens: FIRST_PASS_MAX_TOKENS, verifierMaxTokens: VERIFIER_MAX_TOKENS,
    semanticRetries: 0, transportRetriesAuthorized: 0, contingencyCalls: 2,
    primaryCalls: PRIMARY_CALLS, maximumTotalCalls: MAX_CALLS,
    spendCeilingUsd: SPEND_CEILING_USD, perCallGuardUsd: PER_CALL_GUARD_USD,
    databaseOperations: 0,
  },
  contractIdentities: contractIdentities239(), projectionIdentity: projectionIdentity239(),
  assemblyPathDisclosure:
    'governedStandards is EMPTY in the transmitted input and the governed records travel only in the '
    + 'appended AVAILABLE GOVERNED EVIDENCE block, exactly as the protected §228b assembly does it. '
    + 'The base prompt therefore prints "(none supplied)" in its own records section while the '
    + 'appended block lists the sourceIds and their citation-redacted text. This is the frozen path, '
    + 'preserved deliberately, and it is disclosed here because HS8 and Q9 are read against it.',
  verifierBearingCases: verifierBearing,
  perCaseAssembledIdentity: firstPass.map(x => ({
    caseId: x.caseId, ordinal: x.ordinal, contractVersion: x.contractVersion,
    analysisId: x.analysisId, observationSourceId: x.observationSourceId,
    governedRecordIds: x.governedRecords.map(g => g.sourceId),
    systemPromptDigest: x.identities.systemPrompt, userPromptDigest: x.identities.userPrompt,
    wireSchemaDigest: x.identities.wireSchema,
  })),
};
writeFileSync(join(EVID, 'SECTION-243-PRE-SPEND-IDENTITY.json'), JSON.stringify(preSpend, null, 2) + '\n');

if (process.argv[2] === '--identity-only') {
  console.log('pre-spend identity written. NO PROVIDER CALL MADE.');
  console.log(`  instrument digest  ${instrumentDigest}`);
  console.log(`  package digest     ${packageDigest}`);
  console.log(`  composite          ${prot.compositeIdentity}`);
  console.log(`  protected modules  ${Object.keys(prot.moduleDigests).length}/29 byte-identical`);
  console.log(`  first-pass calls   ${firstPass.length}`);
  console.log(`  verifier cases     ${verifierBearing.join(' ')}`);
  process.exit(0);
}

// ================================================================ resume ledger

const LEDGER = join(EVID, 'CALL-LEDGER-243.jsonl');
const drawn = new Set<string>();
let callsMade = 0; let spendUsd = 0; let contingencyUsed = 0;
if (existsSync(LEDGER)) {
  for (const l of readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l) as { key: string; costUsd: number; callKind: string };
    drawn.add(r.key); callsMade += 1; spendUsd += r.costUsd;
    if (r.callKind === 'CONTINGENCY') contingencyUsed += 1;
  }
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
if (!apiKey) abort('no ANTHROPIC_API_KEY');
let stopped: string | null = null;

interface CallOutcome {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: any; raw: Record<string, any>;
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
      httpStatus, reachedInference: false, failureClass: 'TRANSPORT_FAILURE', parsed: null,
      raw: { transportError: String(e) }, inputTokens: null, outputTokens: null, costUsd: 0,
      stopReason: null, latencyMs: Date.now() - started, providerErrorType: 'transport',
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
  if (spendUsd + PER_CALL_GUARD_USD > SPEND_CEILING_USD) {
    stopped = 'SPEND_CEILING_WOULD_BE_EXCEEDED'; return false;
  }
  return true;
}

/** A preregistered EXECUTION FAILURE, the only thing a contingency call may be spent on. */
const isExecutionFailure = (o: CallOutcome): boolean =>
  o.failureClass === 'TRANSPORT_FAILURE' || o.failureClass === 'HTTP_FAILURE' || !o.reachedInference;

async function drawFirstPass(x: AssembledFirstPass243, callKind: 'PRIMARY' | 'CONTINGENCY',
  contingencyReason: string | null): Promise<CallOutcome> {
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(x.wireSchema));
  const out = await transmit({
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: FIRST_PASS_MAX_TOKENS,
    system: x.systemPrompt, messages: [{ role: 'user', content: x.userPrompt }],
    tools: [{
      name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      input_schema: asSent,
    }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  }, EXPERT_TOOL_NAME);
  write('RAW-243-FIRST-PASS.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_243', callKind, contingencyReason,
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_243_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
    caseId: x.caseId, ordinal: x.ordinal, analysisId: x.analysisId,
    systemPromptIdentity: x.identities.systemPrompt, userPromptIdentity: x.identities.userPrompt,
    wireSchemaIdentity: x.identities.wireSchema,
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
    httpStatus: out.httpStatus, reachedInference: out.reachedInference, stopReason: out.stopReason,
    inputTokens: out.inputTokens, outputTokens: out.outputTokens,
    costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: out.latencyMs, failureClass: out.failureClass,
    rawPersistedBeforeDerivation: true, outputRepaired: false,
    raw: out.raw, parsed: out.parsed, timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-243.jsonl', {
    callIndex: callsMade, key: `FP:${x.caseId}${callKind === 'CONTINGENCY' ? ':C' : ''}`,
    leg: 'FIRST_PASS', callKind, contingencyReason, caseId: x.caseId,
    costUsd: Number(out.costUsd.toFixed(6)), failureClass: out.failureClass,
    httpStatus: out.httpStatus,
  });
  return out;
}

// ================================================================ execution

(async () => {
  console.log('§243 FINAL FRESH ACCEPTANCE EXECUTION');
  console.log(`  instrument ${instrumentDigest.slice(0, 16)}…  package ${packageDigest.slice(0, 16)}…`);
  console.log(`  ceiling USD ${SPEND_CEILING_USD.toFixed(2)}  primary ${PRIMARY_CALLS}  max ${MAX_CALLS}`);

  const fpResult: Record<string, { outcome: CallOutcome; projection: any }> = {};

  for (const x of firstPass) {
    if (drawn.has(`FP:${x.caseId}`)) { console.log(`  -- FP ${x.caseId} already drawn, resuming`); continue; }
    if (!guard()) break;
    let out = await drawFirstPass(x, 'PRIMARY', null);
    if (isExecutionFailure(out) && contingencyUsed < 2 && guard()) {
      contingencyUsed += 1;
      console.log(`  !! ${x.caseId} execution failure ${out.failureClass} — contingency ${contingencyUsed}/2`);
      out = await drawFirstPass(x, 'CONTINGENCY',
        `PREREGISTERED_EXECUTION_FAILURE:${out.failureClass}:HTTP_${out.httpStatus}`);
    }
    const projection = projectPosture239(out.parsed, x.wireSchema);
    write('PROJECTION-243-FIRST-PASS.jsonl', {
      recordKind: 'PROJECTION_FIRST_PASS_243', caseId: x.caseId,
      projectionVersion: projection.version, admitted: projection.admitted,
      codes: projection.codes, codes233: projection.codes233, codes239: projection.codes239,
      invariantsViolated: projection.invariantsViolated,
      posture: projection.posture, recommendationState: projection.recommendationState,
      derivedCessationDrivers: projection.derivedCessationDrivers,
      derivedControllingDrivers: projection.derivedControllingDrivers,
      declarationSubordination: projection.declarationSubordination,
      mayPresentAsCompletedAnalysis: projection.mayPresentAsCompletedAnalysis,
      preserved: projection.preserved,
      normalizationFailsClosed: projection.normalization.failsClosed,
      failureClass: out.failureClass, stopReason: out.stopReason,
      timestamp: new Date().toISOString(),
    });
    fpResult[x.caseId] = { outcome: out, projection };
    const p = projection.posture;
    console.log(`  ${String(callsMade).padStart(2)} FP  ${x.caseId.padEnd(3)} `
      + `${out.failureClass.padEnd(17)} admitted=${projection.admitted ? 'Y' : 'N'} `
      + `posture=${String(p?.posture ?? '-').padEnd(26)} USD ${spendUsd.toFixed(4)}`);
  }

  // ---- verifier legs, frozen to eight cases, on the FIRST admitted declaration
  const verifierRecords: Record<string, any> = {};
  for (const caseId of verifierBearing) {
    const fp = fpResult[caseId];
    if (fp === undefined) {
      verifierRecords[caseId] = { ran: false, reason: 'FIRST_PASS_NOT_EXECUTED' };
      continue;
    }
    if (fp.outcome.parsed === null) {
      verifierRecords[caseId] = { ran: false, reason: `NO_PARSED_FIRST_PASS:${fp.outcome.failureClass}` };
      write('VERIFIER-243-NOT-RUN.jsonl', { caseId, ...verifierRecords[caseId], callReallocated: false });
      continue;
    }
    const asm = assembleVerifierFor243(caseId, fp.outcome.parsed as Record<string, unknown>);
    if (asm.built.length === 0) {
      verifierRecords[caseId] = {
        ran: false, reason: 'NO_ADMITTED_DECLARATION', refused: asm.refused,
        projectionCodes: asm.projectionCodes,
      };
      write('VERIFIER-243-NOT-RUN.jsonl', { caseId, ...verifierRecords[caseId], callReallocated: false });
      console.log(`  -- VF  ${caseId.padEnd(3)} NOT RUN: no admitted declaration; call not reallocated`);
      continue;
    }
    if (drawn.has(`VF:${caseId}`)) { console.log(`  -- VF ${caseId} already drawn, resuming`); continue; }
    if (!guard()) break;
    const v = asm.built[0];
    const out = await transmit({
      model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: VERIFIER_MAX_TOKENS,
      system: v.systemPrompt, messages: [{ role: 'user', content: v.userPrompt }],
      tools: [{
        name: v.toolBlock.name, description: v.toolBlock.description,
        input_schema: stripAnthropicUnsupportedKeywords(
          applyStrictSchemaWrapper(v.toolBlock.input_schema as Record<string, unknown>)),
      }],
      tool_choice: { type: 'tool', name: v.toolBlock.name },
      thinking: { type: 'disabled' },
    }, v.toolBlock.name);
    write('RAW-243-VERIFIER.jsonl', {
      callIndex: callsMade, recordKind: 'RAW_VERIFIER_243', callKind: 'PRIMARY',
      executorVersion: EXECUTOR_VERSION, frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST,
      caseId, declarationId: v.declarationId, factKey: v.factKey,
      instructionIdentity: v.identities.instruction, userPromptIdentity: v.identities.userPrompt,
      schemaIdentity: v.identities.schema,
      requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: out.respondedModel,
      httpStatus: out.httpStatus, reachedInference: out.reachedInference, stopReason: out.stopReason,
      inputTokens: out.inputTokens, outputTokens: out.outputTokens,
      costUsd: Number(out.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
      latencyMs: out.latencyMs, failureClass: out.failureClass,
      rawPersistedBeforeDerivation: true, outputRepaired: false,
      raw: out.raw, parsed: out.parsed, timestamp: new Date().toISOString(),
    });
    write('CALL-LEDGER-243.jsonl', {
      callIndex: callsMade, key: `VF:${caseId}`, leg: 'VERIFIER', callKind: 'PRIMARY',
      contingencyReason: null, caseId, costUsd: Number(out.costUsd.toFixed(6)),
      failureClass: out.failureClass, httpStatus: out.httpStatus,
    });
    const pr = (out.parsed?.propertyReview ?? null) as Record<string, unknown> | null;
    verifierRecords[caseId] = {
      ran: true, declarationId: v.declarationId, factKey: v.factKey,
      failureClass: out.failureClass, propertyReview: pr,
      siblingDeclarationsNotTargeted: asm.admittedFacts.length - 1,
      refused: asm.refused, projectionCodes: asm.projectionCodes,
    };
    console.log(`  ${String(callsMade).padStart(2)} VF  ${caseId.padEnd(3)} `
      + `${out.failureClass.padEnd(17)} role=${String(pr?.propertySemanticRole ?? '-').slice(0, 24).padEnd(24)} `
      + `USD ${spendUsd.toFixed(4)}`);
  }

  const summary = {
    artifact: 'SECTION-243-EXECUTION-SUMMARY',
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_243_VERSION,
    frozenInstrumentDigest: AUTHORIZED_INSTRUMENT_DIGEST, frozenPackageDigest: AUTHORIZED_PACKAGE_DIGEST,
    completedAt: new Date().toISOString(),
    casesExecuted: Object.keys(fpResult).length, casesTotal: 24,
    providerCalls: callsMade, primaryAuthorized: PRIMARY_CALLS, maximumAuthorized: MAX_CALLS,
    contingencyCallsUsed: contingencyUsed,
    actualSpendUsd: Number(spendUsd.toFixed(6)), spendCeilingUsd: SPEND_CEILING_USD,
    ceilingReached: stopped !== null, stoppedBecause: stopped,
    databaseOperations: 0, semanticRetries: 0, outputsRepaired: 0,
    verifierLegs: verifierRecords,
    perCase: Object.fromEntries(Object.entries(fpResult).map(([k, v]) => [k, {
      failureClass: v.outcome.failureClass, stopReason: v.outcome.stopReason,
      admitted: v.projection.admitted, codes: v.projection.codes,
      posture: v.projection.posture?.posture ?? null,
      recommendationState: v.projection.recommendationState,
      inputTokens: v.outcome.inputTokens, outputTokens: v.outcome.outputTokens,
      costUsd: Number(v.outcome.costUsd.toFixed(6)),
    }])),
  };
  writeFileSync(join(EVID, 'SECTION-243-EXECUTION-SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('');
  console.log(`  cases executed   ${summary.casesExecuted}/24`);
  console.log(`  provider calls   ${callsMade} (contingency ${contingencyUsed})`);
  console.log(`  actual spend     USD ${spendUsd.toFixed(4)} of ${SPEND_CEILING_USD.toFixed(2)}`);
  console.log(`  stopped because  ${stopped ?? 'RAN TO COMPLETION'}`);
})().catch(e => { console.error(String(e)); process.exit(1); });
