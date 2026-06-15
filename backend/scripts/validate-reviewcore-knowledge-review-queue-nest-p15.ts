import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  ReviewCoreKnowledgeReviewQueueHttpController,
  ReviewCoreKnowledgeReviewQueueModule,
  ReviewCoreKnowledgeReviewQueueModuleDefinition,
  ReviewCoreKnowledgeReviewQueueProvider,
  ReviewCoreQueueActor,
} from '../src/safescope-v2/knowledge-architecture';
import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecordStatus,
} from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

function assertEnvelope(value: any, label: string) {
  assert.equal(value?.guardrails?.advisoryOnly, true, `${label}: advisoryOnly missing`);
  assert.equal(value?.guardrails?.doesNotDeclareViolation, true, `${label}: violation guardrail missing`);
  assert.equal(value?.guardrails?.doesNotCreateCitation, true, `${label}: citation guardrail missing`);
  assert.equal(value?.guardrails?.requiresQualifiedReview, true, `${label}: review guardrail missing`);
  assert.equal(value?.guardrails?.cannotOverrideRegulation, true, `${label}: override guardrail missing`);
  assert.equal(value?.guardrails?.unapprovedRecordsAffectRetrieval, false, `${label}: retrieval guardrail missing`);
  assert.equal(value?.governanceTrace?.advisoryOnly, true, `${label}: governanceTrace missing`);
  assert.ok(value?.generatedAt, `${label}: generatedAt missing`);
}

const repoRoot = path.resolve(__dirname, '../..');
[
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.provider.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.http-controller.ts',
  'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.module.ts',
  'backend/scripts/validate-reviewcore-knowledge-review-queue-nest-p15.ts',
  'project-docs/08-audits/reviewcore-knowledge-review-queue-nest-p15-summary.md',
].forEach((file) => assert.ok(fs.existsSync(path.join(repoRoot, file)), `Missing P15 file: ${file}`));

const indexText = fs.readFileSync(path.join(repoRoot, 'backend/src/safescope-v2/knowledge-architecture/index.ts'), 'utf8');
[
  'ReviewCoreKnowledgeReviewQueueProvider',
  'ReviewCoreKnowledgeReviewQueueHttpController',
  'ReviewCoreKnowledgeReviewQueueModule',
].forEach((token) => assert.ok(indexText.includes(token), `Missing index export: ${token}`));

const owner: ReviewCoreQueueActor = { actorId: 'owner-p15', role: 'owner', planTier: 'company' };
const admin: ReviewCoreQueueActor = { actorId: 'admin-p15', role: 'admin', planTier: 'company' };
const safetyManager: ReviewCoreQueueActor = { actorId: 'safety-p15', role: 'safety_manager', planTier: 'company' };
const fieldInspector: ReviewCoreQueueActor = { actorId: 'field-p15', role: 'field_inspector', planTier: 'team' };
const viewer: ReviewCoreQueueActor = { actorId: 'viewer-p15', role: 'viewer', planTier: 'company' };
const individualAdmin: ReviewCoreQueueActor = { actorId: 'individual-p15', role: 'admin', planTier: 'individual' };

function createValidDraft(provider: ReviewCoreKnowledgeReviewQueueProvider, seed: string, actor: ReviewCoreQueueActor = admin): string {
  const draft = provider.createDraft(
    {
      title: `P15 valid source-backed record ${seed}`,
      content: 'Source-backed queue record for P15 validation.',
      domain: 'machine_guarding',
      tags: ['machine_guarding'],
      authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
      primaryCitation: '30 CFR 56.14107(a)',
      fingerprint: `p15-${seed}`,
      status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
    },
    actor,
  ) as any;

  assertEnvelope(draft, `create valid draft ${seed}`);
  const id = draft.data.result.id;
  assert.ok(id, `create valid draft ${seed}: missing persisted id`);
  return id;
}

const provider = new ReviewCoreKnowledgeReviewQueueProvider();
provider.resetForValidation();

const resolvedDefault = provider.resolveActorFromRequest();
assert.equal(resolvedDefault.actorId, 'local-reviewer', 'default actor should use actorId');
assert.equal(resolvedDefault.role, 'admin', 'default actor should be admin');
assert.equal(resolvedDefault.planTier, 'company', 'default actor should be company tier');

const validId = createValidDraft(provider, 'provider-approve', admin);
const approveRes = provider.approve(validId, {}, admin) as any;
assertEnvelope(approveRes, 'provider approve');
assert.equal(approveRes.data.result.approved, true, 'provider should approve eligible source-backed record');
assert.equal(approveRes.auditEvent.allowed, true, 'provider approve audit should be allowed');
assert.ok((provider.listActiveRetrievalRecords(admin) as any).data.records.some((record: any) => record.id === validId), 'approved record should enter active retrieval');

const missingDraft = provider.createDraft(
  {
    title: 'P15 missing source record',
    content: 'Core record missing source reference.',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
    fingerprint: 'p15-missing-source',
    status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  },
  admin,
) as any;
const missingId = missingDraft.data.result.id;
const blocked = provider.approve(missingId, {}, admin) as any;
assertEnvelope(blocked, 'missing source blocked');
assert.equal(blocked.data.result.approved, false, 'missing source approval must be blocked');
assert.equal(blocked.auditEvent.denied, true, 'blocked approval audit should be denied');
assert.ok(!(provider.listActiveRetrievalRecords(admin) as any).data.records.some((record: any) => record.id === missingId), 'blocked record must not enter active retrieval');

const controllerProvider = new ReviewCoreKnowledgeReviewQueueProvider();
controllerProvider.resetForValidation();
const controller = new ReviewCoreKnowledgeReviewQueueHttpController(controllerProvider);

const controllerDraft = controller.createDraft({
  actor: admin,
  request: {
    title: 'P15 controller unique source-backed record',
    content: 'Unique source-backed controller record.',
    domain: 'controller_machine_guarding_p15',
    tags: ['controller_machine_guarding_p15'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
    primaryCitation: '30 CFR 56.14107(a)',
    fingerprint: 'p15-controller-valid-unique',
    status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  },
}) as any;
assertEnvelope(controllerDraft, 'controller createDraft');
const controllerRecordId = controllerDraft.data.result.id;

const controllerApprove = controller.approve(controllerRecordId, { actor: admin, request: {} }) as any;
assertEnvelope(controllerApprove, 'controller approve');
assert.equal(controllerApprove.data.result.approved, true, 'controller should approve eligible record');

const defaultQueue = controller.listQueue({}) as any;
assertEnvelope(defaultQueue, 'controller default actor listQueue');

const viewerDenied = controller.createDraft({
  actor: viewer,
  request: { title: 'viewer denied draft' },
}) as any;
assertEnvelope(viewerDenied, 'viewer denied draft');
assert.equal(viewerDenied.auditEvent.denied, true, 'viewer draft should be denied');

const fieldDraft = controller.createDraft({
  actor: fieldInspector,
  request: { title: 'field draft', content: 'field draft', domain: 'machine_guarding', tags: [] },
}) as any;
assertEnvelope(fieldDraft, 'field draft');
const fieldDeniedApprove = controller.approve(fieldDraft.data.result.id, { actor: fieldInspector, request: {} }) as any;
assertEnvelope(fieldDeniedApprove, 'field denied approve');
assert.equal(fieldDeniedApprove.auditEvent.denied, true, 'field inspector approve should be denied');

const safetyId = createValidDraft(provider, 'safety-more-info', admin);
const safetyDeniedApprove = controller.approve(safetyId, { actor: safetyManager, request: {} }) as any;
assertEnvelope(safetyDeniedApprove, 'safety manager denied approve');
assert.equal(safetyDeniedApprove.auditEvent.denied, true, 'safety manager approve should be denied');
const safetyMoreInfo = controller.requestMoreInfo(safetyId, { actor: safetyManager, request: { reason: 'confirm source scope' } }) as any;
assertEnvelope(safetyMoreInfo, 'safety manager request more info');
assert.equal(safetyMoreInfo.auditEvent.allowed, true, 'safety manager should request more info');

const individualId = createValidDraft(provider, 'individual-denied', admin);
const individualDenied = controller.approve(individualId, { actor: individualAdmin, request: {} }) as any;
assertEnvelope(individualDenied, 'individual denied approve');
assert.equal(individualDenied.auditEvent.denied, true, 'individual admin approval should be denied');
const individualSupersedeDenied = controller.supersede(individualId, { actor: individualAdmin, request: { replacementInput: { title: 'replacement' } } }) as any;
assertEnvelope(individualSupersedeDenied, 'individual denied supersede');
assert.equal(individualSupersedeDenied.auditEvent.denied, true, 'individual admin supersede should be denied');

const snapshot = controller.exportQueueSnapshot({ actor: admin }) as any;
assertEnvelope(snapshot, 'controller snapshot');
assert.ok(snapshot.data.generatedAt, 'snapshot should include generatedAt');
assert.ok(snapshot.data.counts, 'snapshot should include counts');
assert.ok(Array.isArray(snapshot.data.activeRetrievalRecordIds), 'snapshot should include activeRetrievalRecordIds');

const readiness = controller.persistenceReadiness({ actor: admin }) as any;
assertEnvelope(readiness, 'controller persistence readiness');
assert.equal(readiness.data.databaseMigrationReady, false, 'databaseMigrationReady must remain false in P15');
assert.equal(readiness.data.durablePersistenceReady, false, 'durablePersistenceReady must remain false in P15');

assert.ok(ReviewCoreKnowledgeReviewQueueModule, 'module class should exist');
assert.ok(ReviewCoreKnowledgeReviewQueueModuleDefinition.controllers.includes(ReviewCoreKnowledgeReviewQueueHttpController), 'module definition should include controller');
assert.ok(ReviewCoreKnowledgeReviewQueueModuleDefinition.providers.includes(ReviewCoreKnowledgeReviewQueueProvider), 'module definition should include provider');
assert.ok(ReviewCoreKnowledgeReviewQueueModuleDefinition.exports.includes(ReviewCoreKnowledgeReviewQueueProvider), 'module definition should export provider');

const allOutput = JSON.stringify({
  approveRes,
  blocked,
  controllerDraft,
  controllerApprove,
  viewerDenied,
  fieldDeniedApprove,
  safetyDeniedApprove,
  safetyMoreInfo,
  individualDenied,
  individualSupersedeDenied,
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
].forEach((phrase) => assert.equal(allOutput.includes(phrase), false, `Prohibited phrase present: ${phrase}`));

console.log('P15 ReviewCore NestJS Queue Wiring Validation Successful!');
