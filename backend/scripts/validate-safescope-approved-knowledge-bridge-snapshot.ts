import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/bridge/reports/approved-knowledge-bridge-snapshot.json',
);

assert(fs.existsSync(snapshotPath), 'Bridge snapshot does not exist. Run generate-safescope-approved-knowledge-bridge-snapshot.ts first.');

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

assert(snapshot.engine === 'safescope_approved_knowledge_bridge_snapshot', 'Snapshot engine changed.');
assert(snapshot.mode === 'contract_snapshot_read_only', 'Snapshot mode changed.');
assert(Boolean(snapshot.generatedAt), 'Snapshot missing generatedAt.');
assert(Boolean(snapshot.purpose), 'Snapshot missing purpose.');
assert(Boolean(snapshot.sourceBoundary), 'Snapshot missing sourceBoundary.');

assert(snapshot.disabledSnapshot?.engine === 'safescope_approved_knowledge_bridge', 'Disabled snapshot bridge engine changed.');
assert(snapshot.disabledSnapshot?.mode === 'disabled_by_default_read_only', 'Disabled snapshot bridge mode changed.');
assert(snapshot.disabledSnapshot?.enabled === false, 'Bridge must be disabled by default.');
assert(Array.isArray(snapshot.disabledSnapshot?.references), 'Disabled snapshot references must be an array.');
assert(Array.isArray(snapshot.disabledSnapshot?.recordsUsed), 'Disabled snapshot recordsUsed must be an array.');
assert(snapshot.disabledSnapshot.references.length === 0, 'Disabled bridge must not return references.');
assert(snapshot.disabledSnapshot.recordsUsed.length === 0, 'Disabled bridge must not return records.');

assert(snapshot.enabledSnapshot?.engine === 'safescope_approved_knowledge_bridge', 'Enabled snapshot bridge engine changed.');
assert(snapshot.enabledSnapshot?.mode === 'disabled_by_default_read_only', 'Enabled snapshot bridge mode changed.');
assert(snapshot.enabledSnapshot?.enabled === true, 'Enabled snapshot should show explicit enablement only.');

const disabledBoundary = snapshot.disabledSnapshot.reasoningUseBoundary;
const enabledBoundary = snapshot.enabledSnapshot.reasoningUseBoundary;

for (const [label, boundary] of [
  ['disabled', disabledBoundary],
  ['enabled', enabledBoundary],
] as const) {
  assert(boundary.canCreateCitations === false, `${label}: bridge must not create citations.`);
  assert(boundary.canDeclareViolations === false, `${label}: bridge must not declare violations.`);
  assert(boundary.canOverrideRegulations === false, `${label}: bridge must not override regulations.`);
  assert(boundary.canBypassHumanReview === false, `${label}: bridge must not bypass human review.`);
  assert(boundary.canUseUnapprovedRecords === false, `${label}: bridge must not use unapproved records.`);
  assert(boundary.productionReasoningModified === false, `${label}: bridge must not modify production reasoning.`);
}

assert(snapshot.contractAssertions?.bridgeDisabledByDefault === true, 'Contract assertion failed: bridgeDisabledByDefault.');
assert(snapshot.contractAssertions?.disabledBridgeReturnsNoReferences === true, 'Contract assertion failed: disabledBridgeReturnsNoReferences.');
assert(snapshot.contractAssertions?.disabledBridgeReturnsNoRecords === true, 'Contract assertion failed: disabledBridgeReturnsNoRecords.');
assert(snapshot.contractAssertions?.enabledBridgeStillReadOnly === true, 'Contract assertion failed: enabledBridgeStillReadOnly.');
assert(snapshot.contractAssertions?.cannotCreateCitations === true, 'Contract assertion failed: cannotCreateCitations.');
assert(snapshot.contractAssertions?.cannotDeclareViolations === true, 'Contract assertion failed: cannotDeclareViolations.');
assert(snapshot.contractAssertions?.cannotOverrideRegulations === true, 'Contract assertion failed: cannotOverrideRegulations.');
assert(snapshot.contractAssertions?.cannotBypassHumanReview === true, 'Contract assertion failed: cannotBypassHumanReview.');
assert(snapshot.contractAssertions?.cannotUseUnapprovedRecords === true, 'Contract assertion failed: cannotUseUnapprovedRecords.');
assert(snapshot.contractAssertions?.productionReasoningUnchanged === true, 'Contract assertion failed: productionReasoningUnchanged.');

assert(
  String(snapshot.sourceBoundary).includes('does not approve knowledge records'),
  'Snapshot sourceBoundary must preserve approval boundary.',
);

console.log('✅ SafeScope approved knowledge bridge snapshot validation passed.');
