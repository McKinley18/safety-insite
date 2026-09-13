import { KnowledgeApprovalService } from '../src/hazlenz/knowledge-architecture/knowledge-approval.service';
import { KnowledgeRecord, KnowledgeRecordStatus, KnowledgeAuthorityTier } from '../src/hazlenz/knowledge-architecture/knowledge-record.types';

const service = new KnowledgeApprovalService();

const draft: KnowledgeRecord = {
  id: 'test-1',
  title: 'Test Record',
  content: 'Test Content',
  domain: 'machine_guarding',
  tags: [],
  authorityTier: KnowledgeAuthorityTier.EXPERIMENTAL,
  status: KnowledgeRecordStatus.DRAFT,
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
