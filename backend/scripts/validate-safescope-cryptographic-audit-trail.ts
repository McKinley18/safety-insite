import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';
import { CryptographicAuditService } from '../src/safescope-v2/persistence/cryptographic-audit.service';
import { SafeScopeAuditRecord } from '../src/safescope-v2/persistence/persistence.types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Cryptographic Immutable Audit Trail ---');

  const persistence = new SafeScopePersistenceService();
  const signer = new CryptographicAuditService();

  // Create clean workspace audit data
  const initialPayload = {
    candidateId: 'test-cand-001',
    domainIds: ['machine_guarding'],
    proposedKnowledgeText: 'Standard 1910.212 physical guarding rule.',
  };

  // Case 1: Save & Sign Verification
  console.log('  Testing Case 1: Saving a new record and verifying signature');
  const record = await persistence.save({
    type: 'reviewer_candidate',
    workspaceId: 'ws-crypt-test-01',
    status: 'pending_review',
    payload: initialPayload,
    metadata: { author: 'Security Officer Admin' }
  });

  assert(record.metadata.cryptographicSignature, 'Record must contain a cryptographic signature.');
  assert(record.metadata.signatureVerified, 'Signature should be verified on creation.');
  assert(!record.metadata.isTampered, 'Record should not be flagged as tampered.');

  // Validate via direct CryptographicAuditService
  const isDirectlyVerified = signer.verifyRecord(record);
  assert(isDirectlyVerified, 'Direct cryptographic verification must succeed.');

  // Case 2: Querying from Persistence
  console.log('  Testing Case 2: Querying record and checking automatic verification');
  const retrieved = await persistence.getById(record.id);
  assert(retrieved, 'Should retrieve record by ID.');
  assert(retrieved.metadata.cryptographicSignature === record.metadata.cryptographicSignature, 'Signature must match.');
  assert(retrieved.metadata.signatureVerified, 'Retrieved record signature must be verified.');
  assert(!retrieved.metadata.isTampered, 'Retrieved record must not be flagged as tampered.');

  // Case 3: State Transition Signing
  console.log('  Testing Case 3: Updating status and checking signature regeneration');
  const oldSignature = record.metadata.cryptographicSignature;
  
  const updated = await persistence.updateStatus(record.id, 'approved_for_promotion', {
    reviewerName: 'Lead Auditor',
    notes: 'Verified compliance.'
  });

  assert(updated, 'Record should be updated successfully.');
  assert(updated.status === 'approved_for_promotion', 'Status must be updated.');
  assert(updated.metadata.cryptographicSignature !== oldSignature, 'Signature must have regenerated due to status change.');
  assert(updated.metadata.signatureVerified, 'New signature must be verified.');

  // Case 4: Tamper Detection (Simulated attack)
  console.log('  Testing Case 4: Tamper detection simulation');
  
  // Create a deep copy of the retrieved record and maliciously alter it
  const tamperedRecord = JSON.parse(JSON.stringify(retrieved)) as SafeScopeAuditRecord;
  tamperedRecord.payload.proposedKnowledgeText = 'MALICIOUS MODIFICATION: bypass guards entirely'; // Alter payload

  const isTamperedVerified = signer.verifyRecord(tamperedRecord);
  assert(!isTamperedVerified, 'Tamper verification must detect modified payload and fail.');
  assert(!tamperedRecord.metadata.signatureVerified, 'Verification flag must be set to false.');
  assert(tamperedRecord.metadata.isTampered, 'Tamper indicator flag must be set to true.');

  // Malicious status manipulation
  const tamperedStatusRecord = JSON.parse(JSON.stringify(retrieved)) as SafeScopeAuditRecord;
  tamperedStatusRecord.status = 'approved_for_promotion'; // Maliciously changing status without signing key

  const isStatusTamperedVerified = signer.verifyRecord(tamperedStatusRecord);
  assert(!isStatusTamperedVerified, 'Tamper verification must detect modified status and fail.');
  assert(tamperedStatusRecord.metadata.isTampered, 'Status tampering indicator flag must be set to true.');

  console.log('✅ SafeScope Cryptographic Audit Trail validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
