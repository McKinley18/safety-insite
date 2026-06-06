import { ApprovedKnowledgeReviewApiService } from '../src/safescope-v2/approved-knowledge-review-api/approved-knowledge-review-api.service';
import { ApprovedKnowledgeRecord } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types';
import { ReviewMetadata } from '../src/safescope-v2/approved-knowledge-review-api/approved-knowledge-review-api.types';

async function validate() {
  const service = new ApprovedKnowledgeReviewApiService();
  
  const draftRecord: ApprovedKnowledgeRecord = {
    recordId: 'rec-1',
    version: '1.0.0',
    status: 'draft_candidate',
    authority: {
        agency: 'OSHA',
        authorityTier: 'primary_regulation',
        jurisdiction: 'osha_general_industry',
        sourceUrl: 'http://osha.gov',
        citation: '1910.147',
        title: 'LOTO',
        effectiveDate: '2026-01-01',
        revisionDate: '2026-01-01',
        sourceDateStatus: 'current'
    },
    mapping: {
        standardFamily: 'loto',
        hazardFamilies: ['energy'],
        mechanisms: ['unexpected_startup'],
        equipmentGroups: ['conveyor'],
        taskContexts: ['maintenance'],
        applicabilitySignals: ['energized'],
        requiredFacts: ['energy_source'],
        disqualifyingFacts: [],
        evidenceQuestions: ['Is energy isolated?']
    },
    applicability: {
        plainLanguageSummary: 'LOTO is required',
        appliesWhen: 'servicing',
        doesNotApplyWhen: 'normal operation',
        requiredReviewerChecks: ['LOTO check']
    },
    correctiveActionLinks: {
        preferredControlFamilies: ['isolation'],
        verificationMethods: ['zero energy check'],
        commonWeakActionsToAvoid: ['simple shutdown']
    },
    governance: {
        supersedesRecordIds: [],
        duplicateKeys: ['loto-1910.147'],
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true
    }
  };
  
  const metadata: ReviewMetadata = {
    approvedBy: 'SafetyMgr',
    approvedAt: '2026-06-06',
    reviewerRole: 'Safety Manager',
    changeReason: 'Standard approval',
    sourceVerified: true,
    applicabilityVerified: true,
    guardrailsVerified: true,
    duplicateReviewCompleted: true
  };
  
  const result = await service.createDecision(draftRecord, metadata, 'approved');
  
  console.log('Testing approval...');
  if (result.decision !== 'approved') {
    console.error('Expected approved decision');
    process.exit(1);
  }
  if (!result.promotionEligible) {
    console.error('Expected promotion eligible');
    process.exit(1);
  }
  
  console.log('Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
