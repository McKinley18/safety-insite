import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SafeScopeKnowledgeService } from '../src/safescope-knowledge/safescope-knowledge.service';
import { SafeScopeKnowledgeDocument } from '../src/safescope-knowledge/entities/safescope-knowledge-document.entity';
import { SafeScopeKnowledgeChunk } from '../src/safescope-knowledge/entities/safescope-knowledge-chunk.entity';
import { SafeScopeKnowledgeSource } from '../src/safescope-knowledge/entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity';
import { SafeScopeKnowledgeRetrievalLog } from '../src/safescope-knowledge/entities/safescope-knowledge-retrieval-log.entity';

config();

type Scenario = {
  name: string;
  classification: string;
  agencyMode: 'msha' | 'osha_general' | 'osha_construction';
  fusedText: string;
  expectedAny: RegExp[];
  rejectTop?: RegExp[];
  allowCrossScopeSupport?: RegExp[];
};

const scenarios: Scenario[] = [
  {
    name: 'OSHA construction fall protection open edge',
    classification: 'Fall Protection',
    agencyMode: 'osha_construction',
    fusedText: 'Worker standing near an unprotected open edge with missing fall protection.',
    expectedAny: [/fall/i, /walking-working/i, /guardrail/i, /ladder/i, /1926\.50[0-3]/i, /1910\.140/i],
    rejectTop: [/respiratory/i, /confined/i, /grain/i, /pulp/i],
    allowCrossScopeSupport: [/29 CFR 1910\.140/i],
  },
  {
    name: 'OSHA general confined space tank entry',
    classification: 'Confined Space',
    agencyMode: 'osha_general',
    fusedText: 'Employee entering a tank with limited entry and no atmospheric testing or attendant documented.',
    expectedAny: [/confined/i, /permit/i, /1910\.146/i, /atmospheric/i, /attendant/i],
    rejectTop: [/fall protection/i, /machine guarding/i, /respiratory protection/i],
  },
  {
    name: 'OSHA general lockout tagout maintenance',
    classification: 'Lockout / Stored Energy',
    agencyMode: 'osha_general',
    fusedText: 'Maintenance employee clearing a jam while equipment is not locked out and stored energy is present.',
    expectedAny: [/lockout/i, /tagout/i, /hazardous energy/i, /1910\.147/i, /stored energy/i],
    rejectTop: [/fall protection/i, /permit-required confined spaces/i, /§ 1910\.146\b/i, /respiratory protection/i],
  },
  {
    name: 'OSHA general electrical exposed conductors',
    classification: 'Electrical',
    agencyMode: 'osha_general',
    fusedText: 'Electrical panel has missing cover with exposed energized conductors and poor clearance.',
    expectedAny: [/electrical/i, /energized/i, /conductor/i, /1910\.30[3-5]/i, /wiring/i],
    rejectTop: [/fall protection/i, /confined/i, /machine guarding/i],
  },
  {
    name: 'MSHA machine guarding conveyor pulley',
    classification: 'Machine Guarding',
    agencyMode: 'msha',
    fusedText: 'Conveyor tail pulley has missing guard exposing rotating parts and pinch point.',
    expectedAny: [/guard/i, /machine/i, /moving/i, /pulley/i, /conveyor/i, /30 cfr 5[67]\.14/i, /77\.400/i],
    rejectTop: [/fall protection/i, /confined/i, /respiratory/i],
  },
  {
    name: 'MSHA mobile equipment pedestrian interaction',
    classification: 'Mobile Equipment / Traffic',
    agencyMode: 'msha',
    fusedText: 'Loader operating near pedestrian walkway with blind spot exposure and no traffic control.',
    expectedAny: [/mobile/i, /equipment/i, /traffic/i, /pedestrian/i, /loader/i, /30 cfr 5[67]\.91/i],
    rejectTop: [/fall protection/i, /confined/i, /respiratory/i],
  },
];

function evidenceText(match: any) {
  return [
    match?.title,
    match?.citation,
    match?.sectionHeading,
    match?.excerpt,
    ...(match?.tags?.hazards || []),
    ...(match?.tags?.equipment || []),
    ...(match?.tags?.tasks || []),
    ...(match?.tags?.standards || []),
    ...(match?.tags?.lessons || []),
  ]
    .filter(Boolean)
    .join(' ');
}

function topIdentityText(match: any) {
  return [
    match?.title,
    match?.citation,
    match?.sectionHeading,
    ...(match?.tags?.hazards || []),
    ...(match?.tags?.standards || []),
  ]
    .filter(Boolean)
    .join(' ');
}

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

  const service = new SafeScopeKnowledgeService(
    dataSource.getRepository(SafeScopeKnowledgeDocument),
    dataSource.getRepository(SafeScopeKnowledgeChunk),
    dataSource.getRepository(SafeScopeKnowledgeRetrievalLog),
    dataSource.getRepository(SafeScopeKnowledgeSource),
    dataSource.getRepository(SafeScopeKnowledgeIngestionRun),
  );

  const results = [];

  for (const scenario of scenarios) {
    const result = await service.retrieveForHazard({
      fusedText: scenario.fusedText,
      classification: scenario.classification,
      agencyMode: scenario.agencyMode,
      workspaceId: 'local-validation-only',
      reportId: 'local-validation-only',
      findingId: 'local-validation-only',
    });

    const top = result.matches?.[0];
    const topEvidence = evidenceText(top);
    const topPassesExpected = scenario.expectedAny.some((pattern) =>
      pattern.test(topEvidence),
    );
    const topIdentity = topIdentityText(top);
    const topFailsRejected = Boolean(
      top && scenario.rejectTop?.some((pattern) => pattern.test(topIdentity)),
    );

    const topCitation = String(top?.citation || '');
    const crossScopeAllowed = Boolean(
      scenario.allowCrossScopeSupport?.some((pattern) => pattern.test(topIdentity)),
    );

    const topFailsScope =
      scenario.agencyMode === 'osha_general'
        ? /29 CFR 1926\./i.test(topCitation)
        : scenario.agencyMode === 'osha_construction'
          ? /29 CFR 1910\./i.test(topCitation) && !crossScopeAllowed
          : false;

    const passed =
      Boolean(top) && topPassesExpected && !topFailsRejected && !topFailsScope;

    results.push({
      scenario: scenario.name,
      passed,
      confidence: result.confidence,
      top: top
        ? {
            title: top.title,
            citation: top.citation,
            sectionHeading: top.sectionHeading,
            agency: top.agency,
            sourceType: top.sourceType,
            authorityTier: top.authorityTier,
            score: top.score,
          }
        : null,
      synthesisCounts: result.sourceSynthesis?.counts,
      expectedMatched: topPassesExpected,
      rejectedMatched: topFailsRejected,
      scopeRejected: topFailsScope,
    });
  }

  await dataSource.destroy();

  const failed = results.filter((result) => !result.passed);

  console.log(
    JSON.stringify(
      {
        valid: failed.length === 0,
        scenarioCount: scenarios.length,
        passedCount: results.length - failed.length,
        failedCount: failed.length,
        results,
      },
      null,
      2,
    ),
  );

  if (failed.length) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
