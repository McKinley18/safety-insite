/**
 * §254 -- DRIVER-ROLE HOSTED CONFIRMATION EXECUTION.
 *
 * Six frozen observations, ONE primary provider call each, through the canonical production Expert
 * path. The harness adds recording and scoring and nothing else: the request bytes are assembled by
 * `runExpertHazLenzAnalysis` and the same exported provider-native functions the hosted adapter
 * calls, so what is transmitted is what the product would transmit.
 *
 * THE SCORER IS AUTHORED HERE, ABOVE THE EXECUTION, AND READS THE FROZEN RUBRIC FROM THE INSTRUMENT
 * FILE. It never reads an observed output to decide what to expect. Its source digest is recorded in
 * the evidence so a later reader can confirm it was not adjusted after results were seen.
 *
 * A semantically wrong answer is EVIDENCE. There is no retry for a wrong role, a wrong posture,
 * over-restriction, under-restriction, a failed justification or a gate failure. The frozen execution
 * policy allows a contingency call for a transport-level failure only, and §254 invents no other.
 *
 * The verifier leg is NOT run: the frozen spend design is first pass only.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
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
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, classifyHttpFailure, errorTypeOf,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, envelopeBoundOptions, EXPERT_REQUEST_ENVELOPE,
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/expert-request-envelope';
import { POSTURE_PROTECTIVE_RANK }
  from '../src/hazlenz/expert-hazlenz/contract/expert-233-posture-contract';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { runPreSpendGate254, AUTHORIZED } from './verify-254-pre-spend';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-254-driver-role-hosted-confirmation-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const write = (f: string, o: unknown): void =>
  appendFileSync(join(OUT, f), `${JSON.stringify(o)}\n`);

const EXECUTOR_VERSION = 'hazlenz.expert.254.driver-role-confirmation.v1' as const;
const CALL_CEILING = 8;          // 6 primary + up to 2 transport contingencies, per the frozen policy
const SPEND_CEILING_USD = 2.00;

/** THE SIX FROZEN OBSERVATIONS, verbatim. Byte-checked against the instrument before any call. */
const CASES: readonly { id: string; observation: string; families: string[] }[] = [
  { id: 'H1', families: ['WORK_AT_HEIGHT'],
    observation: 'A scaffold with one missing guardrail section on the north face; the gap is '
      + 'physically barriered off with Heras fencing and the crew are working on the south face.' },
  { id: 'H2', families: ['CONFINED_SPACE'],
    observation: 'A confined-space entry in progress with gas testing current, a top-man posted, '
      + 'and no rescue plan on site.' },
  { id: 'H3', families: ['WORK_AT_HEIGHT', 'STRUCTURAL'],
    observation: 'A mobile elevating work platform being operated on a slab whose loading capacity '
      + 'the site file does not record.' },
  { id: 'H4', families: ['FIRE'],
    observation: 'A hot-works permit that expires at 16:00 with work due to finish at 15:30, '
      + 'weather clear.' },
  { id: 'H5', families: ['EXCAVATION'],
    observation: 'An excavation with battered sides in stable ground, spoil set back, and no ladder '
      + 'within 25 metres of the working position.' },
  { id: 'H6', families: ['LIFTING'],
    observation: 'A lifting operation with a valid thorough-examination certificate, a competent '
      + 'slinger, and an exclusion zone that one delivery driver has walked through once.' },
];

// ================================================================ THE SCORER, PRE-FROZEN

/**
 * Score one case against the FROZEN rubric row for that case. Reads only the rubric and the observed
 * output; contains no case-specific special pleading and no post-hoc exception.
 */
export interface FrozenCaseRubric {
  id: string; distinction: string; trap: string;
  mustBePresent: string[]; mustBePresentOptional?: string[]; mustBeAbsent: string[];
  posture: string[]; owedFacts: string[];
}

export interface CaseScore {
  caseId: string;
  /** Did the output enter canonical state at all. Gate 4. */
  structurallyAdmitted: boolean;
  rolesEmitted: string[];
  postureEmitted: string | null;
  mustBePresentSatisfied: boolean;
  mustBeAbsentRespected: boolean;
  /** Gate 5. Both halves of the role requirement hold. */
  rolePresenceCoherent: boolean;
  postureInFrozenSet: boolean;
  /** Gate 1. The emitted posture is less protective than anything the frozen set allows. */
  unsafeUnderRestriction: boolean;
  /** Over-restriction: more protective than anything the frozen set allows. */
  overRestriction: boolean;
  /** Gate 2, evaluated on H1 and H4 only; NOT_EXERCISED elsewhere. */
  cessationOnNegatedOrManufactured: 'OCCURRED' | 'DID_NOT_OCCUR' | 'NOT_EXERCISED';
  /** Gate 3. */
  k6Invalid: boolean;
  /** Gate 6. */
  justificationComplete: boolean;
  driverRoleDisposition: 'CORRECT' | 'ROLE_PRESENCE_BREACH' | 'NOT_EVALUABLE';
  notEvaluableBecause: string | null;
}

export function scoreCase(
  rubric: FrozenCaseRubric,
  observed: {
    status: string; admission: string | null; postureRefusalCodes: readonly string[];
    roleJustificationCodes: readonly string[];
    conformanceCodes: readonly string[]; posture: any;
  },
): CaseScore {
  const structurallyAdmitted = observed.status === 'COMPLETE'
    && observed.conformanceCodes.length === 0
    && observed.postureRefusalCodes.length === 0
    && observed.roleJustificationCodes.length === 0;

  const p = (observed.posture ?? {}) as any;
  const postureObj = (p.posture ?? null) as any;
  const postureEmitted: string | null = postureObj && typeof postureObj === 'object'
    ? (postureObj.posture ?? null) : (typeof postureObj === 'string' ? postureObj : null);
  const rolesEmitted: string[] = Array.isArray(postureObj?.requiredBy)
    ? postureObj.requiredBy.map((d: any) => String(d.driverRole)) : [];

  const mustBePresentSatisfied = rubric.mustBePresent.every(r => rolesEmitted.includes(r));
  const mustBeAbsentRespected = rubric.mustBeAbsent.every(r => !rolesEmitted.includes(r));
  const rolePresenceCoherent = structurallyAdmitted
    && mustBePresentSatisfied && mustBeAbsentRespected;

  const rank = POSTURE_PROTECTIVE_RANK as Record<string, number>;
  const allowed = rubric.posture.map(x => rank[x]).filter(x => typeof x === 'number');
  const got = postureEmitted === null ? null : rank[postureEmitted];
  const postureInFrozenSet = postureEmitted !== null && rubric.posture.includes(postureEmitted);
  const unsafeUnderRestriction = structurallyAdmitted && got !== undefined && got !== null
    && allowed.length > 0 && got < Math.min(...allowed);
  const overRestriction = structurallyAdmitted && got !== undefined && got !== null
    && allowed.length > 0 && got > Math.max(...allowed);

  const gate2Cases = ['H1', 'H4'];
  const cessationOnNegatedOrManufactured = !gate2Cases.includes(rubric.id)
    ? 'NOT_EXERCISED'
    : (!structurallyAdmitted ? 'NOT_EXERCISED'
      : (rolesEmitted.includes('ESTABLISHED_CONDITION_REQUIRING_CESSATION')
        ? 'OCCURRED' : 'DID_NOT_OCCUR'));

  const k6Invalid = observed.postureRefusalCodes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND');
  const justificationComplete = observed.roleJustificationCodes.length === 0
    && observed.status !== 'PROVIDER_FAILED';

  const driverRoleDisposition: CaseScore['driverRoleDisposition'] = !structurallyAdmitted
    ? 'NOT_EVALUABLE' : (rolePresenceCoherent ? 'CORRECT' : 'ROLE_PRESENCE_BREACH');

  return {
    caseId: rubric.id, structurallyAdmitted, rolesEmitted, postureEmitted,
    mustBePresentSatisfied, mustBeAbsentRespected, rolePresenceCoherent, postureInFrozenSet,
    unsafeUnderRestriction, overRestriction, cessationOnNegatedOrManufactured, k6Invalid,
    justificationComplete, driverRoleDisposition,
    notEvaluableBecause: structurallyAdmitted ? null
      : `the analysis did not enter canonical state (status=${observed.status}, `
        + `admission=${observed.admission})`,
  };
}

// ================================================================ execution

interface CallRecord {
  callIndex: number; caseId: string; callKind: 'PRIMARY' | 'CONTINGENCY';
  contingencyReason: string | null; httpStatus: number | null; reachedInference: boolean;
  stopReason: string | null; respondedModel: string | null;
  inputTokens: number | null; outputTokens: number | null; costUsd: number | null;
  latencyMs: number; failureClass: string | null; timestamp: string;
}

let callsMade = 0;
let spendUsd = 0;
const ledger: CallRecord[] = [];

class RecordingTransport implements ExpertSemanticTransport {
  constructor(private readonly caseId: string) {}
  lastRequest: any = null;
  lastRawResponse: any = null;
  verifierRequested = false;

  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (request.leg !== 'FIRST_PASS') {
      // The frozen spend design is first pass only. Not a failure; a bound of the instrument.
      this.verifierRequested = true;
      return { ok: false, toolInput: null, failureKind: 'VERIFIER_LEG_NOT_IN_FROZEN_SPEND_DESIGN',
        detail: 'the frozen instrument authorizes the first-pass leg only' };
    }
    const started = Date.now();
    const inputSchema = stripAnthropicUnsupportedKeywords(
      applyStrictSchemaWrapper(request.wireSchema));
    const body = buildEnvelopeRequestBody({
      leg: request.leg, systemPrompt: request.systemPrompt, userPrompt: request.userPrompt,
      toolName: request.toolName, toolDescription: request.toolDescription, inputSchema,
    });
    const tool = (body.tools as any[])[0];
    this.lastRequest = {
      model: body.model, maxTokens: body.max_tokens, toolName: tool.name,
      strictOnTheWire: tool.strict,
      forcedToolChoice: JSON.stringify(body.tool_choice)
        === JSON.stringify({ type: 'tool', name: tool.name }),
      system: sha(request.systemPrompt), user: sha(request.userPrompt),
      canonicalSchema: sha(JSON.stringify(request.wireSchema)),
      transmittedSchema: sha(JSON.stringify(inputSchema)),
      requestDigest: sha(JSON.stringify(body)),
      timestamp: new Date().toISOString(),
    };

    const rec = (o: Partial<CallRecord>): void => {
      const r: CallRecord = {
        callIndex: callsMade, caseId: this.caseId, callKind: 'PRIMARY', contingencyReason: null,
        httpStatus: null, reachedInference: false, stopReason: null, respondedModel: null,
        inputTokens: null, outputTokens: null, costUsd: null,
        latencyMs: Date.now() - started, failureClass: null,
        timestamp: new Date().toISOString(), ...o,
      };
      ledger.push(r); write('CALL-LEDGER-254.jsonl', r);
    };

    if (callsMade >= CALL_CEILING) {
      rec({ failureClass: 'CALL_CEILING' });
      return { ok: false, toolInput: null, failureKind: 'CALL_CEILING', detail: 'ceiling' };
    }
    if (spendUsd >= SPEND_CEILING_USD) {
      rec({ failureClass: 'SPEND_CEILING' });
      return { ok: false, toolInput: null, failureKind: 'SPEND_CEILING', detail: 'ceiling' };
    }

    callsMade += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EXPERT_HOSTED_INFERENCE_CONFIG.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${EXPERT_REQUEST_ENVELOPE.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY as string,
          'anthropic-version': EXPERT_REQUEST_ENVELOPE.apiVersion,
        },
        body: JSON.stringify(body), signal: controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timer);
      const kind = (e as { name?: string })?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR';
      rec({ failureClass: 'TRANSPORT_FAILURE' });
      return { ok: false, toolInput: null, failureKind: kind, detail: 'transport' };
    } finally { clearTimeout(timer); }

    if (!response.ok) {
      const t = await response.text().catch(() => '');
      rec({ httpStatus: response.status, failureClass: 'HTTP_FAILURE' });
      this.lastRawResponse = { httpStatus: response.status, errorType: errorTypeOf(t) };
      return { ok: false, toolInput: null,
        failureKind: classifyHttpFailure(response.status, t),
        detail: `HTTP ${response.status} ${errorTypeOf(t)}` };
    }

    const env = await response.json() as Record<string, any>;
    const usage = (env.usage ?? {}) as Record<string, number>;
    const cost = ((usage.input_tokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
      + ((usage.output_tokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
    spendUsd += cost;
    rec({
      httpStatus: response.status, reachedInference: true,
      stopReason: typeof env.stop_reason === 'string' ? env.stop_reason : null,
      respondedModel: typeof env.model === 'string' ? env.model : null,
      inputTokens: usage.input_tokens ?? null, outputTokens: usage.output_tokens ?? null,
      costUsd: cost,
    });
    this.lastRawResponse = env;

    write('RAW-254-FIRST-PASS.jsonl', {
      recordKind: 'RAW_FIRST_PASS_254', executorVersion: EXECUTOR_VERSION,
      caseId: this.caseId, callIndex: callsMade,
      candidateIdentity: AUTHORIZED.candidateIdentity,
      instrumentDigest: AUTHORIZED.instrumentDigest,
      request: this.lastRequest,
      respondedModel: env.model, stopReason: env.stop_reason, usage,
      raw: env.content,
    });

    if (env.stop_reason === 'refusal') {
      return { ok: false, toolInput: null, failureKind: 'PROVIDER_REFUSAL', detail: 'declined' };
    }
    if (env.stop_reason === 'max_tokens') {
      return { ok: false, toolInput: null, failureKind: 'TRUNCATED_RESPONSE', detail: 'limit' };
    }
    const block = (Array.isArray(env.content) ? env.content : [])
      .find((b: any) => b?.type === 'tool_use' && b?.name === request.toolName);
    if (!block) {
      return { ok: false, toolInput: null, failureKind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT',
        detail: 'no tool_use block' };
    }
    return { ok: true, toolInput: block.input, failureKind: null, detail: null };
  }
}

async function main(): Promise<void> {
  console.log('---- §254 PRE-SPEND GATE ----');
  const gate = await runPreSpendGate254();
  gate.checks.forEach(c => console.log(`${c.verdict}  ${c.id}`));
  const failed = gate.checks.filter(c => c.verdict === 'FAIL');
  writeFileSync(join(OUT, 'SECTION-254-PRE-SPEND-GATE.json'), JSON.stringify({
    section: '254', generated: '2026-09-12',
    verdict: failed.length === 0 ? 'PASS' : 'FAIL',
    authorized: AUTHORIZED,
    liveDerivedCandidateIdentity: gate.identityDigest,
    checks: gate.checks,
  }, null, 2));
  if (failed.length > 0) {
    console.log('\nSTOP BEFORE SPEND. Provider calls made: 0.');
    process.exit(1);
  }

  // ---- the observation payloads, byte-checked against the instrument, case by case.
  const digests: Record<string, string> = Object.fromEntries(
    (gate.cases as { id: string; sha256: string }[]).map(d => [d.id, d.sha256]));
  const payloadCheck = CASES.map(c => ({
    id: c.id, instrumentSha256: digests[c.id] ?? null, executedSha256: sha(c.observation),
    identical: digests[c.id] === sha(c.observation),
  }));
  if (!payloadCheck.every(p => p.identical)) {
    console.log('\nOBSERVATION PAYLOAD DIFFERS FROM THE FROZEN INSTRUMENT. NOT EXECUTING.');
    writeFileSync(join(OUT, 'SECTION-254-INSTRUMENT-FREEZE-VIOLATION.json'),
      JSON.stringify({ payloadCheck }, null, 2));
    process.exit(1);
  }
  console.log(`\n${gate.checks.length} preconditions PASS; six payloads byte-identical. `
    + 'Proceeding to spend.\n');

  const rubricById: Record<string, FrozenCaseRubric> = Object.fromEntries(
    (gate.instrument.cases as FrozenCaseRubric[]).map(c => [c.id, c]));

  console.log('---- EXECUTION: six frozen observations, one primary call each ----');
  const results: any[] = [];
  for (const c of CASES) {
    const transport = new RecordingTransport(c.id);
    const input: any = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId: `ANL-252-${c.id}`,
      authoritativeSources: [{ sourceId: `obs-${c.id}`, kind: 'OBSERVATION', text: c.observation }],
      inspectionContext: { location: null, task: null },
      jurisdiction: 'GB',
      allowedHazardFamilies: c.families,
      deterministicFindings: [], familyDispositions: [], governedStandards: [],
      answeredClarifications: [],
    };
    const r = await runExpertHazLenzAnalysis({
      input, observation: { sourceId: `obs-${c.id}`, text: c.observation },
      governedRecords: [], governedEvidence: [],
    }, transport);

    const conformanceCodes = [...new Set(r.conformanceViolations.map(v => v.code))];
    const score = scoreCase(rubricById[c.id], {
      status: r.status, admission: r.admission,
      postureRefusalCodes: r.postureRefusalCodes,
      roleJustificationCodes: r.roleJustificationCodes,
      conformanceCodes, posture: { posture: (r.posture as any)?.posture ?? null },
    });

    const row = {
      caseId: c.id,
      observationSha256: sha(c.observation),
      distinction: rubricById[c.id].distinction,
      trap: rubricById[c.id].trap,
      request: transport.lastRequest,
      transport: {
        httpStatus: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.httpStatus ?? null,
        reachedInference: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.reachedInference ?? false,
        stopReason: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.stopReason ?? null,
        respondedModel: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.respondedModel ?? null,
        inputTokens: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.inputTokens ?? null,
        outputTokens: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.outputTokens ?? null,
        costUsd: ledger.filter(l => l.caseId === c.id).slice(-1)[0]?.costUsd ?? null,
      },
      status: r.status,
      admission: r.admission,
      conformanceCodes,
      conformanceViolations: r.conformanceViolations.slice(0, 8),
      postureRefusalCodes: r.postureRefusalCodes,
      roleJustificationCodes: r.roleJustificationCodes,
      declarationRefusals: r.declarationRefusals,
      admittedFactCount: r.admittedFacts.length,
      semanticInventions: r.semanticInventions,
      verifierReached: r.verifier.reached,
      verifierNotReachedBecause: r.verifier.notReachedBecause,
      posture: (r.posture as any)?.posture ?? null,
      recommendationState: (r.posture as any)?.recommendationState ?? null,
      score,
      dischargingControlRefNullObserved: JSON.stringify(
        (r.posture as any)?.posture?.requiredBy ?? []).includes('"dischargingControlRef":null'),
    };
    results.push(row);
    write('PROJECTION-254.jsonl', row);
    console.log(`  ${c.id}  ${r.status.padEnd(20)} admission=${String(r.admission).padEnd(19)} `
      + `posture=${String(score.postureEmitted).padEnd(26)} roles=${score.rolesEmitted.length} `
      + `disposition=${score.driverRoleDisposition}`);
  }

  // ---------------- the six frozen gates
  const scored = results.map(r => r.score as CaseScore);
  const gates = [
    { n: 1, gate: 'unsafe under-restriction', type: 'zero-occurrence',
      occurrences: scored.filter(s => s.unsafeUnderRestriction).map(s => s.caseId),
      held: scored.every(s => !s.unsafeUnderRestriction) },
    { n: 2, gate: 'manufactured or negated condition given a cessation driver (H1,H4)',
      type: 'zero-occurrence',
      occurrences: scored.filter(s => s.cessationOnNegatedOrManufactured === 'OCCURRED')
        .map(s => s.caseId),
      notExercised: scored.filter(s => s.cessationOnNegatedOrManufactured === 'NOT_EXERCISED')
        .map(s => s.caseId),
      held: scored.every(s => s.cessationOnNegatedOrManufactured !== 'OCCURRED') },
    { n: 3, gate: 'K6-invalid output', type: 'zero-occurrence',
      occurrences: scored.filter(s => s.k6Invalid).map(s => s.caseId),
      held: scored.every(s => !s.k6Invalid) },
    { n: 4, gate: 'structural admission', type: 'all', threshold: '6/6',
      observed: `${scored.filter(s => s.structurallyAdmitted).length}/6`,
      held: scored.every(s => s.structurallyAdmitted) },
    { n: 5, gate: 'role-presence coherence', type: 'floor', threshold: '5/6',
      observed: `${scored.filter(s => s.rolePresenceCoherent).length}/6`,
      historicalComparator: 0.6,
      held: scored.filter(s => s.rolePresenceCoherent).length >= 5 },
    { n: 6, gate: 'justification completeness', type: 'all', threshold: '6/6',
      observed: `${scored.filter(s => s.justificationComplete).length}/6`,
      held: scored.every(s => s.justificationComplete) },
  ];
  const allGatesHold = gates.every(g => g.held);

  const summary = {
    section: '254', executorVersion: EXECUTOR_VERSION, generated: '2026-09-12',
    scorerSourceSha256: sha(readFileSync(__filename, 'utf8')),
    candidateIdentity: AUTHORIZED.candidateIdentity,
    instrumentDigest: AUTHORIZED.instrumentDigest,
    envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
    observationPayloadCheck: payloadCheck,
    casesTransmitted: CASES.length,
    providerCalls: callsMade,
    transportContingencies: ledger.filter(l => l.callKind === 'CONTINGENCY').length,
    transportFailures: ledger.filter(l => l.failureClass !== null).length,
    successfulProviderObservations: ledger.filter(l => l.reachedInference).length,
    verifierLegRun: false,
    spendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD, callCeiling: CALL_CEILING,
    totalInputTokens: ledger.reduce((a, l) => a + (l.inputTokens ?? 0), 0),
    totalOutputTokens: ledger.reduce((a, l) => a + (l.outputTokens ?? 0), 0),
    respondedModels: [...new Set(ledger.map(l => l.respondedModel).filter(Boolean))],
    databaseOperations: 0,
    admissionRefusals: results.filter(r => r.status === 'FIRST_PASS_REFUSED').length,
    containedDeclarationRefusals: results.reduce((a, r) => a + r.declarationRefusals.length, 0),
    wholeAnalysisRefusals: results.filter(r => r.status === 'FIRST_PASS_REFUSED').length,
    semanticInventionCount: results.reduce((a, r) => a + r.semanticInventions.length, 0),
    dischargingControlRefEncountered: results.filter(r => r.dischargingControlRefNullObserved)
      .map(r => r.caseId),
    gates, allGatesHold,
    rolePresenceCoherent: scored.filter(s => s.rolePresenceCoherent).length,
    postureIdentityCorrect: scored.filter(s => s.postureInFrozenSet).length,
    overRestrictions: scored.filter(s => s.overRestriction).map(s => s.caseId),
    unsafeUnderRestrictions: scored.filter(s => s.unsafeUnderRestriction).map(s => s.caseId),
    successFloorMet: scored.filter(s => s.rolePresenceCoherent).length >= 5,
    frozenAcceptanceSatisfied: allGatesHold
      && scored.filter(s => s.rolePresenceCoherent).length >= 5,
    results,
  };
  writeFileSync(join(OUT, 'SECTION-254-EXECUTION-SUMMARY.json'), JSON.stringify(summary, null, 2));

  console.log('\n---- FROZEN GATES ----');
  gates.forEach(g => console.log(`${g.held ? 'HOLD' : 'FAIL'}  gate ${g.n} ${g.gate}  `
    + `${(g as any).observed ?? JSON.stringify((g as any).occurrences)}`));
  console.log(`\nrole-presence coherence ${summary.rolePresenceCoherent}/6 (floor 5/6, historical 0.6)`);
  console.log(`posture identity ${summary.postureIdentityCorrect}/6`);
  console.log(`all gates hold: ${allGatesHold}   frozen acceptance satisfied: `
    + `${summary.frozenAcceptanceSatisfied}`);
  console.log(`calls ${callsMade}  spend USD ${spendUsd.toFixed(4)}  `
    + `inputTokens ${summary.totalInputTokens}  outputTokens ${summary.totalOutputTokens}`);
  console.log(`semantic inventions ${summary.semanticInventionCount}   `
    + `DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no`);
}
void main();
