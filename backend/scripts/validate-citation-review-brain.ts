import { CitationReviewBrainService } from '../src/safescope-v2/brain/citation-review-brain/citation-review.service';
import { ScenarioIntelligence } from '../src/safescope-v2/types/scenario-intelligence.types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const service = new CitationReviewBrainService();

console.log("Running CitationReviewBrainService validation...");

const mockScenario: ScenarioIntelligence = {
  scenarioFamilyId: 'conveyor-cleanup',
  equipment: 'conveyor',
  task: 'cleanup',
  unsafeCondition: 'unguarded',
  operationalState: 'running',
  energySource: 'mechanical',
  mechanismOfInjury: 'rotating_equipment_nip_point',
  exposedPersonActivity: 'worker near belt',
  missingOrFailedControls: ['guard missing', 'no LOTO'],
  hierarchyLevel: 'engineering',
  candidateStandardFamily: 'machine_guarding',
  evidenceGaps: ['LOTO status'],
  confidenceSignals: {
    score: 0.9,
    reasoning: ['Confirmed scenario family']
  },
  qualifiedReviewRequired: true,
  advisoryOnly: true,
  doesNotDeclareViolation: true
};

const result = service.evaluate(mockScenario, ['LOTO status']);
assert(result.length > 0, "Failed to generate candidates");
assert(result[0].citation === '29 CFR 1910.147', "Failed to match LOTO citation");
assert(result[0].evidenceSatisfied === false, "Failed to detect missing evidence");
console.log("CitationReviewBrainService validation passed.");
