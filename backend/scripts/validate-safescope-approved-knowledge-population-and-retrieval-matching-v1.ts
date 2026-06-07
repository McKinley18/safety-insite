import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { FieldOutputComposerV1Service } from '../src/safescope-v2/field-output-composer-v1/field-output-composer-v1.service';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  const composerService = new FieldOutputComposerV1Service();
  
  // Test cases: [observation, expectedDomain]
  const testCases = [
    { text: 'unguarded conveyor tail pulley', expectedDomain: 'machine_guarding' },
    { text: 'damaged electrical cord', expectedDomain: 'electrical' },
    { text: 'unlabeled secondary chemical container', expectedDomain: 'hazcom' },
    { text: 'confined space atmosphere testing', expectedDomain: 'confined_space' },
    { text: 'vague observation requiring review', expectedDomain: 'unknown' }
  ];
  
  for (const tc of testCases) {
      const retrieval = await retrievalService.retrieve(tc.text);
      const output = await composerService.compose(tc.text, {});
      
      // Validation 1: Conveyor, electrical, hazcom, confined_space should have approved matches
      if (tc.expectedDomain !== 'unknown' && retrieval.approvedKnowledgeMatches.length === 0) {
          console.error(`Failed: No approved matches for "${tc.text}" (expected domain ${tc.expectedDomain})`);
          process.exit(1);
      }
      
      // Validation 2: Vague observation should have no approved matches
      if (tc.expectedDomain === 'unknown' && retrieval.approvedKnowledgeMatches.length > 0) {
          console.error(`Failed: Expected no approved matches for vague observation "${tc.text}"`);
          process.exit(1);
      }
      
      // Validation 3: Advisory boundaries preserved
      if (output.advisoryBoundaries.length === 0) {
          console.error(`Missing advisory boundaries for "${tc.text}"`);
          process.exit(1);
      }
      
      // Validation 4: Violation guardrail preserved
      if (output.cannotDeclareViolation !== true) {
          console.error(`Violation guardrail failed for "${tc.text}"`);
          process.exit(1);
      }
  }
  
  console.log('✅ SafeScope retrieval/matching population validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
