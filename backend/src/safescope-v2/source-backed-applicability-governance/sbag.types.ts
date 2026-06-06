export type ApplicabilitySupportLevel = 'supported' | 'partially_supported' | 'weak' | 'unsupported';
export type CitationCandidateMode = 'blocked' | 'candidate_only_with_review' | 'source_backed_candidate_with_review';

export interface JurisdictionSupport {
  detectedJurisdiction: string;
  jurisdictionClear: boolean;
  requiresJurisdictionConfirmation: boolean;
  reasons: string[];
}

export interface StandardFamilySupport {
  canDiscussStandardFamily: boolean;
  supportedFamilies: string[];
  blockedFamilies: string[];
  reasons: string[];
}

export interface CitationCandidateSupport {
  canDiscussCitationCandidate: boolean;
  citationCandidateMode: CitationCandidateMode;
  candidates: string[];
  blockedReasons: string[];
}

export interface SourceSupport {
  approvedKnowledgeAvailable: boolean;
  sourceBackedSignals: string[];
  missingSourceNeeds: string[];
}

export interface AdvisoryGuardrails {
  advisoryOnly: boolean;
  doesNotDeclareViolation: boolean;
  doesNotCreateCitation: boolean;
  requiresQualifiedReview: boolean;
}

export interface SourceBackedApplicabilityGovernanceOutput {
  engine: string;
  version: string;
  applicabilitySupportLevel: ApplicabilitySupportLevel;
  jurisdictionSupport: JurisdictionSupport;
  standardFamilySupport: StandardFamilySupport;
  citationCandidateSupport: CitationCandidateSupport;
  sourceSupport: SourceSupport;
  applicabilityLimits: string[];
  requiredReviewerConfirmations: string[];
  decisionTrace: string[];
  advisoryGuardrails: AdvisoryGuardrails;
}
