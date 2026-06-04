import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeAgency = 'MSHA' | 'OSHA' | 'NIOSH' | 'INTERNAL';

export type SafeScopeIndustryScope =
  | 'mining'
  | 'construction'
  | 'general_industry'
  | 'cross_domain'
  | 'unknown';

export type SafeScopeMineScope =
  | 'metal_nonmetal_surface'
  | 'metal_nonmetal_underground'
  | 'coal_surface'
  | 'coal_underground'
  | 'not_applicable'
  | 'unknown';

export type SafeScopeAuthorityTier =
  | 'tier_1_binding_regulation'
  | 'tier_2_official_policy_or_interpretation'
  | 'tier_3_authoritative_guidance'
  | 'tier_4_operational_best_practice'
  | 'tier_5_internal_or_user_generated'
  | 'prohibited_or_unverified';

export type SafeScopeVerificationStatus =
  | 'draft'
  | 'quarantined'
  | 'needs_expert_review'
  | 'approved_for_read_only_context'
  | 'approved_for_reasoning_support'
  | 'rejected'
  | 'deprecated';

export type SafeScopeBrainRecordBoundary = {
  canCreateCitation: false;
  canDeclareViolation: false;
  canOverrideRegulation: false;
  canBypassHumanReview: false;
  canInfluenceReasoning: boolean;
  requiresQualifiedReview: true;
};

export type SafeScopeBrainKnowledgeRecord = {
  recordId: string;
  title: string;

  agency: SafeScopeAgency;
  authorityTier: SafeScopeAuthorityTier;
  verificationStatus: SafeScopeVerificationStatus;

  jurisdiction: SafeScopeJurisdiction;
  industryScope: SafeScopeIndustryScope;
  mineScope?: SafeScopeMineScope;

  citation?: string;
  citationTitle?: string;
  standardPart?: string;
  standardSubpart?: string;

  hazardDomains: SafeScopeReasoningDomain[];
  mechanisms: string[];

  applicabilityTriggers: string[];
  exclusionTriggers: string[];

  requiredControls: string[];
  correctiveActionPatterns: string[];
  verificationEvidence: string[];
  evidenceQuestions: string[];

  plainLanguageSummary: string;
  sourceReference: string;
  sourceUrl?: string;
  sourceRevisionDate?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;

  boundary: SafeScopeBrainRecordBoundary;

  notes: string[];
};

export type SafeScopeBrainQuery = {
  jurisdiction?: SafeScopeJurisdiction;
  industryScope?: SafeScopeIndustryScope;
  mineScope?: SafeScopeMineScope;
  hazardDomain?: SafeScopeReasoningDomain;
  mechanism?: string;
  citation?: string;
  text?: string;
  approvedOnly?: boolean;
  limit?: number;
};

export type SafeScopeBrainMatch = {
  record: SafeScopeBrainKnowledgeRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type SafeScopeBrainQueryResult = {
  engine: 'safescope_brain';
  mode: 'read_only_governed_knowledge';
  query: SafeScopeBrainQuery;
  matches: SafeScopeBrainMatch[];
  totalAvailable: number;
  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
  };
};
