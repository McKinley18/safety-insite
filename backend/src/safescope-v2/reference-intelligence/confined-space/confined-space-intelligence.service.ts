import { CONFINED_SPACE_REFERENCE } from './confined-space-reference';

export class ConfinedSpaceIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();

    const detectedIndicators =
      CONFINED_SPACE_REFERENCE.indicators.filter((indicator) =>
        text.includes(indicator.toLowerCase())
      );

    if (!detectedIndicators.length) {
      return null;
    }

    const atmosphericConcerns =
      CONFINED_SPACE_REFERENCE.atmosphericHazards.filter((hazard) =>
        text.includes(hazard.toLowerCase())
      );

    const engulfmentConcerns =
      CONFINED_SPACE_REFERENCE.engulfmentHazards.filter((hazard) =>
        text.includes(hazard.toLowerCase())
      );

    const likelyPermitRequired =
      atmosphericConcerns.length > 0 ||
      engulfmentConcerns.length > 0 ||
      text.includes('permit');

    return {
      domain: 'confined_space',
      detectedIndicators,
      atmosphericConcerns,
      engulfmentConcerns,
      likelyPermitRequired,
      requiredControls:
        CONFINED_SPACE_REFERENCE.requiredControls,
      escalationPatterns:
        CONFINED_SPACE_REFERENCE.escalationPatterns,
      standards:
        CONFINED_SPACE_REFERENCE.standards,
      reasoningSummary:
        likelyPermitRequired
          ? 'Conditions suggest a likely permit-required confined space requiring formal entry controls.'
          : 'Confined-space indicators detected. Additional verification of permit-space conditions is recommended.',
    };
  }
}
