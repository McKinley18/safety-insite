import { LOTO_REFERENCE } from './loto-reference';

export class LotoIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = LOTO_REFERENCE.indicators.filter((indicator) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsLoto =
      classification.includes('lockout') ||
      classification.includes('stored energy') ||
      classification.includes('machine') ||
      classification.includes('electrical');

    if (!detectedIndicators.length && !classificationSuggestsLoto) {
      return null;
    }

    const likelyEnergyTypes = LOTO_REFERENCE.energyTypes.filter((energyType) =>
      text.includes(energyType.toLowerCase())
    );

    const detectedFailureModes = LOTO_REFERENCE.failureModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const zeroEnergyVerified =
      text.includes('zero energy') ||
      text.includes('verified de-energized') ||
      text.includes('try out') ||
      text.includes('tested for absence');

    const isolationConcern =
      text.includes('not locked') ||
      text.includes('not isolated') ||
      text.includes('energized') ||
      text.includes('restart') ||
      text.includes('startup') ||
      text.includes('moving') ||
      text.includes('operating');

    return {
      domain: 'lockout_tagout_energy_isolation',
      detectedIndicators,
      likelyEnergyTypes,
      detectedFailureModes,
      zeroEnergyVerified,
      isolationConcern,
      requiredControls: LOTO_REFERENCE.requiredControls,
      escalationPatterns: LOTO_REFERENCE.escalationPatterns,
      standards: LOTO_REFERENCE.standards,
      reasoningSummary:
        isolationConcern && !zeroEnergyVerified
          ? 'Energy isolation concern detected. Verification of isolation and zero energy is needed before exposure.'
          : 'LOTO or energy-control indicators detected. Confirm authorized control, isolation, stored-energy release, and restart protection.',
    };
  }
}
