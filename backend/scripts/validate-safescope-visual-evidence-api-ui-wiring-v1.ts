import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { VisualEvidenceReasoningValidator } from '../src/safescope-v2/visual-evidence-reasoning/visual-evidence-reasoning.validator';

async function validate() {
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  
  console.log('--- Testing API Wiring: Supportive Evidence ---');
  const supportiveContext = {
      visualAttachments: [
          { id: 'v1', type: 'photo', viewType: 'close_up', caption: 'Damaged cord detail' },
          { id: 'v2', type: 'photo', viewType: 'control_status', caption: 'Unplugged and tagged' }
      ]
  };
  const retrieval = await retrievalService.retrieve('Damaged extension cord.', supportiveContext);
  const visual = retrieval.visualEvidenceReasoning;

  if (visual.visualSupportLevel !== 'supportive' && visual.visualSupportLevel !== 'partially_supportive') {
      throw new Error(`Expected supportive/partial level, got ${visual.visualSupportLevel}`);
  }
  console.log('[PASS] Supportive evidence processed.');

  console.log('--- Testing API Wiring: Conflict Evidence ---');
  const conflictContext = {
      visualAttachments: [
          { id: 'v1', type: 'photo', caption: 'Guard installed and secure' }
      ]
  };
  const conflictRetrieval = await retrievalService.retrieve('Unguarded conveyor tail pulley.', conflictContext);
  const conflictVisual = conflictRetrieval.visualEvidenceReasoning;

  if (conflictVisual.visualSupportLevel !== 'conflicting') {
      throw new Error(`Expected conflicting level, got ${conflictVisual.visualSupportLevel}`);
  }
  if (conflictRetrieval.confidence >= retrieval.confidence) {
      throw new Error('Expected confidence downgrade for conflicting visual evidence.');
  }
  console.log('[PASS] Conflicting evidence detected and penalized.');

  console.log('--- Testing API Wiring: Missing Required View ---');
  const missingContext = {
      visualAttachments: [
          { id: 'v1', type: 'photo', viewType: 'close_up', caption: 'Nip point' }
      ]
  };
  const missingRetrieval = await retrievalService.retrieve('Unguarded conveyor.', missingContext);
  if (!missingRetrieval.visualEvidenceReasoning.missingVisualEvidence.some(m => m.includes('Wide-area'))) {
      throw new Error('Expected missing Wide-area view warning for machine guarding.');
  }
  console.log('[PASS] Missing required view flagged.');

  console.log('✅ SafeScope visual evidence API/UI wiring validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
