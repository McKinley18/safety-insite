/**
 * §239 -- UNRESOLVED DRIVER BINDING CLOSURE. AN ADDITIVE SUCCESSOR TO §237, BUILT BY CONSTRUCTION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233, §235, §237 and the §238 evidence are NOT edited. Their digests stay exactly as the frozen
 * §237 and §238 packages record them, so both remain reproducible from the tree. §239 builds its
 * prompt, its schema and its rule set from §237 and can reduce all three back to §237 byte for
 * byte, and through §237 back to §233.
 *
 * ==================== WHAT §238 DEMONSTRATED, AND WHAT IT DID NOT ====================
 *
 * §238 ran six fresh hosted cases through the §237 contract. The targeted semantic distinction was
 * made correctly on all six: six of six expected posture identities, zero unsafe under-conservative
 * decisions, zero over-conservative decisions, zero response uncertainties incorrectly elevated and
 * zero false cessation drivers. THE COHORT STILL FAILED, because three of the six analyses were
 * INADMISSIBLE and the §238 pass rule is conjunctive. A correct posture inside an output the
 * contract refuses is a failure, and §238 is preserved as FAILED.
 *
 * The three refusals are NOT the same defect and §239 does not treat them as one:
 *
 *   B1  CONTRACT-BINDING DEFECT.        Repaired here.
 *   B2  CORRECT FAIL-CLOSED REFUSAL.    Preserved here, and given its own code.
 *   C1  CORRECT FAIL-CLOSED REFUSAL.    Preserved here, untouched.
 *
 * ==================== B1, AND WHY THE §237 BINDING WAS TOO NARROW ====================
 *
 * §237 bound each driver role to exactly ONE reference kind, and bound both UNRESOLVED roles to
 * declarations alone. The reasoning was that an unresolved fact is by definition not an established
 * condition, so it cannot be a candidate. That reasoning is RIGHT ABOUT WHAT A CANDIDATE ASSERTS
 * and WRONG ABOUT WHAT THE GOVERNED CANDIDATE VOCABULARY CONTAINS.
 *
 * `EXPERT_CONDITION_STATES` carries `INSUFFICIENT_EVIDENCE` and `UNKNOWN`. Those two members exist
 * precisely so an analysis can name a condition it could not place. A candidate in one of those
 * states IS an unresolved property, written in the vocabulary the contract gave the model for
 * writing one. §238 B1 did exactly that -- it declared the unexplained reserve-bank pressure loss
 * AND marked the candidate INSUFFICIENT_EVIDENCE AND attached the controlling role to both -- and
 * the contract refused a coherent statement it had no member for.
 *
 * ==================== THE SMALLEST CORRECTION THAT ADMITS IT ====================
 *
 * ONE role gains ONE additional reference kind, under ONE state condition:
 *
 *     UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION
 *       may bind to an UNRESOLVED_DECLARATION                                  (as in §237), or
 *       to a HAZARD_CANDIDATE whose own assertedConditionState is a member of
 *       UNRESOLVED_CANDIDATE_STATES_239.
 *
 * Nothing else moves. The three ESTABLISHED roles stay candidate-only. UNRESOLVED_RESPONSE_OR_
 * FOLLOW_UP stays declaration-only, which is a DELIBERATE NARROWNESS recorded in
 * `RESIDUAL_NARROWNESS_239` rather than an oversight: the §239 authorization broadens the
 * continuation-controlling driver and nothing else, and no evidence of the response-role shape
 * exists.
 *
 * ==================== AND WHY B2 STILL REFUSES ====================
 *
 * The state condition is what separates B1 from B2. §238 B2 attached the same role to a candidate
 * it had itself marked ACTIVE -- established, present, obtaining. A condition the analysis has
 * SETTLED cannot simultaneously be the unresolved property that decides whether work continues, and
 * the two labels are both the model's own. §239 refuses that, under its own code so the two shapes
 * are never again counted as one defect. It does not reinterpret ACTIVE as UNKNOWN, does not repair
 * the state, and does not manufacture a declaration on the model's behalf.
 */

import { createHash } from 'crypto';

import {
  EXPERT_CONDITION_STATES, type ExpertAnalysisInput, type ExpertConditionState,
} from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import {
  POSTURE_FIELD, POSTURE_REF_KINDS_233, FIRST_PASS_CONTRACT_233_VERSION,
  type PostureRefKind233,
} from './expert-233-posture-contract';
import {
  DRIVER_ROLE_FIELD, POSTURE_DRIVER_ROLES_237, DRIVER_ROLE_DEFINITIONS_237,
  DRIVER_ROLE_REF_KIND_237, DECISION_CONTROLLING_ROLES_237, CESSATION_ROLE_237,
  PROVIDER_VISIBLE_RULES_237, DRIVER_BLOCK_LINES_237, DRIVER_ROLE_SCHEMA_PROPERTY_237,
  POSTURE_SUBFIELDS_237, BASIS_ENTRY_SUBFIELDS_237, FIRST_PASS_CONTRACT_237_VERSION,
  build237SystemPrompt, build237PostureSchemaProperty, buildExpert237WireSchema,
  type PostureDriverRole237, type PostureDriver237, type ImmediateSafetyPostureObject237,
} from './expert-237-posture-contract';

export const FIRST_PASS_CONTRACT_239_VERSION =
  'hazlenz.expert.first-pass-contract.239-unresolved-driver-binding-closure' as const;

export const BASE_CONTRACT_VERSIONS_239 = {
  posture: FIRST_PASS_CONTRACT_233_VERSION,
  driverRoles: FIRST_PASS_CONTRACT_237_VERSION,
} as const;

/** §239 adds no role, no reference kind, no posture and no field. It re-exports what it inherits. */
export const POSTURE_DRIVER_ROLES_239 = POSTURE_DRIVER_ROLES_237;
export const DRIVER_ROLE_DEFINITIONS_239 = DRIVER_ROLE_DEFINITIONS_237;
export const DECISION_CONTROLLING_ROLES_239 = DECISION_CONTROLLING_ROLES_237;
export const CESSATION_ROLE_239 = CESSATION_ROLE_237;
export const POSTURE_SUBFIELDS_239 = POSTURE_SUBFIELDS_237;
export const BASIS_ENTRY_SUBFIELDS_239 = BASIS_ENTRY_SUBFIELDS_237;
export type PostureDriverRole239 = PostureDriverRole237;
export type PostureDriver239 = PostureDriver237;
export type ImmediateSafetyPostureObject239 = ImmediateSafetyPostureObject237;

// ================================================================ the governed unresolved states

/**
 * THE GOVERNED MEMBERS THAT SAY THE CONDITION WAS NOT PLACED. Not a synonym, not a new member and
 * not a reading of prose: a FILTER over the governed candidate-state enum the model already
 * receives. If §210J ever renames or drops one of them the filter returns the wrong count and the
 * guard below refuses to load, rather than silently admitting or silently refusing.
 *
 * `L3_UNDECIDED_STATES` states the same division one layer down. §239 does not import it into the
 * contract -- two layers holding one list is the duplication §237 removed -- but the consistency
 * check asserts the two agree, so the agreement is a checked fact rather than a coincidence.
 */
export const UNRESOLVED_CANDIDATE_STATES_239: readonly ExpertConditionState[] =
  EXPERT_CONDITION_STATES.filter(s => s === 'INSUFFICIENT_EVIDENCE' || s === 'UNKNOWN');

export const SETTLED_CANDIDATE_STATES_239: readonly ExpertConditionState[] =
  EXPERT_CONDITION_STATES.filter(s => !UNRESOLVED_CANDIDATE_STATES_239.includes(s));

if (UNRESOLVED_CANDIDATE_STATES_239.length !== 2 || SETTLED_CANDIDATE_STATES_239.length !== 6) {
  throw new Error(
    'FIRST_PASS_239_ABORT: the governed candidate-state vocabulary drifted. §239 selects the '
    + 'unresolved members from EXPERT_CONDITION_STATES by construction and expects exactly two of '
    + `eight; it found ${UNRESOLVED_CANDIDATE_STATES_239.length} of `
    + `${EXPERT_CONDITION_STATES.length}.`);
}

// ================================================================ the binding, broadened

/**
 * WHICH REFERENCE KINDS EACH ROLE MAY BE USED ON. A set per role rather than §237's single kind.
 * Pure lookup; nothing is inferred. The §237 kind is the FIRST member of every set, which is what
 * makes this a WIDENING rather than a rewrite, and `assertWidensSection237Binding` checks it.
 */
export const DRIVER_ROLE_REF_KINDS_239:
Readonly<Record<PostureDriverRole239, readonly PostureRefKind233[]>> = {
  ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION: ['HAZARD_CANDIDATE'],
  ESTABLISHED_CONDITION_REQUIRING_CONTROLS: ['HAZARD_CANDIDATE'],
  ESTABLISHED_CONDITION_REQUIRING_CESSATION: ['HAZARD_CANDIDATE'],
  UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: ['UNRESOLVED_DECLARATION', 'HAZARD_CANDIDATE'],
  UNRESOLVED_RESPONSE_OR_FOLLOW_UP: ['UNRESOLVED_DECLARATION'],
};

/**
 * WHERE A ROLE IS USED ON A CANDIDATE, WHICH CANDIDATE STATES MAY CARRY IT. A role absent from this
 * map places no state condition; that is every role §239 did not broaden, and it is why the three
 * ESTABLISHED roles behave exactly as §237 left them.
 *
 * THIS IS THE B1 / B2 SEPARATOR and the whole of the safety content of the slice.
 */
export const CANDIDATE_STATE_REQUIREMENT_239:
Readonly<Partial<Record<PostureDriverRole239, readonly ExpertConditionState[]>>> = {
  UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: UNRESOLVED_CANDIDATE_STATES_239,
};

/** Exactly what §239 broadened, as data, so the report cannot overstate it. */
export const BINDINGS_BROADENED_239: readonly {
  readonly role: PostureDriverRole239;
  readonly refKindAddedToTheBinding: PostureRefKind233;
  readonly onlyWhenCandidateStateIsIn: readonly ExpertConditionState[];
  readonly why: string;
}[] = [
  {
    role: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    refKindAddedToTheBinding: 'HAZARD_CANDIDATE',
    onlyWhenCandidateStateIsIn: UNRESOLVED_CANDIDATE_STATES_239,
    why: 'the governed candidate vocabulary contains two members that ARE an unresolved property. '
      + 'A candidate in one of them is the representation the contract itself offers for a '
      + 'condition the analysis could not place, and §237 had no member for it.',
  },
];

/**
 * WHAT §239 DELIBERATELY DID NOT BROADEN. Carried as data and reported, because an undisclosed
 * narrowness is how B1 happened in the first place.
 */
export const RESIDUAL_NARROWNESS_239 = {
  role: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
  stillBoundTo: ['UNRESOLVED_DECLARATION'],
  whyNotBroadened:
    'the §239 authorization broadens the CONTINUATION-CONTROLLING driver and names the two sources '
    + 'it may bind to. It does not extend the allowance to the response role, and no evidence of a '
    + 'model attaching the response role to an undecided candidate exists in §234, §236 or §238. '
    + 'Broadening it would be a speculative change to a safety contract on no evidence.',
  whatWouldHappenIfAModelWroteIt:
    'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND, and the analysis is refused. The model retains two '
    + 'admissible ways to say the same thing: declare the follow-up question as an unresolved-fact '
    + 'declaration, or place the undecided candidate in acceptedWithoutImmediateAction, which §233 '
    + 'P3 permits because only ACTIVE candidates must appear in requiredBy.',
  disposition: 'DISCLOSED, NOT REPAIRED. It is a shape for the fresh final acceptance to observe.',
} as const;

/** A widening never narrows. Asserted at load and again in the suite. */
export function assertWidensSection237Binding(): void {
  for (const role of POSTURE_DRIVER_ROLES_239) {
    const kinds = DRIVER_ROLE_REF_KINDS_239[role];
    if (kinds.length === 0) throw new Error(`FIRST_PASS_239_ABORT: ${role} binds to nothing`);
    if (kinds[0] !== DRIVER_ROLE_REF_KIND_237[role]) {
      throw new Error(`FIRST_PASS_239_ABORT: ${role} no longer leads with its §237 kind`);
    }
    for (const k of kinds) {
      if (!POSTURE_REF_KINDS_233.includes(k)) {
        throw new Error(`FIRST_PASS_239_ABORT: ${role} binds to a kind §233 does not define`);
      }
    }
    if (new Set(kinds).size !== kinds.length) {
      throw new Error(`FIRST_PASS_239_ABORT: ${role} lists a kind twice`);
    }
  }
  const widened = POSTURE_DRIVER_ROLES_239.filter(r => DRIVER_ROLE_REF_KINDS_239[r].length > 1);
  if (widened.length !== BINDINGS_BROADENED_239.length
    || widened.some((r, i) => r !== BINDINGS_BROADENED_239[i].role)) {
    throw new Error('FIRST_PASS_239_ABORT: the broadened set and the binding disagree');
  }
  for (const role of Object.keys(CANDIDATE_STATE_REQUIREMENT_239) as PostureDriverRole239[]) {
    if (!DRIVER_ROLE_REF_KINDS_239[role].includes('HAZARD_CANDIDATE')) {
      throw new Error(`FIRST_PASS_239_ABORT: ${role} carries a candidate-state condition and may `
        + 'not be used on a candidate at all');
    }
  }
}
assertWidensSection237Binding();

// ================================================================ provider-visible rules

/** The §237 rule the broadening replaces, held as data so retention can be checked around it. */
export const RULE_REPLACED_FROM_237 = PROVIDER_VISIBLE_RULES_237[9];

export const REPLACEMENT_BINDING_RULE_239 =
  'RULE. A driverRole beginning ESTABLISHED_CONDITION may be used only on a hazard candidate. '
  + 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP may be used only on an unresolved-fact declaration. '
  + 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION may be used on an unresolved-fact declaration, or '
  + 'on a hazard candidate whose assertedConditionState is INSUFFICIENT_EVIDENCE or UNKNOWN.';

export const CANDIDATE_STATE_RULE_239 =
  'RULE. A hazard candidate carrying UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION must itself be in '
  + 'assertedConditionState INSUFFICIENT_EVIDENCE or UNKNOWN. A candidate you have called ACTIVE, '
  + 'CONTROLLED, CORRECTED, REMOVED_FROM_SERVICE, NEGATED or HYPOTHETICAL is a condition you have '
  + 'placed, and it cannot also be the unresolved property that decides whether the work may go on. '
  + 'Where the two labels disagree the analysis is refused rather than reinterpreted.';

export const RULES_RETAINED_FROM_237: readonly string[] =
  PROVIDER_VISIBLE_RULES_237.filter(r => r !== RULE_REPLACED_FROM_237);

export const PROVIDER_VISIBLE_RULES_239: readonly string[] = [
  ...PROVIDER_VISIBLE_RULES_237.slice(0, 9),
  REPLACEMENT_BINDING_RULE_239,
  ...PROVIDER_VISIBLE_RULES_237.slice(10),
  CANDIDATE_STATE_RULE_239,
];

// ================================================================ the instruction block

/**
 * The paragraph that makes the broadened binding VISIBLE TO THE PROVIDER, inserted immediately
 * before the rules. The §235 bidirectional invariant is the reason it exists: if enforcement admits
 * the representation, the instruction must say so, and if the instruction permits it, the validator
 * must understand it.
 */
export const UNRESOLVED_CARRIER_LINES_239: readonly string[] = [
  '  WHERE AN UNRESOLVED CONTROLLING PROPERTY MAY BE WRITTEN.',
  '',
  '    An unresolved fact that decides whether the work may go on can be written in either of two',
  '    places, and both are admissible:',
  '',
  '      as an unresolved-fact declaration, carrying',
  '      UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION; or',
  '',
  '      as a hazard candidate you have marked INSUFFICIENT_EVIDENCE or UNKNOWN, carrying the same',
  '      role. Those two states are how this contract lets you name a condition you could not',
  '      place, so a candidate in one of them is an unresolved property.',
  '',
  '    Writing it in both places is fine where both are true.',
  '',
  '    WHAT IS NOT ADMISSIBLE IS CONTRADICTING YOURSELF. A candidate you marked ACTIVE, CONTROLLED,',
  '    CORRECTED, REMOVED_FROM_SERVICE, NEGATED or HYPOTHETICAL is a condition you have placed. It',
  '    may be a reason for any posture, under an ESTABLISHED_CONDITION role. It cannot also be the',
  '    unresolved property that decides whether work continues. If the property really is open,',
  '    either mark the candidate INSUFFICIENT_EVIDENCE or UNKNOWN, or declare it.',
  '',
];

const RULES_HEADING_237 = '  THE RULES THIS ANALYSIS IS CHECKED AGAINST. Each is refused deterministically.';

function rulesTail(rules: readonly string[]): string[] {
  return [RULES_HEADING_237, '', ...rules.map(r => `  ${r}`), ''];
}

function splitAtRulesHeading(lines: readonly string[]): { head: string[]; tail: string[] } {
  const hits = lines.reduce<number[]>((a, l, i) => (l === RULES_HEADING_237 ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_239_ABORT: the rules heading appears ${hits.length} times in the §237 driver `
      + 'block, expected 1. This successor is built by construction from §237 and refuses to load '
      + 'against a drifted base.');
  }
  return { head: [...lines.slice(0, hits[0])], tail: [...lines.slice(hits[0])] };
}

export function build239DriverBlock(): string[] {
  const { head, tail } = splitAtRulesHeading(DRIVER_BLOCK_LINES_237);
  if (JSON.stringify(tail) !== JSON.stringify(rulesTail(PROVIDER_VISIBLE_RULES_237))) {
    throw new Error('FIRST_PASS_239_ABORT: the §237 rules tail is not the rules rendered from the '
      + '§237 rule set; the base drifted');
  }
  return [...head, ...UNRESOLVED_CARRIER_LINES_239, ...rulesTail(PROVIDER_VISIBLE_RULES_239)];
}

export const DRIVER_BLOCK_LINES_239: readonly string[] = build239DriverBlock();

/** Remove the addition again. Asserted to reproduce the §237 block exactly. */
export function reconstruct237DriverBlock(lines: readonly string[]): string[] {
  const { head } = splitAtRulesHeading(lines);
  const n = UNRESOLVED_CARRIER_LINES_239.length;
  const at = head.length - n;
  if (at < 0
    || JSON.stringify(head.slice(at)) !== JSON.stringify([...UNRESOLVED_CARRIER_LINES_239])) {
    throw new Error('FIRST_PASS_239: the carrier paragraph does not sit immediately before the '
      + 'rules; cannot reconstruct');
  }
  return [...head.slice(0, at), ...rulesTail(PROVIDER_VISIBLE_RULES_237)];
}

// ================================================================ the system prompt

export function build239SystemPrompt(governedSourceIdCount: number): string {
  const base = build237SystemPrompt(governedSourceIdCount);
  const b237 = DRIVER_BLOCK_LINES_237.join('\n');
  const hits = base.split(b237).length - 1;
  if (hits !== 1) {
    throw new Error(`FIRST_PASS_239_ABORT: the §237 driver block appears ${hits} times in the §237 `
      + 'system prompt, expected 1');
  }
  return base.replace(b237, DRIVER_BLOCK_LINES_239.join('\n'));
}

/** Remove the addition again. Asserted to reproduce the §237 prompt byte for byte. */
export function reconstruct237SystemPrompt(prompt: string): string {
  const b239 = DRIVER_BLOCK_LINES_239.join('\n');
  const idx = prompt.indexOf(b239);
  if (idx === -1) {
    throw new Error('FIRST_PASS_239: the §239 driver block is not present; cannot reconstruct');
  }
  return prompt.slice(0, idx) + DRIVER_BLOCK_LINES_237.join('\n')
    + prompt.slice(idx + b239.length);
}

// ================================================================ the wire schema

/** The one §237 sentence the broadening makes untrue, and what replaces it. */
export const SCHEMA_SENTENCE_REPLACED_FROM_237 =
  'A role beginning ESTABLISHED_CONDITION may be used only on a hazard candidate and a role '
  + 'beginning UNRESOLVED only on an unresolved-fact declaration.';

export const SCHEMA_SENTENCE_239 =
  'A role beginning ESTABLISHED_CONDITION may be used only on a hazard candidate. '
  + 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP may be used only on an unresolved-fact declaration. '
  + 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION may be used on an unresolved-fact declaration, or '
  + 'on a hazard candidate whose own assertedConditionState is INSUFFICIENT_EVIDENCE or UNKNOWN; on '
  + 'a candidate in any other state the analysis is refused rather than reinterpreted.';

export const DRIVER_ROLE_SCHEMA_PROPERTY_239 = (() => {
  const p = JSON.parse(JSON.stringify(DRIVER_ROLE_SCHEMA_PROPERTY_237)) as Record<string, any>;
  const d = p.description as string;
  if (d.split(SCHEMA_SENTENCE_REPLACED_FROM_237).length - 1 !== 1) {
    throw new Error('FIRST_PASS_239_ABORT: the §237 driverRole description does not carry the '
      + 'binding sentence exactly once; the base drifted');
  }
  p.description = d.replace(SCHEMA_SENTENCE_REPLACED_FROM_237, SCHEMA_SENTENCE_239);
  return p;
})();

export function build239PostureSchemaProperty(): Record<string, unknown> {
  const p = build237PostureSchemaProperty() as Record<string, any>;
  const items = p.properties.requiredBy.items as Record<string, any>;
  if (items.properties[DRIVER_ROLE_FIELD] === undefined) {
    throw new Error(`FIRST_PASS_239_ABORT: §237 carries no ${DRIVER_ROLE_FIELD}; the base drifted`);
  }
  items.properties[DRIVER_ROLE_FIELD] = JSON.parse(JSON.stringify(DRIVER_ROLE_SCHEMA_PROPERTY_239));
  return p;
}

/** Remove the addition again. Asserted to reproduce the §237 posture property exactly. */
export function reconstruct237PostureSchemaProperty(
  v239: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v239)) as Record<string, any>;
  const items = p.properties.requiredBy.items as Record<string, any>;
  const node = items.properties[DRIVER_ROLE_FIELD] as Record<string, any>;
  const d = node.description as string;
  if (!d.includes(SCHEMA_SENTENCE_239)) {
    throw new Error('FIRST_PASS_239: the §239 sentence is absent; cannot reconstruct');
  }
  node.description = d.replace(SCHEMA_SENTENCE_239, SCHEMA_SENTENCE_REPLACED_FROM_237);
  return p;
}

export function buildExpert239WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert237WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_239_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build239PostureSchemaProperty();
  return base;
}

export function reconstruct237WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert239WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct237PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities239(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_239,
    driverRoleField: DRIVER_ROLE_FIELD,
    postureSubfields: POSTURE_SUBFIELDS_239,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_239,
    driverRoles: sha(JSON.stringify(POSTURE_DRIVER_ROLES_239)),
    driverRoleDefinitions: sha(JSON.stringify(DRIVER_ROLE_DEFINITIONS_239)),
    driverRoleRefKinds: sha(JSON.stringify(DRIVER_ROLE_REF_KINDS_239)),
    candidateStateRequirement: sha(JSON.stringify(CANDIDATE_STATE_REQUIREMENT_239)),
    unresolvedCandidateStates: [...UNRESOLVED_CANDIDATE_STATES_239],
    settledCandidateStates: [...SETTLED_CANDIDATE_STATES_239],
    bindingsBroadened: BINDINGS_BROADENED_239.length,
    rolesAdded: 0, refKindsAdded: 0, posturesAdded: 0, postureSubfieldsAdded: 0,
    basisEntrySubfieldsAdded: 0,
    rulesRetainedFrom237: RULES_RETAINED_FROM_237.length,
    rulesReplacedFrom237: 1,
    rulesAdded: 1,
    providerVisibleRules: sha(JSON.stringify(PROVIDER_VISIBLE_RULES_239)),
    driverBlockLines: sha(DRIVER_BLOCK_LINES_239.join('\n')),
    postureSchemaProperty: sha(JSON.stringify(build239PostureSchemaProperty())),
    systemPromptNoGoverned: sha(build239SystemPrompt(0)),
    systemPromptGoverned: sha(build239SystemPrompt(2)),
    residualNarrowness: RESIDUAL_NARROWNESS_239.role,
  };
}
