import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';
import { MineContextAssessment } from './mine-context.types';
import { InspectionConditionAssessment } from './inspection-condition-assessment.types';
import { VagueInputAnalysis } from './vague-input-intelligence.types';

export type InspectionHazardRole = 'primary' | 'secondary' | 'possible_related';

export type InspectionHazardCandidate = {
  domain: SafeScopeReasoningDomain;
  role: InspectionHazardRole;
  confidence: 'low' | 'moderate' | 'high';
  rationale: string;
};

export type InspectionCandidateStandard = {
  citation: string;
  titleSummary: string;
  jurisdiction: Exclude<SafeScopeJurisdiction, 'unclear'>;
  status: 'candidate_standard';
  rationale: string;
  evidenceNeeded: string[];
};

export type InspectionIntelligenceResult = {
  miningContext: MineContextAssessment;
  conditionAssessment: InspectionConditionAssessment;
  vagueInputAnalysis?: VagueInputAnalysis;
  hazardCandidates: InspectionHazardCandidate[];
  mechanismChain: {
    initiatingCondition: string[];
    releaseOrFailureMode: string[];
    exposurePathway: string[];
    consequences: string[];
    evidenceGaps: string[];
    controls: string[];
  };
  candidateStandards: InspectionCandidateStandard[];
  evidenceGapQuestions: string[];
  correctiveActions: {
    immediate: string[];
    interim: string[];
    permanentEngineering: string[];
    administrativeProgramTraining: string[];
    verificationFollowUp: string[];
  };
  guardrails: {
    advisoryOnly: true;
    candidateStandardsOnly: true;
    doesNotDeclareViolation: true;
    requiresQualifiedReview: true;
  };
};
