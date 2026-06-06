export interface SourceMetadata {
  agency: string;
  jurisdiction: string;
  sourceUrl: string;
  citation: string;
  title: string;
  effectiveDate: string;
  revisionDate: string;
}

export interface StagedSourceRecord {
  recordId: string;
  status: 'staged_only' | 'evaluated' | 'rejected';
  metadata: SourceMetadata;
  completenessScore: number;
  missingMetadata: string[];
  possibleDuplicateKeys: string[];
  governanceWarnings: string[];
  createdAt: string;
}
