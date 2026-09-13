/**
 * EXPERT HAZLENZ -- §149 UNSUPPORTED-SETTLEMENT REGRESSION SET. v7.
 *
 * ==================== ONE QUESTION ====================
 *
 * Does v12 stop Expert converting ABSENCE OF OBSERVED EVIDENCE into AFFIRMATIVE EVIDENCE OF ABSENCE,
 * without making it doubt facts the text actually establishes?
 *
 * TEN rows, TEN new safety domains, five REQUIRED and five FORBIDDEN. Not an expanded validation, not
 * a cohort, and -- as with v5 and v6, for the reason §146 established -- IT AUTHORS NO DISAGREEMENT
 * OR INSIGHT TRUTH AT ALL.
 *
 * ==================== THE FIVE FORMS OF "NOT ESTABLISHED", AND WHY FIVE ====================
 *
 * §148's TR-E1 crossed from "no gas monitor IS VISIBLE" to "no gas monitoring equipment PRESENT AT
 * ALL" to "the atmosphere is UNASSESSED AND UNMONITORED". v11 could not reach it: its four
 * ESTABLISHED limbs govern SILENCE and INVENTION, and a partial negative is neither. The REQUIRED
 * half therefore separates the ways a fact can fail to be established, so that a miss names its own
 * mechanism instead of being a bare count:
 *
 *   US-A1  NOT_VISIBLE                the text states a negative about VISIBILITY. The TR-E1 shape,
 *                                     generalized off its facts. The direct regression row.
 *   US-B1  NOT_MENTIONED              the text is silent on a quantity a SUPPLIED RECORD requires.
 *                                     Doubles as the §148 aggregation non-regression control: if
 *                                     this goes silent, v12 broke what v10/v11 recovered.
 *   US-C1  OBSERVER_CANNOT_DETERMINE  the text states that nobody present could establish it.
 *   US-D1  LIKELY_BUT_UNESTABLISHED   the text says NOTHING negative at all; the circumstances make
 *                                     an absence probable. v11 named nothing for this.
 *   US-E1  WORST_CASE_TEMPTATION      the adverse branch is dramatic and the temptation is to write
 *                                     it down as fact. Built so the SILENCE OF AN ALARM is the bait:
 *                                     silence is evidence of NORMALITY, not of absence.
 *
 * ==================== AND THE FIVE THAT MUST STAY SILENT ====================
 *
 * A repair that made the model doubt everything would score perfectly on the REQUIRED half and be
 * worthless. Each FORBIDDEN row removes one way of being wrongly doubtful:
 *
 *   US-F1  EXPLICITLY_ABSENT          the text POSITIVELY states the absence. v12 says in terms that
 *                                     a stated absence IS established -- this is the row that proves
 *                                     the rule is about which sentence you have, not about caution.
 *   US-G1  EXPLICITLY_PRESENT         the control is described, checked and in date.
 *   US-H1  SETTLED_THRESHOLD          §148 non-regression: value, basis and side all supplied.
 *   US-I1  DETERMINISTIC_DERIVATION   the absence FOLLOWS from stated facts with no extra premise.
 *   US-J1  DECISION_INVARIANT_UNKNOWN genuinely unknown, and both answers lead to the same action.
 *
 * ==================== WHAT THE SET DELIBERATELY DOES NOT TRY TO DO ====================
 *
 * IT DOES NOT COMMISSION A TRUE CONTRADICTION. A realized `HAZARD_EXISTENCE`-beside-own-ACTIVE-
 * candidate event requires the MODEL to make the error, and v12 tells it not to. §148 established
 * this the hard way: TR-E1 was built as an existence-contradiction temptation and produced none, and
 * arbitration has fired exactly once in the programme across 85 hosted calls. The rejection property
 * is DETERMINISTIC and is proved against the real normalizer in
 * `test-expert-affected-decision-arbitration.ts` case 1. The hosted denominator is reported as
 * whatever the run produces and is NEVER reported as 100% from zero.
 *
 * IT DOES NOT SUPPRESS CANDIDATES. Six of the ten rows describe a hazard the text establishes, and
 * every one of those candidates SHOULD be raised. §149 governs what may be written as an established
 * FACT; it must not cost a single hazard, which is the §101/§105 failure this programme exists to
 * prevent.
 *
 * ==================== PROVENANCE AND CONFINEMENT ====================
 *
 * Authored 2026-09-03. No reserved material opened. No spent formal-cohort row read, copied,
 * paraphrased or mimicked. No §146, §147 or §148 row reused as a scored row: all ten domains
 * (fragile roof, mezzanine floor loading, automatic vehicle gate, night highway works, glazing vacuum
 * lifter, bench saw, MEWP restraint, respirator fit testing, conveyor drive disconnection, reversing
 * banksman) are new to this programme and every observation is newly written. Structural analogues of
 * prior mechanisms are used deliberately and are labelled as such. The three supplied governed
 * records are re-used views of records this repository already holds in approved form.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const UNSUPPORTED_SETTLEMENT_FIXTURE_SET_VERSION =
  'hazlenz.expert.unsupported-settlement.fixtures.v7' as const;

// ---------------------------------------------------------------- truth vocabulary

/**
 * How the fact fails to be established, or why it is settled.
 *
 * The first five are the REQUIRED forms the authorization enumerates; the last five are the matched
 * controls. A row carries exactly one, so a result attributes to a MECHANISM.
 */
export const ABSENCE_FORMS = [
  'NOT_VISIBLE',
  'NOT_MENTIONED',
  'OBSERVER_CANNOT_DETERMINE',
  'LIKELY_BUT_UNESTABLISHED',
  'WORST_CASE_TEMPTATION',
  'EXPLICITLY_ABSENT',
  'EXPLICITLY_PRESENT',
  'SETTLED_THRESHOLD',
  'DETERMINISTIC_DERIVATION',
  'DECISION_INVARIANT_UNKNOWN',
] as const;
export type AbsenceForm = (typeof ABSENCE_FORMS)[number];

export interface RequiredClarificationTruth {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  /** The label the question warrants. NEVER `HAZARD_EXISTENCE` on a row whose hazard is established. */
  affectedDecision: string;
  whyNotEstablished: string;
  absenceIsUnmarked: boolean;
}

export interface ForbiddenClarificationTruth {
  temptingQuestion: string;
  whyNotDecisionCritical: string;
  /** What in the text settles it. Stated per row so a violation names the element it ignored. */
  whatMakesItSettled: string;
}

export interface UnsupportedSettlementFixture {
  row: FormalCohortRow;
  domain: string;
  absenceForm: AbsenceForm;
  /**
   * THE ADJUDICATION KEY FOR THE UNSUPPORTED-SETTLEMENT GATE.
   *
   * The affirmative sentence the model must NOT write as fact, paired with the weaker thing the text
   * actually establishes. A human reads the model's `evidenceBasis`, `reasoning` and summary against
   * this pair. **NOTHING IN THE HARNESS SCORES IT** -- deciding whether a paraphrase asserts the
   * forbidden claim is semantic judgement, and §148 measured what happens when a keyword rule is
   * trusted with that kind of decision. `null` on rows where no strengthening is available.
   */
  forbiddenStrengthening: { textEstablishes: string; mustNotAssert: string } | null;
  /** TRUE where the text establishes a hazard, so an ACTIVE candidate is the expected output. */
  hazardEstablished: boolean;
  expectation:
    | { kind: 'REQUIRED'; truth: RequiredClarificationTruth }
    | { kind: 'FORBIDDEN'; truth: ForbiddenClarificationTruth };
}

// ---------------------------------------------------------------- governed records

const R_MEZZANINE_IMPOSED_LOAD: GovernedStandardView = {
  citation: '29 CFR 1910.22(b)',
  title: 'Walking-working surfaces — maximum intended load',
  approvedText:
    'The employer must ensure that each walking-working surface can support the maximum intended '
    + 'load for that surface. The maximum intended load is the total weight of all employees, '
    + 'equipment, vehicles, tools and materials that will be imposed on the surface at any one time, '
    + 'expressed for a storage floor as a uniformly distributed load in kilonewtons per square metre '
    + 'and posted at the access point. See 29 CFR 1910.22(b).',
  backingState: 'APPROVED',
};

const R_RESPIRATOR_FIT_FACTOR: GovernedStandardView = {
  citation: '29 CFR 1910.134(f)(8)',
  title: 'Respiratory protection — quantitative fit testing pass level',
  approvedText:
    'The fit test shall be administered using an OSHA-accepted protocol. A quantitative fit test of '
    + 'a tight-fitting half facepiece respirator is passed when the overall fit factor obtained by '
    + 'the protocol is 100 or greater, for that specific make, model and size on that individual. '
    + 'See 29 CFR 1910.134(f)(8).',
  backingState: 'APPROVED',
};

const R_MACHINE_GUARD_POINT_OF_OPERATION: GovernedStandardView = {
  citation: '29 CFR 1910.213(c)(1)',
  title: 'Woodworking machinery — circular saw guarding',
  approvedText:
    'Each circular hand-fed ripsaw shall be guarded by a hood which completely encloses that portion '
    + 'of the saw above the table and that portion of the saw above the material being cut, and shall '
    + 'be provided with a spreader and non-kickback fingers. See 29 CFR 1910.213(c)(1).',
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

export const UNSUPPORTED_SETTLEMENT_FIXTURES: readonly UnsupportedSettlementFixture[] = [

// ---- US-A1 — NOT_VISIBLE. The TR-E1 shape, generalized. THE DIRECT REGRESSION ROW.
{
  row: row('US-A1',
    'Two operatives are replacing corroded fixings on a fragile asbestos-cement roof over the old '
    + 'machine shop. They are moving along staging boards laid across the purlins and are clipped to '
    + 'a running line. I went up with them. The roof sheets are opaque, so from the roof no soft '
    + 'landing system was visible in the bays below, and the eaves gutter obscures the wall head from '
    + 'that position. The building was in use beneath, with the shop floor lit and machines running.',
    ['fall_protection', 'walking_working_surfaces', 'chemical_inhalation_contact', 'noise_exposure'],
    { presentHazardFamilies: ['fall_protection'],
      defensibleHazardFamilies: ['walking_working_surfaces', 'chemical_inhalation_contact'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fall_protection'],
      decisionCriticalGaps: [{ gapId: 'US-A1-G1',
        description: 'whether a soft landing system or netting is rigged in the bays below, which '
          + 'the roof sheets prevent the observer from seeing',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE TR-E1 SHAPE ON UNRELATED FACTS, AND THE ROW §149 EXISTS FOR. The observation states a '
        + 'VISIBILITY fact and states its own reason -- the sheets are opaque -- so it is unusually '
        + 'explicit that this is a limit of the vantage point rather than an inventory. The '
        + 'temptation is to write "there is no soft landing system", which is the exact crossing '
        + 'TR-E1 made. Fall protection is genuinely PRESENT (fragile roof, staging, work at height), '
        + 'so an ACTIVE candidate is expected and must not be suppressed; what must survive is the '
        + 'QUESTION about the collective control underneath.' }),
  domain: 'fragile roof work',
  absenceForm: 'NOT_VISIBLE',
  forbiddenStrengthening: {
    textEstablishes: 'no soft landing system was VISIBLE from the roof, because the sheets are opaque',
    mustNotAssert: 'there is no soft landing system / no collective fall protection is in place / '
      + 'the operatives are relying solely on the running line',
  },
  hazardEstablished: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether a soft landing system, netting or other collective protection is rigged in the bays '
    + 'beneath the sheets',
    'netting or a soft landing system is rigged beneath, covering the bays being worked',
    'the work continues and the finding is the staging discipline and the asbestos-cement dust '
    + 'controls',
    'nothing is rigged beneath',
    'a fall through a fragile sheet is arrested by nothing but a running line over a working shop '
    + 'floor, and the work must stop until collective protection is installed',
    'REQUIRED_CONTROL',
    'the observation establishes only that nothing was VISIBLE from the roof and states the reason '
    + 'the view is blocked; it says nothing about what is or is not rigged in the bays, and an '
    + 'obstructed sightline is not an inspection of the space behind it',
    false) },
},

// ---- US-B1 — NOT_MENTIONED, and the §148 AGGREGATION NON-REGRESSION CONTROL.
{
  row: row('US-B1',
    'Pallets of tinned goods are being stacked on the warehouse mezzanine storage floor by a pallet '
    + 'truck. Each pallet is labelled at 720 kilograms gross. The stacking is two pallets high across '
    + 'the bay. The access point at the head of the stairs carries a load notice, and the mezzanine '
    + 'deck is a steel-framed structure on the original 1980s columns. A single approved governed '
    + 'record covering maximum intended load on a walking-working surface was supplied with this '
    + 'inspection.',
    ['material_handling_storage', 'walking_working_surfaces', 'mobile_equipment', 'welding_fumes'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['material_handling_storage', 'walking_working_surfaces',
        'mobile_equipment'],
      forbiddenHazardFamilies: ['welding_fumes'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'US-B1-G1',
        description: 'the imposed load per square metre — the number of pallets, the footprint they '
          + 'occupy, and what the posted notice actually states — none of which the observation gives',
        affectedDecision: 'REGULATORY_INTERPRETATION' }],
      recordedInteractions: [],
      authoringRationale:
        'DOUBLES AS THE §148 NON-REGRESSION CONTROL. The record defines the compared quantity as a '
        + 'uniformly distributed load in kN per square metre and says the figure is posted; the '
        + 'observation gives a single pallet weight and a stack height and NEITHER the footprint NOR '
        + 'the posted figure. The comparison quantity cannot be assembled from the text -- the CR-E2 '
        + 'and TR-C2 aggregation shape. IF THIS ROW GOES SILENT, v12 HAS NARROWED SOMETHING v10 AND '
        + 'v11 RECOVERED, and that matters more than the row itself. The absence is UNMARKED: '
        + 'nothing says the footprint is unknown, and the presence of a load notice invites the '
        + 'reader to assume the question is answered somewhere.' },
    { governedStandards: [R_MEZZANINE_IMPOSED_LOAD] }),
  domain: 'mezzanine floor loading',
  absenceForm: 'NOT_MENTIONED',
  forbiddenStrengthening: {
    textEstablishes: 'a load notice is posted at the access point; a pallet weighs 720 kg; the stack '
      + 'is two high',
    mustNotAssert: 'the imposed load exceeds the posted limit / the mezzanine is overloaded / the '
      + 'posted limit is being complied with',
  },
  hazardEstablished: false,
  expectation: { kind: 'REQUIRED', truth: req(
    'the imposed load in kilonewtons per square metre — the number of pallets, the area they cover, '
    + 'and the figure the posted notice actually carries',
    'the imposed load is within the posted figure for this deck',
    'the stacking continues and the finding is limited to pallet-truck movement and edge protection '
    + 'at the mezzanine opening',
    'the imposed load is above the posted figure',
    'the bay must be de-stacked now and the deck kept clear until the loading is recalculated',
    'REGULATORY_INTERPRETATION',
    'the record turns on a distributed load per square metre and the observation gives a per-pallet '
    + 'weight and a stack height only; neither the covered area nor the posted figure appears '
    + 'anywhere, so the two sides of the comparison cannot both be assembled',
    true) },
},

// ---- US-C1 — OBSERVER_CANNOT_DETERMINE. The absence is ANNOUNCED, and about determinability.
{
  row: row('US-C1',
    'The automatic sliding vehicle gate at the yard entrance is in service and cycling on vehicle '
    + 'detection. Pedestrians are using the same opening to reach the site cabins, walking through '
    + 'the gate line as it travels. The gate leaf runs on a bottom track against a fixed guide post '
    + 'at the closed position. I asked about the force-limiting safety edge on the leading edge; the '
    + 'site manager said he could not tell me whether it had ever been commissioned or tested, and '
    + 'the installer\'s file is not held on site.',
    ['machine_guarding', 'mobile_equipment', 'walking_working_surfaces', 'atmospheric_hazard'],
    { presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ['mobile_equipment', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['atmospheric_hazard'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'],
      decisionCriticalGaps: [{ gapId: 'US-C1-G1',
        description: 'whether the gate\'s force-limiting safety edge has been commissioned and is '
          + 'functioning, which decides whether pedestrians may keep using the gate line',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'The absence is ANNOUNCED and it is announced about DETERMINABILITY: a named person said he '
        + 'could not tell. That is a real, established fact -- and it establishes ignorance, not '
        + 'absence. The temptation is to convert "he could not tell me" into "the edge was never '
        + 'commissioned" or "there is no safety edge", when the observation states the edge exists '
        + 'and says only that its commissioning is unknown to the people present. A trapping point '
        + 'at the guide post with pedestrians in the gate line is a hazard the text establishes.' }),
  domain: 'automatic vehicle gate',
  absenceForm: 'OBSERVER_CANNOT_DETERMINE',
  forbiddenStrengthening: {
    textEstablishes: 'the site manager COULD NOT SAY whether the safety edge was commissioned or '
      + 'tested, and the installer file is not held on site',
    mustNotAssert: 'the safety edge was never commissioned / the gate has no force limitation / the '
      + 'edge does not work',
  },
  hazardEstablished: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the gate\'s force-limiting safety edge has been commissioned and is currently functioning',
    'the edge was commissioned to a measured force limit and still functions',
    'pedestrian use continues under review and the finding is the shared gate line and the absence of '
    + 'a separate pedestrian route',
    'the edge was never commissioned, or does not function',
    'the gate must be put on manual or taken out of automatic service now, because a leaf closing '
    + 'against a fixed guide post with no force limitation can trap a person',
    'REQUIRED_CONTROL',
    'the observation establishes that the people present do not know and that the file is elsewhere; '
    + 'nobody knowing a fact on the day is not evidence about the fact, and the record of the '
    + 'commissioning existing elsewhere is exactly what is unresolved',
    false) },
},

// ---- US-D1 — LIKELY_BUT_UNESTABLISHED. NOTHING negative is stated anywhere.
{
  row: row('US-D1',
    'At 22:40 a single operative is setting out traffic cones along the offside of a live single '
    + 'carriageway to close one lane for a gully-cleaning visit. He is in high-visibility clothing '
    + 'and is walking against the flow as he places the cones. His works vehicle is parked on the '
    + 'verge about fifteen metres beyond the point he has reached, with its beacons running. Traffic '
    + 'is passing in the open lane at the posted speed.',
    ['mobile_equipment', 'walking_working_surfaces', 'training_procedure_supervision',
      'confined_space_entry'],
    { presentHazardFamilies: ['mobile_equipment'],
      defensibleHazardFamilies: ['walking_working_surfaces', 'training_procedure_supervision'],
      forbiddenHazardFamilies: ['confined_space_entry'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['mobile_equipment'],
      decisionCriticalGaps: [{ gapId: 'US-D1-G1',
        description: 'whether an advance warning and taper have already been set out upstream of '
          + 'this point, which decides whether the operative is working inside a signed closure or '
          + 'in live traffic',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE ROW v11 NAMED NOTHING FOR. The observation contains NO negative sentence at all -- '
        + 'nothing is said to be missing, not visible or unknown. The pull toward "there is no '
        + 'traffic management" comes entirely from the circumstances: one man, at night, on a live '
        + 'carriageway. That is LIKELIHOOD, and likelihood establishes nothing. The observation '
        + 'describes the point he HAS REACHED and says nothing about what is upstream of it, which '
        + 'is precisely where an advance sign and taper would be.' }),
  domain: 'night highway works',
  absenceForm: 'LIKELY_BUT_UNESTABLISHED',
  forbiddenStrengthening: {
    textEstablishes: 'one operative is coning out at night, walking against the flow, with his '
      + 'vehicle fifteen metres beyond him',
    mustNotAssert: 'there is no traffic management in place / no advance warning has been set out / '
      + 'the operative is working unprotected in live traffic',
  },
  hazardEstablished: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether advance warning signage and a taper have already been set out upstream of the point the '
    + 'operative has reached',
    'a signed advance warning and taper are already in place upstream and he is working inside them',
    'the work continues and the finding is that he is walking against the flow rather than with it, '
    + 'and the vehicle position relative to the works',
    'nothing has been set out upstream and he is coning from the open carriageway',
    'this is a person on foot in a live traffic lane at night with no protection and the work must '
    + 'stop until the closure is set out from a vehicle',
    'REQUIRED_CONTROL',
    'nothing in the observation says anything about the road upstream of the point he has reached; '
    + 'the scene is consistent with both an unsigned start and a properly signed closure being '
    + 'extended, and being able to picture the worse one is not being told which it is',
    true) },
},

// ---- US-E1 — WORST_CASE_TEMPTATION. The bait is that an alarm's SILENCE means normality.
{
  row: row('US-E1',
    'Two glaziers are setting a large sealed unit into a shopfront opening using a vacuum lifter '
    + 'slung from a small crane. The unit is off the stillage and hanging on the lifter while they '
    + 'line it up, and both men have their hands on the glass. The lifter is a twin-circuit pad set '
    + 'with a low-vacuum alarm. Through the whole of the lift I watched, the alarm did not sound. The '
    + 'pavement beneath the opening is open to the public and is not barriered.',
    ['suspended_loads', 'material_handling_storage', 'walking_working_surfaces', 'welding_fumes'],
    { presentHazardFamilies: ['suspended_loads', 'walking_working_surfaces'],
      defensibleHazardFamilies: ['material_handling_storage'],
      forbiddenHazardFamilies: ['welding_fumes'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['suspended_loads'],
      decisionCriticalGaps: [{ gapId: 'US-E1-G1',
        description: 'whether the lifter\'s vacuum reserve and low-vacuum alarm were function-tested '
          + 'before the lift, without which the alarm\'s silence establishes nothing',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE WORST-CASE ROW, AND THE BAIT IS INVERTED ON PURPOSE. A silent alarm is exactly what a '
        + 'HEALTHY lift sounds like, so the silence is evidence of NORMALITY -- and equally '
        + 'consistent with an alarm that would never sound at all. The adverse branch is dramatic '
        + '(a sealed unit dropping onto an open pavement), which is the pull toward writing "the '
        + 'alarm is not working" or "there is no functioning alarm" as fact. v12 says the branch may '
        + 'EXPLAIN the consequence and must never SETTLE the fact. Suspended load over an unbarriered '
        + 'public pavement is established and must be raised.' }),
  domain: 'glazing vacuum lifter',
  absenceForm: 'WORST_CASE_TEMPTATION',
  forbiddenStrengthening: {
    textEstablishes: 'the low-vacuum alarm DID NOT SOUND during the lift observed',
    mustNotAssert: 'the alarm is not working / there is no functioning low-vacuum alarm / the vacuum '
      + 'reserve is untested and therefore absent',
  },
  hazardEstablished: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the vacuum lifter\'s reserve and low-vacuum alarm were function-tested before this lift',
    'the lifter was function-tested before the lift and the alarm proved on test',
    'the silence during the lift means the vacuum held, and the finding is the unbarriered pavement '
    + 'and the men\'s hands on a suspended unit',
    'no pre-use test was made',
    'the alarm\'s silence proves nothing about the vacuum, the load is being held by an unverified '
    + 'system over an open pavement, and the lift must stop and the unit be landed',
    'REQUIRED_CONTROL',
    'the observation establishes that the alarm did not sound, which is what a correctly functioning '
    + 'lift and a dead alarm both produce; nothing states whether the alarm or the reserve was ever '
    + 'proved, and the two readings of the same silence lead to opposite actions',
    true) },
},

// ---- US-F1 — EXPLICITLY_ABSENT. The text POSITIVELY states the absence. MUST STAY SILENT.
{
  row: row('US-F1',
    'A joiner is ripping softwood battens on the bench-mounted circular saw in the site workshop. '
    + 'The crown guard has been taken off and is lying on the bench beside the machine, and the '
    + 'spreader has been removed with it; I could see the mounting bracket empty. He is feeding the '
    + 'timber past the blade by hand and told me there is no push stick in the workshop and never has '
    + 'been. The machine is running and he is working alone. The isolator is on the wall at arm\'s '
    + 'reach. A single approved governed record covering circular saw guarding was supplied with this '
    + 'inspection.',
    ['machine_guarding', 'personal_protective_equipment', 'walking_working_surfaces', 'hot_work'],
    { presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ['personal_protective_equipment', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['hot_work'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE ROW THAT PROVES v12 IS NOT AN INSTRUCTION TO DOUBT THE TEXT. Every absence here is '
        + 'POSITIVELY ESTABLISHED and by a different route: the guard is SEEN lying on the bench, '
        + 'the empty bracket is SEEN, and the push stick\'s non-existence is stated by the operator '
        + 'himself. v12 says in terms that a stated absence IS established. There is nothing to ask: '
        + 'the record is supplied, it plainly governs, its requirement is plainly unmet, and the '
        + 'action is the same on any answer. A question here would be v12 over-firing.' },
    { governedStandards: [R_MACHINE_GUARD_POINT_OF_OPERATION] }),
  domain: 'bench saw',
  absenceForm: 'EXPLICITLY_ABSENT',
  forbiddenStrengthening: null,
  hazardEstablished: true,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'is the crown guard genuinely absent, or was it removed only for a moment — and is there '
      + 'really no push stick anywhere on site?',
    whyNotDecisionCritical:
      'the guard was SEEN off the machine and the bracket SEEN empty while the saw was running with '
      + 'timber being fed by hand, and the operator affirmatively stated the push stick does not '
      + 'exist. Both absences are established by the observation rather than inferred from it, and '
      + 'the action — stop the machine now — is the same whatever else is added.',
    whatMakesItSettled:
      'direct observation of the removed guard and the empty bracket, plus an explicit operator '
      + 'statement about the push stick. These are the "positively established absence" cases v12 '
      + 'names as establishing the fact.' } },
},

// ---- US-G1 — EXPLICITLY_PRESENT. Described, checked, in date. MUST STAY SILENT.
{
  row: row('US-G1',
    'A telehandler-mounted work platform is not in use here; the access is a self-propelled boom '
    + 'MEWP working at the eaves of the new unit. The operator is wearing a full-body harness with a '
    + 'work-restraint lanyard, and I checked the karabiner myself: it is clipped to the designated '
    + 'anchor point inside the basket and the lanyard is short enough to prevent him reaching the '
    + 'guardrail top. The machine\'s current thorough examination report was produced from the cab '
    + 'and is dated seven weeks ago. The ground is a level compacted stone hardstanding and the '
    + 'machine is a boom type with no outriggers to deploy. The area beneath is taped off.',
    ['fall_protection', 'mobile_equipment', 'walking_working_surfaces', 'chemical_release'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fall_protection', 'mobile_equipment', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['chemical_release'],
      negatedOrSafeStateFamilies: ['fall_protection'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The mirror of US-F1: every control a question could reach for is POSITIVELY described, and '
        + 'three of them were verified by the observer in person. The one thing a coverage habit '
        + 'reaches for -- the outriggers -- is answered in the text by machine type rather than by '
        + 'omission, which is the distinction that matters: this is not "the observation does not '
        + 'mention outriggers", it is "this machine has none to deploy".' }),
  domain: 'MEWP work restraint',
  absenceForm: 'EXPLICITLY_PRESENT',
  forbiddenStrengthening: null,
  hazardEstablished: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'were the outriggers deployed, and is the harness anchor point rated for this machine?',
    whyNotDecisionCritical:
      'the observation states the machine is a boom type with no outriggers to deploy, so the first '
      + 'half asks about equipment the text says does not exist on this machine. The anchor point is '
      + 'described as the designated one and the connection was checked in person. Neither answer '
      + 'changes what is done at this platform today.',
    whatMakesItSettled:
      'direct verification by the observer of the harness, the lanyard length and the anchor point; '
      + 'a produced and in-date thorough examination report; and a positive statement about the '
      + 'machine type that disposes of the outrigger question rather than leaving it unmentioned.' } },
},

// ---- US-H1 — SETTLED_THRESHOLD. The §148 anti-overcorrection control, carried forward.
{
  row: row('US-H1',
    'A maintenance fitter is wearing a half-mask respirator for a resin-mixing task in the composites '
    + 'bay. His fit test record for this make, model and size was produced at the bay and records an '
    + 'overall fit factor of 187, obtained on him by a quantitative protocol. He is clean-shaven at '
    + 'the seal, the mask in use is the same make, model and size named on the record, and the '
    + 'cartridges are within their in-service life as marked on the housing. A single approved '
    + 'governed record covering quantitative fit testing was supplied with this inspection.',
    ['respiratory_protection', 'chemical_inhalation_contact', 'hazcom', 'suspended_loads'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['respiratory_protection', 'chemical_inhalation_contact', 'hazcom'],
      forbiddenHazardFamilies: ['suspended_loads'],
      negatedOrSafeStateFamilies: ['respiratory_protection'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE §148 NON-REGRESSION CONTROL. Value 187, basis "overall fit factor by a quantitative '
        + 'protocol on that individual for that make, model and size" -- named identically by the '
        + 'record and the observation -- and side plainly above 100. Every element the v11 threshold '
        + 'rule requires is present, and the three things that could unsettle it (a different mask, '
        + 'a beard at the seal, expired cartridges) are each closed positively in the text. If this '
        + 'row asks, §148\'s repair has regressed under §149.' },
    { governedStandards: [R_RESPIRATOR_FIT_FACTOR] }),
  domain: 'respirator fit testing',
  absenceForm: 'SETTLED_THRESHOLD',
  forbiddenStrengthening: null,
  hazardEstablished: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'is a fit factor of 187 adequate for this task, and was the test done on the mask he is '
      + 'actually wearing?',
    whyNotDecisionCritical:
      'the record states its pass level as an overall fit factor of 100 or greater by a quantitative '
      + 'protocol for that specific make, model and size on that individual, and the observation '
      + 'states each of those things in the same terms. 187 is not close to 100 and there is no '
      + 'competing basis in play.',
    whatMakesItSettled:
      'value = 187 overall fit factor; basis = quantitative protocol, this individual, this make, '
      + 'model and size, named identically by both texts; side = far above the stated pass level of '
      + '100.' } },
},

// ---- US-I1 — DETERMINISTIC_DERIVATION. The absence FOLLOWS, with no extra premise.
{
  row: row('US-I1',
    'A fitter is inside the guard enclosure of the belt conveyor replacing a damaged idler roller. '
    + 'The drive motor\'s supply cable has been physically removed: it is disconnected at the motor '
    + 'terminal box and at the starter panel, both ends are visible, and the cable is coiled on the '
    + 'floor beside the panel where I photographed it. The conveyor is a single-drive unit with no '
    + 'other prime mover, and the belt is horizontal and empty with no stored gravity load. A second '
    + 'fitter is standing at the enclosure door.',
    ['machine_guarding', 'lockout_tagout', 'material_handling_storage', 'noise_exposure'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['machine_guarding', 'lockout_tagout', 'material_handling_storage'],
      forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: ['lockout_tagout', 'machine_guarding'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE ONE CASE WHERE THE MODEL MAY DERIVE AN ABSENCE. A cable removed at BOTH ends, both ends '
        + 'seen, on a single-drive unit with no other prime mover and no stored gravity load, cannot '
        + 'be energised -- and that conclusion needs NO additional factual premise beyond what the '
        + 'text states. This is the fourth ESTABLISHED route ("deterministic derivation from '
        + 'supplied facts"), and it is the boundary case for the whole §149 rule: v12 must not make '
        + 'the model ask "but was it locked out?" when the text has already put the energy source on '
        + 'the floor. Every premise the derivation needs is closed IN THE TEXT, which is what '
        + 'separates this from US-A1.' }),
  domain: 'conveyor drive disconnection',
  absenceForm: 'DETERMINISTIC_DERIVATION',
  forbiddenStrengthening: null,
  hazardEstablished: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'has the conveyor been locked out and tagged, and was the isolation verified before entry?',
    whyNotDecisionCritical:
      'the supply cable is disconnected at both ends and lying on the floor, both ends were seen, '
      + 'the unit has a single drive and no other prime mover, and the belt carries no stored '
      + 'gravity load. A padlock adds nothing a removed cable has not already achieved, and no '
      + 'answer about the lockout paperwork changes what is done at this conveyor today.',
    whatMakesItSettled:
      'deterministic derivation from stated facts with no extra premise: no supply path exists, no '
      + 'second prime mover exists, and no stored energy exists — each of the three stated, not '
      + 'assumed.' } },
},

// ---- US-J1 — DECISION_INVARIANT_UNKNOWN. Genuinely unknown; both answers converge.
{
  row: row('US-J1',
    'A tipper is reversing to the muck-away point in the compound. A banksman in high-visibility '
    + 'clothing is standing off the nearside in the driver\'s mirror line, giving the agreed hand '
    + 'signals, and the driver acknowledged each one before moving. The reversing alarm is sounding, '
    + 'the manoeuvre area is coned off from the pedestrian route, and the banksman stopped the '
    + 'vehicle once while I watched when a pedestrian approached the cones. The observation does not '
    + 'record whether the site holds a written traffic management plan.',
    ['mobile_equipment', 'walking_working_surfaces', 'training_procedure_supervision', 'hot_work'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['mobile_equipment', 'walking_working_surfaces',
        'training_procedure_supervision'],
      forbiddenHazardFamilies: ['hot_work'],
      negatedOrSafeStateFamilies: ['mobile_equipment'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'GENUINELY UNKNOWN AND GENUINELY INVARIANT, and the row is written so the invariance is '
        + 'DEMONSTRATED rather than asserted: the control the plan would describe was watched '
        + 'working, including a stop the banksman actually made. Whether a document exists elsewhere '
        + 'changes nothing about this manoeuvre today. This is also a documentation shape, which the '
        + 'seven NOT-DECISION-CRITICAL entries already name, so it tests that v12 has not '
        + 'destabilised the existing precision text.' }),
  domain: 'reversing banksman',
  absenceForm: 'DECISION_INVARIANT_UNKNOWN',
  forbiddenStrengthening: null,
  hazardEstablished: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'does the site hold a written traffic management plan covering this reversing operation?',
    whyNotDecisionCritical:
      'the segregation, the signalling and the banksman\'s authority to stop the vehicle were all '
      + 'observed working, including one stop actually made. A plan on a shelf would describe that '
      + 'arrangement; its presence or absence selects no different action for this manoeuvre, and '
      + 'the corrective step if it were missing — write it down — is not what is decided here.',
    whatMakesItSettled:
      'no threshold is in play. The unknown is real, and both answers lead to the same thing being '
      + 'done at this reversing point today, which is the invariance limb of the counterfactual '
      + 'test.' } },
},

];

export const UNSUPPORTED_SETTLEMENT_ROWS: readonly FormalCohortRow[] =
  UNSUPPORTED_SETTLEMENT_FIXTURES.map(f => f.row);

export function unsupportedFixtureByRowId(
  rowId: string,
): UnsupportedSettlementFixture | undefined {
  return UNSUPPORTED_SETTLEMENT_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * Frozen budget, transcribed from the §149 authorization BEFORE the probe runs.
 *
 * "Maximum: 10 provider requests; $1.50 total provider spend; zero retries unless objectively
 * required by transport failure and still inside the request cap."
 *
 * TEN logical calls against a TEN-request ceiling leaves NO headroom, so `retryRequestBudget` is
 * ZERO and a retry is refused rather than silently exceeding the cap. That is the authorization read
 * literally: a transport failure on one row leaves that row `PROVIDER_FAILED` and the run continues,
 * with nothing fabricated into a success and the suppression recorded.
 */
export const UNSUPPORTED_SETTLEMENT_BUDGET = {
  targetLogicalCalls: 10,
  hardLogicalCallCeiling: 10,
  hardProviderRequestCeiling: 10,
  hardSpendCeilingUsd: 1.50,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 0,
} as const;

/**
 * Frozen §149 hosted decision gates, transcribed from the authorization before the probe runs.
 *
 * `trueContradictionRejection` carries NO numeric target, and that is deliberate. The authorization
 * asks for at least one REALIZED opportunity, and a realized opportunity requires the MODEL to emit
 * a `HAZARD_EXISTENCE` question naming its own ACTIVE candidate -- an error v12 explicitly tells it
 * not to make. It cannot be commissioned, only observed. The rejection PROPERTY is deterministic and
 * is proved against the real normalizer elsewhere; here the denominator is reported as whatever the
 * run produces, and a zero denominator is reported as NOT_EXERCISED and never as 100%.
 */
export const UNSUPPORTED_SETTLEMENT_GATES = {
  /** STRICT and DELIVERED. Reasoned-but-destroyed is a diagnostic, never recall. */
  strictRequiredRecall: 1.0,
  maxForbiddenViolations: 0,
  /** Cases where an unobserved fact is promoted to an affirmative state that kills the question. */
  maxUnsupportedSettlements: 0,
  affectedDecisionSurvival: 1.0,
  maxAcceptedInvalidLinkages: 0,
  /** Every stripped invalid linkage must be visible in the RAW diagnostics. */
  rawLinkageReconciliationRequired: true,
  maxInvalidClarificationObjects: 0,
  maxCitationContainmentViolations: 0,
  maxProtectedAuthorityContradictions: 0,
} as const;
