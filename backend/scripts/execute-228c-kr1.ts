/**
 * §228C — EXECUTE the frozen KR-1 coverage-completion case.
 *
 * At most 2 provider calls. Hard ceiling USD 0.30. 0 database operations. No contingency draw and
 * no retry: if the first pass truncates, malforms or omits the declaration, the run STOPS and
 * returns COVERAGE_INSUFFICIENT.
 *
 * Raw is persisted before any derivation. The authority path runs through the real runtime with the
 * preregistered human actions, which were frozen before this file transmitted anything.
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
  KR1_CASE_228C, CALL_PLAN_228C, instrumentDigest228C, runTruthPreflight228C,
} from './lib/expert-228c-kr1-instrument';
import {
  assembleFirstPass228C, assembleVerifier228C, ASSEMBLY_228C_VERSION,
  ANALYSIS_ID_228C, OBSERVATION_SOURCE_ID_228C,
} from './lib/expert-228c-assembly';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import { project210jDeclarations } from './lib/expert-210j-declaration-projection';

import type { OwedFact, ArbitrationRequest }
  from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { createOwedFactLedger, factOf }
  from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
} from '../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';
import { propertyAuthorityRequirementFor, mayBeSettledUnderPropertyAuthority }
  from '../src/hazlenz/expert-hazlenz/owed-facts/property-authority';

const EXECUTOR_VERSION = 'hazlenz.expert.228c.kr1-execution.v1';
const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228c-kr1-coverage-completion-2026-09-11');
const FROZEN = JSON.parse(readFileSync(join(OUT, 'SECTION-228C-FROZEN-PROTOCOL.json'), 'utf8'));
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const write = (f: string, o: unknown): void => { appendFileSync(join(OUT, f), JSON.stringify(o) + '\n'); };
mkdirSync(OUT, { recursive: true });

// ---- pre-spend identity
const pf = runTruthPreflight228C();
if (!pf.allPassed) throw new Error('§228C ABORT: preflight is not passing');
if (FROZEN.instrumentDigest !== instrumentDigest228C()) {
  throw new Error('§228C ABORT: the instrument changed since the freeze');
}
const asm = assembleFirstPass228C();
if (asm.identities.systemPrompt !== FROZEN.identity.systemPromptDigest
  || asm.identities.userPrompt !== FROZEN.identity.userPromptDigest
  || asm.identities.wireSchema !== FROZEN.identity.wireSchemaDigest) {
  throw new Error('§228C ABORT: the assembled call does not match its frozen identity');
}

const apiKey = process.env.ANTHROPIC_API_KEY as string;
if (!apiKey) throw new Error('§228C ABORT: no ANTHROPIC_API_KEY');
const MAX_TOKENS = 4000;
let callsMade = 0; let spendUsd = 0;

interface Out {
  httpStatus: number | null; reachedInference: boolean; failureClass: string;
  parsed: Record<string, unknown> | null; raw: Record<string, any>;
  inputTokens: number | null; outputTokens: number | null; costUsd: number;
  stopReason: string | null; latencyMs: number; respondedModel: string | null;
  providerErrorType: string | null; providerErrorMessage: string | null;
}

async function transmit(body: Record<string, unknown>, tool: string): Promise<Out> {
  const wire = JSON.stringify(body);
  if (wire.includes('cache_control')) throw new Error('§228C ABORT: cache_control present');
  if (callsMade >= CALL_PLAN_228C.maximumPrimaryCalls) {
    throw new Error('§228C ABORT: call ceiling');
  }
  if (spendUsd >= CALL_PLAN_228C.hardCeilingUsd) throw new Error('§228C ABORT: spend ceiling');
  callsMade += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 180_000);
  let json: Record<string, any> = {}; let httpStatus: number | null = null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion },
      body: wire, signal: controller.signal,
    });
    httpStatus = res.status; json = await res.json() as Record<string, any>;
  } catch (e) {
    clearTimeout(timer);
    return { httpStatus, reachedInference: false, failureClass: 'TRANSPORT_FAILURE', parsed: null,
      raw: { transportError: String(e) }, inputTokens: null, outputTokens: null, costUsd: 0,
      stopReason: null, latencyMs: Date.now() - started, respondedModel: null,
      providerErrorType: 'transport', providerErrorMessage: String(e) };
  }
  clearTimeout(timer);
  const inputTokens = (json.usage?.input_tokens as number | undefined) ?? null;
  const outputTokens = (json.usage?.output_tokens as number | undefined) ?? null;
  const costUsd = (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;
  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(x => x.type === 'tool_use' && x.name === tool);
  const parsed = (block?.input as Record<string, unknown> | undefined) ?? null;
  const failureClass = httpStatus !== 200 ? 'HTTP_FAILURE'
    : json.stop_reason === 'max_tokens' ? 'OUTPUT_TRUNCATED'
      : parsed === null ? 'NO_TOOL_USE_BLOCK' : 'NO_FAILURE';
  return { httpStatus, reachedInference: httpStatus === 200 && json.content !== undefined,
    failureClass, parsed, raw: json, inputTokens, outputTokens, costUsd,
    stopReason: (json.stop_reason as string | undefined) ?? null,
    latencyMs: Date.now() - started, respondedModel: (json.model as string | undefined) ?? null,
    providerErrorType: (json.error?.type as string | undefined) ?? null,
    providerErrorMessage: (json.error?.message as string | undefined) ?? null };
}

void (async () => {
  console.log(`§228C KR-1 COVERAGE COMPLETION — frozen ${FROZEN.instrumentDigest.slice(0, 16)}…`);
  console.log(`1 case, ${CALL_PLAN_228C.maximumPrimaryCalls} calls max, ceiling USD `
    + `${CALL_PLAN_228C.hardCeilingUsd}, projected USD ${CALL_PLAN_228C.projectedSpendUsd}\n`);

  // ---------------- LEG 1
  const asSent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(asm.wireSchema));
  const fp1 = await transmit({
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: MAX_TOKENS,
    system: asm.systemPrompt, messages: [{ role: 'user', content: asm.userPrompt }],
    tools: [{ name: EXPERT_TOOL_NAME,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      input_schema: asSent }],
    tool_choice: { type: 'tool', name: EXPERT_TOOL_NAME },
    thinking: { type: 'disabled' },
  }, EXPERT_TOOL_NAME);

  write('RAW-228C.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_FIRST_PASS_228C', callKind: 'PRIMARY',
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_228C_VERSION,
    frozenInstrumentDigest: FROZEN.instrumentDigest, caseId: KR1_CASE_228C.caseId,
    analysisId: ANALYSIS_ID_228C, observationSourceId: OBSERVATION_SOURCE_ID_228C,
    systemPromptIdentity: asm.identities.systemPrompt,
    userPromptIdentity: asm.identities.userPrompt,
    wireSchemaIdentity: asm.identities.wireSchema,
    transmittedSchemaSha256: sha(JSON.stringify(asSent)),
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: fp1.respondedModel,
    httpStatus: fp1.httpStatus, reachedInference: fp1.reachedInference, stopReason: fp1.stopReason,
    inputTokens: fp1.inputTokens, outputTokens: fp1.outputTokens,
    costUsd: Number(fp1.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: fp1.latencyMs, failureClass: fp1.failureClass,
    rawPersistedBeforeDerivation: true, outputRepaired: false,
    raw: fp1.raw, parsed: fp1.parsed, timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-228C.jsonl', { callIndex: callsMade, leg: 'FIRST_PASS', callKind: 'PRIMARY',
    costUsd: Number(fp1.costUsd.toFixed(6)), failureClass: fp1.failureClass,
    httpStatus: fp1.httpStatus });

  const decls = fp1.parsed?.unresolvedFactDeclarations;
  const declShape = Array.isArray(decls) ? 'ARRAY'
    : typeof decls === 'string' ? 'STRING' : decls === undefined || decls === null ? 'ABSENT' : 'OTHER';
  console.log(`  1 FP  ${fp1.failureClass.padEnd(18)} decls=${declShape}`
    + `${Array.isArray(decls) ? `(${decls.length})` : ''}  out=${fp1.outputTokens}tok  `
    + `USD ${spendUsd.toFixed(4)}`);

  const stopNow = (reason: string): void => {
    const r = {
      artifact: 'SECTION-228C-RAW-RESULTS', stopped: true, stoppedBecause: reason,
      retryAttempted: false, retryForbidden: true,
      callsExecuted: callsMade, spendUsd: Number(spendUsd.toFixed(6)),
      firstPass: { failureClass: fp1.failureClass, stopReason: fp1.stopReason,
        outputTokens: fp1.outputTokens, declarationsShape: declShape },
      kr1Exercised: false,
    };
    writeFileSync(join(OUT, 'SECTION-228C-RAW-RESULTS.json'), JSON.stringify(r, null, 2) + '\n');
    console.log(`\nSTOPPED: ${reason}. No retry. COVERAGE_INSUFFICIENT.`);
  };

  if (fp1.failureClass !== 'NO_FAILURE' || !Array.isArray(decls) || decls.length === 0) {
    stopNow(`first pass did not produce a usable declaration — failureClass `
      + `${fp1.failureClass}, declarations shape ${declShape}`);
    return;
  }

  // ---------------- LEG 2
  const va = assembleVerifier228C(fp1.parsed as Record<string, unknown>);
  let vf: Out | null = null;
  let verifierConsistency: unknown = null;
  let scopeContainment: unknown = null;
  if (va.built === null) {
    stopNow(`no declaration survived §210J projection — ${JSON.stringify(va.refused)}`);
    return;
  }
  const v = va.built;
  vf = await transmit({
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model, max_tokens: MAX_TOKENS,
    system: v.systemPrompt, messages: [{ role: 'user', content: v.userPrompt }],
    tools: [{ name: v.toolBlock.name, description: v.toolBlock.description,
      input_schema: stripAnthropicUnsupportedKeywords(
        applyStrictSchemaWrapper(v.toolBlock.input_schema as Record<string, unknown>)) }],
    tool_choice: { type: 'tool', name: v.toolBlock.name },
    thinking: { type: 'disabled' },
  }, v.toolBlock.name);

  write('RAW-228C.jsonl', {
    callIndex: callsMade, recordKind: 'RAW_VERIFIER_228C', callKind: 'PRIMARY',
    executorVersion: EXECUTOR_VERSION, frozenInstrumentDigest: FROZEN.instrumentDigest,
    caseId: KR1_CASE_228C.caseId, declarationId: v.declarationId, factKey: v.factKey,
    instructionIdentity: v.identities.instruction, userPromptIdentity: v.identities.userPrompt,
    schemaIdentity: v.identities.schema,
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model, respondedModel: vf.respondedModel,
    httpStatus: vf.httpStatus, reachedInference: vf.reachedInference, stopReason: vf.stopReason,
    inputTokens: vf.inputTokens, outputTokens: vf.outputTokens,
    costUsd: Number(vf.costUsd.toFixed(6)), cumulativeSpendUsd: Number(spendUsd.toFixed(6)),
    latencyMs: vf.latencyMs, failureClass: vf.failureClass,
    rawPersistedBeforeDerivation: true, outputRepaired: false,
    raw: vf.raw, parsed: vf.parsed, timestamp: new Date().toISOString(),
  });
  write('CALL-LEDGER-228C.jsonl', { callIndex: callsMade, leg: 'VERIFIER', callKind: 'PRIMARY',
    costUsd: Number(vf.costUsd.toFixed(6)), failureClass: vf.failureClass,
    httpStatus: vf.httpStatus });

  const pr = (vf.parsed?.propertyReview ?? null) as Record<string, any> | null;
  console.log(`  2 VF  ${vf.failureClass.padEnd(18)} role=${pr?.propertySemanticRole ?? '-'} `
    + `valid=${pr?.propertyValidity ?? '-'}  USD ${spendUsd.toFixed(4)}`);

  if (pr !== null) {
    const vOut = (vf.parsed ?? {}) as Record<string, any>;
    verifierConsistency = checkPropertyReview218({
      scope: { targetDeclarationId: v.declarationId, targetFactKey: v.factKey },
      output: { propertyReview: vOut.propertyReview, verdict: vOut.verdict,
        owedFactDeclarations: vOut.owedFactDeclarations },
    });
    scopeContainment = checkScopeContainment({
      scope: { targetFactKey: v.factKey, suppliedFactKeys: [v.factKey],
        multiFactValidationRequested: false },
      output: { nominatedFact: vOut.nominatedFact ?? null,
        clarificationSourceMode: vOut.clarificationSourceMode,
        owedFactDeclarations: vOut.owedFactDeclarations },
    });
  }

  // ---------------- THE KR-1 AUTHORITY PATH, through the real runtime
  const adapted = (decls as Record<string, unknown>[])
    .map(d => ({ ...d, observationSourceId: OBSERVATION_SOURCE_ID_228C }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: OBSERVATION_SOURCE_ID_228C, text: KR1_CASE_228C.observation }],
    suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  });
  const facts = proj.projection.perDeclaration
    .filter(p => p.admitted && p.owedFact !== null)
    .map(p => p.owedFact as OwedFact);
  const target = facts[0];
  const declaredProperty = String(adapted[0].missingFact ?? '');

  const ledger = createOwedFactLedger('PRODUCTION', facts);
  const req: ArbitrationRequest = {
    factKey: target.factKey, requestedBy: 'VERIFIER', settles: false, factStatusUnchanged: true,
    reason: 'the §228C frozen KR-1 exercise raises this fact for human settlement review',
  };
  const consumed = consumeSettlementClaims([req], ledger, `${ANALYSIS_ID_228C}-228C`);
  const claim = consumed.claims[0];

  // NO PROPERTY REVIEW IS PERFORMED. This is the KR-1 condition, frozen before the call.
  const propertyAuthorityAtClaim = claim.propertyAuthorityState;
  const propertyAuthorityAfter = claim.propertyAuthorityState;

  // A HUMAN DOES APPROVE THE EVIDENCE. Frozen before the call.
  const evidence = mintSettlementAuthority(claim, {
    claimId: claim.claimId, factKey: claim.factKey, decision: 'APPROVE_SETTLEMENT',
    reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
    rationale: 'the answer supplied is sufficient to settle the fact as stated',
    reviewedEvidenceDigest: claim.evidenceDigest, decidedAt: '2026-09-11T00:00:00.000Z',
  });

  const application = evidence.authority === null ? null
    : settleByReviewedEvidence(ledger, claim, evidence.authority);
  const after = application?.ledger ?? ledger;
  const finalFact = factOf(after, target.factKey)!;

  const results = {
    artifact: 'SECTION-228C-RAW-RESULTS',
    stopped: false, stoppedBecause: null, retryAttempted: false,
    executorVersion: EXECUTOR_VERSION, assemblyVersion: ASSEMBLY_228C_VERSION,
    frozenInstrumentDigest: FROZEN.instrumentDigest,
    callsExecuted: callsMade, spendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: CALL_PLAN_228C.hardCeilingUsd, databaseOperations: 0,
    semanticPreferenceRetries: 0, contingencyCalls: 0, outputRepaired: false,

    firstPass: {
      failureClass: fp1.failureClass, stopReason: fp1.stopReason,
      inputTokens: fp1.inputTokens, outputTokens: fp1.outputTokens,
      declarationsShape: declShape, declarationCount: (decls as unknown[]).length,
      declarations: decls,
      candidates: (fp1.parsed?.expertHazardCandidates ?? []) as unknown[],
      clarifications: (fp1.parsed?.decisionCriticalClarifications ?? []) as unknown[],
      uncertainty: fp1.parsed?.uncertainty ?? null,
      outcome: fp1.parsed?.outcome ?? null,
      explanation: fp1.parsed?.expertExplanation ?? null,
    },
    projection: {
      admittedCount: facts.length,
      perDeclaration: va.projectionCodes, refused: va.refused,
      admittedFactKey: target.factKey,
      declaredProperty,
      evidenceSpan: target.evidenceSpan,
      modelAuthored: target.modelAuthored,
    },
    verifier: {
      reached: true, failureClass: vf.failureClass,
      declarationId: v.declarationId, factKey: v.factKey,
      propertyReview: pr, consistency: verifierConsistency, scopeContainment,
    },
    kr1: {
      propertyAuthorityRequirement: propertyAuthorityRequirementFor(target),
      humanPropertyActionPerformed: 'NONE',
      propertyAuthorityAtClaim, propertyAuthorityAfter,
      stateMayPermitSettlement: mayBeSettledUnderPropertyAuthority(propertyAuthorityAfter),
      humanEvidenceActionPerformed: 'APPROVE_SETTLEMENT',
      evidenceAuthorityMinted: evidence.authority !== null,
      evidenceAuthorityRefusedBecause: evidence.refusedBecause,
      settlementAttempted: application !== null,
      settlementApplied: application?.applied ?? false,
      settlementRefusedBecause: application?.refusedBecause ?? [],
      factStatusAfter: finalFact.status,
      ledgerTransitions: after.transitions.length,
      transitions: after.transitions.map(t => ({ ...t })),
      providerMintedPropertyAuthority: false,
    },
    completedAt: new Date().toISOString(),
  };
  writeFileSync(join(OUT, 'SECTION-228C-RAW-RESULTS.json'), JSON.stringify(results, null, 2) + '\n');

  console.log(`\nKR-1 PATH`);
  console.log(`  property authority requirement  ${results.kr1.propertyAuthorityRequirement}`);
  console.log(`  human property action           ${results.kr1.humanPropertyActionPerformed}`);
  console.log(`  authority at claim / after      ${propertyAuthorityAtClaim} / ${propertyAuthorityAfter}`);
  console.log(`  evidence authority minted       ${results.kr1.evidenceAuthorityMinted}`);
  console.log(`  settlement attempted            ${results.kr1.settlementAttempted}`);
  console.log(`  settlement applied              ${results.kr1.settlementApplied}`);
  console.log(`  refused because                 ${JSON.stringify(results.kr1.settlementRefusedBecause)}`);
  console.log(`  final fact status               ${results.kr1.factStatusAfter}`);
  console.log(`  ledger transitions              ${results.kr1.ledgerTransitions}`);
  console.log(`\n${callsMade} calls · USD ${spendUsd.toFixed(4)} of ${CALL_PLAN_228C.hardCeilingUsd}`);
})();
