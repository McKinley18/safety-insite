import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { ApprovedKnowledgeRetrievalOutputV1Validator } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.validator';

async function validate() {
  const service = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    'unguarded conveyor tail pulley',
    'damaged electrical cord',
    'unlabeled secondary chemical container',
    'vague observation requiring review'
  ];
  
  for (const text of testCases) {
      const output = await service.retrieve(text);
      const errors = ApprovedKnowledgeRetrievalOutputV1Validator.validate(output);
      
      if (errors.length > 0) {
          console.error(`Validation failed for "${text}":`, errors);
          process.exit(1);
      }
      
      if (output.advisoryBoundaries.length === 0) {
          console.error(`Missing advisory boundaries for "${text}"`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope approved knowledge retrieval output v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
