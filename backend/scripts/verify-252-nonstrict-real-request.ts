/**
 * §252 -- NON-STRICT REAL REQUEST PROOF. ONE synthetic provider call.
 *
 * PURPOSE, AND ONLY THIS: prove that the complete canonical Expert request transmits with
 * `strict: false` and that what comes back reaches the deterministic admission path. This is a
 * TRANSPORT SMOKE. It is not capability evidence, it scores no semantics, and its observation is
 * synthetic -- none of the six frozen §250 cases is transmitted and no customer data is involved.
 *
 * The request is not rebuilt here. `runExpertHazLenzAnalysis` is driven with a transport that calls
 * the same exported provider-native functions the hosted adapter calls, so the bytes on the wire are
 * the product's bytes.
 */
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
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
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** SYNTHETIC. Not one of the six frozen §250 observations, and not customer content. */
const SYNTHETIC_OBSERVATION =
  'A stepladder is being used to change a light fitting in a corridor. The ladder feet are on dry '
  + 'level vinyl, a colleague is footing it, and the corridor is coned off at both ends.';

const input: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'SEC-252-NONSTRICT-SMOKE',
  authoritativeSources: [{ sourceId: 'obs-252-smoke', kind: 'OBSERVATION', text: SYNTHETIC_OBSERVATION }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['WORK_AT_HEIGHT'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [],
  answeredClarifications: [],
};

let calls = 0;
let spendUsd = 0;
const wire: any = { request: null, response: null };

class SmokeTransport implements ExpertSemanticTransport {
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    // The production provider-native pipeline, CALLED, not reimplemented.
    const inputSchema = stripAnthropicUnsupportedKeywords(
      applyStrictSchemaWrapper(request.wireSchema));
    const body = buildEnvelopeRequestBody({
      leg: request.leg, systemPrompt: request.systemPrompt, userPrompt: request.userPrompt,
      toolName: request.toolName, toolDescription: request.toolDescription, inputSchema,
    });
    if (request.leg === 'FIRST_PASS') {
      const tool = (body.tools as any[])[0];
      wire.request = {
        model: body.model, maxTokens: body.max_tokens, toolName: tool.name,
        strictFlagOnTheWire: tool.strict,
        forcedToolChoice: JSON.stringify(body.tool_choice)
          === JSON.stringify({ type: 'tool', name: tool.name }),
        systemPromptSha: sha(request.systemPrompt),
        userPromptSha: sha(request.userPrompt),
        canonicalWireSchemaSha: sha(JSON.stringify(request.wireSchema)),
        transmittedSchemaSha: sha(JSON.stringify(inputSchema)),
        transmittedSchemaBytes: Buffer.byteLength(JSON.stringify(inputSchema), 'utf8'),
      };
    }

    calls += 1;
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
      return { ok: false, toolInput: null, detail: 'transport',
        failureKind: (e as { name?: string })?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR' };
    } finally { clearTimeout(timer); }

    if (!response.ok) {
      const t = await response.text().catch(() => '');
      if (request.leg === 'FIRST_PASS') {
        wire.response = { httpStatus: response.status, errorType: errorTypeOf(t),
          errorMessage: t.slice(0, 500), reachedInference: false };
      }
      return { ok: false, toolInput: null, failureKind: classifyHttpFailure(response.status, t),
        detail: `HTTP ${response.status} ${errorTypeOf(t)}` };
    }

    const env = await response.json() as Record<string, any>;
    const usage = (env.usage ?? {}) as Record<string, number>;
    spendUsd += ((usage.input_tokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok
      + ((usage.output_tokens ?? 0) / 1e6) * EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok;
    const block = (Array.isArray(env.content) ? env.content : [])
      .find((b: any) => b?.type === 'tool_use' && b?.name === request.toolName);
    if (request.leg === 'FIRST_PASS') {
      wire.response = {
        httpStatus: response.status, reachedInference: true,
        stopReason: env.stop_reason, respondedModel: env.model,
        inputTokens: usage.input_tokens ?? null, outputTokens: usage.output_tokens ?? null,
        toolUseBlockReturned: block !== undefined,
        toolInputSha: block ? sha(JSON.stringify(block.input)) : null,
        toolInputRootKeys: block && block.input && typeof block.input === 'object'
          ? Object.keys(block.input) : [],
      };
    }
    if (env.stop_reason === 'max_tokens') {
      return { ok: false, toolInput: null, failureKind: 'TRUNCATED_RESPONSE', detail: 'limit' };
    }
    if (!block) {
      return { ok: false, toolInput: null, failureKind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT',
        detail: 'no tool_use block' };
    }
    return { ok: true, toolInput: block.input, failureKind: null, detail: null };
  }
}

async function main(): Promise<void> {
  const result = await runExpertHazLenzAnalysis({
    input, observation: { sourceId: 'obs-252-smoke', text: SYNTHETIC_OBSERVATION },
    governedRecords: [], governedEvidence: [],
  }, new SmokeTransport());

  const reachedAdmission = result.admission !== null;
  const doc = {
    section: '252', generated: '2026-09-12', databaseOperations: 0,
    recordKind: 'TRANSPORT SMOKE', notCapabilityEvidence: true,
    observationUsed: 'SYNTHETIC — none of the six frozen §250 observations was transmitted',
    envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
    strictEnforcement: EXPERT_REQUEST_ENVELOPE.strictSchema,
    request: wire.request,
    response: wire.response,
    admission: {
      reachedTheDeterministicAdmissionPath: reachedAdmission,
      outcome: result.admission,
      status: result.status,
      conformanceViolationCount: result.conformanceViolations.length,
      conformanceViolations: result.conformanceViolations.slice(0, 12),
      postureRefusalCodes: result.postureRefusalCodes,
      roleJustificationCodes: result.roleJustificationCodes,
      admittedFactCount: result.admittedFacts.length,
      declarationRefusals: result.declarationRefusals,
      semanticInventions: result.semanticInventions,
      verifierReached: result.verifier.reached,
      verifierNotReachedBecause: result.verifier.notReachedBecause,
    },
    providerCalls: calls,
    spendUsd: Number(spendUsd.toFixed(6)),
    verdict: wire.response?.reachedInference === true && reachedAdmission ? 'PASS' : 'FAIL',
    verdictMeans: 'PASS means the complete canonical Expert request transmitted non-strict, the '
      + 'provider generated a tool call, and the deterministic admission path received it and '
      + 'reached a verdict. It says nothing about whether that verdict was ADMIT.',
  };
  writeFileSync(join(OUT, 'SECTION-252-NONSTRICT-REAL-REQUEST-PROOF.json'), JSON.stringify(doc, null, 2));
  console.log(JSON.stringify({
    verdict: doc.verdict, strict: doc.strictEnforcement,
    http: wire.response?.httpStatus, stopReason: wire.response?.stopReason,
    toolUse: wire.response?.toolUseBlockReturned,
    admission: result.admission, status: result.status,
    conformanceViolations: result.conformanceViolations.length,
    postureCodes: result.postureRefusalCodes,
    justificationCodes: result.roleJustificationCodes,
    inventions: result.semanticInventions.length,
    calls, spendUsd: Number(spendUsd.toFixed(6)),
  }, null, 2));
}
void main();
