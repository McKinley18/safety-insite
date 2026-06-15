import {
  ReviewCoreQueueActionType,
  ReviewCoreQueueActor,
  ReviewCoreQueueAuditEvent,
} from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreQueueGuardrails } from './reviewcore-knowledge-review-queue.service';

let auditCounter = 0;

export class ReviewCoreKnowledgeReviewQueueAudit {
  buildEvent(input: {
    action: ReviewCoreQueueActionType;
    actor: ReviewCoreQueueActor;
    recordId?: string;
    allowed: boolean;
    denied: boolean;
    reason?: string;
    blockers?: string[];
    beforeStatus?: string;
    afterStatus?: string;
    activeRetrievalEligible: boolean;
    guardrailSnapshot: ReviewCoreQueueGuardrails;
  }): ReviewCoreQueueAuditEvent {
    auditCounter += 1;

    return {
      eventId: `reviewcore-queue-audit-${auditCounter}`,
      action: input.action,
      actorId: input.actor.actorId,
      actorRole: input.actor.role,
      planTier: input.actor.planTier,
      recordId: input.recordId,
      timestamp: new Date().toISOString(),
      allowed: input.allowed,
      denied: input.denied,
      reason: input.reason,
      blockers: input.blockers ?? [],
      beforeStatus: input.beforeStatus,
      afterStatus: input.afterStatus,
      activeRetrievalEligible: input.activeRetrievalEligible,
      guardrailSnapshot: input.guardrailSnapshot,
    };
  }
}
