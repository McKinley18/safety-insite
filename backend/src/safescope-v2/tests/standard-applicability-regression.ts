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
import { StandardApplicabilityService } from '../inspection-intelligence/standard-applicability.service';

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
  console.log("Initializing database connection for Standard Applicability suite...");
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

  console.log("\n🏃 Starting standard applicability expert layer regression tests...\n");

  const testCases = [
    {
      name: "Clear electrical live parts - True Positive",
      observation: "Open breaker slot and missing panel cover expose energized parts in a warehouse.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return citations.includes("29 CFR 1910.303(g)(2)(i)") && res.isVague === false;
      }
    },
    {
      name: "Vague electrical panel - Insufficient Evidence",
      observation: "panel looks bad",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const questions = res.evidenceGapQuestions || [];
        const matchesQuestions = questions.some((q: string) => /cover condition|exposed|access|qualified/i.test(q));
        return res.suggestedStandards.length === 0 && matchesQuestions;
      }
    },
    {
      name: "No-hazard electrical panel - Controlled",
      observation: "Electrical panel is closed, intact, labeled, and access is clear.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return !citations.includes("29 CFR 1910.303(g)(2)(i)");
      }
    },
    {
      name: "False-positive lexical trap - Office Lobby (Should not match MSHA)",
      observation: "Quarry tile is cracked in an office lobby.",
      scopes: ["all"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return !citations.some((c: string) => c.startsWith("30 CFR"));
      }
    },
    {
      name: "MSHA conveyor distinction",
      observation: "Missing guard on conveyor tail pulley at aggregate mine during cleanup.",
      scopes: ["msha"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return citations.includes("30 CFR 56.14107(a)");
      }
    },
    {
      name: "OSHA conveyor distinction",
      observation: "Conveyor tail pulley is unguarded in a manufacturing warehouse.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return citations.includes("29 CFR 1910.212(a)(1)") || citations.includes("29 CFR 1910.212(a)(3)(ii)");
      }
    },
    {
      name: "Chemical container labeling",
      observation: "Unlabeled chemical container in maintenance shop.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return citations.includes("29 CFR 1910.1200(f)(6)") || citations.includes("29 CFR 1910.1200(f)(1)");
      }
    },
    {
      name: "Gas cylinder - Unsecured cylinder (True Positive)",
      observation: "An oxygen cylinder is standing freestanding next to the workbench.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return citations.includes("29 CFR 1910.101(b)");
      }
    },
    {
      name: "Gas cylinder - Secured cylinder (Should not select)",
      observation: "The oxygen cylinder is securely chained to the storage rack with its cap on.",
      scopes: ["osha_general"],
      assertFn: (res: any) => {
        const citations = res.suggestedStandards.map((s: any) => s.citation);
        return !citations.includes("29 CFR 1910.101(b)");
      }
    }
  ];

  for (const tc of testCases) {
    try {
      const res = await service.classify(tc.observation, tc.scopes);
      const passedTest = tc.assertFn(res);
      if (passedTest) {
        passed++;
        console.log(`✅ [PASS] ${tc.name}`);
      } else {
        failed++;
        console.error(`❌ [FAIL] ${tc.name}`);
        console.error(`- Input: ${tc.observation}`);
        console.error(`- Suggested Standards: ${JSON.stringify(res.suggestedStandards.map((s: any) => s.citation))}`);
        console.error(`- Questions: ${JSON.stringify(res.evidenceGapQuestions)}`);
      }
    } catch (e: any) {
      failed++;
      console.error(`❌ [ERROR] ${tc.name}: ${e.message}`, e);
    }
  }

  console.log(`\n==================================================`);
  console.log(`Standard Applicability Test Results: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  await ds.destroy();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
