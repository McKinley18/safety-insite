/**
 * §253 -- EXECUTION-DERIVED CANDIDATE IDENTITY v2.3. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * An additive successor to the §252 v2.2 derivation. `expert-252-candidate-identity.ts` is NOT
 * edited: the §252 package pins the identity document that library produced, and rewriting the
 * library would make that document unreproducible from the tree.
 *
 * v2.3 adds one element to v2.2's twenty-three -- the finalized `alongsideControlConsidered`
 * semantics -- and moves the schema successor from §247 to §253. Everything else is carried over by
 * construction: `deriveCandidateIdentity252` is CALLED, its elements are taken as given, and this
 * module appends rather than restates.
 *
 * The strict setting is still bound AS A VALUE, so a flip in either direction still changes the
 * candidate.
 */
import { createHash } from 'crypto';

import {
  buildExpert253WireSchema, FIRST_PASS_CONTRACT_253_VERSION, contractIdentities253,
  buildBasisEntryUnion253, reconstruct247BasisEntryUnion, NULL_SENTENCE_REPLACED_FROM_247,
  FIELDS_MADE_NON_NULLABLE_253,
} from '../../src/safescope-v2/expert-hazlenz/contract/expert-253-posture-contract';
import {
  buildBasisEntryUnion247, CESSATION_ROLE_247, DRIVER_ROLE_FIELD_247, ROLE_JUSTIFICATION_FIELD,
} from '../../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import {
  deriveCandidateIdentity252, type AssembledRequest252, type BehaviouralProof252,
  type IdentityElement252,
} from './expert-252-candidate-identity';

export const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * The finalized field semantics, READ OFF THE EXECUTING ARTIFACTS rather than declared. Every field
 * here is derived from the union the schema builder actually produces and from the projection source
 * that actually runs.
 */
export interface AlongsideControlBinding253 {
  readonly cessationFieldsNonNullable: boolean;
  readonly transmittedDescriptionInvitesNull: boolean;
  readonly projectionRefusesNull: boolean;
  readonly reducesToSection247ByteForByte: boolean;
  readonly fieldsMadeNonNullable: readonly string[];
}

export function readAlongsideControlBinding253(
  projectionSource: string,
): AlongsideControlBinding253 {
  const u253 = buildBasisEntryUnion253() as Record<string, any>;
  const j = (u253.anyOf as Record<string, any>[])
    .find(b => b.properties[DRIVER_ROLE_FIELD_247].const === CESSATION_ROLE_247)!
    .properties[ROLE_JUSTIFICATION_FIELD];
  return {
    cessationFieldsNonNullable:
      FIELDS_MADE_NON_NULLABLE_253.every(f => j.properties[f].type === 'string'),
    transmittedDescriptionInvitesNull:
      String(j.properties.alongsideControlConsidered.description)
        .includes(NULL_SENTENCE_REPLACED_FROM_247),
    projectionRefusesNull:
      /if \(!nonEmpty\(jr\.alongsideControlConsidered\)/.test(projectionSource)
      && /CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT/.test(projectionSource),
    reducesToSection247ByteForByte:
      JSON.stringify(reconstruct247BasisEntryUnion(u253))
        === JSON.stringify(buildBasisEntryUnion247()),
    fieldsMadeNonNullable: [...FIELDS_MADE_NON_NULLABLE_253],
  };
}

export interface CandidateIdentity253 {
  readonly version: 'v2.3';
  readonly derivation: 'EXECUTION_DERIVED';
  readonly resolved: number;
  readonly required: number;
  readonly declarationsUsed: 0;
  readonly boundStrictSchema: boolean;
  readonly boundContractVersion: typeof FIRST_PASS_CONTRACT_253_VERSION;
  readonly failures: readonly string[];
  readonly elements: readonly IdentityElement252[];
  readonly identityDigest: string | null;
}

export interface IdentityInputs253 {
  readonly production: AssembledRequest252;
  readonly adapter: AssembledRequest252;
  readonly moduleDigests: Readonly<Record<string, string>>;
  readonly behaviour: BehaviouralProof252;
  readonly envelopeStrictSchema: boolean;
  readonly candidateStrictSchema: boolean;
  readonly alongsideControl: AlongsideControlBinding253;
}

/**
 * Three of §252's twenty-three elements resolve the SCHEMA builder and expect the §247 one: element
 * 3 (semantic-path identity across both paths), element 6 (the schema itself) and element 7 (the
 * driver-role/posture contract). The head moved to §253, so all three are RE-RESOLVED here against
 * the successor rather than left reporting a stale name.
 *
 * The re-resolution is explicit and it is not a relaxation. Each still requires the assembled bytes
 * to reproduce a named builder, and each still requires production and adapter to agree, so a silent
 * downgrade to §247 -- which continues to admit `alongsideControlConsidered: null` -- fails.
 */
export function deriveCandidateIdentity253(io: IdentityInputs253): CandidateIdentity253 {
  const base = deriveCandidateIdentity252(io);
  const reproduces = (r: AssembledRequest252): boolean =>
    JSON.stringify(r.wireSchema)
      === JSON.stringify(buildExpert253WireSchema(r.schemaInput.input, r.schemaInput.governed));
  const isSuccessor = reproduces(io.production);
  const adapterIsSuccessor = reproduces(io.adapter);
  const bothPaths = isSuccessor && adapterIsSuccessor;
  const promptOk = base.elements.find(e => e.n === 5)?.resolved === true;

  const RESOLVED_BY_253 = new Set([3, 6, 7]);
  const elements: IdentityElement252[] = base.elements.map(e => {
    if (!RESOLVED_BY_253.has(e.n)) return e;
    const d = io.moduleDigests.postureContract253
      ? { sha256: io.moduleDigests.postureContract253 } : {};
    if (e.n === 3) {
      return { n: 3, element: 'semantic-path identity across both paths',
        resolved: promptOk && bothPaths,
        resolvedTo: promptOk && bothPaths ? 'build247SystemPrompt + buildExpert253WireSchema' : null,
        evidence: `prompt resolved=${promptOk}; production reproduces the §253 schema=`
          + `${isSuccessor}; adapter reproduces the §253 schema=${adapterIsSuccessor}`, ...d };
    }
    if (e.n === 6) {
      return { n: 6, element: 'non-strict provider schema', resolved: isSuccessor,
        resolvedTo: isSuccessor ? 'buildExpert253WireSchema' : e.resolvedTo,
        evidence: isSuccessor
          ? 'the assembled wire schema reproduces buildExpert253WireSchema exactly'
          : 'the assembled wire schema does NOT reproduce the §253 successor', ...d };
    }
    return { n: 7, element: 'driver-role / posture contract', resolved: promptOk && isSuccessor,
      resolvedTo: promptOk && isSuccessor
        ? 'expert-247-posture-contract.ts + expert-253-posture-contract.ts' : null,
      evidence: 'resolved from the builders the assembled bytes reproduce; §253 changes the '
        + 'justification wire representation and inherits every role, carrier and vocabulary '
        + 'from §247', ...d };
  });

  const a = io.alongsideControl;
  const alongsideResolved = a.cessationFieldsNonNullable
    && !a.transmittedDescriptionInvitesNull
    && a.projectionRefusesNull
    && a.reducesToSection247ByteForByte;
  elements.push({
    n: 24,
    element: 'finalized alongsideControlConsidered semantics',
    resolved: alongsideResolved,
    resolvedTo: alongsideResolved ? FIRST_PASS_CONTRACT_253_VERSION : null,
    evidence: `cessation fields non-nullable=${a.cessationFieldsNonNullable}; transmitted `
      + `description invites null=${a.transmittedDescriptionInvitesNull}; projection refuses `
      + `null=${a.projectionRefusesNull}; reduces to §247 byte for byte=`
      + `${a.reducesToSection247ByteForByte}`,
    ...(io.moduleDigests.postureContract253
      ? { sha256: io.moduleDigests.postureContract253 } : {}),
  });

  const failures = [...base.failures.filter(f =>
    !/^element (3|6|7):/.test(f) && !f.startsWith('production and adapter invoke different'))];
  if (!isSuccessor) failures.push('element 6: the executable path does not invoke the §253 schema');
  if (!adapterIsSuccessor) failures.push('the adapter path does not invoke the §253 schema');
  if (!alongsideResolved) {
    failures.push('element 24: the finalized alongsideControlConsidered semantics do not hold');
  }

  const resolved = elements.filter(e => e.resolved).length;
  const clean = failures.length === 0 && resolved === elements.length;
  return {
    version: 'v2.3',
    derivation: 'EXECUTION_DERIVED',
    resolved, required: elements.length, declarationsUsed: 0,
    boundStrictSchema: io.candidateStrictSchema,
    boundContractVersion: FIRST_PASS_CONTRACT_253_VERSION,
    failures, elements,
    identityDigest: clean
      ? sha(JSON.stringify({
        v22: base.identityDigest,
        contractVersion: FIRST_PASS_CONTRACT_253_VERSION,
        contractIdentities253: contractIdentities253(),
        schema: 'buildExpert253WireSchema',
        wireSchemaSha: sha(JSON.stringify(io.production.wireSchema)),
        postureContract253: io.moduleDigests.postureContract253,
        alongsideControl: a,
        strict: io.candidateStrictSchema,
      }))
      : null,
  };
}
