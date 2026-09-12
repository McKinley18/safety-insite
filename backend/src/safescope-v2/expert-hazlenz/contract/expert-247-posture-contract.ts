/**
 * §247 -- DRIVER-ROLE JUSTIFICATION AND K6 REPRESENTABILITY. AN ADDITIVE SUCCESSOR TO §239,
 * BUILT BY CONSTRUCTION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233, §235, §237 and §239 are NOT edited. This module builds its schema from §239 and reduces it
 * back to §239 byte for byte, so the whole chain back to §233 stays reproducible from the tree.
 *
 * ==================== WHAT §243 DEMONSTRATED, AND WHAT IS BEING REPAIRED ====================
 *
 * §244 established that every posture defect in §243 was a DRIVER-ROLE SELECTION defect. Posture is
 * a dependent variable: a cessation driver forces STOP, required controls exist only under
 * continue-with-controls, and the model does not choose a posture and then justify it. So the repair
 * target is role selection, and tuning posture labels or suppressing STOP would address nothing.
 *
 * Two sub-mechanisms were demonstrated:
 *
 *   A1  ESTABLISHED-CONDITION ROLE INFLATION. On C5 a worker on foot behind a reversing vehicle was
 *       carried as requiring cessation, on an observation that names a banksman in radio contact with
 *       an agreed stop signal. On M1 a blocked nozzle with thirteen of fourteen sprays working was
 *       carried as requiring a control. On M8 three established conditions were carried as requiring
 *       controls where the frozen truth requires none.
 *
 *   A2  MANUFACTURED FACT PROMOTED TO THE CONTINUATION-CONTROLLING ROLE. On M8 a storm cell sixty
 *       miles away, with a documented trigger distance and active monitoring, was made a driver of
 *       continuation. On G5 the availability of a hold-to-run mode the observation states exists was
 *       made a driver.
 *
 * ==================== THE REPRESENTATIONAL GAP, AND THE SMALLEST CLOSURE ====================
 *
 * A driver role was emitted as a BARE ENUM. Nothing obliged the model to confront, at the moment of
 * role assignment, what the observation had already established about that condition. A cessation
 * driver carried no obligation to name the alongside control it considered; a controls driver carried
 * no link to the control that discharges it; and nothing separated an unstated present state from a
 * future contingency.
 *
 * §247 requires a structured justification on every basis entry. The model supplies the judgement;
 * deterministic code checks only that the representation is internally consistent. **Deterministic
 * code never decides whether the workplace fact is true, and never reads meaning out of prose.**
 *
 * ==================== AND WHY THIS IS THE LAST REPRESENTATIONAL ATTEMPT ====================
 *
 * §239 already broadened the driver representation once. This is the second and final bounded attempt
 * at this demonstrated mechanism. §244's preregistered expectation is preserved exactly and is NOT
 * revised here: on the frozen §243 outputs this representation would have barred M8's storm fact from
 * a controlling role, and would NOT necessarily have barred G5's hold-to-run fact. If the narrow
 * hosted confirmation does not materially improve role coherence, the answer is a product-owner
 * capability decision and not another taxonomy, sidecar, verifier, prompt layer or schema layer.
 */

import { createHash } from 'crypto';

import type { ExpertAnalysisInput } from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import {
  POSTURE_FIELD, type PostureRefKind233,
} from './expert-233-posture-contract';
import {
  POSTURE_DRIVER_ROLES_239, DRIVER_ROLE_REF_KINDS_239, BASIS_ENTRY_SUBFIELDS_239,
  FIRST_PASS_CONTRACT_239_VERSION, build239PostureSchemaProperty, buildExpert239WireSchema,
  build239SystemPrompt, type PostureDriverRole239,
} from './expert-239-posture-contract';

export const FIRST_PASS_CONTRACT_247_VERSION = 'hazlenz.expert.first-pass.247' as const;

export const BASE_CONTRACT_VERSIONS_247 = {
  driverBinding: FIRST_PASS_CONTRACT_239_VERSION,
} as const;

export const ROLE_JUSTIFICATION_FIELD = 'roleJustification' as const;
export const DRIVER_ROLE_FIELD_247 = 'driverRole' as const;

// ================================================================ the epistemic vocabulary

/**
 * THE FOUR KINDS THE AUTHORIZATION REQUIRES THE REPRESENTATION TO DISTINGUISH.
 *
 * This is a closed vocabulary the MODEL selects from. It is not a severity rating and not a
 * confidence score. It says what KIND of thing the model is asserting, which is precisely what a bare
 * role enum left unsaid.
 */
export const EPISTEMIC_CHARACTERS_247 = [
  'ESTABLISHED_CONDITION',
  'UNRESOLVED_DECISION_CRITICAL',
  'MANUFACTURED_OR_SPECULATIVE',
  'FOLLOW_UP_NON_CONTROLLING',
] as const;
export type EpistemicCharacter247 = (typeof EPISTEMIC_CHARACTERS_247)[number];

export const EPISTEMIC_CHARACTER_DEFINITIONS_247:
Readonly<Record<EpistemicCharacter247, string>> = {
  ESTABLISHED_CONDITION:
    'The observation STATES this is so. You are not waiting on anything to know it. If the '
    + 'observation also states a control operating alongside the work, that control is part of what '
    + 'is established and you must weigh it here rather than ignore it.',
  UNRESOLVED_DECISION_CRITICAL:
    'A PRESENT state of the world that the observation does not settle, and whose resolution one way '
    + 'permits the current work and the other way does not. Not a future event. Not a pending record.',
  MANUFACTURED_OR_SPECULATIVE:
    'Something you have introduced that the observation does not raise: a possibility, a contingency, '
    + 'a future event, or a check nobody has said is outstanding. Real enough to mention, and it may '
    + 'NEVER be given a role that controls whether work continues.',
  FOLLOW_UP_NON_CONTROLLING:
    'Unresolved, and its resolution changes only WHAT IS DONE ABOUT IT -- which action, how it is '
    + 'recorded, who follows it up, whether someone has already acted. Real and worth declaring, and '
    + 'it does not by itself decide whether work continues.',
};

/**
 * WHICH EPISTEMIC CHARACTER EACH ROLE MAY CARRY. Pure lookup; nothing is inferred.
 *
 * THIS TABLE IS THE WHOLE OF THE SAFETY CONTENT OF THE SLICE, and one row is the repair:
 * `MANUFACTURED_OR_SPECULATIVE` appears against no controlling role, so a fact the model itself
 * labels manufactured cannot drive continuation. That is A2, made unrepresentable.
 */
export const ROLE_EPISTEMIC_CHARACTERS_247:
Readonly<Record<PostureDriverRole239, readonly EpistemicCharacter247[]>> = {
  ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION: ['ESTABLISHED_CONDITION'],
  ESTABLISHED_CONDITION_REQUIRING_CONTROLS: ['ESTABLISHED_CONDITION'],
  ESTABLISHED_CONDITION_REQUIRING_CESSATION: ['ESTABLISHED_CONDITION'],
  UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: ['UNRESOLVED_DECISION_CRITICAL'],
  UNRESOLVED_RESPONSE_OR_FOLLOW_UP: ['FOLLOW_UP_NON_CONTROLLING', 'MANUFACTURED_OR_SPECULATIVE'],
};

/** Roles whose presence decides whether the work may continue as it is. */
export const CONTROLLING_ROLES_247: readonly PostureDriverRole239[] = POSTURE_DRIVER_ROLES_239
  .filter(r => r !== 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP');

/** A cessation driver must confront the alongside control. This is the C5 mechanism. */
export const CESSATION_ROLE_247: PostureDriverRole239 =
  'ESTABLISHED_CONDITION_REQUIRING_CESSATION';
/** A controls driver must name the control that discharges it. This is the M8 mechanism. */
export const CONTROLS_ROLE_247: PostureDriverRole239 =
  'ESTABLISHED_CONDITION_REQUIRING_CONTROLS';

// ================================================================ load-time construction guards

if (EPISTEMIC_CHARACTERS_247.length !== 4) {
  throw new Error('FIRST_PASS_247_ABORT: the authorization requires exactly four epistemic kinds');
}
for (const role of POSTURE_DRIVER_ROLES_239) {
  const chars = ROLE_EPISTEMIC_CHARACTERS_247[role];
  if (chars === undefined || chars.length === 0) {
    throw new Error(`FIRST_PASS_247_ABORT: ${role} admits no epistemic character`);
  }
  for (const c of chars) {
    if (!EPISTEMIC_CHARACTERS_247.includes(c)) {
      throw new Error(`FIRST_PASS_247_ABORT: ${role} admits a character §247 does not define`);
    }
  }
  if (CONTROLLING_ROLES_247.includes(role) && chars.includes('MANUFACTURED_OR_SPECULATIVE')) {
    throw new Error(`FIRST_PASS_247_ABORT: ${role} controls continuation and may not admit a `
      + 'manufactured possibility');
  }
}

// ================================================================ the justification representation

export const ROLE_JUSTIFICATION_SUBFIELDS_247: readonly string[] = [
  'epistemicCharacter', 'factualBasis', 'unresolvedElement', 'whyDecisionMaterial',
  'whyControllingNotFollowUp', 'alongsideControlConsidered', 'whyAlongsideControlInsufficient',
  'dischargingControlRef',
];

export const BASIS_ENTRY_SUBFIELDS_247: readonly string[] =
  [...BASIS_ENTRY_SUBFIELDS_239, ROLE_JUSTIFICATION_FIELD];

const JUSTIFICATION_SCHEMA_247 = (role: PostureDriverRole239): Record<string, unknown> => {
  const required = ['epistemicCharacter', 'factualBasis', 'whyDecisionMaterial',
    'whyControllingNotFollowUp'];
  if (role === CESSATION_ROLE_247) {
    required.push('alongsideControlConsidered', 'whyAlongsideControlInsufficient');
  }
  if (role === CONTROLS_ROLE_247) required.push('dischargingControlRef');
  return {
    type: 'object',
    additionalProperties: false,
    required,
    description:
      'WHY this entry qualifies for the role you gave it. Answer from what the observation states, '
      + 'not from what could be true.',
    properties: {
      epistemicCharacter: {
        type: 'string',
        enum: [...ROLE_EPISTEMIC_CHARACTERS_247[role]],
        description: [...ROLE_EPISTEMIC_CHARACTERS_247[role]]
          .map(c => `${c}: ${EPISTEMIC_CHARACTER_DEFINITIONS_247[c]}`).join(' ')
          + ' Only these are admissible for this role; if none of them describes what you mean, the '
          + 'role is wrong, not the character.',
      },
      factualBasis: {
        type: 'string', minLength: 1,
        description: 'What the observation ESTABLISHES about this condition, including any control '
          + 'it states is operating alongside the work. Quote or paraphrase the observation, do not '
          + 'restate your own conclusion.',
      },
      unresolvedElement: {
        type: ['string', 'null'],
        description: 'The single thing that is NOT settled, or null when nothing is unresolved. If '
          + 'what is open is whether something happens LATER, this entry is not decision-critical.',
      },
      whyDecisionMaterial: {
        type: 'string', minLength: 1,
        description: 'Why resolving this could change the IMMEDIATE operational safety decision for '
          + 'the work described. If the answer is that it changes only what is done about it, this '
          + 'is a follow-up and not a driver.',
      },
      whyControllingNotFollowUp: {
        type: 'string', minLength: 1,
        description: 'Why this belongs in the role you chose rather than as a non-controlling '
          + 'follow-up. Name what would be different on site under each answer.',
      },
      alongsideControlConsidered: {
        type: ['string', 'null'],
        description: 'REQUIRED ON A CESSATION DRIVER. The control operating alongside the work that '
          + 'you considered, named from the observation. Write null only if the observation states '
          + 'no such control at all.',
      },
      whyAlongsideControlInsufficient: {
        type: ['string', 'null'],
        description: 'REQUIRED ON A CESSATION DRIVER. Why that control does not make continued '
          + 'exposure acceptable. Cessation applies when no control operated alongside the work '
          + 'would suffice, so if it would, this is not a cessation driver.',
      },
      dischargingControlRef: {
        type: ['string', 'null'],
        description: 'REQUIRED ON A CONTROLS DRIVER. The exact `control` text from your own '
          + 'requiredControls that discharges THIS entry. Restating an existing written procedure '
          + 'that the observation says is already in force does not discharge anything.',
      },
    },
  };
};

// ================================================================ K6: the discriminated union

/**
 * ==================== K6, MADE UNREPRESENTABLE ====================
 *
 * §239 declared `refKind` and `driverRole` as two independent enums on one node. Five roles and two
 * carriers give TEN expressible pairs; `DRIVER_ROLE_REF_KINDS_239` admits SIX. On M2 the model
 * emitted one of the four inadmissible pairs -- the follow-up role on a hazard candidate -- and the
 * whole posture was refused, withdrawing a man-riding rope case from the analysis.
 *
 * The union below is generated FROM `DRIVER_ROLE_REF_KINDS_239`, never restated by hand, so the
 * admissible set of meanings is unchanged by construction. One branch per role pins `driverRole`
 * with `const` and restricts `refKind` to that role's carriers.
 *
 * **`anyOf`, NOT `oneOf`.** Anthropic's structured-output subset does not support `oneOf`; a `oneOf`
 * union returns HTTP 400 before generation begins, which is the §107 `minLength` failure again.
 * `anyOf` and `const` are both supported, and §246 proved offline that both survive the §108
 * compatibility strip and that the strict wrapper adds `additionalProperties: false` inside every
 * branch. Nothing is coerced after generation; the inadmissible pair simply cannot be written.
 */
export function buildBasisEntryUnion247(): Record<string, unknown> {
  const branches = POSTURE_DRIVER_ROLES_239.map(role => ({
    type: 'object',
    additionalProperties: false,
    required: ['ref', 'refKind', DRIVER_ROLE_FIELD_247, ROLE_JUSTIFICATION_FIELD],
    properties: {
      ref: {
        type: 'string', minLength: 1,
        description: 'a candidateKey or a declarationId from THIS analysis',
      },
      refKind: {
        type: 'string',
        enum: [...DRIVER_ROLE_REF_KINDS_239[role]],
        description: `the carrier kinds this role may be used on`,
      },
      [DRIVER_ROLE_FIELD_247]: { type: 'string', const: role },
      [ROLE_JUSTIFICATION_FIELD]: JUSTIFICATION_SCHEMA_247(role),
    },
  }));
  return { anyOf: branches };
}

/** The admissible pairs the union expresses, as data, so the count can be asserted not asserted-to. */
export function admissiblePairs247(): readonly { role: string; refKind: string }[] {
  return POSTURE_DRIVER_ROLES_239.flatMap(role =>
    DRIVER_ROLE_REF_KINDS_239[role].map(k => ({ role, refKind: k as string })));
}

/** Every pair the §239 cross-product could express. The difference is what K6 was. */
export function expressiblePairsUnder239(): readonly { role: string; refKind: string }[] {
  const kinds: PostureRefKind233[] = ['HAZARD_CANDIDATE', 'UNRESOLVED_DECLARATION'];
  return POSTURE_DRIVER_ROLES_239.flatMap(role => kinds.map(k => ({ role, refKind: k as string })));
}

// ================================================================ the schema, built from §239

export function build247PostureSchemaProperty(): Record<string, unknown> {
  const p = build239PostureSchemaProperty() as Record<string, any>;
  const items = p.properties.requiredBy.items as Record<string, any>;
  if (items === undefined || items.properties?.[DRIVER_ROLE_FIELD_247] === undefined) {
    throw new Error('FIRST_PASS_247_ABORT: the §239 basis entry is not the expected shape; '
      + 'the base drifted');
  }
  if (items.anyOf !== undefined) {
    throw new Error('FIRST_PASS_247_ABORT: the base already carries a union; the base drifted');
  }
  p.properties.requiredBy.items = buildBasisEntryUnion247();
  return p;
}

/** Remove the addition again. Asserted to reproduce the §239 posture property exactly. */
export function reconstruct239PostureSchemaProperty(
  v247: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v247)) as Record<string, any>;
  const union = p.properties.requiredBy.items as Record<string, any>;
  if (!Array.isArray(union.anyOf)) {
    throw new Error('FIRST_PASS_247: the §247 union is absent; cannot reconstruct');
  }
  p.properties.requiredBy.items = (build239PostureSchemaProperty() as Record<string, any>)
    .properties.requiredBy.items;
  return p;
}

export function buildExpert247WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert239WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_247_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build247PostureSchemaProperty();
  return base;
}

export function reconstruct239WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert247WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct239PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ the transmitted instruction

export const JUSTIFICATION_BLOCK_LINES_247: readonly string[] = [
  '',
  'EVERY ENTRY IN THE POSTURE BASIS NOW CARRIES A roleJustification.',
  '',
  'Before you give an entry a driver role, say why it qualifies for that role. You are answering',
  'from what the observation states, not from what could be true.',
  '',
  '  epistemicCharacter  what KIND of thing this is. The admissible kinds differ by role.',
  '  factualBasis        what the observation ESTABLISHES, including any control it says is',
  '                      operating alongside the work.',
  '  unresolvedElement   the single thing not settled, or null. If what is open is whether',
  '                      something happens LATER, this entry is not decision-critical.',
  '  whyDecisionMaterial why resolving it could change the IMMEDIATE decision for this work.',
  '  whyControllingNotFollowUp   why it belongs in this role and not as a follow-up.',
  '',
  'ON A CESSATION DRIVER you must also name alongsideControlConsidered and say in',
  'whyAlongsideControlInsufficient why it does not make continued exposure acceptable. Cessation',
  'applies when NO control operated alongside the work would suffice. If a stated control would',
  'suffice, the entry is not a cessation driver.',
  '',
  'ON A CONTROLS DRIVER you must name dischargingControlRef: the exact control text from your own',
  'requiredControls that discharges THIS entry. Restating a written procedure the observation says',
  'is already in force discharges nothing.',
  '',
  'A possibility you introduced, a future contingency, or a check nobody said is outstanding is',
  'MANUFACTURED_OR_SPECULATIVE. It is worth declaring and it may never be given a role that',
  'controls whether work continues.',
  '',
];

export function build247SystemPrompt(governedSourceIdCount: number): string {
  const base = build239SystemPrompt(governedSourceIdCount);
  return `${base}\n${JUSTIFICATION_BLOCK_LINES_247.join('\n')}`;
}

/** Remove the addition again. Asserted to reproduce the §239 prompt byte for byte. */
export function reconstruct239SystemPrompt(v247: string): string {
  const block = `\n${JUSTIFICATION_BLOCK_LINES_247.join('\n')}`;
  if (!v247.endsWith(block)) {
    throw new Error('FIRST_PASS_247: the §247 block is absent; cannot reconstruct');
  }
  return v247.slice(0, v247.length - block.length);
}

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities247(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_247_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_247,
    roleJustificationField: ROLE_JUSTIFICATION_FIELD,
    roleJustificationSubfields: ROLE_JUSTIFICATION_SUBFIELDS_247,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_247,
    epistemicCharacters: sha(JSON.stringify(EPISTEMIC_CHARACTERS_247)),
    epistemicDefinitions: sha(JSON.stringify(EPISTEMIC_CHARACTER_DEFINITIONS_247)),
    roleEpistemicCharacters: sha(JSON.stringify(ROLE_EPISTEMIC_CHARACTERS_247)),
    admissiblePairs: admissiblePairs247().length,
    expressiblePairs: POSTURE_DRIVER_ROLES_239.length,
    inadmissibleExpressible: 0,
    unionKeyword: 'anyOf',
    discriminatorKeyword: 'const',
    postureSchemaProperty: sha(JSON.stringify(build247PostureSchemaProperty())),
    justificationBlock: sha(JUSTIFICATION_BLOCK_LINES_247.join('\n')),
    systemPromptNoGoverned: sha(build247SystemPrompt(0)),
    systemPromptGoverned: sha(build247SystemPrompt(2)),
  };
}
