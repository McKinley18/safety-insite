/**
 * §237 -- CONTRACT CONSISTENCY AFTER SIMPLIFICATION. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.
 *
 * The §235 obligation carries forward unchanged and gains a third direction, because §237 REMOVES
 * things and removal is where alignment usually breaks:
 *
 *   C1  every deterministic refusal code has a registry entry;
 *   C2  every registry entry cites text verbatim present in what the model receives;
 *   C3  every provider-visible RULE line is cited by exactly one registry entry;
 *   C4  the schema, the declared inventory, the TypeScript interface and the fields the projection
 *       reads agree field for field, for the posture object AND for the basis entry;
 *   C5  no registry entry names a code that does not exist;
 *   C6  the posture and driver-role field names are the transmitted names;
 *   C7  NOTHING RETIRED SURVIVES. No §235 cessation code is enforced, no removed §235 rule is
 *       transmitted, and the string `establishedConditionsRequiringCessation` appears nowhere in
 *       the §237 prompt or schema;
 *   C8  RETENTION IS BYTE-EXACT. Each of the eight §235 rules §237 keeps is identical to the §235
 *       original, so "retained verbatim" is a checked fact rather than a claim.
 */

import { createHash } from 'crypto';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from './expert-233-posture-contract';
import { POSTURE_REFUSAL_CODES_233 } from './expert-233-posture-projection';
import { PROVIDER_VISIBLE_RULES_235 } from './expert-235-posture-contract';
import {
  RULE_REGISTRY_235_BASE, type RuleRegistryEntry235,
} from './expert-235-contract-consistency';
import {
  DRIVER_ROLE_FIELD, POSTURE_SUBFIELDS_237, BASIS_ENTRY_SUBFIELDS_237,
  PROVIDER_VISIBLE_RULES_237, RULES_RETAINED_FROM_235, RULES_REMOVED_FROM_235,
  build237SystemPrompt, buildExpert237WireSchema, build237PostureSchemaProperty,
  type ImmediateSafetyPostureObject237, type PostureDriver237,
} from './expert-237-posture-contract';
import { POSTURE_REFUSAL_CODES_237, CODES_RETIRED_FROM_235 }
  from './expert-237-posture-projection';

export const CONSISTENCY_237_VERSION = 'hazlenz.expert.237.contract-consistency.v1' as const;

/** Compile-time exhaustiveness for both objects §237 describes. */
const POSTURE_FIELD_WITNESS_237: Record<keyof ImmediateSafetyPostureObject237, true> = {
  posture: true, requiredBy: true, acceptedWithoutImmediateAction: true,
  requiredControls: true, resumeCondition: true, whatHappensNow: true,
};
const BASIS_FIELD_WITNESS_237: Record<keyof PostureDriver237, true> = {
  ref: true, refKind: true, driverRole: true,
};
export const TYPE_DECLARED_POSTURE_SUBFIELDS_237: readonly string[] =
  Object.keys(POSTURE_FIELD_WITNESS_237);
export const TYPE_DECLARED_BASIS_SUBFIELDS_237: readonly string[] =
  Object.keys(BASIS_FIELD_WITNESS_237);

export const FIELDS_READ_BY_PROJECTION_237: readonly string[] = [
  'posture',                        // §233 P1, P4, P5, P6 and §237 D3, D4, P8
  'requiredBy',                     // §233 P2, P3 and §237 D1..D4
  'acceptedWithoutImmediateAction', // §233 P2, P3
  'requiredControls',               // §233 P6
  'resumeCondition',                // §233 P2, P4 and §237 P8
  'whatHappensNow',                 // §233 P1 filler check
];
export const BASIS_FIELDS_READ_BY_PROJECTION_237: readonly string[] =
  ['ref', 'refKind', DRIVER_ROLE_FIELD];

// ================================================================ the registry

const R = (e: RuleRegistryEntry235): RuleRegistryEntry235 => e;

/**
 * Inherited entries whose PROVIDER-VISIBLE EVIDENCE had to move because §237 changed the schema
 * around them. The rule and the code are unchanged; only the citation is restated.
 *
 * `POSTURE_BASIS_ITEM_MALFORMED` cited `"required":["ref","refKind"]` under §235. §237 adds
 * driverRole to the basis entry, so that exact string no longer occurs and C2 caught it on the
 * first run. That is the consistency check doing its job on a removal-and-addition slice, and the
 * repair is to cite the refKind enum, which is present in BOTH basis item schemas and is what makes
 * a malformed entry detectable in the first place.
 */
export const INHERITED_CITATION_OVERRIDES_237: Readonly<Record<string, Partial<RuleRegistryEntry235>>> = {
  POSTURE_BASIS_ITEM_MALFORMED: {
    schemaText: '"refKind":{"type":"string","enum":["HAZARD_CANDIDATE","UNRESOLVED_DECLARATION"]}',
  },
};

/** Every §235 entry whose code §237 still enforces, imported rather than retyped. */
export const RULES_INHERITED_237: readonly RuleRegistryEntry235[] =
  RULE_REGISTRY_235_BASE
    .filter(e => !CODES_RETIRED_FROM_235.includes(e.code))
    .map(e => ({ ...e, ...(INHERITED_CITATION_OVERRIDES_237[e.code] ?? {}) }));

export const RULE_REGISTRY_237_BASE: readonly RuleRegistryEntry235[] = [
  ...RULES_INHERITED_237,
  R({ code: 'POSTURE_DRIVER_ROLE_MISSING', source: '235', visibleIn: 'BOTH',
    rule: 'every basis entry carries a driver role',
    promptText: PROVIDER_VISIBLE_RULES_237[8],
    schemaText: '"required":["ref","refKind","driverRole"]' }),
  R({ code: 'POSTURE_DRIVER_ROLE_INVALID', source: '235', visibleIn: 'SCHEMA',
    rule: 'the driver role is a member of the governed vocabulary',
    schemaText: '"driverRole":{"type":"string","enum":[' }),
  R({ code: 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND', source: '235', visibleIn: 'BOTH',
    rule: 'candidate roles only on candidates, declaration roles only on declarations',
    promptText: PROVIDER_VISIBLE_RULES_237[9],
    schemaText: 'A role beginning ESTABLISHED_CONDITION may be used only on a hazard candidate' }),
  R({ code: 'ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE', source: '235', visibleIn: 'BOTH',
    rule: 'a cessation driver forces STOP',
    promptText: PROVIDER_VISIBLE_RULES_237[10],
    schemaText: 'If any entry is ESTABLISHED_CONDITION_REQUIRING_CESSATION the posture must be STOP.' }),
  R({ code: 'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER', source: '235',
    visibleIn: 'BOTH',
    rule: 'a posture that does not permit work needs a driver that decides whether work is '
      + 'acceptable',
    promptText: PROVIDER_VISIBLE_RULES_237[11],
    schemaText: 'Under HOLD_PENDING_VERIFICATION or STOP at least one entry must be ' }),
];

export const RULE_REGISTRY_237 = RULE_REGISTRY_237_BASE;

// ================================================================ the check

export interface ConsistencyCheck237 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

export function representativeTransmission237(): { prompt: string; schema: string } {
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'ANL-237-CONSISTENCY',
    authoritativeSources: [{
      sourceId: 'OBS-237-CONSISTENCY', sourceType: 'observation',
      text: 'A representative observation used only to build the transmitted schema.',
    }],
    inspectionContext: { location: 'representative', task: 'representative' },
    jurisdiction: 'US', allowedHazardFamilies: ['machinery'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
  return {
    prompt: build237SystemPrompt(0),
    schema: JSON.stringify(buildExpert237WireSchema(input, governedBindingFor([]))),
  };
}

export interface ConsistencyOverrides237 {
  readonly registry?: readonly RuleRegistryEntry235[];
  readonly providerVisibleRules?: readonly string[];
}

export function runContractConsistency237(overrides: ConsistencyOverrides237 = {}): {
  checks: readonly ConsistencyCheck237[]; passed: number; total: number; allPassed: boolean;
} {
  const registry = overrides.registry ?? RULE_REGISTRY_237_BASE;
  const rules = overrides.providerVisibleRules ?? PROVIDER_VISIBLE_RULES_237;
  const checks: ConsistencyCheck237[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const { prompt, schema } = representativeTransmission237();
  const allCodes = [...POSTURE_REFUSAL_CODES_233, ...POSTURE_REFUSAL_CODES_237] as string[];
  const registered = new Set(registry.map(e => e.code));

  add('C1', 'every deterministic refusal code has a registry entry',
    allCodes.filter(c => !registered.has(c)).map(c => `${c} is enforced and not registered`));

  add('C2', 'every registered rule is stated verbatim in the transmitted prompt or schema',
    registry.flatMap(e => {
      const d: string[] = [];
      const wantsPrompt = e.visibleIn === 'PROMPT' || e.visibleIn === 'BOTH';
      const wantsSchema = e.visibleIn === 'SCHEMA' || e.visibleIn === 'BOTH';
      if (wantsPrompt) {
        if (e.promptText === undefined) d.push(`${e.code}: PROMPT visibility with no text`);
        else if (!prompt.includes(e.promptText)) d.push(`${e.code}: promptText not in the prompt`);
      }
      if (wantsSchema) {
        if (e.schemaText === undefined) d.push(`${e.code}: SCHEMA visibility with no text`);
        else if (!schema.includes(e.schemaText)) d.push(`${e.code}: schemaText not in the schema`);
      }
      return d;
    }));

  add('C3', 'every provider-visible RULE line is cited by exactly one registry entry',
    rules.flatMap(r => {
      const cited = registry.filter(e => e.promptText === r);
      if (cited.length === 0) return [`a RULE is transmitted with no code: "${r.slice(0, 70)}"`];
      if (cited.length > 1) return [`a RULE maps to ${cited.length} codes: "${r.slice(0, 70)}"`];
      return [];
    }));

  add('C4', 'the schema, the declared inventory, the TypeScript interfaces and the fields the '
    + 'projection reads agree field for field, for the posture and for the basis entry', (() => {
    const d: string[] = [];
    const prop = build237PostureSchemaProperty() as Record<string, any>;
    const eq = (a: string[], b: string[]): boolean =>
      JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
    const schemaProps = Object.keys(prop.properties as Record<string, unknown>);
    const schemaRequired = prop.required as string[];
    if (!eq(schemaProps, [...POSTURE_SUBFIELDS_237])) d.push('posture schema properties != inventory');
    if (!eq(schemaRequired, [...POSTURE_SUBFIELDS_237])) d.push('posture schema required != inventory');
    if (!eq([...TYPE_DECLARED_POSTURE_SUBFIELDS_237], [...POSTURE_SUBFIELDS_237])) {
      d.push('posture interface != inventory');
    }
    if (!eq([...FIELDS_READ_BY_PROJECTION_237], [...POSTURE_SUBFIELDS_237])) {
      d.push('posture fields read != inventory');
    }
    const items = prop.properties.requiredBy.items as Record<string, any>;
    const basisProps = Object.keys(items.properties as Record<string, unknown>);
    if (!eq(basisProps, [...BASIS_ENTRY_SUBFIELDS_237])) d.push('basis schema properties != inventory');
    if (!eq(items.required as string[], [...BASIS_ENTRY_SUBFIELDS_237])) {
      d.push('basis schema required != inventory');
    }
    if (!eq([...TYPE_DECLARED_BASIS_SUBFIELDS_237], [...BASIS_ENTRY_SUBFIELDS_237])) {
      d.push('basis interface != inventory');
    }
    if (!eq([...BASIS_FIELDS_READ_BY_PROJECTION_237], [...BASIS_ENTRY_SUBFIELDS_237])) {
      d.push('basis fields read != inventory');
    }
    return d;
  })());

  add('C5', 'no registry entry names a code the projection does not enforce',
    registry.filter(e => !allCodes.includes(e.code))
      .map(e => `${e.code} is registered and enforced nowhere`));

  add('C6', 'the posture field and the driver-role field are the transmitted names', (() => {
    const d: string[] = [];
    if (!schema.includes(`"${POSTURE_FIELD}"`)) d.push(`${POSTURE_FIELD} absent from the schema`);
    if (!schema.includes(`"${DRIVER_ROLE_FIELD}"`)) d.push(`${DRIVER_ROLE_FIELD} absent`);
    return d;
  })());

  // C7. THE DIRECTION SIMPLIFICATION BREAKS. Nothing retired may survive anywhere.
  add('C7', 'no retired §235 cessation code is enforced, no removed §235 rule is transmitted, and '
    + 'the retired field name appears nowhere', (() => {
    const d: string[] = [];
    for (const c of CODES_RETIRED_FROM_235) {
      if (allCodes.includes(c)) d.push(`retired code ${c} is still enforced`);
      if (registered.has(c)) d.push(`retired code ${c} is still registered`);
    }
    for (const r of RULES_REMOVED_FROM_235) {
      if (prompt.includes(r)) d.push(`removed rule is still transmitted: "${r.slice(0, 60)}"`);
    }
    if (prompt.includes('establishedConditionsRequiringCessation')) {
      d.push('the retired field name appears in the transmitted prompt');
    }
    if (schema.includes('establishedConditionsRequiringCessation')) {
      d.push('the retired field name appears in the transmitted schema');
    }
    return d;
  })());

  // C8. Retention is byte-exact, so "carried forward verbatim" is checked rather than asserted.
  add('C8', 'each rule retained from §235 is byte-identical to the §235 original', (() => {
    const d: string[] = [];
    if (RULES_RETAINED_FROM_235.length + RULES_REMOVED_FROM_235.length
      !== PROVIDER_VISIBLE_RULES_235.length) {
      d.push('the retained and removed sets do not partition the §235 rules');
    }
    for (const r of RULES_RETAINED_FROM_235) {
      if (!PROVIDER_VISIBLE_RULES_235.includes(r)) d.push('a retained rule is not a §235 rule');
      if (!rules.includes(r)) d.push(`a retained rule is not transmitted: "${r.slice(0, 60)}"`);
    }
    for (const r of RULES_REMOVED_FROM_235) {
      if (rules.includes(r)) d.push(`a removed rule is still in the §237 rule set`);
    }
    return d;
  })());

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function consistencyIdentity237(): Record<string, unknown> {
  const { prompt, schema } = representativeTransmission237();
  return {
    version: CONSISTENCY_237_VERSION,
    registeredCodes: RULE_REGISTRY_237_BASE.length,
    inheritedFrom235: RULES_INHERITED_237.length,
    retiredFrom235: CODES_RETIRED_FROM_235.length,
    inheritedCitationsRestated: Object.keys(INHERITED_CITATION_OVERRIDES_237),
    providerVisibleRules: PROVIDER_VISIBLE_RULES_237.length,
    rulesRetainedFrom235: RULES_RETAINED_FROM_235.length,
    rulesRemovedFrom235: RULES_REMOVED_FROM_235.length,
    postureSubfields: POSTURE_SUBFIELDS_237,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_237,
    registryDigest: sha(JSON.stringify(RULE_REGISTRY_237_BASE)),
    transmittedPromptDigest: sha(prompt),
    transmittedSchemaDigest: sha(schema),
  };
}
