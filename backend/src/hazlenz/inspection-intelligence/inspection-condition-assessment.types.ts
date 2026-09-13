import { HazLenzReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export type InspectionConditionStatus =
  | 'uncontrolled'
  | 'controlled'
  | 'insufficient_evidence'
  | 'no_hazard_signal';

export type InspectionConditionAssessment = {
  status: InspectionConditionStatus;
  controlledDomains: HazLenzReasoningDomain[];
  controlEvidence: string[];
  likelyDomains: HazLenzReasoningDomain[];
  uncertaintyReasons: string[];
  falsePositiveSignals: string[];
  citationEligible: boolean;
};
