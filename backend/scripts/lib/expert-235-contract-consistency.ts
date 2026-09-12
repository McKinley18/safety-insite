/**
 * §235 -- CONTRACT CONSISTENCY. THE TEST THAT MAKES THE §234 ALIGNMENT DEFECT UNREPEATABLE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §234 refused four analyses for breaking rules the transmitted instruction never stated. That was
 * possible because nothing in the repository required the two to agree. This file requires it, in
 * BOTH directions:
 *
 *   C1  every deterministic refusal code has a registry entry;
 *   C2  every registry entry cites text that is VERBATIM PRESENT in what the model receives -- the
 *       system prompt, or the transmitted schema JSON, or both;
 *   C3  every provider-visible RULE line is cited by exactly one registry entry, so a promise made
 *       to the model with no code behind it fails too;
 *   C4  the schema properties, the schema required list, the declared field inventory, the
 *       TypeScript interface and the fields the projection reads agree FIELD FOR FIELD;
 *   C5  no registry entry names a code that does not exist.
 *
 * C3 is the direction that is easy to forget. A requirement stated to the provider and enforced
 * nowhere is the §234 resume-condition finding exactly: the schema told the model to leave the
 * resume lists empty when work may continue, and no code enforced it.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from './expert-233-posture-contract';
import { POSTURE_REFUSAL_CODES_233 } from './expert-233-posture-projection';
import {
  CESSATION_FIELD, POSTURE_SUBFIELDS_235, PROVIDER_VISIBLE_RULES_235,
  build235SystemPrompt, buildExpert235WireSchema, build235PostureSchemaProperty,
  type ImmediateSafetyPostureObject235,
} from './expert-235-posture-contract';
import { POSTURE_REFUSAL_CODES_235 } from './expert-235-posture-projection';

export const CONSISTENCY_235_VERSION = 'hazlenz.expert.235.contract-consistency.v1' as const;

/**
 * COMPILE-TIME EXHAUSTIVENESS. `Record<keyof I, true>` will not compile if a field is added to the
 * interface and not listed here, or listed here and not on the interface. `Object.keys` then makes
 * the same list available at runtime, so the type participates in C4 rather than being trusted.
 */
const TYPE_FIELD_WITNESS_235: Record<keyof ImmediateSafetyPostureObject235, true> = {
  posture: true,
  requiredBy: true,
  acceptedWithoutImmediateAction: true,
  requiredControls: true,
  resumeCondition: true,
  whatHappensNow: true,
  establishedConditionsRequiringCessation: true,
};
export const TYPE_DECLARED_SUBFIELDS_235: readonly string[] = Object.keys(TYPE_FIELD_WITNESS_235);

/**
 * Every posture sub-field the deterministic projection actually reads, §233 and §235 together.
 * Kept by hand and checked against the schema, because a field in the schema that nothing reads is
 * a promise to the model that the product does not keep.
 */
export const FIELDS_READ_BY_PROJECTION_235: readonly string[] = [
  'posture',                                  // §233 P1, P4, P5, P6 and §235 P7, P8
  'requiredBy',                               // §233 P2, P3 and §235 P7
  'acceptedWithoutImmediateAction',           // §233 P2, P3
  'requiredControls',                         // §233 P6
  'resumeCondition',                          // §233 P2, P4 and §235 P8
  'whatHappensNow',                           // §233 P1 filler check
  CESSATION_FIELD,                            // §235 P7
];

// ================================================================ the registry

export type ProviderVisibleIn = 'PROMPT' | 'SCHEMA' | 'BOTH';

export interface RuleRegistryEntry235 {
  readonly code: string;
  readonly source: '233' | '235';
  readonly rule: string;
  readonly visibleIn: ProviderVisibleIn;
  /** Verbatim substring of the transmitted system prompt. */
  readonly promptText?: string;
  /** Verbatim substring of the transmitted schema, serialised. */
  readonly schemaText?: string;
}

const R = (e: RuleRegistryEntry235): RuleRegistryEntry235 => e;

export const RULE_REGISTRY_235_BASE: readonly RuleRegistryEntry235[] = [
  // ---------------------------------------------------------------- §233 P1 presence and shape
  R({ code: 'POSTURE_MISSING', source: '233', visibleIn: 'BOTH',
    rule: 'the posture object is required on every analysis',
    promptText: 'IMMEDIATE SAFETY POSTURE. One per analysis, always, in immediateSafetyPosture.',
    schemaText: '"immediateSafetyPosture"' }),
  R({ code: 'POSTURE_NOT_AN_OBJECT', source: '233', visibleIn: 'SCHEMA',
    rule: 'the posture must be an object',
    schemaText: '"immediateSafetyPosture":{"type":"object"' }),
  R({ code: 'POSTURE_VALUE_INVALID', source: '233', visibleIn: 'PROMPT',
    rule: 'posture must be one of the four vocabulary members',
    promptText: '  posture   one of: CONTINUE | CONTINUE_WITH_CONTROLS | HOLD_PENDING_VERIFICATION | STOP' }),
  R({ code: 'POSTURE_NARRATIVE_MISSING', source: '233', visibleIn: 'PROMPT',
    rule: 'whatHappensNow must be present and non-empty',
    promptText: 'whatHappensNow                   Say it plainly, in your own words.' }),
  R({ code: 'POSTURE_NARRATIVE_PLACEHOLDER', source: '235', visibleIn: 'PROMPT',
    rule: 'whatHappensNow may not be non-semantic filler',
    promptText: PROVIDER_VISIBLE_RULES_235[0] }),
  R({ code: 'POSTURE_BASIS_NOT_AN_ARRAY', source: '233', visibleIn: 'SCHEMA',
    rule: 'the basis lists are arrays', schemaText: '"requiredBy":{"type":"array"' }),
  R({ code: 'POSTURE_BASIS_ITEM_MALFORMED', source: '233', visibleIn: 'SCHEMA',
    rule: 'each basis entry carries ref and refKind',
    schemaText: '"required":["ref","refKind"]' }),
  R({ code: 'POSTURE_CONTROLS_NOT_AN_ARRAY', source: '233', visibleIn: 'SCHEMA',
    rule: 'requiredControls is an array', schemaText: '"requiredControls":{"type":"array"' }),
  R({ code: 'POSTURE_CONTROL_ITEM_MALFORMED', source: '233', visibleIn: 'SCHEMA',
    rule: 'each control carries control and timing',
    schemaText: '"required":["control","timing"]' }),
  R({ code: 'POSTURE_RESUME_CONDITION_MALFORMED', source: '233', visibleIn: 'SCHEMA',
    rule: 'resumeCondition carries both lists',
    schemaText: '"required":["resolvedByDeclarationIds","correctionsRequired"]' }),

  // ---------------------------------------------------------------- §233 P2 referential integrity
  R({ code: 'POSTURE_BASIS_REF_UNRESOLVED', source: '233', visibleIn: 'SCHEMA',
    rule: 'every basis reference resolves inside this analysis',
    schemaText: 'a candidateKey or a declarationId from THIS analysis' }),
  R({ code: 'POSTURE_BASIS_REF_DUPLICATED', source: '235', visibleIn: 'BOTH',
    rule: 'a reference may not appear in both basis lists',
    promptText: PROVIDER_VISIBLE_RULES_235[1],
    schemaText: 'A reference may appear in this list OR in acceptedWithoutImmediateAction, never in both.' }),
  R({ code: 'RESUME_CONDITION_REF_UNRESOLVED', source: '233', visibleIn: 'SCHEMA',
    rule: 'every resume declarationId resolves inside this analysis',
    schemaText: 'declarationIds from THIS analysis whose resolution permits resumption' }),

  // ---------------------------------------------------------------- §233 P3 coverage
  R({ code: 'DECLARATION_NOT_COVERED', source: '235', visibleIn: 'PROMPT',
    rule: 'every declaration is covered by the posture',
    promptText: PROVIDER_VISIBLE_RULES_235[2] }),
  R({ code: 'ACTIVE_CANDIDATE_NOT_COVERED', source: '235', visibleIn: 'PROMPT',
    rule: 'every ACTIVE candidate is covered by the posture',
    promptText: PROVIDER_VISIBLE_RULES_235[3] }),

  // ---------------------------------------------------------------- §233 P4 resume condition
  R({ code: 'RESUME_CONDITION_EMPTY', source: '233', visibleIn: 'PROMPT',
    rule: 'a non-permitting posture names what must become true',
    promptText: 'Required when the posture is HOLD_PENDING_VERIFICATION or' }),

  // ---------------------------------------------------------------- §233 P5 label consistency
  R({ code: 'BLOCKING_CLARIFICATION_WITH_CONTINUE', source: '235', visibleIn: 'PROMPT',
    rule: 'a BLOCKING clarification bound to a declaration forbids CONTINUE',
    promptText: PROVIDER_VISIBLE_RULES_235[4] }),

  // ---------------------------------------------------------------- §233 P6 controls and sequencing
  R({ code: 'CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS', source: '233', visibleIn: 'PROMPT',
    rule: 'CONTINUE_WITH_CONTROLS must name controls',
    promptText: 'Required only when the posture is CONTINUE_WITH_CONTROLS.' }),
  R({ code: 'CONTROLS_PRESENT_UNDER_CONTINUE', source: '235', visibleIn: 'BOTH',
    rule: 'CONTINUE carries no required controls',
    promptText: PROVIDER_VISIBLE_RULES_235[5],
    schemaText: 'Must be empty when the posture is CONTINUE.' }),
  R({ code: 'CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE', source: '235',
    visibleIn: 'BOTH', rule: 'no concurrent control under a posture that permits no work',
    promptText: PROVIDER_VISIBLE_RULES_235[6],
    schemaText: 'no control may carry timing DURING_CONTINUED_WORK' }),

  // ---------------------------------------------------------------- §235 P8 resume coherence
  R({ code: 'RESUME_CONDITION_UNDER_PERMITTING_POSTURE', source: '235', visibleIn: 'BOTH',
    rule: 'a posture that permits work carries no resume condition',
    promptText: PROVIDER_VISIBLE_RULES_235[7],
    schemaText: 'Both lists must be empty when the posture is CONTINUE or CONTINUE_WITH_CONTROLS.' }),

  // ---------------------------------------------------------------- §235 P9 transport integrity
  R({ code: 'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT', source: '235', visibleIn: 'SCHEMA',
    rule: 'every field the transmitted schema declares required must arrive, with the declared '
      + 'type. The root required list IS the statement of this rule.',
    schemaText: '"required":["expertHazardCandidates"' }),

  // ---------------------------------------------------------------- §235 P7 cessation conditions
  R({ code: 'CESSATION_LIST_MISSING', source: '235', visibleIn: 'SCHEMA',
    rule: 'the cessation list is a required member of the posture object',
    schemaText: '"establishedConditionsRequiringCessation"]' }),
  R({ code: 'CESSATION_LIST_NOT_AN_ARRAY', source: '235', visibleIn: 'SCHEMA',
    rule: 'the cessation list is an array',
    schemaText: '"establishedConditionsRequiringCessation":{"type":"array"' }),
  R({ code: 'CESSATION_ITEM_MALFORMED', source: '235', visibleIn: 'SCHEMA',
    rule: 'each cessation entry carries ref and refKind',
    schemaText: 'a candidateKey from THIS analysis' }),
  R({ code: 'CESSATION_REF_UNRESOLVED', source: '235', visibleIn: 'PROMPT',
    rule: 'every cessation reference resolves inside this analysis',
    promptText: PROVIDER_VISIBLE_RULES_235[8] }),
  R({ code: 'CESSATION_REF_NOT_A_CANDIDATE', source: '235', visibleIn: 'BOTH',
    rule: 'only a hazard candidate may be an established cessation condition',
    promptText: PROVIDER_VISIBLE_RULES_235[9],
    schemaText: 'An unresolved-fact declaration is by definition not established.' }),
  R({ code: 'CESSATION_CONDITION_NOT_IN_BASIS', source: '235', visibleIn: 'BOTH',
    rule: 'a cessation condition is also a reason for the posture',
    promptText: PROVIDER_VISIBLE_RULES_235[10],
    schemaText: 'every entry must also appear in requiredBy' }),
  R({ code: 'ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE', source: '235',
    visibleIn: 'BOTH', rule: 'a non-empty cessation list forces STOP',
    promptText: PROVIDER_VISIBLE_RULES_235[11],
    schemaText: 'If this list is not empty the posture must be STOP' }),
];

/** The registry as shipped. `runContractConsistency235` takes an override only for the teeth test. */
export const RULE_REGISTRY_235 = RULE_REGISTRY_235_BASE;

// ================================================================ the check

export interface ConsistencyCheck235 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

/** A representative transmitted payload. Field names and rule text do not vary with the case. */
export function representativeTransmission235(): { prompt: string; schema: string } {
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'ANL-235-CONSISTENCY',
    authoritativeSources: [{
      sourceId: 'OBS-235-CONSISTENCY', sourceType: 'observation',
      text: 'A representative observation used only to build the transmitted schema.',
    }],
    inspectionContext: { location: 'representative', task: 'representative' },
    jurisdiction: 'US',
    allowedHazardFamilies: ['machinery'],
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
  };
  return {
    prompt: build235SystemPrompt(0),
    schema: JSON.stringify(buildExpert235WireSchema(input, governedBindingFor([]))),
  };
}

/**
 * `overrides` exists so the suite can prove this check HAS TEETH: remove a registry entry and C1
 * must fail, transmit a rule with no code and C3 must fail. A consistency check nobody has watched
 * fail is a consistency check nobody has tested.
 */
export interface ConsistencyOverrides235 {
  readonly registry?: readonly RuleRegistryEntry235[];
  readonly providerVisibleRules?: readonly string[];
}

export function runContractConsistency235(overrides: ConsistencyOverrides235 = {}): {
  checks: readonly ConsistencyCheck235[]; passed: number; total: number; allPassed: boolean;
} {
  const RULE_REGISTRY_235 = overrides.registry ?? RULE_REGISTRY_235_BASE;
  const PROVIDER_VISIBLE_RULES = overrides.providerVisibleRules ?? PROVIDER_VISIBLE_RULES_235;
  const checks: ConsistencyCheck235[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const { prompt, schema } = representativeTransmission235();
  const allCodes = [...POSTURE_REFUSAL_CODES_233, ...POSTURE_REFUSAL_CODES_235] as string[];
  const registered = new Set(RULE_REGISTRY_235.map(e => e.code));

  // C1. No deterministic admissibility rule without a registry entry.
  add('C1', 'every deterministic refusal code has a registry entry',
    allCodes.filter(c => !registered.has(c)).map(c => `${c} is enforced and not registered`));

  // C2. Every registry entry cites text the model actually receives.
  add('C2', 'every registered rule is stated verbatim in the transmitted prompt or schema',
    RULE_REGISTRY_235.flatMap(e => {
      const d: string[] = [];
      const wantsPrompt = e.visibleIn === 'PROMPT' || e.visibleIn === 'BOTH';
      const wantsSchema = e.visibleIn === 'SCHEMA' || e.visibleIn === 'BOTH';
      if (wantsPrompt) {
        if (e.promptText === undefined) d.push(`${e.code}: declares PROMPT visibility with no text`);
        else if (!prompt.includes(e.promptText)) {
          d.push(`${e.code}: promptText is not verbatim in the transmitted prompt`);
        }
      }
      if (wantsSchema) {
        if (e.schemaText === undefined) d.push(`${e.code}: declares SCHEMA visibility with no text`);
        else if (!schema.includes(e.schemaText)) {
          d.push(`${e.code}: schemaText is not verbatim in the transmitted schema`);
        }
      }
      return d;
    }));

  // C3. THE OTHER DIRECTION. No provider-visible requirement without a code behind it.
  add('C3', 'every provider-visible RULE line is cited by exactly one registry entry',
    PROVIDER_VISIBLE_RULES.flatMap(r => {
      const cited = RULE_REGISTRY_235.filter(e => e.promptText === r);
      if (cited.length === 0) return [`a RULE is transmitted with no refusal code: "${r.slice(0, 70)}"`];
      if (cited.length > 1) return [`a RULE maps to ${cited.length} codes: "${r.slice(0, 70)}"`];
      return [];
    }));

  // C4. Field for field, across all four descriptions of the same object.
  add('C4', 'schema properties, schema required, declared inventory, TypeScript interface and the '
    + 'fields the projection reads agree field for field', (() => {
    const d: string[] = [];
    const prop = build235PostureSchemaProperty();
    const schemaProps = Object.keys((prop.properties ?? {}) as Record<string, unknown>).sort();
    const schemaRequired = [...(prop.required as string[])].sort();
    const inventory = [...POSTURE_SUBFIELDS_235].sort();
    const declared = [...TYPE_DECLARED_SUBFIELDS_235].sort();
    const read = [...FIELDS_READ_BY_PROJECTION_235].sort();
    const eq = (a: string[], b: string[]): boolean => JSON.stringify(a) === JSON.stringify(b);
    if (!eq(schemaProps, inventory)) d.push(`schema properties ${schemaProps.join(',')} != inventory`);
    if (!eq(schemaRequired, inventory)) d.push(`schema required ${schemaRequired.join(',')} != inventory`);
    if (!eq(declared, inventory)) d.push(`TypeScript interface ${declared.join(',')} != inventory`);
    if (!eq(read, inventory)) d.push(`fields read by the projection ${read.join(',')} != inventory`);
    return d;
  })());

  // C5. No registry entry for a code that does not exist.
  add('C5', 'no registry entry names a code the projection does not enforce',
    RULE_REGISTRY_235.filter(e => !allCodes.includes(e.code))
      .map(e => `${e.code} is registered and enforced nowhere`));

  // C6. The posture field name itself is the one the schema carries.
  add('C6', 'the posture root field and the cessation sub-field are the transmitted names', (() => {
    const d: string[] = [];
    if (!schema.includes(`"${POSTURE_FIELD}"`)) d.push(`${POSTURE_FIELD} absent from the schema`);
    if (!schema.includes(`"${CESSATION_FIELD}"`)) d.push(`${CESSATION_FIELD} absent from the schema`);
    return d;
  })());

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function consistencyIdentity235(): Record<string, unknown> {
  const { prompt, schema } = representativeTransmission235();
  return {
    version: CONSISTENCY_235_VERSION,
    registeredCodes: RULE_REGISTRY_235_BASE.length,
    providerVisibleRules: PROVIDER_VISIBLE_RULES_235.length,
    postureSubfields: POSTURE_SUBFIELDS_235,
    registryDigest: sha(JSON.stringify(RULE_REGISTRY_235_BASE)),
    transmittedPromptDigest: sha(prompt),
    transmittedSchemaDigest: sha(schema),
  };
}
