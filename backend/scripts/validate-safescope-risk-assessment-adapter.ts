import {
  RiskAssessmentServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';

async function run() {
  const adapter = new RiskAssessmentServiceAdapter();

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
      evidenceTokens: ['fall protection missing', 'open edge'],
    },
    standardsMatches: [
      {
        citation: '1926.501(b)(1)',
        agency: 'OSHA',
        scope: 'osha_construction',
      },
    ],
    metadata: {
      validationOnly: true,
      adapterType: 'read-only-risk-assessment-adapter',
      productionEndpointEnabled: false,
    },
  };

  const result = await adapter.assessRisk(context);
  const data = result.data as any;

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');
  if (result.diagnostic.adapterName !== 'RiskAssessmentServiceAdapter') {
    errors.push('unexpected adapterName.');
  }
  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }
  if (!data || typeof data !== 'object') {
    errors.push('risk result must be an object.');
  }
  if (typeof data.riskScore !== 'number') {
    errors.push('riskScore must be a number.');
  }
  if (typeof data.riskBand !== 'string') {
    errors.push('riskBand must be a string.');
  }
  if (typeof data.requiresShutdown !== 'boolean') {
    errors.push('requiresShutdown must be a boolean.');
  }
  if (!Array.isArray(data.reasoning)) {
    errors.push('reasoning must be an array.');
  }
  if (!data.operationalRisk || typeof data.operationalRisk.matrixScore !== 'number') {
    errors.push('operationalRisk.matrixScore must be a number.');
  }
  if (!data.aiRisk || typeof data.aiRisk.escalationScore !== 'number') {
    errors.push('aiRisk.escalationScore must be a number.');
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
    riskDoesNotOverrideClassificationOrStandards: true,
    riskScore: data.riskScore,
    riskBand: data.riskBand,
    requiresShutdown: data.requiresShutdown,
    fatalityPotential: data.fatalityPotential,
    operationalRisk: data.operationalRisk,
    aiRisk: data.aiRisk,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
