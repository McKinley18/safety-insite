export type ConnectorStatus =
  | "active_connector"
  | "source_list_connector"
  | "planned_connector"
  | "metadata_only"
  | "internal_system_source"
  | "manual_import_only";

export type IngestionMode =
  | "automatic_refresh"
  | "curated_source_list"
  | "metadata_only"
  | "internal_generated"
  | "manual_upload_or_import"
  | "not_yet_connected";

export type ReviewPolicy =
  | "auto_approved_primary"
  | "requires_human_review"
  | "internal_review_optional"
  | "license_review_required"
  | "not_ingested";

export type DatabaseRole =
  | "feeds_knowledge_documents"
  | "feeds_internal_memory"
  | "metadata_reference_only"
  | "planned_future_feed"
  | "not_database_source";

export interface GovernanceConfig {
  connectorStatus: ConnectorStatus;
  ingestionMode: IngestionMode;
  reviewPolicy: ReviewPolicy;
  databaseRole: DatabaseRole;
  controlPlaneNotes: string;
}

export function getGovernanceConfig(
  sourceKey: string,
  requiresApproval: boolean,
  sourceType: string,
  agency: string,
): GovernanceConfig {
  // Known active/source-list reality
  const activeKeys = [
    "msha-fatality-reports",
    "osha-standard-interpretations",
    "msha-safety-alerts",
    "msha-30-cfr-standards",
  ];
  const listKeys = [
    "osha-standard-interpretations",
    "msha-safety-alerts",
    "msha-30-cfr-standards",
  ];
  const internalKeys = [
    "internal-supervisor-feedback",
    "internal-repeat-findings",
  ];
  const consensusKeys = [
    "ansi-assp-standards-metadata",
    "nfpa-standards-metadata",
    "astm-standards-metadata",
    "iso-standards-metadata",
    "acgih-tlv-metadata",
  ];

  if (internalKeys.includes(sourceKey) || agency === "INTERNAL") {
    return {
      connectorStatus: "internal_system_source",
      ingestionMode: "internal_generated",
      reviewPolicy: "internal_review_optional",
      databaseRole: "feeds_internal_memory",
      controlPlaneNotes: "Internal system source.",
    };
  }

  if (consensusKeys.includes(sourceKey)) {
    return {
      connectorStatus: "metadata_only",
      ingestionMode: "metadata_only",
      reviewPolicy: "license_review_required",
      databaseRole: "metadata_reference_only",
      controlPlaneNotes: "Metadata-only consensus standard.",
    };
  }

  if (listKeys.includes(sourceKey)) {
    return {
      connectorStatus: "source_list_connector",
      ingestionMode: "curated_source_list",
      reviewPolicy: "requires_human_review",
      databaseRole: "feeds_knowledge_documents",
      controlPlaneNotes: "Manual source list.",
    };
  }

  if (activeKeys.includes(sourceKey)) {
    return {
      connectorStatus: "active_connector",
      ingestionMode: "automatic_refresh",
      reviewPolicy: requiresApproval
        ? "requires_human_review"
        : "auto_approved_primary",
      databaseRole: "feeds_knowledge_documents",
      controlPlaneNotes: "Automated connector.",
    };
  }

  return {
    connectorStatus: "planned_connector",
    ingestionMode: "not_yet_connected",
    reviewPolicy: "not_ingested",
    databaseRole: "planned_future_feed",
    controlPlaneNotes: "Planned ingestion.",
  };
}
