import { HazLenzReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzEquipmentGroup =
  | 'mobile_equipment'
  | 'aggregate_facility_equipment'
  | 'manufacturing_equipment'
  | 'construction_equipment'
  | 'electrical_energy_equipment'
  | 'emergency_response_equipment'
  | 'material_handling_equipment'
  | 'support_equipment';

export type HazLenzTaskContext =
  | 'normal_operation'
  | 'inspection'
  | 'cleanup'
  | 'maintenance'
  | 'troubleshooting'
  | 'repair'
  | 'jam_clearing'
  | 'startup_shutdown'
  | 'travel_access'
  | 'material_handling'
  | 'emergency_response'
  | 'unknown';

export type HazLenzHarmMechanism =
  | 'caught_in_or_between'
  | 'entanglement'
  | 'struck_by'
  | 'crushed_by'
  | 'fall_from_elevation'
  | 'fall_on_same_level'
  | 'falling_material'
  | 'electrical_contact'
  | 'arc_flash'
  | 'unexpected_startup'
  | 'stored_energy_release'
  | 'fire_or_explosion'
  | 'chemical_or_dust_exposure'
  | 'noise_exposure'
  | 'traffic_interaction'
  | 'unsupported_ground_or_collapse'
  | 'ergonomic_overexertion'
  | 'unknown';

export type HazLenzEquipmentFailureMode = {
  failureModeId: string;
  label: string;
  description: string;
  likelyTaskContexts: HazLenzTaskContext[];
  harmMechanisms: HazLenzHarmMechanism[];
  likelyHazardDomains: HazLenzReasoningDomain[];
  evidenceQuestions: string[];
  immediateCautions: string[];
  correctiveActionThemes: string[];
  verificationEvidence: string[];
  conflictNotes: string[];
};

export type HazLenzEquipmentComponentMechanism = {
  componentId: string;
  label: string;
  aliases: string[];
  normalFunction: string;
  hazardousEnergyOrMotion: string[];
  commonTasks: HazLenzTaskContext[];
  failureModes: HazLenzEquipmentFailureMode[];
};

export type HazLenzEquipmentTaskMechanismRecord = {
  equipmentId: string;
  equipmentLabel: string;
  equipmentGroup: HazLenzEquipmentGroup;
  components: HazLenzEquipmentComponentMechanism[];
  guardrails: {
    contextOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideRegulation: true;
    requiresQualifiedReview: true;
  };
};
