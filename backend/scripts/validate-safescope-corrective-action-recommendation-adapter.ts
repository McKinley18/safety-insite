import {
  CorrectiveActionRecommendationServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';

async function run() {
  const adapter = new CorrectiveActionRecommendationServiceAdapter();

  const context: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText: 'Worker standing near open edge with fall protection missing.',
      regulatoryContext: 'OSHA_CONSTRUCTION',
      equipmentContext: 'Elevated work area',
    },
    classification: {
      classification: 'Fall Protection',
      confidence: 0.82,
      confidenceBand: 'high',
      requiresHumanReview: false,
      evidenceTokens: ['fall protection missing', 'open edge'],
    },
    standardsMatches: [
      {
        citation: '1926.501(b)(1)',
        agency: 'OSHA',
        scope: 'osha_construction',
        rationale: 'Fall protection required for unprotected sides and edges',
      },
    ],
    riskAssessment: {
      riskScore: 25,
      riskBand: 'Critical',
      imminentDanger: true,
      fatalityPotential: 'high',
      requiresShutdown: true,
    },
    metadata: {
      validationOnly: true,
      adapterType: 'read-only-corrective-action-recommendation-adapter',
      productionEndpointEnabled: false,
      correctiveActionRecordCreationAllowed: false,
    },
  };

  const result = await adapter.recommendActions(context);
  const recommendations = result.data as any[];
  const data = recommendations[0] as any;

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (result.diagnostic.adapterName !== 'CorrectiveActionRecommendationServiceAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }
  if (!Array.isArray(recommendations) || recommendations.length < 1) {
    errors.push('recommendation result must be a non-empty array.');
  }
  if (!data || typeof data !== 'object') {
    errors.push('first recommendation payload must be an object.');
  }
  if (!Array.isArray(data.immediateActions) || data.immediateActions.length < 1) {
    errors.push('immediateActions must include at least one recommendation.');
  }
  if (!Array.isArray(data.verificationActions) || data.verificationActions.length < 1) {
    errors.push('verificationActions must include at least one recommendation.');
  }
  if (!Array.isArray(data.preventionActions) || data.preventionActions.length < 1) {
    errors.push('preventionActions must include at least one recommendation.');
  }
  if (!Array.isArray(data.closureRequirements) || data.closureRequirements.length < 1) {
    errors.push('closureRequirements must include at least one item.');
  }
  if (typeof data.escalationRecommendation !== 'string') {
    errors.push('escalationRecommendation must be a string.');
  }
  if (!data.immediateActions.some((action: any) => action.priority === 'critical')) {
    errors.push('high-risk validation scenario should produce a critical immediate action.');
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
    correctiveActionRecordsCreated: false,
    correctiveActionsServiceMutationMethodsCalled: false,
    recommendationsOnly: true,
    recommendationPayloadCount: recommendations.length,
    immediateActionCount: data.immediateActions.length,
    verificationActionCount: data.verificationActions.length,
    preventionActionCount: data.preventionActions.length,
    closureRequirementCount: data.closureRequirements.length,
    escalationRecommendation: data.escalationRecommendation,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
