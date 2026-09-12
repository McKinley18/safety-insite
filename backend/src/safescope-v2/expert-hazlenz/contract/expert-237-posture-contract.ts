/**
 * §237 -- FINAL POSTURE ARCHITECTURE CLOSURE. AN ADDITIVE SUCCESSOR TO §233, BUILT BY CONSTRUCTION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233, §235 and the §236 evidence are NOT edited. Their digests stay exactly as the frozen §236
 * protocol records them, so §236 remains reproducible from the tree. §237 builds its prompt and
 * schema from §233 and can reduce both back to §233 byte for byte.
 *
 * ==================== WHY THIS SUCCEEDS §235 RATHER THAN EXTENDING IT ====================
 *
 * §235 added a SEPARATE required array, `establishedConditionsRequiringCessation`, holding a second
 * list of references to candidates the analysis had already identified. §236 put it to nine hosted
 * calls and every single contract refusal came from that one field: absent on three, malformed on a
 * fourth. Nothing else in the contract refused anything, and every output arrived on a clean wire.
 *
 * The §237 authorization asks whether that state is REDUNDANT, and names the anti-pattern exactly:
 *
 *     MODEL IDENTIFIES FACT -> MODEL COPIES FACT INTO A SECOND FIELD -> VALIDATOR CHECKS THE COPY.
 *
 * Two of §235's three cessation rules were precisely that check. `CESSATION_REF_UNRESOLVED` checked
 * the copy against the candidate list and `CESSATION_CONDITION_NOT_IN_BASIS` checked it against the
 * basis. Only the third carried the safety invariant.
 *
 * ==================== THE ANSWER ON DERIVABILITY, AND THE EVIDENCE FOR IT ====================
 *
 * CAN THE CESSATION-DRIVING SET BE DERIVED DETERMINISTICALLY FROM CANDIDATE STATE ALREADY IN THE
 * ADMITTED ANALYSIS? NO. See `CESSATION_DERIVABILITY_237` below for the full record. In short: the
 * only governed candidate enums are hazardFamily, assertedConditionState, groundingStatus,
 * confidence and relationshipToDeterministic, plus a requiresUserConfirmation boolean. Not one of
 * them expresses CONSEQUENCE. `assertedConditionState` says whether a condition obtains, never what
 * it requires, and ACTIVE-implies-STOP is refuted by spent evidence as well as forbidden by the
 * authorization.
 *
 * ==================== WHAT §237 DOES INSTEAD ====================
 *
 * The judgment is irreducible, so it is kept. THE DUPLICATION IS NOT, so it is removed. The
 * judgment moves onto the reference that already exists:
 *
 *     requiredBy: [{ ref, refKind }]  ->  requiredBy: [{ ref, refKind, driverRole }]
 *
 * One governed member on an entry the model produced correctly on nine of nine §236 calls, and one
 * fewer required array. There is no second copy of any reference, so there is nothing to omit
 * separately, nothing to malform separately, and no copy-consistency rule left to enforce.
 *
 * The same field carries the C2 repair, because the two blockers are the same shape: both ask what
 * ROLE a driver plays in the posture. Two of the five roles answer the cessation question and two
 * answer the response-uncertainty question.
 */

import { createHash } from 'crypto';

import type { ExpertAnalysisInput } from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import {
  POSTURE_FIELD, POSTURE_SCHEMA_PROPERTY_233, POSTURE_BLOCK_LINES_233,
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_REF_KINDS_233,
  build233SystemPrompt, buildExpert233WireSchema, FIRST_PASS_CONTRACT_233_VERSION,
  type ImmediateSafetyPostureObject233, type PostureRef233,
} from './expert-233-posture-contract';
import { PROVIDER_VISIBLE_RULES_235 } from './expert-235-posture-contract';

export const FIRST_PASS_CONTRACT_237_VERSION =
  'hazlenz.expert.first-pass-contract.237-posture-architecture-closure' as const;

export const BASE_CONTRACT_VERSIONS_237 = {
  posture: FIRST_PASS_CONTRACT_233_VERSION,
  rulesInheritedFrom: 'hazlenz.expert.first-pass-contract.235-posture-contract-alignment',
} as const;

export const DRIVER_ROLE_FIELD = 'driverRole' as const;

// ================================================================ the derivability record

/**
 * The §237 authorization requires this answered explicitly, and documented if the answer is no.
 * It is held as data so the suite asserts it and the evidence package carries it verbatim.
 */
export const CESSATION_DERIVABILITY_237 = {
  question: 'Can the authoritative cessation-driving candidate set be derived deterministically '
    + 'from candidate state already present in the admitted analysis?',
  answer: 'NO',

  everyGovernedCandidateProperty: [
    { field: 'candidateKey', kind: 'string', carriesConsequence: false },
    { field: 'hazardFamily', kind: 'enum, per-analysis allowed families', carriesConsequence: false },
    { field: 'assertedConditionState',
      kind: 'enum ACTIVE | CONTROLLED | CORRECTED | REMOVED_FROM_SERVICE | NEGATED | HYPOTHETICAL '
        + '| INSUFFICIENT_EVIDENCE | UNKNOWN',
      carriesConsequence: false,
      why: 'it states WHETHER the condition obtains. It says nothing about what the condition '
        + 'requires of anyone.' },
    { field: 'groundingStatus', kind: 'enum', carriesConsequence: false },
    { field: 'evidence / evidenceBasis / reasoning', kind: 'prose', carriesConsequence: false,
      why: 'prose, and invariant 3 forbids deriving a safety consequence by reading it' },
    { field: 'confidence', kind: 'enum LOW | MODERATE | HIGH', carriesConsequence: false,
      why: 'certainty about the assertion, not the consequence of the condition' },
    { field: 'relationshipToDeterministic', kind: 'enum', carriesConsequence: false },
    { field: 'requiresUserConfirmation', kind: 'boolean', carriesConsequence: false },
  ],

  candidateRulesConsideredAndRejected: [
    { rule: 'assertedConditionState === ACTIVE implies a cessation driver',
      rejected: 'REFUTED BY SPENT EVIDENCE AND FORBIDDEN BY THE AUTHORIZATION. §234 D2 asserts a '
        + 'molten zinc kettle ACTIVE on a case whose correct posture is CONTINUE. §236 A2 runs a '
        + 'poultry line with ACTIVE hazards at CONTINUE_WITH_CONTROLS. The authorization states in '
        + 'as many words: do not infer STOP merely because a hazard is serious, and do not infer '
        + 'STOP merely because a candidate exists.' },
    { rule: 'ACTIVE and present in requiredBy and not accepted implies a cessation driver',
      rejected: 'the §234 CONTINUE_WITH_CONTROLS cases E1, E2, E3 and E4 and the §236 case A2 all '
        + 'carry exactly that shape and all correctly permit work. The rule would force STOP on '
        + 'every one of them.' },
    { rule: 'derive it from requiredControls: a candidate no control addresses requires cessation',
      rejected: 'controls are not linked to candidates in the contract, and the inference is '
        + 'circular: CONTINUE_WITH_CONTROLS means by definition that controls suffice.' },
    { rule: 'derive it from the declaration branch decisions decisionIfA and decisionIfB',
      rejected: 'both are prose. Comparing them for meaning is the semantic inference invariant 3 '
        + 'forbids, and §148 already refused deterministic reclassification of a natural-language '
        + 'field.' },
  ],

  theSemanticInformationThatExistsOnlyHere:
    'WHETHER AN ESTABLISHED CONDITION\'S CONSEQUENCE IS CESSATION RATHER THAN CONTROL — that is, '
    + 'whether any immediate control can make continued exposure acceptable. That is a judgment '
    + 'about the controllability of a hazard. No field in the first-pass contract encodes '
    + 'consequence, severity or controllability, and no combination of the fields that do exist '
    + 'separates a kettle that may keep running from an evaporator that may not.',

  whatFollows:
    'The JUDGMENT is irreducible and is retained. The DUPLICATION is not, and is removed. §237 keeps '
    + 'exactly one provider-authored statement of it and attaches that statement to the reference '
    + 'the analysis already carries, so no reference is written twice and no separate field exists '
    + 'to be omitted or malformed.',

  derivedSetProperties: {
    deterministic: 'the derived cessation set is requiredBy filtered on one enum member. No prose, '
      + 'no inference, no default.',
    auditable: 'every member of the derived set names a candidateKey that resolves in the same '
      + 'analysis, and the role that put it there is on the same entry.',
    reproducible: 'the same admitted analysis yields the same set on every run.',
    structurallyComplete: 'every requiredBy entry must carry a role, so no driver can be silent '
      + 'about what it drives.',
    cannotSilentlyDisappear: 'there is no separate field to omit. A missing or invalid role refuses '
      + 'the entry and therefore the analysis, and an absent role can never read as an empty '
      + 'cessation set.',
  },
} as const;

// ================================================================ the vocabulary

/**
 * WHAT ROLE A DRIVER PLAYS IN THE POSTURE. Five governed members and no more.
 *
 * PERMISSIVE FIRST, as §233 ordered the postures and for the same reason: the natural reading of a
 * new safety field is that it must say something serious, and listing cessation first would lean on
 * it. `ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION` exists so a model that names a real,
 * present, properly controlled hazard as a reason for CONTINUE has a truthful member to use and is
 * never pushed into mislabelling it.
 */
export const POSTURE_DRIVER_ROLES_237 = [
  'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION',
  'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
  'ESTABLISHED_CONDITION_REQUIRING_CESSATION',
  'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
  'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
] as const;
export type PostureDriverRole237 = (typeof POSTURE_DRIVER_ROLES_237)[number];

export const DRIVER_ROLE_DEFINITIONS_237:
Readonly<Record<PostureDriverRole237, string>> = {
  ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION:
    'An established condition that bears on this posture and requires nothing of anyone today. A '
    + 'hazard can be real, present and active and still be here. This is a real answer.',
  ESTABLISHED_CONDITION_REQUIRING_CONTROLS:
    'An established condition that makes work acceptable only with an immediate control in effect. '
    + 'Name the control in requiredControls.',
  ESTABLISHED_CONDITION_REQUIRING_CESSATION:
    'An established condition whose CURRENT STATE, on its own, already requires the work to cease, '
    + 'be withdrawn from or be isolated. Nothing is waiting on a result and no control operated '
    + 'alongside the work would make continued exposure acceptable. Use this ONLY when that is '
    + 'true: it is not a severity rating.',
  UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION:
    'An unresolved fact whose resolution could change WHETHER THE CURRENT WORK OR EXPOSURE IS '
    + 'ACCEPTABLE. Resolving it one way permits the work and the other way does not.',
  UNRESOLVED_RESPONSE_OR_FOLLOW_UP:
    'An unresolved fact whose resolution changes only WHAT IS DONE ABOUT IT: which corrective '
    + 'action is chosen, how it is documented, who follows it up, how confirmation is obtained, or '
    + 'whether someone has already acted. Real and worth declaring, and it does not by itself '
    + 'decide whether work continues.',
};

/** Which reference kind each role may be used on. Pure lookup; nothing is inferred. */
export const DRIVER_ROLE_REF_KIND_237:
Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_237)[number]>> = {
  ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION: 'HAZARD_CANDIDATE',
  ESTABLISHED_CONDITION_REQUIRING_CONTROLS: 'HAZARD_CANDIDATE',
  ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'HAZARD_CANDIDATE',
  UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: 'UNRESOLVED_DECLARATION',
  UNRESOLVED_RESPONSE_OR_FOLLOW_UP: 'UNRESOLVED_DECLARATION',
};

/** The roles that can justify a posture which does not permit work. The C2 repair, as data. */
export const DECISION_CONTROLLING_ROLES_237: readonly PostureDriverRole237[] = [
  'ESTABLISHED_CONDITION_REQUIRING_CESSATION',
  'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
];

/** The one role that raises the posture floor to STOP. */
export const CESSATION_ROLE_237 = 'ESTABLISHED_CONDITION_REQUIRING_CESSATION' as const;

// ================================================================ the object

export interface PostureDriver237 extends PostureRef233 {
  readonly driverRole: PostureDriverRole237;
}

export interface ImmediateSafetyPostureObject237
  extends Omit<ImmediateSafetyPostureObject233, 'requiredBy'> {
  readonly requiredBy: readonly PostureDriver237[];
}

// ================================================================ provider-visible rules
//
// The eight §235 rules that survive are IMPORTED VERBATIM rather than retyped, so provenance is
// mechanical: the suite asserts each retained string is identical to the §235 original and that
// none of the four cessation rules appears anywhere in the §237 transmission.

export const RULES_RETAINED_FROM_235: readonly string[] = PROVIDER_VISIBLE_RULES_235.slice(0, 8);

export const RULES_REMOVED_FROM_235: readonly string[] = PROVIDER_VISIBLE_RULES_235.slice(8);

export const PROVIDER_VISIBLE_RULES_237: readonly string[] = [
  ...RULES_RETAINED_FROM_235,
  'RULE. Every entry in requiredBy must carry a driverRole from the list above.',
  'RULE. A driverRole beginning ESTABLISHED_CONDITION may be used only on a hazard candidate, and a '
    + 'driverRole beginning UNRESOLVED may be used only on an unresolved-fact declaration.',
  'RULE. If any driverRole is ESTABLISHED_CONDITION_REQUIRING_CESSATION, the posture must be STOP.',
  'RULE. Under HOLD_PENDING_VERIFICATION or STOP, at least one driverRole must be '
    + 'ESTABLISHED_CONDITION_REQUIRING_CESSATION or UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION. An '
    + 'unresolved fact that changes only the response, the documentation, the follow-up, the '
    + 'confirmation method or whether somebody has already acted cannot on its own require work to '
    + 'wait or to stop.',
];

// ================================================================ the instruction block

export const DRIVER_BLOCK_LINES_237: readonly string[] = [
  'WHAT EACH REASON IN requiredBy IS DOING, and the rules the analysis is checked against.',
  '',
  '  Every entry in requiredBy carries a driverRole saying what part that candidate or declaration',
  '  plays in the posture you chose. One of:',
  '',
  ...POSTURE_DRIVER_ROLES_237.flatMap(r => [
    `    ${r}`,
    `      ${DRIVER_ROLE_DEFINITIONS_237[r]}`,
    '',
  ]),
  '  UNCERTAINTY ABOUT THE HAZARD IS NOT UNCERTAINTY ABOUT THE RESPONSE.',
  '',
  '    Only an unresolved fact whose resolution could change WHETHER THE CURRENT WORK OR EXPOSURE',
  '    IS ACCEPTABLE may require the work to wait. Not knowing the atmosphere in a space, whether a',
  '    trip functions, whether a structure will carry a load, whether an isolation holds, or',
  '    whether people are exposed: those decide, and they belong to',
  '    UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION.',
  '',
  '    Not knowing which corrective action was chosen, how it was recorded, who is following it up,',
  '    how confirmation will be obtained, or whether somebody has ALREADY DONE the thing you would',
  '    ask for: those are real and worth declaring, and they do not decide. They belong to',
  '    UNRESOLVED_RESPONSE_OR_FOLLOW_UP.',
  '',
  '    If the answer to your question is "then do the control", the control is what happens next.',
  '    Waiting to find out whether somebody already did it is not verification, it is delay.',
  '',
  '  ESTABLISHED_CONDITION_REQUIRING_CESSATION IS NOT A SEVERITY RATING.',
  '',
  '    A hazard can be active, serious, and correctly controlled, and it does not belong there. Use',
  '    it only where the condition as it stands already requires the work to cease, be withdrawn',
  '    from or be isolated, with nothing waiting on a result.',
  '',
  '  THE RULES THIS ANALYSIS IS CHECKED AGAINST. Each is refused deterministically.',
  '',
  ...PROVIDER_VISIBLE_RULES_237.map(r => `  ${r}`),
  '',
];

const POSTURE_ANCHOR_237 = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor237(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_237_ABORT: the anchor appears ${hits.length} times in the §233 system prompt, `
      + 'expected 1. This successor is built by construction from §233 and refuses to load against '
      + 'a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export function build237SystemPrompt(governedSourceIdCount: number): string {
  const base = build233SystemPrompt(governedSourceIdCount);
  if (!base.includes(POSTURE_BLOCK_LINES_233.join('\n'))) {
    throw new Error('FIRST_PASS_237_ABORT: the §233 posture block is not present in the base');
  }
  return insertBeforeUniqueAnchor237(base.split('\n'), POSTURE_ANCHOR_237,
    DRIVER_BLOCK_LINES_237).join('\n');
}

/** Remove the block again. Asserted to reproduce the §233 prompt byte for byte. */
export function reconstruct233SystemPrompt(prompt: string): string {
  const joined = DRIVER_BLOCK_LINES_237.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) {
    throw new Error('FIRST_PASS_237: the driver block is not present; cannot reconstruct');
  }
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ================================================================ the wire schema

export const SCHEMA_DESCRIPTION_SUFFIXES_237: Readonly<Record<string, string>> = {
  requiredBy: ' A reference may appear in this list OR in acceptedWithoutImmediateAction, never in '
    + 'both. Every ACTIVE candidate and every declaration you emit must appear in one of the two. '
    + 'Each entry carries a driverRole saying what part it plays in the posture.',
  acceptedWithoutImmediateAction: ' A reference may appear in this list OR in requiredBy, never in '
    + 'both.',
  requiredControls: ' Must be empty when the posture is CONTINUE. Under HOLD_PENDING_VERIFICATION '
    + 'or STOP no control may carry timing DURING_CONTINUED_WORK.',
  resumeCondition: ' Both lists must be empty when the posture is CONTINUE or '
    + 'CONTINUE_WITH_CONTROLS.',
};

export const DRIVER_ROLE_SCHEMA_PROPERTY_237 = {
  type: 'string',
  enum: [...POSTURE_DRIVER_ROLES_237],
  description: 'What part this reason plays in the posture. '
    + Object.entries(DRIVER_ROLE_DEFINITIONS_237).map(([k, v]) => `${k}: ${v}`).join(' ')
    + ' A role beginning ESTABLISHED_CONDITION may be used only on a hazard candidate and a role '
    + 'beginning UNRESOLVED only on an unresolved-fact declaration. If any entry is '
    + 'ESTABLISHED_CONDITION_REQUIRING_CESSATION the posture must be STOP. Under '
    + 'HOLD_PENDING_VERIFICATION or STOP at least one entry must be '
    + 'ESTABLISHED_CONDITION_REQUIRING_CESSATION or UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION.',
} as const;

/** The §237 posture schema property: the §233 property plus one member on each requiredBy entry. */
export function build237PostureSchemaProperty(): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233)) as Record<string, any>;
  if (p.properties.establishedConditionsRequiringCessation !== undefined) {
    throw new Error('FIRST_PASS_237_ABORT: the base already carries the §235 cessation list');
  }
  for (const [k, suffix] of Object.entries(SCHEMA_DESCRIPTION_SUFFIXES_237)) {
    const node = p.properties[k] as Record<string, unknown> | undefined;
    if (node === undefined || typeof node.description !== 'string') {
      throw new Error(`FIRST_PASS_237_ABORT: §233 posture property ${k} drifted`);
    }
    node.description = `${node.description}${suffix}`;
  }
  const items = p.properties.requiredBy.items as Record<string, any>;
  if (items.properties[DRIVER_ROLE_FIELD] !== undefined) {
    throw new Error(`FIRST_PASS_237_ABORT: §233 already carries ${DRIVER_ROLE_FIELD}`);
  }
  items.properties[DRIVER_ROLE_FIELD] = JSON.parse(JSON.stringify(DRIVER_ROLE_SCHEMA_PROPERTY_237));
  items.required = [...(items.required as string[]), DRIVER_ROLE_FIELD];
  return p;
}

/** Remove the addition again. Asserted to reproduce the §233 posture property exactly. */
export function reconstruct233PostureSchemaProperty(
  v237: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v237)) as Record<string, any>;
  const items = p.properties.requiredBy.items as Record<string, any>;
  delete items.properties[DRIVER_ROLE_FIELD];
  items.required = (items.required as string[]).filter(r => r !== DRIVER_ROLE_FIELD);
  for (const [k, suffix] of Object.entries(SCHEMA_DESCRIPTION_SUFFIXES_237)) {
    const node = p.properties[k] as Record<string, unknown>;
    const d = node.description as string;
    if (!d.endsWith(suffix)) {
      throw new Error(`FIRST_PASS_237: ${k} does not end with its §237 suffix; cannot reconstruct`);
    }
    node.description = d.slice(0, d.length - suffix.length);
  }
  return p;
}

export function buildExpert237WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert233WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_237_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build237PostureSchemaProperty();
  return base;
}

export function reconstruct233WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert237WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct233PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ field inventory

export const POSTURE_SUBFIELDS_237: readonly string[] = [
  'posture', 'requiredBy', 'acceptedWithoutImmediateAction', 'requiredControls',
  'resumeCondition', 'whatHappensNow',
];

export const BASIS_ENTRY_SUBFIELDS_237: readonly string[] = ['ref', 'refKind', DRIVER_ROLE_FIELD];

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities237(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_237,
    driverRoleField: DRIVER_ROLE_FIELD,
    postureSubfields: POSTURE_SUBFIELDS_237,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_237,
    postures: sha(JSON.stringify(IMMEDIATE_SAFETY_POSTURES_233)),
    driverRoles: sha(JSON.stringify(POSTURE_DRIVER_ROLES_237)),
    driverRoleDefinitions: sha(JSON.stringify(DRIVER_ROLE_DEFINITIONS_237)),
    driverRoleRefKinds: sha(JSON.stringify(DRIVER_ROLE_REF_KIND_237)),
    decisionControllingRoles: sha(JSON.stringify(DECISION_CONTROLLING_ROLES_237)),
    rulesRetainedFrom235: RULES_RETAINED_FROM_235.length,
    rulesRemovedFrom235: RULES_REMOVED_FROM_235.length,
    providerVisibleRules: sha(JSON.stringify(PROVIDER_VISIBLE_RULES_237)),
    driverBlockLines: sha(DRIVER_BLOCK_LINES_237.join('\n')),
    postureSchemaProperty: sha(JSON.stringify(build237PostureSchemaProperty())),
    systemPromptNoGoverned: sha(build237SystemPrompt(0)),
    systemPromptGoverned: sha(build237SystemPrompt(2)),
    cessationDerivability: CESSATION_DERIVABILITY_237.answer,
  };
}
