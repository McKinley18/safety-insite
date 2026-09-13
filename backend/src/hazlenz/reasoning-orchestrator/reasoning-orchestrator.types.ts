import { ApprovedKnowledgeIntegrationContext } from '../knowledge-intake/integration/approved-knowledge-integration.types';
import { ApplicabilityAnalysisResult } from './applicability/applicability-analysis.types';
import { CorrectiveActionReasoningResult } from './corrective-actions/corrective-action-reasoning.types';
import { HazLenzEquipmentTaskMechanismDetectionResult } from '../equipment-knowledge/equipment-task-mechanism-detector.service';
import { HazLenzEquipmentArchetypeDetectionResult } from '../equipment-knowledge/equipment-archetype-detector.service';
import { HazLenzBrainSnapshot } from '../brain/snapshot-builder/brain-snapshot-builder.types';
import { InspectionIntelligenceResult } from '../inspection-intelligence/inspection-intelligence.types';

export type HazLenzJurisdiction =
  | 'msha'
  | 'osha_general_industry'
  | 'osha_construction'
  | 'unclear';

export type HazLenzReasoningDomain =
  | 'machine_guarding'
  | 'lockout_tagout'
  | 'machine_guarding_loto'
  | 'fall_protection'
  | 'electrical'
  | 'compressed_gas'
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
  | 'environmental_release'
  | 'noise_exposure'
  | 'heat_stress'
  | 'cold_stress'
  | 'water_drowning'
  | 'dropped_objects'
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

export type HazLenzReasoningConfidence = 'low' | 'moderate' | 'high';

export type HazLenzReasoningRequest = {
  hazardObservation: string;
  scopes?: string[];
  siteType?: string;
  taskContext?: string;
  industryContext?: string;
  photosAvailable?: boolean;
  measurementsAvailable?: boolean;
  employeeExposureKnown?: boolean;
  equipmentInvolved?: string;
  enableApprovedKnowledgeContext?: boolean;
  workspaceId?: string;
  siteId?: string;
};

export type HazLenzReasoningEvidenceGap = {
  field: string;
  reason: string;
  importance: 'low' | 'medium' | 'high';
};

export type HazLenzApplicabilitySignal = {
  signal: string;
  matched: boolean;
  explanation: string;
};

export type HazLenzEquipmentReasoningSummary = {
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

export type HazLenzResolvedMechanism = {
  mechanismId: string;
  source:
    | 'task_mechanism'
    | 'archetype'
    | 'precedence_resolver'
    | 'unknown';
  reasonCodes: string[];
  humanReviewRecommended: boolean;
};

export type GovernedKnowledgeRetrieval = {
  enabled: boolean;
  matchedRecordIds: string[];
  matchedRecordTitles: string[];
  retrievalFacets: unknown;
  matchReasons: unknown;
  evidenceNeeds: string[];
  authoritySummary: unknown;
  advisoryLimitations: string[];
  guardrails: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotFinalizeApplicability: true;
    requiresQualifiedReview: true;
    doesNotOverrideRegulation: true;
  };
};

export type HazLenzReasoningResult = {
  engine: 'safescope_reasoning_orchestrator_v1';
  mode: 'deterministic_test_only_advisory';
  productionReasoningModified: false;
  primaryCitation?: string; // Add this field
  governedKnowledgeRetrieval?: GovernedKnowledgeRetrieval; // Add this field
  requestSummary: {
    hazardObservation: string;
    siteType?: string;
    taskContext?: string;
    industryContext?: string;
  };
  jurisdictionAssessment: {
    likelyJurisdiction: HazLenzJurisdiction;
    reasons: string[];
    requiresHumanConfirmation: boolean;
  };
  hazardClassification: {
    primaryDomain: HazLenzReasoningDomain;
    reasons: string[];
  };
  approvedKnowledgeContext: ApprovedKnowledgeIntegrationContext;
  applicabilitySignals: HazLenzApplicabilitySignal[];
  applicabilityAnalysis: ApplicabilityAnalysisResult;
  correctiveActionReasoning: CorrectiveActionReasoningResult;
  equipmentTaskMechanismContext: HazLenzEquipmentTaskMechanismDetectionResult;
  equipmentArchetypeContext: HazLenzEquipmentArchetypeDetectionResult;
  equipmentReasoningSummary: HazLenzEquipmentReasoningSummary;
  resolvedMechanism: HazLenzResolvedMechanism;
  brainSnapshot: HazLenzBrainSnapshot;
  missingEvidence: HazLenzReasoningEvidenceGap[];
  safetyCalculations?: any;
  contradictionIntelligence?: any;
  companyPolicies?: any[];
  confidence: {
    level: HazLenzReasoningConfidence;
    reasons: string[];
  };
  conclusionBoundary: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
  recommendedNextQuestions: string[];
  inspectionIntelligence: InspectionIntelligenceResult;
};
