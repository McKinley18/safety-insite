import { Injectable } from '@nestjs/common';
import {
  KnowledgeQueueActor,
  KnowledgeQueueResponseEnvelope,
} from './knowledge-review-queue.api-types';
import { KnowledgeReviewQueuePersistenceAdapter } from './knowledge-review-queue.persistence-adapter';
import { KnowledgeReviewQueueRouteScaffold } from './knowledge-review-queue.route-scaffold';
import { KnowledgeReviewQueueService } from './knowledge-review-queue.service';
import { KnowledgeReviewQueueStore } from './knowledge-review-queue.store';
import { SEED_RECORDS } from './governed-seed-records';

@Injectable()
export class KnowledgeReviewQueueProvider {
  private readonly store = new KnowledgeReviewQueueStore(SEED_RECORDS);
  private readonly service = new KnowledgeReviewQueueService();
  private readonly scaffold = new KnowledgeReviewQueueRouteScaffold(this.store, this.service);

  constructor(private readonly persistenceAdapter?: KnowledgeReviewQueuePersistenceAdapter) {}

  resolveActorFromRequest(input?: Partial<KnowledgeQueueActor>): KnowledgeQueueActor {
    return {
      actorId: input?.actorId ?? 'local-reviewer',
      role: input?.role ?? 'admin',
      planTier: input?.planTier ?? 'company',
    };
  }

  listQueue(actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.scaffold.listQueue(this.resolveActorFromRequest(actor));
  }

  getQueueItem(recordId: string, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.scaffold.getQueueItem(recordId, this.resolveActorFromRequest(actor));
  }

  createDraft(request: any, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.createDraft(request, this.resolveActorFromRequest(actor)));
  }

  approve(recordId: string, request: any, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.approve(recordId, request, this.resolveActorFromRequest(actor)));
  }

  reject(recordId: string, request: any, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.reject(recordId, request, this.resolveActorFromRequest(actor)));
  }

  requestMoreInfo(recordId: string, request: any, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.requestMoreInfo(recordId, request, this.resolveActorFromRequest(actor)));
  }

  supersede(recordId: string, request: any, actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.persistAfterAction(this.scaffold.supersede(recordId, request, this.resolveActorFromRequest(actor)));
  }

  listActiveRetrievalRecords(actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.scaffold.listActiveRetrievalRecords(this.resolveActorFromRequest(actor));
  }

  exportQueueSnapshot(actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
    return this.scaffold.exportQueueSnapshot(this.resolveActorFromRequest(actor));
  }

  persistenceReadiness(actor?: Partial<KnowledgeQueueActor>): KnowledgeQueueResponseEnvelope {
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

  private persistAfterAction(envelope: KnowledgeQueueResponseEnvelope): KnowledgeQueueResponseEnvelope {
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
