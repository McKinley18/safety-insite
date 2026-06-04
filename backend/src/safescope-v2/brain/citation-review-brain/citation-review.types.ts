import { ApprovedSourceRecord } from '../source-governance/source-governance.types';

export type CitationLevelCandidateReview = {
  id: string;
  sourceId: string;
  citation: string;
  title: string;
  agency: string;
  jurisdiction: string;
  industryScope: string[];
  authorityTier: string;
  approvalStatus: string;
  relatedStandardFamily: string;
  relatedScenarioFamilies: string[];
  relatedHazardDomains: string[];
  relatedEquipmentIndicators: string[];
  relatedTaskIndicators: string[];
  relatedMechanismIndicators: string[];
  relatedExposureIndicators: string[];
  requiredEvidence: string[];
  missingEvidence: string[];
  evidenceSatisfied: boolean;
  confidence: number;
  confidenceBoosters: string[];
  confidenceReducers: string[];
  humanReviewTriggers: string[];
  applicabilityNotes: string[];
  prohibitedUses: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    requiresQualifiedReview: boolean;
  };
  sourceTrace: string[];
};
