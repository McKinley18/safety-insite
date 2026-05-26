import {
  MockSourceIntelligenceRetrievalAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';

const context: SafeScopeAdapterContext = {
  normalizedObservation: {
    observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
    regulatoryContext: 'OSHA_GENERAL',
    equipmentContext: 'Forklift / pallet',
  },
  metadata: {
    validationOnly: true,
    adapterType: 'mock',
  },
};

async function run() {
  const adapter = new MockSourceIntelligenceRetrievalAdapter();
  const result = await adapter.retrieveSources(context);

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (!Array.isArray(result.data)) errors.push('data must be an array.');
  if (result.data.length !== 1) errors.push('mock adapter should return exactly one source match.');
  if (result.diagnostic.adapterName !== 'MockSourceIntelligenceRetrievalAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'stubbed') errors.push('mock diagnostic status must be stubbed.');

  const first = result.data[0] as any;
  if (first?.citationAuthority !== 'indirect') {
    errors.push('mock source intelligence citationAuthority must be indirect.');
  }
  if (!String(first?.notes || '').toLowerCase().includes('not regulatory authority')) {
    errors.push('mock notes must state it is not regulatory authority.');
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ valid: false, errors, result }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    valid: true,
    adapter: result.diagnostic.adapterName,
    databaseWriteAllowed: result.databaseWriteAllowed,
    readOnly: result.readOnly,
    productionServiceCalls: false,
    sourceDoesNotOverrideStandards: true,
    matchCount: result.data.length,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
