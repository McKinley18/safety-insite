import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeBridgeService } from '../src/safescope-v2/knowledge-intake/bridge/approved-knowledge-bridge.service';

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/bridge/reports/approved-knowledge-bridge-snapshot.json',
);

const bridgeService = new ApprovedKnowledgeBridgeService();

const disabledSnapshot = bridgeService.getApprovedKnowledgeContext({
  classification: 'Machine Guarding',
  hazardObservation: 'exposed conveyor nip point near employee access path',
});

const enabledSnapshot = bridgeService.getApprovedKnowledgeContext({
  enabled: true,
  classification: 'Machine Guarding',
  hazardObservation: 'machine guarding point of operation employee exposure',
  query: {
    text: 'machine guarding',
    hazardDomain: 'mechanical',
  },
  limit: 5,
});

const snapshot = {
  engine: 'safescope_approved_knowledge_bridge_snapshot',
  mode: 'contract_snapshot_read_only',
  generatedAt: new Date().toISOString(),
  purpose:
    'Document the SafeScope approved knowledge bridge contract before production reasoning integration. This snapshot is advisory and does not modify SafeScope reasoning behavior.',
  disabledSnapshot,
  enabledSnapshot,
  contractAssertions: {
    bridgeDisabledByDefault: disabledSnapshot.enabled === false,
    disabledBridgeReturnsNoReferences: disabledSnapshot.references.length === 0,
    disabledBridgeReturnsNoRecords: disabledSnapshot.recordsUsed.length === 0,
    enabledBridgeStillReadOnly: enabledSnapshot.reasoningUseBoundary.productionReasoningModified === false,
    cannotCreateCitations:
      disabledSnapshot.reasoningUseBoundary.canCreateCitations === false &&
      enabledSnapshot.reasoningUseBoundary.canCreateCitations === false,
    cannotDeclareViolations:
      disabledSnapshot.reasoningUseBoundary.canDeclareViolations === false &&
      enabledSnapshot.reasoningUseBoundary.canDeclareViolations === false,
    cannotOverrideRegulations:
      disabledSnapshot.reasoningUseBoundary.canOverrideRegulations === false &&
      enabledSnapshot.reasoningUseBoundary.canOverrideRegulations === false,
    cannotBypassHumanReview:
      disabledSnapshot.reasoningUseBoundary.canBypassHumanReview === false &&
      enabledSnapshot.reasoningUseBoundary.canBypassHumanReview === false,
    cannotUseUnapprovedRecords:
      disabledSnapshot.reasoningUseBoundary.canUseUnapprovedRecords === false &&
      enabledSnapshot.reasoningUseBoundary.canUseUnapprovedRecords === false,
    productionReasoningUnchanged:
      disabledSnapshot.reasoningUseBoundary.productionReasoningModified === false &&
      enabledSnapshot.reasoningUseBoundary.productionReasoningModified === false,
  },
  sourceBoundary:
    'This bridge snapshot is a contract and documentation artifact only. It does not approve knowledge records, alter SafeScope native reasoning, declare violations, create citations, or bypass qualified human review.',
};

fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log('✅ SafeScope approved knowledge bridge snapshot generated.');
console.log(`Snapshot: ${snapshotPath}`);
console.log(`Disabled references: ${disabledSnapshot.references.length}`);
console.log(`Enabled references: ${enabledSnapshot.references.length}`);
