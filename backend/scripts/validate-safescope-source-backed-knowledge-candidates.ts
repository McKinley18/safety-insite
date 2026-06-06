import { SourceBackedKnowledgeCandidateService } from '../src/safescope-v2/source-backed-knowledge-candidates/source-backed-knowledge-candidate.service';

async function validate() {
  const service = new SourceBackedKnowledgeCandidateService();
  
  const mockRecord = { recordId: 'test-rec-1' };
  const result = service.createCandidate('cand-1', mockRecord);
  
  if (result.status !== 'reviewer_required') {
    console.error('Expected reviewer_required status');
    process.exit(1);
  }
  
  if (!result.advisoryGuardrails.advisoryOnly) {
    console.error('Advisory guardrails not preserved');
    process.exit(1);
  }
  
  console.log('✅ Source-backed knowledge candidate validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
