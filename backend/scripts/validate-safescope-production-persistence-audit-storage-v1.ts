import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';

async function validate() {
  const service = new SafeScopePersistenceService();
  
  console.log('--- Testing Persistence: Reviewer Candidate ---');
  const candidate = await service.save({
      type: 'reviewer_candidate',
      status: 'pending_review',
      payload: { 
          candidateId: 'test-123',
          summary: 'Test candidate',
          candidateType: 'draft_candidate',
          domainIds: ['electrical'],
          priority: 'high',
          status: 'pending_review',
          auditTrail: []
      },
      metadata: { priority: 'high' }
  });
  if (!candidate.id.startsWith('audit-')) throw new Error('Invalid record ID');
  console.log('[PASS] Reviewer candidate saved.');

  console.log('--- Testing Persistence: Retrieval ---');
  const found = await service.find({ type: 'reviewer_candidate', status: 'pending_review' });
  const testCandidate = found.find(r => r.payload.summary === 'Test candidate');
  if (!testCandidate) throw new Error('Failed to retrieve saved candidate');
  console.log('[PASS] Records retrieved correctly.');

  console.log('--- Testing Persistence: Status Update ---');
  const updated = await service.updateStatus(candidate.id, 'approved', { approvedBy: 'Test Actor' });
  if (updated?.status !== 'approved') throw new Error('Status update failed');
  if (updated?.metadata.approvedBy !== 'Test Actor') throw new Error('Metadata update failed');
  console.log('[PASS] Status and metadata updated.');

  console.log('--- Testing Persistence: Snapshots ---');
  await service.save({
      type: 'reasoning_trace_snapshot',
      status: 'active',
      payload: { traceId: 'trace-123' },
      metadata: { observationId: 'obs-456' },
      traceId: 'trace-123',
      observationId: 'obs-456'
  });
  
  const trace = await service.find({ traceId: 'trace-123' });
  if (trace.length === 0) throw new Error('Trace snapshot not found');
  console.log('[PASS] Snapshots persisted and linkable.');

  console.log('✅ SafeScope production persistence and audit storage validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
