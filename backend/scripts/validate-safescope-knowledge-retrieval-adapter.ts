import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import {
  KnowledgeRetrievalServiceAdapter,
  SafeScopeAdapterContext,
} from '../src/safescope/adapters';
import { SafeScopeKnowledgeService } from '../src/safescope-knowledge/safescope-knowledge.service';
import { SafeScopeKnowledgeDocument } from '../src/safescope-knowledge/entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../src/safescope-knowledge/entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeSource } from '../src/safescope-knowledge/entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../src/safescope-knowledge/entities/safescope-knowledge-retrieval-log.entity';

config();

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url:
      process.env.DATABASE_URL ||
      'postgres://mckinley@localhost:5432/sentinel_safety',
    entities: [
      SafeScopeKnowledgeDocument,
      SafeScopeKnowledgeChunk,
      SafeScopeKnowledgeSource,
      SafeScopeKnowledgeIngestionRun,
      SafeScopeKnowledgeRetrievalLog,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const knowledgeService = new SafeScopeKnowledgeService(
    dataSource.getRepository(SafeScopeKnowledgeDocument),
    dataSource.getRepository(SafeScopeKnowledgeChunk),
    dataSource.getRepository(SafeScopeKnowledgeRetrievalLog),
    dataSource.getRepository(SafeScopeKnowledgeSource),
    dataSource.getRepository(SafeScopeKnowledgeIngestionRun),
  );

  const adapter = new KnowledgeRetrievalServiceAdapter(knowledgeService);

  const beforeDocumentCount = await dataSource
    .getRepository(SafeScopeKnowledgeDocument)
    .count();

  const beforeApprovedCount = await dataSource
    .getRepository(SafeScopeKnowledgeDocument)
    .count({ where: { approvalStatus: 'approved' } as any });

  const context: SafeScopeAdapterContext = {
    normalizedObservation: {
      observationText:
        'Worker standing near open edge with fall protection missing.',
      regulatoryContext: 'OSHA_CONSTRUCTION',
      equipmentContext: 'Elevated work area',
      reportId: 'validation-report-only',
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
      adapterType: 'read-only-knowledge-retrieval-adapter',
      productionEndpointEnabled: false,
      workspaceId: 'validation-workspace-only',
      findingId: 'validation-finding-only',
    },
  };

  const result = await adapter.retrieveKnowledge(context);
  const data = result.data as any;

  const afterDocumentCount = await dataSource
    .getRepository(SafeScopeKnowledgeDocument)
    .count();

  const afterApprovedCount = await dataSource
    .getRepository(SafeScopeKnowledgeDocument)
    .count({ where: { approvalStatus: 'approved' } as any });

  await dataSource.destroy();

  const errors: string[] = [];

  if (result.readOnly !== true) errors.push('readOnly must be true.');
  if (result.databaseWriteAllowed !== false) errors.push('databaseWriteAllowed must be false.');

  if (result.diagnostic.adapterName !== 'KnowledgeRetrievalServiceAdapter') {
    errors.push('unexpected adapterName.');
  }

  if (result.diagnostic.status !== 'called') {
    errors.push('diagnostic status must be called.');
  }

  if (!data || typeof data !== 'object') {
    errors.push('knowledge retrieval result must be an object.');
  }

  if (!Array.isArray(data.matches)) {
    errors.push('knowledge retrieval matches must be an array.');
  }

  if (!data.sourceSynthesis || typeof data.sourceSynthesis !== 'object') {
    errors.push('sourceSynthesis must be present.');
  }

  const topMatch = data.matches?.[0];

  if (!topMatch) {
    errors.push('at least one approved knowledge match is required for this validation scenario.');
  }

  if (
    topMatch &&
    !String(topMatch.title || '').toLowerCase().includes('fall') &&
    !String(topMatch.citation || '').toLowerCase().includes('fall')
  ) {
    errors.push('top knowledge match must be directly related to Fall Protection.');
  }

  if (
    topMatch &&
    topMatch.isPrimaryAuthority === true &&
    topMatch.sourceType === 'regulation' &&
    !topMatch.sourceUrl &&
    String(topMatch.citation || '').startsWith('SAFE-SCOPE-')
  ) {
    errors.push('starter references should not be treated as final primary regulatory authority without sourceUrl.');
  }

  if (beforeDocumentCount !== afterDocumentCount) {
    errors.push('document count changed; adapter must not ingest or delete documents.');
  }

  if (beforeApprovedCount !== afterApprovedCount) {
    errors.push('approved document count changed; adapter must not approve or reject documents.');
  }

  for (const match of data.matches || []) {
    if (match?.sourceGovernance?.trustLimits?.shouldNotOverrideRegulation !== true) {
      if (!match?.isPrimaryAuthority) {
        errors.push('non-primary source missing shouldNotOverrideRegulation governance.');
      }
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
    approvedOnlyRetrieval: true,
    sourceIngestionPerformed: false,
    documentApprovalMutated: false,
    taxonomyMutated: false,
    knowledgeDoesNotOverrideStandards: true,
    matchCount: data.matches.length,
    confidence: data.confidence,
    synthesisCounts: data.sourceSynthesis?.counts,
    finalReasoningSummary: data.sourceSynthesis?.finalReasoningSummary,
    result,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
