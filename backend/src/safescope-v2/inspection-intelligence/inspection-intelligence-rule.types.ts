import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';
import { InspectionIntelligenceResult } from './inspection-intelligence.types';

export type InspectionIntelligenceRule = {
  id: string;
  domain: SafeScopeReasoningDomain;
  confidence?: 'low' | 'moderate' | 'high';
  matches: RegExp[];
  initiating: string;
  failure: string;
  exposure: string;
  consequences: string;
  related?: Array<{
    domain: SafeScopeReasoningDomain;
    rationale: string;
    possible?: boolean;
  }>;
  questions: string[];
  controls: InspectionIntelligenceResult['correctiveActions'];
  standards: Partial<
    Record<
      Exclude<SafeScopeJurisdiction, 'unclear'>,
      Array<{ citation: string; summary?: string; evidence: string[] }>
    >
  >;
};

export function inspectionActions(
  immediate: string,
  interim: string,
  permanent: string,
  administrative: string,
  verification: string,
): InspectionIntelligenceResult['correctiveActions'] {
  return {
    immediate: [immediate],
    interim: [interim],
    permanentEngineering: [permanent],
    administrativeProgramTraining: [administrative],
    verificationFollowUp: [verification],
  };
}
