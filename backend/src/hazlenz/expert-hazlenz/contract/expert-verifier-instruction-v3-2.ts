/**
 * §194 EXPERT HAZLENZ -- VERIFIER INSTRUCTION v3.2. STRUCTURED REGULATORY BASIS.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== WHY v3.2 AND NOT AN EDIT TO v3.1 ====================
 *
 * v1, v2, v3 and now v3.1 are all byte-unchanged. §192's thirty-nine executions are attached to v3.1
 * at prompt sha256 7e73d175… and schema sha256 d39c86bc…, which §192's preregistration pins and the
 * §192/§193 integrity gates assert. This change touches the PROMPT and the SCHEMA, so it is a
 * protocol change and gets its own prospective version, exactly as §191 did for v3 -> v3.1.
 *
 * BUILT BY CONSTRUCTION FROM v3.1: the prompt is v3.1's own line array with ONE block inserted at a
 * named anchor, and the schema is a structural clone of v3.1's with ONE property added. Removing the
 * block and the property reproduces v3.1 byte-identically, and the module refuses to load against a
 * drifted base.
 *
 * ==================== THE PROBLEM v3.2 SOLVES ====================
 *
 * §193 established that the instruction's blanket prohibition -- "you may not cite or quote a
 * regulation", with a fail-closed discard claim -- cannot be enforced for a regulatory proposition
 * asserted in PROSE. §192 FV-07 wrote "OSHA general industry requires the work rest ... not
 * exceeding 1/8 inch" with no citation string, and no deterministic rule separates that from the
 * legitimate reasoning about the ABSENCE of governed evidence seen on FV-11 and FV-13.
 *
 * The resolution is not a better matcher. It is to give regulatory reliance a LEGITIMATE STRUCTURED
 * ROUTE, so that reliance becomes something the provider DECLARES and the architecture VALIDATES,
 * rather than something a regex tries to infer from arbitrary prose.
 *
 * ==================== THE CANONICAL MECHANISM, REUSED NOT INVENTED ====================
 *
 * Nothing here is new architecture. Two existing patterns are combined:
 *
 *   1. `ExpertVerifierInput.governedEvidence: { sourceId, text }[]` -- the verifier contract has
 *      ALWAYS carried governed evidence keyed by `sourceId`, "as supplied to the first pass. Never
 *      re-fetched, never re-selected."
 *   2. The FIRST PASS already binds model claims to those identifiers: `expert-prompt.ts:1055`
 *      enumerates the supplied `sourceId`s and `expert-normalization.ts:263` refuses
 *      `EVIDENCE_SOURCE_UNKNOWN` for anything else.
 *
 * v3.2 applies pattern 2 to the verifier path, using the closed-set-membership-by-exact-string-
 * equality discipline v3 already uses for `bindingFactKey` against `suppliedOwedFactKeys`.
 *
 * A NOTE ON THE ALTERNATIVE: the first pass enumerates its sourceIds INTO THE SCHEMA as an enum,
 * which makes an invented id provider-side invalid. That was considered and NOT taken, because it
 * makes the schema per-request and the verifier protocol's identity hash would stop being a single
 * value -- and §187-§192 have shown how much depends on a stable protocol hash. The same guarantee
 * is obtained deterministically at admission instead, which is what v3 already does for
 * `bindingFactKey`.
 *
 * ==================== WHAT THIS DOES NOT CLAIM ====================
 *
 * Structural binding establishes that the provider DECLARED reliance, that every referenced id
 * EXISTS in the supplied governed evidence, and that the contract state is legal. It does NOT
 * establish that the proposition faithfully paraphrases the source, that the source supports every
 * word, or that any legal conclusion is correct. Those are semantic axes and stay separate.
 * Structural source binding is NOT legal validation.
 */

import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3, buildVerifierV3UserPrompt,
  type OwedFactDeclarationV3, type ClarificationSourceModeV3, type V3SuppliedOwedFact,
} from './expert-verifier-instruction-v3-1';

export const EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION =
  'hazlenz.expert.verifier-instruction.v3.2' as const;

export {
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3, buildVerifierV3UserPrompt,
};
export type { OwedFactDeclarationV3, ClarificationSourceModeV3, V3SuppliedOwedFact };

/** The two states. `NONE` is the normal one and the prompt says so. */
export const REGULATORY_RELIANCE_MODES = ['NONE', 'SUPPLIED_GOVERNED_EVIDENCE'] as const;
export type RegulatoryRelianceMode = (typeof REGULATORY_RELIANCE_MODES)[number];

export interface RegulatoryBasis {
  readonly reliance: RegulatoryRelianceMode;
  /** Closed set: every id must appear in the supplied governedEvidence. Empty when NONE. */
  readonly sourceIds: readonly string[];
  /** What the verifier takes those sources to establish. Null when NONE. */
  readonly proposition: string | null;
}

/**
 * The inserted block. Placed at the END OF STEP 6, after the owed-fact bookkeeping and before the
 * question-quality paragraph, because it is a second accounting obligation of the same kind: an
 * explicit declaration covering something the verdict might otherwise leave implicit.
 */
export const REGULATORY_BASIS_LINES: readonly string[] = [
  '',
  '7. NOW DECLARE WHETHER YOU LEANED ON A REGULATION.',
  '',
  '   This is bookkeeping like step 6, and like step 6 the usual answer is the quiet one.',
  '',
  '   >>> NONE IS THE NORMAL ANSWER. Almost every verification is decided by what the observation',
  '   >>> does and does not establish, and needs no regulation at all. Declaring NONE is not an',
  '   >>> admission of weakness and it is not second best.',
  '',
  '   Declare NONE unless YOUR OWN reasoning introduces or materially depends on a regulatory',
  '   proposition -- a claim about what a regulation, standard or code REQUIRES, PERMITS or',
  '   PROHIBITS. Three things that are NOT that, and must still be NONE:',
  '     - naming the jurisdiction you were given, or repeating context you were supplied;',
  '     - observing that no governed evidence was supplied, or that a question turns on a rule',
  '       nobody has given you. Saying "I cannot tell, because the applicable interval was never',
  '       stated" is exactly right and is NONE;',
  '     - describing what the workplace record says about its own inspections or certificates.',
  '',
  '   If you DO rely on a regulatory proposition, declare SUPPLIED_GOVERNED_EVIDENCE and name the',
  '   sourceId of every piece of governed evidence you relied on, copied EXACTLY from the evidence',
  '   you were given, plus one sentence saying what you take those sources to establish.',
  '',
  '   YOU MAY ONLY RELY ON GOVERNED EVIDENCE THAT WAS SUPPLIED TO YOU. An id you invent, abbreviate',
  '   or respell is not an id, and a verdict carrying one is discarded whole. You have no other way',
  '   to invoke a regulation: writing a citation into your prose does not authorise anything, and a',
  '   verdict containing a citation-shaped string ANYWHERE in its free text is discarded whole.',
  '',
  '   IF NO SUPPLIED GOVERNED EVIDENCE SUPPORTS THE PROPOSITION, YOU MAY NOT RELY ON IT. Reason from',
  '   the observation instead, or say the fact cannot be settled on what you were given. Do not',
  '   supply the rule from memory.',
];

const ANCHOR = '   exactly where it was, however closely related the two sound.';

function insertAfterUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `v3.2 ABORT: the step-6 anchor appears ${hits.length} times in the v3.1 prompt, expected 1. `
      + 'v3.2 is built by construction from v3.1 and refuses to load against a drifted base.');
  }
  return [...lines.slice(0, hits[0] + 1), ...block, ...lines.slice(hits[0] + 1)];
}

export const EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT: string =
  insertAfterUniqueAnchor(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT.split('\n'), ANCHOR,
    REGULATORY_BASIS_LINES).join('\n');

/** The one property added to the v3.1 schema. Recorded as data so the diff can be asserted. */
export const REGULATORY_BASIS_SCHEMA_PROPERTY = {
  type: 'object',
  additionalProperties: false,
  required: ['reliance', 'sourceIds', 'proposition'],
  description: 'Whether YOUR OWN reasoning introduced or materially relied on a regulatory '
    + 'proposition. NONE is the normal answer. Naming a supplied jurisdiction, observing that no '
    + 'governed evidence was supplied, or describing the workplace record are all NONE. Reliance '
    + 'may ONLY be on governed evidence supplied to you, named by its exact sourceId; an invented '
    + 'id is discarded whole, and a citation written into prose authorises nothing.',
  properties: {
    reliance: { type: 'string', enum: ['NONE', 'SUPPLIED_GOVERNED_EVIDENCE'] },
    sourceIds: {
      type: 'array',
      items: { type: 'string' },
      description: 'EMPTY when reliance is NONE. Otherwise the exact sourceId of every supplied '
        + 'governed evidence item relied on, copied character for character.',
    },
    proposition: {
      type: ['string', 'null'],
      description: 'NULL when reliance is NONE. Otherwise one sentence stating what you take those '
        + 'sources to establish. This is reviewed by a person; it is not checked automatically.',
    },
  },
} as const;

function cloneWithRegulatoryBasis(schema: unknown): unknown {
  const out = JSON.parse(JSON.stringify(schema));
  if (out.properties.regulatoryBasis !== undefined) {
    throw new Error('v3.2 ABORT: v3.1 already carries regulatoryBasis; base drifted');
  }
  out.properties.regulatoryBasis = JSON.parse(JSON.stringify(REGULATORY_BASIS_SCHEMA_PROPERTY));
  out.required = [...out.required, 'regulatoryBasis'];
  return out;
}

export const VERIFIER_V3_2_RESPONSE_SCHEMA = cloneWithRegulatoryBasis(VERIFIER_V3_1_RESPONSE_SCHEMA);

export const V3_2_CHANGE_LEDGER = [
  {
    change: 'regulatoryBasis schema property + required entry',
    kind: 'SCHEMA',
    evidence: '§193 — the citation prohibition is unenforceable for prose assertion; a legitimate '
      + 'structured route replaces an inference problem with a declaration',
    testSection: 'B',
  },
  {
    change: 'step 7 regulatory-basis declaration block in the prompt',
    kind: 'INSTRUCTION',
    evidence: '§193 — same finding; the block also names the three NONE cases measured at §192 '
      + '(supplied jurisdiction, absent governed evidence, workplace record)',
    testSection: 'A',
  },
] as const;
