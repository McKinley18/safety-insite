import { KnowledgeRecord } from '../knowledge-intake.types';
import { ApprovedKnowledgeQueryInput } from '../query/approved-knowledge-query.types';

export type ApprovedKnowledgeBridgeInput = {
  enabled?: boolean;
  classification?: string;
  hazardObservation?: string;
  query?: ApprovedKnowledgeQueryInput;
  limit?: number;
};

export type ApprovedKnowledgeBridgeReference = {
  recordId: string;
  citation: string;
  title: string;
  sourceAuthority: string;
  sourceUrl: string;
  sourceBoundary: string;
  standardIntent: string;
  evidenceNeeded: string[];
  applicabilityTriggers: string[];
  score: number;
  matchedFields: string[];
};

export type ApprovedKnowledgeBridgeResult = {
  engine: 'safescope_approved_knowledge_bridge';
  mode: 'disabled_by_default_read_only';
  enabled: boolean;
  classification?: string;
  approvedRecordCountAvailable: number;
  references: ApprovedKnowledgeBridgeReference[];
  recordsUsed: KnowledgeRecord[];
  reasoningUseBoundary: {
    canSupplementReasoning: boolean;
    canCreateCitations: false;
    canDeclareViolations: false;
    canOverrideRegulations: false;
    canBypassHumanReview: false;
    canUseUnapprovedRecords: false;
    productionReasoningModified: false;
  };
  bridgeNotes: string[];
};
