import * as fs from 'fs';
import * as path from 'path';
import { ApprovedKnowledgeIntegrationAdapterService } from '../src/safescope-v2/knowledge-intake/integration/approved-knowledge-integration-adapter.service';

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/integration/reports/approved-knowledge-integration-snapshot.json',
);

const adapter = new ApprovedKnowledgeIntegrationAdapterService();

const disabledSnapshot = adapter.getContextForReasoning({
  reasoningEngine: 'safescope_native',
  classification: 'Machine Guarding',
  hazardObservation: 'exposed conveyor nip point near employee access path',
  jurisdictionHint: 'MSHA_OR_OSHA_REVIEW_NEEDED',
});

const enabledSnapshot = adapter.getContextForReasoning({
  enabled: true,
  reasoningEngine: 'safescope_native',
  classification: 'Machine Guarding',
  hazardObservation: 'machine guarding point of operation employee exposure',
  jurisdictionHint: 'OSHA_GENERAL_INDUSTRY',
  limit: 5,
});

const snapshot = {
  engine: 'safescope_approved_knowledge_integration_snapshot',
  mode: 'contract_snapshot_read_only',
  generatedAt: new Date().toISOString(),
  purpose:
    'Document the SafeScope approved knowledge integration adapter contract before any production SafeScope native reasoning integration.',
  disabledSnapshot,
  enabledSnapshot,
  contractAssertions: {
    adapterDisabledByDefault: disabledSnapshot.enabled === false,
    disabledAdapterReturnsNoReferences: disabledSnapshot.references.length === 0,
    disabledAdapterReturnsNoRecords: disabledSnapshot.recordsUsed.length === 0,
    enabledAdapterStillReadOnly: enabledSnapshot.adapterUseBoundary.readOnly === true,
    cannotModifyNativeReasoning:
      disabledSnapshot.adapterUseBoundary.canModifyNativeReasoning === false &&
      enabledSnapshot.adapterUseBoundary.canModifyNativeReasoning === false,
    cannotCreateCitations:
      disabledSnapshot.adapterUseBoundary.canCreateCitations === false &&
      enabledSnapshot.adapterUseBoundary.canCreateCitations === false,
    cannotDeclareViolations:
      disabledSnapshot.adapterUseBoundary.canDeclareViolations === false &&
      enabledSnapshot.adapterUseBoundary.canDeclareViolations === false,
    cannotOverrideRegulations:
      disabledSnapshot.adapterUseBoundary.canOverrideRegulations === false &&
      enabledSnapshot.adapterUseBoundary.canOverrideRegulations === false,
    cannotBypassHumanReview:
      disabledSnapshot.adapterUseBoundary.canBypassHumanReview === false &&
      enabledSnapshot.adapterUseBoundary.canBypassHumanReview === false,
    cannotUseUnapprovedRecords:
      disabledSnapshot.adapterUseBoundary.canUseUnapprovedRecords === false &&
      enabledSnapshot.adapterUseBoundary.canUseUnapprovedRecords === false,
  },
  sourceBoundary:
    'This integration snapshot is a contract and documentation artifact only. It does not approve records, wire approved knowledge into production reasoning, alter SafeScope native reasoning, create citations, declare violations, override regulations, or bypass qualified human review.',
};

fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log('✅ SafeScope approved knowledge integration snapshot generated.');
console.log(`Snapshot: ${snapshotPath}`);
console.log(`Disabled references: ${disabledSnapshot.references.length}`);
console.log(`Enabled references: ${enabledSnapshot.references.length}`);
