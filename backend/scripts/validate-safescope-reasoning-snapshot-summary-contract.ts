import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';
import { SafeScopeReasoningSnapshot } from '../src/safescope-v2/snapshots/reasoning-snapshot.entity';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const service = Object.create(
  ReasoningSnapshotService.prototype,
) as ReasoningSnapshotService;

const snapshot = {
  id: 'snapshot-test-1',
  reportId: 'report-test-1',
  workspaceId: 'workspace-test-1',
  classification: 'machine_guarding',
  engineVersion: 'safescope-test-v2',
  validationStatus: 'generated',
  createdAt: new Date('2026-05-31T12:00:00.000Z'),
  intelligenceMetadata: {
    engineVersion: 'safescope-test-v2',
  },
  confidenceCalibration: {
    calibrationBand: 'reliable',
  },
  reasoningDrift: {
    driftBand: 'low',
  },
  operationalReasoning: {
    task: 'inspection',
  },
  standardsReasoning: {
    topDefensible: [],
  },
  decisionExplainability: {
    decisionSummary: 'Machine guarding context identified.',
  },
  equipmentReasoningSummary: {
    primaryReasoningMode: 'specific_with_archetype_support',
    primaryEquipmentContext: 'Conveyor / Tail Pulley',
    primaryMechanismOrArchetype: 'Missing Tail Pulley Guard',
  },
  equipmentTaskMechanismContext: {
    matched: true,
    primaryMatch: {
      failureModeId: 'missing_tail_pulley_guard',
    },
  },
  equipmentArchetypeContext: {
    matched: true,
    primaryMatch: {
      archetypeId: 'powered_conveyor_system',
    },
  },
  fullIntelligenceSnapshot: {
    largeRawPayload: true,
  },
} as SafeScopeReasoningSnapshot;

const summary = service.buildSnapshotSummary(snapshot);

assert(Boolean(summary), 'Summary should be returned for snapshot.');
assert(summary?.id === 'snapshot-test-1', 'Summary id should be preserved.');
assert(summary?.reportId === 'report-test-1', 'Summary reportId should be preserved.');
assert(summary?.workspaceId === 'workspace-test-1', 'Summary workspaceId should be preserved.');
assert(summary?.classification === 'machine_guarding', 'Summary classification should be preserved.');
assert(summary?.engineVersion === 'safescope-test-v2', 'Summary engine version should be preserved.');
assert(summary?.validationStatus === 'generated', 'Summary validation status should be preserved.');
assert(summary?.rawSnapshotAvailable === true, 'Summary should expose raw snapshot availability.');

assert(
  summary?.equipmentReasoningSummary?.primaryReasoningMode === 'specific_with_archetype_support',
  'Summary should expose equipment reasoning summary.',
);
assert(
  summary?.equipmentTaskMechanismContext?.primaryMatch?.failureModeId === 'missing_tail_pulley_guard',
  'Summary should expose task mechanism context.',
);
assert(
  summary?.equipmentArchetypeContext?.primaryMatch?.archetypeId === 'powered_conveyor_system',
  'Summary should expose archetype context.',
);

assert(summary?.reviewBoundary.advisoryOnly === true, 'Summary must remain advisory-only.');
assert(summary?.reviewBoundary.contextOnly === true, 'Summary must remain context-only.');
assert(summary?.reviewBoundary.doesNotDeclareViolation === true, 'Summary must not declare violations.');
assert(summary?.reviewBoundary.doesNotCreateCitation === true, 'Summary must not create citations.');
assert(summary?.reviewBoundary.doesNotOverrideRegulation === true, 'Summary must not override regulation.');
assert(summary?.reviewBoundary.requiresQualifiedReview === true, 'Summary must require qualified review.');

const missing = service.buildSnapshotSummary(null);
assert(missing === null, 'Null snapshot should return null summary.');

console.log('✅ SafeScope reasoning snapshot summary contract validation passed.');
console.log(`Snapshot summary mode: ${summary?.equipmentReasoningSummary?.primaryReasoningMode}`);
