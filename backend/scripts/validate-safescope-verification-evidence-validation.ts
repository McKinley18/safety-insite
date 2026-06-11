import { VerificationEvidenceValidationService } from '../src/safescope-v2/verification-evidence/verification-evidence.service';
import * as assert from 'assert';

async function validate() {
  console.log('--- Testing SafeScope Verification Evidence Validation Service (P0) ---');
  const service = new VerificationEvidenceValidationService();

  // Test Case 1: Minimal length check
  const case1 = service.validateVerificationEvidence({
    initialObservation: 'Unguarded tail pulley spinning near walkway.',
    repairedObservation: 'ok',
    photosAvailable: true,
  });
  assert.strictEqual(case1.grade, 'insufficient');
  assert.strictEqual(case1.isVerificationValid, false);
  assert(case1.reasons[0].includes('too brief'));
  console.log('[PASS] Minimal length check verified.');

  // Test Case 2: Explicit contradiction check
  const case2 = service.validateVerificationEvidence({
    initialObservation: 'Unguarded tail pulley spinning near walkway.',
    repairedObservation: 'we tried to fix it but it remains unguarded and still live.',
    photosAvailable: true,
  });
  assert.strictEqual(case2.grade, 'contradictory');
  assert.strictEqual(case2.isVerificationValid, false);
  assert(case2.reasons[0].includes('remains uncorrected'));
  console.log('[PASS] Explicit contradiction check verified.');

  // Test Case 3: Missing guard verification
  const case3 = service.validateVerificationEvidence({
    initialObservation: 'Unguarded conveyor tail pulley has pinch point.',
    repairedObservation: 'we cleaned up the area around the tail pulley and cleared the rocks.',
    photosAvailable: true,
  });
  assert.strictEqual(case3.grade, 'insufficient');
  assert.strictEqual(case3.isVerificationValid, false);
  assert(case3.reasons[0].includes('does not confirm a guard was installed'));
  console.log('[PASS] Missing guard verification check verified.');

  // Test Case 4: Correct guard verification
  const case4 = service.validateVerificationEvidence({
    initialObservation: 'Unguarded conveyor tail pulley has pinch point.',
    repairedObservation: 'we installed a new metal guard bolted in place to cover the pinch point.',
    photosAvailable: true,
  });
  assert.strictEqual(case4.grade, 'valid');
  assert.strictEqual(case4.isVerificationValid, true);
  console.log('[PASS] Correct guard verification check verified.');

  // Test Case 5: Missing photo warning
  const case5 = service.validateVerificationEvidence({
    initialObservation: 'Unguarded conveyor tail pulley has pinch point.',
    repairedObservation: 'we installed a new metal guard bolted in place to cover the pinch point.',
    photosAvailable: false,
  });
  assert.strictEqual(case5.grade, 'valid');
  assert.strictEqual(case5.isVerificationValid, true);
  assert(case5.warnings[0].includes('without supporting photo evidence'));
  console.log('[PASS] Missing photo warning check verified.');

  console.log('✅ SafeScope verification evidence validation passed.');
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
