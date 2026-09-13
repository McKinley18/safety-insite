/**
 * EXPERT HAZLENZ -- §151 HARDENED DEVELOPMENT SET. v9. **UNSPENT.**
 *
 * ==================== WHAT THIS SET IS, AND WHAT IT IS NOT YET ====================
 *
 * SIXTEEN rows, EIGHT REQUIRED and EIGHT FORBIDDEN, across SIXTEEN new safety domains. It is the
 * first set authored against the §151 hardened standard, and **every row carries the author's
 * signature on each semantic property the linter cannot check.**
 *
 *   >>> THIS SET HAS NOT BEEN EXECUTED. No provider call has been made against it. Its digest is
 *   >>> frozen prospectively so that a later run is provably against the reviewed material, and a
 *   >>> hosted probe needs its own authorization.
 *
 * ==================== WHY IT EXISTS ====================
 *
 * Across §149 and §150 the answer key was wrong four times and EVERY TIME IN THE SAME DIRECTION --
 * against the model. US-I1 claimed a derivation needing an unstated premise; US-D1's observation
 * presupposed the fact it withheld; RB-H1 hid a real decision-critical gap inside a FORBIDDEN row;
 * RB-D1 named one of two equally exact selectors. Under sound re-adjudication BOTH §150 REQUIRED
 * misses disappeared. An instrument that errs consistently in one direction cannot certify a model,
 * and this set is the replacement.
 *
 * ==================== HOW IT DIFFERS FROM v5-v8 ====================
 *
 *   1. EVERY ROW IS SIGNED. Eight claims on a REQUIRED row, five on a FORBIDDEN row, each with the
 *      author's reason in their own words. The linter fails closed on an unsigned or hollow claim.
 *   2. THE FORBIDDEN HALF IS AUDITED FOR SIBLING GAPS. `NO_SIBLING_DECISION_CRITICAL_GAP` is the
 *      claim RB-H1 would have failed, and it is signed per row rather than assumed.
 *   3. SELECTORS ARE ENUMERATED, NOT ASSUMED UNIQUE. Where two questions resolve one decision, BOTH
 *      are listed in `acceptableSelectors` and either counts as recall. This is the RB-D1 repair, and
 *      it is the change most likely to move a future score.
 *   4. FAMILY ALIASES ARE DECLARED. The RB-C1 defect -- authored truth and the engine naming one
 *      hazard two ways -- is closed by an explicit mapping rather than by hoping the names agree.
 *   5. A DEDICATED SEVERITY-REFINEMENT CONTROL. `HS-R1` exists solely to measure the residual
 *      CONSEQUENCE-MAGNITUDE ROUTING defect established in §151, and it is the row a future v14 must
 *      move. Under v13 it is EXPECTED TO FAIL, and that expectation is recorded here rather than
 *      discovered later.
 *
 * ==================== NON-REGRESSION COVERAGE CARRIED FORWARD ====================
 *
 * The REQUIRED half re-tests every repaired axis on fresh facts: v12's NOT-OBSERVED-IS-NOT-ABSENT
 * (HS-A1), v13's retention bridge on a candidate-shaped unknown (HS-B1), v11's aggregation reopening
 * (HS-D1), and the observer-cannot-determine, prior-event, likelihood, system-coverage and worst-case
 * shapes. The FORBIDDEN half re-tests v11's settled threshold (HS-M1), v12's stated absence (HS-K1)
 * and a true deterministic derivation (HS-L1).
 *
 * ==================== PROVENANCE AND CONFINEMENT ====================
 *
 * Authored 2026-09-03. No reserved material opened. No spent formal-cohort row read, copied,
 * paraphrased or mimicked. No §146-§150 row reused as a scored row, and all sixteen domains are new
 * to this programme.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';
/**
 * One human signature on a semantic property the linter cannot check.
 *
 * DECLARED HERE, NOT IMPORTED. `scripts/` sits outside this project's `rootDir`, so a fixture under
 * `src/` importing the linter breaks `SOURCE_PROJECT_TSC` -- and the dependency belongs this way
 * round in any case: fixtures are the material, the linter is a development instrument that reads
 * them. TypeScript's structural typing makes this identical to the linter's own `ReviewSignature`,
 * and `test-expert-fixture-hardening.ts` passes these values straight into it, so a drift between
 * the two shapes would fail that suite immediately.
 */
export interface ReviewSignature {
  claim: string;
  /** The author's reason, in their own words. A bare restatement of the claim name is refused. */
  note: string;
}

export const HARDENED_SET_VERSION = 'hazlenz.expert.hardened-development.fixtures.v9' as const;

/** Declared so the linter can refuse a row that claims a denominator the set does not run. */
export const HARDENED_SET_DENOMINATORS = [
  'STRICT_REQUIRED_RECALL', 'FORBIDDEN_SILENCE', 'RETAINED_BUT_NOT_ASKED',
  'UNSUPPORTED_SETTLEMENT', 'AFFECTED_DECISION_ACCURACY',
] as const;

/**
 * The families the deterministic layer actually emits, as observed in §148-§150 run records. A truth
 * family outside this list must declare an alias mapping -- defect class D, closed mechanically.
 */
export const CANONICAL_DETERMINISTIC_FAMILIES = [
  'machine_guarding', 'electrical', 'lockout_tagout', 'fall_protection', 'mobile_equipment',
  'confined_space_entry', 'atmospheric_hazard', 'chemical_release', 'chemical_inhalation_contact',
  'respiratory_protection', 'hazcom', 'fire_explosion', 'hot_work', 'welding_fumes',
  'material_handling_storage', 'walking_working_surfaces', 'suspended_loads', 'noise_exposure',
  'personal_protective_equipment', 'training_procedure_supervision', 'ventilation_air_quality',
  'emergency_equipment', 'excavation_trenching', 'thermal_burn', 'lone_working',
  'hydraulic_pneumatic_energy', 'pressure_systems', 'cranes_hoists', 'combustible_dust',
] as const;

export const HARDENED_FORMS = [
  'NOT_VISIBLE', 'RETAINED_CANDIDATE_SHAPED', 'OBSERVER_CANNOT_DETERMINE',
  'AGGREGATION_AGAINST_A_RECORD', 'PRIOR_EVENT', 'LIKELY_BUT_UNESTABLISHED',
  'SYSTEM_COVERAGE', 'WORST_CASE_TEMPTATION',
  'EXPLICITLY_PRESENT', 'EXPLICITLY_ABSENT', 'TRUE_DETERMINISTIC_DERIVATION',
  'SETTLED_THRESHOLD', 'DECISION_INVARIANT_UNKNOWN', 'NON_DECISION_CRITICAL_DETAIL',
  'EVIDENCE_RESOLVES_THE_GAP', 'SEVERITY_REFINEMENT_ONLY',
] as const;
export type HardenedForm = (typeof HARDENED_FORMS)[number];

export interface HardenedRequiredTruth {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  affectedDecision: string;
  whyNotEstablished: string;
  /**
   * THE RB-D1 REPAIR. Every question that resolves this decision, not just the one I thought of
   * first. Any of them counts as recall.
   */
  acceptableSelectors: readonly string[];
}

export interface HardenedForbiddenTruth {
  temptingQuestion: string;
  whyNotDecisionCritical: string;
  whatMakesItSettled: string;
}

export interface HardenedFixture {
  row: FormalCohortRow;
  domain: string;
  form: HardenedForm;
  review: readonly ReviewSignature[];
  denominators: readonly string[];
  familyAliases?: Readonly<Record<string, string>>;
  hazardEstablished: boolean;
  /** Recorded where the set expects v13 to fail, so the expectation is stated before the run. */
  expectedToFailUnderV13?: string;
  expectation:
    | { kind: 'REQUIRED'; truth: HardenedRequiredTruth }
    | { kind: 'FORBIDDEN'; truth: HardenedForbiddenTruth };
}

// ---------------------------------------------------------------- governed records

const R_DSEAR_ZONE_QUANTITY: GovernedStandardView = {
  citation: '29 CFR 1910.106(e)(2)(ii)',
  title: 'Flammable liquids — maximum quantity in an industrial occupancy area',
  approvedText:
    'The aggregate quantity of Class I liquids stored and handled outside of an inside storage room '
    + 'or storage cabinet in any one fire area of an industrial occupancy shall not exceed 25 gallons '
    + 'of Class IA liquids, and the quantity is the total of all containers present in that fire '
    + 'area at one time. See 29 CFR 1910.106(e)(2)(ii).',
  backingState: 'APPROVED',
};

const R_DIGESTER_GAS_ALARM: GovernedStandardView = {
  citation: '29 CFR 1910.146(c)(5)(ii)(C)',
  title: 'Permit space — atmospheric testing before and during entry',
  approvedText:
    'Before an employee enters the space, the internal atmosphere shall be tested for oxygen content, '
    + 'for flammable gases and vapours, and for potential toxic air contaminants. The atmosphere is '
    + 'acceptable when oxygen is between 19.5 and 23.5 percent and flammable gas is below 10 percent '
    + 'of the lower flammable limit, measured with a calibrated direct-reading instrument. See 29 CFR '
    + '1910.146(c)(5)(ii)(C).',
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
const sig = (claim: string, note: string): ReviewSignature => ({ claim, note });
const REQ_DEN = ['STRICT_REQUIRED_RECALL', 'RETAINED_BUT_NOT_ASKED', 'UNSUPPORTED_SETTLEMENT',
  'AFFECTED_DECISION_ACCURACY'];
const FORB_DEN = ['FORBIDDEN_SILENCE', 'UNSUPPORTED_SETTLEMENT'];

// ================================================================ the sixteen rows

export const HARDENED_FIXTURES: readonly HardenedFixture[] = [

// ================================================================ REQUIRED (8)

{
  row: row('HS-A1',
    'A grain dryer is running on the farm drying floor. The burner unit sits at the far end of the '
    + 'plenum behind a steel shroud, and from the walkway the flame-failure device and its wiring '
    + 'are behind that shroud and cannot be seen. Grain dust has settled on the horizontal surfaces '
    + 'of the walkway and on the motor housings. An operative is clearing a blockage at the '
    + 'discharge auger with the dryer running.',
    ['combustible_dust', 'fire_explosion', 'machine_guarding', 'noise_exposure'],
    { presentHazardFamilies: ['combustible_dust', 'machine_guarding'],
      defensibleHazardFamilies: ['fire_explosion'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'],
      decisionCriticalGaps: [{ gapId: 'HS-A1-G1',
        description: 'whether the burner\'s flame-failure device is fitted and functioning, which '
          + 'the shroud prevents the observer from seeing',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'v12 NON-REGRESSION on fresh facts. The observation states a VISIBILITY limit and states its '
        + 'cause (the shroud). "Not visible" must not become "not fitted". The settled dust and the '
        + 'auger clearance are separately established hazards and must still be raised.' }),
  domain: 'grain dryer burner',
  form: 'NOT_VISIBLE',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The observation says the device is behind the shroud and unseen; it never states whether one is fitted or working.'),
    sig('NO_PRESUPPOSITION', 'No sentence implies a flame-failure device exists or does not; the shroud is described as an obstruction only, with no definite article naming the device as present.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'A dryer running normally looks identical with a working device, a failed one, or none fitted; no stated fact discriminates.'),
    sig('TWO_PLAUSIBLE_VALUES', 'Fitted and functioning, or absent/defeated — both are ordinary on farm dryers of this kind.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'With the device working the finding is dust housekeeping and the auger interlock; without it, an unburnt-fuel accumulation in a dust-laden plenum means the dryer stops now.'),
    sig('NO_HIDDEN_DEFAULT', 'No governed record is supplied and nothing in the text sets a default for the device state.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors reach the same decision and both are enumerated: the device state itself, and whether the burner has been proved to shut off on flame loss.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether a specific safety control is present and effective, which is REQUIRED_CONTROL rather than a magnitude question.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the grain dryer burner has a functioning flame-failure device',
    answerA: 'the device is fitted and proved to shut the burner off on flame loss',
    outcomeA: 'drying continues and the finding is the dust accumulation and the auger being cleared while running',
    answerB: 'no device is fitted, or it has been bypassed',
    outcomeB: 'the dryer must be shut down now, because unburnt fuel discharging into a dust-laden plenum is an explosion sequence with no interruption',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'the observation establishes only that the device and its wiring are behind a shroud and cannot be seen from the walkway; an obstructed sightline is not an inspection of what is behind it',
    acceptableSelectors: [
      'whether a flame-failure device is fitted to the burner and is functioning',
      'whether the burner has been proved to shut off on loss of flame',
    ] } },
},

{
  row: row('HS-B1',
    'In the theatre fly tower a technician is loading counterweights onto a cradle at the loading '
    + 'gallery while a scenery bar hangs on the same line stage-side. He is working from the gallery '
    + 'with the cradle at gallery level. The rope lock on that line set is engaged. Two stage crew '
    + 'are working on the deck below the bar, moving a rostrum. Nobody is standing at the pin rail.',
    ['suspended_loads', 'material_handling_storage', 'fall_protection', 'excavation_trenching'],
    { presentHazardFamilies: ['suspended_loads'],
      defensibleHazardFamilies: ['material_handling_storage', 'fall_protection'],
      forbiddenHazardFamilies: ['excavation_trenching'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['suspended_loads'],
      decisionCriticalGaps: [{ gapId: 'HS-B1-G1',
        description: 'whether the bar stage-side is currently balanced against the weight already on '
          + 'the cradle, which decides whether the deck below must be cleared before loading continues',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'v13 RETENTION-BRIDGE ROW. The unknown is CANDIDATE-SHAPED -- does an out-of-balance '
        + 'condition exist? -- so INSUFFICIENT_EVIDENCE is an available parking place and only the '
        + 'bridge can carry it to a question. No governed record, so v11\'s threshold limb cannot '
        + 'carry it either. The engaged rope lock is the distractor: it holds a balanced set and is '
        + 'not designed to hold a badly out-of-balance one.' }),
  domain: 'theatre counterweight flying',
  form: 'RETAINED_CANDIDATE_SHAPED',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The observation gives the rope lock state and the positions of everyone present, and never states the balance condition of the line set.'),
    sig('NO_PRESUPPOSITION', 'No sentence presupposes balance or imbalance; "the rope lock is engaged" is a state of the lock, not of the load, and I chose that wording deliberately after the US-D1 defect.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'An engaged rope lock is consistent with a balanced set and with an out-of-balance one being held by friction alone; deriving balance needs the added premise that the lock is rated for the imbalance.'),
    sig('TWO_PLAUSIBLE_VALUES', 'Loading in progress means the set is either already matched to the bar or deliberately unmatched mid-operation; both are routine.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Balanced, the finding is the loading method and the unattended pin rail; badly out of balance, the deck under the bar must be cleared before another weight goes on.'),
    sig('NO_HIDDEN_DEFAULT', 'No record is supplied and no stated fact sets a default balance condition.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Three selectors reach the same decision and all three are enumerated: the balance condition, whether the bar is loaded to match, and whether the deck below is controlled during loading.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether a specific control — clearing the deck — is required before work continues, not how bad a fall of scenery would be.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the line set is currently balanced against the weight already loaded on the cradle',
    answerA: 'the set is balanced and the loading is a matched transfer',
    outcomeA: 'loading continues and the finding is the manual handling of weights and the unattended pin rail',
    answerB: 'the bar is loaded and the cradle is not yet matched, so the set is badly out of balance',
    outcomeB: 'the deck beneath the bar must be cleared before another weight is placed, because the rope lock is the only thing restraining a runaway',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'the rope-lock state and everyone\'s position are stated; the relationship between the weight on the cradle and the load on the bar is never given, and the lock being engaged says nothing about what it is restraining',
    acceptableSelectors: [
      'whether the line set is balanced between the cradle and the bar',
      'whether the bar stage-side is loaded to match the counterweights being added',
      'whether the deck below the bar is kept clear while the set is being loaded',
    ] } },
},

{
  row: row('HS-C1',
    'A patient is being prepared for an MRI scan in the imaging suite. The radiographer said the '
    + 'ferromagnetic screening questionnaire for this patient was completed by the referring ward '
    + 'and has not arrived with the notes, and that nobody in the suite can confirm what it recorded. '
    + 'The patient is on the trolley at the scanner room door. The door interlock is working and the '
    + 'controlled area signage is in place.',
    ['emergency_equipment', 'material_handling_storage', 'training_procedure_supervision',
      'hot_work'],
    { presentHazardFamilies: ['emergency_equipment'],
      defensibleHazardFamilies: ['material_handling_storage', 'training_procedure_supervision'],
      forbiddenHazardFamilies: ['hot_work'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['emergency_equipment'],
      decisionCriticalGaps: [{ gapId: 'HS-C1-G1',
        description: 'what the ferromagnetic screening recorded for this patient, which decides '
          + 'whether the patient may cross into the controlled area at all',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'The absence is ANNOUNCED and it is announced about DETERMINABILITY: a named person said '
        + 'nobody present can confirm it. That establishes ignorance, not absence -- the screening '
        + 'exists and was completed; its CONTENT is what is unavailable. The working interlock and '
        + 'the signage are stated distractors: both are about controlling the area, neither about '
        + 'this patient.' }),
  domain: 'MRI ferromagnetic screening',
  form: 'OBSERVER_CANNOT_DETERMINE',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The text states that the questionnaire was completed and has not arrived; what it recorded is never given.'),
    sig('NO_PRESUPPOSITION', 'Nothing presupposes the result either way. I avoided writing that the patient "has no implants", which would have settled it.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'A completed questionnaire held elsewhere carries no derivable content; concluding the patient is safe to enter needs a premise about what it said.'),
    sig('TWO_PLAUSIBLE_VALUES', 'The screening cleared the patient, or it flagged an implant or retained fragment — both are ordinary outcomes of the form.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Cleared, the scan proceeds now and the finding is the notes-handling process; flagged, the trolley must be moved back from the door before anything else, so the two answers change what happens in the next minute.'),
    sig('NO_HIDDEN_DEFAULT', 'No record is supplied, and the interlock and signage control the AREA rather than supplying a default for this patient.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors are enumerated: what the screening recorded, and whether the patient has been screened by any means available in the suite now.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether a control — exclusion from the controlled area — is required for this patient, not the magnitude of any consequence.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'what the ferromagnetic screening recorded for this patient',
    answerA: 'the screening cleared the patient with no implanted or retained ferromagnetic material',
    outcomeA: 'the scan proceeds and the finding is the failure of the paperwork to travel with the patient',
    answerB: 'the screening flagged an implant or a retained fragment',
    outcomeB: 'the patient must not cross into the controlled area, and the trolley must be moved back from the door now',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'the observation establishes that the form was completed elsewhere and that nobody present knows its contents; nobody in the room knowing a fact is not evidence about the fact',
    acceptableSelectors: [
      'what the ferromagnetic screening questionnaire recorded for this patient',
      'whether this patient has been screened for ferromagnetic implants by any means available now',
    ] } },
},

{
  row: row('HS-D1',
    'The swimming pool dosing room holds the chlorine and acid supply for the main pool. Two '
    + 'part-full 25 litre drums of a Class IA solvent-based cleaner stand on the floor beside the '
    + 'dosing pumps, and further containers of the same product are stored on the racking behind '
    + 'them; the observation does not record how many. The room is a single fire compartment with '
    + 'the plant room, and neither an inside storage room nor a storage cabinet is present. A single '
    + 'approved governed record covering flammable liquid quantities in a fire area was supplied '
    + 'with this inspection.',
    ['fire_explosion', 'chemical_release', 'chemical_inhalation_contact', 'fall_protection'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'chemical_release',
        'chemical_inhalation_contact'],
      forbiddenHazardFamilies: ['fall_protection'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'HS-D1-G1',
        description: 'the aggregate quantity of Class IA liquid present in this fire area, which the '
          + 'record defines as the total of all containers and which the observation never totals',
        affectedDecision: 'REGULATORY_INTERPRETATION' }],
      recordedInteractions: [],
      authoringRationale:
        'v11 AGGREGATION NON-REGRESSION on fresh facts. The record defines the compared quantity as '
        + 'the TOTAL of all containers in the fire area; the observation gives two drums and says '
        + 'the rest are not counted. The comparison quantity cannot be assembled from the text. This '
        + 'is also the row most likely to attract HAZARD_SEVERITY under v13, because the question '
        + 'opens on a quantity -- and the correct label is REGULATORY_INTERPRETATION.' },
    { governedStandards: [R_DSEAR_ZONE_QUANTITY] }),
  domain: 'pool plant chemical store',
  form: 'AGGREGATION_AGAINST_A_RECORD',
  hazardEstablished: false,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'Two drums are given; the observation says in terms that the number of further containers is not recorded, so the total is absent.'),
    sig('NO_PRESUPPOSITION', 'Nothing implies the total is above or below 25 gallons. I deliberately did not write "only a few" or "a large stock", either of which would have settled it.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'Two part-full 25 litre drums plus an uncounted number of further containers cannot be summed; no arithmetic reaches the record\'s quantity.'),
    sig('TWO_PLAUSIBLE_VALUES', 'The aggregate is under 25 gallons, or over it — a pool plant room routinely holds either.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Under, the finding is segregation from the chlorine and acid; over, the excess must be removed from the fire area or put into a cabinet today.'),
    sig('NO_HIDDEN_DEFAULT', 'The record sets a limit, not a default; it supplies no presumption about what is present, and states positively that no cabinet or storage room exists here.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors are enumerated: the aggregate quantity in the fire area, and the number and size of the containers on the racking.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides how the supplied record\'s stated condition applies to this room, which is REGULATORY_INTERPRETATION. It is not HAZARD_SEVERITY: it does not grade a consequence, it decides whether a limit is exceeded.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'the aggregate quantity of Class IA liquid present in this fire area, counting every container',
    answerA: 'the aggregate is within the 25 gallon limit the record states',
    outcomeA: 'storage continues and the finding is the segregation of solvent from the chlorine and acid dosing lines',
    answerB: 'the aggregate exceeds 25 gallons',
    outcomeB: 'the excess must be removed from the fire area or placed in a storage cabinet now, which the room does not have',
    affectedDecision: 'REGULATORY_INTERPRETATION',
    whyNotEstablished: 'the record\'s quantity is the total of all containers in the fire area, and the observation gives two drums while stating that the further containers are not counted; one side of the comparison is simply absent',
    acceptableSelectors: [
      'the aggregate quantity of Class IA liquid in this fire area',
      'the number and size of the further containers on the racking',
    ] } },
},

{
  row: row('HS-E1',
    'A sawmill debarker is running and a sawyer is standing at the infeed deck rolling logs onto the '
    + 'chain. The machine\'s guard door over the rotor is closed and its interlock switch is in '
    + 'place. The machine was returned to service this morning after a rotor tooth change carried '
    + 'out overnight by the maintenance fitter, who has gone off shift. The sawyer is working from '
    + 'the deck and is not reaching into the throat.',
    ['machine_guarding', 'lockout_tagout', 'material_handling_storage', 'chemical_release'],
    { presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ['lockout_tagout', 'material_handling_storage'],
      forbiddenHazardFamilies: ['chemical_release'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'],
      decisionCriticalGaps: [{ gapId: 'HS-E1-G1',
        description: 'whether the guard interlock was function-tested after the overnight rotor '
          + 'work, without which its being "in place" says nothing about whether it stops the rotor',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE UNKNOWN IS A PAST EVENT and nothing visible now can settle it: an interlock proved on '
        + 'test and one never re-tested look identical from the deck. The fitter having gone off '
        + 'shift is a stated fact that makes the answer unobtainable on the spot, without making the '
        + 'test\'s absence a fact.' }),
  domain: 'sawmill debarker',
  form: 'PRIOR_EVENT',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The text says the guard door is closed and the switch is in place, and that the machine was returned to service; it never says the interlock was tested.'),
    sig('NO_PRESUPPOSITION', '"Returned to service" is a statement about the machine running again, not about a test having been passed, and I avoided writing "signed back into service" which would have implied one.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'A switch being physically in place does not entail that it opens the circuit; deriving that needs a premise about post-maintenance testing that the text does not supply.'),
    sig('TWO_PLAUSIBLE_VALUES', 'The fitter function-tested it before handing back, or he refitted the guard and left without testing — both are ordinary overnight outcomes.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Tested, the machine keeps running now and the finding is the infeed method; untested, it stops today until the interlock is proved, because a defeated interlock on a debarker rotor is not survivable.'),
    sig('NO_HIDDEN_DEFAULT', 'No record is supplied and nothing in the text sets a default about post-maintenance testing.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors are enumerated: whether the interlock was function-tested after the work, and whether the rotor was proved to stop with the guard opened.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether a specific control has been verified before use, which is REQUIRED_CONTROL.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the guard interlock was function-tested after the overnight rotor tooth change',
    answerA: 'the interlock was proved to stop the rotor before the machine was handed back',
    outcomeA: 'the machine runs and the finding is the infeed method and the sawyer working the deck alone',
    answerB: 'no function test was made after the guard was refitted',
    outcomeB: 'the debarker must come out of service until the interlock is proved, because nothing else stands between an opened guard and a turning rotor',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'the guard being closed and the switch being present are both visible now and are equally consistent with a tested interlock and an untested one; a test performed overnight leaves nothing at the deck that its absence would not also leave',
    acceptableSelectors: [
      'whether the guard interlock was function-tested after the rotor work',
      'whether the rotor was proved to stop when the guard is opened',
    ] } },
},

{
  row: row('HS-F1',
    'Two operatives are hydro-demolishing a concrete bridge soffit from a scaffold deck using a '
    + 'hand-held lance at high pressure. One is on the lance and the other is tending the hose at '
    + 'the deck edge. They are in waterproofs, visors and helmets. The pump unit is on the deck '
    + 'below with its engine running. The jetting is being carried out over a footpath that runs '
    + 'under the bridge and is open to pedestrians at the far end.',
    ['walking_working_surfaces', 'personal_protective_equipment', 'noise_exposure',
      'confined_space_entry'],
    { presentHazardFamilies: ['walking_working_surfaces'],
      defensibleHazardFamilies: ['personal_protective_equipment', 'noise_exposure'],
      forbiddenHazardFamilies: ['confined_space_entry'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'HS-F1-G1',
        description: 'whether a dump valve or dead-man control is fitted to the lance and is '
          + 'functioning, which decides whether the jet stops when the operative lets go',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE LIKELIHOOD ROW. The observation contains NO negative sentence at all -- nothing is said '
        + 'to be missing, unseen or unknown. The pull toward "there is no dead-man control" comes '
        + 'entirely from the circumstances. Likelihood establishes nothing. The PPE listed is '
        + 'deliberately complete so that the doubt cannot be sourced from an obvious omission.' }),
  domain: 'bridge hydro-demolition',
  form: 'LIKELY_BUT_UNESTABLISHED',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The lance, the pressure, the crew positions and the PPE are all stated; the lance\'s control arrangement is never mentioned.'),
    sig('NO_PRESUPPOSITION', 'There is no negative sentence anywhere in the row, so nothing presupposes the control\'s presence or absence in either direction.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'A hand-held lance in use is consistent with a working dead-man, a defeated one and none fitted; no stated fact discriminates.'),
    sig('TWO_PLAUSIBLE_VALUES', 'Fitted and working, or absent or tied back — the second is a well-known field practice on jetting lances.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Working, the finding is the open footpath and the exclusion below; absent, the jetting stops now because a dropped lance at that pressure is uncontrolled.'),
    sig('NO_HIDDEN_DEFAULT', 'No record is supplied and no stated fact supplies a default for the lance control.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors are enumerated: whether a dead-man or dump valve is fitted and working, and whether the jet stops when the trigger is released.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether a specific engineering control is in place, not how severe an injury would be.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the lance has a functioning dead-man or dump-valve control',
    answerA: 'a dead-man control is fitted and the jet stops when the trigger is released',
    outcomeA: 'jetting continues and the finding is the unclosed footpath beneath and the exclusion arrangements',
    answerB: 'no dead-man is fitted, or it has been tied back',
    outcomeB: 'the jetting must stop now, because a lance released at that pressure travels and nothing interrupts the jet',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'nothing in the observation touches the lance\'s control arrangement in either direction; the scene is equally consistent with a compliant lance and a defeated one, and finding the worse one easy to picture is not being told which it is',
    acceptableSelectors: [
      'whether the lance is fitted with a functioning dead-man or dump-valve control',
      'whether the jet stops when the operative releases the trigger',
    ] } },
},

{
  row: row('HS-G1',
    'A battery energy storage container has been added at the end of the depot yard to buffer the '
    + 'vehicle chargers. It stands about four metres from the workshop wall, which has a personnel '
    + 'door and a window opening onto the yard. The container has its own ventilation louvres and a '
    + 'gas detection head is visible inside the door. The depot fire strategy on the office wall '
    + 'shows the yard layout as it was before the container arrived.',
    ['fire_explosion', 'emergency_equipment', 'electrical', 'welding_fumes'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'emergency_equipment', 'electrical'],
      forbiddenHazardFamilies: ['welding_fumes'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'HS-G1-G1',
        description: 'whether the depot fire strategy has been reassessed for the container\'s '
          + 'separation from the workshop openings, or still reflects the yard as it was',
        affectedDecision: 'APPLICABILITY' }],
      recordedInteractions: [],
      authoringRationale:
        'THE SYSTEM-COVERAGE ROW. The unknown is whether the site\'s fire strategy REACHES the '
        + 'changed configuration -- candidate-shaped and parkable. The two stated reassurances '
        + '(louvres, detection head) are both about the container\'s OWN condition and neither is '
        + 'about the separation distance or the strategy. The out-of-date drawing is stated as a '
        + 'fact about the drawing, not as evidence that no reassessment happened.' }),
  domain: 'depot battery storage container',
  form: 'SYSTEM_COVERAGE',
  hazardEstablished: false,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The drawing is stated to show the previous layout; whether the strategy itself was reassessed is never stated.'),
    sig('NO_PRESUPPOSITION', 'An out-of-date drawing on a wall does not presuppose that no assessment was done — drawings lag assessments routinely — and I chose that wording rather than "no assessment has been carried out".'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'Concluding from a stale drawing that the strategy was never revisited needs the added premise that drawings are always updated when strategies are.'),
    sig('TWO_PLAUSIBLE_VALUES', 'The strategy was reassessed for the container and the drawing simply lags, or the container was placed without any reassessment.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Reassessed, the finding is the drawing revision; not reassessed, the separation from a door and a window has never been evaluated and the container\'s position must be reviewed before it stays in service.'),
    sig('NO_HIDDEN_DEFAULT', 'No governed record is supplied; the louvres and the detection head describe the container and set no default for the site strategy.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Two selectors are enumerated: whether the fire strategy was reassessed for the container, and what separation the strategy requires from workshop openings.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether the site\'s existing fire strategy governs the changed configuration at all, which is scope — APPLICABILITY — rather than which control to apply.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the depot fire strategy was reassessed for the container\'s position relative to the workshop openings',
    answerA: 'the strategy was reassessed for the container and the separation was evaluated',
    outcomeA: 'the container stays and the finding is that the displayed drawing has not been revised',
    answerB: 'the container was placed without the strategy being revisited',
    outcomeB: 'a lithium installation four metres from a door and a window is operating outside any assessed fire strategy, and its position must be reviewed before it remains in service',
    affectedDecision: 'APPLICABILITY',
    whyNotEstablished: 'the louvres and the detection head are facts about the container\'s own condition and the drawing is a fact about the drawing; none of the three says whether the site strategy was revisited when the yard changed',
    acceptableSelectors: [
      'whether the depot fire strategy was reassessed when the container was installed',
      'what separation the fire strategy requires between such a container and workshop openings',
    ] } },
},

{
  row: row('HS-H1',
    'A laboratory autoclave has finished a cycle and a technician is at the door with the load '
    + 'trolley. The door interlock released and she has begun to swing the door open. The chamber '
    + 'pressure gauge on the front panel reads zero. Through the whole of the cycle I watched, the '
    + 'over-temperature alarm did not sound. She is wearing a lab coat and heat-resistant gloves and '
    + 'is standing to the hinge side as the door opens.',
    ['thermal_burn', 'pressure_systems', 'personal_protective_equipment', 'noise_exposure'],
    { presentHazardFamilies: ['thermal_burn'],
      defensibleHazardFamilies: ['pressure_systems', 'personal_protective_equipment'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'HS-H1-G1',
        description: 'whether the load has been given its cooling hold before the door was opened, '
          + 'which a zero pressure gauge does not establish for a liquid load',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'THE WORST-CASE ROW, with the bait inverted as in §149\'s US-E1: a silent alarm is what a '
        + 'HEALTHY cycle sounds like, and equally what a dead alarm sounds like. The zero gauge is '
        + 'the second distractor -- chamber pressure returning to zero does not mean a bottled '
        + 'liquid load has cooled below its boiling point. The adverse branch is dramatic, which is '
        + 'the pull toward writing it down as fact.' }),
  domain: 'laboratory autoclave',
  form: 'WORST_CASE_TEMPTATION',
  hazardEstablished: true,
  denominators: REQ_DEN,
  review: [
    sig('NOT_ALREADY_STATED', 'The gauge reading, the interlock release and the alarm silence are all stated; whether a cooling hold was applied to this load is not.'),
    sig('NO_PRESUPPOSITION', 'Nothing presupposes the hold either way. "The door interlock released" is a statement about the interlock\'s own logic, not about the load\'s temperature.'),
    sig('NOT_DETERMINISTICALLY_DERIVABLE', 'Chamber pressure at zero does not entail that liquid inside sealed bottles is below boiling; deriving that needs a premise linking chamber pressure to load temperature that is false for liquid loads.'),
    sig('TWO_PLAUSIBLE_VALUES', 'A liquid cycle with its cooling hold completed, or a cycle opened as soon as the interlock allowed — both are ordinary.'),
    sig('BRANCHES_CHANGE_A_CURRENT_DECISION', 'Held, the finding is the door-opening stance and glove selection; not held, the door must be closed again now because superheated liquid can boil violently on disturbance.'),
    sig('NO_HIDDEN_DEFAULT', 'No record is supplied, and neither the gauge nor the interlock supplies a default about the load\'s thermal state.'),
    sig('SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED', 'Three selectors are enumerated: whether a cooling hold ran, whether the cycle was a liquid cycle, and whether the load temperature was checked before opening.'),
    sig('AFFECTED_DECISION_JUSTIFIED', 'The answer decides whether opening the door now is permissible — a control decision — and not how badly a scald would injure.'),
  ],
  expectation: { kind: 'REQUIRED', truth: {
    missingFact: 'whether the load was given a cooling hold appropriate to its contents before the door was opened',
    answerA: 'the cycle included a liquid cooling hold and the load is below boiling',
    outcomeA: 'unloading continues and the finding is the stance at the door and the glove specification',
    answerB: 'no cooling hold ran, or the door was opened as soon as the interlock allowed',
    outcomeB: 'the door must be closed again and the load left to cool, because superheated liquid in sealed containers can boil violently when moved',
    affectedDecision: 'REQUIRED_CONTROL',
    whyNotEstablished: 'the alarm not sounding is what a correct cycle and a dead alarm both produce, and a chamber gauge at zero is a statement about the chamber rather than about liquid inside sealed bottles; neither reaches the cooling hold',
    acceptableSelectors: [
      'whether the load was given a cooling hold before the door was opened',
      'whether this was a liquid cycle requiring a cooling hold',
      'whether the load temperature was checked before the door was opened',
    ] } },
},

// ================================================================ FORBIDDEN (8)

{
  row: row('HS-J1',
    'In the paint spray booth a sprayer is finishing a panel. The booth extract is running and I '
    + 'watched the airflow indicator on the control panel sit in the green band throughout. The '
    + 'booth interlock prevents the gun triggering with the fans off, and the electrician '
    + 'demonstrated this to me by switching the fans off, at which the gun would not fire. The '
    + 'sprayer is wearing an air-fed hood supplied from the compressor with a breathing-air filter, '
    + 'and the filter change record beside the compressor is signed for this month.',
    ['chemical_inhalation_contact', 'respiratory_protection', 'fire_explosion',
      'excavation_trenching'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'respiratory_protection',
        'fire_explosion'],
      forbiddenHazardFamilies: ['excavation_trenching'],
      negatedOrSafeStateFamilies: ['chemical_inhalation_contact', 'respiratory_protection'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'EXPLICITLY PRESENT, and every control is VERIFIED IN THE OBSERVER\'S PRESENCE rather than '
        + 'merely described: the airflow band was watched, the interlock was demonstrated by test, '
        + 'and the filter record was seen. §151 F3 was applied deliberately -- I searched the row '
        + 'for a sibling gap and record below the one candidate I considered and why it closes.' }),
  domain: 'paint spray booth',
  form: 'EXPLICITLY_PRESENT',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'Extract running, interlock proved by demonstration, air-fed hood in use and its filter record current — every control the task depends on is stated and three were verified in person.'),
    sig('NO_UNSTATED_PREMISE', 'The interlock conclusion rests on a demonstrated test rather than on an inference from the equipment being fitted.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered the breathing-air quality itself as a sibling gap and closed it: the filter is stated as fitted and its change record is stated as current, so the one fact that would decide it is given.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'No sentence introduces an entity whose state is left open; the compressor, the filter and the interlock each carry their state in the same sentence that introduces them.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'The row contains no advertised-absence wording at all, so the RB-F1 weakness cannot arise here.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'is the breathing air actually clean, and has the booth extract been quantitatively tested rather than just indicated?',
    whyNotDecisionCritical: 'the filter is stated as fitted with a current change record, and the extract was watched in the green band with the interlock proved by an actual switch-off test. Neither answer changes what is done in the booth today.',
    whatMakesItSettled: 'three of the four controls were verified by the observer in person and the fourth carries a stated, current record; nothing a decision turns on is left open.',
  } },
},

{
  row: row('HS-K1',
    'The abrasive blast enclosure is in use on a fabrication. The operator told me the enclosure has '
    + 'never had a light and there is no viewing panel, so he works by feel with the door propped '
    + 'open about a foot for light. I could see the door propped and the blast media escaping '
    + 'through the gap onto the shop floor. He is wearing a blast helmet with air supply. Two other '
    + 'workers are at benches eight metres away with no screening between them and the gap.',
    ['respiratory_protection', 'chemical_inhalation_contact', 'personal_protective_equipment',
      'suspended_loads'],
    { presentHazardFamilies: ['chemical_inhalation_contact', 'personal_protective_equipment'],
      defensibleHazardFamilies: ['respiratory_protection'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'v12 NON-REGRESSION: the absences are POSITIVELY ESTABLISHED and by two routes -- the '
        + 'operator states the light and viewing panel have never existed, and the propped door and '
        + 'escaping media were SEEN. A stated absence IS established, and the action is the same on '
        + 'any further answer: the enclosure is open and media is reaching an occupied shop floor.' }),
  domain: 'abrasive blast enclosure',
  form: 'EXPLICITLY_ABSENT',
  hazardEstablished: true,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'The absent light and viewing panel are stated by the operator, and the propped door and escaping media were directly observed.'),
    sig('NO_UNSTATED_PREMISE', 'Nothing is derived; the exposure is what the observer saw — media crossing into a bay occupied by two unscreened workers.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered the blast media type as a sibling gap and closed it: the finding is that an enclosure is being run open into an occupied bay, and that is the action on any media.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'The air supply to the helmet is stated as present; I deliberately did not leave its filtration open, which would have created a second gap of the RB-H1 kind.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'The absences here are operator-stated facts about what has never existed, not observer-side "not recorded" wording, and the consequence is directly observed rather than inferred.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'could a light or viewing panel be fitted, and what blast media is in use?',
    whyNotDecisionCritical: 'the operator stated positively that neither has ever existed and the escaping media was seen crossing into a bay where two unscreened workers are at benches. Stopping the open-door working and screening the bay is the action on any media and whatever fitting is possible later.',
    whatMakesItSettled: 'an explicit operator statement of absence plus direct observation of the propped door, the escaping media and the exposed workers.',
  } },
},

{
  row: row('HS-L1',
    'A lift engineer is working in the passenger lift machine room on the traction sheave. The '
    + 'machine-room isolator is off and padlocked with his own lock, and he holds the only key on '
    + 'his belt, which he showed me. The lift is a single-supply machine with no standby or '
    + 'regenerative supply. The car is parked at the lowest floor and is resting on the fully '
    + 'compressed buffers, with the ropes visibly slack over the sheave. The counterweight is at the '
    + 'top of its guides and is chocked with the manufacturer\'s pin, which I saw in place.',
    ['lockout_tagout', 'suspended_loads', 'machine_guarding', 'welding_fumes'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['lockout_tagout', 'suspended_loads', 'machine_guarding'],
      forbiddenHazardFamilies: ['welding_fumes'],
      negatedOrSafeStateFamilies: ['lockout_tagout', 'suspended_loads'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'A TRUE DETERMINISTIC DERIVATION, authored against the US-I1 defect. Every premise the '
        + 'conclusion needs is IN THE TEXT and none concerns anyone\'s future conduct: the sole '
        + 'supply is isolated, the only key is on the person doing the work, no second supply '
        + 'exists, the car is landed on buffers with the ropes slack so no suspended load remains, '
        + 'and the counterweight is mechanically pinned. Nobody can restore energy that has one key '
        + 'and that key is on the engineer.' }),
  domain: 'passenger lift machine room',
  form: 'TRUE_DETERMINISTIC_DERIVATION',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'The energy sources are each closed positively: electrical supply isolated under a personal lock with the sole key held, no second supply, no suspended load, and the counterweight mechanically pinned.'),
    sig('NO_UNSTATED_PREMISE', 'This is the US-I1 repair applied at authoring time. US-I1 needed the premise that nobody reconnects a removed cable; here the sole key is on the person at risk, so no premise about anyone else\'s conduct is required.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I searched for a stored-energy sibling and closed each: gravity is closed by the car resting on compressed buffers with slack ropes, and the counterweight by the stated pin, which was seen.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'No entity is introduced without its state. I specifically did not mention a second engineer or a landing-door key, either of which would have opened a real gap.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'No advertised-absence wording is used; every absence is a positive statement about the installation rather than about what was not recorded.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'has the lift been locked out and tagged, and is the counterweight secured against movement?',
    whyNotDecisionCritical: 'both are answered in the observation. The supply is isolated under the engineer\'s own lock with the only key on his belt, there is no second supply, the car is landed on its buffers with the ropes slack, and the counterweight is pinned with the manufacturer\'s device which was seen in place.',
    whatMakesItSettled: 'deterministic derivation from stated facts with no added premise: no supply path, no second supply, no suspended load, and the one remaining mass mechanically restrained — each stated, none assumed, and none depending on anyone\'s future conduct.',
  } },
},

{
  row: row('HS-M1',
    'An operative is about to enter the sludge holding tank at the anaerobic digestion plant for a '
    + 'planned clean. Before entry the atmosphere was tested at three depths with a calibrated '
    + 'direct-reading instrument, and the readings were recorded at 20.8 percent oxygen and 2 '
    + 'percent of the lower flammable limit for methane, with the instrument\'s calibration '
    + 'certificate in date and posted at the entry point. Continuous monitoring is rigged and '
    + 'running on the man. A single approved governed record covering permit-space atmospheric '
    + 'testing was supplied with this inspection.',
    ['confined_space_entry', 'atmospheric_hazard', 'emergency_equipment', 'machine_guarding'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['confined_space_entry', 'atmospheric_hazard',
        'emergency_equipment'],
      forbiddenHazardFamilies: ['machine_guarding'],
      negatedOrSafeStateFamilies: ['atmospheric_hazard'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'v11 SETTLED-THRESHOLD NON-REGRESSION. Value: 20.8 percent oxygen and 2 percent LFL. Basis: '
        + 'calibrated direct-reading instrument, which the record names in the same words. Side: '
        + 'inside 19.5-23.5 and well below 10 percent LFL. Every element the v11 affirmative rule '
        + 'requires is present, and continuous monitoring closes the during-entry limb the record '
        + 'also states.' },
    { governedStandards: [R_DIGESTER_GAS_ALARM] }),
  domain: 'anaerobic digester sludge tank',
  form: 'SETTLED_THRESHOLD',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'Both of the record\'s stated conditions are measured, recorded and plainly satisfied, on the instrument type the record names.'),
    sig('NO_UNSTATED_PREMISE', 'The comparison is arithmetic between two stated figures and the record\'s two stated bands; no premise is added.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered toxic contaminants as a sibling gap, since the record names three test categories: the row states testing at three depths with a direct-reading instrument and continuous monitoring on the man, so the during-entry limb is closed rather than left open.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'The calibration currency is stated rather than left implied, which was the obvious way this row could have leaked a second question.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'No advertised-absence wording is used anywhere in the row.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'were the readings taken close enough to the entry, and is 2 percent of the lower flammable limit really safe in a digester?',
    whyNotDecisionCritical: 'the record states its own acceptance criteria and its own instrument type, and the observation reports both figures on that basis with the calibration in date. 20.8 percent is mid-band and 2 percent LFL is a fifth of the stated limit, with continuous monitoring running during the entry.',
    whatMakesItSettled: 'value = 20.8 percent oxygen and 2 percent LFL; basis = calibrated direct-reading instrument at three depths, named identically by both texts; side = inside both stated bands with margin, and the during-entry condition covered by continuous monitoring.',
  } },
},

{
  row: row('HS-N1',
    'A tyre fitter is inflating a commercial truck tyre on a split-rim wheel inside a fitted '
    + 'restraint cage in the workshop bay. He is standing outside the cage and to one side with the '
    + 'airline extension reaching in, and the bay is clear of other people. The cage is bolted to '
    + 'the floor and the wheel is fully within it. The observation does not record how many tyres '
    + 'this fitter changes in a shift.',
    ['mobile_equipment', 'material_handling_storage', 'noise_exposure', 'confined_space_entry'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['mobile_equipment', 'material_handling_storage', 'noise_exposure'],
      forbiddenHazardFamilies: ['confined_space_entry'],
      negatedOrSafeStateFamilies: ['mobile_equipment'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'DECISION-INVARIANT UNKNOWN, authored to the §151 J-class rule: the advertised absence is '
        + 'present ("does not record how many tyres in a shift") AND the invariance is DEMONSTRATED '
        + 'IN THE SAME OBSERVATION -- the cage is fitted and bolted, the wheel is inside it, the '
        + 'fitter is outside and to one side, and the bay is clear. That is what §150\'s RB-F1 '
        + 'lacked, and the difference is the point of the row.' }),
  domain: 'tyre fitting restraint cage',
  form: 'DECISION_INVARIANT_UNKNOWN',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'The throughput is genuinely unknown and genuinely irrelevant: the control is a physical restraint cage that is in use correctly, and it works identically at one tyre a shift or fifty.'),
    sig('NO_UNSTATED_PREMISE', 'The invariance is observed rather than argued — the cage is stated as fitted and bolted with the wheel inside and the fitter outside.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered whether the cage is rated for this wheel size and closed it: the row states the wheel is fully within the cage, which is the acceptance condition an inspector applies on the spot.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'The fitter\'s position, the airline arrangement and the bay occupancy are each stated, so none is left as an open question.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'This is the §151 J-class requirement met explicitly: the advertised absence is paired with a control observed working in the same observation, which is exactly what RB-F1 lacked and US-J1 had.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'how many tyres does this fitter change in a shift, and does the frequency warrant a different control?',
    whyNotDecisionCritical: 'the control is a physical restraint cage, in use correctly, with the operator outside and to one side and the bay clear. Frequency scales exposure but selects no different action: the cage is the control at any rate, and no plausible figure makes the current arrangement inadequate or suggests a different one.',
    whatMakesItSettled: 'no threshold is in play, the unknown is real, and both branches converge on the same thing being done at this bay today.',
  } },
},

{
  row: row('HS-P1',
    'In the school kitchen the deep-fat fryer is switched off and cold, and the duty chef is '
    + 'draining the oil into a wheeled bin using the fryer\'s own drain tap and hose, with the bin '
    + 'positioned under the tap and the area coned. He is wearing heat-resistant gauntlets and an '
    + 'apron. The fryer\'s high-limit thermostat test record is on the wall and is signed for this '
    + 'term. The observation does not record the fryer\'s make or its oil capacity in litres.',
    ['thermal_burn', 'walking_working_surfaces', 'personal_protective_equipment', 'hot_work'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['thermal_burn', 'walking_working_surfaces',
        'personal_protective_equipment'],
      forbiddenHazardFamilies: ['hot_work'],
      negatedOrSafeStateFamilies: ['thermal_burn'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'NON-DECISION-CRITICAL DETAIL. The make and capacity are genuinely absent and no decision '
        + 'turns on either. Every fact that matters is stated: the fryer is off and COLD, the drain '
        + 'is being used as designed, the bin is positioned, the area is coned and the PPE is worn. '
        + 'The high-limit record is a currency fact, not an open question.' }),
  domain: 'school kitchen fryer',
  form: 'NON_DECISION_CRITICAL_DETAIL',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'The fryer is stated to be off and cold and the drain is being used as designed with the bin positioned and the area coned; the unknown detail is identification, not condition.'),
    sig('NO_UNSTATED_PREMISE', '"Off and cold" is stated directly rather than inferred from the fryer being switched off, which is the premise I would otherwise have needed.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered whether the bin is rated for hot oil and closed it: the row states the oil is cold, which removes the condition that would make the bin material decision-critical.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'The hose, the bin position, the coning and the PPE are each stated with their state, so none is left open.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'The advertised absence concerns the make and capacity, and the invariance is demonstrated by the fryer being stated as cold and the drain method being observed in use.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'what is the fryer\'s oil capacity, and is the bin adequate for that volume?',
    whyNotDecisionCritical: 'the oil is stated as cold and the drain is being used as designed into a positioned bin in a coned area, with gauntlets and apron worn. Capacity scales the volume but selects no different action here, and the thermal condition that would make the bin material decision-critical is stated absent.',
    whatMakesItSettled: 'the fryer\'s state, the drain method, the bin position, the area control and the PPE are each stated and observed; the unknown is a nameplate detail.',
  } },
},

{
  row: row('HS-Q1',
    'In the school science prep room a technician is decanting concentrated hydrochloric acid from '
    + 'a Winchester into a labelled dispensing bottle. She is working inside the prep-room fume '
    + 'cupboard with the sash at the marked working height, and I checked the cupboard\'s airflow '
    + 'with a smoke tube in her presence and it drew fully at the sash opening. Her goggles, apron '
    + 'and nitrile gloves are on and the eyewash station two metres away was run and flowed clear '
    + 'while I watched.',
    ['chemical_inhalation_contact', 'personal_protective_equipment', 'emergency_equipment',
      'suspended_loads'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'personal_protective_equipment',
        'emergency_equipment'],
      forbiddenHazardFamilies: ['suspended_loads'],
      negatedOrSafeStateFamilies: ['chemical_inhalation_contact', 'emergency_equipment'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE EVIDENCE RESOLVES THE APPARENT GAP. The question a coverage habit reaches for -- is the '
        + 'extraction working, is the eyewash working -- is the one the observation answers by '
        + 'DIRECT TEST in the observer\'s presence, twice. Asking it back is disregarding evidence '
        + 'already given, which the prompt names explicitly.' }),
  domain: 'school science prep room',
  form: 'EVIDENCE_RESOLVES_THE_GAP',
  hazardEstablished: false,
  denominators: FORB_DEN,
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'Both controls a decision could turn on were tested in the observer\'s presence: the fume cupboard drew fully on a smoke tube and the eyewash was run and flowed clear.'),
    sig('NO_UNSTATED_PREMISE', 'Nothing is derived; both conclusions rest on witnessed tests rather than on the equipment being present.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered the sash height as a sibling gap and closed it: the row states the sash is at the marked working height and that the draw was checked at that opening, so the condition is stated rather than assumed.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'The PPE, the sash, the airflow and the eyewash each carry their verified state in the sentence that introduces them.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'No advertised-absence wording appears; every relevant fact is asserted positively.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'is the fume cupboard actually extracting adequately, and does the eyewash work?',
    whyNotDecisionCritical: 'both were tested in the inspector\'s presence — the cupboard drew a smoke tube fully at the sash opening in use, and the eyewash was run and flowed clear. The facts are established, so there is nothing to ask.',
    whatMakesItSettled: 'two witnessed functional tests plus the stated sash position and PPE; the apparent gaps are closed by direct evidence in the observation itself.',
  } },
},

// ---- HS-R1 — the residual-defect probe. EXPECTED TO FAIL UNDER v13, and that is recorded.
{
  row: row('HS-R1',
    'A groundworker is using a petrol cut-off saw to cut kerbs in the compound. He is wearing '
    + 'goggles, gloves, ear defenders and a fitted FFP3 mask, and the saw\'s water suppression is '
    + 'connected and running with visible water at the blade. He is cutting in the open air with '
    + 'nobody else within fifteen metres. The observation does not record how many kerbs he is '
    + 'cutting today or for how long.',
    ['chemical_inhalation_contact', 'respiratory_protection', 'noise_exposure', 'fall_protection'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'respiratory_protection',
        'noise_exposure'],
      forbiddenHazardFamilies: ['fall_protection'],
      negatedOrSafeStateFamilies: ['chemical_inhalation_contact'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'THE §151 RESIDUAL-DEFECT PROBE. Duration and quantity are the archetypal magnitude unknown, '
        + 'and the seven NOT-DECISION-CRITICAL shapes name severity refinement explicitly. Every '
        + 'control that duration would bear on -- water suppression, FFP3, hearing protection, open '
        + 'air, distance from others -- is stated as PRESENT AND IN USE, so no duration changes what '
        + 'is done at this cut today. THIS IS THE ROW A v14 CONSEQUENCE-MAGNITUDE REPAIR MUST MOVE, '
        + 'and under v13 it is EXPECTED TO FAIL on the CR-G1 / RB-F1 pattern. Recording that '
        + 'expectation here means a failure confirms the §151 diagnosis rather than surprising it.' }),
  domain: 'kerb cutting with water suppression',
  form: 'SEVERITY_REFINEMENT_ONLY',
  hazardEstablished: false,
  denominators: FORB_DEN,
  expectedToFailUnderV13:
    'EXPECTED FAIL under v13. §151 established CONSEQUENCE-MAGNITUDE ROUTING as the residual defect: '
    + '§147 CR-G1 asked shift throughput and §150 RB-F1 asked rated payload, both on rows where the '
    + 'control was settled, and both were labelled HAZARD_SEVERITY by the model itself. This row is '
    + 'that shape on fresh facts. A speaking result CONFIRMS the diagnosis; a silent result FALSIFIES '
    + 'it and v14 should not be built.',
  review: [
    sig('ESTABLISHED_OR_DECISION_INVARIANT', 'Duration is genuinely unknown and every control it would bear on is stated as present and in use, so the answer selects no different action.'),
    sig('NO_UNSTATED_PREMISE', 'The invariance rests on stated facts — suppression running with visible water, FFP3 fitted, open air, fifteen metres of separation — not on an assumption about exposure limits.'),
    sig('NO_SIBLING_DECISION_CRITICAL_GAP', 'I considered whether the FFP3 is face-fitted and closed it deliberately by writing "fitted"; leaving that open would have created a real RB-H1-class gap and invalidated the control.'),
    sig('WORDING_CREATES_NO_OPPORTUNITY', 'Every control carries its state in the same sentence that introduces it, and no entity is named whose condition is left open.'),
    sig('ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED', 'The advertised absence is duration, and the invariance is demonstrated in the same observation by the suppression running with visible water and the FFP3 being fitted and worn — the §151 J-class condition RB-F1 failed.'),
  ],
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'how many kerbs is he cutting and for how long, and does the duration change the control required?',
    whyNotDecisionCritical: 'every control duration would bear on is already in place and observed: water suppression running with visible water at the blade, a fitted FFP3, hearing protection, open air and fifteen metres to the nearest person. A longer or shorter task selects no different action at this cut, and the corrective step at any duration is the same as the current arrangement.',
    whatMakesItSettled: 'the unknown is duration alone, which is magnitude; the seven NOT-DECISION-CRITICAL shapes name severity refinement that does not change what is done now, and every control the magnitude would govern is stated as present and in use.',
  } },
},

];

export const HARDENED_ROWS: readonly FormalCohortRow[] = HARDENED_FIXTURES.map(f => f.row);

export function hardenedFixtureByRowId(rowId: string): HardenedFixture | undefined {
  return HARDENED_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * THE SET IS UNSPENT AND ITS BUDGET IS NOT YET AUTHORIZED.
 *
 * No budget or gate constants are exported. §151 is a zero-spend operation and a hosted probe against
 * this set needs its own authorization, which will set the budget then. Declaring one here would
 * imply a spend decision that has not been made.
 */
export const HARDENED_SET_STATUS = {
  spent: false,
  hostedAuthorization: 'NOT_GRANTED',
  authoredUnder: 'hazlenz.expert.prompt.v13',
  note: 'Digest frozen prospectively in §151 so a later run is provably against the reviewed '
    + 'material. Linted mechanically and signed per row; a green lint is NOT a validated set.',
} as const;
