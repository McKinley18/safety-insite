/**
 * EXPERT HAZLENZ -- the FORMAL NEGATIVE-CONTROL AUGMENTATION construction policy. §125.
 *
 * ==================== FROZEN BEFORE A SINGLE CASE WAS AUTHORED ====================
 *
 * Written and hashed BEFORE any of the sixteen rows existed. That ordering is the whole safeguard: a
 * construction rule written after the cases would be a description of what was already produced.
 *
 * ==================== THE PURPOSE IS COVERAGE, NOT CHALLENGE ====================
 *
 * This corpus exists to supply DENOMINATOR, not difficulty. §124 established the arithmetic: the
 * frozen `FORBIDDEN_FAMILY_NEGATIVE_CONTROL` requirement is 48, all authorized non-retired material
 * yields 43, and the shortfall is 5. These rows close that gap and nothing else.
 *
 * They are NOT authored to be hard, to probe a weakness, or to produce any particular result. A row
 * written to make a model fail is a row that measures the author's imagination rather than the
 * model, and it would corrupt every measure it touched. Where a choice arises between a case that is
 * more discriminating and one that is more ORDINARY, this policy takes the ordinary one.
 *
 * ==================== WHAT MAY AND MAY NOT INFORM A CASE ====================
 *
 * MAY:  the frozen Expert taxonomy; authoritative deterministic hazard families; existing production
 *       safety semantics; the governed regulation taxonomy; established negated / safe / resolved
 *       state semantics; the cohort row schema; the frozen truth-precedence rules.
 *
 * MAY NOT: any provider output; §104-§119 wording; observed provider failures; scorer results;
 *       anticipated pass/fail outcomes. This module imports no provider, no probe artifact and no
 *       run record, so the prohibition is structural rather than promised.
 *
 * ==================== THE NEGATIVE-CONTROL RULE, AND ITS ONE HARD LIMIT ====================
 *
 * A family is FORBIDDEN on a row only when the case semantics affirmatively rule it out. Absence is
 * NOT a reason -- §124's authorization says so in as many words, and it is the difference between a
 * negative control and a guess.
 *
 * In practice each forbidden family must have a LURE in the observation: language that could tempt a
 * reader toward that family, together with the fact that defeats it. "A forklift was parked and shut
 * off against the far wall" lures `mobile_equipment` and defeats it in the same clause. A family
 * that is simply not mentioned at all is DEFENSIBLE, never forbidden.
 *
 * Every forbidden family therefore carries a short machine-auditable rationale naming the defeating
 * fact. A rationale that reduces to "not mentioned" is invalid and the validator rejects it.
 */

export const AUGMENTATION_POLICY_VERSION = 'hazlenz.expert.augmentation.policy.v1' as const;

export const AUGMENTATION_TARGET = {
  identifier: 'FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1',
  rows: 16,
  minimumNegativeControlOpportunities: 10,
  purpose: 'Close the frozen 48-opportunity negative-control requirement, which stands at 43 from '
    + 'all authorized non-retired material (§124). COVERAGE ONLY.',
  notThePurpose: [
    'Not model challenge. No row is authored to be difficult.',
    'Not a replacement for the reserved offsets -- this is additional source material.',
    'Not itself the final cohort. It is one input to the 60-row assembly.',
  ],
} as const;

/** The frozen seven-family Expert taxonomy. NOT widened by this policy. */
export const AUGMENTATION_TAXONOMY: readonly string[] = [
  'chemical_exposure', 'confined_space', 'electrical', 'fall_protection',
  'lockout_tagout', 'machine_guarding', 'mobile_equipment',
];

/**
 * The required distribution. Categories may overlap within a row, and NO row is required to carry
 * every property -- forcing that would produce the unnatural density this policy exists to avoid.
 */
export const REQUIRED_DISTRIBUTION: Readonly<Record<string, number>> = {
  ROWS_WITH_FORBIDDEN_FAMILY_TRUTH: 10,
  SAFE_RESOLVED_OR_NEGATED: 4,
  ACTIVE_HAZARD: 4,
  MULTI_FAMILY_OR_SIBLING_ROUTING: 4,
  CLARIFICATION_NOT_OWED: 4,
  CLARIFICATION_OWED: 2,
  GOVERNED_RECORD_MATCHABLE: 4,
};

/**
 * Realism rules. These are what keep the rows field-plausible rather than scorer-shaped.
 */
export const REALISM_RULES: readonly string[] = [
  'Each observation reads as something a safety professional would actually type after a walkthrough '
    + '-- a couple of sentences, concrete, with the incidental detail real notes carry.',
  'No row may name a hazard family, a measure id, a condition state, or any evaluation vocabulary.',
  'No row may be constructed by listing properties and then writing text to satisfy them. The '
    + 'observation comes first; the truth key is read off the observation.',
  'A lure must be a natural part of the scene, not a planted decoy. Equipment that would plausibly '
    + 'be in that room is a lure; equipment dragged in to create a forbidden family is not.',
  'Ordinary outcomes are permitted and expected. A row where nothing much is wrong is a legitimate '
    + 'and necessary case, not a wasted one.',
];

/** Provenance labels, one per truth field, under the frozen precedence rules. */
export const TRUTH_PROVENANCE_LABELS: readonly string[] = [
  'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH',
  'LEVEL_1_DERIVED_FROM_TAXONOMY_PARTITION',
  'LEVEL_1_DETERMINISTIC_ENGINE_OUTPUT',
  'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT',
];

/** Things this policy forbids itself, checkable against the code. */
export const AUGMENTATION_PROHIBITIONS: readonly string[] = [
  'No forbidden family without a defeating fact stated in the observation.',
  'No family marked forbidden merely because it is absent.',
  'toExpertFamily is not widened and the taxonomy is not extended.',
  'No threshold, disposition, scorer or measurement-contract field is changed.',
  'No retired material is read, quoted, paraphrased or used as a template.',
  'No row is authored, edited or reclassified in response to any provider output -- none exists.',
  'After seal, row semantics and truth keys are immutable.',
];
