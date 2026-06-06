import { Injectable } from '@nestjs/common';
import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

@Injectable()
export class ApprovedKnowledgeReviewApiValidator {
  
  static validate(decision: any): string[] {
    const errors: string[] = [];
    if (!decision.decisionId) errors.push('Missing decisionId');
    if (!decision.rationale) errors.push('Missing rationale');
    return errors;
  }
}
