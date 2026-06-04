import { SafeScopeLearningMemoryService } from '../src/safescope-v2/brain/learning-memory/learning-memory.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const service = new SafeScopeLearningMemoryService();

const accepted = service.add({
  source: 'supervisor_review',
  workspaceId: 'workspace-alpha',
  snapshotId: 'snapshot-guarding-001',
  findingId: 'finding-001',
  jurisdiction: 'msha',
  originalDomain: 'machine_guarding',
  correctedDomain: 'machine_guarding',
  originalCitation: '30 CFR 56.14107',
  correctedCitation: '30 CFR 56.14107',
  originalMechanism: 'rotating_equipment_nip_point',
  correctedMechanism: 'rotating_equipment_nip_point',
  reviewOutcome: 'accepted',
  reviewerRationale: 'Guarding citation and mechanism were appropriate for exposed conveyor tail pulley.',
  confidenceBefore: 94,
  confidenceAfter: 96,
});

const corrected = service.add({
  source: 'field_test',
  workspaceId: 'workspace-alpha',
  snapshotId: 'snapshot-vent-001',
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
  missingEvidence: ['Mine type was metal/nonmetal underground, not coal.'],
  reviewerRationale: 'The system over-weighted coal ventilation language and missed MNM context.',
  recommendedRegistryUpdate: 'Increase MNM underground ventilation disambiguation weight when part 57 or metal/nonmetal signals are present.',
  confidenceBefore: 78,
  confidenceAfter: 52,
});

const held = service.add({
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

assert(accepted.signalTypes.includes('reviewer_rationale'), 'Accepted review should retain reviewer rationale signal.');
assert(corrected.signalTypes.includes('citation_correction'), 'Corrected review should infer citation correction.');
assert(corrected.signalTypes.includes('mechanism_correction'), 'Corrected review should infer mechanism correction.');
assert(corrected.signalTypes.includes('scenario_correction'), 'Corrected review should infer scenario correction.');
assert(held.signalTypes.includes('evidence_gap'), 'Held review should infer evidence gap signal.');

const ventilationCorrections = service.query({
  citation: '30 CFR 57.8520',
  outcome: 'corrected',
});

assert(ventilationCorrections.length === 1, `Expected one corrected 30 CFR 57.8520 memory, got ${ventilationCorrections.length}.`);

const summary = service.summarize();

assert(summary.totalRecords === 3, `Expected 3 memory records, got ${summary.totalRecords}.`);
assert(summary.outcomeCounts.accepted === 1, 'Expected one accepted record.');
assert(summary.outcomeCounts.corrected === 1, 'Expected one corrected record.');
assert(summary.outcomeCounts.held_for_evidence === 1, 'Expected one held-for-evidence record.');
assert(summary.signalCounts.citation_correction >= 1, 'Expected citation correction signal count.');
assert(summary.signalCounts.evidence_gap >= 1, 'Expected evidence gap signal count.');
assert(summary.topCorrectionTargets.includes('citation:30 CFR 57.8520'), 'Summary should include corrected citation target.');
assert(summary.recommendedImprovementBacklog.length >= 2, 'Summary should include improvement backlog items.');

assert(summary.boundary.readOnly === true, 'Learning Memory must be read-only.');
assert(summary.boundary.advisoryOnly === true, 'Learning Memory must be advisory only.');
assert(summary.boundary.canModifyProductionReasoning === false, 'Learning Memory must not modify production reasoning.');
assert(summary.boundary.canAutoApproveRegistryChange === false, 'Learning Memory must not auto-approve registry changes.');
assert(summary.boundary.requiresQualifiedReview === true, 'Learning Memory must require qualified review.');

console.log('✅ SafeScope Learning Memory v1 validation passed.');
console.log(`Learning records: ${summary.totalRecords}`);
console.log(`Corrected count: ${summary.outcomeCounts.corrected}`);
console.log(`Top correction target: ${summary.topCorrectionTargets[0]}`);
console.log(`Backlog items: ${summary.recommendedImprovementBacklog.length}`);
