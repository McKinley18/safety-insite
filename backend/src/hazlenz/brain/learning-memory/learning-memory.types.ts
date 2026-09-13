import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzLearningReviewOutcome =
  | 'accepted'
  | 'corrected'
  | 'rejected'
  | 'held_for_evidence';

export type HazLenzLearningSignalType =
  | 'citation_correction'
  | 'mechanism_correction'
  | 'domain_correction'
  | 'scenario_correction'
  | 'evidence_gap'
  | 'control_quality'
  | 'confidence_adjustment'
  | 'reviewer_rationale';

export type HazLenzLearningMemoryRecord = {
  memoryId: string;
  source: 'supervisor_review' | 'alignment_audit' | 'field_test' | 'benchmark_review';
  createdAt: string;
  workspaceId?: string;
  snapshotId?: string;
  findingId?: string;

  jurisdiction?: HazLenzJurisdiction;
  originalDomain?: HazLenzReasoningDomain | string;
  correctedDomain?: HazLenzReasoningDomain | string;

  originalCitation?: string;
  correctedCitation?: string;

  originalMechanism?: string;
  correctedMechanism?: string;

  originalScenarioId?: string;
  correctedScenarioId?: string;

  reviewOutcome: HazLenzLearningReviewOutcome;
  signalTypes: HazLenzLearningSignalType[];

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

export type HazLenzLearningMemoryInput = Omit<
  HazLenzLearningMemoryRecord,
  'memoryId' | 'createdAt' | 'governance' | 'signalTypes'
> & {
  signalTypes?: HazLenzLearningSignalType[];
};

export type HazLenzLearningMemoryQuery = {
  jurisdiction?: HazLenzJurisdiction;
  domain?: string;
  citation?: string;
  mechanism?: string;
  scenarioId?: string;
  outcome?: HazLenzLearningReviewOutcome;
  limit?: number;
};

export type HazLenzLearningMemorySummary = {
  engine: 'safescope_learning_memory_v1';
  mode: 'read_only_governed_feedback_memory';
  totalRecords: number;
  outcomeCounts: Record<HazLenzLearningReviewOutcome, number>;
  signalCounts: Record<HazLenzLearningSignalType, number>;
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
