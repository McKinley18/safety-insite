import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecord,
  ReviewCoreKnowledgeRecordStatus,
} from './reviewcore-knowledge-record.types';
import { ReviewCoreKnowledgeIngestionService } from './reviewcore-knowledge-ingestion.service';
import { ReviewCoreKnowledgeApprovalService } from './reviewcore-knowledge-approval.service';

export interface ReviewCoreQueueGuardrails {
  advisoryOnly: true;
  doesNotDeclareViolation: true;
  doesNotCreateCitation: true;
  requiresQualifiedReview: true;
  cannotOverrideRegulation: true;
  unapprovedRecordsAffectRetrieval: false;
}

export interface ReviewCoreQueueActionResult<T = unknown> {
  result: T;
  approvalReadiness?: {
    ready: boolean;
    blockers: string[];
  };
  duplicateCandidates?: string[];
  reviewChecklist?: string[];
  activeRetrievalEligible: boolean;
  guardrails: ReviewCoreQueueGuardrails;
}

const QUEUE_GUARDRAILS: ReviewCoreQueueGuardrails = {
  advisoryOnly: true,
  doesNotDeclareViolation: true,
  doesNotCreateCitation: true,
  requiresQualifiedReview: true,
  cannotOverrideRegulation: true,
  unapprovedRecordsAffectRetrieval: false,
};

const REVIEW_CHECKLIST = [
  'Confirm authority tier and source provenance.',
  'Confirm citation/reference support where required.',
  'Check duplicate or superseded knowledge records.',
  'Confirm the record remains advisory-only and requires qualified review.',
  'Confirm active retrieval eligibility only after approval.',
];

function statusOf(record: any): string {
  return String(record?.status ?? '').toLowerCase();
}

function isApproved(record: any): boolean {
  return (
    record?.status === ReviewCoreKnowledgeRecordStatus.GOVERNED ||
    statusOf(record) === 'approved' ||
    statusOf(record) === 'governed'
  );
}

function hasCitationSupport(record: any): boolean {
  const candidates = [
    record?.citation,
    record?.primaryCitation,
    record?.standardCitation,
    record?.sourceCitation,
    record?.referenceCitation,
    record?.source?.citation,
    record?.metadata?.citation,
  ];

  const arrays = [
    record?.citations,
    record?.regulatoryReferences,
    record?.sourceReferences,
    record?.references,
    record?.sources,
  ];

  return (
    candidates.some((value) => typeof value === 'string' && value.trim().length > 0) ||
    arrays.some((value) => Array.isArray(value) && value.length > 0)
  );
}

function needsCitationSupport(record: any): boolean {
  const tier = String(record?.authorityTier ?? '').toLowerCase();
  return (
    tier.includes('core') ||
    tier.includes('enhanced') ||
    tier.includes('primary') ||
    tier.includes('official') ||
    tier.includes('regulation') ||
    tier.includes('guidance') ||
    record?.authorityTier === ReviewCoreKnowledgeAuthorityTier.CORE ||
    record?.authorityTier === ReviewCoreKnowledgeAuthorityTier.ENHANCED
  );
}

function duplicateCandidates(record: any, records: any[]): string[] {
  return records
    .filter((candidate) => candidate?.id !== record?.id)
    .filter((candidate) => {
      if (record?.duplicateOfRecordId && candidate?.id === record.duplicateOfRecordId) return true;
      if (candidate?.fingerprint && record?.fingerprint && candidate.fingerprint === record.fingerprint) return true;
      if (candidate?.title && record?.title && candidate.title === record.title) return true;
      return false;
    })
    .map((candidate) => String(candidate.id));
}

export class ReviewCoreKnowledgeReviewQueueService {
  private ingestion = new ReviewCoreKnowledgeIngestionService();
  private approval = new ReviewCoreKnowledgeApprovalService();

  private guardrails(): ReviewCoreQueueGuardrails {
    return { ...QUEUE_GUARDRAILS };
  }

  private readiness(record: any, records: any[] = []) {
    const blockers: string[] = [];

    if (!record) blockers.push('record_missing');
    if (record && needsCitationSupport(record) && !hasCitationSupport(record)) {
      blockers.push('citation_or_source_reference_required');
    }
    if (record?.guardrails?.prohibitedLanguage === true) {
      blockers.push('prohibited_language_flagged');
    }
    if (record?.guardrails?.confidentialData === true) {
      blockers.push('confidential_data_flagged');
    }
    if (record?.guardrails?.isDuplicate === true || duplicateCandidates(record, records).length > 0) {
      blockers.push('duplicate_review_required');
    }

    return {
      ready: blockers.length === 0,
      blockers,
    };
  }

  private wrap<T>(
    result: T,
    activeRetrievalEligible: boolean,
    extra: Partial<Omit<ReviewCoreQueueActionResult<T>, 'result' | 'guardrails' | 'activeRetrievalEligible'>> = {},
  ): ReviewCoreQueueActionResult<T> {
    return {
      result,
      activeRetrievalEligible,
      guardrails: this.guardrails(),
      ...extra,
    };
  }

  listQueue(records: ReviewCoreKnowledgeRecord[]) {
    const safeRecords = records ?? [];
    const queueItems = this.approval.buildApprovalQueue(safeRecords);
    const activeRetrievalRecordIds = this.listActiveRetrievalRecords(safeRecords).map((record: any) => record.id);

    return this.wrap(
      {
        queueItems,
        lifecycleCounts: {
          draft: safeRecords.filter((record: any) => record.status === ReviewCoreKnowledgeRecordStatus.DRAFT || statusOf(record) === 'draft').length,
          needs_review: safeRecords.filter((record: any) => record.status === ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION || statusOf(record) === 'needs_review' || statusOf(record) === 'pending_validation').length,
          approved: safeRecords.filter((record: any) => isApproved(record)).length,
          rejected: safeRecords.filter((record: any) => statusOf(record) === 'rejected').length,
          superseded: safeRecords.filter((record: any) => statusOf(record) === 'superseded').length,
          retired: safeRecords.filter((record: any) => record.status === ReviewCoreKnowledgeRecordStatus.RETIRED || statusOf(record) === 'retired').length,
        },
        activeRetrievalRecordIds,
      },
      false,
    );
  }

  getQueueItem(recordId: string, records: ReviewCoreKnowledgeRecord[]) {
    const record = (records ?? []).find((candidate: any) => candidate.id === recordId);
    const readiness = this.readiness(record, records as any[]);
    const duplicates = record ? duplicateCandidates(record, records as any[]) : [];

    return this.wrap(
      {
        record,
        approvalReadiness: readiness,
        duplicateCandidates: duplicates,
        reviewChecklist: REVIEW_CHECKLIST,
        activeRetrievalEligible: !!record && isApproved(record) && readiness.ready,
      },
      !!record && isApproved(record) && readiness.ready,
      {
        approvalReadiness: readiness,
        duplicateCandidates: duplicates,
        reviewChecklist: REVIEW_CHECKLIST,
      },
    );
  }

  createDraft(input: any) {
    const record = this.ingestion.ingestDraft(input) as any;
    const normalized = {
      ...record,
      status:
        record?.status === ReviewCoreKnowledgeRecordStatus.GOVERNED
          ? ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION
          : record?.status ?? ReviewCoreKnowledgeRecordStatus.DRAFT,
    };

    return this.wrap(normalized, false, {
      approvalReadiness: this.readiness(normalized),
      duplicateCandidates: [],
      reviewChecklist: REVIEW_CHECKLIST,
    });
  }

  approve(record: ReviewCoreKnowledgeRecord, reviewer: string, records: ReviewCoreKnowledgeRecord[] = []) {
    const readiness = this.readiness(record, records as any[]);
    if (!readiness.ready) {
      return this.wrap(
        {
          record,
          reviewer,
          approved: false,
          blockers: readiness.blockers,
        },
        false,
        {
          approvalReadiness: readiness,
          duplicateCandidates: duplicateCandidates(record as any, records as any[]),
          reviewChecklist: REVIEW_CHECKLIST,
        },
      );
    }

    const approvedRecord = this.approval.approveRecord(record, reviewer) as any;
    const normalized = {
      ...approvedRecord,
      status: approvedRecord?.status ?? ReviewCoreKnowledgeRecordStatus.GOVERNED,
    };

    return this.wrap(
      {
        record: normalized,
        reviewer,
        approved: true,
        blockers: [],
      },
      true,
      {
        approvalReadiness: readiness,
        duplicateCandidates: duplicateCandidates(record as any, records as any[]),
        reviewChecklist: REVIEW_CHECKLIST,
      },
    );
  }

  reject(record: ReviewCoreKnowledgeRecord, reviewer: string, reason: string) {
    const rejectedRecord = this.approval.rejectRecord(record, reviewer, reason) as any;
    return this.wrap(
      {
        record: {
          ...rejectedRecord,
          status: rejectedRecord?.status ?? 'rejected',
          reviewNote: reason,
        },
        reviewer,
        reason,
      },
      false,
      {
        approvalReadiness: { ready: false, blockers: ['record_rejected'] },
        duplicateCandidates: [],
        reviewChecklist: REVIEW_CHECKLIST,
      },
    );
  }

  requestMoreInfo(record: ReviewCoreKnowledgeRecord, reviewer: string, reason: string) {
    const updatedRecord = {
      ...(record as any),
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
      reviewNote: reason,
      reviewRequestedBy: reviewer,
    };

    return this.wrap(
      {
        record: updatedRecord,
        reviewer,
        reason,
      },
      false,
      {
        approvalReadiness: { ready: false, blockers: ['more_information_required'] },
        duplicateCandidates: [],
        reviewChecklist: REVIEW_CHECKLIST,
      },
    );
  }

  supersede(oldRecord: ReviewCoreKnowledgeRecord, replacementRecord: ReviewCoreKnowledgeRecord, reviewer: string) {
    const result = this.approval.supersedeRecord(oldRecord, replacementRecord, reviewer) as any;
    const oldSuperseded = {
      ...(result?.oldRecord ?? oldRecord),
      status: 'superseded',
      supersededByRecordId: (replacementRecord as any).id,
    };
    const replacementPending = {
      ...(result?.newRecord ?? replacementRecord),
      status:
        (replacementRecord as any).status === ReviewCoreKnowledgeRecordStatus.GOVERNED
          ? ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION
          : (replacementRecord as any).status ?? ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
      supersedesRecordId: (oldRecord as any).id,
    };

    return this.wrap(
      {
        oldRecord: oldSuperseded,
        replacementRecord: replacementPending,
        reviewer,
      },
      false,
      {
        approvalReadiness: this.readiness(replacementPending),
        duplicateCandidates: [],
        reviewChecklist: REVIEW_CHECKLIST,
      },
    );
  }

  listActiveRetrievalRecords(records: ReviewCoreKnowledgeRecord[]) {
    return (records ?? []).filter((record: any) => {
      if (!isApproved(record)) return false;
      if (record.duplicateOfRecordId) return false;
      if (record.guardrails?.prohibitedLanguage === true) return false;
      if (record.guardrails?.confidentialData === true) return false;
      return true;
    });
  }
}
