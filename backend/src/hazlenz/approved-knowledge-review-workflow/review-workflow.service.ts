import { Injectable } from '@nestjs/common';
import { ReviewWorkflowState, WorkflowTransition, ReviewWorkflowStateMetadata } from './review-workflow.types';

@Injectable()
export class ReviewWorkflowService {
  
  async transition(state: ReviewWorkflowStateMetadata, transition: WorkflowTransition): Promise<ReviewWorkflowStateMetadata> {
    // Placeholder implementation for transition logic.
    
    const allowedRoles = ['qualified_safety_reviewer', 'safety_manager', 'safety_director', 'admin'];
    if (!allowedRoles.includes(transition.reviewerRole)) {
        throw new Error('Unauthorized reviewer role');
    }

    return {
        ...state,
        currentState: transition.toState,
        transitions: [...state.transitions, transition]
    };
  }
}
