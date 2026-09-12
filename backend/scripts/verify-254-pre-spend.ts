/**
 * §254 -- PRE-SPEND GATE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * A failing precondition means STOP BEFORE SPEND. This gate never repairs anything it finds; it
 * reports and refuses. It is imported by the executor, which will not make a provider call unless
 * every check passes.
 *
 * The candidate identity is RE-DERIVED LIVE from the production entry point and compared to the
 * authorized digest. A recorded value is never accepted in place of a derivation.
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

import {
  runExpertHazLenzAnalysis, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, buildAnthropicRequestBody,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildEnvelopeRequestBody, EXPERT_REQUEST_ENVELOPE,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';
import { build247SystemPrompt } from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { buildExpert253WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-253-posture-contract';
import { ADMISSION_252_VERSION }
  from '../src/safescope-v2/expert-hazlenz/contract/expert-252-structural-admission';
import { type AssembledRequest252, type BehaviouralProof252 }
  from './lib/expert-252-candidate-identity';
import {
  deriveCandidateIdentity253, readAlongsideControlBinding253,
} from './lib/expert-253-candidate-identity';
import { OBS, INPUT, validOutput } from './verify-252-admission-matrix';

const BACKEND = join(__dirname, '..');
const ROOT = join(BACKEND, '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const fsha = (p: string): string =>
  createHash('sha256').update(readFileSync(join(BACKEND, p))).digest('hex');

/** The values §254 authorizes. Copied from the authorization and checked, never trusted. */
export const AUTHORIZED = {
  candidateIdentity: '293697746d7de52c1c5b8492592189e93211a0c986975832d8d8401bb258cfbf',
  instrumentDigest: '674e940157b2d0647158a56c998e76d49fedf0d7c0ab4c53025a6ff886bf59ef',
  package253: '25444e3be6e7a2e531ffb2228bbc28fb0fadb48b7b571d0a2595c0dea95bf303',
  package252: 'a08844f9ca807dd514ed42952eefb54385992109b779671c4aa8d9197d3c340b',
  systemPromptNoGoverned: 'a2f53370753526ad2a5ae8c07a8b81956c91bbdc67fc7b82e84da9e110d6a957',
} as const;

const P253 = join(ROOT, 'verification',
  'expert-hazlenz-253-alongside-control-contract-closure-2026-09-12');
const P252 = join(ROOT, 'verification',
  'expert-hazlenz-252-nonstrict-admission-architecture-2026-09-12');

export interface GateCheck { id: string; verdict: 'PASS' | 'FAIL'; detail: string }

const S = 'src/safescope-v2/expert-hazlenz/';
const C = `${S}contract/`;

class Replay implements ExpertSemanticTransport {
  captured: ExpertLegRequest | null = null;
  constructor(private readonly firstPassInput: unknown | null) {}
  async send(r: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (this.captured === null) this.captured = r;
    if (r.leg !== 'FIRST_PASS' || this.firstPassInput === null) {
      return { ok: false, toolInput: null, failureKind: 'NOT_SENT', detail: '' };
    }
    return { ok: true, toolInput: this.firstPassInput, failureKind: null, detail: null };
  }
}
const clone = (o: any): any => JSON.parse(JSON.stringify(o));

async function drive(toolInput: unknown | null) {
  const t = new Replay(toolInput);
  const result = await runExpertHazLenzAnalysis({
    input: INPUT, observation: OBS, governedRecords: [], governedEvidence: [],
  }, t);
  return { result, captured: t.captured! };
}

/** Verify a package against its own manifest and reproduce its package digest. */
function packageDigest(dir: string, manifestName: string): { digest: string; drift: string[] } {
  const lines = readFileSync(join(dir, manifestName), 'utf8').split('\n').filter(Boolean);
  const drift = lines.filter(l => {
    const [d, n] = l.trim().split(/\s+/);
    return createHash('sha256').update(readFileSync(join(dir, n))).digest('hex') !== d;
  }).map(l => l.trim().split(/\s+/)[1]);
  return {
    digest: createHash('sha256').update(readFileSync(join(dir, manifestName))).digest('hex'),
    drift,
  };
}

export async function runPreSpendGate254(): Promise<{
  checks: GateCheck[]; identityDigest: string | null; instrument: any; cases: any[];
}> {
  const checks: GateCheck[] = [];
  const add = (id: string, cond: boolean, detail = ''): void => {
    checks.push({ id, verdict: cond ? 'PASS' : 'FAIL', detail });
  };

  // ---------------- behavioural proofs, the same five the v2.3 identity requires
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
      && undeclared.result.conformanceViolations.some(
        v => v.code === 'PROPERTY_NOT_DECLARED_BY_CONTRACT'),
    undeclaredPropertyCode: undeclared.result.conformanceViolations[0]?.code ?? null,
    inadmissibleK6PairRefused:
      badK6.result.postureRefusalCodes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'),
    inadmissibleK6PairCode: 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND',
    missingJustificationMemberRefused: badJust.result.admission === 'REFUSE'
      && badJust.result.status === 'FIRST_PASS_REFUSED',
    missingJustificationMemberCode: badJust.result.conformanceViolations[0]?.code ?? null,
    rr7PreservedUnresolvedTruth: rr7.result.admission === 'PRESERVE_UNRESOLVED',
    validOutputAdmitted: valid.result.admission === 'ADMIT'
      && valid.result.status === 'COMPLETE',
    zeroSemanticInventions: probes.every(p => p.result.semanticInventions.length === 0),
  };

  // ---------------- live identity derivation
  const contractFiles = readdirSync(join(BACKEND, C)).filter(f => f.endsWith('.ts')).sort();
  const moduleDigests: Record<string, string> = {
    entryPoint: fsha(`${S}expert-hazlenz-analysis.ts`),
    adapter: fsha('src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts'),
    envelope: fsha('src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts'),
    postureContract: fsha(`${C}expert-247-posture-contract.ts`),
    postureContract253: fsha(`${C}expert-253-posture-contract.ts`),
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
  const leg = valid.captured;
  const assembleFrom = (r: ExpertLegRequest): AssembledRequest252 => ({
    systemPrompt: r.systemPrompt, wireSchema: r.wireSchema,
    body: buildEnvelopeRequestBody({
      leg: 'FIRST_PASS', systemPrompt: r.systemPrompt, userPrompt: r.userPrompt,
      toolName: r.toolName, toolDescription: r.toolDescription,
      inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(r.wireSchema)),
    }) as Record<string, any>,
    governedCount: 0, schemaInput: { input: INPUT, governed },
  });
  const production = assembleFrom(leg);
  const adapterBody = buildAnthropicRequestBody(INPUT) as Record<string, any>;
  const adapter: AssembledRequest252 = {
    systemPrompt: String(adapterBody.system),
    wireSchema: buildExpert253WireSchema(INPUT, governed),
    body: adapterBody, governedCount: 0, schemaInput: { input: INPUT, governed },
  };
  const alongsideControl = readAlongsideControlBinding253(
    readFileSync(join(BACKEND, `${C}expert-247-role-justification-projection.ts`), 'utf8'));
  const identity = deriveCandidateIdentity253({
    production, adapter, moduleDigests, behaviour, alongsideControl,
    envelopeStrictSchema: EXPERT_REQUEST_ENVELOPE.strictSchema,
    candidateStrictSchema: false,
  });

  add('G1 candidate identity re-derives to the authorized v2.3 digest',
    identity.identityDigest === AUTHORIZED.candidateIdentity,
    `${identity.identityDigest} vs ${AUTHORIZED.candidateIdentity}`);
  add('G2 all v2.3 identity elements resolve',
    identity.resolved === identity.required, `${identity.resolved}/${identity.required}`);
  add('G3 strictSchema is FALSE on the envelope and on the assembled request',
    EXPERT_REQUEST_ENVELOPE.strictSchema === false
    && (production.body.tools as any[])[0].strict === false);
  add('G4 the §253 successor cessation schema is the one the entry point invokes',
    identity.elements.find(e => e.n === 6)?.resolvedTo === 'buildExpert253WireSchema');
  add('G5 the finalized alongsideControlConsidered semantics are bound',
    identity.elements.find(e => e.n === 24)?.resolved === true);
  add('G6 the structural admission module is active, proved by execution',
    behaviour.undeclaredPropertyRefused, ADMISSION_252_VERSION);
  add('G7 the admission verdict rule is active',
    valid.result.admission === 'ADMIT' && undeclared.result.admission === 'REFUSE');
  add('G8 the normalizer is active',
    (await drive((() => { const o = clone(validOutput());
      o.expertHazardCandidates = JSON.stringify(o.expertHazardCandidates); return o; })()))
      .result.admission === 'ADMIT');
  add('G9 the posture projection is active', behaviour.inadmissibleK6PairRefused);
  add('G10 the role-justification projection is active',
    behaviour.missingJustificationMemberRefused);
  add('G11 RR-7 is active', behaviour.rr7PreservedUnresolvedTruth);
  add('G12 the authority and settlement controls are present and bound',
    identity.elements.find(e => e.n === 14)?.resolved === true
    && identity.elements.find(e => e.n === 15)?.resolved === true
    && identity.elements.find(e => e.n === 16)?.resolved === true
    && identity.elements.find(e => e.n === 17)?.resolved === true);
  add('G13 the system prompt matches the frozen candidate',
    sha(build247SystemPrompt(0)) === AUTHORIZED.systemPromptNoGoverned,
    sha(build247SystemPrompt(0)));
  add('G14 no semantic invention on any gate probe', behaviour.zeroSemanticInventions);

  // ---------------- instrument freeze
  const instrument = JSON.parse(
    readFileSync(join(P253, 'SECTION-253-CONFIRMATION-REFREEZE.json'), 'utf8'));
  const recorded = instrument.instrumentDigest as string;
  const recompute = (() => {
    const copy = { ...instrument };
    delete copy.instrumentDigest;
    return sha(JSON.stringify(copy));
  })();
  add('G15 the frozen instrument digest is the authorized one',
    recorded === AUTHORIZED.instrumentDigest, recorded);
  add('G16 the instrument digest re-derives from its own content',
    recompute === recorded, `${recompute} vs ${recorded}`);
  add('G17 the instrument carries exactly six cases',
    Array.isArray(instrument.cases) && instrument.cases.length === 6
    && instrument.caseCount === 6);
  add('G18 the six observation payloads are byte-identical to the §252 freeze',
    instrument.metadataOnlyDifference.observationPayloadsByteIdentical === true
    && (instrument.metadataOnlyDifference.observationPayloads as any[]).every(p => p.identical));
  add('G19 only metadata-only differences exist from the §252 freeze',
    instrument.substantiveChangesFrom252 === 0
    && (instrument.metadataOnlyDifference.keysOutsideAllowlist as any[]).length === 0
    && instrument.metadataOnlyDifference.substantiveHalfDeepEqualToSection252 === true);
  add('G20 the instrument binds this candidate',
    instrument.executableBinding.candidateIdentityDigest === AUTHORIZED.candidateIdentity
    && instrument.executableBinding.strictSchema === false);
  add('G21 the instrument is unexecuted and awaiting authorization',
    instrument.executed === false && instrument.providerCalls === 0);

  // ---------------- package integrity
  const d253 = packageDigest(P253, 'REPORT-253.sha256');
  const d252 = packageDigest(P252, 'REPORT-252.sha256');
  add('G22 the §253 package verifies and digests to the authorized value',
    d253.drift.length === 0 && d253.digest === AUTHORIZED.package253, d253.digest);
  add('G23 the §252 package verifies and digests to the authorized value',
    d252.drift.length === 0 && d252.digest === AUTHORIZED.package252, d252.digest);

  // ---------------- environment
  add('G24 an API credential is configured', typeof process.env.ANTHROPIC_API_KEY === 'string'
    && (process.env.ANTHROPIC_API_KEY as string).trim() !== '');
  add('G25 the frozen execution policy is first-pass only, six calls, transport-only contingency',
    instrument.spendDesign.calls === 6 && instrument.spendDesign.verifierLeg === false
    && String(instrument.spendDesign.contingency).startsWith('transport-level only'));

  // the six cases, taken from the instrument itself
  const cases = (instrument.sixFrozenObservations.observationDigests as { id: string; sha256: string }[]);
  add('G26 six observation digests are recorded on the instrument', cases.length === 6);

  return { checks, identityDigest: identity.identityDigest, instrument, cases };
}

if (require.main === module) {
  void (async () => {
    if (existsSync(join(BACKEND, '.env'))) {
      for (const line of readFileSync(join(BACKEND, '.env'), 'utf8').split('\n')) {
        const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
      }
    }
    const { checks } = await runPreSpendGate254();
    checks.forEach(c => console.log(`${c.verdict}  ${c.id}${c.detail ? '  [' + c.detail + ']' : ''}`));
    const failed = checks.filter(c => c.verdict === 'FAIL');
    console.log(`\n${checks.length - failed.length}/${checks.length} PASS`);
    if (failed.length > 0) { console.log('STOP BEFORE SPEND.'); process.exitCode = 1; }
  })();
}
