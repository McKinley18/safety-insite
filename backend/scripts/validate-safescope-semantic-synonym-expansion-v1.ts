import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { SemanticSynonymExpansionValidator } from '../src/safescope-v2/semantic-synonym-expansion/semantic-synonym-expansion.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'machine_guarding phrase',
        text: 'in-running nip point at conveyor tail pulley',
        expectCanonical: 'nip_point'
    },
    { 
        name: 'lockout_tagout phrase',
        text: 'power still on and no lock applied',
        expectCanonical: 'energized' // 'power on' matches energized
    },
    { 
        name: 'electrical phrase',
        text: 'frayed extension cord across wet floor',
        expectCanonical: 'exposed_wire'
    },
    { 
        name: 'slips_trips_falls phrase',
        text: 'slick walkway from standing water',
        expectCanonical: 'wet_surface'
    },
    { 
        name: 'fall_protection phrase',
        text: 'open edge with no guardrail',
        expectCanonical: 'open_edge'
    },
    { 
        name: 'mobile_equipment phrase',
        text: 'forklift blind spot with pedestrians nearby',
        expectCanonical: 'pedestrian_exposure'
    },
    { 
        name: 'hazcom phrase',
        text: 'secondary chemical container with no label',
        expectCanonical: 'unlabeled'
    },
    { 
        name: 'confined_space phrase',
        text: 'tank entry with no air monitoring',
        expectCanonical: 'atmospheric_hazard'
    },
    { 
        name: 'emergency_egress phrase',
        text: 'blocked emergency exit route',
        expectCanonical: 'blocked_egress'
    },
    { 
        name: 'substring safety guarded',
        text: 'The machine is unguarded.',
        prohibitCanonical: 'nip_point' // Should not match 'guarded'
    },
    { 
        name: 'vague observation',
        text: 'Hello.',
        expectLowConfidence: true
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing semantic expansion: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text);
      const result = retrieval.semanticSynonymExpansion;
      
      const errors = SemanticSynonymExpansionValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (tc.expectCanonical && !result.matchedCanonicalTerms.includes(tc.expectCanonical)) {
          console.error(`[FAIL] Expected canonical term "${tc.expectCanonical}" for "${tc.name}". Got: ${result.matchedCanonicalTerms.join(', ')}`);
          process.exit(1);
      }

      if (tc.prohibitCanonical && result.matchedCanonicalTerms.includes(tc.prohibitCanonical)) {
          console.error(`[FAIL] Prohibited canonical term "${tc.prohibitCanonical}" found for "${tc.name}"`);
          process.exit(1);
      }

      if (tc.expectLowConfidence && result.semanticConfidenceScore > 0.3) {
          console.error(`[FAIL] Expected low confidence for vague case "${tc.name}". Got: ${result.semanticConfidenceScore}`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope semantic synonym expansion validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
