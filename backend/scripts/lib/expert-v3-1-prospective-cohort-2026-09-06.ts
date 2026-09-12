/**
 * §192 -- FRESH PROSPECTIVE COHORT FOR VERIFIER-v3.1. DEVELOPMENT ONLY.
 *
 * ==================== WHAT IS FRESH, AND WHAT THAT BUYS ====================
 *
 * Thirteen new observations, thirteen new owed facts, thirteen new first-pass clarification sets.
 * NOTHING is reused from §187: not a row text, not an owed fact, not a question, not a hazard
 * scenario. The §187 stimuli are spent and are not re-run.
 *
 * ==================== THE FIRST-PASS SETS ARE AUTHORED, NOT GENERATED ====================
 *
 * §187A generated its stimuli with a real first-pass Expert execution, and paid for a
 * FIRST_PASS_STIMULUS_CONFOUND it then had to classify. §192 AUTHORS the first-pass clarification
 * set for each row instead, and this is a deliberate design choice with a cost and a benefit:
 *
 *   BENEFIT  the cohort can GUARANTEE its behaviour families. A validation that needs six rows
 *            where the first pass asked nothing, three where it asked a sufficient question and
 *            two where it asked a question reaching only some conjuncts cannot get them by asking
 *            a model and hoping. The confound disappears entirely.
 *   COST     this validates THE VERIFIER IN ISOLATION, not the end-to-end pipeline. It says nothing
 *            about whether the first pass would produce these questions. That is a separate
 *            question and §192 does not answer it.
 *
 * Recorded here rather than discovered later.
 *
 * ==================== TWO ROWS DELIBERATELY CARRY A FACT THAT SHOULD BE CHALLENGED ====================
 *
 * FV-12 and FV-13 supply an owed fact the observation does NOT leave genuinely open: FV-12's is
 * already settled by the text, and FV-13's is a magnitude question whose governing control is stated
 * present. They exist to exercise CHALLENGE_FACT_VALIDITY, which §187 sampled at n=1. Their
 * `whyUnresolved` text is the raising as a first pass would have written it, and the observation
 * contradicts it. That is the instrument, and it is disclosed rather than hidden.
 *
 * Every `evidenceSpan` is a VERBATIM span of its observation.
 */

import type { V3SuppliedOwedFact } from './expert-verifier-instruction-v3-1';

export const PROSPECTIVE_COHORT_VERSION = 'hazlenz.expert.v3-1.prospective-cohort.2026-09-06' as const;

/** What the row is built to exercise. Preregistered; never edited after the first provider call. */
export const BEHAVIOR_FAMILIES = [
  'EXISTING_SUFFICIENT_QUESTION',
  'EXISTING_INSUFFICIENT_CONJUNCTIVE_QUESTION',
  'NO_EXISTING_QUESTION_REQUIRED_FACT',
  'ADJACENT_PROPERTY_TRAP',
  'FULLY_ESTABLISHED_CONTROL',
  'OBSTRUCTED_UNVERIFIABLE_CONTROL',
  'CHALLENGE_FACT_VALIDITY_OPPORTUNITY',
] as const;
export type BehaviorFamily = (typeof BEHAVIOR_FAMILIES)[number];

export interface ProspectiveRow {
  readonly rowId: string;
  readonly observation: string;
  readonly owedFact: V3SuppliedOwedFact;
  /** The authored first-pass clarification set. Empty array = the first pass asked nothing. */
  readonly firstPassClarifications: ReadonlyArray<{ affectedDecision: string; question: string }>;
  readonly families: readonly BehaviorFamily[];
  /** Coarse property family, used to prove clarification opportunities span several of them. */
  readonly owedPropertyFamily: string;
  /** The separate things the owed fact requires. One entry = not conjunctive. */
  readonly conjuncts: readonly string[];
  /** True when the first pass asked nothing AND a genuine REQUIRED gap exists. */
  readonly unconditionalProposalOpportunity: boolean;
  /** True when challenging the supplied fact is a defensible outcome. */
  readonly challengeOpportunity: boolean;
  /** Preregistered design intent. NOT a scorer input; the semantic review is separate. */
  readonly designIntent: string;
}

const req = 'REQUIRED_CONTROL';

export const PROSPECTIVE_COHORT: readonly ProspectiveRow[] = [
  // ---------------------------------------------- 1-3  regression: an already-sufficient question
  {
    rowId: 'FV-01',
    observation: 'A vertical baler stands in the recycling bay. The ram guard door carries a '
      + 'captive-key interlock and the door is closed. After Thursday\'s ram seal replacement the '
      + 'fitter signed the plant back on line; the sheet records the seal change but carries no '
      + 'interlock test result. The bay floor is swept.',
    owedFact: {
      factKey: 'owed:guarding:baler_door_interlock_protective_function_verified',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state the interlock\'s protective behaviour after '
        + 'the seal replacement',
      branchA: 'established: the ram guard door interlock\'s protective function was verified after '
        + 'the seal replacement and before the baler was returned to service',
      branchB: 'not established: the ram guard door interlock\'s protective function was verified '
        + 'after the seal replacement and before the baler was returned to service',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the ram guard door '
          + 'interlock\'s protective function',
        ifB: 'the baler must be taken out of service until the ram guard door interlock\'s '
          + 'protective function is verified',
      },
      evidenceSpan: 'the sheet records the seal change but carries no interlock test result',
    },
    firstPassClarifications: [{ affectedDecision: req,
      question: 'Was the ram guard door interlock functionally tested — confirmed to stop the ram '
        + 'when the door is opened — after the seal replacement and before the baler was put back '
        + 'on line?' }],
    families: ['EXISTING_SUFFICIENT_QUESTION'],
    owedPropertyFamily: 'guarding_protective_function',
    conjuncts: ['the interlock\'s protective function was verified after the seal replacement and '
      + 'before return to service'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: false,
    designIntent: 'The existing question names the function, excludes mere presence, and carries '
      + 'the temporal bound. v3.1 should rely on it, keep the fact unresolved, and not replace it.',
  },
  {
    rowId: 'FV-02',
    observation: 'A fitter is about to break a flanged joint on a steam header in the boiler house. '
      + 'The boiler is off and the header isolation valve is padlocked shut; a second fitter '
      + 'witnessed the isolation. He opened the header drain and left it open, and the header '
      + 'pressure gauge sits behind the lagging and has not been read since. The walkway grating is '
      + 'secure.',
    owedFact: {
      factKey: 'owed:energy:steam_header_residual_pressure_confirmed_zero_before_joint_break',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state the header\'s current pressure',
      branchA: 'established: the residual pressure in the steam header has been released and '
        + 'confirmed at zero before the flanged joint is broken',
      branchB: 'not established: the residual pressure in the steam header has been released and '
        + 'confirmed at zero before the flanged joint is broken',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about residual pressure '
          + 'in the steam header',
        ifB: 'the flanged joint must not be broken until the header is confirmed at zero',
      },
      evidenceSpan: 'the header pressure gauge sits behind the lagging and has not been read since',
    },
    firstPassClarifications: [{ affectedDecision: req,
      question: 'Has the header pressure been read at the gauge and confirmed at zero before the '
        + 'joint is broken, rather than relying on the drain having been opened?' }],
    families: ['EXISTING_SUFFICIENT_QUESTION'],
    owedPropertyFamily: 'stored_energy_pressure',
    conjuncts: ['the residual pressure has been released and confirmed at zero before the joint is '
      + 'broken'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: false,
    designIntent: 'The existing question names the confirmation act and excludes the adjacent '
      + 'evidence (the drain having been opened) by name. v3.1 should rely on it.',
  },
  {
    rowId: 'FV-03',
    observation: 'A gas-fired paint oven runs on the finishing line. The over-temperature cut-out '
      + 'sits inside the control cabinet and cannot be seen from the floor. At the annual service '
      + 'the engineer filed a certificate listing a thermocouple change and a fan-belt swap; it '
      + 'records no over-temperature trip test. Dust has settled on the cabinet top.',
    owedFact: {
      factKey: 'owed:fire:oven_over_temperature_cutout_function_verified',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the over-temperature cut-out was '
        + 'trip-tested',
      branchA: 'established: the over-temperature cut-out has been verified to shut off the gas '
        + 'when the setpoint is exceeded',
      branchB: 'not established: the over-temperature cut-out has been verified to shut off the gas '
        + 'when the setpoint is exceeded',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the '
          + 'over-temperature cut-out\'s protective function',
        ifB: 'the oven must be shut down until the over-temperature cut-out\'s protective function '
          + 'is verified',
      },
      evidenceSpan: 'it records no over-temperature trip test',
    },
    firstPassClarifications: [{ affectedDecision: req,
      question: 'Was the over-temperature cut-out trip-tested at the annual service — confirmed to '
        + 'shut off the gas when the setpoint is exceeded — even though the certificate does not '
        + 'record it?' }],
    families: ['EXISTING_SUFFICIENT_QUESTION', 'OBSTRUCTED_UNVERIFIABLE_CONTROL'],
    owedPropertyFamily: 'fire_thermal_protective_function',
    conjuncts: ['the cut-out has been verified to shut off the gas when the setpoint is exceeded'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: false,
    designIntent: 'An unobservable control with a sufficient existing question. Tests that the new '
      + 'adjacent-property boundary does not disturb the unseen-control heuristic that already '
      + 'works.',
  },

  // ---------------------------------------------- 4-5  conjunctive insufficiency
  {
    rowId: 'FV-04',
    observation: 'A fitter is about to change a damaged belt scraper at the tail drum of a quarry '
      + 'conveyor. He has locked the drive isolator with his own padlock. The belt runs over a '
      + 'gravity take-up tower that holds tension on the belt when the drive is off, and the '
      + 'take-up release log carries no entry for today. The tail drum guard has been set aside.',
    owedFact: {
      factKey: 'owed:energy:conveyor_drive_isolated_and_take_up_tension_released',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the gravity take-up tension has been '
        + 'released and confirmed at zero',
      branchA: 'established: the conveyor drive is isolated AND the gravity take-up tension has '
        + 'been released and confirmed at zero before work at the tail drum',
      branchB: 'not established: the conveyor drive is isolated AND the gravity take-up tension has '
        + 'been released and confirmed at zero before work at the tail drum',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about drive isolation and '
          + 'stored take-up tension at the tail drum',
        ifB: 'work at the tail drum must not start until the drive is isolated and the take-up '
          + 'tension is released and confirmed at zero',
      },
      evidenceSpan: 'the take-up release log carries no entry for today',
    },
    firstPassClarifications: [{ affectedDecision: req,
      question: 'Was the conveyor drive isolator locked off before work started at the tail drum?' }],
    families: ['EXISTING_INSUFFICIENT_CONJUNCTIVE_QUESTION'],
    owedPropertyFamily: 'energy_isolation_and_stored_energy',
    conjuncts: ['the conveyor drive is isolated',
      'the gravity take-up tension is released and confirmed at zero'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: false,
    designIntent: 'A AND B, and the existing question reaches only A. A truthful yes is available '
      + 'to someone who locked the isolator and never touched the take-up. v3.1 should find the '
      + 'question insufficient and supply or request what actually establishes the second conjunct.',
  },
  {
    rowId: 'FV-05',
    observation: 'An operator is opening a cartridge filter on a chemical dosing skid. The upstream '
      + 'supply valve is closed and padlocked and a tag hangs from it. The line flush record for '
      + 'this morning is signed. The skid\'s local pressure indicator sits behind the frame and has '
      + 'not been read. A drip tray is in place under the housing.',
    owedFact: {
      factKey: 'owed:chemical:dosing_line_isolated_flushed_and_confirmed_zero_pressure',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state the line\'s current pressure',
      branchA: 'established: the dosing line is isolated AND flushed AND confirmed at zero pressure '
        + 'before the filter housing is opened',
      branchB: 'not established: the dosing line is isolated AND flushed AND confirmed at zero '
        + 'pressure before the filter housing is opened',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the dosing line\'s '
          + 'state before the filter housing is opened',
        ifB: 'the filter housing must not be opened until the line is confirmed at zero pressure as '
          + 'well as isolated and flushed',
      },
      evidenceSpan: 'The skid\'s local pressure indicator sits behind the frame and has not been read',
    },
    firstPassClarifications: [{ affectedDecision: req,
      question: 'Was the upstream supply valve locked closed and the line flushed before the filter '
        + 'housing was opened?' }],
    families: ['EXISTING_INSUFFICIENT_CONJUNCTIVE_QUESTION'],
    owedPropertyFamily: 'chemical_line_isolation',
    conjuncts: ['the dosing line is isolated', 'the dosing line is flushed',
      'the dosing line is confirmed at zero pressure'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: false,
    designIntent: 'A AND B AND C, and the existing question reaches A and B. The harder case: two '
      + 'of three conjuncts covered, so a verifier reading topic-level would call it sufficient.',
  },

  // ---------------------------------------------- 6-11  unconditional proposal opportunities
  {
    rowId: 'FV-06',
    observation: 'Two sprayers are working inside a spray booth on the paint line. The booth\'s '
      + 'low-airflow alarm panel shows a green lamp at the door. The alarm\'s trip point was set at '
      + 'commissioning three years ago, and this year\'s verification sheet for the alarm has not '
      + 'been completed. The booth doors close on their own.',
    owedFact: {
      factKey: 'owed:detection:booth_low_airflow_alarm_trip_function_currently_operable',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the low-airflow alarm will actually '
        + 'trip at its set point',
      branchA: 'established: the booth\'s low-airflow alarm has been verified to trip at its set '
        + 'point and is currently operable',
      branchB: 'not established: the booth\'s low-airflow alarm has been verified to trip at its '
        + 'set point and is currently operable',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the low-airflow '
          + 'alarm\'s trip function',
        ifB: 'spraying must stop until the low-airflow alarm\'s trip function is verified',
      },
      evidenceSpan: 'this year\'s verification sheet for the alarm has not been completed',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'OBSTRUCTED_UNVERIFIABLE_CONTROL',
      'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'detection_alarm_function',
    conjuncts: ['the low-airflow alarm has been verified to trip at its set point and is currently '
      + 'operable'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'A green lamp shows the panel is powered, not that the alarm will trip. Nothing '
      + 'was asked. v3.1 should propose a question reaching the trip function.',
  },
  {
    rowId: 'FV-07',
    observation: 'A pedestal grinder stands in the fitting shop and a fitter is dressing a bracket '
      + 'on it. The wheel guard is bolted on and the work rest is in place. This morning\'s shop '
      + 'checklist is initialled; it covers housekeeping and lighting. The work rest gap was last '
      + 'set at the wheel change six weeks ago. No tools lie on the machine.',
    owedFact: {
      factKey: 'owed:guarding:grinder_work_rest_gap_currently_within_safe_clearance',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state the current gap between the work rest and the '
        + 'wheel',
      branchA: 'established: the work rest gap is currently set within the safe clearance for the '
        + 'wheel in use',
      branchB: 'not established: the work rest gap is currently set within the safe clearance for '
        + 'the wheel in use',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the current work '
          + 'rest gap',
        ifB: 'the grinder must be taken out of use until the work rest gap is confirmed within the '
          + 'safe clearance',
      },
      evidenceSpan: 'The work rest gap was last set at the wheel change six weeks ago',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'guarding_clearance',
    conjuncts: ['the work rest gap is currently within the safe clearance for the wheel in use'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'The strongest adjacent trap in the cohort: guard bolted on, rest "in place", a '
      + 'signed checklist covering OTHER items, no tools, and a historical setting. None of them is '
      + 'the current gap. Structurally analogous to HR-04 without reusing its wording.',
  },
  {
    rowId: 'FV-08',
    observation: 'A contractor is working near the south edge of a flat roof plant area, where '
      + 'there is no permanent guardrail. He is clipped to a temporary line rigged to a roof '
      + 'anchor. The anchor carries an ID tag. The roof access log is signed for today, and the '
      + 'permanent guardrail along the north edge was inspected at the annual survey. The anchor\'s '
      + 'load-test record is held in the site office.',
    owedFact: {
      factKey: 'owed:fall:temporary_line_anchor_current_load_test_valid',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state when the anchor was last load-tested or '
        + 'whether that test is current',
      branchA: 'established: the roof anchor carrying the temporary line has a current valid load '
        + 'test',
      branchB: 'not established: the roof anchor carrying the temporary line has a current valid '
        + 'load test',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the anchor\'s load '
          + 'test',
        ifB: 'work at the south edge must stop until the anchor\'s load test is confirmed current',
      },
      evidenceSpan: 'The anchor\'s load-test record is held in the site office',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'fall_anchor_integrity',
    conjuncts: ['the anchor has a current valid load test'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'An ID tag is identification, not testing; the signed access log and the '
      + 'inspected guardrail belong to a DIFFERENT edge and a different control. The trap is that '
      + 'the row reads well-managed.',
  },
  {
    rowId: 'FV-09',
    observation: 'A fitter is clearing a jam inside the shrink-wrap tunnel on a packaging line. He '
      + 'has locked off the line\'s main control panel, applied his own lock and proved that panel '
      + 'dead. The tunnel\'s heater bank is fed from a separate distribution board on the far wall, '
      + 'and the log at that board carries no entry for today. The line\'s guard doors are open.',
    owedFact: {
      factKey: 'owed:energy:shrink_tunnel_heater_supply_isolated_before_work',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the heater bank\'s own supply has been '
        + 'isolated',
      branchA: 'established: the shrink tunnel heater bank\'s separate supply has been isolated '
        + 'before work inside the tunnel',
      branchB: 'not established: the shrink tunnel heater bank\'s separate supply has been isolated '
        + 'before work inside the tunnel',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the heater bank\'s '
          + 'separate supply',
        ifB: 'work inside the tunnel must stop until the heater bank\'s separate supply is isolated',
      },
      evidenceSpan: 'the log at that board carries no entry for today',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'energy_separate_source',
    conjuncts: ['the heater bank\'s separate supply has been isolated before work inside the tunnel'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'Related-control trap: a thorough, correct isolation of the MAIN panel, and a '
      + 'separate source untouched. Tests "a control on one source says nothing about a separate '
      + 'one" as a proposal opportunity rather than as a sufficiency question.',
  },
  {
    rowId: 'FV-10',
    observation: 'A welder works at a bench with a movable local exhaust ventilation hood. The '
      + 'thorough examination report for the LEV system is on the wall and is in date; it covers '
      + 'the fan and the ductwork. The hood at this bench has been repositioned since that '
      + 'examination, and no capture check has been recorded at the new position. The bench is '
      + 'tidy.',
    owedFact: {
      factKey: 'owed:ventilation:lev_hood_capture_effective_at_current_position',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the hood captures fume effectively at '
        + 'its current position',
      branchA: 'established: the LEV hood captures welding fume effectively at its current position',
      branchB: 'not established: the LEV hood captures welding fume effectively at its current '
        + 'position',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about capture at the '
          + 'hood\'s current position',
        ifB: 'welding at this bench must stop until the hood\'s capture is confirmed effective at '
          + 'its current position',
      },
      evidenceSpan: 'no capture check has been recorded at the new position',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'ventilation_capture',
    conjuncts: ['the hood captures fume effectively at its current position'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'An in-date examination whose STATED SCOPE is the fan and the ductwork, and an '
      + 'owed property outside that scope. Tests "an inspection settles only what it is stated to '
      + 'cover".',
  },
  {
    rowId: 'FV-11',
    observation: 'A workshop air receiver supplies the shop ring main and the compressor runs on '
      + 'load. The written scheme examination certificate is on the wall and is in date. An '
      + 'automatic drain was fitted at the last examination. The receiver\'s safety valve was '
      + 'function-tested at that examination two years ago and there is no later test record.',
    owedFact: {
      factKey: 'owed:pressure:receiver_safety_valve_currently_lifts_at_set_pressure',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state whether the safety valve currently lifts at '
        + 'its set pressure',
      branchA: 'established: the receiver\'s safety valve currently lifts at its set pressure',
      branchB: 'not established: the receiver\'s safety valve currently lifts at its set pressure',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the safety valve\'s '
          + 'current lifting pressure',
        ifB: 'the receiver must be taken off load until the safety valve is confirmed to lift at '
          + 'its set pressure',
      },
      evidenceSpan: 'there is no later test record',
    },
    firstPassClarifications: [],
    families: ['NO_EXISTING_QUESTION_REQUIRED_FACT', 'ADJACENT_PROPERTY_TRAP'],
    owedPropertyFamily: 'pressure_relief_function',
    conjuncts: ['the safety valve currently lifts at its set pressure'],
    unconditionalProposalOpportunity: true,
    challengeOpportunity: false,
    designIntent: 'Historical-versus-current trap, wrapped in an in-date certificate. A test two '
      + 'years ago is evidence about then. Tests "a check made at some earlier time tells you about '
      + 'then, not about now".',
  },

  // ---------------------------------------------- 12-13  challenge opportunities
  {
    rowId: 'FV-12',
    observation: 'Before the annual internal inspection of a workshop air receiver the fitter '
      + 'isolated the compressor and locked the isolator with his own lock. He opened the manual '
      + 'blowdown, watched the receiver gauge fall to zero and remain there for two minutes, and a '
      + 'second fitter witnessed the gauge reading zero. The inspection hatch is still bolted.',
    owedFact: {
      factKey: 'owed:pressure:receiver_vented_and_confirmed_zero_before_hatch_opened',
      affectedDecision: req,
      whyUnresolved: 'no confirmation of the receiver\'s pressure state was recorded',
      branchA: 'established: the receiver has been vented and confirmed at zero before the '
        + 'inspection hatch is opened',
      branchB: 'not established: the receiver has been vented and confirmed at zero before the '
        + 'inspection hatch is opened',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about the receiver\'s '
          + 'pressure',
        ifB: 'the inspection hatch must not be opened until the receiver is confirmed at zero',
      },
      evidenceSpan: 'watched the receiver gauge fall to zero and remain there for two minutes',
    },
    firstPassClarifications: [],
    families: ['FULLY_ESTABLISHED_CONTROL', 'CHALLENGE_FACT_VALIDITY_OPPORTUNITY'],
    owedPropertyFamily: 'pressure_stored_energy',
    conjuncts: ['the receiver has been vented and confirmed at zero before the hatch is opened'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: true,
    designIntent: 'The observation SETTLES the supplied fact: gauge watched to zero, held two '
      + 'minutes, witnessed. The supplied whyUnresolved is the raising as a first pass would have '
      + 'written it, and the text contradicts it. v3.1 should not invent a gap; challenging the '
      + 'fact as already settled is the defensible outcome.',
  },
  {
    rowId: 'FV-13',
    observation: 'A forklift operates in a warehouse aisle. Pedestrian walkways are marked on both '
      + 'sides and a physical barrier separates the walkway from the aisle for its full length. A '
      + 'banksman stands at the aisle entrance. The truck\'s amber beacon is working. The floor was '
      + 'swept at the start of shift.',
    owedFact: {
      factKey: 'owed:traffic:pedestrian_crossing_frequency_in_the_aisle',
      affectedDecision: req,
      whyUnresolved: 'the observation does not state how often pedestrians cross the aisle during a '
        + 'shift',
      branchA: 'established: the number of pedestrian crossings of the aisle per shift is known',
      branchB: 'not established: the number of pedestrian crossings of the aisle per shift is known',
      decisionDivergence: {
        ifA: 'no additional control is required on account of uncertainty about pedestrian crossing '
          + 'frequency',
        ifB: 'additional segregation must be installed until the pedestrian crossing frequency is '
          + 'known',
      },
      evidenceSpan: 'a physical barrier separates the walkway from the aisle for its full length',
    },
    firstPassClarifications: [],
    families: ['CHALLENGE_FACT_VALIDITY_OPPORTUNITY'],
    owedPropertyFamily: 'workplace_transport_segregation',
    conjuncts: ['the pedestrian crossing frequency is known'],
    unconditionalProposalOpportunity: false,
    challengeOpportunity: true,
    designIntent: 'A MAGNITUDE question whose governing control — full-length physical segregation '
      + 'plus a banksman — is stated present, so both answers lead to the same thing being done '
      + 'today. Challenging the fact, or declining a clarification, is defensible; inventing a '
      + 'stop-work gap is not.',
  },
];

// ------------------------------------------------------------------ self-checks, before any spend

/** Every evidenceSpan must be a verbatim span of its own observation. */
export function verifyEvidenceSpansVerbatim(): string[] {
  return PROSPECTIVE_COHORT
    .filter(r => !r.observation.includes(r.owedFact.evidenceSpan ?? ''))
    .map(r => r.rowId);
}

export const COHORT_COVERAGE = {
  rows: PROSPECTIVE_COHORT.length,
  unconditionalProposalOpportunities:
    PROSPECTIVE_COHORT.filter(r => r.unconditionalProposalOpportunity).length,
  opportunityPropertyFamilies: [...new Set(PROSPECTIVE_COHORT
    .filter(r => r.unconditionalProposalOpportunity).map(r => r.owedPropertyFamily))],
  challengeOpportunities: PROSPECTIVE_COHORT.filter(r => r.challengeOpportunity).length,
  regressionRows: PROSPECTIVE_COHORT
    .filter(r => r.families.includes('EXISTING_SUFFICIENT_QUESTION')).length,
  conjunctiveRows: PROSPECTIVE_COHORT.filter(r => r.conjuncts.length > 1)
    .map(r => ({ rowId: r.rowId, conjuncts: r.conjuncts.length })),
  familiesCovered: [...new Set(PROSPECTIVE_COHORT.flatMap(r => r.families))].sort(),
} as const;
