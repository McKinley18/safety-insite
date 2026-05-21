export type SourceRole =
  | "regulatory_citation"
  | "official_interpretation"
  | "enforcement_policy"
  | "fatality_learning"
  | "incident_investigation"
  | "safety_alert_or_best_practice"
  | "internal_site_memory"
  | "supporting_reference";

export const ROLE_LABELS: Record<SourceRole, string> = {
  regulatory_citation: "Regulatory Citation",
  official_interpretation: "Official Interpretation",
  enforcement_policy: "Enforcement Policy",
  fatality_learning: "Fatality Learning",
  incident_investigation: "Incident Investigation",
  safety_alert_or_best_practice: "Safety Alert / Best Practice",
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
    case "best_practice_guidance":
      return "safety_alert_or_best_practice";
    case "internal_learning":
      return "internal_site_memory";
    default:
      return "supporting_reference";
  }
}
