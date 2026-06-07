export type AttachmentType = 'photo' | 'video' | 'document' | 'note';
export type ViewType = 'wide_area' | 'close_up' | 'control_status' | 'employee_exposure' | 'equipment_id' | 'tag_label' | 'unknown';

export interface Attachment {
  id: string;
  type: AttachmentType;
  fileName?: string;
  capturedAt?: string;
  linkedFindingId?: string;
  caption?: string;
  fieldNotes?: string;
  locationTag?: string;
  viewType?: ViewType;
}

export interface VisualEvidenceReasoningInput {
  observationText: string;
  taxonomyRoute?: any;
  evidenceWeighting?: any;
  multiHazardAnalysis?: any;
  semanticSynonymExpansion?: any;
  attachments?: Attachment[];
  context?: any;
}

export interface VisualEvidenceReasoningResult {
  version: 'visual_evidence_reasoning_v1';
  evidencePresence: 'none' | 'present' | 'partial' | 'unclear';
  visualSupportLevel: 'supportive' | 'partially_supportive' | 'insufficient' | 'conflicting' | 'not_evaluated';
  photoEvidenceScore: number;
  linkedAttachmentCount: number;
  relevantAttachmentIds: string[];
  missingVisualEvidence: string[];
  visualConsistencyFlags: string[];
  reviewerQuestions: string[];
  confidenceImpact: 'boost' | 'neutral' | 'downgrade' | 'block_confident_language';
  advisoryBoundary: string;
}
