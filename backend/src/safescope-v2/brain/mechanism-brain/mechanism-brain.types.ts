import { SafeScopeReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeMechanismBrainRecord = {
  mechanismId: string;
  label: string;
  hazardDomains: SafeScopeReasoningDomain[];
  energyType:
    | 'gravity'
    | 'mechanical'
    | 'electrical'
    | 'chemical'
    | 'thermal'
    | 'pressure'
    | 'atmospheric'
    | 'biological'
    | 'ergonomic'
    | 'unknown';
  exposurePathway: string;
  commonTriggerTerms: string[];
  competingMechanisms: string[];
  precedenceNotes: string[];
  evidenceQuestions: string[];
  immediateControls: string[];
  verificationEvidence: string[];
};
