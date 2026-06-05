export type SafeScopeRiskProfileId =
  | "simple_4x4"
  | "standard_5x5"
  | "advanced_6x6";

export type SafeScopePriorFinding = {
  id?: string | number;
  hazardCategory?: string;
  classification?: string;
  description?: string;
  location?: string;
  riskScore?: number;
  createdAt?: string;
  safeScopeResult?: any;
};

export type SafeScopeIntelligenceContext = {
  fusedText: string;
  promotedPrimary: any;
  classifierResult: any;
  evidenceTexts?: string[];
  expandedContext: any;
  primaryStandardsResult: any;
  generatedActions: any[];
  additionalHazards: any[];
  priorFindings?: SafeScopePriorFinding[];
};

import { ScenarioIntelligence } from './scenario-intelligence.types';
import { StandardFamilyCandidateRecord } from './standard-family-candidate.types';
import { EvidenceGapQuestionRecord } from './evidence-gap-question.types';
import { CitationLevelCandidateReview } from './citation-review.types';
import { CorrectiveActionReasoning } from './corrective-action.types';
import { RiskReasoning } from './risk-reasoning.types';
import { SafeScopeNormalizedObservationContext } from './observation-context.types';
import { SafeScopeNarrative } from './narrative.types';

export type SafeScopeIntelligenceResult = {
  observationContext?: SafeScopeNormalizedObservationContext;
  narrative?: SafeScopeNarrative;
  scenarioIntelligence?: ScenarioIntelligence;
  riskReasoning?: RiskReasoning;
  standardFamilyCandidates?: StandardFamilyCandidateRecord[];
  citationLevelCandidates?: CitationLevelCandidateReview[];
  evidenceGapQuestions?: EvidenceGapQuestionRecord[];
  correctiveActionReasoning?: CorrectiveActionReasoning;

  confidenceIntelligence?: any;
  operationalReasoning?: any;
  trendIntelligence?: any;
  energyTransferIntelligence?: any;
  evidenceQuality?: any;
  controlIntelligence?: any;
  barrierIntelligence?: any;
  eventSequence?: any;
  operationalState?: any;
  humanFactors?: any;
  contradictionIntelligence?: any;
  actionEffectiveness?: any;
  counterfactualIntelligence?: any;
  standardsReasoning?: any;
  decisionExplainability?: any;
  hazardGraph?: any;
  exposurePathIntelligence?: any;
  correlationIntelligence?: any;
  siteMemory?: any;
  learningGovernance?: any;
  learningMemory?: any;
  advisoryGuardrails?: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
};
