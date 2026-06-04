import { SafeScopeLearningMemoryService } from '../src/safescope-v2/brain/learning-memory/learning-memory.service';
import { SafeScopeImprovementCandidateEngineService } from '../src/safescope-v2/brain/improvement-candidate-engine/improvement-candidate-engine.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const learningMemory = new SafeScopeLearningMemoryService();

learningMemory.add({
  source: 'field_test',
  workspaceId: 'workspace-alpha',
  snapshotId: 'snapshot-vent-001',
  findingId: 'finding-001',
  jurisdiction: 'msha',
  originalDomain: 'ventilation',
  correctedDomain: 'ventilation',
  originalCitation: '30 CFR 75.333',
  correctedCitation: '30 CFR 57.8520',
  originalMechanism: 'methane_gas_buildup',
  correctedMechanism: 'air_quality_contaminant_buildup',
  originalScenarioId: 'coal-underground-methane-ventilation',
  correctedScenarioId: 'mnm-underground-air-quality-ventilation',
  reviewOutcome: 'corrected',
  missingEvidence: ['Mine type was metal/nonmetal underground, not coal.'],
  reviewerRationale: 'The system over-weighted coal ventilation language and missed MNM context.',
  recommendedRegistryUpdate: 'Increase MNM underground ventilation disambiguation weight when part 57 or metal/nonmetal signals are present.',
  confidenceBefore: 78,
  confidenceAfter: 52,
});

learningMemory.add({
  source: 'benchmark_review',
  workspaceId: 'workspace-alpha',
  snapshotId: 'snapshot-vent-002',
  findingId: 'finding-002',
  jurisdiction: 'msha',
  originalDomain: 'ventilation',
  correctedDomain: 'ventilation',
  originalCitation: '30 CFR 75.333',
  correctedCitation: '30 CFR 57.8520',
  originalMechanism: 'methane_gas_buildup',
  correctedMechanism: 'air_quality_contaminant_buildup',
  originalScenarioId: 'coal-underground-methane-ventilation',
  correctedScenarioId: 'mnm-underground-air-quality-ventilation',
  reviewOutcome: 'corrected',
  missingEvidence: ['Need stronger MNM underground context before choosing Part 75 ventilation citations.'],
  reviewerRationale: 'The same Part 75 / Part 57 confusion appeared again.',
  recommendedRegistryUpdate: 'Increase MNM underground ventilation disambiguation weight when part 57 or metal/nonmetal signals are present.',
  confidenceBefore: 76,
  confidenceAfter: 50,
});

learningMemory.add({
  source: 'benchmark_review',
  workspaceId: 'workspace-alpha',
  snapshotId: 'snapshot-electrical-001',
  findingId: 'finding-003',
  jurisdiction: 'osha_general_industry',
  originalDomain: 'electrical',
  originalCitation: '29 CFR 1910.303(g)(2)(i)',
  originalMechanism: 'shock',
  reviewOutcome: 'held_for_evidence',
  missingEvidence: ['Need confirmation whether conductor was energized.', 'Need employee exposure distance.'],
  reviewerRationale: 'Cannot defensibly select final citation without energized-state evidence.',
  recommendedRegistryUpdate: 'Add critical evidence gate for exposed-conductor findings when energized state is unknown.',
  confidenceBefore: 71,
  confidenceAfter: 40,
});

const engine = new SafeScopeImprovementCandidateEngineService();
const result = engine.generate({
  memories: learningMemory.list(),
  minimumSupportCount: 1,
  limit: 10,
});

assert(result.candidates.length >= 4, `Expected at least 4 improvement candidates, got ${result.candidates.length}.`);

const citationCandidate = result.candidates.find((candidate) => candidate.type === 'citation_registry_candidate');
assert(citationCandidate, 'Expected citation registry candidate.');
assert(citationCandidate.targetKey === 'citation:30 CFR 57.8520', `Unexpected citation target: ${citationCandidate.targetKey}`);
assert(citationCandidate.supportCount === 2, `Expected citation candidate support count 2, got ${citationCandidate.supportCount}.`);
assert(citationCandidate.governance.canAutoApply === false, 'Candidate must not auto-apply.');

const scenarioCandidate = result.candidates.find((candidate) => candidate.type === 'scenario_disambiguation_candidate');
assert(scenarioCandidate, 'Expected scenario disambiguation candidate.');
assert(
  scenarioCandidate.urgency === 'high' || scenarioCandidate.urgency === 'critical',
  `Expected high or critical scenario urgency, got ${scenarioCandidate.urgency}.`,
);

const evidenceGateCandidate = result.candidates.find((candidate) => candidate.type === 'evidence_gate_candidate');
assert(evidenceGateCandidate, 'Expected evidence gate candidate.');
assert(evidenceGateCandidate.recommendedAction.includes('evidence gate') || evidenceGateCandidate.recommendedAction.includes('Increase'), 'Evidence gate candidate should include a registry/evidence recommendation.');

assert(result.boundary.readOnly === true, 'Improvement Candidate Engine must be read-only.');
assert(result.boundary.advisoryOnly === true, 'Improvement Candidate Engine must be advisory only.');
assert(result.boundary.canModifyProductionReasoning === false, 'Improvement Candidate Engine must not modify production reasoning.');
assert(result.boundary.canAutoApply === false, 'Improvement Candidate Engine must not auto-apply.');
assert(result.boundary.canAutoApproveRegistryChange === false, 'Improvement Candidate Engine must not auto-approve registry changes.');
assert(result.boundary.requiresQualifiedReview === true, 'Improvement Candidate Engine must require qualified review.');

console.log('✅ SafeScope Improvement Candidate Engine v1 validation passed.');
console.log(`Candidates: ${result.summary.totalCandidates}`);
console.log(`High candidates: ${result.summary.highCandidates}`);
console.log(`Top target: ${result.summary.topTargets[0]}`);
