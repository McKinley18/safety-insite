import { ApprovedKnowledgeBridgeService } from '../src/safescope-v2/knowledge-intake/bridge/approved-knowledge-bridge.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const bridgeService = new ApprovedKnowledgeBridgeService();

const disabledResult = bridgeService.getApprovedKnowledgeContext({
  classification: 'Machine Guarding',
  hazardObservation: 'exposed conveyor nip point',
});

assert(disabledResult.engine === 'safescope_approved_knowledge_bridge', 'Bridge engine name changed.');
assert(disabledResult.mode === 'disabled_by_default_read_only', 'Bridge mode changed.');
assert(disabledResult.enabled === false, 'Bridge must be disabled by default.');
assert(Array.isArray(disabledResult.references), 'Bridge references must be an array.');
assert(Array.isArray(disabledResult.recordsUsed), 'Bridge recordsUsed must be an array.');
assert(disabledResult.references.length === 0, 'Disabled bridge must not return references.');
assert(disabledResult.recordsUsed.length === 0, 'Disabled bridge must not return records.');

assert(disabledResult.reasoningUseBoundary.canSupplementReasoning === false, 'Disabled bridge must not supplement reasoning.');
assert(disabledResult.reasoningUseBoundary.canCreateCitations === false, 'Bridge must never create citations.');
assert(disabledResult.reasoningUseBoundary.canDeclareViolations === false, 'Bridge must never declare violations.');
assert(disabledResult.reasoningUseBoundary.canOverrideRegulations === false, 'Bridge must never override regulations.');
assert(disabledResult.reasoningUseBoundary.canBypassHumanReview === false, 'Bridge must never bypass human review.');
assert(disabledResult.reasoningUseBoundary.canUseUnapprovedRecords === false, 'Bridge must never use unapproved records.');
assert(disabledResult.reasoningUseBoundary.productionReasoningModified === false, 'Bridge must not modify production reasoning.');

assert(
  disabledResult.bridgeNotes.some((note) => note.toLowerCase().includes('disabled by default')),
  'Bridge notes must state disabled-by-default behavior.',
);

assert(
  disabledResult.bridgeNotes.some((note) => note.toLowerCase().includes('production safescope reasoning behavior is unchanged')),
  'Bridge notes must state production reasoning is unchanged.',
);

const enabledNoRecordsResult = bridgeService.getApprovedKnowledgeContext({
  enabled: true,
  classification: 'Machine Guarding',
  hazardObservation: 'machine guarding',
  limit: 5,
});

assert(enabledNoRecordsResult.enabled === true, 'Explicitly enabled bridge should report enabled true.');
assert(enabledNoRecordsResult.engine === 'safescope_approved_knowledge_bridge', 'Enabled bridge engine name changed.');
assert(enabledNoRecordsResult.mode === 'disabled_by_default_read_only', 'Enabled bridge mode changed.');

assert(enabledNoRecordsResult.reasoningUseBoundary.canSupplementReasoning === true, 'Enabled bridge may supplement reasoning context.');
assert(enabledNoRecordsResult.reasoningUseBoundary.canCreateCitations === false, 'Enabled bridge must not create citations.');
assert(enabledNoRecordsResult.reasoningUseBoundary.canDeclareViolations === false, 'Enabled bridge must not declare violations.');
assert(enabledNoRecordsResult.reasoningUseBoundary.canOverrideRegulations === false, 'Enabled bridge must not override regulations.');
assert(enabledNoRecordsResult.reasoningUseBoundary.canBypassHumanReview === false, 'Enabled bridge must not bypass human review.');
assert(enabledNoRecordsResult.reasoningUseBoundary.canUseUnapprovedRecords === false, 'Enabled bridge must not use unapproved records.');
assert(enabledNoRecordsResult.reasoningUseBoundary.productionReasoningModified === false, 'Enabled bridge must not modify production reasoning.');

assert(
  enabledNoRecordsResult.recordsUsed.every(
    (record) => record.reviewStatus === 'approved_by_human' && record.approvedForUse === true,
  ),
  'Bridge recordsUsed must contain only approved_by_human and approvedForUse records.',
);

console.log('✅ SafeScope approved knowledge bridge contract validation passed.');
