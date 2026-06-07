import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { CrossDomainCausalChainValidator } from '../src/safescope-v2/cross-domain-causal-chain/cross-domain-causal-chain.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'conveyor + cleanup + no LOTO',
        text: 'Unguarded conveyor tail pulley being cleaned up while energized and not locked out.',
        expectChain: 'Mechanical energy source with guarding failure.'
    },
    { 
        name: 'damaged cord + wet floor',
        text: 'Damaged extension cord on a wet floor with water present.',
        expectChain: 'Electrical hazard amplified by conductive environmental surface.'
    },
    { 
        name: 'forklift + pedestrian blind spot',
        text: 'Forklift operating in a pedestrian walkway with blind spots and poor visibility.',
        expectChain: 'Mobile equipment traffic with pedestrian interaction pathway.'
    },
    { 
        name: 'unlabeled chemical + spill',
        text: 'Unlabeled chemical container next to a spill with SDS missing.',
        expectChain: 'Chemical spill with identification and control information gap.'
    },
    { 
        name: 'open edge + material staging',
        text: 'Work near an open edge with unstable material staging nearby.',
        expectChain: 'Fall from height hazard exacerbated by material placement.'
    },
    { 
        name: 'confined space + no testing',
        text: 'Entry into a confined space tank without atmospheric testing or rescue readiness.',
        expectChain: 'Confined space entry with atmospheric and rescue readiness gaps.'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing causal chain: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text);
      const chainResult = retrieval.crossDomainCausalChain;
      
      const errors = CrossDomainCausalChainValidator.validate(chainResult);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (!chainResult.primaryCausalChain.includes(tc.expectChain)) {
          console.error(`[FAIL] Expected primary causal chain "${tc.expectChain}" for "${tc.name}". Got: ${chainResult.primaryCausalChain.join('; ')}`);
          process.exit(1);
      }
      
      if (chainResult.doesNotDeclareViolation !== true) {
          console.error(`[FAIL] doesNotDeclareViolation must be true for "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope cross-domain causal chain validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
