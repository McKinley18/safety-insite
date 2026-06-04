import { SafeScopeReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type SafeScopeControlHierarchyLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering_control'
  | 'isolation_or_guarding'
  | 'administrative_control'
  | 'ppe'
  | 'verification';

export type SafeScopeControlBrainRecord = {
  controlId: string;
  hazardDomains: SafeScopeReasoningDomain[];
  mechanisms: string[];
  hierarchyLevel: SafeScopeControlHierarchyLevel;
  immediateControl: string;
  permanentControl: string;
  verificationEvidence: string[];
  failureModesIfNotVerified: string[];
  notes: string[];
};
