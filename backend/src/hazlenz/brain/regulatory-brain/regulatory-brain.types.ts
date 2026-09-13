import { HazLenzBrainKnowledgeRecord, HazLenzBrainQueryResult } from '../hazlenz-brain.types';

export type HazLenzRegulatoryBrainRecord = HazLenzBrainKnowledgeRecord;

export type HazLenzRegulatoryBrainResult = HazLenzBrainQueryResult & {
  compartment: 'regulatory_brain';
};
