import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { JurisdictionApplicabilityValidator } from '../src/safescope-v2/jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'clear MSHA conveyor',
        text: 'Conveyor at mine processing plant with guard removed.',
        expectJurisdiction: 'msha'
    },
    { 
        name: 'clear OSHA General Industry forklift',
        text: 'Forklift operating in warehouse aisle.',
        expectJurisdiction: 'osha_general_industry'
    },
    { 
        name: 'clear OSHA Construction excavation',
        text: 'Worker in excavation at construction site.',
        expectJurisdiction: 'osha_construction'
    },
    { 
        name: 'company policy only',
        text: 'Visitor without visitor badge per company policy.',
        expectJurisdiction: 'company_policy_only'
    },
    { 
        name: 'mixed MSHA/OSHA',
        text: 'Excavation at mine stockpile.',
        expectJurisdiction: 'mixed'
    },
    { 
        name: 'unclear jurisdiction',
        text: 'A vague observation with no site details.',
        expectJurisdiction: 'unclear'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing jurisdiction: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text);
      const result = retrieval.jurisdictionApplicability;
      
      const errors = JurisdictionApplicabilityValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (result.primaryJurisdiction !== tc.expectJurisdiction) {
          console.error(`[FAIL] Expected jurisdiction ${tc.expectJurisdiction} for "${tc.name}". Got: ${result.primaryJurisdiction}`);
          process.exit(1);
      }

      if ((tc.expectJurisdiction === 'mixed' || tc.expectJurisdiction === 'unclear') && !result.humanReviewRequired) {
          console.error(`[FAIL] Expected humanReviewRequired for ${tc.expectJurisdiction} case "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope jurisdiction applicability decision tree validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
