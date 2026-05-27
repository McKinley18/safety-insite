import {
  StandardsMatchingServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { StandardsBridgeService } from '../src/safescope-v2/standards-bridge.service';
import { StandardsReasoningService } from '../src/safescope-v2/standards-reasoning/standards-reasoning.service';

async function run() {
  const bridge = new StandardsBridgeService();
  const reasoning = new StandardsReasoningService();
  const adapter = new StandardsMatchingServiceAdapter(bridge, reasoning);

  const context: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
      regulatoryContext: 'OSHA_CONSTRUCTION',
      equipmentContext: 'Forklift / pallet',
    },
    classification: {
      classification: 'Fall Protection',
      confidence: 0.82,
      confidenceBand: 'high',
      evidenceTokens: ['no fall protection', 'fall'],
    },
    metadata: {
      validationOnly: true,
      adapterType: 'read-only-standards-matching-adapter',
      productionEndpointEnabled: false,
    },
  };

  const result = await adapter.matchStandards(context);
  const data = result.data as any[];

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (result.diagnostic.adapterName !== 'StandardsMatchingServiceAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }
  if (!Array.isArray(data)) {
    errors.push('standards result data must be an array.');
  }

  for (const standard of data) {
    if (typeof standard !== 'object' || standard === null) {
      errors.push('each standard match must be an object.');
      continue;
    }

    if (!('defensibilityScore' in standard)) {
      errors.push('each standard match must include defensibilityScore.');
    }

    if (!('applicabilityConfidence' in standard)) {
      errors.push('each standard match must include applicabilityConfidence.');
    }
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
    standardsRemainAuthoritative: true,
    matchCount: data.length,
    matches: data,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
