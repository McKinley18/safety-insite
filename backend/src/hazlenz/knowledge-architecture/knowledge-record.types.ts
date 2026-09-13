export enum KnowledgeAuthorityTier {
  CORE = 'CORE',
  ENHANCED = 'ENHANCED',
  SUPPORTED = 'SUPPORTED',
  EXPERIMENTAL = 'EXPERIMENTAL',
}

export enum KnowledgeRecordStatus {
  DRAFT = 'DRAFT',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  GOVERNED = 'GOVERNED',
  RETIRED = 'RETIRED',
}

export interface KnowledgeRecord {
  id: string;
  title: string;
  content: string;
  domain: string;
  tags: string[];
  authorityTier: KnowledgeAuthorityTier;
  status: KnowledgeRecordStatus;
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
  guardrails: {
    prohibitedLanguage: boolean;
    confidentialData: boolean;
    isDuplicate: boolean;
  };
}
