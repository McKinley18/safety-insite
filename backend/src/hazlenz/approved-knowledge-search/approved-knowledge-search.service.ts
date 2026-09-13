import { Injectable } from '@nestjs/common';
import { SearchResult } from './approved-knowledge-search.types';

@Injectable()
export class ApprovedKnowledgeSearchService {
  
  search(query: string): SearchResult[] {
    // Placeholder implementation for search.
    if (query.includes('conveyor') || query.includes('lockout')) {
        return [{
            recordId: 'rec-conveyor-nip',
            status: 'draft_candidate',
            sourceUsability: 'draft_review_required',
            matchReasons: ['Found conveyor-related draft'],
            reviewerWarning: ['Requires review'],
            advisoryGuardrails: { advisoryOnly: true, doesNotDeclareViolation: true, doesNotCreateCitation: true, requiresQualifiedReview: true }
        }];
    }
    return [];
  }
}
