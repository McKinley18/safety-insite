import { HazLenzReasoningDomain } from './reasoning-orchestrator.types';

export type HazLenzDomainCandidate = {
  domain: HazLenzReasoningDomain;
  score: number;
  matchedTerms: string[];
  reason: string;
};

export type HazLenzDomainCandidateExplanation = {
  engine: 'safescope_domain_candidate_scoring_v1';
  mode: 'deterministic_test_only_explanation';
  winningDomain: HazLenzReasoningDomain;
  winningScore: number;
  candidates: HazLenzDomainCandidate[];
  runnerUpCandidates: HazLenzDomainCandidate[];
  scoreMargin: number;
  confidenceSignal: 'clear' | 'close' | 'weak';
  explanation: string;
  guardrails: {
    reportOnly: true;
    doesNotDeclareViolation: true;
    doesNotCreateCitation: true;
    doesNotModifyReasoning: true;
    requiresQualifiedReview: true;
  };
};
