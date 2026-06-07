import { SafeScopeIntelligenceOrchestrator } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';

async function validate() {
  const orchestrator = new SafeScopeIntelligenceOrchestrator();
  
  const testCases = [
    'unguarded conveyor tail pulley',
    'damaged electrical cord',
    'unlabeled secondary chemical container',
    'vague observation requiring review'
  ];
  
  for (const text of testCases) {
      const output = await orchestrator.evaluate({
          fusedText: text,
          promotedPrimary: { classification: 'general_hazard' },
          classifierResult: {},
          expandedContext: {},
          primaryStandardsResult: {},
          generatedActions: [],
          additionalHazards: []
      });
      
      if (!output.composer) {
          console.error(`Missing composed output for "${text}"`);
          process.exit(1);
      }
      
      if (output.composer.advisoryBoundaries.length === 0) {
          console.error(`Missing advisory boundaries for "${text}"`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope orchestrator field output wiring validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
