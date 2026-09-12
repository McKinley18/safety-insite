/**
 * §250 -- DRIVER-ROLE HOSTED CONFIRMATION EXECUTION.
 *
 * Six frozen observations, one primary call each, through the canonical production Expert path.
 *
 * THE HARNESS ADDS RECORDING AND NOTHING ELSE. The request bytes are assembled by the same
 * production functions the hosted transport calls -- `buildEnvelopeRequestBody`,
 * `applyStrictSchemaWrapper`, `stripAnthropicUnsupportedKeywords` -- so what is transmitted is what
 * the product would transmit. No semantics are substituted.
 *
 * A semantically wrong answer is EVIDENCE. There is no retry for a wrong role, a wrong posture,
 * over-restriction, under-restriction, a failed justification or a gate failure. A contingency call
 * is permitted only for a genuine transport-level failure, as the frozen instrument allows.
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
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, classifyHttpFailure, errorTypeOf,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, EXPERT_REQUEST_ENVELOPE, EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { runPreSpendGate, FROZEN } from './verify-250-pre-spend';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-250-driver-role-hosted-confirmation-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const write = (f: string, o: unknown): void =>
  appendFileSync(join(OUT, f), `${JSON.stringify(o)}\n`);

const EXECUTOR_VERSION = 'hazlenz.expert.250.driver-role-confirmation.v1' as const;
const CALL_CEILING = 8;      // 6 primary + up to 2 transport contingencies
const SPEND_CEILING_USD = 2.00;

/** THE SIX FROZEN OBSERVATIONS, verbatim from SECTION-247-HOSTED-CONFIRMATION-DESIGN.md. */
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

interface CallRecord {
  callIndex: number; caseId: string; callKind: 'PRIMARY' | 'CONTINGENCY';
  contingencyReason: string | null; httpStatus: number | null; reachedInference: boolean;
  stopReason: string | null; respondedModel: string | null;
  inputTokens: number | null; outputTokens: number | null; costUsd: number | null;
  latencyMs: number; failureClass: string | null;
}

let callsMade = 0;
let spendUsd = 0;
const ledger: CallRecord[] = [];

/** Records; does not reshape. Byte assembly is the production pipeline. */
class RecordingTransport implements ExpertSemanticTransport {
  constructor(private readonly caseId: string) {}
  lastRequestIdentity: { system: string; user: string; schema: string } | null = null;

  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    const started = Date.now();
    const inputSchema = stripAnthropicUnsupportedKeywords(
      applyStrictSchemaWrapper(request.wireSchema));
    const body = buildEnvelopeRequestBody({
      leg: request.leg, systemPrompt: request.systemPrompt, userPrompt: request.userPrompt,
      toolName: request.toolName, toolDescription: request.toolDescription, inputSchema,
    });
    this.lastRequestIdentity = {
      system: sha(request.systemPrompt), user: sha(request.userPrompt),
      schema: sha(JSON.stringify(inputSchema)),
    };

    const rec = (o: Partial<CallRecord>): void => {
      const r: CallRecord = {
        callIndex: callsMade, caseId: this.caseId, callKind: 'PRIMARY', contingencyReason: null,
        httpStatus: null, reachedInference: false, stopReason: null, respondedModel: null,
        inputTokens: null, outputTokens: null, costUsd: null,
        latencyMs: Date.now() - started, failureClass: null, ...o,
      };
      ledger.push(r); write('CALL-LEDGER-250.jsonl', r);
    };

    if (callsMade >= CALL_CEILING) {
      rec({ failureClass: 'CALL_CEILING' });
      return { ok: false, toolInput: null, failureKind: 'CALL_CEILING', detail: 'ceiling reached' };
    }
    if (spendUsd >= SPEND_CEILING_USD) {
      rec({ failureClass: 'SPEND_CEILING' });
      return { ok: false, toolInput: null, failureKind: 'SPEND_CEILING', detail: 'ceiling reached' };
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
        body: JSON.stringify(body),
        signal: controller.signal,
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
      return {
        ok: false, toolInput: null,
        failureKind: classifyHttpFailure(response.status, t),
        detail: `HTTP ${response.status} ${errorTypeOf(t)}`,
      };
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

    write('RAW-250-FIRST-PASS.jsonl', {
      recordKind: 'RAW_FIRST_PASS_250', executorVersion: EXECUTOR_VERSION,
      caseId: this.caseId, callIndex: callsMade,
      executableIdentity: FROZEN.identity, instrumentDigest: FROZEN.instrument,
      requestIdentity: this.lastRequestIdentity,
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
      return {
        ok: false, toolInput: null, failureKind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT',
        detail: 'no tool_use block',
      };
    }
    return { ok: true, toolInput: block.input, failureKind: null, detail: null };
  }
}

async function main(): Promise<void> {
  console.log('---- §250 PRE-SPEND GATE ----');
  const gate = await runPreSpendGate();
  gate.forEach(g => console.log(`${g.verdict}  ${g.id}`));
  if (gate.some(g => g.verdict === 'FAIL')) {
    console.log('\nSTOP BEFORE SPEND. Provider calls made: 0.');
    process.exit(1);
  }
  writeFileSync(join(OUT, 'SECTION-250-PRE-SPEND-GATE.json'), JSON.stringify({
    section: '250', generated: '2026-09-12', verdict: 'PASS',
    frozen: FROZEN, checks: gate,
  }, null, 2));
  console.log(`\n${gate.length} preconditions PASS. Proceeding to spend.\n`);

  console.log('---- EXECUTION: 6 frozen observations, one primary call each ----');
  const results: any[] = [];
  for (const c of CASES) {
    const transport = new RecordingTransport(c.id);
    const input: any = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId: `ANL-250-${c.id}`,
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

    const posture = (r.posture ?? {}) as any;
    results.push({
      caseId: c.id, status: r.status, contractVersion: r.contractVersion,
      postureRefusalCodes: r.postureRefusalCodes,
      roleJustificationCodes: r.roleJustificationCodes,
      admittedFactCount: r.admittedFacts.length,
      declarationRefusals: r.declarationRefusals,
      analysis: posture.analysis ?? null,
      drivers: posture.drivers ?? null,
      requestIdentity: transport.lastRequestIdentity,
      failure: r.failure,
    });
    write('PROJECTION-250.jsonl', results[results.length - 1]);
    console.log(`  ${c.id}  ${r.status}  postureCodes=${r.postureRefusalCodes.length}  `
      + `justificationCodes=${r.roleJustificationCodes.length}  facts=${r.admittedFacts.length}`);
  }

  writeFileSync(join(OUT, 'SECTION-250-EXECUTION-SUMMARY.json'), JSON.stringify({
    section: '250', executorVersion: EXECUTOR_VERSION, generated: '2026-09-12',
    executableIdentity: FROZEN.identity, instrumentDigest: FROZEN.instrument,
    casesTransmitted: CASES.length, providerCalls: callsMade,
    transportContingencies: ledger.filter(l => l.callKind === 'CONTINGENCY').length,
    spendUsd: Number(spendUsd.toFixed(6)), spendCeilingUsd: SPEND_CEILING_USD,
    callCeiling: CALL_CEILING, databaseOperations: 0,
    results,
  }, null, 2));

  console.log(`\ncalls ${callsMade}  spend USD ${spendUsd.toFixed(4)}  ceiling ${SPEND_CEILING_USD}`);
  console.log('DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
}
void main();
