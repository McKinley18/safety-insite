import { KnowledgeRecord } from './knowledge-intake.types';

export const createSourceModTemplate = (partialRecord: Partial<KnowledgeRecord>): KnowledgeRecord => {
  return {
    recordId: 'REPLACE_WITH_UUID',
    sourceAuthority: 'REPLACE_AUTHORITY',
    sourceType: 'cfr',
    authorityTier: 'federal_regulation',
    citation: 'REPLACE_CITATION',
    title: 'REPLACE_TITLE',
    sourceUrl: 'REPLACE_URL',
    retrievedAt: new Date().toISOString(),
    jurisdiction: 'US_FEDERAL',
    hazardDomains: [],
    applicabilityTriggers: [],
    standardIntent: 'REPLACE_INTENT',
    evidenceNeeded: [],
    nonApplicabilityQuestions: [],
    sourceBoundary: 'mandatory',
    reviewStatus: 'unreviewed',
    approvedForUse: false,
    ...partialRecord,
  };
};
