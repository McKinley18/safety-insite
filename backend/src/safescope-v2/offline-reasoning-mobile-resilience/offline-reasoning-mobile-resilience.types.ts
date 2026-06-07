export type OfflineReasoningMode = 'offline_limited_advisory';

export interface OfflineKnowledgePackVersion {
  version: string;
  generatedAt: string;
  isStale: boolean;
}

export interface OfflineReasoningInput {
  observationText: string;
  hazardDomainCandidates?: string[];
  siteType?: string;
  jurisdictionHints?: string[];
  visualAttachmentMetadata?: any[];
  timestamp: string;
  localInspectionId: string;
  localObservationId: string;
  offlineKnowledgePackVersion?: string;
  workspaceId?: string;
}

export interface OfflineReasoningResult {
  version: string;
  mode: OfflineReasoningMode;
  offlineAvailable: boolean;
  confidenceCeiling: number;
  advisorySummary: string;
  likelyHazardDomains: string[];
  evidenceGaps: string[];
  requiredSyncActions: string[];
  supervisorQuestions: string[];
  offlineRestrictions: string[];
  offlineTraceId: string;
  requiresHumanReview: true;
  requiresOnlineVerification: true;
  doesNotDeclareViolation: true;
  doesNotCreateCitation: true;
  cannotPromoteKnowledge: true;
  advisoryBoundary: string;
}
