/**
 * EXPERT HAZLENZ -- §150 CLARIFICATION RETENTION-BRIDGE REGRESSION SET. v8.
 *
 * ==================== ONE QUESTION ====================
 *
 * When Expert correctly RETAINS a decision-critical unknown -- refusing to settle it, leaving the
 * candidate INSUFFICIENT_EVIDENCE, naming the doubt in reasoning -- does that unknown reach
 * `decisionCriticalClarifications`, or does it terminate where it was retained?
 *
 * §149's US-D1 did everything right except the last step. It refused the strengthening, declined to
 * conclude, marked the candidate `INSUFFICIENT_EVIDENCE`, wrote the doubt into reasoning AND into the
 * summary -- and asked nothing. That is the SIXTH mechanism, RETENTION WITHOUT PROMOTION, and it is
 * what this set measures.
 *
 * TEN rows, TEN new safety domains, five REQUIRED and five FORBIDDEN. Not an expanded validation, not
 * a cohort, and -- as with v5, v6 and v7 -- IT AUTHORS NO DISAGREEMENT OR INSIGHT TRUTH AT ALL.
 *
 * ==================== HOW THE REQUIRED HALF IS BUILT, AND WHY ====================
 *
 * The §149 successes are not useful here. US-A1, US-C1 and US-E1 recovered because the unknown was
 * attached to a hazard the text ESTABLISHES, so no candidate state could hold it and the
 * clarification list was the only channel available. US-B1 and TR-C1 recovered because a SUPPLIED
 * RECORD could not be evaluated, which v11's threshold limb governs directly.
 *
 * **Every REQUIRED row here is built so that neither of those drivers applies.** The unresolved fact
 * is itself candidate-shaped -- it is about whether a condition, programme or arrangement EXISTS --
 * so the model has a legal, contract-blessed place to put the doubt other than a question. If v13's
 * bridge does not carry it, the row goes silent exactly as US-D1 did, and the failure is
 * attributable to the bridge rather than to noticing.
 *
 *   RB-A1  the unknown IS the candidate                    a lone activity whose backup is unstated
 *   RB-B1  the unknown is a programme's existence          candidate-shaped, no record supplied
 *   RB-C1  the unknown is a prior event                    nothing present can settle what was done
 *   RB-D1  the unknown is a competence/authorisation state candidate-shaped and decision-changing
 *   RB-E1  the unknown is a system's coverage              two branches, both articulable
 *
 * NONE of them supplies a governed record, and NONE requires an unsupported-settlement temptation --
 * §149 closed that defect at 0/10 and this set does not re-litigate it.
 *
 * ==================== AND THE FIVE THAT MUST STAY SILENT ====================
 *
 *   RB-F1  DECISION_INVARIANT_INSUFFICIENCY  a genuinely unknown fact whose answers converge. THE
 *                                            MOST IMPORTANT CONTROL IN THE SET: it is the row a
 *                                            bridge misread as "INSUFFICIENT_EVIDENCE -> ASK" would
 *                                            fire on, and it must stay silent.
 *   RB-G1  NON_DECISION_CRITICAL_DETAIL      insufficiency about a detail that selects no action.
 *   RB-H1  EXPLICITLY_ABSENT                 §149 non-regression: a stated absence is settled.
 *   RB-I1  SETTLED_THRESHOLD                 §148 non-regression: value, basis and side supplied.
 *   RB-J1  TRUE_DETERMINISTIC_DERIVATION     the REPAIRED US-I1. See below.
 *
 * ==================== THE TWO REPAIRED §149 FIXTURE DEFECTS ====================
 *
 * Both were found by reading §149's output. Neither changes a historical score: §149's literal
 * FORBIDDEN silence stands at 4/5 and its adjusted diagnostic at 5/5.
 *
 * **US-D1 presupposed the fact it withheld.** Its observation said *"traffic is passing in THE OPEN
 * lane"*, and the definite article presupposes that another lane is closed -- the very closure state
 * the row meant to leave unknown. **US-D1 IS NOT REUSED.** `RB-A1` is its structural analogue on
 * unrelated facts, and the observation is written so that nothing in it states OR PRESUPPOSES the
 * missing arrangement: every sentence describes only what is at the work position itself.
 *
 * **US-I1's "deterministic derivation" was not deterministic.** A supply cable removed at both ends
 * establishes that no supply path exists NOW; concluding none exists THROUGHOUT needs the unstated
 * premise that nobody reconnects it -- and the row itself placed a second fitter at the door. **The
 * model asked whether it was locked against reconnection and was RIGHT.** US-I1 leaves the FORBIDDEN
 * denominator. `RB-J1` replaces it with a derivation whose conclusion follows with NO added premise:
 * the energy source is not merely disconnected but PHYSICALLY ABSENT and unavailable, and the row
 * states that there is no other, so no reconnection path exists to be secured.
 *
 * ==================== PROVENANCE AND CONFINEMENT ====================
 *
 * Authored 2026-09-03. No reserved material opened. No spent formal-cohort row read, copied,
 * paraphrased or mimicked. No §146-§149 row is reused as a scored row: all ten domains (lone
 * pipeline patrol, catering steam oven, mobile crane outrigger mats, pharmacy cleanroom gowning,
 * cold-store sprinkler coverage, quarry haul road, print-room guillotine, plate heat exchanger,
 * demolition water suppression, laboratory centrifuge) are new to this programme and every
 * observation is newly written. Structural analogues of prior mechanisms are used deliberately and
 * labelled as such. The single supplied governed record exists only so the §148 threshold control
 * has something to be settled against.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const RETENTION_BRIDGE_FIXTURE_SET_VERSION =
  'hazlenz.expert.retention-bridge.fixtures.v8' as const;

// ---------------------------------------------------------------- truth vocabulary

/**
 * Where the model is expected to try to park the doubt, or why the row is settled.
 *
 * The first five are the RETENTION forms: on each, the unresolved fact is candidate-shaped, so
 * `INSUFFICIENT_EVIDENCE` is an available and legitimate place to leave it. The last five are the
 * matched controls.
 */
export const RETENTION_FORMS = [
  'UNKNOWN_IS_THE_CANDIDATE',
  'UNKNOWN_IS_A_PROGRAMME_EXISTENCE',
  'UNKNOWN_IS_A_PRIOR_EVENT',
  'UNKNOWN_IS_AN_AUTHORISATION_STATE',
  'UNKNOWN_IS_A_SYSTEM_COVERAGE',
  'DECISION_INVARIANT_INSUFFICIENCY',
  'NON_DECISION_CRITICAL_DETAIL',
  'EXPLICITLY_ABSENT',
  'SETTLED_THRESHOLD',
  'TRUE_DETERMINISTIC_DERIVATION',
] as const;
export type RetentionForm = (typeof RETENTION_FORMS)[number];

export interface RequiredClarificationTruth {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  affectedDecision: string;
  whyNotEstablished: string;
  absenceIsUnmarked: boolean;
}

export interface ForbiddenClarificationTruth {
  temptingQuestion: string;
  whyNotDecisionCritical: string;
  whatMakesItSettled: string;
}

export interface RetentionBridgeFixture {
  row: FormalCohortRow;
  domain: string;
  retentionForm: RetentionForm;
  /**
   * THE ADJUDICATION KEY FOR THE RETAINED-BUT-NOT-ASKED GATE.
   *
   * `retentionChannel` names where the model is EXPECTED to try to park the doubt if the bridge
   * fails, and `retainedFact` states the fact in the model's own likely terms. A row counts as
   * RETAINED-BUT-NOT-ASKED when the model demonstrably holds this fact open -- in a candidate state,
   * in reasoning, in the summary or in uncertainty -- and no clarification carries it.
   *
   * **NOTHING IN THE HARNESS SCORES IT.** Deciding whether prose holds a fact open is semantic
   * judgement, and §148 measured what happens when a keyword rule is trusted with that class of
   * decision. `null` on rows where nothing should be retained.
   */
  retention: { retainedFact: string; retentionChannel: string } | null;
  /** TRUE where the text establishes a hazard, so an ACTIVE candidate is expected and must survive. */
  hazardEstablished: boolean;
  /**
   * TRUE where the unresolved fact is CANDIDATE-SHAPED -- about whether a condition, programme or
   * arrangement exists -- so `INSUFFICIENT_EVIDENCE` is an available parking place and the bridge is
   * the only thing that can carry it to a question. This is what makes the REQUIRED half a test of
   * the bridge rather than of noticing.
   */
  unknownIsCandidateShaped: boolean;
  expectation:
    | { kind: 'REQUIRED'; truth: RequiredClarificationTruth }
    | { kind: 'FORBIDDEN'; truth: ForbiddenClarificationTruth };
}

// ---------------------------------------------------------------- governed record

const R_GUILLOTINE_TWO_HAND: GovernedStandardView = {
  citation: '29 CFR 1910.212(a)(3)(ii)',
  title: 'Machine guarding — point of operation',
  approvedText:
    'The point of operation of machines whose operation exposes an employee to injury shall be '
    + 'guarded. Where a two-hand control is used as the point-of-operation guard, the safety '
    + 'distance between each hand control and the point of operation shall be not less than the '
    + 'distance the operator can reach the danger point during the stopping time of the machine, '
    + 'measured from the nearest edge of each control to the nearest point of the danger zone. See '
    + '29 CFR 1910.212(a)(3)(ii).',
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

export const RETENTION_BRIDGE_FIXTURES: readonly RetentionBridgeFixture[] = [

// ---- RB-A1 — the REPAIRED US-D1 analogue. The unknown IS the candidate.
//      Every sentence describes only what is at the work position, so nothing states OR PRESUPPOSES
//      the missing arrangement — which is precisely the defect US-D1 carried.
{
  row: row('RB-A1',
    'A pipeline technician is working alone at a remote above-ground valve installation on the moor, '
    + 'breaking the bonnet on a section valve to change the gland packing. He arrived in a marked '
    + 'company pickup, which is parked at the fence line. He is wearing a gas detector clipped at '
    + 'the collar and it is showing a green status light. The installation is fenced, the access '
    + 'track runs two miles back to the public road, and there is no other person at the site.',
    ['chemical_release', 'lone_working', 'hydraulic_pneumatic_energy', 'welding_fumes'],
    { presentHazardFamilies: ['lone_working'],
      defensibleHazardFamilies: ['chemical_release', 'hydraulic_pneumatic_energy'],
      forbiddenHazardFamilies: ['welding_fumes'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['lone_working'],
      decisionCriticalGaps: [{ gapId: 'RB-A1-G1',
        description: 'whether a lone-worker check-in arrangement is running for this visit — a '
          + 'monitored device, a call schedule or a supervisor expecting him at a known time',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE REPAIRED US-D1. The unresolved fact is CANDIDATE-SHAPED -- does a lone-worker '
        + 'monitoring arrangement exist? -- so the model can legally park the doubt as an '
        + 'INSUFFICIENT_EVIDENCE candidate and never ask. That is exactly the bridge test. '
        + 'CRITICALLY, AND UNLIKE US-D1, NOTHING IN THE TEXT PRESUPPOSES THE ANSWER: every sentence '
        + 'describes what is at the valve itself -- the vehicle, the detector, the fence, the track '
        + '-- and "there is no other person at the site" is a statement about PRESENCE at the '
        + 'location, which says nothing either way about a remote check-in. The gas detector is a '
        + 'deliberate distractor: it detects, it does not summon.' }),
  domain: 'lone pipeline patrol',
  retentionForm: 'UNKNOWN_IS_THE_CANDIDATE',
  retention: {
    retainedFact: 'whether any lone-worker monitoring or check-in arrangement covers this visit',
    retentionChannel: 'expected parking place: a candidate left INSUFFICIENT_EVIDENCE for a '
      + 'lone-working or supervision family, and/or reasoning describing it as a possible gap',
  },
  hazardEstablished: true,
  unknownIsCandidateShaped: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether a lone-worker check-in or monitoring arrangement is running for this visit',
    'a monitored lone-worker device or an agreed call schedule is in force, with someone expecting '
    + 'him at a known time',
    'the work continues and the finding is limited to the breaking-containment method and the '
    + 'detector\'s alarm settings',
    'no monitoring or check-in arrangement covers this visit',
    'a man breaking containment alone two miles from a road with nobody expecting him has no route to '
    + 'rescue at all, and the work must stop until monitoring is arranged',
    'REQUIRED_CONTROL',
    'the observation describes only what is present AT the valve; a check-in arrangement is a remote '
    + 'and administrative thing that would leave nothing to see there, and "no other person at the '
    + 'site" is about presence at the location rather than about who is monitoring it',
    true) },
},

// ---- RB-B1 — the unknown is a PROGRAMME'S EXISTENCE. Candidate-shaped, no record supplied.
{
  row: row('RB-B1',
    'The catering unit\'s combination steam oven is in use for the lunch service. The kitchen '
    + 'porter is opening the door at the end of a steam cycle and a large volume of steam is '
    + 'discharging into the room at face height. He steps back as he opens it. The unit sits under '
    + 'a canopy and the extract is running. He is wearing the standard kitchen whites and no face '
    + 'protection.',
    ['thermal_burn', 'ventilation_air_quality', 'personal_protective_equipment', 'suspended_loads'],
    { presentHazardFamilies: ['thermal_burn'],
      defensibleHazardFamilies: ['ventilation_air_quality', 'personal_protective_equipment'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'RB-B1-G1',
        description: 'whether the oven has a working steam-purge or delayed-release interlock that '
          + 'vents the cavity before the door can be opened',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'The unknown is whether an ENGINEERING CONTROL EXISTS on this machine -- candidate-shaped, '
        + 'and a model can park it as an INSUFFICIENT_EVIDENCE guarding or thermal candidate. The '
        + 'observed steam discharge is consistent with BOTH branches: a purge that has failed or '
        + 'been defeated, and a machine that never had one. Which it is decides whether the answer '
        + 'is a repair or a change of method, and those are different actions today.' }),
  domain: 'catering steam oven',
  retentionForm: 'UNKNOWN_IS_A_PROGRAMME_EXISTENCE',
  retention: {
    retainedFact: 'whether this oven has a steam-purge or delayed-release interlock at all',
    retentionChannel: 'expected parking place: an INSUFFICIENT_EVIDENCE thermal or guarding '
      + 'candidate, or reasoning calling the purge "possible" or "not confirmed"',
  },
  hazardEstablished: true,
  unknownIsCandidateShaped: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the oven is fitted with a functioning steam-purge or delayed-release interlock',
    'a purge exists and has failed or been bypassed',
    'the machine is taken out of service for repair and the finding is a maintenance defect',
    'the machine has no purge feature at all',
    'no repair will fix it, and the control must be a changed opening method plus face and arm '
    + 'protection now, which is a different corrective action',
    'REQUIRED_CONTROL',
    'a face-height steam discharge on door opening is stated, and it is equally consistent with a '
    + 'defeated purge and with a machine that never had one; nothing in the observation distinguishes '
    + 'them, and the two lead to different work today',
    true) },
},

// ---- RB-C1 — the unknown is a PRIOR EVENT. Nothing present can settle what was done before.
{
  row: row('RB-C1',
    'A 60-tonne mobile crane is set up on the corner of the site to lift plant onto the roof. All '
    + 'four outriggers are fully extended and the machine is level on its bubble. Timber mats are '
    + 'under each outrigger pad. The near-side rear outrigger stands about a metre from the line of '
    + 'a backfilled service trench that runs across the compound and is visible as a strip of '
    + 'different-coloured surfacing. The appointed person is on site with the lift plan in hand and '
    + 'the lift has not yet started.',
    ['suspended_loads', 'mobile_equipment', 'excavation_trenching', 'noise_exposure'],
    { presentHazardFamilies: ['suspended_loads'],
      defensibleHazardFamilies: ['mobile_equipment', 'excavation_trenching'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['suspended_loads'],
      decisionCriticalGaps: [{ gapId: 'RB-C1-G1',
        description: 'whether the ground bearing capacity beside the backfilled trench was assessed '
          + 'and the mats sized for it before the crane was set up',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE UNKNOWN IS A PAST EVENT, and nothing visible now can settle it -- a completed ground '
        + 'assessment leaves timber mats and a level machine, and so does an omitted one. That makes '
        + 'INSUFFICIENT_EVIDENCE an especially natural parking place: the model can note that the '
        + 'assessment "is not stated" and move on. The lift has NOT started, which is what makes the '
        + 'two branches lead to different actions today rather than to the same one.' }),
  domain: 'mobile crane outrigger mats',
  retentionForm: 'UNKNOWN_IS_A_PRIOR_EVENT',
  retention: {
    retainedFact: 'whether a ground bearing assessment was carried out for this set-up position',
    retentionChannel: 'expected parking place: an INSUFFICIENT_EVIDENCE ground or lifting candidate, '
      + 'or reasoning noting that the assessment "is not stated"',
  },
  hazardEstablished: true,
  unknownIsCandidateShaped: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the ground beside the backfilled trench was assessed and the mats sized to the assessed '
    + 'bearing pressure before set-up',
    'an assessment was done and the mats are sized to it',
    'the lift proceeds and the finding is limited to the exclusion zone and the plan\'s wind limits',
    'no assessment was made, or it did not consider the backfilled trench',
    'the crane must not lift from this position until the ground is assessed, because an outrigger '
    + 'settling into poorly compacted backfill under load is how a crane goes over',
    'REQUIRED_CONTROL',
    'mats, full extension and a level machine are all stated and all consistent with an assessment '
    + 'having been made AND with none having been made; a past assessment leaves no trace at the '
    + 'set-up that its absence would not also leave',
    true) },
},

// ---- RB-D1 — the unknown is an AUTHORISATION STATE. Candidate-shaped and decision-changing.
{
  row: row('RB-D1',
    'In the pharmacy cleanroom an operator is gowned and is compounding a cytotoxic preparation in '
    + 'the negative-pressure isolator. The isolator\'s pressure gauge is inside the operating band '
    + 'and the glove ports are in use. A second person is at the pass-through hatch handing in '
    + 'materials, wearing a laboratory coat and no gauntlets, and is reaching into the hatch to the '
    + 'elbow while the transfer is made. The unit\'s cleaning record for the isolator is on the wall '
    + 'and is signed for this morning.',
    ['chemical_inhalation_contact', 'personal_protective_equipment', 'hazcom', 'fall_protection'],
    { presentHazardFamilies: ['chemical_inhalation_contact'],
      defensibleHazardFamilies: ['personal_protective_equipment', 'hazcom'],
      forbiddenHazardFamilies: ['fall_protection'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'RB-D1-G1',
        description: 'whether the pass-through hatch is an airlock interlocked against the isolator '
          + 'chamber, which decides whether the second person is reaching into a contaminated space',
        affectedDecision: 'EXPOSURE' }],
      recordedInteractions: [],
      authoringRationale:
        'The unresolved fact is whether the hatch is INTERLOCKED -- a property of the installation, '
        + 'candidate-shaped, and parkable as an INSUFFICIENT_EVIDENCE exposure candidate. The '
        + 'cleaning record and the in-band gauge are deliberate distractors: both are stated, both '
        + 'are reassuring, and neither bears on the hatch. Note the authored label is EXPOSURE, not '
        + 'REQUIRED_CONTROL, so the set does not test a single label repeatedly.' }),
  domain: 'pharmacy cleanroom gowning',
  retentionForm: 'UNKNOWN_IS_AN_AUTHORISATION_STATE',
  retention: {
    retainedFact: 'whether the pass-through hatch is interlocked and isolated from the isolator '
      + 'chamber',
    retentionChannel: 'expected parking place: an INSUFFICIENT_EVIDENCE exposure candidate for the '
      + 'second person, or reasoning calling the hatch arrangement unclear',
  },
  hazardEstablished: true,
  unknownIsCandidateShaped: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the pass-through hatch is an interlocked airlock sealed from the isolator chamber',
    'the hatch is an interlocked airlock and cannot be open to the chamber during the transfer',
    'the second person is not exposed and the finding is limited to gowning discipline at the hatch',
    'the hatch is open to the chamber, or its interlock is not in use',
    'a person in a laboratory coat is reaching bare-armed into a cytotoxic containment space and the '
    + 'transfer must stop now',
    'EXPOSURE',
    'the gauge reading and the cleaning record are stated and neither concerns the hatch; the '
    + 'observation describes the transfer happening but never says what the hatch is connected to',
    true) },
},

// ---- RB-E1 — the unknown is a SYSTEM'S COVERAGE. Two branches, both articulable.
{
  row: row('RB-E1',
    'The cold store has been re-racked to a higher configuration and the top pallet positions now '
    + 'sit about 700 millimetres below the sprinkler deflectors, where previously the racking was '
    + 'two beam levels lower. The store is stocked to the new top level with palletised cartons on '
    + 'timber pallets. The sprinkler heads themselves are unobstructed at deflector level and the '
    + 'system gauge in the valve house reads normal.',
    ['fire_explosion', 'material_handling_storage', 'emergency_equipment', 'confined_space_entry'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'material_handling_storage',
        'emergency_equipment'],
      forbiddenHazardFamilies: ['confined_space_entry'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'RB-E1-G1',
        description: 'whether the sprinkler system was designed or re-assessed for the new storage '
          + 'height and configuration, or whether it remains designed for the previous, lower one',
        affectedDecision: 'APPLICABILITY' }],
      recordedInteractions: [],
      authoringRationale:
        'The unknown is whether the PROTECTION SYSTEM COVERS the changed use -- candidate-shaped and '
        + 'parkable. The two stated reassurances are both about the system\'s CONDITION (heads '
        + 'clear, gauge normal) and neither is about its DESIGN BASIS, which is what the re-racking '
        + 'put in question. No governed record is supplied, so v11\'s threshold limb cannot carry '
        + 'this row; only the bridge can. Authored label APPLICABILITY, a third distinct value.' }),
  domain: 'cold-store sprinkler coverage',
  retentionForm: 'UNKNOWN_IS_A_SYSTEM_COVERAGE',
  retention: {
    retainedFact: 'whether the sprinkler design basis covers the new, higher storage configuration',
    retentionChannel: 'expected parking place: an INSUFFICIENT_EVIDENCE fire or emergency-equipment '
      + 'candidate, or reasoning noting that the design basis is not stated',
  },
  hazardEstablished: false,
  unknownIsCandidateShaped: true,
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the sprinkler installation was designed or re-assessed for the raised storage height '
    + 'and the current commodity, or is still on the previous lower configuration',
    'the system was re-assessed and covers the new height and commodity',
    'the store operates normally and the finding is limited to the 700 millimetre clearance being '
    + 'maintained as stock moves',
    'the system is still designed for the previous, lower racking',
    'the store is operating outside the fire protection it actually has, and the top level must be '
    + 'de-stocked until the design is re-assessed',
    'APPLICABILITY',
    'the heads being clear and the gauge reading normal are both statements about the system\'s '
    + 'CONDITION; neither says anything about the DESIGN BASIS, and it is the design basis that the '
    + 'change in racking height put in question',
    true) },
},

// ---- RB-F1 — DECISION_INVARIANT_INSUFFICIENCY. THE MOST IMPORTANT CONTROL IN THE SET.
//      This is the row a bridge misread as "INSUFFICIENT_EVIDENCE -> ASK" would fire on.
{
  row: row('RB-F1',
    'On the quarry haul road a rigid dump truck is being driven down the ramp with an evidently '
    + 'overloaded body: material is standing proud of the sideboards and spilling onto the road '
    + 'surface as it travels. The ramp is a one-in-eight gradient with a windrow to the outside '
    + 'edge. Light vehicles are using the same road in both directions. The observation does not '
    + 'record the truck\'s rated payload, and the weighbridge ticket for this load was not '
    + 'available.',
    ['mobile_equipment', 'material_handling_storage', 'walking_working_surfaces', 'hot_work'],
    { presentHazardFamilies: ['mobile_equipment'],
      defensibleHazardFamilies: ['material_handling_storage', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['hot_work'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['mobile_equipment'],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE ROW THAT DECIDES WHETHER THE BRIDGE OVER-FIRES. The rated payload is genuinely unknown '
        + 'and the observation says so in terms, so the model will very reasonably leave something '
        + 'INSUFFICIENT_EVIDENCE here -- and a bridge misread as "INSUFFICIENT_EVIDENCE means ask" '
        + 'fires immediately. IT MUST NOT. The defect is STATED AND OBSERVED: material spilling onto '
        + 'a haul road used by light vehicles in both directions. Stop loading to the sideboards and '
        + 'clear the road -- and that is the same action at any rated payload, because the load is '
        + 'over the sideboards whatever the plate says. The two answers converge.' }),
  domain: 'quarry haul road',
  retentionForm: 'DECISION_INVARIANT_INSUFFICIENCY',
  retention: null,
  hazardEstablished: true,
  unknownIsCandidateShaped: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'what is the truck\'s rated payload, and what did this load actually weigh?',
    whyNotDecisionCritical:
      'the observed defect is material standing proud of the sideboards and falling onto a shared '
      + 'haul road, which is a spillage and struck-by exposure established by observation rather '
      + 'than by weight. No rated payload makes an over-the-sideboards load acceptable, and the '
      + 'corrective action — stop overfilling, clear the road — is identical on every answer.',
    whatMakesItSettled:
      'the unknown is real and the observation admits it, but both branches converge on the same '
      + 'action today. This is the invariance limb of the counterfactual test, and the bridge '
      + 'explicitly defers to it.' } },
},

// ---- RB-G1 — NON_DECISION_CRITICAL_DETAIL. Insufficiency about a detail that selects no action.
{
  row: row('RB-G1',
    'In the print room the operator is feeding stock into the guillotine using the two-hand controls '
    + 'as designed, with both hands on the buttons through the cut and the finger guard down. The '
    + 'blade area is enclosed and the back gauge is set. The machine\'s maintenance sticker shows a '
    + 'service four months ago against an annual interval. The observation does not record the '
    + 'machine\'s year of manufacture or its serial number.',
    ['machine_guarding', 'walking_working_surfaces', 'material_handling_storage', 'welding_fumes'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['machine_guarding', 'walking_working_surfaces',
        'material_handling_storage'],
      forbiddenHazardFamilies: ['welding_fumes'],
      negatedOrSafeStateFamilies: ['machine_guarding'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'Insufficiency about a genuinely absent DETAIL that no decision turns on. The guard, the '
        + 'two-hand operation, the enclosure and the service currency are each observed and stated. '
        + 'A year of manufacture changes nothing that is done at this machine today, and it is the '
        + 'documentation/history shape the seven NOT-DECISION-CRITICAL entries already name.' }),
  domain: 'print-room guillotine',
  retentionForm: 'NON_DECISION_CRITICAL_DETAIL',
  retention: null,
  hazardEstablished: false,
  unknownIsCandidateShaped: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'what year was the guillotine manufactured, and what is its serial number?',
    whyNotDecisionCritical:
      'the point-of-operation control is observed working as designed with both hands on the '
      + 'buttons and the finger guard down, and the service is in date. Neither the age nor the '
      + 'serial number selects any different action at this machine today; they are record details.',
    whatMakesItSettled:
      'every fact a decision turns on — guard state, mode of operation, enclosure, service currency '
      + '— is stated and observed. The unknown is real and is about identification rather than '
      + 'about a decision.' } },
},

// ---- RB-H1 — EXPLICITLY_ABSENT. §149 non-regression: a stated absence is settled.
{
  row: row('RB-H1',
    'The plate heat exchanger on the dairy pasteuriser is being opened for a plate inspection. The '
    + 'fitter has removed the guard panel and told me there is no blank flange set on site for this '
    + 'exchanger and never has been, so the line is isolated by closing the two manual valves either '
    + 'side and hanging a tag on each. He showed me both valves closed and both tags in place, and '
    + 'the CIP caustic circuit shares the same header upstream of the near valve.',
    ['chemical_release', 'lockout_tagout', 'thermal_burn', 'suspended_loads'],
    { presentHazardFamilies: ['chemical_release', 'lockout_tagout'],
      defensibleHazardFamilies: ['thermal_burn'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['chemical_release'],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE §149 NON-REGRESSION CONTROL, and it is the mirror of RB-A1. Here the absence is '
        + 'POSITIVELY ESTABLISHED by the operator\'s own statement -- there are no blank flanges and '
        + 'never have been -- and the isolation method, the valve states and the tags were all seen. '
        + 'v12 says a stated absence IS established and should be used. Everything a decision turns '
        + 'on is stated: valve-only isolation on a shared caustic header is the finding, and it is '
        + 'the finding whatever else is asked.' }),
  domain: 'plate heat exchanger',
  retentionForm: 'EXPLICITLY_ABSENT',
  retention: null,
  hazardEstablished: true,
  unknownIsCandidateShaped: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'are blank flanges genuinely unavailable, or could a set be obtained — and were the valves '
      + 'actually proved closed rather than just turned?',
    whyNotDecisionCritical:
      'the operator affirmatively stated that no blank flange set exists on site, and both closed '
      + 'valves and both tags were seen. The finding — that a shared caustic header is isolated by '
      + 'valves and tags alone while a man is inside the exchanger — is established by what was '
      + 'observed, and no answer changes what is done at this exchanger today.',
    whatMakesItSettled:
      'an explicit operator statement of absence plus direct observation of the valve states and '
      + 'the tags. These are the "positively established absence" cases v12 names as establishing '
      + 'the fact.' } },
},

// ---- RB-I1 — SETTLED_THRESHOLD. §148 non-regression carried forward.
{
  row: row('RB-I1',
    'A second guillotine in the same print room is guarded by a two-hand control. The nearest edge '
    + 'of each button is 1,150 millimetres from the nearest point of the danger zone, measured '
    + 'horizontally along the operator\'s reach path. The machine\'s measured stopping time gives a '
    + 'required safety distance of 620 millimetres on the same reach path and by the same '
    + 'measurement method, recorded on the certificate posted at the machine. Both controls must be '
    + 'held to complete the cut. A single approved governed record covering point-of-operation '
    + 'guarding was supplied with this inspection.',
    ['machine_guarding', 'walking_working_surfaces', 'material_handling_storage', 'noise_exposure'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['machine_guarding', 'walking_working_surfaces',
        'material_handling_storage'],
      forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: ['machine_guarding'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE §148 THRESHOLD NON-REGRESSION CONTROL. Value 1,150 mm, basis "nearest edge of each '
        + 'control to the nearest point of the danger zone along the reach path" named identically '
        + 'by the record and the observation, and side plainly above the 620 mm requirement. Every '
        + 'element v11 requires for a SETTLED reading is present. If this row asks, §148 has '
        + 'regressed under §150.' },
    { governedStandards: [R_GUILLOTINE_TWO_HAND] }),
  domain: 'guillotine two-hand safety distance',
  retentionForm: 'SETTLED_THRESHOLD',
  retention: null,
  hazardEstablished: false,
  unknownIsCandidateShaped: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'is 1,150 millimetres measured the way the supplied record requires, and is the stopping time '
      + 'still valid?',
    whyNotDecisionCritical:
      'the observation states the measurement method in the record\'s own terms — nearest edge of '
      + 'each control to the nearest point of the danger zone, along the reach path — and states '
      + 'that the required distance was derived from the machine\'s measured stopping time by the '
      + 'same method. 1,150 is not close to 620 and there is no competing basis in play.',
    whatMakesItSettled:
      'value = 1,150 mm; basis = nearest edge to nearest danger point along the reach path, named '
      + 'identically by both texts; side = far above the 620 mm requirement derived from the '
      + 'measured stopping time.' } },
},

// ---- RB-J1 — TRUE_DETERMINISTIC_DERIVATION. The REPAIRED US-I1.
//      The conclusion follows with NO added premise, because the energy source is PHYSICALLY ABSENT
//      and the text states there is no other — so there is no reconnection path to secure.
{
  row: row('RB-J1',
    'A technician is working inside the rotor housing of the site\'s only wind-driven roof extractor, '
    + 'replacing a bearing. The extractor is wind-driven and has no motor, no electrical supply and '
    + 'no connection to any powered system; it turns only when the rotor turns. The rotor has been '
    + 'physically removed from the shaft and is on the roof deck three metres away, where I '
    + 'photographed it, and the shaft is bare. There is no other drive of any kind on the unit. Two '
    + 'roofers are working at the same level nearby and the roof edge is protected by a fixed '
    + 'guardrail.',
    ['machine_guarding', 'lockout_tagout', 'fall_protection', 'chemical_release'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['machine_guarding', 'lockout_tagout', 'fall_protection'],
      forbiddenHazardFamilies: ['chemical_release'],
      negatedOrSafeStateFamilies: ['machine_guarding', 'lockout_tagout'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE REPAIRED US-I1, AND THE REPAIR IS THE POINT. §149\'s version claimed that a cable '
        + 'removed at both ends made isolation deterministically derivable; it did not, because '
        + 'reconnection needed only the unstated premise that nobody reconnects it, and the row '
        + 'itself placed a second fitter at the door. HERE THERE IS NOTHING TO RECONNECT. The '
        + 'motive power is WIND acting on a rotor, the rotor is off the shaft and lying three metres '
        + 'away, the text states there is no motor, no supply and no other drive, and the '
        + 'observer photographed it. "The shaft cannot turn" follows from stated facts with NO '
        + 'ADDITIONAL PREMISE -- no lock could add anything, because no reconnection path exists to '
        + 'be secured. The two roofers are the deliberate echo of US-I1\'s second fitter, and they '
        + 'change nothing, because a person cannot restore a drive that is not there.' }),
  domain: 'wind-driven roof extractor',
  retentionForm: 'TRUE_DETERMINISTIC_DERIVATION',
  retention: null,
  hazardEstablished: false,
  unknownIsCandidateShaped: false,
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'has the extractor been locked out and tagged so nobody can start it while the technician is '
      + 'inside the housing?',
    whyNotDecisionCritical:
      'there is nothing to lock. The observation states the unit is wind-driven with no motor, no '
      + 'electrical supply and no other drive of any kind, and that the rotor — the only thing that '
      + 'can turn the shaft — has been physically removed and is lying three metres away and was '
      + 'photographed there. A lock secures a reconnection path; here no reconnection path exists, '
      + 'and nearby workers cannot restore a drive the unit does not have.',
    whatMakesItSettled:
      'deterministic derivation from stated facts with NO added premise: the sole motive element is '
      + 'physically absent and its location is stated, and the text states positively that no other '
      + 'drive exists. Unlike §149\'s US-I1, no premise about anyone\'s future conduct is required.' } },
},

];

export const RETENTION_BRIDGE_ROWS: readonly FormalCohortRow[] =
  RETENTION_BRIDGE_FIXTURES.map(f => f.row);

export function retentionFixtureByRowId(
  rowId: string,
): RetentionBridgeFixture | undefined {
  return RETENTION_BRIDGE_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * Frozen budget, transcribed from the §150 authorization BEFORE the probe runs.
 *
 * "Maximum: 10 provider requests; $1.50 total spend; no retries except objective transport failure
 * inside the same cap." Ten calls against a ten-request ceiling leaves NO headroom, so the retry
 * budget is ZERO and a retry is refused rather than exceeding the cap.
 */
export const RETENTION_BRIDGE_BUDGET = {
  targetLogicalCalls: 10,
  hardLogicalCallCeiling: 10,
  hardProviderRequestCeiling: 10,
  hardSpendCeilingUsd: 1.50,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 0,
} as const;

/**
 * Frozen §150 hosted decision gates, transcribed from the authorization before the probe runs.
 *
 * `retainedButNotAsked` is a FIRST-CLASS diagnostic here for the first time: a case where Expert
 * demonstrably holds a decision-critical uncertainty open and no clarification carries it. Zero is
 * required.
 *
 * There is deliberately NO numeric true-contradiction target. §150 Phase 6 settles the semantics:
 * the deterministic proof is REQUIRED and the hosted denominator is OBSERVATIONAL. A zero
 * denominator is NOT_EXERCISED, is not a failure, and is never reported as 100%.
 */
export const RETENTION_BRIDGE_GATES = {
  /** STRICT and DELIVERED. Reasoned-but-destroyed is reported separately, never as recall. */
  strictRequiredRecall: 1.0,
  /** Decision-critical uncertainty retained by Expert with no clarification reaching output. */
  maxRetainedButNotAsked: 0,
  maxForbiddenViolations: 0,
  maxUnsupportedSettlements: 0,
  affectedDecisionSurvival: 1.0,
  maxAcceptedInvalidLinkages: 0,
  rawLinkageReconciliationRequired: true,
  trueContradictionDeterministicProofRequired: true,
  hostedTrueContradictionIsObservational: true,
  maxInvalidClarificationObjects: 0,
  maxCitationContainmentViolations: 0,
  maxProtectedAuthorityContradictions: 0,
} as const;
