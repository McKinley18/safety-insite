import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';
import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const reasoning = new SafeScopeReasoningOrchestratorService();
const snapshotService = Object.create(
  ReasoningSnapshotService.prototype,
) as ReasoningSnapshotService;

const fusedText =
  'Missing guard on conveyor tail pulley with employee access to the nip point during cleanup at a surface aggregate mine. Photo shows exposed tail pulley and cleanup area.';

const equipmentReasoningContext = reasoning.reason({
  hazardObservation: fusedText,
  siteType: 'msha',
  taskContext: fusedText,
  industryContext: 'msha',
  photosAvailable: true,
  employeeExposureKnown: undefined,
  equipmentInvolved: fusedText,
  enableApprovedKnowledgeContext: false,
});

const intelligence: any = {
  intelligenceMetadata: {
    engineVersion: 'safescope-test-v2-live-path',
  },
  confidenceCalibration: {
    calibrationBand: 'reliable',
  },
  reasoningDrift: {
    driftBand: 'low',
  },
};

intelligence.equipmentTaskMechanismContext =
  equipmentReasoningContext.equipmentTaskMechanismContext;
intelligence.equipmentArchetypeContext =
  equipmentReasoningContext.equipmentArchetypeContext;
intelligence.equipmentReasoningSummary =
  equipmentReasoningContext.equipmentReasoningSummary;

assert(
  intelligence.equipmentTaskMechanismContext?.matched === true,
  'Live-path intelligence should include matched task mechanism context.',
);
assert(
  intelligence.equipmentTaskMechanismContext?.primaryMatch?.failureModeId ===
    'missing_tail_pulley_guard',
  'Live-path intelligence should identify missing tail pulley guard.',
);
assert(
  intelligence.equipmentArchetypeContext?.matched === true,
  'Live-path intelligence should include matched archetype context.',
);
assert(
  intelligence.equipmentReasoningSummary?.primaryReasoningMode ===
    'specific_with_archetype_support',
  'Live-path intelligence should include specific_with_archetype_support summary.',
);

const snapshot = snapshotService.buildSnapshot({
  workspaceId: 'workspace-live-path-test',
  classification: 'Machine Guarding',
  intelligence,
});

assert(
  snapshot.equipmentTaskMechanismContext?.primaryMatch?.failureModeId ===
    'missing_tail_pulley_guard',
  'Snapshot should receive live-path task mechanism context.',
);
assert(
  snapshot.equipmentArchetypeContext?.matched === true,
  'Snapshot should receive live-path archetype context.',
);
assert(
  snapshot.equipmentReasoningSummary?.primaryReasoningMode ===
    'specific_with_archetype_support',
  'Snapshot should receive live-path equipment reasoning summary.',
);

console.log('✅ SafeScope v2 live equipment snapshot context validation passed.');
console.log(
  `Live snapshot mode: ${snapshot.equipmentReasoningSummary?.primaryReasoningMode}`,
);
