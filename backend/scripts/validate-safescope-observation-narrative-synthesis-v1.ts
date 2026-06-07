import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { ObservationNarrativeSynthesisValidator } from '../src/safescope-v2/observation-narrative-synthesis/observation-narrative-synthesis.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'strong single hazard',
        text: 'Unguarded conveyor tail pulley with employee access during cleanup, no guarding in place, energized and not locked out.',
        expectConfidence: 'high-confidence advisory assessment'
    },
    { 
        name: 'multi-hazard triple',
        text: 'Forklift operating near pedestrians, damaged extension cord nearby, and blocked exit route.',
        expectMulti: true
    },
    { 
        name: 'conflicting evidence',
        text: 'The machine was energized but also de-energized.',
        expectGrade: 'conflicting'
    },
    { 
        name: 'vague insufficient',
        text: 'A vague observation.',
        expectGrade: 'insufficient'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing narrative: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text);
      const narrative = retrieval.observationNarrative;
      
      const errors = ObservationNarrativeSynthesisValidator.validate(narrative);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (tc.expectConfidence && !narrative.narrativeSummary.includes(tc.expectConfidence)) {
          console.error(`[FAIL] Expected confidence language "${tc.expectConfidence}" in summary. Got: ${narrative.narrativeSummary}`);
          process.exit(1);
      }
      
      if (tc.expectMulti && !narrative.narrativeSummary.includes('Multiple potential hazards')) {
          console.error(`[FAIL] Expected multi-hazard language in summary.`);
          process.exit(1);
      }

      if (tc.expectGrade === 'conflicting' && !narrative.narrativeSummary.includes('conflicting facts')) {
          console.error(`[FAIL] Expected conflicting facts language in summary.`);
          process.exit(1);
      }

      if (tc.expectGrade === 'insufficient' && !narrative.narrativeSummary.includes('does not have enough information')) {
          console.error(`[FAIL] Expected insufficient information language in summary.`);
          process.exit(1);
      }
      
      // Prohibited language check
      const prohibited = ["is a violation", "creates a citation", "will be cited", "non-compliant", "noncompliant", "must comply", "regulatory violation"];
      const narString = JSON.stringify(narrative).toLowerCase();
      for (const phrase of prohibited) {
          if (narString.includes(phrase)) {
              console.error(`[FAIL] Prohibited language "${phrase}" found in narrative for "${tc.name}"`);
              process.exit(1);
          }
      }
      
      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope observation narrative synthesis validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
