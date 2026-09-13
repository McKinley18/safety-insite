export type SourceRole =
  | "regulatory_citation"
  | "official_interpretation"
  | "enforcement_policy"
  | "fatality_learning"
  | "incident_investigation"
  | "safety_alert_or_best_practice"
  | "federal_research"
  | "health_hazard_evaluation"
  | "consensus_standard_metadata"
  | "training_or_competency_record"
  | "corrective_action_history"
  | "internal_site_memory"
  | "supporting_reference";

export const ROLE_LABELS: Record<SourceRole, string> = {
  regulatory_citation: "Regulatory Citation",
  official_interpretation: "Official Interpretation",
  enforcement_policy: "Enforcement Policy",
  fatality_learning: "Fatality Learning",
  incident_investigation: "Incident Investigation",
  safety_alert_or_best_practice: "Safety Alert / Best Practice",
  federal_research: "Federal Research",
  health_hazard_evaluation: "Health Hazard Evaluation",
  consensus_standard_metadata: "Consensus Standard Metadata",
  training_or_competency_record: "Training / Competency Record",
  corrective_action_history: "Corrective Action History",
  internal_site_memory: "Internal Site Memory",
  supporting_reference: "Supporting Reference",
};

export const ROLE_GUIDANCE: Record<SourceRole, string> = {
  regulatory_citation: "Can support primary compliance citation.",
  official_interpretation:
    "Explains regulatory requirements, but is not a standalone standard.",
  enforcement_policy: "Provides policy context for enforcement actions.",
  fatality_learning: "Supports hazard recognition and prevention lessons.",
  incident_investigation:
    "Provides context for historical incidents and causal patterns.",
  safety_alert_or_best_practice:
    "Supports preventive controls, not a primary citation.",
  federal_research: "Supports scientific and health-risk reasoning.",
  health_hazard_evaluation:
    "Supports exposure and health-risk reasoning from field evaluations.",
  consensus_standard_metadata:
    "Provides technical reference metadata; license check may be required.",
  training_or_competency_record:
    "Supports local competency context, not external authority.",
  corrective_action_history:
    "Supports recurrence and closure history, not external authority.",
  internal_site_memory: "Supports local context, requires expert review.",
  supporting_reference: "Contextual support only.",
};

export function getSourceRole(
  sourceType: string,
  authorityTier: number,
): SourceRole {
  switch (sourceType) {
    case "regulation":
      return "regulatory_citation";
    case "standard_interpretation":
      return "official_interpretation";
    case "directive":
      return "enforcement_policy";
    case "fatality_report":
    case "fatality_alert":
      return "fatality_learning";
    case "incident_database":
      return "incident_investigation";
    case "research_publication":
    case "niosh_publication":
    case "niosh_mining_publication":
    case "criteria_document":
      return "federal_research";
    case "health_hazard_evaluation":
      return "health_hazard_evaluation";
    case "niosh_alert":
    case "best_practice_guidance":
      return "safety_alert_or_best_practice";
    case "consensus_standard":
    case "consensus_standard_metadata":
      return "consensus_standard_metadata";
    case "internal_training_record":
      return "training_or_competency_record";
    case "internal_corrective_action_history":
      return "corrective_action_history";
    case "internal_learning":
    case "internal_site_memory":
    case "internal_repeat_finding":
    case "internal_near_miss":
      return "internal_site_memory";
    default:
      return "supporting_reference";
  }
}
