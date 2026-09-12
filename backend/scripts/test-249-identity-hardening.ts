/**
 * §249 -- CANDIDATE IDENTITY v2 HARDENING: DERIVATION + THE SIX REQUIRED NEGATIVE TESTS.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. Contains no network primitive.
 *
 * The positive derivation runs against the REAL production entry point. Each negative fixture feeds
 * the derivation an assembled request that differs in exactly one load-bearing way, and the
 * derivation must FAIL. A "17 / 17" that cannot be broken by these six is not evidence.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import {
  build239SystemPrompt, buildExpert239WireSchema,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import {
  build247SystemPrompt, buildExpert247WireSchema,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  deriveExecutableIdentity, type AssembledRequest,
} from './lib/expert-249-executable-identity';

const BACKEND = join(__dirname, '..');
const OUT = join(BACKEND, '..', 'verification',
  'expert-hazlenz-249-executable-binding-and-identity-hardening-2026-09-12');
const fsha = (p: string): string =>
  createHash('sha256').update(readFileSync(join(BACKEND, p))).digest('hex');

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const S = 'src/safescope-v2/expert-hazlenz/';
const C = `${S}contract/`;
const contractFiles = readdirSync(join(BACKEND, C)).filter(f => f.endsWith('.ts')).sort();
const moduleDigests: Record<string, string> = {
  entryPoint: fsha(`${S}expert-hazlenz-analysis.ts`),
  adapter: fsha('src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts'),
  envelope: fsha('src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts'),
  postureContract: fsha(`${C}expert-247-posture-contract.ts`),
  verifierInstruction: fsha(`${C}expert-218-property-instruction.ts`),
  verifierSchema: fsha(`${C}expert-218-property-review-contract.ts`),
  propertyAuthority: fsha(`${S}owed-facts/property-authority.ts`),
  settlementReview: fsha(`${S}owed-facts/settlement-review.ts`),
  closureDigest: createHash('sha256')
    .update(contractFiles.map(f => `${f}:${fsha(C + f)}`).join('\n')).digest('hex'),
};

const input: any = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'SEC-249-IDENTITY',
  authoritativeSources: [{ sourceId: 'obs-1', kind: 'OBSERVATION', text: 'identity derivation probe' }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'GB',
  allowedHazardFamilies: ['VEHICLE_PEDESTRIAN'],
  deterministicFindings: [], familyDispositions: [], governedStandards: [], answeredClarifications: [],
};
const governed = { governedEvidenceSourceIds: [] as string[] };

class Capture implements ExpertSemanticTransport {
  captured: ExpertLegRequest | null = null;
  async send(r: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (this.captured === null) this.captured = r;
    return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: '' };
  }
}

const assemble = (systemPrompt: string, wireSchema: unknown, over: Record<string, any> = {})
: AssembledRequest => {
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS', systemPrompt, userPrompt: 'u',
    toolName: 'emit_expert_analysis', toolDescription: 'd',
    inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(wireSchema)),
  }) as Record<string, any>;
  if (over.strict !== undefined) body.tools[0].strict = over.strict;
  return { systemPrompt, wireSchema, body, governedCount: 0, schemaInput: { input, governed } };
};

async function main(): Promise<void> {
  // ---------------- positive: the real production entry point
  const cap = new Capture();
  await runExpertHazLenzAnalysis({
    input, observation: { sourceId: 'obs-1', text: 'identity derivation probe' },
    governedRecords: [], governedEvidence: [],
  }, cap);
  const leg = cap.captured!;
  const production: AssembledRequest = {
    systemPrompt: leg.systemPrompt, wireSchema: leg.wireSchema,
    body: buildEnvelopeRequestBody({
      leg: leg.leg, systemPrompt: leg.systemPrompt, userPrompt: leg.userPrompt,
      toolName: leg.toolName, toolDescription: leg.toolDescription,
      inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(leg.wireSchema)),
    }) as Record<string, any>,
    governedCount: 0, schemaInput: { input, governed },
  };
  const adapterBody = buildAnthropicRequestBody(input) as Record<string, any>;
  const adapter: AssembledRequest = {
    systemPrompt: String(adapterBody.system), wireSchema: null,
    body: adapterBody, governedCount: 0, schemaInput: { input, governed },
  };
  // the adapter's pre-pipeline schema, re-derived from the builder the bytes reproduce
  (adapter as any).wireSchema = buildExpert247WireSchema(input, governed);

  console.log('---- positive derivation, from the real entry point ----');
  const real = deriveExecutableIdentity({ production, adapter, moduleDigests });
  ok('P1 the derivation is execution-derived', real.derivation === 'EXECUTION_DERIVED');
  ok('P2 all 17 elements resolve', real.resolved === 17 && real.required === 17,
    `${real.resolved}/${real.required}`);
  ok('P3 zero written declarations were used', real.declarationsUsed === 0);
  ok('P4 zero failures', real.failures.length === 0, real.failures.join(' | '));
  ok('P5 an identity digest was produced', typeof real.identityDigest === 'string');
  ok('P6 element 5 resolved because the bytes reproduce the §247 prompt builder',
    real.elements.find(e => e.n === 5)?.resolvedTo === 'build247SystemPrompt');
  ok('P7 element 6 resolved because the bytes reproduce the §247 schema builder',
    real.elements.find(e => e.n === 6)?.resolvedTo === 'buildExpert247WireSchema');

  console.log('\n---- the six required negative fixtures ----');
  const neg: { id: string; why: string; failed: boolean }[] = [];
  const expectFail = (id: string, why: string, r: ReturnType<typeof deriveExecutableIdentity>): void => {
    const broke = r.failures.length > 0 || r.resolved < 17 || r.identityDigest === null;
    neg.push({ id, why, failed: broke });
    ok(id, broke, broke ? 'identity correctly FAILED' : 'IDENTITY STILL PASSED — unacceptable');
  };

  // N1: entry point invokes the §239 prompt while the §247 prompt exists in the same directory.
  expectFail('N1 §239 prompt invoked while §247 prompt exists',
    'element 5 must not resolve',
    deriveExecutableIdentity({
      production: assemble(build239SystemPrompt(0), buildExpert247WireSchema(input, governed)),
      adapter, moduleDigests,
    }));

  // N2: entry point invokes the §239 schema while the §247 schema exists.
  expectFail('N2 §239 schema invoked while §247 schema exists',
    'element 6 must not resolve',
    deriveExecutableIdentity({
      production: assemble(build247SystemPrompt(0), buildExpert239WireSchema(input, governed)),
      adapter, moduleDigests,
    }));

  // N3: the K6 successor module exists but the invoked schema still permits 10 combinations.
  expectFail('N3 K6 successor exists but the invoked schema permits 10 combinations',
    'element 17 must not resolve',
    deriveExecutableIdentity({
      production: assemble(build239SystemPrompt(0), buildExpert239WireSchema(input, governed)),
      adapter, moduleDigests,
    }));

  // N4: the roleJustification contract exists but the actual request omits it.
  const stripped = JSON.parse(JSON.stringify(buildExpert247WireSchema(input, governed)));
  for (const b of stripped.properties.immediateSafetyPosture.properties.requiredBy.items.anyOf) {
    delete b.properties.roleJustification;
  }
  expectFail('N4 roleJustification contract exists but the request omits it',
    'element 17 must not resolve',
    deriveExecutableIdentity({
      production: assemble(build247SystemPrompt(0), stripped), adapter, moduleDigests,
    }));

  // N5: production and the adapter invoke different contract versions.
  expectFail('N5 production and adapter invoke different contract versions',
    'element 3 must not resolve',
    deriveExecutableIdentity({
      production,
      adapter: assemble(build239SystemPrompt(0), buildExpert239WireSchema(input, governed)),
      moduleDigests,
    }));

  // N6: strict schema disabled on an executable path.
  expectFail('N6 strict schema disabled on the production request',
    'element 13 must not resolve',
    deriveExecutableIdentity({
      production: assemble(build247SystemPrompt(0), buildExpert247WireSchema(input, governed),
        { strict: false }),
      adapter, moduleDigests,
    }));

  writeFileSync(join(OUT, 'SECTION-249-IDENTITY-NEGATIVE-TESTS.json'), JSON.stringify({
    section: '249', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    principle: 'a 17/17 that cannot be broken by these six is not evidence',
    required: 6, executed: neg.length, correctlyFailed: neg.filter(n => n.failed).length,
    verdict: neg.every(n => n.failed) ? 'PASS' : 'FAIL',
    fixtures: neg,
  }, null, 2));

  writeFileSync(join(OUT, 'SECTION-249-CANDIDATE-IDENTITY-V2.json'), JSON.stringify({
    section: '249', identityVersion: 'hazlenz.expert.candidate-identity.v2.execution-derived',
    generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    derivation: real.derivation,
    supersedes: 'the §247 identity, which was declaration-derived and is preserved as historical evidence',
    mechanicallyResolved: real.resolved, required: real.required,
    declarationsUsed: real.declarationsUsed, unresolved: real.required - real.resolved,
    failures: real.failures,
    executableIdentityDigest: real.identityDigest,
    invokedPromptBuilder: real.elements.find(e => e.n === 5)?.resolvedTo,
    invokedSchemaBuilder: real.elements.find(e => e.n === 6)?.resolvedTo,
    contractClosureModules: contractFiles.length,
    elements: real.elements,
  }, null, 2));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) console.log('FAILED:\n  ' + failures.join('\n  '));
  console.log('identity digest:', real.identityDigest);
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
  process.exit(fail ? 1 : 0);
}
void main();
