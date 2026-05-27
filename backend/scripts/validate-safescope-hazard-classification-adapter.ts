import {
  HazardClassificationServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { WeightedClassifierService } from '../src/safescope-v2/classifier/weighted-classifier.service';

async function run() {
  const classifier = new WeightedClassifierService();
  const adapter = new HazardClassificationServiceAdapter(classifier);

  const context: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
      regulatoryContext: 'OSHA_GENERAL',
      equipmentContext: 'Forklift / pallet',
    },
    metadata: {
      validationOnly: true,
      adapterType: 'read-only-classification-adapter',
      productionEndpointEnabled: false,
    },
  };

  const result = await adapter.classify(context);
  const data = result.data as any;

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (result.diagnostic.adapterName !== 'HazardClassificationServiceAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }
  if (!data || typeof data !== 'object') {
    errors.push('classification result must be an object.');
  }
  if (typeof data.classification !== 'string') {
    errors.push('classification must be a string.');
  }
  if (typeof data.confidence !== 'number') {
    errors.push('confidence must be a number.');
  }
  if (!Array.isArray(data.evidenceTokens)) {
    errors.push('evidenceTokens must be an array.');
  }
  if (!Array.isArray(data.additionalHazards)) {
    errors.push('additionalHazards must be an array.');
  }
  if (!Array.isArray(data.excludedHazards)) {
    errors.push('excludedHazards must be an array.');
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
    classificationDoesNotOverrideStandards: true,
    classification: data.classification,
    confidence: data.confidence,
    confidenceBand: data.confidenceBand,
    requiresHumanReview: data.requiresHumanReview,
    evidenceTokens: data.evidenceTokens,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
