import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository,
  ReviewCoreKnowledgeReviewQueueAuditEntity,
  ReviewCoreKnowledgeReviewQueuePersistenceAdapter,
  ReviewCoreKnowledgeReviewQueueProvider,
  ReviewCoreKnowledgeReviewQueueRecordEntity,
  ReviewCoreQueueActor,
} from '../src/safescope-v2/knowledge-architecture';
import {
  ReviewCoreKnowledgeAuthorityTier,
  ReviewCoreKnowledgeRecordStatus,
} from '../src/safescope-v2/knowledge-architecture/reviewcore-knowledge-record.types';

const repoRoot = path.resolve(__dirname, '../..');

function assertExists(relativePath: string): void {
  assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `Missing required P16 file: ${relativePath}`);
}

function assertNoProhibitedLanguage(value: unknown): void {
  const output = JSON.stringify(value).toLowerCase();
  [
    'citation issued',
    'violation issued',
    'guaranteed compliance',
    'no human review required',
    'non' + 'compliant',
    'com' + 'pliant',
  ].forEach((phrase) => assert.equal(output.includes(phrase), false, `Prohibited final-decision phrase present: ${phrase}`));
}

async function runValidation() {
  console.log('--- Starting P16 Persistence Validation ---');

  [
    'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.persistence-types.ts',
    'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.record.entity.ts',
    'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.audit.entity.ts',
    'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.repository.ts',
    'backend/src/safescope-v2/knowledge-architecture/reviewcore-knowledge-review-queue.persistence-adapter.ts',
    'backend/scripts/validate-reviewcore-knowledge-review-queue-persistence-p16.ts',
    'project-docs/08-audits/reviewcore-knowledge-review-queue-persistence-p16-summary.md',
  ].forEach(assertExists);

  const indexText = fs.readFileSync(path.join(repoRoot, 'backend/src/safescope-v2/knowledge-architecture/index.ts'), 'utf8');
  [
    'reviewcore-knowledge-review-queue.persistence-types',
    'reviewcore-knowledge-review-queue.record.entity',
    'reviewcore-knowledge-review-queue.audit.entity',
    'reviewcore-knowledge-review-queue.repository',
    'reviewcore-knowledge-review-queue.persistence-adapter',
  ].forEach((token) => assert.ok(indexText.includes(token), `Missing index export for ${token}`));

  assert.ok(ReviewCoreKnowledgeReviewQueueRecordEntity, 'Record entity should import');
  assert.ok(ReviewCoreKnowledgeReviewQueueAuditEntity, 'Audit entity should import');

  const repository = new InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository();
  const adapter = new ReviewCoreKnowledgeReviewQueuePersistenceAdapter(repository);
  repository.resetForValidation();

  const readiness = adapter.persistenceReadiness();
  assert.equal(readiness.persistenceLayerDefined, true);
  assert.equal(readiness.entitiesDefined, true);
  assert.equal(readiness.repositoryPortDefined, true);
  assert.equal(readiness.inMemoryValidationRepositoryDefined, true);
  assert.equal(readiness.externalDatabaseRequiredForValidation, false);
  assert.equal(readiness.databaseMigrationReady, false);
  assert.equal(readiness.durablePersistenceReady, false);

  await repository.saveRecord({
    id: 'row-1',
    title: 'Manual persisted row',
    content: 'Manual row content',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: 'CORE',
    status: 'APPROVED',
    primaryCitation: '30 CFR 56.14107(a)',
    fingerprint: 'p16-row-1',
    guardrails: { prohibitedLanguage: false, confidentialData: false, isDuplicate: false },
    createdBy: 'validator',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    activeRetrievalEligible: true,
    activeRetrievalChangedAt: '2026-01-01T00:00:00.000Z',
    originalPayload: '{}',
  });

  assert.equal((await repository.getRecord('row-1'))?.id, 'row-1');
  assert.equal((await repository.listRecords()).length, 1);
  await repository.updateRecord('row-1', { title: 'Updated row' });
  assert.equal((await repository.getRecord('row-1'))?.title, 'Updated row');

  await repository.saveAuditEvent({
    eventId: 'audit-1',
    action: 'approve',
    actorId: 'admin',
    actorRole: 'admin',
    planTier: 'company',
    recordId: 'row-1',
    timestamp: '2026-01-01T00:00:00.000Z',
    allowed: true,
    denied: false,
    blockers: [],
    activeRetrievalEligible: true,
    guardrailSnapshot: {
      advisoryOnly: true,
      doesNotDeclareViolation: true,
      doesNotCreateCitation: true,
      requiresQualifiedReview: true,
      cannotOverrideRegulation: true,
      unapprovedRecordsAffectRetrieval: false,
    },
    originalPayload: '{}',
  });

  assert.equal((await repository.listAuditEventsForRecord('row-1')).length, 1);
  assert.equal((await repository.listActiveRetrievalRecords()).length, 1);
  await repository.archiveRecord('row-1');
  assert.equal((await repository.listActiveRetrievalRecords()).length, 0, 'archived records must not remain active');

  const admin: ReviewCoreQueueActor = { actorId: 'p16-admin', role: 'admin', planTier: 'company' };
  const providerRepository = new InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository();
  const providerAdapter = new ReviewCoreKnowledgeReviewQueuePersistenceAdapter(providerRepository);
  const provider = new ReviewCoreKnowledgeReviewQueueProvider(providerAdapter as any);
  provider.resetForValidation();

  const draft = provider.createDraft({
    title: 'P16 adapter approved record',
    content: 'Source-backed record for persistence adapter validation.',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
    primaryCitation: '30 CFR 56.14107(a)',
    fingerprint: 'p16-adapter-approved',
    status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  }, admin) as any;

  const approved = provider.approve(draft.data.result.id, {}, admin) as any;
  assert.equal(approved.data.result.approved, true, 'provider with adapter should approve eligible record');
  await providerAdapter.persistEnvelope(approved);

  const activeRows = await providerAdapter.listActiveRetrievalRecords();
  assert.equal(activeRows.length, 1, 'approved provider envelope should persist active row');
  assert.equal(activeRows[0].id, draft.data.result.id);
  assert.ok(activeRows[0].governanceTrace, 'governance trace should persist');

  const blockedDraft = provider.createDraft({
    title: 'P16 blocked record missing citation',
    content: 'Missing source should block active retrieval.',
    domain: 'machine_guarding',
    tags: ['machine_guarding'],
    authorityTier: ReviewCoreKnowledgeAuthorityTier.CORE,
    fingerprint: 'p16-blocked-missing-source',
    status: ReviewCoreKnowledgeRecordStatus.PENDING_VALIDATION,
  }, admin) as any;
  const blocked = provider.approve(blockedDraft.data.result.id, {}, admin) as any;
  assert.equal(blocked.data.result.approved, false, 'blocked approval should remain denied');
  await providerAdapter.persistEnvelope(blocked);

  const deniedEvents = await providerRepository.listAuditEvents({ denied: true });
  assert.ok(deniedEvents.length >= 1, 'denied audit event should persist');
  assert.equal((await providerAdapter.listActiveRetrievalRecords()).some((record) => record.id === blockedDraft.data.result.id), false, 'blocked record must not become active');

  const noArgProvider = new ReviewCoreKnowledgeReviewQueueProvider();
  noArgProvider.resetForValidation();
  const noArgQueue = noArgProvider.listQueue(admin) as any;
  assert.ok(noArgQueue.guardrails, 'P15 no-arg provider must still work');

  const snapshot = await providerAdapter.exportPersistenceSnapshot();
  const rehydratedRepository = new InMemoryReviewCoreKnowledgeReviewQueuePersistenceRepository(snapshot);
  const rehydratedAdapter = new ReviewCoreKnowledgeReviewQueuePersistenceAdapter(rehydratedRepository);
  const rehydratedSnapshot = await rehydratedAdapter.exportPersistenceSnapshot();

  assert.deepEqual(rehydratedSnapshot.activeRetrievalRecordIds, snapshot.activeRetrievalRecordIds, 'rehydrated active retrieval IDs must match');
  assert.equal((await rehydratedAdapter.listActiveRetrievalRecords()).length, 1, 'rehydrated active rows must match original active rows');
  assertNoProhibitedLanguage({ snapshot, rehydratedSnapshot, readiness, approved, blocked });

  console.log('P16 ReviewCore Persistence Validation Successful!');
}

runValidation().catch((error) => {
  console.error('P16 ReviewCore Persistence Validation Failed');
  console.error(error);
  process.exit(1);
});
