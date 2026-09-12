/**
 * §251 -- REAL REQUEST PROOF UNDER THE FULL-SCHEMA PROBE REQUIREMENT.
 *
 * §246's fragment-level compatibility probe was the reason §250 spent six requests on a schema that
 * could not be compiled. §251 replaces that class of test permanently: the schema examined here is
 * obtained by DRIVING THE PRODUCTION ENTRY POINT and pushing what it hands the transport through the
 * same canonical builder, strict wrapper, §108 compatibility strip and envelope assembly the hosted
 * transport uses. Nothing is rebuilt and no fragment is substituted.
 *
 * One synthetic observation is used. No frozen §250 case is transmitted. The single provider call is
 * a SCHEMA TRANSPORT PROBE with a 64-token generation allowance and is not capability evidence.
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
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, envelopeBoundOptions, EXPERT_REQUEST_ENVELOPE,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { countUnions } from './analyze-251-wire-budget';
import { slotProfile } from './analyze-251-compaction-ceiling';
import { runSchemaProbe, OUT_251 } from './probe-251-strict-schema';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
if (!existsSync(OUT_251)) mkdirSync(OUT_251, { recursive: true });

/** Synthetic. Carries no frozen §250 observation and no customer content. */
const SYNTHETIC_OBSERVATION =
  'Schema transport probe observation. A placeholder condition with no safety content.';

const input: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'SEC-251-REAL-REQUEST-PROOF',
  authoritativeSources: [{ sourceId: 'obs-probe', kind: 'OBSERVATION', text: SYNTHETIC_OBSERVATION }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['WORK_AT_HEIGHT'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [],
  answeredClarifications: [],
};

class CapturingTransport implements ExpertSemanticTransport {
  readonly captured: ExpertLegRequest[] = [];
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    this.captured.push(request);
    return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: 'no transmission' };
  }
}

async function main(): Promise<void> {
  const t = new CapturingTransport();
  await runExpertHazLenzAnalysis({
    input, observation: { sourceId: 'obs-probe', text: SYNTHETIC_OBSERVATION },
    governedRecords: [], governedEvidence: [],
  }, t);
  const firstPass = t.captured.find(c => c.leg === 'FIRST_PASS');
  if (firstPass === undefined) throw new Error('SECTION_251_ABORT: the entry point assembled no first-pass leg');

  // The production provider-native pipeline, called -- not reimplemented.
  const inputSchema = stripAnthropicUnsupportedKeywords(
    applyStrictSchemaWrapper(firstPass.wireSchema));
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS', systemPrompt: firstPass.systemPrompt, userPrompt: firstPass.userPrompt,
    toolName: firstPass.toolName, toolDescription: firstPass.toolDescription, inputSchema,
  });
  const tool = (body.tools as any[])[0];

  const profile = slotProfile(inputSchema);
  const unions = countUnions(inputSchema);

  const probe = await runSchemaProbe({
    probeId: 'Z1-REAL-PRODUCTION-REQUEST', strict: true, inputSchema,
    systemPrompt: firstPass.systemPrompt,
    purpose: 'the COMPLETE ACTUAL TRANSMITTED SCHEMA from the production entry point, after canonical '
      + 'builder, strict wrapper, §108 strip and envelope assembly',
  });

  const doc = {
    section: '251', generated: '2026-09-12', databaseOperations: 0,
    obtainedBy: 'driving runExpertHazLenzAnalysis with a capturing transport, then calling the same '
      + 'exported provider-native functions the hosted transport calls',
    fragmentOnlyProofRelied: false,
    observationUsed: 'SYNTHETIC — no frozen §250 case was transmitted',
    envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
    request: {
      model: body.model,
      productionMaxTokens: EXPERT_REQUEST_ENVELOPE.firstPassMaxTokens,
      probeMaxTokens: body.max_tokens,
      toolName: tool.name,
      strictSchema: tool.strict === true,
      forcedToolChoice: JSON.stringify(body.tool_choice)
        === JSON.stringify({ type: 'tool', name: tool.name }),
      systemPromptSha: sha(firstPass.systemPrompt),
      userPromptSha: sha(firstPass.userPrompt),
      canonicalWireSchemaSha: sha(JSON.stringify(firstPass.wireSchema)),
      transmittedSchemaSha: sha(JSON.stringify(inputSchema)),
      transmittedSchemaBytes: Buffer.byteLength(JSON.stringify(inputSchema), 'utf8'),
    },
    structuralMetrics: {
      ...profile,
      unionTypedParameters: unions.length,
      typeArrayUnions: unions.filter(u => u.kind === 'TYPE_ARRAY').length,
      anyOfUnions: unions.filter(u => u.kind === 'ANY_OF').length,
    },
    providerVerdict: {
      httpStatus: probe.httpStatus,
      accepted: probe.accepted,
      errorType: probe.providerErrorType,
      errorMessage: probe.providerErrorMessage,
    },
    outcome: probe.accepted ? 'REAL_REQUEST_ACCEPTED_UNDER_STRICT' : 'REAL_REQUEST_REJECTED_UNDER_STRICT',
    successConditionB: probe.accepted ? 'MET' : 'NOT MET',
  };
  writeFileSync(join(OUT_251, 'SECTION-251-REAL-REQUEST-PROOF.json'), JSON.stringify(doc, null, 2));
  console.log(JSON.stringify({ outcome: doc.outcome, ...doc.providerVerdict,
    slots: profile.slots, unions: unions.length,
    bytes: doc.request.transmittedSchemaBytes }, null, 2));
}
void main();
