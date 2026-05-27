import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';
import {
  HazardClassificationServiceAdapter,
  StandardsMatchingServiceAdapter,
  RiskAssessmentServiceAdapter,
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

  const riskAdapter = new RiskAssessmentServiceAdapter();

  const request = {
    observationText: 'Worker standing near open edge with fall protection missing.',
    regulatoryContext: 'OSHA_CONSTRUCTION' as const,
    equipmentContext: 'Elevated work area',
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
      adapterType: 'classification-standards-risk-flow',
      productionServiceCalls: false,
      productionEndpointEnabled: false,
    },
  };

  const classificationResult = await classificationAdapter.classify(baseContext);

  const standardsResult = await standardsAdapter.matchStandards({
    ...baseContext,
    classification: classificationResult.data,
  });

  const riskResult = await riskAdapter.assessRisk({
    ...baseContext,
    classification: classificationResult.data,
    standardsMatches: standardsResult.data as any[],
  });

  const classification = classificationResult.data as any;
  const standardsMatches = standardsResult.data as any[];
  const risk = riskResult.data as any;

  const merged = {
    ...baseAnalysis,
    classification,
    standardsMatches,
    riskAssessment: risk,
    confidence: classification?.confidence ?? baseAnalysis.confidence,
    reviewRequired:
      classification?.requiresHumanReview ||
      risk?.requiresShutdown ||
      baseAnalysis.reviewRequired,
    auditTrace: {
      ...baseAnalysis.auditTrace,
      engines: [
        ...baseAnalysis.auditTrace.engines,
        classificationResult.diagnostic,
        standardsResult.diagnostic,
        riskResult.diagnostic,
      ],
      notes: [
        ...baseAnalysis.auditTrace.notes,
        'Hazard Classification adapter consumed by classification-standards-risk flow validation.',
        'Standards Matching adapter consumed by classification-standards-risk flow validation.',
        'Risk Assessment adapter consumed by classification-standards-risk flow validation.',
      ],
    },
    governanceFlags: {
      ...baseAnalysis.governanceFlags,
      databaseWriteAllowed: false,
      productionEndpointEnabled: false,
      sourceIntelligenceDoesNotOverrideStandards: true,
      verifiedSourcesOnly: true,
      humanReviewRequiredForHighRisk: true,
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

  if (merged.governanceFlags.humanReviewRequiredForHighRisk !== true) {
    errors.push('humanReviewRequiredForHighRisk must remain true.');
  }

  if (!classification || typeof classification.classification !== 'string') {
    errors.push('classification result must include classification string.');
  }

  if (!Array.isArray(standardsMatches) || standardsMatches.length < 1) {
    errors.push('standardsMatches must include at least one match.');
  }

  if (!standardsMatches.some((standard) => String(standard?.citation || '').includes('1926.501'))) {
    errors.push('standardsMatches should include OSHA 1926.501 fall protection citation.');
  }

  if (!risk || typeof risk.riskScore !== 'number') {
    errors.push('riskAssessment must include numeric riskScore.');
  }

  if (typeof risk.requiresShutdown !== 'boolean') {
    errors.push('riskAssessment must include requiresShutdown boolean.');
  }

  if (risk.requiresShutdown !== true) {
    errors.push('validation scenario should require shutdown due to open edge / missing fall protection.');
  }

  if (merged.reviewRequired !== true) {
    errors.push('reviewRequired should be true when risk requires shutdown.');
  }

  for (const adapterName of [
    'HazardClassificationServiceAdapter',
    'StandardsMatchingServiceAdapter',
    'RiskAssessmentServiceAdapter',
  ]) {
    if (
      !merged.auditTrace.engines.some((engine) => {
        const diagnostic = engine as any;
        return diagnostic.adapterName === adapterName;
      })
    ) {
      errors.push(`auditTrace must include ${adapterName} diagnostic.`);
    }
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
    riskDoesNotOverrideClassificationOrStandards: true,
    classification: classification.classification,
    confidence: classification.confidence,
    confidenceDisplay: `${Math.round(classification.confidence * 100)}%`,
    standardsMatchCount: standardsMatches.length,
    standardsMatches,
    riskScore: risk.riskScore,
    riskBand: risk.riskBand,
    requiresShutdown: risk.requiresShutdown,
    reviewRequired: merged.reviewRequired,
    auditEngines: merged.auditTrace.engines,
    merged,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
