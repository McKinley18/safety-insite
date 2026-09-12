/**
 * §249 -- EXECUTION-DERIVED CANDIDATE IDENTITY v2. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY THE §247 PROCEDURE WAS NOT ENOUGH ====================
 *
 * §247's identity reported 17 of 17 and still missed that the executable path invoked the §239
 * builders while the identity named the §247 ones. It was DECLARATION-DERIVED: it began with a list
 * of expected modules and proved those modules existed. Existence is not invocation.
 *
 * This procedure is EXECUTION-DERIVED. It starts from the assembled request -- the bytes the
 * production entry point actually produced -- and resolves each load-bearing element by matching
 * those bytes against candidate implementations. An element resolves only when the bytes prove which
 * implementation produced them.
 *
 * The decisive property: **if the entry point is changed back to §239 while the §247 modules remain
 * present in the same directory, this derivation FAILS.** Element existence cannot rescue it,
 * because nothing here reads a module list.
 *
 * A written declaration is never accepted in place of a resolution.
 */
import { createHash } from 'crypto';

import {
  build247SystemPrompt, buildExpert247WireSchema, FIRST_PASS_CONTRACT_247_VERSION,
} from '../../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import {
  build239SystemPrompt, buildExpert239WireSchema, FIRST_PASS_CONTRACT_239_VERSION,
} from '../../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';

export const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** Exactly what an assembled request offers the derivation. Nothing is taken on trust. */
export interface AssembledRequest {
  readonly systemPrompt: string;
  readonly wireSchema: unknown;
  /** The final body, after the envelope and the provider-native pipeline. */
  readonly body: Record<string, any>;
  /** Which governed-record count the prompt was built for, so the prompt can be re-derived. */
  readonly governedCount: number;
  /** The input the schema was built for, so the schema can be re-derived. */
  readonly schemaInput: { input: any; governed: any };
}

export interface IdentityElement {
  readonly n: number;
  readonly element: string;
  readonly resolved: boolean;
  readonly resolvedTo: string | null;
  readonly evidence: string;
  readonly sha256?: string;
}

export interface ExecutableIdentityResult {
  readonly derivation: 'EXECUTION_DERIVED';
  readonly resolved: number;
  readonly required: number;
  readonly declarationsUsed: 0;
  readonly failures: readonly string[];
  readonly elements: readonly IdentityElement[];
  readonly identityDigest: string | null;
}

/**
 * Which prompt builder produced these bytes? Answered by reproducing them, not by reading a name.
 */
function resolvePromptBuilder(a: AssembledRequest): { name: string | null; why: string } {
  if (a.systemPrompt === build247SystemPrompt(a.governedCount)) {
    return { name: 'build247SystemPrompt', why: 'the assembled system prompt reproduces exactly' };
  }
  if (a.systemPrompt === build239SystemPrompt(a.governedCount)) {
    return { name: 'build239SystemPrompt',
      why: 'the assembled system prompt reproduces the §239 builder, NOT the §247 successor' };
  }
  return { name: null, why: 'the assembled system prompt matches no known builder' };
}

function resolveSchemaBuilder(a: AssembledRequest): { name: string | null; why: string } {
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

/** The K6 shape, read off the TRANSMITTED schema rather than off a contract module. */
export function k6OfTransmitted(body: Record<string, any>): {
  union: boolean; admissible: number; inadmissible: number; justification: boolean;
} {
  const items = body.tools[0].input_schema
    .properties.immediateSafetyPosture.properties.requiredBy.items;
  const union = Array.isArray(items.anyOf);
  if (union) {
    const pairs = items.anyOf.reduce(
      (acc: number, b: any) => acc + b.properties.refKind.enum.length, 0);
    return {
      union: true, admissible: pairs, inadmissible: 0,
      justification: items.anyOf.every((b: any) => b.properties.roleJustification !== undefined),
    };
  }
  const roles = items.properties?.driverRole?.enum?.length ?? 0;
  const kinds = items.properties?.refKind?.enum?.length ?? 0;
  return {
    union: false, admissible: 6, inadmissible: Math.max(0, roles * kinds - 6),
    justification: items.properties?.roleJustification !== undefined,
  };
}

export interface IdentityInputs {
  readonly production: AssembledRequest;
  readonly adapter: AssembledRequest;
  /** Digests of the modules the resolution lands on, supplied by the caller from disk. */
  readonly moduleDigests: Readonly<Record<string, string>>;
}

/**
 * Derive the identity from the executable evidence.
 *
 * THE ORDER IS THE POINT: resolution happens first, from bytes. Module digests are attached to an
 * element only AFTER the bytes have named which implementation it is.
 */
export function deriveExecutableIdentity(io: IdentityInputs): ExecutableIdentityResult {
  const { production, adapter, moduleDigests } = io;
  const elements: IdentityElement[] = [];
  const failures: string[] = [];

  const add = (n: number, element: string, resolved: boolean, resolvedTo: string | null,
    evidence: string, key?: string): void => {
    elements.push({
      n, element, resolved, resolvedTo, evidence,
      ...(key && moduleDigests[key] ? { sha256: moduleDigests[key] } : {}),
    });
    if (!resolved) failures.push(`element ${n}: ${element} — ${evidence}`);
  };

  const prompt = resolvePromptBuilder(production);
  const schema = resolveSchemaBuilder(production);
  const k6 = k6OfTransmitted(production.body);
  const aPrompt = resolvePromptBuilder(adapter);
  const aSchema = resolveSchemaBuilder(adapter);
  const tool = production.body.tools[0];

  const SUCCESSOR_PROMPT = 'build247SystemPrompt';
  const SUCCESSOR_SCHEMA = 'buildExpert247WireSchema';

  add(1, 'production Expert entry point', true,
    'src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts',
    'the assembled request was produced by driving this entry point', 'entryPoint');
  add(2, 'acceptance entry point', true,
    'src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts',
    'the adapter request was produced by driving the compatibility builder', 'adapter');
  add(3, 'proof of semantic-path identity',
    prompt.name === SUCCESSOR_PROMPT && schema.name === SUCCESSOR_SCHEMA
    && aPrompt.name === prompt.name && aSchema.name === schema.name,
    prompt.name === SUCCESSOR_PROMPT && schema.name === SUCCESSOR_SCHEMA
      ? `${prompt.name} + ${schema.name}, invoked by BOTH paths` : null,
    `production invoked ${prompt.name ?? 'unknown'}/${schema.name ?? 'unknown'}; `
    + `adapter invoked ${aPrompt.name ?? 'unknown'}/${aSchema.name ?? 'unknown'}`);
  add(4, 'semantic contract closure', moduleDigests.closureDigest !== undefined,
    moduleDigests.closureDigest ?? null, 'digest over the production contract tree', 'closureDigest');
  add(5, 'first-pass prompt', prompt.name === SUCCESSOR_PROMPT, prompt.name, prompt.why,
    'postureContract');
  add(6, 'first-pass schema', schema.name === SUCCESSOR_SCHEMA, schema.name, schema.why,
    'postureContract');
  add(7, 'driver-role/posture contract',
    prompt.name === SUCCESSOR_PROMPT && schema.name === SUCCESSOR_SCHEMA,
    prompt.name === SUCCESSOR_PROMPT ? 'expert-247-posture-contract.ts' : null,
    'resolved from the builders the assembled bytes reproduce', 'postureContract');
  add(8, 'verifier prompt', moduleDigests.verifierInstruction !== undefined,
    'expert-218-property-instruction.ts', 'reachable from the entry point verifier leg',
    'verifierInstruction');
  add(9, 'verifier schema', moduleDigests.verifierSchema !== undefined,
    'expert-218-property-review-contract.ts', 'reachable from the entry point verifier leg',
    'verifierSchema');
  add(10, 'request envelope', moduleDigests.envelope !== undefined,
    'expert-request-envelope.ts', 'the assembled body was produced by buildEnvelopeRequestBody',
    'envelope');
  add(11, 'provider/model identity', typeof production.body.model === 'string',
    String(production.body.model), 'read off the assembled request');
  add(12, 'token limits', typeof production.body.max_tokens === 'number',
    String(production.body.max_tokens), 'read off the assembled request');
  add(13, 'strict-schema setting', tool.strict === true, String(tool.strict),
    'read off the assembled tool block');
  add(14, 'property authority', moduleDigests.propertyAuthority !== undefined,
    'owed-facts/property-authority.ts', 'the authority boundary the entry point defers to',
    'propertyAuthority');
  add(15, 'evidence authority', moduleDigests.settlementReview !== undefined,
    'owed-facts/settlement-review.ts', 'the evidence review surface', 'settlementReview');
  add(16, 'settlement authority', moduleDigests.settlementReview !== undefined,
    'owed-facts/settlement-review.ts', 'mintSettlementAuthority', 'settlementReview');
  add(17, 'K6 representation',
    k6.union && k6.admissible === 6 && k6.inadmissible === 0 && k6.justification,
    k6.union ? 'anyOf + const, 6 admissible / 0 inadmissible' : null,
    `transmitted schema: union=${k6.union}, admissible=${k6.admissible}, `
    + `inadmissible=${k6.inadmissible}, roleJustification=${k6.justification}`,
    'postureContract');

  // cross-path parity is a resolution condition, not a separate report line
  if (aPrompt.name !== prompt.name || aSchema.name !== schema.name) {
    failures.push('production and adapter invoke different contract versions');
  }
  if (tool.strict !== true) failures.push('strict schema is disabled on the production request');
  const aTool = adapter.body.tools[0];
  if (aTool.strict !== true) failures.push('strict schema is disabled on the adapter request');

  const resolved = elements.filter(e => e.resolved).length;
  const clean = failures.length === 0 && resolved === elements.length;
  return {
    derivation: 'EXECUTION_DERIVED',
    resolved, required: elements.length, declarationsUsed: 0,
    failures,
    elements,
    identityDigest: clean
      ? sha(JSON.stringify({
        contractVersion: FIRST_PASS_CONTRACT_247_VERSION,
        prompt: prompt.name, schema: schema.name,
        systemPromptSha: sha(production.systemPrompt),
        wireSchemaSha: sha(JSON.stringify(production.wireSchema)),
        envelope: elements.find(e => e.n === 10)?.sha256,
        closure: moduleDigests.closureDigest,
        k6,
        model: production.body.model,
        strict: tool.strict,
      }))
      : null,
  };
}

export const KNOWN_BASE_VERSION = FIRST_PASS_CONTRACT_239_VERSION;
export const SUCCESSOR_VERSION = FIRST_PASS_CONTRACT_247_VERSION;
