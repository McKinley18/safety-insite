import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeLearningReviewOutcome =
  | 'accepted'
  | 'corrected'
  | 'rejected'
  | 'held_for_evidence';

export type SafeScopeLearningSignalType =
  | 'citation_correction'
  | 'mechanism_correction'
  | 'domain_correction'
  | 'scenario_correction'
  | 'evidence_gap'
  | 'control_quality'
  | 'confidence_adjustment'
  | 'reviewer_rationale';

export type SafeScopeLearningMemoryRecord = {
  memoryId: string;
  source: 'supervisor_review' | 'alignment_audit' | 'field_test' | 'benchmark_review';
  createdAt: string;
  workspaceId?: string;
  snapshotId?: string;
  findingId?: string;

  jurisdiction?: SafeScopeJurisdiction;
  originalDomain?: SafeScopeReasoningDomain | string;
  correctedDomain?: SafeScopeReasoningDomain | string;

  originalCitation?: string;
  correctedCitation?: string;

  originalMechanism?: string;
  correctedMechanism?: string;

  originalScenarioId?: string;
  correctedScenarioId?: string;

  reviewOutcome: SafeScopeLearningReviewOutcome;
  signalTypes: SafeScopeLearningSignalType[];

  missingEvidence?: string[];
  reviewerRationale?: string;
  recommendedRegistryUpdate?: string;

  confidenceBefore?: number;
  confidenceAfter?: number;

  governance: {
    readOnlyMemory: true;
    canModifyProductionReasoning: false;
    canAutoApproveRegistryChange: false;
    requiresQualifiedReview: true;
    auditTrailRequired: true;
  };
};

export type SafeScopeLearningMemoryInput = Omit<
  SafeScopeLearningMemoryRecord,
  'memoryId' | 'createdAt' | 'governance' | 'signalTypes'
> & {
  signalTypes?: SafeScopeLearningSignalType[];
};

export type SafeScopeLearningMemoryQuery = {
  jurisdiction?: SafeScopeJurisdiction;
  domain?: string;
  citation?: string;
  mechanism?: string;
  scenarioId?: string;
  outcome?: SafeScopeLearningReviewOutcome;
  limit?: number;
};

export type SafeScopeLearningMemorySummary = {
  engine: 'safescope_learning_memory_v1';
  mode: 'read_only_governed_feedback_memory';
  totalRecords: number;
  outcomeCounts: Record<SafeScopeLearningReviewOutcome, number>;
  signalCounts: Record<SafeScopeLearningSignalType, number>;
  topCorrectionTargets: string[];
  recommendedImprovementBacklog: string[];
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canModifyProductionReasoning: false;
    canAutoApproveRegistryChange: false;
    requiresQualifiedReview: true;
  };
};
