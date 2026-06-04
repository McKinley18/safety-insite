import {
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
  SourceIntelligenceRetrievalAdapter,
} from '../';

/**
 * Mock Source Intelligence Retrieval Adapter.
 *
 * Contract-test only.
 * No production service calls.
 * No database writes.
 * Does not modify verified source intelligence.
 * Source Intelligence supports evidence and controls but must not override standards.
 */
export class MockSourceIntelligenceRetrievalAdapter implements SourceIntelligenceRetrievalAdapter {
  async retrieveSources(
    context: SafeScopeAdapterContext,
  ): Promise<SafeScopeAdapterResult<unknown[]>> {
    const observationText = context.normalizedObservation.observationText || '';

    return {
      data: [
        {
          sourceId: 'mock-source-forklift-fall-001',
          sourceAgency: 'NIOSH',
          sourceTitle: 'Mock NIOSH FACE-style source intelligence match',
          sourceUrl: 'mock://source-intelligence/forklift-fall',
          hazardCategory: 'Falls',
          evidenceExcerpt:
            'Mock evidence: worker elevated by forklift/pallet creates fall exposure requiring safer access methods.',
          controls: [
            'Use approved personnel platform or lift equipment.',
            'Do not elevate workers on pallets.',
            'Require fall protection and supervisor review for elevated work.',
          ],
          relevanceScore: observationText.toLowerCase().includes('forklift') ? 0.9 : 0.5,
          citationAuthority: 'indirect',
          notes:
            'Mock adapter output only. Not regulatory authority. Not production source retrieval.',
        },
      ],
      diagnostic: {
        adapterName: 'MockSourceIntelligenceRetrievalAdapter',
        status: 'stubbed',
        notes: [
          'Mock source intelligence retrieval adapter used for contract validation only.',
          'No production services called.',
          'No database writes performed.',
          'Source intelligence does not override standards.',
        ],
        confidence: 0,
      },
      readOnly: true,
      databaseWriteAllowed: false,
    };
  }
}
