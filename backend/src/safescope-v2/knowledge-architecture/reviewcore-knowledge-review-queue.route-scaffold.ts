import {
  ReviewCoreQueueActionType,
  ReviewCoreQueueActor,
  ReviewCoreQueueGovernanceTrace,
  ReviewCoreQueuePersistenceReadiness,
  ReviewCoreQueueResponseEnvelope,
} from './reviewcore-knowledge-review-queue.api-types';
import { ReviewCoreKnowledgeReviewQueueAudit } from './reviewcore-knowledge-review-queue.audit';
import { ReviewCoreKnowledgeReviewQueueController } from './reviewcore-knowledge-review-queue.controller';
import { ReviewCoreKnowledgeReviewQueueGuard } from './reviewcore-knowledge-review-queue.guard';
import { ReviewCoreKnowledgeReviewQueueService } from './reviewcore-knowledge-review-queue.service';
import { ReviewCoreKnowledgeReviewQueueStore } from './reviewcore-knowledge-review-queue.store';

const RETRIEVAL_BOUNDARY = 'Only approved/governed records are eligible for active retrieval.';

export class ReviewCoreKnowledgeReviewQueueRouteScaffold {
  private readonly store: ReviewCoreKnowledgeReviewQueueStore;
  private readonly controller: ReviewCoreKnowledgeReviewQueueController;
  private readonly guard: ReviewCoreKnowledgeReviewQueueGuard;
  private readonly audit: ReviewCoreKnowledgeReviewQueueAudit;

  constructor(
    store = new ReviewCoreKnowledgeReviewQueueStore(),
    service = new ReviewCoreKnowledgeReviewQueueService(),
    guard = new ReviewCoreKnowledgeReviewQueueGuard(),
    audit = new ReviewCoreKnowledgeReviewQueueAudit(),
  ) {
    this.store = store;
    this.controller = new ReviewCoreKnowledgeReviewQueueController(store, service);
    this.guard = guard;
    this.audit = audit;
  }

  private guardrails() {
    return {
      advisoryOnly: true as const,
      doesNotDeclareViolation: true as const,
      doesNotCreateCitation: true as const,
      requiresQualifiedReview: true as const,
      cannotOverrideRegulation: true as const,
      unapprovedRecordsAffectRetrieval: false as const,
    };
  }

  private trace(input: {
    actorAuthorized: boolean;
    planAuthorized: boolean;
    activeRetrievalEligible?: boolean;
    activeRetrievalChanged?: boolean;
    approvalReadinessBlockers?: string[];
    sourceReferenceRequired?: boolean;
    blockedReason?: string;
  }): ReviewCoreQueueGovernanceTrace {
    return {
      advisoryOnly: true,
      qualifiedReviewRequired: true,
      activeRetrievalChanged: input.activeRetrievalChanged ?? false,
      activeRetrievalEligible: input.activeRetrievalEligible ?? false,
      approvalReadinessBlockers: input.approvalReadinessBlockers ?? [],
      sourceReferenceRequired: input.sourceReferenceRequired ?? false,
      actorAuthorized: input.actorAuthorized,
      planAuthorized: input.planAuthorized,
      blockedReason: input.blockedReason,
      retrievalBoundary: RETRIEVAL_BOUNDARY,
    };
  }

  private envelope<T>(
    data: T,
    actor: ReviewCoreQueueActor,
    action: ReviewCoreQueueActionType,
    allowed: boolean,
    options: {
      recordId?: string;
      reason?: string;
      blockers?: string[];
      beforeStatus?: string;
      afterStatus?: string;
      activeRetrievalEligible?: boolean;
      activeRetrievalChanged?: boolean;
      planAuthorized?: boolean;
      actorAuthorized?: boolean;
      auditEvents?: any[];
    } = {},
  ): ReviewCoreQueueResponseEnvelope<T> {
    const governanceTrace = this.trace({
      actorAuthorized: options.actorAuthorized ?? allowed,
      planAuthorized: options.planAuthorized ?? allowed,
      activeRetrievalEligible: options.activeRetrievalEligible ?? false,
      activeRetrievalChanged: options.activeRetrievalChanged ?? false,
      approvalReadinessBlockers: options.blockers ?? [],
      sourceReferenceRequired: !!options.blockers?.includes('citation_or_source_reference_required'),
      blockedReason: allowed ? undefined : options.reason ?? options.blockers?.join(', ') ?? 'not_authorized',
    });

    const auditEvent = this.audit.buildEvent({
      action,
      actor,
      recordId: options.recordId,
      allowed,
      denied: !allowed,
      reason: options.reason,
      blockers: options.blockers ?? [],
      beforeStatus: options.beforeStatus,
      afterStatus: options.afterStatus,
      activeRetrievalEligible: options.activeRetrievalEligible ?? false,
      guardrailSnapshot: this.guardrails(),
    });

    return {
      data,
      guardrails: this.guardrails(),
      governanceTrace,
      auditEvent,
      auditEvents: options.auditEvents,
      generatedAt: new Date().toISOString(),
    };
  }

  private denied<T>(
    action: ReviewCoreQueueActionType,
    actor: ReviewCoreQueueActor,
    recordId: string | undefined,
    reason: string,
  ): ReviewCoreQueueResponseEnvelope<T> {
    return this.envelope(
      {
        denied: true,
        reason,
      } as T,
      actor,
      action,
      false,
      {
        recordId,
        reason,
        blockers: [reason],
        actorAuthorized: false,
        planAuthorized: !reason.includes('plan'),
      },
    );
  }

  listQueue(actor: ReviewCoreQueueActor) {
    const result = this.controller.listQueue();
    return this.envelope(result.data, actor, 'list_queue', true);
  }

  getQueueItem(recordId: string, actor: ReviewCoreQueueActor) {
    const result = this.controller.getQueueItem(recordId);
    return this.envelope(result.data, actor, 'get_queue_item', true, { recordId });
  }

  createDraft(request: any, actor: ReviewCoreQueueActor) {
    const decision = this.guard.canPerform('create_draft', actor);
    if (!decision.allowed) return this.denied('create_draft', actor, undefined, decision.reason);
    const result = this.controller.createDraft(request, actor.actorId);
    const record = (result.data as any).result;
    return this.envelope(result.data, actor, 'create_draft', true, {
      recordId: record?.id,
      afterStatus: record?.status,
      activeRetrievalEligible: false,
    });
  }

  approve(recordId: string, request: any, actor: ReviewCoreQueueActor) {
    const before = this.controller.getQueueItem(recordId).data?.result?.record;
    const decision = this.guard.canPerform('approve', actor, before?.status);
    if (!decision.allowed) return this.denied('approve', actor, recordId, decision.reason);

    const result = this.controller.approve(recordId, actor.actorId);
    const approved = (result.data as any).result?.approved === true;
    const record = (result.data as any).result?.record;
    const blockers = (result.data as any).approvalReadiness?.blockers ?? (result.data as any).result?.blockers ?? [];
    return this.envelope(result.data, actor, 'approve', approved, {
      recordId,
      beforeStatus: before?.status,
      afterStatus: record?.status ?? before?.status,
      activeRetrievalEligible: !!(result.data as any).activeRetrievalEligible,
      activeRetrievalChanged: approved,
      blockers,
      reason: approved ? undefined : blockers.join(', ') || 'approval_blocked',
    });
  }

  reject(recordId: string, request: any, actor: ReviewCoreQueueActor) {
    const before = this.controller.getQueueItem(recordId).data?.result?.record;
    const decision = this.guard.canPerform('reject', actor, before?.status);
    if (!decision.allowed) return this.denied('reject', actor, recordId, decision.reason);

    const result = this.controller.reject(recordId, actor.actorId, request?.reason ?? 'review rejected');
    const record = (result.data as any).result?.record;
    return this.envelope(result.data, actor, 'reject', true, {
      recordId,
      beforeStatus: before?.status,
      afterStatus: record?.status,
      activeRetrievalEligible: false,
      activeRetrievalChanged: false,
    });
  }

  requestMoreInfo(recordId: string, request: any, actor: ReviewCoreQueueActor) {
    const before = this.controller.getQueueItem(recordId).data?.result?.record;
    const decision = this.guard.canPerform('request_more_info', actor, before?.status);
    if (!decision.allowed) return this.denied('request_more_info', actor, recordId, decision.reason);

    const result = this.controller.requestMoreInfo(recordId, actor.actorId, request?.reason ?? 'more information requested');
    const record = (result.data as any).result?.record;
    return this.envelope(result.data, actor, 'request_more_info', true, {
      recordId,
      beforeStatus: before?.status,
      afterStatus: record?.status,
      activeRetrievalEligible: false,
      activeRetrievalChanged: false,
    });
  }

  supersede(recordId: string, request: any, actor: ReviewCoreQueueActor) {
    const before = this.controller.getQueueItem(recordId).data?.result?.record;
    const decision = this.guard.canPerform('supersede', actor, before?.status);
    if (!decision.allowed) return this.denied('supersede', actor, recordId, decision.reason);

    const result = this.controller.supersede(recordId, request?.replacementInput ?? request ?? {}, actor.actorId);
    return this.envelope(result.data, actor, 'supersede', true, {
      recordId,
      beforeStatus: before?.status,
      afterStatus: 'superseded',
      activeRetrievalEligible: false,
      activeRetrievalChanged: true,
    });
  }

  listActiveRetrievalRecords(actor: ReviewCoreQueueActor) {
    const result = this.controller.listActiveRetrievalRecords();
    return this.envelope(result.data, actor, 'list_active_retrieval_records', true, {
      activeRetrievalEligible: true,
    });
  }

  exportQueueSnapshot(actor: ReviewCoreQueueActor) {
    const result = this.controller.exportQueueSnapshot();
    return this.envelope(result.data, actor, 'export_queue_snapshot', true, {
      auditEvents: [],
    });
  }

  persistenceReadiness(actor: ReviewCoreQueueActor): ReviewCoreQueueResponseEnvelope<ReviewCoreQueuePersistenceReadiness> {
    return this.envelope(
      {
        routeScaffoldReady: true,
        authGuardReady: true,
        auditLogReady: true,
        databaseMigrationReady: false,
        durablePersistenceReady: false,
        frontendApiWiringReady: false,
        remainingRequirements: [
          'real NestJS provider/module registration',
          'authenticated actor resolution',
          'durable database table/entity',
          'audit log table/entity',
          'migration',
          'integration tests against actual HTTP routes',
        ],
      },
      actor,
      'persistence_readiness',
      true,
    );
  }
}
