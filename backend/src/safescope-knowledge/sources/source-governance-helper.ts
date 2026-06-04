export type AuthorityRole =
  | "enforceable_regulation"
  | "official_interpretation"
  | "enforcement_policy"
  | "consensus_standard"
  | "federal_research"
  | "peer_reviewed_research"
  | "fatality_case_learning"
  | "safety_alert"
  | "best_practice_guidance"
  | "training_reference"
  | "manufacturer_guidance"
  | "internal_site_memory"
  | "supporting_reference";

export type ReasoningUse =
  | "primary_compliance_basis"
  | "applicability_support"
  | "scientific_health_basis"
  | "incident_prevention_learning"
  | "corrective_action_support"
  | "training_support"
  | "technical_design_support"
  | "local_context_only"
  | "supporting_context";

export interface TrustLimits {
  canCiteAsStandard: boolean;
  canSupportCorrectiveAction: boolean;
  canSupportHealthRiskReasoning: boolean;
  requiresHumanReview: boolean;
  shouldNotOverrideRegulation: boolean;
  requiresLicenseCheck: boolean;
  refreshRecommended: boolean;
}

export interface SourceGovernance {
  authorityRole: AuthorityRole;
  reasoningUse: ReasoningUse;
  trustLimits: TrustLimits;
  governanceNote: string;
}

export interface SourceGovernanceInput {
  sourceType?: string | null;
  sourceRole?: string | null;
  authorityTier?: number | null;
}

export function getSourceGovernance(
  inputOrSourceType: SourceGovernanceInput | string,
  authorityTierArg?: number,
): SourceGovernance {
  const sourceType =
    typeof inputOrSourceType === "string"
      ? inputOrSourceType
      : inputOrSourceType.sourceType || "unknown";

  const sourceRole =
    typeof inputOrSourceType === "string"
      ? undefined
      : inputOrSourceType.sourceRole || undefined;

  const authorityTier =
    typeof inputOrSourceType === "string"
      ? authorityTierArg
      : inputOrSourceType.authorityTier || undefined;

  if (
    sourceRole === "regulatory_citation" ||
    (sourceType === "regulation" && authorityTier === 1)
  ) {
    return {
      authorityRole: "enforceable_regulation",
      reasoningUse: "primary_compliance_basis",
      trustLimits: {
        canCiteAsStandard: true,
        canSupportCorrectiveAction: true,
        canSupportHealthRiskReasoning: false,
        requiresHumanReview: false,
        shouldNotOverrideRegulation: false,
        requiresLicenseCheck: false,
        refreshRecommended: false,
      },
      governanceNote: "This source may be used as a primary compliance basis.",
    };
  }

  if (
    sourceRole === "official_interpretation" ||
    sourceType === "standard_interpretation"
  ) {
    return {
      authorityRole: "official_interpretation",
      reasoningUse: "applicability_support",
      trustLimits: {
        canCiteAsStandard: false,
        canSupportCorrectiveAction: true,
        canSupportHealthRiskReasoning: false,
        requiresHumanReview: true,
        shouldNotOverrideRegulation: true,
        requiresLicenseCheck: false,
        refreshRecommended: true,
      },
      governanceNote:
        "This source supports applicability but does not replace the regulation.",
    };
  }

  switch (sourceType) {
    case "fatality_report":
    case "fatality_alert":
    case "fatal_accident_report":
    case "incident_database":
      return {
        authorityRole: "fatality_case_learning",
        reasoningUse: "incident_prevention_learning",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: true,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: false,
        },
        governanceNote:
          "This source supports incident learning and prevention, not a standalone citation.",
      };
    case "best_practice_guidance":
      return {
        authorityRole: "best_practice_guidance",
        reasoningUse: "corrective_action_support",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: false,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: true,
        },
        governanceNote:
          "This source supports preventive controls, not a primary citation.",
      };
    case "niosh_alert":
    case "safety_alert":
      return {
        authorityRole: "safety_alert",
        reasoningUse: "corrective_action_support",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: false,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: true,
        },
        governanceNote:
          "This source supports preventive controls, not a primary citation.",
      };
    case "niosh_mining_publication":
    case "niosh_publication":
    case "health_hazard_evaluation":
    case "research":
      return {
        authorityRole: "federal_research",
        reasoningUse: "scientific_health_basis",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: true,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: true,
        },
        governanceNote:
          "This source supports scientific or health-risk reasoning and should be reviewed by a qualified professional.",
      };
    case "consensus_standard":
    case "consensus_standard_metadata":
      return {
        authorityRole: "consensus_standard",
        reasoningUse: "technical_design_support",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: false,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: true,
          refreshRecommended: true,
        },
        governanceNote:
          "This source supports technical design decisions and may require license review before use.",
      };
    case "internal_learning":
    case "internal_site_memory":
    case "internal_corrective_action_history":
    case "internal_repeat_finding":
    case "internal_training_record":
    case "internal_near_miss":
    case "internal_site_memory":
      return {
        authorityRole: "internal_site_memory",
        reasoningUse: "local_context_only",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: true,
          canSupportHealthRiskReasoning: false,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: false,
        },
        governanceNote:
          "This source provides local context only and should not override external authority.",
      };
    default:
      return {
        authorityRole: "supporting_reference",
        reasoningUse: "supporting_context",
        trustLimits: {
          canCiteAsStandard: false,
          canSupportCorrectiveAction: false,
          canSupportHealthRiskReasoning: false,
          requiresHumanReview: true,
          shouldNotOverrideRegulation: true,
          requiresLicenseCheck: false,
          refreshRecommended: false,
        },
        governanceNote: "This source supports contextual review.",
      };
  }
}
