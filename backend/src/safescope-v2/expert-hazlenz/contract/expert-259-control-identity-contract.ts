/**
 * §259 -- CONTROL IDENTITY. THE ADDITIVE SUCCESSOR TO §253.
 *
 * ==================== THE ONE THING THIS CHANGES ====================
 *
 * Until §259 a required control had no identity. `RequiredControl233` is `{ control, timing }`, so
 * the ONLY way to name a control was to reproduce its prose, and `dischargingControlRef` therefore
 * demanded "the exact `control` text from your own requiredControls". `checkRoleJustification247`
 * adjudicated that with trim-normalized exact string equality.
 *
 * §254 H4 is what that costs. The model authored one control:
 *
 *   "Supervisor or permit issuer to track progress against the 15:30 planned finish and confirm
 *    before 16:00 whether work is complete, needs extension, or must cease"
 *
 * and referred to it as:
 *
 *   "Monitor progress against the 15:30 planned finish time and ensure hot work ceases or is
 *    re-authorised before the 16:00 permit expiry"
 *
 * Same action, same two clock times, same three outcomes. The binding was substantively present and
 * the analysis was refused on spelling.
 *
 * §259 gives the control an identifier and makes the reference point at it. The model authors the
 * control once. Identity belongs to the structure.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * This is NOT a relaxation of M8. The invariant is unchanged and is enforced exactly as strictly:
 * a controls driver must still bind to a control that actually exists in this analysis, a
 * nonexistent reference is still refused, and a reference to the WRONG control is still refused.
 * What changes is that the binding is resolved by identifier rather than by string equality over
 * prose. No similarity, fuzzy, normalized-prose or semantic-equivalence test is introduced anywhere,
 * and deterministic code still reads no meaning out of natural language.
 *
 * Two new refusal conditions ARE added, both fail-closed and both consequences of introducing an
 * identifier: a control with no `controlId`, and two controls sharing one `controlId`. A duplicate
 * id would make a reference ambiguous, and an ambiguous safety reference is refused rather than
 * resolved to whichever came first.
 *
 * ==================== SHAPE ====================
 *
 * Exactly the §253-over-§247 shape: clone the predecessor, mutate one sub-object, guard the base
 * against drift, and provide an inverse that reduces back byte for byte.
 */

import { createHash } from 'crypto';

import type { ExpertAnalysisInput } from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from './expert-233-posture-contract';
import { ROLE_JUSTIFICATION_FIELD, build247SystemPrompt } from './expert-247-posture-contract';
import {
  FIRST_PASS_CONTRACT_253_VERSION, build253PostureSchemaProperty, buildExpert253WireSchema,
} from './expert-253-posture-contract';

export const FIRST_PASS_CONTRACT_259_VERSION = 'hazlenz.expert.first-pass.259' as const;

export const BASE_CONTRACT_VERSIONS_259 = {
  controlIdentity: FIRST_PASS_CONTRACT_253_VERSION,
} as const;

/** The identifier field §259 adds to every required control. Named once so nothing spells it twice. */
export const CONTROL_ID_FIELD_259 = 'controlId' as const;

/** What §259 changes, as data, so a report cannot overstate the scope. */
export const CHANGES_259: readonly { readonly change: string; readonly kind: string }[] = [
  { change: `required ${CONTROL_ID_FIELD_259} on each requiredControls item`, kind: 'SCHEMA' },
  { change: 'dischargingControlRef references a controlId, not control prose', kind: 'SCHEMA' },
  { change: 'the controls-driver sentence names the controlId', kind: 'INSTRUCTION' },
];

// ================================================================ the two sentences replaced

/** The §247 schema sentence §259 replaces. Matched exactly, so a base drift refuses to load. */
export const CONTROL_REF_DESCRIPTION_247 =
  'REQUIRED ON A CONTROLS DRIVER. The exact `control` text from your own '
  + 'requiredControls that discharges THIS entry. Restating an existing written procedure '
  + 'that the observation says is already in force does not discharge anything.';

export const CONTROL_REF_DESCRIPTION_259 =
  `REQUIRED ON A CONTROLS DRIVER. The ${CONTROL_ID_FIELD_259} of the entry in your own `
  + 'requiredControls that discharges THIS entry. Name the identifier, not the control text. '
  + 'Restating an existing written procedure that the observation says is already in force does '
  + 'not discharge anything.';

/** The §247 prompt line §259 replaces. One line; the two that follow it are untouched. */
export const CONTROL_PROMPT_LINE_247 =
  'ON A CONTROLS DRIVER you must name dischargingControlRef: the exact control text from your own';

export const CONTROL_PROMPT_LINE_259 =
  `ON A CONTROLS DRIVER you must name dischargingControlRef: the ${CONTROL_ID_FIELD_259} of the `
  + 'entry in your own';

/** The description carried by the new identifier property. */
export const CONTROL_ID_DESCRIPTION_259 =
  'A short identifier you assign to THIS control, unique within this response, so other parts of '
  + 'the analysis can refer to it without repeating its wording. Any stable short string is fine.';

// ================================================================ the schema

export function build259PostureSchemaProperty(): Record<string, unknown> {
  const p = build253PostureSchemaProperty() as Record<string, any>;

  const controls = p.properties?.requiredControls;
  if (!controls || controls.type !== 'array' || !controls.items
    || controls.items.properties?.control === undefined) {
    throw new Error('FIRST_PASS_259_ABORT: the §253 posture property carries no requiredControls '
      + 'item with a control; base drifted');
  }
  if (controls.items.properties[CONTROL_ID_FIELD_259] !== undefined) {
    throw new Error('FIRST_PASS_259_ABORT: the base already carries a controlId; base drifted');
  }
  controls.items.properties[CONTROL_ID_FIELD_259] = {
    type: 'string', minLength: 1, description: CONTROL_ID_DESCRIPTION_259,
  };
  controls.items.required = [CONTROL_ID_FIELD_259, ...controls.items.required];

  const branches = p.properties?.requiredBy?.items?.anyOf;
  if (!Array.isArray(branches)) {
    throw new Error('FIRST_PASS_259_ABORT: the §253 posture property carries no union; base drifted');
  }
  let retargeted = 0;
  for (const b of branches) {
    const ref = b?.properties?.[ROLE_JUSTIFICATION_FIELD]?.properties?.dischargingControlRef;
    if (ref === undefined) continue;
    if (ref.description !== CONTROL_REF_DESCRIPTION_247) {
      throw new Error('FIRST_PASS_259_ABORT: the dischargingControlRef description is not the §247 '
        + 'sentence; base drifted');
    }
    ref.description = CONTROL_REF_DESCRIPTION_259;
    retargeted += 1;
  }
  if (retargeted === 0) {
    throw new Error('FIRST_PASS_259_ABORT: no branch carried dischargingControlRef; base drifted');
  }
  return p;
}

/** Remove the addition again. Asserted to reproduce the §253 property byte for byte. */
export function reconstruct253PostureSchemaProperty(
  v259: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v259)) as Record<string, any>;
  const items = p.properties.requiredControls.items;
  delete items.properties[CONTROL_ID_FIELD_259];
  items.required = items.required.filter((r: string) => r !== CONTROL_ID_FIELD_259);
  for (const b of p.properties.requiredBy.items.anyOf) {
    const ref = b?.properties?.[ROLE_JUSTIFICATION_FIELD]?.properties?.dischargingControlRef;
    if (ref !== undefined) ref.description = CONTROL_REF_DESCRIPTION_247;
  }
  return p;
}

export function buildExpert259WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert253WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_259_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build259PostureSchemaProperty();
  return base;
}

export function reconstruct253WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert259WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct253PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ the instruction

/**
 * The §247 prompt with ONE line replaced. The deterministic rule and the provider-visible
 * instruction must state the same rule in both directions, so retargeting the field without
 * retargeting the sentence would reintroduce the §253 class of contradiction in a new place.
 */
export function build259SystemPrompt(governedSourceIdCount: number): string {
  const base = build247SystemPrompt(governedSourceIdCount);
  if (!base.includes(CONTROL_PROMPT_LINE_247)) {
    throw new Error('FIRST_PASS_259_ABORT: the §247 controls-driver line is absent; base drifted');
  }
  if (base.split(CONTROL_PROMPT_LINE_247).length !== 2) {
    throw new Error('FIRST_PASS_259_ABORT: the §247 controls-driver line is not unique');
  }
  return base.replace(CONTROL_PROMPT_LINE_247, CONTROL_PROMPT_LINE_259);
}

/** Remove the substitution again. Asserted to reproduce the §247 prompt byte for byte. */
export function reconstruct247SystemPrompt(v259: string): string {
  if (!v259.includes(CONTROL_PROMPT_LINE_259)) {
    throw new Error('FIRST_PASS_259: the §259 line is absent; cannot reconstruct');
  }
  return v259.replace(CONTROL_PROMPT_LINE_259, CONTROL_PROMPT_LINE_247);
}

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities259(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_259_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_259,
    controlIdField: CONTROL_ID_FIELD_259,
    controlIdDescription: sha(CONTROL_ID_DESCRIPTION_259),
    dischargingControlRefDescription: sha(CONTROL_REF_DESCRIPTION_259),
    controlsDriverPromptLine: sha(CONTROL_PROMPT_LINE_259),
    changes: sha(JSON.stringify(CHANGES_259)),
  };
}

// ================================================================ load-time construction guards

/**
 * §259 changes how a control is NAMED and nothing about what the model is asked to decide. Asserted
 * at load so a later edit cannot quietly widen the slice.
 */
export function assertNarrowness259(): void {
  const p253 = build253PostureSchemaProperty() as Record<string, any>;
  const p259 = build259PostureSchemaProperty() as Record<string, any>;

  if (JSON.stringify(Object.keys(p253.properties)) !== JSON.stringify(Object.keys(p259.properties))) {
    throw new Error('FIRST_PASS_259_ABORT: §259 added or removed a posture member');
  }
  if (JSON.stringify(p253.required) !== JSON.stringify(p259.required)) {
    throw new Error('FIRST_PASS_259_ABORT: §259 changed the posture required list');
  }
  const a253 = p253.properties.requiredBy.items.anyOf;
  const a259 = p259.properties.requiredBy.items.anyOf;
  if (a253.length !== a259.length) {
    throw new Error('FIRST_PASS_259_ABORT: §259 changed the number of role branches');
  }
  for (let i = 0; i < a253.length; i += 1) {
    if (JSON.stringify(a253[i].properties.refKind.enum)
      !== JSON.stringify(a259[i].properties.refKind.enum)) {
      throw new Error('FIRST_PASS_259_ABORT: §259 changed a carrier vocabulary');
    }
    const j253 = a253[i].properties[ROLE_JUSTIFICATION_FIELD];
    const j259 = a259[i].properties[ROLE_JUSTIFICATION_FIELD];
    if (JSON.stringify(j253.required) !== JSON.stringify(j259.required)
      || JSON.stringify(Object.keys(j253.properties)) !== JSON.stringify(Object.keys(j259.properties))) {
      throw new Error('FIRST_PASS_259_ABORT: §259 changed a justification field set');
    }
  }
  const c259 = p259.properties.requiredControls.items;
  if (JSON.stringify(Object.keys(c259.properties).sort())
    !== JSON.stringify([CONTROL_ID_FIELD_259, 'control', 'timing'].sort())) {
    throw new Error('FIRST_PASS_259_ABORT: §259 changed the control item beyond adding an id');
  }
  if (JSON.stringify(reconstruct253PostureSchemaProperty(p259)) !== JSON.stringify(p253)) {
    throw new Error('FIRST_PASS_259_ABORT: §259 does not reduce back to §253 byte for byte');
  }
  const s247 = build247SystemPrompt(0);
  if (reconstruct247SystemPrompt(build259SystemPrompt(0)) !== s247) {
    throw new Error('FIRST_PASS_259_ABORT: the §259 prompt does not reduce back to §247');
  }
  if (build259SystemPrompt(0).length === s247.length
    && build259SystemPrompt(0) === s247) {
    throw new Error('FIRST_PASS_259_ABORT: the §259 prompt made no change');
  }
}
assertNarrowness259();
