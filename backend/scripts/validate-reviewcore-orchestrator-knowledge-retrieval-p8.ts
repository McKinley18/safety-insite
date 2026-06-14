import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

const orchestrator = new SafeScopeReasoningOrchestratorService();

const testCases = [
  { observation: 'conveyor nip point', domain: 'machine_guarding' },
  { observation: 'blocked emergency exit', domain: 'emergency_preparedness' },
  { observation: 'unlabeled leaking chemical container', domain: 'hazardous_materials' },
  { observation: 'dry concrete cutting dust', domain: 'industrial_hygiene' },
  { observation: 'vague observation', domain: 'unknown' }
];

for (const tc of testCases) {
  const result = orchestrator.reason({ hazardObservation: tc.observation });
  
  if (!result.governedKnowledgeRetrieval) {
    throw new Error(`Failed: ${tc.observation} did not return governedKnowledgeRetrieval`);
  }
  
  if (result.conclusionBoundary.advisoryOnly !== true || 
      result.conclusionBoundary.doesNotDeclareViolation !== true ||
      result.conclusionBoundary.doesNotCreateCitation !== true ||
      result.conclusionBoundary.requiresQualifiedReview !== true) {
      throw new Error(`Failed: Guardrails not set for ${tc.observation}`);
  }
}

console.log('P8 Orchestrator Knowledge Retrieval Validation Successful!');
