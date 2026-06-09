export type Jurisdiction = 'msha' | 'osha_general_industry' | 'osha_construction' | 'company_policy_only' | 'unclear' | 'mixed' | 'cal_osha' | 'wa_dosh';
export type ApplicabilityConfidence = 'high' | 'moderate' | 'low' | 'insufficient';
export type ApplicabilityStatus = 'applicable' | 'likely_applicable' | 'possibly_applicable' | 'not_enough_information' | 'jurisdiction_conflict' | 'company_policy_only';

export interface JurisdictionApplicabilityInput {
  observationText: string;
  siteType?: string;
  industryContext?: string;
  taskContext?: string;
  equipmentInvolved?: string;
  taxonomyRoute?: any;
  approvedKnowledgeMatches?: any[];
  sourceFreshnessResults?: any;
  context?: any;
  scenarioFamily?: string;
}

export interface JurisdictionApplicabilityResult {
  primaryJurisdiction: Jurisdiction;
  secondaryJurisdictions: Jurisdiction[];
  applicabilityConfidence: ApplicabilityConfidence;
  applicabilityStatus: ApplicabilityStatus;
  matchedJurisdictionSignals: string[];
  conflictingJurisdictionSignals: string[];
  missingJurisdictionFacts: string[];
  allowedKnowledgeScopes: string[];
  blockedKnowledgeScopes: string[];
  humanReviewRequired: boolean;
  reviewerQuestions: string[];
  reasoningSummary: string;
  advisoryBoundary: string;
}
