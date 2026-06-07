import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { CorrectiveActionStrategyRankingValidator } from '../src/safescope-v2/corrective-action-strategy-ranking/corrective-action-strategy-ranking.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'unguarded conveyor + access',
        text: 'Unguarded conveyor tail pulley with employee access during cleanup, energized and not locked out.',
        expectPosture: 'act_now',
        expectImmediate: true
    },
    { 
        name: 'damaged cord + wet floor + worker',
        text: 'Worker observed a damaged electrical cord on a wet floor with standing water.',
        expectPosture: 'act_now',
        expectImmediate: true
    },
    { 
        name: 'vague observation',
        text: 'A vague observation.',
        expectPosture: 'questions_only',
        expectQuestions: true
    },
    { 
        name: 'conflicting evidence',
        text: 'The machine was energized but also de-energized.',
        expectPosture: 'questions_only',
        expectQuestions: true
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing strategy ranking: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text);
      const strategy = retrieval.correctiveActionStrategy;
      
      const errors = CorrectiveActionStrategyRankingValidator.validate(strategy);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (strategy.actionPosture !== tc.expectPosture) {
          console.error(`[FAIL] Expected posture ${tc.expectPosture} for "${tc.name}". Got: ${strategy.actionPosture}`);
          console.error('Rationale:', strategy.rankingRationale.join('; '));
          process.exit(1);
      }
      
      if (tc.expectImmediate && strategy.immediateControls.length === 0) {
          console.error(`[FAIL] Expected immediate controls for "${tc.name}"`);
          process.exit(1);
      }

      if (tc.expectQuestions && strategy.supervisorQuestions.length === 0) {
          console.error(`[FAIL] Expected supervisor questions for "${tc.name}"`);
          process.exit(1);
      }

      if (strategy.weakActionsToAvoid.length === 0 && (tc.name.includes('conveyor') || tc.name.includes('cord'))) {
          console.error(`[FAIL] Expected weak actions to avoid for "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope corrective action strategy ranking validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
