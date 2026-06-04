import { ELECTRICAL_REFERENCE } from './electrical-reference';

export class ElectricalIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = ELECTRICAL_REFERENCE.indicators.filter((indicator) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsElectrical =
      classification.includes('electrical') ||
      classification.includes('energized') ||
      classification.includes('arc flash');

    if (!detectedIndicators.length && !classificationSuggestsElectrical) {
      return null;
    }

    const hazardModes = ELECTRICAL_REFERENCE.hazardModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const detectedFailureModes = ELECTRICAL_REFERENCE.failureModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const energizedWorkConcern =
      text.includes('energized') ||
      text.includes('live parts') ||
      text.includes('hot work') ||
      text.includes('not de-energized');

    const shockConcern =
      text.includes('shock') ||
      text.includes('exposed') ||
      text.includes('damaged cord') ||
      text.includes('wet');

    const arcFlashConcern =
      text.includes('arc flash') ||
      text.includes('switchgear') ||
      text.includes('breaker') ||
      text.includes('panel');

    return {
      domain: 'electrical_safety',
      detectedIndicators,
      hazardModes,
      detectedFailureModes,
      energizedWorkConcern,
      shockConcern,
      arcFlashConcern,
      requiredControls: ELECTRICAL_REFERENCE.requiredControls,
      escalationPatterns: ELECTRICAL_REFERENCE.escalationPatterns,
      standards: ELECTRICAL_REFERENCE.standards,
      reasoningSummary:
        energizedWorkConcern || shockConcern || arcFlashConcern
          ? 'Electrical exposure indicators detected requiring verification of de-energization, qualified access, electrical protection, and approach controls.'
          : 'Electrical safety indicators detected. Verify electrical isolation, guarding, grounding, and worker qualification.',
    };
  }
}
