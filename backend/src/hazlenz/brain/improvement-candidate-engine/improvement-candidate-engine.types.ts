import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import {
  HazLenzLearningMemoryRecord,
  HazLenzLearningSignalType,
} from '../learning-memory/learning-memory.types';

export type HazLenzImprovementCandidateType =
  | 'citation_registry_candidate'
  | 'mechanism_registry_candidate'
  | 'domain_mapping_candidate'
  | 'scenario_disambiguation_candidate'
  | 'evidence_gate_candidate'
  | 'control_quality_candidate'
  | 'confidence_scoring_candidate';

export type HazLenzImprovementCandidateUrgency =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type HazLenzImprovementCandidateStatus =
  | 'candidate_only'
  | 'needs_qualified_review'
  | 'ready_for_backlog'
  | 'blocked_needs_more_evidence';

export type HazLenzImprovementCandidateInput = {
  memories: HazLenzLearningMemoryRecord[];
  minimumSupportCount?: number;
  limit?: number;
};

export type HazLenzImprovementCandidate = {
  candidateId: string;
  type: HazLenzImprovementCandidateType;
  title: string;
  targetKey: string;
  jurisdiction?: HazLenzJurisdiction;
  domain?: HazLenzReasoningDomain | string;
  citation?: string;
  mechanism?: string;
  scenarioId?: string;
  supportingMemoryIds: string[];
  supportCount: number;
  signalTypes: HazLenzLearningSignalType[];
  urgency: HazLenzImprovementCandidateUrgency;
  status: HazLenzImprovementCandidateStatus;
  rationale: string;
  recommendedAction: string;
  governance: {
    readOnlyCandidate: true;
    canModifyProductionReasoning: false;
    canAutoApply: false;
    canAutoApproveRegistryChange: false;
    requiresQualifiedReview: true;
    auditTrailRequired: true;
  };
};

export type HazLenzImprovementCandidateResult = {
  engine: 'safescope_improvement_candidate_engine_v1';
  mode: 'read_only_governed_improvement_candidates';
  input: {
    memoryCount: number;
    minimumSupportCount: number;
    limit: number;
  };
  candidates: HazLenzImprovementCandidate[];
  summary: {
    totalCandidates: number;
    criticalCandidates: number;
    highCandidates: number;
    mediumCandidates: number;
    lowCandidates: number;
    topTargets: string[];
  };
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canModifyProductionReasoning: false;
    canAutoApply: false;
    canAutoApproveRegistryChange: false;
    requiresQualifiedReview: true;
  };
};
