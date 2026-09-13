export type LearningDisposition = 
  | 'accept_no_learning_needed'
  | 'create_reviewed_learning_candidate'
  | 'create_approved_knowledge_candidate'
  | 'update_validator_candidate'
  | 'hold_for_additional_review'
  | 'reject_learning'
  | 'block_unsafe_learning';

export type ReviewReliability = 'high' | 'moderate' | 'low' | 'unknown';

export interface HumanReviewInput {
  observationText: string;
  originalRetrievalOutput: any;
  originalFieldOutput: any;
  reviewerRole: string;
  reviewerDecision: 'accepted' | 'corrected' | 'rejected' | 'unsafe';
  reviewerCorrections?: boolean;
  reviewerNotes?: string;
  correctedHazardFamily?: string;
  correctedScenarioFamily?: string;
  correctedMechanism?: string;
  correctedStandardFamily?: string;
  correctedActions?: string[];
  missingEvidenceNotes?: string;
  unsafeOutputFlags?: string[];
  confidenceOverride?: number;
  sourceReference?: string;
  context?: any;
}

export interface HumanReviewFeedbackResult {
  feedbackId: string;
  learningDisposition: LearningDisposition;
  reviewReliability: ReviewReliability;
  acceptedCorrections: string[];
  rejectedCorrections: string[];
  learningCandidates: any[];
  blockedLearningReasons: string[];
  duplicateSignals: string[];
  governanceFlags: string[];
  requiredFollowUp: string[];
  recommendedValidatorUpdates: string[];
  recommendedKnowledgeUpdates: string[];
  auditTrail: string[];
  advisoryBoundary: string;
}
