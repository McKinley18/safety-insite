/**
 * §218 -- STRUCTURED PROPERTY-SEMANTIC REVIEW: THE CONTRACT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO PRODUCTION.
 *
 * ==================== WHY THIS IS A SCHEMA CHANGE AND NOT ANOTHER PARAGRAPH ====================
 *
 * §216 wrote its own stopping rule into a constant: if a material property-identity failure survived
 * the next confirmation, the answer was to be a structured semantic decision step rather than more
 * instruction text. §217 produced that failure twice, and its adjudication named the mechanism --
 * two frames in one block, both applicable to the same case, and the model picking the wrong one.
 * The `absence IS the adverse state` exception offered an easier frame than the role test and the
 * verifier took it on K1 and K2.
 *
 * A frame that is chosen inside free reasoning cannot be inspected. So property identity stops being
 * something the verifier reasons about on the way to a disposition and becomes something it DECLARES
 * in closed enums, before the disposition, in a field the architecture can read.
 *
 * ==================== BUILT BY CONSTRUCTION FROM THE §212 SCHEMA ====================
 *
 * The §212 schema is v3.2 plus three declaration properties. §218 is that schema plus ONE top-level
 * object. Removing `propertyReview` reproduces the §212 schema byte for byte, `reconstruct212Schema`
 * proves it, and the builder refuses to load against a drifted base. §213, §215 and §217 stay
 * attached to the schema they were executed under and nothing about them moves.
 *
 * ==================== WHAT THE MODEL AUTHORS AND WHAT CODE DOES ====================
 *
 * Every field here is MODEL-AUTHORED. Deterministic code validates the structure, the closed enums
 * and the target identity, and enforces consistency BETWEEN model-authored structured decisions. It
 * does not decide whether something is evidence or a property, does not read the reason text for
 * meaning, and does not reconstruct a property from prose. See `expert-218-property-consistency.ts`,
 * whose whole surface is membership, presence, exact string equality and cross-field pairing.
 *
 * NO PROTOCOL VERSION IS CLAIMED. §201's rule stands: a version number is earned by a preregistered
 * hosted run, and §218 makes none.
 */

import { createHash } from 'crypto';

import { VERIFIER_212_RESPONSE_SCHEMA, VERIFIER_PROTOCOL_212_VERSION } from './expert-212-verifier-protocol';

export const PROPERTY_REVIEW_CONTRACT_218_VERSION =
  'hazlenz.expert.218.property-review-contract.v1' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_ARTIFACT_218 = VERIFIER_PROTOCOL_212_VERSION;

export const PROTOCOL_VERSION_CLAIMED_218 = null;
export const WHY_NO_VERSION_IS_CLAIMED_218: string =
  'a version number is earned by a preregistered hosted run. §218 is an architecture slice and has '
  + 'made none.';

// ---------------------------------------------------------------- the closed sets

/**
 * The semantic role the supplied property plays in the decision. Five members, closed.
 *
 * The set is deliberately shaped so that the two legitimate non-state cases have their OWN members.
 * A single `NOT_A_STATE` member would have made every certificate and every briefing look like the
 * same thing, and the architecture would have degenerated into "all records are evidence proxies" --
 * which is the overcorrection §212, §214 and §216 each had to guard against in prose and which is
 * now guarded by the shape of the enum itself.
 */
export const PROPERTY_SEMANTIC_ROLES_218 = [
  'UNDERLYING_SAFETY_STATE',
  'REQUIRED_ACT_ITSELF',
  'REQUIRED_ARTIFACT_ITSELF',
  'EVIDENCE_FOR_ANOTHER_PROPERTY',
  'AMBIGUOUS_OR_UNRESOLVED',
] as const;
export type PropertySemanticRole218 = (typeof PROPERTY_SEMANTIC_ROLES_218)[number];

/** Whether the SUPPLIED target property is itself the decision-controlling proposition. */
export const PROPERTY_VALIDITIES_218 = ['VALID', 'INVALID', 'UNCERTAIN'] as const;
export type PropertyValidity218 = (typeof PROPERTY_VALIDITIES_218)[number];

/** What each role means, held as data so the suite iterates it rather than trusting a comment. */
export const ROLE_DEFINITIONS_218: Readonly<Record<PropertySemanticRole218, string>> = {
  UNDERLYING_SAFETY_STATE:
    'the owed proposition describes the actual physical, operational, exposure, energy, structural '
    + 'or environmental state the decision turns on -- whether a structure has the capacity, whether '
    + 'an atmosphere is breathable, whether an interlock drops the power',
  REQUIRED_ACT_ITSELF:
    'performance of the act is itself the decision-controlling proposition and there is no separate '
    + 'condition underneath it: the briefing was given, the isolation was applied, the statutory '
    + 'examination was carried out before use. Not to be chosen because the property contains '
    + 'action vocabulary',
  REQUIRED_ARTIFACT_ITSELF:
    'existence, condition or availability of the artifact or document is itself the substantive '
    + 'requirement -- the permit that must be raised before entry, the manifest that must travel '
    + 'with the load. Not to be chosen for every certificate, record or permit automatically',
  EVIDENCE_FOR_ANOTHER_PROPERTY:
    'the proposed property is evidence, a test, a measurement, a certificate, a record, a '
    + 'verification activity, an inspection result, documentation or another proxy used to '
    + 'establish a DIFFERENT underlying decision-controlling property',
  AMBIGUOUS_OR_UNRESOLVED:
    'the verifier cannot responsibly determine the semantic role from what it was supplied. This is '
    + 'not permission to guess and it routes fail closed',
};

/** The counterfactual that separates EVIDENCE_FOR_ANOTHER_PROPERTY from the three that may stand. */
export const EVIDENCE_ROLE_COUNTERFACTUAL: string =
  'Remove the evidence, test or record from the scenario entirely. Could the underlying safety '
  + 'condition still independently be either satisfactory or adverse? If YES, and that underlying '
  + 'condition controls the decision, the proposed proxy is not the owed property -- however useful, '
  + 'however required, however necessary the evidence is.';

export const VALIDITY_DEFINITIONS_218: Readonly<Record<PropertyValidity218, string>> = {
  VALID: 'the supplied target property is semantically appropriate: it is the proposition whose '
    + 'truth decides',
  INVALID: 'the supplied target property is not the decision-controlling proposition',
  UNCERTAIN: 'the verifier cannot establish validity responsibly on what it was supplied',
};

// ---------------------------------------------------------------- the shape

/** The property review, as the model authors it. One per request, for the ONE target. */
export interface PropertyReview218 {
  /** Copied EXACTLY from the declaration id in the fact block. Checked by string equality. */
  readonly targetDeclarationId: string;
  readonly propertySemanticRole: PropertySemanticRole218;
  readonly propertyValidity: PropertyValidity218;
  /**
   * A concise model-authored statement of the proposition actually controlling the safety decision.
   *
   * ADVISORY OUTPUT. It is never promoted to a canonical OwedFact, never settled, and never becomes
   * customer-authoritative truth. See `DECISION_CONTROLLING_PROPERTY_IS_ADVISORY`.
   */
  readonly decisionControllingProperty: string;
  readonly propertyReviewReason: string;
}

export const PROPERTY_REVIEW_FIELDS_218 = [
  'targetDeclarationId', 'propertySemanticRole', 'propertyValidity', 'decisionControllingProperty',
  'propertyReviewReason',
] as const;
export type PropertyReviewField218 = (typeof PROPERTY_REVIEW_FIELDS_218)[number];

/**
 * The limit on the one free-text semantic field, stated in the type system's neighbourhood and
 * asserted by the suite. §212 refused a replacement-property field because it would turn the
 * verifier into a second unrestricted first pass; §218 does not reopen that. The difference is that
 * this field is REVIEWABILITY output -- it exists so the model must separate the fact it is looking
 * at from the proposition it believes decides -- and nothing consumes it.
 */
export const DECISION_CONTROLLING_PROPERTY_IS_ADVISORY = {
  becomesAnOwedFact: false,
  isSettled: false,
  reachesCustomerAuthoritativeTruth: false,
  isParsedForMeaningByDeterministicCode: false,
  mayInjectASiblingFact: false,
  existsFor: ['human review', 'diagnosis', 'downstream controlled remediation',
    'future architecture work if separately authorized'] as readonly string[],
  whyItIsNotTheSection212RefusedField:
    '§212 refused a REPLACEMENT PROPERTY the architecture would consume. This is a statement the '
    + 'architecture reads only to a human. Nothing constructs, binds, projects or settles from it, '
    + 'and the suite asserts that no §218 module imports a fact constructor.',
} as const;

// ---------------------------------------------------------------- the schema property

/** The one property added to the §212 schema. Held as data so the diff is assertable. */
export const PROPERTY_REVIEW_SCHEMA_PROPERTY = {
  type: 'object',
  additionalProperties: false,
  required: [...PROPERTY_REVIEW_FIELDS_218],
  description: 'ANSWER THIS BEFORE YOU CHOOSE A VERDICT. Whether the property you were given is the '
    + 'proposition whose truth decides the safety question, or something else -- most often the '
    + 'evidence for it. Always required; there is no null.',
  properties: {
    targetDeclarationId: {
      type: 'string',
      description: 'The declaration id of the fact under review, copied EXACTLY from the fact '
        + 'block. Checked by string equality against the id you were given.',
    },
    propertySemanticRole: {
      type: 'string',
      enum: [...PROPERTY_SEMANTIC_ROLES_218],
      description: 'The role the SUPPLIED property plays in the decision. '
        + 'EVIDENCE_FOR_ANOTHER_PROPERTY where it is a test, measurement, certificate, record, '
        + 'inspection result or other proxy for a different underlying property. '
        + 'REQUIRED_ACT_ITSELF and REQUIRED_ARTIFACT_ITSELF where the doing or the artifact IS the '
        + 'requirement, with no separate condition underneath. Decide on the ROLE, never on the '
        + 'words used.',
    },
    propertyValidity: {
      type: 'string',
      enum: [...PROPERTY_VALIDITIES_218],
      description: 'Whether the supplied target property is itself the decision-controlling '
        + 'proposition. INVALID when it is not. UNCERTAIN when you cannot establish it '
        + 'responsibly -- which is a fail-closed answer and not a soft one.',
    },
    decisionControllingProperty: {
      type: 'string',
      description: 'One phrase naming the proposition you take to actually control this safety '
        + 'decision. Where the supplied property is right this may restate it. Where it is evidence, '
        + 'name the underlying property the evidence would help establish. It concerns THIS target '
        + 'only and is never a route to raise another issue. It is advisory: it is read by a person '
        + 'and it does not become a fact.',
    },
    propertyReviewReason: {
      type: 'string',
      description: 'One or two sentences a reviewer can act on, saying why the role and the '
        + 'validity are what you said.',
    },
  },
} as const;

export const ADDED_TOP_LEVEL_PROPERTIES_218: readonly string[] = ['propertyReview'];

export function buildVerifier218ResponseSchema(): Record<string, unknown> {
  const out = JSON.parse(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA));
  if (out.properties === undefined || out.properties.owedFactDeclarations === undefined) {
    throw new Error('VERIFIER_218_ABORT: the §212 schema carries no owedFactDeclarations node; '
      + 'base drifted');
  }
  for (const name of ADDED_TOP_LEVEL_PROPERTIES_218) {
    if (out.properties[name] !== undefined) {
      throw new Error(`VERIFIER_218_ABORT: the §212 schema already carries ${name}; base drifted`);
    }
  }
  out.properties.propertyReview = JSON.parse(JSON.stringify(PROPERTY_REVIEW_SCHEMA_PROPERTY));
  out.required = [...out.required, ...ADDED_TOP_LEVEL_PROPERTIES_218];
  return out;
}

export const VERIFIER_218_RESPONSE_SCHEMA = buildVerifier218ResponseSchema();

/** Remove the property again. Asserted to reproduce the §212 schema exactly. */
export function reconstruct212Schema(): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA));
  for (const name of ADDED_TOP_LEVEL_PROPERTIES_218) delete v.properties[name];
  v.required = (v.required as string[]).filter(r => !ADDED_TOP_LEVEL_PROPERTIES_218.includes(r));
  return v;
}

// ---------------------------------------------------------------- identity and grammar cost

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

function countNodes(node: unknown): { nodes: number; enums: number; enumMembers: number } {
  let nodes = 0; let enums = 0; let enumMembers = 0;
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (typeof n !== 'object' || n === null) return;
    nodes += 1;
    const o = n as Record<string, unknown>;
    if (Array.isArray(o.enum)) { enums += 1; enumMembers += o.enum.length; }
    for (const v of Object.values(o)) walk(v);
  };
  walk(node);
  return { nodes, enums, enumMembers };
}

/**
 * §201's discipline: NO ADDITION MAY BE DESCRIBED AS CHEAP ON BYTES ALONE. §199 was refused at the
 * transport on compiled grammar complexity with a serialised size that looked acceptable, so nodes,
 * enums and enum members are reported beside the bytes.
 */
export function schemaAccounting218(): Record<string, unknown> {
  const base = JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA);
  const next = JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA);
  const b = countNodes(VERIFIER_212_RESPONSE_SCHEMA);
  const n = countNodes(VERIFIER_218_RESPONSE_SCHEMA);
  return {
    baseArtifact: BASE_ARTIFACT_218,
    successorArtifact: PROPERTY_REVIEW_CONTRACT_218_VERSION,
    protocolVersionClaimed: PROTOCOL_VERSION_CLAIMED_218,
    baseSha256: sha256(base),
    successorSha256: sha256(next),
    baseBytes: base.length,
    successorBytes: next.length,
    addedBytes: next.length - base.length,
    baseNodes: b.nodes,
    successorNodes: n.nodes,
    addedNodes: n.nodes - b.nodes,
    baseEnums: b.enums,
    successorEnums: n.enums,
    addedEnums: n.enums - b.enums,
    baseEnumMembers: b.enumMembers,
    successorEnumMembers: n.enumMembers,
    addedEnumMembers: n.enumMembers - b.enumMembers,
    grammarCostCaveat: 'the provider\'s stated metric is COMPILED GRAMMAR COMPLEXITY and the '
      + 'threshold is undocumented. Two enums of five and three members expand well beyond their '
      + 'serialised length. The verifier request remains far smaller than the first-pass request '
      + 'that was refused at ~19,060 bytes, and that headroom is the reason this is proposed rather '
      + 'than a claim that it will pass.',
  };
}

export { sha256 as sha256Of };
