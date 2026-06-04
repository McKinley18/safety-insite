import {
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
  StandardsMatchingAdapter,
} from './';
import { StandardsBridgeService } from '../../safescope-v2/standards-bridge.service';
import { StandardsReasoningService } from '../../safescope-v2/standards-reasoning/standards-reasoning.service';

/**
 * Read-only Standards Matching Service Adapter.
 *
 * Adapter boundary only.
 * Calls StandardsBridgeService.getSuggestedStandards().
 * Calls StandardsReasoningService.evaluate().
 * No database writes.
 * No AppModule wiring.
 * No production endpoint exposure.
 * Standards Matching remains authoritative for regulatory citations.
 */
export class StandardsMatchingServiceAdapter implements StandardsMatchingAdapter {
  constructor(
    private readonly standardsBridgeService: StandardsBridgeService,
    private readonly standardsReasoningService: StandardsReasoningService,
  ) {}

  async matchStandards(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown[]>> {
    const classificationData = context.classification as any;
    const rawClassification =
      classificationData?.classification ||
      classificationData?.hazardCategory ||
      classificationData?.family ||
      'Unclassified';

    const classificationAliases: Record<string, string> = {
      'Fall Protection': 'Fall',
      'Falls': 'Fall',
      'Powered Mobile Equipment': 'Mobile Equipment / Traffic',
    };

    const classification = classificationAliases[rawClassification] || rawClassification;

    const regulatoryContext = context.normalizedObservation.regulatoryContext;
    const scopes =
      regulatoryContext === 'MSHA'
        ? ['msha']
        : regulatoryContext === 'OSHA_GENERAL'
          ? ['osha_general']
          : regulatoryContext === 'OSHA_CONSTRUCTION'
            ? ['osha_construction']
            : ['all'];

    const bridgeResult = this.standardsBridgeService.getSuggestedStandards(
      classification,
      scopes,
    );

    const reasoningResult = this.standardsReasoningService.evaluate({
      classification,
      standards: bridgeResult.suggestedStandards || [],
      operationalReasoning: {
        observationText: context.normalizedObservation.observationText,
        equipmentContext: context.normalizedObservation.equipmentContext,
      },
      risk: context.riskAssessment,
    });

    return {
      data: reasoningResult.topDefensible || [],
      diagnostic: {
        adapterName: 'StandardsMatchingServiceAdapter',
        status: 'called',
        notes: [
          'Read-only StandardsBridgeService and StandardsReasoningService adapters called.',
          'No database writes performed by adapter.',
          'Standards Matching remains authoritative for regulatory citations.',
          `Excluded standards: ${(bridgeResult.excludedStandards || []).length}`,
          reasoningResult.summary,
        ],
        confidence: Array.isArray(reasoningResult.topDefensible) && reasoningResult.topDefensible.length
          ? 0.8
          : 0,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
