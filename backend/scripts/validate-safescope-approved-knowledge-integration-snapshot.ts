import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshotPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/integration/reports/approved-knowledge-integration-snapshot.json',
);

assert(
  fs.existsSync(snapshotPath),
  'Integration snapshot does not exist. Run generate-safescope-approved-knowledge-integration-snapshot.ts first.',
);

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

assert(snapshot.engine === 'safescope_approved_knowledge_integration_snapshot', 'Snapshot engine changed.');
assert(snapshot.mode === 'contract_snapshot_read_only', 'Snapshot mode changed.');
assert(Boolean(snapshot.generatedAt), 'Snapshot missing generatedAt.');
assert(Boolean(snapshot.purpose), 'Snapshot missing purpose.');
assert(Boolean(snapshot.sourceBoundary), 'Snapshot missing sourceBoundary.');

assert(snapshot.disabledSnapshot?.engine === 'safescope_approved_knowledge_integration_adapter', 'Disabled adapter engine changed.');
assert(snapshot.disabledSnapshot?.mode === 'disabled_by_default_context_adapter', 'Disabled adapter mode changed.');
assert(snapshot.disabledSnapshot?.enabled === false, 'Adapter must be disabled by default.');
assert(Array.isArray(snapshot.disabledSnapshot?.references), 'Disabled references must be an array.');
assert(Array.isArray(snapshot.disabledSnapshot?.recordsUsed), 'Disabled recordsUsed must be an array.');
assert(snapshot.disabledSnapshot.references.length === 0, 'Disabled adapter must not return references.');
assert(snapshot.disabledSnapshot.recordsUsed.length === 0, 'Disabled adapter must not return records.');

assert(snapshot.enabledSnapshot?.engine === 'safescope_approved_knowledge_integration_adapter', 'Enabled adapter engine changed.');
assert(snapshot.enabledSnapshot?.mode === 'disabled_by_default_context_adapter', 'Enabled adapter mode changed.');
assert(snapshot.enabledSnapshot?.enabled === true, 'Enabled snapshot should show explicit enablement only.');

const disabledBoundary = snapshot.disabledSnapshot.adapterUseBoundary;
const enabledBoundary = snapshot.enabledSnapshot.adapterUseBoundary;

for (const [label, boundary] of [
  ['disabled', disabledBoundary],
  ['enabled', enabledBoundary],
] as const) {
  assert(boundary.readOnly === true, `${label}: adapter must be read-only.`);
  assert(boundary.disabledByDefault === true, `${label}: adapter must declare disabled-by-default.`);
  assert(boundary.canModifyNativeReasoning === false, `${label}: adapter must not modify native reasoning.`);
  assert(boundary.canCreateCitations === false, `${label}: adapter must not create citations.`);
  assert(boundary.canDeclareViolations === false, `${label}: adapter must not declare violations.`);
  assert(boundary.canOverrideRegulations === false, `${label}: adapter must not override regulations.`);
  assert(boundary.canBypassHumanReview === false, `${label}: adapter must not bypass human review.`);
  assert(boundary.canUseUnapprovedRecords === false, `${label}: adapter must not use unapproved records.`);
}

assert(snapshot.contractAssertions?.adapterDisabledByDefault === true, 'Contract assertion failed: adapterDisabledByDefault.');
assert(snapshot.contractAssertions?.disabledAdapterReturnsNoReferences === true, 'Contract assertion failed: disabledAdapterReturnsNoReferences.');
assert(snapshot.contractAssertions?.disabledAdapterReturnsNoRecords === true, 'Contract assertion failed: disabledAdapterReturnsNoRecords.');
assert(snapshot.contractAssertions?.enabledAdapterStillReadOnly === true, 'Contract assertion failed: enabledAdapterStillReadOnly.');
assert(snapshot.contractAssertions?.cannotModifyNativeReasoning === true, 'Contract assertion failed: cannotModifyNativeReasoning.');
assert(snapshot.contractAssertions?.cannotCreateCitations === true, 'Contract assertion failed: cannotCreateCitations.');
assert(snapshot.contractAssertions?.cannotDeclareViolations === true, 'Contract assertion failed: cannotDeclareViolations.');
assert(snapshot.contractAssertions?.cannotOverrideRegulations === true, 'Contract assertion failed: cannotOverrideRegulations.');
assert(snapshot.contractAssertions?.cannotBypassHumanReview === true, 'Contract assertion failed: cannotBypassHumanReview.');
assert(snapshot.contractAssertions?.cannotUseUnapprovedRecords === true, 'Contract assertion failed: cannotUseUnapprovedRecords.');

assert(
  String(snapshot.sourceBoundary).includes('does not approve records'),
  'Snapshot sourceBoundary must preserve approval boundary.',
);

assert(
  String(snapshot.sourceBoundary).includes('alter SafeScope native reasoning'),
  'Snapshot sourceBoundary must preserve native reasoning boundary.',
);

console.log('✅ SafeScope approved knowledge integration snapshot validation passed.');
