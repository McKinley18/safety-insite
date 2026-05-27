import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';
import {
  HazardClassificationServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { WeightedClassifierService } from '../src/safescope-v2/classifier/weighted-classifier.service';

async function run() {
  const orchestrator = new SafeScopeOrchestratorService();
  const classifier = new WeightedClassifierService();
  const classificationAdapter = new HazardClassificationServiceAdapter(classifier);

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
      adapterType: 'read-only-hazard-classification-adapter',
      productionServiceCalls: false,
      productionEndpointEnabled: false,
    },
  };

  const classificationResult = await classificationAdapter.classify(adapterContext);

  const merged = {
    ...baseAnalysis,
    classification: classificationResult.data,
    confidence: (classificationResult.data as any)?.confidence ?? baseAnalysis.confidence,
    reviewRequired:
      (classificationResult.data as any)?.requiresHumanReview ?? baseAnalysis.reviewRequired,
    auditTrace: {
      ...baseAnalysis.auditTrace,
      engines: [
        ...baseAnalysis.auditTrace.engines,
        classificationResult.diagnostic,
      ],
      notes: [
        ...baseAnalysis.auditTrace.notes,
        'Hazard Classification adapter consumed by validation script only.',
      ],
    },
    governanceFlags: {
      ...baseAnalysis.governanceFlags,
      databaseWriteAllowed: false,
      productionEndpointEnabled: false,
      sourceIntelligenceDoesNotOverrideStandards: true,
    },
  };

  const data = merged.classification as any;
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

  if (!data || typeof data !== 'object') {
    errors.push('classification must be an object.');
  }

  if (typeof data.classification !== 'string') {
    errors.push('classification.classification must be a string.');
  }

  if (typeof data.confidence !== 'number') {
    errors.push('classification.confidence must be a number.');
  }

  if (!Array.isArray(data.evidenceTokens)) {
    errors.push('classification.evidenceTokens must be an array.');
  }

  if (
    !merged.auditTrace.engines.some((engine) => {
      const diagnostic = engine as any;
      return (
        diagnostic.adapterName === 'HazardClassificationServiceAdapter' ||
        diagnostic.engineName === 'HazardClassificationServiceAdapter'
      );
    })
  ) {
    errors.push('auditTrace must include HazardClassificationServiceAdapter diagnostic.');
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ valid: false, errors, merged }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    valid: true,
    productionEndpointEnabled: merged.governanceFlags.productionEndpointEnabled,
    databaseWriteAllowed: merged.governanceFlags.databaseWriteAllowed,
    classificationDoesNotOverrideStandards: true,
    classification: data.classification,
    confidence: data.confidence,
    confidenceBand: data.confidenceBand,
    reviewRequired: merged.reviewRequired,
    auditEngines: merged.auditTrace.engines,
    merged,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
