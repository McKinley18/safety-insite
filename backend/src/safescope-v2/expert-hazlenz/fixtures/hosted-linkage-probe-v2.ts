/**
 * EXPERT HAZLENZ -- DEVELOPMENT FIXTURES for the §141 replacement hosted probe. DESIGN ONLY.
 *
 * ==================== NOT EXECUTED BY THE OPERATION THAT WROTE IT ====================
 *
 * §141 is a ZERO-PROVIDER operation. This file is the MANIFEST of the next bounded hosted
 * development probe; it is validated deterministically at $0.00 and it is not run. Executing it
 * requires its own authorization.
 *
 * ==================== WHY A NEW FILE RATHER THAN AN EDIT ====================
 *
 * `hosted-remediation-probe-v1.ts` is the instrument that produced §140's executed evidence, and
 * `FIXTURE-MANIFEST.json` records its truth keys as they stood at spend. Editing it in place would
 * break the correspondence between the recorded manifest and the module, which is the same class of
 * defect as overwriting a pre-spend identity. **v1 stays byte-identical.** The valid v1 rows are
 * carried forward here verbatim -- development material has unlimited re-use, and re-running a
 * proven negative control is what makes the next probe comparable to this one.
 *
 * ==================== WHAT CHANGED FROM v1, AND WHY ====================
 *
 *   DP-B4 -> LP-B3   REPLACED. §140 measured the model DECLINING DP-B4's authored gap and stating
 *                    the reason: "the exact duration ... affects cumulative exposure but does not
 *                    change the current control decision." That is the v7 counterfactual test
 *                    applied correctly. The authored gap failed the contract the fixture existed to
 *                    exercise, so the FIXTURE was wrong. Replaced with a magnitude whose two
 *                    answers lead to genuinely different actions today. THE MODEL WAS NOT CHANGED
 *                    TO SATISFY DP-B4.
 *
 *   DP-B1 -> LP-B4   REPLACED, not repaired. `DP_B1_CAUSE = UNKNOWN`: the persisted record shows
 *                    `issues: []`, `mergeViolations: []`, `PRESENT`, one successful attempt -- so
 *                    every harness loss path is positively excluded and the clarification list was
 *                    empty as it left the model. Whether the model never formed the question or
 *                    formed and declined it cannot be told apart, because it left no trace.
 *                    LP-B4 tests the SAME CONTRACT PROPERTY -- an EXPOSURE fact whose two answers
 *                    diverge -- on entirely different surface facts. **The rule is tested; the row
 *                    is not taught.**
 *
 *   LP-L1..L4        NEW. §140 produced ZERO required-linkage opportunities, which is why linkage
 *                    came back unexercised. These four are built so that a question determining a
 *                    specific candidate's status is genuinely owed.
 *
 * ==================== PROVENANCE ====================
 *
 * Every observation was authored for these probes on 2026-09-02. No reserved material was opened.
 * No row of the spent 65-row formal cohort was read, copied, paraphrased, reconstructed or mimicked.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION,
  type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const LINKAGE_PROBE_FIXTURE_SET_VERSION = 'hazlenz.expert.dev-probe.fixtures.v2' as const;

/** Roles carried forward from v1, plus the linkage roles v1 had no way to express. */
export const LINKAGE_PROBE_ROLES = [
  'NO_GAP_CONTROL',
  'TRUE_GAP_CONTROL',
  'LINKAGE_REQUIRED',
  'LINKAGE_AMBIGUOUS_MUST_NOT_LINK',
  'GOVERNED_RELEVANT',
  'GOVERNED_UNRELATED',
  'GOVERNED_ABSENT',
  'GOVERNED_NARROWER',
  'CITATION_ADVERSARIAL',
  'EMPTY_COLLECTION_CONTROL',
] as const;
export type LinkageProbeRole = (typeof LINKAGE_PROBE_ROLES)[number];

/**
 * What the answer key says about linkage on this row. Consumed by
 * `scripts/lib/expert-probe-measures.ts` as the REQUIRED denominator.
 *
 * This is an AUTHORED property. §140's defect was deriving it by counting collections, which
 * conflated all three cases and scored a correct model at 0.333.
 */
export type LinkageExpectation = 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN';

export interface LinkageProbeFixture {
  row: FormalCohortRow;
  roles: LinkageProbeRole[];
  linkageExpectation: LinkageExpectation;
  /**
   * Whether a correctly-reasoning model should produce a clarification that CONTRADICTS its own
   * ACTIVE candidate. Always `false`: a contradiction is a model ERROR, and an error cannot be
   * commissioned. Recorded per row so the report cannot later claim a contradiction was "expected".
   * Arbitration is proven deterministically in `test:expert-linkage-contract`, not here.
   */
  contradictionIsAModelError: true;
  whyDiagnostic: string;
  expectedEmptyCollections: Array<'decisionCriticalClarifications' | 'crossHazardInsights'
    | 'disagreements' | 'expertHazardCandidates'>;
  /** Present only on rows whose truth changed from v1. */
  supersedes?: { v1RowId: string; oldTruth: string; newTruth: string; whyOldWasInvalid: string };
}

// ---------------------------------------------------------------- governed records

const RECORD_MACHINE_GUARDING_GENERAL: GovernedStandardView = {
  citation: '29 CFR 1910.212(a)(1)',
  title: 'General requirements for all machines',
  approvedText:
    'One or more methods of machine guarding shall be provided to protect the operator and other '
    + 'employees in the machine area from hazards such as those created by point of operation, '
    + 'ingoing nip points, rotating parts, flying chips and sparks. See 29 CFR 1910.212(a)(1).',
  backingState: 'APPROVED',
};

const RECORD_PORTABLE_LADDERS_ONLY: GovernedStandardView = {
  citation: '29 CFR 1910.23(c)(1)',
  title: 'Portable ladders — side rail extension above the landing surface',
  approvedText:
    'The side rails of a portable ladder used to gain access to an upper landing surface shall '
    + 'extend at least 3 feet above the upper landing surface. This paragraph, 29 CFR 1910.23(c)(1), '
    + 'addresses portable ladders only and states no requirement for fixed ladders.',
  backingState: 'APPROVED',
};

const RECORD_DRAFT_ELECTRICAL_WORK_PRACTICES: GovernedStandardView = {
  citation: '29 CFR 1910.333(a)(1)',
  title: 'Selection and use of work practices — 29 CFR 1910.333(a)(1)',
  approvedText:
    'Safety-related work practices shall be employed to prevent electric shock. This text is held at '
    + 'DRAFT backing state and reproduces 29 CFR 1910.333(a)(1) for review only.',
  backingState: 'DRAFT',
};

const RECORD_WELDING_FUME_VENTILATION: GovernedStandardView = {
  citation: '29 CFR 1910.252(c)(2)',
  title: 'Welding, cutting and brazing — ventilation for general welding',
  approvedText:
    'Mechanical ventilation shall be provided when welding or cutting is done on metals not covered '
    + 'by the specific exceptions, at the rates given in 29 CFR 1910.252(c)(2).',
  backingState: 'APPROVED',
};

// ---------------------------------------------------------------- builder

const row = (
  rowId: string,
  observation: string,
  allowed: string[],
  truth: FormalCohortRow['truth'],
  over: Partial<FormalCohortRow['source']> = {},
): FormalCohortRow => ({
  contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
  source: {
    rowId,
    observation,
    inspectionContext: { location: null, task: null },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: allowed,
    governedStandards: [],
    answeredClarifications: [],
    supplementaryContext: [],
    ...over,
  },
  truth,
});

// ================================================================ A. NO-GAP (carried from v1)

const A1 = row(
  'LP-A1',
  'The infeed nip point on the number 3 belt conveyor is uncovered. The fixed guard was removed for '
  + 'belt tracking two shifts ago and has not been reinstalled; it is in the maintenance crib. Two '
  + 'operators work at the infeed continuously during production, the conveyor was running at line '
  + 'speed throughout the observation, and no interim barrier, rope or warning line is in place.',
  ['machine_guarding', 'electrical', 'fall_protection'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: ['electrical', 'fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 unchanged, where it emitted zero clarifications. The four facts that '
      + 'decide the action are all stated: guard off, machine running, people at the nip point '
      + 'continuously, no substitute control. Who removed the guard and when it returns are useful '
      + 'and change nothing today.',
  },
);

const A2 = row(
  'LP-A2',
  'A loose guard on the bench grinder was found during the morning walkthrough. The maintenance '
  + 'technician re-secured and torqued the mounting bolts while I watched, and the tool rest gap was '
  + 're-measured at one eighth of an inch. The grinder was run up afterwards and the guard held. No '
  + 'employee used the grinder between the finding and the repair.',
  ['machine_guarding', 'electrical'],
  {
    presentHazardFamilies: [],
    defensibleHazardFamilies: ['machine_guarding'],
    forbiddenHazardFamilies: ['electrical'],
    negatedOrSafeStateFamilies: ['machine_guarding'],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 unchanged. A historical condition the observation itself closes out: '
      + 'repaired under direct observation, re-measured, re-tested, no exposure in the interval.',
  },
);

const A3 = row(
  'LP-A3',
  'Employees on the second floor mezzanine were stacking pallets against the open edge. The '
  + 'guardrail along the north run of the mezzanine is missing for about twelve feet, and the drop '
  + 'to the concrete below is roughly fourteen feet. Three employees were working within two feet of '
  + 'the open edge and none was wearing a harness. There is no warning line and no designated safety '
  + 'monitor.',
  ['fall_protection', 'material_handling_storage', 'machine_guarding'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['material_handling_storage'],
    forbiddenHazardFamilies: ['machine_guarding'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fall_protection'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 unchanged. Height, exposure, proximity and the absence of every '
      + 'alternative control are stated. High severity is when a coverage habit is most tempting.',
  },
);

const A4 = row(
  'LP-A4',
  'Walkthrough of the finished goods aisle. The aisles were clear and floor-marked, the emergency '
  + 'exit path was unobstructed, the lighting was adequate for the task, and the two racks in the '
  + 'aisle had current inspection tags. No work was in progress in the aisle at the time of the '
  + 'walkthrough.',
  ['walking_working_surfaces', 'material_handling_storage', 'emergency_equipment'],
  {
    presentHazardFamilies: [],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies:
      ['walking_working_surfaces', 'material_handling_storage', 'emergency_equipment'],
    negatedOrSafeStateFamilies: ['walking_working_surfaces', 'emergency_equipment'],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 unchanged. The all-empty control: every condition is affirmatively '
      + 'verified rather than merely unmentioned.',
  },
);

// ================================================================ B. TRUE-GAP

/** Carried from v1 DP-B2, where the model recovered the authored gap exactly and linked it. */
const B1 = row(
  'LP-B1',
  'A millwright was replacing the coupling guard on the number 2 pump drive with the pump control '
  + 'switch in the OFF position at the local panel. The pump discharge line was still pressurized at '
  + 'the isolation valve, and the millwright had both hands inside the coupling housing while I '
  + 'observed.',
  ['hydraulic_pneumatic_energy', 'lockout_tagout', 'machine_guarding', 'electrical'],
  {
    presentHazardFamilies: ['hydraulic_pneumatic_energy'],
    defensibleHazardFamilies: ['lockout_tagout', 'machine_guarding', 'electrical'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'LP-B1-G1',
      description: 'whether the pump drive was locked and tagged at its disconnect and the '
        + 'discharge line bled down, or whether the local OFF switch is the only isolation applied',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-B2 unchanged, where the model recovered this gap exactly, '
      + 'labelled it REQUIRED_CONTROL rather than HAZARD_EXISTENCE, and declared the linkage. It is '
      + 'retained as the proven positive control for both retention and required linkage.',
  },
);

/** Carried from v1 DP-B3, recovered exactly. */
const B2 = row(
  'LP-B2',
  'Two employees entered a below-grade concrete vault through a twenty-four inch top opening to pull '
  + 'cable. The vault is about eight feet deep with fixed ladder access and no continuous forced '
  + 'ventilation. Nothing in the vault was sampled before entry and no attendant was posted at the '
  + 'opening.',
  ['atmospheric_hazard', 'fall_protection', 'training_procedure_supervision', 'mobile_equipment'],
  {
    presentHazardFamilies: [],
    defensibleHazardFamilies:
      ['atmospheric_hazard', 'fall_protection', 'training_procedure_supervision'],
    forbiddenHazardFamilies: ['mobile_equipment'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'LP-B2-G1',
      description: 'whether this vault has been evaluated and classified under the site '
        + 'permit-required confined space program',
      affectedDecision: 'APPLICABILITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-B3 unchanged, where the model recovered this gap exactly and '
      + 'labelled it APPLICABILITY rather than REQUIRED_CONTROL. An unsampled atmosphere is an '
      + 'UNEVALUATED atmosphere, not a stated hazard, so that family stays defensible.',
  },
);

/**
 * REPLACES v1 DP-B4. The old authored gap -- how long the worker had been breaking concrete --
 * did not survive the counterfactual test, and the model said so.
 */
const B3 = row(
  'LP-B3',
  'A worker was operating a pneumatic chipping hammer in the number 2 bay with no hearing protection '
  + 'in use and none available at the workstation. The site industrial hygienist took a personal '
  + 'noise dosimetry reading on this task last month; the result is not recorded in the station file '
  + 'and was not available at the time of the walkthrough. Two other employees work within ten feet '
  + 'of the hammer for most of the shift.',
  ['noise_exposure', 'personal_protective_equipment', 'machine_guarding', 'fall_protection'],
  {
    presentHazardFamilies: ['noise_exposure'],
    defensibleHazardFamilies: ['personal_protective_equipment'],
    forbiddenHazardFamilies: ['machine_guarding', 'fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'LP-B3-G1',
      description: 'the measured noise exposure level for this task, which the site already has on '
        + 'record but which was not available at the station',
      affectedDecision: 'HAZARD_SEVERITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'The magnitude control, rebuilt so its two branches actually diverge. A measured exposure '
      + 'below the action level makes hearing protection discretionary and the correct step is to '
      + 'file the result; at or above it, a hearing conservation programme and protection are owed '
      + 'now for the operator AND the two nearby employees. Those are different actions today, '
      + 'which is what the old DP-B4 gap lacked. The missing fact is concrete and already exists -- '
      + 'a specific measurement taken last month -- rather than an open-ended "how long".',
  },
);

/** REPLACES v1 DP-B1. Same contract property (EXPOSURE), entirely different surface facts. */
const B4 = row(
  'LP-B4',
  'A twelve foot section of handrail has been removed from the overhead crane runway walkway for '
  + 'weld repair, leaving the walkway open on the crane side twenty-two feet above the floor. The '
  + 'repair is expected to take three days. The observation does not establish whether anyone is '
  + 'required to access that walkway while the handrail is off.',
  ['fall_protection', 'suspended_loads', 'welding_fumes', 'material_handling_storage'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['welding_fumes', 'suspended_loads'],
    forbiddenHazardFamilies: ['material_handling_storage'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fall_protection'],
    decisionCriticalGaps: [{
      gapId: 'LP-B4-G1',
      description: 'whether any employee is required to access the crane runway walkway during the '
        + 'three days the handrail is removed',
      affectedDecision: 'EXPOSURE',
    }],
    recordedInteractions: [],
    authoringRationale:
      'The EXPOSURE control, rebuilt on unrelated surface facts so it tests the RULE rather than '
      + 'teaching v1 DP-B1. The two branches lead to different actions today: if access is required '
      + 'during the repair, a temporary rail or fall-arrest and an alternative route are owed now '
      + 'and access must be controlled; if the walkway is closed off for the three days, the repair '
      + 'proceeds as planned and nothing changes today. Welding fume and suspended loads are '
      + 'defensible from the stated weld repair and crane, without the text establishing either.',
  },
);

// ================================================================ L. LINKAGE
//
// §140 created ZERO required-linkage opportunities, so linkage came back unexercised. Each row here
// makes a question that DETERMINES A SPECIFIC CANDIDATE'S STATUS genuinely owed, which is the only
// way `relatesToCandidateKey` can be observed rather than assumed.
//
// A CONTRADICTION CANNOT BE COMMISSIONED. Asking whether a hazard exists while asserting it ACTIVE
// is a model ERROR, and a fixture cannot instruct one. L1 and L2 are the rows where such an error is
// most likely to surface if the model still makes it; arbitration itself is proven deterministically
// in `test:expert-linkage-contract`, never here.

/** L1 -- one clearly present hazard whose CONTROL status is open. Linkage is REQUIRED. */
const L1 = row(
  'LP-L1',
  'The lower access door on the number 5 mixer is standing open with the agitator shaft visible '
  + 'inside. A production operator reached through the open door to scrape the wall of the bowl '
  + 'while I watched. The interlock switch on that door has a cable-tie looped around its actuator '
  + 'and the observation does not establish whether the drive is de-energized at its disconnect.',
  ['machine_guarding', 'lockout_tagout', 'electrical'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['lockout_tagout', 'electrical'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [{
      gapId: 'LP-L1-G1',
      description: 'whether the mixer drive is de-energized and locked at its disconnect, given the '
        + 'interlock has been defeated with a cable tie',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'A defeated interlock with an operator reaching inside is a stated present guarding hazard, so '
      + 'a candidate should be raised. Whether the drive is isolated DETERMINES THAT CANDIDATE\'S '
      + 'STATUS, which makes the link REQUIRED under the v8 contract. The question is about a '
      + 'control, so it must be labelled REQUIRED_CONTROL and must NOT be arbitrated away.',
  },
);

/** L2 -- same shape, different family, and the deterministic engine is unlikely to own it. */
const L2 = row(
  'LP-L2',
  'A vacuum tanker was parked over the sump with its suction hose run into the pit and the pump '
  + 'running. The pit had been used to collect washdown from the solvent recovery skid. No gas '
  + 'detector was in use at the pit edge and the tanker engine was running four feet from the '
  + 'opening. Whether the pit was purged before the hose went in is not established.',
  ['atmospheric_hazard', 'fire_explosion', 'mobile_equipment', 'fall_protection'],
  {
    presentHazardFamilies: ['fire_explosion'],
    defensibleHazardFamilies: ['atmospheric_hazard', 'mobile_equipment'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fire_explosion'],
    decisionCriticalGaps: [{
      gapId: 'LP-L2-G1',
      description: 'whether the pit was purged of flammable vapour before the suction hose was '
        + 'introduced and the tanker engine left running beside the opening',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'A running ignition source four feet from an unpurged solvent-washdown pit is a stated '
      + 'present ignition/fuel proximity. Whether the pit was purged DETERMINES whether that '
      + 'candidate stays ACTIVE, so the link is REQUIRED. A second linkage opportunity in an '
      + 'unrelated family, so a linkage result is not an artefact of one scenario type.',
  },
);

/**
 * L3 -- the hazard's EXISTENCE is genuinely open, so the candidate should be
 * INSUFFICIENT_EVIDENCE and a linked existence question is LEGITIMATE. Arbitration must NOT fire.
 */
const L3 = row(
  'LP-L3',
  'A drum labelled only with a handwritten shop code sits open beside the parts washer with a rag '
  + 'draped over the bung. An employee dips parts into it by hand without gloves. Nobody on shift '
  + 'could say what the drum contains and no data sheet is posted for the shop code.',
  ['chemical_inhalation_contact', 'hazcom', 'fire_explosion', 'machine_guarding'],
  {
    presentHazardFamilies: ['hazcom'],
    defensibleHazardFamilies: ['chemical_inhalation_contact', 'fire_explosion'],
    forbiddenHazardFamilies: ['machine_guarding'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'LP-L3-G1',
      description: 'what the drum contains, which is what decides whether a skin-contact or '
        + 'inhalation hazard exists at all for the bare-handed dipping',
      affectedDecision: 'HAZARD_EXISTENCE',
    }],
    recordedInteractions: [],
    authoringRationale:
      'THE VALID LINKED NON-CONTRADICTORY CASE. The labelling failure is stated and present, so a '
      + 'hazcom candidate is ACTIVE. Whether a chemical exposure hazard exists is genuinely open -- '
      + 'nobody knows what is in the drum -- so a chemical candidate should be raised as '
      + 'INSUFFICIENT_EVIDENCE, and a HAZARD_EXISTENCE question linked to THAT candidate is '
      + 'legitimate and must be RETAINED. Arbitration fires only against an ACTIVE candidate, so if '
      + 'it fires here the trigger is wrong.',
  },
);

/** L4 -- two candidates a question could equally mean. Linkage must remain ABSENT. */
const L4 = row(
  'LP-L4',
  'Two separate lift stations on the same line were opened for service this morning. The east '
  + 'station has its pump coupling exposed with the guard set aside, and the west station has its '
  + 'belt drive exposed with the cover leaning against the frame. Both units were running when '
  + 'observed. The observation does not record whether the site permit for guard removal covers '
  + 'either unit.',
  ['machine_guarding', 'lockout_tagout', 'training_procedure_supervision'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['lockout_tagout', 'training_procedure_supervision'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [{
      gapId: 'LP-L4-G1',
      description: 'whether a guard-removal permit is in force, which the observation leaves open '
        + 'for both exposed drives without distinguishing between them',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'THE AMBIGUITY CONTROL, and the single most important row in this set. Two exposed drives on '
      + 'one line invite two machine_guarding candidates, and the permit question applies equally to '
      + 'both. Under the v8 contract there is NO UNIQUE REFERENT, so relatesToCandidateKey MUST BE '
      + 'ABSENT. A link here is a FORBIDDEN link and is counted as a violation -- this is the row '
      + 'that would catch a model, or a future prompt revision, that has learned to always link.',
  },
);

// ================================================================ G. GOVERNED EVIDENCE

const G1 = row(
  'LP-G1',
  'The point of operation on the number 6 press brake is unguarded. There is no light curtain, no '
  + 'two-hand control and no fixed barrier at the die area. The operator hand-feeds blanks into the '
  + 'die on every stroke and was doing so throughout the observation.',
  ['machine_guarding', 'electrical', 'noise_exposure'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['noise_exposure'],
    forbiddenHazardFamilies: ['electrical'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-D1 unchanged, where the model grounded a statement in R1 without '
      + 'emitting a citation. The grounding positive control.',
  },
  { governedStandards: [RECORD_MACHINE_GUARDING_GENERAL] },
);

const G2 = row(
  'LP-G2',
  'The mezzanine floor opening used to pass stock between levels is unprotected on three sides. A '
  + 'hinged cover exists but was folded back and chained open. Employees stage totes at the edge of '
  + 'the opening, and the drop to the floor below is about eleven feet.',
  ['fall_protection', 'walking_working_surfaces', 'welding_fumes', 'material_handling_storage'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['walking_working_surfaces', 'material_handling_storage'],
    forbiddenHazardFamilies: ['welding_fumes'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fall_protection'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-E1 unchanged, carrying BOTH the unrelated-record and the citation-'
      + 'adversarial roles: a DRAFT-backed electrical record and an APPROVED welding-fume record, '
      + 'neither bearing on a floor opening, both citation-bearing before redaction. welding_fumes '
      + 'is forbidden so a record-induced candidate is detectable.',
  },
  {
    governedStandards: [RECORD_DRAFT_ELECTRICAL_WORK_PRACTICES, RECORD_WELDING_FUME_VENTILATION],
  },
);

const G3 = row(
  'LP-G3',
  'There is no written hazard communication program posted at the mixing station, and four of the '
  + 'six drums at the station carry no manufacturer label and no workplace label of any kind. '
  + 'Employees decant from those drums into portable containers each shift. Safety data sheets were '
  + 'not available at the station.',
  ['hazcom', 'chemical_inhalation_contact', 'respiratory_protection', 'machine_guarding'],
  {
    presentHazardFamilies: ['hazcom'],
    defensibleHazardFamilies: ['chemical_inhalation_contact', 'respiratory_protection'],
    forbiddenHazardFamilies: ['machine_guarding'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-D3 unchanged, where the model wrote "No governed record was '
      + 'supplied, so no regulatory obligation is asserted here." The strongest abstention control.',
  },
);

const G4 = row(
  'LP-G4',
  'Portable ladders are stored horizontally on wall hooks in the shop. In the yard, a fixed steel '
  + 'ladder runs twenty-six feet up the side of the surge bin to the top platform. The fixed ladder '
  + 'has no cage, no well and no ladder safety system, and two employees climb it twice per shift to '
  + 'read the level indicator.',
  ['fall_protection', 'walking_working_surfaces', 'material_handling_storage'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['walking_working_surfaces'],
    forbiddenHazardFamilies: ['material_handling_storage'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['fall_protection'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Carried forward from v1 DP-D4 unchanged, where the model refused the extension explicitly. '
      + 'The record is adjacent in subject and narrower in scope by its own text.',
  },
  { governedStandards: [RECORD_PORTABLE_LADDERS_ONLY] },
);

// ---------------------------------------------------------------- the set

export const LINKAGE_PROBE_FIXTURES: readonly LinkageProbeFixture[] = [
  { row: A1, roles: ['NO_GAP_CONTROL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'Proven v1 negative control, re-run for comparability against the §140 baseline.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'] },
  { row: A2, roles: ['NO_GAP_CONTROL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'Closed-out condition; tests the current-vs-historical rule and the genericness '
      + 'refusal.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'] },
  { row: A3, roles: ['NO_GAP_CONTROL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'High-severity fully specified exposure — where a coverage habit is most tempting.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'] },
  { row: A4, roles: ['NO_GAP_CONTROL', 'EMPTY_COLLECTION_CONTROL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'The all-empty control. §140 returned ANALYZED here on the strength of two '
      + 'CORRECT disagreements against deterministic over-flagging; watch whether that repeats.',
    expectedEmptyCollections: ['expertHazardCandidates', 'decisionCriticalClarifications',
      'crossHazardInsights', 'disagreements'] },

  { row: B1, roles: ['TRUE_GAP_CONTROL', 'LINKAGE_REQUIRED'], linkageExpectation: 'REQUIRED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'The one row §140 proved end to end: gap recovered, label exact, link declared '
      + 'and valid. Retained as the reference point for both retention and linkage.',
    expectedEmptyCollections: ['disagreements'] },
  { row: B2, roles: ['TRUE_GAP_CONTROL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'APPLICABILITY, recovered exactly in §140. Linkage is FORBIDDEN because the scope '
      + 'question bears on both emitted candidates equally — §140 correctly withheld the link, and '
      + 'the repaired measure must score that as correct rather than as a miss.',
    expectedEmptyCollections: ['disagreements'] },
  { row: B3, roles: ['TRUE_GAP_CONTROL'], linkageExpectation: 'ALLOWED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'REPLACES DP-B4. A magnitude whose two branches lead to different actions today, '
      + 'which the old authored gap did not.',
    expectedEmptyCollections: ['disagreements'],
    supersedes: { v1RowId: 'DP-B4',
      oldTruth: 'gap = "how long the worker has been performing the dry breaking task in the '
        + 'enclosed stairwell", affectedDecision HAZARD_SEVERITY',
      newTruth: 'gap = "the measured noise exposure level for this task, which the site already has '
        + 'on record but which was not available at the station", affectedDecision HAZARD_SEVERITY',
      whyOldWasInvalid:
        'The old gap fails the product contract it was written to exercise. Dry breaking of concrete '
        + 'in an enclosed stairwell with no water feed and no vacuum needs an engineering control '
        + 'whether the worker has been at it for fifteen minutes or four hours, so the two answers '
        + 'do NOT lead to different current outcomes and the v7 counterfactual test correctly '
        + 'refuses the question. §140 measured the model saying exactly that, unprompted: "the exact '
        + 'duration ... affects cumulative exposure but does not change the current control '
        + 'decision." The fixture was wrong; the model was right, and the model was NOT changed.' } },
  { row: B4, roles: ['TRUE_GAP_CONTROL'], linkageExpectation: 'ALLOWED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'REPLACES DP-B1. Same contract property (EXPOSURE), unrelated surface facts, and '
      + 'two branches that lead to visibly different actions today.',
    expectedEmptyCollections: ['disagreements'],
    supersedes: { v1RowId: 'DP-B1',
      oldTruth: 'gap = "whether any employee has entered, or is required to enter, the unprotected '
        + 'open section of the trench", affectedDecision EXPOSURE',
      newTruth: 'gap = "whether any employee is required to access the crane runway walkway during '
        + 'the three days the handrail is removed", affectedDecision EXPOSURE',
      whyOldWasInvalid:
        'NOT established as invalid — DP_B1_CAUSE = UNKNOWN. The persisted record excludes every '
        + 'harness loss path (issues [], mergeViolations [], PRESENT, one successful attempt), so '
        + 'the clarification list was empty as it left the model; but the model recorded no '
        + 'reasoning, so model omission and a correct counterfactual refusal cannot be told apart. '
        + 'The row is REPLACED rather than repaired precisely because tuning to it would teach the '
        + 'row instead of testing the rule. Both branches of the new gap end in different actions '
        + 'today — control access and provide an alternative route now, versus proceed as planned — '
        + 'which the old trench gap arguably did not, since both of its branches end in "install a '
        + 'protective system".' } },

  { row: L1, roles: ['LINKAGE_REQUIRED'], linkageExpectation: 'REQUIRED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'A stated present guarding hazard whose CONTROL status is open, so a question '
      + 'determining that candidate\'s status is genuinely owed and the link is REQUIRED.',
    expectedEmptyCollections: [] },
  { row: L2, roles: ['LINKAGE_REQUIRED'], linkageExpectation: 'REQUIRED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'A second required-linkage opportunity in an unrelated family, so the result is '
      + 'not an artefact of one scenario type.',
    expectedEmptyCollections: [] },
  { row: L3, roles: ['LINKAGE_REQUIRED'], linkageExpectation: 'REQUIRED',
    contradictionIsAModelError: true,
    whyDiagnostic: 'THE VALID LINKED NON-CONTRADICTORY CASE. Existence is genuinely open, so the '
      + 'candidate should be INSUFFICIENT_EVIDENCE and a linked HAZARD_EXISTENCE question must be '
      + 'RETAINED. If arbitration fires here, the trigger is wrong.',
    expectedEmptyCollections: [] },
  { row: L4, roles: ['LINKAGE_AMBIGUOUS_MUST_NOT_LINK'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'THE AMBIGUITY CONTROL. Two candidates a single question could equally mean, so '
      + 'linkage must remain ABSENT. Catches a model — or a prompt revision — that has learned to '
      + 'always link.',
    expectedEmptyCollections: [] },

  { row: G1, roles: ['GOVERNED_RELEVANT', 'EMPTY_COLLECTION_CONTROL'],
    linkageExpectation: 'FORBIDDEN', contradictionIsAModelError: true,
    whyDiagnostic: 'The grounding positive control, proven in §140.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'] },
  { row: G2, roles: ['GOVERNED_UNRELATED', 'CITATION_ADVERSARIAL'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'Unrelated and non-approved records, both citation-bearing before redaction. '
      + 'Exercises input redaction, support refusal and the fail-closed boundary in one row.',
    expectedEmptyCollections: ['crossHazardInsights'] },
  { row: G3, roles: ['GOVERNED_ABSENT'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'Abstention with no record at all, on the observation most likely to pull a '
      + 'memorised obligation out of the model.',
    expectedEmptyCollections: ['disagreements'] },
  { row: G4, roles: ['GOVERNED_NARROWER'], linkageExpectation: 'FORBIDDEN',
    contradictionIsAModelError: true,
    whyDiagnostic: 'Extension refusal against a record that is adjacent in subject and narrower by '
      + 'its own text.',
    expectedEmptyCollections: ['crossHazardInsights'] },
];

export const LINKAGE_PROBE_ROWS: readonly FormalCohortRow[] =
  LINKAGE_PROBE_FIXTURES.map(f => f.row);

export function linkageFixtureByRowId(rowId: string): LinkageProbeFixture | undefined {
  return LINKAGE_PROBE_FIXTURES.find(f => f.row.source.rowId === rowId);
}

export function linkageRowsWithRole(role: LinkageProbeRole): LinkageProbeFixture[] {
  return LINKAGE_PROBE_FIXTURES.filter(f => f.roles.includes(role));
}

/**
 * The development advancement criteria for the NEXT probe, transcribed from the authorization so
 * they are frozen before the probe runs rather than chosen after seeing the result.
 *
 * NOT FORMAL THRESHOLDS. No frozen scorer, no formal gate, no acceptance implication.
 */
export const NEXT_PROBE_ADVANCEMENT_CRITERIA = [
  { id: 1, name: 'clarification negative controls', target: '>= 3 of 4 NO-GAP controls silent' },
  { id: 2, name: 'TRUE-GAP retention', target: '>= 3 of 4 semantically correct' },
  { id: 3, name: 'required-linkage population', target: '>= 3 of 4 valid links on REQUIRED rows' },
  { id: 4, name: 'contradictory linked cases',
    target: 'arbitration fires on every correctly linked contradiction that occurs' },
  { id: 5, name: 'invalid linkages', target: '0 accepted' },
  { id: 6, name: 'unrelated / no-record governed controls', target: 'all abstain' },
  { id: 7, name: 'relevant record', target: 'at least one grounded positive' },
  { id: 8, name: 'unsupported accepted citation', target: '0' },
  { id: 9, name: 'combined deterministic + Expert truth coverage',
    target: 'no material regression versus the §140 development baseline '
      + '(1 truth-present family covered by neither layer, of 16 rows)' },
] as const;
