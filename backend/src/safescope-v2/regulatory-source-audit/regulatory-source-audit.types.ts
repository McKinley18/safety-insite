import { AuthorityAgency, AuthorityTier, Jurisdiction } from '../approved-knowledge-registry/approved-knowledge-record.types';

export interface RegulatorySourceInventory {
  reportVersion: string;
  generatedAt: string;
  summary: {
    totalApprovedRecords: number;
    totalDraftRecords: number;
    byAgency: Record<string, number>;
    byJurisdiction: Record<string, number>;
    byAuthorityTier: Record<string, number>;
    hazardFamilyCoverage: Record<string, number>;
  };
  details: {
    approvedRecords: InventoryRecord[];
    draftCandidates: InventoryRecord[];
  };
  metadataGaps: {
    missingSourceUrl: string[];
    missingDates: string[];
    missingJurisdiction: string[];
    missingAuthorityTier: string[];
  };
  governanceCompliance: {
    placeholderCount: number;
    missingEvidenceCount: number;
    missingApplicabilityCount: number;
    missingAdvisoryGuardrailCount: number;
  };
  citationMap: Record<string, string[]>; // Citation to record IDs
}

export interface InventoryRecord {
  recordId: string;
  status: 'approved' | 'draft';
  agency: AuthorityAgency;
  jurisdiction: Jurisdiction;
  authorityTier: AuthorityTier;
  citation: string;
  normalizedCitation: string;
  title: string;
  sourceUrl?: string;
  effectiveDate?: string;
  revisionDate?: string;
  hazardFamilies: string[];
}
