import { SafeScopeBrainKnowledgeRecord, SafeScopeBrainQueryResult } from '../safescope-brain.types';

export type SafeScopeRegulatoryBrainRecord = SafeScopeBrainKnowledgeRecord;

export type SafeScopeRegulatoryBrainResult = SafeScopeBrainQueryResult & {
  compartment: 'regulatory_brain';
};
