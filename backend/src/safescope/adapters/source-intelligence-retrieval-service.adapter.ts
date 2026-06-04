import {
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
  SourceIntelligenceRetrievalAdapter,
} from './';
import { SourceRetrievalService } from '../../safescope-source-intelligence/source-retrieval.service';

/**
 * Read-only Source Intelligence Retrieval Service Adapter.
 *
 * Adapter boundary only.
 * Calls SourceRetrievalService.searchVerifiedSources().
 * No database writes.
 * No AppModule wiring.
 * No production endpoint exposure.
 * Source Intelligence supports evidence and controls but must not override standards.
 */
export class SourceIntelligenceRetrievalServiceAdapter implements SourceIntelligenceRetrievalAdapter {
  constructor(private readonly sourceRetrievalService: SourceRetrievalService) {}

  async retrieveSources(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown[]>> {
    const observation = context.normalizedObservation;

    const result = await this.sourceRetrievalService.searchVerifiedSources({
      hazardCategory: typeof context.classification === 'object' && context.classification
        ? (context.classification as any).hazardCategory
        : undefined,
      keyword: [
        observation.observationText,
        observation.equipmentContext,
        observation.industryContext,
      ].filter(Boolean).join(' '),
      equipmentInvolved: observation.equipmentContext,
      limit: 5,
    });

    return {
      data: Array.isArray((result as any).matches)
        ? (result as any).matches
        : Array.isArray(result)
          ? result
          : [],
      diagnostic: {
        adapterName: 'SourceIntelligenceRetrievalServiceAdapter',
        status: 'called',
        notes: [
          'Read-only SourceRetrievalService adapter called.',
          'No database writes performed by adapter.',
          'Source intelligence does not override standards.',
        ],
        confidence: 0,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
