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

// Force degraded mode for deterministic offline testing
process.env.RENDER = 'true';
process.env.NODE_ENV = 'production';
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = 'true';

const databaseUrl = process.env.DATABASE_URL;

const ds = new DataSource({
  type: 'postgres',
  url: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USERNAME || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: databaseUrl ? undefined : process.env.DB_NAME || 'safescope',
  entities: [Standard],
  synchronize: false,
});

function canonicalizeCitation(cit: string): string {
  return cit
    .toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isCitationMatch(dbCit: string, targetCit: string): boolean {
  const c1 = canonicalizeCitation(dbCit);
  const c2 = canonicalizeCitation(targetCit);
  return c1.includes(c2) || c2.includes(c1);
}

type ScenarioTest = {
  name: string;
  text: string;
  scopes: string[];
  expectedClassification: string;
  expectedRiskBand: string;
  expectedCitations: string[];
  unexpectedCitations?: string[];
  evidenceGapKeyword: string;
};

const scenarios: ScenarioTest[] = [
  {
    name: "1. MSHA Conveyor Guarding Cleanup",
    text: "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.",
    scopes: ["msha"],
    expectedClassification: "Machine Guarding",
    expectedRiskBand: "Critical",
    expectedCitations: ["30 CFR 56.14107"],
    evidenceGapKeyword: "guard",
  },
  {
    name: "2. OSHA GI Electrical Open Breaker Slot",
    text: "In the warehouse, an electrical distribution panel has a missing cover and an open breaker slot exposing live 120V bus bars.",
    scopes: ["osha_general"],
    expectedClassification: "Electrical",
    expectedRiskBand: "Critical",
    expectedCitations: ["1910.303"],
    evidenceGapKeyword: "panel",
  },
  {
    name: "3. OSHA Construction Unprotected Edge",
    text: "At a commercial building site, workers are framing near an unprotected floor opening with a 15-foot fall hazard to the concrete below and no guardrail.",
    scopes: ["osha_construction"],
    expectedClassification: "Fall Protection",
    expectedRiskBand: "High",
    expectedCitations: ["1926.501"],
    evidenceGapKeyword: "fall",
  },
  {
    name: "4. Mobile Equipment Pedestrian Exposure",
    text: "Front-end loader near pedestrians operating in the stockpiles area with no traffic control and high haul truck traffic.",
    scopes: ["msha"],
    expectedClassification: "Mobile Equipment / Traffic",
    expectedRiskBand: "High",
    expectedCitations: ["30 CFR 56.9100"],
    evidenceGapKeyword: "berm",
  },
  {
    name: "5. Chemical Unlabeled Container",
    text: "Unlabeled plastic container filled with clear liquid found near maintenance workbench. No GHS label or SDS sheet available.",
    scopes: ["osha_general"],
    expectedClassification: "Hazard Communication",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.1200"],
    evidenceGapKeyword: "label",
  },
  {
    name: "6. Housekeeping/Trip walkway hazard (Not Fall Protection)",
    text: "Extension cords and empty boxes are scattered across the main walkway near the packaging line, creating a trip hazard.",
    scopes: ["osha_general"],
    expectedClassification: "Walking/Working Surfaces",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.22"],
    unexpectedCitations: ["1910.28", "1910.140"],
    evidenceGapKeyword: "walkway",
  },
  {
    name: "7. LOTO energized maintenance (Not Guarding alone)",
    text: "Maintenance performed without lockout and stored energy not released on electrically-powered equipment while mechanic clears a jam on the running conveyor tail pulley.",
    scopes: ["msha"],
    expectedClassification: "Lockout / Stored Energy",
    expectedRiskBand: "High",
    expectedCitations: ["30 CFR 56.12016"],
    evidenceGapKeyword: "LOTO",
  },
  {
    name: "8. Precision Scenario A: A container has no label.",
    text: "A container has no label.",
    scopes: ["osha_general"],
    expectedClassification: "Hazard Communication",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.1200"],
    unexpectedCitations: ["1910.253", "1910.101"],
    evidenceGapKeyword: "substance",
  },
  {
    name: "9. Precision Scenario B: Unlabeled spray bottle found in the maintenance shop.",
    text: "Unlabeled spray bottle found in the maintenance shop.",
    scopes: ["osha_general"],
    expectedClassification: "Hazard Communication",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.1200"],
    unexpectedCitations: ["1910.253", "1910.101"],
    evidenceGapKeyword: "substance",
  },
  {
    name: "10. Precision Scenario C: Used oil container has no label.",
    text: "Used oil container has no label.",
    scopes: ["osha_general"],
    expectedClassification: "Hazard Communication",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.1200"],
    unexpectedCitations: ["1910.253", "1910.101"],
    evidenceGapKeyword: "substance",
  },
  {
    name: "11. Precision Scenario D: Oxygen cylinder stored unsecured near a walkway.",
    text: "Oxygen cylinder stored unsecured near a walkway.",
    scopes: ["osha_general"],
    expectedClassification: "Compressed Gas Cylinders",
    expectedRiskBand: "High",
    expectedCitations: ["1910.104"],
    evidenceGapKeyword: "cylinder",
  },
  {
    name: "12. Precision Scenario E: Compressed gas cylinder missing valve protection cap.",
    text: "Compressed gas cylinder missing valve protection cap.",
    scopes: ["osha_general"],
    expectedClassification: "Compressed Gas Cylinders",
    expectedRiskBand: "Critical",
    expectedCitations: ["1910.101"],
    evidenceGapKeyword: "cylinder",
  },
  {
    name: "13. Precision Scenario F: Tank has no label.",
    text: "Tank has no label.",
    scopes: ["osha_general"],
    expectedClassification: "Hazard Communication",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.1200"],
    unexpectedCitations: ["1910.253", "1910.101"],
    evidenceGapKeyword: "substance",
  },
];

async function run() {
  console.log("Initializing database connection...");
  await ds.initialize();

  // Wiring dependencies manually
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

  console.log("\n🏃 Starting golden hardening tests under degraded fallback mode...\n");

  for (const test of scenarios) {
    console.log(`Test: ${test.name}`);
    try {
      const response = await service.classify(
        test.text,
        test.scopes,
        undefined, // evidenceTexts
        "standard_5x5" // riskProfileId
      );

      // 1. Core classification assertion
      if (response.classification !== test.expectedClassification) {
        throw new Error(`Expected classification: "${test.expectedClassification}", got: "${response.classification}"`);
      }
      console.log(`  [PASS] Classification: ${response.classification}`);

      // 2. Risk band assertion
      const actualRiskBand = response.risk?.riskBand;
      if (actualRiskBand !== test.expectedRiskBand) {
        throw new Error(`Expected risk band: "${test.expectedRiskBand}", got: "${actualRiskBand}"`);
      }
      console.log(`  [PASS] Risk Band: ${actualRiskBand}`);

      // 3. Governance guardrails check
      const gov = response.governance;
      if (!gov || gov.advisoryOnly !== true || gov.requiresQualifiedReview !== true || response.degraded !== true) {
        throw new Error(`Advisory guardrails or degraded flag not present/correct in intelligence output.`);
      }
      console.log(`  [PASS] Governance Guardrails (advisoryOnly: ${gov.advisoryOnly}, requiresQualifiedReview: ${gov.requiresQualifiedReview}, degraded: ${response.degraded})`);

      // 4. Evidence gaps check (classification tailored)
      const evidenceGaps = response.evidenceGaps || [];
      const gapsString = evidenceGaps.join(" ");
      if (!gapsString.toLowerCase().includes(test.evidenceGapKeyword.toLowerCase())) {
        throw new Error(`Evidence gaps do not contain expected keyword "${test.evidenceGapKeyword}". Gaps: ${JSON.stringify(evidenceGaps)}`);
      }
      console.log(`  [PASS] Evidence Gaps verified (contains keyword "${test.evidenceGapKeyword}")`);

      // 5. Standards retrieval checks (including deduplicated matches)
      const standards = response.suggestedStandards || [];
      if (standards.length === 0) {
        throw new Error(`No suggested standards returned!`);
      }

      for (const expectedCit of test.expectedCitations) {
        const found = standards.some((s: any) => isCitationMatch(s.citation, expectedCit));
        if (!found) {
          throw new Error(`Expected citation "${expectedCit}" was not found in suggestions: ${standards.map((s: any) => s.citation).join(", ")}`);
        }
      }

      if (test.unexpectedCitations) {
        for (const unexpectedCit of test.unexpectedCitations) {
          const found = standards.some((s: any) => isCitationMatch(s.citation, unexpectedCit));
          if (found) {
            throw new Error(`Unexpected citation "${unexpectedCit}" was found in suggestions: ${standards.map((s: any) => s.citation).join(", ")}`);
          }
        }
      }
      console.log(`  [PASS] Suggested standards: ${standards.map((s: any) => s.citation).join(", ")}`);

      // 6. No all-zero/empty results check
      if (!response.generatedActions || response.generatedActions.length === 0) {
        throw new Error(`Suggested actions list is empty.`);
      }
      console.log(`  [PASS] Suggested actions generated: ${response.generatedActions.length} actions.`);

      console.log(`✅ Success for: ${test.name}\n`);
      passed++;
    } catch (err: any) {
      console.error(`❌ Failed: ${test.name}`);
      console.error(`   Error details: ${err.message || err}\n`);
      failed++;
    }
  }

  console.log(`==================================================`);
  console.log(`Golden Hardening Tests Summary: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  await ds.destroy();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(async (error) => {
  console.error("Unhandled execution error:", error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
