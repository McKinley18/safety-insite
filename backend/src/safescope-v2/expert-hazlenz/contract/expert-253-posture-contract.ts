/**
 * §253 -- ALONGSIDE-CONTROL CONTRACT CONSISTENCY CLOSURE. AN ADDITIVE SUCCESSOR TO §247, BUILT BY
 * CONSTRUCTION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §233, §235, §237, §239 and §247 are NOT edited. This module builds its schema from §247 and
 * reduces it back to §247 byte for byte, so the whole chain back to §233 stays reproducible from the
 * tree. That matters concretely here: three frozen packages -- §247, §249 and §252 -- pin the
 * §247 module's SHA-256, and editing it in place would silently falsify all three.
 *
 * ==================== THE CONTRADICTION, AND WHY IT IS A DEFECT ====================
 *
 * §247 shipped two statements about `alongsideControlConsidered` that cannot both be obeyed:
 *
 *   THE TRANSMITTED SCHEMA declares the field `["string","null"]` on the cessation branch and its
 *   description says: "Write null only if the observation states no such control at all."
 *
 *   THE DETERMINISTIC PROJECTION tests the field with `nonEmpty`, which is false for null, and
 *   refuses the whole analysis with CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT.
 *
 * A model that follows the instruction exactly, in the exact case the instruction names, has its
 * analysis refused. §251 observed this; §252 recorded it as a contract consistency defect and,
 * examining only the schema module and the projection, concluded that the frozen contract did not
 * establish which side was intended.
 *
 * ==================== THE ADJUDICATION, FROM THE FROZEN §247 ARTIFACTS ====================
 *
 * It does establish it, in three places §252 did not consult. All three say the same thing.
 *
 *   THE §247 ACCEPTANCE FIXTURE. `test-247-driver-role-and-k6.ts` F1 constructs a cessation driver
 *   whose justification carries `alongsideControlConsidered: null` and
 *   `whyAlongsideControlInsufficient: null`, labels it "a cessation driver that never confronts the
 *   alongside control", and REQUIRES the refusal. The frozen suite therefore reads a null pair as a
 *   confrontation that did not happen, not as a finding that no control exists.
 *
 *   THE §247 DESIGN RECORD. SECTION-247-DRIVER-ROLE-IMPLEMENTATION.md: "A cessation driver must NAME
 *   `alongsideControlConsidered` and `whyAlongsideControlInsufficient`." The same document lists the
 *   four minimum fields and explicitly marks exactly one of them as nullable -- `unresolvedElement`
 *   ("the one open thing, or null"). The two cessation fields are conspicuously not so marked.
 *
 *   THE §247 REPORT. "C5 -- EXPOSED, not prevented. A cessation driver must now NAME the alongside
 *   control it considered and say why it is insufficient."
 *
 * Four frozen artifacts -- fixture, design record, report and projection -- agree. One sentence
 * inside one schema description disagrees. That sentence is the outlier and it is what §253 removes.
 *
 * ==================== AND WHY THE ADJUDICATION IS ALSO THE SAFE ANSWER ====================
 *
 * This is not decided by counting artifacts or by preferring the older one. Admitting null would
 * make the C5 mechanism bypassable.
 *
 * The obligation the field creates is a CONFRONTATION: before a model may say the work must cease, it
 * must state what control it weighed and why that control does not make continued exposure
 * acceptable. If null were admissible, a model could discharge that obligation with two nulls, and
 * deterministic code could never tell "the observation genuinely names no control" from "I did not
 * look" -- because separating those requires reading the observation for meaning, which deterministic
 * code may never do. The escape route would be exactly the one §247 was built to close.
 *
 * Requiring text costs the model nothing it does not already owe. Where the observation names no
 * alongside control, saying so IS the finding, it is checkable by a human against the observation,
 * and it is the model's own assertion rather than a marker deterministic code would have to trust.
 *
 * ==================== WHAT §253 CHANGES, EXACTLY ====================
 *
 * On the CESSATION branch only, two fields stop admitting null and their descriptions say how to
 * express the no-control case in words. Nothing else moves:
 *
 *   the system prompt is BYTE-IDENTICAL -- §253 introduces no prompt builder, and the entry point
 *   goes on calling `build247SystemPrompt`, because the transmitted instruction block never
 *   mentioned null;
 *   no role, no reference kind, no posture, no field and no required list changes;
 *   K6 stays 6 admissible / 0 inadmissible;
 *   the deterministic projection is UNTOUCHED -- it was already correct, and §253 is the repair of
 *   the side that was wrong.
 *
 * NOT ONE PREVIOUSLY ADMISSIBLE OUTPUT BECOMES INADMISSIBLE, and not one previously inadmissible
 * output becomes admissible. The only expressible value removed is one the deterministic layer has
 * refused since §247.
 *
 * ==================== WHAT §253 DELIBERATELY LEAVES ALONE ====================
 *
 * `unresolvedElement` keeps its null. The §247 design record blesses it explicitly, no deterministic
 * rule reads the field, and there is no contradiction to resolve.
 *
 * `dischargingControlRef` keeps its null, and this is a knowingly retained residue rather than an
 * oversight. Its schema admits null and `checkRoleJustification247` refuses it, but its description
 * never invites null, so it is not the contradiction §253 was authorized to close. It is reported
 * for a separate product-owner decision and is NOT repaired here.
 */

import { createHash } from 'crypto';

import type { ExpertAnalysisInput } from '../expert-contract.types';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from './expert-233-posture-contract';
import { POSTURE_DRIVER_ROLES_239 } from './expert-239-posture-contract';
import {
  CESSATION_ROLE_247, FIRST_PASS_CONTRACT_247_VERSION, ROLE_JUSTIFICATION_FIELD,
  DRIVER_ROLE_FIELD_247, buildBasisEntryUnion247, build247PostureSchemaProperty,
  buildExpert247WireSchema, admissiblePairs247,
} from './expert-247-posture-contract';

export const FIRST_PASS_CONTRACT_253_VERSION = 'hazlenz.expert.first-pass.253' as const;

export const BASE_CONTRACT_VERSIONS_253 = {
  justification: FIRST_PASS_CONTRACT_247_VERSION,
} as const;

/** The two fields §253 adjudicates. Held as data so the report cannot overstate the scope. */
export const FIELDS_MADE_NON_NULLABLE_253: readonly string[] =
  ['alongsideControlConsidered', 'whyAlongsideControlInsufficient'];

/** The fields §253 examined and deliberately left nullable, with why. Also data. */
export const NULLABLE_FIELDS_RETAINED_253: readonly {
  readonly field: string; readonly why: string;
}[] = [
  {
    field: 'unresolvedElement',
    why: 'the §247 design record blesses null for this field explicitly ("the one open thing, or '
      + 'null"), no deterministic rule reads it, and the schema and the projection do not disagree '
      + 'about it. There is no contradiction to close.',
  },
  {
    field: 'dischargingControlRef',
    why: 'its schema admits null and checkRoleJustification247 refuses null, but its description '
      + 'never invites null, so it is a different and lesser shape than the contradiction §253 was '
      + 'authorized to resolve. KNOWINGLY RETAINED and reported for a separate decision.',
  },
];

// ================================================================ the two sentences

/** The §247 sentence the adjudication removes. Matched exactly, so a base drift refuses to load. */
export const NULL_SENTENCE_REPLACED_FROM_247 =
  'Write null only if the observation states no such control at all.';

export const ALONGSIDE_SENTENCE_253 =
  'If the observation names no control operating alongside the work, say so here in those words. '
  + 'This field is never empty: a cessation driver has always considered something, even if what it '
  + 'considered was that there was nothing.';

export const WHY_INSUFFICIENT_SENTENCE_REPLACED_FROM_247 =
  'Why that control does not make continued exposure acceptable.';

export const WHY_INSUFFICIENT_SENTENCE_253 =
  'Why that control does not make continued exposure acceptable, or, where the observation names '
  + 'none, why the exposure is unmitigated.';

// ================================================================ the union, built from §247

const cessationBranchOf = (union: Record<string, any>): Record<string, any> => {
  const branches = union.anyOf as Record<string, any>[];
  if (!Array.isArray(branches) || branches.length !== POSTURE_DRIVER_ROLES_239.length) {
    throw new Error('FIRST_PASS_253_ABORT: the §247 union is not the expected shape; base drifted');
  }
  const branch = branches.find(
    b => b.properties?.[DRIVER_ROLE_FIELD_247]?.const === CESSATION_ROLE_247);
  if (branch === undefined) {
    throw new Error('FIRST_PASS_253_ABORT: the §247 union carries no cessation branch; base drifted');
  }
  return branch;
};

export function buildBasisEntryUnion253(): Record<string, unknown> {
  const union = JSON.parse(JSON.stringify(buildBasisEntryUnion247())) as Record<string, any>;
  const j = cessationBranchOf(union).properties[ROLE_JUSTIFICATION_FIELD];

  for (const f of FIELDS_MADE_NON_NULLABLE_253) {
    const node = j.properties[f];
    if (node === undefined) {
      throw new Error(`FIRST_PASS_253_ABORT: §247 carries no ${f}; the base drifted`);
    }
    if (JSON.stringify(node.type) !== JSON.stringify(['string', 'null'])) {
      throw new Error(`FIRST_PASS_253_ABORT: ${f} is not the nullable §247 shape; the base drifted`);
    }
    if (!(j.required as string[]).includes(f)) {
      throw new Error(`FIRST_PASS_253_ABORT: ${f} is not required on the §247 cessation branch`);
    }
    node.type = 'string';
  }

  const a = j.properties.alongsideControlConsidered;
  if (a.description.split(NULL_SENTENCE_REPLACED_FROM_247).length - 1 !== 1) {
    throw new Error('FIRST_PASS_253_ABORT: the §247 null sentence does not appear exactly once; '
      + 'the base drifted');
  }
  a.description = a.description.replace(NULL_SENTENCE_REPLACED_FROM_247, ALONGSIDE_SENTENCE_253);

  const w = j.properties.whyAlongsideControlInsufficient;
  if (w.description.split(WHY_INSUFFICIENT_SENTENCE_REPLACED_FROM_247).length - 1 !== 1) {
    throw new Error('FIRST_PASS_253_ABORT: the §247 insufficiency sentence does not appear exactly '
      + 'once; the base drifted');
  }
  w.description = w.description.replace(
    WHY_INSUFFICIENT_SENTENCE_REPLACED_FROM_247, WHY_INSUFFICIENT_SENTENCE_253);

  return union;
}

/** Remove the addition again. Asserted to reproduce the §247 union exactly. */
export function reconstruct247BasisEntryUnion(u253: Record<string, unknown>): Record<string, unknown> {
  const union = JSON.parse(JSON.stringify(u253)) as Record<string, any>;
  const j = cessationBranchOf(union).properties[ROLE_JUSTIFICATION_FIELD];
  for (const f of FIELDS_MADE_NON_NULLABLE_253) {
    if (j.properties[f].type !== 'string') {
      throw new Error(`FIRST_PASS_253: ${f} is not the §253 shape; cannot reconstruct`);
    }
    j.properties[f].type = ['string', 'null'];
  }
  const a = j.properties.alongsideControlConsidered;
  if (!a.description.includes(ALONGSIDE_SENTENCE_253)) {
    throw new Error('FIRST_PASS_253: the §253 alongside sentence is absent; cannot reconstruct');
  }
  a.description = a.description.replace(ALONGSIDE_SENTENCE_253, NULL_SENTENCE_REPLACED_FROM_247);
  const w = j.properties.whyAlongsideControlInsufficient;
  if (!w.description.includes(WHY_INSUFFICIENT_SENTENCE_253)) {
    throw new Error('FIRST_PASS_253: the §253 insufficiency sentence is absent; cannot reconstruct');
  }
  w.description = w.description.replace(
    WHY_INSUFFICIENT_SENTENCE_253, WHY_INSUFFICIENT_SENTENCE_REPLACED_FROM_247);
  return union;
}

// ================================================================ the schema, built from §247

export function build253PostureSchemaProperty(): Record<string, unknown> {
  const p = build247PostureSchemaProperty() as Record<string, any>;
  if (!Array.isArray(p.properties.requiredBy.items?.anyOf)) {
    throw new Error('FIRST_PASS_253_ABORT: the §247 posture property carries no union; base drifted');
  }
  p.properties.requiredBy.items = buildBasisEntryUnion253();
  return p;
}

export function reconstruct247PostureSchemaProperty(
  v253: Record<string, unknown>,
): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(v253)) as Record<string, any>;
  p.properties.requiredBy.items = reconstruct247BasisEntryUnion(p.properties.requiredBy.items);
  return p;
}

export function buildExpert253WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpert247WireSchema(input, governed)));
  const props = base.properties as Record<string, unknown>;
  if (props[POSTURE_FIELD] === undefined) {
    throw new Error('FIRST_PASS_253_ABORT: the base carries no posture property; base drifted');
  }
  props[POSTURE_FIELD] = build253PostureSchemaProperty();
  return base;
}

export function reconstruct247WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert253WireSchema(input, governed)));
  (v.properties as Record<string, unknown>)[POSTURE_FIELD] =
    reconstruct247PostureSchemaProperty((v.properties as Record<string, any>)[POSTURE_FIELD]);
  return v;
}

// ================================================================ load-time construction guards

/**
 * §253 changes the wire representation of two fields and NOTHING about what the model is asked to
 * decide. Asserted at load so a later edit cannot quietly widen the slice.
 */
export function assertNarrowness253(): void {
  const u247 = buildBasisEntryUnion247() as Record<string, any>;
  const u253 = buildBasisEntryUnion253() as Record<string, any>;
  if (u253.anyOf.length !== u247.anyOf.length) {
    throw new Error('FIRST_PASS_253_ABORT: §253 changed the number of role branches');
  }
  for (let i = 0; i < u247.anyOf.length; i += 1) {
    const a = u247.anyOf[i]; const b = u253.anyOf[i];
    if (JSON.stringify(a.required) !== JSON.stringify(b.required)
      || JSON.stringify(Object.keys(a.properties)) !== JSON.stringify(Object.keys(b.properties))
      || a.properties[DRIVER_ROLE_FIELD_247].const !== b.properties[DRIVER_ROLE_FIELD_247].const
      || JSON.stringify(a.properties.refKind.enum) !== JSON.stringify(b.properties.refKind.enum)) {
      throw new Error('FIRST_PASS_253_ABORT: §253 changed a role, a carrier or a required list');
    }
    const aj = a.properties[ROLE_JUSTIFICATION_FIELD];
    const bj = b.properties[ROLE_JUSTIFICATION_FIELD];
    if (JSON.stringify(aj.required) !== JSON.stringify(bj.required)
      || JSON.stringify(Object.keys(aj.properties)) !== JSON.stringify(Object.keys(bj.properties))
      || JSON.stringify(aj.properties.epistemicCharacter.enum)
        !== JSON.stringify(bj.properties.epistemicCharacter.enum)) {
      throw new Error('FIRST_PASS_253_ABORT: §253 changed a justification field set or vocabulary');
    }
  }
  if (JSON.stringify(reconstruct247BasisEntryUnion(u253)) !== JSON.stringify(u247)) {
    throw new Error('FIRST_PASS_253_ABORT: §253 does not reduce back to §247 byte for byte');
  }
  if (admissiblePairs247().length !== 6) {
    throw new Error('FIRST_PASS_253_ABORT: the admissible pair set is no longer six');
  }
}
assertNarrowness253();

// ================================================================ identity

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function contractIdentities253(): Record<string, unknown> {
  return {
    contractVersion: FIRST_PASS_CONTRACT_253_VERSION,
    baseVersions: BASE_CONTRACT_VERSIONS_253,
    fieldsMadeNonNullable: [...FIELDS_MADE_NON_NULLABLE_253],
    nullableFieldsRetained: NULLABLE_FIELDS_RETAINED_253.map(f => f.field),
    rolesAdded: 0, refKindsAdded: 0, posturesAdded: 0, fieldsAdded: 0, fieldsRemoved: 0,
    requiredListsChanged: 0,
    systemPromptBuilderAdded: 0,
    admissiblePairs: admissiblePairs247().length,
    inadmissibleExpressible: 0,
    basisEntryUnion: sha(JSON.stringify(buildBasisEntryUnion253())),
    postureSchemaProperty: sha(JSON.stringify(build253PostureSchemaProperty())),
    reducesToSection247: true,
  };
}
