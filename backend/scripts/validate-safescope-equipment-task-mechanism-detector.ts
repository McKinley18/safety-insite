import { SafeScopeEquipmentTaskMechanismDetectorService } from '../src/safescope-v2/equipment-knowledge/equipment-task-mechanism-detector.service';
import { SafeScopeHarmMechanism, SafeScopeTaskContext } from '../src/safescope-v2/equipment-knowledge/equipment-task-mechanism.types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const detector = new SafeScopeEquipmentTaskMechanismDetectorService();

type DetectorScenario = {
  name: string;
  description: string;
  taskContext?: SafeScopeTaskContext;
  expectedEquipmentId: string;
  expectedComponentId: string;
  expectedFailureModeId: string;
  expectedDomains: string[];
  expectedMechanisms: SafeScopeHarmMechanism[];
};

const scenarios: DetectorScenario[] = [
  {
    name: 'missing guard on tail pulley',
    description: 'Missing guard on the conveyor tail pulley with employee access to the nip point.',
    expectedEquipmentId: 'conveyor',
    expectedComponentId: 'tail_pulley',
    expectedFailureModeId: 'missing_tail_pulley_guard',
    expectedDomains: ['machine_guarding', 'lockout_tagout'],
    expectedMechanisms: ['caught_in_or_between', 'entanglement'],
  },
  {
    name: 'cleanup near conveyor tail pulley',
    description:
      'Employee was cleaning material buildup near the conveyor tail pulley and it was not clear whether the belt was locked out.',
    taskContext: 'cleanup',
    expectedEquipmentId: 'conveyor',
    expectedComponentId: 'tail_pulley',
    expectedFailureModeId: 'tail_pulley_cleanup_without_energy_control',
    expectedDomains: ['lockout_tagout', 'machine_guarding'],
    expectedMechanisms: ['caught_in_or_between', 'unexpected_startup'],
  },
  {
    name: 'unguarded conveyor drive',
    description: 'Unguarded conveyor drive pulley/head pulley exposed during normal operation.',
    expectedEquipmentId: 'conveyor',
    expectedComponentId: 'head_pulley',
    expectedFailureModeId: 'unguarded_head_pulley_or_drive',
    expectedDomains: ['machine_guarding'],
    expectedMechanisms: ['caught_in_or_between', 'entanglement'],
  },
  {
    name: 'loader pedestrian blind spot no controls',
    description: 'Front end loader operating near pedestrians in a blind spot with no spotter or separation controls.',
    taskContext: 'normal_operation',
    expectedEquipmentId: 'front_end_loader',
    expectedComponentId: 'operator_visibility',
    expectedFailureModeId: 'loader_pedestrian_blind_spot_no_controls',
    expectedDomains: ['mobile_equipment', 'traffic_control'],
    expectedMechanisms: ['struck_by', 'traffic_interaction'],
  },
  {
    name: 'raised loader bucket without support',
    description: 'Employee working under raised loader bucket without blocking or support while maintenance is being performed.',
    taskContext: 'maintenance',
    expectedEquipmentId: 'front_end_loader',
    expectedComponentId: 'bucket_attachment',
    expectedFailureModeId: 'working_under_raised_loader_bucket_without_support',
    expectedDomains: ['lockout_tagout', 'mobile_equipment'],
    expectedMechanisms: ['crushed_by', 'stored_energy_release'],
  },
  {
    name: 'haul truck dumping near inadequate berm',
    description: 'Haul truck dumping at elevated dump point near edge with inadequate berm and unclear edge control.',
    taskContext: 'material_handling',
    expectedEquipmentId: 'haul_truck',
    expectedComponentId: 'dump_body_dump_point',
    expectedFailureModeId: 'haul_truck_dumping_near_inadequate_berm_or_edge',
    expectedDomains: ['powered_haulage', 'mobile_equipment'],
    expectedMechanisms: ['traffic_interaction', 'crushed_by'],
  },
  {
    name: 'forklift pedestrian separation gap',
    description: 'Forklift traffic crossing a pedestrian walkway without barriers at a blind corner.',
    taskContext: 'material_handling',
    expectedEquipmentId: 'forklift',
    expectedComponentId: 'pedestrian_interaction',
    expectedFailureModeId: 'forklift_pedestrian_separation_gap',
    expectedDomains: ['traffic_control', 'mobile_equipment'],
    expectedMechanisms: ['struck_by', 'traffic_interaction'],
  },
  {
    name: 'crusher jam clearing without energy control clarity',
    description: 'Employee clearing jam from plugged crusher with lockout status unclear and stored material energy present.',
    taskContext: 'jam_clearing',
    expectedEquipmentId: 'crusher',
    expectedComponentId: 'crusher_drive_guarding',
    expectedFailureModeId: 'crusher_jam_clearing_without_energy_control_clarity',
    expectedDomains: ['lockout_tagout', 'machine_guarding'],
    expectedMechanisms: ['crushed_by', 'stored_energy_release'],
  },
  {
    name: 'screen plant drive access exposure',
    description: 'Screen plant drive belt exposed near screen deck access platform during inspection.',
    taskContext: 'inspection',
    expectedEquipmentId: 'screen_plant',
    expectedComponentId: 'screen_drive_and_deck_access',
    expectedFailureModeId: 'screen_drive_guarding_or_access_exposure',
    expectedDomains: ['machine_guarding', 'fall_protection'],
    expectedMechanisms: ['caught_in_or_between', 'fall_from_elevation'],
  },
  {
    name: 'open electrical panel exposed live parts',
    description: 'Open electrical panel with missing dead front and exposed live parts during troubleshooting.',
    taskContext: 'troubleshooting',
    expectedEquipmentId: 'electrical_panel',
    expectedComponentId: 'panel_live_parts_and_enclosure',
    expectedFailureModeId: 'open_panel_or_exposed_live_parts',
    expectedDomains: ['electrical', 'lockout_tagout'],
    expectedMechanisms: ['electrical_contact', 'arc_flash'],
  },
  {
    name: 'generator exhaust ventilation exposure',
    description: 'Portable generator exhaust operating near doorway with poor ventilation and carbon monoxide concern.',
    taskContext: 'normal_operation',
    expectedEquipmentId: 'generator',
    expectedComponentId: 'generator_exhaust_power_fuel',
    expectedFailureModeId: 'generator_exhaust_or_ventilation_exposure',
    expectedDomains: ['health_exposure', 'fire_protection'],
    expectedMechanisms: ['chemical_or_dust_exposure', 'fire_or_explosion'],
  },
  {
    name: 'aerial lift fall restraint platform gap',
    description: 'Employee in aerial lift basket overreaching with fall restraint unclear and platform gate open.',
    taskContext: 'normal_operation',
    expectedEquipmentId: 'aerial_lift',
    expectedComponentId: 'platform_fall_and_positioning_controls',
    expectedFailureModeId: 'aerial_lift_fall_restraint_or_platform_control_gap',
    expectedDomains: ['fall_protection', 'mobile_equipment'],
    expectedMechanisms: ['fall_from_elevation', 'struck_by'],
  },
  {
    name: 'scaffold incomplete guardrail platform',
    description: 'Scaffold platform incomplete with missing guardrail and missing toe board while employees work at elevation.',
    taskContext: 'inspection',
    expectedEquipmentId: 'scaffold',
    expectedComponentId: 'platform_guardrails_access_base',
    expectedFailureModeId: 'scaffold_incomplete_guardrail_or_platform',
    expectedDomains: ['fall_protection', 'walking_working_surfaces'],
    expectedMechanisms: ['fall_from_elevation', 'falling_material'],
  },
  {
    name: 'portable ladder unsecured wrong angle',
    description: 'Extension ladder not secured and set at wrong angle while employee is overreaching from ladder.',
    taskContext: 'travel_access',
    expectedEquipmentId: 'portable_ladder',
    expectedComponentId: 'ladder_condition_setup_use',
    expectedFailureModeId: 'portable_ladder_unsecured_wrong_angle_or_overreach',
    expectedDomains: ['fall_protection', 'walking_working_surfaces'],
    expectedMechanisms: ['fall_from_elevation', 'fall_on_same_level'],
  },
  {
    name: 'trench worker without protective system clarity',
    description: 'Worker in trench with protective system unclear and no competent person inspection documented.',
    taskContext: 'inspection',
    expectedEquipmentId: 'excavation_trench_box',
    expectedComponentId: 'protective_system_access_surcharge',
    expectedFailureModeId: 'trench_worker_without_protective_system_clarity',
    expectedDomains: ['excavation_trenching', 'ground_control'],
    expectedMechanisms: ['unsupported_ground_or_collapse', 'crushed_by'],
  },
  {
    name: 'telehandler elevated load exposure',
    description: 'Telehandler elevated load with boom extended while employees are under the load and load chart unclear.',
    taskContext: 'material_handling',
    expectedEquipmentId: 'telehandler',
    expectedComponentId: 'boom_load_personnel_platform_stability',
    expectedFailureModeId: 'telehandler_suspended_or_elevated_load_exposure',
    expectedDomains: ['material_handling', 'mobile_equipment'],
    expectedMechanisms: ['struck_by', 'falling_material'],
  },
];

for (const scenario of scenarios) {
  const result = detector.detect({
    description: scenario.description,
    taskContext: scenario.taskContext,
  });

  assert(result.matched, `${scenario.name}: detector should return a match.`);
  assert(Boolean(result.primaryMatch), `${scenario.name}: detector should return a primary match.`);

  const primary = result.primaryMatch;

  if (!primary) {
    throw new Error(`${scenario.name}: primary match missing.`);
  }

  assert(primary.equipmentId === scenario.expectedEquipmentId, `${scenario.name}: expected equipment ${scenario.expectedEquipmentId}, got ${primary.equipmentId}.`);
  assert(primary.componentId === scenario.expectedComponentId, `${scenario.name}: expected component ${scenario.expectedComponentId}, got ${primary.componentId}.`);
  assert(primary.failureModeId === scenario.expectedFailureModeId, `${scenario.name}: expected failure mode ${scenario.expectedFailureModeId}, got ${primary.failureModeId}.`);
  assert(primary.score >= 12, `${scenario.name}: expected score at least 12, got ${primary.score}.`);
  assert(['high', 'medium', 'low'].includes(primary.confidence), `${scenario.name}: confidence should be set.`);

  for (const domain of scenario.expectedDomains) {
    assert(primary.likelyHazardDomains.includes(domain), `${scenario.name}: expected domain ${domain}.`);
  }

  for (const mechanism of scenario.expectedMechanisms) {
    assert(primary.harmMechanisms.includes(mechanism), `${scenario.name}: expected harm mechanism ${mechanism}.`);
  }

  assert(primary.evidenceQuestions.length > 0, `${scenario.name}: evidence questions required.`);
  assert(primary.immediateCautions.length > 0, `${scenario.name}: immediate cautions required.`);
  assert(primary.correctiveActionThemes.length > 0, `${scenario.name}: corrective action themes required.`);
  assert(primary.verificationEvidence.length > 0, `${scenario.name}: verification evidence required.`);
  assert(primary.conflictNotes.length > 0, `${scenario.name}: conflict notes required.`);

  assert(primary.guardrails.contextOnly === true, `${scenario.name}: must remain context-only.`);
  assert(primary.guardrails.doesNotDeclareViolation === true, `${scenario.name}: must not declare violation.`);
  assert(primary.guardrails.doesNotCreateCitation === true, `${scenario.name}: must not create citation.`);
  assert(primary.guardrails.doesNotOverrideRegulation === true, `${scenario.name}: must not override regulation.`);
  assert(primary.guardrails.requiresQualifiedReview === true, `${scenario.name}: must require qualified review.`);

  console.log(`✅ ${scenario.name}`);
  console.log(
    `   ${primary.equipmentId}/${primary.componentId}/${primary.failureModeId} score=${primary.score} confidence=${primary.confidence}`,
  );
}

const vague = detector.detect({
  description: 'There is a problem near the plant.',
});

assert(vague.matched === false, 'Vague plant problem should not produce a task-mechanism match.');
assert(vague.evidenceGaps.length > 0, 'Vague result should return evidence gaps.');
assert(vague.cautions.length > 0, 'Vague result should return cautions.');

console.log('✅ vague description guardrail');
console.log('✅ SafeScope equipment task mechanism detector validation passed.');
