import { MultidisciplinaryExpertService } from '../src/safescope-v2/multidisciplinary-expert/multidisciplinary-expert.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Multidisciplinary Expert Synthesis ---');

  const expert = new MultidisciplinaryExpertService();

  // Test Case 1: LOTO bypass (Safety/Health HOP + Labor Lawyer)
  console.log('  Testing Case 1: LOTO Bypass / Guard Removal');
  const res1 = expert.evaluate({
    classification: 'lockout_tagout',
    observationText: 'Operator removed the machine guard and bypassed the interlock to clear a jam without LOTO.',
    siteMemory: { recurringRiskDetected: false }
  });

  assert(res1.safetyAndHealth.hopFactors.length > 0, 'Should detect HOP production pressure factors.');
  assert(res1.laborLawyer.penaltyExposureRisk === 'high', 'LOTO bypass should trigger high penalty risk.');
  assert(res1.laborLawyer.precedentCaseLawRefs.some(ref => ref.includes('General Motors')), 'Should cite LOTO precedent case law.');

  // Test Case 2: Industrial Hygiene (Silica Dust)
  console.log('  Testing Case 2: Silica / Dust Exposure');
  const res2 = expert.evaluate({
    classification: 'health_hazard',
    observationText: 'Worker dry sweeping large amounts of concrete silica dust in the warehouse.',
    siteMemory: { recurringRiskDetected: false }
  });

  assert(res2.industrialHygiene.noiseDustSilicaRisks.length > 0, 'Should flag Silica dust risk.');
  assert(res2.industrialHygiene.pelStelTwaConcerns.some(c => c.includes('50 µg/m3')), 'Should mention the 50 ug/m3 PEL.');
  assert(res2.industrialHygiene.healthAdvisory.includes('wet-methods'), 'Should recommend OSHA Table 1 wet methods.');

  // Test Case 3: Environmental (SPCC / Oil Spill)
  console.log('  Testing Case 3: Environmental Oil Spill');
  const res3 = expert.evaluate({
    classification: 'environmental',
    observationText: 'Large diesel fuel leak from the bulk storage tank spreading toward the storm drain.',
    siteMemory: { recurringRiskDetected: false }
  });

  assert(res3.environmental.epaComplianceConcerns.length > 0, 'Should flag EPA compliance concerns.');
  assert(res3.environmental.spccRcraApplicability.includes('SPCC'), 'Should trigger SPCC review.');

  // Test Case 4: Recurring Willful Violation (Labor Lawyer Escalation)
  console.log('  Testing Case 4: Recurring Willful Violation Escalation');
  const res4 = expert.evaluate({
    classification: 'fall_protection',
    observationText: 'Employee working on leading edge without fall protection harness.',
    siteMemory: { recurringRiskDetected: true }
  });

  assert(res4.safetyAndHealth.hopFactors.some(f => f.includes('Normalization of deviance')), 'Should flag normalization of deviance.');
  assert(res4.laborLawyer.penaltyExposureRisk === 'critical_repeat_willful', 'Should escalate penalty exposure to critical_repeat_willful.');
  assert(res4.laborLawyer.defensibilityStrategy.includes('Repeat/Willful citation'), 'Should warn about Repeat/Willful citations.');
  assert(res4.executiveSummary.includes('HIGH LEGAL EXPOSURE'), 'Executive summary should emphasize legal exposure.');

  console.log('✅ SafeScope Multidisciplinary Expert Synthesis validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
