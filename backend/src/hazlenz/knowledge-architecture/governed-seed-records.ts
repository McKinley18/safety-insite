import { KnowledgeRecord, KnowledgeRecordStatus, KnowledgeAuthorityTier } from './knowledge-record.types';

export const SEED_RECORDS: KnowledgeRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `seed-${i}`,
  title: `Sample Record ${i}`,
  content: `This is a safe, non-copyrighted content for sample record ${i}.`,
  domain: 'FinancialCompliance',
  tags: ['sample', 'seed'],
  authorityTier: KnowledgeAuthorityTier.CORE,
  status: KnowledgeRecordStatus.GOVERNED,
  fingerprint: Buffer.from(`Sample Record ${i}:This is a safe, non-copyrighted content for sample record ${i}.`).toString('base64'),
  createdAt: new Date(),
  updatedAt: new Date(),
  guardrails: {
    prohibitedLanguage: false,
    confidentialData: false,
    isDuplicate: false,
  },
}));
