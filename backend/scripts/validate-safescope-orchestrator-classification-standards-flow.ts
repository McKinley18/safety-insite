import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';
import {
  HazardClassificationServiceAdapter,
  StandardsMatchingServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { WeightedClassifierService } from '../src/safescope-v2/classifier/weighted-classifier.service';
import { StandardsBridgeService } from '../src/safescope-v2/standards-bridge.service';
import { StandardsReasoningService } from '../src/safescope-v2/standards-reasoning/standards-reasoning.service';

async function run() {
  const orchestrator = new SafeScopeOrchestratorService();

  const classificationAdapter = new HazardClassificationServiceAdapter(
    new WeightedClassifierService(),
  );

  const standardsAdapter = new StandardsMatchingServiceAdapter(
    new StandardsBridgeService(),
    new StandardsReasoningService(),
  );

  const request = {
    observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
    regulatoryContext: 'OSHA_CONSTRUCTION' as const,
    equipmentContext: 'Forklift / pallet',
    sourceIntelligenceEnabled: true,
    standardsMatchingEnabled: true,
    reviewMode: false,
  };

  const baseAnalysis = orchestrator.analyze(request);

  const baseContext: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: request.observationText,
      regulatoryContext: request.regulatoryContext,
      equipmentContext: request.equipmentContext,
    },
    metadata: {
      validationOnly: true,
      adapterType: 'orchestrator-classification-standards-flow',
      productionServiceCalls: false,
      productionEndpointEnabled: false,
    },
  };

  const classificationResult = await classificationAdapter.classify(baseContext);

  const standardsResult = await standardsAdapter.matchStandards({
    ...baseContext,
    classification: classificationResult.data,
  });

  const merged = {
    ...baseAnalysis,
    classification: classificationResult.data,
    standardsMatches: standardsResult.data,
    confidence: (classificationResult.data as any)?.confidence ?? baseAnalysis.confidence,
    reviewRequired:
      (classificationResult.data as any)?.requiresHumanReview ?? baseAnalysis.reviewRequired,
    auditTrace: {
      ...baseAnalysis.auditTrace,
      engines: [
        ...baseAnalysis.auditTrace.engines,
        classificationResult.diagnostic,
        standardsResult.diagnostic,
      ],
      notes: [
        ...baseAnalysis.auditTrace.notes,
        'Hazard Classification adapter consumed by classification-to-standards flow validation.',
        'Standards Matching adapter consumed by classification-to-standards flow validation.',
      ],
    },
    governanceFlags: {
      ...baseAnalysis.governanceFlags,
      databaseWriteAllowed: false,
      productionEndpointEnabled: false,
      sourceIntelligenceDoesNotOverrideStandards: true,
      verifiedSourcesOnly: true,
    },
  };

  const classification = merged.classification as any;
  const standardsMatches = merged.standardsMatches as any[];
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

  if (!classification || typeof classification.classification !== 'string') {
    errors.push('classification result must include classification string.');
  }

  if (typeof classification.confidence !== 'number') {
    errors.push('classification result must include numeric confidence.');
  }

  if (!Array.isArray(standardsMatches)) {
    errors.push('standardsMatches must be an array.');
  }

  if (standardsMatches.length < 1) {
    errors.push('standardsMatches should include at least one match for OSHA_CONSTRUCTION Fall Protection validation.');
  }

  if (
    !standardsMatches.some((standard) =>
      String(standard?.citation || '').includes('1926.501'),
    )
  ) {
    errors.push('standardsMatches should include OSHA 1926.501 fall protection citation.');
  }

  if (
    !merged.auditTrace.engines.some((engine) => {
      const diagnostic = engine as any;
      return diagnostic.adapterName === 'HazardClassificationServiceAdapter';
    })
  ) {
    errors.push('auditTrace must include HazardClassificationServiceAdapter diagnostic.');
  }

  if (
    !merged.auditTrace.engines.some((engine) => {
      const diagnostic = engine as any;
      return diagnostic.adapterName === 'StandardsMatchingServiceAdapter';
    })
  ) {
    errors.push('auditTrace must include StandardsMatchingServiceAdapter diagnostic.');
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
    standardsRemainAuthoritative: true,
    classification: classification.classification,
    confidence: classification.confidence,
    confidenceDisplay: `${Math.round(classification.confidence * 100)}%`,
    confidenceBand: classification.confidenceBand,
    standardsMatchCount: standardsMatches.length,
    standardsMatches,
    auditEngines: merged.auditTrace.engines,
    merged,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
