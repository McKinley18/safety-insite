import {
  HazLenzHarmMechanism,
  HazLenzTaskContext,
} from './equipment-task-mechanism.types';
import { HazLenzReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzEquipmentArchetypeId =
  | 'rotating_machinery'
  | 'powered_conveyor_system'
  | 'mobile_equipment'
  | 'powered_industrial_truck'
  | 'earthmoving_equipment'
  | 'fixed_plant_processing_equipment'
  | 'electrical_energy_equipment'
  | 'temporary_power_equipment'
  | 'elevated_work_platform'
  | 'temporary_access_equipment'
  | 'scaffold_work_platform'
  | 'excavation_ground_opening'
  | 'lifting_rigging_equipment'
  | 'hot_work_equipment'
  | 'pressure_energy_system'
  | 'emergency_response_equipment';

export type HazLenzEquipmentArchetypeRecord = {
  archetypeId: HazLenzEquipmentArchetypeId;
  label: string;
  description: string;
  exampleEquipment: string[];
  commonComponentClasses: string[];
  commonTasks: HazLenzTaskContext[];
  harmMechanisms: HazLenzHarmMechanism[];
  likelyHazardDomains: HazLenzReasoningDomain[];
  detectionSignals: {
    strong: string[];
    medium: string[];
    weak: string[];
  };
  evidenceQuestions: string[];
  immediateCautions: string[];
  correctiveActionThemes: string[];
  verificationEvidence: string[];
  specificRecordHandoffHints: string[];
  guardrails: {
    contextOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideRegulation: true;
    requiresQualifiedReview: true;
  };
};

export type HazLenzEquipmentArchetypeRegistry = {
  engine: 'safescope_equipment_archetype_registry_v1';
  mode: 'generalized_equipment_reasoning_context_only';
  records: HazLenzEquipmentArchetypeRecord[];
};
