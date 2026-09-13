import { InventoryRecord } from './regulatory-source-audit.types';

export interface CoreStandardRequirement {
  id: string;
  agency: string;
  jurisdiction: string;
  expectedCitationPrefixes: string[];
  description: string;
}

export type CoverageStatus = 'approved' | 'draft' | 'missing';

export interface CoreStandardCoverage {
  requirement: CoreStandardRequirement;
  status: CoverageStatus;
  matchedRecords: InventoryRecord[];
}

export interface RegulatoryCoverageMatrix {
  reportVersion: string;
  generatedAt: string;
  summary: {
    totalCoreStandards: number;
    approvedCoreStandards: number;
    draftCoreStandards: number;
    missingCoreStandards: number;
    totalApprovedRecords: number;
    totalDraftRecords: number;
    unknownMetadataRecords: number;
  };
  coverageByAgency: Record<string, number>;
  coverageByJurisdiction: Record<string, number>;
  coverageByAuthorityTier: Record<string, number>;
  coverageByHazardFamily: Record<string, number>;
  coreStandardsCoverage: CoreStandardCoverage[];
  unknownMetadataRecords: InventoryRecord[];
  duplicateOverlapCandidates: Record<string, InventoryRecord[]>;
}
