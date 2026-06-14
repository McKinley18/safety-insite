import { ReviewCoreKnowledgeApprovalService } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-approval.service';
import { ReviewCoreKnowledgeRecord, ReviewCoreKnowledgeRecordStatus, ReviewCoreKnowledgeAuthorityTier } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

const service = new ReviewCoreKnowledgeApprovalService();

const draft: ReviewCoreKnowledgeRecord = {
  id: 'test-1',
  title: 'Test Record',
  content: 'Test Content',
  domain: 'machine_guarding',
  tags: [],
  authorityTier: ReviewCoreKnowledgeAuthorityTier.EXPERIMENTAL,
  status: ReviewCoreKnowledgeRecordStatus.DRAFT,
  fingerprint: 'test-fingerprint',
  createdAt: new Date(),
  updatedAt: new Date(),
  guardrails: {
    prohibitedLanguage: false,
    confidentialData: false,
    isDuplicate: false,
  },
};

const queue = service.buildApprovalQueue([draft]);
if (queue.length !== 1 || queue[0].recordId !== 'test-1') {
  throw new Error('Approval queue population failed');
}

console.log('P10 Approval Validation Successful!');
