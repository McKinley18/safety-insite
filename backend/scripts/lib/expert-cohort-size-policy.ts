/**
 * EXPERT HAZLENZ -- the AMENDED FORMAL COHORT SIZE POLICY. §134.
 *
 * ==================== WHY THIS IS A NEW FILE AND NOT AN EDIT ====================
 *
 * The original `COHORT_SIZE_POLICY` lives in the sibling `expert-cohort-supplemental-policy.ts`,
 * whose header records that it was written and hashed BEFORE any reserved row content was seen. That
 * file's sha256 -- `cc69d28e…` -- is cited as evidence in TWO immutable opening records: §122's, for
 * `gauntlet.seed`, and §133's, for D-86 offsets 2 and 3. The citation is what proves the eligibility
 * rule predates the material it selected, which is the whole reason a selection rule is frozen first.
 *
 * Editing a size constant inside that file would change its hash. A later verifier comparing the file
 * against either opening record would find a mismatch and would have NO WAY to tell a benign
 * size-policy amendment from a tampered eligibility rule. The provenance proof would be destroyed to
 * save a one-line edit.
 *
 * So the amendment lives here, as an OVERLAY that supersedes two fields and leaves the frozen file
 * byte-identical. This is the same move §125 made when it built the corpus retirement registry rather
 * than amending the frozen evaluation plan, and for the same reason.
 *
 * `assertFrozenOriginUnchanged()` re-reads the superseded values from the frozen module at runtime, so
 * if that file ever does drift this overlay fails loudly instead of silently disagreeing with it.
 *
 * ==================== WHAT CHANGED, AND WHAT DID NOT ====================
 *
 * CHANGED:   targetRows 60 -> 65, hardCeiling 60 -> 65.
 * UNCHANGED: every entry of REQUIRED_CLASS_MINIMUMS; MINIMUM_DEFENSIBLE_ROWS (48); PREFERRED_ROWS
 *            (60); every scorer; every threshold; every measurement-contract field.
 *
 * This is an amendment to a SIZE policy on measured feasibility evidence. It is not a relaxation of
 * anything a model is scored against. No formal evaluation has begun, no gate has been attempted, and
 * no measure moved -- which is the distinction that makes this legitimate rather than convenient.
 */

import { COHORT_SIZE_POLICY as FROZEN_ORIGIN_POLICY } from './expert-cohort-supplemental-policy';

export const COHORT_SIZE_POLICY_VERSION = 'hazlenz.expert.cohort.size.policy.v2' as const;

/**
 * The superseded policy, recorded here so the amendment is legible without going and reading a
 * frozen file, and so `assertFrozenOriginUnchanged()` has something to compare against.
 */
export const SUPERSEDED_COHORT_SIZE_POLICY_V1 = {
  version: 'hazlenz.expert.cohort.supplemental.policy.v1 (COHORT_SIZE_POLICY)',
  targetRows: 60,
  hardCeiling: 60,
  minimumDefensibleRows: 48,
  supersededAt: '2026-09-01',
  supersededBy: 'hazlenz.expert.cohort.size.policy.v2',
  status: 'HISTORICAL -- preserved, still the authority for every analysis performed before the '
    + 'amendment (§121, §122, §126, §130, §131, §132, §133). Re-running those analyses must still '
    + 'reproduce their recorded output, so they continue to read the frozen module.',
} as const;

/**
 * The governance rationale, recorded verbatim as the product owner stated it.
 *
 * Kept as data rather than a comment so it travels with the constant into the frozen cohort manifest
 * -- a number in a manifest with no recorded reason is how a policy value becomes unquestionable.
 */
export const COHORT_SIZE_AMENDMENT_RATIONALE =
  'The previously frozen 60-row target/hard ceiling was proven jointly unsatisfiable under the '
  + 'frozen class minima and actual available class overlap. After D-86 offsets 2 and 3 were opened '
  + 'under owner authorization, exact analysis established a lower bound of 65 and produced a valid '
  + '65-row witness. Therefore the formal cohort build target and hard ceiling are amended to 65.';

/** The exact measured basis, so the amendment can be re-derived rather than trusted. */
export const COHORT_SIZE_AMENDMENT_BASIS = {
  eligibleForbiddenSupplyBeforeReserve: 44,
  eligibleForbiddenSupplyFromReserve: 16,
  eligibleForbiddenSupplyTotal: 60,
  forbiddenMinimumRequired: 48,
  owedMinimumRequired: 20,
  wholePoolOwedAndForbiddenOverlap: 3,
  lowerBoundDerivation: '|R| >= |OWED| + |FORBIDDEN| - |OWED n FORBIDDEN| >= 20 + 48 - 3 = 65',
  lowerBound: 65,
  witnessExists: true,
  witnessVerifiedAgainstEveryIntrinsicClass: true,
  evidence: 'verification/expert-hazlenz-real-supply-feasibility-2026-09-01/',
  amendmentIsNotAGateRelaxation:
    'No class minimum, scorer, threshold or measurement-contract field was changed, and no formal '
    + 'evaluation had begun when the amendment was made. Nothing a model is scored against moved.',
} as const;

/**
 * THE AUTHORITATIVE COHORT SIZE POLICY.
 *
 * `minimumDefensibleRows` is carried forward at 48 deliberately. It is DERIVED from the measure
 * sizing rule (40 governed-supplied rows for M06, plus 8 that supply none), not from the ceiling, and
 * its derivation is untouched by this amendment. It remains a correct FLOOR; it is simply no longer
 * ATTAINABLE, because a 48-row cohort cannot carry 48 forbidden controls and 20 OWED rows when only
 * three rows in the entire pool are both. Raising it to match the measured 65 would be fitting a
 * derived constant to an outcome, which is exactly the move this programme refuses elsewhere.
 */
export const COHORT_SIZE_POLICY_V2 = {
  version: COHORT_SIZE_POLICY_VERSION,
  targetRows: 65,
  hardCeiling: 65,
  minimumDefensibleRows: 48,
  supplementalCount:
    'EXACTLY 65 minus the number of eligible reserved rows selected. The formula is unchanged; only '
    + 'the constant it references moved with the target.',
  onInsufficiency:
    'If 65 rows cannot satisfy every frozen composition requirement, STOP and report the exact '
    + 'reason. The cohort is NEVER silently enlarged and a requirement is NEVER relaxed.',
  amendedFrom: SUPERSEDED_COHORT_SIZE_POLICY_V1,
  rationale: COHORT_SIZE_AMENDMENT_RATIONALE,
  basis: COHORT_SIZE_AMENDMENT_BASIS,
} as const;

/**
 * Prove the frozen module still holds the values this overlay believes it superseded.
 *
 * If it does not, something edited a file that two immutable opening records depend on, and every
 * conclusion resting on those records is in question. That is a loud failure, not a warning.
 */
export function assertFrozenOriginUnchanged(): void {
  const o = FROZEN_ORIGIN_POLICY;
  const expected = SUPERSEDED_COHORT_SIZE_POLICY_V1;
  if (o.targetRows !== expected.targetRows || o.hardCeiling !== expected.hardCeiling
      || o.minimumDefensibleRows !== expected.minimumDefensibleRows) {
    throw new Error(
      'FROZEN ORIGIN POLICY DRIFTED. expert-cohort-supplemental-policy.ts COHORT_SIZE_POLICY now '
      + `reads target=${o.targetRows} ceiling=${o.hardCeiling} minimum=${o.minimumDefensibleRows}, `
      + `but the §134 amendment recorded it as target=${expected.targetRows} `
      + `ceiling=${expected.hardCeiling} minimum=${expected.minimumDefensibleRows}. That file's `
      + 'sha256 is cited in the §122 and §133 opening records as proof the eligibility rule predates '
      + 'the material it selected. Resolve the drift before trusting any cohort built from it.');
  }
}
