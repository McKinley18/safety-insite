import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';
import {
  MockSourceIntelligenceRetrievalAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';

async function run() {
  const orchestrator = new SafeScopeOrchestratorService();
  const sourceAdapter = new MockSourceIntelligenceRetrievalAdapter();

  const request = {
    observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
    regulatoryContext: 'OSHA_GENERAL' as const,
    equipmentContext: 'Forklift / pallet',
    sourceIntelligenceEnabled: true,
    standardsMatchingEnabled: true,
    reviewMode: false,
  };

  const baseAnalysis = orchestrator.analyze(request);

  const adapterContext: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: request.observationText,
      regulatoryContext: request.regulatoryContext,
      equipmentContext: request.equipmentContext,
    },
    metadata: {
      validationOnly: true,
      adapterType: 'mock',
      productionServiceCalls: false,
    },
  };

  const sourceResult = await sourceAdapter.retrieveSources(adapterContext);

  const merged = {
    ...baseAnalysis,
    sourceIntelligenceMatches: sourceResult.data,
    auditTrace: {
      ...baseAnalysis.auditTrace,
      engines: [
        ...baseAnalysis.auditTrace.engines,
        sourceResult.diagnostic,
      ],
      notes: [
        ...baseAnalysis.auditTrace.notes,
        'Mock Source Intelligence adapter consumed by validation script only.',
      ],
    },
    governanceFlags: {
      ...baseAnalysis.governanceFlags,
      sourceIntelligenceDoesNotOverrideStandards: true,
      databaseWriteAllowed: false,
      productionEndpointEnabled: false,
      verifiedSourcesOnly: true,
    },
  };

  const errors: string[] = [];

  if (!merged.analysisId.startsWith('safescope_stub_')) {
    errors.push('analysisId must start with safescope_stub_.');
  }

  if (merged.governanceFlags.databaseWriteAllowed !== false) {
    errors.push('databaseWriteAllowed must remain false.');
  }

  if (merged.governanceFlags.productionEndpointEnabled !== false) {
    errors.push('productionEndpointEnabled must remain false.');
  }

  if (merged.governanceFlags.sourceIntelligenceDoesNotOverrideStandards !== true) {
    errors.push('sourceIntelligenceDoesNotOverrideStandards must remain true.');
  }

  if (!Array.isArray(merged.sourceIntelligenceMatches)) {
    errors.push('sourceIntelligenceMatches must be an array.');
  }

  if (merged.sourceIntelligenceMatches.length !== 1) {
    errors.push('mock source adapter should provide exactly one source match.');
  }

  if (
    !merged.auditTrace.engines.some((engine) => {
      const diagnostic = engine as any;
      return (
        diagnostic.adapterName === 'MockSourceIntelligenceRetrievalAdapter' ||
        diagnostic.engineName === 'MockSourceIntelligenceRetrievalAdapter'
      );
    })
  ) {
    errors.push('auditTrace must include MockSourceIntelligenceRetrievalAdapter diagnostic.');
  }

  const firstSource = merged.sourceIntelligenceMatches[0] as any;

  if (firstSource?.citationAuthority !== 'indirect') {
    errors.push('mock source citationAuthority must be indirect.');
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ valid: false, errors, merged }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    valid: true,
    productionEndpointEnabled: merged.governanceFlags.productionEndpointEnabled,
    databaseWriteAllowed: merged.governanceFlags.databaseWriteAllowed,
    sourceIntelligenceDoesNotOverrideStandards:
      merged.governanceFlags.sourceIntelligenceDoesNotOverrideStandards,
    sourceMatches: merged.sourceIntelligenceMatches.length,
    auditEngines: merged.auditTrace.engines,
    merged,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
