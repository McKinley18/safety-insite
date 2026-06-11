import { OfflineTraceConflictResolverService } from '../src/safescope-v2/offline-sync-conflict-resolver/offline-sync-conflict-resolver.service';
import * as assert from 'assert';

async function validate() {
  console.log('--- Testing SafeScope Offline Sync Conflict Resolution Service (P0) ---');
  const service = new OfflineTraceConflictResolverService();

  // Test Case 1: Clean non-concurrent merge (older server, newer client - 1 hour diff)
  const case1 = service.resolveConflict(
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'machine_guarding',
      validationStatus: 'approved',
      deviceTimestamp: '2026-06-09T10:00:00Z',
      userId: 'user-server',
      intelligenceMetadata: { isGuarded: true },
    },
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'machine_guarding',
      validationStatus: 'mitigated',
      deviceTimestamp: '2026-06-09T11:00:00Z',
      userId: 'user-client',
      intelligenceMetadata: { isGuarded: true, repairedBy: 'Chris' },
    }
  );
  assert.strictEqual(case1.hasConflict, false);
  assert.strictEqual(case1.mergedSnapshot.validationStatus, 'mitigated');
  assert.strictEqual(case1.mergedSnapshot.intelligenceMetadata.repairedBy, 'Chris');
  console.log('[PASS] Clean non-concurrent merge verified.');

  // Test Case 2: Concurrent classification conflict (within 5 seconds)
  const case2 = service.resolveConflict(
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'machine_guarding',
      validationStatus: 'approved',
      deviceTimestamp: '2026-06-09T10:00:00Z',
      userId: 'user-server',
      intelligenceMetadata: { isGuarded: true },
    },
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'fall_protection',
      validationStatus: 'approved',
      deviceTimestamp: '2026-06-09T10:00:05Z',
      userId: 'user-client',
      intelligenceMetadata: { isGuarded: true },
    }
  );
  assert.strictEqual(case2.hasConflict, true);
  assert.strictEqual(case2.mergedSnapshot.validationStatus, 'conflict_hold');
  assert.strictEqual(case2.mergedSnapshot.classification, 'unclear');
  assert(case2.conflictDetails[0].includes('Concurrent classification conflict'));
  console.log('[PASS] Concurrent classification conflict verified.');

  // Test Case 3: Concurrent metadata field conflict (within 10 seconds)
  const case3 = service.resolveConflict(
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'machine_guarding',
      validationStatus: 'approved',
      deviceTimestamp: '2026-06-09T10:00:00Z',
      userId: 'user-server',
      intelligenceMetadata: { repairCode: 'A12' },
    },
    {
      reportId: 'rep-001',
      workspaceId: 'work-001',
      classification: 'machine_guarding',
      validationStatus: 'approved',
      deviceTimestamp: '2026-06-09T10:00:10Z',
      userId: 'user-client',
      intelligenceMetadata: { repairCode: 'B45' },
    }
  );
  assert.strictEqual(case3.hasConflict, true);
  assert.strictEqual(case3.mergedSnapshot.validationStatus, 'conflict_hold');
  assert.strictEqual(case3.mergedSnapshot.intelligenceMetadata.repairCode, 'B45'); // client wins because its timestamp is slightly newer (10s > 0s)
  assert(case3.conflictDetails[0].includes('Concurrent field-level conflict on "repairCode"'));
  console.log('[PASS] Concurrent metadata field conflict verified.');

  console.log('✅ SafeScope offline sync conflict resolution validation passed.');
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
