import * as fs from 'fs';
import * as path from 'path';
import {
  ReviewCoreKnowledgeReviewQueueRouteScaffold,
  ReviewCoreQueueActor,
} from '../src/safescope-v2/knowledge-architecture';
import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecordStatus,
} from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEnvelope(value: any, label: string) {
  assert(value?.guardrails?.advisoryOnly === true, `${label}: missing advisory guardrail`);
  assert(value?.guardrails?.doesNotDeclareViolation === true, `${label}: missing violation guardrail`);
  assert(value?.guardrails?.doesNotCreateCitation === true, `${label}: missing citation guardrail`);
  assert(value?.guardrails?.requiresQualifiedReview === true, `${label}: missing review guardrail`);
  assert(value?.guardrails?.cannotOverrideRegulation === true, `${label}: missing override guardrail`);
  assert(value?.guardrails?.unapprovedRecordsAffectRetrieval === false, `${label}: missing retrieval guardrail`);
  assert(value?.governanceTrace?.advisoryOnly === true, `${label}: missing governanceTrace`);
  assert(value?.generatedAt, `${label}: missing generatedAt`);
}

const repoRoot = path.resolve(__dirname, '../..');
[
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.api-types.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.audit.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.guard.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.route-scaffold.ts',
  'backend/scripts/validate-reviewcore-knowledge-review-queue-routes-p14.ts',
  'project-docs/08-audits/reviewcore-knowledge-review-queue-routes-p14-summary.md',
].forEach((file) => assert(fs.existsSync(path.join(repoRoot, file)), `Missing P14 file: ${file}`));

const indexText = fs.readFileSync(path.join(repoRoot, 'backend/src/safescope-v2/knowledge-architecture/index.ts'), 'utf8');
[
  'reviewcore-knowledge-review-queue.api-types',
  'ReviewCoreKnowledgeReviewQueueAudit',
  'ReviewCoreKnowledgeReviewQueueGuard',
  'ReviewCoreKnowledgeReviewQueueRouteScaffold',
].forEach((token) => assert(indexText.includes(token), `Missing index export: ${token}`));

const owner: ReviewCoreQueueActor = { actorId: 'owner-1', role: 'owner', planTier: 'company' };
const admin: ReviewCoreQueueActor = { actorId: 'admin-1', role: 'admin', planTier: 'team' };
const complianceAdmin: ReviewCoreQueueActor = { actorId: 'comp-1', role: 'compliance_admin', planTier: 'company' };
const safetyManager: ReviewCoreQueueActor = { actorId: 'safety-1', role: 'safety_manager', planTier: 'company' };
const fieldInspector: ReviewCoreQueueActor = { actorId: 'field-1', role: 'field_inspector', planTier: 'team' };
const viewer: ReviewCoreQueueActor = { actorId: 'viewer-1', role: 'viewer', planTier: 'company' };
const individualAdmin: ReviewCoreQueueActor = { actorId: 'ind-1', role: 'admin', planTier: 'individual' };

function createValidRecord(scaffold: ReviewCoreKnowledgeReviewQueueRouteScaffold, id: string, actor = owner): string {
  const draft = scaffold.createDraft(
    {
      id,
      title: `Valid record ${id}`,
      content: 'Citation-supported queue record.',
      domain: 'machine_guarding',
      tags: ['machine_guarding'],
      authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
      primaryCitation: '30 CFR 56.14107(a)',
      fingerprint: `fingerprint-${id}`,
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
    },
    actor,
  );
  assertEnvelope(draft, `create draft ${id}`);
  const persistedId = (draft.data as any).result.id;
  assert(persistedId, `create draft ${id}: missing persisted id`);
  return persistedId;
}

let scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const ownerApproveId = createValidRecord(scaffold, 'owner-approve');
let ownerApproval = scaffold.approve(ownerApproveId, {}, owner);
assertEnvelope(ownerApproval, 'owner approve');
assert((ownerApproval.data as any).result.approved === true, 'owner should approve eligible record');
assert(ownerApproval.auditEvent?.allowed === true, 'owner approval audit should be allowed');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const adminApproveId = createValidRecord(scaffold, 'admin-approve', admin);
const adminApproval = scaffold.approve(adminApproveId, {}, admin);
assertEnvelope(adminApproval, 'admin approve');
assert((adminApproval.data as any).result.approved === true, 'admin should approve eligible record');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const complianceApproveId = createValidRecord(scaffold, 'compliance-approve', complianceAdmin);
const complianceApproval = scaffold.approve(complianceApproveId, {}, complianceAdmin);
assertEnvelope(complianceApproval, 'compliance approve');
assert((complianceApproval.data as any).result.approved === true, 'compliance_admin should approve eligible record');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const safetyManagerRecordId = createValidRecord(scaffold, 'safety-manager-record');
const safetyDenied = scaffold.approve(safetyManagerRecordId, {}, safetyManager);
assertEnvelope(safetyDenied, 'safety manager denied approve');
assert(safetyDenied.auditEvent?.denied === true, 'safety manager approval should be denied');
const safetyMoreInfo = scaffold.requestMoreInfo(safetyManagerRecordId, { reason: 'confirm scope' }, safetyManager);
assertEnvelope(safetyMoreInfo, 'safety manager request more info');
assert(safetyMoreInfo.auditEvent?.allowed === true, 'safety manager can request more info');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const fieldDraft = scaffold.createDraft({ id: 'field-draft', title: 'Field draft', content: 'Draft', domain: 'machine_guarding', tags: [] }, fieldInspector);
assertEnvelope(fieldDraft, 'field draft');
const fieldDenied = scaffold.approve('field-draft', {}, fieldInspector);
assertEnvelope(fieldDenied, 'field inspector denied approve');
assert(fieldDenied.auditEvent?.denied === true, 'field inspector approval should be denied');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const viewerDenied = scaffold.createDraft({ id: 'viewer-draft', title: 'Viewer draft' }, viewer);
assertEnvelope(viewerDenied, 'viewer denied mutate');
assert(viewerDenied.auditEvent?.denied === true, 'viewer mutate should be denied');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const individualRecordId = createValidRecord(scaffold, 'individual-record');
const individualDenied = scaffold.approve(individualRecordId, {}, individualAdmin);
assertEnvelope(individualDenied, 'individual plan denied approve');
assert(individualDenied.auditEvent?.denied === true, 'individual plan approval should be denied');
const individualSupersedeDenied = scaffold.supersede(individualRecordId, { replacementInput: { id: 'individual-replacement' } }, individualAdmin);
assertEnvelope(individualSupersedeDenied, 'individual plan denied supersede');
assert(individualSupersedeDenied.auditEvent?.denied === true, 'individual plan supersede should be denied');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const missingCitation = scaffold.createDraft(
  {
    id: 'missing-citation',
    title: 'Missing citation core record',
    content: 'Needs source.',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
    fingerprint: 'missing-citation-fingerprint',
    status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  },
  owner,
);
assertEnvelope(missingCitation, 'missing citation draft');
const blocked = scaffold.approve('missing-citation', {}, owner);
assertEnvelope(blocked, 'missing citation blocked');
assert((blocked.data as any).result.approved === false, 'missing citation approval must be blocked');
assert(blocked.governanceTrace.activeRetrievalEligible === false, 'blocked approval must stay inactive');
const activeAfterBlocked = scaffold.listActiveRetrievalRecords(owner);
assert(!activeAfterBlocked.data.records.some((record: any) => record.id === 'missing-citation'), 'blocked missing-citation record leaked into active retrieval');

scaffold = new ReviewCoreKnowledgeReviewQueueRouteScaffold();
const activeRecordId = createValidRecord(scaffold, 'active-record');
const approved = scaffold.approve(activeRecordId, {}, owner);
assertEnvelope(approved, 'approved active');
const active = scaffold.listActiveRetrievalRecords(owner);
assertEnvelope(active, 'active retrieval');
assert(active.data.records.some((record: any) => record.id === activeRecordId), 'approved record should appear in active retrieval');

const rejectedRecord = scaffold.reject(activeRecordId, { reason: 'replaced' }, owner);
assertEnvelope(rejectedRecord, 'reject');
assert(!scaffold.listActiveRetrievalRecords(owner).data.records.some((record: any) => record.id === activeRecordId), 'rejected record should leave active retrieval');

const moreInfoRecordId = createValidRecord(scaffold, 'more-info-record');
const moreInfo = scaffold.requestMoreInfo(moreInfoRecordId, { reason: 'confirm source' }, safetyManager);
assertEnvelope(moreInfo, 'more info');
assert(!scaffold.listActiveRetrievalRecords(owner).data.records.some((record: any) => record.id === moreInfoRecordId), 'more-info record leaked into active retrieval');

const supersedeRecordId = createValidRecord(scaffold, 'supersede-record');
scaffold.approve(supersedeRecordId, {}, owner);
const supersede = scaffold.supersede(supersedeRecordId, { replacementInput: { id: 'replacement-record', title: 'Replacement record', primaryCitation: '30 CFR 56.14107(a)' } }, owner);
assertEnvelope(supersede, 'supersede');
const activeAfterSupersede = scaffold.listActiveRetrievalRecords(owner).data.records;
assert(!activeAfterSupersede.some((record: any) => record.id === supersedeRecordId), 'superseded record leaked into active retrieval');
assert(!activeAfterSupersede.some((record: any) => record.id === 'replacement-record'), 'pending replacement leaked into active retrieval');

const snapshot = scaffold.exportQueueSnapshot(owner);
assertEnvelope(snapshot, 'snapshot');
assert(snapshot.data.generatedAt, 'snapshot missing generatedAt');
assert(snapshot.data.counts, 'snapshot missing counts');
assert(Array.isArray(snapshot.data.activeRetrievalRecordIds), 'snapshot missing active ids');

const readiness = scaffold.persistenceReadiness(owner);
assertEnvelope(readiness, 'persistence readiness');
assert(readiness.data.databaseMigrationReady === false, 'databaseMigrationReady must be false');
assert(readiness.data.durablePersistenceReady === false, 'durablePersistenceReady must be false');

const outputText = JSON.stringify({
  ownerApproval,
  safetyDenied,
  fieldDenied,
  viewerDenied,
  individualDenied,
  blocked,
  approved,
  rejectedRecord,
  moreInfo,
  supersede,
  snapshot,
  readiness,
}).toLowerCase();

[
  'citation issued',
  'violation issued',
  'guaranteed compliance',
  'no human review required',
  'non' + 'compliant',
  'com' + 'pliant',
].forEach((phrase) => assert(!outputText.includes(phrase), `Prohibited final-decision phrase found: ${phrase}`));

console.log('P14 Review Queue Route Scaffold Validation Successful!');
