import { TRENCHING_REFERENCE } from './trenching-reference';

export class TrenchingIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = TRENCHING_REFERENCE.indicators.filter((indicator) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsTrenching =
      classification.includes('trench') ||
      classification.includes('excavation');

    if (!detectedIndicators.length && !classificationSuggestsTrenching) {
      return null;
    }

    const hazardModes = TRENCHING_REFERENCE.hazardModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const detectedFailureModes = TRENCHING_REFERENCE.failureModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const caveInConcern =
      text.includes('cave') ||
      text.includes('unprotected') ||
      text.includes('no protective') ||
      text.includes('vertical wall') ||
      text.includes('soil instability');

    const egressConcern =
      text.includes('no ladder') ||
      text.includes('ladder missing') ||
      text.includes('egress not provided') ||
      text.includes('no egress');

    const surchargeConcern =
      text.includes('spoil pile') ||
      text.includes('equipment too close') ||
      text.includes('near edge') ||
      text.includes('surcharge');

    return {
      domain: 'trenching_excavation',
      detectedIndicators,
      hazardModes,
      detectedFailureModes,
      caveInConcern,
      egressConcern,
      surchargeConcern,
      requiredControls: TRENCHING_REFERENCE.requiredControls,
      escalationPatterns: TRENCHING_REFERENCE.escalationPatterns,
      standards: TRENCHING_REFERENCE.standards,
      reasoningSummary:
        caveInConcern || egressConcern || surchargeConcern
          ? 'Trenching/excavation indicators suggest cave-in, access/egress, or surcharge concerns requiring competent-person verification.'
          : 'Trenching or excavation indicators detected. Verify protective system, access/egress, spoil setback, water control, and competent-person inspection.',
    };
  }
}
