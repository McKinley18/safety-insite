import { ApprovedKnowledgeIntegrationContext } from '../knowledge-intake/integration/approved-knowledge-integration.types';
import { ApplicabilityAnalysisResult } from './applicability/applicability-analysis.types';
import { CorrectiveActionReasoningResult } from './corrective-actions/corrective-action-reasoning.types';
import { SafeScopeEquipmentTaskMechanismDetectionResult } from '../equipment-knowledge/equipment-task-mechanism-detector.service';
import { SafeScopeEquipmentArchetypeDetectionResult } from '../equipment-knowledge/equipment-archetype-detector.service';
import { SafeScopeBrainSnapshot } from '../brain/snapshot-builder/brain-snapshot-builder.types';

export type SafeScopeJurisdiction =
  | 'msha'
  | 'osha_general_industry'
  | 'osha_construction'
  | 'unclear';

export type SafeScopeReasoningDomain =
  | 'machine_guarding'
  | 'lockout_tagout'
  | 'machine_guarding_loto'
  | 'fall_protection'
  | 'electrical'
  | 'confined_space'
  | 'hazard_communication'
  | 'hazardous_materials'
  | 'mobile_equipment'
  | 'powered_haulage'
  | 'ground_control'
  | 'emergency_preparedness'
  | 'ventilation'
  | 'roof_rib_control'
  | 'health_exposure'
  | 'bloodborne_pathogens'
  | 'industrial_hygiene'
  | 'environmental_exposure'
  | 'ergonomics'
  | 'health_respiratory'
  | 'material_handling'
  | 'walking_working_surfaces'
  | 'fire_protection'
  | 'emergency_response'
  | 'ppe'
  | 'welding_cutting_hot_work'
  | 'tools_equipment'
  | 'cranes_rigging_hoisting'
  | 'excavation_trenching'
  | 'traffic_control'
  | 'training_procedure_gap'
  | 'slip_trip_fall'
  | 'slips_trips_falls'
  | 'scaffolds'
  | 'ladders'
  | 'unknown';

export type SafeScopeReasoningConfidence = 'low' | 'moderate' | 'high';

export type SafeScopeReasoningRequest = {
  hazardObservation: string;
  siteType?: string;
  taskContext?: string;
  industryContext?: string;
  photosAvailable?: boolean;
  measurementsAvailable?: boolean;
  employeeExposureKnown?: boolean;
  equipmentInvolved?: string;
  enableApprovedKnowledgeContext?: boolean;
};

export type SafeScopeReasoningEvidenceGap = {
  field: string;
  reason: string;
  importance: 'low' | 'medium' | 'high';
};

export type SafeScopeApplicabilitySignal = {
  signal: string;
  matched: boolean;
  explanation: string;
};

export type SafeScopeEquipmentReasoningSummary = {
  primaryReasoningMode:
    | 'specific_task_mechanism'
    | 'specific_with_archetype_support'
    | 'archetype_fallback'
    | 'insufficient_equipment_context';
  primaryEquipmentContext: string;
  primaryMechanismOrArchetype: string;
  supportingContext: string[];
  rankingReasons: string[];
  evidenceGaps: string[];
  cautions: string[];
  guardrails: {
    contextOnly: true;
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotOverrideRegulation: true;
    requiresQualifiedReview: true;
  };
};

export type SafeScopeResolvedMechanism = {
  mechanismId: string;
  source:
    | 'task_mechanism'
    | 'archetype'
    | 'precedence_resolver'
    | 'unknown';
  reasonCodes: string[];
  humanReviewRecommended: boolean;
};

export type SafeScopeReasoningResult = {
  engine: 'safescope_reasoning_orchestrator_v1';
  mode: 'deterministic_test_only_advisory';
  productionReasoningModified: false;
  primaryCitation?: string; // Add this field
  requestSummary: {
    hazardObservation: string;
    siteType?: string;
    taskContext?: string;
    industryContext?: string;
  };
  jurisdictionAssessment: {
    likelyJurisdiction: SafeScopeJurisdiction;
    reasons: string[];
    requiresHumanConfirmation: boolean;
  };
  hazardClassification: {
    primaryDomain: SafeScopeReasoningDomain;
    reasons: string[];
  };
  approvedKnowledgeContext: ApprovedKnowledgeIntegrationContext;
  applicabilitySignals: SafeScopeApplicabilitySignal[];
  applicabilityAnalysis: ApplicabilityAnalysisResult;
  correctiveActionReasoning: CorrectiveActionReasoningResult;
  equipmentTaskMechanismContext: SafeScopeEquipmentTaskMechanismDetectionResult;
  equipmentArchetypeContext: SafeScopeEquipmentArchetypeDetectionResult;
  equipmentReasoningSummary: SafeScopeEquipmentReasoningSummary;
  resolvedMechanism: SafeScopeResolvedMechanism;
  brainSnapshot: SafeScopeBrainSnapshot;
  missingEvidence: SafeScopeReasoningEvidenceGap[];
  safetyCalculations?: any;
  contradictionIntelligence?: any;
  confidence: {
    level: SafeScopeReasoningConfidence;
    reasons: string[];
  };
  conclusionBoundary: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
  recommendedNextQuestions: string[];
};
