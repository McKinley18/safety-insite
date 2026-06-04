import { ApprovedKnowledgeIntegrationAdapterService } from '../src/safescope-v2/knowledge-intake/integration/approved-knowledge-integration-adapter.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const adapter = new ApprovedKnowledgeIntegrationAdapterService();

const disabled = adapter.getContextForReasoning({
  reasoningEngine: 'safescope_native',
  classification: 'Machine Guarding',
  hazardObservation: 'exposed conveyor nip point',
  jurisdictionHint: 'MSHA_OR_OSHA_REVIEW_NEEDED',
});

assert(disabled.engine === 'safescope_approved_knowledge_integration_adapter', 'Adapter engine name changed.');
assert(disabled.mode === 'disabled_by_default_context_adapter', 'Adapter mode changed.');
assert(disabled.enabled === false, 'Adapter must be disabled by default.');
assert(disabled.reasoningEngine === 'safescope_native', 'Adapter must preserve reasoning engine.');
assert(Array.isArray(disabled.references), 'Adapter references must be an array.');
assert(Array.isArray(disabled.recordsUsed), 'Adapter recordsUsed must be an array.');
assert(disabled.references.length === 0, 'Disabled adapter must not return references.');
assert(disabled.recordsUsed.length === 0, 'Disabled adapter must not return records.');

assert(disabled.adapterUseBoundary.readOnly === true, 'Adapter must be read-only.');
assert(disabled.adapterUseBoundary.disabledByDefault === true, 'Adapter must declare disabled-by-default.');
assert(disabled.adapterUseBoundary.canProvideContext === false, 'Disabled adapter must not provide context.');
assert(disabled.adapterUseBoundary.canModifyNativeReasoning === false, 'Adapter must never modify native reasoning.');
assert(disabled.adapterUseBoundary.canCreateCitations === false, 'Adapter must never create citations.');
assert(disabled.adapterUseBoundary.canDeclareViolations === false, 'Adapter must never declare violations.');
assert(disabled.adapterUseBoundary.canOverrideRegulations === false, 'Adapter must never override regulations.');
assert(disabled.adapterUseBoundary.canBypassHumanReview === false, 'Adapter must never bypass human review.');
assert(disabled.adapterUseBoundary.canUseUnapprovedRecords === false, 'Adapter must never use unapproved records.');

assert(
  disabled.integrationNotes.some((note) => note.toLowerCase().includes('disabled by default')),
  'Adapter notes must state disabled-by-default behavior.',
);

assert(
  disabled.integrationNotes.some((note) => note.toLowerCase().includes('native reasoning behavior is unchanged')),
  'Adapter notes must state native reasoning behavior is unchanged.',
);

const enabledNoRecords = adapter.getContextForReasoning({
  enabled: true,
  reasoningEngine: 'safescope_native',
  classification: 'Machine Guarding',
  hazardObservation: 'machine guarding',
  jurisdictionHint: 'OSHA_GENERAL_INDUSTRY',
  limit: 5,
});

assert(enabledNoRecords.enabled === true, 'Explicitly enabled adapter should report enabled true.');
assert(enabledNoRecords.engine === 'safescope_approved_knowledge_integration_adapter', 'Enabled adapter engine name changed.');
assert(enabledNoRecords.mode === 'disabled_by_default_context_adapter', 'Enabled adapter mode changed.');
assert(enabledNoRecords.adapterUseBoundary.readOnly === true, 'Enabled adapter must remain read-only.');
assert(enabledNoRecords.adapterUseBoundary.disabledByDefault === true, 'Enabled adapter must still declare disabled-by-default design.');
assert(enabledNoRecords.adapterUseBoundary.canProvideContext === true, 'Enabled adapter may provide context.');
assert(enabledNoRecords.adapterUseBoundary.canModifyNativeReasoning === false, 'Enabled adapter must not modify native reasoning.');
assert(enabledNoRecords.adapterUseBoundary.canCreateCitations === false, 'Enabled adapter must not create citations.');
assert(enabledNoRecords.adapterUseBoundary.canDeclareViolations === false, 'Enabled adapter must not declare violations.');
assert(enabledNoRecords.adapterUseBoundary.canOverrideRegulations === false, 'Enabled adapter must not override regulations.');
assert(enabledNoRecords.adapterUseBoundary.canBypassHumanReview === false, 'Enabled adapter must not bypass human review.');
assert(enabledNoRecords.adapterUseBoundary.canUseUnapprovedRecords === false, 'Enabled adapter must not use unapproved records.');

assert(
  enabledNoRecords.recordsUsed.every(
    (record) => record.reviewStatus === 'approved_by_human' && record.approvedForUse === true,
  ),
  'Enabled adapter recordsUsed must contain only approved_by_human and approvedForUse records.',
);

console.log('✅ SafeScope approved knowledge integration contract validation passed.');
