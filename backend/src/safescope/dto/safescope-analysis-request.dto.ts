export class SafeScopeAnalysisRequestDto {
  observationText?: string;
  imageEvidenceIds?: string[];
  inspectionId?: string;
  reportId?: string;
  siteId?: string;
  companyId?: string;
  regulatoryContext?: "MSHA" | "OSHA_GENERAL" | "OSHA_CONSTRUCTION" | "MIXED";
  industryContext?: string;
  equipmentContext?: string;
  userRole?: string;
  priorFindingIds?: string[];
  correctiveActionContext?: Record<string, unknown>;
  sourceIntelligenceEnabled?: boolean;
  standardsMatchingEnabled?: boolean;
  reviewMode?: boolean;
}
