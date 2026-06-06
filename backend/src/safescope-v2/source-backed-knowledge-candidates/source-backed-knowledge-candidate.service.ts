import { Injectable } from '@nestjs/common';
import { SourceBackedKnowledgeCandidate } from './source-backed-knowledge-candidate.types';

@Injectable()
export class SourceBackedKnowledgeCandidateService {
  
  createCandidate(id: string, record: any): SourceBackedKnowledgeCandidate {
    return {
      candidateId: id,
      candidateVersion: '1.0.0',
      status: 'reviewer_required',
      record,
      reviewNeeds: ['Requires qualified safety review'],
      sourceNeeds: [],
      mappingNeeds: [],
      duplicateKeys: [record.recordId],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      },
    };
  }
}
