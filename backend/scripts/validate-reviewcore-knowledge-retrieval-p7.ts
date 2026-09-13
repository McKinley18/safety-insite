import { KnowledgeRetrievalService } from '../src/hazlenz/knowledge-architecture/knowledge-retrieval.service';
import { KnowledgeRecordStatus } from '../src/hazlenz/knowledge-architecture/knowledge-record.types';

const service = new KnowledgeRetrievalService();

// Test 1: Specific hazards retrieve correct domains.
const res1 = service.retrieveForObservation({ query: 'test', facets: ['FinancialCompliance', 'sample'] });
if (res1.length === 0) throw new Error('Test 1 failed: No records retrieved');

// Test 2: Guardrails are maintained.
const allGoverned = res1.every(r => r.status === KnowledgeRecordStatus.GOVERNED && !r.guardrails.prohibitedLanguage);
if (!allGoverned) throw new Error('Test 2 failed: Guardrails violated');

console.log('Validation successful!');
