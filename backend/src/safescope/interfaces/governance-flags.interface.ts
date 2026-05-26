export interface GovernanceFlags {
  sourceIntelligenceDoesNotOverrideStandards: boolean;
  databaseWriteAllowed: boolean;
  humanReviewRequiredForHighRisk: boolean;
  verifiedSourcesOnly: boolean;
  productionEndpointEnabled: boolean;
}
