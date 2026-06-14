import { ReviewCoreKnowledgeRecordStatus } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';
import { ReviewCoreKnowledgeIngestionService } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-ingestion.service';

const service = new ReviewCoreKnowledgeIngestionService();

const draft = service.ingestDraft({ title: 'Test Record', sourceTitle: 'Test Source', domain: 'machine_guarding' });

if (draft.draftRecord.status !== ReviewCoreKnowledgeRecordStatus.DRAFT) {
  throw new Error('Draft should have DRAFT status');
}

if (service.shouldActivateRecord(draft.draftRecord)) {
  throw new Error('Draft should not be active');
}

console.log('P9 Ingestion Validation Successful!');
