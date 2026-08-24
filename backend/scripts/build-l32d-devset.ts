/**
 * L3-2d -- the DEVELOPMENT fixture set. TUNING ARTIFACT ONLY, never advancement evidence.
 *
 * It carries every regression fixture the L3-2d entry contract names, so a repair that closes D1 or
 * D2 by breaking something L3-2b or L3-2c proved is caught before the sealed holdout is opened.
 * Scenarios are drawn from the OPENED sets (L3-2, L3-2b, L3-2c), which is exactly what an opened
 * holdout is still good for.
 *
 * Run: npx ts-node scripts/build-l32d-devset.ts
 */
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval/development-l32d.json');
const NON_ACTIVE = ['CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

const S = (id: string, cohort: string, regime: string, text: string, expect: Record<string, unknown>) =>
  ({ id, source: 'L3-2d development (drawn from opened sets)', provenanceClass: 'DEVELOPMENT' as const, cohort, failureMode: cohort, regime, text, expect });

const SCENARIOS = [
  // ---- D2: the regression and its class
  S('H-NG-02', 'd2_negation_then_fact', 'osha-general-industry',
    'There was no standing water anywhere on the shop floor, and the flexible cord feeding the pedestal fan has its outer jacket worn through to the conductors.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false }),
  S('H-NG-03', 'd2_negation_then_fact', 'osha-general-industry',
    'The rack uprights showed no impact damage, however the top beam clip on bay nine has popped out of its slot and the beam is resting on one connector.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'material_handling|walking_working_surfaces', clarificationExpected: false }),
  S('C-NG-05', 'd2_negation_then_fact', 'osha-general-industry',
    'The extension ladder showed no split rails, however the shoes are worn smooth and it was set at close to eighty degrees on a painted floor.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|ladders', clarificationExpected: false }),

  // ---- D1: the four unnecessary clarifications
  S('C-FLD-138', 'd1_must_not_ask', 'osha-general-industry',
    'A shop mechanic is performing heavy solvent degreasing in an enclosed room with no local exhaust ventilation.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ventilation|chemical_storage|hazard_communication|respiratory', clarificationExpected: false }),
  S('C-CS-05', 'd1_must_not_ask', 'osha-general-industry',
    'If the level probe on the caustic tank were to fail closed during a transfer, the vent could pressurise and lift the manway gasket.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false }),
  S('C-AM-04', 'd1_must_not_ask', 'osha-general-industry',
    'The ladder cage on the silo did not look right to me and the third hoop has parted from the stringer with the fixings pulled clean through.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|ladders', highConsequence: true, clarificationExpected: false }),
  S('C-AM-06', 'd1_must_not_ask', 'osha-general-industry',
    'The tongue guard on the bench grinder is gone; I could not say whether maintenance removed it or it broke off.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false }),

  // ---- the three genuinely required clarifications -- must survive the repair
  S('H-AM-01', 'required_clarification', 'osha-general-industry',
    'The overhead door track struck me as odd when I walked underneath it.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true }),
  S('H-AM-02', 'required_clarification', 'osha-general-industry',
    'One of the sling legs on the spreader bar may be cut.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true }),
  S('H-AM-03', 'required_clarification', 'unknown',
    'There was a puddle of something under the parts washer and I could not tell what it was or where it came from.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true }),

  // ---- L3-2c R1/R2 fixtures that must not regress
  S('H-AM-05', 'l32c_r1', 'osha-general-industry',
    'The mezzanine gate did not look right to me and the lower hinge pin is sheared off with the gate hanging on the top hinge alone.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls|machine_guarding', highConsequence: true, clarificationExpected: false }),
  S('H-FLD-141', 'l32c_r2', 'osha-general-industry',
    'Crew was changing the knives on the granulator; no LOTO is applied and the guard is missing.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|loto_stored_energy', highConsequence: true, clarificationExpected: false }),
  S('B08', 'l32b_negation_scope', 'osha-construction',
    'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refueling from a portable cylinder.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'personal_protective_equipment|compressed_gas_cylinders|scaffolds|falls', minCandidates: 2, maxCandidates: 4, highConsequence: true, clarificationExpected: false }),
  S('C11', 'l32b_negation_scope', 'osha-general-industry',
    'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing, extinguisher in the area was last inspected 2 yrs ago per the tag',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'fire|hot_work|housekeeping|chemical_storage|walking_working_surfaces', minCandidates: 1, maxCandidates: 4, clarificationExpected: false }),
  S('B10', 'l32b_subjective', 'osha-general-industry',
    'The rail on the platform did not look right to me.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true }),
  S('RC-08', 'l32b_negated_list', 'osha-construction',
    'Steel erectors were connecting at the second tier with no guardrail, safety net or personal fall arrest system in use.',
    { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|scaffolds', highConsequence: true, clarificationExpected: false }),

  // ---- negative controls and corrected/controlled states
  S('DEVNC-01', 'negative_control', 'osha-general-industry',
    'Every point of operation on the punch press line is enclosed by a fixed barrier guard, the interlocks were function tested at the start of shift, and the test log was signed.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true }),
  S('DEVNC-02', 'negative_control', 'osha-general-industry',
    'The whole grinding bay looked right to me and the wheel guards are all fitted with the tool rests set within an eighth of an inch.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true }),
  S('DEVNC-03', 'negative_control', 'osha-general-industry',
    'The guarding survey of the wrapping line found no exposed nip points and no reachable rotating shafts anywhere on the machine.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true }),
  S('DEVCS-01', 'condition_state', 'osha-general-industry',
    'The chipper infeed was de-energized at the disconnect, both millwrights hung personal locks, and the stored spring tension was released and verified before the housing came off.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false }),
  S('DEVCS-02', 'condition_state', 'osha-general-industry',
    'The scissor lift was red tagged and taken out of service after the pothole protection failed to deploy during the function check.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false }),
  S('DEVCS-03', 'condition_state', 'osha-general-industry',
    'A shop-made extension lead with a taped joint was found at the weld bay and the electrician cut it out of service and issued a factory assembled lead before we left the area.',
    { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false }),
];

const set = {
  setId: 'l3-2d-development-2026-08-22',
  role: 'DEVELOPMENT',
  note: 'TUNING ARTIFACT ONLY. Drawn from the OPENED L3-2/L3-2b/L3-2c sets. These results are never advancement evidence.',
  composition: {
    total: SCENARIOS.length,
    clarificationExpected: SCENARIOS.filter(s => s.expect.clarificationExpected === true).length,
    clarificationMustBeWithheld: SCENARIOS.filter(s => s.expect.clarificationExpected === false).length,
  },
  scenarios: SCENARIOS,
};
const body = JSON.stringify(set, null, 2) + '\n';
writeFileSync(OUT, body);
console.log(JSON.stringify({ out: OUT, sha256: createHash('sha256').update(body).digest('hex'), composition: set.composition }, null, 2));
