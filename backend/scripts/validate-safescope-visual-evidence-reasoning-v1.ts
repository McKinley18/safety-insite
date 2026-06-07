import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { VisualEvidenceReasoningValidator } from '../src/safescope-v2/visual-evidence-reasoning/visual-evidence-reasoning.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  const testCases = [
    { 
        name: 'no attachments machine guarding',
        text: 'Unguarded conveyor tail pulley.',
        context: { attachments: [] },
        expectSupport: 'insufficient',
        expectConfidenceImpact: 'downgrade',
        expectQuestion: 'Can relevant photos be attached?'
    },
    { 
        name: 'supportive machine guarding',
        text: 'Unguarded conveyor tail pulley.',
        context: { 
            attachments: [
                { id: 'p1', type: 'photo', viewType: 'close_up', caption: 'Nip point area' },
                { id: 'p2', type: 'photo', viewType: 'wide_area', caption: 'Conveyor access' }
            ] 
        },
        expectSupport: 'supportive',
        expectConfidenceImpact: 'boost'
    },
    { 
        name: 'conflicting guard status',
        text: 'Unguarded conveyor tail pulley.',
        context: { 
            attachments: [
                { id: 'p1', type: 'photo', caption: 'Guard in place' }
            ] 
        },
        expectSupport: 'conflicting',
        expectConfidenceImpact: 'block_confident_language',
        expectFlag: 'unguarded vs guarded'
    },
    { 
        name: 'electrical with close-up',
        text: 'Damaged extension cord.',
        context: { 
            attachments: [
                { id: 'p1', type: 'photo', viewType: 'close_up', fieldNotes: 'Frayed wire visible' }
            ] 
        },
        expectSupport: 'partially_supportive'
    },
    { 
        name: 'fall protection missing wide view',
        text: 'Open edge on platform.',
        context: { 
            attachments: [
                { id: 'p1', type: 'photo', viewType: 'close_up', caption: 'Edge detail' }
            ] 
        },
        expectSupport: 'partially_supportive',
        expectMissing: 'Wide-area photo'
    }
  ];

  for (const tc of testCases) {
      console.log(`--- Testing visual reasoning: ${tc.name} ---`);
      const retrieval = await retrievalService.retrieve(tc.text, tc.context);
      const result = retrieval.visualEvidenceReasoning;
      
      const errors = VisualEvidenceReasoningValidator.validate(result);
      if (errors.length > 0) {
          console.error(`[FAIL] Validator errors for "${tc.name}":`, errors);
          process.exit(1);
      }
      
      if (tc.expectSupport && result.visualSupportLevel !== tc.expectSupport) {
          console.error(`[FAIL] Expected support ${tc.expectSupport} for "${tc.name}". Got: ${result.visualSupportLevel}`);
          process.exit(1);
      }

      if (tc.expectConfidenceImpact && result.confidenceImpact !== tc.expectConfidenceImpact) {
          console.error(`[FAIL] Expected confidenceImpact ${tc.expectConfidenceImpact} for "${tc.name}". Got: ${result.confidenceImpact}`);
          process.exit(1);
      }

      if (tc.expectQuestion && !result.reviewerQuestions.some(q => q.includes(tc.expectQuestion))) {
          console.error(`[FAIL] Expected question containing "${tc.expectQuestion}" for "${tc.name}"`);
          process.exit(1);
      }

      if (tc.expectFlag && !result.visualConsistencyFlags.some(f => f.includes(tc.expectFlag))) {
          console.error(`[FAIL] Expected consistency flag containing "${tc.expectFlag}" for "${tc.name}"`);
          process.exit(1);
      }

      if (tc.expectMissing && !result.missingVisualEvidence.some(m => m.includes(tc.expectMissing))) {
          console.error(`[FAIL] Expected missing evidence record for "${tc.expectMissing}" in "${tc.name}"`);
          process.exit(1);
      }

      console.log(`[PASS] Case: ${tc.name}`);
  }

  console.log('✅ SafeScope visual evidence reasoning validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
