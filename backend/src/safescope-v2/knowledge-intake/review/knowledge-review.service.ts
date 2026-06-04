import { KnowledgeRecord, ReviewStatus } from '../knowledge-intake.types';
import {
  KnowledgeReviewRequest,
  KnowledgeReviewResult,
} from './knowledge-review.types';

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidReviewDate(value: unknown): boolean {
  if (!hasText(value)) return false;
  return Number.isFinite(Date.parse(String(value)));
}

export class KnowledgeReviewService {
  review(record: KnowledgeRecord, request: KnowledgeReviewRequest): KnowledgeReviewResult {
    this.validateRequest(request);

    const previousStatus = record.reviewStatus;
    let newStatus: ReviewStatus = previousStatus;
    let approvedForUse = false;

    if (request.decision === 'mark_pending_review') {
      newStatus = 'pending_review';
      approvedForUse = false;
    }

    if (request.decision === 'reject') {
      newStatus = 'rejected';
      approvedForUse = false;
    }

    if (request.decision === 'approve_by_human') {
      this.validateHumanApproval(record, request);
      newStatus = 'approved_by_human';
      approvedForUse = true;
    }

    const reviewedRecord: KnowledgeRecord = {
      ...record,
      reviewStatus: newStatus,
      approvedForUse,
    };

    return {
      record: reviewedRecord,
      previousStatus,
      newStatus,
      approvedForUse,
      reviewerId: request.reviewerId,
      reviewerRole: request.reviewerRole,
      reviewedAt: request.reviewedAt,
      rationale: request.rationale,
      sourceBoundary:
        'Human review may approve a quarantined record for future use, but approval does not declare violations, override regulations, or bypass qualified professional judgment.',
    };
  }

  private validateRequest(request: KnowledgeReviewRequest): void {
    if (!hasText(request.reviewerId)) {
      throw new Error('Knowledge review requires reviewerId.');
    }

    if (!hasText(request.reviewerRole)) {
      throw new Error('Knowledge review requires reviewerRole.');
    }

    if (!hasText(request.rationale)) {
      throw new Error('Knowledge review requires rationale.');
    }

    if (!isValidReviewDate(request.reviewedAt)) {
      throw new Error('Knowledge review requires a valid reviewedAt timestamp.');
    }

    if (!['mark_pending_review', 'reject', 'approve_by_human'].includes(request.decision)) {
      throw new Error(`Unsupported knowledge review decision: ${request.decision}`);
    }
  }

  private validateHumanApproval(record: KnowledgeRecord, request: KnowledgeReviewRequest): void {
    if (!['safety_professional', 'industrial_hygienist', 'compliance_manager', 'system_admin'].includes(request.reviewerRole)) {
      throw new Error(`Reviewer role is not authorized for approval: ${request.reviewerRole}`);
    }

    if (record.reviewStatus !== 'pending_review') {
      throw new Error('Record must be pending_review before human approval.');
    }

    if (record.approvedForUse === true) {
      throw new Error('Record is already approved for use.');
    }

    if (record.sourceBoundary === 'prohibited') {
      throw new Error('Records with prohibited sourceBoundary cannot be approved.');
    }

    if (request.rationale.trim().length < 20) {
      throw new Error('Approval rationale must be specific and defensible.');
    }
  }
}
