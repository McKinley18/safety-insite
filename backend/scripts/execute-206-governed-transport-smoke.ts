/**
 * §206 -- HOSTED GOVERNED-TRANSPORT SMOKE. BOUNDED PROVIDER EXECUTION.
 *
 * ==================== THE ONE QUESTION ====================
 *
 * Can the EXACT intended §205 governed transport cross the live provider boundary and return
 * contract-usable output, while preserving the intended grammar separation?
 *
 * This is a TRANSPORT / GRAMMAR / CONTRACT smoke. It is NOT an Expert accuracy run, NOT an
 * F1/F2/F4/F7 acceptance run, NOT a semantic regression experiment, NOT an escalation experiment,
 * and NOT the 24-case acceptance cohort.
 *
 * ==================== WHY THE EXACT §205 FIXTURE, AND NOT A CHAINED RUN ====================
 *
 * The §205 identities the product owner requires preserved are functions of their inputs. The
 * governed-stage schema mints a reference per candidate fact -- §202: "Order fixes the minted
 * references and therefore the schema" -- so chaining call 2 off whatever call 1 happens to return
 * would change the governed grammar and the 1,478 B / 58faca1cd094af1b identity would no longer be
 * the thing tested. Likewise the first-pass schema embeds the supplied sourceIds and hazard
 * families.
 *
 * So BOTH calls transmit the artifacts §205 actually measured. The live first-pass output is still
 * projected afterwards, and what it shows is reported as NON-ACCEPTANCE EVIDENCE -- but it is never
 * fed into call 2's grammar, because that would substitute a different transport for the one under
 * test.
 *
 * ==================== THE PREFLIGHT IS A REFUSAL, NOT A LOG LINE ====================
 *
 * Before any call, the canonical byte counts and effective-grammar identities of all three forms
 * are recomputed and compared against the §205 record. A mismatch ABORTS with zero calls. The
 * retired capability-PRESENT form is constructed ONLY for that comparison and is never placed in a
 * request body; the suite asserts its absence from both transmitted bodies by string containment on
 * its distinguishing property as well as by whole-schema inequality.
 *
 * NOTHING IS RESHAPED TO OBTAIN ACCEPTANCE. If the provider refuses the intended grammar, that is
 * the finding. Simplifying the schema to get a 200 would answer a different question.
 *
 * ==================== BOUNDS ====================
 *
 *   initial calls        2
 *   hard ceiling         4  (calls 3-4 ONLY to discriminate isolated provider variability from a
 *                            deterministic transport/contract incompatibility)
 *   database operations  0
 *   spend ceiling        USD 0.50, enforced before each call against the worst case
 *   writes               evidence files under the §206 directory only
 */

import { createHash } from 'crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ---- .env, exactly as §199 loads it: never overwriting an already-exported variable.
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
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, buildExpertVNextWireSchema,
} from './lib/expert-first-pass-instruction-vnext';
import {
  SECTION_199_MEASURED_ENVELOPE, assessGovernedTransport,
} from './lib/expert-205-governed-transport';
import { describeGrammarProjection203 } from './lib/expert-203-effective-grammar-identity';
import {
  type BindingCandidateFact202, type Governed202Record,
} from './lib/expert-202-governed-binding-contract';
import { projectDeclaredOwedFacts } from './lib/expert-first-pass-owed-fact-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-governed-transport-smoke-206-2026-09-08');
const EXECUTOR_VERSION = 'hazlenz.expert.206.governed-transport-smoke.v1' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

// ================================================================ bounds

const INITIAL_CALLS = 2;
const HARD_CALL_CEILING = 4;
const SPEND_CEILING_USD = 0.50;
const FIRST_PASS_MAX_TOKENS = 4000;
const GOVERNED_STAGE_MAX_TOKENS = 1500;
const GOVERNED_TOOL_NAME = 'emit_governed_binding';

/**
 * Which leg of the smoke to run. Each leg is one provider call and appends to an APPEND-ONLY
 * ledger, so a leg is never re-executed merely to regenerate evidence and a re-run cannot silently
 * re-spend. `both` is the default; the legs exist because an operator error during the first
 * execution spent a call on a duplicate first pass, and re-running the whole script to obtain the
 * governed leg would have spent another.
 */
const LEG = (process.argv.find(a => a.startsWith('--leg='))?.slice(6) ?? 'both') as
  'both' | 'first-pass' | 'governed';
const LEDGER = join(EVID, 'CALL-LEDGER-206.jsonl');

const worstCaseUsd = (maxOut: number, estIn: number): number =>
  (maxOut / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok
  + (estIn / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok;

// ================================================================ the §205 fixture, verbatim

/**
 * IDENTICAL to the input `test-205-remediation.ts` measured. Reproduced here rather than imported
 * from the suite so the smoke does not depend on a test file, and byte-compared in preflight so a
 * divergence is a loud abort rather than a silently different experiment.
 */
const TRANSPORT_INPUT: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'fx-205-governed',
  authoritativeSources: [
    { sourceId: 'OBS-R7', sourceType: 'observation',
      text: 'Guarded press in the toolroom. The interlocked gate was closed and the green status '
        + 'lamp was lit. The interlock switch was not accessible for inspection.' },
  ],
  inspectionContext: { location: 'toolroom', task: 'press operation' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding', 'electrical'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};

const CANDIDATE_FACTS: readonly BindingCandidateFact202[] = [{
  factKey: 'FP.REQUIRED_CONTROL.OBS-R7.100-140.1',
  owedProperty: 'whether opening the gate stops hazardous motion',
  affectedDecision: 'REQUIRED_CONTROL',
  evidenceSpan: 'The interlock switch was not accessible for inspection',
  whyUnresolved: 'A closed gate does not establish the protective function.',
  branchA: 'Opening the gate stops hazardous motion',
  branchB: 'Opening the gate does not stop hazardous motion',
}];

const GOVERNED_RECORDS: readonly Governed202Record[] = [
  { sourceId: 'GOV-1', text: 'Governed record text held by HazLenz.' },
];

const INSPECTION = { location: 'toolroom', task: 'press operation' };

// ================================================================ preflight

interface PreflightCheck { id: string; held: boolean; expected: string; actual: string }

const assessment = assessGovernedTransport({
  analysisId: 'fx-205-governed',
  input: TRANSPORT_INPUT,
  facts: CANDIDATE_FACTS,
  governedRecords: GOVERNED_RECORDS,
  inspectionContext: INSPECTION,
});

const firstPassSchema = assessment.routed.firstPassSchema;
const governedSchema = assessment.routed.governedStageSchema;
const governedSchemaAsSent = assessment.routed.governedStageSchemaAsSent;
const firstPassSchemaAsSent =
  stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(firstPassSchema));

/**
 * The retired capability-PRESENT first-pass schema, rebuilt here FOR COMPARISON ONLY so the final
 * pre-transmission guard can compare against the actual object rather than against a property name.
 * It is never placed in a request body and never returned from any function in this file.
 */
const RETIRED_PRESENT_SCHEMA_FOR_COMPARISON_ONLY =
  buildExpertVNextWireSchema(TRANSPORT_INPUT, {
    governedEvidenceSourceIds: GOVERNED_RECORDS.map(r => r.sourceId),
  });
const RETIRED_PRESENT_AS_SENT_FOR_COMPARISON_ONLY = stripAnthropicUnsupportedKeywords(
  applyStrictSchemaWrapper(RETIRED_PRESENT_SCHEMA_FOR_COMPARISON_ONLY));

const preflight: PreflightCheck[] = [
  { id: 'PF1.first-pass-bytes', expected: '18730',
    actual: String(assessment.measuredBytes.routedFirstPassSchema),
    held: assessment.measuredBytes.routedFirstPassSchema === 18730 },
  { id: 'PF2.first-pass-grammar', expected: 'c0df75103834b03c',
    actual: assessment.grammarIdentities.routedFirstPass,
    held: assessment.grammarIdentities.routedFirstPass === 'c0df75103834b03c' },
  { id: 'PF3.retired-present-bytes', expected: '19152',
    actual: String(assessment.measuredBytes.retiredPresentSchema),
    held: assessment.measuredBytes.retiredPresentSchema === 19152 },
  { id: 'PF4.retired-present-grammar', expected: '09825bd0e1b3de13',
    actual: assessment.grammarIdentities.retiredPresent,
    held: assessment.grammarIdentities.retiredPresent === '09825bd0e1b3de13' },
  { id: 'PF5.governed-stage-bytes', expected: '1478',
    actual: String(assessment.measuredBytes.governedStageSchema),
    held: assessment.measuredBytes.governedStageSchema === 1478 },
  { id: 'PF6.governed-stage-grammar', expected: '58faca1cd094af1b',
    actual: assessment.grammarIdentities.governedStage,
    held: assessment.grammarIdentities.governedStage === '58faca1cd094af1b' },
  { id: 'PF7.C1-C5-all-held', expected: 'true', actual: String(assessment.allHeld),
    held: assessment.allHeld },
  { id: 'PF8.routed-binding-is-capability-absent', expected: '0 governed ids',
    actual: `${assessment.routed.firstPassBinding.governedEvidenceSourceIds.length} governed ids`,
    held: assessment.routed.firstPassBinding.governedEvidenceSourceIds.length === 0 },
];

// The retired PRESENT form is distinguished from the routed form by exactly one declaration
// property. Its absence from the transmitted first-pass schema is asserted directly, not inferred.
const routedJson = JSON.stringify(firstPassSchema);
const routedAsSentJson = JSON.stringify(firstPassSchemaAsSent);
preflight.push({
  id: 'PF9.retired-present-property-absent-from-transmitted-schema',
  expected: 'governedEvidenceSourceIds absent',
  actual: routedAsSentJson.includes('governedEvidenceSourceIds') ? 'PRESENT' : 'absent',
  held: !routedJson.includes('governedEvidenceSourceIds')
    && !routedAsSentJson.includes('governedEvidenceSourceIds'),
});

console.log('================ §206 PREFLIGHT (zero provider calls so far)');
for (const c of preflight) {
  console.log(`  ${c.held ? 'PASS' : 'FAIL'}  ${c.id}  expected=${c.expected} actual=${c.actual}`);
}
if (preflight.some(c => !c.held)) {
  console.error('\n§206 ABORT: the §205 transport identities do not reproduce. ZERO PROVIDER CALLS '
    + 'WERE MADE. Nothing is reshaped to obtain acceptance; investigate the divergence first.');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('\n§206 ABORT: ANTHROPIC_API_KEY is not set. ZERO PROVIDER CALLS WERE MADE.');
  process.exit(1);
}

// ================================================================ transport

interface CallRecord {
  callIndex: number;
  purpose: 'ROUTED_FIRST_PASS_CAPABILITY_ABSENT' | 'GOVERNED_STAGE';
  provider: string;
  requestedModel: string;
  respondedModel: string | null;
  canonicalSchemaBytes: number;
  canonicalSchemaGrammarId: string;
  transmittedSchemaBytes: number;
  transmittedBodyBytes: number;
  transmittedSchemaSha256: string;
  governedStageTransmitted: boolean;
  retiredPresentFormTransmitted: false;
  httpStatus: number | null;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
  reachedInference: boolean;
  stopReason: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number;
  latencyMs: number;
  rawStructuralOutcome: string;
  parseAdmissionResult: string;
  retried: boolean;
  retryReason: string | null;
  parsed: Record<string, unknown> | null;
}

let callsMade = 0;
let spendUsd = 0;
const records: CallRecord[] = [];

async function providerCall(args: {
  purpose: CallRecord['purpose'];
  systemPrompt: string;
  userPrompt: string;
  toolName: string;
  canonicalSchema: Record<string, unknown>;
  schemaAsSent: unknown;
  maxTokens: number;
  governedStageTransmitted: boolean;
  retryReason?: string;
}): Promise<CallRecord> {
  if (callsMade >= HARD_CALL_CEILING) {
    throw new Error(`§206 HARD CALL CEILING ${HARD_CALL_CEILING} reached; refusing to call.`);
  }
  const worst = worstCaseUsd(args.maxTokens, 25_000);
  if (spendUsd + worst > SPEND_CEILING_USD) {
    throw new Error(`§206 SPEND CEILING USD ${SPEND_CEILING_USD} would be exceeded; refusing.`);
  }

  const body = {
    model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    max_tokens: args.maxTokens,
    system: args.systemPrompt,
    messages: [{ role: 'user', content: args.userPrompt }],
    tools: [{
      name: args.toolName,
      description: 'Emit the structured result. This is the ONLY way to answer.',
      strict: true,
      input_schema: args.schemaAsSent,
    }],
    tool_choice: { type: 'tool', name: args.toolName },
    thinking: { type: 'disabled' },
  };

  // FINAL GUARD, immediately before transmission. The thing that must never be sent is the RETIRED
  // capability-PRESENT FIRST-PASS SCHEMA, identified by whole-schema equality and by grammar
  // identity -- not by a property name.
  //
  // The first version of this guard scanned the whole wire for the string
  // `governedEvidenceSourceIds` and refused the governed-stage call. That was a DEFECT IN THIS
  // EXECUTOR, not a transport finding: the governed stage's OUTPUT schema legitimately contains a
  // `governedEvidenceSourceIds` array whose items are `enum`-constrained to the supplied ids
  // (here exactly `GOV-1`). That field IS the §202 authority boundary -- the provider selects from
  // a closed supplied set and cannot invent an id -- and refusing it would refuse the very seam
  // §206 exists to test. The guard is narrowed to its actual meaning, NOT relaxed to obtain
  // acceptance: the retired form is still refused absolutely, and the capability-ABSENT first pass
  // is still required to carry no such property at all.
  const wire = JSON.stringify(body);
  const sentSchemaJson = JSON.stringify(args.schemaAsSent);
  const sentCanonicalJson = JSON.stringify(args.canonicalSchema);
  if (sentCanonicalJson === JSON.stringify(RETIRED_PRESENT_SCHEMA_FOR_COMPARISON_ONLY)
      || sentSchemaJson === JSON.stringify(RETIRED_PRESENT_AS_SENT_FOR_COMPARISON_ONLY)) {
    throw new Error('§206 ABORT: the retired capability-PRESENT first-pass schema is in a request '
      + 'body. Refusing to transmit.');
  }
  if (describeGrammarProjection203(args.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION')
    .identity === '09825bd0e1b3de13') {
    throw new Error('§206 ABORT: a request carries the retired capability-PRESENT grammar identity '
      + '09825bd0e1b3de13. Refusing to transmit.');
  }
  if (args.purpose === 'ROUTED_FIRST_PASS_CAPABILITY_ABSENT' && wire.includes('governedEvidenceSourceIds')) {
    throw new Error('§206 ABORT: the capability-ABSENT first pass must carry no governed-binding '
      + 'property anywhere in its request. Refusing to transmit.');
  }

  callsMade += 1;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);
  let json: Record<string, any> = {};
  let httpStatus: number | null = null;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
      },
      body: wire,
      signal: controller.signal,
    });
    httpStatus = response.status;
    json = await response.json() as Record<string, any>;
  } catch (e) {
    json = { error: { type: 'transport', message: (e as Error).message } };
  } finally { clearTimeout(timer); }
  const latencyMs = Date.now() - started;

  const usage = json.usage as { input_tokens?: number; output_tokens?: number } | undefined;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const costUsd =
    (inputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
    + (outputTokens ?? 0) / 1e6 * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
  spendUsd += costUsd;

  const block = (json.content as Array<Record<string, any>> | undefined)
    ?.find(b => b.type === 'tool_use');
  const parsed = (block?.input ?? null) as Record<string, unknown> | null;

  const rec: CallRecord = {
    callIndex: callsMade,
    purpose: args.purpose,
    provider: 'anthropic',
    requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
    respondedModel: json.model ?? null,
    canonicalSchemaBytes: bytes(args.canonicalSchema),
    canonicalSchemaGrammarId: describeGrammarProjection203(
      args.canonicalSchema, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION').identity,
    transmittedSchemaBytes: bytes(args.schemaAsSent),
    transmittedBodyBytes: Buffer.byteLength(wire, 'utf8'),
    transmittedSchemaSha256: sha(JSON.stringify(args.schemaAsSent)),
    governedStageTransmitted: args.governedStageTransmitted,
    retiredPresentFormTransmitted: false,
    httpStatus,
    providerErrorType: json?.error?.type ?? null,
    providerErrorMessage: json?.error?.message ?? null,
    reachedInference: (outputTokens ?? 0) > 0 || Array.isArray(json.content),
    stopReason: json.stop_reason ?? null,
    inputTokens, outputTokens, costUsd, latencyMs,
    rawStructuralOutcome:
      httpStatus === null ? 'TRANSPORT_ERROR'
        : httpStatus !== 200 ? `HTTP_${httpStatus}`
          : block ? 'TOOL_USE_BLOCK_RETURNED' : 'NO_TOOL_USE_BLOCK',
    parseAdmissionResult: 'PENDING',
    retried: args.retryReason !== undefined,
    retryReason: args.retryReason ?? null,
    parsed,
  };
  records.push(rec);
  mkdirSync(EVID, { recursive: true });
  appendFileSync(LEDGER, JSON.stringify({ ...rec, parsed: undefined }) + '\n');
  return rec;
}

// ================================================================ run

(async () => {
  mkdirSync(EVID, { recursive: true });

  let call1: CallRecord | null = null;
  if (LEG === 'both' || LEG === 'first-pass') {
  console.log('\n================ §206 CALL 1 — ROUTED FIRST PASS (capability-ABSENT)');
  call1 = await providerCall({
    purpose: 'ROUTED_FIRST_PASS_CAPABILITY_ABSENT',
    systemPrompt: assessment.routed.firstPassSystemPrompt,
    userPrompt: buildExpertVNextUserPrompt(TRANSPORT_INPUT, []),
    toolName: EXPERT_TOOL_NAME,
    canonicalSchema: firstPassSchema,
    schemaAsSent: firstPassSchemaAsSent,
    maxTokens: FIRST_PASS_MAX_TOKENS,
    governedStageTransmitted: false,
  });

  // Contract-usability: does the returned payload cross the deterministic boundary at all?
  // This is a CONTRACT check. It is not a semantic judgement and no verdict is implied.
  if (call1 && call1.parsed) {
    const declarations = Array.isArray((call1.parsed as any).unresolvedFactDeclarations)
      ? (call1.parsed as any).unresolvedFactDeclarations as unknown[] : [];
    const projection = projectDeclaredOwedFacts({
      declarations,
      sources: TRANSPORT_INPUT.authoritativeSources.map(s => ({ sourceId: s.sourceId, text: s.text })),
      suppliedGovernedSourceIds: [],
      stage: 'FIRST_PASS_MODEL',
    });
    const preserved = preserveIdentifiedSafetyFacts(projection, declarations);
    call1.parseAdmissionResult =
      `TOOL_PAYLOAD_PARSED; outcome=${String((call1.parsed as any).outcome ?? 'n/a')}; `
      + `declarations=${declarations.length}; admittedFacts=${projection.facts.length}; `
      + `refused=${projection.refusedCount}; preserved=${preserved.preserved.length}; `
      + `safetyStateComplete=${preserved.safetyStateComplete}`;
  } else if (call1) {
    call1.parseAdmissionResult = 'NO_TOOL_PAYLOAD_TO_PARSE';
  }
  console.log(`  http=${call1!.httpStatus} model=${call1!.respondedModel} `
    + `stop=${call1!.stopReason} in=${call1!.inputTokens} out=${call1!.outputTokens} `
    + `cost=$${call1!.costUsd.toFixed(6)}`);
  console.log(`  canonical ${call1!.canonicalSchemaBytes} B / ${call1!.canonicalSchemaGrammarId}; `
    + `transmitted schema ${call1!.transmittedSchemaBytes} B; body ${call1!.transmittedBodyBytes} B`);
  console.log(`  structural=${call1!.rawStructuralOutcome}`);
  console.log(`  contract  =${call1!.parseAdmissionResult}`);
  } else {
    console.log('\n================ §206 CALL 1 — SKIPPED (--leg=governed); already executed, '
      + 'not re-spent');
  }

  let call2: CallRecord | null = null;
  if (LEG === 'both' || LEG === 'governed') {
  console.log('\n================ §206 CALL 2 — GOVERNED STAGE');
  call2 = await providerCall({
    purpose: 'GOVERNED_STAGE',
    systemPrompt: assessment.routed.governedStageSystemPrompt,
    userPrompt: (() => {
      // Rebuilt through §202's own builder inside routeGovernedRow; re-derived here only to send.
      const { buildGoverned202UserPrompt, sealFactIdentities } =
        require('./lib/expert-202-governed-binding-contract');
      return buildGoverned202UserPrompt({
        analysisId: 'fx-205-governed',
        facts: CANDIDATE_FACTS,
        governedRecords: GOVERNED_RECORDS,
        inspectionContext: INSPECTION,
        identitySeal: sealFactIdentities('fx-205-governed', CANDIDATE_FACTS),
      });
    })(),
    toolName: GOVERNED_TOOL_NAME,
    canonicalSchema: governedSchema,
    schemaAsSent: governedSchemaAsSent,
    maxTokens: GOVERNED_STAGE_MAX_TOKENS,
    governedStageTransmitted: true,
  });

  if (call2 && call2.parsed) {
    const keys = Object.keys(call2.parsed);
    const forbidden = ['factKey', 'priority', 'status', 'decisionIfA', 'decisionIfB']
      .filter(k => JSON.stringify(call2.parsed).includes(`"${k}"`));
    call2.parseAdmissionResult =
      `TOOL_PAYLOAD_PARSED; topLevelKeys=[${keys.join(',')}]; `
      + `hazlenzOwnedFieldsReturned=${forbidden.length === 0 ? 'NONE' : forbidden.join('/')}`;
  } else if (call2) {
    call2.parseAdmissionResult = 'NO_TOOL_PAYLOAD_TO_PARSE';
  }
  console.log(`  http=${call2!.httpStatus} model=${call2!.respondedModel} `
    + `stop=${call2!.stopReason} in=${call2!.inputTokens} out=${call2!.outputTokens} `
    + `cost=$${call2!.costUsd.toFixed(6)}`);
  console.log(`  canonical ${call2!.canonicalSchemaBytes} B / ${call2!.canonicalSchemaGrammarId}; `
    + `transmitted schema ${call2!.transmittedSchemaBytes} B; body ${call2!.transmittedBodyBytes} B`);
  console.log(`  structural=${call2!.rawStructuralOutcome}`);
  console.log(`  contract  =${call2!.parseAdmissionResult}`);
  } else {
    console.log('\n================ §206 CALL 2 — SKIPPED (--leg=first-pass)');
  }

  // ---------------------------------------------------------------- stop rule
  const objectiveMet = (r: CallRecord | null): boolean =>
    r !== null
    && r.httpStatus === 200 && r.reachedInference
    && r.rawStructuralOutcome === 'TOOL_USE_BLOCK_RETURNED'
    && r.parsed !== null && r.retiredPresentFormTransmitted === false;

  const bothClean = LEG === 'governed'
    ? objectiveMet(call2)   // the first-pass leg is recorded in the ledger from its own execution
    : objectiveMet(call1) && objectiveMet(call2);
  const stopAtTwo = bothClean;

  console.log('\n================ §206 STOP RULE');
  console.log(`  call 1 objective met: ${objectiveMet(call1)}`);
  console.log(`  call 2 objective met: ${objectiveMet(call2)}`);
  console.log(`  decision: ${stopAtTwo
    ? 'STOP AT 2 — calls 3 and 4 are NOT required and are NOT made'
    : 'calls 3-4 WOULD be permitted to discriminate variability from incompatibility'}`);

  const summary = {
    artifact: 'SECTION_206_GOVERNED_TRANSPORT_SMOKE',
    executorVersion: EXECUTOR_VERSION,
    date: new Date().toISOString(),
    objective: 'TRANSPORT / GRAMMAR / CONTRACT SMOKE ONLY',
    notEstablishedByThisRun: [
      'Expert accuracy', 'F1/F2/F4/F7 hosted closure', 'semantic regression',
      'escalation policy', 'the 24-case acceptance cohort', 'advancement readiness',
    ],
    leg: LEG,
    providerCalls: callsMade,
    initialCallBudget: INITIAL_CALLS,
    hardCallCeiling: HARD_CALL_CEILING,
    providerSpendUsd: Number(spendUsd.toFixed(6)),
    spendCeilingUsd: SPEND_CEILING_USD,
    databaseOperations: 0,
    preflight,
    section199Envelope: SECTION_199_MEASURED_ENVELOPE,
    section205Identities: {
      routedFirstPass: { bytes: 18730, grammarId: 'c0df75103834b03c' },
      retiredPresent: { bytes: 19152, grammarId: '09825bd0e1b3de13', transmitted: false },
      governedStage: { bytes: 1478, grammarId: '58faca1cd094af1b' },
    },
    calls: records.map(r => ({ ...r, parsed: undefined })),
    stopRule: {
      bothCallsMetObjective: bothClean,
      stoppedAtTwo: stopAtTwo,
      calls3and4Made: callsMade > 2,
    },
    judgmentsHeldSeparate: {
      PROVIDER_TRANSPORT_ACCEPTED: bothClean,
      SEMANTIC_OUTPUT_CORRECT: 'NOT_JUDGED — semantic quality observed here is NON-ACCEPTANCE '
        + 'EVIDENCE only and no verdict is supplied',
    },
  };

  writeFileSync(join(EVID, 'SMOKE-SUMMARY-206.json'), JSON.stringify(summary, null, 2) + '\n');
  writeFileSync(join(EVID, 'RAW-CALL-PAYLOADS-206.jsonl'),
    records.map(r => JSON.stringify({
      callIndex: r.callIndex, purpose: r.purpose, parsed: r.parsed,
    })).join('\n') + '\n');

  console.log('\n================ §206 SUMMARY');
  console.log(`  provider calls: ${callsMade}   spend: $${spendUsd.toFixed(6)}   `
    + `database operations: 0`);
  console.log(`  PROVIDER_TRANSPORT_ACCEPTED = ${bothClean}`);
  console.log('  SEMANTIC_OUTPUT_CORRECT     = NOT_JUDGED (non-acceptance evidence only)');
  console.log(`  evidence: ${EVID}`);
  process.exit(bothClean ? 0 : 2);
})().catch(e => {
  console.error(`\n§206 EXECUTOR ERROR after ${callsMade} call(s), spend $${spendUsd.toFixed(6)}:`);
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
