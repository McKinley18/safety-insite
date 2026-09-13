import { AuthorityTier, HazardDomain, KnowledgeRecord, KnowledgeUseBoundary, SourceType } from '../knowledge-intake.types';

export type ApprovedKnowledgeQueryInput = {
  text?: string;
  citation?: string;
  sourceAuthority?: string;
  sourceType?: SourceType;
  authorityTier?: AuthorityTier;
  hazardDomain?: HazardDomain;
  sourceBoundary?: KnowledgeUseBoundary;
  limit?: number;
};

export type ApprovedKnowledgeQueryMatch = {
  record: KnowledgeRecord;
  score: number;
  matchedFields: string[];
};

export type ApprovedKnowledgeQueryResult = {
  engine: 'safescope_approved_knowledge_query';
  mode: 'read_only_human_reviewed_bundle';
  query: ApprovedKnowledgeQueryInput;
  totalApprovedRecordsAvailable: number;
  matchCount: number;
  matches: ApprovedKnowledgeQueryMatch[];
  guardrails: {
    readOnly: true;
    approvedRecordsOnly: true;
    cannotApproveRecords: true;
    cannotModifyRecords: true;
    cannotDeclareViolations: true;
    cannotOverrideRegulations: true;
  };
};
