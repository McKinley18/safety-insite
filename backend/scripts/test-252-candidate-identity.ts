/**
 * §252 -- CANDIDATE IDENTITY v2.2 SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Positive derivation from the real production entry point, the behavioural proofs that the
 * admission layer is INVOKED and not merely present, and the negative fixtures that must fail the
 * identity. Writes SECTION-252-CANDIDATE-IDENTITY-V2-2.json.
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, EXPERT_REQUEST_ENVELOPE, envelopeBoundOptions,
} from '../src/hazlenz/expert-hazlenz-adapters/expert-request-envelope';
import { buildExpert247WireSchema } from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import { build239SystemPrompt, buildExpert239WireSchema }
  from '../src/hazlenz/expert-hazlenz/contract/expert-239-posture-contract';
import { build247SystemPrompt } from '../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import { ADMISSION_252_VERSION }
  from '../src/hazlenz/expert-hazlenz/contract/expert-252-structural-admission';
import {
  deriveCandidateIdentity252, type AssembledRequest252, type BehaviouralProof252,
} from './lib/expert-252-candidate-identity';
import { OBS, INPUT, validOutput } from './verify-252-admission-matrix';

const BACKEND = join(__dirname, '..');
const OUT = join(BACKEND, '..', 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const fsha = (p: string): string =>
  createHash('sha256').update(readFileSync(join(BACKEND, p))).digest('hex');

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const S = 'src/hazlenz/expert-hazlenz/';
const C = `${S}contract/`;
const contractFiles = readdirSync(join(BACKEND, C)).filter(f => f.endsWith('.ts')).sort();
const moduleDigests: Record<string, string> = {
  entryPoint: fsha(`${S}expert-hazlenz-analysis.ts`),
  adapter: fsha('src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts'),
  envelope: fsha('src/hazlenz/expert-hazlenz-adapters/expert-request-envelope.ts'),
  postureContract: fsha(`${C}expert-247-posture-contract.ts`),
  postureProjection: fsha(`${C}expert-239-posture-projection.ts`),
  roleJustificationProjection: fsha(`${C}expert-247-role-justification-projection.ts`),
  structuralAdmission: fsha(`${C}expert-252-structural-admission.ts`),
  verifierInstruction: fsha(`${C}expert-218-property-instruction.ts`),
  verifierSchema: fsha(`${C}expert-218-property-review-contract.ts`),
  reviewArtifacts: fsha(`${C}expert-218-property-consistency.ts`),
  propertyAuthority: fsha(`${S}owed-facts/property-authority.ts`),
  settlementReview: fsha(`${S}owed-facts/settlement-review.ts`),
  closureDigest: createHash('sha256')
    .update(contractFiles.map(f => `${f}:${fsha(C + f)}`).join('\n')).digest('hex'),
};

const governed = { governedEvidenceSourceIds: [] as string[] };
const clone = (o: any): any => JSON.parse(JSON.stringify(o));

/** Returns whatever the entry point is handed, and answers with a caller-supplied tool input. */
class Replay implements ExpertSemanticTransport {
  captured: ExpertLegRequest | null = null;
  constructor(private readonly firstPassInput: unknown | null) {}
  async send(r: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (this.captured === null) this.captured = r;
    if (r.leg !== 'FIRST_PASS' || this.firstPassInput === null) {
      return { ok: false, toolInput: null, failureKind: 'CAPTURED_NOT_SENT', detail: '' };
    }
    return { ok: true, toolInput: this.firstPassInput, failureKind: null, detail: null };
  }
}

async function drive(toolInput: unknown | null) {
  const t = new Replay(toolInput);
  const result = await runExpertHazLenzAnalysis({
    input: INPUT, observation: OBS, governedRecords: [], governedEvidence: [],
  }, t);
  return { result, captured: t.captured! };
}

const assembleFrom = (leg: ExpertLegRequest, over: Record<string, any> = {}): AssembledRequest252 => {
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS', systemPrompt: leg.systemPrompt, userPrompt: leg.userPrompt,
    toolName: leg.toolName, toolDescription: leg.toolDescription,
    inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(leg.wireSchema)),
  }) as Record<string, any>;
  if (over.strict !== undefined) body.tools[0].strict = over.strict;
  return { systemPrompt: leg.systemPrompt, wireSchema: leg.wireSchema, body,
    governedCount: 0, schemaInput: { input: INPUT, governed } };
};

async function main(): Promise<void> {
  // ---------------- behavioural proofs: the admission layer, by execution
  console.log('---- behavioural proof that the admission layer is INVOKED ----');

  const valid = await drive(validOutput());
  const undeclared = await drive((() => {
    const o = clone(validOutput()); o.immediateSafetyPosture.overrideApproval = 'granted'; return o;
  })());
  const badK6 = await drive((() => {
    const o = clone(validOutput());
    o.immediateSafetyPosture.requiredBy[1].refKind = 'HAZARD_CANDIDATE';
    o.immediateSafetyPosture.requiredBy[1].ref = 'mewp-slab-capacity'; return o;
  })());
  const badJust = await drive((() => {
    const o = clone(validOutput());
    delete o.immediateSafetyPosture.requiredBy[0].roleJustification.whyDecisionMaterial; return o;
  })());
  const rr7 = await drive((() => {
    const o = clone(validOutput());
    o.unresolvedFactDeclarations[0].observationSpan = 'a span that was never observed'; return o;
  })());

  const probes = [valid, undeclared, badK6, badJust, rr7];
  const behaviour: BehaviouralProof252 = {
    undeclaredPropertyRefused: undeclared.result.admission === 'REFUSE'
      && undeclared.result.conformanceViolations.some(v => v.code === 'PROPERTY_NOT_DECLARED_BY_CONTRACT'),
    undeclaredPropertyCode: undeclared.result.conformanceViolations[0]?.code ?? null,
    inadmissibleK6PairRefused:
      badK6.result.postureRefusalCodes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'),
    inadmissibleK6PairCode: 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
    missingJustificationMemberRefused: badJust.result.admission === 'REFUSE'
      && badJust.result.status === 'FIRST_PASS_REFUSED',
    missingJustificationMemberCode: badJust.result.conformanceViolations[0]?.code
      ?? badJust.result.roleJustificationCodes[0] ?? null,
    rr7PreservedUnresolvedTruth: rr7.result.admission === 'PRESERVE_UNRESOLVED',
    validOutputAdmitted: valid.result.admission === 'ADMIT' && valid.result.status === 'COMPLETE',
    zeroSemanticInventions: probes.every(p => p.result.semanticInventions.length === 0),
  };
  ok('B1 an undeclared property is refused, which only the §252 gate refuses',
    behaviour.undeclaredPropertyRefused, String(behaviour.undeclaredPropertyCode));
  ok('B2 an inadmissible K6 role/carrier pair is refused deterministically',
    behaviour.inadmissibleK6PairRefused);
  ok('B3 a justification missing a required member is refused',
    behaviour.missingJustificationMemberRefused, String(behaviour.missingJustificationMemberCode));
  ok('B4 RR-7 preserves unresolved truth from a malformed declaration',
    behaviour.rr7PreservedUnresolvedTruth, String(rr7.result.admission));
  ok('B5 a valid complete output is still admitted', behaviour.validOutputAdmitted,
    String(valid.result.admission));
  ok('B6 no probe produced a semantic invention', behaviour.zeroSemanticInventions);

  // ---------------- positive derivation
  console.log('\n---- positive derivation, from the real production entry point ----');
  const production = assembleFrom(valid.captured);
  const adapterBody = buildAnthropicRequestBody(INPUT) as Record<string, any>;
  const adapter: AssembledRequest252 = {
    systemPrompt: String(adapterBody.system),
    wireSchema: buildExpert247WireSchema(INPUT, governed),
    body: adapterBody, governedCount: 0, schemaInput: { input: INPUT, governed },
  };
  const io = {
    production, adapter, moduleDigests, behaviour,
    envelopeStrictSchema: EXPERT_REQUEST_ENVELOPE.strictSchema,
    candidateStrictSchema: false,
  };
  const real = deriveCandidateIdentity252(io);
  ok('P1 the derivation is execution-derived', real.derivation === 'EXECUTION_DERIVED');
  ok(`P2 all ${real.required} elements resolve`, real.resolved === real.required,
    `${real.resolved}/${real.required}`);
  ok('P3 zero written declarations were used', real.declarationsUsed === 0);
  ok('P4 zero failures', real.failures.length === 0, real.failures.join(' | '));
  ok('P5 an identity digest was produced', real.identityDigest !== null);
  ok('P6 the candidate binds strict = FALSE', real.boundStrictSchema === false);
  ok('P7 element 13 records the assembled strict value',
    real.elements.find(e => e.n === 13)?.resolvedTo === 'false');
  ok('P8 element 19 resolves to the §252 admission version',
    real.elements.find(e => e.n === 19)?.resolvedTo === ADMISSION_252_VERSION);

  // ---------------- negative fixtures
  console.log('\n---- negative fixtures: the identity must FAIL ----');
  const neg = (id: string, over: Partial<typeof io>, why: string): void => {
    const r = deriveCandidateIdentity252({ ...io, ...over } as any);
    ok(id, r.identityDigest === null, r.identityDigest === null ? 'identity correctly FAILED'
      : `identity WRONGLY held: ${why}`);
  };
  neg('N1 strict flipped back ON while the candidate is declared against FALSE',
    { production: assembleFrom(valid.captured, { strict: true }) },
    'a strict flip must change the candidate');
  neg('N2 the candidate declared against TRUE while the envelope binds FALSE',
    { candidateStrictSchema: true }, 'a candidate cannot claim a setting the envelope does not bind');
  neg('N3 the envelope binds TRUE while the request carries FALSE',
    { envelopeStrictSchema: true }, 'envelope and wire must agree');
  neg('N4 the §239 prompt invoked while the §247 prompt exists',
    { production: { ...production, systemPrompt: build239SystemPrompt(0) } },
    'a contract downgrade must change the candidate');
  neg('N5 the §239 schema invoked while the §247 schema exists',
    { production: { ...production, wireSchema: buildExpert239WireSchema(INPUT, governed),
      body: assembleFrom({ ...valid.captured, wireSchema: buildExpert239WireSchema(INPUT, governed) }).body } },
    'a K6 downgrade must change the candidate');
  neg('N6 the admission layer present but NOT invoked',
    { behaviour: { ...behaviour, undeclaredPropertyRefused: false } },
    'existence must not substitute for invocation');
  neg('N7 K6 admission not enforced deterministically',
    { behaviour: { ...behaviour, inadmissibleK6PairRefused: false } }, 'K6 must be enforced');
  neg('N8 roleJustification validation not enforced',
    { behaviour: { ...behaviour, missingJustificationMemberRefused: false } },
    'justification must be enforced');
  neg('N9 RR-7 no longer preserves unresolved truth',
    { behaviour: { ...behaviour, rr7PreservedUnresolvedTruth: false } }, 'RR-7 must hold');
  neg('N10 the guarantees became vacuous over-refusal',
    { behaviour: { ...behaviour, validOutputAdmitted: false } },
    'refusing everything is not containment');
  neg('N11 a semantic invention occurred anywhere',
    { behaviour: { ...behaviour, zeroSemanticInventions: false } }, 'invention is never admissible');

  writeFileSync(join(OUT, 'SECTION-252-CANDIDATE-IDENTITY-V2-2.json'), JSON.stringify({
    section: '252', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    version: 'v2.2',
    supersedes: 'SECTION-249-CANDIDATE-IDENTITY.json (v2), which bound strict=TRUE as a resolution '
      + 'condition and remains a true statement about the pre-§252 architecture',
    derivation: real.derivation,
    boundStrictSchema: real.boundStrictSchema,
    envelope: envelopeBoundOptions(EXPERT_REQUEST_ENVELOPE),
    admissionVersion: ADMISSION_252_VERSION,
    resolved: real.resolved, required: real.required, declarationsUsed: real.declarationsUsed,
    failures: real.failures,
    identityDigest: real.identityDigest,
    behaviouralProof: behaviour,
    elements: real.elements,
    moduleDigests,
    suite: { passed: pass, failed: fail, failures },
  }, null, 2));

  console.log(`\n${pass} passed, ${fail} failed`);
  console.log(`identity digest: ${real.identityDigest}`);
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
  if (fail > 0) process.exitCode = 1;
}
void main();
