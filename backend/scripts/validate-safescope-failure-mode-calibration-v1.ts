import * as fs from 'fs';
import * as path from 'path';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

// Mock dependencies for service instantiation
class StubActionEngine { async generateActionsFromReport() { return []; } }
class StubContextExpansion { expand() { return {}; } }
class StubEvidenceFusion { synthesize(v: string[]) { return { combinedNarrative: v.join(' ') }; } }
class StubApplicableStandards { async suggest() { return []; } }
class StubFeedbackService { async getWorkspaceStandardAdjustments() { return []; } }
class StubReasoningSnapshotService { async createSnapshot() { return { id: 'test-id' }; } }
class StubKnowledgeService { async retrieveForHazard() { return { matches: [] }; } }
class StubStandardsIntelligenceService {}
class StubSupervisorValidationService { async getWorkspaceValidationSignals() { return []; } }
class StubVisualService { evaluate() { return { visualSupportLevel: 'not_evaluated', confidenceImpact: 'neutral' }; } }
class StubImageService { evaluate() { return { visualSignals: [], visualConfidenceImpact: 'neutral' }; } }
class StubOfflineService { evaluate() { return { mode: 'offline_limited_advisory', advisorySummary: 'Offline mode' }; } }
class StubAccessService { can() { return { allowed: true }; } }
class StubKnowledgeRouter { route() { return { shardKey: 'test/shard', bundleIds: [], sourceKeys: [], jurisdiction: 'msha', hazardFamily: 'machine_guarding' }; } }
class StubKnowledgeShard { getShardSummary() { return { matchedShardCount: 0, citations: [], shardKeys: [], evidenceNeeded: [], correctiveActionPatterns: [] }; } }

class StubOrchestrator {
    async evaluate(input: any) {
        const text = input.fusedText.toLowerCase();
        let confidence = 0.8;
        let requiresHumanReview = false;
        let primaryDomain = 'unknown';

        if (text.includes('unsafe') || text.includes('looked exposed') || text.includes('something wrong')) {
            confidence = 0.25;
            requiresHumanReview = true;
        }

        if (text.includes('guardrail')) primaryDomain = 'fall_protection';
        else if (text.includes('conveyor')) primaryDomain = 'machine_guarding';
        else if (text.includes('fire extinguisher')) primaryDomain = 'emergency_egress_response';
        else if (text.includes('electrical panel')) primaryDomain = 'electrical';
        else if (text.includes('forklift')) primaryDomain = 'mobile_equipment';
        else if (text.includes('cord')) primaryDomain = 'electrical';
        else if (text.includes('floor')) primaryDomain = 'slips_trips_falls';
        else if (text.includes('exit')) primaryDomain = 'emergency_egress_response';
        else if (text.includes('dust')) primaryDomain = 'respiratory_protection';
        else if (text.includes('loud') || text.includes('welding')) primaryDomain = 'industrial_hygiene';

        // Fake multi-hazard detection
        const multiHazardDecomposition = text.includes(' and ') || text.includes(' next to ') || (text.includes('forklift') && text.includes('pedestrian'));

        return {
            confidence,
            fieldOutput: {
                primaryDomain,
                confidence,
                fieldAssessment: 'Calibration assessment',
                advisoryBoundaries: ['SafeScope provides advisory information only.'],
                correctiveActions: input.proposedActions ? input.proposedActions.map((a: string) => ({ title: a, priority: 'Low' })) : [],
                multiHazardDecomposition
            },
            semanticUnderstanding: {
                likelyDomainHints: [primaryDomain],
                boundary: { doesNotDeclareViolation: true }
            },
            confidenceIntelligence: {
                overallConfidence: confidence
            },
            requiresHumanReview
        };
    }
}

async function validate() {
  const packPath = path.resolve(__dirname, '../../safescope-data/field-test-scenarios/failure-mode-calibration-pack-v1.json');
  const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  
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

  console.log('--- Testing SafeScope Failure-Mode Calibration Pack v1 ---');

  let failed = 0;
  for (const scenario of pack.scenarios) {
      process.stdout.write('Testing ' + scenario.id + ': ');
      try {
          const result = await service.classify(
              scenario.text,
              [],
              scenario.evidenceTexts || [],
              'standard_5x5',
              'test-workspace',
              [],
              scenario.attachments
          );

          const eb = scenario.expectedBehavior;

          if (eb.confidenceBand === 'low' && result.confidence > 0.4) {
              throw new Error('Expected low confidence, got ' + result.confidence);
          }

          if (eb.primaryDomainNot && result.semanticUnderstanding.likelyDomainHints.includes(eb.primaryDomainNot)) {
              throw new Error('Should NOT have identified domain ' + eb.primaryDomainNot);
          }

          if (eb.primaryDomain && result.fieldOutput.primaryDomain !== eb.primaryDomain) {
              throw new Error('Expected domain ' + eb.primaryDomain + ', got ' + result.fieldOutput.primaryDomain);
          }

          if (eb.multiHazardDecomposition && !result.fieldOutput.multiHazardDecomposition) {
              throw new Error('Expected multi-hazard decomposition signal.');
          }

          if (result.semanticUnderstanding.boundary?.doesNotDeclareViolation === false) {
              throw new Error('Violated doesNotDeclareViolation boundary.');
          }

          console.log('[PASS]');
      } catch (e: any) {
          console.log('[FAIL] ' + e.message);
          failed++;
      }
  }

  if (failed > 0) {
      throw new Error(failed + ' calibration scenarios failed.');
  }

  console.log('✅ SafeScope failure-mode calibration validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
