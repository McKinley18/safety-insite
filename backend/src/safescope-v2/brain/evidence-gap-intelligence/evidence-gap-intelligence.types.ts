import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeEvidenceGapImpact =
  | 'citation_selection'
  | 'mechanism_selection'
  | 'severity_risk'
  | 'corrective_action_quality'
  | 'human_review'
  | 'report_defensibility';

export type SafeScopeEvidenceGapSeverity = 'low' | 'medium' | 'high' | 'critical';

export type SafeScopeEvidenceGapRecord = {
  gapId: string;
  label: string;
  hazardDomains: SafeScopeReasoningDomain[];
  mechanisms: string[];
  jurisdictions: SafeScopeJurisdiction[];
  triggerTerms: string[];
  missingEvidenceTerms: string[];
  impact: SafeScopeEvidenceGapImpact[];
  severity: SafeScopeEvidenceGapSeverity;
  whyItMatters: string;
  inspectorQuestion: string;
  recommendedDisposition:
    | 'proceed_with_advisory_context'
    | 'proceed_with_human_review'
    | 'hold_for_critical_evidence';
};

export type SafeScopeEvidenceGapIntelligenceInput = {
  text: string;
  jurisdiction?: SafeScopeJurisdiction;
  hazardDomain?: SafeScopeReasoningDomain;
  mechanism?: string;
  citation?: string;
  limit?: number;
};

export type SafeScopeEvidenceGapIntelligenceMatch = {
  record: SafeScopeEvidenceGapRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type SafeScopeEvidenceGapIntelligenceResult = {
  engine: 'safescope_evidence_gap_intelligence_v1';
  mode: 'read_only_evidence_gap_reasoning';
  input: SafeScopeEvidenceGapIntelligenceInput;
  matches: SafeScopeEvidenceGapIntelligenceMatch[];
  criticalQuestions: string[];
  highestSeverity?: SafeScopeEvidenceGapSeverity;
  recommendedDisposition:
    | 'proceed_with_advisory_context'
    | 'proceed_with_human_review'
    | 'hold_for_critical_evidence';
  boundary: {
    readOnly: true;
    advisoryOnly: true;
    canDeclareViolation: false;
    canCreateCitation: false;
    canBypassHumanReview: false;
  };
};
