/**
 * EXPERT HAZLENZ -- the §143 LINKAGE-SEMANTICS CONFIRMATION PROBE. DESIGN ONLY, NOT EXECUTED.
 *
 * ==================== WHAT THIS SET IS FOR, AND WHAT IT DELIBERATELY IS NOT ====================
 *
 * NARROW. Nine rows, one arm. It confirms ONE thing: that the v9 precedence rule -- specific
 * semantic relationship overrides superficial question form, tests applied in order -- is decidable
 * in live traffic. It does NOT re-run the §142 matrix, and broad clarification-retention validation
 * is INTENTIONALLY DEFERRED, which is why its TRUE-GAP bar is 1 of 2 rather than 3 of 4.
 *
 * ==================== THE DEFECT THIS SET EXISTS TO NOT REPEAT ====================
 *
 * v2 labelled TEN of sixteen rows `FORBIDDEN` because `FORBIDDEN` was the default for anything not
 * `REQUIRED` or `ALLOWED`. The audit of the spent §142 run showed what that cost:
 *
 *   - 9 of the 10 emitted no clarification, so no linkage situation arose on them at all;
 *   - the 1 that did, LP-G3, was semantically REQUIRED rather than FORBIDDEN;
 *   - so NOT ONE ROW produced a valid FORBIDDEN opportunity, while the measure still reported a
 *     violation and failed an advancement criterion.
 *
 * So in this set **every row carries an explicit `linkageRationale` stating why its
 * `linkageTruth` is what it is**, and `NOT_A_LINKAGE_TEST` exists so that "no link expected" is
 * never written down as "a link would be wrong". `test:expert-linkage-probe-fixtures-v3` fails the
 * build if any row omits the rationale or if a `FORBIDDEN` row does not state a positive reason.
 *
 * ==================== PROVENANCE ====================
 *
 * Authored 2026-09-02 for this probe. No reserved material opened. No spent formal-cohort row read,
 * copied, paraphrased or mimicked. **LP-G3 is not reused verbatim and is not tuned to** -- CL-R3
 * tests the same CONTRACT PROPERTY (a control-shaped question uniquely qualifying one candidate) on
 * unrelated facts, which is the point: test the rule, never the row.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const CONFIRMATION_PROBE_FIXTURE_SET_VERSION =
  'hazlenz.expert.dev-probe.fixtures.v3' as const;

/**
 * The four-valued linkage truth. `NOT_A_LINKAGE_TEST` is the value v2 lacked, and its absence is
 * exactly what produced the §142 blanket-FORBIDDEN defect.
 */
export type LinkageTruth = 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN' | 'NOT_A_LINKAGE_TEST';

export const CONFIRMATION_PROBE_ROLES = [
  'LINKAGE_REQUIRED',
  'LINKAGE_FORBIDDEN',
  'NO_LINKAGE_OPPORTUNITY',
  'TRUE_GAP_CONTROL',
  'NO_GAP_CONTROL',
] as const;
export type ConfirmationProbeRole = (typeof CONFIRMATION_PROBE_ROLES)[number];

export interface ConfirmationProbeFixture {
  row: FormalCohortRow;
  roles: ConfirmationProbeRole[];
  linkageTruth: LinkageTruth;
  /**
   * REQUIRED ON EVERY ROW. Why this row carries this linkage truth. For `FORBIDDEN` it must state a
   * POSITIVE reason a link would be wrong; for `NOT_A_LINKAGE_TEST` it must say the row makes no
   * linkage claim. A blanket default is a build failure, not a style preference.
   */
  linkageRationale: string;
  whyDiagnostic: string;
  /** Always true. A contradiction is a model error and no fixture may commission one. */
  contradictionIsAModelError: true;
}

// ---------------------------------------------------------------- governed records

const RECORD_RESPIRATOR_PROGRAM: GovernedStandardView = {
  citation: '29 CFR 1910.134(c)(1)',
  title: 'Respiratory protection program',
  approvedText:
    'In any workplace where respirators are necessary to protect the health of the employee, the '
    + 'employer shall establish and implement a written respiratory protection program with '
    + 'worksite-specific procedures, as set out at 29 CFR 1910.134(c)(1).',
  backingState: 'APPROVED',
};

const row = (
  rowId: string, observation: string, allowed: string[],
  truth: FormalCohortRow['truth'], over: Partial<FormalCohortRow['source']> = {},
): FormalCohortRow => ({
  contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
  source: {
    rowId, observation,
    inspectionContext: { location: null, task: null },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: allowed,
    governedStandards: [], answeredClarifications: [], supplementaryContext: [],
    ...over,
  },
  truth,
});

// ================================================================ A. REQUIRED (3)
//
// Each row makes exactly ONE emitted candidate the direct subject of the missing fact, with two
// answers that change that candidate's control determination, and a question that cannot be read
// correctly without knowing which candidate it qualifies. CL-R3 is deliberately CONTROL/PPE-SHAPED,
// because that is the form the v8 taxonomy could not classify.

const R1 = row(
  'CL-R1',
  'A fitter was changing the seal on the number 7 agitator with the drive selector at STOP on the '
  + 'local panel. The vessel still held product under a nitrogen blanket at the time, and the '
  + 'fitter had one arm through the side manway. The observation does not establish whether the '
  + 'agitator drive was isolated and locked at its motor control centre.',
  ['lockout_tagout', 'atmospheric_hazard', 'machine_guarding', 'fall_protection'],
  {
    presentHazardFamilies: ['lockout_tagout', 'atmospheric_hazard'],
    defensibleHazardFamilies: ['machine_guarding'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['atmospheric_hazard'],
    decisionCriticalGaps: [{
      gapId: 'CL-R1-G1',
      description: 'whether the agitator drive is isolated and locked at its motor control centre, '
        + 'rather than merely selected to STOP at the local panel',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'A STOP selector is not an isolation, and an arm through the manway of a blanketed vessel is a '
      + 'stated present exposure. The nitrogen blanket makes the atmospheric family present in its '
      + 'own right, which is what gives the row TWO candidates and forces the model to pick the '
      + 'right referent rather than linking to the only thing available.',
  },
);

const R2 = row(
  'CL-R2',
  'The dust collector serving the grinding booth was found with its explosion vent panel painted '
  + 'over and its ductwork visibly loaded with fine metal dust. Grinding was in progress in the '
  + 'booth during the observation. Whether the collector is fitted with an isolation valve or '
  + 'abort gate between the booth and the collector body is not established.',
  ['combustible_dust', 'fire_explosion', 'ventilation_air_quality', 'noise_exposure'],
  {
    presentHazardFamilies: ['combustible_dust', 'fire_explosion'],
    defensibleHazardFamilies: ['ventilation_air_quality'],
    forbiddenHazardFamilies: ['noise_exposure'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fire_explosion'],
    decisionCriticalGaps: [{
      gapId: 'CL-R2-G1',
      description: 'whether an isolation valve or abort gate separates the grinding booth from the '
        + 'collector body, which decides whether a deflagration could propagate back to occupied space',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'A painted-over vent panel and loaded ductwork with grinding in progress are stated present '
      + 'facts. Isolation bears on the FIRE/EXPLOSION propagation candidate specifically, not on the '
      + 'dust accumulation one, so the referent is unique but not the only candidate available.',
  },
);

/**
 * CL-R3 -- THE ROW THIS WHOLE OPERATION EXISTS FOR.
 *
 * A CONTROL/PPE-SHAPED question that satisfies the REQUIRED test. Under v8 this collided with the
 * "general PPE follow-up" clause and would have been scored a FORBIDDEN link. Under v9, TEST 1 runs
 * first and it is REQUIRED. **The facts share nothing with LP-G3** -- different industry, different
 * hazard families, different question -- because the point is to test the rule, not the row.
 */
const R3 = row(
  'CL-R3',
  'A technician was cleaning the spray booth extract plenum with an aerosolised solvent while '
  + 'kneeling inside the booth. The booth extract fan was switched off for the cleaning and the '
  + 'booth doors were closed. Two other workers were spraying primer in the adjacent bay, which '
  + 'shares a return-air path with the booth. The observation does not record what respiratory '
  + 'protection, if any, the technician inside the booth was wearing.',
  ['chemical_inhalation_contact', 'respiratory_protection', 'fire_explosion',
    'walking_working_surfaces'],
  {
    presentHazardFamilies: ['chemical_inhalation_contact'],
    defensibleHazardFamilies: ['respiratory_protection', 'fire_explosion'],
    forbiddenHazardFamilies: ['walking_working_surfaces'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'CL-R3-G1',
      description: 'what respiratory protection the technician inside the booth was wearing while '
        + 'the extract fan was off',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Solvent aerosol inside a closed booth with the extract off is a stated present inhalation '
      + 'exposure. Respiratory protection bears on THAT candidate and on no other: it does not touch '
      + 'the shared-return-air fire concern and it does not touch the walking surface. The two '
      + 'answers give two different current actions -- an appropriate supplied-air or cartridge '
      + 'respirator in use means the exposure is controlled and the finding is the fan interlock; '
      + 'nothing worn means immediate withdrawal from the booth. That is the REQUIRED test satisfied '
      + 'by a question whose FORM is about PPE, which is exactly the collision v8 could not decide.',
  },
);

// ================================================================ B. FORBIDDEN (3)
//
// Each is a POSITIVE forbidden reason, stated per row. None is a default.

const F1 = row(
  'CL-F1',
  'Both the east and west trim presses on line 4 were running with their light curtains muted. The '
  + 'mute override key was left in the panel on each machine. Operators load blanks by hand at both '
  + 'presses. The observation does not record whether either machine has been through the site '
  + 'muting-authorisation process.',
  ['machine_guarding', 'lockout_tagout', 'training_procedure_supervision'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['lockout_tagout', 'training_procedure_supervision'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [{
      gapId: 'CL-F1-G1',
      description: 'whether the muting arrangement on these presses has been through the site '
        + 'authorisation process, which the observation leaves open for both machines identically',
      affectedDecision: 'APPLICABILITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'AMBIGUOUS REFERENT BY CONSTRUCTION. Two presses in the same family, in the same state, with '
      + 'the same defect. Any authorisation question applies to both identically, so a model that '
      + 'raises two guarding candidates has no unique referent to name.',
  },
);

const F2 = row(
  'CL-F2',
  'A scissor lift was parked across the marked pedestrian walkway outside the paint store with its '
  + 'platform at full height and nobody on it. Separately, the eyewash station beside the paint '
  + 'store door has no inspection tag and its bowl is covered by a cardboard box. Both conditions '
  + 'were present throughout the walkthrough.',
  ['mobile_equipment', 'emergency_equipment', 'walking_working_surfaces', 'fall_protection'],
  {
    presentHazardFamilies: ['mobile_equipment', 'emergency_equipment'],
    defensibleHazardFamilies: ['walking_working_surfaces'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'CL-F2-G1',
      description: 'when the eyewash station was last inspected and flushed',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'DIFFERENT-HAZARD REFERENT. The row deliberately carries two unrelated conditions. An eyewash '
      + 'inspection question is about the emergency-equipment candidate and has nothing to do with '
      + 'the parked lift; if a model links it to the mobile-equipment candidate that is a genuine '
      + 'cross-hazard linkage error. The two conditions share only the location.',
  },
);

const F3 = row(
  'CL-F3',
  'General walkthrough of the fabrication shop. A welder was tacking a bracket at the bench with a '
  + 'screen in place, a labourer was moving stock with a pallet truck in the aisle, and a fitter was '
  + 'deburring a plate at the pedestal grinder with the rest set correctly. Nothing in the site PPE '
  + 'matrix was posted at any of the three workstations.',
  ['welding_fumes', 'material_handling_storage', 'machine_guarding',
    'personal_protective_equipment'],
  {
    presentHazardFamilies: ['personal_protective_equipment'],
    defensibleHazardFamilies: ['welding_fumes', 'material_handling_storage', 'machine_guarding'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'GENUINELY GENERIC PPE FOLLOW-UP -- the negative counterpart to CL-R3, and the pair is the '
      + 'whole point. A missing PPE matrix is a row-level administrative fact that touches all three '
      + 'workstations equally and changes no single candidate\'s current decision. "What PPE is '
      + 'required here?" is the question v9 TEST 3 still forbids, and CL-R3 is the question TEST 1 '
      + 'now permits. If a model links on both, or on neither, the precedence rule has not landed.',
  },
);

// ================================================================ C. NO LINKAGE OPPORTUNITY (1)

const N1 = row(
  'CL-N1',
  'Quarterly check of the north stair core. Handrails are continuous and secure on both flights, '
  + 'treads are unworn with intact nosings, the landing is clear, and emergency lighting was '
  + 'function-tested this month with the result recorded on the fixture tag.',
  ['walking_working_surfaces', 'fall_protection', 'emergency_equipment'],
  {
    presentHazardFamilies: [],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies:
      ['walking_working_surfaces', 'fall_protection', 'emergency_equipment'],
    negatedOrSafeStateFamilies:
      ['walking_working_surfaces', 'fall_protection', 'emergency_equipment'],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Every condition is affirmatively verified rather than merely unmentioned, so no candidate and '
      + 'no clarification are owed. Doubles as the NO-GAP silence control.',
  },
);

// ================================================================ D. TRUE-GAP (2)

const T1 = row(
  'CL-T1',
  'The roof access hatch on the plant room was propped open with a length of conduit and the fixed '
  + 'ladder below it runs twenty feet to the floor. There is no cover, no guardrail and no gate at '
  + 'the hatch opening. The observation does not establish whether anyone is scheduled to work on '
  + 'the roof while the hatch is propped.',
  ['fall_protection', 'walking_working_surfaces', 'material_handling_storage'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['walking_working_surfaces'],
    forbiddenHazardFamilies: ['material_handling_storage'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fall_protection'],
    decisionCriticalGaps: [{
      gapId: 'CL-T1-G1',
      description: 'whether anyone is scheduled to work on the roof, and therefore to pass the '
        + 'propped-open hatch, during the period it is propped',
      affectedDecision: 'EXPOSURE',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Two branches with different current actions: work scheduled means close or guard the opening '
      + 'and control access now; no access until the hatch is restored means the correction can be '
      + 'scheduled. A general positive clarification control, retained because a linkage probe that '
      + 'produced no questions at all would measure nothing.',
  },
);

const T2 = row(
  'CL-T2',
  'A contractor was hot-tapping a live process line under a permit. The permit lists a fire watch '
  + 'but the observation records no one standing watch at the work location, and combustible '
  + 'lagging is within a metre of the tap point. What the line carries is not recorded on the '
  + 'permit copy at the job.',
  ['hot_work', 'fire_explosion', 'chemical_release', 'contractor_coordination'],
  {
    presentHazardFamilies: ['hot_work'],
    defensibleHazardFamilies: ['fire_explosion', 'contractor_coordination', 'chemical_release'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'CL-T2-G1',
      description: 'what the live line being hot-tapped actually carries',
      affectedDecision: 'HAZARD_SEVERITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'The contents decide the magnitude and therefore the current action: an inert or aqueous '
      + 'service means the finding is the missing fire watch and the lagging; a flammable or toxic '
      + 'service means stopping the hot work now. The second general positive clarification control, '
      + 'in an unrelated family from CL-T1.',
  },
  { governedStandards: [RECORD_RESPIRATOR_PROGRAM] },
);

// ---------------------------------------------------------------- the set

export const CONFIRMATION_PROBE_FIXTURES: readonly ConfirmationProbeFixture[] = [
  {
    row: R1, roles: ['LINKAGE_REQUIRED', 'TRUE_GAP_CONTROL'], linkageTruth: 'REQUIRED',
    contradictionIsAModelError: true,
    linkageRationale:
      'The isolation question is the direct subject of exactly one candidate — the lockout/tagout '
      + 'one — and decides whether it stays ACTIVE. The atmospheric candidate is unaffected by the '
      + 'answer, so the referent is unique while a second candidate is genuinely available to be '
      + 'chosen wrongly.',
    whyDiagnostic: 'A required link with a competing candidate present, in non-PPE wording.',
  },
  {
    row: R2, roles: ['LINKAGE_REQUIRED', 'TRUE_GAP_CONTROL'], linkageTruth: 'REQUIRED',
    contradictionIsAModelError: true,
    linkageRationale:
      'Isolation between booth and collector determines whether the fire/explosion propagation '
      + 'candidate remains ACTIVE. It does not change the dust-accumulation candidate, which stands '
      + 'on the loaded ductwork regardless, so exactly one candidate is the subject.',
    whyDiagnostic: 'A second required link in an unrelated family, so a result is not an artefact of '
      + 'one scenario type.',
  },
  {
    row: R3, roles: ['LINKAGE_REQUIRED', 'TRUE_GAP_CONTROL'], linkageTruth: 'REQUIRED',
    contradictionIsAModelError: true,
    linkageRationale:
      'THE PRECEDENCE TEST. Control/PPE-shaped in FORM, but respiratory protection is the direct '
      + 'subject of exactly one candidate — the inhalation exposure — and the two answers give two '
      + 'different current actions. Under v8 the "general PPE follow-up" clause collided with this '
      + 'and it would have scored as a FORBIDDEN link; under v9 TEST 1 runs first and it is REQUIRED. '
      + 'Paired with CL-F3, which is the genuinely generic PPE question that stays FORBIDDEN.',
    whyDiagnostic: 'The single row this operation exists to confirm.',
  },
  {
    row: F1, roles: ['LINKAGE_FORBIDDEN'], linkageTruth: 'FORBIDDEN',
    contradictionIsAModelError: true,
    linkageRationale:
      'POSITIVE REASON: ambiguous referent. Two presses of the same family in the same state, and '
      + 'the authorisation question applies to both identically. There is no unique candidate to '
      + 'name, so any link is wrong.',
    whyDiagnostic: 'Same-family ambiguity — the v2 LP-L4 property, rebuilt so a clarification is '
      + 'actually owed and the FORBIDDEN denominator is real rather than empty.',
  },
  {
    row: F2, roles: ['LINKAGE_FORBIDDEN'], linkageTruth: 'FORBIDDEN',
    contradictionIsAModelError: true,
    linkageRationale:
      'POSITIVE REASON: different hazard. The eyewash question belongs to the emergency-equipment '
      + 'candidate and has no bearing on the parked lift; the two conditions share only a location. '
      + 'A link across them is a cross-hazard error.',
    whyDiagnostic: 'Catches linkage driven by row co-occurrence rather than semantics.',
  },
  {
    row: F3, roles: ['LINKAGE_FORBIDDEN'], linkageTruth: 'FORBIDDEN',
    contradictionIsAModelError: true,
    linkageRationale:
      'POSITIVE REASON: genuinely generic PPE follow-up. A missing PPE matrix is row-level and '
      + 'administrative, touching three workstations equally and changing no single candidate\'s '
      + 'current decision. This is the clause v9 TEST 3 keeps, and it is the control that proves the '
      + 'CL-R3 permission did not simply delete the prohibition.',
    whyDiagnostic: 'The negative half of the precedence pair. CL-R3 must link; CL-F3 must not.',
  },
  {
    row: N1, roles: ['NO_LINKAGE_OPPORTUNITY', 'NO_GAP_CONTROL'],
    linkageTruth: 'NOT_A_LINKAGE_TEST', contradictionIsAModelError: true,
    linkageRationale:
      'This row makes NO LINKAGE CLAIM. Nothing is owed, so no clarification is expected and no '
      + 'linkage situation can arise. Under v2 this would have been labelled FORBIDDEN by default '
      + 'and would have sat in the violation denominator without ever being a linkage test. It is '
      + 'excluded from every linkage denominator instead.',
    whyDiagnostic: 'The NO-GAP silence control, and the row that demonstrates the fourth truth value '
      + 'doing its job.',
  },
  {
    row: T1, roles: ['TRUE_GAP_CONTROL'], linkageTruth: 'ALLOWED',
    contradictionIsAModelError: true,
    linkageRationale:
      'The exposure question has the fall candidate as its primary subject, but it reads correctly '
      + 'on its own — "is anyone scheduled on the roof" needs no candidate to be understood or '
      + 'acted on. ALLOWED: linking and omitting are both correct, and omission is not scored as a '
      + 'failure.',
    whyDiagnostic: 'A general positive clarification control, and an ALLOWED row so the middle '
      + 'category is exercised rather than assumed.',
  },
  {
    row: T2, roles: ['TRUE_GAP_CONTROL'], linkageTruth: 'ALLOWED',
    contradictionIsAModelError: true,
    linkageRationale:
      'Line contents primarily concern the hot-work candidate but the question stands alone. Also '
      + 'carries an unrelated APPROVED respiratory record, so governed abstention is observed '
      + 'without spending a dedicated row on it.',
    whyDiagnostic: 'Second general positive control, in an unrelated family, with an incidental '
      + 'unrelated-governed-record check.',
  },
];

export const CONFIRMATION_PROBE_ROWS: readonly FormalCohortRow[] =
  CONFIRMATION_PROBE_FIXTURES.map(f => f.row);

export function confirmationFixtureByRowId(rowId: string): ConfirmationProbeFixture | undefined {
  return CONFIRMATION_PROBE_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * The frozen development criteria for the next hosted probe, transcribed from the authorization so
 * they are fixed BEFORE the probe runs and cannot be chosen after seeing the result.
 *
 * NOT FORMAL THRESHOLDS. No frozen scorer, no formal gate, no acceptance implication.
 */
export const CONFIRMATION_PROBE_BUDGET = {
  targetLogicalCalls: 9,
  hardProviderRequestCeiling: 12,
  hardSpendCeilingUsd: 2.00,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 1,
} as const;

export const CONFIRMATION_PROBE_CRITERIA = [
  { id: 1, name: 'REQUIRED linkage',
    target: 'all 3 REQUIRED opportunities valid (>= 3/3 when exactly three are present)' },
  { id: 2, name: 'FORBIDDEN linkage',
    target: '0 accepted forbidden links across all 3 dedicated FORBIDDEN controls' },
  { id: 3, name: 'invalid candidate keys', target: '0 unresolved bad keys accepted' },
  { id: 4, name: 'no forced linkage',
    target: 'no link where the row has no linkage opportunity' },
  { id: 5, name: 'TRUE-GAP retention',
    target: '>= 1 of 2 — broad clarification-retention validation is INTENTIONALLY DEFERRED and this '
      + 'probe must not be read as closing it' },
  { id: 6, name: 'NO-GAP silence', target: 'no meaningful regression from v8 behaviour' },
  { id: 7, name: 'arbitration',
    target: 'natural opportunity only; ZERO events is NOT a failure when no contradiction occurs' },
] as const;
