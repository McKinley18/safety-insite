import { HazLenzReasoningDomain } from '../../reasoning-orchestrator/reasoning-orchestrator.types';

export type HazLenzControlHierarchyLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering_control'
  | 'isolation_or_guarding'
  | 'administrative_control'
  | 'ppe'
  | 'verification';

export type HazLenzControlBrainRecord = {
  controlId: string;
  hazardDomains: HazLenzReasoningDomain[];
  mechanisms: string[];
  hierarchyLevel: HazLenzControlHierarchyLevel;
  immediateControl: string;
  permanentControl: string;
  verificationEvidence: string[];
  failureModesIfNotVerified: string[];
  notes: string[];
};
