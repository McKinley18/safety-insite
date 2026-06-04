import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
  SafeScopeReasoningEvidenceGap,
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
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
  employeeExposureKnown?: boolean;
  equipmentInvolved?: string;
  applicabilityAnalysis?: ApplicabilityAnalysisResult;
  missingEvidence: SafeScopeReasoningEvidenceGap[];
};

export type CorrectiveActionReasoningResult = {
  engine: 'safescope_corrective_action_reasoning_v1';
  mode: 'deterministic_test_only_advisory';
  productionReasoningModified: false;
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
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
