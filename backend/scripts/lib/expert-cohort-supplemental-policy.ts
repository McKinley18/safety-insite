/**
 * EXPERT HAZLENZ -- the SUPPLEMENTAL-CASE CONSTRUCTION POLICY. §122.
 *
 * ==================== FROZEN BEFORE ANY RESERVED ROW CONTENT WAS SEEN ====================
 *
 * This file was written and hashed BEFORE `safescope-gauntlet.seed.json` was opened. That ordering
 * is the whole point: a selection rule written after seeing the rows is a rationalisation of a
 * choice already made. Everything here is mechanical -- fixed sort keys, fixed priority order, no
 * randomness and no seed -- so the same deficits always select the same rows, and no row can be
 * swapped in later because it looked more favourable.
 *
 * ==================== WHAT MAY AND MAY NOT DRIVE A SELECTION ====================
 *
 * MAY:      a measured deficit against `FORMAL_COHORT_COMPOSITION_REQUIREMENTS`, which is frozen.
 * MAY NOT:  §104-§119 provider answers; observed model failure wording; any individual model
 *           mistake; a scorer weakness; or an anticipated pass/fail outcome. None of those is
 *           readable from this module -- it imports no provider, no probe artifact and no run
 *           record, so the prohibition is structural rather than a promise.
 *
 * ==================== THE ACCEPTED TAXONOMY IS NOT WIDENED ====================
 *
 * `ACCEPTED_EXPERT_TAXONOMY` is the VALUE SET of the §119 projection map, read out rather than
 * retyped. A row whose families fall outside it is INELIGIBLE and stays ineligible; it is never
 * made eligible by touching `toExpertFamily`, which is frozen. §121 measured the consequence -- 47
 * of 100 gauntlet rows are outside it -- and that limitation is carried as product debt, not
 * engineered around during cohort construction.
 *
 * ==================== MINIMUM NECESSARY RESERVED EXPOSURE ====================
 *
 * Exactly ONE reserved artifact is opened: the 100-row `gauntlet.seed` reserve. Gauntlet offsets 2
 * and 3 and realism offsets 1 and 2 are NOT opened and remain available as future single-use exams.
 * The realism pack would have supplied `shouldHaveMissingEvidence`, but §121 measured its
 * distribution as true 87 / false 2 / unlabelled 28 -- two zero-owed rows against a requirement of
 * fourteen -- so opening it would spend a reserved offset to gain two rows. The supplemental source
 * below supplies that class without spending anything reserved.
 */

import { POPULATION_A, POPULATION_B } from '../../src/safescope-v2/tests/hazlenz-decomposition-precision-corpus';

export const SUPPLEMENTAL_POLICY_VERSION = 'hazlenz.expert.cohort.supplemental.policy.v1' as const;

/**
 * The accepted Expert taxonomy: the seven families the §119 projection can produce. Stated here as
 * data so a reader can check it against `FAMILY_LABEL_TO_EXPERT_FAMILY`, and asserted equal to that
 * map's value set by the assembly script rather than trusted.
 */
export const ACCEPTED_EXPERT_TAXONOMY: readonly string[] = [
  'chemical_exposure', 'confined_space', 'electrical', 'fall_protection',
  'lockout_tagout', 'machine_guarding', 'mobile_equipment',
];

export function inAcceptedTaxonomy(family: string): boolean {
  return ACCEPTED_EXPERT_TAXONOMY.includes(family);
}

// ---------------------------------------------------------------- reserved material

export const RESERVED_MATERIAL_OPENED_BY_THIS_POLICY = {
  artifact: 'safescope-data/gauntlets/safescope-gauntlet.seed.json',
  reserveName: 'the unopened 100-row gauntlet.seed',
  rangeOpened: 'ALL 100 rows, for eligibility classification and truth-key authoring only',
  notOpened: [
    'gauntlet offset 2', 'gauntlet offset 3', 'realism offset 1', 'realism offset 2',
  ],
  purpose: 'FORMAL_EXPERT_COHORT eligibility classification, truth-key construction, cohort '
    + 'composition and row freezing. NOT provider execution, NOT prompt development.',
} as const;

/**
 * Reserved-row eligibility, mechanical and total.
 *
 * A row qualifies only when its PRIMARY family and EVERY secondary family land inside the accepted
 * taxonomy. A partially expressible row is rejected rather than truncated: dropping a secondary
 * family would silently change what the row asserts, and a truth key built on a truncated row would
 * be wrong in a way no later check could see.
 */
export interface ReservedRowMetadata {
  scenarioId: string;
  primaryHazardFamily?: string;
  secondaryHazardFamilies?: string[];
  unacceptableStandardFamilies?: string[];
  severityExpectation?: string;
  agency?: string;
}

export function reservedRowEligible(
  row: ReservedRowMetadata, mapFamily: (label: string) => string | null,
): { eligible: boolean; primary: string | null; secondaries: string[]; reason: string } {
  const primary = mapFamily(row.primaryHazardFamily ?? '');
  if (!primary) {
    return { eligible: false, primary: null, secondaries: [], reason: 'PRIMARY_OUTSIDE_TAXONOMY' };
  }
  const secondaries: string[] = [];
  for (const s of row.secondaryHazardFamilies ?? []) {
    const m = mapFamily(s);
    if (!m) {
      return { eligible: false, primary, secondaries: [], reason: 'SECONDARY_OUTSIDE_TAXONOMY' };
    }
    if (m !== primary && !secondaries.includes(m)) secondaries.push(m);
  }
  return { eligible: true, primary, secondaries, reason: 'ELIGIBLE' };
}

/**
 * Reserved rows are taken in `scenarioId` ascending order. Not by severity, not by how interesting
 * the observation looks, and not by anything a reader could tune -- the order is a property of the
 * corpus, fixed before it was read.
 */
export const RESERVED_SELECTION_ORDER = 'scenarioId ASCENDING' as const;

// ---------------------------------------------------------------- supplemental material

/**
 * The supplemental source, and why it is legitimate.
 *
 * `hazlenz-decomposition-precision-corpus.ts` is a FROZEN evaluation corpus authored 2026-08-27
 * "from safety-domain reasoning about what a qualified reviewer would confirm", BEFORE any Expert
 * provider output existed, and its own header forbids editing a row to match engine behaviour. It
 * carries exactly the label shape a truth key needs -- `requiredDomains` / `forbiddenDomains` /
 * `allowedDomains` on Population A, and `lifeCritical` groups on Population B -- in the Expert
 * family vocabulary already.
 *
 * It has never been shown to any provider: the Expert core is provably no-call and the deterministic
 * engine is local, so there is no published result for a model to have memorised.
 *
 * ONE HONEST CAVEAT, RECORDED HERE RATHER THAN DISCOVERED LATER: the deterministic engine was
 * measured against this corpus, so its recall on these rows is high by construction. That makes
 * these rows a POOR source of `M01` recall opportunities -- the deterministic layer will rarely miss
 * on them -- and the policy therefore never selects them to satisfy an M01 deficit. Recall
 * opportunity must come from reserved rows, where the engine has never been tuned.
 */
export const SUPPLEMENTAL_SOURCE = {
  artifact: 'backend/src/safescope-v2/tests/hazlenz-decomposition-precision-corpus.ts',
  status: 'ALREADY-OPEN authoritative safety-domain corpus; NOT reserved, NOT closed, never shown '
    + 'to any provider',
  authored: '2026-08-27, before any Expert provider output existed',
  populationARows: POPULATION_A.length,
  populationBRows: POPULATION_B.length,
  mayNotSatisfy: ['M01_ADDITIVE_HAZARD_RECALL'],
  mayNotSatisfyReason:
    'the deterministic engine was measured against this corpus, so a "miss" here would measure the '
    + 'corpus rather than the engine',
} as const;

/**
 * Which composition deficit each supplemental class is allowed to close, in PRIORITY ORDER.
 *
 * Read top to bottom: the first class whose deficit is still open takes the next available row.
 * Fixed before the deficits were known.
 */
export const SUPPLEMENTAL_PRIORITY: ReadonlyArray<{
  caseClass: string;
  source: 'POPULATION_A' | 'POPULATION_B';
  rule: string;
}> = [
  {
    caseClass: 'CLARIFICATION_NOT_OWED',
    source: 'POPULATION_A',
    rule: 'A Population A row with NO required domains states a complete, unremarkable situation: '
      + 'the corpus asserts the incidental language creates no hazard and names nothing the reviewer '
      + 'must still establish. That is what "owes no clarification" means, and it is the class §121 '
      + 'measured as the scarcest (2 available against a requirement of 14).',
  },
  {
    caseClass: 'NEGATED_OR_SAFE_STATE',
    source: 'POPULATION_A',
    rule: 'A Population A row whose forbidden domains include a family the text describes in a '
      + 'negated, historical or verified-safe form.',
  },
  {
    caseClass: 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL',
    source: 'POPULATION_A',
    rule: 'Any eligible Population A row: `forbiddenDomains` IS the negative control.',
  },
  {
    caseClass: 'LIFE_CRITICAL_PRESENT',
    source: 'POPULATION_B',
    rule: 'A Population B row with a `lifeCritical` required group whose domains are in the '
      + 'accepted taxonomy.',
  },
  {
    caseClass: 'MULTI_HAZARD',
    source: 'POPULATION_B',
    rule: 'A Population B row with two or more required groups, every group expressible in the '
      + 'accepted taxonomy.',
  },
  {
    caseClass: 'CROSS_HAZARD_INTERACTION',
    source: 'POPULATION_B',
    rule: 'A Population B multi-group row whose groups form a recognised pair in the CLOSED '
      + '`EXPERT_INTERACTION_KINDS` vocabulary. An interaction is recorded ONLY where the closed '
      + 'vocabulary already names it -- a new interaction kind is never invented for a row.',
  },
];

/** Supplemental rows are taken in row-`id` ascending order within each population. */
export const SUPPLEMENTAL_SELECTION_ORDER = 'row id ASCENDING within population' as const;

// ---------------------------------------------------------------- limits

export const COHORT_SIZE_POLICY = {
  targetRows: 60,
  minimumDefensibleRows: 48,
  /**
   * Supplemental rows are whatever 60 minus the eligible reserved rows comes to, and no more. The
   * policy does not set a supplemental quota in advance, because a quota fixed before the reserved
   * rows were classified would be a guess about how many survive.
   */
  supplementalCount: 'EXACTLY 60 minus the number of eligible reserved rows selected',
  hardCeiling: 60,
  onInsufficiency:
    'If 60 rows cannot satisfy every frozen composition requirement, STOP and report the exact '
    + 'reason. The cohort is NEVER silently enlarged and a requirement is NEVER relaxed.',
} as const;

/** Things this policy forbids itself, stated so a reviewer can check them against the code. */
export const POLICY_PROHIBITIONS: readonly string[] = [
  'No row is selected or rejected on the basis of an anticipated score.',
  'No case content is derived from any provider answer, probe artifact or run record. This module '
    + 'imports none of them.',
  'No row is edited to change what it asserts. A row is taken whole or not at all.',
  'toExpertFamily is not widened, and no alternative family mapping is introduced.',
  'No threshold, disposition, scorer or measurement-contract field is changed.',
  'The reserved artifact is opened ONCE, for classification and truth-key authoring only, and is '
    + 'never shown to a provider in this operation.',
];
