import { KnowledgeRecordStatus } from '../src/hazlenz/knowledge-architecture/knowledge-record.types';
import { KnowledgeIngestionService } from '../src/hazlenz/knowledge-architecture/knowledge-ingestion.service';

const service = new KnowledgeIngestionService();

const draft = service.ingestDraft({ title: 'Test Record', sourceTitle: 'Test Source', domain: 'machine_guarding' });

if (draft.draftRecord.status !== KnowledgeRecordStatus.DRAFT) {
  throw new Error('Draft should have DRAFT status');
}

if (service.shouldActivateRecord(draft.draftRecord)) {
  throw new Error('Draft should not be active');
}

console.log('P9 Ingestion Validation Successful!');
