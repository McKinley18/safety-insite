import { ReviewerCandidateConsoleService } from '../src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.service';
import { ReviewerCandidateConsoleValidator } from '../src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.validator';

async function validate() {
  const service = new ReviewerCandidateConsoleService();
  
  console.log('--- Testing candidate registration ---');
  const candidate = service.addCandidate({
      candidateType: 'source_ingestion',
      sourceSystem: 'test',
      priority: 'high',
      domainIds: ['machine_guarding'],
      hazardFamilies: ['mechanical'],
      mechanisms: ['nip_point'],
      jurisdiction: 'osha_general_industry',
      authorityTier: 'primary_regulation',
      sourceReferences: ['http://test.com'],
      summary: 'Test candidate',
      proposedKnowledgeText: 'Proposed text',
      evidenceBasis: 'Test evidence',
      governanceFlags: [],
      requiredReviewSteps: ['Step 1']
  });

  const errors = ReviewerCandidateConsoleValidator.validateCandidate(candidate);
  if (errors.length > 0) {
      console.error('[FAIL] Candidate validation errors:', errors);
      process.exit(1);
  }
  console.log(`[PASS] Candidate registered: ${candidate.candidateId}`);

  console.log('--- Testing list and filter ---');
  const pending = service.listCandidates({ status: 'pending_review' });
  if (pending.length === 0) {
      console.error('[FAIL] Expected at least one pending candidate.');
      process.exit(1);
  }
  console.log('[PASS] Candidate listed.');

  console.log('--- Testing approve action ---');
  const approved = service.approveCandidate(candidate.candidateId, { name: 'Admin', role: 'Safety Director', notes: 'Approved' });
  if (approved?.status !== 'approved_for_promotion') {
      console.error('[FAIL] Expected status approved_for_promotion');
      process.exit(1);
  }
  if (approved.auditTrail.length < 2) {
      console.error('[FAIL] Expected audit trail entry for approval.');
      process.exit(1);
  }
  console.log('[PASS] Candidate approved.');

  console.log('--- Testing block with prohibited language ---');
  const badCandidate = service.addCandidate({
      candidateType: 'human_review_learning',
      sourceSystem: 'test',
      priority: 'medium',
      domainIds: [],
      hazardFamilies: [],
      mechanisms: [],
      jurisdiction: 'unknown',
      authorityTier: 'unknown',
      sourceReferences: [],
      summary: 'Bad candidate',
      proposedKnowledgeText: 'This is a definitive violation.',
      evidenceBasis: 'None',
      governanceFlags: [],
      requiredReviewSteps: []
  });

  const badErrors = ReviewerCandidateConsoleValidator.validateCandidate(badCandidate);
  if (badErrors.length === 0) {
      console.error('[FAIL] Expected prohibited language detection.');
      process.exit(1);
  }
  console.log('[PASS] Prohibited language blocked.');

  console.log('✅ SafeScope reviewer candidate console validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
