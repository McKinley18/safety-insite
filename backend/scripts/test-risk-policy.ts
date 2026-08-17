import * as assert from 'node:assert/strict';
import {
  materialRiskChanged,
  normalizeRiskLevel,
  RISK_POLICY_VERSION,
  urgencyForRisk,
} from '../src/inspection/risk-policy';

assert.equal(normalizeRiskLevel('Critical'), 'critical');
assert.equal(normalizeRiskLevel('Serious / High'), 'high');
assert.equal(normalizeRiskLevel('Medium'), 'moderate');
assert.equal(normalizeRiskLevel('unknown'), 'low');

assert.deepEqual(urgencyForRisk('critical'), {
  modelVersion: RISK_POLICY_VERSION,
  riskLevel: 'critical',
  priority: 'urgent',
  dueDays: 1,
  closeoutEvidenceRequired: true,
});
assert.equal(urgencyForRisk('high').dueDays, 3);
assert.equal(urgencyForRisk('moderate').priority, 'high');
assert.equal(urgencyForRisk('low').closeoutEvidenceRequired, false);

const proposed = {
  severity: 'Serious',
  likelihood: 'Possible',
  exposure: 'Repeated',
  overallRisk: 'High',
};
assert.equal(materialRiskChanged(proposed, { ...proposed }), false);
assert.equal(materialRiskChanged(proposed, { ...proposed, overallRisk: 'Low' }), true);

console.log('Risk policy: 10/10 checks passed');
