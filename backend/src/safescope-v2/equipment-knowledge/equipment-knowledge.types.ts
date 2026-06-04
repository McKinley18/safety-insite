import { SafeScopeJurisdiction, SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeEquipmentCategory =
  | 'mobile_equipment'
  | 'powered_haulage'
  | 'fixed_plant'
  | 'material_handling'
  | 'construction_equipment'
  | 'access_equipment'
  | 'electrical_equipment'
  | 'emergency_equipment';

export type SafeScopeEquipmentSystem = {
  systemId: string;
  label: string;
  commonFailureModes: string[];
  relatedHazardDomains: SafeScopeReasoningDomain[];
  evidenceQuestions: string[];
  verificationEvidence: string[];
};

export type SafeScopeEquipmentKnowledgeRecord = {
  equipmentId: string;
  label: string;
  category: SafeScopeEquipmentCategory;
  aliases: string[];
  commonJurisdictions: SafeScopeJurisdiction[];
  commonHazardDomains: SafeScopeReasoningDomain[];
  systems: SafeScopeEquipmentSystem[];
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

export type SafeScopeEquipmentKnowledgeRegistry = {
  engine: 'safescope_equipment_knowledge_registry_v1';
  mode: 'read_only_test_only_context';
  records: SafeScopeEquipmentKnowledgeRecord[];
  guardrails: {
    readOnly: true;
    contextOnly: true;
    doesNotModifyReasoning: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotUseUnapprovedKnowledge: true;
  };
};
