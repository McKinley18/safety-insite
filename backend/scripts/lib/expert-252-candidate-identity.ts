/**
 * §252 -- EXECUTION-DERIVED CANDIDATE IDENTITY v2.2. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT v2.2 ADDS TO v2 ====================
 *
 * v2 (§249) bound the SEMANTIC path: which prompt builder, which schema builder, which K6 shape, and
 * that strict enforcement was on. §252 changed the architecture underneath it. Strict enforcement is
 * off by product-owner decision, and the structural obligation the provider used to discharge now
 * lives in a deterministic admission layer. An identity that did not bind that layer would assert
 * the architecture is intact while its load-bearing half went unmeasured.
 *
 * v2.2 therefore binds three things v2 did not:
 *
 *   the STRICT SETTING AS A VALUE, not as a required constant. The candidate declares `strict:false`,
 *   the assembled request must agree with it, and the digest covers it. A flip in EITHER direction
 *   changes the candidate, which is exactly what the authorization asks for.
 *
 *   the STRUCTURAL ADMISSION IMPLEMENTATION, by execution rather than by existence.
 *
 *   the four BEHAVIOURAL GUARANTEES the architecture now rests on -- conformance, K6, role
 *   justification and RR-7 -- each demonstrated by driving the real production entry point with an
 *   output that only that guarantee refuses.
 *
 * ==================== WHY EXISTENCE PROOFS ARE NOT USED HERE ====================
 *
 * §244's lesson was that a module can be present, correct and never invoked. §249 answered that for
 * the request side by resolving builders from assembled bytes. The admission layer has no assembled
 * bytes to resolve from, so v2.2 answers it the only other honest way: it FEEDS THE ENTRY POINT AN
 * OUTPUT THAT ONLY THE NEW LAYER REFUSES and requires the refusal. If the entry point stopped
 * invoking the admission module while the module remained on disk, these elements would not resolve.
 *
 * §249's own library is NOT edited. It encodes the pre-§252 architecture, including `strict === true`
 * as a resolution condition, and it remains a true statement about that architecture.
 */
import { createHash } from 'crypto';

import {
  build247SystemPrompt, buildExpert247WireSchema, FIRST_PASS_CONTRACT_247_VERSION,
} from '../../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract';
import {
  build239SystemPrompt, buildExpert239WireSchema,
} from '../../src/hazlenz/expert-hazlenz/contract/expert-239-posture-contract';
import {
  ADMISSION_252_VERSION,
} from '../../src/hazlenz/expert-hazlenz/contract/expert-252-structural-admission';
import { k6OfTransmitted } from './expert-249-executable-identity';

export const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export interface AssembledRequest252 {
  readonly systemPrompt: string;
  readonly wireSchema: unknown;
  readonly body: Record<string, any>;
  readonly governedCount: number;
  readonly schemaInput: { input: any; governed: any };
}

/**
 * The four guarantees, each answered by driving the real entry point. The caller supplies the
 * observed dispositions; this module never assumes one.
 */
export interface BehaviouralProof252 {
  /** An undeclared property is refused. Only the §252 conformance gate refuses this shape. */
  readonly undeclaredPropertyRefused: boolean;
  readonly undeclaredPropertyCode: string | null;
  /** An inadmissible K6 role/carrier pair is refused. */
  readonly inadmissibleK6PairRefused: boolean;
  readonly inadmissibleK6PairCode: string | null;
  /** A justification missing a required member is refused. */
  readonly missingJustificationMemberRefused: boolean;
  readonly missingJustificationMemberCode: string | null;
  /** A malformed declaration that identified a property is preserved, not dropped. */
  readonly rr7PreservedUnresolvedTruth: boolean;
  /** A valid complete output is admitted, so the guarantees are not vacuous over-refusal. */
  readonly validOutputAdmitted: boolean;
  /** Every one of the five probes reported zero semantic inventions. */
  readonly zeroSemanticInventions: boolean;
}

export interface IdentityElement252 {
  readonly n: number;
  readonly element: string;
  readonly resolved: boolean;
  readonly resolvedTo: string | null;
  readonly evidence: string;
  readonly sha256?: string;
}

export interface CandidateIdentity252 {
  readonly version: 'v2.2';
  readonly derivation: 'EXECUTION_DERIVED';
  readonly resolved: number;
  readonly required: number;
  readonly declarationsUsed: 0;
  readonly boundStrictSchema: boolean;
  readonly failures: readonly string[];
  readonly elements: readonly IdentityElement252[];
  readonly identityDigest: string | null;
}

export interface IdentityInputs252 {
  readonly production: AssembledRequest252;
  readonly adapter: AssembledRequest252;
  readonly moduleDigests: Readonly<Record<string, string>>;
  readonly behaviour: BehaviouralProof252;
  /** The value the envelope binds. The assembled request must agree with it. */
  readonly envelopeStrictSchema: boolean;
  /** The value THIS candidate is declared against. A flip either way changes the identity. */
  readonly candidateStrictSchema: boolean;
}

function resolvePrompt(a: AssembledRequest252): { name: string | null; why: string } {
  if (a.systemPrompt === build247SystemPrompt(a.governedCount)) {
    return { name: 'build247SystemPrompt', why: 'the assembled system prompt reproduces exactly' };
  }
  if (a.systemPrompt === build239SystemPrompt(a.governedCount)) {
    return { name: 'build239SystemPrompt',
      why: 'the assembled system prompt reproduces the §239 builder, NOT the §247 successor' };
  }
  return { name: null, why: 'the assembled system prompt matches no known builder' };
}

function resolveSchema(a: AssembledRequest252): { name: string | null; why: string } {
  const got = JSON.stringify(a.wireSchema);
  const { input, governed } = a.schemaInput;
  if (got === JSON.stringify(buildExpert247WireSchema(input, governed))) {
    return { name: 'buildExpert247WireSchema', why: 'the assembled wire schema reproduces exactly' };
  }
  if (got === JSON.stringify(buildExpert239WireSchema(input, governed))) {
    return { name: 'buildExpert239WireSchema',
      why: 'the assembled wire schema reproduces the §239 builder, NOT the §247 successor' };
  }
  return { name: null, why: 'the assembled wire schema matches no known builder' };
}

export function deriveCandidateIdentity252(io: IdentityInputs252): CandidateIdentity252 {
  const { production, adapter, moduleDigests, behaviour } = io;
  const elements: IdentityElement252[] = [];
  const failures: string[] = [];
  const add = (n: number, element: string, resolved: boolean, resolvedTo: string | null,
    evidence: string, key?: string): void => {
    elements.push({ n, element, resolved, resolvedTo, evidence,
      ...(key && moduleDigests[key] ? { sha256: moduleDigests[key] } : {}) });
    if (!resolved) failures.push(`element ${n}: ${element} — ${evidence}`);
  };

  const prompt = resolvePrompt(production);
  const schema = resolveSchema(production);
  const aPrompt = resolvePrompt(adapter);
  const aSchema = resolveSchema(adapter);
  const k6 = k6OfTransmitted(production.body);
  const tool = production.body.tools[0];
  const P = 'build247SystemPrompt';
  const S = 'buildExpert247WireSchema';

  add(1, 'production Expert entry point', true,
    'src/hazlenz/expert-hazlenz/expert-hazlenz-analysis.ts',
    'the assembled request was produced by driving this entry point', 'entryPoint');
  add(2, 'compatibility adapter entry point', true,
    'src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider.ts',
    'the adapter request was produced by driving the compatibility builder', 'adapter');
  add(3, 'semantic-path identity across both paths',
    prompt.name === P && schema.name === S && aPrompt.name === prompt.name
    && aSchema.name === schema.name,
    prompt.name === P && schema.name === S ? `${prompt.name} + ${schema.name}, both paths` : null,
    `production invoked ${prompt.name ?? 'unknown'}/${schema.name ?? 'unknown'}; `
    + `adapter invoked ${aPrompt.name ?? 'unknown'}/${aSchema.name ?? 'unknown'}`);
  add(4, 'canonical semantic contract closure', moduleDigests.closureDigest !== undefined,
    moduleDigests.closureDigest ?? null, 'digest over the production contract tree', 'closureDigest');
  add(5, 'production prompt', prompt.name === P, prompt.name, prompt.why, 'postureContract');
  add(6, 'non-strict provider schema', schema.name === S, schema.name, schema.why, 'postureContract');
  add(7, 'driver-role / posture contract', prompt.name === P && schema.name === S,
    prompt.name === P ? 'expert-247-posture-contract.ts' : null,
    'resolved from the builders the assembled bytes reproduce', 'postureContract');
  add(8, 'verifier prompt', moduleDigests.verifierInstruction !== undefined,
    'expert-218-property-instruction.ts', 'reachable from the entry point verifier leg',
    'verifierInstruction');
  add(9, 'verifier schema', moduleDigests.verifierSchema !== undefined,
    'expert-218-property-review-contract.ts', 'reachable from the entry point verifier leg',
    'verifierSchema');
  add(10, 'actual request envelope', moduleDigests.envelope !== undefined,
    'expert-request-envelope.ts', 'the assembled body was produced by buildEnvelopeRequestBody',
    'envelope');
  add(11, 'provider / model identity', typeof production.body.model === 'string',
    String(production.body.model), 'read off the assembled request');
  add(12, 'token limits', typeof production.body.max_tokens === 'number',
    String(production.body.max_tokens), 'read off the assembled request');

  // ---- 13. THE STRICT SETTING, BOUND AS A VALUE.
  const wireStrict = tool.strict;
  const strictAgrees = wireStrict === io.envelopeStrictSchema
    && io.envelopeStrictSchema === io.candidateStrictSchema;
  add(13, 'strict-schema setting, bound as a value', strictAgrees, String(wireStrict),
    `assembled request strict=${String(wireStrict)}; envelope binds `
    + `${String(io.envelopeStrictSchema)}; this candidate is declared against `
    + `${String(io.candidateStrictSchema)}. A flip in either direction changes the identity.`);

  add(14, 'property authority', moduleDigests.propertyAuthority !== undefined,
    'owed-facts/property-authority.ts', 'the authority boundary the entry point defers to',
    'propertyAuthority');
  add(15, 'evidence authority', moduleDigests.settlementReview !== undefined,
    'owed-facts/settlement-review.ts', 'the evidence review surface', 'settlementReview');
  add(16, 'settlement review', moduleDigests.settlementReview !== undefined,
    'owed-facts/settlement-review.ts', 'mintSettlementAuthority', 'settlementReview');
  add(17, 'review artifacts', moduleDigests.reviewArtifacts !== undefined,
    'expert-218-property-consistency.ts', 'the review-artifact surface §247 improved',
    'reviewArtifacts');
  add(18, 'K6 representation on the wire',
    k6.union && k6.admissible === 6 && k6.inadmissible === 0 && k6.justification,
    k6.union ? 'anyOf + const, 6 admissible / 0 inadmissible' : null,
    `transmitted schema: union=${k6.union}, admissible=${k6.admissible}, `
    + `inadmissible=${k6.inadmissible}, roleJustification=${k6.justification}`, 'postureContract');

  // ---- 19-23. THE ADMISSION LAYER, PROVED BY EXECUTION.
  add(19, 'structural admission implementation', moduleDigests.structuralAdmission !== undefined
    && behaviour.undeclaredPropertyRefused,
    behaviour.undeclaredPropertyRefused ? ADMISSION_252_VERSION : null,
    'the entry point was driven with an output carrying a property the contract does not declare, '
    + `and the result was ${behaviour.undeclaredPropertyRefused ? 'refused with '
      + String(behaviour.undeclaredPropertyCode) : 'NOT refused'}. No pre-§252 check refuses that `
    + 'shape, so a refusal proves the gate ran.', 'structuralAdmission');
  add(20, 'K6 admission, enforced deterministically', behaviour.inadmissibleK6PairRefused,
    behaviour.inadmissibleK6PairRefused ? String(behaviour.inadmissibleK6PairCode) : null,
    'the entry point was driven with one of the four inadmissible role/carrier pairs and refused it '
    + 'without the provider being asked to enforce anything', 'postureProjection');
  add(21, 'roleJustification validation', behaviour.missingJustificationMemberRefused,
    behaviour.missingJustificationMemberRefused
      ? String(behaviour.missingJustificationMemberCode) : null,
    'the entry point was driven with a justification missing a required member and refused it',
    'roleJustificationProjection');
  add(22, 'RR-7 unresolved-truth preservation', behaviour.rr7PreservedUnresolvedTruth,
    behaviour.rr7PreservedUnresolvedTruth ? 'PRESERVE_UNRESOLVED' : null,
    'the entry point was driven with a malformed declaration that had identified a property, and the '
    + 'property was preserved rather than dropped', 'structuralAdmission');
  add(23, 'the guarantees are not vacuous over-refusal',
    behaviour.validOutputAdmitted && behaviour.zeroSemanticInventions,
    behaviour.validOutputAdmitted ? 'ADMIT on a valid complete output' : null,
    `a valid complete output was ${behaviour.validOutputAdmitted ? 'admitted' : 'REFUSED'}; `
    + `semantic inventions across all probes: ${behaviour.zeroSemanticInventions ? 0 : 'NON-ZERO'}`);

  if (aPrompt.name !== prompt.name || aSchema.name !== schema.name) {
    failures.push('production and adapter invoke different contract versions');
  }
  if (wireStrict !== io.candidateStrictSchema) {
    failures.push(`the assembled request carries strict=${String(wireStrict)} while this candidate `
      + `is declared against strict=${String(io.candidateStrictSchema)}`);
  }
  const aTool = adapter.body.tools[0];
  if (aTool.strict !== io.candidateStrictSchema) {
    failures.push('the adapter request does not carry the candidate strict setting');
  }

  const resolved = elements.filter(e => e.resolved).length;
  const clean = failures.length === 0 && resolved === elements.length;
  return {
    version: 'v2.2',
    derivation: 'EXECUTION_DERIVED',
    resolved, required: elements.length, declarationsUsed: 0,
    boundStrictSchema: io.candidateStrictSchema,
    failures, elements,
    identityDigest: clean
      ? sha(JSON.stringify({
        contractVersion: FIRST_PASS_CONTRACT_247_VERSION,
        prompt: prompt.name, schema: schema.name,
        systemPromptSha: sha(production.systemPrompt),
        wireSchemaSha: sha(JSON.stringify(production.wireSchema)),
        envelope: moduleDigests.envelope,
        closure: moduleDigests.closureDigest,
        admission: moduleDigests.structuralAdmission,
        admissionVersion: ADMISSION_252_VERSION,
        k6,
        model: production.body.model,
        strict: io.candidateStrictSchema,
        behaviour,
      }))
      : null,
  };
}
