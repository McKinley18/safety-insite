import { ReviewCoreKnowledgeRetrievalService } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-retrieval.service';
import { ReviewCoreKnowledgeRecordStatus } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

const service = new ReviewCoreKnowledgeRetrievalService();

// Test 1: Specific hazards retrieve correct domains.
const res1 = service.retrieveForObservation({ query: 'test', facets: ['FinancialCompliance', 'sample'] });
if (res1.length === 0) throw new Error('Test 1 failed: No records retrieved');

// Test 2: Guardrails are maintained.
const allGoverned = res1.every(r => r.status === ReviewCoreKnowledgeRecordStatus.GOVERNED && !r.guardrails.prohibitedLanguage);
if (!allGoverned) throw new Error('Test 2 failed: Guardrails violated');

console.log('Validation successful!');
