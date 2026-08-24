/**
 * L3-2f -- builds the SIXTH AND FINAL FRESH SEALED HOLDOUT from the current field corpus.
 *
 * `INDEPENDENT_EVIDENCE_EXHAUSTION`. Stride `i % 5 === 3` is the LAST untouched stride over
 * `safescope-field-validation-dataset.v1.json`. L3-2b took `i%5===0`, L3-2c `i%5===2`, L3-2d
 * `i%5===4`, L3-2e `i%5===1`. After this build **the current field dataset is exhausted for fresh
 * evaluation** and no prior field scenario may be reused as fresh evidence again.
 *
 * PROVENANCE, IN THREE SEPARATELY REPORTED PARTS -- the L3-2e contract, unchanged.
 *
 *  A. INDEPENDENT -- stride `i % 5 === 3`, the rule L3-2e's NEXT_ACTION.md named in advance. This
 *     stride finally brings in `mobile_equipment`, the last of the field dataset's six families that
 *     no sealed set had ever drawn from.
 *
 *  B. AUTHORED COMPLEMENT -- the semantic categories the field sample cannot carry: predicate scope,
 *     noun-phrase terminators, token boundaries, nominal corrections, weak vs effective control,
 *     observation availability, negative controls, corrected/control-in-place states, clarification.
 *     The FIFTH phase running to carry this, and still the programme's largest methodological
 *     weakness -- recorded, not concealed.
 *
 *  C. TARGETED FAMILY COMPLEMENT -- reported SEPARATELY. `noise_exposure` is the one family still
 *     `NOT_YET_SEALED_VALIDATED`, and only because L3-2e's substring defect (DISC-06) deleted its
 *     single scenario. It is carried here in strength, together with the eight families that passed
 *     L3-2e only under a permitted ALTERNATIVE label rather than their own.
 *
 * FROZEN BEFORE THE REPAIR CODE. Every expectation below was declared before a single line of L3-2f
 * implementation was written, and the file is byte-compared after the acceptance run.
 *
 * Run: npx ts-node scripts/build-l32f-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const FIELD = join(REPO, 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const EVAL = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval');
const OUT = join(EVAL, 'holdout-l32f.json');

const HIGH_CONSEQUENCE = [
  'fall', 'trench', 'excavation', 'cave_in', 'loto', 'energy', 'confined',
  'electrical', 'struck_by', 'mobile_equipment', 'scaffold', 'hole', 'opening',
  'impalement', 'rebar', 'explosion', 'ground_control',
];
const NON_ACTIVE = ['CONTROLLED', 'CORRECTED', 'REMOVED_FROM_SERVICE', 'NEGATED', 'HYPOTHETICAL', 'INSUFFICIENT_EVIDENCE', 'UNKNOWN'];

const FAMILY_ALIAS: Record<string, string> = {
  machine_guarding: 'machine_guarding',
  electrical: 'electrical',
  fall_protection: 'falls|scaffolds|walking_working_surfaces',
  hazcom: 'hazard_communication|chemical_storage',
  mobile_equipment: 'mobile_equipment',
  slip_trip_fall: 'walking_working_surfaces|falls',
};
const REGIME: Record<string, string> = {
  msha: 'msha', osha_general_industry: 'osha-general-industry', osha_construction: 'osha-construction',
};

type Prov = 'INDEPENDENT' | 'AUTHORED_COMPLEMENT' | 'TARGETED_FAMILY_COMPLEMENT';
interface Scenario {
  id: string; source: string; provenanceClass: Prov;
  cohort: string; failureMode: string; regime: string; text: string;
  expect: Record<string, unknown>;
}
const A = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2f implementation phase', provenanceClass: 'AUTHORED_COMPLEMENT' });
const T = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2f implementation phase for FAMILY COVERAGE ONLY', provenanceClass: 'TARGETED_FAMILY_COMPLEMENT' });

// ---------------------------------------------------------------- B: authored complement

const COMPLEMENT: Scenario[] = [
  // ===== F1: PREDICATE SCOPE. A negation followed by a comma and a genuinely new predication.
  // Each defect fixture is paired with a list continuation that must STAY inside the scope.
  A({ id: 'F-PS-01', cohort: 'predicate_scope', failureMode: 'irregular finite verb after the comma ends the scope', regime: 'osha-general-industry',
    text: 'No purge certificate was raised for the digester, and the boilermaker went down the access ladder with the sludge line still open.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'went', scopeMustEndAtComma: true } }),
  A({ id: 'F-PS-02', cohort: 'predicate_scope', failureMode: 'PAIR: coordinated negated list must CROSS its commas', regime: 'osha-construction',
    text: 'The two slingers were working under the suspended load with no exclusion zone, tag line or banksman in position.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|struck_by|material_handling', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'none -- bare noun phrase', scopeMustEndAtComma: false } }),
  A({ id: 'F-PS-03', cohort: 'predicate_scope', failureMode: 'second irregular finite verb, different lexical item', regime: 'osha-construction',
    text: 'No edge protection had been signed off for the sixth lift, and the plasterer fell against the temporary handrail which gave way at the coupler.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|scaffolds|walking_working_surfaces', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'fell', scopeMustEndAtComma: true } }),
  A({ id: 'F-PS-04', cohort: 'predicate_scope', failureMode: 'PAIR: same verb lemma used NON-predicatively inside a noun phrase', regime: 'osha-general-industry',
    text: 'The audit found no fall from height reported for the quarter and no lost time injury on any shift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, predicateUnderTest: 'fall as NP head, not a predicate', scopeMustEndAtComma: false } }),
  A({ id: 'F-PS-05', cohort: 'predicate_scope', failureMode: 'copular predicate after the comma (already correct today; must stay correct)', regime: 'osha-general-industry',
    text: 'No hot work permit was displayed at the tank farm, and the welder was standing on the bund wall cutting a redundant branch line.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'welding_cutting_hot_work|fire_explosion', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'was', scopeMustEndAtComma: true } }),
  A({ id: 'F-PS-06', cohort: 'predicate_scope', failureMode: 'irregular finite verb in a SIBLING clause joined by a bare conjunction', regime: 'osha-general-industry',
    text: 'No isolation certificate was raised for the press and the setter took the interlock key out of the gate switch to keep the ram running.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'loto_stored_energy|machine_guarding', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'took', scopeMustEndAtComma: false } }),
  A({ id: 'F-PS-07', cohort: 'predicate_scope', failureMode: 'PAIR: bare conjunction continuing a negated list must NOT end the scope', regime: 'osha-construction',
    text: 'The roofers were working at the verge with no guardrail and no harness anchor point within reach of the working position.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false, predicateUnderTest: 'none', scopeMustEndAtComma: false } }),
  A({ id: 'F-PS-08', cohort: 'predicate_scope', failureMode: 'irregular verb used ATTRIBUTIVELY, not as a predicate', regime: 'osha-general-industry',
    text: 'The drive coupling on the number two extractor is running with no coupling cover and a broken retaining clip left on the base frame.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, predicateUnderTest: 'broken as attributive modifier', scopeMustEndAtComma: false } }),

  // ===== F2: NOUN-PHRASE TERMINATORS. The head must resolve before ANY preposition.
  A({ id: 'F-NT-01', cohort: 'np_terminator', failureMode: 'negated hazard head before an UNLISTED preposition (against)', regime: 'osha-general-industry',
    text: 'The quarterly audit of the solvent store recorded no deficiencies against the flammable liquids standard and no outstanding actions from the previous visit.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, headUnderTest: 'deficiencies' } }),
  A({ id: 'F-NT-02', cohort: 'np_terminator', failureMode: 'negated hazard head before a second unlisted preposition (beyond)', regime: 'osha-general-industry',
    text: 'The strip-down of the gearbox showed no defects beyond the input bearing housing and the unit was returned to the line.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, headUnderTest: 'defects' } }),
  A({ id: 'F-NT-03', cohort: 'np_terminator', failureMode: 'PAIR: a negated CONTROL before the same preposition IS an active hazard', regime: 'osha-construction',
    text: 'There was no toe board against the open edge of the loading platform where the blocks were being landed.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces|scaffolds', highConsequence: true, clarificationExpected: false, headUnderTest: 'toe board -- a CONTROL, not a hazard object' } }),
  A({ id: 'F-NT-04', cohort: 'np_terminator', failureMode: 'negated hazard head before a third unlisted preposition (regarding)', regime: 'osha-general-industry',
    text: 'The contractor review raised no concerns regarding the scaffold handover certificate and the tags were all current.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, headUnderTest: 'concerns' } }),

  // ===== F3: TOKEN BOUNDARY. A stem may not match inside a longer, different word.
  A({ id: 'F-TB-01', cohort: 'token_boundary', failureMode: 'issue inside issued -- the DISC-06 shape, on a fresh hazard', regime: 'osha-general-industry',
    text: 'The two chippers worked the whole shift in the fettling bay with no ear defenders issued to either of them.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure|personal_protective_equipment', clarificationExpected: false, coversFamily: 'noise_exposure', headUnderTest: 'defenders' } }),
  A({ id: 'F-TB-02', cohort: 'token_boundary', failureMode: 'PAIR: the same stem as a genuine negated hazard head', regime: 'osha-general-industry',
    text: 'The pre-start inspection of the fettling bay recorded no issue with any of the extraction hoods.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, headUnderTest: 'issue' } }),
  A({ id: 'F-TB-03', cohort: 'token_boundary', failureMode: 'harm inside harmless', regime: 'osha-general-industry',
    text: 'The bund contained no harmless residue at all; it was holding about two inches of waste thinners with the drain valve open to the yard.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'chemical_storage|hazard_communication', clarificationExpected: false, headUnderTest: 'residue' } }),
  A({ id: 'F-TB-04', cohort: 'token_boundary', failureMode: 'access inside accessory', regime: 'osha-general-industry',
    text: 'The bench grinder has no accessory tool rest fitted and the wheel gap is opened out to about half an inch.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, headUnderTest: 'tool rest' } }),
  A({ id: 'F-TB-05', cohort: 'token_boundary', failureMode: 'trailing participle must not be taken as the NP head', regime: 'osha-construction',
    text: 'The gang were setting formwork over the void with no fall arrest equipment fitted to any of the harnesses.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false, headUnderTest: 'equipment' } }),

  // ===== F4: NOMINAL CORRECTIONS vs CONTROL MENTION.
  A({ id: 'F-NC-01', cohort: 'nominal_control', failureMode: 'correction expressed as the OBJECT of an action verb', regime: 'osha-general-industry',
    text: 'The frayed lifting sling was cut from the crane hook at the start of the shift and the rigger drew a replacement from the stores cage before the next lift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, expectedStateHint: 'CORRECTED', clarificationExpected: false, correctedStateControl: true } }),
  A({ id: 'F-NC-02', cohort: 'nominal_control', failureMode: 'PAIR: correction expressed as a verb (already correct today)', regime: 'osha-general-industry',
    text: 'The frayed lifting sling was taken off the crane hook at the start of the shift and was replaced from the stores cage before the next lift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, expectedStateHint: 'CORRECTED', clarificationExpected: false, correctedStateControl: true } }),
  A({ id: 'F-NC-03', cohort: 'nominal_control', failureMode: 'NEGATION GUARD: a negated nominal correction is not a correction', regime: 'osha-general-industry',
    text: 'The frayed lifting sling is still rigged on the crane hook and no replacement has been drawn from the stores cage.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|material_handling', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'F-NC-04', cohort: 'nominal_control', failureMode: 'MENTION GUARD: naming a procedure corrects nothing', regime: 'osha-general-industry',
    text: 'The supervisor talked the crew through the sling replacement procedure while the frayed sling stayed rigged on the crane hook for the rest of the shift.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|material_handling', highConsequence: true, clarificationExpected: false, controlMentionOnly: true } }),

  // ===== F6: WEAK CONTROL vs EFFECTIVE CONTROL. The axis, from both ends.
  A({ id: 'F-WC-01', cohort: 'control_adequacy', failureMode: 'warning tape offered against an open physical hazard', regime: 'osha-construction',
    text: 'A riser opening on the third floor slab has hazard tape strung between two stub columns across it and nothing else over the hole.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false, controlAdequacy: 'WARNING_ONLY' } }),
  A({ id: 'F-WC-02', cohort: 'control_adequacy', failureMode: 'signage offered against an open physical hazard', regime: 'osha-general-industry',
    text: 'A DANGER OPEN PIT sign is fixed to the handrail post beside the inspection pit in the workshop floor and the pit is left open across the walkway.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', highConsequence: true, clarificationExpected: false, controlAdequacy: 'WARNING_ONLY' } }),
  A({ id: 'F-WC-03', cohort: 'control_adequacy', failureMode: 'briefing/administrative notice offered against a physical hazard', regime: 'osha-general-industry',
    text: 'The missing floor plate at the end of the mezzanine walkway was raised in the morning briefing and the crew were told to step around it.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', highConsequence: true, clarificationExpected: false, controlAdequacy: 'ADMINISTRATIVE_ONLY' } }),
  A({ id: 'F-WC-04', cohort: 'control_adequacy', failureMode: 'COUNTER: a genuinely effective ENGINEERING control', regime: 'osha-construction',
    text: 'The riser opening on the third floor slab is closed with a load-rated steel plate bolted down at all four corners and painted with the hole reference.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, controlAdequacy: 'EFFECTIVE' } }),
  A({ id: 'F-WC-05', cohort: 'control_adequacy', failureMode: 'COUNTER: a second genuinely effective engineering control', regime: 'osha-general-industry',
    text: 'The inspection pit in the workshop floor is fitted with a fixed double guardrail and toeboard on all open sides and the gate is latched shut.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, controlAdequacy: 'EFFECTIVE' } }),
  A({ id: 'F-WC-06', cohort: 'control_adequacy', failureMode: 'warning present AND effective control also present -- must NOT become active', regime: 'osha-construction',
    text: 'The stair void is boarded over with a secured plywood deck screwed to the joists and warning tape is run around the edge of the deck as well.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, controlAdequacy: 'EFFECTIVE_PLUS_WARNING' } }),
  A({ id: 'F-WC-07', cohort: 'control_adequacy', failureMode: 'absent control encoded MORPHOLOGICALLY (un- prefix), reassuring clause first', regime: 'osha-general-industry',
    text: 'The extraction readings were all within limits at the bench, and the operator was reaching across an unguarded drive belt to clear a jam.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, controlAdequacy: 'ABSENT_MORPHOLOGICAL' } }),
  A({ id: 'F-WC-08', cohort: 'control_adequacy', failureMode: 'second morphological absence, reassuring clause first, high consequence', regime: 'osha-construction',
    text: 'The permit board was fully signed for the lift, and the banksman was standing on an unprotected slab edge to guide the load in.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|walking_working_surfaces', highConsequence: true, clarificationExpected: false, controlAdequacy: 'ABSENT_MORPHOLOGICAL' } }),
  A({ id: 'F-WC-09', cohort: 'control_adequacy', failureMode: 'PPE offered where an engineering control is the required one', regime: 'osha-general-industry',
    text: 'The operators on the swage press have been issued gloves and told to keep their hands clear, and the two-hand control on the press has been strapped down with tape.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|loto_stored_energy', highConsequence: true, clarificationExpected: false, controlAdequacy: 'PPE_AGAINST_DEFEATED_ENGINEERING_CONTROL' } }),

  // ===== F5: OBSERVATION AVAILABILITY. Preserved from L3-2e, varied against decision-criticality.
  A({ id: 'F-OA-01', cohort: 'observation_availability', failureMode: 'unobserved fact IS the deciding fact', regime: 'osha-construction',
    text: 'A man was working from the boom platform over the river frontage and I could not tell from the bank whether his lanyard was clipped to the basket.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: true } }),
  A({ id: 'F-OA-02', cohort: 'observation_availability', failureMode: 'unobserved fact IS the deciding fact, energy isolation', regime: 'osha-general-industry',
    text: 'A lockout hasp was hanging on the feeder isolator but I had no way of telling whether the breaker behind it had actually been racked out.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: true } }),
  A({ id: 'F-OA-03', cohort: 'observation_availability', failureMode: 'unobserved fact decides NOTHING; hazard plainly stated', regime: 'osha-general-industry',
    text: 'The tail drum on the picking belt is turning with the nip completely open to the walkway; I could not make out the machine number on the guard bracket.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: false } }),
  A({ id: 'F-OA-04', cohort: 'observation_availability', failureMode: 'reassuring clause FIRST, hazard asserted second -- the E-OA-07 shape, fresh wording', regime: 'msha',
    text: 'The dust suppression sprays were running at the crusher, and the loader operator was tramming along the high wall bench with the bench edge broken away under the outer wheel.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'mobile_equipment|ground_control', highConsequence: true, clarificationExpected: false, observationAvailability: 'OBSERVED', clausePositionTrap: true } }),
  A({ id: 'F-OA-05', cohort: 'observation_availability', failureMode: 'reassuring clause first AND morphological absence second -- the exact E-OA-07 interaction', regime: 'msha',
    text: 'The gas detector read clear at the ramp bottom, and the bolting crew were working under an unsupported back that had already taken weight at the last cut.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ground_control', highConsequence: true, clarificationExpected: false, observationAvailability: 'OBSERVED', clausePositionTrap: true, controlAdequacy: 'ABSENT_MORPHOLOGICAL' } }),

  // ===== NEGATIVE CONTROLS and CORRECTED / CONTROL-IN-PLACE states.
  A({ id: 'F-NEG-01', cohort: 'negative_control', failureMode: 'clean inspection, nothing to find', regime: 'osha-general-industry',
    text: 'The weekly check of the compressor house found the belt guards secure, the receiver certificate in date and the relief valve test tag current.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'F-NEG-02', cohort: 'negative_control', failureMode: 'genuinely negated hazard, plainly worded', regime: 'osha-construction',
    text: 'The excavation was walked at the end of the shift and no cracking, slumping or water ingress was found anywhere along either batter.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'F-NEG-03', cohort: 'negative_control', failureMode: 'equipment genuinely withdrawn from service', regime: 'osha-general-industry',
    text: 'The forklift with the cracked mast channel was driven to the yard, tagged out and taken out of service pending the repair.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'F-CIP-01', cohort: 'control_in_place', failureMode: 'energy isolation genuinely in place', regime: 'osha-general-industry',
    text: 'The mixer was shut down, locked out at the local isolator and the drive proved dead at the terminals before the paddle was drawn.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, correctedStateControl: true } }),
  A({ id: 'F-CIP-02', cohort: 'control_in_place', failureMode: 'physical guarding genuinely in place', regime: 'osha-general-industry',
    text: 'The rotating shaft on the number four agitator is fully enclosed by a bolted sheet steel cover and the interlock was proved on the test run.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, correctedStateControl: true } }),
  A({ id: 'F-COR-01', cohort: 'corrected_state', failureMode: 'hazard existed and was fixed during the visit', regime: 'osha-general-industry',
    text: 'The missing knockout blank on the distribution board was found during the walk and a proper blanking plate was fitted before we left the room.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, expectedStateHint: 'CORRECTED', clarificationExpected: false, correctedStateControl: true } }),

  // ===== CLARIFICATION: required, and deliberately withheld.
  A({ id: 'F-CL-01', cohort: 'clarification', failureMode: 'pure impression, no fact stated -- a question is owed', regime: 'osha-general-industry',
    text: 'The anchor bracket on the davit arm did not look right to me.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  A({ id: 'F-CL-02', cohort: 'clarification', failureMode: 'PAIR: impression BESIDE a hard fact -- no question owed', regime: 'osha-general-industry',
    text: 'The anchor bracket on the davit arm did not look right to me and two of the four holding-down bolts are missing from the base plate.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|falls|material_handling', highConsequence: true, clarificationExpected: false } }),
  A({ id: 'F-CL-03', cohort: 'clarification', failureMode: 'hedge governs the only predication there is', regime: 'osha-general-industry',
    text: 'One of the chain slings on the rack might be stretched.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true } }),
  A({ id: 'F-CL-04', cohort: 'clarification', failureMode: 'decided ACTIVE -- a question here would be unnecessary', regime: 'osha-general-industry',
    text: 'The chain sling on the second rack has three stretched links and the safe working load tag has been ground off the master link.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|material_handling', highConsequence: true, clarificationExpected: false } }),

  // ===== MULTI-HAZARD.
  A({ id: 'F-MH-01', cohort: 'multi_hazard', failureMode: 'two genuinely independent hazards in one note', regime: 'osha-general-industry',
    text: 'The bench grinder wheel gap is opened out to half an inch, and separately the emergency exit at the end of the same bay is blocked by four stillages of finished castings.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|emergency_egress', clarificationExpected: false, minimumCandidates: 2 } }),
];

// ---------------------------------------------------------------- C: targeted family complement

const TARGETED: Scenario[] = [
  // noise_exposure -- the one family still NOT_YET_SEALED_VALIDATED. Carried in strength.
  T({ id: 'F-FAM-NOISE-01', cohort: 'family_coverage', failureMode: 'noise_exposure, engineering control absent', regime: 'osha-general-industry',
    text: 'The shot blast cabinet has been running all week with the acoustic door seal split right along the bottom edge and the operator stands at the panel beside it.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure', clarificationExpected: false, coversFamily: 'noise_exposure' } }),
  T({ id: 'F-FAM-NOISE-02', cohort: 'family_coverage', failureMode: 'noise_exposure, hearing protection not provided', regime: 'osha-general-industry',
    text: 'Both pedestal grinders in the fettling bay were being run continuously and neither operator had any hearing protection on.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure|personal_protective_equipment', clarificationExpected: false, coversFamily: 'noise_exposure' } }),
  T({ id: 'F-FAM-NOISE-03', cohort: 'family_coverage', failureMode: 'noise_exposure, measured level stated', regime: 'msha',
    text: 'The sound level at the primary crusher operator station was logged at ninety eight decibels for the whole shift and no hearing conservation controls are in use there.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure', highConsequence: false, clarificationExpected: false, coversFamily: 'noise_exposure' } }),
  // Families that passed L3-2e only under a permitted ALTERNATIVE label.
  T({ id: 'F-FAM-CS-01', cohort: 'family_coverage', failureMode: 'confined_space, exact label sought', regime: 'osha-general-industry',
    text: 'A man was working inside the reactor vessel through the side manway with no attendant posted at the opening and no rescue harness rigged.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space', highConsequence: true, clarificationExpected: false, coversFamily: 'confined_space' } }),
  T({ id: 'F-FAM-GC-01', cohort: 'family_coverage', failureMode: 'ground_control, exact label sought', regime: 'msha',
    text: 'A slab of the rib has parted from the pillar line along the main haulage road and is standing off about four inches with no strapping or mesh over it.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ground_control', highConsequence: true, clarificationExpected: false, coversFamily: 'ground_control' } }),
  T({ id: 'F-FAM-HC-01', cohort: 'family_coverage', failureMode: 'hazard_communication, exact label sought', regime: 'osha-general-industry',
    text: 'Four decanted jerry cans of solvent are standing on the mixing bench with no product identity or hazard pictogram written on any of them.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'hazard_communication', clarificationExpected: false, coversFamily: 'hazard_communication' } }),
  T({ id: 'F-FAM-LR-01', cohort: 'family_coverage', failureMode: 'lifting_rigging, exact label sought', regime: 'osha-construction',
    text: 'The two-leg chain sling on the tower crane hook has a stretched and gouged link in the upper leg and the load was landed on it twice this morning.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging', highConsequence: true, clarificationExpected: false, coversFamily: 'lifting_rigging' } }),
  T({ id: 'F-FAM-MH-01', cohort: 'family_coverage', failureMode: 'material_handling, exact label sought', regime: 'osha-general-industry',
    text: 'The top tier of the pallet racking in the despatch aisle is loaded two pallets deep with no back stop and the beams are visibly bowed.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'material_handling', clarificationExpected: false, coversFamily: 'material_handling' } }),
  T({ id: 'F-FAM-PPE-01', cohort: 'family_coverage', failureMode: 'personal_protective_equipment, exact label sought', regime: 'osha-general-industry',
    text: 'The operator decanting the caustic concentrate at the dosing skid was wearing no face shield and no chemical gauntlets, only ordinary work gloves.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'personal_protective_equipment', clarificationExpected: false, coversFamily: 'personal_protective_equipment' } }),
  T({ id: 'F-FAM-WCH-01', cohort: 'family_coverage', failureMode: 'welding_cutting_hot_work, exact label sought', regime: 'osha-general-industry',
    text: 'A fitter was burning off a seized bracket beside the paint kitchen door with no fire watch posted and no extinguisher within reach of the work.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'welding_cutting_hot_work|fire_explosion', highConsequence: true, clarificationExpected: false, coversFamily: 'welding_cutting_hot_work' } }),
  T({ id: 'F-FAM-ME-01', cohort: 'family_coverage', failureMode: 'mobile_equipment high-consequence, exact label sought', regime: 'msha',
    text: 'The haul truck was reversing to the tip head with no spotter and the berm along the edge is down to about half wheel height for twenty metres.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'mobile_equipment', highConsequence: true, clarificationExpected: false, coversFamily: 'mobile_equipment' } }),
];

// ---------------------------------------------------------------- build

function main(): void {
  const fieldRaw = readFileSync(FIELD, 'utf8');
  const field = (JSON.parse(fieldRaw) as any[])
    .filter(s => s && typeof s.observationText === 'string')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const sampled = field.filter((_, i) => i % 5 === 3);

  const scenarios: Scenario[] = [];
  for (const s of sampled) {
    const pattern = FAMILY_ALIAS[s.expectedHazardFamily] ?? s.expectedHazardFamily;
    scenarios.push({
      id: `F-FLD-${String(s.id).replace('FIELD-', '')}`,
      source: 'safescope-field-validation-dataset.v1.json (independent, never run against Level-3)',
      provenanceClass: 'INDEPENDENT',
      cohort: 'field_positive',
      failureMode: `${s.expectedHazardFamily} / ${s.expectedScenarioFamily ?? 'n/a'}`,
      regime: REGIME[s.jurisdiction] ?? 'unknown',
      text: s.observationText,
      expect: {
        hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: pattern,
        highConsequence: HIGH_CONSEQUENCE.some(k => pattern.includes(k)),
        clarificationExpected: false, sourceRiskBand: s.expectedRiskBand ?? null,
      },
    });
  }
  scenarios.push(...COMPLEMENT, ...TARGETED);

  // ---- freshness, enforced with a throw. ALL FIVE prior sealed sets and ALL THREE development sets.
  const PRIOR = ['holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'holdout-l32d.json',
    'holdout-l32e.json', 'development-l32.json', 'development-l32d.json', 'development-l32e.json'];
  const priorTexts = new Set<string>(); const priorIds = new Set<string>();
  const overlapBySet: Record<string, { ids: number; texts: number }> = {};
  for (const f of PRIOR) {
    const prior = JSON.parse(readFileSync(join(EVAL, f), 'utf8')) as { scenarios: Array<{ id: string; text: string }> };
    const ids = new Set(prior.scenarios.map(s => s.id));
    const texts = new Set(prior.scenarios.map(s => s.text.trim()));
    overlapBySet[f] = {
      ids: scenarios.filter(s => ids.has(s.id)).length,
      texts: scenarios.filter(s => texts.has(s.text.trim())).length,
    };
    for (const s of prior.scenarios) { priorTexts.add(s.text.trim()); priorIds.add(s.id); }
  }
  const textClash = scenarios.filter(s => priorTexts.has(s.text.trim())).map(s => s.id);
  const idClash = scenarios.filter(s => priorIds.has(s.id)).map(s => s.id);
  const selfDupText = scenarios.map(s => s.text.trim()).filter((t, i, a) => a.indexOf(t) !== i);
  const selfDupId = scenarios.map(s => s.id).filter((t, i, a) => a.indexOf(t) !== i);
  if (textClash.length || idClash.length || selfDupText.length || selfDupId.length) {
    throw new Error(`not fresh -- text ${JSON.stringify(textClash)} id ${JSON.stringify(idClash)} dupText ${JSON.stringify(selfDupText)} dupId ${JSON.stringify(selfDupId)}`);
  }

  const byProvenance = scenarios.reduce<Record<string, number>>((a, s) => { a[s.provenanceClass] = (a[s.provenanceClass] || 0) + 1; return a; }, {});
  const byCohort = scenarios.reduce<Record<string, number>>((a, s) => { a[s.cohort] = (a[s.cohort] || 0) + 1; return a; }, {});
  const familyMix = sampled.reduce<Record<string, number>>((a, s) => { a[s.expectedHazardFamily] = (a[s.expectedHazardFamily] || 0) + 1; return a; }, {});

  const holdout = {
    setId: 'l3-2f-sealed-holdout-2026-08-23',
    role: 'FINAL_SEALED_HOLDOUT',
    visibleDuringTuning: false,
    frozenBeforeFirstExecution: true,
    frozenBeforeRepairCodeWritten: true,
    supersedes: 'l3-2e-sealed-holdout-2026-08-23 (b9da20bacb9548167b80f0da6a55e5f3059a5318e809ba23a204706702818e06) -- opened, now REGRESSION_EVIDENCE only',
    sharesNoScenarioWith: PRIOR,
    overlapCheck: {
      textClashes: 0, idClashes: 0, internalDuplicates: 0, perPriorSet: overlapBySet,
      method: 'exact trimmed text and id comparison against ALL FIVE prior sealed sets and ALL THREE development sets, asserted at build time with a throw',
    },
    independentEvidenceExhaustion: {
      status: 'THIS IS THE LAST FRESH STRIDE',
      rule: 'i % 5 === 3',
      priorStrides: { 'l3-2b': 'i%5===0', 'l3-2c': 'i%5===2', 'l3-2d': 'i%5===4', 'l3-2e': 'i%5===1' },
      consequence: 'after this holdout the current field dataset is EXHAUSTED for fresh evaluation. No prior field scenario may be reused as fresh evidence. Any further semantic quality phase must identify a genuinely independent new source, and that source may not be authored solely to satisfy already-known failures.',
    },
    provenance: {
      A_independent: {
        artifact: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
        sha256: createHash('sha256').update(fieldRaw).digest('hex'),
        authoredBy: 'an earlier programme phase; never executed against any Level-3 code',
        selection: 'deterministic -- indices where i % 5 === 3 over the id-sorted dataset, the rule L3-2e named in advance',
        disjointFromPriorStrides: 'strides 0,1,2,3,4 are pairwise disjoint by construction; 3 is the last unused',
        count: sampled.length, familyMix,
        note: 'this stride finally brings in mobile_equipment, the last of the field dataset\'s six families that no sealed set had drawn from.',
      },
      B_authoredComplement: {
        authoredBy: 'the L3-2f implementation phase', count: COMPLEMENT.length,
        why: 'source A is entirely positive hazards with no negative control, corrected state, clarification case, observation-availability case, predicate-scope case, token-boundary case or control-adequacy case',
        limitation: 'authored by the implementer -- the FIFTH phase running to carry this, and the programme\'s largest unclosed methodological weakness. Written and frozen BEFORE the repair code, expectations declared here, no text reused from any prior set.',
      },
      C_targetedFamilyComplement: {
        authoredBy: 'the L3-2f implementation phase, FOR FAMILY COVERAGE ONLY', count: TARGETED.length,
        why: 'noise_exposure is the one family still NOT_YET_SEALED_VALIDATED, and eight further families passed L3-2e only under a permitted ALTERNATIVE label rather than their own.',
        limitation: 'TARGETED, not independent, and reported separately everywhere. Coverage evidence, not generalization evidence.',
        familiesTargeted: [...new Set(TARGETED.map(s => String(s.expect.coversFamily)))],
      },
    },
    clarificationLabelContract: {
      declaredBefore: 'first candidate execution', mayNotBeRedefinedAfterExecution: true,
      true_means: 'a decision-critical fact is missing and the correct semantic conclusion cannot be reached safely without it',
      false_means: 'the evidence already supports the semantic conclusion; a question would only add optional detail',
    },
    highConsequenceFamilies: HIGH_CONSEQUENCE,
    composition: {
      total: scenarios.length, byProvenance, byCohort,
      positives: scenarios.filter(s => s.expect.hazardEstablished === true).length,
      negativesOrNonActive: scenarios.filter(s => s.expect.hazardEstablished !== true).length,
      explicitNegativeControls: scenarios.filter(s => s.expect.negativeControl === true).length,
      clarificationExpected: scenarios.filter(s => s.expect.clarificationExpected === true).length,
      clarificationMustBeWithheld: scenarios.filter(s => s.expect.clarificationExpected === false).length,
      highConsequence: scenarios.filter(s => s.expect.highConsequence === true).length,
      predicateScopeCases: scenarios.filter(s => s.expect.predicateUnderTest).length,
      npTerminatorCases: scenarios.filter(s => s.cohort === 'np_terminator').length,
      tokenBoundaryCases: scenarios.filter(s => s.cohort === 'token_boundary').length,
      nominalControlCases: scenarios.filter(s => s.cohort === 'nominal_control').length,
      controlAdequacyCases: scenarios.filter(s => s.expect.controlAdequacy).length,
      observationAvailabilityCases: scenarios.filter(s => s.expect.observationAvailability).length,
      correctedOrControlInPlaceCases: scenarios.filter(s => s.expect.correctedStateControl === true).length,
    },
    scenarios,
  };

  const body = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, body);
  console.log(JSON.stringify({
    out: OUT, sha256: createHash('sha256').update(body).digest('hex'),
    composition: holdout.composition, overlapCheck: holdout.overlapCheck.perPriorSet, familyMix,
    targetedFamilies: holdout.provenance.C_targetedFamilyComplement.familiesTargeted,
  }, null, 2));
}
main();
