import { ReviewerCandidateConsoleService } from '../src/hazlenz/reviewer-candidate-console/reviewer-candidate-console.service';
import { HazLenzPersistenceService } from '../src/hazlenz/persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../src/hazlenz/role-based-approval-gates/role-based-approval-gates.service';
import { WorkspaceGovernanceAccessService } from '../src/hazlenz/workspace-governance-access/workspace-governance-access.service';

async function validate() {
  const persistence = new HazLenzPersistenceService();
  const gates = new RoleBasedApprovalGatesService();
  const access = new WorkspaceGovernanceAccessService();
  const service = new ReviewerCandidateConsoleService(persistence, gates, access);
  
  console.log('--- Testing API contract: candidate shape ---');
  const candidate = await service.addCandidate({
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

  if (!candidate.candidateId || !candidate.status || !Array.isArray(candidate.auditTrail)) {
      throw new Error('Candidate response missing required API fields.');
  }
  console.log('[PASS] Candidate shape verified.');

  console.log('--- Testing API contract: action updates ---');
  const updated = await service.approveCandidate(candidate.candidateId, { name: 'Admin', role: 'compliance_admin', notes: 'Approved' });
  if (updated?.status !== 'approved_for_promotion') {
      throw new Error('API update failed to return correct status.');
  }
  console.log('[PASS] Action updates verified.');

  console.log('✅ HazLenz reviewer candidate console API contract validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
