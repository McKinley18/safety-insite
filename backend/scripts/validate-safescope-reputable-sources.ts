import { StandardsReasoningService } from '../src/safescope-v2/standards-reasoning/standards-reasoning.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Reputable Sources Intelligence Core ---');

  const service = new StandardsReasoningService();

  // Test Case 1: Machine Guarding standard matching ANSI B11.19
  console.log('  Testing Case 1: Matching OSHA 1910.212 machine guarding to ANSI B11.19');
  const res1 = service.evaluate({
    classification: 'machine_guarding',
    standards: [
      {
        recordId: 'std-101',
        citation: '29 CFR 1910.212(a)(1)',
        source: 'cfr_database',
        title: 'Machine Guarding General Requirements'
      }
    ]
  });

  assert(res1.topDefensible.length === 1, 'Should return exactly 1 ranked standard.');
  const std1 = res1.topDefensible[0];
  assert(std1.reputableSupplement, 'Should contain a reputable advisory supplement.');
  assert(std1.reputableSupplement.standard === 'ANSI B11.19', `Should match ANSI B11.19, got ${std1.reputableSupplement.standard}`);
  assert(std1.reputableSupplement.agency.includes('ANSI'), 'Agency should be ANSI.');
  // Base score 0.5 + 0.15 (cfr_database) + 0.06 (reputable boost) = 0.71
  assert(std1.defensibilityScore === 0.71, `Score should be 0.71, got ${std1.defensibilityScore}`);
  assert(std1.reasoning.includes('Supported by high-authority consensus standard: ANSI (American National Standards Institute) - ANSI B11.19'), 'Reasoning text should include ANSI citation.');

  // Test Case 2: Fall Protection standard matching ANSI/ASSP Z359.1
  console.log('  Testing Case 2: Matching OSHA 1910.28 fall protection to ANSI/ASSP Z359.1');
  const res2 = service.evaluate({
    classification: 'fall_protection',
    standards: [
      {
        recordId: 'std-202',
        citation: '29 CFR 1910.28(b)(1)(i)',
        source: 'cfr_database',
        title: 'Duty to have fall protection'
      }
    ]
  });

  assert(res2.topDefensible.length === 1, 'Should return exactly 1 standard.');
  const std2 = res2.topDefensible[0];
  assert(std2.reputableSupplement?.standard === 'ANSI/ASSP Z359.1 Fall Protection Code', 'Should match ANSI/ASSP Z359.1.');
  assert(std2.reputableSupplement.guidanceText.includes('5,000 lbs'), 'Guidance text should detail anchorage strength.');

  // Test Case 3: Chemical HazCom matching NIOSH Pocket Guide
  console.log('  Testing Case 3: Matching OSHA 1910.1200 HazCom to NIOSH Pocket Guide');
  const res3 = service.evaluate({
    classification: 'hazcom',
    standards: [
      {
        recordId: 'std-303',
        citation: '29 CFR 1910.1200(f)(6)',
        source: 'curated',
        title: 'Hazard Communication Container Labeling'
      }
    ]
  });

  assert(res3.topDefensible.length === 1, 'Should return exactly 1 standard.');
  const std3 = res3.topDefensible[0];
  assert(std3.reputableSupplement?.standard === 'NIOSH Pocket Guide to Chemical Hazards', 'Should match NIOSH Pocket Guide.');
  assert(std3.reputableSupplement.guidanceText.includes('threshold limit values'), 'Guidance should include TLVs.');

  // Test Case 4: No Direct Citation Match (Fallback to Domain Match)
  console.log('  Testing Case 4: Fallback to domain match when citation is generic');
  const res4 = service.evaluate({
    classification: 'electrical',
    standards: [
      {
        recordId: 'std-404',
        citation: 'General Electrical Safety Rule',
        source: 'cfr_database',
        title: 'Safety Precautions'
      }
    ]
  });

  assert(res4.topDefensible.length === 1, 'Should return exactly 1 standard.');
  const std4 = res4.topDefensible[0];
  assert(std4.reputableSupplement?.standard === 'NFPA 70E', `Should match domain fallback NFPA 70E, got ${std4.reputableSupplement?.standard}`);

  console.log('✅ SafeScope Reputable Sources Intelligence validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
