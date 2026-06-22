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

async function run() {
  console.log("Initializing database connection for Vague Output Coherence suite...");
  await ds.initialize();

  const standardRepo = ds.getRepository(Standard);
  const applicableStandards = new ApplicableStandardsService(standardRepo);

  const mockFixFeedbackRepo = {
    create: (x: any) => x,
    save: async (x: any) => x,
    find: async () => [],
  } as any;
  const fixFeedbackService = new FixFeedbackService(mockFixFeedbackRepo);
  const hazardFixService = new HazardFixService();
  const actionEngine = new ActionEngineService(hazardFixService, fixFeedbackService);

  const evidenceFusion = new EvidenceFusionService();
  const intelligenceOrchestrator = new SafeScopeIntelligenceOrchestrator();
  const visualService = new VisualEvidenceReasoningService();
  const imageAnalysisService = new RealImageAnalysisService();
  const offlineService = new OfflineReasoningMobileResilienceService();
  const access = new WorkspaceGovernanceAccessService();

  const knowledgeIndex = new HazLenzKnowledgeIndexService();
  const knowledgeRouter = new HazLenzKnowledgeRouterService(knowledgeIndex);
  const knowledgeShardService = new HazLenzKnowledgeShardService();

  const service = new SafescopeV2Service(
    actionEngine,
    evidenceFusion,
    applicableStandards,
    intelligenceOrchestrator,
    visualService,
    imageAnalysisService,
    offlineService,
    access,
    knowledgeRouter,
    knowledgeShardService
  );

  let passed = 0;
  let failed = 0;

  console.log("\n🏃 Starting vague-input downstream coherence regression tests...\n");

  const vagueScenarios = [
    {
      id: 1,
      input: 'panel looks bad',
      domain: 'electrical',
      shouldNotMention: ['filler', 'knockout', 'dead-front', 'open slot', 'plug'],
    },
    {
      id: 2,
      input: 'electrical issue',
      domain: 'electrical',
      shouldNotMention: ['loto', 'lockout', 'tagout', 'lock out'],
    },
    {
      id: 3,
      input: 'cord problem',
      domain: 'electrical',
      shouldNotMention: ['29 cfr', '30 cfr', '1910.305', '1910.334'],
    },
    {
      id: 4,
      input: 'breaker problem',
      domain: 'electrical',
      shouldNotMention: ['filler', 'knockout', 'dead-front', 'cover'],
    },
    {
      id: 5,
      input: 'machine unsafe',
      domain: 'machine_guarding_loto',
      shouldNotMention: ['1910.212', '1910.147', '30 cfr'],
    },
    {
      id: 6,
      input: 'conveyor problem',
      domain: 'machine_guarding_loto',
      shouldNotMention: ['30 cfr 56.14107', '1910.212'],
    },
    {
      id: 7,
      input: 'forklift area unsafe',
      domain: 'mobile_equipment',
      shouldNotMention: ['1910.178', '1926.602', '30 cfr 56.9100'],
    },
    {
      id: 8,
      input: 'chemical issue',
      domain: 'hazard_communication',
      shouldNotMention: ['1910.1200', 'workplace label'],
    },
    {
      id: 9,
      input: 'leak near drain',
      domain: 'hazard_communication',
      shouldNotMention: ['used oil', 'drum'],
    },
    {
      id: 10,
      input: 'fall hazard',
      domain: 'fall_protection',
      shouldNotMention: ['1910.28', '1926.501', 'guardrail'],
    },
    {
      id: 11,
      input: 'mine safety issue',
      domain: 'ground_control',
      shouldNotMention: ['part 56', 'part 57', 'part 75', 'part 77'],
    },
    {
      id: 12,
      input: 'crusher area dusty',
      domain: 'industrial_hygiene',
      shouldNotMention: ['silica', 'noise', 'decibel'],
    },
    {
      id: 13,
      input: 'training concern',
      domain: 'training_procedure_gap',
      shouldNotMention: ['30 cfr part 46', '30 cfr part 48', '1910.1200'],
    },
    {
      id: 14,
      input: 'blocked access',
      domain: 'walking_working_surfaces',
      shouldNotMention: ['1910.37', '1910.22'],
    },
    {
      id: 15,
      input: 'open container',
      domain: 'hazard_communication',
      shouldNotMention: ['compressed gas', 'cylinder'],
    }
  ];

  const clearScenarios = [
    {
      id: 16,
      input: 'Open breaker slot and missing panel cover expose energized parts in a warehouse.',
      domain: 'electrical',
      expectedCitation: '1910.303(g)(2)(i)',
    },
    {
      id: 17,
      input: 'Damaged extension cord with exposed conductor is used in a wet area.',
      domain: 'electrical',
      expectedCitation: '1910.305(g)',
    },
    {
      id: 18,
      input: 'Unlabeled chemical container in maintenance shop.',
      domain: 'hazard_communication',
      expectedCitation: '1910.1200',
    },
    {
      id: 19,
      input: 'Forklift operating next to pedestrians without separation.',
      domain: 'mobile_equipment',
      expectedCitation: '1910.178',
    },
    {
      id: 20,
      input: 'Missing guard on conveyor tail pulley at aggregate mine during cleanup.',
      domain: 'machine_guarding_loto',
      expectedCitation: '56.14107',
    }
  ];

  const falsePositiveScenarios = [
    { id: 21, input: 'fall meeting' },
    { id: 22, input: 'locked out of account' },
    { id: 23, input: 'guard at front gate' },
    { id: 24, input: 'data mining issue' },
    { id: 25, input: 'coal-colored paint' }
  ];

  const forbiddenFinalLanguage = /\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i;

  // Run Vague scenarios
  for (const tc of vagueScenarios) {
    console.log(`Running vague test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // A1: Vague input flag should be true
      if (response.isVague !== true) {
        throw new Error(`Expected isVague to be true, got ${response.isVague}`);
      }

      // A2: suggestedStandards and supportingStandards must be empty
      if (response.suggestedStandards.length > 0 || response.supportingStandards.length > 0) {
        throw new Error(`Expected suggestedStandards and supportingStandards to be empty, got suggested: ${response.suggestedStandards.length}, supporting: ${response.supportingStandards.length}`);
      }

      // A3: Top-level evidenceGapQuestions must be non-empty
      if (!response.evidenceGapQuestions || response.evidenceGapQuestions.length === 0) {
        throw new Error(`Expected top-level evidenceGapQuestions to be non-empty`);
      }

      // A4: Primary hazard candidate matches the domain
      const primaryCandidate = response.inspectionIntelligence?.hazardCandidates?.[0];
      if (!primaryCandidate || primaryCandidate.domain !== tc.domain) {
        throw new Error(`Expected primary hazard candidate domain to be "${tc.domain}", got "${primaryCandidate?.domain}"`);
      }

      // A5: inspectionIntelligence correctiveActions must be populated with cautious interim reviews
      const correctiveActions = response.inspectionIntelligence?.correctiveActions;
      if (!correctiveActions || correctiveActions.immediate.length === 0) {
        throw new Error(`Expected inspectionIntelligence.correctiveActions to have immediate actions`);
      }

      // A6: permanentEngineering must be empty or generic
      const hasSpecificRepairLanguage = correctiveActions.permanentEngineering.some((act: string) => {
        const lower = act.toLowerCase();
        return tc.shouldNotMention.some(term => lower.includes(term));
      });
      if (hasSpecificRepairLanguage) {
        throw new Error(`Expected permanentEngineering to be generic, but got specific actions: ${correctiveActions.permanentEngineering.join('; ')}`);
      }

      // A7: Generated action referenceStandards must be empty
      const generatedAction = response.generatedActions?.[0];
      if (generatedAction?.referenceStandards && generatedAction.referenceStandards.length > 0) {
        throw new Error(`Expected generatedActions[0].referenceStandards to be empty, got ${JSON.stringify(generatedAction.referenceStandards)}`);
      }

      // A8: Generated action description must not include specific component repairs
      const generatedDesc = (generatedAction?.description || '').toLowerCase();
      const hasSpecificInDescription = tc.shouldNotMention.some(term => generatedDesc.includes(term));
      if (hasSpecificInDescription) {
        throw new Error(`Expected generated action description to not contain forbidden terms, but description is: "${generatedDesc}"`);
      }

      // A9: Urgency should be cautious and not critical stop-work unless evidence supports it
      if (generatedAction?.priority === 'CRITICAL' && !tc.input.includes('energized') && !tc.input.includes('exposed')) {
        throw new Error(`Expected priority to not be CRITICAL for vague input without direct danger, got ${generatedAction.priority}`);
      }

      // A10: Advisory guardrails are true
      const guardrails = response.inspectionIntelligence?.guardrails || response.standardsTraceability?.advisoryGuardrails;
      if (guardrails?.advisoryOnly !== true || guardrails?.doesNotDeclareViolation !== true) {
        throw new Error(`Expected advisoryOnly and doesNotDeclareViolation to be true in guardrails`);
      }

      // A11: No final violation language
      const humanText = JSON.stringify({
        actions: response.generatedActions,
        questions: response.evidenceGapQuestions,
        correctiveActions: response.inspectionIntelligence?.correctiveActions,
      });
      if (forbiddenFinalLanguage.test(humanText)) {
        throw new Error(`Expected no final violation/citation language to appear, but match found`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  // Run Clear scenarios
  for (const tc of clearScenarios) {
    console.log(`Running clear preservation test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // B1: should NOT be vague
      if (response.isVague === true) {
        throw new Error(`Expected isVague to be false`);
      }

      // B2: suggestedStandards or supportingStandards must contain target citation
      const standards = [
        ...response.suggestedStandards,
        ...response.supportingStandards,
      ];
      const hasCitation = standards.some(s => s.citation?.toLowerCase().includes(tc.expectedCitation.toLowerCase()));
      if (!hasCitation) {
        throw new Error(`Expected specific standard citation "${tc.expectedCitation}" to be suggested/supporting`);
      }

      // B3: specific corrective actions/fixes allowed
      const generatedAction = response.generatedActions?.[0];
      if (!generatedAction?.suggestedFixes || generatedAction.suggestedFixes.length === 0) {
        throw new Error(`Expected suggestedFixes to be populated for clear input`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  // Run False Positive scenarios
  for (const tc of falsePositiveScenarios) {
    console.log(`Running false-positive test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // C1: should NOT be vague
      if (response.isVague === true) {
        throw new Error(`Expected isVague to be false`);
      }

      // C2: should be no_hazard_signal or controlled
      const status = response.inspectionIntelligence?.conditionAssessment?.status;
      if (status !== 'no_hazard_signal' && status !== 'controlled') {
        throw new Error(`Expected status to be no_hazard_signal or controlled, got "${status}"`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`Vague Output Coherence Regression Result: ${passed}/${passed + failed} passed`);
  console.log("==================================================\n");

  await ds.destroy();

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
