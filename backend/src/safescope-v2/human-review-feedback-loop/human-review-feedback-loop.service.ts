import { Injectable, ForbiddenException } from '@nestjs/common';
import { 
  HumanReviewInput, 
  HumanReviewFeedbackResult, 
  LearningDisposition, 
  ReviewReliability 
} from './human-review-feedback-loop.types';
import { ReviewerCandidateConsoleService } from '../reviewer-candidate-console/reviewer-candidate-console.service';
import { SafeScopePersistenceService } from '../persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../role-based-approval-gates/role-based-approval-gates.service';
import { ReviewerRole } from '../role-based-approval-gates/role-based-approval-gates.types';
import { WorkspaceGovernanceAccessService } from '../workspace-governance-access/workspace-governance-access.service';
import { UserGovernanceContext } from '../workspace-governance-access/workspace-governance.types';

@Injectable()
export class HumanReviewFeedbackLoopService {
  constructor(
    private readonly consoleService: ReviewerCandidateConsoleService,
    private readonly persistence: SafeScopePersistenceService,
    private readonly gates: RoleBasedApprovalGatesService,
    private readonly access: WorkspaceGovernanceAccessService,
  ) {}

  async processReview(input: HumanReviewInput, user?: UserGovernanceContext): Promise<HumanReviewFeedbackResult> {
    const feedbackId = 'feedback-' + Date.now();
    const auditTrail: string[] = ['Review process initiated for feedback ' + feedbackId];
    
    // 0. Workspace Access Check
    if (user) {
        const decision = this.access.can(user, 'manage_candidates', { workspaceId: input.context?.workspaceId });
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }

    // 1. Role Gate Check
    const gateResult = this.gates.evaluate({
      role: input.reviewerRole as ReviewerRole,
      action: 'approve', 
      candidateType: 'human_review_learning',
      metadata: {
          affectsRegulatoryApplicability: !!(input.correctedStandardFamily || input.sourceReference)
      }
    });

    if (!gateResult.allowed) {
        throw new ForbiddenException(gateResult.reason);
    }

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

    if (input.sourceReference) {
      reviewReliability = 'high';
      auditTrail.push('High reliability assigned due to source reference.');
    }
    if (input.reviewerRole.toLowerCase().includes('safety') || input.reviewerRole.toLowerCase().includes('mgr')) {
      reviewReliability = 'high';
      auditTrail.push('Reliability boosted by professional role: ' + input.reviewerRole);
    }

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
                
                const candidateData = {
                    hazardFamily: input.correctedHazardFamily,
                    mechanism: input.correctedMechanism,
                    actions: input.correctedActions
                };
                
                learningCandidates.push({
                    type: 'correction',
                    data: candidateData
                });

                await this.consoleService.addCandidate({
                    candidateType: 'human_review_learning',
                    sourceSystem: 'human_review_feedback_loop',
                    priority: 'medium',
                    domainIds: [],
                    hazardFamilies: input.correctedHazardFamily ? [input.correctedHazardFamily] : [],
                    mechanisms: input.correctedMechanism ? [input.correctedMechanism] : [],
                    jurisdiction: input.correctedStandardFamily || 'unknown',
                    authorityTier: 'unknown',
                    sourceReferences: input.sourceReference ? [input.sourceReference] : [],
                    summary: 'Correction from ' + input.reviewerRole + ': ' + (input.reviewerNotes || 'No notes provided.'),
                    proposedKnowledgeText: JSON.stringify(candidateData),
                    evidenceBasis: input.observationText,
                    governanceFlags: [],
                    requiredReviewSteps: ['Verify correction against official sources']
                }, user?.workspaceId);

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

    if (input.missingEvidenceNotes) {
        recommendedValidatorUpdates.push('Add evidence signals based on reviewer notes: ' + input.missingEvidenceNotes);
        auditTrail.push('Validator update recommended based on missing evidence notes.');
    }

    const result: HumanReviewFeedbackResult = {
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

    await this.persistence.save({
        type: 'human_review_feedback',
        status: learningDisposition,
        payload: result,
        metadata: {
            reviewerRole: input.reviewerRole,
            reviewerDecision: input.reviewerDecision,
            reliability: reviewReliability,
            gateResult: { allowed: gateResult.allowed, reason: gateResult.reason }
        },
        workspaceId: user?.workspaceId || input.context?.workspaceId,
        observationId: input.context?.observationId
    });

    return result;
  }
}
