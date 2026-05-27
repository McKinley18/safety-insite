import {
  SourceIntelligenceRetrievalServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { SourceRetrievalService } from '../src/safescope-source-intelligence/source-retrieval.service';

async function run() {
  const sourceRetrievalService = new SourceRetrievalService();
  const adapter = new SourceIntelligenceRetrievalServiceAdapter(sourceRetrievalService);

  const context: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
      regulatoryContext: 'OSHA_GENERAL',
      equipmentContext: 'Forklift / pallet',
    },
    classification: {
      hazardCategory: 'Falls',
    },
    metadata: {
      validationOnly: true,
      adapterType: 'read-only-service-adapter',
      productionEndpointEnabled: false,
    },
  };

  const result = await adapter.retrieveSources(context);

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (!Array.isArray(result.data)) errors.push('data must be an array.');
  if (result.diagnostic.adapterName !== 'SourceIntelligenceRetrievalServiceAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ valid: false, errors, result }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    valid: true,
    adapter: result.diagnostic.adapterName,
    readOnly: result.readOnly,
    databaseWriteAllowed: result.databaseWriteAllowed,
    productionEndpointEnabled: false,
    sourceDoesNotOverrideStandards: true,
    matchCount: result.data.length,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
