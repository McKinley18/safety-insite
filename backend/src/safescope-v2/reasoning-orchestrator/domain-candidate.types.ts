import { SafeScopeReasoningDomain } from './reasoning-orchestrator.types';

export type SafeScopeDomainCandidate = {
  domain: SafeScopeReasoningDomain;
  score: number;
  matchedTerms: string[];
  reason: string;
};

export type SafeScopeDomainCandidateExplanation = {
  engine: 'safescope_domain_candidate_scoring_v1';
  mode: 'deterministic_test_only_explanation';
  winningDomain: SafeScopeReasoningDomain;
  winningScore: number;
  candidates: SafeScopeDomainCandidate[];
  runnerUpCandidates: SafeScopeDomainCandidate[];
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
