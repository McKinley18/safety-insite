/**
 * §239 -- CONTRACT CONSISTENCY AFTER BROADENING. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.
 *
 * The §235 bidirectional obligation carries forward, inherited through §237, and gains the two
 * directions a WIDENING breaks rather than the two a removal breaks:
 *
 *   C1  every deterministic refusal code has a registry entry;
 *   C2  every registry entry cites text verbatim present in what the model receives;
 *   C3  every provider-visible RULE line is cited by exactly one registry entry;
 *   C4  the schema, the declared inventory, the TypeScript interface and the fields the projection
 *       reads agree field for field, for the posture object AND for the basis entry;
 *   C5  no registry entry names a code that does not exist;
 *   C6  the posture and driver-role field names are the transmitted names;
 *   C7  NOTHING §237 ENFORCED HAS SILENTLY LAPSED. Every §237 code is still enforced and still
 *       registered, and every §237 rule except the one deliberately replaced is still transmitted
 *       byte-identically;
 *   C8  THE BROADENING IS TRANSMITTED IN BOTH DIRECTIONS. Every reference kind the validator will
 *       admit for a role is stated to the provider, and every kind the instruction offers is
 *       admitted by the validator. This is the direction B1 failed: enforcement was narrower than
 *       the representation the contract's own vocabulary invited;
 *   C9  THE STATE CONDITION IS TRANSMITTED, AND ITS VOCABULARY IS THE GOVERNED ONE. The two states
 *       that may carry a controlling role on a candidate are named in the prompt and in the schema,
 *       they are members of EXPERT_CONDITION_STATES, and they agree with L3_UNDECIDED_STATES one
 *       layer down rather than being a second opinion about which states are unresolved.
 */

import { createHash } from 'crypto';

import {
  EXPERT_CONDITION_STATES, EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { L3_UNDECIDED_STATES } from '../../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { governedBindingFor } from './expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from './expert-233-posture-contract';
import { POSTURE_REFUSAL_CODES_233 } from './expert-233-posture-projection';
import type { RuleRegistryEntry235 } from './expert-235-contract-consistency';
import {
  DRIVER_ROLE_FIELD, PROVIDER_VISIBLE_RULES_237,
} from './expert-237-posture-contract';
import { POSTURE_REFUSAL_CODES_237 } from './expert-237-posture-projection';
import { RULE_REGISTRY_237_BASE } from './expert-237-contract-consistency';
import {
  POSTURE_SUBFIELDS_239, BASIS_ENTRY_SUBFIELDS_239, PROVIDER_VISIBLE_RULES_239,
  RULES_RETAINED_FROM_237, RULE_REPLACED_FROM_237, REPLACEMENT_BINDING_RULE_239,
  CANDIDATE_STATE_RULE_239, DRIVER_ROLE_REF_KINDS_239, CANDIDATE_STATE_REQUIREMENT_239,
  UNRESOLVED_CANDIDATE_STATES_239, SETTLED_CANDIDATE_STATES_239, POSTURE_DRIVER_ROLES_239,
  RESIDUAL_NARROWNESS_239, SCHEMA_SENTENCE_239,
  build239SystemPrompt, buildExpert239WireSchema, build239PostureSchemaProperty,
  type ImmediateSafetyPostureObject239, type PostureDriver239,
} from './expert-239-posture-contract';
import { POSTURE_REFUSAL_CODES_239, CODES_ADDED_BY_239 } from './expert-239-posture-projection';

export const CONSISTENCY_239_VERSION = 'hazlenz.expert.239.contract-consistency.v1' as const;

/** Compile-time exhaustiveness for both objects §239 describes. Neither gained a field. */
const POSTURE_FIELD_WITNESS_239: Record<keyof ImmediateSafetyPostureObject239, true> = {
  posture: true, requiredBy: true, acceptedWithoutImmediateAction: true,
  requiredControls: true, resumeCondition: true, whatHappensNow: true,
};
const BASIS_FIELD_WITNESS_239: Record<keyof PostureDriver239, true> = {
  ref: true, refKind: true, driverRole: true,
};
export const TYPE_DECLARED_POSTURE_SUBFIELDS_239: readonly string[] =
  Object.keys(POSTURE_FIELD_WITNESS_239);
export const TYPE_DECLARED_BASIS_SUBFIELDS_239: readonly string[] =
  Object.keys(BASIS_FIELD_WITNESS_239);

export const FIELDS_READ_BY_PROJECTION_239: readonly string[] = [
  'posture',                        // §233 P1, P4, P5, P6 and §239 D3, D4, P8
  'requiredBy',                     // §233 P2, P3 and §239 D1, D2, D2S, D3, D4
  'acceptedWithoutImmediateAction', // §233 P2, P3
  'requiredControls',               // §233 P6
  'resumeCondition',                // §233 P2, P4 and §239 P8
  'whatHappensNow',                 // §233 P1 filler check
];
export const BASIS_FIELDS_READ_BY_PROJECTION_239: readonly string[] =
  ['ref', 'refKind', DRIVER_ROLE_FIELD];

/**
 * The one analysis field OUTSIDE the posture object that §239 reads, and the reason it is listed
 * separately rather than added to the posture inventory: it is not part of the posture object, it
 * is the model's own label on a candidate the posture refers to.
 */
export const ANALYSIS_FIELDS_READ_BY_PROJECTION_239: readonly {
  readonly path: string; readonly kind: string; readonly whyRead: string;
}[] = [
  { path: 'expertHazardCandidates[].candidateKey', kind: 'string',
    whyRead: 'resolves a basis reference of kind HAZARD_CANDIDATE to the candidate it names' },
  { path: 'expertHazardCandidates[].assertedConditionState', kind: 'governed enum',
    whyRead: 'D2S compares the model\'s candidate-state label with the model\'s driver-role label. '
      + 'Two labels the model authored, compared with each other. No prose is read.' },
];

// ================================================================ the registry

const R = (e: RuleRegistryEntry235): RuleRegistryEntry235 => e;

/**
 * Inherited entries whose PROVIDER-VISIBLE EVIDENCE had to move because §239 widened the rule
 * around them. The code is unchanged; only the citation is restated, as §237 restated
 * POSTURE_BASIS_ITEM_MALFORMED when it added driverRole to the basis entry.
 */
export const INHERITED_CITATION_OVERRIDES_239:
Readonly<Record<string, Partial<RuleRegistryEntry235>>> = {
  DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND: {
    rule: 'candidate roles only on candidates; the response role only on declarations; the '
      + 'controlling role on either',
    promptText: REPLACEMENT_BINDING_RULE_239,
    schemaText: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP may be used only on an unresolved-fact '
      + 'declaration.',
  },
};

export const RULES_INHERITED_239: readonly RuleRegistryEntry235[] =
  RULE_REGISTRY_237_BASE.map(e => ({ ...e, ...(INHERITED_CITATION_OVERRIDES_239[e.code] ?? {}) }));

export const RULE_REGISTRY_239_BASE: readonly RuleRegistryEntry235[] = [
  ...RULES_INHERITED_239,
  R({ code: 'UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE', source: '235', visibleIn: 'BOTH',
    rule: 'a candidate carrying the controlling role must itself be in a governed unresolved state',
    promptText: CANDIDATE_STATE_RULE_239,
    schemaText: 'on a hazard candidate whose own assertedConditionState is INSUFFICIENT_EVIDENCE '
      + 'or UNKNOWN' }),
];

export const RULE_REGISTRY_239 = RULE_REGISTRY_239_BASE;

// ================================================================ the check

export interface ConsistencyCheck239 {
  readonly id: string; readonly rule: string;
  readonly passed: boolean; readonly detail: readonly string[];
}

export function representativeTransmission239(): { prompt: string; schema: string } {
  const input: ExpertAnalysisInput = {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'ANL-239-CONSISTENCY',
    authoritativeSources: [{
      sourceId: 'OBS-239-CONSISTENCY', sourceType: 'observation',
      text: 'A representative observation used only to build the transmitted schema.',
    }],
    inspectionContext: { location: 'representative', task: 'representative' },
    jurisdiction: 'US', allowedHazardFamilies: ['machinery'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
  return {
    prompt: build239SystemPrompt(0),
    schema: JSON.stringify(buildExpert239WireSchema(input, governedBindingFor([]))),
  };
}

export interface ConsistencyOverrides239 {
  readonly registry?: readonly RuleRegistryEntry235[];
  readonly providerVisibleRules?: readonly string[];
  readonly refKinds?: Readonly<Record<string, readonly string[]>>;
}

export function runContractConsistency239(overrides: ConsistencyOverrides239 = {}): {
  checks: readonly ConsistencyCheck239[]; passed: number; total: number; allPassed: boolean;
} {
  const registry = overrides.registry ?? RULE_REGISTRY_239_BASE;
  const rules = overrides.providerVisibleRules ?? PROVIDER_VISIBLE_RULES_239;
  const refKinds = overrides.refKinds ?? DRIVER_ROLE_REF_KINDS_239;
  const checks: ConsistencyCheck239[] = [];
  const add = (id: string, rule: string, detail: string[]): void => {
    checks.push({ id, rule, passed: detail.length === 0, detail });
  };
  const { prompt, schema } = representativeTransmission239();
  const allCodes = [...POSTURE_REFUSAL_CODES_233, ...POSTURE_REFUSAL_CODES_239] as string[];
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
    const prop = build239PostureSchemaProperty() as Record<string, any>;
    const eq = (a: string[], b: string[]): boolean =>
      JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
    const schemaProps = Object.keys(prop.properties as Record<string, unknown>);
    const schemaRequired = prop.required as string[];
    if (!eq(schemaProps, [...POSTURE_SUBFIELDS_239])) d.push('posture schema properties != inventory');
    if (!eq(schemaRequired, [...POSTURE_SUBFIELDS_239])) d.push('posture schema required != inventory');
    if (!eq([...TYPE_DECLARED_POSTURE_SUBFIELDS_239], [...POSTURE_SUBFIELDS_239])) {
      d.push('posture interface != inventory');
    }
    if (!eq([...FIELDS_READ_BY_PROJECTION_239], [...POSTURE_SUBFIELDS_239])) {
      d.push('posture fields read != inventory');
    }
    const items = prop.properties.requiredBy.items as Record<string, any>;
    const basisProps = Object.keys(items.properties as Record<string, unknown>);
    if (!eq(basisProps, [...BASIS_ENTRY_SUBFIELDS_239])) d.push('basis schema properties != inventory');
    if (!eq(items.required as string[], [...BASIS_ENTRY_SUBFIELDS_239])) {
      d.push('basis schema required != inventory');
    }
    if (!eq([...TYPE_DECLARED_BASIS_SUBFIELDS_239], [...BASIS_ENTRY_SUBFIELDS_239])) {
      d.push('basis interface != inventory');
    }
    if (!eq([...BASIS_FIELDS_READ_BY_PROJECTION_239], [...BASIS_ENTRY_SUBFIELDS_239])) {
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

  // C7. A WIDENING MUST NOT DROP ANYTHING. Everything §237 enforced is still enforced.
  add('C7', 'every §237 refusal code is still enforced and registered, and every §237 rule except '
    + 'the one deliberately replaced is still transmitted byte-identically', (() => {
    const d: string[] = [];
    for (const c of POSTURE_REFUSAL_CODES_237) {
      if (!allCodes.includes(c)) d.push(`§237 code ${c} is no longer enforced`);
      if (!registered.has(c)) d.push(`§237 code ${c} is no longer registered`);
    }
    for (const r of RULES_RETAINED_FROM_237) {
      if (!rules.includes(r)) d.push(`a §237 rule is no longer transmitted: "${r.slice(0, 60)}"`);
      if (!prompt.includes(r)) d.push(`a §237 rule is not in the prompt: "${r.slice(0, 60)}"`);
    }
    if (RULES_RETAINED_FROM_237.length + 1 !== PROVIDER_VISIBLE_RULES_237.length) {
      d.push('the retained and replaced §237 rules do not partition the §237 rule set');
    }
    if (rules.includes(RULE_REPLACED_FROM_237) || prompt.includes(RULE_REPLACED_FROM_237)) {
      d.push('the replaced §237 binding rule is still transmitted alongside its replacement');
    }
    if (rules.length !== PROVIDER_VISIBLE_RULES_237.length + 1) {
      d.push(`the §239 rule set is ${rules.length} rules, expected one more than §237`);
    }
    return d;
  })());

  // C8. THE DIRECTION B1 FAILED. Enforcement and instruction must agree about WHERE a role may go.
  add('C8', 'every reference kind the validator admits for a role is stated to the provider, and '
    + 'every kind the instruction offers is admitted by the validator', (() => {
    const d: string[] = [];
    for (const role of POSTURE_DRIVER_ROLES_239) {
      const kinds = refKinds[role] ?? [];
      if (kinds.length === 0) d.push(`${role} is admitted on no reference kind at all`);
      if (!prompt.includes(role)) d.push(`${role} is enforced and never named in the prompt`);
      if (!schema.includes(role)) d.push(`${role} is enforced and never named in the schema`);
      const saysCandidate = kinds.includes('HAZARD_CANDIDATE');
      const saysDeclaration = kinds.includes('UNRESOLVED_DECLARATION');
      if (saysCandidate && saysDeclaration) {
        // the broadened role. The instruction must offer BOTH carriers explicitly.
        if (!prompt.includes('as an unresolved-fact declaration, carrying')) {
          d.push(`${role} admits a declaration and the instruction does not offer one`);
        }
        if (!prompt.includes('as a hazard candidate you have marked INSUFFICIENT_EVIDENCE or '
          + 'UNKNOWN, carrying the same')) {
          d.push(`${role} admits an undecided candidate and the instruction does not offer one`);
        }
        if (!schema.includes(SCHEMA_SENTENCE_239)) {
          d.push(`${role} admits both carriers and the schema does not say so`);
        }
      }
    }
    // THE REVERSE DIRECTION, and the one B1 failed: a carrier the instruction OFFERS must be
    // admitted by the validator. An instruction that invites a representation enforcement refuses
    // is exactly the defect §239 exists to repair, and it must be impossible to reintroduce.
    const controlling = 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION';
    const offersCandidateCarrier = prompt.includes('as a hazard candidate you have marked '
      + 'INSUFFICIENT_EVIDENCE or UNKNOWN, carrying the same');
    const offersDeclarationCarrier = prompt.includes('as an unresolved-fact declaration, carrying');
    if (offersCandidateCarrier && !(refKinds[controlling] ?? []).includes('HAZARD_CANDIDATE')) {
      d.push('the instruction offers an undecided candidate as a controlling carrier and the '
        + 'validator refuses one');
    }
    if (offersDeclarationCarrier && !(refKinds[controlling] ?? []).includes('UNRESOLVED_DECLARATION')) {
      d.push('the instruction offers a declaration as a controlling carrier and the validator '
        + 'refuses one');
    }
    // and the narrowness that remains is DECLARED rather than silent, which is the B1 lesson.
    if (RESIDUAL_NARROWNESS_239.stillBoundTo.length !== 1
      || (refKinds[RESIDUAL_NARROWNESS_239.role] ?? []).length !== 1) {
      d.push('the declared residual narrowness and the binding disagree');
    }
    return d;
  })());

  // C9. The state condition, and the vocabulary it uses.
  add('C9', 'the candidate states that may carry a controlling role are transmitted, are governed '
    + 'members, and agree with the vocabulary one layer down', (() => {
    const d: string[] = [];
    for (const s of UNRESOLVED_CANDIDATE_STATES_239) {
      if (!EXPERT_CONDITION_STATES.includes(s)) d.push(`${s} is not a governed candidate state`);
      if (!prompt.includes(s)) d.push(`${s} may carry the role and is not named in the prompt`);
      if (!schema.includes(s)) d.push(`${s} may carry the role and is not named in the schema`);
    }
    for (const s of SETTLED_CANDIDATE_STATES_239) {
      if (!prompt.includes(s)) d.push(`${s} is refused for the role and is not named in the prompt`);
    }
    const eq = (a: readonly string[], b: readonly string[]): boolean =>
      JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
    if (!eq(UNRESOLVED_CANDIDATE_STATES_239, L3_UNDECIDED_STATES)) {
      d.push('§239 and L3_UNDECIDED_STATES disagree about which states are unresolved');
    }
    if (UNRESOLVED_CANDIDATE_STATES_239.length + SETTLED_CANDIDATE_STATES_239.length
      !== EXPERT_CONDITION_STATES.length) {
      d.push('the unresolved and settled sets do not partition the governed vocabulary');
    }
    const roles = Object.keys(CANDIDATE_STATE_REQUIREMENT_239);
    if (roles.length !== 1 || roles[0] !== 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION') {
      d.push('the state condition applies to a set of roles §239 did not declare');
    }
    if (CODES_ADDED_BY_239.length !== 1) d.push('§239 added more than the one declared code');
    return d;
  })());

  const passed = checks.filter(c => c.passed).length;
  return { checks, passed, total: checks.length, allPassed: passed === checks.length };
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function consistencyIdentity239(): Record<string, unknown> {
  const { prompt, schema } = representativeTransmission239();
  return {
    version: CONSISTENCY_239_VERSION,
    registeredCodes: RULE_REGISTRY_239_BASE.length,
    inheritedFrom237: RULES_INHERITED_239.length,
    retiredFrom237: 0,
    inheritedCitationsRestated: Object.keys(INHERITED_CITATION_OVERRIDES_239),
    providerVisibleRules: PROVIDER_VISIBLE_RULES_239.length,
    rulesRetainedFrom237: RULES_RETAINED_FROM_237.length,
    rulesReplacedFrom237: 1,
    rulesAdded: 1,
    postureSubfields: POSTURE_SUBFIELDS_239,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_239,
    analysisFieldsRead: ANALYSIS_FIELDS_READ_BY_PROJECTION_239.map(f => f.path),
    registryDigest: sha(JSON.stringify(RULE_REGISTRY_239_BASE)),
    transmittedPromptDigest: sha(prompt),
    transmittedSchemaDigest: sha(schema),
  };
}
