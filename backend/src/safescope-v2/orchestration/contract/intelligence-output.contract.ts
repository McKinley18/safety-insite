import { SafeScopeNormalizedObservationContext } from '../../brain/observation-context/observation-context.types';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';
import { StandardFamilyCandidateRecord } from '../../brain/standard-family-mapper/standard-family-candidate.types';
import { CitationLevelCandidateReview } from '../../brain/citation-review-brain/citation-review.types';
import { CorrectiveActionReasoning } from '../../brain/corrective-action-brain/corrective-action.types';
import { EvidenceGapQuestionRecord } from '../../brain/evidence-gap-question-generator/evidence-gap-question.types';

export type SafeScopeIntelligenceOutputContract = {
  contractVersion: string;
  engineVersion: string;
  generatedAt: string;
  traceId: string;
  inputSummary: any;
  observationContext?: SafeScopeNormalizedObservationContext;
  observationUnderstanding?: any;
  semanticRouting?: any;
  semanticConflicts?: any;
  jurisdictionAssessment?: any;
  scenarioIntelligence?: ScenarioIntelligence;
  scenarioFamilyMatches?: string[];
  multiHazardDecomposition?: any;
  standardFamilyReviewCandidates?: StandardFamilyCandidateRecord[];
  citationLevelReviewCandidates?: CitationLevelCandidateReview[];
  correctiveActionReasoning?: CorrectiveActionReasoning;
  evidenceGaps?: string[];
  followUpQuestions?: EvidenceGapQuestionRecord[];
  approvedSourceTrace?: string[];
  reviewerFeedbackTrace?: string[];
  confidenceSummary?: {
    overallConfidence: number;
    confidenceBand: string;
  };
  humanReviewSummary?: {
    qualifiedReviewRequired: boolean;
    reviewTriggers: string[];
  };
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
  auditTrace: string[];
};
