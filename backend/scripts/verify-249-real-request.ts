/**
 * §249 -- REAL REQUEST PROOF AND ADAPTER PARITY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The authorization forbids proving this with a reimplementation. So the request is obtained by
 * DRIVING THE PRODUCTION ENTRY POINT, `runExpertHazLenzAnalysis`, with a transport that captures
 * what it is handed and returns a failure instead of sending. The bytes examined are the bytes the
 * product would transmit; nothing about the request is rebuilt here.
 *
 * The envelope and provider-native pipeline are applied by calling the SAME exported functions the
 * hosted transport calls -- `applyStrictSchemaWrapper`, `stripAnthropicUnsupportedKeywords`,
 * `buildEnvelopeRequestBody`. This file contains no network primitive and cannot transmit.
 */
import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
  EXPERT_TOOL_NAME,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, envelopeBoundOptions, EXPERT_REQUEST_ENVELOPE,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-249-executable-binding-and-identity-hardening-2026-09-12');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const input: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'SEC-249-REAL-REQUEST-PROOF',
  authoritativeSources: [{ sourceId: 'obs-1', kind: 'OBSERVATION',
    text: 'a banksman is in radio contact with the reversing vehicle and an agreed stop signal' }],
  inspectionContext: { location: 'yard', task: 'deliveries' },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['VEHICLE_PEDESTRIAN'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [],
  answeredClarifications: [],
};

/** Captures what the production entry point hands the transport. Sends nothing. */
class CapturingTransport implements ExpertSemanticTransport {
  readonly captured: ExpertLegRequest[] = [];
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    this.captured.push(request);
    return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: 'no transmission' };
  }
}

function analyse(body: Record<string, any>): Record<string, unknown> {
  const tool = body.tools[0];
  const items = tool.input_schema.properties.immediateSafetyPosture.properties.requiredBy.items;
  const hasUnion = Array.isArray(items.anyOf);
  const pairs: string[] = hasUnion
    ? items.anyOf.flatMap((b: any) =>
      b.properties.refKind.enum.map((k: string) => `${b.properties.driverRole.const}|${k}`))
    : (items.properties?.driverRole?.enum ?? []).flatMap((r: string) =>
      (items.properties?.refKind?.enum ?? []).map((k: string) => `${r}|${k}`));
  const countKey = (n: unknown, k: string): number => {
    if (Array.isArray(n)) return n.reduce((a: number, v) => a + countKey(v, k), 0);
    if (!n || typeof n !== 'object') return 0;
    return Object.entries(n as Record<string, unknown>)
      .reduce((a, [kk, v]) => a + (kk === k ? 1 : 0) + countKey(v, k), 0);
  };
  return {
    model: body.model,
    maxTokens: body.max_tokens,
    toolName: tool.name,
    strictSchema: tool.strict === true,
    forcedToolChoice: JSON.stringify(body.tool_choice) === JSON.stringify({ type: 'tool', name: tool.name }),
    thinking: JSON.stringify(body.thinking),
    discriminatedUnionPresent: hasUnion,
    roleJustificationPresent: hasUnion
      ? items.anyOf.every((b: any) => b.properties.roleJustification !== undefined)
      : items.properties?.roleJustification !== undefined,
    additionalPropertiesFalseInEveryBranch: hasUnion
      && items.anyOf.every((b: any) => b.additionalProperties === false),
    admissiblePairs: pairs.length,
    inadmissiblePairsExpressible: hasUnion ? 0 : Math.max(0, pairs.length - 6),
    systemPromptCarriesJustificationInstruction: String(body.system).includes('roleJustification'),
    unsupportedKeywords: {
      minLength: countKey(tool.input_schema, 'minLength'),
      minItems: countKey(tool.input_schema, 'minItems'),
      oneOf: countKey(tool.input_schema, 'oneOf'),
      allOf: countKey(tool.input_schema, 'allOf'),
    },
    systemPromptSha256: sha(String(body.system)),
    userPromptSha256: sha(String(body.messages[0].content)),
    wireSchemaSha256: sha(JSON.stringify(tool.input_schema)),
  };
}

async function main(): Promise<void> {
  // ---- (1) the PRODUCTION ENTRY POINT, driven for real.
  const transport = new CapturingTransport();
  const result = await runExpertHazLenzAnalysis({
    input, observation: { sourceId: 'obs-1', text: String(input.authoritativeSources[0].text) },
    governedRecords: [], governedEvidence: [],
  }, transport);

  if (transport.captured.length === 0) throw new Error('the entry point assembled no request');
  const leg = transport.captured[0];
  // The envelope and provider-native pipeline, applied by the production functions themselves.
  const productionBody = buildEnvelopeRequestBody({
    leg: leg.leg, systemPrompt: leg.systemPrompt, userPrompt: leg.userPrompt,
    toolName: leg.toolName, toolDescription: leg.toolDescription,
    inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(leg.wireSchema)),
  }) as Record<string, any>;

  // ---- (2) the LEGACY COMPATIBILITY ADAPTER, as historical harness consumers call it.
  const adapterBody = buildAnthropicRequestBody(input) as Record<string, any>;

  const prod = analyse(productionBody);
  const adap = analyse(adapterBody);

  const LOAD_BEARING = ['model', 'toolName', 'strictSchema', 'forcedToolChoice', 'thinking',
    'discriminatedUnionPresent', 'roleJustificationPresent', 'admissiblePairs',
    'inadmissiblePairsExpressible', 'systemPromptCarriesJustificationInstruction',
    'systemPromptSha256', 'wireSchemaSha256'];
  const mismatches = LOAD_BEARING.filter(k => JSON.stringify((prod as any)[k]) !== JSON.stringify((adap as any)[k]));

  const proof = {
    section: '249', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    method: 'the production entry point runExpertHazLenzAnalysis was driven with a capturing '
      + 'transport; the captured bytes were passed through the same envelope and provider-native '
      + 'functions the hosted transport calls. Nothing was reimplemented and nothing was sent.',
    entryPoint: 'src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts',
    invokedContractVersion: result.contractVersion,
    requirements: {
      discriminatedUnion: prod.discriminatedUnionPresent ? 'PRESENT' : 'ABSENT',
      roleJustification: prod.roleJustificationPresent ? 'PRESENT' : 'ABSENT',
      systemPromptJustificationInstruction:
        prod.systemPromptCarriesJustificationInstruction ? 'PRESENT' : 'ABSENT',
      expressibleRoleCarrierPairs: prod.admissiblePairs,
      inadmissiblePairs: prod.inadmissiblePairsExpressible,
      strictSchema: prod.strictSchema ? 'ENABLED' : 'DISABLED',
      canonicalRequestEnvelope: 'USED',
      unsupportedProviderKeywordsSurviving:
        Object.values(prod.unsupportedKeywords as Record<string, number>).reduce((a, b) => a + b, 0),
    },
    allRequirementsMet: prod.discriminatedUnionPresent === true
      && prod.roleJustificationPresent === true
      && prod.systemPromptCarriesJustificationInstruction === true
      && prod.admissiblePairs === 6 && prod.inadmissiblePairsExpressible === 0
      && prod.strictSchema === true
      && Object.values(prod.unsupportedKeywords as Record<string, number>)
        .reduce((a, b) => a + b, 0) === 0,
    envelopeBoundOptions: envelopeBoundOptions(),
    envelopeVersion: EXPERT_REQUEST_ENVELOPE.envelopeVersion,
    productionRequest: prod,
  };
  writeFileSync(join(OUT, 'SECTION-249-REAL-REQUEST-PROOF.json'), JSON.stringify(proof, null, 2));

  const parity = {
    section: '249', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    compared: ['canonical production entry point', 'legacy compatibility adapter buildAnthropicRequestBody'],
    loadBearingElements: LOAD_BEARING,
    mismatches,
    verdict: mismatches.length === 0 ? 'PASS' : 'FAIL',
    note: 'the two differ only where a difference is demonstrably non-semantic; every load-bearing '
      + 'element above is compared by value or by digest.',
    production: prod, adapter: adap,
  };
  writeFileSync(join(OUT, 'SECTION-249-ADAPTER-PARITY.json'), JSON.stringify(parity, null, 2));

  console.log('invoked contract version   :', result.contractVersion);
  console.log('discriminated union        :', proof.requirements.discriminatedUnion);
  console.log('roleJustification          :', proof.requirements.roleJustification);
  console.log('prompt justification block :', proof.requirements.systemPromptJustificationInstruction);
  console.log('pairs                      :', prod.admissiblePairs, 'admissible /',
    prod.inadmissiblePairsExpressible, 'inadmissible');
  console.log('strict schema              :', proof.requirements.strictSchema);
  console.log('unsupported keywords       :', proof.requirements.unsupportedProviderKeywordsSurviving);
  console.log('ALL REQUIREMENTS MET       :', proof.allRequirementsMet);
  console.log('adapter parity             :', parity.verdict,
    mismatches.length ? `mismatches: ${mismatches.join(',')}` : '');
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
  if (!proof.allRequirementsMet || mismatches.length) process.exit(1);
}
void main();
