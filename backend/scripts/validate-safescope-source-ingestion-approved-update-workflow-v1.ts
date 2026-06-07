import { SourceIngestionApprovedUpdateWorkflowService } from '../src/safescope-v2/source-ingestion-approved-update-workflow/source-ingestion-approved-update-workflow.service';
import { SourceIngestionApprovedUpdateWorkflowValidator } from '../src/safescope-v2/source-ingestion-approved-update-workflow/source-ingestion-approved-update-workflow.validator';

async function validate() {
  const service = new SourceIngestionApprovedUpdateWorkflowService();
  
  const oshaInput = {
      sourceId: 'src-osha-new',
      agency: 'OSHA',
      jurisdiction: 'osha_general_industry',
      authorityTier: 'primary_regulation',
      citation: '1910.999', // New citation
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
      reviewerRole: 'Admin'
  };

  console.log('--- Testing ingestion: OSHA Primary Regulation ---');
  const candidate = service.ingest(oshaInput);
  const candErrors = SourceIngestionApprovedUpdateWorkflowValidator.validateCandidate(candidate);
  if (candErrors.length > 0) {
      console.error('[FAIL] Candidate validation errors:', candErrors);
      process.exit(1);
  }
  console.log('[PASS] OSHA Primary candidate created.');

  console.log('--- Testing promotion: Valid Approval ---');
  const promotion = service.promote({
      candidate,
      reviewerDecision: 'approve',
      reviewerName: 'Safety Mgr',
      reviewerRole: 'Safety Manager',
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
      console.error(`[FAIL] Expected status promoted, got ${promotion.promotionStatus}. Reasons: ${promotion.reasons.join('; ')}`);
      process.exit(1);
  }
  console.log('[PASS] Valid promotion successful.');

  console.log('--- Testing promotion: Missing Duplicate Review ---');
  // Simulate a candidate with possible duplicate
  candidate.duplicateAnalysis.duplicateStatus = 'possible_duplicate';
  const blockedPromotion = service.promote({
      candidate,
      reviewerDecision: 'approve',
      reviewerName: 'Safety Mgr',
      reviewerRole: 'Safety Manager',
      reviewerNotes: 'Approved but forgot duplicate check.',
      sourceVerified: true,
      duplicateReviewed: false,
      jurisdictionConfirmed: true
  });
  
  if (blockedPromotion.promotionStatus !== 'blocked') {
      console.error(`[FAIL] Expected status blocked for missing duplicate review, got ${blockedPromotion.promotionStatus}`);
      process.exit(1);
  }
  console.log('[PASS] Promotion blocked correctly for missing duplicate review.');

  console.log('✅ SafeScope source ingestion and approved update workflow validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
