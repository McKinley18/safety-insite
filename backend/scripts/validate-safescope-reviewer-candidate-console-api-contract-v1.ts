import { ReviewerCandidateConsoleService } from '../src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.service';
import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';

async function validate() {
  const persistence = new SafeScopePersistenceService();
  const service = new ReviewerCandidateConsoleService(persistence);
  
  console.log('--- Testing API contract: candidate shape ---');
  const candidate = await service.addCandidate({
      candidateType: 'human_review_learning',
      sourceSystem: 'test_system',
      priority: 'high',
      domainIds: ['test_domain'],
      hazardFamilies: ['test_hazard'],
      mechanisms: ['test_mechanism'],
      jurisdiction: 'osha_general_industry',
      authorityTier: 'primary_regulation',
      sourceReferences: ['REF-123'],
      summary: 'Test summary for API contract',
      proposedKnowledgeText: 'Proposed knowledge text',
      evidenceBasis: 'Test evidence basis',
      governanceFlags: ['TEST_FLAG'],
      requiredReviewSteps: ['Verification step']
  });

  // Verify essential fields for frontend display
  if (!candidate.candidateId) throw new Error('Candidate missing ID');
  if (!candidate.summary) throw new Error('Candidate missing summary/title');
  if (!candidate.candidateType) throw new Error('Candidate missing type');
  if (!candidate.status) throw new Error('Candidate missing status');
  if (!candidate.priority) throw new Error('Candidate missing priority');

  console.log('[PASS] Candidate shape verified.');

  console.log('--- Testing API contract: action updates ---');
  const approved = await service.approveCandidate(candidate.candidateId, { 
      name: 'Test Reviewer', 
      role: 'Safety Director', 
      notes: 'API contract test approval' 
  });

  if (approved?.status !== 'approved_for_promotion') {
      throw new Error(`Unexpected status after approval: ${approved?.status}`);
  }

  const latestAudit = approved.auditTrail[approved.auditTrail.length - 1];
  if (latestAudit.action !== 'approved') {
      throw new Error(`Unexpected audit action: ${latestAudit.action}`);
  }
  if (latestAudit.actor !== 'Test Reviewer') {
      throw new Error(`Unexpected audit actor: ${latestAudit.actor}`);
  }

  console.log('[PASS] Action updates verified.');

  console.log('✅ SafeScope reviewer candidate console API contract validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
