import { SafeScopeJurisdiction, SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

export interface ExpertApplicabilityRule {
  id: string;
  jurisdiction: SafeScopeJurisdiction | 'all';
  hazardFamily: SafeScopeReasoningDomain;
  standardCitation: string;
  standardTitle: string;
  appliesWhen: RegExp[];
  requiredEvidence: RegExp[];
  confidenceBoosters?: RegExp[];
  confidenceReducers?: RegExp[];
  doNotSelectWhen?: RegExp[];
  commonlyConfusedWith?: string[];
  followUpQuestions: string[];
  mechanismChain: {
    initiatingCondition: string;
    releaseOrFailureMode: string;
    exposurePathway: string;
    consequences: string;
  };
  controlPrinciples: string[];
}

export interface EvidenceGateResult {
  ruleId: string;
  citation: string;
  isSufficient: boolean;
  confidenceScore: number; // 0 to 100
  confidenceLevel: 'low' | 'moderate' | 'high';
  missingFacts: string[];
  boostersTriggered: string[];
  reducersTriggered: string[];
  excludedByDoNotSelect: boolean;
}

export interface StandardApplicabilityRuleSummary {
  id: string;
  citation: string;
  standardTitle: string;
  jurisdiction: SafeScopeJurisdiction | 'all';
  hazardFamily: SafeScopeReasoningDomain;
}

export interface StandardApplicabilityResult {
  matchedRules: StandardApplicabilityRuleSummary[];
  evaluationResults: EvidenceGateResult[];
  suggestedStandards: string[];
  needsMoreEvidenceStandards: string[];
  followUpQuestions: string[];
}
