export type ReviewerRole = 
  | 'safety_reviewer'
  | 'safety_manager'
  | 'compliance_admin'
  | 'msha_competent_reviewer'
  | 'osha_general_industry_reviewer'
  | 'osha_construction_reviewer'
  | 'company_policy_admin'
  | 'visual_evidence_reviewer'
  | 'system_admin';

export type GateAction = 
  | 'approve'
  | 'reject'
  | 'block'
  | 'request_info'
  | 'promote'
  | 'archive'
  | 'override';

export interface GateInput {
  role: ReviewerRole;
  action: GateAction;
  candidateType: string;
  jurisdiction?: string;
  isRegulatory?: boolean;
  containsProhibitedLanguage?: boolean;
  priority?: string;
  metadata?: Record<string, any>;
}

export interface GateResult {
  allowed: boolean;
  reason: string;
  requiredRoles: ReviewerRole[];
  gateVersion: string;
  timestamp: string;
}
