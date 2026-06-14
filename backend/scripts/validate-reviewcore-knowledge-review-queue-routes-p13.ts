import * as fs from 'fs';
import * as path from 'path';
import {
  ReviewCoreKnowledgeReviewQueueController,
  ReviewCoreKnowledgeReviewQueueService,
  ReviewCoreKnowledgeReviewQueueStore,
} from '../src/safescope-v2/knowledge-architecture';
import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecordStatus,
} from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertGuardrails(value: any, label: string) {
  const guardrails = value?.guardrails ?? value?.data?.guardrails;
  assert(guardrails?.advisoryOnly === true, `${label}: advisoryOnly missing`);
  assert(guardrails?.doesNotDeclareViolation === true, `${label}: doesNotDeclareViolation missing`);
  assert(guardrails?.doesNotCreateCitation === true, `${label}: doesNotCreateCitation missing`);
  assert(guardrails?.requiresQualifiedReview === true, `${label}: requiresQualifiedReview missing`);
  assert(guardrails?.cannotOverrideRegulation === true, `${label}: cannotOverrideRegulation missing`);
  assert(guardrails?.unapprovedRecordsAffectRetrieval === false, `${label}: retrieval guardrail missing`);
}

const repoRoot = path.resolve(__dirname, '../..');
[
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.store.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.controller.ts',
  'backend/scripts/validate-reviewcore-knowledge-review-queue-routes-p13.ts',
  'project-docs/08-audits/reviewcore-knowledge-review-queue-routes-p13-summary.md',
].forEach((relativePath) => {
  assert(fs.existsSync(path.join(repoRoot, relativePath)), `Missing required P13 file: ${relativePath}`);
});

const indexText = fs.readFileSync(path.join(repoRoot, 'backend/src/safescope-v2/knowledge-architecture/index.ts'), 'utf8');
assert(indexText.includes('ReviewCoreKnowledgeReviewQueueStore'), 'index.ts must export ReviewCoreKnowledgeReviewQueueStore');
assert(indexText.includes('ReviewCoreKnowledgeReviewQueueController'), 'index.ts must export ReviewCoreKnowledgeReviewQueueController');

const store = new ReviewCoreKnowledgeReviewQueueStore();
const controller = new ReviewCoreKnowledgeReviewQueueController(store, new ReviewCoreKnowledgeReviewQueueService());

const draft = controller.createDraft(
  {
    id: 'draft-p13',
    title: 'Draft P13 record',
    content: 'Draft local queue record.',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.EXPERIMENTAL,
  },
  'reviewer',
);
assertGuardrails(draft, 'createDraft');
assert(draft.data.activeRetrievalEligible === false, 'createDraft must not be active retrieval eligible');
assert(store.getRecord((draft.data.result as any).id), 'createDraft must persist record');

const queue = controller.listQueue();
assertGuardrails(queue, 'listQueue');
assert(queue.data.result.lifecycleCounts.draft + queue.data.result.lifecycleCounts.needs_review >= 1, 'listQueue should include created draft/needs-review count');

const item = controller.getQueueItem((draft.data.result as any).id);
assertGuardrails(item, 'getQueueItem');
assert(item.data.result.record, 'getQueueItem must include record');
assert(Array.isArray(item.data.result.reviewChecklist), 'getQueueItem must include reviewChecklist');
assert(Array.isArray(item.data.result.duplicateCandidates), 'getQueueItem must include duplicateCandidates');
assert(typeof item.data.result.activeRetrievalEligible === 'boolean', 'getQueueItem must include activeRetrievalEligible');
assert(typeof item.data.result.approvalReadiness.ready === 'boolean', 'getQueueItem must include approvalReadiness');

const blockedCore = {
  id: 'blocked-core-p13',
  title: 'Blocked core record',
  content: 'Core record missing source reference.',
  domain: 'machine_guarding',
  tags: ['machine_guarding'],
  authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  fingerprint: 'blocked-core-p13',
  createdAt: new Date(),
  updatedAt: new Date(),
  guardrails: { prohibitedLanguage: false, confidentialData: false, isDuplicate: false },
} as any;
store.saveRecord(blockedCore);

const blockedApprove = controller.approve(blockedCore.id, 'reviewer');
assertGuardrails(blockedApprove, 'blocked approve');
assert(blockedApprove.data.activeRetrievalEligible === false, 'blocked approve must not be active');
assert((blockedApprove.data.result as any).approved === false, 'missing-citation core record must be blocked');
assert(store.getRecord(blockedCore.id)?.status !== ReviewCoreKnowledgeRecordStatus.GOVERNED, 'blocked approval must not persist approved/governed status');

const validCore = {
  ...blockedCore,
  id: 'valid-core-p13',
  title: 'Valid core record with source support',
  primaryCitation: '30 CFR 56.14107(a)',
  fingerprint: 'valid-core-p13',
} as any;
store.saveRecord(validCore);

const approved = controller.approve(validCore.id, 'reviewer');
assertGuardrails(approved, 'approve valid');
assert(approved.data.activeRetrievalEligible === true, 'valid approved record should be active eligible');
assert((approved.data.result as any).approved === true, 'valid record should approve');
assert(store.getRecord(validCore.id)?.status === ReviewCoreKnowledgeRecordStatus.GOVERNED, 'valid approval should persist governed status');

const active = controller.listActiveRetrievalRecords();
assertGuardrails(active, 'listActiveRetrievalRecords');
assert(active.data.records.some((record: any) => record.id === validCore.id), 'approved valid record must appear in active retrieval');
assert(!active.data.records.some((record: any) => record.id === blockedCore.id), 'blocked core record must not appear in active retrieval');

const rejected = controller.reject(validCore.id, 'reviewer', 'source replaced');
assertGuardrails(rejected, 'reject');
assert(rejected.data.activeRetrievalEligible === false, 'reject must be inactive');
assert(String(store.getRecord(validCore.id)?.status).toLowerCase() === 'rejected', 'reject must persist rejected status');

const moreInfoRecord = {
  ...validCore,
  id: 'more-info-p13',
  status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  fingerprint: 'more-info-p13',
} as any;
store.saveRecord(moreInfoRecord);
const moreInfo = controller.requestMoreInfo(moreInfoRecord.id, 'reviewer', 'confirm source scope');
assertGuardrails(moreInfo, 'requestMoreInfo');
assert(moreInfo.data.activeRetrievalEligible === false, 'requestMoreInfo must be inactive');
assert(store.getRecord(moreInfoRecord.id)?.status === ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION, 'requestMoreInfo must persist pending status');
assert((store.getRecord(moreInfoRecord.id) as any)?.reviewNote === 'confirm source scope', 'requestMoreInfo must persist note/history');

const supersedeBase = {
  ...validCore,
  id: 'supersede-base-p13',
  status: ReviewCoreKnowledgeRecordStatus.GOVERNED,
  fingerprint: 'supersede-base-p13',
} as any;
store.saveRecord(supersedeBase);
const superseded = controller.supersede(
  supersedeBase.id,
  {
    id: 'supersede-replacement-p13',
    title: 'Replacement pending record',
    primaryCitation: '30 CFR 56.14107(a)',
  },
  'reviewer',
);
assertGuardrails(superseded, 'supersede');
assert(String(store.getRecord(supersedeBase.id)?.status).toLowerCase() === 'superseded', 'supersede must persist old inactive status');
assert(store.getRecord('supersede-replacement-p13')?.status === ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION, 'replacement must remain pending');
const activeAfterSupersede = controller.listActiveRetrievalRecords().data.records;
assert(!activeAfterSupersede.some((record: any) => record.id === supersedeBase.id), 'old superseded record must not be active');
assert(!activeAfterSupersede.some((record: any) => record.id === 'supersede-replacement-p13'), 'pending replacement must not be active');

const snapshot = controller.exportQueueSnapshot();
assertGuardrails(snapshot, 'exportQueueSnapshot');
assert(snapshot.data.generatedAt, 'snapshot must include generatedAt');
assert(snapshot.data.counts, 'snapshot must include counts');
assert(Array.isArray(snapshot.data.records), 'snapshot must include records');
assert(Array.isArray(snapshot.data.activeRetrievalRecordIds), 'snapshot must include activeRetrievalRecordIds');
assert(snapshot.data.guardrails.advisoryOnly === true, 'snapshot data must include guardrails');

const finalActiveIds = controller.listActiveRetrievalRecords().data.records.map((record: any) => record.id);
[
  'draft-p13',
  'blocked-core-p13',
  'more-info-p13',
  'supersede-base-p13',
  'supersede-replacement-p13',
].forEach((id) => {
  assert(!finalActiveIds.includes(id), `unapproved/inactive record leaked into active retrieval: ${id}`);
});

const outputText = JSON.stringify({
  draft,
  queue,
  item,
  blockedApprove,
  approved,
  rejected,
  moreInfo,
  superseded,
  snapshot,
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

console.log('P13 Review Queue Routes Validation Successful!');
