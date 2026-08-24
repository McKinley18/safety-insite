/**
 * L3-2e -- builds the FIFTH FRESH SEALED HOLDOUT.
 *
 * The L3-2, L3-2b, L3-2c and L3-2d sets have all been opened and are retired for gate use; they
 * survive only as REGRESSION_EVIDENCE.
 *
 * PROVENANCE, IN THREE SEPARATELY REPORTED PARTS.
 *
 *  A. INDEPENDENT -- `safescope-field-validation-dataset.v1.json`, stride `i % 5 === 1`, the rule
 *     L3-2d's NEXT_ACTION.md named in advance. L3-2b took `i%5===0`, L3-2c `i%5===2`, L3-2d
 *     `i%5===4`; the four strides are pairwise disjoint by construction. This stride finally brings
 *     in `fall_protection`, one of the two field families no sealed set had ever used.
 *
 *  B. AUTHORED COMPLEMENT -- controls, clarification, observation-availability and syntactic-role
 *     cases. The weak part, and the fourth phase running to carry it.
 *
 *  C. TARGETED FAMILY COMPLEMENT -- reported SEPARATELY from B, and added for one reason only:
 *     a coverage inventory across all four prior sealed sets found that NINE of the twenty-four
 *     taxonomy families have NEVER appeared in ANY sealed evaluation, and two more appear without a
 *     single high-consequence example. Deterministic sampling cannot fix that -- the field dataset
 *     carries six families in total. These scenarios exist to make the family-coverage gate
 *     answerable, and they are labelled so no reader can mistake targeted coverage for independent
 *     evidence.
 *
 * SCENARIOS IN C ARE NOT TUNING TARGETS. They were written before the repair code and none of their
 * families is touched by either L3-2e repair.
 *
 * Run: npx ts-node scripts/build-l32e-holdout.ts
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..');
const FIELD = join(REPO, 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json');
const EVAL = join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval');
const OUT = join(EVAL, 'holdout-l32e.json');

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
  ({ ...o, source: 'authored by the L3-2e implementation phase', provenanceClass: 'AUTHORED_COMPLEMENT' });
const T = (o: Omit<Scenario, 'source' | 'provenanceClass'>): Scenario =>
  ({ ...o, source: 'authored by the L3-2e implementation phase for FAMILY COVERAGE ONLY', provenanceClass: 'TARGETED_FAMILY_COMPLEMENT' });

// ---------------------------------------------------------------- B: authored complement

const COMPLEMENT: Scenario[] = [
  // ===== E1: a hazard/correction token in a NON-PREDICATE role. Each is paired.
  A({ id: 'E-SR-01', cohort: 'syntactic_role', failureMode: 'correction token as attributive modifier', regime: 'osha-general-industry',
    text: 'The access door to the main switchboard is obstructed by a stack of discarded pallet frames and packing waste.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical|emergency_egress|walking_working_surfaces', highConsequence: true, clarificationExpected: false, roleUnderTest: 'ATTRIBUTIVE_MODIFIER', tokenUnderTest: 'discarded' } }),
  A({ id: 'E-SR-02', cohort: 'syntactic_role', failureMode: 'PAIR: the same token as an asserted predicate', regime: 'osha-general-industry',
    text: 'The cracked pallet frame at the switchboard was found during the walk and was discarded to the skip before we left.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, roleUnderTest: 'ASSERTED_PREDICATE', tokenUnderTest: 'discarded' } }),
  A({ id: 'E-SR-03', cohort: 'syntactic_role', failureMode: 'correction token under a governing negation', regime: 'osha-general-industry',
    text: 'The fitters were breaking into the pump casing and no isolation was applied at the motor starter.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'loto_stored_energy|electrical', highConsequence: true, clarificationExpected: false, roleUnderTest: 'NEGATED_PREDICATE', tokenUnderTest: 'applied' } }),
  A({ id: 'E-SR-04', cohort: 'syntactic_role', failureMode: 'PAIR: the same token asserted and unnegated', regime: 'osha-general-industry',
    text: 'The fitters stopped work and a full isolation was applied at the motor starter before the casing was opened.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, roleUnderTest: 'ASSERTED_PREDICATE', tokenUnderTest: 'applied' } }),
  A({ id: 'E-SR-05', cohort: 'syntactic_role', failureMode: 'hazard word as modifier inside a signage noun phrase', regime: 'osha-general-industry',
    text: 'Two drums of thinners are standing at the loading bay door with no hazard warning placards and no secondary containment.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'chemical_storage|hazard_communication', clarificationExpected: false, roleUnderTest: 'ATTRIBUTIVE_MODIFIER_IN_LABEL_NP', tokenUnderTest: 'hazard' } }),
  A({ id: 'E-SR-06', cohort: 'syntactic_role', failureMode: 'PAIR: the same word as the head of a genuinely negated hazard NP', regime: 'osha-general-industry',
    text: 'The audit of the thinners store recorded no hazard of any kind and no deficiencies against the storage standard.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, roleUnderTest: 'NEGATED_NP_HEAD', tokenUnderTest: 'hazard' } }),
  A({ id: 'E-SR-07', cohort: 'syntactic_role', failureMode: 'negation governs clause one, hazard asserted in clause two', regime: 'osha-general-industry',
    text: 'The enclosure showed no impact damage although the earthing strap has been cut back and left hanging free of its stud.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'electrical', highConsequence: true, clarificationExpected: false, roleUnderTest: 'NEGATION_IN_SIBLING_CLAUSE', tokenUnderTest: 'damage' } }),
  A({ id: 'E-SR-08', cohort: 'syntactic_role', failureMode: 'removal token whose subject is the CONTROL, not the equipment', regime: 'osha-general-industry',
    text: 'The belt guard on the head pulley has been removed for cleaning and was never put back before the conveyor restarted.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, roleUnderTest: 'PREDICATE_SUBJECT_IS_CONTROL', tokenUnderTest: 'removed' } }),
  A({ id: 'E-SR-09', cohort: 'syntactic_role', failureMode: 'PAIR: unambiguous removal-from-service of the equipment', regime: 'osha-general-industry',
    text: 'The conveyor with the damaged head pulley was removed from service and locked out pending a new bearing.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, roleUnderTest: 'ASSERTED_PREDICATE_SERVICE_WITHDRAWAL', tokenUnderTest: 'removed from service' } }),
  A({ id: 'E-SR-10', cohort: 'syntactic_role', failureMode: 'hazard word in an unrelated neighbouring clause', regime: 'osha-general-industry',
    text: 'The hazard register was reviewed in the morning meeting and the pit cover over the sump has been left off at the north end.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'walking_working_surfaces|falls', clarificationExpected: false, roleUnderTest: 'UNRELATED_NEIGHBOURING_CLAUSE', tokenUnderTest: 'hazard' } }),
  A({ id: 'E-SR-11', cohort: 'syntactic_role', failureMode: 'control-in-place phrase under a governing negation', regime: 'osha-construction',
    text: 'The crew confirmed that no edge protection was in place along the open side of the second lift.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'falls|scaffolds|walking_working_surfaces', highConsequence: true, clarificationExpected: false, roleUnderTest: 'NEGATED_CONTROL_IN_PLACE', tokenUnderTest: 'in place' } }),
  A({ id: 'E-SR-12', cohort: 'syntactic_role', failureMode: 'PAIR: control genuinely in place', regime: 'osha-construction',
    text: 'A double guardrail with toeboard was in place along the open side of the second lift and was fixed at every standard.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true, roleUnderTest: 'ASSERTED_CONTROL_IN_PLACE', tokenUnderTest: 'in place' } }),

  // ===== E2: observation availability, varied against decision-criticality.
  A({ id: 'E-OA-01', cohort: 'observation_availability', failureMode: 'unobserved fact IS the deciding fact', regime: 'osha-construction',
    text: 'Three men were working at the parapet on the sixth floor and I could not get close enough to see whether any of them were clipped on.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: true } }),
  A({ id: 'E-OA-02', cohort: 'observation_availability', failureMode: 'unobserved fact IS the deciding fact', regime: 'osha-general-industry',
    text: 'A padlock was hanging on the isolator for the mixer but I had no way of checking whether the switch underneath it was actually off.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: true } }),
  A({ id: 'E-OA-03', cohort: 'observation_availability', failureMode: 'unobserved fact decides NOTHING; hazard stated', regime: 'osha-general-industry',
    text: 'The rotating shaft on the mixer drive is completely unguarded at the coupling; I could not read the asset number on the frame.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding', clarificationExpected: false, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: false } }),
  A({ id: 'E-OA-04', cohort: 'observation_availability', failureMode: 'unobserved fact decides NOTHING; hazard stated', regime: 'osha-construction',
    text: 'The excavation at the north gate is nine feet deep in sandy ground with no shoring or benching of any kind; I could not establish which day it was opened.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'trenching_shoring|excavation|ground_control', highConsequence: true, clarificationExpected: false, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: false } }),
  A({ id: 'E-OA-05', cohort: 'observation_availability', failureMode: 'unobserved fact decides NOTHING; hazard stated', regime: 'osha-general-industry',
    text: 'The eyewash at the plating line discharges a brown sludge for the first ten seconds; I was not able to find the last service record for it.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'first_aid_eyewash_safety_shower_access|chemical_storage', clarificationExpected: false, observationAvailability: 'EXPLICITLY_NOT_OBSERVED', unobservedFactIsDeciding: false } }),
  A({ id: 'E-OA-06', cohort: 'observation_availability', failureMode: 'reassuring clause FIRST, hazard asserted second', regime: 'osha-general-industry',
    text: 'The atmosphere in the pit was tested and found clear, and the man went down the fixed ladder with no rescue tripod rigged and nobody standing by at the top.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'confined_space|falls', highConsequence: true, clarificationExpected: false, observationAvailability: 'OBSERVED', clausePositionTrap: true } }),
  A({ id: 'E-OA-07', cohort: 'observation_availability', failureMode: 'reassuring clause FIRST, hazard asserted second', regime: 'msha',
    text: 'The methane monitor read zero at the face, and the roof bolter was operating under a section of unsupported roof that had already taken weight.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'ground_control', highConsequence: true, clarificationExpected: false, observationAvailability: 'OBSERVED', clausePositionTrap: true } }),
  A({ id: 'E-OA-08', cohort: 'observation_availability', failureMode: 'genuinely insufficient, something to suspect', regime: 'osha-general-industry',
    text: 'Something about the way the acetylene bottles were stood in the corner of the weld bay bothered me on the way past.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: true, observationAvailability: 'UNSPECIFIED' } }),
  A({ id: 'E-OA-09', cohort: 'observation_availability', failureMode: 'nothing observed and nothing to suspect', regime: 'osha-general-industry',
    text: 'Walked past the finishing shop at the end of the shift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, observationAvailability: 'UNSPECIFIED' } }),

  // ===== negative controls
  A({ id: 'E-NC-01', cohort: 'negative_control', failureMode: 'fully compliant guarding', regime: 'osha-general-industry',
    text: 'All four presses on the line are fitted with light curtains that were function tested this morning and the results were entered in the log.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'E-NC-02', cohort: 'negative_control', failureMode: 'hazard itself negated across clauses', regime: 'osha-construction',
    text: 'The scaffold inspection found no missing boards, no gaps at the hop-up brackets and no defective couplers on any lift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'E-NC-03', cohort: 'negative_control', failureMode: 'administrative only', regime: 'osha-general-industry',
    text: 'The permit to work files for the shutdown were archived and the new permit numbers were issued to the area supervisors.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'E-NC-04', cohort: 'negative_control', failureMode: 'planned future action', regime: 'osha-general-industry',
    text: 'We intend to replace the mesh guarding around the robot cell during the summer shutdown.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),
  A({ id: 'E-NC-05', cohort: 'negative_control', failureMode: 'positive impression beside a control-in-place fact', regime: 'msha',
    text: 'The wash plant struck me as well kept and the walkway handrails were continuous and secure along both runs.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false, negativeControl: true } }),

  // ===== corrected / control-in-place states
  A({ id: 'E-CS-01', cohort: 'condition_state', failureMode: 'corrected on the spot', regime: 'osha-general-industry',
    text: 'A damaged sling was found on the crane hook and the slinger cut it up and drew a replacement from the store before the next lift.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'E-CS-02', cohort: 'condition_state', failureMode: 'energy isolation in place', regime: 'osha-general-industry',
    text: 'The screw conveyor was stopped, the disconnect was opened and locked by both fitters, and the drive was proved dead before the inspection cover came off.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'E-CS-03', cohort: 'condition_state', failureMode: 'removed from service', regime: 'osha-general-industry',
    text: 'The mobile tower with the bent leg was labelled out of service and the wheels were removed so it could not be used.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),
  A({ id: 'E-CS-04', cohort: 'condition_state', failureMode: 'hypothetical', regime: 'osha-general-industry',
    text: 'Were the extraction on the weld booth to fail during a long run, fume would build up in the booth within a few minutes.',
    expect: { hazardEstablished: false, acceptableStates: NON_ACTIVE, clarificationExpected: false } }),

  // ===== multi-hazard
  A({ id: 'E-MH-01', cohort: 'multi_hazard', failureMode: 'two independent hazards', regime: 'osha-general-industry',
    text: 'The pedestal drill has no chuck guard fitted and the flexible lead to it is joined midway with insulating tape.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|electrical', minCandidates: 2, maxCandidates: 3, highConsequence: true, clarificationExpected: false } }),
  A({ id: 'E-MH-02', cohort: 'multi_hazard', failureMode: 'field shorthand, three cues', regime: 'msha',
    text: 'screen house: guard off the vibrating screen drive, water on the stair treads, emergency pull cord slack along the belt',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'machine_guarding|walking_working_surfaces|falls', minCandidates: 2, maxCandidates: 4, clarificationExpected: false } }),
];

// ---------------------------------------------------------------- C: targeted family complement

const TARGETED: Scenario[] = [
  T({ id: 'E-FAM-01', cohort: 'family_coverage', failureMode: 'welding_cutting_hot_work — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'A fitter was cutting the old handrail off with oxy-acetylene directly above the paint store roof with no fire watch posted and no blanket over the opening.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'welding_cutting_hot_work|fire_explosion', highConsequence: true, clarificationExpected: false, coversFamily: 'welding_cutting_hot_work' } }),
  T({ id: 'E-FAM-02', cohort: 'family_coverage', failureMode: 'fire_explosion — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'The solvent decanting bench is being used with an ungrounded metal drum and no bonding strap between the drum and the receiving can.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'fire_explosion|chemical_storage|electrical', highConsequence: true, clarificationExpected: false, coversFamily: 'fire_explosion' } }),
  T({ id: 'E-FAM-03', cohort: 'family_coverage', failureMode: 'lifting_rigging — NEVER sealed-validated', regime: 'osha-construction',
    text: 'A load of scaffold tube was being flown over the site road on a single chain leg with no tag line and the safety latch on the hook is missing.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'lifting_rigging|struck_by|material_handling', highConsequence: true, clarificationExpected: false, coversFamily: 'lifting_rigging' } }),
  T({ id: 'E-FAM-04', cohort: 'family_coverage', failureMode: 'noise_exposure — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'Operators are working a full shift beside the pneumatic hammer in the fettling bay with no hearing protection issued and no signage at the entrance.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'noise_exposure|personal_protective_equipment', clarificationExpected: false, coversFamily: 'noise_exposure' } }),
  T({ id: 'E-FAM-05', cohort: 'family_coverage', failureMode: 'respirable_dust_silica — NEVER sealed-validated', regime: 'osha-construction',
    text: 'A block cutter was dry cutting kerbs on the footway all morning with no water suppression and no respiratory protection of any sort.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'respirable_dust_silica|personal_protective_equipment', clarificationExpected: false, coversFamily: 'respirable_dust_silica' } }),
  T({ id: 'E-FAM-06', cohort: 'family_coverage', failureMode: 'emergency_egress — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'The final exit door at the end of the packing hall is blocked by a pallet of finished goods and the panic bar has been chained shut.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'emergency_egress|fire_explosion', highConsequence: true, clarificationExpected: false, coversFamily: 'emergency_egress' } }),
  T({ id: 'E-FAM-07', cohort: 'family_coverage', failureMode: 'first_aid_eyewash — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'The safety shower serving the acid dosing area has been isolated at the stopcock and the pull handle is wired back against the frame.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'first_aid_eyewash_safety_shower_access|chemical_storage', clarificationExpected: false, coversFamily: 'first_aid_eyewash_safety_shower_access' } }),
  T({ id: 'E-FAM-08', cohort: 'family_coverage', failureMode: 'compressed_air_hose_safety — NEVER sealed-validated', regime: 'osha-general-industry',
    text: 'The compressed air line to the blow gun is joined with a claw coupling and no whip check is fitted across the joint.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'compressed_air_hose_safety|struck_by', clarificationExpected: false, coversFamily: 'compressed_air_hose_safety' } }),
  T({ id: 'E-FAM-09', cohort: 'family_coverage', failureMode: 'drowning_hazards — NEVER sealed-validated', regime: 'osha-construction',
    text: 'Two men were working from a pontoon alongside the quay wall with no lifejackets worn and no throw line or rescue craft on the bank.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'drowning_hazards|personal_protective_equipment', highConsequence: true, clarificationExpected: false, coversFamily: 'drowning_hazards' } }),
  T({ id: 'E-FAM-10', cohort: 'family_coverage', failureMode: 'compressed_gas_cylinders — HIGH-CONSEQUENCE example missing', regime: 'osha-general-industry',
    text: 'An oxygen and an acetylene cylinder are standing unsecured and valve open beside the hot work bay with no separation and no caps fitted.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'compressed_gas_cylinders|fire_explosion', highConsequence: true, clarificationExpected: false, coversFamily: 'compressed_gas_cylinders' } }),
  T({ id: 'E-FAM-11', cohort: 'family_coverage', failureMode: 'hazard_communication — HIGH-CONSEQUENCE example missing', regime: 'osha-general-industry',
    text: 'An unlabelled jerry can of what the operator called thinners is being used to wash parts beside the induction heater.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'hazard_communication|chemical_storage|fire_explosion', highConsequence: true, clarificationExpected: false, coversFamily: 'hazard_communication' } }),
  T({ id: 'E-FAM-12', cohort: 'family_coverage', failureMode: 'material_handling — thin coverage', regime: 'osha-general-industry',
    text: 'The top beam of bay four in the raw material racking is dished and one connector pin has jumped out of the upright.',
    expect: { hazardEstablished: true, conditionState: 'ACTIVE', familyPattern: 'material_handling|walking_working_surfaces', clarificationExpected: false, coversFamily: 'material_handling' } }),
];

// ---------------------------------------------------------------- build

function main(): void {
  const fieldRaw = readFileSync(FIELD, 'utf8');
  const field = (JSON.parse(fieldRaw) as any[])
    .filter(s => s && typeof s.observationText === 'string')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const sampled = field.filter((_, i) => i % 5 === 1);

  const scenarios: Scenario[] = [];
  for (const s of sampled) {
    const pattern = FAMILY_ALIAS[s.expectedHazardFamily] ?? s.expectedHazardFamily;
    scenarios.push({
      id: `E-FLD-${String(s.id).replace('FIELD-', '')}`,
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

  // ---- freshness, enforced with a throw.
  const priorTexts = new Set<string>(); const priorIds = new Set<string>();
  for (const f of ['holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'holdout-l32d.json',
    'development-l32.json', 'development-l32d.json']) {
    const prior = JSON.parse(readFileSync(join(EVAL, f), 'utf8')) as { scenarios: Array<{ id: string; text: string }> };
    for (const s of prior.scenarios) { priorTexts.add(s.text.trim()); priorIds.add(s.id); }
  }
  const textClash = scenarios.filter(s => priorTexts.has(s.text.trim())).map(s => s.id);
  const idClash = scenarios.filter(s => priorIds.has(s.id)).map(s => s.id);
  const selfDup = scenarios.map(s => s.text.trim()).filter((t, i, a) => a.indexOf(t) !== i);
  if (textClash.length || idClash.length || selfDup.length) {
    throw new Error(`not fresh -- text ${JSON.stringify(textClash)} id ${JSON.stringify(idClash)} dup ${JSON.stringify(selfDup)}`);
  }

  const byProvenance = scenarios.reduce<Record<string, number>>((a, s) => { a[s.provenanceClass] = (a[s.provenanceClass] || 0) + 1; return a; }, {});
  const byCohort = scenarios.reduce<Record<string, number>>((a, s) => { a[s.cohort] = (a[s.cohort] || 0) + 1; return a; }, {});
  const familyMix = sampled.reduce<Record<string, number>>((a, s) => { a[s.expectedHazardFamily] = (a[s.expectedHazardFamily] || 0) + 1; return a; }, {});

  const holdout = {
    setId: 'l3-2e-sealed-holdout-2026-08-23',
    role: 'FINAL_SEALED_HOLDOUT',
    visibleDuringTuning: false,
    frozenBeforeFirstExecution: true,
    frozenBeforeRepairCodeWritten: true,
    supersedes: 'l3-2d-sealed-holdout-2026-08-22 (bd5f0c2d514784af0662e01f546aa9d7cd4986cd5c8dcea59980724181935af7) -- opened, now REGRESSION_EVIDENCE only',
    sharesNoScenarioWith: ['holdout-l32.json', 'holdout-l32b.json', 'holdout-l32c.json', 'holdout-l32d.json', 'development-l32.json', 'development-l32d.json'],
    overlapCheck: { textClashes: 0, idClashes: 0, internalDuplicates: 0, method: 'exact trimmed text and id comparison against all four prior sealed sets and both development sets, asserted at build time with a throw' },
    provenance: {
      A_independent: {
        artifact: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
        sha256: createHash('sha256').update(fieldRaw).digest('hex'),
        authoredBy: 'an earlier programme phase; never executed against any Level-3 code',
        selection: 'deterministic -- indices where i % 5 === 1 over the id-sorted dataset, the rule L3-2d named in advance',
        disjointFromPriorStrides: 'L3-2b i%5===0, L3-2c i%5===2, L3-2d i%5===4; the four strides are pairwise disjoint by construction',
        count: sampled.length, familyMix,
        note: 'this stride finally brings in fall_protection, one of the two field families no prior sealed set used. mobile_equipment (stride 3) remains unused by any sealed set and is covered only by the targeted complement.',
      },
      B_authoredComplement: {
        authoredBy: 'the L3-2e implementation phase', count: COMPLEMENT.length,
        why: 'source A is entirely positive hazards with no negative control, corrected state, clarification case, observation-availability case or syntactic-role case',
        limitation: 'authored by the implementer -- the fourth phase running to carry this. Written and frozen BEFORE the repair code, expectations declared here, no text reused from any prior set.',
      },
      C_targetedFamilyComplement: {
        authoredBy: 'the L3-2e implementation phase, FOR FAMILY COVERAGE ONLY', count: TARGETED.length,
        why: 'a coverage inventory across all four prior sealed sets found NINE of the twenty-four taxonomy families had NEVER appeared in any sealed evaluation, and two more appeared with no high-consequence example. The field dataset carries six families in total, so no deterministic sampling rule can close that gap.',
        limitation: 'TARGETED, not independent, and reported separately everywhere. These are coverage evidence, not generalization evidence.',
        familiesTargeted: [...new Set(TARGETED.map(s => String(s.expect.coversFamily)))],
      },
    },
    priorSealedFamilyCoverage: {
      method: 'declared familyPattern across holdout-l32/-l32b/-l32c/-l32d, alternatives split, matched against the 24 taxonomy ids',
      neverSealedValidated: ['compressed_air_hose_safety', 'drowning_hazards', 'emergency_egress', 'fire_explosion', 'first_aid_eyewash_safety_shower_access', 'lifting_rigging', 'noise_exposure', 'respirable_dust_silica', 'welding_cutting_hot_work'],
      appearedExactlyOnce: ['compressed_gas_cylinders'],
      presentButNoHighConsequenceExample: ['compressed_gas_cylinders', 'hazard_communication'],
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
      syntacticRoleCases: scenarios.filter(s => s.expect.roleUnderTest).length,
      observationAvailabilityCases: scenarios.filter(s => s.expect.observationAvailability).length,
    },
    scenarios,
  };

  const body = JSON.stringify(holdout, null, 2) + '\n';
  writeFileSync(OUT, body);
  console.log(JSON.stringify({
    out: OUT, sha256: createHash('sha256').update(body).digest('hex'),
    composition: holdout.composition, overlapCheck: holdout.overlapCheck, familyMix,
    targetedFamilies: holdout.provenance.C_targetedFamilyComplement.familiesTargeted,
  }, null, 2));
}
main();
