export type ConnectorPriority =
  | "immediate"
  | "high"
  | "medium"
  | "low"
  | "not_applicable";
export type RecommendedPhase =
  | "phase_1_core_authority"
  | "phase_2_high_value_incident_learning"
  | "phase_3_scientific_health_intelligence"
  | "phase_4_training_and_support_guidance"
  | "phase_5_metadata_and_internal_context"
  | "not_planned";

export interface ConnectorPriorityConfig {
  connectorPriority: ConnectorPriority;
  safetyValueScore: number;
  authorityValueScore: number;
  productImpactScore: number;
  ingestionDifficultyScore: number;
  governanceRiskScore: number;
  totalPriorityScore: number;
  recommendedPhase: RecommendedPhase;
  implementationNotes: string;
}

export function getConnectorPriority(
  sourceKey: string,
  agency: string,
  sourceType: string,
  authorityTier: number,
  connectorStatus: string,
): ConnectorPriorityConfig {
  let safetyValue = 5;
  let authorityValue = 5;
  let productImpact = 5;
  let ingestionDifficulty = 5;
  let governanceRisk = 5;
  let phase: RecommendedPhase = "phase_4_training_and_support_guidance";
  let notes = "Standard priority.";

  if (
    connectorStatus === "active_connector" ||
    connectorStatus === "source_list_connector"
  ) {
    return {
      connectorPriority: "not_applicable",
      safetyValueScore: 0,
      authorityValueScore: 0,
      productImpactScore: 0,
      ingestionDifficultyScore: 0,
      governanceRiskScore: 0,
      totalPriorityScore: 0,
      recommendedPhase: "not_planned",
      implementationNotes: "Already active/connected.",
    };
  }

  if (connectorStatus === "internal_system_source") {
    return {
      connectorPriority: "not_applicable",
      safetyValueScore: 0,
      authorityValueScore: 0,
      productImpactScore: 0,
      ingestionDifficultyScore: 0,
      governanceRiskScore: 0,
      totalPriorityScore: 0,
      recommendedPhase: "phase_5_metadata_and_internal_context",
      implementationNotes: "Internal system source.",
    };
  }

  if (connectorStatus === "metadata_only") {
    return {
      connectorPriority: "low",
      safetyValueScore: 3,
      authorityValueScore: 2,
      productImpactScore: 2,
      ingestionDifficultyScore: 1,
      governanceRiskScore: 9,
      totalPriorityScore: 1.6,
      recommendedPhase: "phase_5_metadata_and_internal_context",
      implementationNotes: "Metadata-only, requires license check.",
    };
  }

  if (agency === "OSHA" || agency === "MSHA") {
    if (authorityTier === 1) {
      safetyValue = 10;
      authorityValue = 10;
      productImpact = 10;
      ingestionDifficulty = 6;
      governanceRisk = 2;
      phase = "phase_1_core_authority";
      notes = "Primary regulatory source.";
    } else if (
      ["fatality_report", "fatality_alert", "incident_database"].includes(
        sourceType,
      )
    ) {
      safetyValue = 9;
      authorityValue = 8;
      productImpact = 8;
      ingestionDifficulty = 5;
      governanceRisk = 3;
      phase = "phase_2_high_value_incident_learning";
      notes = "High-value incident learning.";
    } else {
      safetyValue = 6;
      authorityValue = 5;
      productImpact = 5;
      ingestionDifficulty = 4;
      governanceRisk = 2;
      phase = "phase_4_training_and_support_guidance";
      notes = "General safety guidance.";
    }
  } else if (sourceType === "federal_research") {
    safetyValue = 8;
    authorityValue = 7;
    productImpact = 7;
    ingestionDifficulty = 7;
    governanceRisk = 3;
    phase = "phase_3_scientific_health_intelligence";
    notes = "Scientific health intelligence.";
  }

  const score =
    safetyValue * 0.3 +
    authorityValue * 0.25 +
    productImpact * 0.2 -
    ingestionDifficulty * 0.15 -
    governanceRisk * 0.1;
  let priority: ConnectorPriority = "low";
  if (score >= 6) priority = "immediate";
  else if (score >= 4.5) priority = "high";
  else if (score >= 3) priority = "medium";

  return {
    connectorPriority: priority,
    safetyValueScore: safetyValue,
    authorityValueScore: authorityValue,
    productImpactScore: productImpact,
    ingestionDifficultyScore: ingestionDifficulty,
    governanceRiskScore: governanceRisk,
    totalPriorityScore: Number(score.toFixed(2)),
    recommendedPhase: phase,
    implementationNotes: notes,
  };
}
