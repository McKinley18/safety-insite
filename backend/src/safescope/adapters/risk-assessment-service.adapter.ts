import {
  RiskAssessmentAdapter,
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
} from './';
import { evaluateRisk, RiskResult } from '../../safescope-v2/risk/risk-engine';

/**
 * Read-only Risk Assessment Service Adapter.
 *
 * Adapter boundary only.
 * Calls SafeScope v2 evaluateRisk().
 * No database writes.
 * No AppModule wiring.
 * No production endpoint exposure.
 * Risk assessment consumes classification/standards context but must not override them.
 */
export class RiskAssessmentServiceAdapter implements RiskAssessmentAdapter {
  async assessRisk(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<RiskResult>> {
    const classificationData = context.classification as any;

    const classification =
      classificationData?.classification ||
      classificationData?.hazardCategory ||
      classificationData?.family ||
      'Review Required';

    const observationText = context.normalizedObservation.observationText || '';

    const environment =
      context.normalizedObservation.regulatoryContext === 'MSHA'
        ? 'mining'
        : context.normalizedObservation.regulatoryContext === 'OSHA_CONSTRUCTION'
          ? 'construction'
          : undefined;

    const result = evaluateRisk({
      text: observationText,
      classification,
      environment,
      riskProfileId: 'standard_5x5',
    });

    return {
      data: result,
      diagnostic: {
        adapterName: 'RiskAssessmentServiceAdapter',
        status: 'called',
        notes: [
          'Read-only SafeScope v2 evaluateRisk() adapter called.',
          'No database writes performed by adapter.',
          'Risk assessment does not override Hazard Classification or Standards Matching.',
        ],
        confidence: result.riskBand === 'Critical' || result.riskBand === 'High' ? 0.85 : 0.7,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
