import * as fs from 'fs';
import * as path from 'path';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

// Mock/Stub dependencies for service instantiation
class StubActionEngine { async generateActionsFromReport() { return []; } }
class StubContextExpansion { expand() { return {}; } }
class StubEvidenceFusion { synthesize(v: string[]) { return { combinedNarrative: v.join(' ') }; } }
class StubApplicableStandards { async suggest() { return []; } }
class StubFeedbackService { async getWorkspaceStandardAdjustments() { return []; } }
class StubReasoningSnapshotService { async createSnapshot() { return { id: 'test-id' }; } }
class StubKnowledgeService { async retrieveForHazard() { return { matches: [] }; } }
class StubStandardsIntelligenceService {}
class StubSupervisorValidationService { async getWorkspaceValidationSignals() { return []; } }

// For real logic integration, we might need the real orchestrator or a heavy stub
class StubOrchestrator {
    async evaluate(input: any) {
        return {
            fieldOutput: {
                primaryDomain: 'test',
                confidence: 0.5,
                fieldAssessment: 'Test assessment',
                advisoryBoundaries: ['SafeScope provides advisory information only.']
            }
        };
    }
}
class StubVisualService { evaluate() { return { visualSupportLevel: 'not_evaluated' }; } }
class StubImageService { evaluate() { return { visualSignals: [] }; } }
class StubOfflineService { evaluate() { return { mode: 'offline_limited_advisory', advisorySummary: 'Offline mode' }; } }
class StubAccessService { can() { return { allowed: true }; } }
class StubKnowledgeRouter { route() { return { shardKey: 'test/shard', bundleIds: [], sourceKeys: [], jurisdiction: 'msha', hazardFamily: 'machine_guarding' }; } }
class StubKnowledgeShard { getShardSummary() { return { matchedShardCount: 0, citations: [], shardKeys: [], evidenceNeeded: [], correctiveActionPatterns: [] }; } }

async function validate() {
  const scenarioPackPath = path.resolve(__dirname, '../../safescope-data/field-test-scenarios/field-test-scenario-pack-v1.json');
  if (!fs.existsSync(scenarioPackPath)) {
      throw new Error('Scenario pack file not found: ' + scenarioPackPath);
  }

  const pack = JSON.parse(fs.readFileSync(scenarioPackPath, 'utf-8'));
  console.log('--- Validating Scenario Pack Schema ---');
  if (!pack.version) throw new Error('Pack missing version');
  if (!Array.isArray(pack.scenarios) || pack.scenarios.length === 0) throw new Error('Pack scenarios must be a non-empty array');

  const requiredFields = ['id', 'title', 'observationNarrative', 'expectedHazardDomains', 'expectedAdvisoryBoundaries'];
  pack.scenarios.forEach((s: any) => {
      requiredFields.forEach(f => {
          if (!s[f]) throw new Error('Scenario ' + s.id + ' missing required field: ' + f);
      });
  });
  console.log('Schema validated for ' + pack.scenarios.length + ' scenarios.');

  console.log('--- Testing Scenarios through SafescopeV2Service ---');
  const service = new SafescopeV2Service(
      new StubActionEngine() as any,
      new StubEvidenceFusion() as any,
      new StubApplicableStandards() as any,
      new StubOrchestrator() as any,
      new StubVisualService() as any,
      new StubImageService() as any,
      new StubOfflineService() as any,
      new StubAccessService() as any,
      new StubKnowledgeRouter() as any,
      new StubKnowledgeShard() as any
  );

  for (const scenario of pack.scenarios) {
      console.log('Testing scenario: ' + scenario.id);
      
      let result;
      if (scenario.offlineMode) {
          result = await service.evaluateOffline({
              observationText: scenario.observationNarrative,
              localInspectionId: 'test-ins',
              localObservationId: 'test-obs',
              timestamp: new Date().toISOString()
          });
          if (result.mode !== 'offline_limited_advisory') throw new Error('Scenario ' + scenario.id + ' failed offline mode check');
      } else {
          result = await service.classify(
              scenario.observationNarrative,
              [scenario.jurisdictionExpectation].filter(Boolean) as string[],
              [],
              'standard_5x5',
              'test-workspace',
              [],
              scenario.visualAttachmentMetadata
          );
          
          // Verify advisory boundaries
          const boundaries = result.fieldOutput?.advisoryBoundaries || [];
          const hasAdvisory = boundaries.some((b: string) => b.toLowerCase().includes('advisory'));
          if (!hasAdvisory) throw new Error('Scenario ' + scenario.id + ' output missing advisory boundary warning');
          
          // Prohibited language check
          const resultStr = JSON.stringify(result).toLowerCase();
          const prohibited = ["is a violation", "legal determination", "definitive violation"];
          prohibited.forEach(p => {
              if (resultStr.includes(p)) throw new Error('Scenario ' + scenario.id + ' produced prohibited language: ' + p);
          });
      }
      
      console.log('[PASS] Scenario ' + scenario.id + ' verified.');
  }

  console.log('✅ SafeScope field test scenario packs validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
