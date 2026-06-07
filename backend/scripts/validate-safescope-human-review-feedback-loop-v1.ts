import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { HumanReviewFeedbackLoopValidator } from '../src/safescope-v2/human-review-feedback-loop/human-review-feedback-loop.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'accepted as-is',
        text: 'Unguarded conveyor tail pulley.',
        context: { humanReview: { reviewerRole: 'safety_manager', reviewerDecision: 'accepted' } },
        expectDisposition: 'accept_no_learning_needed'
    },
    { 
        name: 'hazard family correction',
        text: 'Unguarded conveyor.',
        context: { 
            humanReview: { 
                reviewerRole: 'safety_manager', 
                reviewerDecision: 'corrected',
                correctedHazardFamily: 'mechanical'
            } 
        },
        expectDisposition: 'create_reviewed_learning_candidate'
    },
    { 
        name: 'unsafe flag',
        text: 'Damaged cord.',
        context: { humanReview: { reviewerRole: 'safety_manager', reviewerDecision: 'unsafe' } },
        expectDisposition: 'block_unsafe_learning'
    },
    { 
        name: 'legal claim blocked',
        text: 'Blocked exit.',
        context: { 
            humanReview: { 
                reviewerRole: 'safety_reviewer', 
                reviewerDecision: 'corrected',
                reviewerNotes: 'This is a violation and a citation should be issued.'
            } 
        },
        expectDisposition: 'block_unsafe_learning'
    },
    { 
        name: 'source-backed correction',
        text: 'Chemical container.',
        context: { 
            humanReview: { 
                reviewerRole: 'compliance_admin', 
                reviewerDecision: 'corrected',
                correctedMechanism: 'chemical_burn',
                sourceReference: 'OSHA 1910.1200'
            } 
        },
        expectDisposition: 'create_approved_knowledge_candidate'
    },
    { 
        name: 'vague notes rejected',
        text: 'Fall hazard.',
        context: { 
            humanReview: { 
                reviewerRole: 'safety_manager', 
                reviewerDecision: 'corrected',
                reviewerNotes: 'bad'
            } 
        },
        expectDisposition: 'reject_learning'
    }
  ];

  for (const tc of testCases) {
      console.log('--- Testing human review: ' + tc.name + ' ---');
      const retrieval = await retrievalService.retrieve(tc.text, tc.context);
      const feedback = retrieval.reviewFeedback;
      
      if (!feedback) {
          console.error('[FAIL] No review feedback returned for ' + tc.name);
          process.exit(1);
      }

      const errors = HumanReviewFeedbackLoopValidator.validate(feedback);
      if (errors.length > 0) {
          console.error('[FAIL] Validator errors for ' + tc.name + ':', errors);
          process.exit(1);
      }
      
      if (feedback.learningDisposition !== tc.expectDisposition) {
          console.error('[FAIL] Expected disposition ' + tc.expectDisposition + ' for ' + tc.name + '. Got: ' + feedback.learningDisposition);
          process.exit(1);
      }

      console.log('[PASS] Case: ' + tc.name);
  }

  console.log('✅ SafeScope human review feedback loop validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
