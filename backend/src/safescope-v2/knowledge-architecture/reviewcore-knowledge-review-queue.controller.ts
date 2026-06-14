import {
  ReviewCoreKnowledgeRecord,
  ReviewCoreKnowledgeRecordStatus,
} from './reviewcore-knowledge-record.types';
import {
  ReviewCoreKnowledgeReviewQueueService,
  ReviewCoreQueueActionResult,
  ReviewCoreQueueGuardrails,
} from './reviewcore-knowledge-review-queue.service';
import { ReviewCoreKnowledgeReviewQueueStore } from './reviewcore-knowledge-review-queue.store';

function statusOf(record: any): string {
  return String(record?.status ?? '').toLowerCase();
}

function isApprovedStatus(record: any): boolean {
  return (
    record?.status === ReviewCoreKnowledgeRecordStatus.GOVERNED ||
    statusOf(record) === 'approved' ||
    statusOf(record) === 'governed'
  );
}

export class ReviewCoreKnowledgeReviewQueueController {
  constructor(
    private readonly store = new ReviewCoreKnowledgeReviewQueueStore(),
    private readonly service = new ReviewCoreKnowledgeReviewQueueService(),
  ) {}

  private guardrails(): ReviewCoreQueueGuardrails {
    return {
      advisoryOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      requiresQualifiedReview: true,
      cannotOverrideRegulation: true,
      unapprovedRecordsAffectRetrieval: false,
    };
  }

  private wrap<T>(data: T) {
    return {
      data,
      guardrails: this.guardrails(),
    };
  }

  listQueue() {
    return this.wrap(this.service.listQueue(this.store.listRecords()));
  }

  getQueueItem(recordId: string) {
    return this.wrap(this.service.getQueueItem(recordId, this.store.listRecords()));
  }

  createDraft(input: any, actor: string) {
    const result = this.service.createDraft({
      ...input,
      createdBy: actor,
    });

    const record = (result.result as any).draftRecord ?? result.result;
    const persisted = this.store.saveRecord(record as ReviewCoreKnowledgeRecord);

    return this.wrap({
      ...result,
      result: persisted,
      activeRetrievalEligible: false,
      guardrails: this.guardrails(),
    });
  }

  approve(recordId: string, actor: string) {
    const record = this.store.getRecord(recordId);
    if (!record) {
      return this.wrap({
        result: { recordId, approved: false, blockers: ['record_not_found'] },
        activeRetrievalEligible: false,
        guardrails: this.guardrails(),
      });
    }

    const result = this.service.approve(record, actor, this.store.listRecords());

    if ((result.result as any).approved === true && isApprovedStatus((result.result as any).record)) {
      const persisted = this.store.saveRecord((result.result as any).record as ReviewCoreKnowledgeRecord);
      return this.wrap({
        ...result,
        result: {
          ...(result.result as any),
          record: persisted,
        },
        activeRetrievalEligible: true,
        guardrails: this.guardrails(),
      });
    }

    return this.wrap({
      ...result,
      activeRetrievalEligible: false,
      guardrails: this.guardrails(),
    });
  }

  reject(recordId: string, actor: string, reason: string) {
    const record = this.store.getRecord(recordId);
    if (!record) {
      return this.wrap({
        result: { recordId, reason, rejected: false, blockers: ['record_not_found'] },
        activeRetrievalEligible: false,
        guardrails: this.guardrails(),
      });
    }

    const result = this.service.reject(record, actor, reason);
    const rejectedRecord = {
      ...((result.result as any).record ?? record),
      status: 'rejected',
      reviewHistory: [
        ...(Array.isArray((record as any).reviewHistory) ? (record as any).reviewHistory : []),
        {
          action: 'reject',
          actor,
          reason,
          timestamp: new Date().toISOString(),
        },
      ],
    } as any;

    const persisted = this.store.saveRecord(rejectedRecord as ReviewCoreKnowledgeRecord);

    return this.wrap({
      ...result,
      result: {
        ...(result.result as any),
        record: persisted,
      },
      activeRetrievalEligible: false,
      guardrails: this.guardrails(),
    });
  }

  requestMoreInfo(recordId: string, actor: string, reason: string) {
    const record = this.store.getRecord(recordId);
    if (!record) {
      return this.wrap({
        result: { recordId, reason, updated: false, blockers: ['record_not_found'] },
        activeRetrievalEligible: false,
        guardrails: this.guardrails(),
      });
    }

    const result = this.service.requestMoreInfo(record, actor, reason);
    const updatedRecord = {
      ...((result.result as any).record ?? record),
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
      reviewNote: reason,
      reviewHistory: [
        ...(Array.isArray((record as any).reviewHistory) ? (record as any).reviewHistory : []),
        {
          action: 'request_more_info',
          actor,
          reason,
          timestamp: new Date().toISOString(),
        },
      ],
    } as any;

    const persisted = this.store.saveRecord(updatedRecord as ReviewCoreKnowledgeRecord);

    return this.wrap({
      ...result,
      result: {
        ...(result.result as any),
        record: persisted,
      },
      activeRetrievalEligible: false,
      guardrails: this.guardrails(),
    });
  }

  supersede(recordId: string, replacementInput: any, actor: string) {
    const oldRecord = this.store.getRecord(recordId);
    if (!oldRecord) {
      return this.wrap({
        result: { recordId, superseded: false, blockers: ['record_not_found'] },
        activeRetrievalEligible: false,
        guardrails: this.guardrails(),
      });
    }

    const replacementRecord = {
      ...oldRecord,
      ...replacementInput,
      id: replacementInput.id ?? `${oldRecord.id}-replacement`,
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
      reviewHistory: [
        ...(Array.isArray((replacementInput as any).reviewHistory) ? (replacementInput as any).reviewHistory : []),
        {
          action: 'created_as_replacement',
          actor,
          supersedesRecordId: oldRecord.id,
          timestamp: new Date().toISOString(),
        },
      ],
    } as ReviewCoreKnowledgeRecord;

    const result = this.service.supersede(oldRecord, replacementRecord, actor);

    const oldSuperseded = {
      ...((result.result as any).oldRecord ?? oldRecord),
      status: 'superseded',
      supersededByRecordId: replacementRecord.id,
      reviewHistory: [
        ...(Array.isArray((oldRecord as any).reviewHistory) ? (oldRecord as any).reviewHistory : []),
        {
          action: 'supersede',
          actor,
          replacementRecordId: replacementRecord.id,
          timestamp: new Date().toISOString(),
        },
      ],
    } as any;

    const replacementPending = {
      ...((result.result as any).replacementRecord ?? replacementRecord),
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
      supersedesRecordId: oldRecord.id,
    } as any;

    const persistedOld = this.store.saveRecord(oldSuperseded as ReviewCoreKnowledgeRecord);
    const persistedReplacement = this.store.saveRecord(replacementPending as ReviewCoreKnowledgeRecord);

    return this.wrap({
      ...result,
      result: {
        ...(result.result as any),
        oldRecord: persistedOld,
        replacementRecord: persistedReplacement,
      },
      activeRetrievalEligible: false,
      guardrails: this.guardrails(),
    });
  }

  listActiveRetrievalRecords() {
    return this.wrap({
      records: this.service.listActiveRetrievalRecords(this.store.listRecords()),
      guardrails: this.guardrails(),
    });
  }

  exportQueueSnapshot() {
    const queue = this.service.listQueue(this.store.listRecords());
    const snapshot = this.store.exportStoreSnapshot();

    return this.wrap({
      generatedAt: snapshot.generatedAt,
      counts: {
        ...snapshot.counts,
        lifecycleCounts: queue.result.lifecycleCounts,
      },
      records: snapshot.records,
      activeRetrievalRecordIds: snapshot.activeRetrievalRecordIds,
      guardrails: this.guardrails(),
    });
  }
}

export type ReviewCoreKnowledgeReviewQueueControllerResult<T = unknown> = {
  data: T;
  guardrails: ReviewCoreQueueGuardrails;
};
