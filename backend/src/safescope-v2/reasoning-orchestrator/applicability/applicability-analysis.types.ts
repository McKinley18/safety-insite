import { KnowledgeRecord } from '../../knowledge-intake/knowledge-intake.types';
import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
  SafeScopeReasoningEvidenceGap,
} from '../reasoning-orchestrator.types';

export type ApplicabilityStatus =
  | 'likely_applicable'
  | 'possibly_applicable'
  | 'insufficient_evidence'
  | 'not_applicable_based_on_known_facts';

export type ApplicabilityAnalysisInput = {
  hazardObservation: string;
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
  approvedRecords: KnowledgeRecord[];
  missingEvidence: SafeScopeReasoningEvidenceGap[];
};

export type ApplicabilityRecordAnalysis = {
  recordId: string;
  citation: string;
  title: string;
  sourceAuthority: string;
  sourceBoundary: string;
  status: ApplicabilityStatus;
  triggerMatches: string[];
  evidenceMatches: string[];
  missingEvidenceNeeded: string[];
  nonApplicabilityQuestions: string[];
  reasoning: string[];
  confidenceScore: number;
};

export type ApplicabilityAnalysisResult = {
  engine: 'safescope_applicability_analysis_v1';
  mode: 'deterministic_test_only_advisory';
  productionReasoningModified: false;
  jurisdiction: SafeScopeJurisdiction;
  hazardDomain: SafeScopeReasoningDomain;
  recordAnalyses: ApplicabilityRecordAnalysis[];
  summary: {
    likelyApplicableCount: number;
    possiblyApplicableCount: number;
    insufficientEvidenceCount: number;
    notApplicableCount: number;
  };
  conclusionBoundary: {
    advisoryOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    requiresQualifiedReview: true;
  };
};
