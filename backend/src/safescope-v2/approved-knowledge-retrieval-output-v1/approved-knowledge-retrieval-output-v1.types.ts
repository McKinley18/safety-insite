import { EvidenceWeightingResult } from '../field-evidence-weighting/field-evidence-weighting.types';
import { MultiHazardDecompositionResult } from '../multi-hazard-decomposition/multi-hazard-decomposition.types';
import { ObservationNarrativeSynthesisResult } from '../observation-narrative-synthesis/observation-narrative-synthesis.types';
import { CrossDomainCausalChainResult } from '../cross-domain-causal-chain/cross-domain-causal-chain.types';
import { CorrectiveActionStrategyResult } from '../corrective-action-strategy-ranking/corrective-action-strategy-ranking.types';
import { RiskVerificationResidualRiskResult } from '../risk-verification-residual-risk/risk-verification-residual-risk.types';
import { HumanReviewFeedbackResult } from '../human-review-feedback-loop/human-review-feedback-loop.types';
import { SourceFreshnessGovernanceResult } from '../source-freshness-governance/source-freshness-governance.types';
import { JurisdictionApplicabilityResult } from '../jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.types';

export interface RetrievalOutput {
  version: string;
  observationSummary: string;
  taxonomyRoute: any;
  approvedKnowledgeMatches: any[];
  scenarioMatches: any[];
  evaluatedScenarios: any[];
  topScenario?: any;
  evidenceWeighting: EvidenceWeightingResult;
  multiHazardDecomposition: MultiHazardDecompositionResult;
  observationNarrative: ObservationNarrativeSynthesisResult;
  crossDomainCausalChain: CrossDomainCausalChainResult;
  correctiveActionStrategy: CorrectiveActionStrategyResult;
  riskVerification: RiskVerificationResidualRiskResult;
  sourceFreshnessGovernanceResults: Record<string, SourceFreshnessGovernanceResult>;
  jurisdictionApplicability: JurisdictionApplicabilityResult;
  reviewFeedback?: HumanReviewFeedbackResult;
  draftKnowledgeWarnings: string[];
  applicabilityAssessment: string;
  confidence: number;
  evidenceGaps: string[];
  advisoryBoundaries: string[];
  recommendedReviewerActions: string[];
  fieldOutputNotes: string;
}

