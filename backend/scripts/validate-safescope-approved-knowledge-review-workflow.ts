import { ReviewWorkflowService } from '../src/safescope-v2/approved-knowledge-review-workflow/review-workflow.service';
import { ReviewWorkflowStateMetadata } from '../src/safescope-v2/approved-knowledge-review-workflow/review-workflow.types';

async function validate() {
  const service = new ReviewWorkflowService();
  
  const state: ReviewWorkflowStateMetadata = {
    currentState: 'draft_candidate',
    transitions: [],
    advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true
    }
  };
  
  const transition = {
    fromState: 'draft_candidate' as any,
    toState: 'reviewer_assigned' as any,
    reviewerId: 'user-1',
    reviewerRole: 'safety_manager',
    reviewedAt: '2026-06-06',
    changeReason: 'Initial assignment'
  };
  
  const result = await service.transition(state, transition);
  
  console.log('Testing valid transition...');
  if (result.currentState !== 'reviewer_assigned') {
    console.error('Expected state reviewer_assigned');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
