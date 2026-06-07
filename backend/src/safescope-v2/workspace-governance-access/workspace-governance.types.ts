export type SafeScopeRole = 
  | 'owner'
  | 'admin'
  | 'safety_manager'
  | 'compliance_admin'
  | 'osha_general_industry_reviewer'
  | 'osha_construction_reviewer'
  | 'msha_reviewer'
  | 'field_inspector'
  | 'viewer';

export type PlanTier = 'individual' | 'team' | 'company' | 'enterprise';

export interface UserGovernanceContext {
  userId: string;
  workspaceId: string;
  role: SafeScopeRole;
  planTier: PlanTier;
  jurisdictionScopes: string[];
  reviewerQualifications: string[];
  assignedInspectionIds?: string[];
}

export type SafeScopePermission = 
  | 'run_classification'
  | 'view_traces'
  | 'view_audit_records'
  | 'view_candidates'
  | 'manage_candidates'
  | 'promote_knowledge'
  | 'ingest_sources'
  | 'review_osha_general'
  | 'review_osha_construction'
  | 'review_msha'
  | 'view_workspace_data'
  | 'edit_findings'
  | 'finalize_reports';

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  workspaceId: string;
}
