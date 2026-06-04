import { SafeScopeBrainSnapshotBuilderService } from '../src/safescope-v2/brain/snapshot-builder/brain-snapshot-builder.service';
import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const snapshotBuilder = new SafeScopeBrainSnapshotBuilderService();

const directSnapshot = snapshotBuilder.build({
  hazardObservation:
    'A surface metal/nonmetal conveyor tail pulley is missing its guard and exposes employees to rotating equipment.',
  siteType: 'surface mine',
  industryContext: 'mining',
  taskContext: 'production inspection',
  equipmentInvolved: 'conveyor tail pulley',
  jurisdiction: 'msha',
  hazardDomain: 'machine_guarding',
  mechanismId: 'rotating_equipment_nip_point',
  primaryCitation: '30 CFR 56.14107',
});

assert(directSnapshot.engine === 'safescope_brain_snapshot_builder', 'Snapshot builder engine mismatch.');
assert(directSnapshot.mode === 'read_only_reasoning_context_snapshot', 'Snapshot mode mismatch.');
assert(directSnapshot.boundary.readOnly === true, 'Snapshot must be read-only.');
assert(directSnapshot.boundary.canModifyProductionReasoning === false, 'Snapshot must not modify production reasoning.');
assert(
  !Object.prototype.hasOwnProperty.call(directSnapshot, 'summary'),
  'Snapshot should not expose a duplicate summary field outside packet.',
);
assert(
  directSnapshot.situationalAwarenessPacket.summary.likelyCitation === '30 CFR 56.14107',
  'Direct snapshot should identify the surface MSHA machine guarding citation.',
);
assert(
  ['rotating_equipment_nip_point', 'rotating_equipment'].includes(
    directSnapshot.situationalAwarenessPacket.summary.likelyMechanism || '',
  ),
  `Direct snapshot should identify rotating-equipment mechanism context, got ${directSnapshot.situationalAwarenessPacket.summary.likelyMechanism}.`,
);
assert(
  directSnapshot.situationalAwarenessPacket.summary.likelyControls.length > 0,
  'Direct snapshot should include likely controls.',
);
assert(
  directSnapshot.situationalAwarenessPacket.summary.criticalEvidenceQuestions.length > 0,
  'Direct snapshot should include critical evidence questions.',
);

assert(
  directSnapshot.situationalAwarenessPacket.observationUnderstanding.boundary.readOnly === true,
  'Direct snapshot should include read-only Observation Understanding.',
);

assert(
  directSnapshot.situationalAwarenessPacket.summary.observationPrimaryEntityLabel === 'conveyor',
  `Direct snapshot should understand the primary observation entity as conveyor, got ${directSnapshot.situationalAwarenessPacket.summary.observationPrimaryEntityLabel}.`,
);

const orchestrator = new SafeScopeReasoningOrchestratorService();

const reasoningResult = orchestrator.reason({
  hazardObservation:
    'A surface metal/nonmetal conveyor tail pulley is missing its guard and exposes employees to rotating equipment.',
  siteType: 'surface mine',
  industryContext: 'mining',
  taskContext: 'production inspection',
  equipmentInvolved: 'conveyor tail pulley',
  photosAvailable: false,
  employeeExposureKnown: true,
  measurementsAvailable: false,
  enableApprovedKnowledgeContext: false,
});

assert(reasoningResult.brainSnapshot !== undefined, 'Reasoning result must include a Brain snapshot.');
assert(
  reasoningResult.brainSnapshot.boundary.canModifyProductionReasoning === false,
  'Reasoning Brain snapshot must not modify production reasoning.',
);
assert(
  reasoningResult.brainSnapshot.situationalAwarenessPacket.boundary.canModifyProductionReasoning === false,
  'Situational awareness packet must not modify production reasoning.',
);
assert(
  reasoningResult.primaryCitation === '30 CFR 56.14107',
  'Native reasoning citation should remain unchanged for surface MNM conveyor guarding.',
);
assert(
  typeof reasoningResult.resolvedMechanism?.mechanismId === 'string' &&
    reasoningResult.resolvedMechanism.mechanismId.length > 0,
  'Native reasoning should still return a resolved mechanism value.',
);
assert(
  reasoningResult.brainSnapshot.queryContext.hazardDomain === 'machine_guarding',
  'Brain snapshot should preserve hazard-domain query context.',
);
assert(
  ['rotating_equipment_nip_point', 'rotating_equipment'].includes(
    reasoningResult.brainSnapshot.situationalAwarenessPacket.summary.likelyMechanism || '',
  ),
  `Reasoning Brain snapshot should identify the rotating-equipment family for surface conveyor guarding, got ${reasoningResult.brainSnapshot.situationalAwarenessPacket.summary.likelyMechanism}.`,
);
assert(
  reasoningResult.brainSnapshot.situationalAwarenessPacket.summary.criticalEvidenceQuestions.length > 0,
  'Reasoning Brain snapshot should provide evidence questions.',
);

console.log('✅ SafeScope Brain Snapshot Builder validation passed.');
console.log(`Direct snapshot citation: ${directSnapshot.situationalAwarenessPacket.summary.likelyCitation}`);
console.log(`Reasoning snapshot citation: ${reasoningResult.brainSnapshot.situationalAwarenessPacket.summary.likelyCitation}`);
console.log(`Reasoning snapshot mechanism: ${reasoningResult.brainSnapshot.situationalAwarenessPacket.summary.likelyMechanism}`);
