/**
 * §235 -- POSTURE CONTRACT ALIGNMENT. AN ADDITIVE SUCCESSOR TO §233, BUILT BY CONSTRUCTION FROM IT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233 is NOT edited. Its four modules keep the digest the frozen §234 evidence records, so the
 * §234 result stays reproducible from the tree. This file adds a block to the §233 prompt and one
 * property to the §233 posture schema, and it can take both away again byte for byte.
 *
 * ==================== WHAT §234 SHOWED, AND WHAT THIS CHANGES ====================
 *
 * THE ALIGNMENT DEFECT. The §233 projection refused four of sixteen analyses for breaking rules the
 * transmitted instruction never stated. On two of them the model meant something coherent -- a
 * hazard named as a reason for CONTINUE and also accepted without action -- and was refused by a
 * rule it was never given. §139 established that the repair for that is to DEFINE THE VOCABULARY,
 * not to correct the model. §233 did that for the posture enum and did not do it for the list
 * semantics. This file finishes the job, and `expert-235-contract-consistency.ts` makes the
 * omission impossible to repeat: a deterministic admissibility rule with no provider-visible
 * statement now fails a local test.
 *
 * THE MANUFACTURED-UNCERTAINTY DEFECT. On the §234 autoclave case the model declared an unresolved
 * fact -- is the locking ring engaged -- about a case whose controlling property was established,
 * and used that invented unknown to select HOLD_PENDING_VERIFICATION where the facts required STOP.
 * P3 could not catch it: P3 asks whether a declaration is COVERED by the posture, and a
 * manufactured declaration placed in `requiredBy` is covered. Coverage was never a test of whether
 * the declaration should exist.
 *
 * ==================== THE SMALLEST CONSTRAINT THAT EXPRESSES THE RULE ====================
 *
 * One new field. `establishedConditionsRequiringCessation` asks the model to name, from its own
 * candidates, anything whose CURRENT ESTABLISHED STATE already requires cessation, withdrawal or
 * isolation independently of anything still being verified. If that list is non-empty the posture
 * must be STOP, and a manufactured unknown can no longer stand between the two.
 *
 *   >>> THIS IS A FLOOR, NOT A FIX, AND IT IS DISCLOSED AS ONE. A model that simply declines to
 *   >>> populate the list on a case that warrants it is not refused. What the field removes is the
 *   >>> ability to name an established cessation condition AND hold rather than stop -- the
 *   >>> contradiction §234 observed -- and it makes the judgment explicit enough to measure.
 *
 *   >>> AND IT IS DELIBERATELY NOT "ESTABLISHED HAZARD MEANS STOP". The list is about a property
 *   >>> whose truth ALREADY DETERMINES cessation, not about severity and not about activity. A
 *   >>> molten zinc kettle is active, serious and correctly CONTINUE. An unproved cooling-water
 *   >>> trip is a real unknown and correctly HOLD_PENDING_VERIFICATION. Both leave this list empty,
 *   >>> and the instruction says so before it says anything else.
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

export const FIRST_PASS_CONTRACT_235_VERSION =
  'hazlenz.expert.first-pass-contract.235-posture-contract-alignment' as const;

export const BASE_CONTRACT_VERSIONS_235 = {
  posture: FIRST_PASS_CONTRACT_233_VERSION,
} as const;

/** The one added posture sub-field. Named once so nothing spells it twice. */
export const CESSATION_FIELD = 'establishedConditionsRequiringCessation' as const;

// ================================================================ the object

export interface ImmediateSafetyPostureObject235 extends ImmediateSafetyPostureObject233 {
  /**
   * Which of the model's OWN hazard candidates are in a state that ALREADY requires cessation,
   * withdrawal or isolation on the facts as they stand. Empty is the ordinary answer.
   */
  readonly establishedConditionsRequiringCessation: readonly PostureRef233[];
}

// ================================================================ provider-visible rules
//
// EVERY LINE IN THIS TABLE IS TRANSMITTED VERBATIM TO THE MODEL, and every one of them maps to a
// deterministic refusal code in `expert-235-contract-consistency.ts`. The consistency suite fails
// if a rule here has no code, or a code has no rule here. That bidirectional check is the whole
// point of §235's first work item.

export const RULE_MARKER_235 = '  RULE. ' as const;

export const PROVIDER_VISIBLE_RULES_235: readonly string[] = [
  'RULE. whatHappensNow must say something a duty holder can act on. A placeholder such as "n/a", '
    + '"none", "unused" or "to be determined" is refused.',
  'RULE. A candidateKey or declarationId may appear in requiredBy OR in '
    + 'acceptedWithoutImmediateAction, never in both. Pick the one you mean.',
  'RULE. Every unresolved-fact declaration you emit must appear in requiredBy or in '
    + 'acceptedWithoutImmediateAction. None may stand outside the posture.',
  'RULE. Every hazard candidate you mark ACTIVE must appear in requiredBy or in '
    + 'acceptedWithoutImmediateAction. Accepting one without action is a correct answer; leaving it '
    + 'out is not.',
  'RULE. If you mark a clarification BLOCKING and bind it to a declaration, the posture may not be '
    + 'CONTINUE.',
  'RULE. requiredControls must be empty when the posture is CONTINUE. If a control is what makes '
    + 'continuation acceptable, the posture is CONTINUE_WITH_CONTROLS.',
  'RULE. Under HOLD_PENDING_VERIFICATION or STOP, no control may carry timing DURING_CONTINUED_WORK, '
    + 'because no work is permitted to continue alongside it.',
  'RULE. resumeCondition must leave both lists empty when the posture is CONTINUE or '
    + 'CONTINUE_WITH_CONTROLS. Work that may continue is not waiting to resume.',
  'RULE. Every reference in establishedConditionsRequiringCessation must be a candidateKey from '
    + 'THIS analysis.',
  'RULE. establishedConditionsRequiringCessation may name only hazard candidates. An unresolved-fact '
    + 'declaration is by definition not established and may not be listed there.',
  'RULE. Anything you list in establishedConditionsRequiringCessation must also appear in '
    + 'requiredBy.',
  'RULE. If establishedConditionsRequiringCessation is not empty, the posture must be STOP.',
];

// ================================================================ the instruction block

export const CESSATION_BLOCK_LINES_235: readonly string[] = [
  'ESTABLISHED CONDITIONS REQUIRING CESSATION, and the rules the analysis is checked against.',
  '',
  `  ${CESSATION_FIELD}`,
  '',
  '    LEAVE IT EMPTY unless the facts as they stand ALREADY require cessation, withdrawal or',
  '    isolation. Empty is the ordinary answer and it is a real one. A hazard can be active,',
  '    serious and properly controlled and belong nowhere on this list.',
  '',
  '    List a candidateKey here only when that candidate\'s CURRENT ESTABLISHED STATE, on its own,',
  '    already requires the work to stop -- independently of anything still being checked, and',
  '    without waiting for any result.',
  '',
  '    A property you must VERIFY before work continues does NOT belong here. That belongs in',
  '    resumeCondition under HOLD_PENDING_VERIFICATION. This list is for what is already true, not',
  '    for what might be.',
  '',
  '  MANUFACTURED UNCERTAINTY.',
  '',
  '    Do not create an unresolved fact in order to delay, weaken or replace a posture that an',
  '    established property already determines. If an established condition on its own requires the',
  '    work to cease, name it above and choose STOP. Asking whether that established condition might',
  '    turn out to be less bad than it looks is not a decision-critical unknown; it is a way of not',
  '    answering.',
  '',
  '    An unresolved fact or a clarification is legitimate ONLY where it addresses a genuinely',
  '    SEPARATE property whose resolution changes what somebody has to do. Where that is the case,',
  '    declare it -- an established stop and a separate open question can both be true, and the stop',
  '    still stands.',
  '',
  '  THE RULES THIS ANALYSIS IS CHECKED AGAINST. Each is refused deterministically.',
  '',
  ...PROVIDER_VISIBLE_RULES_235.map(r => `  ${r}`),
  '',
];

/** Unique in every §226/§233 variant. The §235 block lands immediately before it. */
const POSTURE_ANCHOR_235 = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor235(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_235_ABORT: the anchor appears ${hits.length} times in the §233 system prompt, `
      + 'expected 1. This successor is built by construction from §233 and refuses to load against '
      + 'a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export function build235SystemPrompt(governedSourceIdCount: number): string {
  const base = build233SystemPrompt(governedSourceIdCount);
  if (!base.includes(POSTURE_BLOCK_LINES_233.join('\n'))) {
    throw new Error('FIRST_PASS_235_ABORT: the §233 posture block is not present in the base');
  }
  return insertBeforeUniqueAnchor235(base.split('\n'), POSTURE_ANCHOR_235,
    CESSATION_BLOCK_LINES_235).join('\n');
}

/** Remove the block again. Asserted to reproduce the §233 prompt byte for byte. */
export function reconstruct233SystemPrompt(prompt: string): string {
  const joined = CESSATION_BLOCK_LINES_235.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) {
    throw new Error('FIRST_PASS_235: the cessation block is not present; cannot reconstruct');
  }
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ================================================================ the wire schema
//
// The schema is provider-visible too, so the four rules a model could plausibly follow from the
// field descriptions alone are stated there as well. Each suffix is held in a frozen table so the
// reconstruction can strip it exactly and prove the §233 property is unchanged underneath.

export const SCHEMA_DESCRIPTION_SUFFIXES_235: Readonly<Record<string, string>> = {
  requiredBy: ' A reference may appear in this list OR in acceptedWithoutImmediateAction, never in '
    + 'both. Every ACTIVE candidate and every declaration you emit must appear in one of the two.',
  acceptedWithoutImmediateAction: ' A reference may appear in this list OR in requiredBy, never in '
    + 'both.',
  requiredControls: ' Must be empty when the posture is CONTINUE. Under HOLD_PENDING_VERIFICATION '
    + 'or STOP no control may carry timing DURING_CONTINUED_WORK.',
  resumeCondition: ' Both lists must be empty when the posture is CONTINUE or '
    + 'CONTINUE_WITH_CONTROLS.',
};

export const CESSATION_SCHEMA_PROPERTY_235 = {
  type: 'array',
  description: 'Which of your own hazard candidates are in a state that ALREADY requires cessation, '
    + 'withdrawal or isolation on the facts as they stand, independently of anything still being '
    + 'verified. LEAVE IT EMPTY unless that is true: empty is the ordinary answer and a hazard can '
    + 'be active, serious and properly controlled and belong nowhere here. A property you must '
    + 'verify before work continues belongs in resumeCondition under HOLD_PENDING_VERIFICATION, not '
    + 'here. If this list is not empty the posture must be STOP, and every entry must also appear '
    + 'in requiredBy.',
  items: {
    type: 'object', additionalProperties: false, required: ['ref', 'refKind'],
    properties: {
      ref: { type: 'string', minLength: 1,
        description: 'a candidateKey from THIS analysis' },
      refKind: { type: 'string', enum: ['HAZARD_CANDIDATE'],
        description: 'only a hazard candidate may be listed. An unresolved-fact declaration is by '
          + 'definition not established.' },
    },
  },
} as const;

/** The §235 posture schema property: the §233 property, cloned, plus one field and four suffixes. */
export function build235PostureSchemaProperty(): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233)) as Record<string, any>;
  if (p.properties[CESSATION_FIELD] !== undefined) {
    throw new Error(`FIRST_PASS_235_ABORT: §233 already carries ${CESSATION_FIELD}; base drifted`);
  }
  for (const [k, suffix] of Object.entries(SCHEMA_DESCRIPTION_SUFFIXES_235)) {
    const node = p.properties[k] as Record<string, unknown> | undefined;
    if (node === undefined) {
      throw new Error(`FIRST_PASS_235_ABORT: §233 posture has no property ${k}; base drifted`);
    }
    if (typeof node.description !== 'string') {
      throw new Error(`FIRST_PASS_235_ABORT: §233 ${k} carries no description; base drifted`);
    }
    node.description = `${node.description}${suffix}`;
  }
  p.properties[CESSATION_FIELD] = JSON.parse(JSON.stringify(CESSATION_SCHEMA_PROPERTY_235));
  p.required = [...(p.required as string[]), CESSATION_FIELD];
  return p;
}

/** Remove the addition again. Asserted to reproduce the §233 posture property exactly. */
export function reconstruct233PostureSchemaProperty(
  v235: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v235)) as Record<string, any>;
  delete p.properties[CESSATION_FIELD];
  p.required = (p.required as string[]).filter(r => r !== CESSATION_FIELD);
  for (const [k, suffix] of Object.entries(SCHEMA_DESCRIPTION_SUFFIXES_235)) {
    const node = p.properties[k] as Record<string, unknown>;
    const d = node.description as string;
    if (!d.endsWith(suffix)) {
      throw new Error(`FIRST_PASS_235: ${k} does not end with its §235 suffix; cannot reconstruct`);
    }
    node.description = d.slice(0, d.length - suffix.length);
  }
  return p;
}

export function buildExpert235WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert233WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_235_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build235PostureSchemaProperty();
  return base;
}

/** Remove the addition again. Asserted to reproduce the §233 schema exactly. */
export function reconstruct233WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert235WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct233PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ field inventory
//
// The single source of truth for "which sub-fields does the posture object have". The consistency
// suite checks the schema, the type, the projection and this list agree field for field.

export const POSTURE_SUBFIELDS_235: readonly string[] = [
  'posture', 'requiredBy', 'acceptedWithoutImmediateAction', 'requiredControls',
  'resumeCondition', 'whatHappensNow', CESSATION_FIELD,
];

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities235(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_235,
    cessationField: CESSATION_FIELD,
    postureSubfields: POSTURE_SUBFIELDS_235,
    postures: sha(JSON.stringify(IMMEDIATE_SAFETY_POSTURES_233)),
    refKinds: sha(JSON.stringify(POSTURE_REF_KINDS_233)),
    providerVisibleRules: sha(JSON.stringify(PROVIDER_VISIBLE_RULES_235)),
    cessationBlockLines: sha(CESSATION_BLOCK_LINES_235.join('\n')),
    schemaDescriptionSuffixes: sha(JSON.stringify(SCHEMA_DESCRIPTION_SUFFIXES_235)),
    postureSchemaProperty: sha(JSON.stringify(build235PostureSchemaProperty())),
    systemPromptNoGoverned: sha(build235SystemPrompt(0)),
    systemPromptGoverned: sha(build235SystemPrompt(2)),
  };
}
