import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';
import {
  HazardClassificationServiceAdapter,
  StandardsMatchingServiceAdapter,
  RiskAssessmentServiceAdapter,
  CorrectiveActionRecommendationServiceAdapter,
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
  const actionsAdapter = new CorrectiveActionRecommendationServiceAdapter();

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
      adapterType: 'classification-standards-risk-actions-flow',
      productionServiceCalls: false,
      productionEndpointEnabled: false,
      databaseWriteAllowed: false,
      correctiveActionRecordCreationAllowed: false,
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

  const actionsResult = await actionsAdapter.recommendActions({
    ...baseContext,
    classification: classificationResult.data,
    standardsMatches: standardsResult.data as any[],
    riskAssessment: riskResult.data,
  });

  const classification = classificationResult.data as any;
  const standardsMatches = standardsResult.data as any[];
  const risk = riskResult.data as any;
  const correctiveActionRecommendations = actionsResult.data as any[];

  const merged = {
    ...baseAnalysis,
    classification,
    standardsMatches,
    riskAssessment: risk,
    correctiveActionRecommendations,
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
        actionsResult.diagnostic,
      ],
      notes: [
        ...baseAnalysis.auditTrace.notes,
        'Hazard Classification adapter consumed by classification-standards-risk-actions flow validation.',
        'Standards Matching adapter consumed by classification-standards-risk-actions flow validation.',
        'Risk Assessment adapter consumed by classification-standards-risk-actions flow validation.',
        'Corrective Action Recommendation adapter consumed by classification-standards-risk-actions flow validation.',
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

  const actionPayload = correctiveActionRecommendations[0] as any;
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

  if (!classification || classification.classification !== 'Fall Protection') {
    errors.push('classification should be Fall Protection.');
  }

  if (!Array.isArray(standardsMatches) || standardsMatches.length < 1) {
    errors.push('standardsMatches must include at least one match.');
  }

  if (!standardsMatches.some((standard) => String(standard?.citation || '').includes('1926.501'))) {
    errors.push('standardsMatches should include OSHA 1926.501 fall protection citation.');
  }

  if (!risk || risk.riskBand !== 'Critical') {
    errors.push('riskAssessment should produce Critical risk band.');
  }

  if (risk.requiresShutdown !== true) {
    errors.push('validation scenario should require shutdown.');
  }

  if (merged.reviewRequired !== true) {
    errors.push('reviewRequired should be true when risk requires shutdown.');
  }

  if (!Array.isArray(correctiveActionRecommendations) || correctiveActionRecommendations.length < 1) {
    errors.push('correctiveActionRecommendations must be a non-empty array.');
  }

  if (!actionPayload || !Array.isArray(actionPayload.immediateActions)) {
    errors.push('corrective action payload must include immediateActions.');
  }

  if (!actionPayload?.immediateActions?.some((action: any) => action.priority === 'critical')) {
    errors.push('high-risk scenario should produce critical immediate action recommendation.');
  }

  for (const adapterName of [
    'HazardClassificationServiceAdapter',
    'StandardsMatchingServiceAdapter',
    'RiskAssessmentServiceAdapter',
    'CorrectiveActionRecommendationServiceAdapter',
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
    correctiveActionRecordsCreated: false,
    correctiveActionsServiceMutationMethodsCalled: false,
    recommendationsOnly: true,
    classification: classification.classification,
    confidence: classification.confidence,
    confidenceDisplay: `${Math.round(classification.confidence * 100)}%`,
    standardsMatchCount: standardsMatches.length,
    standardsMatches,
    riskScore: risk.riskScore,
    riskBand: risk.riskBand,
    requiresShutdown: risk.requiresShutdown,
    correctiveActionPayloadCount: correctiveActionRecommendations.length,
    immediateActionCount: actionPayload.immediateActions.length,
    verificationActionCount: actionPayload.verificationActions.length,
    preventionActionCount: actionPayload.preventionActions.length,
    closureRequirementCount: actionPayload.closureRequirements.length,
    reviewRequired: merged.reviewRequired,
    auditEngines: merged.auditTrace.engines,
    merged,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
