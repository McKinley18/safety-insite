import { SafeScopeKnowledgeService } from '../../safescope-knowledge/safescope-knowledge.service';
import { SafeScopeAdapterContext, SafeScopeAdapterResult } from './safescope-adapter.types';

/**
 * Read-only SafeScope Knowledge Retrieval adapter.
 *
 * This adapter retrieves approved trusted knowledge for orchestrator validation.
 * It must not ingest sources, approve documents, mutate taxonomy, create standards,
 * or override Standards Matching.
 */
export class KnowledgeRetrievalServiceAdapter {
  constructor(private readonly knowledgeService: SafeScopeKnowledgeService) {}

  async retrieveKnowledge(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown>> {
    const classificationData = context.classification as any;

    const classification =
      classificationData?.classification ||
      classificationData?.hazardCategory ||
      classificationData?.family ||
      'Unclassified';

    const observationText =
      context.normalizedObservation?.observationText || '';

    const regulatoryContext =
      context.normalizedObservation?.regulatoryContext || 'MIXED';

    const agencyMode =
      regulatoryContext === 'MSHA'
        ? 'msha'
        : regulatoryContext === 'OSHA_GENERAL'
          ? 'osha_general'
          : regulatoryContext === 'OSHA_CONSTRUCTION'
            ? 'osha_construction'
            : undefined;

    const result = await this.knowledgeService.retrieveForHazard({
      fusedText: observationText,
      classification,
      agencyMode,
      workspaceId: String(context.metadata?.workspaceId || ''),
      reportId: context.normalizedObservation?.reportId,
      findingId: String(context.metadata?.findingId || ''),
    });

    return {
      data: result,
      diagnostic: {
        adapterName: 'KnowledgeRetrievalServiceAdapter',
        status: 'called',
        notes: [
          'Read-only SafeScope Knowledge retrieval adapter called.',
          'Approved-only trusted knowledge retrieval enforced by SafeScopeKnowledgeService.retrieveForHazard().',
          'No source ingestion performed by adapter.',
          'No document approval status changed by adapter.',
          'No taxonomy mutation performed by adapter.',
          'Knowledge retrieval supports reasoning but does not override Standards Matching.',
        ],
        confidence: Number(result?.confidence || 0),
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
