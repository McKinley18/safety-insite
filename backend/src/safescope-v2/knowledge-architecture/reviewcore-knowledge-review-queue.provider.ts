import { Injectable } from '@nestjs/common';
import {
  ReviewCoreQueueActor,
  ReviewCoreQueueResponseEnvelope,
} from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreKnowledgeReviewQueuePersistenceAdapter } from './reviewcore-knowledge-review-queue.persistence-adapter';
import { ReviewCoreKnowledgeReviewQueueRouteScaffold } from './reviewcore-knowledge-review-queue.route-scaffold';
import { ReviewCoreKnowledgeReviewQueueService } from './reviewcore-knowledge-review-queue.service';
import { ReviewCoreKnowledgeReviewQueueStore } from './reviewcore-knowledge-review-queue.store';
import { SEED_RECORDS } from './reviewcore-governed-seed-records';

@Injectable()
export class ReviewCoreKnowledgeReviewQueueProvider {
  private readonly store = new ReviewCoreKnowledgeReviewQueueStore(SEED_RECORDS);
  private readonly service = new ReviewCoreKnowledgeReviewQueueService();
  private readonly scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold(this.store, this.service);

  constructor(private readonly persistenceAdapter?: ReviewCoreKnowledgeReviewQueuePersistenceAdapter) {}

  resolveActorFromRequest(input?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueActor {
    return {
      actorId: input?.actorId ?? 'local-reviewer',
      role: input?.role ?? 'admin',
      planTier: input?.planTier ?? 'company',
    };
  }

  listQueue(actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.scaffold.listQueue(this.resolveActorFromRequest(actor));
  }

  getQueueItem(recordId: string, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.scaffold.getQueueItem(recordId, this.resolveActorFromRequest(actor));
  }

  createDraft(request: any, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.createDraft(request, this.resolveActorFromRequest(actor)));
  }

  approve(recordId: string, request: any, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.approve(recordId, request, this.resolveActorFromRequest(actor)));
  }

  reject(recordId: string, request: any, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.reject(recordId, request, this.resolveActorFromRequest(actor)));
  }

  requestMoreInfo(recordId: string, request: any, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.requestMoreInfo(recordId, request, this.resolveActorFromRequest(actor)));
  }

  supersede(recordId: string, request: any, actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.supersede(recordId, request, this.resolveActorFromRequest(actor)));
  }

  listActiveRetrievalRecords(actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.scaffold.listActiveRetrievalRecords(this.resolveActorFromRequest(actor));
  }

  exportQueueSnapshot(actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    return this.scaffold.exportQueueSnapshot(this.resolveActorFromRequest(actor));
  }

  persistenceReadiness(actor?: Partial<ReviewCoreQueueActor>): ReviewCoreQueueResponseEnvelope {
    const envelope = this.scaffold.persistenceReadiness(this.resolveActorFromRequest(actor));

    if (this.persistenceAdapter) {
      return {
        ...envelope,
        data: {
          ...(envelope.data ?? {}),
          persistence: this.persistenceAdapter.persistenceReadiness(),
        },
      };
    }

    return envelope;
  }

  resetForValidation(): void {
    this.store.reset();
  }

  private persistAfterAction(envelope: ReviewCoreQueueResponseEnvelope): ReviewCoreQueueResponseEnvelope {
    if (!this.persistenceAdapter) {
      return envelope;
    }

    this.persistenceAdapter.persistEnvelope(envelope).catch(() => {
      // Persistence is non-authoritative in P16. It must not convert denied/blocked actions
      // into approved actions or alter advisory guardrails.
    });

    return envelope;
  }
}
