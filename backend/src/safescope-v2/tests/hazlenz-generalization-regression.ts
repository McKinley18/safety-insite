import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { ApplicableStandardsService } from '../../applicable-standards/applicable-standards.service';
import { ActionEngineService } from '../../action-engine/action-engine.service';
import { HazardFixService } from '../../intelligence/hazard-fix.service';
import { FixFeedbackService } from '../../intelligence/fix-feedback.service';
import { EvidenceFusionService } from '../evidence/evidence-fusion.service';
import { SafeScopeIntelligenceOrchestrator } from '../orchestration/intelligence-orchestrator.service';
import { VisualEvidenceReasoningService } from '../visual-evidence-reasoning/visual-evidence-reasoning.service';
import { RealImageAnalysisService } from '../real-image-analysis/real-image-analysis.service';
import { OfflineReasoningMobileResilienceService } from '../offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service';
import { WorkspaceGovernanceAccessService } from '../workspace-governance-access/workspace-governance-access.service';
import { HazLenzKnowledgeRouterService } from '../knowledge-router/hazlenz-knowledge-router.service';
import { HazLenzKnowledgeShardService } from '../knowledge-shards/hazlenz-knowledge-shard.service';
import { HazLenzKnowledgeIndexService } from '../knowledge-index/hazlenz-knowledge-index.service';
import { SafescopeV2Service } from '../safescope-v2.service';

type GeneralizationCase = {
  name: string;
  input: string;
  expectedSignals: RegExp[];
  forbiddenSignals?: RegExp[];
  shouldHaveCandidateStandard?: boolean;
  shouldHaveAdditionalInfo?: boolean;
};

function flattenText(value: any): string {
  return JSON.stringify(value || {}).toLowerCase();
}

function frontFacingCitations(response: any): string {
  const collectValues = (value: any, values: string[] = []): string[] => {
    if (typeof value === "string") {
      values.push(value);
      return values;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectValues(item, values));
      return values;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach((child) => collectValues(child, values));
    }

    return values;
  };

  return collectValues({
    primaryStandard: response.primaryStandard,
    primaryStandards: response.primaryStandards,
    suggestedStandards: response.suggestedStandards,
    supportingStandards: response.supportingStandards,
    standardsReasoning: response.standardsReasoning,
    standardsTraceability: response.standardsTraceability,
    standardsMatchExplanations: response.standardsMatchExplanations,
  }).join(" ").toLowerCase();
}

async function makeService() {
  const databaseUrl = process.env.DATABASE_URL;

  const ds = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
    port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
    username: databaseUrl ? undefined : process.env.DB_USERNAME || process.env.DB_USER || 'user',
    password: databaseUrl ? undefined : process.env.DB_PASSWORD || process.env.DB_PASS || 'password',
    database: databaseUrl ? undefined : process.env.DB_DATABASE || process.env.DB_NAME || 'safescope',
    entities: [Standard],
    synchronize: false,
  });

  await ds.initialize();

  const mockFixFeedbackRepo = {
    create: (x: any) => x,
    save: async (x: any) => x,
    find: async () => [],
  } as any;

  const service = new SafescopeV2Service(
    new ActionEngineService(new HazardFixService(), new FixFeedbackService(mockFixFeedbackRepo)),
    new EvidenceFusionService(),
    new ApplicableStandardsService(ds.getRepository(Standard)),
    new SafeScopeIntelligenceOrchestrator(),
    new VisualEvidenceReasoningService(),
    new RealImageAnalysisService(),
    new OfflineReasoningMobileResilienceService(),
    new WorkspaceGovernanceAccessService(),
    new HazLenzKnowledgeRouterService(new HazLenzKnowledgeIndexService()),
    new HazLenzKnowledgeShardService()
  );

  return { service, ds };
}

const cases: GeneralizationCase[] = [
  {
    name: 'Paraphrased electrical panel opening',
    input: 'There is an empty space in the electrical panel where a breaker or blank should be, and employees walk past it.',
    expectedSignals: [/electrical|energized|panel|1910\.303/i],
    forbiddenSignals: [/1910\.1200|1910\.147|confined space/i],
    shouldHaveCandidateStandard: true,
    shouldHaveAdditionalInfo: true,
  },
  {
    name: 'Messy HazCom field note',
    input: 'Small spray bottle in shop has unknown liquid and no workplace marking on it.',
    expectedSignals: [/hazard|chemical|label|1910\.1200/i],
    forbiddenSignals: [/compressed gas|1910\.101|1910\.147|1910\.146/i],
    shouldHaveCandidateStandard: true,
    shouldHaveAdditionalInfo: true,
  },
  {
    name: 'Paraphrased oil spill walking surface',
    input: 'Dark oily residue is tracked across the maintenance bay floor where mechanics walk.',
    expectedSignals: [/walking|surface|spill|oil|1910\.22/i],
    forbiddenSignals: [/compressed gas|1910\.101|1910\.147/i],
    shouldHaveCandidateStandard: true,
    shouldHaveAdditionalInfo: true,
  },
  {
    name: 'Paraphrased conveyor guarding mine context',
    input: 'At the quarry plant, the return pulley is reachable during cleanup because the barrier is gone.',
    expectedSignals: [/guard|conveyor|pulley|56\.14107/i],
    forbiddenSignals: [/1910\.1200|confined space/i],
    shouldHaveCandidateStandard: true,
    shouldHaveAdditionalInfo: true,
  },
  {
    name: 'Paraphrased mobile equipment pedestrian exposure',
    input: 'Loader traffic and foot traffic use the same route around the stockpile with no separation.',
    expectedSignals: [/mobile|traffic|pedestrian|56\.9100|1910\.178/i],
    forbiddenSignals: [/1910\.1200|1910\.147|confined space/i],
    shouldHaveCandidateStandard: true,
    shouldHaveAdditionalInfo: true,
  },
  {
    name: 'Lookalike non-hazard phrase',
    input: 'The fall safety meeting is scheduled for Monday and the training record is current.',
    expectedSignals: [/meeting|training|record|current/i],
    forbiddenSignals: [/1910\.28|1926\.501|1910\.1200|1910\.303|candidate_standard|candidate standard/i],
    shouldHaveCandidateStandard: false,
    shouldHaveAdditionalInfo: false,
  },
  {
    name: 'Contradictory electrical phrase should not overcite',
    input: 'Panel looked bad at first, but the cover is intact, access is clear, and no live parts are exposed.',
    expectedSignals: [/electrical|review|additional|evidence|no exposed/i],
    forbiddenSignals: [/1910\.303\(g\)\(2\)\(i\).*primary|open slot|dead-front|filler/i],
    shouldHaveCandidateStandard: false,
    shouldHaveAdditionalInfo: true,
  },
];

async function run() {
  const { service, ds } = await makeService();

  let passed = 0;
  let failed = 0;

  console.log('==================================================');
  console.log('Running HazLenz Generalization Regression Suite');
  console.log('==================================================\n');

  for (const tc of cases) {
    const response = await service.classify(tc.input);
    const allText = flattenText(response);
    const citationText = frontFacingCitations(response);

    const expectedOk = tc.expectedSignals.every((signal) => signal.test(allText));
    const forbiddenOk = (tc.forbiddenSignals || []).every((signal) => !signal.test(citationText));
    const hasCandidate =
      Boolean(response.primaryStandard) ||
      Boolean(response.primaryStandards?.length) ||
      Boolean(response.suggestedStandards?.length) ||
      Boolean(response.standardsReasoning?.topDefensible?.length);

    const hasAdditionalInfo =
      Boolean(response.additionalInformationNeeded?.length) ||
      Boolean(response.informationNeeded?.length) ||
      Boolean(response.evidenceGapQuestions?.length);

    const candidateOk = tc.shouldHaveCandidateStandard === undefined || hasCandidate === tc.shouldHaveCandidateStandard;
    const infoOk = tc.shouldHaveAdditionalInfo === undefined || hasAdditionalInfo === tc.shouldHaveAdditionalInfo;

    const ok = expectedOk && forbiddenOk && candidateOk && infoOk;

    if (ok) {
      passed += 1;
      console.log(`[PASS] ${tc.name}`);
    } else {
      failed += 1;
      console.error(`[FAIL] ${tc.name}`, {
        input: tc.input,
        expectedOk,
        forbiddenOk,
        candidateOk,
        infoOk,
        hasCandidate,
        hasAdditionalInfo,
        primaryStandard: response.primaryStandard,
        primaryStandards: response.primaryStandards,
        suggestedStandards: response.suggestedStandards,
        candidateStandardFamily: response.candidateStandardFamily,
        additionalInformationNeeded: response.additionalInformationNeeded,
        evidenceGapQuestions: response.evidenceGapQuestions,
      });
    }
  }

  await ds.destroy();

  console.log('\n==================================================');
  console.log(`HazLenz Generalization Regression Result: ${passed}/${cases.length} passed`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
