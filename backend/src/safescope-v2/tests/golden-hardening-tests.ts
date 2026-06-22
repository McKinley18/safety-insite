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
import { resolveCanonicalHazardFamily } from '../taxonomy/canonical-taxonomy-aliases';

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
  username: databaseUrl ? undefined : process.env.DB_USERNAME || process.env.DB_USER || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || process.env.DB_PASS || 'password',
  database: databaseUrl ? undefined : process.env.DB_DATABASE || process.env.DB_NAME || 'safescope',
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
  expectedHazardDomain?: string;
  unexpectedHazardDomain?: string;
  expectedStandardFamily?: string;
  unexpectedStandardFamily?: string;
  unexpectedActiveStandardFamilies?: string[];
  expectedActionKeywordGroups?: string[][];
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
    unexpectedActiveStandardFamilies: ["compressed_gas_cylinders", "hazcom", "walking_working_surfaces", "personal_protective_equipment"],
    expectedActionKeywordGroups: [["restrict access", "keep personnel clear"], ["cover", "filler", "blank"], ["qualified electrical", "qualified person"]],
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
    unexpectedActiveStandardFamilies: ["compressed_gas_cylinders", "walking_working_surfaces"],
    expectedActionKeywordGroups: [["identify"], ["label"], ["sds"]],
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
    expectedCitations: ["1910.101"],
    unexpectedCitations: ["1910.104", "1910.253"],
    evidenceGapKeyword: "cylinder",
    expectedHazardDomain: "compressed_gas",
    unexpectedHazardDomain: "slip_trip_fall",
    unexpectedStandardFamily: "walking_working_surfaces",
    unexpectedActiveStandardFamilies: ["walking_working_surfaces", "hazcom", "electrical"],
    expectedActionKeywordGroups: [["secure", "restraint"], ["upright"], ["valve", "cap"], ["traffic", "storage area"]],
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
  {
    name: "14. Test B: Oil spilled across the walkway.",
    text: "Oil spilled across the walkway.",
    scopes: ["osha_general"],
    expectedClassification: "Walking/Working Surfaces",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.22"],
    evidenceGapKeyword: "walkway",
    unexpectedHazardDomain: "compressed_gas",
    unexpectedStandardFamily: "compressed_gas_cylinders",
    unexpectedActiveStandardFamilies: ["compressed_gas_cylinders", "hazcom", "electrical"],
    expectedActionKeywordGroups: [["clean", "absorbent"], ["barricade", "mark the affected"], ["leak", "release source"]],
  },
  {
    name: "15. Test C: Compressed gas cylinder stored in a pedestrian walkway.",
    text: "Compressed gas cylinder stored in a pedestrian walkway.",
    scopes: ["osha_general"],
    expectedClassification: "Compressed Gas Cylinders",
    expectedRiskBand: "High",
    expectedCitations: ["1910.101"],
    evidenceGapKeyword: "cylinder",
    expectedHazardDomain: "compressed_gas",
    unexpectedHazardDomain: "slip_trip_fall",
    unexpectedStandardFamily: "walking_working_surfaces",
  },
  {
    name: "16. Test D: Extension cord stretched across walkway creating a trip hazard.",
    text: "Extension cord stretched across walkway creating a trip hazard.",
    scopes: ["osha_general"],
    expectedClassification: "Walking/Working Surfaces",
    expectedRiskBand: "Moderate",
    expectedCitations: ["1910.22"],
    evidenceGapKeyword: "walkway",
    unexpectedHazardDomain: "compressed_gas",
    unexpectedStandardFamily: "compressed_gas_cylinders",
    unexpectedActiveStandardFamilies: ["compressed_gas_cylinders", "hazcom", "electrical"],
  },
];

async function run() {
  const taxonomyAliases: Array<[string, string]> = [
    ['Compressed Gas Cylinders', 'compressed_gas'],
    ['Hazard Communication', 'hazard_communication'],
    ['Walking/Working Surfaces', 'walking_working_surfaces'],
    ['Lockout / Stored Energy', 'lockout_tagout'],
  ];
  for (const [alias, canonical] of taxonomyAliases) {
    if (resolveCanonicalHazardFamily(alias) !== canonical) {
      throw new Error(`Taxonomy alias "${alias}" did not resolve to "${canonical}".`);
    }
  }

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
      const isVague = response.inspectionIntelligence?.vagueInputAnalysis?.isVague;
      if (isVague) {
        if (response.suggestedStandards && response.suggestedStandards.length > 0) {
          throw new Error(`Expected suggested standards to be empty for vague observation, but got: ${response.suggestedStandards.map((s: any) => s.citation).join(", ")}`);
        }
      }

      const activeStandards = response.suggestedStandards || [];
      const candidateStandards = isVague ? (response.excludedStandards || []) : activeStandards;
      if (candidateStandards.length === 0) {
        throw new Error(`No suggested standards returned!`);
      }

      for (const expectedCit of test.expectedCitations) {
        const found = candidateStandards.some((s: any) => isCitationMatch(s.citation, expectedCit));
        if (!found) {
          throw new Error(`Expected citation "${expectedCit}" was not found in suggestions: ${candidateStandards.map((s: any) => s.citation).join(", ")}`);
        }
      }

      if (test.unexpectedCitations) {
        for (const unexpectedCit of test.unexpectedCitations) {
          const found = activeStandards.some((s: any) => isCitationMatch(s.citation, unexpectedCit));
          if (found) {
            throw new Error(`Unexpected citation "${unexpectedCit}" was found in active suggestions: ${activeStandards.map((s: any) => s.citation).join(", ")}`);
          }
        }
      }

      for (const forbiddenFamily of test.unexpectedActiveStandardFamilies || []) {
        const found = activeStandards.some((standard: any) => standard.standardFamily === forbiddenFamily);
        if (found) {
          throw new Error(`Forbidden active standard family "${forbiddenFamily}" was returned in active suggestions: ${activeStandards.map((s: any) => `${s.citation}:${s.standardFamily}`).join(", ")}`);
        }
      }
      console.log(`  [PASS] ${isVague ? 'Excluded' : 'Suggested'} standards: ${candidateStandards.map((s: any) => s.citation).join(", ")}`);

      // 6. No all-zero/empty results check
      if (!response.generatedActions || response.generatedActions.length === 0) {
        throw new Error(`Suggested actions list is empty.`);
      }
      const actionText = JSON.stringify(response.generatedActions).toLowerCase();
      for (const keywordGroup of test.expectedActionKeywordGroups || []) {
        if (!keywordGroup.some((keyword) => actionText.includes(keyword.toLowerCase()))) {
          throw new Error(`Corrective actions missing one of [${keywordGroup.join(", ")}]. Actions: ${actionText}`);
        }
      }
      console.log(`  [PASS] Suggested actions generated: ${response.generatedActions.length} actions.`);

      // 7. Hazard Domain assertion
      if (test.expectedHazardDomain) {
        const actualDomain = response.hazardCategory || response.scenarioIntelligence?.hazardCategory || response.riskReasoning?.hazardDomain;
        if (actualDomain !== test.expectedHazardDomain) {
          throw new Error(`Expected hazard domain: "${test.expectedHazardDomain}", got: "${actualDomain}"`);
        }
        console.log(`  [PASS] Hazard Domain: ${actualDomain}`);
      }

      if (test.unexpectedHazardDomain) {
        const actualDomain = response.hazardCategory || response.scenarioIntelligence?.hazardCategory || response.riskReasoning?.hazardDomain;
        if (actualDomain === test.unexpectedHazardDomain) {
          throw new Error(`Unexpected hazard domain: "${test.unexpectedHazardDomain}" was returned!`);
        }
        console.log(`  [PASS] Unexpected Hazard Domain "${test.unexpectedHazardDomain}" not present`);
      }

      // 8. Standard Family assertion
      if (test.expectedStandardFamily) {
        const actualFamily = response.candidateStandardFamily || response.scenarioIntelligence?.candidateStandardFamily;
        if (actualFamily !== test.expectedStandardFamily) {
          throw new Error(`Expected standard family: "${test.expectedStandardFamily}", got: "${actualFamily}"`);
        }
        console.log(`  [PASS] Standard Family: ${actualFamily}`);
      }

      if (test.unexpectedStandardFamily) {
        const actualFamily = response.candidateStandardFamily || response.scenarioIntelligence?.candidateStandardFamily;
        if (actualFamily === test.unexpectedStandardFamily) {
          throw new Error(`Unexpected standard family: "${test.unexpectedStandardFamily}" was returned!`);
        }
        console.log(`  [PASS] Unexpected Standard Family "${test.unexpectedStandardFamily}" not present`);
      }

      console.log(`✅ Success for: ${test.name}\n`);
      passed++;
    } catch (err: any) {
      console.error(`❌ Failed: ${test.name}`);
      console.error(`   Error details: ${err.message || err}\n`);
      failed++;
    }
  }

  const previousHeapLimit = process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB;
  try {
    process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB = '1';
    const guardedResponse = await service.classify(
      'A container has no label.',
      ['osha_general'],
      undefined,
      'standard_5x5',
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    if (guardedResponse.debugMetadata?.fullIntelligenceMemoryGuard?.triggered !== true) {
      throw new Error('Expected the Render full-intelligence heap guard to trigger.');
    }
    passed += 1;
    console.log('✅ Render full-intelligence heap guard diagnostics');
  } catch (err: any) {
    failed += 1;
    console.error('❌ Render full-intelligence heap guard diagnostics');
    console.error(`   Error details: ${err.message || err}\n`);
  } finally {
    if (previousHeapLimit === undefined) {
      delete process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB;
    } else {
      process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB = previousHeapLimit;
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
