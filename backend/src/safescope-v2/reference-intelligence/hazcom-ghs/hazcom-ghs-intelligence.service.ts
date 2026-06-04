import { HAZCOM_GHS_REFERENCE } from './hazcom-ghs-reference';

export class HazcomGhsIntelligenceService {
  evaluate(input: {
    text: string;
    classification?: string;
  }) {
    const text = String(input.text || '').toLowerCase();
    const classification = String(input.classification || '').toLowerCase();

    const detectedIndicators = HAZCOM_GHS_REFERENCE.indicators.filter((indicator: string) =>
      text.includes(indicator.toLowerCase())
    );

    const classificationSuggestsHazcom =
      classification.includes('hazard communication') ||
      classification.includes('chemical') ||
      classification.includes('hazcom') ||
      classification.includes('ghs');

    if (!detectedIndicators.length && !classificationSuggestsHazcom) {
      return null;
    }

    const exposureRoutes = HAZCOM_GHS_REFERENCE.exposureRoutes.filter((route: string) =>
      text.includes(route.toLowerCase())
    );

    const hazardClasses = HAZCOM_GHS_REFERENCE.hazardClasses.filter((hazardClass: string) =>
      text.includes(hazardClass.toLowerCase())
    );

    const detectedFailureModes = HAZCOM_GHS_REFERENCE.failureModes.filter((mode: string) =>
      text.includes(mode.toLowerCase())
    );

    const labelingConcern =
      text.includes('unlabeled') ||
      text.includes('missing label') ||
      text.includes('secondary container') ||
      text.includes('label missing');

    const sdsConcern =
      text.includes('no sds') ||
      text.includes('sds unavailable') ||
      text.includes('safety data sheet missing');

    const storageCompatibilityConcern =
      text.includes('incompatible') ||
      text.includes('stored together') ||
      text.includes('oxidizer') ||
      text.includes('flammable near');

    const exposureControlConcern =
      text.includes('vapor') ||
      text.includes('fume') ||
      text.includes('spill') ||
      text.includes('skin contact') ||
      text.includes('eye contact') ||
      text.includes('ventilation');

    return {
      domain: 'hazcom_ghs_chemical',
      detectedIndicators,
      exposureRoutes,
      hazardClasses,
      detectedFailureModes,
      labelingConcern,
      sdsConcern,
      storageCompatibilityConcern,
      exposureControlConcern,
      requiredControls: HAZCOM_GHS_REFERENCE.requiredControls,
      escalationPatterns: HAZCOM_GHS_REFERENCE.escalationPatterns,
      standards: HAZCOM_GHS_REFERENCE.standards,
      reasoningSummary:
        labelingConcern || sdsConcern || storageCompatibilityConcern || exposureControlConcern
          ? 'HazCom/GHS indicators suggest labeling, SDS, compatibility, or exposure-control concerns requiring chemical hazard review.'
          : 'Chemical hazard communication indicators detected. Verify labeling, SDS availability, compatibility, exposure route, and PPE/ventilation controls.',
    };
  }
}
