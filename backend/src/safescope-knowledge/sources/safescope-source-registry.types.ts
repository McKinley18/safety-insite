export type SafeScopeSourceAgency =
  | "MSHA"
  | "OSHA"
  | "NIOSH"
  | "CDC"
  | "CSB"
  | "ANSI"
  | "NFPA"
  | "MANUFACTURER"
  | "INTERNAL";

export type SafeScopeSourceType =
  | "regulation"
  | "policy_manual"
  | "standard_interpretation"
  | "fatality_alert"
  | "fatal_accident_report"
  | "incident_database"
  | "research_publication"
  | "best_practice_guidance"
  | "training_material"
  | "manufacturer_guidance"
  | "internal_learning";

export type SafeScopeAuthorityTier = 1 | 2 | 3 | 4 | 5;

export type SafeScopeAllowedUse =
  | "primary_regulatory_authority"
  | "official_guidance"
  | "incident_learning"
  | "supporting_best_practice"
  | "context_only"
  | "internal_workspace_learning";

export type SafeScopeRefreshCadence =
  | "manual"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

export interface SafeScopeSourceRegistryEntry {
  sourceKey: string;
  displayName: string;
  agency: SafeScopeSourceAgency;
  sourceType: SafeScopeSourceType;
  authorityTier: SafeScopeAuthorityTier;
  allowedUse: SafeScopeAllowedUse;

  baseUrl: string;
  description: string;
  jurisdictionTags: string[];
  hazardTags: string[];
  equipmentTags: string[];
  taskTags: string[];
  standardTags: string[];
  defaultLessonTags: string[];

  requiresApproval: boolean;
  approvedForAutoIngestion: boolean;
  refreshCadence: SafeScopeRefreshCadence;

  ingestionNotes: string;
  reviewerNotes: string;
}
