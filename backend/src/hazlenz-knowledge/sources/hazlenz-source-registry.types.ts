export type HazLenzSourceAgency =
  | "MSHA"
  | "OSHA"
  | "NIOSH"
  | "CDC"
  | "CSB"
  | "ANSI"
  | "ASSP"
  | "NFPA"
  | "ASTM"
  | "ISO"
  | "ACGIH"
  | "MANUFACTURER"
  | "INTERNAL";

export type HazLenzSourceType =
  | "regulation"
  | "policy_manual"
  | "standard_interpretation"
  | "fatality_alert"
  | "fatality_report"
  | "fatal_accident_report"
  | "incident_database"
  | "research_publication"
  | "niosh_publication"
  | "niosh_mining_publication"
  | "health_hazard_evaluation"
  | "niosh_alert"
  | "criteria_document"
  | "consensus_standard"
  | "consensus_standard_metadata"
  | "best_practice_guidance"
  | "training_material"
  | "manufacturer_guidance"
  | "internal_learning"
  | "internal_site_memory"
  | "internal_corrective_action_history"
  | "internal_repeat_finding"
  | "internal_training_record"
  | "internal_near_miss";

export type HazLenzAuthorityTier = 1 | 2 | 3 | 4 | 5;

export type HazLenzAllowedUse =
  | "primary_regulatory_authority"
  | "official_guidance"
  | "incident_learning"
  | "supporting_best_practice"
  | "context_only"
  | "internal_workspace_learning";

export type HazLenzRefreshCadence =
  | "manual"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

export interface HazLenzSourceRegistryEntry {
  sourceKey: string;
  displayName: string;
  agency: HazLenzSourceAgency;
  sourceType: HazLenzSourceType;
  authorityTier: HazLenzAuthorityTier;
  allowedUse: HazLenzAllowedUse;

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
  refreshCadence: HazLenzRefreshCadence;

  ingestionNotes: string;
  reviewerNotes: string;
}
