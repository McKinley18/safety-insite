import {
  SafeScopeAdapterContext,
  SafeScopeAdapterResult,
  HazardClassificationAdapter,
  StandardsMatchingAdapter,
  SourceIntelligenceRetrievalAdapter,
  RiskAssessmentAdapter,
  CorrectiveActionRecommendationAdapter,
  ReviewGovernanceAdapter,
  AuditTraceAdapter,
  ReportSummaryAdapter,
} from '../src/safescope/adapters';

const context: SafeScopeAdapterContext = {
  normalizedObservation: {
    observationText: 'Worker standing on pallet raised by forklift with no fall protection.',
    regulatoryContext: 'OSHA_GENERAL',
    equipmentContext: 'Forklift / pallet',
  },
  metadata: {
    validationOnly: true,
  },
};

function result<T>(adapterName: string, data: T): SafeScopeAdapterResult<T> {
  return {
    data,
    diagnostic: {
      adapterName,
      status: 'stubbed',
      notes: ['Adapter contract validation only. No production service calls.'],
      confidence: 0,
    },
    readOnly: true,
    databaseWriteAllowed: false,
  };
}

const hazardAdapter: HazardClassificationAdapter = {
  async classify(input) {
    return result('HazardClassificationAdapter', {
      observationText: input.normalizedObservation.observationText,
      hazardCategory: 'Falls',
    });
  },
};

const standardsAdapter: StandardsMatchingAdapter = {
  async matchStandards() {
    return result('StandardsMatchingAdapter', []);
  },
};

const sourceAdapter: SourceIntelligenceRetrievalAdapter = {
  async retrieveSources() {
    return result('SourceIntelligenceRetrievalAdapter', []);
  },
};

const riskAdapter: RiskAssessmentAdapter = {
  async assessRisk() {
    return result('RiskAssessmentAdapter', { reviewRequired: false });
  },
};

const actionAdapter: CorrectiveActionRecommendationAdapter = {
  async recommendActions() {
    return result('CorrectiveActionRecommendationAdapter', []);
  },
};

const reviewAdapter: ReviewGovernanceAdapter = {
  async evaluateReview() {
    return result('ReviewGovernanceAdapter', { reviewRequired: false });
  },
};

const auditAdapter: AuditTraceAdapter = {
  async buildAuditTrace() {
    return result('AuditTraceAdapter', { traceId: 'adapter_contract_validation' });
  },
};

const reportAdapter: ReportSummaryAdapter = {
  async summarizeReport() {
    return result('ReportSummaryAdapter', 'Adapter contract validation summary.');
  },
};

async function run() {
  const outputs = [
    await hazardAdapter.classify(context),
    await standardsAdapter.matchStandards(context),
    await sourceAdapter.retrieveSources(context),
    await riskAdapter.assessRisk(context),
    await actionAdapter.recommendActions(context),
    await reviewAdapter.evaluateReview(context),
    await auditAdapter.buildAuditTrace(context),
    await reportAdapter.summarizeReport(context),
  ];

  const invalid = outputs.filter((output) => output.readOnly !== true || output.databaseWriteAllowed !== false);

  if (invalid.length > 0) {
    console.error(JSON.stringify({ valid: false, invalid }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    valid: true,
    adapterContractsValidated: outputs.length,
    databaseWriteAllowed: false,
    productionServiceCalls: false,
    context,
    diagnostics: outputs.map((output) => output.diagnostic),
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
