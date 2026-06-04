import {
  HazardClassificationAdapter,
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
} from './';
import { WeightedClassifierService } from '../../safescope-v2/classifier/weighted-classifier.service';

/**
 * Read-only Hazard Classification Service Adapter.
 *
 * Adapter boundary only.
 * Calls WeightedClassifierService.classify(text).
 * No database writes.
 * No AppModule wiring.
 * No production endpoint exposure.
 * Hazard Classification owns base hazard category/classification only.
 */
export class HazardClassificationServiceAdapter implements HazardClassificationAdapter {
  constructor(private readonly weightedClassifierService: WeightedClassifierService) {}

  async classify(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown>> {
    const observationText = context.normalizedObservation.observationText || '';
    const result = this.weightedClassifierService.classify(observationText);

    return {
      data: result,
      diagnostic: {
        adapterName: 'HazardClassificationServiceAdapter',
        status: 'called',
        notes: [
          'Read-only WeightedClassifierService adapter called.',
          'No database writes performed by adapter.',
          'Classification does not override Standards Matching.',
        ],
        confidence: typeof result?.confidence === 'number' ? result.confidence : 0,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
