import { MOBILE_EQUIPMENT_REFERENCE } from './mobile-equipment-reference';

export class MobileEquipmentIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = MOBILE_EQUIPMENT_REFERENCE.indicators.filter((indicator) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsMobile =
      classification.includes('mobile') ||
      classification.includes('vehicle') ||
      classification.includes('traffic') ||
      classification.includes('powered mobile equipment');

    if (!detectedIndicators.length && !classificationSuggestsMobile) {
      return null;
    }

    const exposureModes = MOBILE_EQUIPMENT_REFERENCE.exposureModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const detectedFailureModes = MOBILE_EQUIPMENT_REFERENCE.failureModes.filter((mode) =>
      text.includes(mode.toLowerCase())
    );

    const pedestrianExposure =
      text.includes('pedestrian') ||
      text.includes('worker') ||
      text.includes('employee') ||
      text.includes('ground person') ||
      text.includes('spotter');

    const visibilityConcern =
      text.includes('blind spot') ||
      text.includes('visibility') ||
      text.includes('poor lighting') ||
      text.includes('obstructed');

    const lineOfFireConcern =
      pedestrianExposure &&
      (text.includes('backup') ||
        text.includes('reverse') ||
        text.includes('between') ||
        text.includes('near') ||
        text.includes('path'));

    return {
      domain: 'mobile_equipment_traffic_interaction',
      detectedIndicators,
      exposureModes,
      detectedFailureModes,
      pedestrianExposure,
      visibilityConcern,
      lineOfFireConcern,
      requiredControls: MOBILE_EQUIPMENT_REFERENCE.requiredControls,
      escalationPatterns: MOBILE_EQUIPMENT_REFERENCE.escalationPatterns,
      standards: MOBILE_EQUIPMENT_REFERENCE.standards,
      reasoningSummary:
        lineOfFireConcern
          ? 'Mobile equipment and pedestrian interaction suggests line-of-fire exposure requiring separation, visibility, and traffic-control verification.'
          : 'Mobile equipment indicators detected. Verify traffic controls, visibility, equipment condition, and worker separation.',
    };
  }
}
