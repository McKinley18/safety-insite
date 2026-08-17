import { CorrectiveActionBrainService } from '../brain/corrective-action-brain/corrective-action.service';

const service = new CorrectiveActionBrainService();
const cases = [
  { domain: 'walking_working_surfaces', mechanism: 'slip_trip_fall_same_level', expected: /walking|surface|spill|route/i, forbidden: /wiring|electrical cabinet/i },
  { domain: 'electrical', mechanism: 'electrical_shock', expected: /electrical|enclosure|energ/i, forbidden: /walking route|spill/i },
  { domain: 'fall_protection', mechanism: 'fall_from_height', expected: /guardrail|fall|edge/i, forbidden: /chemical|wiring/i },
  { domain: 'mobile_equipment', mechanism: 'mobile_equipment_struck_by', expected: /pedestrian|traffic|vehicle|separation/i, forbidden: /wiring|spill/i },
];

for (const testCase of cases) {
  const result = service.evaluate({
    hazardDomain: testCase.domain,
    candidateStandardFamily: testCase.domain,
    scenarioFamilyId: testCase.domain,
    mechanismOfInjury: testCase.mechanism,
    exposedPersonActivity: 'worker in affected area',
    missingOrFailedControls: ['control'],
    confidenceSignals: { score: 0.8 },
  } as any, [], {
    equipment: { specificEquipment: 'unrelated equipment' },
    energy: { primaryEnergySource: 'electrical' },
    mechanismCandidates: [{ mechanism: 'electrical_shock' }],
    exposure: { activity: 'worker' },
  });
  if (!testCase.expected.test(result.permanentCorrectionNarrative) || testCase.forbidden.test(result.permanentCorrectionNarrative)) {
    throw new Error(`${testCase.domain} received incompatible corrective action: ${result.permanentCorrectionNarrative}`);
  }
}

console.log('domain-association-regression: PASS');
