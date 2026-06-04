import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const service = Object.create(
  ReasoningSnapshotService.prototype,
) as ReasoningSnapshotService;

const intelligence = {
  intelligenceMetadata: {
    engineVersion: 'safescope-test-v2',
  },
  confidenceCalibration: {
    calibrationBand: 'reliable',
  },
  reasoningDrift: {
    driftBand: 'low',
  },
  equipmentReasoningSummary: {
    primaryReasoningMode: 'specific_with_archetype_support',
    primaryEquipmentContext: 'Conveyor / Tail Pulley',
    primaryMechanismOrArchetype: 'Missing Tail Pulley Guard',
    rankingReasons: ['Specific equipment/component/failure-mode match was available.'],
    guardrails: {
      contextOnly: true,
      advisoryOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      doesNotOverrideRegulation: true,
      requiresQualifiedReview: true,
    },
  },
  equipmentTaskMechanismContext: {
    matched: true,
    primaryMatch: {
      equipmentId: 'conveyor',
      componentId: 'tail_pulley',
      failureModeId: 'missing_tail_pulley_guard',
    },
  },
  equipmentArchetypeContext: {
    matched: true,
    primaryMatch: {
      archetypeId: 'powered_conveyor_system',
    },
  },
};

const snapshot = service.buildSnapshot({
  reportId: 'report-test-1',
  workspaceId: 'workspace-test-1',
  classification: 'machine_guarding',
  intelligence,
});

assert(snapshot.reportId === 'report-test-1', 'Snapshot reportId should be preserved.');
assert(snapshot.workspaceId === 'workspace-test-1', 'Snapshot workspaceId should be preserved.');
assert(snapshot.classification === 'machine_guarding', 'Snapshot classification should be preserved.');
assert(snapshot.engineVersion === 'safescope-test-v2', 'Snapshot engine version should be extracted.');
assert(snapshot.validationStatus === 'generated', 'Reliable snapshot should be generated.');

assert(
  snapshot.equipmentReasoningSummary?.primaryReasoningMode === 'specific_with_archetype_support',
  'Snapshot should persist equipmentReasoningSummary.',
);
assert(
  snapshot.equipmentTaskMechanismContext?.primaryMatch?.failureModeId === 'missing_tail_pulley_guard',
  'Snapshot should persist equipmentTaskMechanismContext.',
);
assert(
  snapshot.equipmentArchetypeContext?.primaryMatch?.archetypeId === 'powered_conveyor_system',
  'Snapshot should persist equipmentArchetypeContext.',
);
assert(
  snapshot.fullIntelligenceSnapshot?.equipmentReasoningSummary?.guardrails?.requiresQualifiedReview === true,
  'Full intelligence snapshot should preserve equipment reasoning guardrails.',
);

const reviewSnapshot = service.buildSnapshot({
  classification: 'electrical',
  intelligence: {
    confidenceCalibration: {
      calibrationBand: 'limited_reliability',
    },
    equipmentReasoningSummary: {
      primaryReasoningMode: 'archetype_fallback',
    },
  },
});

assert(
  reviewSnapshot.validationStatus === 'requires_review',
  'Limited reliability snapshot should require review.',
);

console.log('✅ SafeScope reasoning snapshot equipment field validation passed.');
console.log(
  `Snapshot equipment mode: ${snapshot.equipmentReasoningSummary?.primaryReasoningMode}`,
);
