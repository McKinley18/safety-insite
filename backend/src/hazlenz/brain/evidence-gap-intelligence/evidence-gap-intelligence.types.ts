import {
  HazLenzJurisdiction,
  HazLenzReasoningDomain,
} from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzEvidenceGapImpact =
  | 'citation_selection'
  | 'mechanism_selection'
  | 'severity_risk'
  | 'corrective_action_quality'
  | 'human_review'
  | 'report_defensibility';

export type HazLenzEvidenceGapSeverity = 'low' | 'medium' | 'high' | 'critical';

export type HazLenzEvidenceGapRecord = {
  gapId: string;
  label: string;
  hazardDomains: HazLenzReasoningDomain[];
  mechanisms: string[];
  jurisdictions: HazLenzJurisdiction[];
  triggerTerms: string[];
  missingEvidenceTerms: string[];
  impact: HazLenzEvidenceGapImpact[];
  severity: HazLenzEvidenceGapSeverity;
  whyItMatters: string;
  inspectorQuestion: string;
  recommendedDisposition:
    | 'proceed_with_advisory_context'
    | 'proceed_with_human_review'
    | 'hold_for_critical_evidence';
};

export type HazLenzEvidenceGapIntelligenceInput = {
  text: string;
  jurisdiction?: HazLenzJurisdiction;
  hazardDomain?: HazLenzReasoningDomain;
  mechanism?: string;
  citation?: string;
  limit?: number;
};

export type HazLenzEvidenceGapIntelligenceMatch = {
  record: HazLenzEvidenceGapRecord;
  score: number;
  matchedFields: string[];
  reasonCodes: string[];
};

export type HazLenzEvidenceGapIntelligenceResult = {
  engine: 'safescope_evidence_gap_intelligence_v1';
  mode: 'read_only_evidence_gap_reasoning';
  input: HazLenzEvidenceGapIntelligenceInput;
  matches: HazLenzEvidenceGapIntelligenceMatch[];
  criticalQuestions: string[];
  highestSeverity?: HazLenzEvidenceGapSeverity;
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
