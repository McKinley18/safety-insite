import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzAgency = 'MSHA' | 'OSHA' | 'NIOSH' | 'INTERNAL';

export type HazLenzIndustryScope =
  | 'mining'
  | 'construction'
  | 'general_industry'
  | 'cross_domain'
  | 'unknown';

export type HazLenzMineScope =
  | 'metal_nonmetal_surface'
  | 'metal_nonmetal_underground'
  | 'coal_surface'
  | 'coal_underground'
  | 'not_applicable'
  | 'unknown';

export type HazLenzAuthorityTier =
  | 'tier_1_binding_regulation'
  | 'tier_2_official_policy_or_interpretation'
  | 'tier_3_authoritative_guidance'
  | 'tier_4_operational_best_practice'
  | 'tier_5_internal_or_user_generated'
  | 'prohibited_or_unverified';

export type HazLenzVerificationStatus =
  | 'draft'
  | 'quarantined'
  | 'needs_expert_review'
  | 'approved_for_read_only_context'
  | 'approved_for_reasoning_support'
  | 'rejected'
  | 'deprecated';

export type HazLenzBrainRecordBoundary = {
  canCreateCitation: false;
  canDeclareViolation: false;
  canOverrideRegulation: false;
  canBypassHumanReview: false;
  canInfluenceReasoning: boolean;
  requiresQualifiedReview: true;
};

export type HazLenzBrainKnowledgeRecord = {
  recordId: string;
  title: string;

  agency: HazLenzAgency;
  authorityTier: HazLenzAuthorityTier;
  verificationStatus: HazLenzVerificationStatus;

  jurisdiction: HazLenzJurisdiction;
  industryScope: HazLenzIndustryScope;
  mineScope?: HazLenzMineScope;

  citation?: string;
  citationTitle?: string;
  standardPart?: string;
  standardSubpart?: string;

  hazardDomains: HazLenzReasoningDomain[];
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

  boundary: HazLenzBrainRecordBoundary;

  notes: string[];
};

export type HazLenzBrainQuery = {
  jurisdiction?: HazLenzJurisdiction;
  industryScope?: HazLenzIndustryScope;
  mineScope?: HazLenzMineScope;
  hazardDomain?: HazLenzReasoningDomain;
  mechanism?: string;
  citation?: string;
  text?: string;
  approvedOnly?: boolean;
  limit?: number;
};

export type HazLenzBrainMatch = {
  record: HazLenzBrainKnowledgeRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type HazLenzBrainQueryResult = {
  engine: 'safescope_brain';
  mode: 'read_only_governed_knowledge';
  query: HazLenzBrainQuery;
  matches: HazLenzBrainMatch[];
  totalAvailable: number;
  boundary: {
    readOnly: true;
    canCreateCitation: false;
    canDeclareViolation: false;
    canOverrideRegulation: false;
    canBypassHumanReview: false;
  };
};
