export type KnowledgeStatus = 'approved' | 'draft_candidate' | 'retired' | 'rejected';
export type AuthorityAgency = 'OSHA' | 'MSHA' | 'NIOSH' | 'ANSI' | 'NFPA' | 'COMPANY' | 'UNKNOWN';
export type AuthorityTier = 'primary_regulation' | 'official_guidance' | 'consensus_standard' | 'company_policy' | 'unknown';
export type Jurisdiction = 'osha_general_industry' | 'osha_construction' | 'msha' | 'company_policy' | 'unknown';
export type SourceDateStatus = 'current' | 'outdated' | 'unknown';

export interface SourceAuthority {
  agency: AuthorityAgency;
  authorityTier: AuthorityTier;
  jurisdiction: Jurisdiction;
  sourceUrl: string;
  citation: string;
  title: string;
  effectiveDate: string;
  revisionDate: string;
  sourceDateStatus: SourceDateStatus;
}

export interface Mapping {
  domainId: string;
  standardFamily: string;
  hazardFamilies: string[];
  mechanisms: string[];
  equipmentGroups: string[];
  taskContexts: string[];
  applicabilitySignals: string[];
  requiredFacts: string[];
  disqualifyingFacts: string[];
  evidenceQuestions: string[];
}

export interface Applicability {
  plainLanguageSummary: string;
  appliesWhen: string;
  doesNotApplyWhen: string;
  requiredReviewerChecks: string[];
}

export interface CorrectiveActionLinks {
  preferredControlFamilies: string[];
  verificationMethods: string[];
  commonWeakActionsToAvoid: string[];
}

export interface GovernanceMetadata {
  approvedBy?: string;
  approvedAt?: string;
  lastReviewedAt?: string;
  reviewerRole?: string;
  changeReason?: string;
  supersedesRecordIds: string[];
  duplicateKeys: string[];
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface ApprovedKnowledgeRecord {
  recordId: string;
  version: string;
  status: KnowledgeStatus;
  authority: SourceAuthority;
  mapping: Mapping;
  applicability: Applicability;
  correctiveActionLinks: CorrectiveActionLinks;
  governance: GovernanceMetadata;
}
