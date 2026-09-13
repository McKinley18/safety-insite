import {
  KnowledgeQueueActionType,
  KnowledgeQueueActor,
  KnowledgeQueueAuditEvent,
} from './knowledge-review-queue.api-types';
import { KnowledgeQueueGuardrails } from './knowledge-review-queue.service';

let auditCounter = 0;

export class KnowledgeReviewQueueAudit {
  buildEvent(input: {
    action: KnowledgeQueueActionType;
    actor: KnowledgeQueueActor;
    recordId?: string;
    allowed: boolean;
    denied: boolean;
    reason?: string;
    blockers?: string[];
    beforeStatus?: string;
    afterStatus?: string;
    activeRetrievalEligible: boolean;
    guardrailSnapshot: KnowledgeQueueGuardrails;
  }): KnowledgeQueueAuditEvent {
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
