export enum ReviewCoreKnowledgeAuthorityTier {
  CORE = 'CORE',
  ENHANCED = 'ENHANCED',
  SUPPORTED = 'SUPPORTED',
  EXPERIMENTAL = 'EXPERIMENTAL',
}

export enum ReviewCoreKnowledgeRecordStatus {
  DRAFT = 'DRAFT',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  GOVERNED = 'GOVERNED',
  RETIRED = 'RETIRED',
}

export interface ReviewCoreKnowledgeRecord {
  id: string;
  title: string;
  content: string;
  domain: string;
  tags: string[];
  authorityTier: ReviewCoreKnowledgeAuthorityTier;
  status: ReviewCoreKnowledgeRecordStatus;
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
  guardrails: {
    prohibitedLanguage: boolean;
    confidentialData: boolean;
    isDuplicate: boolean;
  };
}
