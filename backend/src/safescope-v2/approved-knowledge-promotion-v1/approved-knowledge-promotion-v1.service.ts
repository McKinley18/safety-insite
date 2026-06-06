import { Injectable } from '@nestjs/common';
import { ApprovedKnowledgePromotionValidator } from './approved-knowledge-promotion-v1.validator';
import { PromotionMetadata, PromotionResult } from './approved-knowledge-promotion-v1.types';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgePromotionService {
  
  async promote(record: ApprovedKnowledgeRecord, metadata: PromotionMetadata): Promise<PromotionResult> {
    const errors = ApprovedKnowledgePromotionValidator.validatePromotion(record, metadata);
    
    if (errors.length > 0) {
        return {
            decision: 'rejected',
            reasons: errors,
            missingFields: errors.filter(e => e.includes('Missing')),
        };
    }

    const approvedRecordCandidate: ApprovedKnowledgeRecord = {
        ...JSON.parse(JSON.stringify(record)),
        status: 'approved',
        governance: {
            ...record.governance,
            approvedBy: metadata.approvedBy,
            approvedAt: metadata.approvedAt,
            reviewerRole: metadata.reviewerRole,
            changeReason: metadata.changeReason
        }
    };

    return {
        decision: 'approved',
        reasons: [],
        missingFields: [],
        approvedRecordCandidate
    };
  }
}
