import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';
import {
  SafeScopeLearningMemoryRecord,
  SafeScopeLearningSignalType,
} from '../learning-memory/learning-memory.types';

export type SafeScopeImprovementCandidateType =
  | 'citation_registry_candidate'
  | 'mechanism_registry_candidate'
  | 'domain_mapping_candidate'
  | 'scenario_disambiguation_candidate'
  | 'evidence_gate_candidate'
  | 'control_quality_candidate'
  | 'confidence_scoring_candidate';

export type SafeScopeImprovementCandidateUrgency =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type SafeScopeImprovementCandidateStatus =
  | 'candidate_only'
  | 'needs_qualified_review'
  | 'ready_for_backlog'
  | 'blocked_needs_more_evidence';

export type SafeScopeImprovementCandidateInput = {
  memories: SafeScopeLearningMemoryRecord[];
  minimumSupportCount?: number;
  limit?: number;
};

export type SafeScopeImprovementCandidate = {
  candidateId: string;
  type: SafeScopeImprovementCandidateType;
  title: string;
  targetKey: string;
  jurisdiction?: SafeScopeJurisdiction;
  domain?: SafeScopeReasoningDomain | string;
  citation?: string;
  mechanism?: string;
  scenarioId?: string;
  supportingMemoryIds: string[];
  supportCount: number;
  signalTypes: SafeScopeLearningSignalType[];
  urgency: SafeScopeImprovementCandidateUrgency;
  status: SafeScopeImprovementCandidateStatus;
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

export type SafeScopeImprovementCandidateResult = {
  engine: 'safescope_improvement_candidate_engine_v1';
  mode: 'read_only_governed_improvement_candidates';
  input: {
    memoryCount: number;
    minimumSupportCount: number;
    limit: number;
  };
  candidates: SafeScopeImprovementCandidate[];
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
