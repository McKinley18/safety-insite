/**
 * EXPERT HAZLENZ -- §148 SETTLEMENT-THRESHOLD + affectedDecision-ROUTING REGRESSION SET. v6.
 *
 * ==================== WHAT THIS SET IS FOR, AND WHAT IT IS NOT ====================
 *
 * TEN rows across TEN safety domains, built to answer TWO questions and nothing else:
 *
 *   1. Does the v11 CONJUNCTIVE threshold clause stop the CR-D1 over-firing WITHOUT reverting the
 *      v10 recovery that CR-E2 and CR-F1 proved?
 *   2. Does the v11 `affectedDecision` routing disclosure keep a substantively valid clarification
 *      ALIVE through arbitration, while a genuine contradiction is still rejected?
 *
 * It is not an expanded validation, not a cohort, not a candidate or insight instrument, and -- as
 * with v5, and for the reason §146 established -- IT AUTHORS NO DISAGREEMENT OR INSIGHT TRUTH AT ALL.
 *
 * ==================== THE SIX OPPORTUNITY CLASSES THE AUTHORIZATION REQUIRES ====================
 *
 *   A  unmarked REQUIRED clarification                            TR-A1  (also C2, D1, E1)
 *   B  settled threshold silence                                  TR-B1 B2 B3 B4
 *   C  genuine threshold / measurement-basis ambiguity            TR-C1 TR-C2
 *   D  ACTIVE candidate + a clarification about a DIFFERENT
 *      affectedDecision, which must SURVIVE arbitration           TR-D1
 *   E  genuine HAZARD_EXISTENCE contradiction opportunity         TR-E1
 *   F  ordinary NO-GAP negative control                           TR-F1  (also B1-B4)
 *
 * FIVE REQUIRED, FIVE FORBIDDEN. The FORBIDDEN half is the whole point: §147 recovered two unmarked
 * shapes and paid for it with CR-D1, and a repair that silences CR-D1 by silencing everything is not
 * a repair.
 *
 * ==================== THE FOUR SETTLED-THRESHOLD CONTROLS, AND WHY FOUR ====================
 *
 * v10 qualified a threshold as unsettled "when the facts sit close to the value, OR when the two are
 * not measured on the same basis" -- a DISJUNCTION of two soft descriptions. On CR-D1 neither limb
 * held and the model reached the clause anyway. v11 states the SETTLED reading first and makes
 * reopening conjunctive. Each of the four B rows removes one thing the model could otherwise reach
 * for, so a failure names its own mechanism instead of being a bare count:
 *
 *   TR-B1  SETTLED_BELOW           the value is far below and the basis is stated and identical
 *   TR-B2  SETTLED_ABOVE           the record plainly BITES, and the control it demands is described
 *                                  as in place and measured. §147 proved silence on a satisfied
 *                                  exception (CR-C1); this is the case where the rule APPLIES and is
 *                                  MET, which v10 never had a control for
 *   TR-B3  SETTLED_NEAR_BOUNDARY   PROXIMITY IS THE ONLY THING AVAILABLE. 0.52 against 0.5, same
 *                                  instrument, same plane, named by both texts. This is the CR-D1
 *                                  structural analog with every other foothold deliberately removed:
 *                                  if v11 still fires here, the narrowing failed
 *   TR-B4  IRRELEVANT_CONCEPT      a SECOND measurement concept exists in the record and is plainly
 *                                  not the applicable one, because the first limb is met on its own
 *
 * ==================== THE TWO GENUINE-AMBIGUITY ROWS, AND WHY THEY MUST STILL ASK ====================
 *
 * A narrowing that silences the real cases is a worse defect than the one it repairs, so both limbs
 * of v11's conjunction are exercised positively:
 *
 *   TR-C1  BASIS_AMBIGUOUS   the record's value is an eight-hour time-weighted average and the
 *                            observation reports a single hand-held reading. The mismatch is
 *                            OBJECTIVE and STATED IN BOTH TEXTS -- it is not proximity, and it is not
 *                            a basis the model imagined -- and resolving it can cross the value.
 *   TR-C2  AGGREGATE_MISSING the record turns on the total load and the observation gives neither the
 *                            fabrication's weight nor the spreader beam's. This is the CR-E2
 *                            aggregation shape on unrelated facts, and CR-E2 is the recovery §147
 *                            proved. If TR-C2 goes silent, v11 reverted v10.
 *
 * ==================== THE TWO ARBITRATION ROWS ====================
 *
 * TR-D1 and TR-E1 both describe a hazard the text plainly establishes as present, so the model is
 * expected to emit an ACTIVE candidate on each. The question owed on each is NOT an existence
 * question. Under v10 a mislabel destroyed CR-F2; under v11 the model has been told both the
 * self-check and the consequence.
 *
 *   TR-D1  the owed question is REQUIRED_CONTROL beside an ACTIVE fire/explosion candidate. It must
 *          SURVIVE. This is the case §147 never got to run cleanly.
 *   TR-E1  the owed question is REQUIRED_CONTROL beside an ACTIVE atmospheric candidate, and the
 *          scene is written so that an EXISTENCE framing is genuinely available. A true contradiction
 *          CANNOT BE COMMISSIONED -- it requires the model to make the error -- so this row is an
 *          ARBITRATION EXERCISE, not a pass/fail recall row for the contradiction itself. Either
 *          outcome is informative and both are recorded:
 *            correctly labelled -> the question survives and the routing repair is evidenced;
 *            mislabelled        -> arbitration rejects it, which is CORRECT behaviour on a real
 *                                  contradiction and is scored as a routing failure, never as an
 *                                  arbitration defect.
 *
 * ==================== PROVENANCE AND CONFINEMENT ====================
 *
 * Authored 2026-09-03. No reserved material opened. No spent formal-cohort row read, copied,
 * paraphrased or mimicked. No §142, §146 or §147 row reused: all ten domains (bulk solids silo,
 * flammable-liquid dispensing, bulk LPG storage, laboratory fume hood, compressed-gas cylinder
 * storage, press-shop noise, overhead crane lifting, fuel-bowser hot work, sewer chamber entry,
 * warehouse racking) are new to this programme and every observation is newly written. The six
 * supplied governed records are re-used views of records this repository already holds in approved
 * form.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const THRESHOLD_ARBITRATION_FIXTURE_SET_VERSION =
  'hazlenz.expert.threshold-arbitration.fixtures.v6' as const;

// ---------------------------------------------------------------- truth vocabulary

/** Which of the authorization's six probe-content classes the row supplies. */
export const PROBE_OPPORTUNITIES = [
  'A_UNMARKED_REQUIRED',
  'B_SETTLED_THRESHOLD_SILENCE',
  'C_GENUINE_THRESHOLD_OR_BASIS_AMBIGUITY',
  'D_ACTIVE_CANDIDATE_DIFFERENT_AFFECTED_DECISION',
  'E_EXISTENCE_CONTRADICTION_OPPORTUNITY',
  'F_ORDINARY_NO_GAP_CONTROL',
] as const;
export type ProbeOpportunity = (typeof PROBE_OPPORTUNITIES)[number];

/**
 * The threshold structure of the row, named so a result attributes to a MECHANISM.
 *
 * The four SETTLED_* members are the ones v11 must silence. The two live members are the ones it
 * must not: they are the only positive evidence that the narrowing did not become a revert.
 */
export const THRESHOLD_SHAPES = [
  'SETTLED_BELOW',
  'SETTLED_ABOVE',
  'SETTLED_NEAR_BOUNDARY',
  'IRRELEVANT_CONCEPT',
  'BASIS_AMBIGUOUS',
  'AGGREGATE_MISSING',
  'NONE',
] as const;
export type ThresholdShape = (typeof THRESHOLD_SHAPES)[number];

export interface RequiredClarificationTruth {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  /** The label the question actually warrants. NEVER `HAZARD_EXISTENCE` on an ACTIVE-hazard row. */
  affectedDecision: string;
  /** Why the observation, the findings and any supplied record do NOT settle it. */
  whyNotEstablished: string;
  /** TRUE when no sentence in the observation announces the absence. The §147 defect shape. */
  absenceIsUnmarked: boolean;
}

export interface ForbiddenClarificationTruth {
  /** The question a coverage habit, or an over-firing threshold clause, would produce here. */
  temptingQuestion: string;
  /** Why asking it changes nothing that is done today. Never a blanket label. */
  whyNotDecisionCritical: string;
  /**
   * What v11 must supply to settle it: the value, the basis, and the side. Stated per row so a
   * FORBIDDEN violation can be attributed to a missing element rather than merely counted.
   */
  whatMakesItSettled: string;
}

export interface ThresholdArbitrationFixture {
  row: FormalCohortRow;
  domain: string;
  opportunity: ProbeOpportunity;
  thresholdShape: ThresholdShape;
  /**
   * TRUE where the scene plainly establishes a hazard AND an existence-shaped framing of the owed
   * question is genuinely available -- so the model is expected to emit an ACTIVE candidate and the
   * label it chooses decides whether the question lives.
   */
  existenceContradictionTemptation: boolean;
  /**
   * TRUE where a surviving clarification is expected to sit beside the model's own ACTIVE candidate,
   * which is the configuration in which a wrong label is destructive.
   */
  arbitrationExposed: boolean;
  expectation:
    | { kind: 'REQUIRED'; truth: RequiredClarificationTruth }
    | { kind: 'FORBIDDEN'; truth: ForbiddenClarificationTruth };
}

// ---------------------------------------------------------------- governed records

const R_FLAMMABLE_CONTAINER: GovernedStandardView = {
  citation: '29 CFR 1926.152(a)(1)',
  title: 'Flammable liquids — container requirements',
  approvedText:
    'Only approved containers and portable tanks shall be used for storage and handling of flammable '
    + 'liquids. Approved metal safety cans shall be used for the handling and use of flammable '
    + 'liquids in quantities greater than one gallon, except that this shall not apply to those '
    + 'flammable liquid materials which are highly viscid. Quantities are the container nominal '
    + 'capacity. See 29 CFR 1926.152(a)(1).',
  backingState: 'APPROVED',
};

const R_LPG_SEPARATION: GovernedStandardView = {
  citation: '29 CFR 1910.110(b)(6)(i)',
  title: 'Liquefied petroleum gas — container separation distances',
  approvedText:
    'Containers installed outside of buildings with a water capacity of more than 125 gallons and not '
    + 'more than 500 gallons shall be located not less than 10 feet from any building, and not less '
    + 'than 25 feet from any opening into a building, the distance being measured horizontally from '
    + 'the nearest point of the container to the nearest point of the opening. See 29 CFR '
    + '1910.110(b)(6)(i).',
  backingState: 'APPROVED',
};

const R_FUME_HOOD_FACE_VELOCITY: GovernedStandardView = {
  citation: '29 CFR 1910.1450 App A',
  title: 'Laboratory chemical hoods — face velocity',
  approvedText:
    'A laboratory chemical hood used as the primary control device shall provide an average face '
    + 'velocity of at least 0.5 metres per second, determined as the average of readings taken across '
    + 'the plane of the working sash opening with a calibrated velocity meter at the sash height in '
    + 'use. See 29 CFR 1910.1450 Appendix A.',
  backingState: 'APPROVED',
};

const R_CYLINDER_SEPARATION: GovernedStandardView = {
  citation: '29 CFR 1910.253(b)(4)(iii)',
  title: 'Oxygen-fuel gas welding — cylinder storage separation',
  approvedText:
    'Oxygen cylinders in storage shall be separated from fuel-gas cylinders or combustible materials '
    + 'by a minimum distance of 20 feet, measured horizontally between the nearest cylinders of each '
    + 'group, OR by a noncombustible barrier at least 5 feet high having a fire-resistance rating of '
    + 'at least one-half hour. Either provision satisfies this paragraph. See 29 CFR '
    + '1910.253(b)(4)(iii).',
  backingState: 'APPROVED',
};

const R_NOISE_ACTION_LEVEL: GovernedStandardView = {
  citation: '29 CFR 1910.95(c)(1)',
  title: 'Occupational noise exposure — hearing conservation action level',
  approvedText:
    'The employer shall administer a continuing, effective hearing conservation programme whenever '
    + 'employee noise exposures equal or exceed an 8-hour time-weighted average sound level of 85 '
    + 'decibels measured on the A scale, which is a dose accumulated over the working shift and not a '
    + 'single instantaneous reading. See 29 CFR 1910.95(c)(1).',
  backingState: 'APPROVED',
};

const R_CRANE_RATED_LOAD: GovernedStandardView = {
  citation: '29 CFR 1910.179(b)(8)',
  title: 'Overhead and gantry cranes — rated load',
  approvedText:
    'The crane shall not be loaded beyond its rated load except for test purposes. The rated load is '
    + 'the value marked on each side of the crane, and the total load for this purpose includes the '
    + 'weight of the load handled together with the weight of all below-the-hook lifting devices, '
    + 'slings and other rigging carried on the hook. See 29 CFR 1910.179(b)(8).',
  backingState: 'APPROVED',
};

// ---------------------------------------------------------------- helpers

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

const req = (
  missingFact: string, answerA: string, outcomeA: string, answerB: string, outcomeB: string,
  affectedDecision: string, whyNotEstablished: string, absenceIsUnmarked: boolean,
): RequiredClarificationTruth =>
  ({ missingFact, answerA, outcomeA, answerB, outcomeB, affectedDecision, whyNotEstablished,
    absenceIsUnmarked });

// ================================================================ the ten rows

export const THRESHOLD_ARBITRATION_FIXTURES: readonly ThresholdArbitrationFixture[] = [

// ---- TR-A1 — opportunity A. UNMARKED required clarification, no threshold anywhere in the row.
//      It exists so a recall regression that has nothing to do with thresholds stays visible: if the
//      only REQUIRED rows were threshold rows, a general recall loss would be misattributed to the
//      narrowing.
{
  row: row('TR-A1',
    'A bulk solids silo on the feed mill is being cleared of a bridged blockage. An operative is '
    + 'standing on the surface of the stored meal inside the silo, working a lance down into the '
    + 'material through the top access hatch. A second man is at the hatch. The discharge auger '
    + 'control panel is at ground level on the far side of the building.',
    ['confined_space_entry', 'atmospheric_hazard', 'fall_protection', 'welding_fumes'],
    { presentHazardFamilies: ['confined_space_entry'],
      defensibleHazardFamilies: ['atmospheric_hazard', 'fall_protection'],
      forbiddenHazardFamilies: ['welding_fumes'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['confined_space_entry'],
      decisionCriticalGaps: [{ gapId: 'TR-A1-G1',
        description: 'whether the discharge auger has been isolated and locked off, which decides '
          + 'whether the man standing on the meal can be engulfed while he works',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'Standing on stored bulk material above an unattended discharge is the classic engulfment '
        + 'configuration, and the single fact that decides it -- whether material can be withdrawn '
        + 'from below while he is on it -- is NEVER MENTIONED. The text names the control panel and '
        + 'its location and says nothing about its state, which is exactly the unmarked shape: the '
        + 'only trace of the missing fact is that the reader has to supply it to finish reasoning.' }),
  domain: 'bulk solids silo',
  opportunity: 'A_UNMARKED_REQUIRED',
  thresholdShape: 'NONE',
  existenceContradictionTemptation: false,
  arbitrationExposed: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the silo discharge auger has been isolated and locked off for the duration of this work',
    'the auger is isolated and locked off, and the lock is held by the man inside',
    'the work continues and the finding is limited to entry control, harness and the standby man\'s '
    + 'means of rescue',
    'the auger can still be started, or its state is simply unknown to the men doing the work',
    'this is entry onto stored material above a live discharge and must stop now, with the man '
    + 'brought out before anything else is decided',
    'REQUIRED_CONTROL',
    'the observation places the control panel and says nothing whatever about its state; no '
    + 'deterministic finding, record or answered clarification establishes the isolation either way, '
    + 'and standing on the material is not evidence that withdrawal has stopped',
    true) },
},

// ---- TR-B1 — opportunity B/F. SETTLED_BELOW. The plainest case there is.
{
  row: row('TR-B1',
    'Solvent-based release agent is being decanted in the paint shop from a one-gallon container '
    + 'into a hand sprayer. The container is a proprietary one-gallon can, labelled with its nominal '
    + 'capacity, and it is the only container of the product on the bench. The area is mechanically '
    + 'ventilated and no ignition sources are in use. A single approved governed record covering '
    + 'flammable liquid containers was supplied with this inspection.',
    ['fire_explosion', 'chemical_inhalation_contact', 'hazcom', 'confined_space_entry'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'chemical_inhalation_contact', 'hazcom'],
      forbiddenHazardFamilies: ['confined_space_entry'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The record\'s safety-can requirement bites above one gallon and states that quantities are '
        + 'the container nominal capacity. The observation gives the nominal capacity, on the same '
        + 'basis, and it is at the bottom of the range rather than near the value. Every element v11 '
        + 'names as making a reading settled is present, so silence is the only correct answer.' },
    { governedStandards: [R_FLAMMABLE_CONTAINER] }),
  domain: 'flammable liquid dispensing',
  opportunity: 'B_SETTLED_THRESHOLD_SILENCE',
  thresholdShape: 'SETTLED_BELOW',
  existenceContradictionTemptation: false,
  arbitrationExposed: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'does the supplied record\'s safety-can requirement apply to this one-gallon container?',
    whyNotDecisionCritical:
      'the record states its own quantity basis and the observation reports the container on that '
      + 'same basis. One gallon is not greater than one gallon, so the requirement does not bite, '
      + 'and no answer to the question would change what is done in the paint shop today.',
    whatMakesItSettled:
      'value = one gallon nominal; basis = container nominal capacity, named identically by the '
      + 'record and the observation; side = below the value, and not close to it.' } },
},

// ---- TR-B2 — opportunity B/F. SETTLED_ABOVE. The record BITES and its demand is MET.
//      §147 had no control for this: CR-C1 was an exception that reached the facts, so silence there
//      was compatible with a model that simply never asks about a rule it thinks is switched off.
{
  row: row('TR-B2',
    'A bulk LPG container serving the site kitchen stands on a concrete plinth outside the north '
    + 'elevation. Its data plate records a water capacity of 500 gallons. A tape run horizontally '
    + 'from the nearest point of the container to the nearest point of the kitchen doorway, which is '
    + 'the closest opening into the building, measured 41 feet. The compound is fenced, the valve '
    + 'housing is locked and no work is in progress at the container. A single approved governed '
    + 'record covering liquefied petroleum gas container separation was supplied with this '
    + 'inspection.',
    ['fire_explosion', 'chemical_release', 'emergency_equipment', 'machine_guarding'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'chemical_release', 'emergency_equipment'],
      forbiddenHazardFamilies: ['machine_guarding'],
      negatedOrSafeStateFamilies: ['fire_explosion'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE MIRROR OF CR-C1, AND THE CONTROL §147 LACKED. Here the record plainly GOVERNS -- 500 '
        + 'gallons is inside the band it addresses -- and the distance it demands is described as '
        + 'measured, horizontally, from the nearest point to the nearest opening, which is the exact '
        + 'basis the record names. 41 feet against 25 feet is settled on both limbs. A model that '
        + 'stays silent only when a rule is switched OFF has not learned the rule; this row is the '
        + 'case where the rule is ON and satisfied.' },
    { governedStandards: [R_LPG_SEPARATION] }),
  domain: 'bulk LPG storage',
  opportunity: 'B_SETTLED_THRESHOLD_SILENCE',
  thresholdShape: 'SETTLED_ABOVE',
  existenceContradictionTemptation: false,
  arbitrationExposed: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'is the 41-foot measurement to the correct opening, and does the record\'s 25-foot separation '
      + 'apply to a 500-gallon container?',
    whyNotDecisionCritical:
      'the observation states which opening is nearest, that the measurement was horizontal, and '
      + 'that it ran nearest-point to nearest-point — the three things the record names as its own '
      + 'method. The container is squarely inside the capacity band the record addresses and the '
      + 'measured distance exceeds the requirement by 16 feet, so nothing about today\'s action turns '
      + 'on the answer.',
    whatMakesItSettled:
      'value = 41 feet; basis = horizontal, nearest point of container to nearest point of the '
      + 'nearest opening, stated identically in both texts; side = above the 25-foot requirement, by '
      + 'a wide margin, on a container the record plainly covers.' } },
},

// ---- TR-B3 — opportunity B/F. SETTLED_NEAR_BOUNDARY. THE CR-D1 ANALOG, SHARPENED.
//      Every foothold except proximity has been removed on purpose: the instrument, the plane and
//      the sash height are named by BOTH texts in the same words, and the reading is a measured
//      average rather than a spot value. If v11 fires here, proximity alone is still reopening a
//      settled reading and the narrowing did not work.
{
  row: row('TR-B3',
    'The teaching laboratory\'s chemical hood is the primary control for a solvent extraction being '
    + 'run this morning. Face velocity was measured this week with a calibrated velocity meter as the '
    + 'average of nine readings taken across the plane of the working sash opening at the sash height '
    + 'in use, and recorded at 0.52 metres per second. The sash is at that same height now, the '
    + 'certificate is posted on the hood, and the work is being carried out with the apparatus fully '
    + 'inside the hood. A single approved governed record covering laboratory chemical hood face '
    + 'velocity was supplied with this inspection.',
    ['chemical_inhalation_contact', 'respiratory_protection', 'hazcom', 'mobile_equipment'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'respiratory_protection', 'hazcom'],
      forbiddenHazardFamilies: ['mobile_equipment'],
      negatedOrSafeStateFamilies: ['chemical_inhalation_contact'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE ROW THAT DECIDES WORKSTREAM A. 0.52 against 0.5 is as close to a boundary as this set '
        + 'goes, and PROXIMITY IS THE ONLY THING AVAILABLE: the instrument (calibrated velocity '
        + 'meter), the plane (across the working sash opening), the sash height (the one in use) and '
        + 'the statistic (an average of readings) are each named by the record AND by the '
        + 'observation, in the same terms. v11 says in terms that near the line is a side of the '
        + 'line. If the model asks here, the conjunction is not operative.' },
    { governedStandards: [R_FUME_HOOD_FACE_VELOCITY] }),
  domain: 'laboratory fume hood',
  opportunity: 'B_SETTLED_THRESHOLD_SILENCE',
  thresholdShape: 'SETTLED_NEAR_BOUNDARY',
  existenceContradictionTemptation: false,
  arbitrationExposed: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'is 0.52 metres per second, so close to the 0.5 minimum, actually adequate — and was it '
      + 'measured in a way comparable to the record\'s requirement?',
    whyNotDecisionCritical:
      'the second half of the question is answered in the observation, word for word against the '
      + 'record: same instrument, same plane, same sash height, same averaging. The first half is '
      + 'proximity alone, and 0.52 is above 0.5 whether or not the margin feels comfortable. Neither '
      + 'branch changes what is done in the laboratory today.',
    whatMakesItSettled:
      'value = 0.52 m/s as a measured average; basis = calibrated velocity meter across the plane of '
      + 'the working sash opening at the sash height in use, named identically by both texts; side = '
      + 'above the 0.5 m/s minimum. Nothing objective suggests another comparison value.' } },
},

// ---- TR-B4 — opportunity B/F. IRRELEVANT_CONCEPT. A second measurement exists and does not matter.
{
  row: row('TR-B4',
    'In the fabrication shop store, the oxygen cylinders stand upright and chained in the north bay '
    + 'and the acetylene cylinders upright and chained in the south bay. A tape run horizontally '
    + 'between the nearest cylinder of each group measured 31 feet across an empty gangway. There is '
    + 'no partition or screen of any kind between them. Valve caps are fitted on all cylinders not in '
    + 'use and no torch or hose is connected. A single approved governed record covering cylinder '
    + 'storage separation was supplied with this inspection.',
    ['fire_explosion', 'material_handling_storage', 'welding_fumes', 'fall_protection'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'material_handling_storage', 'welding_fumes'],
      forbiddenHazardFamilies: ['fall_protection'],
      negatedOrSafeStateFamilies: ['fire_explosion'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The record offers TWO alternative provisions and says either satisfies it. The separation '
        + 'limb is met on stated, matching facts, so the barrier limb -- a real second measurement '
        + 'concept, with its own height and its own fire rating -- is IRRELEVANT here. v11 says the '
        + 'mere existence of another measurement basis is not a reason unless something says it is '
        + 'the applicable one. The absent barrier is the bait: its absence is conspicuous and means '
        + 'nothing.' },
    { governedStandards: [R_CYLINDER_SEPARATION] }),
  domain: 'compressed gas cylinder storage',
  opportunity: 'B_SETTLED_THRESHOLD_SILENCE',
  thresholdShape: 'IRRELEVANT_CONCEPT',
  existenceContradictionTemptation: false,
  arbitrationExposed: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'there is no barrier between the two groups — what is its height and fire-resistance rating, '
      + 'and does the store meet the record without one?',
    whyNotDecisionCritical:
      'the record states the two provisions in the alternative and says either satisfies it. The '
      + 'separation provision is met at 31 feet against 20, measured horizontally between the nearest '
      + 'cylinders of each group, which is the record\'s own method. A barrier that is not needed has '
      + 'no rating to ask about, and no answer changes what is done in the store today.',
    whatMakesItSettled:
      'value = 31 feet; basis = horizontal, nearest cylinder of each group, named identically by both '
      + 'texts; side = above the 20-foot alternative, which the record says is sufficient on its own.' } },
},

// ---- TR-C1 — opportunity C. BASIS_AMBIGUOUS. Limb (i) is stated in both texts; limb (ii) crosses.
{
  row: row('TR-C1',
    'In the press shop a setter is working at the blanking press through the shift. A hand-held sound '
    + 'level meter held at the setter\'s ear position while the press was cycling read 88 decibels on '
    + 'the A scale. The observation records that single reading and does not record how much of the '
    + 'shift the setter spends at this position, nor any dosimetry. No hearing protection is in use '
    + 'and no zoning signage is posted. A single approved governed record covering the hearing '
    + 'conservation action level was supplied with this inspection.',
    ['noise_exposure', 'machine_guarding', 'personal_protective_equipment', 'atmospheric_hazard'],
    { presentHazardFamilies: ['noise_exposure'],
      defensibleHazardFamilies: ['machine_guarding', 'personal_protective_equipment'],
      forbiddenHazardFamilies: ['atmospheric_hazard'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'TR-C1-G1',
        description: 'how much of the shift the setter spends at this position, without which the '
          + 'single 88 dBA reading cannot be converted to the eight-hour time-weighted average the '
          + 'record\'s action level is expressed in',
        affectedDecision: 'REGULATORY_INTERPRETATION' }],
      recordedInteractions: [],
      authoringRationale:
        'THE BASIS MISMATCH IS OBJECTIVE AND IS STATED IN BOTH TEXTS. The record says in terms that '
        + 'its value is a dose accumulated over the shift and NOT a single instantaneous reading; the '
        + 'observation says in terms that it recorded a single reading and no dosimetry. That is '
        + 'v11 limb (i) on the face of the documents rather than in the model\'s imagination. Limb '
        + '(ii) holds too: 88 dBA for a short part of a shift averages BELOW 85, and for most of a '
        + 'shift averages ABOVE it, so the answer moves the facts across the value and decides '
        + 'whether a hearing conservation programme is owed. This is NOT proximity: 88 is above 85, '
        + 'and the reason to ask has nothing to do with the margin.' },
    { governedStandards: [R_NOISE_ACTION_LEVEL] }),
  domain: 'press shop noise',
  opportunity: 'C_GENUINE_THRESHOLD_OR_BASIS_AMBIGUITY',
  thresholdShape: 'BASIS_AMBIGUOUS',
  existenceContradictionTemptation: false,
  arbitrationExposed: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'how much of the working shift the setter spends at this press position, which is what converts '
    + 'the single 88 dBA reading into the eight-hour average the record is written in',
    'the setter is at the press for a short part of the shift and the eight-hour average is below 85 '
    + 'dBA',
    'the action level is not reached, and the finding is limited to advisory hearing protection and '
    + 'the absence of signage',
    'the setter is at the press for most of the shift and the eight-hour average is at or above 85 '
    + 'dBA',
    'the record\'s hearing conservation programme is owed now — monitoring, protection and '
    + 'audiometry — which is a materially different requirement from an advisory',
    'REGULATORY_INTERPRETATION',
    'the observation states a single instantaneous reading and states that it records no dosimetry '
    + 'and no time at the position; the record states that its value is a dose over the shift and '
    + 'expressly not a single reading. The two are on different bases, and the observation says so '
    + 'itself rather than leaving it to be inferred',
    false) },
},

// ---- TR-C2 — opportunity C. AGGREGATE_MISSING. The CR-E2 shape on unrelated facts, UNMARKED.
{
  row: row('TR-C2',
    'A steel fabrication is being lifted in the assembly bay by the overhead travelling crane, which '
    + 'is marked five tons on each side. The fabrication is on the hook through a spreader beam with '
    + 'four chain slings. Two fitters are steering the load by hand as it travels over the bay. The '
    + 'observation records the crane marking and does not record the weight of the fabrication or of '
    + 'the spreader beam and slings. A single approved governed record covering crane rated load was '
    + 'supplied with this inspection.',
    ['suspended_loads', 'material_handling_storage', 'mobile_equipment', 'noise_exposure'],
    { presentHazardFamilies: ['suspended_loads'],
      defensibleHazardFamilies: ['material_handling_storage', 'mobile_equipment'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['suspended_loads'],
      decisionCriticalGaps: [{ gapId: 'TR-C2-G1',
        description: 'the total load on the hook — the fabrication together with the spreader beam '
          + 'and slings — which the record says is what must not exceed the five-ton marking',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE CR-E2 AGGREGATION SHAPE, AND THE POSITIVE CONTROL ON THE NARROWING. The record does not '
        + 'turn on the fabrication\'s weight; it turns on the TOTAL, and says so, naming '
        + 'below-the-hook devices and rigging. The observation gives neither component. So the '
        + 'comparison quantity the record demands cannot be assembled from the text at all -- v11 '
        + 'limb (i) in its second form -- and either answer crosses or does not cross the marking, '
        + 'which is limb (ii). Nothing in the text announces the absence: the reader has to notice '
        + 'that a lift is being judged against a number nobody supplied. IF THIS ROW GOES SILENT, '
        + 'v11 REVERTED v10 AND THE NARROWING WENT TOO FAR.' },
    { governedStandards: [R_CRANE_RATED_LOAD] }),
  domain: 'overhead crane lifting',
  opportunity: 'C_GENUINE_THRESHOLD_OR_BASIS_AMBIGUITY',
  thresholdShape: 'AGGREGATE_MISSING',
  existenceContradictionTemptation: false,
  arbitrationExposed: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'the total weight on the hook — the fabrication plus the spreader beam and slings — against the '
    + 'crane\'s five-ton marking',
    'the total is comfortably inside five tons',
    'the lift may proceed and the finding is limited to the fitters steering the load by hand and the '
    + 'travel path over the bay',
    'the total is at or above five tons once the spreader beam and slings are counted',
    'the crane is being loaded beyond its rated load with two men under the travel path, and the lift '
    + 'must stop now',
    'REQUIRED_CONTROL',
    'the crane marking is stated and neither the fabrication\'s weight nor the rigging\'s is; the '
    + 'record defines the quantity to be compared as the total including below-the-hook devices, so '
    + 'the comparison value cannot be assembled from anything in the observation',
    true) },
},

// ---- TR-D1 — opportunity D. ACTIVE hazard + a REQUIRED_CONTROL question that MUST SURVIVE.
//      This is the configuration CR-F2 died in, with the label the question actually warrants.
{
  row: row('TR-D1',
    'In the plant yard a fitter is cutting a bracket off the frame of a road-going fuel bowser with '
    + 'an angle grinder. Sparks are visibly reaching the ground alongside the bowser\'s fill point. '
    + 'The bowser is coupled to nothing and stands on its own wheels. No fire watch is present, no '
    + 'extinguisher is at the work position, and no hot work permit is displayed. The observation '
    + 'does not record whether the bowser has been emptied, or whether its tank and vapour space have '
    + 'been rendered safe.',
    ['fire_explosion', 'hot_work', 'chemical_release', 'confined_space_entry'],
    { presentHazardFamilies: ['fire_explosion', 'hot_work'],
      defensibleHazardFamilies: ['chemical_release'],
      forbiddenHazardFamilies: ['confined_space_entry'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fire_explosion'],
      decisionCriticalGaps: [{ gapId: 'TR-D1-G1',
        description: 'whether the bowser tank has been emptied and its vapour space rendered safe '
          + 'before hot work on the frame',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE ARBITRATION SURVIVAL ROW. Grinding with sparks reaching a fuel bowser\'s fill point, no '
        + 'watch, no extinguisher and no permit is a hazard the text ESTABLISHES, so an ACTIVE '
        + 'fire/explosion candidate is the correct and expected output. The question owed is NOT '
        + 'whether that hazard exists -- the model will have just said it does -- it is whether the '
        + 'tank has been rendered safe, which is REQUIRED_CONTROL. Correctly labelled it survives '
        + 'arbitration; labelled HAZARD_EXISTENCE it is destroyed in full. The absence here is '
        + 'ANNOUNCED, deliberately: this row tests the LABEL, not the noticing, and confounding the '
        + 'two would make a failure unattributable.' }),
  domain: 'fuel bowser hot work',
  opportunity: 'D_ACTIVE_CANDIDATE_DIFFERENT_AFFECTED_DECISION',
  thresholdShape: 'NONE',
  existenceContradictionTemptation: false,
  arbitrationExposed: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the bowser has been emptied and its tank and vapour space rendered safe before hot work '
    + 'on the frame',
    'the tank is empty, purged and gas-free, and a certificate says so',
    'the work may continue once a fire watch, an extinguisher and a permit are put in place, and the '
    + 'finding is those three omissions',
    'the tank still holds fuel or an unpurged vapour space',
    'this is hot work on a vessel that has contained flammable liquid and must stop immediately, '
    + 'ahead of any paperwork',
    'REQUIRED_CONTROL',
    'the observation states the grinding, the sparks and the absent permit, watch and extinguisher, '
    + 'and states expressly that it does not record whether the tank was emptied or rendered safe',
    false) },
},

// ---- TR-E1 — opportunity E. The existence-contradiction OPPORTUNITY. An exercise, not a command.
{
  row: row('TR-E1',
    'A drainage operative is down inside an open sewer chamber in the estate road, working at the '
    + 'benching with a hand tool. The chamber is about three metres deep and the cover is off. A '
    + 'colleague stands at the surface holding the ladder. No tripod or winch is rigged, no gas '
    + 'monitor is visible at the surface or on the man, and no rescue harness is worn. The chamber '
    + 'connects to the foul sewer at the invert.',
    ['confined_space_entry', 'atmospheric_hazard', 'fall_protection', 'machine_guarding'],
    { presentHazardFamilies: ['confined_space_entry', 'atmospheric_hazard'],
      defensibleHazardFamilies: ['fall_protection'],
      forbiddenHazardFamilies: ['machine_guarding'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['confined_space_entry', 'atmospheric_hazard'],
      decisionCriticalGaps: [{ gapId: 'TR-E1-G1',
        description: 'whether the chamber atmosphere was tested before entry and is being monitored '
          + 'during it, which decides whether the man may remain in the chamber at all',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE ARBITRATION EXERCISE ROW, AND IT IS SCORED AS AN EXERCISE. A man at depth in a chamber '
        + 'connected to a foul sewer with no monitor, no rescue rig and no harness is a hazard the '
        + 'text establishes, so an ACTIVE atmospheric or confined-space candidate is expected. An '
        + 'EXISTENCE framing of the owed question -- "is there a hazardous atmosphere in this '
        + 'chamber?" -- is genuinely available and genuinely tempting, which is what makes this the '
        + 'contradiction opportunity. But a TRUE contradiction cannot be commissioned: it requires '
        + 'the model to make the error, and §147 showed that arbitration had gone unexercised across '
        + '65 hosted calls precisely because the error is uncommon. So BOTH outcomes are informative. '
        + 'Correctly labelled REQUIRED_CONTROL, the question survives and the v11 routing repair is '
        + 'evidenced. Labelled HAZARD_EXISTENCE beside its own ACTIVE candidate, arbitration rejects '
        + 'it -- which is CORRECT arbitration behaviour on a real contradiction, is scored as a '
        + 'ROUTING failure, and must never be recorded as an arbitration defect.' }),
  domain: 'sewer chamber entry',
  opportunity: 'E_EXISTENCE_CONTRADICTION_OPPORTUNITY',
  thresholdShape: 'NONE',
  existenceContradictionTemptation: true,
  arbitrationExposed: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the chamber atmosphere was tested before this entry and is being monitored while the man '
    + 'is down there',
    'the atmosphere was tested clear before entry and a monitor is running on the man',
    'the entry continues under review and the finding is the absent rescue arrangements — no tripod, '
    + 'no winch, no harness',
    'the atmosphere was not tested, or is not being monitored',
    'this is an untested entry into a chamber connected to a foul sewer and the man must be brought '
    + 'out now, before anything else is arranged',
    'REQUIRED_CONTROL',
    'the observation states what is absent at the surface and on the man, and states nothing about '
    + 'testing or monitoring having been done; the absence of a visible monitor is not the same fact '
    + 'as the absence of a test, and neither is established by the other',
    true) },
},

// ---- TR-F1 — opportunity F. Ordinary NO-GAP control, with no threshold anywhere.
//      The B rows all carry a supplied record, so without this row every FORBIDDEN control would be
//      a threshold control and ordinary silence would be untested.
{
  row: row('TR-F1',
    'In the distribution warehouse the end frame of rack run C is bent inwards at about knee height '
    + 'where it has been struck. The bay above it was unloaded in my presence, the bay was tagged out '
    + 'of use, and the aisle beneath it was barriered off with rigid barriers before I left the area. '
    + 'The rack inspection tag on the run records the last competent-person inspection as three '
    + 'months ago against a twelve-month cycle, and the damage is recorded on the site\'s damage '
    + 'register with a repair order raised and a reference number written on the tag.',
    ['material_handling_storage', 'walking_working_surfaces', 'suspended_loads', 'noise_exposure'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['material_handling_storage', 'walking_working_surfaces',
        'suspended_loads'],
      forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: ['material_handling_storage'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'Everything a question could reach for is stated and closed IN THE INSPECTOR\'S PRESENCE: the '
        + 'bay is unloaded, tagged and barriered, the inspection is in date, and the damage is '
        + 'registered with a repair order raised. The remaining questions -- when will it be repaired, '
        + 'who struck it -- are the follow-up and history shapes the seven NOT-DECISION-CRITICAL '
        + 'entries already name. No threshold anywhere: this row tests ORDINARY silence, so that the '
        + 'FORBIDDEN half is not made entirely of threshold rows.' }),
  domain: 'warehouse racking',
  opportunity: 'F_ORDINARY_NO_GAP_CONTROL',
  thresholdShape: 'NONE',
  existenceContradictionTemptation: false,
  arbitrationExposed: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'when will the damaged upright be repaired, and has the load capacity of the run been '
      + 'reassessed in the meantime?',
    whyNotDecisionCritical:
      'the bay is already unloaded, tagged out of use and barriered off, so there is no load on the '
      + 'damaged frame and nobody beneath it. The repair date changes nothing about what is done '
      + 'today, and a capacity reassessment of a bay that is out of service selects no different '
      + 'action.',
    whatMakesItSettled:
      'no threshold is in play at all. The state of the rack, the state of the bay, the inspection '
      + 'currency and the repair status are each stated, and the interim control was witnessed.' } },
},

];

export const THRESHOLD_ARBITRATION_ROWS: readonly FormalCohortRow[] =
  THRESHOLD_ARBITRATION_FIXTURES.map(f => f.row);

export function thresholdFixtureByRowId(
  rowId: string,
): ThresholdArbitrationFixture | undefined {
  return THRESHOLD_ARBITRATION_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * Frozen budget, transcribed from the §148 authorization BEFORE the probe runs.
 *
 * "maximum 12 provider requests; maximum $2.00". Ten logical calls against the twelve-request
 * ceiling leaves exactly two requests of headroom, which is the retry allowance and nothing else.
 */
export const THRESHOLD_ARBITRATION_BUDGET = {
  targetLogicalCalls: 10,
  hardLogicalCallCeiling: 10,
  hardProviderRequestCeiling: 12,
  hardSpendCeilingUsd: 2.00,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 1,
} as const;

/**
 * Frozen §148 hosted decision gates, transcribed from the authorization before the probe runs.
 *
 * NOT formal thresholds and NOT a population claim: on ten rows, 100% is a remediation gate.
 *
 * `strictRequiredRecall` counts DELIVERED questions only. The authorization is explicit that a
 * clarification which was reasoned and then destroyed by arbitration does NOT count toward the
 * final gate and is reported separately as a diagnostic -- which is why the probe captures the raw
 * wire, since a destroyed question is otherwise unrecoverable from the validated analysis.
 */
export const THRESHOLD_ARBITRATION_GATES = {
  /** STRICT and DELIVERED: reasoned-but-destroyed is a diagnostic, never recall. */
  strictRequiredRecall: 1.0,
  /** Unnecessary questions on the unambiguous matched FORBIDDEN controls. */
  maxForbiddenViolations: 0,
  /** Substantively valid, contract-valid clarifications lost to normalization or arbitration. */
  affectedDecisionSurvival: 1.0,
  /** Genuine ACTIVE-candidate / HAZARD_EXISTENCE contradictions that must remain rejected. */
  trueContradictionRejection: 1.0,
  maxInvalidClarificationObjects: 0,
  maxCitationContainmentViolations: 0,
  maxProtectedAuthorityContradictions: 0,
} as const;
