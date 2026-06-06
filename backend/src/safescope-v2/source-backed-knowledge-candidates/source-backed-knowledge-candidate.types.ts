import { ApprovedKnowledgeRecord } from '../approved-knowledge-registry/approved-knowledge-record.types';

export interface SourceBackedKnowledgeCandidate {
  candidateId: string;
  candidateVersion: string;
  status: 'staged' | 'reviewer_required' | 'rejected';
  record: ApprovedKnowledgeRecord;
  reviewNeeds: string[];
  sourceNeeds: string[];
  mappingNeeds: string[];
  duplicateKeys: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
