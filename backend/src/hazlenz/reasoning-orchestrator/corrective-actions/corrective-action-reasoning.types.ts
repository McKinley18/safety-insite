import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
  HazLenzReasoningEvidenceGap,
} from '../reasoning-orchestrator.types';
import { ApplicabilityAnalysisResult } from '../applicability/applicability-analysis.types';

export type ControlLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe'
  | 'verification';

export type CorrectiveActionPriority = 'immediate' | 'high' | 'medium' | 'low';

export type CorrectiveActionRecommendation = {
  controlLevel: ControlLevel;
  priority: CorrectiveActionPriority;
  action: string;
  rationale: string;
  verificationEvidence: string[];
  cautions: string[];
};

export type CorrectiveActionReasoningInput = {
  hazardObservation: string;
  jurisdiction: HazLenzJurisdiction;
  hazardDomain: HazLenzReasoningDomain;
  employeeExposureKnown?: boolean;
  equipmentInvolved?: string;
  applicabilityAnalysis?: ApplicabilityAnalysisResult;
  missingEvidence: HazLenzReasoningEvidenceGap[];
  isVague?: boolean;
};

export type CorrectiveActionReasoningResult = {
  engine: 'safescope_corrective_action_reasoning_v1';
  mode: 'deterministic_test_only_advisory';
  productionReasoningModified: false;
  jurisdiction: HazLenzJurisdiction;
  hazardDomain: HazLenzReasoningDomain;
  recommendations: CorrectiveActionRecommendation[];
  summary: {
    totalRecommendations: number;
    immediateCount: number;
    engineeringCount: number;
    administrativeCount: number;
    ppeCount: number;
    verificationCount: number;
  };
  reasoningBoundary: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    doesNotGuaranteeAbatement: true;
    requiresQualifiedReview: true;
    requiresSiteSpecificValidation: true;
  };
};
