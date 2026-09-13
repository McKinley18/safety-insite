/**
 * §250 -- PRE-SPEND GATE. ZERO PROVIDER CALLS BY CONSTRUCTION. Contains no network primitive.
 *
 * Re-derives the executable identity IN MEMORY from the live production path and compares it to the
 * frozen §249 value. It writes nothing into any prior package: §247, §248 and §249 are preserved
 * byte for byte.
 */
import { readFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/expert-request-envelope';
import { buildExpert247WireSchema } from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  deriveExecutableIdentity, k6OfTransmitted, type AssembledRequest,
} from './lib/expert-249-executable-identity';

const BACKEND = join(__dirname, '..');
const P249 = join(BACKEND, '..', 'verification',
  'expert-hazlenz-249-executable-binding-and-identity-hardening-2026-09-12');
const fsha = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');

export const FROZEN = {
  package249: '39ba3940b2512e7fa184fcc7375a068eec469405ecf845ffd0e8b9c394ae9cfa',
  identity: 'e59cbf26b67a030068a091e8df84f57333c7b19dda28c8718a749d757c8993e6',
  instrument: 'e45fc33843e71b778b0f2af8c41356855bf670de80e719b8371f21f894269b9f',
} as const;

export interface GateResult { id: string; verdict: 'PASS' | 'FAIL'; detail: string }

export async function runPreSpendGate(): Promise<GateResult[]> {
  const r: GateResult[] = [];
  const add = (id: string, ok: boolean, detail = ''): void =>
    void r.push({ id, verdict: ok ? 'PASS' : 'FAIL', detail });

  // ---- §249 package integrity
  const man = readFileSync(join(P249, 'REPORT-249.sha256'), 'utf8').trim().split('\n');
  add('G1 §249 package members verify',
    man.every(l => { const [d, n] = l.split(/\s+/); return fsha(join(P249, n)) === d; }),
    `${man.length} files`);
  add('G2 §249 package digest matches the authorization',
    fsha(join(P249, 'REPORT-249.sha256')) === FROZEN.package249);
  add('G3 the frozen confirmation instrument digest is unchanged',
    fsha(join(P249, 'SECTION-249-CONFIRMATION-REFREEZE.json')) === FROZEN.instrument);

  const refreeze = JSON.parse(
    readFileSync(join(P249, 'SECTION-249-CONFIRMATION-REFREEZE.json'), 'utf8'));
  add('G4 substantive confirmation changes since re-freeze are zero',
    refreeze.substantiveChangesFrom247 === 0 && refreeze.caseCount === 6
    && refreeze.successFloor === '5/6' && refreeze.gates.length === 6);

  // ---- live re-derivation of the executable identity
  const S = 'src/hazlenz/expert-hazlenz/';
  const C = `${S}contract/`;
  const files = readdirSync(join(BACKEND, C)).filter(f => f.endsWith('.ts')).sort();
  const moduleDigests: Record<string, string> = {
    entryPoint: fsha(join(BACKEND, `${S}expert-hazlenz-analysis.ts`)),
    adapter: fsha(join(BACKEND, 'src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts')),
    envelope: fsha(join(BACKEND, 'src/hazlenz/expert-hazlenz-adapters/expert-request-envelope.ts')),
    postureContract: fsha(join(BACKEND, `${C}expert-247-posture-contract.ts`)),
    verifierInstruction: fsha(join(BACKEND, `${C}expert-218-property-instruction.ts`)),
    verifierSchema: fsha(join(BACKEND, `${C}expert-218-property-review-contract.ts`)),
    propertyAuthority: fsha(join(BACKEND, `${S}owed-facts/property-authority.ts`)),
    settlementReview: fsha(join(BACKEND, `${S}owed-facts/settlement-review.ts`)),
    closureDigest: createHash('sha256')
      .update(files.map(f => `${f}:${fsha(join(BACKEND, C + f))}`).join('\n')).digest('hex'),
  };

  const input: any = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'SEC-249-IDENTITY',
    authoritativeSources: [{ sourceId: 'obs-1', kind: 'OBSERVATION', text: 'identity derivation probe' }],
    inspectionContext: { location: null, task: null }, jurisdiction: 'GB',
    allowedHazardFamilies: ['VEHICLE_PEDESTRIAN'],
    deterministicFindings: [], familyDispositions: [], governedStandards: [], answeredClarifications: [],
  };
  const governed = { governedEvidenceSourceIds: [] as string[] };

  class Capture implements ExpertSemanticTransport {
    captured: ExpertLegRequest | null = null;
    async send(q: ExpertLegRequest): Promise<ExpertLegResponse> {
      if (this.captured === null) this.captured = q;
      return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: '' };
    }
  }
  const cap = new Capture();
  await runExpertHazLenzAnalysis({
    input, observation: { sourceId: 'obs-1', text: 'identity derivation probe' },
    governedRecords: [], governedEvidence: [],
  }, cap);
  const leg = cap.captured as ExpertLegRequest;
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
    systemPrompt: String(adapterBody.system),
    wireSchema: buildExpert247WireSchema(input, governed),
    body: adapterBody, governedCount: 0, schemaInput: { input, governed },
  };

  const id = deriveExecutableIdentity({ production, adapter, moduleDigests });
  add('G5 Candidate Identity v2 resolves 17/17 with zero declarations',
    id.resolved === 17 && id.required === 17 && id.declarationsUsed === 0 && id.failures.length === 0,
    `${id.resolved}/${id.required}`);
  add('G6 the live executable identity digest equals the frozen value',
    id.identityDigest === FROZEN.identity, String(id.identityDigest));
  add('G7 the executable prompt builder is build247SystemPrompt',
    id.elements.find(e => e.n === 5)?.resolvedTo === 'build247SystemPrompt');
  add('G8 the executable schema builder is buildExpert247WireSchema',
    id.elements.find(e => e.n === 6)?.resolvedTo === 'buildExpert247WireSchema');

  const k6 = k6OfTransmitted(production.body);
  add('G9 roleJustification is present on the transmitted schema', k6.justification);
  add('G10 K6 is 6 admissible / 0 inadmissible',
    k6.union && k6.admissible === 6 && k6.inadmissible === 0,
    `union=${k6.union} admissible=${k6.admissible} inadmissible=${k6.inadmissible}`);
  add('G11 strict schema is enabled', production.body.tools[0].strict === true);

  const count = (n: unknown, k: string): number => {
    if (Array.isArray(n)) return n.reduce((a: number, v) => a + count(v, k), 0);
    if (!n || typeof n !== 'object') return 0;
    return Object.entries(n as Record<string, unknown>)
      .reduce((a, [kk, v]) => a + (kk === k ? 1 : 0) + count(v, k), 0);
  };
  const schemaSent = production.body.tools[0].input_schema;
  const unsupported = ['minLength', 'minItems', 'oneOf', 'allOf']
    .reduce((a, k) => a + count(schemaSent, k), 0);
  add('G12 zero unsupported provider keywords survive', unsupported === 0, String(unsupported));

  const prodSha = createHash('sha256').update(production.systemPrompt).digest('hex');
  const adapSha = createHash('sha256').update(adapter.systemPrompt).digest('hex');
  add('G13 production/adapter semantic parity', prodSha === adapSha
    && JSON.stringify(k6) === JSON.stringify(k6OfTransmitted(adapter.body))
    && adapter.body.tools[0].strict === true);

  return r;
}

if (require.main === module) {
  void (async () => {
    const rows = await runPreSpendGate();
    rows.forEach(x => console.log(`${x.verdict}  ${x.id}${x.detail ? '  [' + x.detail + ']' : ''}`));
    const failed = rows.filter(x => x.verdict === 'FAIL');
    console.log(`\n${rows.length - failed.length} passed, ${failed.length} failed`);
    if (failed.length) console.log('STOP BEFORE SPEND. Provider calls made: 0.');
    console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
    process.exit(failed.length ? 1 : 0);
  })();
}
