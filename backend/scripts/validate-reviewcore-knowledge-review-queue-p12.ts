import { ReviewCoreKnowledgeReviewQueueService } from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.service';
import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecordStatus,
} from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertGuardrails(value: any, label: string) {
  assert(value?.guardrails?.advisoryOnly === true, `${label}: advisoryOnly guardrail missing`);
  assert(value?.guardrails?.doesNotDeclareViolation === true, `${label}: declaration guardrail missing`);
  assert(value?.guardrails?.doesNotCreateCitation === true, `${label}: citation-creation guardrail missing`);
  assert(value?.guardrails?.requiresQualifiedReview === true, `${label}: qualified review guardrail missing`);
  assert(value?.guardrails?.cannotOverrideRegulation === true, `${label}: override guardrail missing`);
  assert(value?.guardrails?.unapprovedRecordsAffectRetrieval === false, `${label}: retrieval guardrail missing`);
}

const service = new ReviewCoreKnowledgeReviewQueueService();

const baseRecord = {
  id: 'draft-1',
  title: 'Conveyor nip point guard draft',
  content: 'Draft knowledge record for guarded review queue validation.',
  domain: 'machine_guarding',
  tags: ['machine_guarding'],
  authorityTier: ReviewCoreKnowledgeAuthorityTier.EXPERIMENTAL,
  status: ReviewCoreKnowledgeRecordStatus.DRAFT,
  fingerprint: 'fingerprint-draft-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  guardrails: { prohibitedLanguage: false, confidentialData: false, isDuplicate: false },
} as any;

const needsReviewRecord = {
  ...baseRecord,
  id: 'needs-review-1',
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  fingerprint: 'fingerprint-needs-review-1',
} as any;

const validRecord = {
  ...baseRecord,
  id: 'approved-eligible-1',
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
  primaryCitation: '30 CFR 56.14107(a)',
  fingerprint: 'fingerprint-approved-eligible-1',
} as any;

const missingCitationPrimaryRecord = {
  ...baseRecord,
  id: 'blocked-primary-1',
  authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  fingerprint: 'fingerprint-blocked-primary-1',
} as any;

const missingCitationGuidanceRecord = {
  ...baseRecord,
  id: 'blocked-guidance-1',
  authorityTier: ReviewCoreKnowledgeAuthorityTier.ENHANCED,
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  fingerprint: 'fingerprint-blocked-guidance-1',
} as any;

const approvedRecord = {
  ...validRecord,
  id: 'already-approved-1',
  status: ReviewCoreKnowledgeRecordStatus.GOVERNED,
  fingerprint: 'fingerprint-already-approved-1',
} as any;

const rejectedRecord = {
  ...baseRecord,
  id: 'rejected-1',
  status: 'rejected',
  fingerprint: 'fingerprint-rejected-1',
} as any;

const supersededRecord = {
  ...baseRecord,
  id: 'superseded-1',
  status: 'superseded',
  fingerprint: 'fingerprint-superseded-1',
} as any;

const records = [
  baseRecord,
  needsReviewRecord,
  approvedRecord,
  rejectedRecord,
  supersededRecord,
];

const queue = service.listQueue(records);
assertGuardrails(queue, 'listQueue');
assert(queue.result.lifecycleCounts.draft === 1, 'listQueue should count drafts');
assert(queue.result.lifecycleCounts.needs_review === 1, 'listQueue should count needs_review');
assert(queue.result.lifecycleCounts.approved === 1, 'listQueue should count approved');
assert(queue.result.lifecycleCounts.rejected === 1, 'listQueue should count rejected');
assert(queue.result.lifecycleCounts.superseded === 1, 'listQueue should count superseded');
assert(queue.result.activeRetrievalRecordIds.includes('already-approved-1'), 'approved record should be active retrieval eligible');

const createdDraft = service.createDraft({
  title: 'Created draft',
  content: 'Created through local P12 contract.',
  domain: 'machine_guarding',
  authorityTier: ReviewCoreKnowledgeAuthorityTier.EXPERIMENTAL,
});
assertGuardrails(createdDraft, 'createDraft');
assert(createdDraft.activeRetrievalEligible === false, 'created draft must not be retrieval eligible');
assert(createdDraft.result.status !== ReviewCoreKnowledgeRecordStatus.GOVERNED, 'created draft must not auto-approve');

const activeAfterDraft = service.listActiveRetrievalRecords([createdDraft.result as any]);
assert(activeAfterDraft.length === 0, 'created draft must not appear in active retrieval records');

const blockedPrimary = service.approve(missingCitationPrimaryRecord, 'reviewer');
assertGuardrails(blockedPrimary, 'approve blocked primary');
assert(blockedPrimary.activeRetrievalEligible === false, 'primary record without citation must not be active');
assert(blockedPrimary.result.approved === false, 'primary record without citation must not approve');
assert(blockedPrimary.approvalReadiness?.blockers.includes('citation_or_source_reference_required'), 'primary record should have citation blocker');

const blockedGuidance = service.approve(missingCitationGuidanceRecord, 'reviewer');
assertGuardrails(blockedGuidance, 'approve blocked guidance');
assert(blockedGuidance.activeRetrievalEligible === false, 'official guidance without citation must not be active');
assert(blockedGuidance.result.approved === false, 'official guidance without citation must not approve');

const approved = service.approve(validRecord, 'reviewer');
assertGuardrails(approved, 'approve valid');
assert(approved.activeRetrievalEligible === true, 'valid approved record should become active');
assert(approved.result.approved === true, 'valid record should approve');

const active = service.listActiveRetrievalRecords([baseRecord, needsReviewRecord, rejectedRecord, supersededRecord, approved.result.record]);
assert(active.length === 1, 'only approved record should be active retrieval eligible');
assert(active[0].id === 'approved-eligible-1', 'active retrieval should contain the approved record');

const rejected = service.reject(validRecord, 'reviewer', 'insufficient source support');
assertGuardrails(rejected, 'reject');
assert(rejected.activeRetrievalEligible === false, 'rejected record must not be active');
assert(service.listActiveRetrievalRecords([rejected.result.record as any]).length === 0, 'rejected record must be excluded from active retrieval');

const needsMoreInfo = service.requestMoreInfo(validRecord, 'reviewer', 'confirm source scope');
assertGuardrails(needsMoreInfo, 'requestMoreInfo');
assert(needsMoreInfo.activeRetrievalEligible === false, 'needs-more-info record must not be active');
assert(service.listActiveRetrievalRecords([needsMoreInfo.result.record as any]).length === 0, 'needs-more-info record must be excluded from active retrieval');
assert(needsMoreInfo.result.record.reviewNote === 'confirm source scope', 'requestMoreInfo should preserve review note');

const replacement = {
  ...validRecord,
  id: 'replacement-1',
  fingerprint: 'fingerprint-replacement-1',
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
} as any;
const superseded = service.supersede(approvedRecord, replacement, 'reviewer');
assertGuardrails(superseded, 'supersede');
assert(superseded.activeRetrievalEligible === false, 'supersede action itself must not be active');
assert(service.listActiveRetrievalRecords([superseded.result.oldRecord as any, superseded.result.replacementRecord as any]).length === 0, 'superseded old and pending replacement must be excluded from active retrieval');

const item = service.getQueueItem(validRecord.id, [validRecord, missingCitationPrimaryRecord]);
assertGuardrails(item, 'getQueueItem');
assert(item.result.record, 'getQueueItem should return record');
assert(item.result.record.id === validRecord.id, 'getQueueItem should return requested record');
assert(Array.isArray(item.result.reviewChecklist), 'getQueueItem should include reviewChecklist');
assert(Array.isArray(item.result.duplicateCandidates), 'getQueueItem should include duplicateCandidates');
assert(typeof item.result.activeRetrievalEligible === 'boolean', 'getQueueItem should include activeRetrievalEligible');
assert(typeof item.result.approvalReadiness.ready === 'boolean', 'getQueueItem should include approvalReadiness');

const outputText = JSON.stringify({
  queue,
  createdDraft,
  blockedPrimary,
  blockedGuidance,
  approved,
  rejected,
  needsMoreInfo,
  superseded,
  item,
}).toLowerCase();

[
  'citation issued',
  'violation issued',
  'guaranteed compliance',
  'no human review required',
  'non' + 'compliant',
  'com' + 'pliant',
].forEach((phrase) => {
  assert(!outputText.includes(phrase), `Prohibited final-decision phrase found: ${phrase}`);
});

console.log('P12 Review Queue API Validation Successful!');
