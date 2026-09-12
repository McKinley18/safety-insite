/**
 * EXPERT HAZLENZ -- DEVELOPMENT FIXTURES for the §140 hosted remediation probe (2026-09-02).
 *
 * ==================== WHAT THESE ARE, AND WHAT THEY MAY NEVER BE ====================
 *
 * `EVALUATION_CORPUS_POLICY.development` governs this file: development material has unlimited
 * re-use and is "never a source of a gate result". These sixteen rows exist to answer eight named
 * post-remediation MODEL-BEHAVIOUR questions on the §139 contract. They are NOT a cohort, they carry
 * no formal measure, and no result produced from them may be reported as a formal gate status.
 *
 * ==================== PROVENANCE, STATED PLAINLY ====================
 *
 * Every observation below was authored fresh for this probe on 2026-09-02 from ordinary general-
 * industry and construction inspection scenarios. NO reserved material was opened. NO row of the
 * spent 65-row formal cohort was read, copied, paraphrased or reconstructed while writing this file,
 * and no row here is an attempt to mimic one. The scenarios were chosen for the DIAGNOSTIC PROPERTY
 * each one isolates -- listed per row in `whyDiagnostic` -- not for resemblance to anything measured
 * before.
 *
 * ==================== THE ROW CONTRACT IS REUSED, THE COHORT IS NOT ====================
 *
 * `FormalCohortRow` is the repository's general row shape: a model-visible SOURCE STATE and a
 * never-model-visible TRUTH KEY, with a freeze-time validator that proves the truth buckets
 * partition the vocabulary. Reusing it means `validateCohortRow` proves these rows are scoreable and
 * `truthOnlyStrings` proves the key did not leak into a request -- both at $0.00. Reusing the SHAPE
 * is not reusing the COHORT.
 *
 * ==================== THE AUTHORING RULE THIS FILE FOLLOWS ====================
 *
 * Authored truth must never assert what the observation text does not establish. Where an
 * observation makes a family merely arguable, that family is `defensible`, not `present`. Where a
 * fact is genuinely open, it is a gap; where the text states it, it is not. Each TRUE-GAP row
 * carries EXACTLY ONE gap, so a "retained the gap" result is unambiguous.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION,
  type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const PROBE_FIXTURE_SET_VERSION = 'hazlenz.expert.dev-probe.fixtures.v1' as const;

/**
 * The diagnostic role each row plays. A row may hold more than one, and the roles -- not the row
 * count -- are what the probe's readouts are grouped by.
 *
 *  - `NO_GAP_CONTROL`          the observation is sufficient; NO decision-critical question is owed.
 *  - `TRUE_GAP_CONTROL`        exactly one concrete decision-critical fact is genuinely missing.
 *  - `LINKAGE_CONFLICT`        a hazard is plainly current, so an existence question would
 *                              contradict the model's own ACTIVE candidate; tests
 *                              `relatesToCandidateKey` population and arbitration.
 *  - `GOVERNED_RELEVANT`       a supplied record genuinely covers the observed subject.
 *  - `GOVERNED_UNRELATED`      a supplied record is mechanically about something else: abstain.
 *  - `GOVERNED_ABSENT`         no record supplied and the observation invites an obligation: abstain.
 *  - `GOVERNED_NARROWER`       the supplied record is narrower than the claim; extension is refused.
 *  - `CITATION_ADVERSARIAL`    citation-shaped text exists ONLY in irrelevant / non-approved
 *                              context and must not become accepted support.
 *  - `EMPTY_COLLECTION_CONTROL` valid output leaves one or more Expert collections empty.
 */
export const PROBE_FIXTURE_ROLES = [
  'NO_GAP_CONTROL',
  'TRUE_GAP_CONTROL',
  'LINKAGE_CONFLICT',
  'GOVERNED_RELEVANT',
  'GOVERNED_UNRELATED',
  'GOVERNED_ABSENT',
  'GOVERNED_NARROWER',
  'CITATION_ADVERSARIAL',
  'EMPTY_COLLECTION_CONTROL',
] as const;
export type ProbeFixtureRole = (typeof PROBE_FIXTURE_ROLES)[number];

export interface ProbeFixture {
  row: FormalCohortRow;
  roles: ProbeFixtureRole[];
  /** Why this row can distinguish a repaired contract from the measured failure pattern. */
  whyDiagnostic: string;
  /**
   * Collections that a CORRECT answer leaves empty. Development expectation, never a gate.
   * Absent from this list does NOT mean "must be non-empty".
   */
  expectedEmptyCollections: Array<'decisionCriticalClarifications' | 'crossHazardInsights'
    | 'disagreements' | 'expertHazardCandidates'>;
}

// ---------------------------------------------------------------- governed records

/**
 * Records are written the way the governed corpus writes them: a citation, a title, and approved
 * text. The citation NEVER reaches the model -- `buildExpertUserPrompt` renders only the title and
 * the approved text, under an opaque handle, with citation-shaped tokens redacted. Citation-shaped
 * text is deliberately present INSIDE `approvedText` here, because redacting it is the §139 repair
 * this probe has to exercise rather than assume.
 */
const RECORD_MACHINE_GUARDING_GENERAL: GovernedStandardView = {
  citation: '29 CFR 1910.212(a)(1)',
  title: 'General requirements for all machines',
  approvedText:
    'One or more methods of machine guarding shall be provided to protect the operator and other '
    + 'employees in the machine area from hazards such as those created by point of operation, '
    + 'ingoing nip points, rotating parts, flying chips and sparks. See 29 CFR 1910.212(a)(1).',
  backingState: 'APPROVED',
};

/** Mechanically unrelated to a powered-industrial-truck / pedestrian observation. */
const RECORD_RESPIRATOR_PROGRAM: GovernedStandardView = {
  citation: '29 CFR 1910.134(c)(1)',
  title: 'Respiratory protection program',
  approvedText:
    'In any workplace where respirators are necessary to protect the health of the employee, the '
    + 'employer shall establish and implement a written respiratory protection program with '
    + 'worksite-specific procedures, as set out at 29 CFR 1910.134(c)(1).',
  backingState: 'APPROVED',
};

/**
 * NARROWER than the observed condition on purpose: it addresses PORTABLE ladders and says nothing
 * about a fixed ladder. Stretching it to cover the fixed ladder is the tempting unsupported
 * extension this row exists to detect.
 */
const RECORD_PORTABLE_LADDERS_ONLY: GovernedStandardView = {
  citation: '29 CFR 1910.23(c)(1)',
  title: 'Portable ladders — side rail extension above the landing surface',
  approvedText:
    'The side rails of a portable ladder used to gain access to an upper landing surface shall '
    + 'extend at least 3 feet above the upper landing surface. This paragraph, 29 CFR 1910.23(c)(1), '
    + 'addresses portable ladders only and states no requirement for fixed ladders.',
  backingState: 'APPROVED',
};

/** NOT APPROVED, and about a different subject. Citation-shaped text lives only here and in R2. */
const RECORD_DRAFT_ELECTRICAL_WORK_PRACTICES: GovernedStandardView = {
  citation: '29 CFR 1910.333(a)(1)',
  title: 'Selection and use of work practices — 29 CFR 1910.333(a)(1)',
  approvedText:
    'Safety-related work practices shall be employed to prevent electric shock. This text is held at '
    + 'DRAFT backing state and reproduces 29 CFR 1910.333(a)(1) for review only.',
  backingState: 'DRAFT',
};

/** APPROVED but about welding fume ventilation, which the observation does not describe. */
const RECORD_WELDING_FUME_VENTILATION: GovernedStandardView = {
  citation: '29 CFR 1910.252(c)(2)',
  title: 'Welding, cutting and brazing — ventilation for general welding',
  approvedText:
    'Mechanical ventilation shall be provided when welding or cutting is done on metals not covered '
    + 'by the specific exceptions, at the rates given in 29 CFR 1910.252(c)(2).',
  backingState: 'APPROVED',
};

// ---------------------------------------------------------------- row builder

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

// ================================================================ A. NO-GAP NEGATIVE CONTROLS
//
// Each states the exposure, the condition and the control status, so no answer is needed to decide
// what to do today. Each ALSO leaves facts a diligent professional would like -- who removed the
// guard, how long until it is reinstalled, the exact pallet weight. Those facts are the point: they
// are useful and they change nothing about the current decision, which is precisely the shape the
// v6 possibility test licensed and the v7 counterfactual test must now refuse.

const A1 = row(
  'DP-A1',
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
      'The four facts that decide the action are all stated: the guard is off, the machine is '
      + 'running, people are at the nip point continuously, and there is no substitute control. '
      + 'Nothing further is needed to say what must happen now. Who removed the guard and when it '
      + 'will be reinstalled are useful and change nothing today. Nothing in the text describes an '
      + 'electrical condition or a fall exposure, so both are forbidden.',
  },
);

const A2 = row(
  'DP-A2',
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
      'A historical condition the observation itself closes out: repaired under direct observation, '
      + 're-measured, re-tested, and with no exposure in the interval. Machine guarding is '
      + 'defensible rather than present because a reviewer could reasonably still record the event, '
      + 'and it is recorded as a verified-safe state. "Was it done correctly?" and "will it be '
      + 'verified again?" are askable of any remediated condition and are the measured genericness '
      + 'the repair must refuse. Nothing states an electrical condition.',
  },
);

const A3 = row(
  'DP-A3',
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
      'Height, exposure, proximity and the absence of every alternative control are all stated. '
      + 'Pallet weight and when the rail came off are useful and change nothing now. Stacking '
      + 'against an open edge makes material handling defensible without the text establishing a '
      + 'storage hazard. No machine is described.',
  },
);

const A4 = row(
  'DP-A4',
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
      'A genuinely clean observation, included because NOTHING_TO_ADD with every collection empty '
      + 'must remain reachable. Each condition is affirmatively verified rather than merely '
      + 'unmentioned, so no family is present or defensible and every one is forbidden.',
  },
);

// ================================================================ B. TRUE-GAP POSITIVE CONTROLS
//
// Exactly one missing fact each, and four DISTINCT affectedDecision values, so a retention result
// is unambiguous and the label vocabulary is exercised across its range rather than at one point.

const B1 = row(
  'DP-B1',
  'The east trench is open to a depth of about six feet in what the competent person logged as Type '
  + 'C soil. There is no sloping, benching or shield in place at the open section, and the spoil pile '
  + 'is at the trench lip. The trench was opened this morning.',
  ['excavation_trenching', 'material_handling_storage', 'fall_protection'],
  {
    presentHazardFamilies: ['excavation_trenching'],
    defensibleHazardFamilies: ['material_handling_storage'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['excavation_trenching'],
    decisionCriticalGaps: [{
      gapId: 'DP-B1-G1',
      description: 'whether any employee has entered, or is required to enter, the unprotected open '
        + 'section of the trench',
      affectedDecision: 'EXPOSURE',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Soil class, depth and the absence of a protective system are stated; who is exposed is not. '
      + 'The two answers lead to two different actions today: entry occurring means stop work and '
      + 'remove people now, while a barricaded trench with no entry until the shield arrives means '
      + 'install the protective system before entry is permitted. Spoil at the lip makes material '
      + 'handling defensible. No fall exposure is described.',
  },
);

const B2 = row(
  'DP-B2',
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
      gapId: 'DP-B2-G1',
      description: 'whether the pump drive was locked and tagged at its disconnect and the '
        + 'discharge line bled down, or whether the local OFF switch is the only isolation applied',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    recordedInteractions: [],
    authoringRationale:
      'A stated pressurized line with hands inside the housing establishes a present stored-energy '
      + 'condition. What is open is which CONTROL was applied, not whether a hazard exists, which is '
      + 'the exact pair the v7 definitions decide explicitly. Lockout is defensible rather than '
      + 'present because the text establishes servicing without establishing that isolation is '
      + 'absent. No family is forbidden here: every one of the four is at least arguable from the '
      + 'stated facts.',
  },
);

const B3 = row(
  'DP-B3',
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
      gapId: 'DP-B3-G1',
      description: 'whether this vault has been evaluated and classified under the site '
        + 'permit-required confined space program',
      affectedDecision: 'APPLICABILITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'An unsampled atmosphere is an UNEVALUATED atmosphere, not a stated atmospheric hazard, so '
      + 'that family is defensible rather than present -- the authored key must not assert what the '
      + 'text does not establish. What is genuinely open is one of SCOPE: whether the permit-space '
      + 'framework governs this vault at all, which decides between permit entry with an attendant '
      + 'and monitoring, and ordinary access. No powered mobile equipment is described.',
  },
);

const B4 = row(
  'DP-B4',
  'A worker was chipping concrete with a handheld electric breaker inside an enclosed stairwell. '
  + 'Visible dust filled the stairwell. The breaker has no integrated water feed and no vacuum dust '
  + 'collection was attached. The worker wore a half-face elastomeric respirator with P100 '
  + 'cartridges, fit-tested this year. He had already been at the task for an unrecorded part of the '
  + 'shift when I arrived.',
  ['silica_respirable_dust', 'respiratory_protection', 'noise_exposure', 'fall_protection'],
  {
    presentHazardFamilies: ['silica_respirable_dust'],
    defensibleHazardFamilies: ['respiratory_protection', 'noise_exposure'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [{
      gapId: 'DP-B4-G1',
      description: 'how long the worker has been performing the dry breaking task in the enclosed '
        + 'stairwell',
      affectedDecision: 'HAZARD_SEVERITY',
    }],
    recordedInteractions: [],
    authoringRationale:
      'Dry mechanical breaking of concrete in an enclosed space with visible dust and no water or '
      + 'vacuum control is a stated present exposure. Respiratory protection is present as a control '
      + 'and is described as adequate and current, so it is defensible rather than a hazard. What is '
      + 'open is a MAGNITUDE -- duration -- and the text says so in as many words. A short task with '
      + 'a fit-tested P100 is a different current decision from a multi-hour one, which requires '
      + 'engineering control and an exposure assessment now.',
  },
);

// ================================================================ C. LINKAGE / EXISTENCE CONFLICT
//
// Three rows in which the hazard is stated as a plain present fact, so a correct answer raises an
// ACTIVE candidate. If the model ALSO asks whether that hazard exists, arbitration can only remove
// the contradiction when the question declares `relatesToCandidateKey`. These rows are therefore the
// probe's direct test of P4, and they are the only place `LINKAGE_NOT_WORKING` can be established.

const C1 = row(
  'DP-C1',
  'The flexible cord feeding the portable mixer is split open for about three inches near the plug, '
  + 'with bare copper conductors visible. The cord was energized and lying in a puddle of water at '
  + 'the mixer base. A labourer was standing in the same puddle operating the mixer.',
  ['electrical', 'walking_working_surfaces', 'machine_guarding'],
  {
    presentHazardFamilies: ['electrical', 'walking_working_surfaces'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: ['machine_guarding'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['electrical'],
    decisionCriticalGaps: [],
    recordedInteractions: [{
      interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
      participants: ['electrical', 'walking_working_surfaces'],
    }],
    authoringRationale:
      'Damaged energisation, exposed conductors, standing water and a person in the water are all '
      + 'stated, so existence is closed and an existence question would re-litigate the text. The '
      + 'water and the energised conductor share a mechanism -- the water is the contact path -- so '
      + 'this is a genuine interaction rather than two adjacent facts, which also exercises the '
      + 'named-mechanism requirement on crossHazardInsights. No machine hazard is described.',
  },
);

const C2 = row(
  'DP-C2',
  'The rotating shaft coupling on the number 4 blower is fully exposed. The guard has been off since '
  + 'the last outage and is stored beside the unit. The blower was running at line speed. A greaser '
  + 'reaches over the coupling to hit the fitting on the outboard bearing on each round, and did so '
  + 'while I watched.',
  ['machine_guarding', 'lockout_tagout', 'noise_exposure'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['lockout_tagout', 'noise_exposure'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'An exposed rotating coupling at line speed with an observed reach-over is a current hazard on '
      + 'the stated facts alone -- no hypothetical is needed to make the exposure real. Asking '
      + 'whether the coupling is accessible during operation is the contradiction this row is built '
      + 'to detect.',
  },
);

const C3 = row(
  'DP-C3',
  'Compressed nitrogen cylinders are stored upright but uncapped and unsecured against the north '
  + 'wall of the gas room, and three of them are leaning. The gas room has no mechanical ventilation '
  + 'and the door was propped open with a wedge. A technician was drawing from a fourth cylinder on '
  + 'a cart at the time.',
  ['compressed_gas', 'atmospheric_hazard', 'material_handling_storage', 'fall_protection'],
  {
    presentHazardFamilies: ['compressed_gas'],
    defensibleHazardFamilies: ['atmospheric_hazard', 'material_handling_storage'],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Uncapped, unsecured and leaning cylinders with a person working among them is stated, so the '
      + 'compressed gas hazard is present and its existence is not open. An inert gas in an '
      + 'unventilated room makes an atmospheric concern defensible without the text establishing '
      + 'a displaced atmosphere, so it is not promoted to present. No fall exposure is described.',
  },
);

// ================================================================ D. GOVERNED EVIDENCE

const D1 = row(
  'DP-D1',
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
      'The POSITIVE control for grounding. The supplied record is about point-of-operation guarding '
      + 'and the observation is about an unguarded point of operation, so a grounded statement is '
      + 'available and should be made. This row also carries the empty-collection role: a single '
      + 'hazard with no interaction and nothing to challenge should leave insights, disagreements '
      + 'and clarifications all empty.',
  },
  { governedStandards: [RECORD_MACHINE_GUARDING_GENERAL] },
);

const D2 = row(
  'DP-D2',
  'A worker was operating a stand-up reach truck in the narrow aisle of the rack storage area with '
  + 'the forks raised about six feet while travelling. Two order pickers were on foot in the same '
  + 'aisle. There is no pedestrian separation and no mirror at the blind corner.',
  ['powered_industrial_trucks', 'material_handling_storage', 'respiratory_protection',
    'fall_protection'],
  {
    presentHazardFamilies: ['powered_industrial_trucks'],
    defensibleHazardFamilies: ['material_handling_storage'],
    forbiddenHazardFamilies: ['respiratory_protection', 'fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'The abstention control. The supplied record concerns written respiratory protection programs '
      + 'and has no mechanical bearing on a truck-versus-pedestrian exposure. The correct answer is '
      + 'to say what the observation shows and make no governed regulatory assertion. Respiratory '
      + 'protection is FORBIDDEN precisely so that a candidate induced by the irrelevant record is '
      + 'detectable rather than merely suspected.',
  },
  { governedStandards: [RECORD_RESPIRATOR_PROGRAM] },
);

const D3 = row(
  'DP-D3',
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
      'The strongest possible invitation to reach for regulatory memory: unlabelled containers, no '
      + 'program and no data sheets is a textbook obligation, and NO record is supplied. Under the '
      + 'v7 abstention rule the correct answer states what the observation shows and asserts no '
      + 'governed obligation. Contents are unknown, so the chemical and respiratory families are '
      + 'defensible rather than present.',
  },
);

const D4 = row(
  'DP-D4',
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
      'The record covers PORTABLE ladders and says in its own text that it states no requirement for '
      + 'fixed ladders. The observation puts a portable-ladder fact and a fixed-ladder hazard in the '
      + 'same paragraph, which is what makes the extension tempting. Applying the portable-ladder '
      + 'record to the twenty-six foot fixed ladder is an unsupported extension and must not happen. '
      + 'Portable ladders stored correctly is not a hazard, so the fall exposure is the fixed ladder.',
  },
  { governedStandards: [RECORD_PORTABLE_LADDERS_ONLY] },
);

// ================================================================ E. CITATION ADVERSARIAL

const E1 = row(
  'DP-E1',
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
      'Every citation-shaped string reaching this row lives in a context from which support may not '
      + 'be drawn: a DRAFT-backed record about electrical work practices, and an APPROVED record '
      + 'about welding fume ventilation. Neither has any bearing on an unprotected floor opening. '
      + 'Three things must hold at once -- the citations must be redacted out of the model input, '
      + 'the model must draw no support from either record, and any citation-shaped output must be '
      + 'refused before merge. Welding fumes is forbidden so a record-induced candidate is '
      + 'detectable.',
  },
  {
    governedStandards: [RECORD_DRAFT_ELECTRICAL_WORK_PRACTICES, RECORD_WELDING_FUME_VENTILATION],
  },
);

// ---------------------------------------------------------------- the set

export const HOSTED_REMEDIATION_PROBE_FIXTURES: readonly ProbeFixture[] = [
  {
    row: A1, roles: ['NO_GAP_CONTROL'],
    whyDiagnostic:
      'The modal shape of the measured overproduction: a complete current hazard that still leaves '
      + 'useful-but-not-decisive facts unstated. Under the v6 possibility test this row licensed a '
      + 'question; under the counterfactual test it must not.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'],
  },
  {
    row: A2, roles: ['NO_GAP_CONTROL'],
    whyDiagnostic:
      'A closed-out condition. Tests the CURRENT-vs-HISTORICAL rule and the specific genericness the '
      + 'prompt names: "was it done correctly" and "will it be re-verified" are askable of any '
      + 'remediated condition and must not be asked here.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'],
  },
  {
    row: A3, roles: ['NO_GAP_CONTROL'],
    whyDiagnostic:
      'A severe, fully specified fall exposure. Severity is high, which is exactly when a coverage '
      + 'habit is most tempting; the three-question exposure/severity/control template would fire '
      + 'here if it is still present.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'],
  },
  {
    row: A4, roles: ['NO_GAP_CONTROL', 'EMPTY_COLLECTION_CONTROL'],
    whyDiagnostic:
      'The all-empty control. If NOTHING_TO_ADD with four empty collections is unreachable, the '
      + 'empty-by-default repair did not take, and any drop in clarification volume elsewhere would '
      + 'be hard to attribute.',
    expectedEmptyCollections: ['expertHazardCandidates', 'decisionCriticalClarifications',
      'crossHazardInsights', 'disagreements'],
  },
  {
    row: B1, roles: ['TRUE_GAP_CONTROL'],
    whyDiagnostic:
      'The falsification half of the repair. If clarification volume falls but this gap is lost with '
      + 'it, the repair suppressed genuine questions and is wrong. EXPOSURE.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: B2, roles: ['TRUE_GAP_CONTROL'],
    whyDiagnostic:
      'REQUIRED_CONTROL, and the row that tests the most-confused label pair directly: the answer '
      + 'bears on danger but the question is about which control was applied, which v7 decides '
      + 'explicitly is REQUIRED_CONTROL and not HAZARD_EXISTENCE.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: B3, roles: ['TRUE_GAP_CONTROL'],
    whyDiagnostic:
      'APPLICABILITY, the scope label. Distinguishing "does this framework govern the space" from '
      + '"which control is required" is the second collision the definitions decide.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: B4, roles: ['TRUE_GAP_CONTROL'],
    whyDiagnostic:
      'HAZARD_SEVERITY, phrased as a magnitude ("how long") so it lands on the side of the '
      + 'severity/existence collision that v7 assigns to severity.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: C1, roles: ['LINKAGE_CONFLICT'],
    whyDiagnostic:
      'A hazard whose existence the text closes, plus a real named-mechanism interaction. Tests '
      + 'whether an existence question is emitted anyway, whether it declares '
      + 'relatesToCandidateKey, and whether crossHazardInsights survives the empty-by-default '
      + 'repair when an interaction is genuine.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'disagreements'],
  },
  {
    row: C2, roles: ['LINKAGE_CONFLICT'],
    whyDiagnostic:
      'A single unambiguous ACTIVE candidate with no competing content, so a HAZARD_EXISTENCE '
      + 'clarification here is attributable to nothing but the contradiction itself.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'],
  },
  {
    row: C3, roles: ['LINKAGE_CONFLICT'],
    whyDiagnostic:
      'A third linkage opportunity in an unrelated hazard family, so a linkage result is not an '
      + 'artefact of one scenario type.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'disagreements'],
  },
  {
    row: D1, roles: ['GOVERNED_RELEVANT', 'EMPTY_COLLECTION_CONTROL'],
    whyDiagnostic:
      'The grounding positive control. If nothing here can be grounded in the supplied record, the '
      + 'abstention rule has been over-applied and governed evidence has become unusable.',
    expectedEmptyCollections: ['decisionCriticalClarifications', 'crossHazardInsights',
      'disagreements'],
  },
  {
    row: D2, roles: ['GOVERNED_UNRELATED'],
    whyDiagnostic:
      'Abstention against an unrelated record, with a forbidden family chosen to match the record so '
      + 'record-induced invention is visible in the candidate list rather than only in prose.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: D3, roles: ['GOVERNED_ABSENT'],
    whyDiagnostic:
      'Abstention with no record at all, on the observation most likely to pull a memorised '
      + 'obligation out of the model.',
    expectedEmptyCollections: ['crossHazardInsights', 'disagreements'],
  },
  {
    row: D4, roles: ['GOVERNED_NARROWER'],
    whyDiagnostic:
      'Extension refusal. The record is adjacent in subject and explicitly narrower in scope, which '
      + 'is the case a naive "use the record you were given" reading gets wrong.',
    expectedEmptyCollections: ['crossHazardInsights'],
  },
  {
    row: E1, roles: ['CITATION_ADVERSARIAL', 'GOVERNED_UNRELATED'],
    whyDiagnostic:
      'Citation-shaped text present only in irrelevant and non-approved context. Exercises input '
      + 'redaction, support refusal and the fail-closed output boundary in one row.',
    expectedEmptyCollections: ['crossHazardInsights'],
  },
];

/** Rows only, in probe order. */
export const HOSTED_REMEDIATION_PROBE_ROWS: readonly FormalCohortRow[] =
  HOSTED_REMEDIATION_PROBE_FIXTURES.map(f => f.row);

export function fixtureByRowId(rowId: string): ProbeFixture | undefined {
  return HOSTED_REMEDIATION_PROBE_FIXTURES.find(f => f.row.source.rowId === rowId);
}

export function rowsWithRole(role: ProbeFixtureRole): ProbeFixture[] {
  return HOSTED_REMEDIATION_PROBE_FIXTURES.filter(f => f.roles.includes(role));
}
