import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { ObservationNarrativeSynthesisResult } from '../observation-narrative-synthesis/observation-narrative-synthesis.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';
import { CorrectiveActionStrategyResult } from '../corrective-action-strategy-ranking/corrective-action-strategy-ranking.types';
import { RiskVerificationResidualRiskResult } from '../risk-verification-residual-risk/risk-verification-residual-risk.types';
import { HumanReviewFeedbackResult } from '../human-review-feedback-loop/human-review-feedback-loop.types';
import { SourceFreshnessGovernanceResult } from '../source-freshness-governance/source-freshness-governance.types';
import { JurisdictionApplicabilityResult } from '../jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.types';

export interface AuditReadyReasoningTraceInput {
  observationText: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  evaluatedScenarioMatches: any[];
  evidenceWeighting: EvidenceWeightingResult;
  multiHazardAnalysis: MultiHazardDecompositionResult;
  narrativeSynthesis: ObservationNarrativeSynthesisResult;
  causalChainAnalysis: CrossDomainCausalChainResult;
  correctiveActionStrategy: CorrectiveActionStrategyResult;
  residualRiskVerification: RiskVerificationResidualRiskResult;
  humanReviewFeedback?: HumanReviewFeedbackResult;
  sourceFreshness: Record<string, SourceFreshnessGovernanceResult>;
  jurisdictionApplicability: JurisdictionApplicabilityResult;
  context?: any;
}

export interface AuditReadyReasoningTraceResult {
  traceVersion: string;
  traceId: string;
  generatedAt: string;
  observationSummary: string;
  primaryDecisionPath: string[];
  supportingEvidence: string[];
  weakeningEvidence: string[];
  missingCriticalFacts: string[];
  detectedContradictions: string[];
  jurisdictionReasoning: string;
  sourceReasoning: string[];
  scenarioReasoning: string[];
  causalChainReasoning: string[];
  correctiveActionReasoning: string;
  residualRiskReasoning: string;
  confidenceModifiers: string[];
  rejectedAlternatives: string[];
  humanReviewGates: string[];
  advisoryBoundary: string;
  safeScopeLimitations: string[];
  reviewerChecklist: string[];
}
