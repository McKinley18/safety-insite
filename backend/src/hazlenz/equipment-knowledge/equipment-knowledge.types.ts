import { HazLenzJurisdiction, HazLenzReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzEquipmentCategory =
  | 'mobile_equipment'
  | 'powered_haulage'
  | 'fixed_plant'
  | 'material_handling'
  | 'construction_equipment'
  | 'access_equipment'
  | 'electrical_equipment'
  | 'emergency_equipment';

export type HazLenzEquipmentSystem = {
  systemId: string;
  label: string;
  commonFailureModes: string[];
  relatedHazardDomains: HazLenzReasoningDomain[];
  evidenceQuestions: string[];
  verificationEvidence: string[];
};

export type HazLenzEquipmentKnowledgeRecord = {
  equipmentId: string;
  label: string;
  category: HazLenzEquipmentCategory;
  aliases: string[];
  commonJurisdictions: HazLenzJurisdiction[];
  commonHazardDomains: HazLenzReasoningDomain[];
  systems: HazLenzEquipmentSystem[];
  commonScenarioTriggers: string[];
  inspectionFocusAreas: string[];
  correctiveActionThemes: string[];
  conflictNotes: string[];
  guardrails: {
    contextOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideRegulation: true;
    requiresQualifiedReview: true;
  };
};

export type HazLenzEquipmentKnowledgeRegistry = {
  engine: 'safescope_equipment_knowledge_registry_v1';
  mode: 'read_only_test_only_context';
  records: HazLenzEquipmentKnowledgeRecord[];
  guardrails: {
    readOnly: true;
    contextOnly: true;
    doesNotModifyReasoning: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotUseUnapprovedKnowledge: true;
  };
};
