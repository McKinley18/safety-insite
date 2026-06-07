import { Injectable } from '@nestjs/common';
import { 
  HumanReviewInput, 
  HumanReviewFeedbackResult, 
  LearningDisposition, 
  ReviewReliability 
} from './human-review-feedback-loop.types';

@Injectable()
export class HumanReviewFeedbackLoopService {

  processReview(input: HumanReviewInput): HumanReviewFeedbackResult {
    const feedbackId = `feedback-${Date.now()}`;
    const auditTrail: string[] = [`Review process initiated for feedback ${feedbackId}`];
    
    let learningDisposition: LearningDisposition = 'accept_no_learning_needed';
    let reviewReliability: ReviewReliability = 'moderate';
    
    const acceptedCorrections: string[] = [];
    const rejectedCorrections: string[] = [];
    const learningCandidates: any[] = [];
    const blockedLearningReasons: string[] = [];
    const governanceFlags: string[] = [];
    const requiredFollowUp: string[] = [];
    const recommendedValidatorUpdates: string[] = [];
    const recommendedKnowledgeUpdates: string[] = [];

    // 1. Reliability Assessment
    if (input.sourceReference) {
      reviewReliability = 'high';
      auditTrail.push('High reliability assigned due to source reference.');
    }
    if (input.reviewerRole.toLowerCase().includes('safety') || input.reviewerRole.toLowerCase().includes('mgr')) {
      reviewReliability = 'high';
      auditTrail.push(`Reliability boosted by professional role: ${input.reviewerRole}`);
    }

    // 2. Governance Blocks
    const checkLegalLanguage = (text?: string) => {
        if (!text) return false;
        const prohibited = ["is a violation", "creates a citation", "must comply", "regulatory violation"];
        return prohibited.some(p => text.toLowerCase().includes(p));
    };

    if (checkLegalLanguage(input.reviewerNotes) || checkLegalLanguage(input.correctedMechanism)) {
        learningDisposition = 'block_unsafe_learning';
        blockedLearningReasons.push('Feedback contains prohibited enforcement or legal language without approved source linkage.');
        auditTrail.push('Learning blocked due to prohibited legal language.');
    }

    // 3. Learning Logic
    if (learningDisposition !== 'block_unsafe_learning') {
        if (input.reviewerDecision === 'accepted') {
            learningDisposition = 'accept_no_learning_needed';
            auditTrail.push('Reviewer accepted output as-is.');
        } else if (input.reviewerDecision === 'unsafe') {
            learningDisposition = 'block_unsafe_learning';
            blockedLearningReasons.push('Reviewer flagged output as unsafe.');
            governanceFlags.push('UNSAFE_OUTPUT_REPORTED');
            auditTrail.push('Learning blocked: Output flagged as unsafe.');
        } else if (input.reviewerDecision === 'corrected') {
            if (input.correctedHazardFamily || input.correctedMechanism || input.correctedActions) {
                learningDisposition = 'create_reviewed_learning_candidate';
                if (input.sourceReference) {
                    learningDisposition = 'create_approved_knowledge_candidate';
                    auditTrail.push('Elevated to approved knowledge candidate due to source reference.');
                }
                
                if (input.correctedHazardFamily) acceptedCorrections.push('hazardFamily');
                if (input.correctedMechanism) acceptedCorrections.push('mechanism');
                if (input.correctedActions) acceptedCorrections.push('correctiveActions');
                
                learningCandidates.push({
                    type: 'correction',
                    data: {
                        hazardFamily: input.correctedHazardFamily,
                        mechanism: input.correctedMechanism,
                        actions: input.correctedActions
                    }
                });
            } else if (input.reviewerNotes && input.reviewerNotes.length < 10) {
                learningDisposition = 'reject_learning';
                blockedLearningReasons.push('Feedback notes are too vague for automated learning.');
                auditTrail.push('Learning rejected: Insufficient detail in notes.');
            } else {
                learningDisposition = 'hold_for_additional_review';
                auditTrail.push('Reviewer provided corrections but they require additional verification.');
            }
        }
    }

    // 4. Validator/Knowledge Recommendations
    if (input.missingEvidenceNotes) {
        recommendedValidatorUpdates.push(`Add evidence signals based on reviewer notes: ${input.missingEvidenceNotes}`);
        auditTrail.push('Validator update recommended based on missing evidence notes.');
    }

    return {
      feedbackId,
      learningDisposition,
      reviewReliability,
      acceptedCorrections,
      rejectedCorrections,
      learningCandidates,
      blockedLearningReasons,
      duplicateSignals: [],
      governanceFlags,
      requiredFollowUp,
      recommendedValidatorUpdates,
      recommendedKnowledgeUpdates,
      auditTrail,
      advisoryBoundary: 'SafeScope human review feedback analysis is advisory only.'
    };
  }
}
