import { StandardFamilyCandidateRecord } from './standard-family-candidate.types';
import { STANDARD_FAMILY_REGISTRY } from './standard-family-candidate.registry';
import { ScenarioIntelligence } from '../../types/scenario-intelligence.types';

export class StandardFamilyMapperService {
  map(scenarioIntelligence: ScenarioIntelligence): StandardFamilyCandidateRecord[] {
    // Map scenario intelligence to standard family candidates
    // Based on the candidateStandardFamily field in ScenarioIntelligence
    return STANDARD_FAMILY_REGISTRY.filter(candidate => 
        candidate.candidateFamily === scenarioIntelligence.candidateStandardFamily
    );
  }
}
