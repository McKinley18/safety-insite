export type IntakeDecision = 'approved_candidate' | 'needs_review' | 'rejected' | 'blocked';
export type AuthorityTier = 'primary_regulation' | 'official_guidance' | 'consensus_standard' | 'company_policy' | 'unknown';
export type MappingConfidence = 'high' | 'moderate' | 'low' | 'insufficient';

export interface SourceAuthority {
  agency: string;
  authorityTier: AuthorityTier;
  jurisdiction: string;
  sourceUrl: string;
  citation: string;
  title: string;
  effectiveDate: string;
  revisionDate: string;
  sourceDateStatus: 'current' | 'outdated' | 'unknown';
}

export interface SourceQuality {
  hasCitation: boolean;
  hasTitle: boolean;
  hasJurisdiction: boolean;
  hasEffectiveDate: boolean;
  hasRevisionDate: boolean;
  hasSourceUrl: boolean;
  qualityScore: number;
}

export interface DuplicateGovernance {
  possibleDuplicate: boolean;
  duplicateKeys: string[];
  duplicateReasons: string[];
  recommendedMergeAction: 'none' | 'review_merge' | 'reject_duplicate';
}

export interface MappingGovernance {
  standardFamily: string;
  hazardFamilies: string[];
  mechanisms: string[];
  equipmentGroups: string[];
  applicabilitySignals: string[];
  mappingConfidence: MappingConfidence;
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface ApprovedSourceKnowledgeIntakeGovernanceOutput {
  engine: string;
  version: string;
  intakeDecision: IntakeDecision;
  sourceAuthority: SourceAuthority;
  sourceQuality: SourceQuality;
  duplicateGovernance: DuplicateGovernance;
  mappingGovernance: MappingGovernance;
  reviewerRequirements: string[];
  blockedReasons: string[];
  governanceWarnings: string[];
  auditTrailRequirements: string[];
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
