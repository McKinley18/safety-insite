import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';
import * as assert from 'assert';

async function validate() {
  console.log('--- Testing SafeScope P1 Knowledge Expansion: Industrial Hygiene & Ergonomics ---');
  const service = new SafeScopeReasoningOrchestratorService();

  // Test Case 1: Industrial Hygiene routing & citation
  const case1 = await service.reason({
    hazardObservation: 'Solvent tank emitting chemical vapors and VOCs in the paint shop without local exhaust.',
    siteType: 'manufacturing plant',
    industryContext: 'osha_general_industry',
    employeeExposureKnown: true,
  });

  assert.strictEqual(case1.hazardClassification.primaryDomain, 'industrial_hygiene');
  assert(['29 CFR 1910.1000', '30 CFR 56.5001'].includes(case1.primaryCitation || ''), `Unexpected citation: ${case1.primaryCitation}`);
  assert(case1.missingEvidence.some((gap: any) => gap.field === 'industrialHygieneAtmosphericFacts'));
  console.log('[PASS] Industrial Hygiene routing, citation, and evidence gap verified.');

  // Test Case 2: Ergonomics routing & citation
  const case2 = await service.reason({
    hazardObservation: 'Workers manually lifting heavy 80lb packages repetitively from the conveyor line.',
    siteType: 'warehouse',
    industryContext: 'osha_general_industry',
    employeeExposureKnown: true,
  });

  assert.strictEqual(case2.hazardClassification.primaryDomain, 'ergonomics');
  assert(['29 CFR 1910.176(b)', '30 CFR 56.16007', 'General Duty / Ergonomics Guidance'].includes(case2.primaryCitation || ''), `Unexpected citation: ${case2.primaryCitation}`);
  assert(case2.missingEvidence.some((gap: any) => gap.field === 'ergonomicsLiftingFacts'));
  console.log('[PASS] Ergonomics routing, citation, and evidence gap verified.');

  console.log('✅ SafeScope P1 knowledge expansion validation passed.');
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
