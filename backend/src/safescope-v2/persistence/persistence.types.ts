export type AuditRecordType = 
  | 'reviewer_candidate'
  | 'human_review_feedback'
  | 'source_ingestion_candidate'
  | 'source_promotion_audit'
  | 'reasoning_trace_snapshot'
  | 'visual_evidence_snapshot'
  | 'real_image_analysis_snapshot';

export interface SafeScopeAuditRecord {
  id: string;
  type: AuditRecordType;
  workspaceId?: string;
  inspectionId?: string;
  observationId?: string;
  traceId?: string;
  actorId?: string;
  actorRole?: string;
  status: string;
  payload: any;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecordFilter {
  type?: AuditRecordType;
  workspaceId?: string;
  inspectionId?: string;
  observationId?: string;
  traceId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
