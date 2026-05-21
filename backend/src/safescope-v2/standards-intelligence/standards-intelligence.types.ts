export type StandardsAgency = "MSHA" | "OSHA";
export type StandardsScope =
  | "msha"
  | "mining"
  | "osha-general-industry"
  | "osha-construction"
  | "all";

export type AuthorityTier = 1 | 2 | 3 | 4;

export type StandardApplicabilityBand =
  | "primary"
  | "supporting"
  | "contextual"
  | "excluded";

export interface StandardEvidenceRequirement {
  question: string;
  requiredForPrimary: boolean;
  missingEvidenceImpact: "low" | "medium" | "high";
}

export interface StandardExclusionRule {
  reason: string;
  keywordsAny?: string[];
  keywordsAll?: string[];
  excludeWhenMissingAny?: string[];
  excludeWhenMissingAll?: string[];
}

export interface StandardsIntelligenceRecord {
  citation: string;
  agency: StandardsAgency;
  scope: StandardsScope;
  part?: string;
  subpart?: string;
  title: string;
  standardText?: string;
  plainLanguageSummary: string;

  hazardFamilies: string[];
  equipmentTags: string[];
  taskTags: string[];
  exposureTags: string[];
  controlTags: string[];
  consequenceTags: string[];
  searchBoostTerms: string[];

  authorityTier: AuthorityTier;
  applicabilityBandDefault: StandardApplicabilityBand;
  severityDefault: "low" | "medium" | "high" | "critical";

  evidenceRequirements: StandardEvidenceRequirement[];
  exclusionRules: StandardExclusionRule[];
  crossDomainLinks: string[];
  sourceKey?: string;
  sourceName?: string;
  sourceType?: string;
  allowedUse?: string;
  requiresApproval?: boolean;
  approvedForAutoIngestion?: boolean;
  jurisdictionTags?: string[];
}
