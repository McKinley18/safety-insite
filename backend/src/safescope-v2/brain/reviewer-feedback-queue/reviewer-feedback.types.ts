import { SafeScopeNormalizedObservationContext } from '../observation-context/observation-context.types';

export type FeedbackStatus = 'pending_review' | 'accepted_for_review' | 'promoted' | 'rejected' | 'duplicate' | 'needs_more_information';
export type FeedbackType = 'correct' | 'incorrect' | 'partially_correct' | 'too_generic' | 'unsafe_or_misleading' | 'missing' | 'unnecessary' | 'helpful' | 'unclear';

export type ReviewerFeedbackRecord = {
  id: string;
  createdAt: string;
  reviewerRole: string;
  sourceObservationId: string;
  rawObservation: string;
  normalizedContextSnapshot: SafeScopeNormalizedObservationContext;
  
  feedbackType: FeedbackType;
  feedbackSeverity: 'low' | 'moderate' | 'high' | 'critical';
  
  scenarioFamilyFeedback?: any;
  standardFamilyCandidateFeedback?: any;
  citationCandidateFeedback?: any;
  correctiveActionFeedback?: any;
  evidenceQuestionFeedback?: any;
  
  missingHazardDomain?: string;
  missingEquipmentContext?: string;
  missingTaskContext?: string;
  missingMechanismOfInjury?: string;
  missingControlFailure?: string;
  
  reviewerNotes?: string;
  recommendedDisposition: 'promote' | 'reject' | 'duplicate' | 'needs_info' | 'pending_review';
  status: FeedbackStatus;
  promotedToRegistryId?: string;
  rejectedReason?: string;
  
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
    doesNotSelfModifyWithoutApproval: boolean;
  };
};
