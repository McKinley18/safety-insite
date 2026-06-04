import { LIFTING_RIGGING_REFERENCE } from './lifting-rigging-reference';

export class LiftingRiggingIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = LIFTING_RIGGING_REFERENCE.indicators.filter((indicator: string) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsRigging =
      classification.includes('lifting') ||
      classification.includes('rigging') ||
      classification.includes('crane') ||
      classification.includes('hoist');

    if (!detectedIndicators.length && !classificationSuggestsRigging) {
      return null;
    }

    const hazardModes = LIFTING_RIGGING_REFERENCE.hazardModes.filter((mode: string) =>
      text.includes(mode.toLowerCase())
    );

    const detectedFailureModes = LIFTING_RIGGING_REFERENCE.failureModes.filter((mode: string) =>
      text.includes(mode.toLowerCase())
    );

    const suspendedLoadConcern =
      text.includes('suspended load') ||
      text.includes('under load') ||
      text.includes('below the load') ||
      text.includes('dropped load');

    const riggingIntegrityConcern =
      text.includes('damaged sling') ||
      text.includes('unrated') ||
      text.includes('unknown load') ||
      text.includes('overload') ||
      text.includes('shackle') ||
      text.includes('hook');

    const communicationConcern =
      text.includes('signal') ||
      text.includes('spotter') ||
      text.includes('communication') ||
      text.includes('tag line');

    return {
      domain: 'lifting_rigging',
      detectedIndicators,
      hazardModes,
      detectedFailureModes,
      suspendedLoadConcern,
      riggingIntegrityConcern,
      communicationConcern,
      requiredControls: LIFTING_RIGGING_REFERENCE.requiredControls,
      escalationPatterns: LIFTING_RIGGING_REFERENCE.escalationPatterns,
      standards: LIFTING_RIGGING_REFERENCE.standards,
      reasoningSummary:
        suspendedLoadConcern || riggingIntegrityConcern
          ? 'Lifting/rigging indicators suggest suspended-load, rigging integrity, or load-path exposure requiring qualified review and exclusion-zone controls.'
          : 'Lifting/rigging indicators detected. Verify load rating, rigging condition, communication, and worker separation from the load path.',
    };
  }
}
