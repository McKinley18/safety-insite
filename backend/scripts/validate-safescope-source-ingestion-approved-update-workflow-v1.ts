import { SourceIngestionApprovedUpdateWorkflowService } from '../src/safescope-v2/source-ingestion-approved-update-workflow/source-ingestion-approved-update-workflow.service';
import { SourceIngestionApprovedUpdateWorkflowValidator } from '../src/safescope-v2/source-ingestion-approved-update-workflow/source-ingestion-approved-update-workflow.validator';
import { ApprovedKnowledgeRegistrySearchService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry-search.service';
import { SourceFreshnessGovernanceService } from '../src/safescope-v2/source-freshness-governance/source-freshness-governance.service';
import { JurisdictionApplicabilityDecisionTreeService } from '../src/safescope-v2/jurisdiction-applicability-decision-tree/jurisdiction-applicability-decision-tree.service';
import { ReviewerCandidateConsoleService } from '../src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.service';
import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../src/safescope-v2/role-based-approval-gates/role-based-approval-gates.service';
import { WorkspaceGovernanceAccessService } from '../src/safescope-v2/workspace-governance-access/workspace-governance-access.service';

async function validate() {
  const persistence = new SafeScopePersistenceService();
  const gates = new RoleBasedApprovalGatesService();
  const access = new WorkspaceGovernanceAccessService();
  const search = new ApprovedKnowledgeRegistrySearchService();
  const freshness = new SourceFreshnessGovernanceService();
  const jurisdiction = new JurisdictionApplicabilityDecisionTreeService();
  const consoleService = new ReviewerCandidateConsoleService(persistence, gates, access);

  const service = new SourceIngestionApprovedUpdateWorkflowService(
      search,
      freshness,
      jurisdiction,
      consoleService,
      persistence,
      gates,
      access
  );
  
  const oshaInput = {
      sourceId: 'src-osha-new',
      agency: 'OSHA',
      jurisdiction: 'osha_general_industry',
      authorityTier: 'primary_regulation',
      citation: '1910.999', 
      title: 'New Safety Standard',
      sourceUrl: 'http://osha.gov',
      effectiveDate: '2026-01-01',
      revisionDate: '2026-01-01',
      verifiedAt: new Date().toISOString(),
      sourceDateStatus: 'current',
      sourceText: 'New safety requirements for special equipment.',
      mappedDomainId: 'machine_guarding',
      mappedStandardFamily: 'machine_guarding',
      mappedHazardFamilies: ['mechanical'],
      mappedMechanisms: ['nip_point'],
      mappedEquipmentGroups: ['special_equipment'],
      mappedTaskContexts: ['operation'],
      applicabilitySignals: ['special_equipment'],
      requiredFacts: ['guarding_status'],
      disqualifyingFacts: [],
      evidenceQuestions: ['Is guard in place?'],
      submittedBy: 'System',
      reviewerRole: 'compliance_admin'
  };

  console.log('--- Testing ingestion: OSHA Primary Regulation ---');
  const candidate = await service.ingest(oshaInput);
  const candErrors = SourceIngestionApprovedUpdateWorkflowValidator.validateCandidate(candidate);
  if (candErrors.length > 0) {
      console.error('[FAIL] Candidate validation errors:', candErrors);
      process.exit(1);
  }
  console.log('[PASS] OSHA Primary candidate created.');

  console.log('--- Testing promotion: Valid Approval ---');
  const promotion = await service.promote({
      candidate,
      reviewerDecision: 'approve',
      reviewerName: 'Safety Mgr',
      reviewerRole: 'compliance_admin',
      reviewerNotes: 'Verified and approved.',
      sourceVerified: true,
      duplicateReviewed: true,
      jurisdictionConfirmed: true
  });
  
  const promErrors = SourceIngestionApprovedUpdateWorkflowValidator.validatePromotion(promotion);
  if (promErrors.length > 0) {
      console.error('[FAIL] Promotion validation errors:', promErrors);
      process.exit(1);
  }
  
  if (promotion.promotionStatus !== 'promoted') {
      console.error('[FAIL] Expected status promoted, got ' + promotion.promotionStatus + '. Reasons: ' + promotion.reasons.join('; '));
      process.exit(1);
  }
  console.log('[PASS] Valid promotion successful.');

  console.log('--- Testing promotion: Missing Duplicate Review ---');
  candidate.duplicateAnalysis.duplicateStatus = 'possible_duplicate';
  const blockedPromotion = await service.promote({
      candidate,
      reviewerDecision: 'approve',
      reviewerName: 'Safety Mgr',
      reviewerRole: 'compliance_admin',
      reviewerNotes: 'Approved but forgot duplicate check.',
      sourceVerified: true,
      duplicateReviewed: false,
      jurisdictionConfirmed: true
  });
  
  if (blockedPromotion.promotionStatus !== 'blocked') {
      console.error('[FAIL] Expected status blocked for missing duplicate review, got ' + blockedPromotion.promotionStatus);
      process.exit(1);
  }
  console.log('[PASS] Promotion blocked correctly for missing duplicate review.');

  console.log('✅ SafeScope source ingestion and approved update workflow validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
