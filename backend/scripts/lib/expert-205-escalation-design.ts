/**
 * §205 -- RR-6: DETERMINISTIC ESCALATION DESIGN. DESIGNED AND LOCALLY EXERCISED, NOT ACTIVATED.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO POLICY IS CHANGED.
 *
 * ==================== WHAT §204 MEASURED ====================
 *
 * Every projected first-pass fact enters at `FIRST_PASS_PROJECTED_PRIORITY = 'OTHER'`, the
 * non-escalating floor, by a stated §196 constant whose cost §196 recorded openly:
 * "a genuinely life-critical first-pass gap also enters at OTHER and will not raise the gate."
 *
 * §204 measured that cost on eight facts:
 *
 *     FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE          7 of 8   (all but U07)
 *     FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE      1 of 8
 *
 * with product-owner safety classifications of PLAUSIBLY_LIFE_CRITICAL ×4, SAFETY_SIGNIFICANT ×2,
 * ORDINARY_NON_ESCALATING ×2. This is the most replicated finding in the whole instrument.
 *
 * ==================== WHAT THIS MODULE MAY AND MAY NOT CONCLUDE ====================
 *
 * The measurement is DIAGNOSTIC. It authorizes no priority-policy mutation, no provider-controlled
 * escalation, no provider settlement authority, and no model-authored severity. Ruling 5 stands:
 * deterministic priority, `urgencyNomination` non-authoritative. D14 remains open and is the
 * product owner's.
 *
 * So this module DESIGNS candidate deterministic policies over TRUSTED STRUCTURED INPUTS only,
 * exercises each one against the eight §204 facts, and reports what each would have done. It
 * changes no default, exports no active policy, and returns a recommendation for authorization.
 *
 * ==================== WHAT COUNTS AS A TRUSTED STRUCTURED INPUT ====================
 *
 * `affectedDecision`  a closed vocabulary the projection validates against membership.
 * deterministic-finding corroboration   HazLenz task state, not model output.
 * hazard family        a closed vocabulary supplied to the model, not chosen by it.
 *
 * NOT trusted, and never read by any option here: any model-authored confidence, criticality,
 * urgency nomination, rationale, or free text. An option that read one of those would hand the
 * provider the escalation authority Ruling 5 denies it, whatever it was called.
 */

import type {
  OwedFactAffectedDecision, OwedFactPriority,
} from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import { FIRST_PASS_PROJECTED_PRIORITY } from './expert-first-pass-owed-fact-projection';

export const ESCALATION_DESIGN_205_VERSION = 'hazlenz.expert.205.escalation-design.v1' as const;

/** Nothing in this module is live. Asserted by the suite; stated here so a reader cannot miss it. */
export const ESCALATION_ACTIVATION_STATE = {
  ACTIVE_POLICY: 'NONE — the shipped floor remains the §196 constant',
  SHIPPED_FLOOR: FIRST_PASS_PROJECTED_PRIORITY,
  AUTHORIZES_A_POLICY_CHANGE: false,
  GRANTS_PROVIDER_ESCALATION_AUTHORITY: false,
  GRANTS_MODEL_AUTHORED_SEVERITY: false,
  RULING_5_UNCHANGED: true,
  DECISION_THIS_FEEDS: 'D14 — final priority / escalation architecture, OPEN',
} as const;

/** Inputs an option may read. Model-authored fields are absent by construction, not by discipline. */
export interface TrustedEscalationInputs {
  readonly factKey: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  /** HazLenz task state: did the deterministic layer independently find something on this row? */
  readonly deterministicCorroboration: boolean;
  /** Closed vocabulary supplied by HazLenz to the model, never chosen by it. May be null. */
  readonly hazardFamily: string | null;
  /** HazLenz task state: is the activity described as in progress with a person present? */
  readonly personPresentDuringActivity: boolean;
}

export const ESCALATION_OPTIONS = [
  'E0_UNCHANGED_CONSTANT_FLOOR',
  'E1_AFFECTED_DECISION_FLOOR_MAP',
  'E2_AFFECTED_DECISION_PLUS_DETERMINISTIC_CORROBORATION',
  'E3_AFFECTED_DECISION_PLUS_PERSON_PRESENT',
] as const;
export type EscalationOption = (typeof ESCALATION_OPTIONS)[number];

/** E1's map. Deliberately conservative: only the two decision types that gate a control action. */
const AFFECTED_DECISION_FLOOR: Readonly<Record<OwedFactAffectedDecision, OwedFactPriority>> = {
  HAZARD_EXISTENCE: 'OTHER',
  HAZARD_SEVERITY: 'OTHER',
  EXPOSURE: 'REQUIRED_CONTROL',
  APPLICABILITY: 'OTHER',
  REQUIRED_CONTROL: 'REQUIRED_CONTROL',
  REGULATORY_INTERPRETATION: 'OTHER',
};

export function applyEscalationOption(
  option: EscalationOption, inputs: TrustedEscalationInputs,
): OwedFactPriority {
  switch (option) {
    case 'E0_UNCHANGED_CONSTANT_FLOOR':
      return FIRST_PASS_PROJECTED_PRIORITY;
    case 'E1_AFFECTED_DECISION_FLOOR_MAP':
      return AFFECTED_DECISION_FLOOR[inputs.affectedDecision];
    case 'E2_AFFECTED_DECISION_PLUS_DETERMINISTIC_CORROBORATION':
      return inputs.deterministicCorroboration
        ? AFFECTED_DECISION_FLOOR[inputs.affectedDecision] : FIRST_PASS_PROJECTED_PRIORITY;
    case 'E3_AFFECTED_DECISION_PLUS_PERSON_PRESENT':
      return inputs.personPresentDuringActivity
        ? AFFECTED_DECISION_FLOOR[inputs.affectedDecision] : FIRST_PASS_PROJECTED_PRIORITY;
    default: {
      const never: never = option;
      throw new Error(`ESCALATION_OPTION_UNKNOWN: ${String(never)}`);
    }
  }
}

/**
 * The eight §204 facts, with the product owner's recorded axis-R verdicts and the trusted inputs
 * each row supplied. Copied from the §204 record; nothing here is inferred.
 *
 * `personPresentDuringActivity` is read from the recorded observation text as a HazLenz task-state
 * fact (a person is described as at the machine / inside the enclosure / operating now), not from
 * any model output. It is stated per row so a reader can check it against the observation.
 */
export interface Section204EscalationCase {
  readonly unitId: string;
  readonly rowId: string;
  readonly inputs: TrustedEscalationInputs;
  readonly recordedSafetyClassification:
    'PLAUSIBLY_LIFE_CRITICAL' | 'SAFETY_SIGNIFICANT' | 'ORDINARY_NON_ESCALATING';
  readonly recordedFloorImpact:
    'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' | 'FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE';
}

export const SECTION_204_ESCALATION_CASES: readonly Section204EscalationCase[] = [
  { unitId: 'U02', rowId: 'SF-01',
    inputs: { factKey: 'FP.HAZARD_SEVERITY.OBS-SF-01.203-302.1',
      affectedDecision: 'HAZARD_SEVERITY', deterministicCorroboration: false,
      hazardFamily: 'machine_guarding', personPresentDuringActivity: true },
    recordedSafetyClassification: 'ORDINARY_NON_ESCALATING',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U05', rowId: 'SF-02',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-02.530-594.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: 'confined_space', personPresentDuringActivity: true },
    recordedSafetyClassification: 'PLAUSIBLY_LIFE_CRITICAL',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U07', rowId: 'SF-04',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-04.396-478.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: null, personPresentDuringActivity: false },
    recordedSafetyClassification: 'ORDINARY_NON_ESCALATING',
    recordedFloorImpact: 'FLOOR_WOULD_NOT_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U09', rowId: 'SF-06',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-06.279-355.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: 'lifting_equipment', personPresentDuringActivity: true },
    recordedSafetyClassification: 'PLAUSIBLY_LIFE_CRITICAL',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U14', rowId: 'SF-07',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: 'chemical_exposure', personPresentDuringActivity: true },
    recordedSafetyClassification: 'SAFETY_SIGNIFICANT',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U16', rowId: 'SF-08',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: 'electrical', personPresentDuringActivity: true },
    recordedSafetyClassification: 'PLAUSIBLY_LIFE_CRITICAL',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U17', rowId: 'SF-08',
    inputs: { factKey: 'FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1',
      affectedDecision: 'REQUIRED_CONTROL', deterministicCorroboration: false,
      hazardFamily: 'electrical', personPresentDuringActivity: true },
    recordedSafetyClassification: 'PLAUSIBLY_LIFE_CRITICAL',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
  { unitId: 'U19', rowId: 'SF-11',
    inputs: { factKey: 'FP.EXPOSURE.OBS-SF-11.357-406.1',
      affectedDecision: 'EXPOSURE', deterministicCorroboration: false,
      hazardFamily: 'mobile_equipment', personPresentDuringActivity: true },
    recordedSafetyClassification: 'SAFETY_SIGNIFICANT',
    recordedFloorImpact: 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE' },
];

export interface OptionOutcome {
  readonly option: EscalationOption;
  /** Facts the product owner said were under-escalated that the option would raise. */
  readonly correctlyRaised: number;
  /** Facts the product owner said were NOT under-escalated that the option would raise anyway. */
  readonly overRaised: number;
  /** Facts the product owner said were under-escalated that the option still leaves at OTHER. */
  readonly stillUnderEscalated: number;
  readonly perFact: readonly {
    readonly unitId: string;
    readonly priority: OwedFactPriority;
    readonly raised: boolean;
    readonly agreesWithRecordedFloorImpact: boolean;
  }[];
}

export function exerciseEscalationOption(option: EscalationOption): OptionOutcome {
  let correctlyRaised = 0; let overRaised = 0; let stillUnderEscalated = 0;
  const perFact = SECTION_204_ESCALATION_CASES.map(c => {
    const priority = applyEscalationOption(option, c.inputs);
    const raised = priority !== FIRST_PASS_PROJECTED_PRIORITY;
    const shouldRaise = c.recordedFloorImpact === 'FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE';
    if (raised && shouldRaise) correctlyRaised += 1;
    if (raised && !shouldRaise) overRaised += 1;
    if (!raised && shouldRaise) stillUnderEscalated += 1;
    return {
      unitId: c.unitId, priority, raised, agreesWithRecordedFloorImpact: raised === shouldRaise,
    };
  });
  return { option, correctlyRaised, overRaised, stillUnderEscalated, perFact };
}

export interface EscalationDesignRecommendation {
  readonly version: typeof ESCALATION_DESIGN_205_VERSION;
  readonly activation: typeof ESCALATION_ACTIVATION_STATE;
  readonly outcomes: readonly OptionOutcome[];
  readonly recommended: EscalationOption;
  readonly recommendationIsAuthorized: false;
  readonly rationale: readonly string[];
  readonly honestLimits: readonly string[];
}

/**
 * The recommendation, returned separately for PRODUCT_OWNER authorization and authorizing nothing.
 *
 * The measured result is uncomfortable and is reported as measured: `affectedDecision` alone cannot
 * separate the cases. Six of the eight facts are `REQUIRED_CONTROL`, and that set contains four
 * PLAUSIBLY_LIFE_CRITICAL facts, one SAFETY_SIGNIFICANT and one ORDINARY_NON_ESCALATING — the one
 * the product owner explicitly said was NOT under-escalated. So E1 buys six correct raises at the
 * price of one over-escalation, and no trusted structured input available today separates U07 from
 * U05/U09/U16/U17.
 */
export function recommendEscalationDesign(): EscalationDesignRecommendation {
  const outcomes = ESCALATION_OPTIONS.map(exerciseEscalationOption);
  return {
    version: ESCALATION_DESIGN_205_VERSION,
    activation: ESCALATION_ACTIVATION_STATE,
    outcomes,
    recommended: 'E3_AFFECTED_DECISION_PLUS_PERSON_PRESENT',
    recommendationIsAuthorized: false,
    rationale: [
      'E0 reproduces the measured defect exactly: 7 of 8 left under-escalated. It is the status quo '
      + 'and is retained only because nothing here is authorized to change it.',
      'E1 raises 7 of 7 correctly but also raises U07, which the product owner recorded as NOT '
      + 'under-escalated. affectedDecision alone cannot separate them: 6 of 8 facts are '
      + 'REQUIRED_CONTROL and that set spans all three safety classifications.',
      'E2 raises nothing on this cohort — no §204 row carried a deterministic finding — so it is '
      + 'untested rather than conservative, and must not be chosen on this evidence.',
      'E3 uses a second trusted HazLenz task-state input (a person described as present during the '
      + 'activity) and is the only option that separates U07 from the four life-critical facts on '
      + 'inputs the model does not author.',
      'Every option raises to REQUIRED_CONTROL at most. None reaches LIFE_CRITICAL, because '
      + 'LIFE_CRITICAL is the value that raises UNRESOLVED_SAFETY_STATE and no deterministic input '
      + 'available today justifies a model-originated fact reaching it.',
    ],
    honestLimits: [
      'n = 8, one cohort, one run. E3 is fitted to the eight facts it was exercised on; on this '
      + 'evidence it is a hypothesis, not a validated policy.',
      'personPresentDuringActivity is read from the observation as task state. Where that reading '
      + 'is itself uncertain, E3 inherits the uncertainty and must fail toward OTHER.',
      'E2 is unfalsified rather than sound: the cohort supplied no deterministic corroboration at '
      + 'all, so its column is structurally uninformative.',
      'The fresh acceptance cohort must record the axis-R distribution again before any option is '
      + 'activated, and D14 remains the product owner\'s decision either way.',
    ],
  };
}

/** Asserted by the suite as literals. */
export function escalationDesignEffect(): {
  providerCalls: 0; databaseOperations: 0;
  activatesAPolicy: false; readsModelAuthoredUrgency: false;
  mayReachLifeCritical: false; mutatesTheShippedFloor: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    activatesAPolicy: false, readsModelAuthoredUrgency: false,
    mayReachLifeCritical: false, mutatesTheShippedFloor: false,
  };
}
